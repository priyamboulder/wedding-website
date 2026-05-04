// ──────────────────────────────────────────────────────────────────────────
// Guest Count Estimator — insight generation.
//
// Rule-based observations that surface in the results dashboard. Capped at
// five so the page doesn't turn into a wall of bullets.
// ──────────────────────────────────────────────────────────────────────────

import type { EstimateOutput, GuestEstimateState } from "@/types/guests";

import { GUEST_DISTRIBUTION_MULTIPLIERS } from "./defaults";

export function generateInsights(
  state: GuestEstimateState,
  output: EstimateOutput,
): string[] {
  const insights: string[] = [];
  const total = output.totalNames || 1;

  // Side imbalance
  const enabledSides = output.bySide.filter((s) => s.enabled);
  if (enabledSides.length === 2) {
    const [a, b] = enabledSides;
    const larger = a.totalNames >= b.totalNames ? a : b;
    const smaller = a.totalNames >= b.totalNames ? b : a;
    if (larger.totalNames > 0 && smaller.totalNames > 0) {
      const imbalance =
        (larger.totalNames - smaller.totalNames) / larger.totalNames;
      if (imbalance >= 0.3) {
        insights.push(
          `${larger.label} has ${Math.round(imbalance * 100)}% more guests than ${smaller.label}. Common — but worth a conversation so both sides feel represented. Some couples balance this by letting the smaller side weigh in more on venue, menu, or music.`,
        );
      }
    }
  }

  // Parents' friends domination
  const parentsFriends =
    output.byTier.find((t) => t.tierId === "parents-friends")?.count ?? 0;
  if (parentsFriends / total > 0.3) {
    insights.push(
      `Parents' friends make up ${Math.round((parentsFriends / total) * 100)}% of your total list — the #1 lever for reducing count, and the hardest conversation to have. Consider a tiered approach: invite the full list to the reception, but keep mehndi and sangeet to closer circles.`,
    );
  }

  // Ceremony / reception parity
  const ceremony = output.byEvent.find((e) => e.slug === "ceremony");
  const reception = output.byEvent.find((e) => e.slug === "reception");
  if (
    ceremony &&
    reception &&
    Math.abs(ceremony.estimatedCount - reception.estimatedCount) < 30
  ) {
    insights.push(
      `Your ceremony (${ceremony.estimatedCount}) and reception (${reception.estimatedCount}) counts are within 30 guests. If they're at the same venue, plan for a single floral and decor setup — that alone can save $5–15K.`,
    );
  }

  // Cost shock
  if (output.costEstimate.high >= 200000) {
    insights.push(
      `At today's numbers, food + venue alone could run $${formatK(output.costEstimate.low)}–$${formatK(output.costEstimate.high)}. That doesn't include decor, photography, or attire. The "what if" levers below show exactly where to trim.`,
    );
  }

  // Small intimate events
  const smallEvents = output.byEvent.filter(
    (e) => e.estimatedCount > 0 && e.estimatedCount < 75,
  );
  if (smallEvents.length > 0) {
    const names = smallEvents
      .map((e) => e.name)
      .slice(0, 2)
      .join(" and ");
    insights.push(
      `Your ${names} ${smallEvents.length === 1 ? "is" : "are"} under 75 guests — small enough to host at a home, backyard, or boutique venue instead of a banquet hall. Could save $3–10K per event.`,
    );
  }

  // Out-of-town heavy
  const ootPct =
    GUEST_DISTRIBUTION_MULTIPLIERS[state.guestDistribution] ?? 0;
  if (ootPct >= 0.45 && total > 0) {
    insights.push(
      `With ~${Math.round(ootPct * 100)}% of guests traveling in, start hotel room blocks now. Most hotels need 2–3 months notice and offer group rates at 10+ rooms per night.`,
    );
  }

  return insights.slice(0, 5);
}

function formatK(n: number): string {
  return `${Math.round(n / 1000)}K`;
}
