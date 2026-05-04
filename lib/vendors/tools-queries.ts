// ──────────────────────────────────────────────────────────────────────────
// Marigold Tools — vendor surfacing data access layer.
//
// One module that every Tool calls. If you find yourself writing
// `supabase.from("vendors").select(...)` inside a tool, stop and add a
// function here instead — that's how this layer pays for itself.
//
// All queries hit the canonical surfacing layer from migration 0021:
//   • get_ranked_vendors() — ordered by sponsored → featured → verified
//   • vendors / vendor_categories / vendor_category_assignments / placements
//   • vendor_inquiries (lead capture)
//
// RLS is on; reads work with the anon client. Inquiries can be inserted
// anonymously when an `email` is provided.
// ──────────────────────────────────────────────────────────────────────────

import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  CreateInquiryArgs,
  RankedVendor,
  ToolsVendorRow,
  VendorCategoryRow,
  VendorInquiryRow,
  VendorPricingIndicatorRow,
  VendorsForCategoryArgs,
  VendorsForLocationArgs,
} from "@/types/vendors";

type AnyClient = SupabaseClient<any, any, any>;

const VENDOR_SURFACE_COLUMNS = [
  "id",
  "slug",
  "name",
  "tagline",
  "bio",
  "hero_image_url",
  "gallery_image_urls",
  "website_url",
  "instagram_handle",
  "email",
  "phone",
  "home_base_city",
  "home_base_country",
  "travels_globally",
  "destinations_served",
  "tier_match",
  "capacity_min",
  "capacity_max",
  "placement_tier",
  "placement_expires_at",
  "active",
  "verified",
  "created_at",
  "updated_at",
].join(",");

// ── Categories ────────────────────────────────────────────────────────────

export async function listVendorCategories(
  supabase: AnyClient,
): Promise<VendorCategoryRow[]> {
  const { data, error } = await supabase
    .from("vendor_categories")
    .select("*")
    .eq("active", true)
    .order("display_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as VendorCategoryRow[];
}

// ── Ranked vendor queries ────────────────────────────────────────────────

export async function getVendorsForCategory(
  supabase: AnyClient,
  args: VendorsForCategoryArgs,
): Promise<RankedVendor[]> {
  const { data, error } = await supabase.rpc("get_ranked_vendors", {
    p_category_slug: args.categorySlug,
    p_location_slug: args.locationSlug ?? null,
    p_tier: args.tier ?? null,
    p_capacity: args.capacity ?? null,
    p_limit: args.limit ?? 24,
  });
  if (error) throw error;
  return (data ?? []) as RankedVendor[];
}

export async function getVendorsForLocation(
  supabase: AnyClient,
  args: VendorsForLocationArgs,
): Promise<RankedVendor[]> {
  const { data, error } = await supabase.rpc("get_ranked_vendors", {
    p_category_slug: args.categorySlug ?? null,
    p_location_slug: args.locationSlug,
    p_tier: args.tier ?? null,
    p_capacity: args.capacity ?? null,
    p_limit: args.limit ?? 24,
  });
  if (error) throw error;
  return (data ?? []) as RankedVendor[];
}

// ── Vendor detail ─────────────────────────────────────────────────────────

export async function getVendor(
  supabase: AnyClient,
  slug: string,
): Promise<ToolsVendorRow | null> {
  const { data, error } = await supabase
    .from("vendors")
    .select(VENDOR_SURFACE_COLUMNS)
    .eq("slug", slug)
    .eq("active", true)
    .maybeSingle();
  if (error) throw error;
  return (data as ToolsVendorRow | null) ?? null;
}

export async function getVendorCategories(
  supabase: AnyClient,
  vendorId: string,
): Promise<VendorCategoryRow[]> {
  const { data, error } = await supabase
    .from("vendor_category_assignments")
    .select("category:vendor_categories!inner(*)")
    .eq("vendor_id", vendorId);
  if (error) throw error;
  // PostgREST types embedded relations as arrays even when 1:1; the runtime
  // shape is a single object per row so we route through unknown.
  type Row = { category: VendorCategoryRow };
  return ((data ?? []) as unknown as Row[]).map((row) => row.category);
}

export async function getVendorPricingIndicators(
  supabase: AnyClient,
  vendorId: string,
): Promise<VendorPricingIndicatorRow[]> {
  const { data, error } = await supabase
    .from("vendor_pricing_indicators")
    .select("*")
    .eq("vendor_id", vendorId);
  if (error) throw error;
  return (data ?? []) as VendorPricingIndicatorRow[];
}

// ── Inquiries (lead capture) ──────────────────────────────────────────────
//
// `userId` should be passed from the server route after reading the auth
// cookie — never trust a userId from the browser. For anonymous flows,
// pass `email` only and leave `userId` undefined.

export async function createInquiry(
  supabase: AnyClient,
  args: CreateInquiryArgs,
): Promise<VendorInquiryRow> {
  if (!args.userId && !args.email) {
    throw new Error("createInquiry requires either userId or email");
  }
  const payload = {
    vendor_id: args.vendorId,
    user_id: args.userId ?? null,
    anonymous_email: args.userId ? null : args.email ?? null,
    source_tool: args.sourceTool,
    source_context: args.context ?? {},
  };
  const { data, error } = await supabase
    .from("vendor_inquiries")
    .insert(payload)
    .select("*")
    .single();
  if (error) throw error;
  return data as VendorInquiryRow;
}
