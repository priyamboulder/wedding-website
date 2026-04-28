// ── Honeymoon module types ─────────────────────────────────────────────────
// Non-vendor module: trip planning for the post-wedding honeymoon. Six tabs —
// Dream & Plan, Destinations, Bookings & Itinerary, Budget & Registry,
// Packing & Prep, Documents. Persisted via stores/honeymoon-store.ts.

export type HoneymoonTimingWhen =
  | "right_after"
  | "mini_then_big"
  | "couple_weeks_after"
  | "later"
  | "unsure";

export type HoneymoonDuration =
  | "long_weekend"
  | "one_week"
  | "two_weeks"
  | "three_plus"
  | "mini_then_big";

export type HoneymoonVibe =
  | "beach"
  | "adventure"
  | "city_culture"
  | "food_wine"
  | "romance"
  | "luxury"
  | "unplugged"
  | "road_trip"
  | "bucket_list";

export type HoneymoonClimate =
  | "tropical"
  | "temperate"
  | "cold"
  | "no_preference";

export type MoodboardCategory =
  | "beaches"
  | "hotels"
  | "food"
  | "adventure"
  | "scenery"
  | "romance";

export type DestinationStatus = "leading" | "considering" | "passed";

export type BookingStatus =
  | "booked"
  | "hold"
  | "researching"
  | "wishlist";

export type BookingPriorityTier =
  | "now"
  | "six_weeks"
  | "two_weeks"
  | "day_of"
  | "unset";

export type PackingSection = "documents" | "health" | "practical" | "packing";

export type DocumentCategory =
  | "flight"
  | "hotel"
  | "activity"
  | "insurance"
  | "passport"
  | "visa"
  | "reservation"
  | "other";

export type FundingSource =
  | "self_funded"
  | "gifted"
  | "registry"
  | "mixed";

// ── Tab 1 — Dream & Plan ───────────────────────────────────────────────────

export interface HoneymoonVision {
  when: HoneymoonTimingWhen | null;
  laterMonth: string; // free text when when === "later"
  duration: HoneymoonDuration | null;
  vibes: HoneymoonVibe[];
  climate: HoneymoonClimate | null;
  dealBreakers: string[];
}

export interface HoneymoonBrief {
  body: string;
}

export interface MoodboardPin {
  id: string;
  imageUrl: string;
  category: MoodboardCategory;
  note?: string;
}

// ── Tab 2 — Destinations ───────────────────────────────────────────────────

export interface Destination {
  id: string;
  emoji: string;
  name: string;
  region: string; // e.g. "Indonesia"
  status: DestinationStatus;
  favorite: boolean;
  inComparison: boolean;
  whyItFits: string;
  considerations: {
    flight: string; // "20+ hours from DFW (1-2 stops)"
    visa: string;
    bestTime: string;
    budgetRange: string; // "$3,000-$8,000 for 10 days"
    jetLag: string;
  };
  budgetSingleCents: number; // for comparison
  duration: string; // "10 days"
  flightLength: string; // "20h flight"
  seasonOk: string; // "Apr-Oct ✓"
  notes: string;
}

// ── Tab 3 — Bookings & Itinerary ──────────────────────────────────────────

export interface Booking {
  id: string;
  label: string;
  status: BookingStatus;
  costCents: number;
  estimated: boolean;
  confirmationNumber?: string;
  priorityTier?: BookingPriorityTier;
}

export interface ItineraryDay {
  id: string;
  date: string; // "Saturday, April 26"
  dayNumber: number;
  label: string; // "Travel", "Arrive in Bali"
}

export interface ItineraryItem {
  id: string;
  dayId: string;
  time: string; // "11:00 AM", "Morning"
  title: string;
  note?: string;
  confirmed: boolean;
}

// ── Tab 4 — Budget & Registry ──────────────────────────────────────────────

export type BudgetLineCategory =
  | "flights"
  | "accommodation"
  | "activities"
  | "food"
  | "transport"
  | "shopping"
  | "buffer"
  | "other";

export interface BudgetLine {
  id: string;
  label: string;
  category: BudgetLineCategory;
  amountCents: number;
  paid: boolean;
  estimated: boolean;
}

export interface RegistryFundItem {
  id: string;
  label: string;
  goalCents: number;
  raisedCents: number;
}

export interface BudgetSettings {
  totalBudgetCents: number;
  fundingSources: FundingSource[];
  registryConnected: boolean;
  registryShareUrl: string;
}

// ── Dream Session quiz profile (Phase 1) ───────────────────────────────────
// Richer answers from the 8-question guided flow. Populated by the quiz,
// read by destination matching in later phases. Kept separate from the
// original `vision` so the free-form Dream & Plan form still works
// uninterrupted for couples who skip the quiz.

export type HoneymoonVibeTile =
  | "barefoot_unplugged"
  | "wander_discover"
  | "adventure_for_two"
  | "wine_dine_romance"
  | "full_luxury"
  | "variety_mix";

export type HoneymoonBudgetTier =
  | "under_3k"
  | "3k_6k"
  | "6k_10k"
  | "10k_15k"
  | "15k_25k"
  | "over_25k";

export type HoneymoonFlightTolerance =
  | "domestic_short"
  | "na_caribbean"
  | "longhaul_ok"
  | "exotic_ok"
  | "drive_only";

export type HoneymoonTripDuration =
  | "long_weekend"
  | "one_week"
  | "ten_days"
  | "two_weeks_plus"
  | "unsure";

export type HoneymoonTimingV2 =
  | "right_after"
  | "within_month"
  | "minimoon_then_big"
  | "flexible"
  | "specific_month";

export type HoneymoonPriorityInterest =
  | "food"
  | "beaches"
  | "privacy"
  | "culture"
  | "adventure"
  | "nightlife"
  | "spa"
  | "wildlife"
  | "unique"
  | "photography"
  | "ease";

export type HoneymoonDealbreaker =
  | "long_flights"
  | "extreme_heat"
  | "humidity"
  | "remote_medical"
  | "language"
  | "health_advisory"
  | "crowds"
  | "all_inclusive_yes"
  | "all_inclusive_no"
  | "malaria"
  | "rough_seas"
  | "altitude";

export type HoneymoonTravelExperience =
  | "extensive"
  | "some"
  | "first_time";

export interface HoneymoonVibeProfile {
  vibes: HoneymoonVibeTile[];
  duration: HoneymoonTripDuration | null;
  budgetTier: HoneymoonBudgetTier | null;
  flightTolerance: HoneymoonFlightTolerance | null;
  timing: HoneymoonTimingV2 | null;
  travelMonth: string;
  priorityInterests: HoneymoonPriorityInterest[];
  dealbreakers: HoneymoonDealbreaker[];
  travelExperience: HoneymoonTravelExperience | null;
}

// ── Tab 5 — Packing & Prep ─────────────────────────────────────────────────

export interface ChecklistItem {
  id: string;
  label: string;
  section: PackingSection;
  done: boolean;
  note?: string;
  warning?: boolean;
}

// ── Tab 6 — Documents ──────────────────────────────────────────────────────

export interface HoneymoonDocument {
  id: string;
  label: string;
  category: DocumentCategory;
  url?: string;
  addedAt: string; // ISO
  notes?: string;
}

// ── Store root state ───────────────────────────────────────────────────────

export interface HoneymoonState {
  vision: HoneymoonVision;
  vibeProfile: HoneymoonVibeProfile;
  brief: HoneymoonBrief;
  moodboard: MoodboardPin[];

  destinations: Destination[];

  bookings: Booking[];
  days: ItineraryDay[];
  items: ItineraryItem[];

  budgetLines: BudgetLine[];
  budget: BudgetSettings;
  registryFundItems: RegistryFundItem[];

  checklist: ChecklistItem[];

  documents: HoneymoonDocument[];
}
