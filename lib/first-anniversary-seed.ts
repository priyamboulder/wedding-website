// ── First Anniversary seed data ───────────────────────────────────────────
// Static option lists + the initial store payload. The demo defaults give a
// first-run user a partially populated surface (vibe picked, a date, a few
// ideas already explored) rather than empty screens.

import type {
  AnniversaryVibe,
  BudgetTier,
  CelebrationWindow,
  DurationPref,
  ExpenseCategory,
  FirstAnniversaryState,
  HardNoTag,
} from "@/types/first-anniversary";

export const VIBE_OPTIONS: {
  value: AnniversaryVibe;
  label: string;
  blurb: string;
}[] = [
  {
    value: "romantic_escape",
    label: "Romantic Escape",
    blurb: "Candlelit dinners, boutique hotels, just the two of you",
  },
  {
    value: "adventure_together",
    label: "Adventure Together",
    blurb: "Hiking, diving, road trips — experience over luxury",
  },
  {
    value: "cultural_immersion",
    label: "Cultural Immersion",
    blurb: "New city, museums, street food, getting lost on purpose",
  },
  {
    value: "full_relaxation",
    label: "Full Relaxation",
    blurb: "Spa, beach, zero plans, sleep in every day",
  },
  {
    value: "nostalgic_return",
    label: "Nostalgic Return",
    blurb: "Revisit where you met, first dated, or honeymooned",
  },
  {
    value: "culinary_journey",
    label: "Culinary Journey",
    blurb: "Wine regions, cooking classes, tasting menus, food tours",
  },
  {
    value: "celebrate_at_home",
    label: "Celebrate at Home",
    blurb: "Intimate dinner party, recreate your first date, backyard stars",
  },
];

export const CELEBRATION_WINDOW_OPTIONS: {
  value: CelebrationWindow;
  label: string;
}[] = [
  { value: "on_date", label: "On the date itself" },
  { value: "nearest_weekend", label: "Nearest weekend" },
  { value: "extended_trip", label: "Extended trip around it" },
  { value: "flexible", label: "Flexible" },
];

export const DURATION_OPTIONS: {
  value: DurationPref;
  label: string;
  hint: string;
}[] = [
  { value: "evening", label: "Evening out", hint: "Dinner, drinks, a single night" },
  { value: "day_trip", label: "Day trip", hint: "Morning to late night" },
  { value: "weekend", label: "Weekend getaway", hint: "Friday to Sunday" },
  { value: "extended", label: "Extended trip", hint: "3–7 days" },
  { value: "grand", label: "Grand trip", hint: "7+ days" },
];

export const BUDGET_TIER_OPTIONS: {
  value: BudgetTier;
  label: string;
  short: string;
  range: string;
}[] = [
  {
    value: "simple",
    label: "Keep it simple",
    short: "Simple",
    range: "Under $500",
  },
  {
    value: "treat",
    label: "Treat ourselves",
    short: "Treat",
    range: "$500–$1,500",
  },
  {
    value: "all_out",
    label: "Go all out",
    short: "All out",
    range: "$1,500–$5,000",
  },
  {
    value: "lifetime",
    label: "Once-in-a-lifetime",
    short: "Lifetime",
    range: "$5,000+",
  },
];

export const HARD_NO_OPTIONS: { value: HardNoTag; label: string }[] = [
  { value: "long_flights", label: "Long flights (4+ hours)" },
  { value: "extreme_heat", label: "Extreme heat" },
  { value: "extreme_cold", label: "Extreme cold" },
  { value: "crowded_tourist", label: "Crowded tourist areas" },
  { value: "requires_pto", label: "Weekday travel / PTO" },
  { value: "passport_required", label: "Passport required" },
];

export const EXPENSE_CATEGORY_OPTIONS: {
  value: ExpenseCategory;
  label: string;
}[] = [
  { value: "travel", label: "Travel" },
  { value: "accommodations", label: "Accommodations" },
  { value: "dining", label: "Dining & Drinks" },
  { value: "activities", label: "Activities & Experiences" },
  { value: "gifts", label: "Gifts for Each Other" },
  { value: "other", label: "Other" },
];

// ── Default store payload ─────────────────────────────────────────────────
// Mirrors the Scottsdale demo tone — named Priya & Arjun so the module
// reads naturally against the seeded couple identity, and pre-populated
// enough to make the tabs feel alive.

export const DEFAULT_FIRST_ANNIVERSARY: FirstAnniversaryState = {
  basics: {
    partnerOne: "Priya",
    partnerTwo: "Arjun",
    anniversaryDate: "March 15, 2027",
    anniversaryNumber: 1,
    celebrationWindow: "nearest_weekend",
    duration: "weekend",
  },
  vibe: {
    vibes: ["romantic_escape", "full_relaxation"],
    budget: "treat",
    hardNos: ["long_flights", "crowded_tourist"],
    thingsWeLoved:
      "The weekend we didn't leave the apartment. Cooking together on Sunday mornings. The farmer's market.",
    accessibilityNotes: "",
    updatedAt: null,
  },
  recommendationStates: {},
  itinerary: [
    {
      id: "ai_1",
      dayNumber: 1,
      timeBlock: "afternoon",
      sortOrder: 0,
      activity: "Check in — Sedona, AZ",
      location: "L'Auberge de Sedona",
      notes: "Creekside cottage — request a room with a fireplace.",
    },
    {
      id: "ai_2",
      dayNumber: 1,
      timeBlock: "evening",
      sortOrder: 1,
      activity: "Anniversary dinner at Cress on Oak Creek",
      location: "L'Auberge de Sedona",
      estimatedCostCents: 38000,
      isMainEvent: true,
      notes: "Bring the wedding playlist. Toast at the creek after.",
    },
    {
      id: "ai_3",
      dayNumber: 2,
      timeBlock: "morning",
      sortOrder: 0,
      activity: "Sunrise at Cathedral Rock",
      durationMinutes: 90,
      notes: "Easy 1.2mi round trip — worth the early alarm.",
    },
    {
      id: "ai_4",
      dayNumber: 2,
      timeBlock: "afternoon",
      sortOrder: 1,
      activity: "Couples spa — red clay ritual",
      location: "Mii Amo",
      estimatedCostCents: 60000,
    },
  ],
  expenses: [
    {
      id: "e_1",
      category: "accommodations",
      vendor: "L'Auberge de Sedona",
      amountCents: 95000,
      date: "2027-03-14",
      notes: "2 nights, creekside cottage",
      source: "manual",
    },
    {
      id: "e_2",
      category: "dining",
      vendor: "Cress on Oak Creek",
      amountCents: 38000,
      date: "2027-03-14",
      source: "manual",
    },
  ],
  documents: [
    {
      id: "d_1",
      label: "L'Auberge booking confirmation",
      category: "reservation",
      addedAt: "2026-11-02T10:00:00Z",
    },
  ],
};
