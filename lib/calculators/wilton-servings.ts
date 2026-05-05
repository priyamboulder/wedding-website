// ── Wilton-style cake serving calculator ───────────────────────────────────
// Approximation of Wilton's wedding-cake party-serving chart (1×2×4 in
// slices). Rounds in a planning direction — real cakes are oversized by
// about 20% to allow for the thinner wedding-style slice. Confirm exact
// counts with your baker before ordering.
//
// Used by both the full Cake Design Builder workspace tab (Tab 3) and the
// Sweets Selection guided journey's Cake Design session.

export type TierShape = "round" | "square" | "hexagon";

const PARTY_SLICE_AREA = 4; // 2 in × 2 in baseline used in Wilton chart

export function servingsFor(size: number, shape: TierShape): number {
  if (!size || size <= 0) return 0;
  const sq = size * size;
  if (shape === "round") {
    const radius = size / 2;
    return Math.round((Math.PI * radius * radius) / PARTY_SLICE_AREA);
  }
  if (shape === "hexagon") {
    return Math.round((0.866 * sq) / PARTY_SLICE_AREA);
  }
  // Square (default)
  return Math.round(sq / PARTY_SLICE_AREA);
}

export function totalServings(
  tiers: ReadonlyArray<{ size: number; shape: TierShape }>,
): number {
  return tiers.reduce((sum, t) => sum + servingsFor(t.size, t.shape), 0);
}
