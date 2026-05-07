// POST /api/tools/shoe-game
//
// Generates 3 couple-specific Shoe Game questions from a free-text relationship
// detail. Public (no auth) — session-only tool. Returns the static fallback if
// the API key is missing or the call fails so the front-end is never blocked.

import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/api/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 30;

const MODEL = "claude-sonnet-4-20250514";
const MAX_TOKENS = 1000;

interface RequestBody {
  detail?: string;
}

interface ResponseBody {
  ok: boolean;
  questions: string[];
}

const SYSTEM_PROMPT =
  "Generate 3 playful Shoe Game questions for an Indian-American wedding couple. Questions should be warm, funny, and culturally aware. Format: return ONLY a JSON array of 3 strings. No preamble, no explanation.";

interface AnthropicTextBlock {
  type: "text";
  text: string;
}

interface MessagesCreateResponse {
  content: Array<AnthropicTextBlock | { type: string; [key: string]: unknown }>;
}

interface AnthropicClient {
  messages: {
    create: (args: unknown) => Promise<MessagesCreateResponse>;
  };
}

async function loadAnthropic(apiKey: string): Promise<AnthropicClient | null> {
  try {
    const mod = (await import("@anthropic-ai/sdk")) as {
      default: new (opts: { apiKey: string }) => AnthropicClient;
    };
    return new mod.default({ apiKey });
  } catch {
    return null;
  }
}

function tryParseQuestions(text: string): string[] | null {
  // Strip code fences and stray prose around the JSON array.
  const stripped = text.replace(/```(?:json)?/gi, "").trim();
  const start = stripped.indexOf("[");
  const end = stripped.lastIndexOf("]");
  if (start === -1 || end === -1 || end <= start) return null;
  try {
    const parsed = JSON.parse(stripped.slice(start, end + 1));
    if (!Array.isArray(parsed)) return null;
    const cleaned = parsed
      .filter((q): q is string => typeof q === "string")
      .map((q) => q.trim())
      .filter((q) => q.length > 0)
      .slice(0, 3);
    return cleaned.length === 3 ? cleaned : null;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rl = await checkRateLimit(`ai:${ip}`, { windowMs: 60_000, max: 10 });
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment." },
      { status: 429, headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } },
    );
  }
  let body: RequestBody;
  try {
    body = (await req.json()) as RequestBody;
  } catch {
    return NextResponse.json<ResponseBody>(
      { ok: false, questions: [] },
      { status: 400 },
    );
  }

  const detail = (body.detail ?? "").trim();
  if (detail.length === 0 || detail.length > 500) {
    return NextResponse.json<ResponseBody>(
      { ok: false, questions: [] },
      { status: 400 },
    );
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json<ResponseBody>({ ok: false, questions: [] });
  }

  const client = await loadAnthropic(apiKey);
  if (!client) {
    return NextResponse.json<ResponseBody>({ ok: false, questions: [] });
  }

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: `Context about them: ${detail}` }],
    });
    const textBlock = response.content.find(
      (b): b is AnthropicTextBlock => b.type === "text",
    );
    if (!textBlock) {
      return NextResponse.json<ResponseBody>({ ok: false, questions: [] });
    }
    const questions = tryParseQuestions(textBlock.text);
    if (!questions) {
      return NextResponse.json<ResponseBody>({ ok: false, questions: [] });
    }
    return NextResponse.json<ResponseBody>({ ok: true, questions });
  } catch {
    return NextResponse.json<ResponseBody>({ ok: false, questions: [] });
  }
}
