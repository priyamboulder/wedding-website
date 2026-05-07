import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import type { InspirationTags } from "@/types/aesthetic";
import { checkRateLimit, getClientIp } from "@/lib/api/rate-limit";

const anthropic = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

const TAG_SYSTEM = `You are an aesthetic tagging model for a luxury Indian wedding planning app. Analyze the image and respond ONLY with valid JSON matching this exact TypeScript shape:

{
  "palette": [{ "hex": "#RRGGBB", "name": "descriptive color name" }],  // 3–5 colors actually present
  "textures": ["..."],       // 2–5 material textures visible (e.g. "raw silk", "terracotta", "brass")
  "era": "...",              // one phrase: "modern minimal" | "vintage courtyard" | "opulent" | etc.
  "scale": "intimate" | "grand",
  "mood": ["..."],           // 2–4 mood words: "candlelit", "warm", "quiet", "dramatic", "romantic", etc.
  "elements": ["..."],       // 2–5 specific decor elements visible (e.g. "brass lanterns", "taper candles")
  "cultural_cues": ["..."]   // 0–3 cultural references if clearly present, else empty array
}

Be specific and literal — only tag what is actually visible. No guessing. Respond with JSON only.`;

export async function POST(request: NextRequest) {
  const body = (await request.json()) as { imageId: string; sourceUrl: string };

  if (!body.sourceUrl) {
    return NextResponse.json({ error: "sourceUrl required" }, { status: 400 });
  }

  if (anthropic) {
    try {
      // Fetch the image — follow redirects, 8s timeout
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 8000);

      const imgRes = await fetch(body.sourceUrl, {
        signal: controller.signal,
        headers: { "User-Agent": "Mozilla/5.0 (compatible; WeddingApp/1.0)" },
      }).finally(() => clearTimeout(timer));

      if (!imgRes.ok) throw new Error(`Image fetch failed: ${imgRes.status}`);

      const contentType = imgRes.headers.get("content-type") ?? "image/jpeg";
      const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
      const mediaType = allowedTypes.find((t) => contentType.includes(t.split("/")[1]))
        ?? "image/jpeg";

      const arrayBuffer = await imgRes.arrayBuffer();
      // Claude accepts up to ~5MB base64 images; skip if too large
      if (arrayBuffer.byteLength > 4.5 * 1024 * 1024) throw new Error("Image too large");

      const base64 = Buffer.from(arrayBuffer).toString("base64");

      const message = await anthropic.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 512,
        system: TAG_SYSTEM,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: { type: "base64", media_type: mediaType as "image/jpeg", data: base64 },
              },
              { type: "text", text: "Tag this wedding inspiration image." },
            ],
          },
        ],
      });

      const text = message.content
        .filter((b): b is Anthropic.TextBlock => b.type === "text")
        .map((b) => b.text)
        .join("");

      const tags = JSON.parse(text) as InspirationTags;
      return NextResponse.json({ tags });
    } catch (e) {
      console.warn("Vision tagging failed, using heuristic:", e instanceof Error ? e.message : e);
      // Fall through to heuristic stub
    }
  }

  // Deterministic heuristic fallback (no key, fetch failed, or image too large)
  await new Promise((r) => setTimeout(r, 600));
  return NextResponse.json({ tags: generateStubTags(body.sourceUrl) });
}

// ── Heuristic stub ──────────────────────────────────────────────────────────

const PROFILES: InspirationTags[] = [
  {
    palette: [
      { hex: "#D88A5B", name: "dusk saffron" },
      { hex: "#8F3A2C", name: "pomegranate" },
      { hex: "#C7A676", name: "aged brass" },
      { hex: "#F1E4CF", name: "candle bone" },
    ],
    textures: ["brass", "hand-blocked cotton", "wax", "terracotta"],
    era: "vintage courtyard",
    scale: "intimate",
    mood: ["warm", "candlelit", "rich"],
    elements: ["brass lanterns", "taper candles", "pomegranate accents"],
    cultural_cues: ["Rajasthani color story"],
  },
  {
    palette: [
      { hex: "#F5F1EA", name: "bone" },
      { hex: "#E8D9C3", name: "raw silk" },
      { hex: "#8A9A7B", name: "olive shade" },
      { hex: "#C6B89B", name: "dried wheat" },
    ],
    textures: ["matte ceramic", "muslin", "dried grass"],
    era: "modern garden",
    scale: "intimate",
    mood: ["quiet", "garden", "candlelit"],
    elements: ["bud vases", "single-stem florals", "taper candles"],
    cultural_cues: [],
  },
  {
    palette: [
      { hex: "#4A2C5A", name: "violet ink" },
      { hex: "#C97B9C", name: "old rose" },
      { hex: "#E8CFA8", name: "warm gold" },
      { hex: "#1A1A1A", name: "ink" },
    ],
    textures: ["velvet", "brass", "raw silk"],
    era: "opulent",
    scale: "grand",
    mood: ["rich", "dramatic", "romantic"],
    elements: ["hanging amaranthus", "pillar candles", "velvet drape"],
    cultural_cues: ["South Asian opulence"],
  },
  {
    palette: [
      { hex: "#F4EBDC", name: "cream" },
      { hex: "#E3C9A8", name: "parchment" },
      { hex: "#A8856E", name: "tobacco" },
      { hex: "#4E3B2E", name: "walnut" },
    ],
    textures: ["linen", "dried palm", "rattan"],
    era: "minimal",
    scale: "intimate",
    mood: ["calm", "earthen", "restrained"],
    elements: ["woven runners", "clay vessels", "palm fronds"],
    cultural_cues: [],
  },
];

function hashIndex(input: string, modulo: number): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) h = (h * 31 + input.charCodeAt(i)) >>> 0;
  return h % modulo;
}

function generateStubTags(sourceUrl: string): InspirationTags {
  const url = sourceUrl.toLowerCase();
  if (url.includes("courtyard") || url.includes("rajasthan")) return PROFILES[0];
  if (url.includes("garden") || url.includes("bud")) return PROFILES[1];
  if (url.includes("velvet") || url.includes("opulent")) return PROFILES[2];
  if (url.includes("minimal") || url.includes("linen")) return PROFILES[3];
  return PROFILES[hashIndex(sourceUrl, PROFILES.length)];
}
