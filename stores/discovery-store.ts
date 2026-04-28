// ── Discovery preferences store ───────────────────────────────────────────
// Cross-cutting state for the new discovery surface:
//   • Couple's style profile (quiz answers or chosen preset)
//   • Subcategory/tag multi-filter
//   • Comparison basket (max 3 vendor ids)
//   • Budget allocator overrides
//   • Availability filter (target wedding date)
//
// Persisted to localStorage. Intentionally separate from vendors-store so
// the existing shortlist/filter logic doesn't need to change.

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  StyleSignature,
  SubcategoryId,
} from "@/types/vendor-discovery";
import type { VendorCategory } from "@/types/vendor-unified";
import type { AllocationEntry } from "@/lib/vendors/budget-allocator";
import { suggestAllocation, rebalanceAllocation } from "@/lib/vendors/budget-allocator";
import { dbUpsert, getCurrentCoupleId } from "@/lib/supabase/db-sync";

const MAX_COMPARE = 3;

interface DiscoveryState {
  // Style
  styleProfile: StyleSignature | null;
  setStyleProfile: (sig: StyleSignature | null) => void;

  // Filters
  subcategoryIds: SubcategoryId[];
  tagIds: string[];
  topCategory: VendorCategory | null;
  hasVideoOnly: boolean;
  availableOnDateOnly: boolean;
  toggleSubcategory: (id: SubcategoryId) => void;
  toggleTag: (id: string) => void;
  setTopCategory: (id: VendorCategory | null) => void;
  setHasVideoOnly: (v: boolean) => void;
  setAvailableOnDateOnly: (v: boolean) => void;
  clearFilters: () => void;

  // Comparison basket
  compareIds: string[];
  toggleCompare: (vendorId: string) => void;
  clearCompare: () => void;

  // Budget
  totalBudgetInr: number;
  allocation: AllocationEntry[];
  setTotalBudget: (inr: number) => void;
  editAllocation: (category: VendorCategory, pct: number) => void;
  resetAllocation: () => void;

  // Availability
  targetWeddingDate: string | null; // ISO
  setTargetWeddingDate: (iso: string | null) => void;
}

export const useDiscoveryStore = create<DiscoveryState>()(
  persist(
    (set, get) => ({
      styleProfile: null,
      setStyleProfile: (styleProfile) => set({ styleProfile }),

      subcategoryIds: [],
      tagIds: [],
      topCategory: null,
      hasVideoOnly: false,
      availableOnDateOnly: false,
      toggleSubcategory: (id) =>
        set((s) => ({
          subcategoryIds: s.subcategoryIds.includes(id)
            ? s.subcategoryIds.filter((x) => x !== id)
            : [...s.subcategoryIds, id],
        })),
      toggleTag: (id) =>
        set((s) => ({
          tagIds: s.tagIds.includes(id)
            ? s.tagIds.filter((x) => x !== id)
            : [...s.tagIds, id],
        })),
      setTopCategory: (topCategory) => set({ topCategory }),
      setHasVideoOnly: (hasVideoOnly) => set({ hasVideoOnly }),
      setAvailableOnDateOnly: (availableOnDateOnly) =>
        set({ availableOnDateOnly }),
      clearFilters: () =>
        set({
          subcategoryIds: [],
          tagIds: [],
          topCategory: null,
          hasVideoOnly: false,
          availableOnDateOnly: false,
        }),

      compareIds: [],
      toggleCompare: (vendorId) =>
        set((s) => {
          if (s.compareIds.includes(vendorId)) {
            return { compareIds: s.compareIds.filter((x) => x !== vendorId) };
          }
          if (s.compareIds.length >= MAX_COMPARE) return s;
          return { compareIds: [...s.compareIds, vendorId] };
        }),
      clearCompare: () => set({ compareIds: [] }),

      totalBudgetInr: 5_000_000, // ₹50L default
      allocation: suggestAllocation(),
      setTotalBudget: (inr) => set({ totalBudgetInr: Math.max(0, inr) }),
      editAllocation: (category, pct) =>
        set((s) => ({ allocation: rebalanceAllocation(s.allocation, category, pct) })),
      resetAllocation: () => set({ allocation: suggestAllocation() }),

      targetWeddingDate: null,
      setTargetWeddingDate: (iso) => set({ targetWeddingDate: iso }),
    }),
    {
      name: "ananya-discovery-v1",
      storage: createJSONStorage(() => (typeof window !== "undefined" ? localStorage : { getItem: () => null, setItem: () => {}, removeItem: () => {} })),
    },
  ),
);

let _discoverySyncTimer: ReturnType<typeof setTimeout> | null = null;
useDiscoveryStore.subscribe((state) => {
  if (_discoverySyncTimer) clearTimeout(_discoverySyncTimer);
  _discoverySyncTimer = setTimeout(() => {
    const coupleId = getCurrentCoupleId();
    if (!coupleId) return;
    dbUpsert("discovery_state", { couple_id: coupleId, data: state as unknown });
  }, 600);
});

export const MAX_COMPARE_COUNT = MAX_COMPARE;
