// ── Honeymoon store ────────────────────────────────────────────────────────
// Zustand + persist for the Honeymoon module. Single-wedding scoping (no
// weddingId key), mirroring bachelorette-store and events-store.

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { dbUpsert, getCurrentCoupleId } from "@/lib/supabase/db-sync";
import type {
  Booking,
  BookingPriorityTier,
  BookingStatus,
  BudgetLine,
  BudgetLineCategory,
  BudgetSettings,
  ChecklistItem,
  Destination,
  DestinationStatus,
  DocumentCategory,
  FundingSource,
  HoneymoonBrief,
  HoneymoonDocument,
  HoneymoonState,
  HoneymoonVibe,
  HoneymoonVibeProfile,
  HoneymoonVision,
  ItineraryDay,
  ItineraryItem,
  MoodboardCategory,
  MoodboardPin,
  PackingSection,
  RegistryFundItem,
} from "@/types/honeymoon";

function uid(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

interface HoneymoonActions {
  // Vision / Brief
  updateVision: (patch: Partial<HoneymoonVision>) => void;
  toggleVibe: (vibe: HoneymoonVibe) => void;
  addDealBreaker: (text: string) => void;
  removeDealBreaker: (index: number) => void;
  updateBrief: (patch: Partial<HoneymoonBrief>) => void;

  // Dream Session profile
  setVibeProfile: (patch: Partial<HoneymoonVibeProfile>) => void;

  // Moodboard
  addMoodboardPin: (
    imageUrl: string,
    category: MoodboardCategory,
    note?: string,
  ) => void;
  removeMoodboardPin: (id: string) => void;

  // Destinations
  addDestination: (name: string) => void;
  updateDestination: (id: string, patch: Partial<Destination>) => void;
  removeDestination: (id: string) => void;
  setDestinationStatus: (id: string, status: DestinationStatus) => void;
  toggleDestinationFavorite: (id: string) => void;
  toggleDestinationComparison: (id: string) => void;
  updateDestinationConsiderations: (
    id: string,
    patch: Partial<Destination["considerations"]>,
  ) => void;

  // Bookings
  addBooking: (label: string, tier?: BookingPriorityTier) => void;
  updateBooking: (id: string, patch: Partial<Booking>) => void;
  removeBooking: (id: string) => void;
  setBookingStatus: (id: string, status: BookingStatus) => void;
  setBookingPriority: (id: string, tier: BookingPriorityTier) => void;

  // Itinerary days / items
  addDay: (date: string, label: string) => void;
  updateDay: (id: string, patch: Partial<ItineraryDay>) => void;
  removeDay: (id: string) => void;
  addItem: (dayId: string, patch: Partial<ItineraryItem>) => void;
  updateItem: (id: string, patch: Partial<ItineraryItem>) => void;
  removeItem: (id: string) => void;
  toggleItemConfirmed: (id: string) => void;

  // Budget
  setTotalBudget: (cents: number) => void;
  addBudgetLine: (
    label: string,
    category: BudgetLineCategory,
    amountCents: number,
  ) => void;
  updateBudgetLine: (id: string, patch: Partial<BudgetLine>) => void;
  removeBudgetLine: (id: string) => void;
  toggleFundingSource: (src: FundingSource) => void;
  updateBudgetSettings: (patch: Partial<BudgetSettings>) => void;

  // Registry
  addRegistryFund: (label: string, goalCents: number) => void;
  updateRegistryFund: (id: string, patch: Partial<RegistryFundItem>) => void;
  removeRegistryFund: (id: string) => void;

  // Checklist
  addChecklistItem: (label: string, section: PackingSection) => void;
  updateChecklistItem: (id: string, patch: Partial<ChecklistItem>) => void;
  removeChecklistItem: (id: string) => void;
  toggleChecklist: (id: string) => void;

  // Documents
  addDocument: (
    label: string,
    category: DocumentCategory,
    url?: string,
    notes?: string,
  ) => void;
  updateDocument: (id: string, patch: Partial<HoneymoonDocument>) => void;
  removeDocument: (id: string) => void;

  reset: () => Promise<void>;
  ensureSeeded: () => Promise<void>;
}

export const useHoneymoonStore = create<
  HoneymoonState & HoneymoonActions
>()(
  persist(
    (set) => ({
      vision: {
        when: null, laterMonth: "", duration: null, vibes: [], climate: null, dealBreakers: [],
      } as HoneymoonState["vision"],
      vibeProfile: {
        vibes: [], duration: null, budgetTier: null, flightTolerance: null,
        timing: null, travelMonth: "", priorityInterests: [], dealbreakers: [], travelExperience: null,
      } as HoneymoonState["vibeProfile"],
      brief: { body: "" } as HoneymoonState["brief"],
      moodboard: [] as HoneymoonState["moodboard"],
      destinations: [] as HoneymoonState["destinations"],
      bookings: [] as HoneymoonState["bookings"],
      days: [] as HoneymoonState["days"],
      items: [] as HoneymoonState["items"],
      budgetLines: [] as HoneymoonState["budgetLines"],
      budget: {
        totalBudgetCents: 0, fundingSources: [], registryConnected: false, registryShareUrl: "",
      } as HoneymoonState["budget"],
      registryFundItems: [] as HoneymoonState["registryFundItems"],
      checklist: [] as HoneymoonState["checklist"],
      documents: [] as HoneymoonState["documents"],

      ensureSeeded: async () => {
        const { DEFAULT_HONEYMOON } = await import("@/lib/honeymoon-seed");
        set((s) => {
          if (s.destinations.length > 0 || s.bookings.length > 0) return s;
          return { ...DEFAULT_HONEYMOON };
        });
      },

      // ── Vision / Brief ────────────────────────────────────────────────
      updateVision: (patch) =>
        set((s) => ({ vision: { ...s.vision, ...patch } })),
      toggleVibe: (vibe) =>
        set((s) => {
          const has = s.vision.vibes.includes(vibe);
          return {
            vision: {
              ...s.vision,
              vibes: has
                ? s.vision.vibes.filter((v) => v !== vibe)
                : [...s.vision.vibes, vibe],
            },
          };
        }),
      addDealBreaker: (text) =>
        set((s) => ({
          vision: {
            ...s.vision,
            dealBreakers: [...s.vision.dealBreakers, text],
          },
        })),
      removeDealBreaker: (index) =>
        set((s) => ({
          vision: {
            ...s.vision,
            dealBreakers: s.vision.dealBreakers.filter((_, i) => i !== index),
          },
        })),
      updateBrief: (patch) =>
        set((s) => ({ brief: { ...s.brief, ...patch } })),

      setVibeProfile: (patch) =>
        set((s) => ({ vibeProfile: { ...s.vibeProfile, ...patch } })),

      // ── Moodboard ─────────────────────────────────────────────────────
      addMoodboardPin: (imageUrl, category, note) =>
        set((s) => ({
          moodboard: [
            ...s.moodboard,
            { id: uid("mb"), imageUrl, category, note },
          ],
        })),
      removeMoodboardPin: (id) =>
        set((s) => ({ moodboard: s.moodboard.filter((p) => p.id !== id) })),

      // ── Destinations ──────────────────────────────────────────────────
      addDestination: (name) =>
        set((s) => ({
          destinations: [
            ...s.destinations,
            {
              id: uid("dest"),
              emoji: "📍",
              name,
              region: "",
              status: "considering",
              favorite: false,
              inComparison: false,
              whyItFits: "",
              considerations: {
                flight: "",
                visa: "",
                bestTime: "",
                budgetRange: "",
                jetLag: "",
              },
              budgetSingleCents: 0,
              duration: "",
              flightLength: "",
              seasonOk: "",
              notes: "",
            },
          ],
        })),
      updateDestination: (id, patch) =>
        set((s) => ({
          destinations: s.destinations.map((d) =>
            d.id === id ? { ...d, ...patch } : d,
          ),
        })),
      removeDestination: (id) =>
        set((s) => ({
          destinations: s.destinations.filter((d) => d.id !== id),
        })),
      setDestinationStatus: (id, status) =>
        set((s) => ({
          destinations: s.destinations.map((d) =>
            d.id === id ? { ...d, status } : d,
          ),
        })),
      toggleDestinationFavorite: (id) =>
        set((s) => ({
          destinations: s.destinations.map((d) =>
            d.id === id ? { ...d, favorite: !d.favorite } : d,
          ),
        })),
      toggleDestinationComparison: (id) =>
        set((s) => ({
          destinations: s.destinations.map((d) =>
            d.id === id ? { ...d, inComparison: !d.inComparison } : d,
          ),
        })),
      updateDestinationConsiderations: (id, patch) =>
        set((s) => ({
          destinations: s.destinations.map((d) =>
            d.id === id
              ? { ...d, considerations: { ...d.considerations, ...patch } }
              : d,
          ),
        })),

      // ── Bookings ──────────────────────────────────────────────────────
      addBooking: (label, tier = "unset") =>
        set((s) => ({
          bookings: [
            ...s.bookings,
            {
              id: uid("bk"),
              label,
              status: "researching",
              costCents: 0,
              estimated: true,
              priorityTier: tier,
            },
          ],
        })),
      updateBooking: (id, patch) =>
        set((s) => ({
          bookings: s.bookings.map((b) =>
            b.id === id ? { ...b, ...patch } : b,
          ),
        })),
      removeBooking: (id) =>
        set((s) => ({ bookings: s.bookings.filter((b) => b.id !== id) })),
      setBookingStatus: (id, status) =>
        set((s) => ({
          bookings: s.bookings.map((b) =>
            b.id === id ? { ...b, status } : b,
          ),
        })),
      setBookingPriority: (id, tier) =>
        set((s) => ({
          bookings: s.bookings.map((b) =>
            b.id === id ? { ...b, priorityTier: tier } : b,
          ),
        })),

      // ── Itinerary ─────────────────────────────────────────────────────
      addDay: (date, label) =>
        set((s) => ({
          days: [
            ...s.days,
            {
              id: uid("day"),
              dayNumber: s.days.length + 1,
              date,
              label,
            },
          ],
        })),
      updateDay: (id, patch) =>
        set((s) => ({
          days: s.days.map((d) => (d.id === id ? { ...d, ...patch } : d)),
        })),
      removeDay: (id) =>
        set((s) => ({
          days: s.days.filter((d) => d.id !== id),
          items: s.items.filter((i) => i.dayId !== id),
        })),
      addItem: (dayId, patch) =>
        set((s) => ({
          items: [
            ...s.items,
            {
              id: uid("it"),
              dayId,
              time: patch.time ?? "",
              title: patch.title ?? "New activity",
              note: patch.note,
              confirmed: patch.confirmed ?? false,
            },
          ],
        })),
      updateItem: (id, patch) =>
        set((s) => ({
          items: s.items.map((i) =>
            i.id === id ? { ...i, ...patch } : i,
          ),
        })),
      removeItem: (id) =>
        set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
      toggleItemConfirmed: (id) =>
        set((s) => ({
          items: s.items.map((i) =>
            i.id === id ? { ...i, confirmed: !i.confirmed } : i,
          ),
        })),

      // ── Budget ────────────────────────────────────────────────────────
      setTotalBudget: (cents) =>
        set((s) => ({
          budget: { ...s.budget, totalBudgetCents: Math.max(0, cents) },
        })),
      addBudgetLine: (label, category, amountCents) =>
        set((s) => ({
          budgetLines: [
            ...s.budgetLines,
            {
              id: uid("bl"),
              label,
              category,
              amountCents,
              paid: false,
              estimated: true,
            },
          ],
        })),
      updateBudgetLine: (id, patch) =>
        set((s) => ({
          budgetLines: s.budgetLines.map((b) =>
            b.id === id ? { ...b, ...patch } : b,
          ),
        })),
      removeBudgetLine: (id) =>
        set((s) => ({
          budgetLines: s.budgetLines.filter((b) => b.id !== id),
        })),
      toggleFundingSource: (src) =>
        set((s) => {
          const has = s.budget.fundingSources.includes(src);
          return {
            budget: {
              ...s.budget,
              fundingSources: has
                ? s.budget.fundingSources.filter((f) => f !== src)
                : [...s.budget.fundingSources, src],
            },
          };
        }),
      updateBudgetSettings: (patch) =>
        set((s) => ({ budget: { ...s.budget, ...patch } })),

      // ── Registry ──────────────────────────────────────────────────────
      addRegistryFund: (label, goalCents) =>
        set((s) => ({
          registryFundItems: [
            ...s.registryFundItems,
            {
              id: uid("fund"),
              label,
              goalCents,
              raisedCents: 0,
            },
          ],
        })),
      updateRegistryFund: (id, patch) =>
        set((s) => ({
          registryFundItems: s.registryFundItems.map((f) =>
            f.id === id ? { ...f, ...patch } : f,
          ),
        })),
      removeRegistryFund: (id) =>
        set((s) => ({
          registryFundItems: s.registryFundItems.filter((f) => f.id !== id),
        })),

      // ── Checklist ─────────────────────────────────────────────────────
      addChecklistItem: (label, section) =>
        set((s) => ({
          checklist: [
            ...s.checklist,
            { id: uid("ck"), label, section, done: false },
          ],
        })),
      updateChecklistItem: (id, patch) =>
        set((s) => ({
          checklist: s.checklist.map((c) =>
            c.id === id ? { ...c, ...patch } : c,
          ),
        })),
      removeChecklistItem: (id) =>
        set((s) => ({
          checklist: s.checklist.filter((c) => c.id !== id),
        })),
      toggleChecklist: (id) =>
        set((s) => ({
          checklist: s.checklist.map((c) =>
            c.id === id ? { ...c, done: !c.done } : c,
          ),
        })),

      // ── Documents ─────────────────────────────────────────────────────
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
        const { DEFAULT_HONEYMOON } = await import("@/lib/honeymoon-seed");
        set(() => ({ ...DEFAULT_HONEYMOON }));
      },
    }),
    {
      name: "ananya:honeymoon",
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

let _honeymoonSyncTimer: ReturnType<typeof setTimeout> | null = null;
useHoneymoonStore.subscribe((state) => {
  if (_honeymoonSyncTimer) clearTimeout(_honeymoonSyncTimer);
  _honeymoonSyncTimer = setTimeout(() => {
    const coupleId = getCurrentCoupleId();
    if (!coupleId) return;
    dbUpsert("honeymoon_state", { couple_id: coupleId, data: state as unknown });
  }, 600);
});
