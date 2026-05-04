// ──────────────────────────────────────────────────────────────────────────
// Match Me — read helpers.
//
// The matcher pulls from `budget_locations` (the same table the Budget tool
// and Destination Explorer use). The only Match-specific columns are
// `tags` and `max_capacity`, both added in migration 0023.
// ──────────────────────────────────────────────────────────────────────────

import type { SupabaseClient } from "@supabase/supabase-js";

import type { BudgetLocationRow } from "@/types/budget";
import type { MatchableLocation } from "./scoring";

type AnyClient = SupabaseClient<any, any, any>;

export async function listMatchableLocations(
  supabase: AnyClient,
): Promise<MatchableLocation[]> {
  const { data, error } = await supabase
    .from("budget_locations")
    .select("*")
    .eq("active", true)
    .order("display_order", { ascending: true });
  if (error) throw error;
  return ((data ?? []) as Array<BudgetLocationRow & { tags?: string[] | null; max_capacity?: number | null }>).map(
    (l) => ({ ...l }),
  );
}
