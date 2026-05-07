// POST /api/tools/mehndi-phrases
//
// Generates 5 short phrases to hide inside the bride's mehendi design.
// Public, session-only. Only called when the user supplies a personal
// detail — otherwise the front-end serves a static fallback list.

import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/api/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 30;

const MODEL = "claude-sonnet-4-20250514";
const MAX_TOKENS = 1000;

interface RequestInput {
  groomName?: string;
  tone?: string;
  language?: string;
  detail?: string;
}

interface RequestBody {
  input?: RequestInput;
}

interface Phrase {
  phrase: string;
  transliteration: string;
  language: string;
  tone: "sweet" | "cheeky" | "classic";
  usageNote: string;
}

interface ResponseBody {
  ok: boolean;
  phrases: Phrase[];
}

const SYSTEM_PROMPT =
  'You generate short phrases for an Indian bride to hide inside her mehendi (henna) design — replacing the traditional "groom\'s name." Each phrase must be SHORT (2 to 5 words MAX) so it fits inside the design. Return EXACTLY 5 phrases as a JSON array. Each item: { "phrase": "the phrase as written", "transliteration": "(only if non-English; otherwise empty string)", "language": "English" | "Hindi" | "Hindi+English" | "Urdu" | "Urdu+English", "tone": "sweet" | "cheeky" | "classic", "usageNote": "one sentence on when/why this works" }. Mix tones across the five if user asked for "Mix of both." Be culturally aware. Return ONLY the JSON array, no preamble.';

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

function clean(s: unknown, max = 140): string {
  return typeof s === "string" ? s.trim().slice(0, max) : "";
}

function tryParsePhrases(text: string): Phrase[] | null {
  const stripped = text.replace(/```(?:json)?/gi, "").trim();
  const start = stripped.indexOf("[");
  const end = stripped.lastIndexOf("]");
  if (start === -1 || end === -1 || end <= start) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(stripped.slice(start, end + 1));
  } catch {
    return null;
  }
  if (!Array.isArray(parsed)) return null;

  const out: Phrase[] = [];
  for (const raw of parsed) {
    if (!raw || typeof raw !== "object") continue;
    const r = raw as {
      phrase?: unknown;
      transliteration?: unknown;
      language?: unknown;
      tone?: unknown;
      usageNote?: unknown;
    };
    const phrase = clean(r.phrase, 80);
    if (!phrase) continue;
    const transliteration = clean(r.transliteration, 80);
    const language = clean(r.language, 30) || "English";
    const tone =
      r.tone === "sweet" || r.tone === "cheeky" || r.tone === "classic"
        ? r.tone
        : "sweet";
    const usageNote = clean(r.usageNote, 160);
    out.push({ phrase, transliteration, language, tone, usageNote });
  }
  if (out.length < 3) return null;
  return out.slice(0, 5);
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
      { ok: false, phrases: [] },
      { status: 400 },
    );
  }

  const i = body.input ?? {};
  const groomName = clean(i.groomName, 60);
  const tone = clean(i.tone, 40);
  const language = clean(i.language, 40);
  const detail = clean(i.detail, 400);

  if (!groomName || !tone || !language) {
    return NextResponse.json<ResponseBody>(
      { ok: false, phrases: [] },
      { status: 400 },
    );
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey)
    return NextResponse.json<ResponseBody>({ ok: false, phrases: [] });

  const client = await loadAnthropic(apiKey);
  if (!client)
    return NextResponse.json<ResponseBody>({ ok: false, phrases: [] });

  const userMsg = [
    `Groom's name: ${groomName}`,
    `Tone: ${tone}`,
    `Language: ${language}`,
    `Personal detail: ${detail || "(none provided — keep phrases broadly applicable)"}`,
  ].join("\n");

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMsg }],
    });
    const block = response.content.find(
      (b): b is AnthropicTextBlock => b.type === "text",
    );
    if (!block)
      return NextResponse.json<ResponseBody>({ ok: false, phrases: [] });
    const phrases = tryParsePhrases(block.text);
    if (!phrases)
      return NextResponse.json<ResponseBody>({ ok: false, phrases: [] });
    return NextResponse.json<ResponseBody>({ ok: true, phrases });
  } catch {
    return NextResponse.json<ResponseBody>({ ok: false, phrases: [] });
  }
}
