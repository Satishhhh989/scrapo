// app/api/generate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { GeneratePoemRequest, GeneratePoemResponse, MOODS } from "@/lib/types";

/**
 * API Route to securely call OpenRouter
 * Hides the API key from client-side code
 */
export async function POST(req: NextRequest) {
  try {
    const body: GeneratePoemRequest = await req.json();
    const { prompt, mood, penName, conversationHistory = [] } = body;

    // Validate input
    if (!prompt || !prompt.trim()) {
      return NextResponse.json(
        { success: false, error: "Prompt is required" },
        { status: 400 }
      );
    }

    // Get API key from environment
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      console.error("OPENROUTER_API_KEY is not set in environment variables");
      return NextResponse.json(
        { success: false, error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Build system prompt (same as original)
    const systemPrompt = `You are a poetic AI assistant with the melancholic, nostalgic style of Lana Del Rey. 
Respond in a dreamy, cinematic way with references to Americana, vintage culture, and romantic melancholy. 
Use markdown for formatting when needed. Include occasional song lyrics or poetic verses in your responses. 
Keep responses under 300 words. ${penName ? `Address the user as "${penName}".` : ""}
${MOODS[mood] || MOODS.melancholic}`;

    // Prepare messages for API
    const messages = [
      { role: "system", content: systemPrompt },
      ...conversationHistory.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      { role: "user", content: prompt },
    ];

    // Call OpenRouter API (using the same model as original)
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "https://scrapo.ai",
        "X-Title": "SCRAPO - AI Poetry Generator",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-chat",
        messages,
        temperature: 0.8,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("OpenRouter API Error:", errorData);
      return NextResponse.json(
        {
          success: false,
          error: `API request failed: ${response.status} ${response.statusText}`,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json(
        { success: false, error: "No content returned from API" },
        { status: 500 }
      );
    }

    const result: GeneratePoemResponse = {
      success: true,
      content,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("API Route Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}