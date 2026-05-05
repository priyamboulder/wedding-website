// ── Planning Milestones store ─────────────────────────────────────────────
// "Moments worth marking" — quiet, gold-foil acknowledgments that fire
// when the couple hits significant planning milestones (first vendor
// booked, venue confirmed, guest count thresholds, etc.).
//
// Each milestone type can only trigger once per couple. The trigger
// pipeline (lib/dashboard/milestone-triggers.ts) reads platform state and
// calls `triggerIfNew(type, message)` — idempotent: a no-op when the
// milestone already exists.
//
// Dismissed milestones stay in the store: they feed the Planning Journal
// timeline and Year in Review. The dashboard card surfaces only the
// most recent un-dismissed milestone.

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type MilestoneType =
  | "first_vendor_booked"
  | "venue_confirmed"
  | "all_events_defined"
  | "guests_50"
  | "guests_100"
  | "guests_200"
  | "guests_300"
  | "save_the_dates_sent"
  | "invitations_sent"
  | "budget_fully_allocated"
  | "outfit_ordered"
  | "all_vendors_booked"
  | "checklist_50"
  | "checklist_90"
  | "one_month_out"
  | "one_week_out"
  | "wedding_day";

export interface Milestone {
  id: string;
  type: MilestoneType;
  message: string;
  triggeredAt: string;
  dismissed: boolean;
  createdAt: string;
}

interface MilestonesState {
  milestones: Milestone[];
  triggerIfNew: (type: MilestoneType, message: string) => Milestone | null;
  dismiss: (id: string) => void;
  remove: (id: string) => void;
  hasTriggered: (type: MilestoneType) => boolean;
  /** The most recent milestone the couple hasn't dismissed yet. */
  latestActive: () => Milestone | null;
}

const uid = (): string =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `ms_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`;

export const useMilestonesStore = create<MilestonesState>()(
  persist(
    (set, get) => ({
      milestones: [],

      triggerIfNew: (type, message) => {
        if (get().milestones.some((m) => m.type === type)) return null;
        const now = new Date().toISOString();
        const milestone: Milestone = {
          id: uid(),
          type,
          message,
          triggeredAt: now,
          dismissed: false,
          createdAt: now,
        };
        set((s) => ({ milestones: [milestone, ...s.milestones] }));
        return milestone;
      },

      dismiss: (id) =>
        set((s) => ({
          milestones: s.milestones.map((m) =>
            m.id === id ? { ...m, dismissed: true } : m,
          ),
        })),

      remove: (id) =>
        set((s) => ({
          milestones: s.milestones.filter((m) => m.id !== id),
        })),

      hasTriggered: (type) =>
        get().milestones.some((m) => m.type === type),

      latestActive: () => {
        const active = get().milestones.filter((m) => !m.dismissed);
        if (active.length === 0) return null;
        return active.reduce((latest, m) =>
          new Date(m.triggeredAt).getTime() >
          new Date(latest.triggeredAt).getTime()
            ? m
            : latest,
        );
      },
    }),
    {
      name: "ananya:milestones",
      storage: createJSONStorage(() => {
        if (typeof window === "undefined") {
          return {
            getItem: () => null,
            setItem: () => undefined,
            removeItem: () => undefined,
          };
        }
        return window.localStorage;
      }),
      partialize: (s) => ({ milestones: s.milestones }),
    },
  ),
);
