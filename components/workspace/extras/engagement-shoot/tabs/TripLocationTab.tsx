"use client";

// ── Phase 4 · Location & Trip ──────────────────────────────────────────────
// Shoot locations (what + why + when + permits), trip itinerary by day, and
// travel logistics (flights/hotel/car/permits) tracker.

import { Plus, Trash2 } from "lucide-react";
import { useMemo } from "react";
import { useEngagementShootStore } from "@/stores/engagement-shoot-store";
import type {
  TripDayItem,
  TripLogistic,
  TripLogisticStatus,
} from "@/types/engagement-shoot";
import {
  InlineEdit,
  Label,
  PhaseStepper,
  Section,
  StatusPill,
  TextInput,
  formatMoney,
} from "../ui";

export function TripLocationTab() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <PhaseStepper phase={4} count={6} label="Trip & location" />
        <h2 className="font-serif text-[24px] leading-tight text-ink">
          The Adventure
        </h2>
        <p className="max-w-2xl text-[13.5px] leading-relaxed text-ink-muted">
          The shoot might be 4 hours — the trip is the whole weekend. Locations,
          daily itinerary, and logistics live here so nothing slips.
        </p>
      </header>

      <LocationsPanel />
      <ItineraryPanel />
      <LogisticsPanel />
    </div>
  );
}

// ── Locations ──────────────────────────────────────────────────────────────

function LocationsPanel() {
  const locations = useEngagementShootStore((s) => s.locations);
  const add = useEngagementShootStore((s) => s.addLocation);

  const sorted = [...locations].sort((a, b) => a.orderIndex - b.orderIndex);

  return (
    <Section
      eyebrow="LOCATIONS"
      title="Shoot locations"
      description="Think of each like a set — what it does for the photos, when to shoot it, and what you need to access it."
      right={
        <button
          type="button"
          onClick={() => add()}
          className="inline-flex items-center gap-1 rounded-md bg-ink px-2.5 py-1 text-[11.5px] font-medium text-ivory hover:bg-ink-soft"
        >
          <Plus size={11} strokeWidth={2} />
          Add location
        </button>
      }
    >
      {sorted.length === 0 ? (
        <p className="text-[12.5px] italic text-ink-faint">
          No locations yet. Add the places you want to shoot — we'll suggest
          timing and logistics for each.
        </p>
      ) : (
        <div className="space-y-4">
          {sorted.map((loc, i) => (
            <LocationCard key={loc.id} locationId={loc.id} index={i + 1} />
          ))}
        </div>
      )}
    </Section>
  );
}

function LocationCard({
  locationId,
  index,
}: {
  locationId: string;
  index: number;
}) {
  const loc = useEngagementShootStore((s) =>
    s.locations.find((l) => l.id === locationId),
  );
  const update = useEngagementShootStore((s) => s.updateLocation);
  const remove = useEngagementShootStore((s) => s.removeLocation);

  if (!loc) return null;

  return (
    <div className="grid grid-cols-1 gap-4 rounded-lg border border-border bg-white p-4 md:grid-cols-[180px_1fr_auto]">
      <div className="relative aspect-[4/3] overflow-hidden rounded-md border border-border bg-gradient-to-br from-ivory-warm to-gold-pale/30">
        <div className="absolute inset-0 flex items-center justify-center px-3 text-center">
          <span className="font-serif text-[12px] leading-snug text-ink/50">
            {loc.name}
          </span>
        </div>
        <span
          className="absolute left-2 top-2 rounded-full bg-ink/80 px-2 py-0.5 font-mono text-[10px] text-ivory"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Stop {index}
        </span>
      </div>

      <div className="min-w-0 space-y-2">
        <InlineEdit
          value={loc.name}
          onChange={(v) => update(loc.id, { name: v })}
          className="font-serif text-[17px] leading-tight text-ink"
          placeholder="Location name"
        />
        <InlineEdit
          value={loc.address}
          onChange={(v) => update(loc.id, { address: v })}
          placeholder="Address / neighborhood"
          className="text-[12.5px] text-ink-muted"
        />
        <div>
          <Label>Why it works</Label>
          <InlineEdit
            multiline
            value={loc.whyItWorks}
            onChange={(v) => update(loc.id, { whyItWorks: v })}
            placeholder="Light, texture, scale — what this location does for the photos."
            className="mt-1 min-h-[50px] border border-border bg-white px-2 py-1.5"
          />
        </div>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
          <div>
            <Label>Best time</Label>
            <TextInput
              value={loc.bestTime}
              onChange={(v) => update(loc.id, { bestTime: v })}
              placeholder="Sunrise — 6:00–7:30am"
            />
          </div>
          <div>
            <Label>Permit</Label>
            <TextInput
              value={loc.permitNote}
              onChange={(v) => update(loc.id, { permitNote: v })}
              placeholder="Any permit or access notes"
            />
          </div>
          <div>
            <Label>Logistics</Label>
            <TextInput
              value={loc.logistics}
              onChange={(v) => update(loc.id, { logistics: v })}
              placeholder="Parking, restrooms, changing"
            />
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => remove(loc.id)}
        aria-label="Remove location"
        className="self-start text-ink-faint hover:text-rose"
      >
        <Trash2 size={13} strokeWidth={1.8} />
      </button>
    </div>
  );
}

// ── Itinerary ──────────────────────────────────────────────────────────────

function ItineraryPanel() {
  const days = useEngagementShootStore((s) => s.tripDays);
  const items = useEngagementShootStore((s) => s.tripItems);
  const addDay = useEngagementShootStore((s) => s.addTripDay);
  const sorted = useMemo(
    () => [...days].sort((a, b) => a.orderIndex - b.orderIndex),
    [days],
  );

  return (
    <Section
      eyebrow="ITINERARY"
      title="Day-by-day"
      description="The whole trip — not just the shoot. Food, downtime, scouting, and celebration."
      right={
        <button
          type="button"
          onClick={() => addDay(`Day ${sorted.length + 1}`, "")}
          className="inline-flex items-center gap-1 rounded-md border border-border bg-white px-2 py-1 text-[11.5px] text-ink-muted hover:border-saffron/40 hover:text-saffron"
        >
          <Plus size={11} strokeWidth={2} />
          Add day
        </button>
      }
    >
      {sorted.length === 0 ? (
        <p className="text-[12.5px] italic text-ink-faint">
          No days yet — add one to start building the trip.
        </p>
      ) : (
        <div className="space-y-5">
          {sorted.map((day) => {
            const dayItems = items.filter((i) => i.dayId === day.id);
            return (
              <DayCard key={day.id} dayId={day.id} items={dayItems} />
            );
          })}
        </div>
      )}
    </Section>
  );
}

function DayCard({
  dayId,
  items,
}: {
  dayId: string;
  items: TripDayItem[];
}) {
  const day = useEngagementShootStore((s) =>
    s.tripDays.find((d) => d.id === dayId),
  );
  const update = useEngagementShootStore((s) => s.updateTripDay);
  const remove = useEngagementShootStore((s) => s.removeTripDay);
  const addItem = useEngagementShootStore((s) => s.addTripItem);

  if (!day) return null;

  return (
    <div className="rounded-lg border border-border bg-white">
      <header className="flex items-start justify-between gap-3 border-b border-border/70 p-4">
        <div className="flex-1 min-w-0">
          <InlineEdit
            value={day.label}
            onChange={(v) => update(day.id, { label: v })}
            placeholder="Friday — Arrive & settle in"
            className="font-serif text-[16px] leading-tight text-ink"
          />
          <div className="mt-1 flex items-center gap-3">
            <InlineEdit
              value={day.date}
              onChange={(v) => update(day.id, { date: v })}
              placeholder="Oct 9 2026"
              className="text-[11.5px] text-ink-muted"
            />
          </div>
          <InlineEdit
            value={day.summary}
            onChange={(v) => update(day.id, { summary: v })}
            placeholder="One-line summary — sets the tone for the day."
            className="mt-1 text-[12.5px] text-ink-muted"
          />
        </div>
        <button
          type="button"
          onClick={() => remove(day.id)}
          aria-label="Remove day"
          className="shrink-0 text-ink-faint hover:text-rose"
        >
          <Trash2 size={13} strokeWidth={1.8} />
        </button>
      </header>

      <div className="p-4">
        {items.length === 0 ? (
          <p className="mb-2 text-[12px] italic text-ink-faint">
            No items yet — add meals, shoots, experiences, rest.
          </p>
        ) : (
          <ul className="space-y-1.5">
            {items.map((item) => (
              <TripItemRow key={item.id} item={item} />
            ))}
          </ul>
        )}
        <button
          type="button"
          onClick={() => addItem(day.id)}
          className="mt-3 inline-flex items-center gap-1 rounded-md border border-border bg-white px-2 py-1 text-[11.5px] text-ink-muted hover:border-saffron/40 hover:text-saffron"
        >
          <Plus size={11} strokeWidth={2} />
          Add item
        </button>
      </div>
    </div>
  );
}

function TripItemRow({ item }: { item: TripDayItem }) {
  const update = useEngagementShootStore((s) => s.updateTripItem);
  const remove = useEngagementShootStore((s) => s.removeTripItem);

  const tone =
    item.kind === "shoot"
      ? "bg-saffron/12 text-saffron"
      : item.kind === "meal"
        ? "bg-gold-pale/50 text-gold"
        : item.kind === "rest"
          ? "bg-sage-pale/50 text-sage"
          : item.kind === "travel"
            ? "bg-ink/10 text-ink"
            : "bg-ivory-warm/60 text-ink-muted";

  return (
    <li className="group grid grid-cols-[80px_auto_1fr_auto] items-start gap-2 rounded-md border border-border/60 bg-ivory-warm/20 px-3 py-2">
      <InlineEdit
        value={item.time}
        onChange={(v) => update(item.id, { time: v })}
        placeholder="Time"
        className="font-mono text-[12px] tabular-nums text-ink-muted"
      />
      <select
        value={item.kind}
        onChange={(e) =>
          update(item.id, { kind: e.target.value as TripDayItem["kind"] })
        }
        className={`shrink-0 rounded-sm px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] ${tone}`}
        style={{ fontFamily: "var(--font-mono)" }}
      >
        <option value="travel">Travel</option>
        <option value="shoot">Shoot</option>
        <option value="meal">Meal</option>
        <option value="rest">Rest</option>
        <option value="experience">Experience</option>
      </select>
      <div className="min-w-0">
        <InlineEdit
          value={item.title}
          onChange={(v) => update(item.id, { title: v })}
          placeholder="What's happening"
          className="text-[13px] text-ink"
        />
        <InlineEdit
          value={item.detail}
          onChange={(v) => update(item.id, { detail: v })}
          placeholder="Detail"
          className="text-[11.5px] text-ink-muted"
        />
      </div>
      <button
        type="button"
        onClick={() => remove(item.id)}
        aria-label="Remove item"
        className="shrink-0 text-ink-faint opacity-0 transition-opacity hover:text-rose group-hover:opacity-100"
      >
        <Trash2 size={12} strokeWidth={1.8} />
      </button>
    </li>
  );
}

// ── Logistics ──────────────────────────────────────────────────────────────

const LOGISTIC_STATUS: { id: TripLogisticStatus; label: string; tone: Parameters<typeof StatusPill>[0]["tone"] }[] = [
  { id: "researching", label: "Researching", tone: "muted" },
  { id: "held", label: "On hold", tone: "gold" },
  { id: "booked", label: "Booked", tone: "sage" },
];

function LogisticsPanel() {
  const logistics = useEngagementShootStore((s) => s.logistics);
  const add = useEngagementShootStore((s) => s.addLogistic);

  const total = logistics.reduce((sum, l) => sum + l.amountCents, 0);

  return (
    <Section
      eyebrow="LOGISTICS"
      title="Flights, hotels, permits, and everything that has to be booked"
      right={
        <div className="flex items-center gap-3">
          <span
            className="font-mono text-[11px] text-ink-muted"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Running total · {formatMoney(total)}
          </span>
          <button
            type="button"
            onClick={() => add()}
            className="inline-flex items-center gap-1 rounded-md bg-ink px-2.5 py-1 text-[11.5px] font-medium text-ivory hover:bg-ink-soft"
          >
            <Plus size={11} strokeWidth={2} />
            Add
          </button>
        </div>
      }
    >
      {logistics.length === 0 ? (
        <p className="text-[12.5px] italic text-ink-faint">
          Nothing tracked yet — add flights, hotel, car, permits.
        </p>
      ) : (
        <ul className="space-y-2">
          {logistics.map((item) => (
            <LogisticRow key={item.id} item={item} />
          ))}
        </ul>
      )}
    </Section>
  );
}

function LogisticRow({ item }: { item: TripLogistic }) {
  const update = useEngagementShootStore((s) => s.updateLogistic);
  const remove = useEngagementShootStore((s) => s.removeLogistic);

  const statusBadge =
    LOGISTIC_STATUS.find((s) => s.id === item.status) ?? LOGISTIC_STATUS[0]!;

  return (
    <li className="group grid grid-cols-[auto_1fr_auto_auto_auto_auto] items-center gap-2 rounded-md border border-border bg-white px-3 py-2">
      <select
        value={item.kind}
        onChange={(e) =>
          update(item.id, { kind: e.target.value as TripLogistic["kind"] })
        }
        className="shrink-0 rounded-md border border-transparent bg-transparent px-1 py-0.5 text-[11px] text-ink-muted hover:border-border"
      >
        <option value="flight">Flight</option>
        <option value="hotel">Hotel</option>
        <option value="car">Car</option>
        <option value="activity">Activity</option>
        <option value="other">Other</option>
      </select>
      <div className="min-w-0">
        <InlineEdit
          value={item.label}
          onChange={(v) => update(item.id, { label: v })}
          placeholder="Label"
        />
        <InlineEdit
          value={item.note}
          onChange={(v) => update(item.id, { note: v })}
          placeholder="Notes"
          className="text-[11.5px] text-ink-muted"
        />
      </div>

      <input
        type="number"
        min={0}
        value={item.amountCents ? Math.round(item.amountCents / 100) : ""}
        onChange={(e) =>
          update(item.id, { amountCents: Number(e.target.value) * 100 || 0 })
        }
        placeholder="$"
        className="w-24 shrink-0 rounded-md border border-border bg-white px-2 py-0.5 text-right text-[11.5px] text-ink tabular-nums focus:border-saffron/60 focus:outline-none"
      />

      <select
        value={item.status}
        onChange={(e) =>
          update(item.id, {
            status: e.target.value as TripLogisticStatus,
          })
        }
        className="shrink-0 rounded-sm border border-transparent bg-transparent text-[11.5px] text-ink-muted"
        aria-label="Status"
      >
        {LOGISTIC_STATUS.map((s) => (
          <option key={s.id} value={s.id}>
            {s.label}
          </option>
        ))}
      </select>

      <StatusPill tone={statusBadge.tone} label={statusBadge.label} />

      <button
        type="button"
        onClick={() => remove(item.id)}
        aria-label="Remove"
        className="shrink-0 text-ink-faint opacity-0 transition-opacity hover:text-rose group-hover:opacity-100"
      >
        <Trash2 size={12} strokeWidth={1.8} />
      </button>
    </li>
  );
}
