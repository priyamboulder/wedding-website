// â”€â”€ Guest Experiences store â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Tracks reactions on each experience card (love / maybe / not-for-us),
// per-event assignments for loved cards, planner notes, shortlist status,
// and the couple's free-text experience brief.
//
// Persists to localStorage via Zustand â€” same pattern as workspace-store.
// Card config data lives in lib/guest-experiences/experience-catalog.ts.

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { dbUpsert, getCurrentCoupleId } from "@/lib/supabase/db-sync";
import type { ExperienceEvent } from "@/lib/guest-experiences/experience-catalog";

export type CardReaction = "love" | "maybe" | "not_for_us";

export type ShortlistStatus =
  | "not_started"
  | "researching"
  | "quoted"
  | "booked";

export interface CardState {
  card_id: string;
  reaction: CardReaction | null;
  // Events this card is assigned to once loved. Seeds from the card's
  // suggested_events on first love.
  event_assignments: ExperienceEvent[];
  // Shortlist fields â€” only meaningful once reaction === "love".
  status: ShortlistStatus;
  notes: string;
  // Override the catalog's price range when a vendor has been quoted.
  overrideLow: number | null;
  overrideHigh: number | null;
  updated_at: string;
}

// Planner-added custom experiences that don't live in the static catalog.
export interface CustomCard {
  id: string;
  category: string; // ExperienceCategory id string
  name: string;
  description: string;
  price_low: number;
  price_high: number;
  suggested_events: ExperienceEvent[];
  reaction: CardReaction;
  event_assignments: ExperienceEvent[];
  status: ShortlistStatus;
  notes: string;
  created_at: string;
}

// AI-suggested cards appear in the Explorer under the "âœ¨ AI SUGGESTED" badge.
// Same shape as a catalog card but stored on the client; seeded by a stub AI
// suggest function (not wired to a real API in this local-first build).
export interface AiSuggestion {
  id: string;
  category: string;
  name: string;
  description: string;
  image_url: string;
  price_low: number;
  price_high: number;
  suggested_events: ExperienceEvent[];
  created_at: string;
}

export interface InspirationEntry {
  id: string;
  text: string;
  created_at: string;
}

interface GuestExperiencesState {
  cards: Record<string, CardState>;
  customCards: CustomCard[];
  aiSuggestions: AiSuggestion[];
  inspirationEntries: InspirationEntry[];
  // Free-text narrative â€” rendered on Shortlist tab's "Your Guest Experience
  // Brief" and editable with a "Refine with AI" button (stub).
  brief: string;

  // Reactions
  setReaction: (cardId: string, reaction: CardReaction | null) => void;
  undoNotForUs: (cardId: string) => void;

  // Event assignments
  toggleEventAssignment: (cardId: string, event: ExperienceEvent) => void;
  setEventAssignments: (cardId: string, events: ExperienceEvent[]) => void;

  // Shortlist fields
  setStatus: (cardId: string, status: ShortlistStatus) => void;
  setNotes: (cardId: string, notes: string) => void;
  setPriceOverride: (cardId: string, low: number | null, high: number | null) => void;

  // Custom cards
  addCustomCard: (input: Omit<CustomCard, "id" | "created_at" | "reaction" | "event_assignments" | "status" | "notes">) => void;
  updateCustomCard: (id: string, patch: Partial<CustomCard>) => void;
  deleteCustomCard: (id: string) => void;

  // AI suggestions
  addAiSuggestions: (suggestions: Omit<AiSuggestion, "id" | "created_at">[]) => void;

  // Inspiration entries
  addInspirationEntry: (text: string) => void;
  deleteInspirationEntry: (id: string) => void;

  // Brief
  setBrief: (text: string) => void;

  // Helpers
  getState: (cardId: string) => CardState | undefined;
  shortlist: () => string[]; // loved catalog card ids
  countsByReaction: () => Record<CardReaction, number>;
}

const now = () => new Date().toISOString();
const rid = (p: string) =>
  `${p}-${Math.random().toString(36).slice(2, 9)}-${Date.now().toString(36)}`;

function emptyCardState(cardId: string): CardState {
  return {
    card_id: cardId,
    reaction: null,
    event_assignments: [],
    status: "not_started",
    notes: "",
    overrideLow: null,
    overrideHigh: null,
    updated_at: now(),
  };
}

export const useGuestExperiencesStore = create<GuestExperiencesState>()(
  persist(
    (set, get) => ({
      cards: {},
      customCards: [],
      aiSuggestions: [],
      inspirationEntries: [],
      brief: "",

      setReaction: (cardId, reaction) =>
        set((s) => {
          const prev = s.cards[cardId] ?? emptyCardState(cardId);
          return {
            cards: {
              ...s.cards,
              [cardId]: {
                ...prev,
                reaction,
                updated_at: now(),
              },
            },
          };
        }),

      undoNotForUs: (cardId) =>
        set((s) => {
          const prev = s.cards[cardId];
          if (!prev || prev.reaction !== "not_for_us") return {};
          return {
            cards: {
              ...s.cards,
              [cardId]: { ...prev, reaction: null, updated_at: now() },
            },
          };
        }),

      toggleEventAssignment: (cardId, event) =>
        set((s) => {
          const prev = s.cards[cardId] ?? emptyCardState(cardId);
          const has = prev.event_assignments.includes(event);
          const next = has
            ? prev.event_assignments.filter((e) => e !== event)
            : [...prev.event_assignments, event];
          return {
            cards: {
              ...s.cards,
              [cardId]: { ...prev, event_assignments: next, updated_at: now() },
            },
          };
        }),

      setEventAssignments: (cardId, events) =>
        set((s) => {
          const prev = s.cards[cardId] ?? emptyCardState(cardId);
          return {
            cards: {
              ...s.cards,
              [cardId]: { ...prev, event_assignments: events, updated_at: now() },
            },
          };
        }),

      setStatus: (cardId, status) =>
        set((s) => {
          const prev = s.cards[cardId] ?? emptyCardState(cardId);
          return {
            cards: {
              ...s.cards,
              [cardId]: { ...prev, status, updated_at: now() },
            },
          };
        }),

      setNotes: (cardId, notes) =>
        set((s) => {
          const prev = s.cards[cardId] ?? emptyCardState(cardId);
          return {
            cards: {
              ...s.cards,
              [cardId]: { ...prev, notes, updated_at: now() },
            },
          };
        }),

      setPriceOverride: (cardId, low, high) =>
        set((s) => {
          const prev = s.cards[cardId] ?? emptyCardState(cardId);
          return {
            cards: {
              ...s.cards,
              [cardId]: {
                ...prev,
                overrideLow: low,
                overrideHigh: high,
                updated_at: now(),
              },
            },
          };
        }),

      addCustomCard: (input) =>
        set((s) => ({
          customCards: [
            ...s.customCards,
            {
              ...input,
              id: rid("cc"),
              reaction: "love",
              event_assignments: input.suggested_events,
              status: "not_started",
              notes: "",
              created_at: now(),
            },
          ],
        })),

      updateCustomCard: (id, patch) =>
        set((s) => ({
          customCards: s.customCards.map((c) =>
            c.id === id ? { ...c, ...patch } : c,
          ),
        })),

      deleteCustomCard: (id) =>
        set((s) => ({
          customCards: s.customCards.filter((c) => c.id !== id),
        })),

      addAiSuggestions: (suggestions) =>
        set((s) => ({
          aiSuggestions: [
            ...s.aiSuggestions,
            ...suggestions.map((sg) => ({
              ...sg,
              id: rid("ai"),
              created_at: now(),
            })),
          ],
        })),

      addInspirationEntry: (text) =>
        set((s) => ({
          inspirationEntries: [
            ...s.inspirationEntries,
            { id: rid("ins"), text, created_at: now() },
          ],
        })),

      deleteInspirationEntry: (id) =>
        set((s) => ({
          inspirationEntries: s.inspirationEntries.filter((e) => e.id !== id),
        })),

      setBrief: (text) => set({ brief: text }),

      getState: (cardId) => get().cards[cardId],

      shortlist: () =>
        Object.values(get().cards)
          .filter((c) => c.reaction === "love")
          .map((c) => c.card_id),

      countsByReaction: () => {
        const out: Record<CardReaction, number> = {
          love: 0,
          maybe: 0,
          not_for_us: 0,
        };
        for (const c of Object.values(get().cards)) {
          if (c.reaction) out[c.reaction] += 1;
        }
        return out;
      },
    }),
    {
      name: "ananya:guest-experiences",
      version: 1,
      storage: createJSONStorage(() => { if (typeof window === "undefined") { return { getItem: () => null, setItem: () => undefined, removeItem: () => undefined }; } return window.localStorage; }),
      partialize: (state) => ({
        cards: state.cards,
        customCards: state.customCards,
        aiSuggestions: state.aiSuggestions,
        inspirationEntries: state.inspirationEntries,
        brief: state.brief,
      }),
    },
  ),
);

let _guestExperiencesSyncTimer: ReturnType<typeof setTimeout> | null = null;
useGuestExperiencesStore.subscribe((state) => {
  if (_guestExperiencesSyncTimer) clearTimeout(_guestExperiencesSyncTimer);
  _guestExperiencesSyncTimer = setTimeout(() => {
    const coupleId = getCurrentCoupleId();
    if (!coupleId) return;
    dbUpsert("guest_experiences_state", { couple_id: coupleId, data: state as unknown });
  }, 600);
});
