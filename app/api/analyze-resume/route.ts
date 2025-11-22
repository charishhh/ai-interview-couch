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

    let resumeText = "";
    let targetRole = "";

    // Check if it's FormData or JSON
    const contentType = req.headers.get("content-type");
    
    if (contentType?.includes("multipart/form-data")) {
      // Handle FormData with file upload
      const formData = await req.formData();
      const file = formData.get("resume") as File;
      targetRole = formData.get("jobRole") as string || "Software Engineer";
      
      if (file) {
        resumeText = await file.text();
      }
    } else {
      // Handle JSON request
      const body = await req.json();
      resumeText = body.resumeText || "";
      targetRole = body.targetRole || body.jobRole || "Software Engineer";
    }

    if (!resumeText) {
      return NextResponse.json({
        error: "No resume text provided"
      }, { status: 400 });
    }

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
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const analysis = JSON.parse(completion.choices[0].message.content || "{}");

    return NextResponse.json(analysis);
  } catch (error) {
    console.error("[ANALYZE_RESUME_ERROR]", error);
    return NextResponse.json({
      error: "Failed to analyze resume",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
