"use client";

// ── Events workspace canvas ──────────────────────────────────────────────
// Reimagined as a story-first canvas:
//   · default view → StoryCanvas (hero title, narrative arc, chapter cards)
//   · ?event=<id>   → EventDetailView (per-event tabs live in here)
//   · ?discovery=1  → 8-step Program Discovery quiz (unchanged)
//
// The old left-rail event list, standalone Energy Arc chart, and page-level
// tab bar have been removed. Tasks & logistics moved to a demoted strip
// anchored at the bottom of the viewport.

import { useCallback, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEventsStore } from "@/stores/events-store";
import { EVENT_TYPE_OPTIONS } from "@/lib/events-seed";
import type { EventType } from "@/types/events";
import { normalizeEventRecord } from "@/lib/events/normalize";
import type { EventTabId } from "@/lib/workspace/events-completion";
import { StoryCanvas } from "./StoryCanvas";
import { EventDetailView } from "./EventDetailView";
import { ProgramDiscoveryQuiz } from "./ProgramDiscoveryQuiz";
import { EventsTasksDrawer } from "./EventsTasksDrawer";

const EVENT_QUERY_KEY = "event";
const TAB_QUERY_KEY = "tab";
const DISCOVERY_QUERY_KEY = "discovery";

export function EventsWorkspaceCanvas() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const events = useEventsStore((s) => s.events);
  const addEvent = useEventsStore((s) => s.addEvent);
  const reorderEvents = useEventsStore((s) => s.reorderEvents);

  const discovery = searchParams.get(DISCOVERY_QUERY_KEY) === "1";
  const eventParam = searchParams.get(EVENT_QUERY_KEY);
  const tabParam = searchParams.get(TAB_QUERY_KEY);

  const activeEventId = useMemo(() => {
    if (!eventParam) return null;
    return events.some((e) => e.id === eventParam) ? eventParam : null;
  }, [eventParam, events]);

  const activeTab = useMemo<EventTabId>(() => {
    const allowed: EventTabId[] = ["vibe", "attire", "guest", "brief"];
    return (allowed as string[]).includes(tabParam ?? "")
      ? (tabParam as EventTabId)
      : "vibe";
  }, [tabParam]);

  const setQuery = useCallback(
    (next: {
      event?: string | null;
      tab?: EventTabId | null;
      discovery?: boolean;
    }) => {
      const params = new URLSearchParams(searchParams.toString());
      if (next.event !== undefined) {
        if (next.event) params.set(EVENT_QUERY_KEY, next.event);
        else params.delete(EVENT_QUERY_KEY);
      }
      if (next.tab !== undefined) {
        if (next.tab) params.set(TAB_QUERY_KEY, next.tab);
        else params.delete(TAB_QUERY_KEY);
      }
      if (next.discovery !== undefined) {
        if (next.discovery) params.set(DISCOVERY_QUERY_KEY, "1");
        else params.delete(DISCOVERY_QUERY_KEY);
      }
      const qs = params.toString();
      router.replace(`/workspace/events${qs ? `?${qs}` : ""}`, {
        scroll: false,
      });
    },
    [router, searchParams],
  );

  // Bounce the URL back to story view if the pinned event disappears.
  useEffect(() => {
    if (eventParam && !events.some((e) => e.id === eventParam)) {
      setQuery({ event: null, tab: null });
    }
  }, [eventParam, events, setQuery]);

  const activeEvent = useMemo(() => {
    const raw = events.find((e) => e.id === activeEventId);
    return raw ? normalizeEventRecord(raw) : null;
  }, [events, activeEventId]);

  function handleReorder(fromIndex: number, toIndex: number) {
    if (fromIndex === toIndex) return;
    const sorted = [...events].sort((a, b) => a.sortOrder - b.sortOrder);
    const moved = sorted[fromIndex];
    if (!moved) return;
    const rest = sorted.filter((_, i) => i !== fromIndex);
    rest.splice(toIndex, 0, moved);
    reorderEvents(rest.map((e) => e.id));
  }

  function handleAddEvent() {
    // If we already have events, send the couple into Discovery for a
    // richer "design a chapter" flow. Only fall back to a single default
    // insert when the canvas is completely empty.
    if (events.length === 0) {
      const fallback: EventType = "ceremony";
      if (EVENT_TYPE_OPTIONS.some((o) => o.id === fallback)) {
        addEvent(fallback);
        return;
      }
    }
    setQuery({ discovery: true });
  }

  // ── Discovery overlay ─────────────────────────────────────────────
  if (discovery) {
    return (
      <main className="flex flex-1 flex-col overflow-y-auto bg-white">
        <ProgramDiscoveryQuiz
          onExit={() => setQuery({ discovery: false })}
          onFinish={() => setQuery({ discovery: false })}
        />
      </main>
    );
  }

  // ── Event detail view ─────────────────────────────────────────────
  if (activeEvent) {
    return (
      <>
        <EventDetailView
          event={activeEvent}
          siblings={events.map(normalizeEventRecord)}
          activeTab={activeTab}
          onChangeTab={(t) => setQuery({ tab: t })}
          onBackToStory={() => setQuery({ event: null, tab: null })}
          onSelectEvent={(id) => setQuery({ event: id })}
        />
        <EventsTasksDrawer />
      </>
    );
  }

  // ── Story canvas (default) ────────────────────────────────────────
  return (
    <>
      <StoryCanvas
        onSelectEvent={(id) => setQuery({ event: id, tab: "vibe" })}
        onAddEvent={handleAddEvent}
        onRetakeDiscovery={() => setQuery({ discovery: true })}
        onReorder={handleReorder}
      />
      <EventsTasksDrawer />
    </>
  );
}
