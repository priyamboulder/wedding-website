// Server-side query helpers for "Overspent or Worth It?" submissions.

import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  OverspentSubmissionWithVotes,
  OverspentVerdict,
} from "@/types/overspent";

export const PAGE_SIZE = 30;

export interface ListOpts {
  verdict?: OverspentVerdict;
  limit?: number;
  offset?: number;
}

export async function listSubmissions(
  supabase: SupabaseClient,
  opts: ListOpts = {},
): Promise<{ rows: OverspentSubmissionWithVotes[]; hasMore: boolean }> {
  const limit = opts.limit ?? PAGE_SIZE;
  const offset = opts.offset ?? 0;

  let q = supabase
    .from("overspent_submissions_with_votes")
    .select("*")
    .order("published_at", { ascending: false })
    .range(offset, offset + limit);

  if (opts.verdict) q = q.eq("verdict", opts.verdict);

  const { data, error } = await q;
  if (error || !data) return { rows: [], hasMore: false };

  const rows = data as OverspentSubmissionWithVotes[];
  const hasMore = rows.length > limit;
  return { rows: hasMore ? rows.slice(0, limit) : rows, hasMore };
}

export async function getUserVotes(
  supabase: SupabaseClient,
  userId: string,
  submissionIds: string[],
): Promise<Record<string, "agree" | "disagree">> {
  if (submissionIds.length === 0) return {};
  const { data, error } = await supabase
    .from("overspent_votes")
    .select("submission_id, vote")
    .eq("user_id", userId)
    .in("submission_id", submissionIds);
  if (error || !data) return {};
  const map: Record<string, "agree" | "disagree"> = {};
  for (const row of data as { submission_id: string; vote: string }[]) {
    map[row.submission_id] = row.vote as "agree" | "disagree";
  }
  return map;
}

export async function getVoteCounts(
  supabase: SupabaseClient,
  submissionId: string,
): Promise<{ agree_count: number; disagree_count: number }> {
  const { data } = await supabase
    .from("overspent_submissions_with_votes")
    .select("agree_count, disagree_count")
    .eq("id", submissionId)
    .maybeSingle();
  return {
    agree_count: (data?.agree_count as number | undefined) ?? 0,
    disagree_count: (data?.disagree_count as number | undefined) ?? 0,
  };
}
