"use client";

// ── AI-first seating chart shell ─────────────────────────────────────
// Three-panel layout for /guests/seating-chart that inverts the old
// "blank canvas" flow: the primary action is "✦ Auto-assign all" which
// produces a complete zone-colored arrangement in one click. The user's
// job is to refine — via drag-drop, smart buttons, or (future) chat.
//
// Layout:
//   ┌──────────────┬────────────────────────────┬──────────────────┐
//   │ Guest Pool   │  Venue Canvas              │ Table Inspector  │
//   │ (left)       │  (center, zone-colored)    │ (right)          │
//   └──────────────┴────────────────────────────┴──────────────────┘

import { useEffect, useMemo, useState } from "react";
import { Plus, RefreshCw, RotateCcw, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { SeatingCanvas } from "./SeatingCanvas";
import { DiningIntelligenceBadge } from "./DiningIntelligenceBadge";
import { GuestPoolPanel } from "./GuestPoolPanel";
import { TableInspectorPanel } from "./TableInspectorPanel";
import {
  totalCapacity,
  useSeatingStore,
} from "@/stores/seating-store";
import { useSeatingAssignmentsStore } from "@/stores/seating-assignments-store";
import { runAutoAssignAll } from "@/lib/seating-ai";
import type { SeatingEventOption, SeatingGuest } from "@/types/seating-guest";
import { DEFAULT_SEATING_EVENT } from "@/types/seating-guest";

interface Props {
  guests?: SeatingGuest[];
  events?: SeatingEventOption[];
}

export function AISeatingChart({ guests = [], events }: Props) {
  const tables = useSeatingStore((s) => s.tables);
  const fixed = useSeatingStore((s) => s.fixed);
  const selectedTableId = useSeatingStore((s) => s.selectedTableId);
  const addTable = useSeatingStore((s) => s.addTable);
  const setActivePlan = useSeatingStore((s) => s.setActivePlan);

  const activeEventId = useSeatingAssignmentsStore((s) => s.activeEventId);
  const setActiveEvent = useSeatingAssignmentsStore((s) => s.setActiveEvent);
  const assignmentForEvent = useSeatingAssignmentsStore(
    (s) => s.assignments[activeEventId],
  );
  const assignments = useMemo(
    () => assignmentForEvent ?? [],
    [assignmentForEvent],
  );
  const clearEvent = useSeatingAssignmentsStore((s) => s.clearEvent);
  const clearDining = useSeatingAssignmentsStore((s) => s.clearDining);

  useEffect(() => {
    setActivePlan(activeEventId);
  }, [activeEventId, setActivePlan]);

  const eventOptions: SeatingEventOption[] = useMemo(() => {
    if (events && events.length > 0) return events;
    return [DEFAULT_SEATING_EVENT];
  }, [events]);

  useEffect(() => {
    if (!eventOptions.some((e) => e.id === activeEventId)) {
      setActiveEvent(eventOptions[0].id);
    }
  }, [eventOptions, activeEventId, setActiveEvent]);

  const activeEvent =
    eventOptions.find((e) => e.id === activeEventId) ?? eventOptions[0];

  const eventGuests: SeatingGuest[] = useMemo(() => {
    if (!guests.length) return [];
    const strict = guests.filter((g) => g.rsvp?.[activeEventId] === "confirmed");
    if (strict.length > 0) return strict;
    return guests.filter((g) =>
      Object.values(g.rsvp ?? {}).some((s) => s === "confirmed"),
    );
  }, [guests, activeEventId]);

  const capacity = totalCapacity(tables);
  const seated = assignments.length;
  const unassigned = Math.max(0, eventGuests.length - seated);
  const fillPct = capacity > 0 ? Math.round((seated / capacity) * 100) : 0;

  const canAutoAssign = tables.length > 0 && eventGuests.length > 0;

  // One-click AI banner state
  const [banner, setBanner] = useState<string>("");
  const [oneClickBusy, setOneClickBusy] = useState(false);

  useEffect(() => {
    if (!banner) return;
    const t = window.setTimeout(() => setBanner(""), 7000);
    return () => window.clearTimeout(t);
  }, [banner]);

  const handleAutoAssignAll = async () => {
    if (!canAutoAssign || oneClickBusy) return;
    setOneClickBusy(true);
    setBanner("Claude is arranging your guests — this takes 10–20 seconds.");
    const result = await runAutoAssignAll({
      eventId: activeEventId,
      eventLabel: activeEvent.label,
      guests: eventGuests,
      strategy: "family_first",
      repositionRings: true,
    });
    setOneClickBusy(false);
    setBanner(result.ok ? result.summary : result.error ?? "Auto-assign failed.");
  };

  const handleReset = () => {
    const ok = window.confirm(
      `Reset the chart for ${activeEvent.label}? This clears all seat assignments and the Dining Intelligence digest.`,
    );
    if (!ok) return;
    clearEvent();
    clearDining();
    setBanner(`Cleared assignments for ${activeEvent.label}.`);
  };

  return (
    <div className="flex h-[calc(100vh-220px)] min-h-[640px] flex-col gap-3">
      {/* ── Top action bar ── */}
      <header className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-white px-4 py-3">
        <div className="flex items-center gap-3">
          {/* Event selector */}
          <div className="flex items-center gap-2 rounded-md border border-border bg-ivory/40 px-3 py-1.5">
            <span className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-faint">
              Event
            </span>
            <select
              value={activeEventId}
              onChange={(e) => setActiveEvent(e.target.value)}
              className="bg-transparent text-[12.5px] font-serif text-ink outline-none"
            >
              {eventOptions.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.label}
                  {ev.date ? ` · ${ev.date}` : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Stats pills */}
          <StatPill label="Tables" value={tables.length} />
          <StatPill label="Seated" value={`${seated}/${eventGuests.length}`} />
          <StatPill
            label="Unassigned"
            value={unassigned}
            tone={unassigned > 0 ? "amber" : "green"}
          />
          <StatPill label="Filled" value={`${fillPct}%`} />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            disabled={seated === 0}
            className={cn(
              "flex items-center gap-1.5 rounded-md border border-border bg-white px-3 py-1.5 text-[12px]",
              seated === 0
                ? "cursor-not-allowed text-ink-faint"
                : "text-ink-muted hover:border-rose/30 hover:text-rose",
            )}
            title="Clear all assignments for this event"
          >
            <RotateCcw size={12} strokeWidth={1.7} />
            Reset
          </button>
          <button
            onClick={() => addTable("round")}
            className="flex items-center gap-1.5 rounded-md border border-border bg-white px-3 py-1.5 text-[12px] text-ink-muted hover:border-ink/25 hover:text-ink"
            title="Add a round table"
          >
            <Plus size={12} strokeWidth={1.7} />
            New Table
          </button>
          <button
            onClick={handleAutoAssignAll}
            disabled={!canAutoAssign || oneClickBusy}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-4 py-1.5 text-[12.5px] font-medium shadow-sm transition",
              canAutoAssign && !oneClickBusy
                ? "bg-gradient-to-br from-gold to-gold/85 text-ivory hover:opacity-90"
                : "cursor-not-allowed bg-gold/40 text-ivory",
            )}
            title={
              oneClickBusy
                ? "Claude is arranging your guests…"
                : canAutoAssign
                  ? "Assign all guests, classify zones, and arrange tables in one click"
                  : tables.length === 0
                    ? "Add a table first"
                    : "Add guests to your roster first"
            }
          >
            <Sparkles
              size={13}
              strokeWidth={1.8}
              className={oneClickBusy ? "animate-pulse" : ""}
            />
            {oneClickBusy ? "Arranging…" : "Auto-assign all"}
          </button>
        </div>
      </header>

      {/* ── Banner (toast) ── */}
      {banner && (
        <div className="flex items-center gap-2 rounded-md border border-sage/40 bg-sage-pale/35 px-4 py-2 text-[12px] text-ink">
          <RefreshCw size={12} strokeWidth={1.7} className="text-sage" />
          <span className="flex-1">{banner}</span>
          <button
            onClick={() => setBanner("")}
            className="text-[11px] text-ink-faint hover:text-ink"
          >
            dismiss
          </button>
        </div>
      )}

      {/* ── Three-panel body ── */}
      <div className="flex min-h-0 flex-1 gap-3">
        {/* LEFT: Guest pool */}
        <div className="flex w-[300px] flex-shrink-0 flex-col overflow-hidden rounded-lg border border-border bg-white">
          <GuestPoolPanel guests={eventGuests} eventId={activeEventId} />
        </div>

        {/* CENTER: Venue canvas */}
        <div className="relative min-w-0 flex-1">
          <SeatingCanvas
            guests={eventGuests}
            eventId={activeEventId}
          />
          <DiningIntelligenceBadge eventId={activeEventId} />
          {tables.length === 0 && (
            <EmptyCanvasHint onAddTable={() => addTable("round")} />
          )}
        </div>

        {/* RIGHT: Table inspector */}
        <div className="flex w-[340px] flex-shrink-0 flex-col overflow-hidden rounded-lg border border-border bg-white">
          <TableInspectorPanel
            tableId={selectedTableId}
            guests={eventGuests}
            eventId={activeEventId}
          />
        </div>
      </div>
    </div>
  );
}

function StatPill({
  label,
  value,
  tone,
}: {
  label: string;
  value: string | number;
  tone?: "green" | "amber" | "red";
}) {
  const toneClass =
    tone === "green"
      ? "text-sage"
      : tone === "amber"
        ? "text-gold"
        : tone === "red"
          ? "text-rose"
          : "text-ink";
  return (
    <div className="flex items-center gap-1.5 rounded-md border border-border bg-ivory/40 px-2.5 py-1">
      <span className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-faint">
        {label}
      </span>
      <span className={cn("font-serif text-[13px]", toneClass)}>{value}</span>
    </div>
  );
}

function EmptyCanvasHint({ onAddTable }: { onAddTable: () => void }) {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <div className="pointer-events-auto max-w-sm rounded-lg border border-dashed border-gold/40 bg-white/95 p-6 text-center shadow-lg backdrop-blur">
        <Sparkles size={20} strokeWidth={1.6} className="mx-auto mb-2 text-gold" />
        <div className="mb-1 font-serif text-[16px] text-ink">
          Start with a table
        </div>
        <div className="mb-4 text-[12px] leading-relaxed text-ink-muted">
          Add at least one table, then click <strong>✦ Auto-assign all</strong>{" "}
          to let Claude build a complete zone-colored arrangement for you.
        </div>
        <button
          onClick={onAddTable}
          className="inline-flex items-center gap-1.5 rounded-md bg-ink px-3 py-1.5 text-[12px] text-ivory hover:opacity-90"
        >
          <Plus size={12} strokeWidth={1.7} />
          Add first table
        </button>
      </div>
    </div>
  );
}
