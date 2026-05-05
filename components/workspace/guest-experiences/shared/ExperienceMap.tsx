"use client";

// ── Shared Experience Map ──────────────────────────────────────────────────
// Per-event tabs across the top; loved/maybe items appear under the events
// their tags suggest. Couple toggles each item on/off per event.
//
// Used in both the guided journey (Session 3) and the full workspace's
// Discover & Dream tab. Reads/writes the same store, so changes sync
// across modes.

import { useMemo, useState } from "react";
import { ChevronDown, MapPin, Plus, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  EXPERIENCE_CATALOG,
  EXPERIENCE_EVENT_CHIPS,
  type ExperienceEvent,
} from "@/lib/guest-experiences/experience-catalog";
import { useGuestExperiencesStore } from "@/stores/guest-experiences-store";

export function ExperienceMap() {
  const [activeEvent, setActiveEvent] = useState<ExperienceEvent>("sangeet");
  const reactions = useGuestExperiencesStore((s) => s.cards);
  const toggleEvent = useGuestExperiencesStore((s) => s.toggleEventAssignment);
  const customCards = useGuestExperiencesStore((s) => s.customCards);
  const aiSuggestions = useGuestExperiencesStore((s) => s.aiSuggestions);

  const loved = useMemo(() => {
    const catalog = EXPERIENCE_CATALOG.filter((c) => {
      const r = reactions[c.id];
      return r?.reaction === "love" || r?.reaction === "maybe";
    });
    const ai = aiSuggestions
      .filter((s) => {
        const r = reactions[s.id];
        return r?.reaction === "love" || r?.reaction === "maybe";
      })
      .map((s) => ({
        id: s.id,
        name: s.name,
        description: s.description,
        image_url: s.image_url,
        suggested_events: s.suggested_events,
      }));
    const custom = customCards.map((c) => ({
      id: c.id,
      name: c.name,
      description: c.description,
      image_url: "",
      suggested_events: c.suggested_events,
    }));
    return [...catalog, ...ai, ...custom];
  }, [reactions, customCards, aiSuggestions]);

  const assignedToEvent = loved.filter((card) => {
    const r = reactions[card.id];
    const assigned = r?.event_assignments ?? card.suggested_events;
    return assigned.includes(activeEvent);
  });

  const activeLabel =
    EXPERIENCE_EVENT_CHIPS.find((c) => c.id === activeEvent)?.label ?? "this event";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1.5">
        {EXPERIENCE_EVENT_CHIPS.map((chip) => (
          <button
            key={chip.id}
            type="button"
            onClick={() => setActiveEvent(chip.id)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] transition-colors",
              activeEvent === chip.id
                ? "border-saffron bg-saffron/10 text-saffron"
                : "border-border bg-white text-ink-muted hover:border-saffron/40 hover:text-saffron",
            )}
          >
            <MapPin size={11} strokeWidth={1.8} />
            {chip.label}
          </button>
        ))}
      </div>

      {loved.length === 0 ? (
        <div className="rounded-md border border-dashed border-border bg-ivory-warm/30 px-6 py-10 text-center text-[13px] text-ink-muted">
          Love a few ideas in the Explorer and they'll start showing up here by event.
        </div>
      ) : assignedToEvent.length === 0 ? (
        <div className="rounded-md border border-dashed border-border bg-white px-6 py-10 text-center text-[13px] text-ink-muted">
          This event feels empty. Add experiences from the list below or react
          to more ideas in the Explorer.
        </div>
      ) : (
        <ul className="space-y-2">
          {assignedToEvent.map((card) => (
            <li
              key={card.id}
              className="flex items-center gap-3 rounded-md border border-border bg-white px-3 py-2"
            >
              {card.image_url ? (
                <div
                  className="h-10 w-10 shrink-0 rounded bg-cover bg-center"
                  style={{ backgroundImage: `url(${card.image_url})` }}
                />
              ) : (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-ivory-warm">
                  <Sparkles size={14} className="text-saffron" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium text-ink">
                  {card.name}
                </p>
                <p className="truncate text-[11.5px] text-ink-muted">
                  {card.description}
                </p>
              </div>
              <button
                type="button"
                onClick={() => toggleEvent(card.id, activeEvent)}
                className="shrink-0 rounded-md border border-border px-2 py-1 text-[11px] text-ink-muted transition-colors hover:border-rose/40 hover:text-rose"
                aria-label={`Remove ${card.name} from ${activeLabel}`}
              >
                Remove from event
              </button>
            </li>
          ))}
        </ul>
      )}

      {loved.length > 0 && (
        <ToggleUnassignedRow
          loved={loved}
          activeEvent={activeEvent}
          activeLabel={activeLabel}
          reactions={reactions}
        />
      )}
    </div>
  );
}

function ToggleUnassignedRow({
  loved,
  activeEvent,
  activeLabel,
  reactions,
}: {
  loved: { id: string; name: string; suggested_events: ExperienceEvent[] }[];
  activeEvent: ExperienceEvent;
  activeLabel: string;
  reactions: Record<string, { event_assignments: ExperienceEvent[] } | undefined>;
}) {
  const toggleEvent = useGuestExperiencesStore((s) => s.toggleEventAssignment);
  const [open, setOpen] = useState(false);

  const unassigned = loved.filter((card) => {
    const assigned = reactions[card.id]?.event_assignments ?? card.suggested_events;
    return !assigned.includes(activeEvent);
  });

  if (unassigned.length === 0) return null;

  return (
    <div className="rounded-md border border-border bg-ivory-warm/20">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-3 py-2 text-left"
      >
        <span className="text-[12px] text-ink-muted">
          Add others to <span className="font-medium text-ink">{activeLabel}</span>{" "}
          ({unassigned.length} not yet here)
        </span>
        <ChevronDown
          size={13}
          className={cn(
            "text-ink-faint transition-transform",
            open && "rotate-180",
          )}
        />
      </button>
      {open && (
        <ul className="divide-y divide-border border-t border-border">
          {unassigned.map((card) => (
            <li
              key={card.id}
              className="flex items-center justify-between px-3 py-1.5"
            >
              <span className="truncate text-[12.5px] text-ink">{card.name}</span>
              <button
                type="button"
                onClick={() => toggleEvent(card.id, activeEvent)}
                className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[11px] text-ink-muted transition-colors hover:border-saffron/40 hover:text-saffron"
              >
                <Plus size={10} /> Add
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
