// ── Bachelor module types ──────────────────────────────────────────────────
// Non-vendor module: event planning for the groom's bachelor. Structured
// around six tabs — Plan & Vibe, Discover, Guest List & RSVP, Itinerary,
// Budget & Splits, Documents. All state is persisted via
// stores/bachelor-store.ts to localStorage. Mirrors bachelorette but with
// guys-trip vocabulary and a different destination/vibe pool.

export type CelebrationStyle =
  | "weekend_trip"
  | "one_night_out"
  | "golf_weekend"
  | "fishing_trip"
  | "adventure_trip"
  | "destination";

export type RsvpStatus = "going" | "pending" | "cant_make_it";

export type ExpenseSplit =
  | { kind: "equal" }
  | { kind: "individual" }
  | { kind: "organizers" }
  | { kind: "split_among_guests" } // groom covered by crew
  | { kind: "custom"; byPerson: Record<string, number> };

export type PaymentStatus = "unpaid" | "partial" | "paid";

export type DocumentCategory =
  | "reservation"
  | "flight"
  | "booking"
  | "receipt"
  | "photo"
  | "other";

// ── Vibe Profile (Phase 1 of the discovery flow) ───────────────────────────
// Captured by the bachelor vibe-check quiz. Feeds into destination discovery
// / ranking. All fields nullable so a partially filled profile still
// serializes cleanly.

export type BachelorEnergy =
  | "go_big" // Vegas — nightlife, bottle service, zero restraint
  | "guys_trip" // Fishing, golf, bourbon, good meals
  | "get_after_it" // Mountain biking, surfing, skiing, skydiving
  | "lowkey" // Cabin, poker, whiskey, steaks
  | "beach_bars" // Ocean, pool, daytime drinking
  | "event_anchored"; // Built around a game, fight, race, or concert

export type CrewBracket = "4_6" | "7_10" | "11_15" | "16_plus";

export type DurationPref =
  | "one_night" // Big night, local
  | "weekend" // 2 nights
  | "long_weekend" // 3 nights
  | "full_send" // 4+ nights
  | "unsure";

export type BudgetTier =
  | "under_300"
  | "300_600"
  | "600_1000"
  | "1000_2000"
  | "sky";

export type TravelMode = "drive_only" | "fly_open" | "flexible";

// Things the groom actually cares about — used to anchor the trip.
export type GroomInterest =
  | "golf"
  | "fishing"
  | "poker"
  | "bourbon"
  | "craft_beer"
  | "cigars"
  | "sports_watching"
  | "water_sports"
  | "skiing"
  | "hunting"
  | "cars_racing"
  | "live_music"
  | "comedy"
  | "gaming"
  | "bbq_cooking"
  | "hiking";

export interface VibeProfile {
  energy: BachelorEnergy | null;
  crew: CrewBracket | null;
  duration: DurationPref | null;
  budgetTier: BudgetTier | null;
  travelMode: TravelMode | null;
  originAirports: string;
  groomInterests: GroomInterest[];
  avoidTags: string[];
  month: string | null;
  updatedAt: string | null;
}

// ── Destination discovery (Phase 2 — ranked card grid) ─────────────────────

export interface DestinationWeatherMonth {
  high: number;
  low: number;
  // 0–100: visit-quality score.
  score: number;
  flag?: string;
}

export interface Destination {
  id: string;
  name: string;
  // Punchy one-liner — e.g. "Golf by day, Old Town by night, zero regrets".
  hook: string;
  region: "domestic" | "international";
  // 2–3 hex colours for the gradient hero.
  palette: string[];
  heroImage?: string;
  // True when this destination is a realistic weekend drive-to from at
  // least one major US metro.
  drivableWeekend: boolean;
  // 0–100 per energy type. Missing keys default to 30.
  vibeAffinity: Partial<Record<BachelorEnergy, number>>;
  // Interests this destination strongly delivers on.
  interestStrengths: GroomInterest[];
  budgetFit: BudgetTier[];
  crewFit: CrewBracket[];
  // 3–4 short activity phrases, rendered as chips.
  activityHighlights: string[];
  // Per-month weather + quality score.
  weather: Record<string, DestinationWeatherMonth>;
  // Estimated per-person cost ranges in USD for the budget tiers where
  // this destination makes sense. `[min, max]`.
  estPerPersonUsd: Partial<Record<BudgetTier, [number, number]>>;
  // Avoid-tags this destination triggers.
  avoidSignals: string[];
  yellowFlag?: string;
  redFlag?: string;
  // Optional deep-dive playbook — the hand-curated "best friend who's done
  // this 50 times" content. Destinations without a playbook show a
  // "playbook coming soon" state.
  playbook?: DestinationPlaybook;
}

// ── Destination deep-dive playbook ─────────────────────────────────────────
// Hand-curated content for the Phase-3 detail view. Written in the
// buddy-in-the-group-chat tone described in the spec — opinionated,
// specific, and honest about money/logistics.

export type PlaybookFoodCategory =
  | "anchor_dinner"
  | "group_lunch"
  | "morning_after"
  | "dive_bar"
  | "steakhouse"
  | "sports_bar"
  | "late_night"
  | "brewery_distillery";

export type PlaybookActivityCategory =
  | "competitive"
  | "water"
  | "adrenaline"
  | "chill"
  | "food_drink"
  | "sports_events"
  | "nightlife"
  | "unique";

export type PlaybookIntensity = "easy" | "moderate" | "full_send";

export interface PlaybookDay {
  // "Day 1", "Day 2"…
  label: string;
  // "Touch Down, Set Up, Go"
  title: string;
  // One-paragraph buddy-voice narrative.
  body: string;
  // 3–6 bullet highlights to render as a mini-schedule.
  highlights: { time?: string; activity: string }[];
}

export interface PlaybookFoodPick {
  category: PlaybookFoodCategory;
  name: string;
  neighborhood: string;
  // Dollar sign string, e.g. "$$$".
  priceRange: string;
  // Realistic per-person including drinks.
  perPerson: string;
  vibe: string;
  // "Reserve 6 weeks out" / "Walk-in fine" / "Call ahead for 10+"
  reservationNote: string;
  groupNote?: string;
  insiderTip: string;
}

export interface PlaybookActivity {
  category: PlaybookActivityCategory;
  name: string;
  costPerPerson: string; // "$150/person" or "Free"
  groupSize: string; // "Max 12" / "4-16 works"
  bookingLead: string; // "60 days out" / "Walk up"
  duration: string; // "2 hours" / "Half day"
  intensity: PlaybookIntensity;
  weatherDependent: boolean;
  // Optional alignment flags — shown if user's groom interests match.
  interestTags?: GroomInterest[];
  note?: string;
}

export interface PlaybookAccommodation {
  // "The House" recommendation + neighborhood tips.
  house?: string;
  // When a hotel makes more sense.
  hotel?: string;
  // Resort / boutique / unique stay.
  upgrade?: string;
  // Budget move.
  budget?: string;
}

export interface PlaybookLogistics {
  gettingThere: string;
  gettingAround: string;
  moneyMath: string;
  bookingTimeline: string;
  bestManTips: string;
}

export interface DestinationPlaybook {
  // Why this destination works for this kind of crew — the one-paragraph
  // overview shown under the hero.
  overview: string;
  // 2–4 day itinerary. Render all days; duration nudge in the header if the
  // user picked something shorter/longer.
  sampleItinerary: PlaybookDay[];
  foodAndDrink: PlaybookFoodPick[];
  activities: PlaybookActivity[];
  accommodation: PlaybookAccommodation;
  logistics: PlaybookLogistics;
}

export interface DestinationScore {
  destinationId: string;
  score: number;
  breakdown: {
    vibe: number;
    budget: number;
    weather: number;
    travel: number;
    crew: number;
    interests: number;
  };
  weatherNote: string | null;
  matchTag: string;
}

// ── Tab 1 — Plan & Vibe ────────────────────────────────────────────────────

export interface Organizer {
  id: string;
  name: string;
  role?: string;
}

export interface DressCode {
  id: string;
  eventLabel: string; // e.g. "Boat day"
  description: string; // e.g. "Swim trunks, sun shirts, caps"
}

export interface MoodboardPin {
  id: string;
  imageUrl: string;
  category: MoodboardCategory;
  note?: string;
}

export type MoodboardCategory =
  | "venues"
  | "outfits"
  | "activities"
  | "food_drinks"
  | "gear";

export interface GroomPreferences {
  loves: string[];
  avoid: string[];
  dietary: string[];
}

export interface PartyBasics {
  groomName: string;
  organizers: Organizer[];
  dateRange: string;
  location: string;
  style: CelebrationStyle | null;
  guestCount: number;
  surpriseMode: boolean;
}

export interface VibeSettings {
  theme: string | null;
  customTheme: string;
  colorScheme: string[];
  dressCodes: DressCode[];
}

// ── Tab 2 — Guest List & RSVP ──────────────────────────────────────────────

export interface Guest {
  id: string;
  name: string;
  role: string; // "Best Man / Host", "Groomsman", "Brother", "Friend", custom
  rsvp: RsvpStatus;
  roomId: string | null;
  notes?: string;
}

export interface Room {
  id: string;
  label: string;
  capacity: number;
}

// ── Tab 3 — Itinerary ──────────────────────────────────────────────────────

export interface ItineraryEvent {
  id: string;
  dayId: string;
  time: string;
  activity: string;
  location?: string;
  dressCode?: string;
  reservation?: string;
  notes?: string;
  confirmed: boolean;
  optional?: boolean;
}

export interface ItineraryDay {
  id: string;
  date: string;
  label: string; // "Roll in", "The main event", "Send-off"
}

// ── Tab 4 — Budget & Splits ────────────────────────────────────────────────

export interface Expense {
  id: string;
  label: string;
  amountCents: number;
  split: ExpenseSplit;
  notes?: string;
  paidByGuestId?: string | null;
  meta?: Record<string, unknown>;
}

export interface GuestPayment {
  guestId: string;
  paidCents: number;
  status: PaymentStatus;
}

export interface OrganizerNote {
  id: string;
  createdAt: string;
  body: string;
}

export type SplittingRule = "equal" | "groom_pays_own" | "custom";

export interface BudgetSettings {
  splittingRule: SplittingRule;
  groomPaysShare: boolean;
}

// ── Tab 5 — Documents ──────────────────────────────────────────────────────

export interface BachelorDocument {
  id: string;
  label: string;
  category: DocumentCategory;
  url?: string;
  addedAt: string;
  notes?: string;
}

// ── Store root state ───────────────────────────────────────────────────────

export interface BachelorState {
  basics: PartyBasics;
  vibe: VibeSettings;
  vibeProfile: VibeProfile;
  moodboard: MoodboardPin[];
  groomPrefs: GroomPreferences;

  guests: Guest[];
  rooms: Room[];

  days: ItineraryDay[];
  events: ItineraryEvent[];

  expenses: Expense[];
  payments: Record<string, GuestPayment>;
  organizerNotes: OrganizerNote[];
  budget: BudgetSettings;

  documents: BachelorDocument[];
}
