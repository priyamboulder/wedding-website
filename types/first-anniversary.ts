// ── First Anniversary module types ─────────────────────────────────────────
// Non-vendor "Next Chapter" module. Five tabs — Plan & Vibe, Discover,
// Itinerary, Budget, Documents — all persisted locally via
// stores/first-anniversary-store.ts.
//
// Discovery-led, not checklist-driven: the couple already planned a wedding,
// so this module is for exploring how to celebrate year one, not managing
// tasks. The Plan & Vibe inputs feed the Discover ranking engine.

export type AnniversaryVibe =
  | "romantic_escape"
  | "adventure_together"
  | "cultural_immersion"
  | "full_relaxation"
  | "nostalgic_return"
  | "culinary_journey"
  | "celebrate_at_home";

export type CelebrationWindow =
  | "on_date"
  | "nearest_weekend"
  | "extended_trip"
  | "flexible";

export type DurationPref =
  | "evening"
  | "day_trip"
  | "weekend"
  | "extended"
  | "grand";

export type BudgetTier =
  | "simple"        // under $500
  | "treat"         // $500–$1,500
  | "all_out"       // $1,500–$5,000
  | "lifetime";     // $5,000+

export type HardNoTag =
  | "long_flights"
  | "extreme_heat"
  | "extreme_cold"
  | "crowded_tourist"
  | "requires_pto"
  | "passport_required";

export type RecommendationType = "getaway" | "at_home" | "experience";

export type RecommendationStatus =
  | "suggested"
  | "saved"
  | "selected"
  | "dismissed";

export type TimeBlock = "morning" | "afternoon" | "evening";

export type ExpenseCategory =
  | "travel"
  | "accommodations"
  | "dining"
  | "activities"
  | "gifts"
  | "other";

export type DocumentCategory =
  | "reservation"
  | "ticket"
  | "confirmation"
  | "other";

// ── Tab 1 — Plan & Vibe ────────────────────────────────────────────────────

export interface AnniversaryBasics {
  // Couple-facing label. Defaults to demo names; will be overwritten from
  // the wedding store identity in a later slice (see project_ananya memory).
  partnerOne: string;
  partnerTwo: string;
  // Free-text date — kept loose because the celebration may shift off the
  // wedding anniversary (e.g. a long-weekend that wraps the date).
  anniversaryDate: string;
  // Which anniversary this is. The field exists so the same module can
  // power 2nd, 5th, 10th etc. with different recommendation pools later.
  anniversaryNumber: number;
  celebrationWindow: CelebrationWindow | null;
  duration: DurationPref | null;
}

export interface VibeProfile {
  vibes: AnniversaryVibe[];
  budget: BudgetTier | null;
  hardNos: HardNoTag[];
  // Free text — optional signal fed into recommendation personalization
  // ("That random Sunday morning at the farmer's market…").
  thingsWeLoved: string;
  // Optional dietary or accessibility needs — free text.
  accessibilityNotes: string;
  updatedAt: string | null;
}

// ── Tab 2 — Discover (curated experience pool + scoring) ───────────────────
// The discovery library lives in lib/first-anniversary-recommendations.ts
// and is scored against VibeProfile + AnniversaryBasics. All content is
// hand-curated — no runtime fetch — so each entry carries enough metadata
// to render a magazine-style card without external data.

export interface Recommendation {
  id: string;
  type: RecommendationType;
  name: string;
  // One-line evocative hook — "Red rocks, stargazing, spa days for two".
  hook: string;
  // 2–3 hex colours painted as the card's hero gradient when no image.
  palette: string[];
  heroImage?: string;
  // Which vibes this experience aligns with (0–100 per vibe type).
  // Missing keys default to 30 — weak match.
  vibeAffinity: Partial<Record<AnniversaryVibe, number>>;
  // Budget tiers that comfortably fit. Near-miss tiers get partial credit.
  budgetFit: BudgetTier[];
  // 3–4 highlight chips for the card.
  activityHighlights: string[];
  // Estimated cost range in USD per trip (not per person — anniversary is
  // almost always for two). `[min, max]`.
  estCostUsd: Partial<Record<BudgetTier, [number, number]>>;
  // Optional weather/timing note — rendered with thermometer icon.
  weatherNote?: string;
  // Durations this experience fits well with.
  durationFit: DurationPref[];
  // Hard-no tags this experience triggers. Intersection with profile
  // hard-nos applies a penalty.
  hardNoSignals: HardNoTag[];
  // Optional editorial 2–3 paragraph description for the expand view.
  editorialDescription?: string;
  // Optional suggested time blocks for the itinerary "AI Suggest".
  itineraryTemplate?: Partial<Record<TimeBlock, string>>[];
  // Peak months (0-indexed: Jan=1). Empty array = year-round.
  peakMonths: number[];
}

export interface RecommendationScore {
  recommendationId: string;
  score: number; // 0–100 after weights + penalties
  breakdown: {
    vibe: number;
    budget: number;
    timing: number;
    personal: number;
  };
  matchTag: string; // "Great for your budget" etc.
  // "Why this matches you" — 1–2 sentence explanation, lazy-computed.
  whyNote: string;
}

export interface RecommendationState {
  id: string; // Recommendation id
  status: RecommendationStatus;
  dismissReason?: string;
  selectedAt?: string;
}

// ── Tab 3 — Itinerary ──────────────────────────────────────────────────────

export interface ItineraryItem {
  id: string;
  dayNumber: number; // 1-indexed
  timeBlock: TimeBlock;
  sortOrder: number;
  activity: string;
  location?: string;
  durationMinutes?: number;
  estimatedCostCents?: number;
  notes?: string;
  bookingUrl?: string;
  // The "Anniversary Moment" — the headline celebration. Rendered with
  // special styling (saffron border, Sparkles icon) vs. logistics rows.
  isMainEvent?: boolean;
}

// ── Tab 4 — Budget ─────────────────────────────────────────────────────────

export interface Expense {
  id: string;
  category: ExpenseCategory;
  vendor: string;
  amountCents: number;
  date: string; // ISO or free text
  notes?: string;
  source: "manual" | "receipt_scan";
  // Stored when uploaded via ReceiptUpload. Client-side only for now —
  // file is kept as data URL in localStorage (see store migration notes).
  receiptDataUrl?: string;
}

// ── Tab 5 — Documents ──────────────────────────────────────────────────────

export interface AnniversaryDocument {
  id: string;
  label: string;
  category: DocumentCategory;
  url?: string;
  addedAt: string; // ISO
  notes?: string;
}

// ── Store root state ───────────────────────────────────────────────────────

export interface FirstAnniversaryState {
  basics: AnniversaryBasics;
  vibe: VibeProfile;
  // Per-recommendation status overrides. Recommendations default to
  // "suggested"; this map only carries user-driven status changes.
  recommendationStates: Record<string, RecommendationState>;
  itinerary: ItineraryItem[];
  expenses: Expense[];
  documents: AnniversaryDocument[];
}
