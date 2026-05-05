// ── Piece lifecycle calculator ────────────────────────────────────────────
// Shared lifecycle status model for any "piece" tracked through procurement.
// Today: jewelry (bridal + groom inventories). Future likely-callers:
// gifting (welcome bag items), wardrobe (per-event outfits), registry
// (high-value items).
//
// Lifecycle states:
//   wishlist  → couple knows they want it, no action yet.
//   sourcing  → actively browsing vendors / talking to jewelers.
//   ordered   → committed, payment in (full or deposit), waiting on
//               delivery.
//   received  → physically in hand. Custody planning starts here.
//
// Auto-promotion rules:
//   • Has actual_delivery_date set in the past → received
//   • Has order_date set + expected_delivery_date in the future → ordered
//     (promotes wishlist/sourcing → ordered, never demotes)
//   • Has vendor_name set with no order_date → sourcing
//     (promotes wishlist → sourcing, never demotes)

export type LifecycleStatus =
  | "wishlist"
  | "sourcing"
  | "ordered"
  | "received";

export const LIFECYCLE_ORDER: Readonly<Record<LifecycleStatus, number>> = {
  wishlist: 0,
  sourcing: 1,
  ordered: 2,
  received: 3,
};

export const LIFECYCLE_LABEL: Readonly<Record<LifecycleStatus, string>> = {
  wishlist: "Wishlist",
  sourcing: "Sourcing",
  ordered: "Ordered",
  received: "Received",
};

export const LIFECYCLE_DESCRIPTION: Readonly<Record<LifecycleStatus, string>> = {
  wishlist: "Want it. Haven't started shopping.",
  sourcing: "Actively browsing or talking to jewellers.",
  ordered: "Committed. Awaiting delivery.",
  received: "In hand. Ready for fittings and custody planning.",
};

export interface LifecycleSignals {
  vendor_name?: string | null;
  order_date?: string | null;
  expected_delivery_date?: string | null;
  actual_delivery_date?: string | null;
}

/**
 * Suggest a status based on signal fields. Never demotes — caller decides
 * whether to apply the suggestion. Returns the *next* status the piece
 * should be in, given the signals; if the signals don't justify any
 * promotion, returns null.
 */
export function suggestLifecycleStatus(
  current: LifecycleStatus,
  signals: LifecycleSignals,
  now: Date = new Date(),
): LifecycleStatus | null {
  const nowMs = now.getTime();

  // Strongest signal: actual_delivery_date in the past → received.
  if (signals.actual_delivery_date) {
    const t = Date.parse(signals.actual_delivery_date);
    if (!Number.isNaN(t) && t <= nowMs) {
      return promoteOnly(current, "received");
    }
  }

  // Order placed → ordered.
  if (signals.order_date) {
    return promoteOnly(current, "ordered");
  }

  // Vendor identified but no order yet → sourcing.
  if (signals.vendor_name && !signals.order_date) {
    return promoteOnly(current, "sourcing");
  }

  return null;
}

function promoteOnly(
  current: LifecycleStatus,
  candidate: LifecycleStatus,
): LifecycleStatus | null {
  return LIFECYCLE_ORDER[candidate] > LIFECYCLE_ORDER[current]
    ? candidate
    : null;
}

/** Tally a list of pieces into a status histogram. */
export function tallyLifecycle<T extends { status: LifecycleStatus }>(
  pieces: ReadonlyArray<T>,
): Record<LifecycleStatus, number> {
  const tally: Record<LifecycleStatus, number> = {
    wishlist: 0,
    sourcing: 0,
    ordered: 0,
    received: 0,
  };
  for (const piece of pieces) {
    tally[piece.status] += 1;
  }
  return tally;
}

/** Returns true if every piece has reached the `received` state. */
export function allReceived<T extends { status: LifecycleStatus }>(
  pieces: ReadonlyArray<T>,
): boolean {
  if (pieces.length === 0) return false;
  return pieces.every((p) => p.status === "received");
}

/** Returns the count of pieces still ahead of (or at) a given step. */
export function countAtOrAhead<T extends { status: LifecycleStatus }>(
  pieces: ReadonlyArray<T>,
  step: LifecycleStatus,
): number {
  const target = LIFECYCLE_ORDER[step];
  return pieces.filter((p) => LIFECYCLE_ORDER[p.status] >= target).length;
}
