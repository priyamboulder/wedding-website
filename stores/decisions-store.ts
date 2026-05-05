// ── Decisions store ────────────────────────────────────────────────────
// "We decided" — the identity-defining choices that shape a wedding.
// Distinct from the checklist: tasks complete, decisions *define*.
//
// Two creation paths:
//   • auto: hooks fire from vendor bookings, journey steps, brief edits
//   • manual: the couple types one straight in via the dashboard input
//
// Each decision carries a source so the dashboard can label them ("Auto-
// captured from vendor booking" vs the couple's voice). Optional event
// tag links the decision to a specific event in the program.

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type DecisionSource = "auto" | "manual";
export type DecisionSourceType =
  | "vendor_booking"
  | "venue_set"
  | "date_set"
  | "palette_set"
  | "journey_step"
  | "brief_update"
  | "manual";

export interface Decision {
  id: string;
  content: string;
  eventId?: string | null;
  /** Stable key for auto-decisions so the same upstream change doesn't
   * create duplicates if it fires twice (e.g. "vendor:venue:cat-id").
   * Manual decisions leave this null. */
  autoKey?: string | null;
  source: DecisionSource;
  sourceType: DecisionSourceType;
  createdAt: string;
}

interface AddDecisionInput {
  content: string;
  eventId?: string | null;
  source?: DecisionSource;
  sourceType?: DecisionSourceType;
  autoKey?: string | null;
}

interface DecisionsState {
  decisions: Decision[];
  addDecision: (input: AddDecisionInput) => Decision;
  /** Add an auto-decision only if no prior decision shares its autoKey. */
  upsertAuto: (input: AddDecisionInput & { autoKey: string }) => Decision | null;
  updateDecision: (id: string, patch: Partial<Decision>) => void;
  deleteDecision: (id: string) => void;
}

const uid = (): string =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `dec_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`;

export const useDecisionsStore = create<DecisionsState>()(
  persist(
    (set, get) => ({
      decisions: [],

      addDecision: (input) => {
        const decision: Decision = {
          id: uid(),
          content: input.content.trim(),
          eventId: input.eventId ?? null,
          autoKey: input.autoKey ?? null,
          source: input.source ?? "manual",
          sourceType: input.sourceType ?? "manual",
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ decisions: [decision, ...s.decisions] }));
        return decision;
      },

      upsertAuto: (input) => {
        if (get().decisions.some((d) => d.autoKey === input.autoKey)) {
          return null;
        }
        const decision: Decision = {
          id: uid(),
          content: input.content.trim(),
          eventId: input.eventId ?? null,
          autoKey: input.autoKey,
          source: "auto",
          sourceType: input.sourceType ?? "manual",
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ decisions: [decision, ...s.decisions] }));
        return decision;
      },

      updateDecision: (id, patch) =>
        set((s) => ({
          decisions: s.decisions.map((d) =>
            d.id === id ? { ...d, ...patch } : d,
          ),
        })),

      deleteDecision: (id) =>
        set((s) => ({
          decisions: s.decisions.filter((d) => d.id !== id),
        })),
    }),
    {
      name: "ananya:decisions",
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
      partialize: (s) => ({ decisions: s.decisions }),
    },
  ),
);
