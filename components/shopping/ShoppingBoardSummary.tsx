"use client";

import { useMemo } from "react";
import type { ShoppingLink } from "@/lib/link-preview/types";
import {
  statusCounts,
  totalsByCurrency,
  storeTotals,
  spendSplit,
  type ShoppingMode,
} from "@/lib/shopping/filters";

function formatMoney(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

export function ShoppingBoardSummary({
  links,
  mode,
  cartIds,
}: {
  links: ShoppingLink[];
  mode: ShoppingMode;
  cartIds: Set<string>;
}) {
  if (mode === "ananya_store") {
    return <StoreSummary links={links} cartIds={cartIds} />;
  }
  if (mode === "all") {
    return <CombinedSummary links={links} />;
  }
  return <ExternalSummary links={links} />;
}

// ── External Finds (original) ─────────────────────────────────────────────

function ExternalSummary({ links }: { links: ShoppingLink[] }) {
  const totals = useMemo(() => totalsByCurrency(links), [links]);
  const counts = useMemo(() => statusCounts(links), [links]);

  const multiCurrency = totals.length > 1;
  const primary = totals[0];

  return (
    <div
      className="grid grid-cols-2 gap-x-6 gap-y-4 border-b border-gold/15 bg-white px-8 py-4 md:grid-cols-5"
      style={{ fontFamily: "var(--font-mono)" }}
    >
      <SummaryCell
        label="Total Ordered"
        accent
        values={totals.map((t) => ({
          currency: t.currency,
          value: formatMoney(t.ordered, t.currency),
        }))}
        hideCurrency={!multiCurrency}
        emptyFallback="—"
      />
      <SummaryCell
        label="Considering"
        values={totals.map((t) => ({
          currency: t.currency,
          value: formatMoney(t.considering, t.currency),
        }))}
        hideCurrency={!multiCurrency}
        emptyFallback="—"
      />
      <SummaryCell
        label="Received"
        values={[{ currency: "count", value: `${counts.received}` }]}
        hideCurrency
        suffix={counts.received === 1 ? "item" : "items"}
      />
      <SummaryCell
        label="Returned"
        values={[{ currency: "count", value: `${counts.returned}` }]}
        hideCurrency
        suffix={counts.returned === 1 ? "item" : "items"}
      />
      <SummaryCell
        label="All-time Spend"
        accent
        values={totals.map((t) => ({
          currency: t.currency,
          value: formatMoney(t.ordered + t.received, t.currency),
        }))}
        hideCurrency={!multiCurrency}
        emptyFallback="—"
      />
      {multiCurrency && primary && (
        <div className="col-span-2 text-[9.5px] uppercase tracking-wider text-ink-faint md:col-span-5">
          mixed currencies — showing per-currency subtotals
        </div>
      )}
    </div>
  );
}

// ── Ananya Store mode ─────────────────────────────────────────────────────

function StoreSummary({
  links,
  cartIds,
}: {
  links: ShoppingLink[];
  cartIds: Set<string>;
}) {
  const totals = useMemo(() => storeTotals(links, cartIds), [links, cartIds]);
  const counts = useMemo(() => statusCounts(links), [links]);
  const primary = totals[0];
  const multi = totals.length > 1;

  return (
    <div
      className="grid grid-cols-2 gap-x-6 gap-y-4 border-b border-gold/15 bg-ivory-warm/30 px-8 py-4 md:grid-cols-5"
      style={{ fontFamily: "var(--font-mono)" }}
    >
      <SummaryCell
        label="Total Ordered"
        accent
        values={totals.map((t) => ({
          currency: t.currency,
          value: formatMoney(t.ordered, t.currency),
        }))}
        hideCurrency={!multi}
        emptyFallback="—"
      />
      <SummaryCell
        label="In Cart"
        accent
        values={
          primary
            ? [
                {
                  currency: primary.currency,
                  value: formatMoney(primary.inCart, primary.currency),
                },
              ]
            : []
        }
        suffix={
          primary && primary.inCartCount
            ? primary.inCartCount === 1
              ? "item"
              : "items"
            : undefined
        }
        hideCurrency={!multi}
        emptyFallback="—"
      />
      <SummaryCell
        label="In Production"
        values={
          primary
            ? [
                {
                  currency: primary.currency,
                  value: formatMoney(primary.inProduction, primary.currency),
                },
              ]
            : []
        }
        suffix={
          primary && primary.inProductionCount
            ? primary.inProductionCount === 1
              ? "made-to-order"
              : "made-to-order"
            : undefined
        }
        hideCurrency={!multi}
        emptyFallback="—"
      />
      <SummaryCell
        label="Received"
        values={[{ currency: "count", value: `${counts.received}` }]}
        hideCurrency
        suffix={counts.received === 1 ? "item" : "items"}
      />
      <SummaryCell
        label="All-time Spend"
        accent
        values={totals.map((t) => ({
          currency: t.currency,
          value: formatMoney(t.ordered + t.received, t.currency),
        }))}
        hideCurrency={!multi}
        emptyFallback="—"
      />
    </div>
  );
}

// ── All (combined) ────────────────────────────────────────────────────────

function CombinedSummary({ links }: { links: ShoppingLink[] }) {
  const totals = useMemo(() => totalsByCurrency(links), [links]);
  const split = useMemo(() => spendSplit(links), [links]);
  const counts = useMemo(() => statusCounts(links), [links]);
  const primary = totals[0];
  const primarySplit = split[0];
  const multi = totals.length > 1;

  return (
    <div
      className="grid grid-cols-2 gap-x-6 gap-y-4 border-b border-gold/15 bg-white px-8 py-4 md:grid-cols-5"
      style={{ fontFamily: "var(--font-mono)" }}
    >
      <SummaryCell
        label="Total Ordered"
        accent
        values={totals.map((t) => ({
          currency: t.currency,
          value: formatMoney(t.ordered, t.currency),
        }))}
        hideCurrency={!multi}
        emptyFallback="—"
      />
      <SummaryCell
        label="Considering"
        values={totals.map((t) => ({
          currency: t.currency,
          value: formatMoney(t.considering, t.currency),
        }))}
        hideCurrency={!multi}
        emptyFallback="—"
      />
      <SummaryCell
        label="Received"
        values={[{ currency: "count", value: `${counts.received}` }]}
        hideCurrency
        suffix={counts.received === 1 ? "item" : "items"}
      />
      <SummaryCell
        label="Returned"
        values={[{ currency: "count", value: `${counts.returned}` }]}
        hideCurrency
        suffix={counts.returned === 1 ? "item" : "items"}
      />
      <div className="flex flex-col gap-1">
        <span className="text-[9.5px] uppercase tracking-[0.14em] text-ink-faint">
          All-time Spend
        </span>
        {primarySplit ? (
          <div className="flex flex-col gap-0.5">
            <span className="text-[17px] font-semibold text-saffron">
              {formatMoney(primarySplit.total, primarySplit.currency)}
            </span>
            <span className="font-mono text-[9.5px] tracking-wider text-ink-faint">
              {formatMoney(primarySplit.native, primarySplit.currency)} Ananya ·{" "}
              {formatMoney(primarySplit.external, primarySplit.currency)} External
            </span>
          </div>
        ) : (
          <span className="text-[16px] text-ink-faint">—</span>
        )}
      </div>
      {primary && multi && (
        <div className="col-span-2 text-[9.5px] uppercase tracking-wider text-ink-faint md:col-span-5">
          mixed currencies — showing per-currency subtotals
        </div>
      )}
    </div>
  );
}

function SummaryCell({
  label,
  values,
  suffix,
  accent,
  hideCurrency,
  emptyFallback,
}: {
  label: string;
  values: { currency: string; value: string }[];
  suffix?: string;
  accent?: boolean;
  hideCurrency?: boolean;
  emptyFallback?: string;
}) {
  const isEmpty = values.length === 0;
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[9.5px] uppercase tracking-[0.14em] text-ink-faint">
        {label}
      </span>
      {isEmpty ? (
        <span className="text-[16px] text-ink-faint">
          {emptyFallback ?? "—"}
        </span>
      ) : (
        <div className="flex flex-col gap-0.5">
          {values.map((v) => (
            <div key={v.currency} className="flex items-baseline gap-1.5">
              <span
                className={
                  accent
                    ? "text-[17px] font-semibold text-saffron"
                    : "text-[17px] font-medium text-ink"
                }
              >
                {v.value}
              </span>
              {!hideCurrency && (
                <span className="text-[9.5px] uppercase tracking-wider text-ink-faint">
                  {v.currency}
                </span>
              )}
              {suffix && (
                <span className="text-[10px] lowercase tracking-wider text-ink-faint">
                  {suffix}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
