"use client";

// ── PhotoShotList ──────────────────────────────────────────────────────────
// Filtered view of every schedule item flagged as a must-capture photo
// moment. Meant for the photographer — shows the time, the moment, any
// location context, and any special notes so they know where to be.

import { Camera, Printer } from "lucide-react";
import type { ScheduleItem } from "@/types/schedule";
import { formatTimeRange } from "@/lib/schedule/data";

interface Props {
  items: ScheduleItem[];
  eventLabel: string;
}

export function PhotoShotList({ items, eventLabel }: Props) {
  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-10 text-center">
        <p className="section-eyebrow">PHOTO SHOT LIST</p>
        <h2 className="section-title mt-2">No photo moments flagged</h2>
        <p className="section-description mx-auto mt-2">
          Open any timeline item and tick "Must-capture photo moment" to
          build the shot list for your photographer.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <header className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="section-eyebrow">PHOTO SHOT LIST</p>
          <h2 className="section-title mt-1">{eventLabel}</h2>
          <p className="section-description mt-2">
            {items.length} must-capture moment{items.length === 1 ? "" : "s"}
            {" "}— share with your photographer.
          </p>
        </div>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-white px-3 py-1.5 text-[12px] text-ink-muted hover:border-ink-faint hover:text-ink"
        >
          <Printer size={12} strokeWidth={1.6} />
          Print
        </button>
      </header>

      <section className="rounded-lg border border-border bg-white px-6 py-5">
        <ul className="divide-y divide-border">
          {items.map((item) => (
            <li
              key={item.id}
              className="grid grid-cols-[140px_1fr] gap-3 py-3"
            >
              <span className="font-mono text-[12px] tabular-nums text-ink-muted">
                {formatTimeRange(item.startTime, item.endTime)}
              </span>
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 text-[13.5px] font-medium text-ink">
                  <Camera size={12} strokeWidth={1.6} className="text-teal" />
                  {item.label}
                </p>
                {item.location && (
                  <p className="mt-0.5 text-[12px] text-ink-muted">
                    📍 {item.location}
                  </p>
                )}
                {item.description && (
                  <p className="mt-1 text-[12.5px] leading-snug text-ink-muted">
                    {item.description}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
