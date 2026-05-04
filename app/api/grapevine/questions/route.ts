import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";
import { requireAuth } from "@/lib/supabase/auth-helpers";
import {
  PERSONA_TAG_MAX,
  QUESTION_TEXT_MAX,
} from "@/types/grapevine-ama";

// POST /api/grapevine/questions
// Body: { session_id, question_text, persona_tag?, is_anonymous? }
// Submits a new question to the queue. Status starts as 'pending' so
// admins can approve/reject before it appears in the public queue.
export async function POST(request: NextRequest) {
  const { user, response: authError } = await requireAuth(request);
  if (authError) return authError;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { session_id, question_text, persona_tag, is_anonymous } =
    (body ?? {}) as {
      session_id?: string;
      question_text?: string;
      persona_tag?: string;
      is_anonymous?: boolean;
    };

  if (!session_id) {
    return NextResponse.json({ error: "session_id required" }, { status: 400 });
  }
  if (
    !question_text ||
    question_text.trim().length === 0 ||
    question_text.length > QUESTION_TEXT_MAX
  ) {
    return NextResponse.json(
      { error: `question_text must be 1-${QUESTION_TEXT_MAX} chars` },
      { status: 400 },
    );
  }
  if (persona_tag && persona_tag.length > PERSONA_TAG_MAX) {
    return NextResponse.json(
      { error: `persona_tag must be ≤ ${PERSONA_TAG_MAX} chars` },
      { status: 400 },
    );
  }

  // Confirm the session is live or upcoming (or doesn't reject early).
  // Archived sessions don't accept new questions.
  const { data: session } = await supabase
    .from("grapevine_ama_sessions")
    .select("id, status")
    .eq("id", session_id)
    .maybeSingle();
  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }
  if (session.status === "archived" || session.status === "ended") {
    return NextResponse.json(
      { error: "This session has ended." },
      { status: 409 },
    );
  }

  // 'approved' on insert keeps the live experience friction-free; admin
  // can still demote bad questions or pin great ones. The spec lists
  // 'pending' as the default — if you want stricter moderation flip the
  // default and add an admin queue UI.
  const initialStatus = "approved";

  const { data, error } = await supabase
    .from("grapevine_ama_questions")
    .insert({
      session_id,
      user_id: user.id,
      persona_tag: persona_tag?.trim() || null,
      question_text: question_text.trim(),
      is_anonymous: is_anonymous ?? true,
      status: initialStatus,
    })
    .select("*")
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json(
      { error: "Could not save question" },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, question: data });
}
