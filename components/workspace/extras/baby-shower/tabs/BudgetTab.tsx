"use client";

// ── Budget & Contributions tab ────────────────────────────────────────────
// Layout changes based on the funding model selector at the top:
//   host_funded / parent_funded → simple budget tracker
//   co_host_split → per co-host contribution table
//   group_fund → per-guest contribution totals with a goal

import { Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useBabyShowerStore } from "@/stores/baby-shower-store";
import type {
  BabyShowerExpense,
  BabyShowerExpenseCategory,
  BabyShowerFundingModel,
} from "@/types/baby-shower";
import { FUNDING_MODEL_OPTIONS } from "@/lib/baby-shower-seed";
import {
  formatMoney,
  Section,
  StatusPill,
  TextInput,
} from "../../bachelorette/ui";

const EXPENSE_CATEGORY_OPTIONS: {
  value: BabyShowerExpenseCategory;
  label: string;
}[] = [
  { value: "venue", label: "Venue / space" },
  { value: "catering", label: "Catering / food" },
  { value: "decorations", label: "Decorations & florals" },
  { value: "activities", label: "Activities & supplies" },
  { value: "cake_dessert", label: "Cake / mithai / dessert" },
  { value: "invitations", label: "Invitations & paper" },
  { value: "favors", label: "Favors" },
  { value: "rentals", label: "Rentals" },
  { value: "entertainment", label: "Entertainment" },
  { value: "photography", label: "Photography" },
  { value: "mehndi", label: "Mehndi / henna" },
  { value: "other", label: "Other" },
];

export function BudgetTab() {
  const funding = useBabyShowerStore((s) => s.funding);
  const setFunding = useBabyShowerStore((s) => s.setFunding);
  const budget = useBabyShowerStore((s) => s.budget);
  const updateBudget = useBabyShowerStore((s) => s.updateBudget);
  const expenses = useBabyShowerStore((s) => s.expenses);
  const guests = useBabyShowerStore((s) => s.guests);
  const coHosts = useBabyShowerStore((s) => s.coHosts);
  const addExpense = useBabyShowerStore((s) => s.addExpense);
  const updateExpense = useBabyShowerStore((s) => s.updateExpense);
  const removeExpense = useBabyShowerStore((s) => s.removeExpense);

  const spentCents = expenses.reduce((s, e) => s + e.amountCents, 0);

  return (
    <div className="space-y-5">
      <FundingSelector value={funding} onChange={setFunding} />

      {funding === "host_funded" || funding === "parent_funded" ? (
        <SimpleBudgetHeader
          targetCents={budget.totalBudgetCents}
          spentCents={spentCents}
        />
      ) : funding === "co_host_split" ? (
        <CoHostBudgetHeader
          targetCents={budget.totalBudgetCents}
          spentCents={spentCents}
        />
      ) : (
        <GroupFundHeader
          goalCents={budget.groupFundGoalCents}
          contributedCents={guests.reduce(
            (s, g) =>
              g.contributionStatus === "paid"
                ? s + g.contributionCents
                : s,
            0,
          )}
          contributorCount={
            guests.filter(
              (g) => g.contributionStatus === "paid" || g.contributionStatus === "pledged",
            ).length
          }
          totalGuests={guests.length}
        />
      )}

      <Section
        eyebrow={funding === "group_fund" ? "FUND GOAL" : "TOTAL BUDGET"}
        title={funding === "group_fund" ? "Set the fund goal" : "Set the ceiling"}
        description={
          funding === "group_fund"
            ? "What you're trying to raise. Guests see the progress bar, not individual amounts (unless you opt in)."
            : "This is the total event cost — not per person."
        }
      >
        <div className="flex items-center gap-2">
          <span className="text-[13px] text-ink-muted">$</span>
          <TextInput
            type="number"
            value={String(
              (funding === "group_fund"
                ? budget.groupFundGoalCents
                : budget.totalBudgetCents) / 100,
            )}
            onChange={(v) =>
              funding === "group_fund"
                ? updateBudget({
                    groupFundGoalCents: Math.round(Number(v) * 100 || 0),
                  })
                : updateBudget({
                    totalBudgetCents: Math.round(Number(v) * 100 || 0),
                  })
            }
            className="max-w-[180px]"
          />
        </div>
      </Section>

      {funding === "co_host_split" && <CoHostTable coHosts={coHosts} />}

      <Section
        eyebrow="EXPENSES"
        title="What you've spent"
        description="Category, vendor, amount. Receipt scanning coming — for now, add manually."
        right={
          <button
            type="button"
            onClick={() =>
              addExpense({
                category: "other",
                vendor: "",
                amountCents: 0,
                date: "",
                paidBy: "",
                receiptUrl: "",
                notes: "",
                source: "manual",
              })
            }
            className="inline-flex items-center gap-1 rounded-md border border-border bg-white px-3 py-1.5 text-[12px] font-medium text-ink-muted hover:border-saffron/40 hover:text-ink"
          >
            <Plus size={12} strokeWidth={2} />
            Add expense
          </button>
        }
      >
        {expenses.length === 0 ? (
          <p className="text-[13px] italic text-ink-faint">
            Nothing logged yet.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-md border border-border">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="border-b border-border bg-ivory-warm/40 text-left">
                  <Th>Category</Th>
                  <Th>Vendor</Th>
                  <Th>Amount</Th>
                  <Th>Date</Th>
                  <Th>Notes</Th>
                  <Th aria-label="row actions" />
                </tr>
              </thead>
              <tbody>
                {expenses.map((e) => (
                  <ExpenseRow
                    key={e.id}
                    expense={e}
                    onUpdate={(patch) => updateExpense(e.id, patch)}
                    onRemove={() => removeExpense(e.id)}
                  />
                ))}
                <tr className="bg-ivory-warm/40">
                  <Td>
                    <span
                      className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      Total
                    </span>
                  </Td>
                  <Td />
                  <Td>
                    <span className="font-medium text-ink">
                      {formatMoney(spentCents)}
                    </span>
                  </Td>
                  <Td />
                  <Td />
                  <Td />
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </Section>
    </div>
  );
}

// ── Funding selector ──────────────────────────────────────────────────────

function FundingSelector({
  value,
  onChange,
}: {
  value: BabyShowerFundingModel;
  onChange: (v: BabyShowerFundingModel) => void;
}) {
  return (
    <Section
      eyebrow="WHO'S COVERING THIS?"
      title="Pick a funding model"
      description="Changes the view below — co-host split gets a per-host table, group fund tracks guest contributions."
    >
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        {FUNDING_MODEL_OPTIONS.map((opt) => {
          const active = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={cn(
                "flex flex-col items-start gap-0.5 rounded-md border p-3 text-left transition-colors",
                active
                  ? "border-ink bg-ivory-warm/40"
                  : "border-border bg-white hover:border-saffron/40",
              )}
            >
              <span className="text-[13px] font-medium text-ink">
                {active ? "◉ " : "◌ "}
                {opt.label}
              </span>
              <span className="text-[11.5px] text-ink-muted">{opt.blurb}</span>
            </button>
          );
        })}
      </div>
    </Section>
  );
}

// ── Header variants ───────────────────────────────────────────────────────

function SimpleBudgetHeader({
  targetCents,
  spentCents,
}: {
  targetCents: number;
  spentCents: number;
}) {
  const remaining = targetCents - spentCents;
  const pct = targetCents > 0 ? Math.round((spentCents / targetCents) * 100) : 0;
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
      <StatTile label="TOTAL BUDGET" value={formatMoney(targetCents)} sub="Your ceiling" />
      <StatTile label="SPENT" value={formatMoney(spentCents)} sub={`${pct}% of total`} />
      <StatTile
        label="REMAINING"
        value={formatMoney(Math.max(0, remaining))}
        sub={remaining < 0 ? `${formatMoney(-remaining)} over` : "available"}
        tone={remaining < 0 ? "rose" : "sage"}
      />
    </div>
  );
}

function CoHostBudgetHeader({
  targetCents,
  spentCents,
}: {
  targetCents: number;
  spentCents: number;
}) {
  const coHosts = useBabyShowerStore((s) => s.coHosts);
  const collected = coHosts.reduce((s, c) => s + c.paidCents, 0);
  const perHost = coHosts.length > 0 ? targetCents / coHosts.length : 0;
  const remaining = targetCents - collected;
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      <StatTile label="TOTAL" value={formatMoney(targetCents)} sub="All co-hosts" />
      <StatTile label="PER CO-HOST" value={formatMoney(perHost)} sub={`${coHosts.length} hosts`} />
      <StatTile label="COLLECTED" value={formatMoney(collected)} tone="sage" />
      <StatTile
        label="REMAINING"
        value={formatMoney(Math.max(0, remaining))}
        tone={remaining > 0 ? "gold" : "sage"}
      />
    </div>
  );
}

function GroupFundHeader({
  goalCents,
  contributedCents,
  contributorCount,
  totalGuests,
}: {
  goalCents: number;
  contributedCents: number;
  contributorCount: number;
  totalGuests: number;
}) {
  const pct = goalCents > 0 ? Math.round((contributedCents / goalCents) * 100) : 0;
  const remaining = goalCents - contributedCents;
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <StatTile
          label="CONTRIBUTED"
          value={formatMoney(contributedCents)}
          sub={`${pct}% of goal`}
          tone="sage"
        />
        <StatTile
          label="REMAINING"
          value={formatMoney(Math.max(0, remaining))}
          sub="to reach goal"
        />
        <StatTile
          label="CONTRIBUTORS"
          value={`${contributorCount} of ${totalGuests}`}
          sub="guests"
        />
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
        <div
          className="h-full rounded-full bg-sage"
          style={{ width: `${Math.min(100, pct)}%` }}
        />
      </div>
    </div>
  );
}

function StatTile({
  label,
  value,
  sub,
  tone = "ink",
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: "ink" | "sage" | "rose" | "gold";
}) {
  const color =
    tone === "sage"
      ? "text-sage"
      : tone === "rose"
        ? "text-rose"
        : tone === "gold"
          ? "text-gold"
          : "text-ink";
  return (
    <div className="rounded-md border border-border bg-white p-4">
      <p
        className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {label}
      </p>
      <p className={cn("mt-1 font-serif text-[22px] leading-none", color)}>
        {value}
      </p>
      {sub && <p className="mt-1 text-[11.5px] text-ink-faint">{sub}</p>}
    </div>
  );
}

// ── Co-host table ─────────────────────────────────────────────────────────

function CoHostTable({
  coHosts,
}: {
  coHosts: ReturnType<typeof useBabyShowerStore.getState>["coHosts"];
}) {
  const addCoHost = useBabyShowerStore((s) => s.addCoHost);
  const updateCoHost = useBabyShowerStore((s) => s.updateCoHost);
  const removeCoHost = useBabyShowerStore((s) => s.removeCoHost);
  return (
    <Section
      eyebrow="CO-HOSTS"
      title="Who's chipping in"
      description="Track each co-host's share and what they've paid so far."
      right={
        <button
          type="button"
          onClick={() => addCoHost("", "")}
          className="inline-flex items-center gap-1 rounded-md border border-border bg-white px-3 py-1.5 text-[12px] font-medium text-ink-muted hover:border-saffron/40 hover:text-ink"
        >
          <Plus size={12} strokeWidth={2} />
          Add co-host
        </button>
      }
    >
      <div className="overflow-x-auto rounded-md border border-border">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="border-b border-border bg-ivory-warm/40 text-left">
              <Th>Name</Th>
              <Th>Email</Th>
              <Th>Share</Th>
              <Th>Paid</Th>
              <Th>Status</Th>
              <Th aria-label="row actions" />
            </tr>
          </thead>
          <tbody>
            {coHosts.map((c) => {
              const status =
                c.paidCents >= c.shareCents && c.shareCents > 0
                  ? "paid"
                  : c.paidCents > 0
                    ? "partial"
                    : "pending";
              return (
                <tr key={c.id} className="border-b border-border/60 last:border-b-0">
                  <Td>
                    <TextInput
                      value={c.name}
                      onChange={(v) => updateCoHost(c.id, { name: v })}
                      placeholder="Name"
                    />
                  </Td>
                  <Td>
                    <TextInput
                      value={c.email}
                      onChange={(v) => updateCoHost(c.id, { email: v })}
                      placeholder="email@example.com"
                    />
                  </Td>
                  <Td>
                    <div className="flex items-center gap-1">
                      <span className="text-[12px] text-ink-faint">$</span>
                      <TextInput
                        type="number"
                        value={String(c.shareCents / 100)}
                        onChange={(v) =>
                          updateCoHost(c.id, {
                            shareCents: Math.round(Number(v) * 100 || 0),
                          })
                        }
                        className="max-w-[100px]"
                      />
                    </div>
                  </Td>
                  <Td>
                    <div className="flex items-center gap-1">
                      <span className="text-[12px] text-ink-faint">$</span>
                      <TextInput
                        type="number"
                        value={String(c.paidCents / 100)}
                        onChange={(v) =>
                          updateCoHost(c.id, {
                            paidCents: Math.round(Number(v) * 100 || 0),
                            status:
                              Number(v) * 100 >= c.shareCents && c.shareCents > 0
                                ? "paid"
                                : Number(v) > 0
                                  ? "partial"
                                  : "pending",
                          })
                        }
                        className="max-w-[100px]"
                      />
                    </div>
                  </Td>
                  <Td>
                    <StatusPill
                      tone={
                        status === "paid"
                          ? "sage"
                          : status === "partial"
                            ? "gold"
                            : "muted"
                      }
                      label={status}
                    />
                  </Td>
                  <Td>
                    <button
                      type="button"
                      onClick={() => removeCoHost(c.id)}
                      aria-label="Remove co-host"
                      className="text-ink-faint hover:text-rose"
                    >
                      <Trash2 size={13} strokeWidth={1.6} />
                    </button>
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Section>
  );
}

// ── Expense row ───────────────────────────────────────────────────────────

function ExpenseRow({
  expense,
  onUpdate,
  onRemove,
}: {
  expense: BabyShowerExpense;
  onUpdate: (patch: Partial<BabyShowerExpense>) => void;
  onRemove: () => void;
}) {
  return (
    <tr className="border-b border-border/60 last:border-b-0">
      <Td>
        <select
          value={expense.category}
          onChange={(e) =>
            onUpdate({
              category: e.target.value as BabyShowerExpenseCategory,
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
      </Td>
      <Td>
        <TextInput
          value={expense.vendor}
          onChange={(v) => onUpdate({ vendor: v })}
          placeholder="Vendor"
        />
      </Td>
      <Td>
        <div className="flex items-center gap-1">
          <span className="text-[12px] text-ink-faint">$</span>
          <TextInput
            type="number"
            value={String(expense.amountCents / 100)}
            onChange={(v) =>
              onUpdate({
                amountCents: Math.round(Number(v) * 100 || 0),
              })
            }
            className="max-w-[100px]"
          />
        </div>
      </Td>
      <Td>
        <TextInput
          value={expense.date}
          onChange={(v) => onUpdate({ date: v })}
          placeholder="YYYY-MM-DD"
        />
      </Td>
      <Td>
        <TextInput
          value={expense.notes}
          onChange={(v) => onUpdate({ notes: v })}
          placeholder="Notes"
        />
      </Td>
      <Td>
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove expense"
          className="text-ink-faint hover:text-rose"
        >
          <Trash2 size={13} strokeWidth={1.6} />
        </button>
      </Td>
    </tr>
  );
}

function Th({
  children,
  ...rest
}: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      {...rest}
      className="whitespace-nowrap px-3 py-2 text-left font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted"
      style={{ fontFamily: "var(--font-mono)" }}
    >
      {children}
    </th>
  );
}

function Td({ children }: { children?: React.ReactNode }) {
  return <td className="px-3 py-2 align-middle text-[13px] text-ink">{children}</td>;
}
