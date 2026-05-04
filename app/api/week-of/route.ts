import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";
import { listPublishedDiaries } from "@/lib/week-of/queries";

// GET /api/week-of — list of published "Week Of" diaries (summary projection,
// no per-day bodies). Used by the Real Weddings tab to render diary cards.
export async function GET() {
  const diaries = await listPublishedDiaries(supabase);
  return NextResponse.json({ diaries });
}
