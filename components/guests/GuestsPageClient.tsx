"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useRsvpStore, rsvpKey, type RsvpStatus } from "@/stores/rsvp-store";
import { TimelineNav } from "./TimelineNav";
import { SummaryDashboard } from "./SummaryDashboard";
import { EventDetailPanel } from "./EventDetailPanel";
import { HouseholdDrawer } from "./HouseholdDrawer";

export function GuestsPageClient() {
  const events = useRsvpStore((s) => s.events);
  const households = useRsvpStore((s) => s.households);
  const guests = useRsvpStore((s) => s.guests);
  const rsvps = useRsvpStore((s) => s.rsvps);
  const householdNotes = useRsvpStore((s) => s.householdNotes);

  const cycleRsvp = useRsvpStore((s) => s.cycleRsvp);
  const bulkDecline = useRsvpStore((s) => s.bulkMarkPendingDeclined);
  const setHouseholdAllEvents = useRsvpStore((s) => s.setHouseholdStatusAllEvents);
  const setHouseholdNotes = useRsvpStore((s) => s.setHouseholdNotes);

  // Avoid hydration mismatch: persisted store rehydrates on client.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [openHouseholdId, setOpenHouseholdId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Precompute eventStats lightweight map for TimelineNav.
  const eventStatsMap = useMemo(() => {
    const map: Record<string, { confirmed: number; invited: number }> = {};
    for (const ev of events) {
      let confirmed = 0;
      let invited = 0;
      for (const g of guests) {
        const s = rsvps[rsvpKey(g.id, ev.id)];
        if (s === undefined) continue;
        invited++;
        if (s === "confirmed") confirmed++;
      }
      map[ev.id] = { confirmed, invited };
    }
    return map;
  }, [events, guests, rsvps]);

  const selectedEvent = useMemo(
    () => events.find((e) => e.id === selectedEventId) ?? null,
    [events, selectedEventId],
  );

  // Keyboard navigation: ← / → between events when an event is selected
  useEffect(() => {
    if (!selectedEvent) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLElement) {
        const tag = e.target.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      }
      const sorted = [...events].sort((a, b) => a.sortOrder - b.sortOrder);
      const idx = sorted.findIndex((ev) => ev.id === selectedEvent.id);
      if (e.key === "ArrowLeft" && idx > 0) {
        setSelectedEventId(sorted[idx - 1].id);
      } else if (e.key === "ArrowRight" && idx < sorted.length - 1) {
        setSelectedEventId(sorted[idx + 1].id);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedEvent, events]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    const id = setTimeout(() => setToast(null), 2400);
    return () => clearTimeout(id);
  }, []);

  const onCycleRsvp = useCallback(
    (guestId: string, eventId: string) => {
      cycleRsvp(guestId, eventId);
      const g = guests.find((x) => x.id === guestId);
      if (g) showToast(`Updated ${g.firstName}'s status`);
    },
    [cycleRsvp, guests, showToast],
  );

  const onBulkDecline = useCallback(
    (eventId: string) => {
      const ev = events.find((e) => e.id === eventId);
      const count = Object.entries(rsvps).filter(
        ([k, v]) => k.endsWith(`|${eventId}`) && v === "pending",
      ).length;
      if (count === 0) return;
      const ok = window.confirm(
        `Mark all ${count} pending guests as declined for ${ev?.name}? This can be reversed by editing individually.`,
      );
      if (ok) {
        bulkDecline(eventId);
        showToast(`${count} pending guests marked declined`);
      }
    },
    [bulkDecline, events, rsvps, showToast],
  );

  const onExportCaterer = useCallback(
    (eventId: string) => {
      const ev = events.find((e) => e.id === eventId);
      if (!ev) return;
      const rows: string[] = [
        ["Guest", "Household", "Side", "Dietary", "Relationship"].join(","),
      ];
      for (const g of guests) {
        const s = rsvps[rsvpKey(g.id, eventId)];
        if (s !== "confirmed") continue;
        const hh = households.find((h) => h.id === g.householdId);
        const row = [
          `"${g.firstName} ${g.lastName}"`,
          `"${hh?.name ?? ""}"`,
          g.side,
          `"${g.dietary.join(" ") || "Unspecified"}"`,
          `"${g.relationship ?? ""}"`,
        ].join(",");
        rows.push(row);
      }
      const blob = new Blob([rows.join("\n")], {
        type: "text/csv;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${ev.name.toLowerCase().replace(/\s+/g, "-")}-caterer.csv`;
      a.click();
      URL.revokeObjectURL(url);
      showToast(`Exported caterer CSV for ${ev.name}`);
    },
    [events, guests, households, rsvps, showToast],
  );

  const onSendReminders = useCallback(
    (eventId: string) => {
      const ev = events.find((e) => e.id === eventId);
      if (!ev) return;
      const count = Object.entries(rsvps).filter(
        ([k, v]) => k.endsWith(`|${eventId}`) && v === "pending",
      ).length;
      showToast(`Reminder preview: ${count} guests will be notified for ${ev.name}.`);
    },
    [events, rsvps, showToast],
  );

  const openHousehold = useMemo(
    () =>
      openHouseholdId
        ? households.find((h) => h.id === openHouseholdId) ?? null
        : null,
    [households, openHouseholdId],
  );
  const openHouseholdGuests = useMemo(
    () => guests.filter((g) => g.householdId === openHouseholdId),
    [guests, openHouseholdId],
  );

  if (!mounted) {
    return (
      <div className="editorial-padding">
        <div className="h-[60vh] animate-pulse rounded-2xl bg-ivory-warm" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivory">
      <TimelineNav
        events={events}
        selectedEventId={selectedEventId}
        eventStats={eventStatsMap}
        onSelectEvent={setSelectedEventId}
      />

      <AnimatePresence mode="wait">
        {selectedEvent ? (
          <motion.div
            key={`event-${selectedEvent.id}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <EventDetailPanel
              event={selectedEvent}
              guests={guests}
              households={households}
              rsvps={rsvps}
              onCycleRsvp={onCycleRsvp}
              onBulkDecline={onBulkDecline}
              onOpenHousehold={setOpenHouseholdId}
              onExportCaterer={onExportCaterer}
              onSendReminders={onSendReminders}
            />
          </motion.div>
        ) : (
          <motion.div
            key="overview"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <SummaryDashboard
              events={events}
              guests={guests}
              rsvps={rsvps}
              onSelectEvent={setSelectedEventId}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <HouseholdDrawer
        household={openHousehold}
        guests={openHouseholdGuests}
        events={events}
        rsvps={rsvps}
        notes={openHouseholdId ? (householdNotes[openHouseholdId] ?? "") : ""}
        onClose={() => setOpenHouseholdId(null)}
        onCycleRsvp={onCycleRsvp}
        onSetHouseholdAllEvents={(status: RsvpStatus) => {
          if (openHouseholdId) {
            setHouseholdAllEvents(openHouseholdId, status);
            const hh = households.find((h) => h.id === openHouseholdId);
            showToast(`${hh?.name ?? "Household"} → all events ${status}`);
          }
        }}
        onSetNotes={(notes) => {
          if (openHouseholdId) setHouseholdNotes(openHouseholdId, notes);
        }}
      />

      <AnimatePresence>
        {toast && (
          <motion.div
            key="toast"
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full border border-border bg-ink px-4 py-2 text-[12px] text-ivory shadow-[0_6px_24px_rgba(26,26,26,0.2)]"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
