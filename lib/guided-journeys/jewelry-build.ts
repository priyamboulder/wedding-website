// ── Jewelry Build journey ─────────────────────────────────────────────────
// Second guided journey on the Jewelry workspace. Vision (the 3-session
// default journey) covers direction and brief. Build is operational —
// every piece tracked, every handoff planned, every appraisal scheduled.
// Lives at journey_id = "build". Four sessions:
//
//   1. bridal_inventory   — 12 piece types, lifecycle status
//                           (wishlist → sourcing → ordered → received),
//                           per-event assignments, outfit pairing.
//   2. groom_inventory    — sherwani-specific vocabulary (safa brooch,
//                           kalgi, mala, ceremonial buttons, cufflinks),
//                           turban-mounted piece coordination.
//   3. family_heirlooms   — lender-aware tracking with strict privacy
//                           (planner_stylist_only by default), in-flux
//                           note, cross-side-dynamics, story.
//   4. fittings_custody   — appointments, day-of custody chain (the high-
//                           stakes part), special handoffs, insurance
//                           manifest with appraisal deadlines.
//
// Build does NOT generate a closing brief — Vision already produced the
// jewelry brief. Build's output is operational.
//
// Time-gated: Build CTAs render muted when months_until_event > 6. The
// six-month threshold matches couture jewelry lead times (8–12 weeks for
// custom kundan/polki sets plus shipping).
//
// Privacy: Family heirloom data has stricter rules than other build data.
// See jewelry-build-privacy.ts for the model.

import type { CategoryKey } from "@/lib/guided-journey/types";
import type {
  AudienceFilter,
  EventKey,
} from "./jewelry-vision";

export const JEWELRY_BUILD_JOURNEY_ID = "build";
export const JEWELRY_BUILD_CATEGORY: CategoryKey = "jewelry";

export type JewelryBuildSessionKey =
  | "bridal_inventory"
  | "groom_inventory"
  | "family_heirlooms"
  | "fittings_custody";

export interface JewelryBuildSessionDef {
  key: JewelryBuildSessionKey;
  index: number;
  title: string;
  subtitle: string;
  estimatedMinutes: number;
}

export const JEWELRY_BUILD_SESSIONS: readonly JewelryBuildSessionDef[] = [
  {
    key: "bridal_inventory",
    index: 1,
    title: "Bridal jewelry inventory",
    subtitle: "Every piece you're wearing — wishlist, sourcing, delivery.",
    estimatedMinutes: 5,
  },
  {
    key: "groom_inventory",
    index: 2,
    title: "Groom's jewelry",
    subtitle:
      "Safa brooch, kalgi, mala, buttons — sherwani has its own language.",
    estimatedMinutes: 4,
  },
  {
    key: "family_heirlooms",
    index: 3,
    title: "Family heirlooms",
    subtitle: "The pieces that come with stories. Lender, condition, who carries them.",
    estimatedMinutes: 3,
  },
  {
    key: "fittings_custody",
    index: 4,
    title: "Fittings & day-of custody",
    subtitle:
      "Appointments, handoffs, who carries $50K of jewelry to the mandap.",
    estimatedMinutes: 3,
  },
] as const;

export const JEWELRY_BUILD_TOTAL_MINUTES = JEWELRY_BUILD_SESSIONS.reduce(
  (sum, s) => sum + s.estimatedMinutes,
  0,
);

export const JEWELRY_BUILD_UNLOCK_THRESHOLD_MONTHS = 6;

export function getJewelryBuildSession(
  key: JewelryBuildSessionKey,
): JewelryBuildSessionDef {
  const found = JEWELRY_BUILD_SESSIONS.find((s) => s.key === key);
  if (!found) {
    throw new Error(`Unknown jewelry build session: ${key}`);
  }
  return found;
}

// ── Shared types ──────────────────────────────────────────────────────────

export type LifecycleStatus =
  | "wishlist"
  | "sourcing"
  | "ordered"
  | "received";

export type SourceKind =
  | "new_purchase"
  | "custom_design"
  | "rental"
  | "family_heirloom"
  | "tbd";

// ── Session 1: bridal_inventory ───────────────────────────────────────────

export type BridalPieceType =
  | "rani_haar"
  | "choker"
  | "necklace"
  | "jhumkas"
  | "earrings"
  | "maang_tikka"
  | "matha_patti"
  | "nath"
  | "haath_phool"
  | "bangles"
  | "chooda"
  | "kada_set"
  | "rings"
  | "anklets"
  | "kamarbandh"
  | "mangalsutra"
  | "reception_earrings"
  | "custom";

export interface BridalPieceEventAssignment {
  event: EventKey;
  paired_outfit_id?: string;
  pairing_note?: string;
}

export interface BridalPiece {
  id: string;
  piece_type: BridalPieceType;
  custom_label?: string;
  status: LifecycleStatus;
  description?: string;
  estimated_value?: number;
  photo_urls?: string[];
  source: SourceKind;
  vendor_name?: string;
  vendor_contact?: string;
  order_date?: string;
  expected_delivery_date?: string;
  actual_delivery_date?: string;
  events_worn_at: BridalPieceEventAssignment[];
  care_notes?: string;
  storage_before_wedding?: string;
}

export interface BridalInventoryComputed {
  total_pieces: number;
  pieces_by_status: Record<LifecycleStatus, number>;
  total_estimated_value: number;
  high_value_pieces_count: number;
  pieces_per_event: Record<string, number>;
}

export interface BridalInventoryFormData {
  pieces: BridalPiece[];
  computed?: BridalInventoryComputed;
}

export const BRIDAL_SUGGESTED_CHIPS: ReadonlyArray<{
  piece_type: BridalPieceType;
  label: string;
}> = [
  { piece_type: "rani_haar", label: "Rani haar" },
  { piece_type: "choker", label: "Choker" },
  { piece_type: "jhumkas", label: "Jhumkas" },
  { piece_type: "maang_tikka", label: "Maang tikka" },
  { piece_type: "nath", label: "Nath" },
  { piece_type: "haath_phool", label: "Haath phool" },
  { piece_type: "kada_set", label: "Kada set" },
  { piece_type: "reception_earrings", label: "Reception earrings" },
];

export const BRIDAL_PIECE_LABEL: Record<BridalPieceType, string> = {
  rani_haar: "Rani haar",
  choker: "Choker",
  necklace: "Necklace",
  jhumkas: "Jhumkas",
  earrings: "Earrings",
  maang_tikka: "Maang tikka",
  matha_patti: "Matha patti",
  nath: "Nath",
  haath_phool: "Haath phool",
  bangles: "Bangles",
  chooda: "Chooda",
  kada_set: "Kada set",
  rings: "Rings",
  anklets: "Anklets",
  kamarbandh: "Kamarbandh",
  mangalsutra: "Mangalsutra",
  reception_earrings: "Reception earrings",
  custom: "Custom",
};

export const HIGH_VALUE_THRESHOLD = 5_000;
export const TOTAL_VALUE_INSURANCE_TRIGGER = 25_000;
export const TOTAL_VALUE_SOFT_WARNING = 20_000;

// ── Session 2: groom_inventory ────────────────────────────────────────────

export type GroomPieceType =
  | "safa_brooch"
  | "kalgi"
  | "mala_ceremonial"
  | "sherwani_buttons"
  | "cufflinks"
  | "ring"
  | "bracelet_kada"
  | "pocket_square_pin"
  | "turban_chain"
  | "custom";

export interface GroomPieceEventAssignment {
  event: EventKey;
  paired_outfit_id?: string;
  pairing_note?: string;
}

export interface GroomPiece {
  id: string;
  piece_type: GroomPieceType;
  custom_label?: string;
  status: LifecycleStatus;
  description?: string;
  estimated_value?: number;
  photo_urls?: string[];
  source: SourceKind;
  vendor_name?: string;
  vendor_contact?: string;
  order_date?: string;
  expected_delivery_date?: string;
  actual_delivery_date?: string;
  events_worn_at: GroomPieceEventAssignment[];
  /** Only relevant for kalgi & safa_brooch — turban placement notes. */
  turban_placement?: string;
}

export interface GroomInventoryComputed {
  total_pieces: number;
  pieces_by_status: Record<LifecycleStatus, number>;
  total_estimated_value: number;
  has_turban_pieces: boolean;
}

export interface GroomInventoryFormData {
  pieces: GroomPiece[];
  computed?: GroomInventoryComputed;
}

export const GROOM_SUGGESTED_CHIPS: ReadonlyArray<{
  piece_type: GroomPieceType;
  label: string;
}> = [
  { piece_type: "safa_brooch", label: "Safa brooch" },
  { piece_type: "kalgi", label: "Kalgi" },
  { piece_type: "mala_ceremonial", label: "Mala (ceremonial)" },
  { piece_type: "sherwani_buttons", label: "Sherwani buttons" },
  { piece_type: "cufflinks", label: "Cufflinks" },
  { piece_type: "ring", label: "Ring" },
  { piece_type: "bracelet_kada", label: "Bracelet / kada" },
];

export const GROOM_PIECE_LABEL: Record<GroomPieceType, string> = {
  safa_brooch: "Safa brooch",
  kalgi: "Kalgi",
  mala_ceremonial: "Mala (ceremonial)",
  sherwani_buttons: "Sherwani buttons",
  cufflinks: "Cufflinks",
  ring: "Ring",
  bracelet_kada: "Bracelet / kada",
  pocket_square_pin: "Pocket square pin",
  turban_chain: "Turban chain",
  custom: "Custom",
};

/** Piece types where turban_placement is meaningful. */
export const TURBAN_MOUNTED_PIECES: ReadonlySet<GroomPieceType> = new Set<GroomPieceType>([
  "kalgi",
  "safa_brooch",
  "turban_chain",
]);

// ── Session 3: family_heirlooms ───────────────────────────────────────────

export type HeirloomCondition =
  | "pristine"
  | "good"
  | "needs_repair"
  | "fragile_antique";

export type HeirloomPrivacyLevel =
  | "planner_stylist_only"
  | "planner_only"
  | "family_only";

export interface HeirloomLender {
  name: string;
  relationship: string;
  side: "bride" | "groom";
  contact?: string;
}

export interface HeirloomEventAssignment {
  event: EventKey;
  paired_outfit_id?: string;
  conditional_note?: string;
}

export interface FamilyHeirloom {
  id: string;
  piece_type: string;
  description: string;
  lender: HeirloomLender;
  story?: string;
  condition: HeirloomCondition;
  care_notes?: string;
  needs_appraisal: boolean;
  estimated_value?: number;
  events_worn_at: HeirloomEventAssignment[];
  handoff_plan?: string;
  return_plan?: string;
  photo_urls?: string[];
  is_confirmed_with_lender: boolean;
  flux_note?: string;
  privacy_level: HeirloomPrivacyLevel;
}

export interface FamilyHeirloomsComputed {
  total_heirlooms: number;
  confirmed_count: number;
  in_flux_count: number;
  needs_appraisal_count: number;
  total_estimated_value: number;
}

export interface FamilyHeirloomsFormData {
  heirlooms: FamilyHeirloom[];
  cross_side_dynamics?: string;
  computed?: FamilyHeirloomsComputed;
}

// ── Session 4: fittings_custody ───────────────────────────────────────────

export type FittingAppointmentType =
  | "jeweler_appointment"
  | "rental_pickup"
  | "family_heirloom_handoff"
  | "final_pairing_check"
  | "sizing_adjustment";

export type FittingStatus =
  | "scheduled"
  | "completed"
  | "rescheduled"
  | "cancelled";

export interface FittingAppointment {
  id: string;
  appointment_type: FittingAppointmentType;
  date_time?: string;
  location?: string;
  pieces_involved: string[];
  contact_person?: string;
  notes?: string;
  status: FittingStatus;
}

export interface OvernightStorage {
  location: string;
  who_has_access: string[];
  lock_combination_shared_with?: string;
}

export interface MorningHandoff {
  from: string;
  to: string;
  time: string;
  carrier_role: string;
}

export interface BetweenEventsStorage {
  location: string;
  responsible_person: string;
}

export interface PostEventHandoff {
  from: string;
  to: string;
  time: string;
  notes?: string;
}

export interface PerEventCustody {
  event: EventKey;
  pieces_at_event: string[];
  morning_handoff: MorningHandoff;
  between_events_storage?: BetweenEventsStorage;
  post_event_handoff: PostEventHandoff;
}

export type SpecialHandoffType =
  | "turban_piece"
  | "mangalsutra"
  | "ceremonial_mala"
  | "ring_exchange"
  | "other";

export interface SpecialHandoff {
  id: string;
  piece_id: string;
  handoff_type: SpecialHandoffType;
  who_carries: string;
  timing: string;
  notes?: string;
}

export interface CustodyChain {
  overnight_storage: OvernightStorage;
  per_event_custody: PerEventCustody[];
  special_handoffs: SpecialHandoff[];
}

export type InsurancePolicyType =
  | "event_rider"
  | "homeowner_rider"
  | "standalone_event"
  | "tbd";

export interface InsurancePlan {
  is_insured: boolean;
  policy_type?: InsurancePolicyType;
  policy_number?: string;
  coverage_amount?: number;
  effective_dates?: { start: string; end: string };
  insurer_contact?: string;
  appraisals_needed_count: number;
  appraisal_deadline?: string;
}

export interface FittingsCustodyComputed {
  total_fittings: number;
  completed_fittings: number;
  upcoming_fittings: number;
  total_handoffs: number;
  high_value_handoffs: number;
  insurance_status_label: string;
}

export interface FittingsCustodyFormData {
  fittings: FittingAppointment[];
  custody_chain: CustodyChain;
  insurance: InsurancePlan;
  computed?: FittingsCustodyComputed;
}

// ── Re-exports for ergonomics ─────────────────────────────────────────────
export type { AudienceFilter, EventKey };

// Default appraisal-deadline offset from the wedding date.
export const APPRAISAL_DEADLINE_DAYS_BEFORE_WEDDING = 60;
