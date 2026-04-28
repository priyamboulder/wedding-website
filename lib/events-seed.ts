// ── Events seed data ───────────────────────────────────────────────────────
// Curated option lists for the 6-question core quiz, plus the empty
// CoupleContext we boot the store with. Everything here is static content —
// runtime state lives in stores/events-store.ts.

import type {
  CoupleContext,
  EventRecord,
  EventTypeOption,
  EventsQuizState,
  MoodTileOption,
  Palette,
  PriorityOption,
  Tradition,
} from "@/types/events";

// ── Program (step 1) ───────────────────────────────────────────────────────

export const EVENT_TYPE_OPTIONS: EventTypeOption[] = [
  {
    id: "pithi",
    name: "Pithi",
    blurb: "Family turmeric ceremony",
    defaultGuestShare: 0.12,
    traditions: ["gujarati", "marwari", "sindhi"],
  },
  {
    id: "haldi",
    name: "Haldi",
    blurb: "Turmeric blessing, close circle",
    defaultGuestShare: 0.14,
    traditions: ["punjabi", "tamil", "telugu", "bengali", "marathi"],
  },
  {
    id: "mehendi",
    name: "Mehendi",
    blurb: "Henna afternoon, music, food",
    defaultGuestShare: 0.35,
  },
  {
    id: "sangeet",
    name: "Sangeet",
    blurb: "Performances, dinner, dancing",
    defaultGuestShare: 0.85,
  },
  {
    id: "garba",
    name: "Garba / Dandiya",
    blurb: "Folk dance night",
    defaultGuestShare: 0.7,
    traditions: ["gujarati"],
  },
  {
    id: "baraat",
    name: "Baraat",
    blurb: "Groom's procession",
    defaultGuestShare: 0.55,
    traditions: ["gujarati", "punjabi", "marwari", "marathi", "sindhi"],
  },
  {
    id: "ceremony",
    name: "Wedding ceremony",
    blurb: "Rituals and vows",
    defaultGuestShare: 1.0,
  },
  {
    id: "cocktail",
    name: "Cocktail hour",
    blurb: "Arrival drinks, mingling",
    defaultGuestShare: 0.9,
  },
  {
    id: "reception",
    name: "Reception",
    blurb: "Dinner, speeches, first dance",
    defaultGuestShare: 1.0,
  },
  {
    id: "after_party",
    name: "After-party",
    blurb: "Late night, inner circle",
    defaultGuestShare: 0.45,
  },
  {
    id: "welcome_dinner",
    name: "Welcome dinner",
    blurb: "Traveling guests, relaxed",
    defaultGuestShare: 0.6,
  },
  {
    id: "farewell_brunch",
    name: "Farewell brunch",
    blurb: "Day-after send-off",
    defaultGuestShare: 0.55,
  },
];

// ── Traditions (step 2) ────────────────────────────────────────────────────

export const TRADITION_OPTIONS: { id: Tradition; name: string }[] = [
  { id: "gujarati", name: "Gujarati" },
  { id: "punjabi", name: "Punjabi" },
  { id: "tamil", name: "Tamil" },
  { id: "telugu", name: "Telugu" },
  { id: "bengali", name: "Bengali" },
  { id: "marwari", name: "Marwari" },
  { id: "marathi", name: "Marathi" },
  { id: "sindhi", name: "Sindhi" },
  { id: "malayali", name: "Malayali" },
  { id: "kashmiri", name: "Kashmiri" },
  { id: "south_indian_christian", name: "South Indian Christian" },
  { id: "muslim", name: "Muslim" },
  { id: "sikh", name: "Sikh" },
  { id: "jain", name: "Jain" },
  { id: "inter_faith", name: "Inter-faith" },
  { id: "non_religious", name: "Non-religious / Civil" },
  { id: "custom", name: "Custom" },
];

// ── Vibe (step 4) ──────────────────────────────────────────────────────────

export const MOOD_TILE_OPTIONS: MoodTileOption[] = [
  {
    id: "garden_romance",
    name: "Garden Romance",
    blurb: "Soft florals, warm dusk, linen",
    accentHex: "#C97B63",
    baseHex: "#F5E0D6",
  },
  {
    id: "jewel_box",
    name: "Jewel Box",
    blurb: "Deep tones, gold, velvet",
    accentHex: "#5C1A2B",
    baseHex: "#B8860B",
  },
  {
    id: "palace_baroque",
    name: "Palace Baroque",
    blurb: "Ornate, ivory, mirrored",
    accentHex: "#8B6F47",
    baseHex: "#EDE7D9",
  },
  {
    id: "desert_glow",
    name: "Desert Glow",
    blurb: "Terracotta, brass, candlelight",
    accentHex: "#B5623C",
    baseHex: "#F0DFC8",
  },
  {
    id: "monsoon_modern",
    name: "Monsoon Modern",
    blurb: "Ink, sage, architectural",
    accentHex: "#2E4A4B",
    baseHex: "#C8D4C4",
  },
  {
    id: "temple_traditional",
    name: "Temple Traditional",
    blurb: "Saffron, marigold, banana leaf",
    accentHex: "#D4A24C",
    baseHex: "#F5E6C8",
  },
  {
    id: "coastal_ease",
    name: "Coastal Ease",
    blurb: "Whitewash, rattan, fresh coconut",
    accentHex: "#5B8AA3",
    baseHex: "#F1EDE4",
  },
  {
    id: "heritage_haveli",
    name: "Heritage Haveli",
    blurb: "Fresco walls, indigo, mirror work",
    accentHex: "#3C4F8C",
    baseHex: "#E8DFCE",
  },
];

// ── Palettes (step 5) ──────────────────────────────────────────────────────

export const PALETTE_LIBRARY: Palette[] = [
  {
    id: "rose-burgundy",
    name: "Rose & Burgundy",
    description: "Warm, wine-deep, editorial romance",
    colors: [
      { hex: "#5C1A2B", name: "Burgundy", role: "primary" },
      { hex: "#C97B63", name: "Rose", role: "secondary" },
      { hex: "#F5E0D6", name: "Petal", role: "neutral" },
      { hex: "#B8860B", name: "Gold", role: "accent" },
      { hex: "#1A1A1A", name: "Ink", role: "highlight" },
    ],
  },
  {
    id: "saffron-ivory",
    name: "Saffron & Ivory",
    description: "Warm traditional, golden hour",
    colors: [
      { hex: "#D4A24C", name: "Saffron", role: "primary" },
      { hex: "#F5E6C8", name: "Wheat", role: "secondary" },
      { hex: "#FBF9F4", name: "Ivory", role: "neutral" },
      { hex: "#B8860B", name: "Antique Gold", role: "accent" },
      { hex: "#5C3A1E", name: "Sandalwood", role: "highlight" },
    ],
  },
  {
    id: "emerald-copper",
    name: "Emerald & Copper",
    description: "Jewel-toned, lush, cinematic",
    colors: [
      { hex: "#1F4D3F", name: "Emerald", role: "primary" },
      { hex: "#B5623C", name: "Copper", role: "secondary" },
      { hex: "#E8DFCE", name: "Parchment", role: "neutral" },
      { hex: "#D4A843", name: "Brass", role: "accent" },
      { hex: "#0F1A1A", name: "Forest Ink", role: "highlight" },
    ],
  },
  {
    id: "indigo-mirror",
    name: "Indigo & Mirror",
    description: "Haveli-inspired, cool and ornate",
    colors: [
      { hex: "#3C4F8C", name: "Indigo", role: "primary" },
      { hex: "#C8D4C4", name: "Mirror Sage", role: "secondary" },
      { hex: "#F1EDE4", name: "Lime Wash", role: "neutral" },
      { hex: "#D4A843", name: "Gold Leaf", role: "accent" },
      { hex: "#1A1A1A", name: "Ink", role: "highlight" },
    ],
  },
  {
    id: "coral-mint",
    name: "Coral & Mint",
    description: "Fresh, coastal, daylight",
    colors: [
      { hex: "#E09C7E", name: "Coral", role: "primary" },
      { hex: "#B8D4C4", name: "Mint", role: "secondary" },
      { hex: "#FBF9F4", name: "Shell", role: "neutral" },
      { hex: "#D4A843", name: "Sunlight", role: "accent" },
      { hex: "#2E4A4B", name: "Deep Sea", role: "highlight" },
    ],
  },
  {
    id: "ink-gold",
    name: "Ink & Gold",
    description: "Minimal, architectural, black tie",
    colors: [
      { hex: "#1A1A1A", name: "Ink", role: "primary" },
      { hex: "#B8860B", name: "Gold", role: "secondary" },
      { hex: "#FBF9F4", name: "Ivory", role: "neutral" },
      { hex: "#6B6B6B", name: "Graphite", role: "accent" },
      { hex: "#D4A843", name: "Champagne", role: "highlight" },
    ],
  },
  {
    id: "midnight-gold",
    name: "Midnight & Gold",
    description: "Deep navy, antique gold, editorial black-tie",
    colors: [
      { hex: "#161A36", name: "Midnight", role: "primary" },
      { hex: "#8A6A2E", name: "Antique Gold", role: "secondary" },
      { hex: "#F6F0E0", name: "Parchment", role: "neutral" },
      { hex: "#5C1A2B", name: "Wine", role: "accent" },
      { hex: "#0C0F24", name: "Ink", role: "highlight" },
    ],
  },
  {
    id: "jewel-box-sapphire",
    name: "Jewel Box",
    description: "Emerald, sapphire, ruby — saturated and regal",
    colors: [
      { hex: "#1F4D3F", name: "Emerald", role: "primary" },
      { hex: "#1B3A6B", name: "Sapphire", role: "secondary" },
      { hex: "#8A1A2B", name: "Ruby", role: "accent" },
      { hex: "#D4A843", name: "Gold", role: "highlight" },
      { hex: "#F4EAD0", name: "Cream", role: "neutral" },
    ],
  },
  {
    id: "marigold-bloom",
    name: "Marigold Bloom",
    description: "Temple orange, saffron, banana leaf greens",
    colors: [
      { hex: "#E08A2E", name: "Marigold", role: "primary" },
      { hex: "#D4A24C", name: "Saffron", role: "secondary" },
      { hex: "#3F6B3A", name: "Banana Leaf", role: "accent" },
      { hex: "#FBF3DE", name: "Ghee", role: "neutral" },
      { hex: "#4A2414", name: "Tamarind", role: "highlight" },
    ],
  },
  {
    id: "champagne-blush",
    name: "Champagne & Blush",
    description: "Tonal, whisper-soft, reception shimmer",
    colors: [
      { hex: "#E6C2B6", name: "Blush", role: "primary" },
      { hex: "#E8D4A0", name: "Champagne", role: "secondary" },
      { hex: "#C79B7A", name: "Rose Gold", role: "accent" },
      { hex: "#FBF6EF", name: "Ivory", role: "neutral" },
      { hex: "#3C2417", name: "Oud", role: "highlight" },
    ],
  },
  {
    id: "onyx-pearl",
    name: "Onyx & Pearl",
    description: "Monochrome, metallic, minimalist cocktail",
    colors: [
      { hex: "#111111", name: "Onyx", role: "primary" },
      { hex: "#EDEAE2", name: "Pearl", role: "secondary" },
      { hex: "#9A9A9A", name: "Silver", role: "accent" },
      { hex: "#3B3E45", name: "Slate", role: "highlight" },
      { hex: "#FDFBF6", name: "Bone", role: "neutral" },
    ],
  },
  {
    id: "peacock-brass",
    name: "Peacock & Brass",
    description: "Turquoise, teal, oxidized brass — courtyard opulence",
    colors: [
      { hex: "#0F6A6B", name: "Peacock", role: "primary" },
      { hex: "#1B3E52", name: "Teal Ink", role: "secondary" },
      { hex: "#A37A3A", name: "Brass", role: "accent" },
      { hex: "#F1EADA", name: "Cream", role: "neutral" },
      { hex: "#121A1C", name: "Ink", role: "highlight" },
    ],
  },
  {
    id: "lotus-tea",
    name: "Lotus & Tea",
    description: "Dusty pink, matcha, warm tea brown",
    colors: [
      { hex: "#C98B9C", name: "Lotus", role: "primary" },
      { hex: "#8FA276", name: "Matcha", role: "secondary" },
      { hex: "#6F4A34", name: "Tea", role: "accent" },
      { hex: "#F7EEE4", name: "Unbleached", role: "neutral" },
      { hex: "#2A1914", name: "Earth", role: "highlight" },
    ],
  },
  {
    id: "bougainvillea",
    name: "Bougainvillea",
    description: "Magenta, fuchsia, papaya — full Indian summer",
    colors: [
      { hex: "#B1245F", name: "Magenta", role: "primary" },
      { hex: "#D93878", name: "Fuchsia", role: "secondary" },
      { hex: "#F2A65A", name: "Papaya", role: "accent" },
      { hex: "#FBF3E8", name: "Lime Wash", role: "neutral" },
      { hex: "#3A0F23", name: "Plum Ink", role: "highlight" },
    ],
  },
  {
    id: "oudh-amber",
    name: "Oudh & Amber",
    description: "Smoky amber, oudh brown, gilded heat",
    colors: [
      { hex: "#7A4B18", name: "Amber", role: "primary" },
      { hex: "#4A2A12", name: "Oudh", role: "secondary" },
      { hex: "#C99A45", name: "Gold", role: "accent" },
      { hex: "#F3E9D4", name: "Sandalwood", role: "neutral" },
      { hex: "#17110A", name: "Smoke", role: "highlight" },
    ],
  },
  {
    id: "pomegranate-ivory",
    name: "Pomegranate & Ivory",
    description: "Crimson-garnet fruit on bone and gold",
    colors: [
      { hex: "#7E1A2C", name: "Pomegranate", role: "primary" },
      { hex: "#FBF4E4", name: "Ivory", role: "secondary" },
      { hex: "#B7892E", name: "Gold", role: "accent" },
      { hex: "#B5623C", name: "Clay", role: "highlight" },
      { hex: "#1A1A1A", name: "Ink", role: "neutral" },
    ],
  },
  {
    id: "midnight-garden",
    name: "Midnight Garden",
    description: "After-dark botanicals, moss, gilded edges",
    colors: [
      { hex: "#0F1A1A", name: "Ink", role: "primary" },
      { hex: "#223B2A", name: "Forest", role: "secondary" },
      { hex: "#607A4A", name: "Moss", role: "accent" },
      { hex: "#C79B45", name: "Gold Leaf", role: "highlight" },
      { hex: "#F4EEDC", name: "Bone", role: "neutral" },
    ],
  },
  {
    id: "marble-rust",
    name: "Marble & Rust",
    description: "Weathered palazzo, terracotta, chalk",
    colors: [
      { hex: "#EDE4D3", name: "Marble", role: "primary" },
      { hex: "#A64A2A", name: "Rust", role: "secondary" },
      { hex: "#CDA77A", name: "Sand", role: "accent" },
      { hex: "#8A6A2E", name: "Brass", role: "highlight" },
      { hex: "#3B3E45", name: "Slate", role: "neutral" },
    ],
  },
  {
    id: "moss-wine",
    name: "Moss & Wine",
    description: "Hunter greens against deep burgundy",
    colors: [
      { hex: "#3E5B38", name: "Moss", role: "primary" },
      { hex: "#521A2A", name: "Wine", role: "secondary" },
      { hex: "#F2EAD2", name: "Cream", role: "neutral" },
      { hex: "#B88A3A", name: "Gold", role: "accent" },
      { hex: "#131A12", name: "Ink", role: "highlight" },
    ],
  },
  {
    id: "clay-cream",
    name: "Clay & Cream",
    description: "Terracotta earthenware, warm daylight",
    colors: [
      { hex: "#B76A46", name: "Clay", role: "primary" },
      { hex: "#F5ECDB", name: "Cream", role: "secondary" },
      { hex: "#C98958", name: "Terracotta", role: "accent" },
      { hex: "#FBF4E3", name: "Ivory", role: "neutral" },
      { hex: "#2A1914", name: "Earth Ink", role: "highlight" },
    ],
  },
  {
    id: "mulberry-sage",
    name: "Mulberry & Sage",
    description: "Fruited purple with herbal silver-green",
    colors: [
      { hex: "#6E2F3F", name: "Mulberry", role: "primary" },
      { hex: "#A7B89C", name: "Sage", role: "secondary" },
      { hex: "#F1EADA", name: "Cream", role: "neutral" },
      { hex: "#B88A3A", name: "Gold", role: "accent" },
      { hex: "#1F1418", name: "Ink", role: "highlight" },
    ],
  },
  {
    id: "tangerine-gold",
    name: "Tangerine & Gold",
    description: "High-saffron daylight, marigold stage",
    colors: [
      { hex: "#E5732A", name: "Tangerine", role: "primary" },
      { hex: "#D4A24C", name: "Saffron", role: "secondary" },
      { hex: "#B88A3A", name: "Gold", role: "accent" },
      { hex: "#FBF3DE", name: "Ghee", role: "neutral" },
      { hex: "#3A1A0A", name: "Tamarind", role: "highlight" },
    ],
  },
  {
    id: "aubergine-rose",
    name: "Aubergine & Rose",
    description: "Deep aubergine with dusted rose and champagne",
    colors: [
      { hex: "#3B1E3E", name: "Aubergine", role: "primary" },
      { hex: "#C99098", name: "Dusty Rose", role: "secondary" },
      { hex: "#E8D4A0", name: "Champagne", role: "accent" },
      { hex: "#B88A3A", name: "Gold", role: "highlight" },
      { hex: "#160B18", name: "Plum Ink", role: "neutral" },
    ],
  },
  {
    id: "sea-salt-linen",
    name: "Sea Salt & Linen",
    description: "Coastal, washed whites, seafoam pale blue",
    colors: [
      { hex: "#F1EDE4", name: "Linen", role: "primary" },
      { hex: "#C6D6D2", name: "Sea Salt", role: "secondary" },
      { hex: "#8FA8B3", name: "Pale Sea", role: "accent" },
      { hex: "#D5CDBD", name: "Sand", role: "neutral" },
      { hex: "#1F2A2C", name: "Ink", role: "highlight" },
    ],
  },
  {
    id: "smoke-sand",
    name: "Smoke & Sand",
    description: "Architectural greys, warm sand, almost-black",
    colors: [
      { hex: "#3B3E45", name: "Smoke", role: "primary" },
      { hex: "#CDBFA6", name: "Sand", role: "secondary" },
      { hex: "#5B5E66", name: "Slate", role: "accent" },
      { hex: "#F2EDE1", name: "Cream", role: "neutral" },
      { hex: "#0F1012", name: "Ink", role: "highlight" },
    ],
  },
  {
    id: "jasmine-silver",
    name: "Jasmine & Silver",
    description: "Fragrant whites, pearl, silver cool tones",
    colors: [
      { hex: "#FBF7EF", name: "Jasmine", role: "primary" },
      { hex: "#C5C5C5", name: "Silver", role: "secondary" },
      { hex: "#EDEAE2", name: "Pearl", role: "neutral" },
      { hex: "#5B6068", name: "Slate", role: "accent" },
      { hex: "#141416", name: "Ink", role: "highlight" },
    ],
  },
  {
    id: "black-tie",
    name: "Black Tie",
    description: "Monochrome with a slash of gold — cocktail hour",
    colors: [
      { hex: "#0A0A0A", name: "Black", role: "primary" },
      { hex: "#FFFFFF", name: "White", role: "secondary" },
      { hex: "#B88A3A", name: "Gold", role: "accent" },
      { hex: "#9A9A9A", name: "Silver", role: "neutral" },
      { hex: "#1A1A1A", name: "Ink", role: "highlight" },
    ],
  },
  {
    id: "silk-route",
    name: "Silk Route",
    description: "Carmine, turquoise, gilded and ornate",
    colors: [
      { hex: "#A6182D", name: "Carmine", role: "primary" },
      { hex: "#1D8A8A", name: "Turquoise", role: "secondary" },
      { hex: "#C99A45", name: "Gold", role: "accent" },
      { hex: "#F6ECD6", name: "Ivory", role: "neutral" },
      { hex: "#1F0B10", name: "Ink", role: "highlight" },
    ],
  },
  {
    id: "banyan-brass",
    name: "Banyan & Brass",
    description: "Deep botanical green, aged brass, bark",
    colors: [
      { hex: "#234538", name: "Banyan", role: "primary" },
      { hex: "#A37A3A", name: "Brass", role: "secondary" },
      { hex: "#EDE4D0", name: "Cream", role: "neutral" },
      { hex: "#4E341E", name: "Bark", role: "accent" },
      { hex: "#121914", name: "Ink", role: "highlight" },
    ],
  },
  {
    id: "monsoon-mist",
    name: "Monsoon Mist",
    description: "Storm-washed sage, mist, pewter",
    colors: [
      { hex: "#647A78", name: "Pewter", role: "primary" },
      { hex: "#B8C4BD", name: "Mist", role: "secondary" },
      { hex: "#8FA398", name: "Sage", role: "accent" },
      { hex: "#EFEADF", name: "Linen", role: "neutral" },
      { hex: "#1B2321", name: "Ink", role: "highlight" },
    ],
  },
];

// ── Priorities (step 6) ────────────────────────────────────────────────────

export const PRIORITY_OPTIONS: PriorityOption[] = [
  { id: "photography", name: "Photography", blurb: "Stills — the album legacy" },
  { id: "videography", name: "Videography", blurb: "Film and highlight reels" },
  { id: "food", name: "Food", blurb: "Menu ambition and counters" },
  { id: "decor", name: "Décor", blurb: "Florals, mandap, lighting, rentals" },
  { id: "music", name: "Music", blurb: "DJ, live, dhol, performers" },
  { id: "attire", name: "Attire", blurb: "Your outfits across events" },
  { id: "venue", name: "Venue", blurb: "The canvas — architectural vs. blank box" },
  { id: "guest_experience", name: "Guest experience", blurb: "Hotel, transport, comfort" },
  { id: "stationery", name: "Stationery", blurb: "Save-the-dates through day-of paper" },
];

// ── Defaults ───────────────────────────────────────────────────────────────

// Default guest tiers every couple starts with. IDs are stable — renaming
// updates `name` in place so per-event assignments don't break.
export const DEFAULT_GUEST_TIERS = [
  { id: "everyone", name: "Everyone", description: "The full guest list" },
  {
    id: "close_family_friends",
    name: "Close family & friends",
    description: "Inner circle — the people who'd be at every event",
  },
  {
    id: "immediate_family",
    name: "Immediate family only",
    description: "Parents, siblings, grandparents",
  },
  {
    id: "custom_group",
    name: "Custom group",
    description: "Define your own — bridesmaids, destination travelers, etc.",
  },
];

export const DEFAULT_COUPLE_CONTEXT: CoupleContext = {
  traditions: [],
  partnerBackground: "",
  storyText: "",
  totalGuestCount: 250,
  heroPaletteId: null,
  priorityRanking: PRIORITY_OPTIONS.map((p) => p.id),
  nonNegotiable: "",
  dontCare: "",
  aiBudgetAllocation: null,
  programBrief: "",
  programBriefAiDraft: "",
  locationType: null,
  destinationLocation: "",
  programSize: null,
  guestTiers: DEFAULT_GUEST_TIERS,
  programDiscoveryComplete: false,
};

export const DEFAULT_QUIZ_STATE: EventsQuizState = {
  completedAt: null,
  stepIndex: 0,
  hasCompletedOnce: true,
  hasStartedBrief: true,
  coachmarkDismissed: false,
};

export const DEFAULT_EVENTS: EventRecord[] = [];
