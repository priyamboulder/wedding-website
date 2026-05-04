import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";
import { listPolls, type ArchiveSort } from "@/lib/polls/archive";
import type { PollCategory } from "@/types/polls";

const VALID_SORTS: ArchiveSort[] = [
  "trending",
  "most_votes",
  "newest",
  "controversial",
];

const VALID_CATEGORIES: PollCategory[] = [
  "ceremony_traditions",
  "guest_experience",
  "food_drinks",
  "fashion_beauty",
  "photography_video",
  "music_entertainment",
  "decor_venue",
  "budget_planning",
  "family_dynamics",
  "honeymoon_post_wedding",
  "invitations_communication",
  "modern_vs_traditional",
  "spicy_hot_takes",
  "would_you_ever",
  "this_or_that",
];

// GET /api/polls/list?sort=trending&category=all&limit=20&offset=0
//
// Backs the /the-great-debate archive client. Uses the service-role
// client to compute trending (last-7d vote count) since poll_votes is
// RLS-restricted from public reads.
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;

  const sortParam = (params.get("sort") ?? "trending") as ArchiveSort;
  const sort = VALID_SORTS.includes(sortParam) ? sortParam : "trending";

  const categoryParam = params.get("category") ?? "all";
  const category =
    categoryParam === "all" ||
    VALID_CATEGORIES.includes(categoryParam as PollCategory)
      ? (categoryParam as PollCategory | "all")
      : "all";

  const limit = Math.max(
    1,
    Math.min(parseInt(params.get("limit") ?? "20", 10) || 20, 50),
  );
  const offset = Math.max(0, parseInt(params.get("offset") ?? "0", 10) || 0);

  try {
    const result = await listPolls(supabase, { sort, category, limit, offset });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Could not load polls" },
      { status: 500 },
    );
  }
}
