// ── Seating assignments types ─────────────────────────────────────────
// Separate from the spatial layout (tables, room, fixed elements).
// This namespace owns the guest ↔ seat mapping, per-table notes, and
// the AI auto-suggest configuration that feeds /api/seating/suggest.

export type SeatingEventId = string;

// One seat assignment = one guest at one table for one event.
// We store seat index (0-based) for future per-seat placement; for now
// the drag-drop flow just picks the next empty index.
export interface SeatAssignment {
  guestId: string;
  tableId: string;
  seatIndex: number;
}

// Notes, dietary overrides, and ad-hoc constraints are keyed by table id.
export interface TableMeta {
  notes?: string;
}

// User-defined hard constraints the auto-suggest MUST respect.
export interface MustPair {
  id: string;
  kind: "together" | "apart";
  guestIds: string[]; // 2+ guest ids
  label?: string;
}

export type AutoStrategyId = "family_first" | "social_mixer" | "traditional";

// How to handle guests already seated before running auto-suggest.
//  - "fill_empty":   keep current assignments, only place unassigned guests
//  - "replace_all":  throw away current assignments, reassign from scratch
export type AutoSuggestMode = "fill_empty" | "replace_all";

export interface AutoSuggestConfig {
  strategy: AutoStrategyId;
  mode: AutoSuggestMode;
  keepHouseholdsTogether: boolean;
  vipNearStage: boolean;
  kidsNearParents: boolean;
  accessibilityNearExits: boolean;
  groupByCategory: boolean;
  balanceDietary: boolean;
  groupByLanguage: boolean;
  balanceSides: boolean; // for mixer mode
  separateSides: boolean; // for traditional mode
  nriNearEnglish: boolean;
  mustPairs: MustPair[];
}

export const DEFAULT_AUTO_CONFIG: AutoSuggestConfig = {
  strategy: "family_first",
  mode: "fill_empty",
  keepHouseholdsTogether: true,
  vipNearStage: true,
  kidsNearParents: true,
  accessibilityNearExits: true,
  groupByCategory: false,
  balanceDietary: true,
  groupByLanguage: false,
  balanceSides: false,
  separateSides: false,
  nriNearEnglish: false,
  mustPairs: [],
};

// API request / response for /api/seating/suggest
export interface SuggestRequestGuest {
  id: string;
  name: string;
  side: "bride" | "groom" | "mutual";
  householdId: string;
  categories: string[];
  dietary: string[];
  ageCategory: string;
  vipTier: string;
  preferredLanguage?: string;
  needsAssistance?: boolean;
  relationship?: string;
  plusOneOf?: string;
}

export interface SuggestRequestTable {
  id: string;
  label: string;
  seats: number;
  shape: string;
  // Approximate spatial zone for constraint prompts (near stage, edge, etc.)
  zone?: "near_stage" | "near_exit" | "center" | "edge";
}

export interface SuggestRequestBody {
  eventId: string;
  eventLabel: string;
  strategy: AutoStrategyId;
  config: AutoSuggestConfig;
  guests: SuggestRequestGuest[];
  tables: SuggestRequestTable[];
  // When mode === "fill_empty": pre-existing {guestId, tableId} to respect
  // as hard-locked. The model should only assign the remaining guests.
  alreadyAssigned?: Array<{ guestId: string; tableId: string }>;
}

export interface SuggestedAssignment {
  guestId: string;
  tableId: string;
  reason?: string;
}

// Per-table zone classification emitted by the AI alongside assignments.
// Consumed by the canvas to paint zone-colored borders.
export interface SuggestedTableZone {
  tableId: string;
  zone: "vip" | "family" | "friends" | "kids";
  reason?: string;
}

// Dining Intelligence: one flag per potential issue with a one-click fix.
export type WarningSeverity = "red" | "amber" | "green";
export type WarningType =
  | "household_split"
  | "dietary_clash"
  | "capacity_overflow"
  | "accessibility"
  | "isolation"
  | "zone_mismatch";

export interface DiningWarning {
  id: string;
  severity: WarningSeverity;
  type: WarningType;
  message: string;
  affectedGuestIds?: string[];
  affectedTableIds?: string[];
  suggestion?: string;
}

export interface DiningIntelligence {
  status: WarningSeverity;
  summary: string;
  issuesCount: number;
  warnings: DiningWarning[];
}

export interface SuggestResponse {
  ok: boolean;
  assignments?: SuggestedAssignment[];
  tableZones?: SuggestedTableZone[];
  dining?: DiningIntelligence;
  summary?: string;
  model?: string;
  error?: string;
}
