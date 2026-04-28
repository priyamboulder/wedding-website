// ── The Real Numbers — crowdsourced wedding cost data ────────────────────
// Brides share anonymized cost breakdowns from the Post-Wedding module;
// planning brides browse them in Community → Brides → The Real Numbers.
// Persists to localStorage via Zustand (see stores/real-numbers-store.ts).
// Monetary values are integer cents (USD) to match the finance module.

import type { WorkspaceCategorySlug } from "./workspace";

// ── Cultural tradition & style tags ───────────────────────────────────────
export type CulturalTradition =
  | "south_asian"
  | "western"
  | "east_asian"
  | "middle_eastern"
  | "african"
  | "latin_american"
  | "fusion"
  | "other";

export const CULTURAL_TRADITION_LABEL: Record<CulturalTradition, string> = {
  south_asian: "South Asian",
  western: "Western",
  east_asian: "East Asian",
  middle_eastern: "Middle Eastern",
  african: "African",
  latin_american: "Latin American",
  fusion: "Fusion",
  other: "Other",
};

export type WeddingStyle =
  | "modern"
  | "classic"
  | "traditional"
  | "intimate"
  | "grand"
  | "bohemian"
  | "minimalist"
  | "luxury";

export const WEDDING_STYLE_LABEL: Record<WeddingStyle, string> = {
  modern: "Modern",
  classic: "Classic",
  traditional: "Traditional",
  intimate: "Intimate",
  grand: "Grand",
  bohemian: "Bohemian",
  minimalist: "Minimalist",
  luxury: "Luxury",
};

// ── Worth-it sentiment per category ──────────────────────────────────────
export type WorthIt = "absolutely" | "fair" | "overpaid" | "skip_next_time";

export const WORTH_IT_LABEL: Record<WorthIt, string> = {
  absolutely: "Absolutely worth it",
  fair: "Fair",
  overpaid: "Overpaid",
  skip_next_time: "Skip next time",
};

// ── Cost submission (one per wedding) ────────────────────────────────────
export interface CostSubmission {
  id: string;

  // Wedding context (all publicly visible)
  wedding_city: string;
  wedding_state: string;
  wedding_country: string; // default "US"
  wedding_month: number; // 1-12
  wedding_year: number;
  guest_count: number;
  wedding_style: WeddingStyle[];
  cultural_tradition: CulturalTradition[];
  wedding_duration_days: number;
  number_of_events: number;

  // Totals (integer cents, USD)
  total_budget_cents: number;
  total_actual_cents: number;

  // Optional advice shown publicly but anonymously
  advice_text: string;

  // Publish state
  is_published: boolean;
  published_at: string | null;
  auto_populated: boolean;
  manually_adjusted: boolean;

  // Engagement
  helpful_count: number;

  // Meta
  created_at: string;
  updated_at: string;
}

// ── Category-level cost item ─────────────────────────────────────────────
export interface CostItem {
  id: string;
  submission_id: string;

  // Matches workspace finance categories so auto-populate can round-trip.
  vendor_category: WorkspaceCategorySlug | string;

  budgeted_cents: number | null;
  actual_cents: number;

  vendor_count: number;
  includes_tip: boolean;
  notes: string;
  worth_it: WorthIt | null;

  created_at: string;
}

// ── Filters used across browse views ─────────────────────────────────────
export interface CostFilterState {
  city: string; // "" for any
  guest_count_range: GuestCountBucket | "any";
  styles: WeddingStyle[];
  cultures: CulturalTradition[];
  year_min: number | null;
  year_max: number | null;
  events_range: EventsBucket | "any";
}

export type GuestCountBucket =
  | "under_50"
  | "50_100"
  | "100_200"
  | "200_350"
  | "350_500"
  | "500_plus";

export const GUEST_COUNT_BUCKET_DEF: {
  id: GuestCountBucket;
  label: string;
  min: number;
  max: number; // inclusive upper bound; use Infinity sentinel for 500+
}[] = [
  { id: "under_50", label: "Under 50", min: 0, max: 49 },
  { id: "50_100", label: "50–100", min: 50, max: 100 },
  { id: "100_200", label: "100–200", min: 101, max: 200 },
  { id: "200_350", label: "200–350", min: 201, max: 350 },
  { id: "350_500", label: "350–500", min: 351, max: 500 },
  { id: "500_plus", label: "500+", min: 501, max: Number.MAX_SAFE_INTEGER },
];

export type EventsBucket = "single" | "two_three" | "four_five" | "six_plus";

export const EVENTS_BUCKET_DEF: {
  id: EventsBucket;
  label: string;
  min: number;
  max: number;
}[] = [
  { id: "single", label: "1 event", min: 1, max: 1 },
  { id: "two_three", label: "2–3", min: 2, max: 3 },
  { id: "four_five", label: "4–5", min: 4, max: 5 },
  { id: "six_plus", label: "6+", min: 6, max: Number.MAX_SAFE_INTEGER },
];

export const MIN_SUBMISSIONS_FOR_AGGREGATE = 5;
export const MIN_SUBMISSIONS_FOR_DEEP_DIVE = 10;

// ── Store shape ───────────────────────────────────────────────────────────
export interface RealNumbersState {
  submissions: CostSubmission[];
  items: CostItem[];
  // Votes keyed by submission id. One vote per local "user" — we only have
  // a single bride on-device, so this is effectively "have I upvoted this".
  helpfulVotes: Record<string, boolean>;
  // The current bride's submission id, if she's contributed. Lets the UI
  // show "edit my submission" vs. the blank invitation.
  mySubmissionId: string | null;
  // Has the feature been populated with its seed dataset yet?
  seeded: boolean;
}
