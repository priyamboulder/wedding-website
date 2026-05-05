// ── Décor & Florals store (rebuilt) ─────────────────────────────────────────
// Zustand + localStorage. Backs the 6-tab Décor workspace.

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { dbUpsert, getCurrentCoupleId } from "@/lib/supabase/db-sync";
import type {
  DecorQuizAnswers,
  EventPalette,
  ColorSwatch,
  MoodboardPin,
  MoodboardTag,
  ReferenceImage,
  VisionNote,
  EventSpaceAssignment,
  SpaceDetail,
  TransitionPlan,
  TransitionStep,
  MandapSpec,
  MandapStyleOption,
  MandapElementState,
  StageDesign,
  VendorEntry,
  VendorState,
  ContractRecord,
  PaymentMilestone,
  InstallTask,
  InstallDay,
  VendorCoordinationNote,
  DecorDocument,
  DocumentKind,
  Reaction,
  Reaction3,
  TurnoverKind,
  DecorSpaceCard,
  DecorSpaceType,
  SpaceIndoorOutdoor,
  SpaceTimeOfDay,
  SpaceReferenceImage,
  FloralByEvent,
  ThemeReference,
  InspirationTheme,
  SpaceDream,
  FlowerUsageMode,
  GreeneryPreference,
  SustainabilityPreference,
  CulturalFlowerNote,
  CulturalRequirementNote,
  SpaceAIRecommendation,
} from "@/types/decor";
import type { EventDayId } from "@/types/checklist";
import { INSPIRATION_THEME_SEEDS } from "@/components/decor/catalog";

const id = (prefix: string): string =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const NOW = "2026-04-21T00:00:00.000Z";

// ── Seed: vision ────────────────────────────────────────────────────────────

const SEED_QUIZ: DecorQuizAnswers = {
  feeling: null,
  florals: null,
  colors: null,
  traditionality: null,
  focal: null,
  completedAt: null,
};

const SEED_BRIEF = "";
const SEED_KEYWORDS: string[] = [];

const SEED_PALETTES: EventPalette[] = [
  {
    event_id: "haldi",
    label: "Haldi",
    swatches: [
      { id: "h1", hex: "#F5D547", name: "Turmeric" },
      { id: "h2", hex: "#F2A83B", name: "Marigold" },
      { id: "h3", hex: "#FFF2D1", name: "Cream" },
    ],
  },
  {
    event_id: "mehndi",
    label: "Mehendi",
    swatches: [
      { id: "m1", hex: "#5D6E4D", name: "Moss" },
      { id: "m2", hex: "#C8A24B", name: "Antique Gold" },
      { id: "m3", hex: "#E8D5B8", name: "Champagne" },
    ],
  },
  {
    event_id: "sangeet",
    label: "Sangeet",
    swatches: [
      { id: "s1", hex: "#C4488B", name: "Fuchsia" },
      { id: "s2", hex: "#D4A853", name: "Gold" },
      { id: "s3", hex: "#3B1F4A", name: "Plum" },
    ],
  },
  {
    event_id: "wedding",
    label: "Wedding",
    swatches: [
      { id: "w1", hex: "#8B2A1F", name: "Sindoor" },
      { id: "w2", hex: "#D4A853", name: "Gold" },
      { id: "w3", hex: "#FFF8EA", name: "Ivory" },
    ],
  },
  {
    event_id: "reception",
    label: "Reception",
    swatches: [
      { id: "r1", hex: "#FFFDF7", name: "Ivory" },
      { id: "r2", hex: "#D4A853", name: "Gold" },
      { id: "r3", hex: "#3D2B1F", name: "Cocoa" },
    ],
  },
];

// ── Seed: references ────────────────────────────────────────────────────────

const REFERENCE_EVENTS: EventDayId[] = [
  "haldi",
  "mehndi",
  "sangeet",
  "wedding",
  "reception",
];

const REFERENCE_SEEDS: Record<EventDayId, string[]> = {
  haldi: [
    "https://images.unsplash.com/photo-1609042900109-2b04fae5a1b9?w=600",
    "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=600",
    "https://images.unsplash.com/photo-1617183428445-0e1adf2c8b03?w=600",
    "https://images.unsplash.com/photo-1600721391776-b5cd0e0048a9?w=600",
  ],
  mehndi: [
    "https://images.unsplash.com/photo-1610030006930-8b1b18b60b38?w=600",
    "https://images.unsplash.com/photo-1604608672516-f1b9b1d1e9b5?w=600",
    "https://images.unsplash.com/photo-1620783770629-122b7f187703?w=600",
    "https://images.unsplash.com/photo-1595940293613-19d8d97f7a4f?w=600",
  ],
  sangeet: [
    "https://images.unsplash.com/photo-1542037104857-ffbb0b9155fb?w=600",
    "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600",
    "https://images.unsplash.com/photo-1583939411023-14783179e581?w=600",
    "https://images.unsplash.com/photo-1519741497674-611481863552?w=600",
  ],
  wedding: [
    "https://images.unsplash.com/photo-1600122854034-16f0c0aaa79f?w=600",
    "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600",
    "https://images.unsplash.com/photo-1529519195486-16945f0fb37f?w=600",
    "https://images.unsplash.com/photo-1606800052052-a08af7148866?w=600",
  ],
  reception: [
    "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=600",
    "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600",
    "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=600",
    "https://images.unsplash.com/photo-1594908900066-3f47337549d8?w=600",
  ],
  welcome: [],
  ganesh_puja: [],
  post_brunch: [],
};

const SEED_REFERENCES: ReferenceImage[] = REFERENCE_EVENTS.flatMap((eventId) =>
  (REFERENCE_SEEDS[eventId] ?? []).map((url, i) => ({
    id: `ref-${eventId}-${i}`,
    event_id: eventId,
    image_url: url,
    source: "suggested" as const,
    reaction: null,
    created_at: NOW,
  })),
);

// ── Seed: spaces ────────────────────────────────────────────────────────────

const SEED_SPACES: SpaceDetail[] = [
  {
    id: "space-lawn",
    name: "Poolside lawn",
    dimensions: "60' × 40', open sky",
    capacity: "150 seated",
    restrictions: "No amplified music before noon",
    power: "2 outlets poolhouse, generator available",
    setup_notes: "Open-air Haldi setup — long communal rug, floor cushions, floral arch over pool edge.",
  },
  {
    id: "space-courtyard",
    name: "Garden courtyard",
    dimensions: "40' × 40'",
    capacity: "120 seated on cushions",
    restrictions: "Shade tents required after 1 PM",
    power: "1 outlet on exterior wall",
    setup_notes: "Mehendi lounge — layered rugs, low tables, mehendi station in corner.",
  },
  {
    id: "space-ballroom",
    name: "Grand ballroom",
    dimensions: "80' × 120', 20' ceiling",
    capacity: "400 seated, 600 standing",
    restrictions: "No open flame, no confetti, load-in via dock B",
    power: "4 outlets stage-left, 2 floor boxes center",
    setup_notes: "SANGEET SETUP (Day 2, 4 PM – 11 PM):\n• Stage: 16' × 24' with LED backdrop\n• Dance floor: 30' × 30' center\n• Cocktail tables perimeter\n• Lighting: colour wash, moving heads, disco ball\n\nWEDDING SETUP (Day 3, 6 AM – 11 AM, ceremony at 11 AM):\n• Tear down Sangeet stage by 1 AM ← 5 hour flip window\n• Mandap: center, 12' × 12', facing east\n• Guest seating: 300 chairs in semi-circle\n• Aisle: 40' with floral columns every 8'\n• Havan kund: fire-safe mat, ventilation confirmed with venue",
  },
  {
    id: "space-terrace",
    name: "Grand ballroom terrace",
    dimensions: "50' × 80', covered",
    capacity: "250 cocktail",
    restrictions: "Wind considerations on linens",
    power: "3 outlets column, floor boxes center",
    setup_notes: "Reception cocktail + dining — string lights overhead, high-tops, long family-style tables.",
  },
];

const SEED_EVENT_SPACE_MAP: EventSpaceAssignment[] = [
  {
    id: "esa-1",
    event_id: "haldi",
    event_label: "Haldi",
    space_id: "space-lawn",
    setup_window: "Day 2, 8 AM",
    turnover: "none",
    turnover_note: "",
  },
  {
    id: "esa-2",
    event_id: "mehndi",
    event_label: "Mehendi",
    space_id: "space-courtyard",
    setup_window: "Day 2, 10 AM",
    turnover: "none",
    turnover_note: "",
  },
  {
    id: "esa-3",
    event_id: "sangeet",
    event_label: "Sangeet",
    space_id: "space-ballroom",
    setup_window: "Day 2, 4 PM",
    turnover: "flip_to_next",
    turnover_note: "Ballroom flips to Wedding ceremony overnight",
  },
  {
    id: "esa-4",
    event_id: "wedding",
    event_label: "Wedding",
    space_id: "space-ballroom",
    setup_window: "Day 3, 6 AM",
    turnover: "flip_from_prior",
    turnover_note: "Flipped from Sangeet",
  },
  {
    id: "esa-5",
    event_id: "reception",
    event_label: "Reception",
    space_id: "space-terrace",
    setup_window: "Day 3, 2 PM",
    turnover: "none",
    turnover_note: "",
  },
];

const SEED_TRANSITIONS: TransitionPlan[] = [
  {
    id: "trans-1",
    title: "Sangeet → Wedding",
    flip_window_hours: 5,
    steps: [
      { id: "t-1", time: "11:00 PM", action: "Sangeet ends, guests exit" },
      { id: "t-2", time: "11:15 PM", action: "Teardown crew begins (Sangeet stage, cocktail tables)" },
      { id: "t-3", time: "1:00 AM", action: "Sangeet fully cleared" },
      { id: "t-4", time: "1:00 AM", action: "Floral team pre-builds mandap offsite" },
      { id: "t-5", time: "5:00 AM", action: "Mandap carried in, positioned center" },
      { id: "t-6", time: "6:00 AM", action: "Floral team dresses mandap, aisle, entrance" },
      { id: "t-7", time: "8:00 AM", action: "Lighting reset (ceremony wash)" },
      { id: "t-8", time: "9:00 AM", action: "Chairs set, programs placed" },
      { id: "t-9", time: "10:00 AM", action: "Final walkthrough with planner" },
      { id: "t-10", time: "10:30 AM", action: "Venue open to guests" },
      { id: "t-11", time: "11:00 AM", action: "Ceremony begins" },
    ],
    warning: "5 hours is tight for a full mandap build",
    suggestion: "Pre-build mandap structure offsite to save 2 hours",
  },
];

// ── Seed: mandap ────────────────────────────────────────────────────────────

const SEED_MANDAP_STYLES: MandapStyleOption[] = [
  {
    id: "ms-1",
    title: "Traditional four-pillar",
    description: "Four ornate posts, full floral, closed top.",
    gradient: "linear-gradient(135deg, #8B2A1F 0%, #D4A853 100%)",
    reaction: null,
  },
  {
    id: "ms-2",
    title: "Garden open four-pillar",
    description: "Airy posts with trailing garden roses, open sides.",
    gradient: "linear-gradient(135deg, #C4876E 0%, #8FA076 100%)",
    reaction: null,
  },
  {
    id: "ms-3",
    title: "Modern geometric",
    description: "Clean metal frame, restrained florals, architectural.",
    gradient: "linear-gradient(135deg, #C8A24B 0%, #3B1F4A 100%)",
    reaction: null,
  },
  {
    id: "ms-4",
    title: "Canopy draping",
    description: "Soft fabric canopy with floral clusters, no pillars.",
    gradient: "linear-gradient(135deg, #F5ECE1 0%, #D9B9B1 100%)",
    reaction: null,
  },
];

const SEED_MANDAP_ELEMENTS: MandapElementState[] = [
  {
    id: "havan_kund",
    label: "Havan kund (fire pit)",
    detail: "Centered, fire-safe mat",
    required: true,
    included: true,
  },
  {
    id: "pillar_florals",
    label: "Pillar florals",
    detail: "Jasmine + roses + marigold garlands",
    required: false,
    included: true,
  },
  {
    id: "ceiling_canopy",
    label: "Ceiling canopy",
    detail: "Sheer fabric + flower clusters",
    required: false,
    included: false,
  },
  {
    id: "aisle_columns",
    label: "Aisle columns",
    detail: "Floral pillars every 8'",
    required: false,
    included: false,
  },
  {
    id: "entrance_arch",
    label: "Entrance arch",
    detail: "Freestanding, floral",
    required: false,
    included: false,
  },
  {
    id: "backdrop",
    label: "Backdrop",
    detail: "Behind mandap for photography",
    required: false,
    included: false,
  },
];

const SEED_MANDAP: MandapSpec = {
  vision: "",
  style_options: SEED_MANDAP_STYLES,
  structure: {
    style: "Open four-pillar",
    dimensions: "12' × 12' × 10' height",
    material: "Wood frame, floral-covered",
    orientation: "Couple faces east (traditional)",
  },
  elements: SEED_MANDAP_ELEMENTS,
  seating: {
    bride: "Cushion",
    groom: "Cushion",
    pandit: "Floor mat with small table for samagri",
    parents_bride: "Front row left",
    parents_groom: "Front row right",
  },
  fire_safety: {
    permit_confirmed: false,
    mat_procured: false,
    extinguisher_nearby: false,
    ventilation_confirmed: false,
  },
};

const SEED_STAGES: StageDesign[] = [
  {
    id: "stage-sangeet",
    event_id: "sangeet",
    label: "Sangeet stage",
    dimensions: "16' × 24' × 2' height",
    backdrop: "LED wall with colour wash",
    dance_floor: "30' × 30', in front of stage",
    lighting: "Moving heads, colour wash, follow spot",
    power: "Dedicated circuit for sound + lighting",
    wings: "Stage left: performer entry / Stage right: DJ booth",
  },
];

// ── Seed: vendors ───────────────────────────────────────────────────────────

const SEED_VENDORS: VendorEntry[] = [
  {
    id: "v-1",
    name: "Marigold & Co.",
    state: "shortlisted",
    portfolio_images: [
      "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600",
      "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=600",
      "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600",
      "https://images.unsplash.com/photo-1600122854034-16f0c0aaa79f?w=600",
    ],
    portfolio_highlights: "Full Sangeet setups, traditional mandaps, entrance installations.",
    pricing_model: "per_event",
    price_low: 85000,
    price_high: 120000,
    mandap_line_item: 28000,
    floral_vs_nonfloral: "~70% floral / 30% structural",
    team_size: "14 install, 8 teardown",
    install_window: "Needs venue access 36 hours before Sangeet",
    notes: "",
    created_at: NOW,
  },
  {
    id: "v-2",
    name: "The Atelier Bloom",
    state: "considering",
    portfolio_images: [
      "https://images.unsplash.com/photo-1529519195486-16945f0fb37f?w=600",
      "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=600",
      "https://images.unsplash.com/photo-1606800052052-a08af7148866?w=600",
      "https://images.unsplash.com/photo-1604608672516-f1b9b1d1e9b5?w=600",
    ],
    portfolio_highlights: "Modern geometric mandaps, architectural floral installations.",
    pricing_model: "package",
    price_low: 140000,
    price_high: 180000,
    mandap_line_item: null,
    floral_vs_nonfloral: "~50% floral / 50% structural",
    team_size: "10 install, 6 teardown",
    install_window: "48 hours before first event",
    notes: "",
    created_at: NOW,
  },
];

const SEED_CONTRACTS: ContractRecord[] = [];

// ── Seed: install plan ──────────────────────────────────────────────────────

const SEED_INSTALL_TASKS: InstallTask[] = [
  // Day 1
  { id: "i-1-1", day: "day_1", time: "8:00 AM", title: "Load-in begins (dock B)", is_event: false, done: false },
  { id: "i-1-2", day: "day_1", time: "9:00 AM", title: "Haldi poolside setup", is_event: false, done: false },
  { id: "i-1-3", day: "day_1", time: "10:00 AM", title: "Mehendi courtyard setup (parallel)", is_event: false, done: false },
  { id: "i-1-4", day: "day_1", time: "2:00 PM", title: "Haldi ready for walkthrough", is_event: false, done: false },
  { id: "i-1-5", day: "day_1", time: "3:00 PM", title: "Mehendi ready for walkthrough", is_event: false, done: false },
  { id: "i-1-6", day: "day_1", time: "4:00 PM", title: "Begin Sangeet ballroom load-in", is_event: false, done: false },
  // Day 2
  { id: "i-2-1", day: "day_2", time: "6:00 AM", title: "Sangeet ballroom continues", is_event: false, done: false },
  { id: "i-2-2", day: "day_2", time: "12:00 PM", title: "Sangeet ready for lighting check", is_event: false, done: false },
  { id: "i-2-3", day: "day_2", time: "2:00 PM", title: "Sound check with DJ", is_event: false, done: false },
  { id: "i-2-4", day: "day_2", time: "4:00 PM", title: "Final walkthrough", is_event: false, done: false },
  { id: "i-2-5", day: "day_2", time: "6:00 PM", title: "SANGEET EVENT", is_event: true, done: false },
  { id: "i-2-6", day: "day_2", time: "11:00 PM", title: "Sangeet teardown begins", is_event: false, done: false },
  // Day 3
  { id: "i-3-1", day: "day_3", time: "1:00 AM", title: "Sangeet cleared", is_event: false, done: false },
  { id: "i-3-2", day: "day_3", time: "5:00 AM", title: "Mandap positioned (pre-built offsite)", is_event: false, done: false },
  { id: "i-3-3", day: "day_3", time: "6:00 AM", title: "Floral team dresses mandap + aisle", is_event: false, done: false },
  { id: "i-3-4", day: "day_3", time: "8:00 AM", title: "Ceremony lighting set", is_event: false, done: false },
  { id: "i-3-5", day: "day_3", time: "10:00 AM", title: "Final walkthrough", is_event: false, done: false },
  { id: "i-3-6", day: "day_3", time: "11:00 AM", title: "WEDDING CEREMONY", is_event: true, done: false },
  { id: "i-3-7", day: "day_3", time: "1:00 PM", title: "Ceremony teardown / reception setup", is_event: false, done: false },
  { id: "i-3-8", day: "day_3", time: "3:00 PM", title: "Reception ready", is_event: false, done: false },
  { id: "i-3-9", day: "day_3", time: "5:00 PM", title: "RECEPTION EVENT", is_event: true, done: false },
];

const SEED_COORDINATION: VendorCoordinationNote[] = [
  {
    id: "c-1",
    vendor_role: "Photographer",
    requirement: "Needs mandap complete 1 hour before ceremony for detail shots",
  },
  {
    id: "c-2",
    vendor_role: "Caterer",
    requirement: "Needs table setup done before they lay place settings",
  },
  {
    id: "c-3",
    vendor_role: "DJ / Sound",
    requirement: "Needs stage complete for sound check",
  },
  {
    id: "c-4",
    vendor_role: "Lighting",
    requirement: "Installs after décor structure is up",
  },
];

// ── Seed: discovery-first rebuild (v3) ──────────────────────────────────────
// Space cards mirror the spaces above but add the creative fields the
// Space Explorer uses: vibe text, per-event vibe for flips, element
// reactions, and per-space reference images.

const SEED_SPACE_REF_IMAGES: Record<string, string[]> = {
  "space-lawn": [
    "https://images.unsplash.com/photo-1617183428445-0e1adf2c8b03?w=600",
    "https://images.unsplash.com/photo-1600721391776-b5cd0e0048a9?w=600",
    "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=600",
  ],
  "space-courtyard": [
    "https://images.unsplash.com/photo-1610030006930-8b1b18b60b38?w=600",
    "https://images.unsplash.com/photo-1595940293613-19d8d97f7a4f?w=600",
    "https://images.unsplash.com/photo-1620783770629-122b7f187703?w=600",
  ],
  "space-ballroom": [
    "https://images.unsplash.com/photo-1600122854034-16f0c0aaa79f?w=600",
    "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600",
    "https://images.unsplash.com/photo-1529519195486-16945f0fb37f?w=600",
  ],
  "space-terrace": [
    "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600",
    "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=600",
    "https://images.unsplash.com/photo-1594908900066-3f47337549d8?w=600",
  ],
};

function toSpaceRefImages(space_id: string): SpaceReferenceImage[] {
  return (SEED_SPACE_REF_IMAGES[space_id] ?? []).map((url, i) => ({
    id: `sri-${space_id}-${i}`,
    image_url: url,
    source: "suggested" as const,
    reaction: null,
  }));
}

const SEED_SPACE_CARDS: DecorSpaceCard[] = [
  {
    id: "space-lawn",
    name: "Poolside lawn",
    space_type: "outdoor",
    event_ids: ["haldi"],
    vibe_text: "",
    vibe_by_event: {},
    element_reactions: {},
    reference_images: toSpaceRefImages("space-lawn"),
    indoor_outdoor: "outdoor",
    time_of_day: "morning",
  },
  {
    id: "space-courtyard",
    name: "Garden courtyard",
    space_type: "pre_event",
    event_ids: ["mehndi"],
    vibe_text: "",
    vibe_by_event: {},
    element_reactions: {},
    reference_images: toSpaceRefImages("space-courtyard"),
    indoor_outdoor: "outdoor",
    time_of_day: "afternoon",
  },
  {
    id: "space-ballroom",
    name: "Grand ballroom",
    space_type: "ceremony",
    event_ids: ["sangeet", "wedding"],
    vibe_text: "",
    vibe_by_event: {},
    element_reactions: {},
    reference_images: toSpaceRefImages("space-ballroom"),
    indoor_outdoor: "indoor",
    time_of_day: "evening",
  },
  {
    id: "space-terrace",
    name: "Grand ballroom terrace",
    space_type: "reception",
    event_ids: ["reception"],
    vibe_text: "",
    vibe_by_event: {},
    element_reactions: {},
    reference_images: toSpaceRefImages("space-terrace"),
    indoor_outdoor: "outdoor",
    time_of_day: "night",
  },
];

const FLORAL_EVENTS: EventDayId[] = [
  "haldi",
  "mehndi",
  "sangeet",
  "wedding",
  "reception",
];

const SEED_FLORAL_BY_EVENT: FloralByEvent[] = FLORAL_EVENTS.map((event_id) => ({
  event_id,
  palette_reactions: {},
  arrangement_keywords: [],
  scale: 50,
  reference_urls: [],
}));

const SEED_LIGHTING_MOODS: Record<EventDayId, number> = {
  haldi: 65,
  mehndi: 55,
  sangeet: 80,
  wedding: 45,
  reception: 70,
  welcome: 50,
  ganesh_puja: 50,
  post_brunch: 50,
};

const SEED_THEME_REFERENCES: ThemeReference[] = Object.entries(
  INSPIRATION_THEME_SEEDS,
).flatMap(([theme, urls]) =>
  (urls as string[]).map((url, i) => ({
    id: `tref-${theme}-${i}`,
    theme: theme as InspirationTheme,
    image_url: url,
    source: "suggested" as const,
    reaction: null as Reaction3,
  })),
);

// ── State shape ─────────────────────────────────────────────────────────────

export interface DecorState {
  // Tab 1: Vision & Mood
  quiz: DecorQuizAnswers;
  brief: string;
  style_keywords: string[];
  /** Overall formality (0–100): intimate & organic ↔ grand & opulent.
   * Distinct from floral scale. Mirrors guided session 1. */
  formality_score: number;
  event_palettes: EventPalette[];
  moodboard_pins: MoodboardPin[];
  active_moodboard_tag: MoodboardTag;
  references: ReferenceImage[];
  vision_notes: VisionNote[];
  /** Cultural / ritual requirements (Ganesh placement, mandap orientation,
   * etc.). Sibling list to vision_notes; surfaces in Tab 1 alongside
   * Want / Avoid. */
  cultural_requirements: CulturalRequirementNote[];

  // Tab 2: Spaces & Events
  event_space_map: EventSpaceAssignment[];
  spaces: SpaceDetail[];
  transitions: TransitionPlan[];
  expanded_space_id: string | null;

  // Tab 3: Mandap & Stage
  mandap: MandapSpec;
  stages: StageDesign[];

  // Tab 4: Shortlist & Contract
  vendors: VendorEntry[];
  contracts: ContractRecord[];

  // Tab 5: Install Plan
  install_tasks: InstallTask[];
  coordination_notes: VendorCoordinationNote[];

  // Tab 6: Documents
  documents: DecorDocument[];

  // v3 rebuild: discovery-first state
  space_cards: DecorSpaceCard[];
  floral_by_event: FloralByEvent[];
  lighting_moods: Record<EventDayId, number>;
  lighting_element_reactions: Record<string, Reaction3>;
  theme_references: ThemeReference[];
  space_dreams: SpaceDream[];

  // Florals — real vs faux + flower library
  flower_usage_mode: FlowerUsageMode;
  flower_usage_by_event: Partial<Record<EventDayId, FlowerUsageMode>>;
  favorite_flowers: string[];

  // Florals — guided-session reconciliation fields
  greenery_preference: GreeneryPreference;
  fragrance_important: boolean;
  cultural_flowers: CulturalFlowerNote[];
  sustainability_preference: SustainabilityPreference;

  // AI recommendations per space (stored when generated)
  space_ai_recommendations: Record<string, SpaceAIRecommendation>;

  // ── Actions ──
  setQuizAnswer: <K extends keyof DecorQuizAnswers>(
    key: K,
    value: DecorQuizAnswers[K],
  ) => void;
  completeQuiz: () => void;
  resetQuiz: () => void;
  setBrief: (brief: string) => void;
  setFormalityScore: (score: number) => void;
  toggleKeyword: (keyword: string) => void;
  addKeyword: (keyword: string) => void;
  addCulturalRequirement: (body: string) => void;
  removeCulturalRequirement: (id: string) => void;
  setGreeneryPreference: (pref: GreeneryPreference) => void;
  setFragranceImportant: (important: boolean) => void;
  addCulturalFlower: (flower: string, use: string) => void;
  removeCulturalFlower: (id: string) => void;
  setSustainabilityPreference: (pref: SustainabilityPreference) => void;
  setSpaceMeta: (
    space_id: string,
    patch: { indoor_outdoor?: SpaceIndoorOutdoor; time_of_day?: SpaceTimeOfDay },
  ) => void;
  updateEventPalette: (
    event_id: EventDayId,
    swatches: ColorSwatch[],
  ) => void;
  updateSwatch: (event_id: EventDayId, swatch_id: string, patch: Partial<ColorSwatch>) => void;
  addSwatch: (event_id: EventDayId) => void;
  removeSwatch: (event_id: EventDayId, swatch_id: string) => void;
  addMoodboardPin: (pin: Omit<MoodboardPin, "id" | "created_at">) => void;
  removeMoodboardPin: (pin_id: string) => void;
  setMoodboardTag: (tag: MoodboardTag) => void;
  addReference: (event_id: EventDayId, image_url: string) => void;
  setReferenceReaction: (ref_id: string, reaction: Reaction) => void;
  removeReference: (ref_id: string) => void;
  addVisionNote: (kind: "want" | "avoid", body: string) => void;
  removeVisionNote: (note_id: string) => void;

  addSpace: () => void;
  updateSpace: (space_id: string, patch: Partial<SpaceDetail>) => void;
  removeSpace: (space_id: string) => void;
  expandSpace: (space_id: string | null) => void;
  addEventSpaceAssignment: () => void;
  updateEventSpaceAssignment: (
    id: string,
    patch: Partial<EventSpaceAssignment>,
  ) => void;
  removeEventSpaceAssignment: (id: string) => void;
  addTransition: () => void;
  updateTransition: (id: string, patch: Partial<TransitionPlan>) => void;
  removeTransition: (id: string) => void;
  addTransitionStep: (plan_id: string) => void;
  updateTransitionStep: (plan_id: string, step_id: string, patch: Partial<TransitionStep>) => void;
  removeTransitionStep: (plan_id: string, step_id: string) => void;

  setMandapVision: (vision: string) => void;
  setMandapStyleReaction: (style_id: string, reaction: Reaction) => void;
  updateMandapStructure: (patch: Partial<MandapSpec["structure"]>) => void;
  toggleMandapElement: (element_id: string) => void;
  updateMandapElement: (element_id: string, patch: Partial<MandapElementState>) => void;
  updateMandapSeating: (patch: Partial<MandapSpec["seating"]>) => void;
  toggleFireSafety: (key: keyof MandapSpec["fire_safety"]) => void;
  updateStage: (stage_id: string, patch: Partial<StageDesign>) => void;
  addStage: () => void;
  removeStage: (stage_id: string) => void;

  addVendor: () => void;
  updateVendor: (vendor_id: string, patch: Partial<VendorEntry>) => void;
  setVendorState: (vendor_id: string, state: VendorState) => void;
  removeVendor: (vendor_id: string) => void;
  ensureContract: (vendor_id: string) => void;
  updateContract: (vendor_id: string, patch: Partial<ContractRecord>) => void;
  addMilestone: (vendor_id: string) => void;
  updateMilestone: (vendor_id: string, milestone_id: string, patch: Partial<PaymentMilestone>) => void;
  removeMilestone: (vendor_id: string, milestone_id: string) => void;

  addInstallTask: (day: InstallDay) => void;
  updateInstallTask: (task_id: string, patch: Partial<InstallTask>) => void;
  removeInstallTask: (task_id: string) => void;
  toggleInstallTask: (task_id: string) => void;
  addCoordinationNote: () => void;
  updateCoordinationNote: (id: string, patch: Partial<VendorCoordinationNote>) => void;
  removeCoordinationNote: (id: string) => void;

  addDocument: (kind: DocumentKind, name: string) => void;
  removeDocument: (doc_id: string) => void;

  // v3 actions: space cards
  addSpaceCard: () => void;
  updateSpaceCard: (card_id: string, patch: Partial<DecorSpaceCard>) => void;
  removeSpaceCard: (card_id: string) => void;
  setSpaceVibe: (card_id: string, vibe: string) => void;
  setSpaceVibeByEvent: (card_id: string, event_id: EventDayId, vibe: string) => void;
  setSpaceElementReaction: (
    card_id: string,
    element_id: string,
    reaction: Reaction3,
  ) => void;
  addSpaceRefImage: (card_id: string, image_url: string) => void;
  setSpaceRefReaction: (
    card_id: string,
    ref_id: string,
    reaction: Reaction3,
  ) => void;
  removeSpaceRefImage: (card_id: string, ref_id: string) => void;

  // v3 actions: floral by event
  setFloralPaletteReaction: (
    event_id: EventDayId,
    palette_id: string,
    reaction: Reaction3,
  ) => void;
  toggleFloralKeyword: (event_id: EventDayId, keyword: string) => void;
  addFloralKeyword: (event_id: EventDayId, keyword: string) => void;
  setFloralScale: (event_id: EventDayId, scale: number) => void;
  addFloralReference: (event_id: EventDayId, url: string) => void;
  removeFloralReference: (event_id: EventDayId, url: string) => void;

  // v3 actions: lighting
  setLightingMood: (event_id: EventDayId, mood: number) => void;
  setLightingElementReaction: (
    element_id: string,
    reaction: Reaction3,
  ) => void;

  // v3 actions: inspiration
  setThemeReaction: (ref_id: string, reaction: Reaction3) => void;
  addThemeReference: (theme: InspirationTheme, url: string) => void;
  removeThemeReference: (ref_id: string) => void;
  addSpaceDream: (body: string) => void;
  removeSpaceDream: (dream_id: string) => void;

  // Florals — real vs faux + favourites
  setFlowerUsageMode: (mode: FlowerUsageMode) => void;
  setFlowerUsageForEvent: (
    event_id: EventDayId,
    mode: FlowerUsageMode | null,
  ) => void;
  toggleFavoriteFlower: (flower_id: string) => void;

  // Colour palette — apply curated palette
  applyCuratedPalette: (
    event_id: EventDayId,
    swatches: { hex: string; name: string }[],
  ) => void;

  // AI recommendations for a space
  setSpaceAIRecommendation: (rec: SpaceAIRecommendation) => void;
  clearSpaceAIRecommendation: (space_id: string) => void;
}

const initial = () => ({
  quiz: SEED_QUIZ,
  brief: SEED_BRIEF,
  style_keywords: SEED_KEYWORDS,
  formality_score: 50,
  event_palettes: SEED_PALETTES,
  moodboard_pins: [] as MoodboardPin[],
  active_moodboard_tag: "all" as MoodboardTag,
  references: SEED_REFERENCES,
  vision_notes: [] as VisionNote[],
  cultural_requirements: [] as CulturalRequirementNote[],
  event_space_map: SEED_EVENT_SPACE_MAP,
  spaces: SEED_SPACES,
  transitions: SEED_TRANSITIONS,
  expanded_space_id: null as string | null,
  mandap: SEED_MANDAP,
  stages: SEED_STAGES,
  vendors: SEED_VENDORS,
  contracts: SEED_CONTRACTS,
  install_tasks: SEED_INSTALL_TASKS,
  coordination_notes: SEED_COORDINATION,
  documents: [] as DecorDocument[],
  space_cards: SEED_SPACE_CARDS,
  floral_by_event: SEED_FLORAL_BY_EVENT,
  lighting_moods: SEED_LIGHTING_MOODS,
  lighting_element_reactions: {} as Record<string, Reaction3>,
  theme_references: SEED_THEME_REFERENCES,
  space_dreams: [] as SpaceDream[],
  flower_usage_mode: "mix" as FlowerUsageMode,
  flower_usage_by_event: {} as Partial<Record<EventDayId, FlowerUsageMode>>,
  favorite_flowers: [] as string[],
  greenery_preference: "moderate" as GreeneryPreference,
  fragrance_important: false,
  cultural_flowers: [] as CulturalFlowerNote[],
  sustainability_preference: "nice_to_have" as SustainabilityPreference,
  space_ai_recommendations: {} as Record<string, SpaceAIRecommendation>,
});

export const useDecorStore = create<DecorState>()(
  persist(
    (set, get) => ({
      ...initial(),

      setQuizAnswer: (key, value) =>
        set((s) => ({ quiz: { ...s.quiz, [key]: value } })),
      completeQuiz: () =>
        set((s) => ({ quiz: { ...s.quiz, completedAt: new Date().toISOString() } })),
      resetQuiz: () => set({ quiz: SEED_QUIZ }),
      setBrief: (brief) => {
        set({ brief });
        const coupleId = getCurrentCoupleId();
        if (coupleId) dbUpsert("decor_state", { couple_id: coupleId, brief });
      },
      toggleKeyword: (keyword) => {
        set((s) => ({
          style_keywords: s.style_keywords.includes(keyword)
            ? s.style_keywords.filter((k) => k !== keyword)
            : [...s.style_keywords, keyword],
        }));
        const coupleId = getCurrentCoupleId();
        if (coupleId) {
          const { style_keywords } = useDecorStore.getState();
          dbUpsert("decor_state", { couple_id: coupleId, style_keywords });
        }
      },
      addKeyword: (keyword) => {
        const k = keyword.trim();
        if (!k) return;
        set((s) =>
          s.style_keywords.includes(k)
            ? s
            : { style_keywords: [...s.style_keywords, k] },
        );
      },
      setFormalityScore: (score) =>
        set({ formality_score: Math.max(0, Math.min(100, Math.round(score))) }),
      addCulturalRequirement: (body) => {
        const text = body.trim();
        if (!text) return;
        set((s) => ({
          cultural_requirements: [
            ...s.cultural_requirements,
            {
              id: id("cr"),
              body: text,
              created_at: new Date().toISOString(),
            },
          ],
        }));
      },
      removeCulturalRequirement: (id_) =>
        set((s) => ({
          cultural_requirements: s.cultural_requirements.filter(
            (n) => n.id !== id_,
          ),
        })),
      setGreeneryPreference: (pref) => set({ greenery_preference: pref }),
      setFragranceImportant: (important) =>
        set({ fragrance_important: important }),
      addCulturalFlower: (flower, use) => {
        const f = flower.trim();
        const u = use.trim();
        if (!f) return;
        set((s) => ({
          cultural_flowers: [
            ...s.cultural_flowers,
            {
              id: id("cf"),
              flower: f,
              use: u,
              created_at: new Date().toISOString(),
            },
          ],
        }));
      },
      removeCulturalFlower: (id_) =>
        set((s) => ({
          cultural_flowers: s.cultural_flowers.filter((f) => f.id !== id_),
        })),
      setSustainabilityPreference: (pref) =>
        set({ sustainability_preference: pref }),
      setSpaceMeta: (space_id, patch) =>
        set((s) => ({
          space_cards: s.space_cards.map((c) =>
            c.id === space_id ? { ...c, ...patch } : c,
          ),
        })),
      updateEventPalette: (event_id, swatches) =>
        set((s) => ({
          event_palettes: s.event_palettes.map((p) =>
            p.event_id === event_id ? { ...p, swatches } : p,
          ),
        })),
      updateSwatch: (event_id, swatch_id, patch) =>
        set((s) => ({
          event_palettes: s.event_palettes.map((p) =>
            p.event_id === event_id
              ? {
                  ...p,
                  swatches: p.swatches.map((sw) =>
                    sw.id === swatch_id ? { ...sw, ...patch } : sw,
                  ),
                }
              : p,
          ),
        })),
      addSwatch: (event_id) =>
        set((s) => ({
          event_palettes: s.event_palettes.map((p) =>
            p.event_id === event_id
              ? {
                  ...p,
                  swatches: [
                    ...p.swatches,
                    { id: id("sw"), hex: "#EDE3CF", name: "New" },
                  ],
                }
              : p,
          ),
        })),
      removeSwatch: (event_id, swatch_id) =>
        set((s) => ({
          event_palettes: s.event_palettes.map((p) =>
            p.event_id === event_id
              ? { ...p, swatches: p.swatches.filter((sw) => sw.id !== swatch_id) }
              : p,
          ),
        })),
      addMoodboardPin: (pin) => {
        const newPin = { ...pin, id: id("pin"), created_at: new Date().toISOString() };
        set((s) => ({
          moodboard_pins: [...s.moodboard_pins, newPin],
        }));
        const coupleId = getCurrentCoupleId();
        if (coupleId) {
          const { moodboard_pins } = useDecorStore.getState();
          dbUpsert("decor_state", { couple_id: coupleId, moodboard_pins: [...moodboard_pins, newPin] });
        }
      },
      removeMoodboardPin: (pin_id) =>
        set((s) => ({
          moodboard_pins: s.moodboard_pins.filter((p) => p.id !== pin_id),
        })),
      setMoodboardTag: (tag) => set({ active_moodboard_tag: tag }),
      addReference: (event_id, image_url) =>
        set((s) => ({
          references: [
            ...s.references,
            {
              id: id("ref"),
              event_id,
              image_url,
              source: "user",
              reaction: null,
              created_at: new Date().toISOString(),
            },
          ],
        })),
      setReferenceReaction: (ref_id, reaction) =>
        set((s) => ({
          references: s.references.map((r) =>
            r.id === ref_id ? { ...r, reaction } : r,
          ),
        })),
      removeReference: (ref_id) =>
        set((s) => ({ references: s.references.filter((r) => r.id !== ref_id) })),
      addVisionNote: (kind, body) => {
        const text = body.trim();
        if (!text) return;
        set((s) => ({
          vision_notes: [
            ...s.vision_notes,
            {
              id: id("note"),
              kind,
              body: text,
              created_at: new Date().toISOString(),
            },
          ],
        }));
      },
      removeVisionNote: (note_id) =>
        set((s) => ({
          vision_notes: s.vision_notes.filter((n) => n.id !== note_id),
        })),

      addSpace: () =>
        set((s) => ({
          spaces: [
            ...s.spaces,
            {
              id: id("space"),
              name: "New space",
              dimensions: "",
              capacity: "",
              restrictions: "",
              power: "",
              setup_notes: "",
            },
          ],
        })),
      updateSpace: (space_id, patch) =>
        set((s) => ({
          spaces: s.spaces.map((sp) =>
            sp.id === space_id ? { ...sp, ...patch } : sp,
          ),
        })),
      removeSpace: (space_id) =>
        set((s) => ({
          spaces: s.spaces.filter((sp) => sp.id !== space_id),
          event_space_map: s.event_space_map.map((e) =>
            e.space_id === space_id ? { ...e, space_id: "" } : e,
          ),
        })),
      expandSpace: (space_id) => set({ expanded_space_id: space_id }),
      addEventSpaceAssignment: () =>
        set((s) => ({
          event_space_map: [
            ...s.event_space_map,
            {
              id: id("esa"),
              event_id: "welcome" as EventDayId,
              event_label: "New event",
              space_id: s.spaces[0]?.id ?? "",
              setup_window: "",
              turnover: "none" as TurnoverKind,
              turnover_note: "",
            },
          ],
        })),
      updateEventSpaceAssignment: (id_, patch) =>
        set((s) => ({
          event_space_map: s.event_space_map.map((e) =>
            e.id === id_ ? { ...e, ...patch } : e,
          ),
        })),
      removeEventSpaceAssignment: (id_) =>
        set((s) => ({
          event_space_map: s.event_space_map.filter((e) => e.id !== id_),
        })),
      addTransition: () =>
        set((s) => ({
          transitions: [
            ...s.transitions,
            {
              id: id("trans"),
              title: "New transition",
              flip_window_hours: 4,
              steps: [],
              warning: "",
              suggestion: "",
            },
          ],
        })),
      updateTransition: (id_, patch) =>
        set((s) => ({
          transitions: s.transitions.map((t) =>
            t.id === id_ ? { ...t, ...patch } : t,
          ),
        })),
      removeTransition: (id_) =>
        set((s) => ({ transitions: s.transitions.filter((t) => t.id !== id_) })),
      addTransitionStep: (plan_id) =>
        set((s) => ({
          transitions: s.transitions.map((t) =>
            t.id === plan_id
              ? {
                  ...t,
                  steps: [
                    ...t.steps,
                    { id: id("step"), time: "", action: "" },
                  ],
                }
              : t,
          ),
        })),
      updateTransitionStep: (plan_id, step_id, patch) =>
        set((s) => ({
          transitions: s.transitions.map((t) =>
            t.id === plan_id
              ? {
                  ...t,
                  steps: t.steps.map((st) =>
                    st.id === step_id ? { ...st, ...patch } : st,
                  ),
                }
              : t,
          ),
        })),
      removeTransitionStep: (plan_id, step_id) =>
        set((s) => ({
          transitions: s.transitions.map((t) =>
            t.id === plan_id
              ? { ...t, steps: t.steps.filter((st) => st.id !== step_id) }
              : t,
          ),
        })),

      setMandapVision: (vision) =>
        set((s) => ({ mandap: { ...s.mandap, vision } })),
      setMandapStyleReaction: (style_id, reaction) =>
        set((s) => ({
          mandap: {
            ...s.mandap,
            style_options: s.mandap.style_options.map((o) =>
              o.id === style_id ? { ...o, reaction } : o,
            ),
          },
        })),
      updateMandapStructure: (patch) =>
        set((s) => ({
          mandap: { ...s.mandap, structure: { ...s.mandap.structure, ...patch } },
        })),
      toggleMandapElement: (element_id) =>
        set((s) => ({
          mandap: {
            ...s.mandap,
            elements: s.mandap.elements.map((e) =>
              e.id === element_id ? { ...e, included: !e.included } : e,
            ),
          },
        })),
      updateMandapElement: (element_id, patch) =>
        set((s) => ({
          mandap: {
            ...s.mandap,
            elements: s.mandap.elements.map((e) =>
              e.id === element_id ? { ...e, ...patch } : e,
            ),
          },
        })),
      updateMandapSeating: (patch) =>
        set((s) => ({
          mandap: { ...s.mandap, seating: { ...s.mandap.seating, ...patch } },
        })),
      toggleFireSafety: (key) =>
        set((s) => ({
          mandap: {
            ...s.mandap,
            fire_safety: {
              ...s.mandap.fire_safety,
              [key]: !s.mandap.fire_safety[key],
            },
          },
        })),
      updateStage: (stage_id, patch) =>
        set((s) => ({
          stages: s.stages.map((st) =>
            st.id === stage_id ? { ...st, ...patch } : st,
          ),
        })),
      addStage: () =>
        set((s) => ({
          stages: [
            ...s.stages,
            {
              id: id("stage"),
              event_id: "reception" as EventDayId,
              label: "New stage",
              dimensions: "",
              backdrop: "",
              dance_floor: "",
              lighting: "",
              power: "",
              wings: "",
            },
          ],
        })),
      removeStage: (stage_id) =>
        set((s) => ({ stages: s.stages.filter((st) => st.id !== stage_id) })),

      addVendor: () =>
        set((s) => ({
          vendors: [
            ...s.vendors,
            {
              id: id("v"),
              name: "New decorator",
              state: "considering",
              portfolio_images: [],
              portfolio_highlights: "",
              pricing_model: "per_event",
              price_low: null,
              price_high: null,
              mandap_line_item: null,
              floral_vs_nonfloral: "",
              team_size: "",
              install_window: "",
              notes: "",
              created_at: new Date().toISOString(),
            },
          ],
        })),
      updateVendor: (vendor_id, patch) =>
        set((s) => ({
          vendors: s.vendors.map((v) =>
            v.id === vendor_id ? { ...v, ...patch } : v,
          ),
        })),
      setVendorState: (vendor_id, state) =>
        set((s) => ({
          vendors: s.vendors.map((v) =>
            v.id === vendor_id ? { ...v, state } : v,
          ),
        })),
      removeVendor: (vendor_id) =>
        set((s) => ({
          vendors: s.vendors.filter((v) => v.id !== vendor_id),
          contracts: s.contracts.filter((c) => c.vendor_id !== vendor_id),
        })),
      ensureContract: (vendor_id) =>
        set((s) => {
          if (s.contracts.some((c) => c.vendor_id === vendor_id)) return s;
          return {
            contracts: [
              ...s.contracts,
              {
                vendor_id,
                signed: false,
                signed_date: "",
                contract_file: null,
                milestones: [
                  {
                    id: id("ml"),
                    label: "Signing deposit",
                    amount: 0,
                    due_date: "",
                    status: "due",
                  },
                  {
                    id: id("ml"),
                    label: "Mid-point payment",
                    amount: 0,
                    due_date: "",
                    status: "due",
                  },
                  {
                    id: id("ml"),
                    label: "Final balance",
                    amount: 0,
                    due_date: "",
                    status: "due",
                  },
                ],
              },
            ],
          };
        }),
      updateContract: (vendor_id, patch) =>
        set((s) => ({
          contracts: s.contracts.map((c) =>
            c.vendor_id === vendor_id ? { ...c, ...patch } : c,
          ),
        })),
      addMilestone: (vendor_id) =>
        set((s) => ({
          contracts: s.contracts.map((c) =>
            c.vendor_id === vendor_id
              ? {
                  ...c,
                  milestones: [
                    ...c.milestones,
                    {
                      id: id("ml"),
                      label: "Payment",
                      amount: 0,
                      due_date: "",
                      status: "due",
                    },
                  ],
                }
              : c,
          ),
        })),
      updateMilestone: (vendor_id, milestone_id, patch) =>
        set((s) => ({
          contracts: s.contracts.map((c) =>
            c.vendor_id === vendor_id
              ? {
                  ...c,
                  milestones: c.milestones.map((m) =>
                    m.id === milestone_id ? { ...m, ...patch } : m,
                  ),
                }
              : c,
          ),
        })),
      removeMilestone: (vendor_id, milestone_id) =>
        set((s) => ({
          contracts: s.contracts.map((c) =>
            c.vendor_id === vendor_id
              ? { ...c, milestones: c.milestones.filter((m) => m.id !== milestone_id) }
              : c,
          ),
        })),

      addInstallTask: (day) =>
        set((s) => ({
          install_tasks: [
            ...s.install_tasks,
            {
              id: id("it"),
              day,
              time: "",
              title: "New task",
              is_event: false,
              done: false,
            },
          ],
        })),
      updateInstallTask: (task_id, patch) =>
        set((s) => ({
          install_tasks: s.install_tasks.map((t) =>
            t.id === task_id ? { ...t, ...patch } : t,
          ),
        })),
      removeInstallTask: (task_id) =>
        set((s) => ({
          install_tasks: s.install_tasks.filter((t) => t.id !== task_id),
        })),
      toggleInstallTask: (task_id) =>
        set((s) => ({
          install_tasks: s.install_tasks.map((t) =>
            t.id === task_id ? { ...t, done: !t.done } : t,
          ),
        })),
      addCoordinationNote: () =>
        set((s) => ({
          coordination_notes: [
            ...s.coordination_notes,
            {
              id: id("cn"),
              vendor_role: "Vendor",
              requirement: "",
            },
          ],
        })),
      updateCoordinationNote: (id_, patch) =>
        set((s) => ({
          coordination_notes: s.coordination_notes.map((n) =>
            n.id === id_ ? { ...n, ...patch } : n,
          ),
        })),
      removeCoordinationNote: (id_) =>
        set((s) => ({
          coordination_notes: s.coordination_notes.filter((n) => n.id !== id_),
        })),

      addDocument: (kind, name) =>
        set((s) => ({
          documents: [
            ...s.documents,
            {
              id: id("doc"),
              kind,
              name: name.trim() || "Untitled document",
              size_kb: Math.floor(Math.random() * 4000) + 120,
              uploaded_at: new Date().toISOString(),
              url: null,
            },
          ],
        })),
      removeDocument: (doc_id) =>
        set((s) => ({ documents: s.documents.filter((d) => d.id !== doc_id) })),

      // ── v3: space cards ────────────────────────────────────────────────
      addSpaceCard: () =>
        set((s) => ({
          space_cards: [
            ...s.space_cards,
            {
              id: id("sc"),
              name: "New space",
              space_type: "reception" as DecorSpaceType,
              event_ids: [],
              vibe_text: "",
              vibe_by_event: {},
              element_reactions: {},
              reference_images: [],
            },
          ],
        })),
      updateSpaceCard: (card_id, patch) =>
        set((s) => ({
          space_cards: s.space_cards.map((c) =>
            c.id === card_id ? { ...c, ...patch } : c,
          ),
        })),
      removeSpaceCard: (card_id) =>
        set((s) => ({
          space_cards: s.space_cards.filter((c) => c.id !== card_id),
        })),
      setSpaceVibe: (card_id, vibe) =>
        set((s) => ({
          space_cards: s.space_cards.map((c) =>
            c.id === card_id ? { ...c, vibe_text: vibe } : c,
          ),
        })),
      setSpaceVibeByEvent: (card_id, event_id, vibe) =>
        set((s) => ({
          space_cards: s.space_cards.map((c) =>
            c.id === card_id
              ? { ...c, vibe_by_event: { ...c.vibe_by_event, [event_id]: vibe } }
              : c,
          ),
        })),
      setSpaceElementReaction: (card_id, element_id, reaction) =>
        set((s) => ({
          space_cards: s.space_cards.map((c) =>
            c.id === card_id
              ? {
                  ...c,
                  element_reactions: {
                    ...c.element_reactions,
                    [element_id]: reaction,
                  },
                }
              : c,
          ),
        })),
      addSpaceRefImage: (card_id, image_url) =>
        set((s) => ({
          space_cards: s.space_cards.map((c) =>
            c.id === card_id
              ? {
                  ...c,
                  reference_images: [
                    ...c.reference_images,
                    {
                      id: id("sri"),
                      image_url,
                      source: "user" as const,
                      reaction: null,
                    },
                  ],
                }
              : c,
          ),
        })),
      setSpaceRefReaction: (card_id, ref_id, reaction) =>
        set((s) => ({
          space_cards: s.space_cards.map((c) =>
            c.id === card_id
              ? {
                  ...c,
                  reference_images: c.reference_images.map((r) =>
                    r.id === ref_id ? { ...r, reaction } : r,
                  ),
                }
              : c,
          ),
        })),
      removeSpaceRefImage: (card_id, ref_id) =>
        set((s) => ({
          space_cards: s.space_cards.map((c) =>
            c.id === card_id
              ? {
                  ...c,
                  reference_images: c.reference_images.filter(
                    (r) => r.id !== ref_id,
                  ),
                }
              : c,
          ),
        })),

      // ── v3: floral by event ────────────────────────────────────────────
      setFloralPaletteReaction: (event_id, palette_id, reaction) =>
        set((s) => ({
          floral_by_event: s.floral_by_event.map((f) =>
            f.event_id === event_id
              ? {
                  ...f,
                  palette_reactions: {
                    ...f.palette_reactions,
                    [palette_id]: reaction,
                  },
                }
              : f,
          ),
        })),
      toggleFloralKeyword: (event_id, keyword) =>
        set((s) => ({
          floral_by_event: s.floral_by_event.map((f) =>
            f.event_id === event_id
              ? {
                  ...f,
                  arrangement_keywords: f.arrangement_keywords.includes(keyword)
                    ? f.arrangement_keywords.filter((k) => k !== keyword)
                    : [...f.arrangement_keywords, keyword],
                }
              : f,
          ),
        })),
      addFloralKeyword: (event_id, keyword) => {
        const k = keyword.trim();
        if (!k) return;
        set((s) => ({
          floral_by_event: s.floral_by_event.map((f) =>
            f.event_id === event_id && !f.arrangement_keywords.includes(k)
              ? { ...f, arrangement_keywords: [...f.arrangement_keywords, k] }
              : f,
          ),
        }));
      },
      setFloralScale: (event_id, scale) =>
        set((s) => ({
          floral_by_event: s.floral_by_event.map((f) =>
            f.event_id === event_id ? { ...f, scale } : f,
          ),
        })),
      addFloralReference: (event_id, url) => {
        const u = url.trim();
        if (!u) return;
        set((s) => ({
          floral_by_event: s.floral_by_event.map((f) =>
            f.event_id === event_id && !f.reference_urls.includes(u)
              ? { ...f, reference_urls: [...f.reference_urls, u] }
              : f,
          ),
        }));
      },
      removeFloralReference: (event_id, url) =>
        set((s) => ({
          floral_by_event: s.floral_by_event.map((f) =>
            f.event_id === event_id
              ? { ...f, reference_urls: f.reference_urls.filter((u) => u !== url) }
              : f,
          ),
        })),

      // ── v3: lighting ───────────────────────────────────────────────────
      setLightingMood: (event_id, mood) =>
        set((s) => ({
          lighting_moods: { ...s.lighting_moods, [event_id]: mood },
        })),
      setLightingElementReaction: (element_id, reaction) =>
        set((s) => ({
          lighting_element_reactions: {
            ...s.lighting_element_reactions,
            [element_id]: reaction,
          },
        })),

      // ── v3: inspiration ────────────────────────────────────────────────
      setThemeReaction: (ref_id, reaction) =>
        set((s) => ({
          theme_references: s.theme_references.map((r) =>
            r.id === ref_id ? { ...r, reaction } : r,
          ),
        })),
      addThemeReference: (theme, url) => {
        const u = url.trim();
        if (!u) return;
        set((s) => ({
          theme_references: [
            ...s.theme_references,
            {
              id: id("tref"),
              theme,
              image_url: u,
              source: "user" as const,
              reaction: null,
            },
          ],
        }));
      },
      removeThemeReference: (ref_id) =>
        set((s) => ({
          theme_references: s.theme_references.filter((r) => r.id !== ref_id),
        })),
      addSpaceDream: (body) => {
        const text = body.trim();
        if (!text) return;
        set((s) => ({
          space_dreams: [
            ...s.space_dreams,
            {
              id: id("sd"),
              body: text,
              created_at: new Date().toISOString(),
            },
          ],
        }));
      },
      removeSpaceDream: (dream_id) =>
        set((s) => ({
          space_dreams: s.space_dreams.filter((d) => d.id !== dream_id),
        })),

      // ── Florals: real vs faux + favourites ────────────────────────────
      setFlowerUsageMode: (mode) => set({ flower_usage_mode: mode }),
      setFlowerUsageForEvent: (event_id, mode) =>
        set((s) => {
          const next = { ...s.flower_usage_by_event };
          if (mode == null) {
            delete next[event_id];
          } else {
            next[event_id] = mode;
          }
          return { flower_usage_by_event: next };
        }),
      toggleFavoriteFlower: (flower_id) =>
        set((s) => ({
          favorite_flowers: s.favorite_flowers.includes(flower_id)
            ? s.favorite_flowers.filter((id_) => id_ !== flower_id)
            : [...s.favorite_flowers, flower_id],
        })),

      // ── Apply a curated colour palette to an event ────────────────────
      applyCuratedPalette: (event_id, swatches) =>
        set((s) => ({
          event_palettes: s.event_palettes.map((p) =>
            p.event_id === event_id
              ? {
                  ...p,
                  swatches: swatches.map((sw) => ({
                    id: id("sw"),
                    hex: sw.hex,
                    name: sw.name,
                  })),
                }
              : p,
          ),
        })),

      // ── AI recommendations per space ──────────────────────────────────
      setSpaceAIRecommendation: (rec) =>
        set((s) => ({
          space_ai_recommendations: {
            ...s.space_ai_recommendations,
            [rec.space_id]: rec,
          },
        })),
      clearSpaceAIRecommendation: (space_id) =>
        set((s) => {
          const next = { ...s.space_ai_recommendations };
          delete next[space_id];
          return { space_ai_recommendations: next };
        }),
    }),
    {
      name: "ananya:decor-workspace:v3",
      storage: createJSONStorage(() => (typeof window !== "undefined" ? localStorage : { getItem: () => null, setItem: () => {}, removeItem: () => {} })),
    },
  ),
);

// ── Formatting helpers (consumed by scroll/* + tabs/*) ──────────────────────

export function formatPriceRange(
  low: number | null,
  high: number | null,
): string {
  const fmt = (n: number) =>
    n >= 1000 ? `$${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}K` : `$${n}`;
  if (low != null && high != null) {
    if (low === high) return fmt(low);
    return `${fmt(low)} – ${fmt(high)}`;
  }
  if (low != null) return `${fmt(low)}+`;
  if (high != null) return `up to ${fmt(high)}`;
  return "Pricing TBD";
}

const EVENT_BADGE_COLORS: Record<string, string> = {
  mehndi: "#E09E2E",
  haldi: "#E8B84B",
  sangeet: "#8B4A6B",
  wedding: "#8B2A1F",
  reception: "#5D6E4D",
};

export function eventBadgeColor(eventId: string): string {
  return EVENT_BADGE_COLORS[eventId] ?? "#7B6757";
}
