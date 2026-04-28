"use client";

// ── Budget & Splits tab ────────────────────────────────────────────────────
// The spec's #1 source of awkwardness — handled transparently. Expenses
// with per-line split methods, a splitting rule for the bride, per-guest
// payment tracker, and a private organizer-only note lane. All state
// persists through bachelorette-store.

import {
  Bell,
  Lock,
  Plus,
  Send,
  Trash2,
  Users as UsersIcon,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useBacheloretteStore } from "@/stores/bachelorette-store";
import type {
  Expense,
  ExpenseSplit,
  Guest,
  GuestPayment,
  PaymentStatus,
  SplittingRule,
} from "@/types/bachelorette";
import { cn } from "@/lib/utils";
import {
  formatMoney,
  Label,
  Section,
  StatusPill,
  TextArea,
  TextInput,
} from "../ui";
import { ReceiptUpload } from "@/components/workspace/extras/shared/ReceiptUpload";

export function BudgetTab() {
  const guests = useBacheloretteStore((s) => s.guests);
  const expenses = useBacheloretteStore((s) => s.expenses);
  const addExpense = useBacheloretteStore((s) => s.addExpense);
  return (
    <div className="space-y-5">
      <BudgetSummary />
      <ReceiptUpload
        guests={guests}
        expenses={expenses}
        onAddExpense={(label, cents, split, paidByGuestId) =>
          addExpense(label, cents, split, {
            paidByGuestId,
            meta: { fromReceipt: true },
          })
        }
        personLabel="guest"
      />
      <ExpenseTable />
      <SplittingRuleControl />
      <PaymentTracker />
      <OrganizerNotes />
    </div>
  );
}

// ── Summary ────────────────────────────────────────────────────────────────

function BudgetSummary() {
  const expenses = useBacheloretteStore((s) => s.expenses);
  const guests = useBacheloretteStore((s) => s.guests);
  const payments = useBacheloretteStore((s) => s.payments);
  const budget = useBacheloretteStore((s) => s.budget);

  const going = useMemo(
    () => guests.filter((g) => g.rsvp !== "cant_make_it"),
    [guests],
  );

  const totalCents = expenses.reduce((acc, e) => acc + e.amountCents, 0);
  const collectedCents = Object.values(payments).reduce(
    (acc, p) => acc + p.paidCents,
    0,
  );
  const perPersonCents = computePerPersonCents(expenses, going, budget.splittingRule);

  return (
    <Section
      eyebrow="BUDGET & COST SHARING"
      title={`Total estimated: ${formatMoney(totalCents)}`}
      description="The splitting rule below decides how each line is shared. Keep the math transparent so nobody's guessing."
    >
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <SummaryCard
          label="Per person"
          value={formatMoney(perPersonCents)}
          hint={`${going.length} going`}
        />
        <SummaryCard
          label="Collected"
          value={formatMoney(collectedCents)}
          hint={
            totalCents > 0
              ? `${Math.round((collectedCents / totalCents) * 100)}% of total`
              : "—"
          }
        />
        <SummaryCard
          label="Bride pays"
          value={
            budget.splittingRule === "bride_pays_own"
              ? formatMoney(perPersonCents)
              : "$0"
          }
          hint={
            budget.splittingRule === "bride_pays_own"
              ? "Bride splits equally"
              : "Covered by group"
          }
          tone="rose"
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
      <p className={cn("mt-1 font-serif text-[20px] leading-tight", color)}>
        {value}
      </p>
      {hint && <p className="mt-0.5 text-[11.5px] text-ink-muted">{hint}</p>}
    </div>
  );
}

// ── Expense table ──────────────────────────────────────────────────────────

function ExpenseTable() {
  const expenses = useBacheloretteStore((s) => s.expenses);
  const addExpense = useBacheloretteStore((s) => s.addExpense);
  const updateExpense = useBacheloretteStore((s) => s.updateExpense);
  const removeExpense = useBacheloretteStore((s) => s.removeExpense);
  const guests = useBacheloretteStore((s) => s.guests);

  const going = guests.filter((g) => g.rsvp !== "cant_make_it").length;

  return (
    <Section title="Expenses">
      <div className="overflow-x-auto rounded-md border border-border">
        <table className="w-full text-left text-[13px] text-ink">
          <thead className="bg-ivory-warm/60 text-[10px] uppercase tracking-[0.12em] text-ink-muted">
            <tr>
              <th
                className="px-4 py-2 font-mono text-[10px] font-medium"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Expense
              </th>
              <th
                className="px-4 py-2 font-mono text-[10px] font-medium"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Cost
              </th>
              <th
                className="px-4 py-2 font-mono text-[10px] font-medium"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Split
              </th>
              <th
                className="px-4 py-2 text-right font-mono text-[10px] font-medium"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Per person
              </th>
              <th className="w-8 px-2 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60 bg-white">
            {expenses.map((exp) => (
              <ExpenseRow
                key={exp.id}
                expense={exp}
                going={going}
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

function ExpenseRow({
  expense,
  going,
  onUpdate,
  onRemove,
}: {
  expense: Expense;
  going: number;
  onUpdate: (patch: Partial<Expense>) => void;
  onRemove: () => void;
}) {
  const perPersonCents = splitPerPerson(expense, going);
  return (
    <tr>
      <td className="px-4 py-2">
        <TextInput
          value={expense.label}
          onChange={(v) => onUpdate({ label: v })}
          placeholder="Expense label"
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
                amountCents: Math.max(0, Math.round(Number(e.target.value) * 100)),
              })
            }
            className="w-24 rounded-md border border-border bg-white px-2 py-1 text-[13px] text-ink focus:border-saffron/60 focus:outline-none"
            aria-label={`${expense.label} amount`}
          />
        </div>
      </td>
      <td className="px-4 py-2">
        <select
          value={expense.split.kind}
          onChange={(e) => {
            const kind = e.target.value as ExpenseSplit["kind"];
            if (kind === "custom") {
              onUpdate({ split: { kind, byPerson: {} } });
            } else {
              onUpdate({ split: { kind } as ExpenseSplit });
            }
          }}
          className="rounded-md border border-border bg-white px-2 py-1 text-[12.5px] text-ink focus:border-saffron/60 focus:outline-none"
        >
          <option value="equal">Split equally</option>
          <option value="individual">Individual booking</option>
          <option value="organizers">Organizers cover</option>
          <option value="split_among_guests">Split among guests (bride covered)</option>
          <option value="custom">Custom split</option>
        </select>
      </td>
      <td className="px-4 py-2 text-right font-mono text-[12px] text-ink-muted">
        {perPersonCents === null ? "—" : formatMoney(perPersonCents)}
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
  onAdd: (label: string, amountCents: number, split: ExpenseSplit) => void;
}) {
  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState("");
  function commit() {
    if (!label.trim()) return;
    const cents = Math.max(0, Math.round(Number(amount) * 100) || 0);
    onAdd(label.trim(), cents, { kind: "equal" });
    setLabel("");
    setAmount("");
  }
  return (
    <div className="mt-3 grid grid-cols-[1fr_140px_auto] gap-2">
      <TextInput value={label} onChange={setLabel} placeholder="Expense" />
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
        <Plus size={12} strokeWidth={2} /> Add expense
      </button>
    </div>
  );
}

// ── Splitting rule ─────────────────────────────────────────────────────────

function SplittingRuleControl() {
  const rule = useBacheloretteStore((s) => s.budget.splittingRule);
  const setSplittingRule = useBacheloretteStore((s) => s.setSplittingRule);

  const options: { value: SplittingRule; label: string; hint: string }[] = [
    {
      value: "equal",
      label: "Everyone splits equally",
      hint: "Bride's share divided among guests",
    },
    {
      value: "bride_pays_own",
      label: "Bride pays her own way",
      hint: "Each guest — bride included — pays their share",
    },
    {
      value: "custom",
      label: "Custom split",
      hint: "Assign per-person amounts manually",
    },
  ];

  return (
    <Section title="Splitting rule">
      <div className="grid grid-cols-1 gap-2">
        {options.map((opt) => (
          <label
            key={opt.value}
            className={cn(
              "flex items-start gap-2 rounded-md border px-3 py-2 transition-colors",
              rule === opt.value
                ? "border-ink bg-ink/5"
                : "border-border bg-white hover:border-saffron/40",
            )}
          >
            <input
              type="radio"
              name="splitting-rule"
              checked={rule === opt.value}
              onChange={() => setSplittingRule(opt.value)}
              className="mt-0.5 accent-ink"
            />
            <div>
              <p className="text-[13px] text-ink">{opt.label}</p>
              <p className="mt-0.5 text-[11.5px] text-ink-muted">{opt.hint}</p>
            </div>
          </label>
        ))}
      </div>
    </Section>
  );
}

// ── Payment tracker ────────────────────────────────────────────────────────

function PaymentTracker() {
  const guests = useBacheloretteStore((s) => s.guests);
  const expenses = useBacheloretteStore((s) => s.expenses);
  const payments = useBacheloretteStore((s) => s.payments);
  const budget = useBacheloretteStore((s) => s.budget);
  const recordPayment = useBacheloretteStore((s) => s.recordPayment);
  const setPaymentStatus = useBacheloretteStore((s) => s.setPaymentStatus);

  const going = guests.filter((g) => g.rsvp !== "cant_make_it");
  const perPersonCents = computePerPersonCents(
    expenses,
    going,
    budget.splittingRule,
  );

  return (
    <Section
      eyebrow="PAYMENT TRACKER"
      title="Who owes what"
      right={
        <button
          type="button"
          className="inline-flex items-center gap-1 rounded-md border border-border bg-white px-3 py-1.5 text-[12px] font-medium text-ink-muted transition-colors hover:border-saffron/40 hover:text-saffron"
        >
          <Bell size={12} strokeWidth={1.8} /> Send reminder
        </button>
      }
    >
      <div className="overflow-hidden rounded-md border border-border">
        <table className="w-full text-left text-[13px]">
          <thead className="bg-ivory-warm/60 text-[10px] uppercase tracking-[0.12em] text-ink-muted">
            <tr>
              <th
                className="px-4 py-2 font-mono text-[10px] font-medium"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Person
              </th>
              <th
                className="px-4 py-2 font-mono text-[10px] font-medium"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Owes
              </th>
              <th
                className="px-4 py-2 font-mono text-[10px] font-medium"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Paid
              </th>
              <th
                className="px-4 py-2 font-mono text-[10px] font-medium"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Status
              </th>
              <th
                className="px-4 py-2 text-right font-mono text-[10px] font-medium"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Request
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60 bg-white">
            {going.map((g) => {
              const pay = payments[g.id];
              return (
                <PaymentRow
                  key={g.id}
                  guest={g}
                  owes={perPersonCents}
                  payment={pay}
                  onRecord={(cents) => recordPayment(g.id, cents)}
                  onSetStatus={(status) => setPaymentStatus(g.id, status)}
                />
              );
            })}
            {going.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-6 text-center text-[12.5px] italic text-ink-faint"
                >
                  Add guests to the Guest List first.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Section>
  );
}

function PaymentRow({
  guest,
  owes,
  payment,
  onRecord,
  onSetStatus,
}: {
  guest: Guest;
  owes: number;
  payment: GuestPayment | undefined;
  onRecord: (cents: number) => void;
  onSetStatus: (status: PaymentStatus) => void;
}) {
  const paidCents = payment?.paidCents ?? 0;
  const status: PaymentStatus =
    payment?.status ??
    (paidCents >= owes && owes > 0
      ? "paid"
      : paidCents > 0
        ? "partial"
        : "unpaid");
  const tone: "sage" | "gold" | "muted" =
    status === "paid" ? "sage" : status === "partial" ? "gold" : "muted";

  return (
    <tr>
      <td className="px-4 py-2">
        <p className="text-[13px] text-ink">{guest.name}</p>
        <p className="mt-0.5 text-[11.5px] text-ink-muted">{guest.role}</p>
      </td>
      <td className="px-4 py-2 font-mono text-[12px] text-ink-muted">
        {formatMoney(owes)}
      </td>
      <td className="px-4 py-2">
        <div className="flex items-center gap-1">
          <span className="text-ink-faint">$</span>
          <input
            type="number"
            value={paidCents / 100}
            onChange={(e) =>
              onRecord(Math.max(0, Math.round(Number(e.target.value) * 100)))
            }
            className="w-24 rounded-md border border-border bg-white px-2 py-1 text-[13px] text-ink focus:border-saffron/60 focus:outline-none"
            aria-label={`${guest.name} paid`}
          />
        </div>
      </td>
      <td className="px-4 py-2">
        <div className="flex items-center gap-2">
          <StatusPill tone={tone} label={status} />
          <select
            value={status}
            onChange={(e) => onSetStatus(e.target.value as PaymentStatus)}
            className="rounded-md border border-border bg-white px-1.5 py-0.5 text-[11.5px] text-ink focus:border-saffron/60 focus:outline-none"
          >
            <option value="unpaid">Unpaid</option>
            <option value="partial">Partial</option>
            <option value="paid">Paid</option>
          </select>
        </div>
      </td>
      <td className="px-4 py-2 text-right">
        <button
          type="button"
          className="inline-flex items-center gap-1 rounded-md border border-border bg-white px-2 py-1 text-[11.5px] font-medium text-ink-muted hover:border-saffron/40 hover:text-saffron"
        >
          <Send size={11} strokeWidth={1.8} /> Venmo
        </button>
      </td>
    </tr>
  );
}

// ── Organizer notes ────────────────────────────────────────────────────────

function OrganizerNotes() {
  const notes = useBacheloretteStore((s) => s.organizerNotes);
  const addNote = useBacheloretteStore((s) => s.addOrganizerNote);
  const updateNote = useBacheloretteStore((s) => s.updateOrganizerNote);
  const removeNote = useBacheloretteStore((s) => s.removeOrganizerNote);
  const [draft, setDraft] = useState("");

  function commit() {
    const trimmed = draft.trim();
    if (!trimmed) return;
    addNote(trimmed);
    setDraft("");
  }

  return (
    <Section
      tone="warning"
      eyebrow="🔒 ORGANIZER NOTES (private)"
      title="Planner-only — the bride never sees these"
      description="Financial sensitivity, quiet cover-ups, surprise details — keep them out of the shared view."
      right={
        <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.12em] text-rose">
          <Lock size={10} strokeWidth={2} /> Private
        </span>
      }
    >
      <ul className="space-y-2">
        {notes.map((n) => (
          <li
            key={n.id}
            className="rounded-md border border-rose/20 bg-white px-3 py-2"
          >
            <div className="flex items-start justify-between gap-2">
              <TextArea
                value={n.body}
                onChange={(v) => updateNote(n.id, v)}
                rows={2}
              />
              <button
                type="button"
                aria-label="Remove note"
                onClick={() => removeNote(n.id)}
                className="shrink-0 text-ink-faint hover:text-rose"
              >
                <Trash2 size={13} strokeWidth={1.8} />
              </button>
            </div>
            <p className="mt-1.5 font-mono text-[9.5px] uppercase tracking-[0.12em] text-ink-faint">
              Added {new Date(n.createdAt).toLocaleDateString()}
            </p>
          </li>
        ))}
        {notes.length === 0 && (
          <li className="text-[12.5px] italic text-ink-faint">
            No private notes yet.
          </li>
        )}
      </ul>

      <div className="mt-3 flex items-start gap-2">
        <TextArea
          value={draft}
          onChange={setDraft}
          placeholder="Add a planner-only note…"
          rows={2}
        />
        <button
          type="button"
          onClick={commit}
          className="inline-flex shrink-0 items-center gap-1 self-start rounded-md bg-ink px-3 py-1.5 text-[12px] font-medium text-ivory hover:bg-ink-soft"
        >
          <UsersIcon size={12} strokeWidth={1.8} /> Save note
        </button>
      </div>
    </Section>
  );
}

// ── Math helpers ───────────────────────────────────────────────────────────

function splitPerPerson(expense: Expense, going: number): number | null {
  const { amountCents, split } = expense;
  switch (split.kind) {
    case "individual":
    case "organizers":
      return null;
    case "equal":
      return going > 0 ? Math.round(amountCents / going) : 0;
    case "split_among_guests": {
      // Bride's expense — divided among everyone else
      const divisor = Math.max(1, going - 1);
      return Math.round(amountCents / divisor);
    }
    case "custom":
      return null;
  }
}

function computePerPersonCents(
  expenses: Expense[],
  going: Guest[],
  rule: SplittingRule,
): number {
  if (going.length === 0) return 0;
  // Per-person owed: sum of every expense's per-person allocation that
  // lands on a typical attendee. Individual bookings and organizer
  // coverings are excluded.
  let perPerson = 0;
  const bridePaysShare = rule !== "equal"; // "equal" = bride's share split among guests
  for (const e of expenses) {
    const pp = splitPerPerson(e, going.length);
    if (pp === null) continue;
    if (e.split.kind === "split_among_guests" && bridePaysShare) {
      // When bride pays own way, her expenses aren't re-allocated
      continue;
    }
    perPerson += pp;
  }
  return perPerson;
}
