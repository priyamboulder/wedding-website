// POST /api/tools/vow-mad-libs
//
// Generates a 3-paragraph playful wedding vow from 8 user-provided answers.
// Public (no auth) — session-only tool. Returns ok:false if the API key is
// missing or the call fails so the front-end can show a friendly fallback.

import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/api/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 30;

const MODEL = "claude-sonnet-4-20250514";
const MAX_TOKENS = 1000;

interface Answers {
  meet?: string;
  word?: string;
  quirk?: string;
  introduced?: string;
  insideJoke?: string;
  always?: string;
  never?: string;
  knew?: string;
}

interface RequestBody {
  answers?: Answers;
}

interface ResponseBody {
  ok: boolean;
  vow: string;
}

const SYSTEM_PROMPT =
  "You write playful, warm wedding vows for Indian-American couples. Tone: funny, heartfelt, slightly theatrical — like a great wedding toast, not a legal document. Always 3 paragraphs. Paragraph 1: origin story. Paragraph 2: the real them — quirks, love, specifics, inside jokes. Paragraph 3: the promises. End with one memorable closing line. Return ONLY the vow text. No preamble, no title, no quotes around it.";

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

function clean(s: unknown): string {
  return typeof s === "string" ? s.trim().slice(0, 400) : "";
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
    return NextResponse.json<ResponseBody>({ ok: false, vow: "" }, { status: 400 });
  }

  const a = body.answers ?? {};
  const meet = clean(a.meet);
  const word = clean(a.word);
  const quirk = clean(a.quirk);
  const introduced = clean(a.introduced);
  const insideJoke = clean(a.insideJoke);
  const always = clean(a.always);
  const never = clean(a.never);
  const knew = clean(a.knew);

  if (
    !meet ||
    !word ||
    !quirk ||
    !introduced ||
    !insideJoke ||
    !always ||
    !never ||
    !knew
  ) {
    return NextResponse.json<ResponseBody>({ ok: false, vow: "" }, { status: 400 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json<ResponseBody>({ ok: false, vow: "" });

  const client = await loadAnthropic(apiKey);
  if (!client) return NextResponse.json<ResponseBody>({ ok: false, vow: "" });

  const userMsg = [
    `How they met: ${meet}`,
    `Partner's defining trait (one word): ${word}`,
    `Annoying quirk: ${quirk}`,
    `Something they introduced each other to: ${introduced}`,
    `Inside joke only the two of them get: ${insideJoke}`,
    `Promise to always do: ${always}`,
    `Promise to never do: ${never}`,
    `The moment they knew: ${knew}`,
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
    const vow = block?.text?.trim();
    if (!vow) return NextResponse.json<ResponseBody>({ ok: false, vow: "" });
    return NextResponse.json<ResponseBody>({ ok: true, vow });
  } catch {
    return NextResponse.json<ResponseBody>({ ok: false, vow: "" });
  }
}
