"use client";

// ── MusicCueSheet ──────────────────────────────────────────────────────────
// Filtered view of items that carry a music_cue string. Feeds the DJ/band
// with the sequence of songs or playlist cues tied to specific schedule
// moments. Printable for day-of hand-off.

import { Music, Printer } from "lucide-react";
import type { ScheduleItem } from "@/types/schedule";
import { formatTimeRange } from "@/lib/schedule/data";

interface Props {
  items: ScheduleItem[];
  eventLabel: string;
}

export function MusicCueSheet({ items, eventLabel }: Props) {
  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-10 text-center">
        <p className="section-eyebrow">MUSIC CUE SHEET</p>
        <h2 className="section-title mt-2">No music cues yet</h2>
        <p className="section-description mx-auto mt-2">
          Open any timeline item and add a music cue — it'll show up here
          for your DJ or band.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <header className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="section-eyebrow">MUSIC CUE SHEET</p>
          <h2 className="section-title mt-1">{eventLabel}</h2>
          <p className="section-description mt-2">
            {items.length} cue{items.length === 1 ? "" : "s"} — hand this to
            your DJ or band.
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
                  <Music size={12} strokeWidth={1.6} className="text-rose" />
                  {item.label}
                </p>
                {item.musicCue && (
                  <p className="mt-1 rounded border border-rose/20 bg-rose-pale/30 px-2.5 py-1 text-[12.5px] italic leading-snug text-ink">
                    {item.musicCue}
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
