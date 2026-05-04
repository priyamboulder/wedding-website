// ──────────────────────────────────────────────────────────────────────────
// Budget tool — culture + per-culture event reads.
// ──────────────────────────────────────────────────────────────────────────

import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  BudgetCultureEventRow,
  BudgetCultureRow,
  BudgetCultureWithEvents,
} from "@/types/budget";

type AnyClient = SupabaseClient<any, any, any>;

export async function listBudgetCultures(
  supabase: AnyClient,
): Promise<BudgetCultureRow[]> {
  const { data, error } = await supabase
    .from("budget_cultures")
    .select("*")
    .eq("active", true)
    .order("display_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as BudgetCultureRow[];
}

export async function getBudgetCulture(
  supabase: AnyClient,
  slug: string,
): Promise<BudgetCultureWithEvents | null> {
  const { data: cultureRow, error } = await supabase
    .from("budget_cultures")
    .select("*")
    .eq("slug", slug)
    .eq("active", true)
    .maybeSingle();
  if (error) throw error;
  if (!cultureRow) return null;

  const culture = cultureRow as BudgetCultureRow;

  const { data: events, error: eventsError } = await supabase
    .from("budget_culture_events")
    .select("*")
    .eq("culture_id", culture.id)
    .order("display_order", { ascending: true });
  if (eventsError) throw eventsError;

  return {
    ...culture,
    events: (events ?? []) as BudgetCultureEventRow[],
  };
}

export async function getCultureEvents(
  supabase: AnyClient,
  cultureId: string,
): Promise<BudgetCultureEventRow[]> {
  const { data, error } = await supabase
    .from("budget_culture_events")
    .select("*")
    .eq("culture_id", cultureId)
    .order("display_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as BudgetCultureEventRow[];
}
