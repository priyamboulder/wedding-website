import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";
import { requireAuth } from "@/lib/supabase/auth-helpers";

// PUT /api/bookings/[id]/schedule
// Body: { scheduledAt: ISO string, meetingLink: string }
// Updates scheduled_at and meeting_link. Caller must be the creator on the booking.

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { user, response: authError } = await requireAuth(request);
  if (authError) return authError;

  const { id } = await params;

  let body: { scheduledAt?: string; meetingLink?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.scheduledAt || !body.meetingLink) {
    return NextResponse.json(
      { error: "scheduledAt and meetingLink are required" },
      { status: 400 },
    );
  }

  try {
    const now = new Date().toISOString();

    // Verify the caller is the creator on this booking
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

    const { data, error } = await supabase
      .from("bookings")
      .update({
        scheduled_at: body.scheduledAt,
        meeting_link: body.meetingLink,
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
      scheduledAt: data.scheduled_at,
      meetingLink: data.meeting_link,
      updatedAt: data.updated_at,
    });
  } catch (e) {
    console.error("PUT /api/bookings/[id]/schedule error:", e);
    return NextResponse.json({ error: "Failed to schedule booking" }, { status: 500 });
  }
}
