// lib/polls/archive.ts
//
// Query helpers for The Great Debate archive (/the-great-debate). The
// archive lists all 300 polls with sort + category filters and paginates
// 20 at a time. Counts and recent-vote tallies are computed server-side
// using the service-role Supabase client so we can read poll_votes despite
// the restrictive SELECT RLS on that table.
//
// Aggregation strategy:
//   - polls         — one round-trip; ~300 rows.
//   - poll_vote_counts (view) — one round-trip; ~600 rows (300 × ~2 opts).
//   - poll_votes (last 7d, poll_id only) — one round-trip; grouped in JS.
// The whole pipeline is recomputed per request. With ~300 polls this is
// fast enough; if the catalog grows, fold these into a Postgres view.
//
// The same pipeline powers /api/polls/list, called by the client when the
// user changes sort/filter or clicks "Load more".

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Poll, PollCategory } from "@/types/polls";

export type ArchiveSort =
  | "trending"
  | "most_votes"
  | "newest"
  | "controversial";

export interface PollWithCounts {
  id: string;
  question: string;
  category: PollCategory;
  options: string[];
  poll_type: Poll["poll_type"];
  created_at: string;
  counts: number[];
  total: number;
  recent_7d: number;
  is_controversial: boolean;
}

export interface ArchiveListInput {
  sort?: ArchiveSort;
  category?: PollCategory | "all";
  limit?: number;
  offset?: number;
}

export interface ArchiveListResult {
  polls: PollWithCounts[];
  total_polls: number;
  has_more: boolean;
}

export interface EngagementStats {
  total_votes: number;
  total_polls: number;
}

const DEFAULT_LIMIT = 20;
const CONTROVERSIAL_MIN_VOTES = 10;
const CONTROVERSIAL_THRESHOLD = 5;

// How "balanced" the top option is, relative to a perfectly even split for
// the option count. Lower = more controversial. Returns Infinity for polls
// without enough votes to count.
function controversialScore(counts: number[], total: number): number {
  if (total < CONTROVERSIAL_MIN_VOTES || counts.length === 0) return Infinity;
  const target = 100 / counts.length;
  const max = Math.max(...counts);
  const maxPct = (max / total) * 100;
  return Math.abs(maxPct - target);
}

export async function getEngagementStats(
  supabase: SupabaseClient,
): Promise<EngagementStats> {
  const [{ count: voteCount }, { count: pollCount }] = await Promise.all([
    supabase.from("poll_votes").select("id", { count: "exact", head: true }),
    supabase.from("polls").select("id", { count: "exact", head: true }),
  ]);
  return {
    total_votes: voteCount ?? 0,
    total_polls: pollCount ?? 0,
  };
}

export async function listPolls(
  supabase: SupabaseClient,
  input: ArchiveListInput = {},
): Promise<ArchiveListResult> {
  const sort: ArchiveSort = input.sort ?? "trending";
  const category = input.category ?? "all";
  const limit = Math.max(1, Math.min(input.limit ?? DEFAULT_LIMIT, 50));
  const offset = Math.max(0, input.offset ?? 0);

  // 1) Fetch all polls (matching category) — only ~300 rows.
  let pollQuery = supabase
    .from("polls")
    .select("id, question, category, options, poll_type, created_at");
  if (category !== "all") pollQuery = pollQuery.eq("category", category);
  const { data: polls, error: pollErr } = await pollQuery;
  if (pollErr || !polls) return { polls: [], total_polls: 0, has_more: false };

  // 2) Fetch all per-option counts via the public view.
  const { data: countRows } = await supabase
    .from("poll_vote_counts")
    .select("poll_id, option_index, vote_count");

  const countsByPoll = new Map<string, number[]>();
  for (const p of polls as Array<{ id: string; options: unknown }>) {
    const opts = Array.isArray(p.options) ? (p.options as unknown[]) : [];
    countsByPoll.set(p.id, new Array<number>(opts.length).fill(0));
  }
  for (const row of (countRows ?? []) as Array<{
    poll_id: string;
    option_index: number | null;
    vote_count: number;
  }>) {
    if (row.option_index == null) continue;
    const arr = countsByPoll.get(row.poll_id);
    if (!arr) continue;
    if (row.option_index >= 0 && row.option_index < arr.length) {
      arr[row.option_index] = row.vote_count;
    }
  }

  // 3) Fetch recent (7d) votes — service-role only sees rows past RLS.
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const recentByPoll = new Map<string, number>();
  const { data: recentRows } = await supabase
    .from("poll_votes")
    .select("poll_id")
    .gte("created_at", sevenDaysAgo);
  for (const row of (recentRows ?? []) as Array<{ poll_id: string }>) {
    recentByPoll.set(row.poll_id, (recentByPoll.get(row.poll_id) ?? 0) + 1);
  }

  // 4) Assemble the enriched poll list.
  const enriched: PollWithCounts[] = (polls as Array<{
    id: string;
    question: string;
    category: PollCategory;
    options: unknown;
    poll_type: Poll["poll_type"];
    created_at: string;
  }>).map((p) => {
    const counts = countsByPoll.get(p.id) ?? [];
    const total = counts.reduce((a, b) => a + b, 0);
    const score = controversialScore(counts, total);
    return {
      id: p.id,
      question: p.question,
      category: p.category,
      options: Array.isArray(p.options) ? (p.options as string[]) : [],
      poll_type: p.poll_type,
      created_at: p.created_at,
      counts,
      total,
      recent_7d: recentByPoll.get(p.id) ?? 0,
      is_controversial: score <= CONTROVERSIAL_THRESHOLD,
    };
  });

  // 5) Sort.
  const sorted = [...enriched];
  switch (sort) {
    case "newest":
      sorted.sort((a, b) => b.created_at.localeCompare(a.created_at));
      break;
    case "most_votes":
      sorted.sort((a, b) => b.total - a.total || b.recent_7d - a.recent_7d);
      break;
    case "controversial":
      sorted.sort((a, b) => {
        const sa = controversialScore(a.counts, a.total);
        const sb = controversialScore(b.counts, b.total);
        if (sa !== sb) return sa - sb;
        return b.total - a.total;
      });
      break;
    case "trending":
    default:
      sorted.sort(
        (a, b) =>
          b.recent_7d - a.recent_7d ||
          b.total - a.total ||
          b.created_at.localeCompare(a.created_at),
      );
      break;
  }

  const page = sorted.slice(offset, offset + limit);
  return {
    polls: page,
    total_polls: enriched.length,
    has_more: offset + page.length < sorted.length,
  };
}
