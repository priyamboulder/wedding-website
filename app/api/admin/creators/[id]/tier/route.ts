import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";
import { requireAuth, hasRole } from "@/lib/supabase/auth-helpers";
import type { CreatorTier } from "@/types/creator";
import { TIER_COMMISSION_RATE } from "@/lib/creators/tier-evaluation";

const VALID_TIERS: CreatorTier[] = [
  "standard",
  "rising",
  "top_creator",
  "partner",
];

// POST /api/admin/creators/[id]/tier
// Admin-only: manually sets a creator's tier in the creators_state JSONB blob.
// Intended for the Partner tier (invitation-only) and for manual overrides.

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { user, response: authError } = await requireAuth(request);
  if (authError) return authError;
  if (!hasRole(user, "admin")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { id } = await params;
    let body: { tier?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    if (!body.tier || !VALID_TIERS.includes(body.tier as CreatorTier)) {
      return NextResponse.json(
        { error: `Tier must be one of ${VALID_TIERS.join(", ")}` },
        { status: 400 },
      );
    }

    const tier = body.tier as CreatorTier;
    const tierUpdatedAt = new Date().toISOString();

    const { data: row, error: fetchError } = await supabase
      .from("creators_state")
      .select("data")
      .eq("couple_id", id)
      .maybeSingle();

    if (fetchError) throw fetchError;

    const existing = (row?.data ?? {}) as Record<string, unknown>;
    const newData = { ...existing, tier, tier_updated_at: tierUpdatedAt };

    const { error: upsertError } = await supabase
      .from("creators_state")
      .upsert({ couple_id: id, data: newData, updated_at: tierUpdatedAt });

    if (upsertError) throw upsertError;

    return NextResponse.json({
      creatorId: id,
      tier,
      commissionRate: TIER_COMMISSION_RATE[tier],
      tierUpdatedAt,
    });
  } catch (err) {
    console.error("[admin/creators/[id]/tier]", err);
    return NextResponse.json({ error: "Failed to update tier" }, { status: 500 });
  }
}
