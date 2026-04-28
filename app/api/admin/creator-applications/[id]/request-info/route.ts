import { NextRequest, NextResponse } from "next/server";
import { SEED_APPLICATIONS } from "@/lib/creators/applications-seed";
import { requireAuth, hasRole } from "@/lib/supabase/auth-helpers";

// PUT /api/admin/creator-applications/[id]/request-info

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { user, response: authError } = await requireAuth(request);
  if (authError) return authError;
  if (!hasRole(user, "admin")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  let body: { adminUserId?: string; request?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  if (!body.request?.trim()) {
    return NextResponse.json(
      { error: "A follow-up question is required." },
      { status: 400 },
    );
  }

  const application = SEED_APPLICATIONS.find((a) => a.id === id);
  if (!application) {
    return NextResponse.json(
      { error: "Application not found." },
      { status: 404 },
    );
  }

  const now = new Date().toISOString();
  return NextResponse.json({
    application: {
      ...application,
      status: "more_info_requested",
      moreInfoRequest: body.request.trim(),
      moreInfoResponse: null,
      updatedAt: now,
    },
  });
}
