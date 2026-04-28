import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // Get guides this product is featured in
    const { data: links, error: linkErr } = await supabase
      .from("product_guide_links")
      .select("guide_id")
      .eq("product_id", id);

    if (linkErr) throw linkErr;

    if (!links || links.length === 0) {
      return NextResponse.json({ guides: [] });
    }

    const guideIds = links.map((l) => l.guide_id);
    const { data: guides, error: guidesErr } = await supabase
      .from("guides")
      .select("id, title, slug, category, cover_image, published_at")
      .in("id", guideIds)
      .eq("status", "published");

    if (guidesErr) throw guidesErr;

    return NextResponse.json({ guides: guides ?? [] });
  } catch (err) {
    console.error("[products/id/featured-in]", err);
    return NextResponse.json({ error: "Failed to fetch guides" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { guide_id } = await req.json();
    if (!guide_id) return NextResponse.json({ error: "guide_id required" }, { status: 400 });

    const { error } = await supabase
      .from("product_guide_links")
      .upsert({ product_id: id, guide_id });

    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[products/id/featured-in POST]", err);
    return NextResponse.json({ error: "Failed to link guide" }, { status: 500 });
  }
}
