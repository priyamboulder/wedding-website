"use client";

// ── Events Tasks Drawer ──────────────────────────────────────────────────
// A demoted replacement for the old "9 event tasks due this week" banner.
// Floats at the bottom-right of the viewport as a compact pill. Clicking it
// slides out a panel with the week's tasks. Never dominates the hero view.

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ClipboardList, X } from "lucide-react";
import { useChecklistStore } from "@/stores/checklist-store";
import type { WorkspaceCategoryTag } from "@/types/checklist";
import { UpcomingTasksPanel } from "@/components/workspace/shared/UpcomingTasksPanel";

const CATEGORIES: WorkspaceCategoryTag[] = [
  "venue",
  "catering",
  "decor_florals",
  "entertainment",
  "hmua",
];

export function EventsTasksDrawer() {
  const items = useChecklistStore((s) => s.items);
  const weddingDate = useChecklistStore((s) => s.weddingDate);
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem("ananya:events-tasks-drawer") === "1") {
        setDismissed(true);
      }
    } catch {
      // sessionStorage blocked — always show.
    }
  }, []);

  const dueCount = useMemo(() => {
    if (!weddingDate) return 0;
    const now = new Date();
    const weekOut = new Date(now);
    weekOut.setDate(weekOut.getDate() + 7);
    let count = 0;
    for (const it of items) {
      if (it.status === "done" || it.status === "not_applicable") continue;
      if (!it.category_tags?.some((c) => CATEGORIES.includes(c))) continue;
      const deadline = it.due_date
        ? new Date(it.due_date)
        : autoDeadline(it.daysBeforeWedding, weddingDate);
      if (!deadline) continue;
      if (deadline <= weekOut) count += 1;
    }
    return count;
  }, [items, weddingDate]);

  if (dismissed || dueCount === 0) return null;

  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.32, 0.72, 0, 1] }}
            className="pointer-events-auto w-[380px] max-w-[calc(100vw-3rem)] overflow-hidden rounded-xl border border-ink/10 bg-white shadow-[0_12px_32px_rgba(26,26,26,0.12)]"
          >
            <header className="flex items-center justify-between border-b border-ink/5 bg-ivory-warm/40 px-5 py-3">
              <div>
                <p
                  className="font-mono text-[9.5px] uppercase tracking-[0.22em] text-gold"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  The logistics
                </p>
                <h3
                  className="mt-0.5 font-serif text-[16px] leading-tight text-ink"
                  style={{
                    fontFamily:
                      "var(--font-display), 'Cormorant Garamond', Georgia, serif",
                  }}
                >
                  {dueCount} task{dueCount === 1 ? "" : "s"} due this week
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-7 w-7 items-center justify-center rounded-md text-ink-faint transition-colors hover:bg-white hover:text-ink"
                aria-label="Close task list"
              >
                <X size={13} />
              </button>
            </header>
            <div className="max-h-[60vh] overflow-y-auto p-4">
              <UpcomingTasksPanel
                category="venue"
                limit={dueCount}
                grouping="flat"
                compact
                title=""
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="pointer-events-auto flex items-center gap-2">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white px-4 py-2 shadow-[0_4px_12px_rgba(26,26,26,0.06)] transition-colors hover:border-saffron/40 hover:bg-ivory-warm/40"
        >
          <ClipboardList size={13} strokeWidth={1.8} className="text-saffron" />
          <span
            className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-ink-soft"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {dueCount} due
          </span>
          <span className="text-[12.5px] text-ink-muted">this week</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setDismissed(true);
            try {
              sessionStorage.setItem("ananya:events-tasks-drawer", "1");
            } catch {
              // sessionStorage blocked — in-memory dismissal only.
            }
          }}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-ink/10 bg-white text-ink-faint transition-colors hover:border-ink/20 hover:text-ink"
          aria-label="Hide tasks drawer for this session"
        >
          <X size={12} />
        </button>
      </div>
    </div>
  );
}

function autoDeadline(
  daysBeforeWedding: number | undefined,
  weddingDate: Date | null,
): Date | null {
  if (!weddingDate || typeof daysBeforeWedding !== "number") return null;
  const d = new Date(weddingDate);
  d.setDate(d.getDate() - daysBeforeWedding);
  return d;
}
