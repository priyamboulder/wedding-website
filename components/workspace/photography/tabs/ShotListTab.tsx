"use client";

// ── Shot List tab ──────────────────────────────────────────────────────────
// A working document for a photographer's assistant during a 3-day wedding,
// modeled on /checklist: two-pane layout, circular checkboxes, collapsible
// moment sections, optimistic toggles, no modals in the critical path.
//
// Left rail  = summary filters (All / This Event / Must-Have / Unchecked)
//              + one row per event with progress fraction.
// Right pane = active event header + filter row + shot list grouped by
//              sub-moment + AI suggestions row + print-only sheet.

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  AnimatePresence,
  motion,
} from "framer-motion";
import {
  Camera,
  Check,
  ChevronDown,
  ChevronRight,
  Gem,
  HelpCircle,
  ImageIcon,
  Link as LinkIcon,
  ListChecks,
  Monitor,
  Plus,
  Printer,
  RefreshCcw,
  Search,
  Sparkles,
  Trash2,
  UserCircle,
  X,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePhotographyStore } from "@/stores/photography-store";
import {
  PHOTO_EVENTS,
  PHOTO_EVENT_META,
  type PhotoCustomEvent,
  type PhotoEventId,
  type PhotoShot,
  type PhotoVIP,
  type ShotPriority,
} from "@/types/photography";
import type { WorkspaceCategory } from "@/types/workspace";
import { SHOT_SUGGESTIONS, type ShotSuggestion } from "@/lib/photography-suggestions";
import { pushUndo } from "@/components/workspace/editable/UndoToast";
import {
  WorkspaceScopeAndEvents,
  type EventItem,
  type ScopeItem,
} from "@/components/workspace/shared/WorkspaceScopeAndEvents";
import { QuizEntryCard, QuizRetakeLink } from "@/components/quiz/QuizEntryCard";
import { getQuizSchema } from "@/lib/quiz/registry";

const SHOTLIST_QUIZ = getQuizSchema("photography", "shot_list");

// ── Constants ──────────────────────────────────────────────────────────────

const PANEL_EASE = [0.32, 0.72, 0, 1] as const;

const SUMMARY_FILTERS = [
  { id: "all" as const, label: "All Shots" },
  { id: "this_event" as const, label: "This Event" },
  { id: "must" as const, label: "Must-Have" },
  { id: "unchecked" as const, label: "Unchecked" },
];

type SummaryFilterId = (typeof SUMMARY_FILTERS)[number]["id"];

const DISMISS_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// Used when the active event is user-defined (not in PHOTO_EVENT_META).
const CUSTOM_EVENT_META = {
  description: "User-defined event — add shots and organize them as you like.",
  moments: ["Pre-event", "Key moments", "Details", "Candids"],
} as const;

// ── Entry point ────────────────────────────────────────────────────────────

export function ShotListTab({ category }: { category: WorkspaceCategory }) {
  const allShots = usePhotographyStore((s) => s.shots);
  const allVips = usePhotographyStore((s) => s.vips);
  const dismissedMap = usePhotographyStore((s) => s.dismissedSuggestions);
  const customEvents = usePhotographyStore((s) => s.customEvents);
  const addCustomEvent = usePhotographyStore((s) => s.addCustomEvent);

  const shots = useMemo(
    () =>
      allShots
        .filter((s) => s.category_id === category.id)
        .sort((a, b) => a.sort_order - b.sort_order),
    [allShots, category.id],
  );
  const vips = useMemo(
    () =>
      allVips
        .filter((v) => v.category_id === category.id)
        .sort((a, b) => a.sort_order - b.sort_order),
    [allVips, category.id],
  );
  const vipById = useMemo(() => {
    const m = new Map<string, PhotoVIP>();
    for (const v of vips) m.set(v.id, v);
    return m;
  }, [vips]);

  const [activeEvent, setActiveEvent] = useState<string>("haldi");
  const [summaryFilter, setSummaryFilter] = useState<SummaryFilterId>("this_event");
  const [liveMode, setLiveMode] = useState(false);
  const [addingEvent, setAddingEvent] = useState(false);

  // Canonical + user-defined events, in display order.
  const allEvents = useMemo(
    () => [
      ...PHOTO_EVENTS.map((e) => ({ id: e.id as string, label: e.label })),
      ...customEvents.map((e) => ({ id: e.id, label: e.label })),
    ],
    [customEvents],
  );

  // Filter state (right-pane toolbar)
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<"all" | ShotPriority>("all");
  const [vipFilter, setVipFilter] = useState<"all" | string>("all");
  const [linkedOnly, setLinkedOnly] = useState(false);

  // Summary filter interaction: scope and event compose. "All Shots" shows
  // everything across events (event axis de-emphasized); the other three
  // scopes layer on top of the current event.
  const scopedShots = useMemo(() => {
    if (summaryFilter === "all") return shots;
    const forEvent = shots.filter((s) => s.event === activeEvent);
    if (summaryFilter === "must") return forEvent.filter((s) => s.priority === "must");
    if (summaryFilter === "unchecked") return forEvent.filter((s) => !s.checked);
    return forEvent;
  }, [shots, summaryFilter, activeEvent]);

  const progressByEvent = useMemo(() => {
    const map = new Map<string, { done: number; total: number }>();
    for (const ev of allEvents) map.set(ev.id, { done: 0, total: 0 });
    for (const s of shots) {
      const c = map.get(s.event);
      if (!c) continue;
      c.total += 1;
      if (s.checked) c.done += 1;
    }
    return map;
  }, [shots, allEvents]);

  const activeEventIndex = allEvents.findIndex((e) => e.id === activeEvent);

  const liveSuggestionsCount = useMemo(() => {
    const now = Date.now();
    const list = SHOT_SUGGESTIONS[activeEvent as PhotoEventId] ?? [];
    const existingTitles = new Set(
      shots.filter((s) => s.event === activeEvent).map((s) => s.title.toLowerCase()),
    );
    return list.filter((sug) => {
      const dismissedAt = dismissedMap[sug.key];
      if (dismissedAt && now - dismissedAt < DISMISS_TTL_MS) return false;
      if (existingTitles.has(sug.title.toLowerCase())) return false;
      return true;
    }).length;
  }, [activeEvent, dismissedMap, shots]);

  const mainScrollRef = useRef<HTMLDivElement>(null);
  const suggestionsRowRef = useRef<HTMLDivElement>(null);

  const scrollToSuggestions = useCallback(() => {
    suggestionsRowRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);

  const handlePrint = useCallback(() => {
    if (typeof window !== "undefined") window.print();
  }, []);

  const scopeItems: ScopeItem<SummaryFilterId>[] = useMemo(() => {
    const totalAll = shots.length;
    const forEvent = shots.filter((s) => s.event === activeEvent);
    return [
      { key: "all", label: "All Shots", count: totalAll },
      { key: "this_event", label: "This Event", count: forEvent.length },
      {
        key: "must",
        label: "Must-Have",
        count: forEvent.filter((s) => s.priority === "must").length,
      },
      {
        key: "unchecked",
        label: "Unchecked",
        count: forEvent.filter((s) => !s.checked).length,
      },
    ];
  }, [shots, activeEvent]);

  const eventItems: EventItem<string>[] = useMemo(
    () =>
      allEvents.map((ev) => ({
        key: ev.id,
        name: ev.label,
        progress: progressByEvent.get(ev.id) ?? { done: 0, total: 0 },
      })),
    [allEvents, progressByEvent],
  );

  const handleEventChange = useCallback((id: string) => {
    setActiveEvent(id);
    setSummaryFilter((prev) => (prev === "all" ? "this_event" : prev));
  }, []);

  const handleAddEventSubmit = useCallback(
    (label: string) => {
      const trimmed = label.trim();
      if (!trimmed) {
        setAddingEvent(false);
        return;
      }
      const created = addCustomEvent(trimmed);
      setActiveEvent(created.id);
      setSummaryFilter((prev) => (prev === "all" ? "this_event" : prev));
      setAddingEvent(false);
    },
    [addCustomEvent],
  );

  return (
    <div
      className={cn(
        "shot-list-root flex h-full min-h-0 flex-col",
        liveMode && "live-mode",
      )}
    >
      <div
        ref={mainScrollRef}
        className="shot-list-main flex-1 overflow-y-auto bg-white pb-16"
      >
        {!liveMode && SHOTLIST_QUIZ && (
          <div className="mx-auto max-w-5xl px-10 pt-6">
            <QuizEntryCard schema={SHOTLIST_QUIZ} categoryId={category.id} />
            <div className="mt-2 flex justify-end">
              <QuizRetakeLink
                schema={SHOTLIST_QUIZ}
                categoryId={category.id}
              />
            </div>
          </div>
        )}

        {!liveMode && (
          <div className="mx-auto max-w-5xl px-10 pt-6">
            <WorkspaceScopeAndEvents
              scopes={scopeItems}
              events={eventItems}
              activeScope={summaryFilter}
              activeEvent={activeEvent}
              onScopeChange={setSummaryFilter}
              onEventChange={handleEventChange}
              dimEventsOnScope="all"
              ariaLabelScopes="Shot scope"
              ariaLabelEvents="Wedding events"
              chipRowBg="white"
              onAddEvent={() => setAddingEvent(true)}
              addEventLabel="Add event"
            />
            {addingEvent && (
              <NewEventComposer
                onSubmit={handleAddEventSubmit}
                onCancel={() => setAddingEvent(false)}
              />
            )}
          </div>
        )}

        <div className={cn("mx-auto max-w-5xl px-10", liveMode ? "pt-8" : "pt-5")}>
          {summaryFilter === "all" ? (
            <FilteredPane
              summaryFilter={summaryFilter}
              shots={scopedShots}
              allEvents={allEvents}
              vipById={vipById}
              liveMode={liveMode}
              onToggleLive={() => setLiveMode((v) => !v)}
              onPrint={handlePrint}
            />
          ) : (
            <EventPane
              event={activeEvent}
              eventLabel={
                allEvents[activeEventIndex]?.label ?? "Event"
              }
              index={activeEventIndex}
              totalEvents={allEvents.length}
              shots={scopedShots}
              allShots={shots}
              categoryId={category.id}
              vips={vips}
              vipById={vipById}
              search={search}
              onSearch={setSearch}
              priorityFilter={priorityFilter}
              onPriorityFilter={setPriorityFilter}
              vipFilter={vipFilter}
              onVipFilter={setVipFilter}
              linkedOnly={linkedOnly}
              onLinkedOnly={setLinkedOnly}
              dismissedMap={dismissedMap}
              liveSuggestionsCount={liveSuggestionsCount}
              onJumpToSuggestions={scrollToSuggestions}
              suggestionsRowRef={suggestionsRowRef}
              liveMode={liveMode}
              onToggleLive={() => setLiveMode((v) => !v)}
              onPrint={handlePrint}
            />
          )}
        </div>
      </div>

      <PrintSheet shots={shots} vipById={vipById} />
      <ShotListPrintStyles />
    </div>
  );
}

// ── Event pane (active event view) ─────────────────────────────────────────

function EventPane({
  event,
  eventLabel,
  index,
  totalEvents,
  shots,
  allShots,
  categoryId,
  vips,
  vipById,
  search,
  onSearch,
  priorityFilter,
  onPriorityFilter,
  vipFilter,
  onVipFilter,
  linkedOnly,
  onLinkedOnly,
  dismissedMap,
  liveSuggestionsCount,
  onJumpToSuggestions,
  suggestionsRowRef,
  liveMode,
  onToggleLive,
  onPrint,
}: {
  event: string;
  eventLabel: string;
  index: number;
  totalEvents: number;
  shots: PhotoShot[];
  allShots: PhotoShot[];
  categoryId: string;
  vips: PhotoVIP[];
  vipById: Map<string, PhotoVIP>;
  search: string;
  onSearch: (s: string) => void;
  priorityFilter: "all" | ShotPriority;
  onPriorityFilter: (p: "all" | ShotPriority) => void;
  vipFilter: "all" | string;
  onVipFilter: (v: "all" | string) => void;
  linkedOnly: boolean;
  onLinkedOnly: (v: boolean) => void;
  dismissedMap: Record<string, number>;
  liveSuggestionsCount: number;
  onJumpToSuggestions: () => void;
  suggestionsRowRef: React.RefObject<HTMLDivElement | null>;
  liveMode: boolean;
  onToggleLive: () => void;
  onPrint: () => void;
}) {
  const meta =
    PHOTO_EVENT_META[event as PhotoEventId] ?? {
      description: CUSTOM_EVENT_META.description,
      moments: [...CUSTOM_EVENT_META.moments],
    };
  const progress = useMemo(() => {
    const total = shots.length;
    const done = shots.filter((s) => s.checked).length;
    return { total, done, pct: total > 0 ? Math.round((done / total) * 100) : 0 };
  }, [shots]);

  const [composerOpen, setComposerOpen] = useState(false);
  const composerRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return shots.filter((s) => {
      if (priorityFilter !== "all" && s.priority !== priorityFilter) return false;
      if (vipFilter !== "all" && !s.vip_ids.includes(vipFilter)) return false;
      if (linkedOnly && s.vip_ids.length === 0) return false;
      if (q && !s.title.toLowerCase().includes(q) && !(s.description ?? "").toLowerCase().includes(q))
        return false;
      return true;
    });
  }, [shots, search, priorityFilter, vipFilter, linkedOnly]);

  // Group by moment
  const grouped = useMemo(() => groupByMoment(filtered, meta.moments), [filtered, meta.moments]);

  // Suggestions currently available for this event
  const availableSuggestions = useMemo(() => {
    const now = Date.now();
    const existingTitles = new Set(shots.map((s) => s.title.toLowerCase()));
    return (SHOT_SUGGESTIONS[event as PhotoEventId] ?? []).filter((sug) => {
      const dismissedAt = dismissedMap[sug.key];
      if (dismissedAt && now - dismissedAt < DISMISS_TTL_MS) return false;
      if (existingTitles.has(sug.title.toLowerCase())) return false;
      return true;
    });
  }, [event, shots, dismissedMap]);

  return (
    <div className="mx-auto max-w-5xl">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p
            className="font-mono text-[10px] uppercase tracking-[0.18em] text-saffron"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Event {index + 1} of {totalEvents}
          </p>
          <h1 className="mt-1.5 font-serif text-[30px] leading-[1.1] text-ink">
            {eventLabel}
          </h1>
          <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-ink-muted">
            {meta.description}
          </p>

          {/* Progress bar */}
          <div className="mt-4 flex items-center gap-3 max-w-md">
            <div className="h-[3px] flex-1 rounded-full bg-ivory-deep">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-gold to-gold-light"
                initial={{ width: 0 }}
                animate={{ width: `${progress.pct}%` }}
                transition={{ duration: 0.6, ease: PANEL_EASE }}
              />
            </div>
            <span
              className="font-mono text-[11px] tabular-nums text-ink-muted"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {progress.done}/{progress.total}
            </span>
          </div>

          {liveSuggestionsCount > 0 && (
            <button
              type="button"
              onClick={onJumpToSuggestions}
              className="mt-3 inline-flex items-center gap-1 text-[11.5px] font-medium text-gold hover:text-gold-light"
            >
              <Sparkles size={11} strokeWidth={1.8} />
              {liveSuggestionsCount} AI suggestion{liveSuggestionsCount === 1 ? "" : "s"}{" "}
              available
            </button>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <IconToggle
            active={liveMode}
            onClick={onToggleLive}
            icon={<Monitor size={13} strokeWidth={1.8} />}
            label="Live Mode"
          />
          <IconToggle
            onClick={onPrint}
            icon={<Printer size={13} strokeWidth={1.8} />}
            label="Print / PDF"
          />
          <button
            type="button"
            onClick={() => {
              setComposerOpen(true);
              requestAnimationFrame(() =>
                composerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }),
              );
            }}
            className="inline-flex items-center gap-1.5 rounded-md border border-gold/30 bg-gold-pale/40 px-3 py-1.5 text-[12px] font-medium text-gold transition-colors hover:bg-gold-pale/60 hover:border-gold/50"
          >
            <Plus size={13} strokeWidth={2} />
            New Shot
          </button>
        </div>
      </div>

      {/* Filter row */}
      <div className="mt-7 flex flex-wrap items-center gap-2.5" role="search">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search
            size={13}
            className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-faint"
            aria-hidden
          />
          <input
            type="text"
            placeholder="Search shots…"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            className="w-full rounded-md border border-border bg-ivory py-1.5 pl-8 pr-3 text-[12px] text-ink placeholder:text-ink-faint/60 outline-none transition-colors hover:border-ink-faint/50 focus-visible:border-gold/50 focus-visible:ring-1 focus-visible:ring-gold/20"
          />
        </div>
        <select
          value={priorityFilter}
          onChange={(e) => onPriorityFilter(e.target.value as "all" | ShotPriority)}
          className="rounded-md border border-border bg-ivory px-2.5 py-1.5 text-[12px] text-ink-muted outline-none transition-colors hover:border-ink-faint/50 focus-visible:border-gold/50 focus-visible:ring-1 focus-visible:ring-gold/20"
          aria-label="Priority filter"
        >
          <option value="all">All priorities</option>
          <option value="must">Must</option>
          <option value="preferred">Preferred</option>
        </select>
        <select
          value={vipFilter}
          onChange={(e) => onVipFilter(e.target.value as "all" | string)}
          className="rounded-md border border-border bg-ivory px-2.5 py-1.5 text-[12px] text-ink-muted outline-none transition-colors hover:border-ink-faint/50 focus-visible:border-gold/50 focus-visible:ring-1 focus-visible:ring-gold/20"
          aria-label="VIP filter"
        >
          <option value="all">All VIPs</option>
          {vips.map((v) => (
            <option key={v.id} value={v.id}>
              {v.name}
            </option>
          ))}
        </select>
        <label
          className={cn(
            "inline-flex cursor-pointer items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-[11.5px] transition-colors",
            linkedOnly
              ? "border-gold/40 bg-gold-pale/30 text-gold"
              : "border-border bg-ivory text-ink-muted hover:border-ink-faint/50",
          )}
        >
          <input
            type="checkbox"
            checked={linkedOnly}
            onChange={(e) => onLinkedOnly(e.target.checked)}
            className="sr-only"
          />
          <LinkIcon size={11} strokeWidth={1.8} />
          Linked only
        </label>
      </div>

      {/* Composer */}
      <AnimatePresence initial={false}>
        {composerOpen && (
          <motion.div
            ref={composerRef}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: PANEL_EASE }}
            className="mt-4 overflow-hidden"
          >
            <NewShotComposer
              event={event}
              categoryId={categoryId}
              moments={meta.moments}
              onClose={() => setComposerOpen(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grouped shot list */}
      <div className="mt-8 space-y-5">
        {grouped.length === 0 ? (
          <EmptyState message={`No shots match your filters for ${eventLabel}.`} />
        ) : (
          grouped.map((group) => (
            <MomentGroup
              key={group.key}
              title={group.title}
              shots={group.items}
              vipById={vipById}
              vips={vips}
              moments={meta.moments}
            />
          ))
        )}

        {/* AI suggestions row */}
        <div ref={suggestionsRowRef}>
          <SuggestionsRow
            event={event}
            categoryId={categoryId}
            suggestions={availableSuggestions}
          />
        </div>
      </div>
    </div>
  );
}

// ── Filtered pane (All Shots / Must-Have / Unchecked across events) ────────

function FilteredPane({
  summaryFilter,
  shots,
  allEvents,
  vipById,
  liveMode,
  onToggleLive,
  onPrint,
}: {
  summaryFilter: SummaryFilterId;
  shots: PhotoShot[];
  allEvents: { id: string; label: string }[];
  vipById: Map<string, PhotoVIP>;
  liveMode: boolean;
  onToggleLive: () => void;
  onPrint: () => void;
}) {
  const filterLabel: Record<Exclude<SummaryFilterId, "this_event">, string> = {
    all: "All shots",
    must: "Must-have shots",
    unchecked: "Unchecked shots",
  };
  const label = filterLabel[summaryFilter as Exclude<SummaryFilterId, "this_event">];

  const grouped = useMemo(() => {
    const map = new Map<string, PhotoShot[]>();
    for (const ev of allEvents) map.set(ev.id, []);
    for (const s of shots) map.get(s.event)?.push(s);
    return allEvents
      .filter((ev) => (map.get(ev.id) ?? []).length > 0)
      .map((ev) => ({
        id: ev.id,
        label: ev.label,
        items: map.get(ev.id) ?? [],
      }));
  }, [shots, allEvents]);

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p
            className="font-mono text-[10px] uppercase tracking-[0.18em] text-saffron"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Cross-event view
          </p>
          <h1 className="mt-1.5 font-serif text-[30px] leading-[1.1] text-ink">{label}</h1>
          <p className="mt-2 text-[13px] text-ink-muted">
            {shots.length} shot{shots.length === 1 ? "" : "s"} across {grouped.length} event
            {grouped.length === 1 ? "" : "s"}.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <IconToggle
            active={liveMode}
            onClick={onToggleLive}
            icon={<Monitor size={13} strokeWidth={1.8} />}
            label="Live Mode"
          />
          <IconToggle
            onClick={onPrint}
            icon={<Printer size={13} strokeWidth={1.8} />}
            label="Print / PDF"
          />
        </div>
      </div>

      <div className="mt-8 space-y-6">
        {grouped.length === 0 ? (
          <EmptyState message="Nothing here — try a different filter." />
        ) : (
          grouped.map((group) => (
            <MomentGroup
              key={group.id}
              title={group.label}
              shots={group.items}
              vipById={vipById}
              vips={[]}
              moments={PHOTO_EVENT_META[group.id as PhotoEventId]?.moments ?? []}
            />
          ))
        )}
      </div>
    </div>
  );
}

// ── Moment group (collapsible section with rows) ───────────────────────────

function groupByMoment(
  shots: PhotoShot[],
  momentOrder: string[],
): { key: string; title: string; items: PhotoShot[] }[] {
  const buckets = new Map<string, PhotoShot[]>();
  for (const m of momentOrder) buckets.set(m, []);
  const extras = new Map<string, PhotoShot[]>();
  for (const s of shots) {
    const key = s.moment ?? "Other";
    if (buckets.has(key)) {
      buckets.get(key)!.push(s);
    } else {
      if (!extras.has(key)) extras.set(key, []);
      extras.get(key)!.push(s);
    }
  }
  // Sort: unchecked first (by sort_order), then checked (by sort_order)
  const sortItems = (items: PhotoShot[]) =>
    [...items].sort((a, b) => {
      const ac = a.checked ? 1 : 0;
      const bc = b.checked ? 1 : 0;
      if (ac !== bc) return ac - bc;
      return a.sort_order - b.sort_order;
    });

  const result: { key: string; title: string; items: PhotoShot[] }[] = [];
  for (const m of momentOrder) {
    const items = buckets.get(m) ?? [];
    if (items.length === 0) continue;
    result.push({ key: m, title: m, items: sortItems(items) });
  }
  for (const [key, items] of extras) {
    result.push({ key, title: key, items: sortItems(items) });
  }
  return result;
}

function MomentGroup({
  title,
  shots,
  vipById,
  vips,
  moments,
}: {
  title: string;
  shots: PhotoShot[];
  vipById: Map<string, PhotoVIP>;
  vips: PhotoVIP[];
  moments: string[];
}) {
  const [expanded, setExpanded] = useState(true);
  const done = shots.filter((s) => s.checked).length;
  const total = shots.length;

  return (
    <section data-moment-key={title}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="group flex w-full items-center gap-2 rounded-md px-2 py-2 text-left transition-colors hover:bg-ivory-warm/40"
        aria-expanded={expanded}
      >
        {expanded ? (
          <ChevronDown size={14} className="shrink-0 text-ink-faint" />
        ) : (
          <ChevronRight size={14} className="shrink-0 text-ink-faint" />
        )}
        <span
          className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-muted"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {title}
        </span>
        <span
          className="font-mono text-[10px] tabular-nums text-ink-faint"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {done}/{total}
        </span>
        {done === total && total > 0 && (
          <Check size={12} className="text-sage" strokeWidth={2.5} />
        )}
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: PANEL_EASE }}
            className="ml-1 overflow-hidden"
          >
            <ul className="divide-y divide-border/40" role="list">
              {shots.map((shot) => (
                <li key={shot.id}>
                  <ShotRow shot={shot} vipById={vipById} vips={vips} moments={moments} />
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

// ── Shot row ───────────────────────────────────────────────────────────────

function ShotRow({
  shot,
  vipById,
  vips,
  moments,
}: {
  shot: PhotoShot;
  vipById: Map<string, PhotoVIP>;
  vips: PhotoVIP[];
  moments: string[];
}) {
  const toggleShotChecked = usePhotographyStore((s) => s.toggleShotChecked);
  const updateShot = usePhotographyStore((s) => s.updateShot);
  const deleteShot = usePhotographyStore((s) => s.deleteShot);
  const addShot = usePhotographyStore((s) => s.addShot);
  const [expanded, setExpanded] = useState(false);

  const linked = shot.vip_ids
    .map((id) => vipById.get(id))
    .filter((x): x is PhotoVIP => Boolean(x));

  const isChecked = Boolean(shot.checked);

  const handleDelete = () => {
    const snap: PhotoShot = { ...shot };
    deleteShot(shot.id);
    pushUndo({
      message: "Shot removed",
      undo: () =>
        addShot({
          category_id: snap.category_id,
          event: snap.event,
          priority: snap.priority,
          title: snap.title,
          description: snap.description,
          vip_ids: snap.vip_ids,
          sort_order: snap.sort_order,
          moment: snap.moment,
          checked: snap.checked,
          reference_image_url: snap.reference_image_url,
          assigned_photographer: snap.assigned_photographer,
          assigned_angle: snap.assigned_angle,
        }),
    });
  };

  return (
    <div
      className={cn(
        "group flex cursor-pointer flex-col rounded-lg px-3 transition-colors",
        expanded ? "bg-ivory-warm/30" : "hover:bg-gold-pale/20",
        isChecked && "opacity-60",
      )}
    >
      <div
        className="live-row flex items-center gap-3 py-2.5"
        onClick={() => setExpanded((v) => !v)}
        role="button"
        tabIndex={0}
        aria-expanded={expanded}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setExpanded((v) => !v);
          }
        }}
      >
        {/* Checkbox */}
        <ShotCheckbox
          checked={isChecked}
          onToggle={() => toggleShotChecked(shot.id)}
        />

        {/* Title + VIPs */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span
              className={cn(
                "font-serif text-[14px] leading-snug tracking-tight",
                isChecked
                  ? "text-ink-muted line-through decoration-ink-faint/40"
                  : "text-ink",
              )}
            >
              {shot.title}
            </span>
            {linked.map((v) => (
              <span
                key={v.id}
                className="inline-flex items-center gap-1 rounded-full border border-saffron/40 bg-saffron-pale/40 px-2 py-0.5 text-[10.5px] text-saffron"
                title={v.relationship}
              >
                <UserCircle size={10} strokeWidth={1.8} />
                {v.name}
              </span>
            ))}
          </div>
        </div>

        {/* Priority + chevron */}
        <div className="flex shrink-0 items-center gap-2.5 pr-1">
          <PriorityIndicator priority={shot.priority} muted={isChecked} />
          <ChevronRight
            size={14}
            className={cn(
              "shrink-0 text-ink-faint/50 transition-transform duration-200",
              expanded && "rotate-90",
            )}
          />
        </div>
      </div>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: PANEL_EASE }}
            className="overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <ShotDrawer
              shot={shot}
              vips={vips}
              vipById={vipById}
              moments={moments}
              onUpdate={(patch) => updateShot(shot.id, patch)}
              onDelete={handleDelete}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Shot drawer (expanded) ─────────────────────────────────────────────────

function ShotDrawer({
  shot,
  vips,
  vipById,
  moments,
  onUpdate,
  onDelete,
}: {
  shot: PhotoShot;
  vips: PhotoVIP[];
  vipById: Map<string, PhotoVIP>;
  moments: string[];
  onUpdate: (patch: Partial<PhotoShot>) => void;
  onDelete: () => void;
}) {
  const toggleVip = (id: string) => {
    const has = shot.vip_ids.includes(id);
    onUpdate({
      vip_ids: has ? shot.vip_ids.filter((v) => v !== id) : [...shot.vip_ids, id],
    });
  };

  const inputClass =
    "w-full rounded-md border border-border bg-white px-2.5 py-1.5 text-[12.5px] text-ink placeholder:text-ink-faint/60 outline-none transition-colors focus-visible:border-gold/50 focus-visible:ring-1 focus-visible:ring-gold/20";

  return (
    <div className="ml-9 mb-3 mt-1 grid grid-cols-1 gap-4 rounded-md border border-border/70 bg-white p-4 md:grid-cols-2">
      {/* Direction notes */}
      <div className="md:col-span-2">
        <Label>Direction notes</Label>
        <textarea
          value={shot.description ?? ""}
          onChange={(e) => onUpdate({ description: e.target.value })}
          placeholder="Framing, angle, emotional cue — anything the second shooter should know."
          rows={2}
          className={cn(inputClass, "resize-none")}
        />
      </div>

      {/* Moment + priority */}
      <div>
        <Label>Moment</Label>
        <select
          value={shot.moment ?? ""}
          onChange={(e) => onUpdate({ moment: e.target.value || undefined })}
          className={inputClass}
        >
          <option value="">— Uncategorized —</option>
          {moments.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>
      <div>
        <Label>Priority</Label>
        <div className="flex gap-1.5">
          {(["must", "preferred"] as ShotPriority[]).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => onUpdate({ priority: p })}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 rounded-md border px-2.5 py-1.5 text-[11.5px] transition-colors",
                shot.priority === p
                  ? p === "must"
                    ? "border-red-400 bg-rose-pale/60 text-rose"
                    : "border-amber-400 bg-amber-50 text-amber-700"
                  : "border-border bg-white text-ink-muted hover:border-ink-faint/60",
              )}
            >
              <span
                className={cn(
                  "h-2 w-2 rounded-full",
                  p === "must" ? "bg-red-500" : "bg-amber-500",
                )}
              />
              {p === "must" ? "Must" : "Preferred"}
            </button>
          ))}
        </div>
      </div>

      {/* VIP linking */}
      <div className="md:col-span-2">
        <Label>Linked VIPs</Label>
        {vips.length === 0 ? (
          <p className="text-[11.5px] italic text-ink-faint">
            Add people in the VIPs & Family tab to link them here.
          </p>
        ) : (
          <ul className="flex flex-wrap gap-1.5">
            {vips.map((v) => {
              const isLinked = shot.vip_ids.includes(v.id);
              return (
                <li key={v.id}>
                  <button
                    type="button"
                    onClick={() => toggleVip(v.id)}
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] transition-colors",
                      isLinked
                        ? "border-saffron bg-saffron-pale/60 text-saffron"
                        : "border-border bg-white text-ink-muted hover:border-saffron/50",
                    )}
                  >
                    <UserCircle size={10} strokeWidth={1.8} />
                    {v.name}
                    <span className="text-ink-faint">· {v.relationship || v.side}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Reference image */}
      <div>
        <Label>Reference image URL</Label>
        <div className="flex items-center gap-2">
          <ImageIcon size={12} className="text-ink-faint" />
          <input
            type="url"
            value={shot.reference_image_url ?? ""}
            onChange={(e) => onUpdate({ reference_image_url: e.target.value })}
            placeholder="https://…"
            className={inputClass}
          />
        </div>
      </div>

      {/* Assignment */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label>Photographer</Label>
          <input
            type="text"
            value={shot.assigned_photographer ?? ""}
            onChange={(e) => onUpdate({ assigned_photographer: e.target.value })}
            placeholder="Lead / 2nd / drone"
            className={inputClass}
          />
        </div>
        <div>
          <Label>Angle</Label>
          <input
            type="text"
            value={shot.assigned_angle ?? ""}
            onChange={(e) => onUpdate({ assigned_angle: e.target.value })}
            placeholder="Wide / tight / 35mm"
            className={inputClass}
          />
        </div>
      </div>

      <div className="md:col-span-2 flex items-center justify-between pt-1">
        <input
          type="text"
          value={shot.title}
          onChange={(e) => onUpdate({ title: e.target.value })}
          className={cn(inputClass, "max-w-md font-serif text-[13.5px]")}
          aria-label="Shot title"
        />
        <button
          type="button"
          onClick={onDelete}
          className="inline-flex items-center gap-1 rounded-md border border-rose/30 bg-rose-pale/30 px-2 py-1 text-[11px] text-rose transition-colors hover:bg-rose-pale/60"
        >
          <Trash2 size={11} strokeWidth={1.8} />
          Remove
        </button>
      </div>
    </div>
  );
}

function Label({ children }: { children: ReactNode }) {
  return (
    <label
      className="mb-1 block font-mono text-[9.5px] font-semibold uppercase tracking-[0.14em] text-ink-faint"
      style={{ fontFamily: "var(--font-mono)" }}
    >
      {children}
    </label>
  );
}

// ── Checkbox + priority indicator ──────────────────────────────────────────

function ShotCheckbox({ checked, onToggle }: { checked: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      className="group/check live-check relative flex h-[22px] w-[22px] shrink-0 items-center justify-center"
      aria-pressed={checked}
      aria-label={checked ? "Mark as unchecked" : "Mark as captured"}
    >
      <motion.div
        className={cn(
          "flex h-[22px] w-[22px] items-center justify-center rounded-full border-[1.5px] transition-colors",
          checked
            ? "border-gold bg-gold"
            : "border-ink-faint/30 group-hover/check:border-gold/60",
        )}
        whileTap={{ scale: 0.85 }}
        animate={checked ? { scale: [1, 1.2, 0.95, 1] } : { scale: 1 }}
        transition={{ duration: 0.35, ease: [0.34, 1.56, 0.64, 1] }}
      >
        <AnimatePresence mode="wait">
          {checked && (
            <motion.div
              key="check"
              initial={{ scale: 0, opacity: 0, rotate: -45 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
            >
              <Check size={12} strokeWidth={3} className="text-white" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </button>
  );
}

function PriorityIndicator({
  priority,
  muted,
}: {
  priority: ShotPriority;
  muted?: boolean;
}) {
  const isMust = priority === "must";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.12em]",
        muted ? "text-ink-faint" : isMust ? "text-rose" : "text-amber-600",
      )}
      style={{ fontFamily: "var(--font-mono)" }}
      title={isMust ? "Must-have" : "Preferred"}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          muted ? "bg-ink-faint/40" : isMust ? "bg-red-500" : "bg-amber-500",
        )}
      />
      {isMust ? "Must" : "Preferred"}
    </span>
  );
}

// ── New-event composer ─────────────────────────────────────────────────────

function NewEventComposer({
  onSubmit,
  onCancel,
}: {
  onSubmit: (label: string) => void;
  onCancel: () => void;
}) {
  const [label, setLabel] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const trimmed = label.trim();

  return (
    <div
      className="mt-2 flex items-center gap-2 rounded-md border border-gold/25 bg-ivory-warm/40 px-3 py-2"
      role="form"
      aria-label="Add event"
    >
      <input
        ref={inputRef}
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            onSubmit(label);
          } else if (e.key === "Escape") {
            e.preventDefault();
            onCancel();
          }
        }}
        placeholder="Event name (e.g. Rehearsal Dinner)"
        className="flex-1 min-w-[200px] bg-transparent font-serif text-[14px] leading-snug tracking-tight text-ink outline-none placeholder:text-ink-faint/60"
      />
      <button
        type="button"
        onClick={() => onSubmit(label)}
        disabled={!trimmed}
        className="inline-flex items-center gap-1 rounded-md bg-ink px-2.5 py-1 text-[11px] font-medium text-ivory transition-opacity hover:opacity-90 disabled:opacity-30"
      >
        <Check size={11} strokeWidth={2} />
        Add
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="flex shrink-0 items-center justify-center rounded-md p-1 text-ink-faint transition-colors hover:bg-ivory-warm hover:text-ink-muted"
        aria-label="Cancel"
      >
        <X size={14} strokeWidth={1.5} />
      </button>
    </div>
  );
}

// ── New-shot composer ──────────────────────────────────────────────────────

function NewShotComposer({
  event,
  categoryId,
  moments,
  onClose,
}: {
  event: string;
  categoryId: string;
  moments: string[];
  onClose: () => void;
}) {
  const addShot = usePhotographyStore((s) => s.addShot);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<ShotPriority>("preferred");
  const [moment, setMoment] = useState<string>(moments[0] ?? "");
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  const submit = () => {
    const t = title.trim();
    if (!t) return;
    addShot({
      category_id: categoryId,
      event,
      priority,
      title: t,
      vip_ids: [],
      moment: moment || undefined,
    });
    setTitle("");
    titleRef.current?.focus();
  };

  return (
    <div
      className="flex flex-wrap items-center gap-2 rounded-lg border border-gold/25 bg-ivory-warm/40 px-4 py-3 shadow-[0_1px_3px_rgba(184,134,11,0.06)]"
      role="form"
      aria-label="Add shot"
    >
      <button
        type="button"
        onClick={() =>
          setPriority((p) => (p === "must" ? "preferred" : "must"))
        }
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-ivory-warm"
        title={`Priority: ${priority === "must" ? "Must" : "Preferred"} — click to toggle`}
      >
        <span
          className={cn(
            "h-2 w-2 rounded-full",
            priority === "must" ? "bg-red-500" : "bg-amber-500",
          )}
        />
      </button>
      <input
        ref={titleRef}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            submit();
          } else if (e.key === "Escape") {
            e.preventDefault();
            onClose();
          }
        }}
        placeholder="Describe the shot…"
        className="flex-1 min-w-[220px] bg-transparent font-serif text-[14px] leading-snug tracking-tight text-ink outline-none placeholder:text-ink-faint/60"
      />
      {moments.length > 0 && (
        <select
          value={moment}
          onChange={(e) => setMoment(e.target.value)}
          className="rounded-md border border-border bg-white px-2 py-1 text-[11.5px] text-ink-muted outline-none"
        >
          {moments.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      )}
      <button
        type="button"
        onClick={submit}
        disabled={!title.trim()}
        className="inline-flex items-center gap-1 rounded-md bg-ink px-2.5 py-1 text-[11px] font-medium text-ivory transition-opacity hover:opacity-90 disabled:opacity-30"
      >
        <Check size={11} strokeWidth={2} />
        Add
      </button>
      <button
        type="button"
        onClick={onClose}
        className="flex shrink-0 items-center justify-center rounded-md p-1 text-ink-faint transition-colors hover:bg-ivory-warm hover:text-ink-muted"
        aria-label="Close"
      >
        <X size={14} strokeWidth={1.5} />
      </button>
    </div>
  );
}

// ── AI suggestions row ─────────────────────────────────────────────────────

function SuggestionsRow({
  event,
  categoryId,
  suggestions,
}: {
  event: string;
  categoryId: string;
  suggestions: ShotSuggestion[];
}) {
  const addShot = usePhotographyStore((s) => s.addShot);
  const dismissSuggestion = usePhotographyStore((s) => s.dismissSuggestion);
  const dismissBulk = usePhotographyStore((s) => s.dismissSuggestionsBulk);

  const [expanded, setExpanded] = useState(false);
  const [nonce, setNonce] = useState(0); // regenerate trigger — reshuffle
  const [expandedReasons, setExpandedReasons] = useState<Record<string, boolean>>({});

  const visible = useMemo(() => {
    // Regenerate: re-sort with a seeded shuffle based on nonce.
    if (nonce === 0) return suggestions.slice(0, 6);
    const pool = [...suggestions];
    // Fisher–Yates using a tiny LCG keyed by nonce for determinism per click.
    let seed = nonce * 9301 + 49297;
    for (let i = pool.length - 1; i > 0; i--) {
      seed = (seed * 9301 + 49297) % 233280;
      const j = Math.floor((seed / 233280) * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool.slice(0, 6);
  }, [suggestions, nonce]);

  const label = PHOTO_EVENTS.find((e) => e.id === event)?.label ?? "";

  if (suggestions.length === 0) {
    return (
      <button
        disabled
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-ink-faint/30 bg-transparent px-4 py-3 text-[12px] text-ink-faint"
        aria-disabled
      >
        <Sparkles size={12} strokeWidth={1.8} />
        No new suggestions right now
      </button>
    );
  }

  return (
    <div className="suggestions-row">
      {!expanded ? (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="group flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-gold/40 bg-gold-pale/10 px-4 py-3 text-[12.5px] font-medium text-gold transition-colors hover:bg-gold-pale/25 hover:border-gold/60"
        >
          <Sparkles size={13} strokeWidth={1.8} />
          Suggest shots for {label}
          <span
            className="font-mono text-[10px] font-normal text-gold/70"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {suggestions.length} ideas
          </span>
        </button>
      ) : (
        <div className="rounded-lg border border-dashed border-gold/40 bg-gold-pale/10 p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles size={13} strokeWidth={1.8} className="text-gold" />
              <span className="font-serif text-[14px] text-ink">
                Suggestions for {label}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setNonce((n) => n + 1)}
                className="inline-flex items-center gap-1 text-[11px] text-ink-muted hover:text-gold"
              >
                <RefreshCcw size={10} strokeWidth={1.8} />
                Regenerate
              </button>
              <button
                type="button"
                onClick={() => {
                  dismissBulk(visible.map((s) => s.key));
                  setExpanded(false);
                }}
                className="text-[11px] text-ink-muted hover:text-rose"
              >
                Dismiss all
              </button>
              <button
                type="button"
                onClick={() => setExpanded(false)}
                className="flex h-6 w-6 items-center justify-center rounded-sm text-ink-faint hover:bg-white/60 hover:text-ink"
                aria-label="Close suggestions"
              >
                <X size={12} />
              </button>
            </div>
          </div>

          <ul className="space-y-1.5" role="list">
            {visible.map((sug) => (
              <li
                key={sug.key}
                className="flex items-start gap-3 rounded-md border border-gold/15 bg-white px-3 py-2.5"
              >
                <span
                  className={cn(
                    "mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full",
                    sug.priority === "must" ? "bg-red-500" : "bg-amber-500",
                  )}
                  aria-hidden
                />
                <div className="min-w-0 flex-1">
                  <p className="font-serif text-[13.5px] leading-snug text-ink">
                    {sug.title}
                  </p>
                  <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-ink-muted">
                    <span>{sug.moment}</span>
                    <span className="text-ink-faint">·</span>
                    <span>{sug.priority === "must" ? "Must" : "Preferred"}</span>
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedReasons((m) => ({ ...m, [sug.key]: !m[sug.key] }))
                      }
                      className="inline-flex items-center gap-0.5 text-ink-faint hover:text-gold"
                    >
                      <HelpCircle size={10} strokeWidth={1.8} />
                      Why?
                    </button>
                  </div>
                  {expandedReasons[sug.key] && (
                    <p className="mt-1 text-[11.5px] italic text-ink-muted">
                      {sug.rationale}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      addShot({
                        category_id: categoryId,
                        event,
                        priority: sug.priority,
                        title: sug.title,
                        moment: sug.moment,
                        vip_ids: [],
                      });
                      dismissSuggestion(sug.key);
                    }}
                    className="inline-flex items-center gap-1 rounded-md bg-gold px-2 py-1 text-[11px] font-medium text-white transition-opacity hover:opacity-90"
                  >
                    <Plus size={10} strokeWidth={2} />
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => dismissSuggestion(sug.key)}
                    className="flex h-6 w-6 items-center justify-center rounded-sm text-ink-faint hover:bg-ivory-warm hover:text-ink"
                    aria-label="Dismiss suggestion"
                  >
                    <X size={11} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ── Icon toggle (header affordance) ────────────────────────────────────────

function IconToggle({
  active,
  onClick,
  icon,
  label,
}: {
  active?: boolean;
  onClick: () => void;
  icon: ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-[11.5px] font-medium transition-colors",
        active
          ? "border-ink bg-ink text-ivory"
          : "border-border bg-white text-ink-muted hover:border-ink-faint/60 hover:text-ink",
      )}
      aria-pressed={active}
    >
      {icon}
      {label}
    </button>
  );
}

// ── Empty state ────────────────────────────────────────────────────────────

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-md border border-dashed border-border bg-white p-8 text-center">
      <Camera size={22} strokeWidth={1.2} className="mx-auto text-ink-faint" />
      <p className="mt-2 text-[12.5px] text-ink-muted">{message}</p>
    </div>
  );
}

// ── Print sheet (hidden except in @media print) ────────────────────────────

function PrintSheet({
  shots,
  vipById,
}: {
  shots: PhotoShot[];
  vipById: Map<string, PhotoVIP>;
}) {
  const byEvent = useMemo(() => {
    const map = new Map<string, PhotoShot[]>();
    for (const ev of PHOTO_EVENTS) map.set(ev.id, []);
    for (const s of shots) map.get(s.event)?.push(s);
    return PHOTO_EVENTS.map((ev) => ({
      id: ev.id,
      label: ev.label,
      items: (map.get(ev.id) ?? []).sort((a, b) => a.sort_order - b.sort_order),
    })).filter((g) => g.items.length > 0);
  }, [shots]);

  return (
    <div className="shot-list-print" aria-hidden>
      {byEvent.map((group) => {
        const meta = PHOTO_EVENT_META[group.id];
        return (
          <section key={group.id} className="print-page">
            <header>
              <p className="print-eyebrow">Shot list · {group.label}</p>
              <h2 className="print-title">{group.label}</h2>
              <p className="print-sub">{meta?.description}</p>
            </header>
            <ul>
              {group.items.map((s) => {
                const linked = s.vip_ids
                  .map((id) => vipById.get(id)?.name)
                  .filter(Boolean)
                  .join(", ");
                return (
                  <li key={s.id}>
                    <span className="print-box" aria-hidden>
                      {s.checked ? "\u2713" : ""}
                    </span>
                    <span className="print-title-line">
                      <span className="print-pri">
                        {s.priority === "must" ? "[MUST]" : "[PREF]"}
                      </span>{" "}
                      {s.title}
                      {s.moment ? <em>  — {s.moment}</em> : null}
                    </span>
                    {(s.description || linked) && (
                      <div className="print-meta">
                        {linked && <span>VIPs: {linked}</span>}
                        {s.description && <span> · {s.description}</span>}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

function ShotListPrintStyles() {
  return (
    <style jsx global>{`
      .shot-list-print {
        display: none;
      }
      @media print {
        /* Hide everything except the print sheet. */
        body * {
          visibility: hidden;
        }
        .shot-list-print,
        .shot-list-print * {
          visibility: visible;
        }
        .shot-list-print {
          display: block;
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          font-family: Georgia, serif;
          color: #1b1b1b;
          padding: 0;
        }
        .shot-list-print .print-page {
          page-break-after: always;
          padding: 32px 36px;
        }
        .shot-list-print .print-page:last-child {
          page-break-after: auto;
        }
        .shot-list-print .print-eyebrow {
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
          font-size: 10px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #8a6f1c;
          margin: 0 0 4px 0;
        }
        .shot-list-print .print-title {
          font-size: 28px;
          margin: 0 0 6px 0;
        }
        .shot-list-print .print-sub {
          font-size: 12px;
          color: #555;
          margin: 0 0 18px 0;
        }
        .shot-list-print ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .shot-list-print li {
          display: grid;
          grid-template-columns: 22px 1fr;
          column-gap: 10px;
          padding: 8px 0;
          border-bottom: 1px solid #eee;
          font-size: 12.5px;
        }
        .shot-list-print .print-box {
          display: inline-block;
          width: 14px;
          height: 14px;
          border: 1.2px solid #333;
          border-radius: 3px;
          margin-top: 2px;
          text-align: center;
          line-height: 14px;
          font-size: 11px;
        }
        .shot-list-print .print-pri {
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
          font-size: 10px;
          color: #8a6f1c;
          margin-right: 4px;
        }
        .shot-list-print .print-meta {
          grid-column: 2;
          font-size: 11px;
          color: #666;
          margin-top: 2px;
        }
      }

      /* ── Live mode ─────────────────────────────────────────────────── */
      .shot-list-root.live-mode .live-row {
        padding-top: 14px;
        padding-bottom: 14px;
      }
      .shot-list-root.live-mode .live-check {
        height: 28px;
        width: 28px;
      }
      .shot-list-root.live-mode .live-check > div {
        height: 28px;
        width: 28px;
      }
    `}</style>
  );
}
