-- Migration · Wardrobe Build journey seed
-- ────────────────────────────────────────────────────────────────────────
-- Registers the three-session Build journey on the wardrobe category
-- alongside the existing default Vision journey. Uses the journey_id
-- column added in 20260505_add_journey_id_to_guided_sessions.sql.
--
-- Sessions:
--   1. outfit_planner       — bride first, then groom, then "+ add person".
--                             Per-cell colour, designer, status, jewelry.
--   2. family_coordination  — bride/groom-side family roster, AI palette
--                             suggestions per side per event, accepted
--                             coordination rules.
--   3. delivery_documents   — auto-seeded delivery slots from purchased
--                             outfits, file uploads, alterations buffer,
--                             one-way handoffs to Photography & HMUA.
--
-- Build does NOT generate a closing brief. Vision already produced the
-- brief that goes to designers and stylists. Build's output is operational.
-- Completion lands the couple on Tab 3 (Event Looks) with three action
-- CTAs (Share with stylist / Share with planner / Send swatches to
-- photography & HMUA).

insert into public.session_definitions
  (category, journey_id, session_key, session_index)
values
  ('wardrobe', 'build', 'outfit_planner',      1),
  ('wardrobe', 'build', 'family_coordination', 2),
  ('wardrobe', 'build', 'delivery_documents',  3)
on conflict (category, journey_id, session_key) do nothing;

-- ── Optional backfill from legacy Vision data ─────────────────────────────
-- For any workspace that already has Vision Session 2 (per_event_outfits)
-- or Session 3 (family_wardrobe) data, seed the corresponding Build session
-- form_data so couples don't lose previously-entered outfits / family
-- members on upgrade. The Build session UIs read directly through the
-- workspace_store (WorkspaceItems), so for v1 we copy the legacy form_data
-- into the new build sessions' form_data verbatim — the UIs ignore unused
-- keys, and the matrix view continues to read from workspace_store as the
-- canonical source.

-- Seed outfit_planner.legacy_outfits[] from per_event_outfits.outfits[]
insert into public.guided_journey_sessions
  (workspace_id, journey_id, session_key, session_index, status, form_data)
select
  s.workspace_id,
  'build'::text,
  'outfit_planner'::text,
  1,
  'not_started'::text,
  jsonb_build_object(
    'people', '[]'::jsonb,
    'outfits', '[]'::jsonb,
    'legacy_outfits',
      coalesce(
        case when jsonb_typeof(s.form_data->'outfits') = 'array'
             then s.form_data->'outfits' else '[]'::jsonb end,
        '[]'::jsonb
      )
  )
from public.guided_journey_sessions s
where s.session_key in ('wardrobe_inspiration', 'per_event_outfits')
  and s.journey_id = 'default'
on conflict (workspace_id, journey_id, session_key) do nothing;

-- Seed family_coordination.legacy_family_members[] from family_wardrobe
insert into public.guided_journey_sessions
  (workspace_id, journey_id, session_key, session_index, status, form_data)
select
  s.workspace_id,
  'build'::text,
  'family_coordination'::text,
  2,
  'not_started'::text,
  jsonb_build_object(
    'family_members', '[]'::jsonb,
    'side_palettes', '[]'::jsonb,
    'family_outfits', '[]'::jsonb,
    'coordination_rules', '[]'::jsonb,
    'legacy_family_members',
      coalesce(
        case when jsonb_typeof(s.form_data->'family_members') = 'array'
             then s.form_data->'family_members' else '[]'::jsonb end,
        '[]'::jsonb
      ),
    'legacy_dress_code_by_event',
      coalesce(
        case when jsonb_typeof(s.form_data->'dress_code_by_event') = 'array'
             then s.form_data->'dress_code_by_event' else '[]'::jsonb end,
        '[]'::jsonb
      )
  )
from public.guided_journey_sessions s
where s.session_key = 'family_wardrobe'
  and s.journey_id = 'default'
on conflict (workspace_id, journey_id, session_key) do nothing;

-- Seed delivery_documents (empty bag — slot auto-seeding happens in the
-- session UI from purchased outfits at runtime).
insert into public.guided_journey_sessions
  (workspace_id, journey_id, session_key, session_index, status, form_data)
select distinct
  s.workspace_id,
  'build'::text,
  'delivery_documents'::text,
  3,
  'not_started'::text,
  jsonb_build_object(
    'delivery_slots', '[]'::jsonb,
    'files', '[]'::jsonb,
    'alterations_buffer', jsonb_build_object(
      'enabled', true,
      'buffer_days', 5,
      'notes', ''
    ),
    'vendor_handoff', jsonb_build_object(
      'photographer_swatches_shared', false,
      'hmua_outfit_photos_shared', false,
      'notes', ''
    )
  )
from public.guided_journey_sessions s
where s.journey_id = 'default'
  and s.session_key in ('wardrobe_style', 'wardrobe_inspiration', 'wardrobe_brief')
on conflict (workspace_id, journey_id, session_key) do nothing;
