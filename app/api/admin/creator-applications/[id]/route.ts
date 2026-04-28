import { NextRequest, NextResponse } from "next/server";
import {
  SEED_APPLICATIONS,
  SEED_APPLICATION_LOGS,
} from "@/lib/creators/applications-seed";
import { requireAuth, hasRole } from "@/lib/supabase/auth-helpers";

// GET /api/admin/creator-applications/[id]
// Full detail view for the admin. Reads from the seed snapshot.

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { user, response: authError } = await requireAuth(request);
  if (authError) return authError;
  if (!hasRole(user, "admin")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const application = SEED_APPLICATIONS.find((a) => a.id === id);
  if (!application) {
    return NextResponse.json(
      { error: "Application not found." },
      { status: 404 },
    );
  }
  const logs = SEED_APPLICATION_LOGS.filter(
    (l) => l.applicationId === id,
  ).sort(
    (a, b) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
  return NextResponse.json({ application, logs });
}
