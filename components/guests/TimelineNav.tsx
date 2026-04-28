"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { RadialProgress } from "./RadialProgress";
import type { RsvpEvent } from "@/stores/rsvp-store";

interface TimelineNavProps {
  events: RsvpEvent[];
  selectedEventId: string | null;
  eventStats: Record<string, { confirmed: number; invited: number }>;
  onSelectEvent: (id: string | null) => void;
}

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

function fmtDate(iso: string) {
  const d = new Date(iso + "T00:00:00");
  return { day: d.getDate(), month: MONTH_SHORT[d.getMonth()] };
}

export function TimelineNav({
  events,
  selectedEventId,
  eventStats,
  onSelectEvent,
}: TimelineNavProps) {
  // Group events by date for visual day grouping
  const byDate = events.reduce<Record<string, RsvpEvent[]>>((acc, ev) => {
    (acc[ev.date] ||= []).push(ev);
    return acc;
  }, {});
  const dateOrder = Object.keys(byDate).sort();

  return (
    <div className="sticky top-0 z-20 border-b border-border/70 bg-ivory/85 backdrop-blur-md">
      <div className="editorial-padding !py-5">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p
              className="m-0 text-[10px] font-medium uppercase tracking-[0.22em] text-saffron"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              The Five Days
            </p>
            <h2
              className="m-0 mt-1 leading-tight text-ink"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 28,
                fontWeight: 500,
              }}
            >
              Wedding Timeline
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onSelectEvent(null)}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-[11px] uppercase tracking-[0.18em] transition-colors",
              selectedEventId === null
                ? "bg-ink text-ivory"
                : "border border-border bg-white text-ink-muted hover:text-ink",
            )}
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Overview
          </button>
        </div>

        <div className="mt-5 overflow-x-auto pb-1">
          <div className="flex min-w-max items-start gap-0">
            {dateOrder.map((date, dayIdx) => {
              const dayEvents = byDate[date];
              const { day, month } = fmtDate(date);
              return (
                <div
                  key={date}
                  className={cn(
                    "flex items-start",
                    dayIdx > 0 && "ml-1",
                  )}
                >
                  {/* Day column */}
                  <div className="flex flex-col items-center">
                    <div
                      className="mb-2 flex flex-col items-center text-center"
                      style={{ minWidth: 54 }}
                    >
                      <span
                        className="text-[10px] uppercase tracking-[0.18em] text-ink-faint"
                        style={{ fontFamily: "var(--font-mono)" }}
                      >
                        {month}
                      </span>
                      <span
                        className="leading-none text-ink"
                        style={{
                          fontFamily: "var(--font-display)",
                          fontSize: 28,
                          fontWeight: 500,
                        }}
                      >
                        {day}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {dayEvents.map((ev, i) => {
                        const stats = eventStats[ev.id] || {
                          confirmed: 0,
                          invited: 1,
                        };
                        const active = selectedEventId === ev.id;
                        return (
                          <div
                            key={ev.id}
                            className="flex items-center gap-1"
                          >
                            <EventNode
                              ev={ev}
                              confirmed={stats.confirmed}
                              invited={stats.invited}
                              active={active}
                              onClick={() => onSelectEvent(ev.id)}
                            />
                            {i < dayEvents.length - 1 && (
                              <span className="h-px w-4 bg-border" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  {/* Between-day connector */}
                  {dayIdx < dateOrder.length - 1 && (
                    <div className="mx-2 flex h-full flex-col items-center pt-[52px]">
                      <span className="h-px w-10 bg-gold-pale" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function EventNode({
  ev,
  confirmed,
  invited,
  active,
  onClick,
}: {
  ev: RsvpEvent;
  confirmed: number;
  invited: number;
  active: boolean;
  onClick: () => void;
}) {
  const pct = invited > 0 ? confirmed / invited : 0;
  const color =
    pct >= 0.75
      ? "var(--color-sage)"
      : pct >= 0.5
        ? "var(--color-saffron)"
        : "var(--color-rose)";

  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.96 }}
      className={cn(
        "group relative flex min-w-[88px] flex-col items-center gap-1.5 rounded-xl px-3 py-2 transition-all",
        active
          ? "bg-white shadow-[0_2px_18px_rgba(184,134,11,0.18)] ring-1 ring-gold-light"
          : "hover:bg-white/70",
      )}
      style={{ fontFamily: "var(--font-sans)" }}
    >
      <RadialProgress
        value={confirmed}
        total={invited}
        size={active ? 42 : 34}
        stroke={active ? 3.5 : 3}
        color={color}
      >
        <span
          className={cn(
            "text-[10px] font-semibold",
            active ? "text-ink" : "text-ink-muted",
          )}
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {invited > 0 ? Math.round(pct * 100) : 0}
        </span>
      </RadialProgress>
      <span
        className={cn(
          "whitespace-nowrap text-[11px] leading-tight",
          active ? "text-ink" : "text-ink-muted group-hover:text-ink",
        )}
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 500,
          letterSpacing: "0.01em",
        }}
      >
        {ev.name}
      </span>
      {active && (
        <motion.span
          layoutId="timeline-underline"
          className="absolute -bottom-1 h-[2px] w-8 rounded-full bg-gold"
        />
      )}
    </motion.button>
  );
}
