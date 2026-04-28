// ── Category-aware style tag palette for Roulette setup ─────────────────────
// Each category gets a hand-picked set of 6-10 vibe descriptors the bride
// can tap to express what she's looking for. Tags are lowercase by
// convention and matched case-insensitively against vendor.style_tags.

import type { VendorCategory } from "@/types/vendor";

export const ROULETTE_STYLE_TAGS: Record<VendorCategory, string[]> = {
  photography: [
    "editorial",
    "candid",
    "documentary",
    "moody",
    "bright",
    "cinematic",
    "classic",
    "fine art",
    "slow",
    "tonal",
  ],
  hmua: [
    "natural",
    "glam",
    "editorial",
    "soft",
    "bold",
    "traditional",
    "airbrush",
    "dewy",
  ],
  decor_florals: [
    "romantic",
    "modern",
    "lush",
    "wild",
    "minimal",
    "structural",
    "tropical",
    "classic",
    "grand",
    "bohemian",
  ],
  catering: [
    "regional",
    "fusion",
    "live stations",
    "plated",
    "vegetarian-forward",
    "global",
    "heritage",
    "modern indian",
  ],
  entertainment: [
    "hype",
    "chill",
    "bollywood",
    "top 40",
    "edm",
    "live band",
    "eclectic",
    "classical",
  ],
  wardrobe: [
    "couture",
    "modern",
    "heirloom",
    "minimal",
    "bold color",
    "classic",
    "festive",
    "contemporary",
  ],
  stationery: [
    "editorial",
    "classic",
    "modern",
    "illustrated",
    "minimal",
    "ornate",
    "letterpress",
    "bilingual",
  ],
  pandit_ceremony: [
    "traditional",
    "bilingual",
    "explanatory",
    "concise",
    "musical",
    "regional",
    "modern",
  ],
};

export function styleTagsForCategory(category: VendorCategory): string[] {
  return ROULETTE_STYLE_TAGS[category] ?? [];
}
