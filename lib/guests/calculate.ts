// ──────────────────────────────────────────────────────────────────────────
// Guest Count Estimator — pure calculation.
//
// Deterministic math: state in → output out. No side effects, no defaults
// embedded; rates and modifiers come from defaults.ts. Per-event counts
// blend default tier rates with the user's overrides and apply a single
// out-of-town reduction derived from their guest-distribution selection.
// ──────────────────────────────────────────────────────────────────────────

import type {
  EstimateOutput,
  EventBreakdown,
  EventSlug,
  GuestEstimateState,
  SideTotals,
  TierId,
} from "@/types/guests";

import {
  DEFAULT_ATTENDANCE_RATES,
  DEFAULT_OUT_OF_TOWN_MODIFIERS,
  EVENT_NAMES,
  GUEST_DISTRIBUTION_MULTIPLIERS,
  TIER_ORDER,
  TIERS,
} from "./defaults";
import { generateInsights } from "./insights";

function emptyTierMap(): Record<TierId, number> {
  return {
    "immediate-family": 0,
    "inner-extended": 0,
    "outer-extended": 0,
    "parents-friends": 0,
    "couple-friends": 0,
    professional: 0,
  };
}

export function computeSideTotals(state: GuestEstimateState): SideTotals[] {
  return state.sides.map((side) => {
    const byTier = emptyTierMap();
    if (side.enabled) {
      for (const tier of TIERS) {
        for (const cat of tier.categories) {
          if (!cat.sideSpecific) continue;
          const v = side.counts[`${tier.id}:${cat.id}`] ?? 0;
          byTier[tier.id] += clampInt(v);
        }
      }
    }
    const totalNames = Object.values(byTier).reduce((a, b) => a + b, 0);
    return {
      sideId: side.id,
      label: side.label,
      enabled: side.enabled,
      totalNames,
      byTier,
    };
  });
}

export function computeSharedTierTotals(
  state: GuestEstimateState,
): Record<TierId, number> {
  const byTier = emptyTierMap();
  for (const tier of TIERS) {
    for (const cat of tier.categories) {
      if (cat.sideSpecific) continue;
      const v = state.shared.counts[`${tier.id}:${cat.id}`] ?? 0;
      byTier[tier.id] += clampInt(v);
    }
  }
  return byTier;
}

export function computeTotalsByTier(
  state: GuestEstimateState,
): Record<TierId, number> {
  const totals = emptyTierMap();
  const sides = computeSideTotals(state);
  for (const s of sides) {
    for (const t of TIER_ORDER) totals[t] += s.byTier[t];
  }
  const shared = computeSharedTierTotals(state);
  for (const t of TIER_ORDER) totals[t] += shared[t];
  return totals;
}

export function computeTotalNames(state: GuestEstimateState): number {
  const totals = computeTotalsByTier(state);
  return Object.values(totals).reduce((a, b) => a + b, 0);
}

function effectiveRate(
  state: GuestEstimateState,
  event: EventSlug,
  tier: TierId,
): number {
  const override = state.eventOverrides[event]?.rates?.[tier];
  if (override != null) return clamp01(override);
  return DEFAULT_ATTENDANCE_RATES[event][tier];
}

function effectiveOutOfTownModifier(
  state: GuestEstimateState,
  event: EventSlug,
): number {
  const override = state.eventOverrides[event]?.outOfTownModifier;
  if (override != null) return clamp01(override);
  return DEFAULT_OUT_OF_TOWN_MODIFIERS[event];
}

export function computeEventBreakdown(
  state: GuestEstimateState,
  event: EventSlug,
): EventBreakdown {
  const tierTotals = computeTotalsByTier(state);
  const outOfTownPct = GUEST_DISTRIBUTION_MULTIPLIERS[state.guestDistribution];
  const oot = effectiveOutOfTownModifier(state, event);

  const byTier = emptyTierMap();
  let total = 0;
  for (const tier of TIER_ORDER) {
    const total_in_tier = tierTotals[tier];
    if (total_in_tier === 0) continue;
    const rate = effectiveRate(state, event, tier);
    // Split tier names into local vs out-of-town buckets, apply attendance,
    // then knock the out-of-town bucket down by the per-event modifier.
    const ootCount = total_in_tier * outOfTownPct;
    const localCount = total_in_tier - ootCount;
    const attending =
      localCount * rate + ootCount * rate * (1 - oot);
    byTier[tier] = Math.round(attending);
    total += attending;
  }
  return {
    slug: event,
    name: EVENT_NAMES[event],
    byTier,
    estimatedCount: Math.round(total),
  };
}

export function computeEstimate(state: GuestEstimateState): EstimateOutput {
  const sides = computeSideTotals(state);
  const totals = computeTotalsByTier(state);
  const totalNames = Object.values(totals).reduce((a, b) => a + b, 0);

  const byEvent = state.events.map((e) => computeEventBreakdown(state, e));

  // Range: high = max event headcount (largest single seating); low = high
  // minus a 12% no-show / last-minute decline buffer. If no events selected,
  // fall back to the total names list.
  const high = byEvent.length > 0
    ? Math.max(...byEvent.map((e) => e.estimatedCount))
    : totalNames;
  const low = Math.round(high * 0.88);

  const costEstimate = {
    perHead: state.costPerHead,
    low: Math.round(low * state.costPerHead * Math.max(1, byEvent.length * 0.55)),
    high: Math.round(high * state.costPerHead * Math.max(1, byEvent.length * 0.7)),
  };

  const byTier = TIER_ORDER.map((t) => ({
    tierId: t,
    name: TIERS.find((x) => x.id === t)?.name ?? t,
    count: totals[t],
  }));

  const output: EstimateOutput = {
    totalNames,
    totalRange: { low, high },
    bySide: sides,
    byTier,
    byEvent,
    costEstimate,
    insights: [],
    outOfTownPercentage: GUEST_DISTRIBUTION_MULTIPLIERS[state.guestDistribution],
  };
  output.insights = generateInsights(state, output);
  return output;
}

function clamp01(v: number): number {
  if (Number.isNaN(v)) return 0;
  return Math.min(1, Math.max(0, v));
}

function clampInt(v: number): number {
  if (!Number.isFinite(v) || v < 0) return 0;
  return Math.floor(v);
}
