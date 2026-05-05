"use client";

// ── Journey Step 2 · Shape your celebrations ────────────────────────────
//
// Visual menu of common South Asian event types. Tapping a card adds
// it to the couple's program (events store). Selected events expand
// inline with three editable bits: name (pre-filled with a creative
// suggestion), vibe tags, and per-event guest count.

import { useMemo, useState } from "react";
import { Check, Sparkles, X } from "lucide-react";
import { useEventsStore } from "@/stores/events-store";
import { EVENT_PROMPTS, VIBE_TAGS, type VibeTag } from "@/lib/journey/event-prompts";
import type { EventType, EventRecord } from "@/types/events";
import { cn } from "@/lib/utils";

interface Step2Props {
  done: boolean;
  active: boolean;
}

export function JourneyStep2Events({ done, active }: Step2Props) {
  const events = useEventsStore((s) => s.events);
  const addEvent = useEventsStore((s) => s.addEvent);
  const removeEvent = useEventsStore((s) => s.removeEvent);
  const updateEvent = useEventsStore((s) => s.updateEvent);
  const setEventGuestCount = useEventsStore((s) => s.setEventGuestCount);

  const selectedTypes = useMemo(() => new Set(events.map((e) => e.type)), [events]);

  const eventByType = useMemo(() => {
    const map = new Map<EventType, EventRecord>();
    events.forEach((e) => {
      if (!map.has(e.type)) map.set(e.type, e);
    });
    return map;
  }, [events]);

  // Done collapsed
  if (done && !active) {
    const totalGuestPeak = Math.max(0, ...events.map((e) => e.guestCount ?? 0));
    return (
      <p className="text-[13.5px] text-[color:var(--dash-text)]">
        {events.length} celebration{events.length === 1 ? "" : "s"}
        {totalGuestPeak > 0 && (
          <span className="ml-2 text-[color:var(--dash-text-muted)]">
            · up to {totalGuestPeak.toLocaleString()} guests at the largest
          </span>
        )}
      </p>
    );
  }

  return (
    <div className="space-y-5">
      <p
        className="font-serif text-[15px] italic leading-relaxed text-[color:var(--dash-text-muted)]"
        style={{
          fontFamily:
            "var(--font-display), 'Cormorant Garamond', Georgia, serif",
        }}
      >
        A South Asian wedding is a series of moments. Tap the ones that are
        part of yours — name them, set the vibe, give each a rough headcount.
      </p>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {EVENT_PROMPTS.map((prompt) => {
          const selected = selectedTypes.has(prompt.type);
          const existing = eventByType.get(prompt.type);
          return (
            <EventChoice
              key={prompt.type}
              type={prompt.type}
              label={prompt.label}
              tagline={prompt.tagline}
              defaultName={prompt.defaultName}
              defaultGuestCount={prompt.defaultGuestCount}
              selected={selected}
              event={existing}
              onAdd={() => {
                addEvent(prompt.type, prompt.defaultName);
                // Find the newly-added event by type and seed the guest
                // count. addEvent doesn't return the new id, so we fetch
                // it from the store synchronously.
                const fresh = useEventsStore
                  .getState()
                  .events.find((e) => e.type === prompt.type);
                if (fresh) setEventGuestCount(fresh.id, prompt.defaultGuestCount);
              }}
              onRemove={() => existing && removeEvent(existing.id)}
              onRename={(name) =>
                existing && updateEvent(existing.id, { customName: name || null })
              }
              onSetGuests={(n) =>
                existing && setEventGuestCount(existing.id, n)
              }
              onToggleVibe={(tag) => {
                if (!existing) return;
                const current = (existing.vibeLabel ?? "")
                  .split(" · ")
                  .map((s) => s.trim())
                  .filter(Boolean);
                const next = current.includes(tag)
                  ? current.filter((t) => t !== tag)
                  : [...current, tag];
                updateEvent(existing.id, { vibeLabel: next.join(" · ") });
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

interface EventChoiceProps {
  type: EventType;
  label: string;
  tagline: string;
  defaultName: string;
  defaultGuestCount: number;
  selected: boolean;
  event?: EventRecord;
  onAdd: () => void;
  onRemove: () => void;
  onRename: (name: string) => void;
  onSetGuests: (n: number) => void;
  onToggleVibe: (tag: VibeTag) => void;
}

function EventChoice({
  label,
  tagline,
  defaultName,
  defaultGuestCount,
  selected,
  event,
  onAdd,
  onRemove,
  onRename,
  onSetGuests,
  onToggleVibe,
}: EventChoiceProps) {
  return (
    <div
      className={cn(
        "rounded-[6px] border p-3 transition-colors",
        selected
          ? "border-[color:var(--dash-blush)] bg-[color:var(--dash-blush-light)]"
          : "border-[color:var(--dash-blush-soft)] bg-[color:var(--dash-canvas)] hover:border-[color:var(--dash-blush)]",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p
            className="font-serif text-[16px] leading-tight text-[color:var(--dash-text)]"
            style={{
              fontFamily:
                "var(--font-display), 'Cormorant Garamond', Georgia, serif",
              fontWeight: 500,
            }}
          >
            {label}
          </p>
          <p
            className="mt-0.5 font-serif text-[12.5px] italic leading-snug text-[color:var(--dash-text-muted)]"
            style={{
              fontFamily:
                "var(--font-display), 'Cormorant Garamond', Georgia, serif",
            }}
          >
            {tagline}
          </p>
        </div>
        {selected ? (
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Remove ${label}`}
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[color:var(--dash-blush)] text-white hover:bg-[color:var(--dash-blush-deep)]"
          >
            <Check size={12} strokeWidth={2.5} />
          </button>
        ) : (
          <button
            type="button"
            onClick={onAdd}
            aria-label={`Add ${label}`}
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[color:var(--dash-blush-soft)] text-[color:var(--dash-blush-deep)] hover:border-[color:var(--dash-blush)] hover:bg-[color:var(--dash-canvas)]"
          >
            <Sparkles size={11} strokeWidth={1.8} />
          </button>
        )}
      </div>

      {selected && event && (
        <div className="mt-3 space-y-2 border-t border-[color:rgba(45,45,45,0.06)] pt-2.5">
          <div className="flex items-center gap-2">
            <span
              className="w-14 shrink-0 text-[10px] uppercase tracking-[0.18em] text-[color:var(--dash-text-faint)]"
              style={{ fontFamily: "var(--font-mono)", fontWeight: 500 }}
            >
              Name
            </span>
            <input
              type="text"
              defaultValue={event.customName ?? defaultName}
              onBlur={(e) => onRename(e.target.value)}
              className="dash-input flex-1 text-[13px]"
              placeholder={defaultName}
            />
          </div>

          <div className="flex items-center gap-2">
            <span
              className="w-14 shrink-0 text-[10px] uppercase tracking-[0.18em] text-[color:var(--dash-text-faint)]"
              style={{ fontFamily: "var(--font-mono)", fontWeight: 500 }}
            >
              Guests
            </span>
            <input
              type="number"
              min={0}
              max={5000}
              defaultValue={event.guestCount ?? defaultGuestCount}
              onBlur={(e) => {
                const n = parseInt(e.target.value, 10);
                if (!Number.isNaN(n)) onSetGuests(Math.max(0, Math.min(5000, n)));
              }}
              className="dash-input w-24 text-[13px] tabular-nums"
            />
          </div>

          <div className="flex items-start gap-2">
            <span
              className="mt-1 w-14 shrink-0 text-[10px] uppercase tracking-[0.18em] text-[color:var(--dash-text-faint)]"
              style={{ fontFamily: "var(--font-mono)", fontWeight: 500 }}
            >
              Vibe
            </span>
            <div className="flex flex-1 flex-wrap gap-1">
              {VIBE_TAGS.map((tag) => {
                const active = (event.vibeLabel ?? "").includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => onToggleVibe(tag)}
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10.5px] transition-colors",
                      active
                        ? "bg-[color:var(--dash-blush)] text-white"
                        : "bg-[color:var(--dash-canvas)] text-[color:var(--dash-text-muted)] border border-[color:var(--dash-blush-soft)] hover:border-[color:var(--dash-blush)]",
                    )}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
