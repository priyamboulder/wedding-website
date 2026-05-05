-- Migration · Gifting Vision schema update
-- ────────────────────────────────────────────────────────────────────────
-- Reshapes form_data on the default-journey Gifting vision sessions to
-- match the deeper schema used by Tab 1 (the 5-card style direction
-- picker, the 4-category × 4-chip budget-anchor selector, and the
-- categorised idea browser).
--
-- Sessions:
--   gifting_philosophy   — adds style_direction[] (with reactions),
--                          budget_anchors object (per category), retains
--                          gift_types_planned and family_gift_traditions.
--                          Drops favour_style enum, budget_approach enum,
--                          and welcome_bag_items[] (which now lives as
--                          item-level lifecycle in Build Session 1).
--   gift_details         — REMOVED entirely. Its fields move to Build
--                          (welcome_bag_details → welcome_bags session,
--                          family_gifts → family_exchanges session,
--                          bridal_party_gifts → family_exchanges session).
--   gifting_inspiration  — NEW session (replaces the old gift_details
--                          slot). Holds idea_reactions[], moodboard_pins[],
--                          palette_hexes[], and free-form vision_notes.
--   gifting_brief        — adds computed_total_estimated_budget and
--                          guest_count_assumption for the brief drafter.
--
-- Backfill rules:
--   • style_direction[]:
--       favour_style == 'edible'              → modern_curated (love)
--       favour_style == 'keepsake'            → traditional_heritage (love)
--       favour_style == 'charitable_donation' → eco_friendly_sustainable (love)
--       favour_style == 'personalized'        → diy_personal (love)
--       favour_style == 'not_doing'           → no entries
--   • budget_anchors:
--       budget_approach == 'splurge_on_family_simple_for_guests'
--         → family_exchanges_per_family = '$750-2000'
--           return_favors_per_guest    = '$5-15'
--           others                     = 'tbd'
--       budget_approach == 'equal_for_all'
--         → welcome_bags_per_bag       = '$30-60'
--           return_favors_per_guest    = '$15-35'
--           family_exchanges_per_family = '$300-750'
--           trousseau_packaging_total   = '$1.5K-4K'
--       budget_approach == 'tiered_by_relationship' or null
--         → all categories             = 'tbd'
--   • welcome_bag_items[]: dropped (lifecycle moves to Build).
--
-- Deprecated fields (favour_style, budget_approach, welcome_bag_items[],
-- the entire gift_details session bag) stay in JSONB but stop being read.
-- No destructive drop.

-- 1. Update gifting_philosophy form_data ───────────────────────────────────

update public.guided_journey_sessions s
set form_data = (
    coalesce(form_data, '{}'::jsonb)
    -- style_direction[] from favour_style
    || case
         when form_data ? 'style_direction' then '{}'::jsonb
         when form_data->>'favour_style' = 'edible'
           then jsonb_build_object(
             'style_direction',
             jsonb_build_array(
               jsonb_build_object('style_id', 'modern_curated', 'reaction', 'love')
             )
           )
         when form_data->>'favour_style' = 'keepsake'
           then jsonb_build_object(
             'style_direction',
             jsonb_build_array(
               jsonb_build_object('style_id', 'traditional_heritage', 'reaction', 'love')
             )
           )
         when form_data->>'favour_style' = 'charitable_donation'
           then jsonb_build_object(
             'style_direction',
             jsonb_build_array(
               jsonb_build_object('style_id', 'eco_friendly_sustainable', 'reaction', 'love')
             )
           )
         when form_data->>'favour_style' = 'personalized'
           then jsonb_build_object(
             'style_direction',
             jsonb_build_array(
               jsonb_build_object('style_id', 'diy_personal', 'reaction', 'love')
             )
           )
         else jsonb_build_object('style_direction', '[]'::jsonb)
       end
    -- budget_anchors object from budget_approach
    || case
         when form_data ? 'budget_anchors' then '{}'::jsonb
         when form_data->>'budget_approach' = 'splurge_on_family_simple_for_guests'
           then jsonb_build_object(
             'budget_anchors',
             jsonb_build_object(
               'welcome_bags_per_bag',         'tbd',
               'return_favors_per_guest',      '$5-15',
               'family_exchanges_per_family',  '$750-2000',
               'trousseau_packaging_total',    'tbd'
             )
           )
         when form_data->>'budget_approach' = 'equal_for_all'
           then jsonb_build_object(
             'budget_anchors',
             jsonb_build_object(
               'welcome_bags_per_bag',         '$30-60',
               'return_favors_per_guest',      '$15-35',
               'family_exchanges_per_family',  '$300-750',
               'trousseau_packaging_total',    '$1.5K-4K'
             )
           )
         else jsonb_build_object(
           'budget_anchors',
           jsonb_build_object(
             'welcome_bags_per_bag',         'tbd',
             'return_favors_per_guest',      'tbd',
             'family_exchanges_per_family',  'tbd',
             'trousseau_packaging_total',    'tbd'
           )
         )
       end
)
where s.session_key = 'gifting_philosophy'
  and s.journey_id = 'default';

-- 2. Promote any pre-existing gift_details data into the new
--    gifting_inspiration session bag (initialised empty so the new
--    session can hydrate). gift_details bag itself stays in place — the
--    UI no longer reads it, but it's preserved for audit. The session
--    row for gift_details is deleted because the session no longer
--    exists in the schema.

update public.guided_journey_sessions s
set form_data = jsonb_build_object(
    'idea_reactions',  '[]'::jsonb,
    'moodboard_pins',  '[]'::jsonb,
    'palette_hexes',   '[]'::jsonb,
    'vision_notes',    ''
  )
where s.session_key = 'gifting_inspiration'
  and s.journey_id = 'default'
  and (s.form_data is null or s.form_data = '{}'::jsonb);

-- 3. Remove the obsolete gift_details session row. If a row was already
--    seeded (from the prior schema), drop it so it doesn't show up in
--    progress totals. The session_definitions row for it is also
--    cleaned up further down.

delete from public.guided_journey_sessions
 where session_key = 'gift_details'
   and journey_id = 'default';

delete from public.session_definitions
 where category = 'gifting'
   and session_key = 'gift_details'
   and journey_id = 'default';

-- 4. Insert the new gifting_inspiration session_definition for default
--    journey if not already present.

insert into public.session_definitions
  (category, journey_id, session_key, session_index)
values
  ('gifting', 'default', 'gifting_inspiration', 2)
on conflict (category, journey_id, session_key) do nothing;
