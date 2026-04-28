import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

// GET /api/creators/[id]/shoutouts
// Returns shoutouts for a creator from the creators_state JSONB blob.

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

    const shoutouts: unknown[] =
      (row?.data as Record<string, unknown>)?.shoutouts as unknown[] ?? [];

    return NextResponse.json({
      shoutouts,
      total: shoutouts.length,
    });
  } catch (err) {
    console.error("[creators/[id]/shoutouts]", err);
    return NextResponse.json({ error: "Failed to fetch shoutouts" }, { status: 500 });
  }
}
