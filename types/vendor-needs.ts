// ── Vendor needs (Bride Vendor Discovery) types ─────────────────────────────
// The bride publishes a checklist of vendors she still needs; vendors browse
// these "looking" rows in their workspace and express interest. Schema
// mirrors the original Supabase sketch from the prompt so a migration is
// straightforward when persistence moves later. All persistence currently
// lives in Zustand + localStorage.

import type { VendorCategory as PortalVendorCategory } from "@/types/vendor-unified";

// ── Bride-side checklist categories ─────────────────────────────────────────
// 24 wedding-vendor checklist categories the bride sees. Distinct from the
// 8 portal `VendorCategory` values that classify a vendor business; each
// checklist category maps to one (or none) of the portal categories so the
// vendor-side feed can filter to needs relevant to that vendor's services.

export type VendorNeedCategorySlug =
  | "venue"
  | "photographer"
  | "videographer"
  | "wedding_planner"
  | "caterer"
  | "decorator"
  | "florist"
  | "makeup_artist"
  | "hair_stylist"
  | "mehendi_artist"
  | "dj_music"
  | "cake_desserts"
  | "invitations"
  | "officiant"
  | "transportation"
  | "rentals"
  | "lighting"
  | "photo_booth"
  | "favors"
  | "bridal_wear"
  | "groom_wear"
  | "jewelry"
  | "choreographer"
  | "honeymoon";

export interface VendorNeedCategory {
  slug: VendorNeedCategorySlug;
  label: string;
  emoji: string;
  description: string;
  sort_order: number;
  // Portal vendor business category this checklist row maps to. Vendors with
  // a matching `category` see brides looking for this need in their feed.
  // `null` for categories that aren't represented as a vendor business in
  // the portal yet (venue, transport, jewelry, etc.) — those rows still
  // render on the bride's checklist but generate no vendor-side matches.
  portal_category: PortalVendorCategory | null;
}

export const VENDOR_NEED_CATEGORIES: VendorNeedCategory[] = [
  { slug: "venue",            label: "Venue",                  emoji: "🏰", description: "Reception, ceremony, or event venue",       sort_order: 1,  portal_category: null },
  { slug: "photographer",     label: "Photographer",           emoji: "📸", description: "Wedding and event photography",             sort_order: 2,  portal_category: "photography" },
  { slug: "videographer",     label: "Videographer",           emoji: "🎬", description: "Wedding and event videography",             sort_order: 3,  portal_category: "photography" },
  { slug: "wedding_planner",  label: "Wedding Planner",        emoji: "📋", description: "Full-service or day-of coordination",       sort_order: 4,  portal_category: null },
  { slug: "caterer",          label: "Caterer",                emoji: "🍽️", description: "Food and beverage service",                  sort_order: 5,  portal_category: "catering" },
  { slug: "decorator",        label: "Decorator / Designer",   emoji: "🎨", description: "Event décor and design",                     sort_order: 6,  portal_category: "decor_florals" },
  { slug: "florist",          label: "Florist",                emoji: "💐", description: "Floral design and arrangements",            sort_order: 7,  portal_category: "decor_florals" },
  { slug: "makeup_artist",    label: "Makeup Artist",          emoji: "💄", description: "Bridal and party makeup",                   sort_order: 8,  portal_category: "hmua" },
  { slug: "hair_stylist",     label: "Hair Stylist",           emoji: "💇", description: "Bridal and party hair",                     sort_order: 9,  portal_category: "hmua" },
  { slug: "mehendi_artist",   label: "Mehendi Artist",         emoji: "🤲", description: "Henna and mehendi design",                  sort_order: 10, portal_category: "hmua" },
  { slug: "dj_music",         label: "DJ / Music",             emoji: "🎵", description: "DJ, live band, or musicians",               sort_order: 11, portal_category: "entertainment" },
  { slug: "cake_desserts",    label: "Cake & Desserts",        emoji: "🎂", description: "Wedding cake and dessert table",            sort_order: 12, portal_category: "catering" },
  { slug: "invitations",      label: "Invitations & Stationery", emoji: "✉️", description: "Wedding invitations and paper goods",     sort_order: 13, portal_category: "stationery" },
  { slug: "officiant",        label: "Officiant / Pandit",     emoji: "🙏", description: "Ceremony officiant or priest",              sort_order: 14, portal_category: "pandit_ceremony" },
  { slug: "transportation",   label: "Transportation",         emoji: "🚗", description: "Limos, vintage cars, shuttles",             sort_order: 15, portal_category: null },
  { slug: "rentals",          label: "Rentals",                emoji: "🪑", description: "Tables, chairs, linens, tents",             sort_order: 16, portal_category: null },
  { slug: "lighting",         label: "Lighting & AV",          emoji: "💡", description: "Event lighting, sound, and projection",    sort_order: 17, portal_category: "entertainment" },
  { slug: "photo_booth",      label: "Photo Booth",            emoji: "🤳", description: "Photo booth and guest experience",          sort_order: 18, portal_category: null },
  { slug: "favors",           label: "Favors & Gifts",         emoji: "🎁", description: "Guest favors and wedding party gifts",      sort_order: 19, portal_category: null },
  { slug: "bridal_wear",      label: "Bridal Wear",            emoji: "👰", description: "Lehenga, saree, gown, or bridal outfit",   sort_order: 20, portal_category: "wardrobe" },
  { slug: "groom_wear",       label: "Groom Wear",             emoji: "🤵", description: "Sherwani, suit, or groom outfit",           sort_order: 21, portal_category: "wardrobe" },
  { slug: "jewelry",          label: "Jewelry",                emoji: "💎", description: "Bridal and wedding jewelry",                sort_order: 22, portal_category: null },
  { slug: "choreographer",    label: "Choreographer",          emoji: "💃", description: "Sangeet and first dance choreography",      sort_order: 23, portal_category: null },
  { slug: "honeymoon",        label: "Honeymoon Planner",      emoji: "🌴", description: "Honeymoon travel planning",                 sort_order: 24, portal_category: null },
];

// Top-10 most common categories — pre-populated as "looking" rows on first
// visit so the bride sees a meaningful checklist instead of an empty state.
export const DEFAULT_CHECKLIST_SLUGS: VendorNeedCategorySlug[] = [
  "venue",
  "photographer",
  "videographer",
  "wedding_planner",
  "caterer",
  "decorator",
  "florist",
  "makeup_artist",
  "hair_stylist",
  "dj_music",
];

export function getVendorNeedCategory(
  slug: VendorNeedCategorySlug,
): VendorNeedCategory | undefined {
  return VENDOR_NEED_CATEGORIES.find((c) => c.slug === slug);
}

// Reverse lookup — given a portal vendor category, return all checklist
// slugs that map to it. Used by the vendor-side feed to filter brides.
export function checklistSlugsForPortalCategory(
  portalCategory: PortalVendorCategory,
): VendorNeedCategorySlug[] {
  return VENDOR_NEED_CATEGORIES.filter(
    (c) => c.portal_category === portalCategory,
  ).map((c) => c.slug);
}

// ── Need status ─────────────────────────────────────────────────────────────

export type VendorNeedStatus = "looking" | "booked" | "not_needed";

export type BudgetRange =
  | "under_1k"
  | "1k_3k"
  | "3k_5k"
  | "5k_10k"
  | "10k_20k"
  | "20k_50k"
  | "50k_plus"
  | "flexible";

export const BUDGET_RANGES: { id: BudgetRange; label: string }[] = [
  { id: "under_1k",  label: "Under $1K" },
  { id: "1k_3k",     label: "$1K–$3K" },
  { id: "3k_5k",     label: "$3K–$5K" },
  { id: "5k_10k",    label: "$5K–$10K" },
  { id: "10k_20k",   label: "$10K–$20K" },
  { id: "20k_50k",   label: "$20K–$50K" },
  { id: "50k_plus",  label: "$50K+" },
  { id: "flexible",  label: "Flexible" },
];

export type VendorNeedUrgency = "urgent" | "soon" | "flexible";

export const URGENCY_OPTIONS: {
  id: VendorNeedUrgency;
  label: string;
  helper: string;
  emoji: string;
}[] = [
  { id: "urgent",   label: "Urgent",   helper: "need to book ASAP",                emoji: "🔴" },
  { id: "soon",     label: "Soon",     helper: "deciding in the next few weeks",   emoji: "🟡" },
  { id: "flexible", label: "Flexible", helper: "still browsing, no rush",          emoji: "🟢" },
];

// ── Vendor need (a row on the bride's checklist) ───────────────────────────

export interface CommunityVendorNeed {
  id: string;
  profile_id: string;             // bride's community profile id
  category_slug: VendorNeedCategorySlug;

  status: VendorNeedStatus;

  // Context — only meaningful when status === "looking"
  budget_range?: BudgetRange;
  notes?: string;
  preferred_style?: string;
  urgency: VendorNeedUrgency;

  // Per-row visibility — bride can hide individual categories from vendors.
  is_visible_to_vendors: boolean;

  // Booked-vendor reference — booked_vendor_id when on platform, fallback to
  // booked_vendor_name for off-platform vendors.
  booked_vendor_id?: string;
  booked_vendor_name?: string;

  is_seed?: boolean;
  created_at: string;
  updated_at: string;
}

// ── Vendor interest (a vendor's intro to a bride) ──────────────────────────

export type VendorInterestStatus =
  | "pending"   // sent, bride hasn't responded
  | "viewed"    // bride saw it
  | "accepted"  // bride agreed to share contact info
  | "declined"  // bride passed
  | "expired";  // 14-day no-response auto-expire

export interface CommunityVendorInterest {
  id: string;
  vendor_id: string;            // portal vendor id (e.g. PORTAL_VENDOR_ID)
  need_id: string;              // CommunityVendorNeed.id
  bride_profile_id: string;     // bride's community profile id

  message: string;              // intro pitch (max 500 chars)

  status: VendorInterestStatus;

  is_seed?: boolean;
  created_at: string;
  updated_at: string;
}

// ── Privacy ────────────────────────────────────────────────────────────────
// Per-bride master toggle keyed by community profile id. When false the
// bride is fully removed from vendor discovery regardless of per-row
// `is_visible_to_vendors` flags.

export interface VendorDiscoveryPrivacy {
  profile_id: string;
  discoverable_by_vendors: boolean;
  updated_at: string;
}

// ── Constants ──────────────────────────────────────────────────────────────

// How many interests a vendor can send per rolling 24h window.
export const VENDOR_INTEREST_DAILY_LIMIT = 10;

// How long a pending interest sits before auto-expiring.
export const VENDOR_INTEREST_EXPIRY_DAYS = 14;
