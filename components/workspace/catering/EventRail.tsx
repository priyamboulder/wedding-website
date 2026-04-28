"use client";

// ── Menu Studio event rail ────────────────────────────────────────────────
// Left column of the Menu Studio. Vertical timeline of wedding events.
// Each row shows: icon + label + date, guest count, cuisine direction,
// service style, and a pending-edit indicator if the AI has queued
// suggestions for that event.

import { cn } from "@/lib/utils";
import type { MenuEvent } from "@/types/catering";

interface EventRailProps {
  events: MenuEvent[];
  selectedId: string | null;
  pendingCounts: Record<string, number>;
  dishCounts: Record<string, number>;
  onSelect: (event_id: string) => void;
}

export function EventRail({
  events,
  selectedId,
  pendingCounts,
  dishCounts,
  onSelect,
}: EventRailProps) {
  return (
    <aside className="flex h-full flex-col border-r border-gold/15 bg-ivory-warm/30">
      <header className="border-b border-gold/15 px-5 py-4">
        <p
          className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-saffron"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Wedding events
        </p>
        <p className="mt-1 text-[12px] leading-snug text-ink-muted">
          {events.length} event{events.length === 1 ? "" : "s"}, food-relevant order.
        </p>
      </header>

      <ol className="flex-1 overflow-y-auto px-3 py-3">
        {events.map((e) => {
          const active = e.id === selectedId;
          const pending = pendingCounts[e.id] ?? 0;
          const dishes = dishCounts[e.id] ?? 0;
          return (
            <li key={e.id}>
              <button
                type="button"
                onClick={() => onSelect(e.id)}
                aria-current={active ? "true" : undefined}
                className={cn(
                  "group relative mb-1 flex w-full items-start gap-3 rounded-md px-3 py-3 text-left transition-colors",
                  active
                    ? "bg-white shadow-[0_1px_1px_rgba(26,26,26,0.04)] ring-1 ring-gold/25"
                    : "hover:bg-white/70",
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 flex h-7 w-7 flex-none items-center justify-center rounded-md text-[14px]",
                    active
                      ? "bg-saffron-pale/70 text-saffron"
                      : "bg-ivory text-ink-muted",
                  )}
                  aria-hidden
                >
                  {e.icon ?? "•"}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span
                      className={cn(
                        "truncate font-serif text-[15px] leading-tight",
                        active ? "text-ink" : "text-ink",
                      )}
                    >
                      {e.label}
                    </span>
                    {pending > 0 && (
                      <span
                        className="flex-none rounded-full bg-saffron/90 px-1.5 py-0.5 font-mono text-[9px] font-medium leading-none text-white"
                        style={{ fontFamily: "var(--font-mono)" }}
                        aria-label={`${pending} pending edits`}
                      >
                        {pending}
                      </span>
                    )}
                  </span>
                  <span
                    className="mt-1 flex items-center gap-1.5 font-mono text-[9.5px] uppercase tracking-[0.1em] text-ink-faint"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    <span>{formatDate(e.date)}</span>
                    <span aria-hidden>·</span>
                    <span>{e.guest_count} guests</span>
                    <span aria-hidden>·</span>
                    <span>{dishes} dish{dishes === 1 ? "" : "es"}</span>
                  </span>
                  <span className="mt-1.5 block truncate text-[12px] text-ink-muted">
                    {e.cuisine_direction}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </aside>
  );
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso + "T00:00:00");
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  } catch {
    return iso;
  }
}
