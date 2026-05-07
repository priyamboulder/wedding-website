import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import type { DirectionSynthesis } from "@/types/aesthetic";
import { checkRateLimit, getClientIp } from "@/lib/api/rate-limit";

const anthropic = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const rl = await checkRateLimit(`ai:${ip}`, { windowMs: 60_000, max: 10 });
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment." },
      { status: 429, headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } },
    );
  }
  const body = (await request.json()) as { synthesis: DirectionSynthesis };

  if (anthropic) {
    try {
      const s = body.synthesis;
      const paletteDesc = s.palette_primary.map((p) => `${p.name} (${p.hex})`).join(", ");

      const message = await anthropic.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 512,
        system: `You are an aesthetic director for Indian luxury weddings. Given a couple's synthesized aesthetic direction, produce two things:
1. A JSON array called "forbidden" — 5–8 explicit "no" rules that protect this direction from common vendor defaults. Each rule is a single imperative sentence starting with "No". Be specific to the actual palette, textures, and mood given.
2. A single paragraph "cultural_notes" — how to read the cultural references in this direction (motif vs. colour story, artisan commissioning, etc.).

Respond ONLY with valid JSON in this exact shape:
{"forbidden": ["No ...", ...], "cultural_notes": "..."}`,
        messages: [
          {
            role: "user",
            content: `Direction: "${s.manifesto.slice(0, 200)}"
Palette: ${paletteDesc}
Textures: ${s.textures.join(", ")}
Mood: ${s.mood_tags.join(", ")}
Implied moves: ${s.implied_moves.join("; ")}`,
          },
        ],
      });

      const text = message.content
        .filter((b): b is Anthropic.TextBlock => b.type === "text")
        .map((b) => b.text)
        .join("");

      const parsed = JSON.parse(text) as { forbidden: string[]; cultural_notes: string };
      return NextResponse.json(parsed);
    } catch {
      // Fall through to heuristic
    }
  }

  // Heuristic fallback (no key or Claude error)
  const { forbidden, cultural_notes } = derive(body.synthesis);
  return NextResponse.json({ forbidden, cultural_notes });
}

function derive(s: DirectionSynthesis): { forbidden: string[]; cultural_notes: string } {
  const forbidden: string[] = [];
  const mood = new Set(s.mood_tags.map((m) => m.toLowerCase()));
  const textures = new Set(s.textures.map((t) => t.toLowerCase()));

  if (mood.has("candlelit")) {
    forbidden.push("No uplighting on tables or mandap");
    forbidden.push("No overhead spotlights");
  }
  if (textures.has("matte ceramic") || textures.has("unglazed terracotta") || textures.has("brass")) {
    forbidden.push("No glass vases or vessels");
    forbidden.push("No chrome or silver finishes");
  }
  if (mood.has("quiet") || mood.has("restrained")) {
    forbidden.push("No centerpiece florals above 14 inches");
    forbidden.push("No multi-tier arrangements");
  }
  if (mood.has("garden") || mood.has("modern")) {
    forbidden.push("No draped ceiling treatments");
    forbidden.push("No chiavari chairs — cross-back or cane only");
  }
  if (mood.has("warm") || mood.has("rich")) {
    forbidden.push("No cool-white linens — warm-white or bone only");
  }
  if (forbidden.length < 4) {
    forbidden.push("No vendor-default centerpieces — every table is specified");
    forbidden.push("No non-palette accent colors, even for ribbons or signage");
  }

  const palette_names = s.palette_primary.map((p) => p.name).join(", ");
  const cultural_notes = `This direction draws on ${palette_names} — read as cultural reference, not literal motif. Brass, aged gold, and hand-blocked textiles are welcome; chrome, LED-lit florals, and ballroom drape are not. Any cultural motif should be commissioned from a named artisan rather than pulled from a vendor default.`;

  return { forbidden: [...new Set(forbidden)], cultural_notes };
}
