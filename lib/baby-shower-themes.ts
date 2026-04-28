// ── Baby Shower theme & experience library ────────────────────────────────
// Themes, activities, menus, vendors, and destinations the Discover tab
// ranks against the Plan & Vibe inputs. Scoring factors (with weights):
//   vibe alignment (25), guest count fit (20), budget fit (20),
//   venue compatibility (15), season (10), personal resonance (10),
//   hard-no penalties applied on top.

import { useMemo } from "react";
import type {
  BabyShowerRec,
  BabyShowerRecMatch,
  BabyShowerVenueType,
} from "@/types/baby-shower";
import { useBabyShowerStore } from "@/stores/baby-shower-store";
import {
  FORMAL_VENUE_TYPES,
  GUEST_TIER_OPTIONS,
} from "@/lib/baby-shower-seed";

// ── Library ────────────────────────────────────────────────────────────────

const RECS: BabyShowerRec[] = [
  {
    id: "theme_garden_brunch",
    type: "theme",
    name: "Garden Brunch",
    tagline:
      "Herb centerpieces, family-style platters, bare feet in the grass.",
    narrative:
      "Long farm tables set under string lights and leafy trees. Linen runners, wildflowers in bud vases, handwritten place cards. Guests arrive to a welcome drink, settle into family-style brunch, and the afternoon drifts into toasts and blessings as the light turns golden. It's the kind of shower that feels like it happened effortlessly — which means someone planned it perfectly.",
    heroPalette: ["#E8DDC7", "#A9B89A", "#D4A853", "#EDE4D3"],
    detailPills: ["Mimosa bar", "Flower crown station", "Lawn games", "Book swap"],
    vibes: ["garden_party", "brunch_bubbles", "modern_minimal"],
    venueTypes: ["home", "outdoors"],
    seasons: ["spring", "summer", "fall"],
    minGuests: 10,
    maxGuests: 35,
    costLowCents: 180000,
    costHighCents: 450000,
    kidFriendly: true,
    culturalFit: false,
    violates: [],
    pairings: ["activity_onesie_bar", "menu_grazing_spread", "activity_book_swap"],
    seasonNote: "Peak season for your date",
    whyItMatches:
      "Your garden-party vibe lines up perfectly, and 22 guests is the sweet spot for a long-table brunch.",
    whatYoullNeed: [
      "Farm table rental or sturdy folding tables",
      "Linen runners, bud vases, string lights",
      "Caterer who does family-style (or a good friend who does)",
      "Weather backup plan (tent or indoor pivot)",
    ],
    suggestedDuration: "3 hours — 11 AM to 2 PM is the sweet spot",
  },
  {
    id: "theme_godh_bharai_modern",
    type: "theme",
    name: "Modern Godh Bharai",
    tagline:
      "Traditional blessings meet your personal style — bangles, haldi, sweets, and your own family's rituals.",
    narrative:
      "The bangle ceremony, the blessing circle, the mithai spread — all the warmth of a traditional Godh Bharai, styled with the restraint of a modern event. Marigold garlands over a clean neutral backdrop. The mother-in-law's dupatta draped across Priya's lap. Elder women slipping bangles on, one at a time, with a wish spoken out loud. This is the shower the family wanted and the aesthetic the couple wanted, co-existing.",
    heroPalette: ["#C5704A", "#E8C26A", "#D4A853", "#FBF6E9"],
    detailPills: [
      "Bangle ceremony",
      "Blessing circle",
      "Henna station",
      "Mithai bar",
    ],
    vibes: ["cultural_traditional", "garden_party"],
    venueTypes: ["home", "cultural_center", "banquet_hall", "outdoors"],
    seasons: ["spring", "summer", "fall", "winter"],
    minGuests: 10,
    maxGuests: 50,
    costLowCents: 220000,
    costHighCents: 600000,
    kidFriendly: true,
    culturalFit: true,
    violates: [],
    pairings: ["activity_henna_bar", "menu_mithai_chaat", "vendor_decorator"],
    seasonNote: "Works any season",
    whyItMatches:
      "Cultural rituals you named as must-haves, paired with the long-table warmth you asked for.",
    whatYoullNeed: [
      "Bangles (one set per elder or guest, depending on tradition)",
      "Marigold garlands & small puja thali",
      "Henna artist for 3–4 hours",
      "Mithai — either homemade from Mom's recipes or ordered in",
    ],
    suggestedDuration: "3–4 hours, with the ceremony in the middle hour",
  },
  {
    id: "theme_godh_bharai_grand",
    type: "theme",
    name: "Godh Bharai Grand",
    tagline:
      "Full traditional ceremony in a venue that does it justice — aarti thali, bangles, blessing songs, seated dinner.",
    narrative:
      "A large banquet hall or hotel ballroom transformed with draped fabrics, gold accents, and a stage backdrop for the blessing circle. Seated dinner for 60+, mithai and chaat stations, an emcee to keep the ceremony flowing. This is the shower for families where 'small' means 40 people and the grandmothers would never forgive you for skipping a tradition.",
    heroPalette: ["#9B2C2C", "#E8C26A", "#D4A853", "#FBF6E9"],
    detailPills: [
      "Pandit coordination",
      "Mehndi artist",
      "Mithai & chaat station",
      "Sangeet / DJ",
    ],
    vibes: ["cultural_traditional"],
    venueTypes: ["banquet_hall", "hotel", "cultural_center"],
    seasons: ["spring", "summer", "fall", "winter"],
    minGuests: 40,
    maxGuests: 150,
    costLowCents: 800000,
    costHighCents: 2500000,
    kidFriendly: true,
    culturalFit: true,
    violates: [],
    pairings: ["vendor_decorator", "vendor_caterer", "vendor_emcee"],
    seasonNote: "Works any season — venue handles weather",
    whyItMatches:
      "When the guest list runs deep into aunties and cousins, the ceremony deserves a venue that can hold it.",
    whatYoullNeed: [
      "Venue decorator for backdrop & linens",
      "Caterer with South Asian menu experience",
      "Emcee or family member comfortable coordinating ritual flow",
      "Pandit (optional — some families handle the ritual themselves)",
    ],
    suggestedDuration: "4 hours with a seated dinner",
  },
  {
    id: "theme_grand_celebration",
    type: "theme",
    name: "Grand Celebration",
    tagline:
      "Draped linens, stage backdrop, coordinated florals — a shower that feels like an event, because it is one.",
    narrative:
      "Round tables, a stage backdrop with the parent's name in florals, a live DJ, plated menu service. The kind of shower that shows up in everyone's feed the next morning with eight blurry photos and a caption that says 'never gonna forget this.' Works for big extended-family gatherings where a restaurant or backyard just wouldn't hold everyone.",
    heroPalette: ["#D4A853", "#E8DDC7", "#9B2C2C", "#FBF6E9"],
    detailPills: [
      "Professional decor",
      "Catered menu",
      "Photo backdrop",
      "Emcee program",
    ],
    vibes: ["modern_minimal", "cultural_traditional", "co_ed"],
    venueTypes: ["banquet_hall", "hotel"],
    seasons: ["spring", "summer", "fall", "winter"],
    minGuests: 40,
    maxGuests: 200,
    costLowCents: 600000,
    costHighCents: 1800000,
    kidFriendly: true,
    culturalFit: false,
    violates: [],
    pairings: ["vendor_decorator", "vendor_photographer", "vendor_caterer"],
    seasonNote: "Works with your venue year-round",
    whyItMatches:
      "Your venue calls for a theme that fills it — stage, florals, coordinated decor, full catering.",
    whatYoullNeed: [
      "Venue decorator",
      "Full-service caterer",
      "DJ or live band",
      "Photographer for a 3-hour block",
    ],
    suggestedDuration: "4 hours",
  },
  {
    id: "theme_modern_minimal_brunch",
    type: "theme",
    name: "Modern Minimal Brunch",
    tagline: "Neutral palette, curated details, every element chosen on purpose.",
    narrative:
      "Ivory linens, one statement arrangement per table, a single signature mocktail. No balloon arches, no overwrought signage, no 'mom-to-be' sash. The restraint is the point — guests remember the food, the conversation, and how grown-up everything felt. The parent-to-be remembers being seen as a whole person, not a theme.",
    heroPalette: ["#F5F1E8", "#D4D0C4", "#8B7355", "#EDE4D3"],
    detailPills: ["Signature mocktail", "Seasonal menu", "One statement florals", "Curated playlist"],
    vibes: ["modern_minimal", "brunch_bubbles"],
    venueTypes: ["home", "restaurant", "outdoors"],
    seasons: ["spring", "summer", "fall", "winter"],
    minGuests: 8,
    maxGuests: 30,
    costLowCents: 150000,
    costHighCents: 500000,
    kidFriendly: false,
    culturalFit: false,
    violates: [],
    pairings: ["menu_grazing_spread", "activity_recipe_cards"],
    seasonNote: "Year-round",
    whyItMatches:
      "Curated details over excess — your aesthetic, executed at shower scale.",
    whatYoullNeed: [
      "Caterer or excellent take-out plating plan",
      "One florist for statement arrangement",
      "Neutral linens, simple glassware",
    ],
    suggestedDuration: "2.5 hours",
  },
  {
    id: "theme_co_ed_backyard",
    type: "theme",
    name: "Co-Ed Backyard",
    tagline: "BBQ, lawn games, everyone's invited — not just the women.",
    narrative:
      "A backyard set up for the afternoon — grill going, cornhole in the corner, lawn games scattered across the grass, coolers of beer and lemonade. Both sides of the family, partners and friends and neighbors. The sash-and-games energy is replaced by people actually hanging out. Gifts get opened casually, or not at all.",
    heroPalette: ["#6B8E5A", "#D4A853", "#E8DDC7", "#3F5C3A"],
    detailPills: ["BBQ menu", "Lawn games", "Beer & lemonade bar", "No seating chart"],
    vibes: ["co_ed", "garden_party"],
    venueTypes: ["home", "outdoors"],
    seasons: ["spring", "summer", "fall"],
    minGuests: 15,
    maxGuests: 50,
    costLowCents: 200000,
    costHighCents: 550000,
    kidFriendly: true,
    culturalFit: false,
    violates: ["no_alcohol"],
    pairings: ["activity_book_swap", "activity_onesie_bar"],
    seasonNote: "Best in warm weather",
    whyItMatches:
      "When you want both sides of the family relaxed, not standing around a gift table.",
    whatYoullNeed: [
      "Grill & cooler setup",
      "A few lawn games (cornhole, bocce, giant Jenga)",
      "Beer, wine, lemonade, iced tea",
      "Paper plates — this isn't a plated event",
    ],
    suggestedDuration: "4 hours, drop-in style",
  },
  // ── Activities ───────────────────────────────────────────────────────────
  {
    id: "activity_onesie_bar",
    type: "activity",
    name: "Onesie Decorating Bar",
    tagline:
      "Set up stations with plain onesies, fabric markers, iron-on patches — guests make baby's first wardrobe.",
    narrative:
      "Low-pressure, everyone participates, and the parent-to-be leaves with a pile of one-of-a-kind onesies they'll actually use. Works across age groups — grandmothers get as into it as the friends.",
    heroPalette: ["#E8DDC7", "#D4A853", "#A9B89A", "#EDE4D3"],
    detailPills: ["30-minute activity", "Take-home keepsake", "All skill levels"],
    vibes: ["garden_party", "modern_minimal", "brunch_bubbles", "co_ed", "book_themed"],
    venueTypes: ["home", "outdoors", "restaurant", "banquet_hall", "cultural_center"],
    seasons: ["spring", "summer", "fall", "winter"],
    minGuests: 8,
    maxGuests: 40,
    costLowCents: 8000,
    costHighCents: 25000,
    kidFriendly: true,
    culturalFit: false,
    violates: [],
    pairings: ["theme_garden_brunch", "theme_modern_minimal_brunch"],
    seasonNote: "Year-round",
    whyItMatches:
      "Great for your budget, great for your group size, great for the kid-and-adult mix.",
    whatYoullNeed: [
      "12–20 blank onesies in varying sizes (0–12 months)",
      "Fabric markers in a warm palette",
      "Iron-on patches or stencils",
      "A flat surface per 3 guests",
    ],
    suggestedDuration: "30 minutes",
  },
  {
    id: "activity_book_swap",
    type: "activity",
    name: "Build-a-Library Book Swap",
    tagline:
      "Every guest brings a favorite children's book, inscribed inside the cover — instant home library.",
    narrative:
      "The sweetest kind of gift: each guest picks a book that meant something to them as a kid (or to their own kids) and writes a short inscription inside. The parent-to-be walks away with 20+ books and 20+ tiny love notes. Works as a standalone activity or woven into a larger shower.",
    heroPalette: ["#8B5A3C", "#E8DDC7", "#D4A853", "#FBF6E9"],
    detailPills: ["On the invite", "Zero day-of effort", "Keepsake for years"],
    vibes: ["book_themed", "modern_minimal", "garden_party", "cultural_traditional"],
    venueTypes: ["home", "outdoors", "restaurant", "cultural_center", "banquet_hall", "hotel"],
    seasons: ["spring", "summer", "fall", "winter"],
    minGuests: 5,
    maxGuests: 100,
    costLowCents: 0,
    costHighCents: 5000,
    kidFriendly: true,
    culturalFit: false,
    violates: [],
    pairings: ["theme_garden_brunch", "theme_modern_minimal_brunch"],
    seasonNote: "Year-round",
    whyItMatches:
      "Zero added logistics on your end — the guests do the work, and you end up with a library.",
    whatYoullNeed: [
      "A line on the invitation asking guests to bring an inscribed book",
      "A basket or display table for arrivals",
      "Fine-tip pens for late-inscribers",
    ],
    suggestedDuration: "Passive — no time block needed",
  },
  {
    id: "activity_henna_bar",
    type: "activity",
    name: "Henna Station",
    tagline:
      "Professional mehndi artist set up on a side table — guests leave with a fresh design and a memory.",
    narrative:
      "A henna artist tucked into a shaded corner, taking guests one at a time through short designs — a vine on the wrist, a mandala on the palm. It keeps the energy moving (there's always a small line of people chatting), and it makes the day feel distinctly ceremonial without staging a full ritual.",
    heroPalette: ["#C5704A", "#E8C26A", "#FBF6E9", "#3F2B1F"],
    detailPills: ["Artist hire", "3–4 hours", "Works indoors & out"],
    vibes: ["cultural_traditional", "garden_party"],
    venueTypes: ["home", "outdoors", "cultural_center", "banquet_hall", "hotel"],
    seasons: ["spring", "summer", "fall", "winter"],
    minGuests: 10,
    maxGuests: 60,
    costLowCents: 30000,
    costHighCents: 90000,
    kidFriendly: true,
    culturalFit: true,
    violates: [],
    pairings: ["theme_godh_bharai_modern", "theme_godh_bharai_grand"],
    seasonNote: "Year-round",
    whyItMatches:
      "Honors the cultural element without making the whole shower about ceremony.",
    whatYoullNeed: [
      "Experienced mehndi artist (book 4+ weeks out)",
      "Two chairs + a small table",
      "Paper towels & a cushion for resting hands",
    ],
    suggestedDuration: "3 hours — guests visit between other activities",
  },
  {
    id: "activity_recipe_cards",
    type: "activity",
    name: "Advice & Recipe Cards",
    tagline:
      "Each place setting has a card — guests write a recipe, a piece of parenting advice, or a memory.",
    narrative:
      "Place cards at each seat: guests write their favorite recipe, a piece of quiet parenting advice, or a memory of the parent-to-be. Low-pressure, sentimental, and everyone participates without needing to perform. The parent-to-be goes through them weeks later, alone, and cries.",
    heroPalette: ["#E8DDC7", "#D4A853", "#FBF6E9", "#A9B89A"],
    detailPills: ["Low-lift", "Sentimental", "Keepsake box"],
    vibes: ["garden_party", "modern_minimal", "cultural_traditional", "book_themed"],
    venueTypes: ["home", "outdoors", "restaurant", "banquet_hall", "cultural_center"],
    seasons: ["spring", "summer", "fall", "winter"],
    minGuests: 8,
    maxGuests: 40,
    costLowCents: 3000,
    costHighCents: 12000,
    kidFriendly: true,
    culturalFit: false,
    violates: [],
    pairings: ["theme_garden_brunch", "theme_modern_minimal_brunch"],
    seasonNote: "Year-round",
    whyItMatches:
      "Opt-in, sentimental, skips the game energy you said no to.",
    whatYoullNeed: [
      "Pretty cards (30-50 depending on count)",
      "A keepsake box for the cards",
      "Nice pens at each seat",
    ],
    suggestedDuration: "Passive — 20 min during brunch",
  },
  // ── Menus ────────────────────────────────────────────────────────────────
  {
    id: "menu_grazing_spread",
    type: "menu",
    name: "The Grazing Spread",
    tagline:
      "Skip the plated meal — build an abundant, self-serve spread that becomes part of the decor.",
    narrative:
      "A long table loaded with seasonal fruit, cheeses, charcuterie or vegetarian equivalents, small pastries, pickled things, crackers, dips. Guests graze all afternoon. Scales easily, handles dietary restrictions with dignity, and doesn't need a hot kitchen.",
    heroPalette: ["#E8DDC7", "#A9B89A", "#D4A853", "#FBF6E9"],
    detailPills: ["Dietary-friendly", "Prep-ahead", "Scales easily", "No hot kitchen needed"],
    vibes: ["garden_party", "modern_minimal", "brunch_bubbles", "book_themed"],
    venueTypes: ["home", "outdoors", "cultural_center"],
    seasons: ["spring", "summer", "fall", "winter"],
    minGuests: 10,
    maxGuests: 40,
    costLowCents: 40000,
    costHighCents: 140000,
    kidFriendly: true,
    culturalFit: false,
    violates: [],
    pairings: ["theme_garden_brunch", "theme_modern_minimal_brunch"],
    seasonNote: "Year-round",
    whyItMatches:
      "Vegetarian-forward by default, handles your gluten-free guests with zero effort.",
    whatYoullNeed: [
      "Long table or linked tables for the display",
      "Serving boards, small bowls, mini tongs",
      "Shopping trip the day before (or caterer delivery)",
    ],
    suggestedDuration: "Open throughout the event",
  },
  {
    id: "menu_mithai_chaat",
    type: "menu",
    name: "Mithai & Chaat Bar",
    tagline:
      "A self-serve chaat station + a mithai display — the sweet table that is also the meal.",
    narrative:
      "Pani puri station, chole chaat, samosa chaat, all served assembly-line. Alongside it, a mithai display — gulab jamun, kaju katli, barfi, jalebis kept warm. Works for afternoon or evening, feeds 40+ without a catering headache, and everyone gets exactly what they want.",
    heroPalette: ["#C5704A", "#E8C26A", "#D4A853", "#FBF6E9"],
    detailPills: ["Vegetarian-forward", "Interactive", "Photogenic", "Crowd-scaling"],
    vibes: ["cultural_traditional", "garden_party"],
    venueTypes: ["home", "cultural_center", "banquet_hall", "hotel", "outdoors"],
    seasons: ["spring", "summer", "fall", "winter"],
    minGuests: 15,
    maxGuests: 100,
    costLowCents: 80000,
    costHighCents: 350000,
    kidFriendly: true,
    culturalFit: true,
    violates: [],
    pairings: ["theme_godh_bharai_modern", "theme_godh_bharai_grand"],
    seasonNote: "Year-round",
    whyItMatches:
      "Priya's mom's mithai recipes, plus a chaat bar the aunties will talk about for months.",
    whatYoullNeed: [
      "Chaat caterer or an uncle who's a known cook",
      "Mithai from a good local shop (or homemade)",
      "Display boards, warming trays, small bowls & spoons",
    ],
    suggestedDuration: "Open during the event",
  },
  // ── Vendors (surface when formal venue selected) ──────────────────────────
  {
    id: "vendor_decorator",
    type: "vendor",
    name: "Venue Decorator",
    tagline:
      "Backdrop, table settings, entrance decor, balloon or floral arches — someone who handles the visual transformation.",
    narrative:
      "A venue decorator walks in with a plan and walks out 3 hours later having transformed the space — backdrop, centerpieces, entrance arch, photo corner. Non-negotiable for banquet halls and hotel ballrooms unless you have a friend with theatre set experience and a lot of free time.",
    heroPalette: ["#D4A853", "#E8DDC7", "#9B2C2C", "#FBF6E9"],
    detailPills: ["Stage backdrop", "Table centerpieces", "Entrance arch", "Photo corner"],
    vibes: ["garden_party", "modern_minimal", "cultural_traditional"],
    venueTypes: ["banquet_hall", "hotel", "cultural_center"],
    seasons: ["spring", "summer", "fall", "winter"],
    minGuests: 30,
    maxGuests: 300,
    costLowCents: 150000,
    costHighCents: 600000,
    kidFriendly: true,
    culturalFit: true,
    violates: [],
    pairings: ["theme_grand_celebration", "theme_godh_bharai_grand"],
    seasonNote: "Book 6–8 weeks out",
    whyItMatches: "Recommended for your venue.",
    whatYoullNeed: [
      "Site visit with the decorator 4+ weeks out",
      "Reference photos from your mood board",
      "Confirmation on venue decor restrictions (no wall mounting, etc.)",
    ],
    suggestedDuration: "Arrives 3 hours before event",
  },
  {
    id: "vendor_caterer",
    type: "vendor",
    name: "Full-Service Caterer",
    tagline:
      "Menu planning, staff, setup, service, breakdown — the whole food operation handled.",
    narrative:
      "For any shower over ~30 guests, a catering team earns itself back in the first hour. Menu planning, staffing ratios, serving logistics, dietary accommodations, the stack of dirty dishes at the end — you are not doing any of that.",
    heroPalette: ["#6B8E5A", "#E8DDC7", "#D4A853", "#FBF6E9"],
    detailPills: ["Menu + staff", "Dietary-aware", "Setup & breakdown", "Tastings"],
    vibes: ["garden_party", "cultural_traditional", "modern_minimal", "co_ed"],
    venueTypes: ["banquet_hall", "hotel", "restaurant", "cultural_center", "outdoors"],
    seasons: ["spring", "summer", "fall", "winter"],
    minGuests: 25,
    maxGuests: 300,
    costLowCents: 250000,
    costHighCents: 1500000,
    kidFriendly: true,
    culturalFit: true,
    violates: [],
    pairings: ["theme_grand_celebration", "theme_godh_bharai_grand"],
    seasonNote: "Book 6+ weeks out for popular caterers",
    whyItMatches: "Your guest count and venue want a caterer, not a potluck.",
    whatYoullNeed: [
      "2–3 tasting appointments",
      "Final guest count + dietary list 2 weeks out",
      "Confirmation on venue kitchen / prep-space availability",
    ],
    suggestedDuration: "Arrives 2 hours before event",
  },
  {
    id: "vendor_photographer",
    type: "vendor",
    name: "Shower Photographer",
    tagline: "2–3 hour photo coverage — candids, family portraits, the ceremony moment.",
    narrative:
      "Not wedding-level coverage. Just someone who shows up for the good hours, gets the bangle ceremony on camera, catches the grandmother's face during the blessings, and sends an edited gallery a week later.",
    heroPalette: ["#3F2B1F", "#E8DDC7", "#D4A853", "#8B7355"],
    detailPills: ["2–3 hour block", "Edited gallery", "Candid + portrait"],
    vibes: ["cultural_traditional", "garden_party", "modern_minimal"],
    venueTypes: ["banquet_hall", "hotel", "home", "outdoors", "cultural_center", "restaurant"],
    seasons: ["spring", "summer", "fall", "winter"],
    minGuests: 15,
    maxGuests: 300,
    costLowCents: 60000,
    costHighCents: 200000,
    kidFriendly: true,
    culturalFit: true,
    violates: [],
    pairings: ["theme_godh_bharai_modern", "theme_grand_celebration"],
    seasonNote: "Book 4 weeks out",
    whyItMatches: "Rituals worth remembering deserve photos worth keeping.",
    whatYoullNeed: [
      "Shot list (ceremony moments, family groupings)",
      "Confirmed coverage window",
      "Gallery delivery timeline in writing",
    ],
    suggestedDuration: "2–3 hour block",
  },
  // ── Destinations (only scored when venueType=destination) ───────────────
  {
    id: "destination_cabin_weekend",
    type: "destination",
    name: "Cabin Weekend",
    tagline:
      "A slow weekend with your closest people — the shower is Saturday afternoon, the rest is just being together.",
    narrative:
      "Pine trees, a big kitchen, mismatched coffee mugs, a porch wide enough for everyone. The shower itself lives in Saturday afternoon — the weekend around it is welcome dinner Friday, brunch and sendoff Sunday. Works for intimate groups willing to travel.",
    heroPalette: ["#6B8E5A", "#D4A853", "#3F2B1F", "#E8DDC7"],
    detailPills: ["Friday welcome dinner", "Saturday shower", "Sunday brunch sendoff"],
    vibes: ["adventure_babymoon", "garden_party", "modern_minimal"],
    venueTypes: ["destination"],
    seasons: ["spring", "summer", "fall"],
    minGuests: 6,
    maxGuests: 20,
    costLowCents: 800000,
    costHighCents: 2500000,
    kidFriendly: true,
    culturalFit: false,
    violates: [],
    pairings: ["activity_book_swap", "menu_grazing_spread"],
    seasonNote: "Mild weather · 72°/55°F",
    whyItMatches: "A babymoon-shower hybrid for an inner-circle crew.",
    whatYoullNeed: [
      "Cabin rental sleeping 10–14",
      "Grocery delivery or a big shopping run",
      "Simple activity mix (hike, cards, long meals)",
    ],
    suggestedDuration: "3-day weekend",
  },
];

// ── Scoring ────────────────────────────────────────────────────────────────

function clamp(v: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, v));
}

export function scoreRec(
  rec: BabyShowerRec,
  input: {
    vibes: BabyShowerRec["vibes"];
    venueType: BabyShowerVenueType | null;
    guestMidpoint: number;
    season: BabyShowerRec["seasons"][number] | null;
    budgetCeilingCents: number;
    hardNos: Array<"no_games" | "no_gender_reveal" | "no_alcohol" | "no_surprise">;
    personalResonance: string[];
    kidsPresent: boolean;
  },
): { score: number; reasons: string[] } {
  const reasons: string[] = [];

  // Vibe alignment — up to 25 pts.
  const vibeOverlap = rec.vibes.filter((v) => input.vibes.includes(v)).length;
  const vibePts =
    input.vibes.length === 0 ? 15 : clamp((vibeOverlap / input.vibes.length) * 25, 0, 25);
  if (vibeOverlap > 0) reasons.push("PERFECT FOR YOUR VIBE");

  // Guest count fit — up to 20 pts.
  let guestPts = 0;
  if (input.guestMidpoint >= rec.minGuests && input.guestMidpoint <= rec.maxGuests) {
    guestPts = 20;
    reasons.push("GREAT FOR YOUR GROUP SIZE");
  } else if (
    input.guestMidpoint >= rec.minGuests * 0.7 &&
    input.guestMidpoint <= rec.maxGuests * 1.3
  ) {
    guestPts = 12;
  } else {
    guestPts = 4;
  }

  // Budget fit — up to 20 pts.
  let budgetPts = 0;
  if (input.budgetCeilingCents <= 0) {
    budgetPts = 14;
  } else if (rec.costLowCents <= input.budgetCeilingCents) {
    budgetPts =
      rec.costHighCents <= input.budgetCeilingCents ? 20 : 14;
    if (rec.costHighCents <= input.budgetCeilingCents * 0.7) {
      reasons.push("GREAT FOR YOUR BUDGET");
    }
  } else {
    budgetPts = 4;
  }

  // Venue compatibility — up to 15 pts.
  let venuePts = 0;
  if (!input.venueType || input.venueType === "undecided") {
    venuePts = 10;
  } else if (rec.venueTypes.includes(input.venueType)) {
    venuePts = 15;
    if (FORMAL_VENUE_TYPES.includes(input.venueType)) {
      reasons.push("VENUE-READY");
    } else {
      reasons.push("WORKS WITH YOUR VENUE");
    }
  } else {
    venuePts = 3;
  }

  // Season fit — up to 10 pts.
  let seasonPts = 0;
  if (!input.season) {
    seasonPts = 7;
  } else if (rec.seasons.includes(input.season)) {
    seasonPts = 10;
  } else {
    seasonPts = 3;
  }

  // Personal resonance — up to 10 pts. Match any keywords from the
  // "things that feel like us" list against the rec's narrative or pills.
  let resonancePts = 0;
  if (input.personalResonance.length > 0) {
    const haystack =
      `${rec.narrative} ${rec.tagline} ${rec.detailPills.join(" ")}`.toLowerCase();
    const hits = input.personalResonance.filter((phrase) => {
      const keywords = phrase
        .toLowerCase()
        .split(/[\s,.;]+/)
        .filter((w) => w.length > 3);
      return keywords.some((k) => haystack.includes(k));
    }).length;
    resonancePts = clamp(hits * 4, 0, 10);
    if (hits > 0) reasons.push("MATCHES YOUR STORY");
  } else {
    resonancePts = 6;
  }

  // Kid-friendly bump — soft nudge if kids present.
  if (input.kidsPresent && rec.kidFriendly) reasons.push("KID-FRIENDLY");

  // Cultural heritage bump.
  if (rec.culturalFit && input.vibes.includes("cultural_traditional")) {
    reasons.push("HONORS YOUR HERITAGE");
  }

  // Hard-no penalty — -15 per violation.
  let penalty = 0;
  for (const hn of input.hardNos) {
    if (rec.violates.includes(hn)) penalty += 15;
  }

  const raw = vibePts + guestPts + budgetPts + venuePts + seasonPts + resonancePts;
  const score = clamp(raw - penalty, 0, 100);

  return { score, reasons: Array.from(new Set(reasons)).slice(0, 3) };
}

// ── Hook: ranked recommendations ───────────────────────────────────────────

export function useRankedBabyShowerRecs(): BabyShowerRecMatch[] {
  const plan = useBabyShowerStore((s) => s.plan);
  const recStatus = useBabyShowerStore((s) => s.recStatus);
  const guests = useBabyShowerStore((s) => s.guests);

  return useMemo(() => {
    const guestTier = GUEST_TIER_OPTIONS.find((o) => o.value === plan.guestTier);
    const guestMidpoint = guestTier?.midpoint ?? 22;
    const kidsPresent = guests.some((g) => g.kidsCount > 0) ||
      plan.guestMix === "kids_welcome" ||
      plan.guestMix === "mixed";

    return RECS
      .map((rec) => {
        const { score, reasons } = scoreRec(rec, {
          vibes: plan.vibes,
          venueType: plan.venueType,
          guestMidpoint,
          season: plan.season,
          budgetCeilingCents: plan.budgetCeilingCents,
          hardNos: plan.hardNos,
          personalResonance: plan.thingsThatFeelLikeUs,
          kidsPresent,
        });
        return {
          rec,
          score: Math.round(score),
          matchReasons: reasons,
          dismissed: recStatus[rec.id] === "dismissed",
        };
      })
      // Destinations only surface when venueType=destination.
      .filter((m) =>
        m.rec.type !== "destination" || plan.venueType === "destination",
      )
      // Vendors only surface when venue is formal.
      .filter(
        (m) =>
          m.rec.type !== "vendor" ||
          (plan.venueType && FORMAL_VENUE_TYPES.includes(plan.venueType)),
      )
      .sort((a, b) => {
        if (a.dismissed !== b.dismissed) return a.dismissed ? 1 : -1;
        return b.score - a.score;
      });
  }, [plan, recStatus, guests]);
}

export function getRecById(id: string): BabyShowerRec | null {
  return RECS.find((r) => r.id === id) ?? null;
}

export function getAllRecs(): BabyShowerRec[] {
  return RECS;
}
