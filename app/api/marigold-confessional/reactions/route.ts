import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";
import { requireAuth } from "@/lib/supabase/auth-helpers";
import type { MarigoldConfessionReaction } from "@/types/marigold-confessional";

const VALID_REACTIONS = new Set<MarigoldConfessionReaction>([
  "same",
  "aunty_disapproves",
  "fire",
  "sending_chai",
]);

// POST /api/marigold-confessional/reactions
// Body: { post_id, reaction_type }
// Toggles: if the user already has that reaction on the post, it's removed.
export async function POST(request: NextRequest) {
  const { user, response: authError } = await requireAuth(request);
  if (authError) return authError;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { post_id, reaction_type } = (body ?? {}) as {
    post_id?: string;
    reaction_type?: string;
  };

  if (typeof post_id !== "string" || !post_id) {
    return NextResponse.json({ error: "post_id is required" }, { status: 400 });
  }
  if (
    !reaction_type ||
    !VALID_REACTIONS.has(reaction_type as MarigoldConfessionReaction)
  ) {
    return NextResponse.json(
      { error: "Invalid reaction_type" },
      { status: 400 },
    );
  }

  // Confirm the post exists & is visible.
  const { data: post } = await supabase
    .from("marigold_confessions")
    .select("id, is_hidden")
    .eq("id", post_id)
    .maybeSingle();
  if (!post || post.is_hidden) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  // Toggle.
  const { data: existing } = await supabase
    .from("marigold_confession_reactions")
    .select("id")
    .eq("post_id", post_id)
    .eq("user_id", user.id)
    .eq("reaction_type", reaction_type)
    .maybeSingle();

  if (existing) {
    const { error: delErr } = await supabase
      .from("marigold_confession_reactions")
      .delete()
      .eq("id", existing.id);
    if (delErr) {
      return NextResponse.json(
        { error: "Could not remove reaction" },
        { status: 500 },
      );
    }
    const counts = await reactionCounts(post_id);
    return NextResponse.json({ ok: true, active: false, counts });
  }

  const { error: insErr } = await supabase
    .from("marigold_confession_reactions")
    .insert({ post_id, user_id: user.id, reaction_type });
  if (insErr && insErr.code !== "23505") {
    return NextResponse.json(
      { error: "Could not save reaction" },
      { status: 500 },
    );
  }

  const counts = await reactionCounts(post_id);
  return NextResponse.json({ ok: true, active: true, counts });
}

async function reactionCounts(postId: string) {
  const { data } = await supabase
    .from("marigold_confessions_with_counts")
    .select(
      "reaction_same, reaction_aunty_disapproves, reaction_fire, reaction_sending_chai, comment_count",
    )
    .eq("id", postId)
    .maybeSingle();
  return (
    data ?? {
      reaction_same: 0,
      reaction_aunty_disapproves: 0,
      reaction_fire: 0,
      reaction_sending_chai: 0,
      comment_count: 0,
    }
  );
}
