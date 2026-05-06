-- ── 0043_guided_journey_id_column ─────────────────────────────────────────
-- Foundational migration for multi-journey support on the guided-journey
-- tables. Until now, every category had a single Vision-style journey, so
-- guided_journey_sessions was uniquely keyed on (couple_id, category_key,
-- session_key). With Build journeys (Mehendi Logistics, Officiant Build,
-- Cake & Sweets Selection, Wardrobe Build, Jewelry Build, Gifting Build,
-- Travel Build, Transportation Build — and the Décor/Catering/Music/HMUA/
-- Stationery/Venue/Videography Builds to come) a single category can now
-- host multiple parallel journeys. They're discriminated by `journey_id`.
--
-- Existing rows (Vision sessions for every category) get journey_id =
-- 'default'. Every Build seed migration onward sets journey_id = 'build'
-- (or 'logistics'/'selection' where category-specific names already shipped).
--
-- Idempotent: every step guards on EXISTS / IF EXISTS. Safe to re-run.
-- Ordering: this migration is the canonical pre-req for every future
-- Build-journey seed migration. 0042 already shipped a defensive DO block
-- doing the same work — that block becomes a no-op once this migration
-- has run, but stays in place to keep 0042 self-contained for environments
-- that applied it before 0043 existed.

BEGIN;

-- ── Add the journey_id column ─────────────────────────────────────────────
-- Default 'default' so existing Vision rows keep working without a backfill
-- step. NOT NULL because every row must belong to exactly one journey.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'guided_journey_sessions'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'guided_journey_sessions'
      AND column_name = 'journey_id'
  ) THEN
    ALTER TABLE public.guided_journey_sessions
      ADD COLUMN journey_id TEXT NOT NULL DEFAULT 'default';
  END IF;
END $$;

-- ── Replace the legacy unique key with one that includes journey_id ───────
-- The pre-multi-journey unique key — (couple_id, category_key, session_key)
-- — would refuse to let the same couple have a Vision row and a Build row
-- for the same session_key. That conflict is real for Officiant: the
-- 'family_roles' session ships in both Vision (legacy) and Build (current).
--
-- Drop the old constraint if present, then create a unique index that
-- includes journey_id. Wrapped in nested EXCEPTION blocks so we don't crash
-- on environments where the constraint was already dropped (e.g. by 0042's
-- defensive block).

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'guided_journey_sessions'
  ) THEN
    BEGIN
      ALTER TABLE public.guided_journey_sessions
        DROP CONSTRAINT IF EXISTS guided_journey_sessions_couple_id_category_key_session_key_key;
    EXCEPTION WHEN undefined_object THEN NULL;
    END;

    CREATE UNIQUE INDEX IF NOT EXISTS guided_journey_sessions_unique_per_journey
      ON public.guided_journey_sessions
      (couple_id, category_key, journey_id, session_key);
  END IF;
END $$;

-- ── Optional: backfill nullable journey_id rows ───────────────────────────
-- Defensive — the column ships NOT NULL DEFAULT 'default' so this should
-- be a no-op, but environments that added the column out-of-band may have
-- nulls. Treat NULL as 'default'.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'guided_journey_sessions'
  ) THEN
    UPDATE public.guided_journey_sessions
    SET journey_id = 'default'
    WHERE journey_id IS NULL;
  END IF;
END $$;

-- ── Mirror the column on the session-definition catalog ───────────────────
-- guided_journey_session_defs (where it exists) is a per-environment table
-- keyed on (category_key, journey_id, session_key). Ensure the journey_id
-- column exists there too. The 0042 seed already inserts with this shape,
-- but environments that maintain the catalog may have predated journey_id.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'guided_journey_session_defs'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'guided_journey_session_defs'
      AND column_name = 'journey_id'
  ) THEN
    ALTER TABLE public.guided_journey_session_defs
      ADD COLUMN journey_id TEXT NOT NULL DEFAULT 'default';
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'guided_journey_defs'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'guided_journey_defs'
      AND column_name = 'journey_id'
  ) THEN
    ALTER TABLE public.guided_journey_defs
      ADD COLUMN journey_id TEXT NOT NULL DEFAULT 'default';
  END IF;
END $$;

COMMIT;
