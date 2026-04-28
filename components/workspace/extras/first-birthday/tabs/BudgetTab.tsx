"use client";

// ── Budget & Contributions tab ────────────────────────────────────────────
// Funding model selector up top (parent-funded / family-helped /
// co-host-split / group-fund), a summary strip, an expense table, and a
// contributions tracker. Layout shifts based on funding model — group
// fund surfaces a goal/progress bar, family-helped surfaces contributions
// by relationship.

import { Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { useFirstBirthdayStore } from "@/stores/first-birthday-store";
import {
  EXPENSE_CATEGORY_OPTIONS,
  FUNDING_MODEL_OPTIONS,
} from "@/lib/first-birthday-seed";
import type {
  FirstBirthdayContribution,
  FirstBirthdayExpense,
  FirstBirthdayExpenseCategory,
  FirstBirthdayFundingModel,
} from "@/types/first-birthday";
import { Label, Section, StatusPill, TextInput, formatMoney } from "../../bachelorette/ui";

export function BudgetTab() {
  return (
    <div className="space-y-5">
      <FundingModelSelector />
      <BudgetSummary />
      <ExpenseTable />
      <Contributions />
    </div>
  );
}

// ── Funding model ─────────────────────────────────────────────────────────

function FundingModelSelector() {
  const funding = useFirstBirthdayStore((s) => s.funding);
  const setFundingModel = useFirstBirthdayStore((s) => s.setFundingModel);
  const setGroupFundGoal = useFirstBirthdayStore((s) => s.setGroupFundGoal);
  const groupFundGoal = useFirstBirthdayStore((s) => s.budget.groupFundGoalCents);

  return (
    <Section
      eyebrow="WHO'S COVERING THIS?"
      title="Funding model"
      description="The splitter below changes how contributions are tracked and whether we surface a group-fund goal."
    >
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        {FUNDING_MODEL_OPTIONS.map((opt) => {
          const active = funding === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() =>
                setFundingModel(opt.value as FirstBirthdayFundingModel)
              }
              className={cn(
                "flex items-start justify-between gap-3 rounded-md border px-4 py-3 text-left transition-colors",
                active
                  ? "border-ink bg-ink/5"
                  : "border-border bg-white hover:border-saffron/40",
              )}
              aria-pressed={active}
            >
              <div>
                <p className="font-serif text-[15px] text-ink">{opt.label}</p>
                <p className="mt-0.5 text-[11.5px] text-ink-muted">{opt.hint}</p>
              </div>
              <span
                className={cn(
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors",
                  active
                    ? "border-ink bg-ink text-ivory"
                    : "border-border bg-white text-transparent",
                )}
              >
                ✓
              </span>
            </button>
          );
        })}
      </div>

      {funding === "group_fund" && (
        <div className="mt-4 flex items-end gap-3 rounded-md border border-border/60 bg-ivory-warm/40 p-4">
          <div className="flex-1">
            <Label>Group fund goal</Label>
            <div className="mt-1 flex items-center gap-1">
              <span className="text-[12.5px] text-ink-faint">$</span>
              <input
                type="number"
                value={groupFundGoal / 100}
                onChange={(e) =>
                  setGroupFundGoal(
                    Math.max(0, Math.round(Number(e.target.value) * 100)),
                  )
                }
                className="w-full rounded-md border border-border bg-white px-2 py-1.5 text-[13px] text-ink focus:border-saffron/60 focus:outline-none"
                aria-label="Group fund goal"
              />
            </div>
          </div>
          <p className="max-w-[280px] text-[11.5px] text-ink-muted">
            Guests contribute toward this total. Progress is tracked in the
            Contributions section below.
          </p>
        </div>
      )}
    </Section>
  );
}

// ── Summary ───────────────────────────────────────────────────────────────

function BudgetSummary() {
  const expenses = useFirstBirthdayStore((s) => s.expenses);
  const contributions = useFirstBirthdayStore((s) => s.contributions);
  const budget = useFirstBirthdayStore((s) => s.budget);
  const funding = useFirstBirthdayStore((s) => s.funding);
  const setTotalBudget = useFirstBirthdayStore((s) => s.setTotalBudget);

  const totalSpent = expenses.reduce((acc, e) => acc + e.amountCents, 0);
  const receivedContributions = contributions
    .filter((c) => c.status === "received")
    .reduce((acc, c) => acc + c.amountCents, 0);
  const pledgedContributions = contributions
    .filter((c) => c.status === "pledged")
    .reduce((acc, c) => acc + c.amountCents, 0);

  const groupFundPct =
    budget.groupFundGoalCents > 0
      ? Math.min(
          100,
          Math.round(
            ((receivedContributions + pledgedContributions) /
              budget.groupFundGoalCents) *
              100,
          ),
        )
      : 0;

  return (
    <Section
      eyebrow="SUMMARY"
      title={`${formatMoney(totalSpent)} spent of ${formatMoney(budget.totalBudgetCents)} budget`}
    >
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <SummaryCard
          label="Total budget"
          value={
            <input
              type="number"
              value={budget.totalBudgetCents / 100}
              onChange={(e) =>
                setTotalBudget(
                  Math.max(0, Math.round(Number(e.target.value) * 100)),
                )
              }
              className="w-full rounded-md border border-border bg-white px-2 py-1 font-serif text-[18px] text-ink focus:border-saffron/60 focus:outline-none"
              aria-label="Total budget"
            />
          }
        />
        <SummaryCard label="Spent" value={formatMoney(totalSpent)} tone="ink" />
        <SummaryCard
          label="Contributions received"
          value={formatMoney(receivedContributions)}
          tone="sage"
        />
        <SummaryCard
          label={funding === "group_fund" ? "Pledged" : "Contributions pledged"}
          value={formatMoney(pledgedContributions)}
          tone="gold"
        />
      </div>
      {funding === "group_fund" && budget.groupFundGoalCents > 0 && (
        <div className="mt-4 rounded-md border border-border/60 bg-white p-4">
          <div className="flex items-center justify-between">
            <Label>Group fund progress</Label>
            <span className="font-mono text-[11.5px] text-ink-muted">
              {groupFundPct}%
            </span>
          </div>
          <div className="mt-2 h-2 rounded-full bg-ivory-warm">
            <div
              className="h-full rounded-full bg-ink"
              style={{ width: `${groupFundPct}%` }}
            />
          </div>
        </div>
      )}
    </Section>
  );
}

function SummaryCard({
  label,
  value,
  tone = "ink",
}: {
  label: string;
  value: React.ReactNode;
  tone?: "ink" | "sage" | "gold";
}) {
  const color =
    tone === "sage" ? "text-sage" : tone === "gold" ? "text-gold" : "text-ink";
  return (
    <div className="rounded-md border border-border bg-white px-4 py-3">
      <Label>{label}</Label>
      <div className={cn("mt-1 font-serif text-[18px] leading-tight", color)}>
        {value}
      </div>
    </div>
  );
}

// ── Expense table ─────────────────────────────────────────────────────────

function ExpenseTable() {
  const expenses = useFirstBirthdayStore((s) => s.expenses);
  const addExpense = useFirstBirthdayStore((s) => s.addExpense);
  const updateExpense = useFirstBirthdayStore((s) => s.updateExpense);
  const removeExpense = useFirstBirthdayStore((s) => s.removeExpense);

  return (
    <Section title="Expenses" eyebrow="EVERY LINE">
      <div className="overflow-x-auto rounded-md border border-border">
        <table className="w-full text-left text-[13px]">
          <thead className="bg-ivory-warm/60 text-[10px] uppercase tracking-[0.12em] text-ink-muted">
            <tr>
              <Th>Category</Th>
              <Th>Vendor</Th>
              <Th>Amount</Th>
              <Th>Paid by</Th>
              <Th>Date</Th>
              <Th className="w-8" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60 bg-white text-ink">
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
                  colSpan={6}
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
  children?: React.ReactNode;
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
  expense: FirstBirthdayExpense;
  onUpdate: (patch: Partial<FirstBirthdayExpense>) => void;
  onRemove: () => void;
}) {
  return (
    <tr>
      <td className="px-4 py-2">
        <select
          value={expense.category}
          onChange={(e) =>
            onUpdate({
              category: e.target.value as FirstBirthdayExpenseCategory,
            })
          }
          className="rounded-md border border-border bg-white px-2 py-1 text-[12.5px] text-ink focus:border-saffron/60 focus:outline-none"
        >
          {EXPENSE_CATEGORY_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </td>
      <td className="px-4 py-2">
        <TextInput
          value={expense.vendor}
          onChange={(v) => onUpdate({ vendor: v })}
          placeholder="Vendor"
        />
      </td>
      <td className="px-4 py-2">
        <div className="flex items-center gap-1">
          <span className="text-ink-faint">$</span>
          <input
            type="number"
            value={expense.amountCents / 100}
            onChange={(e) =>
              onUpdate({
                amountCents: Math.max(
                  0,
                  Math.round(Number(e.target.value) * 100),
                ),
              })
            }
            className="w-24 rounded-md border border-border bg-white px-2 py-1 text-[13px] text-ink focus:border-saffron/60 focus:outline-none"
            aria-label={`${expense.vendor} amount`}
          />
        </div>
      </td>
      <td className="px-4 py-2">
        <TextInput
          value={expense.paidBy}
          onChange={(v) => onUpdate({ paidBy: v })}
          placeholder="Parents / family"
        />
      </td>
      <td className="px-4 py-2">
        <TextInput
          value={expense.date}
          onChange={(v) => onUpdate({ date: v })}
          placeholder="YYYY-MM-DD"
        />
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
    category: FirstBirthdayExpenseCategory,
    vendor: string,
    amountCents: number,
    date: string,
    extras?: { paidBy?: string; notes?: string },
  ) => void;
}) {
  const [category, setCategory] =
    useState<FirstBirthdayExpenseCategory>("catering");
  const [vendor, setVendor] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [paidBy, setPaidBy] = useState("");

  function commit() {
    if (!vendor.trim()) return;
    onAdd(
      category,
      vendor.trim(),
      Math.max(0, Math.round(Number(amount) * 100) || 0),
      date.trim(),
      { paidBy: paidBy.trim() || undefined },
    );
    setVendor("");
    setAmount("");
    setDate("");
    setPaidBy("");
  }

  return (
    <div className="mt-3 grid grid-cols-[140px_1fr_110px_140px_120px_auto] gap-2">
      <select
        value={category}
        onChange={(e) =>
          setCategory(e.target.value as FirstBirthdayExpenseCategory)
        }
        className="rounded-md border border-border bg-white px-2 py-1.5 text-[12.5px] text-ink focus:border-saffron/60 focus:outline-none"
      >
        {EXPENSE_CATEGORY_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <TextInput value={vendor} onChange={setVendor} placeholder="Vendor" />
      <TextInput
        value={amount}
        onChange={setAmount}
        placeholder="Amount"
        type="number"
      />
      <TextInput value={paidBy} onChange={setPaidBy} placeholder="Paid by" />
      <TextInput value={date} onChange={setDate} placeholder="Date" />
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

// ── Contributions ─────────────────────────────────────────────────────────

function Contributions() {
  const contributions = useFirstBirthdayStore((s) => s.contributions);
  const addContribution = useFirstBirthdayStore((s) => s.addContribution);
  const updateContribution = useFirstBirthdayStore((s) => s.updateContribution);
  const removeContribution = useFirstBirthdayStore((s) => s.removeContribution);
  const funding = useFirstBirthdayStore((s) => s.funding);

  if (funding === "parent_funded") return null;

  return (
    <Section
      eyebrow="CONTRIBUTIONS"
      title="Who's chipping in"
      description={
        funding === "group_fund"
          ? "Track guest contributions toward the group fund goal."
          : "Track family and co-host contributions so nobody is left guessing."
      }
    >
      <ul className="space-y-2">
        {contributions.map((c) => (
          <ContributionRow
            key={c.id}
            contribution={c}
            onUpdate={(patch) => updateContribution(c.id, patch)}
            onRemove={() => removeContribution(c.id)}
          />
        ))}
        {contributions.length === 0 && (
          <li className="rounded-md border border-dashed border-border bg-ivory-warm/40 px-4 py-6 text-center text-[12.5px] italic text-ink-faint">
            No contributions tracked yet.
          </li>
        )}
      </ul>

      <AddContributionRow onAdd={addContribution} />
    </Section>
  );
}

function ContributionRow({
  contribution,
  onUpdate,
  onRemove,
}: {
  contribution: FirstBirthdayContribution;
  onUpdate: (patch: Partial<FirstBirthdayContribution>) => void;
  onRemove: () => void;
}) {
  return (
    <li className="grid grid-cols-[1fr_1fr_120px_110px_110px_auto] items-center gap-2 rounded-md border border-border bg-white px-3 py-2">
      <TextInput
        value={contribution.contributorName}
        onChange={(v) => onUpdate({ contributorName: v })}
        placeholder="Name"
      />
      <TextInput
        value={contribution.relationship}
        onChange={(v) => onUpdate({ relationship: v })}
        placeholder="Relationship"
      />
      <div className="flex items-center gap-1">
        <span className="text-[12.5px] text-ink-faint">$</span>
        <input
          type="number"
          value={contribution.amountCents / 100}
          onChange={(e) =>
            onUpdate({
              amountCents: Math.max(
                0,
                Math.round(Number(e.target.value) * 100),
              ),
            })
          }
          className="w-full rounded-md border border-border bg-white px-2 py-1 text-[13px] text-ink focus:border-saffron/60 focus:outline-none"
          aria-label={`${contribution.contributorName} amount`}
        />
      </div>
      <TextInput
        value={contribution.method}
        onChange={(v) => onUpdate({ method: v })}
        placeholder="Method"
      />
      <div className="flex items-center gap-1">
        <select
          value={contribution.status}
          onChange={(e) =>
            onUpdate({
              status: e.target.value as FirstBirthdayContribution["status"],
            })
          }
          className="rounded-md border border-border bg-white px-2 py-1 text-[12px] text-ink focus:border-saffron/60 focus:outline-none"
        >
          <option value="pledged">Pledged</option>
          <option value="received">Received</option>
        </select>
        <StatusPill
          tone={contribution.status === "received" ? "sage" : "gold"}
          label={contribution.status}
        />
      </div>
      <button
        type="button"
        aria-label="Remove contribution"
        onClick={onRemove}
        className="text-ink-faint hover:text-rose"
      >
        <Trash2 size={13} strokeWidth={1.8} />
      </button>
    </li>
  );
}

function AddContributionRow({
  onAdd,
}: {
  onAdd: (
    name: string,
    relationship: string,
    amountCents: number,
    date: string,
  ) => void;
}) {
  const [name, setName] = useState("");
  const [relationship, setRelationship] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");

  function commit() {
    if (!name.trim()) return;
    onAdd(
      name.trim(),
      relationship.trim() || "Family",
      Math.max(0, Math.round(Number(amount) * 100) || 0),
      date.trim(),
    );
    setName("");
    setRelationship("");
    setAmount("");
    setDate("");
  }

  return (
    <div className="mt-3 grid grid-cols-[1fr_1fr_110px_120px_auto] gap-2">
      <TextInput value={name} onChange={setName} placeholder="Contributor" />
      <TextInput
        value={relationship}
        onChange={setRelationship}
        placeholder="Relationship"
      />
      <TextInput
        value={amount}
        onChange={setAmount}
        placeholder="Amount"
        type="number"
      />
      <TextInput value={date} onChange={setDate} placeholder="Date" />
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

