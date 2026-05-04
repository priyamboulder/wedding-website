import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";
import { requireAuth } from "@/lib/supabase/auth-helpers";

// POST /api/grapevine/reminders
// Body: { session_id }
// Records the user's intent to be reminded about an upcoming session.
// Idempotent — second submit is a no-op success.
export async function POST(request: NextRequest) {
  const { user, response: authError } = await requireAuth(request);
  if (authError) return authError;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { session_id } = (body ?? {}) as { session_id?: string };
  if (!session_id) {
    return NextResponse.json(
      { error: "session_id required" },
      { status: 400 },
    );
  }

  // INSERT … ON CONFLICT DO NOTHING via upsert with ignoreDuplicates.
  const { error } = await supabase
    .from("grapevine_ama_reminders")
    .upsert(
      { session_id, user_id: user.id },
      { onConflict: "session_id,user_id", ignoreDuplicates: true },
    );

  if (error) {
    return NextResponse.json(
      { error: "Could not save reminder" },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
