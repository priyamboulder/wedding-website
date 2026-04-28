// ── Décor & Florals catalog ─────────────────────────────────────────────────
// Static config: element cards, floral palette presets, lighting elements,
// theme inspiration galleries. Grows without code changes when seeded from
// config/DB later.

import type {
  ElementCard,
  FloralPaletteOption,
  LightingElementCard,
  InspirationTheme,
  CuratedPalette,
  FlowerType,
} from "@/types/decor";

// ── Element cards catalog ───────────────────────────────────────────────────
// Elements are surfaced in the Space Explorer based on each space's
// `space_type`. Ceremony spaces see mandap / aisle / havan kund; reception
// spaces see centrepieces / dance floor; outdoor sees ground treatments;
// pre-event sees floor seating / low tables.

export const DECOR_ELEMENTS: ElementCard[] = [
  // Mandap & ceremony
  {
    id: "el-mandap-traditional",
    category: "mandap",
    space_types: ["ceremony"],
    name: "Traditional four-pillar mandap",
    description: "Four ornate posts, lush florals, closed canopy top.",
    price_range_low: 8000,
    price_range_high: 25000,
  },
  {
    id: "el-mandap-open-canopy",
    category: "mandap",
    space_types: ["ceremony"],
    name: "Open canopy mandap",
    description: "Soft fabric canopy with floral clusters, no pillars.",
    price_range_low: 6000,
    price_range_high: 18000,
  },
  {
    id: "el-mandap-circular",
    category: "mandap",
    space_types: ["ceremony"],
    name: "Circular mandap",
    description: "Round ring frame, suspended florals, 360° sight lines.",
    price_range_low: 10000,
    price_range_high: 30000,
  },
  {
    id: "el-mandap-minimal",
    category: "mandap",
    space_types: ["ceremony"],
    name: "Minimal geometric mandap",
    description: "Clean metal frame, restrained florals, architectural.",
    price_range_low: 5000,
    price_range_high: 14000,
  },
  {
    id: "el-pillar-florals",
    category: "florals",
    space_types: ["ceremony"],
    name: "Pillar florals",
    description: "Jasmine, roses, and marigold garlands wrapping the mandap posts.",
    price_range_low: 2000,
    price_range_high: 8000,
  },
  {
    id: "el-ceiling-canopy",
    category: "draping",
    space_types: ["ceremony", "reception"],
    name: "Ceiling canopy / draping",
    description: "Sheer fabric and flower clusters overhead.",
    price_range_low: 3000,
    price_range_high: 12000,
  },
  {
    id: "el-aisle-florals",
    category: "aisle",
    space_types: ["ceremony"],
    name: "Aisle florals",
    description: "Floral columns every 8', or rose petals lining the aisle.",
    price_range_low: 1500,
    price_range_high: 6000,
  },
  {
    id: "el-aisle-candles",
    category: "aisle",
    space_types: ["ceremony"],
    name: "Candle-lined aisle",
    description: "Lanterns or pillar candles tracing the walk.",
    price_range_low: 600,
    price_range_high: 2500,
  },
  {
    id: "el-aisle-runner",
    category: "aisle",
    space_types: ["ceremony"],
    name: "Aisle runner",
    description: "Fabric, petals, or patterned runner underfoot.",
    price_range_low: 300,
    price_range_high: 1500,
  },
  {
    id: "el-entrance-arch",
    category: "entrance",
    space_types: ["ceremony", "reception", "outdoor", "pre_event"],
    name: "Entrance arch",
    description: "Freestanding floral arch at the doorway or threshold.",
    price_range_low: 1500,
    price_range_high: 6000,
  },
  {
    id: "el-ceremony-backdrop",
    category: "backdrop",
    space_types: ["ceremony"],
    name: "Ceremony backdrop",
    description: "Statement wall behind the mandap for photography.",
    price_range_low: 2000,
    price_range_high: 8000,
  },
  {
    id: "el-havan-kund",
    category: "mandap",
    space_types: ["ceremony"],
    name: "Havan kund setup",
    description: "Fire pit with fire-safe mat and ventilation clearance.",
    price_range_low: 200,
    price_range_high: 900,
  },
  {
    id: "el-seating-chairs",
    category: "seating",
    space_types: ["ceremony", "reception"],
    name: "Guest seating — chairs",
    description: "Chiavari, ghost, or cushioned chairs in rows or semicircle.",
    price_range_low: 800,
    price_range_high: 4000,
  },
  {
    id: "el-seating-floor",
    category: "seating",
    space_types: ["ceremony", "pre_event"],
    name: "Guest seating — floor cushions",
    description: "Layered rugs and cushions for an intimate sit-down.",
    price_range_low: 600,
    price_range_high: 2500,
  },

  // Reception
  {
    id: "el-centrepieces-tall",
    category: "tables",
    space_types: ["reception"],
    name: "Centrepieces — tall",
    description: "Elevated arrangements that draw the eye upward.",
    price_range_low: 150,
    price_range_high: 600,
  },
  {
    id: "el-centrepieces-low",
    category: "tables",
    space_types: ["reception"],
    name: "Centrepieces — low",
    description: "Lush, low arrangements that stay below sightlines.",
    price_range_low: 100,
    price_range_high: 400,
  },
  {
    id: "el-centrepieces-mixed",
    category: "tables",
    space_types: ["reception"],
    name: "Centrepieces — mixed heights",
    description: "Alternating tall and low across the room.",
    price_range_low: 120,
    price_range_high: 500,
  },
  {
    id: "el-table-settings",
    category: "tables",
    space_types: ["reception"],
    name: "Table settings",
    description: "Charger plates, napkin folds, glassware, menu cards.",
    price_range_low: 15,
    price_range_high: 60,
  },
  {
    id: "el-head-table",
    category: "tables",
    space_types: ["reception"],
    name: "Head / sweetheart table",
    description: "Dedicated table design for the couple.",
    price_range_low: 800,
    price_range_high: 3000,
  },
  {
    id: "el-dance-floor",
    category: "stage",
    space_types: ["reception"],
    name: "Dance floor treatment",
    description: "Custom monogram, ornate pattern, or ringed florals.",
    price_range_low: 1500,
    price_range_high: 6000,
  },
  {
    id: "el-stage-reception",
    category: "stage",
    space_types: ["reception"],
    name: "Stage / performance area décor",
    description: "Backdrop, floral drops, seating for the couple.",
    price_range_low: 3000,
    price_range_high: 12000,
  },
  {
    id: "el-bar-styling",
    category: "props",
    space_types: ["reception"],
    name: "Bar area styling",
    description: "Florals, signage, custom cocktail menus.",
    price_range_low: 500,
    price_range_high: 2500,
  },
  {
    id: "el-lounge",
    category: "seating",
    space_types: ["reception"],
    name: "Lounge furniture areas",
    description: "Sofas, poufs, coffee tables for cocktail mingling.",
    price_range_low: 1200,
    price_range_high: 5000,
  },

  // Lighting — cross-space
  {
    id: "el-lighting-string",
    category: "lighting",
    space_types: ["ceremony", "reception", "outdoor", "pre_event"],
    name: "String / fairy lights",
    description: "Overhead canopy of warm, ambient light.",
    price_range_low: 500,
    price_range_high: 3000,
  },
  {
    id: "el-lighting-chandeliers",
    category: "lighting",
    space_types: ["ceremony", "reception"],
    name: "Chandeliers",
    description: "Crystal or floral chandeliers suspended overhead.",
    price_range_low: 1500,
    price_range_high: 8000,
  },
  {
    id: "el-lighting-uplighting",
    category: "lighting",
    space_types: ["ceremony", "reception"],
    name: "Uplighting / colour wash",
    description: "Coloured washes along walls and corners.",
    price_range_low: 800,
    price_range_high: 3500,
  },
  {
    id: "el-lighting-candles",
    category: "lighting",
    space_types: ["ceremony", "reception", "pre_event"],
    name: "Candle clusters",
    description: "Grouped pillar candles or votives — warm, intimate.",
    price_range_low: 300,
    price_range_high: 1500,
  },

  // Outdoor
  {
    id: "el-ground-treatment",
    category: "ground",
    space_types: ["outdoor", "pre_event"],
    name: "Ground treatment",
    description: "Rugs, petal paths, or a floor of marigolds.",
    price_range_low: 500,
    price_range_high: 2500,
  },
  {
    id: "el-canopy-tent",
    category: "draping",
    space_types: ["outdoor"],
    name: "Canopy / tent draping",
    description: "Sheer fabric panels softening a tent or pergola.",
    price_range_low: 2000,
    price_range_high: 9000,
  },
  {
    id: "el-tree-lighting",
    category: "lighting",
    space_types: ["outdoor"],
    name: "Tree / plant lighting",
    description: "Uplights at trunk bases, string lights through branches.",
    price_range_low: 600,
    price_range_high: 3000,
  },
  {
    id: "el-weather-contingency",
    category: "props",
    space_types: ["outdoor"],
    name: "Weather contingency",
    description: "Fans, heaters, umbrellas, clear-top tents.",
    price_range_low: 500,
    price_range_high: 2500,
  },

  // Pre-event (Haldi, Mehendi)
  {
    id: "el-low-tables",
    category: "tables",
    space_types: ["pre_event"],
    name: "Low table styling",
    description: "Brass trays, florals, candles at lounge height.",
    price_range_low: 400,
    price_range_high: 1800,
  },
  {
    id: "el-floral-rangoli",
    category: "florals",
    space_types: ["pre_event"],
    name: "Floral rangoli",
    description: "Floor patterns of petals, turmeric, and rice.",
    price_range_low: 250,
    price_range_high: 1200,
  },
  {
    id: "el-umbrella-install",
    category: "props",
    space_types: ["pre_event"],
    name: "Umbrella / parasol installation",
    description: "Suspended or arrayed parasols overhead.",
    price_range_low: 600,
    price_range_high: 2500,
  },
  {
    id: "el-photo-backdrop",
    category: "backdrop",
    space_types: ["pre_event", "reception"],
    name: "Photo backdrop",
    description: "Statement wall for guest photos.",
    price_range_low: 500,
    price_range_high: 2500,
  },
  {
    id: "el-swing-props",
    category: "props",
    space_types: ["pre_event"],
    name: "Swing / traditional props",
    description: "Jhoola swing, brass lanterns, vintage charpoy.",
    price_range_low: 400,
    price_range_high: 2000,
  },
];

export const ELEMENT_CATEGORY_LABELS: Record<string, string> = {
  mandap: "Mandap",
  florals: "Florals",
  draping: "Draping",
  lighting: "Lighting",
  seating: "Seating",
  aisle: "Aisle",
  tables: "Tables",
  stage: "Stage",
  entrance: "Entrance",
  backdrop: "Backdrop",
  ground: "Ground",
  props: "Props",
};

// ── Floral palette options ──────────────────────────────────────────────────

export const FLORAL_PALETTE_OPTIONS: FloralPaletteOption[] = [
  {
    id: "fp-warm-sunset",
    name: "Warm sunset",
    description: "Marigolds, roses, orchids — gold to sindoor.",
    hexes: ["#E8B84B", "#E09E2E", "#C94030", "#F8D0B0"],
  },
  {
    id: "fp-classic-white",
    name: "Classic white",
    description: "Roses, peonies, baby's breath, lilies of the valley.",
    hexes: ["#FFFDF7", "#F5EEDE", "#DCD3C1", "#E8DAC8"],
  },
  {
    id: "fp-jewel-tones",
    name: "Jewel tones",
    description: "Dahlias, ranunculus, anemones — plum, ruby, emerald.",
    hexes: ["#8B2A1F", "#3B1F4A", "#5D6E4D", "#C4488B"],
  },
  {
    id: "fp-garden-mix",
    name: "Garden mix",
    description: "Wildflowers, greenery, lavender — loose and romantic.",
    hexes: ["#C8A24B", "#8FA076", "#C7ACC9", "#F5ECE1"],
  },
  {
    id: "fp-tropical",
    name: "Tropical",
    description: "Monstera, orchids, birds of paradise — bold and glossy.",
    hexes: ["#2E6B3D", "#F2A83B", "#C94030", "#F5D547"],
  },
  {
    id: "fp-dried-earthy",
    name: "Dried & earthy",
    description: "Pampas, dried palm, eucalyptus — muted and textural.",
    hexes: ["#D9C8A8", "#A89577", "#8B7A5C", "#E8DAC8"],
  },
];

// ── Arrangement style keywords ──────────────────────────────────────────────

export const ARRANGEMENT_KEYWORDS = [
  "lush",
  "sparse",
  "cascading",
  "structured",
  "wild",
  "monochrome",
  "tropical",
  "dried",
  "mixed-greenery",
  "single-variety",
];

// ── Style keywords (spec list) ──────────────────────────────────────────────

export const DECOR_STYLE_KEYWORDS = [
  "romantic",
  "bohemian",
  "maximalist",
  "minimalist",
  "traditional",
  "contemporary",
  "garden",
  "industrial",
  "glamorous",
  "rustic",
  "whimsical",
  "moody",
  "celestial",
  "tropical",
  "heritage",
];

// ── Lighting element cards ──────────────────────────────────────────────────
// Photos are real-event context shots so couples can see how each fixture
// actually reads in a venue — not product shots.

export const LIGHTING_ELEMENTS: LightingElementCard[] = [
  {
    id: "li-string",
    name: "String / bistro lights",
    description: "A warm canopy overhead — feels like a garden party.",
    photo_url: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800",
  },
  {
    id: "li-candles",
    name: "Candle clusters",
    description: "Grouped pillars or votives for intimate, flickering warmth.",
    photo_url: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800",
  },
  {
    id: "li-chandeliers",
    name: "Chandeliers",
    description: "Crystal or floral drops — instant ballroom drama.",
    photo_url: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800",
  },
  {
    id: "li-uplighting",
    name: "Uplighting",
    description: "Coloured washes along walls and columns — sets the colour story.",
    photo_url: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800",
  },
  {
    id: "li-gobo",
    name: "Gobo projection",
    description: "Custom monograms or patterns projected on walls or the dance floor.",
    photo_url: "https://images.unsplash.com/photo-1529519195486-16945f0fb37f?w=800",
  },
  {
    id: "li-pin-spot",
    name: "Pin spotting",
    description: "Tight beams that light each centrepiece so florals glow at night.",
    photo_url: "https://images.unsplash.com/photo-1606800052052-a08af7148866?w=800",
  },
  {
    id: "li-led-strips",
    name: "LED strips",
    description: "Concealed colour along edges of stages, bars, and dance floors.",
    photo_url: "https://images.unsplash.com/photo-1600122854034-16f0c0aaa79f?w=800",
  },
  {
    id: "li-lanterns",
    name: "Lanterns",
    description: "Suspended metal or paper lanterns — reads vintage or tropical.",
    photo_url: "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=800",
  },
  {
    id: "li-fairy",
    name: "Fairy lights",
    description: "Dense twinkling tucked in trees, jars, or drapes.",
    photo_url: "https://images.unsplash.com/photo-1542037104857-ffbb0b9155fb?w=800",
  },
  {
    id: "li-neon",
    name: "Neon signs",
    description: "Custom messages in neon script — great for a photo moment.",
    photo_url: "https://images.unsplash.com/photo-1594908900066-3f47337549d8?w=800",
  },
  {
    id: "li-spotlights",
    name: "Spotlights",
    description: "Focused beams on key moments — first dance, cake cutting.",
    photo_url: "https://images.unsplash.com/photo-1583939411023-14783179e581?w=800",
  },
  {
    id: "li-canopy-lights",
    name: "Canopy of pin-lights",
    description: "A dense sky of overhead lights — feels like stars.",
    photo_url: "https://images.unsplash.com/photo-1604608672516-f1b9b1d1e9b5?w=800",
  },
];

// ── Curated colour palettes (for "Suggest colours" carousel) ────────────────
// Each palette is 4–6 harmonious swatches users can one-tap apply to an event
// palette. Hex values fall inside the supported wedding colour language —
// warm Indian hues, heritage brights, and soft romantic neutrals.

export const CURATED_PALETTES: CuratedPalette[] = [
  {
    id: "cp-marigold-sindoor",
    name: "Marigold & Sindoor",
    mood: "Warm, traditional, festive",
    swatches: [
      { hex: "#F2A83B", name: "Marigold" },
      { hex: "#C94030", name: "Sindoor" },
      { hex: "#8B2A1F", name: "Deep Vermillion" },
      { hex: "#F5D547", name: "Turmeric" },
      { hex: "#FFF2D1", name: "Cream" },
    ],
  },
  {
    id: "cp-dusty-rose-champagne",
    name: "Dusty Rose & Champagne",
    mood: "Soft, romantic, candlelit",
    swatches: [
      { hex: "#D9A7A0", name: "Dusty Rose" },
      { hex: "#E8D5B8", name: "Champagne" },
      { hex: "#F5ECE1", name: "Ivory" },
      { hex: "#B89B7E", name: "Antique Gold" },
      { hex: "#A67668", name: "Muted Terracotta" },
    ],
  },
  {
    id: "cp-emerald-ivory",
    name: "Emerald & Ivory",
    mood: "Garden-modern, heritage-classic",
    swatches: [
      { hex: "#2E6B3D", name: "Emerald" },
      { hex: "#8B9E7E", name: "Sage" },
      { hex: "#D4A853", name: "Antique Gold" },
      { hex: "#FFFDF7", name: "Ivory" },
      { hex: "#F5E6D3", name: "Champagne" },
    ],
  },
  {
    id: "cp-plum-fuchsia",
    name: "Plum & Fuchsia",
    mood: "Jewel-toned, dramatic, regal",
    swatches: [
      { hex: "#3B1F4A", name: "Plum" },
      { hex: "#C4488B", name: "Fuchsia" },
      { hex: "#8B2A1F", name: "Ruby" },
      { hex: "#D4A853", name: "Gold" },
      { hex: "#FFF8EA", name: "Ivory" },
    ],
  },
  {
    id: "cp-terracotta-sage",
    name: "Terracotta & Sage",
    mood: "Earthy, bohemian, sun-baked",
    swatches: [
      { hex: "#C4766E", name: "Terracotta" },
      { hex: "#8B9E7E", name: "Sage" },
      { hex: "#D9C8A8", name: "Oat" },
      { hex: "#A89577", name: "Driftwood" },
      { hex: "#F5ECE1", name: "Soft Ivory" },
    ],
  },
  {
    id: "cp-midnight-gold",
    name: "Midnight & Gold",
    mood: "Glamorous, modern, night-sky",
    swatches: [
      { hex: "#1C1F3A", name: "Midnight" },
      { hex: "#2E3457", name: "Navy" },
      { hex: "#D4A853", name: "Gold" },
      { hex: "#EDD7B5", name: "Champagne" },
      { hex: "#FFFDF7", name: "Ivory" },
    ],
  },
  {
    id: "cp-blush-mauve",
    name: "Blush & Mauve",
    mood: "Pastel, ethereal, airy",
    swatches: [
      { hex: "#F2C9C3", name: "Blush" },
      { hex: "#C7ACC9", name: "Mauve" },
      { hex: "#D9A7A0", name: "Dusty Rose" },
      { hex: "#F5ECE1", name: "Cream" },
      { hex: "#B09A86", name: "Taupe" },
    ],
  },
  {
    id: "cp-coral-turquoise",
    name: "Coral & Turquoise",
    mood: "Bright, tropical, joyful",
    swatches: [
      { hex: "#F2856A", name: "Coral" },
      { hex: "#2FB3B3", name: "Turquoise" },
      { hex: "#F5D547", name: "Sunshine" },
      { hex: "#FFFDF7", name: "Ivory" },
      { hex: "#3B6E6E", name: "Deep Teal" },
    ],
  },
];

// ── Flower library ──────────────────────────────────────────────────────────
// A visual flower lookbook surfaced in the floral-by-event section. Each
// entry has a photo, a short note on character, and typical combinations.

export const FLOWER_TYPES: FlowerType[] = [
  {
    id: "fl-peony",
    name: "Peonies",
    season: "Spring",
    palette: ["blush", "ivory", "fuchsia"],
    note: "Lush, ruffled — feels luxurious even in small doses.",
    pairs_well_with: ["Garden roses", "Ranunculus", "Eucalyptus"],
    photo_url: "https://images.unsplash.com/photo-1530177057671-c04aae7d69cb?w=800",
  },
  {
    id: "fl-garden-rose",
    name: "Garden roses",
    season: "Year-round",
    palette: ["blush", "ivory", "mauve", "peach"],
    note: "Romantic and full — the soft cousin of the classic rose.",
    pairs_well_with: ["Peonies", "Dahlias", "Astilbe"],
    photo_url: "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=800",
  },
  {
    id: "fl-ranunculus",
    name: "Ranunculus",
    season: "Spring",
    palette: ["coral", "ivory", "raspberry"],
    note: "Paper-petalled and saturated — punches far above its size.",
    pairs_well_with: ["Peonies", "Anemones", "Sweet pea"],
    photo_url: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=800",
  },
  {
    id: "fl-dahlia",
    name: "Dahlias",
    season: "Late summer / fall",
    palette: ["burgundy", "peach", "ivory", "pink"],
    note: "Architectural, big-bloomed — statement energy.",
    pairs_well_with: ["Garden roses", "Chrysanthemum", "Amaranthus"],
    photo_url: "https://images.unsplash.com/photo-1533612899669-1f7d67c1b8a3?w=800",
  },
  {
    id: "fl-marigold",
    name: "Marigolds",
    season: "Year-round (India)",
    palette: ["marigold", "saffron", "rust"],
    note: "Traditional Indian flower — garlands, rangoli, mandap florals.",
    pairs_well_with: ["Roses", "Jasmine", "Tuberose"],
    photo_url: "https://images.unsplash.com/photo-1606042834134-3b42f4fe2b6f?w=800",
  },
  {
    id: "fl-jasmine",
    name: "Jasmine",
    season: "Summer",
    palette: ["ivory"],
    note: "Fragrant and delicate — threaded into hair, garlands, aisle florals.",
    pairs_well_with: ["Roses", "Marigolds", "Tuberose"],
    photo_url: "https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=800",
  },
  {
    id: "fl-tuberose",
    name: "Tuberose (Rajnigandha)",
    season: "Summer / monsoon",
    palette: ["ivory"],
    note: "Heady fragrance — classic for mandaps and night events.",
    pairs_well_with: ["Jasmine", "Marigolds", "Roses"],
    photo_url: "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?w=800",
  },
  {
    id: "fl-orchid",
    name: "Orchids",
    season: "Year-round",
    palette: ["white", "fuchsia", "purple", "green"],
    note: "Architectural and long-lasting — great for hanging installations.",
    pairs_well_with: ["Monstera", "Anthuriums", "Roses"],
    photo_url: "https://images.unsplash.com/photo-1566467021572-e1e3d38eae96?w=800",
  },
  {
    id: "fl-hydrangea",
    name: "Hydrangeas",
    season: "Summer",
    palette: ["ivory", "blue", "mauve", "green"],
    note: "Huge volume on a budget — the backbone of lush arrangements.",
    pairs_well_with: ["Garden roses", "Eucalyptus", "Stock"],
    photo_url: "https://images.unsplash.com/photo-1523694576729-f39e90f8f3a3?w=800",
  },
  {
    id: "fl-babys-breath",
    name: "Baby's breath",
    season: "Year-round",
    palette: ["ivory"],
    note: "Airy and affordable — clouds of it fill big ceilings.",
    pairs_well_with: ["Roses", "Eucalyptus", "Lavender"],
    photo_url: "https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=800",
  },
  {
    id: "fl-eucalyptus",
    name: "Eucalyptus",
    season: "Year-round",
    palette: ["sage", "silver-green"],
    note: "Soft greenery — drapes beautifully across tables and arches.",
    pairs_well_with: ["Roses", "Peonies", "Dahlias"],
    photo_url: "https://images.unsplash.com/photo-1512428813834-c702c7702b78?w=800",
  },
  {
    id: "fl-amaranthus",
    name: "Amaranthus",
    season: "Late summer / fall",
    palette: ["burgundy", "green"],
    note: "Cascading tassels — drama for hanging installs and mandap.",
    pairs_well_with: ["Dahlias", "Roses", "Protea"],
    photo_url: "https://images.unsplash.com/photo-1611587037808-7f7e5a4e0c5b?w=800",
  },
  {
    id: "fl-pampas",
    name: "Pampas grass",
    season: "Dried / year-round",
    palette: ["wheat", "cream"],
    note: "Dried, textural — boho weddings and outdoor desert palettes.",
    pairs_well_with: ["Dried palm", "Bunny tails", "Roses"],
    photo_url: "https://images.unsplash.com/photo-1604879049116-a9c42cee34e3?w=800",
  },
  {
    id: "fl-anthurium",
    name: "Anthuriums",
    season: "Year-round",
    palette: ["red", "pink", "white", "green"],
    note: "Glossy and sculptural — modern tropical energy.",
    pairs_well_with: ["Orchids", "Monstera", "Birds of paradise"],
    photo_url: "https://images.unsplash.com/photo-1611232658409-0b2ba81ce7d2?w=800",
  },
  {
    id: "fl-monstera",
    name: "Monstera leaves",
    season: "Year-round",
    palette: ["deep green"],
    note: "Bold tropical greenery — instant resort vibe.",
    pairs_well_with: ["Orchids", "Anthurium", "Palm"],
    photo_url: "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=800",
  },
];

// ── Per-event floral suggestions ────────────────────────────────────────────
// Recommended flower IDs keyed by event — used to surface "great for this
// event" badges in the flower library.

export const EVENT_FLOWER_HINTS: Record<string, string[]> = {
  haldi: ["fl-marigold", "fl-jasmine", "fl-tuberose"],
  mehndi: ["fl-marigold", "fl-jasmine", "fl-orchid", "fl-hydrangea"],
  sangeet: ["fl-dahlia", "fl-orchid", "fl-amaranthus", "fl-garden-rose"],
  wedding: ["fl-marigold", "fl-jasmine", "fl-tuberose", "fl-garden-rose"],
  reception: ["fl-peony", "fl-garden-rose", "fl-dahlia", "fl-ranunculus"],
};

// ── Inspiration theme gallery seeds ─────────────────────────────────────────

export const INSPIRATION_THEME_SEEDS: Record<InspirationTheme, string[]> = {
  romantic: [
    "https://images.unsplash.com/photo-1519741497674-611481863552?w=600",
    "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=600",
    "https://images.unsplash.com/photo-1529519195486-16945f0fb37f?w=600",
    "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600",
  ],
  modern: [
    "https://images.unsplash.com/photo-1600122854034-16f0c0aaa79f?w=600",
    "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600",
    "https://images.unsplash.com/photo-1606800052052-a08af7148866?w=600",
    "https://images.unsplash.com/photo-1594908900066-3f47337549d8?w=600",
  ],
  traditional: [
    "https://images.unsplash.com/photo-1583939411023-14783179e581?w=600",
    "https://images.unsplash.com/photo-1604608672516-f1b9b1d1e9b5?w=600",
    "https://images.unsplash.com/photo-1609042900109-2b04fae5a1b9?w=600",
    "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=600",
  ],
  bohemian: [
    "https://images.unsplash.com/photo-1542037104857-ffbb0b9155fb?w=600",
    "https://images.unsplash.com/photo-1610030006930-8b1b18b60b38?w=600",
    "https://images.unsplash.com/photo-1595940293613-19d8d97f7a4f?w=600",
    "https://images.unsplash.com/photo-1620783770629-122b7f187703?w=600",
  ],
  garden: [
    "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=600",
    "https://images.unsplash.com/photo-1617183428445-0e1adf2c8b03?w=600",
    "https://images.unsplash.com/photo-1600721391776-b5cd0e0048a9?w=600",
    "https://images.unsplash.com/photo-1519741497674-611481863552?w=600",
  ],
  glamorous: [
    "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600",
    "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600",
    "https://images.unsplash.com/photo-1529519195486-16945f0fb37f?w=600",
    "https://images.unsplash.com/photo-1600122854034-16f0c0aaa79f?w=600",
  ],
  rustic: [
    "https://images.unsplash.com/photo-1542037104857-ffbb0b9155fb?w=600",
    "https://images.unsplash.com/photo-1519741497674-611481863552?w=600",
    "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=600",
    "https://images.unsplash.com/photo-1610030006930-8b1b18b60b38?w=600",
  ],
  minimalist: [
    "https://images.unsplash.com/photo-1600122854034-16f0c0aaa79f?w=600",
    "https://images.unsplash.com/photo-1606800052052-a08af7148866?w=600",
    "https://images.unsplash.com/photo-1594908900066-3f47337549d8?w=600",
    "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600",
  ],
};
