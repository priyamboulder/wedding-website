// ── Event display helpers ─────────────────────────────────────────────────
// One canonical way to resolve an event's display name, matching the
// hierarchy the old wizard used:
//   1. Couple's custom name ("Write my own")
//   2. Selected AI vibe name
//   3. Custom name for `type === "custom"`
//   4. EVENT_TYPE_OPTIONS default name

import { EVENT_TYPE_OPTIONS } from "@/lib/events-seed";
import type { EventRecord } from "@/types/events";

export function displayNameFor(event: EventRecord): string {
  if (event.customEventName?.trim()) return event.customEventName.trim();
  if (event.vibeEventName?.trim()) return event.vibeEventName.trim();
  if (event.customName?.trim()) return event.customName.trim();
  const opt = EVENT_TYPE_OPTIONS.find((o) => o.id === event.type);
  return opt?.name ?? "Event";
}

export function displayThemeFor(event: EventRecord): string | null {
  if (event.customTheme?.trim()) return event.customTheme.trim();
  if (event.vibeTheme?.trim()) return event.vibeTheme.trim();
  return null;
}
