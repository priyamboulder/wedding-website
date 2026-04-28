// ── Marketplace: second-hand & rental wedding goods ─────────────────────────
// Peer-to-peer listings from past brides. LocalStorage-only v1 (no backend).

export type ListingType = "sell" | "rent" | "sell_or_rent" | "free";

export type ListingCondition =
  | "new_with_tags"
  | "like_new"
  | "good"
  | "fair";

export type ListingStatus =
  | "draft"
  | "active"
  | "pending"
  | "sold"
  | "rented"
  | "expired"
  | "removed";

export type InquiryStatus = "open" | "closed" | "reported";

export interface MarketplaceListing {
  id: string;
  seller_id: string;
  seller_display_name: string;
  seller_avatar_gradient?: string;
  seller_city?: string;
  seller_state?: string;
  seller_bio?: string;
  seller_member_since?: string;   // ISO date
  seller_items_listed?: number;   // denormalized stat
  seller_items_sold?: number;
  seller_typical_response?: string; // "within a few hours"
  seller_is_verified?: boolean;   // email + identity or >=1 completed sale

  title: string;
  description: string;             // markdown-ish body

  category: string;                // slug
  subcategory?: string;
  tags: string[];

  listing_type: ListingType;

  price_cents?: number;
  original_price_cents?: number;
  price_is_negotiable: boolean;
  rental_deposit_cents?: number;
  rental_duration_days?: number;

  condition: ListingCondition;
  times_used?: number;

  size?: string;
  color?: string;
  brand?: string;

  purchase_year?: number;

  seller_location_city: string;
  seller_location_state?: string;
  seller_location_country: string;
  shipping_available: boolean;
  local_pickup: boolean;
  shipping_notes?: string;

  images: string[];                // data URLs or gradient sentinels
  image_gradients?: string[];      // fallback gradients, same length as images

  status: ListingStatus;

  view_count: number;
  save_count: number;
  inquiry_count: number;

  expires_at: string;              // ISO
  created_at: string;
  updated_at: string;
}

export interface MarketplaceCategory {
  slug: string;
  label: string;
  emoji: string;
  description?: string;
  parent_slug?: string;
  sort_order: number;
}

export interface MarketplaceSave {
  id: string;
  user_id: string;
  listing_id: string;
  created_at: string;
}

export interface InquiryMessage {
  id: string;
  sender_id: string;
  sender_display_name: string;
  body: string;
  sent_at: string;
  read: boolean;
}

export interface MarketplaceInquiry {
  id: string;
  listing_id: string;
  buyer_id: string;
  buyer_display_name: string;
  seller_id: string;
  seller_display_name: string;
  messages: InquiryMessage[];
  status: InquiryStatus;
  created_at: string;
  updated_at: string;
}

export interface MarketplaceReport {
  id: string;
  listing_id: string;
  reporter_id: string;
  reason: ReportReason;
  details?: string;
  status: "pending" | "reviewed" | "actioned" | "dismissed";
  created_at: string;
}

export type ReportReason =
  | "inaccurate_photos"
  | "counterfeit"
  | "inappropriate"
  | "scam"
  | "other";

// ── Filter & sort state ─────────────────────────────────────────────────────

export interface MarketplaceFilterState {
  category: string | null;          // slug or null = all
  listingType: ListingType | "all";
  condition: ListingCondition | "any";
  city: string | null;
  minPrice: number | null;
  maxPrice: number | null;
  size: string | null;
  shipsOnly: boolean;
  query: string;
}

export type MarketplaceSortKey =
  | "recent"
  | "price_asc"
  | "price_desc"
  | "most_saved"
  | "best_deal";

export const EMPTY_FILTERS: MarketplaceFilterState = {
  category: null,
  listingType: "all",
  condition: "any",
  city: null,
  minPrice: null,
  maxPrice: null,
  size: null,
  shipsOnly: false,
  query: "",
};

// ── Labels ──────────────────────────────────────────────────────────────────

export const CONDITION_LABELS: Record<ListingCondition, string> = {
  new_with_tags: "New with tags",
  like_new: "Like new",
  good: "Good",
  fair: "Fair",
};

export const LISTING_TYPE_LABELS: Record<ListingType, string> = {
  sell: "For sale",
  rent: "For rent",
  sell_or_rent: "Sale or rent",
  free: "Free",
};

export const REPORT_REASON_LABELS: Record<ReportReason, string> = {
  inaccurate_photos: "Inaccurate photos",
  counterfeit: "Suspected counterfeit",
  inappropriate: "Inappropriate content",
  scam: "Scam or fraud",
  other: "Other",
};
