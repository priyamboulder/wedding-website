"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusIndicator } from "./StatusIndicator";
import {
  rsvpKey,
  type RsvpEvent,
  type RsvpGuest,
  type RsvpHousehold,
  type RsvpStatus,
} from "@/stores/rsvp-store";

interface HouseholdDrawerProps {
  household: RsvpHousehold | null;
  guests: RsvpGuest[]; // members of this household only
  events: RsvpEvent[];
  rsvps: Record<string, RsvpStatus>;
  notes: string;
  onClose: () => void;
  onCycleRsvp: (guestId: string, eventId: string) => void;
  onSetHouseholdAllEvents: (status: RsvpStatus) => void;
  onSetNotes: (notes: string) => void;
}

export function HouseholdDrawer({
  household,
  guests,
  events,
  rsvps,
  notes,
  onClose,
  onCycleRsvp,
  onSetHouseholdAllEvents,
  onSetNotes,
}: HouseholdDrawerProps) {
  const [localNotes, setLocalNotes] = useState(notes);

  useEffect(() => {
    setLocalNotes(notes);
  }, [notes, household?.id]);

  useEffect(() => {
    if (!household) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [household, onClose]);

  return (
    <AnimatePresence>
      {household && (
        <>
          <motion.div
            key="scrim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-30 bg-ink/20 backdrop-blur-[2px]"
          />
          <motion.aside
            key="drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.32, ease: [0.22, 0.61, 0.36, 1] }}
            className="fixed inset-y-0 right-0 z-40 flex w-full max-w-[520px] flex-col border-l border-border bg-ivory shadow-[-8px_0_32px_rgba(26,26,26,0.08)]"
          >
            <DrawerHeader household={household} onClose={onClose} />
            <div className="flex-1 overflow-y-auto">
              <DrawerBody
                household={household}
                guests={guests}
                events={events}
                rsvps={rsvps}
                localNotes={localNotes}
                setLocalNotes={(v) => {
                  setLocalNotes(v);
                  onSetNotes(v);
                }}
                onCycleRsvp={onCycleRsvp}
                onSetHouseholdAllEvents={onSetHouseholdAllEvents}
              />
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function DrawerHeader({
  household,
  onClose,
}: {
  household: RsvpHousehold;
  onClose: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border/60 px-6 py-5">
      <div className="min-w-0 flex-1">
        <p
          className="m-0 text-[10px] uppercase tracking-[0.22em] text-saffron"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {household.side === "bride" ? "Bride's Side" : "Groom's Side"}
          {household.city ? ` · ${household.city}` : ""}
        </p>
        <h2
          className="m-0 mt-1 leading-tight text-ink"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 28,
            fontWeight: 500,
          }}
        >
          {household.name}
        </h2>
      </div>
      <button
        onClick={onClose}
        className="rounded-full p-2 text-ink-muted transition-colors hover:bg-ivory-deep hover:text-ink"
        aria-label="Close drawer"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

function DrawerBody({
  household,
  guests,
  events,
  rsvps,
  localNotes,
  setLocalNotes,
  onCycleRsvp,
  onSetHouseholdAllEvents,
}: {
  household: RsvpHousehold;
  guests: RsvpGuest[];
  events: RsvpEvent[];
  rsvps: Record<string, RsvpStatus>;
  localNotes: string;
  setLocalNotes: (v: string) => void;
  onCycleRsvp: (guestId: string, eventId: string) => void;
  onSetHouseholdAllEvents: (status: RsvpStatus) => void;
}) {
  const sortedEvents = [...events].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="space-y-7 px-6 py-6">
      {/* Members */}
      <section>
        <p
          className="m-0 text-[10px] uppercase tracking-[0.18em] text-ink-muted"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Members ({guests.length})
        </p>
        <ul className="mt-2 space-y-1">
          {guests.map((g) => (
            <li
              key={g.id}
              className="flex items-center justify-between text-sm text-ink"
            >
              <span>
                {g.honorific ? `${g.honorific} ` : ""}
                {g.firstName} {g.lastName}
                {g.relationship && (
                  <span className="ml-2 text-[11px] text-ink-muted">
                    — {g.relationship}
                  </span>
                )}
              </span>
              {g.dietary.length > 0 && (
                <span
                  className="text-[10px] uppercase tracking-[0.14em] text-ink-faint"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {g.dietary.join(" · ")}
                </span>
              )}
            </li>
          ))}
        </ul>
      </section>

      {/* Mini RSVP matrix */}
      <section>
        <div className="flex items-baseline justify-between gap-4">
          <p
            className="m-0 text-[10px] uppercase tracking-[0.18em] text-ink-muted"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            RSVP Across All Events
          </p>
          <span className="text-[10px] text-ink-faint">
            Tap a dot to cycle status
          </span>
        </div>

        <div className="mt-3 overflow-x-auto rounded-xl border border-border bg-white">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr>
                <th
                  className="sticky left-0 z-[1] bg-white px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-ink-muted"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  Guest
                </th>
                {sortedEvents.map((ev) => (
                  <th
                    key={ev.id}
                    className="px-1.5 py-2 text-center text-[10px] font-normal uppercase tracking-[0.1em] text-ink-muted"
                    style={{ fontFamily: "var(--font-mono)" }}
                    title={ev.name}
                  >
                    {ev.name.slice(0, 3)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {guests.map((g) => (
                <tr key={g.id} className="border-t border-border/50">
                  <td
                    className={cn(
                      "sticky left-0 z-[1] bg-white px-3 py-2 text-[12px] text-ink",
                      "whitespace-nowrap",
                    )}
                  >
                    {g.firstName}
                  </td>
                  {sortedEvents.map((ev) => {
                    const status = rsvps[rsvpKey(g.id, ev.id)];
                    return (
                      <td
                        key={ev.id}
                        className="px-1 py-1.5 text-center align-middle"
                      >
                        <StatusIndicator
                          status={status}
                          onClick={() => onCycleRsvp(g.id, ev.id)}
                          size="sm"
                          ariaLabel={`${g.firstName} — ${ev.name}`}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Bulk actions */}
      <section>
        <p
          className="m-0 text-[10px] uppercase tracking-[0.18em] text-ink-muted"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Quick Actions
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          <BulkBtn
            tone="sage"
            label="Confirm all events"
            onClick={() => onSetHouseholdAllEvents("confirmed")}
          />
          <BulkBtn
            tone="gold"
            label="Mark all pending"
            onClick={() => onSetHouseholdAllEvents("pending")}
          />
          <BulkBtn
            tone="rose"
            label="Decline all events"
            onClick={() => onSetHouseholdAllEvents("declined")}
          />
        </div>
      </section>

      {/* Notes */}
      <section>
        <label
          htmlFor="hh-notes"
          className="block text-[10px] uppercase tracking-[0.18em] text-ink-muted"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Household Notes
        </label>
        <textarea
          id="hh-notes"
          value={localNotes}
          onChange={(e) => setLocalNotes(e.target.value)}
          rows={3}
          placeholder="Dietary allergies, travel plans, VIP flags…"
          className="mt-2 w-full resize-none rounded-xl border border-border bg-white px-3 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
        />
      </section>
    </div>
  );
}

function BulkBtn({
  tone,
  label,
  onClick,
}: {
  tone: "sage" | "gold" | "rose";
  label: string;
  onClick: () => void;
}) {
  const bg = {
    sage: "hover:bg-sage-pale hover:border-sage",
    gold: "hover:bg-saffron-pale hover:border-saffron",
    rose: "hover:bg-rose-pale hover:border-rose",
  }[tone];
  const color = {
    sage: "hover:text-sage",
    gold: "hover:text-saffron",
    rose: "hover:text-rose",
  }[tone];
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-3.5 py-1.5 text-[11px] uppercase tracking-[0.14em] text-ink-muted transition-colors",
        bg,
        color,
      )}
      style={{ fontFamily: "var(--font-mono)" }}
    >
      <CheckCircle2 className="h-3 w-3" />
      {label}
    </button>
  );
}
