"use client";

// ── Budget & Registry tab ──────────────────────────────────────────────────
// Budget envelope with line items + over-budget suggestions, and a registry
// fund grid (goal vs raised). Registry is flagged as connected to the Registry
// workspace — the cross-module link is wired as aspirational.

import { CheckCircle2, Plus, Share2, Sparkles, X } from "lucide-react";
import { useMemo, useState } from "react";
import {
  BUDGET_CATEGORY_OPTIONS,
  FUNDING_SOURCE_OPTIONS,
} from "@/lib/honeymoon-seed";
import { useHoneymoonStore } from "@/stores/honeymoon-store";
import type {
  BudgetLine,
  BudgetLineCategory,
  RegistryFundItem,
} from "@/types/honeymoon";
import { cn } from "@/lib/utils";
import {
  Label,
  Section,
  TextInput,
  formatMoney,
} from "../../bachelorette/ui";
import { TripSeederPanel } from "../TripSeederPanel";
import type { DestinationConcept } from "@/lib/honeymoon/destination-catalog";

// Parses a free-form cost estimate like "€600–€900 for 6 hours" or
// "$180 per person" into a single USD figure suitable for a registry
// goal. Returns null if the experience isn't fundable (no price, "Free",
// or under $80 couple-total — too small to ask a guest to fund).
//
// Rough EUR → USD conversion (×1.08) is baked in. A full implementation
// would pull live rates; for registry-goal estimation this is plenty.
function giftableAmountUsd(costEstimate: string): number | null {
  const s = costEstimate.trim();
  if (!s || /^free$/i.test(s)) return null;

  // Pull out up to two numbers. Matches 600, 1,200, 1.2k, etc. (k handled
  // explicitly for future-proofing; we don't currently use k).
  const nums = Array.from(s.matchAll(/(\d[\d,]*)/g))
    .map((m) => Number(m[1].replace(/,/g, "")))
    .filter((n) => Number.isFinite(n));
  if (nums.length === 0) return null;

  const lo = nums[0]!;
  const hi = nums.length > 1 ? nums[1]! : lo;
  let mid = (lo + hi) / 2;

  // EUR → USD
  if (/€/.test(s)) mid *= 1.08;

  // Per-person → couple total
  if (/per\s*person|\/\s*person|pp\b/i.test(s)) mid *= 2;

  const rounded = Math.round(mid / 5) * 5;
  if (rounded < 80) return null;
  return rounded;
}

export function BudgetRegistryTab() {
  return (
    <div className="space-y-5">
      <BudgetSeeder />
      <BudgetPanel />
      <BudgetLines />
      <RegistrySection />
    </div>
  );
}

// ── Budget seeder ─────────────────────────────────────────────────────────
// Pulls six budget lines (flights, accommodation, food, activities,
// transport, misc) from the leading destination's moneyMath using the
// midpoint of each range. Also sets the total budget envelope if it's
// currently empty. Detects already-seeded lines by matching the
// "{category} — from {title} guide" label pattern so re-clicks are no-ops.

const BUDGET_SEEDER_SUFFIX = (conceptTitle: string) =>
  ` — from ${conceptTitle} guide`;

function BudgetSeeder() {
  const addBudgetLine = useHoneymoonStore((s) => s.addBudgetLine);
  const budgetLines = useHoneymoonStore((s) => s.budgetLines);
  const budget = useHoneymoonStore((s) => s.budget);
  const setTotalBudget = useHoneymoonStore((s) => s.setTotalBudget);

  function seededLabels(concept: DestinationConcept): string[] {
    const suffix = BUDGET_SEEDER_SUFFIX(concept.title);
    return [
      `Flights${suffix}`,
      `Accommodation${suffix}`,
      `Food & drink${suffix}`,
      `Activities & experiences${suffix}`,
      `Transportation${suffix}`,
      `Miscellaneous${suffix}`,
    ];
  }

  return (
    <TripSeederPanel
      eyebrow="TRIP BUDGET"
      title="Seed your budget from the trip guide"
      copyWithConcept={(t) =>
        `Six budget lines at the midpoint of the ${t} money math. Gives you a realistic baseline in seconds — tune each line after.`
      }
      copyWithoutConcept="Mark one of your matched destinations as Leading and we'll scaffold your budget from its money math."
      isAlreadySeeded={(concept) => {
        const labels = seededLabels(concept);
        const existing = new Set(
          budgetLines.map((b) => b.label.trim().toLowerCase()),
        );
        return labels.every((l) => existing.has(l.trim().toLowerCase()));
      }}
      actionLabel={() => "Seed 6 budget lines"}
      onSeed={(concept) => {
        const mm = concept.deepDive?.moneyMath;
        if (!mm) return;
        const mid = ([lo, hi]: [number, number]) =>
          Math.round(((lo + hi) / 2) * 100);
        const suffix = BUDGET_SEEDER_SUFFIX(concept.title);

        const rows: {
          label: string;
          category: BudgetLineCategory;
          cents: number;
        }[] = [
          { label: `Flights${suffix}`, category: "flights", cents: mid(mm.flights) },
          {
            label: `Accommodation${suffix}`,
            category: "accommodation",
            cents: mid(mm.accommodation),
          },
          { label: `Food & drink${suffix}`, category: "food", cents: mid(mm.food) },
          {
            label: `Activities & experiences${suffix}`,
            category: "activities",
            cents: mid(mm.activities),
          },
          {
            label: `Transportation${suffix}`,
            category: "transport",
            cents: mid(mm.transport),
          },
          {
            label: `Miscellaneous${suffix}`,
            category: "other",
            cents: mid(mm.misc),
          },
        ];

        const existing = new Set(
          budgetLines.map((b) => b.label.trim().toLowerCase()),
        );
        let addedTotal = 0;
        for (const r of rows) {
          if (existing.has(r.label.trim().toLowerCase())) continue;
          addBudgetLine(r.label, r.category, r.cents);
          addedTotal += r.cents;
        }

        // If the couple hasn't set a total budget yet, use the sum of the
        // midpoints as a reasonable starting envelope so the "planned
        // spend" doesn't immediately surface as over-budget.
        if (budget.totalBudgetCents === 0 && addedTotal > 0) {
          setTotalBudget(addedTotal);
        }
      }}
    />
  );
}

// ── 4.1 Budget panel & line items ─────────────────────────────────────────

function BudgetPanel() {
  const budget = useHoneymoonStore((s) => s.budget);
  const budgetLines = useHoneymoonStore((s) => s.budgetLines);
  const setTotalBudget = useHoneymoonStore((s) => s.setTotalBudget);
  const toggleFundingSource = useHoneymoonStore((s) => s.toggleFundingSource);

  const totalCents = useMemo(
    () => budgetLines.reduce((sum, b) => sum + b.amountCents, 0),
    [budgetLines],
  );
  const overBy = totalCents - budget.totalBudgetCents;

  return (
    <Section
      eyebrow="HONEYMOON BUDGET"
      title="Trip envelope"
      description="Set a total, split it across categories, and let the registry pick up the rest."
    >
      <div className="mb-5">
        <Label>Source of funding — select all that apply</Label>
        <div className="mt-2 grid grid-cols-2 gap-1.5 md:grid-cols-4">
          {FUNDING_SOURCE_OPTIONS.map((opt) => {
            const active = budget.fundingSources.includes(opt.value);
            return (
              <label
                key={opt.value}
                className={cn(
                  "flex items-center gap-2 rounded-md border px-3 py-2 text-[12.5px] transition-colors cursor-pointer",
                  active
                    ? "border-ink bg-ink/5 text-ink"
                    : "border-border bg-white text-ink-muted hover:border-saffron/40",
                )}
              >
                <input
                  type="checkbox"
                  checked={active}
                  onChange={() => toggleFundingSource(opt.value)}
                  className="accent-ink"
                />
                {opt.label}
              </label>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <Label>Total budget</Label>
          <div className="mt-2 flex items-center gap-2">
            <span className="font-mono text-[14px] text-ink-muted">$</span>
            <input
              type="number"
              value={Math.round(budget.totalBudgetCents / 100)}
              onChange={(e) =>
                setTotalBudget(Math.max(0, Number(e.target.value) || 0) * 100)
              }
              className="w-40 rounded-md border border-border bg-white px-3 py-1.5 text-[14px] text-ink focus:border-saffron/60 focus:outline-none"
              aria-label="Total budget"
            />
          </div>
        </div>
        <div>
          <Label>Planned spend</Label>
          <p
            className={cn(
              "mt-2 font-serif text-[20px] leading-tight",
              overBy > 0 ? "text-rose" : "text-ink",
            )}
          >
            {formatMoney(totalCents)}
            {overBy > 0 && (
              <span className="ml-2 font-mono text-[11px] uppercase tracking-[0.1em] text-rose">
                · {formatMoney(overBy)} over
              </span>
            )}
          </p>
        </div>
      </div>

      {overBy > 0 && (
        <div className="mt-4 rounded-md border border-rose/35 bg-rose-pale/30 p-4">
          <div className="flex items-start gap-2">
            <Sparkles
              size={14}
              strokeWidth={1.8}
              className="mt-0.5 shrink-0 text-rose"
            />
            <div>
              <p className="text-[13px] text-ink">
                You're {formatMoney(overBy)} over budget. Options:
              </p>
              <ul className="mt-1 list-disc pl-5 text-[12.5px] text-ink-muted">
                <li>Downgrade one accommodation line (often the biggest lever).</li>
                <li>Move the surplus into the honeymoon registry.</li>
                <li>Shorten the trip by a night or two.</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </Section>
  );
}

// ── Budget line items ──────────────────────────────────────────────────────

function BudgetLines() {
  const budgetLines = useHoneymoonStore((s) => s.budgetLines);
  const addBudgetLine = useHoneymoonStore((s) => s.addBudgetLine);

  const [draftLabel, setDraftLabel] = useState("");
  const [draftCategory, setDraftCategory] = useState<BudgetLineCategory>("other");
  const [draftAmount, setDraftAmount] = useState("");

  function commit() {
    const amount = Math.max(0, Number(draftAmount) || 0) * 100;
    if (!draftLabel.trim()) return;
    addBudgetLine(draftLabel.trim(), draftCategory, amount);
    setDraftLabel("");
    setDraftAmount("");
  }

  return (
    <Section eyebrow="LINE ITEMS" title="Expenses">
      <ul className="divide-y divide-border/40">
        {budgetLines.map((b) => (
          <BudgetLineRow key={b.id} line={b} />
        ))}
      </ul>

      <div className="mt-4 grid grid-cols-[1fr_160px_120px_auto] gap-2">
        <TextInput
          value={draftLabel}
          onChange={setDraftLabel}
          placeholder="Label (e.g. Cooking class)"
        />
        <select
          value={draftCategory}
          onChange={(e) =>
            setDraftCategory(e.target.value as BudgetLineCategory)
          }
          className="rounded-md border border-border bg-white px-2 py-1.5 text-[12.5px] text-ink focus:border-saffron/60 focus:outline-none"
        >
          {BUDGET_CATEGORY_OPTIONS.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
        <TextInput
          value={draftAmount}
          onChange={setDraftAmount}
          placeholder="Amount"
          type="number"
        />
        <button
          type="button"
          onClick={commit}
          className="inline-flex items-center gap-1 rounded-md bg-ink px-3 py-1.5 text-[12px] font-medium text-ivory hover:bg-ink-soft"
        >
          <Plus size={11} strokeWidth={2} /> Add
        </button>
      </div>
    </Section>
  );
}

function BudgetLineRow({ line }: { line: BudgetLine }) {
  const updateBudgetLine = useHoneymoonStore((s) => s.updateBudgetLine);
  const removeBudgetLine = useHoneymoonStore((s) => s.removeBudgetLine);

  return (
    <li className="grid grid-cols-[1fr_160px_140px_auto_auto] items-center gap-3 py-2.5">
      <input
        value={line.label}
        onChange={(e) => updateBudgetLine(line.id, { label: e.target.value })}
        className="border-none bg-transparent text-[13px] text-ink focus:outline-none"
        aria-label="Line label"
      />
      <select
        value={line.category}
        onChange={(e) =>
          updateBudgetLine(line.id, {
            category: e.target.value as BudgetLineCategory,
          })
        }
        className="rounded-sm border border-transparent bg-transparent px-1 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted hover:border-border focus:border-saffron/60 focus:outline-none"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {BUDGET_CATEGORY_OPTIONS.map((c) => (
          <option key={c.value} value={c.value}>
            {c.label}
          </option>
        ))}
      </select>
      <div className="flex items-center gap-1 text-right">
        <span className="text-ink-muted">$</span>
        <input
          type="number"
          value={Math.round(line.amountCents / 100)}
          onChange={(e) =>
            updateBudgetLine(line.id, {
              amountCents: Math.max(0, Number(e.target.value) || 0) * 100,
            })
          }
          className="w-20 border-none bg-transparent text-right font-mono text-[12.5px] tabular-nums text-ink focus:outline-none"
          aria-label="Amount"
        />
        <label
          title="Estimated"
          className="inline-flex items-center gap-1 font-mono text-[9.5px] uppercase tracking-[0.1em] text-ink-faint"
        >
          <input
            type="checkbox"
            checked={line.estimated}
            onChange={(e) =>
              updateBudgetLine(line.id, { estimated: e.target.checked })
            }
            className="accent-ink"
          />
          est
        </label>
      </div>
      <button
        type="button"
        onClick={() => updateBudgetLine(line.id, { paid: !line.paid })}
        className={cn(
          "inline-flex items-center gap-1 rounded-sm px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em]",
          line.paid
            ? "bg-sage-pale/60 text-sage"
            : "bg-ivory-warm text-ink-muted",
        )}
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {line.paid && <CheckCircle2 size={10} strokeWidth={2} />}
        {line.paid ? "Paid" : "Planned"}
      </button>
      <button
        type="button"
        onClick={() => removeBudgetLine(line.id)}
        className="text-ink-faint hover:text-rose"
        aria-label="Remove line"
      >
        <X size={13} strokeWidth={2} />
      </button>
    </li>
  );
}

// ── 4.2 Registry ───────────────────────────────────────────────────────────

function RegistrySection() {
  const budget = useHoneymoonStore((s) => s.budget);
  const items = useHoneymoonStore((s) => s.registryFundItems);
  const addRegistryFund = useHoneymoonStore((s) => s.addRegistryFund);
  const updateBudgetSettings = useHoneymoonStore(
    (s) => s.updateBudgetSettings,
  );

  function seededLabel(experienceName: string, conceptTitle: string): string {
    return `${experienceName} · ${conceptTitle}`;
  }

  const [draftLabel, setDraftLabel] = useState("");
  const [draftGoal, setDraftGoal] = useState("");

  function commit() {
    if (!draftLabel.trim()) return;
    addRegistryFund(
      draftLabel.trim(),
      Math.max(0, Number(draftGoal) || 0) * 100,
    );
    setDraftLabel("");
    setDraftGoal("");
  }

  const totalGoal = items.reduce((sum, i) => sum + i.goalCents, 0);
  const totalRaised = items.reduce((sum, i) => sum + i.raisedCents, 0);
  const pct = totalGoal > 0 ? Math.round((totalRaised / totalGoal) * 100) : 0;

  return (
    <Section
      eyebrow="HONEYMOON REGISTRY"
      title="Let guests contribute to experiences"
      description="Instead of a physical gift, guests can fund parts of your trip."
      right={
        <div className="flex items-center gap-2">
          <label className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted">
            <input
              type="checkbox"
              checked={budget.registryConnected}
              onChange={(e) =>
                updateBudgetSettings({ registryConnected: e.target.checked })
              }
              className="accent-ink"
            />
            Connected to Registry workspace
          </label>
        </div>
      }
    >
      {budget.registryConnected && (
        <div className="mb-4 rounded-md border border-sage/30 bg-sage-pale/30 px-3 py-2 text-[12px] text-ink-muted">
          ✓ Linked — {formatMoney(totalRaised)} raised of{" "}
          {formatMoney(totalGoal)} ({pct}%)
        </div>
      )}

      <div className="mb-4">
        <TripSeederPanel
          eyebrow="GIFTABLE MOMENTS"
          title="Turn trip experiences into registry funds"
          copyWithConcept={(t) =>
            `Pulls the registry-worthy experiences from the ${t} guide — the big boat day, the cooking class, the spa morning — and creates one fund item per experience so guests can gift specific moments.`
          }
          copyWithoutConcept="Mark a matched destination as Leading to seed fundable experiences from its trip guide."
          isAlreadySeeded={(concept) => {
            const dive = concept.deepDive;
            if (!dive) return false;
            const giftable = dive.experiences.filter(
              (e) => giftableAmountUsd(e.costEstimate) !== null && e.category !== "skip",
            );
            if (giftable.length === 0) return false;
            const existing = new Set(
              items.map((i) => i.label.trim().toLowerCase()),
            );
            return giftable.every((e) =>
              existing.has(seededLabel(e.name, concept.title).trim().toLowerCase()),
            );
          }}
          actionLabel={(concept) => {
            const n = concept.deepDive?.experiences.filter(
              (e) => giftableAmountUsd(e.costEstimate) !== null && e.category !== "skip",
            ).length ?? 0;
            return `Seed ${n} fund item${n === 1 ? "" : "s"}`;
          }}
          onSeed={(concept) => {
            const dive = concept.deepDive;
            if (!dive) return;
            const existing = new Set(
              items.map((i) => i.label.trim().toLowerCase()),
            );
            for (const exp of dive.experiences) {
              if (exp.category === "skip") continue;
              const amount = giftableAmountUsd(exp.costEstimate);
              if (amount === null) continue;
              const label = seededLabel(exp.name, concept.title);
              if (existing.has(label.trim().toLowerCase())) continue;
              addRegistryFund(label, amount * 100);
            }
          }}
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-[12.5px]">
          <thead>
            <tr className="border-b border-border/60">
              <th className="px-3 pb-2 text-left font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted">
                Experience
              </th>
              <th className="px-3 pb-2 text-right font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted">
                Goal
              </th>
              <th className="px-3 pb-2 text-right font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted">
                Raised
              </th>
              <th className="px-3 pb-2 text-left font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted">
                Status
              </th>
              <th className="pb-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {items.map((item) => (
              <RegistryRow key={item.id} item={item} />
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 grid grid-cols-[1fr_140px_auto] gap-2">
        <TextInput
          value={draftLabel}
          onChange={setDraftLabel}
          placeholder="Fund item (e.g. Snorkel trip)"
        />
        <TextInput
          value={draftGoal}
          onChange={setDraftGoal}
          placeholder="Goal $"
          type="number"
        />
        <button
          type="button"
          onClick={commit}
          className="inline-flex items-center gap-1 rounded-md bg-ink px-3 py-1.5 text-[12px] font-medium text-ivory hover:bg-ink-soft"
        >
          <Plus size={11} strokeWidth={2} /> Add
        </button>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-[12px] font-medium text-ink-muted transition-colors hover:border-saffron/40 hover:text-saffron"
        >
          <Share2 size={12} strokeWidth={1.8} />
          Share registry page
        </button>
      </div>
    </Section>
  );
}

function RegistryRow({ item }: { item: RegistryFundItem }) {
  const updateRegistryFund = useHoneymoonStore((s) => s.updateRegistryFund);
  const removeRegistryFund = useHoneymoonStore((s) => s.removeRegistryFund);

  const pct =
    item.goalCents > 0
      ? Math.round((item.raisedCents / item.goalCents) * 100)
      : 0;
  const full = pct >= 100;

  return (
    <tr>
      <td className="px-3 py-2">
        <input
          value={item.label}
          onChange={(e) =>
            updateRegistryFund(item.id, { label: e.target.value })
          }
          className="w-full border-none bg-transparent text-[13px] text-ink focus:outline-none"
          aria-label="Fund label"
        />
      </td>
      <td className="px-3 py-2 text-right">
        <div className="flex items-center justify-end gap-1">
          <span className="text-ink-muted">$</span>
          <input
            type="number"
            value={Math.round(item.goalCents / 100)}
            onChange={(e) =>
              updateRegistryFund(item.id, {
                goalCents: Math.max(0, Number(e.target.value) || 0) * 100,
              })
            }
            className="w-20 border-none bg-transparent text-right font-mono text-[12.5px] tabular-nums text-ink focus:outline-none"
            aria-label="Goal"
          />
        </div>
      </td>
      <td className="px-3 py-2 text-right">
        <div className="flex items-center justify-end gap-1">
          <span className="text-ink-muted">$</span>
          <input
            type="number"
            value={Math.round(item.raisedCents / 100)}
            onChange={(e) =>
              updateRegistryFund(item.id, {
                raisedCents: Math.max(0, Number(e.target.value) || 0) * 100,
              })
            }
            className="w-20 border-none bg-transparent text-right font-mono text-[12.5px] tabular-nums text-ink focus:outline-none"
            aria-label="Raised"
          />
        </div>
      </td>
      <td className="px-3 py-2">
        <div className="flex items-center gap-2">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-ivory-warm">
            <div
              className={cn(
                "h-full",
                full ? "bg-sage" : "bg-gold",
              )}
              style={{ width: `${Math.min(100, pct)}%` }}
            />
          </div>
          <span
            className={cn(
              "font-mono text-[10px] uppercase tracking-[0.12em]",
              full ? "text-sage" : "text-ink-muted",
            )}
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {full ? "Full" : `${pct}%`}
          </span>
        </div>
      </td>
      <td className="py-2 pl-1 pr-3 text-right">
        <button
          type="button"
          onClick={() => removeRegistryFund(item.id)}
          className="text-ink-faint hover:text-rose"
          aria-label="Remove fund"
        >
          <X size={13} strokeWidth={2} />
        </button>
      </td>
    </tr>
  );
}
