"use client";

// ── Dining Intelligence badge ────────────────────────────────────────
// Floating status card in the corner of the seating canvas. Shows the
// current status (green / amber / red), the summary line, and a scrollable
// list of active warnings with one-sentence suggestions. Each warning has
// a "dismiss" button that removes it from the digest without mutating the
// underlying seating.
//
// Populated by runAutoAssignAll (lib/seating-ai.ts) and the per-table
// smart actions. When there is no dining record for the event, the badge
// stays hidden so it doesn't clutter a fresh canvas.

import { useState } from "react";
import { AlertTriangle, Check, ChevronDown, ChevronUp, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSeatingAssignmentsStore } from "@/stores/seating-assignments-store";
import type { WarningSeverity } from "@/types/seating-assignments";

interface Props {
  eventId: string;
}

const STATUS_STYLES: Record<
  WarningSeverity,
  { bg: string; border: string; text: string; dot: string; icon: string; label: string }
> = {
  green: {
    bg: "bg-sage-pale/60",
    border: "border-sage/50",
    text: "text-sage",
    dot: "bg-sage",
    icon: "text-sage",
    label: "All clear",
  },
  amber: {
    bg: "bg-gold-pale/60",
    border: "border-gold/50",
    text: "text-gold",
    dot: "bg-gold",
    icon: "text-gold",
    label: "Review",
  },
  red: {
    bg: "bg-rose-pale/70",
    border: "border-rose/50",
    text: "text-rose",
    dot: "bg-rose",
    icon: "text-rose",
    label: "Critical",
  },
};

export function DiningIntelligenceBadge({ eventId }: Props) {
  const dining = useSeatingAssignmentsStore((s) => s.dining[eventId]);
  const dismissWarning = useSeatingAssignmentsStore((s) => s.dismissWarning);
  const [expanded, setExpanded] = useState(false);

  if (!dining) return null;
  const styles = STATUS_STYLES[dining.status];
  const hasWarnings = dining.warnings.length > 0;

  return (
    <div
      className={cn(
        "absolute right-3 top-3 z-20 w-[280px] rounded-md border shadow-md backdrop-blur",
        styles.bg,
        styles.border,
      )}
    >
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center gap-2 px-3 py-2 text-left"
        title={expanded ? "Collapse" : "Expand warnings"}
      >
        {dining.status === "green" ? (
          <Check size={13} strokeWidth={1.8} className={styles.icon} />
        ) : (
          <AlertTriangle size={13} strokeWidth={1.8} className={styles.icon} />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-faint">
              Dining Intelligence
            </span>
            <span className={cn("h-1.5 w-1.5 rounded-full", styles.dot)} />
          </div>
          <div className={cn("mt-0.5 truncate text-[11.5px]", styles.text)}>
            {dining.summary}
          </div>
        </div>
        {hasWarnings && (expanded ? (
          <ChevronUp size={12} strokeWidth={1.7} className="text-ink-muted" />
        ) : (
          <ChevronDown size={12} strokeWidth={1.7} className="text-ink-muted" />
        ))}
      </button>

      {expanded && hasWarnings && (
        <div className="max-h-60 overflow-y-auto border-t border-border/60 bg-white/80">
          {dining.warnings.map((w) => {
            const wStyles = STATUS_STYLES[w.severity];
            return (
              <div
                key={w.id}
                className="flex items-start gap-2 border-b border-border/40 px-3 py-2 last:border-b-0"
              >
                <span className={cn("mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full", wStyles.dot)} />
                <div className="flex-1 min-w-0">
                  <div className="text-[11.5px] leading-snug text-ink">
                    {w.message}
                  </div>
                  {w.suggestion && (
                    <div className="mt-0.5 text-[10.5px] italic leading-snug text-ink-muted">
                      {w.suggestion}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => dismissWarning(w.id, eventId)}
                  title="Dismiss"
                  className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded text-ink-faint hover:bg-ivory hover:text-ink"
                >
                  <X size={10} strokeWidth={1.8} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
