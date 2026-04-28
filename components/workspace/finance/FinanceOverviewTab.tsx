"use client";

// ── Finance Overview tab ──────────────────────────────────────────────────
// Status banner + 4 stat tiles + stacked budget bar (one segment per
// category, palette-tinted) + decisions list. Mirrors the Catering Overview
// language but all data is cross-category financial.

import { useMemo } from "react";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useFinanceStore } from "@/stores/finance-store";
import {
  computeDecisions,
  computeFinanceSummary,
  computeRollups,
} from "@/lib/finance/selectors";
import {
  daysUntil,
  formatDateShort,
  formatDollars,
  formatDollarsShort,
  formatPct,
} from "@/lib/finance/format";
import type { FinanceCategoryId } from "@/types/finance";
import {
  FINANCE_CATEGORY_LABEL,
  FINANCE_CATEGORY_TINT,
} from "@/types/finance";
import {
  CategoryChip,
  FinancePanelCard,
  FinanceSectionHeader,
  FinanceStatTile,
} from "./shared";
import type {
  FinanceDecision,
  FinanceDecisionKind,
} from "@/lib/finance/selectors";

// Active categories source-of-truth is the store — the Overview reads
// visibleCategories() so custom ones appear in the stacked budget bar.

interface Props {
  categoryFilter: FinanceCategoryId | null;
  onNavigate: (
    tab: "budget" | "invoices" | "transactions" | "contributors" | "reports",
  ) => void;
}

export function FinanceOverviewTab({ categoryFilter, onNavigate }: Props) {
  const budgets = useFinanceStore((s) => s.budgets);
  const invoices = useFinanceStore((s) => s.invoices);
  const payments = useFinanceStore((s) => s.payments);
  const storeCategories = useFinanceStore((s) => s.categories);

  const activeCategoryIds = useMemo(
    () =>
      storeCategories
        .filter((c) => !c.hidden)
        .slice()
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((c) => c.id),
    [storeCategories],
  );

  const scopedBudgets = useMemo(
    () => (categoryFilter ? budgets.filter((b) => b.category_id === categoryFilter) : budgets),
    [budgets, categoryFilter],
  );
  const scopedInvoices = useMemo(
    () => (categoryFilter ? invoices.filter((i) => i.category_id === categoryFilter) : invoices),
    [invoices, categoryFilter],
  );
  const scopedPayments = useMemo(() => {
    if (!categoryFilter) return payments;
    const ids = new Set(scopedInvoices.map((i) => i.id));
    return payments.filter((p) => ids.has(p.invoice_id));
  }, [payments, categoryFilter, scopedInvoices]);

  const summary = useMemo(
    () => computeFinanceSummary(scopedBudgets, scopedInvoices, scopedPayments),
    [scopedBudgets, scopedInvoices, scopedPayments],
  );
  const rollups = useMemo(
    () => computeRollups(budgets, invoices, payments, activeCategoryIds),
    [budgets, invoices, payments, activeCategoryIds],
  );
  const decisions = useMemo(
    () => computeDecisions(budgets, invoices, payments, rollups),
    [budgets, invoices, payments, rollups],
  );
  const scopedDecisions = useMemo(
    () =>
      categoryFilter
        ? decisions.filter((d) => d.category_id === categoryFilter)
        : decisions,
    [decisions, categoryFilter],
  );

  const categoryMeta = useMemo(() => {
    const m = new Map<string, { name: string; color: string }>();
    for (const c of storeCategories) {
      m.set(c.id, { name: c.name, color: c.color_class });
    }
    return m;
  }, [storeCategories]);

  return (
    <div className="space-y-5">
      <StatusBanner
        summary={summary}
        decisions={scopedDecisions}
        scoped={!!categoryFilter}
      />
      <StatTiles summary={summary} />
      <BudgetStack
        rollups={rollups}
        categoryFilter={categoryFilter}
        categoryMeta={categoryMeta}
      />
      <DecisionsPanel
        decisions={scopedDecisions}
        onSeeAll={() => onNavigate("invoices")}
      />
    </div>
  );
}

// ── Status banner (matches Catering on-track pattern) ─────────────────────

function StatusBanner({
  summary,
  decisions,
  scoped,
}: {
  summary: ReturnType<typeof computeFinanceSummary>;
  decisions: FinanceDecision[];
  scoped: boolean;
}) {
  const pct =
    summary.totalBudget > 0
      ? (summary.committed / summary.totalBudget) * 100
      : 0;
  const overdueCount = decisions.filter((d) => d.kind === "overdue_invoice").length;
  const dueSoonCount = decisions.filter((d) => d.kind === "upcoming_due").length;
  const overBudgetCount = decisions.filter((d) => d.kind === "over_budget").length;
  const over = summary.committed > summary.totalBudget;

  let level: "on_track" | "needs_attention" | "blocked" = "on_track";
  if (overdueCount > 0 || over || overBudgetCount > 0) level = "blocked";
  else if (dueSoonCount >= 2) level = "needs_attention";

  const parts: string[] = [];
  parts.push(`${Math.round(pct)}% committed`);
  if (overdueCount > 0) parts.push(`${overdueCount} overdue`);
  if (dueSoonCount > 0) parts.push(`${dueSoonCount} due this week`);
  if (overBudgetCount > 0)
    parts.push(
      `${overBudgetCount} categor${overBudgetCount === 1 ? "y" : "ies"} over`,
    );

  const phrase =
    level === "blocked"
      ? "needs attention"
      : level === "needs_attention"
        ? "almost caught up"
        : "on track";
  const prefix = scoped ? "This category" : "Finance";
  const sentence = `${prefix} is ${phrase}${parts.length ? " — " + parts.join(", ") : ""}.`;

  const tone =
    level === "on_track"
      ? "border-sage/40 bg-sage/5 text-ink"
      : level === "needs_attention"
        ? "border-gold/50 bg-gold-light/15 text-ink"
        : "border-rose/50 bg-rose/10 text-ink";
  const Icon =
    level === "blocked"
      ? AlertCircle
      : level === "needs_attention"
        ? Clock
        : Sparkles;
  const iconTone =
    level === "on_track"
      ? "text-sage"
      : level === "needs_attention"
        ? "text-gold"
        : "text-rose";

  return (
    <section
      className={cn(
        "flex items-start gap-3 rounded-lg border px-5 py-4",
        tone,
      )}
    >
      <Icon
        size={16}
        strokeWidth={1.8}
        className={cn("mt-[2px] shrink-0", iconTone)}
      />
      <div className="flex-1">
        <p
          className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-muted"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Status
        </p>
        <p className="mt-1 font-serif text-[17px] leading-snug text-ink">
          {sentence}
        </p>
      </div>
    </section>
  );
}

// ── Stat tiles ────────────────────────────────────────────────────────────

function StatTiles({ summary }: { summary: ReturnType<typeof computeFinanceSummary> }) {
  const committedPct =
    summary.totalBudget > 0
      ? formatPct(summary.committed / summary.totalBudget)
      : "—";
  return (
    <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
      <FinanceStatTile
        label="Total budget"
        value={formatDollars(summary.totalBudget)}
        hint="Across all categories"
        mono
      />
      <FinanceStatTile
        label="Committed"
        value={formatDollars(summary.committed)}
        hint={`${committedPct} of budget`}
        tone={
          summary.committed > summary.totalBudget
            ? "rose"
            : summary.totalBudget > 0 &&
                summary.committed / summary.totalBudget > 0.85
              ? "gold"
              : "ink"
        }
        mono
      />
      <FinanceStatTile
        label="Paid to date"
        value={formatDollars(summary.paid)}
        hint="Deposits + milestones"
        tone="sage"
        mono
      />
      <FinanceStatTile
        label="Upcoming"
        value={formatDollars(summary.upcoming)}
        hint="Due in next 30 days"
        tone={summary.upcoming > 0 ? "gold" : "ink"}
        mono
      />
    </section>
  );
}

// ── Segmented budget bar (one segment per category, tinted) ──────────────

function BudgetStack({
  rollups,
  categoryFilter,
  categoryMeta,
}: {
  rollups: ReturnType<typeof computeRollups>;
  categoryFilter: FinanceCategoryId | null;
  categoryMeta: Map<string, { name: string; color: string }>;
}) {
  const nameFor = (id: string) =>
    categoryMeta.get(id)?.name ??
    FINANCE_CATEGORY_LABEL[id as keyof typeof FINANCE_CATEGORY_LABEL] ??
    "Uncategorized";
  const tintFor = (id: string) =>
    categoryMeta.get(id)?.color ??
    FINANCE_CATEGORY_TINT[id as keyof typeof FINANCE_CATEGORY_TINT] ??
    "bg-ink-faint";
  const totalAllocated = rollups.reduce((s, r) => s + r.allocated_cents, 0);
  const totalCommitted = rollups.reduce((s, r) => s + r.committed_cents, 0);
  const totalQuoted = rollups.reduce((s, r) => s + r.quoted_cents, 0);
  const unallocated = Math.max(0, totalAllocated - totalQuoted);

  return (
    <FinancePanelCard>
      <FinanceSectionHeader
        eyebrow="Allocation"
        title={`${formatDollarsShort(totalCommitted)} committed of ${formatDollarsShort(totalAllocated)}`}
        description="One segment per category — committed, quoted, unallocated"
      />

      {/* Stacked segmented bar: each category gets its allocated width, split */}
      <div className="mb-4 overflow-hidden rounded-md border border-border">
        <div className="flex h-[32px] w-full">
          {rollups
            .filter((r) => r.allocated_cents > 0)
            .map((r) => {
              const widthPct = totalAllocated > 0 ? (r.allocated_cents / totalAllocated) * 100 : 0;
              const commitPct = r.allocated_cents > 0 ? Math.min(100, (r.committed_cents / r.allocated_cents) * 100) : 0;
              const quotedPct = r.allocated_cents > 0 ? Math.min(100, (r.quoted_cents / r.allocated_cents) * 100) : 0;
              const highlighted = !categoryFilter || categoryFilter === r.category_id;
              return (
                <div
                  key={r.category_id}
                  className={cn(
                    "relative h-full border-r border-white last:border-r-0 transition-opacity",
                    !highlighted && "opacity-25",
                  )}
                  style={{ width: `${widthPct}%` }}
                  title={`${nameFor(r.category_id)} — ${formatDollars(r.committed_cents)} of ${formatDollars(r.allocated_cents)} (${formatPct(r.allocated_cents > 0 ? r.committed_cents / r.allocated_cents : 0)})`}
                >
                  {/* unallocated = white/ivory under */}
                  <span className="absolute inset-0 bg-ivory" aria-hidden />
                  {/* quoted = muted tint */}
                  <span
                    className={cn(
                      "absolute inset-y-0 left-0 opacity-40",
                      tintFor(r.category_id),
                    )}
                    style={{ width: `${quotedPct}%` }}
                    aria-hidden
                  />
                  {/* committed = full tint on top */}
                  <span
                    className={cn(
                      "absolute inset-y-0 left-0",
                      tintFor(r.category_id),
                    )}
                    style={{ width: `${commitPct}%` }}
                    aria-hidden
                  />
                </div>
              );
            })}
        </div>
      </div>

      {/* Legend row */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 md:grid-cols-4">
        {rollups
          .filter((r) => r.allocated_cents > 0)
          .map((r) => (
            <div
              key={r.category_id}
              className={cn(
                "flex items-center gap-2 text-[11px] leading-tight",
                categoryFilter && categoryFilter !== r.category_id && "opacity-50",
              )}
            >
              <span
                className={cn(
                  "h-2 w-2 shrink-0 rounded-sm",
                  tintFor(r.category_id),
                )}
                aria-hidden
              />
              <div className="min-w-0">
                <p className="truncate text-ink">
                  {nameFor(r.category_id)}
                </p>
                <p
                  className="font-mono text-[10px] tabular-nums text-ink-muted"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {formatDollarsShort(r.committed_cents)} / {formatDollarsShort(r.allocated_cents)}
                </p>
              </div>
            </div>
          ))}
      </div>

      {unallocated > 0 && (
        <p
          className="mt-4 border-t border-border pt-3 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Unquoted across categories · {formatDollarsShort(unallocated)}
        </p>
      )}
    </FinancePanelCard>
  );
}

// ── Decisions list ────────────────────────────────────────────────────────

function DecisionsPanel({
  decisions,
  onSeeAll,
}: {
  decisions: FinanceDecision[];
  onSeeAll: () => void;
}) {
  const top = decisions.slice(0, 6);
  return (
    <FinancePanelCard>
      <FinanceSectionHeader
        eyebrow="Decisions"
        title={top.length === 0 ? "All caught up" : "Needs attention"}
        right={
          top.length > 0 ? (
            <button
              type="button"
              onClick={onSeeAll}
              className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted transition-colors hover:text-saffron"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Jump to invoices <ArrowRight size={11} strokeWidth={1.8} />
            </button>
          ) : null
        }
      />
      {top.length === 0 ? (
        <div className="flex items-center gap-2 py-2 text-[13px] text-ink-muted">
          <CheckCircle2 size={14} strokeWidth={1.8} className="text-sage" />
          No overdue invoices or looming deposits.
        </div>
      ) : (
        <ul className="divide-y divide-border/50">
          {top.map((d) => (
            <DecisionRow key={d.id} decision={d} />
          ))}
        </ul>
      )}
    </FinancePanelCard>
  );
}

const KIND_TONE: Record<FinanceDecisionKind, string> = {
  overdue_invoice: "text-rose",
  upcoming_due: "text-gold",
  over_budget: "text-rose",
  uncommitted_transaction: "text-saffron",
};

function DecisionRow({ decision }: { decision: FinanceDecision }) {
  const suffix =
    decision.kind === "overdue_invoice"
      ? `${Math.abs(daysUntil(decision.due_date ?? ""))}d overdue`
      : decision.kind === "upcoming_due"
        ? `in ${Math.max(0, daysUntil(decision.due_date ?? ""))}d`
        : "over budget";
  return (
    <li className="flex items-center justify-between gap-3 py-2.5">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-[13px] text-ink">{decision.title}</p>
          {decision.category_id && <CategoryChip category={decision.category_id} size="xs" />}
        </div>
        <p
          className="mt-0.5 font-mono text-[9.5px] uppercase tracking-[0.12em] text-ink-muted"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {decision.subtitle}
          {decision.due_date &&
            decision.kind !== "over_budget" &&
            ` · ${formatDateShort(decision.due_date)}`}
        </p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-0.5">
        <span
          className="font-mono text-[12px] tabular-nums text-ink"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {formatDollars(decision.amount_cents)}
        </span>
        <span
          className={cn(
            "font-mono text-[9.5px] uppercase tracking-[0.12em]",
            KIND_TONE[decision.kind],
          )}
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {suffix}
        </span>
      </div>
    </li>
  );
}
