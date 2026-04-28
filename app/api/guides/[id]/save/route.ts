import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

// POST /api/guides/[id]/save
// Acknowledges a save/unsave action and returns the guide's current baseline
// save count. Persistence is localStorage on the client (guides-store.ts);
// this route is the future hook for server-side analytics and persisted counts.

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    // Try by id first, then by slug
    const { data: byId } = await supabase
      .from("guides")
      .select("id, base_save_count")
      .eq("id", id)
      .maybeSingle();

    const row = byId ?? await (async () => {
      const { data } = await supabase
        .from("guides")
        .select("id, base_save_count")
        .eq("slug", id)
        .maybeSingle();
      return data;
    })();

    if (!row) {
      return NextResponse.json({ error: "Guide not found" }, { status: 404 });
    }

    const body = await req.json().catch(() => ({}));
    const action: "save" | "unsave" = body?.action === "unsave" ? "unsave" : "save";

    return NextResponse.json({
      accepted: true,
      guideId: row.id,
      action,
      saveCount: row.base_save_count + (action === "save" ? 1 : 0),
    });
  } catch (err) {
    console.error("[guides/[id]/save]", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
