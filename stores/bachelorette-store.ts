// ── Bachelorette store ─────────────────────────────────────────────────────
// Zustand + persist for the Bachelorette module. Single-wedding scoping
// (same convention as events-store and workspace-store) — no weddingId key.
// Everything the five tabs read and write lives here.

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { dbUpsert, getCurrentCoupleId } from "@/lib/supabase/db-sync";
import type {
  BacheloretteDocument,
  BacheloretteState,
  BridePreferences,
  BudgetSettings,
  CelebrationStyle,
  DetailItineraryDay,
  DocumentCategory,
  DressCode,
  Expense,
  ExpenseSplit,
  Guest,
  GuestPayment,
  ItineraryDay,
  ItineraryEvent,
  MoodboardCategory,
  MoodboardPin,
  Organizer,
  OrganizerNote,
  PartyBasics,
  PaymentStatus,
  Room,
  RsvpStatus,
  SplittingRule,
  VibeProfile,
  VibeSettings,
} from "@/types/bachelorette";

function uid(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

interface BacheloretteActions {
  // Basics
  updateBasics: (patch: Partial<PartyBasics>) => void;
  addOrganizer: (name: string, role?: string) => void;
  updateOrganizer: (id: string, patch: Partial<Organizer>) => void;
  removeOrganizer: (id: string) => void;
  setSurpriseMode: (on: boolean) => void;
  setStyle: (style: CelebrationStyle | null) => void;

  // Vibe profile (discovery quiz)
  setVibeProfile: (patch: Partial<VibeProfile>) => void;
  resetVibeProfile: () => void;

  // Discovery → plan handoff. Replaces days+events with the selected
  // destination's sample itinerary and sets basics.location.
  applyDestinationPlan: (payload: {
    destinationName: string;
    itinerary: DetailItineraryDay[];
  }) => void;

  // Vibe
  updateVibe: (patch: Partial<VibeSettings>) => void;
  addDressCode: (eventLabel: string, description: string) => void;
  updateDressCode: (id: string, patch: Partial<DressCode>) => void;
  removeDressCode: (id: string) => void;
  setColorScheme: (colors: string[]) => void;

  // Moodboard
  addMoodboardPin: (
    imageUrl: string,
    category: MoodboardCategory,
    note?: string,
  ) => void;
  updateMoodboardPin: (id: string, patch: Partial<MoodboardPin>) => void;
  removeMoodboardPin: (id: string) => void;

  // Bride prefs
  addBridePref: (kind: keyof BridePreferences, text: string) => void;
  removeBridePref: (kind: keyof BridePreferences, index: number) => void;

  // Guests
  addGuest: (name: string, role: string) => void;
  updateGuest: (id: string, patch: Partial<Guest>) => void;
  removeGuest: (id: string) => void;
  setGuestRsvp: (id: string, rsvp: RsvpStatus) => void;
  assignGuestToRoom: (id: string, roomId: string | null) => void;

  // Rooms
  addRoom: (label?: string, capacity?: number) => void;
  updateRoom: (id: string, patch: Partial<Room>) => void;
  removeRoom: (id: string) => void;

  // Itinerary
  addDay: (date: string, label: string) => void;
  updateDay: (id: string, patch: Partial<ItineraryDay>) => void;
  removeDay: (id: string) => void;
  addEvent: (dayId: string, event: Partial<ItineraryEvent>) => void;
  updateEvent: (id: string, patch: Partial<ItineraryEvent>) => void;
  removeEvent: (id: string) => void;
  toggleEventConfirmed: (id: string) => void;

  // Budget
  addExpense: (
    label: string,
    amountCents: number,
    split: ExpenseSplit,
    extras?: { paidByGuestId?: string | null; meta?: Record<string, unknown> },
  ) => void;
  updateExpense: (id: string, patch: Partial<Expense>) => void;
  removeExpense: (id: string) => void;
  setSplittingRule: (rule: SplittingRule) => void;
  updateBudget: (patch: Partial<BudgetSettings>) => void;
  recordPayment: (guestId: string, paidCents: number) => void;
  setPaymentStatus: (guestId: string, status: PaymentStatus) => void;
  addOrganizerNote: (body: string) => void;
  updateOrganizerNote: (id: string, body: string) => void;
  removeOrganizerNote: (id: string) => void;

  // Documents
  addDocument: (
    label: string,
    category: DocumentCategory,
    url?: string,
    notes?: string,
  ) => void;
  updateDocument: (id: string, patch: Partial<BacheloretteDocument>) => void;
  removeDocument: (id: string) => void;

  reset: () => Promise<void>;
  ensureSeeded: () => Promise<void>;
}

export const useBacheloretteStore = create<
  BacheloretteState & BacheloretteActions
>()(
  persist(
    (set) => ({
      basics: {
        brideName: "", organizers: [], dateRange: "", location: "", style: null,
        guestCount: 0, surpriseMode: false,
      } as BacheloretteState["basics"],
      vibe: { theme: null, customTheme: "", colorScheme: [], dressCodes: [] } as BacheloretteState["vibe"],
      vibeProfile: {
        energy: null, crew: null, duration: null, budgetTier: null, travelMode: null,
        originAirports: "", avoidTags: [], month: null, updatedAt: null,
      } as BacheloretteState["vibeProfile"],
      moodboard: [] as BacheloretteState["moodboard"],
      bridePrefs: { loves: [], avoid: [], dietary: [] } as BacheloretteState["bridePrefs"],
      guests: [] as BacheloretteState["guests"],
      rooms: [] as BacheloretteState["rooms"],
      days: [] as BacheloretteState["days"],
      events: [] as BacheloretteState["events"],
      expenses: [] as BacheloretteState["expenses"],
      payments: {} as BacheloretteState["payments"],
      organizerNotes: [] as BacheloretteState["organizerNotes"],
      budget: { splittingRule: "equal", bridePaysShare: false } as BacheloretteState["budget"],
      documents: [] as BacheloretteState["documents"],

      ensureSeeded: async () => {
        const { DEFAULT_BACHELORETTE } = await import("@/lib/bachelorette-seed");
        set((s) => {
          if (s.guests.length > 0 || s.days.length > 0) return s;
          return { ...DEFAULT_BACHELORETTE };
        });
      },

      // ── Basics ─────────────────────────────────────────────────────────
      updateBasics: (patch) =>
        set((s) => ({ basics: { ...s.basics, ...patch } })),
      addOrganizer: (name, role) =>
        set((s) => ({
          basics: {
            ...s.basics,
            organizers: [
              ...s.basics.organizers,
              { id: uid("org"), name, role },
            ],
          },
        })),
      updateOrganizer: (id, patch) =>
        set((s) => ({
          basics: {
            ...s.basics,
            organizers: s.basics.organizers.map((o) =>
              o.id === id ? { ...o, ...patch } : o,
            ),
          },
        })),
      removeOrganizer: (id) =>
        set((s) => ({
          basics: {
            ...s.basics,
            organizers: s.basics.organizers.filter((o) => o.id !== id),
          },
        })),
      setSurpriseMode: (on) =>
        set((s) => ({ basics: { ...s.basics, surpriseMode: on } })),
      setStyle: (style) => set((s) => ({ basics: { ...s.basics, style } })),

      // ── Vibe profile (discovery quiz) ──────────────────────────────────
      setVibeProfile: (patch) =>
        set((s) => ({
          vibeProfile: {
            ...s.vibeProfile,
            ...patch,
            updatedAt: nowIso(),
          },
        })),
      resetVibeProfile: () =>
        set(() => ({
          vibeProfile: {
            energy: null, crew: null, duration: null, budgetTier: null, travelMode: null,
            originAirports: "", avoidTags: [], month: null, updatedAt: null,
          },
        })),

      applyDestinationPlan: ({ destinationName, itinerary }) =>
        set((s) => {
          const nextDays: ItineraryDay[] = [];
          const nextEvents: ItineraryEvent[] = [];
          itinerary.forEach((day, index) => {
            const dayId = uid("day");
            nextDays.push({
              id: dayId,
              date: `Day ${index + 1}`,
              label: day.label,
            });
            day.beats.forEach((beat) => {
              nextEvents.push({
                id: uid("ev"),
                dayId,
                time: beat.time,
                activity: beat.title,
                notes: beat.body,
                reservation: beat.reservationNote,
                confirmed: false,
              });
            });
          });
          return {
            basics: { ...s.basics, location: destinationName },
            days: nextDays,
            events: nextEvents,
          };
        }),

      // ── Vibe ───────────────────────────────────────────────────────────
      updateVibe: (patch) => set((s) => ({ vibe: { ...s.vibe, ...patch } })),
      addDressCode: (eventLabel, description) =>
        set((s) => ({
          vibe: {
            ...s.vibe,
            dressCodes: [
              ...s.vibe.dressCodes,
              { id: uid("dc"), eventLabel, description },
            ],
          },
        })),
      updateDressCode: (id, patch) =>
        set((s) => ({
          vibe: {
            ...s.vibe,
            dressCodes: s.vibe.dressCodes.map((d) =>
              d.id === id ? { ...d, ...patch } : d,
            ),
          },
        })),
      removeDressCode: (id) =>
        set((s) => ({
          vibe: {
            ...s.vibe,
            dressCodes: s.vibe.dressCodes.filter((d) => d.id !== id),
          },
        })),
      setColorScheme: (colors) =>
        set((s) => ({ vibe: { ...s.vibe, colorScheme: colors } })),

      // ── Moodboard ──────────────────────────────────────────────────────
      addMoodboardPin: (imageUrl, category, note) =>
        set((s) => ({
          moodboard: [
            ...s.moodboard,
            { id: uid("mb"), imageUrl, category, note },
          ],
        })),
      updateMoodboardPin: (id, patch) =>
        set((s) => ({
          moodboard: s.moodboard.map((p) =>
            p.id === id ? { ...p, ...patch } : p,
          ),
        })),
      removeMoodboardPin: (id) =>
        set((s) => ({ moodboard: s.moodboard.filter((p) => p.id !== id) })),

      // ── Bride prefs ────────────────────────────────────────────────────
      addBridePref: (kind, text) =>
        set((s) => ({
          bridePrefs: {
            ...s.bridePrefs,
            [kind]: [...s.bridePrefs[kind], text],
          },
        })),
      removeBridePref: (kind, index) =>
        set((s) => ({
          bridePrefs: {
            ...s.bridePrefs,
            [kind]: s.bridePrefs[kind].filter((_, i) => i !== index),
          },
        })),

      // ── Guests ─────────────────────────────────────────────────────────
      addGuest: (name, role) =>
        set((s) => ({
          guests: [
            ...s.guests,
            {
              id: uid("g"),
              name,
              role,
              rsvp: "pending",
              roomId: null,
            },
          ],
        })),
      updateGuest: (id, patch) =>
        set((s) => ({
          guests: s.guests.map((g) =>
            g.id === id ? { ...g, ...patch } : g,
          ),
        })),
      removeGuest: (id) =>
        set((s) => {
          const { [id]: _dropped, ...rest } = s.payments;
          return {
            guests: s.guests.filter((g) => g.id !== id),
            payments: rest,
          };
        }),
      setGuestRsvp: (id, rsvp) =>
        set((s) => ({
          guests: s.guests.map((g) => (g.id === id ? { ...g, rsvp } : g)),
        })),
      assignGuestToRoom: (id, roomId) =>
        set((s) => ({
          guests: s.guests.map((g) => (g.id === id ? { ...g, roomId } : g)),
        })),

      // ── Rooms ──────────────────────────────────────────────────────────
      addRoom: (label, capacity = 2) =>
        set((s) => ({
          rooms: [
            ...s.rooms,
            {
              id: uid("room"),
              label: label ?? `Room ${s.rooms.length + 1}`,
              capacity,
            },
          ],
        })),
      updateRoom: (id, patch) =>
        set((s) => ({
          rooms: s.rooms.map((r) => (r.id === id ? { ...r, ...patch } : r)),
        })),
      removeRoom: (id) =>
        set((s) => ({
          rooms: s.rooms.filter((r) => r.id !== id),
          guests: s.guests.map((g) =>
            g.roomId === id ? { ...g, roomId: null } : g,
          ),
        })),

      // ── Itinerary ──────────────────────────────────────────────────────
      addDay: (date, label) =>
        set((s) => ({
          days: [...s.days, { id: uid("day"), date, label }],
        })),
      updateDay: (id, patch) =>
        set((s) => ({
          days: s.days.map((d) => (d.id === id ? { ...d, ...patch } : d)),
        })),
      removeDay: (id) =>
        set((s) => ({
          days: s.days.filter((d) => d.id !== id),
          events: s.events.filter((e) => e.dayId !== id),
        })),
      addEvent: (dayId, event) =>
        set((s) => ({
          events: [
            ...s.events,
            {
              id: uid("ev"),
              dayId,
              time: event.time ?? "",
              activity: event.activity ?? "New event",
              location: event.location,
              dressCode: event.dressCode,
              reservation: event.reservation,
              notes: event.notes,
              confirmed: event.confirmed ?? false,
              optional: event.optional,
            },
          ],
        })),
      updateEvent: (id, patch) =>
        set((s) => ({
          events: s.events.map((e) =>
            e.id === id ? { ...e, ...patch } : e,
          ),
        })),
      removeEvent: (id) =>
        set((s) => ({ events: s.events.filter((e) => e.id !== id) })),
      toggleEventConfirmed: (id) =>
        set((s) => ({
          events: s.events.map((e) =>
            e.id === id ? { ...e, confirmed: !e.confirmed } : e,
          ),
        })),

      // ── Budget ─────────────────────────────────────────────────────────
      addExpense: (label, amountCents, split, extras) =>
        set((s) => ({
          expenses: [
            ...s.expenses,
            {
              id: uid("exp"),
              label,
              amountCents,
              split,
              paidByGuestId: extras?.paidByGuestId ?? null,
              meta: extras?.meta,
            },
          ],
        })),
      updateExpense: (id, patch) =>
        set((s) => ({
          expenses: s.expenses.map((e) =>
            e.id === id ? { ...e, ...patch } : e,
          ),
        })),
      removeExpense: (id) =>
        set((s) => ({ expenses: s.expenses.filter((e) => e.id !== id) })),
      setSplittingRule: (rule) =>
        set((s) => ({ budget: { ...s.budget, splittingRule: rule } })),
      updateBudget: (patch) =>
        set((s) => ({ budget: { ...s.budget, ...patch } })),
      recordPayment: (guestId, paidCents) =>
        set((s) => {
          const existing: GuestPayment = s.payments[guestId] ?? {
            guestId,
            paidCents: 0,
            status: "unpaid",
          };
          const nextPaid = Math.max(0, paidCents);
          const status: PaymentStatus =
            nextPaid <= 0 ? "unpaid" : "partial";
          return {
            payments: {
              ...s.payments,
              [guestId]: {
                ...existing,
                paidCents: nextPaid,
                status:
                  existing.status === "paid" && nextPaid > 0
                    ? "paid"
                    : status,
              },
            },
          };
        }),
      setPaymentStatus: (guestId, status) =>
        set((s) => {
          const existing: GuestPayment = s.payments[guestId] ?? {
            guestId,
            paidCents: 0,
            status,
          };
          return {
            payments: { ...s.payments, [guestId]: { ...existing, status } },
          };
        }),
      addOrganizerNote: (body) =>
        set((s) => ({
          organizerNotes: [
            ...s.organizerNotes,
            { id: uid("note"), createdAt: nowIso(), body },
          ],
        })),
      updateOrganizerNote: (id, body) =>
        set((s) => ({
          organizerNotes: s.organizerNotes.map((n) =>
            n.id === id ? { ...n, body } : n,
          ),
        })),
      removeOrganizerNote: (id) =>
        set((s) => ({
          organizerNotes: s.organizerNotes.filter((n) => n.id !== id),
        })),

      // ── Documents ──────────────────────────────────────────────────────
      addDocument: (label, category, url, notes) =>
        set((s) => ({
          documents: [
            ...s.documents,
            {
              id: uid("doc"),
              label,
              category,
              url,
              notes,
              addedAt: nowIso(),
            },
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
        const { DEFAULT_BACHELORETTE } = await import("@/lib/bachelorette-seed");
        set(() => ({ ...DEFAULT_BACHELORETTE }));
      },
    }),
    {
      name: "ananya:bachelorette",
      version: 2,
      migrate: (persisted, version) => {
        const state = (persisted ?? {}) as Partial<BacheloretteState>;
        if (version < 2 && !state.vibeProfile) {
          return {
            ...state,
            vibeProfile: {
              energy: null, crew: null, duration: null, budgetTier: null, travelMode: null,
              originAirports: "", avoidTags: [], month: null, updatedAt: null,
            },
          };
        }
        return state;
      },
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

let _bacheloretteSyncTimer: ReturnType<typeof setTimeout> | null = null;
useBacheloretteStore.subscribe((state) => {
  if (_bacheloretteSyncTimer) clearTimeout(_bacheloretteSyncTimer);
  _bacheloretteSyncTimer = setTimeout(() => {
    const coupleId = getCurrentCoupleId();
    if (!coupleId) return;
    const { basics, vibe, organizers, guests, itinerary, budget, documents, rooms, expenses, vibeProfile } = state as unknown as Record<string, unknown>;
    dbUpsert("bachelorette_state", { couple_id: coupleId, basics, vibe, organizers, guests, itinerary, budget, documents, rooms, expenses, vibe_profile: vibeProfile });
  }, 600);
});
