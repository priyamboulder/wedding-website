import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";
import { requireAuth, hasRole } from "@/lib/supabase/auth-helpers";
import type {
  CreatorApplication,
  RejectionReasonCategory,
} from "@/types/creator-application";

// PUT /api/admin/creator-applications/[id]/reject
// Finds the application in the creator_applications_state JSONB blob,
// marks it rejected with reason fields, and persists back.

const PLATFORM_KEY = "__platform__";
const REAPPLY_COOLDOWN_DAYS = 90;

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

  let body: {
    adminUserId?: string;
    reasonCategory?: RejectionReasonCategory;
    reasonText?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!body.reasonCategory || !body.reasonText?.trim()) {
    return NextResponse.json(
      { error: "reasonCategory and reasonText are required." },
      { status: 400 },
    );
  }

  // Load the blob
  const { data: row, error: fetchErr } = await supabase
    .from("creator_applications_state")
    .select("data")
    .eq("couple_id", PLATFORM_KEY)
    .maybeSingle();

  if (fetchErr) {
    return NextResponse.json(
      { error: "DB read failed." },
      { status: 500 },
    );
  }

  const applications: CreatorApplication[] = Array.isArray(row?.data)
    ? (row.data as CreatorApplication[])
    : [];

  const idx = applications.findIndex((a) => a.id === id);
  if (idx === -1) {
    return NextResponse.json({ error: "Application not found." }, { status: 404 });
  }

  const now = new Date();
  const reapplyEligibleAt = new Date(
    now.getTime() + REAPPLY_COOLDOWN_DAYS * 86_400_000,
  ).toISOString();

  const updated: CreatorApplication = {
    ...applications[idx],
    status: "rejected",
    rejectionReasonCategory: body.reasonCategory,
    rejectionReasonText: body.reasonText.trim(),
    reviewedBy: body.adminUserId ?? null,
    reviewedAt: now.toISOString(),
    reapplyEligibleAt,
    updatedAt: now.toISOString(),
  };

  const newList = [...applications];
  newList[idx] = updated;

  const { error: upsertErr } = await supabase
    .from("creator_applications_state")
    .upsert({
      couple_id: PLATFORM_KEY,
      data: newList,
      updated_at: now.toISOString(),
    });

  if (upsertErr) {
    return NextResponse.json(
      { error: "DB write failed." },
      { status: 500 },
    );
  }

  return NextResponse.json({ application: updated });
}
