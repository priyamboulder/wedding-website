"use client";

// ── Budget tab ────────────────────────────────────────────────────────────
// Lightweight two-person budget — no splits, no payment tracker. Just a
// simple "estimated vs spent" summary, per-category totals, and a line-item
// table. Receipt scanner would plug in here if we wire it up later.

import {
  Plus,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { useFirstAnniversaryStore } from "@/stores/first-anniversary-store";
import type {
  Expense,
  ExpenseCategory,
} from "@/types/first-anniversary";
import { EXPENSE_CATEGORY_OPTIONS } from "@/lib/first-anniversary-seed";
import { formatMoney, Label, Section, TextInput } from "../../bachelorette/ui";

export function BudgetTab() {
  return (
    <div className="space-y-5">
      <BudgetSummary />
      <CategoryBreakdown />
      <ExpenseTable />
    </div>
  );
}

// ── Summary ───────────────────────────────────────────────────────────────

function BudgetSummary() {
  const expenses = useFirstAnniversaryStore((s) => s.expenses);
  const itinerary = useFirstAnniversaryStore((s) => s.itinerary);

  const spentCents = useMemo(
    () => expenses.reduce((acc, e) => acc + e.amountCents, 0),
    [expenses],
  );
  // Estimated = sum of itinerary line costs (what's on the plan).
  const plannedCents = useMemo(
    () =>
      itinerary.reduce((acc, i) => acc + (i.estimatedCostCents ?? 0), 0),
    [itinerary],
  );
  const totalCents = Math.max(plannedCents, spentCents);
  const percent = totalCents > 0 ? Math.min(100, (spentCents / totalCents) * 100) : 0;

  return (
    <Section
      eyebrow="ANNIVERSARY BUDGET"
      title={`Total estimated: ${formatMoney(totalCents)}`}
      description="We pull the estimate from what you've added to the itinerary. Spent updates as you log expenses below."
    >
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <SummaryCard
          label="Estimated"
          value={formatMoney(plannedCents)}
          hint="based on itinerary"
        />
        <SummaryCard
          label="Spent"
          value={formatMoney(spentCents)}
          hint={
            totalCents > 0
              ? `${Math.round((spentCents / totalCents) * 100)}% of estimate`
              : "—"
          }
          tone="sage"
        />
        <SummaryCard
          label="Remaining"
          value={formatMoney(Math.max(0, plannedCents - spentCents))}
          hint={spentCents > plannedCents ? "Over budget" : "Still in range"}
          tone={spentCents > plannedCents ? "rose" : "ink"}
        />
      </div>

      <div className="mt-4 h-1.5 w-full rounded-full bg-ivory-warm">
        <div
          className="h-full rounded-full bg-ink transition-all"
          style={{ width: `${percent}%` }}
          aria-label={`${Math.round(percent)}% spent`}
        />
      </div>
    </Section>
  );
}

function SummaryCard({
  label,
  value,
  hint,
  tone = "ink",
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "ink" | "sage" | "rose";
}) {
  const color =
    tone === "sage" ? "text-sage" : tone === "rose" ? "text-rose" : "text-ink";
  return (
    <div className="rounded-md border border-border bg-white px-4 py-3">
      <Label>{label}</Label>
      <p className={cn("mt-1 font-serif text-[22px] leading-tight", color)}>
        {value}
      </p>
      {hint && <p className="mt-0.5 text-[11.5px] text-ink-muted">{hint}</p>}
    </div>
  );
}

// ── Category breakdown ────────────────────────────────────────────────────

function CategoryBreakdown() {
  const expenses = useFirstAnniversaryStore((s) => s.expenses);

  const totals = useMemo(() => {
    const map: Record<ExpenseCategory, number> = {
      travel: 0,
      accommodations: 0,
      dining: 0,
      activities: 0,
      gifts: 0,
      other: 0,
    };
    for (const e of expenses) map[e.category] += e.amountCents;
    return map;
  }, [expenses]);

  const grandTotal = Object.values(totals).reduce((a, b) => a + b, 0);

  return (
    <Section eyebrow="BY CATEGORY" title="Where the money's going">
      <ul className="grid grid-cols-1 gap-2 md:grid-cols-2">
        {EXPENSE_CATEGORY_OPTIONS.map((opt) => {
          const amount = totals[opt.value];
          const pct = grandTotal > 0 ? (amount / grandTotal) * 100 : 0;
          return (
            <li
              key={opt.value}
              className="rounded-md border border-border bg-white px-3 py-2"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-[13px] text-ink">{opt.label}</p>
                <p className="font-mono text-[12px] text-ink-muted">
                  {formatMoney(amount)}
                </p>
              </div>
              <div className="mt-1.5 h-1 w-full rounded-full bg-ivory-warm">
                <div
                  className="h-full rounded-full bg-saffron"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}

// ── Expense table ─────────────────────────────────────────────────────────

function ExpenseTable() {
  const expenses = useFirstAnniversaryStore((s) => s.expenses);
  const addExpense = useFirstAnniversaryStore((s) => s.addExpense);
  const updateExpense = useFirstAnniversaryStore((s) => s.updateExpense);
  const removeExpense = useFirstAnniversaryStore((s) => s.removeExpense);

  return (
    <Section
      eyebrow="EXPENSES"
      title="Log what you spend"
      description="Track it as you go — lands in the right category, rolls up into the totals above."
    >
      <div className="overflow-x-auto rounded-md border border-border">
        <table className="w-full text-left text-[13px] text-ink">
          <thead className="bg-ivory-warm/60 text-[10px] uppercase tracking-[0.12em] text-ink-muted">
            <tr>
              <Th>Vendor</Th>
              <Th>Category</Th>
              <Th>Date</Th>
              <Th className="text-right">Amount</Th>
              <th className="w-8 px-2 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60 bg-white">
            {expenses.map((exp) => (
              <ExpenseRow
                key={exp.id}
                expense={exp}
                onUpdate={(patch) => updateExpense(exp.id, patch)}
                onRemove={() => removeExpense(exp.id)}
              />
            ))}
            {expenses.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-6 text-center text-[12.5px] italic text-ink-faint"
                >
                  No expenses yet — add the first line below.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <AddExpenseRow onAdd={addExpense} />
    </Section>
  );
}

function Th({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={cn("px-4 py-2 font-mono text-[10px] font-medium", className)}
      style={{ fontFamily: "var(--font-mono)" }}
    >
      {children}
    </th>
  );
}

function ExpenseRow({
  expense,
  onUpdate,
  onRemove,
}: {
  expense: Expense;
  onUpdate: (patch: Partial<Expense>) => void;
  onRemove: () => void;
}) {
  return (
    <tr>
      <td className="px-4 py-2">
        <TextInput
          value={expense.vendor}
          onChange={(v) => onUpdate({ vendor: v })}
          placeholder="Vendor"
        />
      </td>
      <td className="px-4 py-2">
        <select
          value={expense.category}
          onChange={(e) =>
            onUpdate({ category: e.target.value as ExpenseCategory })
          }
          className="rounded-md border border-border bg-white px-2 py-1 text-[12.5px] text-ink focus:border-saffron/60 focus:outline-none"
        >
          {EXPENSE_CATEGORY_OPTIONS.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </td>
      <td className="px-4 py-2">
        <TextInput
          value={expense.date}
          onChange={(v) => onUpdate({ date: v })}
          placeholder="2027-03-14"
          className="max-w-[130px]"
        />
      </td>
      <td className="px-4 py-2 text-right">
        <div className="inline-flex items-center gap-1">
          <span className="text-ink-faint">$</span>
          <input
            type="number"
            value={expense.amountCents / 100}
            onChange={(e) =>
              onUpdate({
                amountCents: Math.max(0, Math.round(Number(e.target.value) * 100)),
              })
            }
            className="w-24 rounded-md border border-border bg-white px-2 py-1 text-right text-[13px] text-ink focus:border-saffron/60 focus:outline-none"
            aria-label={`${expense.vendor} amount`}
          />
        </div>
      </td>
      <td className="px-2 py-2">
        <button
          type="button"
          aria-label="Remove expense"
          onClick={onRemove}
          className="text-ink-faint hover:text-rose"
        >
          <Trash2 size={13} strokeWidth={1.8} />
        </button>
      </td>
    </tr>
  );
}

function AddExpenseRow({
  onAdd,
}: {
  onAdd: (
    category: ExpenseCategory,
    vendor: string,
    amountCents: number,
    date: string,
  ) => void;
}) {
  const [vendor, setVendor] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [category, setCategory] = useState<ExpenseCategory>("dining");

  function commit() {
    if (!vendor.trim()) return;
    const cents = Math.max(0, Math.round(Number(amount) * 100) || 0);
    onAdd(category, vendor.trim(), cents, date.trim() || new Date().toISOString().slice(0, 10));
    setVendor("");
    setAmount("");
    setDate("");
  }

  return (
    <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-[1fr_180px_130px_140px_auto]">
      <TextInput value={vendor} onChange={setVendor} placeholder="Vendor" />
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
        className="rounded-md border border-border bg-white px-2 py-1.5 text-[12.5px] text-ink focus:border-saffron/60 focus:outline-none"
      >
        {EXPENSE_CATEGORY_OPTIONS.map((c) => (
          <option key={c.value} value={c.value}>
            {c.label}
          </option>
        ))}
      </select>
      <TextInput
        value={date}
        onChange={setDate}
        placeholder="YYYY-MM-DD"
      />
      <TextInput
        value={amount}
        onChange={setAmount}
        type="number"
        placeholder="Amount"
      />
      <button
        type="button"
        onClick={commit}
        className="inline-flex shrink-0 items-center gap-1 rounded-md bg-ink px-3 py-1.5 text-[12px] font-medium text-ivory hover:bg-ink-soft"
      >
        <Plus size={12} strokeWidth={2} /> Add
      </button>
    </div>
  );
}
