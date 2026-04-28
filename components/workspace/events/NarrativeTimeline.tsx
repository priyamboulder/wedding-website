"use client";

// ── Narrative Timeline ───────────────────────────────────────────────────
// The hero of the Story canvas. Replaces BOTH the old left-rail event list
// AND the standalone Energy Arc chart by fusing them into a single editorial
// visualization: an SVG energy curve with chapter markers sitting on top,
// each marker a small evocative card (name, date, guest count, palette,
// energy indicator). Clicking a marker opens the event's detail view.
//
// Design reference: the Photography workspace — Fraunces serif titles,
// saffron mono eyebrows, quiet gold borders, generous whitespace.

import { useMemo, useRef, useState } from "react";
import { GripVertical, Plus, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEventsStore } from "@/stores/events-store";
import { PALETTE_LIBRARY } from "@/lib/events-seed";
import type { EventRecord, PaletteSwatch } from "@/types/events";
import { displayNameFor } from "./event-display";

interface Props {
  events: EventRecord[];
  onSelectEvent: (id: string) => void;
  onAddEvent?: () => void;
  onReorder?: (fromIndex: number, toIndex: number) => void;
}

export function NarrativeTimeline({
  events,
  onSelectEvent,
  onAddEvent,
  onReorder,
}: Props) {
  const coupleContext = useEventsStore((s) => s.coupleContext);
  const setEnergyLevel = useEventsStore((s) => s.setEventEnergyLevel);
  const arcRef = useRef<HTMLDivElement | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);

  const sorted = useMemo(
    () => [...events].sort((a, b) => a.sortOrder - b.sortOrder),
    [events],
  );

  const markers = useMemo(() => {
    const count = sorted.length;
    return sorted.map((e, i) => ({
      id: e.id,
      event: e,
      x: count === 1 ? 50 : (i / (count - 1)) * 100,
      y: 100 - Math.max(4, Math.min(96, e.energyLevel)),
    }));
  }, [sorted]);

  // Build a smooth curve through markers for the arc background.
  const arcPath = useMemo(() => {
    if (markers.length === 0) return "";
    if (markers.length === 1) {
      const m = markers[0]!;
      return `M 2 ${m.y} L 98 ${m.y}`;
    }
    const pts = markers.map((m) => [m.x, m.y] as const);
    let d = `M ${pts[0]![0]} ${pts[0]![1]}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const [x0, y0] = pts[i]!;
      const [x1, y1] = pts[i + 1]!;
      const cx1 = x0 + (x1 - x0) / 2;
      const cx2 = x0 + (x1 - x0) / 2;
      d += ` C ${cx1} ${y0} ${cx2} ${y1} ${x1} ${y1}`;
    }
    return d;
  }, [markers]);

  if (sorted.length === 0) {
    return (
      <section className="relative overflow-hidden rounded-xl border border-ink/10 bg-gradient-to-br from-ivory-warm via-white to-saffron-pale/25 px-10 py-16 text-center">
        <Sparkles
          size={22}
          strokeWidth={1.5}
          className="mx-auto text-saffron"
          aria-hidden
        />
        <h3
          className="mt-4 font-serif text-[30px] font-bold leading-tight text-ink"
          style={{
            fontFamily:
              "var(--font-display), 'Cormorant Garamond', Georgia, serif",
          }}
        >
          Your wedding week hasn't begun yet
        </h3>
        <p className="mx-auto mt-2 max-w-lg text-[14px] leading-relaxed text-ink-muted">
          Add the first event to start shaping the arc — from intimate rituals
          through to the crescendo of the ceremony.
        </p>
        {onAddEvent && (
          <button
            type="button"
            onClick={onAddEvent}
            className="mt-6 inline-flex items-center gap-1.5 rounded-md bg-ink px-4 py-2 text-[13px] font-medium text-ivory transition-colors hover:bg-ink-soft"
          >
            <Plus size={13} strokeWidth={1.8} />
            Add the first chapter
          </button>
        )}
      </section>
    );
  }

  function handleEnergyDrag(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragId || !arcRef.current) return;
    const rect = arcRef.current.getBoundingClientRect();
    const pct = ((rect.bottom - e.clientY) / rect.height) * 100;
    const clamped = Math.max(0, Math.min(100, Math.round(pct)));
    setEnergyLevel(dragId, clamped);
  }

  return (
    <section className="relative overflow-hidden rounded-xl border border-ink/10 bg-white shadow-[0_1px_3px_rgba(26,26,26,0.04)]">
      {/* ── Header ──────────────────────────────────────────────────── */}
      <header className="flex flex-col gap-2 border-b border-ink/5 px-8 pb-5 pt-7">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-saffron" aria-hidden />
          <p
            className="font-mono text-[10px] uppercase tracking-[0.18em] text-saffron"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            The arc of your week
          </p>
        </div>
        <h2
          className="font-serif text-[28px] leading-[1.15] text-ink"
          style={{
            fontFamily:
              "var(--font-display), 'Cormorant Garamond', Georgia, serif",
            fontWeight: 700,
          }}
        >
          From first gathering to final celebration
        </h2>
        <p className="max-w-2xl text-[13.5px] leading-relaxed text-ink-muted">
          {coupleContext.traditions.length
            ? "Each chapter sits on the curve by its emotional energy. Drag a marker up or down to tune how loud or quiet that moment feels."
            : "Drag a chapter marker up or down to shape the emotional curve. Click any chapter to step inside."}
        </p>
      </header>

      {/* ── Arc + markers ─────────────────────────────────────────────── */}
      <div className="px-6 pt-8 pb-6">
        <div
          ref={arcRef}
          onPointerMove={handleEnergyDrag}
          onPointerUp={() => setDragId(null)}
          onPointerLeave={() => setDragId(null)}
          className="relative h-[240px] select-none"
        >
          {/* Y-axis labels — editorial, sparing */}
          <div
            className="pointer-events-none absolute left-0 top-1 font-mono text-[9.5px] uppercase tracking-[0.18em] text-saffron"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Full celebration
          </div>
          <div
            className="pointer-events-none absolute bottom-1 left-0 font-mono text-[9.5px] uppercase tracking-[0.18em] text-ink-faint"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Quiet & intimate
          </div>

          {/* Horizon rules */}
          <div className="pointer-events-none absolute inset-x-0 top-0 border-t border-dashed border-ink/8" />
          <div className="pointer-events-none absolute inset-x-0 top-1/2 border-t border-dashed border-ink/5" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 border-t border-dashed border-ink/8" />

          {/* The arc itself */}
          <svg
            className="absolute inset-0 h-full w-full overflow-visible"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden
          >
            <defs>
              <linearGradient
                id="arcFill"
                x1="0%"
                y1="0%"
                x2="0%"
                y2="100%"
              >
                <stop offset="0%" stopColor="rgba(212,162,76,0.18)" />
                <stop offset="100%" stopColor="rgba(212,162,76,0.0)" />
              </linearGradient>
            </defs>
            {/* Filled area under the curve */}
            {arcPath && (
              <path
                d={`${arcPath} L 100 100 L 0 100 Z`}
                fill="url(#arcFill)"
                vectorEffect="non-scaling-stroke"
              />
            )}
            {arcPath && (
              <path
                d={arcPath}
                fill="none"
                stroke="rgba(184,134,11,0.55)"
                strokeWidth={1.25}
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
              />
            )}
          </svg>

          {/* Chapter markers — draggable dots */}
          {markers.map((m) => {
            const warmthSize = 14 + (m.event.energyLevel / 100) * 14;
            const dotColor =
              m.event.energyLevel >= 70
                ? "bg-saffron border-saffron shadow-[0_0_0_4px_rgba(212,162,76,0.2)]"
                : m.event.energyLevel >= 40
                  ? "bg-gold border-gold shadow-[0_0_0_3px_rgba(184,134,11,0.15)]"
                  : "bg-white border-gold/60";
            return (
              <button
                key={m.id}
                type="button"
                onPointerDown={(e) => {
                  e.preventDefault();
                  setDragId(m.id);
                }}
                onDoubleClick={() => onSelectEvent(m.id)}
                onClick={(e) => {
                  if (dragId === null) onSelectEvent(m.id);
                  e.stopPropagation();
                }}
                aria-label={`${displayNameFor(m.event)} — energy ${m.event.energyLevel} of 100`}
                title={`${displayNameFor(m.event)} — click to open`}
                className={cn(
                  "absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 transition-transform",
                  dotColor,
                  dragId === m.id
                    ? "scale-110 cursor-grabbing ring-2 ring-saffron/40"
                    : "cursor-grab hover:scale-110",
                )}
                style={{
                  left: `${m.x}%`,
                  top: `${m.y}%`,
                  width: warmthSize,
                  height: warmthSize,
                }}
              />
            );
          })}
        </div>

        {/* ── Chapter labels below the arc ──────────────────────────── */}
        <ChapterStrip
          markers={markers}
          onSelect={onSelectEvent}
          onReorder={onReorder}
          dropIndex={dropIndex}
          setDropIndex={setDropIndex}
        />
      </div>
    </section>
  );
}

// ── Chapter strip ──────────────────────────────────────────────────────
// Horizontal row of small chapter previews under the arc. Each reflects
// its marker: event name (serif), date/mono caption, guest count, palette
// strip. Reorderable via native HTML5 DnD.

function ChapterStrip({
  markers,
  onSelect,
  onReorder,
  dropIndex,
  setDropIndex,
}: {
  markers: { id: string; event: EventRecord; x: number; y: number }[];
  onSelect: (id: string) => void;
  onReorder?: (fromIndex: number, toIndex: number) => void;
  dropIndex: number | null;
  setDropIndex: (i: number | null) => void;
}) {
  return (
    <div
      className="mt-8 grid gap-3"
      style={{
        gridTemplateColumns: `repeat(${markers.length}, minmax(0, 1fr))`,
      }}
    >
      {markers.map((m, i) => (
        <ChapterMini
          key={m.id}
          event={m.event}
          index={i}
          totalCount={markers.length}
          isDropTarget={dropIndex === i}
          onClick={() => onSelect(m.id)}
          onDragStartIndex={(idx) =>
            (window as unknown as { __ev_drag?: number }).__ev_drag = idx
          }
          onDragOverIndex={(idx) => setDropIndex(idx)}
          onDropIndex={(idx) => {
            const from = (window as unknown as { __ev_drag?: number })
              .__ev_drag;
            if (onReorder && from !== undefined && from !== idx) {
              onReorder(from, idx);
            }
            (window as unknown as { __ev_drag?: number }).__ev_drag =
              undefined;
            setDropIndex(null);
          }}
        />
      ))}
    </div>
  );
}

function ChapterMini({
  event,
  index,
  totalCount,
  isDropTarget,
  onClick,
  onDragStartIndex,
  onDragOverIndex,
  onDropIndex,
}: {
  event: EventRecord;
  index: number;
  totalCount: number;
  isDropTarget: boolean;
  onClick: () => void;
  onDragStartIndex: (i: number) => void;
  onDragOverIndex: (i: number) => void;
  onDropIndex: (i: number) => void;
}) {
  const palette = resolvePaletteSwatches(event);
  const theme = event.customTheme ?? event.vibeTheme ?? "";
  const dateStr = formatShortDate(event.eventDate);

  return (
    <button
      type="button"
      draggable={totalCount > 1}
      onDragStart={() => onDragStartIndex(index)}
      onDragOver={(e) => {
        e.preventDefault();
        onDragOverIndex(index);
      }}
      onDrop={(e) => {
        e.preventDefault();
        onDropIndex(index);
      }}
      onClick={onClick}
      className={cn(
        "group relative flex flex-col gap-1.5 rounded-md border border-transparent bg-transparent px-1 pb-2 pt-1 text-left transition-colors",
        "hover:border-gold/30 hover:bg-ivory-warm/40",
        isDropTarget && "border-saffron/60 bg-saffron-pale/40",
      )}
    >
      {/* Drag handle, visible on hover */}
      {totalCount > 1 && (
        <span
          className="absolute -left-1 top-1 text-ink-faint opacity-0 transition-opacity group-hover:opacity-100"
          aria-hidden
        >
          <GripVertical size={10} strokeWidth={1.8} />
        </span>
      )}

      {/* Order number, in mono */}
      <span
        className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-ink-faint"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        Ch. {String(index + 1).padStart(2, "0")}
        {dateStr ? ` · ${dateStr}` : ""}
      </span>

      {/* Event name — serif, display font */}
      <span
        className="line-clamp-2 font-serif text-[14.5px] leading-snug text-ink"
        style={{
          fontFamily:
            "var(--font-display), 'Cormorant Garamond', Georgia, serif",
          fontWeight: 700,
        }}
      >
        {displayNameFor(event)}
      </span>

      {theme && (
        <span className="line-clamp-1 text-[11.5px] italic text-ink-muted">
          {theme}
        </span>
      )}

      {/* Meta line: guests + palette strip */}
      <span className="flex items-center gap-2">
        <span className="font-mono text-[10px] tabular-nums text-ink-faint">
          {event.guestCount || "—"} guests
        </span>
        {palette && palette.length > 0 && (
          <span className="flex h-1 flex-1 overflow-hidden rounded-sm">
            {palette.slice(0, 5).map((c, i) => (
              <span
                key={`${c.hex}-${i}`}
                style={{ backgroundColor: c.hex }}
                className="flex-1"
              />
            ))}
          </span>
        )}
      </span>
    </button>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────

function resolvePaletteSwatches(e: EventRecord): PaletteSwatch[] | null {
  if (e.customPalette) return e.customPalette;
  if (e.paletteId) {
    const p = PALETTE_LIBRARY.find((x) => x.id === e.paletteId);
    return p?.colors ?? null;
  }
  return null;
}

function formatShortDate(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}
