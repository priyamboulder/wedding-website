-- Migration · Gifting Build journey seed
-- ────────────────────────────────────────────────────────────────────────
-- Registers the four-session Build journey on the gifting category
-- alongside the existing default Vision journey. Uses the journey_id
-- column added in 20260505_add_journey_id_to_guided_sessions.sql.
--
-- Sessions:
--   1. welcome_bags         — quantity tied to room block (pre-seeded
--                             from Travel & Accommodations Build), item
--                             lifecycle tracking, assembly plan.
--   2. trousseau_packaging  — saree trays, jewelry boxes, nagphans, gift
--                             trays, pooja thalis, monogram label sets.
--                             Surfaces 90-day Indian-import lead-time
--                             warnings + Stationery coordination flags.
--   3. return_favors        — RSVP-driven quantity math with 10% buffer,
--                             per-item lifecycle, optional charitable-
--                             donation alternative.
--   4. family_exchanges     — milni/vevai/vidaai/shagun exchanges with
--                             reciprocal-pair support, bridal party
--                             gifts, vendor thank-yous.
--
-- Build does NOT generate a closing brief. Vision already produced the
-- gifting brief. Build's output is operational — every bag inventoried,
-- every favor counted, every family exchange mapped. Completion routes
-- the couple to Tab 7 (Thank-You Tracker) with three action CTAs (push
-- label list to Stationery, share assembly plan with helpers, export
-- gifting summary).

insert into public.session_definitions
  (category, journey_id, session_key, session_index)
values
  ('gifting', 'build', 'welcome_bags',         1),
  ('gifting', 'build', 'trousseau_packaging',  2),
  ('gifting', 'build', 'return_favors',        3),
  ('gifting', 'build', 'family_exchanges',     4)
on conflict (category, journey_id, session_key) do nothing;
