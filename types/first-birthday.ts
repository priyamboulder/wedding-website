// ── Baby's First Birthday module types ─────────────────────────────────────
// Non-vendor "Next Chapter" celebration module. Lives under Celebrations
// alongside bachelorette, bachelor, and baby shower. Seven tabs:
// Plan & Vibe · Discover · Guest List & RSVP · Itinerary · Budget &
// Contributions · Memories · Documents.
//
// Discovery-led + ceremony-aware. The Plan & Vibe inputs drive a
// Discover "mode" (party / ceremony / combined / grand) and feed a
// ranked recommendation pool. Unique: nap-aware itinerary, family-unit
// guest tracking with per-kid allergen fields, and a Memories tab that
// transforms from "capture plan" pre-event to "keepsake" post-event.
//
// All state persists via stores/first-birthday-store.ts to localStorage.

// ── Planner / funding role ─────────────────────────────────────────────────

export type FirstBirthdayFundingModel =
  | "parent_funded"
  | "family_helped"
  | "co_host_split"
  | "group_fund";

// ── Vibe (multi-select) ────────────────────────────────────────────────────

export type FirstBirthdayVibe =
  | "classic_sweet"
  | "themed_party"
  | "outdoor_adventure"
  | "modern_minimal"
  | "grand_celebration"
  | "cultural_ceremony"
  | "backyard_bash"
  | "combined_ceremony_party"
  | "intimate_family";

// ── Guest scale ────────────────────────────────────────────────────────────

export type FirstBirthdayGuestTier =
  | "intimate"  // 5-15
  | "medium"    // 15-40
  | "large"     // 40-80
  | "grand"     // 80-150
  | "mega";     // 150+

export type FirstBirthdayGuestMix =
  | "mostly_adults"
  | "balanced"
  | "kid_heavy";

// ── Venue preference ───────────────────────────────────────────────────────

export type FirstBirthdayVenueType =
  | "home"
  | "backyard"
  | "restaurant"
  | "banquet_hall"
  | "hotel"
  | "cultural_center"
  | "park"
  | "kids_venue"
  | "destination"
  | "undecided";

// ── Duration ───────────────────────────────────────────────────────────────

export type FirstBirthdayDuration =
  | "short"      // 1-2 hours
  | "afternoon"  // 2-4 hours
  | "half_day"   // 4-6 hours
  | "full_day";

// ── Cultural ceremony traditions (multi-select + free text) ────────────────

export type FirstBirthdayCeremonyTradition =
  | "annaprashan"
  | "choroonu"
  | "dohl"
  | "tol_janchi"
  | "zhuazhou"
  | "mundan"
  | "aqiqah"
  | "cradle_naming";

export type FirstBirthdayCeremonyIntegration =
  | "separate_event"
  | "same_day_separate"
  | "fully_integrated"
  | "undecided";

export type FirstBirthdayOfficiant = "yes" | "no" | "not_sure";

// ── Kid age awareness ──────────────────────────────────────────────────────

export type FirstBirthdayKidAgeRange =
  | "babies_toddlers"
  | "mix_0_5"
  | "older_kids_too"
  | "wide_range";

export type AllergySeverity = "mild" | "moderate" | "severe";

export interface AllergyFlag {
  id: string;
  allergen: string;
  severity: AllergySeverity;
}

// ── Hard no's ──────────────────────────────────────────────────────────────

export type FirstBirthdayHardNo =
  | "no_clowns"
  | "no_loud_music"
  | "no_gender_stereotype"
  | "no_smash_cake"
  | "must_smash_cake"
  | "no_alcohol"
  | "no_structured_program"
  | "no_gifts_donate_instead";

// ── Discover mode ──────────────────────────────────────────────────────────

export type FirstBirthdayDiscoverMode =
  | "party"
  | "ceremony"
  | "combined"
  | "grand";

// ── Plan & Vibe (Tab 1) ────────────────────────────────────────────────────

export interface FirstBirthdayPlan {
  babyName: string;
  birthdayDate: string;
  partyDate: string;
  partyWindow: string;
  duration: FirstBirthdayDuration | null;
  guestTier: FirstBirthdayGuestTier | null;
  guestMix: FirstBirthdayGuestMix | null;
  vibes: FirstBirthdayVibe[];
  venueType: FirstBirthdayVenueType | null;
  venueName: string;
  venueCapacity: string;
  cateringIncluded: "yes" | "no" | "unsure" | null;
  avAvailable: "yes" | "no" | "unsure" | null;
  venueRestrictions: string;
  hardNos: FirstBirthdayHardNo[];
  dietaryRestrictions: string;
  accessibilityNeeds: string;
  budgetCeilingCents: number;
  // Kid-awareness
  kidAgeRange: FirstBirthdayKidAgeRange | null;
  allergyFlags: AllergyFlag[];
  napTime: string;
  specialSensitivities: string;
  // Emotional register
  whatThisYearHasMeant: string;
  // Manual mode override (if null, auto-detect from vibes)
  discoverModeOverride: FirstBirthdayDiscoverMode | null;
  updatedAt: string | null;
}

export interface FirstBirthdayCeremony {
  traditions: FirstBirthdayCeremonyTradition[];
  otherTraditionText: string;
  officiant: FirstBirthdayOfficiant | null;
  ritualItemsNotes: string;
  ceremonyVenueNotes: string;
  integration: FirstBirthdayCeremonyIntegration | null;
}

// ── Recommendation pool ────────────────────────────────────────────────────

export type FirstBirthdayRecType =
  | "theme"
  | "activity"
  | "menu"
  | "vendor"
  | "ceremony_guide"
  | "ritual_setup";

export interface FirstBirthdayRec {
  id: string;
  type: FirstBirthdayRecType;
  name: string;
  hook: string;
  editorialDescription: string;
  palette: string[];
  heroImage?: string;
  // Tags the scorer matches against.
  vibes: FirstBirthdayVibe[];
  venueTypes: FirstBirthdayVenueType[];
  minGuests: number;
  maxGuests: number;
  // Rough cost range (cents). Used for budget-fit scoring.
  costLowCents: number;
  costHighCents: number;
  // Ceremony traditions this rec relates to (empty = non-ceremony).
  culturalTags: FirstBirthdayCeremonyTradition[];
  // Kid-friendliness flags.
  kidSafetyNotes: string;
  ageMin?: number;   // months
  ageMax?: number;   // months
  // Pillar chips rendered on the card.
  highlights: string[];
  // Hard no's this rec violates (penalty).
  violates: FirstBirthdayHardNo[];
  // What you'll need / ceremony steps / allergens etc.
  whatYoullNeed: string[];
  pairings: string[];
  suggestedDuration: string;
  // Season/month affinity. Empty = year-round.
  peakMonths: number[];
}

export interface FirstBirthdayRecScoreBreakdown {
  vibe: number;
  guestFit: number;
  budget: number;
  venue: number;
  kid: number;
  cultural: number;
  season: number;
  personal: number;
}

export interface FirstBirthdayRecScore {
  recId: string;
  score: number;
  breakdown: FirstBirthdayRecScoreBreakdown;
  matchTag: string;
  whyNote: string;
}

export type FirstBirthdayRecStatus =
  | "suggested"
  | "saved"
  | "selected"
  | "dismissed";

export interface FirstBirthdayRecState {
  id: string;
  status: FirstBirthdayRecStatus;
  dismissReason?: string;
  selectedAt?: string;
}

// ── Guest List (family-unit tracking) ──────────────────────────────────────

export type FirstBirthdayRsvp =
  | "not_sent"
  | "invited"
  | "going"
  | "maybe"
  | "declined";

export type FirstBirthdayGuestGroup =
  | "family"
  | "friends"
  | "coworkers"
  | "neighbors"
  | "daycare"
  | "other";

export interface FirstBirthdayAdult {
  id: string;
  name: string;
  dietaryNotes: string;
}

export interface FirstBirthdayKid {
  id: string;
  name: string;
  ageMonths: number;
  allergyNotes: string;
  dietaryNotes: string;
}

export interface FirstBirthdayFamily {
  id: string;
  familyName: string;
  contactEmail: string;
  contactPhone: string;
  group: FirstBirthdayGuestGroup;
  adults: FirstBirthdayAdult[];
  kids: FirstBirthdayKid[];
  rsvp: FirstBirthdayRsvp;
  accessibilityNotes: string;
  rsvpMessage: string;
  contributionCents: number;
  contributionStatus: "none" | "pledged" | "paid";
}

// ── Itinerary ──────────────────────────────────────────────────────────────

export type FirstBirthdayBlockType =
  | "standard"
  | "highlight"
  | "ceremony"
  | "optional"
  | "host_only"
  | "nap_window";

export type FirstBirthdayPhase =
  | "setup"
  | "ceremony"
  | "transition"
  | "party"
  | "cleanup";

export interface FirstBirthdayItineraryItem {
  id: string;
  dayNumber: number;
  phase: FirstBirthdayPhase | null;
  startTime: string;
  durationMinutes: number;
  activityName: string;
  description: string;
  blockType: FirstBirthdayBlockType;
  kidSafetyNote: string;
  sortOrder: number;
  sourceRecId: string | null;
}

// ── Budget ─────────────────────────────────────────────────────────────────

export type FirstBirthdayExpenseCategory =
  | "venue"
  | "catering"
  | "cake"
  | "decorations"
  | "balloon_artist"
  | "entertainment"
  | "photography"
  | "ceremony_supplies"
  | "baby_outfits"
  | "favors"
  | "rentals"
  | "invitations"
  | "other";

export interface FirstBirthdayExpense {
  id: string;
  category: FirstBirthdayExpenseCategory;
  vendor: string;
  amountCents: number;
  date: string;
  paidBy: string;
  receiptDataUrl?: string;
  notes: string;
  source: "manual" | "receipt_scan";
}

export interface FirstBirthdayContribution {
  id: string;
  contributorName: string;
  relationship: string;
  amountCents: number;
  date: string;
  method: string;
  status: "pledged" | "received";
  notes: string;
}

export interface FirstBirthdayBudget {
  totalBudgetCents: number;
  groupFundGoalCents: number;
}

// ── Memories tab ───────────────────────────────────────────────────────────

export type FirstBirthdayMemoryType = "photo" | "video" | "reflection";

export type FirstBirthdayMemoryCategory =
  | "ceremony"
  | "cake_smash"
  | "family_portrait"
  | "candid"
  | "detail"
  | "guest_upload"
  | "other";

export interface FirstBirthdayMemory {
  id: string;
  type: FirstBirthdayMemoryType;
  fileDataUrl?: string;
  category: FirstBirthdayMemoryCategory | null;
  caption: string;
  uploadedBy: "parent" | "guest";
  isFeatured: boolean;
  reflectionPrompt?: string;
  reflectionText?: string;
  createdAt: string;
}

export interface FirstBirthdayShotListItem {
  id: string;
  label: string;
  captured: boolean;
  note: string;
}

export interface FirstBirthdayAlbumSettings {
  isPublic: boolean;
  allowGuestUploads: boolean;
  thankYouMessage: string;
  coverMemoryId: string | null;
}

// ── Documents ──────────────────────────────────────────────────────────────

export type FirstBirthdayDocCategory =
  | "vendor_contract"
  | "receipt"
  | "venue_info"
  | "ceremony_notes"
  | "inspiration"
  | "other";

export interface FirstBirthdayDocument {
  id: string;
  label: string;
  url: string;
  category: FirstBirthdayDocCategory;
  addedAt: string;
  notes: string;
}

// ── Store root state ───────────────────────────────────────────────────────

export interface FirstBirthdayState {
  plan: FirstBirthdayPlan;
  ceremony: FirstBirthdayCeremony;
  funding: FirstBirthdayFundingModel;
  recStates: Record<string, FirstBirthdayRecState>;
  families: FirstBirthdayFamily[];
  itinerary: FirstBirthdayItineraryItem[];
  budget: FirstBirthdayBudget;
  expenses: FirstBirthdayExpense[];
  contributions: FirstBirthdayContribution[];
  memories: FirstBirthdayMemory[];
  shotList: FirstBirthdayShotListItem[];
  album: FirstBirthdayAlbumSettings;
  reflections: {
    surprisedBy: string;
    favoriteThing: string;
    wantToRemember: string;
    messageToBaby: string;
  };
  documents: FirstBirthdayDocument[];
}
