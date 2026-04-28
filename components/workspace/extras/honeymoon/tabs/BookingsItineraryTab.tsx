"use client";

// ── Bookings & Itinerary tab ───────────────────────────────────────────────
// Bookings tracker (flights, hotels, activities) + day-by-day itinerary. Costs
// roll into a summary at the top so the couple knows how committed they are.

import { Check, Plus, X } from "lucide-react";
import { useMemo, useState } from "react";
import {
  BOOKING_PRIORITY_OPTIONS,
  BOOKING_STATUS_OPTIONS,
} from "@/lib/honeymoon-seed";
import { useHoneymoonStore } from "@/stores/honeymoon-store";
import type {
  Booking,
  BookingPriorityTier,
  BookingStatus,
  ItineraryDay,
  ItineraryItem,
} from "@/types/honeymoon";
import { cn } from "@/lib/utils";
import {
  InlineAdd,
  Section,
  TextInput,
  formatMoney,
} from "../../bachelorette/ui";
import { PriorityBookingPlan } from "../PriorityBookingPlan";
import { TripSeederPanel } from "../TripSeederPanel";
import type { DestinationConcept } from "@/lib/honeymoon/destination-catalog";

// Parses a narrative day range like "Days 1–4" → 4 nights, "Day 8" → 1.
// Accepts both en-dash and hyphen. Defaults to 1 when unparsable.
function parseDayCount(range: string): number {
  const cleaned = range.replace(/[–—]/g, "-");
  const match = cleaned.match(/Days?\s*(\d+)(?:\s*-\s*(\d+))?/i);
  if (!match) return 1;
  const start = Number(match[1]);
  const end = match[2] ? Number(match[2]) : start;
  if (!Number.isFinite(start) || !Number.isFinite(end)) return 1;
  return Math.max(1, end - start + 1);
}

function countDaysInNarrative(concept: DestinationConcept): number {
  return (
    concept.deepDive?.days.reduce(
      (sum, block) => sum + parseDayCount(block.range),
      0,
    ) ?? 0
  );
}

export function BookingsItineraryTab() {
  return (
    <div className="space-y-5">
      <PriorityBookingPlan />
      <BookingsTracker />
      <ItinerarySection />
    </div>
  );
}

// ── 3.1 Bookings Tracker ───────────────────────────────────────────────────

function BookingsTracker() {
  const bookings = useHoneymoonStore((s) => s.bookings);
  const budget = useHoneymoonStore((s) => s.budget);
  const addBooking = useHoneymoonStore((s) => s.addBooking);

  const { bookedCents, estimatedCents } = useMemo(() => {
    let booked = 0;
    let estimated = 0;
    for (const b of bookings) {
      if (b.status === "booked") booked += b.costCents;
      else estimated += b.costCents;
    }
    return { bookedCents: booked, estimatedCents: estimated };
  }, [bookings]);

  const totalCents = bookedCents + estimatedCents;
  const remainingCents = budget.totalBudgetCents - totalCents;

  return (
    <Section
      eyebrow="BOOKINGS"
      title="Flights, hotels, activities"
      description="Every reservation, hold, and receipt in one place. Holds convert to confirmed once the card runs."
    >
      <div className="overflow-x-auto">
        <table className="w-full text-[12.5px]">
          <thead>
            <tr className="border-b border-border/60">
              <th className="px-3 pb-2 text-left font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted">
                Booking
              </th>
              <th className="px-3 pb-2 text-left font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted">
                Priority
              </th>
              <th className="px-3 pb-2 text-left font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted">
                Status
              </th>
              <th className="px-3 pb-2 text-right font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted">
                Cost
              </th>
              <th className="px-3 pb-2 text-left font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted">
                Confirm #
              </th>
              <th className="pb-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {bookings.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-6 text-center text-[13px] italic text-ink-faint">
                  No bookings yet — start with the flights.
                </td>
              </tr>
            ) : (
              bookings.map((b) => <BookingRow key={b.id} booking={b} />)
            )}
          </tbody>
          <tfoot className="border-t border-border/60">
            <tr>
              <td className="px-3 pt-3 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted">
                Total booked
              </td>
              <td></td>
              <td className="px-3 pt-3 text-right font-mono text-[12.5px] tabular-nums text-ink">
                {formatMoney(bookedCents)}
              </td>
              <td colSpan={3}></td>
            </tr>
            <tr>
              <td className="px-3 pt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted">
                Total estimated
              </td>
              <td></td>
              <td className="px-3 pt-1 text-right font-mono text-[12.5px] tabular-nums text-ink-muted">
                {formatMoney(totalCents)}
              </td>
              <td colSpan={3}></td>
            </tr>
            <tr>
              <td className="px-3 pt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted">
                Budget · Remaining
              </td>
              <td></td>
              <td
                className={cn(
                  "px-3 pt-1 text-right font-mono text-[12.5px] tabular-nums",
                  remainingCents < 0 ? "text-rose" : "text-sage",
                )}
              >
                {formatMoney(budget.totalBudgetCents)} ·{" "}
                {formatMoney(Math.abs(remainingCents))}
                {remainingCents < 0 ? " over" : ""}
              </td>
              <td colSpan={3}></td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="mt-3">
        <InlineAdd
          placeholder="New booking (e.g. Rental car — Ubud)"
          onAdd={addBooking}
          buttonLabel="Add booking"
        />
      </div>
    </Section>
  );
}

function BookingRow({ booking }: { booking: Booking }) {
  const updateBooking = useHoneymoonStore((s) => s.updateBooking);
  const removeBooking = useHoneymoonStore((s) => s.removeBooking);
  const setStatus = useHoneymoonStore((s) => s.setBookingStatus);
  const setPriority = useHoneymoonStore((s) => s.setBookingPriority);

  return (
    <tr>
      <td className="px-3 py-2">
        <input
          value={booking.label}
          onChange={(e) => updateBooking(booking.id, { label: e.target.value })}
          className="w-full border-none bg-transparent text-[13px] text-ink focus:outline-none"
          aria-label="Booking label"
        />
      </td>
      <td className="px-3 py-2">
        <select
          value={booking.priorityTier ?? "unset"}
          onChange={(e) =>
            setPriority(booking.id, e.target.value as BookingPriorityTier)
          }
          className="rounded-sm border border-border bg-white px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted focus:border-saffron/60 focus:outline-none"
          style={{ fontFamily: "var(--font-mono)" }}
          aria-label="Priority tier"
        >
          {BOOKING_PRIORITY_OPTIONS.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
      </td>
      <td className="px-3 py-2">
        <select
          value={booking.status}
          onChange={(e) =>
            setStatus(booking.id, e.target.value as BookingStatus)
          }
          className="rounded-sm border border-border bg-white px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted focus:border-saffron/60 focus:outline-none"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {BOOKING_STATUS_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </td>
      <td className="px-3 py-2 text-right">
        <div className="flex items-center justify-end gap-1">
          <span className="text-ink-muted">$</span>
          <input
            type="number"
            value={Math.round(booking.costCents / 100)}
            onChange={(e) =>
              updateBooking(booking.id, {
                costCents: Math.max(0, Number(e.target.value) || 0) * 100,
              })
            }
            className="w-20 border-none bg-transparent text-right font-mono text-[12.5px] tabular-nums text-ink focus:outline-none"
            aria-label="Cost"
          />
          <label
            title="Estimated"
            className="ml-1 inline-flex items-center gap-1 font-mono text-[9.5px] uppercase tracking-[0.1em] text-ink-faint"
          >
            <input
              type="checkbox"
              checked={booking.estimated}
              onChange={(e) =>
                updateBooking(booking.id, { estimated: e.target.checked })
              }
              className="accent-ink"
            />
            est
          </label>
        </div>
      </td>
      <td className="px-3 py-2">
        <input
          value={booking.confirmationNumber ?? ""}
          onChange={(e) =>
            updateBooking(booking.id, { confirmationNumber: e.target.value })
          }
          placeholder="—"
          className="w-full border-none bg-transparent font-mono text-[11.5px] text-ink-muted placeholder:text-ink-faint focus:outline-none"
          aria-label="Confirmation number"
        />
      </td>
      <td className="py-2 pl-1 pr-3 text-right">
        <button
          type="button"
          onClick={() => removeBooking(booking.id)}
          className="text-ink-faint hover:text-rose"
          aria-label="Remove booking"
        >
          <X size={13} strokeWidth={2} />
        </button>
      </td>
    </tr>
  );
}

// ── 3.2 Itinerary ──────────────────────────────────────────────────────────

function ItinerarySection() {
  const days = useHoneymoonStore((s) => s.days);
  const items = useHoneymoonStore((s) => s.items);
  const addDay = useHoneymoonStore((s) => s.addDay);

  const [draftDate, setDraftDate] = useState("");
  const [draftLabel, setDraftLabel] = useState("");

  function commitDay() {
    if (!draftDate.trim() && !draftLabel.trim()) return;
    addDay(draftDate.trim() || "TBD", draftLabel.trim() || "Day");
    setDraftDate("");
    setDraftLabel("");
  }

  return (
    <Section
      eyebrow="ITINERARY"
      title="Day by day"
      description="A rough sketch at first — tighten as bookings confirm."
    >
      <div className="mb-4">
        <TripSeederPanel
          eyebrow="ITINERARY SCAFFOLD"
          title="Seed day blocks from the trip guide"
          copyWithConcept={(t) =>
            `Creates one day block per narrative day in the ${t} guide, labeled by stop (Positano, Ravello, etc.). You fill in the items.`
          }
          copyWithoutConcept="Mark a matched destination as Leading to scaffold your itinerary from its day-by-day narrative."
          isAlreadySeeded={(concept) => {
            const dive = concept.deepDive;
            if (!dive) return false;
            const existingLabels = new Set(
              days.map((d) => d.label.trim().toLowerCase()),
            );
            return dive.days.every((d) =>
              existingLabels.has(d.title.trim().toLowerCase()),
            );
          }}
          actionLabel={(concept) => {
            const total = countDaysInNarrative(concept);
            return `Seed ${total} day${total === 1 ? "" : "s"}`;
          }}
          onSeed={(concept) => {
            const dive = concept.deepDive;
            if (!dive) return;
            const existingLabels = new Set(
              days.map((d) => d.label.trim().toLowerCase()),
            );
            for (const block of dive.days) {
              const nights = parseDayCount(block.range);
              const label = block.title;
              if (existingLabels.has(label.trim().toLowerCase())) continue;
              for (let i = 0; i < nights; i++) {
                // Only set a date placeholder that hints at the range —
                // couple fills in specific dates later.
                addDay("TBD", label);
              }
              existingLabels.add(label.trim().toLowerCase());
            }
          }}
        />
      </div>

      {days.length === 0 ? (
        <p className="rounded-md border border-dashed border-border bg-ivory-warm/40 px-6 py-6 text-center text-[13px] italic text-ink-muted">
          No days yet — start with your arrival day.
        </p>
      ) : (
        <div className="space-y-4">
          {days.map((day) => (
            <DayBlock
              key={day.id}
              day={day}
              items={items.filter((i) => i.dayId === day.id)}
            />
          ))}
        </div>
      )}

      <div className="mt-4 grid grid-cols-[200px_1fr_auto] gap-2">
        <TextInput
          value={draftDate}
          onChange={setDraftDate}
          placeholder="Date (e.g. Saturday, April 26)"
        />
        <TextInput
          value={draftLabel}
          onChange={setDraftLabel}
          placeholder="Label (e.g. Travel)"
        />
        <button
          type="button"
          onClick={commitDay}
          className="inline-flex items-center gap-1 rounded-md bg-ink px-3 py-1.5 text-[12px] font-medium text-ivory hover:bg-ink-soft"
        >
          <Plus size={12} strokeWidth={2} /> Add day
        </button>
      </div>
    </Section>
  );
}

function DayBlock({
  day,
  items,
}: {
  day: ItineraryDay;
  items: ItineraryItem[];
}) {
  const updateDay = useHoneymoonStore((s) => s.updateDay);
  const removeDay = useHoneymoonStore((s) => s.removeDay);
  const addItem = useHoneymoonStore((s) => s.addItem);

  const [draftTime, setDraftTime] = useState("");
  const [draftTitle, setDraftTitle] = useState("");

  function commit() {
    if (!draftTitle.trim()) return;
    addItem(day.id, {
      time: draftTime.trim() || "—",
      title: draftTitle.trim(),
    });
    setDraftTime("");
    setDraftTitle("");
  }

  return (
    <section className="rounded-lg border border-border bg-white">
      <header className="flex items-start justify-between gap-3 border-b border-border/60 px-5 py-3">
        <div className="min-w-0 flex-1">
          <p
            className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-saffron"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Day {day.dayNumber}
          </p>
          <div className="mt-1 grid grid-cols-[200px_1fr] items-center gap-2">
            <input
              value={day.date}
              onChange={(e) => updateDay(day.id, { date: e.target.value })}
              placeholder="Date"
              className="border-none bg-transparent font-serif text-[14px] text-ink focus:outline-none"
              aria-label="Day date"
            />
            <input
              value={day.label}
              onChange={(e) => updateDay(day.id, { label: e.target.value })}
              placeholder="Label"
              className="border-none bg-transparent font-serif text-[16px] text-ink focus:outline-none"
              aria-label="Day label"
            />
          </div>
        </div>
        <button
          type="button"
          onClick={() => removeDay(day.id)}
          className="text-ink-faint hover:text-rose"
          aria-label="Remove day"
        >
          <X size={13} strokeWidth={2} />
        </button>
      </header>

      <ul className="divide-y divide-border/40">
        {items.length === 0 ? (
          <li className="px-5 py-3 text-[12.5px] italic text-ink-faint">
            Nothing planned yet.
          </li>
        ) : (
          items.map((it) => <ItemRow key={it.id} item={it} />)
        )}
      </ul>

      <div className="grid grid-cols-[120px_1fr_auto] gap-2 border-t border-border/40 px-5 py-3">
        <TextInput
          value={draftTime}
          onChange={setDraftTime}
          placeholder="10:00 AM"
        />
        <TextInput
          value={draftTitle}
          onChange={setDraftTitle}
          placeholder="What's happening?"
        />
        <button
          type="button"
          onClick={commit}
          className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-[12px] font-medium text-ink-muted hover:border-saffron/40 hover:text-saffron"
        >
          <Plus size={11} strokeWidth={2} /> Add
        </button>
      </div>
    </section>
  );
}

function ItemRow({ item }: { item: ItineraryItem }) {
  const updateItem = useHoneymoonStore((s) => s.updateItem);
  const removeItem = useHoneymoonStore((s) => s.removeItem);
  const toggleConfirmed = useHoneymoonStore((s) => s.toggleItemConfirmed);

  return (
    <li className="grid grid-cols-[100px_1fr_auto_auto] items-start gap-3 px-5 py-2.5">
      <input
        value={item.time}
        onChange={(e) => updateItem(item.id, { time: e.target.value })}
        className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-ink-muted border-none bg-transparent focus:outline-none"
        style={{ fontFamily: "var(--font-mono)" }}
        aria-label="Time"
      />
      <div className="min-w-0 flex-1">
        <input
          value={item.title}
          onChange={(e) => updateItem(item.id, { title: e.target.value })}
          className="w-full border-none bg-transparent text-[13px] text-ink focus:outline-none"
          aria-label="Title"
        />
        <input
          value={item.note ?? ""}
          onChange={(e) => updateItem(item.id, { note: e.target.value })}
          placeholder="Note (optional)"
          className="mt-0.5 w-full border-none bg-transparent text-[11.5px] text-ink-muted placeholder:text-ink-faint focus:outline-none"
          aria-label="Note"
        />
      </div>
      <button
        type="button"
        onClick={() => toggleConfirmed(item.id)}
        className={cn(
          "inline-flex h-5 w-5 items-center justify-center rounded-full border transition-colors",
          item.confirmed
            ? "border-sage bg-sage text-white"
            : "border-border text-transparent hover:border-sage/40",
        )}
        aria-label={item.confirmed ? "Confirmed" : "Mark confirmed"}
        title={item.confirmed ? "Confirmed" : "Tap to confirm"}
      >
        <Check size={11} strokeWidth={2.5} />
      </button>
      <button
        type="button"
        onClick={() => removeItem(item.id)}
        className="text-ink-faint hover:text-rose"
        aria-label="Remove item"
      >
        <X size={13} strokeWidth={2} />
      </button>
    </li>
  );
}

