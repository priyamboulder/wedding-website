// ── Bridal Shower store ────────────────────────────────────────────────────
// Zustand + persist. Same single-wedding scoping convention as
// bachelorette-store (no weddingId key). Everything the six tabs read and
// write lives here.

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { dbUpsert, getCurrentCoupleId } from "@/lib/supabase/db-sync";
import type {
  BridalShowerState,
  BrideBrief,
  BridePreferences,
  BudgetOverlay,
  ChecklistItem,
  ShowerGuest,
  ShowerRsvp,
} from "@/types/bridal-shower";

const EMPTY_BRIEF: BrideBrief = {
  plannerRole: null, coPlannerName: "", bridePersonality: [], guestCount: null,
  guestComposition: [], format: null, budgetTier: null, contribution: null,
  venueType: null, city: "", dateTarget: "", dayOfWeek: null, timeOfDay: null, updatedAt: null,
};

function uid(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

interface BridalShowerActions {
  // ── Bride name ───────────────────────────────────────────────────────────
  setBrideName: (name: string) => void;

  // ── Brief ────────────────────────────────────────────────────────────────
  updateBrief: (patch: Partial<BrideBrief>) => void;
  resetBrief: () => void;

  // ── Preferences ──────────────────────────────────────────────────────────
  addPref: (kind: "loves" | "dislikes", text: string) => void;
  removePref: (kind: "loves" | "dislikes", index: number) => void;
  updatePrefs: (patch: Partial<BridePreferences>) => void;

  // ── Concept selection ────────────────────────────────────────────────────
  selectConcept: (conceptId: string) => void;
  clearSelection: () => void;

  // ── Guests ───────────────────────────────────────────────────────────────
  addGuest: (name: string, relationship: string) => void;
  updateGuest: (id: string, patch: Partial<ShowerGuest>) => void;
  removeGuest: (id: string) => void;
  setGuestRsvp: (id: string, rsvp: ShowerRsvp) => void;

  // ── Budget ───────────────────────────────────────────────────────────────
  updateBudget: (patch: Partial<BudgetOverlay>) => void;
  addBudgetLine: (label: string) => void;
  updateBudgetLine: (
    id: string,
    patch: Partial<BudgetOverlay["lines"][number]>,
  ) => void;
  removeBudgetLine: (id: string) => void;

  // ── Checklist ────────────────────────────────────────────────────────────
  toggleChecklistItem: (conceptId: string, itemId: string) => void;
  addCustomChecklistItem: (
    conceptId: string,
    label: string,
    phase: ChecklistItem["phase"],
  ) => void;
  removeCustomChecklistItem: (conceptId: string, itemId: string) => void;
  toggleCustomChecklistItem: (conceptId: string, itemId: string) => void;

  reset: () => Promise<void>;
  ensureSeeded: () => Promise<void>;
}

export const useBridalShowerStore = create<
  BridalShowerState & BridalShowerActions
>()(
  persist(
    (set) => ({
      brideName: "" as BridalShowerState["brideName"],
      brief: { ...EMPTY_BRIEF } as BridalShowerState["brief"],
      preferences: { loves: [], dislikes: [], weddingColors: "", registryAt: "" } as BridalShowerState["preferences"],
      selection: { conceptId: null, selectedAt: null } as BridalShowerState["selection"],
      guests: [] as BridalShowerState["guests"],
      budget: { totalBudgetCents: 0, lines: [] } as BridalShowerState["budget"],
      checklist: { done: {}, custom: {} } as BridalShowerState["checklist"],

      ensureSeeded: async () => {
        const { DEFAULT_BRIDAL_SHOWER } = await import("@/lib/bridal-shower-seed");
        set((s) => {
          if (s.guests.length > 0 || s.brideName) return s;
          return { ...DEFAULT_BRIDAL_SHOWER };
        });
      },

      // ── Bride name ─────────────────────────────────────────────────────
      setBrideName: (name) => set(() => ({ brideName: name })),

      // ── Brief ──────────────────────────────────────────────────────────
      updateBrief: (patch) =>
        set((s) => ({
          brief: { ...s.brief, ...patch, updatedAt: nowIso() },
        })),
      resetBrief: () =>
        set(() => ({
          brief: { ...EMPTY_BRIEF, updatedAt: null },
        })),

      // ── Preferences ────────────────────────────────────────────────────
      addPref: (kind, text) =>
        set((s) => ({
          preferences: {
            ...s.preferences,
            [kind]: [...s.preferences[kind], text],
          },
        })),
      removePref: (kind, index) =>
        set((s) => ({
          preferences: {
            ...s.preferences,
            [kind]: s.preferences[kind].filter((_, i) => i !== index),
          },
        })),
      updatePrefs: (patch) =>
        set((s) => ({ preferences: { ...s.preferences, ...patch } })),

      // ── Concept selection ──────────────────────────────────────────────
      selectConcept: (conceptId) =>
        set(() => ({
          selection: { conceptId, selectedAt: nowIso() },
        })),
      clearSelection: () =>
        set(() => ({ selection: { conceptId: null, selectedAt: null } })),

      // ── Guests ─────────────────────────────────────────────────────────
      addGuest: (name, relationship) =>
        set((s) => ({
          guests: [
            ...s.guests,
            {
              id: uid("g"),
              name,
              relationship,
              rsvp: "pending",
              dietary: "",
              notes: "",
            },
          ],
        })),
      updateGuest: (id, patch) =>
        set((s) => ({
          guests: s.guests.map((g) => (g.id === id ? { ...g, ...patch } : g)),
        })),
      removeGuest: (id) =>
        set((s) => ({ guests: s.guests.filter((g) => g.id !== id) })),
      setGuestRsvp: (id, rsvp) =>
        set((s) => ({
          guests: s.guests.map((g) => (g.id === id ? { ...g, rsvp } : g)),
        })),

      // ── Budget ─────────────────────────────────────────────────────────
      updateBudget: (patch) =>
        set((s) => ({ budget: { ...s.budget, ...patch } })),
      addBudgetLine: (label) =>
        set((s) => ({
          budget: {
            ...s.budget,
            lines: [
              ...s.budget.lines,
              {
                id: uid("bl"),
                label,
                plannedCents: 0,
                actualCents: 0,
                paidBy: "",
                note: "",
              },
            ],
          },
        })),
      updateBudgetLine: (id, patch) =>
        set((s) => ({
          budget: {
            ...s.budget,
            lines: s.budget.lines.map((l) =>
              l.id === id ? { ...l, ...patch } : l,
            ),
          },
        })),
      removeBudgetLine: (id) =>
        set((s) => ({
          budget: {
            ...s.budget,
            lines: s.budget.lines.filter((l) => l.id !== id),
          },
        })),

      // ── Checklist ──────────────────────────────────────────────────────
      toggleChecklistItem: (conceptId, itemId) =>
        set((s) => {
          const current = s.checklist.done[conceptId] ?? [];
          const next = current.includes(itemId)
            ? current.filter((id) => id !== itemId)
            : [...current, itemId];
          return {
            checklist: {
              ...s.checklist,
              done: { ...s.checklist.done, [conceptId]: next },
            },
          };
        }),
      addCustomChecklistItem: (conceptId, label, phase) =>
        set((s) => {
          const current = s.checklist.custom[conceptId] ?? [];
          return {
            checklist: {
              ...s.checklist,
              custom: {
                ...s.checklist.custom,
                [conceptId]: [
                  ...current,
                  { id: uid("cc"), label, phase, done: false },
                ],
              },
            },
          };
        }),
      removeCustomChecklistItem: (conceptId, itemId) =>
        set((s) => {
          const current = s.checklist.custom[conceptId] ?? [];
          return {
            checklist: {
              ...s.checklist,
              custom: {
                ...s.checklist.custom,
                [conceptId]: current.filter((i) => i.id !== itemId),
              },
            },
          };
        }),
      toggleCustomChecklistItem: (conceptId, itemId) =>
        set((s) => {
          const current = s.checklist.custom[conceptId] ?? [];
          return {
            checklist: {
              ...s.checklist,
              custom: {
                ...s.checklist.custom,
                [conceptId]: current.map((i) =>
                  i.id === itemId ? { ...i, done: !i.done } : i,
                ),
              },
            },
          };
        }),

      reset: async () => {
        const { DEFAULT_BRIDAL_SHOWER } = await import("@/lib/bridal-shower-seed");
        set(() => ({ ...DEFAULT_BRIDAL_SHOWER }));
      },
    }),
    {
      name: "ananya:bridal_shower",
      version: 1,
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
    },
  ),
);

let _bridalShowerSyncTimer: ReturnType<typeof setTimeout> | null = null;
useBridalShowerStore.subscribe((state) => {
  if (_bridalShowerSyncTimer) clearTimeout(_bridalShowerSyncTimer);
  _bridalShowerSyncTimer = setTimeout(() => {
    const coupleId = getCurrentCoupleId();
    if (!coupleId) return;
    const { brideName, brief, preferences, guests, rsvps, budget, checklist, concepts } = state as unknown as Record<string, unknown>;
    dbUpsert("bridal_shower_state", { couple_id: coupleId, bride_name: brideName, brief, preferences, guests, rsvps, budget, checklist, concepts });
  }, 600);
});
