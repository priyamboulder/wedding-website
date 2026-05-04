// ──────────────────────────────────────────────────────────────────────────
// Budget tool — vendor cost templates.
//
// `budget_vendor_tiers` stores the base USD cost for each (category, tier)
// pair at the 1.0 multiplier. Caller multiplies by location.multiplier and
// (for per_guest categories) the event guest count.
// ──────────────────────────────────────────────────────────────────────────

import type { SupabaseClient } from "@supabase/supabase-js";

import type { BudgetVendorTierRow } from "@/types/budget";

type AnyClient = SupabaseClient<any, any, any>;

export async function listBudgetVendorTiers(
  supabase: AnyClient,
): Promise<BudgetVendorTierRow[]> {
  const { data, error } = await supabase
    .from("budget_vendor_tiers")
    .select("*")
    .order("display_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as BudgetVendorTierRow[];
}

export async function getTiersForCategory(
  supabase: AnyClient,
  vendorCategoryId: string,
): Promise<BudgetVendorTierRow[]> {
  const { data, error } = await supabase
    .from("budget_vendor_tiers")
    .select("*")
    .eq("vendor_category_id", vendorCategoryId)
    .order("display_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as BudgetVendorTierRow[];
}
