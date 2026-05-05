// ── ShareStepper ────────────────────────────────────────────────────────────
// Slim editorial step indicator across the top of the submission flow.

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type ShareStep = "basics" | "angle" | "build" | "review";

const STEPS: { id: ShareStep; label: string; index: string }[] = [
  { id: "basics", label: "The Basics", index: "01" },
  { id: "angle", label: "Choose Your Angle", index: "02" },
  { id: "build", label: "Build Your Story", index: "03" },
  { id: "review", label: "Review & Submit", index: "04" },
];

const ORDER: Record<ShareStep, number> = {
  basics: 0,
  angle: 1,
  build: 2,
  review: 3,
};

export function ShareStepper({ current }: { current: ShareStep }) {
  const currentIdx = ORDER[current];
  return (
    <ol className="flex flex-wrap items-center gap-2 md:gap-3">
      {STEPS.map((s, i) => {
        const done = i < currentIdx;
        const active = i === currentIdx;
        return (
          <li key={s.id} className="flex items-center gap-2 md:gap-3">
            <div
              className={cn(
                "flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11.5px] font-medium transition-colors",
                active && "border-ink bg-ink text-ivory",
                done && "border-gold/50 bg-gold-pale/40 text-ink",
                !active && !done && "border-border bg-white text-ink-muted",
              )}
            >
              <span
                className={cn(
                  "font-mono text-[10px] tracking-[0.18em]",
                  active && "text-ivory/70",
                  done && "text-gold",
                  !active && !done && "text-ink-faint",
                )}
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {done ? <Check size={11} strokeWidth={2.4} /> : s.index}
              </span>
              <span className="whitespace-nowrap">{s.label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <span
                aria-hidden="true"
                className={cn(
                  "h-px w-6 md:w-10",
                  done ? "bg-gold/40" : "bg-border",
                )}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
