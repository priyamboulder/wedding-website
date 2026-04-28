import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";
import { requireAuth } from "@/lib/supabase/auth-helpers";

// PUT /api/bookings/[id]/complete
// Body: { deliverableUrl?: string | null }
// Creator marks a booking as delivered. Caller must be the creator on the booking.

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { user, response: authError } = await requireAuth(request);
  if (authError) return authError;

  const { id } = await params;

  let body: { deliverableUrl?: string | null } = {};
  try {
    body = await request.json();
  } catch {
    // body is optional — swallow parse errors
  }

  try {
    const now = new Date().toISOString();

    // Verify ownership: only the creator on this booking may mark it complete
    const { data: booking, error: fetchError } = await supabase
      .from("bookings")
      .select("id, creator_id")
      .eq("id", id)
      .single();

    if (fetchError || !booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (booking.creator_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updatePayload: Record<string, unknown> = {
      status: "completed",
      updated_at: now,
    };
    // Only set deliverable_url if explicitly provided (null or a value)
    if ("deliverableUrl" in body) {
      updatePayload.deliverable_url = body.deliverableUrl ?? null;
    }

    const { data, error } = await supabase
      .from("bookings")
      .update(updatePayload)
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
      deliverableUrl: data.deliverable_url,
      updatedAt: data.updated_at,
    });
  } catch (e) {
    console.error("PUT /api/bookings/[id]/complete error:", e);
    return NextResponse.json({ error: "Failed to complete booking" }, { status: 500 });
  }
}
