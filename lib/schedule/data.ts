// ── Schedule data access layer ─────────────────────────────────────────────
// The single place the Schedule module touches persistence. Today it reads
// and writes the Zustand store in stores/schedule-store.ts (which persists
// to localStorage). When we swap to Supabase, this file is the only one
// that changes — the Zustand store becomes a local cache populated from
// the network, and these helpers become async.
//
// Components MUST import from here, not directly from the store. This keeps
// the eventual async migration a single-file diff.

import type {
  ScheduleConflict,
  ScheduleDayEventSummary,
  ScheduleItem,
  ScheduleTemplate,
  VendorExportEntry,
} from "@/types/schedule";
import { useScheduleStore } from "@/stores/schedule-store";
import { SCHEDULE_TEMPLATES } from "@/lib/schedule/templates";
import { resolveTimelineTimes } from "@/lib/schedule/resolver";
import { detectConflicts } from "@/lib/schedule/conflicts";
import { useEventsStore } from "@/stores/events-store";
import { useVendorsStore } from "@/stores/vendors-store";
import type { Vendor } from "@/types/vendor-unified";

// ── Reads ──────────────────────────────────────────────────────────────────

export function getScheduleForEvent(eventId: string): ScheduleItem[] {
  const items = useScheduleStore.getState().items;
  return items
    .filter((i) => i.eventId === eventId)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export function getAllScheduleItems(): ScheduleItem[] {
  return useScheduleStore.getState().items;
}

// ── Writes ─────────────────────────────────────────────────────────────────

export function saveScheduleItem(item: ScheduleItem): void {
  useScheduleStore.getState().upsertItem(item);
}

export function saveScheduleItems(items: ScheduleItem[]): void {
  useScheduleStore.getState().upsertMany(items);
}

export function deleteScheduleItem(id: string): void {
  useScheduleStore.getState().removeItem(id);
}

export function replaceScheduleForEvent(
  eventId: string,
  items: ScheduleItem[],
): void {
  useScheduleStore.getState().replaceForEvent(eventId, items);
}

export function reorderScheduleItems(
  eventId: string,
  orderedIds: string[],
): void {
  useScheduleStore.getState().reorderForEvent(eventId, orderedIds);
}

// ── Resolver (re-exported here so callers don't dig into /resolver) ────────

// Recompute every item's startTime / endTime from its dependency chain,
// preserving fixed items' explicit startTime. Should be called after any
// mutation that could shift the timeline (duration change, reorder, insert).
export function resolveAndSaveSchedule(eventId: string): ScheduleItem[] {
  const items = getScheduleForEvent(eventId);
  const resolved = resolveTimelineTimes(items);
  replaceScheduleForEvent(eventId, resolved);
  return resolved;
}

// ── Templates ──────────────────────────────────────────────────────────────

export function getScheduleTemplates(
  tradition: string,
  eventType: string,
): ScheduleTemplate[] {
  return SCHEDULE_TEMPLATES.filter(
    (t) =>
      (t.tradition === tradition || t.tradition === "shared") &&
      t.eventType === eventType,
  );
}

export function getAllTemplates(): ScheduleTemplate[] {
  return SCHEDULE_TEMPLATES;
}

// ── Day overview ───────────────────────────────────────────────────────────

export function getAllDaySchedules(
  date: string,
): ScheduleDayEventSummary[] {
  const events = useEventsStore.getState().events;
  const allItems = getAllScheduleItems();

  return events
    .filter((e) => e.eventDate === date)
    .map((e) => {
      const items = allItems.filter((i) => i.eventId === e.id);
      const sorted = [...items].sort((a, b) =>
        a.startTime.localeCompare(b.startTime),
      );
      const sameDayOther = allItems.filter(
        (i) =>
          i.eventId !== e.id &&
          events.some(
            (other) => other.id === i.eventId && other.eventDate === date,
          ),
      );
      const conflicts = detectConflicts({
        items: sorted,
        sameDayOtherEventItems: sameDayOther,
      });
      return {
        eventId: e.id,
        eventLabel: e.customName || e.vibeEventName || e.type,
        eventType: e.type,
        date: e.eventDate ?? "",
        venueName: e.venueName,
        startTime: sorted[0]?.startTime ?? null,
        endTime: sorted[sorted.length - 1]?.endTime ?? null,
        itemCount: items.length,
        hasConflicts: conflicts.length > 0,
      };
    });
}

// Cross-event conflicts for a given date — used by the Day overview to
// surface venue and vendor collisions across sibling events.
export function getCrossEventConflicts(date: string): ScheduleConflict[] {
  const events = useEventsStore.getState().events.filter(
    (e) => e.eventDate === date,
  );
  if (events.length < 2) return [];
  const allItems = getAllScheduleItems();
  const byEvent = new Map<string, ScheduleItem[]>();
  for (const e of events) {
    byEvent.set(
      e.id,
      allItems.filter((i) => i.eventId === e.id),
    );
  }
  const conflicts: ScheduleConflict[] = [];
  const ids = Array.from(byEvent.keys());
  for (let i = 0; i < ids.length; i++) {
    for (let j = i + 1; j < ids.length; j++) {
      const a = byEvent.get(ids[i]) ?? [];
      const b = byEvent.get(ids[j]) ?? [];
      const sub = detectConflicts({
        items: a,
        sameDayOtherEventItems: b,
      }).filter((c) => c.kind === "cross_event_overlap");
      conflicts.push(...sub);
    }
  }
  return conflicts;
}

// ── Vendor tagging (Schedule v2) ───────────────────────────────────────────
// Items prefer `vendorIds` (references into stores/vendors-store.ts) but fall
// back to the legacy `assignedTo` string array for items drafted before v2.
// The export groups by the resolved vendor identity (prefer id; otherwise
// the free-text name acts as its own key).

function vendorLookupTable(): Map<string, Vendor> {
  const vendors = useVendorsStore.getState().vendors;
  return new Map(vendors.map((v) => [v.id, v] as const));
}

export interface VendorTagRef {
  // Either a real vendor id from the Vendors store or a synthetic
  // "legacy:<name>" id for free-text entries that predate vendor binding.
  key: string;
  vendorId: string | null;
  name: string;
  category: string | null;
}

export function resolveVendorTags(item: ScheduleItem): VendorTagRef[] {
  const vendors = vendorLookupTable();
  const refs: VendorTagRef[] = [];
  const seen = new Set<string>();

  for (const id of item.vendorIds) {
    const v = vendors.get(id);
    const key = `id:${id}`;
    if (seen.has(key)) continue;
    seen.add(key);
    refs.push({
      key,
      vendorId: id,
      name: v?.name ?? id,
      category: v?.category ?? null,
    });
  }
  for (const name of item.assignedTo) {
    const trimmed = name.trim();
    if (!trimmed) continue;
    const key = `legacy:${trimmed.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    refs.push({ key, vendorId: null, name: trimmed, category: null });
  }
  return refs;
}

export function buildVendorExport(eventId: string): VendorExportEntry[] {
  const items = getScheduleForEvent(eventId);
  const byVendor = new Map<string, { name: string; items: ScheduleItem[] }>();

  for (const item of items) {
    for (const tag of resolveVendorTags(item)) {
      const bucket = byVendor.get(tag.key) ?? { name: tag.name, items: [] };
      bucket.items.push(item);
      byVendor.set(tag.key, bucket);
    }
  }

  const output: VendorExportEntry[] = [];
  for (const [, bucket] of byVendor.entries()) {
    const contextIds = new Set<string>();
    for (const it of bucket.items) {
      const idx = items.findIndex((i) => i.id === it.id);
      if (idx > 0) contextIds.add(items[idx - 1].id);
      if (idx < items.length - 1) contextIds.add(items[idx + 1].id);
    }
    const contextItems = items.filter(
      (i) => contextIds.has(i.id) && !bucket.items.some((v) => v.id === i.id),
    );
    output.push({
      vendor: bucket.name,
      items: bucket.items,
      contextItems,
    });
  }

  return output.sort((a, b) => a.vendor.localeCompare(b.vendor));
}

// ── Vendor tagging writes ──────────────────────────────────────────────────

export function assignVendorToItem(itemId: string, vendorId: string): void {
  const store = useScheduleStore.getState();
  const item = store.items.find((i) => i.id === itemId);
  if (!item) return;
  if (item.vendorIds.includes(vendorId)) return;
  store.upsertItem({
    ...item,
    vendorIds: [...item.vendorIds, vendorId],
    isAiDraft: false,
  });
}

export function unassignVendorFromItem(itemId: string, vendorId: string): void {
  const store = useScheduleStore.getState();
  const item = store.items.find((i) => i.id === itemId);
  if (!item) return;
  store.upsertItem({
    ...item,
    vendorIds: item.vendorIds.filter((v) => v !== vendorId),
    isAiDraft: false,
  });
}

// ── Photo shot list / music cue sheet ──────────────────────────────────────

export function getPhotoShotList(eventId: string): ScheduleItem[] {
  return getScheduleForEvent(eventId).filter((i) => i.isPhotoMoment);
}

export function getMusicCueSheet(eventId: string): ScheduleItem[] {
  return getScheduleForEvent(eventId).filter((i) => {
    const cue = i.musicCue?.trim();
    return Boolean(cue);
  });
}

// ── Conflicts (pre-composed caller) ────────────────────────────────────────

export function getConflictsForEvent(eventId: string): ScheduleConflict[] {
  const items = getScheduleForEvent(eventId);
  const event = useEventsStore.getState().events.find((e) => e.id === eventId);
  const sameDayOther = event?.eventDate
    ? getAllScheduleItems().filter(
        (i) =>
          i.eventId !== eventId &&
          useEventsStore
            .getState()
            .events.some(
              (e) => e.id === i.eventId && e.eventDate === event.eventDate,
            ),
      )
    : [];
  return detectConflicts({ items, sameDayOtherEventItems: sameDayOther });
}

// ── Cascade-aware mutation ─────────────────────────────────────────────────
// Move a single item's start time and re-resolve the dependency graph so
// every downstream item shifts by the same delta. Used by drag-to-reorder
// and the "push everything N minutes" day-of helper.
export function cascadeItemStart(
  itemId: string,
  newStartTime: string,
): ScheduleItem[] {
  const store = useScheduleStore.getState();
  const item = store.items.find((i) => i.id === itemId);
  if (!item) return [];
  const patched = store.items.map((i) =>
    i.id === itemId
      ? { ...i, startTime: newStartTime, isFixed: true }
      : i,
  );
  const resolved = resolveTimelineTimes(
    patched.filter((i) => i.eventId === item.eventId),
  );
  replaceScheduleForEvent(item.eventId, resolved);
  return resolved;
}

// ── Time helpers (re-exported from lib/schedule/time for caller ergonomics) ─

export {
  addMinutes,
  formatTime12h,
  formatTimeRange,
  hhmmToMinutes,
  minutesToHhmm,
} from "@/lib/schedule/time";
