// ── Journal article model ──────────────────────────────────────────────────
// Mirrors the in-memory shape used by app/journal/page.tsx. Extracted so
// additional article files (e.g. pilot/* packs) can import the same types
// rather than redeclaring them locally.

export type CategorySlug =
  | "real-weddings"
  | "traditions"
  | "style"
  | "beauty"
  | "decor"
  | "food"
  | "planning"
  | "destinations";

export type ArticleTier = "cover" | "feature" | "standard";
export type GridSpan = "full" | "half" | "third";

export interface JournalCategory {
  slug: CategorySlug;
  label: string;
  blurb: string;
}

// ── Checklist suggestion (existing Journal → "add tasks" pattern) ─────────
// Different from types/journal-links.ts's ArticleChecklistLink, which
// points to EXISTING checklist items. This type suggests NEW tasks an
// article recommends the couple add.
export interface ChecklistLink {
  phase_id: string;
  subsection: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
}

export interface StudioLink {
  area: "brand" | "invitations" | "website" | "print";
  label: string;
  description: string;
}

export interface VendorLink {
  category:
    | "photography"
    | "hmua"
    | "decor_florals"
    | "catering"
    | "entertainment"
    | "wardrobe"
    | "stationery"
    | "pandit_ceremony";
  reason: string;
}

// ── Body blocks ───────────────────────────────────────────────────────────
//
// Two image shapes coexist on purpose:
//
//   • `image` (seed)  — picsum placeholder, used by pre-pilot articles and
//                        for layout sketching before press-kit assets arrive.
//   • `photo` (url)   — real editorial imagery served from Supabase Storage
//                        or a licensed CDN. Requires explicit `credit`.
//
// `designer_showcase` is a structured card, not prose + image. It exists
// because "featured designer" is a recurring editorial move that needs
// consistent metadata (piece, price, lead time, credit) to be useful at
// scale and to one day cross-link into the Vendors directory.

export interface PhotoCredit {
  // Whoever owns the image — photographer, designer PR, or publication.
  // Rendered beneath the image in small caps.
  name: string;
  // Optional link — designer website, photographer portfolio, etc.
  href?: string;
  // If true, render "Placeholder — swap for press-kit image" styling so
  // editorial can see at a glance what still needs sourcing.
  placeholder?: boolean;
}

export interface DesignerShowcase {
  kind: "designer_showcase";
  designer: string;
  collection?: string;
  piece: string;
  price_range?: string; // free-form, e.g. "$28,000 – $42,000 / ₹23L – ₹35L"
  lead_time?: string;   // e.g. "6–8 months"
  image_url: string;
  image_alt: string;
  credit: PhotoCredit;
  vendor_slug?: string; // /vendors/[slug] once Vendors directory is wired
  note?: string;        // editorial one-liner
}

export type Block =
  | { kind: "p"; text: string }
  | { kind: "h2"; text: string }
  | { kind: "pullquote"; text: string; attribution?: string }
  | { kind: "image"; seed: string; caption?: string }
  | {
      kind: "photo";
      url: string;
      alt: string;
      credit: PhotoCredit;
      caption?: string;
    }
  | { kind: "list"; items: string[] }
  | DesignerShowcase;

// ── Article ────────────────────────────────────────────────────────────────

export interface Article {
  id: string;
  slug: string;
  tier: ArticleTier;
  span: GridSpan;
  category: CategorySlug;
  title: string;
  deck: string;
  byline: string;
  bylineBio: string;
  readingTime: number;
  publishedAt: string; // ISO
  heroSeed: string;
  destination?: string;
  tags: string[];
  body: Block[];
  checklist: ChecklistLink[];
  studio: StudioLink[];
  vendors: VendorLink[];
}

export interface InspirationBoard {
  id: string;
  title: string;
  coverSeed: string;
  itemIds: string[];
  createdAt: string;
}
