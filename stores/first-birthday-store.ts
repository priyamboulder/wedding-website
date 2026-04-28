// ── Baby's First Birthday store ───────────────────────────────────────────
// Zustand + persist to localStorage. Single-wedding scoping (no weddingId
// in the key) matching Bachelorette / First Anniversary. All seven tabs
// read/write through this store.

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { dbUpsert, getCurrentCoupleId } from "@/lib/supabase/db-sync";
import type {
  AllergyFlag,
  FirstBirthdayAdult,
  FirstBirthdayAlbumSettings,
  FirstBirthdayBudget,
  FirstBirthdayCeremony,
  FirstBirthdayContribution,
  FirstBirthdayDocCategory,
  FirstBirthdayDocument,
  FirstBirthdayExpense,
  FirstBirthdayExpenseCategory,
  FirstBirthdayFamily,
  FirstBirthdayFundingModel,
  FirstBirthdayItineraryItem,
  FirstBirthdayKid,
  FirstBirthdayMemory,
  FirstBirthdayMemoryCategory,
  FirstBirthdayMemoryType,
  FirstBirthdayPlan,
  FirstBirthdayRecState,
  FirstBirthdayRecStatus,
  FirstBirthdayRsvp,
  FirstBirthdayShotListItem,
  FirstBirthdayState,
} from "@/types/first-birthday";

function uid(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

interface Actions {
  // Plan
  updatePlan: (patch: Partial<FirstBirthdayPlan>) => void;
  toggleVibe: (v: FirstBirthdayPlan["vibes"][number]) => void;
  toggleHardNo: (h: FirstBirthdayPlan["hardNos"][number]) => void;
  addAllergyFlag: (allergen: string, severity: AllergyFlag["severity"]) => void;
  updateAllergyFlag: (id: string, patch: Partial<AllergyFlag>) => void;
  removeAllergyFlag: (id: string) => void;

  // Ceremony
  updateCeremony: (patch: Partial<FirstBirthdayCeremony>) => void;
  toggleTradition: (t: FirstBirthdayCeremony["traditions"][number]) => void;

  // Funding model
  setFundingModel: (m: FirstBirthdayFundingModel) => void;

  // Recommendation status
  setRecStatus: (id: string, status: FirstBirthdayRecStatus, dismissReason?: string) => void;

  // Itinerary
  addItineraryItem: (item: Omit<FirstBirthdayItineraryItem, "id">) => void;
  updateItineraryItem: (id: string, patch: Partial<FirstBirthdayItineraryItem>) => void;
  removeItineraryItem: (id: string) => void;
  seedRunOfShow: (template: Omit<FirstBirthdayItineraryItem, "id">[]) => void;

  // Families
  addFamily: (familyName: string) => void;
  updateFamily: (id: string, patch: Partial<FirstBirthdayFamily>) => void;
  removeFamily: (id: string) => void;
  setRsvp: (id: string, rsvp: FirstBirthdayRsvp) => void;
  addAdultToFamily: (familyId: string, name: string) => void;
  updateAdultInFamily: (familyId: string, adultId: string, patch: Partial<FirstBirthdayAdult>) => void;
  removeAdultFromFamily: (familyId: string, adultId: string) => void;
  addKidToFamily: (familyId: string, name: string, ageMonths: number) => void;
  updateKidInFamily: (familyId: string, kidId: string, patch: Partial<FirstBirthdayKid>) => void;
  removeKidFromFamily: (familyId: string, kidId: string) => void;

  // Budget
  setTotalBudget: (cents: number) => void;
  setGroupFundGoal: (cents: number) => void;
  addExpense: (
    category: FirstBirthdayExpenseCategory,
    vendor: string,
    amountCents: number,
    date: string,
    extras?: {
      notes?: string;
      paidBy?: string;
      source?: FirstBirthdayExpense["source"];
      receiptDataUrl?: string;
    },
  ) => void;
  updateExpense: (id: string, patch: Partial<FirstBirthdayExpense>) => void;
  removeExpense: (id: string) => void;

  // Contributions
  addContribution: (
    contributorName: string,
    relationship: string,
    amountCents: number,
    date: string,
  ) => void;
  updateContribution: (id: string, patch: Partial<FirstBirthdayContribution>) => void;
  removeContribution: (id: string) => void;

  // Memories
  addMemory: (
    type: FirstBirthdayMemoryType,
    extras?: {
      fileDataUrl?: string;
      category?: FirstBirthdayMemoryCategory;
      caption?: string;
      uploadedBy?: FirstBirthdayMemory["uploadedBy"];
      reflectionPrompt?: string;
      reflectionText?: string;
    },
  ) => void;
  updateMemory: (id: string, patch: Partial<FirstBirthdayMemory>) => void;
  removeMemory: (id: string) => void;
  toggleFeatured: (id: string) => void;

  // Shot list
  addShotListItem: (label: string) => void;
  updateShotListItem: (id: string, patch: Partial<FirstBirthdayShotListItem>) => void;
  removeShotListItem: (id: string) => void;

  // Album
  updateAlbum: (patch: Partial<FirstBirthdayAlbumSettings>) => void;

  // Reflections
  updateReflection: (key: keyof FirstBirthdayState["reflections"], value: string) => void;

  // Documents
  addDocument: (
    label: string,
    category: FirstBirthdayDocCategory,
    url?: string,
    notes?: string,
  ) => void;
  updateDocument: (id: string, patch: Partial<FirstBirthdayDocument>) => void;
  removeDocument: (id: string) => void;

  reset: () => Promise<void>;
  ensureSeeded: () => Promise<void>;
}

export const useFirstBirthdayStore = create<
  FirstBirthdayState & Actions
>()(
  persist(
    (set) => ({
      plan: {
        babyName: "", birthdayDate: "", partyDate: "", partyWindow: "",
        duration: null, guestTier: null, guestMix: null, vibes: [],
        venueType: null, venueName: "", venueCapacity: "",
        cateringIncluded: null, avAvailable: null, venueRestrictions: "",
        hardNos: [], dietaryRestrictions: "", accessibilityNeeds: "",
        budgetCeilingCents: 0, kidAgeRange: null, allergyFlags: [],
        napTime: "", specialSensitivities: "", whatThisYearHasMeant: "",
        discoverModeOverride: null, updatedAt: null,
      } as FirstBirthdayState["plan"],
      ceremony: {
        traditions: [], otherTraditionText: "", officiant: null,
        ritualItemsNotes: "", ceremonyVenueNotes: "", integration: null,
      } as FirstBirthdayState["ceremony"],
      funding: "self" as FirstBirthdayState["funding"],
      recStates: {} as FirstBirthdayState["recStates"],
      families: [] as FirstBirthdayState["families"],
      itinerary: [] as FirstBirthdayState["itinerary"],
      budget: { totalBudgetCents: 0, groupFundGoalCents: 0 } as FirstBirthdayState["budget"],
      expenses: [] as FirstBirthdayState["expenses"],
      contributions: [] as FirstBirthdayState["contributions"],
      memories: [] as FirstBirthdayState["memories"],
      shotList: [] as FirstBirthdayState["shotList"],
      album: { isPublic: false, allowGuestUploads: false, thankYouMessage: "", coverMemoryId: null } as FirstBirthdayState["album"],
      reflections: { surprisedBy: "", favoriteThing: "", wantToRemember: "", messageToBaby: "" } as FirstBirthdayState["reflections"],
      documents: [] as FirstBirthdayState["documents"],

      ensureSeeded: async () => {
        const { DEFAULT_FIRST_BIRTHDAY } = await import("@/lib/first-birthday-seed");
        set((s) => {
          if (s.itinerary.length > 0 || s.families.length > 0) return s;
          return { ...DEFAULT_FIRST_BIRTHDAY };
        });
      },

      // ── Plan ───────────────────────────────────────────────────────────
      updatePlan: (patch) =>
        set((s) => ({
          plan: { ...s.plan, ...patch, updatedAt: nowIso() },
        })),
      toggleVibe: (v) =>
        set((s) => {
          const has = s.plan.vibes.includes(v);
          return {
            plan: {
              ...s.plan,
              vibes: has
                ? s.plan.vibes.filter((x) => x !== v)
                : [...s.plan.vibes, v],
              updatedAt: nowIso(),
            },
          };
        }),
      toggleHardNo: (h) =>
        set((s) => {
          const has = s.plan.hardNos.includes(h);
          return {
            plan: {
              ...s.plan,
              hardNos: has
                ? s.plan.hardNos.filter((x) => x !== h)
                : [...s.plan.hardNos, h],
              updatedAt: nowIso(),
            },
          };
        }),
      addAllergyFlag: (allergen, severity) =>
        set((s) => ({
          plan: {
            ...s.plan,
            allergyFlags: [
              ...s.plan.allergyFlags,
              { id: uid("al"), allergen, severity },
            ],
            updatedAt: nowIso(),
          },
        })),
      updateAllergyFlag: (id, patch) =>
        set((s) => ({
          plan: {
            ...s.plan,
            allergyFlags: s.plan.allergyFlags.map((a) =>
              a.id === id ? { ...a, ...patch } : a,
            ),
          },
        })),
      removeAllergyFlag: (id) =>
        set((s) => ({
          plan: {
            ...s.plan,
            allergyFlags: s.plan.allergyFlags.filter((a) => a.id !== id),
          },
        })),

      // ── Ceremony ───────────────────────────────────────────────────────
      updateCeremony: (patch) =>
        set((s) => ({ ceremony: { ...s.ceremony, ...patch } })),
      toggleTradition: (t) =>
        set((s) => {
          const has = s.ceremony.traditions.includes(t);
          return {
            ceremony: {
              ...s.ceremony,
              traditions: has
                ? s.ceremony.traditions.filter((x) => x !== t)
                : [...s.ceremony.traditions, t],
            },
          };
        }),

      // ── Funding ────────────────────────────────────────────────────────
      setFundingModel: (m) => set(() => ({ funding: m })),

      // ── Recommendations ────────────────────────────────────────────────
      setRecStatus: (id, status, dismissReason) =>
        set((s) => {
          const existing = s.recStates[id];
          const next: FirstBirthdayRecState = {
            id,
            status,
            dismissReason: status === "dismissed" ? dismissReason : undefined,
            selectedAt:
              status === "selected" ? nowIso() : existing?.selectedAt,
          };
          return {
            recStates: { ...s.recStates, [id]: next },
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
      seedRunOfShow: (template) =>
        set(() => ({
          itinerary: template.map((item) => ({ ...item, id: uid("it") })),
        })),

      // ── Families ───────────────────────────────────────────────────────
      addFamily: (familyName) =>
        set((s) => ({
          families: [
            ...s.families,
            {
              id: uid("fam"),
              familyName,
              contactEmail: "",
              contactPhone: "",
              group: "family",
              adults: [],
              kids: [],
              rsvp: "not_sent",
              accessibilityNotes: "",
              rsvpMessage: "",
              contributionCents: 0,
              contributionStatus: "none",
            },
          ],
        })),
      updateFamily: (id, patch) =>
        set((s) => ({
          families: s.families.map((f) =>
            f.id === id ? { ...f, ...patch } : f,
          ),
        })),
      removeFamily: (id) =>
        set((s) => ({ families: s.families.filter((f) => f.id !== id) })),
      setRsvp: (id, rsvp) =>
        set((s) => ({
          families: s.families.map((f) =>
            f.id === id ? { ...f, rsvp } : f,
          ),
        })),
      addAdultToFamily: (familyId, name) =>
        set((s) => ({
          families: s.families.map((f) =>
            f.id === familyId
              ? {
                  ...f,
                  adults: [
                    ...f.adults,
                    { id: uid("ad"), name, dietaryNotes: "" },
                  ],
                }
              : f,
          ),
        })),
      updateAdultInFamily: (familyId, adultId, patch) =>
        set((s) => ({
          families: s.families.map((f) =>
            f.id === familyId
              ? {
                  ...f,
                  adults: f.adults.map((a) =>
                    a.id === adultId ? { ...a, ...patch } : a,
                  ),
                }
              : f,
          ),
        })),
      removeAdultFromFamily: (familyId, adultId) =>
        set((s) => ({
          families: s.families.map((f) =>
            f.id === familyId
              ? { ...f, adults: f.adults.filter((a) => a.id !== adultId) }
              : f,
          ),
        })),
      addKidToFamily: (familyId, name, ageMonths) =>
        set((s) => ({
          families: s.families.map((f) =>
            f.id === familyId
              ? {
                  ...f,
                  kids: [
                    ...f.kids,
                    {
                      id: uid("kid"),
                      name,
                      ageMonths,
                      allergyNotes: "",
                      dietaryNotes: "",
                    },
                  ],
                }
              : f,
          ),
        })),
      updateKidInFamily: (familyId, kidId, patch) =>
        set((s) => ({
          families: s.families.map((f) =>
            f.id === familyId
              ? {
                  ...f,
                  kids: f.kids.map((k) =>
                    k.id === kidId ? { ...k, ...patch } : k,
                  ),
                }
              : f,
          ),
        })),
      removeKidFromFamily: (familyId, kidId) =>
        set((s) => ({
          families: s.families.map((f) =>
            f.id === familyId
              ? { ...f, kids: f.kids.filter((k) => k.id !== kidId) }
              : f,
          ),
        })),

      // ── Budget ─────────────────────────────────────────────────────────
      setTotalBudget: (cents) =>
        set((s) => ({
          budget: { ...s.budget, totalBudgetCents: Math.max(0, cents) },
        })),
      setGroupFundGoal: (cents) =>
        set((s) => ({
          budget: { ...s.budget, groupFundGoalCents: Math.max(0, cents) },
        })),
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
              paidBy: extras?.paidBy ?? "",
              notes: extras?.notes ?? "",
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

      // ── Contributions ──────────────────────────────────────────────────
      addContribution: (contributorName, relationship, amountCents, date) =>
        set((s) => ({
          contributions: [
            ...s.contributions,
            {
              id: uid("cont"),
              contributorName,
              relationship,
              amountCents,
              date,
              method: "",
              status: "pledged",
              notes: "",
            },
          ],
        })),
      updateContribution: (id, patch) =>
        set((s) => ({
          contributions: s.contributions.map((c) =>
            c.id === id ? { ...c, ...patch } : c,
          ),
        })),
      removeContribution: (id) =>
        set((s) => ({
          contributions: s.contributions.filter((c) => c.id !== id),
        })),

      // ── Memories ───────────────────────────────────────────────────────
      addMemory: (type, extras) =>
        set((s) => ({
          memories: [
            ...s.memories,
            {
              id: uid("mem"),
              type,
              fileDataUrl: extras?.fileDataUrl,
              category: extras?.category ?? null,
              caption: extras?.caption ?? "",
              uploadedBy: extras?.uploadedBy ?? "parent",
              isFeatured: false,
              reflectionPrompt: extras?.reflectionPrompt,
              reflectionText: extras?.reflectionText,
              createdAt: nowIso(),
            },
          ],
        })),
      updateMemory: (id, patch) =>
        set((s) => ({
          memories: s.memories.map((m) =>
            m.id === id ? { ...m, ...patch } : m,
          ),
        })),
      removeMemory: (id) =>
        set((s) => ({ memories: s.memories.filter((m) => m.id !== id) })),
      toggleFeatured: (id) =>
        set((s) => ({
          memories: s.memories.map((m) =>
            m.id === id ? { ...m, isFeatured: !m.isFeatured } : m,
          ),
        })),

      // ── Shot list ──────────────────────────────────────────────────────
      addShotListItem: (label) =>
        set((s) => ({
          shotList: [
            ...s.shotList,
            { id: uid("sl"), label, captured: false, note: "" },
          ],
        })),
      updateShotListItem: (id, patch) =>
        set((s) => ({
          shotList: s.shotList.map((i) =>
            i.id === id ? { ...i, ...patch } : i,
          ),
        })),
      removeShotListItem: (id) =>
        set((s) => ({ shotList: s.shotList.filter((i) => i.id !== id) })),

      // ── Album ──────────────────────────────────────────────────────────
      updateAlbum: (patch) =>
        set((s) => ({ album: { ...s.album, ...patch } })),

      // ── Reflections ────────────────────────────────────────────────────
      updateReflection: (key, value) =>
        set((s) => ({
          reflections: { ...s.reflections, [key]: value },
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
              url: url ?? "",
              notes: notes ?? "",
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
        const { DEFAULT_FIRST_BIRTHDAY } = await import("@/lib/first-birthday-seed");
        set(() => ({ ...DEFAULT_FIRST_BIRTHDAY }));
      },
    }),
    {
      name: "ananya:first-birthday",
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

let _firstBirthdaySyncTimer: ReturnType<typeof setTimeout> | null = null;
useFirstBirthdayStore.subscribe((state) => {
  if (_firstBirthdaySyncTimer) clearTimeout(_firstBirthdaySyncTimer);
  _firstBirthdaySyncTimer = setTimeout(() => {
    const coupleId = getCurrentCoupleId();
    if (!coupleId) return;
    dbUpsert("first_birthday_state", { couple_id: coupleId, data: state as unknown });
  }, 600);
});
