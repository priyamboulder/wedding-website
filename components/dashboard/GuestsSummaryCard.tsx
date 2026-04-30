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
    <div className="flex flex-col border border-border bg-white">
      <div className="flex items-baseline justify-between border-b border-border px-4 py-3">
        <h3
          className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-muted"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Guests
        </h3>
        <Link
          href="/guests"
          className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint transition-colors hover:text-ink"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Manage →
        </Link>
      </div>
      <div className="grid grid-cols-3 divide-x divide-border px-0 py-0">
        <Stat label="Total guests" value={`${total}`} />
        <Stat label="Confirmed RSVPs" value={`${confirmed}`} />
        <Stat label="Pending" value={`${pending}`} />
      </div>
      <div className="border-t border-border px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[11.5px] text-ink-muted">
            {eventCount} {eventCount === 1 ? "event" : "events"} · {pct}% confirmed
          </span>
          <Link
            href="/guests"
            className="text-[11.5px] text-ink-faint transition-colors hover:text-ink"
          >
            View seating chart →
          </Link>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-4 py-3">
      <p
        className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-faint"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {label}
      </p>
      <p className="mt-1 font-serif text-[26px] leading-none text-ink">
        {value}
      </p>
    </div>
  );
}
