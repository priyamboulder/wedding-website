// Layout templates for the Album Editor.
//
// Each layout describes slot positions in 0..1 normalised coordinates that
// span the ENTIRE spread (both pages). { x: 0, w: 0.5 } covers the left page;
// { x: 0.5, w: 0.5 } covers the right. This lets layouts cleanly express
// full-bleed, hero-on-one-side, asymmetric, and cross-spine designs without
// any per-page mirroring logic.
//
// 25 templates organised across five categories — 1 photo, 2 photo, 3 photo,
// 4+ photo, and text. The LayoutPicker filters by category.

import type {
  LayoutTemplate,
  AlbumSizeMeta,
  AlbumCoverMeta,
  AlbumPaperMeta,
  LayoutCategory,
} from "@/types/album";

// Tiny gutter used between adjacent photos to let the print breathe. Kept
// small because Artifact-Uprising-style albums favour edge-to-edge images.
const G = 0.01;   // 1% spread-width gutter between side-by-side photos
const GY = 0.015; // 1.5% spread-height gutter between stacked photos

export const LAYOUT_TEMPLATES: LayoutTemplate[] = [
  // ── 1 photo ───────────────────────────────────────────────────────────────
  {
    id: "full-bleed",
    name: "Full bleed",
    description: "One photo, edge to edge across both pages",
    category: "1-photo",
    frames: [{ x: 0, y: 0, w: 1, h: 1 }],
    recommendedFor: ["landscape"],
  },
  {
    id: "centered",
    name: "Centered",
    description: "Single photo with generous margins — feels matted",
    category: "1-photo",
    frames: [{ x: 0.18, y: 0.14, w: 0.64, h: 0.72 }],
    recommendedFor: ["square", "portrait"],
  },
  {
    id: "centered-caption",
    name: "Centered + caption",
    description: "Single photo with a line of text below",
    category: "1-photo",
    frames: [{ x: 0.2, y: 0.1, w: 0.6, h: 0.66 }],
    textFrames: [{ x: 0.2, y: 0.8, w: 0.6, h: 0.1 }],
  },
  {
    id: "hero-left",
    name: "Left page hero",
    description: "Photo fills the left page, right page breathes",
    category: "1-photo",
    frames: [{ x: 0, y: 0, w: 0.5, h: 1 }],
    recommendedFor: ["portrait"],
  },
  {
    id: "hero-right",
    name: "Right page hero",
    description: "Photo fills the right page, left page breathes",
    category: "1-photo",
    frames: [{ x: 0.5, y: 0, w: 0.5, h: 1 }],
    recommendedFor: ["portrait"],
  },

  // ── 2 photos ──────────────────────────────────────────────────────────────
  {
    id: "two-up-vertical",
    name: "Two side by side",
    description: "Two photos split 50/50 with a small gutter",
    category: "2-photo",
    frames: [
      { x: 0, y: 0, w: 0.5 - G / 2, h: 1 },
      { x: 0.5 + G / 2, y: 0, w: 0.5 - G / 2, h: 1 },
    ],
    recommendedFor: ["portrait"],
  },
  {
    id: "two-side-full",
    name: "Two side by side, full bleed",
    description: "Two photos 50/50 with no gutter",
    category: "2-photo",
    frames: [
      { x: 0, y: 0, w: 0.5, h: 1 },
      { x: 0.5, y: 0, w: 0.5, h: 1 },
    ],
    recommendedFor: ["portrait"],
  },
  {
    id: "two-up-horizontal",
    name: "Two stacked",
    description: "Two wide photos top & bottom across the spread",
    category: "2-photo",
    frames: [
      { x: 0.04, y: 0.05, w: 0.92, h: 0.45 - GY / 2 },
      { x: 0.04, y: 0.5 + GY / 2, w: 0.92, h: 0.45 - GY / 2 },
    ],
    recommendedFor: ["landscape"],
  },
  {
    id: "one-big-one-small",
    name: "One large, one small",
    description: "70/30 split — lead with the hero photo",
    category: "2-photo",
    frames: [
      { x: 0, y: 0, w: 0.7 - G / 2, h: 1 },
      { x: 0.7 + G / 2, y: 0.2, w: 0.3 - G / 2, h: 0.6 },
    ],
  },
  {
    id: "offset-pair",
    name: "Offset pair",
    description: "Two photos with editorial asymmetry",
    category: "2-photo",
    frames: [
      { x: 0.06, y: 0.06, w: 0.42, h: 0.7 },
      { x: 0.52, y: 0.24, w: 0.42, h: 0.7 },
    ],
  },

  // ── 3 photos ──────────────────────────────────────────────────────────────
  {
    id: "hero-plus-two",
    name: "Hero + two",
    description: "Big hero on the left, two stacked on the right",
    category: "3-photo",
    frames: [
      { x: 0, y: 0, w: 0.6 - G / 2, h: 1 },
      { x: 0.6 + G / 2, y: 0, w: 0.4 - G / 2, h: 0.5 - GY / 2 },
      { x: 0.6 + G / 2, y: 0.5 + GY / 2, w: 0.4 - G / 2, h: 0.5 - GY / 2 },
    ],
  },
  {
    id: "three-strip",
    name: "Three vertical strips",
    description: "Triptych — three equal columns",
    category: "3-photo",
    frames: [
      { x: 0, y: 0.05, w: 1 / 3 - G, h: 0.9 },
      { x: 1 / 3 + G / 2, y: 0.05, w: 1 / 3 - G, h: 0.9 },
      { x: 2 / 3 + G / 2, y: 0.05, w: 1 / 3 - G, h: 0.9 },
    ],
    recommendedFor: ["portrait"],
  },
  {
    id: "three-horizontal",
    name: "Three horizontal strips",
    description: "Three equal rows stacked vertically",
    category: "3-photo",
    frames: [
      { x: 0.04, y: 0, w: 0.92, h: 1 / 3 - GY },
      { x: 0.04, y: 1 / 3 + GY / 2, w: 0.92, h: 1 / 3 - GY },
      { x: 0.04, y: 2 / 3 + GY / 2, w: 0.92, h: 1 / 3 - GY },
    ],
    recommendedFor: ["landscape"],
  },
  {
    id: "hero-top-two-bottom",
    name: "Hero top + two",
    description: "Wide hero across the top, two side-by-side below",
    category: "3-photo",
    frames: [
      { x: 0, y: 0, w: 1, h: 0.6 - GY / 2 },
      { x: 0, y: 0.6 + GY / 2, w: 0.5 - G / 2, h: 0.4 - GY / 2 },
      { x: 0.5 + G / 2, y: 0.6 + GY / 2, w: 0.5 - G / 2, h: 0.4 - GY / 2 },
    ],
  },
  {
    id: "l-shape",
    name: "L-shape",
    description: "Tall photo left, wide top-right, square bottom-right",
    category: "3-photo",
    frames: [
      { x: 0, y: 0, w: 0.5 - G / 2, h: 1 },
      { x: 0.5 + G / 2, y: 0, w: 0.5 - G / 2, h: 0.55 - GY / 2 },
      { x: 0.5 + G / 2, y: 0.55 + GY / 2, w: 0.5 - G / 2, h: 0.45 - GY / 2 },
    ],
  },

  // ── 4+ photos ─────────────────────────────────────────────────────────────
  {
    id: "four-grid",
    name: "Four grid",
    description: "Clean 2×2 grid with small gutters",
    category: "4-photo",
    frames: [
      { x: 0.03, y: 0.04, w: 0.47 - G / 2, h: 0.46 - GY / 2 },
      { x: 0.5 + G / 2, y: 0.04, w: 0.47 - G / 2, h: 0.46 - GY / 2 },
      { x: 0.03, y: 0.5 + GY / 2, w: 0.47 - G / 2, h: 0.46 - GY / 2 },
      { x: 0.5 + G / 2, y: 0.5 + GY / 2, w: 0.47 - G / 2, h: 0.46 - GY / 2 },
    ],
  },
  {
    id: "four-grid-full",
    name: "Four grid, full bleed",
    description: "Four photos edge-to-edge, no gutters",
    category: "4-photo",
    frames: [
      { x: 0, y: 0, w: 0.5, h: 0.5 },
      { x: 0.5, y: 0, w: 0.5, h: 0.5 },
      { x: 0, y: 0.5, w: 0.5, h: 0.5 },
      { x: 0.5, y: 0.5, w: 0.5, h: 0.5 },
    ],
  },
  {
    id: "five-mosaic",
    name: "Five mosaic",
    description: "One hero surrounded by four supporting shots",
    category: "4-photo",
    frames: [
      { x: 0.22, y: 0.15, w: 0.56, h: 0.7 },
      { x: 0, y: 0, w: 0.2, h: 0.5 - GY / 2 },
      { x: 0, y: 0.5 + GY / 2, w: 0.2, h: 0.5 - GY / 2 },
      { x: 0.8, y: 0, w: 0.2, h: 0.5 - GY / 2 },
      { x: 0.8, y: 0.5 + GY / 2, w: 0.2, h: 0.5 - GY / 2 },
    ],
  },
  {
    id: "six-grid",
    name: "Six grid",
    description: "3×2 grid — perfect for contact-sheet pacing",
    category: "4-photo",
    frames: [
      { x: 0.03, y: 0.04, w: 1 / 3 - 0.03, h: 0.46 - GY / 2 },
      { x: 1 / 3 + 0.005, y: 0.04, w: 1 / 3 - 0.01, h: 0.46 - GY / 2 },
      { x: 2 / 3 - 0.005 + 0.01, y: 0.04, w: 1 / 3 - 0.03, h: 0.46 - GY / 2 },
      { x: 0.03, y: 0.5 + GY / 2, w: 1 / 3 - 0.03, h: 0.46 - GY / 2 },
      { x: 1 / 3 + 0.005, y: 0.5 + GY / 2, w: 1 / 3 - 0.01, h: 0.46 - GY / 2 },
      { x: 2 / 3 - 0.005 + 0.01, y: 0.5 + GY / 2, w: 1 / 3 - 0.03, h: 0.46 - GY / 2 },
    ],
  },
  {
    id: "polaroid-collage",
    name: "Polaroid collage",
    description: "Four photos with playful rotation, white borders",
    category: "4-photo",
    frames: [
      { x: 0.05, y: 0.1, w: 0.3, h: 0.42 },
      { x: 0.38, y: 0.06, w: 0.3, h: 0.42 },
      { x: 0.68, y: 0.14, w: 0.28, h: 0.4 },
      { x: 0.22, y: 0.52, w: 0.3, h: 0.42 },
    ],
    frameRotations: [-3, 2, -1, 3],
  },

  // ── Text ──────────────────────────────────────────────────────────────────
  {
    id: "photo-plus-caption",
    name: "Photo + caption (right)",
    description: "Photo on the left, text block on the right",
    category: "text",
    frames: [{ x: 0, y: 0, w: 0.6, h: 1 }],
    textFrames: [{ x: 0.64, y: 0.32, w: 0.3, h: 0.36 }],
  },
  {
    id: "photo-caption-left",
    name: "Photo + caption (left)",
    description: "Text block on the left, photo on the right",
    category: "text",
    frames: [{ x: 0.4, y: 0, w: 0.6, h: 1 }],
    textFrames: [{ x: 0.06, y: 0.32, w: 0.3, h: 0.36 }],
  },
  {
    id: "title-page",
    name: "Title page",
    description: "Text only — for album titles and chapter dividers",
    category: "text",
    frames: [],
    textFrames: [{ x: 0.18, y: 0.32, w: 0.64, h: 0.36 }],
    isTextOnly: true,
  },
  {
    id: "quote-page",
    name: "Quote page",
    description: "Centered quote with decorative space",
    category: "text",
    frames: [],
    textFrames: [{ x: 0.22, y: 0.38, w: 0.56, h: 0.24 }],
    isTextOnly: true,
  },
  {
    id: "timeline-page",
    name: "Timeline page",
    description: "Event-by-event timeline of the day",
    category: "text",
    frames: [],
    textFrames: [
      { x: 0.14, y: 0.15, w: 0.72, h: 0.09 },
      { x: 0.14, y: 0.29, w: 0.72, h: 0.09 },
      { x: 0.14, y: 0.43, w: 0.72, h: 0.09 },
      { x: 0.14, y: 0.57, w: 0.72, h: 0.09 },
      { x: 0.14, y: 0.71, w: 0.72, h: 0.09 },
    ],
    isTextOnly: true,
  },
];

export const LAYOUT_BY_ID: Record<string, LayoutTemplate> = Object.fromEntries(
  LAYOUT_TEMPLATES.map((l) => [l.id, l]),
);

export const LAYOUT_CATEGORIES: { id: LayoutCategory | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "1-photo", label: "1 photo" },
  { id: "2-photo", label: "2 photos" },
  { id: "3-photo", label: "3 photos" },
  { id: "4-photo", label: "4+ photos" },
  { id: "text", label: "Text" },
];

// Curated font set for inline text editing. IDs are CSS font-family strings so
// they render without a Google-Fonts round trip in the offline prototype; the
// labels are what users actually see in the font picker.
export const ALBUM_FONTS: { id: string; label: string; css: string }[] = [
  { id: "playfair", label: "Playfair Display", css: 'var(--font-serif), "Playfair Display", Georgia, serif' },
  { id: "cormorant", label: "Cormorant Garamond", css: '"Cormorant Garamond", Georgia, serif' },
  { id: "montserrat", label: "Montserrat Light", css: '"Montserrat", -apple-system, sans-serif' },
  { id: "lato", label: "Lato", css: '"Lato", Helvetica, sans-serif' },
  { id: "great-vibes", label: "Great Vibes (script)", css: '"Great Vibes", "Snell Roundhand", cursive' },
  { id: "oswald", label: "Oswald Light", css: '"Oswald", Impact, sans-serif' },
  { id: "caveat", label: "Caveat (handwritten)", css: '"Caveat", "Bradley Hand", cursive' },
  { id: "courier", label: "Courier Prime", css: '"Courier Prime", "Courier New", monospace' },
];

export const ALBUM_SIZES: AlbumSizeMeta[] = [
  { id: "6x6", label: '6×6" mini', orientation: "square", widthIn: 6, heightIn: 6, basePrice: 85, perTenPagesPrice: 18 },
  { id: "8x10", label: '8×10" landscape', orientation: "landscape", widthIn: 10, heightIn: 8, basePrice: 135, perTenPagesPrice: 24 },
  { id: "10x10", label: '10×10" square', orientation: "square", widthIn: 10, heightIn: 10, basePrice: 165, perTenPagesPrice: 28 },
  { id: "12x12", label: '12×12" grand', orientation: "square", widthIn: 12, heightIn: 12, basePrice: 225, perTenPagesPrice: 36 },
];

export const ALBUM_COVERS: AlbumCoverMeta[] = [
  {
    id: "hardcover-linen",
    label: "Hardcover linen",
    description: "Natural woven linen — warm and timeless",
    swatch: "linear-gradient(135deg, #E8DDC8 0%, #D4C4A8 100%)",
    priceDelta: 0,
  },
  {
    id: "leather",
    label: "Leather",
    description: "Supple full-grain, gold-stamped",
    swatch: "linear-gradient(135deg, #6B4423 0%, #3E2614 100%)",
    priceDelta: 60,
  },
  {
    id: "photo-wrap",
    label: "Photo wrap",
    description: "Your cover image printed edge-to-edge",
    swatch: "linear-gradient(135deg, #C97B63 0%, #DDA08A 50%, #F5E6C8 100%)",
    priceDelta: 20,
  },
  {
    id: "softcover",
    label: "Softcover",
    description: "Lightweight, flexible binding",
    swatch: "linear-gradient(135deg, #FBF9F4 0%, #EDE7D9 100%)",
    priceDelta: -30,
  },
];

export const ALBUM_PAPERS: AlbumPaperMeta[] = [
  { id: "matte", label: "Matte", description: "No glare, soft and editorial", sheen: "rgba(255,255,255,0)" },
  { id: "lustre", label: "Lustre", description: "Balanced finish, slight sheen", sheen: "rgba(255,255,255,0.05)" },
  { id: "glossy", label: "Glossy", description: "High-gloss, rich contrast", sheen: "rgba(255,255,255,0.18)" },
];

export const DEFAULT_PAGE_COUNT = 30;
export const MIN_PAGES = 20;
export const MAX_PAGES = 100;

// Picks a sensible default layout for N photos dragged onto an empty spread.
export function suggestLayout(photoCount: number): string {
  if (photoCount <= 0) return "title-page";
  if (photoCount === 1) return "full-bleed";
  if (photoCount === 2) return "two-up-vertical";
  if (photoCount === 3) return "hero-plus-two";
  if (photoCount === 4) return "four-grid";
  if (photoCount === 5) return "five-mosaic";
  return "six-grid";
}

// Pricing math shared by the setup modal, order summary, and cart.
export function priceFor(
  size: string,
  coverType: string,
  pageCount: number,
): { base: number; cover: number; pages: number; total: number } {
  const sizeMeta = ALBUM_SIZES.find((s) => s.id === size) ?? ALBUM_SIZES[0];
  const coverMeta = ALBUM_COVERS.find((c) => c.id === coverType) ?? ALBUM_COVERS[0];
  const base = sizeMeta.basePrice;
  const cover = coverMeta.priceDelta;
  const pages = Math.ceil(pageCount / 10) * sizeMeta.perTenPagesPrice;
  return { base, cover, pages, total: base + cover + pages };
}

// Layout suggestion aware of photo orientations (preferred by AI auto-layout).
export function suggestLayoutFor(orientations: ("portrait" | "landscape" | "square")[]): string {
  const count = orientations.length;
  if (count <= 0) return "title-page";
  const allLandscape = orientations.every((o) => o === "landscape");
  const allPortrait = orientations.every((o) => o === "portrait");
  if (count === 1) return allPortrait ? "hero-left" : "full-bleed";
  if (count === 2) return allLandscape ? "two-up-horizontal" : "two-up-vertical";
  if (count === 3) return allPortrait ? "three-strip" : allLandscape ? "three-horizontal" : "hero-plus-two";
  if (count === 4) return "four-grid";
  if (count === 5) return "five-mosaic";
  return "six-grid";
}
