// ── Default mehendi day-of timeline ──────────────────────────────────────
// The 12:00–17:30 schedule the Logistics journey loads when the bride taps
// "Load default schedule." Authoritative copy lives here; the mehndi-store's
// seedDefaultSchedule re-uses the same template so both surfaces stay in
// lock-step.

import type { ScheduleItem } from "@/types/mehndi";

export type DefaultScheduleTemplate = Pick<
  ScheduleItem,
  "time" | "title" | "detail" | "track"
>;

export const DEFAULT_MEHENDI_TIMELINE: DefaultScheduleTemplate[] = [
  {
    time: "12:00",
    title: "Lead artist arrives",
    detail: "Sets up bride's dedicated station.",
    track: "bride",
  },
  {
    time: "12:30",
    title: "Bride's mehendi begins",
    detail: "Dedicated artist, ~90 minutes.",
    track: "bride",
  },
  {
    time: "13:00",
    title: "Guest artists arrive",
    detail: "Stations for guests — 5 artists.",
    track: "general",
  },
  {
    time: "13:30",
    title: "Guests arrive",
    detail: "Snacks, music, lemon-sugar station set up.",
    track: "general",
  },
  {
    time: "14:00",
    title: "Slot 1 — bridal party + mothers",
    detail: "3 artists on medium designs.",
    track: "general",
  },
  {
    time: "14:00",
    title: "Slot 1 — guests",
    detail: "2 artists on simple designs.",
    track: "general",
  },
  {
    time: "14:30",
    title: "Bride's mehendi complete",
    detail: "Drying begins. Assign bride-care.",
    track: "bride",
  },
  {
    time: "15:00",
    title: "Slot 2 — guests group A",
    detail: "5 artists.",
    track: "general",
  },
  {
    time: "15:30",
    title: "Bride — lemon-sugar",
    detail: "Apply paste sealant, elevate hands.",
    track: "bride",
  },
  {
    time: "16:00",
    title: "Slot 3 — guests group B",
    detail: "5 artists.",
    track: "general",
  },
  {
    time: "17:00",
    title: "Guest mehendi complete",
    detail: "Artists pack up.",
    track: "general",
  },
  {
    time: "17:30",
    title: "Event winds down",
    detail: "Last-minute touch-ups only.",
    track: "general",
  },
];
