"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { RadialProgress } from "./RadialProgress";
import {
  getEventStats,
  rsvpKey,
  type RsvpEvent,
  type RsvpGuest,
  type RsvpStatus,
} from "@/stores/rsvp-store";
import { AlertCircle } from "lucide-react";

const MONTH_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function fmtFullDate(iso: string) {
  const d = new Date(iso + "T00:00:00");
  return `${MONTH_SHORT[d.getMonth()]} ${d.getDate()}`;
}

interface SummaryDashboardProps {
  events: RsvpEvent[];
  guests: RsvpGuest[];
  rsvps: Record<string, RsvpStatus>;
  onSelectEvent: (id: string) => void;
}

export function SummaryDashboard({
  events,
  guests,
  rsvps,
  onSelectEvent,
}: SummaryDashboardProps) {
  // Aggregate totals across all events
  let totalInvited = 0;
  let totalConfirmed = 0;
  let totalPending = 0;
  let totalDeclined = 0;
  const uniqueGuestIds = new Set<string>();

  const perEvent = events.map((ev) => {
    const stats = getEventStats(ev.id, guests, rsvps);
    totalInvited += stats.invited;
    totalConfirmed += stats.confirmed;
    totalPending += stats.pending;
    totalDeclined += stats.declined;
    for (const g of guests) {
      if (rsvps[rsvpKey(g.id, ev.id)] !== undefined) uniqueGuestIds.add(g.id);
    }
    return { ev, stats };
  });

  const overallPct = totalInvited > 0 ? totalConfirmed / totalInvited : 0;

  // Events with the lowest confirmation rate (flagged)
  const flagged = [...perEvent]
    .filter((p) => p.stats.invited > 0)
    .sort(
      (a, b) =>
        a.stats.confirmed / Math.max(a.stats.invited, 1) -
        b.stats.confirmed / Math.max(b.stats.invited, 1),
    )
    .slice(0, 2);

  return (
    <div className="editorial-padding space-y-10">
      {/* Hero: overall stats */}
      <section>
        <p
          className="m-0 text-[10px] font-medium uppercase tracking-[0.22em] text-saffron"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          RSVP Overview
        </p>
        <h1
          className="m-0 mt-2 leading-[1.05] text-ink"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 48,
            fontWeight: 400,
            letterSpacing: "-0.015em",
          }}
        >
          The Guest List,{" "}
          <span className="italic text-gold">event by event.</span>
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-muted">
          Nine events across five days — {uniqueGuestIds.size} guests,{" "}
          {totalInvited} invitations, {totalConfirmed} confirmed.
        </p>

        <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-4">
          <HeroStat
            label="Confirmed"
            value={totalConfirmed}
            total={totalInvited}
            tone="sage"
          />
          <HeroStat
            label="Pending"
            value={totalPending}
            total={totalInvited}
            tone="gold"
          />
          <HeroStat
            label="Declined"
            value={totalDeclined}
            total={totalInvited}
            tone="rose"
          />
          <HeroStat
            label="Overall"
            value={Math.round(overallPct * 100)}
            suffix="%"
            total={100}
            tone="ink"
          />
        </div>
      </section>

      {/* Flagged events */}
      {flagged.length > 0 && flagged[0].stats.invited > 0 && (
        <section className="rounded-lg border border-rose-light/50 bg-rose-pale/40 px-5 py-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose" />
            <div>
              <p
                className="m-0 text-[10px] font-medium uppercase tracking-[0.18em] text-rose"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Needs attention
              </p>
              <p className="mt-1 text-sm text-ink-soft">
                Lowest confirmation rates:{" "}
                {flagged.map((f, i) => (
                  <span key={f.ev.id}>
                    <button
                      onClick={() => onSelectEvent(f.ev.id)}
                      className="font-medium underline decoration-rose/40 underline-offset-2 hover:decoration-rose"
                    >
                      {f.ev.name}
                    </button>{" "}
                    <span className="text-ink-muted">
                      ({f.stats.confirmed}/{f.stats.invited})
                    </span>
                    {i < flagged.length - 1 && ", "}
                  </span>
                ))}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Event cards grid */}
      <section>
        <p
          className="m-0 text-[10px] font-medium uppercase tracking-[0.22em] text-saffron"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Each Event
        </p>
        <h3
          className="m-0 mt-1 leading-tight text-ink"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 28,
            fontWeight: 500,
          }}
        >
          Nine gatherings, one wedding.
        </h3>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {perEvent.map(({ ev, stats }, idx) => (
            <motion.button
              key={ev.id}
              onClick={() => onSelectEvent(ev.id)}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04, duration: 0.4 }}
              whileHover={{ y: -3 }}
              className="group relative overflow-hidden rounded-xl border border-border bg-white p-5 text-left transition-shadow hover:shadow-[0_6px_24px_rgba(184,134,11,0.1)]"
            >
              <EventCardContent ev={ev} stats={stats} />
            </motion.button>
          ))}
        </div>
      </section>
    </div>
  );
}

function HeroStat({
  label,
  value,
  total,
  tone,
  suffix,
}: {
  label: string;
  value: number;
  total: number;
  tone: "sage" | "gold" | "rose" | "ink";
  suffix?: string;
}) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  const toneColor = {
    sage: "text-sage",
    gold: "text-saffron",
    rose: "text-rose",
    ink: "text-gold",
  }[tone];
  return (
    <div className="border-l border-border/60 pl-4">
      <p
        className="m-0 text-[10px] uppercase tracking-[0.2em] text-ink-muted"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {label}
      </p>
      <p
        className={cn("m-0 mt-1 leading-none", toneColor)}
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 40,
          fontWeight: 400,
        }}
      >
        {value}
        {suffix}
      </p>
      {!suffix && (
        <p className="mt-1 text-[11px] text-ink-faint">{pct}% of invites</p>
      )}
    </div>
  );
}

function EventCardContent({
  ev,
  stats,
}: {
  ev: RsvpEvent;
  stats: ReturnType<typeof getEventStats>;
}) {
  const pct = stats.invited > 0 ? stats.confirmed / stats.invited : 0;
  const color =
    pct >= 0.75
      ? "var(--color-sage)"
      : pct >= 0.5
        ? "var(--color-saffron)"
        : "var(--color-rose)";
  const diet = stats.dietary;
  const dietLine =
    `${diet.Veg} Veg · ${diet.Jain} Jain · ${diet["Non-veg"]} Non-veg` +
    (diet.Unspecified > 0 ? ` · ${diet.Unspecified} Unspecified` : "");

  return (
    <>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p
            className="m-0 text-[10px] uppercase tracking-[0.18em] text-saffron"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {fmtFullDate(ev.date)}
            {ev.time && ` · ${ev.time}`}
          </p>
          <h4
            className="m-0 mt-1 leading-tight text-ink"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 24,
              fontWeight: 500,
            }}
          >
            {ev.name}
          </h4>
          {ev.venue && (
            <p className="mt-1 truncate text-xs text-ink-muted">{ev.venue}</p>
          )}
        </div>
        <RadialProgress
          value={stats.confirmed}
          total={stats.invited}
          size={56}
          stroke={4}
          color={color}
        >
          <span
            className="text-[11px] font-semibold text-ink"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {stats.invited > 0 ? Math.round(pct * 100) : 0}%
          </span>
        </RadialProgress>
      </div>

      <div className="mt-5 flex items-baseline gap-2">
        <span
          className="text-ink"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 28,
            fontWeight: 500,
            lineHeight: 1,
          }}
        >
          {stats.confirmed}
        </span>
        <span className="text-sm text-ink-muted">of {stats.invited} confirmed</span>
      </div>

      <div className="mt-4 flex items-center gap-3 text-[11px] text-ink-muted">
        <StatusDot tone="sage" />
        <span>{stats.confirmed}</span>
        <StatusDot tone="gold" />
        <span>{stats.pending}</span>
        <StatusDot tone="rose" />
        <span>{stats.declined}</span>
      </div>

      <p className="mt-3 text-[11px] leading-relaxed text-ink-faint">
        {dietLine}
      </p>
    </>
  );
}

function StatusDot({ tone }: { tone: "sage" | "gold" | "rose" }) {
  const bg = {
    sage: "bg-sage",
    gold: "bg-saffron",
    rose: "bg-rose-light",
  }[tone];
  return <span className={cn("inline-block h-2 w-2 rounded-full", bg)} />;
}
