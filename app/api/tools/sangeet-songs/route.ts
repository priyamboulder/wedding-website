// POST /api/tools/sangeet-songs
//
// Generates a 6-section Sangeet DJ brief (entry, warm-up, peak, slow, family
// classics, finale) from 5 user preferences. Public (no auth) — session-only.
// Returns ok:false on any failure so the front-end can surface a graceful
// fallback message rather than a broken page.

import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/api/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 30;

const MODEL = "claude-sonnet-4-20250514";
const MAX_TOKENS = 1000;

const SECTION_ORDER = [
  "Entry Music",
  "Warm-Up",
  "Peak Energy",
  "Slow Moment",
  "Family Classics",
  "Finale",
] as const;

interface RequestPrefs {
  vibe?: string;
  crowd?: string;
  size?: string;
  languages?: string[];
  finale?: string;
}

interface RequestBody {
  prefs?: RequestPrefs;
}

interface Song {
  title: string;
  artist: string;
}

interface Section {
  name: string;
  moodNote: string;
  songs: Song[];
}

interface ResponseBody {
  ok: boolean;
  sections: Section[];
}

const SYSTEM_PROMPT =
  "You are a Sangeet DJ curator for Indian-American weddings. Given user preferences, return exactly 6 sections in this order: Entry Music, Warm-Up, Peak Energy, Slow Moment, Family Classics, Finale. For each section: a section name, a 1-sentence mood note, and 3-5 real Bollywood/South Asian song suggestions with real artist names. Use real song titles only. Return ONLY valid JSON in this exact shape: { \"sections\": [{ \"name\": \"\", \"moodNote\": \"\", \"songs\": [{ \"title\": \"\", \"artist\": \"\" }] }] }. No preamble, no code fences.";

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
  return typeof s === "string" ? s.trim().slice(0, 200) : "";
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

  const cleaned: Section[] = [];
  for (const raw of obj.sections) {
    if (!raw || typeof raw !== "object") continue;
    const r = raw as { name?: unknown; moodNote?: unknown; songs?: unknown };
    const name = clean(r.name);
    const moodNote = clean(r.moodNote);
    if (!name || !moodNote) continue;
    if (!Array.isArray(r.songs)) continue;
    const songs: Song[] = [];
    for (const s of r.songs) {
      if (!s || typeof s !== "object") continue;
      const sObj = s as { title?: unknown; artist?: unknown };
      const title = clean(sObj.title);
      const artist = clean(sObj.artist);
      if (title && artist) songs.push({ title, artist });
    }
    if (songs.length === 0) continue;
    cleaned.push({ name, moodNote, songs: songs.slice(0, 5) });
  }

  if (cleaned.length !== 6) return null;
  // Coerce names to the canonical order if the model picked synonyms.
  return cleaned.map((s, i) => ({ ...s, name: SECTION_ORDER[i] }));
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

  const p = body.prefs ?? {};
  const vibe = clean(p.vibe);
  const crowd = clean(p.crowd);
  const size = clean(p.size);
  const finale = clean(p.finale);
  const languages = Array.isArray(p.languages)
    ? p.languages.map(clean).filter(Boolean).slice(0, 8)
    : [];

  if (!vibe || !crowd || !size || !finale || languages.length === 0) {
    return NextResponse.json<ResponseBody>(
      { ok: false, sections: [] },
      { status: 400 },
    );
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json<ResponseBody>({ ok: false, sections: [] });

  const client = await loadAnthropic(apiKey);
  if (!client) return NextResponse.json<ResponseBody>({ ok: false, sections: [] });

  const userMsg = [
    `Vibe: ${vibe}`,
    `Crowd energy: ${crowd}`,
    `Size: ${size}`,
    `Languages: ${languages.join(", ")}`,
    `Finale feel: ${finale}`,
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
    if (!block) return NextResponse.json<ResponseBody>({ ok: false, sections: [] });
    const sections = tryParseSections(block.text);
    if (!sections) return NextResponse.json<ResponseBody>({ ok: false, sections: [] });
    return NextResponse.json<ResponseBody>({ ok: true, sections });
  } catch {
    return NextResponse.json<ResponseBody>({ ok: false, sections: [] });
  }
}
