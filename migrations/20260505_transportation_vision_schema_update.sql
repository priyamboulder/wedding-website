-- Migration · Transportation Vision schema update
-- ────────────────────────────────────────────────────────────────────────
-- Reshapes form_data on the Transportation Vision sessions to match the
-- deeper schema added when the Build journey landed. Vision keeps its
-- 2-session shape and 5-minute total estimate; only field shape changes.
--
-- Sessions:
--   transport_needs   — RESHAPED:
--                        • couple_arrivals.{bride_arrival, groom_arrival,
--                          between_events, send_off_exit}     (NEW)
--                        • baraat_intent.{happening, style,
--                          dhol_with_baraat, dream_note}      (was
--                          baraat_details.*)
--                        • guest_shuttle_intent.{needed, return_service,
--                          late_night_service, rough_guest_count}
--                          (was guest_shuttle.* — concrete counts move
--                          to Build session 2)
--                        • getaway_car.*                      (unchanged)
--                        • vendor_transport_flags.{...}       (NEW)
--   transport_brief   — UNCHANGED. Session 2 stays a brief.
--
-- Backfill rules:
--   • baraat_intent.happening: true when legacy baraat_details.style is
--     present and not 'none'.
--   • baraat_intent.style: copies legacy baraat_details.style verbatim;
--     defaults to 'tbd' when absent.
--   • baraat_intent.dhol_with_baraat: copies legacy
--     baraat_details.dhol_with_baraat.
--   • baraat_intent.dream_note: copies legacy baraat_details.route_notes.
--   • guest_shuttle_intent.needed/return_service/late_night_service:
--     copies legacy guest_shuttle.* verbatim.
--   • guest_shuttle_intent.rough_guest_count: copies legacy
--     guest_shuttle.hotel_to_venue_count.
--   • couple_arrivals.send_off_exit: derived from legacy
--     getaway_car.style_preference if it looks like a vehicle keyword;
--     otherwise 'tbd'. Heuristic mirrors lib/guided-journey/storage.ts
--     migrateTransportationVision().
--   • vendor_transport_flags: initialized to defaults (false everywhere);
--     couples answer in the revised Vision UI.
--
-- Deprecated fields (baraat_details, guest_shuttle) stay in JSONB but
-- stop being read. No destructive drop — Build's pre-seed logic also
-- depends on the original keys to grandfather in early-adopter data.

update public.guided_journey_sessions s
set form_data = (
    coalesce(form_data, '{}'::jsonb)
    -- couple_arrivals (idempotent)
    || case
         when form_data ? 'couple_arrivals' then '{}'::jsonb
         else jsonb_build_object(
           'couple_arrivals',
           jsonb_build_object(
             'bride_arrival', 'tbd',
             'groom_arrival', 'tbd',
             'between_events', 'tbd',
             'send_off_exit', case
               when form_data->'getaway_car'->>'style_preference' is null then 'tbd'
               when form_data->'getaway_car'->>'style_preference' = '' then 'tbd'
               when (form_data->'getaway_car'->>'style_preference') ilike any (array['%vintage%', '%rolls%', '%royce%', '%classic%']) then 'vintage_car'
               when (form_data->'getaway_car'->>'style_preference') ilike '%limo%' then 'limo'
               when (form_data->'getaway_car'->>'style_preference') ilike '%firework%' then 'fireworks_only'
               when (form_data->'getaway_car'->>'style_preference') ilike any (array['%decorated%', '%suv%']) then 'decorated_car'
               else 'getaway_car'
             end
           )
         )
       end
    -- baraat_intent (idempotent)
    || case
         when form_data ? 'baraat_intent' then '{}'::jsonb
         else jsonb_build_object(
           'baraat_intent',
           jsonb_build_object(
             'happening', case
               when (form_data->'baraat_details'->>'style') is null then false
               when (form_data->'baraat_details'->>'style') = 'none' then false
               else true
             end,
             'style', coalesce(form_data->'baraat_details'->>'style', 'tbd'),
             'dhol_with_baraat', coalesce((form_data->'baraat_details'->>'dhol_with_baraat')::boolean, false),
             'dream_note', coalesce(form_data->'baraat_details'->>'route_notes', '')
           )
         )
       end
    -- guest_shuttle_intent (idempotent)
    || case
         when form_data ? 'guest_shuttle_intent' then '{}'::jsonb
         else jsonb_build_object(
           'guest_shuttle_intent',
           jsonb_build_object(
             'needed', coalesce((form_data->'guest_shuttle'->>'needed')::boolean, false),
             'return_service', coalesce((form_data->'guest_shuttle'->>'return_service')::boolean, false),
             'late_night_service', coalesce((form_data->'guest_shuttle'->>'late_night_service')::boolean, false),
             'rough_guest_count', case
               when (form_data->'guest_shuttle'->>'hotel_to_venue_count') is null then null
               else (form_data->'guest_shuttle'->>'hotel_to_venue_count')::int
             end
           )
         )
       end
    -- vendor_transport_flags (idempotent)
    || case
         when form_data ? 'vendor_transport_flags' then '{}'::jsonb
         else jsonb_build_object(
           'vendor_transport_flags',
           jsonb_build_object(
             'dhol_players_need_transport', false,
             'other_vendors_need_transport', false
           )
         )
       end
)
where s.session_key = 'transport_needs'
  and s.journey_id = 'default';
