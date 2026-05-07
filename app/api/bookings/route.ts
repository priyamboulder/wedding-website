import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { supabase } from "@/lib/supabase/client";
import { requireAuth } from "@/lib/supabase/auth-helpers";
import { z } from "zod";

const CreateBookingSchema = z.object({
  serviceId: z.string().uuid("serviceId must be a valid UUID"),
  coupleNote: z.string().min(1, "coupleNote is required").max(2000),
});

// GET /api/bookings?role=couple&userId=... | role=creator&creatorId=...
export async function GET(request: NextRequest) {
  const { user, response: authError } = await requireAuth(request);
  if (authError) return authError;

  const { searchParams } = new URL(request.url);
  const role = searchParams.get("role");
  const userId = searchParams.get("userId");
  const creatorId = searchParams.get("creatorId");

  if (!role) return NextResponse.json({ error: "role is required" }, { status: 400 });
  if (role === "couple" && !userId)
    return NextResponse.json({ error: "userId required for role=couple" }, { status: 400 });
  if (role === "creator" && !creatorId)
    return NextResponse.json({ error: "creatorId required for role=creator" }, { status: 400 });

  const requestedId = role === "couple" ? userId : creatorId;
  if (requestedId !== user.id)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

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
    Sentry.captureException(e);
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
  }
}

const PLATFORM_FEE_RATE = 0.2;

export async function POST(request: NextRequest) {
  const { user, response: authError } = await requireAuth(request);
  if (authError) return authError;

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = CreateBookingSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 422 },
    );
  }

  const { serviceId, coupleNote } = parsed.data;

  // Look up the service from DB (creator_services table)
  const { data: service, error: svcErr } = await supabase
    .from("creator_services")
    .select("id, creator_id, price, is_active, title")
    .eq("id", serviceId)
    .maybeSingle();

  if (svcErr) {
    console.error("creator_services lookup:", svcErr);
    return NextResponse.json({ error: "Failed to look up service" }, { status: 500 });
  }

  if (!service) return NextResponse.json({ error: "Service not found" }, { status: 404 });
  if (!service.is_active)
    return NextResponse.json({ error: "Service is no longer available" }, { status: 400 });

  const platformFee = Math.round(service.price * PLATFORM_FEE_RATE);
  const now = new Date().toISOString();

  try {
    const { data, error } = await supabase
      .from("bookings")
      .insert({
        service_id: serviceId,
        creator_id: service.creator_id,
        couple_user_id: user.id,
        status: "requested",
        price_paid: service.price,
        platform_fee: platformFee,
        creator_payout: service.price - platformFee,
        couple_note: coupleNote,
        created_at: now,
        updated_at: now,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      booking: {
        id: data.id,
        serviceId: data.service_id,
        creatorId: data.creator_id,
        coupleUserId: data.couple_user_id,
        status: data.status,
        pricePaid: data.price_paid,
        platformFee: data.platform_fee,
        creatorPayout: data.creator_payout,
        coupleNote: data.couple_note,
        createdAt: data.created_at,
      },
    });
  } catch (e) {
    Sentry.captureException(e);
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
  }
}
