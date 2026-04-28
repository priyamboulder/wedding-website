"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Card, CardHeader, GhostButton, PrimaryButton } from "@/components/vendor-portal/ui";
import type { CalendarEntry, CalendarEventKind } from "@/lib/vendor-portal/seed";
import { WEDDINGS } from "@/lib/vendor-portal/seed";

type Props = { initialEntries: CalendarEntry[]; today: string };

type ViewMode = "month" | "week";

const KIND_STYLE: Record<
  CalendarEventKind,
  { bg: string; ring: string; fg: string; dot: string; label: string }
> = {
  wedding: {
    bg: "#F5E0D6",
    ring: "rgba(201,123,99,0.38)",
    fg: "#9a4a30",
    dot: "#C97B63",
    label: "Wedding event",
  },
  task: {
    bg: "#F0E4C8",
    ring: "rgba(184,134,11,0.38)",
    fg: "#7a5a16",
    dot: "#B8860B",
    label: "Task / milestone",
  },
  consultation: {
    bg: "#DCE9E7",
    ring: "rgba(91,142,138,0.35)",
    fg: "#3a6b67",
    dot: "#5b8e8a",
    label: "Consultation",
  },
  blocked: {
    bg: "#EAE6DD",
    ring: "rgba(26,26,26,0.1)",
    fg: "#6b6b6b",
    dot: "#a8a29e",
    label: "Unavailable",
  },
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// ── Date utils (local time) ──────────────────────────────────────
function parseISO(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}
function toISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function startOfWeek(d: Date): Date {
  const out = new Date(d);
  out.setDate(d.getDate() - d.getDay());
  return out;
}
function addDays(d: Date, n: number): Date {
  const out = new Date(d);
  out.setDate(d.getDate() + n);
  return out;
}
function addMonths(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth() + n, 1);
}
function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatTimeRange(start?: string, end?: string): string | null {
  if (!start) return null;
  const fmt = (s: string) => {
    const [h, m] = s.split(":").map(Number);
    const period = h >= 12 ? "pm" : "am";
    const hour = h % 12 === 0 ? 12 : h % 12;
    return m === 0 ? `${hour}${period}` : `${hour}:${String(m).padStart(2, "0")}${period}`;
  };
  return end ? `${fmt(start)}–${fmt(end)}` : fmt(start);
}

// ── Main component ───────────────────────────────────────────────

export default function CalendarClient({ initialEntries, today }: Props) {
  const todayDate = parseISO(today);
  const [anchor, setAnchor] = useState<Date>(startOfMonth(todayDate));
  const [view, setView] = useState<ViewMode>("month");
  const [entries, setEntries] = useState<CalendarEntry[]>(initialEntries);
  const [selected, setSelected] = useState<CalendarEntry | null>(null);
  const [modal, setModal] = useState<null | "block" | "consult" | "export">(null);

  const byDate = useMemo(() => {
    const map: Record<string, CalendarEntry[]> = {};
    for (const e of entries) {
      (map[e.date] ||= []).push(e);
    }
    return map;
  }, [entries]);

  // Monthly summary counts (unique weddings, consultations, tasks due)
  const monthSummary = useMemo(() => {
    const y = anchor.getFullYear();
    const m = anchor.getMonth();
    const inMonth = entries.filter((e) => {
      const d = parseISO(e.date);
      return d.getFullYear() === y && d.getMonth() === m;
    });
    const weddings = new Set(
      inMonth.filter((e) => e.kind === "wedding").map((e) => e.couple ?? e.id),
    );
    const consultations = inMonth.filter((e) => e.kind === "consultation").length;
    const tasks = inMonth.filter((e) => e.kind === "task").length;
    return { weddings: weddings.size, consultations, tasks };
  }, [entries, anchor]);

  const headerLabel =
    view === "month"
      ? `${MONTH_NAMES[anchor.getMonth()]} ${anchor.getFullYear()}`
      : weekLabel(startOfWeek(anchor));

  function goPrev() {
    setAnchor(view === "month" ? addMonths(anchor, -1) : addDays(anchor, -7));
  }
  function goNext() {
    setAnchor(view === "month" ? addMonths(anchor, 1) : addDays(anchor, 7));
  }
  function goToday() {
    setAnchor(view === "month" ? startOfMonth(todayDate) : todayDate);
  }

  function addEntry(e: CalendarEntry) {
    setEntries((prev) => [...prev, e]);
  }

  return (
    <>
      <div className="space-y-5 px-4 py-6 sm:px-8">
        {/* Summary + view toggle */}
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
            <div className="min-w-0">
              <p className="font-mono text-[10.5px] uppercase tracking-[0.26em] text-stone-500">
                {headerLabel}
              </p>
              <p
                className="mt-1 text-[17px] leading-snug text-[#1a1a1a]"
                style={{ fontFamily: "'EB Garamond', serif", fontStyle: "italic" }}
              >
                {monthSummary.weddings} wedding{monthSummary.weddings === 1 ? "" : "s"} this month ·{" "}
                {monthSummary.consultations} consultation
                {monthSummary.consultations === 1 ? "" : "s"} scheduled · {monthSummary.tasks} task
                {monthSummary.tasks === 1 ? "" : "s"} due
              </p>
            </div>
            <div className="flex items-center gap-2">
              <ViewToggle view={view} setView={setView} />
            </div>
          </div>
        </Card>

        {/* Nav bar + desktop actions */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1">
            <NavButton onClick={goPrev} ariaLabel="Previous">
              ‹
            </NavButton>
            <NavButton onClick={goNext} ariaLabel="Next">
              ›
            </NavButton>
            <button
              onClick={goToday}
              className="ml-1 h-8 rounded-md border border-[rgba(26,26,26,0.12)] bg-white px-3 text-[12.5px] text-[#1a1a1a] transition-colors hover:bg-[#FBF7EC]"
            >
              Today
            </button>
          </div>
          <div className="hidden items-center gap-2 md:flex">
            <GhostButton onClick={() => setModal("export")}>Sync calendars</GhostButton>
            <GhostButton onClick={() => setModal("consult")}>+ Consultation</GhostButton>
            <PrimaryButton onClick={() => setModal("block")}>+ Block date</PrimaryButton>
          </div>
        </div>

        {/* Legend */}
        <Legend />

        {/* Grid views — desktop only */}
        <div className="hidden md:block">
          {view === "month" ? (
            <MonthGrid
              anchor={anchor}
              byDate={byDate}
              todayDate={todayDate}
              onSelect={setSelected}
            />
          ) : (
            <WeekGrid
              anchor={anchor}
              byDate={byDate}
              todayDate={todayDate}
              onSelect={setSelected}
            />
          )}
        </div>

        {/* Agenda view — mobile */}
        <div className="md:hidden">
          <AgendaView
            anchor={anchor}
            view={view}
            byDate={byDate}
            todayDate={todayDate}
            onSelect={setSelected}
          />
        </div>
      </div>

      {/* Action rail — available everywhere */}
      <div className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-end gap-2 border-t border-[rgba(26,26,26,0.08)] bg-[#F7F5F0]/95 px-4 py-3 backdrop-blur md:hidden">
        <GhostButton onClick={() => setModal("consult")}>+ Consultation</GhostButton>
        <PrimaryButton onClick={() => setModal("block")}>+ Block date</PrimaryButton>
      </div>

      {/* Detail flyout */}
      {selected && (
        <EventFlyout entry={selected} onClose={() => setSelected(null)} />
      )}

      {/* Modals */}
      {modal === "block" && (
        <BlockDateModal
          defaultDate={toISO(todayDate)}
          onClose={() => setModal(null)}
          onSave={(entry) => {
            addEntry(entry);
            setModal(null);
          }}
        />
      )}
      {modal === "consult" && (
        <ConsultationModal
          defaultDate={toISO(todayDate)}
          onClose={() => setModal(null)}
          onSave={(entry) => {
            addEntry(entry);
            setModal(null);
          }}
        />
      )}
      {modal === "export" && <ExportModal onClose={() => setModal(null)} />}
    </>
  );
}

// ── Month grid ──────────────────────────────────────────────────

function MonthGrid({
  anchor,
  byDate,
  todayDate,
  onSelect,
}: {
  anchor: Date;
  byDate: Record<string, CalendarEntry[]>;
  todayDate: Date;
  onSelect: (e: CalendarEntry) => void;
}) {
  const first = startOfMonth(anchor);
  const gridStart = startOfWeek(first);
  const cells: Date[] = [];
  for (let i = 0; i < 42; i++) cells.push(addDays(gridStart, i));
  // Trim trailing full empty week if possible (keep at least 5 rows)
  const rows = cells.slice(0, 42);

  return (
    <Card>
      <div className="p-3 sm:p-4">
        <div className="mb-2 grid grid-cols-7 gap-2">
          {WEEKDAYS.map((d) => (
            <div
              key={d}
              className="font-mono text-[10.5px] uppercase tracking-wider text-stone-500"
            >
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {rows.map((date) => {
            const iso = toISO(date);
            const inMonth = date.getMonth() === anchor.getMonth();
            const isToday = sameDay(date, todayDate);
            const dayEntries = byDate[iso] || [];
            return (
              <div
                key={iso}
                className={`min-h-[98px] rounded-lg border p-2 transition-colors ${
                  isToday
                    ? "border-[#B8860B] bg-[#FBF7EC]"
                    : inMonth
                      ? "border-[rgba(26,26,26,0.06)] bg-white hover:border-[rgba(26,26,26,0.16)]"
                      : "border-transparent bg-[#FBF9F4]/40"
                }`}
              >
                <p
                  className={`text-[12px] ${
                    isToday
                      ? "font-semibold text-[#7a5a16]"
                      : inMonth
                        ? "text-stone-600"
                        : "text-stone-400"
                  }`}
                >
                  {date.getDate()}
                </p>
                <div className="mt-1 space-y-1">
                  {dayEntries.slice(0, 3).map((e) => (
                    <EventPill key={e.id} entry={e} onClick={() => onSelect(e)} />
                  ))}
                  {dayEntries.length > 3 && (
                    <button
                      onClick={() => onSelect(dayEntries[3])}
                      className="block w-full truncate rounded px-1.5 py-0.5 text-left text-[10px] text-stone-500 hover:bg-[#FBF7EC]"
                    >
                      +{dayEntries.length - 3} more
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}

// ── Week grid ───────────────────────────────────────────────────

function WeekGrid({
  anchor,
  byDate,
  todayDate,
  onSelect,
}: {
  anchor: Date;
  byDate: Record<string, CalendarEntry[]>;
  todayDate: Date;
  onSelect: (e: CalendarEntry) => void;
}) {
  const start = startOfWeek(anchor);
  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));
  return (
    <Card>
      <div className="p-3 sm:p-4">
        <div className="grid grid-cols-7 gap-2">
          {days.map((date) => {
            const iso = toISO(date);
            const dayEntries = byDate[iso] || [];
            const isToday = sameDay(date, todayDate);
            return (
              <div
                key={iso}
                className={`rounded-lg border p-3 ${
                  isToday
                    ? "border-[#B8860B] bg-[#FBF7EC]"
                    : "border-[rgba(26,26,26,0.06)] bg-white"
                }`}
              >
                <div className="mb-2 flex items-baseline justify-between">
                  <p className="font-mono text-[10px] uppercase tracking-wider text-stone-500">
                    {WEEKDAYS[date.getDay()]}
                  </p>
                  <p
                    className={`text-[20px] leading-none ${
                      isToday ? "font-semibold text-[#7a5a16]" : "text-[#1a1a1a]"
                    }`}
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    {date.getDate()}
                  </p>
                </div>
                <div className="min-h-[220px] space-y-1.5">
                  {dayEntries.length === 0 && (
                    <p className="text-[11px] italic text-stone-400">Open</p>
                  )}
                  {dayEntries.map((e) => (
                    <EventBlock key={e.id} entry={e} onClick={() => onSelect(e)} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}

// ── Agenda (mobile) ─────────────────────────────────────────────

function AgendaView({
  anchor,
  view,
  byDate,
  todayDate,
  onSelect,
}: {
  anchor: Date;
  view: ViewMode;
  byDate: Record<string, CalendarEntry[]>;
  todayDate: Date;
  onSelect: (e: CalendarEntry) => void;
}) {
  const range = useMemo(() => {
    if (view === "week") {
      const start = startOfWeek(anchor);
      return Array.from({ length: 7 }, (_, i) => addDays(start, i));
    }
    const first = startOfMonth(anchor);
    const next = addMonths(first, 1);
    const out: Date[] = [];
    for (let d = new Date(first); d < next; d = addDays(d, 1)) out.push(new Date(d));
    return out;
  }, [anchor, view]);

  const daysWithEntries = range.filter((d) => (byDate[toISO(d)] || []).length > 0);

  if (daysWithEntries.length === 0) {
    return (
      <Card>
        <div className="px-5 py-10 text-center">
          <p
            className="text-[16px] italic text-stone-500"
            style={{ fontFamily: "'EB Garamond', serif" }}
          >
            Nothing scheduled this {view}.
          </p>
          <p className="mt-1 text-[12px] text-stone-400">
            Pull new inquiries into your calendar or block dates you need to yourself.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-3 pb-24">
      {daysWithEntries.map((date) => {
        const iso = toISO(date);
        const isToday = sameDay(date, todayDate);
        return (
          <div key={iso} className="flex gap-4">
            <div className="w-12 shrink-0 pt-1 text-center">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-stone-400">
                {date.toLocaleDateString("en-US", { month: "short" })}
              </p>
              <p
                className={`mt-0.5 text-[22px] leading-none ${
                  isToday ? "font-semibold text-[#7a5a16]" : "text-[#1a1a1a]"
                }`}
                style={{ fontFamily: "'Playfair Display', serif", fontWeight: 500 }}
              >
                {date.getDate()}
              </p>
              <p className="mt-0.5 text-[10px] text-stone-400">
                {WEEKDAYS[date.getDay()]}
              </p>
            </div>
            <div className="min-w-0 flex-1 space-y-2">
              {(byDate[iso] || []).map((e) => (
                <AgendaRow key={e.id} entry={e} onClick={() => onSelect(e)} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function AgendaRow({ entry, onClick }: { entry: CalendarEntry; onClick: () => void }) {
  const s = KIND_STYLE[entry.kind];
  const time = formatTimeRange(entry.startTime, entry.endTime);
  return (
    <button
      onClick={onClick}
      className="flex w-full items-start gap-3 rounded-lg border bg-white p-3 text-left transition-colors hover:bg-[#FBF7EC]"
      style={{ borderColor: "rgba(26,26,26,0.08)" }}
    >
      <span
        className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
        style={{ backgroundColor: s.dot }}
        aria-hidden
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13.5px] font-medium text-[#1a1a1a]">
          {entry.eventType ?? entry.label}
        </p>
        <p className="mt-0.5 truncate text-[12px] text-stone-600">
          {entry.couple ?? entry.label}
          {entry.city ? ` · ${entry.city}` : ""}
        </p>
        {time && (
          <p className="mt-1 font-mono text-[10.5px] uppercase tracking-wider text-stone-500">
            {time}
            {entry.location ? ` · ${entry.location}` : ""}
          </p>
        )}
      </div>
    </button>
  );
}

// ── Primitives ──────────────────────────────────────────────────

function EventPill({ entry, onClick }: { entry: CalendarEntry; onClick: () => void }) {
  const s = KIND_STYLE[entry.kind];
  return (
    <button
      onClick={onClick}
      className="block w-full truncate rounded px-1.5 py-0.5 text-left text-[10.5px] leading-tight transition-colors hover:brightness-[0.97]"
      style={{
        backgroundColor: s.bg,
        color: s.fg,
        boxShadow: `inset 0 0 0 1px ${s.ring}`,
      }}
      title={entry.label}
    >
      {entry.startTime ? `${fmtShort(entry.startTime)} · ` : ""}
      {entry.eventType ?? entry.label}
    </button>
  );
}

function EventBlock({ entry, onClick }: { entry: CalendarEntry; onClick: () => void }) {
  const s = KIND_STYLE[entry.kind];
  const time = formatTimeRange(entry.startTime, entry.endTime);
  return (
    <button
      onClick={onClick}
      className="block w-full rounded-md p-2 text-left transition-colors hover:brightness-[0.97]"
      style={{
        backgroundColor: s.bg,
        color: s.fg,
        boxShadow: `inset 0 0 0 1px ${s.ring}`,
      }}
    >
      <p className="truncate text-[11.5px] font-medium">
        {entry.eventType ?? entry.label}
      </p>
      {entry.couple && (
        <p className="truncate text-[10.5px] opacity-80">{entry.couple}</p>
      )}
      {time && (
        <p className="mt-0.5 font-mono text-[9.5px] uppercase tracking-wider opacity-75">
          {time}
        </p>
      )}
    </button>
  );
}

function fmtShort(s: string): string {
  const [h, m] = s.split(":").map(Number);
  const period = h >= 12 ? "p" : "a";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return m === 0 ? `${hour}${period}` : `${hour}:${String(m).padStart(2, "0")}${period}`;
}

function ViewToggle({
  view,
  setView,
}: {
  view: ViewMode;
  setView: (v: ViewMode) => void;
}) {
  return (
    <div
      className="inline-flex rounded-md border p-0.5"
      style={{ borderColor: "rgba(26,26,26,0.12)", backgroundColor: "#FBF9F4" }}
    >
      {(["month", "week"] as ViewMode[]).map((v) => (
        <button
          key={v}
          onClick={() => setView(v)}
          className={`h-7 rounded px-3 text-[12px] capitalize transition-colors ${
            view === v
              ? "bg-white text-[#1a1a1a] shadow-[0_1px_0_rgba(26,26,26,0.05)]"
              : "text-stone-500 hover:text-[#1a1a1a]"
          }`}
        >
          {v}
        </button>
      ))}
    </div>
  );
}

function NavButton({
  onClick,
  ariaLabel,
  children,
}: {
  onClick: () => void;
  ariaLabel: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      className="flex h-8 w-8 items-center justify-center rounded-md border border-[rgba(26,26,26,0.12)] bg-white text-stone-600 transition-colors hover:text-[#1a1a1a]"
    >
      {children}
    </button>
  );
}

function Legend() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {(Object.keys(KIND_STYLE) as CalendarEventKind[]).map((k) => (
        <div key={k} className="flex items-center gap-1.5">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: KIND_STYLE[k].dot }}
            aria-hidden
          />
          <span className="text-[11.5px] text-stone-600">{KIND_STYLE[k].label}</span>
        </div>
      ))}
    </div>
  );
}

function weekLabel(start: Date): string {
  const end = addDays(start, 6);
  const sameMonth = start.getMonth() === end.getMonth();
  const sameYear = start.getFullYear() === end.getFullYear();
  const left = start.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const right = sameMonth
    ? end.getDate()
    : end.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const year = sameYear ? end.getFullYear() : `${start.getFullYear()} – ${end.getFullYear()}`;
  return `${left} – ${right}, ${year}`;
}

// ── Flyout ──────────────────────────────────────────────────────

function EventFlyout({
  entry,
  onClose,
}: {
  entry: CalendarEntry;
  onClose: () => void;
}) {
  const s = KIND_STYLE[entry.kind];
  const date = parseISO(entry.date);
  const time = formatTimeRange(entry.startTime, entry.endTime);
  const wedding = entry.weddingId
    ? WEDDINGS.find((w) => w.id === entry.weddingId)
    : null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-[#1a1a1a]/20 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden
      />
      <aside
        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[420px] flex-col border-l border-[rgba(26,26,26,0.08)] bg-[#FBF9F4] shadow-[0_0_60px_rgba(26,26,26,0.15)]"
        role="dialog"
        aria-label="Event details"
      >
        <div className="flex items-start justify-between gap-3 border-b border-[rgba(26,26,26,0.06)] px-5 py-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: s.dot }}
                aria-hidden
              />
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-stone-500">
                {s.label}
              </p>
            </div>
            <h3
              className="mt-2 text-[22px] leading-tight text-[#1a1a1a]"
              style={{ fontFamily: "'Playfair Display', serif", fontWeight: 500 }}
            >
              {entry.eventType ?? entry.label}
            </h3>
            {entry.couple && (
              <p className="mt-0.5 text-[13.5px] text-stone-600">{entry.couple}</p>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-stone-500 hover:bg-white hover:text-[#1a1a1a]"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
          <DetailRow
            label="Date"
            value={date.toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          />
          {time && <DetailRow label="Time" value={time} />}
          {(entry.venue || entry.city || entry.location) && (
            <DetailRow
              label="Location"
              value={
                [entry.venue, entry.city, entry.location].filter(Boolean).join(" · ") || "—"
              }
            />
          )}
          {entry.notes && (
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-stone-500">
                Notes
              </p>
              <p
                className="mt-1.5 text-[14px] leading-relaxed text-stone-700"
                style={{ fontFamily: "'EB Garamond', serif" }}
              >
                {entry.notes}
              </p>
            </div>
          )}

          {wedding && (
            <div className="rounded-lg border border-[rgba(26,26,26,0.08)] bg-white p-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-stone-500">
                Wedding file
              </p>
              <p className="mt-1.5 text-[14px] font-medium text-[#1a1a1a]">
                {wedding.coupleName}
              </p>
              <p className="text-[12px] text-stone-500">
                {wedding.weddingDate} · {wedding.venue}, {wedding.city}
              </p>
              <div className="mt-3 flex items-center gap-2 text-[12px]">
                <span className="font-mono uppercase tracking-wider text-stone-400">
                  Package
                </span>
                <span className="text-stone-700">{wedding.package}</span>
              </div>
              <Link
                href={`/vendor/weddings#${wedding.id}`}
                className="mt-3 inline-flex text-[12.5px] text-[#7a5a16] hover:underline"
                onClick={onClose}
              >
                Open wedding detail →
              </Link>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-[rgba(26,26,26,0.06)] px-5 py-4">
          <GhostButton onClick={onClose}>Close</GhostButton>
          {entry.couple && (
            <PrimaryButton as="a" href="/vendor/inbox">
              Message couple
            </PrimaryButton>
          )}
        </div>
      </aside>
    </>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-stone-500">
        {label}
      </p>
      <p className="mt-1 text-[14px] text-[#1a1a1a]">{value}</p>
    </div>
  );
}

// ── Modals ──────────────────────────────────────────────────────

function ModalShell({
  title,
  eyebrow,
  children,
  onClose,
  footer,
}: {
  title: string;
  eyebrow?: string;
  children: React.ReactNode;
  onClose: () => void;
  footer?: React.ReactNode;
}) {
  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-[#1a1a1a]/25 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-label={title}
        className="fixed left-1/2 top-1/2 z-50 w-[min(520px,calc(100%-32px))] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-xl border border-[rgba(26,26,26,0.08)] bg-[#FBF9F4] shadow-[0_30px_80px_rgba(26,26,26,0.25)]"
      >
        <div className="flex items-start justify-between border-b border-[rgba(26,26,26,0.06)] px-5 py-4">
          <div>
            {eyebrow && (
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-stone-500">
                {eyebrow}
              </p>
            )}
            <h3
              className="mt-1 text-[20px] leading-tight text-[#1a1a1a]"
              style={{ fontFamily: "'Playfair Display', serif", fontWeight: 500 }}
            >
              {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-md text-stone-500 hover:bg-white hover:text-[#1a1a1a]"
          >
            ✕
          </button>
        </div>
        <div className="max-h-[60vh] overflow-y-auto px-5 py-5">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-2 border-t border-[rgba(26,26,26,0.06)] px-5 py-4">
            {footer}
          </div>
        )}
      </div>
    </>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-stone-500">
        {label}
      </span>
      <span className="mt-1 block">{children}</span>
    </label>
  );
}

const INPUT_CLASS =
  "w-full rounded-md border border-[rgba(26,26,26,0.12)] bg-white px-3 py-2 text-[13.5px] text-[#1a1a1a] outline-none focus:border-[rgba(184,134,11,0.5)] focus:ring-2 focus:ring-[rgba(184,134,11,0.18)]";

function BlockDateModal({
  defaultDate,
  onClose,
  onSave,
}: {
  defaultDate: string;
  onClose: () => void;
  onSave: (entry: CalendarEntry) => void;
}) {
  const [date, setDate] = useState(defaultDate);
  const [reason, setReason] = useState("Family event");
  const [notes, setNotes] = useState("");

  function submit() {
    onSave({
      id: `block-${Date.now()}`,
      date,
      kind: "blocked",
      label: `Unavailable — ${reason || "Personal"}`,
      notes: notes || undefined,
    });
  }

  return (
    <ModalShell
      eyebrow="Availability"
      title="Block a date"
      onClose={onClose}
      footer={
        <>
          <GhostButton onClick={onClose}>Cancel</GhostButton>
          <PrimaryButton onClick={submit}>Block this date</PrimaryButton>
        </>
      }
    >
      <p
        className="-mt-1 mb-4 text-[14px] italic text-stone-600"
        style={{ fontFamily: "'EB Garamond', serif" }}
      >
        Mark yourself unavailable so couples can't hold this date when enquiring.
      </p>
      <div className="space-y-4">
        <Field label="Date">
          <input
            type="date"
            className={INPUT_CLASS}
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </Field>
        <Field label="Reason">
          <input
            type="text"
            className={INPUT_CLASS}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Family event, personal, travel…"
          />
        </Field>
        <Field label="Notes (optional)">
          <textarea
            className={`${INPUT_CLASS} min-h-[80px] resize-none`}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="A note only you will see."
          />
        </Field>
      </div>
    </ModalShell>
  );
}

function ConsultationModal({
  defaultDate,
  onClose,
  onSave,
}: {
  defaultDate: string;
  onClose: () => void;
  onSave: (entry: CalendarEntry) => void;
}) {
  const [date, setDate] = useState(defaultDate);
  const [couple, setCouple] = useState("");
  const [start, setStart] = useState("10:00");
  const [end, setEnd] = useState("10:45");
  const [location, setLocation] = useState("Zoom");
  const [notes, setNotes] = useState("");

  function submit() {
    onSave({
      id: `consult-${Date.now()}`,
      date,
      kind: "consultation",
      label: `Consultation · ${couple || "New couple"}`,
      eventType: "Discovery call",
      couple: couple || undefined,
      startTime: start,
      endTime: end,
      location: location || undefined,
      notes: notes || undefined,
    });
  }

  return (
    <ModalShell
      eyebrow="Availability"
      title="Add a consultation slot"
      onClose={onClose}
      footer={
        <>
          <GhostButton onClick={onClose}>Cancel</GhostButton>
          <PrimaryButton onClick={submit}>Save consultation</PrimaryButton>
        </>
      }
    >
      <p
        className="-mt-1 mb-4 text-[14px] italic text-stone-600"
        style={{ fontFamily: "'EB Garamond', serif" }}
      >
        A short window for a discovery call. Shows on your calendar and links back to the couple.
      </p>
      <div className="space-y-4">
        <Field label="Couple">
          <input
            type="text"
            className={INPUT_CLASS}
            value={couple}
            onChange={(e) => setCouple(e.target.value)}
            placeholder="Ananya & Rohan"
          />
        </Field>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Date">
            <input
              type="date"
              className={INPUT_CLASS}
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </Field>
          <Field label="Start">
            <input
              type="time"
              className={INPUT_CLASS}
              value={start}
              onChange={(e) => setStart(e.target.value)}
            />
          </Field>
          <Field label="End">
            <input
              type="time"
              className={INPUT_CLASS}
              value={end}
              onChange={(e) => setEnd(e.target.value)}
            />
          </Field>
        </div>
        <Field label="Location">
          <input
            type="text"
            className={INPUT_CLASS}
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Zoom, Google Meet, studio…"
          />
        </Field>
        <Field label="Notes (optional)">
          <textarea
            className={`${INPUT_CLASS} min-h-[80px] resize-none`}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Agenda, context, links."
          />
        </Field>
      </div>
    </ModalShell>
  );
}

function ExportModal({ onClose }: { onClose: () => void }) {
  return (
    <ModalShell
      eyebrow="Sync & export"
      title="Keep everything in sync"
      onClose={onClose}
      footer={<PrimaryButton onClick={onClose}>Done</PrimaryButton>}
    >
      <p
        className="-mt-1 mb-4 text-[14px] italic text-stone-600"
        style={{ fontFamily: "'EB Garamond', serif" }}
      >
        Connect the calendar you already live in — two-way sync so blocked dates flow both ways.
      </p>
      <div className="space-y-3">
        <SyncRow
          icon="G"
          title="Google Calendar"
          hint="Two-way sync · shoots + tasks + blocks"
          action="Connect"
        />
        <SyncRow
          icon="O"
          title="Microsoft Outlook"
          hint="Two-way sync · shoots + tasks + blocks"
          action="Connect"
        />
        <SyncRow
          icon="iC"
          title="iCal / subscribe URL"
          hint="Read-only feed for Apple Calendar, Fantastical, etc."
          action="Copy link"
        />
      </div>
    </ModalShell>
  );
}

function SyncRow({
  icon,
  title,
  hint,
  action,
}: {
  icon: string;
  title: string;
  hint: string;
  action: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-[rgba(26,26,26,0.08)] bg-white p-3.5">
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F0E4C8] text-[12px] font-semibold text-[#7a5a16]">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[13.5px] font-medium text-[#1a1a1a]">{title}</p>
        <p className="truncate text-[11.5px] text-stone-500">{hint}</p>
      </div>
      <button className="rounded-md border border-[rgba(26,26,26,0.12)] bg-white px-3 py-1.5 text-[12px] text-[#1a1a1a] hover:bg-[#FBF7EC]">
        {action}
      </button>
    </div>
  );
}

