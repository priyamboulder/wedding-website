-- Migration · Wardrobe Vision schema update
-- ────────────────────────────────────────────────────────────────────────
-- Reshapes form_data on the Wardrobe vision sessions to match the deeper
-- schema used by the full Vision tab (per-event palette, role-tagged
-- moodboard, per-event references, brief themes). Drops the family_wardrobe
-- session — that data migrates to Build Session 2 (family_coordination).
--
-- Sessions:
--   wardrobe_style        — ADDS palette_by_event[] (5 events × swatches[]).
--                           Pre-seeds defaults from event-palette-defaults.
--                           Replaces colour_families[] (left in JSONB,
--                           stops being read).
--                           Style keywords expand from 8 chips to 16.
--   wardrobe_inspiration  — NEW (renamed from per_event_outfits). Holds
--                           moodboard_pins[] (with role tag) and
--                           per_event_references[] (with Love/No reactions).
--                           per_event_outfits[] data migrates to Build
--                           Session 1 — see the build seed migration.
--   family_wardrobe       — DROPPED from Vision. Its family_members[] data
--                           migrates to Build Session 2.
--   wardrobe_brief        — ADDS brief_themes[] (heritage, statement,
--                           comfort, family_tradition, modernity, romance).
--                           Pre-fills from brief_text content via keyword
--                           matching.
--
-- Backfill rules:
--   • palette_by_event[]:
--       - For each colour family in colour_families[], map to one or more
--         event/hex pairs via the COLOUR_FAMILY_TO_EVENT_HEX table in
--         lib/libraries/event-palette-defaults.ts.
--       - Any event missing swatches gets the cultural-default palette.
--   • brief_themes[]:
--       - Keyword scan on brief_text:
--           heirloom|tradition|family|grandmother → heritage, family_tradition
--           statement|bold|dramatic|editorial    → statement
--           comfort|easy|breathable              → comfort
--           contemporary|modern|minimal          → modernity
--           romantic|soft|dreamy                 → romance
--   • per_event_outfits[].outfits[] (legacy) → migrated to Build Session 1
--     via the build seed migration.
--   • family_wardrobe.family_members[] (legacy) → migrated to Build Session
--     2 via the build seed migration.
--
-- Deprecated fields stay in JSONB but stop being read. No destructive drop.

-- 1. Update wardrobe_style form_data ──────────────────────────────────────

update public.guided_journey_sessions s
set form_data = (
    coalesce(form_data, '{}'::jsonb)
    -- palette_by_event[] (idempotent — only rebuild when missing)
    || case
         when form_data ? 'palette_by_event' then '{}'::jsonb
         else jsonb_build_object(
           'palette_by_event',
           jsonb_build_array(
             jsonb_build_object(
               'event', 'haldi',
               'swatches', case
                 when (form_data->'colour_families') ? 'pastels'
                   then jsonb_build_array(
                     jsonb_build_object('hex', '#F6D36B', 'label', 'marigold gold'),
                     jsonb_build_object('hex', '#E8B64A', 'label', 'saffron'),
                     jsonb_build_object('hex', '#FFFDF7', 'label', 'ivory')
                   )
                 else jsonb_build_array(
                   jsonb_build_object('hex', '#F6D36B', 'label', 'marigold gold'),
                   jsonb_build_object('hex', '#E8B64A', 'label', 'saffron'),
                   jsonb_build_object('hex', '#FFFDF7', 'label', 'ivory')
                 )
               end
             ),
             jsonb_build_object(
               'event', 'mehendi',
               'swatches', case
                 when (form_data->'colour_families') ? 'sage'
                   then jsonb_build_array(
                     jsonb_build_object('hex', '#9CAF88', 'label', 'sage'),
                     jsonb_build_object('hex', '#C9D6A7', 'label', 'jade pale'),
                     jsonb_build_object('hex', '#F5E6D3', 'label', 'warm cream')
                   )
                 else jsonb_build_array(
                   jsonb_build_object('hex', '#9CAF88', 'label', 'sage'),
                   jsonb_build_object('hex', '#C9D6A7', 'label', 'jade pale'),
                   jsonb_build_object('hex', '#F5E6D3', 'label', 'warm cream')
                 )
               end
             ),
             jsonb_build_object(
               'event', 'sangeet',
               'swatches', case
                 when (form_data->'colour_families') ? 'pink_blush'
                      or (form_data->'colour_families') ? 'jewel_tones'
                   then jsonb_build_array(
                     jsonb_build_object('hex', '#C94088', 'label', 'fuchsia'),
                     jsonb_build_object('hex', '#E05A9F', 'label', 'rose pink'),
                     jsonb_build_object('hex', '#F7C8DC', 'label', 'blush')
                   )
                 else jsonb_build_array(
                   jsonb_build_object('hex', '#C94088', 'label', 'fuchsia'),
                   jsonb_build_object('hex', '#E05A9F', 'label', 'rose pink'),
                   jsonb_build_object('hex', '#F7C8DC', 'label', 'blush')
                 )
               end
             ),
             jsonb_build_object(
               'event', 'wedding',
               'swatches', case
                 when (form_data->'colour_families') ? 'red_maroon'
                   then jsonb_build_array(
                     jsonb_build_object('hex', '#B91C1C', 'label', 'crimson red'),
                     jsonb_build_object('hex', '#7F1D1D', 'label', 'deep maroon'),
                     jsonb_build_object('hex', '#D4A853', 'label', 'wedding gold')
                   )
                 when (form_data->'colour_families') ? 'gold_champagne'
                   then jsonb_build_array(
                     jsonb_build_object('hex', '#D4A853', 'label', 'wedding gold'),
                     jsonb_build_object('hex', '#B91C1C', 'label', 'crimson red'),
                     jsonb_build_object('hex', '#7F1D1D', 'label', 'deep maroon')
                   )
                 else jsonb_build_array(
                   jsonb_build_object('hex', '#B91C1C', 'label', 'crimson red'),
                   jsonb_build_object('hex', '#7F1D1D', 'label', 'deep maroon'),
                   jsonb_build_object('hex', '#D4A853', 'label', 'wedding gold')
                 )
               end
             ),
             jsonb_build_object(
               'event', 'reception',
               'swatches', case
                 when (form_data->'colour_families') ? 'gold_champagne'
                   then jsonb_build_array(
                     jsonb_build_object('hex', '#F5E0D6', 'label', 'blush'),
                     jsonb_build_object('hex', '#D4A853', 'label', 'champagne'),
                     jsonb_build_object('hex', '#F5E6D3', 'label', 'soft cream')
                   )
                 when (form_data->'colour_families') ? 'navy'
                   then jsonb_build_array(
                     jsonb_build_object('hex', '#1E2A47', 'label', 'navy'),
                     jsonb_build_object('hex', '#D4A853', 'label', 'champagne'),
                     jsonb_build_object('hex', '#F5E6D3', 'label', 'soft cream')
                   )
                 else jsonb_build_array(
                   jsonb_build_object('hex', '#F5E0D6', 'label', 'blush'),
                   jsonb_build_object('hex', '#D4A853', 'label', 'champagne'),
                   jsonb_build_object('hex', '#F5E6D3', 'label', 'soft cream')
                 )
               end
             )
           )
         )
       end
)
where s.session_key = 'wardrobe_style'
  and s.journey_id = 'default';

-- 2. Migrate per_event_outfits → wardrobe_inspiration ─────────────────────
--    Rename the session_key in place and add new fields. Old form_data
--    fields stay (legacy outfits[] is read by the Build seed migration to
--    populate the outfit matrix).

update public.guided_journey_sessions s
set
  session_key = 'wardrobe_inspiration',
  form_data = (
    coalesce(form_data, '{}'::jsonb)
    || case
         when form_data ? 'moodboard_pins' then '{}'::jsonb
         else jsonb_build_object('moodboard_pins', '[]'::jsonb)
       end
    || case
         when form_data ? 'per_event_references' then '{}'::jsonb
         else jsonb_build_object('per_event_references', '[]'::jsonb)
       end
  )
where s.session_key = 'per_event_outfits'
  and s.journey_id = 'default'
  and exists (
    select 1
    from public.session_definitions sd
    where sd.category = 'wardrobe' and sd.journey_id = 'default'
  );

-- Update the static session_definitions registry to match.
update public.session_definitions
  set session_key = 'wardrobe_inspiration', session_index = 2
  where category = 'wardrobe'
    and journey_id = 'default'
    and session_key = 'per_event_outfits';

-- 3. Drop family_wardrobe from Vision ─────────────────────────────────────
--    Family roster moves to Build Session 2 (family_coordination). The row
--    survives in case the Build seed migration needs to read its data, but
--    Vision stops listing it.

delete from public.session_definitions
  where category = 'wardrobe'
    and journey_id = 'default'
    and session_key = 'family_wardrobe';

-- The form_data row stays in guided_journey_sessions (if it exists) so the
-- Build seed migration can backfill family_coordination from it. We just
-- mark the row "completed" so it doesn't appear in any "incomplete sessions"
-- count from the legacy schema.
update public.guided_journey_sessions
  set status = 'completed'
  where session_key = 'family_wardrobe'
    and journey_id = 'default';

-- 4. Renumber wardrobe_brief to session_index = 3 ─────────────────────────

update public.session_definitions
  set session_index = 3
  where category = 'wardrobe'
    and journey_id = 'default'
    and session_key = 'wardrobe_brief';

-- 5. Add brief_themes[] to wardrobe_brief form_data ───────────────────────

update public.guided_journey_sessions s
set form_data = (
    coalesce(form_data, '{}'::jsonb)
    || case
         when form_data ? 'brief_themes' then '{}'::jsonb
         else jsonb_build_object(
           'brief_themes',
           coalesce(
             (
               select jsonb_agg(distinct theme)
               from (
                 select theme
                 from (
                   values
                     (case
                        when (form_data->>'brief_text') ilike any (array['%heirloom%','%tradition%','%family%','%grandmother%','%mother%']) then 'heritage' end),
                     (case
                        when (form_data->>'brief_text') ilike any (array['%heirloom%','%tradition%','%family%','%grandmother%','%mother%']) then 'family_tradition' end),
                     (case
                        when (form_data->>'brief_text') ilike any (array['%statement%','%bold%','%dramatic%','%editorial%','%fashion%']) then 'statement' end),
                     (case
                        when (form_data->>'brief_text') ilike any (array['%comfort%','%easy%','%breathable%','%movement%','%dance%']) then 'comfort' end),
                     (case
                        when (form_data->>'brief_text') ilike any (array['%contemporary%','%modern%','%minimal%','%clean%']) then 'modernity' end),
                     (case
                        when (form_data->>'brief_text') ilike any (array['%romantic%','%soft%','%dreamy%','%delicate%']) then 'romance' end)
                 ) as themes(theme)
                 where theme is not null
               ) sub
             ),
             '[]'::jsonb
           )
         )
       end
    || case
         when form_data ? 'is_ai_generated' then '{}'::jsonb
         else jsonb_build_object('is_ai_generated', false)
       end
    || case
         when form_data ? 'couple_approved' then '{}'::jsonb
         else jsonb_build_object('couple_approved', false)
       end
)
where s.session_key = 'wardrobe_brief'
  and s.journey_id = 'default';
