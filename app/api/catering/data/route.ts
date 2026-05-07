// GET /api/catering/data?couple_id=...
// Returns catering events and dishes from Supabase for the given couple.
// POST /api/catering/data  { couple_id, events, dishes, proposals }
// Upserts the couple's catering state into dedicated tables.

import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { supabase } from "@/lib/supabase/client";
import { requireAuth } from "@/lib/supabase/auth-helpers";

export async function GET(req: NextRequest) {
  const { user, response: authError } = await requireAuth(req);
  if (authError) return authError;

  const coupleId = req.headers.get("x-couple-id") ?? req.nextUrl.searchParams.get("couple_id");
  if (!coupleId) return NextResponse.json({ error: "couple_id required" }, { status: 400 });

  // Prevent IDOR: user may only access their own catering data
  if (coupleId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const [eventsRes, dishesRes, proposalsRes] = await Promise.all([
      supabase.from("catering_menu_events").select("*").eq("couple_id", coupleId),
      supabase.from("catering_dishes").select("*").eq("couple_id", coupleId),
      supabase.from("catering_proposals").select("*").eq("couple_id", coupleId),
    ]);

    return NextResponse.json({
      events: eventsRes.data ?? [],
      dishes: dishesRes.data ?? [],
      proposals: proposalsRes.data ?? [],
    });
  } catch (err: unknown) {
    Sentry.captureException(err);
    return NextResponse.json({ error: "Failed to fetch catering data" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { user, response: authError } = await requireAuth(req);
  if (authError) return authError;

  try {
    const { couple_id, events = [], dishes = [], proposals = [] } = await req.json();
    if (!couple_id) return NextResponse.json({ error: "couple_id required" }, { status: 400 });

    // Prevent IDOR: user may only write their own catering data
    if (couple_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const results = await Promise.allSettled([
      events.length > 0
        ? supabase.from("catering_menu_events").upsert(events.map((e: any) => ({ ...e, couple_id })), { onConflict: "id" })
        : Promise.resolve(),
      dishes.length > 0
        ? supabase.from("catering_dishes").upsert(dishes.map((d: any) => ({ ...d, couple_id })), { onConflict: "id" })
        : Promise.resolve(),
      proposals.length > 0
        ? supabase.from("catering_proposals").upsert(proposals.map((p: any) => ({ ...p, couple_id })), { onConflict: "id" })
        : Promise.resolve(),
    ]);

    const errors = results.filter((r) => r.status === "rejected").map((r: any) => r.reason?.message);
    if (errors.length > 0) {
      Sentry.captureException(new Error(`Catering upsert errors: ${errors.join(", ")}`));
      return NextResponse.json({ ok: false, errors }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    Sentry.captureException(err);
    return NextResponse.json({ error: "Failed to save catering data" }, { status: 500 });
  }
}
