import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";
import { requireAuth, hasRole } from "@/lib/supabase/auth-helpers";

// POST /api/grapevine/admin/answers
// Body: { question_id, answer_text, is_highlighted?, answered_by? }
// Creates the answer row. The session counts trigger flips the question
// to status='answered' automatically.
export async function POST(request: NextRequest) {
  const { user, response: authError } = await requireAuth(request);
  if (authError) return authError;
  if (!hasRole(user, "admin")) {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const b = body as {
    question_id?: string;
    answer_text?: string;
    is_highlighted?: boolean;
    answered_by?: string;
  };
  if (!b.question_id || !b.answer_text || !b.answer_text.trim()) {
    return NextResponse.json(
      { error: "question_id and answer_text required" },
      { status: 400 },
    );
  }

  // Pull the session_id off the question — admin doesn't need to send it.
  const { data: q } = await supabase
    .from("grapevine_ama_questions")
    .select("session_id")
    .eq("id", b.question_id)
    .maybeSingle();
  if (!q) {
    return NextResponse.json({ error: "Question not found" }, { status: 404 });
  }

  // Default answered_by to the session's expert_name if not specified.
  let answered_by = b.answered_by ?? null;
  if (!answered_by) {
    const { data: s } = await supabase
      .from("grapevine_ama_sessions")
      .select("expert_name")
      .eq("id", q.session_id)
      .maybeSingle();
    answered_by = s?.expert_name ?? null;
  }

  const { data, error } = await supabase
    .from("grapevine_ama_answers")
    .insert({
      question_id: b.question_id,
      session_id: q.session_id,
      answer_text: b.answer_text.trim(),
      answered_by,
      is_highlighted: !!b.is_highlighted,
    })
    .select("*")
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json(
      { error: error?.message ?? "Could not save answer" },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, answer: data });
}
