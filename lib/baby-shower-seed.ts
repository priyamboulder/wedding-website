// ── Baby Shower seed data ──────────────────────────────────────────────────
// Option lists + a seeded default state so the workspace opens fully
// populated. Seed matches the rest of the Ananya demo couple (Priya &
// Arjun) — shower planned by Priya's sister Kavya ~6 weeks before the
// due date, garden-party vibe with cultural elements.

import type {
  BabyShowerState,
  BabyShowerFundingModel,
  BabyShowerGuestMix,
  BabyShowerGuestTier,
  BabyShowerHardNo,
  BabyShowerPlannerRole,
  BabyShowerSeason,
  BabyShowerVenueType,
  BabyShowerVibe,
} from "@/types/baby-shower";

export const PLANNER_ROLE_OPTIONS: {
  value: BabyShowerPlannerRole;
  label: string;
}[] = [
  { value: "host", label: "I'm the host (friend / family)" },
  { value: "parent_to_be", label: "I'm the parent-to-be, planning my own" },
  { value: "co_host", label: "We're co-hosting" },
];

export const FUNDING_MODEL_OPTIONS: {
  value: BabyShowerFundingModel;
  label: string;
  blurb: string;
}[] = [
  {
    value: "host_funded",
    label: "I'm hosting and covering it",
    blurb: "Simple budget tracker",
  },
  {
    value: "co_host_split",
    label: "We're splitting costs (co-hosts)",
    blurb: "Split view with contribution tracking",
  },
  {
    value: "group_fund",
    label: "Group fund (guests contribute)",
    blurb: "Contribution tracker with optional per-guest amounts",
  },
  {
    value: "parent_funded",
    label: "Parent(s)-to-be are funding it",
    blurb: "Simple budget tracker",
  },
];

export const GUEST_TIER_OPTIONS: {
  value: BabyShowerGuestTier;
  label: string;
  midpoint: number;
}[] = [
  { value: "intimate", label: "Intimate · 5–15", midpoint: 10 },
  { value: "medium", label: "Medium · 15–30", midpoint: 22 },
  { value: "large", label: "Large · 30–50", midpoint: 40 },
  { value: "grand", label: "Grand · 50+", midpoint: 70 },
];

export const GUEST_MIX_OPTIONS: {
  value: BabyShowerGuestMix;
  label: string;
}[] = [
  { value: "adults_only", label: "All adults" },
  { value: "kids_welcome", label: "Kids welcome" },
  { value: "mixed", label: "Mix of both" },
];

export const VIBE_OPTIONS: {
  value: BabyShowerVibe;
  label: string;
  blurb: string;
  emoji: string;
}[] = [
  {
    value: "garden_party",
    label: "Garden Party",
    blurb: "Florals, pastels, lemonade, long tables under the trees",
    emoji: "🌿",
  },
  {
    value: "modern_minimal",
    label: "Modern Minimal",
    blurb: "Clean lines, neutral palette, curated details over excess",
    emoji: "◻️",
  },
  {
    value: "brunch_bubbles",
    label: "Brunch & Bubbles",
    blurb: "Mimosa bar, waffle station, late-morning golden light",
    emoji: "🥂",
  },
  {
    value: "co_ed",
    label: "Co-Ed Celebration",
    blurb: "BBQ, lawn games, everyone's invited — not just the women",
    emoji: "🔥",
  },
  {
    value: "cultural_traditional",
    label: "Cultural & Traditional",
    blurb: "Godh Bharai, Valaikappu, Aqiqah — honor your heritage",
    emoji: "🪔",
  },
  {
    value: "adventure_babymoon",
    label: "Adventure / Babymoon",
    blurb: "A weekend trip that doubles as the shower",
    emoji: "🧳",
  },
  {
    value: "book_themed",
    label: "Book-Themed",
    blurb: "Build a library — every guest brings a favorite children's book",
    emoji: "📚",
  },
  {
    value: "virtual_hybrid",
    label: "Virtual / Hybrid",
    blurb: "Long-distance loved ones join in — designed for screens too",
    emoji: "💻",
  },
  {
    value: "surprise",
    label: "Surprise Shower",
    blurb: "Shhh. The parent(s)-to-be don't know yet.",
    emoji: "🤫",
  },
];

export const VENUE_OPTIONS: {
  value: BabyShowerVenueType;
  label: string;
  emoji: string;
}[] = [
  { value: "home", label: "Someone's home", emoji: "🏡" },
  { value: "restaurant", label: "Restaurant / private dining", emoji: "🍽️" },
  { value: "banquet_hall", label: "Banquet hall / event hall", emoji: "🏛️" },
  { value: "hotel", label: "Hotel ballroom", emoji: "🏨" },
  { value: "cultural_center", label: "Community / cultural center", emoji: "🛕" },
  { value: "outdoors", label: "Outdoors (park, garden, rooftop)", emoji: "🌳" },
  { value: "destination", label: "Destination weekend", emoji: "🗺️" },
  { value: "undecided", label: "Still deciding — show me options", emoji: "🤔" },
];

export const FORMAL_VENUE_TYPES: BabyShowerVenueType[] = [
  "banquet_hall",
  "hotel",
  "restaurant",
];

export const SEASON_OPTIONS: {
  value: BabyShowerSeason;
  label: string;
}[] = [
  { value: "spring", label: "Spring" },
  { value: "summer", label: "Summer" },
  { value: "fall", label: "Fall" },
  { value: "winter", label: "Winter" },
];

export const HARD_NO_OPTIONS: {
  value: BabyShowerHardNo;
  label: string;
  blurb: string;
}[] = [
  {
    value: "no_games",
    label: "No games",
    blurb: "Skip the 'guess the baby food' energy",
  },
  {
    value: "no_gender_reveal",
    label: "No gender reveal",
    blurb: "Keep the focus on the parent(s)-to-be",
  },
  {
    value: "no_alcohol",
    label: "No alcohol",
    blurb: "Or: alcohol-free options required",
  },
  {
    value: "no_surprise",
    label: "No surprise element",
    blurb: "Parent(s)-to-be want to be involved",
  },
];

// ── Default seed state ────────────────────────────────────────────────────

export const DEFAULT_BABY_SHOWER: BabyShowerState = {
  parentName: "Priya",
  plan: {
    dueDate: "Saturday, September 5, 2026",
    showerDate: "Sunday, July 19, 2026",
    showerWindow: "4–8 weeks before the due date",
    plannerRole: "host",
    coHostInvite: "",
    isSurprise: false,
    guestTier: "medium",
    guestMix: "adults_only",
    vibes: ["garden_party", "cultural_traditional"],
    venueType: "home",
    venueName: "",
    venueCapacity: "",
    cateringIncluded: null,
    avAvailable: null,
    venueRestrictions: "",
    season: "summer",
    hardNos: ["no_games", "no_gender_reveal"],
    dietaryRestrictions: "Mostly vegetarian; two gluten-free guests",
    accessibilityNeeds: "Shaded seating for Priya's grandmother",
    budgetCeilingCents: 350000,
    thingsThatFeelLikeUs: [
      "Priya's family is obsessed with Godh Bharai — we want bangles",
      "Long table with everyone together, like her bridal shower",
      "Her mom's mithai recipes have to be on the menu",
    ],
    updatedAt: null,
  },
  funding: "co_host_split",
  recStatus: {},
  guests: [
    {
      id: "g_1",
      name: "Priya Sharma",
      email: "priya@example.com",
      phone: "",
      groupTag: "Guest of honor",
      side: "yours",
      rsvp: "going",
      plusOnes: 1,
      kidsCount: 0,
      dietary: "Vegetarian",
      accessibility: "",
      rsvpMessage: "Can't wait 🤍",
      contributionCents: 0,
      contributionStatus: "none",
    },
    {
      id: "g_2",
      name: "Kavya Sharma",
      email: "kavya@example.com",
      phone: "",
      groupTag: "Sister / Host",
      side: "yours",
      rsvp: "going",
      plusOnes: 0,
      kidsCount: 0,
      dietary: "",
      accessibility: "",
      rsvpMessage: "",
      contributionCents: 80000,
      contributionStatus: "paid",
    },
    {
      id: "g_3",
      name: "Priya's Mom",
      email: "",
      phone: "",
      groupTag: "Family",
      side: "yours",
      rsvp: "going",
      plusOnes: 0,
      kidsCount: 0,
      dietary: "Vegetarian",
      accessibility: "",
      rsvpMessage: "",
      contributionCents: 80000,
      contributionStatus: "paid",
    },
    {
      id: "g_4",
      name: "Priya's Grandmother",
      email: "",
      phone: "",
      groupTag: "Family",
      side: "yours",
      rsvp: "going",
      plusOnes: 0,
      kidsCount: 0,
      dietary: "Vegetarian, soft foods",
      accessibility: "Shaded seating, close to restroom",
      rsvpMessage: "",
      contributionCents: 0,
      contributionStatus: "none",
    },
    {
      id: "g_5",
      name: "Arjun's Mom",
      email: "",
      phone: "",
      groupTag: "Partner's family",
      side: "partners",
      rsvp: "going",
      plusOnes: 0,
      kidsCount: 0,
      dietary: "",
      accessibility: "",
      rsvpMessage: "",
      contributionCents: 80000,
      contributionStatus: "pledged",
    },
    {
      id: "g_6",
      name: "Aanya Mehta",
      email: "aanya@example.com",
      phone: "",
      groupTag: "Friends",
      side: "yours",
      rsvp: "going",
      plusOnes: 0,
      kidsCount: 1,
      dietary: "Gluten-free",
      accessibility: "",
      rsvpMessage: "",
      contributionCents: 0,
      contributionStatus: "none",
    },
    {
      id: "g_7",
      name: "Meera Iyer",
      email: "",
      phone: "",
      groupTag: "Friends",
      side: "yours",
      rsvp: "invited",
      plusOnes: 0,
      kidsCount: 0,
      dietary: "",
      accessibility: "",
      rsvpMessage: "",
      contributionCents: 0,
      contributionStatus: "none",
    },
    {
      id: "g_8",
      name: "Nisha Banerjee",
      email: "",
      phone: "",
      groupTag: "Friends",
      side: "yours",
      rsvp: "invited",
      plusOnes: 1,
      kidsCount: 0,
      dietary: "",
      accessibility: "",
      rsvpMessage: "",
      contributionCents: 0,
      contributionStatus: "none",
    },
    {
      id: "g_9",
      name: "Pooja Reddy",
      email: "",
      phone: "",
      groupTag: "Coworkers",
      side: "yours",
      rsvp: "maybe",
      plusOnes: 0,
      kidsCount: 0,
      dietary: "Vegan",
      accessibility: "",
      rsvpMessage: "",
      contributionCents: 0,
      contributionStatus: "none",
    },
    {
      id: "g_10",
      name: "Sanjana Krishnan",
      email: "",
      phone: "",
      groupTag: "Friends",
      side: "yours",
      rsvp: "not_sent",
      plusOnes: 0,
      kidsCount: 0,
      dietary: "",
      accessibility: "",
      rsvpMessage: "",
      contributionCents: 0,
      contributionStatus: "none",
    },
  ],
  coHosts: [
    {
      id: "ch_1",
      name: "Kavya Sharma",
      email: "kavya@example.com",
      shareCents: 120000,
      paidCents: 80000,
      status: "partial",
      permissions: "full",
    },
    {
      id: "ch_2",
      name: "Priya's Mom",
      email: "",
      shareCents: 120000,
      paidCents: 80000,
      status: "partial",
      permissions: "full",
    },
    {
      id: "ch_3",
      name: "Arjun's Mom",
      email: "",
      shareCents: 110000,
      paidCents: 0,
      status: "pending",
      permissions: "full",
    },
  ],
  itinerary: [
    {
      id: "it_1",
      dayNumber: 1,
      startTime: "11:00",
      durationMinutes: 30,
      activityName: "Guests arrive & mingle",
      description: "Welcome drinks open, background music, bangle station warms up",
      blockType: "standard",
      sortOrder: 0,
      sourceRecId: null,
    },
    {
      id: "it_2",
      dayNumber: 1,
      startTime: "11:30",
      durationMinutes: 45,
      activityName: "Brunch service",
      description: "Family-style platters go out — herb crostini, fruit, mithai",
      blockType: "standard",
      sortOrder: 1,
      sourceRecId: null,
    },
    {
      id: "it_3",
      dayNumber: 1,
      startTime: "12:15",
      durationMinutes: 30,
      activityName: "Bangle ceremony & blessings",
      description: "Elder women slip bangles onto Priya's wrists while blessings are shared",
      blockType: "highlight",
      sortOrder: 2,
      sourceRecId: "theme_godh_bharai_modern",
    },
    {
      id: "it_4",
      dayNumber: 1,
      startTime: "12:45",
      durationMinutes: 30,
      activityName: "Onesie decorating bar",
      description: "Stations set up on the long table — fabric markers, iron-on patches",
      blockType: "standard",
      sortOrder: 3,
      sourceRecId: "activity_onesie_bar",
    },
    {
      id: "it_5",
      dayNumber: 1,
      startTime: "13:15",
      durationMinutes: 20,
      activityName: "Dessert & cake",
      description: "Mithai display, coffee/tea service, optional cake cutting",
      blockType: "standard",
      sortOrder: 4,
      sourceRecId: null,
    },
    {
      id: "it_6",
      dayNumber: 1,
      startTime: "13:35",
      durationMinutes: 25,
      activityName: "Wind down & farewell",
      description: "Favor pickup (seeded herb pots), group photo under the lights",
      blockType: "standard",
      sortOrder: 5,
      sourceRecId: null,
    },
    {
      id: "it_7",
      dayNumber: 1,
      startTime: "09:00",
      durationMinutes: 120,
      activityName: "Arrive early to set up flowers & bangle table",
      description: "Host crew only — wildflower arrangements, mithai plating",
      blockType: "behind_the_scenes",
      sortOrder: -1,
      sourceRecId: null,
    },
  ],
  budget: {
    totalBudgetCents: 350000,
    groupFundGoalCents: 0,
  },
  expenses: [
    {
      id: "ex_1",
      category: "catering",
      vendor: "Spice Route Catering",
      amountCents: 110000,
      date: "2026-07-05",
      paidBy: "ch_2",
      receiptUrl: "",
      notes: "Vegetarian spread for 22, includes mithai platter",
      source: "manual",
    },
    {
      id: "ex_2",
      category: "decorations",
      vendor: "Flora & Bough",
      amountCents: 62000,
      date: "2026-07-12",
      paidBy: "ch_1",
      receiptUrl: "",
      notes: "Loose wildflower arrangements + 12 bud vases",
      source: "manual",
    },
    {
      id: "ex_3",
      category: "activities",
      vendor: "Craft supplies",
      amountCents: 14000,
      date: "2026-07-14",
      paidBy: "ch_1",
      receiptUrl: "",
      notes: "Blank onesies, fabric markers, iron-on patches",
      source: "manual",
    },
    {
      id: "ex_4",
      category: "invitations",
      vendor: "Paperie",
      amountCents: 9800,
      date: "2026-06-10",
      paidBy: "ch_1",
      receiptUrl: "",
      notes: "Custom marigold-motif invites, 25 count",
      source: "manual",
    },
  ],
  documents: [
    {
      id: "doc_1",
      name: "Spice Route Catering — Proposal.pdf",
      url: "#",
      category: "vendor_contract",
      uploadedAt: "2026-06-02T14:22:00Z",
      sizeLabel: "284 KB",
    },
    {
      id: "doc_2",
      name: "Flora & Bough — Invoice.pdf",
      url: "#",
      category: "receipt",
      uploadedAt: "2026-07-12T19:10:00Z",
      sizeLabel: "112 KB",
    },
    {
      id: "doc_3",
      name: "Inspiration — garden_longtable.jpg",
      url: "#",
      category: "inspiration",
      uploadedAt: "2026-05-20T11:00:00Z",
      sizeLabel: "1.2 MB",
    },
  ],
};
