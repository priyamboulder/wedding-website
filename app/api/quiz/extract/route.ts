// ── Quiz free-text extraction ─────────────────────────────────────────────
// Takes an open-text answer + a target-shape description, asks Claude Haiku
// 4.5 to return strict JSON matching that shape, and sends it back. On any
// failure (missing API key, invalid JSON, network error) we respond with
// `{ extracted: null }` so the caller can fall back to saving the raw text.
//
// The route is deliberately generic — the caller owns the shape. Schemas
// in lib/quiz/schemas/*.ts send a short description of the shape they
// want and validate the result in their preview() / apply().
//
// Calls the Anthropic Messages API over fetch rather than the SDK so the
// route has no runtime dependencies.

import { NextResponse } from "next/server";

const MODEL = "claude-haiku-4-5-20251001";
const MAX_TOKENS = 512;
const ANTHROPIC_VERSION = "2023-06-01";
const ENDPOINT = "https://api.anthropic.com/v1/messages";

interface ExtractRequest {
  questionPrompt: string;
  answer: string;
  targetShape: string;
  example?: unknown;
}

interface ExtractResponse {
  extracted: unknown | null;
  reason?: string;
}

interface AnthropicContentBlock {
  type: string;
  text?: string;
}

interface AnthropicMessageResponse {
  content?: AnthropicContentBlock[];
}

export async function POST(request: Request) {
  let body: ExtractRequest;
  try {
    body = (await request.json()) as ExtractRequest;
  } catch {
    return NextResponse.json(
      { extracted: null, reason: "bad_request" } satisfies ExtractResponse,
      { status: 400 },
    );
  }

  const answer = (body.answer ?? "").trim();
  if (!answer) {
    return NextResponse.json({
      extracted: null,
      reason: "empty_answer",
    } satisfies ExtractResponse);
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    // Graceful fallback: caller will save the raw text.
    return NextResponse.json({
      extracted: null,
      reason: "no_api_key",
    } satisfies ExtractResponse);
  }

  const system = buildSystemPrompt(body.targetShape, body.example);
  const user = buildUserPrompt(body.questionPrompt, answer);

  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": ANTHROPIC_VERSION,
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system,
        messages: [{ role: "user", content: user }],
      }),
    });

    if (!res.ok) {
      console.error("[quiz/extract] api", res.status, await res.text());
      return NextResponse.json({
        extracted: null,
        reason: "api_error",
      } satisfies ExtractResponse);
    }

    const data = (await res.json()) as AnthropicMessageResponse;
    const text = (data.content ?? [])
      .filter((block) => block.type === "text" && typeof block.text === "string")
      .map((block) => block.text ?? "")
      .join("")
      .trim();

    const parsed = safeJsonParse(text);
    if (parsed === undefined) {
      return NextResponse.json({
        extracted: null,
        reason: "invalid_json",
      } satisfies ExtractResponse);
    }

    return NextResponse.json({
      extracted: parsed,
    } satisfies ExtractResponse);
  } catch (err) {
    console.error("[quiz/extract]", err);
    return NextResponse.json({
      extracted: null,
      reason: "api_error",
    } satisfies ExtractResponse);
  }
}

function buildSystemPrompt(targetShape: string, example?: unknown): string {
  const exampleBlock =
    example !== undefined
      ? `\n\nExample response:\n${JSON.stringify(example, null, 2)}`
      : "";
  return `You extract structured data from a wedding-planning user's free-text answer.

Return ONLY a JSON object (no markdown fences, no prose) matching this shape:
${targetShape}

If the user's answer is too vague to extract, return an empty object \`{}\`.${exampleBlock}`;
}

function buildUserPrompt(questionPrompt: string, answer: string): string {
  return `Question: ${questionPrompt}

Answer: ${answer}

Return the JSON now.`;
}

function safeJsonParse(text: string): unknown | undefined {
  // Strip fences if the model ignored the instruction and wrapped in markdown.
  const trimmed = text
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    // Try to pull the first {...} block out of the response.
    const match = trimmed.match(/\{[\s\S]*\}/);
    if (!match) return undefined;
    try {
      return JSON.parse(match[0]);
    } catch {
      return undefined;
    }
  }
}
