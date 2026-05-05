-- ── 0041_officiant_vision_schema_update ───────────────────────────────────
-- Vision-journey schema rewrite for the Officiant (priest) workspace.
--
--   • Splits the flat traditions[] field into broad_tradition + specific_tradition
--   • Replaces the 3-bucket length picker with a 6-bucket one
--   • Replaces the multi-select language array with a single-select
--   • Adds guest_participation (was previously missing)
--   • Drops regional_customs[], ceremony_elements[], bilingual_ceremony
--   • Removes the ceremony_roles session from Vision entirely (it moves to
--     the Build journey via 0042_officiant_build_journey_seed.sql).
--
-- The runtime migration in lib/guided-journey/storage.ts applies the same
-- backfill to localStorage on hydrate. This migration mirrors that logic
-- against any persisted guided_journey_sessions rows.
--
-- Idempotent: the WHERE clauses guard against re-running on already-
-- migrated rows.

BEGIN;

-- ── Backfill ceremony_traditions form_data ────────────────────────────────
-- Only update rows that haven't been touched yet (broad_tradition missing).

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'guided_journey_sessions'
  ) THEN
    UPDATE public.guided_journey_sessions
    SET form_data = jsonb_strip_nulls(
      form_data
        || jsonb_build_object(
          -- traditions[0] → broad_tradition; default to 'hindu' if mixed.
          'broad_tradition',
            CASE
              WHEN form_data #>> '{traditions,0}' IN (
                'hindu','sikh','jain','buddhist','muslim','parsi','christian',
                'interfaith','non_religious'
              ) THEN form_data #>> '{traditions,0}'
              ELSE 'hindu'
            END,
          -- specific_tradition: leave null for the user to fill in.
          'specific_tradition', NULL,
          -- ceremony_length_preference: 3-bucket → 6-bucket
          'ceremony_length_preference',
            CASE form_data ->> 'ceremony_length_preference'
              WHEN 'traditional_full' THEN '90_min'
              WHEN 'abbreviated'      THEN '45_min'
              WHEN 'custom'           THEN 'no_time_pressure'
              ELSE COALESCE(form_data ->> 'ceremony_length_preference', '90_min')
            END,
          -- language_preference[] → single value (first element)
          'language_preference',
            COALESCE(form_data #>> '{language_preference,0}', 'sanskrit_english'),
          -- guest_participation default
          'guest_participation', 'participate_key_moments'
        )
        -- Drop fields that moved to Build / are redundant.
        - 'traditions'
        - 'regional_customs'
        - 'ceremony_elements'
        - 'bilingual_ceremony'
    )
    WHERE category_key = 'priest'
      AND session_key  = 'ceremony_traditions'
      AND (journey_id IS NULL OR journey_id = 'default')
      AND form_data ? 'traditions'                  -- not yet migrated
      AND NOT (form_data ? 'broad_tradition');      -- belt + suspenders
  END IF;
END $$;

-- ── Drop ceremony_roles session rows from Vision ──────────────────────────
-- Vision is now 2 sessions (ceremony_traditions + ceremony_brief).
-- ceremony_roles moves to the Build journey, so the data is preserved
-- when the Build seed migration runs after this one.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'guided_journey_sessions'
  ) THEN
    DELETE FROM public.guided_journey_sessions
    WHERE category_key = 'priest'
      AND session_key  = 'ceremony_roles'
      AND (journey_id IS NULL OR journey_id = 'default');
  END IF;
END $$;

COMMIT;
