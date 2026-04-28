// ── Vendor recommendations (AI-driven) ──────────────────────────────────────
// Structured output from Claude Sonnet 4.6. Ranked list of vendors with
// one-sentence rationale + 2-4 match signals, plus couple-scoped feedback
// (thumbs, dismissals, notes) that tunes future refreshes.

import type { VendorCategory } from "./vendor";

export type RecommendationFeedback = "up" | "down" | "dismissed";

export interface VendorRecommendation {
  id: string;
  wedding_id: string;
  category: VendorCategory;
  vendor_id: string;             // ref into Vendor
  rank: number;                  // 1..N as returned by the model
  reason: string;                // one sentence, ≤30 words, concrete signals
  match_signals: string[];       // 2-4 short phrases pulled from couple context
  generated_at: string;          // ISO timestamp
  model: string;                 // e.g. "claude-sonnet-4-6"
  context_hash: string;          // sha-256 of input context — used for cache dedupe
  feedback?: RecommendationFeedback;
  feedback_at?: string;
  feedback_note?: string;        // free-form "why I'm interested" / "why I passed"
}

export interface RecommendationDismissal {
  wedding_id: string;
  category: VendorCategory;
  vendor_id: string;
  dismissed_at: string;
  // If the user left a reason when dismissing.
  note?: string;
}

export interface RecommendationRequestContext {
  wedding_id: string;
  category: VendorCategory;
  // User-provided couple vision:
  style_keywords: string[];
  moodboard_summary?: string;    // paragraph describing the current moodboard
  color_palette?: string[];      // hex codes from brand kit
  // Planning constraints:
  wedding_dates: { start: string; end: string } | null;
  primary_location: string | null;
  guest_count: number | null;
  budget_band: { min_cents: number; max_cents: number } | null;
  events_needing_coverage: string[];  // EventDayId[] serialized
  // Feedback signals:
  thumbs_up_vendor_ids: string[];
  thumbs_down_vendor_ids: string[];
  dismissed_vendor_ids: string[];
  shortlisted_vendor_ids: string[];
  // Task signals (optional — extra color for the model):
  open_tasks_summary?: string;
}

export interface RecommendationAPIResponse {
  recommendations: VendorRecommendation[];
  context_hash: string;
  from_cache: boolean;
}
