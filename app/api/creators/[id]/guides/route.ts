import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

// GET /api/creators/[id]/guides
// All published guides for a creator. Queries the guides table by creator_id.

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const { data, error } = await supabase
      .from("guides")
      .select("*")
      .eq("creator_id", id)
      .eq("is_published", true)
      .order("published_at", { ascending: false });

    if (error) throw error;

    const guides = data ?? [];
    return NextResponse.json({
      creatorId: id,
      guides,
      total: guides.length,
    });
  } catch (err) {
    console.error("[creators/[id]/guides]", err);
    return NextResponse.json({ error: "Failed to fetch guides" }, { status: 500 });
  }
}
