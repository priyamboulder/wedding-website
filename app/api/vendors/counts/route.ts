// GET /api/vendors/counts
// Returns live vendor counts per category from Supabase.
// Falls back gracefully when the vendors table is empty (returns seed counts).

import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

// Seed counts used as fallback when DB is not yet populated
const SEED_COUNTS: Record<string, number> = {
  "decor-design": 24,
  "catering-dining": 18,
  photography: 22,
  "mehndi-henna": 12,
  entertainment: 15,
  wardrobe: 20,
  stationery: 8,
  "hair-makeup": 19,
  "officiant-ceremony": 6,
  venue: 14,
};

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("vendors")
      .select("category");

    if (error) throw error;

    if (!data || data.length === 0) {
      return NextResponse.json({ counts: SEED_COUNTS, source: "seed" });
    }

    const counts: Record<string, number> = {};
    for (const row of data) {
      const cat = row.category as string;
      counts[cat] = (counts[cat] ?? 0) + 1;
    }

    return NextResponse.json({ counts, source: "live" });
  } catch {
    return NextResponse.json({ counts: SEED_COUNTS, source: "seed" });
  }
}
