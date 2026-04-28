// ── Bachelor store ─────────────────────────────────────────────────────────
// Zustand + persist for the Bachelor module. Single-wedding scoping — no
// weddingId key. Everything the six tabs read and write lives here.

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { dbUpsert, getCurrentCoupleId } from "@/lib/supabase/db-sync";
import type {
  BachelorDocument,
  BachelorState,
  BudgetSettings,
  CelebrationStyle,
  DocumentCategory,
  DressCode,
  Expense,
  ExpenseSplit,
  GroomPreferences,
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
} from "@/types/bachelor";

function uid(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

interface BachelorActions {
  updateBasics: (patch: Partial<PartyBasics>) => void;
  addOrganizer: (name: string, role?: string) => void;
  updateOrganizer: (id: string, patch: Partial<Organizer>) => void;
  removeOrganizer: (id: string) => void;
  setSurpriseMode: (on: boolean) => void;
  setStyle: (style: CelebrationStyle | null) => void;

  setVibeProfile: (patch: Partial<VibeProfile>) => void;
  resetVibeProfile: () => void;

  updateVibe: (patch: Partial<VibeSettings>) => void;
  addDressCode: (eventLabel: string, description: string) => void;
  updateDressCode: (id: string, patch: Partial<DressCode>) => void;
  removeDressCode: (id: string) => void;
  setColorScheme: (colors: string[]) => void;

  addMoodboardPin: (
    imageUrl: string,
    category: MoodboardCategory,
    note?: string,
  ) => void;
  updateMoodboardPin: (id: string, patch: Partial<MoodboardPin>) => void;
  removeMoodboardPin: (id: string) => void;

  addGroomPref: (kind: keyof GroomPreferences, text: string) => void;
  removeGroomPref: (kind: keyof GroomPreferences, index: number) => void;

  addGuest: (name: string, role: string) => void;
  updateGuest: (id: string, patch: Partial<Guest>) => void;
  removeGuest: (id: string) => void;
  setGuestRsvp: (id: string, rsvp: RsvpStatus) => void;
  assignGuestToRoom: (id: string, roomId: string | null) => void;

  addRoom: (label?: string, capacity?: number) => void;
  updateRoom: (id: string, patch: Partial<Room>) => void;
  removeRoom: (id: string) => void;

  addDay: (date: string, label: string) => void;
  updateDay: (id: string, patch: Partial<ItineraryDay>) => void;
  removeDay: (id: string) => void;
  addEvent: (dayId: string, event: Partial<ItineraryEvent>) => void;
  updateEvent: (id: string, patch: Partial<ItineraryEvent>) => void;
  removeEvent: (id: string) => void;
  toggleEventConfirmed: (id: string) => void;

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

  addDocument: (
    label: string,
    category: DocumentCategory,
    url?: string,
    notes?: string,
  ) => void;
  updateDocument: (id: string, patch: Partial<BachelorDocument>) => void;
  removeDocument: (id: string) => void;

  reset: () => Promise<void>;
  ensureSeeded: () => Promise<void>;
}

export const useBachelorStore = create<BachelorState & BachelorActions>()(
  persist(
    (set) => ({
      basics: {
        groomName: "", organizers: [], dateRange: "", location: "", style: null,
        guestCount: 0, surpriseMode: false,
      } as BachelorState["basics"],
      vibe: { theme: null, customTheme: "", colorScheme: [], dressCodes: [] } as BachelorState["vibe"],
      vibeProfile: {
        energy: null, crew: null, duration: null, budgetTier: null, travelMode: null,
        originAirports: "", groomInterests: [], avoidTags: [], month: null, updatedAt: null,
      } as BachelorState["vibeProfile"],
      moodboard: [] as BachelorState["moodboard"],
      groomPrefs: { loves: [], avoid: [], dietary: [] } as BachelorState["groomPrefs"],
      guests: [] as BachelorState["guests"],
      rooms: [] as BachelorState["rooms"],
      days: [] as BachelorState["days"],
      events: [] as BachelorState["events"],
      expenses: [] as BachelorState["expenses"],
      payments: {} as BachelorState["payments"],
      organizerNotes: [] as BachelorState["organizerNotes"],
      budget: { splittingRule: "equal", groomPaysShare: false } as BachelorState["budget"],
      documents: [] as BachelorState["documents"],

      ensureSeeded: async () => {
        const { DEFAULT_BACHELOR } = await import("@/lib/bachelor-seed");
        set((s) => {
          if (s.guests.length > 0 || s.days.length > 0) return s;
          return { ...DEFAULT_BACHELOR };
        });
      },

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
            originAirports: "", groomInterests: [], avoidTags: [], month: null, updatedAt: null,
          },
        })),

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

      addGroomPref: (kind, text) =>
        set((s) => ({
          groomPrefs: {
            ...s.groomPrefs,
            [kind]: [...s.groomPrefs[kind], text],
          },
        })),
      removeGroomPref: (kind, index) =>
        set((s) => ({
          groomPrefs: {
            ...s.groomPrefs,
            [kind]: s.groomPrefs[kind].filter((_, i) => i !== index),
          },
        })),

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
          guests: s.guests.map((g) => (g.id === id ? { ...g, ...patch } : g)),
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
          events: s.events.map((e) => (e.id === id ? { ...e, ...patch } : e)),
        })),
      removeEvent: (id) =>
        set((s) => ({ events: s.events.filter((e) => e.id !== id) })),
      toggleEventConfirmed: (id) =>
        set((s) => ({
          events: s.events.map((e) =>
            e.id === id ? { ...e, confirmed: !e.confirmed } : e,
          ),
        })),

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
        const { DEFAULT_BACHELOR } = await import("@/lib/bachelor-seed");
        set(() => ({ ...DEFAULT_BACHELOR }));
      },
    }),
    {
      name: "ananya:bachelor",
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

let _bachelorSyncTimer: ReturnType<typeof setTimeout> | null = null;
useBachelorStore.subscribe((state) => {
  if (_bachelorSyncTimer) clearTimeout(_bachelorSyncTimer);
  _bachelorSyncTimer = setTimeout(() => {
    const coupleId = getCurrentCoupleId();
    if (!coupleId) return;
    const { basics, vibe, organizers, guests, itinerary, budget, documents, rooms, expenses, vibeProfile } = state as unknown as Record<string, unknown>;
    dbUpsert("bachelor_state", { couple_id: coupleId, basics, vibe, organizers, guests, itinerary, budget, documents, rooms, expenses, vibe_profile: vibeProfile });
  }, 600);
});
