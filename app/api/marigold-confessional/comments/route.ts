import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";
import { requireAuth } from "@/lib/supabase/auth-helpers";
import { listComments, moderate } from "@/lib/marigold-confessional/queries";
import {
  COMMENT_CONTENT_MAX,
  PERSONA_TAG_MAX,
} from "@/types/marigold-confessional";

// GET /api/marigold-confessional/comments?post_id=...
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const postId = url.searchParams.get("post_id");
  if (!postId) {
    return NextResponse.json({ error: "post_id is required" }, { status: 400 });
  }
  const comments = await listComments(supabase, postId);
  return NextResponse.json({ comments });
}

// POST /api/marigold-confessional/comments
// Body: { post_id, persona_tag, content }
export async function POST(request: NextRequest) {
  const { user, response: authError } = await requireAuth(request);
  if (authError) return authError;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { post_id, persona_tag, content } = (body ?? {}) as {
    post_id?: string;
    persona_tag?: string;
    content?: string;
  };

  if (typeof post_id !== "string" || !post_id) {
    return NextResponse.json({ error: "post_id is required" }, { status: 400 });
  }
  if (!persona_tag || persona_tag.length > PERSONA_TAG_MAX) {
    return NextResponse.json(
      { error: `persona_tag must be 1-${PERSONA_TAG_MAX} chars` },
      { status: 400 },
    );
  }
  if (
    !content ||
    content.length === 0 ||
    content.length > COMMENT_CONTENT_MAX
  ) {
    return NextResponse.json(
      { error: `content must be 1-${COMMENT_CONTENT_MAX} chars` },
      { status: 400 },
    );
  }

  const mod = moderate(content);
  if (!mod.ok) {
    return NextResponse.json({ error: mod.reason }, { status: 422 });
  }

  // Confirm parent post exists & is visible.
  const { data: post } = await supabase
    .from("marigold_confessions")
    .select("id, is_hidden")
    .eq("id", post_id)
    .maybeSingle();
  if (!post || post.is_hidden) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const { data, error } = await supabase
    .from("marigold_confession_comments")
    .insert({
      post_id,
      user_id: user.id,
      persona_tag: persona_tag.trim(),
      content: content.trim(),
    })
    .select("id, post_id, persona_tag, content, created_at")
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json(
      { error: "Could not save comment" },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, comment: data });
}
