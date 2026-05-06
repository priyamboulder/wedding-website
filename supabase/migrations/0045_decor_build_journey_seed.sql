-- ── 0045_decor_build_journey_seed ──────────────────────────────────────────
-- Seed definitions for the Décor & Florals Build journey — the second
-- guided journey on the Décor workspace, complementing the 7-session
-- Vision flow.
--
-- Build is keyed at journey_id = 'build' (Vision lives at 'default'). Four
-- sessions, ~18 minutes total. Field shapes mirror the runtime types in
-- lib/guided-journeys/decor-build.ts; the bodies of each session render
-- bespoke React components (forthcoming) which read & write directly
-- through `useDecorStore` plus a journey-meta blob for floral pulls and
-- lighting fixtures (fields not yet first-class on decor-store).
--
-- Field-level mapping → underlying decor-store slices is documented in
-- lib/guided-journeys/decor-build-sync.ts. Two-way sync between the
-- guided journey and Tabs Spaces & Events / Mandap & Stage / Install Plan
-- happens because the components read the same store.
--
-- Pre-req: 0043_guided_journey_id_column. Idempotent.

BEGIN;

-- ── Session-definition seeds ──────────────────────────────────────────────

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'guided_journey_session_defs'
  ) THEN
    INSERT INTO public.guided_journey_session_defs
      (category_key, journey_id, session_key, session_index, title, subtitle, estimated_minutes)
    VALUES
      ('decor', 'build', 'event_scenes_buildout', 1,
        'Event scenes',
        'Pair every space with the event it hosts. Scenes here cascade to Catering, Photography, and Music.',
        5),
      ('decor', 'build', 'mandap_and_stages', 2,
        'Mandap & stages',
        'The biggest installs of the week — structure, seating, fire safety, per-event stage designs.',
        5),
      ('decor', 'build', 'florals_and_lighting', 3,
        'Florals & lighting',
        'Floral pulls per event, lighting fixtures, palette anchored to your scenes.',
        4),
      ('decor', 'build', 'install_run_of_show', 4,
        'Install & run-of-show',
        'Every install task on the timeline. Vendor coordination notes flow to every contracted vendor.',
        4)
    ON CONFLICT (category_key, journey_id, session_key)
      DO UPDATE SET
        session_index     = EXCLUDED.session_index,
        title             = EXCLUDED.title,
        subtitle          = EXCLUDED.subtitle,
        estimated_minutes = EXCLUDED.estimated_minutes;
  END IF;
END $$;

-- ── Journey definition seed ───────────────────────────────────────────────
-- Time-gated to 6 months out: mandap fabrication runs 3–4 months and
-- floral sourcing windows compound on top.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'guided_journey_defs'
  ) THEN
    INSERT INTO public.guided_journey_defs
      (category_key, journey_id, heading, alt_heading, subtext, total_minutes, unlock_rule)
    VALUES
      ('decor', 'build',
        'Now let''s build out every space, install, and light.',
        'Your décor build is locked, scenes broadcast.',
        'Four short sessions. About eighteen minutes total.',
        18,
        jsonb_build_object('kind', 'time_before_event', 'monthsBefore', 6))
    ON CONFLICT (category_key, journey_id)
      DO UPDATE SET
        heading       = EXCLUDED.heading,
        alt_heading   = EXCLUDED.alt_heading,
        subtext       = EXCLUDED.subtext,
        total_minutes = EXCLUDED.total_minutes,
        unlock_rule   = EXCLUDED.unlock_rule;
  END IF;
END $$;

COMMIT;
