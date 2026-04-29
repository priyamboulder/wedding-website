"use client";

import Link from "next/link";
import { useRsvpStore } from "@/stores/rsvp-store";

export function GuestsSummaryCard() {
  const guests = useRsvpStore((s) => s.guests);
  const events = useRsvpStore((s) => s.events);
  const rsvps = useRsvpStore((s) => s.rsvps);

  const total = guests.length;
  const confirmed = Object.values(rsvps).filter((s) => s === "confirmed").length;
  const pending = Object.values(rsvps).filter((s) => s === "pending").length;
  const eventCount = events.length;
  const pct = total > 0 ? Math.round((confirmed / (total * Math.max(eventCount, 1))) * 100) : 0;

  return (
    <div className="playcard playcard-cream playcard-tilt-r flex flex-col" style={{ marginTop: 10 }}>
      <div className="flex items-baseline justify-between border-b px-4 py-3" style={{ borderColor: 'rgba(212,168,83,0.2)' }}>
        <span className="playcard-label">Guests</span>
        <Link
          href="/guests"
          className="playcard-body transition-colors hover:text-pink-500"
          style={{ letterSpacing: '0.12em', textTransform: 'uppercase', fontSize: 10 }}
        >
          Manage →
        </Link>
      </div>

      <div className="grid grid-cols-3 divide-x" style={{ borderColor: 'rgba(212,168,83,0.2)' }}>
        <Stat label="Total guests" value={`${total}`} />
        <Stat label="Confirmed" value={`${confirmed}`} />
        <Stat label="Pending" value={`${pending}`} />
      </div>

      <div className="px-4 py-3" style={{ borderTop: '1px solid rgba(212,168,83,0.2)' }}>
        <div className="flex items-center justify-between gap-3">
          <span className="playcard-body">
            {eventCount} {eventCount === 1 ? "event" : "events"} · {pct}% confirmed
          </span>
          <Link
            href="/guests"
            className="playcard-body transition-colors hover:text-pink-500"
            style={{ fontSize: 11 }}
          >
            Seating chart →
          </Link>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-4 py-3">
      <p className="playcard-label" style={{ fontSize: 9, letterSpacing: '0.14em' }}>{label}</p>
      <p className="mt-1 playcard-stat" style={{ fontSize: 28 }}>{value}</p>
    </div>
  );
}
