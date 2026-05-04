// ──────────────────────────────────────────────────────────────────────────
// Marigold Tools hub — data access layer.
//
// Reads `tools_catalog` for the public discovery surface and writes
// `tool_waitlist` rows for "tell me when this drops" capture.
// ──────────────────────────────────────────────────────────────────────────

import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  JoinWaitlistArgs,
  ToolCatalogRow,
  ToolStatus,
  ToolWaitlistRow,
} from "@/types/tools";
export { FALLBACK_TOOLS_CATALOG, findFallbackTool } from "./fallback";

type AnyClient = SupabaseClient<any, any, any>;

export async function listToolsCatalog(
  supabase: AnyClient,
  status?: ToolStatus,
): Promise<ToolCatalogRow[]> {
  let query = supabase
    .from("tools_catalog")
    .select("*")
    .eq("active", true)
    .order("display_order", { ascending: true });
  if (status) query = query.eq("status", status);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as ToolCatalogRow[];
}

export async function getTool(
  supabase: AnyClient,
  slug: string,
): Promise<ToolCatalogRow | null> {
  const { data, error } = await supabase
    .from("tools_catalog")
    .select("*")
    .eq("slug", slug)
    .eq("active", true)
    .maybeSingle();
  if (error) throw error;
  return (data as ToolCatalogRow | null) ?? null;
}

const EMAIL_RX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
// Postgres unique_violation — a re-submission of the same email/tool pair.
const UNIQUE_VIOLATION = "23505";

/**
 * Inserts a waitlist row. Re-submissions of the same (tool_slug, email)
 * resolve quietly without surfacing an error — the user shouldn't see
 * "already on the list" treated as a failure.
 */
export async function joinToolWaitlist(
  supabase: AnyClient,
  args: JoinWaitlistArgs,
): Promise<{ ok: true; alreadySubscribed: boolean }> {
  const email = args.email.trim().toLowerCase();
  if (!EMAIL_RX.test(email)) {
    throw new Error("A valid email is required to join the waitlist.");
  }

  const { error } = await supabase.from("tool_waitlist").insert({
    tool_slug: args.toolSlug,
    email,
    source: args.source ?? "tools_hub",
  });

  if (error) {
    if (error.code === UNIQUE_VIOLATION) {
      return { ok: true, alreadySubscribed: true };
    }
    throw error;
  }
  return { ok: true, alreadySubscribed: false };
}

export type { ToolWaitlistRow };
