import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

// TODO: table not yet migrated — no normalized `creators` table exists.
// Creator profiles are stored as a JSONB blob in `creators_state`
// (couple_id PRIMARY KEY, data jsonb). The `couple_id` column holds the
// creator's user id.

// GET /api/creators/[id]
// Single creator profile + aggregate stats stored in the blob.

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const { data, error } = await supabase
      .from("creators_state")
      .select("couple_id, data")
      .eq("couple_id", id)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return NextResponse.json({ error: "Creator not found" }, { status: 404 });
    }

    const blob = (data.data ?? {}) as Record<string, unknown>;
    const creator = { creatorId: data.couple_id, ...blob };

    // Stats are embedded in the blob; surface them separately for callers
    // that expect the { creator, stats } shape.
    const stats = {
      collectionCount: Number(blob.collectionCount ?? 0),
      pickCount: Number(blob.pickCount ?? 0),
      activeExhibitions: Number(blob.activeExhibitions ?? 0),
    };

    return NextResponse.json({ creator, stats });
  } catch (err) {
    console.error("[creators/[id]]", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
