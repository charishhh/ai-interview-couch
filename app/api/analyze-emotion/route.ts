import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { image, timestamp } = body;

    if (!image) {
      return NextResponse.json(
        { error: "Image data is required" },
        { status: 400 }
      );
    }

    // Call Python backend emotion detection service
    const backendUrl = process.env.BACKEND_URL || "http://localhost:8000";
    const response = await fetch(`${backendUrl}/api/emotion/analyze`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        image,
        timestamp,
      }),
    });

    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error analyzing emotion:", error);
    return NextResponse.json(
      {
        success: false,
        faces: [],
        message: error instanceof Error ? error.message : "Failed to analyze emotion",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Emotion analysis endpoint. Send POST with base64 image.",
    endpoint: "/api/analyze-emotion",
    method: "POST",
    body: {
      image: "base64_encoded_image_string",
      timestamp: "optional_timestamp_in_seconds",
    },
  });
}
