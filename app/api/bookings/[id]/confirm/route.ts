import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";
import { requireAuth } from "@/lib/supabase/auth-helpers";
import { sendEmail, bookingConfirmedEmail } from "@/lib/email";

// PUT /api/bookings/[id]/confirm
// Creator-side confirmation. Updates booking status to "confirmed" in DB
// and sends a confirmation email to the couple.

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { user, response: authError } = await requireAuth(request);
  if (authError) return authError;

  const { id } = await params;

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
      .update({ status: "confirmed", updated_at: now })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    if (!data) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Fire-and-forget email to couple
    // couple_user_id is a Supabase auth UID — look up email via admin API
    supabase.auth.admin
      .getUserById(data.couple_user_id)
      .then(({ data: userData }) => {
        const coupleEmail = userData?.user?.email;
        if (!coupleEmail) return;
        const dashboardLink = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/app/bookings`;
        return sendEmail({
          to: coupleEmail,
          ...bookingConfirmedEmail({
            coupleName: coupleEmail, // best we have without a profiles lookup
            vendorName: data.creator_id,
            vendorCategory: data.service_id,
            eventDate: data.scheduled_at ?? "TBD",
            dashboardLink,
          }),
        });
      })
      .catch(() => {}); // intentional — email is non-critical

    return NextResponse.json({
      bookingId: data.id,
      status: data.status,
      updatedAt: data.updated_at,
    });
  } catch (e) {
    console.error("PUT /api/bookings/[id]/confirm error:", e);
    return NextResponse.json({ error: "Failed to confirm booking" }, { status: 500 });
  }
}
