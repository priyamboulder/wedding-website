// ── Tier evaluation logic ─────────────────────────────────────────────────
// Pure functions — given a creator's stats, returns the tier they qualify
// for and the progress toward the next tier. No side effects; the matching
// store + API routes call into this when rebuilding tier state.

import type { Creator, CreatorTier } from "@/types/creator";

export interface CreatorStats {
  followers: number;
  collectionCount: number;
  guideCount: number;
  consultationRating: number; // 0 if no consultations
}

export interface TierCriterion {
  label: string;
  current: number;
  required: number;
  met: boolean;
}

export interface TierEvaluation {
  currentTier: CreatorTier;
  qualifiedTier: CreatorTier;
  nextTier: CreatorTier | null;
  progress: TierCriterion[];
  percentToNext: number; // 0..100
  inGracePeriod: boolean;
  gracePeriodEnds: string | null;
}

// ── Thresholds ────────────────────────────────────────────────────────────

export const TIER_THRESHOLDS = {
  rising: {
    followers: 500,
    collectionsOrGuides: { collections: 10, guides: 5 },
  },
  top_creator: {
    followers: 2_000,
    collectionsOrGuides: { collections: 25, guides: 15 },
    consultationRating: 4.5,
  },
} as const;

// Rising: 500+ followers AND (10+ collections OR 5+ guides)
export function qualifiesForRising(stats: CreatorStats): boolean {
  const t = TIER_THRESHOLDS.rising;
  const hasContent =
    stats.collectionCount >= t.collectionsOrGuides.collections ||
    stats.guideCount >= t.collectionsOrGuides.guides;
  return stats.followers >= t.followers && hasContent;
}

// Top Creator: 2000+ followers AND (25+ collections OR 15+ guides) AND 4.5+ rating
export function qualifiesForTopCreator(stats: CreatorStats): boolean {
  const t = TIER_THRESHOLDS.top_creator;
  const hasContent =
    stats.collectionCount >= t.collectionsOrGuides.collections ||
    stats.guideCount >= t.collectionsOrGuides.guides;
  return (
    stats.followers >= t.followers &&
    hasContent &&
    stats.consultationRating >= t.consultationRating
  );
}

// The best tier a creator qualifies for based on stats. Partner is
// invitation-only so it's never returned from this function.
export function qualifiedTier(stats: CreatorStats): CreatorTier {
  if (qualifiesForTopCreator(stats)) return "top_creator";
  if (qualifiesForRising(stats)) return "rising";
  return "standard";
}

// Grace period: 90 days. If a creator dips below their tier's threshold,
// they keep the tier until this window expires.
export const GRACE_PERIOD_DAYS = 90;

export function gracePeriodEndDate(from: Date = new Date()): string {
  const ends = new Date(from);
  ends.setDate(ends.getDate() + GRACE_PERIOD_DAYS);
  return ends.toISOString();
}

export function isGracePeriodActive(endsAtIso: string | null): boolean {
  if (!endsAtIso) return false;
  return new Date(endsAtIso).getTime() > Date.now();
}

// ── Evaluation ────────────────────────────────────────────────────────────

export function evaluateCreatorTier(
  creator: Creator,
  stats: CreatorStats,
): TierEvaluation {
  const qualified = qualifiedTier(stats);

  // Partner tier is manual — never auto-set. If a creator is already at
  // Partner, their "next tier" has no further automatic rung.
  if (creator.tier === "partner") {
    return {
      currentTier: "partner",
      qualifiedTier: "partner",
      nextTier: null,
      progress: [],
      percentToNext: 100,
      inGracePeriod: false,
      gracePeriodEnds: null,
    };
  }

  const inGrace = isGracePeriodActive(creator.tierGracePeriodEnds);

  // Compute the progress bars for the *next* tier the creator is working
  // toward. If they already qualify for top_creator, we show a message
  // about partner instead (handled in UI via nextTier == null path).
  const nextTier: CreatorTier | null = computeNextTier(creator.tier);
  const progress = buildProgressCriteria(nextTier, stats);
  const percent = overallPercent(progress);

  return {
    currentTier: creator.tier,
    qualifiedTier: qualified,
    nextTier,
    progress,
    percentToNext: percent,
    inGracePeriod: inGrace,
    gracePeriodEnds: creator.tierGracePeriodEnds,
  };
}

function computeNextTier(current: CreatorTier): CreatorTier | null {
  if (current === "standard") return "rising";
  if (current === "rising") return "top_creator";
  if (current === "top_creator") return "partner";
  return null;
}

function buildProgressCriteria(
  nextTier: CreatorTier | null,
  stats: CreatorStats,
): TierCriterion[] {
  if (!nextTier || nextTier === "partner") {
    // Partner tier is by invitation — surface stats for context only.
    return [
      {
        label: "Consultation rating",
        current: Math.round(stats.consultationRating * 10) / 10,
        required: 5,
        met: stats.consultationRating >= 4.8,
      },
      {
        label: "Consultations",
        current: 0,
        required: 50,
        met: false,
      },
    ];
  }

  if (nextTier === "rising") {
    const t = TIER_THRESHOLDS.rising;
    return [
      {
        label: "Followers",
        current: stats.followers,
        required: t.followers,
        met: stats.followers >= t.followers,
      },
      {
        label: "Collections (or 5+ guides)",
        current: stats.collectionCount,
        required: t.collectionsOrGuides.collections,
        met: stats.collectionCount >= t.collectionsOrGuides.collections,
      },
      {
        label: "Guides (or 10+ collections)",
        current: stats.guideCount,
        required: t.collectionsOrGuides.guides,
        met: stats.guideCount >= t.collectionsOrGuides.guides,
      },
    ];
  }

  // top_creator
  const t = TIER_THRESHOLDS.top_creator;
  return [
    {
      label: "Followers",
      current: stats.followers,
      required: t.followers,
      met: stats.followers >= t.followers,
    },
    {
      label: "Collections (or 15+ guides)",
      current: stats.collectionCount,
      required: t.collectionsOrGuides.collections,
      met: stats.collectionCount >= t.collectionsOrGuides.collections,
    },
    {
      label: "Guides (or 25+ collections)",
      current: stats.guideCount,
      required: t.collectionsOrGuides.guides,
      met: stats.guideCount >= t.collectionsOrGuides.guides,
    },
    {
      label: "Consultation rating",
      current: Math.round(stats.consultationRating * 10) / 10,
      required: t.consultationRating,
      met: stats.consultationRating >= t.consultationRating,
    },
  ];
}

function overallPercent(criteria: TierCriterion[]): number {
  if (criteria.length === 0) return 100;
  const sum = criteria.reduce((acc, c) => {
    const pct = c.required === 0 ? 100 : Math.min(100, (c.current / c.required) * 100);
    return acc + pct;
  }, 0);
  return Math.round(sum / criteria.length);
}

// ── Perks ─────────────────────────────────────────────────────────────────

export const TIER_PERKS: Record<CreatorTier, string[]> = {
  standard: [
    "Profile, collections, and guides",
    "5% referral commission",
    "Basic analytics",
  ],
  rising: [
    "Rising Creator badge",
    "6% referral commission",
    "Eligible for vendor partnerships",
    "Seasonal drops unlocked",
    "Consultation marketplace access",
  ],
  top_creator: [
    "Top Creator badge",
    "8% referral commission",
    "Featured placement in Creator Picks",
    "Priority in matching results",
    "Eligible to host exhibitions",
    "Early access to new vendor inventory",
    "Dedicated support",
  ],
  partner: [
    "Partner badge with platform logo",
    "10% referral commission",
    "Homepage featured section",
    "Co-branded marketing",
    "Revenue share on referred vendors",
    "Seat at creator advisory council",
  ],
};

export const TIER_COMMISSION_RATE: Record<CreatorTier, number> = {
  standard: 0.05,
  rising: 0.06,
  top_creator: 0.08,
  partner: 0.1,
};

// Feature gates — used throughout the app to check whether a creator can
// use a given feature. Mirrors the "tier perks" in the spec.
export function canCreateExhibitions(tier: CreatorTier): boolean {
  return tier !== "standard";
}

export function canCreateDrops(tier: CreatorTier): boolean {
  return tier !== "standard";
}

export function canAppearInVendorPartnerships(tier: CreatorTier): boolean {
  return tier !== "standard";
}

export function isFeaturedTier(tier: CreatorTier): boolean {
  return tier === "top_creator" || tier === "partner";
}
