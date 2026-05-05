// ── Mehendi Artist store ───────────────────────────────────────────────────
// Backs the five Mehendi tabs. State is scoped by `category_id` so a single
// store handles multiple wedding workspaces without collision. All slices
// persist to localStorage via zustand/persist.

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { dbUpsert, getCurrentCoupleId } from "@/lib/supabase/db-sync";
import type {
  BrideCarePlan,
  ContractChecklistItem,
  ContractChecklistItemId,
  EventSetup,
  GuestSlot,
  MehndiBrief,
  MehndiDetailedTierGuest,
  MehndiDocument,
  MehndiLogisticsCheck,
  MehndiPersonalElement,
  MehndiReference,
  MehndiStylePrefs,
  MehndiVipGuest,
  MehndiWantLists,
  PersonalTouchImage,
  ScheduleItem,
  SchedulingMode,
  VibeTag,
} from "@/types/mehndi";

// Per-category metadata that the Logistics guided journey stores but the
// full workspace doesn't otherwise have a home for.
export interface MehndiLogisticsJourneyMeta {
  category_id: string;
  bridal_complexity_hours: number | null;
  travel_stay_applies: boolean;
  cancellation_is_outdoor: boolean;
  contract_ready_to_send: boolean;
  timeline_loaded_default: boolean;
  drying_time_hours: number;
}

export function defaultLogisticsJourneyMeta(
  category_id: string,
): MehndiLogisticsJourneyMeta {
  return {
    category_id,
    bridal_complexity_hours: null,
    travel_stay_applies: true,
    cancellation_is_outdoor: false,
    contract_ready_to_send: false,
    timeline_loaded_default: false,
    drying_time_hours: 5,
  };
}

interface MehndiState {
  briefs: MehndiBrief[];
  references: MehndiReference[];
  // Kept for migration — `elements` now feed into stylePrefs.meaningful_symbols
  // on first load. Legacy rows still render if some couple opened v2 state.
  elements: MehndiPersonalElement[];
  // Kept for migration — want/avoid moved to stylePrefs.definitely_want /
  // not_for_us as chip arrays.
  wantLists: MehndiWantLists[];
  stylePrefs: MehndiStylePrefs[];
  personalTouchImages: PersonalTouchImage[];
  guestSlots: GuestSlot[];
  vipGuests: MehndiVipGuest[];
  detailedTierGuests: MehndiDetailedTierGuest[];
  setups: EventSetup[];
  scheduleItems: ScheduleItem[];
  brideCare: BrideCarePlan[];
  logisticsChecks: MehndiLogisticsCheck[];
  contractChecklist: ContractChecklistItem[];
  documents: MehndiDocument[];
  logisticsJourneyMeta: MehndiLogisticsJourneyMeta[];

  // ── Brief ──
  updateBrief: (category_id: string, body: string) => void;

  // ── References ──
  addReference: (
    input: Omit<MehndiReference, "id" | "created_at" | "reaction" | "source"> &
      Partial<Pick<MehndiReference, "reaction" | "source">>,
  ) => MehndiReference;
  seedSuggestedReferences: (category_id: string) => void;
  updateReference: (id: string, patch: Partial<MehndiReference>) => void;
  deleteReference: (id: string) => void;

  // ── Personal elements (legacy) ──
  addElement: (
    input: Omit<MehndiPersonalElement, "id" | "sort_order"> & {
      sort_order?: number;
    },
  ) => MehndiPersonalElement;
  updateElement: (id: string, patch: Partial<MehndiPersonalElement>) => void;
  toggleElement: (id: string) => void;
  deleteElement: (id: string) => void;

  // ── Want lists (legacy) ──
  updateWantLists: (
    category_id: string,
    patch: Partial<Omit<MehndiWantLists, "category_id">>,
  ) => void;

  // ── Style prefs (rebuilt Story tab) ──
  updateStylePrefs: (
    category_id: string,
    patch: Partial<Omit<MehndiStylePrefs, "category_id">>,
  ) => void;
  toggleDirectionLove: (category_id: string, direction_id: string) => void;
  toggleDirectionPass: (category_id: string, direction_id: string) => void;

  // ── Guest slots ──
  addGuestSlot: (
    input: Omit<GuestSlot, "id" | "sort_order"> & { sort_order?: number },
  ) => GuestSlot;
  updateGuestSlot: (id: string, patch: Partial<GuestSlot>) => void;
  deleteGuestSlot: (id: string) => void;

  // ── VIP guests ──
  addVipGuest: (
    input: Omit<MehndiVipGuest, "id" | "sort_order"> & { sort_order?: number },
  ) => MehndiVipGuest;
  updateVipGuest: (id: string, patch: Partial<MehndiVipGuest>) => void;
  deleteVipGuest: (id: string) => void;
  seedDefaultVipRoster: (category_id: string) => void;

  // ── Detailed-tier guests ──
  addDetailedTierGuest: (
    input: Omit<MehndiDetailedTierGuest, "id" | "sort_order"> & {
      sort_order?: number;
    },
  ) => MehndiDetailedTierGuest;
  updateDetailedTierGuest: (
    id: string,
    patch: Partial<MehndiDetailedTierGuest>,
  ) => void;
  deleteDetailedTierGuest: (id: string) => void;

  // ── Personal-touch image uploads ──
  addPersonalTouchImage: (
    input: Omit<PersonalTouchImage, "id" | "created_at">,
  ) => PersonalTouchImage;
  updatePersonalTouchImage: (
    id: string,
    patch: Partial<PersonalTouchImage>,
  ) => void;
  deletePersonalTouchImage: (id: string) => void;

  // ── Event setup ──
  updateSetup: (category_id: string, patch: Partial<EventSetup>) => void;

  // ── Day-of schedule ──
  addScheduleItem: (
    input: Omit<ScheduleItem, "id" | "sort_order"> & { sort_order?: number },
  ) => ScheduleItem;
  seedDefaultSchedule: (category_id: string) => void;
  updateScheduleItem: (id: string, patch: Partial<ScheduleItem>) => void;
  deleteScheduleItem: (id: string) => void;

  // ── Bride care ──
  updateBrideCare: (
    category_id: string,
    patch: Partial<Omit<BrideCarePlan, "category_id">>,
  ) => void;

  // ── Logistics check ──
  updateLogisticsCheck: (
    category_id: string,
    patch: Partial<Omit<MehndiLogisticsCheck, "category_id">>,
  ) => void;

  // ── Contract checklist ──
  toggleContractCheck: (
    category_id: string,
    item_id: ContractChecklistItemId,
  ) => void;
  updateContractNote: (
    category_id: string,
    item_id: ContractChecklistItemId,
    notes: string,
  ) => void;

  // ── Documents ──
  addDocument: (
    input: Omit<MehndiDocument, "id" | "created_at">,
  ) => MehndiDocument;
  updateDocument: (id: string, patch: Partial<MehndiDocument>) => void;
  deleteDocument: (id: string) => void;

  // ── Logistics journey meta ──
  updateLogisticsJourneyMeta: (
    category_id: string,
    patch: Partial<Omit<MehndiLogisticsJourneyMeta, "category_id">>,
  ) => void;
}

const rid = (p: string) =>
  `${p}-${Math.random().toString(36).slice(2, 9)}-${Date.now().toString(36)}`;

function nextOrder<T extends { category_id: string; sort_order: number }>(
  list: T[],
  category_id: string,
): number {
  const scoped = list.filter((x) => x.category_id === category_id);
  return scoped.length > 0
    ? Math.max(...scoped.map((x) => x.sort_order)) + 1
    : 1;
}

export function defaultSetup(category_id: string): EventSetup {
  return {
    category_id,
    stations: 3,
    seating: "chairs_with_armrests",
    lighting: "natural_daylight",
    ventilation: "well_ventilated_indoor",
    drying_plan: "",
    entertainment: "",
    event_duration_hours: 4,
    expected_guest_count: 50,
    scheduling_mode: "priority_queue",
    avg_tier: "classic",
    tier_capacity: { quick: 30, classic: 15, detailed: 5 },
    event_date: "",
    event_start_time: "14:00",
    signup_open: false,
  };
}

export function defaultBrideCare(category_id: string): BrideCarePlan {
  return {
    category_id,
    assignee_name: "",
    assignee_role: "",
    assignee_contact: "",
    tasks:
      "Feed snacks and hold drinks while bride's hands dry.\nApply lemon-sugar paste every 30 min after application.\nWrap hands in tissue or plastic wrap before sleep.\nNo water on hands for at least 4 hours after paste removal.",
  };
}

export function defaultStylePrefs(category_id: string): MehndiStylePrefs {
  return {
    category_id,
    loved_directions: [],
    passed_directions: [],
    keywords: [],
    arm_coverage: null,
    hand_side: null,
    feet_coverage: null,
    partner_initials_toggle: false,
    partner_initials_placement: "",
    meaningful_symbols: [],
    matching_elements_toggle: false,
    matching_elements_notes: "",
    motifs_to_avoid: "",
    definitely_want: [],
    not_for_us: [],
  };
}

export function defaultLogisticsCheck(
  category_id: string,
): MehndiLogisticsCheck {
  return {
    category_id,
    chairs_confirmed: false,
    lighting_arranged: false,
    ventilation_ready: false,
    drying_area_set: false,
    entertainment_plan: "",
  };
}

export function defaultWantLists(category_id: string): MehndiWantLists {
  return { category_id, want: "", avoid: "" };
}

// Default VIP roster — the roles that go first regardless of scheduling mode.
// Blank names so the couple fills them in.
const DEFAULT_VIP_ROSTER: Array<Pick<MehndiVipGuest, "name" | "role">> = [
  { name: "", role: "Bride" },
  { name: "", role: "Bride's mother" },
  { name: "", role: "Groom's mother" },
  { name: "", role: "Sister / maid of honor" },
];

// Suggested reference gallery images. Curated Unsplash photos keyed by
// body-area bucket and a vibe tag so the dual-filter UI can slice either way.
const SEEDED_REFERENCES: Array<
  Pick<MehndiReference, "bucket" | "image_url" | "caption" | "vibe">
> = [
  {
    bucket: "full_bridal",
    vibe: "storytelling",
    image_url:
      "https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=720&q=75",
    caption: "Rajasthani full bridal — forearm through fingertips",
  },
  {
    bucket: "full_bridal",
    vibe: "storytelling",
    image_url:
      "https://images.unsplash.com/photo-1594745561149-2211ca8c5d98?w=720&q=75",
    caption: "Bridal portrait panel — couple figures woven in",
  },
  {
    bucket: "arabic",
    vibe: "flowing",
    image_url:
      "https://images.unsplash.com/photo-1601122070922-84e7a0e8a3b6?w=720&q=75",
    caption: "Arabic flowing — elegant negative space",
  },
  {
    bucket: "minimal",
    vibe: "minimal_geometric",
    image_url:
      "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=720&q=75",
    caption: "Minimal — fingertips and wrist",
  },
  {
    bucket: "feet",
    vibe: "feet_legs",
    image_url:
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=720&q=75",
    caption: "Feet — symmetrical motif",
  },
  {
    bucket: "back_of_hand",
    vibe: "dense_traditional",
    image_url:
      "https://images.unsplash.com/photo-1606800052052-a08af7148866?w=720&q=75",
    caption: "Back of hand — peacock medallion",
  },
];

// Default day-of schedule — sourced from lib/defaults/mehendi-timeline so the
// guided Logistics journey and the full workspace seed identical timelines.
import { DEFAULT_MEHENDI_TIMELINE } from "@/lib/defaults/mehendi-timeline";
const DEFAULT_SCHEDULE = DEFAULT_MEHENDI_TIMELINE;

function toggleInArray(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

export const useMehndiStore = create<MehndiState>()(
  persist(
    (set, get) => ({
      briefs: [],
      references: [],
      elements: [],
      wantLists: [],
      stylePrefs: [],
      personalTouchImages: [],
      guestSlots: [],
      vipGuests: [],
      detailedTierGuests: [],
      setups: [],
      scheduleItems: [],
      brideCare: [],
      logisticsChecks: [],
      contractChecklist: [],
      documents: [],
      logisticsJourneyMeta: [],

      // ── Brief ──
      updateBrief: (category_id, body) =>
        set((s) => {
          const existing = s.briefs.find((b) => b.category_id === category_id);
          const next: MehndiBrief = {
            category_id,
            body,
            updated_at: new Date().toISOString(),
          };
          if (existing) {
            return {
              briefs: s.briefs.map((b) =>
                b.category_id === category_id ? next : b,
              ),
            };
          }
          return { briefs: [...s.briefs, next] };
        }),

      // ── References ──
      addReference: (input) => {
        const ref: MehndiReference = {
          id: rid("mref"),
          created_at: new Date().toISOString(),
          reaction: input.reaction ?? "unset",
          source: input.source ?? "user",
          vibe: input.vibe ?? null,
          ...input,
        };
        set((s) => ({ references: [...s.references, ref] }));
        return ref;
      },
      seedSuggestedReferences: (category_id) => {
        const existing = get().references.filter(
          (r) => r.category_id === category_id && r.source === "seed",
        );
        if (existing.length > 0) return;
        const created = SEEDED_REFERENCES.map((tmpl) => ({
          id: rid("mref"),
          category_id,
          ...tmpl,
          reaction: "unset" as const,
          source: "seed" as const,
          created_at: new Date().toISOString(),
        }));
        set((s) => ({ references: [...s.references, ...created] }));
      },
      updateReference: (id, patch) =>
        set((s) => ({
          references: s.references.map((r) =>
            r.id === id ? { ...r, ...patch } : r,
          ),
        })),
      deleteReference: (id) =>
        set((s) => ({ references: s.references.filter((r) => r.id !== id) })),

      // ── Personal elements (legacy) ──
      addElement: (input) => {
        const element: MehndiPersonalElement = {
          ...input,
          id: rid("mel"),
          sort_order:
            input.sort_order ??
            nextOrder(get().elements, input.category_id),
          detail: input.detail ?? "",
        };
        set((s) => ({ elements: [...s.elements, element] }));
        return element;
      },
      updateElement: (id, patch) =>
        set((s) => ({
          elements: s.elements.map((e) =>
            e.id === id ? { ...e, ...patch } : e,
          ),
        })),
      toggleElement: (id) =>
        set((s) => ({
          elements: s.elements.map((e) =>
            e.id === id ? { ...e, selected: !e.selected } : e,
          ),
        })),
      deleteElement: (id) =>
        set((s) => ({ elements: s.elements.filter((e) => e.id !== id) })),

      // ── Want lists (legacy) ──
      updateWantLists: (category_id, patch) =>
        set((s) => {
          const existing = s.wantLists.find(
            (w) => w.category_id === category_id,
          );
          const next = { ...(existing ?? defaultWantLists(category_id)), ...patch };
          if (existing) {
            return {
              wantLists: s.wantLists.map((w) =>
                w.category_id === category_id ? next : w,
              ),
            };
          }
          return { wantLists: [...s.wantLists, next] };
        }),

      // ── Style prefs ──
      updateStylePrefs: (category_id, patch) =>
        set((s) => {
          const existing = s.stylePrefs.find(
            (p) => p.category_id === category_id,
          );
          const next: MehndiStylePrefs = {
            ...(existing ?? defaultStylePrefs(category_id)),
            ...patch,
          };
          if (existing) {
            return {
              stylePrefs: s.stylePrefs.map((p) =>
                p.category_id === category_id ? next : p,
              ),
            };
          }
          return { stylePrefs: [...s.stylePrefs, next] };
        }),
      toggleDirectionLove: (category_id, direction_id) =>
        set((s) => {
          const existing = s.stylePrefs.find(
            (p) => p.category_id === category_id,
          );
          const base = existing ?? defaultStylePrefs(category_id);
          const loved = base.loved_directions.includes(direction_id);
          const next: MehndiStylePrefs = {
            ...base,
            loved_directions: loved
              ? base.loved_directions.filter((d) => d !== direction_id)
              : [...base.loved_directions, direction_id],
            // Clear from pass list if we're loving it now.
            passed_directions: loved
              ? base.passed_directions
              : base.passed_directions.filter((d) => d !== direction_id),
          };
          if (existing) {
            return {
              stylePrefs: s.stylePrefs.map((p) =>
                p.category_id === category_id ? next : p,
              ),
            };
          }
          return { stylePrefs: [...s.stylePrefs, next] };
        }),
      toggleDirectionPass: (category_id, direction_id) =>
        set((s) => {
          const existing = s.stylePrefs.find(
            (p) => p.category_id === category_id,
          );
          const base = existing ?? defaultStylePrefs(category_id);
          const passed = base.passed_directions.includes(direction_id);
          const next: MehndiStylePrefs = {
            ...base,
            passed_directions: passed
              ? base.passed_directions.filter((d) => d !== direction_id)
              : [...base.passed_directions, direction_id],
            loved_directions: passed
              ? base.loved_directions
              : base.loved_directions.filter((d) => d !== direction_id),
          };
          if (existing) {
            return {
              stylePrefs: s.stylePrefs.map((p) =>
                p.category_id === category_id ? next : p,
              ),
            };
          }
          return { stylePrefs: [...s.stylePrefs, next] };
        }),

      // ── Guest slots ──
      addGuestSlot: (input) => {
        const slot: GuestSlot = {
          ...input,
          id: rid("mgs"),
          sort_order:
            input.sort_order ??
            nextOrder(get().guestSlots, input.category_id),
          guest_id: input.guest_id ?? null,
        };
        set((s) => ({ guestSlots: [...s.guestSlots, slot] }));
        return slot;
      },
      updateGuestSlot: (id, patch) =>
        set((s) => ({
          guestSlots: s.guestSlots.map((g) =>
            g.id === id ? { ...g, ...patch } : g,
          ),
        })),
      deleteGuestSlot: (id) =>
        set((s) => ({
          guestSlots: s.guestSlots.filter((g) => g.id !== id),
        })),

      // ── VIP guests ──
      addVipGuest: (input) => {
        const vip: MehndiVipGuest = {
          id: rid("mvip"),
          sort_order:
            input.sort_order ??
            nextOrder(get().vipGuests, input.category_id),
          ...input,
        };
        set((s) => ({ vipGuests: [...s.vipGuests, vip] }));
        return vip;
      },
      updateVipGuest: (id, patch) =>
        set((s) => ({
          vipGuests: s.vipGuests.map((v) =>
            v.id === id ? { ...v, ...patch } : v,
          ),
        })),
      deleteVipGuest: (id) =>
        set((s) => ({ vipGuests: s.vipGuests.filter((v) => v.id !== id) })),
      seedDefaultVipRoster: (category_id) => {
        const existing = get().vipGuests.filter(
          (v) => v.category_id === category_id,
        );
        if (existing.length > 0) return;
        const created = DEFAULT_VIP_ROSTER.map((tmpl, i) => ({
          id: rid("mvip"),
          category_id,
          sort_order: i + 1,
          ...tmpl,
        }));
        set((s) => ({ vipGuests: [...s.vipGuests, ...created] }));
      },

      // ── Detailed-tier guests ──
      addDetailedTierGuest: (input) => {
        const guest: MehndiDetailedTierGuest = {
          id: rid("mdtg"),
          sort_order:
            input.sort_order ??
            nextOrder(get().detailedTierGuests, input.category_id),
          ...input,
        };
        set((s) => ({
          detailedTierGuests: [...s.detailedTierGuests, guest],
        }));
        return guest;
      },
      updateDetailedTierGuest: (id, patch) =>
        set((s) => ({
          detailedTierGuests: s.detailedTierGuests.map((g) =>
            g.id === id ? { ...g, ...patch } : g,
          ),
        })),
      deleteDetailedTierGuest: (id) =>
        set((s) => ({
          detailedTierGuests: s.detailedTierGuests.filter((g) => g.id !== id),
        })),

      // ── Personal-touch images ──
      addPersonalTouchImage: (input) => {
        const img: PersonalTouchImage = {
          id: rid("mpt"),
          created_at: new Date().toISOString(),
          ...input,
        };
        set((s) => ({
          personalTouchImages: [...s.personalTouchImages, img],
        }));
        return img;
      },
      updatePersonalTouchImage: (id, patch) =>
        set((s) => ({
          personalTouchImages: s.personalTouchImages.map((p) =>
            p.id === id ? { ...p, ...patch } : p,
          ),
        })),
      deletePersonalTouchImage: (id) =>
        set((s) => ({
          personalTouchImages: s.personalTouchImages.filter((p) => p.id !== id),
        })),

      // ── Setup ──
      updateSetup: (category_id, patch) =>
        set((s) => {
          const existing = s.setups.find((x) => x.category_id === category_id);
          const next = { ...(existing ?? defaultSetup(category_id)), ...patch };
          if (existing) {
            return {
              setups: s.setups.map((x) =>
                x.category_id === category_id ? next : x,
              ),
            };
          }
          return { setups: [...s.setups, next] };
        }),

      // ── Day-of schedule ──
      addScheduleItem: (input) => {
        const item: ScheduleItem = {
          id: rid("msch"),
          sort_order:
            input.sort_order ??
            nextOrder(get().scheduleItems, input.category_id),
          ...input,
        };
        set((s) => ({ scheduleItems: [...s.scheduleItems, item] }));
        return item;
      },
      seedDefaultSchedule: (category_id) => {
        const existing = get().scheduleItems.filter(
          (i) => i.category_id === category_id,
        );
        if (existing.length > 0) return;
        const items = DEFAULT_SCHEDULE.map((tmpl, i) => ({
          id: rid("msch"),
          category_id,
          sort_order: i + 1,
          ...tmpl,
        }));
        set((s) => ({ scheduleItems: [...s.scheduleItems, ...items] }));
      },
      updateScheduleItem: (id, patch) =>
        set((s) => ({
          scheduleItems: s.scheduleItems.map((i) =>
            i.id === id ? { ...i, ...patch } : i,
          ),
        })),
      deleteScheduleItem: (id) =>
        set((s) => ({
          scheduleItems: s.scheduleItems.filter((i) => i.id !== id),
        })),

      // ── Bride care ──
      updateBrideCare: (category_id, patch) =>
        set((s) => {
          const existing = s.brideCare.find(
            (b) => b.category_id === category_id,
          );
          const next = {
            ...(existing ?? defaultBrideCare(category_id)),
            ...patch,
          };
          if (existing) {
            return {
              brideCare: s.brideCare.map((b) =>
                b.category_id === category_id ? next : b,
              ),
            };
          }
          return { brideCare: [...s.brideCare, next] };
        }),

      // ── Logistics check ──
      updateLogisticsCheck: (category_id, patch) =>
        set((s) => {
          const existing = s.logisticsChecks.find(
            (l) => l.category_id === category_id,
          );
          const next: MehndiLogisticsCheck = {
            ...(existing ?? defaultLogisticsCheck(category_id)),
            ...patch,
          };
          if (existing) {
            return {
              logisticsChecks: s.logisticsChecks.map((l) =>
                l.category_id === category_id ? next : l,
              ),
            };
          }
          return { logisticsChecks: [...s.logisticsChecks, next] };
        }),

      // ── Contract checklist ──
      toggleContractCheck: (category_id, item_id) =>
        set((s) => {
          const existing = s.contractChecklist.find(
            (c) => c.category_id === category_id && c.item_id === item_id,
          );
          if (existing) {
            return {
              contractChecklist: s.contractChecklist.map((c) =>
                c === existing ? { ...c, checked: !c.checked } : c,
              ),
            };
          }
          const fresh: ContractChecklistItem = {
            category_id,
            item_id,
            checked: true,
            notes: "",
          };
          return { contractChecklist: [...s.contractChecklist, fresh] };
        }),
      updateContractNote: (category_id, item_id, notes) =>
        set((s) => {
          const existing = s.contractChecklist.find(
            (c) => c.category_id === category_id && c.item_id === item_id,
          );
          if (existing) {
            return {
              contractChecklist: s.contractChecklist.map((c) =>
                c === existing ? { ...c, notes } : c,
              ),
            };
          }
          const fresh: ContractChecklistItem = {
            category_id,
            item_id,
            checked: false,
            notes,
          };
          return { contractChecklist: [...s.contractChecklist, fresh] };
        }),

      // ── Documents ──
      addDocument: (input) => {
        const doc: MehndiDocument = {
          id: rid("mdoc"),
          created_at: new Date().toISOString(),
          ...input,
        };
        set((s) => ({ documents: [...s.documents, doc] }));
        return doc;
      },
      updateDocument: (id, patch) =>
        set((s) => ({
          documents: s.documents.map((d) =>
            d.id === id ? { ...d, ...patch } : d,
          ),
        })),
      deleteDocument: (id) =>
        set((s) => ({ documents: s.documents.filter((d) => d.id !== id) })),

      // ── Logistics journey meta ──
      updateLogisticsJourneyMeta: (category_id, patch) =>
        set((s) => {
          const existing = s.logisticsJourneyMeta.find(
            (m) => m.category_id === category_id,
          );
          const next: MehndiLogisticsJourneyMeta = {
            ...(existing ?? defaultLogisticsJourneyMeta(category_id)),
            ...patch,
          };
          if (existing) {
            return {
              logisticsJourneyMeta: s.logisticsJourneyMeta.map((m) =>
                m.category_id === category_id ? next : m,
              ),
            };
          }
          return {
            logisticsJourneyMeta: [...s.logisticsJourneyMeta, next],
          };
        }),
    }),
    {
      name: "ananya:mehndi",
      version: 5,
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
      // v1 → v2: dropped design collaboration & aftercare slices.
      // v2 → v3: added stylePrefs, vipGuests, logisticsChecks, contractChecklist.
      // v3 → v4: added bridal coverage fields on stylePrefs, tier capacity +
      // event date/time on setup, personalTouchImages slice, detailedTierGuests
      // slice. Existing rows get back-filled defaults.
      migrate: (persisted, version) => {
        if (!persisted || typeof persisted !== "object") return persisted;
        let state = persisted as Record<string, unknown>;
        if (version < 2) {
          const { assets: _a, revisionNotes: _r, aftercare: _af, ...rest } = state;
          void _a;
          void _r;
          void _af;
          state = rest;
        }
        if (version < 3) {
          // Fold legacy want/avoid textareas into chip arrays on stylePrefs
          // so the rebuilt Story tab shows existing text instead of silently
          // dropping it.
          const legacyWant = Array.isArray(state.wantLists)
            ? (state.wantLists as MehndiWantLists[])
            : [];
          const legacyElements = Array.isArray(state.elements)
            ? (state.elements as MehndiPersonalElement[])
            : [];
          const stylePrefs: MehndiStylePrefs[] = [];
          const seenIds = new Set<string>();
          for (const w of legacyWant) {
            if (seenIds.has(w.category_id)) continue;
            seenIds.add(w.category_id);
            stylePrefs.push({
              ...defaultStylePrefs(w.category_id),
              definitely_want: splitLines(w.want),
              not_for_us: splitLines(w.avoid),
              meaningful_symbols: legacyElements
                .filter(
                  (e) => e.category_id === w.category_id && e.selected,
                )
                .map((e) => e.label),
            });
          }
          state = {
            ...state,
            stylePrefs,
            vipGuests: [],
            logisticsChecks: [],
            contractChecklist: [],
          };
        }
        if (version < 4) {
          const existingPrefs = Array.isArray(state.stylePrefs)
            ? (state.stylePrefs as MehndiStylePrefs[])
            : [];
          const migratedPrefs = existingPrefs.map((p) => ({
            ...defaultStylePrefs(p.category_id),
            ...p,
          }));
          const existingSetups = Array.isArray(state.setups)
            ? (state.setups as EventSetup[])
            : [];
          const migratedSetups = existingSetups.map((s) => ({
            ...defaultSetup(s.category_id),
            ...s,
            tier_capacity:
              s.tier_capacity ?? { quick: 30, classic: 15, detailed: 5 },
            event_date: s.event_date ?? "",
            event_start_time: s.event_start_time ?? "14:00",
          }));
          state = {
            ...state,
            stylePrefs: migratedPrefs,
            setups: migratedSetups,
            personalTouchImages: [],
            detailedTierGuests: [],
          };
        }
        if (version < 5) {
          // v4 → v5: add logisticsJourneyMeta slice for the new Logistics
          // guided journey. Existing rows get their meta back-filled lazily
          // on first interaction.
          state = { ...state, logisticsJourneyMeta: [] };
        }
        return state;
      },
    },
  ),
);

let _mehndiSyncTimer: ReturnType<typeof setTimeout> | null = null;
useMehndiStore.subscribe((state) => {
  if (_mehndiSyncTimer) clearTimeout(_mehndiSyncTimer);
  _mehndiSyncTimer = setTimeout(() => {
    const coupleId = getCurrentCoupleId();
    if (!coupleId) return;
    const { briefs, references, stylePrefs, personalTouchImages, guestSlots, vipGuests, detailedTierGuests, setups, scheduleItems, brideCare, logisticsChecks, contractChecklist, documents, logisticsJourneyMeta } = state;
    dbUpsert("mehndi_state", { couple_id: coupleId, briefs, references, style_prefs: stylePrefs, personal_touch_images: personalTouchImages, guest_slots: guestSlots, vip_guests: vipGuests, detailed_tier_guests: detailedTierGuests, setups, schedule_items: scheduleItems, bride_care: brideCare, logistics_checks: logisticsChecks, contract_checklist: contractChecklist, documents, logistics_journey_meta: logisticsJourneyMeta });
  }, 600);
});

function splitLines(raw: string | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

// ── Capacity math helpers ──────────────────────────────────────────────────
// Math itself lives in lib/calculators/mehendi-capacity.ts so the guided
// Logistics journey calls the same code as the full workspace.

import {
  computeMehendiCapacity,
  type CapacityResult,
} from "@/lib/calculators/mehendi-capacity";

export type CapacityCalc = CapacityResult;

export function computeCapacity(setup: EventSetup): CapacityCalc {
  return computeMehendiCapacity({
    artistCount: setup.stations,
    hoursOnSite: setup.event_duration_hours,
    expectedGuests: setup.expected_guest_count,
    defaultTier: setup.avg_tier,
  });
}

export type { SchedulingMode, VibeTag };
