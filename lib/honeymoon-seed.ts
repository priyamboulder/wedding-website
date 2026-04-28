// ── Honeymoon seed data ────────────────────────────────────────────────────
// Static defaults + option lists for the Honeymoon module. Seeds the Bali vs
// Amalfi vs Cancún comparison from the spec so the trip page feels lived-in
// on first open instead of empty cards.

import type {
  HoneymoonBudgetTier,
  HoneymoonClimate,
  HoneymoonDealbreaker,
  HoneymoonDuration,
  HoneymoonFlightTolerance,
  HoneymoonPriorityInterest,
  HoneymoonState,
  HoneymoonTimingV2,
  HoneymoonTimingWhen,
  HoneymoonTravelExperience,
  HoneymoonTripDuration,
  HoneymoonVibe,
  HoneymoonVibeTile,
  MoodboardCategory,
  DocumentCategory,
  BudgetLineCategory,
  FundingSource,
  BookingStatus,
  DestinationStatus,
} from "@/types/honeymoon";

export const WHEN_OPTIONS: { value: HoneymoonTimingWhen; label: string }[] = [
  { value: "right_after", label: "Right after the wedding (within a week)" },
  { value: "mini_then_big", label: "Mini-moon first, big trip later" },
  { value: "couple_weeks_after", label: "2-4 weeks after the wedding (recover first)" },
  { value: "later", label: "Later — we're planning it for…" },
  { value: "unsure", label: "We're not sure yet" },
];

export const DURATION_OPTIONS: { value: HoneymoonDuration; label: string }[] = [
  { value: "long_weekend", label: "Long weekend (3-4 nights)" },
  { value: "one_week", label: "One week" },
  { value: "two_weeks", label: "Two weeks" },
  { value: "three_plus", label: "Three weeks+" },
  { value: "mini_then_big", label: "Mini-moon now (3-4 nights) + big trip later" },
];

export const VIBE_OPTIONS: { value: HoneymoonVibe; label: string }[] = [
  { value: "beach", label: "Beach & relaxation" },
  { value: "adventure", label: "Adventure & outdoors" },
  { value: "city_culture", label: "City & culture" },
  { value: "food_wine", label: "Food & wine" },
  { value: "romance", label: "Romance & privacy" },
  { value: "luxury", label: "Luxury & pampering" },
  { value: "unplugged", label: "Off-the-grid / unplugged" },
  { value: "road_trip", label: "Road trip" },
  { value: "bucket_list", label: "Bucket-list destination" },
];

export const CLIMATE_OPTIONS: { value: HoneymoonClimate; label: string }[] = [
  { value: "tropical", label: "Tropical / warm" },
  { value: "temperate", label: "Temperate / Mediterranean" },
  { value: "cold", label: "Cold / snowy (ski, Northern Lights)" },
  { value: "no_preference", label: "We don't care — destination matters more" },
];

export const MOODBOARD_CATEGORIES: {
  value: MoodboardCategory;
  label: string;
}[] = [
  { value: "beaches", label: "Beaches" },
  { value: "hotels", label: "Hotels" },
  { value: "food", label: "Food" },
  { value: "adventure", label: "Adventure" },
  { value: "scenery", label: "Scenery" },
  { value: "romance", label: "Romance" },
];

export const BOOKING_STATUS_OPTIONS: { value: BookingStatus; label: string }[] = [
  { value: "booked", label: "Booked" },
  { value: "hold", label: "On hold" },
  { value: "researching", label: "Researching" },
  { value: "wishlist", label: "Wishlist" },
];

export const BOOKING_PRIORITY_OPTIONS: {
  value: "now" | "six_weeks" | "two_weeks" | "day_of" | "unset";
  label: string;
  blurb: string;
}[] = [
  {
    value: "now",
    label: "Book now",
    blurb: "Flights + hero accommodation — prices climb the longer you wait",
  },
  {
    value: "six_weeks",
    label: "6–8 weeks out",
    blurb: "The big dinner, the private boat, the cooking class",
  },
  {
    value: "two_weeks",
    label: "2 weeks out",
    blurb: "Spa treatments, casual tours, airport transfers",
  },
  {
    value: "day_of",
    label: "Day of",
    blurb: "Beach chairs, casual lunches, anything you'll walk up to",
  },
  { value: "unset", label: "Unsorted", blurb: "" },
];

export const DESTINATION_STATUS_OPTIONS: {
  value: DestinationStatus;
  label: string;
}[] = [
  { value: "leading", label: "Leading" },
  { value: "considering", label: "Considering" },
  { value: "passed", label: "Passed" },
];

export const DOCUMENT_CATEGORIES: {
  value: DocumentCategory;
  label: string;
}[] = [
  { value: "flight", label: "Flight" },
  { value: "hotel", label: "Hotel" },
  { value: "activity", label: "Activity" },
  { value: "insurance", label: "Insurance" },
  { value: "passport", label: "Passport" },
  { value: "visa", label: "Visa" },
  { value: "reservation", label: "Reservation" },
  { value: "other", label: "Other" },
];

export const BUDGET_CATEGORY_OPTIONS: {
  value: BudgetLineCategory;
  label: string;
}[] = [
  { value: "flights", label: "Flights" },
  { value: "accommodation", label: "Accommodation" },
  { value: "activities", label: "Activities" },
  { value: "food", label: "Food & dining" },
  { value: "transport", label: "Transport" },
  { value: "shopping", label: "Shopping" },
  { value: "buffer", label: "Buffer" },
  { value: "other", label: "Other" },
];

export const FUNDING_SOURCE_OPTIONS: {
  value: FundingSource;
  label: string;
}[] = [
  { value: "self_funded", label: "Self-funded" },
  { value: "gifted", label: "Gift from family" },
  { value: "registry", label: "Honeymoon registry (guests contribute)" },
  { value: "mixed", label: "Mix of above" },
];

// ── Dream Session quiz options (Phase 1) ───────────────────────────────────
// Image sources are Unsplash (same hosts as other quiz schemas). The
// QuizRunner hides broken images gracefully so failed loads aren't fatal.

export const VIBE_TILE_OPTIONS: {
  value: HoneymoonVibeTile;
  label: string;
  blurb: string;
  emoji: string;
  image_url: string;
}[] = [
  {
    value: "barefoot_unplugged",
    label: "Barefoot & unplugged",
    blurb: "White sand, turquoise water, a hammock, nowhere to be",
    emoji: "🏝️",
    image_url:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=480&q=70",
  },
  {
    value: "wander_discover",
    label: "Wander & discover",
    blurb: "Cobblestone streets, local markets, getting lost on purpose",
    emoji: "🏛️",
    image_url:
      "https://images.unsplash.com/photo-1533105079780-92b9be482077?w=480&q=70",
  },
  {
    value: "adventure_for_two",
    label: "Adventure for two",
    blurb: "Volcano hikes, reefs, zip lines, safaris — active every day",
    emoji: "🌋",
    image_url:
      "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=480&q=70",
  },
  {
    value: "wine_dine_romance",
    label: "Wine, dine & romance",
    blurb: "Vineyard lunches, tasting menus, golden hour on a terrace",
    emoji: "🍷",
    image_url:
      "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=480&q=70",
  },
  {
    value: "full_luxury",
    label: "Full luxury, zero decisions",
    blurb: "Butler service, spa every day, the fanciest version of doing nothing",
    emoji: "🏨",
    image_url:
      "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=480&q=70",
  },
  {
    value: "variety_mix",
    label: "A little of everything",
    blurb: "Multi-stop — adventure, culture, relaxation, and food",
    emoji: "🗺️",
    image_url:
      "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=480&q=70",
  },
];

export const TRIP_DURATION_OPTIONS: {
  value: HoneymoonTripDuration;
  label: string;
  hint: string;
}[] = [
  { value: "long_weekend", label: "Long weekend (3–4 nights)", hint: "Short and sweet" },
  { value: "one_week", label: "One week (5–7 nights)", hint: "The sweet spot" },
  { value: "ten_days", label: "10 days", hint: "We saved up the PTO" },
  { value: "two_weeks_plus", label: "Two weeks or more", hint: "Once in a lifetime" },
  { value: "unsure", label: "Not sure yet", hint: "Help us figure it out" },
];

export const BUDGET_TIER_OPTIONS: {
  value: HoneymoonBudgetTier;
  label: string;
  blurb: string;
}[] = [
  { value: "under_3k", label: "Under $3,000", blurb: "Keeping it real" },
  { value: "3k_6k", label: "$3,000 – $6,000", blurb: "Comfortable, not crazy" },
  { value: "6k_10k", label: "$6,000 – $10,000", blurb: "We want it special" },
  { value: "10k_15k", label: "$10,000 – $15,000", blurb: "This is the big one" },
  { value: "15k_25k", label: "$15,000 – $25,000", blurb: "Going all in" },
  { value: "over_25k", label: "$25,000+", blurb: "Dream trip, no ceiling" },
];

export const FLIGHT_TOLERANCE_OPTIONS: {
  value: HoneymoonFlightTolerance;
  label: string;
}[] = [
  { value: "domestic_short", label: "Quick domestic (under 4 hours)" },
  { value: "na_caribbean", label: "North America or the Caribbean" },
  { value: "longhaul_ok", label: "Long-haul is fine — open to international" },
  { value: "exotic_ok", label: "The longer and more exotic, the better" },
  { value: "drive_only", label: "Keep it drive-to — no flights" },
];

export const TIMING_V2_OPTIONS: {
  value: HoneymoonTimingV2;
  label: string;
}[] = [
  { value: "right_after", label: "Right after the wedding" },
  { value: "within_month", label: "Within a month of the wedding" },
  { value: "minimoon_then_big", label: "Minimoon now, big trip later" },
  { value: "flexible", label: "Flexible — around the best time to visit" },
  { value: "specific_month", label: "We have a specific month in mind" },
];

export const PRIORITY_INTEREST_OPTIONS: {
  value: HoneymoonPriorityInterest;
  label: string;
}[] = [
  { value: "food", label: "Amazing food & dining" },
  { value: "beaches", label: "Beautiful beaches & water" },
  { value: "privacy", label: "Privacy & seclusion" },
  { value: "culture", label: "Culture, history & exploration" },
  { value: "adventure", label: "Adventure & outdoor activities" },
  { value: "nightlife", label: "Nightlife & social scene" },
  { value: "spa", label: "Spa & wellness" },
  { value: "wildlife", label: "Wildlife & nature" },
  { value: "unique", label: "Unique, once-in-a-lifetime experiences" },
  { value: "photography", label: "Photography-worthy scenery" },
  { value: "ease", label: "Ease & convenience — no complicated logistics" },
];

export const DEALBREAKER_OPTIONS: {
  value: HoneymoonDealbreaker;
  label: string;
}[] = [
  { value: "long_flights", label: "Long flights (8+ hours)" },
  { value: "extreme_heat", label: "Extreme heat" },
  { value: "humidity", label: "Humidity" },
  { value: "remote_medical", label: "Remote with limited medical access" },
  { value: "language", label: "Heavy language barrier" },
  { value: "health_advisory", label: "Zika or health advisories" },
  { value: "crowds", label: "Crowds & overtourism" },
  { value: "all_inclusive_yes", label: "All-inclusive (want independence)" },
  { value: "all_inclusive_no", label: "Not all-inclusive (want simplicity)" },
  { value: "malaria", label: "Malaria-risk zones" },
  { value: "rough_seas", label: "Rough seas or small boats" },
  { value: "altitude", label: "High altitude" },
];

export const TRAVEL_EXPERIENCE_OPTIONS: {
  value: HoneymoonTravelExperience;
  label: string;
}[] = [
  { value: "extensive", label: "Extensively — comfortable anywhere" },
  { value: "some", label: "Some international travel" },
  { value: "first_time", label: "This would be our first big international trip" },
];

export const DEFAULT_HONEYMOON: HoneymoonState = {
  vision: {
    when: "couple_weeks_after",
    laterMonth: "",
    duration: "two_weeks",
    vibes: ["adventure", "beach", "food_wine"],
    climate: "tropical",
    dealBreakers: [
      "No long flights over 20 hours without a recovery day",
      "Passport renewal for Arjun before August",
    ],
  },
  vibeProfile: {
    vibes: ["adventure_for_two", "barefoot_unplugged"],
    duration: "ten_days",
    budgetTier: "6k_10k",
    flightTolerance: "longhaul_ok",
    timing: "minimoon_then_big",
    travelMonth: "",
    priorityInterests: ["food", "adventure", "beaches", "unique"],
    dealbreakers: ["long_flights"],
    travelExperience: "some",
  },
  brief: {
    body:
      "We want to feel like we finally slowed down — mornings with no alarm, evenings that go long over dinner, one or two wild adventures we'll tell stories about for years. Not a packed itinerary. We want to be alone together for the first time in months.",
  },
  moodboard: [
    {
      id: "mb_1",
      imageUrl: "",
      category: "beaches",
      note: "Overwater villa at sunset",
    },
    {
      id: "mb_2",
      imageUrl: "",
      category: "food",
      note: "Rice paddy lunch in Ubud",
    },
    {
      id: "mb_3",
      imageUrl: "",
      category: "scenery",
      note: "Tegallalang terraces",
    },
    {
      id: "mb_4",
      imageUrl: "",
      category: "romance",
      note: "Dinner-under-the-stars",
    },
  ],
  destinations: [
    {
      id: "dest_bali",
      emoji: "🌴",
      name: "Bali",
      region: "Indonesia",
      status: "leading",
      favorite: true,
      inComparison: true,
      whyItFits: "Adventure + beach + culture + food. 10-day sweet spot. Affordable luxury.",
      considerations: {
        flight: "20+ hours from DFW (1-2 stops)",
        visa: "Free 30-day visa on arrival",
        bestTime: "April-October (dry season) ✓",
        budgetRange: "$3,000-$8,000 for 10 days",
        jetLag: "Significant (13 hours ahead)",
      },
      budgetSingleCents: 600000,
      duration: "10 days",
      flightLength: "20h flight",
      seasonOk: "Apr-Oct ✓",
      notes:
        "Raj has always wanted to go. I'm nervous about the long flight right after the wedding when we'll be exhausted. Maybe mini-moon in Cancún first, then Bali 2 months later?",
    },
    {
      id: "dest_amalfi",
      emoji: "🏔",
      name: "Amalfi Coast",
      region: "Italy",
      status: "considering",
      favorite: false,
      inComparison: true,
      whyItFits: "Food, wine, coastal views, romance. Shorter flight, easier timezone.",
      considerations: {
        flight: "~14 hours from DFW (1 stop)",
        visa: "Schengen — 90 days, visa-free for US",
        bestTime: "May-September (peak views) ✓",
        budgetRange: "$5,000-$10,000 for 7 days",
        jetLag: "Moderate (7 hours ahead)",
      },
      budgetSingleCents: 800000,
      duration: "7 days",
      flightLength: "14h flight",
      seasonOk: "May-Sep ✓",
      notes: "Positano walkable town. Ferry day-trips to Capri. Shoulder season cheaper.",
    },
    {
      id: "dest_cancun",
      emoji: "🌊",
      name: "Cancún",
      region: "Mexico (mini-moon option)",
      status: "considering",
      favorite: false,
      inComparison: true,
      whyItFits: "Short flight, all-inclusive, beach & rest. Ideal mini-moon before bigger trip.",
      considerations: {
        flight: "3.5 hours from DFW direct",
        visa: "No visa needed (FMM tourist card)",
        bestTime: "Year-round, Dec-Apr ideal ✓",
        budgetRange: "$1,500-$3,500 for 4 days",
        jetLag: "None (same timezone)",
      },
      budgetSingleCents: 250000,
      duration: "4 days",
      flightLength: "3.5h flight",
      seasonOk: "Year-round ✓",
      notes: "Perfect for the recover-then-fly scenario.",
    },
  ],
  bookings: [
    {
      id: "bk_1",
      label: "Flights — DFW → DPS (Bali)",
      status: "booked",
      costCents: 240000,
      estimated: false,
      confirmationNumber: "AA-29481",
      priorityTier: "now",
    },
    {
      id: "bk_2",
      label: "Hotel — Ubud (4 nights)",
      status: "booked",
      costCents: 120000,
      estimated: false,
      confirmationNumber: "BK-11023",
      priorityTier: "now",
    },
    {
      id: "bk_3",
      label: "Hotel — Seminyak (4 nights)",
      status: "hold",
      costCents: 160000,
      estimated: false,
      priorityTier: "now",
    },
    {
      id: "bk_4",
      label: "Airport transfer",
      status: "researching",
      costCents: 5000,
      estimated: true,
      priorityTier: "two_weeks",
    },
    {
      id: "bk_5",
      label: "Cooking class — Ubud",
      status: "booked",
      costCents: 8000,
      estimated: false,
      confirmationNumber: "CK-9920",
      priorityTier: "six_weeks",
    },
    {
      id: "bk_6",
      label: "Surf lesson — Seminyak",
      status: "wishlist",
      costCents: 6000,
      estimated: true,
      priorityTier: "two_weeks",
    },
  ],
  days: [
    { id: "day_1", dayNumber: 1, date: "Saturday, April 26", label: "Travel" },
    { id: "day_2", dayNumber: 2, date: "Sunday, April 27", label: "Arrive in Bali" },
    { id: "day_3", dayNumber: 3, date: "Monday, April 28", label: "Ubud" },
  ],
  items: [
    {
      id: "it_1",
      dayId: "day_1",
      time: "10:00 AM",
      title: "Depart DFW → Bali (via Tokyo)",
      note: "AA Flight 175 → connecting JAL 711. Arrive Day 2.",
      confirmed: true,
    },
    {
      id: "it_2",
      dayId: "day_2",
      time: "9:00 PM",
      title: "Arrive Denpasar (DPS)",
      note: "Airport transfer → Ubud hotel (1.5 hr)",
      confirmed: true,
    },
    {
      id: "it_3",
      dayId: "day_2",
      time: "11:00 PM",
      title: "Check in, sleep",
      confirmed: false,
    },
    {
      id: "it_4",
      dayId: "day_3",
      time: "Morning",
      title: "Sleep in (jet lag recovery)",
      confirmed: false,
    },
    {
      id: "it_5",
      dayId: "day_3",
      time: "11:00 AM",
      title: "Brunch at hotel",
      confirmed: false,
    },
    {
      id: "it_6",
      dayId: "day_3",
      time: "2:00 PM",
      title: "Tegallalang rice terraces",
      confirmed: false,
    },
    {
      id: "it_7",
      dayId: "day_3",
      time: "5:00 PM",
      title: "Spa — couples massage at hotel",
      confirmed: false,
    },
    {
      id: "it_8",
      dayId: "day_3",
      time: "7:30 PM",
      title: "Dinner — Locavore",
      note: "Reservation ✓",
      confirmed: true,
    },
  ],
  budgetLines: [
    {
      id: "bl_1",
      label: "Flights",
      category: "flights",
      amountCents: 240000,
      paid: true,
      estimated: false,
    },
    {
      id: "bl_2",
      label: "Accommodation",
      category: "accommodation",
      amountCents: 280000,
      paid: false,
      estimated: false,
    },
    {
      id: "bl_3",
      label: "Activities",
      category: "activities",
      amountCents: 30000,
      paid: false,
      estimated: false,
    },
    {
      id: "bl_4",
      label: "Food & dining",
      category: "food",
      amountCents: 80000,
      paid: false,
      estimated: true,
    },
    {
      id: "bl_5",
      label: "Transport",
      category: "transport",
      amountCents: 20000,
      paid: false,
      estimated: true,
    },
    {
      id: "bl_6",
      label: "Shopping",
      category: "shopping",
      amountCents: 30000,
      paid: false,
      estimated: true,
    },
    {
      id: "bl_7",
      label: "Buffer",
      category: "buffer",
      amountCents: 20000,
      paid: false,
      estimated: false,
    },
  ],
  budget: {
    totalBudgetCents: 600000,
    fundingSources: ["self_funded", "registry"],
    registryConnected: true,
    registryShareUrl: "",
  },
  registryFundItems: [
    {
      id: "fund_1",
      label: "Flights to Bali",
      goalCents: 240000,
      raisedCents: 180000,
    },
    {
      id: "fund_2",
      label: "Ubud cooking class",
      goalCents: 8000,
      raisedCents: 8000,
    },
    {
      id: "fund_3",
      label: "Spa day",
      goalCents: 20000,
      raisedCents: 5000,
    },
    {
      id: "fund_4",
      label: "Romantic dinner",
      goalCents: 15000,
      raisedCents: 0,
    },
    {
      id: "fund_5",
      label: "General honeymoon fund",
      goalCents: 100000,
      raisedCents: 32000,
    },
  ],
  checklist: [
    { id: "ck_d1", label: "Passport — valid through Oct 2026", section: "documents", done: true },
    { id: "ck_d2", label: "Passport — Raj's expires Aug 2026", section: "documents", done: false, warning: true, note: "Cutting it close — renew now" },
    { id: "ck_d3", label: "Visa — Indonesia (free on arrival, 30 days)", section: "documents", done: true },
    { id: "ck_d4", label: "Travel insurance — purchased", section: "documents", done: true },
    { id: "ck_d5", label: "Flight confirmations — saved to phone", section: "documents", done: false },
    { id: "ck_d6", label: "Hotel confirmations — saved to phone", section: "documents", done: false },
    { id: "ck_d7", label: "International driver's license (if renting scooter)", section: "documents", done: false },

    { id: "ck_h1", label: "Vaccines — check CDC recommendations for Bali", section: "health", done: false },
    { id: "ck_h2", label: "Prescriptions — 2-week supply packed", section: "health", done: false },
    { id: "ck_h3", label: "Travel first aid kit", section: "health", done: false },
    { id: "ck_h4", label: "Mosquito repellent (DEET-based for tropical)", section: "health", done: false },

    { id: "ck_p1", label: "International phone plan or SIM card", section: "practical", done: false },
    { id: "ck_p2", label: "Currency — withdraw IDR on arrival or use Wise card", section: "practical", done: false },
    { id: "ck_p3", label: "Power adapter — Type C (European style)", section: "practical", done: false },
    { id: "ck_p4", label: "Download offline maps (Google Maps Bali)", section: "practical", done: false },
    { id: "ck_p5", label: "Notify bank of international travel", section: "practical", done: false },
    { id: "ck_p6", label: "Set up out-of-office messages", section: "practical", done: false },

    { id: "ck_pk1", label: "Swimsuits × 3", section: "packing", done: false },
    { id: "ck_pk2", label: "Light hiking shoes", section: "packing", done: false },
    { id: "ck_pk3", label: "Sun hat + reef-safe sunscreen", section: "packing", done: false },
    { id: "ck_pk4", label: "Smart-casual dinner outfits × 3", section: "packing", done: false },
    { id: "ck_pk5", label: "Rain shell (jungle humidity)", section: "packing", done: false },
  ],
  documents: [
    {
      id: "doc_1",
      label: "AA flight confirmation — DFW→DPS",
      category: "flight",
      addedAt: "2026-04-02T00:00:00.000Z",
      notes: "Confirmation AA-29481",
    },
    {
      id: "doc_2",
      label: "Ubud hotel reservation",
      category: "hotel",
      addedAt: "2026-04-03T00:00:00.000Z",
      notes: "BK-11023, 4 nights",
    },
    {
      id: "doc_3",
      label: "Travel insurance policy",
      category: "insurance",
      addedAt: "2026-04-04T00:00:00.000Z",
    },
    {
      id: "doc_4",
      label: "Passport scan — Priya",
      category: "passport",
      addedAt: "2026-04-01T00:00:00.000Z",
    },
  ],
};
