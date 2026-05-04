// lib/polls/queries.ts
//
// Server-side query helpers for the polls system. The homepage Daily Debate
// section calls these from a server component; the /api/polls/* routes use
// the same helpers when they need to re-read state after a write.

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Poll, PollVoteCount } from "@/types/polls";

export interface FeaturedPollSnapshot {
  poll: Poll;
  counts: number[];
  total: number;
}

export async function getFeaturedPoll(
  supabase: SupabaseClient,
): Promise<FeaturedPollSnapshot | null> {
  const { data: poll, error } = await supabase
    .from("polls")
    .select("*")
    .eq("is_featured", true)
    .order("featured_date", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error || !poll) return null;

  const counts = await getVoteCounts(supabase, poll.id, poll.options.length);
  const total = counts.reduce((a, b) => a + b, 0);
  return { poll: poll as Poll, counts, total };
}

export async function getVoteCounts(
  supabase: SupabaseClient,
  pollId: string,
  optionCount: number,
): Promise<number[]> {
  const { data, error } = await supabase
    .from("poll_vote_counts")
    .select("option_index, vote_count")
    .eq("poll_id", pollId);

  const counts = new Array<number>(optionCount).fill(0);
  if (error || !data) return counts;
  for (const row of data as Pick<PollVoteCount, "option_index" | "vote_count">[]) {
    if (row.option_index == null) continue;
    if (row.option_index >= 0 && row.option_index < optionCount) {
      counts[row.option_index] = row.vote_count;
    }
  }
  return counts;
}

export type VoterTypeBreakdown = Record<string, number[]>;

// Returns counts per option for each voter_type that has cast at least one
// vote on this poll. Shape: { bride: [12, 4], mom: [3, 9], ... }. Voter
// types absent from the map have zero votes.
export async function getVoteCountsByVoterType(
  supabase: SupabaseClient,
  pollId: string,
  optionCount: number,
): Promise<VoterTypeBreakdown> {
  const { data, error } = await supabase
    .from("poll_vote_counts_by_voter_type")
    .select("voter_type, option_index, vote_count")
    .eq("poll_id", pollId);

  const breakdown: VoterTypeBreakdown = {};
  if (error || !data) return breakdown;

  for (const row of data as {
    voter_type: string | null;
    option_index: number | null;
    vote_count: number;
  }[]) {
    if (!row.voter_type || row.option_index == null) continue;
    if (row.option_index < 0 || row.option_index >= optionCount) continue;
    if (!breakdown[row.voter_type]) {
      breakdown[row.voter_type] = new Array<number>(optionCount).fill(0);
    }
    breakdown[row.voter_type][row.option_index] = row.vote_count;
  }
  return breakdown;
}
