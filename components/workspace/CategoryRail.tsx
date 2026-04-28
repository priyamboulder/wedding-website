"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Baby,
  BookOpen,
  Cake,
  Calendar,
  Camera,
  ChevronDown,
  ChevronRight,
  Clock,
  Flower2,
  FolderArchive,
  GlassWater,
  Heart,
  Images,
  Martini,
  PartyPopper,
  Pin,
  Plane,
  Sparkles,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { TodayCard } from "@/components/workspace/shared/TodayCard";
import type {
  ExtraPageId,
  WorkspaceCategory,
  WorkspaceCategorySlug,
  WorkspaceSelection,
} from "@/types/workspace";
import {
  CATEGORY_ICONS,
  VendorCategoryStrip,
  type VendorCategoryInput,
} from "@/components/workspace/VendorCategoryStrip";

// ── Extra (non-vendor) rail entries ────────────────────────────────────────

type ExtraEntry = {
  id: ExtraPageId;
  name: string;
  icon: LucideIcon;
};

// Combined Memories & Keepsakes section — formerly two sections (Celebrations
// & Trip + Keepsakes). Order is celebrations first, keepsakes after, matching
// the rough chronology the couple lives through.
const MEMORIES_ENTRIES: ExtraEntry[] = [
  { id: "bridal_shower", name: "Bridal Shower", icon: Flower2 },
  { id: "bachelorette", name: "Bachelorette", icon: Martini },
  { id: "bachelor", name: "Bachelor", icon: GlassWater },
  { id: "welcome_events", name: "Welcome Events", icon: PartyPopper },
  { id: "honeymoon", name: "Honeymoon", icon: Plane },
  { id: "engagement_shoot", name: "Engagement Shoot", icon: Camera },
  { id: "photos_videos", name: "Photos & Videos", icon: Images },
  { id: "notes_ideas", name: "Notes & Ideas", icon: BookOpen },
];

// "After the wedding" entries live in a dedicated sidebar section that only
// surfaces once the wedding has passed (or been manually unlocked). First
// Anniversary, Baby Shower, and Baby's First Birthday follow the same
// discovery-led "Next Chapter" pattern.
const AFTER_THE_WEDDING_ENTRIES: ExtraEntry[] = [
  { id: "post_wedding", name: "Post-Wedding", icon: Heart },
  { id: "first_anniversary", name: "First Anniversary", icon: Sparkles },
  { id: "baby_shower", name: "Baby Shower", icon: Baby },
  { id: "first_birthday", name: "First Birthday", icon: Cake },
];

// Display order for vendor categories inside the single "Wedding Workspaces"
// section. Order is the source of truth for what the couple sees in the rail
// — any slug from seed data not listed here falls through to the end so new
// categories still appear before they're explicitly placed.
const VENDOR_ORDER: WorkspaceCategorySlug[] = [
  "photography",
  "videography",
  "decor_florals",
  "stationery",
  "catering",
  "entertainment",
  "guest_experiences",
  "hmua",
  "venue",
  "mehndi",
  "pandit_ceremony",
  "cake_sweets",
  "wardrobe",
  "jewelry",
  "transportation",
  "travel_accommodations",
  "gifting",
];

// Rail widths. The outer <aside> always reserves the collapsed footprint
// unless the user pins the sidebar — in the default unpinned state the
// expanded view floats over the main content as an overlay.
const COLLAPSED_WIDTH = 60;
const EXPANDED_WIDTH = 260;
const COLLAPSE_DELAY_MS = 300;

export function CategoryRail({
  categories,
  selection,
  onSelect,
}: {
  categories: WorkspaceCategory[];
  selection: WorkspaceSelection;
  onSelect: (sel: WorkspaceSelection) => void;
}) {
  const vendorOrder = useWorkspaceStore((s) => s.vendorOrder);

  const [pinned, setPinned] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focusWithin, setFocusWithin] = useState(false);
  const collapseTimerRef = useRef<number | null>(null);

  const expanded = pinned || hovered || focusWithin;

  const cancelScheduledCollapse = () => {
    if (collapseTimerRef.current !== null) {
      window.clearTimeout(collapseTimerRef.current);
      collapseTimerRef.current = null;
    }
  };

  const scheduleCollapse = () => {
    cancelScheduledCollapse();
    collapseTimerRef.current = window.setTimeout(() => {
      setHovered(false);
      collapseTimerRef.current = null;
    }, COLLAPSE_DELAY_MS);
  };

  useEffect(() => {
    return () => {
      if (collapseTimerRef.current !== null) {
        window.clearTimeout(collapseTimerRef.current);
      }
    };
  }, []);

  const orderedCategories = useMemo(
    () => orderRawCategories(categories, vendorOrder),
    [categories, vendorOrder],
  );

  // After a row is clicked, the button keeps keyboard focus — which would
  // hold the rail open via focusWithin even after the mouse leaves, forcing
  // an extra click elsewhere to dismiss. Blur the active element and snap
  // state closed (unless pinned) so one click commits + dismisses.
  const handleSelect = (sel: WorkspaceSelection) => {
    onSelect(sel);
    if (pinned) return;
    if (typeof document !== "undefined") {
      const active = document.activeElement as HTMLElement | null;
      if (active && typeof active.blur === "function") active.blur();
    }
    cancelScheduledCollapse();
    setHovered(false);
    setFocusWithin(false);
  };

  const activeVendorSlug =
    selection.type === "vendor" ? selection.slug : null;
  const activeExtraId = selection.type === "extra" ? selection.id : null;
  const financeActive = selection.type === "finance";
  const documentsActive = selection.type === "documents";
  const eventsActive = selection.type === "events";
  const scheduleActive = selection.type === "schedule";

  return (
    <aside
      className="relative hidden shrink-0 lg:block"
      style={{ width: pinned ? EXPANDED_WIDTH : COLLAPSED_WIDTH }}
      role="navigation"
      aria-label="Workspace categories"
    >
      <div
        onMouseEnter={() => {
          cancelScheduledCollapse();
          setHovered(true);
        }}
        onMouseLeave={() => {
          if (!pinned) scheduleCollapse();
        }}
        onFocusCapture={() => {
          cancelScheduledCollapse();
          setFocusWithin(true);
        }}
        onBlurCapture={(e) => {
          const next = e.relatedTarget as Node | null;
          if (!e.currentTarget.contains(next)) {
            setFocusWithin(false);
          }
        }}
        className={cn(
          "absolute left-0 top-0 flex h-full flex-col overflow-hidden border-r border-border bg-white",
          "transition-[width,box-shadow] duration-200 ease-out",
          expanded ? "z-40" : "z-30",
          !pinned && expanded &&
            "shadow-[0_24px_60px_-20px_rgba(26,26,26,0.22)]",
        )}
        style={{ width: expanded ? EXPANDED_WIDTH : COLLAPSED_WIDTH }}
        aria-expanded={expanded}
      >
        {/* Header row — pin toggle appears once expanded */}
        <div className="flex h-10 shrink-0 items-center justify-end pr-2">
          {expanded && (
            <button
              type="button"
              onClick={() => setPinned((p) => !p)}
              aria-label={pinned ? "Unpin sidebar" : "Pin sidebar open"}
              aria-pressed={pinned}
              title={pinned ? "Unpin sidebar" : "Pin sidebar open"}
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded-md transition-colors",
                pinned
                  ? "text-gold hover:bg-gold-pale/40"
                  : "text-ink-faint hover:bg-ivory-warm hover:text-ink",
              )}
            >
              <Pin
                size={12}
                strokeWidth={1.8}
                className={cn("transition-transform", pinned && "rotate-45")}
              />
            </button>
          )}
        </div>

        <nav className="sidebar-scroll flex-1 overflow-y-auto overflow-x-hidden pb-8">
          {expanded ? (
            <ExpandedContent
              orderedCategories={orderedCategories}
              activeVendorSlug={activeVendorSlug}
              activeExtraId={activeExtraId}
              financeActive={financeActive}
              documentsActive={documentsActive}
              eventsActive={eventsActive}
              scheduleActive={scheduleActive}
              onSelect={handleSelect}
            />
          ) : (
            <CollapsedContent
              orderedCategories={orderedCategories}
              activeVendorSlug={activeVendorSlug}
              activeExtraId={activeExtraId}
              financeActive={financeActive}
              documentsActive={documentsActive}
              eventsActive={eventsActive}
              scheduleActive={scheduleActive}
              onSelect={handleSelect}
            />
          )}
        </nav>
      </div>
    </aside>
  );
}

// ── Expanded layout ───────────────────────────────────────────────────────

function ExpandedContent({
  orderedCategories,
  activeVendorSlug,
  activeExtraId,
  financeActive,
  documentsActive,
  eventsActive,
  scheduleActive,
  onSelect,
}: {
  orderedCategories: WorkspaceCategory[];
  activeVendorSlug: WorkspaceCategorySlug | null;
  activeExtraId: ExtraPageId | null;
  financeActive: boolean;
  documentsActive: boolean;
  eventsActive: boolean;
  scheduleActive: boolean;
  onSelect: (sel: WorkspaceSelection) => void;
}) {
  return (
    <>
      <div className="px-3 pt-2">
        <TodayCard />
      </div>
      <div className="mx-6 mt-4 border-t border-border" aria-hidden />

      <div className="px-3 pt-3">
        <UtilityRow
          icon={Wallet}
          label="Finance"
          active={financeActive}
          onClick={() => onSelect({ type: "finance" })}
        />
      </div>
      <div className="px-3 pt-1.5">
        <UtilityRow
          icon={FolderArchive}
          label="Documents"
          active={documentsActive}
          onClick={() => onSelect({ type: "documents" })}
        />
      </div>
      <div className="mx-6 mt-3 border-t border-border" aria-hidden />

      <CollapsibleSection label="Wedding Workspaces" defaultOpen={true}>
        <ul className="space-y-0.5" role="list">
          <EventsRow
            active={eventsActive}
            onClick={() => onSelect({ type: "events" })}
          />
          <ScheduleRow
            active={scheduleActive}
            onClick={() => onSelect({ type: "schedule" })}
          />
        </ul>
        <VendorCategoryStrip
          categories={orderedCategories.map(
            (c): VendorCategoryInput => ({
              id: c.id,
              slug: c.slug,
              name: c.name,
            }),
          )}
          activeSlug={activeVendorSlug}
          onSelect={(slug) => onSelect({ type: "vendor", slug })}
        />
      </CollapsibleSection>

      <CollapsibleSection label="Memories & Keepsakes" defaultOpen={true}>
        <ul className="space-y-0.5" role="list">
          {MEMORIES_ENTRIES.map((entry) => (
            <ExtraRow
              key={entry.id}
              entry={entry}
              active={activeExtraId === entry.id}
              onClick={() => onSelect({ type: "extra", id: entry.id })}
            />
          ))}
        </ul>
      </CollapsibleSection>

      <CollapsibleSection label="After the Wedding" defaultOpen={true}>
        <ul className="space-y-0.5" role="list">
          {AFTER_THE_WEDDING_ENTRIES.map((entry) => (
            <ExtraRow
              key={entry.id}
              entry={entry}
              active={activeExtraId === entry.id}
              onClick={() => onSelect({ type: "extra", id: entry.id })}
            />
          ))}
        </ul>
      </CollapsibleSection>
    </>
  );
}

// ── Collapsed (icon-only) layout ──────────────────────────────────────────

function CollapsedContent({
  orderedCategories,
  activeVendorSlug,
  activeExtraId,
  financeActive,
  documentsActive,
  eventsActive,
  scheduleActive,
  onSelect,
}: {
  orderedCategories: WorkspaceCategory[];
  activeVendorSlug: WorkspaceCategorySlug | null;
  activeExtraId: ExtraPageId | null;
  financeActive: boolean;
  documentsActive: boolean;
  eventsActive: boolean;
  scheduleActive: boolean;
  onSelect: (sel: WorkspaceSelection) => void;
}) {
  return (
    <div className="flex flex-col items-center gap-0.5 px-1.5 pt-1">
      <div className="pb-1">
        <TodayCard variant="collapsed" />
      </div>
      <RailDivider />
      <IconRailRow
        icon={Wallet}
        label="Finance"
        active={financeActive}
        onClick={() => onSelect({ type: "finance" })}
      />
      <IconRailRow
        icon={FolderArchive}
        label="Documents"
        active={documentsActive}
        onClick={() => onSelect({ type: "documents" })}
      />
      <RailDivider />
      <IconRailRow
        icon={Calendar}
        label="Events"
        active={eventsActive}
        onClick={() => onSelect({ type: "events" })}
      />
      <IconRailRow
        icon={Clock}
        label="Schedule"
        active={scheduleActive}
        onClick={() => onSelect({ type: "schedule" })}
      />
      {orderedCategories.map((cat) => {
        const Icon = CATEGORY_ICONS[cat.slug] ?? Sparkles;
        return (
          <IconRailRow
            key={cat.slug}
            icon={Icon}
            label={cat.name}
            active={cat.slug === activeVendorSlug}
            onClick={() => onSelect({ type: "vendor", slug: cat.slug })}
          />
        );
      })}
      <RailDivider />
      {MEMORIES_ENTRIES.map((entry) => (
        <IconRailRow
          key={entry.id}
          icon={entry.icon}
          label={entry.name}
          active={activeExtraId === entry.id}
          onClick={() => onSelect({ type: "extra", id: entry.id })}
        />
      ))}
      <RailDivider />
      {AFTER_THE_WEDDING_ENTRIES.map((entry) => (
        <IconRailRow
          key={entry.id}
          icon={entry.icon}
          label={entry.name}
          active={activeExtraId === entry.id}
          onClick={() => onSelect({ type: "extra", id: entry.id })}
        />
      ))}
    </div>
  );
}

function RailDivider() {
  return (
    <span
      aria-hidden
      className="my-1.5 block h-px w-6 shrink-0 bg-border"
    />
  );
}

function IconRailRow({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-current={active ? "page" : undefined}
      title={label}
      className={cn(
        "group relative flex h-9 w-9 shrink-0 items-center justify-center rounded-md transition-colors",
        active
          ? "bg-gold-pale/50 text-ink"
          : "text-ink-faint hover:bg-ivory-warm hover:text-ink",
      )}
    >
      {active && (
        <span
          aria-hidden
          className="absolute inset-y-1.5 left-0 w-[2px] rounded-full bg-gold"
        />
      )}
      <Icon
        size={16}
        strokeWidth={1.6}
        className={cn(
          active ? "text-ink" : "text-ink-faint group-hover:text-ink-muted",
        )}
      />
    </button>
  );
}

// Reorders seed categories to match either the couple's custom order (from
// the workspace store) or, if none is set, the default VENDOR_ORDER. Any
// slug not listed in the active order falls through to the end so newly-
// seeded categories still appear in the rail.
function orderRawCategories(
  categories: WorkspaceCategory[],
  customOrder: WorkspaceCategorySlug[] | null,
): WorkspaceCategory[] {
  const activeOrder = customOrder && customOrder.length > 0
    ? customOrder
    : VENDOR_ORDER;
  const rank = new Map(activeOrder.map((slug, i) => [slug, i] as const));
  const fallback = activeOrder.length;
  return [...categories].sort(
    (a, b) => (rank.get(a.slug) ?? fallback) - (rank.get(b.slug) ?? fallback),
  );
}

function CollapsibleSection({
  label,
  defaultOpen,
  children,
}: {
  label: string;
  defaultOpen: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="mt-3 border-t border-border/60 pt-3">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between px-6 py-2 text-left transition-colors hover:bg-ivory-warm/40"
      >
        <span
          className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-muted"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {label}
        </span>
        <ChevronDown
          size={12}
          strokeWidth={1.8}
          className={cn(
            "text-ink-faint transition-transform",
            open ? "rotate-0" : "-rotate-90",
          )}
        />
      </button>
      {open && <div className="px-3 pb-1 pt-1">{children}</div>}
    </section>
  );
}

function ExtraRow({
  entry,
  active,
  onClick,
}: {
  entry: ExtraEntry;
  active: boolean;
  onClick: () => void;
}) {
  const Icon = entry.icon;
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "group relative flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-all duration-200",
          active
            ? "bg-gold-pale/25 text-ink"
            : "text-ink-muted hover:bg-ivory-warm/50 hover:text-ink-soft",
        )}
        aria-current={active ? "page" : undefined}
      >
        {active && (
          <span
            className="absolute left-1 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-gold"
            aria-hidden
          />
        )}
        <Icon
          size={16}
          strokeWidth={1.5}
          className={cn(
            "shrink-0 transition-colors",
            active
              ? "text-ink"
              : "text-ink-faint group-hover:text-ink-muted",
          )}
        />
        <span className="block flex-1 truncate text-[13px] font-medium leading-tight">
          {entry.name}
        </span>
      </button>
    </li>
  );
}

function UtilityRow({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-all duration-200",
        active
          ? "bg-stone-100 text-ink"
          : "text-ink-muted hover:bg-ivory-warm/50 hover:text-ink-soft",
      )}
      aria-current={active ? "page" : undefined}
    >
      <Icon
        size={18}
        strokeWidth={1.5}
        className={cn(
          "shrink-0 transition-colors",
          active ? "text-gold" : "text-ink-faint group-hover:text-ink-muted",
        )}
      />
      <span className="flex-1 truncate text-[13px] font-medium leading-tight">
        {label}
      </span>
      <ChevronRight
        size={14}
        className={cn(
          "shrink-0 transition-opacity",
          active ? "opacity-50" : "opacity-0 group-hover:opacity-30",
        )}
      />
    </button>
  );
}

// Events is the first row under Wedding Workspaces — same row shape as
// Photography/Videography/etc., but with a non-vendor slug.
function EventsRow({
  active,
  onClick,
}: {
  active: boolean;
  onClick: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        aria-current={active ? "page" : undefined}
        className={cn(
          "group relative flex min-h-[40px] w-full items-center gap-2.5 rounded-md px-3 py-2 text-left transition-colors duration-150",
          active
            ? "bg-gold-pale/30 text-ink"
            : "text-ink-muted hover:bg-ivory-warm/60 hover:text-ink",
        )}
      >
        {active && (
          <span
            aria-hidden
            className="absolute inset-y-1.5 left-0 w-[2px] rounded-full bg-gold"
          />
        )}
        <Calendar
          size={16}
          strokeWidth={1.6}
          className={cn(
            "shrink-0 transition-colors",
            active ? "text-ink" : "text-ink-faint group-hover:text-ink-muted",
          )}
        />
        <span className="min-w-0 flex-1 truncate text-[13px] font-medium leading-tight">
          Events
        </span>
      </button>
    </li>
  );
}

// Schedule is pinned immediately below Events in the "Wedding Workspaces"
// section and is NOT draggable — it always sits here. The row styling
// mirrors EventsRow so the two read as a linked pair.
function ScheduleRow({
  active,
  onClick,
}: {
  active: boolean;
  onClick: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        aria-current={active ? "page" : undefined}
        className={cn(
          "group relative flex min-h-[40px] w-full items-center gap-2.5 rounded-md px-3 py-2 text-left transition-colors duration-150",
          active
            ? "bg-gold-pale/30 text-ink"
            : "text-ink-muted hover:bg-ivory-warm/60 hover:text-ink",
        )}
      >
        {active && (
          <span
            aria-hidden
            className="absolute inset-y-1.5 left-0 w-[2px] rounded-full bg-gold"
          />
        )}
        <Clock
          size={16}
          strokeWidth={1.6}
          className={cn(
            "shrink-0 transition-colors",
            active ? "text-ink" : "text-ink-faint group-hover:text-ink-muted",
          )}
        />
        <span className="min-w-0 flex-1 truncate text-[13px] font-medium leading-tight">
          Schedule
        </span>
      </button>
    </li>
  );
}
