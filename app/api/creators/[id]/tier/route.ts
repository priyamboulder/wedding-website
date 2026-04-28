import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";
import type { CreatorTier } from "@/types/creator";
import { TIER_COMMISSION_RATE, TIER_PERKS } from "@/lib/creators/tier-evaluation";

const VALID_TIERS: CreatorTier[] = [
  "standard",
  "rising",
  "top_creator",
  "partner",
];

// GET /api/creators/[id]/tier
// Returns the creator's current tier and commission info from creators_state blob.

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const { data: row, error } = await supabase
      .from("creators_state")
      .select("data")
      .eq("couple_id", id)
      .maybeSingle();

    if (error) throw error;

    const blobData = (row?.data ?? {}) as Record<string, unknown>;
    const tier: CreatorTier =
      VALID_TIERS.includes(blobData.tier as CreatorTier)
        ? (blobData.tier as CreatorTier)
        : "standard";

    return NextResponse.json({
      creatorId: id,
      currentTier: tier,
      commissionRate: TIER_COMMISSION_RATE[tier],
      currentPerks: TIER_PERKS[tier],
    });
  } catch (err) {
    console.error("[creators/[id]/tier GET]", err);
    return NextResponse.json({ error: "Failed to fetch tier" }, { status: 500 });
  }
}

// POST /api/creators/[id]/tier
// Updates the creator's tier in the creators_state blob.

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (!body.tier || !VALID_TIERS.includes(body.tier as CreatorTier)) {
      return NextResponse.json(
        { error: `Tier must be one of ${VALID_TIERS.join(", ")}` },
        { status: 400 },
      );
    }

    const tier = body.tier as CreatorTier;

    const { data: row, error: fetchError } = await supabase
      .from("creators_state")
      .select("data")
      .eq("couple_id", id)
      .maybeSingle();

    if (fetchError) throw fetchError;

    const existing = (row?.data ?? {}) as Record<string, unknown>;
    const newData = { ...existing, tier, tier_updated_at: new Date().toISOString() };

    const { error: upsertError } = await supabase
      .from("creators_state")
      .upsert({ couple_id: id, data: newData, updated_at: new Date().toISOString() });

    if (upsertError) throw upsertError;

    return NextResponse.json({
      creatorId: id,
      tier,
      commissionRate: TIER_COMMISSION_RATE[tier],
      tierUpdatedAt: newData.tier_updated_at,
    });
  } catch (err) {
    console.error("[creators/[id]/tier POST]", err);
    return NextResponse.json({ error: "Failed to update tier" }, { status: 500 });
  }
}
