import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";
import { requireAuth, hasRole } from "@/lib/supabase/auth-helpers";

// POST /api/polls/featured
// Body: { pollId: string }
//
// Admin-only. Promotes the given poll to featured and demotes whichever
// poll currently holds the slot. featured_date is set to now() so the
// homepage query (order by featured_date desc) picks up the newest one.
export async function POST(request: NextRequest) {
  const { user, response: authError } = await requireAuth(request);
  if (authError) return authError;
  if (!hasRole(user, "admin")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { pollId } = (body ?? {}) as { pollId?: string };
  if (typeof pollId !== "string" || !pollId) {
    return NextResponse.json({ error: "pollId is required" }, { status: 400 });
  }

  const { data: target, error: lookupErr } = await supabase
    .from("polls")
    .select("id")
    .eq("id", pollId)
    .maybeSingle();
  if (lookupErr || !target) {
    return NextResponse.json({ error: "Poll not found" }, { status: 404 });
  }

  // Demote any currently-featured polls (there should be at most one, but
  // unset all to keep the invariant clean).
  const { error: demoteErr } = await supabase
    .from("polls")
    .update({ is_featured: false, featured_date: null })
    .eq("is_featured", true)
    .neq("id", pollId);
  if (demoteErr) {
    return NextResponse.json({ error: "Could not demote previous poll" }, { status: 500 });
  }

  const { error: promoteErr } = await supabase
    .from("polls")
    .update({ is_featured: true, featured_date: new Date().toISOString() })
    .eq("id", pollId);
  if (promoteErr) {
    return NextResponse.json({ error: "Could not promote poll" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, pollId });
}
