// ── Mehendi Artist workspace types ─────────────────────────────────────────
// Backs the five-tab rebuilt Mehendi workspace: Your Mehendi Story, Who Gets
// Mehendi, Find Your Artist, Day-of Flow, Documents. Lives separate from the
// generic workspace store so Mehendi can evolve without rippling.

// ── Your Mehendi Story ─────────────────────────────────────────────────────

export interface MehndiBrief {
  category_id: string;
  body: string;
  updated_at: string;
}

// One pinned inspiration image. `reaction` lets the couple triage seeded
// suggestions (Love / Not for us) before the artist uses them.
export interface MehndiReference {
  id: string;
  category_id: string;
  // Body-area bucket — secondary filter ("which part of the body").
  bucket: "full_bridal" | "arabic" | "minimal" | "feet" | "back_of_hand";
  // Vibe tag — primary filter ("how does this feel"). Optional so legacy
  // user-added references still render without a vibe.
  vibe?: VibeTag | null;
  image_url: string;
  caption: string;
  reaction: "love" | "pass" | "unset";
  source: "seed" | "user";
  created_at: string;
}

export type VibeTag =
  | "storytelling"
  | "flowing"
  | "dense_traditional"
  | "minimal_geometric"
  | "feet_legs"
  | "couple_matching";

// ── Bridal coverage ────────────────────────────────────────────────────────
// Story tab: three visual-card questions that scope how much mehendi the
// bride wants done. Used by the artist to estimate work time.

export type ArmCoverage =
  | "hands_only"
  | "past_wrist"
  | "mid_forearm"
  | "full_elbow";

export type HandSide = "front" | "back" | "both";

export type FeetCoverage = "full" | "tops_only" | "none";

export const ARM_COVERAGE_LABEL: Record<ArmCoverage, string> = {
  hands_only: "Just the hands",
  past_wrist: "A few inches past the wrist",
  mid_forearm: "Up to mid-forearm",
  full_elbow: "Full coverage to the elbow",
};

export const ARM_COVERAGE_HINT: Record<ArmCoverage, string> = {
  hands_only: "Wrists and below",
  past_wrist: "Just past the wrist bone",
  mid_forearm: "About halfway to the elbow",
  full_elbow: "All the way up",
};

export const HAND_SIDE_LABEL: Record<HandSide, string> = {
  front: "Front of hands only",
  back: "Back of hands only",
  both: "Both front and back",
};

export const FEET_COVERAGE_LABEL: Record<FeetCoverage, string> = {
  full: "Yes — full feet design",
  tops_only: "Yes — just the tops",
  none: "No feet mehendi",
};

// Reference image uploaded by the couple for a hidden-detail or personal
// touch (e.g. a family crest, a specific flower). Shown as a thumbnail
// grid with an optional note per image.
export interface PersonalTouchImage {
  id: string;
  category_id: string;
  url: string;
  note: string;
  created_at: string;
}

export const REFERENCE_BUCKET_LABEL: Record<MehndiReference["bucket"], string> = {
  full_bridal: "Full bridal",
  arabic: "Arabic",
  minimal: "Minimal",
  feet: "Feet",
  back_of_hand: "Back of hand",
};

export const VIBE_TAG_LABEL: Record<VibeTag, string> = {
  storytelling: "Storytelling",
  flowing: "Flowing & airy",
  dense_traditional: "Dense & traditional",
  minimal_geometric: "Minimal & geometric",
  feet_legs: "Feet & legs",
  couple_matching: "Couple matching",
};

// Kept for migration — legacy "personal elements" rows get folded into
// the richer HiddenDetails block inside MehndiStylePrefs.
export interface MehndiPersonalElement {
  id: string;
  category_id: string;
  label: string;
  selected: boolean;
  detail: string;
  sort_order: number;
}

// Deprecated — free-text want/avoid now lives on MehndiStylePrefs as chip
// lists. Kept in the type surface so v2 migrations don't choke.
export interface MehndiWantLists {
  category_id: string;
  want: string;
  avoid: string;
}

// Per-couple style preferences rolling up the rebuilt Story tab's direction
// cards, keyword chips, hidden details, and want/avoid chip lists. Stored
// per category_id — one row per workspace.
export interface MehndiStylePrefs {
  category_id: string;
  // Direction card IDs from STYLE_DIRECTIONS seed — triaged into love/pass.
  loved_directions: string[];
  passed_directions: string[];
  // Style keywords — chips the couple collects from suggestions or types
  // themselves.
  keywords: string[];
  // Bridal coverage answers (visual cards on the Story tab). Null until
  // the couple picks; lets the UI show "not set" instead of a default.
  arm_coverage: ArmCoverage | null;
  hand_side: HandSide | null;
  feet_coverage: FeetCoverage | null;
  // Hidden details & personal touches.
  partner_initials_toggle: boolean;
  partner_initials_placement: string;
  meaningful_symbols: string[];
  matching_elements_toggle: boolean;
  matching_elements_notes: string;
  motifs_to_avoid: string;
  // Free-text chip lists, same pattern as Photography's want/avoid.
  definitely_want: string[];
  not_for_us: string[];
}

// ── Who Gets Mehendi ───────────────────────────────────────────────────────

export type SchedulingMode = "priority_queue" | "appointments" | "hybrid";

export type DesignTier = "quick" | "classic" | "detailed";

export const DESIGN_TIER_LABEL: Record<DesignTier, string> = {
  quick: "Quick & Pretty",
  classic: "Classic",
  detailed: "Detailed",
};

export const DESIGN_TIER_MINUTES: Record<DesignTier, number> = {
  quick: 15,
  classic: 30,
  detailed: 45,
};

export const DESIGN_TIER_DESCRIPTION: Record<DesignTier, string> = {
  quick: "One finger, back of hand, or a small wrist design.",
  classic: "Full back of hand with finger tips.",
  detailed: "Both hands, front and back, partial arm.",
};

export interface GuestSlot {
  id: string;
  category_id: string;
  guest_name: string;
  // Optional pointer into the shared guest list (when linking is wired up).
  guest_id: string | null;
  // Artist station index (1-based). Null for priority-queue / hybrid mode
  // where stations aren't pre-assigned.
  station: number | null;
  // Start time "HH:mm" (24-hour). Null when unscheduled.
  start_time: string | null;
  tier: DesignTier;
  status: "pending" | "notified" | "done";
  // When a guest signed up via the shareable link this records their
  // requested tier so the host sees "requested full hand" even before an
  // appointment time is assigned.
  requested_tier: DesignTier | null;
  notes: string;
  sort_order: number;
}

// VIP list — bride, mothers, sisters, bridal party who always go first
// regardless of scheduling mode. Entered as plain rows so couples can
// build this ahead of linking to the wider guest list.
export interface MehndiVipGuest {
  id: string;
  category_id: string;
  name: string;
  role: string;
  sort_order: number;
}

export interface EventSetup {
  category_id: string;
  stations: number;
  seating:
    | "chairs_with_armrests"
    | "cushions_low_seating"
    | "mixed";
  lighting: "natural_daylight" | "task_lighting" | "mixed";
  ventilation: "open_air" | "well_ventilated_indoor" | "standard_indoor";
  drying_plan: string;
  entertainment: string;
  event_duration_hours: number;
  expected_guest_count: number;
  scheduling_mode: SchedulingMode;
  avg_tier: DesignTier;
  // How many guests can sign up for each tier. Caps the capacity tiers
  // the guest sign-up link will allow. When a tier fills, the sign-up
  // page greys it out.
  tier_capacity: Record<DesignTier, number>;
  // Event date + start time so the sign-up page can present concrete
  // time-slot options to guests. Strings in "YYYY-MM-DD" and "HH:mm"
  // (24-hour) form. Empty string = not set.
  event_date: string;
  event_start_time: string;
  // Couple's signup link + whether it's active. Share text is derived.
  signup_open: boolean;
}

// A guest with a named spot in the Detailed tier — typically bride's
// sisters, close cousins, bridesmaids. Separate from the VIP list so the
// couple can scope the detailed-tier lineup without displacing the VIP
// ordering.
export interface MehndiDetailedTierGuest {
  id: string;
  category_id: string;
  name: string;
  relationship: string;
  sort_order: number;
}

// ── Day-of Flow ────────────────────────────────────────────────────────────

export interface ScheduleItem {
  id: string;
  category_id: string;
  // "HH:mm" 24-hour local time the item starts.
  time: string;
  title: string;
  detail: string;
  // Flags the bride-specific rows (paste dry, lemon-sugar) so the UI can
  // tint them distinctly.
  track: "general" | "bride";
  sort_order: number;
}

export interface BrideCarePlan {
  category_id: string;
  assignee_name: string;
  assignee_role: string;
  assignee_contact: string;
  tasks: string;
}

// Day-of logistics checklist (seating, lighting, ventilation). Flat row with
// booleans so the couple can tick it off with the planner.
export interface MehndiLogisticsCheck {
  category_id: string;
  chairs_confirmed: boolean;
  lighting_arranged: boolean;
  ventilation_ready: boolean;
  drying_area_set: boolean;
  entertainment_plan: string;
}

// ── Find Your Artist ───────────────────────────────────────────────────────

export type ContractChecklistItemId =
  | "artists_hours"
  | "bride_complexity"
  | "guest_coverage"
  | "travel_stay"
  | "natural_henna"
  | "touch_up"
  | "cancellation";

export interface ContractChecklistItem {
  category_id: string;
  item_id: ContractChecklistItemId;
  checked: boolean;
  notes: string;
}

// ── Documents ──────────────────────────────────────────────────────────────

export type DocumentKind =
  | "portfolio"
  | "contract"
  | "sketch"
  | "aftercare"
  | "other";

export const DOCUMENT_KIND_LABEL: Record<DocumentKind, string> = {
  portfolio: "Portfolio",
  contract: "Contract",
  sketch: "Design sketch",
  aftercare: "Aftercare",
  other: "Other",
};

export interface MehndiDocument {
  id: string;
  category_id: string;
  kind: DocumentKind;
  title: string;
  url: string;
  note: string;
  created_at: string;
}
