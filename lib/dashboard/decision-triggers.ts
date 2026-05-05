// ── Auto-decision detection ────────────────────────────────────────────
// Reads platform state and returns the auto-decisions that should exist
// right now. The store's `upsertAuto` enforces idempotency via stable
// `autoKey` strings, so this can be run on every relevant data change.

import type { EventRecord, EventType } from "@/types/events";
import type { WorkspaceCategory } from "@/types/workspace";
import type { DecisionSourceType } from "@/stores/decisions-store";
import { EVENT_TYPE_OPTIONS } from "@/lib/events-seed";

export interface AutoDecisionInputs {
  weddingDate: Date | null;
  events: EventRecord[];
  workspaceCategories: WorkspaceCategory[];
  /** Hero palette name (or null). */
  heroPaletteName: string | null;
}

export interface AutoDecisionCandidate {
  autoKey: string;
  content: string;
  sourceType: DecisionSourceType;
  eventId?: string | null;
}

function eventTypeName(type: EventType): string {
  const opt = EVENT_TYPE_OPTIONS.find((o) => o.id === type);
  return opt?.name ?? type;
}

function eventLabel(e: EventRecord): string {
  return (
    e.vibeEventName ||
    e.customEventName ||
    e.customName ||
    eventTypeName(e.type)
  );
}

function fullDate(d: Date): string {
  return d.toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function detectAutoDecisions(
  input: AutoDecisionInputs,
): AutoDecisionCandidate[] {
  const out: AutoDecisionCandidate[] = [];

  // Wedding date
  if (input.weddingDate) {
    out.push({
      autoKey: `date:${input.weddingDate.toISOString().slice(0, 10)}`,
      content: `Our date: ${fullDate(input.weddingDate)}.`,
      sourceType: "date_set",
    });
  }

  // Hero palette
  if (input.heroPaletteName) {
    out.push({
      autoKey: `palette:${input.heroPaletteName}`,
      content: `Our palette: ${input.heroPaletteName}.`,
      sourceType: "palette_set",
    });
  }

  // Per-event venue / vibe theme decisions
  for (const ev of input.events) {
    const label = eventLabel(ev);
    if (ev.venueName) {
      out.push({
        autoKey: `venue:${ev.id}:${ev.venueName}`,
        content: `Our ${label} venue: ${ev.venueName}.`,
        sourceType: "venue_set",
        eventId: ev.id,
      });
    }
    if (ev.vibeTheme || ev.customTheme) {
      const theme = (ev.customTheme ?? ev.vibeTheme ?? "").trim();
      if (theme) {
        out.push({
          autoKey: `theme:${ev.id}:${theme.slice(0, 40)}`,
          content: `${label} direction: ${theme}.`,
          sourceType: "journey_step",
          eventId: ev.id,
        });
      }
    }
  }

  // Booked vendors
  for (const cat of input.workspaceCategories) {
    if (cat.status === "assigned") {
      out.push({
        autoKey: `vendor:${cat.slug}`,
        content: `Our ${cat.name.toLowerCase()} is booked.`,
        sourceType: "vendor_booking",
      });
    }
  }

  return out;
}
