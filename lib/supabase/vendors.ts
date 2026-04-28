// ──────────────────────────────────────────────────────────────────────────
// Vendor query helpers (production target).
//
// The in-repo Vendors UI currently runs on Zustand + localStorage (see
// stores/vendors-store.ts). This file sketches the Supabase query surface the
// app will call once the backend is wired up. Keep it in sync with that
// store's action signatures so the swap is 1:1.
// ──────────────────────────────────────────────────────────────────────────

import type {
  Vendor,
  ShortlistEntry,
  TaskVendorLink,
  VendorLinkStatus,
} from "@/types/vendor";

// Placeholder for the Supabase client singleton. Wire up in lib/supabase/client.ts
// when Supabase is installed and env vars are configured.
type SupabaseClientLike = {
  from: (table: string) => {
    select: (cols: string) => Promise<{ data: unknown; error: unknown }>;
    insert: (rows: unknown) => Promise<{ data: unknown; error: unknown }>;
    update: (row: unknown) => { eq: (col: string, v: string) => Promise<{ error: unknown }> };
    delete: () => { eq: (col: string, v: string) => Promise<{ error: unknown }> };
  };
};

// ── Directory ──────────────────────────────────────────────────────────────

export async function listVendors(supabase: SupabaseClientLike): Promise<Vendor[]> {
  const { data, error } = await supabase
    .from("vendors")
    .select("*");
  if (error) throw error;
  return (data as Vendor[]) ?? [];
}

export async function insertVendors(
  supabase: SupabaseClientLike,
  vendors: Vendor[],
): Promise<void> {
  const { error } = await supabase.from("vendors").insert(vendors);
  if (error) throw error;
}

// ── Shortlist ──────────────────────────────────────────────────────────────

export async function addToShortlist(
  supabase: SupabaseClientLike,
  coupleId: string,
  vendorId: string,
): Promise<void> {
  const { error } = await supabase.from("couple_shortlist").insert({
    couple_id: coupleId,
    vendor_id: vendorId,
    saved_at: new Date().toISOString(),
  });
  if (error) throw error;
}

export async function removeFromShortlist(
  supabase: SupabaseClientLike,
  coupleId: string,
  vendorId: string,
): Promise<void> {
  const { error } = await supabase
    .from("couple_shortlist")
    .delete()
    .eq("vendor_id", vendorId);
  if (error) throw error;
}

export async function listShortlist(
  supabase: SupabaseClientLike,
  _coupleId: string,
): Promise<ShortlistEntry[]> {
  const { data, error } = await supabase
    .from("couple_shortlist")
    .select("*");
  if (error) throw error;
  return (data as ShortlistEntry[]) ?? [];
}

// ── Task-vendor links ──────────────────────────────────────────────────────

export async function linkVendorToTask(
  supabase: SupabaseClientLike,
  taskId: string,
  vendorId: string,
): Promise<void> {
  const { error } = await supabase.from("task_vendor_links").insert({
    task_id: taskId,
    vendor_id: vendorId,
    linked_at: new Date().toISOString(),
    status: "linked" as VendorLinkStatus,
  });
  if (error) throw error;
}

export async function unlinkVendorFromTask(
  supabase: SupabaseClientLike,
  taskId: string,
  vendorId: string,
): Promise<void> {
  const { error } = await supabase
    .from("task_vendor_links")
    .delete()
    .eq("task_id", taskId);
  if (error) throw error;
}

export async function setLinkStatus(
  supabase: SupabaseClientLike,
  taskId: string,
  vendorId: string,
  status: VendorLinkStatus,
): Promise<void> {
  const { error } = await supabase
    .from("task_vendor_links")
    .update({ status })
    .eq("task_id", taskId);
  if (error) throw error;
}

export async function listTaskLinks(
  supabase: SupabaseClientLike,
): Promise<TaskVendorLink[]> {
  const { data, error } = await supabase.from("task_vendor_links").select("*");
  if (error) throw error;
  return (data as TaskVendorLink[]) ?? [];
}
