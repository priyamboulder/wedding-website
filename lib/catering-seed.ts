// ── Catering Menu Studio seed ──────────────────────────────────────────────
// Plausible 5-event Indian wedding so the Menu Studio renders real content
// from first paint. Event slugs match the guest module's event seed
// (welcome, pithi, mehendi, haldi, sangeet, baraat, ceremony, reception,
// brunch) so coverage totals can reconcile when guests + catering share
// the same wedding_id.
//
// Numbers are demo-plausible, not authoritative. The weight here is:
// varied cuisine direction per event, realistic service-moment rhythm,
// and dish descriptions that sound like a caterer wrote them.

import type {
  AttendeeRating,
  CatererProposal,
  Comment,
  Dish,
  EventDietaryTotals,
  MenuEvent,
  MenuMoment,
  OpenQuestion,
  PartyLean,
  PresenceSignal,
  Reaction,
  RentalItem,
  SignatureCocktail,
  StaffSlot,
  TastingDish,
  TastingVisit,
  UpcomingTasting,
} from "@/types/catering";
import { ARJUN_ID, PRIYA_ID, URVASHI_ID } from "@/lib/catering/parties";

export const DEMO_WEDDING_ID = "wedding-demo";

// ── Events ─────────────────────────────────────────────────────────────────

export const SEED_MENU_EVENTS: MenuEvent[] = [
  {
    id: "evt-haldi",
    wedding_id: DEMO_WEDDING_ID,
    slug: "haldi",
    label: "Haldi",
    date: "2026-06-09",
    start_time: "11:00",
    end_time: "14:00",
    guest_count: 80,
    vibe_tags: ["intimate", "backyard", "daytime"],
    cuisine_direction: "South Indian brunch",
    venue: "Residence — backyard",
    service_style: "stations",
    sort_order: 1,
    icon: "✨",
  },
  {
    id: "evt-mehendi",
    wedding_id: DEMO_WEDDING_ID,
    slug: "mehendi",
    label: "Mehendi",
    date: "2026-06-09",
    start_time: "17:00",
    end_time: "22:00",
    guest_count: 160,
    vibe_tags: ["colorful", "outdoor tent", "chaat garden"],
    cuisine_direction: "Street food & chaat",
    venue: "Residence — garden tent",
    service_style: "stations",
    sort_order: 2,
    icon: "🌺",
  },
  {
    id: "evt-sangeet",
    wedding_id: DEMO_WEDDING_ID,
    slug: "sangeet",
    label: "Sangeet",
    date: "2026-06-10",
    start_time: "19:00",
    end_time: "23:30",
    guest_count: 340,
    vibe_tags: ["high energy", "ballroom", "dance floor"],
    cuisine_direction: "Pan-Indian with passed apps",
    venue: "Ritz-Carlton Grand Ballroom",
    service_style: "passed",
    sort_order: 3,
    icon: "🎶",
  },
  {
    id: "evt-ceremony",
    wedding_id: DEMO_WEDDING_ID,
    slug: "ceremony",
    label: "Ceremony & Lunch",
    date: "2026-06-11",
    start_time: "10:30",
    end_time: "15:00",
    guest_count: 420,
    vibe_tags: ["traditional", "mandap", "satvik lunch"],
    cuisine_direction: "Gujarati thali, satvik",
    venue: "Ritz-Carlton Grand Lawn",
    service_style: "thali",
    sort_order: 4,
    icon: "🔥",
  },
  {
    id: "evt-reception",
    wedding_id: DEMO_WEDDING_ID,
    slug: "reception",
    label: "Reception",
    date: "2026-06-11",
    start_time: "19:30",
    end_time: "00:30",
    guest_count: 420,
    vibe_tags: ["black tie", "ballroom", "plated"],
    cuisine_direction: "Global fusion — Indian · Italian · Japanese",
    venue: "Ritz-Carlton Grand Ballroom",
    service_style: "plated",
    sort_order: 5,
    icon: "🥂",
  },
];

// ── Moments ────────────────────────────────────────────────────────────────

export const SEED_MENU_MOMENTS: MenuMoment[] = [
  // Haldi — brunch stations
  { id: "m-haldi-1", event_id: "evt-haldi", name: "Welcome pours", order: 1, time_window: "11:00–11:45" },
  { id: "m-haldi-2", event_id: "evt-haldi", name: "Tiffin stations", order: 2, time_window: "11:45–13:30" },
  { id: "m-haldi-3", event_id: "evt-haldi", name: "Sweets & filter coffee", order: 3, time_window: "13:00–14:00" },

  // Mehendi — chaat garden
  { id: "m-mehendi-1", event_id: "evt-mehendi", name: "Cocktails & mocktails", order: 1, time_window: "17:00–18:00" },
  { id: "m-mehendi-2", event_id: "evt-mehendi", name: "Chaat garden", order: 2, time_window: "18:00–20:00" },
  { id: "m-mehendi-3", event_id: "evt-mehendi", name: "Live tawa & tandoor", order: 3, time_window: "19:30–21:30" },
  { id: "m-mehendi-4", event_id: "evt-mehendi", name: "Mithai trolley", order: 4, time_window: "21:00–22:00" },

  // Sangeet — passed apps + late-night
  { id: "m-sangeet-1", event_id: "evt-sangeet", name: "Arrival drinks", order: 1, time_window: "19:00–19:45" },
  { id: "m-sangeet-2", event_id: "evt-sangeet", name: "Passed apps", order: 2, time_window: "19:30–20:45" },
  { id: "m-sangeet-3", event_id: "evt-sangeet", name: "Main stations", order: 3, time_window: "20:30–22:00" },
  { id: "m-sangeet-4", event_id: "evt-sangeet", name: "Late-night bite", order: 4, time_window: "22:30–23:30" },

  // Ceremony — satvik thali
  { id: "m-ceremony-1", event_id: "evt-ceremony", name: "Pre-ceremony chai", order: 1, time_window: "10:30–11:00" },
  { id: "m-ceremony-2", event_id: "evt-ceremony", name: "Satvik thali", order: 2, time_window: "13:00–15:00" },

  // Reception — plated with late-night
  { id: "m-reception-1", event_id: "evt-reception", name: "Cocktail hour", order: 1, time_window: "19:30–20:30" },
  { id: "m-reception-2", event_id: "evt-reception", name: "Plated dinner", order: 2, time_window: "20:45–22:15" },
  { id: "m-reception-3", event_id: "evt-reception", name: "Dessert & coffee", order: 3, time_window: "22:15–22:45" },
  { id: "m-reception-4", event_id: "evt-reception", name: "Late-night bite", order: 4, time_window: "23:30–00:30" },
];

// ── Dishes ─────────────────────────────────────────────────────────────────
// Curated starting menu — not full coverage. Gaps are intentional so the
// Intelligence panel has something to flag and the conversational menu
// builder has real work to do.

export const SEED_DISHES: Dish[] = [
  // ── Haldi ───────────────────────────────────────────────────────────────
  {
    id: "d-haldi-1",
    moment_id: "m-haldi-1",
    name: "Kokum rose spritz",
    cuisine_tags: ["south-indian", "beverage"],
    dietary_flags: ["vegetarian", "vegan", "gluten_free", "jain"],
    spice_level: 0,
    description: "Sparkling kokum, rose syrup, dried rose petals, lime wheel.",
    why_note: "Cooling welcome for a warm backyard morning.",
    source: "manual",
    sort_order: 1,
  },
  {
    id: "d-haldi-2",
    moment_id: "m-haldi-2",
    name: "Mini ghee-roast podi dosa",
    cuisine_tags: ["south-indian", "karnataka"],
    dietary_flags: ["vegetarian"],
    spice_level: 2,
    description: "Crisp dosa with molagai podi and cultured butter, plated with coconut chutney.",
    source: "manual",
    sort_order: 1,
  },
  {
    id: "d-haldi-3",
    moment_id: "m-haldi-2",
    name: "Appam + vegetable stew",
    cuisine_tags: ["south-indian", "kerala"],
    dietary_flags: ["vegetarian", "gluten_free"],
    spice_level: 1,
    description: "Fermented rice appam with mild coconut stew — cardamom, curry leaf, root veg.",
    source: "manual",
    sort_order: 2,
  },
  {
    id: "d-haldi-4",
    moment_id: "m-haldi-3",
    name: "Paal payasam",
    cuisine_tags: ["south-indian", "tamil"],
    dietary_flags: ["vegetarian"],
    spice_level: 0,
    description: "Slow-cooked rice pudding finished with cardamom and a cashew-ghee drizzle.",
    source: "manual",
    sort_order: 1,
  },

  // ── Mehendi ─────────────────────────────────────────────────────────────
  {
    id: "d-mehendi-1",
    moment_id: "m-mehendi-1",
    name: "Aam panna margarita",
    cuisine_tags: ["cocktail", "fusion"],
    dietary_flags: ["vegetarian", "vegan", "gluten_free"],
    spice_level: 1,
    description: "Green mango, black salt, roasted cumin, tequila blanco, chili-salt rim.",
    source: "manual",
    sort_order: 1,
  },
  {
    id: "d-mehendi-2",
    moment_id: "m-mehendi-2",
    name: "Dahi puri trio",
    cuisine_tags: ["street-food", "mumbai"],
    dietary_flags: ["vegetarian"],
    spice_level: 2,
    description: "Puffed shells with yogurt, tamarind, mint, pomegranate — assembled to order.",
    why_note: "Couple's first date was at Elco in Mumbai — nostalgic pull.",
    source: "manual",
    sort_order: 1,
  },
  {
    id: "d-mehendi-3",
    moment_id: "m-mehendi-2",
    name: "Ragda pattice",
    cuisine_tags: ["street-food", "gujarati"],
    dietary_flags: ["vegetarian"],
    spice_level: 2,
    description: "Crisp potato patties over white-pea curry, tamarind, sev, coriander.",
    source: "manual",
    sort_order: 2,
  },
  {
    id: "d-mehendi-4",
    moment_id: "m-mehendi-3",
    name: "Tandoori paneer tikka",
    cuisine_tags: ["punjabi"],
    dietary_flags: ["vegetarian"],
    spice_level: 2,
    description: "Block paneer, hung-curd marinade, charred bell pepper, mint-coriander chutney.",
    source: "manual",
    sort_order: 1,
  },
  {
    id: "d-mehendi-5",
    moment_id: "m-mehendi-4",
    name: "Gulab jamun + rabri shot",
    cuisine_tags: ["mithai"],
    dietary_flags: ["vegetarian"],
    spice_level: 0,
    description: "Warm khoya jamun dropped into a chilled rabri shot glass — pistachio dust.",
    source: "manual",
    sort_order: 1,
  },

  // ── Sangeet ─────────────────────────────────────────────────────────────
  {
    id: "d-sangeet-1",
    moment_id: "m-sangeet-1",
    name: "Saffron-gin sour",
    cuisine_tags: ["cocktail", "signature"],
    dietary_flags: ["vegetarian", "gluten_free"],
    spice_level: 0,
    description: "London dry, saffron syrup, lemon, aquafaba foam, crushed pistachio garnish.",
    source: "manual",
    sort_order: 1,
  },
  {
    id: "d-sangeet-2",
    moment_id: "m-sangeet-2",
    name: "Tandoori paneer tikka",
    cuisine_tags: ["punjabi"],
    dietary_flags: ["vegetarian"],
    spice_level: 2,
    description: "Passed on skewers, mint-coriander chutney drizzle — same prep as Mehendi.",
    source: "manual",
    sort_order: 1,
  },
  {
    id: "d-sangeet-3",
    moment_id: "m-sangeet-2",
    name: "Galouti kebab on mini sheermal",
    cuisine_tags: ["lucknowi"],
    dietary_flags: ["non_vegetarian", "halal"],
    spice_level: 2,
    description: "Slow-cooked minced lamb kebab, saffron sheermal, rose-onion pickle.",
    source: "manual",
    sort_order: 2,
  },
  {
    id: "d-sangeet-4",
    moment_id: "m-sangeet-3",
    name: "Dal makhani",
    cuisine_tags: ["punjabi"],
    dietary_flags: ["vegetarian"],
    spice_level: 1,
    description: "24-hour simmered urad dal, finished with cultured cream and smoked butter.",
    source: "manual",
    sort_order: 1,
  },
  {
    id: "d-sangeet-5",
    moment_id: "m-sangeet-3",
    name: "Lucknowi dum biryani",
    cuisine_tags: ["lucknowi"],
    dietary_flags: ["non_vegetarian", "halal"],
    spice_level: 2,
    description: "Sealed-pot biryani with bone-in chicken, saffron-rose milk, fried onion.",
    source: "manual",
    sort_order: 2,
  },
  {
    id: "d-sangeet-6",
    moment_id: "m-sangeet-4",
    name: "Mumbai-style pav bhaji",
    cuisine_tags: ["street-food", "mumbai"],
    dietary_flags: ["vegetarian"],
    spice_level: 2,
    description: "Butter-toasted pav, spiced vegetable mash, raw onion, lemon, coriander.",
    why_note: "Late-night carb hit once the dance floor clears.",
    source: "manual",
    sort_order: 1,
  },

  // ── Ceremony ────────────────────────────────────────────────────────────
  {
    id: "d-ceremony-1",
    moment_id: "m-ceremony-1",
    name: "Kulhad masala chai",
    cuisine_tags: ["north-indian"],
    dietary_flags: ["vegetarian"],
    spice_level: 1,
    description: "Served in earthen kulhads — cardamom, ginger, black pepper, whole milk.",
    source: "manual",
    sort_order: 1,
  },
  {
    id: "d-ceremony-2",
    moment_id: "m-ceremony-2",
    name: "Satvik thali — no onion / no garlic",
    cuisine_tags: ["gujarati", "satvik"],
    dietary_flags: ["vegetarian", "jain"],
    spice_level: 1,
    description: "Puri, khichdi, kadhi, aloo-tamatar, seasonal sabzi, mohanthal, rasgulla.",
    why_note: "Thali format honors ceremony-day satvik tradition — served cross-legged on banana leaf plates.",
    source: "manual",
    sort_order: 1,
  },

  // ── Reception ───────────────────────────────────────────────────────────
  {
    id: "d-reception-1",
    moment_id: "m-reception-1",
    name: "Saffron-gin sour",
    cuisine_tags: ["cocktail", "signature"],
    dietary_flags: ["vegetarian", "gluten_free"],
    spice_level: 0,
    description: "Repeats from Sangeet — family favorite, becomes a wedding signature.",
    source: "manual",
    sort_order: 1,
  },
  {
    id: "d-reception-2",
    moment_id: "m-reception-1",
    name: "Scallop crudo, yuzu kosho",
    cuisine_tags: ["japanese", "fusion"],
    dietary_flags: ["non_vegetarian", "gluten_free", "dairy_free"],
    spice_level: 1,
    description: "Hokkaido scallop, yuzu kosho, shiso oil, micro radish — one-bite passed.",
    source: "manual",
    sort_order: 2,
  },
  {
    id: "d-reception-3",
    moment_id: "m-reception-2",
    name: "Burrata, heirloom tomato, kalonji oil",
    cuisine_tags: ["italian", "fusion"],
    dietary_flags: ["vegetarian", "gluten_free"],
    spice_level: 0,
    description: "Plated starter — warm focaccia sidecar, basil, kalonji-infused olive oil.",
    source: "manual",
    sort_order: 1,
  },
  {
    id: "d-reception-4",
    moment_id: "m-reception-2",
    name: "Chilean sea bass, coconut-curry nage",
    cuisine_tags: ["kerala", "fusion"],
    dietary_flags: ["non_vegetarian", "gluten_free", "dairy_free"],
    spice_level: 2,
    description: "Pan-seared sea bass on coconut-curry nage, baby okra, lemon rice croquette.",
    source: "manual",
    sort_order: 2,
  },
  {
    id: "d-reception-5",
    moment_id: "m-reception-3",
    name: "Saffron-pistachio kulfi terrine",
    cuisine_tags: ["mithai"],
    dietary_flags: ["vegetarian"],
    spice_level: 0,
    description: "Sliced kulfi with rose jelly, candied pistachio, edible silver leaf.",
    source: "manual",
    sort_order: 1,
  },
  {
    id: "d-reception-6",
    moment_id: "m-reception-4",
    name: "Mini vada pav",
    cuisine_tags: ["street-food", "mumbai"],
    dietary_flags: ["vegetarian"],
    spice_level: 2,
    description: "Deep-fried potato vada, dry garlic chutney, pillowy pav — one-bite form.",
    source: "manual",
    sort_order: 1,
  },
];

// ── Dietary totals (proxy for the eventual Guests-store selector) ─────────
// Approximated for the demo. Real numbers will come from the guest RSVP
// map once the guest module is lifted into a Zustand store.

export const SEED_DIETARY_TOTALS: EventDietaryTotals[] = [
  {
    event_id: "evt-haldi",
    total_guests: 80,
    counts: { vegetarian: 58, vegan: 6, jain: 4, gluten_free: 3, nut_allergy: 2 },
  },
  {
    event_id: "evt-mehendi",
    total_guests: 160,
    counts: { vegetarian: 112, vegan: 11, jain: 8, gluten_free: 6, nut_allergy: 4, dairy_free: 3 },
  },
  {
    event_id: "evt-sangeet",
    total_guests: 340,
    counts: { vegetarian: 204, vegan: 18, jain: 14, halal: 46, gluten_free: 11, nut_allergy: 8, dairy_free: 6 },
  },
  {
    event_id: "evt-ceremony",
    total_guests: 420,
    counts: { vegetarian: 284, vegan: 22, jain: 19, gluten_free: 14, nut_allergy: 10, dairy_free: 8, swaminarayan: 6 },
  },
  {
    event_id: "evt-reception",
    total_guests: 420,
    counts: { vegetarian: 252, vegan: 22, jain: 17, halal: 58, gluten_free: 14, nut_allergy: 10, dairy_free: 8 },
  },
];

// ── Caterer proposals (seeded against the two catering vendors in
// lib/vendor-seed.ts: ven-cat-01 Foodlink and ven-cat-02 Blue Elephant) ───
// A mix of received + requested so the Decision Board has real shape.

export const SEED_CATERER_PROPOSALS: CatererProposal[] = [
  // Foodlink — the safe-hands 500+ pax choice. Has proposed for reception
  // (where scale matters) and sangeet. Nothing yet for haldi/mehendi.
  {
    id: "prop-foodlink-reception",
    wedding_id: DEMO_WEDDING_ID,
    caterer_id: "ven-cat-01",
    event_id: "evt-reception",
    price_per_plate_low: 4200,
    price_per_plate_high: 5500,
    currency: "INR",
    min_guaranteed: 400,
    inclusions: [
      "13 live kitchens on site",
      "Plated service — captains 1:25",
      "Premium linens & chinaware",
      "Bar glassware & ice service",
    ],
    exclusions: ["Alcohol", "Floral arrangements", "Power/generator"],
    status: "received",
    received_at: "2026-02-14T10:00:00Z",
    notes: "Quote lined up to our 420 headcount. Captain coverage strong.",
  },
  {
    id: "prop-foodlink-sangeet",
    wedding_id: DEMO_WEDDING_ID,
    caterer_id: "ven-cat-01",
    event_id: "evt-sangeet",
    price_per_plate_low: 2800,
    price_per_plate_high: 3400,
    currency: "INR",
    min_guaranteed: 300,
    inclusions: [
      "Passed apps — 6 varieties",
      "3 main stations (Indian, Indo-Chinese, live chaat)",
      "Late-night pav bhaji station",
    ],
    exclusions: ["Cocktails", "Mithai"],
    status: "received",
    received_at: "2026-02-14T10:00:00Z",
  },
  {
    id: "prop-foodlink-haldi",
    wedding_id: DEMO_WEDDING_ID,
    caterer_id: "ven-cat-01",
    event_id: "evt-haldi",
    currency: "INR",
    inclusions: [],
    exclusions: [],
    status: "requested",
    notes: "Emailed 2026-03-20, awaiting turnaround.",
  },

  // Blue Elephant — the regional deep-cuts choice. Proposed for
  // ceremony and haldi where their regional specificity actually helps.
  {
    id: "prop-blueelephant-ceremony",
    wedding_id: DEMO_WEDDING_ID,
    caterer_id: "ven-cat-02",
    event_id: "evt-ceremony",
    price_per_plate_low: 2400,
    price_per_plate_high: 3200,
    currency: "INR",
    min_guaranteed: 350,
    inclusions: [
      "Full satvik thali — Gujarati tradition",
      "Banana-leaf service",
      "Kulhad chai on arrival",
      "Dedicated jain kitchen (separate prep surfaces)",
    ],
    exclusions: ["Banquet furniture", "Beverage service"],
    status: "received",
    received_at: "2026-02-28T09:30:00Z",
    notes: "The jain kitchen isolation is meaningful — ~19 jain guests at ceremony.",
  },
  {
    id: "prop-blueelephant-haldi",
    wedding_id: DEMO_WEDDING_ID,
    caterer_id: "ven-cat-02",
    event_id: "evt-haldi",
    price_per_plate_low: 1800,
    price_per_plate_high: 2600,
    currency: "INR",
    min_guaranteed: 60,
    inclusions: [
      "South Indian tiffin stations",
      "Ghee-roast dosa live station",
      "Appam + stew",
      "Paal payasam + filter coffee",
    ],
    exclusions: ["Cocktails", "Rentals"],
    status: "received",
    received_at: "2026-02-28T09:30:00Z",
  },
  {
    id: "prop-blueelephant-reception",
    wedding_id: DEMO_WEDDING_ID,
    caterer_id: "ven-cat-02",
    event_id: "evt-reception",
    currency: "INR",
    inclusions: [],
    exclusions: [],
    status: "declined",
    notes: "Declined — their ceiling is ~300 pax. Honest 'not our scale'.",
  },
];

// ── Tasting visits (seed) ────────────────────────────────────────────────

export const SEED_TASTING_VISITS: TastingVisit[] = [
  {
    id: "tv-foodlink-01",
    wedding_id: DEMO_WEDDING_ID,
    caterer_id: "ven-cat-01",
    date: "2026-03-02",
    location: "Foodlink HQ, Lower Parel",
    attendees: ["Urvashi", "Arjun", "Uma (mom)"],
    notes:
      "2 hours, 14 dishes served across passed, mains, and dessert. Chef Vikram joined for the last 20 min.",
  },
  {
    id: "tv-blueelephant-01",
    wedding_id: DEMO_WEDDING_ID,
    caterer_id: "ven-cat-02",
    date: "2026-03-15",
    location: "Blue Elephant, Sultanpur (Delhi)",
    attendees: ["Urvashi", "Arjun", "Kavita (Arjun's mom)"],
    notes:
      "Lunch tasting — Gujarati thali was the highlight. Kitchen visit was unusually open.",
  },
  {
    id: "tv-foodlink-02",
    wedding_id: DEMO_WEDDING_ID,
    caterer_id: "ven-cat-01",
    date: "2026-04-05",
    location: "Foodlink HQ, Lower Parel",
    attendees: ["Urvashi", "Arjun"],
    notes:
      "Second tasting — dialed in on reception menu. Chilean sea bass was new.",
  },
];

export const SEED_TASTING_DISHES: TastingDish[] = [
  // Foodlink — visit 1
  {
    id: "td-f1-1",
    visit_id: "tv-foodlink-01",
    name: "Paneer tikka — tandoor",
    category: "passed_app",
    appearance: 4,
    flavor: 3,
    portion: 4,
    temperature: 5,
    memorability: 3,
    notes: "Textbook but safe. Char was there, no smoke. Mint chutney bright.",
    sort_order: 1,
  },
  {
    id: "td-f1-2",
    visit_id: "tv-foodlink-01",
    name: "Galouti kebab, sheermal",
    category: "passed_app",
    appearance: 5,
    flavor: 5,
    portion: 4,
    temperature: 4,
    memorability: 5,
    notes: "Best bite of the tasting. The sheermal was real — not a prop.",
    sort_order: 2,
  },
  {
    id: "td-f1-3",
    visit_id: "tv-foodlink-01",
    name: "Dal makhani",
    category: "main",
    appearance: 4,
    flavor: 5,
    portion: 5,
    temperature: 5,
    memorability: 4,
    notes: "Genuinely 24-hour. Smoke finish, cream restrained. Gold standard at scale.",
    sort_order: 3,
  },
  {
    id: "td-f1-4",
    visit_id: "tv-foodlink-01",
    name: "Lucknowi chicken biryani",
    category: "main",
    appearance: 5,
    flavor: 4,
    portion: 4,
    temperature: 4,
    memorability: 4,
    notes: "Sealed-pot aromatics were present. Chicken slightly dry on the leg piece.",
    sort_order: 4,
  },
  {
    id: "td-f1-5",
    visit_id: "tv-foodlink-01",
    name: "Gulab jamun, rabri shot",
    category: "dessert",
    appearance: 5,
    flavor: 4,
    portion: 5,
    temperature: 4,
    memorability: 4,
    notes: "Showpiece. Mom approved. Jamun interior too dense.",
    sort_order: 5,
  },
  {
    id: "td-f1-6",
    visit_id: "tv-foodlink-01",
    name: "Pav bhaji, butter pav",
    category: "main",
    appearance: 3,
    flavor: 4,
    portion: 5,
    temperature: 5,
    memorability: 4,
    notes: "Late-night vibe. Butter didn't hold back. Color was beige, needs red.",
    sort_order: 6,
  },

  // Blue Elephant — visit 1
  {
    id: "td-b1-1",
    visit_id: "tv-blueelephant-01",
    name: "Satvik thali (full)",
    category: "main",
    appearance: 5,
    flavor: 5,
    portion: 5,
    temperature: 5,
    memorability: 5,
    notes:
      "Kadhi was the revelation — yogurt 3 days old, fenugreek leaves fresh, no hing. 12 items on the leaf and every one earned its place.",
    sort_order: 1,
  },
  {
    id: "td-b1-2",
    visit_id: "tv-blueelephant-01",
    name: "Mohanthal",
    category: "dessert",
    appearance: 4,
    flavor: 5,
    portion: 3,
    temperature: 3,
    memorability: 5,
    notes: "Grainy in the way it should be. Saffron was real — not color.",
    sort_order: 2,
  },
  {
    id: "td-b1-3",
    visit_id: "tv-blueelephant-01",
    name: "Appam + vegetable stew",
    category: "main",
    appearance: 4,
    flavor: 4,
    portion: 4,
    temperature: 4,
    memorability: 3,
    notes: "Appam fermentation clean. Stew mild — needs a heat option for haldi crowd.",
    sort_order: 3,
  },
  {
    id: "td-b1-4",
    visit_id: "tv-blueelephant-01",
    name: "Awadhi mutton kebab",
    category: "passed_app",
    appearance: 4,
    flavor: 3,
    portion: 3,
    temperature: 4,
    memorability: 2,
    notes: "One-dimensional. Spice was there, depth wasn't. Their range shows limits here.",
    sort_order: 4,
  },
  {
    id: "td-b1-5",
    visit_id: "tv-blueelephant-01",
    name: "Paal payasam",
    category: "dessert",
    appearance: 3,
    flavor: 5,
    portion: 4,
    temperature: 4,
    memorability: 5,
    notes: "Grandmother-approved. 45-min slow-cooked. This is their haldi move.",
    sort_order: 5,
  },

  // Foodlink — visit 2
  {
    id: "td-f2-1",
    visit_id: "tv-foodlink-02",
    name: "Chilean sea bass, coconut-curry nage",
    category: "main",
    appearance: 5,
    flavor: 5,
    portion: 4,
    temperature: 5,
    memorability: 5,
    notes: "New for reception. Fish clean, nage restrained. Plating restaurant-caliber.",
    sort_order: 1,
  },
  {
    id: "td-f2-2",
    visit_id: "tv-foodlink-02",
    name: "Burrata, heirloom tomato",
    category: "passed_app",
    appearance: 5,
    flavor: 4,
    portion: 3,
    temperature: 4,
    memorability: 3,
    notes: "Tomato was dead-perfect. Burrata serviceable, not exceptional.",
    sort_order: 2,
  },
  {
    id: "td-f2-3",
    visit_id: "tv-foodlink-02",
    name: "Saffron-pistachio kulfi terrine",
    category: "dessert",
    appearance: 5,
    flavor: 5,
    portion: 5,
    temperature: 5,
    memorability: 5,
    notes: "Reception-worthy. Silver leaf not gimmicky. Terrine held.",
    sort_order: 3,
  },
];

// ── Staffing (seed) ──────────────────────────────────────────────────────

export const SEED_STAFF_SLOTS: StaffSlot[] = [
  // Sangeet — 340 guests, passed service
  { id: "ss-s-1", event_id: "evt-sangeet", role: "server", count: 18, sort_order: 1 },
  { id: "ss-s-2", event_id: "evt-sangeet", role: "bartender", count: 3, sort_order: 2, notes: "Tight — standard is 1:75, we're at 1:113" },
  { id: "ss-s-3", event_id: "evt-sangeet", role: "captain", count: 4, sort_order: 3 },
  { id: "ss-s-4", event_id: "evt-sangeet", role: "chef", count: 6, sort_order: 4 },

  // Ceremony — 420, thali service
  { id: "ss-c-1", event_id: "evt-ceremony", role: "server", count: 28, sort_order: 1, notes: "Banana-leaf service is labor-intensive, over-staff" },
  { id: "ss-c-2", event_id: "evt-ceremony", role: "captain", count: 4, sort_order: 2 },
  { id: "ss-c-3", event_id: "evt-ceremony", role: "runner", count: 8, sort_order: 3 },

  // Reception — 420, plated
  { id: "ss-r-1", event_id: "evt-reception", role: "server", count: 30, sort_order: 1, notes: "Plated 1:15 = 28 minimum; going 30 for comfort" },
  { id: "ss-r-2", event_id: "evt-reception", role: "bartender", count: 6, sort_order: 2 },
  { id: "ss-r-3", event_id: "evt-reception", role: "captain", count: 5, sort_order: 3 },
  { id: "ss-r-4", event_id: "evt-reception", role: "chef", count: 8, sort_order: 4 },
];

// ── Rentals (seed) ───────────────────────────────────────────────────────

export const SEED_RENTAL_ITEMS: RentalItem[] = [
  { id: "ri-c-1", event_id: "evt-ceremony", name: "Brass thalis", category: "service", quantity: 450, unit: "each", covered_by: "separate", supplier: "Urban Events Rental", sort_order: 1 },
  { id: "ri-c-2", event_id: "evt-ceremony", name: "Banana leaves", category: "service", quantity: 450, unit: "each", covered_by: "caterer", sort_order: 2 },
  { id: "ri-c-3", event_id: "evt-ceremony", name: "Floor seating cushions", category: "furniture", quantity: 60, unit: "each", covered_by: "venue", sort_order: 3 },

  { id: "ri-r-1", event_id: "evt-reception", name: "Chinaware settings", category: "service", quantity: 420, unit: "pax", covered_by: "caterer", sort_order: 1 },
  { id: "ri-r-2", event_id: "evt-reception", name: "Champagne flutes", category: "glassware", quantity: 480, unit: "each", covered_by: "separate", sort_order: 2 },
  { id: "ri-r-3", event_id: "evt-reception", name: "Linen napkins, ivory", category: "linens", quantity: 450, unit: "each", covered_by: "venue", sort_order: 3 },
  { id: "ri-r-4", event_id: "evt-reception", name: "Portable bars", category: "bar", quantity: 3, unit: "each", covered_by: "separate", supplier: "Event Bars Co.", sort_order: 4 },

  { id: "ri-h-1", event_id: "evt-haldi", name: "Chafers (outdoor)", category: "service", quantity: 8, unit: "each", covered_by: "caterer", notes: "Add 2 backup chafers — outdoor wind risk.", sort_order: 1 },
  { id: "ri-h-2", event_id: "evt-haldi", name: "Kulhad cups", category: "glassware", quantity: 100, unit: "each", covered_by: "caterer", sort_order: 2 },
];

// ── Signature cocktails (seed) ───────────────────────────────────────────

export const SEED_SIGNATURE_COCKTAILS: SignatureCocktail[] = [
  {
    id: "sc-sangeet-1",
    event_id: "evt-sangeet",
    name: "Saffron-gin sour",
    ingredients: [
      "London dry gin, 60ml",
      "Saffron-honey syrup, 20ml",
      "Fresh lemon, 20ml",
      "Aquafaba (egg white alt), 15ml",
    ],
    garnish: "Three strands of saffron · crushed pistachio rim half",
    description:
      "Silky-foamed, floral, with a long saffron finish. Couple's signature — repeats on reception menu.",
    source: "manual",
    sort_order: 1,
  },
  {
    id: "sc-mehendi-1",
    event_id: "evt-mehendi",
    name: "Aam panna margarita",
    ingredients: [
      "Blanco tequila, 60ml",
      "Green-mango (aam) panna, 30ml",
      "Lime, 15ml",
      "Black salt + roasted cumin rim",
    ],
    garnish: "Lime wheel, dusting of kala namak",
    description:
      "Tart, earthy, built for an outdoor summer tent — drinks itself at 32°C.",
    source: "manual",
    sort_order: 1,
  },
];

// ══════════════════════════════════════════════════════════════════════════
//   Collaboration overlays
// ══════════════════════════════════════════════════════════════════════════
// Attribution + state + reactions + comments + open questions + leans +
// presence. Applied as an overlay so the curated seed above stays
// readable. When the store boots, dishes/proposals/staff/rentals are
// enriched via the overrides map below; the new collaboration arrays
// (reactions, comments, etc.) are exported directly.

const FOODLINK_ID = "ven-cat-01";
const BLUEELEPHANT_ID = "ven-cat-02";

// ── Dish overrides: attribution + state ──────────────────────────────────

const DISH_OVERRIDES: Record<
  string,
  { added_by?: string; state?: Dish["state"] }
> = {
  // Haldi — mostly approved
  "d-haldi-1": { added_by: PRIYA_ID, state: "approved" },
  "d-haldi-2": { added_by: URVASHI_ID, state: "approved" },
  "d-haldi-3": { added_by: URVASHI_ID, state: "approved" },
  "d-haldi-4": { added_by: BLUEELEPHANT_ID, state: "approved" },

  // Mehendi — vendor just proposed the paneer tikka, couple hasn't reacted
  "d-mehendi-1": { added_by: ARJUN_ID, state: "approved" },
  "d-mehendi-2": { added_by: PRIYA_ID, state: "approved" },
  "d-mehendi-3": { added_by: URVASHI_ID, state: "approved" },
  "d-mehendi-4": { added_by: FOODLINK_ID, state: "vendor_proposed" },
  "d-mehendi-5": { added_by: URVASHI_ID, state: "approved" },

  // Sangeet — the Lucknowi biryani is in debate
  "d-sangeet-1": { added_by: PRIYA_ID, state: "approved" },
  "d-sangeet-2": { added_by: URVASHI_ID, state: "approved" },
  "d-sangeet-3": { added_by: FOODLINK_ID, state: "approved" },
  "d-sangeet-4": { added_by: FOODLINK_ID, state: "approved" },
  "d-sangeet-5": { added_by: ARJUN_ID, state: "in_debate" },
  "d-sangeet-6": { added_by: PRIYA_ID, state: "approved" },

  // Ceremony
  "d-ceremony-1": { added_by: URVASHI_ID, state: "approved" },
  "d-ceremony-2": { added_by: BLUEELEPHANT_ID, state: "approved" },

  // Reception — scallop crudo in debate, burrata newly proposed by vendor
  "d-reception-1": { added_by: PRIYA_ID, state: "approved" },
  "d-reception-2": { added_by: ARJUN_ID, state: "in_debate" },
  "d-reception-3": { added_by: FOODLINK_ID, state: "vendor_proposed" },
  "d-reception-4": { added_by: FOODLINK_ID, state: "approved" },
  "d-reception-5": { added_by: URVASHI_ID, state: "approved" },
  "d-reception-6": { added_by: PRIYA_ID, state: "approved" },
};

const PROPOSAL_OVERRIDES: Record<string, { added_by?: string }> = {
  "prop-foodlink-reception": { added_by: URVASHI_ID },
  "prop-foodlink-sangeet": { added_by: URVASHI_ID },
  "prop-foodlink-haldi": { added_by: URVASHI_ID },
  "prop-blueelephant-ceremony": { added_by: URVASHI_ID },
  "prop-blueelephant-haldi": { added_by: URVASHI_ID },
  "prop-blueelephant-reception": { added_by: URVASHI_ID },
};

const STAFF_OVERRIDES: Record<
  string,
  { added_by?: string; state?: Dish["state"] }
> = {
  "ss-s-1": { added_by: URVASHI_ID, state: "approved" },
  "ss-s-2": { added_by: URVASHI_ID, state: "draft" },
  "ss-s-3": { added_by: URVASHI_ID, state: "approved" },
  "ss-s-4": { added_by: FOODLINK_ID, state: "vendor_proposed" },
  "ss-c-1": { added_by: URVASHI_ID, state: "approved" },
  "ss-c-2": { added_by: URVASHI_ID, state: "approved" },
  "ss-c-3": { added_by: BLUEELEPHANT_ID, state: "vendor_proposed" },
  "ss-r-1": { added_by: URVASHI_ID, state: "approved" },
  "ss-r-2": { added_by: URVASHI_ID, state: "approved" },
  "ss-r-3": { added_by: URVASHI_ID, state: "approved" },
  "ss-r-4": { added_by: FOODLINK_ID, state: "vendor_proposed" },
};

const RENTAL_OVERRIDES: Record<
  string,
  { added_by?: string; state?: Dish["state"] }
> = {
  "ri-c-1": { added_by: URVASHI_ID, state: "approved" },
  "ri-c-2": { added_by: BLUEELEPHANT_ID, state: "approved" },
  "ri-c-3": { added_by: URVASHI_ID, state: "approved" },
  "ri-r-1": { added_by: FOODLINK_ID, state: "approved" },
  "ri-r-2": { added_by: URVASHI_ID, state: "draft" },
  "ri-r-3": { added_by: URVASHI_ID, state: "approved" },
  "ri-r-4": { added_by: URVASHI_ID, state: "draft" },
  "ri-h-1": { added_by: BLUEELEPHANT_ID, state: "vendor_proposed" },
  "ri-h-2": { added_by: BLUEELEPHANT_ID, state: "approved" },
};

// Apply overrides in-place. Safe because these constants haven't been
// consumed yet at module-init time.
for (const d of SEED_DISHES) {
  const o = DISH_OVERRIDES[d.id];
  if (o) Object.assign(d, o);
  else {
    // Default everything else to planner-owned + approved so the UI has
    // something to render without crashes.
    d.added_by = d.added_by ?? URVASHI_ID;
    d.state = d.state ?? "approved";
  }
}
for (const p of SEED_CATERER_PROPOSALS) {
  const o = PROPOSAL_OVERRIDES[p.id];
  if (o) Object.assign(p, o);
  else p.added_by = p.added_by ?? URVASHI_ID;
}
for (const s of SEED_STAFF_SLOTS) {
  const o = STAFF_OVERRIDES[s.id];
  if (o) Object.assign(s, o);
  else {
    s.added_by = s.added_by ?? URVASHI_ID;
    s.state = s.state ?? "approved";
  }
}
for (const r of SEED_RENTAL_ITEMS) {
  const o = RENTAL_OVERRIDES[r.id];
  if (o) Object.assign(r, o);
  else {
    r.added_by = r.added_by ?? URVASHI_ID;
    r.state = r.state ?? "approved";
  }
}

// ── Reactions (seed) ─────────────────────────────────────────────────────
// Planted to make the "In debate" / "Vendor suggested" lanes actually
// populated from first paint. IDs are stable strings so the store can
// use them as initial data without generating.

const now = new Date().toISOString();
const hoursAgo = (h: number) => new Date(Date.now() - h * 3600_000).toISOString();

export const SEED_REACTIONS: Reaction[] = [
  // Sangeet biryani — in debate
  {
    id: "rx-biryani-priya",
    entity_id: "d-sangeet-5",
    entity_kind: "dish",
    party_id: PRIYA_ID,
    kind: "up",
    created_at: hoursAgo(30),
  },
  {
    id: "rx-biryani-arjun",
    entity_id: "d-sangeet-5",
    entity_kind: "dish",
    party_id: ARJUN_ID,
    kind: "question",
    comment: "We already have galouti on the apps — two lamb dishes feels heavy.",
    created_at: hoursAgo(28),
  },
  {
    id: "rx-biryani-urvashi",
    entity_id: "d-sangeet-5",
    entity_kind: "dish",
    party_id: URVASHI_ID,
    kind: "up",
    comment: "Biryani is the crowd-please main. Galouti reads as a bite, not a protein.",
    created_at: hoursAgo(26),
  },

  // Reception scallop crudo — in debate
  {
    id: "rx-crudo-priya",
    entity_id: "d-reception-2",
    entity_kind: "dish",
    party_id: PRIYA_ID,
    kind: "up",
    created_at: hoursAgo(48),
  },
  {
    id: "rx-crudo-arjun",
    entity_id: "d-reception-2",
    entity_kind: "dish",
    party_id: ARJUN_ID,
    kind: "down",
    comment: "Raw seafood at a 420-person reception makes me nervous.",
    created_at: hoursAgo(44),
  },
  {
    id: "rx-crudo-urvashi",
    entity_id: "d-reception-2",
    entity_kind: "dish",
    party_id: URVASHI_ID,
    kind: "question",
    comment: "Need a Plan B if Hokkaido sourcing slips in June.",
    created_at: hoursAgo(40),
  },
];

// ── Comments (seed) ──────────────────────────────────────────────────────

export const SEED_COMMENTS: Comment[] = [
  {
    id: "cm-crudo-1",
    entity_id: "d-reception-2",
    entity_kind: "dish",
    party_id: URVASHI_ID,
    body: "Asked Foodlink for a frozen-scallop alt sourced from Tsukiji. Will post when they reply.",
    created_at: hoursAgo(20),
  },
  {
    id: "cm-crudo-2",
    entity_id: "d-reception-2",
    entity_kind: "dish",
    party_id: PRIYA_ID,
    body: "If we swap, let's still keep one-bite format. The yuzu kosho does a lot of work.",
    created_at: hoursAgo(8),
  },
  {
    id: "cm-biryani-1",
    entity_id: "d-sangeet-5",
    entity_kind: "dish",
    party_id: ARJUN_ID,
    body: "What if we did a mini chicken-seekh kebab instead of the galouti — keeps the non-veg but lighter?",
    created_at: hoursAgo(6),
  },
];

// ── Open questions (seed) ────────────────────────────────────────────────

export const SEED_OPEN_QUESTIONS: OpenQuestion[] = [
  {
    id: "q-nutfree",
    wedding_id: DEMO_WEDDING_ID,
    entity_kind: "caterer",
    entity_id: FOODLINK_ID,
    raised_by: URVASHI_ID,
    for_party: FOODLINK_ID,
    body: "Can you run a dedicated nut-free passed-app station at Sangeet? 8 nut-allergy guests, risk is real.",
    created_at: hoursAgo(50),
  },
  {
    id: "q-seabass",
    wedding_id: DEMO_WEDDING_ID,
    entity_kind: "dish",
    entity_id: "d-reception-4",
    raised_by: ARJUN_ID,
    for_party: FOODLINK_ID,
    body: "Chilean sea bass in June — fresh or frozen? If frozen, what's your defrost window?",
    created_at: hoursAgo(22),
  },
  {
    id: "q-blueelephant-scale",
    wedding_id: DEMO_WEDDING_ID,
    entity_kind: "caterer",
    entity_id: BLUEELEPHANT_ID,
    raised_by: URVASHI_ID,
    for_party: BLUEELEPHANT_ID,
    body: "Can you scale to 350 if we hybrid Ceremony + Reception into one seated dinner?",
    created_at: hoursAgo(96),
    answered_at: hoursAgo(72),
    answer: "350 is our ceiling. Beyond that, plating discipline drops.",
    answered_by: BLUEELEPHANT_ID,
  },
];

// ── Party leans (seed) ───────────────────────────────────────────────────

export const SEED_PARTY_LEANS: PartyLean[] = [
  // Foodlink — scale play for reception + sangeet
  { id: "pl-1", wedding_id: DEMO_WEDDING_ID, party_id: PRIYA_ID,   caterer_id: FOODLINK_ID, lean: "lean",      updated_at: hoursAgo(48) },
  { id: "pl-2", wedding_id: DEMO_WEDDING_ID, party_id: ARJUN_ID,   caterer_id: FOODLINK_ID, lean: "undecided", note: "Impressed by tasting, worried about the seafood sourcing.", updated_at: hoursAgo(24) },
  { id: "pl-3", wedding_id: DEMO_WEDDING_ID, party_id: URVASHI_ID, caterer_id: FOODLINK_ID, lean: "lean", note: "Right fit for 420-person reception — scale + captain coverage.", updated_at: hoursAgo(72) },
  // Blue Elephant — ceremony/haldi heritage play
  { id: "pl-4", wedding_id: DEMO_WEDDING_ID, party_id: PRIYA_ID,   caterer_id: BLUEELEPHANT_ID, lean: "lean", note: "The thali was the best meal of either tasting.", updated_at: hoursAgo(48) },
  { id: "pl-5", wedding_id: DEMO_WEDDING_ID, party_id: ARJUN_ID,   caterer_id: BLUEELEPHANT_ID, lean: "lean",      updated_at: hoursAgo(24) },
  { id: "pl-6", wedding_id: DEMO_WEDDING_ID, party_id: URVASHI_ID, caterer_id: BLUEELEPHANT_ID, lean: "lean", note: "Obvious pick for ceremony. Their jain-kitchen isolation is unique.", updated_at: hoursAgo(72) },
];

// ── Upcoming tastings (seed) ─────────────────────────────────────────────

export const SEED_UPCOMING_TASTINGS: UpcomingTasting[] = [
  {
    id: "ut-blueelephant-02",
    wedding_id: DEMO_WEDDING_ID,
    caterer_id: BLUEELEPHANT_ID,
    scheduled_for: "2026-05-02",
    location: "Blue Elephant, Sultanpur (Delhi)",
    attendees: [PRIYA_ID, ARJUN_ID, URVASHI_ID],
    prep_questions: [
      { id: "pq1", body: "Can they run a dedicated jain section live during ceremony lunch?", resolved: false },
      { id: "pq2", body: "Mohanthal consistency — last tasting it was perfect; confirm same chef on wedding day.", resolved: true },
      { id: "pq3", body: "Their stand on labeling allergens per-thali at service?", resolved: false },
    ],
    dishes_to_request: ["Jain kadhi", "Satvik aloo-tamatar", "Mohanthal (smaller portion)", "Appam with spicier stew variation"],
    dietary_constraints_to_test: ["Jain (no onion/garlic/root)", "Nut-free (cross-prep)"],
    created_at: hoursAgo(120),
  },
];

// ── Attendee ratings (seed) ──────────────────────────────────────────────
// Per-party ratings on a subset of tasting dishes. The rest fall through
// to the single-rating fields on TastingDish.

export const SEED_ATTENDEE_RATINGS: AttendeeRating[] = [
  // Foodlink visit 1 — galouti kebab (everyone loved)
  { id: "ar-1", tasting_dish_id: "td-f1-2", party_id: PRIYA_ID,   appearance: 5, flavor: 5, memorability: 5, note: "This is the bite we talk about for months." },
  { id: "ar-2", tasting_dish_id: "td-f1-2", party_id: ARJUN_ID,   appearance: 5, flavor: 5, memorability: 5, note: "Sheermal real, not a prop. Notable." },
  { id: "ar-3", tasting_dish_id: "td-f1-2", party_id: URVASHI_ID, appearance: 5, flavor: 5, memorability: 5, note: "Best single bite of any tasting this year." },

  // Foodlink visit 1 — biryani (mixed memorability)
  { id: "ar-4", tasting_dish_id: "td-f1-4", party_id: PRIYA_ID,   flavor: 4, memorability: 4, note: "Aromatic. Chicken leg a touch dry." },
  { id: "ar-5", tasting_dish_id: "td-f1-4", party_id: ARJUN_ID,   flavor: 4, memorability: 3, note: "Fine. Not memorable." },
  { id: "ar-6", tasting_dish_id: "td-f1-4", party_id: URVASHI_ID, flavor: 4, memorability: 4, note: "Textbook Lucknowi, which is what the brief called for." },

  // Blue Elephant visit 1 — thali (Priya's favorite)
  { id: "ar-7", tasting_dish_id: "td-b1-1", party_id: PRIYA_ID,   appearance: 5, flavor: 5, memorability: 5, note: "The kadhi. I'm still thinking about it." },
  { id: "ar-8", tasting_dish_id: "td-b1-1", party_id: ARJUN_ID,   appearance: 5, flavor: 5, memorability: 4, note: "Nostalgic in the right way." },
  { id: "ar-9", tasting_dish_id: "td-b1-1", party_id: URVASHI_ID, appearance: 5, flavor: 5, memorability: 5, note: "Obvious pick for ceremony lunch." },

  // Blue Elephant visit 1 — awadhi kebab (miss)
  { id: "ar-10", tasting_dish_id: "td-b1-4", party_id: PRIYA_ID,   flavor: 3, memorability: 2, note: "Didn't stick with me." },
  { id: "ar-11", tasting_dish_id: "td-b1-4", party_id: ARJUN_ID,   flavor: 3, memorability: 2, note: "Spice present, depth absent." },
  { id: "ar-12", tasting_dish_id: "td-b1-4", party_id: URVASHI_ID, flavor: 3, memorability: 2, note: "Their weak spot. Skip for Sangeet apps." },
];

// ── Presence (seed) ──────────────────────────────────────────────────────

export const SEED_PRESENCE: PresenceSignal[] = [
  { party_id: PRIYA_ID,   last_seen_at: hoursAgo(2),  last_action: "viewed Menu Studio" },
  { party_id: ARJUN_ID,   last_seen_at: hoursAgo(18), last_action: "commented on Scallop crudo" },
  { party_id: URVASHI_ID, last_seen_at: now,          last_action: "online now" },
  { party_id: FOODLINK_ID,     last_seen_at: hoursAgo(4),   last_action: "replied to open question" },
  { party_id: BLUEELEPHANT_ID, last_seen_at: hoursAgo(120), last_action: "submitted ceremony proposal" },
];
