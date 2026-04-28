import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";
import { requireAuth } from "@/lib/supabase/auth-helpers";

// PUT /api/bookings/[id]/cancel
// Body: { reason: string }
// Updates booking status to "cancelled" and stores the cancellation_reason.
// Caller must be the couple or creator on the booking.

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { user, response: authError } = await requireAuth(request);
  if (authError) return authError;

  const { id } = await params;

  let body: { reason?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.reason) {
    return NextResponse.json(
      { error: "Cancellation reason is required" },
      { status: 400 },
    );
  }

  try {
    const now = new Date().toISOString();

    // Verify ownership: caller must be the couple or creator on this booking
    const { data: booking, error: fetchError } = await supabase
      .from("bookings")
      .select("id, couple_user_id, creator_id")
      .eq("id", id)
      .single();

    if (fetchError || !booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (booking.couple_user_id !== user.id && booking.creator_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { data, error } = await supabase
      .from("bookings")
      .update({
        status: "cancelled",
        cancellation_reason: body.reason,
        updated_at: now,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    if (!data) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    return NextResponse.json({
      bookingId: data.id,
      status: data.status,
      cancellationReason: data.cancellation_reason,
      updatedAt: data.updated_at,
    });
  } catch (e) {
    console.error("PUT /api/bookings/[id]/cancel error:", e);
    return NextResponse.json({ error: "Failed to cancel booking" }, { status: 500 });
  }
}
