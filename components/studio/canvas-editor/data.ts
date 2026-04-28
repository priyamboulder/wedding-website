// ──────────────────────────────────────────────────────────────────────────
// Canvas editor — catalog data
//
// Trending palettes, font catalog (with Google Font loader), and surface-size
// options. Kept in this file so the editor has zero runtime data deps.
// ──────────────────────────────────────────────────────────────────────────

import type {
  CanvasSize,
  FontEntry,
  SurfaceType,
  TrendingPalette,
} from "./types";

// ── Surface sizes ────────────────────────────────────────────────────────
// 300 DPI print sizes for physical surfaces; screen pixels for digital ones.
// 24×36" physical sizes use a 1200×1800 proxy in the editor; export upscales.

export const SURFACE_SIZES: Record<SurfaceType, CanvasSize[]> = {
  invitation: [
    { id: "5x7p", label: "5 × 7 portrait", width: 1500, height: 2100, orientation: "portrait" },
    { id: "5x7l", label: "5 × 7 landscape", width: 2100, height: 1500, orientation: "landscape" },
    { id: "a5", label: "A5", width: 1748, height: 2480, orientation: "portrait" },
  ],
  save_the_date: [
    { id: "5x7p", label: "5 × 7 portrait", width: 1500, height: 2100, orientation: "portrait" },
    { id: "5x7l", label: "5 × 7 landscape", width: 2100, height: 1500, orientation: "landscape" },
    { id: "square", label: "5 × 5 square", width: 1500, height: 1500, orientation: "square" },
  ],
  menu: [
    { id: "4x9", label: "4 × 9 tall", width: 1200, height: 2700, orientation: "portrait" },
    { id: "5x7p", label: "5 × 7 portrait", width: 1500, height: 2100, orientation: "portrait" },
  ],
  welcome_sign: [
    { id: "24x36p", label: "24 × 36 portrait (proxy)", width: 1200, height: 1800, orientation: "portrait" },
    { id: "18x24p", label: "18 × 24 portrait (proxy)", width: 1200, height: 1600, orientation: "portrait" },
  ],
  seating_chart: [
    { id: "24x36l", label: "24 × 36 landscape (proxy)", width: 1800, height: 1200, orientation: "landscape" },
    { id: "36x24l", label: "36 × 24 landscape (proxy)", width: 1800, height: 1200, orientation: "landscape" },
  ],
  ceremony_program: [
    { id: "5x7p", label: "5 × 7 portrait", width: 1500, height: 2100, orientation: "portrait" },
    { id: "4x9", label: "4 × 9 tall", width: 1200, height: 2700, orientation: "portrait" },
  ],
  thank_you: [
    { id: "a6", label: "A6", width: 1240, height: 1748, orientation: "portrait" },
    { id: "square", label: "5 × 5 square", width: 1500, height: 1500, orientation: "square" },
  ],
  table_number: [
    { id: "4x6", label: "4 × 6", width: 1200, height: 1800, orientation: "portrait" },
    { id: "5x7p", label: "5 × 7 portrait", width: 1500, height: 2100, orientation: "portrait" },
  ],
  rsvp_card: [
    { id: "a6", label: "A6", width: 1240, height: 1748, orientation: "portrait" },
    { id: "a6l", label: "A6 landscape", width: 1748, height: 1240, orientation: "landscape" },
  ],
  ig_story: [
    { id: "story", label: "Instagram Story 1080 × 1920", width: 1080, height: 1920, orientation: "portrait" },
  ],
  ig_post: [
    { id: "square", label: "Instagram Post 1080 × 1080", width: 1080, height: 1080, orientation: "square" },
    { id: "portrait", label: "Instagram Portrait 1080 × 1350", width: 1080, height: 1350, orientation: "portrait" },
  ],
  whatsapp_invite: [
    { id: "square", label: "WhatsApp 800 × 800", width: 800, height: 800, orientation: "square" },
  ],
  video_invite: [
    { id: "1080p", label: "1080p 16:9", width: 1920, height: 1080, orientation: "landscape" },
    { id: "portrait", label: "Vertical 9:16", width: 1080, height: 1920, orientation: "portrait" },
  ],
  outfit_guide: [
    { id: "a4p", label: "A4 portrait", width: 2480, height: 3508, orientation: "portrait" },
  ],
  monogram: [
    { id: "square", label: "Square 1500 × 1500", width: 1500, height: 1500, orientation: "square" },
  ],
  wedding_logo: [
    { id: "landscape", label: "Landscape 2400 × 1200", width: 2400, height: 1200, orientation: "landscape" },
    { id: "square", label: "Square 1500 × 1500", width: 1500, height: 1500, orientation: "square" },
  ],
};

// ── Trending palettes ────────────────────────────────────────────────────

export const TRENDING_PALETTES: TrendingPalette[] = [
  {
    id: "rajwara-rose",
    name: "Rajwara Rose",
    mood: "Heritage palace • Marigold & oxblood",
    background: "#FDF8EF",
    swatches: ["#8B1A2B", "#D4AF37", "#5A3A20", "#FDF8EF"],
  },
  {
    id: "jasmine-dawn",
    name: "Jasmine Dawn",
    mood: "Soft saffron • Pearl ivory",
    background: "#FFFCF5",
    swatches: ["#E8B860", "#C9A24A", "#2E2E2E", "#FFFCF5"],
  },
  {
    id: "midnight-mehndi",
    name: "Midnight Mehndi",
    mood: "Copper • Kumkum • Ink noir",
    background: "#0E0E14",
    swatches: ["#B96A3F", "#9E2B25", "#A37A2E", "#F4EFE4"],
  },
  {
    id: "monsoon-emerald",
    name: "Monsoon Emerald",
    mood: "Deep emerald • Champagne gold",
    background: "#F9F6EE",
    swatches: ["#1F5E4B", "#D49ABF", "#C9A659", "#F9F6EE"],
  },
  {
    id: "sangeet-neon",
    name: "Sangeet Neon",
    mood: "Playful • Dholki night",
    background: "#0E0E14",
    swatches: ["#2B3A67", "#D49ABF", "#FFD700", "#F5E6C8"],
  },
  {
    id: "devanagari-dawn",
    name: "Devanagari Dawn",
    mood: "Temple red • Champagne",
    background: "#F4EFE4",
    swatches: ["#9E2B25", "#DDA08A", "#5A3A20", "#F4EFE4"],
  },
  {
    id: "sabyasachi-noir",
    name: "Sabyasachi Noir",
    mood: "Couture • Onyx & emerald",
    background: "#0E0E14",
    swatches: ["#1F5E4B", "#C9A659", "#F5E6C3", "#0E0E14"],
  },
  {
    id: "dune-amber",
    name: "Dune Amber",
    mood: "Destination • Desert tones",
    background: "#F5E8D0",
    swatches: ["#C9A659", "#2E1810", "#B96A3F", "#F5E8D0"],
  },
];

// ── Font catalog ─────────────────────────────────────────────────────────

export const FONT_CATALOG: FontEntry[] = [
  // Luxury / editorial
  { family: "Playfair Display", category: "luxury", stack: "'Playfair Display', Georgia, serif", weight: 400, googleFont: true },
  { family: "Fraunces",          category: "luxury", stack: "'Fraunces', Georgia, serif", weight: 400, googleFont: true },
  { family: "Cormorant Garamond",category: "luxury", stack: "'Cormorant Garamond', Georgia, serif", weight: 400, googleFont: true },
  { family: "DM Serif Display",  category: "luxury", stack: "'DM Serif Display', Georgia, serif", weight: 400, googleFont: true },

  // Elegant / refined
  { family: "EB Garamond",       category: "elegant", stack: "'EB Garamond', Georgia, serif", weight: 400, googleFont: true },
  { family: "Libre Baskerville", category: "elegant", stack: "'Libre Baskerville', Georgia, serif", weight: 400, googleFont: true },
  { family: "Crimson Text",      category: "elegant", stack: "'Crimson Text', Georgia, serif", weight: 400, googleFont: true },

  // Royal / monument
  { family: "Cinzel",            category: "royal", stack: "'Cinzel', 'Trajan Pro', serif", weight: 400, googleFont: true },
  { family: "Trajan Pro",        category: "royal", stack: "'Trajan Pro', Cinzel, serif", weight: 400 },
  { family: "Marcellus",         category: "royal", stack: "'Marcellus', Georgia, serif", weight: 400, googleFont: true },

  // Whimsical / script
  { family: "Great Vibes",       category: "whimsical", stack: "'Great Vibes', cursive", weight: 400, googleFont: true },
  { family: "Dancing Script",    category: "whimsical", stack: "'Dancing Script', cursive", weight: 400, googleFont: true },
  { family: "Parisienne",        category: "whimsical", stack: "'Parisienne', cursive", weight: 400, googleFont: true },
  { family: "Allura",            category: "whimsical", stack: "'Allura', cursive", weight: 400, googleFont: true },

  // Classic
  { family: "Inter",             category: "classic", stack: "'Inter', system-ui, sans-serif", weight: 400, googleFont: true },
  { family: "DM Sans",           category: "classic", stack: "'DM Sans', system-ui, sans-serif", weight: 400, googleFont: true },
  { family: "Lato",              category: "classic", stack: "'Lato', sans-serif", weight: 400, googleFont: true },

  // Refined
  { family: "Josefin Sans",      category: "refined", stack: "'Josefin Sans', sans-serif", weight: 300, googleFont: true },
  { family: "Poppins",           category: "refined", stack: "'Poppins', sans-serif", weight: 400, googleFont: true },

  // Devanagari (Hindi / Marathi)
  { family: "Noto Serif Devanagari", category: "script_hindi", stack: "'Noto Serif Devanagari', serif", googleFont: true },
  { family: "Tiro Devanagari Hindi", category: "script_hindi", stack: "'Tiro Devanagari Hindi', serif", googleFont: true },

  // Urdu (Arabic-script)
  { family: "Noto Naskh Arabic", category: "script_urdu", stack: "'Noto Naskh Arabic', serif", googleFont: true },
  { family: "Amiri",             category: "script_urdu", stack: "'Amiri', serif", googleFont: true },

  // Gujarati
  { family: "Noto Serif Gujarati", category: "script_gujarati", stack: "'Noto Serif Gujarati', serif", googleFont: true },
  { family: "Hind Vadodara",     category: "script_gujarati", stack: "'Hind Vadodara', sans-serif", googleFont: true },

  // Punjabi (Gurmukhi)
  { family: "Noto Sans Gurmukhi", category: "script_punjabi", stack: "'Noto Sans Gurmukhi', sans-serif", googleFont: true },
  { family: "Mukta Mahee",       category: "script_punjabi", stack: "'Mukta Mahee', sans-serif", googleFont: true },

  // Bengali
  { family: "Noto Serif Bengali", category: "script_bengali", stack: "'Noto Serif Bengali', serif", googleFont: true },
  { family: "Hind Siliguri",     category: "script_bengali", stack: "'Hind Siliguri', sans-serif", googleFont: true },

  // Tamil
  { family: "Noto Serif Tamil",  category: "script_tamil", stack: "'Noto Serif Tamil', serif", googleFont: true },
  { family: "Hind Madurai",      category: "script_tamil", stack: "'Hind Madurai', sans-serif", googleFont: true },
];

export const FONT_CATEGORY_LABEL: Record<FontEntry["category"], string> = {
  luxury: "Luxury",
  elegant: "Elegant",
  royal: "Royal",
  whimsical: "Whimsical",
  classic: "Classic",
  refined: "Refined",
  script_hindi: "Hindi / Devanagari",
  script_urdu: "Urdu / Arabic",
  script_gujarati: "Gujarati",
  script_punjabi: "Punjabi / Gurmukhi",
  script_bengali: "Bengali",
  script_tamil: "Tamil",
};

// ── Google font loader ───────────────────────────────────────────────────
// Appends one <link> per unique family; safe to call repeatedly.

const loadedFonts = new Set<string>();

export function ensureGoogleFont(family: string) {
  if (typeof document === "undefined") return;
  if (loadedFonts.has(family)) return;
  loadedFonts.add(family);
  const id = `gf-${family.replace(/\s+/g, "-").toLowerCase()}`;
  if (document.getElementById(id)) return;
  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@300;400;500;600;700&display=swap`;
  document.head.appendChild(link);
}

// Quick-prompt chips shown in the AI Magic panel.
export const AI_QUICK_PROMPTS = [
  "Make it more luxurious",
  "Add a traditional Indian motif",
  "Change to a sunset palette",
  "Switch to a modern minimalist look",
  "Suggest a better font for the couple names",
  "Balance the whitespace",
  "Add a touch of gold foil",
  "What trends work for this surface?",
];

// ── Shape / divider presets (client-side only, no fabric import) ─────────

export const SHAPE_PRESETS = [
  { kind: "rect",     label: "Rectangle" },
  { kind: "circle",   label: "Circle" },
  { kind: "line",     label: "Line" },
  { kind: "divider",  label: "Divider" },
] as const;

export const TEXT_PRESETS = [
  { kind: "heading", label: "Heading", sample: "Your Names", fontSize: 72, fontFamily: "Playfair Display", fontWeight: "bold" },
  { kind: "body",    label: "Body",    sample: "Together with their families",    fontSize: 24, fontFamily: "Cormorant Garamond" },
  { kind: "hindi",   label: "हिंदी",   sample: "शुभ विवाह",                         fontSize: 48, fontFamily: "Noto Serif Devanagari" },
  { kind: "urdu",    label: "اردو",    sample: "بسم الله",                          fontSize: 48, fontFamily: "Noto Naskh Arabic" },
  { kind: "gujarati",label: "ગુજરાતી",  sample: "શુભ લગ્ન",                         fontSize: 48, fontFamily: "Noto Serif Gujarati" },
  { kind: "punjabi", label: "ਪੰਜਾਬੀ",  sample: "ੴ",                                fontSize: 64, fontFamily: "Noto Sans Gurmukhi" },
  { kind: "bengali", label: "বাংলা",   sample: "শুভ বিবাহ",                        fontSize: 48, fontFamily: "Noto Serif Bengali" },
  { kind: "tamil",   label: "தமிழ்",  sample: "கல்யாணம்",                         fontSize: 48, fontFamily: "Noto Serif Tamil" },
] as const;
