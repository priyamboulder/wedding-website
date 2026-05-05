"use client";

// ── JourneyProgress ─────────────────────────────────────────────────────
// Five stepping stones at the top of the journey, connected by a thin
// blush line. Each stone is clickable so the couple can jump to any
// step. Done stones fill with blush; the active stone pulses gently.

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { JourneyStepId } from "@/stores/dashboard-journey-store";

export type StoneState = "done" | "active" | "upcoming";

interface JourneyProgressProps {
  states: Record<JourneyStepId, StoneState>;
  onSelect: (step: JourneyStepId) => void;
}

const LABELS: Record<JourneyStepId, string> = {
  1: "Date",
  2: "Events",
  3: "Palette",
  4: "Dress code",
  5: "Timeline",
};

export function JourneyProgress({ states, onSelect }: JourneyProgressProps) {
  const steps: JourneyStepId[] = [1, 2, 3, 4, 5];
  const doneCount = steps.filter((s) => states[s] === "done").length;

  return (
    <div className="select-none">
      {/* Stones row */}
      <div className="flex items-center" aria-hidden>
        {steps.map((step, i) => {
          const state = states[step];
          const nextDone =
            i < steps.length - 1 && states[steps[i + 1] as JourneyStepId] === "done" && state === "done";
          return (
            <div key={step} className="flex flex-1 items-center first:flex-none last:flex-none">
              <button
                type="button"
                onClick={() => onSelect(step)}
                className={cn(
                  "dash-stone",
                  state === "done" && "dash-stone--done",
                  state === "active" && "dash-stone--active",
                )}
                aria-label={`Step ${step}: ${LABELS[step]} (${state})`}
              >
                {state === "done" && (
                  <Check size={9} strokeWidth={3} className="text-white" />
                )}
              </button>
              {i < steps.length - 1 && (
                <span
                  className={cn(
                    "dash-stone-line mx-1",
                    nextDone && "dash-stone-line--done",
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Labels row */}
      <div className="mt-2 grid grid-cols-5 gap-1">
        {steps.map((step) => (
          <button
            key={step}
            type="button"
            onClick={() => onSelect(step)}
            className={cn(
              "text-left text-[10px] uppercase tracking-[0.16em] transition-colors",
              states[step] === "active"
                ? "text-[color:var(--dash-blush-deep)]"
                : states[step] === "done"
                  ? "text-[color:var(--dash-text-muted)]"
                  : "text-[color:var(--dash-text-faint)]",
            )}
            style={{ fontFamily: "var(--font-mono)", fontWeight: 500 }}
          >
            {LABELS[step]}
          </button>
        ))}
      </div>

      <p
        className="mt-3 text-[11px] uppercase tracking-[0.18em] text-[color:var(--dash-text-faint)]"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {doneCount} of 5 complete
      </p>
    </div>
  );
}
