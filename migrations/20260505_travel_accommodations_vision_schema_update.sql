-- Migration · Travel & Accommodations Vision schema update
-- ────────────────────────────────────────────────────────────────────────
-- Reshapes form_data on the Travel Vision sessions to match the deeper
-- schema used by the full Hotel Strategy tab (Tab 1 of the workspace).
-- The Vision phase keeps three sessions; only their `form_data` shape
-- changes.
--
-- Sessions:
--   accommodation_needs   — REPLACES out_of_town_percentage with the
--                            structured guest_math object; ADDS proximity
--                            object; REPLACES hotel_tier_preference with
--                            block_strategy (different decision); ADDS
--                            budget_approach (the most important new
--                            field). Keeps family_suites_needed,
--                            hospitality_suite, welcome_bags as flags.
--   guest_travel          — ADDS guest_source_cities[] and
--                            international_guest_count_estimate. Keeps
--                            every existing field.
--   travel_brief          — UNCHANGED.
--
-- Backfill rules:
--   • guest_math.out_of_town_guests:
--       - Computed from out_of_town_percentage × estimated_total_guests.
--         Couples without a guest count fall back to 0 (they re-enter).
--   • guest_math.nights_needed:    default 3.
--   • guest_math.dates_window:     empty.
--   • guest_math.rooms_needed:     default 0 (auto-calc'd by the Tab 1
--                                  estimator @ 1.9 guests/room).
--   • guest_math.rooms_per_room_estimate: default 1.9.
--   • proximity.on_site_rooms_at_venue:
--       - Old proximity_to_venue=on_site → 'yes'
--       - Old proximity_to_venue=walking_distance|shuttle_distance|flexible → 'no'
--       - Otherwise → 'not_sure_yet'
--   • proximity.nearby_hotels:        empty array.
--   • proximity.shuttle_needed_between_hotel_and_venue:
--       - Old proximity_to_venue=shuttle_distance → true
--       - Otherwise → false
--   • block_strategy:
--       - Old hotel_tier_preference=luxury|upscale|mid_range → 'single'
--       - Old hotel_tier_preference=mix → 'two_tier'
--       - Otherwise → 'single' (most-common default)
--   • budget_approach: default 'negotiated_rate_guests_pay'
--     (most common — couples renegotiate later if they decide to cover).
--
-- Deprecated fields stay in JSONB but stop being read. No destructive drop.
-- The Vision schema in lib/guided-journey/schemas.ts no longer references
-- out_of_town_percentage, hotel_tier_preference, proximity_to_venue,
-- room_block_needed, or room_block_size — they remain in the bag for
-- historical inspection only.

-- 1. Update accommodation_needs form_data ─────────────────────────────────

update public.guided_journey_sessions s
set form_data = (
    coalesce(form_data, '{}'::jsonb)
    -- guest_math object
    || case
         when form_data ? 'guest_math' then '{}'::jsonb
         else jsonb_build_object(
           'guest_math',
           jsonb_build_object(
             'out_of_town_guests',
               coalesce(
                 case when (form_data->>'out_of_town_percentage') ~ '^\d+$'
                      then ((form_data->>'out_of_town_percentage')::int)
                      else 0 end,
                 0
               ),
             'nights_needed', 3,
             'dates_window', '',
             'rooms_needed', 0,
             'rooms_per_room_estimate', 1.9
           )
         )
       end
    -- proximity object
    || case
         when form_data ? 'proximity' then '{}'::jsonb
         else jsonb_build_object(
           'proximity',
           jsonb_build_object(
             'on_site_rooms_at_venue', case
               when (form_data->>'proximity_to_venue') = 'on_site' then 'yes'
               when (form_data->>'proximity_to_venue') in
                    ('walking_distance', 'shuttle_distance', 'flexible')
                 then 'no'
               else 'not_sure_yet'
             end,
             'on_site_details', '',
             'nearby_hotels', '[]'::jsonb,
             'shuttle_needed_between_hotel_and_venue',
               (form_data->>'proximity_to_venue') = 'shuttle_distance'
           )
         )
       end
    -- block_strategy
    || case
         when form_data ? 'block_strategy' then '{}'::jsonb
         else jsonb_build_object(
           'block_strategy',
           case
             when (form_data->>'hotel_tier_preference')
                  in ('luxury', 'upscale', 'mid_range') then 'single'
             when (form_data->>'hotel_tier_preference') = 'mix' then 'two_tier'
             else 'single'
           end
         )
       end
    -- budget_approach (the most important new field)
    || case
         when form_data ? 'budget_approach' then '{}'::jsonb
         else jsonb_build_object(
           'budget_approach', 'negotiated_rate_guests_pay'
         )
       end
)
where s.session_key = 'accommodation_needs'
  and s.journey_id = 'default';

-- 2. Update guest_travel form_data ────────────────────────────────────────
--    ADD guest_source_cities[] and international_guest_count_estimate when
--    absent. Keep every existing field.

update public.guided_journey_sessions s
set form_data = (
    coalesce(form_data, '{}'::jsonb)
    || case
         when form_data ? 'guest_source_cities' then '{}'::jsonb
         else jsonb_build_object('guest_source_cities', '[]'::jsonb)
       end
    || case
         when form_data ? 'international_guest_count_estimate' then '{}'::jsonb
         else jsonb_build_object('international_guest_count_estimate', 0)
       end
)
where s.session_key = 'guest_travel'
  and s.journey_id = 'default';

-- 3. travel_brief — UNCHANGED. No-op for completeness.
