"use client";

import { useMemo } from "react";
import { VENUE_PALETTE } from "@/components/venue/ui";
import type { CalendarDay, CalendarStatus } from "@/lib/venue/profile-seed";

type Mode = "editor" | "preview";

const STATUS_ORDER: CalendarStatus[] = ["available", "hold", "booked", "blocked"];

export function AvailabilityCalendar({
  days,
  onChange,
  mode,
}: {
  days: CalendarDay[];
  onChange?: (next: CalendarDay[]) => void;
  mode: Mode;
}) {
  const months = useMemo(() => groupByMonth(days), [days]);

  const cycle = (date: string) => {
    if (!onChange) return;
    onChange(
      days.map((d) => {
        if (d.date !== date) return d;
        const idx = STATUS_ORDER.indexOf(d.status);
        const next = STATUS_ORDER[(idx + 1) % STATUS_ORDER.length];
        return { ...d, status: next };
      })
    );
  };

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {months.map((m) => (
        <MonthBlock key={m.key} month={m} mode={mode} onCycle={cycle} />
      ))}
    </div>
  );
}

type MonthGroup = {
  key: string;
  year: number;
  monthIndex: number;
  label: string;
  days: (CalendarDay | null)[]; // padded with nulls for leading blanks
};

function groupByMonth(days: CalendarDay[]): MonthGroup[] {
  const byKey = new Map<string, CalendarDay[]>();
  for (const d of days) {
    const key = d.date.slice(0, 7);
    const arr = byKey.get(key) ?? [];
    arr.push(d);
    byKey.set(key, arr);
  }
  return Array.from(byKey.entries())
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([key, list]) => {
      const [yearStr, monthStr] = key.split("-");
      const year = Number(yearStr);
      const monthIndex = Number(monthStr) - 1;
      const first = new Date(year, monthIndex, 1);
      const padding = first.getDay();
      const padded: (CalendarDay | null)[] = Array(padding).fill(null);
      padded.push(...list);
      return {
        key,
        year,
        monthIndex,
        label: first.toLocaleString("en-US", { month: "short" }),
        days: padded,
      };
    });
}

function MonthBlock({
  month,
  mode,
  onCycle,
}: {
  month: MonthGroup;
  mode: Mode;
  onCycle: (date: string) => void;
}) {
  return (
    <div
      className="rounded-xl border bg-white p-3.5"
      style={{ borderColor: VENUE_PALETTE.hairline }}
    >
      <div className="mb-2.5 flex items-baseline justify-between">
        <p
          className="text-[15px] text-[#2C2C2C]"
          style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}
        >
          {month.label}
        </p>
        <span className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-[#9E8245]">
          {month.year}
        </span>
      </div>
      <div className="mb-1.5 grid grid-cols-7 gap-1 font-mono text-[9.5px] uppercase tracking-[0.15em] text-[#8a8a8a]">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <span key={`${d}-${i}`} className="text-center">
            {d}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {month.days.map((day, i) => {
          if (!day) {
            return <div key={`empty-${i}`} className="aspect-square" />;
          }
          return (
            <DayCell
              key={day.date}
              day={day}
              mode={mode}
              onClick={() => onCycle(day.date)}
            />
          );
        })}
      </div>
    </div>
  );
}

function statusStyles(status: CalendarStatus): { bg: string; fg: string; label: string } {
  switch (status) {
    case "booked":
      return { bg: VENUE_PALETTE.charcoal, fg: "#FAF8F5", label: "Booked" };
    case "hold":
      return { bg: VENUE_PALETTE.gold, fg: "#FFFFFF", label: "Hold" };
    case "blocked":
      return { bg: "#cfcfcf", fg: "#2C2C2C", label: "Blocked" };
    case "available":
    default:
      return { bg: "#F5EFE3", fg: "#9E8245", label: "Open" };
  }
}

function DayCell({
  day,
  mode,
  onClick,
}: {
  day: CalendarDay;
  mode: Mode;
  onClick: () => void;
}) {
  // In preview mode, collapse booked/hold to a generic "unavailable" look and hide couple names.
  const effectiveStatus: CalendarStatus =
    mode === "preview" && (day.status === "booked" || day.status === "hold")
      ? "booked"
      : day.status;

  const styles = statusStyles(effectiveStatus);
  const num = Number(day.date.slice(8));
  const title =
    mode === "editor"
      ? day.coupleNames
        ? `${day.date} · ${styles.label} · ${day.coupleNames}${day.eventType ? ` — ${day.eventType}` : ""}`
        : `${day.date} · ${styles.label}`
      : `${day.date} · ${effectiveStatus === "available" ? "Available" : "Unavailable"}`;

  const Comp: "button" | "div" = mode === "editor" ? "button" : "div";

  return (
    <Comp
      {...(mode === "editor" ? { onClick, type: "button" as const } : {})}
      title={title}
      className={`relative flex aspect-square items-center justify-center rounded-[4px] font-mono text-[11px] transition-transform ${
        mode === "editor" ? "hover:scale-[1.08]" : ""
      }`}
      style={{
        backgroundColor: styles.bg,
        color: styles.fg,
        fontWeight: 500,
      }}
    >
      {num}
      {mode === "editor" && day.coupleNames && (
        <span
          aria-hidden
          className="absolute -bottom-0.5 right-0.5 h-1 w-1 rounded-full"
          style={{ backgroundColor: "#E67E22" }}
        />
      )}
    </Comp>
  );
}
