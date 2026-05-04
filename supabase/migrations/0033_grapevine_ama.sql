-- ──────────────────────────────────────────────────────────────────────────
-- Migration 0033: The Grapevine — live AMA + persistent Q&A archive.
--
-- Extends the Planning Circle (/blog) with a fifth tab: scheduled live
-- sessions where a featured expert answers questions from the community
-- in real time, plus the searchable archive that forms once a session ends.
--
-- Naming:
--   - Tables are prefixed `grapevine_ama_*` to avoid colliding with the
--     unrelated community-tab "Grapevine" (a vendor-discussion forum that
--     lives entirely in Zustand/localStorage today; types/grapevine.ts).
--     Despite the shared brand word, the two systems share no data.
--
-- Concurrency / live ops:
--   - Realtime is enabled on grapevine_ama_questions, grapevine_ama_answers,
--     and grapevine_ama_upvotes so the live page can stream queue/answer
--     changes and upvote bumps without polling.
--   - Triggers maintain denormalized counts (upvote_count on questions,
--     total_questions / total_answered on sessions) so the read path stays
--     a single fetch per slug.
--
-- Search:
--   - A generated tsvector column on questions concatenates the question
--     text with the joined answer body (refreshed via trigger when an
--     answer is inserted/updated). One GIN index serves the cross-archive
--     search bar so we don't have to UNION two FTS indexes at read time.
-- ──────────────────────────────────────────────────────────────────────────

-- ── Sessions ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS grapevine_ama_sessions (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title               text NOT NULL,
  slug                text NOT NULL UNIQUE,
  description         text,
  expert_name         text NOT NULL,
  expert_title        text,
  expert_bio          text,
  expert_avatar_url   text,
  expert_credentials  jsonb,
  session_type        text,
  tags                jsonb,
  status              text NOT NULL DEFAULT 'upcoming',
  scheduled_start     timestamptz,
  scheduled_end       timestamptz,
  actual_start        timestamptz,
  actual_end          timestamptz,
  total_questions     integer NOT NULL DEFAULT 0,
  total_answered      integer NOT NULL DEFAULT 0,
  created_at          timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT grapevine_ama_sessions_status_check CHECK (status IN (
    'upcoming', 'live', 'ended', 'archived'
  )),
  CONSTRAINT grapevine_ama_sessions_type_check CHECK (
    session_type IS NULL OR session_type IN (
      'planner', 'vendor', 'real_bride', 'stylist', 'expert', 'pandit', 'caterer'
    )
  )
);

CREATE INDEX IF NOT EXISTS grapevine_ama_sessions_status_idx
  ON grapevine_ama_sessions (status, scheduled_start DESC);
CREATE INDEX IF NOT EXISTS grapevine_ama_sessions_slug_idx
  ON grapevine_ama_sessions (slug);
CREATE INDEX IF NOT EXISTS grapevine_ama_sessions_archived_idx
  ON grapevine_ama_sessions (created_at DESC) WHERE status = 'archived';

-- ── Questions ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS grapevine_ama_questions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id      uuid NOT NULL REFERENCES grapevine_ama_sessions(id) ON DELETE CASCADE,
  -- Nullable so seed rows and admin-ghosted entries can exist without a
  -- backing auth user. RLS forces user_id = auth.uid() on client inserts.
  user_id         uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  persona_tag     text,
  question_text   text NOT NULL,
  is_anonymous    boolean NOT NULL DEFAULT true,
  status          text NOT NULL DEFAULT 'pending',
  upvote_count    integer NOT NULL DEFAULT 0,
  -- Denormalized FTS column. Updated by trigger when the question text or
  -- its answer changes so cross-archive search is a single GIN scan.
  search_vector   tsvector,
  created_at      timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT grapevine_ama_questions_status_check CHECK (status IN (
    'pending', 'approved', 'answered', 'rejected', 'pinned'
  )),
  CONSTRAINT grapevine_ama_questions_text_len CHECK (
    char_length(question_text) > 0 AND char_length(question_text) <= 500
  ),
  CONSTRAINT grapevine_ama_questions_persona_len CHECK (
    persona_tag IS NULL OR char_length(persona_tag) <= 80
  )
);

CREATE INDEX IF NOT EXISTS grapevine_ama_questions_session_idx
  ON grapevine_ama_questions (session_id, status, upvote_count DESC, created_at DESC);
CREATE INDEX IF NOT EXISTS grapevine_ama_questions_user_idx
  ON grapevine_ama_questions (user_id);
CREATE INDEX IF NOT EXISTS grapevine_ama_questions_search_idx
  ON grapevine_ama_questions USING gin (search_vector);

-- ── Answers ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS grapevine_ama_answers (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id     uuid NOT NULL UNIQUE REFERENCES grapevine_ama_questions(id) ON DELETE CASCADE,
  session_id      uuid NOT NULL REFERENCES grapevine_ama_sessions(id) ON DELETE CASCADE,
  answer_text     text NOT NULL,
  answered_by     text,
  is_highlighted  boolean NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT grapevine_ama_answers_text_len CHECK (
    char_length(answer_text) > 0
  )
);

CREATE INDEX IF NOT EXISTS grapevine_ama_answers_session_idx
  ON grapevine_ama_answers (session_id, created_at DESC);

-- ── Upvotes ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS grapevine_ama_upvotes (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id  uuid NOT NULL REFERENCES grapevine_ama_questions(id) ON DELETE CASCADE,
  user_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at   timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT grapevine_ama_upvotes_unique UNIQUE (question_id, user_id)
);

CREATE INDEX IF NOT EXISTS grapevine_ama_upvotes_question_idx
  ON grapevine_ama_upvotes (question_id);
CREATE INDEX IF NOT EXISTS grapevine_ama_upvotes_user_idx
  ON grapevine_ama_upvotes (user_id);

-- ── Reactions ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS grapevine_ama_reactions (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  answer_id      uuid NOT NULL REFERENCES grapevine_ama_answers(id) ON DELETE CASCADE,
  user_id        uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reaction_type  text NOT NULL,
  created_at     timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT grapevine_ama_reactions_type_check CHECK (reaction_type IN (
    'helpful', 'real_talk', 'needed_this', 'fire'
  )),
  CONSTRAINT grapevine_ama_reactions_unique UNIQUE (answer_id, user_id, reaction_type)
);

CREATE INDEX IF NOT EXISTS grapevine_ama_reactions_answer_idx
  ON grapevine_ama_reactions (answer_id);
CREATE INDEX IF NOT EXISTS grapevine_ama_reactions_user_idx
  ON grapevine_ama_reactions (user_id);

-- ── Reminders ─────────────────────────────────────────────────────────────
-- Lightweight reminder-intent table so the "Remind Me" CTA on upcoming
-- sessions has somewhere to land. We don't yet have notification
-- infrastructure here, but storing the intent lets us send a batch later
-- (or the admin tool can show "X people are waiting on this").

CREATE TABLE IF NOT EXISTS grapevine_ama_reminders (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id   uuid NOT NULL REFERENCES grapevine_ama_sessions(id) ON DELETE CASCADE,
  user_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at   timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT grapevine_ama_reminders_unique UNIQUE (session_id, user_id)
);

-- ── Search vector trigger ─────────────────────────────────────────────────
-- Keep grapevine_ama_questions.search_vector in sync with both the
-- question text and the (optional) joined answer body. We refresh from
-- the answers side too because answers arrive after questions.

CREATE OR REPLACE FUNCTION grapevine_ama_questions_refresh_search()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  ans text;
BEGIN
  SELECT a.answer_text INTO ans
    FROM grapevine_ama_answers a
   WHERE a.question_id = NEW.id
   LIMIT 1;
  NEW.search_vector :=
      setweight(to_tsvector('english', coalesce(NEW.question_text, '')), 'A')
    || setweight(to_tsvector('english', coalesce(ans, '')), 'B');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS grapevine_ama_questions_search_trg ON grapevine_ama_questions;
CREATE TRIGGER grapevine_ama_questions_search_trg
  BEFORE INSERT OR UPDATE OF question_text ON grapevine_ama_questions
  FOR EACH ROW EXECUTE FUNCTION grapevine_ama_questions_refresh_search();

CREATE OR REPLACE FUNCTION grapevine_ama_answers_refresh_question_search()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  q_text text;
  q_id   uuid;
BEGIN
  q_id := COALESCE(NEW.question_id, OLD.question_id);
  IF q_id IS NULL THEN RETURN COALESCE(NEW, OLD); END IF;
  SELECT q.question_text INTO q_text
    FROM grapevine_ama_questions q
   WHERE q.id = q_id;
  UPDATE grapevine_ama_questions
     SET search_vector =
           setweight(to_tsvector('english', coalesce(q_text, '')), 'A')
        || setweight(to_tsvector('english', coalesce(
            CASE WHEN TG_OP = 'DELETE' THEN '' ELSE NEW.answer_text END, '')), 'B')
   WHERE id = q_id;
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS grapevine_ama_answers_search_trg ON grapevine_ama_answers;
CREATE TRIGGER grapevine_ama_answers_search_trg
  AFTER INSERT OR UPDATE OF answer_text OR DELETE ON grapevine_ama_answers
  FOR EACH ROW EXECUTE FUNCTION grapevine_ama_answers_refresh_question_search();

-- ── Count maintenance triggers ────────────────────────────────────────────
-- upvote_count on questions ←  inserts/deletes on grapevine_ama_upvotes
-- session.total_questions    ←  question rows (excluding 'rejected')
-- session.total_answered     ←  answer rows

CREATE OR REPLACE FUNCTION grapevine_ama_upvotes_count_trg()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE grapevine_ama_questions
       SET upvote_count = upvote_count + 1
     WHERE id = NEW.question_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE grapevine_ama_questions
       SET upvote_count = GREATEST(upvote_count - 1, 0)
     WHERE id = OLD.question_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS grapevine_ama_upvotes_count_trg ON grapevine_ama_upvotes;
CREATE TRIGGER grapevine_ama_upvotes_count_trg
  AFTER INSERT OR DELETE ON grapevine_ama_upvotes
  FOR EACH ROW EXECUTE FUNCTION grapevine_ama_upvotes_count_trg();

CREATE OR REPLACE FUNCTION grapevine_ama_questions_session_counts_trg()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.status <> 'rejected' THEN
      UPDATE grapevine_ama_sessions
         SET total_questions = total_questions + 1
       WHERE id = NEW.session_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.status <> 'rejected' THEN
      UPDATE grapevine_ama_sessions
         SET total_questions = GREATEST(total_questions - 1, 0)
       WHERE id = OLD.session_id;
    END IF;
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status = 'rejected' AND NEW.status <> 'rejected' THEN
      UPDATE grapevine_ama_sessions
         SET total_questions = total_questions + 1
       WHERE id = NEW.session_id;
    ELSIF OLD.status <> 'rejected' AND NEW.status = 'rejected' THEN
      UPDATE grapevine_ama_sessions
         SET total_questions = GREATEST(total_questions - 1, 0)
       WHERE id = NEW.session_id;
    END IF;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS grapevine_ama_questions_session_counts_trg ON grapevine_ama_questions;
CREATE TRIGGER grapevine_ama_questions_session_counts_trg
  AFTER INSERT OR UPDATE OF status OR DELETE ON grapevine_ama_questions
  FOR EACH ROW EXECUTE FUNCTION grapevine_ama_questions_session_counts_trg();

CREATE OR REPLACE FUNCTION grapevine_ama_answers_session_counts_trg()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE grapevine_ama_sessions
       SET total_answered = total_answered + 1
     WHERE id = NEW.session_id;
    -- Mark the question as answered (idempotent)
    UPDATE grapevine_ama_questions
       SET status = 'answered'
     WHERE id = NEW.question_id AND status <> 'answered';
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE grapevine_ama_sessions
       SET total_answered = GREATEST(total_answered - 1, 0)
     WHERE id = OLD.session_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS grapevine_ama_answers_session_counts_trg ON grapevine_ama_answers;
CREATE TRIGGER grapevine_ama_answers_session_counts_trg
  AFTER INSERT OR DELETE ON grapevine_ama_answers
  FOR EACH ROW EXECUTE FUNCTION grapevine_ama_answers_session_counts_trg();

-- ── Aggregate view for archive cards / live header ────────────────────────
-- Lets the public Grapevine tab pull stats (questions, answered, upvotes,
-- reaction count) for each session in one shot.

CREATE OR REPLACE VIEW grapevine_ama_session_stats
WITH (security_invoker = false) AS
SELECT
  s.id AS session_id,
  s.total_questions,
  s.total_answered,
  COALESCE(SUM(q.upvote_count), 0)::int AS total_upvotes,
  (SELECT COUNT(*)::int
     FROM grapevine_ama_reactions r
     JOIN grapevine_ama_answers a ON a.id = r.answer_id
     WHERE a.session_id = s.id) AS total_reactions
FROM grapevine_ama_sessions s
LEFT JOIN grapevine_ama_questions q
  ON q.session_id = s.id AND q.status <> 'rejected'
GROUP BY s.id, s.total_questions, s.total_answered;

GRANT SELECT ON grapevine_ama_session_stats TO anon, authenticated;

-- ── Reaction counts view ──────────────────────────────────────────────────
-- One row per (answer_id, reaction_type) so the live page can render
-- counts under each answer without a per-card aggregate query.

CREATE OR REPLACE VIEW grapevine_ama_reaction_counts
WITH (security_invoker = false) AS
SELECT
  r.answer_id,
  r.reaction_type,
  COUNT(r.id)::int AS reaction_count
FROM grapevine_ama_reactions r
GROUP BY r.answer_id, r.reaction_type;

GRANT SELECT ON grapevine_ama_reaction_counts TO anon, authenticated;

-- ── RLS ───────────────────────────────────────────────────────────────────

ALTER TABLE grapevine_ama_sessions   ENABLE ROW LEVEL SECURITY;
ALTER TABLE grapevine_ama_questions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE grapevine_ama_answers    ENABLE ROW LEVEL SECURITY;
ALTER TABLE grapevine_ama_upvotes    ENABLE ROW LEVEL SECURITY;
ALTER TABLE grapevine_ama_reactions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE grapevine_ama_reminders  ENABLE ROW LEVEL SECURITY;

-- Sessions: world-readable
DROP POLICY IF EXISTS "Public reads sessions" ON grapevine_ama_sessions;
CREATE POLICY "Public reads sessions"
  ON grapevine_ama_sessions FOR SELECT TO anon, authenticated
  USING (true);

-- Questions: world-readable except rejected; authed users insert their own
DROP POLICY IF EXISTS "Public reads visible questions" ON grapevine_ama_questions;
CREATE POLICY "Public reads visible questions"
  ON grapevine_ama_questions FOR SELECT TO anon, authenticated
  USING (status <> 'rejected');

DROP POLICY IF EXISTS "Users insert own questions" ON grapevine_ama_questions;
CREATE POLICY "Users insert own questions"
  ON grapevine_ama_questions FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Answers: world-readable; admin-only inserts handled via service role
DROP POLICY IF EXISTS "Public reads answers" ON grapevine_ama_answers;
CREATE POLICY "Public reads answers"
  ON grapevine_ama_answers FOR SELECT TO anon, authenticated
  USING (true);

-- Upvotes: authed users insert/delete their own; everyone reads aggregate
-- counts via the question.upvote_count column. Authed users may read their
-- own rows so the UI can highlight pressed buttons.
DROP POLICY IF EXISTS "Users read own upvotes" ON grapevine_ama_upvotes;
CREATE POLICY "Users read own upvotes"
  ON grapevine_ama_upvotes FOR SELECT TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users insert own upvotes" ON grapevine_ama_upvotes;
CREATE POLICY "Users insert own upvotes"
  ON grapevine_ama_upvotes FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users delete own upvotes" ON grapevine_ama_upvotes;
CREATE POLICY "Users delete own upvotes"
  ON grapevine_ama_upvotes FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- Reactions: similar pattern — authed users insert/delete their own,
-- counts surface via the reaction_counts view.
DROP POLICY IF EXISTS "Users read own reactions" ON grapevine_ama_reactions;
CREATE POLICY "Users read own reactions"
  ON grapevine_ama_reactions FOR SELECT TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users insert own reactions" ON grapevine_ama_reactions;
CREATE POLICY "Users insert own reactions"
  ON grapevine_ama_reactions FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users delete own reactions" ON grapevine_ama_reactions;
CREATE POLICY "Users delete own reactions"
  ON grapevine_ama_reactions FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- Reminders: authed users manage their own
DROP POLICY IF EXISTS "Users read own reminders" ON grapevine_ama_reminders;
CREATE POLICY "Users read own reminders"
  ON grapevine_ama_reminders FOR SELECT TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users insert own reminders" ON grapevine_ama_reminders;
CREATE POLICY "Users insert own reminders"
  ON grapevine_ama_reminders FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users delete own reminders" ON grapevine_ama_reminders;
CREATE POLICY "Users delete own reminders"
  ON grapevine_ama_reminders FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- ── Realtime ──────────────────────────────────────────────────────────────
-- Stream queue/answer/upvote changes to the live page.

ALTER TABLE grapevine_ama_questions REPLICA IDENTITY FULL;
ALTER TABLE grapevine_ama_answers   REPLICA IDENTITY FULL;
ALTER TABLE grapevine_ama_upvotes   REPLICA IDENTITY FULL;
ALTER TABLE grapevine_ama_reactions REPLICA IDENTITY FULL;

DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE grapevine_ama_questions;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE grapevine_ama_answers;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE grapevine_ama_upvotes;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE grapevine_ama_reactions;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
END $$;
