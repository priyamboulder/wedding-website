// ── Creator-couple matching algorithm ────────────────────────────────────
// Weighted scoring against a couple's preferences. v1 heuristics:
//   Module match        30%
//   Style alignment     25%
//   Budget fit          20%
//   Consultation rating 15%
//   Tier boost          10%

import type { Creator, CreatorTier } from "@/types/creator";
import type { CouplePreferences, MatchScore } from "@/types/matching";

const TIER_BOOST: Record<CreatorTier, number> = {
  standard: 0,
  rising: 5,
  top_creator: 8,
  partner: 10,
};

export function scoreCreator(
  creator: Creator,
  prefs: CouplePreferences,
): MatchScore {
  const moduleMatch = scoreModuleMatch(
    creator.moduleExpertise,
    prefs.priorityModules,
  );
  const styleAlignment = scoreTagOverlap(creator.styleTags, prefs.styleTags);
  const budgetFit = scoreBudgetFit(
    creator.targetBudgetRanges,
    prefs.budgetRange,
  );
  const rating = scoreRating(creator.consultationRating);
  const tierBoost = TIER_BOOST[creator.tier];

  const total =
    moduleMatch * 30 +
    styleAlignment * 25 +
    budgetFit * 20 +
    rating * 15 +
    (tierBoost / 10) * 10;

  const score = Math.round(total);
  return {
    creatorId: creator.id,
    score,
    label: scoreLabel(score),
    breakdown: {
      moduleMatch: Math.round(moduleMatch * 30),
      styleAlignment: Math.round(styleAlignment * 25),
      budgetFit: Math.round(budgetFit * 20),
      rating: Math.round(rating * 15),
      tierBoost: Math.round((tierBoost / 10) * 10),
    },
  };
}

function scoreModuleMatch(
  creatorModules: string[],
  coupleModules: string[],
): number {
  if (coupleModules.length === 0) return 0.5; // neutral if couple didn't pick
  const hits = coupleModules.filter((m) => creatorModules.includes(m)).length;
  return Math.min(1, hits / coupleModules.length);
}

function scoreTagOverlap(
  creatorTags: string[],
  coupleTags: string[],
): number {
  if (coupleTags.length === 0) return 0.5;
  const set = new Set(creatorTags.map((t) => t.toLowerCase()));
  const hits = coupleTags.filter((t) => set.has(t.toLowerCase())).length;
  return Math.min(1, hits / coupleTags.length);
}

function scoreBudgetFit(
  creatorRanges: string[],
  coupleRange: string,
): number {
  if (!coupleRange) return 0.5;
  return creatorRanges.includes(coupleRange) ? 1 : 0.2;
}

function scoreRating(rating: number): number {
  if (rating <= 0) return 0.5; // neutral for new creators — don't punish
  return Math.min(1, rating / 5);
}

function scoreLabel(score: number): MatchScore["label"] {
  if (score >= 80) return "Great Match";
  if (score >= 60) return "Strong Match";
  return "Good Match";
}

export function rankCreators(
  creators: Creator[],
  prefs: CouplePreferences,
  limit = 5,
): MatchScore[] {
  return creators
    .map((c) => scoreCreator(c, prefs))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
