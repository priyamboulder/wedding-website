// POST /api/tools/baraat-brief
//
// Generates a 4-section Baraat DJ brief (Groom's Departure → Procession →
// Arrival Moment → Milni). Public, session-only.

import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/api/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 30;

const MODEL = "claude-sonnet-4-20250514";
const MAX_TOKENS = 1500;

const SECTION_ORDER = [
  "Groom's Departure",
  "The Procession",
  "Arrival Moment",
  "Milni / Receiving",
] as const;

interface RequestInput {
  duration?: string;
  transport?: string;
  crowd?: string;
  arc?: string;
  era?: string;
  mustPlay?: string;
  mustAvoid?: string;
}

interface RequestBody {
  input?: RequestInput;
}

interface Song {
  title: string;
  artist: string;
}

interface Section {
  name: string;
  moodNote: string;
  songs: Song[];
  djNotes: string;
}

interface ResponseBody {
  ok: boolean;
  sections: Section[];
}

const SYSTEM_PROMPT =
  'You are a Baraat DJ curator for Indian-American weddings. The Baraat is the groom\'s arrival procession — horse, dhol, family, controlled chaos. Generate a 4-section brief in this EXACT order: "Groom\'s Departure", "The Procession", "Arrival Moment", "Milni / Receiving". For each section: (a) a moodNote of 1-2 sentences, (b) 2-4 real Bollywood/Bhangra songs with real artist names, (c) djNotes — specific cues like "kill bass at the steps," "bring back the dhol live for 30 seconds," "fade into Milni mid-song." Make "Arrival Moment" feel cinematic — this is the peak. Return ONLY valid JSON: { "sections": [{ "name": "", "moodNote": "", "songs": [{"title":"","artist":""}], "djNotes": "" }] }. No preamble.';

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

function clean(s: unknown, max = 400): string {
  return typeof s === "string" ? s.trim().slice(0, max) : "";
}

function tryParseSections(text: string): Section[] | null {
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
  const obj = parsed as { sections?: unknown };
  if (!Array.isArray(obj.sections)) return null;

  const out: Section[] = [];
  for (const raw of obj.sections) {
    if (!raw || typeof raw !== "object") continue;
    const r = raw as {
      name?: unknown;
      moodNote?: unknown;
      songs?: unknown;
      djNotes?: unknown;
    };
    const name = clean(r.name, 60);
    const moodNote = clean(r.moodNote, 400);
    const djNotes = clean(r.djNotes, 400);
    if (!name || !moodNote) continue;
    if (!Array.isArray(r.songs)) continue;
    const songs: Song[] = [];
    for (const s of r.songs) {
      if (!s || typeof s !== "object") continue;
      const sObj = s as { title?: unknown; artist?: unknown };
      const title = clean(sObj.title, 100);
      const artist = clean(sObj.artist, 100);
      if (title && artist) songs.push({ title, artist });
    }
    if (songs.length === 0) continue;
    out.push({ name, moodNote, songs: songs.slice(0, 4), djNotes });
  }

  if (out.length !== 4) return null;
  return out.map((s, i) => ({ ...s, name: SECTION_ORDER[i] }));
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
      { ok: false, sections: [] },
      { status: 400 },
    );
  }

  const i = body.input ?? {};
  const duration = clean(i.duration, 60);
  const transport = clean(i.transport, 60);
  const crowd = clean(i.crowd, 60);
  const arc = clean(i.arc, 100);
  const era = clean(i.era, 80);
  const mustPlay = clean(i.mustPlay, 400);
  const mustAvoid = clean(i.mustAvoid, 400);

  if (!duration || !transport || !crowd || !arc || !era) {
    return NextResponse.json<ResponseBody>(
      { ok: false, sections: [] },
      { status: 400 },
    );
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey)
    return NextResponse.json<ResponseBody>({ ok: false, sections: [] });

  const client = await loadAnthropic(apiKey);
  if (!client)
    return NextResponse.json<ResponseBody>({ ok: false, sections: [] });

  const userMsg = [
    `Duration: ${duration}`,
    `Transportation: ${transport}`,
    `Crowd dancing: ${crowd}`,
    `Energy arc: ${arc}`,
    `Music era: ${era}`,
    `Must-play: ${mustPlay || "(none specified)"}`,
    `Must-avoid: ${mustAvoid || "(none specified)"}`,
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
      return NextResponse.json<ResponseBody>({ ok: false, sections: [] });
    const sections = tryParseSections(block.text);
    if (!sections)
      return NextResponse.json<ResponseBody>({ ok: false, sections: [] });
    return NextResponse.json<ResponseBody>({ ok: true, sections });
  } catch {
    return NextResponse.json<ResponseBody>({ ok: false, sections: [] });
  }
}
