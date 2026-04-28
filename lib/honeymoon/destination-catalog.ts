// ── Honeymoon destination catalog ──────────────────────────────────────────
// Curated trip concepts — not just destinations, but complete trip ideas
// (some multi-stop). Each entry carries the data the inspiration wall
// needs to score it against the couple's vibeProfile (see scoring.ts) and
// render a card. Static content — no real-time flight/hotel data is
// pulled. Expand freely over time.

import type {
  HoneymoonBudgetTier,
  HoneymoonDealbreaker,
  HoneymoonPriorityInterest,
  HoneymoonVibeTile,
} from "@/types/honeymoon";

export type DestinationKind =
  | "beach"
  | "culture"
  | "adventure"
  | "food_wine"
  | "luxury"
  | "multi"
  | "domestic";

export interface ExperienceHighlight {
  emoji: string;
  label: string;
}

// ── Deep-dive content (Phase 3) ────────────────────────────────────────────
// Optional rich content for the click-in experience. Not every concept
// has it yet — the panel degrades gracefully and shows a "full trip guide
// coming soon" when absent. Written in editorial voice per the brief.

export type AccommodationTier = "dream" | "sweet_spot" | "smart" | "minimoon";

export interface AccommodationPick {
  tier: AccommodationTier;
  name: string;
  location: string;
  nightlyRange: string;
  roomRec: string;
  included: string;
  honeymoonPerks: string;
  vibe: string;
  honestTake: string;
  bookingNote: string;
}

export type DiningCategory =
  | "big_night"
  | "long_lunch"
  | "local_find"
  | "breakfast"
  | "sunset_dinner"
  | "casual"
  | "splurge"
  | "street_food";

export interface DiningPick {
  category: DiningCategory;
  name: string;
  location: string;
  cuisine: string;
  priceRange: string;
  setting: string;
  reservation: string;
  bestTable: string;
  dressCode?: string;
  insiderTip: string;
}

export type ExperienceCategory =
  | "romance"
  | "adventure"
  | "culture"
  | "nature"
  | "food_drink"
  | "unique"
  | "skip";

export interface ExperiencePick {
  category: ExperienceCategory;
  name: string;
  costEstimate: string;
  timeCommitment: string;
  intensity: "low" | "medium" | "high";
  bestTime: string;
  weatherDependent: boolean;
  bookAhead: string;
  blurb: string;
  theOne?: boolean;
}

export interface DayNarrative {
  range: string;
  title: string;
  body: string;
}

export interface MoneyMath {
  flights: [number, number];
  accommodation: [number, number];
  food: [number, number];
  activities: [number, number];
  transport: [number, number];
  misc: [number, number];
  saveSplurge: string;
}

export interface LogisticsBlock {
  gettingThere: string;
  gettingAround: string;
  documents: string;
  health: string;
  money: string;
  connectivity: string;
  language: string;
  honeymoonTips: string;
}

export interface BookingTimelineBlock {
  when: string;
  items: string[];
}

export interface DeepDive {
  openingNarrative: string;
  days: DayNarrative[];
  accommodations: AccommodationPick[];
  dining: DiningPick[];
  experiences: ExperiencePick[];
  moneyMath: MoneyMath;
  logistics: LogisticsBlock;
  bookingTimeline: BookingTimelineBlock[];
}

export interface DestinationConcept {
  id: string;
  title: string;
  // One-line hook shown under the title on the card.
  tagline: string;
  // Slightly longer narrative hook for the card body / deep-dive intro.
  hook: string;
  heroImage: string;
  // Stops in order — "Santorini, Crete" or just ["Maldives"].
  stops: string[];
  regions: string[];
  kind: DestinationKind;
  // Inclusive day range that suits the trip.
  recommendedDurationDays: [number, number];
  // 1 = Jan … 12 = Dec. `best` = peak conditions. `shoulder` = still good,
  // cheaper/quieter. `avoid` = monsoon, hurricane, extreme heat/cold, or
  // resort-shutdown season.
  bestMonths: number[];
  shoulderMonths: number[];
  avoidMonths: number[];
  // Couple-total estimate — flights + stay + food + activities.
  couplesBudgetUsd: [number, number];
  // Primary vibes this concept satisfies.
  vibeMatch: HoneymoonVibeTile[];
  // What it delivers on the "what matters most" list.
  priorityTags: HoneymoonPriorityInterest[];
  // Approximate door-to-door flight hours from DFW (the seeded origin
  // profile). Multi-stop = to the first destination.
  flightHoursFromDFW: [number, number];
  requiresPassport: boolean;
  // Dealbreakers this concept triggers — used to filter out matches.
  triggers: HoneymoonDealbreaker[];
  experienceHighlights: ExperienceHighlight[];
  // Called out on the card so couples aren't surprised later.
  yellowFlags: string[];
  // Other concept ids the couple might also like.
  alsoConsider: string[];
  // Unconventional picks get a "wildcard" badge on the card.
  wildcard?: boolean;
  // Rich deep-dive content — optional. Only a handful of concepts have
  // this fleshed out; the panel falls back to a "coming soon" state when
  // absent so cards without it still render safely.
  deepDive?: DeepDive;
}

export const DESTINATION_CONCEPTS: DestinationConcept[] = [
  {
    id: "santorini_crete",
    title: "Santorini & Crete",
    tagline:
      "Volcanic sunsets, hidden beaches, and the best taverna meal of your life.",
    hook:
      "Four nights in Oia for the postcard half of the trip, then a ferry to Crete for wilder coastline, mountain villages, and dinners where no one's rushing you out.",
    heroImage:
      "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=960&q=70",
    stops: ["Santorini", "Crete"],
    regions: ["Greece"],
    kind: "multi",
    recommendedDurationDays: [7, 10],
    bestMonths: [5, 6, 9, 10],
    shoulderMonths: [4, 11],
    avoidMonths: [12, 1, 2, 3],
    couplesBudgetUsd: [8000, 14000],
    vibeMatch: ["wine_dine_romance", "wander_discover", "variety_mix"],
    priorityTags: ["food", "beaches", "culture", "photography"],
    flightHoursFromDFW: [13, 16],
    requiresPassport: true,
    triggers: [],
    experienceHighlights: [
      { emoji: "🌅", label: "Oia sunset" },
      { emoji: "🛥️", label: "Catamaran to hot springs" },
      { emoji: "🍷", label: "Santo Wines tasting" },
      { emoji: "🏛️", label: "Knossos + Chania old town" },
    ],
    yellowFlags: [
      "August is peak — crowds in Oia, premium pricing",
      "Santorini is brutal on rolling luggage — cobblestones and stairs",
    ],
    alsoConsider: ["amalfi_coast", "portugal_azores"],
  },
  {
    id: "amalfi_coast",
    title: "The Amalfi Coast by convertible",
    tagline:
      "Lemon groves, cliffside restaurants, and the most beautiful drive on earth.",
    hook:
      "Positano for the postcard days, Ravello to slow down, one last night in Naples for the pizza that'll ruin every other pizza. Let someone else drive — the road is intense.",
    heroImage:
      "https://images.unsplash.com/photo-1534445867742-43195f401b6c?w=960&q=70",
    stops: ["Positano", "Ravello", "Naples"],
    regions: ["Italy"],
    kind: "multi",
    recommendedDurationDays: [7, 10],
    bestMonths: [5, 6, 9],
    shoulderMonths: [4, 10],
    avoidMonths: [11, 12, 1, 2, 3],
    couplesBudgetUsd: [10000, 16000],
    vibeMatch: ["wine_dine_romance", "wander_discover", "full_luxury"],
    priorityTags: ["food", "culture", "photography", "beaches"],
    flightHoursFromDFW: [12, 15],
    requiresPassport: true,
    triggers: [],
    experienceHighlights: [
      { emoji: "⛵", label: "Private boat day to Capri" },
      { emoji: "👨‍🍳", label: "Mamma Agata cooking class" },
      { emoji: "🥂", label: "La Sponda candlelit dinner" },
      { emoji: "🥾", label: "Path of the Gods hike" },
    ],
    yellowFlags: [
      "Peak July–August is crowded and expensive",
      "La Sponda + top tables book 6–8 weeks out",
    ],
    alsoConsider: ["santorini_crete", "portugal_azores"],
    deepDive: {
      openingNarrative:
        "You'll fly into Naples, grab a private transfer down the coast (don't rent a car on Day 1 — you'll be jet-lagged and the roads are intense), and check into Positano for the first four nights. This is your home base for the postcard half of the trip: lemon-scented everything, cliffside dinners, boat days, and the kind of sunsets that make you understand why people have been coming here for centuries. Then you'll move to Ravello for three nights — quieter, more intimate, perched above it all with gardens and views that feel private. Your last night is in Naples itself: raw, chaotic, alive, and home to the best pizza on earth.",
      days: [
        {
          range: "Days 1–4",
          title: "Positano",
          body:
            "Check in mid-afternoon and spend Day 1 doing absolutely nothing: walk down to Spiaggia Grande, rent two chairs, order a Spritz, and let the jet lag melt. You've earned this. Day 2 is a boat day — book a private six-hour skipper through Lucibello, they'll take you to Li Galli, Nerano for lunch (they pull up to a floating restaurant), and the Emerald Grotto. Day 3, hike the Path of the Gods in the morning (start from Bomerano, finish in Nocelle, ~3 hours, the views are staggering), lunch afterward at Da Vincenzo back in Positano, dinner at La Sponda — 400 candles, no electric light, absurdly romantic. Day 4, wander the vertical streets, shop the linen stores, get lemon granita on the steps.",
        },
        {
          range: "Days 5–7",
          title: "Ravello",
          body:
            "Private car up (45 min, €80). Ravello is where you slow down: Villa Cimbrone's gardens at opening, the Duomo, a cooking class at Mamma Agata's (she cooked for Bogart and Astaire — book months ahead). Dinner at Rossellini's for the tasting menu, or Cumpa' Cosimo for the unpretentious local legend meal. One morning, bus down to Amalfi town, wander, and have lunch at Marina Grande on the water.",
        },
        {
          range: "Day 8",
          title: "Naples",
          body:
            "Car to Naples, check into the Santa Lucia waterfront. This city is raw and loud and beautiful. Walk Spaccanapoli, see the Veiled Christ at Cappella Sansevero (it will stop you in your tracks), and eat pizza at Da Michele or Sorbillo — don't overthink it, both are perfect. Dinner at Palazzo Petrucci in Piazza San Domenico Maggiore.",
        },
      ],
      accommodations: [
        {
          tier: "dream",
          name: "Le Sirenuse",
          location: "Positano, town center with sea views",
          nightlyRange: "€1,000–€2,200/night (May–Sep)",
          roomRec:
            "Junior Suite with Sea View — avoid the Classic rooms, the view is the point.",
          included: "Full breakfast on the terrace",
          honeymoonPerks:
            "Complimentary bottle of rosé, suite upgrade at the hotel's discretion when available",
          vibe:
            "The iconic Amalfi hotel — polished, family-run elegance, red walls and majolica tiles.",
          honestTake:
            "It's the flagship and priced like it. Worth it for one trip, but know what you're buying.",
          bookingNote: "Sells out 6+ months ahead for Jun–Sep.",
        },
        {
          tier: "sweet_spot",
          name: "Hotel Buca di Bacco",
          location: "Positano, right on Spiaggia Grande",
          nightlyRange: "€400–€700/night",
          roomRec:
            "Superior Room with Sea View Balcony — the junior suites aren't noticeably nicer.",
          included: "Breakfast, beach club access across the street",
          honeymoonPerks:
            "Mention the honeymoon at booking — champagne on arrival, late checkout when possible",
          vibe:
            "Unbeatable location, cheerful family vibe, not the flashiest but you'll spend all day on the beach.",
          honestTake:
            "Rooms are modest for the price, but you're paying for location. You walk out the door onto the beach.",
          bookingNote: "Book 3–4 months ahead. Request a higher floor.",
        },
        {
          tier: "smart",
          name: "Hotel Parsifal",
          location: "Ravello, converted 13th-century convent",
          nightlyRange: "€220–€380/night",
          roomRec: "Superior room with terrace — the garden rooms lack views.",
          included: "Breakfast on the terrace",
          honeymoonPerks:
            "Small property — tell them; they often move honeymooners to a terrace room",
          vibe:
            "A stone-arched convent with a cliffside terrace restaurant. Quiet, a little formal, deeply romantic.",
          honestTake:
            "Punches far above its price. The view from breakfast is as good as Palazzo Avino's at a third the cost.",
          bookingNote: "Books up 6 weeks out for peak season; easy to get shoulder.",
        },
        {
          tier: "minimoon",
          name: "Hotel Eden Roc",
          location: "Positano, mid-town with balconies",
          nightlyRange: "€280–€450/night",
          roomRec: "Deluxe Room with Sea View",
          included: "Breakfast, included beach club chairs",
          honeymoonPerks: "Complimentary Prosecco on arrival",
          vibe: "Family-run, warm, classic Amalfi palette.",
          honestTake:
            "A great 3–4 night base if you're doing the short version before a bigger trip later.",
          bookingNote: "Flexible on short stays — good for a minimoon.",
        },
      ],
      dining: [
        {
          category: "big_night",
          name: "La Sponda at Le Sirenuse",
          location: "Positano",
          cuisine: "Refined coastal Italian",
          priceRange: "€400–€550 for two with wine",
          setting:
            "400 hand-lit candles, zero electric light, open windows, live piano.",
          reservation: "Book 6–8 weeks ahead, call the hotel directly.",
          bestTable: "Terrace table 7 or 9 — request when reserving.",
          dressCode: "Smart — jacket preferred for men, no shorts.",
          insiderTip:
            "Order the Mediterranean tasting menu with the wine pairing — the sommelier has serious chops.",
        },
        {
          category: "long_lunch",
          name: "Lo Scoglio",
          location: "Nerano, accessible by boat",
          cuisine: "Seafood, with the famous zucchini spaghetti",
          priceRange: "€150–€220 for two",
          setting:
            "A wooden deck over the water. You tie your boat up to the restaurant.",
          reservation: "Open table works, but call if on a summer Saturday.",
          bestTable: "Any terrace table — they're all on the water.",
          insiderTip:
            "Order the spaghetti alla Nerano (zucchini, butter, caciocavallo) — their signature for 60 years.",
        },
        {
          category: "local_find",
          name: "Da Vincenzo",
          location: "Positano, above the main church",
          cuisine: "Unfussy Campanian",
          priceRange: "€110–€150 for two with a carafe",
          setting: "A small family dining room, tables outside on the street.",
          reservation: "Reserve 2 weeks out for dinner.",
          bestTable: "Outside if weather permits — the street is the view.",
          insiderTip:
            "Order the seafood pasta of the day and whatever fish Vincenzo recommends.",
        },
        {
          category: "sunset_dinner",
          name: "Il Tridente at Hotel Poseidon",
          location: "Positano, terrace overlooking the bay",
          cuisine: "Modern Italian",
          priceRange: "€180–€230 for two",
          setting:
            "Cliffside terrace with a panorama over Positano — the golden-hour table.",
          reservation: "Book for 7:30pm to catch the sunset.",
          bestTable: "Edge of the terrace, far left — the corner two-top.",
          insiderTip: "Come 30 min early for a spritz at the bar above.",
        },
        {
          category: "splurge",
          name: "Rossellini's",
          location: "Palazzo Avino, Ravello",
          cuisine: "Neapolitan tasting menu, one Michelin star",
          priceRange: "€500–€700 for two",
          setting: "Formal dining room, tables on the gardens terrace.",
          reservation: "6+ weeks ahead, especially if not a hotel guest.",
          bestTable: "Outdoor terrace table in season; corner banquette otherwise.",
          dressCode: "Jacket required for men.",
          insiderTip:
            "Do the full tasting with wine — the sommelier walks you through Campanian varietals you'd never otherwise try.",
        },
        {
          category: "casual",
          name: "Da Michele",
          location: "Naples, Forcella district",
          cuisine: "Pizza, two kinds only",
          priceRange: "€25 for two",
          setting: "No frills, wood benches, a ticket system.",
          reservation: "No reservations — take a ticket and wait.",
          bestTable: "Doesn't matter.",
          insiderTip:
            "Marinara and Margherita are the only options. Go early (11:30am) or late (2:30pm) to skip the line.",
        },
      ],
      experiences: [
        {
          category: "romance",
          name: "Private boat day with Lucibello",
          costEstimate: "€600–€900 for 6 hours",
          timeCommitment: "Full day",
          intensity: "low",
          bestTime: "Morning — 9am departure beats the heat and afternoon swell",
          weatherDependent: true,
          bookAhead: "2–4 weeks",
          blurb:
            "Private skipper takes you to Li Galli islands, Nerano for lunch, and the Emerald Grotto. The single best day of the trip for most couples.",
          theOne: true,
        },
        {
          category: "adventure",
          name: "Path of the Gods hike",
          costEstimate: "Free (bus up, €2)",
          timeCommitment: "3–4 hours",
          intensity: "medium",
          bestTime: "Start 8am — hot by 11",
          weatherDependent: true,
          bookAhead: "None",
          blurb:
            "The iconic coastal cliffside trail. Start in Bomerano, descend into Nocelle, take a bus or walk the stairs back down to Positano.",
        },
        {
          category: "food_drink",
          name: "Mamma Agata cooking class",
          costEstimate: "€180 per person",
          timeCommitment: "5–6 hours with lunch",
          intensity: "low",
          bestTime: "Morning class",
          weatherDependent: false,
          bookAhead: "6+ weeks",
          blurb:
            "A hands-on class on the family terrace in Ravello. You cook 4 courses and then eat them over wine. Her cookbook is a cult favorite for a reason.",
        },
        {
          category: "culture",
          name: "Villa Cimbrone gardens",
          costEstimate: "€10 per person",
          timeCommitment: "1.5–2 hours",
          intensity: "low",
          bestTime: "Opening (9am) — empty",
          weatherDependent: false,
          bookAhead: "None",
          blurb:
            "The Terrace of Infinity is as good as every photo says. Walk the gardens slowly, have a coffee on the way out.",
        },
        {
          category: "skip",
          name: "The Blue Grotto day trip from Capri",
          costEstimate: "€60–€100",
          timeCommitment: "Half day with transit",
          intensity: "low",
          bestTime: "—",
          weatherDependent: true,
          bookAhead: "None",
          blurb:
            "Long waits, a 5-minute cave visit, and you can often see it better from a private boat anyway. Skip unless you're Capri-obsessed.",
        },
      ],
      moneyMath: {
        flights: [1800, 3200],
        accommodation: [3200, 7000],
        food: [1400, 2600],
        activities: [800, 1800],
        transport: [400, 700],
        misc: [400, 800],
        saveSplurge:
          "Accommodation and the boat day are where the money goes — save on lunches (trattoria beats hotel restaurant every time) and splurge on one La Sponda dinner you'll remember forever.",
      },
      logistics: {
        gettingThere:
          "Fly into Naples (NAP). US connections usually via FCO, LHR, CDG, or AMS. Private transfer to Positano ~90 min / €130.",
        gettingAround:
          "Do NOT rent a car for Positano–Ravello. Use private drivers, buses along SS163, or the SITA bus. The roads are narrow, parking is brutal. A car only makes sense if you're doing inland day trips.",
        documents: "US passport; no visa for stays under 90 days in Schengen.",
        health: "No vaccinations needed. Tap water safe.",
        money: "Euro. Cards accepted everywhere except small trattorias; withdraw €200–€300 for Day 1.",
        connectivity: "Fine everywhere. Grab an eSIM (Airalo, 10GB) for the week; hotel wifi is reliable.",
        language: "English widely spoken in tourist areas. A few words of Italian go a long way in family restaurants.",
        honeymoonTips:
          "Tell the hotel at booking AND at check-in. Amalfi hotels take honeymooners seriously — you'll get small perks. Bring one smart outfit each for the big nights.",
      },
      bookingTimeline: [
        {
          when: "6 months out",
          items: [
            "Flights — prices climb sharply after 4 months for summer",
            "Positano hotel — top properties sell out",
            "Mamma Agata cooking class",
          ],
        },
        {
          when: "6–8 weeks out",
          items: [
            "La Sponda + Rossellini's dinners",
            "Private boat with Lucibello",
            "Ravello hotel",
            "Naples last-night hotel",
          ],
        },
        {
          when: "2 weeks out",
          items: [
            "Other dinner reservations (Da Vincenzo, Il Tridente)",
            "Airport transfer Naples → Positano",
            "Travel insurance",
          ],
        },
        {
          when: "Day of",
          items: ["Beach chairs", "Casual lunches", "Blue Grotto (skip)"],
        },
      ],
    },
  },
  {
    id: "maldives_overwater",
    title: "Maldives — overwater villa week",
    tagline:
      "The quietest honeymoon on earth. Walk straight from bed into the Indian Ocean.",
    hook:
      "Seven nights on one island, a villa on stilts, a reef you can snorkel from your deck, and the most romantic version of doing absolutely nothing.",
    heroImage:
      "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=960&q=70",
    stops: ["Malé + outer atoll"],
    regions: ["Maldives"],
    kind: "luxury",
    recommendedDurationDays: [5, 8],
    bestMonths: [11, 12, 1, 2, 3, 4],
    shoulderMonths: [10, 5],
    avoidMonths: [6, 7, 8, 9],
    couplesBudgetUsd: [16000, 28000],
    vibeMatch: ["full_luxury", "barefoot_unplugged"],
    priorityTags: ["beaches", "privacy", "spa", "unique"],
    flightHoursFromDFW: [20, 24],
    requiresPassport: true,
    triggers: ["long_flights"],
    experienceHighlights: [
      { emoji: "🐠", label: "House reef snorkeling" },
      { emoji: "💆", label: "Overwater spa treatments" },
      { emoji: "🌊", label: "Private sandbank picnic" },
      { emoji: "🍽️", label: "Underwater restaurant" },
    ],
    yellowFlags: [
      "Long-haul with a seaplane transfer — budget a recovery day",
      "May–Sep monsoon brings rough seas and limited snorkeling",
    ],
    alsoConsider: ["bora_bora", "sri_lanka_maldives"],
    deepDive: {
      openingNarrative:
        "You'll fly into Malé through Dubai or Doha, sleep a night at a transit hotel (don't try to do the seaplane transfer jet-lagged), then a 40-minute seaplane flight over turquoise atolls to your resort island. That's it. No rental cars, no logistics, no day trips — just one villa, one reef, one week of reading on your deck, snorkeling with manta rays, and eating the best tuna sashimi of your life on a beach at sunset. The Maldives is the least complicated honeymoon on earth, and that is the entire point.",
      days: [
        {
          range: "Day 1",
          title: "Arrival",
          body:
            "Land at Malé (MLE), clear immigration, and get walked to the resort's lounge. Seaplane transfer takes 40–60 minutes depending on atoll — sit on the left if you can, the view is surreal. Check in, meet your butler, unpack, and spend the rest of the day doing nothing. Sunset cocktail on the deck, early dinner, sleep.",
        },
        {
          range: "Days 2–6",
          title: "Your villa, your reef",
          body:
            "There is no right or wrong way to do this. A workable rhythm: coffee at sunrise on the deck, snorkel from the villa before the sun gets too high, breakfast, read, swim, nap, sunset paddleboard, dinner. Build in one manta-ray or whale-shark trip through the dive center (Hanifaru Bay in Baa atoll is world-class May–Nov — book on arrival). One couples spa morning. One sandbank picnic where the resort drops you at a tiny bar of sand with champagne and comes back in 2 hours. Otherwise, let the days blur.",
        },
        {
          range: "Day 7",
          title: "Last day",
          body:
            "The seaplane window back to Malé is tight — don't book anything after 11 AM. Late breakfast, pack slowly, lounge by the pool until it's time. Fly home stunned.",
        },
      ],
      accommodations: [
        {
          tier: "dream",
          name: "Soneva Jani",
          location: "Noonu Atoll, 40-min seaplane from Malé",
          nightlyRange: "$3,200–$6,500/night",
          roomRec: "One-Bedroom Water Reserve with Slide — the retractable roof for stargazing from bed is not a gimmick.",
          included: "All meals + drinks (select categories), daily sunset cruise, cinema under the stars",
          honeymoonPerks: "Bed decoration on arrival, couples Sothys spa treatment, private beach dinner option",
          vibe: "Barefoot luxury at the top of the market — pristine, playful (slide off your deck into the lagoon), and quietly eco-led.",
          honestTake: "The standard against which every Maldives resort is measured. Worth it once; you won't regret the spend.",
          bookingNote: "Books 8+ months ahead for Dec–Mar. Holidays close 12 months out.",
        },
        {
          tier: "sweet_spot",
          name: "Joali Maldives",
          location: "Raa Atoll, 40-min seaplane from Malé",
          nightlyRange: "$1,800–$3,400/night",
          roomRec: "Water Villa with Pool — the beach villas are lovely but you came for the overwater experience.",
          included: "Breakfast, non-motorized watersports, bike use",
          honeymoonPerks: "Honeymoon package with sparkling wine, bed art, couples massage",
          vibe: "Art-forward luxury — installations throughout the island, playful design, still distinctly Maldivian.",
          honestTake: "Excellent food, beautiful property, slightly quieter than Soneva. The service is the standout.",
          bookingNote: "4–6 months ahead for peak season.",
        },
        {
          tier: "smart",
          name: "Amari Raaya Maldives",
          location: "Raa Atoll, 50-min seaplane from Malé",
          nightlyRange: "$650–$1,100/night",
          roomRec: "Overwater Villa with Pool — the lagoon view category is worth the upgrade.",
          included: "Breakfast; all-inclusive meal plan available as upgrade",
          honeymoonPerks: "In-room decoration, bottle of sparkling on arrival, couples spa credit",
          vibe: "Newer property (2023), modern design, wide-open lagoon views, approachable luxury rather than ultra-premium.",
          honestTake: "The best value overwater experience in the Maldives right now. Food is fine, not transcendent — take the all-inclusive and don't overthink it.",
          bookingNote: "2–3 months ahead.",
        },
        {
          tier: "minimoon",
          name: "Kandima Maldives",
          location: "Dhaalu Atoll, 40-min seaplane from Malé",
          nightlyRange: "$350–$650/night",
          roomRec: "Sky Studio (overwater) — cheapest overwater category on the island.",
          included: "Breakfast; multiple meal plans",
          honeymoonPerks: "Welcome drink and fruit basket",
          vibe: "A bigger resort with a lot of activities — more social than the quiet five-stars. Works for couples who want options.",
          honestTake: "Budget-friendly entry point. It's less intimate than a small boutique resort, but the price gap is huge.",
          bookingNote: "6 weeks out works even peak season.",
        },
      ],
      dining: [
        {
          category: "big_night",
          name: "So Starstruck (Soneva Jani)",
          location: "Over the water, resort",
          cuisine: "Tasting menu under the stars",
          priceRange: "$400–$600 for two",
          setting: "Overwater pavilion, telescope on site, astronomer joins between courses.",
          reservation: "Book on arrival — resorts release restaurants day-by-day.",
          bestTable: "Main platform, lagoon side.",
          insiderTip: "Request the pairing with the Japanese whisky flight — it's not on the printed menu.",
        },
        {
          category: "long_lunch",
          name: "Sandbank picnic",
          location: "Private sandbank, resort-arranged",
          cuisine: "Grilled fish, champagne, tropical fruit",
          priceRange: "$500–$900 per couple (2 hours, dropped and retrieved)",
          setting: "Literally just a patch of white sand 200m across, nobody else in sight.",
          reservation: "Book 48 hours ahead through your butler.",
          bestTable: "There are no tables. That's the point.",
          insiderTip: "Go at 10 AM not noon — less heat, and you get the best light for the photos you'll frame forever.",
        },
        {
          category: "sunset_dinner",
          name: "Overwater dinner at your villa",
          location: "Your deck",
          cuisine: "Your choice, delivered by butler",
          priceRange: "Included if AI; $250–$400 per couple otherwise",
          setting: "Your own deck, candles on the rail, the ocean at your feet.",
          reservation: "Order 4 hours ahead via the butler app.",
          bestTable: "The dining table on the deck.",
          insiderTip: "Order the whole reef fish grilled over coconut husk — most resorts will do it whole if you ask.",
        },
        {
          category: "casual",
          name: "The island's beach-club lunch spot",
          location: "Whichever restaurant is on the sunset beach",
          cuisine: "Pan-Asian, Mediterranean, whatever the island has",
          priceRange: "$120–$200 per couple",
          setting: "Toes in the sand, lunch between swims.",
          reservation: "Open seating in most cases.",
          bestTable: "Front-row tables on the sand.",
          insiderTip: "Most resorts have a daily catch list — go with that, not the imported beef.",
        },
        {
          category: "splurge",
          name: "Underwater or wine-cellar tasting (if offered)",
          location: "Varies — Subsix at Niyama, 5.8 Undersea at Hurawalhi",
          cuisine: "Tasting menu with wine pairing",
          priceRange: "$600–$900 per couple",
          setting: "Restaurant 6m below the ocean surface, fish circling the glass.",
          reservation: "Check availability on arrival; most resorts limit to hotel guests.",
          bestTable: "Wherever they seat you — the room is small.",
          dressCode: "Resort elegant — they'll tell you at booking.",
          insiderTip: "This is the splurge memory. Worth the money even if the food isn't quite transcendent.",
        },
      ],
      experiences: [
        {
          category: "nature",
          name: "Manta ray or whale shark trip (Hanifaru Bay)",
          costEstimate: "$200 per person",
          timeCommitment: "Half day",
          intensity: "medium",
          bestTime: "May–November, early morning",
          weatherDependent: true,
          bookAhead: "On arrival — slots limited",
          blurb: "Hanifaru Bay in Baa Atoll is UNESCO-protected and one of the densest manta aggregations on earth. Snorkel only, no fins disturbance — and that's the right call.",
          theOne: true,
        },
        {
          category: "romance",
          name: "Private sandbank picnic",
          costEstimate: "$500–$900 per couple",
          timeCommitment: "2–3 hours",
          intensity: "low",
          bestTime: "10 AM drop-off",
          weatherDependent: true,
          bookAhead: "48 hours",
          blurb: "Your resort drops you on a sand bar with champagne and leaves. The photos will anchor your album.",
        },
        {
          category: "romance",
          name: "Couples spa treatment",
          costEstimate: "$400–$700 per couple (90 min)",
          timeCommitment: "2 hours including lounge time",
          intensity: "low",
          bestTime: "Late afternoon before dinner",
          weatherDependent: false,
          bookAhead: "2 days",
          blurb: "Overwater spa pavilions with glass floors. One morning or afternoon during the week — it's the reset you didn't know you needed.",
        },
        {
          category: "adventure",
          name: "House reef snorkel + house reef dive",
          costEstimate: "Snorkel free; dive ~$120 per person",
          timeCommitment: "1–3 hours",
          intensity: "low",
          bestTime: "Early morning or late afternoon — better visibility and wildlife",
          weatherDependent: true,
          bookAhead: "Walk-in",
          blurb: "Most resort house reefs are vibrant with reef sharks, eagle rays, and turtles. Ask the dive center for an orientation swim on Day 1.",
        },
        {
          category: "unique",
          name: "Dolphin cruise at sunset",
          costEstimate: "$150 per couple",
          timeCommitment: "90 minutes",
          intensity: "low",
          bestTime: "5:30 PM departure",
          weatherDependent: true,
          bookAhead: "1 day",
          blurb: "Pods of 20–100 dolphins routinely surf the bow wake. Sparkling wine on the deck, the sunset over the atoll, and dozens of dolphins to yourselves.",
        },
        {
          category: "skip",
          name: "Malé city tour",
          costEstimate: "$80 per person",
          timeCommitment: "Half day",
          intensity: "low",
          bestTime: "—",
          weatherDependent: false,
          bookAhead: "Walk-in",
          blurb: "Malé is dense, hot, and not scenic. You flew halfway around the world to sit on a reef — stay on the reef.",
        },
      ],
      moneyMath: {
        flights: [2400, 4000],
        accommodation: [6000, 18000],
        food: [2000, 4500],
        activities: [1000, 2000],
        transport: [800, 1400],
        misc: [400, 800],
        saveSplurge:
          "Accommodation is 60% of the Maldives equation. Pick one tier below what you think you want — the experience of any overwater villa is transformative; the incremental luxury above $3k/night is a curve of diminishing returns. Splurge on the sandbank picnic and the manta trip; skip the à la carte menu and take full board.",
      },
      logistics: {
        gettingThere:
          "Fly Malé (MLE) via Dubai, Doha, or Abu Dhabi. The resort arranges the seaplane transfer (usually $500–$900/pp round trip) — included in some packages.",
        gettingAround:
          "You don't. The resort island is your world for the week. Bikes between villas on larger islands; otherwise walk.",
        documents: "US passport with 6+ months validity. No visa — 30-day stamp on arrival.",
        health:
          "No mandatory vaccinations. Motion-sickness meds for the seaplane/speedboat if prone. Reef-safe sunscreen is required at most resorts.",
        money:
          "USD accepted everywhere; resort bills are in USD. Tipping is welcomed, not mandatory — $10–$20/day for butler + 10% for spa/dive is standard.",
        connectivity:
          "Villa wifi is strong at five-stars, patchy at mid-tier. Grab a Dhiraagu eSIM ($30, 20GB) if you need reliability — cell service works across most atolls.",
        language: "Dhivehi is the local language; English universal at resorts.",
        honeymoonTips:
          "Tell the resort at booking — Maldives resorts famously take honeymooners seriously. You'll get bed art, a bottle of sparkling, often a private dinner setup. Day 1 is for decompressing, not activities.",
      },
      bookingTimeline: [
        {
          when: "8+ months out",
          items: [
            "Flights (award seats go first)",
            "Resort — top properties sell out",
            "Transit hotel in Malé (airport hotel recommended)",
          ],
        },
        {
          when: "2–3 months out",
          items: [
            "Seaplane transfer (if separate from resort)",
            "Travel insurance",
            "Confirm meal plan (FB vs AI)",
          ],
        },
        {
          when: "2 weeks out",
          items: [
            "Manta/whale-shark trip window (research season reports)",
            "Couples spa treatment booking preference",
          ],
        },
        {
          when: "Day of",
          items: ["Restaurant reservations", "Sandbank picnic", "Dive/snorkel orientation"],
        },
      ],
    },
  },
  {
    id: "bali_multi",
    title: "Bali — Ubud, Uluwatu, the Gili Islands",
    tagline:
      "Rice terraces, temple sunrises, and the easiest luxury dollar you'll ever spend.",
    hook:
      "Four nights in Ubud for the jungle-and-yoga half, three in Uluwatu for clifftop cocktails, optional boat to the Gilis if you want a true off-grid finish.",
    heroImage:
      "https://images.unsplash.com/photo-1518544801976-3e188ea7ae5f?w=960&q=70",
    stops: ["Ubud", "Uluwatu", "Gili Trawangan"],
    regions: ["Indonesia"],
    kind: "multi",
    recommendedDurationDays: [9, 14],
    bestMonths: [5, 6, 7, 8, 9],
    shoulderMonths: [4, 10],
    avoidMonths: [12, 1, 2],
    couplesBudgetUsd: [4000, 9000],
    vibeMatch: ["adventure_for_two", "variety_mix", "barefoot_unplugged"],
    priorityTags: ["adventure", "culture", "beaches", "food", "spa"],
    flightHoursFromDFW: [22, 26],
    requiresPassport: true,
    triggers: ["long_flights"],
    experienceHighlights: [
      { emoji: "🌾", label: "Tegallalang rice terraces" },
      { emoji: "🛕", label: "Uluwatu temple sunset" },
      { emoji: "🧘", label: "Ubud yoga + spa" },
      { emoji: "🐢", label: "Gili snorkeling with turtles" },
    ],
    yellowFlags: [
      "Flight from US is brutal — plan a recovery day",
      "Wet season Dec–Feb — rain most afternoons",
    ],
    alsoConsider: ["sri_lanka_maldives", "costa_rica_pacific"],
  },
  {
    id: "tokyo_kyoto",
    title: "Tokyo + Kyoto + a beach finish",
    tagline:
      "Neon nights, cedar shrines, and a quiet island week to decompress.",
    hook:
      "Four days in Tokyo for the food and energy, four in Kyoto for temples and tea, then a flight to Okinawa or Ishigaki to collapse on a beach. Best with cherry blossoms or fall color.",
    heroImage:
      "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=960&q=70",
    stops: ["Tokyo", "Kyoto", "Okinawa"],
    regions: ["Japan"],
    kind: "multi",
    recommendedDurationDays: [10, 14],
    bestMonths: [3, 4, 10, 11],
    shoulderMonths: [5, 9, 12],
    avoidMonths: [6, 7],
    couplesBudgetUsd: [9000, 15000],
    vibeMatch: ["wander_discover", "variety_mix", "wine_dine_romance"],
    priorityTags: ["food", "culture", "unique", "photography", "beaches"],
    flightHoursFromDFW: [13, 15],
    requiresPassport: true,
    triggers: [],
    experienceHighlights: [
      { emoji: "🍣", label: "Omakase at a hidden counter" },
      { emoji: "🌸", label: "Philosopher's Path at dawn" },
      { emoji: "⛩️", label: "Fushimi Inari solo climb" },
      { emoji: "🏖️", label: "Okinawa beach decompress" },
    ],
    yellowFlags: [
      "Cherry-blossom weeks book out 6 months ahead",
      "Tsuyu rainy season in June is grim",
    ],
    alsoConsider: ["bali_multi", "portugal_azores"],
    deepDive: {
      openingNarrative:
        "Four nights in Tokyo — a city that rewards curiosity more than itineraries — then a 2-hour bullet train to Kyoto for the shrines and tea rooms, then a short domestic flight down to Okinawa or Ishigaki to unwind on a beach you'll have mostly to yourselves. The emotional shape of this trip is a wave: the front half is sensory overload (food, neon, crowds, shrines), the back half is stillness. It works because the first part earns the second.",
      days: [
        {
          range: "Days 1–4",
          title: "Tokyo",
          body:
            "Arrive, taxi or Narita Express to the hotel (don't rent a car — nobody drives in Tokyo), light first dinner somewhere near the hotel, sleep through the jet lag. Day 2, walk Asakusa for Senso-ji at 7 AM before the crowds, lunch at a tempura spot near the temple, afternoon in Ueno Park + the National Museum, dinner in Shinjuku's Omoide Yokocho (tiny yakitori stalls under the train tracks). Day 3 is a food day: Tsukiji outer market for breakfast, a Ginza department-store depachika for lunch-to-go, afternoon at teamLab Planets, dinner omakase — splurge here, it's the meal you flew 14 hours for. Day 4, wander Shibuya and Harajuku (Meiji Jingu forest path is the secret), evening Golden Gai for one drink.",
        },
        {
          range: "Days 5–8",
          title: "Kyoto",
          body:
            "Shinkansen from Tokyo Station (reserve Green Car seats, 2h15m). Check into a small ryokan or a boutique hotel in Gion. Day 5, walk the Philosopher's Path in the late afternoon ending at Nanzen-ji, dinner in Pontocho. Day 6, Fushimi Inari before sunrise — start at 5 AM, you'll have the torii gates mostly to yourself, then descend for a proper breakfast. Afternoon at Kinkaku-ji + Ryoan-ji. Day 7 is Arashiyama: bamboo forest at 7 AM (again — go early), lunch at Shoraian over the river, afternoon at the Saga Tofu farm. Day 8 is Nara day trip for the deer at Nara Park and Todai-ji, back by evening.",
        },
        {
          range: "Days 9–12",
          title: "Ishigaki or Okinawa",
          body:
            "Flight from ITM or KIX down to Ishigaki (ISG) — 2 hours, domestic terminal. Check into a beach resort (Club Med Kabira is the easy move; Seven Colors for boutique). Days 10–11 are the reward: Kabira Bay boat tour for the manta rays, snorkel at Yonehara Beach, dinner at a small izakaya in Ishigaki town. Day 12, beach, last sunset, fly home out of ISG → NRT → US.",
        },
      ],
      accommodations: [
        {
          tier: "dream",
          name: "Aman Tokyo",
          location: "Otemachi, Tokyo",
          nightlyRange: "$2,400–$4,000/night",
          roomRec: "Imperial Palace View room — the view from the Aman pool is unreal.",
          included: "Breakfast, spa access",
          honeymoonPerks: "Onsen access, complimentary pressing, often a room upgrade",
          vibe: "Minimalist grandeur on the 33rd floor. The lobby alone is worth visiting for a drink.",
          honestTake: "The most romantic hotel in Tokyo. If you can only splurge on one property all trip, make it this.",
          bookingNote: "Books 6+ months out. Suites go first.",
        },
        {
          tier: "sweet_spot",
          name: "Hotel The Celestine Ginza",
          location: "Ginza, Tokyo",
          nightlyRange: "$380–$650/night",
          roomRec: "Premium Double with view — room quality is unusually good for the price.",
          included: "Breakfast buffet",
          honeymoonPerks: "Welcome card, can arrange private car if requested",
          vibe: "Polished business-class hotel with local design touches. Reliable and well-located.",
          honestTake: "Ginza is the right base for a food-forward Tokyo trip — walking distance to Michelin density.",
          bookingNote: "2 months out.",
        },
        {
          tier: "smart",
          name: "Hoshinoya Kyoto",
          location: "Arashiyama, Kyoto (boat-only access)",
          nightlyRange: "$900–$1,500/night",
          roomRec: "Mountainside Suite — the river-view is beautiful but the mountain rooms are quieter.",
          included: "Breakfast, boat transfer, tea ceremony",
          honeymoonPerks: "In-room sweets, turn-down with origami",
          vibe: "An onsen ryokan you reach only by river boat. The reset of the trip — it's the quiet anchor between Tokyo and Osaka.",
          honestTake: "Pricey but genuinely singular. If you're only doing one ryokan, this is it.",
          bookingNote: "4–6 months ahead.",
        },
        {
          tier: "minimoon",
          name: "Kabira Bay Seaside Villa",
          location: "Ishigaki, Kabira Bay",
          nightlyRange: "$280–$450/night",
          roomRec: "Sea View Villa — all rooms face Kabira Bay.",
          included: "Breakfast",
          honeymoonPerks: "Bottle of Okinawan sparkling on arrival",
          vibe: "Low-key Japanese beach resort vibe. Kabira Bay is one of Japan's best-rated beaches and the property is steps from it.",
          honestTake: "The perfect decompression finish. Don't try to do too much on Ishigaki — the beach is the point.",
          bookingNote: "6 weeks out.",
        },
      ],
      dining: [
        {
          category: "big_night",
          name: "Sushi Yoshitake",
          location: "Ginza, Tokyo (3 Michelin stars)",
          cuisine: "Edomae omakase sushi",
          priceRange: "$900–$1,200 for two",
          setting: "8-seat counter, traditional kimono service, chef greets you personally.",
          reservation: "Via concierge or a reservation service like Pocket Concierge, 2 months ahead.",
          bestTable: "Counter seats in front of Yoshitake-san himself.",
          dressCode: "Smart — no shorts or sandals.",
          insiderTip: "The otsumami (small courses) before the nigiri run are the sleeper highlight.",
        },
        {
          category: "local_find",
          name: "Omoide Yokocho yakitori",
          location: "Shinjuku",
          cuisine: "Charcoal-grilled skewers, draft beer",
          priceRange: "$50–$80 for two",
          setting: "A narrow alley of 6-seat shops, smoke, sizzle, salary-men shoulder to shoulder.",
          reservation: "Walk in — every stall works. Avoid the Instagram-famous ones; pick one with locals.",
          bestTable: "Whatever you can get.",
          insiderTip: "Order hatsu (heart), tsukune (meatball), kawa (skin). Point if you don't know the word.",
        },
        {
          category: "long_lunch",
          name: "Shoraian",
          location: "Arashiyama, Kyoto, over the river",
          cuisine: "Tofu kaiseki",
          priceRange: "$140–$200 for two",
          setting: "A tatami room on stilts over the Oi River. Reserved 1 or 2 hours of quiet.",
          reservation: "3–4 weeks ahead.",
          bestTable: "Window seats over the water.",
          insiderTip: "Lunch is better value than dinner; same kitchen, same river.",
        },
        {
          category: "breakfast",
          name: "Tsukiji Outer Market",
          location: "Tsukiji, Tokyo",
          cuisine: "Sashimi bowls, tamago, grilled scallops",
          priceRange: "$30–$50 for two",
          setting: "A dense food market that starts breakfasting at 6 AM.",
          reservation: "None needed — but go before 9 AM.",
          bestTable: "Stand at the counter at Kaisendon Oedo for the best-value bowl.",
          insiderTip: "Don't fill up on the first stall — you want to try 4 places. Small portions, move on.",
        },
        {
          category: "splurge",
          name: "Kikunoi (Honten)",
          location: "Higashiyama, Kyoto",
          cuisine: "Kaiseki, 3 Michelin stars",
          priceRange: "$700–$1,000 for two",
          setting: "A 100-year-old machiya, private rooms overlooking the garden.",
          reservation: "2 months ahead via concierge.",
          bestTable: "Private room if available — request at booking.",
          dressCode: "Formal — jacket for men.",
          insiderTip: "The sake pairing is as important as the food. Say yes.",
        },
        {
          category: "casual",
          name: "Standing sushi bar near Shimbashi",
          location: "Shimbashi, Tokyo",
          cuisine: "Cheap, fresh sushi",
          priceRange: "$30–$50 for two",
          setting: "Fluorescent light, standing only, 20-minute meal.",
          reservation: "Walk in.",
          bestTable: "Where the locals are.",
          insiderTip: "Order otsumami snacks + 4–5 pieces of whatever's on the board. It's the Japanese equivalent of a great deli counter.",
        },
      ],
      experiences: [
        {
          category: "culture",
          name: "Fushimi Inari at dawn",
          costEstimate: "Free",
          timeCommitment: "2–3 hours",
          intensity: "medium",
          bestTime: "5:30 AM start — empty",
          weatherDependent: false,
          bookAhead: "None",
          blurb: "Walk the full loop up the mountain through 10,000 vermilion torii gates. At 5:30 AM it's just you and the morning fog. Unforgettable.",
          theOne: true,
        },
        {
          category: "culture",
          name: "teamLab Planets (Tokyo)",
          costEstimate: "$40 per person",
          timeCommitment: "2 hours",
          intensity: "low",
          bestTime: "Weekday afternoon",
          weatherDependent: false,
          bookAhead: "2 weeks — tickets are timed and sell out",
          blurb: "Immersive art installations — you walk barefoot through knee-deep water that reflects infinite koi fish. Touristy and incredible both.",
        },
        {
          category: "food_drink",
          name: "Sake brewery tour in Fushimi",
          costEstimate: "$60 per person",
          timeCommitment: "3 hours",
          intensity: "low",
          bestTime: "Late morning",
          weatherDependent: false,
          bookAhead: "2 weeks",
          blurb: "Gekkeikan's Okura Museum + tastings at 3 neighborhood breweries. Fushimi's water is the reason Kyoto-region sake is famous.",
        },
        {
          category: "culture",
          name: "Private tea ceremony in Kyoto",
          costEstimate: "$140 per couple",
          timeCommitment: "90 min",
          intensity: "low",
          bestTime: "Afternoon",
          weatherDependent: false,
          bookAhead: "2 weeks",
          blurb: "A small private ceremony with an actual tea master, often in a real tea house. Camellia (Flower Teahouse) does the gold standard version.",
        },
        {
          category: "nature",
          name: "Ishigaki manta ray snorkel",
          costEstimate: "$120 per person",
          timeCommitment: "Half day",
          intensity: "medium",
          bestTime: "Morning, season Jun–Oct peak",
          weatherDependent: true,
          bookAhead: "1 week",
          blurb: "Kabira Bay is one of the best manta spots in East Asia. Snorkel-only trips available; the dive is better but optional.",
        },
        {
          category: "skip",
          name: "Robot Restaurant (Shinjuku)",
          costEstimate: "$80 per person",
          timeCommitment: "2 hours",
          intensity: "low",
          bestTime: "—",
          weatherDependent: false,
          bookAhead: "None",
          blurb: "Closed-reopened tourist trap. Loud, silly, overpriced. Spend the money on better food instead.",
        },
      ],
      moneyMath: {
        flights: [2000, 3500],
        accommodation: [2800, 6500],
        food: [1800, 3800],
        activities: [600, 1400],
        transport: [400, 700],
        misc: [400, 800],
        saveSplurge:
          "Food is where the money goes in Japan — don't fight it. Splurge on one omakase in Tokyo and one kaiseki in Kyoto; counter-balance with standing-sushi lunches and combini breakfasts. Skip the first-class shinkansen — regular Green Car is already luxurious.",
      },
      logistics: {
        gettingThere:
          "Fly Haneda (HND) or Narita (NRT). HND is closer to central Tokyo. ANA, JAL, United, Delta run direct from major US hubs. ITM/KIX for the Okinawa connection.",
        gettingAround:
          "Tokyo: metro is immaculate and cheap — get a Suica card on arrival. Tokyo → Kyoto: shinkansen, 2h15m, reserve Green Car for the views. Kyoto: walk + bus. Ishigaki: rent a small car at the airport (they drive left).",
        documents: "US passport. No visa for stays under 90 days. Tourist tax is small and automatic.",
        health: "No vaccinations required. Tap water is excellent.",
        money:
          "Japan is more cash-dependent than you'd expect — carry ¥30,000 for small vendors. 7-Eleven ATMs accept US cards. Credit cards fine at hotels, big restaurants.",
        connectivity:
          "Pocket wifi rentals at the airport ($8/day, pick up on arrival) or Ubigi eSIM ($19, 10GB).",
        language:
          "Less English than you'd expect outside major tourist areas. Download Google Translate offline Japanese pack + install DeepL for menus.",
        honeymoonTips:
          "Tell the ryokan at booking — small touches matter (a plated sweets course on arrival, futon rose petals). Bring one or two formal outfit options — Tokyo high-end dining expects it.",
      },
      bookingTimeline: [
        {
          when: "6 months out",
          items: [
            "Flights (especially for cherry-blossom or fall-color windows)",
            "Aman Tokyo / Hoshinoya Kyoto",
            "Top omakase (Yoshitake, Saito, etc.) — via concierge",
            "JR Pass if doing multiple long-distance trains",
          ],
        },
        {
          when: "2 months out",
          items: [
            "Shinkansen reserved seats",
            "Kikunoi + other Kyoto kaiseki",
            "Ishigaki flight (ITM→ISG)",
            "Okinawa accommodation",
          ],
        },
        {
          when: "2 weeks out",
          items: [
            "teamLab Planets timed tickets",
            "Tea ceremony",
            "Manta ray tour",
            "Suica card / pocket wifi pickup",
          ],
        },
        {
          when: "Day of",
          items: [
            "Morning market food stalls",
            "Walking tours",
            "Fushimi Inari at dawn",
          ],
        },
      ],
    },
  },
  {
    id: "costa_rica_pacific",
    title: "Costa Rica — Arenal + Manuel Antonio",
    tagline:
      "Morning surf, afternoon waterfall, evening ceviche. Repeat for a week.",
    hook:
      "Three nights at Arenal for the volcano hikes and hot springs, then over to the Pacific coast for surfing, sloth-spotting, and slow beach dinners.",
    heroImage:
      "https://images.unsplash.com/photo-1518182170546-07661fd94144?w=960&q=70",
    stops: ["La Fortuna", "Manuel Antonio"],
    regions: ["Costa Rica"],
    kind: "adventure",
    recommendedDurationDays: [7, 10],
    bestMonths: [12, 1, 2, 3, 4],
    shoulderMonths: [11, 5],
    avoidMonths: [9, 10],
    couplesBudgetUsd: [4000, 8000],
    vibeMatch: ["adventure_for_two", "variety_mix", "barefoot_unplugged"],
    priorityTags: ["adventure", "wildlife", "beaches", "ease"],
    flightHoursFromDFW: [4, 6],
    requiresPassport: true,
    triggers: [],
    experienceHighlights: [
      { emoji: "🌋", label: "Arenal volcano hike" },
      { emoji: "🦥", label: "Manuel Antonio rainforest" },
      { emoji: "🏄", label: "Surf lesson at Playa Espadilla" },
      { emoji: "♨️", label: "Hot springs at Tabacón" },
    ],
    yellowFlags: [
      "September–October is peak rainy — many trails closed",
      "Arenal → coast drive is 4 hours; budget a slow day",
    ],
    alsoConsider: ["tulum_holbox", "bali_multi"],
    deepDive: {
      openingNarrative:
        "Fly into San José, grab a shuttle up to La Fortuna (3 hours), and spend the first three nights under Arenal volcano — hikes in the morning, hot springs at night. Then drop down to the Pacific coast (another 4-hour drive, but through coffee country so it goes easy), check into Manuel Antonio, and shift into beach-jungle mode for the back half — sloths, surf, ceviche, and long mornings at the pool. The country is small, the logistics are easy, and every single day is on a different postcard.",
      days: [
        {
          range: "Days 1–3",
          title: "La Fortuna / Arenal",
          body:
            "Arrive early afternoon and settle in at the hot springs. Day 2, hike the Arenal 1968 trail (lava fields, 3 hours) with optional lunch at Benedictus Steakhouse — quietly one of the best meals in the country. Afternoon at Tabacón hot springs as the jungle lights up. Day 3, a La Fortuna waterfall morning, then a chocolate + coffee tour on a working farm (genuinely great, not a tourist trap). Dinner at Don Rufino — book ahead.",
        },
        {
          range: "Days 4–7",
          title: "Manuel Antonio",
          body:
            "Shared shuttle or private transfer (4 hours, $100–$250 for two). Check into a hillside resort — you want a unit with a plunge pool. Day 4 is the Manuel Antonio park visit (get there at opening, 7am, you'll see more wildlife than anyone who shows up at 10). Day 5, a surf lesson at Playa Espadilla Sur. Day 6, a half-day catamaran with snorkeling and sunset. Day 7 is your unplanned day — go back to the park, or don't. Dinner at Ronny's Place on the cliff, then El Avión for drinks.",
        },
      ],
      accommodations: [
        {
          tier: "dream",
          name: "Nayara Tented Camp",
          location: "Arenal, private reserve with volcano views",
          nightlyRange: "$1,100–$1,600/night",
          roomRec: "Tent with private plunge pool and volcano view — nothing else at the property compares.",
          included: "Full breakfast, three-course dinner, non-alcoholic drinks, all activities",
          honeymoonPerks: "Couples spa credit at booking, champagne on arrival, often a room upgrade on arrival",
          vibe: "Five-star glamping on an active volcano — sloths in the trees, hot springs below, absolute luxury.",
          honestTake: "Expensive but it's the single most memorable stay in Costa Rica. If you splurge anywhere, splurge here.",
          bookingNote: "Sells out 6+ months ahead for Dec–Apr. The tents with plunge pools go first.",
        },
        {
          tier: "sweet_spot",
          name: "Arenal Observatory Lodge",
          location: "Arenal, inside the national park",
          nightlyRange: "$280–$420/night",
          roomRec: "Smithsonian Room — the closest to the volcano, far from main building noise.",
          included: "Breakfast, access to trails and observation deck",
          honeymoonPerks: "Mention at booking — they'll often upgrade view",
          vibe: "A biological station that happens to take guests. Volcano views are unreal, property is functional rather than luxe.",
          honestTake: "No frills. Food is fine, not great. The reason to stay is the view and the trails at your doorstep.",
          bookingNote: "Books 2–3 months ahead for peak season.",
        },
        {
          tier: "smart",
          name: "Tulemar Resort",
          location: "Manuel Antonio, private beach and hillside",
          nightlyRange: "$260–$480/night",
          roomRec: "Bungalow with a plunge pool — they're all the same size, request higher on the hill.",
          included: "Private beach access, daily housekeeping",
          honeymoonPerks: "Call the resort directly — champagne + flowers for honeymooners",
          vibe: "Condo-style bungalows scattered through the jungle, private beach at the bottom, deeply relaxing.",
          honestTake: "Punches above its price. The private beach is worth the entire cost — genuinely empty at 8am.",
          bookingNote: "Book 2 months ahead.",
        },
        {
          tier: "minimoon",
          name: "Arenal Kioro",
          location: "La Fortuna, closer to town",
          nightlyRange: "$180–$280/night",
          roomRec: "Junior Suite with volcano view",
          included: "Full breakfast, hot springs access",
          honeymoonPerks: "Welcome drink, turn-down service",
          vibe: "Classic Costa Rican resort, lush grounds, reliable service.",
          honestTake: "If your whole trip is 4 nights, this is a fine base for both volcano mornings and spa afternoons.",
          bookingNote: "Flexible and available most of the year.",
        },
      ],
      dining: [
        {
          category: "big_night",
          name: "Benedictus Steakhouse",
          location: "La Fortuna, 10 min from town",
          cuisine: "Wood-fired steaks, Costa Rican wine list",
          priceRange: "$140–$190 for two with wine",
          setting: "A wood-and-stone room in the rainforest, candlelit, quiet.",
          reservation: "Reserve 1 week out for dinner.",
          bestTable: "Table 4 — the corner with the window.",
          insiderTip: "Ask for the Argentinian malbec flight — it's not on the menu.",
        },
        {
          category: "long_lunch",
          name: "Café Milagro",
          location: "Manuel Antonio",
          cuisine: "Casual Costa Rican + good coffee",
          priceRange: "$60–$90 for two",
          setting: "Open-air wooden deck in the jungle, monkeys in the trees if you're lucky.",
          reservation: "Walk in.",
          bestTable: "The back deck.",
          insiderTip: "Get the ceviche flight and the cold-brew.",
        },
        {
          category: "sunset_dinner",
          name: "Ronny's Place",
          location: "Manuel Antonio, cliffside",
          cuisine: "Tico + seafood",
          priceRange: "$90–$140 for two",
          setting: "Open-air deck overlooking the Pacific — the sunset is the whole point.",
          reservation: "Reserve for 5:15pm to catch the sunset; tables fill fast.",
          bestTable: "Any edge table with unobstructed sea view.",
          insiderTip: "Go for drinks + apps, not the full dinner — the food is solid but the view is the value.",
        },
        {
          category: "local_find",
          name: "Soda La Parada",
          location: "La Fortuna, town center",
          cuisine: "Casado plates, gallo pinto",
          priceRange: "$15–$25 for two",
          setting: "A fluorescent-lit open kitchen on the town square.",
          reservation: "Walk in.",
          bestTable: "Doesn't matter.",
          insiderTip: "Order the casado con pollo. It's $6 and it's great.",
        },
        {
          category: "casual",
          name: "El Avión",
          location: "Manuel Antonio",
          cuisine: "Bar + appetizers",
          priceRange: "$50–$80 for two",
          setting: "A converted C-123 cargo plane on the cliffside, sunset drinks.",
          reservation: "Walk in early (5pm).",
          bestTable: "Inside the plane for the novelty, on the deck for the view.",
          insiderTip: "Don't come for dinner — the food is fine; come for a drink and move on.",
        },
      ],
      experiences: [
        {
          category: "adventure",
          name: "Manuel Antonio National Park at opening",
          costEstimate: "$20 per person + $30 optional guide",
          timeCommitment: "3–4 hours",
          intensity: "low",
          bestTime: "7:00 AM opening — quadruples your wildlife sightings",
          weatherDependent: false,
          bookAhead: "Tickets online 3–5 days ahead in peak season",
          blurb: "The smallest national park in Costa Rica and the most biodiverse. Guide is worth it for the spotting scope — you'll see sloths you'd have walked past.",
          theOne: true,
        },
        {
          category: "adventure",
          name: "Arenal 1968 Lava Trail",
          costEstimate: "$25 per person",
          timeCommitment: "2.5 hours",
          intensity: "medium",
          bestTime: "Morning, before clouds obscure the volcano",
          weatherDependent: true,
          bookAhead: "None",
          blurb: "Walks across the hardened lava flow from the 1968 eruption. Views of the volcano cone from the summit lookout are the best on the property.",
        },
        {
          category: "romance",
          name: "Tabacón hot springs night session",
          costEstimate: "$85 per person (day pass) / $140 with dinner",
          timeCommitment: "3–4 hours",
          intensity: "low",
          bestTime: "After dark — the grounds light up",
          weatherDependent: false,
          bookAhead: "Day-of is fine",
          blurb: "Ten thermal pools flowing through landscaped gardens. The bar in the main pool is the small luxury that sells the whole thing.",
        },
        {
          category: "nature",
          name: "Night walk in a private reserve",
          costEstimate: "$60 per person",
          timeCommitment: "2 hours",
          intensity: "low",
          bestTime: "6:30 PM start",
          weatherDependent: true,
          bookAhead: "2–3 days",
          blurb: "Tree frogs, kinkajous, glass frogs, and the red-eyed leaf frog you've seen on every postcard. Guide brings a red-light headlamp so you don't disturb the animals.",
        },
        {
          category: "adventure",
          name: "Catamaran sunset with snorkel",
          costEstimate: "$190 per couple",
          timeCommitment: "4 hours",
          intensity: "low",
          bestTime: "Afternoon departure into sunset",
          weatherDependent: true,
          bookAhead: "1–2 weeks",
          blurb: "Departs Quepos marina. Snorkel stop, open bar on the way back, sunset over the Pacific.",
        },
        {
          category: "skip",
          name: "Sky Tram + Sky Walk combo",
          costEstimate: "$80 per person",
          timeCommitment: "Half day",
          intensity: "low",
          bestTime: "—",
          weatherDependent: true,
          bookAhead: "None",
          blurb: "Overpriced and underwhelming. The Arenal Observatory trails give you better forest and better views for free.",
        },
      ],
      moneyMath: {
        flights: [700, 1400],
        accommodation: [1800, 5000],
        food: [600, 1100],
        activities: [700, 1300],
        transport: [250, 500],
        misc: [200, 400],
        saveSplurge:
          "Costa Rica is where you can spend little and eat well — most of the best stuff (national park, hikes, hot springs) is cheap. Save on restaurants (sodas beat tourist dinners), splurge on one Nayara night or a private wildlife guide who can find you a quetzal.",
      },
      logistics: {
        gettingThere:
          "Fly into San José (SJO). US connections direct from DFW, IAH, MIA, ATL, JFK. Shared shuttles ($45–$70/pp) or private transfers ($180–$250) up to La Fortuna.",
        gettingAround:
          "Driving is very doable if you're comfortable with winding roads — a 4x4 is not strictly needed in dry season but worth it in wet. Shared shuttles between major destinations are well-run and cheap.",
        documents:
          "US passport; no visa for stays under 90 days. Proof of onward travel required at immigration.",
        health:
          "No vaccinations mandatory. Zika is a consideration if pregnant — CDC page is the source of truth. Tap water is safe in major areas.",
        money:
          "US dollars accepted everywhere; you can do the whole trip in USD if you want. Cards work almost universally. Tipping 10% is standard (usually added as 'servicio').",
        connectivity:
          "Most resorts have good wifi. Kolbi eSIM ($15 for 10GB) covers dead zones on drives.",
        language: "Spanish. English common at hotels and tourist restaurants. A little Spanish helps with drivers and small sodas.",
        honeymoonTips:
          "Tell the hotel — Costa Rican resorts take honeymooners seriously and often upgrade. Bring insect repellent and reef-safe sunscreen. Budget a quiet buffer day in Manuel Antonio to just not do anything.",
      },
      bookingTimeline: [
        {
          when: "6 months out",
          items: ["Flights", "Nayara (if dream tier)", "Top resorts for Dec–Apr"],
        },
        {
          when: "2 months out",
          items: [
            "Mid-tier resorts",
            "Private naturalist guide for Manuel Antonio",
            "Benedictus dinner reservation",
            "Shuttle Arenal → Manuel Antonio",
          ],
        },
        {
          when: "2 weeks out",
          items: [
            "Night walks, surf lessons, catamaran",
            "Tabacón evening pass",
          ],
        },
        {
          when: "Day of",
          items: ["National park entry", "Casual restaurants"],
        },
      ],
    },
  },
  {
    id: "iceland_ring",
    title: "Iceland — Ring Road slow loop",
    tagline:
      "Waterfalls you stop for, glaciers you walk on, a lagoon where you end every day.",
    hook:
      "Seven days circling the island by car — black-sand beaches, geothermal baths, one ice cave tour, the Blue Lagoon on your last night. Midnight sun in summer, northern lights in winter.",
    heroImage:
      "https://images.unsplash.com/photo-1520769945061-0a448c463865?w=960&q=70",
    stops: ["Reykjavík", "South Coast", "Akureyri", "East Fjords"],
    regions: ["Iceland"],
    kind: "adventure",
    recommendedDurationDays: [7, 10],
    bestMonths: [6, 7, 8],
    shoulderMonths: [5, 9],
    avoidMonths: [11, 12, 1, 2],
    couplesBudgetUsd: [8000, 13000],
    vibeMatch: ["adventure_for_two", "wander_discover", "variety_mix"],
    priorityTags: ["adventure", "wildlife", "unique", "photography"],
    flightHoursFromDFW: [9, 11],
    requiresPassport: true,
    triggers: [],
    experienceHighlights: [
      { emoji: "🏔️", label: "Diamond Beach + glacier lagoon" },
      { emoji: "🌊", label: "Reynisfjara black sand" },
      { emoji: "🧊", label: "Ice cave tour (winter)" },
      { emoji: "♨️", label: "Sky Lagoon sunset soak" },
    ],
    yellowFlags: [
      "Winter driving (Oct–Apr) can be treacherous — add a buffer",
      "Prices are steep — budget $200/night for basic guesthouses",
    ],
    alsoConsider: ["new_zealand_south", "portugal_azores"],
    deepDive: {
      openingNarrative:
        "This is a road trip honeymoon. Fly into Keflavík, pick up a 4x4 at the airport, and drive the Ring Road (Route 1) counter-clockwise over 7–10 days, stopping at waterfalls you'll want to linger at, black-sand beaches that feel like another planet, glacier lagoons, and geothermal pools that glow blue after dark. One night in a remote guesthouse with nobody else in sight. One afternoon you end at a pool carved into a hillside, just the two of you and sheep in the distance. It's an active honeymoon — hours in the car, gear in the trunk — and the kind of trip whose photos you'll look at twenty years later and still feel the cold air.",
      days: [
        {
          range: "Days 1–2",
          title: "Reykjavík + Golden Circle",
          body:
            "Arrive at KEF, pick up the 4x4 rental, drive 45 min into Reykjavík, check in and sleep. Day 2 is the Golden Circle warm-up loop: Þingvellir National Park (walk between the tectonic plates), Geysir (where the word comes from), Gullfoss waterfall. Lunch at Friðheimar, a tomato greenhouse restaurant — everything on the menu is tomato-based, don't skip the Bloody Mary. Back to Reykjavík for dinner at Dill or Matur og Drykkur.",
        },
        {
          range: "Days 3–4",
          title: "South Coast",
          body:
            "Drive Route 1 south from Reykjavík. Seljalandsfoss (walk behind the waterfall), Skógafoss (climb to the top), Reynisfjara black-sand beach (stay back from the 'sneaker waves' — they kill people every year). Overnight in Vík í Mýrdal. Day 4 continues east: Fjaðrárgljúfur canyon, Jökulsárlón glacier lagoon, Diamond Beach. Overnight near Höfn — fresh langoustine for dinner, Humarhöfnin is the spot.",
        },
        {
          range: "Days 5–6",
          title: "East Fjords",
          body:
            "Slow driving through the East Fjords — hairpin switchbacks down to fishing villages, puffin colonies at Borgarfjörður Eystri (May–Aug only). Small guesthouses in places like Seyðisfjörður or Egilsstaðir. Days here are long because driving is slow and you'll stop constantly. This is the quiet heart of the trip.",
        },
        {
          range: "Day 7",
          title: "Mývatn",
          body:
            "North Iceland. Lake Mývatn, Dettifoss (the most powerful waterfall in Europe — stand near it just once, the spray will soak you), Námaskarð geothermal area (smells like sulfur, looks like Mars), and end the day at Mývatn Nature Baths for the sunset. Less crowded than the Blue Lagoon, arguably better.",
        },
        {
          range: "Days 8–9",
          title: "Akureyri + Snæfellsnes",
          body:
            "Drive west through Akureyri (Iceland's 'second city,' ~20k people, a good stop for a proper restaurant meal). Day 9 is Snæfellsnes peninsula — Kirkjufell mountain, black church at Búðir, volcanic coastal walks. Overnight at Hótel Búðir for the isolation and the view.",
        },
        {
          range: "Day 10",
          title: "Back to Reykjavík + Sky Lagoon",
          body:
            "Back along the coast to Reykjavík. Drop the rental car in the evening, sunset soak at Sky Lagoon (the new-ish infinity-edge geothermal pool with a 7-step 'ritual'), last-night dinner in town, fly home the next morning.",
        },
      ],
      accommodations: [
        {
          tier: "dream",
          name: "Deplar Farm",
          location: "Troll Peninsula, north Iceland (off Ring Road)",
          nightlyRange: "$2,800–$4,200/night (all-inclusive)",
          roomRec: "Standard suite — all rooms are excellent, no category worth stretching for.",
          included: "All meals, drinks, activities (heli-ski winter, fly-fishing summer, snorkeling)",
          honeymoonPerks: "Private geothermal lap pool, custom itinerary, couples spa treatment",
          vibe: "A former sheep farm turned Eleven Experience lodge. Remote to the point of being its own world. Celebrities come here.",
          honestTake: "Expensive and absolutely worth it if budget permits — a 2-night add-on turns the trip into something singular.",
          bookingNote: "12 months out for winter.",
        },
        {
          tier: "sweet_spot",
          name: "Hótel Rangá",
          location: "South Iceland, 90 min from Reykjavík",
          nightlyRange: "$500–$900/night",
          roomRec: "Deluxe Jr Suite — request the east-facing rooms for northern-lights visibility.",
          included: "Breakfast, hot tubs, private observatory",
          honeymoonPerks: "Chocolate + sparkling on arrival, aurora wake-up call",
          vibe: "Log-cabin lodge with a top-tier restaurant (the head chef is known nationally). The aurora viewing from the property is some of the best in Iceland.",
          honestTake: "Excellent base for the first night of the Ring Road drive. Dinner is a destination in itself.",
          bookingNote: "4 months ahead, longer for aurora season (Sep–Mar).",
        },
        {
          tier: "smart",
          name: "Fosshotel Glacier Lagoon",
          location: "Near Jökulsárlón, south coast",
          nightlyRange: "$280–$400/night",
          roomRec: "Standard Plus — the glacier-view rooms are worth the $40/night upgrade.",
          included: "Breakfast",
          honeymoonPerks: "Welcome drink",
          vibe: "Clean, functional modern hotel — nothing fancy, but the location is the value.",
          honestTake: "The only reasonable place to sleep near Jökulsárlón. Take it. Food is fine.",
          bookingNote: "2 months ahead.",
        },
        {
          tier: "minimoon",
          name: "Retreat at Blue Lagoon",
          location: "Blue Lagoon, 20 min from KEF airport",
          nightlyRange: "$900–$1,500/night",
          roomRec: "Lagoon Suite with private lagoon access — the reason you stay here.",
          included: "Breakfast, unlimited lagoon access, in-spa treatments",
          honeymoonPerks: "Turn-down with chocolates, floating breakfast option",
          vibe: "Luxury lava-field architecture with a private section of the Blue Lagoon attached to the room.",
          honestTake: "Perfect 3–4 night minimoon. You'd barely leave the property.",
          bookingNote: "2–3 months ahead.",
        },
      ],
      dining: [
        {
          category: "big_night",
          name: "Dill",
          location: "Reykjavík (1 Michelin star)",
          cuisine: "New Nordic tasting menu",
          priceRange: "$350–$500 for two",
          setting: "A small dining room, open kitchen, chef usually delivers a course or two himself.",
          reservation: "6 weeks out.",
          bestTable: "Counter seats facing the kitchen — the show is part of the meal.",
          dressCode: "Smart casual.",
          insiderTip: "The pairing with Icelandic spirits (brennivín, birch liqueur) is part of the experience.",
        },
        {
          category: "long_lunch",
          name: "Friðheimar",
          location: "Golden Circle, 90 min from Reykjavík",
          cuisine: "Tomato-everything, inside a working greenhouse",
          priceRange: "$80–$120 for two",
          setting: "You eat among the tomato vines. The warm, humid contrast to the weather outside is half the charm.",
          reservation: "2–3 weeks ahead — they book up.",
          bestTable: "Any window to the greenhouse — they're all great.",
          insiderTip: "Tomato soup is bottomless. Also try the tomato beer.",
        },
        {
          category: "local_find",
          name: "Humarhöfnin",
          location: "Höfn, south-east coast",
          cuisine: "Langoustine",
          priceRange: "$140–$180 for two",
          setting: "An unassuming harbor-side room in a small fishing town.",
          reservation: "1 week ahead.",
          bestTable: "Window table overlooking the harbor.",
          insiderTip: "Icelandic langoustine is the meal of the Ring Road. Get the grill platter.",
        },
        {
          category: "casual",
          name: "Bæjarins Beztu Pylsur",
          location: "Reykjavík waterfront",
          cuisine: "Icelandic hot dog stand (open since 1937)",
          priceRange: "$15 for two",
          setting: "A stand. There is no seating.",
          reservation: "Walk up.",
          bestTable: "The curb.",
          insiderTip: "Order 'eina með öllu' — one with everything. Bill Clinton had one here; it's framed on the wall.",
        },
        {
          category: "breakfast",
          name: "Brauð & Co",
          location: "Reykjavík, multiple locations",
          cuisine: "Sourdough bakery + cardamom buns",
          priceRange: "$15–$25 for two",
          setting: "A colorful storefront, no indoor seating, smell of fresh bread from a block away.",
          reservation: "Walk in.",
          bestTable: "Grab and walk to the harbor.",
          insiderTip: "Get a cardamom bun. If you get only one thing in Iceland to take home a memory of, make it that.",
        },
      ],
      experiences: [
        {
          category: "adventure",
          name: "Ice cave tour (Vatnajökull, winter only)",
          costEstimate: "$200 per person",
          timeCommitment: "Half day",
          intensity: "medium",
          bestTime: "November–March; book morning slots",
          weatherDependent: true,
          bookAhead: "1–2 months",
          blurb: "Crystal-blue caves carved out every winter in Europe's largest glacier. Must be a guided tour — the caves move and collapse.",
          theOne: true,
        },
        {
          category: "nature",
          name: "Snæfellsjökull glacier day",
          costEstimate: "Free (self-drive)",
          timeCommitment: "Full day",
          intensity: "medium",
          bestTime: "Daylight hours; best in summer",
          weatherDependent: true,
          bookAhead: "None",
          blurb: "The Snæfellsnes peninsula is the West Iceland highlight — Kirkjufell, black pebble beach at Djúpalónssandur, the volcano Jules Verne put at the center of the earth.",
        },
        {
          category: "romance",
          name: "Sky Lagoon seven-step ritual at sunset",
          costEstimate: "$80 per person",
          timeCommitment: "2 hours",
          intensity: "low",
          bestTime: "2 hours before sunset",
          weatherDependent: false,
          bookAhead: "1 week",
          blurb: "The newer, less crowded alternative to the Blue Lagoon. The infinity-edge main pool facing the Atlantic at golden hour is the photograph.",
        },
        {
          category: "adventure",
          name: "Snorkel Silfra (between two tectonic plates)",
          costEstimate: "$180 per person",
          timeCommitment: "3 hours",
          intensity: "medium",
          bestTime: "Year-round, water is 2°C always",
          weatherDependent: false,
          bookAhead: "3–4 weeks",
          blurb: "Visibility is 100+ meters — the clearest water in the world. You literally swim between the North American and Eurasian plates in a dry suit.",
        },
        {
          category: "unique",
          name: "Northern lights hunt",
          costEstimate: "Free if driving yourself",
          timeCommitment: "Evening",
          intensity: "low",
          bestTime: "Sep–Mar, moonless nights, KP index 3+",
          weatherDependent: true,
          bookAhead: "None",
          blurb: "Check the Icelandic Met Office aurora forecast daily. Drive 30 min out of any town — let your eyes adjust for 15 min before deciding it's a bust.",
        },
        {
          category: "skip",
          name: "Blue Lagoon (if you've only time for one pool)",
          costEstimate: "$100 per person",
          timeCommitment: "Half day",
          intensity: "low",
          bestTime: "—",
          weatherDependent: false,
          bookAhead: "3 weeks",
          blurb: "Popular and crowded. Sky Lagoon and Mývatn Nature Baths are both better and cheaper. Blue Lagoon only wins if you're staying at the Retreat.",
        },
      ],
      moneyMath: {
        flights: [900, 1600],
        accommodation: [2800, 5500],
        food: [1600, 2800],
        activities: [600, 1400],
        transport: [900, 1400],
        misc: [300, 600],
        saveSplurge:
          "Rental car + gas is the unglamorous money pit ($120–$160/day for a 4x4 plus fuel). Save on food by grocery-shopping once a week — Bónus is cheap. Splurge on a 2-night Rangá stay and one ice cave or Silfra tour.",
      },
      logistics: {
        gettingThere:
          "Fly Keflavík (KEF). Icelandair direct from JFK, BOS, ORD, SEA, IAD. Pick up rental car at the airport on arrival.",
        gettingAround:
          "Rental 4x4 (Toyota RAV4 class or higher for the F-roads / winter). Ring Road is 1,300 km total. Do NOT attempt in winter without a 4WD and real winter tires.",
        documents: "US passport, 90-day Schengen. US driver's license is fine for rental.",
        health: "No vaccinations needed. Tap water is the cleanest on earth.",
        money:
          "Iceland is near-cashless. Cards work everywhere including gas pumps (you'll need a PIN — confirm with your bank before departure).",
        connectivity:
          "Excellent 4G across the whole Ring Road. Icelandic SIM optional; Vodafone or Nova eSIM is $15 for 10GB.",
        language: "Icelandic. Universal English.",
        honeymoonTips:
          "Winter has ~4 hours of usable daylight — start each driving day at first light. Pack a real winter kit: waterproof boots, shell, thermal base layers. The geothermal-pool swimsuit count should be two each.",
      },
      bookingTimeline: [
        {
          when: "6 months out",
          items: [
            "Flights",
            "Rental 4x4 (summer scarcity is real)",
            "Hótel Rangá + Hótel Búðir",
            "Deplar Farm (if splurging)",
          ],
        },
        {
          when: "2–3 months out",
          items: [
            "Mid-Ring guesthouses (Höfn, Vík, Egilsstaðir)",
            "Ice cave tour (winter)",
            "Silfra snorkel",
            "Dill reservation",
          ],
        },
        {
          when: "2 weeks out",
          items: [
            "Friðheimar + Humarhöfnin",
            "Sky Lagoon timed entry",
            "Aurora forecast check-in rhythm",
          ],
        },
        {
          when: "Day of",
          items: [
            "Waterfall stops",
            "Geothermal pool soaks",
            "Grocery run at Bónus",
          ],
        },
      ],
    },
  },
  {
    id: "tulum_holbox",
    title: "Tulum + Isla Holbox",
    tagline:
      "Cenote mornings, beach lunches, bioluminescent water at night.",
    hook:
      "Four nights in Tulum for cenotes, ruins, and great food, then a ferry to Holbox — no cars, no paved roads, hammocks strung across the sea.",
    heroImage:
      "https://images.unsplash.com/photo-1510097467424-192d713fd8b2?w=960&q=70",
    stops: ["Tulum", "Isla Holbox"],
    regions: ["Mexico"],
    kind: "beach",
    recommendedDurationDays: [6, 9],
    bestMonths: [11, 12, 1, 2, 3, 4],
    shoulderMonths: [5, 10],
    avoidMonths: [8, 9],
    couplesBudgetUsd: [3000, 6500],
    vibeMatch: ["barefoot_unplugged", "variety_mix", "wine_dine_romance"],
    priorityTags: ["beaches", "food", "photography", "ease"],
    flightHoursFromDFW: [2, 3],
    requiresPassport: true,
    triggers: [],
    experienceHighlights: [
      { emoji: "💎", label: "Cenote Dos Ojos swim" },
      { emoji: "🏛️", label: "Tulum ruins at opening" },
      { emoji: "✨", label: "Holbox bioluminescence (Jun–Oct)" },
      { emoji: "🦩", label: "Flamingo kayak at Punta Mosquito" },
    ],
    yellowFlags: [
      "Tulum sargassum seaweed May–Aug — can close beaches",
      "Holbox nightlife is nil — it's the point",
    ],
    alsoConsider: ["costa_rica_pacific", "oaxaca_mexico_city"],
    deepDive: {
      openingNarrative:
        "Fly into Cancún (an easy 3 hours from most US cities), grab a pre-booked shuttle down the coast, and disappear into Tulum for four nights — beach road by day, cenote swims, ruins before the heat, the best grilled fish of your life at a plastic-table palapa you'd never find on your own. Then a ferry and another shuttle north to Isla Holbox for three or four nights of almost nothing: hammocks, golf carts instead of cars, bioluminescence in summer, and the slowest rhythm you've moved at in a year. It's the version of a beach honeymoon that isn't a resort compound.",
      days: [
        {
          range: "Days 1–4",
          title: "Tulum",
          body:
            "Day 1 is arrival — check in, walk the beach, sunset mezcal at Habitas. Day 2 you go to the ruins right at opening (7am) to beat the tour buses and the heat, then cenote afternoon at Dos Ojos or Casa Tortuga. Day 3 is your slow day: breakfast at Raw Love, beach club at Papaya Playa until late lunch, sunset at Hartwood if you got the reservation (if not, Kitchen Table). Day 4 is either a Sian Ka'an biosphere day trip (bird sanctuary, bioluminescent lagoon in summer) or just another slow beach day. That last dinner goes to Arca.",
        },
        {
          range: "Days 5–8",
          title: "Isla Holbox",
          body:
            "Shuttle to Chiquilá (2.5 hours from Tulum), 30-minute ferry to Holbox. Check in and rent a golf cart — the island has no cars. Day 6 is a flamingo-and-whale-shark tour if you're in June–Sep season; otherwise a punta mosquito kayak. Days 7 and 8 are the ones you'll think about later: hammocks at Mandarina, long lunches at Ziggy Beach, dinner at Roots, bioluminescence at Punta Cocos on a moonless night.",
        },
      ],
      accommodations: [
        {
          tier: "dream",
          name: "Habitas Tulum",
          location: "Tulum beach road, south end",
          nightlyRange: "$750–$1,200/night",
          roomRec: "Ocean Front Casita — not the garden view, the ocean view is worth the delta.",
          included: "Breakfast, yoga, meditation, some events",
          honeymoonPerks: "Arrival amenity, couples spa treatment at booking discount, turn-down",
          vibe: "Thatch-and-rope luxury — the design-forward version of the Tulum aesthetic, actually quiet.",
          honestTake: "The beach in front is one of the best stretches left in Tulum. Pricey but authentic; not a mega-resort vibe.",
          bookingNote: "Sells out 4+ months ahead for Dec–Apr.",
        },
        {
          tier: "sweet_spot",
          name: "Nest Tulum",
          location: "Tulum beach road, adults-only",
          nightlyRange: "$380–$600/night",
          roomRec: "Ocean View Suite — the rooftop pool is the highlight of the property.",
          included: "Breakfast, beach chairs, bikes",
          honeymoonPerks: "Complimentary bottle of wine, bed decoration",
          vibe: "Boutique adults-only, 12 rooms, quiet, deeply romantic at sunset.",
          honestTake: "Tiny property with a strong point of view. Not much to do on-site — you're meant to wander the road.",
          bookingNote: "Book 2–3 months ahead.",
        },
        {
          tier: "smart",
          name: "Casa Las Tortugas (Holbox)",
          location: "Holbox, 2 blocks from the beach",
          nightlyRange: "$220–$340/night",
          roomRec: "Deluxe Ocean View — bigger than the base room, worth the bump.",
          included: "Breakfast",
          honeymoonPerks: "Welcome drinks, can arrange a private beach dinner",
          vibe: "Mediterranean-meets-Caribbean — whitewashed walls, arched doorways, a cat on every cushion.",
          honestTake: "The best stay on the island by a distance. The restaurant (La Pizza del Zorro) is also the best dinner spot.",
          bookingNote: "Books 2 months ahead for peak season.",
        },
        {
          tier: "minimoon",
          name: "Be Tulum",
          location: "Tulum beach road, central",
          nightlyRange: "$450–$700/night",
          roomRec: "Jungle Suite with plunge pool",
          included: "Breakfast, beach club",
          honeymoonPerks: "Honeymoon package with couples massage and dinner add-on",
          vibe: "Tropical maximalism — velvet, brass, jungle — leans Instagram but executes well.",
          honestTake: "Great for a 3–4 night minimoon if you want concentrated luxury without leaving the property.",
          bookingNote: "Flexible, often available on shorter notice.",
        },
      ],
      dining: [
        {
          category: "big_night",
          name: "Hartwood",
          location: "Tulum beach road",
          cuisine: "Wood-fired coastal Mexican, farm-to-table",
          priceRange: "$180–$260 for two with drinks",
          setting: "Open-air jungle, candlelit, no electricity — the wood fire is the kitchen.",
          reservation: "Walk-in line at 3pm same-day only. Arrive by 2:30pm.",
          bestTable: "Any candle table in the sand section.",
          insiderTip:
            "They only take cash or Apple Pay. The short rib and the whole fish are the must-orders.",
        },
        {
          category: "local_find",
          name: "Taqueria Honorio",
          location: "Tulum town (not beach)",
          cuisine: "Cochinita pibil tacos, breakfast only",
          priceRange: "$15–$25 for two",
          setting: "A family-run taco stand with plastic chairs. Closes when they run out (~noon).",
          reservation: "No reservations. Go before 9am.",
          bestTable: "Doesn't matter — don't overthink it.",
          insiderTip: "Cochinita pibil tacos, relleno negro torta. Cash only.",
        },
        {
          category: "long_lunch",
          name: "Kitchen Table",
          location: "Tulum beach road",
          cuisine: "Coastal Mexican, lighter than Hartwood",
          priceRange: "$130–$180 for two",
          setting: "Open kitchen, jungle setting, more formal than you'd expect.",
          reservation: "Book 2–3 weeks out.",
          bestTable: "Near the kitchen — watching the chef is part of the meal.",
          insiderTip: "The backup for Hartwood if you don't get in. Some say it's actually better.",
        },
        {
          category: "breakfast",
          name: "Raw Love",
          location: "Tulum beach road",
          cuisine: "Smoothie bowls, juices, acai",
          priceRange: "$25–$40 for two",
          setting: "Beachside shack with outdoor seating, barefoot crowd.",
          reservation: "Walk in.",
          bestTable: "The beach-facing picnic tables.",
          insiderTip: "Coconut bowl with bee pollen. Go mid-morning after the beach walk.",
        },
        {
          category: "sunset_dinner",
          name: "Casa Malca",
          location: "Tulum beach road, former Pablo Escobar estate",
          cuisine: "Elevated Mexican",
          priceRange: "$180–$240 for two",
          setting: "A gallery-hotel with rotating modern art pieces; dinner on the beach terrace.",
          reservation: "Book 2 weeks ahead.",
          bestTable: "Beach cabana table — request at booking.",
          insiderTip: "Come for the atmosphere; the food is good-not-transcendent. Great for the art-curious.",
        },
        {
          category: "casual",
          name: "Ziggy Beach (Holbox)",
          location: "Holbox, oceanfront",
          cuisine: "Fresh fish, ceviche, Mediterranean-Mexican",
          priceRange: "$70–$110 for two",
          setting: "Tables in the sand with linen, music, slow service (the point).",
          reservation: "Walk in before 1pm or after 3pm.",
          bestTable: "Water's edge tables to the right of the bar.",
          insiderTip: "Octopus carpaccio and the fresh catch — they'll bring out the whole fish to show you.",
        },
      ],
      experiences: [
        {
          category: "culture",
          name: "Tulum ruins at opening",
          costEstimate: "$5 per person",
          timeCommitment: "1.5 hours",
          intensity: "low",
          bestTime: "8:00 AM opening — tour buses arrive at 10",
          weatherDependent: false,
          bookAhead: "None",
          blurb: "A Mayan trading post on a cliff above the Caribbean. Small site, but the setting is extraordinary before the crowds arrive.",
          theOne: true,
        },
        {
          category: "adventure",
          name: "Cenote Dos Ojos or Casa Tortuga",
          costEstimate: "$35–$60 per person",
          timeCommitment: "3–4 hours",
          intensity: "medium",
          bestTime: "Afternoon — pairs with morning ruins",
          weatherDependent: false,
          bookAhead: "None",
          blurb: "Casa Tortuga (4 cenotes on one ticket) is newer and less crowded than Dos Ojos. Bring water shoes and underwater camera — viz is 30m+.",
        },
        {
          category: "unique",
          name: "Holbox bioluminescence tour",
          costEstimate: "$60 per person",
          timeCommitment: "1.5 hours",
          intensity: "low",
          bestTime: "June–October only, on moonless nights",
          weatherDependent: true,
          bookAhead: "2–3 days — go with a local guide, not a resort",
          blurb: "Walk into the water at Punta Cocos and trail your hand; every movement sparks pale blue light. It's worth planning your dates around.",
        },
        {
          category: "nature",
          name: "Sian Ka'an biosphere reserve",
          costEstimate: "$200 per couple private tour",
          timeCommitment: "Full day",
          intensity: "low",
          bestTime: "Early morning departure",
          weatherDependent: true,
          bookAhead: "1 week — book a small-group or private operator",
          blurb: "UNESCO site south of Tulum — boat through mangroves, float the natural current channels, lunch at a fishing village. The best non-ruin day you'll have.",
        },
        {
          category: "food_drink",
          name: "Mezcalería Buho in Tulum town",
          costEstimate: "$50 per couple for a tasting flight",
          timeCommitment: "2 hours",
          intensity: "low",
          bestTime: "Late afternoon",
          weatherDependent: false,
          bookAhead: "Walk-in",
          blurb: "A flight of artisanal mezcals with a bartender who can talk you through every single one. Worth the trip into town — far better than anything on the beach road.",
        },
        {
          category: "skip",
          name: "Swim with whale sharks (if out of season)",
          costEstimate: "$150 per person",
          timeCommitment: "Half day",
          intensity: "medium",
          bestTime: "Only June–September",
          weatherDependent: true,
          bookAhead: "None",
          blurb: "If you're not between June and September, skip. Operators sometimes offer 'alternative tours' — they're a waste of time.",
        },
      ],
      moneyMath: {
        flights: [500, 1000],
        accommodation: [1800, 4200],
        food: [500, 900],
        activities: [400, 800],
        transport: [250, 450],
        misc: [150, 300],
        saveSplurge:
          "Food in Tulum can absolutely wreck a budget if you eat only on the beach road — balance it out with Taqueria Honorio mornings and one casual town dinner. Splurge on one cenote day with a private guide and a Sian Ka'an boat tour.",
      },
      logistics: {
        gettingThere:
          "Fly into Cancún (CUN) — direct from most US hubs. Pre-book a private shuttle to Tulum ($140 one way). USX or Happy Shuttle are reliable.",
        gettingAround:
          "Tulum: bikes on the beach road (rent from your hotel). Holbox: golf cart ($60/day) — no cars on the island.",
        documents: "US passport. No visa; fill the FMM tourist card on the plane.",
        health:
          "No vaccinations required. Tap water NOT safe — stick to bottled or filtered. Bring DEET for Holbox (mangrove mosquitoes).",
        money:
          "Pesos for small vendors; USD and cards accepted at hotels and beach-road restaurants. ATMs reliable in Tulum town.",
        connectivity:
          "Tulum hotel wifi is mostly OK but patchy — get a Telcel eSIM ($12, 10GB) as backup. Holbox connectivity is spotty by design.",
        language: "Spanish. English common in Tulum tourist zones; less so in Holbox — a few words help.",
        honeymoonTips:
          "Sargassum (seaweed) can pile up May–Aug — check the real-time sargassum map and pick a hotel that rakes the beach. Tell the hotel at booking; Tulum properties are famously generous to honeymooners.",
      },
      bookingTimeline: [
        {
          when: "4 months out",
          items: ["Flights", "Tulum hotel (Habitas or Nest)", "Casa Las Tortugas in Holbox"],
        },
        {
          when: "2–3 weeks out",
          items: [
            "Sian Ka'an tour",
            "Kitchen Table dinner",
            "Bioluminescence tour (if in season)",
            "CUN → Tulum shuttle",
          ],
        },
        {
          when: "Day of",
          items: [
            "Hartwood (3pm same-day walk-in line)",
            "Cenote visits",
            "Ruins at opening",
            "Holbox golf cart rental",
          ],
        },
      ],
    },
  },
  {
    id: "portugal_azores",
    title: "Portugal — Lisbon, the Algarve, and the Azores",
    tagline:
      "A city, a coast, and the green volcanic islands nobody talks about.",
    hook:
      "Three nights in Lisbon for pastel streets and fado, four on the Algarve coast for beaches, then a flight to São Miguel in the Azores for the wildcard finish — crater lakes, whale watching, a thermal-spring pool in the rainforest.",
    heroImage:
      "https://images.unsplash.com/photo-1558102822-da570eb113ba?w=960&q=70",
    stops: ["Lisbon", "Algarve", "São Miguel"],
    regions: ["Portugal"],
    kind: "multi",
    recommendedDurationDays: [10, 14],
    bestMonths: [5, 6, 9],
    shoulderMonths: [4, 7, 8, 10],
    avoidMonths: [12, 1, 2],
    couplesBudgetUsd: [6500, 11000],
    vibeMatch: ["wander_discover", "variety_mix", "adventure_for_two"],
    priorityTags: ["food", "culture", "beaches", "adventure", "unique"],
    flightHoursFromDFW: [10, 13],
    requiresPassport: true,
    triggers: [],
    experienceHighlights: [
      { emoji: "🥂", label: "Ginjinha crawl in Alfama" },
      { emoji: "🏖️", label: "Benagil cave kayak" },
      { emoji: "🌋", label: "Sete Cidades crater lakes" },
      { emoji: "🐋", label: "Azores whale watching" },
    ],
    yellowFlags: [
      "Azores weather flips fast — pack layers",
      "Algarve gets packed in August",
    ],
    alsoConsider: ["santorini_crete", "slovenia_croatia"],
    wildcard: true,
  },
  {
    id: "tanzania_zanzibar",
    title: "Tanzania — Serengeti + Zanzibar",
    tagline:
      "The great migration, then a week on the Indian Ocean to process it.",
    hook:
      "Five or six nights in mobile tented camps chasing the migration across the Serengeti and Ngorongoro, then a short flight to Zanzibar — spice tours in Stone Town, a beach villa on the east coast, nothing scheduled.",
    heroImage:
      "https://images.unsplash.com/photo-1549366021-9f761d450615?w=960&q=70",
    stops: ["Serengeti", "Ngorongoro", "Zanzibar"],
    regions: ["Tanzania"],
    kind: "multi",
    recommendedDurationDays: [10, 14],
    bestMonths: [6, 7, 8, 9, 10],
    shoulderMonths: [1, 2],
    avoidMonths: [3, 4, 5, 11],
    couplesBudgetUsd: [16000, 28000],
    vibeMatch: ["adventure_for_two", "full_luxury", "variety_mix"],
    priorityTags: ["wildlife", "adventure", "unique", "beaches", "photography"],
    flightHoursFromDFW: [22, 28],
    requiresPassport: true,
    triggers: ["long_flights", "malaria"],
    experienceHighlights: [
      { emoji: "🦁", label: "Big 5 game drives" },
      { emoji: "🎈", label: "Hot-air balloon over Serengeti" },
      { emoji: "🌶️", label: "Zanzibar spice tour" },
      { emoji: "🏖️", label: "Pongwe beach decompress" },
    ],
    yellowFlags: [
      "Malaria zone — prophylaxis required",
      "Long-haul with small bush flights — packing limits are strict",
    ],
    alsoConsider: ["maldives_overwater", "iceland_ring"],
  },
  {
    id: "new_zealand_south",
    title: "New Zealand — South Island road trip",
    tagline:
      "Queenstown adrenaline, Milford Sound, and roads with no traffic.",
    hook:
      "Twelve days from Christchurch to Queenstown — glacier hikes, bungee (optional), Fiordland boat cruise, wine country in Central Otago, and a day in Milford that you'll remember forever.",
    heroImage:
      "https://images.unsplash.com/photo-1515862764260-fa928a0b4707?w=960&q=70",
    stops: ["Christchurch", "Franz Josef", "Queenstown", "Milford Sound"],
    regions: ["New Zealand"],
    kind: "adventure",
    recommendedDurationDays: [12, 16],
    bestMonths: [11, 12, 1, 2, 3],
    shoulderMonths: [10, 4],
    avoidMonths: [6, 7, 8],
    couplesBudgetUsd: [14000, 22000],
    vibeMatch: ["adventure_for_two", "wander_discover", "variety_mix"],
    priorityTags: ["adventure", "wildlife", "photography", "unique", "food"],
    flightHoursFromDFW: [20, 24],
    requiresPassport: true,
    triggers: ["long_flights"],
    experienceHighlights: [
      { emoji: "🚁", label: "Glacier helihike" },
      { emoji: "🛥️", label: "Milford Sound cruise" },
      { emoji: "🍷", label: "Central Otago pinot tasting" },
      { emoji: "🏞️", label: "Routeburn day hike" },
    ],
    yellowFlags: [
      "Long-haul — one recovery day on arrival",
      "Fiordland rain is real — build in flex days",
    ],
    alsoConsider: ["iceland_ring", "tanzania_zanzibar"],
  },
  {
    id: "charleston_savannah",
    title: "Charleston + Savannah — coastal south",
    tagline:
      "Oyster nights, oak-lined streets, no passport required.",
    hook:
      "Three nights in Charleston for the food scene and the waterfront, two in Savannah for the squares and the ghost stories, an easy drive between them. Perfect if you want low logistics and the best American food weekend on earth.",
    heroImage:
      "https://images.unsplash.com/photo-1570127070923-e6b78d0f8db7?w=960&q=70",
    stops: ["Charleston", "Savannah"],
    regions: ["USA"],
    kind: "domestic",
    recommendedDurationDays: [5, 7],
    bestMonths: [3, 4, 5, 10, 11],
    shoulderMonths: [2, 6, 9, 12],
    avoidMonths: [7, 8],
    couplesBudgetUsd: [2500, 5000],
    vibeMatch: ["wine_dine_romance", "wander_discover"],
    priorityTags: ["food", "culture", "ease", "photography"],
    flightHoursFromDFW: [2, 3],
    requiresPassport: false,
    triggers: [],
    experienceHighlights: [
      { emoji: "🦪", label: "Husk + FIG dinners" },
      { emoji: "🌳", label: "Wormsloe oak avenue" },
      { emoji: "🏛️", label: "Rainbow Row walk" },
      { emoji: "🛶", label: "Kayak Shem Creek" },
    ],
    yellowFlags: [
      "July–August is hot-and-swampy — shoulder months are the move",
      "Charleston top-table reservations go 30 days out sharp at 9am",
    ],
    alsoConsider: ["oaxaca_mexico_city", "tulum_holbox"],
  },
  {
    id: "slovenia_croatia",
    title: "Slovenia + Croatia's Dalmatian coast",
    tagline:
      "Lake Bled, Hvar, and half the price of Italy with none of the crowds.",
    hook:
      "Four nights in Slovenia (Ljubljana + Bled) for mountains and storybook towns, then south into Croatia for Split and island-hopping to Hvar and Vis. The unconventional Mediterranean honeymoon nobody else is doing.",
    heroImage:
      "https://images.unsplash.com/photo-1555990538-17392d128e2b?w=960&q=70",
    stops: ["Ljubljana", "Lake Bled", "Split", "Hvar"],
    regions: ["Slovenia", "Croatia"],
    kind: "multi",
    recommendedDurationDays: [10, 14],
    bestMonths: [5, 6, 9],
    shoulderMonths: [4, 7, 8, 10],
    avoidMonths: [12, 1, 2],
    couplesBudgetUsd: [6500, 11000],
    vibeMatch: [
      "wander_discover",
      "adventure_for_two",
      "wine_dine_romance",
      "variety_mix",
    ],
    priorityTags: ["food", "culture", "adventure", "photography", "beaches"],
    flightHoursFromDFW: [12, 15],
    requiresPassport: true,
    triggers: [],
    experienceHighlights: [
      { emoji: "🏰", label: "Lake Bled island church" },
      { emoji: "⛰️", label: "Triglav day hike" },
      { emoji: "⛵", label: "Hvar skipper day on the water" },
      { emoji: "🦪", label: "Pelješac oyster farm lunch" },
    ],
    yellowFlags: [
      "Dalmatian ferry schedule thins shoulder months — build slack",
      "Hvar nightlife is loud in July–Aug",
    ],
    alsoConsider: ["santorini_crete", "portugal_azores"],
    wildcard: true,
  },
  {
    id: "oaxaca_mexico_city",
    title: "Mexico City + Oaxaca",
    tagline:
      "Mole negro, mezcal tastings, and the most interesting food scene in the hemisphere.",
    hook:
      "Three nights in CDMX — Pujol, Contramar, Coyoacán wandering — then a short flight to Oaxaca for the markets, weavers' villages, and mezcal distilleries you'll think about for years.",
    heroImage:
      "https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?w=960&q=70",
    stops: ["Mexico City", "Oaxaca"],
    regions: ["Mexico"],
    kind: "food_wine",
    recommendedDurationDays: [7, 10],
    bestMonths: [10, 11, 12, 1, 2, 3, 4],
    shoulderMonths: [5, 9],
    avoidMonths: [6, 7, 8],
    couplesBudgetUsd: [3500, 6500],
    vibeMatch: ["wander_discover", "wine_dine_romance", "variety_mix"],
    priorityTags: ["food", "culture", "unique", "photography"],
    flightHoursFromDFW: [2, 4],
    requiresPassport: true,
    triggers: [],
    experienceHighlights: [
      { emoji: "🌽", label: "Oaxaca Mercado 20 de Noviembre" },
      { emoji: "🍸", label: "Mezcal distillery tour" },
      { emoji: "🏛️", label: "Monte Albán sunrise" },
      { emoji: "👨‍🍳", label: "Pujol tasting menu" },
    ],
    yellowFlags: [
      "Pujol reservations open 2 months ahead to the hour",
      "July–Aug is rainy season in Oaxaca — afternoon downpours",
    ],
    alsoConsider: ["tulum_holbox", "charleston_savannah"],
  },
  {
    id: "sri_lanka_maldives",
    title: "Sri Lanka + Maldives",
    tagline:
      "Tea country, leopards, and an overwater finish. The 14-day greatest hits.",
    hook:
      "A week across Sri Lanka — Sigiriya, the tea country, and Yala for safaris — then a short hop to a Maldives resort to collapse for five nights. Culture and wildlife and the beach week you earned.",
    heroImage:
      "https://images.unsplash.com/photo-1588598198321-9735fd52d9cf?w=960&q=70",
    stops: ["Colombo", "Sigiriya", "Ella", "Yala", "Maldives"],
    regions: ["Sri Lanka", "Maldives"],
    kind: "multi",
    recommendedDurationDays: [12, 16],
    bestMonths: [12, 1, 2, 3],
    shoulderMonths: [11, 4],
    avoidMonths: [5, 6, 7, 8, 9, 10],
    couplesBudgetUsd: [10000, 18000],
    vibeMatch: [
      "adventure_for_two",
      "variety_mix",
      "barefoot_unplugged",
      "wander_discover",
    ],
    priorityTags: [
      "wildlife",
      "culture",
      "adventure",
      "beaches",
      "unique",
      "food",
    ],
    flightHoursFromDFW: [22, 28],
    requiresPassport: true,
    triggers: ["long_flights"],
    experienceHighlights: [
      { emoji: "🗿", label: "Sigiriya Lion Rock sunrise" },
      { emoji: "🚂", label: "Kandy → Ella tea-country train" },
      { emoji: "🐆", label: "Yala leopard safari" },
      { emoji: "🐠", label: "Maldives house reef" },
    ],
    yellowFlags: [
      "Sri Lanka monsoons are regional — research by quadrant by month",
      "Long-haul — build a recovery day into each leg",
    ],
    alsoConsider: ["bali_multi", "tanzania_zanzibar"],
  },
  {
    id: "bora_bora",
    title: "Bora Bora + Moorea",
    tagline:
      "French Polynesia: the original overwater bungalow.",
    hook:
      "Three nights in Moorea for pineapple fields and lagoon snorkeling, then a short flight to Bora Bora for the iconic overwater villa week. Quieter than the Maldives, with Polynesian culture layered in.",
    heroImage:
      "https://images.unsplash.com/photo-1589197331516-4d84b72ebde3?w=960&q=70",
    stops: ["Moorea", "Bora Bora"],
    regions: ["French Polynesia"],
    kind: "luxury",
    recommendedDurationDays: [7, 10],
    bestMonths: [5, 6, 7, 8, 9, 10],
    shoulderMonths: [4, 11],
    avoidMonths: [1, 2, 3],
    couplesBudgetUsd: [20000, 32000],
    vibeMatch: ["full_luxury", "barefoot_unplugged"],
    priorityTags: ["beaches", "privacy", "spa", "unique", "photography"],
    flightHoursFromDFW: [14, 18],
    requiresPassport: true,
    triggers: [],
    experienceHighlights: [
      { emoji: "🐠", label: "Lagoon snorkel with rays" },
      { emoji: "🌋", label: "Mt Otemanu 4x4 circuit" },
      { emoji: "🛶", label: "Outrigger sunset paddle" },
      { emoji: "💆", label: "Overwater spa morning" },
    ],
    yellowFlags: [
      "LAX connection usually required — budget 18+ hours door to door",
      "Dec–Mar is wet season; humid but resorts stay open",
    ],
    alsoConsider: ["maldives_overwater", "tanzania_zanzibar"],
  },
];

export function getConceptById(id: string): DestinationConcept | undefined {
  return DESTINATION_CONCEPTS.find((c) => c.id === id);
}
