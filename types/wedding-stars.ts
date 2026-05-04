// ──────────────────────────────────────────────────────────────────────────
// Wedding Stars — types.
//
// A personalized 12-month transit timeline mapped to wedding-planning
// decisions for a given Moon sign (Rashi). Pure client tool — no DB rows,
// no API calls. Pre-computed transit dataset is interpreted at runtime.
// ──────────────────────────────────────────────────────────────────────────

import type { Planet, Rashi } from "@/types/kundli";

export type WeddingAction =
  | "venue-booking"
  | "vendor-contracts"
  | "outfit-shopping"
  | "beauty-decisions"
  | "decor-aesthetic"
  | "budget-planning"
  | "family-conversations"
  | "guest-list"
  | "invitations"
  | "travel-planning"
  | "photography-video"
  | "food-tasting"
  | "music-entertainment"
  | "ceremony-planning"
  | "legal-paperwork"
  | "honeymoon-planning"
  | "general-decisions";

export type TransitStatus =
  | "highly-favorable"
  | "favorable"
  | "mixed"
  | "caution"
  | "avoid";

export type TransitEventKind =
  | "ingress" // planet enters a sign
  | "retrograde" // planet goes retrograde
  | "exalted" // planet enters its sign of exaltation
  | "combust" // planet too close to the Sun
  | "direct"; // planet stations direct (rarely surfaced on its own)

export interface TransitDef {
  id: string; // stable identifier — used for keys + URL state
  planet: Planet;
  kind: TransitEventKind;
  // Headline event label, e.g. "Jupiter enters Cancer (exalted)".
  event: string;
  startISO: string; // yyyy-mm-dd
  endISO: string; // yyyy-mm-dd
  // The sign the planet occupies during this window. Used to compute the
  // house this transit activates for any given Moon sign.
  inSign: Rashi;
  // Mark a transit as the highlight of the year — drives extra visual weight.
  highlight?: boolean;
  // Mark a transit as a warning surface (combust, retrograde of malefic).
  warning?: boolean;
}

export interface HouseMeaning {
  number: number; // 1..12
  area: string; // "Self", "Finances", "Partnership"
  weddingContext: string; // wedding-specific framing
}

export interface TransitWindow {
  transitId: string;
  planet: Planet;
  event: string;
  kind: TransitEventKind;
  startISO: string;
  endISO: string;
  inSign: Rashi;
  highlight?: boolean;
  warning?: boolean;

  // Resolved per-Moon-sign at runtime:
  houseForRashi: number; // 1..12
  status: TransitStatus;
  weddingImpact: string;
  bestFor: WeddingAction[];
  avoid: WeddingAction[];
  proTip?: string;
}

export interface MonthBucket {
  // yyyy-mm key — sortable.
  ymKey: string;
  label: string; // "May 2026"
  windows: TransitWindow[];
}

export type WeddingTimeline = "specific-date" | "approx-month" | "open";

export interface WeddingDateInput {
  kind: WeddingTimeline;
  iso?: string; // for specific-date
  ymKey?: string; // yyyy-mm for approximate
}

export interface StarsResult {
  rashi: Rashi;
  rashiEnglish: string;
  resolvedFromBirth: boolean; // true if user used the birth-detail path
  weddingDate: WeddingDateInput;
  // First month is the current month at calculation time.
  months: MonthBucket[];
  // Curated highlights surfaced above the timeline.
  goldenWindow: TransitWindow | null;
  watchOuts: TransitWindow[]; // retrogrades, combust, avoid windows
  // Bullet insights — 3-5 items.
  insights: StarsInsight[];
}

export interface StarsInsight {
  kind: "golden" | "warning" | "weddingDate" | "general";
  title: string;
  body: string;
}

export type EntryMethod = "rashi" | "birth";
