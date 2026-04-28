// ── Roulette types ──────────────────────────────────────────────────────────
// Vendor Roulette is a full-screen, one-vendor-at-a-time swipe experience
// for speed-dating vendor discovery. Sessions and swipe actions persist in
// localStorage via the roulette-store.

import type { VendorCategory } from "@/types/vendor";

export type RouletteAction = "save" | "skip" | "book_call" | "view_profile";

export interface RouletteFilters {
  category: VendorCategory;
  city: string;
  include_travel: boolean;
  budget_min: number | null;
  budget_max: number | null;
  budget_flexible: boolean;
  style_tags: string[];
}

export interface RouletteSession {
  id: string;
  filters: RouletteFilters;
  vendor_order: string[];         // ordered vendor IDs from ranking
  current_index: number;          // position in stack (0-based)
  total_vendors: number;
  is_complete: boolean;
  started_at: string;
  last_active_at: string;
  completed_at?: string;
}

export interface RouletteActionRecord {
  id: string;
  session_id: string;
  vendor_id: string;
  action: RouletteAction;
  position_in_stack: number;
  time_spent_seconds: number;
  images_viewed: number;
  viewed_full_profile: boolean;
  created_at: string;
}
