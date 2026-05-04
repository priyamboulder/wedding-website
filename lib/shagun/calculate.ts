// ──────────────────────────────────────────────────────────────────────────
// Shagun Calculator — pure calculation.
//
// Two entry points:
//   - calculateShagun(GuestInputs): a single recommendation + range +
//     auspicious option ladder + cultural rationale
//   - estimateCoupleShagun(CoupleInputs): per-tier subtotals and a
//     conservative total range based on participation rates
// ──────────────────────────────────────────────────────────────────────────

import type {
  CoupleEstimateResult,
  CoupleInputs,
  CoupleTier,
  CoupleTierEstimate,
  GuestInputs,
  ShagunOption,
  ShagunResult,
} from "@/types/shagun";

import {
  AUSPICIOUS_LADDER,
  BASE_AMOUNTS_USD,
  BUDGET_CEILING,
  COUPLE_PARTICIPATION_RATE,
  COUPLE_TIERS,
  COUPLE_TIER_LABELS,
  EVENT_COUNT_MULTIPLIER,
  LOCATION_MULTIPLIER,
  TRADITION_MULTIPLIER,
  WEDDING_SCALE_MULTIPLIER,
  WEDDING_STYLE_MULTIPLIER,
} from "./defaults";

// ── Auspicious snapping ────────────────────────────────────────────────────

/**
 * Snap any USD amount to the nearest auspicious value (ending in 1).
 * For amounts above the top of the ladder, return the next "round-+1"
 * step at $1k granularity so $7k → $7,001 etc.
 */
export function snapToAuspicious(amount: number): number {
  if (!Number.isFinite(amount) || amount <= 0) return AUSPICIOUS_LADDER[0];
  const top = AUSPICIOUS_LADDER[AUSPICIOUS_LADDER.length - 1];
  if (amount > top) {
    const rounded = Math.round(amount / 1000) * 1000;
    return rounded + 1;
  }
  return AUSPICIOUS_LADDER.reduce((prev, curr) =>
    Math.abs(curr - amount) < Math.abs(prev - amount) ? curr : prev,
  );
}

/**
 * Build a 4-step ladder around a target: one below, the recommendation,
 * one above, one above that. Used to populate the auspicious-options
 * panel on the result screen.
 */
function buildOptions(target: number): number[] {
  const idx = AUSPICIOUS_LADDER.indexOf(target);
  if (idx === -1) {
    // off-ladder (very large amounts) — fall back to scaled steps
    return [
      Math.round(target * 0.66),
      Math.round(target * 0.85),
      target,
      Math.round(target * 1.35),
    ].map(snapToAuspicious);
  }
  const below = AUSPICIOUS_LADDER[Math.max(0, idx - 1)];
  const above = AUSPICIOUS_LADDER[Math.min(AUSPICIOUS_LADDER.length - 1, idx + 1)];
  const aboveAbove =
    AUSPICIOUS_LADDER[Math.min(AUSPICIOUS_LADDER.length - 1, idx + 2)];
  // Dedupe in case we're at one of the ends.
  return Array.from(new Set([below, target, above, aboveAbove]));
}

// ── Guest mode ─────────────────────────────────────────────────────────────

export function calculateShagun(inputs: GuestInputs): ShagunResult {
  const base = BASE_AMOUNTS_USD[inputs.relationship];

  const combinedMultiplier =
    WEDDING_SCALE_MULTIPLIER[inputs.weddingScale] *
    WEDDING_STYLE_MULTIPLIER[inputs.weddingStyle] *
    TRADITION_MULTIPLIER[inputs.tradition] *
    LOCATION_MULTIPLIER[inputs.location] *
    EVENT_COUNT_MULTIPLIER[inputs.eventCount];

  const adjustedLow = base.low * combinedMultiplier;
  const adjustedMid = base.mid * combinedMultiplier;
  const adjustedHigh = base.high * combinedMultiplier;

  let recommendation = snapToAuspicious(adjustedMid);
  const rangeLow = snapToAuspicious(adjustedLow);
  const rangeHigh = snapToAuspicious(adjustedHigh);

  // ── Reciprocity floor ────────────────────────────────────────────────
  let reciprocity: ShagunResult["reciprocity"] | undefined;
  if (
    inputs.reciprocityStatus === "yes-known" &&
    inputs.reciprocityAmount &&
    inputs.reciprocityAmount > 0
  ) {
    const floor = snapToAuspicious(inputs.reciprocityAmount);
    if (floor > recommendation) {
      recommendation = floor;
      reciprocity = {
        floor,
        note: `The couple's family gave $${inputs.reciprocityAmount} at your wedding. Matching or slightly exceeding — $${floor} is the culturally expected move. Giving less than what was given to you would be noticed by older family members.`,
      };
    } else {
      reciprocity = {
        floor,
        note: `The couple's family gave $${inputs.reciprocityAmount} at your wedding. Your situation already calls for $${recommendation}, so you're naturally in line with reciprocity norms.`,
      };
    }
  } else if (inputs.reciprocityStatus === "yes-unknown") {
    reciprocity = {
      floor: 0,
      note: "Without an exact figure, the safest move is to land at our recommendation or slightly above. Reciprocity is a norm, not a law — close enough is close enough.",
    };
  }

  // ── Budget reality check ─────────────────────────────────────────────
  let budget: ShagunResult["budget"] | undefined;
  if (inputs.budgetComfort && inputs.budgetComfort !== "skip") {
    const ceiling = BUDGET_CEILING[inputs.budgetComfort];
    if (recommendation > ceiling) {
      const alternative = snapToAuspicious(ceiling - 1);
      budget = {
        alternative,
        note: `If $${recommendation} feels like a stretch right now, $${alternative} is still respectful and appropriate. Pair it with a thoughtful card or a small meaningful gift — the warmth of your presence matters more than the number.`,
      };
    }
  }

  // ── Auspicious option ladder ─────────────────────────────────────────
  const optionAmounts = buildOptions(recommendation);
  const options: ShagunOption[] = optionAmounts.map((amt, i, arr) => {
    const isRecommended = amt === recommendation;
    const position = arr.indexOf(amt);
    let description: string;
    if (isRecommended) {
      description = "Our recommendation for your situation";
    } else if (position === 0 && amt < recommendation) {
      description = "On the modest side — appropriate if budget is tight";
    } else if (amt < recommendation) {
      description = "Solid and respectful";
    } else if (position === arr.length - 1) {
      description = "Generous — makes a statement";
    } else {
      description = "A touch above — warmly received";
    }
    return {
      amount: amt,
      label: amt < recommendation ? "Modest" : isRecommended ? "Recommended" : "Generous",
      description,
      isRecommended,
    };
  });

  // ── Rationale (cultural copy) ────────────────────────────────────────
  const rationale = buildRationale(inputs, recommendation);

  // ── Edge-case notes ──────────────────────────────────────────────────
  const notes: string[] = [];
  if (inputs.attendingAs === "couple") {
    notes.push(
      "Attending as a couple? One envelope covers both of you — you don't double up.",
    );
  }
  if (inputs.attendingAs === "on-behalf-of-parents") {
    notes.push(
      "Giving on behalf of your parents? The amount reflects your parents' relationship to the family — which is what we've calculated above.",
    );
  }
  if (inputs.relationship === "non-indian-friend") {
    notes.push(
      "Cash in an envelope is always appreciated — the amount that feels right for the friendship is the right amount. The +1 convention (ending in 1) is a nice touch that shows cultural awareness.",
    );
  }
  if (
    inputs.weddingStyle === "destination-travel" ||
    inputs.weddingStyle === "luxury-destination"
  ) {
    notes.push(
      "You flew in for this — your travel and presence are already part of the gift. Don't feel pressured to overgive on top of that.",
    );
  }

  return {
    recommendation,
    range: { low: rangeLow, high: rangeHigh },
    options,
    rationale,
    reciprocity,
    budget,
    notes,
  };
}

function buildRationale(inputs: GuestInputs, amount: number): string {
  const relationshipPhrase: Record<GuestInputs["relationship"], string> = {
    "immediate-family": "an immediate family wedding",
    "close-extended-family": "a close family wedding",
    "outer-extended-family": "a wider-family wedding",
    "close-friend": "a close friend's wedding",
    "good-friend": "a good friend's wedding",
    "acquaintance-colleague": "a colleague or acquaintance's wedding",
    "parents-friend-family-friend": "a family-friend wedding",
    "business-relationship": "a professional connection's wedding",
    "non-indian-friend": "your friend's wedding",
  };
  const stylePhrase: Record<GuestInputs["weddingStyle"], string> = {
    "traditional-banquet": "at a traditional banquet venue",
    "upscale-hotel": "at an upscale hotel",
    "luxury-destination": "at a luxury destination",
    "casual-backyard": "at a low-key home-style celebration",
    "destination-travel": "with travel involved",
  };
  return `For ${relationshipPhrase[inputs.relationship]} ${stylePhrase[inputs.weddingStyle]}, $${amount} is the sweet spot — it respects the scale of their celebration, reflects where you are in their life, and lands within the range most guests in your position would give.`;
}

// ── Couple mode ────────────────────────────────────────────────────────────

export function estimateCoupleShagun(inputs: CoupleInputs): CoupleEstimateResult {
  const combinedMultiplier =
    WEDDING_SCALE_MULTIPLIER[inputs.weddingScale] *
    WEDDING_STYLE_MULTIPLIER[inputs.weddingStyle] *
    TRADITION_MULTIPLIER[inputs.tradition] *
    LOCATION_MULTIPLIER[inputs.location];

  let totalGuests = 0;
  let totalLow = 0;
  let totalHigh = 0;

  const byTier: CoupleTierEstimate[] = COUPLE_TIERS.map((tier: CoupleTier) => {
    // Couple-mode bases use the corresponding RelationshipTier — skip the
    // non-Indian-friend bucket. The tier names match 1:1 with the guest
    // ladder.
    const base = BASE_AMOUNTS_USD[tier];
    const count = Math.max(0, Math.floor(inputs.counts[tier] || 0));
    const participation = COUPLE_PARTICIPATION_RATE[tier];

    const perGuestLow = snapToAuspicious(base.low * combinedMultiplier);
    const perGuestHigh = snapToAuspicious(base.high * combinedMultiplier);

    const subtotalLow = Math.round(count * participation * perGuestLow);
    const subtotalHigh = Math.round(count * participation * perGuestHigh);

    totalGuests += count;
    totalLow += subtotalLow;
    totalHigh += subtotalHigh;

    return {
      tier,
      label: COUPLE_TIER_LABELS[tier],
      count,
      perGuestRange: { low: perGuestLow, high: perGuestHigh },
      participation,
      subtotalLow,
      subtotalHigh,
    };
  });

  return {
    totalGuests,
    totalLow,
    totalHigh,
    byTier,
    realityCheckNote:
      "Actual shagun tends to come in 15–20% below estimates: not every guest gives cash, some give physical gifts, and a few inevitably forget. Plan for the low end.",
  };
}
