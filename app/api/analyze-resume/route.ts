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

    const { resumeText, targetRole } = await req.json();

    const prompt = `You are an expert resume analyzer and career coach. Analyze the following resume for a ${targetRole} position.

Resume Content:
${resumeText}

Provide detailed analysis including:
1. Strengths (3-5 specific points)
2. Weaknesses (3-5 specific points)
3. Actionable improvements (4-6 recommendations)
4. ATS match score (0-100) for the ${targetRole} role
5. Missing keywords or skills for ${targetRole}

Format your response as JSON with keys: strengths (array), weaknesses (array), improvements (array), matchScore (number), missingKeywords (array).`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const analysis = JSON.parse(completion.choices[0].message.content || "{}");

    return NextResponse.json(analysis);
  } catch (error) {
    console.error("[ANALYZE_RESUME_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
