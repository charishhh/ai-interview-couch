import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const userId = user.id;

    const { question, answer, interviewType } = await req.json();

    const prompt = `You are an expert interview coach analyzing a candidate's response. 
    
Interview Type: ${interviewType}
Question: ${question}
Candidate's Answer: ${answer}

Provide detailed feedback including:
1. Overall score (0-100)
2. Specific strengths (2-3 points)
3. Areas for improvement (2-3 points)
4. Fluency score (0-100)
5. Confidence score (0-100)
6. Content quality score (0-100)
7. Clarity score (0-100)
8. Count of filler words (um, uh, like, etc.)

Format your response as JSON.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const feedback = JSON.parse(completion.choices[0].message.content || "{}");
    
    // Ensure the response has all required fields with defaults
    const response = {
      overallScore: feedback.overallScore || feedback.overall_score || 75,
      strengths: feedback.strengths || ["Good answer structure", "Relevant content"],
      improvements: feedback.improvements || feedback.areas_for_improvement || ["Could provide more specific examples"],
      fluencyScore: feedback.fluencyScore || feedback.fluency_score || 80,
      confidenceScore: feedback.confidenceScore || feedback.confidence_score || 75,
      contentQuality: feedback.contentQuality || feedback.content_quality_score || 80,
      clarityScore: feedback.clarityScore || feedback.clarity_score || 85,
      fillerWordCount: feedback.fillerWordCount || feedback.filler_word_count || 0,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("[ANALYZE_ANSWER_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
