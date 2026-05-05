// ──────────────────────────────────────────────────────────────────────────
// Destination Explorer — pricing + budget-fit heuristics for the hub grid.
//
// These are intentionally rough — the goal is to help a visitor decide
// which region to click into, not to commit to a number. Real per-vendor
// and per-venue pricing lives downstream in the destination deep dives.
// ──────────────────────────────────────────────────────────────────────────

import type { DisplayContinentSlug } from "./continents";

export type GuestBucket = "under-150" | "150-300" | "300-500" | "500-plus";
export type BudgetBucket = "under-100k" | "100-250k" | "250-500k" | "500k-plus";

export type FitTag = "great-value" | "good-fit" | "stretch";

export interface RegionEconomics {
  /** Typical all-in cost in USD thousands for ~200 guests, as a starting
   *  reference. Padded as a wide range when no guest filter is set. */
  baselineK: number;
  /** One short logistical detail Indian couples actually need to know. */
  insight: string;
}

export const REGION_ECONOMICS: Record<DisplayContinentSlug, RegionEconomics> = {
  "south-asia": {
    baselineK: 100,
    insight: "Indian catering: strong local network",
  },
  europe: {
    baselineK: 180,
    insight: "Vendor travel: usually required",
  },
  "southeast-asia": {
    baselineK: 60,
    insight: "Fire ceremonies: most venues approve",
  },
  "middle-east": {
    baselineK: 150,
    insight: "Indian catering: imports common, plan early",
  },
  "mexico-caribbean": {
    baselineK: 90,
    insight: "Vendor travel: all-inclusive friendly",
  },
  africa: {
    baselineK: 120,
    insight: "Vendor travel: build in lead time",
  },
  oceania: {
    baselineK: 110,
    insight: "Vendor travel: long-haul logistics",
  },
  "united-states": {
    baselineK: 130,
    insight: "Indian catering: nationwide network",
  },
};

const GUEST_MULTIPLIER: Record<GuestBucket, number> = {
  "under-150": 0.65,
  "150-300": 1.05,
  "300-500": 1.7,
  "500-plus": 2.5,
};

const GUEST_CENTER: Record<GuestBucket, number> = {
  "under-150": 125,
  "150-300": 225,
  "300-500": 400,
  "500-plus": 600,
};

const BUDGET_MID_K: Record<BudgetBucket, number> = {
  "under-100k": 80,
  "100-250k": 175,
  "250-500k": 375,
  "500k-plus": 700,
};

function roundFiveK(n: number): number {
  return Math.max(5, Math.round(n / 5) * 5);
}

function formatK(n: number): string {
  return `$${roundFiveK(n)}K`;
}

/**
 * Build the "From ~$80K for 200 guests" / "From ~$80K–$150K" line for a
 * region card. Adjusts to the user's guest filter when present.
 */
export function formatStartingPrice(
  slug: DisplayContinentSlug,
  guests: GuestBucket | null,
): string {
  const baseK = REGION_ECONOMICS[slug].baselineK;
  if (guests) {
    const scaled = baseK * GUEST_MULTIPLIER[guests];
    return `From ~${formatK(scaled)} for ${GUEST_CENTER[guests]} guests`;
  }
  // No guest filter — show a sensible range covering smallish (140g) to
  // larger (~320g) weddings.
  const low = baseK * 0.85;
  const high = baseK * 1.65;
  return `From ~${formatK(low)}–${formatK(high)}`;
}

/**
 * Classify how a region's typical cost for the user's guest count compares
 * to their budget bucket. Null when either filter is missing — we only
 * surface a fit badge once we have something meaningful to compare.
 */
export function classifyFit(
  slug: DisplayContinentSlug,
  guests: GuestBucket | null,
  budget: BudgetBucket | null,
): FitTag | null {
  if (!budget) return null;
  const baseK = REGION_ECONOMICS[slug].baselineK;
  const guestMul = guests ? GUEST_MULTIPLIER[guests] : 1.0;
  const scaled = baseK * guestMul;
  const userMid = BUDGET_MID_K[budget];

  if (userMid >= scaled * 1.6) return "great-value";
  if (userMid >= scaled * 0.85) return "good-fit";
  return "stretch";
}

export function fitLabel(tag: FitTag): string {
  switch (tag) {
    case "great-value":
      return "Great value";
    case "good-fit":
      return "✓ In budget";
    case "stretch":
      return "Stretch";
  }
}
