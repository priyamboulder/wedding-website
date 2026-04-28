// ── First Anniversary store ───────────────────────────────────────────────
// Zustand + persist to localStorage. Single-wedding scoping (no weddingId in
// the key) matching the Bachelorette pattern. All five tabs read/write
// through this store.

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { dbUpsert, getCurrentCoupleId } from "@/lib/supabase/db-sync";
import type {
  AnniversaryBasics,
  AnniversaryDocument,
  AnniversaryVibe,
  BudgetTier,
  CelebrationWindow,
  DocumentCategory,
  DurationPref,
  Expense,
  ExpenseCategory,
  FirstAnniversaryState,
  HardNoTag,
  ItineraryItem,
  Recommendation,
  RecommendationState,
  RecommendationStatus,
  TimeBlock,
  VibeProfile,
} from "@/types/first-anniversary";

function uid(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

interface Actions {
  // Basics
  updateBasics: (patch: Partial<AnniversaryBasics>) => void;
  setCelebrationWindow: (w: CelebrationWindow | null) => void;
  setDuration: (d: DurationPref | null) => void;

  // Vibe
  toggleVibe: (v: AnniversaryVibe) => void;
  setBudget: (b: BudgetTier | null) => void;
  toggleHardNo: (tag: HardNoTag) => void;
  updateVibe: (patch: Partial<VibeProfile>) => void;

  // Recommendation states
  setRecommendationStatus: (
    id: string,
    status: RecommendationStatus,
    dismissReason?: string,
  ) => void;

  // Apply recommendation → itinerary (AI Suggest). Replaces existing items.
  applyRecommendationItinerary: (rec: Recommendation) => void;

  // Itinerary
  addItineraryItem: (item: Omit<ItineraryItem, "id">) => void;
  updateItineraryItem: (id: string, patch: Partial<ItineraryItem>) => void;
  removeItineraryItem: (id: string) => void;
  addDay: () => void;

  // Budget
  addExpense: (
    category: ExpenseCategory,
    vendor: string,
    amountCents: number,
    date: string,
    extras?: { notes?: string; source?: Expense["source"]; receiptDataUrl?: string },
  ) => void;
  updateExpense: (id: string, patch: Partial<Expense>) => void;
  removeExpense: (id: string) => void;

  // Documents
  addDocument: (
    label: string,
    category: DocumentCategory,
    url?: string,
    notes?: string,
  ) => void;
  updateDocument: (id: string, patch: Partial<AnniversaryDocument>) => void;
  removeDocument: (id: string) => void;

  reset: () => Promise<void>;
  ensureSeeded: () => Promise<void>;
}

export const useFirstAnniversaryStore = create<
  FirstAnniversaryState & Actions
>()(
  persist(
    (set) => ({
      basics: {
        partnerOne: "", partnerTwo: "", anniversaryDate: "",
        anniversaryNumber: 1, celebrationWindow: null, duration: null,
      } as FirstAnniversaryState["basics"],
      vibe: {
        vibes: [], budget: null, hardNos: [],
        thingsWeLoved: "", accessibilityNotes: "", updatedAt: null,
      } as FirstAnniversaryState["vibe"],
      recommendationStates: {} as FirstAnniversaryState["recommendationStates"],
      itinerary: [] as FirstAnniversaryState["itinerary"],
      expenses: [] as FirstAnniversaryState["expenses"],
      documents: [] as FirstAnniversaryState["documents"],

      ensureSeeded: async () => {
        const { DEFAULT_FIRST_ANNIVERSARY } = await import("@/lib/first-anniversary-seed");
        set((s) => {
          if (s.itinerary.length > 0 || s.basics.partnerOne) return s;
          return { ...DEFAULT_FIRST_ANNIVERSARY };
        });
      },

      // ── Basics ─────────────────────────────────────────────────────────
      updateBasics: (patch) =>
        set((s) => ({ basics: { ...s.basics, ...patch } })),
      setCelebrationWindow: (celebrationWindow) =>
        set((s) => ({ basics: { ...s.basics, celebrationWindow } })),
      setDuration: (duration) =>
        set((s) => ({ basics: { ...s.basics, duration } })),

      // ── Vibe ───────────────────────────────────────────────────────────
      toggleVibe: (v) =>
        set((s) => {
          const has = s.vibe.vibes.includes(v);
          return {
            vibe: {
              ...s.vibe,
              vibes: has
                ? s.vibe.vibes.filter((x) => x !== v)
                : [...s.vibe.vibes, v],
              updatedAt: nowIso(),
            },
          };
        }),
      setBudget: (b) =>
        set((s) => ({
          vibe: { ...s.vibe, budget: b, updatedAt: nowIso() },
        })),
      toggleHardNo: (tag) =>
        set((s) => {
          const has = s.vibe.hardNos.includes(tag);
          return {
            vibe: {
              ...s.vibe,
              hardNos: has
                ? s.vibe.hardNos.filter((x) => x !== tag)
                : [...s.vibe.hardNos, tag],
              updatedAt: nowIso(),
            },
          };
        }),
      updateVibe: (patch) =>
        set((s) => ({
          vibe: { ...s.vibe, ...patch, updatedAt: nowIso() },
        })),

      // ── Recommendation states ──────────────────────────────────────────
      setRecommendationStatus: (id, status, dismissReason) =>
        set((s) => {
          const existing = s.recommendationStates[id];
          const next: RecommendationState = {
            id,
            status,
            dismissReason: status === "dismissed" ? dismissReason : undefined,
            selectedAt:
              status === "selected"
                ? nowIso()
                : existing?.selectedAt,
          };
          return {
            recommendationStates: {
              ...s.recommendationStates,
              [id]: next,
            },
          };
        }),

      applyRecommendationItinerary: (rec) =>
        set((s) => {
          const template = rec.itineraryTemplate ?? [];
          const items: ItineraryItem[] = [];
          template.forEach((day, dayIdx) => {
            const blocks: TimeBlock[] = ["morning", "afternoon", "evening"];
            let sortOrder = 0;
            for (const block of blocks) {
              const activity = day[block];
              if (!activity) continue;
              items.push({
                id: uid("ai"),
                dayNumber: dayIdx + 1,
                timeBlock: block,
                sortOrder: sortOrder++,
                activity,
                isMainEvent: dayIdx === 0 && block === "evening",
              });
            }
          });
          // If the recommendation has no itinerary template, seed a single
          // main-event block so the user has something to edit.
          if (items.length === 0) {
            items.push({
              id: uid("ai"),
              dayNumber: 1,
              timeBlock: "evening",
              sortOrder: 0,
              activity: rec.name,
              isMainEvent: true,
            });
          }
          return {
            itinerary: items,
            recommendationStates: {
              ...s.recommendationStates,
              [rec.id]: {
                id: rec.id,
                status: "selected",
                selectedAt: nowIso(),
              },
            },
          };
        }),

      // ── Itinerary ──────────────────────────────────────────────────────
      addItineraryItem: (item) =>
        set((s) => ({
          itinerary: [...s.itinerary, { ...item, id: uid("it") }],
        })),
      updateItineraryItem: (id, patch) =>
        set((s) => ({
          itinerary: s.itinerary.map((i) =>
            i.id === id ? { ...i, ...patch } : i,
          ),
        })),
      removeItineraryItem: (id) =>
        set((s) => ({ itinerary: s.itinerary.filter((i) => i.id !== id) })),
      addDay: () =>
        set((s) => {
          const maxDay = s.itinerary.reduce(
            (m, i) => Math.max(m, i.dayNumber),
            0,
          );
          return {
            itinerary: [
              ...s.itinerary,
              {
                id: uid("it"),
                dayNumber: maxDay + 1,
                timeBlock: "morning",
                sortOrder: 0,
                activity: "",
              },
            ],
          };
        }),

      // ── Budget ─────────────────────────────────────────────────────────
      addExpense: (category, vendor, amountCents, date, extras) =>
        set((s) => ({
          expenses: [
            ...s.expenses,
            {
              id: uid("e"),
              category,
              vendor,
              amountCents,
              date,
              notes: extras?.notes,
              source: extras?.source ?? "manual",
              receiptDataUrl: extras?.receiptDataUrl,
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

      // ── Documents ──────────────────────────────────────────────────────
      addDocument: (label, category, url, notes) =>
        set((s) => ({
          documents: [
            ...s.documents,
            {
              id: uid("d"),
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
        const { DEFAULT_FIRST_ANNIVERSARY } = await import("@/lib/first-anniversary-seed");
        set(() => ({ ...DEFAULT_FIRST_ANNIVERSARY }));
      },
    }),
    {
      name: "ananya:first-anniversary",
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

let _firstAnniversarySyncTimer: ReturnType<typeof setTimeout> | null = null;
useFirstAnniversaryStore.subscribe((state) => {
  if (_firstAnniversarySyncTimer) clearTimeout(_firstAnniversarySyncTimer);
  _firstAnniversarySyncTimer = setTimeout(() => {
    const coupleId = getCurrentCoupleId();
    if (!coupleId) return;
    dbUpsert("first_anniversary_state", { couple_id: coupleId, data: state as unknown });
  }, 600);
});
