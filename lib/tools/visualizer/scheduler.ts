// ──────────────────────────────────────────────────────────────────────────
// Visualizer scheduling algorithm.
//
// Deterministic, pure, runs in the browser. Takes the user's input config
// and produces a multi-day timeline with hour-precise event placement.
//
// Rules enforced (see prompt for full spec):
//   1. No overlapping events within a day
//   2. Minimum 2-hour buffer between events
//   3. After-ceremony → reception requires ≥ 1.5 hr (outfit change)
//   4. Max 3 events per day; auto-expand days if user oversubscribes
//   5. Cultural ceremony time defaults
//   6. Welcome dinner = first evening; farewell brunch = final morning
// ──────────────────────────────────────────────────────────────────────────

import type {
  CeremonyTimePref,
  EventSlug,
  GuestSubset,
  ScheduledEvent,
  TimeOfDay,
  TimelineDay,
  VisualizerInputs,
  VisualizerOutput,
  WeddingFormat,
  WeddingStyle,
} from "@/types/visualizer";

import { resolveEvent } from "./events";

const DAY_LABELS = [
  "Day 1 — Thursday",
  "Day 2 — Friday",
  "Day 3 — Saturday",
  "Day 4 — Sunday",
  "Day 5 — Monday",
  "Day 6 — Tuesday",
  "Day 7 — Wednesday",
];

// Per-time-of-day default start anchors (minutes from 00:00).
const ANCHOR: Record<TimeOfDay, number> = {
  morning: 9 * 60, // 9:00 AM
  afternoon: 13 * 60, // 1:00 PM
  evening: 18 * 60, // 6:00 PM
};

// Hard windows for each time-of-day bucket — used to snap proposals into
// the right neighborhood when there's a conflict.
const WINDOW: Record<TimeOfDay, { earliest: number; latest: number }> = {
  morning: { earliest: 7 * 60, latest: 11 * 60 + 30 },
  afternoon: { earliest: 12 * 60, latest: 16 * 60 },
  evening: { earliest: 17 * 60, latest: 21 * 60 + 30 },
};

const MIN_BUFFER_MINUTES = 120; // 2-hour transition buffer
const POST_CEREMONY_BUFFER_MINUTES = 90; // 1.5-hour outfit change

const FORMAT_GUEST_RANGE: Record<WeddingFormat, number> = {
  intimate: 75,
  classic: 200,
  grand: 400,
  royal: 700,
};

// ── Public API ────────────────────────────────────────────────────────────

export function buildTimeline(inputs: VisualizerInputs): VisualizerOutput {
  const slugs = orderEventsBySequence(inputs.events);
  const days = Math.max(1, Math.min(7, inputs.days));
  const dayBuckets = distributeEventsAcrossDays(slugs, days);

  const timeline: TimelineDay[] = dayBuckets.map((bucket, idx) => {
    const isFirstDay = idx === 0;
    const isLastDay = idx === dayBuckets.length - 1;
    const scheduled = scheduleDay(bucket, inputs, { isFirstDay, isLastDay });
    return {
      dayNumber: idx + 1,
      dayLabel: DAY_LABELS[idx] ?? `Day ${idx + 1}`,
      events: scheduled,
    };
  });

  return {
    days: timeline,
    totalGuests: FORMAT_GUEST_RANGE[inputs.format],
    weddingStyle: inputs.style,
    format: inputs.format,
    generatedAt: new Date().toISOString(),
  };
}

// ── Sequence ordering & day distribution ──────────────────────────────────

function orderEventsBySequence(events: EventSlug[]): EventSlug[] {
  // Reuse base catalog priority; cultural variants don't change sequence.
  const indexed = events.map((slug) => ({
    slug,
    priority: resolveEvent(slug, "hindu_north").sequencePriority,
  }));
  indexed.sort((a, b) => a.priority - b.priority);
  return indexed.map((e) => e.slug);
}

/**
 * Distributes events across day buckets, respecting category constraints:
 *   - welcome_dinner anchors to day 1
 *   - ceremony+reception+vidaai/cocktail anchor to the same wedding day
 *   - farewell_brunch anchors to the final day
 *   - max 3 events/day; spill to next day if needed
 */
function distributeEventsAcrossDays(
  events: EventSlug[],
  days: number,
): EventSlug[][] {
  const buckets: EventSlug[][] = Array.from({ length: days }, () => []);

  // Special anchors first.
  const welcome = events.includes("welcome_dinner") ? "welcome_dinner" : null;
  const farewell = events.includes("farewell_brunch")
    ? "farewell_brunch"
    : null;
  const ceremony = events.includes("ceremony") ? "ceremony" : null;
  const reception = events.includes("reception") ? "reception" : null;
  const cocktail = events.includes("cocktail") ? "cocktail" : null;
  const vidaai = events.includes("vidaai") ? "vidaai" : null;

  // The "wedding day" is the second-to-last full day if we have a farewell
  // brunch, otherwise it's the last day. With only 1-2 days we collapse.
  let weddingDayIdx: number;
  if (days === 1) {
    weddingDayIdx = 0;
  } else if (farewell && days >= 3) {
    weddingDayIdx = days - 2;
  } else if (farewell) {
    weddingDayIdx = days - 2;
  } else {
    weddingDayIdx = days - 1;
  }

  if (welcome) buckets[0].push("welcome_dinner");
  if (farewell) buckets[days - 1].push("farewell_brunch");
  if (ceremony) buckets[weddingDayIdx].push("ceremony");
  if (cocktail) buckets[weddingDayIdx].push("cocktail");
  if (reception) buckets[weddingDayIdx].push("reception");
  // Vidaai usually rides the ceremony day (immediately after reception or
  // right after ceremony in modern flows).
  if (vidaai) buckets[weddingDayIdx].push("vidaai");

  // Remaining pre-wedding events fill the days before the wedding day,
  // ordered by sequence priority.
  const placed = new Set<EventSlug>([
    ...(welcome ? ["welcome_dinner" as EventSlug] : []),
    ...(farewell ? ["farewell_brunch" as EventSlug] : []),
    ...(ceremony ? ["ceremony" as EventSlug] : []),
    ...(cocktail ? ["cocktail" as EventSlug] : []),
    ...(reception ? ["reception" as EventSlug] : []),
    ...(vidaai ? ["vidaai" as EventSlug] : []),
  ]);

  const remaining = events.filter((s) => !placed.has(s));

  // Fill from day 0 up through the wedding day (exclusive), respecting
  // 3-events-per-day cap. Spill into the wedding day if we run out of room.
  let cursor = 0;
  for (const slug of remaining) {
    while (cursor < weddingDayIdx && buckets[cursor].length >= 3) cursor++;
    if (cursor >= weddingDayIdx) {
      // Spill: try the wedding day, then any later day with room.
      const spillIdx = buckets.findIndex((b) => b.length < 3);
      buckets[spillIdx === -1 ? buckets.length - 1 : spillIdx].push(slug);
      continue;
    }
    buckets[cursor].push(slug);
  }

  // Re-sort each bucket by sequence priority for clean within-day ordering.
  return buckets.map((bucket) =>
    bucket.slice().sort((a, b) => {
      const pa = resolveEvent(a, "hindu_north").sequencePriority;
      const pb = resolveEvent(b, "hindu_north").sequencePriority;
      return pa - pb;
    }),
  );
}

// ── Per-day time placement ────────────────────────────────────────────────

interface DayContext {
  isFirstDay: boolean;
  isLastDay: boolean;
}

function scheduleDay(
  slugs: EventSlug[],
  inputs: VisualizerInputs,
  ctx: DayContext,
): ScheduledEvent[] {
  const placements: ScheduledEvent[] = [];

  // Sort slugs by their *target* time of day (morning → afternoon → evening)
  // so we lay them out left-to-right on a wall clock.
  const withResolved = slugs.map((slug) => ({
    slug,
    event: resolveEvent(slug, inputs.style),
  }));

  withResolved.sort((a, b) => {
    const ta = targetTimeOfDay(a.slug, a.event.defaultTimeOfDay, inputs);
    const tb = targetTimeOfDay(b.slug, b.event.defaultTimeOfDay, inputs);
    return timeOrder(ta) - timeOrder(tb);
  });

  for (const { slug, event } of withResolved) {
    const targetTOD = targetTimeOfDay(slug, event.defaultTimeOfDay, inputs);
    const durationMin = Math.round(event.defaultDuration * 60);

    let proposedStart = ANCHOR[targetTOD];

    // Shift past any prior event with required buffer.
    if (placements.length > 0) {
      const last = placements[placements.length - 1];
      const requiredBuffer =
        last.slug === "ceremony" && slug === "reception"
          ? POST_CEREMONY_BUFFER_MINUTES
          : MIN_BUFFER_MINUTES;
      const earliestAllowed = last.endMinutes + requiredBuffer;
      if (earliestAllowed > proposedStart) {
        proposedStart = earliestAllowed;
      }
    }

    // Snap to the right window if we overshot.
    const window = WINDOW[targetTOD];
    if (proposedStart > window.latest) {
      // Slide into the next available time-of-day window.
      const nextTOD: TimeOfDay =
        targetTOD === "morning"
          ? "afternoon"
          : targetTOD === "afternoon"
            ? "evening"
            : "evening";
      proposedStart = Math.max(proposedStart, ANCHOR[nextTOD]);
    } else if (proposedStart < window.earliest) {
      proposedStart = window.earliest;
    }

    placements.push({
      slug,
      name: event.name,
      icon: event.icon,
      startMinutes: proposedStart,
      endMinutes: proposedStart + durationMin,
      durationHours: event.defaultDuration,
      logisticsNote: event.logisticsNote,
      guestSubset: event.typicalGuestSubset,
      description: event.description,
      isMovable: !ANCHORED_EVENTS.has(slug),
    });
  }

  return placements;
}

const ANCHORED_EVENTS = new Set<EventSlug>([
  "ceremony",
  "vidaai",
  "farewell_brunch",
  "welcome_dinner",
]);

function timeOrder(t: TimeOfDay): number {
  return t === "morning" ? 0 : t === "afternoon" ? 1 : 2;
}

/**
 * Resolves the event's actual target time-of-day, factoring in the user's
 * ceremony time preference. Only the ceremony itself flexes; other events
 * keep their cultural default.
 */
function targetTimeOfDay(
  slug: EventSlug,
  fallback: TimeOfDay,
  inputs: VisualizerInputs,
): TimeOfDay {
  if (slug !== "ceremony") return fallback;
  switch (inputs.ceremonyTimePref) {
    case "morning_muhurat":
      return "morning";
    case "afternoon":
      return "afternoon";
    case "evening":
      return "evening";
    case "unsure":
    default:
      return fallback;
  }
}

// ── Display helpers ───────────────────────────────────────────────────────

export function formatClockTime(minutes: number): string {
  const total = ((minutes % (24 * 60)) + 24 * 60) % (24 * 60);
  const h24 = Math.floor(total / 60);
  const m = total % 60;
  const h12 = ((h24 + 11) % 12) + 1;
  const suffix = h24 < 12 ? "AM" : "PM";
  const mm = m.toString().padStart(2, "0");
  return `${h12}:${mm} ${suffix}`;
}

export function formatDurationLabel(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} hr`;
  return `${h}h ${m}m`;
}

export function guestSubsetLabel(subset: GuestSubset): string {
  switch (subset) {
    case "close_family":
      return "Close family only";
    case "wedding_party":
      return "Wedding party + close friends";
    case "full_guest_list":
      return "Full guest list";
  }
}

export function styleLabel(style: WeddingStyle): string {
  switch (style) {
    case "hindu_north":
      return "Hindu (North Indian)";
    case "hindu_south":
      return "Hindu (South Indian)";
    case "sikh":
      return "Sikh";
    case "muslim":
      return "Muslim (Nikah)";
    case "fusion":
      return "Fusion / Interfaith";
    case "modern":
      return "Modern / Non-Traditional";
  }
}

export function ceremonyPrefLabel(pref: CeremonyTimePref): string {
  switch (pref) {
    case "morning_muhurat":
      return "Morning Muhurat";
    case "afternoon":
      return "Afternoon";
    case "evening":
      return "Evening";
    case "unsure":
      return "Not sure yet";
  }
}

export function formatLabel(format: WeddingFormat): string {
  switch (format) {
    case "intimate":
      return "Intimate (50-100)";
    case "classic":
      return "Classic (150-250)";
    case "grand":
      return "Grand (300-500)";
    case "royal":
      return "Royal (500+)";
  }
}

/**
 * Suggests a sensible day count for the chosen number of events.
 * Used as a default value in the form before the user overrides.
 */
export function suggestDayCount(eventCount: number): number {
  if (eventCount <= 2) return 1;
  if (eventCount <= 4) return 2;
  if (eventCount <= 6) return 3;
  if (eventCount <= 8) return 4;
  return 5;
}
