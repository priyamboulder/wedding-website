// ── Journey palette gallery ────────────────────────────────────────────
//
// The 8 curated mood/aesthetic options shown in Step 3 of the journey.
// Each mood maps to a specific 5-color palette that flows into the
// brief, stationery, mood boards, and Studio designs.
//
// We deliberately don't try to use the existing PALETTE_LIBRARY here:
// the journey moods are editorial entry points (named for a *feeling*
// rather than a color pair), and the palettes attached to them are
// tuned for that emotional anchor.

export interface MoodSwatch {
  hex: string;
  name: string;
}

export interface JourneyMood {
  id: string;
  name: string;
  blurb: string;
  colors: MoodSwatch[]; // ordered: primary → accent → neutral → highlight
}

export const JOURNEY_MOODS: JourneyMood[] = [
  {
    id: "garden_romance",
    name: "Garden Romance",
    blurb: "Soft greens, blush, ivory, gold — outdoor, breezy, fresh.",
    colors: [
      { hex: "#9CAF88", name: "Sage" },
      { hex: "#E8D5D0", name: "Blush" },
      { hex: "#FBF9F4", name: "Ivory" },
      { hex: "#C9A96E", name: "Gold" },
      { hex: "#5C3A1E", name: "Bark" },
    ],
  },
  {
    id: "royal_jewel",
    name: "Royal Jewel",
    blurb: "Deep emerald, ruby, sapphire, gold — palace, ornate, regal.",
    colors: [
      { hex: "#1F4D3F", name: "Emerald" },
      { hex: "#8B1A2A", name: "Ruby" },
      { hex: "#2A3F6E", name: "Sapphire" },
      { hex: "#C9A96E", name: "Gold" },
      { hex: "#1A1A1A", name: "Ink" },
    ],
  },
  {
    id: "modern_minimalist",
    name: "Modern Minimalist",
    blurb: "White, black, one bold accent — architectural, clean, intentional.",
    colors: [
      { hex: "#FFFFFF", name: "White" },
      { hex: "#1A1A1A", name: "Black" },
      { hex: "#D4A5A5", name: "Blush" },
      { hex: "#C9A96E", name: "Gold" },
      { hex: "#7A7574", name: "Stone" },
    ],
  },
  {
    id: "sunset_warmth",
    name: "Sunset Warmth",
    blurb: "Terracotta, marigold, dusty rose, copper — golden hour at a haveli.",
    colors: [
      { hex: "#C67D5B", name: "Terracotta" },
      { hex: "#D4A053", name: "Marigold" },
      { hex: "#D4A5A5", name: "Dusty Rose" },
      { hex: "#B5623C", name: "Copper" },
      { hex: "#3A1F14", name: "Walnut" },
    ],
  },
  {
    id: "pastel_dream",
    name: "Pastel Dream",
    blurb: "Lavender, baby blue, soft pink, cream — daylight, airy, romantic.",
    colors: [
      { hex: "#C8B4DD", name: "Lavender" },
      { hex: "#BFD3E6", name: "Sky" },
      { hex: "#F5C9D1", name: "Petal" },
      { hex: "#FBF3E4", name: "Cream" },
      { hex: "#7A8BA3", name: "Storm" },
    ],
  },
  {
    id: "bollywood_glam",
    name: "Bollywood Glam",
    blurb: "Hot pink, orange, red, gold — film-set energy, big and unapologetic.",
    colors: [
      { hex: "#E63573", name: "Hot Pink" },
      { hex: "#E8763A", name: "Mango" },
      { hex: "#C8243C", name: "Sindoor Red" },
      { hex: "#D4A053", name: "Gold" },
      { hex: "#1A1A1A", name: "Kohl" },
    ],
  },
  {
    id: "earthy_organic",
    name: "Earthy & Organic",
    blurb: "Sage, rust, champagne, olive — slow, warm, modern-rustic.",
    colors: [
      { hex: "#7A8A6A", name: "Sage" },
      { hex: "#A85A3A", name: "Rust" },
      { hex: "#E8DAB9", name: "Champagne" },
      { hex: "#5C6B3F", name: "Olive" },
      { hex: "#3A2E1F", name: "Walnut" },
    ],
  },
  {
    id: "classic_elegance",
    name: "Classic Elegance",
    blurb: "Navy, gold, ivory, burgundy — black-tie, timeless, formal.",
    colors: [
      { hex: "#1F2A4A", name: "Navy" },
      { hex: "#C9A96E", name: "Gold" },
      { hex: "#FBF9F4", name: "Ivory" },
      { hex: "#5C1A2B", name: "Burgundy" },
      { hex: "#0F1626", name: "Midnight" },
    ],
  },
];

export function moodById(id: string | null | undefined): JourneyMood | null {
  if (!id) return null;
  return JOURNEY_MOODS.find((m) => m.id === id) ?? null;
}
