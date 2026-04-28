// ── Timeline resolver ──────────────────────────────────────────────────────
// Given a list of ScheduleItem rows that may have dependency links, compute
// the canonical startTime / endTime for each item. Honors:
//   · is_fixed items — their startTime is authoritative; we only update
//     endTime = startTime + duration.
//   · dependency.type === "after" — start = ref.endTime + gap
//   · dependency.type === "before" — start = ref.startTime - (gap + duration)
//   · dependency.type === "simultaneous" — start = ref.startTime + gap
//   · dependency.type === "independent" OR dependency === null — start stays
//     as-is; we just reconcile endTime.
//
// Dependency cycles are detected and broken by treating the later-seen node
// as independent for that pass (with a console.warn — should never happen in
// practice once conflict detection picks them up).

import type { ScheduleItem } from "@/types/schedule";
import { addMinutes, hhmmToMinutes, minutesToHhmm } from "@/lib/schedule/time";

export function resolveTimelineTimes(items: ScheduleItem[]): ScheduleItem[] {
  if (items.length === 0) return items;

  const byId = new Map(items.map((i) => [i.id, i] as const));
  const resolved = new Map<string, ScheduleItem>();
  const visiting = new Set<string>();

  function resolve(item: ScheduleItem): ScheduleItem {
    const cached = resolved.get(item.id);
    if (cached) return cached;

    // Cycle-break: if we've entered this node in the current recursion,
    // fall back to treating it as independent for this pass.
    if (visiting.has(item.id)) {
      // eslint-disable-next-line no-console
      console.warn(`Schedule cycle detected at item ${item.id}; breaking.`);
      const fallback: ScheduleItem = {
        ...item,
        endTime: addMinutes(item.startTime, item.durationMinutes),
      };
      resolved.set(item.id, fallback);
      return fallback;
    }

    // Fixed items — startTime is authoritative. Ignore their dependency for
    // time derivation, but keep the link so the UI can still render "linked to".
    if (item.isFixed) {
      const out: ScheduleItem = {
        ...item,
        endTime: addMinutes(item.startTime, item.durationMinutes),
      };
      resolved.set(item.id, out);
      return out;
    }

    const dep = item.dependency;
    if (!dep || dep.type === "independent" || !dep.referenceId) {
      const out: ScheduleItem = {
        ...item,
        endTime: addMinutes(item.startTime, item.durationMinutes),
      };
      resolved.set(item.id, out);
      return out;
    }

    const ref = byId.get(dep.referenceId);
    if (!ref) {
      // Reference missing — degrade to independent.
      const out: ScheduleItem = {
        ...item,
        endTime: addMinutes(item.startTime, item.durationMinutes),
      };
      resolved.set(item.id, out);
      return out;
    }

    visiting.add(item.id);
    const refResolved = resolve(ref);
    visiting.delete(item.id);

    let startMinutes: number;
    switch (dep.type) {
      case "after": {
        startMinutes = hhmmToMinutes(refResolved.endTime) + dep.gapMinutes;
        break;
      }
      case "simultaneous": {
        startMinutes = hhmmToMinutes(refResolved.startTime) + dep.gapMinutes;
        break;
      }
      case "before": {
        startMinutes =
          hhmmToMinutes(refResolved.startTime) -
          dep.gapMinutes -
          item.durationMinutes;
        break;
      }
      default: {
        startMinutes = hhmmToMinutes(item.startTime);
      }
    }

    const startTime = minutesToHhmm(startMinutes);
    const endTime = addMinutes(startTime, item.durationMinutes);
    const out: ScheduleItem = { ...item, startTime, endTime };
    resolved.set(item.id, out);
    return out;
  }

  for (const item of items) resolve(item);

  // Preserve the original sortOrder — resolution never reorders, it only
  // recomputes times. If an item's computed startTime ends up out of order
  // vs its neighbours, the UI surfaces that via conflict detection.
  return items
    .map((i) => resolved.get(i.id) ?? i)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}
