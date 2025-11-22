import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Multiple question sets for variety - randomly selected
const technicalQuestionSets = [
  [
    "Walk me through a challenging technical problem you solved in one of your recent projects. What was your approach and what would you do differently?",
    "Describe the architecture of the most complex system you've built. What were the key design decisions and trade-offs?",
    "Tell me about a time when you had to optimize code or improve system performance. What metrics did you improve and how?",
    "Explain how you would debug a production issue in one of the technologies you've worked with. What's your systematic process?",
    "Describe a situation where you had to learn a new technology quickly for a project. What resources did you use and how long did it take?",
  ],
  [
    "Tell me about a significant refactoring you did. What was the technical debt and how did you address it?",
    "Describe how you've implemented testing in your projects. What's your approach to test coverage and quality?",
    "Walk me through a time you had to make a difficult technical decision with limited information. What was your reasoning?",
    "Explain a situation where you had to balance technical excellence with business deadlines. How did you handle it?",
    "Describe the most complex bug you've ever debugged. What tools and techniques did you use?",
  ],
  [
    "Tell me about a project where you had to integrate multiple systems or APIs. What challenges did you face?",
    "Describe your experience with code reviews. What do you look for when reviewing others' code?",
    "Walk me through how you would design a system that needs to scale from 1000 to 1 million users.",
    "Explain a time when you had to work with legacy code. What strategies did you use to understand and improve it?",
    "Tell me about your experience with CI/CD. How have you improved deployment processes in your projects?",
  ],
  [
    "Describe a time when you had to choose between different architectural patterns. What influenced your decision?",
    "Tell me about a performance bottleneck you identified and resolved. What tools did you use for profiling?",
    "Walk me through how you approach writing clean, maintainable code. What principles guide your decisions?",
    "Explain a situation where you had to educate your team about a new technology or best practice.",
    "Describe the most interesting algorithm or data structure you've implemented. Why was it the right choice?",
  ]
];

const behavioralQuestionSets = [
  [
    "Tell me about a time when you faced a challenging problem at work that required creative thinking.",
    "Describe a situation where you had to work with a difficult team member. How did you handle it?",
    "How do you handle tight deadlines and pressure? Give me a specific example.",
    "Tell me about a time you failed and what you learned from it.",
    "Describe your leadership style with a concrete example from your experience.",
  ],
  [
    "Tell me about a time you had to convince stakeholders to change direction on a project.",
    "Describe a conflict you had with a team member and how you resolved it.",
    "How do you prioritize tasks when everything seems urgent? Walk me through a specific situation.",
    "Tell me about a time you went above and beyond your job responsibilities.",
    "Describe a situation where you had to deliver bad news to your team or management.",
  ],
  [
    "Tell me about a time you had to take ownership of a project that was failing.",
    "Describe how you've mentored or helped a junior team member grow.",
    "What's the most difficult feedback you've received and how did you respond?",
    "Tell me about a time you had to adapt to a major change at work.",
    "Describe a situation where you had to make a decision without complete information.",
  ]
];

const hrQuestionSets = [
  [
    "Why do you want to work for our company? What attracted you to this role?",
    "Where do you see yourself in 5 years? What are your career aspirations?",
    "What are your salary expectations and how did you arrive at that range?",
    "Why should we hire you? What unique value would you bring to this role?",
    "What are your greatest strengths and weaknesses? How are you working on improvement?",
  ],
  [
    "What motivates you to do your best work? What kind of environment brings out your strengths?",
    "Tell me about your ideal work environment and company culture.",
    "How do you prefer to receive feedback and how often?",
    "What are your expectations for work-life balance?",
    "What would make you accept one job offer over another?",
  ]
];

const communicationQuestionSets = [
  [
    "Introduce yourself and walk me through your career journey.",
    "Explain a complex technical concept from your work to a non-technical person.",
    "Describe your most significant achievement and why it matters to you.",
    "Walk me through your resume, highlighting key experiences that prepared you for this role.",
    "What motivates you in your career? What gets you excited about coming to work?",
  ],
  [
    "How do you ensure clear communication when working with cross-functional teams?",
    "Describe a time when you had to present a technical solution to stakeholders.",
    "Tell me about a situation where miscommunication caused problems. What did you learn?",
    "How do you document your work? Walk me through your approach.",
    "Describe how you've used written communication to drive project success.",
  ]
];

// Helper to get random question set
function getRandomQuestionSet(sets: string[][]): string[] {
  const randomIndex = Math.floor(Math.random() * sets.length);
  return sets[randomIndex];
}

const questionsByType: Record<string, string[]> = {
  technical: getRandomQuestionSet(technicalQuestionSets),
  behavioral: getRandomQuestionSet(behavioralQuestionSets),
  hr: getRandomQuestionSet(hrQuestionSets),
  communication: getRandomQuestionSet(communicationQuestionSets),
  custom: [
    "Tell me about yourself and what drives you professionally.",
    "What are your career goals for the next 2-3 years?",
    "Why are you interested in this position specifically?",
    "What is your approach to problem-solving? Walk me through an example.",
    "How do you handle constructive criticism and use it for growth?",
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

    // Get fresh random question set for each request
    let questionTexts: string[];
    
    if (type === "technical") {
      questionTexts = getRandomQuestionSet(technicalQuestionSets);
    } else if (type === "behavioral") {
      questionTexts = getRandomQuestionSet(behavioralQuestionSets);
    } else if (type === "hr") {
      questionTexts = getRandomQuestionSet(hrQuestionSets);
    } else if (type === "communication") {
      questionTexts = getRandomQuestionSet(communicationQuestionSets);
    } else {
      questionTexts = questionsByType.custom;
    }
    
    // Format questions with id and text properties
    const questions = questionTexts.map((text, index) => ({
      id: index + 1,
      text: text,
      type: type,
    }));

    console.log(`[GENERATE_QUESTIONS] GET - Generated ${questions.length} ${type} questions (random set)`);

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

    // Add timestamp and random seed for uniqueness
    const timestamp = new Date().toISOString();
    const randomSeed = Math.floor(Math.random() * 10000);
    
    // Different focus areas to rotate through for variety
    const focusAreas = [
      "system design and architecture decisions",
      "coding practices and implementation details", 
      "debugging and problem-solving approaches",
      "performance optimization and scalability",
      "testing strategies and code quality",
      "collaboration and technical communication",
      "design patterns and best practices"
    ];
    
    const randomFocus = focusAreas[randomSeed % focusAreas.length];

    // Enhanced prompt for technical interviews with resume context
    let prompt = `You are an expert technical interviewer conducting a UNIQUE interview session (ID: ${randomSeed}, Time: ${timestamp}).

CRITICAL: Generate ${count} COMPLETELY NEW and UNIQUE ${interviewType} interview questions for a ${targetRole} candidate. 
DO NOT repeat common interview questions. Make each question specific, detailed, and personalized.

Focus this interview session on: ${randomFocus}

${resumeText ? `Based on this candidate's resume/experience:\n${resumeText.substring(0, 2000)}` : ''}

`;

    if (interviewType === "technical") {
      prompt += `For TECHNICAL interviews, generate DIVERSE questions that:

1. **Dive deep into SPECIFIC projects/technologies** from their resume (mention exact project names, technologies)
2. **Ask about implementation details** - "How did you implement X in project Y?"
3. **Present real-world scenarios** - "If you encountered [specific problem] in production, how would you..."
4. **Explore design decisions** - "Why did you choose X over Y for [specific feature]?"
5. **Test problem-solving** - Give them a unique coding or system design challenge related to their experience
6. **Question trade-offs** - "What are the pros/cons of [their technical choice]?"
7. **Probe edge cases** - "How does your solution handle [specific edge case]?"

VARIETY REQUIREMENTS:
- Mix question types: architectural, coding, debugging, optimization, testing
- Reference DIFFERENT projects/technologies from their resume in each question
- Vary difficulty levels (some straightforward, some challenging)
- Include both theoretical knowledge AND practical experience questions
- Ask about recent trends/updates in technologies they've used

Generate questions that show you've READ their resume carefully. Use their actual project names, technologies, and experiences.

EXAMPLE FORMAT (but create NEW questions):
- "In your [specific project name], you used [technology]. Walk me through a challenging bug you faced and how you debugged it."
- "You have experience with [tech stack]. Design a [specific system] that handles [specific requirement]. How would you ensure [specific quality attribute]?"
- "Looking at your [project], how would you refactor [specific component] to improve [specific metric]?"

`;
    } else if (interviewType === "behavioral") {
      prompt += `For BEHAVIORAL interviews, generate SPECIFIC situational questions:

1. Reference their ACTUAL work experience and projects
2. Ask about SPECIFIC challenges they likely faced in their roles
3. Explore leadership, teamwork, and communication in REAL scenarios
4. Question decision-making with concrete examples
5. Probe conflict resolution, time management, and adaptability

Make questions specific to their experience level and role.

`;
    } else if (interviewType === "hr") {
      prompt += `For HR interviews, generate personalized questions about:

1. Career motivation specific to ${targetRole}
2. Company culture fit based on their background
3. Salary and compensation expectations for their level
4. Work-life balance and remote work preferences
5. Long-term career goals aligned with their trajectory

`;
    } else if (interviewType === "communication") {
      prompt += `For COMMUNICATION interviews:

1. Ask them to explain SPECIFIC technical concepts from their resume to non-technical people
2. Test presentation skills about their actual projects
3. Evaluate written and verbal communication
4. Assess stakeholder management abilities
5. Question how they document and share knowledge

`;
    } else {
      prompt += `Generate UNIQUE questions that:
1. Are highly relevant to the candidate's experience and the ${targetRole} position
2. Match the ${interviewType} interview style
3. Reference SPECIFIC skills, projects, or experiences from their resume
4. Are challenging but fair and appropriate for their level
5. Cover DIFFERENT aspects of the role and their background

`;
    }

    prompt += `
IMPORTANT UNIQUENESS REQUIREMENTS:
- Each question must be SUBSTANTIALLY DIFFERENT from typical interview questions
- Reference ACTUAL details from the resume (project names, technologies, companies)
- Make questions feel like they're from someone who carefully read the resume
- Vary the complexity and format of questions
- Mix conceptual and practical questions
- Include follow-up scenarios or "what if" situations

Return your response as a JSON object with a "questions" array containing exactly ${count} UNIQUE question strings.
Example format: {"questions": ["Detailed question 1 about [specific resume item]?", "Unique question 2 about [different resume item]?", ...]}`;

    let response;

    // Try OpenAI first with higher temperature for more variety
    try {
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
      
      const completion = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.9, // Increased for more variety
        top_p: 0.95, // Added for more diversity
      });

      response = JSON.parse(completion.choices[0].message.content || '{"questions":[]}');
      console.log("[GENERATE_QUESTIONS] Successfully used OpenAI with session ID:", randomSeed);
    } catch (openaiError: any) {
      // If OpenAI fails, try Gemini AI
      console.log("[GENERATE_QUESTIONS] OpenAI failed, trying Gemini AI:", openaiError.message);
      
      try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
        const model = genAI.getGenerativeModel({ 
          model: "gemini-pro",
          generationConfig: {
            temperature: 0.9, // Higher temperature for variety
            topP: 0.95,
            topK: 40,
          }
        });
        
        const geminiPrompt = `${prompt}\n\nIMPORTANT: Respond ONLY with valid JSON. No markdown, no code blocks, no additional text.`;
        
        const result = await model.generateContent(geminiPrompt);
        const geminiResponse = await result.response;
        const text = geminiResponse.text();
        
        // Clean the response - remove markdown code blocks if present
        const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        response = JSON.parse(cleanText);
        
        console.log("[GENERATE_QUESTIONS] Successfully used Gemini AI with session ID:", randomSeed);
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
