// ──────────────────────────────────────────────────────────────────────────
// POST /api/tools/ai
//
// The Marigold AI advisor — three account-walled features behind one route:
//   • budget       → personalized over/under recommendations
//   • destination  → editorial analysis of top Match Me results
//   • vendor       → matchmaker over the actual vendor list for a category
//
// Auth required (Bearer JWT). Rate-limited to 5 calls / user / hour. All
// Anthropic calls happen here — never on the client.
// ──────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";

import { getAuthUser } from "@/lib/supabase/auth-helpers";
import type {
  AiAdvisorErrorResponse,
  AiAdvisorRequest,
  AiBudgetRequest,
  AiBudgetResponse,
  AiBudgetSuggestion,
  AiDestinationRequest,
  AiDestinationResponse,
  AiVendorRecommendation,
  AiVendorRequest,
  AiVendorResponse,
} from "@/types/ai-advisor";
import { checkRateLimit, getClientIp } from "@/lib/api/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 45;

// Single source of truth for the model. The default Sonnet at time of
// writing — change here and every advisor follows.
const MODEL = process.env.MARIGOLD_AI_MODEL ?? "claude-sonnet-4-5";

// ── Anthropic client typing ───────────────────────────────────────────────

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

// ── Rate limiting ─────────────────────────────────────────────────────────
// In-memory bucket, 5 calls per user per rolling hour. Resets on cold
// boot — that's fine for an advisor surface, the floor is generous.

const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const RATE_LIMIT_MAX = 5;

const rateLimitBuckets = new Map<string, number[]>();

function isRateLimited(userId: string): boolean {
  const now = Date.now();
  const cutoff = now - RATE_LIMIT_WINDOW_MS;
  const bucket = (rateLimitBuckets.get(userId) ?? []).filter(
    (ts) => ts > cutoff,
  );
  if (bucket.length >= RATE_LIMIT_MAX) {
    rateLimitBuckets.set(userId, bucket);
    return true;
  }
  bucket.push(now);
  rateLimitBuckets.set(userId, bucket);
  return false;
}

// ── Shared system prompt (cached on the model) ────────────────────────────

const SYSTEM_PROMPT = `You are the Marigold AI advisor for The Marigold, a wedding planning platform built specifically for Indian weddings. You have deep expertise across all Indian wedding cultures (Punjabi/Sikh, Gujarati, South Indian, Bengali, Muslim, Christian Indian, Interfaith). You understand multi-event structures, per-event guest count variations, the real costs of importing vendors to destination weddings, and the difference between what wedding blogs say things cost and what they actually cost.

Your tone is warm, specific, practical — like the smartest older cousin who's planned three weddings and knows every vendor in town. Never be generic. Always reference specific vendor categories, cultural traditions, realistic price points, and the user's actual data. Use The Marigold's editorial voice: em dashes, lowercase headers, occasional humor, no corporate-speak.

Never recommend a vendor by name unless that vendor was provided in the input data. Never make up prices — if you don't have data, give ranges and say "starting around $X — depends on the package."`;

// ── Tool definitions for structured output ────────────────────────────────

const BUDGET_TOOL = {
  name: "return_budget_plan",
  description:
    "Return the editorial headline plus 4–6 specific budget recommendations.",
  input_schema: {
    type: "object" as const,
    properties: {
      headline: {
        type: "string",
        description:
          "One-sentence editorial framing of where the user stands (e.g. '$24K over your $300K target — here's where the fat is.'). Lowercase. Under 18 words.",
      },
      suggestions: {
        type: "array",
        minItems: 4,
        maxItems: 6,
        items: {
          type: "object",
          properties: {
            eyebrow: {
              type: "string",
              description:
                "Short label, e.g. 'save ~$18K' or 'upgrade pick'. Lowercase.",
            },
            body: {
              type: "string",
              description:
                "1–2 sentences, Marigold voice, specific to the user's data.",
            },
            kind: {
              type: "string",
              enum: ["savings", "upgrade", "neutral"],
            },
            impactUsd: {
              type: "number",
              description: "Approximate dollar impact, positive integer.",
            },
          },
          required: ["eyebrow", "body", "kind"],
        },
      },
    },
    required: ["headline", "suggestions"],
  },
};

const DESTINATION_TOOL = {
  name: "return_destination_analysis",
  description:
    "Return an editorial destination analysis plus a personality match and one wild card.",
  input_schema: {
    type: "object" as const,
    properties: {
      analysis: {
        type: "string",
        description:
          "1–2 paragraphs of specific editorial analysis explaining why these destinations fit her. No markdown, no headings.",
      },
      personality: {
        type: "string",
        description:
          "One-line personality match, e.g. 'you sound like a Lake Como bride — here's why.'",
      },
      wildCardName: {
        type: "string",
        description:
          "A destination she didn't pick that might surprise her. Optional.",
      },
      wildCardReason: {
        type: "string",
        description:
          "1–2 sentence reason why the wild card might land. Required if wildCardName is set.",
      },
    },
    required: ["analysis", "personality"],
  },
};

const VENDOR_TOOL = {
  name: "return_vendor_picks",
  description:
    "Pick the 2–3 best vendors from the provided list. Never invent vendors.",
  input_schema: {
    type: "object" as const,
    properties: {
      intro: {
        type: "string",
        description:
          "One-line editorial intro framing the recommendation. Lowercase. Under 22 words.",
      },
      picks: {
        type: "array",
        minItems: 2,
        maxItems: 3,
        items: {
          type: "object",
          properties: {
            vendorId: {
              type: "string",
              description: "Must match an id from the provided vendor list.",
            },
            reasoning: {
              type: "string",
              description: "2–3 sentences why this vendor fits her specifically.",
            },
            tradeoff: {
              type: "string",
              description:
                "Honest tradeoff/caveat — books up early, more expensive, etc. Optional.",
            },
          },
          required: ["vendorId", "reasoning"],
        },
      },
    },
    required: ["intro", "picks"],
  },
};

// ── Heuristic fallbacks (used when key missing or call fails) ────────────

function heuristicBudget(req: AiBudgetRequest): AiBudgetResponse {
  const over = req.totalBudget != null ? req.grandTotal - req.totalBudget : 0;
  const suggestions: AiBudgetSuggestion[] = [];

  if (over > 0) {
    suggestions.push({
      eyebrow: `save ~$${Math.round(Math.abs(over) * 0.3 / 1000)}k`,
      body: "Drop the smaller events (mehndi, haldi) one tier — most guests won't notice the décor change but the line goes down fast.",
      kind: "savings",
      impactUsd: Math.round(Math.abs(over) * 0.3),
    });
    suggestions.push({
      eyebrow: "save ~$6k",
      body: "Go digital-first on invitations — print only the hero day. The aunties get the WhatsApp version anyway.",
      kind: "savings",
      impactUsd: 6000,
    });
    suggestions.push({
      eyebrow: "rethink",
      body: "Trim the addons before you trim the events — uplighting and a photobooth read luxury but cost less than a tier upgrade.",
      kind: "neutral",
    });
    suggestions.push({
      eyebrow: "leave alone",
      body: "Photography is the one thing you'll relive — keep the tier you picked even if the math is tight.",
      kind: "neutral",
    });
  } else if (over < 0) {
    suggestions.push({
      eyebrow: "upgrade pick",
      body: "Bump photography up a tier — you'll watch this video twenty times in five years.",
      kind: "upgrade",
      impactUsd: Math.abs(over) * 0.2,
    });
    suggestions.push({
      eyebrow: "the splurge",
      body: "Add a dhol troupe for the baraat — guests talk about it for years, and the line item barely registers at this budget.",
      kind: "upgrade",
      impactUsd: 4000,
    });
    suggestions.push({
      eyebrow: "guest gift",
      body: "Use the headroom on welcome bags or late-night chai service — small spend, huge memory.",
      kind: "upgrade",
    });
    suggestions.push({
      eyebrow: "the hold",
      body: "Resist over-tiering across every category — better to splurge specifically than spread the headroom thin.",
      kind: "neutral",
    });
  } else {
    suggestions.push({
      eyebrow: "right on the line",
      body: "Your numbers map cleanly. Keep a 5–8% contingency — Indian weddings always grow by the week.",
      kind: "neutral",
    });
    suggestions.push({
      eyebrow: "watch",
      body: "Catering tends to creep with last-minute headcount — confirm the per-plate buffer before locking the contract.",
      kind: "neutral",
    });
  }

  const headline =
    over > 0
      ? `you're ~$${Math.round(over / 1000)}k over your $${Math.round((req.totalBudget ?? 0) / 1000)}k target — here's where the fat is.`
      : over < 0
        ? `you have ~$${Math.round(Math.abs(over) / 1000)}k of headroom — spend it on the moments, not the line items.`
        : `the numbers line up — protect the contingency before anything else.`;

  return {
    ok: true,
    action: "budget",
    headline,
    suggestions,
    model: "offline",
  };
}

function heuristicDestination(req: AiDestinationRequest): AiDestinationResponse {
  const top = req.matches[0];
  const second = req.matches[1];
  const wild = req.matches[3] ?? req.matches[2] ?? null;
  const analysis = top
    ? `${top.name} sits at the top because the algorithm sees the budget-to-headcount ratio you gave — $${Math.round(req.inputs.budget / 1000)}k for ${req.inputs.guests} — landing inside the venue scene's comfort zone, not the stretch. ${second ? `${second.name} runs a close second; the vibe is comparable but the travel logistics or the local vendor depth tip slightly differently.` : ""}\n\nWhat to actually watch: at this size in this destination, the marquee venues book 14–18 months out. The dates are negotiable. The destination, for your priorities, isn't.`
    : "Your filters narrowed the field — try removing one dealbreaker and the spread opens up considerably.";
  const personality = top
    ? `you sound like a ${top.name} bride — the priorities you picked map to her, not to the resort-package alternative.`
    : "your priorities are pulling in two directions — pick the one that's load-bearing and let the others flex.";
  return {
    ok: true,
    action: "destination",
    analysis,
    personality,
    wildCard: wild
      ? {
          name: wild.name,
          reason: `worth a second look — it scored ${wild.score}% on the algorithm and matches more of your priorities than the obvious top-three logic suggests.`,
        }
      : null,
    model: "offline",
  };
}

function heuristicVendor(req: AiVendorRequest): AiVendorResponse {
  const top = req.vendors.slice(0, 3);
  const picks: AiVendorRecommendation[] = top.slice(0, Math.min(2, top.length)).map((v, i) => ({
    vendorId: v.id,
    vendorName: v.name,
    reasoning:
      i === 0
        ? `${v.name} is the move for your numbers — the tier match lines up and the placement signal says they're trusted to deliver this size of event.`
        : `${v.name} is the runner-up — comparable on quality, often more available on dates inside the next 12 months.`,
    tradeoff:
      i === 0
        ? "books up 12–18 months out for the marquee dates, so flexibility on the timeline matters."
        : null,
  }));
  return {
    ok: true,
    action: "vendor",
    intro: `for ${req.categoryName.toLowerCase()} in ${req.locationName.toLowerCase()}, here's the honest read on the shortlist.`,
    picks,
    model: "offline",
  };
}

// ── Per-action user-context builders ──────────────────────────────────────

function fmtUSD(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1000) return `$${Math.round(n / 1000)}K`;
  return `$${n}`;
}

function buildBudgetContext(req: AiBudgetRequest): string {
  const lines: string[] = [];
  lines.push("USER BUDGET PLAN");
  lines.push(`Location: ${req.locationName}`);
  if (req.cultureName) lines.push(`Culture: ${req.cultureName}`);
  lines.push(`Default tier: ${req.globalTier}`);
  lines.push(`Grand total: ${fmtUSD(req.grandTotal)}`);
  if (req.totalBudget != null) {
    const diff = req.grandTotal - req.totalBudget;
    lines.push(
      `Target: ${fmtUSD(req.totalBudget)} (${diff > 0 ? `${fmtUSD(Math.abs(diff))} OVER` : diff < 0 ? `${fmtUSD(Math.abs(diff))} UNDER` : "on target"})`,
    );
  } else {
    lines.push("Target: not set");
  }
  lines.push("");
  lines.push("EVENTS:");
  for (const e of req.events) {
    lines.push(`- ${e.name} (${e.guestCount} guests, ${fmtUSD(e.subtotal)}):`);
    for (const v of e.vendors) {
      lines.push(`    · ${v.category} @ ${v.tier} — ${fmtUSD(v.cost)}`);
    }
  }
  if (req.weddingWideVendors.length > 0) {
    lines.push("");
    lines.push("WEDDING-WIDE:");
    for (const v of req.weddingWideVendors) {
      lines.push(`- ${v.category} @ ${v.tier} — ${fmtUSD(v.cost)}`);
    }
  }
  if (req.weddingWideAddons.length > 0) {
    lines.push("");
    lines.push("ADD-ONS:");
    for (const a of req.weddingWideAddons) {
      lines.push(`- ${a.name} — ${fmtUSD(a.cost)}`);
    }
  }
  lines.push("");
  lines.push(
    "Return 4–6 specific recommendations via return_budget_plan. If they're OVER, name dollar-impact savings. If they're UNDER, name high-impact upgrades. Always reference their actual events, tiers, and culture — never generic advice.",
  );
  return lines.join("\n");
}

function buildDestinationContext(req: AiDestinationRequest): string {
  const lines: string[] = [];
  lines.push("HER MATCH ME INPUTS");
  lines.push(`- Budget: ${fmtUSD(req.inputs.budget)}`);
  lines.push(`- Largest event: ${req.inputs.guests} guests`);
  lines.push(
    `- Priorities: ${req.inputs.priorities.length === 0 ? "none specified" : req.inputs.priorities.join(", ")}`,
  );
  lines.push(
    `- Dealbreakers: ${req.inputs.dealbreakers.length === 0 ? "none" : req.inputs.dealbreakers.join(", ")}`,
  );
  lines.push("");
  lines.push("ALGORITHMIC TOP MATCHES (in rank order):");
  for (const m of req.matches.slice(0, 5)) {
    const reasons = m.reasons.map((r) => r.text).join(" / ");
    const tags = (m.tags ?? []).join(", ");
    lines.push(
      `- ${m.name} (${m.score}% fit). Reasons: ${reasons || "—"}.${tags ? ` Tags: ${tags}.` : ""}`,
    );
  }
  lines.push("");
  lines.push(
    "Return analysis via return_destination_analysis: 1–2 paragraph editorial read of why these specific destinations fit HER (not generic), one personality match line, and optionally one wild-card pick from outside the algorithmic top-3 if you see one that might surprise her.",
  );
  return lines.join("\n");
}

function buildVendorContext(req: AiVendorRequest): string {
  const lines: string[] = [];
  lines.push(`CATEGORY: ${req.categoryName}`);
  lines.push(`LOCATION: ${req.locationName}`);
  if (req.preferredTier) lines.push(`PREFERRED TIER: ${req.preferredTier}`);
  if (req.totalBudget != null) lines.push(`TOTAL BUDGET: ${fmtUSD(req.totalBudget)}`);
  lines.push("");
  lines.push("AVAILABLE VENDORS (pick from this list ONLY):");
  for (const v of req.vendors) {
    const range =
      v.priceLowUsd != null && v.priceHighUsd != null
        ? ` price ~${fmtUSD(v.priceLowUsd)}–${fmtUSD(v.priceHighUsd)}`
        : "";
    const cap =
      v.capacityMin && v.capacityMax
        ? ` capacity ${v.capacityMin}–${v.capacityMax}`
        : "";
    const tags: string[] = [];
    if (v.verified) tags.push("verified");
    if (v.placementTier && v.placementTier !== "standard") tags.push(v.placementTier);
    if (v.travelsGlobally) tags.push("travels");
    lines.push(
      `- [${v.id}] ${v.name}${v.tagline ? ` — ${v.tagline}` : ""}${v.homeBase ? ` (based ${v.homeBase})` : ""}. tiers: ${v.tierMatch.join(",") || "—"}.${cap}.${range}.${tags.length ? ` ${tags.join(", ")}.` : ""}`,
    );
  }
  lines.push("");
  lines.push(
    "Return your top 2–3 picks via return_vendor_picks. Use the bracketed [id] values exactly. Never invent a vendor. Each pick needs reasoning specific to the user's data and an honest tradeoff if there is one.",
  );
  return lines.join("\n");
}

// ── Action dispatch ───────────────────────────────────────────────────────

async function runBudget(
  client: AnthropicClient | null,
  req: AiBudgetRequest,
): Promise<AiBudgetResponse> {
  if (!client) return heuristicBudget(req);
  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 2200,
      tools: [BUDGET_TOOL],
      tool_choice: { type: "tool", name: "return_budget_plan" },
      system: [
        { type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } },
      ],
      messages: [{ role: "user", content: buildBudgetContext(req) }],
    });
    const block = response.content.find(
      (b): b is { type: "tool_use"; name: string; input: unknown } =>
        b.type === "tool_use" && b.name === "return_budget_plan",
    );
    if (!block) return heuristicBudget(req);
    const input = block.input as {
      headline?: string;
      suggestions?: AiBudgetSuggestion[];
    };
    if (
      !input.headline ||
      !Array.isArray(input.suggestions) ||
      input.suggestions.length === 0
    ) {
      return heuristicBudget(req);
    }
    return {
      ok: true,
      action: "budget",
      headline: input.headline,
      suggestions: input.suggestions,
      model: MODEL,
    };
  } catch {
    return heuristicBudget(req);
  }
}

async function runDestination(
  client: AnthropicClient | null,
  req: AiDestinationRequest,
): Promise<AiDestinationResponse> {
  if (!client || req.matches.length === 0) return heuristicDestination(req);
  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 1500,
      tools: [DESTINATION_TOOL],
      tool_choice: { type: "tool", name: "return_destination_analysis" },
      system: [
        { type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } },
      ],
      messages: [{ role: "user", content: buildDestinationContext(req) }],
    });
    const block = response.content.find(
      (b): b is { type: "tool_use"; name: string; input: unknown } =>
        b.type === "tool_use" && b.name === "return_destination_analysis",
    );
    if (!block) return heuristicDestination(req);
    const input = block.input as {
      analysis?: string;
      personality?: string;
      wildCardName?: string;
      wildCardReason?: string;
    };
    if (!input.analysis || !input.personality) return heuristicDestination(req);
    return {
      ok: true,
      action: "destination",
      analysis: input.analysis,
      personality: input.personality,
      wildCard:
        input.wildCardName && input.wildCardReason
          ? { name: input.wildCardName, reason: input.wildCardReason }
          : null,
      model: MODEL,
    };
  } catch {
    return heuristicDestination(req);
  }
}

async function runVendor(
  client: AnthropicClient | null,
  req: AiVendorRequest,
): Promise<AiVendorResponse> {
  if (!client || req.vendors.length === 0) return heuristicVendor(req);
  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 1500,
      tools: [VENDOR_TOOL],
      tool_choice: { type: "tool", name: "return_vendor_picks" },
      system: [
        { type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } },
      ],
      messages: [{ role: "user", content: buildVendorContext(req) }],
    });
    const block = response.content.find(
      (b): b is { type: "tool_use"; name: string; input: unknown } =>
        b.type === "tool_use" && b.name === "return_vendor_picks",
    );
    if (!block) return heuristicVendor(req);
    const input = block.input as {
      intro?: string;
      picks?: Array<{ vendorId?: string; reasoning?: string; tradeoff?: string }>;
    };
    if (!input.intro || !Array.isArray(input.picks) || input.picks.length === 0) {
      return heuristicVendor(req);
    }
    // Resolve vendor names from the request payload — never trust names
    // the model returned; only ids that map to a real vendor.
    const byId = new Map(req.vendors.map((v) => [v.id, v.name]));
    const picks: AiVendorRecommendation[] = [];
    for (const p of input.picks) {
      if (!p.vendorId || !p.reasoning) continue;
      const name = byId.get(p.vendorId);
      if (!name) continue;
      picks.push({
        vendorId: p.vendorId,
        vendorName: name,
        reasoning: p.reasoning,
        tradeoff: p.tradeoff ?? null,
      });
    }
    if (picks.length === 0) return heuristicVendor(req);
    return {
      ok: true,
      action: "vendor",
      intro: input.intro,
      picks,
      model: MODEL,
    };
  } catch {
    return heuristicVendor(req);
  }
}

// ── Route handler ─────────────────────────────────────────────────────────

function authError(): NextResponse<AiAdvisorErrorResponse> {
  return NextResponse.json<AiAdvisorErrorResponse>(
    { ok: false, error: "Sign in to use the Marigold AI advisor.", code: "auth_required" },
    { status: 401 },
  );
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
  const user = await getAuthUser(req);
  if (!user) return authError();

  if (isRateLimited(user.id)) {
    return NextResponse.json<AiAdvisorErrorResponse>(
      {
        ok: false,
        error:
          "you've hit the limit for this hour — the AI advisor will be back shortly.",
        code: "rate_limited",
      },
      { status: 429 },
    );
  }

  let body: AiAdvisorRequest;
  try {
    body = (await req.json()) as AiAdvisorRequest;
  } catch {
    return NextResponse.json<AiAdvisorErrorResponse>(
      { ok: false, error: "Invalid JSON body.", code: "bad_request" },
      { status: 400 },
    );
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  const client = apiKey ? await loadAnthropic(apiKey) : null;

  switch (body.action) {
    case "budget":
      return NextResponse.json<AiBudgetResponse>(await runBudget(client, body));
    case "destination":
      return NextResponse.json<AiDestinationResponse>(
        await runDestination(client, body),
      );
    case "vendor":
      return NextResponse.json<AiVendorResponse>(await runVendor(client, body));
    default:
      return NextResponse.json<AiAdvisorErrorResponse>(
        { ok: false, error: "Unknown action.", code: "bad_request" },
        { status: 400 },
      );
  }
}
