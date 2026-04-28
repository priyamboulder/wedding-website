// ── Creator Guides data model ────────────────────────────────────────────
// Editorial long-form posts authored by creators. Lives in /community/guides
// and cross-links into Shopping (Featured-in badge) and Creator profiles.
// Persistence: seed file is the catalog source of truth; user actions
// (saves, view-tracked counts) live in the Zustand+localStorage store.

export type GuideCategory =
  | "styling"
  | "planning"
  | "budget"
  | "decor"
  | "vendor_review"
  | "real_wedding"
  | "trend_report"
  | "cultural_traditions";

export type GuideStatus = "draft" | "published" | "archived";

// ── Body blocks ──────────────────────────────────────────────────────────
// Each guide.body is an array of typed blocks rendered by GuideBody.

export type GuideRichTextBlock = {
  type: "rich_text";
  // Inline HTML kept simple: <strong>, <em>, <a href>. Author-trusted.
  html: string;
};

export type GuideImageBlock = {
  type: "image";
  // 1 image renders full-width, 2-4 render in a grid.
  images: { url: string; alt: string; caption?: string }[];
};

export type GuideProductEmbedBlock = {
  type: "product_embed";
  productId: string; // existing StoreProduct id
  context?: string; // optional inline framing copy ("My pick for…")
};

export type GuideVendorMentionBlock = {
  type: "vendor_mention";
  vendorId: string; // existing StoreVendor id
  context?: string;
};

export type GuidePullQuoteBlock = {
  type: "pull_quote";
  text: string;
  attribution?: string;
};

export type GuideComparisonBlock = {
  type: "comparison";
  title?: string;
  items: {
    productId: string;
    highlight?: string; // a short detail to call out
  }[];
};

export type GuideListBlock = {
  type: "list";
  variant: "numbered" | "checklist" | "bullets";
  title?: string;
  items: string[];
};

export type GuideBodyBlock =
  | GuideRichTextBlock
  | GuideImageBlock
  | GuideProductEmbedBlock
  | GuideVendorMentionBlock
  | GuidePullQuoteBlock
  | GuideComparisonBlock
  | GuideListBlock;

// ── Guide ────────────────────────────────────────────────────────────────

export interface Guide {
  id: string;
  slug: string; // URL-safe, used at /community/guides/[slug]
  creatorId: string;
  title: string;
  subtitle: string;
  coverImageUrl: string;
  category: GuideCategory;
  body: GuideBodyBlock[];
  readTimeMinutes: number;
  status: GuideStatus;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  // Baseline counts so empty stores don't render dead-feeling cards.
  // Live save toggles add on top via the Zustand store.
  baseSaveCount: number;
  baseViewCount: number;
}

export interface GuideSave {
  guideId: string;
  savedAt: string;
}
