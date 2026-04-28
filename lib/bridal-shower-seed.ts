// ── Bridal Shower seed data ────────────────────────────────────────────────
// Option lists + the default seeded state so a new workspace opens with a
// populated brief instead of blank cards. Seed uses Priya (to match the
// rest of the Ananya demo wedding) and biases toward the "earthy & relaxed
// garden luncheon" concept to show off the module out of the box.

import type {
  BridalShowerState,
  BridePersonality,
  BudgetTier,
  ContributionModel,
  DayOfWeek,
  GuestCompositionTag,
  GuestCountBracket,
  PlannerRole,
  ShowerFormat,
  TimeOfDay,
  VenueType,
} from "@/types/bridal-shower";

export const PLANNER_ROLE_OPTIONS: { value: PlannerRole; label: string }[] = [
  { value: "moh", label: "Maid / Matron of Honor" },
  { value: "bridesmaid", label: "Bridesmaid" },
  { value: "mother_of_bride", label: "Mother of the Bride" },
  { value: "mother_of_groom", label: "Mother of the Groom" },
  { value: "sister_family", label: "Sister or close family" },
  { value: "friend", label: "Friend (not in wedding party)" },
  { value: "bride_herself", label: "The bride, self-planning" },
  { value: "co_planning", label: "Co-planning with someone" },
];

export const PERSONALITY_OPTIONS: {
  value: BridePersonality;
  label: string;
  blurb: string;
  emoji: string;
}[] = [
  {
    value: "classic_elegant",
    label: "Classic & elegant",
    blurb: "Timeless, polished, tasteful, nothing too loud",
    emoji: "🌸",
  },
  {
    value: "creative_eclectic",
    label: "Creative & eclectic",
    blurb: "Unique venues, unexpected details, hates generic",
    emoji: "🎨",
  },
  {
    value: "life_of_party",
    label: "Life of the party",
    blurb: "Loves a good time, wants energy and laughter",
    emoji: "🥂",
  },
  {
    value: "earthy_relaxed",
    label: "Earthy & relaxed",
    blurb: "Organic textures, natural settings, low-key intimate",
    emoji: "🌿",
  },
  {
    value: "foodie",
    label: "Foodie at heart",
    blurb: "The menu matters more than the décor — experiential",
    emoji: "👩‍🍳",
  },
  {
    value: "sentimental",
    label: "Sentimental & meaningful",
    blurb: "Personal touches, heartfelt moments, memory-making",
    emoji: "📚",
  },
];

export const GUEST_COUNT_OPTIONS: {
  value: GuestCountBracket;
  label: string;
  midpoint: number;
}[] = [
  { value: "under_10", label: "Under 10", midpoint: 8 },
  { value: "10_20", label: "10–20", midpoint: 15 },
  { value: "20_35", label: "20–35", midpoint: 27 },
  { value: "35_50", label: "35–50", midpoint: 42 },
  { value: "50_plus", label: "50+", midpoint: 60 },
];

export const GUEST_COMPOSITION_OPTIONS: {
  value: GuestCompositionTag;
  label: string;
}[] = [
  { value: "bridesmaids_friends", label: "Mostly bridesmaids & close friends" },
  { value: "friends_family_mix", label: "Mix of friends and family" },
  { value: "multi_generational", label: "Multiple generations" },
  { value: "includes_kids", label: "Includes kids" },
  { value: "co_ed", label: "Co-ed / couples invited" },
  { value: "work_friends", label: "Work friends attending" },
];

export const FORMAT_OPTIONS: {
  value: ShowerFormat;
  label: string;
  emoji: string;
  blurb: string;
}[] = [
  { value: "brunch", label: "Brunch", emoji: "🍳", blurb: "Late morning, mimosas, daytime energy" },
  { value: "afternoon_tea", label: "Afternoon tea / luncheon", emoji: "🫖", blurb: "Elegant, seated, multi-generational" },
  { value: "dinner_party", label: "Dinner party", emoji: "🥘", blurb: "Evening, intimate, candles and wine" },
  { value: "party", label: "Party", emoji: "🎉", blurb: "Cocktails, music, less structured" },
  { value: "experience", label: "Experience", emoji: "🧖", blurb: "Class, spa, tasting, workshop" },
  { value: "backyard", label: "Backyard / at-home", emoji: "🏡", blurb: "Casual, warm, personal" },
  { value: "outdoor", label: "Outdoor", emoji: "🌳", blurb: "Garden, picnic, winery, rooftop" },
  { value: "shower_trip", label: "Shower trip", emoji: "🧳", blurb: "Weekend away (flag — overlaps bachelorette)" },
];

export const BUDGET_TIER_OPTIONS: {
  value: BudgetTier;
  label: string;
  short: string;
  voice: string;
}[] = [
  { value: "under_300", label: "Under $300", short: "<$300", voice: "keeping it simple and heartfelt" },
  { value: "300_750", label: "$300–$750", short: "$300–750", voice: "a nice gathering without going overboard" },
  { value: "750_1500", label: "$750–$1,500", short: "$750–1.5k", voice: "making it special" },
  { value: "1500_3000", label: "$1,500–$3,000", short: "$1.5k–3k", voice: "going all out" },
  { value: "3000_5000", label: "$3,000–$5,000", short: "$3k–5k", voice: "full event" },
  { value: "5000_plus", label: "$5,000+", short: "$5k+", voice: "no expense spared" },
];

export const CONTRIBUTION_OPTIONS: {
  value: ContributionModel;
  label: string;
}[] = [
  { value: "hosted", label: "Everything provided by the host" },
  { value: "potluck", label: "Potluck / group-contribution" },
  { value: "guests_cover", label: "Guests cover their own (restaurant/experience)" },
];

export const VENUE_OPTIONS: {
  value: VenueType;
  label: string;
  emoji: string;
}[] = [
  { value: "home", label: "At someone's home", emoji: "🏡" },
  { value: "restaurant", label: "Restaurant or café", emoji: "🍽️" },
  { value: "venue_space", label: "Venue or event space", emoji: "🏛️" },
  { value: "outdoors", label: "Outdoors (garden, park, winery)", emoji: "🌳" },
  { value: "experience", label: "Experience venue (class, spa, studio)", emoji: "🎨" },
  { value: "undecided", label: "Haven't decided — help me figure it out", emoji: "🤔" },
];

export const DAY_OF_WEEK_OPTIONS: { value: DayOfWeek; label: string }[] = [
  { value: "saturday", label: "Saturday" },
  { value: "sunday", label: "Sunday" },
  { value: "weekday_evening", label: "Weekday evening" },
];

export const TIME_OF_DAY_OPTIONS: { value: TimeOfDay; label: string }[] = [
  { value: "morning", label: "Morning" },
  { value: "afternoon", label: "Afternoon" },
  { value: "evening", label: "Evening" },
  { value: "unsure", label: "Not sure yet" },
];

// ── Default seeded state ───────────────────────────────────────────────────

export const DEFAULT_BRIDAL_SHOWER: BridalShowerState = {
  brideName: "Priya Sharma",
  brief: {
    plannerRole: "moh",
    coPlannerName: "",
    bridePersonality: ["earthy_relaxed", "sentimental"],
    guestCount: "20_35",
    guestComposition: ["friends_family_mix", "multi_generational"],
    format: "outdoor",
    budgetTier: "1500_3000",
    contribution: "hosted",
    venueType: "outdoors",
    city: "Austin, TX",
    dateTarget: "Saturday, May 16, 2026",
    dayOfWeek: "saturday",
    timeOfDay: "afternoon",
    updatedAt: null,
  },
  preferences: {
    loves: [
      "Fresh flowers, nothing too structured",
      "A long table with everyone together",
      "Her mom gives a toast",
    ],
    dislikes: [
      "Please no shower games",
      "No opening gifts in front of everyone",
    ],
    weddingColors: "Saffron, sage, cream",
    registryAt: "Crate & Barrel, Anthropologie Home",
  },
  selection: {
    conceptId: "garden_luncheon",
    selectedAt: null,
  },
  guests: [
    { id: "g_1", name: "Priya Sharma", relationship: "Bride", rsvp: "going", dietary: "Vegetarian", notes: "" },
    { id: "g_2", name: "Kavya Sharma", relationship: "MOH / Sister", rsvp: "going", dietary: "", notes: "Host" },
    { id: "g_3", name: "Aanya Mehta", relationship: "Bridesmaid", rsvp: "going", dietary: "Gluten-free", notes: "" },
    { id: "g_4", name: "Meera Iyer", relationship: "Bridesmaid", rsvp: "going", dietary: "", notes: "" },
    { id: "g_5", name: "Divya Patel", relationship: "Bridesmaid", rsvp: "pending", dietary: "", notes: "" },
    { id: "g_6", name: "Priya's Mom", relationship: "Mother of the Bride", rsvp: "going", dietary: "Vegetarian", notes: "Giving a toast" },
    { id: "g_7", name: "Priya's Aunt (Delhi)", relationship: "Aunt", rsvp: "going", dietary: "Vegetarian, no onion/garlic", notes: "" },
    { id: "g_8", name: "Priya's Grandmother", relationship: "Grandmother", rsvp: "going", dietary: "Vegetarian, soft foods", notes: "Needs shaded seating" },
    { id: "g_9", name: "Arjun's Mom", relationship: "Mother of the Groom", rsvp: "going", dietary: "", notes: "" },
    { id: "g_10", name: "Nisha Banerjee", relationship: "College friend", rsvp: "pending", dietary: "", notes: "Flying in from NYC" },
    { id: "g_11", name: "Sanjana Krishnan", relationship: "College friend", rsvp: "going", dietary: "", notes: "" },
    { id: "g_12", name: "Pooja Reddy", relationship: "Friend", rsvp: "going", dietary: "Vegan", notes: "" },
  ],
  budget: {
    totalBudgetCents: 225000,
    lines: [
      { id: "bl_1", label: "Venue / rentals", plannedCents: 45000, actualCents: 0, paidBy: "MOH + bridesmaids", note: "Long farm tables, linens, chairs" },
      { id: "bl_2", label: "Food", plannedCents: 75000, actualCents: 0, paidBy: "Bride's mom", note: "Catering for 25" },
      { id: "bl_3", label: "Drinks", plannedCents: 25000, actualCents: 0, paidBy: "MOH", note: "Rosé, prosecco, non-alc options" },
      { id: "bl_4", label: "Florals", plannedCents: 35000, actualCents: 0, paidBy: "Bridesmaids (split)", note: "Loose bud vases, one statement" },
      { id: "bl_5", label: "Paper & signage", plannedCents: 12000, actualCents: 0, paidBy: "MOH", note: "Invitations, place cards, menus" },
      { id: "bl_6", label: "Activities & favors", plannedCents: 15000, actualCents: 0, paidBy: "Bridesmaids", note: "Recipe cards, small favors" },
      { id: "bl_7", label: "Buffer", plannedCents: 18000, actualCents: 0, paidBy: "—", note: "Ice, last-minute runs" },
    ],
  },
  checklist: {
    done: {},
    custom: {},
  },
};
