// ──────────────────────────────────────────────────────────────────────────
// "Am I Ready?" scoring engine.
//
// All logic is pure and deterministic — no external calls. Given an
// AssessmentAnswer, we score each category against the timeline pressure,
// then weight them into a single readiness number that lands in a tier.
// The same answer set with a tighter timeline scores lower; that's the
// whole point.
// ──────────────────────────────────────────────────────────────────────────

import type {
  AssessmentAnswer,
  AttireStatus,
  BudgetStatus,
  FamilyAlignmentStatus,
  GuestListStatus,
  ReadinessTier,
  TimelineOption,
  VendorCategory,
  VenueStatus,
} from "@/types/readiness";

// 0 = no pressure (very early), 1 = maximum pressure (< 3 months out).
export function getTimelinePressure(timeline: TimelineOption): number {
  switch (timeline) {
    case "already-happened":
      return 0;
    case "no-date":
      return 0.3;
    case "18-plus-months":
      return 0.1;
    case "12-18-months":
      return 0.3;
    case "6-12-months":
      return 0.5;
    case "3-6-months":
      return 0.75;
    case "less-than-3-months":
      return 1.0;
  }
}

const VENUE_BASE: Record<VenueStatus, number> = {
  "signed-deposited": 100,
  "destination-package": 85,
  "venue-in-mind": 60,
  "actively-touring": 45,
  "havent-started": 15,
};

function scoreVenue(status: VenueStatus, pressure: number): number {
  let score = VENUE_BASE[status];
  if (pressure > 0.5 && score < 80) {
    score *= 1 - (pressure - 0.5) * 0.4;
  }
  return clamp(score);
}

const BUDGET_BASE: Record<BudgetStatus, number> = {
  "agreed-number": 100,
  "rough-range": 60,
  "one-side-only": 45,
  complicated: 30,
  "havent-talked": 15,
};

function scoreBudget(status: BudgetStatus, pressure: number): number {
  let score = BUDGET_BASE[status];
  // Budget unlocks every other vendor decision — penalize harder when
  // the timeline is short and there's no number.
  if (pressure > 0.5 && score < 80) {
    score *= 1 - (pressure - 0.5) * 0.5;
  }
  return clamp(score);
}

// Vendor categories the assessment allows users to mark as booked, paired
// with the score they contribute when checked. Higher = books out further
// in advance for South Asian weddings.
const VENDOR_VALUE: Partial<Record<VendorCategory, number>> = {
  venue: 18,
  photographer: 18,
  caterer: 15,
  decorator: 12,
  planner: 10,
  hmua: 8,
  dj: 8,
  mehndi: 6,
  officiant: 5,
};

function scoreVendors(booked: VendorCategory[], pressure: number): number {
  if (booked.includes("none")) return Math.max(0, 20 - pressure * 20);
  const total = booked.reduce(
    (acc, cat) => acc + (VENDOR_VALUE[cat] ?? 0),
    0,
  );
  // Cap raw at 100, then scale relative to where they "should" be at this
  // timeline. At 18+ months out, a single booking is impressive. At 3 months,
  // anything under 5 vendors is a red flag.
  const expected = expectedVendorCoverage(pressure);
  const ratio = expected === 0 ? 1 : Math.min(1, total / expected);
  return clamp(ratio * 100);
}

function expectedVendorCoverage(pressure: number): number {
  if (pressure >= 1) return 80;
  if (pressure >= 0.75) return 65;
  if (pressure >= 0.5) return 45;
  if (pressure >= 0.3) return 25;
  return 12;
}

const GUEST_BASE: Record<GuestListStatus, number> = {
  "final-sent": 100,
  "draft-negotiating": 65,
  "rough-number": 50,
  "parents-handling": 45,
  "havent-started": 15,
};

function scoreGuestList(status: GuestListStatus, pressure: number): number {
  let score = GUEST_BASE[status];
  if (pressure > 0.5 && score < 70) score *= 1 - (pressure - 0.5) * 0.3;
  return clamp(score);
}

const ATTIRE_BASE: Record<AttireStatus, number> = {
  ordered: 100,
  "from-india": 55,
  shopping: 70,
  "know-what": 45,
  "havent-thought": 20,
};

function scoreAttire(
  status: AttireStatus,
  pressure: number,
  timeline: TimelineOption,
): number {
  let score = ATTIRE_BASE[status];
  // From-India + tight timeline is genuinely urgent — penalize hard.
  if (status === "from-india") {
    if (timeline === "less-than-3-months") score = 15;
    else if (timeline === "3-6-months") score = 35;
    else if (timeline === "6-12-months") score = 55;
  }
  if (pressure > 0.6 && score < 70) score *= 1 - (pressure - 0.6) * 0.4;
  return clamp(score);
}

const FAMILY_BASE: Record<FamilyAlignmentStatus, number> = {
  "fully-aligned": 100,
  "mostly-aligned": 80,
  "work-in-progress": 55,
  tension: 30,
  independent: 75,
};

function scoreFamilyAlignment(status: FamilyAlignmentStatus): number {
  return FAMILY_BASE[status];
}

function clamp(n: number): number {
  return Math.max(0, Math.min(100, n));
}

export interface ScoredCategories {
  venue: number;
  budget: number;
  vendors: number;
  guestList: number;
  attire: number;
  family: number;
}

export function scoreAssessment(answer: AssessmentAnswer): {
  raw: number;
  adjusted: number;
  pressure: number;
  categories: ScoredCategories;
} {
  const pressure = getTimelinePressure(answer.timeline);

  const categories: ScoredCategories = {
    venue: scoreVenue(answer.venue, pressure),
    budget: scoreBudget(answer.budget, pressure),
    vendors: scoreVendors(answer.vendorsBooked, pressure),
    guestList: scoreGuestList(answer.guestList, pressure),
    attire: scoreAttire(answer.attire, pressure, answer.timeline),
    family: scoreFamilyAlignment(answer.familyAlignment),
  };

  const raw =
    categories.venue * 0.25 +
    categories.budget * 0.2 +
    categories.vendors * 0.2 +
    categories.guestList * 0.12 +
    categories.attire * 0.08 +
    categories.family * 0.1 +
    // Remaining 5% slack — unused weight gets distributed evenly so the
    // ceiling is genuinely 100.
    ((categories.venue +
      categories.budget +
      categories.vendors +
      categories.guestList +
      categories.attire +
      categories.family) /
      6) *
      0.05;

  // Timeline modifier: an "okay" answer at 18+ months is genuinely fine; an
  // "okay" answer at 3 months is not. The modifier compresses the score
  // toward the floor as pressure rises.
  const adjusted =
    pressure < 0.4
      ? Math.min(100, raw + (0.4 - pressure) * 20)
      : raw * (1 - (pressure - 0.4) * 0.15);

  return { raw, adjusted: clamp(adjusted), pressure, categories };
}

export function getReadinessTier(score: number): ReadinessTier {
  if (score >= 80) return "ahead-of-the-game";
  if (score >= 60) return "right-on-track";
  if (score >= 40) return "time-to-get-moving";
  if (score >= 25) return "lets-build-your-plan";
  return "dont-panic";
}

export const TIER_LABELS: Record<ReadinessTier, string> = {
  "ahead-of-the-game": "Ahead of the Game",
  "right-on-track": "Right on Track",
  "time-to-get-moving": "Time to Get Moving",
  "lets-build-your-plan": "Let's Build Your Plan",
  "dont-panic": "Don't Panic, But…",
};

export const TIER_BLURBS: Record<ReadinessTier, string> = {
  "ahead-of-the-game":
    "You're the friend everyone should be jealous of. Your decisions are unlocking each other in the right order — keep moving and don't second-guess yourself.",
  "right-on-track":
    "Your progress matches your timeline. The big rocks are in motion. A few specific items below need attention this month — nothing urgent, but don't let them slip.",
  "time-to-get-moving":
    "You've got some catching up to do — but nothing a focused weekend can't fix. The list below is ranked. Start at the top.",
  "lets-build-your-plan":
    "There are real gaps relative to your timeline. That's not a judgment — it just means we need a plan. Here's where to put your energy this week.",
  "dont-panic":
    "Okay — this is a sprint, not a marathon. We're going to triage. Some things below are non-negotiable. A few may need to be simplified or cut. You've got this.",
};
