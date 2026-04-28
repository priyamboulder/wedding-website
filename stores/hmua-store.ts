// â”€â”€ HMUA store â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Hair & Makeup workspace state that doesn't fit the polymorphic
// WorkspaceItem shape:
//   â€¢ Skin & hair profile â€” the personal card the artist keeps referring to.
//   â€¢ Schedule settings â€” ceremony time, team size, per-person chair minutes â€”
//     the inputs that drive the day-of timeline grid.
//
// Per-wedding scope: keyed by WorkspaceCategory.id so a couple with multiple
// wedding categories ever (unlikely but possible) doesn't bleed state.
//
// Persists to localStorage via Zustand. Pure couple-side state.

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { dbUpsert, getCurrentCoupleId } from "@/lib/supabase/db-sync";
import type {
  AccessoryRecommendation,
  BeautyBrief,
  ChairScheduleReview,
  EventLook,
  SmsMessage,
  StyleCard,
  StyleCategory,
  StyleQuiz,
} from "@/types/hmua-ai";
import type { WeddingEvent } from "@/types/workspace";

// â”€â”€ Skin & hair profile â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export type SkinType = "oily" | "dry" | "combination" | "sensitive" | "";
export type SkinTone = "fair" | "medium" | "olive" | "deep" | "";
export type HairType = "straight" | "wavy" | "curly" | "coily" | "";
export type HairLength = "short" | "medium" | "long" | "";

// Interactive quiz adds depth the static form never captured â€” concerns,
// reaction tendency, SPF habits, curl-holding â€” so the artist gets a real
// dossier, not just checkboxes.

export type SkinConcern =
  | "acne"
  | "rosacea"
  | "pigmentation"
  | "texture"
  | "fine_lines"
  | "dullness"
  | "sensitivity";

export type SkinReaction = "often" | "sometimes" | "rarely" | "never" | "";
export type SpfHabit = "daily" | "sometimes" | "rarely" | "never" | "";
export type HairTreatment = "natural" | "color" | "keratin" | "extensions" | "highlights" | "";
export type HairConcern = "frizz" | "thinning" | "breakage" | "oiliness" | "dryness" | "dandruff";
export type CurlHold = "great" | "okay" | "poor" | "";

export interface SkinHairProfile {
  skin_type: SkinType;
  skin_tone: SkinTone;
  skin_tone_custom: string;        // e.g. "MAC NC42, Fenty 350"
  hair_type: HairType;
  hair_length: HairLength;
  allergies: string;
  contact_lenses: boolean;
  skin_conditions: string;
  preferred_brands: string;        // free text â€” "MAC, Bobbi Brown, Charlotte Tilbury"
  // â”€â”€ Quiz-derived (v4) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  skin_concerns: SkinConcern[];
  skin_reaction: SkinReaction;
  spf_habit: SpfHabit;
  hair_treatment: HairTreatment;
  hair_concerns: HairConcern[];
  curl_hold: CurlHold;
  quiz_completed_at: string;       // ISO timestamp, "" if never taken
}

const EMPTY_PROFILE: SkinHairProfile = {
  skin_type: "",
  skin_tone: "",
  skin_tone_custom: "",
  hair_type: "",
  hair_length: "",
  allergies: "",
  contact_lenses: false,
  skin_conditions: "",
  preferred_brands: "",
  skin_concerns: [],
  skin_reaction: "",
  spf_habit: "",
  hair_treatment: "",
  hair_concerns: [],
  curl_hold: "",
  quiz_completed_at: "",
};

// â”€â”€ Schedule settings â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface HmuaScheduleSettings {
  ceremony_start: string;          // "17:00"
  bride_ready_by: string;          // "15:00"
  bride_chair_minutes: number;     // 150
  default_chair_minutes: number;   // 60 (per non-bride person)
  team_arrival: string;            // "07:30"
  artist_count: number;            // 3
  artists: { id: string; name: string }[]; // labeled lanes
}

const DEFAULT_SCHEDULE: HmuaScheduleSettings = {
  ceremony_start: "17:00",
  bride_ready_by: "15:00",
  bride_chair_minutes: 150,
  default_chair_minutes: 60,
  team_arrival: "07:30",
  artist_count: 3,
  artists: [
    { id: "artist-1", name: "Lead artist" },
    { id: "artist-2", name: "Artist 2" },
    { id: "artist-3", name: "Artist 3" },
  ],
};

// â”€â”€ Touch-up kit assignment â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Three physically separate kits â€” if one goes missing, the morning is
// saved by the other two. `carrier` / `storage_locations` represent the
// primary kit (kept for backward compat with v2 persisted state); the
// backup/artist fields are added in v3.

export interface TouchUpAssignment {
  carrier: string;                  // primary kit carrier â€” e.g. "Maid of honor â€” Aanya"
  storage_locations: string;        // primary kit locations at each venue
  backup_carrier: string;           // e.g. "Planner â€” Urvashi"
  backup_location: string;          // where the backup lives (planner's tote, etc.)
  backup_notes: string;             // what goes in the backup (emergency items)
  artist_carrier: string;           // lead HMUA artist name
  artist_location: string;          // "With artist â€” she brings her own"
  artist_notes: string;             // bride's exact shades for artist touch-ups
}

const EMPTY_ASSIGNMENT: TouchUpAssignment = {
  carrier: "",
  storage_locations: "",
  backup_carrier: "",
  backup_location: "",
  backup_notes: "",
  artist_carrier: "",
  artist_location: "",
  artist_notes: "",
};

// â”€â”€ AI state (per category) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Everything produced by the 7 AI modes â€” style card swipes, the structured
// Beauty Brief, per-event looks, schedule reviews, SMS drafts, party quizzes,
// accessory recs. Persists alongside the existing HMUA state so a reload
// doesn't wipe a bride's swipe history.

export interface HmuaAiState {
  // Style-card pool + swipe history. The pool is the last set generated
  // for the given category; it's replaced on each regeneration. Swipes
  // carry forward so the next generation can avoid repeats and so the
  // brief synthesis can read them.
  cardPools: Partial<Record<StyleCategory, StyleCard[]>>;
  likedCards: Partial<Record<StyleCategory, string[]>>;  // card names
  skippedCards: Partial<Record<StyleCategory, string[]>>;
  bridgeNotes: string;                                    // free-text direction the bride types into the swipe surface

  // Synthesized Beauty Brief (BEAUTY_BRIEF mode output). The plain-text
  // note at VisionMoodTab remains the canvas the bride rewrites; this is
  // the AI-produced scaffold she can copy into it.
  beautyBrief: BeautyBrief | null;

  // Per-event composed looks (EVENT_LOOK mode). Keyed by WeddingEvent.
  eventLooks: Partial<Record<WeddingEvent, EventLook>>;

  // Chair-schedule AI review (CHAIR_SCHEDULE mode) â€” produced on demand,
  // overwrites prior run.
  scheduleReview: ChairScheduleReview | null;

  // SMS drafts (SMS_SCHEDULE mode) â€” last generated batch.
  smsDrafts: SmsMessage[];

  // Party quizzes, keyed by the party member's name.
  partyQuizzes: Record<string, StyleQuiz>;

  // Accessory recommendations, keyed by event.
  accessoryRecs: Partial<Record<WeddingEvent, AccessoryRecommendation[]>>;
}

const EMPTY_AI: HmuaAiState = {
  cardPools: {},
  likedCards: {},
  skippedCards: {},
  bridgeNotes: "",
  beautyBrief: null,
  eventLooks: {},
  scheduleReview: null,
  smsDrafts: [],
  partyQuizzes: {},
  accessoryRecs: {},
};

// â”€â”€ Store shape â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface HmuaState {
  profiles: Record<string, SkinHairProfile>;
  schedules: Record<string, HmuaScheduleSettings>;
  touchUps: Record<string, TouchUpAssignment>;
  ai: Record<string, HmuaAiState>;

  getProfile: (categoryId: string) => SkinHairProfile;
  setProfile: (categoryId: string, patch: Partial<SkinHairProfile>) => void;

  getSchedule: (categoryId: string) => HmuaScheduleSettings;
  setSchedule: (categoryId: string, patch: Partial<HmuaScheduleSettings>) => void;
  setArtistName: (categoryId: string, artistId: string, name: string) => void;

  getTouchUp: (categoryId: string) => TouchUpAssignment;
  setTouchUp: (categoryId: string, patch: Partial<TouchUpAssignment>) => void;

  getAi: (categoryId: string) => HmuaAiState;
  setCardPool: (categoryId: string, category: StyleCategory, cards: StyleCard[]) => void;
  likeCard: (categoryId: string, category: StyleCategory, cardName: string) => void;
  skipCard: (categoryId: string, category: StyleCategory, cardName: string) => void;
  resetSwipes: (categoryId: string, category: StyleCategory) => void;
  setBrideNotes: (categoryId: string, notes: string) => void;
  setBeautyBrief: (categoryId: string, brief: BeautyBrief | null) => void;
  setEventLook: (categoryId: string, event: WeddingEvent, look: EventLook) => void;
  clearEventLook: (categoryId: string, event: WeddingEvent) => void;
  setScheduleReview: (categoryId: string, review: ChairScheduleReview | null) => void;
  setSmsDrafts: (categoryId: string, messages: SmsMessage[]) => void;
  setPartyQuiz: (categoryId: string, person: string, quiz: StyleQuiz) => void;
  setAccessoryRecs: (
    categoryId: string,
    event: WeddingEvent,
    recs: AccessoryRecommendation[],
  ) => void;
}

export const useHmuaStore = create<HmuaState>()(
  persist(
    (set, get) => ({
      profiles: {},
      schedules: {},
      touchUps: {},
      ai: {},

      getProfile: (categoryId) => get().profiles[categoryId] ?? EMPTY_PROFILE,
      setProfile: (categoryId, patch) =>
        set((s) => ({
          profiles: {
            ...s.profiles,
            [categoryId]: { ...EMPTY_PROFILE, ...s.profiles[categoryId], ...patch },
          },
        })),

      getSchedule: (categoryId) => {
        const existing = get().schedules[categoryId];
        if (!existing) return DEFAULT_SCHEDULE;
        // Backfill artists array if a partial migration left it short.
        const artists =
          existing.artists && existing.artists.length === existing.artist_count
            ? existing.artists
            : DEFAULT_SCHEDULE.artists.slice(0, existing.artist_count).map(
                (a, i) =>
                  existing.artists?.[i] ?? a,
              );
        return { ...existing, artists };
      },
      setSchedule: (categoryId, patch) =>
        set((s) => {
          const prev = s.schedules[categoryId] ?? DEFAULT_SCHEDULE;
          const next = { ...prev, ...patch };
          // Resize the artists array to match artist_count.
          if (patch.artist_count !== undefined && patch.artist_count !== prev.artist_count) {
            const list = [...prev.artists];
            while (list.length < patch.artist_count) {
              list.push({
                id: `artist-${list.length + 1}`,
                name: list.length === 0 ? "Lead artist" : `Artist ${list.length + 1}`,
              });
            }
            next.artists = list.slice(0, patch.artist_count);
          }
          return { schedules: { ...s.schedules, [categoryId]: next } };
        }),
      setArtistName: (categoryId, artistId, name) =>
        set((s) => {
          const prev = s.schedules[categoryId] ?? DEFAULT_SCHEDULE;
          return {
            schedules: {
              ...s.schedules,
              [categoryId]: {
                ...prev,
                artists: prev.artists.map((a) =>
                  a.id === artistId ? { ...a, name } : a,
                ),
              },
            },
          };
        }),

      getTouchUp: (categoryId) => ({
        ...EMPTY_ASSIGNMENT,
        ...(get().touchUps[categoryId] ?? {}),
      }),
      setTouchUp: (categoryId, patch) =>
        set((s) => ({
          touchUps: {
            ...s.touchUps,
            [categoryId]: { ...EMPTY_ASSIGNMENT, ...s.touchUps[categoryId], ...patch },
          },
        })),

      // â”€â”€ AI state actions â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      getAi: (categoryId) => get().ai[categoryId] ?? EMPTY_AI,

      setCardPool: (categoryId, category, cards) =>
        set((s) => {
          const prev = s.ai[categoryId] ?? EMPTY_AI;
          return {
            ai: {
              ...s.ai,
              [categoryId]: {
                ...prev,
                cardPools: { ...prev.cardPools, [category]: cards },
              },
            },
          };
        }),

      likeCard: (categoryId, category, cardName) =>
        set((s) => {
          const prev = s.ai[categoryId] ?? EMPTY_AI;
          const liked = new Set(prev.likedCards[category] ?? []);
          const skipped = new Set(prev.skippedCards[category] ?? []);
          liked.add(cardName);
          skipped.delete(cardName);
          return {
            ai: {
              ...s.ai,
              [categoryId]: {
                ...prev,
                likedCards: { ...prev.likedCards, [category]: [...liked] },
                skippedCards: { ...prev.skippedCards, [category]: [...skipped] },
              },
            },
          };
        }),

      skipCard: (categoryId, category, cardName) =>
        set((s) => {
          const prev = s.ai[categoryId] ?? EMPTY_AI;
          const liked = new Set(prev.likedCards[category] ?? []);
          const skipped = new Set(prev.skippedCards[category] ?? []);
          skipped.add(cardName);
          liked.delete(cardName);
          return {
            ai: {
              ...s.ai,
              [categoryId]: {
                ...prev,
                likedCards: { ...prev.likedCards, [category]: [...liked] },
                skippedCards: { ...prev.skippedCards, [category]: [...skipped] },
              },
            },
          };
        }),

      resetSwipes: (categoryId, category) =>
        set((s) => {
          const prev = s.ai[categoryId] ?? EMPTY_AI;
          return {
            ai: {
              ...s.ai,
              [categoryId]: {
                ...prev,
                likedCards: { ...prev.likedCards, [category]: [] },
                skippedCards: { ...prev.skippedCards, [category]: [] },
              },
            },
          };
        }),

      setBrideNotes: (categoryId, notes) =>
        set((s) => {
          const prev = s.ai[categoryId] ?? EMPTY_AI;
          return {
            ai: { ...s.ai, [categoryId]: { ...prev, bridgeNotes: notes } },
          };
        }),

      setBeautyBrief: (categoryId, brief) =>
        set((s) => {
          const prev = s.ai[categoryId] ?? EMPTY_AI;
          return {
            ai: { ...s.ai, [categoryId]: { ...prev, beautyBrief: brief } },
          };
        }),

      setEventLook: (categoryId, event, look) =>
        set((s) => {
          const prev = s.ai[categoryId] ?? EMPTY_AI;
          return {
            ai: {
              ...s.ai,
              [categoryId]: {
                ...prev,
                eventLooks: { ...prev.eventLooks, [event]: look },
              },
            },
          };
        }),

      clearEventLook: (categoryId, event) =>
        set((s) => {
          const prev = s.ai[categoryId] ?? EMPTY_AI;
          const next = { ...prev.eventLooks };
          delete next[event];
          return {
            ai: { ...s.ai, [categoryId]: { ...prev, eventLooks: next } },
          };
        }),

      setScheduleReview: (categoryId, review) =>
        set((s) => {
          const prev = s.ai[categoryId] ?? EMPTY_AI;
          return {
            ai: { ...s.ai, [categoryId]: { ...prev, scheduleReview: review } },
          };
        }),

      setSmsDrafts: (categoryId, messages) =>
        set((s) => {
          const prev = s.ai[categoryId] ?? EMPTY_AI;
          return {
            ai: { ...s.ai, [categoryId]: { ...prev, smsDrafts: messages } },
          };
        }),

      setPartyQuiz: (categoryId, person, quiz) =>
        set((s) => {
          const prev = s.ai[categoryId] ?? EMPTY_AI;
          return {
            ai: {
              ...s.ai,
              [categoryId]: {
                ...prev,
                partyQuizzes: { ...prev.partyQuizzes, [person]: quiz },
              },
            },
          };
        }),

      setAccessoryRecs: (categoryId, event, recs) =>
        set((s) => {
          const prev = s.ai[categoryId] ?? EMPTY_AI;
          return {
            ai: {
              ...s.ai,
              [categoryId]: {
                ...prev,
                accessoryRecs: { ...prev.accessoryRecs, [event]: recs },
              },
            },
          };
        }),
    }),
    {
      name: "ananya:hmua",
      version: 4,
      storage: createJSONStorage(() => { if (typeof window === "undefined") { return { getItem: () => null, setItem: () => undefined, removeItem: () => undefined }; } return window.localStorage; }),
      migrate: (persisted, version) => {
        // v1 â†’ v2: added `ai` field for Style Intelligence engine state.
        // v2 â†’ v3: touchUps gained backup/artist kit fields.
        // v3 â†’ v4: profiles gained quiz-derived fields (concerns, SPF, etc.).
        const p = (persisted as Partial<HmuaState> | undefined) ?? {};
        let next = { ...p };
        if (version < 2 || !next.ai) {
          next = { ...next, ai: {} };
        }
        if (version < 3 && next.touchUps) {
          const patched: Record<string, TouchUpAssignment> = {};
          for (const [k, v] of Object.entries(next.touchUps)) {
            patched[k] = { ...EMPTY_ASSIGNMENT, ...(v ?? {}) };
          }
          next = { ...next, touchUps: patched };
        }
        if (version < 4 && next.profiles) {
          const patched: Record<string, SkinHairProfile> = {};
          for (const [k, v] of Object.entries(next.profiles)) {
            patched[k] = { ...EMPTY_PROFILE, ...(v ?? {}) };
          }
          next = { ...next, profiles: patched };
        }
        return next as HmuaState;
      },
    },
  ),
);

// â”€â”€ Supabase background sync â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
let _hmuaSyncTimer: ReturnType<typeof setTimeout> | null = null;
useHmuaStore.subscribe((state) => {
  if (_hmuaSyncTimer) clearTimeout(_hmuaSyncTimer);
  _hmuaSyncTimer = setTimeout(() => {
    const coupleId = getCurrentCoupleId();
    if (!coupleId) return;
    const { profiles, schedules, touchUps, ai } = state as unknown as Record<string, unknown>;
    dbUpsert("hmua_state", { couple_id: coupleId, profiles, schedules, touch_ups: touchUps, ai });
  }, 600);
});

// â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export const SKIN_TYPE_OPTIONS: { value: SkinType; label: string }[] = [
  { value: "oily", label: "Oily" },
  { value: "dry", label: "Dry" },
  { value: "combination", label: "Combination" },
  { value: "sensitive", label: "Sensitive" },
];

export const SKIN_TONE_OPTIONS: { value: SkinTone; label: string }[] = [
  { value: "fair", label: "Fair" },
  { value: "medium", label: "Medium" },
  { value: "olive", label: "Olive" },
  { value: "deep", label: "Deep" },
];

export const HAIR_TYPE_OPTIONS: { value: HairType; label: string }[] = [
  { value: "straight", label: "Straight" },
  { value: "wavy", label: "Wavy" },
  { value: "curly", label: "Curly" },
  { value: "coily", label: "Coily" },
];

export const HAIR_LENGTH_OPTIONS: { value: HairLength; label: string }[] = [
  { value: "short", label: "Short" },
  { value: "medium", label: "Medium" },
  { value: "long", label: "Long" },
];
