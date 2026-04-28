import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";
import { requireAuth, hasRole } from "@/lib/supabase/auth-helpers";
import type {
  ApplicationStatus,
  CreatorApplication,
  ExpertiseArea,
  FollowingRange,
} from "@/types/creator-application";

// GET /api/admin/creator-applications
// Admin list endpoint. Supports ?status=&expertise=&following=&search=
// and basic sort/pagination. Reads from the persistent creator_applications_state
// JSONB blob.

const PLATFORM_KEY = "__platform__";

const FOLLOWING_ORDER: FollowingRange[] = [
  "under_1k",
  "1k_10k",
  "10k_50k",
  "50k_100k",
  "100k_500k",
  "500k_plus",
];

export async function GET(request: NextRequest) {
  const { user, response: authError } = await requireAuth(request);
  if (authError) return authError;
  if (!hasRole(user, "admin")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") as ApplicationStatus | null;
  const expertise = searchParams.get("expertise") as ExpertiseArea | null;
  const following = searchParams.get("following") as FollowingRange | null;
  const search = searchParams.get("search")?.trim().toLowerCase() ?? "";
  const sort = searchParams.get("sort") ?? "newest";
  const limit = Number(searchParams.get("limit") ?? "100");
  const offset = Number(searchParams.get("offset") ?? "0");

  const { data: row, error } = await supabase
    .from("creator_applications_state")
    .select("data")
    .eq("couple_id", PLATFORM_KEY)
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { error: "DB read failed." },
      { status: 500 },
    );
  }

  let list: CreatorApplication[] = Array.isArray(row?.data)
    ? (row.data as CreatorApplication[])
    : [];

  if (status) list = list.filter((a) => a.status === status);
  if (expertise) list = list.filter((a) => a.primaryExpertise === expertise);
  if (following) list = list.filter((a) => a.combinedFollowingRange === following);
  if (search)
    list = list.filter(
      (a) =>
        a.fullName.toLowerCase().includes(search) ||
        a.email.toLowerCase().includes(search),
    );

  list.sort((a, b) => {
    if (sort === "oldest")
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    if (sort === "following")
      return (
        FOLLOWING_ORDER.indexOf(b.combinedFollowingRange) -
        FOLLOWING_ORDER.indexOf(a.combinedFollowingRange)
      );
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const total = list.length;
  const paged = list.slice(offset, offset + limit);

  return NextResponse.json({ applications: paged, total, limit, offset });
}
