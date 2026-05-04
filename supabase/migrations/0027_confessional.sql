-- ──────────────────────────────────────────────────────────────────────────
-- Migration 0027: The Confessional — anonymous-first short-form feed.
--
-- The Confessional is the fourth tab of the Planning Circle (/blog). Brides,
-- grooms, and family members post rants, confessions, hot takes, and
-- "would you believe" stories under a persona tag (e.g. "Bride, 3 months
-- out") rather than their real name. Reactions and comments act as low-
-- friction social proof.
--
-- Naming:
--   - Tables are prefixed `marigold_confessions_*` to keep them separate
--     from the older community-tab feature (which already owns
--     `confessional_posts` and `confessional_replies` from migration 0011).
--     They are unrelated systems despite the overlapping name.
--
-- Anonymity model:
--   - Posts and comments store user_id for moderation/dedup, but the UI
--     never surfaces user identity — only the persona_tag. RLS allows
--     public SELECT but blocks any join back to auth.users from the
--     client-readable surface.
--   - Reactions are dedup'd per (post, user, reaction_type) so the same
--     user can leave multiple distinct reactions but not stack the same
--     one twice.
--
-- Aggregate view:
--   - marigold_confessions_with_counts exposes posts joined with reaction
--     counts (per type) and comment counts. Callers never have to GROUP BY
--     reactions/comments themselves. Hidden posts are filtered out at the
--     view level.
-- ──────────────────────────────────────────────────────────────────────────

-- ── Tables ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS marigold_confessions (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Nullable so service-role seed rows can exist without a backing auth user.
  -- Authenticated user inserts are forced to set user_id = auth.uid() by RLS.
  user_id      uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  post_type    text NOT NULL,
  persona_tag  text NOT NULL,
  content      text NOT NULL,
  is_flagged   boolean NOT NULL DEFAULT false,
  is_hidden    boolean NOT NULL DEFAULT false,
  -- Seed reaction counts: bias the aggregate view so seeded posts show
  -- social proof on first load without faking auth.users rows. Real
  -- reaction inserts add on top of these in the view.
  seed_reaction_same             integer NOT NULL DEFAULT 0,
  seed_reaction_aunty_disapproves integer NOT NULL DEFAULT 0,
  seed_reaction_fire             integer NOT NULL DEFAULT 0,
  seed_reaction_sending_chai     integer NOT NULL DEFAULT 0,
  created_at   timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT marigold_confessions_type_check CHECK (post_type IN (
    'rant', 'confession', 'hot_take', 'would_you_believe'
  )),
  CONSTRAINT marigold_confessions_content_len CHECK (
    char_length(content) > 0 AND char_length(content) <= 500
  ),
  CONSTRAINT marigold_confessions_persona_len CHECK (
    char_length(persona_tag) > 0 AND char_length(persona_tag) <= 60
  )
);

CREATE INDEX IF NOT EXISTS marigold_confessions_created_idx
  ON marigold_confessions (created_at DESC);
CREATE INDEX IF NOT EXISTS marigold_confessions_type_idx
  ON marigold_confessions (post_type, created_at DESC) WHERE is_hidden = false;
CREATE INDEX IF NOT EXISTS marigold_confessions_user_idx
  ON marigold_confessions (user_id);

CREATE TABLE IF NOT EXISTS marigold_confession_reactions (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id        uuid NOT NULL REFERENCES marigold_confessions(id) ON DELETE CASCADE,
  user_id        uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reaction_type  text NOT NULL,
  created_at     timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT marigold_confession_reactions_type_check CHECK (reaction_type IN (
    'same', 'aunty_disapproves', 'fire', 'sending_chai'
  )),
  CONSTRAINT marigold_confession_reactions_unique UNIQUE (post_id, user_id, reaction_type)
);

CREATE INDEX IF NOT EXISTS marigold_confession_reactions_post_idx
  ON marigold_confession_reactions (post_id);
CREATE INDEX IF NOT EXISTS marigold_confession_reactions_user_idx
  ON marigold_confession_reactions (user_id);

CREATE TABLE IF NOT EXISTS marigold_confession_comments (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id      uuid NOT NULL REFERENCES marigold_confessions(id) ON DELETE CASCADE,
  -- Nullable for parity with posts (seed comments don't need an auth user).
  user_id      uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  persona_tag  text NOT NULL,
  content      text NOT NULL,
  is_flagged   boolean NOT NULL DEFAULT false,
  is_hidden    boolean NOT NULL DEFAULT false,
  created_at   timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT marigold_confession_comments_content_len CHECK (
    char_length(content) > 0 AND char_length(content) <= 300
  ),
  CONSTRAINT marigold_confession_comments_persona_len CHECK (
    char_length(persona_tag) > 0 AND char_length(persona_tag) <= 60
  )
);

CREATE INDEX IF NOT EXISTS marigold_confession_comments_post_idx
  ON marigold_confession_comments (post_id, created_at ASC) WHERE is_hidden = false;
CREATE INDEX IF NOT EXISTS marigold_confession_comments_user_idx
  ON marigold_confession_comments (user_id);

-- ── Aggregate view ────────────────────────────────────────────────────────
-- `marigold_confessions_with_counts` is the primary read surface for the
-- feed. It joins posts with per-reaction-type counts and a comment count
-- so the client only needs one query. security_invoker = false so it can
-- read across reactions/comments tables despite restrictive client-side
-- reads.

CREATE OR REPLACE VIEW marigold_confessions_with_counts
WITH (security_invoker = false) AS
SELECT
  p.id,
  p.user_id,
  p.post_type,
  p.persona_tag,
  p.content,
  p.is_flagged,
  p.is_hidden,
  p.created_at,
  (p.seed_reaction_same +
    COALESCE(SUM(CASE WHEN r.reaction_type = 'same' THEN 1 ELSE 0 END), 0))::int
    AS reaction_same,
  (p.seed_reaction_aunty_disapproves +
    COALESCE(SUM(CASE WHEN r.reaction_type = 'aunty_disapproves' THEN 1 ELSE 0 END), 0))::int
    AS reaction_aunty_disapproves,
  (p.seed_reaction_fire +
    COALESCE(SUM(CASE WHEN r.reaction_type = 'fire' THEN 1 ELSE 0 END), 0))::int
    AS reaction_fire,
  (p.seed_reaction_sending_chai +
    COALESCE(SUM(CASE WHEN r.reaction_type = 'sending_chai' THEN 1 ELSE 0 END), 0))::int
    AS reaction_sending_chai,
  (SELECT COUNT(*)::int
     FROM marigold_confession_comments c
     WHERE c.post_id = p.id AND c.is_hidden = false) AS comment_count
FROM marigold_confessions p
LEFT JOIN marigold_confession_reactions r ON r.post_id = p.id
WHERE p.is_hidden = false
GROUP BY
  p.id, p.user_id, p.post_type, p.persona_tag, p.content,
  p.is_flagged, p.is_hidden, p.created_at,
  p.seed_reaction_same, p.seed_reaction_aunty_disapproves,
  p.seed_reaction_fire, p.seed_reaction_sending_chai;

GRANT SELECT ON marigold_confessions_with_counts TO anon, authenticated;

-- ── RLS ───────────────────────────────────────────────────────────────────

ALTER TABLE marigold_confessions          ENABLE ROW LEVEL SECURITY;
ALTER TABLE marigold_confession_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE marigold_confession_comments  ENABLE ROW LEVEL SECURITY;

-- Posts: public read of non-hidden rows; authed users insert their own.
DROP POLICY IF EXISTS "Public reads visible posts" ON marigold_confessions;
CREATE POLICY "Public reads visible posts"
  ON marigold_confessions FOR SELECT TO anon, authenticated
  USING (is_hidden = false);

DROP POLICY IF EXISTS "Users insert own posts" ON marigold_confessions;
CREATE POLICY "Users insert own posts"
  ON marigold_confessions FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Comments: public read of non-hidden rows; authed users insert their own.
DROP POLICY IF EXISTS "Public reads visible comments" ON marigold_confession_comments;
CREATE POLICY "Public reads visible comments"
  ON marigold_confession_comments FOR SELECT TO anon, authenticated
  USING (is_hidden = false);

DROP POLICY IF EXISTS "Users insert own comments" ON marigold_confession_comments;
CREATE POLICY "Users insert own comments"
  ON marigold_confession_comments FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Reactions: authed users may insert their own; aggregate counts are
-- exposed only via the view. We allow SELECT for authed users so the UI
-- can render which reactions the current user has already left (so we can
-- toggle them). Anon users get counts via the view only.
DROP POLICY IF EXISTS "Users read own reactions" ON marigold_confession_reactions;
CREATE POLICY "Users read own reactions"
  ON marigold_confession_reactions FOR SELECT TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users insert own reactions" ON marigold_confession_reactions;
CREATE POLICY "Users insert own reactions"
  ON marigold_confession_reactions FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users delete own reactions" ON marigold_confession_reactions;
CREATE POLICY "Users delete own reactions"
  ON marigold_confession_reactions FOR DELETE TO authenticated
  USING (user_id = auth.uid());
