-- Migration · Sweets Vision schema update
-- ────────────────────────────────────────────────────────────────────────
-- Reshapes form_data on the three default-journey Cake & Sweets vision
-- sessions to match the deeper schema used by the full workspace.
--
-- Sessions:
--   sweets_vision      — adds dessert_direction, sweetness_level,
--                        flavor_reactions[], expanded dietary_flags object,
--                        14-chip style_keywords. Drops cake_style,
--                        cake_flavours, mithai_preferences, dietary_sweets,
--                        design_keywords, per_event (these moved to either
--                        Selection sessions or Vision Session 2).
--   sweets_inspiration — adds per_event_references[], expression_wishlist[].
--                        Existing moodboard_pins[] gains category tagging.
--   sweets_brief       — unchanged.
--
-- Backfill rules:
--   • dessert_direction:
--       cake_style == "no_cake"          → "traditional_mithai"
--       cake_style != null               → "western_cake_pastries"
--       null                             → null (left for couple to pick)
--   • sweetness_level:                   default 50 (balanced)
--   • flavor_reactions[]: built from cake_flavours[] mapped to nearest
--     family with reaction = "love". Mapping:
--       chocolate*           → chocolate_rich
--       fruit*, citrus*      → fruity_fresh
--       pistachio, almond,
--         hazelnut, nut*     → nutty_warm
--       rose, cardamom,
--         saffron, floral*   → floral_delicate
--       chai, masala, spice* → spiced_aromatic
--       vanilla, cream,
--         buttercream*       → creamy_classic
--   • style_keywords:                    backfilled from design_keywords[]
--   • dietary_flags:                     each old dietary_sweets[] entry
--                                        flips its matching boolean.
--
-- Deprecated fields stay in JSONB but stop being read. No destructive drop.

-- 1. Update sweets_vision form_data ────────────────────────────────────────

update public.guided_journey_sessions s
set form_data = (
    coalesce(form_data, '{}'::jsonb)
    -- dessert_direction
    || case
         when form_data ? 'dessert_direction' then '{}'::jsonb
         when form_data->>'cake_style' = 'no_cake'
           then jsonb_build_object('dessert_direction', 'traditional_mithai')
         when form_data->>'cake_style' is not null
           then jsonb_build_object('dessert_direction', 'western_cake_pastries')
         else '{}'::jsonb
       end
    -- sweetness_level
    || case
         when form_data ? 'sweetness_level' then '{}'::jsonb
         else jsonb_build_object('sweetness_level', 50)
       end
    -- flavor_reactions[] (always rebuild; idempotent on empty arrays)
    || case
         when form_data ? 'flavor_reactions' then '{}'::jsonb
         when jsonb_typeof(form_data->'cake_flavours') = 'array'
           then jsonb_build_object(
             'flavor_reactions',
             coalesce(
               (
                 select jsonb_agg(jsonb_build_object(
                   'family',
                   case
                     when v ilike '%chocolate%' then 'chocolate_rich'
                     when v ilike '%fruit%' or v ilike '%citrus%' or v ilike '%berry%'
                       then 'fruity_fresh'
                     when v ilike '%pistachio%' or v ilike '%almond%' or v ilike '%hazel%'
                          or v ilike '%nut%' then 'nutty_warm'
                     when v ilike '%rose%' or v ilike '%cardamom%' or v ilike '%saffron%'
                          or v ilike '%floral%' or v ilike '%lavender%' then 'floral_delicate'
                     when v ilike '%chai%' or v ilike '%masala%' or v ilike '%spice%'
                          or v ilike '%cinnamon%' then 'spiced_aromatic'
                     else 'creamy_classic'
                   end,
                   'reaction', 'love'
                 ))
                 from jsonb_array_elements_text(form_data->'cake_flavours') as v
               ),
               '[]'::jsonb
             )
           )
         else jsonb_build_object('flavor_reactions', '[]'::jsonb)
       end
    -- style_keywords[] from design_keywords[]
    || case
         when form_data ? 'style_keywords' then '{}'::jsonb
         when jsonb_typeof(form_data->'design_keywords') = 'array'
           then jsonb_build_object('style_keywords', form_data->'design_keywords')
         else jsonb_build_object('style_keywords', '[]'::jsonb)
       end
    -- dietary_flags object from dietary_sweets[] chip set
    || case
         when form_data ? 'dietary_flags' then '{}'::jsonb
         else jsonb_build_object(
           'dietary_flags',
           jsonb_build_object(
             'nut_free',     coalesce((form_data->'dietary_sweets') ? 'nut_free', false),
             'gluten_free',  coalesce((form_data->'dietary_sweets') ? 'gluten_free', false),
             'dairy_free',   coalesce((form_data->'dietary_sweets') ? 'dairy_free', false),
             'egg_free',     coalesce((form_data->'dietary_sweets') ? 'egg_free', false),
             'soy_free',     coalesce((form_data->'dietary_sweets') ? 'soy_free', false),
             'vegan',        coalesce((form_data->'dietary_sweets') ? 'vegan', false),
             'specific_notes', coalesce(form_data->>'dietary_notes', '')
           )
         )
       end
)
where s.session_key = 'sweets_vision'
  and s.journey_id = 'default';

-- 2. Update sweets_inspiration form_data ───────────────────────────────────
--    Add per_event_references[] (empty seed) and expression_wishlist[].
--    Existing moodboard_pins[] keeps shape; categories come in fresh from
--    the UI as couples re-tag.

update public.guided_journey_sessions s
set form_data = (
    coalesce(form_data, '{}'::jsonb)
    || case
         when form_data ? 'per_event_references' then '{}'::jsonb
         else jsonb_build_object('per_event_references', '[]'::jsonb)
       end
    || case
         when form_data ? 'expression_wishlist' then '{}'::jsonb
         else jsonb_build_object('expression_wishlist', '[]'::jsonb)
       end
    || case
         when form_data ? 'moodboard_pins' then '{}'::jsonb
         else jsonb_build_object('moodboard_pins', '[]'::jsonb)
       end
)
where s.session_key = 'sweets_inspiration'
  and s.journey_id = 'default';

-- 3. (sweets_brief unchanged — no-op for clarity in audit logs.)
