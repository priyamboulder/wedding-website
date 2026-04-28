// ── Baby Shower module types ───────────────────────────────────────────────
// Non-vendor celebration module. Lives under Memories & Keepsakes alongside
// bachelorette and bridal shower. Six tabs: Plan & Vibe · Discover · Guest
// List & RSVP · Itinerary · Budget & Contributions · Documents.
//
// Core differences from bridal shower: a funding-model selector (baby
// showers have multiple plausible funders), explicit kid count on guests,
// a run-of-show itinerary rather than a multi-day one, and a "surprise
// mode" flag that changes RSVP messaging.
//
// All state persists via stores/baby-shower-store.ts to localStorage.

// ── Planner / host role ────────────────────────────────────────────────────

export type BabyShowerPlannerRole =
  | "host"
  | "parent_to_be"
  | "co_host";

// ── Funding model (baby showers have more variance than bridal) ────────────

export type BabyShowerFundingModel =
  | "host_funded"
  | "co_host_split"
  | "group_fund"
  | "parent_funded";

// ── Vibe (multi-select) ────────────────────────────────────────────────────

export type BabyShowerVibe =
  | "garden_party"
  | "modern_minimal"
  | "brunch_bubbles"
  | "co_ed"
  | "cultural_traditional"
  | "adventure_babymoon"
  | "book_themed"
  | "virtual_hybrid"
  | "surprise";

// ── Guest count tier ───────────────────────────────────────────────────────

export type BabyShowerGuestTier =
  | "intimate" // 5-15
  | "medium" // 15-30
  | "large" // 30-50
  | "grand"; // 50+

export type BabyShowerGuestMix = "adults_only" | "kids_welcome" | "mixed";

// ── Venue type ─────────────────────────────────────────────────────────────

export type BabyShowerVenueType =
  | "home"
  | "restaurant"
  | "banquet_hall"
  | "hotel"
  | "cultural_center"
  | "outdoors"
  | "destination"
  | "undecided";

// ── Season (auto-derived from shower date but overridable) ─────────────────

export type BabyShowerSeason = "spring" | "summer" | "fall" | "winter";

// ── Hard no's (multi-select + free-text catch-all) ─────────────────────────

export type BabyShowerHardNo =
  | "no_games"
  | "no_gender_reveal"
  | "no_alcohol"
  | "no_surprise";

// ── Plan & Vibe (Tab 1 state) ──────────────────────────────────────────────

export interface BabyShowerPlan {
  dueDate: string;
  showerDate: string;
  showerWindow: string;
  plannerRole: BabyShowerPlannerRole | null;
  coHostInvite: string;
  isSurprise: boolean;
  guestTier: BabyShowerGuestTier | null;
  guestMix: BabyShowerGuestMix | null;
  vibes: BabyShowerVibe[];
  venueType: BabyShowerVenueType | null;
  venueName: string;
  venueCapacity: string;
  cateringIncluded: "yes" | "no" | "unsure" | null;
  avAvailable: "yes" | "no" | "unsure" | null;
  venueRestrictions: string;
  season: BabyShowerSeason | null;
  hardNos: BabyShowerHardNo[];
  dietaryRestrictions: string;
  accessibilityNeeds: string;
  budgetCeilingCents: number;
  thingsThatFeelLikeUs: string[];
  updatedAt: string | null;
}

// ── Recommendation type (themes, activities, menus, vendors) ───────────────

export type BabyShowerRecType =
  | "theme"
  | "activity"
  | "menu"
  | "vendor"
  | "destination";

export interface BabyShowerRec {
  id: string;
  type: BabyShowerRecType;
  name: string;
  tagline: string;
  narrative: string;
  heroPalette: string[];
  detailPills: string[];
  // Tags the scorer matches against.
  vibes: BabyShowerVibe[];
  venueTypes: BabyShowerVenueType[];
  seasons: BabyShowerSeason[];
  minGuests: number;
  maxGuests: number;
  // Rough per-event cost range. Used for budget-fit scoring.
  costLowCents: number;
  costHighCents: number;
  kidFriendly: boolean;
  culturalFit: boolean;
  // Hard no's that invalidate this rec (scored as a penalty).
  violates: BabyShowerHardNo[];
  // Pairings suggest complementary recs.
  pairings: string[];
  seasonNote: string;
  whyItMatches: string;
  whatYoullNeed: string[];
  suggestedDuration: string;
}

export interface BabyShowerRecMatch {
  rec: BabyShowerRec;
  score: number;
  matchReasons: string[];
  dismissed: boolean;
}

// ── Recommendation status (overlay kept in store) ──────────────────────────

export type BabyShowerRecStatus = "suggested" | "saved" | "selected" | "dismissed";

// ── Guests ─────────────────────────────────────────────────────────────────

export type BabyShowerRsvp = "not_sent" | "invited" | "going" | "maybe" | "declined";

export type BabyShowerGuestSide = "yours" | "partners" | "shared";

export interface BabyShowerGuest {
  id: string;
  name: string;
  email: string;
  phone: string;
  groupTag: string;
  side: BabyShowerGuestSide;
  rsvp: BabyShowerRsvp;
  plusOnes: number;
  kidsCount: number;
  dietary: string;
  accessibility: string;
  rsvpMessage: string;
  contributionCents: number;
  contributionStatus: "none" | "pledged" | "paid";
}

// ── Co-hosts ───────────────────────────────────────────────────────────────

export interface BabyShowerCoHost {
  id: string;
  name: string;
  email: string;
  shareCents: number;
  paidCents: number;
  status: "pending" | "partial" | "paid";
  permissions: "full" | "view_only";
}

// ── Itinerary (run-of-show) ────────────────────────────────────────────────

export type BabyShowerBlockType =
  | "standard"
  | "highlight"
  | "optional"
  | "behind_the_scenes";

export interface BabyShowerItineraryItem {
  id: string;
  dayNumber: number;
  startTime: string;
  durationMinutes: number;
  activityName: string;
  description: string;
  blockType: BabyShowerBlockType;
  sortOrder: number;
  sourceRecId: string | null;
}

// ── Budget / expenses / contributions ──────────────────────────────────────

export type BabyShowerExpenseCategory =
  | "venue"
  | "catering"
  | "decorations"
  | "activities"
  | "cake_dessert"
  | "invitations"
  | "favors"
  | "rentals"
  | "entertainment"
  | "photography"
  | "mehndi"
  | "other";

export interface BabyShowerExpense {
  id: string;
  category: BabyShowerExpenseCategory;
  vendor: string;
  amountCents: number;
  date: string;
  paidBy: string;
  receiptUrl: string;
  notes: string;
  source: "manual" | "receipt_scan";
}

// ── Budget overlay ─────────────────────────────────────────────────────────

export interface BabyShowerBudget {
  totalBudgetCents: number;
  groupFundGoalCents: number;
}

// ── Documents ──────────────────────────────────────────────────────────────

export type BabyShowerDocCategory =
  | "vendor_contract"
  | "receipt"
  | "inspiration"
  | "guest_info"
  | "other";

export interface BabyShowerDocument {
  id: string;
  name: string;
  url: string;
  category: BabyShowerDocCategory;
  uploadedAt: string;
  sizeLabel: string;
}

// ── Store root state ───────────────────────────────────────────────────────

export interface BabyShowerState {
  parentName: string;
  plan: BabyShowerPlan;
  funding: BabyShowerFundingModel;
  recStatus: Record<string, BabyShowerRecStatus>;
  guests: BabyShowerGuest[];
  coHosts: BabyShowerCoHost[];
  itinerary: BabyShowerItineraryItem[];
  budget: BabyShowerBudget;
  expenses: BabyShowerExpense[];
  documents: BabyShowerDocument[];
}
