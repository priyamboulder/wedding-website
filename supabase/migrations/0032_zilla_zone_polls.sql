-- ──────────────────────────────────────────────────────────────────────────
-- Migration 0032: Zilla Zone polls — flag a curated subset of polls that
-- belong inline below the homepage Bridezilla vs. Momzilla cards.
--
-- Why a flag rather than a separate table:
--   - The same `polls` row is reused everywhere (archive, vendor pages,
--     homepage Daily Debate, Zilla Zone). A boolean keeps the relational
--     shape simple and avoids duplicating questions.
--   - The Zilla Zone wants playful family-dynamics polls specifically; we
--     can't just "pick from the family_dynamics category" because not every
--     family-dynamics question maps to the bride-vs-mom theme (e.g.
--     "Should divorced parents sit together?" is too heavy for that slot).
--
-- The /api/polls/zilla-zone endpoint reads only rows with
-- zilla_zone_eligible = true and rotates randomly through them.
-- ──────────────────────────────────────────────────────────────────────────

ALTER TABLE polls
  ADD COLUMN IF NOT EXISTS zilla_zone_eligible boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS polls_zilla_zone_idx
  ON polls (zilla_zone_eligible)
  WHERE zilla_zone_eligible = true;

-- Flag the curated set. Matched by question text since seed UUIDs are
-- generated at insert time and aren't stable across environments.
UPDATE polls SET zilla_zone_eligible = true
WHERE question IN (
  'Should the couple have final say or is it the parents'' wedding too?',
  'Mother-in-law involvement — welcome it or set boundaries early?',
  'Family WhatsApp group for planning — helpful or a nightmare?',
  'Handling unsolicited aunty opinions — engage or ignore?',
  'Is the bride''s family paying for everything still a thing?',
  'Should siblings get a say in wedding decisions?'
);

-- ──────────────────────────────────────────────────────────────────────────
-- View: poll_vote_counts_by_voter_type
--
-- The Zilla Zone result line ("87% of brides said boundaries; 62% of moms
-- said welcome it") needs counts split by voter_type. We expose this via
-- a view (security_invoker = false, same pattern as poll_vote_counts) so
-- the public can aggregate without seeing individual vote rows.
-- ──────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE VIEW poll_vote_counts_by_voter_type
WITH (security_invoker = false) AS
SELECT
  v.poll_id,
  v.voter_type,
  v.option_index,
  COUNT(v.id)::int AS vote_count
FROM poll_votes v
WHERE v.voter_type IS NOT NULL
GROUP BY v.poll_id, v.voter_type, v.option_index;

GRANT SELECT ON poll_vote_counts_by_voter_type TO anon, authenticated;
