// ── Style quiz seed data ─────────────────────────────────────────────────
// Defines the 5 visual chemistry questions, the option set per dimension,
// and the seeded vendor profiles tagged on the same axes. The matching
// algorithm in style-quiz-match.ts uses weighted overlap between couple
// responses and vendor tags to produce a 0-100 chemistry score.

import type { StyleDimension } from "@/stores/style-quiz-store";

export interface QuizOption {
  id: string;
  label: string;
  // Short Cormorant subtitle that completes the choice. Optional.
  subtitle?: string;
  // CSS gradient string used as the visual swatch in lieu of imagery.
  // Keeps the quiz portable without bundling photos.
  gradient: string;
  // Tags this option contributes to the couple's profile when chosen.
  // Vendors carry their own tag set — overlap drives the score.
  tags: string[];
}

export interface QuizQuestion {
  id: StyleDimension;
  prompt: string;
  helper: string;
  options: QuizOption[];
}

export const STYLE_QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: "photography_style",
    prompt: "Which photography pulls you in?",
    helper: "There's no wrong answer — go with your gut.",
    options: [
      {
        id: "candid_documentary",
        label: "Candid & documentary",
        subtitle: "Real moments, off-the-cuff laughs",
        gradient:
          "linear-gradient(135deg, #F5E0D6 0%, #E8D5D0 50%, #C4929B 100%)",
        tags: ["documentary", "candid", "warm", "natural-light"],
      },
      {
        id: "editorial_posed",
        label: "Editorial & posed",
        subtitle: "Vogue cover energy",
        gradient:
          "linear-gradient(135deg, #2E2E2E 0%, #6B6B6B 60%, #C9A96E 100%)",
        tags: ["editorial", "posed", "fashion", "directed"],
      },
      {
        id: "moody_cinematic",
        label: "Moody & cinematic",
        subtitle: "Deep shadows, film grain",
        gradient:
          "linear-gradient(135deg, #1A1A1A 0%, #5B5462 60%, #A87A82 100%)",
        tags: ["moody", "cinematic", "film", "shadow", "dramatic"],
      },
      {
        id: "bright_colorful",
        label: "Bright & colorful",
        subtitle: "Marigold sun, popping hues",
        gradient:
          "linear-gradient(135deg, #F0E4C8 0%, #E8A838 50%, #D4663A 100%)",
        tags: ["bright", "vibrant", "colorful", "saturated"],
      },
    ],
  },
  {
    id: "decor_energy",
    prompt: "Your dream décor energy?",
    helper: "How does the room *feel* when guests walk in?",
    options: [
      {
        id: "lush_maximalist",
        label: "Lush & maximalist",
        subtitle: "Florals overhead, every inch styled",
        gradient:
          "linear-gradient(135deg, #C97B63 0%, #D4A24C 50%, #5B8C5A 100%)",
        tags: ["maximalist", "lush", "florals", "ornate", "layered"],
      },
      {
        id: "minimal_modern",
        label: "Minimal & modern",
        subtitle: "Clean lines, single statement",
        gradient:
          "linear-gradient(135deg, #FBF9F4 0%, #EDE8DF 50%, #B5AFAD 100%)",
        tags: ["minimal", "modern", "clean", "architectural"],
      },
      {
        id: "earthy_organic",
        label: "Earthy & organic",
        subtitle: "Wildflowers, raw wood, candlelight",
        gradient:
          "linear-gradient(135deg, #E8F0E0 0%, #B8C9A8 50%, #9CAF88 100%)",
        tags: ["earthy", "organic", "natural", "botanical", "rustic"],
      },
      {
        id: "traditional_ornate",
        label: "Traditional & ornate",
        subtitle: "Heirloom motifs, brass, silk",
        gradient:
          "linear-gradient(135deg, #B8860B 0%, #C97B63 50%, #7B5EA7 100%)",
        tags: ["traditional", "ornate", "heirloom", "ceremonial"],
      },
    ],
  },
  {
    id: "music_vibe",
    prompt: "What's the music vibe?",
    helper: "Picture the dance floor at 11 pm.",
    options: [
      {
        id: "live_band_high",
        label: "Live band, high energy",
        subtitle: "Brass section, packed floor",
        gradient:
          "linear-gradient(135deg, #D4663A 0%, #C97B63 50%, #B8860B 100%)",
        tags: ["live-band", "high-energy", "brass", "dance"],
      },
      {
        id: "dj_bollywood",
        label: "DJ & Bollywood bangers",
        subtitle: "Every hit, every era",
        gradient:
          "linear-gradient(135deg, #7B5EA7 0%, #A87A82 50%, #E8A838 100%)",
        tags: ["dj", "bollywood", "high-energy", "popular"],
      },
      {
        id: "acoustic_intimate",
        label: "Acoustic & intimate",
        subtitle: "Sitar, soft strings, quiet awe",
        gradient:
          "linear-gradient(135deg, #F5E6D3 0%, #DDA08A 50%, #5B8E8A 100%)",
        tags: ["acoustic", "intimate", "classical", "soft"],
      },
      {
        id: "mix_everything",
        label: "Mix of everything",
        subtitle: "Reading the room, top to bottom",
        gradient:
          "linear-gradient(135deg, #5B8E8A 0%, #B8860B 50%, #C4929B 100%)",
        tags: ["mix", "versatile", "dj", "live-band"],
      },
    ],
  },
  {
    id: "food_style",
    prompt: "How do you want to feed people?",
    helper: "Food is half the wedding.",
    options: [
      {
        id: "plated_fine",
        label: "Plated, fine-dining",
        subtitle: "Course by course, white napkins",
        gradient:
          "linear-gradient(135deg, #FAF7F2 0%, #C9A96E 60%, #2E2E2E 100%)",
        tags: ["plated", "fine-dining", "formal"],
      },
      {
        id: "family_style",
        label: "Family-style sharing",
        subtitle: "Big platters down the table",
        gradient:
          "linear-gradient(135deg, #E8D5D0 0%, #DDA08A 50%, #C97B63 100%)",
        tags: ["family-style", "sharing", "warm"],
      },
      {
        id: "live_stations",
        label: "Live stations & street food",
        subtitle: "Chaat, kebabs, the works",
        gradient:
          "linear-gradient(135deg, #E8A838 0%, #D4663A 50%, #C97B63 100%)",
        tags: ["live-stations", "street-food", "interactive", "casual"],
      },
      {
        id: "traditional_thali",
        label: "Traditional thali service",
        subtitle: "Banana leaves, full ritual",
        gradient:
          "linear-gradient(135deg, #5B8C5A 0%, #B8860B 50%, #C4929B 100%)",
        tags: ["thali", "traditional", "ritual", "regional"],
      },
    ],
  },
  {
    id: "overall_energy",
    prompt: "And the overall energy?",
    helper: "Final one — promise.",
    options: [
      {
        id: "intimate_under_100",
        label: "Intimate & personal",
        subtitle: "Under 100 — every guest matters",
        gradient:
          "linear-gradient(135deg, #F7EDEA 0%, #E8D5D0 50%, #C4929B 100%)",
        tags: ["intimate", "small", "personal"],
      },
      {
        id: "grand_200_plus",
        label: "Grand & celebratory",
        subtitle: "200+ — big sound, big love",
        gradient:
          "linear-gradient(135deg, #B8860B 0%, #D4663A 50%, #C4929B 100%)",
        tags: ["grand", "large", "celebratory"],
      },
      {
        id: "destination_adventure",
        label: "Destination & adventurous",
        subtitle: "Somewhere we've never been",
        gradient:
          "linear-gradient(135deg, #5B8E8A 0%, #85AEAB 50%, #F5E6D3 100%)",
        tags: ["destination", "travel", "adventure"],
      },
      {
        id: "backyard_relaxed",
        label: "Backyard & relaxed",
        subtitle: "Folding chairs, fairy lights",
        gradient:
          "linear-gradient(135deg, #E8F0E0 0%, #B8C9A8 50%, #DDA08A 100%)",
        tags: ["relaxed", "backyard", "casual", "intimate"],
      },
    ],
  },
];

// ── Vendor profiles ──────────────────────────────────────────────────────
// V1: a curated seed of Indian-wedding-fluent vendors across the four
// categories the dashboard surfaces. Each vendor is tagged on the same
// dimensions the couple answers — the matching score is the percentage
// of overlap between vendor tags and the union of the couple's tags.
//
// `category` matches the couple-facing labels in the dashboard so the
// matches card can group by category without an extra mapping table.

export type VendorMatchCategory =
  | "Photography"
  | "Décor & Florals"
  | "Music & DJ"
  | "Catering";

export interface MatchableVendor {
  id: string;
  name: string;
  category: VendorMatchCategory;
  city: string;
  // Short pitch — surfaced in the match results card.
  tagline: string;
  // 1–2 specialty notes to render under the chemistry score.
  specialties: string[];
  // Tags this vendor identifies with — drives the chemistry score.
  tags: string[];
  // Slug used for "View profile →" — placeholder routing.
  slug: string;
}

export const SEED_MATCHABLE_VENDORS: MatchableVendor[] = [
  // ── Photography ──
  {
    id: "vm-photo-saudamini",
    name: "Saudamini Studios",
    category: "Photography",
    city: "Mumbai",
    tagline: "Documentary photographers with a film soul.",
    specialties: ["Candid documentary", "Sikh & Punjabi ceremonies"],
    tags: ["documentary", "candid", "natural-light", "warm", "intimate"],
    slug: "saudamini-studios",
  },
  {
    id: "vm-photo-house-of-pixels",
    name: "House of Pixels",
    category: "Photography",
    city: "Delhi",
    tagline: "Editorial portraits that read like a magazine spread.",
    specialties: ["Editorial direction", "Couture brands"],
    tags: ["editorial", "posed", "fashion", "directed", "grand"],
    slug: "house-of-pixels",
  },
  {
    id: "vm-photo-still-frames",
    name: "Still Frames Co.",
    category: "Photography",
    city: "Bangalore",
    tagline: "Moody, cinematic — every frame feels like a still from a film.",
    specialties: ["Cinematic colour grade", "Destination weddings"],
    tags: ["moody", "cinematic", "film", "shadow", "destination"],
    slug: "still-frames-co",
  },
  {
    id: "vm-photo-marigold",
    name: "Marigold Light",
    category: "Photography",
    city: "Jaipur",
    tagline: "Saturated, sun-drenched, joyfully colourful.",
    specialties: ["Bright daylight", "Rajasthani heritage venues"],
    tags: ["bright", "vibrant", "colorful", "saturated", "traditional"],
    slug: "marigold-light",
  },
  // ── Décor & Florals ──
  {
    id: "vm-decor-petalcraft",
    name: "Petalcraft Studio",
    category: "Décor & Florals",
    city: "Mumbai",
    tagline: "Floral installations with painterly excess.",
    specialties: ["Lush canopies", "Maximalist tablescapes"],
    tags: ["maximalist", "lush", "florals", "ornate", "layered"],
    slug: "petalcraft-studio",
  },
  {
    id: "vm-decor-line-and-room",
    name: "Line & Room",
    category: "Décor & Florals",
    city: "Bangalore",
    tagline: "Architectural minimalism — one beautiful gesture per room.",
    specialties: ["Sculptural florals", "Modern venues"],
    tags: ["minimal", "modern", "clean", "architectural"],
    slug: "line-and-room",
  },
  {
    id: "vm-decor-wildflower-co",
    name: "Wildflower Co.",
    category: "Décor & Florals",
    city: "Goa",
    tagline: "Foraged stems, bare wood, candlelight.",
    specialties: ["Botanical styling", "Outdoor & beachside"],
    tags: ["earthy", "organic", "natural", "botanical", "rustic"],
    slug: "wildflower-co",
  },
  {
    id: "vm-decor-heritage-house",
    name: "Heritage House Décor",
    category: "Décor & Florals",
    city: "Udaipur",
    tagline: "Brass, marigold, and silk — the old ways, beautifully.",
    specialties: ["Heirloom motifs", "Palace & haveli venues"],
    tags: ["traditional", "ornate", "heirloom", "ceremonial", "grand"],
    slug: "heritage-house-decor",
  },
  // ── Music & DJ ──
  {
    id: "vm-music-brass-and-bloom",
    name: "Brass & Bloom",
    category: "Music & DJ",
    city: "Mumbai",
    tagline: "Live wedding band — brass, percussion, full floor.",
    specialties: ["Live band", "Bollywood + jazz crossover"],
    tags: ["live-band", "high-energy", "brass", "dance"],
    slug: "brass-and-bloom",
  },
  {
    id: "vm-music-dj-amaani",
    name: "DJ Amaani",
    category: "Music & DJ",
    city: "Delhi",
    tagline: "Bollywood across every era, read like a DJ should.",
    specialties: ["Open-format DJ", "Garba & sangeet sets"],
    tags: ["dj", "bollywood", "high-energy", "popular"],
    slug: "dj-amaani",
  },
  {
    id: "vm-music-rasa",
    name: "Rasa Ensemble",
    category: "Music & DJ",
    city: "Chennai",
    tagline: "Sitar, tabla, and quiet awe — for the rituals.",
    specialties: ["Classical ensemble", "Ceremony & cocktail"],
    tags: ["acoustic", "intimate", "classical", "soft", "traditional"],
    slug: "rasa-ensemble",
  },
  {
    id: "vm-music-kala-collective",
    name: "Kala Collective",
    category: "Music & DJ",
    city: "Bangalore",
    tagline: "Live + DJ hybrid — they read the room all night.",
    specialties: ["Live + DJ hybrid", "Multi-day weddings"],
    tags: ["mix", "versatile", "dj", "live-band", "high-energy"],
    slug: "kala-collective",
  },
  // ── Catering ──
  {
    id: "vm-cater-table-by-shri",
    name: "Table by Shri",
    category: "Catering",
    city: "Mumbai",
    tagline: "Plated tasting menus with regional Indian roots.",
    specialties: ["Plated fine-dining", "Wine pairings"],
    tags: ["plated", "fine-dining", "formal", "grand"],
    slug: "table-by-shri",
  },
  {
    id: "vm-cater-the-banyan",
    name: "The Banyan Kitchen",
    category: "Catering",
    city: "Pune",
    tagline: "Family-style platters — abundance without pretension.",
    specialties: ["Family-style sharing", "Vegetarian-forward"],
    tags: ["family-style", "sharing", "warm", "intimate"],
    slug: "the-banyan-kitchen",
  },
  {
    id: "vm-cater-chaat-cart",
    name: "The Chaat Cart Co.",
    category: "Catering",
    city: "Delhi",
    tagline: "Live stations, street food theatre.",
    specialties: ["Live stations", "Chaat, kebabs, dosas"],
    tags: ["live-stations", "street-food", "interactive", "casual", "vibrant"],
    slug: "chaat-cart-co",
  },
  {
    id: "vm-cater-thali-house",
    name: "Thali House",
    category: "Catering",
    city: "Ahmedabad",
    tagline: "Banana-leaf thali service done with full ritual care.",
    specialties: ["Traditional thali", "Gujarati & South Indian"],
    tags: ["thali", "traditional", "ritual", "regional", "ceremonial"],
    slug: "thali-house",
  },
];

export const MATCH_CATEGORIES: VendorMatchCategory[] = [
  "Photography",
  "Décor & Florals",
  "Music & DJ",
  "Catering",
];
