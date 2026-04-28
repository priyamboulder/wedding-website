// Category tagging for guests. Categories are owned by the
// `guest-categories` store (Zustand + localStorage); this file exposes the
// canonical color palette and the first-run defaults.
//
// Guests reference categories by *name* in `guest.categories: string[]`.
// When a category is renamed the page layer walks guests and rewrites the
// tag; when it is deleted, it is stripped from every guest.

export type GuestCategoryColor =
  | "coral"
  | "sage"
  | "amber"
  | "dusty_blue"
  | "plum"
  | "teal"
  | "terracotta"
  | "lavender"
  | "forest"
  | "burnt_orange"
  | "slate"
  | "gold";

export interface GuestCategoryColorSwatch {
  id: GuestCategoryColor;
  label: string;
  dot: string; // background color (for the small circle)
  pillBg: string; // soft background for pills
  pillBorder: string; // border for pills
  pillText: string; // text color inside pills
}

export const GUEST_CATEGORY_COLORS: GuestCategoryColorSwatch[] = [
  {
    id: "coral",
    label: "Coral",
    dot: "#E8907A",
    pillBg: "rgba(232, 144, 122, 0.14)",
    pillBorder: "rgba(232, 144, 122, 0.35)",
    pillText: "#B15A45",
  },
  {
    id: "sage",
    label: "Sage",
    dot: "#9CAF88",
    pillBg: "rgba(156, 175, 136, 0.18)",
    pillBorder: "rgba(156, 175, 136, 0.40)",
    pillText: "#5F7A4F",
  },
  {
    id: "amber",
    label: "Amber",
    dot: "#D4A24C",
    pillBg: "rgba(212, 162, 76, 0.16)",
    pillBorder: "rgba(212, 162, 76, 0.40)",
    pillText: "#8C6B2E",
  },
  {
    id: "dusty_blue",
    label: "Dusty blue",
    dot: "#8BA5B8",
    pillBg: "rgba(139, 165, 184, 0.16)",
    pillBorder: "rgba(139, 165, 184, 0.40)",
    pillText: "#4E6A7D",
  },
  {
    id: "plum",
    label: "Plum",
    dot: "#8E6B8A",
    pillBg: "rgba(142, 107, 138, 0.16)",
    pillBorder: "rgba(142, 107, 138, 0.36)",
    pillText: "#5E4459",
  },
  {
    id: "teal",
    label: "Teal",
    dot: "#5B8E8A",
    pillBg: "rgba(91, 142, 138, 0.16)",
    pillBorder: "rgba(91, 142, 138, 0.40)",
    pillText: "#3D6360",
  },
  {
    id: "terracotta",
    label: "Terracotta",
    dot: "#C4725D",
    pillBg: "rgba(196, 114, 93, 0.14)",
    pillBorder: "rgba(196, 114, 93, 0.36)",
    pillText: "#914A39",
  },
  {
    id: "lavender",
    label: "Lavender",
    dot: "#A89BB6",
    pillBg: "rgba(168, 155, 182, 0.18)",
    pillBorder: "rgba(168, 155, 182, 0.42)",
    pillText: "#6B5E80",
  },
  {
    id: "forest",
    label: "Forest",
    dot: "#5E7A5A",
    pillBg: "rgba(94, 122, 90, 0.14)",
    pillBorder: "rgba(94, 122, 90, 0.36)",
    pillText: "#3E5A3B",
  },
  {
    id: "burnt_orange",
    label: "Burnt orange",
    dot: "#C96941",
    pillBg: "rgba(201, 105, 65, 0.14)",
    pillBorder: "rgba(201, 105, 65, 0.36)",
    pillText: "#904626",
  },
  {
    id: "slate",
    label: "Slate",
    dot: "#7A7F87",
    pillBg: "rgba(122, 127, 135, 0.14)",
    pillBorder: "rgba(122, 127, 135, 0.34)",
    pillText: "#4F535B",
  },
  {
    id: "gold",
    label: "Gold",
    dot: "#B8860B",
    pillBg: "rgba(184, 134, 11, 0.12)",
    pillBorder: "rgba(184, 134, 11, 0.36)",
    pillText: "#7A5A07",
  },
];

export const GUEST_CATEGORY_COLOR_MAP: Record<
  GuestCategoryColor,
  GuestCategoryColorSwatch
> = Object.fromEntries(GUEST_CATEGORY_COLORS.map((c) => [c.id, c])) as Record<
  GuestCategoryColor,
  GuestCategoryColorSwatch
>;

export function swatchFor(
  color: GuestCategoryColor | undefined,
): GuestCategoryColorSwatch {
  if (color && GUEST_CATEGORY_COLOR_MAP[color]) {
    return GUEST_CATEGORY_COLOR_MAP[color];
  }
  return GUEST_CATEGORY_COLOR_MAP.slate;
}

export interface GuestCategorySeed {
  name: string;
  color: GuestCategoryColor;
}

// First-run defaults. Order matches how planners typically think about the
// list top-down (both sides of family first, then wedding party, then
// outer circles). Colors are distributed so neighboring rows in the
// manager read as distinct dots.
export const DEFAULT_GUEST_CATEGORIES: GuestCategorySeed[] = [
  { name: "Bride's Immediate Family", color: "coral" },
  { name: "Bride's Extended Family", color: "terracotta" },
  { name: "Groom's Immediate Family", color: "sage" },
  { name: "Groom's Extended Family", color: "forest" },
  { name: "Bridesmaids / Bride's Squad", color: "plum" },
  { name: "Groomsmen / Groom's Squad", color: "teal" },
  { name: "Parents' Friends (Bride Side)", color: "dusty_blue" },
  { name: "Parents' Friends (Groom Side)", color: "lavender" },
  { name: "College Friends", color: "amber" },
  { name: "School Friends", color: "burnt_orange" },
  { name: "Work Colleagues", color: "slate" },
  { name: "NRI Guests", color: "teal" },
  { name: "VIP / Elders", color: "gold" },
  { name: "Kids", color: "coral" },
  { name: "Performers", color: "plum" },
];
