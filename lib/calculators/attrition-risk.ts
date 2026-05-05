// ── Attrition risk calculator ──────────────────────────────────────────────
// Shared math for evaluating room-block attrition risk: gap to floor,
// days remaining to cutoff, and a tiered risk classification. Used by:
//
//   • RoomBlockManagerTab (full workspace) — per-block risk badges and the
//     aggregate "Gap to floor" stat.
//   • Travel & Accommodations Build · Session 1 (block_setup) — cutoff
//     warnings rendered at the top of the session, plus the loud red banner
//     when the gap exceeds 5 rooms within 30 days of cutoff.
//
// The numbers matter: a 40-room block with a 28-room attrition floor that
// only books 18 rooms owes the hotel for 10 phantom rooms. Make this loud.

export interface AttritionRiskInput {
  rooms_blocked: number;
  rooms_booked: number;
  /** Either an explicit floor count or a percentage — count wins when both. */
  attrition_floor_count?: number;
  attrition_floor_percentage?: number;
  /** ISO date "YYYY-MM-DD" — empty/invalid yields null daysToCutoff. */
  cutoff_date: string;
  /** Optional contractual penalty per phantom room. */
  attrition_penalty_per_room?: number;
}

export type AttritionRiskTier =
  | "no_risk"
  | "watch"
  | "elevated"
  | "critical"
  | "cutoff_passed";

export interface AttritionRiskResult {
  /** Effective floor count (resolved from count or percentage). */
  floor: number;
  /** Number of rooms still needed to meet the floor. 0 means met. */
  gap_to_floor: number;
  /** Whole days remaining; null if cutoff_date is missing/invalid. */
  days_to_cutoff: number | null;
  /** % of blocked rooms currently booked. 0 when blocked == 0. */
  utilization: number;
  tier: AttritionRiskTier;
  /** Estimated penalty exposure if the cutoff arrives today. */
  estimated_penalty: number;
  /** Short copy explaining the tier. Useful for tooltip / banner copy. */
  message: string;
}

/**
 * Whole days from today to cutoffIso (positive = future). Returns null if
 * the date can't be parsed.
 */
export function daysUntil(cutoffIso: string): number | null {
  if (!cutoffIso) return null;
  const d = new Date(cutoffIso);
  if (Number.isNaN(d.getTime())) return null;
  const now = new Date();
  return Math.ceil((d.getTime() - now.getTime()) / 86400000);
}

/**
 * Resolve the effective attrition floor. Explicit count wins when set;
 * otherwise computed from percentage. Floor never exceeds rooms_blocked.
 */
export function resolveAttritionFloor(input: {
  rooms_blocked: number;
  attrition_floor_count?: number;
  attrition_floor_percentage?: number;
}): number {
  if (input.attrition_floor_count != null && input.attrition_floor_count > 0) {
    return Math.min(input.attrition_floor_count, input.rooms_blocked);
  }
  if (
    input.attrition_floor_percentage != null &&
    input.attrition_floor_percentage > 0
  ) {
    return Math.min(
      Math.ceil(
        (input.rooms_blocked * input.attrition_floor_percentage) / 100,
      ),
      input.rooms_blocked,
    );
  }
  return 0;
}

/**
 * Classify a single block's attrition risk. Tier rules:
 *   • cutoff_passed — cutoff has already arrived
 *   • critical      — gap > 5 AND days < 30 (the loud banner trigger)
 *   • elevated      — gap > 0 AND days < 21
 *   • watch         — gap > 0 AND days < 60
 *   • no_risk       — gap == 0 OR days >= 60
 */
export function classifyAttritionRisk(
  input: AttritionRiskInput,
): AttritionRiskResult {
  const floor = resolveAttritionFloor(input);
  const gap = Math.max(0, floor - input.rooms_booked);
  const days = daysUntil(input.cutoff_date);
  const utilization =
    input.rooms_blocked > 0
      ? Math.round((input.rooms_booked / input.rooms_blocked) * 100)
      : 0;

  const penaltyRate = input.attrition_penalty_per_room ?? 0;
  const estimatedPenalty = gap * penaltyRate;

  let tier: AttritionRiskTier;
  let message: string;

  if (days != null && days < 0) {
    tier = "cutoff_passed";
    message =
      gap > 0
        ? `Cutoff passed — ${gap} room${gap === 1 ? "" : "s"} short of attrition floor.`
        : "Cutoff passed — block is at or above the attrition floor.";
  } else if (gap === 0) {
    tier = "no_risk";
    message = "On track. Booked rooms meet or exceed the attrition floor.";
  } else if (days != null && days < 30 && gap > 5) {
    tier = "critical";
    message = `${gap}-room gap with ${days}d to cutoff. Penalty exposure ≈ ${gap} phantom room${gap === 1 ? "" : "s"}.`;
  } else if (days != null && days < 21) {
    tier = "elevated";
    message = `${gap}-room gap, ${days}d to cutoff. Send booking reminders today.`;
  } else if (days != null && days < 60) {
    tier = "watch";
    message = `${gap} rooms short of floor. ${days}d to cutoff — keep an eye on pickup.`;
  } else {
    tier = "no_risk";
    message =
      days == null
        ? `${gap} rooms short of floor. Set a cutoff date to track risk.`
        : `${gap} rooms short of floor. Plenty of runway (${days}d).`;
  }

  return {
    floor,
    gap_to_floor: gap,
    days_to_cutoff: days,
    utilization,
    tier,
    estimated_penalty: estimatedPenalty,
    message,
  };
}

export interface PortfolioAttritionResult {
  total_rooms_blocked: number;
  total_rooms_booked: number;
  /** Sum of attrition floors across all blocks. */
  minimum_to_meet: number;
  /** Sum of per-block gaps — non-zero blocks add to the portfolio gap. */
  gap_to_floor: number;
  overall_utilization: number;
  /** Block ids in critical tier. */
  critical_block_ids: string[];
  /** Block ids in elevated tier. */
  elevated_block_ids: string[];
}

/**
 * Aggregate risk view across a portfolio of blocks. Each block must carry
 * a stable `id` so the caller can correlate back.
 */
export function classifyPortfolioAttrition(
  blocks: Array<AttritionRiskInput & { id: string }>,
): PortfolioAttritionResult {
  let blocked = 0;
  let booked = 0;
  let floorSum = 0;
  let gapSum = 0;
  const critical: string[] = [];
  const elevated: string[] = [];

  for (const b of blocks) {
    const r = classifyAttritionRisk(b);
    blocked += b.rooms_blocked;
    booked += b.rooms_booked;
    floorSum += r.floor;
    gapSum += r.gap_to_floor;
    if (r.tier === "critical" || r.tier === "cutoff_passed") {
      critical.push(b.id);
    } else if (r.tier === "elevated") {
      elevated.push(b.id);
    }
  }

  return {
    total_rooms_blocked: blocked,
    total_rooms_booked: booked,
    minimum_to_meet: floorSum,
    gap_to_floor: gapSum,
    overall_utilization:
      blocked > 0 ? Math.round((booked / blocked) * 100) : 0,
    critical_block_ids: critical,
    elevated_block_ids: elevated,
  };
}
