"use client";

// ── Shared horizontal scope + events switcher ─────────────────────────────
// Replaces the inner left-sidebar pattern used by vendor workspace tabs
// (Photography Shot List first; applicable to any tab with an orthogonal
// scope filter composed with a chronological event axis).

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export type ScopeItem<K extends string = string> = {
  key: K;
  label: string;
  count: number;
};

export type EventItem<K extends string = string> = {
  key: K;
  name: string;
  date?: string;
  progress: { done: number; total: number };
};

export interface WorkspaceScopeAndEventsProps<
  S extends string = string,
  E extends string = string,
> {
  scopes: ScopeItem<S>[];
  events: EventItem<E>[];
  activeScope: S;
  activeEvent: E;
  onScopeChange: (key: S) => void;
  onEventChange: (key: E) => void;
  // Scope key that signals the event axis should be dimmed (e.g., "all"
  // means the event filter is de-emphasized but still clickable).
  dimEventsOnScope?: S;
  className?: string;
  ariaLabelScopes?: string;
  ariaLabelEvents?: string;
  // Background preset under the sticky event chip row so that content
  // scrolling under it is fully hidden, and the fade-mask edges bleed
  // into the same color. Default matches vendor workspace white pane.
  chipRowBg?: "white" | "ivory";
  // When set, a trailing "+ Add" button appears at the end of the event
  // chip row and invokes this callback.
  onAddEvent?: () => void;
  addEventLabel?: string;
}

const CHIP_ROW_BG_PRESETS: Record<
  NonNullable<WorkspaceScopeAndEventsProps["chipRowBg"]>,
  { bg: string; fadeFrom: string }
> = {
  white: { bg: "bg-white", fadeFrom: "from-white" },
  ivory: { bg: "bg-ivory", fadeFrom: "from-ivory" },
};

export function WorkspaceScopeAndEvents<
  S extends string = string,
  E extends string = string,
>({
  scopes,
  events,
  activeScope,
  activeEvent,
  onScopeChange,
  onEventChange,
  dimEventsOnScope,
  className,
  ariaLabelScopes = "Scope filter",
  ariaLabelEvents = "Events",
  chipRowBg = "white",
  onAddEvent,
  addEventLabel = "Add event",
}: WorkspaceScopeAndEventsProps<S, E>) {
  const eventsDimmed = dimEventsOnScope !== undefined && activeScope === dimEventsOnScope;
  const bgPreset = CHIP_ROW_BG_PRESETS[chipRowBg];

  return (
    <div className={cn("workspace-scope-and-events", className)}>
      <ScopeSegmentedControl
        scopes={scopes}
        activeScope={activeScope}
        onScopeChange={onScopeChange}
        ariaLabel={ariaLabelScopes}
      />
      <EventChipRow
        events={events}
        activeEvent={activeEvent}
        onEventChange={onEventChange}
        dimmed={eventsDimmed}
        ariaLabel={ariaLabelEvents}
        bgClass={bgPreset.bg}
        fadeFromClass={bgPreset.fadeFrom}
        onAddEvent={onAddEvent}
        addEventLabel={addEventLabel}
      />
    </div>
  );
}

// ── Scope segmented control ───────────────────────────────────────────────

function ScopeSegmentedControl<S extends string>({
  scopes,
  activeScope,
  onScopeChange,
  ariaLabel,
}: {
  scopes: ScopeItem<S>[];
  activeScope: S;
  onScopeChange: (key: S) => void;
  ariaLabel: string;
}) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className="flex h-9 w-full items-stretch gap-1 rounded-md border border-gold/15 bg-ivory-warm/30 p-0.5"
    >
      {scopes.map((s) => {
        const active = s.key === activeScope;
        return (
          <button
            key={s.key}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onScopeChange(s.key)}
            className={cn(
              "group inline-flex flex-1 items-center justify-center gap-2 rounded-[5px] px-3 text-[11.5px] uppercase tracking-[0.14em] transition-colors duration-150",
              active
                ? "bg-ink text-ivory"
                : "bg-transparent text-ink-muted hover:bg-ivory-warm/80 hover:text-ink-soft",
            )}
          >
            <span className="font-serif normal-case tracking-normal text-[12.5px] leading-none">
              {s.label}
            </span>
            <span
              className={cn(
                "font-mono text-[10.5px] tabular-nums leading-none",
                active ? "text-ivory/75" : "text-ink-faint",
              )}
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {s.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ── Event chip row ────────────────────────────────────────────────────────

function EventChipRow<E extends string>({
  events,
  activeEvent,
  onEventChange,
  dimmed,
  ariaLabel,
  bgClass,
  fadeFromClass,
  onAddEvent,
  addEventLabel,
}: {
  events: EventItem<E>[];
  activeEvent: E;
  onEventChange: (key: E) => void;
  dimmed: boolean;
  ariaLabel: string;
  bgClass: string;
  fadeFromClass: string;
  onAddEvent?: () => void;
  addEventLabel: string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const chipRefs = useRef<Map<E, HTMLButtonElement>>(new Map());
  const [fadeLeft, setFadeLeft] = useState(false);
  const [fadeRight, setFadeRight] = useState(false);

  const updateFades = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setFadeLeft(el.scrollLeft > 4);
    setFadeRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useLayoutEffect(() => {
    updateFades();
  }, [events, updateFades]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handler = () => updateFades();
    el.addEventListener("scroll", handler, { passive: true });
    window.addEventListener("resize", handler);
    return () => {
      el.removeEventListener("scroll", handler);
      window.removeEventListener("resize", handler);
    };
  }, [updateFades]);

  // Scroll the active chip into view on change (useful after keyboard nav).
  useEffect(() => {
    const chip = chipRefs.current.get(activeEvent);
    if (chip && scrollRef.current) {
      const container = scrollRef.current;
      const chipLeft = chip.offsetLeft;
      const chipRight = chipLeft + chip.offsetWidth;
      const viewLeft = container.scrollLeft;
      const viewRight = viewLeft + container.clientWidth;
      if (chipLeft < viewLeft) {
        container.scrollTo({ left: chipLeft - 24, behavior: "smooth" });
      } else if (chipRight > viewRight) {
        container.scrollTo({
          left: chipRight - container.clientWidth + 24,
          behavior: "smooth",
        });
      }
    }
  }, [activeEvent]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      const idx = events.findIndex((ev) => ev.key === activeEvent);
      if (idx === -1) return;
      const nextIdx = e.key === "ArrowRight" ? idx + 1 : idx - 1;
      const next = events[nextIdx];
      if (!next) return;
      e.preventDefault();
      onEventChange(next.key);
      // Focus the chip so subsequent arrow presses keep navigating.
      requestAnimationFrame(() => chipRefs.current.get(next.key)?.focus());
    },
    [events, activeEvent, onEventChange],
  );

  return (
    <div
      className={cn(
        "sticky top-0 z-20 relative mt-3 pt-2 pb-2 transition-opacity duration-200",
        bgClass,
        dimmed && "opacity-40",
      )}
    >
      {/* Fade masks */}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r to-transparent transition-opacity duration-150",
          fadeFromClass,
          fadeLeft ? "opacity-100" : "opacity-0",
        )}
      />
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l to-transparent transition-opacity duration-150",
          fadeFromClass,
          fadeRight ? "opacity-100" : "opacity-0",
        )}
      />

      <div
        ref={scrollRef}
        role="tablist"
        aria-label={ariaLabel}
        onKeyDown={handleKeyDown}
        className="workspace-event-chip-scroll flex items-stretch gap-5 overflow-x-auto pb-1 -mx-1 px-1"
      >
        {events.map((ev) => {
          const active = ev.key === activeEvent;
          const done = ev.progress.done;
          const total = ev.progress.total;
          return (
            <button
              key={ev.key}
              ref={(node) => {
                if (node) chipRefs.current.set(ev.key, node);
                else chipRefs.current.delete(ev.key);
              }}
              type="button"
              role="tab"
              aria-selected={active}
              tabIndex={active ? 0 : -1}
              onClick={() => onEventChange(ev.key)}
              className={cn(
                "relative shrink-0 py-1.5 text-left transition-colors duration-150 outline-none",
                active ? "text-ink" : "text-ink-muted hover:text-ink-soft",
              )}
            >
              <div className="flex items-baseline gap-2">
                <span
                  className={cn(
                    "font-serif text-[14px] leading-none",
                    active ? "font-semibold" : "font-medium",
                  )}
                >
                  {ev.name}
                </span>
                <span
                  className="font-mono text-[10px] tabular-nums text-ink-faint leading-none"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {done}/{total}
                </span>
              </div>
              {ev.date && (
                <div
                  className="mt-1 font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-faint leading-none"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {ev.date}
                </div>
              )}
              <span
                aria-hidden
                className={cn(
                  "absolute -bottom-px left-0 right-0 h-[2px] rounded-full transition-opacity duration-150",
                  active ? "bg-gold opacity-100" : "bg-transparent opacity-0",
                )}
              />
            </button>
          );
        })}
        {onAddEvent && (
          <button
            type="button"
            onClick={onAddEvent}
            className="shrink-0 inline-flex items-center gap-1 self-center rounded-md border border-dashed border-gold/40 bg-gold-pale/10 px-2.5 py-1 font-serif text-[12.5px] text-gold transition-colors hover:bg-gold-pale/25 hover:border-gold/60"
          >
            <Plus size={12} strokeWidth={2} />
            {addEventLabel}
          </button>
        )}
      </div>
    </div>
  );
}
