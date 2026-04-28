"use client";

// ── DayOfTracker ───────────────────────────────────────────────────────────
// Live day-of overlay. Shows the current time, the item running now, and a
// one-click "push everything +N min" helper for when things inevitably run
// late. Separate from the main editing surface — the planner flips this on
// from the view switcher when the wedding is happening.

import { useEffect, useMemo, useState } from "react";
import { Clock, FastForward, PlayCircle, PauseCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ScheduleItem } from "@/types/schedule";
import {
  cascadeItemStart,
  formatTime12h,
  hhmmToMinutes,
  minutesToHhmm,
} from "@/lib/schedule/data";

interface Props {
  items: ScheduleItem[];
  onMarkStatus: (id: string, status: ScheduleItem["status"]) => void;
  onChange: () => void;
}

export function DayOfTracker({ items, onMarkStatus, onChange }: Props) {
  const [now, setNow] = useState(() => currentMinutes());

  // Tick every 30 seconds so the red "now" indicator glides with real time
  // without hammering the render loop.
  useEffect(() => {
    const interval = window.setInterval(() => setNow(currentMinutes()), 30_000);
    return () => window.clearInterval(interval);
  }, []);

  const currentItem = useMemo(() => {
    return items.find((i) => {
      const s = hhmmToMinutes(i.startTime);
      const e = hhmmToMinutes(i.endTime);
      return now >= s && now < e;
    });
  }, [items, now]);

  const firstStart = items.length > 0 ? hhmmToMinutes(items[0].startTime) : 0;
  const drift = currentItem
    ? now - hhmmToMinutes(currentItem.startTime)
    : null;

  function handlePush(minutes: number) {
    // Shift the first non-completed item by `minutes` and re-resolve.
    const next = items.find((i) => i.status !== "completed");
    if (!next) return;
    const newStart = minutesToHhmm(hhmmToMinutes(next.startTime) + minutes);
    cascadeItemStart(next.id, newStart);
    onChange();
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-6">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-white px-4 py-3">
        <div className="flex items-center gap-2">
          <Clock size={14} strokeWidth={1.6} className="text-rose" />
          <span className="font-mono text-[13px] tabular-nums text-ink">
            Now · {formatTime12h(minutesToHhmm(now))}
          </span>
          {now < firstStart && (
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted">
              starts at {formatTime12h(items[0]?.startTime ?? "")}
            </span>
          )}
          {currentItem && (
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted">
              now on · {currentItem.label}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handlePush(10)}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-white px-3 py-1.5 text-[12px] text-ink-muted hover:border-ink-faint hover:text-ink"
          >
            <FastForward size={12} strokeWidth={1.6} />
            Push +10 min
          </button>
          <button
            type="button"
            onClick={() => handlePush(30)}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-white px-3 py-1.5 text-[12px] text-ink-muted hover:border-ink-faint hover:text-ink"
          >
            <FastForward size={12} strokeWidth={1.6} />
            Push +30 min
          </button>
        </div>
      </header>

      <ul className="space-y-1">
        {items.map((item) => {
          const s = hhmmToMinutes(item.startTime);
          const e = hhmmToMinutes(item.endTime);
          const isCurrent = now >= s && now < e;
          const isPast = now >= e;
          const isSkipped = item.status === "skipped";
          const isCompleted = item.status === "completed";

          return (
            <li
              key={item.id}
              className={cn(
                "flex items-center gap-3 rounded-md border bg-white px-3 py-2 transition-colors",
                isCurrent
                  ? "border-rose/50 bg-rose-pale/25"
                  : isPast && !isSkipped
                    ? "border-border opacity-50"
                    : "border-border",
                isSkipped && "opacity-40 line-through",
              )}
            >
              <button
                type="button"
                onClick={() =>
                  onMarkStatus(
                    item.id,
                    isCompleted ? "draft" : "completed",
                  )
                }
                aria-label={isCompleted ? "Undo complete" : "Mark complete"}
                className="text-ink-faint hover:text-ink"
              >
                {isCompleted ? (
                  <PauseCircle size={16} strokeWidth={1.6} />
                ) : (
                  <PlayCircle size={16} strokeWidth={1.6} />
                )}
              </button>
              <span className="shrink-0 font-mono text-[12px] tabular-nums text-ink">
                {formatTime12h(item.startTime)}
              </span>
              <span className="min-w-0 flex-1 truncate text-[13px] text-ink">
                {item.label}
              </span>
              <button
                type="button"
                onClick={() =>
                  onMarkStatus(
                    item.id,
                    isSkipped ? "draft" : "skipped",
                  )
                }
                className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-faint hover:text-rose"
              >
                {isSkipped ? "restore" : "skip"}
              </button>
              {isCurrent && drift !== null && Math.abs(drift) > 2 && (
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.14em]",
                    drift > 0
                      ? "bg-rose-pale/60 text-rose"
                      : "bg-sage-pale/60 text-ink",
                  )}
                >
                  {drift > 0 ? `+${drift}m late` : `${drift}m early`}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function currentMinutes(): number {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
}
