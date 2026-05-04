import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";
import {
  getVoteCounts,
  getVoteCountsByVoterType,
} from "@/lib/polls/queries";
import type { Poll } from "@/types/polls";

// GET /api/polls/zilla-zone
//
// Picks one of the curated Bride-vs-Mom dynamic polls (flagged via
// `zilla_zone_eligible`) at random and returns the row alongside its
// current vote counts plus a per-voter-type breakdown so the client can
// render the "87% of brides said boundaries" line when there's enough
// signal. Returns 204 if no eligible polls are flagged yet (e.g. before
// the seed migration has run).
export async function GET() {
  const { data: rows, error } = await supabase
    .from("polls")
    .select("*")
    .eq("zilla_zone_eligible", true);

  if (error || !rows || rows.length === 0) {
    return new NextResponse(null, { status: 204 });
  }

  const poll = rows[Math.floor(Math.random() * rows.length)] as Poll;
  const optionCount = (poll.options as unknown[]).length;

  const [counts, byVoterType] = await Promise.all([
    getVoteCounts(supabase, poll.id, optionCount),
    getVoteCountsByVoterType(supabase, poll.id, optionCount),
  ]);
  const total = counts.reduce((a, b) => a + b, 0);

  return NextResponse.json({ poll, counts, total, byVoterType });
}
