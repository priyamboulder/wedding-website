"use client";

// ── EditableBrief ───────────────────────────────────────────────────────
// A full main-column section for the couple's foundational decisions.
// Editorial 2-column grid (varied col-spans, magazine-style) of
// rose-tinted tiles on the white canvas. Click any value to edit in
// place. Story spans the full row at the bottom.

import { useEffect, useRef, useState } from "react";
import { ChevronDown, X } from "lucide-react";
import { useEventsStore } from "@/stores/events-store";
import { useDashboardJourneyStore } from "@/stores/dashboard-journey-store";
import { moodById } from "@/lib/journey/mood-palettes";
import {
  EVENT_TYPE_OPTIONS,
  PALETTE_LIBRARY,
  PRIORITY_OPTIONS,
  TRADITION_OPTIONS,
} from "@/lib/events-seed";
import type { EventRecord, Priority, Tradition } from "@/types/events";
import { cn } from "@/lib/utils";

function programLine(events: EventRecord[]): string {
  if (events.length === 0) return "";
  return events
    .map(
      (e) =>
        e.customName?.trim() ||
        EVENT_TYPE_OPTIONS.find((o) => o.id === e.type)?.name ||
        e.type,
    )
    .join(" · ");
}

interface PaletteFromBrief {
  source: "journey-mood" | "journey-custom" | "events";
  label: string | null;
  swatches: { hex: string; key: string }[];
}

function paletteForBrief(
  events: EventRecord[],
  selectedMoodId: string | null,
  customPalette: string[] | null,
): PaletteFromBrief {
  // 1) Journey Step 3 mood selection wins — that's the most explicit choice.
  if (selectedMoodId) {
    const mood = moodById(selectedMoodId);
    if (mood) {
      return {
        source: "journey-mood",
        label: mood.name,
        swatches: mood.colors.map((c, i) => ({
          hex: c.hex,
          key: `mood-${i}-${c.hex}`,
        })),
      };
    }
  }
  // 2) Journey custom palette built in Step 3.
  if (customPalette && customPalette.length > 0) {
    return {
      source: "journey-custom",
      label: "Custom palette",
      swatches: customPalette.map((hex, i) => ({
        hex,
        key: `custom-${i}-${hex}`,
      })),
    };
  }
  // 3) Fall back to event-level palettes.
  const seen = new Set<string>();
  const swatches: { hex: string; key: string }[] = [];
  for (const e of events) {
    const palette = e.paletteId
      ? PALETTE_LIBRARY.find((p) => p.id === e.paletteId)
      : null;
    const colors = palette?.colors ?? e.customPalette ?? [];
    for (const c of colors) {
      if (!seen.has(c.hex)) {
        seen.add(c.hex);
        swatches.push({ hex: c.hex, key: `${e.id}-${c.hex}` });
      }
    }
    if (swatches.length >= 8) break;
  }
  return {
    source: "events",
    label: null,
    swatches: swatches.slice(0, 8),
  };
}

export function EditableBrief() {
  const events = useEventsStore((s) => s.events);
  const coupleContext = useEventsStore((s) => s.coupleContext);
  const setTraditions = useEventsStore((s) => s.setTraditions);
  const setTotalGuestCount = useEventsStore((s) => s.setTotalGuestCount);
  const setStoryText = useEventsStore((s) => s.setStoryText);
  const setPriorityRanking = useEventsStore((s) => s.setPriorityRanking);

  const selectedMoodId = useDashboardJourneyStore((s) => s.selectedMoodId);
  const customPalette = useDashboardJourneyStore((s) => s.customPalette);
  const palette = paletteForBrief(events, selectedMoodId, customPalette);
  const paletteHint =
    palette.source === "journey-mood" || palette.source === "journey-custom"
      ? "From your journey"
      : "Pulled from your events";

  return (
    <section>
      <div className="mb-5">
        <h2 className="dash-spread-title">
          The <em>brief</em>
        </h2>
        <p className="dash-spread-sub">
          The decisions that shape everything else. Tap any field to edit.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-6">
        <Tile label="Program" hint="From your events" cols="md:col-span-3">
          <p className="text-[13.5px] leading-relaxed text-[color:var(--dash-text)]">
            {programLine(events) || (
              <span className="italic text-[color:var(--dash-text-faint)]">
                Add events above to populate.
              </span>
            )}
          </p>
        </Tile>

        <Tile label="Traditions" cols="md:col-span-2">
          <TraditionsField
            value={coupleContext.traditions}
            onChange={setTraditions}
          />
        </Tile>

        <Tile label="Guests" cols="md:col-span-1">
          <NumberField
            value={coupleContext.totalGuestCount}
            min={0}
            max={10000}
            onSave={(n) => setTotalGuestCount(n)}
            ariaLabel="Total guest count"
          />
        </Tile>

        <Tile label="Palette" hint={paletteHint} cols="md:col-span-3">
          {palette.swatches.length === 0 ? (
            <p className="text-[13px] italic text-[color:var(--dash-text-faint)]">
              Pick a palette in Journey Step 3 (Find your palette).
            </p>
          ) : (
            <div className="mt-1 flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                {palette.swatches.map((s) => (
                  <span
                    key={s.key}
                    aria-hidden
                    title={s.hex}
                    style={{ backgroundColor: s.hex }}
                    className="inline-block h-6 w-6 rounded-full ring-1 ring-[color:rgba(45,45,45,0.06)] shadow-[0_1px_2px_rgba(212,165,165,0.18)]"
                  />
                ))}
              </div>
              {palette.label && (
                <span className="text-[12px] italic text-[color:var(--dash-text-muted)]">
                  {palette.label}
                </span>
              )}
            </div>
          )}
        </Tile>

        <Tile label="Top priorities" cols="md:col-span-3">
          <PrioritiesField
            ranking={coupleContext.priorityRanking}
            onChange={setPriorityRanking}
          />
        </Tile>

        <Tile label="Your story" cols="md:col-span-6">
          <StoryField
            value={coupleContext.storyText}
            onSave={setStoryText}
          />
        </Tile>
      </div>
    </section>
  );
}

function Tile({
  label,
  children,
  hint,
  cols,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
  cols?: string;
}) {
  return (
    <div className={cn("dash-brief-tile group", cols)}>
      <div className="flex items-baseline justify-between gap-2">
        <p className="dash-brief-tile__label">{label}</p>
        {hint && (
          <span className="text-[10px] italic text-[color:var(--dash-text-faint)]">
            {hint}
          </span>
        )}
      </div>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

// ── Field primitives ────────────────────────────────────────────────────

function NumberField({
  value,
  onSave,
  min,
  max,
  ariaLabel,
}: {
  value: number;
  onSave: (n: number) => void;
  min?: number;
  max?: number;
  ariaLabel?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!editing) setDraft(String(value));
  }, [value, editing]);
  useEffect(() => {
    if (editing && ref.current) {
      ref.current.focus();
      ref.current.select();
    }
  }, [editing]);

  const commit = () => {
    const n = parseInt(draft, 10);
    if (!Number.isNaN(n)) {
      const clamped = Math.max(min ?? -Infinity, Math.min(max ?? Infinity, n));
      if (clamped !== value) onSave(clamped);
    }
    setEditing(false);
  };

  if (editing) {
    return (
      <input
        ref={ref}
        type="number"
        inputMode="numeric"
        value={draft}
        min={min}
        max={max}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit();
          else if (e.key === "Escape") setEditing(false);
        }}
        aria-label={ariaLabel}
        className="dash-input font-serif text-[20px] font-medium text-[color:var(--dash-text)]"
        style={{
          fontFamily:
            "var(--font-display), 'Cormorant Garamond', Georgia, serif",
        }}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      aria-label={ariaLabel}
      className="dash-editable font-serif text-[20px] font-medium leading-none text-[color:var(--dash-text)]"
      style={{
        fontFamily:
          "var(--font-display), 'Cormorant Garamond', Georgia, serif",
      }}
    >
      {value.toLocaleString()}
    </button>
  );
}

function StoryField({
  value,
  onSave,
}: {
  value: string;
  onSave: (next: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!editing) setDraft(value);
  }, [value, editing]);
  useEffect(() => {
    if (editing && ref.current) ref.current.focus();
  }, [editing]);

  const commit = () => {
    if (draft !== value) onSave(draft);
    setEditing(false);
  };

  if (editing) {
    return (
      <textarea
        ref={ref}
        value={draft}
        rows={3}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            setDraft(value);
            setEditing(false);
          }
        }}
        aria-label="Your story"
        className="w-full resize-none rounded-[4px] border border-[color:var(--dash-blush)] bg-[color:var(--dash-canvas)] px-3 py-2 text-[15px] italic leading-relaxed text-[color:var(--dash-text)] focus:outline-none"
        style={{
          fontFamily:
            "var(--font-display), 'Cormorant Garamond', Georgia, serif",
        }}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      aria-label="Edit your story"
      className={cn(
        "dash-editable block w-full text-left font-serif text-[15px] italic leading-relaxed",
        value
          ? "text-[color:var(--dash-text)]"
          : "text-[color:var(--dash-text-faint)]",
      )}
      style={{
        fontFamily:
          "var(--font-display), 'Cormorant Garamond', Georgia, serif",
      }}
    >
      {value.trim() ||
        "How did you meet? What's your vibe? What matters most? Add a sentence or two."}
    </button>
  );
}

function TraditionsField({
  value,
  onChange,
}: {
  value: Tradition[];
  onChange: (next: Tradition[]) => void;
}) {
  const [open, setOpen] = useState(false);

  const labels = value
    .map((t) => TRADITION_OPTIONS.find((o) => o.id === t)?.name ?? t)
    .join(", ");

  const toggle = (id: Tradition) => {
    if (value.includes(id)) onChange(value.filter((t) => t !== id));
    else onChange([...value, id]);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="dash-editable flex w-full items-center justify-between gap-2 text-left text-[13.5px] text-[color:var(--dash-text)]"
      >
        <span
          className={
            value.length === 0
              ? "italic text-[color:var(--dash-text-faint)]"
              : ""
          }
        >
          {labels || "Add traditions"}
        </span>
        <ChevronDown
          size={12}
          className="shrink-0 text-[color:var(--dash-text-faint)]"
        />
      </button>
      {open && (
        <Popover onClose={() => setOpen(false)}>
          <div className="grid grid-cols-2 gap-1">
            {TRADITION_OPTIONS.map((opt) => {
              const active = value.includes(opt.id);
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => toggle(opt.id)}
                  className={cn(
                    "rounded-[4px] px-2 py-1 text-left text-[12px] transition-colors",
                    active
                      ? "bg-[color:var(--dash-blush)] text-white"
                      : "text-[color:var(--dash-text)] hover:bg-[color:var(--dash-blush-light)]",
                  )}
                >
                  {opt.name}
                </button>
              );
            })}
          </div>
        </Popover>
      )}
    </div>
  );
}

function PrioritiesField({
  ranking,
  onChange,
}: {
  ranking: Priority[];
  onChange: (next: Priority[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const top3 = ranking.slice(0, 3);

  const promote = (p: Priority) => {
    const without = ranking.filter((r) => r !== p);
    onChange([p, ...without]);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="dash-editable flex w-full items-center justify-between gap-2 text-left"
      >
        <span className="flex flex-wrap gap-1">
          {top3.length === 0 ? (
            <span className="italic text-[13px] text-[color:var(--dash-text-faint)]">
              Tap to set
            </span>
          ) : (
            top3.map((p) => (
              <span key={p} className="dash-pill">
                {PRIORITY_OPTIONS.find((o) => o.id === p)?.name ?? p}
              </span>
            ))
          )}
        </span>
        <ChevronDown
          size={12}
          className="shrink-0 text-[color:var(--dash-text-faint)]"
        />
      </button>
      {open && (
        <Popover onClose={() => setOpen(false)}>
          <p
            className="mb-2 text-[10px] uppercase tracking-[0.18em] text-[color:var(--dash-text-faint)]"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Tap to promote to top 3
          </p>
          <div className="flex flex-col gap-1">
            {ranking.map((p, i) => {
              const opt = PRIORITY_OPTIONS.find((o) => o.id === p);
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => promote(p)}
                  className={cn(
                    "flex items-center justify-between rounded-[4px] px-2 py-1 text-[12px] transition-colors",
                    i < 3
                      ? "bg-[color:var(--dash-blush-light)] text-[color:var(--dash-blush-deep)]"
                      : "text-[color:var(--dash-text)] hover:bg-[color:var(--dash-blush-light)]",
                  )}
                >
                  <span>{opt?.name ?? p}</span>
                  <span
                    className="font-mono text-[10px] text-[color:var(--dash-text-faint)]"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    #{i + 1}
                  </span>
                </button>
              );
            })}
          </div>
        </Popover>
      )}
    </div>
  );
}

function Popover({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("keydown", esc);
    };
  }, [onClose]);
  return (
    <div
      ref={ref}
      className="popover-enter absolute left-0 right-0 top-full z-30 mt-1 rounded-[4px] border border-[color:var(--dash-blush-soft)] bg-[color:var(--dash-canvas)] p-2 shadow-lg"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute right-1 top-1 text-[color:var(--dash-text-faint)] hover:text-[color:var(--dash-text)]"
      >
        <X size={12} />
      </button>
      <div className="mt-2">{children}</div>
    </div>
  );
}
