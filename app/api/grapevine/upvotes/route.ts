import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";
import { requireAuth } from "@/lib/supabase/auth-helpers";

// POST /api/grapevine/upvotes
// Body: { question_id }
// Toggles an upvote — idempotent. Returns the new total upvote count
// (live + seed) so the client can keep its local state in sync without
// re-fetching the whole session.
export async function POST(request: NextRequest) {
  const { user, response: authError } = await requireAuth(request);
  if (authError) return authError;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { question_id } = (body ?? {}) as { question_id?: string };
  if (!question_id) {
    return NextResponse.json(
      { error: "question_id required" },
      { status: 400 },
    );
  }

  // Toggle: if a row exists, delete it; otherwise insert.
  const { data: existing } = await supabase
    .from("grapevine_ama_upvotes")
    .select("id")
    .eq("question_id", question_id)
    .eq("user_id", user.id)
    .maybeSingle();

  let upvoted: boolean;
  if (existing) {
    await supabase
      .from("grapevine_ama_upvotes")
      .delete()
      .eq("id", existing.id);
    upvoted = false;
  } else {
    const { error: insErr } = await supabase
      .from("grapevine_ama_upvotes")
      .insert({ question_id, user_id: user.id });
    if (insErr) {
      return NextResponse.json(
        { error: "Could not record upvote" },
        { status: 500 },
      );
    }
    upvoted = true;
  }

  // Pull the fresh combined count (live + seed) so the client doesn't
  // have to track seed offsets itself.
  const { data: q } = await supabase
    .from("grapevine_ama_questions")
    .select("upvote_count, seed_upvotes")
    .eq("id", question_id)
    .maybeSingle();
  const total =
    (q?.upvote_count ?? 0) + ((q as { seed_upvotes?: number })?.seed_upvotes ?? 0);

  return NextResponse.json({ ok: true, upvoted, total_upvotes: total });
}
