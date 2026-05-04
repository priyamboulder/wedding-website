-- ──────────────────────────────────────────────────────────────────────────
-- Migration 0029: "Overspent or Worth It?" submissions.
--
-- A short-form, magazine-style confessional inside the Editorial tab on
-- /blog. Couples submit a single splurge ("we paid $X for Y") and a
-- one-sentence verdict — was it worth every penny, or did they overspend?
-- Approved entries appear as pull-quote-style cards interleaved with
-- regular Editorial articles, each with an Agree/Disagree reader poll.
--
-- Moderation flow:
--   - Submissions land with status = 'pending' and are invisible to the
--     public feed. Editors flip status to 'approved' (sets published_at) or
--     'rejected'. Only approved + non-null published_at rows render.
--
-- Voting:
--   - Reader poll = (agree | disagree). Stored in overspent_votes, dedup'd
--     by (submission_id, user_id) for authed and (submission_id, fingerprint)
--     for anon. Aggregated counts surface via the
--     overspent_submissions_with_votes view.
--
-- Seeded with 10 editorial entries spanning splurges from $1,200 - $8,000.
-- Seed rows have user_id = NULL; RLS blocks anon insert of NULL user_id.
-- ──────────────────────────────────────────────────────────────────────────

-- ── Tables ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS overspent_submissions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Nullable so seeded editorial rows can exist without a backing auth user.
  -- RLS forces real submissions to set user_id = auth.uid().
  user_id         uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  splurge_item    text NOT NULL,
  amount          integer,
  amount_hidden   boolean NOT NULL DEFAULT false,
  verdict         text NOT NULL,
  explanation     text NOT NULL,
  role            text,
  guest_count     integer,
  city            text,
  status          text NOT NULL DEFAULT 'pending',
  created_at      timestamptz NOT NULL DEFAULT now(),
  published_at    timestamptz,

  CONSTRAINT overspent_verdict_check CHECK (verdict IN ('worth_it', 'overspent')),
  CONSTRAINT overspent_role_check CHECK (
    role IS NULL OR role IN ('bride', 'groom', 'parent', 'other')
  ),
  CONSTRAINT overspent_status_check CHECK (
    status IN ('pending', 'approved', 'rejected')
  ),
  CONSTRAINT overspent_explanation_len CHECK (
    char_length(explanation) > 0 AND char_length(explanation) <= 250
  ),
  CONSTRAINT overspent_splurge_len CHECK (
    char_length(splurge_item) > 0 AND char_length(splurge_item) <= 200
  ),
  CONSTRAINT overspent_amount_nonneg CHECK (
    amount IS NULL OR amount >= 0
  ),
  CONSTRAINT overspent_guest_count_nonneg CHECK (
    guest_count IS NULL OR guest_count >= 0
  )
);

CREATE INDEX IF NOT EXISTS overspent_submissions_published_idx
  ON overspent_submissions (published_at DESC)
  WHERE status = 'approved' AND published_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS overspent_submissions_status_idx
  ON overspent_submissions (status, created_at DESC);

CREATE INDEX IF NOT EXISTS overspent_submissions_user_idx
  ON overspent_submissions (user_id);

-- ── Reader poll (Agree / Disagree) ────────────────────────────────────────

CREATE TABLE IF NOT EXISTS overspent_votes (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id  uuid NOT NULL REFERENCES overspent_submissions(id) ON DELETE CASCADE,
  user_id        uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  fingerprint    text,
  vote           text NOT NULL,
  created_at     timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT overspent_votes_value_check CHECK (vote IN ('agree', 'disagree')),
  CONSTRAINT overspent_votes_voter_present CHECK (
    user_id IS NOT NULL OR fingerprint IS NOT NULL
  )
);

-- One vote per (submission, voter) — partial unique indexes split by voter
-- channel so authed and anon paths can't collide on the same key.
CREATE UNIQUE INDEX IF NOT EXISTS overspent_votes_unique_user
  ON overspent_votes (submission_id, user_id)
  WHERE user_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS overspent_votes_unique_fp
  ON overspent_votes (submission_id, fingerprint)
  WHERE user_id IS NULL AND fingerprint IS NOT NULL;

CREATE INDEX IF NOT EXISTS overspent_votes_submission_idx
  ON overspent_votes (submission_id);

-- ── Aggregate view ────────────────────────────────────────────────────────
-- Primary read surface for the public feed. Joins approved submissions with
-- agree/disagree counts so the client makes one query.

CREATE OR REPLACE VIEW overspent_submissions_with_votes
WITH (security_invoker = false) AS
SELECT
  s.id,
  s.splurge_item,
  s.amount,
  s.amount_hidden,
  s.verdict,
  s.explanation,
  s.role,
  s.guest_count,
  s.city,
  s.created_at,
  s.published_at,
  COALESCE(SUM(CASE WHEN v.vote = 'agree' THEN 1 ELSE 0 END), 0)::int
    AS agree_count,
  COALESCE(SUM(CASE WHEN v.vote = 'disagree' THEN 1 ELSE 0 END), 0)::int
    AS disagree_count
FROM overspent_submissions s
LEFT JOIN overspent_votes v ON v.submission_id = s.id
WHERE s.status = 'approved' AND s.published_at IS NOT NULL
GROUP BY
  s.id, s.splurge_item, s.amount, s.amount_hidden, s.verdict,
  s.explanation, s.role, s.guest_count, s.city,
  s.created_at, s.published_at;

GRANT SELECT ON overspent_submissions_with_votes TO anon, authenticated;

-- ── RLS ───────────────────────────────────────────────────────────────────

ALTER TABLE overspent_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE overspent_votes       ENABLE ROW LEVEL SECURITY;

-- Submissions: public can only read approved-and-published rows; authed
-- users can insert pending rows tied to their own user_id; users can read
-- their own pending submissions (so the dashboard can show "in review").
DROP POLICY IF EXISTS "Public reads approved submissions" ON overspent_submissions;
CREATE POLICY "Public reads approved submissions"
  ON overspent_submissions FOR SELECT TO anon, authenticated
  USING (status = 'approved' AND published_at IS NOT NULL);

DROP POLICY IF EXISTS "Users read own submissions" ON overspent_submissions;
CREATE POLICY "Users read own submissions"
  ON overspent_submissions FOR SELECT TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users insert own submissions" ON overspent_submissions;
CREATE POLICY "Users insert own submissions"
  ON overspent_submissions FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid() AND status = 'pending' AND published_at IS NULL
  );

-- Votes: counts come from the view; authed users can read their own rows
-- so the UI knows which side they already picked. Inserts allowed for
-- authed users tied to their own user_id. Anon vote path is service-role
-- only (the API records fingerprint after server-side validation).
DROP POLICY IF EXISTS "Users read own votes" ON overspent_votes;
CREATE POLICY "Users read own votes"
  ON overspent_votes FOR SELECT TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users insert own votes" ON overspent_votes;
CREATE POLICY "Users insert own votes"
  ON overspent_votes FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- ── Seed: 10 editorial submissions ────────────────────────────────────────
-- All approved + published_at = now() so they render on first page-load.

INSERT INTO overspent_submissions (
  splurge_item, amount, amount_hidden, verdict, explanation,
  role, guest_count, city, status, published_at
) VALUES
  (
    'Live shehnai player during pheras', 3500, false, 'worth_it',
    'Nobody was on their phone during our ceremony. Made my grandmother cry happy tears. Would spend $5,000 next time.',
    'bride', 200, 'Dallas', 'approved', now()
  ),
  (
    'Custom monogram on every napkin', 1200, false, 'overspent',
    'Nobody noticed. Not one person.',
    'bride', 250, 'Houston', 'approved', now()
  ),
  (
    'Second photographer just for getting-ready', 2000, false, 'worth_it',
    'My favorite photos from the entire wedding came from those two hours.',
    'bride', 180, 'Austin', 'approved', now()
  ),
  (
    'Imported flowers from Thailand for the mandap', 8000, false, 'overspent',
    'They looked exactly like the local option that cost $2,000.',
    'groom', 300, 'Atlanta', 'approved', now()
  ),
  (
    'Live painter at the reception', 2500, false, 'worth_it',
    'It hangs in our living room. Guests watched her paint all night.',
    'bride', 220, 'Chicago', 'approved', now()
  ),
  (
    'Choreographer for sangeet', 1800, false, 'worth_it',
    'Our performance was actually good. The only one that night, if I''m honest.',
    'groom', 200, 'New Jersey', 'approved', now()
  ),
  (
    'Luxury welcome bags for all out-of-town guests', 4500, false, 'overspent',
    'Found 30 of them untouched in the hotel lobby the next day.',
    'parent', 280, 'San Francisco', 'approved', now()
  ),
  (
    'Same-day edit wedding film', 3000, false, 'worth_it',
    'Played it at the reception. My dad sobbed. Worth every cent.',
    'bride', 240, 'Los Angeles', 'approved', now()
  ),
  (
    'Custom-designed invitation suite with letterpress', 3200, false, 'overspent',
    'Beautiful but everyone just looked at the WhatsApp forward anyway.',
    'bride', 200, 'Seattle', 'approved', now()
  ),
  (
    'Late-night taco truck at 1am', 1500, false, 'worth_it',
    'The line was longer than the baraat. Absolute hit.',
    'groom', 230, 'Dallas', 'approved', now()
  )
ON CONFLICT DO NOTHING;
