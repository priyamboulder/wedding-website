import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

// GET /api/showcases/featured
// Returns the editorially-featured showcase (is_featured flag or most-saved
// published showcase as fallback).

export async function GET() {
  try {
    // Try featured flag first
    const { data: featured, error: featuredError } = await supabase
      .from("showcases")
      .select("*")
      .eq("is_published", true)
      .eq("is_featured", true)
      .order("published_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!featuredError && featured) {
      return NextResponse.json({ showcase: featured });
    }

    // Fallback: most-saved published showcase
    const { data: fallback, error: fallbackError } = await supabase
      .from("showcases")
      .select("*")
      .eq("is_published", true)
      .order("base_save_count", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (fallbackError) throw fallbackError;

    return NextResponse.json({ showcase: fallback ?? null });
  } catch (err) {
    console.error("[showcases/featured]", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
