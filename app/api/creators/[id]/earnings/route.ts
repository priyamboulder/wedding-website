import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";
import { requireAuth } from "@/lib/supabase/auth-helpers";

// GET /api/creators/[id]/earnings
// Returns total earnings from completed bookings for a creator.
// Caller must be the creator themselves.

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { user, response: authError } = await requireAuth(request);
  if (authError) return authError;

  try {
    const { id } = await params;

    // Prevent IDOR: a creator may only view their own earnings
    if (id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { data, error } = await supabase
      .from("bookings")
      .select("creator_payout, created_at, status")
      .eq("creator_id", id)
      .eq("status", "completed");

    if (error) throw error;

    const bookings = data ?? [];
    const total_earned_cents = bookings.reduce(
      (sum, b) => sum + (b.creator_payout ?? 0),
      0,
    );

    return NextResponse.json({
      total_earned_cents,
      booking_count: bookings.length,
      bookings,
    });
  } catch (err) {
    console.error("[creators/[id]/earnings]", err);
    return NextResponse.json({ error: "Failed to fetch earnings" }, { status: 500 });
  }
}
