import { NextRequest, NextResponse } from "next/server";
import { SEED_APPLICATIONS } from "@/lib/creators/applications-seed";
import { requireAuth, hasRole } from "@/lib/supabase/auth-helpers";
import type { ApplicationStatus } from "@/types/creator-application";

// GET /api/admin/creator-applications/stats
// Admin dashboard stats. Reads the seed snapshot; realtime counts come
// from the client store.

export async function GET(request: NextRequest) {
  const { user, response: authError } = await requireAuth(request);
  if (authError) return authError;
  if (!hasRole(user, "admin")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const counts: Record<ApplicationStatus, number> = {
    pending: 0,
    under_review: 0,
    approved: 0,
    rejected: 0,
    waitlisted: 0,
    more_info_requested: 0,
  };
  for (const a of SEED_APPLICATIONS) counts[a.status]++;

  const pendingTotal =
    counts.pending + counts.under_review + counts.more_info_requested;

  const now = new Date();
  const thisMonth = (iso: string | null) => {
    if (!iso) return false;
    const d = new Date(iso);
    return (
      d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
    );
  };

  const approvedThisMonth = SEED_APPLICATIONS.filter(
    (a) => a.status === "approved" && thisMonth(a.reviewedAt),
  ).length;
  const rejectedThisMonth = SEED_APPLICATIONS.filter(
    (a) => a.status === "rejected" && thisMonth(a.reviewedAt),
  ).length;

  const decided = SEED_APPLICATIONS.filter((a) => a.reviewedAt);
  const avgDecisionHours =
    decided.length === 0
      ? null
      : decided.reduce(
          (sum, a) =>
            sum +
            (new Date(a.reviewedAt!).getTime() -
              new Date(a.createdAt).getTime()),
          0,
        ) /
        decided.length /
        3_600_000;

  return NextResponse.json({
    counts,
    pendingTotal,
    approvedThisMonth,
    rejectedThisMonth,
    avgDecisionHours,
  });
}
