// ── Wardrobe Build journey ─────────────────────────────────────────────────
// Second guided journey on the Wardrobe & Styling workspace. Vision (the
// 3-session default journey on Tab 1) covers style direction, palettes,
// moodboard and the brief. Build is operational — the people × events
// outfit matrix, family palettes & coordination rules, delivery & docs.
// Three sessions, ~12 minutes.
//
//   1. outfit_planner       — bride first, then groom, then "+ add person".
//                             Per-cell colour, designer, status, jewelry.
//   2. family_coordination  — bride/groom-side family roster, AI palette
//                             suggestions per side per event, accepted
//                             coordination rules.
//   3. delivery_documents   — auto-seeded delivery slots from purchased
//                             outfits, file uploads, alterations buffer,
//                             one-way handoffs to Photography & HMUA.
//
// Unlike Vision, Build does NOT generate a closing brief. Vision already
// produced the brief that goes to designers and stylists. Build's output
// is operational — the matrix, the family palettes, the delivery windows.
// Completion lands the couple on Tab 3 (Event Looks) with three action
// CTAs (Share with stylist / Share with planner / Send swatches to
// photography & HMUA).
//
// Field storage strategy: every Build session reads & writes directly
// through `useWorkspaceStore` (the same `WorkspaceItem` store Tabs
// 3/4/6 use) plus a small slice of localStorage for journey-only blobs
// (accepted family palettes, alterations buffer, vendor handoff toggles).
// This gives free two-way sync with no copy-and-paste. The journey state
// itself only persists session statuses (not_started / in_progress /
// completed). See lib/guided-journeys/wardrobe-build-sync.ts for the
// canonical field mapping.

import type { CategoryKey } from "@/lib/guided-journey/types";

export const WARDROBE_BUILD_JOURNEY_ID = "build";
export const WARDROBE_BUILD_CATEGORY: CategoryKey = "wardrobe";

export type WardrobeBuildSessionKey =
  | "outfit_planner"
  | "family_coordination"
  | "delivery_documents";

export interface WardrobeBuildSessionDef {
  key: WardrobeBuildSessionKey;
  index: number;
  title: string;
  subtitle: string;
  estimatedMinutes: number;
}

export const WARDROBE_BUILD_SESSIONS: readonly WardrobeBuildSessionDef[] = [
  {
    key: "outfit_planner",
    index: 1,
    title: "Plan every look",
    subtitle: "The matrix: who wears what at each event.",
    estimatedMinutes: 5,
  },
  {
    key: "family_coordination",
    index: 2,
    title: "Family coordination",
    subtitle:
      "Bride side, groom side, AI palette suggestions, coordination rules.",
    estimatedMinutes: 4,
  },
  {
    key: "delivery_documents",
    index: 3,
    title: "Delivery & documents",
    subtitle:
      "When everything arrives, where the swatches and receipts live.",
    estimatedMinutes: 3,
  },
] as const;

export const WARDROBE_BUILD_TOTAL_MINUTES = WARDROBE_BUILD_SESSIONS.reduce(
  (sum, s) => sum + s.estimatedMinutes,
  0,
);

export function getWardrobeBuildSession(
  key: WardrobeBuildSessionKey,
): WardrobeBuildSessionDef {
  const found = WARDROBE_BUILD_SESSIONS.find((s) => s.key === key);
  if (!found) {
    throw new Error(`Unknown wardrobe build session: ${key}`);
  }
  return found;
}

// ── Form data shapes ───────────────────────────────────────────────────────
// Logical shapes per session. The session UIs read & write through
// `useWorkspaceStore` directly, so these types double as documentation of
// the projection from store → guided journey.

export type WardrobeEvent =
  | "haldi"
  | "mehendi"
  | "sangeet"
  | "wedding"
  | "reception"
  | "other";

export type PersonRole =
  | "bride"
  | "groom"
  | "mother_of_bride"
  | "mother_of_groom"
  | "father_of_bride"
  | "father_of_groom"
  | "bridesmaid"
  | "groomsman"
  | "sibling"
  | "grandparent"
  | "other";

export type OutfitStatus =
  | "not_decided"
  | "shortlisted"
  | "purchased"
  | "alterations"
  | "ready";

export interface OutfitPlannerPerson {
  id: string;
  name: string;
  role: PersonRole;
  side?: "bride" | "groom" | "shared";
}

export interface OutfitPlannerEntry {
  id: string;
  person_id: string;
  event: WardrobeEvent;
  outfit_type?: string;
  colour?: string;
  designer?: string;
  silhouette?: string;
  embroidery?: string;
  status: OutfitStatus;
  jewelry_notes?: string;
  inspiration_image_url?: string;
  couple_notes?: string;
}

export interface OutfitPlannerFormData {
  people: OutfitPlannerPerson[];
  outfits: OutfitPlannerEntry[];
  computed?: {
    total_outfits_planned: number;
    outfits_by_status: Record<OutfitStatus, number>;
    /** % of bride+groom outfits that are at least 'shortlisted'. */
    completion_pct: number;
  };
}

export interface FamilyMember {
  id: string;
  name: string;
  role: string;
  side: "bride" | "groom";
  events_attending: string[];
  /** Photo-forward people get coordination priority. */
  photo_forward: boolean;
}

export interface SidePalette {
  side: "bride" | "groom";
  event: WardrobeEvent;
  /** Hex from outfit planner — the colour to coordinate around. */
  bride_anchor_colour?: string;
  suggested_palette: Array<{
    hex: string;
    label?: string;
    /** AI-generated rationale shown in the palette card. */
    reasoning?: string;
  }>;
  accepted: boolean;
  last_regenerated_at?: string;
}

export interface FamilyOutfit {
  family_member_id: string;
  event: string;
  assigned_colour?: string;
  outfit_type?: string;
  outfit_status: "not_started" | "shopping" | "purchased" | "ready";
  notes?: string;
}

export interface CoordinationRule {
  id: string;
  rule_text: string;
  applies_to_event?: string;
  is_ai_suggested: boolean;
}

export interface FamilyCoordinationFormData {
  family_members: FamilyMember[];
  side_palettes: SidePalette[];
  family_outfits: FamilyOutfit[];
  coordination_rules: CoordinationRule[];
  computed?: {
    total_family: number;
    outfits_assigned: number;
    outfits_with_colour: number;
    palettes_accepted: number;
    rules_count: number;
  };
}

export interface DeliverySlot {
  id: string;
  label: string;
  target_date?: string; // ISO date
  /** Visually flagged as critical (always true for bride's wedding outfit). */
  is_must_flag: boolean;
  status: "pending" | "in_transit" | "delivered" | "late";
  linked_outfit_ids?: string[];
  notes?: string;
}

export interface DeliveryFile {
  id: string;
  name: string;
  type:
    | "receipt"
    | "fabric_swatch_photo"
    | "outfit_photo"
    | "alteration_instructions"
    | "other";
  url: string;
  uploaded_at: string;
  linked_outfit_id?: string;
  notes?: string;
}

export interface AlterationsBuffer {
  enabled: boolean;
  buffer_days: number;
  notes?: string;
}

export interface VendorHandoff {
  /** Sends fabric swatches to Photography. */
  photographer_swatches_shared: boolean;
  /** Sends outfit photos to HMUA. */
  hmua_outfit_photos_shared: boolean;
  notes?: string;
}

export interface DeliveryDocumentsFormData {
  delivery_slots: DeliverySlot[];
  files: DeliveryFile[];
  alterations_buffer: AlterationsBuffer;
  vendor_handoff: VendorHandoff;
  computed?: {
    total_slots: number;
    delivered_count: number;
    late_count: number;
    must_flag_count: number;
    files_count: number;
  };
}

export const DEFAULT_ALTERATIONS_BUFFER: AlterationsBuffer = {
  enabled: true,
  buffer_days: 5,
  notes: "Heavy embroidery on bridesmaids needs extra time.",
};

// ── Person role catalog (Session 1 picker) ─────────────────────────────────

export const PERSON_ROLE_OPTIONS: Array<{ value: PersonRole; label: string }> = [
  { value: "bride", label: "Bride" },
  { value: "groom", label: "Groom" },
  { value: "mother_of_bride", label: "Mother of Bride" },
  { value: "mother_of_groom", label: "Mother of Groom" },
  { value: "father_of_bride", label: "Father of Bride" },
  { value: "father_of_groom", label: "Father of Groom" },
  { value: "bridesmaid", label: "Bridesmaid" },
  { value: "groomsman", label: "Groomsman" },
  { value: "sibling", label: "Sibling" },
  { value: "grandparent", label: "Grandparent" },
  { value: "other", label: "Other" },
];

export const OUTFIT_TYPE_SUGGESTIONS = [
  "Lehenga",
  "Sherwani",
  "Saree",
  "Suit",
  "Gown",
  "Anarkali",
  "Sharara",
  "Kurta",
  "Bandhgala",
  "Tuxedo",
];

export const OUTFIT_STATUS_OPTIONS: Array<{
  value: OutfitStatus;
  label: string;
}> = [
  { value: "not_decided", label: "Not decided" },
  { value: "shortlisted", label: "Shortlisted" },
  { value: "purchased", label: "Purchased" },
  { value: "alterations", label: "In alterations" },
  { value: "ready", label: "Ready" },
];
