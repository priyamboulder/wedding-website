// ── Wedding of the Month ───────────────────────────────────────────────────
// Lightweight recognition: the most-saved showcase in a given calendar month
// wins. Computed from (baseSaveCount + user saves this month) on the fly,
// with a stable winner for closed months.

import { listPublishedShowcases, SEED_SHOWCASES } from "@/lib/showcases/seed";
import type {
  MonthlyAward,
  RealWeddingShowcase,
  ShowcaseSave,
} from "@/types/showcase";

// Format a date as "YYYY-MM-01" for bucketing.
export function monthKey(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${y}-${m}-01`;
}

export function currentMonthKey(): string {
  return monthKey(new Date());
}

// Human-readable month label: "March 2026"
export function monthLabel(key: string): string {
  const d = new Date(key);
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

// Compute the winner for a given month from user saves. Ties broken by
// baseSaveCount descending, then by createdAt ascending (older first).
// Returns null if no showcase has any save activity in that month.
export function computeMonthlyWinner(
  month: string,
  saves: ShowcaseSave[],
): MonthlyAward | null {
  const published = listPublishedShowcases();
  if (published.length === 0) return null;

  // Filter saves that happened in the month, then count per showcase.
  const monthSaves = saves.filter((s) => monthKey(new Date(s.savedAt)) === month);
  const savesByShowcase = new Map<string, number>();
  for (const s of monthSaves) {
    savesByShowcase.set(
      s.showcaseId,
      (savesByShowcase.get(s.showcaseId) ?? 0) + 1,
    );
  }

  // Seed: add the showcase's baseline so the banner still has a winner on
  // first visit when no user saves exist. Divide base by 12 so the monthly
  // attribution isn't wildly inflated — the seed just breaks ties in the
  // absence of real activity.
  for (const s of published) {
    const seasoned = Math.max(0, Math.round(s.baseSaveCount / 12));
    savesByShowcase.set(
      s.id,
      (savesByShowcase.get(s.id) ?? 0) + seasoned,
    );
  }

  const entries = Array.from(savesByShowcase.entries());
  if (entries.length === 0) return null;

  entries.sort((a, b) => {
    if (b[1] !== a[1]) return b[1] - a[1];
    const aShow = SEED_SHOWCASES.find((s) => s.id === a[0]);
    const bShow = SEED_SHOWCASES.find((s) => s.id === b[0]);
    if (!aShow || !bShow) return 0;
    if (bShow.baseSaveCount !== aShow.baseSaveCount) {
      return bShow.baseSaveCount - aShow.baseSaveCount;
    }
    return aShow.createdAt.localeCompare(bShow.createdAt);
  });

  const [winnerId, value] = entries[0];
  return {
    id: `award-${month}-${winnerId}`,
    showcaseId: winnerId,
    month,
    metric: "saves",
    value,
  };
}

// Helper for the banner: given a showcase, is it the current month's winner?
export function isCurrentMonthWinner(
  showcaseId: string,
  saves: ShowcaseSave[],
): boolean {
  const winner = computeMonthlyWinner(currentMonthKey(), saves);
  return winner?.showcaseId === showcaseId;
}

export function getCurrentMonthWinner(
  saves: ShowcaseSave[],
): { showcase: RealWeddingShowcase; award: MonthlyAward } | null {
  const award = computeMonthlyWinner(currentMonthKey(), saves);
  if (!award) return null;
  const showcase = SEED_SHOWCASES.find((s) => s.id === award.showcaseId);
  if (!showcase) return null;
  return { showcase, award };
}
