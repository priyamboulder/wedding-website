"use client";

// ── ConflictPanel ──────────────────────────────────────────────────────────
// Collapsible summary of timeline conflicts. Replaces the inline error text
// that used to live on each schedule card — keeping the rows clean and
// scannable while still surfacing issues the planner needs to address.

import { useState } from "react";
import { AlertTriangle, ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ScheduleConflict } from "@/types/schedule";

interface Props {
  conflicts: ScheduleConflict[];
  onJump: (itemId: string) => void;
}

export function ConflictPanel({ conflicts, onJump }: Props) {
  const [open, setOpen] = useState(false);
  if (conflicts.length === 0) return null;

  const hard = conflicts.filter((c) => c.severity === "hard");
  const soft = conflicts.filter((c) => c.severity === "soft");
  const info = conflicts.filter((c) => c.severity === "info");

  return (
    <div
      className={cn(
        "mb-4 rounded-md border",
        hard.length > 0 ? "border-rose/40 bg-rose-pale/30" : "border-gold/30 bg-gold-pale/30",
      )}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center gap-2 px-3 py-2 text-left text-[12.5px]"
      >
        <AlertTriangle
          size={13}
          strokeWidth={1.6}
          className={hard.length > 0 ? "text-rose" : "text-gold"}
        />
        <span className="font-medium text-ink">
          {conflicts.length} conflict{conflicts.length === 1 ? "" : "s"} found
        </span>
        {hard.length > 0 && (
          <span className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-rose">
            {hard.length} hard
          </span>
        )}
        {soft.length > 0 && (
          <span className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-muted">
            {soft.length} soft
          </span>
        )}
        {info.length > 0 && (
          <span className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-faint">
            {info.length} info
          </span>
        )}
        <span className="ml-auto text-ink-muted">
          {open ? (
            <ChevronDown size={14} strokeWidth={1.6} />
          ) : (
            <ChevronRight size={14} strokeWidth={1.6} />
          )}
        </span>
      </button>
      {open && (
        <ul className="border-t border-border/60 bg-white/60">
          {conflicts.map((c) => (
            <li
              key={c.id}
              className="flex items-start justify-between gap-3 border-b border-border/40 px-3 py-2 last:border-b-0"
            >
              <div className="min-w-0 flex-1 text-[12.5px] leading-snug text-ink">
                <span
                  className={cn(
                    "mr-2 inline-block rounded-full px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em]",
                    c.severity === "hard"
                      ? "bg-rose text-white"
                      : c.severity === "soft"
                        ? "bg-gold text-ink"
                        : "bg-ink-faint text-white",
                  )}
                >
                  {c.severity}
                </span>
                {c.message}
              </div>
              {c.itemIds[0] && (
                <button
                  type="button"
                  onClick={() => onJump(c.itemIds[0])}
                  className="shrink-0 rounded border border-border bg-white px-2 py-0.5 text-[11px] text-ink-muted hover:border-ink-faint hover:text-ink"
                >
                  Jump
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
