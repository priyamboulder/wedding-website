import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";
import { getAuthUser } from "@/lib/supabase/auth-helpers";
import { getVoteCounts } from "@/lib/polls/queries";

// POST /api/polls/vote
// Body: { pollId: string, optionIndex: number, fingerprint?: string, context?: string }
//
// Auth: optional. If a Bearer JWT is present we record user_id and dedup
// by (poll_id, user_id). Otherwise we fall back to the supplied fingerprint
// and dedup by (poll_id, fingerprint). Service-role insert bypasses RLS;
// the auth check here is what guarantees user_id is genuine.
//
// `context` is an optional placement tag (e.g. "vendor_photography") that
// gets recorded on the vote row so we can segment results by where the
// voter encountered the poll — homepage, archive, vendor directory, etc.
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { pollId, optionIndex, fingerprint, context } = (body ?? {}) as {
    pollId?: string;
    optionIndex?: number;
    fingerprint?: string;
    context?: string;
  };

  if (typeof pollId !== "string" || !pollId) {
    return NextResponse.json({ error: "pollId is required" }, { status: 400 });
  }
  if (typeof optionIndex !== "number" || !Number.isInteger(optionIndex) || optionIndex < 0) {
    return NextResponse.json({ error: "optionIndex must be a non-negative integer" }, { status: 400 });
  }

  const { data: poll, error: pollErr } = await supabase
    .from("polls")
    .select("id, options")
    .eq("id", pollId)
    .maybeSingle();
  if (pollErr || !poll) {
    return NextResponse.json({ error: "Poll not found" }, { status: 404 });
  }
  if (optionIndex >= (poll.options as unknown[]).length) {
    return NextResponse.json({ error: "optionIndex out of range" }, { status: 400 });
  }

  const user = await getAuthUser(request);
  const fp = typeof fingerprint === "string" && fingerprint.length > 0 ? fingerprint : null;

  if (!user && !fp) {
    return NextResponse.json(
      { error: "Either authentication or a fingerprint is required" },
      { status: 400 },
    );
  }

  // Detect prior vote first so we can return the recorded option to the
  // client (lets the UI show their previous pick rather than the one they
  // just clicked).
  let priorIndex: number | null = null;
  if (user) {
    const { data: prior } = await supabase
      .from("poll_votes")
      .select("option_index")
      .eq("poll_id", pollId)
      .eq("user_id", user.id)
      .maybeSingle();
    if (prior) priorIndex = prior.option_index as number;
  } else if (fp) {
    const { data: prior } = await supabase
      .from("poll_votes")
      .select("option_index")
      .eq("poll_id", pollId)
      .eq("fingerprint", fp)
      .maybeSingle();
    if (prior) priorIndex = prior.option_index as number;
  }

  if (priorIndex !== null) {
    const counts = await getVoteCounts(supabase, pollId, (poll.options as unknown[]).length);
    return NextResponse.json(
      {
        ok: true,
        alreadyVoted: true,
        optionIndex: priorIndex,
        counts,
        total: counts.reduce((a, b) => a + b, 0),
      },
      { status: 409 },
    );
  }

  // Cap context to a sane length and discard non-strings so a bad client
  // can't smuggle giant payloads into the column.
  const ctx =
    typeof context === "string" && context.length > 0
      ? context.slice(0, 64)
      : null;

  const insertRow = {
    poll_id: pollId,
    option_index: optionIndex,
    user_id: user?.id ?? null,
    fingerprint: user ? null : fp,
    context: ctx,
  };

  const { error: insertErr } = await supabase.from("poll_votes").insert(insertRow);
  if (insertErr) {
    // Race against the unique partial index — treat as already-voted.
    if (insertErr.code === "23505") {
      const counts = await getVoteCounts(supabase, pollId, (poll.options as unknown[]).length);
      return NextResponse.json(
        {
          ok: true,
          alreadyVoted: true,
          optionIndex,
          counts,
          total: counts.reduce((a, b) => a + b, 0),
        },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: "Could not record vote" }, { status: 500 });
  }

  const counts = await getVoteCounts(supabase, pollId, (poll.options as unknown[]).length);
  return NextResponse.json({
    ok: true,
    alreadyVoted: false,
    optionIndex,
    counts,
    total: counts.reduce((a, b) => a + b, 0),
  });
}
