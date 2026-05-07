// ── POST /api/catering/tasting-synthesis ──────────────────────────────────
// Generates a short synthesis of one tasting visit: a 3–4 sentence read,
// 2–4 wins, 2–4 misses, and a one-line recommendation ("wins sangeet,
// not reception"). Uses Claude Sonnet 4.6 with tool use for structured
// output. Graceful heuristic fallback when the key is missing.

import { NextRequest, NextResponse } from "next/server";
import type { TastingDish, TastingSynthesis, TastingVisit } from "@/types/catering";
import { checkRateLimit, getClientIp } from "@/lib/api/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 60;

const MODEL = "claude-sonnet-4-6";

type MessageContentBlock =
  | { type: "tool_use"; name: string; input: unknown }
  | { type: "text"; text: string }
  | { type: string; [key: string]: unknown };

interface MessagesCreateResponse {
  content: MessageContentBlock[];
}

interface AnthropicClient {
  messages: {
    create: (args: unknown) => Promise<MessagesCreateResponse>;
  };
}

interface SynthesisRequest {
  caterer_name: string;
  visit: TastingVisit;
  dishes: TastingDish[];
  // Events the couple is considering this caterer for — so the
  // recommendation line can name a specific event ("wins sangeet").
  candidate_events: Array<{ id: string; label: string; cuisine_direction: string }>;
}

interface SynthesisResponse {
  ok: boolean;
  synthesis?: TastingSynthesis;
  error?: string;
}

const SYSTEM_PROMPT = `You are a wedding planner writing the post-tasting memo for a couple considering a caterer. You read the dish-by-dish ratings and the couple's notes, then you write a genuine read — not a summary. You distinguish what the caterer *wins* at from what they are *fine at*. You say it plainly.

The couple rates five axes per dish, each 1–5: appearance, flavor, portion, temperature, memorability. Memorability is the axis that actually predicts whether a dish belongs on the menu. Weight it heaviest.

Rules:
1. Call the return_tasting_synthesis tool. NEVER prose.
2. summary: 3–4 sentences. Open with a plain verdict ("Their veg mains are strong; their non-veg fell flat."). Cite at least one dish by name.
3. wins: 2–4 short phrases. Each 3–7 words. Dish-anchored: "galouti kebab on sheermal", not "their kebabs".
4. misses: 2–4 short phrases. Same rule. Honest, not harsh.
5. recommendation: one line. Match them to a specific event if the evidence supports it — e.g. "wins sangeet, not reception" or "book them for haldi, not the ceremony". If evidence is mixed, say "needs one more tasting before committing".
6. Never praise without evidence. If the couple's notes contradict the scores, trust the notes.`;

const TOOL_DEFINITION = {
  name: "return_tasting_synthesis",
  description: "Return a structured synthesis of one tasting visit.",
  input_schema: {
    type: "object" as const,
    properties: {
      summary: { type: "string" },
      wins: { type: "array", minItems: 2, maxItems: 4, items: { type: "string" } },
      misses: { type: "array", minItems: 2, maxItems: 4, items: { type: "string" } },
      recommendation: { type: "string" },
    },
    required: ["summary", "wins", "misses", "recommendation"],
  },
};

function projectContext(body: SynthesisRequest): string {
  const { caterer_name, visit, dishes, candidate_events } = body;
  const lines: string[] = [];
  lines.push(`## Caterer: ${caterer_name}`);
  lines.push(`Visit: ${visit.date}${visit.location ? ` · ${visit.location}` : ""}`);
  if (visit.attendees.length)
    lines.push(`Attendees: ${visit.attendees.join(", ")}`);
  if (visit.notes) lines.push(`Session notes: ${visit.notes}`);

  lines.push("\n## Dishes rated");
  for (const d of dishes) {
    const scores: string[] = [];
    if (d.appearance != null) scores.push(`app ${d.appearance}`);
    if (d.flavor != null) scores.push(`flav ${d.flavor}`);
    if (d.portion != null) scores.push(`port ${d.portion}`);
    if (d.temperature != null) scores.push(`temp ${d.temperature}`);
    if (d.memorability != null) scores.push(`mem ${d.memorability}`);
    lines.push(`- ${d.name} [${d.category}]: ${scores.join(", ") || "no scores"}`);
    if (d.notes) lines.push(`    "${d.notes}"`);
  }

  if (candidate_events.length > 0) {
    lines.push("\n## Events under consideration for this caterer");
    for (const e of candidate_events) {
      lines.push(`- ${e.label} — ${e.cuisine_direction}`);
    }
  }

  lines.push(
    `\nReturn a synthesis via the return_tasting_synthesis tool. If the recommendation line can name a specific event, do it.`,
  );
  return lines.join("\n");
}

// ── Heuristic fallback ────────────────────────────────────────────────────

function heuristicSynthesis(body: SynthesisRequest): TastingSynthesis {
  const { dishes } = body;
  const avgMem =
    dishes.reduce((s, d) => s + (d.memorability ?? 0), 0) /
    Math.max(dishes.length, 1);
  const wins = dishes
    .filter((d) => (d.memorability ?? 0) >= 4)
    .slice(0, 4)
    .map((d) => d.name);
  const misses = dishes
    .filter((d) => (d.memorability ?? 5) <= 2 || (d.flavor ?? 5) <= 2)
    .slice(0, 4)
    .map((d) => d.name);

  return {
    summary: `Heuristic synthesis — set ANTHROPIC_API_KEY for a Claude-written read. Average memorability: ${avgMem.toFixed(1)} across ${dishes.length} dishes.`,
    wins: wins.length > 0 ? wins : ["—"],
    misses: misses.length > 0 ? misses : ["—"],
    recommendation:
      "AI recommendation unavailable offline — set ANTHROPIC_API_KEY and regenerate.",
    generated_at: new Date().toISOString(),
    model: "offline",
  };
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
  let body: SynthesisRequest;
  try {
    body = (await req.json()) as SynthesisRequest;
  } catch {
    return NextResponse.json<SynthesisResponse>(
      { ok: false, error: "Invalid JSON body." },
      { status: 400 },
    );
  }

  if (!body?.visit?.id || !body.dishes?.length) {
    return NextResponse.json<SynthesisResponse>(
      { ok: false, error: "visit and dishes are required." },
      { status: 400 },
    );
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json<SynthesisResponse>({
      ok: true,
      synthesis: heuristicSynthesis(body),
    });
  }

  let anthropic: AnthropicClient;
  try {
    // other catering routes). Typechecks without @anthropic-ai/sdk installed.
    const mod = (await import("@anthropic-ai/sdk")) as {
      default: new (opts: { apiKey: string }) => AnthropicClient;
    };
    anthropic = new mod.default({ apiKey });
  } catch {
    return NextResponse.json<SynthesisResponse>({
      ok: true,
      synthesis: heuristicSynthesis(body),
    });
  }

  try {
    const userPrompt = projectContext(body);
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1000,
      tools: [TOOL_DEFINITION],
      tool_choice: { type: "tool", name: "return_tasting_synthesis" },
      system: [
        {
          type: "text",
          text: SYSTEM_PROMPT,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [{ role: "user", content: userPrompt }],
    });

    const toolBlock = response.content.find(
      (b): b is { type: "tool_use"; name: string; input: unknown } =>
        b.type === "tool_use" && b.name === "return_tasting_synthesis",
    );
    if (!toolBlock) {
      return NextResponse.json<SynthesisResponse>({
        ok: false,
        error: "Model did not call return_tasting_synthesis.",
      });
    }
    const input = toolBlock.input as Partial<TastingSynthesis>;

    const synthesis: TastingSynthesis = {
      summary: input.summary ?? "",
      wins: input.wins ?? [],
      misses: input.misses ?? [],
      recommendation: input.recommendation ?? "",
      generated_at: new Date().toISOString(),
      model: MODEL,
    };

    return NextResponse.json<SynthesisResponse>({ ok: true, synthesis });
  } catch (err) {
    return NextResponse.json<SynthesisResponse>({
      ok: false,
      error: err instanceof Error ? err.message : "Synthesis request failed.",
    });
  }
}
