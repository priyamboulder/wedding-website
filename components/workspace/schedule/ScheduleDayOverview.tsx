"use client";

// ── ScheduleDayOverview ────────────────────────────────────────────────────
// Multi-event same-day view. Groups events into Morning / Afternoon /
// Evening, shows a compressed preview per event, and surfaces cross-event
// conflicts (venue clashes, vendor double-booking) at the bottom.

import { AlertTriangle, Moon, Sun, Sunrise } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  ScheduleConflict,
  ScheduleDayEventSummary,
  ScheduleItem,
} from "@/types/schedule";
import { SCHEDULE_CATEGORY_META } from "./scheduleCategoryMeta";
import { formatTime12h, hhmmToMinutes } from "@/lib/schedule/data";

interface Props {
  date: string;
  events: ScheduleDayEventSummary[];
  allItems: ScheduleItem[];
  crossEventConflicts: ScheduleConflict[];
  onExpand: (eventId: string) => void;
}

type DayPart = "morning" | "afternoon" | "evening";

function dayPartFor(start: string | null): DayPart {
  if (!start) return "afternoon";
  const m = hhmmToMinutes(start);
  if (m < 12 * 60) return "morning";
  if (m < 17 * 60) return "afternoon";
  return "evening";
}

const DAY_PART_LABEL: Record<DayPart, string> = {
  morning: "Morning",
  afternoon: "Afternoon",
  evening: "Evening",
};

const DAY_PART_ICON: Record<DayPart, typeof Sun> = {
  morning: Sunrise,
  afternoon: Sun,
  evening: Moon,
};

export function ScheduleDayOverview({
  date,
  events,
  allItems,
  crossEventConflicts,
  onExpand,
}: Props) {
  const sorted = [...events].sort((a, b) => {
    const at = a.startTime ?? "99:99";
    const bt = b.startTime ?? "99:99";
    return at.localeCompare(bt);
  });

  const grouped = groupByDayPart(sorted);

  if (sorted.length === 0) {
    return (
      <div className="mx-auto w-full max-w-3xl px-6 py-12 text-center">
        <p className="section-eyebrow">DAY OVERVIEW</p>
        <h2 className="section-title mt-2">Nothing scheduled for this day</h2>
        <p className="section-description mx-auto mt-2">
          Events with a matching date will appear here with a compressed
          preview and any cross-event warnings.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-8">
      <header className="mb-6">
        <p className="section-eyebrow">DAY OVERVIEW</p>
        <h2 className="section-title mt-1">{formatDayHeading(date)}</h2>
        <p className="section-description mt-2">
          {sorted.length} event{sorted.length === 1 ? "" : "s"} on this day.
          Tap any card to zoom into its full timeline.
        </p>
      </header>

      <div className="space-y-5">
        {(["morning", "afternoon", "evening"] as DayPart[]).map((part) => {
          const list = grouped[part];
          if (list.length === 0) return null;
          const Icon = DAY_PART_ICON[part];
          return (
            <section key={part}>
              <h3 className="mb-2 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted">
                <Icon size={11} strokeWidth={1.6} />
                {DAY_PART_LABEL[part]}
              </h3>
              <div className="space-y-2">
                {list.map((event) => {
                  const items = allItems.filter(
                    (i) => i.eventId === event.eventId,
                  );
                  const vendorCount = countVendors(items);
                  return (
                    <DayEventCard
                      key={event.eventId}
                      event={event}
                      items={items}
                      vendorCount={vendorCount}
                      onExpand={() => onExpand(event.eventId)}
                    />
                  );
                })}
              </div>
            </section>
          );
        })}

        {crossEventConflicts.length > 0 && (
          <section className="rounded-md border border-gold/30 bg-gold-pale/30 px-4 py-3">
            <div className="flex items-center gap-2 text-[12.5px] font-medium text-ink">
              <AlertTriangle size={13} strokeWidth={1.6} className="text-gold" />
              {crossEventConflicts.length} cross-event warning
              {crossEventConflicts.length === 1 ? "" : "s"}
            </div>
            <ul className="mt-2 space-y-1 text-[12px] text-ink-muted">
              {crossEventConflicts.slice(0, 5).map((c) => (
                <li key={c.id}>· {c.message}</li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}

function DayEventCard({
  event,
  items,
  vendorCount,
  onExpand,
}: {
  event: ScheduleDayEventSummary;
  items: ScheduleItem[];
  vendorCount: number;
  onExpand: () => void;
}) {
  const stream = items
    .slice()
    .sort((a, b) => a.startTime.localeCompare(b.startTime))
    .slice(0, 10);

  return (
    <button
      type="button"
      onClick={onExpand}
      className="group w-full rounded-lg border border-border bg-white px-5 py-4 text-left transition-colors hover:border-ink-faint/40"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted">
            {event.eventType.replace(/_/g, " ")}
          </div>
          <h4 className="mt-1 text-[18px] font-semibold text-ink">
            {event.eventLabel}
          </h4>
          <p className="mt-1 text-[12.5px] text-ink-muted">
            {event.startTime
              ? `${formatTime12h(event.startTime)} – ${
                  event.endTime ? formatTime12h(event.endTime) : "…"
                }`
              : "Timeline not drafted yet"}
            {event.venueName && ` · ${event.venueName}`}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
          <span>
            {event.itemCount} item{event.itemCount === 1 ? "" : "s"}
          </span>
          {vendorCount > 0 && (
            <span>
              {vendorCount} vendor{vendorCount === 1 ? "" : "s"}
            </span>
          )}
          {event.hasConflicts && (
            <span className="rounded-full bg-rose-pale/70 px-2 py-0.5 text-rose">
              Conflicts
            </span>
          )}
        </div>
      </div>

      {stream.length > 0 && (
        <div className="mt-3 flex gap-1 overflow-hidden">
          {stream.map((i) => (
            <span
              key={i.id}
              className={cn(
                "flex h-1.5 min-w-[4%] flex-1 rounded-full",
                SCHEDULE_CATEGORY_META[i.category].accentClass,
              )}
              title={`${formatTime12h(i.startTime)} · ${i.label}`}
            />
          ))}
        </div>
      )}

      <p className="mt-3 text-[11.5px] font-medium text-ink-muted group-hover:text-ink">
        View full timeline →
      </p>
    </button>
  );
}

function groupByDayPart(
  events: ScheduleDayEventSummary[],
): Record<DayPart, ScheduleDayEventSummary[]> {
  const out: Record<DayPart, ScheduleDayEventSummary[]> = {
    morning: [],
    afternoon: [],
    evening: [],
  };
  for (const e of events) out[dayPartFor(e.startTime)].push(e);
  return out;
}

function countVendors(items: ScheduleItem[]): number {
  const keys = new Set<string>();
  for (const item of items) {
    for (const id of item.vendorIds) keys.add(`id:${id}`);
    for (const name of item.assignedTo) {
      if (name.trim()) keys.add(`legacy:${name.trim().toLowerCase()}`);
    }
  }
  return keys.size;
}

function formatDayHeading(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}
