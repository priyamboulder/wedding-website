import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

// TODO: table not yet migrated — no normalized `drops` table exists.
// Drops are stored as a JSONB blob in `drops_state` (couple_id PRIMARY KEY,
// data jsonb). Active drops are those where startsAt <= now < endsAt.

// GET /api/drops/active
// Query params: ?couple_id=<id>

export async function GET(req: NextRequest) {
  const coupleId = req.nextUrl.searchParams.get("couple_id");

  try {
    if (!coupleId) {
      return NextResponse.json({ drops: [] });
    }

    const { data, error } = await supabase
      .from("drops_state")
      .select("data")
      .eq("couple_id", coupleId)
      .maybeSingle();

    if (error) throw error;

    const blob = data?.data as Record<string, unknown> | null;
    const allDrops = Array.isArray(blob?.drops) ? (blob.drops as Record<string, unknown>[]) : [];

    const now = Date.now();
    const active = allDrops.filter((d) => {
      const start = d.startsAt ? new Date(d.startsAt as string).getTime() : 0;
      const end = d.endsAt ? new Date(d.endsAt as string).getTime() : Infinity;
      return start <= now && now < end;
    });

    return NextResponse.json({ drops: active });
  } catch (err) {
    console.error("[drops/active]", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
