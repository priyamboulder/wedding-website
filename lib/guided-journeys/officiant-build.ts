// ── Officiant Build journey ─────────────────────────────────────────────────
// Second guided journey on the Pandit workspace. Vision (the simplified 2-
// session flow on Tab 1's top half) lives at journey_id = "default";
// Build lives at journey_id = "build". Four sessions:
//
//   1. rituals_walkthrough — for each ritual: include / discuss / skip,
//      plus any personal additions.
//   2. family_roles        — assign (or hide) roles for each ritual.
//   3. samagri_review      — confirm samagri items, sources, and procurement
//      cadence.
//   4. ceremony_logistics  — mandap orientation, audio, guest experience,
//      vendor coordination notes.
//
// Unlike Vision, Build does NOT generate a closing brief. The output is
// operational: rituals locked, roles assigned, samagri tracked, day-of
// logistics specced. The completion state lands the couple on Tab 3
// (Ceremony Script) where the auto-derived script is now fully populated.
//
// Field storage strategy: every Build session reads & writes directly
// through `usePanditStore` (the same source of truth Tabs 1/3/4/5/6 use).
// This gives free two-way sync with no copy-and-paste. The journey state
// itself only persists session statuses (not_started / in_progress /
// completed). See lib/guided-journeys/officiant-build-sync.ts for the
// canonical field mapping.

import type { CategoryKey } from "@/lib/guided-journey/types";

export const OFFICIANT_BUILD_JOURNEY_ID = "build";
export const OFFICIANT_BUILD_CATEGORY: CategoryKey = "priest";

export type OfficiantBuildSessionKey =
  | "rituals_walkthrough"
  | "family_roles"
  | "samagri_review"
  | "ceremony_logistics";

export interface OfficiantBuildSessionDef {
  key: OfficiantBuildSessionKey;
  index: number;
  title: string;
  subtitle: string;
  estimatedMinutes: number;
}

export const OFFICIANT_BUILD_SESSIONS: readonly OfficiantBuildSessionDef[] = [
  {
    key: "rituals_walkthrough",
    index: 1,
    title: "Walk through the rituals",
    subtitle:
      "For each ritual: include, skip, or flag for discussion with your pandit.",
    estimatedMinutes: 5,
  },
  {
    key: "family_roles",
    index: 2,
    title: "Family roles",
    subtitle: "Who does what — and quietly, who doesn't.",
    estimatedMinutes: 4,
  },
  {
    key: "samagri_review",
    index: 3,
    title: "Samagri & supplies",
    subtitle:
      "Confirm what's needed, who's sourcing, and what the officiant brings.",
    estimatedMinutes: 3,
  },
  {
    key: "ceremony_logistics",
    index: 4,
    title: "Day-of logistics",
    subtitle: "Mandap, audio, guest experience, and vendor handoffs.",
    estimatedMinutes: 3,
  },
] as const;

export const OFFICIANT_BUILD_TOTAL_MINUTES = OFFICIANT_BUILD_SESSIONS.reduce(
  (sum, s) => sum + s.estimatedMinutes,
  0,
);

export function getOfficiantBuildSession(
  key: OfficiantBuildSessionKey,
): OfficiantBuildSessionDef {
  const found = OFFICIANT_BUILD_SESSIONS.find((s) => s.key === key);
  if (!found) {
    throw new Error(`Unknown officiant build session: ${key}`);
  }
  return found;
}

// ── Form data shapes ────────────────────────────────────────────────────────
// These describe the logical shape of each session's form_data. The session
// UIs read & write through usePanditStore directly, so these types double as
// documentation of the projection from store → guided journey.

export interface RitualsWalkthroughFormData {
  rituals: Array<{
    id: string;
    name_english: string;
    name_devanagari?: string;
    description: string;
    estimated_minutes: number;
    decision: "including" | "discuss_with_pandit" | "skipping";
    couple_notes?: string;
    is_default_for_tradition: boolean;
  }>;
  personal_additions: Array<{
    id: string;
    description: string;
    placement_hint?: string;
  }>;
  computed?: {
    rituals_including: number;
    rituals_discussing: number;
    rituals_skipping: number;
    estimated_runtime_min: number;
  };
}

export interface FamilyRolesFormData {
  roles: Array<{
    id: string;
    title: string;
    ritual_id?: string;
    side: "bride" | "groom" | "shared";
    assigned_to: string[];
    relationship: string;
    needs_practice: boolean;
    sensitivity_note?: string; // planner-only
    is_private: boolean;       // planner-only visibility
    is_skipped_ritual: boolean; // computed
  }>;
  computed?: {
    total_roles: number;
    unassigned_count: number;
    needs_practice_count: number;
    private_notes_count: number;
    skipped_ritual_roles_count: number;
  };
}

export interface SamagriReviewFormData {
  items: Array<{
    id: string;
    name_english: string;
    name_devanagari?: string;
    quantity: string;
    ritual_id?: string;
    category:
      | "general_setup"
      | "floral"
      | "food_grain"
      | "fabric"
      | "metal_vessels"
      | "personal"
      | "other";
    source:
      | "indian_grocery_store"
      | "officiant_provides"
      | "florist"
      | "venue"
      | "other"
      | "tbd";
    status: "needed" | "sourced" | "confirmed" | "delivered";
    notes?: string;
    is_fresh: boolean;
  }>;
  procurement_cadence: {
    t_minus_28_review: string;
    t_minus_14_purchase: string;
    t_minus_7_sourced_check: string;
    t_minus_1_delivery: string;
  };
  computed?: {
    total_items: number;
    needed_count: number;
    sourced_count: number;
    confirmed_count: number;
    delivered_count: number;
    officiant_provides_count: number;
    fresh_items_count: number;
  };
}

export interface CeremonyLogisticsFormData {
  mandap: {
    couple_faces: "east" | "north" | "west" | "south";
    dimensions: string;
    havan_kund_placement: string;
    fire_permit_required: boolean;
    fire_permit_status: "pending" | "confirmed" | "not_required" | "tbd";
  };
  audio: {
    officiant_mic_type: "lapel" | "handheld" | "headset" | "none";
    amplify_mantras: boolean;
    background_instrumental: boolean;
    instrumental_notes: string;
    sound_check_time: string;
  };
  guest_experience: {
    shoe_removal_plan: string;
    water_accessible_near_seating: boolean;
    unplugged_ceremony: boolean;
    childrens_quiet_area: boolean;
    childrens_area_note?: string;
    weather_considerations: string;
  };
  vendor_notes: {
    photographer: string;
    videographer: string;
    dj_music: string;
    decor: string;
  };
}

export const DEFAULT_PROCUREMENT_CADENCE: SamagriReviewFormData["procurement_cadence"] =
  {
    t_minus_28_review:
      "Review samagri list with officiant. Confirm tradition-specific items.",
    t_minus_14_purchase:
      "Purchase non-perishable items (grains, fabric, vessels). Source rare items online if needed.",
    t_minus_7_sourced_check:
      "Confirm every item shows 'sourced' or 'confirmed'. Chase anything still 'needed'.",
    t_minus_1_delivery:
      "Deliver everything to the venue. Pick up fresh items (flowers, mango leaves, fruit) the morning of.",
  } as const;
