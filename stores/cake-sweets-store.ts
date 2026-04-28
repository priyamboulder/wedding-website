// ── Cake & Sweets workspace store ──────────────────────────────────────────
// All discovery-first state for the cake & dessert workspace. Lives separate
// from workspace-store so we can iterate without touching the shared polymorphic
// items table. Persisted to localStorage via zustand/persist.
//
// Scope: flavor-profile quiz, tradition preference, couple's favorite
// desserts, allergen flags, cake inspiration reactions, mithai catalog
// reactions + per-item overrides (quantity, dietary), dessert-table display
// configuration, cutting ceremony song choice, interactive tasting sessions.

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { dbUpsert, getCurrentCoupleId } from "@/lib/supabase/db-sync";
import type { DessertReaction, AllergenOption } from "@/lib/cake-sweets-seed";

// ── Types ──────────────────────────────────────────────────────────────────

export type AllergenId = AllergenOption["id"];
export type TraditionId = "mithai" | "western" | "fusion";
export type WouldServe = "yes" | "maybe" | "no";

export interface FlavorProfileState {
  sweetness: number;                  // 0 "just a hint" → 100 "bring on the sugar"
  flavor_reactions: Record<string, DessertReaction>; // FLAVOR_PROFILES id → reaction
  tradition: TraditionId | null;
  bride_favorite: string;
  groom_favorite: string;
}

export interface AllergenState {
  flags: Record<AllergenId, boolean>;
  notes: string;
}

// Per-loved-dessert couple-editable overrides.
export interface DessertLovedMeta {
  quantity?: string;      // free-form: "5 kg", "100 pieces", "1 station"
  dietary?: AllergenId[]; // per-item dietary flags (e.g. vegan variant)
  custom?: boolean;       // true if added manually, not from catalog
  name?: string;          // for custom items
  description?: string;
}

// Dessert-table display configuration per loved item.
export interface DessertTableConfig {
  display_style?: string;        // id from DISPLAY_STYLES
  quantity?: string;             // on-table qty (may differ from procurement)
  placement?: string;            // "center of long table", etc.
}

// Cake-cutting song pick (per couple; single selection).
export interface CuttingSongPick {
  song_id?: string;              // id from SUGGESTED_CUTTING_SONGS
  custom_title?: string;
  custom_artist?: string;
  notes?: string;
}

// Interactive tasting session.
export interface TastingSample {
  id: string;
  name: string;                  // flavor / sample name
  rating: number;                // 0..4 (Meh → THIS IS THE ONE)
  sweetness: number;             // 0..100
  textures: string[];            // TEXTURE_OPTIONS ids
  would_serve: WouldServe | null;
  photo_url?: string;
  notes: string;
}

export interface TastingSession {
  id: string;
  date: string;                  // yyyy-mm-dd
  vendor: string;
  samples: TastingSample[];
  overall_rating: number;        // 0..5
  would_book: WouldServe | null;
  notes: string;
  created_at: string;
}

// ── Store shape ────────────────────────────────────────────────────────────

interface CakeSweetsState {
  flavor: FlavorProfileState;
  allergens: AllergenState;

  // Reactions by entity id. A single "love" or "not_this" per id (toggle).
  cake_inspirations: Record<string, DessertReaction>;
  dessert_catalog: Record<string, DessertReaction>;

  // Custom dessert additions + overrides on loved items (quantity, diet).
  dessert_meta: Record<string, DessertLovedMeta>;

  // Dessert-table display config per dessert id (catalog or custom).
  table_config: Record<string, DessertTableConfig>;

  // Cake-cutting song.
  cutting_song: CuttingSongPick;

  // Tasting sessions (newest first by date).
  tasting_sessions: TastingSession[];

  // ── Flavor-profile actions ─────────────────────────────────────────────
  setSweetness: (v: number) => void;
  setFlavorReaction: (flavorId: string, r: DessertReaction | null) => void;
  setTradition: (t: TraditionId | null) => void;
  setBrideFavorite: (v: string) => void;
  setGroomFavorite: (v: string) => void;

  // ── Allergens ──────────────────────────────────────────────────────────
  toggleAllergen: (id: AllergenId) => void;
  setAllergenNotes: (v: string) => void;

  // ── Cake inspirations + dessert catalog reactions ──────────────────────
  reactCake: (id: string, r: DessertReaction) => void;
  reactDessert: (id: string, r: DessertReaction) => void;

  // ── Custom desserts + per-item meta overrides ──────────────────────────
  addCustomDessert: (name: string, description?: string) => string;
  setDessertMeta: (id: string, patch: Partial<DessertLovedMeta>) => void;
  removeCustomDessert: (id: string) => void;

  // ── Dessert-table config ───────────────────────────────────────────────
  setTableConfig: (dessertId: string, patch: Partial<DessertTableConfig>) => void;

  // ── Cutting song ───────────────────────────────────────────────────────
  pickCuttingSong: (patch: Partial<CuttingSongPick>) => void;
  clearCuttingSong: () => void;

  // ── Tastings ───────────────────────────────────────────────────────────
  addTastingSession: (seed?: Partial<TastingSession>) => string;
  updateTastingSession: (id: string, patch: Partial<TastingSession>) => void;
  deleteTastingSession: (id: string) => void;
  addTastingSample: (sessionId: string, seed?: Partial<TastingSample>) => string;
  updateTastingSample: (
    sessionId: string,
    sampleId: string,
    patch: Partial<TastingSample>,
  ) => void;
  deleteTastingSample: (sessionId: string, sampleId: string) => void;

  // ── Selectors ──────────────────────────────────────────────────────────
  lovedCatalogIds: () => string[];
  lovedInspirationIds: () => string[];
  activeAllergens: () => AllergenId[];
}

const now = () => new Date().toISOString();
const rid = (p: string) =>
  `${p}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

const DEFAULT_ALLERGENS: AllergenState = {
  flags: {
    nut_free: false,
    gluten_free: false,
    dairy_free: false,
    egg_free: false,
    soy_free: false,
    vegan: false,
  },
  notes: "",
};

const DEFAULT_FLAVOR: FlavorProfileState = {
  sweetness: 55,
  flavor_reactions: {},
  tradition: null,
  bride_favorite: "",
  groom_favorite: "",
};

export const useCakeSweetsStore = create<CakeSweetsState>()(
  persist(
    (set, get) => ({
      flavor: DEFAULT_FLAVOR,
      allergens: DEFAULT_ALLERGENS,
      cake_inspirations: {},
      dessert_catalog: {},
      dessert_meta: {},
      table_config: {},
      cutting_song: {},
      tasting_sessions: [],

      setSweetness: (v) =>
        set((s) => ({ flavor: { ...s.flavor, sweetness: v } })),
      setFlavorReaction: (flavorId, r) =>
        set((s) => {
          const next = { ...s.flavor.flavor_reactions };
          if (r === null) delete next[flavorId];
          else next[flavorId] = r;
          return { flavor: { ...s.flavor, flavor_reactions: next } };
        }),
      setTradition: (t) => set((s) => ({ flavor: { ...s.flavor, tradition: t } })),
      setBrideFavorite: (v) =>
        set((s) => ({ flavor: { ...s.flavor, bride_favorite: v } })),
      setGroomFavorite: (v) =>
        set((s) => ({ flavor: { ...s.flavor, groom_favorite: v } })),

      toggleAllergen: (id) =>
        set((s) => ({
          allergens: {
            ...s.allergens,
            flags: { ...s.allergens.flags, [id]: !s.allergens.flags[id] },
          },
        })),
      setAllergenNotes: (v) =>
        set((s) => ({ allergens: { ...s.allergens, notes: v } })),

      reactCake: (id, r) =>
        set((s) => {
          const next = { ...s.cake_inspirations };
          if (next[id] === r) delete next[id];
          else next[id] = r;
          return { cake_inspirations: next };
        }),
      reactDessert: (id, r) =>
        set((s) => {
          const next = { ...s.dessert_catalog };
          if (next[id] === r) delete next[id];
          else next[id] = r;
          return { dessert_catalog: next };
        }),

      addCustomDessert: (name, description) => {
        const id = rid("dessert");
        set((s) => ({
          dessert_catalog: { ...s.dessert_catalog, [id]: "love" },
          dessert_meta: {
            ...s.dessert_meta,
            [id]: { custom: true, name: name.trim(), description: description?.trim() },
          },
        }));
        return id;
      },
      setDessertMeta: (id, patch) =>
        set((s) => ({
          dessert_meta: {
            ...s.dessert_meta,
            [id]: { ...(s.dessert_meta[id] ?? {}), ...patch },
          },
        })),
      removeCustomDessert: (id) =>
        set((s) => {
          const nextCat = { ...s.dessert_catalog };
          const nextMeta = { ...s.dessert_meta };
          const nextTable = { ...s.table_config };
          delete nextCat[id];
          delete nextMeta[id];
          delete nextTable[id];
          return {
            dessert_catalog: nextCat,
            dessert_meta: nextMeta,
            table_config: nextTable,
          };
        }),

      setTableConfig: (dessertId, patch) =>
        set((s) => ({
          table_config: {
            ...s.table_config,
            [dessertId]: { ...(s.table_config[dessertId] ?? {}), ...patch },
          },
        })),

      pickCuttingSong: (patch) =>
        set((s) => ({ cutting_song: { ...s.cutting_song, ...patch } })),
      clearCuttingSong: () => set({ cutting_song: {} }),

      addTastingSession: (seed) => {
        const id = rid("tst");
        const session: TastingSession = {
          id,
          date: seed?.date ?? new Date().toISOString().slice(0, 10),
          vendor: seed?.vendor ?? "",
          samples: seed?.samples ?? [],
          overall_rating: seed?.overall_rating ?? 0,
          would_book: seed?.would_book ?? null,
          notes: seed?.notes ?? "",
          created_at: now(),
        };
        set((s) => ({ tasting_sessions: [session, ...s.tasting_sessions] }));
        return id;
      },
      updateTastingSession: (id, patch) =>
        set((s) => ({
          tasting_sessions: s.tasting_sessions.map((t) =>
            t.id === id ? { ...t, ...patch } : t,
          ),
        })),
      deleteTastingSession: (id) =>
        set((s) => ({
          tasting_sessions: s.tasting_sessions.filter((t) => t.id !== id),
        })),
      addTastingSample: (sessionId, seed) => {
        const id = rid("smp");
        set((s) => ({
          tasting_sessions: s.tasting_sessions.map((t) =>
            t.id === sessionId
              ? {
                  ...t,
                  samples: [
                    ...t.samples,
                    {
                      id,
                      name: seed?.name ?? "",
                      rating: seed?.rating ?? 0,
                      sweetness: seed?.sweetness ?? 50,
                      textures: seed?.textures ?? [],
                      would_serve: seed?.would_serve ?? null,
                      photo_url: seed?.photo_url,
                      notes: seed?.notes ?? "",
                    },
                  ],
                }
              : t,
          ),
        }));
        return id;
      },
      updateTastingSample: (sessionId, sampleId, patch) =>
        set((s) => ({
          tasting_sessions: s.tasting_sessions.map((t) =>
            t.id === sessionId
              ? {
                  ...t,
                  samples: t.samples.map((sm) =>
                    sm.id === sampleId ? { ...sm, ...patch } : sm,
                  ),
                }
              : t,
          ),
        })),
      deleteTastingSample: (sessionId, sampleId) =>
        set((s) => ({
          tasting_sessions: s.tasting_sessions.map((t) =>
            t.id === sessionId
              ? { ...t, samples: t.samples.filter((sm) => sm.id !== sampleId) }
              : t,
          ),
        })),

      lovedCatalogIds: () =>
        Object.entries(get().dessert_catalog)
          .filter(([, r]) => r === "love")
          .map(([id]) => id),
      lovedInspirationIds: () =>
        Object.entries(get().cake_inspirations)
          .filter(([, r]) => r === "love")
          .map(([id]) => id),
      activeAllergens: () =>
        (Object.entries(get().allergens.flags) as [AllergenId, boolean][])
          .filter(([, v]) => v)
          .map(([id]) => id),
    }),
    {
      name: "ananya:cake-sweets",
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

let _cakeSweetsSyncTimer: ReturnType<typeof setTimeout> | null = null;
useCakeSweetsStore.subscribe((state) => {
  if (_cakeSweetsSyncTimer) clearTimeout(_cakeSweetsSyncTimer);
  _cakeSweetsSyncTimer = setTimeout(() => {
    const coupleId = getCurrentCoupleId();
    if (!coupleId) return;
    const { flavor, allergens, cake_inspirations, dessert_catalog, dessert_meta, table_config, cutting_song, tasting_sessions } = state;
    dbUpsert("cake_sweets_state", { couple_id: coupleId, flavor, allergens, cake_inspirations, dessert_catalog, dessert_meta, table_config, cutting_song, tasting_sessions });
  }, 600);
});
