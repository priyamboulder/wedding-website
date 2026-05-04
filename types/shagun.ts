// ──────────────────────────────────────────────────────────────────────────
// Shagun Calculator — type definitions.
//
// Pre-auth, ungated tool that produces a culturally-calibrated USD shagun
// recommendation based on relationship, wedding context, tradition, and
// reciprocity. Two modes:
//   - guest: "how much should I give?" → single recommendation + range
//   - couple: "how much should we expect?" → tier-based total estimate
//
// Pure client-side, deterministic math.
// ──────────────────────────────────────────────────────────────────────────

export type Mode = "guest" | "couple";

export type RelationshipTier =
  | "immediate-family"
  | "close-extended-family"
  | "outer-extended-family"
  | "close-friend"
  | "good-friend"
  | "acquaintance-colleague"
  | "parents-friend-family-friend"
  | "business-relationship"
  | "non-indian-friend";

export type WeddingScale =
  | "intimate"
  | "standard"
  | "grand"
  | "mega";

export type WeddingStyle =
  | "traditional-banquet"
  | "upscale-hotel"
  | "luxury-destination"
  | "casual-backyard"
  | "destination-travel";

export type EventCount =
  | "1-event"
  | "2-3-events"
  | "full-week";

export type Tradition =
  | "north-indian"
  | "punjabi"
  | "gujarati"
  | "south-indian"
  | "bengali"
  | "marathi"
  | "muslim"
  | "sikh"
  | "jain"
  | "mixed-fusion"
  | "general";

export type Location =
  | "both-us"
  | "us-guest-india-wedding"
  | "india-guest-us-wedding"
  | "both-india";

export type ReciprocityStatus =
  | "yes-known"
  | "yes-unknown"
  | "no-first-exchange"
  | "not-applicable";

export type BudgetComfort =
  | "under-100"
  | "100-200"
  | "200-500"
  | "500-1000"
  | "1000-plus"
  | "skip";

export type AttendingAs =
  | "solo"
  | "couple"
  | "on-behalf-of-parents";

export interface GuestInputs {
  relationship: RelationshipTier;
  weddingScale: WeddingScale;
  weddingStyle: WeddingStyle;
  eventCount: EventCount;
  tradition: Tradition;
  location: Location;
  reciprocityStatus: ReciprocityStatus;
  reciprocityAmount: number | null; // USD; only meaningful when reciprocityStatus === "yes-known"
  budgetComfort: BudgetComfort;
  attendingAs: AttendingAs;
}

export interface ShagunRange {
  low: number;
  high: number;
}

export interface ShagunResult {
  recommendation: number;
  range: ShagunRange;
  // Three-to-four auspicious tiers around the recommendation.
  options: ShagunOption[];
  // Cultural explainer (2–3 sentences).
  rationale: string;
  reciprocity?: {
    floor: number;
    note: string;
  };
  budget?: {
    alternative: number;
    note: string;
  };
  notes: string[]; // edge-case messaging (couple envelope, on-behalf-of, etc.)
}

export interface ShagunOption {
  amount: number;
  label: string;
  description: string;
  isRecommended: boolean;
}

// ── Couple mode ────────────────────────────────────────────────────────────

export type CoupleTier =
  | "immediate-family"
  | "close-extended-family"
  | "outer-extended-family"
  | "close-friend"
  | "good-friend"
  | "acquaintance-colleague"
  | "parents-friend-family-friend"
  | "business-relationship";

export type CoupleTierCounts = Record<CoupleTier, number>;

export interface CoupleInputs {
  counts: CoupleTierCounts;
  weddingScale: WeddingScale;
  weddingStyle: WeddingStyle;
  tradition: Tradition;
  location: Location;
}

export interface CoupleTierEstimate {
  tier: CoupleTier;
  label: string;
  count: number;
  perGuestRange: ShagunRange;
  participation: number; // 0..1 — share of guests in this tier expected to give cash
  subtotalLow: number;
  subtotalHigh: number;
}

export interface CoupleEstimateResult {
  totalGuests: number;
  totalLow: number;
  totalHigh: number;
  byTier: CoupleTierEstimate[];
  realityCheckNote: string;
}
