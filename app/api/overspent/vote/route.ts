import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";
import { getAuthUser } from "@/lib/supabase/auth-helpers";
import { getVoteCounts } from "@/lib/overspent/queries";
import type { OverspentVote } from "@/types/overspent";

// POST /api/overspent/vote
// Body: { submission_id: string, vote: 'agree' | 'disagree', fingerprint?: string }
//
// Auth: optional. Authed voters dedup by (submission_id, user_id);
// anonymous voters dedup by (submission_id, fingerprint). Service-role
// insert bypasses RLS, but the auth check ensures user_id is genuine.
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { submission_id, vote, fingerprint } = (body ?? {}) as {
    submission_id?: string;
    vote?: string;
    fingerprint?: string;
  };

  if (typeof submission_id !== "string" || !submission_id) {
    return NextResponse.json(
      { error: "submission_id is required" },
      { status: 400 },
    );
  }
  if (vote !== "agree" && vote !== "disagree") {
    return NextResponse.json(
      { error: "vote must be 'agree' or 'disagree'" },
      { status: 400 },
    );
  }

  // Make sure the submission exists and is publicly visible.
  const { data: sub } = await supabase
    .from("overspent_submissions_with_votes")
    .select("id")
    .eq("id", submission_id)
    .maybeSingle();
  if (!sub) {
    return NextResponse.json({ error: "Submission not found" }, { status: 404 });
  }

  const user = await getAuthUser(request);
  const fp =
    typeof fingerprint === "string" && fingerprint.length > 0
      ? fingerprint.slice(0, 128)
      : null;

  if (!user && !fp) {
    return NextResponse.json(
      { error: "Either authentication or a fingerprint is required" },
      { status: 400 },
    );
  }

  // Detect prior vote so we can return the user's recorded side instead of
  // pretending the latest click landed.
  let priorVote: OverspentVote | null = null;
  if (user) {
    const { data: prior } = await supabase
      .from("overspent_votes")
      .select("vote")
      .eq("submission_id", submission_id)
      .eq("user_id", user.id)
      .maybeSingle();
    if (prior) priorVote = prior.vote as OverspentVote;
  } else if (fp) {
    const { data: prior } = await supabase
      .from("overspent_votes")
      .select("vote")
      .eq("submission_id", submission_id)
      .eq("fingerprint", fp)
      .is("user_id", null)
      .maybeSingle();
    if (prior) priorVote = prior.vote as OverspentVote;
  }

  if (priorVote) {
    const counts = await getVoteCounts(supabase, submission_id);
    return NextResponse.json(
      { ok: true, alreadyVoted: true, vote: priorVote, ...counts },
      { status: 409 },
    );
  }

  const { error: insertErr } = await supabase.from("overspent_votes").insert({
    submission_id,
    user_id: user?.id ?? null,
    fingerprint: user ? null : fp,
    vote,
  });

  if (insertErr) {
    if (insertErr.code === "23505") {
      const counts = await getVoteCounts(supabase, submission_id);
      return NextResponse.json(
        { ok: true, alreadyVoted: true, vote, ...counts },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { error: "Could not record vote" },
      { status: 500 },
    );
  }

  const counts = await getVoteCounts(supabase, submission_id);
  return NextResponse.json({
    ok: true,
    alreadyVoted: false,
    vote,
    ...counts,
  });
}
