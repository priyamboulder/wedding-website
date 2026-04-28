import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

// GET /api/vendors/shortlist?couple_id=...
export async function GET(req: NextRequest) {
  try {
    const coupleId = req.nextUrl.searchParams.get("couple_id");
    if (!coupleId) return NextResponse.json({ error: "couple_id required" }, { status: 400 });

    const { data, error } = await supabase
      .from("couple_shortlist")
      .select("*, vendors(*)")
      .eq("couple_id", coupleId)
      .order("saved_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ shortlist: data ?? [] });
  } catch (err) {
    console.error("[shortlist GET]", err);
    return NextResponse.json({ error: "Failed to fetch shortlist" }, { status: 500 });
  }
}

// POST /api/vendors/shortlist — add vendor to shortlist
export async function POST(req: NextRequest) {
  try {
    const { couple_id, vendor_id, notes } = await req.json();
    if (!couple_id || !vendor_id) {
      return NextResponse.json({ error: "couple_id and vendor_id required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("couple_shortlist")
      .upsert({ couple_id, vendor_id, notes: notes ?? "", saved_at: new Date().toISOString() })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ ok: true, item: data });
  } catch (err) {
    console.error("[shortlist POST]", err);
    return NextResponse.json({ error: "Failed to save vendor" }, { status: 500 });
  }
}

// DELETE /api/vendors/shortlist?couple_id=...&vendor_id=...
export async function DELETE(req: NextRequest) {
  try {
    const coupleId = req.nextUrl.searchParams.get("couple_id");
    const vendorId = req.nextUrl.searchParams.get("vendor_id");
    if (!coupleId || !vendorId) {
      return NextResponse.json({ error: "couple_id and vendor_id required" }, { status: 400 });
    }

    const { error } = await supabase
      .from("couple_shortlist")
      .delete()
      .eq("couple_id", coupleId)
      .eq("vendor_id", vendorId);

    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[shortlist DELETE]", err);
    return NextResponse.json({ error: "Failed to remove vendor" }, { status: 500 });
  }
}
