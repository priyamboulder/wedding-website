// Mock roster data for the planner's personal vendor directory.
// Today is pinned to 2026-10-03 (same as planner dashboard seed) so the
// "last worked" dates read consistently across the demo.

import { UPCOMING_WEDDINGS } from "@/lib/planner/seed";

export type RosterCategoryKey =
  | "photography"
  | "decor"
  | "hmua"
  | "catering"
  | "dj"
  | "entertainment"
  | "mehndi"
  | "priest"
  | "choreography"
  | "lighting"
  | "stationery"
  | "transportation"
  | "photoBooth"
  | "videography"
  | "venue"
  | "wardrobe"
  | "jewelry"
  | "cake"
  | "travel"
  | "dhol"
  | "florist"
  | "rentals"
  | "bartending"
  | "officiants"
  | "eventStaff"
  | "signage"
  | "content"
  | "fireworks";

export type RosterCategory = {
  key: RosterCategoryKey;
  label: string;
  emoji: string;
  count: number;
  /** Which checklist/workspace category this maps to, when relevant. */
  recommendAs?: string;
};

// Counts sum to 142. Order is the display order on the page.
export const ROSTER_CATEGORIES: RosterCategory[] = [
  { key: "photography", label: "Photography", emoji: "📷", count: 12, recommendAs: "Photography" },
  { key: "decor", label: "Decor & Florals", emoji: "🎨", count: 8, recommendAs: "Decor" },
  { key: "hmua", label: "HMUA", emoji: "💄", count: 9, recommendAs: "HMUA" },
  { key: "catering", label: "Catering", emoji: "🍽", count: 6, recommendAs: "Catering" },
  { key: "dj", label: "DJ", emoji: "🎧", count: 5, recommendAs: "DJ" },
  { key: "entertainment", label: "Entertainment", emoji: "🎤", count: 4 },
  { key: "mehndi", label: "Mehndi", emoji: "🪷", count: 6, recommendAs: "Mehndi Artist" },
  { key: "priest", label: "Priest", emoji: "🕉", count: 2, recommendAs: "Priest" },
  { key: "choreography", label: "Choreography", emoji: "💃", count: 3, recommendAs: "Choreographer" },
  { key: "lighting", label: "Lighting", emoji: "💡", count: 4, recommendAs: "Lighting" },
  { key: "stationery", label: "Stationery", emoji: "✉", count: 3, recommendAs: "Stationery" },
  { key: "transportation", label: "Transportation", emoji: "🚐", count: 4, recommendAs: "Transportation" },
  { key: "photoBooth", label: "Photo Booth", emoji: "📸", count: 3, recommendAs: "Photo Booth" },
  { key: "videography", label: "Videography", emoji: "🎬", count: 8, recommendAs: "Videography" },
  { key: "venue", label: "Venue Partners", emoji: "🏛", count: 10 },
  { key: "wardrobe", label: "Wardrobe & Styling", emoji: "👗", count: 9 },
  { key: "jewelry", label: "Jewelry", emoji: "💎", count: 5 },
  { key: "cake", label: "Cake & Sweets", emoji: "🎂", count: 4, recommendAs: "Cake" },
  { key: "travel", label: "Travel & Accommodations", emoji: "🏨", count: 6 },
  { key: "dhol", label: "Dhol & Baraat", emoji: "🥁", count: 4, recommendAs: "Dhol" },
  { key: "florist", label: "Florist (Specialty)", emoji: "🌸", count: 5, recommendAs: "Florist" },
  { key: "rentals", label: "Rentals & Furniture", emoji: "🪑", count: 6 },
  { key: "bartending", label: "Bartending", emoji: "🍸", count: 3 },
  { key: "officiants", label: "Officiants (Civil / Inter-faith)", emoji: "📜", count: 2 },
  { key: "eventStaff", label: "Event Staff", emoji: "🤵", count: 4 },
  { key: "signage", label: "Signage & Calligraphy", emoji: "✍", count: 2 },
  { key: "content", label: "Content Creators (Reels)", emoji: "📱", count: 3 },
  { key: "fireworks", label: "Fireworks & Pyro", emoji: "🎆", count: 2 },
];

export const ROSTER_TOTAL = ROSTER_CATEGORIES.reduce((s, c) => s + c.count, 0);

export type WeddingOpening = {
  weddingId: string;
  couple: string;
  categoryLabel: string;
  status: "booked" | "open";
};

export type RosterVendor = {
  id: string;
  categoryKey: RosterCategoryKey;
  name: string;
  handle: string; // instagram handle for avatar/monogram fallback
  avatarMonogram: string;
  rating: number; // 1-5 stars
  location: string;
  collaborations: number;
  lastWorked: string; // display string
  priceRange: string;
  tags: string[];
  privateNote: string;
  openings: WeddingOpening[];
};

const ACTIVE_WEDDINGS = UPCOMING_WEDDINGS.map((w) => ({
  id: w.id,
  couple: w.coupleNames,
}));

function openings(
  categoryLabel: string,
  bookedFor: string[] = [],
): WeddingOpening[] {
  return ACTIVE_WEDDINGS.map((w) => ({
    weddingId: w.id,
    couple: w.couple,
    categoryLabel,
    status: bookedFor.includes(w.id) ? "booked" : "open",
  }));
}

// Detailed vendor cards for Photography (3 shown, 9 additional are represented
// only by count). Other categories are collapsed — only header + count shown.
export const PHOTOGRAPHY_FEATURED: RosterVendor[] = [
  {
    id: "ph-joseph-radhik",
    categoryKey: "photography",
    name: "Stories by Joseph Radhik",
    handle: "@storiesbyjosephradhik",
    avatarMonogram: "JR",
    rating: 4.9,
    location: "Mumbai",
    collaborations: 14,
    lastWorked: "Oct 2025",
    priceRange: "$12K–$25K",
    tags: ["Editorial", "Candid", "Destination", "Large weddings"],
    privateNote:
      "Best for 400+ guest weddings. Always delivers galleries within 6 weeks. Team of 4. Requires 50% deposit upfront, 50% two weeks before the date — doesn't negotiate terms, so plan cashflow around that.",
    openings: openings("Photography", ["priya-arjun"]),
  },
  {
    id: "ph-wedding-salad",
    categoryKey: "photography",
    name: "The Wedding Salad",
    handle: "@theweddingsalad",
    avatarMonogram: "WS",
    rating: 4.8,
    location: "Mumbai",
    collaborations: 8,
    lastWorked: "Sep 2025",
    priceRange: "$6K–$14K",
    tags: ["Documentary", "Natural light", "Intimate weddings"],
    privateNote:
      "Great for smaller, intimate weddings. Very creative but sometimes runs late on gallery delivery (8–10 weeks is normal). Best paired with Cinema Studio for video — they already have a working rhythm together.",
    openings: openings("Photography"),
  },
  {
    id: "ph-dot-dusk",
    categoryKey: "photography",
    name: "Dot Dusk",
    handle: "@dotdusk",
    avatarMonogram: "DD",
    rating: 4.7,
    location: "Delhi",
    collaborations: 5,
    lastWorked: "Aug 2025",
    priceRange: "$3K–$8K",
    tags: ["Budget-friendly", "Modern", "Travels"],
    privateNote:
      "Best budget option without sacrificing quality. Recommend for couples under $200K total budget. They travel for a flat fee + actuals — good for destination events if your couple is watching cost.",
    openings: openings("Photography"),
  },
];

// Utility for the "+ X more" line under a category.
export function collapsedCountFor(category: RosterCategoryKey): number {
  if (category === "photography") {
    const cat = ROSTER_CATEGORIES.find((c) => c.key === category)!;
    return cat.count - PHOTOGRAPHY_FEATURED.length;
  }
  return ROSTER_CATEGORIES.find((c) => c.key === category)?.count ?? 0;
}

// ── Analytics sidebar ──────────────────────────────────────────────────────

export const ROSTER_ANALYTICS = {
  totalVendors: ROSTER_TOTAL,
  mostUsedVendor: { name: "Elegant Affairs", count: 18, category: "Decor" },
  mostCategory: { name: "Photography", count: 12 },
  fewestCategory: {
    name: "Priest",
    count: 2,
    hint: "Consider adding more options",
  },
  addedThisQuarter: 5,
  staleVendors: {
    count: 8,
    hint: "Not used in 12+ months — review and update?",
  },
} as const;

// Filter/sort option lists used by the client UI.
export const SORT_OPTIONS = [
  { key: "collaborations", label: "Most collaborations" },
  { key: "rating", label: "Highest rated" },
  { key: "recent", label: "Recently worked with" },
  { key: "alpha", label: "Alphabetical" },
] as const;

export type SortOptionKey = (typeof SORT_OPTIONS)[number]["key"];
