import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";
import { requireAuth } from "@/lib/supabase/auth-helpers";

// POST /api/bookings/[id]/review
// Body: { rating: 1..5, reviewText: string, coupleDisplayInitials: string }
// coupleUserId is taken from the authenticated JWT — not from the request body.
//
// No dedicated booking_reviews table exists in the DB schema (migration 0009).
// Reviews are stored in vendor_reviews_state as a JSONB map keyed by bookingId
// under the couple's row.
//
// vendor_reviews_state schema: { couple_id text PK, data jsonb, updated_at timestamptz }
// data shape stored: { [bookingId]: { id, bookingId, rating, reviewText, coupleDisplayInitials, creatorId, createdAt } }

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { user, response: authError } = await requireAuth(request);
  if (authError) return authError;

  const { id } = await params;

  let body: {
    rating?: number;
    reviewText?: string;
    coupleDisplayInitials?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (typeof body.rating !== "number" || body.rating < 1 || body.rating > 5) {
    return NextResponse.json(
      { error: "rating must be an integer between 1 and 5" },
      { status: 400 },
    );
  }
  if (!body.reviewText || !body.coupleDisplayInitials) {
    return NextResponse.json(
      { error: "reviewText and coupleDisplayInitials are required" },
      { status: 400 },
    );
  }

  // coupleUserId comes from the JWT — never from the request body
  const coupleUserId = user.id;

  try {
    // Fetch the booking to verify ownership and get creatorId
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select("id, creator_id, couple_user_id")
      .eq("id", id)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Only the couple who made this booking may leave a review
    if (booking.couple_user_id !== coupleUserId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const reviewId = `rv-${crypto.randomUUID()}`;
    const now = new Date().toISOString();

    const review = {
      id: reviewId,
      bookingId: id,
      coupleUserId,
      coupleDisplayInitials: body.coupleDisplayInitials,
      creatorId: booking.creator_id,
      rating: Math.round(body.rating),
      reviewText: body.reviewText,
      createdAt: now,
    };

    // Fetch existing data for this couple, then merge
    const { data: existing } = await supabase
      .from("vendor_reviews_state")
      .select("data")
      .eq("couple_id", coupleUserId)
      .maybeSingle();

    const existingData: Record<string, unknown> =
      (existing?.data as Record<string, unknown>) ?? {};

    const newData = { ...existingData, [id]: review };

    const { error: upsertError } = await supabase
      .from("vendor_reviews_state")
      .upsert(
        { couple_id: coupleUserId, data: newData, updated_at: now },
        { onConflict: "couple_id" },
      );

    if (upsertError) throw upsertError;

    return NextResponse.json({ review });
  } catch (e) {
    console.error("POST /api/bookings/[id]/review error:", e);
    return NextResponse.json({ error: "Failed to save review" }, { status: 500 });
  }
}
