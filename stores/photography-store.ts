// ── Photography-specific store ─────────────────────────────────────────────
// Backs the purpose-built photography tabs: Shot List, VIPs & Family, Ritual
// Moments, Day-of Schedule, Crew, Deliverables. Lives separately from the
// generic workspace-store so evolving photography tabs doesn't ripple into
// every other category.

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { dbUpsert, getCurrentCoupleId } from "@/lib/supabase/db-sync";
import type {
  PhotoCrewMember,
  PhotoCustomEvent,
  PhotoDayOfSlot,
  PhotoDeliverable,
  PhotoGroupShot,
  PhotoRitual,
  PhotoShot,
  PhotoVIP,
} from "@/types/photography";
import {
  SEED_PHOTO_CREW,
  SEED_PHOTO_DAY_OF,
  SEED_PHOTO_DELIVERABLES,
  SEED_PHOTO_RITUALS,
  SEED_PHOTO_SHOTS,
  SEED_PHOTO_VIPS,
} from "@/lib/photography-seed";

interface PhotographyState {
  shots: PhotoShot[];
  vips: PhotoVIP[];
  groupShots: PhotoGroupShot[];
  rituals: PhotoRitual[];
  day_of: PhotoDayOfSlot[];
  crew: PhotoCrewMember[];
  deliverables: PhotoDeliverable[];
  // Keyed by suggestion.key; value is the ms-epoch the user dismissed it.
  // Dismissals expire after 7 days (enforced in the consumer).
  dismissedSuggestions: Record<string, number>;
  // User-defined events appended to PHOTO_EVENTS in the Shot List slider.
  customEvents: PhotoCustomEvent[];

  // Shots
  addShot: (shot: Omit<PhotoShot, "id" | "sort_order"> & { sort_order?: number }) => PhotoShot;
  updateShot: (id: string, patch: Partial<PhotoShot>) => void;
  deleteShot: (id: string) => void;
  reorderShot: (id: string, direction: "up" | "down") => void;
  toggleShotChecked: (id: string) => void;

  // Suggestions
  dismissSuggestion: (key: string) => void;
  dismissSuggestionsBulk: (keys: string[]) => void;

  // Custom events
  addCustomEvent: (label: string) => PhotoCustomEvent;
  deleteCustomEvent: (id: string) => void;

  // VIPs
  addVIP: (vip: Omit<PhotoVIP, "id" | "sort_order"> & { sort_order?: number }) => PhotoVIP;
  updateVIP: (id: string, patch: Partial<PhotoVIP>) => void;
  deleteVIP: (id: string) => void;

  // Group shots (family/friend combinations)
  addGroupShot: (
    input: Omit<PhotoGroupShot, "id" | "sort_order"> & { sort_order?: number },
  ) => PhotoGroupShot;
  updateGroupShot: (id: string, patch: Partial<PhotoGroupShot>) => void;
  deleteGroupShot: (id: string) => void;

  // Rituals
  addRitual: (ritual: Omit<PhotoRitual, "id" | "sort_order"> & { sort_order?: number }) => PhotoRitual;
  updateRitual: (id: string, patch: Partial<PhotoRitual>) => void;
  deleteRitual: (id: string) => void;
  toggleRitualApplies: (id: string) => void;

  // Day-of
  addDayOf: (slot: Omit<PhotoDayOfSlot, "id" | "sort_order"> & { sort_order?: number }) => PhotoDayOfSlot;
  updateDayOf: (id: string, patch: Partial<PhotoDayOfSlot>) => void;
  deleteDayOf: (id: string) => void;

  // Crew
  addCrew: (member: Omit<PhotoCrewMember, "id" | "sort_order"> & { sort_order?: number }) => PhotoCrewMember;
  updateCrew: (id: string, patch: Partial<PhotoCrewMember>) => void;
  deleteCrew: (id: string) => void;

  // Deliverables
  addDeliverable: (d: Omit<PhotoDeliverable, "id" | "sort_order"> & { sort_order?: number }) => PhotoDeliverable;
  updateDeliverable: (id: string, patch: Partial<PhotoDeliverable>) => void;
  deleteDeliverable: (id: string) => void;
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

export const usePhotographyStore = create<PhotographyState>()(
  persist(
    (set) => ({
      shots: SEED_PHOTO_SHOTS,
      vips: SEED_PHOTO_VIPS,
      groupShots: [],
      rituals: SEED_PHOTO_RITUALS,
      day_of: SEED_PHOTO_DAY_OF,
      crew: SEED_PHOTO_CREW,
      deliverables: SEED_PHOTO_DELIVERABLES,
      dismissedSuggestions: {},
      customEvents: [],

      addShot: (input) => {
        const shot: PhotoShot = {
          id: rid("psh"),
          sort_order: input.sort_order ?? 0,
          ...input,
        };
        set((s) => {
          const order = input.sort_order ?? nextOrder(s.shots, input.category_id);
          return { shots: [...s.shots, { ...shot, sort_order: order }] };
        });
        return shot;
      },
      updateShot: (id, patch) =>
        set((s) => ({
          shots: s.shots.map((x) => (x.id === id ? { ...x, ...patch } : x)),
        })),
      deleteShot: (id) =>
        set((s) => ({ shots: s.shots.filter((x) => x.id !== id) })),
      reorderShot: (id, direction) =>
        set((s) => {
          const shot = s.shots.find((x) => x.id === id);
          if (!shot) return {};
          const peers = s.shots
            .filter((x) => x.category_id === shot.category_id && x.event === shot.event)
            .sort((a, b) => a.sort_order - b.sort_order);
          const idx = peers.findIndex((x) => x.id === id);
          const swapIdx = direction === "up" ? idx - 1 : idx + 1;
          if (swapIdx < 0 || swapIdx >= peers.length) return {};
          const swap = peers[swapIdx];
          return {
            shots: s.shots.map((x) => {
              if (x.id === shot.id) return { ...x, sort_order: swap.sort_order };
              if (x.id === swap.id) return { ...x, sort_order: shot.sort_order };
              return x;
            }),
          };
        }),
      toggleShotChecked: (id) =>
        set((s) => ({
          shots: s.shots.map((x) =>
            x.id === id ? { ...x, checked: !x.checked } : x,
          ),
        })),

      dismissSuggestion: (key) =>
        set((s) => ({
          dismissedSuggestions: { ...s.dismissedSuggestions, [key]: Date.now() },
        })),
      dismissSuggestionsBulk: (keys) =>
        set((s) => {
          const now = Date.now();
          const next = { ...s.dismissedSuggestions };
          for (const k of keys) next[k] = now;
          return { dismissedSuggestions: next };
        }),

      addCustomEvent: (label) => {
        const event: PhotoCustomEvent = {
          id: rid("pev"),
          label: label.trim() || "Untitled event",
        };
        set((s) => ({ customEvents: [...s.customEvents, event] }));
        return event;
      },
      deleteCustomEvent: (id) =>
        set((s) => ({
          customEvents: s.customEvents.filter((e) => e.id !== id),
          shots: s.shots.filter((shot) => shot.event !== id),
        })),

      addVIP: (input) => {
        const vip: PhotoVIP = {
          id: rid("pvip"),
          sort_order: input.sort_order ?? 0,
          ...input,
        };
        set((s) => {
          const order = input.sort_order ?? nextOrder(s.vips, input.category_id);
          return { vips: [...s.vips, { ...vip, sort_order: order }] };
        });
        return vip;
      },
      updateVIP: (id, patch) =>
        set((s) => ({
          vips: s.vips.map((x) => (x.id === id ? { ...x, ...patch } : x)),
        })),
      deleteVIP: (id) =>
        set((s) => ({
          vips: s.vips.filter((x) => x.id !== id),
          shots: s.shots.map((shot) =>
            shot.vip_ids.includes(id)
              ? { ...shot, vip_ids: shot.vip_ids.filter((v) => v !== id) }
              : shot,
          ),
          groupShots: s.groupShots.map((g) =>
            g.vip_ids.includes(id)
              ? { ...g, vip_ids: g.vip_ids.filter((v) => v !== id) }
              : g,
          ),
        })),

      addGroupShot: (input) => {
        const group: PhotoGroupShot = {
          id: rid("pgs"),
          sort_order: input.sort_order ?? 0,
          ...input,
        };
        set((s) => {
          const order =
            input.sort_order ?? nextOrder(s.groupShots, input.category_id);
          return { groupShots: [...s.groupShots, { ...group, sort_order: order }] };
        });
        return group;
      },
      updateGroupShot: (id, patch) =>
        set((s) => ({
          groupShots: s.groupShots.map((x) =>
            x.id === id ? { ...x, ...patch } : x,
          ),
        })),
      deleteGroupShot: (id) =>
        set((s) => ({ groupShots: s.groupShots.filter((x) => x.id !== id) })),

      addRitual: (input) => {
        const ritual: PhotoRitual = {
          id: rid("prt"),
          sort_order: input.sort_order ?? 0,
          ...input,
        };
        set((s) => {
          const order = input.sort_order ?? nextOrder(s.rituals, input.category_id);
          return { rituals: [...s.rituals, { ...ritual, sort_order: order }] };
        });
        return ritual;
      },
      updateRitual: (id, patch) =>
        set((s) => ({
          rituals: s.rituals.map((x) => (x.id === id ? { ...x, ...patch } : x)),
        })),
      deleteRitual: (id) =>
        set((s) => ({ rituals: s.rituals.filter((x) => x.id !== id) })),
      toggleRitualApplies: (id) =>
        set((s) => ({
          rituals: s.rituals.map((x) =>
            x.id === id ? { ...x, applies: !x.applies } : x,
          ),
        })),

      addDayOf: (input) => {
        const slot: PhotoDayOfSlot = {
          id: rid("pds"),
          sort_order: input.sort_order ?? 0,
          ...input,
        };
        set((s) => {
          const order = input.sort_order ?? nextOrder(s.day_of, input.category_id);
          return { day_of: [...s.day_of, { ...slot, sort_order: order }] };
        });
        return slot;
      },
      updateDayOf: (id, patch) =>
        set((s) => ({
          day_of: s.day_of.map((x) => (x.id === id ? { ...x, ...patch } : x)),
        })),
      deleteDayOf: (id) =>
        set((s) => ({ day_of: s.day_of.filter((x) => x.id !== id) })),

      addCrew: (input) => {
        const member: PhotoCrewMember = {
          id: rid("pcrew"),
          sort_order: input.sort_order ?? 0,
          ...input,
        };
        set((s) => {
          const order = input.sort_order ?? nextOrder(s.crew, input.category_id);
          return { crew: [...s.crew, { ...member, sort_order: order }] };
        });
        return member;
      },
      updateCrew: (id, patch) =>
        set((s) => ({
          crew: s.crew.map((x) => (x.id === id ? { ...x, ...patch } : x)),
        })),
      deleteCrew: (id) =>
        set((s) => ({ crew: s.crew.filter((x) => x.id !== id) })),

      addDeliverable: (input) => {
        const d: PhotoDeliverable = {
          id: rid("pdl"),
          sort_order: input.sort_order ?? 0,
          ...input,
        };
        set((s) => {
          const order = input.sort_order ?? nextOrder(s.deliverables, input.category_id);
          return { deliverables: [...s.deliverables, { ...d, sort_order: order }] };
        });
        return d;
      },
      updateDeliverable: (id, patch) =>
        set((s) => ({
          deliverables: s.deliverables.map((x) =>
            x.id === id ? { ...x, ...patch } : x,
          ),
        })),
      deleteDeliverable: (id) =>
        set((s) => ({
          deliverables: s.deliverables.filter((x) => x.id !== id),
        })),
    }),
    {
      name: "ananya:photography",
      version: 4,
      // v1 → v2: shot list adds `moment`, `checked`, and drawer fields.
      // For pre-existing shots that match a seed row by id, backfill the
      // seed's `moment` so the grouped Shot List doesn't drop them into an
      // "Other" bucket on first load after upgrade.
      // v2 → v3: user-defined events appended to PHOTO_EVENTS.
      migrate: (persisted, version) => {
        const state = persisted as Partial<PhotographyState> & {
          shots?: PhotoShot[];
        };
        if (version < 2) {
          const seedByCurrId = new Map(
            SEED_PHOTO_SHOTS.map((s) => [s.id, s]),
          );
          state.shots = (state.shots ?? []).map((s) => {
            if (s.moment) return s;
            const seed = seedByCurrId.get(s.id);
            return seed ? { ...s, moment: seed.moment } : s;
          });
          if (!state.dismissedSuggestions) state.dismissedSuggestions = {};
        }
        if (version < 3) {
          if (!state.customEvents) state.customEvents = [];
        }
        if (version < 4) {
          if (!state.groupShots) state.groupShots = [];
        }
        return state as PhotographyState;
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

let _photoSyncTimer: ReturnType<typeof setTimeout> | null = null;
usePhotographyStore.subscribe((state) => {
  if (_photoSyncTimer) clearTimeout(_photoSyncTimer);
  _photoSyncTimer = setTimeout(() => {
    const coupleId = getCurrentCoupleId();
    if (!coupleId) return;
    const { shots, vips, groupShots, rituals, day_of, crew, deliverables, dismissedSuggestions, customEvents } = state;
    dbUpsert("photography_state", { couple_id: coupleId, shots, vips, group_shots: groupShots, rituals, day_of, crew, deliverables, dismissed_suggestions: dismissedSuggestions, custom_events: customEvents });
  }, 600);
});
