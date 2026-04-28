// Cross-tab product matching across Shopping sub-views.
//
// Each tab defines its own categorization — Our Store uses the StoreCategory
// enum, Marketplace uses free-form slugs, Creator Picks inherits StoreProduct
// categories. This module normalizes them to a shared "unified category" so
// a bride browsing a $84K lehenga in the Store can see a $8K pre-loved one
// from Marketplace.

import type { StoreCategory, StoreProduct } from "@/lib/link-preview/types";
import type { MarketplaceListing } from "@/types/marketplace";

export type UnifiedCategory =
  | "attire"
  | "jewelry"
  | "decor"
  | "stationery"
  | "catering"
  | "gifting"
  | "other";

const STORE_TO_UNIFIED: Record<StoreCategory, UnifiedCategory> = {
  attire: "attire",
  jewelry: "jewelry",
  decor: "decor",
  stationery: "stationery",
  catering_accessories: "catering",
  gifting: "gifting",
};

const MARKETPLACE_TO_UNIFIED: Record<string, UnifiedCategory> = {
  bridal_wear: "attire",
  groom_wear: "attire",
  shoes: "attire",
  veils_dupattas: "attire",
  jewelry: "jewelry",
  decor: "decor",
  signage: "decor",
  florals: "decor",
  lighting: "decor",
  photo_props: "decor",
  ceremony: "decor",
  tableware: "catering",
  stationery: "stationery",
  favors: "gifting",
  miscellaneous: "other",
};

export function unifiedFromStore(category: StoreCategory): UnifiedCategory {
  return STORE_TO_UNIFIED[category] ?? "other";
}

export function unifiedFromMarketplace(slug: string): UnifiedCategory {
  return MARKETPLACE_TO_UNIFIED[slug] ?? "other";
}

export interface CrossTabMatches {
  store: StoreProduct[];
  marketplace: MarketplaceListing[];
}

// Given a source unified category (and optional source id to exclude), return
// a small set of items per tab. Caller composes these into its own layout so
// we don't over-specify the rendering here.
export function findCrossTabMatches({
  unified,
  excludeStoreIds = [],
  excludeMarketplaceIds = [],
  limitPerTab = 4,
  storeProducts,
  marketplaceListings,
}: {
  unified: UnifiedCategory;
  excludeStoreIds?: string[];
  excludeMarketplaceIds?: string[];
  limitPerTab?: number;
  storeProducts: StoreProduct[];
  marketplaceListings: MarketplaceListing[];
}): CrossTabMatches {
  const storeExclude = new Set(excludeStoreIds);
  const marketExclude = new Set(excludeMarketplaceIds);

  const store = storeProducts
    .filter(
      (p) =>
        !storeExclude.has(p.id) && unifiedFromStore(p.category) === unified,
    )
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, limitPerTab);

  const marketplace = marketplaceListings
    .filter(
      (l) =>
        l.status === "active" &&
        !marketExclude.has(l.id) &&
        unifiedFromMarketplace(l.category) === unified,
    )
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )
    .slice(0, limitPerTab);

  return { store, marketplace };
}
