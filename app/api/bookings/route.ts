import { NextRequest, NextResponse } from "next/server";
import { getService } from "@/lib/creators/services-seed";
import { supabase } from "@/lib/supabase/client";
import { requireAuth } from "@/lib/supabase/auth-helpers";

// GET /api/bookings?role=couple&userId=... | role=creator&creatorId=...
export async function GET(request: NextRequest) {
  const { user, response: authError } = await requireAuth(request);
  if (authError) return authError;

  const { searchParams } = new URL(request.url);
  const role = searchParams.get("role");
  const userId = searchParams.get("userId");
  const creatorId = searchParams.get("creatorId");

  if (role === "couple" && !userId) {
    return NextResponse.json({ error: "userId required for role=couple" }, { status: 400 });
  }
  if (role === "creator" && !creatorId) {
    return NextResponse.json({ error: "creatorId required for role=creator" }, { status: 400 });
  }
  if (!role) {
    return NextResponse.json({ error: "role is required" }, { status: 400 });
  }

  // Enforce ownership: the authenticated user may only query their own bookings
  const requestedId = role === "couple" ? userId : creatorId;
  if (requestedId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const col = role === "couple" ? "couple_user_id" : "creator_id";
    const id = role === "couple" ? userId! : creatorId!;
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .eq(col, id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    const bookings = (data ?? []).map((b) => ({
      id: b.id,
      serviceId: b.service_id,
      creatorId: b.creator_id,
      coupleUserId: b.couple_user_id,
      status: b.status,
      scheduledAt: b.scheduled_at,
      meetingLink: b.meeting_link,
      pricePaid: b.price_paid,
      platformFee: b.platform_fee,
      creatorPayout: b.creator_payout,
      deliverableUrl: b.deliverable_url,
      coupleNote: b.couple_note,
      cancellationReason: b.cancellation_reason,
      createdAt: b.created_at,
      updatedAt: b.updated_at,
    }));

    return NextResponse.json({ bookings, total: bookings.length });
  } catch (e) {
    console.error("GET /api/bookings error:", e);
    return NextResponse.json({ bookings: [], total: 0 });
  }
}

// POST /api/bookings
// Body: { serviceId, coupleNote }  (coupleUserId is taken from the JWT — not body)
const PLATFORM_FEE_RATE = 0.2;

export async function POST(request: NextRequest) {
  const { user, response: authError } = await requireAuth(request);
  if (authError) return authError;

  let body: { serviceId?: string; coupleNote?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Always use the authenticated user's ID — never trust a client-supplied coupleUserId
  const coupleUserId = user.id;
  const { serviceId, coupleNote } = body;
  if (!serviceId || !coupleNote) {
    return NextResponse.json(
      { error: "serviceId and coupleNote are required" },
      { status: 400 },
    );
  }

  const service = getService(serviceId);
  if (!service) {
    return NextResponse.json({ error: "Service not found" }, { status: 404 });
  }
  if (!service.isActive) {
    return NextResponse.json({ error: "Service is no longer available" }, { status: 400 });
  }

  const platformFee = Math.round(service.price * PLATFORM_FEE_RATE);
  const now = new Date().toISOString();
  const row = {
    service_id: serviceId,
    creator_id: service.creatorId,
    couple_user_id: coupleUserId,
    status: "requested" as const,
    scheduled_at: null,
    meeting_link: null,
    price_paid: service.price,
    platform_fee: platformFee,
    creator_payout: service.price - platformFee,
    deliverable_url: null,
    couple_note: coupleNote,
    cancellation_reason: null,
    created_at: now,
    updated_at: now,
  };

  try {
    const { data, error } = await supabase.from("bookings").insert(row).select().single();
    if (error) throw error;

    // Note: booking-confirmed email is sent from the /[id]/confirm route
    // once the creator accepts. Creator email for new-inquiry notification
    // requires a profiles table lookup — skipped here until available.

    return NextResponse.json({
      booking: {
        id: data.id,
        serviceId: data.service_id,
        creatorId: data.creator_id,
        coupleUserId: data.couple_user_id,
        status: data.status,
        scheduledAt: data.scheduled_at,
        meetingLink: data.meeting_link,
        pricePaid: data.price_paid,
        platformFee: data.platform_fee,
        creatorPayout: data.creator_payout,
        deliverableUrl: data.deliverable_url,
        coupleNote: data.couple_note,
        cancellationReason: data.cancellation_reason,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      },
    });
  } catch (e) {
    console.error("POST /api/bookings error:", e);
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
  }
}
