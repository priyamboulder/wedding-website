import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

// POST /api/showcases/[id]/save
// Acknowledges a save/unsave action and returns the showcase's current
// baseline save count. The client adds its own +1 locally via the Zustand
// store; this endpoint is the future hook for server-side analytics and
// persisted save counts.

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    // Try by id first, then by slug
    const { data: byId } = await supabase
      .from("showcases")
      .select("id, base_save_count")
      .eq("id", id)
      .maybeSingle();

    const row = byId ?? await (async () => {
      const { data } = await supabase
        .from("showcases")
        .select("id, base_save_count")
        .eq("slug", id)
        .maybeSingle();
      return data;
    })();

    if (!row) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: row.id,
      baseSaveCount: row.base_save_count,
      note: "Save state is persisted client-side in localStorage.",
    });
  } catch (err) {
    console.error("[showcases/[id]/save]", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
