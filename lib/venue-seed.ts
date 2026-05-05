// ── Venue workspace seed ──────────────────────────────────────────────────
// Seeds every slice with plausible, opinionated content so the workspace
// never opens as an empty grid. Grounded in the Udaipur / Leela Palace
// fixture the rest of Ananya's seeds share.
//
// Everything that looks like "AI-curated" content here (directions,
// inspiration thumbnails, keyword chips, checklist templates) would come
// from DB config in production — keep it data-driven, not hardcoded copy.

import type {
  DiscoveryQuizState,
  InspirationImage,
  ShortlistVenue,
  SiteVisit,
  SpaceEventPairing,
  TransitionNote,
  VenueDirection,
  VenueDiscovery,
  VenueDocument,
  VenueLogistics,
  VenueProfile,
  VenueRequirement,
  VenueSpace,
  VenueSuggestion,
} from "@/types/venue";

// ── Profile ───────────────────────────────────────────────────────────────
// `brief_body` lived here in v2. It now lives on `discovery.brief_body`.

export const DEFAULT_VENUE_PROFILE: VenueProfile = {
  name: "The Leela Palace · Udaipur",
  venue_type: "estate",
  location: "Lake Pichola, Udaipur, Rajasthan",
  hero_images: [
    {
      id: "hero-lakeside",
      url: "https://images.unsplash.com/photo-1519741497674-611481863552?w=1400&q=80",
      caption: "Pichola Lakeside Lawn · golden hour",
    },
    {
      id: "hero-ballroom",
      url: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=1200&q=80",
      caption: "Durbar Grand Ballroom — reception setup",
    },
    {
      id: "hero-courtyard",
      url: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1200&q=80",
      caption: "Lily Courtyard — mehendi morning",
    },
  ],
  floor_plan_url: null,
  floor_plan_caption:
    "Upload the venue floor plan once the coordinator sends it — helps Décor and Catering size their setup.",
};

// ── Dream & Discover ──────────────────────────────────────────────────────

const DEFAULT_DIRECTIONS: VenueDirection[] = [
  {
    id: "dir-heritage-palace",
    label: "Heritage Palace",
    description:
      "Grand courtyards, historic architecture, multiple event spaces under one roof. Udaipur, Jaipur, Jodhpur.",
    imageUrl:
      "https://images.unsplash.com/photo-1514222709107-a180c68d72b4?w=900&q=80",
    reaction: "love",
  },
  {
    id: "dir-intimate-garden",
    label: "Intimate Garden Estate",
    description:
      "Manicured lawns, covered pergolas, fairy-light canopy. Under 200 guests.",
    imageUrl:
      "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=900&q=80",
    reaction: null,
  },
  {
    id: "dir-luxury-hotel",
    label: "Luxury Hotel",
    description:
      "Ballrooms, lakeside terraces, turnkey coordination. Brand-name reliability.",
    imageUrl:
      "https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=900&q=80",
    reaction: null,
  },
  {
    id: "dir-destination-beach",
    label: "Destination Beach",
    description:
      "Oceanfront ceremonies, barefoot receptions, resort-block logistics.",
    imageUrl:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=900&q=80",
    reaction: "not_for_us",
  },
  {
    id: "dir-urban-rooftop",
    label: "Urban Rooftop / Loft",
    description:
      "City skyline backdrop, industrial-chic, late-night energy.",
    imageUrl:
      "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=900&q=80",
    reaction: null,
  },
  {
    id: "dir-family-property",
    label: "Family Property / Farmhouse",
    description:
      "Personal, emotional, fully custom buildout. Your land, your rules.",
    imageUrl:
      "https://images.unsplash.com/photo-1533606688076-b6683a5f59f1?w=900&q=80",
    reaction: null,
  },
];

const DEFAULT_INSPIRATION: InspirationImage[] = [
  {
    id: "insp-1",
    url: "https://images.unsplash.com/photo-1519741497674-611481863552?w=900&q=80",
    caption: "Lakeside mandap at golden hour",
    reaction: "love",
    directionId: "dir-heritage-palace",
  },
  {
    id: "insp-2",
    url: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=900&q=80",
    caption: "Garden courtyard in fairy light",
    reaction: "love",
    directionId: "dir-intimate-garden",
  },
  {
    id: "insp-3",
    url: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=900&q=80",
    caption: "Mirror-cut ballroom floor",
    reaction: null,
    directionId: "dir-luxury-hotel",
  },
  {
    id: "insp-4",
    url: "https://images.unsplash.com/photo-1514222709107-a180c68d72b4?w=900&q=80",
    caption: "Heritage courtyard, torch-lit",
    reaction: null,
    directionId: "dir-heritage-palace",
  },
  {
    id: "insp-5",
    url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=900&q=80",
    caption: "Oceanfront ceremony",
    reaction: "not_for_us",
    directionId: "dir-destination-beach",
  },
  {
    id: "insp-6",
    url: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=900&q=80",
    caption: "City rooftop at dusk",
    reaction: null,
    directionId: "dir-urban-rooftop",
  },
];

export const DEFAULT_DISCOVERY_QUIZ: DiscoveryQuizState = {
  completed: false,
  answers: {
    vibes: [],
    guest_count: null,
    indoor_outdoor: null,
    event_scope: null,
    catering: null,
    location: "",
    budget_min: 40000,
    budget_max: 120000,
    must_haves: [],
  },
  updated_at: "",
};

export const DEFAULT_DISCOVERY: VenueDiscovery = {
  brief_body:
    "I want our families to feel like they've stepped into another world. Stone walls, marigold light, water views — somewhere the celebration feels like it's already started before anyone has spoken a word. Grand without being cold. Quiet service that lets a 400-person crowd feel held.",
  directions: DEFAULT_DIRECTIONS,
  inspiration: DEFAULT_INSPIRATION,
  keyword_chips: [
    "Our families together",
    "Scenic backdrop",
    "Walking distance between events",
    "Overnight stay for everyone",
    "Cultural ceremony space (mandap / havan)",
    "Wow factor entrance",
  ],
  definitely_want: [
    "Lakeside or courtyard view — water or stone, somewhere memorable",
    "Rooms on-site so elders don't have to travel between events",
    "Mandap on an existing stone platform, not a pop-up structure",
  ],
  not_for_us: [
    "Hotel ballroom with no view",
    "In-house caterer exclusivity (we want our chef)",
    "Anything that feels generic or like a convention hall",
  ],
  quiz: DEFAULT_DISCOVERY_QUIZ,

  single_vs_multi_venue: "single",
  location_preferences: ["Udaipur, Rajasthan", "Jaipur, Rajasthan"],
  guest_count_range: {
    smallest_event: 80,
    largest_event: 400,
  },
  accommodation_preference: "on_site",
  accessibility_requirements: [
    "Step-free path from car to ceremony for elders",
    "Wheelchair access to dining and ceremony spaces",
  ],
  fire_ceremony_needed: true,
  alcohol_policy_preference: "full_bar",
  rain_plan_needed: true,
  setup_teardown_needs:
    "Need full day before for décor build — mandap is anchored, not pop-up.",
  couple_approved_brief: false,
};

// ── Shortlist venues ──────────────────────────────────────────────────────

export const DEFAULT_SHORTLIST: ShortlistVenue[] = [
  {
    id: "cv-leela",
    name: "The Leela Palace · Udaipur",
    location: "Lake Pichola, Udaipur",
    vibe_summary:
      "Heritage palace on Lake Pichola — stone courtyards, water views, quiet staff.",
    hero_image_url:
      "https://images.unsplash.com/photo-1519741497674-611481863552?w=900&q=80",
    status: "shortlisted",
    compare_checked: true,

    indoor_outdoor: "both",
    capacity: "Cap 500",
    catering_policy: "In-house preferred, outside with waiver",
    fire_policy: "Havan OK (courtyard only)",
    noise_curfew: "Indoor 1 AM · outdoor 10:30 PM",
    rooms: "80 rooms on-site",
    cost_note: "$85K venue + $95/plate",

    airport_distance: "45 min from UDR",
    guest_accommodation: "80 on-site rooms · overflow at Taj 10 min away",
    loading_dock: "Service entrance, 24-hr advance",
    power: "3× 30A circuits available — confirm in writing",
    permits: "Venue pulls most; couple files fire permit 21 days prior",

    your_notes:
      "The memory of Priya's parents' wedding is here. Lakeside light. Mandap anchors into existing stone platform.",
    planner_notes:
      "Strongest emotional fit from the brief. Fire permit is a 21-day lead — we own that.",

    website: "https://theleela.com/udaipur",
    contact_phone: "+91 294 670 1234",
    contact_email: "weddings.udaipur@theleela.com",
    seated_capacity: "320 (ballroom) · 220 (terrace)",
    cocktail_capacity: "500 standing (courtyard + terrace)",
    outdoor_ceremony_capacity: "280 (lakeside lawn)",
    num_spaces: "6 event spaces",
    alcohol_policy: "Venue bar only · corkage on wine",
    corkage_fee: "$45/bottle (venue-sourced only)",
    parking_capacity: "180 valet spots",
    load_in_window: "24 hrs before first event",
    minimum_night_stay: "2 nights Fri/Sat on room block",
    included_in_fee: "Chiavari chairs, banquet rounds, house linens, standard staging, in-house AV",
    availability_notes: "Preferred booking window 18-24 months out. Feb 14-16 currently held.",
    virtual_tour_url: "https://theleela.com/udaipur/virtual-tour",
    date_contacted: "2026-01-10",
    site_visit_date: "2026-02-15",
    questions_asked: ["catering", "fire", "curfew", "rooms", "parking"],
    sort_order: 0,
  },
  {
    id: "cv-umaid",
    name: "Umaid Bhawan Palace",
    location: "Jodhpur, Rajasthan",
    vibe_summary:
      "The palace palace. Grander and more formal than Leela — pure Bollywood scale.",
    hero_image_url:
      "https://images.unsplash.com/photo-1514222709107-a180c68d72b4?w=900&q=80",
    status: "visited",
    compare_checked: true,

    indoor_outdoor: "both",
    capacity: "Cap 600",
    catering_policy: "In-house exclusive",
    fire_policy: "Havan OK (gardens only)",
    noise_curfew: "Indoor 12:30 AM · outdoor 10 PM",
    rooms: "64 rooms · 2-night min",
    cost_note: "$110K venue + $115/plate",

    airport_distance: "30 min from JDH",
    guest_accommodation: "64 rooms · 2-night minimum · overflow at Taj Hari Mahal",
    loading_dock: "Rear service road, escort required",
    power: "Full house power, venue-supplied distro",
    permits: "Venue pulls all permits — their event team walks the couple through",

    your_notes:
      "Bigger and grander but in-house catering exclusivity kills our caterer. Revisit if we widen budget.",
    planner_notes:
      "If food matters more than grandeur, this isn't your venue. Revisit only if budget flexes.",

    website: "https://taj.tajhotels.com/umaid-bhawan",
    contact_phone: "+91 291 251 0101",
    contact_email: "events.umaid@tajhotels.com",
    seated_capacity: "400 (durbar hall)",
    cocktail_capacity: "600 standing (lawns combined)",
    outdoor_ceremony_capacity: "500 (Mehrangarh lawn)",
    num_spaces: "4 event spaces + 64 suites",
    alcohol_policy: "Venue bar · no outside alcohol",
    corkage_fee: "N/A",
    parking_capacity: "120 valet · coach parking available",
    load_in_window: "Midnight – 6 AM only",
    minimum_night_stay: "3 nights for full property buyout",
    included_in_fee: "Full in-house catering · house florals · staff · standard staging",
    availability_notes: "Frequently booked 2+ years out. No current hold.",
    virtual_tour_url: "",
    date_contacted: "2026-01-15",
    site_visit_date: "2026-03-02",
    questions_asked: ["catering", "rooms"],
    sort_order: 1,
  },
  {
    id: "cv-fairmont",
    name: "Fairmont Jaipur",
    location: "Jaipur, Rajasthan",
    vibe_summary:
      "Modern palace hotel — huge room block, turnkey event team, less emotional weight.",
    hero_image_url:
      "https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=900&q=80",
    status: "site_visit_planned",
    compare_checked: false,

    indoor_outdoor: "both",
    capacity: "Cap 450",
    catering_policy: "Any caterer on preferred list",
    fire_policy: "Havan with fire marshal on-site",
    noise_curfew: "Indoor 1 AM · outdoor 10 PM",
    rooms: "255 rooms",
    cost_note: "$62K venue + $78/plate",

    airport_distance: "25 min from JAI",
    guest_accommodation: "255 rooms — single-property room block covers everyone",
    loading_dock: "Full commercial dock, open 24 hrs",
    power: "Full event-grade distro",
    permits: "Venue files fire marshal; couple files city permits",

    your_notes:
      "Great value, huge room block. Ceremony lawn is pretty but less emotionally resonant than Lake Pichola.",
    planner_notes:
      "Best logistics + cost. Worth a visit to pressure-test the emotional gap against Leela.",

    website: "https://fairmont.com/jaipur",
    contact_phone: "+91 141 409 0000",
    contact_email: "weddings.jaipur@fairmont.com",
    seated_capacity: "380 (grand ballroom)",
    cocktail_capacity: "450 standing",
    outdoor_ceremony_capacity: "320 (ceremony lawn)",
    num_spaces: "5 event spaces + 255 rooms",
    alcohol_policy: "Venue bar preferred · outside on approved list",
    corkage_fee: "$30/bottle",
    parking_capacity: "300 spots (self-park + valet)",
    load_in_window: "48 hrs advance for large setups",
    minimum_night_stay: "1 night (room block flexible)",
    included_in_fee: "Chairs, rounds, linens, basic AV, standard dance floor",
    availability_notes: "More availability than heritage palaces. Multiple dates in Q1 open.",
    virtual_tour_url: "https://fairmont.com/jaipur/weddings/360-tour",
    date_contacted: "2026-01-20",
    site_visit_date: "",
    questions_asked: ["catering"],
    sort_order: 2,
  },
];

// ── Suggestions (placeholder — real AI matching later) ────────────────────

export const DEFAULT_SUGGESTIONS: VenueSuggestion[] = [
  {
    id: "sugg-rambagh",
    name: "Rambagh Palace · Jaipur",
    location: "Jaipur, Rajasthan",
    vibe_summary:
      "Former royal residence, walled gardens. Matches your heritage-palace direction.",
    hero_image_url:
      "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=900&q=80",
    status: "pending",
  },
  {
    id: "sugg-jagmandir",
    name: "Jagmandir Island Palace",
    location: "Udaipur, Rajasthan",
    vibe_summary:
      "Private island on Lake Pichola. Closest-on-earth match to your brief.",
    hero_image_url:
      "https://images.unsplash.com/photo-1519741497674-611481863552?w=900&q=80",
    status: "pending",
  },
];

// ── Computed requirements ─────────────────────────────────────────────────
// In production these are derived live from Events / Catering / Décor /
// Music / Guest / Discovery. Here they're hand-seeded for a plausible v1.

export const DEFAULT_VENUE_REQUIREMENTS: VenueRequirement[] = [
  {
    id: "req-events-multi-day",
    group: "events",
    label: "5 events across 3 days",
    met: true,
    source_note: "Haldi, Mehendi, Sangeet, Ceremony, Reception",
    sort_order: 0,
    computed: true,
  },
  {
    id: "req-events-haldi-outdoor",
    group: "events",
    label: "Outdoor space for Haldi (80 guests)",
    met: true,
    source_note: "Haldi",
    sort_order: 1,
    computed: true,
  },
  {
    id: "req-events-mehendi",
    group: "events",
    label: "Indoor / covered space for Mehendi (150 guests)",
    met: true,
    source_note: "Mehendi",
    sort_order: 2,
    computed: true,
  },
  {
    id: "req-events-sangeet",
    group: "events",
    label: "Large hall for Sangeet (380 guests, stage, dance floor)",
    met: true,
    source_note: "Sangeet",
    sort_order: 3,
    computed: true,
  },
  {
    id: "req-events-ceremony",
    group: "ceremony",
    label: "Ceremony space (320 guests, mandap, fire ceremony)",
    met: true,
    source_note: "Wedding ceremony",
    sort_order: 4,
    computed: true,
  },
  {
    id: "req-events-reception",
    group: "events",
    label: "Reception space (400 guests, dinner + dance)",
    met: true,
    source_note: "Reception",
    sort_order: 5,
    computed: true,
  },
  {
    id: "req-catering-kitchen",
    group: "catering",
    label: "Full kitchen access for caterer (not just warming)",
    met: true,
    source_note: "Outside caterer required",
    sort_order: 6,
    computed: true,
  },
  {
    id: "req-decor-loading",
    group: "decor",
    label: "Loading dock for décor install (24 hrs before)",
    met: true,
    source_note: "Install timeline",
    sort_order: 7,
    computed: true,
  },
  {
    id: "req-music-power",
    group: "music",
    label: "Power: 3 separate 30A circuits for sound / lighting",
    met: false,
    source_note: "Sound + lighting rig",
    sort_order: 8,
    computed: true,
  },
  {
    id: "req-ceremony-fire",
    group: "ceremony",
    label: "Fire ceremony permit (havan kund)",
    met: false,
    source_note: "Pandit ritual requirement",
    sort_order: 9,
    computed: true,
  },
  {
    id: "req-music-curfew",
    group: "music",
    label: "Music until at least 11 PM",
    met: true,
    source_note: "DJ set end time",
    sort_order: 10,
    computed: true,
  },
  {
    id: "req-guests-rooms",
    group: "guests",
    label: "Hotel rooms on-site or within 10 min drive",
    met: true,
    source_note: "80 rooms on property",
    sort_order: 11,
    computed: true,
  },
  {
    id: "req-guests-parking",
    group: "guests",
    label: "Parking for 200+ cars or shuttle access",
    met: true,
    source_note: "Transportation plan",
    sort_order: 12,
    computed: true,
  },
  {
    id: "req-guests-accessibility",
    group: "guests",
    label: "Step-free path for elderly guests",
    met: false,
    source_note: "Guest list accessibility flags",
    sort_order: 13,
    computed: true,
  },
  {
    id: "req-discovery-water",
    group: "discovery",
    label: "Water or stone backdrop — something memorable on arrival",
    met: true,
    source_note: "From your Dream & Discover brief",
    sort_order: 14,
    computed: true,
  },
];

// ── Spaces ────────────────────────────────────────────────────────────────

export const DEFAULT_VENUE_SPACES: VenueSpace[] = [
  {
    id: "sp-lily-courtyard",
    name: "Lily Courtyard",
    use: "Haldi",
    capacity: "80",
    notes: "Covered colonnade — turmeric may stain stone, use drop cloths.",
    image_url:
      "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=900&q=80",
    sort_order: 0,
    ai_layout_suggestion: "",
  },
  {
    id: "sp-garden-pergola",
    name: "Garden Pergola",
    use: "Mehendi",
    capacity: "150",
    notes: "Covered for rain. Morning sun is ideal for mehendi photography.",
    image_url:
      "https://images.unsplash.com/photo-1533606688076-b6683a5f59f1?w=900&q=80",
    sort_order: 1,
    ai_layout_suggestion: "",
  },
  {
    id: "sp-durbar-ballroom",
    name: "Durbar Grand Ballroom",
    use: "Sangeet → Wedding",
    capacity: "400 / 320",
    notes: "Flip required overnight (see Décor). Chandelier hooks rated 200 lb.",
    image_url:
      "https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=900&q=80",
    sort_order: 2,
    ai_layout_suggestion: "",
  },
  {
    id: "sp-lakeside-terrace",
    name: "Lakeside Terrace",
    use: "Reception cocktail hour",
    capacity: "220",
    notes: "Sunset-facing — aim cocktails 5:30–6:45 PM.",
    image_url:
      "https://images.unsplash.com/photo-1519741497674-611481863552?w=900&q=80",
    sort_order: 3,
    ai_layout_suggestion: "",
  },
  {
    id: "sp-ballroom-b",
    name: "Ballroom B",
    use: "Reception dinner",
    capacity: "400",
    notes: "Connects to terrace via glass doors for seamless flow.",
    image_url:
      "https://images.unsplash.com/photo-1514222709107-a180c68d72b4?w=900&q=80",
    sort_order: 4,
    ai_layout_suggestion: "",
  },
  {
    id: "sp-bride-suite",
    name: "Bride Suite · Villa 4",
    use: "Getting ready",
    capacity: "—",
    notes: "2nd floor. Confirm service-elevator access for lehenga.",
    image_url: null,
    sort_order: 5,
    ai_layout_suggestion: "",
  },
];

// ── Pairings & transitions ────────────────────────────────────────────────
// `event_id` values align with the default events seed; the Spaces & Flow
// tab will still render a card for any pairing whose event has since been
// deleted, nudging the user to reassign.

export const DEFAULT_PAIRINGS: SpaceEventPairing[] = [];

export const DEFAULT_TRANSITIONS: TransitionNote[] = [
  {
    id: "tr-durbar-flip",
    space_id: "sp-durbar-ballroom",
    flip_time: "Overnight (12 hrs)",
    changes:
      "Sangeet stage + dance floor out. Mandap in, chairs re-set for ceremony. Floral swap.",
    responsible: "Venue team + Décor vendor · day-of coordinator signs off",
  },
];

// ── Logistics (structured fields, read by other workspaces) ───────────────

export const DEFAULT_LOGISTICS: VenueLogistics = {
  load_in_window: "24 hours before first event",
  vendor_access: "6:00 AM – 12:00 AM",
  music_curfew_indoor: "1:00 AM",
  music_curfew_outdoor: "10:30 PM",
  event_end_time: "1:00 AM (latest)",
  overtime_rate: "$2,500 per 30 minutes after curfew",

  catering_policy: "In-house preferred · outside permitted with waiver",
  kitchen_access: "6:00 AM day-of",
  outside_caterer_allowed: true,
  preferred_caterer_list: "Samovar Events · Chef Kunal Kapur · Khandaani Rajdhani",
  alcohol_policy: "Venue bar only — no outside alcohol",
  corkage_fee: "$45/bottle (venue-sourced)",

  vendor_loading_window: "Midnight – 6 AM only on event days",
  wall_attachment_rules: "Command hooks only. No nails, no screws.",
  restrictions: [
    "No open flame indoors (electric havan only in ballroom)",
    "No confetti, rice, or flower petals indoors",
    "Noise level: 85 dB max after 10 PM",
  ],

  power_circuits: "3× 30A dedicated circuits (sound / lighting / kitchen)",
  power_notes: "Generator backup available on request · 48-hr notice",

  fire_ceremony_policy:
    "Havan permitted in courtyard only. Electric havan required indoors.",
  fire_permit_owner: "Couple files with city — due 21 days prior",

  parking_capacity: "180 spots valet-managed",
  valet: "$25/car, billed to couple",
  shuttle_drop_off: "Main entrance circle",
  baraat_rules: "Horse permitted in overflow lot only",

  room_block_details: "80 rooms held for wedding block · 2-night minimum",
  minimum_night_stay: "2 nights Fri/Sat",

  wet_weather_backup:
    "Garden Pergola (covered) is default backup for Haldi; Ballroom B backs up Lakeside ceremony.",

  event_insurance_required: "$1M minimum liability · couple provides COI",
  liquor_liability: "Covered by venue",
};

// ── Site visits ───────────────────────────────────────────────────────────

export const DEFAULT_SITE_VISITS: SiteVisit[] = [
  {
    id: "sv-1",
    visit_index: 1,
    date: "2026-02-15",
    attendees: "Priya, Raj, Urvashi (planner)",
    weather: "55°F, overcast (tested outdoor spaces)",
    photos: [],
    notes:
      "Ballroom is gorgeous but the ceiling chandelier may interfere with mandap height — need to measure. Garden Pergola is perfect for Mehendi (covered in case of rain). Kitchen is full commercial so the caterer will be happy. Bride Suite is on 2nd floor with no passenger elevator for lehenga — ask about service elevator access.",
    follow_ups: [
      { id: "fu-1-1", text: "Measure ballroom ceiling clearance for mandap", done: false },
      { id: "fu-1-2", text: "Confirm service elevator access for bridal suite", done: false },
      { id: "fu-1-3", text: "Get fire permit application from city", done: true },
      { id: "fu-1-4", text: "Request sample catering menu", done: false },
      { id: "fu-1-5", text: "Ask about backup indoor space for Haldi (rain plan)", done: false },
    ],
    checklist: [
      { id: "ck-1-1", label: "Walked kitchen with caterer", checked: true },
      { id: "ck-1-2", label: "Saw loading dock + timing window", checked: true },
      { id: "ck-1-3", label: "Visited bridal suite + getting-ready rooms", checked: true },
      { id: "ck-1-4", label: "Sound test in main hall", checked: false },
      { id: "ck-1-5", label: "Confirmed outdoor backup plan for rain", checked: false },
      { id: "ck-1-6", label: "Walked parking + valet flow", checked: true },
      { id: "ck-1-7", label: "Saw guest rooms + room-block setup", checked: true },
    ],
    voice_memo_url: null,
    voice_memo_caption: "",
    rating: 4,
    venue_id: "cv-leela",
    sort_order: 0,
    pre_visit_quiz: {
      "pv-ceremony-setup": true,
      "pv-cocktail-space": true,
      "pv-bridal-suite": true,
      "pv-catering-kitchen": true,
      "pv-sound-acoustics": false,
      "pv-vendor-loadin": true,
      "pv-parking-valet": true,
      "pv-rain-backup": false,
      "pv-event-transition": true,
      "pv-havan-fire": false,
    },
    visit_summary: "",
  },
];

export const DEFAULT_VISIT_CHECKLIST_TEMPLATE: Omit<
  SiteVisit["checklist"][number],
  "checked"
>[] = [
  { id: "tmpl-kitchen", label: "Walked kitchen with caterer" },
  { id: "tmpl-dock", label: "Saw loading dock + timing window" },
  { id: "tmpl-suite", label: "Visited bridal suite + getting-ready rooms" },
  { id: "tmpl-sound", label: "Sound test in main hall" },
  { id: "tmpl-backup", label: "Confirmed outdoor backup plan for rain" },
  { id: "tmpl-parking", label: "Walked parking + valet flow" },
  { id: "tmpl-rooms", label: "Saw guest rooms + room-block setup" },
];

// ── Documents ─────────────────────────────────────────────────────────────

export const DEFAULT_VENUE_DOCUMENTS: VenueDocument[] = [
  {
    id: "doc-contract",
    title: "Venue contract — The Leela Palace",
    kind: "contract",
    url: "",
    uploaded_at: "2026-01-22",
    notes: "Signed by both sides. 50% deposit received. Balance due 30 days prior.",
    sort_order: 0,
  },
  {
    id: "doc-floorplan",
    title: "Durbar Ballroom floor plan · 24x40 grid",
    kind: "floor_plan",
    url: "",
    uploaded_at: "2026-01-24",
    notes: "",
    sort_order: 1,
  },
  {
    id: "doc-vendor-rules",
    title: "Vendor rules & insurance requirements (PDF)",
    kind: "vendor_rules",
    url: "",
    uploaded_at: "2026-01-22",
    notes: "Share with every contracted vendor — COI due 14 days prior.",
    sort_order: 2,
  },
];

// ── Keyword chip library (Dream & Discover) ───────────────────────────────
// DB-config-style — keyword chips are config, not hardcoded in the tab.
export const VENUE_KEYWORD_LIBRARY: string[] = [
  "Our families together",
  "Scenic backdrop",
  "Privacy",
  "Walking distance between events",
  "Overnight stay for everyone",
  "Outdoor ceremony",
  "Dance floor energy",
  "Cultural ceremony space (mandap / havan)",
  "Foodie experience",
  "Wow factor entrance",
  "Easy for elderly guests",
  "Close to airport",
  "We've been there before",
];
