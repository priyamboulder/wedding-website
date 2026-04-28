// ── Real Wedding Showcases data model ──────────────────────────────────────
// Bride-authored showcases of a completed wedding. Lives in
// /community/real-weddings and cross-links into vendor profiles (vendor
// reviews), product cards (seen-in badge), and creator profiles (shoutouts).
// Persistence: seed file is the catalog source of truth; user state
// (saves, view tally, user-submitted drafts) lives in the Zustand store.

export type ShowcaseStyleTag =
  | "traditional"
  | "fusion"
  | "minimalist"
  | "grand"
  | "intimate"
  | "destination"
  | "eco_conscious"
  | "multi_day";

export type ShowcaseTraditionTag =
  | "hindu"
  | "sikh"
  | "muslim"
  | "christian"
  | "interfaith"
  | "non_religious"
  | "other";

export type ShowcaseBudgetRange =
  | "under_25k"
  | "25k_50k"
  | "50k_100k"
  | "100k_250k"
  | "250k_plus"
  | "not_say";

export type ShowcaseStatus =
  | "draft"
  | "in_review"
  | "published"
  | "archived";

export type ShowcasePhotoSection = "looks" | "details" | "general";

export type ShowcaseProductSection = "looks" | "details";

// ── Photos ─────────────────────────────────────────────────────────────────
// Each photo in a showcase sits in a section ("looks" = attire, "details" =
// decor/stationery/favors, "general" = story/header art). Tagged products
// are linked by photo id so the detail page can render Instagram-style
// product pins over the correct image.

export interface ShowcasePhoto {
  id: string;
  imageUrl: string;
  caption?: string;
  section: ShowcasePhotoSection;
  sortOrder: number;
}

export interface ShowcaseProductTag {
  id: string;
  // photoId optional — if set, the tag renders pinned to a specific photo;
  // otherwise it renders in the section's grid of additional products.
  photoId?: string;
  productId: string;
  section: ShowcaseProductSection;
  // Optional pin coordinates on the photo (0..1). If absent, the tag
  // appears in the section's product list instead of pinned to the image.
  pinX?: number;
  pinY?: number;
  note?: string;
}

// ── Vendors ────────────────────────────────────────────────────────────────

export interface ShowcaseVendorReview {
  id: string;
  vendorId: string;
  role: string; // "Wedding Planner", "Florist", "Photographer"
  rating: 1 | 2 | 3 | 4 | 5;
  reviewText: string;
}

// ── Creator shoutouts ──────────────────────────────────────────────────────

export interface ShowcaseCreatorShoutout {
  id: string;
  creatorId: string;
  shoutoutText: string;
}

// ── Budget breakdown (The Numbers section) ─────────────────────────────────
// Couples can share a high-level breakdown without revealing absolute
// numbers — the page renders a donut chart from these percentages.

export interface ShowcaseBudgetSlice {
  label: string; // e.g., "Venue & Catering"
  percent: number; // 0..100; slices should sum to ~100
  note?: string;
}

// ── Showcase ───────────────────────────────────────────────────────────────

export interface RealWeddingShowcase {
  id: string;
  slug: string; // URL-safe, used at /community/real-weddings/[slug]
  coupleUserId: string; // FK to the bride/groom user (localStorage for now)
  brideName: string;
  partnerName: string;
  title: string; // auto-generated "Ananya & Rohan's Wedding" but can be overridden

  weddingDate: string; // ISO date
  locationCity: string;
  venueName: string;

  coverImageUrl: string;
  storyText: string; // 2-3 paragraphs; simple HTML (bold/italic/links)

  styleTags: ShowcaseStyleTag[];
  traditionTags: ShowcaseTraditionTag[];

  budgetRange: ShowcaseBudgetRange;
  guestCountRange: string; // "50-100", "100-200", etc. Freeform.
  budgetBreakdown: ShowcaseBudgetSlice[];

  photos: ShowcasePhoto[];
  productTags: ShowcaseProductTag[];
  vendorReviews: ShowcaseVendorReview[];
  creatorShoutouts: ShowcaseCreatorShoutout[];

  status: ShowcaseStatus;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;

  // Baseline counts so the first visit doesn't render a dead feed.
  baseSaveCount: number;
  baseViewCount: number;

  // Editorial flag — set by platform team. Featured showcase gets the
  // Real Weddings listing page hero slot.
  isFeatured: boolean;
}

export interface ShowcaseSave {
  showcaseId: string;
  savedAt: string;
}

// ── Monthly awards ─────────────────────────────────────────────────────────
// Lightweight "Wedding of the Month" derived from save counts per calendar
// month. Not a full voting system — the winner is computed on the fly from
// save activity, and the result is cached here so the banner stays stable
// after the month closes.

export interface MonthlyAward {
  id: string;
  showcaseId: string;
  month: string; // ISO date for first of the month, e.g., "2026-03-01"
  metric: "saves";
  value: number;
}

// ── Labels ─────────────────────────────────────────────────────────────────

export const SHOWCASE_STYLE_LABEL: Record<ShowcaseStyleTag, string> = {
  traditional: "Traditional",
  fusion: "Fusion",
  minimalist: "Minimalist",
  grand: "Grand",
  intimate: "Intimate",
  destination: "Destination",
  eco_conscious: "Eco-Conscious",
  multi_day: "Multi-Day",
};

export const SHOWCASE_TRADITION_LABEL: Record<ShowcaseTraditionTag, string> = {
  hindu: "Hindu",
  sikh: "Sikh",
  muslim: "Muslim",
  christian: "Christian",
  interfaith: "Interfaith",
  non_religious: "Non-Religious",
  other: "Other",
};

export const SHOWCASE_BUDGET_LABEL: Record<ShowcaseBudgetRange, string> = {
  under_25k: "Under $25K",
  "25k_50k": "$25K – $50K",
  "50k_100k": "$50K – $100K",
  "100k_250k": "$100K – $250K",
  "250k_plus": "$250K+",
  not_say: "Prefer Not to Say",
};
