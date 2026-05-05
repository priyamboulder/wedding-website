// ── Mehendi Logistics journey ─────────────────────────────────────────────
// Second guided journey on the Mehendi workspace. Vision (the original 3-
// session flow) lives at journey_id = "default"; Logistics lives at
// journey_id = "logistics". Three sessions:
//
//   1. tiers_and_capacity — define tiers, run the capacity calculator,
//      auto-VIP from guest list, configure sign-up.
//   2. artist_contract    — seven-item contract checklist with prefilled
//      hints from Session 1.
//   3. day_of_flow        — timeline, bride care, setup logistics.
//
// Unlike Vision, Logistics does NOT generate a brief at the end. The output
// is operational: tiers locked, contract checklist ready, timeline loaded.
//
// Field storage strategy: the session UIs read & write directly through the
// existing mehndi-store (the same source of truth Tabs 2/3/4 use). This
// gives free two-way sync with no copy-and-paste. The journey state itself
// only persists session statuses (not_started/in_progress/completed) and
// the small set of metadata that doesn't already have a home in the store
// (see MehndiLogisticsJourneyMeta in mehndi-store).

import type { CategoryKey } from "@/lib/guided-journey/types";

export const MEHENDI_LOGISTICS_JOURNEY_ID = "logistics";
export const MEHENDI_LOGISTICS_CATEGORY: CategoryKey = "mehendi";

export type LogisticsSessionKey =
  | "tiers_and_capacity"
  | "artist_contract"
  | "day_of_flow";

export interface LogisticsSessionDef {
  key: LogisticsSessionKey;
  index: number;
  title: string;
  subtitle: string;
  estimatedMinutes: number;
}

export const MEHENDI_LOGISTICS_SESSIONS: readonly LogisticsSessionDef[] = [
  {
    key: "tiers_and_capacity",
    index: 1,
    title: "Design tiers & capacity",
    subtitle:
      "Decide who gets what level of mehendi — and whether your artists can serve everyone.",
    estimatedMinutes: 3,
  },
  {
    key: "artist_contract",
    index: 2,
    title: "Artist contract checklist",
    subtitle: "The seven things to lock down before you sign.",
    estimatedMinutes: 3,
  },
  {
    key: "day_of_flow",
    index: 3,
    title: "Day-of flow & bride care",
    subtitle: "The timeline, the helper, and the room setup.",
    estimatedMinutes: 2,
  },
] as const;

export const MEHENDI_LOGISTICS_TOTAL_MINUTES = MEHENDI_LOGISTICS_SESSIONS.reduce(
  (sum, s) => sum + s.estimatedMinutes,
  0,
);

export function getLogisticsSession(
  key: LogisticsSessionKey,
): LogisticsSessionDef {
  const found = MEHENDI_LOGISTICS_SESSIONS.find((s) => s.key === key);
  if (!found) {
    throw new Error(`Unknown logistics session: ${key}`);
  }
  return found;
}
