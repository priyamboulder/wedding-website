-- Migration · Travel & Accommodations Build journey seed
-- ────────────────────────────────────────────────────────────────────────
-- Registers the two-session Build journey on the travel category alongside
-- the existing default Vision journey. Uses the journey_id column added in
-- 20260505_add_journey_id_to_guided_sessions.sql.
--
-- Sessions:
--   1. block_setup            — primary + secondary hotel blocks,
--                                negotiated rates, attrition floors,
--                                cutoff dates, comp policies, suite
--                                assignments. Reads/writes through
--                                useTravelStore.blocks (same store as
--                                Tab 2 Room Block Manager).
--   2. guest_travel_tracker   — per-guest arrival tracking, hotel
--                                assignments, booking status, computed
--                                arrival clusters that flow into
--                                Transportation Build · Session 2 as
--                                airport_pickups[].
--
-- Build does NOT generate a closing brief. Vision already produced the
-- travel brief that goes to planners. Build's output is operational —
-- every block tracked, every guest's travel logged, arrival clusters ready.
-- Completion lands the couple on Tab 3 (Guest Travel Hub) with three CTAs
-- (Send pickup roster / Share booking links / Export room block summary).

insert into public.session_definitions
  (category, journey_id, session_key, session_index)
values
  ('travel', 'build', 'block_setup',          1),
  ('travel', 'build', 'guest_travel_tracker', 2)
on conflict (category, journey_id, session_key) do nothing;

-- ── Optional backfill from legacy Vision data ─────────────────────────────
-- Empty bags for any workspace that already has Vision sessions completed.
-- The Build session UIs read directly through useTravelStore (the same
-- store Tabs 2 + 3 use), so for v1 we just seed empty form_data — the UIs
-- pre-populate from Vision strategy + Guests workspace at runtime.

insert into public.guided_journey_sessions
  (workspace_id, journey_id, session_key, session_index, status, form_data)
select distinct
  s.workspace_id,
  'build'::text,
  'block_setup'::text,
  1,
  'not_started'::text,
  jsonb_build_object(
    'hotel_blocks', '[]'::jsonb
  )
from public.guided_journey_sessions s
where s.journey_id = 'default'
  and s.session_key in ('accommodation_needs', 'guest_travel', 'travel_brief')
on conflict (workspace_id, journey_id, session_key) do nothing;

insert into public.guided_journey_sessions
  (workspace_id, journey_id, session_key, session_index, status, form_data)
select distinct
  s.workspace_id,
  'build'::text,
  'guest_travel_tracker'::text,
  2,
  'not_started'::text,
  jsonb_build_object(
    'guest_travel_entries', '[]'::jsonb,
    'arrival_clusters', '[]'::jsonb,
    'booking_link_dispatch', jsonb_build_object(
      'sent_to_count', 0,
      'not_yet_sent_count', 0
    )
  )
from public.guided_journey_sessions s
where s.journey_id = 'default'
  and s.session_key in ('accommodation_needs', 'guest_travel', 'travel_brief')
on conflict (workspace_id, journey_id, session_key) do nothing;
