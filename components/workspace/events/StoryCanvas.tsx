"use client";

// ── Story Canvas ─────────────────────────────────────────────────────────
// Default Events view (no event pinned). Renders inside EventsWorkspaceShell
// so the page header, action bar, and visual rhythm match the Photography
// workspace. Body carries the narrative timeline, program brief, and the
// editorial chapter cards.

import { useMemo } from "react";
import { CalendarDays, Plus, Sparkles } from "lucide-react";
import { useEventsStore } from "@/stores/events-store";
import { normalizeEventRecord } from "@/lib/events/normalize";
import {
  EventsWorkspaceShell,
  type EventsShellAction,
} from "./EventsWorkspaceShell";
import { NarrativeTimeline } from "./NarrativeTimeline";
import { ChapterCards } from "./ChapterCards";
import { ProgramBriefBlock } from "./ProgramBriefBlock";

interface Props {
  onSelectEvent: (id: string) => void;
  onAddEvent?: () => void;
  onRetakeDiscovery?: () => void;
  onReorder?: (fromIndex: number, toIndex: number) => void;
}

export function StoryCanvas({
  onSelectEvent,
  onAddEvent,
  onRetakeDiscovery,
  onReorder,
}: Props) {
  const events = useEventsStore((s) => s.events);
  const coupleContext = useEventsStore((s) => s.coupleContext);
  const setProgramBrief = useEventsStore((s) => s.setProgramBrief);

  const sorted = useMemo(
    () =>
      [...events]
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map(normalizeEventRecord),
    [events],
  );

  const weekSummary = useMemo(() => {
    if (sorted.length === 0) return null;
    const firstDate = sorted.find((e) => e.eventDate)?.eventDate ?? null;
    const lastDate =
      [...sorted].reverse().find((e) => e.eventDate)?.eventDate ?? null;
    const guestPeak = Math.max(0, ...sorted.map((e) => e.guestCount || 0));
    return { firstDate, lastDate, guestPeak };
  }, [sorted]);

  const subline = weekSummary
    ? `${formatWeekSpan(weekSummary.firstDate, weekSummary.lastDate)}${
        weekSummary.guestPeak > 0
          ? ` — building to ${weekSummary.guestPeak} guests at its peak.`
          : ""
      }`
    : "The story of your wedding week";

  const actions: EventsShellAction[] = [];
  if (onRetakeDiscovery) {
    actions.push({
      icon: <Sparkles size={13} strokeWidth={1.8} />,
      label: "Reshape program",
      onClick: onRetakeDiscovery,
    });
  }
  if (onAddEvent) {
    actions.push({
      icon: <Plus size={13} strokeWidth={1.8} />,
      label: "Add chapter",
      primary: true,
      onClick: onAddEvent,
    });
  }

  return (
    <EventsWorkspaceShell
      eyebrow="Workspace · Events"
      title="Events"
      titleIcon={CalendarDays}
      subline={subline}
    >
      <div className="flex flex-col gap-10">
        <ProgramBriefBlock
          value={coupleContext.programBrief}
          onChange={setProgramBrief}
          placeholder="From the first intimate gathering to the final celebration — in your own words."
        />

        <NarrativeTimeline
          events={sorted}
          onSelectEvent={onSelectEvent}
          onAddEvent={onAddEvent}
          onReorder={onReorder}
        />

        <ChapterCards events={sorted} onSelectEvent={onSelectEvent} />
      </div>
    </EventsWorkspaceShell>
  );
}

function formatWeekSpan(
  firstIso: string | null,
  lastIso: string | null,
): string {
  if (!firstIso && !lastIso) return "Your story is still taking shape.";
  const first = firstIso ? new Date(firstIso) : null;
  const last = lastIso ? new Date(lastIso) : null;
  const fmt = (d: Date) =>
    d.toLocaleDateString(undefined, {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  if (first && last && first.getTime() !== last.getTime()) {
    return `From ${fmt(first)} through ${fmt(last)}`;
  }
  if (first) return `Beginning ${fmt(first)}`;
  if (last) return `Culminating on ${fmt(last)}`;
  return "Your story is still taking shape.";
}
