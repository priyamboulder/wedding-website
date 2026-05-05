// ── Cultural-default palettes per wedding event ────────────────────────────
// Pre-seeded swatches used wherever a "starting" palette per event is helpful:
//   • Wardrobe Vision Session 1 (palette_by_event)
//   • Wardrobe Vision tab "Reset to defaults" CTA
//   • Décor / Stationery — when those grow per-event palette flows, they pull
//     from here too.
//
// These aren't proscriptive — every couple overrides them. They're starting
// points that match the cultural shorthand families already use:
//   Haldi    → marigold yellows, ivory accents
//   Mehendi  → sage / jade greens, warm cream
//   Sangeet  → fuchsia / blush pinks
//   Wedding  → crimson red, deep maroon, gold
//   Reception → blush / champagne / soft gold

export type WardrobeEventKey =
  | "haldi"
  | "mehendi"
  | "sangeet"
  | "wedding"
  | "reception";

export interface PaletteSwatch {
  /** Hex with leading #, uppercase. */
  hex: string;
  /** Optional human-readable name surfaced in tooltips. */
  label?: string;
}

export const EVENT_PALETTE_DEFAULTS: Record<WardrobeEventKey, PaletteSwatch[]> = {
  haldi: [
    { hex: "#F6D36B", label: "marigold gold" },
    { hex: "#E8B64A", label: "saffron" },
    { hex: "#FFFDF7", label: "ivory" },
  ],
  mehendi: [
    { hex: "#9CAF88", label: "sage" },
    { hex: "#C9D6A7", label: "jade pale" },
    { hex: "#F5E6D3", label: "warm cream" },
  ],
  sangeet: [
    { hex: "#C94088", label: "fuchsia" },
    { hex: "#E05A9F", label: "rose pink" },
    { hex: "#F7C8DC", label: "blush" },
  ],
  wedding: [
    { hex: "#B91C1C", label: "crimson red" },
    { hex: "#7F1D1D", label: "deep maroon" },
    { hex: "#D4A853", label: "wedding gold" },
  ],
  reception: [
    { hex: "#F5E0D6", label: "blush" },
    { hex: "#D4A853", label: "champagne" },
    { hex: "#F5E6D3", label: "soft cream" },
  ],
};

/** Title-case label corresponding to each event key. */
export const EVENT_LABEL: Record<WardrobeEventKey, string> = {
  haldi: "Haldi",
  mehendi: "Mehendi",
  sangeet: "Sangeet",
  wedding: "Wedding",
  reception: "Reception",
};

export const WARDROBE_EVENT_KEYS: WardrobeEventKey[] = [
  "haldi",
  "mehendi",
  "sangeet",
  "wedding",
  "reception",
];

/** Returns a fresh deep-copy of the defaults so callers can mutate freely. */
export function getDefaultPaletteByEvent(): Array<{
  event: WardrobeEventKey;
  swatches: PaletteSwatch[];
}> {
  return WARDROBE_EVENT_KEYS.map((event) => ({
    event,
    swatches: EVENT_PALETTE_DEFAULTS[event].map((s) => ({ ...s })),
  }));
}

/**
 * Loose mapping from the legacy wardrobe `colour_families[]` chip set to a
 * concrete event/swatch placement. Used by the Vision migration to backfill
 * `palette_by_event` from existing data.
 */
export const COLOUR_FAMILY_TO_EVENT_HEX: Record<
  string,
  { event: WardrobeEventKey; hex: string; label: string }[]
> = {
  red_maroon: [
    { event: "wedding", hex: "#B91C1C", label: "crimson red" },
    { event: "wedding", hex: "#7F1D1D", label: "deep maroon" },
  ],
  pink_blush: [
    { event: "sangeet", hex: "#F7C8DC", label: "blush" },
    { event: "reception", hex: "#F5E0D6", label: "blush" },
  ],
  gold_champagne: [
    { event: "reception", hex: "#D4A853", label: "champagne" },
    { event: "wedding", hex: "#D4A853", label: "wedding gold" },
  ],
  pastels: [{ event: "haldi", hex: "#FFFDF7", label: "ivory" }],
  jewel_tones: [
    { event: "sangeet", hex: "#C94088", label: "fuchsia" },
    { event: "wedding", hex: "#7F1D1D", label: "deep maroon" },
  ],
  ivory_white: [{ event: "wedding", hex: "#F5E6D3", label: "ivory" }],
  sage: [{ event: "mehendi", hex: "#9CAF88", label: "sage" }],
  navy: [{ event: "reception", hex: "#1E2A47", label: "navy" }],
};
