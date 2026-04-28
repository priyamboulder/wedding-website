// ── Events store ───────────────────────────────────────────────────────────
// Single global Zustand store for the Events module. Follows the workspace
// store pattern: top-level slices, persist middleware, partialize to pin
// exactly what gets written to localStorage.
//
// Wedding scoping: the app runs single-wedding today, so we don't key by
// weddingId here — same convention as stores/workspace-store.ts.

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { dbUpsert, dbLoadBlob, getCurrentCoupleId } from "@/lib/supabase/db-sync";
import type {
  AISuggestion,
  AISuggestionScope,
  AISuggestionStatus,
  AttireColorGuidance,
  AttireCoordinationLevel,
  AttireCulturalExpectation,
  AttireFormality,
  CascadeKind,
  CascadeNotification,
  CoupleContext,
  EventRecord,
  EventType,
  EventsQuizState,
  GuestTier,
  MoodTile,
  PaletteSwatch,
  Priority,
  ProgramLocationType,
  Tradition,
  VibeOption,
} from "@/types/events";
import {
  DEFAULT_COUPLE_CONTEXT,
  DEFAULT_EVENTS,
  DEFAULT_QUIZ_STATE,
  EVENT_TYPE_OPTIONS,
} from "@/lib/events-seed";

interface EventsState {
  coupleContext: CoupleContext;
  events: EventRecord[];
  suggestions: AISuggestion[];
  quiz: EventsQuizState;
  cascadeNotifications: CascadeNotification[];

  // ── Couple context ──
  setTraditions: (traditions: Tradition[]) => void;
  setPartnerBackground: (text: string) => void;
  setStoryText: (text: string) => void;
  setTotalGuestCount: (count: number) => void;
  setHeroPalette: (paletteId: string | null) => void;
  setPriorityRanking: (ranking: Priority[]) => void;
  setNonNegotiable: (text: string) => void;
  setDontCare: (text: string) => void;
  setBudgetAllocation: (allocation: Record<string, number> | null) => void;

  // ── Program (events) ──
  setProgram: (types: EventType[]) => void;
  addEvent: (type: EventType, customName?: string) => void;
  removeEvent: (id: string) => void;
  updateEvent: (id: string, patch: Partial<EventRecord>) => void;
  setEventGuestCount: (id: string, guestCount: number) => void;
  setEventMood: (id: string, mood: MoodTile | null) => void;
  setEventPalette: (id: string, paletteId: string | null) => void;
  toggleFavoriteImage: (eventId: string, imageId: string) => void;
  toggleFavoriteAttire: (eventId: string, attireId: string) => void;
  setEventVibeSuggestion: (
    eventId: string,
    suggestion: { vibeLabel: string; vibeEventName: string; vibeTheme: string },
  ) => void;
  clearEventVibeSuggestion: (eventId: string) => void;
  setEventAiNameOptions: (eventId: string, options: VibeOption[]) => void;
  selectEventNameOption: (eventId: string, index: number) => void;
  setEventCustomNameTheme: (
    eventId: string,
    name: string,
    theme: string,
  ) => void;
  clearEventNameSelection: (eventId: string) => void;
  setEventCustomPalette: (
    eventId: string,
    colors: PaletteSwatch[] | null,
  ) => void;
  toggleEventPaletteLock: (eventId: string, position: number) => void;
  setEventPaletteLockedPositions: (
    eventId: string,
    positions: number[],
  ) => void;
  setEventPaletteCustomName: (eventId: string, name: string | null) => void;

  // ── Events workspace fields ──
  setEventDate: (eventId: string, date: string | null) => void;
  setEventVenue: (eventId: string, venueName: string | null) => void;
  setEventOverviewIntro: (eventId: string, text: string) => void;
  setEventVibeIntro: (eventId: string, text: string) => void;
  setEventAttireIntro: (eventId: string, text: string) => void;
  setEventVibeKeywords: (eventId: string, keywords: string[]) => void;
  setEventVibeWants: (eventId: string, items: string[]) => void;
  setEventVibeAvoids: (eventId: string, items: string[]) => void;
  setEventAttireWants: (eventId: string, items: string[]) => void;
  setEventAttireAvoids: (eventId: string, items: string[]) => void;
  setEventPinterestUrl: (eventId: string, url: string | null) => void;
  setEventDressCode: (eventId: string, text: string) => void;
  setEventFormality: (eventId: string, formality: AttireFormality | null) => void;
  setEventCulturalNotes: (eventId: string, text: string) => void;

  // ── Rebuild (discovery-first) setters ────────────────────────────
  setEventEnergyLevel: (eventId: string, energy: number) => void;
  setEventGuestTier: (eventId: string, tierId: string | null) => void;
  setEventPaletteInherits: (eventId: string, inherits: boolean) => void;
  setEventVibeQuizAnswer: (eventId: string, key: string, value: unknown) => void;
  setEventAttireQuizAnswer: (eventId: string, key: string, value: unknown) => void;
  setEventMovieReference: (eventId: string, text: string) => void;
  setEventAttireColorGuidance: (eventId: string, v: AttireColorGuidance | null) => void;
  setEventAttireCulturalExpectation: (eventId: string, v: AttireCulturalExpectation | null) => void;
  setEventAttireCoordinationLevel: (eventId: string, v: AttireCoordinationLevel | null) => void;
  setEventAttireKeywords: (eventId: string, keywords: string[]) => void;
  setEventBrideLookDirection: (eventId: string, text: string) => void;
  setEventGroomLookDirection: (eventId: string, text: string) => void;
  setEventGuestAttireCardText: (eventId: string, text: string) => void;
  setEventArrivalFeel: (eventId: string, text: string) => void;
  setEventPeakMoment: (eventId: string, text: string) => void;
  setEventDepartureFeel: (eventId: string, text: string) => void;
  setEventSensory: (eventId: string, patch: Partial<Pick<EventRecord, "sensorySmell" | "sensorySound" | "sensoryLighting" | "sensoryTemperature">>) => void;
  toggleHospitalityIdea: (eventId: string, ideaId: string) => void;
  setCustomHospitalityIdeas: (eventId: string, ideas: string[]) => void;
  setEventGuestFeelBrief: (eventId: string, text: string) => void;
  setEventBriefText: (eventId: string, text: string) => void;
  setEventBriefAiDraft: (eventId: string, text: string) => void;

  // ── Program-level setters ────────────────────────────────────────
  setProgramBrief: (text: string) => void;
  setProgramBriefAiDraft: (text: string) => void;
  setLocationType: (v: ProgramLocationType | null) => void;
  setDestinationLocation: (text: string) => void;
  setProgramSize: (v: string | null) => void;
  setGuestTiers: (tiers: GuestTier[]) => void;
  reorderEvents: (nextOrderIds: string[]) => void;
  setProgramDiscoveryComplete: (complete: boolean) => void;

  // ── Quiz navigation ──
  setQuizStepIndex: (stepIndex: number) => void;
  completeQuiz: () => void;
  resetQuiz: () => void;
  startBrief: () => void;
  dismissCoachmark: () => void;

  // ── Cascade notifications ──
  acknowledgeCascade: (id: string, consumer: string) => void;
  unreadCascades: (consumer: string, kinds?: CascadeKind[]) => CascadeNotification[];

  // ── AI suggestions ──
  addSuggestion: (input: {
    scope: AISuggestionScope;
    eventId?: string | null;
    suggestion: unknown;
  }) => string;
  updateSuggestion: (
    id: string,
    patch: { status?: AISuggestionStatus; refinementPrompt?: string | null },
  ) => void;
  suggestionsFor: (scope: AISuggestionScope, eventId?: string | null) => AISuggestion[];
}

const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `id_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`;

function makeCascade(
  kind: CascadeKind,
  payload: Record<string, unknown>,
): CascadeNotification {
  return {
    id: uid(),
    kind,
    payload,
    createdAt: new Date().toISOString(),
    acknowledgedBy: [],
  };
}

// Typical guest share lookup so program edits can seed a sensible
// per-event guest count immediately, before AI refines the split.
function defaultGuestCountFor(type: EventType, total: number): number {
  const opt = EVENT_TYPE_OPTIONS.find((o) => o.id === type);
  const share = opt?.defaultGuestShare ?? 0.5;
  return Math.max(10, Math.round(total * share));
}

// Pre-populated energy-level defaults per event type. The couple tweaks
// these on the energy arc step of Program Discovery. 0 = quiet/intimate,
// 100 = full celebration. Picked to match typical wedding-week arcs.
const DEFAULT_ENERGY_BY_TYPE: Record<EventType, number> = {
  pithi: 25,
  haldi: 35,
  mehendi: 55,
  sangeet: 95,
  garba: 90,
  baraat: 80,
  ceremony: 45,
  cocktail: 70,
  reception: 90,
  after_party: 85,
  welcome_dinner: 50,
  farewell_brunch: 30,
  custom: 50,
};

function freshEventRecord(
  type: EventType,
  sortOrder: number,
  totalGuestCount: number,
): EventRecord {
  return {
    id: uid(),
    type,
    customName: null,
    aiSuggestedName: null,
    aiSuggestedTheme: null,
    guestCount: defaultGuestCountFor(type, totalGuestCount),
    moodTile: null,
    paletteId: null,
    sortOrder,
    favoritedImageIds: [],
    favoritedAttireIds: [],
    aiNameOptions: null,
    selectedNameOptionIndex: null,
    customEventName: null,
    customTheme: null,
    vibeLabel: null,
    vibeEventName: null,
    vibeTheme: null,
    customPalette: null,
    paletteLockedPositions: [],
    paletteCustomName: null,
    eventDate: null,
    venueName: null,
    overviewIntro: "",
    vibeIntro: "",
    attireIntro: "",
    vibeKeywords: [],
    vibeWants: [],
    vibeAvoids: [],
    attireWants: [],
    attireAvoids: [],
    pinterestBoardUrl: null,
    dressCode: "",
    formality: null,
    culturalNotes: "",

    // Rebuild fields — discovery-first
    energyLevel: DEFAULT_ENERGY_BY_TYPE[type] ?? 50,
    guestTier: null,
    paletteInherits: true,
    vibeQuizAnswers: {},
    attireQuizAnswers: {},
    movieReference: "",
    attireColorGuidance: null,
    attireCulturalExpectation: null,
    attireCoordinationLevel: null,
    attireKeywords: [],
    brideLookDirection: "",
    groomLookDirection: "",
    guestAttireCardText: "",
    arrivalFeel: "",
    peakMoment: "",
    departureFeel: "",
    sensorySmell: "",
    sensorySound: "",
    sensoryLighting: "",
    sensoryTemperature: "",
    lovedHospitalityIds: [],
    customHospitalityIdeas: [],
    guestFeelBrief: "",
    briefText: "",
    briefAiDraft: "",
  };
}

export const useEventsStore = create<EventsState>()(
  persist(
    (set, get) => ({
      coupleContext: DEFAULT_COUPLE_CONTEXT,
      events: DEFAULT_EVENTS,
      suggestions: [],
      quiz: DEFAULT_QUIZ_STATE,
      cascadeNotifications: [],

      // ── Couple context ──────────────────────────────────────────────
      setTraditions: (traditions) =>
        set((s) => ({
          coupleContext: { ...s.coupleContext, traditions },
        })),
      setPartnerBackground: (partnerBackground) =>
        set((s) => ({
          coupleContext: { ...s.coupleContext, partnerBackground },
        })),
      setStoryText: (storyText) =>
        set((s) => ({ coupleContext: { ...s.coupleContext, storyText } })),
      setTotalGuestCount: (totalGuestCount) =>
        set((s) => {
          // Re-scale each event's guest count proportionally to the new
          // total so small nudges on the slider don't require the couple
          // to re-adjust every per-event count.
          const prev = s.coupleContext.totalGuestCount || 1;
          const ratio = totalGuestCount / prev;
          const events = s.events.map((e) => ({
            ...e,
            guestCount: Math.max(10, Math.round(e.guestCount * ratio)),
          }));
          const cascadeNotifications = s.quiz.hasCompletedOnce
            ? [
                ...s.cascadeNotifications,
                makeCascade("guest_count_changed", {
                  previous: prev,
                  next: totalGuestCount,
                }),
              ]
            : s.cascadeNotifications;
          return {
            coupleContext: { ...s.coupleContext, totalGuestCount },
            events,
            cascadeNotifications,
          };
        }),
      setHeroPalette: (heroPaletteId) =>
        set((s) => ({
          coupleContext: { ...s.coupleContext, heroPaletteId },
        })),
      setPriorityRanking: (priorityRanking) =>
        set((s) => ({
          coupleContext: { ...s.coupleContext, priorityRanking },
        })),
      setNonNegotiable: (nonNegotiable) =>
        set((s) => ({
          coupleContext: { ...s.coupleContext, nonNegotiable },
        })),
      setDontCare: (dontCare) =>
        set((s) => ({
          coupleContext: { ...s.coupleContext, dontCare },
        })),
      setBudgetAllocation: (aiBudgetAllocation) =>
        set((s) => ({
          coupleContext: { ...s.coupleContext, aiBudgetAllocation },
        })),

      // ── Program ────────────────────────────────────────────────────
      setProgram: (types) =>
        set((s) => {
          // Preserve any existing event records for types still selected;
          // drop the rest; append new types at the end of the order.
          const existing = new Map(s.events.map((e) => [e.type, e]));
          const total = s.coupleContext.totalGuestCount;
          const next: EventRecord[] = types.map((type, index) => {
            const prior = existing.get(type);
            if (prior) return { ...prior, sortOrder: index };
            return freshEventRecord(type, index, total);
          });
          return { events: next };
        }),
      addEvent: (type, customName) =>
        set((s) => {
          const total = s.coupleContext.totalGuestCount;
          const rec = freshEventRecord(type, s.events.length, total);
          rec.customName = customName ?? null;
          const cascadeNotifications = s.quiz.hasCompletedOnce
            ? [
                ...s.cascadeNotifications,
                makeCascade("event_added", {
                  eventId: rec.id,
                  type,
                  label: customName ?? type,
                }),
              ]
            : s.cascadeNotifications;
          return {
            events: [...s.events, rec],
            cascadeNotifications,
          };
        }),
      removeEvent: (id) =>
        set((s) => {
          const removed = s.events.find((e) => e.id === id);
          const cascadeNotifications =
            s.quiz.hasCompletedOnce && removed
              ? [
                  ...s.cascadeNotifications,
                  makeCascade("event_removed", {
                    eventId: removed.id,
                    type: removed.type,
                    label: removed.customName ?? removed.type,
                  }),
                ]
              : s.cascadeNotifications;
          return {
            events: s.events
              .filter((e) => e.id !== id)
              .map((e, i) => ({ ...e, sortOrder: i })),
            cascadeNotifications,
          };
        }),
      updateEvent: (id, patch) =>
        set((s) => ({
          events: s.events.map((e) => (e.id === id ? { ...e, ...patch } : e)),
        })),
      setEventGuestCount: (id, guestCount) =>
        set((s) => ({
          events: s.events.map((e) =>
            e.id === id ? { ...e, guestCount: Math.max(0, Math.round(guestCount)) } : e,
          ),
        })),
      setEventMood: (id, moodTile) =>
        set((s) => ({
          events: s.events.map((e) => (e.id === id ? { ...e, moodTile } : e)),
        })),
      setEventPalette: (id, paletteId) =>
        set((s) => ({
          events: s.events.map((e) => (e.id === id ? { ...e, paletteId } : e)),
        })),
      toggleFavoriteImage: (eventId, imageId) =>
        set((s) => ({
          events: s.events.map((e) => {
            if (e.id !== eventId) return e;
            const current = e.favoritedImageIds ?? [];
            const has = current.includes(imageId);
            return {
              ...e,
              favoritedImageIds: has
                ? current.filter((id) => id !== imageId)
                : [...current, imageId],
            };
          }),
        })),
      toggleFavoriteAttire: (eventId, attireId) =>
        set((s) => ({
          events: s.events.map((e) => {
            if (e.id !== eventId) return e;
            const current = e.favoritedAttireIds ?? [];
            const has = current.includes(attireId);
            return {
              ...e,
              favoritedAttireIds: has
                ? current.filter((id) => id !== attireId)
                : [...current, attireId],
            };
          }),
        })),
      setEventVibeSuggestion: (eventId, { vibeLabel, vibeEventName, vibeTheme }) =>
        set((s) => ({
          events: s.events.map((e) =>
            e.id === eventId ? { ...e, vibeLabel, vibeEventName, vibeTheme } : e,
          ),
        })),
      clearEventVibeSuggestion: (eventId) =>
        set((s) => ({
          events: s.events.map((e) =>
            e.id === eventId
              ? { ...e, vibeLabel: null, vibeEventName: null, vibeTheme: null }
              : e,
          ),
        })),
      setEventAiNameOptions: (eventId, aiNameOptions) =>
        set((s) => ({
          events: s.events.map((e) =>
            e.id === eventId ? { ...e, aiNameOptions } : e,
          ),
        })),
      selectEventNameOption: (eventId, index) =>
        set((s) => ({
          events: s.events.map((e) => {
            if (e.id !== eventId) return e;
            const opt = e.aiNameOptions?.[index];
            if (!opt) return { ...e, selectedNameOptionIndex: index };
            // Selecting an AI option clears any prior "Write my own" values
            // — the couple has committed to an option for now.
            return {
              ...e,
              selectedNameOptionIndex: index,
              customEventName: null,
              customTheme: null,
              vibeLabel: opt.vibeLabel,
              vibeEventName: opt.eventName,
              vibeTheme: opt.theme,
            };
          }),
        })),
      setEventCustomNameTheme: (eventId, name, theme) =>
        set((s) => ({
          events: s.events.map((e) =>
            e.id === eventId
              ? {
                  ...e,
                  customEventName: name,
                  customTheme: theme,
                  selectedNameOptionIndex: null,
                  vibeLabel: e.vibeLabel,
                  vibeEventName: name || null,
                  vibeTheme: theme || null,
                }
              : e,
          ),
        })),
      clearEventNameSelection: (eventId) =>
        set((s) => ({
          events: s.events.map((e) =>
            e.id === eventId
              ? {
                  ...e,
                  selectedNameOptionIndex: null,
                  customEventName: null,
                  customTheme: null,
                  vibeLabel: null,
                  vibeEventName: null,
                  vibeTheme: null,
                }
              : e,
          ),
        })),
      setEventCustomPalette: (eventId, customPalette) =>
        set((s) => ({
          events: s.events.map((e) =>
            e.id === eventId ? { ...e, customPalette } : e,
          ),
        })),
      toggleEventPaletteLock: (eventId, position) =>
        set((s) => ({
          events: s.events.map((e) => {
            if (e.id !== eventId) return e;
            const has = e.paletteLockedPositions.includes(position);
            return {
              ...e,
              paletteLockedPositions: has
                ? e.paletteLockedPositions.filter((p) => p !== position)
                : [...e.paletteLockedPositions, position].sort((a, b) => a - b),
            };
          }),
        })),
      setEventPaletteLockedPositions: (eventId, positions) =>
        set((s) => ({
          events: s.events.map((e) =>
            e.id === eventId
              ? {
                  ...e,
                  paletteLockedPositions: [...positions].sort((a, b) => a - b),
                }
              : e,
          ),
        })),
      setEventPaletteCustomName: (eventId, paletteCustomName) =>
        set((s) => ({
          events: s.events.map((e) =>
            e.id === eventId ? { ...e, paletteCustomName } : e,
          ),
        })),

      // ── Events workspace fields ────────────────────────────────────
      setEventDate: (eventId, eventDate) =>
        set((s) => ({
          events: s.events.map((e) => (e.id === eventId ? { ...e, eventDate } : e)),
        })),
      setEventVenue: (eventId, venueName) =>
        set((s) => ({
          events: s.events.map((e) => (e.id === eventId ? { ...e, venueName } : e)),
        })),
      setEventOverviewIntro: (eventId, overviewIntro) =>
        set((s) => ({
          events: s.events.map((e) =>
            e.id === eventId ? { ...e, overviewIntro } : e,
          ),
        })),
      setEventVibeIntro: (eventId, vibeIntro) =>
        set((s) => ({
          events: s.events.map((e) =>
            e.id === eventId ? { ...e, vibeIntro } : e,
          ),
        })),
      setEventAttireIntro: (eventId, attireIntro) =>
        set((s) => ({
          events: s.events.map((e) =>
            e.id === eventId ? { ...e, attireIntro } : e,
          ),
        })),
      setEventVibeKeywords: (eventId, vibeKeywords) =>
        set((s) => ({
          events: s.events.map((e) =>
            e.id === eventId ? { ...e, vibeKeywords } : e,
          ),
        })),
      setEventVibeWants: (eventId, vibeWants) =>
        set((s) => ({
          events: s.events.map((e) =>
            e.id === eventId ? { ...e, vibeWants } : e,
          ),
        })),
      setEventVibeAvoids: (eventId, vibeAvoids) =>
        set((s) => ({
          events: s.events.map((e) =>
            e.id === eventId ? { ...e, vibeAvoids } : e,
          ),
        })),
      setEventAttireWants: (eventId, attireWants) =>
        set((s) => ({
          events: s.events.map((e) =>
            e.id === eventId ? { ...e, attireWants } : e,
          ),
        })),
      setEventAttireAvoids: (eventId, attireAvoids) =>
        set((s) => ({
          events: s.events.map((e) =>
            e.id === eventId ? { ...e, attireAvoids } : e,
          ),
        })),
      setEventPinterestUrl: (eventId, pinterestBoardUrl) =>
        set((s) => ({
          events: s.events.map((e) =>
            e.id === eventId ? { ...e, pinterestBoardUrl } : e,
          ),
        })),
      setEventDressCode: (eventId, dressCode) =>
        set((s) => ({
          events: s.events.map((e) =>
            e.id === eventId ? { ...e, dressCode } : e,
          ),
        })),
      setEventFormality: (eventId, formality) =>
        set((s) => ({
          events: s.events.map((e) =>
            e.id === eventId ? { ...e, formality } : e,
          ),
        })),
      setEventCulturalNotes: (eventId, culturalNotes) =>
        set((s) => ({
          events: s.events.map((e) =>
            e.id === eventId ? { ...e, culturalNotes } : e,
          ),
        })),

      // ── Rebuild (discovery-first) setters ─────────────────────────
      setEventEnergyLevel: (eventId, energy) =>
        set((s) => ({
          events: s.events.map((e) =>
            e.id === eventId
              ? { ...e, energyLevel: Math.max(0, Math.min(100, Math.round(energy))) }
              : e,
          ),
        })),
      setEventGuestTier: (eventId, guestTier) =>
        set((s) => ({
          events: s.events.map((e) =>
            e.id === eventId ? { ...e, guestTier } : e,
          ),
        })),
      setEventPaletteInherits: (eventId, paletteInherits) =>
        set((s) => ({
          events: s.events.map((e) =>
            e.id === eventId ? { ...e, paletteInherits } : e,
          ),
        })),
      setEventVibeQuizAnswer: (eventId, key, value) =>
        set((s) => ({
          events: s.events.map((e) =>
            e.id === eventId
              ? { ...e, vibeQuizAnswers: { ...e.vibeQuizAnswers, [key]: value } }
              : e,
          ),
        })),
      setEventAttireQuizAnswer: (eventId, key, value) =>
        set((s) => ({
          events: s.events.map((e) =>
            e.id === eventId
              ? {
                  ...e,
                  attireQuizAnswers: { ...e.attireQuizAnswers, [key]: value },
                }
              : e,
          ),
        })),
      setEventMovieReference: (eventId, movieReference) =>
        set((s) => ({
          events: s.events.map((e) =>
            e.id === eventId ? { ...e, movieReference } : e,
          ),
        })),
      setEventAttireColorGuidance: (eventId, attireColorGuidance) =>
        set((s) => ({
          events: s.events.map((e) =>
            e.id === eventId ? { ...e, attireColorGuidance } : e,
          ),
        })),
      setEventAttireCulturalExpectation: (eventId, attireCulturalExpectation) =>
        set((s) => ({
          events: s.events.map((e) =>
            e.id === eventId ? { ...e, attireCulturalExpectation } : e,
          ),
        })),
      setEventAttireCoordinationLevel: (eventId, attireCoordinationLevel) =>
        set((s) => ({
          events: s.events.map((e) =>
            e.id === eventId ? { ...e, attireCoordinationLevel } : e,
          ),
        })),
      setEventAttireKeywords: (eventId, attireKeywords) =>
        set((s) => ({
          events: s.events.map((e) =>
            e.id === eventId ? { ...e, attireKeywords } : e,
          ),
        })),
      setEventBrideLookDirection: (eventId, brideLookDirection) =>
        set((s) => ({
          events: s.events.map((e) =>
            e.id === eventId ? { ...e, brideLookDirection } : e,
          ),
        })),
      setEventGroomLookDirection: (eventId, groomLookDirection) =>
        set((s) => ({
          events: s.events.map((e) =>
            e.id === eventId ? { ...e, groomLookDirection } : e,
          ),
        })),
      setEventGuestAttireCardText: (eventId, guestAttireCardText) =>
        set((s) => ({
          events: s.events.map((e) =>
            e.id === eventId ? { ...e, guestAttireCardText } : e,
          ),
        })),
      setEventArrivalFeel: (eventId, arrivalFeel) =>
        set((s) => ({
          events: s.events.map((e) =>
            e.id === eventId ? { ...e, arrivalFeel } : e,
          ),
        })),
      setEventPeakMoment: (eventId, peakMoment) =>
        set((s) => ({
          events: s.events.map((e) =>
            e.id === eventId ? { ...e, peakMoment } : e,
          ),
        })),
      setEventDepartureFeel: (eventId, departureFeel) =>
        set((s) => ({
          events: s.events.map((e) =>
            e.id === eventId ? { ...e, departureFeel } : e,
          ),
        })),
      setEventSensory: (eventId, patch) =>
        set((s) => ({
          events: s.events.map((e) =>
            e.id === eventId ? { ...e, ...patch } : e,
          ),
        })),
      toggleHospitalityIdea: (eventId, ideaId) =>
        set((s) => ({
          events: s.events.map((e) => {
            if (e.id !== eventId) return e;
            const has = e.lovedHospitalityIds.includes(ideaId);
            return {
              ...e,
              lovedHospitalityIds: has
                ? e.lovedHospitalityIds.filter((id) => id !== ideaId)
                : [...e.lovedHospitalityIds, ideaId],
            };
          }),
        })),
      setCustomHospitalityIdeas: (eventId, customHospitalityIdeas) =>
        set((s) => ({
          events: s.events.map((e) =>
            e.id === eventId ? { ...e, customHospitalityIdeas } : e,
          ),
        })),
      setEventGuestFeelBrief: (eventId, guestFeelBrief) =>
        set((s) => ({
          events: s.events.map((e) =>
            e.id === eventId ? { ...e, guestFeelBrief } : e,
          ),
        })),
      setEventBriefText: (eventId, briefText) =>
        set((s) => ({
          events: s.events.map((e) =>
            e.id === eventId ? { ...e, briefText } : e,
          ),
        })),
      setEventBriefAiDraft: (eventId, briefAiDraft) =>
        set((s) => ({
          events: s.events.map((e) =>
            e.id === eventId ? { ...e, briefAiDraft } : e,
          ),
        })),

      // ── Program-level setters ─────────────────────────────────────
      setProgramBrief: (programBrief) =>
        set((s) => ({ coupleContext: { ...s.coupleContext, programBrief } })),
      setProgramBriefAiDraft: (programBriefAiDraft) =>
        set((s) => ({
          coupleContext: { ...s.coupleContext, programBriefAiDraft },
        })),
      setLocationType: (locationType) =>
        set((s) => ({ coupleContext: { ...s.coupleContext, locationType } })),
      setDestinationLocation: (destinationLocation) =>
        set((s) => ({
          coupleContext: { ...s.coupleContext, destinationLocation },
        })),
      setProgramSize: (programSize) =>
        set((s) => ({ coupleContext: { ...s.coupleContext, programSize } })),
      setGuestTiers: (guestTiers) =>
        set((s) => ({ coupleContext: { ...s.coupleContext, guestTiers } })),
      reorderEvents: (nextOrderIds) =>
        set((s) => {
          const byId = new Map(s.events.map((e) => [e.id, e]));
          const reordered: EventRecord[] = [];
          nextOrderIds.forEach((id, i) => {
            const e = byId.get(id);
            if (e) reordered.push({ ...e, sortOrder: i });
          });
          // Preserve any events not referenced in the new order (defensive).
          s.events.forEach((e) => {
            if (!nextOrderIds.includes(e.id)) {
              reordered.push({ ...e, sortOrder: reordered.length });
            }
          });
          return { events: reordered };
        }),
      setProgramDiscoveryComplete: (programDiscoveryComplete) =>
        set((s) => ({
          coupleContext: { ...s.coupleContext, programDiscoveryComplete },
        })),

      // ── Quiz nav ───────────────────────────────────────────────────
      setQuizStepIndex: (stepIndex) =>
        set((s) => ({ quiz: { ...s.quiz, stepIndex } })),
      completeQuiz: () =>
        set((s) => ({
          quiz: {
            ...s.quiz,
            completedAt: new Date().toISOString(),
            // Once true, stays true. The first-run gate watches this flag,
            // not completedAt — so hitting "Start over" later won't re-trap
            // the couple in the full-bleed welcome.
            hasCompletedOnce: true,
          },
        })),
      // Preserves hasCompletedOnce + coachmarkDismissed so "Start over"
      // from the dashboard doesn't re-gate the app or re-fire the coachmark.
      resetQuiz: () =>
        set((s) => ({
          coupleContext: DEFAULT_COUPLE_CONTEXT,
          events: DEFAULT_EVENTS,
          suggestions: [],
          cascadeNotifications: [],
          quiz: {
            ...DEFAULT_QUIZ_STATE,
            hasCompletedOnce: s.quiz.hasCompletedOnce,
            hasStartedBrief: s.quiz.hasCompletedOnce,
            coachmarkDismissed: s.quiz.coachmarkDismissed,
          },
        })),
      startBrief: () =>
        set((s) => ({ quiz: { ...s.quiz, hasStartedBrief: true } })),
      dismissCoachmark: () =>
        set((s) => ({ quiz: { ...s.quiz, coachmarkDismissed: true } })),

      // ── Cascade notifications ─────────────────────────────────────
      acknowledgeCascade: (id, consumer) =>
        set((s) => ({
          cascadeNotifications: s.cascadeNotifications.map((n) =>
            n.id === id && !n.acknowledgedBy.includes(consumer)
              ? { ...n, acknowledgedBy: [...n.acknowledgedBy, consumer] }
              : n,
          ),
        })),
      unreadCascades: (consumer, kinds) => {
        const all = get().cascadeNotifications;
        return all.filter(
          (n) =>
            !n.acknowledgedBy.includes(consumer) &&
            (!kinds || kinds.includes(n.kind)),
        );
      },

      // ── AI suggestions ─────────────────────────────────────────────
      addSuggestion: ({ scope, eventId, suggestion }) => {
        const id = uid();
        set((s) => ({
          suggestions: [
            ...s.suggestions,
            {
              id,
              scope,
              eventId: eventId ?? null,
              suggestion,
              status: "pending",
              refinementPrompt: null,
              generatedAt: new Date().toISOString(),
            },
          ],
        }));
        return id;
      },
      updateSuggestion: (id, patch) =>
        set((s) => ({
          suggestions: s.suggestions.map((sg) =>
            sg.id === id
              ? {
                  ...sg,
                  status: patch.status ?? sg.status,
                  refinementPrompt:
                    patch.refinementPrompt !== undefined
                      ? patch.refinementPrompt
                      : sg.refinementPrompt,
                }
              : sg,
          ),
        })),
      suggestionsFor: (scope, eventId) =>
        get()
          .suggestions.filter(
            (s) =>
              s.scope === scope &&
              (eventId === undefined || s.eventId === (eventId ?? null)),
          )
          .sort(
            (a, b) =>
              new Date(b.generatedAt).getTime() -
              new Date(a.generatedAt).getTime(),
          ),
    }),
    {
      name: "ananya:events",
      version: 9,
      storage: createJSONStorage(() => {
        if (typeof window === "undefined") {
          return { getItem: () => null, setItem: () => undefined, removeItem: () => undefined };
        }
        return window.localStorage;
      }),
      partialize: (state) => ({
        coupleContext: state.coupleContext,
        events: state.events,
        suggestions: state.suggestions,
        quiz: state.quiz,
        cascadeNotifications: state.cascadeNotifications,
      }),
      // v1 → v2: Q6 free-text + per-event favorite/vibe columns.
      // v2 → v3: v4 quiz — per-event AI name options, custom name/theme,
      // per-event custom palette / locks / rename. Clamp stale stepIndex
      // since step count changed from 6 → 5.
      // v3 → v4: brief repositioning — hasCompletedOnce / hasStartedBrief /
      // coachmarkDismissed on quiz, plus cascadeNotifications slice.
      // v4 → v5: per-event favoritedAttireIds added for the Attire band.
      migrate: (persisted: unknown, version) => {
        const p = persisted as {
          coupleContext?: Partial<CoupleContext>;
          events?: Partial<EventRecord>[];
          quiz?: Partial<EventsQuizState>;
          cascadeNotifications?: CascadeNotification[];
        } | null;
        if (!p) return p as unknown;
        if (version < 2) {
          if (p.coupleContext) {
            p.coupleContext = {
              nonNegotiable: "",
              dontCare: "",
              ...p.coupleContext,
            };
          }
          if (Array.isArray(p.events)) {
            p.events = p.events.map((e) => ({
              favoritedImageIds: [],
              vibeLabel: null,
              vibeEventName: null,
              vibeTheme: null,
              ...e,
            }));
          }
        }
        if (version < 3) {
          if (Array.isArray(p.events)) {
            p.events = p.events.map((e) => ({
              aiNameOptions: null,
              selectedNameOptionIndex: null,
              customEventName: null,
              customTheme: null,
              customPalette: null,
              paletteLockedPositions: [],
              paletteCustomName: null,
              ...e,
            }));
          }
          if (p.quiz && typeof p.quiz.stepIndex === "number") {
            // v4 has 5 steps (indices 0..4). Clamp any stale index from
            // the old 6-step flow — priorities moved from 5 → 4.
            p.quiz.stepIndex = Math.min(p.quiz.stepIndex, 4);
          }
        }
        if (version < 4) {
          // Anyone who already finished the quiz before this migration
          // ran has earned their way past the first-run gate — infer
          // hasCompletedOnce + hasStartedBrief from completedAt so they
          // don't get re-trapped in the welcome screen.
          const alreadyComplete = Boolean(p.quiz?.completedAt);
          p.quiz = {
            hasCompletedOnce: alreadyComplete,
            hasStartedBrief: alreadyComplete,
            coachmarkDismissed: alreadyComplete,
            ...p.quiz,
          } as Partial<EventsQuizState>;
          if (!Array.isArray(p.cascadeNotifications)) {
            p.cascadeNotifications = [];
          }
        }
        if (version < 5) {
          // Attire inspiration band added under Q4's mood grid. Existing
          // events predate the field — default to [] so toggle reads work.
          if (Array.isArray(p.events)) {
            p.events = p.events.map((e) => ({
              favoritedAttireIds: [],
              ...e,
            }));
          }
        }
        if (version < 6) {
          // Heal stores where earlier migrations left favoritedImageIds or
          // favoritedAttireIds as undefined on some events.
          if (Array.isArray(p.events)) {
            p.events = p.events.map((e) => ({
              ...e,
              favoritedImageIds: Array.isArray(e.favoritedImageIds)
                ? e.favoritedImageIds
                : [],
              favoritedAttireIds: Array.isArray(e.favoritedAttireIds)
                ? e.favoritedAttireIds
                : [],
            }));
          }
        }
        if (version < 7) {
          // Events workspace migration: 5-question wizard answers get
          // re-homed onto per-event fields (overviewIntro, vibeIntro,
          // attireIntro, etc.) so the new tabbed workspace has content to
          // show. The wizard's storyText + nonNegotiable + dontCare stay
          // on coupleContext — they're whole-wedding, not per-event.
          if (Array.isArray(p.events)) {
            p.events = p.events.map((e) => ({
              eventDate: null,
              venueName: null,
              overviewIntro: e.customTheme ?? e.vibeTheme ?? "",
              vibeIntro: "",
              attireIntro: "",
              vibeKeywords: [],
              vibeWants: [],
              vibeAvoids: [],
              attireWants: [],
              attireAvoids: [],
              pinterestBoardUrl: null,
              dressCode: "",
              formality: null,
              culturalNotes: "",
              ...e,
            }));
          }
        }
        if (version < 8) {
          // Discovery-first rebuild — Program Discovery + new event tab
          // fields. Seed with neutral defaults so existing data keeps
          // reading cleanly.
          if (p.coupleContext) {
            p.coupleContext = {
              programBrief: "",
              programBriefAiDraft: "",
              locationType: null,
              destinationLocation: "",
              programSize: null,
              guestTiers: [
                { id: "everyone", name: "Everyone", description: "The full guest list" },
                { id: "close_family_friends", name: "Close family & friends", description: "Inner circle — the people who'd be at every event" },
                { id: "immediate_family", name: "Immediate family only", description: "Parents, siblings, grandparents" },
                { id: "custom_group", name: "Custom group", description: "Define your own — bridesmaids, destination travelers, etc." },
              ],
              programDiscoveryComplete: Boolean((p.quiz as Partial<EventsQuizState> | undefined)?.hasCompletedOnce),
              ...p.coupleContext,
            };
          }
          if (Array.isArray(p.events)) {
            // Repair defaults: we previously shipped v7 without these keys,
            // and a stale in-flight session might persist them as
            // `undefined`. Use an explicit per-key coalesce so existing
            // values win only when they're actually defined.
            p.events = p.events.map((e) => {
              const ev = e as Partial<EventRecord>;
              return {
                ...ev,
                energyLevel: ev.energyLevel ?? 50,
                guestTier: ev.guestTier ?? null,
                paletteInherits:
                  typeof ev.paletteInherits === "boolean"
                    ? ev.paletteInherits
                    : true,
                vibeQuizAnswers: ev.vibeQuizAnswers ?? {},
                attireQuizAnswers: ev.attireQuizAnswers ?? {},
                movieReference: ev.movieReference ?? "",
                attireColorGuidance: ev.attireColorGuidance ?? null,
                attireCulturalExpectation: ev.attireCulturalExpectation ?? null,
                attireCoordinationLevel: ev.attireCoordinationLevel ?? null,
                attireKeywords: Array.isArray(ev.attireKeywords)
                  ? ev.attireKeywords
                  : [],
                brideLookDirection: ev.brideLookDirection ?? "",
                groomLookDirection: ev.groomLookDirection ?? "",
                guestAttireCardText: ev.guestAttireCardText ?? "",
                arrivalFeel: ev.arrivalFeel ?? "",
                peakMoment: ev.peakMoment ?? "",
                departureFeel: ev.departureFeel ?? "",
                sensorySmell: ev.sensorySmell ?? "",
                sensorySound: ev.sensorySound ?? "",
                sensoryLighting: ev.sensoryLighting ?? "",
                sensoryTemperature: ev.sensoryTemperature ?? "",
                lovedHospitalityIds: Array.isArray(ev.lovedHospitalityIds)
                  ? ev.lovedHospitalityIds
                  : [],
                customHospitalityIdeas: Array.isArray(
                  ev.customHospitalityIdeas,
                )
                  ? ev.customHospitalityIdeas
                  : [],
                guestFeelBrief: ev.guestFeelBrief ?? "",
                briefText: ev.briefText ?? "",
                briefAiDraft: ev.briefAiDraft ?? "",
              } as Partial<EventRecord>;
            });
          }
        }
        // v8 → v9: open app gates — mark all existing sessions as having
        // completed onboarding so the FirstRunGate never blocks app routes.
        if (version < 9) {
          if (p.quiz) {
            p.quiz.hasCompletedOnce = true;
            p.quiz.hasStartedBrief = true;
          }
        }

        return p as unknown;
      },
    },
  ),
);

export async function loadEventsFromDB() {
  const coupleId = getCurrentCoupleId();
  if (!coupleId) return;
  const blob = await dbLoadBlob<{
    couple_context: unknown; events: unknown; suggestions: unknown;
    quiz: unknown; cascade_notifications: unknown;
  }>("events_state", coupleId);
  if (!blob) return;
  useEventsStore.setState((s) => ({
    coupleContext: (blob.couple_context as never) ?? s.coupleContext,
    events: (blob.events as never) ?? s.events,
    suggestions: (blob.suggestions as never) ?? s.suggestions,
    quiz: (blob.quiz as never) ?? s.quiz,
    cascadeNotifications: (blob.cascade_notifications as never) ?? s.cascadeNotifications,
  }));
}

let _eventsSyncTimer: ReturnType<typeof setTimeout> | null = null;
useEventsStore.subscribe((state) => {
  if (_eventsSyncTimer) clearTimeout(_eventsSyncTimer);
  _eventsSyncTimer = setTimeout(() => {
    const coupleId = getCurrentCoupleId();
    if (!coupleId) return;
    const { coupleContext, events, suggestions, quiz, cascadeNotifications } = state;
    dbUpsert("events_state", { couple_id: coupleId, couple_context: coupleContext, events, suggestions, quiz, cascade_notifications: cascadeNotifications });
  }, 600);
});
