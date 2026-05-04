// ──────────────────────────────────────────────────────────────────────────
// "Am I Ready?" — type definitions.
//
// Pre-auth assessment that scores planning readiness against the user's
// timeline. Pure client-side: scoring logic is deterministic, priorities
// are rule-based, no API calls.
// ──────────────────────────────────────────────────────────────────────────

export type TimelineOption =
  | "already-happened"
  | "less-than-3-months"
  | "3-6-months"
  | "6-12-months"
  | "12-18-months"
  | "18-plus-months"
  | "no-date";

export type VenueStatus =
  | "signed-deposited"
  | "venue-in-mind"
  | "actively-touring"
  | "havent-started"
  | "destination-package";

export type BudgetStatus =
  | "agreed-number"
  | "rough-range"
  | "one-side-only"
  | "havent-talked"
  | "complicated";

export type EventScope =
  | "ceremony-reception"
  | "two-three"
  | "four-five"
  | "full-week"
  | "undecided";

export type VendorCategory =
  | "venue"
  | "photographer"
  | "caterer"
  | "dj"
  | "decorator"
  | "mehndi"
  | "hmua"
  | "planner"
  | "officiant"
  | "none";

export type GuestListStatus =
  | "final-sent"
  | "draft-negotiating"
  | "rough-number"
  | "havent-started"
  | "parents-handling";

export type AttireStatus =
  | "ordered"
  | "shopping"
  | "know-what"
  | "havent-thought"
  | "from-india";

export type FamilyAlignmentStatus =
  | "fully-aligned"
  | "mostly-aligned"
  | "work-in-progress"
  | "tension"
  | "independent";

export interface AssessmentAnswer {
  timeline: TimelineOption;
  venue: VenueStatus;
  budget: BudgetStatus;
  eventScope: EventScope;
  vendorsBooked: VendorCategory[];
  guestList: GuestListStatus;
  attire: AttireStatus;
  familyAlignment: FamilyAlignmentStatus;
}

export type ReadinessTier =
  | "ahead-of-the-game"
  | "right-on-track"
  | "time-to-get-moving"
  | "lets-build-your-plan"
  | "dont-panic";

export interface PriorityItem {
  // Stable id — what category this priority belongs to (venue, photographer, etc.).
  // The same category may surface with different copy depending on timeline window.
  id: string;
  rank: number;
  action: string;
  why: string;
  timeframe: string;
  budgetNote?: string;
}

export interface CanWaitItem {
  label: string;
  detail: string;
}

export interface ReadinessResult {
  score: number;
  tier: ReadinessTier;
  tierLabel: string;
  tierBlurb: string;
  priorities: PriorityItem[];
  canWait: CanWaitItem[];
}
