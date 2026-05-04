// POST /api/tools/welcome-message
//
// Generates 4 welcome messages (website, ceremony program, OOT bag, sign)
// from the couple's story, location, and tone preferences. Public,
// session-only.

import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 30;

const MODEL = "claude-sonnet-4-20250514";
const MAX_TOKENS = 1500;

interface RequestInput {
  meet?: string;
  location?: string;
  feel?: string;
  acknowledge?: string[];
  tone?: string;
}

interface RequestBody {
  input?: RequestInput;
}

interface Messages {
  website: string;
  program: string;
  ootBag: string;
  welcomeSign: string;
}

interface ResponseBody {
  ok: boolean;
  messages: Messages | null;
}

const SYSTEM_PROMPT =
  'You write wedding welcome messages for an Indian-American couple. Avoid generic wedding clichés. Be specific to their story. Generate FOUR versions and return ONLY a valid JSON object: { "website": "150-200 words, 2 paragraphs, conversational and personal", "program": "75-100 words, formal third-person ceremony intro", "ootBag": "50-75 words, warm and personal, signed -[Couple]", "welcomeSign": "3-5 short lines max, punchy, sign-friendly with line breaks as \\n" }. No preamble, no code fences.';

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

function clean(s: unknown, max = 600): string {
  return typeof s === "string" ? s.trim().slice(0, max) : "";
}

function tryParseMessages(text: string): Messages | null {
  const stripped = text.replace(/```(?:json)?/gi, "").trim();
  const start = stripped.indexOf("{");
  const end = stripped.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(stripped.slice(start, end + 1));
  } catch {
    return null;
  }
  if (!parsed || typeof parsed !== "object") return null;
  const r = parsed as {
    website?: unknown;
    program?: unknown;
    ootBag?: unknown;
    welcomeSign?: unknown;
  };
  const website = clean(r.website, 1600);
  const program = clean(r.program, 800);
  const ootBag = clean(r.ootBag, 600);
  const welcomeSign = clean(r.welcomeSign, 400);
  if (!website || !program || !ootBag || !welcomeSign) return null;
  return { website, program, ootBag, welcomeSign };
}

export async function POST(req: NextRequest) {
  let body: RequestBody;
  try {
    body = (await req.json()) as RequestBody;
  } catch {
    return NextResponse.json<ResponseBody>(
      { ok: false, messages: null },
      { status: 400 },
    );
  }

  const i = body.input ?? {};
  const meet = clean(i.meet, 600);
  const location = clean(i.location, 400);
  const feel = clean(i.feel, 200);
  const tone = clean(i.tone, 100);
  const acknowledge = Array.isArray(i.acknowledge)
    ? i.acknowledge.map((s) => clean(s, 100)).filter(Boolean).slice(0, 6)
    : [];

  if (!meet || !location || !feel || !tone) {
    return NextResponse.json<ResponseBody>(
      { ok: false, messages: null },
      { status: 400 },
    );
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey)
    return NextResponse.json<ResponseBody>({ ok: false, messages: null });

  const client = await loadAnthropic(apiKey);
  if (!client)
    return NextResponse.json<ResponseBody>({ ok: false, messages: null });

  const userMsg = [
    `How they met: ${meet}`,
    `Wedding location and why it matters: ${location}`,
    `What they want guests to feel: ${feel}`,
    `Specific guests to acknowledge: ${acknowledge.length > 0 ? acknowledge.join("; ") : "(none specified)"}`,
    `Tone: ${tone}`,
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
      return NextResponse.json<ResponseBody>({ ok: false, messages: null });
    const messages = tryParseMessages(block.text);
    if (!messages)
      return NextResponse.json<ResponseBody>({ ok: false, messages: null });
    return NextResponse.json<ResponseBody>({ ok: true, messages });
  } catch {
    return NextResponse.json<ResponseBody>({ ok: false, messages: null });
  }
}
