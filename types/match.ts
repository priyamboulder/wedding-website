// ──────────────────────────────────────────────────────────────────────────
// Match Me tool — input + result row shapes (mirrors migration 0023).
//
// The matcher reuses the existing BudgetLocationRow as its destination
// universe; only the wire types for the conversational flow + the saved
// run rows live here.
// ──────────────────────────────────────────────────────────────────────────

export type PrioritySlug =
  | "scenic_beauty"
  | "cultural_immersion"
  | "convenient_for_indians"
  | "indian_vendors"
  | "exclusivity"
  | "beach"
  | "mountain"
  | "heritage"
  | "food_scene"
  | "nightlife";

export type DealbreakerSlug =
  | "long_flights"
  | "visa_hassles"
  | "no_beach"
  | "not_in_india"
  | "not_outside_us"
  | "limited_indian_vendors";

export interface MatchInputs {
  budget: number;
  guests: number;
  priorities: PrioritySlug[];
  dealbreakers: DealbreakerSlug[];
}

export interface MatchReason {
  // Short editorial-voice bullet shown on the destination card.
  text: string;
  // Drives the icon swatch on the bullet — algorithm provenance.
  kind: "budget" | "capacity" | "priority" | "geo" | "vendor" | "soft";
}

export interface MatchedDestination {
  slug: string;
  name: string;
  country: string | null;
  continent: string | null;
  tagline: string;
  hero_image_url: string | null;
  multiplier: number;
  min_budget_usd: number;
  max_capacity: number;
  tags: string[];
  // Fit score 0..100. Anything < 40 is considered a non-match and hidden
  // from the editorial spread. The internal threshold is enforced in
  // scoring.ts so callers don't all have to remember it.
  score: number;
  reasons: MatchReason[];
}

export interface MatchResultPayload {
  inputs: MatchInputs;
  matches: MatchedDestination[];
  generatedAt: string;
}

// Saved run row (mirrors tool_match_results in migration 0023).
export interface ToolMatchResultRow {
  id: string;
  user_id: string | null;
  anonymous_token: string | null;
  email: string | null;
  inputs: MatchInputs;
  results: Array<{ slug: string; score: number; reasons: MatchReason[] }>;
  source: string;
  created_at: string;
}

// What the deep-dive endpoint streams back. Same envelope as draft-rsvp:
// always returns ok=true with a heuristic when ANTHROPIC_API_KEY is missing.
export interface MatchDeepDiveRequest {
  inputs: MatchInputs;
  matches: Array<Pick<MatchedDestination, "slug" | "name" | "score" | "reasons">>;
}

export interface MatchDeepDiveResponse {
  ok: boolean;
  analysis?: string;
  model?: string;
  error?: string;
}
