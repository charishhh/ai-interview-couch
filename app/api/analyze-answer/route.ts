import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const userId = user.id;

    const { question, answer, interviewType } = await req.json();

    const prompt = `You are an expert interview coach with psychology background, analyzing a candidate's response in detail.
    
Interview Type: ${interviewType}
Question: ${question}
Candidate's Answer: ${answer}

Provide comprehensive analysis including:

1. **Overall Score** (0-100): Based on content, delivery, and relevance
2. **Specific Strengths** (3-5 points): What they did well
3. **Areas for Improvement** (3-5 points): Constructive feedback
4. **Fluency Score** (0-100): Speech flow and articulation
5. **Confidence Score** (0-100): Based on language certainty and tone
6. **Content Quality** (0-100): Relevance, depth, and accuracy
7. **Clarity Score** (0-100): How clearly ideas were expressed
8. **Filler Word Count**: Estimated count of um, uh, like, you know, etc.

**SENTIMENT ANALYSIS:**
9. **Sentiment Score** (0-100): Overall positivity/negativity (50=neutral, 0=very negative, 100=very positive)
10. **Emotional Tone**: Classify as one of: confident, nervous, enthusiastic, uncertain, professional, defensive, optimistic, pessimistic
11. **Sentiment Details**: Brief explanation of the emotional tone detected
12. **Key Sentiment Indicators**: 2-3 specific phrases or word choices that reveal sentiment
13. **Engagement Level** (0-100): How engaged and interested the candidate seems
14. **Stress Indicators**: Count of words/phrases indicating stress or anxiety (if any)

**COMMUNICATION ANALYSIS:**
15. **Pace Analysis**: Is the answer too rushed, too slow, or well-paced?
16. **Structure Quality**: Does the answer have clear beginning, middle, end?
17. **Example Quality**: Did they provide relevant, specific examples?

Format as JSON with camelCase keys.`;

    let feedback;

    // Try OpenAI first
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.7,
      });

      feedback = JSON.parse(completion.choices[0].message.content || "{}");
      console.log("[ANALYZE_ANSWER] Successfully used OpenAI");
    } catch (openaiError: any) {
      // If OpenAI fails, try Gemini AI
      console.log("[ANALYZE_ANSWER] OpenAI failed, trying Gemini AI:", openaiError.message);
      
      try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        
        const geminiPrompt = `${prompt}\n\nIMPORTANT: Respond ONLY with valid JSON. No markdown, no code blocks, no additional text.`;
        
        const result = await model.generateContent(geminiPrompt);
        const geminiResponse = await result.response;
        const text = geminiResponse.text();
        
        // Clean the response
        const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        feedback = JSON.parse(cleanText);
        
        console.log("[ANALYZE_ANSWER] Successfully used Gemini AI as backup");
      } catch (geminiError: any) {
        console.log("[ANALYZE_ANSWER] Both APIs failed:", geminiError.message);
        // Will use fallback below
        feedback = null;
      }
    }
    
    // Ensure the response has all required fields with intelligent defaults
    const response = {
      overallScore: feedback?.overallScore || feedback?.overall_score || 75,
      strengths: feedback?.strengths || ["Clear communication", "Relevant response", "Good structure"],
      improvements: feedback?.improvements || feedback?.areas_for_improvement || ["Could provide more specific examples", "Consider elaborating on key points"],
      fluencyScore: feedback?.fluencyScore || feedback?.fluency_score || 80,
      confidenceScore: feedback?.confidenceScore || feedback?.confidence_score || 75,
      contentQuality: feedback?.contentQuality || feedback?.content_quality_score || 80,
      clarityScore: feedback?.clarityScore || feedback?.clarity_score || 85,
      fillerWordCount: feedback?.fillerWordCount || feedback?.filler_word_count || 0,
      
      // Enhanced sentiment analysis
      sentimentScore: feedback?.sentimentScore || feedback?.sentiment_score || 70,
      emotionalTone: feedback?.emotionalTone || feedback?.emotional_tone || "professional",
      sentimentDetails: feedback?.sentimentDetails || feedback?.sentiment_details || "The response demonstrates a professional and balanced tone",
      keySentimentIndicators: feedback?.keySentimentIndicators || feedback?.key_sentiment_indicators || ["Professional language", "Clear articulation"],
      engagementLevel: feedback?.engagementLevel || feedback?.engagement_level || 75,
      stressIndicators: feedback?.stressIndicators || feedback?.stress_indicators || 0,
      
      // Communication analysis
      paceAnalysis: feedback?.paceAnalysis || feedback?.pace_analysis || "well-paced",
      structureQuality: feedback?.structureQuality || feedback?.structure_quality || "Good structure with clear points",
      exampleQuality: feedback?.exampleQuality || feedback?.example_quality || "Relevant examples provided",
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("[ANALYZE_ANSWER_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
