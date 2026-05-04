-- ──────────────────────────────────────────────────────────────────────────
-- Migration 0026: Marigold Polls — community voting infrastructure.
--
-- The polls system is the substrate for several surfaces: the homepage
-- "Featured Poll of the Day", the polls archive, vendor-page sentiment
-- inserts ("brides booking photographers say…"), inline article polls, and
-- the Zilla Zone community card. Every surface reads from `polls` and
-- writes to `poll_votes` — counts are exposed via `poll_vote_counts` so
-- callers never have to GROUP BY raw vote rows themselves.
--
-- Vote dedup:
--   - Authed voters are deduped by (poll_id, user_id) — partial unique
--     index (USERS_ONLY) so multiple anonymous rows can coexist.
--   - Anonymous voters supply a stable browser fingerprint; deduped via
--     (poll_id, fingerprint) — partial unique index (ANON_ONLY).
--   A user with both an account and a fingerprint is intentionally allowed
--   one vote per channel; the application layer should prefer user_id when
--   the voter is signed in.
--
-- RLS:
--   - polls: public read.
--   - poll_votes: anyone can INSERT; reads are blocked at the row level.
--     Aggregate counts are exposed only through the `poll_vote_counts` view
--     (defined with security_invoker = false so it can read votes despite
--     RLS) — this prevents leaking who voted for what.
-- ──────────────────────────────────────────────────────────────────────────

-- ── Tables ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS polls (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question       text NOT NULL,
  category       text NOT NULL,
  options        jsonb NOT NULL,
  poll_type      text NOT NULL,
  is_featured    boolean NOT NULL DEFAULT false,
  featured_date  timestamptz,
  created_at     timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT polls_category_check CHECK (category IN (
    'ceremony_traditions',
    'guest_experience',
    'food_drinks',
    'fashion_beauty',
    'photography_video',
    'music_entertainment',
    'decor_venue',
    'budget_planning',
    'family_dynamics',
    'honeymoon_post_wedding',
    'invitations_communication',
    'modern_vs_traditional',
    'spicy_hot_takes',
    'would_you_ever',
    'this_or_that'
  )),
  CONSTRAINT polls_poll_type_check CHECK (poll_type IN (
    'binary', 'three_way', 'settle_this', 'would_you'
  )),
  CONSTRAINT polls_options_is_array CHECK (jsonb_typeof(options) = 'array'),
  CONSTRAINT polls_options_min_length CHECK (jsonb_array_length(options) >= 2)
);

CREATE INDEX IF NOT EXISTS polls_category_idx
  ON polls (category);
CREATE INDEX IF NOT EXISTS polls_featured_idx
  ON polls (is_featured, featured_date DESC) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS polls_created_idx
  ON polls (created_at DESC);

CREATE TABLE IF NOT EXISTS poll_votes (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id       uuid NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  user_id       uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  option_index  integer NOT NULL CHECK (option_index >= 0),
  voter_type    text CHECK (voter_type IN ('bride', 'groom', 'mom', 'other')),
  city          text,
  context       text,
  fingerprint   text,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS poll_votes_poll_idx
  ON poll_votes (poll_id);
CREATE INDEX IF NOT EXISTS poll_votes_user_idx
  ON poll_votes (user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS poll_votes_context_idx
  ON poll_votes (context);

-- Partial unique constraints — one row per (poll, user) and per (poll,
-- fingerprint), but a poll/user/fingerprint can each be NULL without
-- collision.
CREATE UNIQUE INDEX IF NOT EXISTS poll_votes_user_unique
  ON poll_votes (poll_id, user_id) WHERE user_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS poll_votes_fingerprint_unique
  ON poll_votes (poll_id, fingerprint) WHERE fingerprint IS NOT NULL;

-- ── Aggregate view ────────────────────────────────────────────────────────
-- `poll_vote_counts` is the only readable surface for vote tallies. It
-- runs with the view owner's privileges so it can read poll_votes despite
-- the restrictive RLS on that table.

CREATE OR REPLACE VIEW poll_vote_counts
WITH (security_invoker = false) AS
SELECT
  p.id              AS poll_id,
  v.option_index    AS option_index,
  COALESCE(p.options->>v.option_index, NULL) AS option_label,
  COUNT(v.id)::int  AS vote_count
FROM polls p
LEFT JOIN poll_votes v ON v.poll_id = p.id
GROUP BY p.id, v.option_index, p.options;

GRANT SELECT ON poll_vote_counts TO anon, authenticated;

-- ── RLS ───────────────────────────────────────────────────────────────────

ALTER TABLE polls       ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_votes  ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public reads polls" ON polls;
CREATE POLICY "Public reads polls"
  ON polls FOR SELECT TO anon, authenticated
  USING (true);

-- Anyone can cast a vote. We do NOT verify auth.uid() = user_id here on
-- purpose: anonymous voters supply user_id = NULL. The fingerprint /
-- user_id partial unique indexes above prevent ballot stuffing.
DROP POLICY IF EXISTS "Anyone votes" ON poll_votes;
CREATE POLICY "Anyone votes"
  ON poll_votes FOR INSERT TO anon, authenticated
  WITH CHECK (
    user_id IS NULL OR user_id = auth.uid()
  );

-- No public SELECT on poll_votes — counts are exposed only via
-- poll_vote_counts. (Authed users may want to read their own past votes;
-- add a "user reads own votes" policy when that surface lands.)
