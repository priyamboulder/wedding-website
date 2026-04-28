import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const includeUnpublished = req.nextUrl.searchParams.get("all") === "true";

    let query = supabase
      .from("creator_collections")
      .select("*, collection_items(count)")
      .eq("creator_id", id)
      .order("created_at", { ascending: false });

    if (!includeUnpublished) {
      query = query.eq("is_published", true);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ collections: data ?? [] });
  } catch (err) {
    console.error("[creators/id/collections]", err);
    return NextResponse.json({ error: "Failed to fetch collections" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { title, description, cover_image } = await req.json();

    if (!title) {
      return NextResponse.json({ error: "title is required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("creator_collections")
      .insert({
        creator_id: id,
        title,
        description: description ?? "",
        cover_image: cover_image ?? "",
        is_published: false,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ ok: true, collection: data }, { status: 201 });
  } catch (err) {
    console.error("[creators/id/collections POST]", err);
    return NextResponse.json({ error: "Failed to create collection" }, { status: 500 });
  }
}
