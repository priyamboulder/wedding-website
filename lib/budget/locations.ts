// ──────────────────────────────────────────────────────────────────────────
// Budget tool — location reads.
// ──────────────────────────────────────────────────────────────────────────

import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  BudgetLocationDetail,
  BudgetLocationExperienceRow,
  BudgetLocationRegionRow,
  BudgetLocationRow,
  BudgetLocationType,
} from "@/types/budget";

type AnyClient = SupabaseClient<any, any, any>;

export async function listBudgetLocations(
  supabase: AnyClient,
  type?: BudgetLocationType,
): Promise<BudgetLocationRow[]> {
  let query = supabase
    .from("budget_locations")
    .select("*")
    .eq("active", true)
    .order("display_order", { ascending: true });
  if (type) query = query.eq("type", type);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as BudgetLocationRow[];
}

export async function getBudgetLocation(
  supabase: AnyClient,
  slug: string,
): Promise<BudgetLocationDetail | null> {
  const { data: locationRow, error } = await supabase
    .from("budget_locations")
    .select("*")
    .eq("slug", slug)
    .eq("active", true)
    .maybeSingle();
  if (error) throw error;
  if (!locationRow) return null;

  const location = locationRow as BudgetLocationRow;

  const [{ data: regions, error: regionsError }, { data: experiences, error: expError }] =
    await Promise.all([
      supabase
        .from("budget_location_regions")
        .select("*")
        .eq("location_id", location.id)
        .order("display_order", { ascending: true }),
      supabase
        .from("budget_location_experiences")
        .select("*")
        .eq("location_id", location.id)
        .order("display_order", { ascending: true }),
    ]);
  if (regionsError) throw regionsError;
  if (expError) throw expError;

  return {
    ...location,
    regions: (regions ?? []) as BudgetLocationRegionRow[],
    experiences: (experiences ?? []) as BudgetLocationExperienceRow[],
  };
}
