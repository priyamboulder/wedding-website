"use client";

// ── EventFilterBar ────────────────────────────────────────────────────────
// Sticky filter row across every Music tab: All · Haldi · Mehendi ·
// Sangeet · Ceremony & Lunch · Reception. Multi-select allowed. "All"
// is a virtual chip — selecting it clears the selection set.
//
// This primitive is purely presentation: tabs own the filter state and
// the selectors that apply it to their item list.

import { cn } from "@/lib/utils";
import { MUSIC_EVENTS, type MusicEventId } from "@/types/music";

export interface EventFilterBarProps {
  // Ids currently selected. Empty = All. Non-empty = AND-filter on tag.
  selected: MusicEventId[];
  onChange: (next: MusicEventId[]) => void;
  // Optional count per event — rendered as a tiny tabular number on the
  // chip. Undefined counts are simply omitted.
  counts?: Partial<Record<MusicEventId, number>>;
  className?: string;
  // Sticky positioning opt-out — tabs that place the bar inside a
  // scrolling container where sticky would break layout can turn it off.
  sticky?: boolean;
}

export function EventFilterBar({
  selected,
  onChange,
  counts,
  className,
  sticky = true,
}: EventFilterBarProps) {
  const isAll = selected.length === 0;

  function toggle(id: MusicEventId) {
    if (id === "all") {
      onChange([]);
      return;
    }
    const set = new Set(selected.filter((s) => s !== "all"));
    if (set.has(id)) set.delete(id);
    else set.add(id);
    onChange(Array.from(set) as MusicEventId[]);
  }

  return (
    <div
      className={cn(
        "z-10 -mx-3 flex items-center gap-1.5 overflow-x-auto border-b border-gold/15 bg-ivory/90 px-3 py-2 backdrop-blur workspace-event-chip-scroll",
        sticky && "sticky top-0",
        className,
      )}
      role="tablist"
      aria-label="Filter by event"
    >
      {MUSIC_EVENTS.map((ev) => {
        const active = ev.id === "all" ? isAll : selected.includes(ev.id);
        const count = counts?.[ev.id];
        return (
          <button
            key={ev.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => toggle(ev.id)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] transition-colors",
              active
                ? "border-ink bg-ink text-ivory"
                : "border-border bg-white text-ink-muted hover:border-gold/40 hover:text-ink",
            )}
          >
            <span>{ev.label}</span>
            {count != null && (
              <span
                className={cn(
                  "font-mono tabular-nums",
                  active ? "text-ivory/80" : "text-ink-faint",
                )}
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ── Helper: does an item match the filter? ───────────────────────────────
// Callers with a `events` field on their items can use this instead of
// re-implementing the All-vs-subset logic.
export function matchesEventFilter(
  itemEvents: MusicEventId[] | undefined,
  selected: MusicEventId[],
): boolean {
  if (selected.length === 0) return true;
  if (!itemEvents || itemEvents.length === 0) return false;
  return selected.some((s) => s !== "all" && itemEvents.includes(s));
}
