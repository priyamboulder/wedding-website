// ── POST /api/catering/fit-score ──────────────────────────────────────────
// Rates a single caterer against the couple's specific wedding context
// and returns:
//   - fit_score (0–100, synthesized by the model from a per-dimension
//     breakdown)
//   - breakdown per dimension (cuisine, scale, budget, flexibility,
//     reviews, cultural_fit, logistics) each with a sentence of rationale
//   - tradeoffs — 3–5 plain-language bullets
//   - what_missing — 2–4 information gaps the couple needs to close
//   - narrative — one paragraph painting the picture of picking this
//     caterer ("If you picked X, here's what that looks like")
//
// Uses Claude Sonnet 4.6 with tool use for structured output, ephemeral
// prompt cache on the system prompt, and a heuristic fallback when
// ANTHROPIC_API_KEY is missing.
//
// Mirrors the pattern in app/api/catering/menu-design/route.ts.

import { NextResponse } from "next/server";
import type {
  CatererAssessment,
  CatererProposal,
  FitDimension,
  MenuEvent,
} from "@/types/catering";

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

// ── Request / response shapes ─────────────────────────────────────────────

interface FitScoreRequest {
  wedding_id: string;
  caterer: {
    id: string;
    name: string;
    location: string | null;
    price_range: string | null;
    style_tags: string[];
    rating: number | null;
    review_count: number;
    bio: string | null;
  };
  events: Array<Pick<
    MenuEvent,
    | "id"
    | "label"
    | "date"
    | "guest_count"
    | "cuisine_direction"
    | "service_style"
    | "vibe_tags"
  >>;
  proposals: CatererProposal[]; // proposals this caterer has submitted
  // Other catering vendors the couple is considering — provides context
  // for tradeoffs ("Foodlink scales but Blue Elephant cooks deeper").
  competitor_summaries: Array<{
    id: string;
    name: string;
    style_tags: string[];
    price_range: string | null;
  }>;
  budget_band?: string;
  couple_preferences?: string; // free-form from the couple (cuisine, must-haves, must-nots)
}

interface FitScoreResponse {
  ok: boolean;
  assessment?: Omit<CatererAssessment, "id">;
  error?: string;
}

// ── System prompt (cacheable) ─────────────────────────────────────────────

const SYSTEM_PROMPT = `You are a senior wedding planner who has hired every serious caterer in the country, for an Indian-wedding planning platform called Ananya. A couple is deciding between caterers for a multi-event wedding. You assess ONE caterer at a time, against the couple's actual events, guest counts, and cuisine direction.

Your lens:
- A caterer's bio and star rating are weak signals. Real signals: scale ceiling vs. guest count, regional specificity vs. the couple's cuisine direction, which events they've actually proposed for, and exclusions (alcohol, rentals, floral) that hide costs.
- Tradeoffs are the point. The couple is not asking for a verdict; they are asking where this caterer wins and where they lose relative to the alternatives.
- Missing information is worth flagging. "No proposal yet for reception" is a real gap. "No references from weddings this size" is a real gap.
- Cultural fit matters for Indian weddings. Jain kitchens, satvik discipline, halal sourcing, regional grandma-approval — these show up in how the caterer talks about their work, not their rating.

Your tool call rules:
1. Call the return_fit_assessment tool. NEVER output prose instead of a tool call.
2. breakdown: 4–6 dimensions from {cuisine, scale, budget, flexibility, reviews, cultural_fit, logistics}. Pick the ones that matter most given what you know. Each gets a score 0–100 and a ONE-SENTENCE rationale citing specific signals from the context.
3. fit_score: synthesize 0–100 from your breakdown. Do not average mechanically — weight by what matters for THIS wedding (e.g. scale matters more at 400 guests than at 80).
4. tradeoffs: 3–5 plain-language bullets. Each bullet is one sentence. Reference competitors by name when the tradeoff is comparative.
5. what_missing: 2–4 concrete information gaps. "No proposal for haldi" beats "need more info". Every item is actionable — something the couple can do next.
6. narrative: ONE paragraph (3–4 sentences). Open with "If you picked {caterer name}". Paint the picture — what the wedding feels like with this caterer doing the food. Name specific events where they shine or struggle.
7. Never praise generically. Never invent credentials. If context is thin, say so in what_missing.
8. Numbers in rationale are stronger than adjectives. "500 pax capacity ceiling, wedding at 420" beats "handles scale well".`;

const TOOL_DEFINITION = {
  name: "return_fit_assessment",
  description:
    "Return a structured fit assessment for a single caterer against a couple's wedding.",
  input_schema: {
    type: "object" as const,
    properties: {
      fit_score: {
        type: "integer",
        minimum: 0,
        maximum: 100,
        description:
          "0–100 synthesis of the breakdown. Weighted by what matters for this wedding, not a mechanical average.",
      },
      breakdown: {
        type: "array",
        minItems: 4,
        maxItems: 6,
        items: {
          type: "object",
          properties: {
            dimension: {
              type: "string",
              enum: [
                "cuisine",
                "scale",
                "budget",
                "flexibility",
                "reviews",
                "cultural_fit",
                "logistics",
              ],
            },
            score: { type: "integer", minimum: 0, maximum: 100 },
            rationale: {
              type: "string",
              description: "One sentence. Cite concrete signals, not adjectives.",
            },
          },
          required: ["dimension", "score", "rationale"],
        },
      },
      tradeoffs: {
        type: "array",
        minItems: 3,
        maxItems: 5,
        items: { type: "string" },
      },
      what_missing: {
        type: "array",
        minItems: 2,
        maxItems: 4,
        items: { type: "string" },
      },
      narrative: {
        type: "string",
        description:
          "One paragraph, 3–4 sentences, opening with 'If you picked {caterer name}'.",
      },
    },
    required: ["fit_score", "breakdown", "tradeoffs", "what_missing", "narrative"],
  },
};

// ── Context projection ────────────────────────────────────────────────────

function projectContext(body: FitScoreRequest): string {
  const {
    caterer,
    events,
    proposals,
    competitor_summaries,
    budget_band,
    couple_preferences,
  } = body;

  const lines: string[] = [];
  lines.push(`## Caterer under review`);
  lines.push(`Name: ${caterer.name}`);
  if (caterer.location) lines.push(`Location: ${caterer.location}`);
  if (caterer.price_range) lines.push(`Price range: ${caterer.price_range}`);
  lines.push(`Style tags: ${caterer.style_tags.join(", ") || "—"}`);
  if (caterer.rating !== null)
    lines.push(`Rating: ${caterer.rating.toFixed(1)}★ (${caterer.review_count} reviews)`);
  if (caterer.bio) lines.push(`Bio: ${caterer.bio}`);

  lines.push(`\n## Wedding events`);
  for (const e of events) {
    lines.push(
      `- ${e.label} (${e.date}): ${e.guest_count} guests, ${e.cuisine_direction}, ${e.service_style}${e.vibe_tags.length ? ` · ${e.vibe_tags.join(", ")}` : ""}`,
    );
  }

  lines.push(`\n## This caterer's proposals so far`);
  if (proposals.length === 0) {
    lines.push("(none yet)");
  } else {
    for (const p of proposals) {
      const ev = events.find((e) => e.id === p.event_id);
      if (!ev) continue;
      const price =
        p.price_per_plate_low && p.price_per_plate_high
          ? `${p.currency} ${p.price_per_plate_low}–${p.price_per_plate_high}/plate`
          : p.status === "requested"
            ? "quote requested"
            : p.status === "declined"
              ? "declined"
              : "no pricing yet";
      lines.push(`- ${ev.label}: ${price} · min ${p.min_guaranteed ?? "—"} pax`);
      if (p.inclusions.length)
        lines.push(`    inclusions: ${p.inclusions.join("; ")}`);
      if (p.exclusions.length)
        lines.push(`    exclusions: ${p.exclusions.join("; ")}`);
      if (p.notes) lines.push(`    note: ${p.notes}`);
    }
  }

  if (competitor_summaries.length > 0) {
    lines.push(`\n## Other caterers being considered`);
    for (const c of competitor_summaries) {
      lines.push(
        `- ${c.name} (${c.style_tags.join("/")}, ${c.price_range ?? "price —"})`,
      );
    }
  }

  if (budget_band) lines.push(`\n## Couple's budget band: ${budget_band}`);
  if (couple_preferences)
    lines.push(`\n## Couple's stated preferences: ${couple_preferences}`);

  lines.push(
    `\nReturn a fit assessment for ${caterer.name} via the return_fit_assessment tool.`,
  );
  return lines.join("\n");
}

// ── Heuristic fallback ────────────────────────────────────────────────────
// When the API key is missing, return a gentle assessment so the UI keeps
// working. Breakdown is synthesized from seed signals (price range, style
// tags, rating). This is NOT a judgment — it's scaffolding.

function heuristicAssessment(
  body: FitScoreRequest,
): Omit<CatererAssessment, "id"> {
  const { caterer, events, proposals, wedding_id } = body;
  const maxGuests = Math.max(...events.map((e) => e.guest_count), 0);
  const proposalsReceived = proposals.filter((p) => p.status === "received").length;
  const eventsCovered = new Set(
    proposals.filter((p) => p.status === "received").map((p) => p.event_id),
  ).size;

  const breakdown: FitDimension[] = [
    {
      dimension: "cuisine",
      score: caterer.style_tags.length > 0 ? 70 : 55,
      rationale: `Style tags: ${caterer.style_tags.join(", ") || "none"}.`,
    },
    {
      dimension: "scale",
      score: maxGuests >= 300 ? 70 : 80,
      rationale: `Largest event is ${maxGuests} guests.`,
    },
    {
      dimension: "budget",
      score: caterer.price_range ? 65 : 50,
      rationale: `Price range: ${caterer.price_range ?? "unlisted"}.`,
    },
    {
      dimension: "reviews",
      score:
        caterer.rating !== null
          ? Math.round(caterer.rating * 18)
          : 50,
      rationale: `Rating ${caterer.rating?.toFixed(1) ?? "—"}★ across ${caterer.review_count} reviews.`,
    },
    {
      dimension: "flexibility",
      score: proposalsReceived >= 2 ? 70 : 55,
      rationale: `${proposalsReceived} proposal${proposalsReceived === 1 ? "" : "s"} received across ${eventsCovered} event${eventsCovered === 1 ? "" : "s"}.`,
    },
  ];
  const score = Math.round(
    breakdown.reduce((s, b) => s + b.score, 0) / breakdown.length,
  );
  const whatMissing: string[] = [];
  if (proposalsReceived === 0)
    whatMissing.push("No proposals received yet — request pricing for your events.");
  if (proposalsReceived > 0 && proposalsReceived < events.length)
    whatMissing.push(
      `Proposals cover only ${eventsCovered} of ${events.length} events.`,
    );
  if (!caterer.bio) whatMissing.push("Bio is empty — request a capabilities deck.");
  if (whatMissing.length === 0)
    whatMissing.push("AI assessment unavailable — set ANTHROPIC_API_KEY for a deeper read.");

  return {
    wedding_id,
    caterer_id: caterer.id,
    fit_score: score,
    breakdown,
    tradeoffs: [
      `Heuristic assessment — set ANTHROPIC_API_KEY for a Claude-generated read.`,
      `Price range ${caterer.price_range ?? "unknown"} against ${maxGuests} peak guests.`,
      `${caterer.style_tags.slice(0, 3).join(" / ") || "style tags missing"}.`,
    ],
    what_missing: whatMissing.slice(0, 4),
    narrative: `If you picked ${caterer.name}, the assessment above is heuristic scaffolding. For a genuine read on tradeoffs — where this caterer wins and loses across your ${events.length} events — set ANTHROPIC_API_KEY and refresh.`,
    generated_at: new Date().toISOString(),
    model: "offline",
  };
}

// ── Route handler ─────────────────────────────────────────────────────────

export async function POST(req: Request) {
  let body: FitScoreRequest;
  try {
    body = (await req.json()) as FitScoreRequest;
  } catch {
    return NextResponse.json<FitScoreResponse>(
      { ok: false, error: "Invalid JSON body." },
      { status: 400 },
    );
  }
  if (!body?.caterer?.id || !body.events?.length) {
    return NextResponse.json<FitScoreResponse>(
      { ok: false, error: "caterer and events are required." },
      { status: 400 },
    );
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json<FitScoreResponse>({
      ok: true,
      assessment: heuristicAssessment(body),
    });
  }

  let anthropic: AnthropicClient;
  try {
    // but a fresh checkout without `npm install` should still typecheck.
    const mod = (await import("@anthropic-ai/sdk")) as {
      default: new (opts: { apiKey: string }) => AnthropicClient;
    };
    anthropic = new mod.default({ apiKey });
  } catch {
    return NextResponse.json<FitScoreResponse>({
      ok: true,
      assessment: heuristicAssessment(body),
    });
  }

  try {
    const userPrompt = projectContext(body);
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1500,
      tools: [TOOL_DEFINITION],
      tool_choice: { type: "tool", name: "return_fit_assessment" },
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
        b.type === "tool_use" && b.name === "return_fit_assessment",
    );
    if (!toolBlock) {
      return NextResponse.json<FitScoreResponse>({
        ok: false,
        error: "Model did not call return_fit_assessment.",
      });
    }
    const input = toolBlock.input as {
      fit_score?: number;
      breakdown?: FitDimension[];
      tradeoffs?: string[];
      what_missing?: string[];
      narrative?: string;
    };

    const assessment: Omit<CatererAssessment, "id"> = {
      wedding_id: body.wedding_id,
      caterer_id: body.caterer.id,
      fit_score: clamp(Math.round(input.fit_score ?? 0), 0, 100),
      breakdown: (input.breakdown ?? []).map((b) => ({
        dimension: b.dimension,
        score: clamp(Math.round(b.score), 0, 100),
        rationale: b.rationale,
      })),
      tradeoffs: input.tradeoffs ?? [],
      what_missing: input.what_missing ?? [],
      narrative: input.narrative ?? "",
      generated_at: new Date().toISOString(),
      model: MODEL,
    };

    return NextResponse.json<FitScoreResponse>({ ok: true, assessment });
  } catch (err) {
    return NextResponse.json<FitScoreResponse>({
      ok: false,
      error: err instanceof Error ? err.message : "Fit-score request failed.",
    });
  }
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}
