// ── Schedule workspace types ───────────────────────────────────────────────
// The Schedule module owns the per-event, minute-by-minute day-of timeline.
// Items are organised as a dependency graph: most items reference another
// item ("after Baraat arrival + 15 min") rather than carrying an absolute
// time alone. That way when the couple shifts one anchor, everything
// downstream cascades.
//
// Storage: Zustand + localStorage today (see stores/schedule-store.ts),
// Supabase-ready (the data access layer in lib/schedule/data.ts is the
// only place that touches persistence).

import type { Tradition } from "@/types/events";

// ── Category (drives colour + grouping in the timeline) ────────────────────

export type ScheduleCategory =
  | "ceremony"
  | "getting_ready"
  | "reception"
  | "cocktail"
  | "entertainment"
  | "food"
  | "logistics"
  | "photography"
  | "transitions"
  | "cultural"
  | "custom";

export const SCHEDULE_CATEGORY_ORDER: readonly ScheduleCategory[] = [
  "getting_ready",
  "logistics",
  "cultural",
  "ceremony",
  "transitions",
  "cocktail",
  "food",
  "entertainment",
  "reception",
  "photography",
  "custom",
];

// ── Dependency descriptor ──────────────────────────────────────────────────
// `after` — most common: this item starts N minutes after the reference ends
// `before` — rare: this item must END some minutes before reference starts
// `simultaneous` — this item starts at the same time as the reference starts
// `independent` — fallback; treated as if dependency were null
export type ScheduleDependencyType =
  | "after"
  | "before"
  | "simultaneous"
  | "independent";

export interface ScheduleDependency {
  type: ScheduleDependencyType;
  // ID of the item this depends on; null for `independent`.
  referenceId: string | null;
  // Buffer between ref boundary and this item. Negative = intentional overlap.
  gapMinutes: number;
  // Hard = refuse to break without explicit confirmation. Soft = advisory.
  isHard: boolean;
}

// ── Schedule item (the atoms of a timeline) ────────────────────────────────

export type ScheduleTrack =
  | "main"
  | "bride"
  | "groom"
  | "vendor_setup"
  | "custom";

export type ScheduleItemStatus =
  | "draft"
  | "confirmed"
  | "completed"
  | "skipped";

export interface ScheduleItem {
  id: string;
  eventId: string;
  label: string;
  description: string | null;
  // "HH:MM" 24-hour. Always kept in sync with duration → endTime via the
  // data access layer; components should treat these as read-only and go
  // through setItemStart / setItemDuration to mutate.
  startTime: string;
  durationMinutes: number;
  endTime: string;
  category: ScheduleCategory;
  // Fixed items ignore upstream cascades — their startTime is load-bearing
  // (venue access, sunset, vendor arrival). Still editable, but not moved
  // automatically by the resolver.
  isFixed: boolean;
  dependency: ScheduleDependency | null;
  // Legacy free-text assignment list (kept for backwards compat on older
  // items stored in localStorage). `vendorIds` is the canonical field going
  // forward, referencing entries in stores/vendors-store.ts.
  assignedTo: string[];
  vendorIds: string[];
  // Parallel-track lane. Same time slot + different track = concurrent
  // (e.g. bride getting ready while groom's baraat is assembling).
  track: ScheduleTrack;
  location: string | null;
  notesForVendor: string | null;
  // Planner-only notes, never exposed to vendors in the vendor sheet.
  internalNotes: string | null;
  sortOrder: number;
  // Optional category-colour override (rarely used — category drives colour).
  color: string | null;
  // Internal marker so the UI can render a banner on AI-drafted schedules
  // until the couple has reviewed + edited. Cleared on first manual edit.
  isAiDraft?: boolean;
  // Optional backpointer into the template that produced this row (used so
  // "Add from template" can offer omitted items without duplicates).
  templateRefKey?: string | null;
  // Flag for must-capture photo moments — surfaces in the photographer's
  // shot list view.
  isPhotoMoment: boolean;
  // Optional DJ/band music cue — surfaces in the music cue sheet view.
  musicCue: string | null;
  // Day-of tracking state. `draft` until the planner confirms; becomes
  // `completed` when the item ends (or is manually checked off). `skipped`
  // is used when the planner drops the item on the day.
  status: ScheduleItemStatus;
  // Observed times during day-of execution (populated by DayOfTracker).
  actualStartTime: string | null;
  actualEndTime: string | null;
}

// ── Template types (JSON config in lib/schedule/templates/*.json) ──────────

export interface ScheduleTemplateItem {
  // Stable key for dedup when "Add from template" runs. Must be unique
  // within a template.
  key: string;
  label: string;
  defaultDurationMinutes: number;
  category: ScheduleCategory;
  // Index of the item inside THIS template that this one depends on.
  // null + type:"independent" for anchor rows.
  dependency: {
    type: ScheduleDependencyType;
    referenceKey: string | null;
    gapMinutes: number;
    isHard: boolean;
  } | null;
  // Couples can toggle these off at draft time — the AI still surfaces them
  // as "you may have forgotten…" suggestions.
  isOptional: boolean;
  notes: string | null;
  culturalContext: string | null;
  // Default assigned roles (strings, not IDs — vendor names are free text
  // until the couple binds them in the Vendors workspace).
  defaultAssignedTo: string[];
  defaultLocation: string | null;
}

export type ScheduleTemplateEventType =
  | "ceremony"
  | "reception"
  | "baraat"
  | "mehndi"
  | "haldi"
  | "sangeet"
  | "garba"
  | "getting_ready"
  | "cocktail"
  | "vidaai"
  | "welcome_dinner"
  | "farewell_brunch"
  | "nikah"
  | "walima"
  | "anand_karaj"
  | "chuppah"
  | "generic";

export interface ScheduleTemplate {
  id: string;
  tradition: Tradition | "shared" | "western" | "south_asian";
  eventType: ScheduleTemplateEventType;
  // Display metadata for the AI draft picker.
  name: string;
  description: string;
  totalDurationMinutes: number;
  items: ScheduleTemplateItem[];
}

// ── Conflict types (produced by lib/schedule/conflicts.ts) ─────────────────

export type ScheduleConflictSeverity = "hard" | "soft" | "info";

export type ScheduleConflictKind =
  | "overlap"
  | "impossible_dependency"
  | "insufficient_gap"
  | "cross_event_overlap"
  | "vendor_double_booked"
  | "running_late";

export interface ScheduleConflict {
  id: string;
  kind: ScheduleConflictKind;
  severity: ScheduleConflictSeverity;
  message: string;
  // Items involved — the first is the "primary" item the warning docks to.
  itemIds: string[];
  // Optional per-conflict affordance hints consumed by the UI layer.
  suggestedFix?: {
    label: string;
    kind: "shift" | "unlink" | "swap" | "extend" | "split";
  };
}

// ── AI draft options ───────────────────────────────────────────────────────

export interface ScheduleDraftOptions {
  eventId: string;
  // Anchor time — usually the event's start_time from the Events store.
  anchorStartTime: string;
  // Sunset time for the event's date, if we have it (used to tune golden-
  // hour photography blocks). Optional.
  sunsetTime?: string | null;
  // Total guest count — influences transition durations.
  guestCount: number;
  // Which templates to stitch together. Order is significant — the output
  // concatenates them in this order with a default 5-min cushion between.
  templateIds: string[];
  // Venue access time (from the Venue workspace if available) — constrains
  // getting-ready and load-in items.
  venueAccessTime?: string | null;
  // Hard start of the ceremony itself, if the couple has committed to one.
  ceremonyStartTime?: string | null;
}

// ── Day overview (multi-event view) ────────────────────────────────────────

export interface ScheduleDayEventSummary {
  eventId: string;
  eventLabel: string;
  eventType: string;
  date: string;
  venueName: string | null;
  startTime: string | null;
  endTime: string | null;
  itemCount: number;
  hasConflicts: boolean;
}

// ── Vendor export ──────────────────────────────────────────────────────────

export interface VendorExportEntry {
  vendor: string;
  items: ScheduleItem[];
  // The immediate neighbours — rendered as context rows in the export view
  // so vendors know what's happening just before / after their slots.
  contextItems: ScheduleItem[];
}
