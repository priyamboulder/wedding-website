-- Migration · Sweets Selection journey seed
-- ────────────────────────────────────────────────────────────────────────
-- Registers the four-session Selection journey on the cake_sweets category
-- alongside the existing default Vision journey. Uses the journey_id
-- column added in 20260505_add_journey_id_to_guided_sessions.sql.
--
-- Sessions:
--   1. cake_design     — tiers, flavors, allergens, cutting ceremony,
--                        style inspiration reactions
--   2. mithai_spread   — 54-item catalog reactions, loved-item hydration,
--                        custom additions, procurement math
--   3. dessert_tables  — per-event tables: items, styling, plating,
--                        attendants
--   4. service_plan    — per-event service timing, late-night drops,
--                        vendor handoff notes, procurement cadence
--
-- Selection does NOT generate a closing brief. The journey output is
-- operational. Completion lands the couple on Tab 4 (Mithai & Dessert
-- Spread) with three action CTAs (Send to baker / mithai / planner).

insert into public.session_definitions
  (category, journey_id, session_key, session_index)
values
  ('cake_sweets', 'selection', 'cake_design',     1),
  ('cake_sweets', 'selection', 'mithai_spread',   2),
  ('cake_sweets', 'selection', 'dessert_tables',  3),
  ('cake_sweets', 'selection', 'service_plan',    4)
on conflict (category, journey_id, session_key) do nothing;
