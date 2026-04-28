// ── Real Numbers — selectors, aggregates, auto-populate ───────────────────
// Pure helpers that read from the real-numbers + finance stores. No React.
// Aggregates respect MIN_SUBMISSIONS thresholds so small samples never leak
// as authoritative-looking numbers.

import type { FinanceBudget, FinanceInvoice, FinancePayment } from "@/types/finance";
import { FINANCE_CATEGORY_LABEL } from "@/types/finance";
import type { WorkspaceCategorySlug } from "@/types/workspace";
import {
  EVENTS_BUCKET_DEF,
  GUEST_COUNT_BUCKET_DEF,
  MIN_SUBMISSIONS_FOR_AGGREGATE,
  MIN_SUBMISSIONS_FOR_DEEP_DIVE,
  type CostFilterState,
  type CostItem,
  type CostSubmission,
  type CulturalTradition,
  type EventsBucket,
  type GuestCountBucket,
  type WeddingStyle,
  type WorthIt,
} from "@/types/real-numbers";

// ── Formatting ────────────────────────────────────────────────────────────
export function formatUsd(cents: number | null | undefined): string {
  if (cents == null) return "—";
  return `$${Math.round(cents / 100).toLocaleString("en-US")}`;
}

export function formatUsdK(cents: number | null | undefined): string {
  if (cents == null) return "—";
  const dollars = cents / 100;
  if (dollars >= 1000) {
    return `$${Math.round(dollars / 1000)}K`;
  }
  return `$${Math.round(dollars)}`;
}

export function formatPct(ratio: number, digits = 1): string {
  return `${ratio >= 0 ? "+" : ""}${ratio.toFixed(digits)}%`;
}

export const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
] as const;

export function monthLabel(month: number): string {
  return MONTH_LABELS[Math.max(1, Math.min(12, month)) - 1] ?? "";
}

// ── Stats helpers ─────────────────────────────────────────────────────────
export function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

export function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

// ── Filter matching ───────────────────────────────────────────────────────
export function emptyFilter(): CostFilterState {
  return {
    city: "",
    guest_count_range: "any",
    styles: [],
    cultures: [],
    year_min: null,
    year_max: null,
    events_range: "any",
  };
}

function bucketRange<
  T extends { id: string; min: number; max: number },
>(defs: T[], id: string): { min: number; max: number } | null {
  const def = defs.find((d) => d.id === id);
  return def ? { min: def.min, max: def.max } : null;
}

export function guestBucketRange(id: GuestCountBucket | "any") {
  if (id === "any") return null;
  return bucketRange(GUEST_COUNT_BUCKET_DEF, id);
}

export function eventsBucketRange(id: EventsBucket | "any") {
  if (id === "any") return null;
  return bucketRange(EVENTS_BUCKET_DEF, id);
}

export function matchesFilter(
  s: CostSubmission,
  f: CostFilterState,
): boolean {
  if (!s.is_published) return false;

  if (f.city.trim()) {
    const needle = f.city.trim().toLowerCase();
    if (!s.wedding_city.toLowerCase().includes(needle)) return false;
  }

  const guest = guestBucketRange(f.guest_count_range);
  if (guest) {
    if (s.guest_count < guest.min || s.guest_count > guest.max) return false;
  }

  if (f.styles.length > 0) {
    const overlaps = f.styles.some((x) => s.wedding_style.includes(x));
    if (!overlaps) return false;
  }

  if (f.cultures.length > 0) {
    const overlaps = f.cultures.some((x) =>
      s.cultural_tradition.includes(x),
    );
    if (!overlaps) return false;
  }

  if (f.year_min != null && s.wedding_year < f.year_min) return false;
  if (f.year_max != null && s.wedding_year > f.year_max) return false;

  const events = eventsBucketRange(f.events_range);
  if (events) {
    if (
      s.number_of_events < events.min ||
      s.number_of_events > events.max
    )
      return false;
  }

  return true;
}

// ── Aggregate shapes ──────────────────────────────────────────────────────
export interface AggregateTotals {
  median_cents: number;
  average_cents: number;
  min_cents: number;
  max_cents: number;
  per_guest_median_cents: number;
  pct_over_budget_avg: number;
  pct_went_over: number;
  distribution: Array<{ bucket: string; min_cents: number; max_cents: number; count: number }>;
}

export interface CategoryAggregate {
  vendor_category: string;
  label: string;
  submission_count: number;
  median_cents: number;
  average_cents: number;
  min_cents: number;
  max_cents: number;
  pct_of_total: number;
  worth_it: Record<WorthIt, number>; // percentage 0-100
  avg_budget_variance_pct: number;
}

export interface WorthItRanking {
  category: string;
  label: string;
  pct: number; // 0-100 for the leading sentiment
  count: number;
}

export interface BudgetVsReality {
  pct_went_over: number;
  avg_overage_pct: number;
  biggest_overages: Array<{ category: string; label: string; variance_pct: number }>;
  biggest_savings: Array<{ category: string; label: string; variance_pct: number }>;
}

export interface AggregateResult {
  total_submissions: number;
  meets_minimum_threshold: boolean;
  totals: AggregateTotals | null;
  categories: CategoryAggregate[];
  worth_it_best: WorthItRanking[];
  worth_it_worst: WorthItRanking[];
  budget_vs_reality: BudgetVsReality | null;
}

// ── Category label helper ─────────────────────────────────────────────────
export function categoryLabel(slug: string): string {
  const asWs = slug as WorkspaceCategorySlug;
  if (asWs in FINANCE_CATEGORY_LABEL) {
    return FINANCE_CATEGORY_LABEL[asWs];
  }
  // Custom / unknown fallback — prettify the slug.
  return slug
    .split("_")
    .map((w) => (w.length > 0 ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

// ── Distribution histogram ────────────────────────────────────────────────
function buildDistribution(
  values: number[],
  buckets = 7,
): AggregateTotals["distribution"] {
  if (values.length === 0) return [];
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (min === max) {
    return [
      { bucket: formatUsdK(min), min_cents: min, max_cents: max, count: values.length },
    ];
  }
  const width = (max - min) / buckets;
  const out: AggregateTotals["distribution"] = [];
  for (let i = 0; i < buckets; i += 1) {
    const lo = min + i * width;
    const hi = i === buckets - 1 ? max : min + (i + 1) * width;
    const count = values.filter((v) => v >= lo && v <= hi).length;
    out.push({
      bucket: `${formatUsdK(lo)}–${formatUsdK(hi)}`,
      min_cents: lo,
      max_cents: hi,
      count,
    });
  }
  return out;
}

// ── Main aggregator ───────────────────────────────────────────────────────
export function computeAggregate(
  submissions: CostSubmission[],
  items: CostItem[],
): AggregateResult {
  const count = submissions.length;
  if (count === 0) {
    return {
      total_submissions: 0,
      meets_minimum_threshold: false,
      totals: null,
      categories: [],
      worth_it_best: [],
      worth_it_worst: [],
      budget_vs_reality: null,
    };
  }

  const totalsList = submissions.map((s) => s.total_actual_cents);
  const perGuest = submissions.map(
    (s) => s.total_actual_cents / Math.max(1, s.guest_count),
  );
  const overBudgetPcts = submissions
    .filter((s) => s.total_budget_cents > 0)
    .map(
      (s) =>
        ((s.total_actual_cents - s.total_budget_cents) /
          s.total_budget_cents) *
        100,
    );
  const wentOver = submissions.filter(
    (s) => s.total_actual_cents > s.total_budget_cents,
  ).length;

  const totals: AggregateTotals = {
    median_cents: median(totalsList),
    average_cents: average(totalsList),
    min_cents: Math.min(...totalsList),
    max_cents: Math.max(...totalsList),
    per_guest_median_cents: median(perGuest),
    pct_over_budget_avg: average(overBudgetPcts),
    pct_went_over: (wentOver / count) * 100,
    distribution: buildDistribution(totalsList),
  };

  // Filter items to those belonging to these submissions.
  const subIds = new Set(submissions.map((s) => s.id));
  const scopedItems = items.filter((it) => subIds.has(it.submission_id));

  // Bucket by category.
  const byCategory = new Map<string, CostItem[]>();
  for (const it of scopedItems) {
    if (!byCategory.has(it.vendor_category)) {
      byCategory.set(it.vendor_category, []);
    }
    byCategory.get(it.vendor_category)!.push(it);
  }

  const totalActualSum = totalsList.reduce((a, b) => a + b, 0);

  const categories: CategoryAggregate[] = [];
  for (const [cat, list] of byCategory.entries()) {
    const actuals = list.map((x) => x.actual_cents);
    const worth: Record<WorthIt, number> = {
      absolutely: 0,
      fair: 0,
      overpaid: 0,
      skip_next_time: 0,
    };
    let worthTotal = 0;
    for (const it of list) {
      if (it.worth_it) {
        worth[it.worth_it] += 1;
        worthTotal += 1;
      }
    }
    const worthPct: Record<WorthIt, number> = {
      absolutely: worthTotal ? (worth.absolutely / worthTotal) * 100 : 0,
      fair: worthTotal ? (worth.fair / worthTotal) * 100 : 0,
      overpaid: worthTotal ? (worth.overpaid / worthTotal) * 100 : 0,
      skip_next_time: worthTotal ? (worth.skip_next_time / worthTotal) * 100 : 0,
    };

    const variances = list
      .filter((x) => x.budgeted_cents != null && x.budgeted_cents > 0)
      .map(
        (x) =>
          ((x.actual_cents - (x.budgeted_cents as number)) /
            (x.budgeted_cents as number)) *
          100,
      );

    const sumActuals = actuals.reduce((a, b) => a + b, 0);

    categories.push({
      vendor_category: cat,
      label: categoryLabel(cat),
      submission_count: list.length,
      median_cents: median(actuals),
      average_cents: average(actuals),
      min_cents: Math.min(...actuals),
      max_cents: Math.max(...actuals),
      pct_of_total: totalActualSum > 0 ? (sumActuals / totalActualSum) * 100 : 0,
      worth_it: worthPct,
      avg_budget_variance_pct: average(variances),
    });
  }

  categories.sort((a, b) => b.median_cents - a.median_cents);

  // Worth-it rankings (only include categories with >= 5 sentiment responses).
  const catsWithSentiment = categories.filter((c) => {
    const total =
      c.worth_it.absolutely + c.worth_it.fair + c.worth_it.overpaid + c.worth_it.skip_next_time;
    return total > 0 && c.submission_count >= Math.min(5, count);
  });

  const best: WorthItRanking[] = [...catsWithSentiment]
    .sort((a, b) => b.worth_it.absolutely - a.worth_it.absolutely)
    .slice(0, 3)
    .map((c) => ({
      category: c.vendor_category,
      label: c.label,
      pct: c.worth_it.absolutely,
      count: c.submission_count,
    }));

  const worst: WorthItRanking[] = [...catsWithSentiment]
    .sort((a, b) => b.worth_it.overpaid - a.worth_it.overpaid)
    .slice(0, 3)
    .map((c) => ({
      category: c.vendor_category,
      label: c.label,
      pct: c.worth_it.overpaid,
      count: c.submission_count,
    }));

  // Budget vs reality
  const byCatVariances: Array<{
    category: string;
    label: string;
    variance_pct: number;
  }> = categories
    .filter((c) => Number.isFinite(c.avg_budget_variance_pct))
    .map((c) => ({
      category: c.vendor_category,
      label: c.label,
      variance_pct: c.avg_budget_variance_pct,
    }));

  const biggestOverages = [...byCatVariances]
    .filter((x) => x.variance_pct > 0)
    .sort((a, b) => b.variance_pct - a.variance_pct)
    .slice(0, 3);

  const biggestSavings = [...byCatVariances]
    .filter((x) => x.variance_pct < 0)
    .sort((a, b) => a.variance_pct - b.variance_pct)
    .slice(0, 3);

  const budgetVsReality: BudgetVsReality = {
    pct_went_over: totals.pct_went_over,
    avg_overage_pct: totals.pct_over_budget_avg,
    biggest_overages: biggestOverages,
    biggest_savings: biggestSavings,
  };

  return {
    total_submissions: count,
    meets_minimum_threshold: count >= MIN_SUBMISSIONS_FOR_AGGREGATE,
    totals,
    categories,
    worth_it_best: best,
    worth_it_worst: worst,
    budget_vs_reality: budgetVsReality,
  };
}

// ── Category deep-dive ────────────────────────────────────────────────────
export interface CategoryDeepDive {
  category: string;
  label: string;
  submission_count: number;
  meets_threshold: boolean;
  median_cents: number;
  average_cents: number;
  min_cents: number;
  max_cents: number;
  distribution: AggregateTotals["distribution"];
  worth_it: Record<WorthIt, number>;
  by_guest_count: Array<{
    range: string;
    bucket: GuestCountBucket;
    median_cents: number;
    count: number;
  }>;
  avg_budget_variance_pct: number;
  insight: string;
}

export function computeCategoryDeepDive(
  category: string,
  submissions: CostSubmission[],
  items: CostItem[],
): CategoryDeepDive {
  const subIds = new Set(submissions.map((s) => s.id));
  const scoped = items.filter(
    (it) => subIds.has(it.submission_id) && it.vendor_category === category,
  );

  const actuals = scoped.map((x) => x.actual_cents);
  const worth: Record<WorthIt, number> = {
    absolutely: 0,
    fair: 0,
    overpaid: 0,
    skip_next_time: 0,
  };
  let worthTotal = 0;
  for (const it of scoped) {
    if (it.worth_it) {
      worth[it.worth_it] += 1;
      worthTotal += 1;
    }
  }
  const worthPct: Record<WorthIt, number> = {
    absolutely: worthTotal ? (worth.absolutely / worthTotal) * 100 : 0,
    fair: worthTotal ? (worth.fair / worthTotal) * 100 : 0,
    overpaid: worthTotal ? (worth.overpaid / worthTotal) * 100 : 0,
    skip_next_time: worthTotal ? (worth.skip_next_time / worthTotal) * 100 : 0,
  };

  const variances = scoped
    .filter((x) => x.budgeted_cents != null && x.budgeted_cents > 0)
    .map(
      (x) =>
        ((x.actual_cents - (x.budgeted_cents as number)) /
          (x.budgeted_cents as number)) *
        100,
    );

  const itemsBySub = new Map(scoped.map((it) => [it.submission_id, it]));
  const byGuest = GUEST_COUNT_BUCKET_DEF.map((def) => {
    const matched = submissions.filter(
      (s) => s.guest_count >= def.min && s.guest_count <= def.max,
    );
    const spends = matched
      .map((s) => itemsBySub.get(s.id)?.actual_cents ?? null)
      .filter((v): v is number => v != null);
    return {
      range: def.label,
      bucket: def.id,
      median_cents: median(spends),
      count: spends.length,
    };
  }).filter((b) => b.count > 0);

  const avgVariance = average(variances);
  let insight = "";
  if (scoped.length >= 5 && Number.isFinite(avgVariance)) {
    if (avgVariance > 7) {
      insight = `Most brides underbudget ${categoryLabel(category).toLowerCase()} by ${avgVariance.toFixed(0)}% on average — leave a buffer.`;
    } else if (avgVariance < -5) {
      insight = `Most brides come in ${Math.abs(avgVariance).toFixed(0)}% under budget here — you can likely allocate less than you think.`;
    } else {
      insight = `Brides tend to land within a few percent of their initial budget in this category.`;
    }
  }

  return {
    category,
    label: categoryLabel(category),
    submission_count: scoped.length,
    meets_threshold: scoped.length >= MIN_SUBMISSIONS_FOR_DEEP_DIVE,
    median_cents: median(actuals),
    average_cents: average(actuals),
    min_cents: actuals.length ? Math.min(...actuals) : 0,
    max_cents: actuals.length ? Math.max(...actuals) : 0,
    distribution: buildDistribution(actuals),
    worth_it: worthPct,
    by_guest_count: byGuest,
    avg_budget_variance_pct: avgVariance,
    insight,
  };
}

// ── Auto-populate from finance store ──────────────────────────────────────
// Maps budget-tracker categories + invoices/payments into the contribution
// form shape. "Actual" is sum of paid_cents on invoices for the category;
// "budgeted" is the finance_budgets.allocated_cents.

export interface AutoPopulateInput {
  budgets: FinanceBudget[];
  invoices: FinanceInvoice[];
  payments: FinancePayment[];
}

export interface AutoPopulateResult {
  total_budget_cents: number;
  total_actual_cents: number;
  items: Array<{
    vendor_category: WorkspaceCategorySlug | string;
    budgeted_cents: number;
    actual_cents: number;
  }>;
}

export function autoPopulateFromFinance(
  input: AutoPopulateInput,
): AutoPopulateResult {
  const { budgets, invoices, payments } = input;

  // Map invoice id → paid amount (sum of payments).
  const paidByInvoice = new Map<string, number>();
  for (const p of payments) {
    paidByInvoice.set(
      p.invoice_id,
      (paidByInvoice.get(p.invoice_id) ?? 0) + p.amount_cents,
    );
  }

  // Aggregate actual (paid) by category.
  const actualByCat = new Map<string, number>();
  for (const inv of invoices) {
    const paid = paidByInvoice.get(inv.id) ?? 0;
    if (paid === 0) continue;
    actualByCat.set(
      inv.category_id,
      (actualByCat.get(inv.category_id) ?? 0) + paid,
    );
  }

  // Aggregate budgeted by category.
  const budgetByCat = new Map<string, number>();
  for (const b of budgets) {
    budgetByCat.set(
      b.category_id,
      (budgetByCat.get(b.category_id) ?? 0) + b.allocated_cents,
    );
  }

  const cats = new Set<string>([
    ...budgetByCat.keys(),
    ...actualByCat.keys(),
  ]);

  const items: AutoPopulateResult["items"] = [];
  for (const cat of cats) {
    items.push({
      vendor_category: cat,
      budgeted_cents: budgetByCat.get(cat) ?? 0,
      actual_cents: actualByCat.get(cat) ?? 0,
    });
  }

  // Hide all-zero rows (cat with no budget or actual spend).
  const filtered = items.filter(
    (it) => it.budgeted_cents > 0 || it.actual_cents > 0,
  );

  const totalBudget = filtered.reduce((s, it) => s + it.budgeted_cents, 0);
  const totalActual = filtered.reduce((s, it) => s + it.actual_cents, 0);

  return {
    total_budget_cents: totalBudget,
    total_actual_cents: totalActual,
    items: filtered,
  };
}

// ── Distinct cities list for filter autocomplete ─────────────────────────
export function distinctCities(submissions: CostSubmission[]): string[] {
  const set = new Set<string>();
  for (const s of submissions) {
    if (s.is_published) set.add(s.wedding_city);
  }
  return Array.from(set).sort();
}

// Budget variance summary for an individual submission — used on the card.
export function submissionVariancePct(s: CostSubmission): number {
  if (s.total_budget_cents <= 0) return 0;
  return (
    ((s.total_actual_cents - s.total_budget_cents) / s.total_budget_cents) * 100
  );
}

// Tag builders for the card header
export function styleLabelList(styles: WeddingStyle[]): string {
  return styles.join(" · ");
}

export function cultureLabelList(cultures: CulturalTradition[]): string {
  const map: Record<CulturalTradition, string> = {
    south_asian: "south asian",
    western: "western",
    east_asian: "east asian",
    middle_eastern: "middle eastern",
    african: "african",
    latin_american: "latin american",
    fusion: "fusion",
    other: "other",
  };
  return cultures.map((c) => map[c]).join(" · ");
}
