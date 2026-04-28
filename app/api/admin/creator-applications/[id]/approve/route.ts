import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";
import { requireAuth, hasRole } from "@/lib/supabase/auth-helpers";
import type { CreatorApplication } from "@/types/creator-application";

// PUT /api/admin/creator-applications/[id]/approve
// Finds the application in the creator_applications_state JSONB blob,
// marks it approved, and persists the updated array back.

const PLATFORM_KEY = "__platform__";

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

  let body: { adminUserId?: string };
  try {
    body = await request.json();
  } catch {
    body = {};
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

  const now = new Date().toISOString();
  const original = applications[idx];
  const linkedCreatorId = original.linkedCreatorId ?? `cr-${original.id}`;

  const updated: CreatorApplication = {
    ...original,
    status: "approved",
    reviewedBy: body.adminUserId ?? null,
    reviewedAt: now,
    linkedCreatorId,
    updatedAt: now,
  };

  const newList = [...applications];
  newList[idx] = updated;

  const { error: upsertErr } = await supabase
    .from("creator_applications_state")
    .upsert({ couple_id: PLATFORM_KEY, data: newList, updated_at: now });

  if (upsertErr) {
    return NextResponse.json(
      { error: "DB write failed." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    application: updated,
    createdCreator: {
      id: linkedCreatorId,
      displayName: original.fullName,
      bio: original.bio,
      avatarUrl: original.avatarUrl,
      tier: "standard" as const,
      commissionRate: 0.05,
    },
  });
}
