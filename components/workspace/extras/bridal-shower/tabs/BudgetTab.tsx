"use client";

// ── Budget tab ─────────────────────────────────────────────────────────────
// Concept blueprint budget (as percentages) + the planner's actual tracked
// spend overlay. Two views side by side: "recommended split" vs. "where
// we are." Includes the concept's save-on / splurge-on guidance so the
// planner doesn't lose track of what matters.

import { Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useBridalShowerStore } from "@/stores/bridal-shower-store";
import { getConceptById } from "@/lib/bridal-shower-concepts";
import { formatMoney, Section, TextInput } from "../../bachelorette/ui";

export function BudgetTab() {
  const selectionId = useBridalShowerStore((s) => s.selection.conceptId);
  const concept = selectionId ? getConceptById(selectionId) : null;
  const budget = useBridalShowerStore((s) => s.budget);
  const updateBudget = useBridalShowerStore((s) => s.updateBudget);
  const addLine = useBridalShowerStore((s) => s.addBudgetLine);
  const updateLine = useBridalShowerStore((s) => s.updateBudgetLine);
  const removeLine = useBridalShowerStore((s) => s.removeBudgetLine);

  const plannedTotal = budget.lines.reduce((s, l) => s + l.plannedCents, 0);
  const actualTotal = budget.lines.reduce((s, l) => s + l.actualCents, 0);
  const target = budget.totalBudgetCents;
  const remainingCents = target - actualTotal;

  return (
    <div className="space-y-5">
      <header className="grid grid-cols-3 gap-3">
        <BudgetStat
          label="TOTAL BUDGET"
          value={formatMoney(target)}
          note="Your ceiling"
        />
        <BudgetStat
          label="PLANNED"
          value={formatMoney(plannedTotal)}
          note={`${Math.round((plannedTotal / (target || 1)) * 100)}% allocated`}
        />
        <BudgetStat
          label="SPENT"
          value={formatMoney(actualTotal)}
          note={
            remainingCents >= 0
              ? `${formatMoney(remainingCents)} remaining`
              : `${formatMoney(-remainingCents)} over`
          }
          tone={remainingCents < 0 ? "rose" : "sage"}
        />
      </header>

      <Section
        eyebrow="TOTAL BUDGET"
        title="Set the ceiling"
        description="This is the total event cost — not per person. Split with co-planners elsewhere."
      >
        <div className="flex items-center gap-2">
          <span className="text-[13px] text-ink-muted">$</span>
          <TextInput
            type="number"
            value={String(target / 100)}
            onChange={(v) =>
              updateBudget({
                totalBudgetCents: Math.round(Number(v) * 100 || 0),
              })
            }
            className="max-w-[180px]"
          />
        </div>
      </Section>

      {concept && (
        <Section
          eyebrow="GUIDANCE FROM THE CONCEPT"
          title="Where to save, where to splurge"
        >
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-md border border-sage/30 bg-sage-pale/30 p-4">
              <Eyebrow>SAVE ON</Eyebrow>
              <p className="mt-1.5 text-[13px] leading-relaxed text-ink">
                {concept.budget.saveOn}
              </p>
            </div>
            <div className="rounded-md border border-gold-light/40 bg-gold-pale/30 p-4">
              <Eyebrow>SPLURGE ON</Eyebrow>
              <p className="mt-1.5 text-[13px] leading-relaxed text-ink">
                {concept.budget.splurgeOn}
              </p>
            </div>
          </div>
        </Section>
      )}

      <Section
        eyebrow="LINE ITEMS"
        title="Where the money's going"
        description="Track planned vs. actual. Who's paying for each line keeps co-planning smooth."
      >
        <div className="overflow-hidden rounded-md border border-border">
          <div className="grid grid-cols-[2fr_1fr_1fr_1.2fr_1.5fr_40px] items-center gap-3 border-b border-border bg-ivory-warm/40 px-3 py-2">
            <Header>Line</Header>
            <Header>Planned</Header>
            <Header>Actual</Header>
            <Header>Paid by</Header>
            <Header>Note</Header>
            <span />
          </div>
          <ul>
            {budget.lines.map((line) => {
              const conceptLine = concept?.budget.lines.find(
                (cl) =>
                  cl.label.toLowerCase() === line.label.toLowerCase() ||
                  cl.label.split(" ")[0]?.toLowerCase() ===
                    line.label.split(" ")[0]?.toLowerCase(),
              );
              const recommendedCents = conceptLine
                ? Math.round((conceptLine.pct / 100) * target)
                : null;
              const overBy = line.actualCents - line.plannedCents;
              return (
                <li
                  key={line.id}
                  className="grid grid-cols-[2fr_1fr_1fr_1.2fr_1.5fr_40px] items-start gap-3 border-t border-border/60 px-3 py-2 first:border-0"
                >
                  <div>
                    <TextInput
                      value={line.label}
                      onChange={(v) => updateLine(line.id, { label: v })}
                      placeholder="Line item"
                    />
                    {recommendedCents !== null && (
                      <p
                        className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-faint"
                        style={{ fontFamily: "var(--font-mono)" }}
                      >
                        Concept suggests ~{formatMoney(recommendedCents)} ({conceptLine?.pct}%)
                      </p>
                    )}
                  </div>
                  <TextInput
                    type="number"
                    value={String(line.plannedCents / 100)}
                    onChange={(v) =>
                      updateLine(line.id, {
                        plannedCents: Math.round(Number(v) * 100 || 0),
                      })
                    }
                  />
                  <div>
                    <TextInput
                      type="number"
                      value={String(line.actualCents / 100)}
                      onChange={(v) =>
                        updateLine(line.id, {
                          actualCents: Math.round(Number(v) * 100 || 0),
                        })
                      }
                    />
                    {line.actualCents > 0 && overBy !== 0 && (
                      <p
                        className={cn(
                          "mt-0.5 font-mono text-[10px] uppercase tracking-[0.1em]",
                          overBy > 0 ? "text-rose" : "text-sage",
                        )}
                        style={{ fontFamily: "var(--font-mono)" }}
                      >
                        {overBy > 0 ? "Over" : "Under"} by{" "}
                        {formatMoney(Math.abs(overBy))}
                      </p>
                    )}
                  </div>
                  <TextInput
                    value={line.paidBy}
                    onChange={(v) => updateLine(line.id, { paidBy: v })}
                    placeholder="Who's covering"
                  />
                  <TextInput
                    value={line.note}
                    onChange={(v) => updateLine(line.id, { note: v })}
                    placeholder="Note"
                  />
                  <button
                    type="button"
                    aria-label="Remove line"
                    onClick={() => removeLine(line.id)}
                    className="text-ink-faint hover:text-rose"
                  >
                    <X size={13} strokeWidth={2} />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
        <button
          type="button"
          onClick={() => addLine("New line")}
          className="mt-3 inline-flex items-center gap-1 rounded-md border border-border bg-white px-3 py-1.5 text-[12px] font-medium text-ink-muted hover:border-saffron/40 hover:text-saffron"
        >
          <Plus size={12} strokeWidth={2} />
          Add line
        </button>
      </Section>
    </div>
  );
}

function BudgetStat({
  label,
  value,
  note,
  tone = "default",
}: {
  label: string;
  value: string;
  note: string;
  tone?: "default" | "sage" | "rose";
}) {
  const bg =
    tone === "rose"
      ? "bg-rose-pale/30"
      : tone === "sage"
        ? "bg-sage-pale/30"
        : "bg-white";
  const border =
    tone === "rose"
      ? "border-rose/30"
      : tone === "sage"
        ? "border-sage/30"
        : "border-border";
  return (
    <div className={cn("rounded-md border p-4", bg, border)}>
      <p
        className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {label}
      </p>
      <p className="mt-1 font-serif text-[22px] leading-none text-ink">
        {value}
      </p>
      <p className="mt-1.5 text-[11.5px] text-ink-muted">{note}</p>
    </div>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted"
      style={{ fontFamily: "var(--font-mono)" }}
    >
      {children}
    </p>
  );
}

function Header({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted"
      style={{ fontFamily: "var(--font-mono)" }}
    >
      {children}
    </span>
  );
}
