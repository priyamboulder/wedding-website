import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";
import { requireAuth, getAuthUser } from "@/lib/supabase/auth-helpers";
import {
  PAGE_SIZE,
  countPosts,
  listPosts,
  moderate,
} from "@/lib/marigold-confessional/queries";
import {
  POST_CONTENT_MAX,
  PERSONA_TAG_MAX,
  type MarigoldConfessionType,
} from "@/types/marigold-confessional";

const VALID_TYPES = new Set<MarigoldConfessionType>([
  "rant",
  "confession",
  "hot_take",
  "would_you_believe",
]);

// GET /api/marigold-confessional/posts?type=rant&offset=0
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const typeRaw = url.searchParams.get("type");
  const offsetRaw = url.searchParams.get("offset");
  const includeCount = url.searchParams.get("includeCount") === "1";

  const type =
    typeRaw && VALID_TYPES.has(typeRaw as MarigoldConfessionType)
      ? (typeRaw as MarigoldConfessionType)
      : undefined;
  const offset = offsetRaw ? Math.max(0, parseInt(offsetRaw, 10) || 0) : 0;

  const page = await listPosts(supabase, { type, offset, limit: PAGE_SIZE });

  // The reactions a logged-in viewer has already left on this page — used
  // to highlight pressed pills.
  const user = await getAuthUser(request);
  let userReactions: Record<string, string[]> = {};
  if (user && page.posts.length > 0) {
    const postIds = page.posts.map((p) => p.id);
    const { data: rxs } = await supabase
      .from("marigold_confession_reactions")
      .select("post_id, reaction_type")
      .eq("user_id", user.id)
      .in("post_id", postIds);
    if (rxs) {
      for (const r of rxs as { post_id: string; reaction_type: string }[]) {
        (userReactions[r.post_id] ||= []).push(r.reaction_type);
      }
    }
  }

  const total = includeCount ? await countPosts(supabase) : undefined;

  return NextResponse.json({
    posts: page.posts,
    hasMore: page.hasMore,
    userReactions,
    ...(total !== undefined ? { total } : {}),
  });
}

// POST /api/marigold-confessional/posts
// Body: { post_type, persona_tag, content }
export async function POST(request: NextRequest) {
  const { user, response: authError } = await requireAuth(request);
  if (authError) return authError;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { post_type, persona_tag, content } = (body ?? {}) as {
    post_type?: string;
    persona_tag?: string;
    content?: string;
  };

  if (!post_type || !VALID_TYPES.has(post_type as MarigoldConfessionType)) {
    return NextResponse.json({ error: "Invalid post_type" }, { status: 400 });
  }
  if (!persona_tag || persona_tag.length > PERSONA_TAG_MAX) {
    return NextResponse.json(
      { error: `persona_tag must be 1-${PERSONA_TAG_MAX} chars` },
      { status: 400 },
    );
  }
  if (!content || content.length === 0 || content.length > POST_CONTENT_MAX) {
    return NextResponse.json(
      { error: `content must be 1-${POST_CONTENT_MAX} chars` },
      { status: 400 },
    );
  }

  const mod = moderate(content);
  if (!mod.ok) {
    return NextResponse.json({ error: mod.reason }, { status: 422 });
  }

  const { data, error } = await supabase
    .from("marigold_confessions")
    .insert({
      user_id: user.id,
      post_type,
      persona_tag: persona_tag.trim(),
      content: content.trim(),
    })
    .select("*")
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json({ error: "Could not save post" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, post: data });
}
