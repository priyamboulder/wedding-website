// ── Bachelorette module types ──────────────────────────────────────────────
// Non-vendor module: event planning for the bride's bachelorette. Structured
// around five tabs — Plan & Vibe, Guest List & RSVP, Itinerary, Budget &
// Splits, Documents. All state is persisted via stores/bachelorette-store.ts
// to localStorage.

export type CelebrationStyle =
  | "weekend_trip"
  | "one_night_out"
  | "spa_day"
  | "dinner_party"
  | "adventure_trip"
  | "destination";

export type RsvpStatus = "going" | "pending" | "cant_make_it";

export type ExpenseSplit =
  | { kind: "equal" }
  | { kind: "individual" }
  | { kind: "organizers" }
  | { kind: "split_among_guests" } // bride covered by guests
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
// Captured by the bachelorette vibe-check quiz. Feeds into destination
// discovery / ranking in later slices. All fields nullable so a partially
// filled profile still serializes cleanly.

export type BacheloretteEnergy =
  | "party"
  | "pamper"
  | "adventure"
  | "bougie"
  | "beach"
  | "unexpected";

export type CrewBracket = "4_6" | "7_10" | "11_15" | "16_plus";

export type DurationPref = "weekend" | "long_weekend" | "full_week" | "unsure";

export type BudgetTier =
  | "under_300"
  | "300_600"
  | "600_1000"
  | "1000_2000"
  | "sky";

export type TravelMode = "drive_only" | "fly_open" | "flexible";

export interface VibeProfile {
  energy: BacheloretteEnergy | null;
  crew: CrewBracket | null;
  duration: DurationPref | null;
  budgetTier: BudgetTier | null;
  travelMode: TravelMode | null;
  originAirports: string;
  avoidTags: string[];
  month: string | null;
  updatedAt: string | null;
}

// ── Destination discovery (Phase 2 — ranked card grid) ─────────────────────
// A curated library of bachelorette destinations each carry enough metadata
// for a pure scoring function to rank them against a VibeProfile. Lives in
// lib/bachelorette-destinations.ts. No runtime fetch — hand-curated content.

export interface DestinationWeatherMonth {
  // Average daily high / low in Fahrenheit. Rounded integers.
  high: number;
  low: number;
  // 0–100: how good is this month for visiting. ≥85 = peak, 60–84 =
  // shoulder, <60 = avoid-or-at-least-warn.
  score: number;
  // Optional one-line editorial callout, shown under the card badge when
  // the profile's travel month matches this entry.
  flag?: string;
}

export interface Destination {
  id: string;
  name: string;
  // One-line editorial hook — e.g. "Live music, BBQ smoke, and rooftop pools".
  hook: string;
  region: "domestic" | "international";
  // 2–3 hex colours — used to paint the card hero gradient when no image
  // is available.
  palette: string[];
  // Optional external image URL. When present, overlays the gradient.
  heroImage?: string;
  // True when this destination is a realistic weekend drive-to from at
  // least one major US metro (used to filter when travelMode=drive_only).
  drivableWeekend: boolean;
  // 0–100 per energy type. Missing keys default to 30 (weak match).
  vibeAffinity: Partial<Record<BacheloretteEnergy, number>>;
  // Budget tiers that comfortably fit here. Near-miss tiers get partial
  // credit in the scoring function.
  budgetFit: BudgetTier[];
  // Crew brackets that work well here.
  crewFit: CrewBracket[];
  // 3–4 short activity/vibe phrases, rendered as chips on the card.
  activityHighlights: string[];
  // Per-month weather and quality score. Keyed by the quiz's month
  // option values (e.g. "april").
  weather: Record<string, DestinationWeatherMonth>;
  // Estimated per-person cost ranges in USD for the budget tiers where
  // this destination makes sense. `[min, max]`.
  estPerPersonUsd: Partial<Record<BudgetTier, [number, number]>>;
  // Avoid-tags this destination triggers. If a profile's avoidTags
  // intersects, the destination takes a penalty.
  avoidSignals: string[];
  // One-line editorial flags. Shown as yellow/red badges on the card.
  yellowFlag?: string;
  redFlag?: string;
}

export interface DestinationScore {
  destinationId: string;
  // Final 0–100 score after weights + penalties.
  score: number;
  // Raw sub-scores (0–100) — surfaced for debugging / "why this pick"
  // explanations later.
  breakdown: {
    vibe: number;
    budget: number;
    weather: number;
    travel: number;
    crew: number;
  };
  // Pulled from the destination's weather table for the profile's month.
  // null when the profile has no month set or the month is "flexible".
  weatherNote: string | null;
  // A short editorial tag driven by the highest sub-score — "Perfect for
  // your crew", "Great for your budget", etc.
  matchTag: string;
}

// ── Destination deep-dive (Phase 3 — editorial detail view) ────────────────
// Rich, editorial content per destination. Kept loosely structured so the
// content feels curated rather than templated. Only a subset of the 10
// destinations in the pool will have a detail record at any given time —
// see lib/bachelorette-details for resolver + per-destination files.

export type RestaurantCategory =
  | "must_book"
  | "brunch"
  | "late_night"
  | "instagram"
  | "local_secret"
  | "group_friendly";

export type ActivityCategory =
  | "classic_bach"
  | "chill"
  | "adventure"
  | "food_drink"
  | "nightlife"
  | "culture"
  | "unique";

export type StayType = "airbnb" | "boutique" | "resort" | "budget";

export interface ItineraryBeat {
  // Time of day label — "Morning", "Afternoon", "Late night", "8:00 PM".
  time: string;
  title: string;
  // Editorial paragraph — 1–3 sentences. Voice is warm, opinionated.
  body: string;
  // Shown as a tag under the beat when present — "Reserve 3+ weeks out".
  reservationNote?: string;
}

export interface DetailItineraryDay {
  // "Day 1 — Arrive & Set the Tone"
  label: string;
  // One-line editorial hook under the day header.
  headline: string;
  // Opening paragraph before the per-beat breakdown.
  narrative: string;
  beats: ItineraryBeat[];
}

export interface RestaurantRec {
  category: RestaurantCategory;
  name: string;
  neighborhood: string;
  // One of "$" / "$$" / "$$$" / "$$$$".
  priceRange: string;
  // One-line vibe — "Dark, moody wine bar with jazz on Thursdays".
  vibe: string;
  // Why this works specifically for a bachelorette group.
  whyBach: string;
  // "Book 4+ weeks out" / "Walk-in friendly" / etc.
  reservation: string;
  // "Up to 12 comfortably" — optional when venue is small-group only.
  groupSize?: string;
  insiderTip?: string;
}

export interface ActivityRec {
  category: ActivityCategory;
  title: string;
  body: string;
  costPerPerson?: string;
  groupSize?: string;
  bookAhead?: string;
  timeOfDay?: string;
  weatherSensitive?: boolean;
}

export interface StayRec {
  type: StayType;
  title: string;
  neighborhood: string;
  body: string;
  priceNote: string;
}

export interface PracticalDetails {
  gettingThere: string;
  gettingAround: string;
  localTips: string[];
  bookingTimeline: string;
}

export type MonthQuality = "peak" | "shoulder" | "avoid";

export interface DestinationDetail {
  destinationId: string;
  // Secondary line under the name on the detail hero.
  tagline: string;
  // Optional editorial pull-quote layered over the hero.
  heroQuote?: string;
  // 13-entry timeline (12 months + "flexible" skipped) keyed by month
  // value. The UI renders a small strip of pills.
  bestMonthsTimeline: Partial<Record<string, MonthQuality>>;
  // "Layer a sweater for evenings" etc.
  whatToPack: string;
  // 2–4 day editorial itinerary — tuned for long_weekend by default.
  itinerary: DetailItineraryDay[];
  restaurants: RestaurantRec[];
  activities: ActivityRec[];
  stays: StayRec[];
  practical: PracticalDetails;
}

// ── Tab 1 — Plan & Vibe ────────────────────────────────────────────────────

export interface Organizer {
  id: string;
  name: string;
  role?: string;
}

export interface DressCode {
  id: string;
  eventLabel: string; // e.g. "Day 1 arrival"
  description: string; // e.g. "Casual / cute travel outfits"
}

export interface MoodboardPin {
  id: string;
  imageUrl: string;
  category: MoodboardCategory;
  note?: string;
}

export type MoodboardCategory =
  | "decor"
  | "outfits"
  | "activities"
  | "food_drinks"
  | "gifts";

export interface BridePreferences {
  loves: string[];
  avoid: string[];
  dietary: string[];
}

export interface PartyBasics {
  brideName: string;
  organizers: Organizer[];
  dateRange: string; // free text, e.g. "March 22-24, 2026"
  location: string;
  style: CelebrationStyle | null;
  guestCount: number;
  surpriseMode: boolean;
}

export interface VibeSettings {
  theme: string | null; // "spa_wellness" | "pool_tropical" | "bollywood" | … | custom text
  customTheme: string;
  colorScheme: string[]; // array of hex swatches
  dressCodes: DressCode[];
}

// ── Tab 2 — Guest List & RSVP ──────────────────────────────────────────────

export interface Guest {
  id: string;
  name: string;
  role: string; // "MOH / Host", "Bridesmaid", "Friend", "Cousin", custom
  rsvp: RsvpStatus;
  roomId: string | null;
  notes?: string;
}

export interface Room {
  id: string;
  label: string; // "Room 1"
  capacity: number;
}

// ── Tab 3 — Itinerary ──────────────────────────────────────────────────────

export interface ItineraryEvent {
  id: string;
  dayId: string;
  time: string; // "3:00 PM"
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
  date: string; // "Friday, March 22"
  label: string; // "Arrival", "The Big Day", "Farewell"
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
  createdAt: string; // ISO
  body: string;
}

export type SplittingRule = "equal" | "bride_pays_own" | "custom";

export interface BudgetSettings {
  splittingRule: SplittingRule;
  bridePaysShare: boolean; // derived convenience; false => bride covered
}

// ── Tab 5 — Documents ──────────────────────────────────────────────────────

export interface BacheloretteDocument {
  id: string;
  label: string;
  category: DocumentCategory;
  url?: string;
  addedAt: string; // ISO
  notes?: string;
}

// ── Store root state ───────────────────────────────────────────────────────

export interface BacheloretteState {
  basics: PartyBasics;
  vibe: VibeSettings;
  vibeProfile: VibeProfile;
  moodboard: MoodboardPin[];
  bridePrefs: BridePreferences;

  guests: Guest[];
  rooms: Room[];

  days: ItineraryDay[];
  events: ItineraryEvent[];

  expenses: Expense[];
  payments: Record<string, GuestPayment>; // keyed by guestId
  organizerNotes: OrganizerNote[];
  budget: BudgetSettings;

  documents: BacheloretteDocument[];
}
