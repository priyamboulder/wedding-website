import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";
import { requireAuth } from "@/lib/supabase/auth-helpers";
import {
  REACTION_ORDER,
  type GrapevineReactionType,
} from "@/types/grapevine-ama";

const VALID = new Set<GrapevineReactionType>(REACTION_ORDER);

// POST /api/grapevine/reactions
// Body: { answer_id, reaction_type }
// Toggles a single reaction. Returns refreshed counts for the answer
// (live + seed) so the client can update without a full reload.
export async function POST(request: NextRequest) {
  const { user, response: authError } = await requireAuth(request);
  if (authError) return authError;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { answer_id, reaction_type } = (body ?? {}) as {
    answer_id?: string;
    reaction_type?: string;
  };

  if (!answer_id) {
    return NextResponse.json(
      { error: "answer_id required" },
      { status: 400 },
    );
  }
  if (!reaction_type || !VALID.has(reaction_type as GrapevineReactionType)) {
    return NextResponse.json(
      { error: "Invalid reaction_type" },
      { status: 400 },
    );
  }

  const { data: existing } = await supabase
    .from("grapevine_ama_reactions")
    .select("id")
    .eq("answer_id", answer_id)
    .eq("user_id", user.id)
    .eq("reaction_type", reaction_type)
    .maybeSingle();

  let active: boolean;
  if (existing) {
    await supabase
      .from("grapevine_ama_reactions")
      .delete()
      .eq("id", existing.id);
    active = false;
  } else {
    const { error: insErr } = await supabase
      .from("grapevine_ama_reactions")
      .insert({ answer_id, user_id: user.id, reaction_type });
    if (insErr) {
      return NextResponse.json(
        { error: "Could not record reaction" },
        { status: 500 },
      );
    }
    active = true;
  }

  // Refresh combined counts for this answer.
  const [{ data: liveCounts }, { data: ans }] = await Promise.all([
    supabase
      .from("grapevine_ama_reaction_counts")
      .select("reaction_type, reaction_count")
      .eq("answer_id", answer_id),
    supabase
      .from("grapevine_ama_answers")
      .select(
        "seed_reaction_helpful, seed_reaction_real_talk, seed_reaction_needed_this, seed_reaction_fire",
      )
      .eq("id", answer_id)
      .maybeSingle(),
  ]);

  const counts = {
    helpful: (ans as { seed_reaction_helpful?: number })?.seed_reaction_helpful ?? 0,
    real_talk: (ans as { seed_reaction_real_talk?: number })?.seed_reaction_real_talk ?? 0,
    needed_this: (ans as { seed_reaction_needed_this?: number })?.seed_reaction_needed_this ?? 0,
    fire: (ans as { seed_reaction_fire?: number })?.seed_reaction_fire ?? 0,
  };
  for (const r of (liveCounts ?? []) as Array<{
    reaction_type: GrapevineReactionType;
    reaction_count: number;
  }>) {
    counts[r.reaction_type] = (counts[r.reaction_type] ?? 0) + r.reaction_count;
  }

  return NextResponse.json({ ok: true, active, counts });
}
