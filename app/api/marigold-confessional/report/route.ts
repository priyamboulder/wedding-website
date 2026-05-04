import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

// POST /api/marigold-confessional/report
// Body: { target: 'post' | 'comment', id: string }
//
// Sets is_flagged = true on the target. Hidden state stays manual — a flag
// surfaces in the moderation queue but doesn't auto-hide. No auth required;
// reports are intentionally low-friction.
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { target, id } = (body ?? {}) as { target?: string; id?: string };
  if (target !== "post" && target !== "comment") {
    return NextResponse.json({ error: "Invalid target" }, { status: 400 });
  }
  if (typeof id !== "string" || !id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const table =
    target === "post" ? "marigold_confessions" : "marigold_confession_comments";

  const { error } = await supabase
    .from(table)
    .update({ is_flagged: true })
    .eq("id", id);

  if (error) {
    return NextResponse.json(
      { error: "Could not record report" },
      { status: 500 },
    );
  }
  return NextResponse.json({ ok: true });
}
