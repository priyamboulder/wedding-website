"use client";

// ── Day-Of tab — live coordination ─────────────────────────────────────────
// Shows a per-day live view: vendor check-ins, next-up items, late alerts,
// and a one-tap broadcast for quick timing updates.

import { useEffect, useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, Radio, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCoordinationStore } from "@/stores/coordination-store";
import {
  COORDINATION_ROLE_ICON,
  type CoordinationAssignment,
  type CoordinationVendor,
} from "@/types/coordination";
import {
  formatEventDate,
  formatTime,
  formatTimeRange,
} from "@/lib/coordination/format";

export function CoordinationDayOfTab() {
  const vendors = useCoordinationStore((s) => s.vendors);
  const assignments = useCoordinationStore((s) => s.assignments);
  const sendUpdate = useCoordinationStore((s) => s.sendUpdate);

  const vendorById = useMemo(
    () => new Map(vendors.map((v) => [v.id, v])),
    [vendors],
  );

  // Available days (any date with at least one assignment).
  const availableDays = useMemo(() => {
    const set = new Set<string>();
    assignments.forEach((a) => set.add(a.eventDate));
    return Array.from(set).sort();
  }, [assignments]);

  const todayIso = new Date().toISOString().slice(0, 10);
  const defaultDay = availableDays.includes(todayIso)
    ? todayIso
    : (availableDays[0] ?? todayIso);
  const [selectedDay, setSelectedDay] = useState(defaultDay);

  // Live clock — refresh every minute so late alerts surface naturally.
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(interval);
  }, []);

  const dayAssignments = assignments.filter((a) => a.eventDate === selectedDay);

  const [quickMsg, setQuickMsg] = useState("");

  if (availableDays.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gold/25 bg-gold-pale/10 px-6 py-14 text-center">
        <Radio size={24} strokeWidth={1.2} className="mx-auto text-gold" />
        <h2 className="mt-3 font-serif text-[22px] text-ink">
          No scheduled days yet
        </h2>
        <p className="mt-2 text-[13px] text-ink-muted">
          Once you add assignments with dates, this tab becomes your live
          command center for each wedding day.
        </p>
      </div>
    );
  }

  const isToday = selectedDay === todayIso;
  const nowStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  const checkedIn = dayAssignments
    .filter((a) => a.vendorCheckedInAt)
    .sort((a, b) => a.vendorCheckedInAt!.localeCompare(b.vendorCheckedInAt!));
  const late = dayAssignments.filter((a) => {
    if (!isToday) return false;
    if (!a.callTime) return false;
    if (a.vendorCheckedInAt) return false;
    const [h, m] = a.callTime.split(":").map(Number);
    const callMinutes = h * 60 + m;
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    return nowMinutes > callMinutes + 15;
  });
  const upcoming = dayAssignments
    .filter((a) => {
      if (!a.callTime) return false;
      if (a.vendorCheckedInAt) return false;
      if (!isToday) return true;
      return a.callTime >= nowStr;
    })
    .sort((a, b) => (a.callTime ?? "").localeCompare(b.callTime ?? ""))
    .slice(0, 10);

  return (
    <section className="flex flex-col gap-6">
      <header className="flex items-center gap-3">
        <h2 className="font-serif text-[22px] text-ink">
          {isToday ? (
            <span className="mr-1.5 text-rose">🔴</span>
          ) : null}
          DAY-OF · {formatEventDate(selectedDay)}
        </h2>
      </header>

      {availableDays.length > 1 ? (
        <div className="flex flex-wrap gap-1.5">
          {availableDays.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setSelectedDay(d)}
              className={cn(
                "rounded-md border px-3 py-1 text-[11.5px] transition-colors",
                d === selectedDay
                  ? "border-ink bg-ink text-ivory"
                  : "border-border bg-white text-ink-muted hover:border-ink/25 hover:text-ink",
              )}
            >
              {formatEventDate(d)}
            </button>
          ))}
        </div>
      ) : null}

      {isToday ? (
        <div className="rounded-lg border border-gold/15 bg-gold-pale/25 px-4 py-3 text-[12px] text-ink-soft">
          Right now:{" "}
          <span className="font-mono font-medium">{formatTime(nowStr)}</span>
        </div>
      ) : null}

      <section>
        <h3 className="mb-2 text-[11px] font-medium uppercase tracking-[0.14em] text-ink-muted">
          Vendor check-in
        </h3>
        <ul className="flex flex-col gap-1.5 text-[12.5px]">
          {checkedIn.map((a) => {
            const vendor = vendorById.get(a.vendorId);
            return (
              <li
                key={a.id}
                className="flex items-center gap-2 rounded-md border border-sage-pale bg-sage-pale/40 px-3 py-1.5"
              >
                <CheckCircle2
                  size={13}
                  strokeWidth={1.8}
                  className="text-sage"
                />
                <span>
                  <span className="mr-1">
                    {vendor ? COORDINATION_ROLE_ICON[vendor.role] : ""}
                  </span>
                  <strong>{vendor?.name}</strong> · {a.eventName} — arrived{" "}
                  {formatTime(a.vendorCheckedInAt?.slice(11, 16) ?? null)}
                </span>
              </li>
            );
          })}
          {late.map((a) => {
            const vendor = vendorById.get(a.vendorId);
            const [h, m] = a.callTime!.split(":").map(Number);
            const callMinutes = h * 60 + m;
            const nowMinutes = now.getHours() * 60 + now.getMinutes();
            const lateBy = nowMinutes - callMinutes;
            return (
              <li
                key={a.id}
                className="flex items-center gap-2 rounded-md border border-rose-pale bg-rose-pale/40 px-3 py-1.5"
              >
                <AlertCircle
                  size={13}
                  strokeWidth={1.8}
                  className="text-rose"
                />
                <span>
                  <strong>{vendor?.name}</strong> due {formatTime(a.callTime)}{" "}
                  — {lateBy} min late
                </span>
              </li>
            );
          })}
          {checkedIn.length === 0 && late.length === 0 ? (
            <li className="text-[11.5px] italic text-ink-faint">
              No check-ins yet. Vendors check themselves in from their portal
              when they arrive.
            </li>
          ) : null}
        </ul>
      </section>

      <section className="flex flex-col gap-2">
        <h3 className="text-[11px] font-medium uppercase tracking-[0.14em] text-ink-muted">
          Quick broadcast
        </h3>
        <div className="flex flex-col gap-2 rounded-lg border border-gold/15 bg-white px-4 py-3">
          <textarea
            value={quickMsg}
            onChange={(e) => setQuickMsg(e.target.value)}
            rows={2}
            placeholder="Running 15 min behind — pushing first look to 10:45 AM"
            className="w-full resize-y rounded-md border border-border bg-white px-3 py-2 text-[13px] text-ink outline-none focus:border-gold"
          />
          <button
            type="button"
            onClick={() => {
              const text = quickMsg.trim();
              if (!text) return;
              sendUpdate({
                subject: "Quick timing update",
                body: text,
                priority: "important",
                targetType: "all",
              });
              setQuickMsg("");
            }}
            disabled={quickMsg.trim().length === 0}
            className="flex items-center gap-1.5 self-end rounded-md bg-ink px-3 py-1.5 text-[11.5px] font-medium text-ivory hover:opacity-90 disabled:opacity-40"
          >
            <Send size={11} strokeWidth={1.8} />
            Send to all vendors
          </button>
        </div>
      </section>

      <section>
        <h3 className="mb-2 text-[11px] font-medium uppercase tracking-[0.14em] text-ink-muted">
          Upcoming
        </h3>
        <ul className="flex flex-col gap-1 text-[12.5px]">
          {upcoming.length === 0 ? (
            <li className="italic text-ink-faint">
              Nothing else scheduled for {isToday ? "today" : "this day"}.
            </li>
          ) : (
            upcoming.map((a) => {
              const vendor = vendorById.get(a.vendorId);
              return (
                <li
                  key={a.id}
                  className="grid grid-cols-[80px_1fr] items-baseline gap-3"
                >
                  <span className="font-mono text-[12px] text-ink">
                    {formatTime(a.callTime)}
                  </span>
                  <span>
                    <strong>{a.eventName}</strong> —{" "}
                    {vendor?.name ?? "Unknown vendor"}
                    {a.description ? ` · ${a.description}` : ""}
                  </span>
                </li>
              );
            })
          )}
        </ul>
      </section>
    </section>
  );
}
