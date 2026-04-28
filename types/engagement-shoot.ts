// ── Engagement Photo Shoot module types ────────────────────────────────────
// Non-vendor module in Memories & Keepsakes. Six phases mapped to six tabs:
// Vision Session, Mood Board, Outfit Board, Location & Trip, Run Sheet, Final
// Board. Persisted via stores/engagement-shoot-store.ts (localStorage only).
//
// Design intent is captured in ananya-ai-feature-spec.md / the Engagement
// Photo Shoot brief — visual-first, culturally aware, trip-scale planning.

// ── Phase 1 · Vision Session ───────────────────────────────────────────────

export type ShootEnergy =
  | "effortless"
  | "editorial"
  | "romantic"
  | "urban"
  | "adventure"
  | "cultural"
  | "vintage";

export type OutfitCount = "one" | "two" | "three" | "four_five" | "five_plus";

export type CulturalAttire =
  | "south_asian"
  | "east_asian"
  | "middle_eastern"
  | "african"
  | "other_cultural"
  | "all_western";

export type TripScope = "destination" | "local_day" | "shoot_only";

export type PhotographerStatus = "booked" | "searching" | "need_guidance";

export type BudgetTier =
  | "under_500"
  | "500_1500"
  | "1500_3000"
  | "3000_5000"
  | "5000_plus"
  | "have_it";

export interface ReferenceHeart {
  id: string;
  imageUrl: string;
  caption: string;
  // Loose tags the AI pattern-matcher can use: "golden_hour", "urban", etc.
  tags: string[];
  hearted: boolean;
}

export interface VisionSession {
  energies: ShootEnergy[]; // up to two
  outfitCount: OutfitCount | null;
  culturalAttire: CulturalAttire[];
  tripScope: TripScope | null;
  destinationIdea: string;
  localCity: string;
  shootDate: string; // ISO or free text (e.g. "Late September")
  monthsBeforeWedding: number | null;
  usedForSaveTheDates: boolean;
  photographyBudget: BudgetTier | null;
  travelBudget: BudgetTier | null;
  outfitBudget: BudgetTier | null;
  hmuaBudget: BudgetTier | null;
  photographerStatus: PhotographerStatus | null;
  photographerName: string;
  photographerPortfolio: string;
  completedAt: string | null; // ISO when quiz considered done
}

// ── Phase 2 · Mood Board ───────────────────────────────────────────────────

export type MoodBoardSection =
  | "lighting_mood"
  | "posing_interaction"
  | "setting_backdrop"
  | "detail_shots";

export interface MoodBoardPin {
  id: string;
  imageUrl: string;
  caption: string;
  section: MoodBoardSection;
}

export type ShotCategory =
  | "must_have"
  | "couple"
  | "detail"
  | "environment"
  | "save_the_date"
  | "cultural"
  | "per_look";

export interface ShotListItem {
  id: string;
  title: string;
  category: ShotCategory;
  note?: string;
  priority: "must" | "preferred" | "nice";
  done: boolean;
}

export interface MoodBoard {
  directionTitle: string; // e.g. "Golden Hour Meets Glamour"
  directionParagraph: string;
  paletteNote: string; // "Warm, amber, earth tones against natural backdrops"
  avoidNote: string;
  photographerBrief: string; // brief for the photographer
  pins: MoodBoardPin[];
  shots: ShotListItem[];
}

// ── Phase 3 · Outfit Curation ──────────────────────────────────────────────

export type OutfitStyle =
  | "western_casual"
  | "western_cocktail"
  | "western_formal"
  | "editorial"
  | "south_asian_traditional"
  | "south_asian_fusion"
  | "east_asian_traditional"
  | "middle_eastern_traditional"
  | "african_traditional"
  | "other_cultural";

export type OutfitItemStatus =
  | "considering"
  | "ordered"
  | "arrived"
  | "altered"
  | "ready";

export type OutfitItemCategory =
  | "dress"
  | "suit"
  | "shirt"
  | "shoes"
  | "jewelry"
  | "accessories"
  | "clutch"
  | "hair"
  | "turban"
  | "dupatta"
  | "pocket_square"
  | "other";

export type LookOwner = "p1" | "p2" | "both";

export interface OutfitItem {
  id: string;
  lookId: string;
  owner: LookOwner;
  category: OutfitItemCategory;
  title: string;
  sourceUrl: string;
  imageUrl: string;
  priceCents: number;
  status: OutfitItemStatus;
  note?: string;
}

export interface LookCoordination {
  colorP1: string;
  colorP2: string;
  formality: "casual" | "cocktail" | "formal" | "editorial" | "traditional";
  notes: string;
}

export interface Look {
  id: string;
  index: number; // 1, 2, 3…
  name: string; // "The Casual Us"
  concept: string;
  style: OutfitStyle;
  partner1Direction: string;
  partner2Direction: string;
  coordination: LookCoordination;
  hairMakeupNote: string;
  locationSlotId: string | null; // links to Phase 4 location
  estimatedMinutes: number; // shooting window in minutes
}

// ── Phase 4 · Location & Trip ──────────────────────────────────────────────

export type TripLogisticStatus = "researching" | "held" | "booked";

export interface ShootLocation {
  id: string;
  name: string;
  address: string;
  imageUrl: string;
  whyItWorks: string;
  bestTime: string; // e.g. "sunrise — 6:00–7:30am"
  permitNote: string;
  logistics: string; // parking, restrooms, changing
  orderIndex: number;
}

export interface TripDayItem {
  id: string;
  dayId: string;
  time: string; // "3:00 PM" or "Morning"
  title: string;
  detail: string;
  kind: "travel" | "shoot" | "meal" | "rest" | "experience";
}

export interface TripDay {
  id: string;
  label: string; // "Friday — Arrive & Settle In"
  date: string; // ISO or free text
  summary: string;
  orderIndex: number;
}

export interface TripLogistic {
  id: string;
  label: string; // "Samode Haveli — 2 nights"
  kind: "flight" | "hotel" | "car" | "activity" | "other";
  status: TripLogisticStatus;
  amountCents: number;
  note: string;
}

// ── Phase 5 · Run Sheet ────────────────────────────────────────────────────

export type RunSheetEntryKind =
  | "prep"
  | "hmua"
  | "dress"
  | "travel"
  | "shoot"
  | "break"
  | "meal"
  | "golden_hour"
  | "wrap";

export interface RunSheetEntry {
  id: string;
  time: string; // "4:30 AM", "6:30 PM"
  durationMinutes: number;
  title: string;
  detail: string;
  kind: RunSheetEntryKind;
  lookId: string | null;
  locationId: string | null;
  orderIndex: number;
}

export interface EmergencyKitItem {
  id: string;
  label: string;
  packed: boolean;
}

export interface WeatherContingency {
  trigger: string; // "If it rains" / "If it's too hot"
  plan: string;
}

// ── Phase 6 · Final Board (shareable) ──────────────────────────────────────

export interface SharedBoardSettings {
  shareEnabled: boolean;
  shareTitle: string;
  shareRecipients: string[]; // "photographer@email.com"
  coverImageUrl: string;
}

// ── Root state ─────────────────────────────────────────────────────────────

export interface EngagementShootState {
  vision: VisionSession;
  references: ReferenceHeart[];
  moodBoard: MoodBoard;
  looks: Look[];
  outfitItems: OutfitItem[];
  locations: ShootLocation[];
  tripDays: TripDay[];
  tripItems: TripDayItem[];
  logistics: TripLogistic[];
  runSheet: RunSheetEntry[];
  emergencyKit: EmergencyKitItem[];
  contingencies: WeatherContingency[];
  sharedBoard: SharedBoardSettings;
}

// ── Display metadata ───────────────────────────────────────────────────────

export const ENERGY_OPTIONS: {
  id: ShootEnergy;
  emoji: string;
  label: string;
  blurb: string;
}[] = [
  {
    id: "effortless",
    emoji: "🌅",
    label: "Effortless & natural",
    blurb: "Candid, golden hour, laughing in motion",
  },
  {
    id: "editorial",
    emoji: "🖤",
    label: "Editorial & cinematic",
    blurb: "Dramatic lighting, fashion-forward, magazine energy",
  },
  {
    id: "romantic",
    emoji: "🌸",
    label: "Romantic & dreamy",
    blurb: "Soft light, florals, flowing fabrics, painterly",
  },
  {
    id: "urban",
    emoji: "🏙️",
    label: "Urban & modern",
    blurb: "City streets, neon, rooftops, contemporary edge",
  },
  {
    id: "adventure",
    emoji: "🏜️",
    label: "Epic & adventurous",
    blurb: "Mountains, deserts, cliffs — landscape as co-star",
  },
  {
    id: "cultural",
    emoji: "🕌",
    label: "Cultural & celebratory",
    blurb: "Traditional attire, rich colors, heritage locations",
  },
  {
    id: "vintage",
    emoji: "🎞️",
    label: "Vintage & nostalgic",
    blurb: "Film-grain aesthetic, retro styling, timeless",
  },
];

export const OUTFIT_COUNT_OPTIONS: {
  id: OutfitCount;
  label: string;
  blurb: string;
}[] = [
  { id: "one", label: "1 outfit", blurb: "One perfect look" },
  { id: "two", label: "2 outfits", blurb: "Casual + dressed up" },
  { id: "three", label: "3 outfits", blurb: "Casual, formal, and something special" },
  { id: "four_five", label: "4–5 outfits", blurb: "Full wardrobe, multiple settings" },
  { id: "five_plus", label: "5+ outfits", blurb: "This is a production" },
];

export const CULTURAL_OPTIONS: {
  id: CulturalAttire;
  label: string;
}[] = [
  { id: "south_asian", label: "Indian / South Asian" },
  { id: "east_asian", label: "East Asian" },
  { id: "middle_eastern", label: "Middle Eastern / North African" },
  { id: "african", label: "African" },
  { id: "other_cultural", label: "Other cultural attire" },
  { id: "all_western", label: "All Western / contemporary" },
];

export const TRIP_SCOPE_OPTIONS: {
  id: TripScope;
  label: string;
  blurb: string;
}[] = [
  {
    id: "destination",
    label: "Destination",
    blurb: "Planning a trip — new city, travel involved",
  },
  {
    id: "local_day",
    label: "Local day-out",
    blurb: "Local, but making a day of it",
  },
  {
    id: "shoot_only",
    label: "Just the shoot",
    blurb: "Keeping it simple, no trip",
  },
];

export const BUDGET_OPTIONS: { id: BudgetTier; label: string }[] = [
  { id: "under_500", label: "Under $500" },
  { id: "500_1500", label: "$500 – $1,500" },
  { id: "1500_3000", label: "$1,500 – $3,000" },
  { id: "3000_5000", label: "$3,000 – $5,000" },
  { id: "5000_plus", label: "$5,000+" },
  { id: "have_it", label: "Already have what we need" },
];

export const PHOTOGRAPHER_STATUS_OPTIONS: {
  id: PhotographerStatus;
  label: string;
  blurb: string;
}[] = [
  { id: "booked", label: "Already booked", blurb: "We have our photographer" },
  { id: "searching", label: "Still looking", blurb: "Need to find one" },
  { id: "need_guidance", label: "Need guidance", blurb: "Not sure where to start" },
];

export const MOODBOARD_SECTION_LABEL: Record<MoodBoardSection, string> = {
  lighting_mood: "Lighting & mood",
  posing_interaction: "Posing & interaction",
  setting_backdrop: "Setting & backdrop",
  detail_shots: "Detail shots",
};

export const SHOT_CATEGORY_LABEL: Record<ShotCategory, string> = {
  must_have: "Must-have",
  couple: "Couple",
  detail: "Detail",
  environment: "Environment",
  save_the_date: "Save-the-date",
  cultural: "Cultural",
  per_look: "Per look",
};

export const STYLE_LABEL: Record<OutfitStyle, string> = {
  western_casual: "Western casual",
  western_cocktail: "Western cocktail",
  western_formal: "Western formal",
  editorial: "Editorial / fashion-forward",
  south_asian_traditional: "South Asian traditional",
  south_asian_fusion: "Indo-Western fusion",
  east_asian_traditional: "East Asian traditional",
  middle_eastern_traditional: "Middle Eastern / North African",
  african_traditional: "African traditional",
  other_cultural: "Other cultural",
};

export const ITEM_STATUS_LABEL: Record<OutfitItemStatus, string> = {
  considering: "Considering",
  ordered: "Ordered",
  arrived: "Arrived",
  altered: "Altered",
  ready: "Ready",
};

export const ITEM_CATEGORY_LABEL: Record<OutfitItemCategory, string> = {
  dress: "Dress / outfit",
  suit: "Suit",
  shirt: "Shirt / top",
  shoes: "Shoes",
  jewelry: "Jewelry",
  accessories: "Accessories",
  clutch: "Clutch / bag",
  hair: "Hair piece",
  turban: "Turban / pagri",
  dupatta: "Dupatta / scarf",
  pocket_square: "Pocket square",
  other: "Other",
};

export const RUN_SHEET_KIND_LABEL: Record<RunSheetEntryKind, string> = {
  prep: "Prep",
  hmua: "Hair & makeup",
  dress: "Dress",
  travel: "Travel",
  shoot: "Shoot",
  break: "Break",
  meal: "Meal",
  golden_hour: "Golden hour",
  wrap: "Wrap",
};
