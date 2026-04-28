import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import type { AIAssistRequest, AIAssistResponse } from "@/types/popout-infrastructure";

const anthropic = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

export async function POST(request: Request) {
  try {
    const body: AIAssistRequest = await request.json();

    if (!body.prompt?.trim()) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    if (!anthropic) {
      return NextResponse.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 503 });
    }

    const systemPrompt = body.context?.trim()
      ? body.context
      : "You are a thoughtful wedding planning assistant specialising in Indian luxury weddings. Give specific, actionable, elegant advice. Be concise — 2–4 sentences unless the user asks for more detail.";

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 512,
      system: systemPrompt,
      messages: [{ role: "user", content: body.prompt }],
    });

    const content = message.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n");

    const response: AIAssistResponse = {
      content,
      generated_at: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (e) {
    console.error("AI assist error:", e);
    return NextResponse.json({ error: "AI generation failed" }, { status: 500 });
  }
}
