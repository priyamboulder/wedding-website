// ──────────────────────────────────────────────────────────────────────────
// GET /api/tools/budget/vendors
//
// Returns the top-N ranked vendors for a given (category, location, tier)
// triple — used by the Budget builder's inline vendor preview. Anonymous
// callers OK; we route through the public anon Supabase client and the
// `get_ranked_vendors` RPC, which is RLS-aware.
//
// Query params:
//   category=<vendor_category_slug>   required
//   location=<budget_location_slug>   optional
//   tier=<essential|elevated|luxury|ultra>  optional
//   limit=<int>                       optional, defaults 3, capped at 12
// ──────────────────────────────────────────────────────────────────────────

import { NextResponse } from "next/server";

import { createAnonClient } from "@/lib/supabase/server-client";
import { getVendorsForCategory } from "@/lib/vendors/tools-queries";

export const runtime = "nodejs";
// The vendor surfacing data turns over slowly; cache for a short window so
// rapidly-toggling tier buttons don't hammer Supabase.
export const revalidate = 60;

const ALLOWED_TIERS = new Set(["essential", "elevated", "luxury", "ultra"]);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category")?.trim() ?? "";
  const location = searchParams.get("location")?.trim() ?? "";
  const tier = searchParams.get("tier")?.trim() ?? "";
  const limitRaw = searchParams.get("limit");
  const limit = Math.min(
    Math.max(Number.parseInt(limitRaw ?? "3", 10) || 3, 1),
    12,
  );

  if (!category) {
    return NextResponse.json(
      { error: "category is required" },
      { status: 400 },
    );
  }

  if (tier && !ALLOWED_TIERS.has(tier)) {
    return NextResponse.json(
      { error: "tier must be essential, elevated, luxury, or ultra" },
      { status: 400 },
    );
  }

  try {
    const supabase = createAnonClient();
    const vendors = await getVendorsForCategory(supabase, {
      categorySlug: category,
      locationSlug: location || undefined,
      tier: tier || undefined,
      limit,
    });
    return NextResponse.json({ vendors });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Vendor lookup failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
