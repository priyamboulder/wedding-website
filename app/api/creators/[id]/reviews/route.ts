import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

// GET /api/creators/[id]/reviews
// Returns reviews for a creator from the creators_state JSONB blob.

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

    const reviews: unknown[] = (row?.data as Record<string, unknown>)?.reviews as unknown[] ?? [];
    const averageRating =
      reviews.length === 0
        ? 0
        : (reviews as Array<{ rating?: number }>).reduce(
            (s, r) => s + (r.rating ?? 0),
            0,
          ) / reviews.length;

    return NextResponse.json({
      reviews,
      total: reviews.length,
      averageRating: Math.round(averageRating * 10) / 10,
    });
  } catch (err) {
    console.error("[creators/[id]/reviews]", err);
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}
