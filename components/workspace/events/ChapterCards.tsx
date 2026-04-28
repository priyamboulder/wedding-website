"use client";

// ── Chapter Cards ────────────────────────────────────────────────────────
// The editorial lookbook below the narrative timeline. Each event is a
// rich chapter card — hero mood wash from its palette, serif title,
// italic theme line, at-a-glance attributes, and a "Continue crafting"
// CTA. Replaces the old three-up grid with a single-column magazine feel
// that matches the Photography workspace's editorial rhythm.

import { useMemo } from "react";
import {
  ArrowRight,
  Calendar,
  Flame,
  Palette as PaletteIcon,
  Pencil,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  EVENT_TYPE_OPTIONS,
  PALETTE_LIBRARY,
} from "@/lib/events-seed";
import type { EventRecord, PaletteSwatch } from "@/types/events";
import { completionFor } from "@/lib/workspace/events-completion";
import { displayNameFor } from "./event-display";

interface Props {
  events: EventRecord[];
  onSelectEvent: (id: string) => void;
}

export function ChapterCards({ events, onSelectEvent }: Props) {
  const sorted = useMemo(
    () => [...events].sort((a, b) => a.sortOrder - b.sortOrder),
    [events],
  );

  if (sorted.length === 0) return null;

  return (
    <section>
      <header className="mb-5 flex items-end justify-between gap-4 border-b border-ink/5 pb-3">
        <div>
          <p
            className="font-mono text-[10px] uppercase tracking-[0.18em] text-gold"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            The chapters
          </p>
          <h2
            className="mt-1.5 font-serif text-[26px] leading-tight text-ink"
            style={{
              fontFamily:
                "var(--font-display), 'Cormorant Garamond', Georgia, serif",
              fontWeight: 700,
            }}
          >
            Step inside any moment
          </h2>
        </div>
        <p className="hidden max-w-md text-right text-[12.5px] italic text-ink-muted md:block">
          Each card is a chapter waiting to be shaped. Open one to define its
          vibe, palette, attire, and the feeling it leaves on your guests.
        </p>
      </header>

      <div className="flex flex-col gap-5">
        {sorted.map((event, i) => (
          <ChapterCard
            key={event.id}
            event={event}
            chapterIndex={i}
            onSelect={() => onSelectEvent(event.id)}
          />
        ))}
      </div>
    </section>
  );
}

function ChapterCard({
  event,
  chapterIndex,
  onSelect,
}: {
  event: EventRecord;
  chapterIndex: number;
  onSelect: () => void;
}) {
  const palette = resolvePaletteSwatches(event);
  const completion = completionFor(event);
  const typeOption = EVENT_TYPE_OPTIONS.find((o) => o.id === event.type);
  const creativeName = displayNameFor(event);
  const theme = event.customTheme ?? event.vibeTheme ?? "";
  const dateStr = formatLongDate(event.eventDate);
  const energyLabel = energyLabelFor(event.energyLevel);
  const moodGradient = gradientFromPalette(palette);

  const statusLabel =
    completion.state === "complete"
      ? "Well-defined"
      : completion.state === "partial"
        ? "In progress"
        : "Untouched";
  const statusColor =
    completion.state === "complete"
      ? "text-saffron"
      : completion.state === "partial"
        ? "text-gold"
        : "text-ink-faint";
  const ctaLabel =
    completion.state === "empty"
      ? "Define this chapter"
      : completion.state === "partial"
        ? "Continue crafting"
        : "Open chapter";

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-xl border border-ink/10 bg-white text-left",
        "shadow-[0_1px_2px_rgba(26,26,26,0.03)] transition-all",
        "hover:-translate-y-0.5 hover:border-gold/50 hover:shadow-[0_8px_24px_rgba(26,26,26,0.06)]",
      )}
    >
      {/* ── Hero mood band ─────────────────────────────────────────── */}
      <div
        className="relative h-36 w-full"
        style={{ background: moodGradient }}
      >
        {/* Palette strip — sits at the bottom of the hero */}
        {palette && palette.length > 0 && (
          <div className="absolute inset-x-0 bottom-0 flex h-1.5">
            {palette.slice(0, 5).map((c, i) => (
              <span
                key={`${c.hex}-${i}`}
                style={{ backgroundColor: c.hex }}
                className="flex-1"
              />
            ))}
          </div>
        )}

        {/* Chapter eyebrow overlaid on the band */}
        <div className="absolute left-6 top-5">
          <span
            className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink/60"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Chapter {String(chapterIndex + 1).padStart(2, "0")}
            {typeOption ? ` · ${typeOption.name}` : ""}
          </span>
        </div>

        {/* Energy glyph in the opposite corner */}
        <div className="absolute right-6 top-5 inline-flex items-center gap-1.5 rounded-full bg-white/70 px-2.5 py-1 backdrop-blur-sm">
          <Flame
            size={11}
            strokeWidth={1.8}
            className={energyIconClass(event.energyLevel)}
          />
          <span
            className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-soft"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {energyLabel}
          </span>
        </div>
      </div>

      {/* ── Body ───────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 px-7 pb-6 pt-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h3
              className="font-serif text-[30px] leading-[1.08] text-ink"
              style={{
                fontFamily:
                  "var(--font-display), 'Cormorant Garamond', Georgia, serif",
                fontWeight: 700,
                letterSpacing: "-0.005em",
              }}
            >
              {creativeName}
            </h3>
            {theme ? (
              <p className="mt-2 max-w-2xl font-serif text-[15.5px] italic leading-relaxed text-ink-muted">
                {theme}
              </p>
            ) : (
              <p className="mt-2 max-w-2xl text-[13.5px] italic leading-relaxed text-ink-faint">
                No story yet — open this chapter to write its one-line mood.
              </p>
            )}
          </div>

          <span
            className={cn(
              "shrink-0 font-mono text-[10px] uppercase tracking-[0.18em]",
              statusColor,
            )}
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {statusLabel}
          </span>
        </div>

        {/* Attribute row */}
        <dl className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-ink/5 pt-4 text-[12.5px] text-ink-muted">
          <Attr icon={<Calendar size={12} strokeWidth={1.6} />}>
            {dateStr || <span className="italic text-ink-faint">Date TBD</span>}
          </Attr>
          <Attr icon={<Users size={12} strokeWidth={1.6} />}>
            {event.guestCount
              ? `${event.guestCount} guests`
              : <span className="italic text-ink-faint">Guest count TBD</span>}
          </Attr>
          <Attr icon={<PaletteIcon size={12} strokeWidth={1.6} />}>
            {palette
              ? event.paletteInherits
                ? "Shared wedding palette"
                : "Its own palette"
              : <span className="italic text-ink-faint">Palette undefined</span>}
          </Attr>
          {event.formality && (
            <Attr icon={<Pencil size={12} strokeWidth={1.6} />}>
              {event.formality.replace(/_/g, " ")}
            </Attr>
          )}
        </dl>

        <div className="flex items-center justify-between border-t border-ink/5 pt-4">
          <span
            className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-ink-faint"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Vibe · Attire · Guest Feel · Brief
          </span>
          <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-soft transition-colors group-hover:text-saffron">
            {ctaLabel}
            <ArrowRight
              size={13}
              strokeWidth={1.8}
              className="transition-transform group-hover:translate-x-0.5"
            />
          </span>
        </div>
      </div>
    </button>
  );
}

function Attr({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="text-ink-faint">{icon}</span>
      <span>{children}</span>
    </span>
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

function gradientFromPalette(palette: PaletteSwatch[] | null): string {
  if (!palette || palette.length === 0) {
    return "linear-gradient(135deg, #FBFAF7 0%, #F5F1E8 60%, #F0E4C8 100%)";
  }
  const cols = palette.slice(0, 4).map((c) => c.hex);
  if (cols.length === 1) {
    return `linear-gradient(135deg, ${cols[0]}22 0%, ${cols[0]}55 100%)`;
  }
  // Layered washes — soft-light so the hero band feels editorial, not neon.
  const stops = cols
    .map((c, i) => {
      const pct = Math.round((i / (cols.length - 1)) * 100);
      return `${c}${i === 0 ? "55" : i === cols.length - 1 ? "33" : "40"} ${pct}%`;
    })
    .join(", ");
  return `linear-gradient(120deg, ${stops})`;
}

function formatLongDate(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function energyLabelFor(energy: number): string {
  if (energy >= 80) return "Full celebration";
  if (energy >= 60) return "Warm & alive";
  if (energy >= 40) return "Gathered";
  if (energy >= 20) return "Soft & personal";
  return "Intimate";
}

function energyIconClass(energy: number): string {
  if (energy >= 75) return "fill-saffron text-saffron";
  if (energy >= 45) return "text-gold";
  return "text-ink-faint";
}
