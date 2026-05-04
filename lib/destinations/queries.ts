// ──────────────────────────────────────────────────────────────────────────
// Destination Explorer — read helpers.
//
// Wraps the existing budget_locations / vendor_categories / vendors layer
// into the shapes the destination pages render. Every vendor read goes
// through `get_ranked_vendors` via `lib/vendors/tools-queries`.
// ──────────────────────────────────────────────────────────────────────────

import type { SupabaseClient } from "@supabase/supabase-js";

import type { BudgetLocationRow } from "@/types/budget";
import { listBudgetLocations } from "@/lib/budget/locations";
import type { VendorCategoryRow } from "@/types/vendors";

import {
  DISPLAY_CONTINENTS,
  type DisplayContinent,
  type DisplayContinentSlug,
  getDisplayContinentSlug,
} from "./continents";

type AnyClient = SupabaseClient<any, any, any>;

export interface ContinentSummary extends DisplayContinent {
  destinationCount: number;
}

export interface CategoryServingLocation {
  category: VendorCategoryRow;
  vendorCount: number;
  startingPriceUsd: number | null;
}

/**
 * List every continent with its destination count. Continents that have
 * zero matching destinations are still returned — the empty state on the
 * tile is part of the brand voice.
 */
export async function listContinentSummaries(
  supabase: AnyClient,
): Promise<ContinentSummary[]> {
  const all = await listBudgetLocations(supabase, "destination");
  const counts = new Map<DisplayContinentSlug, number>();
  for (const loc of all) {
    const slug = getDisplayContinentSlug(loc);
    if (!slug) continue;
    counts.set(slug, (counts.get(slug) ?? 0) + 1);
  }
  return DISPLAY_CONTINENTS.map((c) => ({
    ...c,
    destinationCount: counts.get(c.slug) ?? 0,
  })).sort((a, b) => a.display_order - b.display_order);
}

/**
 * All destinations in a given display continent. Returns null if the
 * continent slug isn't valid (so the route can 404).
 */
export async function listDestinationsForContinent(
  supabase: AnyClient,
  continentSlug: string,
): Promise<{ continent: DisplayContinent; destinations: BudgetLocationRow[] } | null> {
  const continent = DISPLAY_CONTINENTS.find((c) => c.slug === continentSlug);
  if (!continent) return null;
  const all = await listBudgetLocations(supabase, "destination");
  const destinations = all.filter(
    (loc) => getDisplayContinentSlug(loc) === continent.slug,
  );
  return { continent, destinations };
}

/**
 * Categories that have at least one vendor serving the given location,
 * along with vendor counts and a "starting price" indicator. Reads through
 * the same `vendors` + `vendor_category_assignments` + `vendor_pricing_indicators`
 * tables Tools share.
 */
export async function listCategoriesServingLocation(
  supabase: AnyClient,
  locationSlug: string,
): Promise<CategoryServingLocation[]> {
  // Pull every category in canonical display order; we'll filter by which
  // ones actually have a vendor for this location.
  const { data: cats, error } = await supabase
    .from("vendor_categories")
    .select("*")
    .eq("active", true)
    .order("display_order", { ascending: true });
  if (error) throw error;
  const categories = (cats ?? []) as VendorCategoryRow[];
  if (categories.length === 0) return [];

  // For each category, ask the canonical ranking function for at least one
  // matching vendor. We need a count too — Postgres-side aggregation isn't
  // exposed via the SDK without a custom RPC, so we fan out per category.
  // The category list is bounded (~27 rows) and the call is cached by the
  // route's revalidate window.
  const results: CategoryServingLocation[] = [];
  await Promise.all(
    categories.map(async (cat) => {
      const { data, error: rpcError } = await supabase.rpc("get_ranked_vendors", {
        p_category_slug: cat.slug,
        p_location_slug: locationSlug,
        p_tier: null,
        p_capacity: null,
        p_limit: 100,
      });
      if (rpcError) return;
      const vendorIds = ((data ?? []) as Array<{ id: string }>).map((v) => v.id);
      if (vendorIds.length === 0) return;

      const { data: pricing, error: priceErr } = await supabase
        .from("vendor_pricing_indicators")
        .select("price_low_usd")
        .eq("category_id", cat.id)
        .in("vendor_id", vendorIds);
      const startingPriceUsd =
        !priceErr && pricing && pricing.length > 0
          ? Math.min(
              ...pricing.map((p: { price_low_usd: number }) => p.price_low_usd),
            )
          : null;

      results.push({
        category: cat,
        vendorCount: vendorIds.length,
        startingPriceUsd,
      });
    }),
  );

  return results.sort(
    (a, b) => a.category.display_order - b.category.display_order,
  );
}

/**
 * Convenience: read a vendor category by slug. Used to render the title
 * on the vendor list page.
 */
export async function getVendorCategoryBySlug(
  supabase: AnyClient,
  slug: string,
): Promise<VendorCategoryRow | null> {
  const { data, error } = await supabase
    .from("vendor_categories")
    .select("*")
    .eq("slug", slug)
    .eq("active", true)
    .maybeSingle();
  if (error) throw error;
  return (data as VendorCategoryRow | null) ?? null;
}
