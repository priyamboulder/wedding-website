// ── Welcome Events store ───────────────────────────────────────────────────
// Zustand + persist for the Welcome Events module. Single-wedding scoping
// (same convention as bachelorette-store and events-store). All five tabs
// read and write through this store.

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { dbUpsert, getCurrentCoupleId } from "@/lib/supabase/db-sync";
import type {
  BarStyle,
  CommunicationsState,
  EventBasics,
  InviteScope,
  MenuItem,
  MessageStats,
  RsvpStatus,
  ServiceStyle,
  SetupNeeds,
  VibeSettings,
  WelcomeDocument,
  WelcomeEventsState,
  WelcomeGuest,
} from "@/types/welcome-events";

function uid(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

interface WelcomeEventsActions {
  // Basics + vibe
  updateBasics: (patch: Partial<EventBasics>) => void;
  togglePurpose: (purpose: EventBasics["purposes"][number]) => void;
  updateVibe: (patch: Partial<VibeSettings>) => void;
  toggleActivity: (activity: string) => void;
  addCustomActivity: (text: string) => void;
  removeCustomActivity: (index: number) => void;

  // Guests
  setInviteScope: (scope: InviteScope) => void;
  addGuest: (name: string, group: string) => void;
  updateGuest: (id: string, patch: Partial<WelcomeGuest>) => void;
  removeGuest: (id: string) => void;
  setGuestRsvp: (id: string, rsvp: RsvpStatus) => void;

  // Menu + setup
  setServiceStyle: (style: ServiceStyle) => void;
  addMenuItem: (label: string, source: string) => void;
  updateMenuItem: (id: string, patch: Partial<MenuItem>) => void;
  removeMenuItem: (id: string) => void;
  setBar: (bar: BarStyle) => void;
  toggleSetup: (key: keyof Omit<SetupNeeds, "custom">) => void;
  addCustomSetup: (text: string) => void;
  removeCustomSetup: (index: number) => void;

  // Communications
  updateComms: (patch: Partial<CommunicationsState>) => void;
  updateStats: (patch: Partial<MessageStats>) => void;

  // Documents
  addDocument: (
    label: string,
    category: WelcomeDocument["category"],
    url?: string,
    notes?: string,
  ) => void;
  updateDocument: (id: string, patch: Partial<WelcomeDocument>) => void;
  removeDocument: (id: string) => void;

  reset: () => Promise<void>;
  ensureSeeded: () => Promise<void>;
}

export const useWelcomeEventsStore = create<
  WelcomeEventsState & WelcomeEventsActions
>()(
  persist(
    (set) => ({
      basics: {
        name: "", date: "", timeStart: "", timeEnd: "", location: "",
        guestCount: 0, host: "wedding_couple", purposes: [], customPurpose: "",
      } as WelcomeEventsState["basics"],
      vibe: {
        formality: 50, formalityNote: "", dressCode: "smart_casual",
        activities: [], customActivities: [],
      } as WelcomeEventsState["vibe"],
      inviteScope: "oot_only" as WelcomeEventsState["inviteScope"],
      guests: [] as WelcomeEventsState["guests"],
      serviceStyle: "passed_apps_bar" as WelcomeEventsState["serviceStyle"],
      menu: [] as WelcomeEventsState["menu"],
      bar: "dry" as WelcomeEventsState["bar"],
      setup: {
        soundSystem: false, projector: false, garbaSticks: false,
        nameTags: false, photoDisplay: false, welcomeSignage: false, custom: [],
      } as WelcomeEventsState["setup"],
      comms: {
        channel: "digital", subject: "", body: "",
        stats: { sent: 0, opened: 0, rsvpd: 0 },
      } as WelcomeEventsState["comms"],
      documents: [] as WelcomeEventsState["documents"],

      ensureSeeded: async () => {
        const { DEFAULT_WELCOME_EVENTS } = await import("@/lib/welcome-events-seed");
        set((s) => {
          if (s.guests.length > 0 || s.basics.name) return s;
          return { ...DEFAULT_WELCOME_EVENTS };
        });
      },

      // ── Basics + vibe ──────────────────────────────────────────────────
      updateBasics: (patch) =>
        set((s) => ({ basics: { ...s.basics, ...patch } })),
      togglePurpose: (purpose) =>
        set((s) => {
          const has = s.basics.purposes.includes(purpose);
          return {
            basics: {
              ...s.basics,
              purposes: has
                ? s.basics.purposes.filter((p) => p !== purpose)
                : [...s.basics.purposes, purpose],
            },
          };
        }),
      updateVibe: (patch) => set((s) => ({ vibe: { ...s.vibe, ...patch } })),
      toggleActivity: (activity) =>
        set((s) => {
          const has = s.vibe.activities.includes(activity);
          return {
            vibe: {
              ...s.vibe,
              activities: has
                ? s.vibe.activities.filter((a) => a !== activity)
                : [...s.vibe.activities, activity],
            },
          };
        }),
      addCustomActivity: (text) =>
        set((s) => ({
          vibe: {
            ...s.vibe,
            customActivities: [...s.vibe.customActivities, text],
          },
        })),
      removeCustomActivity: (index) =>
        set((s) => ({
          vibe: {
            ...s.vibe,
            customActivities: s.vibe.customActivities.filter(
              (_, i) => i !== index,
            ),
          },
        })),

      // ── Guests ─────────────────────────────────────────────────────────
      setInviteScope: (inviteScope) => set(() => ({ inviteScope })),
      addGuest: (name, group) =>
        set((s) => ({
          guests: [
            ...s.guests,
            {
              id: uid("wg"),
              name,
              group,
              rsvp: "pending",
              hotel: "",
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

      // ── Menu + setup ───────────────────────────────────────────────────
      setServiceStyle: (serviceStyle) => set(() => ({ serviceStyle })),
      addMenuItem: (label, source) =>
        set((s) => ({
          menu: [...s.menu, { id: uid("m"), label, source }],
        })),
      updateMenuItem: (id, patch) =>
        set((s) => ({
          menu: s.menu.map((m) => (m.id === id ? { ...m, ...patch } : m)),
        })),
      removeMenuItem: (id) =>
        set((s) => ({ menu: s.menu.filter((m) => m.id !== id) })),
      setBar: (bar) => set(() => ({ bar })),
      toggleSetup: (key) =>
        set((s) => ({ setup: { ...s.setup, [key]: !s.setup[key] } })),
      addCustomSetup: (text) =>
        set((s) => ({
          setup: { ...s.setup, custom: [...s.setup.custom, text] },
        })),
      removeCustomSetup: (index) =>
        set((s) => ({
          setup: {
            ...s.setup,
            custom: s.setup.custom.filter((_, i) => i !== index),
          },
        })),

      // ── Communications ─────────────────────────────────────────────────
      updateComms: (patch) => set((s) => ({ comms: { ...s.comms, ...patch } })),
      updateStats: (patch) =>
        set((s) => ({
          comms: { ...s.comms, stats: { ...s.comms.stats, ...patch } },
        })),

      // ── Documents ──────────────────────────────────────────────────────
      addDocument: (label, category, url, notes) =>
        set((s) => ({
          documents: [
            ...s.documents,
            { id: uid("d"), label, category, url, notes, addedAt: nowIso() },
          ],
        })),
      updateDocument: (id, patch) =>
        set((s) => ({
          documents: s.documents.map((d) =>
            d.id === id ? { ...d, ...patch } : d,
          ),
        })),
      removeDocument: (id) =>
        set((s) => ({ documents: s.documents.filter((d) => d.id !== id) })),

      reset: async () => {
        const { DEFAULT_WELCOME_EVENTS } = await import("@/lib/welcome-events-seed");
        set(() => ({ ...DEFAULT_WELCOME_EVENTS }));
      },
    }),
    {
      name: "ananya:welcome-events",
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

let _welcomeEventsSyncTimer: ReturnType<typeof setTimeout> | null = null;
useWelcomeEventsStore.subscribe((state) => {
  if (_welcomeEventsSyncTimer) clearTimeout(_welcomeEventsSyncTimer);
  _welcomeEventsSyncTimer = setTimeout(() => {
    const coupleId = getCurrentCoupleId();
    if (!coupleId) return;
    dbUpsert("welcome_events_state", { couple_id: coupleId, data: state as unknown });
  }, 600);
});
