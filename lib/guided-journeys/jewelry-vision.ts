// ── Jewelry Vision journey ────────────────────────────────────────────────
// First guided journey on the Jewelry workspace. Vision lives at
// journey_id = "default" (3 sessions, ~7 min):
//
//   1. jewelry_direction    — three-step direction picker (base metal →
//                             style family → weight & vibe), 19-chip style
//                             keyword set, sourcing intent, budget priority.
//   2. jewelry_inspiration  — moodboard with piece-type tagging, per-event
//                             reference gallery with bride/groom/both
//                             filtering, celebrity inspiration, expression
//                             wishlist, outfit pairing anchors.
//   3. jewelry_brief        — couple-approved AI-drafted brief, insurance
//                             flag, total estimated value range.
//
// Operational sourcing decisions (per-piece inventory, custody, fittings)
// have moved into the Build journey — see jewelry-build.ts.

import type { CategoryKey } from "@/lib/guided-journey/types";

export const JEWELRY_VISION_JOURNEY_ID = "default";
export const JEWELRY_VISION_CATEGORY: CategoryKey = "jewelry";

export type JewelryVisionSessionKey =
  | "jewelry_direction"
  | "jewelry_inspiration"
  | "jewelry_brief";

export interface JewelryVisionSessionDef {
  key: JewelryVisionSessionKey;
  index: number;
  title: string;
  subtitle: string;
  estimatedMinutes: number;
}

export const JEWELRY_VISION_SESSIONS: readonly JewelryVisionSessionDef[] = [
  {
    key: "jewelry_direction",
    index: 1,
    title: "Your jewelry direction",
    subtitle: "Metals, style families, weight & vibe — three steps to a clear direction.",
    estimatedMinutes: 3,
  },
  {
    key: "jewelry_inspiration",
    index: 2,
    title: "Inspiration & references",
    subtitle: "Moodboard, per-event references, celebrities you love, outfits you'll pair.",
    estimatedMinutes: 2,
  },
  {
    key: "jewelry_brief",
    index: 3,
    title: "Your jewelry brief",
    subtitle: "Your direction, ready to share with jewellers — with insurance framing.",
    estimatedMinutes: 2,
  },
] as const;

export const JEWELRY_VISION_TOTAL_MINUTES = JEWELRY_VISION_SESSIONS.reduce(
  (sum, s) => sum + s.estimatedMinutes,
  0,
);

// ── Direction picker (Session 1) ──────────────────────────────────────────
// The three-step picker: Step 1 (metals) loosely gates Step 2 (style
// families), Step 3 (weight & vibe) is independent.

export type BaseMetal = "gold" | "silver" | "diamond" | "platinum_white_gold";

export type StyleFamily =
  | "traditional_kundan_polki"
  | "temple"
  | "jadau_meenakari"
  | "modern_diamond"
  | "minimalist_delicate"
  | "fusion_indo_western"
  | "heirloom_revival";

export type WeightVibe =
  | "simple_delicate"
  | "heavy_statement"
  | "traditional_modern_twist"
  | "fully_traditional_heritage";

export const BASE_METAL_OPTIONS: ReadonlyArray<{
  value: BaseMetal;
  label: string;
  helper: string;
}> = [
  {
    value: "gold",
    label: "Gold",
    helper: "Yellow, rose, antique. The dominant tradition.",
  },
  {
    value: "silver",
    label: "Silver",
    helper: "Oxidised, filigree, temple silver.",
  },
  {
    value: "diamond",
    label: "Diamond",
    helper: "Solitaires, pavé, polki uncut.",
  },
  {
    value: "platinum_white_gold",
    label: "Platinum / white gold",
    helper: "Cool-tone modern setting for diamond or pearls.",
  },
];

export const STYLE_FAMILY_OPTIONS: ReadonlyArray<{
  value: StyleFamily;
  label: string;
  helper: string;
  /** Style families compatible with these metals. Empty = compatible with all. */
  metals: BaseMetal[];
}> = [
  {
    value: "traditional_kundan_polki",
    label: "Traditional kundan & polki",
    helper: "Uncut diamonds, foil-backed stones, gold mounts.",
    metals: ["gold"],
  },
  {
    value: "temple",
    label: "Temple",
    helper: "South-Indian goddess motifs, granulation, lakshmi coins.",
    metals: ["gold", "silver"],
  },
  {
    value: "jadau_meenakari",
    label: "Jadau & meenakari",
    helper: "Enamelled reverses, Mughal-era detailing.",
    metals: ["gold"],
  },
  {
    value: "modern_diamond",
    label: "Modern diamond",
    helper: "Solitaires, pavé, contemporary geometric settings.",
    metals: ["diamond", "platinum_white_gold"],
  },
  {
    value: "minimalist_delicate",
    label: "Minimalist & delicate",
    helper: "Single-line chains, small studs, layered fineness.",
    metals: ["gold", "diamond", "platinum_white_gold", "silver"],
  },
  {
    value: "fusion_indo_western",
    label: "Fusion · Indo-western",
    helper: "Unconventional silhouettes for reception and post-wedding looks.",
    metals: ["gold", "diamond", "platinum_white_gold"],
  },
  {
    value: "heirloom_revival",
    label: "Heirloom revival",
    helper: "Restyled antique pieces, period revivalism.",
    metals: ["gold", "silver"],
  },
];

export const WEIGHT_VIBE_OPTIONS: ReadonlyArray<{
  value: WeightVibe;
  label: string;
  helper: string;
}> = [
  {
    value: "simple_delicate",
    label: "Simple & delicate",
    helper: "Light, layerable, low-noise.",
  },
  {
    value: "heavy_statement",
    label: "Heavy statement",
    helper: "Hero pieces, bridal-portrait energy.",
  },
  {
    value: "traditional_modern_twist",
    label: "Traditional with a modern twist",
    helper: "Heritage forms reworked in contemporary settings.",
  },
  {
    value: "fully_traditional_heritage",
    label: "Fully traditional heritage",
    helper: "No compromises — old-school silhouettes, regal weight.",
  },
];

// ── 19-chip style keyword set ─────────────────────────────────────────────
// The full keyword set Tab 1 displays. Couples select multiple. AI brief
// drafting reads style_keywords + direction.* together.

export const STYLE_KEYWORDS: readonly string[] = [
  "kundan",
  "polki",
  "temple",
  "jadau",
  "diamond",
  "minimalist",
  "statement",
  "vintage",
  "layered",
  "delicate",
  "uncut_diamond",
  "pearl",
  "meenakari",
  "antique_gold",
  "rose_gold",
  "platinum",
  "fusion",
  "contemporary",
  "rani_haar",
  "choker_forward",
] as const;

// ── Form data shapes ──────────────────────────────────────────────────────

export interface JewelryDirectionFormData {
  style_keywords: string[];
  style_keywords_custom?: string[];
  direction: {
    base_metals: BaseMetal[];
    style_families: StyleFamily[];
    weight_vibe?: WeightVibe;
  };
  budget_priority?: "invest_in_few" | "variety_across_events" | "minimal_spend";
  sourcing_mix: {
    new_purchases: boolean;
    family_heirlooms: boolean;
    rentals: boolean;
    custom_designed: boolean;
  };
}

export type PieceTypeTag =
  | "necklace"
  | "earrings"
  | "maang_tikka"
  | "haath_phool"
  | "nath"
  | "bangles"
  | "rings"
  | "groom"
  | "all";

export type EventKey =
  | "haldi"
  | "mehendi"
  | "sangeet"
  | "wedding"
  | "reception";

export type AudienceFilter = "bride" | "groom" | "both";

export type Reaction = "love" | "not_for_us" | "no_reaction";

export interface MoodboardPin {
  id: string;
  url: string;
  source: "upload" | "url";
  piece_type_tag: PieceTypeTag;
  note?: string;
}

export interface PerEventReference {
  event: EventKey;
  audience_filter: AudienceFilter;
  images: Array<{
    id: string;
    url: string;
    source: "suggested" | "upload";
    reaction: Reaction;
  }>;
}

export interface CelebrityInspiration {
  id: string;
  celebrity_name?: string;
  image_url: string;
  reaction: Reaction;
  auto_tagged_keywords: string[];
}

export interface ExpressionWishlistItem {
  id: string;
  moment: string;
}

export interface OutfitPairingAnchor {
  person: "bride" | "groom";
  event: EventKey;
  outfit_image_url?: string;
  intent_note?: string;
}

export interface JewelryInspirationFormData {
  moodboard_pins: MoodboardPin[];
  per_event_references: PerEventReference[];
  celebrity_inspiration: CelebrityInspiration[];
  expression_wishlist: ExpressionWishlistItem[];
  outfit_pairing_anchors: OutfitPairingAnchor[];
}

export interface JewelryBriefFormData {
  brief_text: string;
  is_ai_generated: boolean;
  last_refined_at?: string;
  couple_approved: boolean;
  insurance_needed: boolean;
  total_estimated_value_range?: { low: number; high: number };
}

// ── Backfill mapping (used by the SQL migration as documentation) ─────────

export const METAL_BACKFILL: Record<string, BaseMetal> = {
  gold: "gold",
  silver: "silver",
  platinum: "platinum_white_gold",
  rose_gold: "gold",
};

export const STYLE_FAMILY_BACKFILL: Record<string, StyleFamily> = {
  traditional_kundan: "traditional_kundan_polki",
  polki: "traditional_kundan_polki",
  kundan: "traditional_kundan_polki",
  temple: "temple",
  jadau: "jadau_meenakari",
  meenakari: "jadau_meenakari",
  diamond: "modern_diamond",
  contemporary: "modern_diamond",
  minimalist: "minimalist_delicate",
  statement: "heirloom_revival",
  pearl: "minimalist_delicate",
};

export const STYLE_FAMILY_DEFAULT_WEIGHT_VIBE: WeightVibe =
  "traditional_modern_twist";
