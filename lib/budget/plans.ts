// ──────────────────────────────────────────────────────────────────────────
// Budget tool — plan CRUD.
//
// Two access patterns:
//   - Authenticated user → standard PostgREST writes. RLS enforces user_id.
//   - Anonymous user     → SECURITY DEFINER RPCs that take the
//                          anonymous_token and verify it server-side.
//
// At signup, `reclaimAnonymousPlan` re-points the anonymous plan to the
// new user_id and clears the token.
// ──────────────────────────────────────────────────────────────────────────

import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  BudgetTier,
  BudgetUserAddonSelectionRow,
  BudgetUserEventRow,
  BudgetUserPlanRow,
  BudgetUserVendorSelectionRow,
} from "@/types/budget";

type AnyClient = SupabaseClient<any, any, any>;

// ── Authed reads / writes ─────────────────────────────────────────────────

export async function getUserPlan(
  supabase: AnyClient,
  userId: string,
): Promise<BudgetUserPlanRow | null> {
  const { data, error } = await supabase
    .from("budget_user_plans")
    .select("*")
    .eq("user_id", userId)
    .order("last_viewed_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return (data as BudgetUserPlanRow | null) ?? null;
}

export async function getPlanById(
  supabase: AnyClient,
  planId: string,
): Promise<BudgetUserPlanRow | null> {
  const { data, error } = await supabase
    .from("budget_user_plans")
    .select("*")
    .eq("id", planId)
    .maybeSingle();
  if (error) throw error;
  return (data as BudgetUserPlanRow | null) ?? null;
}

export async function listPlanEvents(
  supabase: AnyClient,
  planId: string,
): Promise<BudgetUserEventRow[]> {
  const { data, error } = await supabase
    .from("budget_user_events")
    .select("*")
    .eq("plan_id", planId)
    .order("display_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as BudgetUserEventRow[];
}

export async function listPlanVendorSelections(
  supabase: AnyClient,
  planId: string,
): Promise<BudgetUserVendorSelectionRow[]> {
  const { data, error } = await supabase
    .from("budget_user_vendor_selections")
    .select("*")
    .eq("plan_id", planId);
  if (error) throw error;
  return (data ?? []) as BudgetUserVendorSelectionRow[];
}

export async function listPlanAddonSelections(
  supabase: AnyClient,
  planId: string,
): Promise<BudgetUserAddonSelectionRow[]> {
  const { data, error } = await supabase
    .from("budget_user_addon_selections")
    .select("*")
    .eq("plan_id", planId);
  if (error) throw error;
  return (data ?? []) as BudgetUserAddonSelectionRow[];
}

export interface CreateAuthedPlanArgs {
  userId: string;
  name?: string;
  locationId?: string | null;
  cultureId?: string | null;
  totalBudget?: number | null;
  globalTier?: BudgetTier;
}

export async function createAuthedPlan(
  supabase: AnyClient,
  args: CreateAuthedPlanArgs,
): Promise<BudgetUserPlanRow> {
  const payload = {
    user_id: args.userId,
    name: args.name ?? "My Wedding Budget",
    location_id: args.locationId ?? null,
    culture_id: args.cultureId ?? null,
    total_budget: args.totalBudget ?? null,
    global_tier: args.globalTier ?? "elevated",
  };
  const { data, error } = await supabase
    .from("budget_user_plans")
    .insert(payload)
    .select("*")
    .single();
  if (error) throw error;
  return data as BudgetUserPlanRow;
}

export interface UpdateAuthedPlanArgs {
  planId: string;
  userId: string;
  name?: string;
  locationId?: string | null;
  cultureId?: string | null;
  totalBudget?: number | null;
  globalTier?: BudgetTier;
}

export async function updateAuthedPlan(
  supabase: AnyClient,
  args: UpdateAuthedPlanArgs,
): Promise<BudgetUserPlanRow> {
  const payload: Record<string, unknown> = {
    last_viewed_at: new Date().toISOString(),
  };
  if (args.name !== undefined) payload.name = args.name;
  if (args.locationId !== undefined) payload.location_id = args.locationId;
  if (args.cultureId !== undefined) payload.culture_id = args.cultureId;
  if (args.totalBudget !== undefined) payload.total_budget = args.totalBudget;
  if (args.globalTier !== undefined) payload.global_tier = args.globalTier;

  const { data, error } = await supabase
    .from("budget_user_plans")
    .update(payload)
    .eq("id", args.planId)
    .eq("user_id", args.userId)
    .select("*")
    .single();
  if (error) throw error;
  return data as BudgetUserPlanRow;
}

// ── Anonymous reads / writes (RPC-backed) ─────────────────────────────────

export async function getAnonymousPlan(
  supabase: AnyClient,
  anonymousToken: string,
): Promise<BudgetUserPlanRow | null> {
  const { data, error } = await supabase.rpc("get_anonymous_budget_plan", {
    p_token: anonymousToken,
  });
  if (error) throw error;
  // Postgres functions returning a composite row arrive as a single object,
  // but the supabase client wraps them as either object or null.
  return (data as BudgetUserPlanRow | null) ?? null;
}

export interface CreateAnonymousPlanArgs {
  anonymousToken: string;
  name?: string;
  locationId?: string | null;
  cultureId?: string | null;
  totalBudget?: number | null;
  globalTier?: BudgetTier;
}

export async function createAnonymousPlan(
  supabase: AnyClient,
  args: CreateAnonymousPlanArgs,
): Promise<BudgetUserPlanRow> {
  const { data, error } = await supabase.rpc("create_anonymous_budget_plan", {
    p_token: args.anonymousToken,
    p_name: args.name ?? "My Wedding Budget",
    p_location_id: args.locationId ?? null,
    p_culture_id: args.cultureId ?? null,
    p_total_budget: args.totalBudget ?? null,
    p_global_tier: args.globalTier ?? "elevated",
  });
  if (error) throw error;
  return data as BudgetUserPlanRow;
}

export interface UpdateAnonymousPlanArgs {
  anonymousToken: string;
  name?: string;
  locationId?: string | null;
  cultureId?: string | null;
  totalBudget?: number | null;
  globalTier?: BudgetTier;
}

export async function updateAnonymousPlan(
  supabase: AnyClient,
  args: UpdateAnonymousPlanArgs,
): Promise<BudgetUserPlanRow> {
  const { data, error } = await supabase.rpc("update_anonymous_budget_plan", {
    p_token: args.anonymousToken,
    p_name: args.name ?? null,
    p_location_id: args.locationId ?? null,
    p_culture_id: args.cultureId ?? null,
    p_total_budget: args.totalBudget ?? null,
    p_global_tier: args.globalTier ?? null,
  });
  if (error) throw error;
  return data as BudgetUserPlanRow;
}

/**
 * Reclaim an anonymous plan into the calling user's account.
 *
 * Pass an `authedSupabase` client (server-client.createUserClient or browser
 * client AFTER signin) — the RPC reads `auth.uid()` from the session and
 * refuses if it's null. After this returns, drop the localStorage token
 * with `clearAnonymousToken()`.
 */
export async function reclaimAnonymousPlan(
  authedSupabase: AnyClient,
  anonymousToken: string,
): Promise<BudgetUserPlanRow> {
  const { data, error } = await authedSupabase.rpc("reclaim_anonymous_budget_plan", {
    p_token: anonymousToken,
  });
  if (error) throw error;
  return data as BudgetUserPlanRow;
}
