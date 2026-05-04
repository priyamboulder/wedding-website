// ──────────────────────────────────────────────────────────────────────────
// Marigold AI Advisor — shared request/response shapes for the three
// account-walled AI features (budget recommendations, destination analyst,
// vendor matchmaker). Server lives at /api/tools/ai.
// ──────────────────────────────────────────────────────────────────────────

import type { BudgetTier } from "@/types/budget";

// ── Request envelope ──────────────────────────────────────────────────────

export type AiAdvisorAction = "budget" | "destination" | "vendor";

export interface AiBudgetEventInput {
  slug: string;
  name: string;
  guestCount: number;
  subtotal: number;
  vendors: Array<{ category: string; tier: BudgetTier; cost: number }>;
}

export interface AiBudgetRequest {
  action: "budget";
  // Where the wedding's happening — locks regional vendor & price context.
  locationName: string;
  locationSlug: string;
  cultureName: string | null;
  cultureSlug: string | null;
  totalBudget: number | null;
  grandTotal: number;
  globalTier: BudgetTier;
  events: AiBudgetEventInput[];
  weddingWideVendors: Array<{ category: string; tier: BudgetTier; cost: number }>;
  weddingWideAddons: Array<{ name: string; cost: number }>;
}

export interface AiDestinationRequest {
  action: "destination";
  inputs: {
    budget: number;
    guests: number;
    priorities: string[];
    dealbreakers: string[];
  };
  matches: Array<{
    slug: string;
    name: string;
    score: number;
    tagline?: string | null;
    tags?: string[];
    reasons: Array<{ text: string; kind: string }>;
  }>;
}

export interface AiVendorRequest {
  action: "vendor";
  locationName: string;
  locationSlug: string;
  categoryName: string;
  categorySlug: string;
  totalBudget: number | null;
  preferredTier: BudgetTier | null;
  vendors: Array<{
    id: string;
    name: string;
    tagline?: string | null;
    homeBase?: string | null;
    travelsGlobally: boolean;
    tierMatch: string[];
    capacityMin?: number | null;
    capacityMax?: number | null;
    verified: boolean;
    placementTier: string;
    priceLowUsd: number | null;
    priceHighUsd: number | null;
  }>;
}

export type AiAdvisorRequest =
  | AiBudgetRequest
  | AiDestinationRequest
  | AiVendorRequest;

// ── Response envelope ─────────────────────────────────────────────────────

export interface AiBudgetSuggestion {
  // Short eyebrow above the recommendation, e.g. "save ~$18K".
  eyebrow: string;
  // The recommendation itself — 1–2 sentences in Marigold voice.
  body: string;
  // "savings" when over-budget, "upgrade" when under, "neutral" otherwise.
  kind: "savings" | "upgrade" | "neutral";
  // Approximate dollar impact (positive = saves money / upgrade cost).
  impactUsd?: number | null;
}

export interface AiBudgetResponse {
  ok: true;
  action: "budget";
  // Editorial framing line — "you're $24K over your $300K target — here's
  // where the fat is."
  headline: string;
  suggestions: AiBudgetSuggestion[];
  model: string;
}

export interface AiDestinationResponse {
  ok: true;
  action: "destination";
  // 1–2 paragraph editorial analysis.
  analysis: string;
  // Personality match line, e.g. "You sound like a Lake Como bride."
  personality: string;
  // Optional wild card the algorithm didn't pick.
  wildCard?: {
    name: string;
    reason: string;
  } | null;
  model: string;
}

export interface AiVendorRecommendation {
  vendorId: string;
  vendorName: string;
  // 2–3 sentence reasoning.
  reasoning: string;
  // Honest tradeoff or caveat ("books up 18 months out").
  tradeoff?: string | null;
}

export interface AiVendorResponse {
  ok: true;
  action: "vendor";
  // Editorial intro line ("for a punjabi wedding in Goa, here's the read…").
  intro: string;
  picks: AiVendorRecommendation[];
  model: string;
}

export interface AiAdvisorErrorResponse {
  ok: false;
  error: string;
  // "auth_required" — show signup; "rate_limited" — show retry copy;
  // "service" — generic chai-break copy.
  code?: "auth_required" | "rate_limited" | "service" | "bad_request";
}

export type AiAdvisorResponse =
  | AiBudgetResponse
  | AiDestinationResponse
  | AiVendorResponse
  | AiAdvisorErrorResponse;

// ── UI display constants ──────────────────────────────────────────────────

export const AI_DISCLAIMER =
  "AI recommendations are starting points — your planner and your gut still get the final word.";

export const AI_BADGE_LABEL = "✦ Marigold AI";

export const AI_LOADING_PHRASES: readonly string[] = [
  "crunching the numbers…",
  "consulting the aunties…",
  "asking the pandit…",
  "running it past the wedding gods…",
  "lighting the diya for clarity…",
];

export const AI_ERROR_COPY =
  "our AI advisor is taking a chai break — try again in a moment.";
