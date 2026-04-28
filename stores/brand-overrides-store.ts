import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { LogoConnector } from "@/types/logo";
import { dbUpsert, getCurrentCoupleId } from "@/lib/supabase/db-sync";

// Unified override store for both Monogram and Logo surfaces. The couple's
// names are shared — editing them on one surface updates the other. Fields
// that apply to a single surface (initials/useLongInitials for monogram;
// connector for logo) live here too but are only writable from their home
// drawer.
export interface BrandOverrides {
  initials: [string, string] | null;
  names: [string, string] | null;
  date: string | null;
  location: string | null;
  color: string | null;
  connector: LogoConnector | null;
  useLongInitials: boolean;
}

interface BrandOverridesState {
  overrides: BrandOverrides;
  setInitials: (value: [string, string] | null) => void;
  setNames: (value: [string, string] | null) => void;
  setDate: (value: string | null) => void;
  setLocation: (value: string | null) => void;
  setColor: (value: string | null) => void;
  setConnector: (value: LogoConnector | null) => void;
  setUseLongInitials: (value: boolean) => void;
  resetAll: () => void;
  hasAnyOverride: () => boolean;
}

const EMPTY: BrandOverrides = {
  initials: null,
  names: null,
  date: null,
  location: null,
  color: null,
  connector: null,
  useLongInitials: false,
};

export const useBrandOverridesStore = create<BrandOverridesState>()(
  persist(
    (set, get) => ({
      overrides: EMPTY,

      setInitials: (value) =>
        set((s) => ({ overrides: { ...s.overrides, initials: value } })),
      setNames: (value) =>
        set((s) => ({ overrides: { ...s.overrides, names: value } })),
      setDate: (value) =>
        set((s) => ({ overrides: { ...s.overrides, date: value } })),
      setLocation: (value) =>
        set((s) => ({ overrides: { ...s.overrides, location: value } })),
      setColor: (value) =>
        set((s) => ({ overrides: { ...s.overrides, color: value } })),
      setConnector: (value) =>
        set((s) => ({ overrides: { ...s.overrides, connector: value } })),
      setUseLongInitials: (value) =>
        set((s) => ({ overrides: { ...s.overrides, useLongInitials: value } })),

      resetAll: () => set({ overrides: EMPTY }),

      hasAnyOverride: () => {
        const o = get().overrides;
        return (
          o.initials !== null ||
          o.names !== null ||
          o.date !== null ||
          o.location !== null ||
          o.color !== null ||
          o.connector !== null
        );
      },
    }),
    {
      name: "ananya:brand-overrides",
      version: 2,
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
      // v1 was "ananya:monogram-overrides" without connector — carry forward.
      migrate: (persisted, version) => {
        if (!persisted || typeof persisted !== "object") return { overrides: EMPTY };
        const state = persisted as { overrides?: Partial<BrandOverrides> };
        if (version < 2) {
          return {
            overrides: {
              ...EMPTY,
              ...(state.overrides ?? {}),
              connector: null,
            },
          };
        }
        return state as { overrides: BrandOverrides };
      },
    },
  ),
);

let _brandOverridesSyncTimer: ReturnType<typeof setTimeout> | null = null;
useBrandOverridesStore.subscribe((state) => {
  if (_brandOverridesSyncTimer) clearTimeout(_brandOverridesSyncTimer);
  _brandOverridesSyncTimer = setTimeout(() => {
    const coupleId = getCurrentCoupleId();
    if (!coupleId) return;
    dbUpsert("brand_overrides_state", { couple_id: coupleId, data: state as unknown });
  }, 600);
});

// Back-compat alias — MonogramDetailDrawer historically imported this name.
// Keeping the alias lets the rename land without churn across surfaces.
export const useMonogramOverridesStore = useBrandOverridesStore;
export type MonogramOverrides = BrandOverrides;
