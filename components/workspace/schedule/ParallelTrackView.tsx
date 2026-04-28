"use client";

// ── ParallelTrackView ──────────────────────────────────────────────────────
// Side-by-side swim lanes for bride / groom / main / vendor-setup tracks.
// Useful for the getting-ready + baraat morning where two parallel chains
// converge at the Milni. Read-only — clicking an item opens the drawer in
// the main timeline view.

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import type { ScheduleItem, ScheduleTrack } from "@/types/schedule";
import { SCHEDULE_CATEGORY_META } from "./scheduleCategoryMeta";
import { formatTime12h, hhmmToMinutes } from "@/lib/schedule/data";

interface Props {
  items: ScheduleItem[];
  onSelect: (id: string) => void;
}

const TRACKS: Array<{ id: ScheduleTrack; label: string }> = [
  { id: "main", label: "Main" },
  { id: "bride", label: "Bride" },
  { id: "groom", label: "Groom" },
  { id: "vendor_setup", label: "Vendor setup" },
];

export function ParallelTrackView({ items, onSelect }: Props) {
  const { min, max, active } = useMemo(() => {
    if (items.length === 0) return { min: 0, max: 0, active: [] };
    const starts = items.map((i) => hhmmToMinutes(i.startTime));
    const ends = items.map((i) => hhmmToMinutes(i.endTime));
    const present = new Set(items.map((i) => i.track));
    return {
      min: Math.min(...starts),
      max: Math.max(...ends),
      active: TRACKS.filter((t) => present.has(t.id) || t.id === "main"),
    };
  }, [items]);

  const spanMinutes = Math.max(1, max - min);

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-12 text-center">
        <p className="section-eyebrow">PARALLEL TRACKS</p>
        <h2 className="section-title mt-2">No tracks to render</h2>
        <p className="section-description mx-auto mt-2">
          Assign items to bride/groom/vendor_setup tracks from the detail
          drawer to see them side by side.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-6">
      <header className="mb-4">
        <p className="section-eyebrow">PARALLEL TRACKS</p>
        <h2 className="section-title mt-1">Concurrent swim lanes</h2>
        <p className="section-description mt-2">
          {formatTime12h(minutesToHhmm(min))} –{" "}
          {formatTime12h(minutesToHhmm(max))} — items on different tracks
          run in parallel.
        </p>
      </header>

      <div
        className="grid gap-3"
        style={{
          gridTemplateColumns: `80px repeat(${active.length}, minmax(0, 1fr))`,
        }}
      >
        {/* Header row */}
        <div />
        {active.map((t) => (
          <div
            key={t.id}
            className="rounded-md border border-border bg-ivory-warm/40 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted"
          >
            {t.label}
          </div>
        ))}

        {/* Tick marks — every 30 min */}
        <div className="relative col-span-full grid" style={gridTemplate(active.length)}>
          {tickMarks(min, max).map((tick) => (
            <div
              key={tick}
              className="col-start-1 flex items-start justify-end pr-2 font-mono text-[10px] tabular-nums text-ink-faint"
              style={{ gridRowStart: tickRow(tick, min) + 1 }}
            >
              {formatTime12h(minutesToHhmm(tick))}
            </div>
          ))}

          {active.map((track, colIdx) => (
            <div
              key={`col-${track.id}`}
              className="relative border-l border-border"
              style={{
                gridColumnStart: colIdx + 2,
                gridRowStart: 1,
                gridRowEnd: -1,
                minHeight: `${Math.max(300, spanMinutes * 3)}px`,
              }}
            >
              {items
                .filter((i) => i.track === track.id)
                .map((item) => {
                  const top = ((hhmmToMinutes(item.startTime) - min) / spanMinutes) * 100;
                  const height = Math.max(
                    1.5,
                    (item.durationMinutes / spanMinutes) * 100,
                  );
                  const meta = SCHEDULE_CATEGORY_META[item.category];
                  return (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => onSelect(item.id)}
                      className={cn(
                        "absolute left-1 right-1 rounded border border-border bg-white px-2 py-1 text-left shadow-sm hover:border-ink-faint",
                        "overflow-hidden text-[11.5px] leading-tight",
                      )}
                      style={{
                        top: `${top}%`,
                        height: `${height}%`,
                      }}
                    >
                      <span
                        aria-hidden
                        className={cn(
                          "absolute left-0 top-0 h-full w-[2px]",
                          meta.accentClass,
                        )}
                      />
                      <span className="ml-2 block font-mono text-[9.5px] tabular-nums text-ink-muted">
                        {formatTime12h(item.startTime)}
                      </span>
                      <span className="ml-2 block truncate font-medium text-ink">
                        {item.label}
                      </span>
                    </button>
                  );
                })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function tickMarks(min: number, max: number): number[] {
  const out: number[] = [];
  const start = Math.floor(min / 30) * 30;
  for (let t = start; t <= max; t += 30) out.push(t);
  return out;
}

function tickRow(tick: number, min: number): number {
  return Math.round((tick - min) / 30);
}

function gridTemplate(cols: number): React.CSSProperties {
  return {
    gridTemplateColumns: `80px repeat(${cols}, minmax(0, 1fr))`,
  };
}

function minutesToHhmm(min: number): string {
  const h = Math.floor(min / 60) % 24;
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
