import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

// GET /api/guides/[id]
// Accepts either the guide uuid or its slug.
// Returns the full guide document with content_json.

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    // Try by id first, then by slug
    const { data: byId, error: idError } = await supabase
      .from("guides")
      .select("*")
      .eq("id", id)
      .eq("is_published", true)
      .maybeSingle();

    if (!idError && byId) {
      return NextResponse.json({ guide: byId });
    }

    const { data: bySlug, error: slugError } = await supabase
      .from("guides")
      .select("*")
      .eq("slug", id)
      .eq("is_published", true)
      .maybeSingle();

    if (slugError) throw slugError;

    if (!bySlug) {
      return NextResponse.json({ error: "Guide not found" }, { status: 404 });
    }

    return NextResponse.json({ guide: bySlug });
  } catch (err) {
    console.error("[guides/[id]]", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
