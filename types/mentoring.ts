// ── Mentoring types ─────────────────────────────────────────────────────────
// "Ask a Married Bride" — recently-married brides opt in as mentors, planning
// brides browse and request mentorship. localStorage-only for now; schema
// mirrors a future Supabase layout so migration is straightforward.

export type MentorCommPref = "chat" | "huddle" | "video";

export type BudgetRange =
  | "under_50k"
  | "50k_100k"
  | "100k_200k"
  | "200k_plus";

export const BUDGET_RANGES: { id: BudgetRange; label: string }[] = [
  { id: "under_50k", label: "Under $50K" },
  { id: "50k_100k", label: "$50K–$100K" },
  { id: "100k_200k", label: "$100K–$200K" },
  { id: "200k_plus", label: "$200K+" },
];

export type ExpertiseCategory =
  | "planning"
  | "culture"
  | "challenges"
  | "style"
  | "logistics";

export interface ExpertiseTag {
  slug: string;
  label: string;
  category: ExpertiseCategory;
  sort_order: number;
}

export const EXPERTISE_CATEGORY_LABELS: Record<ExpertiseCategory, string> = {
  planning: "Planning & logistics",
  culture: "Cultural & tradition",
  challenges: "The hard stuff",
  style: "Style & design",
  logistics: "Logistics",
};

export const EXPERTISE_TAGS: ExpertiseTag[] = [
  // planning
  { slug: "budget_planning", label: "budget planning", category: "planning", sort_order: 1 },
  { slug: "vendor_negotiations", label: "vendor negotiations", category: "planning", sort_order: 2 },
  { slug: "timeline_management", label: "timeline management", category: "planning", sort_order: 3 },
  { slug: "diy_projects", label: "DIY projects", category: "planning", sort_order: 4 },
  { slug: "destination_weddings", label: "destination weddings", category: "planning", sort_order: 5 },
  { slug: "micro_weddings", label: "micro weddings", category: "planning", sort_order: 6 },
  { slug: "multi_day_celebrations", label: "multi-day celebrations", category: "planning", sort_order: 7 },
  // culture
  { slug: "indian_weddings", label: "indian weddings", category: "culture", sort_order: 10 },
  { slug: "south_asian_traditions", label: "south asian traditions", category: "culture", sort_order: 11 },
  { slug: "east_asian_traditions", label: "east asian traditions", category: "culture", sort_order: 12 },
  { slug: "interfaith_ceremonies", label: "interfaith ceremonies", category: "culture", sort_order: 13 },
  { slug: "fusion_weddings", label: "fusion weddings", category: "culture", sort_order: 14 },
  { slug: "western_traditional", label: "western traditional", category: "culture", sort_order: 15 },
  // challenges
  { slug: "family_dynamics", label: "family dynamics", category: "challenges", sort_order: 20 },
  { slug: "seating_chart_politics", label: "seating chart politics", category: "challenges", sort_order: 21 },
  { slug: "guest_list_mgmt", label: "managing guest lists", category: "challenges", sort_order: 22 },
  { slug: "vendor_issues", label: "dealing with vendor issues", category: "challenges", sort_order: 23 },
  { slug: "staying_on_budget", label: "staying on budget", category: "challenges", sort_order: 24 },
  { slug: "pre_wedding_stress", label: "pre-wedding stress", category: "challenges", sort_order: 25 },
  { slug: "day_of_coordination", label: "day-of coordination", category: "challenges", sort_order: 26 },
  // style
  { slug: "decor_design", label: "décor & design", category: "style", sort_order: 30 },
  { slug: "bridal_fashion", label: "bridal fashion", category: "style", sort_order: 31 },
  { slug: "photography_direction", label: "photography direction", category: "style", sort_order: 32 },
  { slug: "floral_design", label: "floral design", category: "style", sort_order: 33 },
  { slug: "hair_makeup", label: "hair & makeup", category: "style", sort_order: 34 },
  // logistics
  { slug: "out_of_town_guests", label: "out-of-town guests", category: "logistics", sort_order: 40 },
  { slug: "hotel_room_blocks", label: "hotel room blocks", category: "logistics", sort_order: 41 },
  { slug: "transportation", label: "transportation", category: "logistics", sort_order: 42 },
];

export function getExpertiseTag(slug: string): ExpertiseTag | undefined {
  return EXPERTISE_TAGS.find((t) => t.slug === slug);
}

// ── Mentor profile ─────────────────────────────────────────────────────────
export interface MentorProfile {
  id: string;
  // Ties the mentor row back to a community profile (same user). We read the
  // wedding context off the linked CommunityProfile at display time so edits
  // stay in sync — only mentor-specific fields live here.
  profile_id: string;

  expertise_tags: string[]; // slugs

  // Mentor context — usually mirrored from CommunityProfile but editable.
  display_name: string;
  wedding_city?: string;
  wedding_date?: string;
  guest_count?: number;
  cultural_tradition: string[]; // e.g. ["south_asian"]
  wedding_style: string[]; // e.g. ["modern", "traditional"]
  budget_range?: BudgetRange;
  number_of_events?: number;

  // Mentor prefs
  max_active_mentees: number;
  preferred_communication: MentorCommPref[];
  availability_note?: string;

  // The three prompts
  one_thing_i_wish?: string;
  best_decision?: string;
  biggest_surprise?: string;

  // Status
  is_active: boolean;
  is_paused: boolean;

  // Stats (derived; recomputed from matches on read)
  total_mentees_helped: number;
  avg_rating: number | null;

  created_at: string;
  updated_at: string;
}

// ── Mentorship match ───────────────────────────────────────────────────────
export type MentorshipStatus =
  | "pending"
  | "active"
  | "declined"
  | "completed"
  | "withdrawn"
  | "expired";

export interface MentorshipMatch {
  id: string;
  mentor_profile_id: string; // MentorProfile.id
  mentee_profile_id: string; // CommunityProfile.id

  request_message?: string;
  topics_interested_in: string[]; // expertise slugs

  status: MentorshipStatus;

  requested_at: string;
  responded_at?: string;
  completed_at?: string;

  decline_reason?: string;

  // On complete (from mentee)
  mentee_rating?: number;
  mentee_feedback?: string;

  // Reference to DM connection created on accept (community_social_store)
  connection_id?: string;

  created_at: string;
  updated_at: string;
}

// 7 days in ms — pending requests expire after this.
export const PENDING_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000;
export const MAX_ACTIVE_MENTORSHIPS_PER_MENTEE = 3;
export const MAX_PENDING_PER_MENTEE = 2;
