-- Migration · Jewelry Vision schema update
-- ────────────────────────────────────────────────────────────────────────
-- Reshapes form_data on the three default-journey Jewelry vision sessions
-- to match the schema used by the new full workspace + Build journey.
--
-- Sessions:
--   jewelry_direction    — adds the 3-step direction picker
--                          (direction.{base_metals, style_families,
--                          weight_vibe}), expanded 19-chip style_keywords,
--                          sourcing_mix object. Drops style_preferences,
--                          metal_preferences, rental_open. Preserves
--                          heirloom_pieces[] under _legacy_heirloom_pieces
--                          for the Build journey to consume on first
--                          hydration.
--   jewelry_inspiration  — NEW session. Backfills empty arrays for
--                          moodboard_pins[], per_event_references[],
--                          celebrity_inspiration[], expression_wishlist[],
--                          outfit_pairing_anchors[]. Original
--                          per_event_jewelry session data is preserved
--                          under jewelry_direction._legacy_per_event_jewelry.
--   jewelry_brief        — adds total_estimated_value_range. Existing
--                          insurance_needed flag preserved.
--
-- Backfill rules per the build prompt:
--   • metal_preferences[] → direction.base_metals[]
--       gold              → gold
--       silver            → silver
--       platinum          → platinum_white_gold
--       rose_gold         → gold (rose_gold is a sub-tone of gold)
--   • style_preferences[] → direction.style_families[]
--       traditional_kundan / kundan / polki  → traditional_kundan_polki
--       temple                                → temple
--       jadau / meenakari                     → jadau_meenakari
--       diamond / contemporary                → modern_diamond
--       minimalist                            → minimalist_delicate
--       statement                             → heirloom_revival
--       pearl                                 → minimalist_delicate
--   • style_keywords[] = original style_preferences[] (verbatim, plus
--     custom additions)
--   • direction.weight_vibe defaults to traditional_modern_twist
--     (most common — couples can re-pick later)
--   • sourcing_mix:
--       new_purchases  = true       (safe default — most couples buy some)
--       family_heirlooms = (heirloom_pieces.length > 0)
--       rentals        = rental_open
--       custom_designed = false     (off by default)
--
-- Deprecated fields stay in JSONB but stop being read. No destructive drop.
-- per_event_jewelry session row is removed (data preserved under the
-- _legacy_per_event_jewelry key on jewelry_direction).

-- 1. Update jewelry_direction form_data ──────────────────────────────────

update public.guided_journey_sessions s
set form_data = (
    coalesce(form_data, '{}'::jsonb)

    -- style_keywords (verbatim copy from style_preferences[])
    || case
         when form_data ? 'style_keywords' then '{}'::jsonb
         when jsonb_typeof(form_data->'style_preferences') = 'array'
           then jsonb_build_object('style_keywords', form_data->'style_preferences')
         else jsonb_build_object('style_keywords', '[]'::jsonb)
       end

    -- direction object
    || case
         when form_data ? 'direction' then '{}'::jsonb
         else jsonb_build_object(
           'direction',
           jsonb_build_object(
             -- base_metals[]
             'base_metals',
             coalesce(
               (
                 select jsonb_agg(distinct mapped) filter (where mapped is not null)
                 from (
                   select case
                     when v = 'gold'       then 'gold'
                     when v = 'silver'     then 'silver'
                     when v = 'platinum'   then 'platinum_white_gold'
                     when v = 'rose_gold'  then 'gold'
                     else null
                   end as mapped
                   from jsonb_array_elements_text(
                     coalesce(form_data->'metal_preferences', '[]'::jsonb)
                   ) as v
                 ) m
               ),
               '[]'::jsonb
             ),
             -- style_families[]
             'style_families',
             coalesce(
               (
                 select jsonb_agg(distinct mapped) filter (where mapped is not null)
                 from (
                   select case
                     when v in ('traditional_kundan', 'kundan', 'polki')
                       then 'traditional_kundan_polki'
                     when v = 'temple'                  then 'temple'
                     when v in ('jadau', 'meenakari')   then 'jadau_meenakari'
                     when v in ('diamond', 'contemporary') then 'modern_diamond'
                     when v = 'minimalist'              then 'minimalist_delicate'
                     when v = 'statement'               then 'heirloom_revival'
                     when v = 'pearl'                   then 'minimalist_delicate'
                     else null
                   end as mapped
                   from jsonb_array_elements_text(
                     coalesce(form_data->'style_preferences', '[]'::jsonb)
                   ) as v
                 ) m
               ),
               '[]'::jsonb
             ),
             -- weight_vibe default
             'weight_vibe', 'traditional_modern_twist'
           )
         )
       end

    -- sourcing_mix
    || case
         when form_data ? 'sourcing_mix' then '{}'::jsonb
         else jsonb_build_object(
           'sourcing_mix',
           jsonb_build_object(
             'new_purchases', true,
             'family_heirlooms',
               coalesce(
                 (jsonb_typeof(form_data->'heirloom_pieces') = 'array'
                  and jsonb_array_length(form_data->'heirloom_pieces') > 0),
                 false
               ),
             'rentals', coalesce((form_data->>'rental_open')::boolean, false),
             'custom_designed', false
           )
         )
       end

    -- _legacy_heirloom_pieces (preserve under a dedicated key for Build)
    || case
         when form_data ? '_legacy_heirloom_pieces' then '{}'::jsonb
         when jsonb_typeof(form_data->'heirloom_pieces') = 'array'
           then jsonb_build_object('_legacy_heirloom_pieces', form_data->'heirloom_pieces')
         else '{}'::jsonb
       end
)
where s.session_key = 'jewelry_direction'
  and s.journey_id = 'default';

-- 2. Move per_event_jewelry → jewelry_direction._legacy_per_event_jewelry ─

update public.guided_journey_sessions s
set form_data = (
    coalesce(form_data, '{}'::jsonb)
    || jsonb_build_object(
      '_legacy_per_event_jewelry',
      coalesce(
        (
          select form_data
          from public.guided_journey_sessions p
          where p.workspace_id = s.workspace_id
            and p.journey_id = 'default'
            and p.session_key = 'per_event_jewelry'
          limit 1
        ),
        '{}'::jsonb
      )
    )
)
where s.session_key = 'jewelry_direction'
  and s.journey_id = 'default'
  and exists (
    select 1
    from public.guided_journey_sessions p
    where p.workspace_id = s.workspace_id
      and p.journey_id = 'default'
      and p.session_key = 'per_event_jewelry'
  );

-- 3. Drop per_event_jewelry session rows (data preserved under
--    jewelry_direction._legacy_per_event_jewelry above).

delete from public.guided_journey_sessions
where session_key = 'per_event_jewelry'
  and journey_id = 'default';

-- 4. Drop per_event_jewelry from session_definitions and replace with
--    jewelry_inspiration.

delete from public.session_definitions
where category = 'jewelry'
  and journey_id = 'default'
  and session_key = 'per_event_jewelry';

insert into public.session_definitions
  (category, journey_id, session_key, session_index)
values
  ('jewelry', 'default', 'jewelry_inspiration', 2)
on conflict (category, journey_id, session_key) do nothing;

-- 5. Seed jewelry_inspiration session rows for every workspace that
--    currently has a default jewelry journey but no inspiration session
--    yet (i.e. anyone who started Vision before this migration). Empty
--    arrays for all the rich fields — couples populate them on next
--    visit.

insert into public.guided_journey_sessions
  (workspace_id, journey_id, session_key, session_index, status, form_data)
select
  s.workspace_id,
  'default',
  'jewelry_inspiration',
  2,
  'not_started',
  jsonb_build_object(
    'moodboard_pins', '[]'::jsonb,
    'per_event_references', '[]'::jsonb,
    'celebrity_inspiration', '[]'::jsonb,
    'expression_wishlist', '[]'::jsonb,
    'outfit_pairing_anchors', '[]'::jsonb
  )
from public.guided_journey_sessions s
where s.session_key = 'jewelry_direction'
  and s.journey_id = 'default'
on conflict (workspace_id, journey_id, session_key) do nothing;

-- 6. Update jewelry_brief form_data to add total_estimated_value_range
--    (default null low/high — couple fills in).

update public.guided_journey_sessions s
set form_data = (
    coalesce(form_data, '{}'::jsonb)
    || case
         when form_data ? 'total_estimated_value_range' then '{}'::jsonb
         else jsonb_build_object(
           'total_estimated_value_range',
           jsonb_build_object('low', null, 'high', null)
         )
       end
)
where s.session_key = 'jewelry_brief'
  and s.journey_id = 'default';
