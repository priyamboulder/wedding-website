// ── Schedule → Coordination import ──────────────────────────────────────────
// Reads schedule items tagged with vendor ids (from stores/vendors-store) and
// generates coordination vendors + assignments. Vendor dedup is by platform
// vendor id; if the same vendor spans multiple items in the same event, we
// coalesce them into a single assignment, taking the earliest start + latest
// end from the group.

import type { ScheduleItem } from "@/types/schedule";
import type { EventRecord, EventType } from "@/types/events";
import type { Vendor } from "@/types/vendor";
import type {
  CoordinationAssignment,
  CoordinationRole,
} from "@/types/coordination";
import {
  useCoordinationStore,
  type NewAssignmentInput,
} from "@/stores/coordination-store";

// Map platform vendor category → coordination role.
const CATEGORY_TO_ROLE: Record<string, CoordinationRole> = {
  photographer: "photographer",
  videographer: "videographer",
  planner: "planner",
  caterer: "caterer",
  catering: "caterer",
  decorator: "decorator",
  decor: "decorator",
  florist: "florist",
  florals: "florist",
  makeup: "makeup",
  hmua: "makeup",
  mehndi: "mehendi",
  mehendi: "mehendi",
  dj: "dj",
  music: "dj",
  band: "band",
  cake: "cake",
  sweets: "cake",
  officiant: "officiant",
  pandit: "pandit",
  transport: "transport",
  rentals: "rentals",
  lighting: "lighting",
  photo_booth: "photo_booth",
  choreographer: "choreographer",
  dhol: "dhol",
};

function categoryToRole(category: string | undefined): CoordinationRole {
  if (!category) return "custom";
  const lower = category.toLowerCase();
  return CATEGORY_TO_ROLE[lower] ?? "custom";
}

function eventDate(eventRecord: EventRecord | undefined): string {
  return eventRecord?.eventDate ?? new Date().toISOString().slice(0, 10);
}

function eventDisplayName(eventRecord: EventRecord | undefined, fallback: string): string {
  if (!eventRecord) return fallback;
  return eventRecord.customName || (eventRecord.type as EventType);
}

// Pick the earlier of two "HH:MM" strings, ignoring nulls.
function earlier(a: string | null, b: string | null): string | null {
  if (!a) return b;
  if (!b) return a;
  return a < b ? a : b;
}
function later(a: string | null, b: string | null): string | null {
  if (!a) return b;
  if (!b) return a;
  return a > b ? a : b;
}

export interface ImportPreviewRow {
  vendorId: string; // platform vendor id
  vendorName: string;
  role: CoordinationRole;
  eventId: string;
  eventName: string;
  eventDate: string;
  scheduleItemIds: string[];
  callTime: string | null;
  setupStart: string | null;
  setupEnd: string | null;
  serviceStart: string | null;
  serviceEnd: string | null;
  notes: string[];
}

export function buildImportPreview(
  scheduleItems: ScheduleItem[],
  events: EventRecord[],
  platformVendors: Vendor[],
): ImportPreviewRow[] {
  const vendorById = new Map(platformVendors.map((v) => [v.id, v]));
  const eventById = new Map(events.map((e) => [e.id, e]));

  const groups = new Map<string, ImportPreviewRow>();

  for (const item of scheduleItems) {
    if (!item.vendorIds || item.vendorIds.length === 0) continue;
    for (const vid of item.vendorIds) {
      const vendor = vendorById.get(vid);
      if (!vendor) continue;
      const event = eventById.get(item.eventId);
      const key = `${vid}::${item.eventId}`;
      const existing = groups.get(key);
      const category = (vendor.category as string | undefined) ?? "custom";

      if (!existing) {
        groups.set(key, {
          vendorId: vid,
          vendorName: vendor.name,
          role: categoryToRole(category),
          eventId: item.eventId,
          eventName: eventDisplayName(event, "Event"),
          eventDate: eventDate(event),
          scheduleItemIds: [item.id],
          callTime: item.startTime ?? null,
          setupStart:
            item.category === "getting_ready" || item.track === "vendor_setup"
              ? item.startTime
              : null,
          setupEnd:
            item.category === "getting_ready" || item.track === "vendor_setup"
              ? item.endTime
              : null,
          serviceStart: item.startTime ?? null,
          serviceEnd: item.endTime ?? null,
          notes: item.notesForVendor ? [item.notesForVendor] : [],
        });
      } else {
        existing.scheduleItemIds.push(item.id);
        existing.callTime = earlier(existing.callTime, item.startTime ?? null);
        existing.serviceStart = earlier(existing.serviceStart, item.startTime ?? null);
        existing.serviceEnd = later(existing.serviceEnd, item.endTime ?? null);
        if (
          item.category === "getting_ready" ||
          item.track === "vendor_setup"
        ) {
          existing.setupStart = earlier(existing.setupStart, item.startTime ?? null);
          existing.setupEnd = later(existing.setupEnd, item.endTime ?? null);
        }
        if (item.notesForVendor) existing.notes.push(item.notesForVendor);
      }
    }
  }

  return Array.from(groups.values());
}

export interface ImportResult {
  createdVendors: number;
  createdAssignments: number;
}

export function applyImport(
  rows: ImportPreviewRow[],
  platformVendors: Vendor[],
): ImportResult {
  const store = useCoordinationStore.getState();
  const vendorById = new Map(platformVendors.map((v) => [v.id, v]));

  // Collapse per platform vendor id so we create one coordination vendor and
  // then attach each event-scoped row as its own assignment.
  const byPlatformId = new Map<string, ImportPreviewRow[]>();
  for (const row of rows) {
    const list = byPlatformId.get(row.vendorId) ?? [];
    list.push(row);
    byPlatformId.set(row.vendorId, list);
  }

  let createdVendors = 0;
  let createdAssignments = 0;

  for (const [platformId, vendorRows] of byPlatformId) {
    const platformVendor = vendorById.get(platformId);
    if (!platformVendor) continue;

    const existing = store.vendors.find((v) => v.platformVendorId === platformId);
    const contactName: string | null = null;
    const phone = platformVendor.contact?.phone ?? null;
    const email = platformVendor.contact?.email ?? null;

    const coordVendor =
      existing ??
      (() => {
        const created = store.addVendor({
          name: platformVendor.name,
          contactName: contactName ?? undefined,
          role: vendorRows[0].role,
          phone: phone ?? undefined,
          email: email ?? undefined,
          platformVendorId: platformId,
          events: Array.from(new Set(vendorRows.map((r) => r.eventName))),
        });
        createdVendors++;
        return created;
      })();

    for (const row of vendorRows) {
      // Skip if an assignment already exists for the same event+vendor (avoid
      // duplicate rows on re-import).
      const dupe = useCoordinationStore
        .getState()
        .assignments.find(
          (a) =>
            a.vendorId === coordVendor.id &&
            a.eventName === row.eventName &&
            a.eventDate === row.eventDate,
        );
      if (dupe) continue;

      const payload: NewAssignmentInput = {
        vendorId: coordVendor.id,
        eventName: row.eventName,
        eventDate: row.eventDate,
        callTime: row.callTime,
        setupStart: row.setupStart,
        setupEnd: row.setupEnd,
        serviceStart: row.serviceStart,
        serviceEnd: row.serviceEnd,
        description: row.notes.length > 0 ? row.notes.join(" · ") : null,
        scheduleItemIds: row.scheduleItemIds,
      };
      store.addAssignment(payload);
      createdAssignments++;
    }
  }

  store.setHasImportedFromSchedule(true);
  return { createdVendors, createdAssignments };
}

export function countImportableRows(
  scheduleItems: ScheduleItem[],
  platformVendors: Vendor[],
): number {
  const byId = new Map(platformVendors.map((v) => [v.id, v]));
  const keys = new Set<string>();
  for (const item of scheduleItems) {
    if (!item.vendorIds) continue;
    for (const vid of item.vendorIds) {
      if (byId.has(vid)) keys.add(`${vid}::${item.eventId}`);
    }
  }
  return keys.size;
}
