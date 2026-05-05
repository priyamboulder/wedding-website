// ── Décor & Florals types (rebuilt) ─────────────────────────────────────────
// Data model for the 6-tab Décor workspace: Vision & Mood, Spaces & Events,
// Mandap & Stage, Shortlist & Contract, Install Plan, Documents.

import type { EventDayId } from "@/types/checklist";

// ── Tab 1: Vision & Mood ────────────────────────────────────────────────────

export type DecorFeeling =
  | "grand_opulent"
  | "intimate_warm"
  | "modern_minimal"
  | "whimsical_playful"
  | "traditional_sacred";

export type FloralRelationship =
  | "lush_everywhere"
  | "elegant_strategic"
  | "minimal_space"
  | "mixed_elements";

export type ColorLean =
  | "jewel_tones"
  | "soft_pastels"
  | "neutral_earthy"
  | "bold_vibrant"
  | "per_event";

export type Traditionality =
  | "deeply_traditional"
  | "modern_with_touches"
  | "fully_contemporary"
  | "shifts_across_events";

export type FocalPriority =
  | "mandap"
  | "entrance"
  | "dinner_table"
  | "overall_atmosphere";

export interface DecorQuizAnswers {
  feeling: DecorFeeling | null;
  florals: FloralRelationship | null;
  colors: ColorLean | null;
  traditionality: Traditionality | null;
  focal: FocalPriority | null;
  completedAt: string | null;
}

export interface ColorSwatch {
  id: string;
  hex: string;
  name: string;
}

export interface EventPalette {
  event_id: EventDayId;
  label: string;
  swatches: ColorSwatch[];
}

export type MoodboardTag =
  | "all"
  | "mandap"
  | "entrance"
  | "table"
  | "lighting"
  | "florals"
  | "stage"
  | "ceiling"
  | "aisle";

export interface MoodboardPin {
  id: string;
  image_url: string;
  caption: string;
  event_id: EventDayId | null;
  element_tag: Exclude<MoodboardTag, "all">;
  created_at: string;
}

export type Reaction = "love" | "not_for_us" | null;

export interface ReferenceImage {
  id: string;
  event_id: EventDayId;
  image_url: string;
  source: "suggested" | "user";
  reaction: Reaction;
  created_at: string;
}

export interface VisionNote {
  id: string;
  kind: "want" | "avoid";
  body: string;
  created_at: string;
}

// ── Tab 2: Spaces & Events ──────────────────────────────────────────────────

export type SetupSlot =
  | "day_minus_2_am"
  | "day_minus_2_pm"
  | "day_minus_1_am"
  | "day_minus_1_pm"
  | "day_of_am"
  | "day_of_pm";

export type TurnoverKind = "none" | "flip_from_prior" | "flip_to_next";

export interface EventSpaceAssignment {
  id: string;
  event_id: EventDayId;
  event_label: string;
  space_id: string;
  setup_window: string; // free-text like "Day 2, 8 AM"
  turnover: TurnoverKind;
  turnover_note: string;
}

export interface SpaceDetail {
  id: string;
  name: string;
  dimensions: string; // "80' × 120', 20' ceiling"
  capacity: string; // "400 seated, 600 standing"
  restrictions: string;
  power: string;
  setup_notes: string; // freeform markdown-ish description of setup(s)
}

export interface TransitionStep {
  id: string;
  time: string; // "11:00 PM"
  action: string;
}

export interface TransitionPlan {
  id: string;
  title: string; // "Sangeet → Wedding"
  flip_window_hours: number;
  steps: TransitionStep[];
  warning: string;
  suggestion: string;
}

// ── Tab 3: Mandap & Stage ───────────────────────────────────────────────────

export interface MandapStyleOption {
  id: string;
  title: string;
  description: string;
  gradient: string;
  reaction: Reaction;
}

export type MandapElementId =
  | "havan_kund"
  | "pillar_florals"
  | "ceiling_canopy"
  | "aisle_columns"
  | "entrance_arch"
  | "backdrop";

export interface MandapElementState {
  id: MandapElementId;
  label: string;
  detail: string;
  required: boolean;
  included: boolean;
}

export interface MandapSeating {
  bride: string;
  groom: string;
  pandit: string;
  parents_bride: string;
  parents_groom: string;
}

export interface FireSafetyChecklist {
  permit_confirmed: boolean;
  mat_procured: boolean;
  extinguisher_nearby: boolean;
  ventilation_confirmed: boolean;
}

export interface MandapSpec {
  vision: string;
  style_options: MandapStyleOption[];
  structure: {
    style: string;
    dimensions: string;
    material: string;
    orientation: string;
  };
  elements: MandapElementState[];
  seating: MandapSeating;
  fire_safety: FireSafetyChecklist;
}

export interface StageDesign {
  id: string;
  event_id: EventDayId;
  label: string;
  dimensions: string;
  backdrop: string;
  dance_floor: string;
  lighting: string;
  power: string;
  wings: string;
}

// ── Tab 4: Shortlist & Contract ─────────────────────────────────────────────

export type VendorState =
  | "considering"
  | "shortlisted"
  | "deciding"
  | "picked"
  | "booked"
  | "ruled_out";

export type PricingModel = "per_event" | "package" | "mandap_separate";

export interface VendorEntry {
  id: string;
  name: string;
  state: VendorState;
  portfolio_images: string[];
  portfolio_highlights: string; // "Full Sangeet setups, mandap, entrance installations"
  pricing_model: PricingModel;
  price_low: number | null;
  price_high: number | null;
  mandap_line_item: number | null;
  floral_vs_nonfloral: string; // "~60% floral / 40% structural"
  team_size: string; // "14 install, 8 teardown"
  install_window: string;
  notes: string;
  created_at: string;
}

export type PaymentStatus = "due" | "paid" | "overdue";

export interface PaymentMilestone {
  id: string;
  label: string;
  amount: number;
  due_date: string;
  status: PaymentStatus;
}

export interface ContractRecord {
  vendor_id: string;
  signed: boolean;
  signed_date: string;
  contract_file: string | null;
  milestones: PaymentMilestone[];
}

// ── Tab 5: Install Plan ─────────────────────────────────────────────────────

export type InstallDay = "day_1" | "day_2" | "day_3";

export interface InstallTask {
  id: string;
  day: InstallDay;
  time: string;
  title: string;
  is_event: boolean;
  done: boolean;
}

export interface VendorCoordinationNote {
  id: string;
  vendor_role: string; // "Photographer"
  requirement: string;
}

// ── Tab 6: Documents ────────────────────────────────────────────────────────

export type DocumentKind =
  | "contract"
  | "proposal"
  | "floor_plan"
  | "inspiration_deck"
  | "invoice"
  | "change_order"
  | "other";

export interface DecorDocument {
  id: string;
  kind: DocumentKind;
  name: string;
  size_kb: number;
  uploaded_at: string;
  url: string | null;
}

// ── Labels ──────────────────────────────────────────────────────────────────

export const FEELING_LABELS: Record<DecorFeeling, string> = {
  grand_opulent: "Grand & opulent",
  intimate_warm: "Intimate & warm",
  modern_minimal: "Modern & minimal",
  whimsical_playful: "Whimsical & playful",
  traditional_sacred: "Traditional & sacred",
};

export const FLORAL_LABELS: Record<FloralRelationship, string> = {
  lush_everywhere: "Massive, lush, everywhere",
  elegant_strategic: "Elegant and strategic",
  minimal_space: "Minimal — let the space speak",
  mixed_elements: "Mix flowers with non-floral elements",
};

export const COLOR_LABELS: Record<ColorLean, string> = {
  jewel_tones: "Rich jewel tones (ruby, emerald, gold)",
  soft_pastels: "Soft pastels (blush, ivory, sage)",
  neutral_earthy: "Neutral & earthy (cream, terracotta, olive)",
  bold_vibrant: "Bold & vibrant (marigold, fuchsia, turquoise)",
  per_event: "Each event should have its own palette",
};

export const TRADITION_LABELS: Record<Traditionality, string> = {
  deeply_traditional: "Deeply traditional",
  modern_with_touches: "Modern with Indian touches",
  fully_contemporary: "Fully contemporary",
  shifts_across_events: "Shifts across events",
};

export const FOCAL_LABELS: Record<FocalPriority, string> = {
  mandap: "The mandap — sacred centerpiece",
  entrance: "The entrance — first impression",
  dinner_table: "The dinner table — where guests linger",
  overall_atmosphere: "The overall atmosphere",
};

export const VENDOR_STATE_LABELS: Record<VendorState, string> = {
  considering: "Considering",
  shortlisted: "Shortlisted",
  deciding: "Deciding",
  picked: "Picked",
  booked: "Booked",
  ruled_out: "Ruled out",
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  due: "Due",
  paid: "Paid",
  overdue: "Overdue",
};

export const DOCUMENT_KIND_LABELS: Record<DocumentKind, string> = {
  contract: "Contract",
  proposal: "Design proposal",
  floor_plan: "Floor plan",
  inspiration_deck: "Inspiration deck",
  invoice: "Invoice",
  change_order: "Change order",
  other: "Other",
};

export const MOODBOARD_TAG_LABELS: Record<MoodboardTag, string> = {
  all: "All",
  mandap: "Mandap",
  entrance: "Entrance",
  table: "Table",
  lighting: "Lighting",
  florals: "Florals",
  stage: "Stage",
  ceiling: "Ceiling",
  aisle: "Aisle",
};

export const INSTALL_DAY_LABELS: Record<InstallDay, string> = {
  day_1: "Day 1",
  day_2: "Day 2",
  day_3: "Day 3",
};

// ── Scroll-workspace types ──────────────────────────────────────────────────
// Consumed by components/decor/scroll/*. The DecorScrollWorkspace layers a
// narrative lookbook on top of the 6-tab model; these are its shapes.

export type DesignElementCategory =
  | "florals"
  | "candles"
  | "greenery"
  | "fabric"
  | "sculptural"
  | "lighting"
  | "cultural"
  | "unconventional";

export interface DesignElementItem {
  id: string;
  category: DesignElementCategory;
  title: string;
  description: string;
  previewGradient: string;
}

export interface DesignElementPin {
  id: string;
  element_id: string;
  event_ids: EventDayId[];
  note: string;
  created_at: string;
}

export const DESIGN_ELEMENT_CATEGORY_LABELS: Record<DesignElementCategory, string> = {
  florals: "Florals",
  candles: "Candles",
  greenery: "Greenery",
  fabric: "Fabric",
  sculptural: "Sculptural",
  lighting: "Lighting",
  cultural: "Cultural",
  unconventional: "Unconventional",
};

export type ColorFeeling =
  | "warm_earthy"
  | "jewel_drama"
  | "soft_ethereal"
  | "bold_modern"
  | "garden_fresh"
  | "midnight_romance";

export type PaletteRole =
  | "primary_1"
  | "primary_2"
  | "accent"
  | "neutral"
  | "secondary";

export interface PaletteColor {
  id: string;
  role: PaletteRole;
  hex: string;
  name: string;
  usage: string;
}

export interface ColorFeelingPreset {
  id: ColorFeeling;
  title: string;
  subtitle: string;
  previewHexes: string[];
  blurb: string;
  seedPalette: Array<{ hex: string; name: string; usage: string }>;
}

export type ColorEmphasis = "lead" | "accent" | "recede";

export interface EventColorAssignment {
  color_id: string;
  emphasis: ColorEmphasis;
}

export interface EventPersonality {
  event_id: EventDayId;
  label: string;
  color_assignments: EventColorAssignment[];
}

export type SpaceTag =
  | "entrance"
  | "mandap"
  | "stage"
  | "dining"
  | "lounge"
  | "mehendi"
  | "backdrop"
  | "general";

export const SPACE_TAG_LABELS: Record<SpaceTag, string> = {
  entrance: "Entrance & Welcome",
  mandap: "Mandap / Ceremony",
  stage: "Sangeet Stage",
  dining: "Dining Area",
  lounge: "Lounge & Cocktail",
  mehendi: "Mehendi Area",
  backdrop: "Photo Backdrop",
  general: "General",
};

export type SpaceStage = "dreaming" | "exploring" | "direction_set";

export const SPACE_STAGE_LABELS: Record<SpaceStage, string> = {
  dreaming: "Dreaming",
  exploring: "Exploring",
  direction_set: "Direction Set",
};

export type MockupReaction = "love" | "not_for_us" | null;

export interface VenuePhoto {
  id: string;
  image_url: string;
  created_at: string;
}

export interface VenueAnalysis {
  id?: string;
  space_id?: string;
  analysis: string;
  created_at?: string;
}

export interface SpaceMockup {
  id: string;
  image_url: string;
  reaction: MockupReaction;
  created_at: string;
}

export interface SpacePin {
  id: string;
  inspiration_item_id: string;
  created_at: string;
}

export interface LayoutOption {
  id: string;
  title: string;
  description?: string;
}

export interface SpaceComment {
  id: string;
  body: string;
  created_at: string;
}

export interface Space {
  id: string;
  tag: SpaceTag;
  name: string;
  subtitle: string;
  event_ids: EventDayId[];
  stage: SpaceStage;
  venue_photos: VenuePhoto[];
  venue_analysis: VenueAnalysis | null;
  mockups: SpaceMockup[];
  pins: SpacePin[];
  layouts: LayoutOption[];
  comments: SpaceComment[];
  reference_image_urls: string[];
  palette_override_hex: string[];
  status: string;
  floor_plan_url: string | null;
  dimensions: {
    ceiling_height_ft: number | null;
    square_footage: number | null;
    power_outlets: string;
    light_direction: string;
  };
  allocated_budget: number | null;
  created_at: string;
  updated_at: string;
}

export type MoodboardItemKind =
  | "image"
  | "color_swatch"
  | "design_element_pin"
  | "sticky_note";

export interface MoodboardItem {
  id: string;
  kind: MoodboardItemKind;
  x: number;
  y: number;
  data: Record<string, unknown>;
}

export interface Moodboard {
  id: string;
  title: string;
  event_id: EventDayId | null;
  items: MoodboardItem[];
  created_at: string;
  updated_at: string;
}

export type InspirationCollection =
  | "modern_mandaps"
  | "garden_ceremonies"
  | "candlelit_receptions"
  | "minimal_entrances"
  | "maximal_florals"
  | "traditional_grandeur"
  | "bohemian_outdoor"
  | "dramatic_lighting";

export const INSPIRATION_COLLECTION_LABELS: Record<InspirationCollection, string> = {
  modern_mandaps: "Modern Mandaps",
  garden_ceremonies: "Garden Ceremonies",
  candlelit_receptions: "Candlelit Receptions",
  minimal_entrances: "Minimal Entrances",
  maximal_florals: "Maximal Florals",
  traditional_grandeur: "Traditional Grandeur",
  bohemian_outdoor: "Bohemian Outdoor",
  dramatic_lighting: "Dramatic Lighting",
};

export interface InspirationItem {
  id: string;
  collection: InspirationCollection;
  title: string;
  description: string;
  gradient: string;
  image_url: string | null;
  space_tags: SpaceTag[];
  style_tags: string[];
  color_tags: string[];
  source: "curated" | "couple_upload";
  created_at: string;
}

export type StyleMatch = "high" | "medium" | "low";

export const STYLE_MATCH_LABELS: Record<StyleMatch, string> = {
  high: "Strong match",
  medium: "Partial match",
  low: "Different direction",
};

export type VendorRole =
  | "decor_house"
  | "florist"
  | "lighting"
  | "rentals"
  | "other";

export const VENDOR_ROLE_LABELS: Record<VendorRole, string> = {
  decor_house: "Décor House",
  florist: "Florist",
  lighting: "Lighting Designer",
  rentals: "Rentals",
  other: "Other Vendor",
};

// ── v3 rebuild: discovery-first types ───────────────────────────────────────
// Replaces the scheduling-oriented model with creative-discovery cards. The
// older shapes above stay for backwards compatibility with persisted state.

export type Reaction3 = "love" | "not_for_us" | "maybe" | null;

export type DecorSpaceType = "ceremony" | "reception" | "outdoor" | "pre_event";

export const DECOR_SPACE_TYPE_LABELS: Record<DecorSpaceType, string> = {
  ceremony: "Ceremony",
  reception: "Reception",
  outdoor: "Outdoor",
  pre_event: "Pre-event",
};

export type ElementCategory =
  | "mandap"
  | "florals"
  | "draping"
  | "lighting"
  | "seating"
  | "aisle"
  | "tables"
  | "stage"
  | "entrance"
  | "backdrop"
  | "ground"
  | "props";

export interface ElementCard {
  id: string;
  category: ElementCategory;
  space_types: DecorSpaceType[];
  name: string;
  description: string;
  price_range_low?: number;
  price_range_high?: number;
}

export interface SpaceReferenceImage {
  id: string;
  image_url: string;
  source: "suggested" | "user";
  reaction: Reaction3;
}

export type SpaceIndoorOutdoor = "indoor" | "outdoor" | "both" | "tbd";
export type SpaceTimeOfDay = "morning" | "afternoon" | "evening" | "night";

export interface DecorSpaceCard {
  id: string;
  name: string;
  space_type: DecorSpaceType;
  event_ids: EventDayId[];
  vibe_text: string;
  vibe_by_event: Partial<Record<EventDayId, string>>;
  element_reactions: Record<string, Reaction3>;
  reference_images: SpaceReferenceImage[];
  /** Whether the space is indoor, outdoor, or covered. Drives florals,
   * lighting, and weather backups. */
  indoor_outdoor?: SpaceIndoorOutdoor;
  /** When in the day this space is used. Drives lighting-mood defaults. */
  time_of_day?: SpaceTimeOfDay;
}

export interface FloralPaletteOption {
  id: string;
  name: string;
  description: string;
  hexes: string[];
}

export interface FloralByEvent {
  event_id: EventDayId;
  palette_reactions: Record<string, Reaction3>;
  arrangement_keywords: string[];
  scale: number;
  reference_urls: string[];
}

export interface LightingElementCard {
  id: string;
  name: string;
  description: string;
  photo_url?: string;
}

export interface CuratedPalette {
  id: string;
  name: string;
  mood: string;
  swatches: { hex: string; name: string }[];
}

export type FlowerUsageMode = "real" | "faux" | "mix";

export const FLOWER_USAGE_LABELS: Record<FlowerUsageMode, string> = {
  real: "Real flowers",
  faux: "Faux flowers",
  mix: "Mix of real & faux",
};

export type GreeneryPreference = "heavy" | "moderate" | "minimal" | "none";

export const GREENERY_LABELS: Record<GreeneryPreference, string> = {
  heavy: "Heavy",
  moderate: "Moderate",
  minimal: "Minimal",
  none: "None",
};

export type SustainabilityPreference =
  | "important"
  | "nice_to_have"
  | "not_a_factor";

export const SUSTAINABILITY_LABELS: Record<SustainabilityPreference, string> = {
  important: "Important to us",
  nice_to_have: "Nice to have",
  not_a_factor: "Not a factor",
};

export interface CulturalFlowerNote {
  id: string;
  flower: string;
  use: string;
  created_at: string;
}

export interface CulturalRequirementNote {
  id: string;
  body: string;
  created_at: string;
}

export interface BreathtakingSpaceNote {
  id: string;
  body: string;
  created_at: string;
}

export interface FlowerType {
  id: string;
  name: string;
  season: string;
  palette: string[];
  note: string;
  pairs_well_with: string[];
  photo_url: string;
}

export interface SpaceAIRecommendation {
  space_id: string;
  colors: { hex: string; name: string }[];
  themes: string[];
  elements: string[];
  generated_at: string;
}

export type InspirationTheme =
  | "romantic"
  | "modern"
  | "traditional"
  | "bohemian"
  | "garden"
  | "glamorous"
  | "rustic"
  | "minimalist";

export const INSPIRATION_THEME_LABELS: Record<InspirationTheme, string> = {
  romantic: "Romantic",
  modern: "Modern",
  traditional: "Traditional Indian",
  bohemian: "Bohemian",
  garden: "Garden",
  glamorous: "Glamorous",
  rustic: "Rustic",
  minimalist: "Minimalist",
};

export interface ThemeReference {
  id: string;
  theme: InspirationTheme;
  image_url: string;
  source: "suggested" | "user";
  reaction: Reaction3;
}

export interface SpaceDream {
  id: string;
  body: string;
  created_at: string;
}
