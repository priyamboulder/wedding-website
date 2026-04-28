// Guest category tagging store. Categories are persisted to localStorage
// (ananya.guest-categories) like every other Ananya surface; guests store
// category *names* in their `categories: string[]` field, so rename/delete
// must be mirrored onto guest records by the page layer.
//
// First-run: if nothing is persisted yet, we lazily seed from
// DEFAULT_GUEST_CATEGORIES via `ensureSeed()`, which is called once from the
// guests page on mount. That way an empty list after a full user wipe stays
// empty instead of repopulating on every render.

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { dbUpsert, getCurrentCoupleId } from "@/lib/supabase/db-sync";
import {
  DEFAULT_GUEST_CATEGORIES,
  type GuestCategoryColor,
} from "@/lib/guest-categories-seed";

export interface GuestCategory {
  id: string;
  name: string;
  color: GuestCategoryColor;
  order: number;
}

interface GuestCategoriesState {
  categories: GuestCategory[];
  hasSeeded: boolean;

  ensureSeed: () => void;
  addCategory: (name: string, color: GuestCategoryColor) => GuestCategory | null;
  updateCategory: (
    id: string,
    patch: { name?: string; color?: GuestCategoryColor },
  ) => { oldName: string; newName: string } | null;
  deleteCategory: (id: string) => { removedName: string } | null;
  reorderCategories: (orderedIds: string[]) => void;
  getByName: (name: string) => GuestCategory | undefined;
  // Collapse 2+ categories into one. The first id in sourceIds is the
  // surviving record (its id is preserved); the rest are removed. The
  // surviving record is renamed/recolored to the given target. Returns the
  // list of absorbed names and the final surviving name so the page layer
  // can rewrite guest `categories` arrays.
  mergeCategories: (
    sourceIds: string[],
    targetName: string,
    targetColor: GuestCategoryColor,
  ) => { survivingName: string; absorbedNames: string[] } | null;
  // Replace a single category with N new categories. Does not touch guest
  // records — the page layer assigns guests to the new buckets.
  splitCategory: (
    sourceId: string,
    buckets: Array<{ name: string; color: GuestCategoryColor }>,
  ) => { removedName: string; created: GuestCategory[] } | null;
  // Overwrite the full categories list. Used to reverse a merge or split
  // from an undo toast — we snapshot before mutating and restore wholesale.
  restoreCategories: (list: GuestCategory[]) => void;
}

function makeId(): string {
  return `cat-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

function normalize(name: string): string {
  return name.trim();
}

export const useGuestCategoriesStore = create<GuestCategoriesState>()(
  persist(
    (set, get) => ({
      categories: [],
      hasSeeded: false,

      ensureSeed: () => {
        if (get().hasSeeded) return;
        const seeded: GuestCategory[] = DEFAULT_GUEST_CATEGORIES.map(
          (s, i) => ({
            id: makeId(),
            name: s.name,
            color: s.color,
            order: i,
          }),
        );
        set({ categories: seeded, hasSeeded: true });
      },

      addCategory: (name, color) => {
        const clean = normalize(name);
        if (!clean) return null;
        const exists = get().categories.some(
          (c) => c.name.toLowerCase() === clean.toLowerCase(),
        );
        if (exists) return null;
        const next: GuestCategory = {
          id: makeId(),
          name: clean,
          color,
          order: get().categories.length,
        };
        set((s) => ({ categories: [...s.categories, next] }));
        return next;
      },

      updateCategory: (id, patch) => {
        const current = get().categories.find((c) => c.id === id);
        if (!current) return null;
        const nextName =
          patch.name != null ? normalize(patch.name) : current.name;
        if (!nextName) return null;
        // Block rename into an existing name (case-insensitive, ignoring self)
        if (
          nextName.toLowerCase() !== current.name.toLowerCase() &&
          get().categories.some(
            (c) => c.id !== id && c.name.toLowerCase() === nextName.toLowerCase(),
          )
        ) {
          return null;
        }
        set((s) => ({
          categories: s.categories.map((c) =>
            c.id === id
              ? {
                  ...c,
                  name: nextName,
                  color: patch.color ?? c.color,
                }
              : c,
          ),
        }));
        return { oldName: current.name, newName: nextName };
      },

      deleteCategory: (id) => {
        const current = get().categories.find((c) => c.id === id);
        if (!current) return null;
        set((s) => ({
          categories: s.categories
            .filter((c) => c.id !== id)
            .map((c, i) => ({ ...c, order: i })),
        }));
        return { removedName: current.name };
      },

      reorderCategories: (orderedIds) => {
        set((s) => {
          const byId = new Map(s.categories.map((c) => [c.id, c]));
          const next: GuestCategory[] = [];
          orderedIds.forEach((id, i) => {
            const c = byId.get(id);
            if (c) next.push({ ...c, order: i });
          });
          // Preserve any categories not present in orderedIds at the tail
          s.categories.forEach((c) => {
            if (!orderedIds.includes(c.id)) {
              next.push({ ...c, order: next.length });
            }
          });
          return { categories: next };
        });
      },

      getByName: (name) => {
        const lookup = name.toLowerCase();
        return get().categories.find((c) => c.name.toLowerCase() === lookup);
      },

      mergeCategories: (sourceIds, targetName, targetColor) => {
        if (!Array.isArray(sourceIds) || sourceIds.length < 2) return null;
        const clean = normalize(targetName);
        if (!clean) return null;
        const current = get().categories;
        const sources = sourceIds
          .map((id) => current.find((c) => c.id === id))
          .filter((c): c is GuestCategory => Boolean(c));
        if (sources.length !== sourceIds.length) return null;
        // Keep at least 1 category overall (merge shrinks N → 1, so we're fine
        // unless the caller tried to merge every category and the new name
        // collides with an existing non-source — which we block below).
        const sourceIdSet = new Set(sourceIds);
        const survivingId = sourceIds[0];
        const nameCollision = current.some(
          (c) =>
            !sourceIdSet.has(c.id) &&
            c.name.toLowerCase() === clean.toLowerCase(),
        );
        if (nameCollision) return null;
        const absorbed = sources.filter((c) => c.id !== survivingId);
        const absorbedNames = absorbed.map((c) => c.name);
        set((s) => {
          const next = s.categories
            .filter((c) => c.id === survivingId || !sourceIdSet.has(c.id))
            .map((c) =>
              c.id === survivingId
                ? { ...c, name: clean, color: targetColor }
                : c,
            );
          // Reindex order so gaps from the removed entries close up.
          const reindexed = [...next]
            .sort((a, b) => a.order - b.order)
            .map((c, i) => ({ ...c, order: i }));
          return { categories: reindexed };
        });
        return { survivingName: clean, absorbedNames };
      },

      splitCategory: (sourceId, buckets) => {
        const current = get().categories;
        const source = current.find((c) => c.id === sourceId);
        if (!source) return null;
        if (!Array.isArray(buckets) || buckets.length < 1) return null;
        const cleanBuckets = buckets.map((b) => ({
          name: normalize(b.name),
          color: b.color,
        }));
        if (cleanBuckets.some((b) => !b.name)) return null;
        // Bucket names must be unique among themselves (case-insensitive).
        const seen = new Set<string>();
        for (const b of cleanBuckets) {
          const key = b.name.toLowerCase();
          if (seen.has(key)) return null;
          seen.add(key);
        }
        // And must not collide with any OTHER existing category. (Colliding
        // with the source itself is fine — it's being removed.)
        const collision = cleanBuckets.some((b) =>
          current.some(
            (c) =>
              c.id !== sourceId &&
              c.name.toLowerCase() === b.name.toLowerCase(),
          ),
        );
        if (collision) return null;
        const created: GuestCategory[] = cleanBuckets.map((b) => ({
          id: makeId(),
          name: b.name,
          color: b.color,
          order: 0, // set after splice
        }));
        set((s) => {
          // Insert new categories at the source's original position so the
          // grid visually keeps the split cluster together.
          const sorted = [...s.categories].sort((a, b) => a.order - b.order);
          const idx = sorted.findIndex((c) => c.id === sourceId);
          const before = idx === -1 ? sorted : sorted.slice(0, idx);
          const after = idx === -1 ? [] : sorted.slice(idx + 1);
          const merged = [...before, ...created, ...after].filter(
            (c) => c.id !== sourceId,
          );
          return {
            categories: merged.map((c, i) => ({ ...c, order: i })),
          };
        });
        // Return the created entries with their final order values.
        const afterState = get().categories;
        const createdFinal = created.map(
          (c) => afterState.find((x) => x.id === c.id) ?? c,
        );
        return { removedName: source.name, created: createdFinal };
      },

      restoreCategories: (list) => {
        set({
          categories: [...list].sort((a, b) => a.order - b.order),
        });
      },
    }),
    {
      name: "ananya.guest-categories",
      storage: createJSONStorage(() => (typeof window !== "undefined" ? localStorage : { getItem: () => null, setItem: () => {}, removeItem: () => {} })),
      version: 1,
    },
  ),
);

let _guestCategoriesSyncTimer: ReturnType<typeof setTimeout> | null = null;
useGuestCategoriesStore.subscribe((state) => {
  if (_guestCategoriesSyncTimer) clearTimeout(_guestCategoriesSyncTimer);
  _guestCategoriesSyncTimer = setTimeout(() => {
    const coupleId = getCurrentCoupleId();
    if (!coupleId) return;
    dbUpsert("guest_categories_state", { couple_id: coupleId, data: state as unknown });
  }, 600);
});
