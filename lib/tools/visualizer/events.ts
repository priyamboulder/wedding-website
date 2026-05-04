// ──────────────────────────────────────────────────────────────────────────
// Wedding event catalog.
//
// Single source of truth for what each event "is" — duration, default time
// of day, vendor setup buffer, and cultural variants (Punjabi calls Sangeet
// "Jaggo", Muslim weddings have Nikah instead of Hindu ceremony, etc).
//
// The scheduler reads this catalog to place events into a multi-day grid.
// ──────────────────────────────────────────────────────────────────────────

import type {
  EventSlug,
  WeddingEvent,
  WeddingStyle,
} from "@/types/visualizer";

export const EVENT_CATALOG: Record<EventSlug, WeddingEvent> = {
  welcome_dinner: {
    slug: "welcome_dinner",
    name: "Welcome Dinner",
    category: "pre_wedding",
    defaultDuration: 3,
    defaultTimeOfDay: "evening",
    setupBuffer: 2,
    typicalGuestSubset: "close_family",
    icon: "🍽",
    description:
      "An intimate kickoff for out-of-town family. Plan for a relaxed seated dinner — toasts, introductions, low-key. The night before everything explodes into mehndi, sangeet, and chaos.",
    logisticsNote:
      "Keep it 2-3 hours. Out-of-towners arriving late should still catch the back half.",
    sequencePriority: 10,
    culturalVariants: [
      {
        style: "muslim",
        notes:
          "Often combined with the Manjha or a small Mangni dinner depending on family tradition.",
      },
    ],
  },
  pooja: {
    slug: "pooja",
    name: "Ganesh Puja",
    category: "pre_wedding",
    defaultDuration: 1.5,
    defaultTimeOfDay: "morning",
    setupBuffer: 1.5,
    typicalGuestSubset: "close_family",
    icon: "🪔",
    description:
      "The blessing that begins the entire celebration. A small home-style puja — usually invoking Ganesh — to ask that things go smoothly. Close family only.",
    logisticsNote:
      "Book the pandit at least 2 months ahead. Coordinate prasad and flowers with mehndi if same day.",
    sequencePriority: 20,
    culturalVariants: [
      { style: "sikh", nameVariant: "Ardas / Akhand Path", notes: "Sikh families typically do an Ardas at the Gurdwara." },
      { style: "muslim", nameVariant: "Milad / Dua", notes: "A Milad-un-Nabi or family dua replaces the pooja." },
      { style: "modern", notes: "Often skipped or replaced with a non-religious blessing moment." },
    ],
  },
  mehndi: {
    slug: "mehndi",
    name: "Mehndi",
    category: "pre_wedding",
    defaultDuration: 4,
    defaultTimeOfDay: "afternoon",
    setupBuffer: 3,
    typicalGuestSubset: "wedding_party",
    icon: "🌿",
    description:
      "The bride's mehndi alone takes 4-6 hours. Guests get smaller designs in parallel. Think long lunch, music, gossip, low chairs and floor seating. The vibe is afternoon-into-evening.",
    logisticsNote:
      "Book mehndi artists 3-4 months out. Bride's mehndi alone takes 4-6 hours — start her first.",
    sequencePriority: 30,
    culturalVariants: [
      { style: "muslim", notes: "Sometimes called 'Mayoun' or combined with the Manjha; bride wears yellow." },
    ],
  },
  haldi: {
    slug: "haldi",
    name: "Haldi",
    category: "pre_wedding",
    defaultDuration: 2,
    defaultTimeOfDay: "morning",
    setupBuffer: 1.5,
    typicalGuestSubset: "close_family",
    icon: "💛",
    description:
      "Turmeric paste, smeared by every relative who has an opinion. Held outdoors when possible — the stains are part of the deal. Close family only, casual yellow outfits, expect a mess.",
    logisticsNote:
      "No formal meal — light breakfast or snacks only. Cover floors with tarp; turmeric doesn't come out.",
    sequencePriority: 35,
    culturalVariants: [
      { style: "muslim", nameVariant: "Manjha / Ubtan", notes: "Same idea, different name. Bride wears yellow." },
      { style: "hindu_south", notes: "Often paired with Nalangu, a playful pre-ceremony ritual." },
    ],
  },
  maiyan: {
    slug: "maiyan",
    name: "Maiyan",
    category: "pre_wedding",
    defaultDuration: 1.5,
    defaultTimeOfDay: "morning",
    setupBuffer: 1,
    typicalGuestSubset: "close_family",
    icon: "✨",
    description:
      "A Punjabi pre-wedding blessing — vatna (a turmeric-based paste) is applied by close family. Smaller than haldi, more ritual-focused, women-led.",
    logisticsNote:
      "Schedule before Chooda if both are happening. Keep to immediate family.",
    sequencePriority: 32,
    culturalVariants: [],
  },
  chooda: {
    slug: "chooda",
    name: "Chooda Ceremony",
    category: "pre_wedding",
    defaultDuration: 1,
    defaultTimeOfDay: "morning",
    setupBuffer: 1,
    typicalGuestSubset: "close_family",
    icon: "🔴",
    description:
      "The maternal uncle places red and white bangles on the bride's wrists. Followed by Kalire — ornaments tied to the chooda that the bride later shakes over unmarried friends.",
    logisticsNote:
      "Mama (maternal uncle) must be present. Plan the morning of the ceremony.",
    sequencePriority: 33,
    culturalVariants: [],
  },
  sangeet: {
    slug: "sangeet",
    name: "Sangeet",
    category: "pre_wedding",
    defaultDuration: 4,
    defaultTimeOfDay: "evening",
    setupBuffer: 4,
    typicalGuestSubset: "full_guest_list",
    icon: "🎶",
    description:
      "The music and dance night — families prepare choreographed performances. Plan for 3-4 hours including dinner. Someone will always want one more dance.",
    logisticsNote:
      "If both families are performing, budget 3+ hours minimum. Hire a DJ AND a sound tech — choreo tracks need cueing.",
    sequencePriority: 50,
    culturalVariants: [
      {
        style: "hindu_north",
        nameVariant: "Sangeet / Jaggo",
        notes: "Punjabi families often combine with a Jaggo — late-night procession with copper pots on heads.",
      },
      { style: "hindu_south", notes: "Less central than in North Indian weddings; sometimes combined with reception." },
      { style: "muslim", nameVariant: "Mehndi / Sangeet", notes: "Combined with mehndi night in many Muslim weddings." },
    ],
  },
  ceremony: {
    slug: "ceremony",
    name: "Wedding Ceremony",
    category: "wedding_day",
    defaultDuration: 2.5,
    defaultTimeOfDay: "morning",
    setupBuffer: 4,
    typicalGuestSubset: "full_guest_list",
    icon: "💍",
    description:
      "The main event. Hindu ceremonies follow muhurat timing; Sikh Anand Karaj happens at the Gurdwara; Muslim Nikah is officiated after Zuhr; modern/fusion tend evening. Includes baraat, varmala, pheras (or equivalent), kanyadaan, vidaai prep.",
    logisticsNote:
      "Baraat typically needs 45 min before ceremony start. Confirm muhurat with your priest 2 weeks out.",
    sequencePriority: 70,
    culturalVariants: [
      { style: "hindu_north", timeOverride: "morning", notes: "Muhurat-based. Most fall 9-11 AM." },
      { style: "hindu_south", timeOverride: "morning", durationOverride: 3, notes: "Earlier and longer — typically 8-10 AM. Multiple ritual stages." },
      { style: "sikh", nameVariant: "Anand Karaj", timeOverride: "morning", durationOverride: 2, notes: "Held at the Gurdwara, typically 9-11 AM. Followed by langar." },
      { style: "muslim", nameVariant: "Nikah", timeOverride: "afternoon", durationOverride: 1.5, notes: "Held after Zuhr prayer, typically 1-3 PM." },
      { style: "fusion", timeOverride: "evening", notes: "Modern fusion ceremonies tend to land in the 5-7 PM window." },
      { style: "modern", timeOverride: "evening", notes: "Most non-traditional ceremonies are evening." },
    ],
  },
  cocktail: {
    slug: "cocktail",
    name: "Cocktail Hour",
    category: "wedding_day",
    defaultDuration: 1.5,
    defaultTimeOfDay: "evening",
    setupBuffer: 2,
    typicalGuestSubset: "full_guest_list",
    icon: "🥂",
    description:
      "The breath between ceremony and reception. Passed apps, signature drinks, a chance for guests to mingle while the wedding party finishes photos.",
    logisticsNote:
      "1 to 1.5 hours is the sweet spot. Longer and guests get restless; shorter and the photo gap feels rushed.",
    sequencePriority: 75,
    culturalVariants: [
      { style: "muslim", notes: "Often a non-alcoholic mocktail hour with mezze instead." },
    ],
  },
  reception: {
    slug: "reception",
    name: "Reception",
    category: "wedding_day",
    defaultDuration: 5,
    defaultTimeOfDay: "evening",
    setupBuffer: 4,
    typicalGuestSubset: "full_guest_list",
    icon: "💃",
    description:
      "Most couples do a grand entrance, first dance, toasts, then dinner. Cake cutting is optional — most desi receptions skip it. Open bar (if applicable), DJ until close, an after-party for the survivors.",
    logisticsNote:
      "Plan a 1.5 hr gap after the ceremony for the bride's outfit and jewelry change.",
    sequencePriority: 80,
    culturalVariants: [
      { style: "muslim", nameVariant: "Walima", notes: "The Walima is the groom's family's reception — traditionally the next day." },
    ],
  },
  vidaai: {
    slug: "vidaai",
    name: "Vidaai",
    category: "wedding_day",
    defaultDuration: 0.5,
    defaultTimeOfDay: "evening",
    setupBuffer: 0.5,
    typicalGuestSubset: "close_family",
    icon: "🌹",
    description:
      "The bride's farewell to her parents' home. Traditionally emotional, brief, ritual — rice thrown over the shoulder, the car drives away. In modern weddings often staged separately as a photo moment.",
    logisticsNote:
      "Plan tissues, plan the car. Photographer should be locked in for this.",
    sequencePriority: 85,
    culturalVariants: [
      { style: "muslim", nameVariant: "Rukhsati", notes: "Same emotional weight, different ritual." },
    ],
  },
  farewell_brunch: {
    slug: "farewell_brunch",
    name: "Farewell Brunch",
    category: "post_wedding",
    defaultDuration: 2.5,
    defaultTimeOfDay: "morning",
    setupBuffer: 1.5,
    typicalGuestSubset: "close_family",
    icon: "☕",
    description:
      "The soft landing. Out-of-towners head to the airport from here. Buffet style, no programming, mimosas optional. Goodbyes drag — budget extra time.",
    logisticsNote:
      "Build in 30 minutes for goodbyes that won't end. Easy menu — no one is functioning.",
    sequencePriority: 100,
    culturalVariants: [],
  },
};

/**
 * Returns the event with cultural variant overrides applied for the given style.
 * Variant lookup falls back to the base event if no variant matches.
 */
export function resolveEvent(
  slug: EventSlug,
  style: WeddingStyle,
): WeddingEvent {
  const base = EVENT_CATALOG[slug];
  const variant = base.culturalVariants.find((v) => v.style === style);
  if (!variant) return base;
  return {
    ...base,
    name: variant.nameVariant ?? base.name,
    defaultDuration: variant.durationOverride ?? base.defaultDuration,
    defaultTimeOfDay: variant.timeOverride ?? base.defaultTimeOfDay,
    logisticsNote: variant.notes
      ? `${base.logisticsNote} — ${variant.notes}`
      : base.logisticsNote,
  };
}

export const ALL_EVENT_SLUGS: EventSlug[] = [
  "welcome_dinner",
  "pooja",
  "mehndi",
  "haldi",
  "maiyan",
  "chooda",
  "sangeet",
  "ceremony",
  "cocktail",
  "reception",
  "vidaai",
  "farewell_brunch",
];

export const DEFAULT_EVENTS: EventSlug[] = [
  "mehndi",
  "sangeet",
  "ceremony",
  "reception",
];
