// ── Bachelorette seed data ─────────────────────────────────────────────────
// Static defaults + option lists for the Bachelorette module. Seed values
// match the Scottsdale demo from the spec so first-run users see a populated
// surface instead of empty cards.

import type {
  BacheloretteEnergy,
  BacheloretteState,
  BudgetTier,
  CelebrationStyle,
  CrewBracket,
  DurationPref,
  MoodboardCategory,
  RsvpStatus,
  TravelMode,
} from "@/types/bachelorette";

export const STYLE_OPTIONS: { value: CelebrationStyle; label: string }[] = [
  { value: "weekend_trip", label: "Weekend trip" },
  { value: "one_night_out", label: "One night out" },
  { value: "spa_day", label: "Spa day" },
  { value: "dinner_party", label: "Dinner party" },
  { value: "adventure_trip", label: "Adventure trip" },
  { value: "destination", label: "Destination" },
];

export const THEME_PRESETS: { id: string; label: string }[] = [
  { id: "none", label: "No theme — just a good time" },
  { id: "spa_wellness", label: "Spa & wellness" },
  { id: "pool_tropical", label: "Pool party / tropical" },
  { id: "bollywood", label: "Bollywood night" },
  { id: "destination_adventure", label: "Destination adventure" },
  { id: "classy_dinner", label: "Classy dinner party" },
  { id: "custom", label: "Custom" },
];

export const MOODBOARD_CATEGORIES: {
  value: MoodboardCategory;
  label: string;
}[] = [
  { value: "decor", label: "Decor" },
  { value: "outfits", label: "Outfits" },
  { value: "activities", label: "Activities" },
  { value: "food_drinks", label: "Food & drinks" },
  { value: "gifts", label: "Gifts" },
];

export const RSVP_OPTIONS: { value: RsvpStatus; label: string }[] = [
  { value: "going", label: "Going" },
  { value: "pending", label: "Pending" },
  { value: "cant_make_it", label: "Can't make it" },
];

// ── Vibe-check options (quiz + summary card) ──────────────────────────────

export const ENERGY_OPTIONS: {
  value: BacheloretteEnergy;
  label: string;
  blurb: string;
}[] = [
  {
    value: "party",
    label: "Party 'til sunrise",
    blurb: "Nightlife-heavy, clubs, pool parties",
  },
  {
    value: "pamper",
    label: "Pamper & unwind",
    blurb: "Spa days, wine tastings, slow mornings",
  },
  {
    value: "adventure",
    label: "Adventure crew",
    blurb: "Hiking, water sports, adrenaline",
  },
  {
    value: "bougie",
    label: "Bougie & curated",
    blurb: "Fine dining, rooftop bars, aesthetic everything",
  },
  {
    value: "beach",
    label: "Beach bums",
    blurb: "Ocean, sun, zero plans",
  },
  {
    value: "unexpected",
    label: "Something unexpected",
    blurb: "Off-the-beaten-path, unique experiences",
  },
];

export const CREW_OPTIONS: {
  value: CrewBracket;
  label: string;
  midpoint: number;
}[] = [
  { value: "4_6", label: "4–6", midpoint: 5 },
  { value: "7_10", label: "7–10", midpoint: 8 },
  { value: "11_15", label: "11–15", midpoint: 13 },
  { value: "16_plus", label: "16+", midpoint: 18 },
];

export const DURATION_OPTIONS: { value: DurationPref; label: string }[] = [
  { value: "weekend", label: "Weekend (2 nights)" },
  { value: "long_weekend", label: "Long weekend (3 nights)" },
  { value: "full_week", label: "Full week" },
  { value: "unsure", label: "Not sure yet" },
];

export const BUDGET_TIER_OPTIONS: {
  value: BudgetTier;
  label: string;
  short: string;
}[] = [
  { value: "under_300", label: "Under $300 / person", short: "< $300" },
  { value: "300_600", label: "$300–$600 / person", short: "$300–600" },
  { value: "600_1000", label: "$600–$1,000 / person", short: "$600–1k" },
  { value: "1000_2000", label: "$1,000–$2,000 / person", short: "$1k–2k" },
  { value: "sky", label: "Sky's the limit", short: "Sky's the limit" },
];

export const TRAVEL_MODE_OPTIONS: { value: TravelMode; label: string }[] = [
  { value: "drive_only", label: "Drive-to only (~4–5 hr max)" },
  { value: "fly_open", label: "Open to flying" },
  { value: "flexible", label: "Flexible — show me both" },
];

export const AVOID_TAG_OPTIONS: { value: string; label: string }[] = [
  { value: "boats", label: "Boats" },
  { value: "extreme_heat", label: "Extreme heat" },
  { value: "cold_weather", label: "Cold weather" },
  { value: "big_crowds", label: "Big crowds" },
  { value: "clubs", label: "Clubs" },
  { value: "camping", label: "Camping" },
  { value: "red_eye", label: "Red-eye flights" },
  { value: "early_mornings", label: "Early mornings" },
  { value: "long_drives", label: "Long drives" },
  { value: "bugs", label: "Bugs" },
];

export const MONTH_OPTIONS: { value: string; label: string }[] = [
  { value: "january", label: "January" },
  { value: "february", label: "February" },
  { value: "march", label: "March" },
  { value: "april", label: "April" },
  { value: "may", label: "May" },
  { value: "june", label: "June" },
  { value: "july", label: "July" },
  { value: "august", label: "August" },
  { value: "september", label: "September" },
  { value: "october", label: "October" },
  { value: "november", label: "November" },
  { value: "december", label: "December" },
  { value: "flexible", label: "Flexible" },
];

export const DEFAULT_BACHELORETTE: BacheloretteState = {
  basics: {
    brideName: "Priya Sharma",
    organizers: [
      { id: "org_1", name: "Kavya Sharma", role: "MOH" },
      { id: "org_2", name: "Aanya Mehta", role: "Bridesmaid" },
    ],
    dateRange: "March 22-24, 2026",
    location: "Scottsdale, AZ",
    style: "weekend_trip",
    guestCount: 12,
    surpriseMode: false,
  },
  vibeProfile: {
    energy: "pamper",
    crew: "11_15",
    duration: "long_weekend",
    budgetTier: "600_1000",
    travelMode: "fly_open",
    originAirports: "",
    avoidTags: ["clubs"],
    month: "march",
    updatedAt: null,
  },
  vibe: {
    theme: "spa_wellness",
    customTheme: "",
    colorScheme: ["#F5E6D3", "#C4766E", "#D4A853"],
    dressCodes: [
      {
        id: "dc_1",
        eventLabel: "Day 1 arrival",
        description: "Casual / cute travel outfits",
      },
      {
        id: "dc_2",
        eventLabel: "Day 2 pool",
        description: "Matching swimsuits / bride in white",
      },
      {
        id: "dc_3",
        eventLabel: "Day 2 dinner",
        description: "Cocktail attire / coordinated colour",
      },
      {
        id: "dc_4",
        eventLabel: "Day 3 brunch",
        description: "Casual / matching pajamas",
      },
    ],
  },
  moodboard: [
    {
      id: "mb_1",
      imageUrl: "",
      category: "decor",
      note: "Desert tablescape — terracotta, cream linens",
    },
    {
      id: "mb_2",
      imageUrl: "",
      category: "outfits",
      note: "Matching coverups with gold lettering",
    },
    {
      id: "mb_3",
      imageUrl: "",
      category: "activities",
      note: "Sunrise hike — Camelback",
    },
  ],
  bridePrefs: {
    loves: [
      "A sunrise hike",
      "Good food",
      "Time to just talk without wedding stress",
      "Matching pajamas",
    ],
    avoid: [
      "No strippers (seriously)",
      "No embarrassing games",
      "Nothing posted on social without my ok",
    ],
    dietary: [
      "I'm not drinking much right now",
      "One friend is vegan",
      "One friend is pregnant — low-key alcohol is fine",
    ],
  },
  guests: [
    {
      id: "g_1",
      name: "Kavya Sharma",
      role: "MOH / Host",
      rsvp: "going",
      roomId: "room_1",
    },
    {
      id: "g_2",
      name: "Aanya Mehta",
      role: "Bridesmaid",
      rsvp: "going",
      roomId: "room_1",
    },
    {
      id: "g_3",
      name: "Mira Patel",
      role: "Bridesmaid",
      rsvp: "going",
      roomId: "room_2",
    },
    {
      id: "g_4",
      name: "Priya Sharma",
      role: "Bride",
      rsvp: "going",
      roomId: "room_2",
    },
    {
      id: "g_5",
      name: "Riya Kapoor",
      role: "Friend",
      rsvp: "pending",
      roomId: null,
    },
    {
      id: "g_6",
      name: "Neha Singh",
      role: "Cousin",
      rsvp: "cant_make_it",
      roomId: null,
    },
    {
      id: "g_7",
      name: "Tara Menon",
      role: "Friend",
      rsvp: "going",
      roomId: "room_3",
    },
    {
      id: "g_8",
      name: "Divya Patel",
      role: "Friend",
      rsvp: "going",
      roomId: "room_3",
    },
  ],
  rooms: [
    { id: "room_1", label: "Room 1", capacity: 2 },
    { id: "room_2", label: "Room 2", capacity: 2 },
    { id: "room_3", label: "Room 3", capacity: 2 },
    { id: "room_4", label: "Room 4", capacity: 2 },
  ],
  days: [
    { id: "day_1", date: "Friday, March 22", label: "Arrival" },
    { id: "day_2", date: "Saturday, March 23", label: "The Big Day" },
    { id: "day_3", date: "Sunday, March 24", label: "Farewell" },
  ],
  events: [
    {
      id: "ev_1",
      dayId: "day_1",
      time: "3:00 PM",
      activity: "Check in — Scottsdale Resort",
      notes: "Room assignments shared in group chat",
      confirmed: true,
    },
    {
      id: "ev_2",
      dayId: "day_1",
      time: "5:00 PM",
      activity: "Pool time",
      notes: "Settle in, drinks by the pool",
      confirmed: true,
    },
    {
      id: "ev_3",
      dayId: "day_1",
      time: "7:30 PM",
      activity: "Dinner — Maple & Ash",
      reservation: "Reservation for 12",
      dressCode: "Cocktail casual",
      confirmed: true,
    },
    {
      id: "ev_4",
      dayId: "day_1",
      time: "10:00 PM",
      activity: "Rooftop drinks, games",
      location: "Back at hotel",
      confirmed: false,
    },
    {
      id: "ev_5",
      dayId: "day_2",
      time: "8:00 AM",
      activity: "Sunrise hike — Camelback Mountain",
      optional: true,
      notes: "For early risers",
      confirmed: false,
    },
    {
      id: "ev_6",
      dayId: "day_2",
      time: "10:30 AM",
      activity: "Brunch at hotel",
      confirmed: false,
    },
    {
      id: "ev_7",
      dayId: "day_2",
      time: "12:00 PM",
      activity: "Pool party",
      notes: "Decorations, music, matching swimsuits, photo wall",
      dressCode: "Matching swimsuits",
      confirmed: true,
    },
    {
      id: "ev_8",
      dayId: "day_2",
      time: "3:00 PM",
      activity: "Spa — couples massages, facials",
      reservation: "Booked at resort spa",
      confirmed: true,
    },
    {
      id: "ev_9",
      dayId: "day_2",
      time: "6:00 PM",
      activity: "Get ready — coordinated outfits, glam",
      confirmed: false,
    },
    {
      id: "ev_10",
      dayId: "day_2",
      time: "8:00 PM",
      activity: "Dinner — special restaurant TBD",
      confirmed: false,
    },
    {
      id: "ev_11",
      dayId: "day_2",
      time: "10:30 PM",
      activity: "Out — Old Town Scottsdale",
      optional: true,
      confirmed: false,
    },
    {
      id: "ev_12",
      dayId: "day_3",
      time: "9:00 AM",
      activity: "Matching pajama brunch",
      location: "At hotel",
      dressCode: "Matching pajamas",
      confirmed: true,
    },
    {
      id: "ev_13",
      dayId: "day_3",
      time: "11:00 AM",
      activity: "Check out",
      confirmed: false,
    },
    {
      id: "ev_14",
      dayId: "day_3",
      time: "12:00 PM",
      activity: "Goodbye hugs, airport runs",
      confirmed: false,
    },
  ],
  expenses: [
    {
      id: "exp_1",
      label: "Accommodation (3 rooms)",
      amountCents: 180000,
      split: { kind: "equal" },
    },
    {
      id: "exp_2",
      label: "Dinner Fri (Maple & Ash)",
      amountCents: 60000,
      split: { kind: "equal" },
    },
    {
      id: "exp_3",
      label: "Spa Saturday",
      amountCents: 96000,
      split: { kind: "individual" },
      notes: "Each person books their own",
    },
    {
      id: "exp_4",
      label: "Pool party decorations",
      amountCents: 20000,
      split: { kind: "organizers" },
    },
    {
      id: "exp_5",
      label: "Dinner Saturday",
      amountCents: 50000,
      split: { kind: "equal" },
    },
    {
      id: "exp_6",
      label: "Drinks & misc",
      amountCents: 40000,
      split: { kind: "equal" },
    },
    {
      id: "exp_7",
      label: "Bride's expenses",
      amountCents: 42000,
      split: { kind: "split_among_guests" },
    },
  ],
  payments: {
    g_1: { guestId: "g_1", paidCents: 45800, status: "paid" },
    g_2: { guestId: "g_2", paidCents: 30000, status: "partial" },
    g_3: { guestId: "g_3", paidCents: 0, status: "unpaid" },
    g_7: { guestId: "g_7", paidCents: 0, status: "unpaid" },
    g_8: { guestId: "g_8", paidCents: 0, status: "unpaid" },
  },
  organizerNotes: [
    {
      id: "note_1",
      createdAt: "2026-03-01T10:00:00Z",
      body: "Mira mentioned budget is tight. Kavya and I will quietly cover her spa cost. Don't bring it up.",
    },
  ],
  budget: {
    splittingRule: "equal",
    bridePaysShare: false,
  },
  documents: [
    {
      id: "doc_1",
      label: "Scottsdale Resort confirmation",
      category: "booking",
      url: "",
      addedAt: "2026-02-14T09:00:00Z",
    },
    {
      id: "doc_2",
      label: "Maple & Ash reservation",
      category: "reservation",
      url: "",
      addedAt: "2026-02-20T14:00:00Z",
    },
  ],
};
