// ── Bachelor seed data ─────────────────────────────────────────────────────
// Static defaults + option lists for the Bachelor module. Seed values set
// up a Scottsdale golf weekend demo so first-run users see a populated
// surface instead of empty cards.

import type {
  BachelorEnergy,
  BachelorState,
  BudgetTier,
  CelebrationStyle,
  CrewBracket,
  DurationPref,
  GroomInterest,
  MoodboardCategory,
  RsvpStatus,
  TravelMode,
} from "@/types/bachelor";

export const STYLE_OPTIONS: { value: CelebrationStyle; label: string }[] = [
  { value: "weekend_trip", label: "Weekend trip" },
  { value: "one_night_out", label: "One big night" },
  { value: "golf_weekend", label: "Golf weekend" },
  { value: "fishing_trip", label: "Fishing / outdoor trip" },
  { value: "adventure_trip", label: "Adventure trip" },
  { value: "destination", label: "Destination" },
];

export const THEME_PRESETS: { id: string; label: string }[] = [
  { id: "none", label: "No theme — just a good time" },
  { id: "sports_weekend", label: "Sports weekend (golf, game, racing)" },
  { id: "outdoor", label: "Outdoor adventure (fishing, hiking, camping)" },
  { id: "city_nightlife", label: "City nightlife" },
  { id: "destination", label: "Destination trip" },
  { id: "lowkey", label: "Low-key — cabin, poker, steaks" },
  { id: "custom", label: "Custom" },
];

export const MOODBOARD_CATEGORIES: {
  value: MoodboardCategory;
  label: string;
}[] = [
  { value: "venues", label: "Venues" },
  { value: "outfits", label: "Outfits / gear" },
  { value: "activities", label: "Activities" },
  { value: "food_drinks", label: "Food & drinks" },
  { value: "gear", label: "Must-brings" },
];

export const RSVP_OPTIONS: { value: RsvpStatus; label: string }[] = [
  { value: "going", label: "Going" },
  { value: "pending", label: "Pending" },
  { value: "cant_make_it", label: "Can't make it" },
];

// ── Vibe-check options ────────────────────────────────────────────────────

export const ENERGY_OPTIONS: {
  value: BachelorEnergy;
  label: string;
  blurb: string;
}[] = [
  {
    value: "go_big",
    label: "Go big or go home",
    blurb: "Vegas energy — nightlife, bottle service, zero restraint",
  },
  {
    value: "guys_trip",
    label: "Guys' trip that happens to be a bachelor",
    blurb: "Fishing, golf, bourbon, good meals",
  },
  {
    value: "get_after_it",
    label: "Get after it",
    blurb: "Mountain biking, surfing, skiing, skydiving, white water",
  },
  {
    value: "lowkey",
    label: "Low-key & legendary",
    blurb: "Cabin weekend, poker night, whiskey, steaks on the grill",
  },
  {
    value: "beach_bars",
    label: "Beach & bars",
    blurb: "Ocean, pool, daytime drinking, zero agenda",
  },
  {
    value: "event_anchored",
    label: "Build it around something",
    blurb: "A game, a fight, a race, a concert, a specific event",
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
  { value: "one_night", label: "One big night (local)" },
  { value: "weekend", label: "Weekend (2 nights)" },
  { value: "long_weekend", label: "Long weekend (3 nights)" },
  { value: "full_send", label: "Full send (4+ nights)" },
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
  { value: "sky", label: "Money isn't the issue", short: "Open" },
];

export const TRAVEL_MODE_OPTIONS: { value: TravelMode; label: string }[] = [
  { value: "drive_only", label: "Drive-to only (~4–5 hr max)" },
  { value: "fly_open", label: "Open to flying" },
  { value: "flexible", label: "Flexible — show me both" },
];

export const GROOM_INTEREST_OPTIONS: {
  value: GroomInterest;
  label: string;
}[] = [
  { value: "golf", label: "Golf" },
  { value: "fishing", label: "Fishing" },
  { value: "poker", label: "Poker" },
  { value: "bourbon", label: "Bourbon & whiskey" },
  { value: "craft_beer", label: "Craft beer & breweries" },
  { value: "cigars", label: "Cigars" },
  { value: "sports_watching", label: "Sports (watching)" },
  { value: "water_sports", label: "Water sports" },
  { value: "skiing", label: "Skiing & snowboarding" },
  { value: "hunting", label: "Hunting" },
  { value: "cars_racing", label: "Cars & racing" },
  { value: "live_music", label: "Live music" },
  { value: "comedy", label: "Comedy" },
  { value: "gaming", label: "Gaming" },
  { value: "bbq_cooking", label: "Cooking & BBQ" },
  { value: "hiking", label: "Hiking & outdoors" },
];

export const AVOID_TAG_OPTIONS: { value: string; label: string }[] = [
  { value: "strip_clubs", label: "Strip clubs" },
  { value: "boats", label: "Boats" },
  { value: "extreme_heat", label: "Extreme heat" },
  { value: "cold_weather", label: "Cold weather" },
  { value: "camping", label: "Camping" },
  { value: "big_crowds", label: "Big crowds" },
  { value: "clubs", label: "Clubs" },
  { value: "hiking", label: "Hiking" },
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

export const DEFAULT_BACHELOR: BachelorState = {
  basics: {
    groomName: "Arjun Mehta",
    organizers: [
      { id: "org_1", name: "Vikram Mehta", role: "Best Man · brother" },
      { id: "org_2", name: "Karan Joshi", role: "Groomsman" },
    ],
    dateRange: "July 12-14, 2026",
    location: "Scottsdale, AZ",
    style: "golf_weekend",
    guestCount: 10,
    surpriseMode: false,
  },
  vibeProfile: {
    energy: "guys_trip",
    crew: "7_10",
    duration: "long_weekend",
    budgetTier: "600_1000",
    travelMode: "fly_open",
    originAirports: "",
    groomInterests: ["golf", "bourbon", "sports_watching", "cigars"],
    avoidTags: ["strip_clubs"],
    month: "october",
    updatedAt: null,
  },
  vibe: {
    theme: "sports_weekend",
    customTheme: "",
    colorScheme: ["#1A1A1A", "#D4A853", "#8B4513"],
    dressCodes: [
      {
        id: "dc_1",
        eventLabel: "Arrivals",
        description: "Whatever you drove in — jeans are fine",
      },
      {
        id: "dc_2",
        eventLabel: "Golf day",
        description: "Polos and shorts — Stadium Course has a dress code",
      },
      {
        id: "dc_3",
        eventLabel: "Steak dinner",
        description: "Collared shirts, nice jeans — this is the one dinner",
      },
      {
        id: "dc_4",
        eventLabel: "Old Town night",
        description: "Normal going-out clothes — not flip-flops",
      },
      {
        id: "dc_5",
        eventLabel: "Send-off brunch",
        description: "Come as you are",
      },
    ],
  },
  moodboard: [
    {
      id: "mb_1",
      imageUrl: "",
      category: "venues",
      note: "6-bedroom house in Old Town with pool and grill",
    },
    {
      id: "mb_2",
      imageUrl: "",
      category: "activities",
      note: "Stadium Course at TPC — book 60 days out",
    },
    {
      id: "mb_3",
      imageUrl: "",
      category: "food_drinks",
      note: "Steak 44 — main room, reservation 6 weeks out",
    },
  ],
  groomPrefs: {
    loves: [
      "Good steak and a whiskey tasting",
      "Morning tee time — even if we're hurting",
      "Poker night with real chips",
      "Something active during the day",
    ],
    avoid: [
      "No strip clubs",
      "Nothing that would upset Priya",
      "Don't book anything before 9 AM on Sunday",
      "No embarrassing posts on social",
    ],
    dietary: [
      "One groomsman is gluten-free",
      "Nikhil doesn't drink — make sure there's something else",
    ],
  },
  guests: [
    {
      id: "g_1",
      name: "Arjun Mehta",
      role: "Groom",
      rsvp: "going",
      roomId: "room_1",
    },
    {
      id: "g_2",
      name: "Vikram Mehta",
      role: "Best Man / Brother",
      rsvp: "going",
      roomId: "room_1",
    },
    {
      id: "g_3",
      name: "Karan Joshi",
      role: "Groomsman",
      rsvp: "going",
      roomId: "room_2",
    },
    {
      id: "g_4",
      name: "Rohan Kapoor",
      role: "Groomsman",
      rsvp: "going",
      roomId: "room_2",
    },
    {
      id: "g_5",
      name: "Devansh Rao",
      role: "Groomsman",
      rsvp: "going",
      roomId: "room_3",
    },
    {
      id: "g_6",
      name: "Siddharth Banerjee",
      role: "Friend",
      rsvp: "going",
      roomId: "room_3",
    },
    {
      id: "g_7",
      name: "Aditya Sharma",
      role: "Friend",
      rsvp: "going",
      roomId: "room_4",
    },
    {
      id: "g_8",
      name: "Nikhil Iyer",
      role: "Friend",
      rsvp: "pending",
      roomId: null,
    },
    {
      id: "g_9",
      name: "Varun Desai",
      role: "Friend",
      rsvp: "pending",
      roomId: null,
    },
    {
      id: "g_10",
      name: "Raghav Malhotra",
      role: "Cousin",
      rsvp: "pending",
      roomId: null,
    },
  ],
  rooms: [
    { id: "room_1", label: "Room 1 (King)", capacity: 2 },
    { id: "room_2", label: "Room 2 (King)", capacity: 2 },
    { id: "room_3", label: "Room 3 (Queens)", capacity: 2 },
    { id: "room_4", label: "Room 4 (Bunk)", capacity: 4 },
  ],
  days: [
    { id: "day_1", date: "Friday, Oct 17", label: "Roll in" },
    { id: "day_2", date: "Saturday, Oct 18", label: "The main event" },
    { id: "day_3", date: "Sunday, Oct 19", label: "Send-off" },
  ],
  events: [
    {
      id: "ev_1",
      dayId: "day_1",
      time: "3:00 PM",
      activity: "House check-in — Old Town Airbnb",
      notes: "Room assignments already set — drop bags, crack beers",
      confirmed: true,
    },
    {
      id: "ev_2",
      dayId: "day_1",
      time: "5:30 PM",
      activity: "Grocery + liquor run",
      notes: "Vikram + Karan on costco run. Split at the house.",
      confirmed: true,
    },
    {
      id: "ev_3",
      dayId: "day_1",
      time: "7:30 PM",
      activity: "Steaks on the grill + poker night",
      location: "At the house",
      notes: "Low-key on purpose — saving energy for tomorrow",
      confirmed: true,
    },
    {
      id: "ev_4",
      dayId: "day_2",
      time: "7:30 AM",
      activity: "Tee time — TPC Stadium Course",
      reservation: "Party of 8, two groups — booked under Vikram",
      dressCode: "Collared shirts required",
      confirmed: true,
    },
    {
      id: "ev_5",
      dayId: "day_2",
      time: "1:00 PM",
      activity: "Lunch at The Vig",
      reservation: "Walk-in, back patio",
      confirmed: false,
    },
    {
      id: "ev_6",
      dayId: "day_2",
      time: "3:00 PM",
      activity: "Pool time back at the house",
      confirmed: true,
    },
    {
      id: "ev_7",
      dayId: "day_2",
      time: "7:00 PM",
      activity: "Dinner — Steak 44",
      reservation: "Main room, reservation for 10 at 7pm",
      dressCode: "Collared / nice jeans",
      confirmed: true,
    },
    {
      id: "ev_8",
      dayId: "day_2",
      time: "10:00 PM",
      activity: "Old Town — Bottled Blonde → Casa Amigos",
      location: "Old Town Scottsdale",
      confirmed: false,
    },
    {
      id: "ev_9",
      dayId: "day_2",
      time: "12:30 AM",
      activity: "Coach House dive bar — nightcap",
      optional: true,
      confirmed: false,
    },
    {
      id: "ev_10",
      dayId: "day_3",
      time: "11:00 AM",
      activity: "Brunch at Hash Kitchen",
      notes: "Build-your-own bloody mary bar — the move",
      confirmed: false,
    },
    {
      id: "ev_11",
      dayId: "day_3",
      time: "1:30 PM",
      activity: "Pool + beers or ATV (optional)",
      optional: true,
      notes: "Only if the crew has gas left",
      confirmed: false,
    },
    {
      id: "ev_12",
      dayId: "day_3",
      time: "4:00 PM",
      activity: "Airport runs begin",
      confirmed: true,
    },
  ],
  expenses: [
    {
      id: "exp_1",
      label: "House rental (3 nights)",
      amountCents: 280000,
      split: { kind: "equal" },
    },
    {
      id: "exp_2",
      label: "Golf — 8 at Stadium Course",
      amountCents: 240000,
      split: { kind: "split_among_guests" },
      notes: "Groom plays free — crew splits his green fee",
    },
    {
      id: "exp_3",
      label: "Groceries + liquor for the house",
      amountCents: 75000,
      split: { kind: "equal" },
    },
    {
      id: "exp_4",
      label: "Steak 44 dinner",
      amountCents: 150000,
      split: { kind: "equal" },
    },
    {
      id: "exp_5",
      label: "Old Town bar night (pool shared)",
      amountCents: 60000,
      split: { kind: "equal" },
    },
    {
      id: "exp_6",
      label: "Brunch Sunday",
      amountCents: 45000,
      split: { kind: "equal" },
    },
  ],
  payments: {
    g_2: { guestId: "g_2", paidCents: 80000, status: "paid" },
    g_3: { guestId: "g_3", paidCents: 80000, status: "paid" },
    g_4: { guestId: "g_4", paidCents: 40000, status: "partial" },
    g_5: { guestId: "g_5", paidCents: 40000, status: "partial" },
    g_6: { guestId: "g_6", paidCents: 0, status: "unpaid" },
    g_7: { guestId: "g_7", paidCents: 0, status: "unpaid" },
  },
  organizerNotes: [
    {
      id: "note_1",
      createdAt: "2026-04-10T14:00:00Z",
      body: "Nikhil mentioned things are tight this year. If he ends up short for the golf round, I'll pick up the difference quietly — don't bring it up.",
    },
    {
      id: "note_2",
      createdAt: "2026-04-15T18:00:00Z",
      body: "Priya asked us to keep social posts off until after she sees them. Pass this along without making it a thing.",
    },
  ],
  budget: {
    splittingRule: "equal",
    groomPaysShare: false,
  },
  documents: [
    {
      id: "doc_1",
      label: "Airbnb — Old Town 6BR booking confirmation",
      category: "booking",
      url: "",
      addedAt: "2026-04-01T09:00:00Z",
    },
    {
      id: "doc_2",
      label: "Stadium Course tee time confirmation",
      category: "reservation",
      url: "",
      addedAt: "2026-04-05T12:00:00Z",
    },
    {
      id: "doc_3",
      label: "Steak 44 reservation",
      category: "reservation",
      url: "",
      addedAt: "2026-04-08T15:00:00Z",
    },
  ],
};
