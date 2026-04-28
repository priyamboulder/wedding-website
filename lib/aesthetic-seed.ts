// ── Aesthetic Studio seed data ──────────────────────────────────────────────
// Seed the demo wedding with a realistic mid-exploration state: a handful of
// unassigned images on the inspiration wall, plus two competing directions
// with synthesized (but not locked) aesthetics. Gives reviewers something to
// compare, lock, and amend on first load.
//
// Images use gradient-tile placeholders derived from each image's palette.
// storage_url is always null in seed; the UI renders a palette-gradient tile
// when storage_url is absent, which keeps the demo self-contained.

import type {
  InspirationImage,
  AestheticDirection,
  PaletteSwatch,
} from "@/types/aesthetic";

// ── Shared palettes ─────────────────────────────────────────────────────────

const COURTYARD_PALETTE: PaletteSwatch[] = [
  { hex: "#D88A5B", name: "dusk saffron" },
  { hex: "#8F3A2C", name: "pomegranate" },
  { hex: "#C7A676", name: "aged brass" },
  { hex: "#F1E4CF", name: "candle bone" },
  { hex: "#3A2420", name: "courtyard ink" },
];

const GARDEN_PALETTE: PaletteSwatch[] = [
  { hex: "#F5F1EA", name: "bone" },
  { hex: "#E8D9C3", name: "raw silk" },
  { hex: "#C6B89B", name: "dried wheat" },
  { hex: "#8A9A7B", name: "olive shade" },
  { hex: "#2E2E2A", name: "garden ink" },
];

const FALLBACK_UNASSIGNED_PALETTE: PaletteSwatch[] = [
  { hex: "#E3C9A8", name: "parchment" },
  { hex: "#A8856E", name: "tobacco" },
  { hex: "#4E3B2E", name: "walnut" },
  { hex: "#F4EBDC", name: "cream" },
];

// ── Inspiration images ──────────────────────────────────────────────────────

const now = "2026-04-15T14:00:00.000Z";

const unassignedImages: InspirationImage[] = [
  {
    id: "img-unassigned-1",
    source_url: "https://pinterest.com/pin/placeholder-hanging-amaranthus",
    source_type: "pinterest_pin",
    storage_url: null,
    content_hash: "seed-hash-1",
    tag_status: "ready",
    ai_tags: {
      palette: FALLBACK_UNASSIGNED_PALETTE,
      textures: ["hanging floral", "raw silk", "linen"],
      mood: ["lush", "cascading"],
      scale: "grand",
      elements: ["hanging amaranthus", "taper candles"],
      cultural_cues: [],
    },
    user_notes: "",
    direction_id: null,
    position: 0,
    created_at: now,
  },
  {
    id: "img-unassigned-2",
    source_url: "https://instagram.com/p/placeholder-brass-urn",
    source_type: "instagram_post",
    storage_url: null,
    content_hash: "seed-hash-2",
    tag_status: "ready",
    ai_tags: {
      palette: [
        { hex: "#C7A676", name: "aged brass" },
        { hex: "#3A2420", name: "deep ink" },
        { hex: "#F1E4CF", name: "candle bone" },
      ],
      textures: ["brass", "velvet"],
      mood: ["intimate", "rich"],
      scale: "intimate",
      elements: ["brass urns", "pillar candles"],
      cultural_cues: ["Rajasthani palette"],
    },
    user_notes: "Love the urn shape.",
    direction_id: null,
    position: 1,
    created_at: now,
  },
  {
    id: "img-unassigned-3",
    source_url: "https://pinterest.com/pin/placeholder-bud-vases-white",
    source_type: "pinterest_pin",
    storage_url: null,
    content_hash: "seed-hash-3",
    tag_status: "ready",
    ai_tags: {
      palette: [
        { hex: "#F5F1EA", name: "bone" },
        { hex: "#E8D9C3", name: "raw silk" },
        { hex: "#8A9A7B", name: "olive shade" },
      ],
      textures: ["matte ceramic", "bud vase cluster"],
      mood: ["quiet", "garden"],
      elements: ["bud vases", "single-stem florals", "taper candles"],
      cultural_cues: [],
    },
    user_notes: "",
    direction_id: null,
    position: 2,
    created_at: now,
  },
];

// ── Courtyard direction images ──────────────────────────────────────────────

const courtyardImages: InspirationImage[] = Array.from({ length: 6 }).map(
  (_, i) => ({
    id: `img-courtyard-${i + 1}`,
    source_url: `https://pinterest.com/pin/placeholder-courtyard-${i + 1}`,
    source_type: "pinterest_pin" as const,
    storage_url: null,
    content_hash: `seed-courtyard-${i}`,
    tag_status: "ready" as const,
    ai_tags: {
      palette: COURTYARD_PALETTE,
      textures: ["brass", "hand-blocked textile", "unglazed terracotta"],
      mood: ["warm", "candlelit", "rich"],
      scale: i % 2 === 0 ? "intimate" : "grand",
      elements: [
        "brass lanterns",
        "low floral",
        "pomegranate accents",
        "taper candles",
      ],
      cultural_cues: ["Rajasthani color story", "haveli architecture"],
    },
    user_notes: "",
    direction_id: "dir-courtyard",
    position: i,
    created_at: now,
  }),
);

const gardenImages: InspirationImage[] = Array.from({ length: 5 }).map(
  (_, i) => ({
    id: `img-garden-${i + 1}`,
    source_url: `https://pinterest.com/pin/placeholder-garden-${i + 1}`,
    source_type: "pinterest_pin" as const,
    storage_url: null,
    content_hash: `seed-garden-${i}`,
    tag_status: "ready" as const,
    ai_tags: {
      palette: GARDEN_PALETTE,
      textures: ["matte ceramic", "raw silk", "dried grass"],
      mood: ["quiet", "garden", "candlelit"],
      scale: "intimate",
      elements: [
        "bud vases",
        "taper candles",
        "single-stem florals",
        "muslin runners",
      ],
      cultural_cues: [],
    },
    user_notes: "",
    direction_id: "dir-garden",
    position: i,
    created_at: now,
  }),
);

export const SEED_INSPIRATION_IMAGES: InspirationImage[] = [
  ...unassignedImages,
  ...courtyardImages,
  ...gardenImages,
];

// ── Directions ──────────────────────────────────────────────────────────────

export const SEED_DIRECTIONS: AestheticDirection[] = [
  {
    id: "dir-courtyard",
    name: "Dusk in a Jaipur courtyard",
    description: "Warm, candlelit, Rajasthani color story without literal motifs.",
    synthesis: {
      manifesto:
        "This direction sits at dusk — the moment the call to evening begins and lanterns are lit. The palette is earthen and warm, drawn from haveli walls and brass rather than saturated ballroom colors. It is rich but not busy: textures do the work, not density. It is not modern minimalism, and it is not a literal Rajasthani mela — it nods to place through color and material, not motif.",
      palette_primary: COURTYARD_PALETTE.slice(0, 3),
      palette_secondary: COURTYARD_PALETTE.slice(3),
      textures: [
        "brass",
        "unglazed terracotta",
        "hand-blocked cotton",
        "raw silk",
        "wax",
      ],
      mood_tags: ["warm", "candlelit", "rich", "intimate-at-scale"],
      implied_moves: [
        "Low mixed floral centerpieces with pomegranate accents",
        "Brass lanterns and pillar candles on every table",
        "Hand-blocked cotton runners, no chargers",
        "Warm uplight only on architecture, not tables",
        "Ceremony mandap in aged brass, no white drape",
      ],
      synthesized_at: "2026-04-14T20:12:00.000Z",
      image_set_hash: "seed-courtyard-v1",
    },
    is_locked: false,
    locked_at: null,
    locked_by: null,
    created_at: "2026-04-10T10:00:00.000Z",
    updated_at: "2026-04-14T20:12:00.000Z",
  },
  {
    id: "dir-garden",
    name: "Quiet garden, all white, candlelight",
    description: "Restrained, pale, almost monastic — let candlelight be the color.",
    synthesis: {
      manifesto:
        "This direction is about restraint. The room reads pale and quiet; the candlelight is the warmth. It is garden, not greenhouse — dried elements welcome, tropical foliage not. It is not ballroom, not maximalist, and not literal-white-wedding — the bone and raw-silk tones keep it warm rather than cold.",
      palette_primary: GARDEN_PALETTE.slice(0, 3),
      palette_secondary: GARDEN_PALETTE.slice(3),
      textures: [
        "matte ceramic",
        "raw silk",
        "muslin",
        "dried grass",
        "wax",
      ],
      mood_tags: ["quiet", "garden", "candlelit", "restrained"],
      implied_moves: [
        "Bud vase clusters with single-stem florals — no arrangements",
        "Taper candles only, no pillars",
        "Muslin runners, matte ceramic chargers",
        "No uplighting; candlelight is the only warmth",
        "Ceremony backdrop in dried grass and muslin",
      ],
      synthesized_at: "2026-04-14T20:15:00.000Z",
      image_set_hash: "seed-garden-v1",
    },
    is_locked: false,
    locked_at: null,
    locked_by: null,
    created_at: "2026-04-11T10:00:00.000Z",
    updated_at: "2026-04-14T20:15:00.000Z",
  },
];
