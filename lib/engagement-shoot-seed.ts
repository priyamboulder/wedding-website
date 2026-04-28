// ── Engagement Shoot seed ──────────────────────────────────────────────────
// Pre-filled state that loads the couple into a believable working draft —
// Priya & Arjun, leaning "cultural + editorial" with a Jaipur destination
// weekend and three looks. The canvas should never show empty unless reset().

import type {
  EngagementShootState,
  Look,
  MoodBoardPin,
  ReferenceHeart,
  RunSheetEntry,
  ShootLocation,
  ShotListItem,
  TripDay,
  TripDayItem,
  TripLogistic,
  EmergencyKitItem,
  WeatherContingency,
} from "@/types/engagement-shoot";

// ── Reference heart grid (Phase 1 · visual selection) ──────────────────────

export const DEFAULT_REFERENCES: ReferenceHeart[] = [
  {
    id: "ref_golden_walk",
    imageUrl: "/images/portfolio/pre-wedding/pre-01.jpg",
    caption: "Walking at golden hour, backlit",
    tags: ["golden_hour", "movement", "warm"],
    hearted: false,
  },
  {
    id: "ref_fort_sunrise",
    imageUrl: "/images/portfolio/wedding/wedding-01.jpg",
    caption: "Sandstone fort at sunrise, lehenga",
    tags: ["cultural", "heritage", "warm", "editorial"],
    hearted: false,
  },
  {
    id: "ref_rooftop_city",
    imageUrl: "/images/portfolio/portrait/portrait-01.jpg",
    caption: "Rooftop at blue hour, skyline",
    tags: ["urban", "moody", "city"],
    hearted: false,
  },
  {
    id: "ref_forehead_touch",
    imageUrl: "/images/portfolio/portrait/portrait-02.jpg",
    caption: "Forehead touch, close-up, soft light",
    tags: ["intimate", "detail", "soft_light"],
    hearted: false,
  },
  {
    id: "ref_patrika_gate",
    imageUrl: "/images/portfolio/best/best-01.jpg",
    caption: "Pink archway, jewel-tone outfits",
    tags: ["architecture", "color", "cultural"],
    hearted: false,
  },
  {
    id: "ref_desert_dunes",
    imageUrl: "/images/portfolio/pre-wedding/pre-02.jpg",
    caption: "Desert dunes, flowing fabric",
    tags: ["adventure", "landscape", "warm"],
    hearted: false,
  },
  {
    id: "ref_ring_detail",
    imageUrl: "/images/portfolio/mehendi/mehendi-01.jpg",
    caption: "Ring on hand, mehendi detail",
    tags: ["detail", "jewelry", "cultural"],
    hearted: false,
  },
  {
    id: "ref_laugh_candid",
    imageUrl: "/images/portfolio/sangeet/sangeet-01.jpg",
    caption: "Candid laugh, unposed",
    tags: ["candid", "movement", "effortless"],
    hearted: false,
  },
  {
    id: "ref_stairs_editorial",
    imageUrl: "/images/portfolio/best/best-02.jpg",
    caption: "Architectural stairs, fashion frame",
    tags: ["editorial", "architecture", "posed"],
    hearted: false,
  },
  {
    id: "ref_florals_dreamy",
    imageUrl: "/images/portfolio/best/best-03.jpg",
    caption: "Floral arch, painterly",
    tags: ["romantic", "florals", "soft"],
    hearted: false,
  },
  {
    id: "ref_lehenga_twirl",
    imageUrl: "/images/portfolio/mehendi/mehendi-02.jpg",
    caption: "Lehenga twirl, fabric movement",
    tags: ["cultural", "movement", "traditional"],
    hearted: false,
  },
  {
    id: "ref_vintage_film",
    imageUrl: "/images/portfolio/portrait/portrait-03.jpg",
    caption: "Film grain, vintage styling",
    tags: ["vintage", "film", "timeless"],
    hearted: false,
  },
  {
    id: "ref_stepwell",
    imageUrl: "/images/portfolio/best/best-04.jpg",
    caption: "Stepwell geometry, symmetry",
    tags: ["architecture", "heritage", "editorial"],
    hearted: false,
  },
  {
    id: "ref_bazaar_dusk",
    imageUrl: "/images/portfolio/pre-wedding/pre-03.jpg",
    caption: "Bazaar at dusk, warm lanterns",
    tags: ["urban", "warm", "cultural"],
    hearted: false,
  },
  {
    id: "ref_water_reflection",
    imageUrl: "/images/portfolio/portrait/portrait-04.jpg",
    caption: "Lake reflection, saree pallu",
    tags: ["landscape", "cultural", "soft"],
    hearted: false,
  },
  {
    id: "ref_suit_portrait",
    imageUrl: "/images/portfolio/portrait/portrait-05.jpg",
    caption: "Tailored suit, contemporary portrait",
    tags: ["editorial", "formal", "clean"],
    hearted: false,
  },
];

// ── Mood board pins (Phase 2) ──────────────────────────────────────────────

const DEFAULT_MOOD_PINS: MoodBoardPin[] = [
  {
    id: "pin_light_1",
    imageUrl: "/images/portfolio/wedding/wedding-01.jpg",
    caption: "Sandstone + sunrise — warmest 15 minutes",
    section: "lighting_mood",
  },
  {
    id: "pin_light_2",
    imageUrl: "/images/portfolio/best/best-03.jpg",
    caption: "Soft overcast diffusion for close-ups",
    section: "lighting_mood",
  },
  {
    id: "pin_pose_1",
    imageUrl: "/images/portfolio/sangeet/sangeet-01.jpg",
    caption: "Walking, laughing — 70-200mm from distance",
    section: "posing_interaction",
  },
  {
    id: "pin_pose_2",
    imageUrl: "/images/portfolio/portrait/portrait-02.jpg",
    caption: "Forehead touch, eyes closed — intimate frame",
    section: "posing_interaction",
  },
  {
    id: "pin_set_1",
    imageUrl: "/images/portfolio/best/best-01.jpg",
    caption: "Pink architecture against emerald + gold",
    section: "setting_backdrop",
  },
  {
    id: "pin_set_2",
    imageUrl: "/images/portfolio/best/best-04.jpg",
    caption: "Geometric stepwell — editorial symmetry",
    section: "setting_backdrop",
  },
  {
    id: "pin_detail_1",
    imageUrl: "/images/portfolio/mehendi/mehendi-01.jpg",
    caption: "Ring + mehendi — macro lens close-up",
    section: "detail_shots",
  },
  {
    id: "pin_detail_2",
    imageUrl: "/images/portfolio/mehendi/mehendi-02.jpg",
    caption: "Zardozi embroidery + dupatta movement",
    section: "detail_shots",
  },
];

const DEFAULT_SHOTS: ShotListItem[] = [
  {
    id: "shot_walking",
    title: "Walking together — from behind, toward camera",
    category: "couple",
    priority: "must",
    done: false,
  },
  {
    id: "shot_laugh",
    title: "Genuine laugh, mid-conversation",
    category: "must_have",
    priority: "must",
    done: false,
  },
  {
    id: "shot_forehead",
    title: "Forehead touch / almost-kiss",
    category: "couple",
    priority: "must",
    done: false,
  },
  {
    id: "shot_lookback",
    title: "The look-back — one ahead, one turning",
    category: "couple",
    priority: "preferred",
    done: false,
  },
  {
    id: "shot_ring",
    title: "Ring detail shot",
    category: "detail",
    priority: "must",
    done: false,
  },
  {
    id: "shot_fullbody",
    title: "Full-length outfit reveal (per look)",
    category: "per_look",
    priority: "must",
    done: false,
  },
  {
    id: "shot_portrait",
    title: "Individual portrait, both partners",
    category: "couple",
    priority: "preferred",
    done: false,
  },
  {
    id: "shot_twirl",
    title: "Lehenga twirl — fabric in motion",
    category: "cultural",
    priority: "must",
    done: false,
  },
  {
    id: "shot_jewelry",
    title: "Jewelry + mehendi macro detail",
    category: "cultural",
    priority: "preferred",
    done: false,
    note: "Kundan close-up on hand",
  },
  {
    id: "shot_std_vertical",
    title: "Save-the-date frame, vertical, negative-space right",
    category: "save_the_date",
    priority: "must",
    done: false,
    note: "Leave room for date + names overlay",
  },
  {
    id: "shot_std_horizontal",
    title: "Save-the-date frame, horizontal, small-scale legible",
    category: "save_the_date",
    priority: "preferred",
    done: false,
  },
  {
    id: "shot_environment",
    title: "Wide environment frame showing the setting",
    category: "environment",
    priority: "preferred",
    done: false,
  },
];

// ── Phase 3 · Outfits (two partners, three looks) ──────────────────────────

const DEFAULT_LOOKS: Look[] = [
  {
    id: "look_casual",
    index: 1,
    name: "The Casual Us",
    concept:
      "Elevated everyday — walking the bazaar, catching chai, the warm-up look. Earth tones, no heels, nothing stiff.",
    style: "western_casual",
    partner1Direction:
      "Flowing midi dress in rust or terracotta, slim belt, ankle boots. Hair down with loose waves. Minimal jewelry — a couple of thin gold hoops.",
    partner2Direction:
      "Dark denim, cream knit or Henley, brown leather boots. Jacket slung over shoulder for movement shots. Tan leather watch.",
    coordination: {
      colorP1: "Rust / terracotta",
      colorP2: "Cream / tan",
      formality: "casual",
      notes: "Both in warm earth tones — no exact match, complementary.",
    },
    hairMakeupNote:
      "Loose waves, fresh natural makeup, nude-to-warm lip. Optional HMUA for this look.",
    locationSlotId: "loc_bazaar",
    estimatedMinutes: 60,
  },
  {
    id: "look_heritage",
    index: 2,
    name: "The Heritage Look",
    concept:
      "The traditional hero look. Rich jewel tones, heavy jewelry, the frame that goes on the wall. Planned for the coolest window so the lehenga survives the heat.",
    style: "south_asian_traditional",
    partner1Direction:
      "Emerald green lehenga with gold zardozi, flared A-line for movement, matching dupatta draped on one shoulder. Kundan choker, jhumkas, maang tikka. Minimal bracelet so hands stay free for posing.",
    partner2Direction:
      "Ivory raw-silk sherwani with subtle gold embroidery — complementary, not matching emerald. Brown mojris, a single pocket square in emerald to tie the look together.",
    coordination: {
      colorP1: "Emerald + gold",
      colorP2: "Ivory + gold",
      formality: "traditional",
      notes:
        "Coordinated, not matching. Ivory + emerald reads like an intentional editorial palette.",
    },
    hairMakeupNote:
      "Low bun with gajra, defined eyes, bold lip. HMUA strongly recommended — kundan + maang tikka takes 30 minutes to pin.",
    locationSlotId: "loc_nahargarh",
    estimatedMinutes: 75,
  },
  {
    id: "look_editorial",
    index: 3,
    name: "The Editorial Moment",
    concept:
      "The magazine cover. Architectural backdrop, tailored silhouettes, drama over comfort. This is the golden-hour frame.",
    style: "editorial",
    partner1Direction:
      "Deep-maroon silk gown, dramatic silhouette with a trailing hem. Statement earrings, hair pulled back. Bold lip.",
    partner2Direction:
      "Charcoal or black tailored suit, no tie, open collar. Oxfords. Watch visible.",
    coordination: {
      colorP1: "Deep maroon",
      colorP2: "Charcoal",
      formality: "editorial",
      notes:
        "High contrast, clean — silhouettes do the work, no competing pattern.",
    },
    hairMakeupNote:
      "Sleek bun, contoured cheek, red-to-berry lip. HMUA refresh from Look 2 — 45 minutes.",
    locationSlotId: "loc_stepwell",
    estimatedMinutes: 60,
  },
];

// ── Phase 4 · Locations, days, logistics ───────────────────────────────────

const DEFAULT_LOCATIONS: ShootLocation[] = [
  {
    id: "loc_nahargarh",
    name: "Nahargarh Fort, Jaipur",
    address: "Krishna Nagar, Brahampuri, Jaipur",
    imageUrl: "/images/portfolio/wedding/wedding-01.jpg",
    whyItWorks:
      "Warm sandstone walls complement emerald + gold. Terraced architecture gives natural leading lines. Empty at 6am.",
    bestTime: "Sunrise — 6:00–7:30am",
    permitNote:
      "Photography permit recommended (~₹1,000, 3–5 days to process). Photographer can handle.",
    logistics:
      "20 min drive from city. Parking at main gate. Changing at hotel — no restrooms onsite.",
    orderIndex: 0,
  },
  {
    id: "loc_bazaar",
    name: "Old City bazaar walk",
    address: "Johari Bazaar, Jaipur",
    imageUrl: "/images/portfolio/pre-wedding/pre-03.jpg",
    whyItWorks:
      "Warm lanterns + pink walls at dusk. Candid walking shots, chai stall detail frames.",
    bestTime: "Evening — 5:30–6:30pm",
    permitNote: "No permit needed. Tip shopkeepers if they appear in frame.",
    logistics:
      "Walking distance from most heritage hotels. Casual outfits — easy changing.",
    orderIndex: 1,
  },
  {
    id: "loc_stepwell",
    name: "Panna Meena ka Kund (stepwell)",
    address: "Amer, Jaipur",
    imageUrl: "/images/portfolio/best/best-04.jpg",
    whyItWorks:
      "Geometric symmetry — the frame photographers dream about. Perfect for editorial silhouettes.",
    bestTime: "Late afternoon — 4:30–6:00pm",
    permitNote:
      "Free entry. Gets busy after 4pm — arrive earlier for exclusive access.",
    logistics:
      "25 min from city. Uneven stone steps — no heels. Privacy screen for outfit change.",
    orderIndex: 2,
  },
];

const DEFAULT_DAYS: TripDay[] = [
  {
    id: "day_fri",
    label: "Friday — Arrive & Settle In",
    date: "2026-10-09",
    summary:
      "Land Jaipur, check into Samode Haveli, dinner at Bar Palladio, scout tomorrow's locations at dusk.",
    orderIndex: 0,
  },
  {
    id: "day_sat",
    label: "Saturday — Shoot Day",
    date: "2026-10-10",
    summary:
      "Sunrise fort shoot, bazaar lunch break, stepwell golden hour, celebration dinner at 1135 AD.",
    orderIndex: 1,
  },
  {
    id: "day_sun",
    label: "Sunday — Relax & Fly Home",
    date: "2026-10-11",
    summary:
      "Slow breakfast, block-printing workshop (optional), pool before flight.",
    orderIndex: 2,
  },
];

const DEFAULT_DAY_ITEMS: TripDayItem[] = [
  {
    id: "di_fri_arrive",
    dayId: "day_fri",
    time: "3:00 PM",
    title: "Check in — Samode Haveli",
    detail: "Intimate heritage property. Rooms open onto a courtyard.",
    kind: "travel",
  },
  {
    id: "di_fri_dinner",
    dayId: "day_fri",
    time: "8:00 PM",
    title: "Dinner — Bar Palladio",
    detail: "Blue-and-white interiors worth seeing even if you don't shoot here.",
    kind: "meal",
  },
  {
    id: "di_fri_scout",
    dayId: "day_fri",
    time: "10:00 PM",
    title: "Bazaar walk + location scout",
    detail: "Low-key recce of tomorrow's shoot sites at lantern light.",
    kind: "experience",
  },
  {
    id: "di_sat_sunrise",
    dayId: "day_sat",
    time: "6:00 AM",
    title: "Nahargarh sunrise — heritage look",
    detail: "90 min. Fort + lehenga / sherwani. Coolest light of the day.",
    kind: "shoot",
  },
  {
    id: "di_sat_brunch",
    dayId: "day_sat",
    time: "10:30 AM",
    title: "Brunch + rest",
    detail:
      "Non-negotiable. Sit, eat, hydrate. Don't power through 3 looks without this.",
    kind: "rest",
  },
  {
    id: "di_sat_bazaar",
    dayId: "day_sat",
    time: "5:30 PM",
    title: "Bazaar walk — casual look",
    detail: "Candid, walking, chai detail frames. 60 min.",
    kind: "shoot",
  },
  {
    id: "di_sat_stepwell",
    dayId: "day_sat",
    time: "4:30 PM",
    title: "Stepwell — editorial look",
    detail: "Golden hour, architectural. 60 min.",
    kind: "shoot",
  },
  {
    id: "di_sat_dinner",
    dayId: "day_sat",
    time: "8:00 PM",
    title: "Celebration dinner — 1135 AD",
    detail: "Amer Fort. You earned it.",
    kind: "meal",
  },
  {
    id: "di_sun_breakfast",
    dayId: "day_sun",
    time: "10:00 AM",
    title: "Slow breakfast on the terrace",
    detail: "No timeline. Coffee, reviewing shots on the photographer's laptop.",
    kind: "rest",
  },
  {
    id: "di_sun_workshop",
    dayId: "day_sun",
    time: "12:30 PM",
    title: "Block-printing workshop (optional)",
    detail: "Anokhi Museum — 90 minutes, walk-in.",
    kind: "experience",
  },
];

const DEFAULT_LOGISTICS: TripLogistic[] = [
  {
    id: "log_flight",
    label: "Flights — DEL → JAI return",
    kind: "flight",
    status: "booked",
    amountCents: 42000 * 100,
    note: "Fri arrival, Sun evening return.",
  },
  {
    id: "log_hotel",
    label: "Samode Haveli — 2 nights",
    kind: "hotel",
    status: "held",
    amountCents: 65000 * 100,
    note: "Deposit paid, balance on arrival.",
  },
  {
    id: "log_driver",
    label: "Private driver — 3 days",
    kind: "car",
    status: "researching",
    amountCents: 0,
    note: "Essential for location-hopping. Book through hotel.",
  },
  {
    id: "log_permit",
    label: "Nahargarh photography permit",
    kind: "other",
    status: "researching",
    amountCents: 1000 * 100,
    note: "Photographer to file — needs 3–5 days lead time.",
  },
];

// ── Phase 5 · Run Sheet ────────────────────────────────────────────────────

const DEFAULT_RUN_SHEET: RunSheetEntry[] = [
  {
    id: "rs_1",
    time: "4:30 AM",
    durationMinutes: 30,
    title: "Wake up, coffee",
    detail: "Don't check email. Hydrate. Quick stretch.",
    kind: "prep",
    lookId: null,
    locationId: null,
    orderIndex: 0,
  },
  {
    id: "rs_2",
    time: "5:00 AM",
    durationMinutes: 45,
    title: "Hair & makeup — Heritage look",
    detail:
      "Both partners in parallel where possible. Kundan + maang tikka pinning adds 20 min.",
    kind: "hmua",
    lookId: "look_heritage",
    locationId: null,
    orderIndex: 1,
  },
  {
    id: "rs_3",
    time: "5:45 AM",
    durationMinutes: 15,
    title: "Dress — lehenga + sherwani",
    detail:
      "Steam the outfit, pin the dupatta with help, jewelry last. Lint roller, double-sided tape.",
    kind: "dress",
    lookId: "look_heritage",
    locationId: null,
    orderIndex: 2,
  },
  {
    id: "rs_4",
    time: "6:00 AM",
    durationMinutes: 20,
    title: "Travel → Nahargarh Fort",
    detail: "Driver ready, kit packed, phone charged.",
    kind: "travel",
    lookId: null,
    locationId: "loc_nahargarh",
    orderIndex: 3,
  },
  {
    id: "rs_5",
    time: "6:30 AM",
    durationMinutes: 90,
    title: "Shoot — Nahargarh sunrise",
    detail:
      "First 30 min sunrise magic. Then soft morning. Wide + close-ups + twirl.",
    kind: "shoot",
    lookId: "look_heritage",
    locationId: "loc_nahargarh",
    orderIndex: 4,
  },
  {
    id: "rs_6",
    time: "8:30 AM",
    durationMinutes: 90,
    title: "Return, change, brunch",
    detail:
      "Out of heavy lehenga. Into comfortable. Real meal. This is non-negotiable.",
    kind: "meal",
    lookId: null,
    locationId: null,
    orderIndex: 5,
  },
  {
    id: "rs_7",
    time: "2:00 PM",
    durationMinutes: 60,
    title: "HMUA refresh — Editorial look",
    detail: "Full reset. Sleek bun, berry lip.",
    kind: "hmua",
    lookId: "look_editorial",
    locationId: null,
    orderIndex: 6,
  },
  {
    id: "rs_8",
    time: "4:30 PM",
    durationMinutes: 60,
    title: "Shoot — Stepwell editorial",
    detail: "Architectural frames first. Move to open for golden backlight.",
    kind: "shoot",
    lookId: "look_editorial",
    locationId: "loc_stepwell",
    orderIndex: 7,
  },
  {
    id: "rs_9",
    time: "5:30 PM",
    durationMinutes: 45,
    title: "Golden hour — protected window",
    detail:
      "The 45 minutes that produce the best photos. Photographer leads, trust them.",
    kind: "golden_hour",
    lookId: "look_editorial",
    locationId: "loc_stepwell",
    orderIndex: 8,
  },
  {
    id: "rs_10",
    time: "6:15 PM",
    durationMinutes: 30,
    title: "Change → casual look + bazaar",
    detail: "Easy casual frames as sun drops. Lantern light by 7.",
    kind: "shoot",
    lookId: "look_casual",
    locationId: "loc_bazaar",
    orderIndex: 9,
  },
  {
    id: "rs_11",
    time: "6:45 PM",
    durationMinutes: 15,
    title: "Wrap + hug photographer",
    detail: "Exhale. You did it.",
    kind: "wrap",
    lookId: null,
    locationId: null,
    orderIndex: 10,
  },
];

const DEFAULT_KIT: EmergencyKitItem[] = [
  { id: "k1", label: "Safety pins (gold + clear)", packed: false },
  { id: "k2", label: "Double-sided fashion tape", packed: false },
  { id: "k3", label: "Stain remover pen", packed: false },
  { id: "k4", label: "Lint roller", packed: false },
  { id: "k5", label: "Mini steamer", packed: false },
  { id: "k6", label: "Blotting papers", packed: false },
  { id: "k7", label: "Setting spray", packed: false },
  { id: "k8", label: "Lip color (matching each look)", packed: false },
  { id: "k9", label: "Bobby pins + hair ties", packed: false },
  { id: "k10", label: "Flats for walking between setups", packed: false },
  { id: "k11", label: "Snacks — protein + hydration", packed: false },
  { id: "k12", label: "Water bottle (2L)", packed: false },
  { id: "k13", label: "Phone charger + battery pack", packed: false },
  { id: "k14", label: "Touch-up kit pouch (combined)", packed: false },
];

const DEFAULT_CONTINGENCIES: WeatherContingency[] = [
  {
    trigger: "If it rains at Nahargarh",
    plan: "Move Look 2 to Samode Haveli courtyard arches. Push stepwell to Sunday morning if needed.",
  },
  {
    trigger: "If it's >95°F",
    plan: "Shrink heritage-look window to 60 min. Add a 20-min shade break. Hydration on rotation.",
  },
  {
    trigger: "If stepwell is crowded",
    plan: "Shoot from the higher corner first, then wait for a clear frame. Fallback: Amer Fort rear courtyard.",
  },
];

// ── Defaults ───────────────────────────────────────────────────────────────

export const DEFAULT_ENGAGEMENT_SHOOT: EngagementShootState = {
  vision: {
    energies: ["cultural", "editorial"],
    outfitCount: "three",
    culturalAttire: ["south_asian"],
    tripScope: "destination",
    destinationIdea: "Jaipur, India",
    localCity: "",
    shootDate: "2026-10-10",
    monthsBeforeWedding: 8,
    usedForSaveTheDates: true,
    photographyBudget: "3000_5000",
    travelBudget: "3000_5000",
    outfitBudget: "1500_3000",
    hmuaBudget: "500_1500",
    photographerStatus: "searching",
    photographerName: "",
    photographerPortfolio: "",
    completedAt: null,
  },
  references: DEFAULT_REFERENCES,
  moodBoard: {
    directionTitle: "Heritage Meets Editorial",
    directionParagraph:
      "Warm sandstone light, rich jewel tones, and a balance of cultural gravitas with fashion-forward framing. Movement over stillness for the candid frames; architectural symmetry for the editorial. The palette leans amber, emerald, and ivory against heritage backdrops. Your photographer should be confident directing movement (twirls, walks, look-backs) and have a sharp eye for symmetry and negative space.",
    paletteNote:
      "Amber · emerald · ivory · charcoal. Avoid pastels — the outfits are saturated, the backdrops are saturated, the photos should be too.",
    avoidNote:
      "Harsh midday sun, fluorescent interiors, small-pattern fabrics, logos.",
    photographerBrief:
      "Prioritize natural-light direction: sunrise at Nahargarh (warm sandstone + empty), late-afternoon stepwell (symmetry + golden backlight), dusk bazaar (lantern + candid). Mix 70-200mm compression for candid movement with architectural wides. Protect the 45-min golden window — no outfit changes during it.",
    pins: DEFAULT_MOOD_PINS,
    shots: DEFAULT_SHOTS,
  },
  looks: DEFAULT_LOOKS,
  outfitItems: [
    {
      id: "oi_1",
      lookId: "look_heritage",
      owner: "p1",
      category: "dress",
      title: "Sabyasachi emerald lehenga — rental",
      sourceUrl: "https://example.com/sabya-emerald",
      imageUrl: "",
      priceCents: 80000 * 100,
      status: "considering",
      note: "Need to confirm rental window covers shoot date.",
    },
    {
      id: "oi_2",
      lookId: "look_heritage",
      owner: "p2",
      category: "suit",
      title: "Ivory raw-silk sherwani — Manish Malhotra",
      sourceUrl: "https://example.com/mm-sherwani",
      imageUrl: "",
      priceCents: 120000 * 100,
      status: "ordered",
      note: "6-week tailoring — order by early Aug.",
    },
    {
      id: "oi_3",
      lookId: "look_casual",
      owner: "p1",
      category: "dress",
      title: "Rust midi — Reformation",
      sourceUrl: "https://example.com/ref-rust-midi",
      imageUrl: "",
      priceCents: 248 * 100,
      status: "arrived",
    },
    {
      id: "oi_4",
      lookId: "look_editorial",
      owner: "p1",
      category: "dress",
      title: "Deep maroon silk gown",
      sourceUrl: "",
      imageUrl: "",
      priceCents: 0,
      status: "considering",
      note: "Looking at custom tailor in Delhi.",
    },
  ],
  locations: DEFAULT_LOCATIONS,
  tripDays: DEFAULT_DAYS,
  tripItems: DEFAULT_DAY_ITEMS,
  logistics: DEFAULT_LOGISTICS,
  runSheet: DEFAULT_RUN_SHEET,
  emergencyKit: DEFAULT_KIT,
  contingencies: DEFAULT_CONTINGENCIES,
  sharedBoard: {
    shareEnabled: false,
    shareTitle: "Priya + Arjun · Engagement Shoot · Jaipur",
    shareRecipients: [],
    coverImageUrl: "/images/portfolio/wedding/wedding-01.jpg",
  },
};
