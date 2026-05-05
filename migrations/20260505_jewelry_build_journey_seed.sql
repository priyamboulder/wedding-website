-- Migration · Jewelry Build journey seed
-- ────────────────────────────────────────────────────────────────────────
-- Registers the four-session Build journey on the jewelry category
-- alongside the existing default Vision journey. Uses the journey_id
-- column added in 20260505_add_journey_id_to_guided_sessions.sql.
--
-- Sessions:
--   1. bridal_inventory  — every bridal piece (12 piece types + custom),
--                          lifecycle status, per-event assignments,
--                          source, vendor, dates, care notes, storage.
--   2. groom_inventory   — sherwani-specific vocabulary (safa brooch,
--                          kalgi, mala, sherwani buttons, cufflinks,
--                          ring, bracelet/kada). turban_placement field
--                          for kalgi & safa_brooch.
--   3. family_heirlooms  — lender-aware tracking with strict privacy
--                          (planner_stylist_only by default), in-flux
--                          notes, cross-side dynamics, story.
--   4. fittings_custody  — fittings appointments, day-of custody chain,
--                          special handoffs (turban pieces,
--                          mangalsutra), insurance manifest with
--                          appraisal deadline.
--
-- Build does NOT generate a closing brief — Vision already produced the
-- jewelry brief. Build's output is operational. Completion lands the
-- couple on Tab 6 (Fittings & Coordination) with three action CTAs:
--   • Share custody plan with planner
--   • Send pairing guide to stylist
--   • Export insurance manifest
--
-- Time-gated: Build CTAs are muted until 6 months before the wedding.
-- See JOURNEY_INTROS["jewelry:build"].unlocksAtMonthsBeforeEvent.

insert into public.session_definitions
  (category, journey_id, session_key, session_index)
values
  ('jewelry', 'build', 'bridal_inventory',  1),
  ('jewelry', 'build', 'groom_inventory',   2),
  ('jewelry', 'build', 'family_heirlooms',  3),
  ('jewelry', 'build', 'fittings_custody',  4)
on conflict (category, journey_id, session_key) do nothing;
