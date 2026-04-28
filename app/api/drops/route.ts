import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

// TODO: table not yet migrated — no normalized `drops` table exists.
// Drops are stored as a JSONB blob in `drops_state` (couple_id PRIMARY KEY,
// data jsonb). This route reads drops for a given couple_id from that blob.
// POST creates/updates the couple's drops blob.

// GET /api/drops
// Query params: ?couple_id=<id>
// Returns all drops stored in the couple's drops_state blob.

export async function GET(req: NextRequest) {
  const coupleId = req.nextUrl.searchParams.get("couple_id");

  try {
    if (coupleId) {
      const { data, error } = await supabase
        .from("drops_state")
        .select("data")
        .eq("couple_id", coupleId)
        .maybeSingle();

      if (error) throw error;

      const blob = data?.data as Record<string, unknown> | null;
      const drops = Array.isArray(blob?.drops) ? blob.drops : [];
      return NextResponse.json({ drops });
    }

    // No couple_id — return empty (drops are couple-scoped)
    return NextResponse.json({ drops: [] });
  } catch (err) {
    console.error("[drops]", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

// POST /api/drops
// Body: { couple_id, drop: {...} }
// Upserts the drops blob for the couple.

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { couple_id, drop } = body as { couple_id?: string; drop?: unknown };

    if (!couple_id || !drop) {
      return NextResponse.json(
        { error: "couple_id and drop are required" },
        { status: 400 },
      );
    }

    // Read existing blob
    const { data: existing } = await supabase
      .from("drops_state")
      .select("data")
      .eq("couple_id", couple_id)
      .maybeSingle();

    const blob = (existing?.data ?? {}) as Record<string, unknown>;
    const drops = Array.isArray(blob.drops) ? blob.drops : [];

    const newDrop = {
      id: `drop-${Date.now().toString(36)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...(drop as object),
    };
    drops.push(newDrop);

    const { error } = await supabase
      .from("drops_state")
      .upsert(
        { couple_id, data: { ...blob, drops }, updated_at: new Date().toISOString() },
        { onConflict: "couple_id" },
      );

    if (error) throw error;

    return NextResponse.json({ drop: newDrop }, { status: 201 });
  } catch (err) {
    console.error("[drops POST]", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
