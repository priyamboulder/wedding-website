"use client";

// ── UpcomingTasksPanel ──────────────────────────────────────────────────────
// Reusable surface that lists the next N incomplete checklist tasks for a
// vendor workspace category. Drives these contexts:
//   • Tab-specific panels (limit ~5, tab filter applied)
//   • Persistent header strip (collapses to the banner variant)
//   • Bucketed summaries elsewhere in the app (limit ~7, grouped by due)
//
// Shared state: we subscribe directly to useChecklistStore — completing here
// marks the same task done on the /checklist page. No copy.

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  Calendar as CalendarIcon,
  Check,
  ChevronRight,
  Clock,
  Flag,
  MoreHorizontal,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  ChecklistItem,
  WorkspaceCategoryTag,
  WorkspaceTabTag,
} from "@/types/checklist";
import { useChecklistStore } from "@/stores/checklist-store";
import {
  bucketForDeadline,
  groupByBucket,
  relativeTimeLabel,
  type DueBucket,
  type UpcomingTask,
} from "@/lib/workspace/category-queries";
import { Eyebrow, EmptyRow } from "@/components/workspace/blocks/primitives";

// ── Props ───────────────────────────────────────────────────────────────────

export interface UpcomingTasksPanelProps {
  category: WorkspaceCategoryTag;
  // When set, filters to tasks with workspace_tab_tags including `tab`.
  tab?: WorkspaceTabTag;
  // Rows to show. Default 5.
  limit?: number;
  // "buckets" = group under Overdue / This Week / Next 2 Weeks / Later.
  // "simple"  = only Overdue + Coming up (everything else merged).
  // "flat"    = single ordered list.
  grouping?: "buckets" | "simple" | "flat";
  // Called when user clicks the row body (chevron). Receives the task.
  // If omitted, no navigation happens.
  onTaskOpen?: (task: ChecklistItem) => void;
  // Panel heading override. Default is derived from category + tab.
  title?: string;
  // Compact = smaller padding, used inside cards.
  compact?: boolean;
  className?: string;
}

// ── Priority / bucket styling ───────────────────────────────────────────────

const PRIORITY_TONE: Record<ChecklistItem["priority"], string> = {
  critical: "text-rose",
  high: "text-saffron",
  medium: "text-ink-muted",
  low: "text-ink-faint",
};

const BUCKET_LABEL: Record<DueBucket, string> = {
  overdue: "Overdue",
  this_week: "This week",
  next_two_weeks: "Next 2 weeks",
  later: "Later",
  no_date: "No deadline",
};

const BUCKET_BORDER: Record<DueBucket, string> = {
  overdue: "border-rose/40 bg-rose-pale/30",
  this_week: "border-saffron/40 bg-saffron-pale/20",
  next_two_weeks: "border-border bg-ivory-warm/30",
  later: "border-border bg-white",
  no_date: "border-border bg-white",
};

// ── Panel ───────────────────────────────────────────────────────────────────

export function UpcomingTasksPanel({
  category,
  tab,
  limit = 5,
  grouping = "flat",
  onTaskOpen,
  title,
  compact,
  className,
}: UpcomingTasksPanelProps) {
  // Live subscription — snapshot shape never changes so React re-renders on
  // every checklist mutation.
  const items = useChecklistStore((s) => s.items);
  const weddingDate = useChecklistStore((s) => s.weddingDate);
  const setItemStatus = useChecklistStore((s) => s.setItemStatus);
  const snoozeItem = useChecklistStore((s) => s.snoozeItem);

  // Recompute rows when items/date change. We don't use the store selector
  // here because we want a stable `now` per render to avoid bucket flicker.
  const [now] = useState(() => new Date());

  const rows = useMemo<UpcomingTask[]>(() => {
    const scoped = items.filter((it) => {
      if (!it.category_tags?.includes(category)) return false;
      if (tab && !it.workspace_tab_tags?.includes(tab)) return false;
      if (it.status === "done" || it.status === "not_applicable") return false;
      return true;
    });

    // Inline deadline + priority sort. We keep this local (not the store
    // selector) so <Panel> is also usable with injected items in tests.
    const enriched: UpcomingTask[] = scoped.map((it) => {
      const deadline = it.due_date
        ? new Date(it.due_date)
        : computeFallbackDeadline(it, weddingDate);
      const bucket = bucketForDeadline(deadline, now);
      const hoursUntil = deadline
        ? (deadline.getTime() - now.getTime()) / (1000 * 60 * 60)
        : Infinity;
      const atRisk = deadline ? deadline.getTime() < now.getTime() : false;
      const isCriticalSoon =
        (it.priority === "critical" || it.priority === "high") &&
        hoursUntil <= 48 &&
        hoursUntil > -1;
      return { item: it, deadline, bucket, atRisk, isCriticalSoon };
    });

    enriched.sort((a, b) => {
      const ta = a.deadline ? a.deadline.getTime() : Number.MAX_SAFE_INTEGER;
      const tb = b.deadline ? b.deadline.getTime() : Number.MAX_SAFE_INTEGER;
      if (ta !== tb) return ta - tb;
      const prio: Record<string, number> = {
        critical: 0,
        high: 1,
        medium: 2,
        low: 3,
      };
      return (prio[a.item.priority] ?? 99) - (prio[b.item.priority] ?? 99);
    });

    return enriched.slice(0, limit);
  }, [items, category, tab, limit, weddingDate, now]);

  // Keyboard nav: j/k move, x complete, s snooze-1w, / focus.
  const [focusIdx, setFocusIdx] = useState(0);
  const rowRefs = useRef<Array<HTMLLIElement | null>>([]);

  useEffect(() => {
    if (focusIdx >= rows.length) setFocusIdx(Math.max(0, rows.length - 1));
  }, [rows.length, focusIdx]);

  const onKeyDown = useCallback(
    (e: KeyboardEvent<HTMLElement>) => {
      if (rows.length === 0) return;
      if (e.key === "j" || e.key === "ArrowDown") {
        e.preventDefault();
        setFocusIdx((i) => Math.min(rows.length - 1, i + 1));
      } else if (e.key === "k" || e.key === "ArrowUp") {
        e.preventDefault();
        setFocusIdx((i) => Math.max(0, i - 1));
      } else if (e.key === "x") {
        e.preventDefault();
        const row = rows[focusIdx];
        if (row) setItemStatus(row.item.id, "done");
      } else if (e.key === "s") {
        e.preventDefault();
        const row = rows[focusIdx];
        if (row) snoozeItem(row.item.id, 7);
      } else if (e.key === "Enter") {
        e.preventDefault();
        const row = rows[focusIdx];
        if (row) onTaskOpen?.(row.item);
      }
    },
    [rows, focusIdx, setItemStatus, snoozeItem, onTaskOpen],
  );

  useEffect(() => {
    rowRefs.current[focusIdx]?.focus();
  }, [focusIdx]);

  // Resolve label.
  const resolvedTitle =
    title ?? (tab ? `Upcoming · ${TAB_LABEL[tab]}` : "Up next");

  // ── Empty state ──────────────────────────────────────────────────────────
  if (rows.length === 0) {
    return (
      <div
        className={cn(
          "rounded-lg border border-border bg-white",
          compact ? "p-3" : "p-4",
          className,
        )}
      >
        <PanelHeader title={resolvedTitle} count={0} />
        <EmptyRow>
          You&rsquo;re all caught up on {CATEGORY_LABEL[category]}.
        </EmptyRow>
      </div>
    );
  }

  // ── Flat list ────────────────────────────────────────────────────────────
  if (grouping === "flat") {
    return (
      <div
        className={cn(
          "rounded-lg border border-border bg-white",
          compact ? "p-3" : "p-4",
          className,
        )}
      >
        <PanelHeader title={resolvedTitle} count={rows.length} />
        <ol
          className="mt-3 flex flex-col gap-1 outline-none"
          tabIndex={0}
          onKeyDown={onKeyDown}
          aria-label="Upcoming tasks, use j/k to navigate, x to complete, s to snooze"
        >
          {rows.map((row, idx) => (
            <TaskRow
              key={row.item.id}
              row={row}
              focused={idx === focusIdx}
              onFocus={() => setFocusIdx(idx)}
              liRef={(el) => {
                rowRefs.current[idx] = el;
              }}
              onComplete={() => setItemStatus(row.item.id, "done")}
              onSnooze={(days) => snoozeItem(row.item.id, days)}
              onOpen={() => onTaskOpen?.(row.item)}
            />
          ))}
        </ol>
      </div>
    );
  }

  // ── Bucketed / simple ─────────────────────────────────────────────────────
  const grouped = groupByBucket(rows);
  let order: DueBucket[];
  let labelOverride: Partial<Record<DueBucket, string>> = {};
  if (grouping === "simple") {
    // Collapse this_week/next_two_weeks/later/no_date into one "Coming up" bucket.
    order = ["overdue", "this_week"];
    labelOverride = { this_week: "Coming up" };
    grouped.this_week = [
      ...grouped.this_week,
      ...grouped.next_two_weeks,
      ...grouped.later,
      ...grouped.no_date,
    ];
  } else {
    order = ["overdue", "this_week", "next_two_weeks", "later", "no_date"];
  }

  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-white",
        compact ? "p-3" : "p-4",
        className,
      )}
    >
      <PanelHeader title={resolvedTitle} count={rows.length} />
      {/* Bucketed view: buckets are section divs containing their own <ol>
          so <TaskRow>'s <li> never nests inside another <li>. */}
      <div
        className="mt-3 flex flex-col gap-3 outline-none"
        tabIndex={0}
        onKeyDown={onKeyDown}
        role="list"
        aria-label="Upcoming tasks, use j/k to navigate, x to complete, s to snooze"
      >
        {order.map((bucket) => {
          const bucketRows = grouped[bucket];
          if (!bucketRows.length) return null;
          return (
            <section key={bucket} className="flex flex-col gap-1">
              <Eyebrow className="mb-1 flex items-center gap-2">
                <span
                  className={cn(
                    "inline-block h-1.5 w-1.5 rounded-full",
                    bucket === "overdue"
                      ? "bg-rose"
                      : bucket === "this_week"
                        ? "bg-saffron"
                        : "bg-ink-faint",
                  )}
                />
                {labelOverride[bucket] ?? BUCKET_LABEL[bucket]} · {bucketRows.length}
              </Eyebrow>
              <ol className="flex flex-col gap-1">
                {bucketRows.map((row) => {
                  const idx = rows.indexOf(row);
                  return (
                    <TaskRow
                      key={row.item.id}
                      row={row}
                      focused={idx === focusIdx}
                      onFocus={() => setFocusIdx(idx)}
                      liRef={(el) => {
                        rowRefs.current[idx] = el;
                      }}
                      onComplete={() => setItemStatus(row.item.id, "done")}
                      onSnooze={(days) => snoozeItem(row.item.id, days)}
                      onOpen={() => onTaskOpen?.(row.item)}
                    />
                  );
                })}
              </ol>
            </section>
          );
        })}
      </div>
    </div>
  );
}

// ── Row ─────────────────────────────────────────────────────────────────────

interface TaskRowProps {
  row: UpcomingTask;
  focused: boolean;
  onFocus: () => void;
  liRef: (el: HTMLLIElement | null) => void;
  onComplete: () => void;
  onSnooze: (days: number) => void;
  onOpen: () => void;
}

function TaskRow({ row, focused, onFocus, liRef, onComplete, onSnooze, onOpen }: TaskRowProps) {
  const { item, deadline, bucket, isCriticalSoon } = row;
  const [menuOpen, setMenuOpen] = useState(false);
  const menuBtnRef = useRef<HTMLButtonElement>(null);

  const dateLabel = deadline ? relativeTimeLabel(deadline) : "No deadline";
  const dateAbs = deadline
    ? deadline.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : undefined;

  return (
    <li
      ref={liRef}
      tabIndex={-1}
      onFocus={onFocus}
      className={cn(
        "group flex items-center gap-2.5 rounded-md border px-2.5 py-2 outline-none transition-colors",
        BUCKET_BORDER[bucket],
        focused && "ring-1 ring-saffron/40",
        isCriticalSoon && "animate-heart-pulse",
      )}
      aria-label={`${item.title}, ${dateLabel}, priority ${item.priority}`}
    >
      {/* Checkbox — optimistic complete */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onComplete();
        }}
        className="flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border border-ink-faint bg-white transition-colors hover:border-sage hover:bg-sage-pale/40"
        aria-label={`Complete task ${item.title}`}
      >
        <Check size={11} strokeWidth={2.5} className="opacity-0 group-hover:opacity-60" />
      </button>

      {/* Title + phase badge */}
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <button
          type="button"
          onClick={onOpen}
          className="min-w-0 flex-1 truncate text-left text-[13px] text-ink hover:text-saffron"
        >
          {item.title}
        </button>
        <PhaseBadge phaseId={item.phase_id} />
      </div>

      {/* Due chip */}
      <span
        title={dateAbs}
        className={cn(
          "hidden items-center gap-1 font-mono text-[10.5px] uppercase tracking-[0.06em] sm:inline-flex",
          bucket === "overdue"
            ? "text-rose"
            : bucket === "this_week"
              ? "text-saffron"
              : "text-ink-faint",
        )}
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {bucket === "overdue" ? <AlertTriangle size={11} /> : <Clock size={11} />}
        {dateLabel}
      </span>

      {/* Priority flag */}
      {(item.priority === "critical" || item.priority === "high") && (
        <Flag
          size={12}
          strokeWidth={2}
          className={cn("shrink-0", PRIORITY_TONE[item.priority])}
          aria-label={`Priority ${item.priority}`}
        />
      )}
      {isCriticalSoon && (
        <Zap
          size={12}
          className="shrink-0 text-rose"
          aria-label="Critical and due soon"
        />
      )}

      {/* Menu */}
      <div className="relative">
        <button
          ref={menuBtnRef}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen((v) => !v);
          }}
          className="flex h-6 w-6 items-center justify-center rounded-sm text-ink-faint hover:bg-ivory-warm hover:text-ink"
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          aria-label="Task actions"
        >
          <MoreHorizontal size={14} />
        </button>
        <AnimatePresence>
          {menuOpen && (
            <RowMenu
              onClose={() => setMenuOpen(false)}
              onComplete={() => {
                onComplete();
                setMenuOpen(false);
              }}
              onSnooze={(days) => {
                onSnooze(days);
                setMenuOpen(false);
              }}
              onOpen={() => {
                onOpen();
                setMenuOpen(false);
              }}
            />
          )}
        </AnimatePresence>
      </div>

      <button
        type="button"
        onClick={onOpen}
        className="hidden shrink-0 text-ink-faint hover:text-ink sm:inline-flex"
        aria-label="Open task detail"
      >
        <ChevronRight size={14} />
      </button>
    </li>
  );
}

// ── Row menu (snooze / reassign / open) ─────────────────────────────────────

interface RowMenuProps {
  onClose: () => void;
  onComplete: () => void;
  onSnooze: (days: number) => void;
  onOpen: () => void;
}

function RowMenu({ onClose, onComplete, onSnooze, onOpen }: RowMenuProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const handleKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const t = setTimeout(() => {
      document.addEventListener("mousedown", handleMouse);
    }, 0);
    document.addEventListener("keydown", handleKey);
    return () => {
      clearTimeout(t);
      document.removeEventListener("mousedown", handleMouse);
      document.removeEventListener("keydown", handleKey);
    };
  }, [onClose]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.12 }}
      role="menu"
      className="absolute right-0 top-7 z-10 w-44 overflow-hidden rounded-md border border-border bg-white shadow-[0_6px_20px_rgba(26,26,26,0.08)]"
    >
      <MenuButton onClick={onComplete}>
        <Check size={12} /> Mark complete
      </MenuButton>
      <MenuSeparator label="Snooze" />
      <MenuButton onClick={() => onSnooze(1)}>
        <CalendarIcon size={12} /> 1 day
      </MenuButton>
      <MenuButton onClick={() => onSnooze(7)}>
        <CalendarIcon size={12} /> 1 week
      </MenuButton>
      <MenuButton onClick={() => onSnooze(14)}>
        <CalendarIcon size={12} /> 2 weeks
      </MenuButton>
      <MenuSeparator />
      <MenuButton onClick={onOpen}>
        <ChevronRight size={12} /> Open detail
      </MenuButton>
    </motion.div>
  );
}

function MenuButton({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className="flex w-full items-center gap-2 px-3 py-2 text-left text-[12px] text-ink hover:bg-ivory-warm"
    >
      {children}
    </button>
  );
}

function MenuSeparator({ label }: { label?: string }) {
  return (
    <div
      className={cn(
        "border-t border-border/60",
        label && "px-3 py-1 font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-faint",
      )}
      style={label ? { fontFamily: "var(--font-mono)" } : undefined}
    >
      {label}
    </div>
  );
}

// ── Panel header + badges ──────────────────────────────────────────────────

function PanelHeader({ title, count }: { title: string; count: number }) {
  return (
    <div className="flex items-center justify-between">
      <Eyebrow>{title}</Eyebrow>
      <span
        className="font-mono text-[10px] tracking-[0.06em] text-ink-faint"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {count}
      </span>
    </div>
  );
}

function PhaseBadge({ phaseId }: { phaseId: string }) {
  // phase-2 → "P2". Compact so it fits on mobile.
  const label = phaseId.replace(/^phase-/, "P");
  return (
    <span
      className="hidden rounded-sm bg-ivory-warm px-1.5 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.1em] text-ink-muted sm:inline"
      style={{ fontFamily: "var(--font-mono)" }}
      aria-label={`Phase ${phaseId}`}
    >
      {label}
    </span>
  );
}

// ── Helpers ─────────────────────────────────────────────────────────────────

// Local fallback deadline calc — keeps UpcomingTasksPanel drop-in-testable
// without importing the full deadlines module when used with hand-built items.
// Matches computeDeadline semantics: due_date override wins, else null.
function computeFallbackDeadline(
  item: ChecklistItem,
  weddingDate: Date | null,
): Date | null {
  if (item.due_date) return new Date(item.due_date);
  if (!weddingDate) return null;
  if (typeof item.daysBeforeWedding === "number") {
    const d = new Date(weddingDate);
    d.setDate(d.getDate() - item.daysBeforeWedding);
    return d;
  }
  return null;
}

const TAB_LABEL: Record<WorkspaceTabTag, string> = {
  // legacy / generic
  vision: "Vision",
  plan: "Plan",
  shortlist: "Shortlist",
  timeline: "Timeline",
  decisions: "Decisions",
  journal: "Journal",
  // shared purpose-built
  shortlist_contract: "Shortlist & Contract",
  day_of: "Day-of",
  deliverables: "Deliverables",
  // photography / videography
  shot_list: "Shot List",
  vips: "VIPs",
  rituals: "Rituals",
  crew: "Crew",
  must_capture: "Must-Capture",
  film_vision: "Film Vision",
  audio_coverage: "Audio & Coverage",
  // catering
  tasting: "Tasting",
  dietary: "Dietary",
  bar: "Bar",
  event_menus: "Event Menus",
  staffing: "Staffing",
  rentals: "Rentals",
  // décor & florals
  mandap: "Mandap",
  reception_stage: "Reception Stage",
  florals: "Floral Plan",
  lighting: "Lighting",
  load_in: "Install Timeline",
  budget: "Budget & Rentals",
  // music & entertainment
  dj_band: "DJ / Band",
  live_performers: "Live Performers",
  song_list: "Song List",
  av_tech: "AV & Tech",
  soundscapes: "Event Soundscapes",
  sangeet_planner: "Sangeet Planner",
  equipment_tech: "Equipment & Technical",
  // guest experiences
  guest_discover: "Discover & Dream",
  guest_shortlist: "Shortlist & Plan",
  guest_inspiration: "Inspiration",
  // hair & makeup
  trial_notes: "Trial Notes",
  bride_looks: "Bride Looks",
  bridal_party: "Bridal Party",
  touch_up: "Touch-ups",
  // venue
  floorplans: "Floorplans",
  capacity_flow: "Capacity & Flow",
  vendor_load_in: "Vendor Load-in",
  catering_rules: "Catering Rules",
  permits: "Permits",
  accommodations: "Accommodations",
  venue_profile: "Venue Profile",
  spaces_layout: "Spaces & Layout",
  logistics_hub: "Logistics Hub",
  rules_restrictions: "Rules & Restrictions",
  contacts_emergency: "Contacts & Emergency",
  // (retained for backwards-compat with older checklist tags)
  discovery_feel: "Dream & Discover",
  venue_comparison: "Venue Shortlist",
  site_visit_notes: "Site Visits",
  dream_discover: "Dream & Discover",
  venue_shortlist: "Venue Shortlist",
  spaces_flow: "Spaces & Flow",
  logistics_rules: "Logistics & Rules",
  site_visits: "Site Visits",
  documents: "Documents",
  // mehndi
  design_refs: "Design References",
  bride_mehndi: "Bride Mehndi",
  guest_queue: "Guest Queue",
  guest_mehndi: "Guest Mehendi",
  // transportation
  plan_logistics: "Plan & Logistics",
  baraat: "Baraat",
  shuttle_transport: "Shuttle & Guest Transport",
  // stationery
  save_the_dates: "Save-the-Dates",
  invitation_suite: "Invitation Suite",
  event_cards: "Event Cards",
  day_of_paper: "Day-of Paper",
  print_schedule: "Print Schedule",
  suite_builder: "Suite Builder",
  guest_print_matrix: "Guest Print Matrix",
  production_timeline: "Production Timeline",
  // priest / pandit
  ritual_sequence: "Ritual Sequence",
  mantras: "Mantras",
  samagri: "Samagri",
  family_roles: "Family Roles",
  ceremony_script: "Ceremony Script",
  ceremony_logistics: "Ceremony Logistics",
  // wardrobe
  fittings: "Fittings",
  wardrobe_looks: "Looks",
  bridal_party_attire: "Bridal Party Attire",
  delivery: "Delivery",
  // jewelry
  bridal_jewelry: "Bridal Jewelry",
  groom_jewelry: "Groom's Jewelry",
  family_heirlooms: "Family Heirlooms",
  fittings_coordination: "Fittings & Coordination",
  // cake & sweets
  wedding_cake: "Cake Design",
  mithai: "Mithai",
  dessert_tables: "Dessert Tables",
  tasting_approval: "Tastings",
  service_plan: "Service Plan",
  // gifting
  welcome_bags: "Welcome Bags",
  trousseau_packaging: "Trousseau Packaging",
  return_favors: "Return Favors",
  family_exchanges: "Family Exchanges",
  thank_you: "Thank-You",
  // travel & accommodations
  hotel_strategy: "Hotel Strategy",
  room_blocks: "Room Blocks",
  guest_travel: "Guest Travel",
  welcome_experience: "Welcome Experience",
  group_flights: "Group Flights",
  shuttles: "Shuttles",
  rate_negotiations: "Rate Negotiations",
  attrition_cutoffs: "Attrition & Cutoffs",
};

const CATEGORY_LABEL: Record<WorkspaceCategoryTag, string> = {
  photography: "photography",
  videography: "videography",
  catering: "catering",
  decor_florals: "décor & florals",
  entertainment: "entertainment",
  guest_experiences: "guest experiences",
  hmua: "hair & makeup",
  venue: "venue",
  mehndi: "mehndi",
  transportation: "transportation",
  stationery: "stationery",
  pandit_ceremony: "priest",
  wardrobe: "wardrobe",
  jewelry: "jewelry",
  cake_sweets: "cake & sweets",
  gifting: "gifting",
  travel_accommodations: "travel & accommodations",
};
