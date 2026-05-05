// ── Venue workspace data model ─────────────────────────────────────────────
// Emotional, discovery-led. The shape leads FROM feeling TO decision:
// (1) Dream & Discover — free-form brief, AI venue directions, inspiration
//     gallery, must-haves/dealbreaker chips, free-text wants/avoids.
// (2) Venue Shortlist — cards (not a table) with a lifecycle status, AI
//     suggestions, and a compare-mode sub-view grouped by Feel / Fit /
//     Logistics. Computed requirements live here as a collapsible.
// (3) Spaces & Flow — event→space pairings as a flow, flip notes, floor plan.
// (4) Logistics & Rules — structured fields that other workspaces read.
// (5) Site Visits — per-visit cards, checklist, questions, heart rating.
// (6) Documents — contracts, floor plans, COIs, permits.

export type VenueType =
  | "hotel"
  | "estate"
  | "banquet_hall"
  | "outdoor"
  | "beach"
  | "destination"
  | "restaurant"
  | "private_home";

export const VENUE_TYPE_LABEL: Record<VenueType, string> = {
  hotel: "Hotel",
  estate: "Estate",
  banquet_hall: "Banquet Hall",
  outdoor: "Outdoor",
  beach: "Beach",
  destination: "Destination",
  restaurant: "Restaurant",
  private_home: "Private Home",
};

export interface VenueHeroImage {
  id: string;
  url: string;
  caption?: string;
}

// The profile keeps the fields the AI recommendations engine reads —
// name / venue_type / location. Narrative brief moved onto discovery.
export interface VenueProfile {
  name: string;
  venue_type: VenueType;
  location: string;
  hero_images: VenueHeroImage[];
  floor_plan_url: string | null;
  floor_plan_caption: string;
}

// ── Dream & Discover ──────────────────────────────────────────────────────

export type DirectionReaction = "love" | "not_for_us" | null;

export interface VenueDirection {
  id: string;
  label: string;
  description: string;
  imageUrl: string;
  reaction: DirectionReaction;
}

export type InspirationReaction = "love" | "not_for_us" | null;

export interface InspirationImage {
  id: string;
  url: string;
  caption: string;
  reaction: InspirationReaction;
  directionId?: string | null;
}

export type SingleVsMultiVenue = "single" | "multiple" | null;
export type AccommodationPreference =
  | "on_site"
  | "nearby"
  | "not_important"
  | null;
export type AlcoholPolicyPreference =
  | "full_bar"
  | "beer_wine"
  | "byob"
  | "dry"
  | "no_preference"
  | null;

export interface GuestCountRange {
  smallest_event: number;
  largest_event: number;
}

export interface VenueDiscovery {
  brief_body: string;
  directions: VenueDirection[];
  inspiration: InspirationImage[];
  keyword_chips: string[];
  definitely_want: string[];
  not_for_us: string[];
  quiz: DiscoveryQuizState;

  // ── Cross-mode surface fields ──
  // Surfaced explicitly on Tab 1 of the full workspace and on Sessions 2/3
  // of the guided journey. Both modes read/write the same fields here, so
  // touching them in either reflects in the other.
  single_vs_multi_venue: SingleVsMultiVenue;
  location_preferences: string[];
  guest_count_range: GuestCountRange;
  accommodation_preference: AccommodationPreference;
  accessibility_requirements: string[];
  fire_ceremony_needed: boolean;
  alcohol_policy_preference: AlcoholPolicyPreference;
  rain_plan_needed: boolean;
  setup_teardown_needs: string;
  couple_approved_brief: boolean;
}

// ── Venue Discovery Quiz ──────────────────────────────────────────────────
// 8-step fun, discovery-led quiz that sits ABOVE the free-form brief on the
// Dream & Discover tab. Feeds "Suggested for you" on the Shortlist tab.

export type VenueVibe =
  | "palace_grand"
  | "garden_natural"
  | "modern_minimal"
  | "rustic_warm"
  | "beachfront"
  | "intimate_boutique";

export type GuestCountTier = "intimate" | "medium" | "large" | "grand";
export type IndoorOutdoorPref = "indoor" | "outdoor" | "flexible";
export type EventScope = "one" | "few" | "weekend";
export type CateringPref = "venue" | "outside" | "flexible";

export interface DiscoveryQuizAnswers {
  vibes: VenueVibe[];
  guest_count: GuestCountTier | null;
  indoor_outdoor: IndoorOutdoorPref | null;
  event_scope: EventScope | null;
  catering: CateringPref | null;
  location: string;
  budget_min: number;
  budget_max: number;
  must_haves: string[];
}

export interface DiscoveryQuizState {
  completed: boolean;
  answers: DiscoveryQuizAnswers;
  updated_at: string;
}

// ── Shortlist venues ──────────────────────────────────────────────────────

export type IndoorOutdoor = "indoor" | "outdoor" | "both";

export const INDOOR_OUTDOOR_LABEL: Record<IndoorOutdoor, string> = {
  indoor: "Indoor only",
  outdoor: "Outdoor only",
  both: "Indoor + outdoor",
};

export type VenueStatus =
  | "researching"
  | "site_visit_planned"
  | "visited"
  | "shortlisted"
  | "booked"
  | "passed";

export const VENUE_STATUS_LABEL: Record<VenueStatus, string> = {
  researching: "Researching",
  site_visit_planned: "Site visit planned",
  visited: "Visited",
  shortlisted: "Shortlisted",
  booked: "Booked",
  passed: "Passed",
};

export interface ShortlistVenue {
  id: string;
  name: string;
  location: string;
  vibe_summary: string;
  hero_image_url: string;
  status: VenueStatus;
  compare_checked: boolean;

  // "The fit"
  indoor_outdoor: IndoorOutdoor;
  capacity: string;
  catering_policy: string;
  fire_policy: string;
  noise_curfew: string;
  rooms: string;
  cost_note: string;

  // "The logistics"
  airport_distance: string;
  guest_accommodation: string;
  loading_dock: string;
  power: string;
  permits: string;

  your_notes: string;
  planner_notes: string;

  // ── Standardized questionnaire ──
  // Populated by the venue (eventually via a shared form) or by the couple
  // after a phone/email conversation. Feeds the card facts + comparison table.
  website: string;
  contact_phone: string;
  contact_email: string;
  seated_capacity: string;
  cocktail_capacity: string;
  outdoor_ceremony_capacity: string;
  num_spaces: string;
  alcohol_policy: string;
  corkage_fee: string;
  parking_capacity: string;
  load_in_window: string;
  minimum_night_stay: string;
  included_in_fee: string;
  availability_notes: string;
  virtual_tour_url: string;

  // ── Outreach tracking ──
  date_contacted: string;
  site_visit_date: string;
  // Question ids (from VENUE_QUESTIONNAIRE_CHECKLIST) the couple has asked.
  questions_asked: string[];

  sort_order: number;
}

export type SuggestionStatus = "pending" | "accepted" | "dismissed";

export interface VenueSuggestion {
  id: string;
  name: string;
  location: string;
  vibe_summary: string;
  hero_image_url: string;
  status: SuggestionStatus;
}

// ── Computed requirements (the auto-generated checklist) ──────────────────

export type RequirementGroup =
  | "events"
  | "catering"
  | "decor"
  | "music"
  | "guests"
  | "ceremony"
  | "discovery"
  | "custom";

export const REQUIREMENT_GROUP_LABEL: Record<RequirementGroup, string> = {
  events: "From your events",
  catering: "From Catering",
  decor: "From Décor",
  music: "From Music",
  guests: "From your guests",
  ceremony: "From your Ceremony",
  discovery: "From Dream & Discover",
  custom: "Custom",
};

export interface VenueRequirement {
  id: string;
  group: RequirementGroup;
  label: string;
  met: boolean;
  source_note: string;
  sort_order: number;
  computed: boolean;
}

// ── Venue space (spaces & flow) ───────────────────────────────────────────

export interface VenueSpace {
  id: string;
  name: string;
  use: string;
  capacity: string;
  notes: string;
  image_url: string | null;
  sort_order: number;
  // AI-generated layout idea (seat plan, flow, decor possibility).
  ai_layout_suggestion: string;
}

export interface SpaceEventPairing {
  id: string;
  event_id: string;
  space_id: string;
  sort_order: number;
}

export interface TransitionNote {
  id: string;
  space_id: string;
  flip_time: string;
  changes: string;
  responsible: string;
}

// ── Logistics & rules ─────────────────────────────────────────────────────

export interface VenueLogistics {
  // Access & timing
  load_in_window: string;
  vendor_access: string;
  music_curfew_indoor: string;
  music_curfew_outdoor: string;
  event_end_time: string;
  overtime_rate: string;

  // Catering
  catering_policy: string;
  kitchen_access: string;
  outside_caterer_allowed: boolean;
  preferred_caterer_list: string;
  alcohol_policy: string;
  corkage_fee: string;

  // Décor / vendor access rules
  vendor_loading_window: string;
  wall_attachment_rules: string;
  restrictions: string[];

  // Power
  power_circuits: string;
  power_notes: string;

  // Ceremony
  fire_ceremony_policy: string;
  fire_permit_owner: string;

  // Parking / transport
  parking_capacity: string;
  valet: string;
  shuttle_drop_off: string;
  baraat_rules: string;

  // Rooms / accommodation
  room_block_details: string;
  minimum_night_stay: string;

  // Weather / backup
  wet_weather_backup: string;

  // Insurance / permits
  event_insurance_required: string;
  liquor_liability: string;
}

// ── Site visits ───────────────────────────────────────────────────────────

export interface SiteVisitFollowUp {
  id: string;
  text: string;
  done: boolean;
}

export interface SiteVisitPhoto {
  id: string;
  url: string;
  caption: string;
  // Space the photo captures (e.g. "Ballroom", "Bridal Suite", "Garden").
  space_tag: string;
  // AI-generated read of the space (capacity, suggested use, décor ideas).
  ai_analysis: string;
}

export interface SiteVisitChecklistItem {
  id: string;
  label: string;
  checked: boolean;
}

export type VisitRating = 1 | 2 | 3 | 4 | 5 | null;

export interface SiteVisit {
  id: string;
  visit_index: number;
  date: string;
  attendees: string;
  weather: string;
  photos: SiteVisitPhoto[];
  notes: string;
  follow_ups: SiteVisitFollowUp[];
  checklist: SiteVisitChecklistItem[];
  voice_memo_url: string | null;
  voice_memo_caption: string;
  rating: VisitRating;
  venue_id: string | null;
  sort_order: number;
  // Pre-visit prep quiz answers — map of item id → checked (did you ask?).
  pre_visit_quiz: Record<string, boolean>;
  // AI-generated visit summary (set via the "Summarize this visit" action).
  visit_summary: string;
}

// ── Documents ─────────────────────────────────────────────────────────────

export type VenueDocumentKind =
  | "contract"
  | "floor_plan"
  | "vendor_rules"
  | "insurance"
  | "permit"
  | "photo"
  | "other";

export const VENUE_DOCUMENT_KIND_LABEL: Record<VenueDocumentKind, string> = {
  contract: "Venue contract",
  floor_plan: "Floor plan",
  vendor_rules: "Vendor rules",
  insurance: "Insurance certificate",
  permit: "Permit application",
  photo: "Site visit photos",
  other: "Other",
};

export interface VenueDocument {
  id: string;
  title: string;
  kind: VenueDocumentKind;
  url: string;
  uploaded_at: string;
  notes: string;
  sort_order: number;
}

// ── Store shape ───────────────────────────────────────────────────────────

export interface VenueStoreSlices {
  profile: VenueProfile;
  discovery: VenueDiscovery;
  shortlist: ShortlistVenue[];
  suggestions: VenueSuggestion[];
  requirements: VenueRequirement[];
  spaces: VenueSpace[];
  pairings: SpaceEventPairing[];
  transitions: TransitionNote[];
  logistics: VenueLogistics;
  site_visits: SiteVisit[];
  documents: VenueDocument[];
}
