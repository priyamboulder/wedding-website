"use client";

import { useState } from "react";
import { AlertTriangle, Lock, RotateCcw, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import type { VendorCategory } from "@/types/vendor-unified";
import {
  type AllocationEntry,
  categoryBudgetInr,
  warningsFor,
} from "@/lib/vendors/budget-allocator";
import { TOP_CATEGORY_ICON, TOP_CATEGORY_LABEL } from "@/lib/vendors/taxonomy";

export function BudgetAllocator({
  totalBudgetInr,
  allocation,
  onEditTotal,
  onEditAllocation,
  onReset,
}: {
  totalBudgetInr: number;
  allocation: AllocationEntry[];
  onEditTotal: (inr: number) => void;
  onEditAllocation: (category: VendorCategory, pct: number) => void;
  onReset: () => void;
}) {
  const warnings = warningsFor(allocation);
  const warnByCategory = new Map(warnings.map((w) => [w.category, w]));

  return (
    <div className="flex flex-col gap-5 rounded-[14px] border border-border bg-white p-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Wallet size={16} strokeWidth={1.8} className="text-gold" />
          <h3 className="font-serif text-[16px] text-ink">Budget allocator</h3>
        </div>
        <div className="flex items-center gap-4">
          <BudgetInput value={totalBudgetInr} onChange={onEditTotal} />
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1 text-[12px] text-ink-muted transition-colors hover:text-ink"
          >
            <RotateCcw size={11} strokeWidth={1.8} />
            Reset
          </button>
        </div>
      </header>

      {/* Stacked bar */}
      <div className="flex h-8 w-full overflow-hidden rounded-full border border-border bg-ivory-warm">
        {allocation.map((e) => (
          <div
            key={e.category}
            title={`${TOP_CATEGORY_LABEL[e.category]} · ${Math.round(e.pct * 100)}%`}
            className={cn(
              "flex items-center justify-center overflow-hidden text-[9.5px] font-medium text-ivory transition-[width] duration-200",
              categoryColor(e.category),
            )}
            style={{ width: `${e.pct * 100}%` }}
          >
            {e.pct > 0.06 && (
              <span className="truncate px-1">
                {TOP_CATEGORY_ICON[e.category]}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Rows */}
      <div className="flex flex-col divide-y divide-border">
        {allocation.map((e) => (
          <AllocationRow
            key={e.category}
            entry={e}
            totalBudgetInr={totalBudgetInr}
            warning={warnByCategory.get(e.category)}
            onEdit={(pct) => onEditAllocation(e.category, pct)}
          />
        ))}
      </div>
    </div>
  );
}

function BudgetInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (n: number) => void;
}) {
  const [draft, setDraft] = useState<string>(value.toString());

  function commit() {
    const n = parseInt(draft.replace(/[^\d]/g, ""), 10);
    if (Number.isFinite(n)) onChange(n);
    else setDraft(value.toString());
  }

  return (
    <label className="flex items-baseline gap-1.5 rounded-full border border-border bg-white px-3 py-1.5 text-[13px] text-ink">
      <span className="font-mono text-[11px] text-ink-muted">Total</span>
      <span className="font-serif text-[13px]">₹</span>
      <input
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") (e.target as HTMLInputElement).blur();
        }}
        className="w-28 bg-transparent font-mono text-[13px] text-ink outline-none"
      />
    </label>
  );
}

function AllocationRow({
  entry,
  totalBudgetInr,
  warning,
  onEdit,
}: {
  entry: AllocationEntry;
  totalBudgetInr: number;
  warning: ReturnType<typeof warningsFor>[number] | undefined;
  onEdit: (pct: number) => void;
}) {
  const pct = Math.round(entry.pct * 100);
  const inr = categoryBudgetInr(entry, totalBudgetInr);

  return (
    <div className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:gap-4">
      <div className="flex min-w-[180px] items-center gap-2">
        <span className="text-[14px]">{TOP_CATEGORY_ICON[entry.category]}</span>
        <span className="font-serif text-[13.5px] text-ink">
          {TOP_CATEGORY_LABEL[entry.category]}
        </span>
        {entry.pinned && (
          <Lock
            size={10}
            strokeWidth={1.8}
            className="text-gold"
          />
        )}
      </div>

      <input
        type="range"
        min={0}
        max={60}
        step={0.5}
        value={pct}
        onChange={(e) => onEdit(parseFloat(e.target.value) / 100)}
        className="flex-1 accent-gold"
      />

      <div className="flex min-w-[140px] items-center justify-end gap-3">
        <span
          className="w-10 text-right font-mono text-[11.5px] text-ink"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {pct}%
        </span>
        <span
          className="font-mono text-[11px] text-ink-muted"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {formatInr(inr)}
        </span>
      </div>

      {warning && (
        <div
          className={cn(
            "flex shrink-0 items-center gap-1 text-[11px]",
            warning.severity === "low" ? "text-ink-muted" : "text-rose",
          )}
          title={warning.message}
        >
          <AlertTriangle size={11} strokeWidth={1.8} />
          {warning.severity === "low" ? "Low" : "High"}
        </div>
      )}
    </div>
  );
}

function categoryColor(category: VendorCategory): string {
  const map: Record<VendorCategory, string> = {
    photography: "bg-gold",
    decor_florals: "bg-rose",
    catering: "bg-saffron",
    entertainment: "bg-teal",
    hmua: "bg-gold-light",
    wardrobe: "bg-sage",
    pandit_ceremony: "bg-ink",
    stationery: "bg-ink-muted",
  };
  return map[category];
}

function formatInr(n: number): string {
  if (n >= 1_00_00_000) return `₹${(n / 1_00_00_000).toFixed(2)}Cr`;
  if (n >= 1_00_000) return `₹${Math.round(n / 1_00_000)}L`;
  if (n >= 1_000) return `₹${Math.round(n / 1_000)}K`;
  return `₹${Math.round(n)}`;
}
