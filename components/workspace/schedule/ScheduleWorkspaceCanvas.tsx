"use client";

// ── ScheduleWorkspaceCanvas ────────────────────────────────────────────────
// The right-hand canvas for /workspace/schedule. Owns:
//   · event picker (which event's timeline are we looking at)
//   · view switcher (timeline / day overview / vendor / photo / music / live)
//   · AI draft flow
//   · conflict panel
//   · orchestrates mutations through lib/schedule/data.ts
//
// The per-item editing lives in TimelineRow + TimelineDetailDrawer. The
// sibling components here render each view mode.

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Calendar as CalendarIcon,
  Camera,
  LayoutGrid,
  List,
  Music,
  Rows,
  Send,
  Sparkles,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useEventsStore } from "@/stores/events-store";
import { useScheduleStore } from "@/stores/schedule-store";
import { normalizeEventRecord } from "@/lib/events/normalize";
import { draftScheduleForEvent } from "@/lib/schedule/ai-draft";
import {
  buildVendorExport,
  getAllDaySchedules,
  getCrossEventConflicts,
  getScheduleForEvent,
  getPhotoShotList,
  getMusicCueSheet,
  replaceScheduleForEvent,
  saveScheduleItem,
} from "@/lib/schedule/data";
import { detectConflicts, countBySeverity } from "@/lib/schedule/conflicts";
import { resolveTimelineTimes } from "@/lib/schedule/resolver";
import type { EventRecord } from "@/types/events";
import type { ScheduleItem } from "@/types/schedule";
import { ScheduleTimeline, TimelineEmptyState } from "./ScheduleTimeline";
import { ScheduleDayOverview } from "./ScheduleDayOverview";
import { ScheduleVendorExport } from "./ScheduleVendorExport";
import { ConflictPanel } from "./ConflictPanel";
import { PhotoShotList } from "./PhotoShotList";
import { MusicCueSheet } from "./MusicCueSheet";
import { DayOfTracker } from "./DayOfTracker";
import { ParallelTrackView } from "./ParallelTrackView";

type ViewMode =
  | "timeline"
  | "day"
  | "vendor"
  | "photos"
  | "music"
  | "tracks"
  | "live";

export function ScheduleWorkspaceCanvas() {
  const rawEvents = useEventsStore((s) => s.events);
  const coupleContext = useEventsStore((s) => s.coupleContext);
  const allItems = useScheduleStore((s) => s.items);

  const events = useMemo(
    () =>
      rawEvents
        .slice()
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map(normalizeEventRecord),
    [rawEvents],
  );

  const [activeEventId, setActiveEventId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("timeline");
  const [focusedItemId, setFocusedItemId] = useState<string | null>(null);
  const [, setTick] = useState(0);
  const bump = useCallback(() => setTick((t) => t + 1), []);

  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  useEffect(() => {
    if (activeEventId) return;
    if (events.length === 0) return;
    setActiveEventId(events[0].id);
  }, [activeEventId, events]);

  useEffect(() => {
    if (!activeEventId) return;
    if (events.some((e) => e.id === activeEventId)) return;
    setActiveEventId(events[0]?.id ?? null);
  }, [activeEventId, events]);

  const activeEvent = useMemo<EventRecord | null>(
    () => events.find((e) => e.id === activeEventId) ?? null,
    [events, activeEventId],
  );

  const activeItems = useMemo<ScheduleItem[]>(() => {
    if (!activeEventId) return [];
    return allItems
      .filter((i) => i.eventId === activeEventId)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }, [allItems, activeEventId]);

  const conflicts = useMemo(() => {
    if (!activeEvent) return [];
    const sameDayOther = activeEvent.eventDate
      ? allItems.filter(
          (i) =>
            i.eventId !== activeEvent.id &&
            events.some(
              (e) =>
                e.id === i.eventId && e.eventDate === activeEvent.eventDate,
            ),
        )
      : [];
    return detectConflicts({
      items: activeItems,
      sameDayOtherEventItems: sameDayOther,
      eveningCutoff: "00:30",
    });
  }, [activeEvent, activeItems, allItems, events]);

  const conflictCounts = countBySeverity(conflicts);

  const daySummaries = useMemo(
    () =>
      activeEvent?.eventDate ? getAllDaySchedules(activeEvent.eventDate) : [],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeEvent?.eventDate, allItems, events],
  );

  const crossEventConflicts = useMemo(
    () =>
      activeEvent?.eventDate
        ? getCrossEventConflicts(activeEvent.eventDate)
        : [],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeEvent?.eventDate, allItems, events],
  );

  const vendorExport = useMemo(
    () => (activeEventId ? buildVendorExport(activeEventId) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeEventId, allItems],
  );

  const unassignedItems = useMemo(
    () =>
      activeItems.filter(
        (i) => i.vendorIds.length === 0 && i.assignedTo.length === 0,
      ),
    [activeItems],
  );

  const photoItems = useMemo(
    () => (activeEventId ? getPhotoShotList(activeEventId) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeEventId, allItems],
  );

  const musicItems = useMemo(
    () => (activeEventId ? getMusicCueSheet(activeEventId) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeEventId, allItems],
  );

  function handleDraft() {
    if (!activeEvent) return;
    const drafted = draftScheduleForEvent({
      event: activeEvent,
      traditions: coupleContext.traditions,
    });
    if (drafted.length > 0) {
      replaceScheduleForEvent(activeEvent.id, drafted);
      bump();
    }
  }

  function handleStartBlank() {
    if (!activeEvent) return;
    replaceScheduleForEvent(activeEvent.id, []);
    bump();
  }

  function handleAutoFix() {
    if (!activeEvent) return;
    const current = getScheduleForEvent(activeEvent.id);
    const resolved = resolveTimelineTimes(current);
    replaceScheduleForEvent(activeEvent.id, resolved);
    bump();
  }

  function handleMarkStatus(id: string, status: ScheduleItem["status"]) {
    const item = activeItems.find((i) => i.id === id);
    if (!item) return;
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");
    const stamp = `${hh}:${mm}`;
    saveScheduleItem({
      ...item,
      status,
      actualStartTime:
        status === "completed" && !item.actualStartTime
          ? item.startTime
          : item.actualStartTime,
      actualEndTime: status === "completed" ? stamp : item.actualEndTime,
    });
    bump();
  }

  if (!hydrated) {
    return <main className="flex flex-1 flex-col bg-white" />;
  }

  if (events.length === 0) {
    return <EventsRequiredState />;
  }

  if (!activeEvent) {
    return <main className="flex flex-1 flex-col bg-white" />;
  }

  return (
    <main className="flex flex-1 flex-col overflow-hidden bg-white">
      <Header
        events={events}
        activeEventId={activeEvent.id}
        onSelectEvent={(id) => setActiveEventId(id)}
        viewMode={viewMode}
        onChangeView={setViewMode}
        conflictCounts={conflictCounts}
        onAutoFix={handleAutoFix}
        hasItems={activeItems.length > 0}
      />

      <div className="flex-1 overflow-y-auto bg-white">
        {viewMode === "day" ? (
          <ScheduleDayOverview
            date={
              activeEvent.eventDate ?? new Date().toISOString().slice(0, 10)
            }
            events={daySummaries}
            allItems={allItems}
            crossEventConflicts={crossEventConflicts}
            onExpand={(id) => {
              setActiveEventId(id);
              setViewMode("timeline");
            }}
          />
        ) : viewMode === "vendor" ? (
          <ScheduleVendorExport
            entries={vendorExport}
            unassignedItems={unassignedItems}
            eventLabel={eventLabelFor(activeEvent)}
            eventDate={activeEvent.eventDate ?? null}
            venueName={activeEvent.venueName ?? null}
          />
        ) : viewMode === "photos" ? (
          <PhotoShotList
            items={photoItems}
            eventLabel={eventLabelFor(activeEvent)}
          />
        ) : viewMode === "music" ? (
          <MusicCueSheet
            items={musicItems}
            eventLabel={eventLabelFor(activeEvent)}
          />
        ) : viewMode === "tracks" ? (
          <ParallelTrackView
            items={activeItems}
            onSelect={(id) => {
              setFocusedItemId(id);
              setViewMode("timeline");
            }}
          />
        ) : viewMode === "live" ? (
          <DayOfTracker
            items={activeItems}
            onMarkStatus={handleMarkStatus}
            onChange={bump}
          />
        ) : activeItems.length === 0 ? (
          <TimelineEmptyState
            eventLabel={eventLabelFor(activeEvent)}
            onDraft={handleDraft}
            onStartBlank={handleStartBlank}
          />
        ) : (
          <div className="mx-auto w-full max-w-3xl px-6 py-6">
            {activeItems.some((i) => i.isAiDraft) && (
              <DraftBanner
                traditionLabel={traditionLabel(coupleContext.traditions)}
                eventLabel={eventLabelFor(activeEvent)}
                onReDraft={handleDraft}
                onAccept={() => {
                  for (const item of activeItems) {
                    if (item.isAiDraft) {
                      saveScheduleItem({ ...item, isAiDraft: false });
                    }
                  }
                  bump();
                }}
              />
            )}
            <ConflictPanel
              conflicts={conflicts}
              onJump={(id) => {
                setFocusedItemId(id);
                // Clear after a tick so repeated jumps re-trigger the scroll.
                window.setTimeout(() => setFocusedItemId(null), 1200);
              }}
            />
            <ScheduleTimeline
              eventId={activeEvent.id}
              items={activeItems}
              conflicts={conflicts}
              onChange={bump}
              focusedItemId={focusedItemId}
            />
          </div>
        )}
      </div>
    </main>
  );
}

// ── Header (event picker + view switcher) ──────────────────────────────────

function Header({
  events,
  activeEventId,
  onSelectEvent,
  viewMode,
  onChangeView,
  conflictCounts,
  onAutoFix,
  hasItems,
}: {
  events: EventRecord[];
  activeEventId: string;
  onSelectEvent: (id: string) => void;
  viewMode: ViewMode;
  onChangeView: (v: ViewMode) => void;
  conflictCounts: { hard: number; soft: number; info: number };
  onAutoFix: () => void;
  hasItems: boolean;
}) {
  return (
    <header className="border-b border-border bg-white px-6 pb-4 pt-6">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <p className="section-eyebrow">SCHEDULE</p>
          <h1 className="section-title mt-1">Day-of timelines</h1>
          <p className="section-description mt-1.5">
            Minute-by-minute plans per event. When one thing shifts,
            everything downstream updates automatically.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {hasItems && (
            <button
              type="button"
              onClick={onAutoFix}
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-white px-3 py-1.5 text-[12px] text-ink-muted hover:border-ink-faint hover:text-ink"
            >
              <Sparkles size={12} strokeWidth={1.6} />
              Auto-fix timing
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <EventChipRow
          events={events}
          activeEventId={activeEventId}
          onSelect={onSelectEvent}
        />
        <div className="flex items-center gap-2">
          {(conflictCounts.hard > 0 || conflictCounts.soft > 0) && (
            <span
              className={cn(
                "rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em]",
                conflictCounts.hard > 0
                  ? "bg-rose-pale/60 text-rose"
                  : "bg-gold-pale/60 text-ink-soft",
              )}
            >
              {conflictCounts.hard > 0 &&
                `${conflictCounts.hard} hard${
                  conflictCounts.soft > 0
                    ? `, ${conflictCounts.soft} soft`
                    : ""
                }`}
              {conflictCounts.hard === 0 &&
                conflictCounts.soft > 0 &&
                `${conflictCounts.soft} suggestion${
                  conflictCounts.soft === 1 ? "" : "s"
                }`}
            </span>
          )}
          <ViewSwitcher viewMode={viewMode} onChange={onChangeView} />
        </div>
      </div>
    </header>
  );
}

function EventChipRow({
  events,
  activeEventId,
  onSelect,
}: {
  events: EventRecord[];
  activeEventId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="workspace-event-chip-scroll flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto">
      {events.map((e) => {
        const active = e.id === activeEventId;
        return (
          <button
            key={e.id}
            type="button"
            onClick={() => onSelect(e.id)}
            className={cn(
              "shrink-0 rounded-full border px-3 py-1 text-[12px] font-medium transition-colors",
              active
                ? "border-ink bg-ink text-ivory"
                : "border-border bg-white text-ink-muted hover:border-ink-faint hover:text-ink",
            )}
          >
            {eventLabelFor(e)}
          </button>
        );
      })}
    </div>
  );
}

function ViewSwitcher({
  viewMode,
  onChange,
}: {
  viewMode: ViewMode;
  onChange: (v: ViewMode) => void;
}) {
  const modes: { id: ViewMode; icon: typeof List; label: string }[] = [
    { id: "timeline", icon: List, label: "Timeline" },
    { id: "day", icon: LayoutGrid, label: "Day" },
    { id: "vendor", icon: Send, label: "Vendor" },
    { id: "tracks", icon: Rows, label: "Tracks" },
    { id: "photos", icon: Camera, label: "Photo" },
    { id: "music", icon: Music, label: "Music" },
    { id: "live", icon: Clock, label: "Day-of" },
  ];
  return (
    <div className="inline-flex items-center gap-0.5 rounded-md border border-border bg-white p-0.5">
      {modes.map((m) => {
        const Icon = m.icon;
        const active = viewMode === m.id;
        return (
          <button
            key={m.id}
            type="button"
            onClick={() => onChange(m.id)}
            className={cn(
              "inline-flex items-center gap-1 rounded px-2 py-1 text-[11.5px] font-medium transition-colors",
              active
                ? "bg-ivory-warm text-ink"
                : "text-ink-muted hover:bg-ivory-warm/60 hover:text-ink",
            )}
            aria-pressed={active}
          >
            <Icon size={12} strokeWidth={1.6} />
            <span className="hidden md:inline">{m.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function DraftBanner({
  traditionLabel,
  eventLabel,
  onReDraft,
  onAccept,
}: {
  traditionLabel: string;
  eventLabel: string;
  onReDraft: () => void;
  onAccept: () => void;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-md border border-gold/30 bg-gold-pale/40 px-4 py-2.5 text-[12.5px]">
      <span className="flex items-center gap-2 text-ink-soft">
        <Sparkles size={12} strokeWidth={1.6} className="text-gold" />
        This is a draft based on {traditionLabel} wedding traditions for your{" "}
        {eventLabel}. Adjust any timing — when one item moves, dependent
        items shift automatically.
      </span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onReDraft}
          className="shrink-0 rounded-md border border-border bg-white px-2.5 py-1 text-[11.5px] text-ink-muted hover:border-ink-faint hover:text-ink"
        >
          Re-draft
        </button>
        <button
          type="button"
          onClick={onAccept}
          className="shrink-0 rounded-md bg-ink px-2.5 py-1 text-[11.5px] font-medium text-ivory hover:bg-ink-soft"
        >
          Accept draft
        </button>
      </div>
    </div>
  );
}

function EventsRequiredState() {
  return (
    <main className="flex flex-1 items-center justify-center bg-white px-6 py-12">
      <div className="max-w-lg rounded-xl border border-border bg-white px-10 py-12 text-center">
        <p className="section-eyebrow">SCHEDULE</p>
        <h2 className="section-title mt-2">Add your events first.</h2>
        <p className="section-description mx-auto mt-2">
          The schedule is built per event — once you've added Haldi,
          Mehndi, your ceremony and so on in the Events workspace, come
          back here to map out each one minute by minute.
        </p>
        <div className="mt-6 flex items-center justify-center gap-2">
          <a
            href="/workspace/events"
            className="inline-flex items-center gap-1.5 rounded-md bg-ink px-4 py-2 text-[13px] font-medium text-ivory hover:bg-ink-soft"
          >
            <CalendarIcon size={13} strokeWidth={1.6} />
            Go to Events
          </a>
        </div>
      </div>
    </main>
  );
}

function eventLabelFor(e: EventRecord): string {
  return e.customName || e.vibeEventName || humanize(e.type);
}

function humanize(s: string): string {
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function traditionLabel(traditions: string[]): string {
  if (traditions.length === 0) return "general";
  const map: Record<string, string> = {
    gujarati: "Gujarati",
    punjabi: "Punjabi",
    tamil: "Tamil",
    telugu: "Telugu",
    bengali: "Bengali",
    marwari: "Marwari",
    marathi: "Marathi",
    sindhi: "Sindhi",
    malayali: "Malayali",
    kashmiri: "Kashmiri",
    south_indian_christian: "South Indian Christian",
    muslim: "Muslim",
    sikh: "Sikh",
    jain: "Jain",
    inter_faith: "inter-faith",
    non_religious: "non-religious",
    custom: "custom",
  };
  if (traditions.length === 1) return map[traditions[0]] ?? traditions[0];
  return traditions.map((t) => map[t] ?? t).join(" + ");
}
