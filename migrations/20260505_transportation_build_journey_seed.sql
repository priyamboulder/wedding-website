-- Migration · Transportation Build journey seed
-- ────────────────────────────────────────────────────────────────────────
-- Registers the three-session Build journey on the transportation
-- category alongside the existing default Vision journey. Uses the
-- journey_id column added in 20260505_add_journey_id_to_guided_sessions.sql.
--
-- Sessions:
--   1. baraat_walkthrough  — the marquee feature. Route, participants,
--                            horse/vehicle, road & venue coordination
--                            (permits with auto-suggested deadlines),
--                            music timing, and ready-by clocks.
--   2. guest_movement_math — three structured tables (shuttle runs,
--                            airport pickups, VIP/family moves), plus
--                            accessibility and post-event return.
--                            Auto-grouping clusters airport arrivals
--                            into 60-min pickup windows.
--   3. fleet_roster        — family + couple fleet, vendor parking,
--                            day-of driver assignments. Hard-warns when
--                            must-have vehicles are uncontracted with
--                            < 3 months left.
--
-- Build does NOT generate a closing brief — Vision already produced the
-- transport brief. Build's output is operational. Completion lands the
-- couple on Tab 5 (Day-of Route Plan), which is auto-derived from Build
-- via lib/guided-journeys/transportation-day-of-derivation.ts. Three
-- action CTAs surface on the completion banner:
--   • Share schedule with planner
--   • Send driver contact sheet
--   • Export day-of route plan
--
-- Time-gated: Build CTAs are muted until 4 months before the wedding.
-- See JOURNEY_INTROS["transportation:build"].unlocksAtMonthsBeforeEvent
-- and lib/guided-journeys/unlock-rules.ts.

insert into public.session_definitions
  (category, journey_id, session_key, session_index)
values
  ('transportation', 'build', 'baraat_walkthrough',  1),
  ('transportation', 'build', 'guest_movement_math', 2),
  ('transportation', 'build', 'fleet_roster',        3)
on conflict (category, journey_id, session_key) do nothing;
