import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";
import { requireAuth, hasRole } from "@/lib/supabase/auth-helpers";

// PATCH /api/grapevine/admin/answers/[id]
// Body: { answer_text?, is_highlighted? } — admin edits to a posted answer.
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

  const b = body as { answer_text?: string; is_highlighted?: boolean };
  const patch: Record<string, unknown> = {};
  if (typeof b.answer_text === "string") patch.answer_text = b.answer_text.trim();
  if (typeof b.is_highlighted === "boolean") patch.is_highlighted = b.is_highlighted;

  const { data, error } = await supabase
    .from("grapevine_ama_answers")
    .update(patch)
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json(
      { error: error?.message ?? "Could not update answer" },
      { status: 500 },
    );
  }
  return NextResponse.json({ ok: true, answer: data });
}
