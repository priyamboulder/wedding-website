// ── Floor Plan Element Library ──────────────────────────────────────────
// Catalog of every element type that can be placed on the floor-plan
// canvas. Each entry defines a category, default dimensions (in feet),
// visual color, and which property groups are relevant (vendor, AV,
// food, staffing). The Add Element panel, the properties panel, and the
// export pipelines all read from this catalog.

export type ElementCategory =
  | "stage_performance"
  | "dance_music"
  | "food_beverage"
  | "experiences"
  | "logistics"
  | "decor_ambiance";

export const CATEGORY_META: Record<
  ElementCategory,
  { label: string; description: string; tone: string }
> = {
  stage_performance: {
    label: "Stage & Performance",
    description: "Stages, runways, backstage",
    tone: "#a98032",
  },
  dance_music: {
    label: "Dance & Music",
    description: "Dance floors, DJ, live music",
    tone: "#6c8ea8",
  },
  food_beverage: {
    label: "Food & Beverage",
    description: "Buffets, live stations, bars, desserts",
    tone: "#a2775a",
  },
  experiences: {
    label: "Experiences & Entertainment",
    description: "Photo booths, games, henna, lounges",
    tone: "#8a5a72",
  },
  logistics: {
    label: "Logistics & Infrastructure",
    description: "Doors, desks, power, AV",
    tone: "#555555",
  },
  decor_ambiance: {
    label: "Décor & Ambiance",
    description: "Florals, lighting, mandap, swings",
    tone: "#c9a242",
  },
};

export type PropertyGroup =
  | "vendor"
  | "av_power"
  | "food"
  | "staffing"
  | "games"
  | "lounge";

export interface ElementDefinition {
  id: string;
  name: string;
  category: ElementCategory;
  defaultWidth: number; // feet
  defaultHeight: number; // feet (depth in room)
  fill: string; // rgba
  stroke: string;
  icon?: string; // lucide icon name
  resizable?: boolean;
  propertyGroups?: PropertyGroup[];
  // Optional named presets like "Small / Medium / Large"
  sizePresets?: Array<{ label: string; width: number; height: number; note?: string }>;
  // Short hint shown in properties panel
  hint?: string;
  // Whether this is rendered as a thin flat element placed against a wall
  flat?: boolean;
  // Layer: "furniture" (default) or "zone_overlay" (like lighting rigs)
  defaultLayer?: "furniture" | "zone_overlay";
  // Legacy kind — present on entries that replace previous FixedElementKind
  legacyKind?: string;
}

// ── Catalog ────────────────────────────────────────────────────────────
export const ELEMENT_LIBRARY: ElementDefinition[] = [
  // ═══ Stage & Performance ═════════════════════════════════════════════
  {
    id: "main_stage",
    name: "Main Stage",
    category: "stage_performance",
    defaultWidth: 20,
    defaultHeight: 10,
    fill: "rgba(201, 162, 66, 0.22)",
    stroke: "#a98032",
    resizable: true,
    propertyGroups: ["av_power"],
    legacyKind: "stage",
    hint: "Main raised platform for speeches, performances, ceremonies.",
  },
  {
    id: "secondary_stage",
    name: "Secondary Stage / Riser",
    category: "stage_performance",
    defaultWidth: 10,
    defaultHeight: 6,
    fill: "rgba(201, 162, 66, 0.18)",
    stroke: "#a98032",
    resizable: true,
    propertyGroups: ["av_power"],
  },
  {
    id: "runway",
    name: "Runway / Aisle",
    category: "stage_performance",
    defaultWidth: 4,
    defaultHeight: 20,
    fill: "rgba(201, 162, 66, 0.12)",
    stroke: "#a98032",
    resizable: true,
    hint: "Drag to set length. 4ft wide by default.",
  },
  {
    id: "green_room",
    name: "Green Room / Backstage",
    category: "stage_performance",
    defaultWidth: 12,
    defaultHeight: 10,
    fill: "rgba(172, 152, 96, 0.22)",
    stroke: "#8f7846",
    resizable: true,
    propertyGroups: ["av_power"],
  },
  {
    id: "head_table",
    name: "Head Table",
    category: "stage_performance",
    defaultWidth: 18,
    defaultHeight: 4,
    fill: "rgba(201, 162, 66, 0.14)",
    stroke: "#a98032",
    resizable: true,
    legacyKind: "head_table",
    hint: "Couple + wedding party.",
  },

  // ═══ Dance & Music ════════════════════════════════════════════════════
  {
    id: "dance_floor",
    name: "Dance Floor",
    category: "dance_music",
    defaultWidth: 20,
    defaultHeight: 20,
    fill: "rgba(141, 170, 196, 0.20)",
    stroke: "#6c8ea8",
    resizable: true,
    propertyGroups: ["av_power"],
    legacyKind: "dance_floor",
    sizePresets: [
      { label: "Small", width: 15, height: 15, note: "~35 dancers" },
      { label: "Medium", width: 20, height: 20, note: "~50 dancers" },
      { label: "Large", width: 25, height: 25, note: "~80 dancers" },
      { label: "XL", width: 30, height: 30, note: "~120 dancers" },
    ],
    hint: "Rule of thumb: 6–8 sq ft per dancer for a lively floor.",
  },
  {
    id: "dj_booth",
    name: "DJ Booth",
    category: "dance_music",
    defaultWidth: 6,
    defaultHeight: 4,
    fill: "rgba(94, 100, 125, 0.22)",
    stroke: "#505a7a",
    propertyGroups: ["vendor", "av_power"],
    legacyKind: "dj",
  },
  {
    id: "live_band_stage",
    name: "Live Band Stage",
    category: "dance_music",
    defaultWidth: 15,
    defaultHeight: 8,
    fill: "rgba(94, 100, 125, 0.24)",
    stroke: "#505a7a",
    resizable: true,
    propertyGroups: ["vendor", "av_power", "staffing"],
  },
  {
    id: "speaker_left",
    name: "Speaker Stack (Left)",
    category: "dance_music",
    defaultWidth: 3,
    defaultHeight: 3,
    fill: "rgba(60, 70, 90, 0.3)",
    stroke: "#3c465a",
    propertyGroups: ["av_power"],
  },
  {
    id: "speaker_right",
    name: "Speaker Stack (Right)",
    category: "dance_music",
    defaultWidth: 3,
    defaultHeight: 3,
    fill: "rgba(60, 70, 90, 0.3)",
    stroke: "#3c465a",
    propertyGroups: ["av_power"],
  },
  {
    id: "mixing_desk",
    name: "Sound Mixing Desk",
    category: "dance_music",
    defaultWidth: 4,
    defaultHeight: 3,
    fill: "rgba(94, 100, 125, 0.2)",
    stroke: "#505a7a",
    propertyGroups: ["av_power", "staffing"],
  },
  {
    id: "dhol_spot",
    name: "Dhol Player Spot",
    category: "dance_music",
    defaultWidth: 4,
    defaultHeight: 4,
    fill: "rgba(184, 120, 70, 0.2)",
    stroke: "#b87846",
    propertyGroups: ["vendor"],
    hint: "Traditional dhol for baraat entrance or sangeet.",
  },

  // ═══ Food & Beverage ══════════════════════════════════════════════════
  {
    id: "buffet_station",
    name: "Buffet Station",
    category: "food_beverage",
    defaultWidth: 12,
    defaultHeight: 4,
    fill: "rgba(162, 140, 112, 0.22)",
    stroke: "#7d6a52",
    resizable: true,
    propertyGroups: ["vendor", "food", "staffing"],
    legacyKind: "buffet",
  },
  {
    id: "live_cooking",
    name: "Live Cooking Station",
    category: "food_beverage",
    defaultWidth: 8,
    defaultHeight: 6,
    fill: "rgba(184, 122, 74, 0.2)",
    stroke: "#8a5432",
    resizable: true,
    propertyGroups: ["vendor", "food", "staffing", "av_power"],
    hint: "Live dosa, teppanyaki, tandoor, pasta, paan.",
  },
  {
    id: "mobile_bar",
    name: "Mobile Bar",
    category: "food_beverage",
    defaultWidth: 8,
    defaultHeight: 4,
    fill: "rgba(125, 110, 100, 0.22)",
    stroke: "#6b5d53",
    resizable: true,
    propertyGroups: ["vendor", "food", "staffing", "av_power"],
    legacyKind: "bar",
  },
  {
    id: "fixed_bar",
    name: "Fixed Bar",
    category: "food_beverage",
    defaultWidth: 12,
    defaultHeight: 4,
    fill: "rgba(108, 92, 80, 0.24)",
    stroke: "#5a4e42",
    resizable: true,
    propertyGroups: ["vendor", "food", "staffing", "av_power"],
  },
  {
    id: "dessert_display",
    name: "Dessert Display",
    category: "food_beverage",
    defaultWidth: 8,
    defaultHeight: 4,
    fill: "rgba(212, 165, 138, 0.22)",
    stroke: "#b07a55",
    resizable: true,
    propertyGroups: ["vendor", "food", "staffing"],
  },
  {
    id: "tea_coffee",
    name: "Tea / Coffee Station",
    category: "food_beverage",
    defaultWidth: 6,
    defaultHeight: 3,
    fill: "rgba(162, 124, 92, 0.22)",
    stroke: "#7a5838",
    propertyGroups: ["vendor", "staffing"],
  },
  {
    id: "water_station",
    name: "Water / Beverage Station",
    category: "food_beverage",
    defaultWidth: 4,
    defaultHeight: 3,
    fill: "rgba(156, 182, 188, 0.25)",
    stroke: "#5c7a82",
    hint: "Self-serve water, nimbu pani, welcome drinks.",
  },
  {
    id: "paan_station",
    name: "Paan Station",
    category: "food_beverage",
    defaultWidth: 4,
    defaultHeight: 4,
    fill: "rgba(126, 164, 104, 0.25)",
    stroke: "#56734a",
    propertyGroups: ["vendor", "staffing"],
    hint: "Traditional Indian paan counter — a staple at big weddings.",
  },
  {
    id: "ice_cream_cart",
    name: "Ice Cream Cart",
    category: "food_beverage",
    defaultWidth: 4,
    defaultHeight: 4,
    fill: "rgba(236, 210, 222, 0.3)",
    stroke: "#b8778e",
    propertyGroups: ["vendor", "staffing"],
  },
  {
    id: "serving_pass",
    name: "Serving Pass / Kitchen Window",
    category: "food_beverage",
    defaultWidth: 10,
    defaultHeight: 3,
    fill: "rgba(180, 170, 150, 0.24)",
    stroke: "#6c5f48",
    resizable: true,
    propertyGroups: ["staffing"],
  },

  // ═══ Experiences & Entertainment ═════════════════════════════════════
  {
    id: "photo_booth",
    name: "Photo Booth",
    category: "experiences",
    defaultWidth: 8,
    defaultHeight: 8,
    fill: "rgba(168, 108, 128, 0.22)",
    stroke: "#8a5a72",
    propertyGroups: ["vendor", "av_power"],
    legacyKind: "photo_booth",
    hint: "360, mirror, GIF, traditional — pick a type.",
  },
  {
    id: "selfie_wall",
    name: "Selfie Wall / Backdrop",
    category: "experiences",
    defaultWidth: 10,
    defaultHeight: 2,
    fill: "rgba(218, 140, 168, 0.24)",
    stroke: "#a25677",
    resizable: true,
    flat: true,
    propertyGroups: ["vendor"],
  },
  {
    id: "henna_station",
    name: "Henna / Mehndi Station",
    category: "experiences",
    defaultWidth: 8,
    defaultHeight: 6,
    fill: "rgba(158, 100, 78, 0.22)",
    stroke: "#73402c",
    resizable: true,
    propertyGroups: ["vendor", "staffing"],
  },
  {
    id: "caricature_artist",
    name: "Caricature Artist",
    category: "experiences",
    defaultWidth: 4,
    defaultHeight: 4,
    fill: "rgba(168, 108, 128, 0.18)",
    stroke: "#8a5a72",
    propertyGroups: ["vendor"],
  },
  {
    id: "tarot_booth",
    name: "Tarot / Astrology Booth",
    category: "experiences",
    defaultWidth: 4,
    defaultHeight: 4,
    fill: "rgba(124, 96, 164, 0.22)",
    stroke: "#5a4880",
    propertyGroups: ["vendor"],
  },
  {
    id: "games_zone",
    name: "Games Zone",
    category: "experiences",
    defaultWidth: 12,
    defaultHeight: 12,
    fill: "rgba(140, 170, 120, 0.18)",
    stroke: "#5a7a40",
    resizable: true,
    propertyGroups: ["games"],
  },
  {
    id: "hookah_lounge",
    name: "Hookah Lounge",
    category: "experiences",
    defaultWidth: 10,
    defaultHeight: 10,
    fill: "rgba(100, 110, 130, 0.22)",
    stroke: "#464f68",
    resizable: true,
    propertyGroups: ["vendor", "lounge"],
  },
  {
    id: "cigar_lounge",
    name: "Cigar Lounge",
    category: "experiences",
    defaultWidth: 8,
    defaultHeight: 8,
    fill: "rgba(110, 80, 60, 0.22)",
    stroke: "#55382a",
    resizable: true,
    propertyGroups: ["vendor", "lounge"],
  },
  {
    id: "kids_play_area",
    name: "Kids Play Area",
    category: "experiences",
    defaultWidth: 12,
    defaultHeight: 12,
    fill: "rgba(244, 208, 140, 0.3)",
    stroke: "#a87c3a",
    resizable: true,
    propertyGroups: ["staffing"],
  },
  {
    id: "video_wall",
    name: "Video Wall / LED Screen",
    category: "experiences",
    defaultWidth: 10,
    defaultHeight: 1,
    fill: "rgba(60, 80, 120, 0.32)",
    stroke: "#263458",
    resizable: true,
    flat: true,
    propertyGroups: ["vendor", "av_power"],
  },
  {
    id: "fireworks_zone",
    name: "Fireworks / Sparkler Zone",
    category: "experiences",
    defaultWidth: 10,
    defaultHeight: 10,
    fill: "rgba(224, 172, 86, 0.18)",
    stroke: "#a8751f",
    resizable: true,
    hint: "Outdoor only — maintain clearance from tents and guests.",
  },
  {
    id: "live_art",
    name: "Live Art Station",
    category: "experiences",
    defaultWidth: 6,
    defaultHeight: 6,
    fill: "rgba(196, 140, 160, 0.22)",
    stroke: "#8a5a72",
    propertyGroups: ["vendor"],
  },
  {
    id: "memory_wall",
    name: "Memory Wall / Photo Display",
    category: "experiences",
    defaultWidth: 8,
    defaultHeight: 2,
    fill: "rgba(230, 210, 180, 0.3)",
    stroke: "#a08760",
    resizable: true,
    flat: true,
  },
  {
    id: "guestbook",
    name: "Guestbook / Message Station",
    category: "experiences",
    defaultWidth: 4,
    defaultHeight: 3,
    fill: "rgba(218, 198, 170, 0.3)",
    stroke: "#8a7456",
  },
  {
    id: "gift_table",
    name: "Gift Table",
    category: "experiences",
    defaultWidth: 8,
    defaultHeight: 3,
    fill: "rgba(212, 190, 128, 0.25)",
    stroke: "#8a7832",
    resizable: true,
  },
  {
    id: "favor_display",
    name: "Favor Display",
    category: "experiences",
    defaultWidth: 6,
    defaultHeight: 3,
    fill: "rgba(212, 190, 128, 0.22)",
    stroke: "#8a7832",
    resizable: true,
  },

  // ═══ Logistics & Infrastructure ═══════════════════════════════════════
  {
    id: "door",
    name: "Entry / Exit Door",
    category: "logistics",
    defaultWidth: 4,
    defaultHeight: 1,
    fill: "rgba(60, 60, 60, 0.18)",
    stroke: "#3c3c3c",
    resizable: true,
    flat: true,
    legacyKind: "door",
    hint: "Place along a room wall.",
  },
  {
    id: "registration_desk",
    name: "Registration / Welcome Desk",
    category: "logistics",
    defaultWidth: 8,
    defaultHeight: 3,
    fill: "rgba(140, 140, 140, 0.22)",
    stroke: "#555555",
    resizable: true,
    propertyGroups: ["staffing"],
  },
  {
    id: "coat_check",
    name: "Coat Check",
    category: "logistics",
    defaultWidth: 6,
    defaultHeight: 3,
    fill: "rgba(130, 130, 130, 0.22)",
    stroke: "#555555",
    resizable: true,
    propertyGroups: ["staffing"],
  },
  {
    id: "restroom_sign",
    name: "Restroom Direction Sign",
    category: "logistics",
    defaultWidth: 2,
    defaultHeight: 2,
    fill: "rgba(120, 120, 120, 0.18)",
    stroke: "#555555",
    hint: "Marker only — indicates direction to restrooms.",
  },
  {
    id: "power_drop",
    name: "Power Drop",
    category: "logistics",
    defaultWidth: 1.5,
    defaultHeight: 1.5,
    fill: "rgba(224, 172, 60, 0.32)",
    stroke: "#a87c3a",
    propertyGroups: ["av_power"],
    hint: "Marks where power outlets / generators are available.",
  },
  {
    id: "av_tech_table",
    name: "AV / Tech Table",
    category: "logistics",
    defaultWidth: 6,
    defaultHeight: 3,
    fill: "rgba(94, 100, 125, 0.22)",
    stroke: "#505a7a",
    resizable: true,
    propertyGroups: ["vendor", "av_power", "staffing"],
  },
  {
    id: "vendor_staging",
    name: "Vendor Staging Area",
    category: "logistics",
    defaultWidth: 10,
    defaultHeight: 8,
    fill: "rgba(130, 130, 130, 0.18)",
    stroke: "#555555",
    resizable: true,
    propertyGroups: ["vendor"],
  },
  {
    id: "valet_station",
    name: "Parking / Valet Station",
    category: "logistics",
    defaultWidth: 6,
    defaultHeight: 4,
    fill: "rgba(130, 130, 130, 0.18)",
    stroke: "#555555",
    propertyGroups: ["vendor", "staffing"],
  },

  // ═══ Décor & Ambiance ═════════════════════════════════════════════════
  {
    id: "mandap",
    name: "Mandap / Altar",
    category: "decor_ambiance",
    defaultWidth: 12,
    defaultHeight: 12,
    fill: "rgba(201, 162, 66, 0.26)",
    stroke: "#a98032",
    resizable: true,
    propertyGroups: ["vendor"],
    hint: "Ceremony altar — for ceremony events at the same venue.",
  },
  {
    id: "floral_arrangement",
    name: "Floral Arrangement",
    category: "decor_ambiance",
    defaultWidth: 3,
    defaultHeight: 3,
    fill: "rgba(216, 128, 148, 0.28)",
    stroke: "#a25677",
  },
  {
    id: "centerpiece_display",
    name: "Centerpiece Display",
    category: "decor_ambiance",
    defaultWidth: 2,
    defaultHeight: 2,
    fill: "rgba(216, 172, 128, 0.24)",
    stroke: "#a87546",
  },
  {
    id: "lighting_rig",
    name: "Lighting Rig Zone",
    category: "decor_ambiance",
    defaultWidth: 10,
    defaultHeight: 10,
    fill: "rgba(224, 172, 60, 0.14)",
    stroke: "#a87c3a",
    resizable: true,
    defaultLayer: "zone_overlay",
    propertyGroups: ["vendor", "av_power"],
    hint: "Overhead zone overlay — uplighting, fairy lights, spotlights.",
  },
  {
    id: "red_carpet",
    name: "Red Carpet / Aisle Runner",
    category: "decor_ambiance",
    defaultWidth: 4,
    defaultHeight: 20,
    fill: "rgba(180, 80, 80, 0.25)",
    stroke: "#882c2c",
    resizable: true,
  },
  {
    id: "entrance_arch",
    name: "Entrance Arch / Gate",
    category: "decor_ambiance",
    defaultWidth: 6,
    defaultHeight: 2,
    fill: "rgba(201, 162, 66, 0.28)",
    stroke: "#a98032",
    flat: true,
    propertyGroups: ["vendor"],
  },
  {
    id: "swing_jhoola",
    name: "Swing / Jhoola",
    category: "decor_ambiance",
    defaultWidth: 6,
    defaultHeight: 6,
    fill: "rgba(201, 162, 66, 0.22)",
    stroke: "#a98032",
    propertyGroups: ["vendor"],
    hint: "Decorative swing for photos — common in Indian weddings.",
  },
  {
    id: "lounge_seating",
    name: "Lounge Seating",
    category: "decor_ambiance",
    defaultWidth: 8,
    defaultHeight: 6,
    fill: "rgba(130, 100, 130, 0.2)",
    stroke: "#5a4268",
    resizable: true,
    propertyGroups: ["vendor", "lounge"],
  },
];

// ── Helpers ─────────────────────────────────────────────────────────────
export function getElementDef(id: string): ElementDefinition | undefined {
  return ELEMENT_LIBRARY.find((e) => e.id === id);
}

export function elementsByCategory(): Record<ElementCategory, ElementDefinition[]> {
  const out = {} as Record<ElementCategory, ElementDefinition[]>;
  for (const c of Object.keys(CATEGORY_META) as ElementCategory[]) out[c] = [];
  for (const el of ELEMENT_LIBRARY) out[el.category].push(el);
  return out;
}

// Legacy kind → library id mapping (for existing localStorage data)
export function resolveLegacyKind(kind: string): string {
  const found = ELEMENT_LIBRARY.find((e) => e.legacyKind === kind);
  return found?.id ?? kind;
}

// ── Zone templates — pre-built bundles for the AI-suggested zone drops ──
export interface ZoneTemplate {
  id: string;
  name: string;
  description: string;
  color: string;
  elements: Array<{ libraryId: string; offsetX: number; offsetY: number; label?: string }>;
  // Default zone footprint in feet
  width: number;
  height: number;
}

export const ZONE_TEMPLATES: ZoneTemplate[] = [
  {
    id: "classic_cocktail",
    name: "Classic Cocktail Hour",
    description: "Mobile bar + mocktail bar + 3 live stations + lounge + live music + photo booth.",
    color: "rgba(201, 162, 66, 0.18)",
    width: 30,
    height: 24,
    elements: [
      { libraryId: "mobile_bar", offsetX: 4, offsetY: 4, label: "Signature Cocktails" },
      { libraryId: "mobile_bar", offsetX: 4, offsetY: 10, label: "Mocktail Bar" },
      { libraryId: "live_cooking", offsetX: 15, offsetY: 4, label: "Chaat Counter" },
      { libraryId: "live_cooking", offsetX: 15, offsetY: 12, label: "Live Dosa" },
      { libraryId: "lounge_seating", offsetX: 22, offsetY: 6 },
      { libraryId: "photo_booth", offsetX: 22, offsetY: 16 },
    ],
  },
  {
    id: "food_festival",
    name: "Food Festival",
    description: "6 live cooking stations in a U + dessert + paan + tea + standing cocktail tables.",
    color: "rgba(184, 122, 74, 0.14)",
    width: 34,
    height: 24,
    elements: [
      { libraryId: "live_cooking", offsetX: 4, offsetY: 4, label: "North Indian" },
      { libraryId: "live_cooking", offsetX: 14, offsetY: 4, label: "South Indian" },
      { libraryId: "live_cooking", offsetX: 24, offsetY: 4, label: "Chinese Wok" },
      { libraryId: "live_cooking", offsetX: 4, offsetY: 14, label: "Tandoor" },
      { libraryId: "live_cooking", offsetX: 14, offsetY: 14, label: "Pasta Bar" },
      { libraryId: "live_cooking", offsetX: 24, offsetY: 14, label: "Biryani" },
      { libraryId: "dessert_display", offsetX: 4, offsetY: 20, label: "Mithai" },
      { libraryId: "paan_station", offsetX: 14, offsetY: 20 },
      { libraryId: "tea_coffee", offsetX: 22, offsetY: 20 },
    ],
  },
  {
    id: "entertainment_hub",
    name: "Entertainment Hub",
    description: "Photo booth + selfie wall + games + caricature + live art + video wall.",
    color: "rgba(168, 108, 128, 0.16)",
    width: 26,
    height: 22,
    elements: [
      { libraryId: "photo_booth", offsetX: 4, offsetY: 4 },
      { libraryId: "selfie_wall", offsetX: 16, offsetY: 2, label: "Neon Wedding Hashtag" },
      { libraryId: "games_zone", offsetX: 4, offsetY: 13 },
      { libraryId: "caricature_artist", offsetX: 18, offsetY: 7 },
      { libraryId: "live_art", offsetX: 18, offsetY: 13 },
      { libraryId: "video_wall", offsetX: 16, offsetY: 21 },
    ],
  },
  {
    id: "kids_paradise",
    name: "Kids Paradise",
    description: "Supervised play + ice cream cart + kid-sized games + dedicated food station.",
    color: "rgba(244, 208, 140, 0.2)",
    width: 22,
    height: 18,
    elements: [
      { libraryId: "kids_play_area", offsetX: 3, offsetY: 3 },
      { libraryId: "ice_cream_cart", offsetX: 16, offsetY: 3 },
      { libraryId: "games_zone", offsetX: 14, offsetY: 9, label: "Kid-sized Games" },
      { libraryId: "live_cooking", offsetX: 3, offsetY: 14, label: "Kid Menu" },
    ],
  },
  {
    id: "vip_lounge",
    name: "VIP Lounge",
    description: "Lounge seating + private bar + hookah/cigar + dedicated server station.",
    color: "rgba(130, 100, 130, 0.18)",
    width: 24,
    height: 18,
    elements: [
      { libraryId: "lounge_seating", offsetX: 3, offsetY: 3 },
      { libraryId: "mobile_bar", offsetX: 13, offsetY: 3, label: "Private Bar" },
      { libraryId: "hookah_lounge", offsetX: 3, offsetY: 11 },
      { libraryId: "cigar_lounge", offsetX: 15, offsetY: 11 },
    ],
  },
  {
    id: "grand_entrance",
    name: "Grand Entrance Experience",
    description: "Entrance arch + red carpet + dhol players + florals + registration + welcome drinks.",
    color: "rgba(201, 162, 66, 0.14)",
    width: 18,
    height: 28,
    elements: [
      { libraryId: "entrance_arch", offsetX: 6, offsetY: 2 },
      { libraryId: "red_carpet", offsetX: 7, offsetY: 5 },
      { libraryId: "floral_arrangement", offsetX: 2, offsetY: 6 },
      { libraryId: "floral_arrangement", offsetX: 14, offsetY: 6 },
      { libraryId: "dhol_spot", offsetX: 2, offsetY: 13 },
      { libraryId: "dhol_spot", offsetX: 13, offsetY: 13 },
      { libraryId: "registration_desk", offsetX: 5, offsetY: 20 },
      { libraryId: "water_station", offsetX: 7, offsetY: 25, label: "Welcome Drinks" },
    ],
  },
];
