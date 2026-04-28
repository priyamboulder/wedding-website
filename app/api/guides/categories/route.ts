import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

// GET /api/guides/categories
// Returns the distinct categories present in the guides table with per-category
// guide counts, so the listing page can render filter chips with badge counts.

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("guides")
      .select("category")
      .eq("is_published", true);

    if (error) throw error;

    // Tally counts per category
    const counts: Record<string, number> = {};
    for (const row of data ?? []) {
      if (row.category) {
        counts[row.category] = (counts[row.category] ?? 0) + 1;
      }
    }

    const categories = Object.entries(counts).map(([category, count]) => ({
      category,
      count,
    }));

    return NextResponse.json({ categories });
  } catch (err) {
    console.error("[guides/categories]", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
