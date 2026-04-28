// ── Baby Shower store ──────────────────────────────────────────────────────
// Zustand + persist. Single-wedding scoping convention (no weddingId in
// localStorage key). Covers all six tabs of the Baby Shower canvas:
// Plan & Vibe · Discover · Guest List · Itinerary · Budget · Documents.

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { dbUpsert, getCurrentCoupleId } from "@/lib/supabase/db-sync";
import type {
  BabyShowerState,
  BabyShowerPlan,
  BabyShowerFundingModel,
  BabyShowerGuest,
  BabyShowerCoHost,
  BabyShowerItineraryItem,
  BabyShowerBudget,
  BabyShowerExpense,
  BabyShowerDocument,
  BabyShowerRecStatus,
  BabyShowerRsvp,
  BabyShowerBlockType,
  BabyShowerExpenseCategory,
  BabyShowerDocCategory,
} from "@/types/baby-shower";

function uid(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

interface BabyShowerActions {
  // ── Identity ─────────────────────────────────────────────────────────────
  setParentName: (name: string) => void;

  // ── Plan & Vibe ─────────────────────────────────────────────────────────
  updatePlan: (patch: Partial<BabyShowerPlan>) => void;
  toggleVibe: (vibe: BabyShowerPlan["vibes"][number]) => void;
  toggleHardNo: (hardNo: BabyShowerPlan["hardNos"][number]) => void;
  addPersonalPhrase: (phrase: string) => void;
  removePersonalPhrase: (index: number) => void;

  // ── Funding ─────────────────────────────────────────────────────────────
  setFunding: (model: BabyShowerFundingModel) => void;

  // ── Recommendations ─────────────────────────────────────────────────────
  setRecStatus: (recId: string, status: BabyShowerRecStatus) => void;
  clearRecStatus: (recId: string) => void;

  // ── Guests ───────────────────────────────────────────────────────────────
  addGuest: (name: string, groupTag: string) => void;
  updateGuest: (id: string, patch: Partial<BabyShowerGuest>) => void;
  removeGuest: (id: string) => void;
  setGuestRsvp: (id: string, rsvp: BabyShowerRsvp) => void;
  setGuestContribution: (id: string, cents: number, status: BabyShowerGuest["contributionStatus"]) => void;

  // ── Co-hosts ─────────────────────────────────────────────────────────────
  addCoHost: (name: string, email: string) => void;
  updateCoHost: (id: string, patch: Partial<BabyShowerCoHost>) => void;
  removeCoHost: (id: string) => void;

  // ── Itinerary ────────────────────────────────────────────────────────────
  addItineraryItem: (item: Omit<BabyShowerItineraryItem, "id">) => void;
  updateItineraryItem: (id: string, patch: Partial<BabyShowerItineraryItem>) => void;
  removeItineraryItem: (id: string) => void;
  setItineraryBlockType: (id: string, blockType: BabyShowerBlockType) => void;

  // ── Budget & expenses ────────────────────────────────────────────────────
  updateBudget: (patch: Partial<BabyShowerBudget>) => void;
  addExpense: (expense: Omit<BabyShowerExpense, "id">) => void;
  updateExpense: (id: string, patch: Partial<BabyShowerExpense>) => void;
  removeExpense: (id: string) => void;

  // ── Documents ────────────────────────────────────────────────────────────
  addDocument: (name: string, category: BabyShowerDocCategory, sizeLabel?: string) => void;
  updateDocument: (id: string, patch: Partial<BabyShowerDocument>) => void;
  removeDocument: (id: string) => void;

  reset: () => Promise<void>;
  ensureSeeded: () => Promise<void>;
}

export const useBabyShowerStore = create<
  BabyShowerState & BabyShowerActions
>()(
  persist(
    (set) => ({
      parentName: "" as BabyShowerState["parentName"],
      plan: {
        dueDate: "", showerDate: "", showerWindow: "", plannerRole: null,
        coHostInvite: "", isSurprise: false, guestTier: null, guestMix: null,
        vibes: [], venueType: null, venueName: "", venueCapacity: "",
        cateringIncluded: null, avAvailable: null, venueRestrictions: "",
        season: null, hardNos: [], dietaryRestrictions: "", accessibilityNeeds: "",
        budgetCeilingCents: 0, thingsThatFeelLikeUs: [], updatedAt: null,
      } as BabyShowerState["plan"],
      funding: "host_funded" as BabyShowerState["funding"],
      recStatus: {} as BabyShowerState["recStatus"],
      guests: [] as BabyShowerState["guests"],
      coHosts: [] as BabyShowerState["coHosts"],
      itinerary: [] as BabyShowerState["itinerary"],
      budget: { totalBudgetCents: 0, groupFundGoalCents: 0 } as BabyShowerState["budget"],
      expenses: [] as BabyShowerState["expenses"],
      documents: [] as BabyShowerState["documents"],

      ensureSeeded: async () => {
        const { DEFAULT_BABY_SHOWER } = await import("@/lib/baby-shower-seed");
        set((s) => {
          if (s.guests.length > 0 || s.itinerary.length > 0) return s;
          return { ...DEFAULT_BABY_SHOWER };
        });
      },

      // ── Identity ─────────────────────────────────────────────────────────
      setParentName: (name) => set(() => ({ parentName: name })),

      // ── Plan & Vibe ─────────────────────────────────────────────────────
      updatePlan: (patch) =>
        set((s) => ({
          plan: { ...s.plan, ...patch, updatedAt: nowIso() },
        })),
      toggleVibe: (vibe) =>
        set((s) => {
          const active = s.plan.vibes.includes(vibe);
          const next = active
            ? s.plan.vibes.filter((v) => v !== vibe)
            : [...s.plan.vibes, vibe];
          return {
            plan: { ...s.plan, vibes: next, updatedAt: nowIso() },
          };
        }),
      toggleHardNo: (hardNo) =>
        set((s) => {
          const active = s.plan.hardNos.includes(hardNo);
          const next = active
            ? s.plan.hardNos.filter((h) => h !== hardNo)
            : [...s.plan.hardNos, hardNo];
          return {
            plan: { ...s.plan, hardNos: next, updatedAt: nowIso() },
          };
        }),
      addPersonalPhrase: (phrase) =>
        set((s) => ({
          plan: {
            ...s.plan,
            thingsThatFeelLikeUs: [...s.plan.thingsThatFeelLikeUs, phrase],
            updatedAt: nowIso(),
          },
        })),
      removePersonalPhrase: (index) =>
        set((s) => ({
          plan: {
            ...s.plan,
            thingsThatFeelLikeUs: s.plan.thingsThatFeelLikeUs.filter(
              (_, i) => i !== index,
            ),
            updatedAt: nowIso(),
          },
        })),

      // ── Funding ─────────────────────────────────────────────────────────
      setFunding: (model) => set(() => ({ funding: model })),

      // ── Recommendations ─────────────────────────────────────────────────
      setRecStatus: (recId, status) =>
        set((s) => ({
          recStatus: { ...s.recStatus, [recId]: status },
        })),
      clearRecStatus: (recId) =>
        set((s) => {
          const next = { ...s.recStatus };
          delete next[recId];
          return { recStatus: next };
        }),

      // ── Guests ───────────────────────────────────────────────────────────
      addGuest: (name, groupTag) =>
        set((s) => ({
          guests: [
            ...s.guests,
            {
              id: uid("g"),
              name,
              email: "",
              phone: "",
              groupTag: groupTag || "Friends",
              side: "yours",
              rsvp: "not_sent",
              plusOnes: 0,
              kidsCount: 0,
              dietary: "",
              accessibility: "",
              rsvpMessage: "",
              contributionCents: 0,
              contributionStatus: "none",
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
      setGuestContribution: (id, cents, status) =>
        set((s) => ({
          guests: s.guests.map((g) =>
            g.id === id
              ? { ...g, contributionCents: cents, contributionStatus: status }
              : g,
          ),
        })),

      // ── Co-hosts ─────────────────────────────────────────────────────────
      addCoHost: (name, email) =>
        set((s) => ({
          coHosts: [
            ...s.coHosts,
            {
              id: uid("ch"),
              name,
              email,
              shareCents: 0,
              paidCents: 0,
              status: "pending",
              permissions: "full",
            },
          ],
        })),
      updateCoHost: (id, patch) =>
        set((s) => ({
          coHosts: s.coHosts.map((c) => (c.id === id ? { ...c, ...patch } : c)),
        })),
      removeCoHost: (id) =>
        set((s) => ({ coHosts: s.coHosts.filter((c) => c.id !== id) })),

      // ── Itinerary ────────────────────────────────────────────────────────
      addItineraryItem: (item) =>
        set((s) => ({
          itinerary: [...s.itinerary, { ...item, id: uid("it") }],
        })),
      updateItineraryItem: (id, patch) =>
        set((s) => ({
          itinerary: s.itinerary.map((it) =>
            it.id === id ? { ...it, ...patch } : it,
          ),
        })),
      removeItineraryItem: (id) =>
        set((s) => ({
          itinerary: s.itinerary.filter((it) => it.id !== id),
        })),
      setItineraryBlockType: (id, blockType) =>
        set((s) => ({
          itinerary: s.itinerary.map((it) =>
            it.id === id ? { ...it, blockType } : it,
          ),
        })),

      // ── Budget & expenses ────────────────────────────────────────────────
      updateBudget: (patch) =>
        set((s) => ({ budget: { ...s.budget, ...patch } })),
      addExpense: (expense) =>
        set((s) => ({
          expenses: [...s.expenses, { ...expense, id: uid("ex") }],
        })),
      updateExpense: (id, patch) =>
        set((s) => ({
          expenses: s.expenses.map((e) => (e.id === id ? { ...e, ...patch } : e)),
        })),
      removeExpense: (id) =>
        set((s) => ({ expenses: s.expenses.filter((e) => e.id !== id) })),

      // ── Documents ────────────────────────────────────────────────────────
      addDocument: (name, category, sizeLabel = "—") =>
        set((s) => ({
          documents: [
            ...s.documents,
            {
              id: uid("doc"),
              name,
              url: "#",
              category,
              uploadedAt: nowIso(),
              sizeLabel,
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
        const { DEFAULT_BABY_SHOWER } = await import("@/lib/baby-shower-seed");
        set(() => ({ ...DEFAULT_BABY_SHOWER }));
      },
    }),
    {
      name: "ananya:baby_shower",
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

let _babyShowerSyncTimer: ReturnType<typeof setTimeout> | null = null;
useBabyShowerStore.subscribe((state) => {
  if (_babyShowerSyncTimer) clearTimeout(_babyShowerSyncTimer);
  _babyShowerSyncTimer = setTimeout(() => {
    const coupleId = getCurrentCoupleId();
    if (!coupleId) return;
    dbUpsert("baby_shower_state", { couple_id: coupleId, data: state as unknown });
  }, 600);
});
