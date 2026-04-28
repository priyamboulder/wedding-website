import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

// TODO: table not yet migrated — no normalized `drops` table exists.
// Drops are stored as a JSONB blob in `drops_state` (couple_id PRIMARY KEY,
// data jsonb). Individual drops are found by scanning each couple's blob.

// GET /api/drops/[id]
// Looks up a drop by id or slug. Requires ?couple_id= to scope the search.
// PUT /api/drops/[id]
// Updates a drop in the couple's blob (only allowed when status=scheduled).

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const coupleId = req.nextUrl.searchParams.get("couple_id");

  try {
    if (!coupleId) {
      return NextResponse.json(
        { error: "couple_id query param required" },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from("drops_state")
      .select("data")
      .eq("couple_id", coupleId)
      .maybeSingle();

    if (error) throw error;

    const blob = data?.data as Record<string, unknown> | null;
    const allDrops = Array.isArray(blob?.drops) ? (blob.drops as Record<string, unknown>[]) : [];

    const drop = allDrops.find((d) => d.id === id || d.slug === id);
    if (!drop) {
      return NextResponse.json({ error: "Drop not found" }, { status: 404 });
    }

    return NextResponse.json({ drop });
  } catch (err) {
    console.error("[drops/[id] GET]", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const coupleId = req.nextUrl.searchParams.get("couple_id");

  try {
    if (!coupleId) {
      return NextResponse.json(
        { error: "couple_id query param required" },
        { status: 400 },
      );
    }

    const { data: existing, error: readError } = await supabase
      .from("drops_state")
      .select("data")
      .eq("couple_id", coupleId)
      .maybeSingle();

    if (readError) throw readError;

    const blob = (existing?.data ?? {}) as Record<string, unknown>;
    const allDrops = Array.isArray(blob.drops) ? (blob.drops as Record<string, unknown>[]) : [];

    const idx = allDrops.findIndex((d) => d.id === id || d.slug === id);
    if (idx === -1) {
      return NextResponse.json({ error: "Drop not found" }, { status: 404 });
    }

    const drop = allDrops[idx];
    if (drop.status !== "scheduled") {
      return NextResponse.json(
        {
          error: `Cannot edit a drop in status: ${String(drop.status)}. Only scheduled drops are editable.`,
        },
        { status: 409 },
      );
    }

    const body = await req.json().catch(() => ({}));
    const updated = { ...drop, ...body, updatedAt: new Date().toISOString() };
    allDrops[idx] = updated;

    const { error: writeError } = await supabase
      .from("drops_state")
      .upsert(
        { couple_id: coupleId, data: { ...blob, drops: allDrops }, updated_at: new Date().toISOString() },
        { onConflict: "couple_id" },
      );

    if (writeError) throw writeError;

    return NextResponse.json({ drop: updated });
  } catch (err) {
    console.error("[drops/[id] PUT]", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
