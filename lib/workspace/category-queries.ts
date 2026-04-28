// ── Pure query helpers for vendor-workspace ↔ checklist integration ────────
// These are framework-free so they can be tested without importing Zustand
// or React. The Zustand store wraps them in stores/checklist-store.ts.
//
// See §2c of the Photography Workspace plan for the selector surface.

import type {
  ChecklistItem,
  ItemStatus,
  WorkspaceCategoryTag,
  WorkspaceTabTag,
} from "@/types/checklist";
import { computeDeadline, isAtRisk as isItemAtRisk } from "@/lib/deadlines";

export type DueBucket = "overdue" | "this_week" | "next_two_weeks" | "later" | "no_date";

const MS_PER_DAY = 1000 * 60 * 60 * 24;

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function hasCategoryTag(
  item: ChecklistItem,
  category: WorkspaceCategoryTag,
): boolean {
  return !!item.category_tags && item.category_tags.includes(category);
}

export function hasTabTag(
  item: ChecklistItem,
  tab: WorkspaceTabTag,
): boolean {
  // Untagged items don't appear in any tab. This is intentional: only tasks
  // explicitly tagged by the seed show up in the workspace surface.
  return !!item.workspace_tab_tags && item.workspace_tab_tags.includes(tab);
}

export interface CategoryFilterOpts {
  tab?: WorkspaceTabTag;
  status?: ItemStatus[];
}

export function filterItemsForCategory(
  items: ChecklistItem[],
  category: WorkspaceCategoryTag,
  opts: CategoryFilterOpts = {},
): ChecklistItem[] {
  const { tab, status } = opts;
  return items.filter((it) => {
    if (!hasCategoryTag(it, category)) return false;
    if (tab && !hasTabTag(it, tab)) return false;
    if (status && !status.includes(it.status)) return false;
    return true;
  });
}

export interface CategoryProgress {
  done: number;
  total: number;
  atRisk: number;
}

export function computeCategoryProgress(
  items: ChecklistItem[],
  category: WorkspaceCategoryTag,
  weddingDate: Date | null,
  now: Date = new Date(),
): CategoryProgress {
  const scoped = filterItemsForCategory(items, category);
  const total = scoped.length;
  let done = 0;
  let atRisk = 0;
  for (const it of scoped) {
    if (it.status === "done") done++;
    else if (isItemAtRisk(it, weddingDate, { now })) atRisk++;
  }
  return { done, total, atRisk };
}

export function bucketForDeadline(
  deadline: Date | null,
  now: Date = new Date(),
): DueBucket {
  if (!deadline) return "no_date";
  const today = startOfDay(now);
  const d = startOfDay(deadline);
  const days = (d.getTime() - today.getTime()) / MS_PER_DAY;
  if (days < 0) return "overdue";
  if (days < 7) return "this_week";
  if (days < 14) return "next_two_weeks";
  return "later";
}

export interface UpcomingTask {
  item: ChecklistItem;
  deadline: Date | null;
  bucket: DueBucket;
  atRisk: boolean;
  isCriticalSoon: boolean;
}

export interface UpcomingOpts {
  tab?: WorkspaceTabTag;
  limit?: number;
  now?: Date;
  includeDone?: boolean;
}

// "Upcoming" = incomplete tasks for this category, sorted by due-date ascending.
// Tasks without a date sort last. Tasks already done/not_applicable are
// excluded unless includeDone=true.
export function getUpcomingForCategory(
  items: ChecklistItem[],
  category: WorkspaceCategoryTag,
  weddingDate: Date | null,
  opts: UpcomingOpts = {},
): UpcomingTask[] {
  const now = opts.now ?? new Date();
  const scoped = filterItemsForCategory(items, category, { tab: opts.tab });

  const rows: UpcomingTask[] = [];
  for (const it of scoped) {
    if (!opts.includeDone && (it.status === "done" || it.status === "not_applicable")) {
      continue;
    }
    const deadline = computeDeadline(it, weddingDate, { now }).date;
    const bucket = bucketForDeadline(deadline, now);
    const atRisk = isItemAtRisk(it, weddingDate, { now });
    // At-risk pulse: critical/high priority landing within 48 h
    const hoursUntil = deadline
      ? (deadline.getTime() - now.getTime()) / (1000 * 60 * 60)
      : Infinity;
    const isCriticalSoon =
      (it.priority === "critical" || it.priority === "high") &&
      hoursUntil <= 48;
    rows.push({ item: it, deadline, bucket, atRisk, isCriticalSoon });
  }

  rows.sort((a, b) => {
    const ta = a.deadline ? a.deadline.getTime() : Number.MAX_SAFE_INTEGER;
    const tb = b.deadline ? b.deadline.getTime() : Number.MAX_SAFE_INTEGER;
    if (ta !== tb) return ta - tb;
    // Tie-break by priority so critical-soon rises.
    const prioOrder: Record<string, number> = {
      critical: 0,
      high: 1,
      medium: 2,
      low: 3,
    };
    return (prioOrder[a.item.priority] ?? 99) - (prioOrder[b.item.priority] ?? 99);
  });

  const limit = opts.limit ?? Infinity;
  return rows.slice(0, limit);
}

export function groupByBucket(
  tasks: UpcomingTask[],
): Record<DueBucket, UpcomingTask[]> {
  const out: Record<DueBucket, UpcomingTask[]> = {
    overdue: [],
    this_week: [],
    next_two_weeks: [],
    later: [],
    no_date: [],
  };
  for (const t of tasks) out[t.bucket].push(t);
  return out;
}

// Format "in 3 days" / "2 days overdue" / "today" / "tomorrow".
export function relativeTimeLabel(deadline: Date, now: Date = new Date()): string {
  const today = startOfDay(now);
  const d = startOfDay(deadline);
  const days = Math.round((d.getTime() - today.getTime()) / MS_PER_DAY);
  if (days === 0) return "Due today";
  if (days === 1) return "Due tomorrow";
  if (days === -1) return "1 day overdue";
  if (days < -1) return `${Math.abs(days)} days overdue`;
  if (days < 7) return `Due in ${days} days`;
  if (days < 14) return `Due in ${days} days`;
  const weeks = Math.round(days / 7);
  if (weeks < 8) return `Due in ${weeks} weeks`;
  const months = Math.round(days / 30);
  return `Due in ${months} mo`;
}
