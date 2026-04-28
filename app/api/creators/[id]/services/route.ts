import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

// GET /api/creators/[id]/services
// Returns services for a creator from the creators_state JSONB blob.

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const { data: row, error } = await supabase
      .from("creators_state")
      .select("data")
      .eq("couple_id", id)
      .maybeSingle();

    if (error) throw error;

    const services: unknown[] =
      (row?.data as Record<string, unknown>)?.services as unknown[] ?? [];

    return NextResponse.json({
      services,
      total: services.length,
      creatorId: id,
    });
  } catch (err) {
    console.error("[creators/[id]/services]", err);
    return NextResponse.json({ error: "Failed to fetch services" }, { status: 500 });
  }
}
