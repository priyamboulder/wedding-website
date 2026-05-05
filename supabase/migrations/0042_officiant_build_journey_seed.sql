-- ── 0042_officiant_build_journey_seed ─────────────────────────────────────
-- Seed definitions for the Officiant (priest) Build journey — the second
-- guided journey on the Pandit workspace, complementing the simplified
-- 2-session Vision flow set up by 0041.
--
-- Build is keyed at journey_id = 'build' (Vision lives at 'default'). Four
-- sessions, ~15 minutes total. Field shapes mirror the runtime types
-- declared in lib/guided-journeys/officiant-build.ts; the bodies of each
-- session render the bespoke React components in
-- components/guided-journeys/officiant-build/ which read & write directly
-- through the pandit-store.
--
-- Field-level mapping → underlying pandit-store slices is documented in
-- lib/guided-journeys/officiant-build-sync.ts. Two-way sync between the
-- guided journey and Tabs 1 §5 / 4 / 5 / 6 happens because the components
-- read the same store.
--
-- Idempotent: ON CONFLICT DO NOTHING (or DO UPDATE SET) on every insert.

BEGIN;

-- ── Ensure the journey_id column exists ───────────────────────────────────
-- Required by the Mehendi Logistics build before this prompt — but we
-- guard defensively for environments where the column is missing.

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
    -- Existing unique key needs to include journey_id so the same session
    -- key can exist under different journeys for the same couple.
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

-- ── Session-definition seeds ──────────────────────────────────────────────
-- For environments that maintain a session-definition catalog (one row per
-- category × journey × session), upsert the four Build sessions. Skipped
-- silently if the catalog table doesn't exist.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'guided_journey_session_defs'
  ) THEN
    INSERT INTO public.guided_journey_session_defs
      (category_key, journey_id, session_key, session_index, title, subtitle, estimated_minutes)
    VALUES
      ('priest', 'build', 'rituals_walkthrough', 1,
        'Walk through the rituals',
        'For each ritual: include, skip, or flag for discussion with your pandit.',
        5),
      ('priest', 'build', 'family_roles', 2,
        'Family roles',
        'Who does what — and quietly, who doesn''t.',
        4),
      ('priest', 'build', 'samagri_review', 3,
        'Samagri & supplies',
        'Confirm what''s needed, who''s sourcing, and what the officiant brings.',
        3),
      ('priest', 'build', 'ceremony_logistics', 4,
        'Day-of logistics',
        'Mandap, audio, guest experience, and vendor handoffs.',
        3)
    ON CONFLICT (category_key, journey_id, session_key)
      DO UPDATE SET
        session_index     = EXCLUDED.session_index,
        title             = EXCLUDED.title,
        subtitle          = EXCLUDED.subtitle,
        estimated_minutes = EXCLUDED.estimated_minutes;
  END IF;
END $$;

-- ── Journey definition seed ───────────────────────────────────────────────

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'guided_journey_defs'
  ) THEN
    INSERT INTO public.guided_journey_defs
      (category_key, journey_id, heading, alt_heading, subtext, total_minutes, unlock_rule)
    VALUES
      ('priest', 'build',
        'Now let''s build the ceremony with your pandit.',
        'Your ceremony is built.',
        'Four short sessions. About fifteen minutes total.',
        15,
        jsonb_build_object(
          'kind', 'vendor_shortlisted',
          'category', 'pandit_ceremony'
        ))
    ON CONFLICT (category_key, journey_id)
      DO UPDATE SET
        heading       = EXCLUDED.heading,
        alt_heading   = EXCLUDED.alt_heading,
        subtext       = EXCLUDED.subtext,
        total_minutes = EXCLUDED.total_minutes,
        unlock_rule   = EXCLUDED.unlock_rule;
  END IF;
END $$;

-- ── Vision intro update ───────────────────────────────────────────────────
-- The Vision journey shrunk from 3 sessions / 8 min to 2 sessions / 5 min
-- when ceremony_roles moved to Build. Reflect that here too.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'guided_journey_defs'
  ) THEN
    UPDATE public.guided_journey_defs
    SET subtext = 'Two short sessions. About five minutes total.',
        total_minutes = 5
    WHERE category_key = 'priest'
      AND journey_id   = 'default';
  END IF;
END $$;

COMMIT;
