import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";
import { requireAuth, hasRole } from "@/lib/supabase/auth-helpers";

// PATCH /api/grapevine/admin/sessions/[id]
// Body may contain { status?, ...editable fields }. Status transitions
// stamp actual_start/actual_end automatically.
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

  const patch = body as Record<string, unknown>;

  // Stamp actual_start / actual_end automatically based on status.
  if (patch.status === "live" && !patch.actual_start) {
    patch.actual_start = new Date().toISOString();
  }
  if (
    (patch.status === "ended" || patch.status === "archived") &&
    !patch.actual_end
  ) {
    patch.actual_end = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from("grapevine_ama_sessions")
    .update(patch)
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json(
      { error: error?.message ?? "Could not update session" },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, session: data });
}
