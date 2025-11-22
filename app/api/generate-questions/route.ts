import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const questionsByType: Record<string, string[]> = {
  technical: [
    "Walk me through a challenging technical problem you solved in one of your recent projects. What was your approach?",
    "Describe the architecture of the most complex system you've built. What were the key design decisions and trade-offs?",
    "Tell me about a time when you had to optimize code or improve system performance. What metrics did you improve?",
    "Explain how you would debug a production issue in one of the technologies you've worked with. What's your process?",
    "Describe a situation where you had to learn a new technology quickly for a project. How did you approach it?",
  ],
  behavioral: [
    "Tell me about a time when you faced a challenging problem at work.",
    "Describe a situation where you had to work with a difficult team member.",
    "How do you handle tight deadlines and pressure?",
    "Tell me about a time you failed and what you learned from it.",
    "Describe your leadership style with an example.",
  ],
  hr: [
    "Why do you want to work for our company?",
    "Where do you see yourself in 5 years?",
    "What are your salary expectations?",
    "Why should we hire you?",
    "What are your greatest strengths and weaknesses?",
  ],
  communication: [
    "Introduce yourself and your background.",
    "Explain a complex technical concept to a non-technical person.",
    "Describe your most significant achievement.",
    "Walk me through your resume.",
    "What motivates you in your career?",
  ],
  custom: [
    "Tell me about yourself.",
    "What are your career goals?",
    "Why are you interested in this position?",
    "What is your approach to problem-solving?",
    "How do you handle constructive criticism?",
  ],
};

export async function GET(req: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const userId = user.id;

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "technical";

    const questionTexts = questionsByType[type] || questionsByType.technical;
    
    // Format questions with id and text properties
    const questions = questionTexts.map((text, index) => ({
      id: index + 1,
      text: text,
      type: type,
    }));

    return NextResponse.json({ questions });
  } catch (error) {
    console.error("[GENERATE_QUESTIONS_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const userId = user.id;

    const { resumeText, targetRole, interviewType, count = 5 } = await req.json();

    // Enhanced prompt for technical interviews with resume context
    let prompt = `Generate ${count} personalized ${interviewType} interview questions for a ${targetRole} candidate.

${resumeText ? `Based on this resume/experience:\n${resumeText.substring(0, 2000)}` : ''}

`;

    if (interviewType === "technical") {
      prompt += `For TECHNICAL interviews, generate questions that:
1. Focus on specific technologies, frameworks, and tools mentioned in the resume
2. Ask about real-world implementation details from their projects
3. Include coding problems, system design, or algorithm questions relevant to their experience level
4. Reference specific technical achievements or projects they've listed
5. Test depth of knowledge in their claimed skills (e.g., "Explain how you implemented [specific feature] in your [project name]")
6. Include questions about best practices, optimization, and trade-offs
7. Ask about debugging scenarios or performance issues they may have faced

Example types of questions to generate:
- "I see you worked on [specific project]. Can you explain the architecture and why you chose [technology]?"
- "You mentioned [skill/technology]. How would you use it to solve [specific problem]?"
- "Walk me through how you would debug [scenario related to their experience]"
- "Explain the trade-offs between [technologies they've used]"
- Code challenges based on problems they likely solved in their listed projects

`;
    } else {
      prompt += `Generate questions that:
1. Are highly relevant to the candidate's experience and the ${targetRole} position
2. Match the ${interviewType} interview style
3. Reference specific skills, projects, or experiences from their resume
4. Are challenging but fair and appropriate for their level
5. Cover various aspects of the role and their background

`;
    }

    prompt += `Return your response as a JSON object with a "questions" array containing exactly ${count} question strings.
Example format: {"questions": ["Question 1?", "Question 2?", "Question 3?", ...]}`;

    let response;

    // Try OpenAI first
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.8,
      });

      response = JSON.parse(completion.choices[0].message.content || '{"questions":[]}');
      console.log("[GENERATE_QUESTIONS] Successfully used OpenAI");
    } catch (openaiError: any) {
      // If OpenAI fails, try Gemini AI
      console.log("[GENERATE_QUESTIONS] OpenAI failed, trying Gemini AI:", openaiError.message);
      
      try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        
        const geminiPrompt = `${prompt}\n\nIMPORTANT: Respond ONLY with valid JSON. No markdown, no code blocks, no additional text.`;
        
        const result = await model.generateContent(geminiPrompt);
        const geminiResponse = await result.response;
        const text = geminiResponse.text();
        
        // Clean the response - remove markdown code blocks if present
        const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        response = JSON.parse(cleanText);
        
        console.log("[GENERATE_QUESTIONS] Successfully used Gemini AI as backup");
      } catch (geminiError: any) {
        console.log("[GENERATE_QUESTIONS] Both APIs failed:", geminiError.message);
        // Will use fallback questions below
        response = null;
      }
    }
    
    // Ensure questions array exists and has content
    if (!response || !response.questions || !Array.isArray(response.questions) || response.questions.length === 0) {
      // Fallback to default questions if both APIs fail
      const defaultQuestions = questionsByType[interviewType] || questionsByType.technical;
      return NextResponse.json({ 
        questions: defaultQuestions.map((text, index) => ({
          id: index + 1,
          text: text,
          type: interviewType,
        }))
      });
    }

    // Format questions properly
    const formattedQuestions = response.questions.slice(0, count).map((q: string, index: number) => ({
      id: index + 1,
      text: q,
      type: interviewType,
    }));

    return NextResponse.json({ questions: formattedQuestions });
  } catch (error) {
    console.error("[GENERATE_QUESTIONS_ERROR]", error);
    
    // Return default questions on error
    const type = "technical";
    const defaultQuestions = questionsByType[type];
    return NextResponse.json({ 
      questions: defaultQuestions.map((text, index) => ({
        id: index + 1,
        text: text,
        type: type,
      }))
    });
  }
}
