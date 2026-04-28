// ── /api/workspace/recommendations ─────────────────────────────────────────
// POST endpoint that asks Claude Sonnet 4.6 to rank photographers (and other
// categories later) against a couple's vision, constraints, and feedback.
//
// Graceful fallback: if ANTHROPIC_API_KEY is unset OR the SDK import fails
// (e.g. npm install hasn't run yet), we return a deterministic heuristic pick
// so the UI keeps working. The `from_cache` flag signals which path ran so
// the UI can show "Recommendations require Claude API — add ANTHROPIC_API_KEY"
// messaging.

import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { getSeedVendors } from "@/lib/vendor-seed";
import type {
  RecommendationAPIResponse,
  RecommendationRequestContext,
  VendorRecommendation,
} from "@/types/recommendations";
import type { Vendor, VendorCategory } from "@/types/vendor";
import { formatPriceShort } from "@/lib/vendors/price-display";

export const runtime = "nodejs";

const MODEL = "claude-sonnet-4-6";

// Minimal ambient typing so this file compiles without @anthropic-ai/sdk
// installed. The actual SDK shape is richer; these are the fields we use.
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

// ── Prompt assets (cacheable via Anthropic prompt cache) ───────────────────

const SYSTEM_PROMPT = `You are a wedding-vendor matching assistant for an Indian
wedding planning platform. Your job is to rank vendors against a couple's vision
and constraints and explain each pick with ONE concrete sentence.

Rules:
- Only use signals provided in the context. Never invent credentials or claims.
- Never cite subjective aesthetics ("beautiful work", "talented artist"). Cite
  concrete signals: style overlap, location, budget fit, prior Indian weddings,
  availability, couple feedback.
- Keep "reason" to one sentence, ≤30 words.
- Provide 2-4 match_signals, each a short phrase (no full sentences).
- Never recommend a vendor id that appears in dismissed_vendor_ids or in
  thumbs_down_vendor_ids. Strongly prefer stylistic neighbors of vendors in
  thumbs_up_vendor_ids.
- Output MUST call the recommend_vendors tool — never write prose.`;

const STATIC_RUBRIC = `## Match rubric
Weight factors in this order when choosing the top N:
1. Style overlap (keyword + moodboard theme match)
2. Budget alignment (vendor price_range inside the couple's budget band)
3. Prior Indian-wedding coverage signal (bio / style_tags)
4. Location (local to primary_location or explicit willingness to travel)
5. Positive feedback proximity — vendors similar to thumbs_up_vendor_ids
6. Rating × review_count volume (tiebreaker only)

Disqualifiers (drop entirely):
- Vendor appears in thumbs_down_vendor_ids
- Vendor appears in dismissed_vendor_ids
- Vendor's category ≠ requested category`;

const TOOL_DEFINITION = {
  name: "recommend_vendors",
  description:
    "Return a ranked list of vendor recommendations for a couple's workspace.",
  input_schema: {
    type: "object" as const,
    properties: {
      recommendations: {
        type: "array",
        items: {
          type: "object",
          properties: {
            vendor_id: { type: "string" },
            rank: { type: "integer", minimum: 1 },
            reason: {
              type: "string",
              description:
                "One sentence, ≤30 words, concrete signals only. No generic praise.",
            },
            match_signals: {
              type: "array",
              minItems: 2,
              maxItems: 4,
              items: { type: "string" },
            },
          },
          required: ["vendor_id", "rank", "reason", "match_signals"],
        },
      },
    },
    required: ["recommendations"],
  },
};

// ── Helpers ────────────────────────────────────────────────────────────────

function hashContext(ctx: RecommendationRequestContext): string {
  return crypto
    .createHash("sha256")
    .update(JSON.stringify(ctx))
    .digest("hex")
    .slice(0, 16);
}

async function pickVendorCatalogFor(category: VendorCategory): Promise<Vendor[]> {
  const vendors = await getSeedVendors();
  return vendors.filter((v) => v.category === category);
}

function catalogToPromptJson(vendors: Vendor[]): string {
  // Compact, token-friendly projection. Only fields the model needs.
  return JSON.stringify(
    vendors.map((v) => ({
      id: v.id,
      name: v.name,
      location: v.location,
      price_range: formatPriceShort(v.price_display),
      style_tags: v.style_tags,
      rating: v.rating,
      review_count: v.review_count,
      bio: v.bio.slice(0, 240),
    })),
  );
}

function coupleContextToPrompt(ctx: RecommendationRequestContext): string {
  const lines: string[] = [];
  lines.push("## Couple vision");
  lines.push(`Style keywords: ${ctx.style_keywords.join(", ") || "—"}`);
  if (ctx.moodboard_summary) lines.push(`Moodboard themes: ${ctx.moodboard_summary}`);
  if (ctx.color_palette?.length)
    lines.push(`Color palette: ${ctx.color_palette.join(" ")}`);

  lines.push("\n## Constraints");
  lines.push(
    `Wedding dates: ${ctx.wedding_dates ? `${ctx.wedding_dates.start} → ${ctx.wedding_dates.end}` : "TBD"}`,
  );
  lines.push(`Primary location: ${ctx.primary_location ?? "TBD"}`);
  lines.push(`Guest count: ${ctx.guest_count ?? "TBD"}`);
  if (ctx.budget_band)
    lines.push(
      `Budget band: $${(ctx.budget_band.min_cents / 100).toFixed(0)}–$${(ctx.budget_band.max_cents / 100).toFixed(0)}`,
    );
  lines.push(
    `Events needing coverage: ${ctx.events_needing_coverage.join(", ") || "—"}`,
  );

  lines.push("\n## Prior feedback");
  lines.push(`Thumbed up: ${ctx.thumbs_up_vendor_ids.join(", ") || "—"}`);
  lines.push(`Thumbed down: ${ctx.thumbs_down_vendor_ids.join(", ") || "—"}`);
  lines.push(`Dismissed: ${ctx.dismissed_vendor_ids.join(", ") || "—"}`);
  lines.push(`Already shortlisted: ${ctx.shortlisted_vendor_ids.join(", ") || "—"}`);

  if (ctx.open_tasks_summary) {
    lines.push("\n## Open checklist context");
    lines.push(ctx.open_tasks_summary);
  }

  lines.push(
    `\nReturn ${5} recommendations ranked 1..5. Use the recommend_vendors tool.`,
  );
  return lines.join("\n");
}

// ── Heuristic fallback (no API key or SDK unavailable) ─────────────────────

function heuristicPicks(
  ctx: RecommendationRequestContext,
  catalog: Vendor[],
): Array<{ vendor_id: string; rank: number; reason: string; match_signals: string[] }> {
  const dismissed = new Set([
    ...ctx.dismissed_vendor_ids,
    ...ctx.thumbs_down_vendor_ids,
  ]);
  const scored = catalog
    .filter((v) => !dismissed.has(v.id))
    .map((v) => {
      let score = 0;
      const signals: string[] = [];
      // Style keyword overlap
      for (const k of ctx.style_keywords) {
        if (
          v.style_tags.some((t) => t.toLowerCase().includes(k.toLowerCase()))
        ) {
          score += 3;
          signals.push(`${k} match`);
        }
      }
      if (signals.length > 3) signals.length = 3;
      // Location
      if (
        ctx.primary_location &&
        v.location?.toLowerCase().includes(ctx.primary_location.toLowerCase())
      ) {
        score += 2;
        signals.push(`${v.location} local`);
      }
      // Rating
      if (v.rating) score += v.rating;
      // Thumbs-up neighbor: same style_tags as an upvoted vendor
      const upvotedVendors = catalog.filter((x) =>
        ctx.thumbs_up_vendor_ids.includes(x.id),
      );
      for (const up of upvotedVendors) {
        const overlap = v.style_tags.filter((t) => up.style_tags.includes(t));
        if (overlap.length) {
          score += 1;
          if (signals.length < 3)
            signals.push(`style overlap with ${up.name}`);
        }
      }
      return { vendor: v, score, signals };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  return scored.map((s, i) => ({
    vendor_id: s.vendor.id,
    rank: i + 1,
    reason:
      s.signals.length > 0
        ? `Matches on ${s.signals.slice(0, 2).join(" and ")}${s.vendor.location ? `; based in ${s.vendor.location}` : ""}.`
        : `Available photographer with ${s.vendor.rating ? `${s.vendor.rating.toFixed(1)}★ rating` : "catalog entry"}${s.vendor.location ? ` in ${s.vendor.location}` : ""}.`,
    match_signals:
      s.signals.length > 0
        ? s.signals
        : [
            s.vendor.style_tags.slice(0, 2).join(" / ") || "style",
            formatPriceShort(s.vendor.price_display),
          ],
  }));
}

// ── Route handler ──────────────────────────────────────────────────────────

export async function POST(req: Request) {
  const body = (await req.json()) as {
    wedding_id: string;
    category: VendorCategory;
    limit?: number;
    force_refresh?: boolean;
    context: RecommendationRequestContext;
  };

  const { wedding_id, category, context } = body;
  if (!wedding_id || !category || !context) {
    return NextResponse.json(
      { error: "wedding_id, category, and context are required" },
      { status: 400 },
    );
  }

  const catalog = await pickVendorCatalogFor(category);
  if (catalog.length === 0) {
    return NextResponse.json({
      recommendations: [],
      context_hash: hashContext(context),
      from_cache: false,
    } satisfies RecommendationAPIResponse);
  }

  const context_hash = hashContext(context);
  const apiKey = process.env.ANTHROPIC_API_KEY;

  // ── No key / no SDK → heuristic path ─────────────────────────────────────
  if (!apiKey) {
    const picks = heuristicPicks(context, catalog);
    return NextResponse.json({
      recommendations: picks.map<VendorRecommendation>((p, idx) => ({
        id: `rec-${Date.now()}-${idx}`,
        wedding_id,
        category,
        vendor_id: p.vendor_id,
        rank: p.rank,
        reason: p.reason,
        match_signals: p.match_signals,
        generated_at: new Date().toISOString(),
        model: "heuristic",
        context_hash,
      })),
      context_hash,
      from_cache: false,
    } satisfies RecommendationAPIResponse);
  }

  // ── Claude call ──────────────────────────────────────────────────────────
  try {
    // Dynamic + typed-as-unknown so the route typechecks before the SDK is
    // installed. Runtime still throws when the package is missing — caught
    // below and falls back to heuristic.
    // but a fresh checkout without `npm install` should still typecheck.
    const mod = (await import("@anthropic-ai/sdk")) as {
      default: new (opts: { apiKey: string }) => AnthropicClient;
    };
    const client = new mod.default({ apiKey });

    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 1500,
      system: [
        {
          type: "text",
          text: SYSTEM_PROMPT,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: STATIC_RUBRIC,
              cache_control: { type: "ephemeral" },
            },
            {
              type: "text",
              text: `## Vendor catalog\n${catalogToPromptJson(catalog)}`,
              cache_control: { type: "ephemeral" },
            },
            { type: "text", text: coupleContextToPrompt(context) },
          ],
        },
      ],
      tools: [TOOL_DEFINITION],
      tool_choice: { type: "tool", name: "recommend_vendors" },
    });

    const toolUse = response.content.find(
      (b: MessageContentBlock): b is Extract<MessageContentBlock, { type: "tool_use" }> =>
        b.type === "tool_use",
    );
    if (!toolUse) {
      throw new Error("Model did not call the recommend_vendors tool");
    }

    const input = toolUse.input as {
      recommendations: Array<{
        vendor_id: string;
        rank: number;
        reason: string;
        match_signals: string[];
      }>;
    };

    // Server-side filter: strip dismissals/thumbs-downs one more time to be
    // resilient to model mistakes. Also clamp to vendors that actually exist.
    const dismissed = new Set([
      ...context.dismissed_vendor_ids,
      ...context.thumbs_down_vendor_ids,
    ]);
    const catalogIds = new Set(catalog.map((v) => v.id));
    const filtered = input.recommendations
      .filter((r) => !dismissed.has(r.vendor_id) && catalogIds.has(r.vendor_id))
      .slice(0, body.limit ?? 5);

    const results: VendorRecommendation[] = filtered.map((r, idx) => ({
      id: `rec-${Date.now()}-${idx}`,
      wedding_id,
      category,
      vendor_id: r.vendor_id,
      rank: idx + 1,
      reason: r.reason,
      match_signals: r.match_signals,
      generated_at: new Date().toISOString(),
      model: MODEL,
      context_hash,
    }));

    return NextResponse.json({
      recommendations: results,
      context_hash,
      from_cache: false,
    } satisfies RecommendationAPIResponse);
  } catch (err) {
    // SDK missing or API failure — fall back to heuristic so the UI survives.
    const picks = heuristicPicks(context, catalog);
    return NextResponse.json({
      recommendations: picks.map<VendorRecommendation>((p, idx) => ({
        id: `rec-${Date.now()}-${idx}`,
        wedding_id,
        category,
        vendor_id: p.vendor_id,
        rank: p.rank,
        reason: p.reason,
        match_signals: p.match_signals,
        generated_at: new Date().toISOString(),
        model: "heuristic",
        context_hash,
      })),
      context_hash,
      from_cache: false,
      // @ts-expect-error — internal-only debug hint
      _fallback_reason: err instanceof Error ? err.message : String(err),
    } satisfies RecommendationAPIResponse);
  }
}
