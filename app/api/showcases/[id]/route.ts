import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

// GET /api/showcases/[id]
// Accepts either the showcase uuid or its slug.
// Returns the full showcase document.

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    // Try by id first, then by slug
    const { data: byId, error: idError } = await supabase
      .from("showcases")
      .select("*")
      .eq("id", id)
      .eq("is_published", true)
      .maybeSingle();

    if (!idError && byId) {
      return NextResponse.json({ showcase: byId });
    }

    const { data: bySlug, error: slugError } = await supabase
      .from("showcases")
      .select("*")
      .eq("slug", id)
      .eq("is_published", true)
      .maybeSingle();

    if (slugError) throw slugError;

    if (!bySlug) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ showcase: bySlug });
  } catch (err) {
    console.error("[showcases/[id]]", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
