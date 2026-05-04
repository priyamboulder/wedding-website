import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";
import { getVoteCounts } from "@/lib/polls/queries";
import {
  hasVendorCategoryPolls,
  pickVendorCategoryPollQuestion,
} from "@/lib/polls/vendor-category-polls";

// GET /api/polls/for-vendor-category?label=Photography
//
// Picks one of the curated polls for the given /vendors-directory filter
// label and returns the poll row plus its current vote counts so the
// client can render results immediately if the visitor has already
// voted. Returns 204 (no body) when the label has no polls mapped — the
// client treats that as "don't show the card".
export async function GET(request: NextRequest) {
  const label = request.nextUrl.searchParams.get("label");
  if (!label) {
    return NextResponse.json({ error: "label is required" }, { status: 400 });
  }

  if (!hasVendorCategoryPolls(label)) {
    return new NextResponse(null, { status: 204 });
  }

  const question = pickVendorCategoryPollQuestion(label);
  if (!question) {
    return new NextResponse(null, { status: 204 });
  }

  // Look up the poll row by exact question text. Seeds use upserts keyed
  // on `question`, so this returns the canonical row even after re-seeds.
  const { data: poll, error } = await supabase
    .from("polls")
    .select("*")
    .eq("question", question)
    .maybeSingle();
  if (error || !poll) {
    return new NextResponse(null, { status: 204 });
  }

  const counts = await getVoteCounts(
    supabase,
    poll.id,
    (poll.options as unknown[]).length,
  );
  const total = counts.reduce((a, b) => a + b, 0);

  return NextResponse.json({ poll, counts, total });
}
