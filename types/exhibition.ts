export type ExhibitionStatus =
  | "draft"
  | "preview"
  | "upcoming"
  | "live"
  | "ended"
  | "archived";

export type ExhibitionType =
  | "general"
  | "fashion"
  | "jewelry"
  | "decor"
  | "beauty"
  | "stationery"
  | "food"
  | "planning"
  | "trunk_show"
  | "spotlight";

export type ItemType = "product" | "service" | "collection" | "experience";

export type ContactPreference = "in_app" | "email" | "whatsapp" | "phone";

export type InquiryStatus = "sent" | "viewed" | "replied" | "closed";

export interface Exhibition {
  id: string;
  title: string;
  slug: string;
  subtitle?: string;
  description: string;
  cover_image_url: string;
  cover_gradient?: string;
  logo_url?: string;
  theme_color: string;
  starts_at: string;
  ends_at: string;
  timezone: string;
  exhibition_type: ExhibitionType;
  is_free: boolean;
  requires_rsvp: boolean;
  status: ExhibitionStatus;
  exhibitor_count: number;
  visitor_count: number;
  presented_by?: string;
  partners?: string[];
  created_at: string;
}

export interface Exhibitor {
  id: string;
  exhibition_id: string;
  external_name: string;
  external_logo_url?: string;
  external_website?: string;
  external_instagram?: string;
  booth_name: string;
  booth_tagline?: string;
  booth_description?: string;
  booth_cover_image_url?: string;
  booth_gradient?: string;
  booth_category: string;
  booth_tags: string[];
  has_exclusive_pricing: boolean;
  has_new_collection: boolean;
  has_limited_edition: boolean;
  offers_virtual_appointment: boolean;
  cta_label: string;
  cta_url?: string;
  whatsapp_number?: string;
  is_featured: boolean;
  sort_order: number;
  view_count: number;
  inquiry_count: number;
  wishlist_count: number;
}

export interface ExhibitionItem {
  id: string;
  exhibitor_id: string;
  name: string;
  description?: string;
  images: string[];
  image_gradient?: string;
  video_url?: string;
  price_display?: string;
  original_price_cents?: number;
  exhibition_price_cents?: number;
  is_price_on_request: boolean;
  item_type: ItemType;
  tags: string[];
  is_exhibition_exclusive: boolean;
  is_limited_edition: boolean;
  is_new_launch: boolean;
  quantity_available?: number;
  sort_order: number;
  is_featured: boolean;
  view_count: number;
  wishlist_count: number;
  inquiry_count: number;
}

export interface WishlistEntry {
  id: string;
  item_id: string;
  exhibitor_id: string;
  exhibition_id: string;
  created_at: string;
}

export interface Inquiry {
  id: string;
  item_id?: string;
  exhibitor_id: string;
  exhibition_id: string;
  message: string;
  contact_preference: ContactPreference;
  status: InquiryStatus;
  created_at: string;
}

export interface RsvpEntry {
  exhibition_id: string;
  registered_at: string;
  first_visited_at?: string;
}

export const CATEGORY_LABELS: Record<string, string> = {
  all: "All",
  bridal_wear: "Bridal Wear",
  groom_wear: "Groom Wear",
  jewelry: "Jewelry",
  decor: "Décor",
  beauty: "Beauty",
  stationery: "Stationery",
  accessories: "Accessories",
  footwear: "Footwear",
  home: "Home & Registry",
};
