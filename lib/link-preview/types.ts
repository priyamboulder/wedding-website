import type { CheerioAPI } from "cheerio";

export interface LinkMetadata {
  image: string | null;
  title: string;
  description: string | null;
  price: number | null;
  currency: string;
  siteName: string | null;
  domain: string;
  favicon: string | null;
  url: string;
  adapter_used: string | null;
}

export interface AdapterFetchOptions {
  userAgent?: string;
  extraHeaders?: Record<string, string>;
}

export interface LinkAdapter {
  name: string;
  domains: string[];
  fetchOptions?: AdapterFetchOptions;
  extract(
    html: string,
    url: string,
    $: CheerioAPI,
  ): Promise<Partial<LinkMetadata>>;
}

export type ShoppingStatus =
  | "considering"
  | "ordered"
  | "received"
  | "returned";

export type ShoppingSourceType = "external" | "ananya_store";

export type StockStatus =
  | "in_stock"
  | "low_stock"
  | "made_to_order"
  | "sold_out";

export interface StoreVariantSelection {
  variantId: string;
  label: string;
  priceDelta: number;
  leadTimeDeltaDays: number;
}

export interface ShoppingLink {
  id: string;
  taskId: string | null;
  module: string | null;
  detachedTaskId: string | null;
  url: string;
  normalizedUrl: string;
  imageUrl: string | null;
  title: string;
  description: string | null;
  price: number | null;
  currency: string;
  quantity: number;
  siteName: string | null;
  domain: string;
  faviconUrl: string | null;
  userNote: string;
  status: ShoppingStatus;
  adapterUsed: string | null;
  position: number;
  createdAt: string;
  updatedAt: string;
  // ── Source discriminator ──────────────────────────────────────────────────
  sourceType: ShoppingSourceType;
  // ── Ananya store fields (null for external items) ─────────────────────────
  productId: string | null;
  vendorId: string | null;
  vendorName: string | null;
  variant: StoreVariantSelection | null;
  stockStatus: StockStatus | null;
  leadTimeDays: number | null;
  orderId: string | null;
  orderedAt: string | null;
  trackingNumber: string | null;
  etaDate: string | null;
}

// ── Ananya native catalog ───────────────────────────────────────────────────

export type StoreCategory =
  | "attire"
  | "jewelry"
  | "decor"
  | "stationery"
  | "catering_accessories"
  | "gifting";

export interface StoreVariant {
  id: string;
  label: string;
  attribute: string; // "Size", "Color", "Material", "Customization"
  priceDelta: number; // added to base price
  leadTimeDeltaDays: number; // added to base lead time (e.g. monogramming = +14d)
  stockStatus: StockStatus;
  stockCount: number | null;
}

export interface StoreVendor {
  id: string;
  name: string;
  tagline: string;
  origin: string; // "Jaipur, India"
  bio: string;
  portfolioImages: string[];
  rating: number;
  reviewCount: number;
  foundedYear: number | null;
  specialties: string[];
}

export interface StoreProduct {
  id: string;
  title: string;
  description: string;
  category: StoreCategory;
  vendorId: string;
  heroImage: string;
  gallery: string[];
  basePrice: number;
  currency: string;
  stockStatus: StockStatus;
  stockCount: number | null;
  baseLeadTimeDays: number;
  region: string;
  material: string;
  color: string;
  tags: string[];
  variants: StoreVariant[];
  isFeatured: boolean;
  isNewArrival: boolean;
  popularity: number;
  createdAt: string;
}
