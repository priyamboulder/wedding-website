// ── Schedule conflict detection ────────────────────────────────────────────
// Pure function over a ScheduleItem[] (and, optionally, cross-event items)
// that returns an array of warnings the UI docks to the relevant rows.
//
// Run after every mutation. The timeline view uses `ScheduleConflict.itemIds[0]`
// as the primary anchor for inline banners, and shows aggregate counts in
// the header ("2 hard conflicts, 3 suggestions").

import type { ScheduleConflict, ScheduleItem } from "@/types/schedule";
import { hhmmToMinutes } from "@/lib/schedule/data";

export interface ConflictInput {
  items: ScheduleItem[];
  // Items from OTHER events on the same day, used for cross-event overlap
  // detection. Pass [] if you only care about a single event.
  sameDayOtherEventItems?: ScheduleItem[];
  // Optional max wrap-up clock time (HH:MM) — if the timeline finishes
  // after this, emit a "running late" soft warning.
  eveningCutoff?: string;
}

export function detectConflicts(input: ConflictInput): ScheduleConflict[] {
  const { items, sameDayOtherEventItems = [], eveningCutoff } = input;
  const conflicts: ScheduleConflict[] = [];
  const byId = new Map(items.map((i) => [i.id, i] as const));

  // Sort by startTime for overlap scans.
  const sorted = [...items].sort((a, b) =>
    a.startTime.localeCompare(b.startTime),
  );

  // ── 1. Overlaps within the same event ──
  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1];
    const cur = sorted[i];
    // Simultaneous dependency is an intended overlap — skip.
    if (
      cur.dependency?.type === "simultaneous" &&
      cur.dependency.referenceId === prev.id
    ) {
      continue;
    }
    if (prev.dependency?.type === "simultaneous") continue;

    const prevEnd = hhmmToMinutes(prev.endTime);
    const curStart = hhmmToMinutes(cur.startTime);
    if (curStart < prevEnd) {
      conflicts.push({
        id: `overlap-${prev.id}-${cur.id}`,
        kind: "overlap",
        severity: "hard",
        message: `"${cur.label}" starts before "${prev.label}" ends.`,
        itemIds: [cur.id, prev.id],
        suggestedFix: { label: "Shift later items", kind: "shift" },
      });
    }
  }

  // ── 2. Impossible dependencies (item before its referenced predecessor) ──
  for (const item of items) {
    const dep = item.dependency;
    if (!dep || !dep.referenceId) continue;
    const ref = byId.get(dep.referenceId);
    if (!ref) continue;
    if (dep.type === "after") {
      const needsStart = hhmmToMinutes(ref.endTime);
      const gotStart = hhmmToMinutes(item.startTime);
      if (gotStart < needsStart) {
        conflicts.push({
          id: `imp-${item.id}`,
          kind: "impossible_dependency",
          severity: "hard",
          message: `"${item.label}" is linked to run after "${ref.label}" but starts before it ends.`,
          itemIds: [item.id, ref.id],
          suggestedFix: { label: "Snap to end of dependency", kind: "shift" },
        });
      }
    }
  }

  // ── 3. Insufficient gap (hard dependency whose gap_minutes was violated) ──
  for (const item of items) {
    const dep = item.dependency;
    if (!dep || !dep.referenceId || !dep.isHard) continue;
    const ref = byId.get(dep.referenceId);
    if (!ref) continue;
    if (dep.type === "after") {
      const minStart = hhmmToMinutes(ref.endTime) + dep.gapMinutes;
      const gotStart = hhmmToMinutes(item.startTime);
      if (gotStart < minStart) {
        conflicts.push({
          id: `gap-${item.id}`,
          kind: "insufficient_gap",
          severity: "soft",
          message: `"${item.label}" needs ${dep.gapMinutes} min after "${ref.label}"; currently less.`,
          itemIds: [item.id, ref.id],
        });
      }
    }
  }

  // ── 4. Cross-event overlap (same venue, same day) ──
  for (const other of sameDayOtherEventItems) {
    const oStart = hhmmToMinutes(other.startTime);
    const oEnd = hhmmToMinutes(other.endTime);
    for (const item of items) {
      const start = hhmmToMinutes(item.startTime);
      const end = hhmmToMinutes(item.endTime);
      if (start < oEnd && end > oStart) {
        conflicts.push({
          id: `cross-${item.id}-${other.id}`,
          kind: "cross_event_overlap",
          severity: "soft",
          message: `"${item.label}" overlaps with an item in another event today.`,
          itemIds: [item.id, other.id],
        });
      }
    }
  }

  // ── 5. Vendor double-booking ──
  const vendorSlots = new Map<string, ScheduleItem[]>();
  for (const item of items) {
    for (const v of item.assignedTo) {
      const list = vendorSlots.get(v) ?? [];
      list.push(item);
      vendorSlots.set(v, list);
    }
  }
  for (const [vendor, slots] of vendorSlots.entries()) {
    const chronological = [...slots].sort((a, b) =>
      a.startTime.localeCompare(b.startTime),
    );
    for (let i = 1; i < chronological.length; i++) {
      const a = chronological[i - 1];
      const b = chronological[i];
      if (a.location && b.location && a.location !== b.location) {
        const aEnd = hhmmToMinutes(a.endTime);
        const bStart = hhmmToMinutes(b.startTime);
        if (bStart < aEnd) {
          conflicts.push({
            id: `vendor-${vendor}-${a.id}-${b.id}`,
            kind: "vendor_double_booked",
            severity: "soft",
            message: `${vendor} is scheduled at "${a.location}" and "${b.location}" at the same time.`,
            itemIds: [a.id, b.id],
          });
        }
      }
    }
  }

  // ── 6. Running late ──
  if (eveningCutoff && sorted.length > 0) {
    const last = sorted[sorted.length - 1];
    const lastEnd = hhmmToMinutes(last.endTime);
    const cutoff = hhmmToMinutes(eveningCutoff);
    if (lastEnd > cutoff) {
      conflicts.push({
        id: `late-${last.id}`,
        kind: "running_late",
        severity: "info",
        message: `Timeline wraps at ${last.endTime} — past your ${eveningCutoff} cutoff.`,
        itemIds: [last.id],
      });
    }
  }

  return conflicts;
}

export function conflictsForItem(
  conflicts: ScheduleConflict[],
  itemId: string,
): ScheduleConflict[] {
  return conflicts.filter((c) => c.itemIds.includes(itemId));
}

export function countBySeverity(
  conflicts: ScheduleConflict[],
): { hard: number; soft: number; info: number } {
  const out = { hard: 0, soft: 0, info: 0 };
  for (const c of conflicts) out[c.severity] += 1;
  return out;
}
