"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { v4 as uuid } from "uuid";
import type { CreatorDrop, DropItem, DropSave } from "@/types/drop";
import { getDropTimingStatus } from "@/types/drop";
import { dbUpsert, getCurrentCoupleId } from "@/lib/supabase/db-sync";

interface CreateDropInput {
  creatorId: string;
  title: string;
  description: string;
  themeTag: string;
  coverImageUrl: string;
  accentColor: string;
  startsAt: string;
  endsAt: string;
  module: string;
  items: { productId: string; creatorNote?: string | null }[];
}

interface DropsState {
  drops: CreatorDrop[];
  items: DropItem[];
  saves: DropSave[];

  // Reads
  listDrops: () => CreatorDrop[];
  getDrop: (id: string) => CreatorDrop | undefined;
  getDropBySlug: (slug: string) => CreatorDrop | undefined;
  getItems: (dropId: string) => DropItem[];
  getDropsByCreator: (creatorId: string) => CreatorDrop[];
  getActiveDrops: () => CreatorDrop[];
  getUpcomingDrops: () => CreatorDrop[];
  getExpiredDrops: () => CreatorDrop[];
  getActiveDropForProduct: (productId: string) => CreatorDrop | null;

  // Saves
  isSaved: (dropId: string) => boolean;
  toggleSave: (dropId: string) => void;

  // Mutations
  createDrop: (input: CreateDropInput) => CreatorDrop;
  archiveDrop: (id: string) => void;
  trackView: (id: string) => void;
}

type PersistedSlice = Pick<DropsState, "drops" | "items" | "saves">;

const nowIso = () => new Date().toISOString();

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

export const useDropsStore = create<DropsState>()(
  persist(
    (set, get) => ({
      drops: [],
      items: [],
      saves: [],

      listDrops: () => get().drops,
      getDrop: (id) => get().drops.find((d) => d.id === id),
      getDropBySlug: (slug) => get().drops.find((d) => d.slug === slug),
      getItems: (dropId) =>
        get()
          .items.filter((i) => i.dropId === dropId)
          .sort((a, b) => a.sortOrder - b.sortOrder),
      getDropsByCreator: (creatorId) =>
        get().drops.filter((d) => d.creatorId === creatorId),
      getActiveDrops: () =>
        get().drops.filter((d) => getDropTimingStatus(d) === "active"),
      getUpcomingDrops: () =>
        get().drops.filter((d) => getDropTimingStatus(d) === "scheduled"),
      getExpiredDrops: () =>
        get().drops.filter((d) => getDropTimingStatus(d) === "expired"),
      getActiveDropForProduct: (productId) => {
        const active = get()
          .drops.filter((d) => getDropTimingStatus(d) === "active");
        for (const drop of active) {
          if (
            get().items.some(
              (i) => i.dropId === drop.id && i.productId === productId,
            )
          ) {
            return drop;
          }
        }
        return null;
      },

      isSaved: (dropId) => get().saves.some((s) => s.dropId === dropId),
      toggleSave: (dropId) =>
        set((state) => {
          const exists = state.saves.some((s) => s.dropId === dropId);
          if (exists) {
            return { saves: state.saves.filter((s) => s.dropId !== dropId) };
          }
          // Bump the save count locally so the UI reflects the change.
          const drops = state.drops.map((d) =>
            d.id === dropId ? { ...d, saveCount: d.saveCount + 1 } : d,
          );
          return {
            drops,
            saves: [...state.saves, { dropId, savedAt: nowIso() }],
          };
        }),

      createDrop: (input) => {
        const id = `drop-${uuid().slice(0, 8)}`;
        const slug = `${slugify(input.title)}-${id.slice(-4)}`;
        const drop: CreatorDrop = {
          id,
          slug,
          creatorId: input.creatorId,
          title: input.title,
          description: input.description,
          themeTag: input.themeTag,
          coverImageUrl: input.coverImageUrl,
          accentColor: input.accentColor,
          startsAt: input.startsAt,
          endsAt: input.endsAt,
          status:
            new Date(input.startsAt).getTime() > Date.now()
              ? "scheduled"
              : "active",
          module: input.module,
          viewCount: 0,
          saveCount: 0,
          createdAt: nowIso(),
          updatedAt: nowIso(),
        };
        const newItems: DropItem[] = input.items.map((it, idx) => ({
          id: `di-${uuid().slice(0, 8)}`,
          dropId: id,
          productId: it.productId,
          creatorNote: it.creatorNote ?? null,
          sortOrder: idx + 1,
        }));
        set((state) => ({
          drops: [drop, ...state.drops],
          items: [...state.items, ...newItems],
        }));
        return drop;
      },

      archiveDrop: (id) =>
        set((state) => ({
          drops: state.drops.map((d) =>
            d.id === id
              ? { ...d, status: "archived", updatedAt: nowIso() }
              : d,
          ),
        })),

      trackView: (id) =>
        set((state) => ({
          drops: state.drops.map((d) =>
            d.id === id ? { ...d, viewCount: d.viewCount + 1 } : d,
          ),
        })),
    }),
    {
      name: "ananya-drops",
      storage: createJSONStorage(() => {
        if (typeof window === "undefined") {
          return {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          };
        }
        return window.localStorage;
      }),
      version: 1,
      partialize: (state): PersistedSlice => ({
        drops: state.drops,
        items: state.items,
        saves: state.saves,
      }),
    },
  ),
);

let _dropsSyncTimer: ReturnType<typeof setTimeout> | null = null;
useDropsStore.subscribe((state) => {
  if (_dropsSyncTimer) clearTimeout(_dropsSyncTimer);
  _dropsSyncTimer = setTimeout(() => {
    const coupleId = getCurrentCoupleId();
    if (!coupleId) return;
    dbUpsert("drops_state", { couple_id: coupleId, data: state as unknown });
  }, 600);
});
