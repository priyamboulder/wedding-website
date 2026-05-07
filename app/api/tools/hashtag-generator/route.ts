// POST /api/tools/hashtag-generator
//
// Generates 10 wedding hashtags organized into three tiers (1 primary,
// 4 contenders, 5 group-chat). Public, session-only, no auth.

import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/api/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 30;

const MODEL = "claude-sonnet-4-20250514";
const MAX_TOKENS = 1000;

interface RequestInput {
  name1?: string;
  name2?: string;
  lastName?: string;
  year?: string;
  vibe?: string;
}

interface RequestBody {
  input?: RequestInput;
}

interface Hashtag {
  hashtag: string;
  tier: "primary" | "contender" | "fun";
  why: string;
  cringeScore: number;
}

interface ResponseBody {
  ok: boolean;
  hashtags: Hashtag[];
}

const SYSTEM_PROMPT =
  'You generate 10 wedding hashtags for an Indian-American couple. Be culturally aware: South Asian names sometimes contain "Sh", "Kr", "Pr", "Th" clusters that don\'t pun in English — work around them. Return EXACTLY 10 hashtags as a JSON array. Tiers: 1 "primary" (elegant, timeless, the one you\'d actually print on a sign), 4 "contender" (solid and usable), 5 "fun" (playful, punny, group-chat energy). Each item: { "hashtag": "#OneWordNoSpaces", "tier": "primary"|"contender"|"fun", "why": "one short line", "cringeScore": 0-10 (0=elegant, 10=very cringe) }. Hashtags must start with #, be one word, mix capitalization for readability. Return ONLY a valid JSON array, no preamble.';

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

function clean(s: unknown, max = 80): string {
  return typeof s === "string" ? s.trim().slice(0, max) : "";
}

function tryParseHashtags(text: string): Hashtag[] | null {
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

  const out: Hashtag[] = [];
  for (const raw of parsed) {
    if (!raw || typeof raw !== "object") continue;
    const r = raw as {
      hashtag?: unknown;
      tier?: unknown;
      why?: unknown;
      cringeScore?: unknown;
    };
    let tag = clean(r.hashtag, 60);
    if (!tag) continue;
    if (!tag.startsWith("#")) tag = `#${tag}`;
    tag = tag.replace(/\s+/g, "");
    const tier =
      r.tier === "primary" || r.tier === "contender" || r.tier === "fun"
        ? r.tier
        : null;
    if (!tier) continue;
    const why = clean(r.why, 140);
    if (!why) continue;
    const cringeRaw =
      typeof r.cringeScore === "number" ? r.cringeScore : Number(r.cringeScore);
    const cringeScore =
      Number.isFinite(cringeRaw) && cringeRaw >= 0 && cringeRaw <= 10
        ? Math.round(cringeRaw)
        : 5;
    out.push({ hashtag: tag, tier, why, cringeScore });
  }

  if (out.length < 6) return null;
  return out.slice(0, 10);
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
      { ok: false, hashtags: [] },
      { status: 400 },
    );
  }

  const i = body.input ?? {};
  const name1 = clean(i.name1, 60);
  const name2 = clean(i.name2, 60);
  const lastName = clean(i.lastName, 60);
  const year = clean(i.year, 4);
  const vibe = clean(i.vibe, 60);

  if (!name1 || !name2 || !year || !vibe) {
    return NextResponse.json<ResponseBody>(
      { ok: false, hashtags: [] },
      { status: 400 },
    );
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey)
    return NextResponse.json<ResponseBody>({ ok: false, hashtags: [] });

  const client = await loadAnthropic(apiKey);
  if (!client)
    return NextResponse.json<ResponseBody>({ ok: false, hashtags: [] });

  const userMsg = [
    `Partner 1: ${name1}`,
    `Partner 2: ${name2}`,
    `Last name: ${lastName || "(none provided)"}`,
    `Year: ${year}`,
    `Vibe: ${vibe}`,
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
      return NextResponse.json<ResponseBody>({ ok: false, hashtags: [] });
    const hashtags = tryParseHashtags(block.text);
    if (!hashtags)
      return NextResponse.json<ResponseBody>({ ok: false, hashtags: [] });
    return NextResponse.json<ResponseBody>({ ok: true, hashtags });
  } catch {
    return NextResponse.json<ResponseBody>({ ok: false, hashtags: [] });
  }
}
