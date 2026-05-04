import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";
import { requireAuth, hasRole } from "@/lib/supabase/auth-helpers";
import type { GrapevineQuestionStatus } from "@/types/grapevine-ama";

const VALID_STATUSES: GrapevineQuestionStatus[] = [
  "pending",
  "approved",
  "answered",
  "rejected",
  "pinned",
];

// PATCH /api/grapevine/admin/questions/[id]
// Body: { status?: GrapevineQuestionStatus }
// Used by admins to approve / reject / pin pending questions.
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { user, response: authError } = await requireAuth(request);
  if (authError) return authError;
  if (!hasRole(user, "admin")) {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  const { id } = await params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const { status } = body as { status?: string };
  if (!status || !VALID_STATUSES.includes(status as GrapevineQuestionStatus)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("grapevine_ama_questions")
    .update({ status })
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json(
      { error: error?.message ?? "Could not update question" },
      { status: 500 },
    );
  }
  return NextResponse.json({ ok: true, question: data });
}
