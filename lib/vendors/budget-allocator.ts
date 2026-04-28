// ── Budget Allocation Advisor ─────────────────────────────────────────────
// Couples set a total wedding budget. We suggest allocations across the 8
// top-level VendorCategory buckets using the existing industry benchmarks
// from ai-recommendations.ts. Couples can override any bucket and we'll
// warn when a bucket is > 50% off-benchmark either way.

import type { VendorCategory } from "@/types/vendor-unified";
import { CATEGORY_BUDGET_SHARE } from "./ai-recommendations";

export interface AllocationEntry {
  category: VendorCategory;
  pct: number;            // 0–1
  pinned: boolean;        // couple has manually set this bucket
}

export const DEFAULT_CATEGORY_ORDER: VendorCategory[] = [
  "catering",
  "decor_florals",
  "wardrobe",
  "photography",
  "entertainment",
  "hmua",
  "pandit_ceremony",
  "stationery",
];

export function suggestAllocation(): AllocationEntry[] {
  return DEFAULT_CATEGORY_ORDER.map((category) => {
    const share = CATEGORY_BUDGET_SHARE[category];
    const midpoint = (share.min + share.max) / 2;
    return { category, pct: midpoint, pinned: false };
  });
}

// Keep totals at ~1.0 after the couple edits one bucket by rescaling the
// remaining unpinned buckets proportionally.
export function rebalanceAllocation(
  entries: AllocationEntry[],
  editedCategory: VendorCategory,
  newPct: number,
): AllocationEntry[] {
  const clampedNew = Math.max(0, Math.min(1, newPct));
  const next: AllocationEntry[] = entries.map((e) =>
    e.category === editedCategory
      ? { ...e, pct: clampedNew, pinned: true }
      : { ...e },
  );

  const pinnedTotal = next
    .filter((e) => e.pinned)
    .reduce((sum, e) => sum + e.pct, 0);

  const remaining = Math.max(0, 1 - pinnedTotal);
  const unpinned = next.filter((e) => !e.pinned);
  const unpinnedTotalBefore = unpinned.reduce((sum, e) => sum + e.pct, 0);

  if (unpinnedTotalBefore === 0) return next;

  const scale = remaining / unpinnedTotalBefore;
  for (const e of next) {
    if (!e.pinned) e.pct = e.pct * scale;
  }
  return next;
}

export function resetPinned(entries: AllocationEntry[]): AllocationEntry[] {
  return entries.map((e) => ({ ...e, pinned: false }));
}

export type BudgetWarning = {
  category: VendorCategory;
  severity: "low" | "high";
  message: string;
};

export function warningsFor(entries: AllocationEntry[]): BudgetWarning[] {
  const warns: BudgetWarning[] = [];
  for (const e of entries) {
    const share = CATEGORY_BUDGET_SHARE[e.category];
    if (e.pct < share.min * 0.6) {
      warns.push({
        category: e.category,
        severity: "low",
        message: `Typically ${Math.round(share.min * 100)}–${Math.round(share.max * 100)}% — you're well below.`,
      });
    } else if (e.pct > share.max * 1.5) {
      warns.push({
        category: e.category,
        severity: "high",
        message: `Typically ${Math.round(share.min * 100)}–${Math.round(share.max * 100)}% — you're well above.`,
      });
    }
  }
  return warns;
}

export function categoryBudgetInr(
  entry: AllocationEntry,
  totalBudgetInr: number,
): number {
  return Math.round(entry.pct * totalBudgetInr);
}
