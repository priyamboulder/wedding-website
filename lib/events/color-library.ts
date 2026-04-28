// ── Wedding color library ─────────────────────────────────────────────────
// Curated palette-building block set used by the Coolors-style workbench on
// Q4 per-event canvas. ~80 colors organized by family so the swap drawer
// can filter intelligently (warm/cool, formal/casual, by family).
//
// Kept as a plain TS module rather than JSON — gives us literal type
// safety on `family` / `warmth` / `vibeTags` without a parser step.

export type ColorFamily =
  | "red"
  | "pink"
  | "peach"
  | "coral"
  | "orange"
  | "yellow"
  | "gold"
  | "green"
  | "blue"
  | "purple"
  | "neutral"
  | "dark";

export type ColorWarmth = "warm" | "cool" | "neutral";

export interface ColorLibraryEntry {
  id: string;
  hex: string;
  name: string;
  family: ColorFamily;
  warmth: ColorWarmth;
  // 1 (casual, daytime, playful) → 10 (black-tie, ceremonial, formal).
  formalityScore: number;
  vibeTags: string[];
}

export const COLOR_LIBRARY: ColorLibraryEntry[] = [
  // ── Reds ──────────────────────────────────────────────────────────────
  { id: "ruby",        hex: "#8A1A2B", name: "Ruby",         family: "red",     warmth: "warm", formalityScore: 9, vibeTags: ["jewel", "ornate", "formal"] },
  { id: "wine",        hex: "#5C1A2B", name: "Wine",         family: "red",     warmth: "warm", formalityScore: 9, vibeTags: ["jewel", "velvet", "deep"] },
  { id: "crimson",     hex: "#A6182D", name: "Crimson",      family: "red",     warmth: "warm", formalityScore: 8, vibeTags: ["saturated", "traditional", "bollywood"] },
  { id: "sindoor",     hex: "#D0342C", name: "Sindoor",      family: "red",     warmth: "warm", formalityScore: 7, vibeTags: ["traditional", "saturated", "ceremonial"] },
  { id: "oxblood",     hex: "#4A1220", name: "Oxblood",      family: "red",     warmth: "warm", formalityScore: 9, vibeTags: ["deep", "moody", "velvet"] },
  { id: "terracotta",  hex: "#B76A46", name: "Terracotta",   family: "red",     warmth: "warm", formalityScore: 5, vibeTags: ["earth", "clay", "courtyard"] },

  // ── Pinks ─────────────────────────────────────────────────────────────
  { id: "blush",       hex: "#E6C2B6", name: "Blush",        family: "pink",    warmth: "warm", formalityScore: 7, vibeTags: ["pastel", "soft", "tonal"] },
  { id: "rose",        hex: "#C97B63", name: "Rose",         family: "pink",    warmth: "warm", formalityScore: 6, vibeTags: ["romantic", "garden", "dusty"] },
  { id: "dusty_rose",  hex: "#C98B9C", name: "Dusty Rose",   family: "pink",    warmth: "warm", formalityScore: 6, vibeTags: ["pastel", "garden", "soft"] },
  { id: "bougainvillea", hex: "#B1245F", name: "Bougainvillea", family: "pink", warmth: "warm", formalityScore: 6, vibeTags: ["saturated", "playful", "garden"] },
  { id: "hot_pink",    hex: "#D93878", name: "Hot Pink",     family: "pink",    warmth: "warm", formalityScore: 5, vibeTags: ["playful", "neon", "late-night"] },
  { id: "petal",       hex: "#F5E0D6", name: "Petal",        family: "pink",    warmth: "warm", formalityScore: 6, vibeTags: ["pastel", "tonal", "daytime"] },

  // ── Peaches / Corals ──────────────────────────────────────────────────
  { id: "peach",       hex: "#F2A65A", name: "Peach",        family: "peach",   warmth: "warm", formalityScore: 5, vibeTags: ["playful", "pastel", "golden-hour"] },
  { id: "coral",       hex: "#E09C7E", name: "Coral",        family: "coral",   warmth: "warm", formalityScore: 5, vibeTags: ["coastal", "fresh", "daytime"] },
  { id: "apricot",     hex: "#F0B07D", name: "Apricot",      family: "peach",   warmth: "warm", formalityScore: 5, vibeTags: ["soft", "garden", "pastel"] },
  { id: "salmon",      hex: "#E28677", name: "Salmon",       family: "coral",   warmth: "warm", formalityScore: 5, vibeTags: ["coastal", "playful", "warm"] },

  // ── Oranges ───────────────────────────────────────────────────────────
  { id: "marigold",    hex: "#E08A2E", name: "Marigold",     family: "orange",  warmth: "warm", formalityScore: 7, vibeTags: ["traditional", "temple", "saturated"] },
  { id: "saffron",     hex: "#D4A24C", name: "Saffron",      family: "orange",  warmth: "warm", formalityScore: 7, vibeTags: ["traditional", "golden-hour", "ceremonial"] },
  { id: "rust",        hex: "#B05C2F", name: "Rust",         family: "orange",  warmth: "warm", formalityScore: 6, vibeTags: ["earth", "autumn", "clay"] },
  { id: "tangerine",   hex: "#E5732A", name: "Tangerine",    family: "orange",  warmth: "warm", formalityScore: 5, vibeTags: ["folk", "playful", "saturated"] },
  { id: "amber",       hex: "#C99A45", name: "Amber",        family: "orange",  warmth: "warm", formalityScore: 7, vibeTags: ["jewel", "candlelight", "traditional"] },

  // ── Yellows ───────────────────────────────────────────────────────────
  { id: "turmeric",    hex: "#E5A72C", name: "Turmeric",     family: "yellow",  warmth: "warm", formalityScore: 6, vibeTags: ["traditional", "haldi", "ceremonial"] },
  { id: "ghee",        hex: "#FBF3DE", name: "Ghee",         family: "yellow",  warmth: "warm", formalityScore: 5, vibeTags: ["soft", "pastel", "daytime"] },
  { id: "wheat",       hex: "#F5E6C8", name: "Wheat",        family: "yellow",  warmth: "warm", formalityScore: 6, vibeTags: ["traditional", "tonal", "cream"] },
  { id: "butter",      hex: "#F4D98A", name: "Butter",       family: "yellow",  warmth: "warm", formalityScore: 5, vibeTags: ["pastel", "soft", "daytime"] },

  // ── Golds ─────────────────────────────────────────────────────────────
  { id: "antique_gold",hex: "#8A6A2E", name: "Antique Gold", family: "gold",    warmth: "warm", formalityScore: 9, vibeTags: ["formal", "jewel", "ornate"] },
  { id: "brass",       hex: "#A37A3A", name: "Brass",        family: "gold",    warmth: "warm", formalityScore: 8, vibeTags: ["ornate", "oxidized", "traditional"] },
  { id: "gold_leaf",   hex: "#D4A843", name: "Gold Leaf",    family: "gold",    warmth: "warm", formalityScore: 9, vibeTags: ["jewel", "ornate", "ceremonial"] },
  { id: "champagne",   hex: "#E8D4A0", name: "Champagne",    family: "gold",    warmth: "warm", formalityScore: 8, vibeTags: ["tonal", "shimmer", "formal"] },
  { id: "rose_gold",   hex: "#C79B7A", name: "Rose Gold",    family: "gold",    warmth: "warm", formalityScore: 7, vibeTags: ["tonal", "shimmer", "soft"] },
  { id: "classic_gold",hex: "#B8860B", name: "Gold",         family: "gold",    warmth: "warm", formalityScore: 8, vibeTags: ["formal", "classic", "ornate"] },

  // ── Greens ────────────────────────────────────────────────────────────
  { id: "emerald",     hex: "#1F4D3F", name: "Emerald",      family: "green",   warmth: "cool", formalityScore: 9, vibeTags: ["jewel", "lush", "formal"] },
  { id: "forest",      hex: "#0F3027", name: "Forest",       family: "green",   warmth: "cool", formalityScore: 9, vibeTags: ["deep", "moody", "evening"] },
  { id: "banana_leaf", hex: "#3F6B3A", name: "Banana Leaf",  family: "green",   warmth: "cool", formalityScore: 6, vibeTags: ["traditional", "temple", "south-indian"] },
  { id: "sage",        hex: "#8FA276", name: "Sage",         family: "green",   warmth: "cool", formalityScore: 5, vibeTags: ["garden", "monsoon", "minimal"] },
  { id: "mint",        hex: "#B8D4C4", name: "Mint",         family: "green",   warmth: "cool", formalityScore: 5, vibeTags: ["coastal", "fresh", "daylight"] },
  { id: "olive",       hex: "#6B7A3A", name: "Olive",        family: "green",   warmth: "cool", formalityScore: 6, vibeTags: ["earth", "garden", "autumn"] },
  { id: "peacock",     hex: "#0F6A6B", name: "Peacock",      family: "green",   warmth: "cool", formalityScore: 8, vibeTags: ["jewel", "saturated", "ornate"] },
  { id: "mirror_sage", hex: "#C8D4C4", name: "Mirror Sage",  family: "green",   warmth: "cool", formalityScore: 6, vibeTags: ["haveli", "soft", "minimal"] },

  // ── Blues ─────────────────────────────────────────────────────────────
  { id: "midnight",    hex: "#161A36", name: "Midnight",     family: "blue",    warmth: "cool", formalityScore: 10, vibeTags: ["formal", "evening", "black-tie"] },
  { id: "navy",        hex: "#1B2B4A", name: "Navy",         family: "blue",    warmth: "cool", formalityScore: 9, vibeTags: ["formal", "classic", "evening"] },
  { id: "sapphire",    hex: "#1B3A6B", name: "Sapphire",     family: "blue",    warmth: "cool", formalityScore: 9, vibeTags: ["jewel", "ornate", "formal"] },
  { id: "indigo",      hex: "#3C4F8C", name: "Indigo",       family: "blue",    warmth: "cool", formalityScore: 7, vibeTags: ["haveli", "fresco", "courtyard"] },
  { id: "dusk",        hex: "#647A78", name: "Dusk",         family: "blue",    warmth: "cool", formalityScore: 6, vibeTags: ["monsoon", "modern", "architectural"] },
  { id: "sky",         hex: "#8FA8B3", name: "Sky",          family: "blue",    warmth: "cool", formalityScore: 5, vibeTags: ["coastal", "fresh", "daytime"] },
  { id: "cobalt",      hex: "#2649A7", name: "Cobalt",       family: "blue",    warmth: "cool", formalityScore: 7, vibeTags: ["saturated", "modern", "bold"] },

  // ── Purples ───────────────────────────────────────────────────────────
  { id: "aubergine",   hex: "#3A1F3F", name: "Aubergine",    family: "purple",  warmth: "cool", formalityScore: 9, vibeTags: ["deep", "moody", "formal"] },
  { id: "plum",        hex: "#5A2A4A", name: "Plum",         family: "purple",  warmth: "cool", formalityScore: 8, vibeTags: ["jewel", "evening", "ornate"] },
  { id: "amethyst",    hex: "#7A4F8E", name: "Amethyst",     family: "purple",  warmth: "cool", formalityScore: 7, vibeTags: ["jewel", "saturated", "romantic"] },
  { id: "lilac",       hex: "#C8B7D8", name: "Lilac",        family: "purple",  warmth: "cool", formalityScore: 5, vibeTags: ["pastel", "garden", "soft"] },
  { id: "mauve",       hex: "#9E7A86", name: "Mauve",        family: "purple",  warmth: "cool", formalityScore: 6, vibeTags: ["tonal", "dusty", "romantic"] },

  // ── Neutrals ──────────────────────────────────────────────────────────
  { id: "ivory",       hex: "#FBF9F4", name: "Ivory",        family: "neutral", warmth: "neutral", formalityScore: 7, vibeTags: ["formal", "classic", "clean"] },
  { id: "cream",       hex: "#F5ECDB", name: "Cream",        family: "neutral", warmth: "warm",    formalityScore: 6, vibeTags: ["tonal", "soft", "traditional"] },
  { id: "parchment",   hex: "#E8DFCE", name: "Parchment",    family: "neutral", warmth: "warm",    formalityScore: 7, vibeTags: ["editorial", "minimal", "tonal"] },
  { id: "oat",         hex: "#EDE4D3", name: "Oat",          family: "neutral", warmth: "neutral", formalityScore: 6, vibeTags: ["minimal", "editorial", "soft"] },
  { id: "linen",       hex: "#EFEADF", name: "Linen",        family: "neutral", warmth: "neutral", formalityScore: 6, vibeTags: ["coastal", "minimal", "fresh"] },
  { id: "sand",        hex: "#CDBFA6", name: "Sand",         family: "neutral", warmth: "warm",    formalityScore: 5, vibeTags: ["coastal", "clay", "earth"] },
  { id: "stone",       hex: "#B8B2A7", name: "Stone",        family: "neutral", warmth: "neutral", formalityScore: 6, vibeTags: ["architectural", "minimal", "modern"] },
  { id: "smoke",       hex: "#9A9A9A", name: "Smoke",        family: "neutral", warmth: "neutral", formalityScore: 7, vibeTags: ["moody", "architectural", "modern"] },
  { id: "pearl",       hex: "#EDEAE2", name: "Pearl",        family: "neutral", warmth: "neutral", formalityScore: 8, vibeTags: ["shimmer", "formal", "monochrome"] },
  { id: "shell",       hex: "#FBF6EF", name: "Shell",        family: "neutral", warmth: "warm",    formalityScore: 5, vibeTags: ["coastal", "soft", "pastel"] },
  { id: "taupe",       hex: "#8A7B68", name: "Taupe",        family: "neutral", warmth: "neutral", formalityScore: 6, vibeTags: ["earth", "minimal", "tonal"] },

  // ── Darks ─────────────────────────────────────────────────────────────
  { id: "ink",         hex: "#1A1A1A", name: "Ink",          family: "dark",    warmth: "neutral", formalityScore: 10, vibeTags: ["formal", "black-tie", "classic"] },
  { id: "onyx",        hex: "#111111", name: "Onyx",         family: "dark",    warmth: "cool",    formalityScore: 10, vibeTags: ["monochrome", "black-tie", "moody"] },
  { id: "forest_ink",  hex: "#0F1A1A", name: "Forest Ink",   family: "dark",    warmth: "cool",    formalityScore: 9,  vibeTags: ["moody", "deep", "evening"] },
  { id: "graphite",    hex: "#3B3E45", name: "Graphite",     family: "dark",    warmth: "cool",    formalityScore: 8,  vibeTags: ["architectural", "modern", "minimal"] },
  { id: "charcoal",    hex: "#2A2A2A", name: "Charcoal",     family: "dark",    warmth: "neutral", formalityScore: 9,  vibeTags: ["modern", "moody", "formal"] },
  { id: "tamarind",    hex: "#4A2414", name: "Tamarind",     family: "dark",    warmth: "warm",    formalityScore: 7,  vibeTags: ["earth", "deep", "traditional"] },
  { id: "sandalwood",  hex: "#5C3A1E", name: "Sandalwood",   family: "dark",    warmth: "warm",    formalityScore: 7,  vibeTags: ["traditional", "earth", "temple"] },
  { id: "midnight_ink",hex: "#0C0F24", name: "Midnight Ink", family: "dark",    warmth: "cool",    formalityScore: 10, vibeTags: ["evening", "formal", "deep"] },
];

const BY_HEX = new Map(
  COLOR_LIBRARY.map((c) => [c.hex.toLowerCase(), c]),
);

export function findColorByHex(hex: string): ColorLibraryEntry | undefined {
  return BY_HEX.get(hex.toLowerCase());
}

export function colorsByFamily(family: ColorFamily): ColorLibraryEntry[] {
  return COLOR_LIBRARY.filter((c) => c.family === family);
}

export const COLOR_FAMILY_ORDER: { id: ColorFamily; label: string }[] = [
  { id: "red",     label: "Reds" },
  { id: "pink",    label: "Pinks" },
  { id: "peach",   label: "Peach" },
  { id: "coral",   label: "Coral" },
  { id: "orange",  label: "Orange" },
  { id: "yellow",  label: "Yellow" },
  { id: "gold",    label: "Gold" },
  { id: "green",   label: "Greens" },
  { id: "blue",    label: "Blues" },
  { id: "purple",  label: "Purples" },
  { id: "neutral", label: "Neutrals" },
  { id: "dark",    label: "Darks" },
];
