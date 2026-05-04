import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";
import { getAuthUser } from "@/lib/supabase/auth-helpers";
import {
  fetchSessionBySlug,
  fetchSessionQA,
  fetchUserReactions,
  fetchUserUpvotes,
} from "@/lib/grapevine-ama/queries";

// GET /api/grapevine/sessions/[slug]
// Returns the session, its answered Q&A pairs, and the queue.
// If a user is authed, also returns which questions they upvoted and which
// reactions they've left so the UI can highlight pressed buttons.
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const session = await fetchSessionBySlug(supabase, slug);
  if (!session) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { answered, queue } = await fetchSessionQA(supabase, session.id);

  let userUpvotes: string[] = [];
  let userReactions: Record<string, string[]> = {};
  const user = await getAuthUser(request);
  if (user) {
    const [up, rx] = await Promise.all([
      fetchUserUpvotes(supabase, user.id, session.id),
      fetchUserReactions(supabase, user.id, session.id),
    ]);
    userUpvotes = Array.from(up);
    for (const [aId, types] of rx.entries()) {
      userReactions[aId] = Array.from(types);
    }
  }

  return NextResponse.json({
    session,
    answered,
    queue,
    userUpvotes,
    userReactions,
  });
}
