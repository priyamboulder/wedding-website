// ── Budget anchor comparison ──────────────────────────────────────────────
// Compare actual / projected spend against a Vision-stage chip-band budget
// anchor (e.g. Gifting Vision's `welcome_bags_per_bag = "$30-60"`). Used by
// the Gifting Build sessions to surface "under / on_target / over" deltas
// versus the couple's stated budget direction. Generalisable: any future
// workspace that uses chip-band budget anchors (Décor, Music, etc.) can
// reuse this comparator.
//
// Conventions:
//   • Anchor strings come in three shapes that match the gifting-seed
//     ranges. Examples — "$15-30", "$1.5K-4K", "$120+", "tbd".
//   • The "+" suffix denotes an open-ended top end. We treat it as
//     [min, +∞) for `over` math, but use min × 1.5 for "on_target" range
//     so couples have a graceful upper region before tripping `over`.
//   • The "tbd" sentinel disables comparison entirely (returns
//     "no_anchor").
//   • A 5% tolerance band is applied around the anchor min/max so that
//     pinpoint-equal spend doesn't oscillate between "under" and
//     "on_target".

export type BudgetAnchorBand =
  | "under"
  | "on_target"
  | "over"
  | "no_anchor";

export interface BudgetAnchorComparison {
  band: BudgetAnchorBand;
  /** Lower bound of the parsed anchor in USD, or null if "tbd". */
  anchor_min: number | null;
  /** Upper bound (or null when the anchor is open-ended like "$120+"). */
  anchor_max: number | null;
  /** The actual spend the comparison was made against. */
  actual: number;
  /** Signed delta vs. the nearest band edge (negative = under, positive = over). */
  delta_vs_band: number;
}

const TOLERANCE_PCT = 0.05;

/**
 * Parse a chip-band anchor string into [min, max] in USD.
 * Examples:
 *   "$15-30"      → [15, 30]
 *   "$30-60"      → [30, 60]
 *   "$1.5K-4K"    → [1500, 4000]
 *   "$120+"       → [120, null]
 *   "$10K+"       → [10000, null]
 *   "tbd"         → null
 */
export function parseBudgetAnchor(
  anchor: string | null | undefined,
): { min: number; max: number | null } | null {
  if (!anchor) return null;
  const trimmed = anchor.trim().toLowerCase();
  if (trimmed === "tbd" || trimmed === "") return null;

  // Strip leading "$" if present.
  const stripped = trimmed.startsWith("$") ? trimmed.slice(1) : trimmed;

  // Open-ended like "120+" or "10k+"
  if (stripped.endsWith("+")) {
    const val = parseUsdToken(stripped.slice(0, -1));
    if (val == null) return null;
    return { min: val, max: null };
  }

  // Range like "15-30" or "1.5k-4k"
  const dashIdx = stripped.indexOf("-");
  if (dashIdx === -1) {
    // Single value like "60". Treat as exact band [v, v].
    const v = parseUsdToken(stripped);
    return v == null ? null : { min: v, max: v };
  }
  const lo = parseUsdToken(stripped.slice(0, dashIdx));
  const hi = parseUsdToken(stripped.slice(dashIdx + 1));
  if (lo == null || hi == null) return null;
  return { min: lo, max: hi };
}

function parseUsdToken(tok: string): number | null {
  const t = tok.trim();
  if (t.length === 0) return null;
  // Match numeric prefix and an optional k/K multiplier.
  const m = /^([0-9]*\.?[0-9]+)\s*([kK]?)$/.exec(t);
  if (!m) return null;
  const n = Number(m[1]);
  if (Number.isNaN(n)) return null;
  return m[2] ? n * 1000 : n;
}

/**
 * Compare actual spend against a chip-band anchor. Returns the band the
 * spend lands in (under / on_target / over) plus a signed delta against
 * the nearest band edge. A 5% tolerance is applied around band edges.
 */
export function compareAgainstAnchor(
  actual: number,
  anchor: string | null | undefined,
): BudgetAnchorComparison {
  const parsed = parseBudgetAnchor(anchor);
  if (!parsed) {
    return {
      band: "no_anchor",
      anchor_min: null,
      anchor_max: null,
      actual,
      delta_vs_band: 0,
    };
  }
  const { min, max } = parsed;

  // Open-ended anchor: treat the soft upper limit as min × 1.5.
  const effectiveMax = max ?? min * 1.5;

  const lowEdge = min * (1 - TOLERANCE_PCT);
  const highEdge = effectiveMax * (1 + TOLERANCE_PCT);

  if (actual < lowEdge) {
    return {
      band: "under",
      anchor_min: min,
      anchor_max: max,
      actual,
      delta_vs_band: actual - min,
    };
  }
  if (actual > highEdge) {
    return {
      band: "over",
      anchor_min: min,
      anchor_max: max,
      actual,
      delta_vs_band: actual - effectiveMax,
    };
  }
  return {
    band: "on_target",
    anchor_min: min,
    anchor_max: max,
    actual,
    delta_vs_band: 0,
  };
}

export function bandLabel(band: BudgetAnchorBand): string {
  switch (band) {
    case "under":
      return "Under budget";
    case "on_target":
      return "On target";
    case "over":
      return "Over budget";
    case "no_anchor":
      return "No anchor set";
  }
}

export function bandTone(
  band: BudgetAnchorBand,
): "neutral" | "good" | "warn" | "bad" {
  switch (band) {
    case "under":
      return "good";
    case "on_target":
      return "good";
    case "over":
      return "warn";
    case "no_anchor":
      return "neutral";
  }
}
