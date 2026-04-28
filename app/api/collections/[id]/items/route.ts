import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const limit = parseInt(req.nextUrl.searchParams.get("limit") ?? "20");
    const offset = parseInt(req.nextUrl.searchParams.get("offset") ?? "0");

    // Verify collection exists
    const { data: collection, error: colErr } = await supabase
      .from("creator_collections")
      .select("id, title, creator_id, is_published")
      .eq("id", id)
      .single();

    if (colErr || !collection) {
      return NextResponse.json({ error: "Collection not found" }, { status: 404 });
    }

    const { data: items, error, count } = await supabase
      .from("collection_items")
      .select("*", { count: "exact" })
      .eq("collection_id", id)
      .eq("is_available", true)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return NextResponse.json({
      collection,
      items: items ?? [],
      total: count ?? 0,
      hasMore: (count ?? 0) > offset + limit,
    });
  } catch (err) {
    console.error("[collections/id/items]", err);
    return NextResponse.json({ error: "Failed to fetch collection items" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { title, description, price_cents, currency, images, category, tags, creator_id } = body;

    if (!title || !creator_id) {
      return NextResponse.json({ error: "title and creator_id are required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("collection_items")
      .insert({
        collection_id: id,
        creator_id,
        title,
        description: description ?? "",
        price_cents: price_cents ?? 0,
        currency: currency ?? "INR",
        images: images ?? [],
        category: category ?? "",
        tags: tags ?? [],
      })
      .select()
      .single();

    if (error) throw error;

    // Update item_count on the collection (best-effort)
    try { await supabase.rpc("increment_collection_item_count", { collection_id: id }); } catch { /* ignore */ }

    return NextResponse.json({ ok: true, item: data }, { status: 201 });
  } catch (err) {
    console.error("[collections/id/items POST]", err);
    return NextResponse.json({ error: "Failed to add item" }, { status: 500 });
  }
}
