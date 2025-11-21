import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const questionsByType: Record<string, string[]> = {
  technical: [
    "Explain the difference between let, const, and var in JavaScript.",
    "What is the time complexity of binary search?",
    "Describe how you would implement a queue using two stacks.",
    "What are React hooks and why are they useful?",
    "Explain the concept of closure in JavaScript.",
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

    const prompt = `Generate ${count} personalized ${interviewType} interview questions for a ${targetRole} candidate.

${resumeText ? `Based on this resume/experience:\n${resumeText.substring(0, 2000)}` : ''}

Generate questions that:
1. Are highly relevant to the candidate's experience and the ${targetRole} position
2. Match the ${interviewType} interview style
3. Reference specific skills, projects, or technologies from their resume
4. Are challenging but fair and appropriate for their level
5. Cover various aspects of the role and their background

Return your response as a JSON object with a "questions" array containing exactly ${count} question strings.
Example format: {"questions": ["Question 1?", "Question 2?", "Question 3?", ...]}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.8,
    });

    const response = JSON.parse(completion.choices[0].message.content || '{"questions":[]}');
    
    // Ensure questions array exists and has content
    if (!response.questions || !Array.isArray(response.questions) || response.questions.length === 0) {
      // Fallback to default questions if AI fails
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
