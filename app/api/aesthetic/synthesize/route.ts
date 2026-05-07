import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import type {
  SynthesisChunk,
  InspirationTags,
  PaletteSwatch,
} from "@/types/aesthetic";
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
  let body: {
    directionId: string;
    directionName: string;
    imageTags: InspirationTags[];
    userDescription?: string;
  };
  try {
    body = (await request.json()) as typeof body;
    if (!Array.isArray(body.imageTags) || !body.directionName) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
    }
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const emit = (chunk: SynthesisChunk) => {
        controller.enqueue(encoder.encode(JSON.stringify(chunk) + "\n"));
      };
      const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
      try {

      const heuristic = buildSynthesis(body.imageTags, body.directionName);

      // Emit palette + structural data immediately (same for both paths)
      await sleep(200);
      emit({ kind: "palette_primary", value: heuristic.palette_primary });
      await sleep(150);
      emit({ kind: "palette_secondary", value: heuristic.palette_secondary });
      await sleep(200);
      emit({ kind: "textures", value: heuristic.textures });
      await sleep(150);
      emit({ kind: "mood_tags", value: heuristic.mood_tags });

      if (anthropic) {
        // Real Claude streaming manifesto
        const tagSummary = body.imageTags
          .map((t) => `Palette: ${t.palette.map((p) => p.name).join(", ")}. Mood: ${t.mood.join(", ")}. Textures: ${t.textures.join(", ")}. Elements: ${t.elements.join(", ")}.`)
          .join("\n");

        const systemPrompt = `You are an aesthetic director for Indian luxury weddings. Given visual analysis tags from a couple's inspiration board, write a single evocative paragraph (100–130 words) as an aesthetic manifesto for their direction. Be specific to the signals — name the actual palette colors, textures, and moods from the data. Do not be generic. Do not use bullet points. Output only the manifesto paragraph.`;

        const userPrompt = `Direction name: "${body.directionName}"${body.userDescription ? `\nCouple's description: "${body.userDescription}"` : ""}\n\nVisual analysis from ${body.imageTags.length} inspiration images:\n${tagSummary}`;

        try {
          const claudeStream = await anthropic.messages.stream({
            model: "claude-sonnet-4-6",
            max_tokens: 256,
            system: systemPrompt,
            messages: [{ role: "user", content: userPrompt }],
          });

          for await (const event of claudeStream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              emit({ kind: "manifesto", value: event.delta.text });
            }
          }
        } catch {
          // Fall back to heuristic manifesto if Claude call fails
          const words = heuristic.manifesto.split(" ");
          for (let i = 0; i < words.length; i++) {
            emit({ kind: "manifesto", value: (i === 0 ? "" : " ") + words[i] });
            await sleep(30);
          }
        }
      } else {
        // No API key — stream heuristic manifesto word-by-word
        const words = heuristic.manifesto.split(" ");
        for (let i = 0; i < words.length; i++) {
          emit({ kind: "manifesto", value: (i === 0 ? "" : " ") + words[i] });
          await sleep(35);
        }
      }

      await sleep(150);
      emit({ kind: "implied_moves", value: heuristic.implied_moves });
      emit({ kind: "done" });
      controller.close();
      } catch (err) {
        console.error("[aesthetic/synthesize]", err);
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}

// ── Synthesis builder ───────────────────────────────────────────────────────

interface BuiltSynthesis {
  manifesto: string;
  palette_primary: PaletteSwatch[];
  palette_secondary: PaletteSwatch[];
  textures: string[];
  mood_tags: string[];
  implied_moves: string[];
}

function buildSynthesis(
  imageTags: InspirationTags[],
  directionName: string,
): BuiltSynthesis {
  const paletteCounts = new Map<string, { hex: string; name: string; n: number }>();
  for (const t of imageTags) {
    for (const s of t.palette) {
      const prev = paletteCounts.get(s.hex);
      if (prev) prev.n += 1;
      else paletteCounts.set(s.hex, { hex: s.hex, name: s.name, n: 1 });
    }
  }
  const sortedPalette = [...paletteCounts.values()].sort((a, b) => b.n - a.n);
  const palette_primary = sortedPalette.slice(0, 3).map(({ hex, name }) => ({ hex, name }));
  const palette_secondary = sortedPalette.slice(3, 6).map(({ hex, name }) => ({ hex, name }));

  const textures = topK(imageTags.flatMap((t) => t.textures), 5);
  const mood_tags = topK(imageTags.flatMap((t) => t.mood), 4);
  const elements = topK(imageTags.flatMap((t) => t.elements), 5);
  const implied_moves = elementsToMoves(elements, mood_tags);

  const primaryColor = palette_primary[0]?.name ?? "warm tones";
  const dominantTexture = textures[0] ?? "layered texture";
  const manifesto = `This direction — "${directionName}" — centers on ${mood_tags.slice(0, 2).join(" and ") || "considered restraint"}. The palette draws from ${primaryColor} and its neighbors; ${dominantTexture} carries the weight while accents stay deliberate. It is not about density — it is about material honesty and a single, consistent key. The moves below are what this direction specifically calls for; anything outside them should be questioned.`;

  return { manifesto, palette_primary, palette_secondary, textures, mood_tags, implied_moves };
}

function topK(items: string[], k: number): string[] {
  const counts = new Map<string, number>();
  for (const it of items) counts.set(it, (counts.get(it) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, k).map(([v]) => v);
}

function elementsToMoves(elements: string[], mood: string[]): string[] {
  const moves: string[] = [];
  for (const el of elements) moves.push(`Use ${el} as a signature, not decoration`);
  if (mood.includes("candlelit"))
    moves.push("Candle-first lighting — no overhead spot, no uplight on tables");
  if (mood.includes("quiet") || mood.includes("restrained"))
    moves.push("One floral gesture per table — no arrangements");
  if (mood.includes("rich") || mood.includes("warm"))
    moves.push("Warm metals (brass, aged gold) over chrome or silver");
  return moves.slice(0, 6);
}
