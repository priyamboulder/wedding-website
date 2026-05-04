-- ──────────────────────────────────────────────────────────────────────────
-- Migration 0023: Marigold Match Me tool.
--
-- The Match Me tool is the reverse-search entry point: brides input what
-- they have (budget, guest count, priorities, dealbreakers) and the tool
-- surfaces destinations that fit. It re-uses the budget_locations table
-- as its destination universe — nothing about destinations is duplicated.
--
-- Adds:
--   1. budget_locations.tags                 — jsonb tag array per location
--   2. budget_locations.max_capacity         — soft ceiling for guest match
--   3. tool_match_results                    — saved match runs (auth + anon)
--
-- Backfills the tag array for the seeded locations so the matcher returns
-- meaningful results out of the box. Tags are slug-form; the canonical list
-- is mirrored in lib/match/scoring.ts (TAG_VOCABULARY).
-- ──────────────────────────────────────────────────────────────────────────

-- ── 1. Tags + capacity columns on budget_locations ────────────────────────

ALTER TABLE budget_locations
  ADD COLUMN IF NOT EXISTS tags         jsonb   NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS max_capacity integer NOT NULL DEFAULT 600;

CREATE INDEX IF NOT EXISTS budget_locations_tags_gin_idx
  ON budget_locations USING gin (tags);

-- Tag vocabulary (mirrored in lib/match/scoring.ts):
--   priorities  : scenic_beauty, cultural_immersion, convenient_for_indians,
--                 indian_vendors, exclusivity, beach, mountain, heritage,
--                 food_scene, nightlife
--   geo flags   : in_india, in_us, european, long_haul_from_us
--                 (long_haul_from_us drives the "long flights" dealbreaker)

-- Per-location tag + capacity backfill. Uses a single VALUES join so a
-- re-run is idempotent and the tag list stays auditable in this file.
UPDATE budget_locations bl SET
  tags         = v.tags,
  max_capacity = v.cap
FROM (VALUES
  ('dallas',        '["convenient_for_indians","indian_vendors","food_scene","in_us"]'::jsonb,                              800),
  ('houston',       '["convenient_for_indians","indian_vendors","food_scene","in_us"]'::jsonb,                              900),
  ('austin',        '["convenient_for_indians","indian_vendors","in_us","scenic_beauty"]'::jsonb,                           500),
  ('bay-area',      '["convenient_for_indians","indian_vendors","food_scene","in_us"]'::jsonb,                              500),
  ('nyc-nj',        '["convenient_for_indians","indian_vendors","food_scene","nightlife","in_us"]'::jsonb,                 1000),
  ('chicago',       '["convenient_for_indians","indian_vendors","food_scene","in_us"]'::jsonb,                              700),
  ('atlanta',       '["convenient_for_indians","indian_vendors","food_scene","in_us"]'::jsonb,                              600),
  ('los-angeles',   '["convenient_for_indians","indian_vendors","food_scene","beach","in_us"]'::jsonb,                      600),
  ('udaipur',       '["heritage","cultural_immersion","scenic_beauty","indian_vendors","in_india","long_haul_from_us"]'::jsonb, 600),
  ('goa',           '["beach","convenient_for_indians","indian_vendors","food_scene","nightlife","in_india","long_haul_from_us"]'::jsonb, 500),
  ('jaipur',        '["heritage","cultural_immersion","indian_vendors","in_india","long_haul_from_us"]'::jsonb,             700),
  ('kerala',        '["scenic_beauty","cultural_immersion","mountain","food_scene","indian_vendors","in_india","long_haul_from_us"]'::jsonb, 350),
  ('mumbai-delhi',  '["convenient_for_indians","indian_vendors","food_scene","nightlife","in_india","long_haul_from_us"]'::jsonb, 1500),
  ('lake-como',     '["scenic_beauty","exclusivity","heritage","european","mountain","long_haul_from_us"]'::jsonb,          300),
  ('france',        '["heritage","exclusivity","european","food_scene","scenic_beauty","long_haul_from_us"]'::jsonb,        400),
  ('spain',         '["european","scenic_beauty","food_scene","beach","long_haul_from_us"]'::jsonb,                         500),
  ('uk',            '["heritage","european","long_haul_from_us"]'::jsonb,                                                   400),
  ('greece',        '["scenic_beauty","beach","european","exclusivity","long_haul_from_us"]'::jsonb,                        300),
  ('portugal',      '["scenic_beauty","european","exclusivity","food_scene","long_haul_from_us"]'::jsonb,                   350),
  ('turkey',        '["heritage","cultural_immersion","food_scene","scenic_beauty","long_haul_from_us"]'::jsonb,            500),
  ('dubai',         '["exclusivity","nightlife","convenient_for_indians","indian_vendors","long_haul_from_us"]'::jsonb,    1200),
  ('oman',          '["scenic_beauty","exclusivity","long_haul_from_us"]'::jsonb,                                           300),
  ('thailand',      '["beach","scenic_beauty","food_scene","convenient_for_indians","indian_vendors","long_haul_from_us"]'::jsonb, 600),
  ('bali',          '["beach","scenic_beauty","exclusivity","mountain","long_haul_from_us"]'::jsonb,                        400),
  ('singapore',     '["convenient_for_indians","indian_vendors","food_scene","nightlife","long_haul_from_us"]'::jsonb,      500),
  ('jamaica',       '["beach","food_scene","nightlife"]'::jsonb,                                                            350),
  ('turks-caicos',  '["beach","exclusivity","scenic_beauty"]'::jsonb,                                                       250),
  ('cape-town',     '["scenic_beauty","food_scene","mountain","long_haul_from_us"]'::jsonb,                                 400),
  ('morocco',       '["heritage","cultural_immersion","exclusivity","long_haul_from_us"]'::jsonb,                           350),
  ('kenya',         '["scenic_beauty","exclusivity","long_haul_from_us"]'::jsonb,                                           250),
  ('sydney',        '["scenic_beauty","food_scene","long_haul_from_us"]'::jsonb,                                            450)
) AS v(slug, tags, cap)
WHERE bl.slug = v.slug;

-- ── 2. tool_match_results ─────────────────────────────────────────────────
-- Saved Match Me runs. Mirrors the budget_user_plans owner pattern: either
-- user_id (authed) or anonymous_token (anon) must be set, and anonymous
-- access goes through SECURITY DEFINER RPCs.

CREATE TABLE IF NOT EXISTS tool_match_results (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  anonymous_token text,
  email           text,
  -- Inputs the user entered. Stored as a flat jsonb so the schema can grow
  -- without a migration for every new question.
  -- Shape: { budget, guests, priorities[], dealbreakers[] }
  inputs          jsonb NOT NULL,
  -- Top results at save time. Frozen so the email a user gets back is the
  -- list they saw, not a re-scored list against tomorrow's tag changes.
  -- Shape: [{ slug, score, reasons[] }]
  results         jsonb NOT NULL,
  source          text  NOT NULL DEFAULT 'tool',
  created_at      timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT tool_match_results_owner_present
    CHECK (user_id IS NOT NULL OR anonymous_token IS NOT NULL OR email IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS tool_match_results_user_idx
  ON tool_match_results (user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS tool_match_results_anon_token_idx
  ON tool_match_results (anonymous_token) WHERE anonymous_token IS NOT NULL;
CREATE INDEX IF NOT EXISTS tool_match_results_email_idx
  ON tool_match_results (lower(email)) WHERE email IS NOT NULL;

ALTER TABLE tool_match_results ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own match results" ON tool_match_results;
CREATE POLICY "Users read own match results"
  ON tool_match_results FOR SELECT TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users insert own match results" ON tool_match_results;
CREATE POLICY "Users insert own match results"
  ON tool_match_results FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Anonymous + email-only inserts run through the RPC below. Direct anon
-- INSERT is intentionally not policied so no path skips the validation.

CREATE OR REPLACE FUNCTION save_anonymous_match_result(
  p_token   text,
  p_email   text,
  p_inputs  jsonb,
  p_results jsonb,
  p_source  text DEFAULT 'tool'
) RETURNS tool_match_results
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_row tool_match_results;
BEGIN
  IF p_token IS NULL AND p_email IS NULL THEN
    RAISE EXCEPTION 'either anonymous_token or email is required';
  END IF;
  IF p_inputs IS NULL OR p_results IS NULL THEN
    RAISE EXCEPTION 'inputs and results are required';
  END IF;
  IF p_email IS NOT NULL AND length(p_email) < 4 THEN
    RAISE EXCEPTION 'email looks malformed';
  END IF;

  INSERT INTO tool_match_results (anonymous_token, email, inputs, results, source)
  VALUES (p_token, p_email, p_inputs, p_results, p_source)
  RETURNING * INTO v_row;

  RETURN v_row;
END $$;

GRANT EXECUTE ON FUNCTION save_anonymous_match_result(text, text, jsonb, jsonb, text)
  TO anon, authenticated;

-- Reclaim: when an anonymous saver later signs up, attach their saved match
-- runs to their auth user. Mirrors reclaim_anonymous_budget_plan().
CREATE OR REPLACE FUNCTION reclaim_anonymous_match_results(p_token text)
RETURNS integer
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_user uuid := auth.uid();
  v_count integer;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'reclaim_anonymous_match_results requires an authenticated session';
  END IF;

  UPDATE tool_match_results SET
    user_id         = v_user,
    anonymous_token = NULL
  WHERE anonymous_token = p_token AND user_id IS NULL;

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END $$;

GRANT EXECUTE ON FUNCTION reclaim_anonymous_match_results(text) TO authenticated;

-- ── 3. Promote Match Me to live in the catalog ────────────────────────────

UPDATE tools_catalog SET
  status      = 'live',
  cta_label   = 'Match me',
  description = 'Punch in your number, your guest count, the things you actually care about. We''ll show you the destinations that fit — top to bottom, with reasons.',
  stats       = '[{"label": "Reverse search"}, {"label": "Budget + vibe matched"}]'::jsonb
WHERE slug = 'match';
