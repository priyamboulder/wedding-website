// ──────────────────────────────────────────────────────────────────────────
// Guest Count Estimator — type definitions.
//
// Pre-auth tool that builds a defensible guest-count range from family-side,
// tier, and per-event attendance assumptions. Pure client-side: state lives
// in a single useReducer and is encoded into the URL hash for sharing.
// ──────────────────────────────────────────────────────────────────────────

export type EventSlug =
  | "mehndi"
  | "haldi"
  | "sangeet"
  | "ceremony"
  | "reception"
  | "welcome-dinner"
  | "farewell-brunch"
  | "cocktail"
  | "pooja";

export type TierId =
  | "immediate-family"
  | "inner-extended"
  | "outer-extended"
  | "parents-friends"
  | "couple-friends"
  | "professional";

export type GuestDistribution =
  | "mostly-local"
  | "mixed"
  | "mostly-traveling"
  | "international";

export type SideId = "a" | "b";

export interface CategoryDef {
  id: string;
  label: string;
  helpText?: string;
  defaultCount?: number;
  sideSpecific: boolean;
}

export interface TierDef {
  id: TierId;
  name: string;
  description: string;
  categories: CategoryDef[];
}

export interface SideState {
  id: SideId;
  label: string;
  enabled: boolean;
  // Counts keyed by `${tierId}:${categoryId}` (only side-specific entries here).
  counts: Record<string, number>;
}

export interface SharedCounts {
  // For categories where sideSpecific === false (couple's friends / professional).
  // Keyed by `${tierId}:${categoryId}`.
  counts: Record<string, number>;
}

export interface EventAttendanceOverrides {
  // Per-tier % overrides for a single event. Values are 0..1. Missing keys
  // fall back to DEFAULT_ATTENDANCE_RATES.
  rates: Partial<Record<TierId, number>>;
  outOfTownModifier?: number; // 0..1 magnitude (positive = bigger reduction)
}

export interface GuestEstimateState {
  events: EventSlug[];
  weddingLocation: string; // free-text (e.g. "Dallas")
  guestDistribution: GuestDistribution;
  costPerHead: number;
  sides: [SideState, SideState];
  shared: SharedCounts;
  eventOverrides: Partial<Record<EventSlug, EventAttendanceOverrides>>;
}

export interface SideTotals {
  sideId: SideId;
  label: string;
  enabled: boolean;
  totalNames: number;
  byTier: Record<TierId, number>;
}

export interface EventBreakdown {
  slug: EventSlug;
  name: string;
  byTier: Record<TierId, number>;
  estimatedCount: number;
}

export interface EstimateOutput {
  totalNames: number;
  totalRange: { low: number; high: number };
  bySide: SideTotals[];
  byTier: { tierId: TierId; name: string; count: number }[];
  byEvent: EventBreakdown[];
  costEstimate: { low: number; high: number; perHead: number };
  insights: string[];
  outOfTownPercentage: number;
}
