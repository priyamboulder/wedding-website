import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const { data: links, error: linkErr } = await supabase
      .from("product_showcase_links")
      .select("showcase_id")
      .eq("product_id", id);

    if (linkErr) throw linkErr;

    if (!links || links.length === 0) {
      return NextResponse.json({ showcases: [] });
    }

    const showcaseIds = links.map((l) => l.showcase_id);
    const { data: showcases, error: showcasesErr } = await supabase
      .from("showcases")
      .select("id, title, slug, vendor_id, cover_image, base_save_count")
      .in("id", showcaseIds)
      .eq("status", "published");

    if (showcasesErr) throw showcasesErr;

    return NextResponse.json({ showcases: showcases ?? [] });
  } catch (err) {
    console.error("[products/id/showcases]", err);
    return NextResponse.json({ error: "Failed to fetch showcases" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { showcase_id } = await req.json();
    if (!showcase_id) return NextResponse.json({ error: "showcase_id required" }, { status: 400 });

    const { error } = await supabase
      .from("product_showcase_links")
      .upsert({ product_id: id, showcase_id });

    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[products/id/showcases POST]", err);
    return NextResponse.json({ error: "Failed to link showcase" }, { status: 500 });
  }
}
