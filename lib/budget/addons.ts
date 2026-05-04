// ──────────────────────────────────────────────────────────────────────────
// Budget tool — add-on catalog reads.
// ──────────────────────────────────────────────────────────────────────────

import type { SupabaseClient } from "@supabase/supabase-js";

import type { BudgetAddonRow } from "@/types/budget";

type AnyClient = SupabaseClient<any, any, any>;

export async function listBudgetAddons(
  supabase: AnyClient,
): Promise<BudgetAddonRow[]> {
  const { data, error } = await supabase
    .from("budget_addons")
    .select("*")
    .eq("active", true)
    .order("display_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as BudgetAddonRow[];
}

export async function listBudgetAddonsByCategory(
  supabase: AnyClient,
): Promise<Record<string, BudgetAddonRow[]>> {
  const all = await listBudgetAddons(supabase);
  const grouped: Record<string, BudgetAddonRow[]> = {};
  for (const addon of all) {
    const key = addon.category || "Other";
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(addon);
  }
  return grouped;
}
