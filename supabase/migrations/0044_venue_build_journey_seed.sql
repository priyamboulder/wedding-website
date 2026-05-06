-- ── 0044_venue_build_journey_seed ──────────────────────────────────────────
-- Seed definitions for the Venue Build journey — the second guided journey
-- on the Venue workspace, complementing the 4-session Vision flow.
--
-- Build is keyed at journey_id = 'build' (Vision lives at 'default'). Four
-- sessions, ~15 minutes total. Field shapes mirror the runtime types in
-- lib/guided-journeys/venue-build.ts; the bodies of each session render
-- bespoke React components in components/guided-journeys/venue-build/
-- (forthcoming) which read & write directly through `useVenueStore`.
--
-- Field-level mapping → underlying venue-store slices is documented in
-- lib/guided-journeys/venue-build-sync.ts (forthcoming). Two-way sync
-- between the guided journey and Tabs Spaces & Layout / Rules & Restrictions
-- / Logistics Hub / Contacts & Emergency happens because the components
-- read the same store.
--
-- Pre-req: 0043_guided_journey_id_column. Idempotent: ON CONFLICT clauses
-- on every insert.

BEGIN;

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
      ('venue', 'build', 'spaces_and_layout', 1,
        'Spaces & layout',
        'Walk through every space at your venue and pair it with the event it hosts.',
        5),
      ('venue', 'build', 'rules_and_restrictions', 2,
        'Rules & restrictions',
        'Curfews, open flame, drones, sparklers — capture every rule once, broadcast everywhere.',
        4),
      ('venue', 'build', 'vendor_policies', 3,
        'Vendor policies',
        'Catering, alcohol, vendor access — what your downstream vendors need to know.',
        3),
      ('venue', 'build', 'load_in_and_day_of', 4,
        'Load-in & day-of',
        'Load-in windows, parking, baraat rules, day-of contacts, COI deadlines.',
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
-- Unlock rule keyed differently from the rest: `venue_booked` rather than
-- `vendor_contracted`. See lib/guided-journeys/unlock-rules.ts for the
-- runtime evaluator that reads venue-store status.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'guided_journey_defs'
  ) THEN
    INSERT INTO public.guided_journey_defs
      (category_key, journey_id, heading, alt_heading, subtext, total_minutes, unlock_rule)
    VALUES
      ('venue', 'build',
        'Now let''s lock the spaces and capture every rule.',
        'Your venue is locked, every rule captured.',
        'Four short sessions. About fifteen minutes total.',
        15,
        jsonb_build_object('kind', 'venue_booked'))
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
