// Query helpers for The Grapevine — read paths used by API routes and
// server components. Centralized here so the live page, the Planning
// Circle archive grid, the dynamic header banner, and the search bar
// share one shape (and one set of count-aware mappers).

import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  GrapevineAnswer,
  GrapevineQAPair,
  GrapevineQuestion,
  GrapevineReactionType,
  GrapevineSearchHit,
  GrapevineSession,
  GrapevineSessionWithStats,
} from "@/types/grapevine-ama";
import { REACTION_ORDER } from "@/types/grapevine-ama";

// ── Sessions ──────────────────────────────────────────────────────────────

export async function fetchActiveOrUpcomingSession(
  client: SupabaseClient,
): Promise<GrapevineSession | null> {
  // Live session (priority) → otherwise the soonest upcoming session
  // within the next 30 days. Used by the Planning Circle header banner
  // and the homepage tie-in.
  const { data: live } = await client
    .from("grapevine_ama_sessions")
    .select("*")
    .eq("status", "live")
    .order("actual_start", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (live) return live as GrapevineSession;

  const { data: upcoming } = await client
    .from("grapevine_ama_sessions")
    .select("*")
    .eq("status", "upcoming")
    .order("scheduled_start", { ascending: true })
    .limit(1)
    .maybeSingle();
  return (upcoming as GrapevineSession | null) ?? null;
}

export async function fetchSessionBySlug(
  client: SupabaseClient,
  slug: string,
): Promise<GrapevineSession | null> {
  const { data } = await client
    .from("grapevine_ama_sessions")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  return (data as GrapevineSession | null) ?? null;
}

export async function fetchAllSessionsWithStats(
  client: SupabaseClient,
): Promise<GrapevineSessionWithStats[]> {
  // Two-step join: pull sessions + the stats view, merge in JS so we don't
  // need a Postgres function. The stats view is small (one row per session).
  const [{ data: sessions }, { data: stats }] = await Promise.all([
    client
      .from("grapevine_ama_sessions")
      .select("*")
      .order("created_at", { ascending: false }),
    client.from("grapevine_ama_session_stats").select("*"),
  ]);

  const statMap = new Map<
    string,
    { total_upvotes: number; total_reactions: number }
  >();
  for (const s of (stats ?? []) as Array<{
    session_id: string;
    total_upvotes: number;
    total_reactions: number;
  }>) {
    statMap.set(s.session_id, {
      total_upvotes: s.total_upvotes ?? 0,
      total_reactions: s.total_reactions ?? 0,
    });
  }

  return ((sessions ?? []) as GrapevineSession[]).map((s) => ({
    ...s,
    total_upvotes: statMap.get(s.id)?.total_upvotes ?? 0,
    total_reactions: statMap.get(s.id)?.total_reactions ?? 0,
  }));
}

// ── Q&A pairs ─────────────────────────────────────────────────────────────

export async function fetchSessionQA(
  client: SupabaseClient,
  sessionId: string,
): Promise<{
  answered: GrapevineQAPair[];
  queue: GrapevineQuestion[];
}> {
  // We pull questions + answers + per-answer reaction counts in three
  // parallel queries, then stitch — avoids a server-side function while
  // staying within one network round trip.
  const [{ data: questions }, { data: answers }, { data: reactions }] =
    await Promise.all([
      client
        .from("grapevine_ama_questions")
        .select(
          "id, session_id, user_id, persona_tag, question_text, is_anonymous, status, upvote_count, seed_upvotes, created_at",
        )
        .eq("session_id", sessionId)
        .neq("status", "rejected")
        .order("created_at", { ascending: true }),
      client
        .from("grapevine_ama_answers")
        .select(
          "id, question_id, session_id, answer_text, answered_by, is_highlighted, seed_reaction_helpful, seed_reaction_real_talk, seed_reaction_needed_this, seed_reaction_fire, created_at",
        )
        .eq("session_id", sessionId),
      client
        .from("grapevine_ama_reaction_counts")
        .select("answer_id, reaction_type, reaction_count"),
    ]);

  const reactionMap = new Map<string, Record<GrapevineReactionType, number>>();
  for (const r of (reactions ?? []) as Array<{
    answer_id: string;
    reaction_type: GrapevineReactionType;
    reaction_count: number;
  }>) {
    if (!reactionMap.has(r.answer_id)) {
      reactionMap.set(r.answer_id, emptyReactionCounts());
    }
    reactionMap.get(r.answer_id)![r.reaction_type] = r.reaction_count;
  }

  const answersByQ = new Map<string, GrapevineAnswer>();
  for (const raw of (answers ?? []) as Array<
    GrapevineAnswer & {
      seed_reaction_helpful: number;
      seed_reaction_real_talk: number;
      seed_reaction_needed_this: number;
      seed_reaction_fire: number;
    }
  >) {
    const base = reactionMap.get(raw.id) ?? emptyReactionCounts();
    const merged: Record<GrapevineReactionType, number> = {
      helpful: base.helpful + (raw.seed_reaction_helpful ?? 0),
      real_talk: base.real_talk + (raw.seed_reaction_real_talk ?? 0),
      needed_this: base.needed_this + (raw.seed_reaction_needed_this ?? 0),
      fire: base.fire + (raw.seed_reaction_fire ?? 0),
    };
    answersByQ.set(raw.question_id, {
      id: raw.id,
      question_id: raw.question_id,
      session_id: raw.session_id,
      answer_text: raw.answer_text,
      answered_by: raw.answered_by,
      is_highlighted: raw.is_highlighted,
      created_at: raw.created_at,
      reaction_counts: merged,
    });
  }

  const answered: GrapevineQAPair[] = [];
  const queue: GrapevineQuestion[] = [];
  for (const raw of (questions ?? []) as Array<
    GrapevineQuestion & { seed_upvotes: number }
  >) {
    const total_upvotes = (raw.upvote_count ?? 0) + (raw.seed_upvotes ?? 0);
    const q: GrapevineQuestion = {
      id: raw.id,
      session_id: raw.session_id,
      user_id: raw.user_id,
      persona_tag: raw.persona_tag,
      question_text: raw.question_text,
      is_anonymous: raw.is_anonymous,
      status: raw.status,
      upvote_count: raw.upvote_count,
      total_upvotes,
      created_at: raw.created_at,
    };
    const ans = answersByQ.get(raw.id);
    if (ans) {
      answered.push({ question: q, answer: ans });
    } else if (raw.status !== "rejected") {
      queue.push(q);
    }
  }

  // Pinned first, then most-answered first by created_at desc (recency
  // beats upvotes once the question is answered — feels more like a feed).
  answered.sort((a, b) => {
    const aPinned = a.question.status === "pinned" ? 1 : 0;
    const bPinned = b.question.status === "pinned" ? 1 : 0;
    if (aPinned !== bPinned) return bPinned - aPinned;
    return (b.answer?.created_at ?? "").localeCompare(
      a.answer?.created_at ?? "",
    );
  });

  // Queue: pinned first, then upvote count desc, then chronological.
  queue.sort((a, b) => {
    const aPinned = a.status === "pinned" ? 1 : 0;
    const bPinned = b.status === "pinned" ? 1 : 0;
    if (aPinned !== bPinned) return bPinned - aPinned;
    if ((b.total_upvotes ?? 0) !== (a.total_upvotes ?? 0)) {
      return (b.total_upvotes ?? 0) - (a.total_upvotes ?? 0);
    }
    return a.created_at.localeCompare(b.created_at);
  });

  return { answered, queue };
}

// ── User-specific overlays (which buttons to highlight) ───────────────────

export async function fetchUserUpvotes(
  client: SupabaseClient,
  userId: string,
  sessionId: string,
): Promise<Set<string>> {
  const { data } = await client
    .from("grapevine_ama_upvotes")
    .select("question_id, grapevine_ama_questions!inner(session_id)")
    .eq("user_id", userId)
    .eq("grapevine_ama_questions.session_id", sessionId);
  return new Set(
    ((data ?? []) as Array<{ question_id: string }>).map((r) => r.question_id),
  );
}

export async function fetchUserReactions(
  client: SupabaseClient,
  userId: string,
  sessionId: string,
): Promise<Map<string, Set<GrapevineReactionType>>> {
  const { data } = await client
    .from("grapevine_ama_reactions")
    .select("answer_id, reaction_type, grapevine_ama_answers!inner(session_id)")
    .eq("user_id", userId)
    .eq("grapevine_ama_answers.session_id", sessionId);
  const m = new Map<string, Set<GrapevineReactionType>>();
  for (const r of (data ?? []) as Array<{
    answer_id: string;
    reaction_type: GrapevineReactionType;
  }>) {
    if (!m.has(r.answer_id)) m.set(r.answer_id, new Set());
    m.get(r.answer_id)!.add(r.reaction_type);
  }
  return m;
}

// ── Search ────────────────────────────────────────────────────────────────

export async function searchAcrossArchives(
  client: SupabaseClient,
  rawQuery: string,
  limit = 25,
): Promise<GrapevineSearchHit[]> {
  const q = rawQuery.trim();
  if (q.length === 0) return [];
  // websearch_to_tsquery is forgiving of natural-language queries
  // ("how do i tell my MIL no") and is still a single GIN scan.
  const { data } = await client
    .from("grapevine_ama_questions")
    .select(
      "id, question_text, status, session_id, grapevine_ama_sessions!inner(slug, title, expert_name, status), grapevine_ama_answers(answer_text, is_highlighted)",
    )
    .neq("status", "rejected")
    .textSearch("search_vector", q, { type: "websearch", config: "english" })
    .limit(limit);

  // PostgREST returns embedded relations as arrays even for one-to-one
  // joins (the typed inference can't tell that the FK is unique). Massage
  // both sides into the single-row shape the app expects.
  type EmbeddedSession = {
    slug: string;
    title: string;
    expert_name: string;
    status: string;
  };
  type EmbeddedAnswer = {
    answer_text: string;
    is_highlighted: boolean;
  };
  type SearchRow = {
    id: string;
    question_text: string;
    session_id: string;
    grapevine_ama_sessions: EmbeddedSession | EmbeddedSession[];
    grapevine_ama_answers: EmbeddedAnswer | EmbeddedAnswer[] | null;
  };

  return ((data ?? []) as unknown as SearchRow[]).map((row) => {
    const sess = Array.isArray(row.grapevine_ama_sessions)
      ? row.grapevine_ama_sessions[0]
      : row.grapevine_ama_sessions;
    const ansArr = Array.isArray(row.grapevine_ama_answers)
      ? row.grapevine_ama_answers
      : row.grapevine_ama_answers
        ? [row.grapevine_ama_answers]
        : [];
    return {
      question_id: row.id,
      question_text: row.question_text,
      answer_text: ansArr[0]?.answer_text ?? null,
      session_id: row.session_id,
      session_slug: sess?.slug ?? "",
      session_title: sess?.title ?? "",
      expert_name: sess?.expert_name ?? "",
      is_highlighted: ansArr[0]?.is_highlighted ?? false,
    };
  });
}

// ── Helpers ───────────────────────────────────────────────────────────────

function emptyReactionCounts(): Record<GrapevineReactionType, number> {
  const out = {} as Record<GrapevineReactionType, number>;
  for (const k of REACTION_ORDER) out[k] = 0;
  return out;
}
