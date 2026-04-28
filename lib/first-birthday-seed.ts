// ── Baby's First Birthday seed data ────────────────────────────────────────
// Option lists + the initial store payload. The demo defaults give a
// first-run user a partially populated surface — a baby, a date, a
// combined-ceremony vibe with Annaprashan selected, a few family rows, and
// a pre-seeded run-of-show so the tabs feel alive.

import type {
  AllergyFlag,
  FirstBirthdayCeremonyIntegration,
  FirstBirthdayCeremonyTradition,
  FirstBirthdayDiscoverMode,
  FirstBirthdayDuration,
  FirstBirthdayExpenseCategory,
  FirstBirthdayFundingModel,
  FirstBirthdayGuestMix,
  FirstBirthdayGuestTier,
  FirstBirthdayHardNo,
  FirstBirthdayKidAgeRange,
  FirstBirthdayOfficiant,
  FirstBirthdayState,
  FirstBirthdayVenueType,
  FirstBirthdayVibe,
} from "@/types/first-birthday";

// ── Vibes ──────────────────────────────────────────────────────────────────

export const VIBE_OPTIONS: {
  value: FirstBirthdayVibe;
  label: string;
  blurb: string;
}[] = [
  {
    value: "classic_sweet",
    label: "Classic & Sweet",
    blurb: "Pastels, balloons, a smash cake — timeless and simple",
  },
  {
    value: "themed_party",
    label: "Themed Party",
    blurb: "Pick a character, color, animal, or concept and go all in",
  },
  {
    value: "outdoor_adventure",
    label: "Outdoor Adventure",
    blurb: "Park party, petting zoo, picnic blankets, room to run",
  },
  {
    value: "modern_minimal",
    label: "Modern Minimal",
    blurb: "Neutral palette, tasteful details, looks good on camera",
  },
  {
    value: "grand_celebration",
    label: "Grand Celebration",
    blurb: "Banquet hall, professional everything, a proper event",
  },
  {
    value: "cultural_ceremony",
    label: "Cultural Ceremony",
    blurb: "Annaprashan, Dohl, Tol Janchi — honor your traditions",
  },
  {
    value: "backyard_bash",
    label: "Backyard Bash",
    blurb: "Casual, kid-friendly, sprinklers and popsicles, no stress",
  },
  {
    value: "combined_ceremony_party",
    label: "Combined Ceremony + Party",
    blurb: "Traditional ceremony first, party after — both in one day",
  },
  {
    value: "intimate_family",
    label: "Intimate Family Only",
    blurb: "Just grandparents, aunts, uncles — small and meaningful",
  },
];

// ── Guest tiers + mix ──────────────────────────────────────────────────────

export const GUEST_TIER_OPTIONS: {
  value: FirstBirthdayGuestTier;
  label: string;
  range: string;
}[] = [
  { value: "intimate", label: "Intimate", range: "5–15 guests" },
  { value: "medium", label: "Medium", range: "15–40 guests" },
  { value: "large", label: "Large", range: "40–80 guests" },
  { value: "grand", label: "Grand", range: "80–150 guests" },
  { value: "mega", label: "Mega", range: "150+ guests" },
];

export const GUEST_MIX_OPTIONS: {
  value: FirstBirthdayGuestMix;
  label: string;
  hint: string;
}[] = [
  {
    value: "mostly_adults",
    label: "Mostly adults",
    hint: "A few kids, but it's an adult crowd",
  },
  {
    value: "balanced",
    label: "Balanced mix",
    hint: "Roughly even split of adults and kids",
  },
  {
    value: "kid_heavy",
    label: "Kid-heavy",
    hint: "Toddlers, cousins, siblings — a roomful of little ones",
  },
];

// ── Duration ───────────────────────────────────────────────────────────────

export const DURATION_OPTIONS: {
  value: FirstBirthdayDuration;
  label: string;
  hint: string;
}[] = [
  { value: "short", label: "Short & sweet", hint: "1–2 hours" },
  { value: "afternoon", label: "Afternoon party", hint: "2–4 hours" },
  { value: "half_day", label: "Half-day celebration", hint: "4–6 hours" },
  { value: "full_day", label: "Full-day event", hint: "6+ hours, morning to evening" },
];

// ── Venue types ────────────────────────────────────────────────────────────

export const VENUE_TYPE_OPTIONS: {
  value: FirstBirthdayVenueType;
  label: string;
}[] = [
  { value: "home", label: "Our home / family's home" },
  { value: "backyard", label: "Backyard / garden" },
  { value: "restaurant", label: "Restaurant / private dining" },
  { value: "banquet_hall", label: "Banquet hall / event hall" },
  { value: "hotel", label: "Hotel ballroom" },
  { value: "cultural_center", label: "Cultural center / temple / gurdwara" },
  { value: "park", label: "Park / outdoor public space" },
  { value: "kids_venue", label: "Kids' venue (play gym, museum)" },
  { value: "destination", label: "Destination / weekend trip" },
  { value: "undecided", label: "Still deciding" },
];

// ── Cultural ceremony traditions ───────────────────────────────────────────

export const CEREMONY_TRADITION_OPTIONS: {
  value: FirstBirthdayCeremonyTradition;
  label: string;
  blurb: string;
}[] = [
  {
    value: "annaprashan",
    label: "Annaprashan / Mukhe Bhaat",
    blurb: "Bengali / Indian — first rice ceremony",
  },
  {
    value: "choroonu",
    label: "Choroonu",
    blurb: "Kerala — first feeding of solid food",
  },
  {
    value: "dohl",
    label: "Dohl / Dol",
    blurb: "Korean — traditional first birthday",
  },
  {
    value: "tol_janchi",
    label: "Tol Janchi",
    blurb: "Korean — modern first birthday celebration",
  },
  {
    value: "zhuazhou",
    label: "Zhuazhou",
    blurb: "Chinese — object-grabbing ceremony",
  },
  {
    value: "mundan",
    label: "First Haircut / Mundan",
    blurb: "Hindu — head-shaving ceremony",
  },
  {
    value: "aqiqah",
    label: "Aqiqah",
    blurb: "Islamic — sometimes combined with first birthday",
  },
  {
    value: "cradle_naming",
    label: "Cradle / Naming Ceremony",
    blurb: "Various — sometimes held at first birthday",
  },
];

export const CEREMONY_INTEGRATION_OPTIONS: {
  value: FirstBirthdayCeremonyIntegration;
  label: string;
}[] = [
  { value: "separate_event", label: "Separate event" },
  { value: "same_day_separate", label: "Same day, different time" },
  { value: "fully_integrated", label: "Fully integrated" },
  { value: "undecided", label: "Not sure — show me options" },
];

export const OFFICIANT_OPTIONS: {
  value: FirstBirthdayOfficiant;
  label: string;
}[] = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
  { value: "not_sure", label: "Not sure" },
];

// ── Kid awareness ──────────────────────────────────────────────────────────

export const KID_AGE_RANGE_OPTIONS: {
  value: FirstBirthdayKidAgeRange;
  label: string;
}[] = [
  { value: "babies_toddlers", label: "All babies / toddlers" },
  { value: "mix_0_5", label: "Mix of 0–5" },
  { value: "older_kids_too", label: "Older kids too (5–10)" },
  { value: "wide_range", label: "Wide range, all ages" },
];

// ── Hard no's ──────────────────────────────────────────────────────────────

export const HARD_NO_OPTIONS: {
  value: FirstBirthdayHardNo;
  label: string;
}[] = [
  { value: "no_clowns", label: "No clowns / costumed characters" },
  { value: "no_loud_music", label: "No super loud music" },
  { value: "no_gender_stereotype", label: "No gender-stereotyped theme" },
  { value: "no_smash_cake", label: "No smash cake" },
  { value: "must_smash_cake", label: "Smash cake is a must" },
  { value: "no_alcohol", label: "No alcohol" },
  { value: "no_structured_program", label: "No structured program — keep it freeform" },
  { value: "no_gifts_donate_instead", label: "No gifts / donate instead" },
];

// ── Expense categories ─────────────────────────────────────────────────────

export const EXPENSE_CATEGORY_OPTIONS: {
  value: FirstBirthdayExpenseCategory;
  label: string;
}[] = [
  { value: "venue", label: "Venue / Space rental" },
  { value: "catering", label: "Catering / Food & Drinks" },
  { value: "cake", label: "Cake & Smash Cake" },
  { value: "decorations", label: "Decorations & Florals" },
  { value: "balloon_artist", label: "Balloon Artist / Decorator" },
  { value: "entertainment", label: "Entertainment" },
  { value: "photography", label: "Photography / Videography" },
  { value: "ceremony_supplies", label: "Ceremony Supplies" },
  { value: "baby_outfits", label: "Baby's Outfit(s)" },
  { value: "favors", label: "Favors & Return Gifts" },
  { value: "rentals", label: "Rentals" },
  { value: "invitations", label: "Invitations & Paper Goods" },
  { value: "other", label: "Other" },
];

// ── Funding model ──────────────────────────────────────────────────────────

export const FUNDING_MODEL_OPTIONS: {
  value: FirstBirthdayFundingModel;
  label: string;
  hint: string;
}[] = [
  {
    value: "parent_funded",
    label: "We're covering it",
    hint: "Parents are paying — simple budget tracker",
  },
  {
    value: "family_helped",
    label: "Family is helping",
    hint: "Grandparents or relatives contributing",
  },
  {
    value: "co_host_split",
    label: "Splitting with co-hosts",
    hint: "Multiple hosts sharing the cost",
  },
  {
    value: "group_fund",
    label: "Group fund",
    hint: "Guests contributing toward the celebration",
  },
];

// ── Discover mode detection ────────────────────────────────────────────────

export function deriveDiscoverMode(
  vibes: FirstBirthdayVibe[],
  override: FirstBirthdayDiscoverMode | null,
): FirstBirthdayDiscoverMode {
  if (override) return override;
  if (vibes.includes("grand_celebration")) return "grand";
  if (vibes.includes("combined_ceremony_party")) return "combined";
  if (
    vibes.includes("cultural_ceremony") &&
    !vibes.some((v) =>
      ["classic_sweet", "themed_party", "outdoor_adventure", "backyard_bash"].includes(v),
    )
  ) {
    return "ceremony";
  }
  return "party";
}

// ── Default store payload ──────────────────────────────────────────────────
// Combined ceremony + party. A Bengali family planning Arya's Annaprashan
// in the morning and a small themed party in the afternoon, ~40 guests.

function uid(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

const seedAllergy: AllergyFlag = {
  id: "al_seed_1",
  allergen: "Tree nuts",
  severity: "moderate",
};

export const DEFAULT_FIRST_BIRTHDAY: FirstBirthdayState = {
  plan: {
    babyName: "Arya",
    birthdayDate: "October 10, 2026",
    partyDate: "October 10, 2026",
    partyWindow: "On the day",
    duration: "half_day",
    guestTier: "large",
    guestMix: "balanced",
    vibes: ["combined_ceremony_party", "classic_sweet"],
    venueType: "home",
    venueName: "",
    venueCapacity: "",
    cateringIncluded: null,
    avAvailable: null,
    venueRestrictions: "",
    hardNos: ["no_clowns", "no_loud_music"],
    dietaryRestrictions: "A few vegetarian guests, one guest is dairy-free.",
    accessibilityNeeds: "",
    budgetCeilingCents: 400000,
    kidAgeRange: "mix_0_5",
    allergyFlags: [seedAllergy],
    napTime: "12:30 PM",
    specialSensitivities: "Arya gets overstimulated in very loud rooms.",
    whatThisYearHasMeant:
      "We barely slept but we'd do it again. Our families came together in ways we didn't expect.",
    discoverModeOverride: null,
    updatedAt: null,
  },
  ceremony: {
    traditions: ["annaprashan"],
    otherTraditionText: "",
    officiant: "yes",
    ritualItemsNotes:
      "Brass thali, rice, payesh, fresh flowers, Arya's ceremony outfit.",
    ceremonyVenueNotes: "Same home — set up in the living room before guests arrive.",
    integration: "same_day_separate",
  },
  funding: "family_helped",
  recStates: {},
  families: [
    {
      id: "fam_1",
      familyName: "Basu (Dida & Dadu)",
      contactEmail: "basus@example.com",
      contactPhone: "",
      group: "family",
      adults: [
        { id: "ad_1", name: "Ruma Basu", dietaryNotes: "Vegetarian" },
        { id: "ad_2", name: "Partha Basu", dietaryNotes: "" },
      ],
      kids: [],
      rsvp: "going",
      accessibilityNotes: "Stair-free entry preferred.",
      rsvpMessage: "Cannot wait to feed Arya her first rice!",
      contributionCents: 100000,
      contributionStatus: "pledged",
    },
    {
      id: "fam_2",
      familyName: "The Mehtas",
      contactEmail: "neha@example.com",
      contactPhone: "",
      group: "family",
      adults: [
        { id: "ad_3", name: "Neha Mehta", dietaryNotes: "" },
        { id: "ad_4", name: "Arjun Mehta", dietaryNotes: "" },
      ],
      kids: [
        {
          id: "kid_1",
          name: "Kabir",
          ageMonths: 38,
          allergyNotes: "Mild peanut sensitivity",
          dietaryNotes: "",
        },
      ],
      rsvp: "going",
      accessibilityNotes: "",
      rsvpMessage: "",
      contributionCents: 0,
      contributionStatus: "none",
    },
    {
      id: "fam_3",
      familyName: "The Lees (Daycare)",
      contactEmail: "lees@example.com",
      contactPhone: "",
      group: "daycare",
      adults: [
        { id: "ad_5", name: "Sarah Lee", dietaryNotes: "" },
      ],
      kids: [
        {
          id: "kid_2",
          name: "Mia",
          ageMonths: 14,
          allergyNotes: "",
          dietaryNotes: "",
        },
      ],
      rsvp: "maybe",
      accessibilityNotes: "",
      rsvpMessage: "",
      contributionCents: 0,
      contributionStatus: "none",
    },
  ],
  itinerary: [
    {
      id: "it_setup",
      dayNumber: 1,
      phase: "setup",
      startTime: "08:30",
      durationMinutes: 90,
      activityName: "Setup & ceremony prep",
      description: "Arrange thali, set living room for ceremony, pandit arrives.",
      blockType: "host_only",
      kidSafetyNote: "",
      sortOrder: 0,
      sourceRecId: null,
    },
    {
      id: "it_ceremony",
      dayNumber: 1,
      phase: "ceremony",
      startTime: "10:00",
      durationMinutes: 45,
      activityName: "Annaprashan — first rice ceremony",
      description:
        "Rice feeding, prayers, blessings from elders. Photographer set up for arrival.",
      blockType: "ceremony",
      kidSafetyNote: "",
      sortOrder: 1,
      sourceRecId: null,
    },
    {
      id: "it_prasad",
      dayNumber: 1,
      phase: "ceremony",
      startTime: "10:45",
      durationMinutes: 30,
      activityName: "Prasad + family photo",
      description: "Blessings from elders, portraits in ceremony outfit.",
      blockType: "standard",
      kidSafetyNote: "",
      sortOrder: 2,
      sourceRecId: null,
    },
    {
      id: "it_outfit",
      dayNumber: 1,
      phase: "transition",
      startTime: "11:15",
      durationMinutes: 20,
      activityName: "Outfit change + party setup",
      description: "Arya into party outfit, guests shift to party space.",
      blockType: "standard",
      kidSafetyNote: "",
      sortOrder: 3,
      sourceRecId: null,
    },
    {
      id: "it_party_arrive",
      dayNumber: 1,
      phase: "party",
      startTime: "11:30",
      durationMinutes: 30,
      activityName: "Guests arrive & free play",
      description: "Background music, kids explore, adults mingle.",
      blockType: "standard",
      kidSafetyNote: "",
      sortOrder: 4,
      sourceRecId: null,
    },
    {
      id: "it_sensory",
      dayNumber: 1,
      phase: "party",
      startTime: "12:00",
      durationMinutes: 30,
      activityName: "Sensory play stations",
      description: "Playdough, water table, stacking toys.",
      blockType: "standard",
      kidSafetyNote: "Keep small parts out of reach of under-2s.",
      sortOrder: 5,
      sourceRecId: null,
    },
    {
      id: "it_lunch",
      dayNumber: 1,
      phase: "party",
      startTime: "12:30",
      durationMinutes: 40,
      activityName: "Lunch service",
      description: "Kid-safe finger food + adult spread.",
      blockType: "standard",
      kidSafetyNote: "Nut-free zone at kids' table.",
      sortOrder: 6,
      sourceRecId: null,
    },
    {
      id: "it_nap",
      dayNumber: 1,
      phase: "party",
      startTime: "13:10",
      durationMinutes: 20,
      activityName: "Nap window flag",
      description:
        "Arya's usual nap time — consider low-energy activities or a quiet-room option.",
      blockType: "nap_window",
      kidSafetyNote: "",
      sortOrder: 7,
      sourceRecId: null,
    },
    {
      id: "it_smash",
      dayNumber: 1,
      phase: "party",
      startTime: "13:45",
      durationMinutes: 15,
      activityName: "The smash cake",
      description: "Arya vs. cake — photographer ready.",
      blockType: "highlight",
      kidSafetyNote: "",
      sortOrder: 8,
      sourceRecId: null,
    },
  ],
  budget: {
    totalBudgetCents: 400000,
    groupFundGoalCents: 0,
  },
  expenses: [
    {
      id: "e_cake",
      category: "cake",
      vendor: "Ovenly Bakery",
      amountCents: 12500,
      date: "2026-09-20",
      paidBy: "Parents",
      notes: "Main cake + allergen-free smash cake",
      source: "manual",
    },
    {
      id: "e_catering",
      category: "catering",
      vendor: "Home chef — kid + adult spread",
      amountCents: 95000,
      date: "2026-10-05",
      paidBy: "Parents",
      notes: "Parallel spread for 40 guests",
      source: "manual",
    },
    {
      id: "e_decor",
      category: "decorations",
      vendor: "Pastel balloon arch + florals",
      amountCents: 22000,
      date: "2026-09-28",
      paidBy: "Family (Dida)",
      notes: "Gift from Arya's grandmother",
      source: "manual",
    },
  ],
  contributions: [
    {
      id: "cont_1",
      contributorName: "Ruma & Partha Basu",
      relationship: "Grandparents",
      amountCents: 100000,
      date: "2026-09-15",
      method: "Zelle",
      status: "received",
      notes: "Covering the catering + cake.",
    },
  ],
  memories: [],
  shotList: [
    {
      id: "sl_1",
      label: "Annaprashan — first bite of rice",
      captured: false,
      note: "Position photographer slightly left of pandit.",
    },
    {
      id: "sl_2",
      label: "Arya with each grandparent",
      captured: false,
      note: "",
    },
    {
      id: "sl_3",
      label: "Full family portrait (ceremony outfit)",
      captured: false,
      note: "",
    },
    {
      id: "sl_4",
      label: "Cake smash — multiple angles",
      captured: false,
      note: "Backdrop + floor cover; fire the burst mode.",
    },
    {
      id: "sl_5",
      label: "Detail shots — cake, thali, decor",
      captured: false,
      note: "",
    },
    {
      id: "sl_6",
      label: "Candid — Arya playing with Kabir & Mia",
      captured: false,
      note: "",
    },
  ],
  album: {
    isPublic: false,
    allowGuestUploads: true,
    thankYouMessage: "",
    coverMemoryId: null,
  },
  reflections: {
    surprisedBy: "",
    favoriteThing: "",
    wantToRemember: "",
    messageToBaby: "",
  },
  documents: [
    {
      id: "d_pandit",
      label: "Pandit confirmation — Annaprashan",
      url: "",
      category: "ceremony_notes",
      addedAt: "2026-09-02T10:00:00Z",
      notes: "Arrival 9:30 AM.",
    },
  ],
};

// ── Helpers ────────────────────────────────────────────────────────────────

export function createAllergyFlag(allergen: string, severity: AllergyFlag["severity"]): AllergyFlag {
  return { id: uid("al"), allergen, severity };
}
