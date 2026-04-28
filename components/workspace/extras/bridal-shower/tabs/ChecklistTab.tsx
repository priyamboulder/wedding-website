"use client";

// ── Checklist tab ──────────────────────────────────────────────────────────
// The concept's canonical checklist + planner-added custom items, grouped
// by timeline phase (6–8 weeks out, 4–6 weeks, 2 weeks, day before, day
// of). Checking items updates the store's completion overlay.

import { Check, Plus, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useBridalShowerStore } from "@/stores/bridal-shower-store";
import { getConceptById } from "@/lib/bridal-shower-concepts";
import type { ChecklistItem } from "@/types/bridal-shower";

const PHASES: {
  id: ChecklistItem["phase"];
  label: string;
  subtitle: string;
}[] = [
  { id: "6_8_weeks", label: "6–8 weeks out", subtitle: "Anchors — venue, guest list, invitations" },
  { id: "4_6_weeks", label: "4–6 weeks out", subtitle: "Sourcing — food, florals, paper goods" },
  { id: "2_weeks", label: "2 weeks out", subtitle: "Confirm — RSVPs, quantities, day-of roles" },
  { id: "day_before", label: "Day before", subtitle: "Prep everything that can be prepped" },
  { id: "day_of", label: "Day of", subtitle: "Setup, execute, enjoy" },
];

export function ChecklistTab() {
  const selectionId = useBridalShowerStore((s) => s.selection.conceptId);
  const concept = selectionId ? getConceptById(selectionId) : null;
  const checklist = useBridalShowerStore((s) => s.checklist);
  const toggle = useBridalShowerStore((s) => s.toggleChecklistItem);
  const addCustom = useBridalShowerStore((s) => s.addCustomChecklistItem);
  const removeCustom = useBridalShowerStore((s) => s.removeCustomChecklistItem);
  const toggleCustom = useBridalShowerStore((s) => s.toggleCustomChecklistItem);

  if (!concept) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-ivory-warm/40 p-10 text-center">
        <h3 className="font-serif text-[17px] text-ink">Pick a concept first</h3>
        <p className="mx-auto mt-1.5 max-w-md text-[13px] leading-relaxed text-ink-muted">
          Each concept has its own canonical checklist. Head to the Concepts
          tab and select one.
        </p>
      </div>
    );
  }

  const done = checklist.done[concept.id] ?? [];
  const custom = checklist.custom[concept.id] ?? [];
  const totalDone =
    done.length + custom.filter((c) => c.done).length;
  const total = concept.checklist.length + custom.length;

  return (
    <div className="space-y-5">
      <header className="flex items-start justify-between gap-4">
        <div>
          <p
            className="font-mono text-[10px] uppercase tracking-[0.16em] text-saffron"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {concept.name.toUpperCase()} CHECKLIST
          </p>
          <h2 className="mt-1 font-serif text-[22px] leading-tight text-ink">
            The execution backbone
          </h2>
          <p className="mt-1.5 max-w-2xl text-[13px] leading-relaxed text-ink-muted">
            Walk through this chronologically. Most of the stress of planning
            a shower comes from leaving things until week-of — these phase
            breakpoints are designed to prevent that.
          </p>
        </div>
        <div
          className="shrink-0 rounded-md border border-border bg-white px-4 py-2 text-center"
          title={`${totalDone} of ${total} complete`}
        >
          <p
            className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Progress
          </p>
          <p className="mt-1 font-serif text-[20px] leading-none text-ink">
            {totalDone}
            <span className="text-ink-faint">/{total}</span>
          </p>
        </div>
      </header>

      {PHASES.map((phase) => {
        const phaseItems = concept.checklist.filter((i) => i.phase === phase.id);
        const phaseCustom = custom.filter((c) => c.phase === phase.id);
        return (
          <PhaseGroup
            key={phase.id}
            phase={phase}
            items={phaseItems}
            customItems={phaseCustom}
            isDone={(id) => done.includes(id)}
            onToggle={(id) => toggle(concept.id, id)}
            onToggleCustom={(id) => toggleCustom(concept.id, id)}
            onRemoveCustom={(id) => removeCustom(concept.id, id)}
            onAddCustom={(label) => addCustom(concept.id, label, phase.id)}
          />
        );
      })}
    </div>
  );
}

function PhaseGroup({
  phase,
  items,
  customItems,
  isDone,
  onToggle,
  onToggleCustom,
  onRemoveCustom,
  onAddCustom,
}: {
  phase: { id: ChecklistItem["phase"]; label: string; subtitle: string };
  items: ChecklistItem[];
  customItems: { id: string; label: string; phase: ChecklistItem["phase"]; done: boolean }[];
  isDone: (id: string) => boolean;
  onToggle: (id: string) => void;
  onToggleCustom: (id: string) => void;
  onRemoveCustom: (id: string) => void;
  onAddCustom: (label: string) => void;
}) {
  const [draft, setDraft] = useState("");
  const phaseDone =
    items.filter((i) => isDone(i.id)).length +
    customItems.filter((c) => c.done).length;
  const phaseTotal = items.length + customItems.length;

  function commit() {
    const trimmed = draft.trim();
    if (!trimmed) return;
    onAddCustom(trimmed);
    setDraft("");
  }

  return (
    <section className="rounded-lg border border-border bg-white p-5">
      <header className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p
            className="font-mono text-[10px] uppercase tracking-[0.16em] text-saffron"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {phase.label}
          </p>
          <h3 className="mt-1 font-serif text-[16px] leading-tight text-ink">
            {phase.subtitle}
          </h3>
        </div>
        <span
          className="shrink-0 font-mono text-[11px] tabular-nums text-ink-muted"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {phaseDone}/{phaseTotal}
        </span>
      </header>

      <ul className="space-y-1.5">
        {items.map((item) => {
          const done = isDone(item.id);
          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => onToggle(item.id)}
                className={cn(
                  "group flex w-full items-start gap-3 rounded-md border px-3 py-2 text-left transition-colors",
                  done
                    ? "border-sage/30 bg-sage-pale/20"
                    : "border-border bg-white hover:border-saffron/40",
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded border",
                    done
                      ? "border-sage bg-sage text-ivory"
                      : "border-border bg-white group-hover:border-saffron",
                  )}
                >
                  {done && <Check size={10} strokeWidth={3} />}
                </span>
                <span
                  className={cn(
                    "text-[13px] leading-snug",
                    done
                      ? "text-ink-muted line-through"
                      : "text-ink",
                  )}
                >
                  {item.label}
                </span>
              </button>
            </li>
          );
        })}
        {customItems.map((c) => (
          <li key={c.id}>
            <div
              className={cn(
                "flex items-start gap-3 rounded-md border px-3 py-2",
                c.done
                  ? "border-sage/30 bg-sage-pale/20"
                  : "border-border bg-white",
              )}
            >
              <button
                type="button"
                onClick={() => onToggleCustom(c.id)}
                className={cn(
                  "mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded border",
                  c.done
                    ? "border-sage bg-sage text-ivory"
                    : "border-border bg-white hover:border-saffron",
                )}
                aria-label="Toggle"
              >
                {c.done && <Check size={10} strokeWidth={3} />}
              </button>
              <span
                className={cn(
                  "flex-1 text-[13px] leading-snug",
                  c.done ? "text-ink-muted line-through" : "text-ink",
                )}
              >
                {c.label}
              </span>
              <span
                className="font-mono text-[9px] uppercase tracking-[0.12em] text-ink-faint"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Custom
              </span>
              <button
                type="button"
                onClick={() => onRemoveCustom(c.id)}
                className="text-ink-faint hover:text-rose"
                aria-label="Remove"
              >
                <X size={12} strokeWidth={2} />
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-3 flex items-center gap-2">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit();
          }}
          placeholder="Add a custom task to this phase…"
          className="flex-1 rounded-md border border-border bg-white px-3 py-1.5 text-[12.5px] text-ink placeholder:text-ink-faint focus:border-saffron/60 focus:outline-none"
        />
        <button
          type="button"
          onClick={commit}
          className="inline-flex items-center gap-1 rounded-md border border-border bg-white px-3 py-1.5 text-[12px] font-medium text-ink-muted hover:border-saffron/40 hover:text-saffron"
        >
          <Plus size={12} strokeWidth={2} />
          Add
        </button>
      </div>
    </section>
  );
}
