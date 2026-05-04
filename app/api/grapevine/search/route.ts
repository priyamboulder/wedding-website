import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";
import { searchAcrossArchives } from "@/lib/grapevine-ama/queries";

// GET /api/grapevine/search?q=...
// Cross-archive Q&A search powered by the question.search_vector GIN
// index (questions weight A, joined answer weight B).
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const q = url.searchParams.get("q") ?? "";
  if (q.trim().length === 0) {
    return NextResponse.json({ hits: [] });
  }
  const hits = await searchAcrossArchives(supabase, q);
  return NextResponse.json({ hits });
}
