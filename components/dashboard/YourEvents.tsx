"use client";

// ── YourEvents ─────────────────────────────────────────────────────────
// Main-column section: the events the couple is planning. Renders as a
// 2-column pinboard of rose-tinted cards (#F5ECEA) on the white canvas,
// each carrying a 3px color-coded LEFT accent stripe per event type
// (warm marigold, deep rose, jewel purple, etc) and a faint dot
// watermark in the same accent color. Yellow/green colors live only on
// the accent stripe — never as a background wash.
//
// Exposes an imperative `openAddModal` so StartHere and QuickActions in
// the sidebar can trigger the add-event flow without prop-drilling.

import { forwardRef, useImperativeHandle, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Calendar,
  MapPin,
  Plus,
  Sparkles,
  X,
} from "lucide-react";
import { useEventsStore } from "@/stores/events-store";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { EVENT_TYPE_OPTIONS } from "@/lib/events-seed";
import type { EventType, EventRecord } from "@/types/events";
import { cn } from "@/lib/utils";
import { InlineEdit } from "./InlineEdit";

function eventDisplayName(e: EventRecord): string {
  if (e.customName?.trim()) return e.customName.trim();
  if (e.vibeEventName?.trim()) return e.vibeEventName.trim();
  if (e.customEventName?.trim()) return e.customEventName.trim();
  return EVENT_TYPE_OPTIONS.find((o) => o.id === e.type)?.name ?? e.type;
}

function vibeLabel(e: EventRecord): string | null {
  return (
    e.vibeLabel?.trim() ||
    e.customTheme?.trim() ||
    e.vibeTheme?.trim() ||
    null
  );
}

// Maps event type → accent class. The accent class only changes the
// 4px left stripe + watermark dot color; the card body stays white.
const ACCENT_MAP: Record<string, string> = {
  haldi: "dash-accent--haldi",
  pithi: "dash-accent--haldi",
  mehendi: "dash-accent--mehndi",
  sangeet: "dash-accent--sangeet",
  garba: "dash-accent--garba",
  baraat: "dash-accent--haldi",
  ceremony: "dash-accent--ceremony",
  cocktail: "dash-accent--cocktail",
  welcome_dinner: "dash-accent--cocktail",
  reception: "dash-accent--reception",
  after_party: "dash-accent--reception",
  farewell_brunch: "dash-accent--cocktail",
  custom: "dash-accent--default",
};

const SUGGESTED_NAMES: Partial<Record<string, string[]>> = {
  haldi: ["Marigold Morning", "Golden Hour", "The Glow"],
  mehendi: ["Henna & Hush", "Slow Saturday", "Green Garden"],
  sangeet: ["Full Spin", "After-Hours", "Songbook"],
  garba: ["Dandiya Nights", "Full Spin"],
  ceremony: ["Under the Banyan", "The Vow", "Sacred Fire"],
  reception: ["After Glow", "First Dance", "The Late Bloom"],
};

interface ProgressRingProps {
  value: number;
  size?: number;
}

function ProgressRing({ value, size = 32 }: ProgressRingProps) {
  const radius = (size - 4) / 2;
  const circ = 2 * Math.PI * radius;
  const dash = circ * Math.max(0, Math.min(1, value));
  return (
    <svg width={size} height={size} className="shrink-0" aria-hidden>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="var(--dash-blush-soft)"
        strokeWidth={1.5}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="var(--dash-blush)"
        strokeWidth={1.5}
        strokeDasharray={`${dash} ${circ}`}
        strokeDashoffset={circ * 0.25}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="9"
        fill="var(--dash-text-muted)"
        fontFamily="var(--font-mono)"
      >
        {Math.round(value * 100)}
      </text>
    </svg>
  );
}

function useEventCoverage(): (eventId: string) => number {
  const categories = useWorkspaceStore((s) => s.categories);
  const totalAssigned = categories.filter((c) => c.status === "assigned").length;
  const total = Math.max(categories.length, 1);
  const overall = totalAssigned / total;
  return () => overall;
}

export interface YourEventsHandle {
  openAddModal: () => void;
}

export const YourEvents = forwardRef<YourEventsHandle>(function YourEvents(
  _props,
  ref,
) {
  const events = useEventsStore((s) => s.events);
  const updateEvent = useEventsStore((s) => s.updateEvent);
  const setEventDate = useEventsStore((s) => s.setEventDate);
  const setEventVenue = useEventsStore((s) => s.setEventVenue);
  const removeEvent = useEventsStore((s) => s.removeEvent);
  const addEvent = useEventsStore((s) => s.addEvent);
  const coverageFor = useEventCoverage();
  const [adding, setAdding] = useState(false);

  useImperativeHandle(
    ref,
    () => ({
      openAddModal: () => setAdding(true),
    }),
    [],
  );

  return (
    <section id="events">
      <div className="mb-5 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <h2 className="dash-spread-title">
            Your <em>events</em>
          </h2>
          <p className="dash-spread-sub">
            The celebrations that make your wedding yours — they flow into your
            checklist, vendors, and guest list.
          </p>
        </div>
        {events.length > 0 && (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="dash-btn dash-btn--sm shrink-0"
          >
            <Plus size={13} strokeWidth={1.8} />
            Add event
          </button>
        )}
      </div>

      {events.length === 0 ? (
        <EmptyState onAdd={() => setAdding(true)} />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                progress={coverageFor(event.id)}
                onRename={(name) =>
                  updateEvent(event.id, { customName: name || null })
                }
                onSetDate={(date) => setEventDate(event.id, date || null)}
                onSetVenue={(v) => setEventVenue(event.id, v || null)}
                onRemove={() => removeEvent(event.id)}
              />
            ))}
          </div>
          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={() => setAdding(true)}
              className="inline-flex items-center gap-1 px-1 py-1 text-[12.5px] font-medium text-[color:var(--dash-blush-deep)] transition-colors hover:text-[color:var(--dash-text)]"
            >
              <Plus size={12} strokeWidth={1.8} />
              Add another celebration
            </button>
          </div>
        </>
      )}

      {adding && (
        <AddEventModal
          onClose={() => setAdding(false)}
          onConfirm={(type, name) => {
            addEvent(type, name || undefined);
            setAdding(false);
          }}
          existingTypes={events.map((e) => e.type)}
        />
      )}
    </section>
  );
});

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-start gap-3 rounded-[6px] border border-dashed border-[color:var(--dash-blush-soft)] px-5 py-8">
      <Sparkles size={18} className="text-[color:var(--dash-blush-deep)]" />
      <p
        className="font-serif text-[20px] italic leading-snug text-[color:var(--dash-text)]"
        style={{
          fontFamily:
            "var(--font-display), 'Cormorant Garamond', Georgia, serif",
        }}
      >
        Your celebrations begin here.
      </p>
      <p className="max-w-md text-[13px] leading-relaxed text-[color:var(--dash-text-muted)]">
        Start with your ceremony and build outward — Haldi, Mehndi, Sangeet,
        Reception, anything that's part of your wedding.
      </p>
      <button type="button" onClick={onAdd} className="dash-btn dash-btn--sm mt-1">
        <Plus size={13} strokeWidth={1.8} />
        Add your first event
      </button>
    </div>
  );
}

interface EventCardProps {
  event: EventRecord;
  progress: number;
  onRename: (name: string) => void;
  onSetDate: (date: string) => void;
  onSetVenue: (venue: string) => void;
  onRemove: () => void;
}

function EventCard({
  event,
  progress,
  onRename,
  onSetDate,
  onSetVenue,
  onRemove,
}: EventCardProps) {
  const name = eventDisplayName(event);
  const vibe = vibeLabel(event);
  const dateIso = event.eventDate ?? "";
  const venue = event.venueName ?? "";
  const accentClass = ACCENT_MAP[event.type] ?? "dash-accent--default";
  const typeLabel =
    EVENT_TYPE_OPTIONS.find((o) => o.id === event.type)?.name ?? event.type;

  return (
    <article className={cn("dash-event-card group px-4 py-3.5 pl-5", accentClass)}>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${name}`}
        className="absolute right-2 top-2 z-10 rounded-full p-1 text-[color:var(--dash-text-faint)] opacity-0 transition-opacity hover:text-[color:var(--dash-blush-deep)] group-hover:opacity-100"
      >
        <X size={12} />
      </button>

      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p
            className="text-[9.5px] uppercase tracking-[0.22em] text-[color:var(--dash-text-faint)]"
            style={{ fontFamily: "var(--font-mono)", fontWeight: 500 }}
          >
            {typeLabel}
          </p>
          <h3
            className="mt-1 font-serif text-[22px] italic leading-tight text-[color:var(--dash-text)]"
            style={{
              fontFamily:
                "var(--font-display), 'Cormorant Garamond', Georgia, serif",
              fontWeight: 500,
              letterSpacing: "-0.005em",
            }}
          >
            <InlineEdit
              value={event.customName ?? ""}
              onSave={onRename}
              ariaLabel="Event name"
              placeholder={name}
              inputClassName="text-[20px] font-serif italic"
            />
          </h3>
          {vibe && <span className="dash-pill mt-1.5 inline-flex">{vibe}</span>}
        </div>
        <ProgressRing value={progress} />
      </div>

      <div className="relative mt-3 flex items-center gap-3 text-[12px] text-[color:var(--dash-text-muted)]">
        <label className="flex min-w-0 flex-1 items-center gap-1.5">
          <Calendar size={11} className="shrink-0" />
          <input
            type="date"
            value={dateIso}
            onChange={(e) => onSetDate(e.target.value)}
            className={cn(
              "dash-input min-w-0 flex-1 text-[12px]",
              !dateIso && "italic text-[color:var(--dash-text-faint)]",
            )}
            aria-label={`${name} date`}
          />
        </label>
        <label className="flex min-w-0 flex-1 items-center gap-1.5">
          <MapPin size={11} className="shrink-0" />
          <InlineEdit
            value={venue}
            onSave={onSetVenue}
            placeholder="Venue TBD"
            ariaLabel={`${name} venue`}
            inputClassName="text-[12px]"
            className="min-w-0 flex-1 truncate"
          />
        </label>
      </div>

      <Link
        href={`/workspace/events?event=${event.id}`}
        className="relative mt-2 inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-[0.18em] text-[color:var(--dash-blush-deep)] transition-colors hover:text-[color:var(--dash-text)]"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        Open workspace
        <ArrowUpRight size={11} strokeWidth={1.8} />
      </Link>
    </article>
  );
}

interface AddEventModalProps {
  onClose: () => void;
  onConfirm: (type: EventType, customName: string) => void;
  existingTypes: EventType[];
}

function AddEventModal({
  onClose,
  onConfirm,
  existingTypes,
}: AddEventModalProps) {
  const [selected, setSelected] = useState<EventType>("ceremony");
  const [customName, setCustomName] = useState("");
  const suggestions = SUGGESTED_NAMES[selected] ?? [];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Add event"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[color:var(--dash-text)]/30 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-[6px] bg-[color:var(--dash-canvas)] p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-baseline justify-between">
          <h2
            className="font-serif text-[22px] italic leading-tight text-[color:var(--dash-text)]"
            style={{
              fontFamily:
                "var(--font-display), 'Cormorant Garamond', Georgia, serif",
            }}
          >
            Add a celebration
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-[color:var(--dash-text-faint)] hover:text-[color:var(--dash-text)]"
          >
            <X size={16} />
          </button>
        </header>

        <div className="mt-4 grid max-h-[260px] grid-cols-2 gap-2 overflow-y-auto pr-1 panel-scroll">
          {EVENT_TYPE_OPTIONS.map((opt) => {
            const taken = existingTypes.includes(opt.id);
            const active = selected === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setSelected(opt.id)}
                className={cn(
                  "flex flex-col items-start gap-0.5 rounded-[4px] border px-3 py-2 text-left transition-colors",
                  active
                    ? "border-[color:var(--dash-blush)] bg-[color:var(--dash-blush-light)]"
                    : "border-[color:var(--dash-blush-soft)] hover:bg-[color:var(--dash-blush-light)]",
                )}
              >
                <span className="text-[13px] font-medium text-[color:var(--dash-text)]">
                  {opt.name}
                  {taken && (
                    <span className="ml-1 text-[10px] font-normal text-[color:var(--dash-text-faint)]">
                      ·added
                    </span>
                  )}
                </span>
                <span className="text-[11px] text-[color:var(--dash-text-muted)]">
                  {opt.blurb}
                </span>
              </button>
            );
          })}
        </div>

        <label className="mt-4 block">
          <span
            className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--dash-text-faint)]"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Custom name (optional)
          </span>
          <input
            type="text"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            placeholder="e.g. Under the Banyan"
            className="mt-1 w-full rounded-[4px] border border-[color:var(--dash-blush-soft)] bg-[color:var(--dash-canvas)] px-3 py-2 text-[13px] focus:border-[color:var(--dash-blush)] focus:outline-none"
          />
          {suggestions.length > 0 && (
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] italic text-[color:var(--dash-text-faint)]">
                Try:
              </span>
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setCustomName(s)}
                  className="rounded-full bg-[color:var(--dash-blush-light)] px-2 py-0.5 text-[11px] text-[color:var(--dash-blush-deep)] hover:bg-[color:var(--dash-blush-soft)]"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </label>

        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="dash-btn dash-btn--ghost dash-btn--sm"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(selected, customName)}
            className="dash-btn dash-btn--sm"
          >
            <Plus size={13} strokeWidth={1.8} />
            Add event
          </button>
        </div>
      </div>
    </div>
  );
}
