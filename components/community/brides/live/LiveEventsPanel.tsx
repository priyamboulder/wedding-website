"use client";

// ── Live events panel ───────────────────────────────────────────────────────
// Main "Live" sub-tab. Three sections stacked top to bottom: live now
// (prominent), upcoming (RSVP cards), and past (recap links). Admin
// creation is out of scope for v1 — events are seeded.

import { useEffect, useMemo, useState } from "react";
import { Radio, Sparkles } from "lucide-react";
import type { LiveEventType } from "@/types/community";
import { LIVE_EVENT_TYPES } from "@/types/community";
import { useCommunityLiveEventsStore } from "@/stores/community-live-events-store";
import { LiveEventCard } from "./LiveEventCard";

export function LiveEventsPanel() {
  const ensureSeeded = useCommunityLiveEventsStore((s) => s.ensureSeeded);
  useEffect(() => {
    ensureSeeded();
  }, [ensureSeeded]);

  const events = useCommunityLiveEventsStore((s) => s.events);
  const guests = useCommunityLiveEventsStore((s) => s.guests);

  const guestsById = useMemo(() => {
    const map = new Map<string, (typeof guests)[number]>();
    for (const g of guests) map.set(g.id, g);
    return map;
  }, [guests]);

  const [typeFilter, setTypeFilter] = useState<LiveEventType | "">("");

  const applyTypeFilter = (list: typeof events) =>
    typeFilter ? list.filter((e) => e.event_type === typeFilter) : list;

  const { live, upcoming, past } = useMemo(() => {
    const liveList = events.filter((e) => e.status === "live");
    const upcomingList = events
      .filter((e) => e.status === "upcoming")
      .sort(
        (a, b) =>
          new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime(),
      );
    const pastList = events
      .filter((e) => e.status === "ended" || e.status === "cancelled")
      .sort(
        (a, b) =>
          new Date(b.starts_at).getTime() - new Date(a.starts_at).getTime(),
      );
    return {
      live: applyTypeFilter(liveList),
      upcoming: applyTypeFilter(upcomingList),
      past: applyTypeFilter(pastList),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events, typeFilter]);

  return (
    <div className="px-6 py-8 md:px-10">
      <div className="mx-auto max-w-5xl space-y-10">
        <Header />

        <TypeFilter value={typeFilter} onChange={setTypeFilter} />

        {/* Live now */}
        {live.length > 0 && (
          <section>
            <p
              className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-rose"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose/70" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-rose" />
              </span>
              — live right now —
            </p>
            <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-2">
              {live.map((e) => (
                <LiveEventCard
                  key={e.id}
                  event={e}
                  guest={guestsById.get(e.guest_id)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Upcoming */}
        <section>
          <p
            className="font-mono text-[10px] uppercase tracking-[0.22em] text-gold"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            — coming up —
          </p>
          {upcoming.length === 0 ? (
            <EmptyUpcoming />
          ) : (
            <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2">
              {upcoming.map((e) => (
                <LiveEventCard
                  key={e.id}
                  event={e}
                  guest={guestsById.get(e.guest_id)}
                />
              ))}
            </div>
          )}
        </section>

        {/* Past */}
        {past.length > 0 && (
          <section>
            <p
              className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              — past events —
            </p>
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              {past.map((e) => (
                <LiveEventCard
                  key={e.id}
                  event={e}
                  guest={guestsById.get(e.guest_id)}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

// ── Header ──────────────────────────────────────────────────────────────────

function Header() {
  return (
    <section className="rounded-2xl border border-gold/20 bg-gradient-to-br from-ivory-warm/40 via-white to-ivory-warm/20 px-6 py-6 md:px-8 md:py-7">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose/10 text-rose">
          <Radio size={18} strokeWidth={1.6} />
        </div>
        <div className="flex-1">
          <p
            className="font-mono text-[10px] uppercase tracking-[0.22em] text-gold"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            — live events —
          </p>
          <h2 className="mt-1.5 font-serif text-[26px] font-medium leading-[1.15] tracking-[-0.005em] text-ink md:text-[30px]">
            conversations with the people shaping weddings right now.
          </h2>
          <p className="mt-2 max-w-[520px] text-[14px] leading-[1.65] text-ink-muted">
            planners, designers, photographers, makeup artists — dropping in
            for a session, answering your questions, sharing what they know.
            RSVP to get reminded. bring a question.
          </p>
        </div>
      </div>
    </section>
  );
}

// ── Type filter ─────────────────────────────────────────────────────────────

function TypeFilter({
  value,
  onChange,
}: {
  value: LiveEventType | "";
  onChange: (v: LiveEventType | "") => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => onChange("")}
        className={
          value === ""
            ? "rounded-full border border-ink bg-ink px-3 py-1.5 text-[12px] font-medium text-ivory"
            : "rounded-full border border-border bg-white px-3 py-1.5 text-[12px] font-medium text-ink-muted transition-colors hover:border-saffron/40 hover:text-ink"
        }
      >
        all formats
      </button>
      {LIVE_EVENT_TYPES.map((t) => {
        const active = value === t.id;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onChange(active ? "" : t.id)}
            className={
              active
                ? "rounded-full border border-ink bg-ink px-3 py-1.5 text-[12px] font-medium text-ivory"
                : "rounded-full border border-border bg-white px-3 py-1.5 text-[12px] font-medium text-ink-muted transition-colors hover:border-saffron/40 hover:text-ink"
            }
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

// ── Empty state ─────────────────────────────────────────────────────────────

function EmptyUpcoming() {
  return (
    <div className="mt-6 rounded-2xl border border-dashed border-gold/25 bg-ivory-warm/20 px-6 py-12 text-center">
      <Sparkles
        size={20}
        strokeWidth={1.5}
        className="mx-auto text-gold"
      />
      <p className="mt-4 font-serif text-[20px] italic text-ink">
        no live events lined up right now.
      </p>
      <p className="mt-2 text-[13px] text-ink-muted">
        we&apos;ll announce the next conversation here — and notify you if
        you&apos;ve RSVP&apos;d to anything in the past.
      </p>
    </div>
  );
}
