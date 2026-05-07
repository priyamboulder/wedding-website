// ── /api/share/draft ────────────────────────────────────────────────────────
// Turns a completed interview transcript into a structured Real Wedding draft
// (headline, pull quote, and an array of story blocks the couple can edit).

import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import type {
  AIDraft,
  EventTag,
  InterviewMessage,
  StoryBlock,
} from "@/types/share-shaadi";
import { EVENT_TAG_LABEL, makeBlockId } from "@/types/share-shaadi";
import { checkRateLimit, getClientIp } from "@/lib/api/rate-limit";

export const runtime = "nodejs";

const anthropic = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

interface RequestBody {
  basics: {
    brideName: string;
    groomName: string;
    weddingMonth?: string | null;
    venue?: string;
    city?: string;
    guestCount?: number | null;
    events?: EventTag[];
  };
  transcript: InterviewMessage[];
}

function systemPrompt(): string {
  return `You are writing a Real Wedding feature for The Marigold.

Voice: editorial, warm, culturally fluent. Think Vogue Weddings meets your coolest cousin's Instagram caption. Not dry. Not overly formal. Not generic. Every wedding story should feel different.

Output strict JSON with this exact shape:
{
  "headline": "string — a Cormorant Garamond-friendly headline. Couple's first names. Italic-friendly.",
  "pullQuote": "string — one quotable line, ideally something the couple themselves said in the transcript. 8–18 words.",
  "blocks": [
    { "type": "narrative", "eventTag": "CEREMONY" | null, "body": "..." },
    { "type": "moment", "eventTag": "SANGEET" | null, "body": "..." },
    { "type": "vendor_shoutout", "vendorName": "...", "category": "PHOTOGRAPHY" | "VIDEOGRAPHY" | "DECOR" | "FLORALS" | "CATERING" | "MAKEUP" | "MEHENDI" | "MUSIC_DJ" | "VENUE" | "ATTIRE" | "JEWELRY" | "STATIONERY" | "PLANNER" | "OTHER", "body": "..." },
    { "type": "advice", "body": "..." },
    { "type": "family", "side": "bride" | "groom" | "both", "body": "..." },
    { "type": "freewrite", "body": "..." }
  ]
}

Block selection rules:
- Use 4–7 blocks total. Mix narrative paragraphs with at least one moment, one vendor_shoutout (only if a vendor was actually named), and one advice block.
- eventTag must be one of: ROKA, ENGAGEMENT, HALDI, MEHENDI, SANGEET, CEREMONY, RECEPTION, AFTER_PARTY, OTHER (or null).
- Use the couple's actual words where they said something beautiful — but weave it into editorial prose. Don't make it sound like an interview transcript.
- No advice block if the couple didn't say something advice-worthy. No vendor_shoutout if no vendor was named.

Return ONLY the JSON. No markdown fences. No commentary.`;
}

function userPrompt(basics: RequestBody["basics"], transcript: InterviewMessage[]): string {
  const eventsList =
    basics.events && basics.events.length
      ? basics.events.map((e) => EVENT_TAG_LABEL[e]).join(", ")
      : "unspecified";
  const lines = transcript
    .map((m) => `${m.role === "assistant" ? "EDITOR" : "COUPLE"}: ${m.content}`)
    .join("\n");
  return `Couple: ${basics.brideName} & ${basics.groomName}
Date: ${basics.weddingMonth ?? "unspecified"}
Venue: ${basics.venue || "unspecified"}, ${basics.city || ""}
Guests: ${basics.guestCount ?? "unspecified"}
Events: ${eventsList}

Interview transcript:
${lines}

Now write the Real Wedding feature in JSON.`;
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
  try {
    const body = (await req.json()) as RequestBody;
    if (!anthropic) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY not configured" },
        { status: 503 },
      );
    }
    if (!body.transcript?.length) {
      return NextResponse.json(
        { error: "transcript is required" },
        { status: 400 },
      );
    }

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2400,
      system: systemPrompt(),
      messages: [{ role: "user", content: userPrompt(body.basics, body.transcript) }],
    });

    const raw = message.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n");

    const draft = parseDraft(raw);
    if (!draft) {
      return NextResponse.json(
        { error: "Could not parse model output" },
        { status: 502 },
      );
    }

    return NextResponse.json(draft);
  } catch (e) {
    console.error("share draft error:", e);
    return NextResponse.json(
      { error: "Draft generation failed" },
      { status: 500 },
    );
  }
}

// Defensive JSON parsing — strip ``` fences if the model added them, then
// validate enough of the shape to cast to AIDraft and assign block ids.
function parseDraft(raw: string): AIDraft | null {
  const stripped = raw
    .replace(/^```(?:json)?/gim, "")
    .replace(/```$/gim, "")
    .trim();
  let parsed: any;
  try {
    parsed = JSON.parse(stripped);
  } catch {
    // try to find the first { and last } to recover
    const first = stripped.indexOf("{");
    const last = stripped.lastIndexOf("}");
    if (first < 0 || last < 0) return null;
    try {
      parsed = JSON.parse(stripped.slice(first, last + 1));
    } catch {
      return null;
    }
  }
  if (!parsed || typeof parsed !== "object") return null;
  if (typeof parsed.headline !== "string") return null;
  if (!Array.isArray(parsed.blocks)) return null;

  const blocks: StoryBlock[] = [];
  for (const b of parsed.blocks as any[]) {
    if (!b || typeof b !== "object") continue;
    const id = makeBlockId();
    switch (b.type) {
      case "narrative":
        blocks.push({
          id,
          type: "narrative",
          body: String(b.body ?? ""),
          eventTag: b.eventTag ?? null,
        });
        break;
      case "moment":
        blocks.push({
          id,
          type: "moment",
          body: String(b.body ?? ""),
          eventTag: b.eventTag ?? null,
        });
        break;
      case "vendor_shoutout":
        blocks.push({
          id,
          type: "vendor_shoutout",
          vendorName: String(b.vendorName ?? ""),
          category: b.category ?? "OTHER",
          body: String(b.body ?? ""),
        });
        break;
      case "advice":
        blocks.push({ id, type: "advice", body: String(b.body ?? "") });
        break;
      case "family":
        blocks.push({
          id,
          type: "family",
          side: b.side === "bride" || b.side === "groom" ? b.side : "both",
          body: String(b.body ?? ""),
        });
        break;
      case "freewrite":
        blocks.push({ id, type: "freewrite", body: String(b.body ?? "") });
        break;
      default:
        // unknown block type — skip
        break;
    }
  }

  return {
    headline: parsed.headline,
    pullQuote: typeof parsed.pullQuote === "string" ? parsed.pullQuote : "",
    blocks,
  };
}
