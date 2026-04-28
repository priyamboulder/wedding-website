"use client";

// ── Itinerary tab ──────────────────────────────────────────────────────────
// Grouped by day, each event is editable in place. Time, activity, location,
// dress code, reservation, and notes all read/write directly to the store.
// "Confirmed" checkbox flips the row tone; "Optional" dims the row.

import {
  CalendarHeart,
  CheckCircle2,
  Circle,
  Download,
  Plus,
  Send,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useBachelorStore } from "@/stores/bachelor-store";
import type { ItineraryEvent } from "@/types/bachelor";
import { cn } from "@/lib/utils";
import { Label, Section, TextArea, TextInput } from "../ui";

export function ItineraryTab() {
  return (
    <div className="space-y-5">
      <ItineraryHeader />
      <DayStack />
      <BufferTip />
    </div>
  );
}

function ItineraryHeader() {
  const days = useBachelorStore((s) => s.days);
  const events = useBachelorStore((s) => s.events);
  const addDay = useBachelorStore((s) => s.addDay);

  const confirmed = events.filter((e) => e.confirmed).length;

  return (
    <Section
      eyebrow="THE WEEKEND"
      title={`${days.length} days · ${events.length} events · ${confirmed} locked in`}
      description="Every row is editable. Check the box when a detail is locked in."
      right={
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => addDay(`Day ${days.length + 1}`, "New day")}
            className="inline-flex items-center gap-1 rounded-md border border-border bg-white px-3 py-1.5 text-[12px] font-medium text-ink-muted transition-colors hover:border-saffron/40 hover:text-saffron"
          >
            <Plus size={12} strokeWidth={2} /> Add day
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-md border border-border bg-white px-3 py-1.5 text-[12px] font-medium text-ink-muted transition-colors hover:border-saffron/40 hover:text-saffron"
          >
            <Download size={12} strokeWidth={1.8} /> Export PDF
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-md bg-ink px-3 py-1.5 text-[12px] font-medium text-ivory hover:bg-ink-soft"
          >
            <Send size={12} strokeWidth={1.8} /> Drop in group chat
          </button>
        </div>
      }
    >
      <p className="text-[12.5px] text-ink-muted">
        The crew sees a clean, read-only version — organizer notes and private
        details stay hidden.
      </p>
    </Section>
  );
}

function DayStack() {
  const days = useBachelorStore((s) => s.days);
  const events = useBachelorStore((s) => s.events);

  const eventsByDay = useMemo(() => {
    const map: Record<string, ItineraryEvent[]> = {};
    for (const d of days) map[d.id] = [];
    for (const e of events) {
      if (map[e.dayId]) map[e.dayId].push(e);
    }
    for (const id of Object.keys(map)) {
      map[id].sort((a, b) => a.time.localeCompare(b.time));
    }
    return map;
  }, [days, events]);

  return (
    <div className="space-y-4">
      {days.map((day) => (
        <DayCard
          key={day.id}
          dayId={day.id}
          date={day.date}
          label={day.label}
          events={eventsByDay[day.id] ?? []}
        />
      ))}
    </div>
  );
}

function DayCard({
  dayId,
  date,
  label,
  events,
}: {
  dayId: string;
  date: string;
  label: string;
  events: ItineraryEvent[];
}) {
  const updateDay = useBachelorStore((s) => s.updateDay);
  const removeDay = useBachelorStore((s) => s.removeDay);
  const addEvent = useBachelorStore((s) => s.addEvent);

  return (
    <section className="rounded-lg border border-border bg-white">
      <header className="flex items-center justify-between gap-3 border-b border-border/60 px-5 py-3">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <CalendarHeart
            size={16}
            strokeWidth={1.6}
            className="shrink-0 text-ink-faint"
          />
          <TextInput
            value={date}
            onChange={(v) => updateDay(dayId, { date: v })}
            placeholder="Friday, July 12"
            className="max-w-[260px]"
          />
          <TextInput
            value={label}
            onChange={(v) => updateDay(dayId, { label: v })}
            placeholder="Roll in"
            className="max-w-[220px]"
          />
        </div>
        <button
          type="button"
          aria-label="Remove day"
          onClick={() => removeDay(dayId)}
          className="text-ink-faint hover:text-rose"
        >
          <Trash2 size={14} strokeWidth={1.8} />
        </button>
      </header>

      <ul className="divide-y divide-border/40">
        {events.map((ev) => (
          <EventRow key={ev.id} event={ev} />
        ))}
        {events.length === 0 && (
          <li className="px-5 py-6 text-center text-[12.5px] italic text-ink-faint">
            No events yet for this day.
          </li>
        )}
      </ul>

      <footer className="border-t border-border/40 px-5 py-2.5">
        <button
          type="button"
          onClick={() => addEvent(dayId, { time: "12:00 PM" })}
          className="inline-flex items-center gap-1 text-[12px] font-medium text-saffron hover:underline"
        >
          <Plus size={12} strokeWidth={2} /> Add event
        </button>
      </footer>
    </section>
  );
}

function EventRow({ event }: { event: ItineraryEvent }) {
  const updateEvent = useBachelorStore((s) => s.updateEvent);
  const removeEvent = useBachelorStore((s) => s.removeEvent);
  const toggleConfirmed = useBachelorStore((s) => s.toggleEventConfirmed);
  const [expanded, setExpanded] = useState(false);

  return (
    <li className={cn("px-5 py-3", event.optional && "bg-ivory-warm/30")}>
      <div className="grid grid-cols-[90px_1fr_auto_auto] items-center gap-3">
        <TextInput
          value={event.time}
          onChange={(v) => updateEvent(event.id, { time: v })}
          placeholder="3:00 PM"
          className="text-[12.5px]"
        />
        <TextInput
          value={event.activity}
          onChange={(v) => updateEvent(event.id, { activity: v })}
          placeholder="Activity…"
        />
        <button
          type="button"
          onClick={() => toggleConfirmed(event.id)}
          className={cn(
            "inline-flex items-center gap-1 rounded-sm px-2 py-1 font-mono text-[10px] uppercase tracking-[0.12em] transition-colors",
            event.confirmed
              ? "bg-sage-pale/60 text-sage"
              : "bg-ivory-warm text-ink-muted hover:text-ink",
          )}
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {event.confirmed ? (
            <CheckCircle2 size={11} strokeWidth={2} />
          ) : (
            <Circle size={11} strokeWidth={1.8} />
          )}
          {event.confirmed ? "Booked" : "Tentative"}
        </button>
        <button
          type="button"
          aria-label="Remove event"
          onClick={() => removeEvent(event.id)}
          className="text-ink-faint hover:text-rose"
        >
          <Trash2 size={13} strokeWidth={1.8} />
        </button>
      </div>

      <button
        type="button"
        onClick={() => setExpanded((x) => !x)}
        className="mt-2 text-[11.5px] font-medium text-ink-muted hover:text-ink"
      >
        {expanded ? "Hide details" : "Add details"}
      </button>

      {expanded && (
        <div className="mt-3 grid grid-cols-1 gap-3 rounded-md border border-border/60 bg-ivory-warm/40 p-3 md:grid-cols-2">
          <Field label="Location">
            <TextInput
              value={event.location ?? ""}
              onChange={(v) =>
                updateEvent(event.id, { location: v || undefined })
              }
              placeholder="Address or venue"
            />
          </Field>
          <Field label="Dress code">
            <TextInput
              value={event.dressCode ?? ""}
              onChange={(v) =>
                updateEvent(event.id, { dressCode: v || undefined })
              }
              placeholder="Polos, jeans, collared, whatever…"
            />
          </Field>
          <Field label="Reservation">
            <TextInput
              value={event.reservation ?? ""}
              onChange={(v) =>
                updateEvent(event.id, { reservation: v || undefined })
              }
              placeholder="Under whose name, time, party size…"
            />
          </Field>
          <Field label="Optional">
            <label className="flex items-center gap-2 text-[12.5px] text-ink-muted">
              <input
                type="checkbox"
                checked={!!event.optional}
                onChange={(e) =>
                  updateEvent(event.id, {
                    optional: e.target.checked || undefined,
                  })
                }
                className="accent-ink"
              />
              Mark as optional
            </label>
          </Field>
          <div className="md:col-span-2">
            <Field label="Notes">
              <TextArea
                value={event.notes ?? ""}
                onChange={(v) =>
                  updateEvent(event.id, { notes: v || undefined })
                }
                placeholder="Any extras the crew should know…"
                rows={2}
              />
            </Field>
          </div>
        </div>
      )}
    </li>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

function BufferTip() {
  return (
    <div className="flex items-start gap-2 rounded-md border border-saffron/25 bg-saffron-pale/30 px-4 py-3">
      <Sparkles
        size={14}
        strokeWidth={1.8}
        className="mt-0.5 shrink-0 text-saffron"
      />
      <p className="text-[12.5px] leading-relaxed text-ink-muted">
        Build in buffer time and don't book anything before 10 AM the morning
        after the big night. Nothing kills the vibe like a rushed hangover.
      </p>
    </div>
  );
}
