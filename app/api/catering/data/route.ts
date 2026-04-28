// GET /api/catering/data?couple_id=...
// Returns catering events and dishes from Supabase for the given couple.
// POST /api/catering/data  { couple_id, events, dishes, proposals }
// Upserts the couple's catering state into dedicated tables.

import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

export async function GET(req: NextRequest) {
  const coupleId = req.headers.get("x-couple-id") ?? req.nextUrl.searchParams.get("couple_id");
  if (!coupleId) return NextResponse.json({ error: "couple_id required" }, { status: 400 });

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
  } catch (err: any) {
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { couple_id, events = [], dishes = [], proposals = [] } = await req.json();
    if (!couple_id) return NextResponse.json({ error: "couple_id required" }, { status: 400 });

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
    if (errors.length > 0) return NextResponse.json({ ok: false, errors }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}
