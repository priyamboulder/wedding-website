-- ──────────────────────────────────────────────────────────────────────────
-- Vendor workspaces — the couple's pre-configured, scoped view of the
-- wedding that each vendor receives on invitation. Multi-tenant partner
-- layer: each vendor sees only what the couple has explicitly shared.
--
-- Mirrors types/vendor-workspace.ts — field names and JSON shapes match
-- 1:1 so the Zustand store can swap to this without content rewrites.
--
-- RLS summary:
--   • Couples can do anything with their own workspaces.
--   • Vendors can read (and narrowly update) only workspaces they have
--     claimed — enforced via vendor_workspace_invitations.claimed_by.
--   • Permissions table governs what scoped selects a vendor can make
--     against *other* tables (guests, budget, run_of_show) — enforced
--     in those tables' policies (out of scope here; hooks are noted).
-- ──────────────────────────────────────────────────────────────────────────

create extension if not exists "pgcrypto";

-- ── Enums ──────────────────────────────────────────────────────────────────

create type workspace_invite_status as enum (
  'not_invited',
  'invited',
  'active',
  'revoked'
);

create type workspace_discipline as enum (
  'catering',
  'hmua',
  'mehndi',
  'photography',
  'florals',
  'entertainment',
  'wardrobe',
  'stationery',
  'pandit_ceremony'
);

create type guest_visibility as enum (
  'full_contact',
  'names_and_dietary',
  'counts_only',
  'none'
);

create type vendor_list_visibility as enum (
  'all_vendors',
  'schedule_only',
  'none'
);

create type budget_visibility as enum (
  'their_line_item',
  'full_budget',
  'none'
);

create type run_of_show_visibility as enum (
  'their_entries',
  'their_plus_adjacent',
  'full_schedule'
);

create type communications_access as enum (
  'direct_with_couple',
  'couple_and_planner',
  'planner_only'
);

create type workspace_activity_kind as enum (
  'logged_in',
  'viewed',
  'updated',
  'message_sent',
  'file_uploaded',
  'confirmed_item'
);

create type workspace_activity_actor as enum ('vendor', 'couple', 'planner');

-- ── Main table ─────────────────────────────────────────────────────────────

create table if not exists vendor_workspaces (
  id                         uuid primary key default gen_random_uuid(),
  vendor_id                  uuid not null references vendors(id) on delete cascade,
  wedding_id                 uuid not null,                -- FK: weddings(id) once that table lands
  couple_id                  uuid not null,                -- FK: couples(id) — denormalised for RLS perf
  discipline                 workspace_discipline not null,

  -- Discriminated-union content blob. Shape varies by discipline; Zod/
  -- Pydantic validation happens in the app layer. See
  -- types/vendor-workspace.ts for the canonical shape per discipline.
  content                    jsonb not null default '{}'::jsonb,

  invite_status              workspace_invite_status not null default 'not_invited',
  last_vendor_activity_at    timestamptz,

  created_at                 timestamptz not null default now(),
  updated_at                 timestamptz not null default now(),

  unique (vendor_id, wedding_id)
);

create index if not exists vendor_workspaces_couple_idx on vendor_workspaces (couple_id);
create index if not exists vendor_workspaces_vendor_idx on vendor_workspaces (vendor_id);
create index if not exists vendor_workspaces_wedding_idx on vendor_workspaces (wedding_id);
create index if not exists vendor_workspaces_status_idx on vendor_workspaces (invite_status);

-- Updated_at trigger
create or replace function set_vendor_workspace_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_vendor_workspace_updated_at
  before update on vendor_workspaces
  for each row execute function set_vendor_workspace_updated_at();

-- ── Permissions (1:1 with workspace) ───────────────────────────────────────

create table if not exists vendor_workspace_permissions (
  workspace_id               uuid primary key references vendor_workspaces(id) on delete cascade,
  guests                     guest_visibility not null default 'counts_only',
  other_vendors              vendor_list_visibility not null default 'schedule_only',
  budget                     budget_visibility not null default 'their_line_item',
  run_of_show                run_of_show_visibility not null default 'their_plus_adjacent',
  communications             communications_access not null default 'couple_and_planner',
  updated_at                 timestamptz not null default now()
);

create trigger trg_workspace_permissions_updated_at
  before update on vendor_workspace_permissions
  for each row execute function set_vendor_workspace_updated_at();

-- ── Invitations ────────────────────────────────────────────────────────────
-- One invitation per workspace (a new invitation supersedes the previous).
-- Vendor identity at claim time captured via claimed_by_user_id.

create table if not exists vendor_workspace_invitations (
  id                         uuid primary key default gen_random_uuid(),
  workspace_id               uuid not null references vendor_workspaces(id) on delete cascade,
  invited_email              text not null,
  personal_note              text not null default '',

  sent_at                    timestamptz,
  claimed_at                 timestamptz,
  revoked_at                 timestamptz,

  -- Supabase auth user who claimed the workspace. Null until claim.
  claimed_by_user_id         uuid,

  status                     workspace_invite_status not null default 'invited',

  created_at                 timestamptz not null default now()
);

create index if not exists vendor_workspace_invitations_workspace_idx
  on vendor_workspace_invitations (workspace_id);
create index if not exists vendor_workspace_invitations_claimed_by_idx
  on vendor_workspace_invitations (claimed_by_user_id);
create index if not exists vendor_workspace_invitations_email_idx
  on vendor_workspace_invitations (invited_email);

-- ── Activity log ───────────────────────────────────────────────────────────

create table if not exists vendor_workspace_activity_log (
  id                         uuid primary key default gen_random_uuid(),
  workspace_id               uuid not null references vendor_workspaces(id) on delete cascade,
  at                         timestamptz not null default now(),
  actor                      workspace_activity_actor not null,
  actor_user_id              uuid,                          -- optional; who triggered it
  kind                       workspace_activity_kind not null,
  summary                    text not null,
  detail                     text
);

create index if not exists vendor_workspace_activity_workspace_idx
  on vendor_workspace_activity_log (workspace_id, at desc);

-- ── Discipline templates (library of default content per discipline) ──────
-- Couples (or Ananya itself) can store reusable templates that auto-populate
-- new workspaces on creation. A template is keyed by discipline plus an
-- optional name — so "HMUA — Traditional Punjabi" and "HMUA — Editorial"
-- can both exist.

create table if not exists vendor_discipline_templates (
  id                         uuid primary key default gen_random_uuid(),
  discipline                 workspace_discipline not null,
  name                       text not null,
  description                text,
  is_system                  boolean not null default false, -- true for Ananya-shipped defaults
  owner_couple_id            uuid,                            -- null for system templates

  default_content            jsonb not null default '{}'::jsonb,
  default_permissions        jsonb not null default '{}'::jsonb,

  created_at                 timestamptz not null default now(),
  updated_at                 timestamptz not null default now()
);

create index if not exists vendor_discipline_templates_discipline_idx
  on vendor_discipline_templates (discipline);
create index if not exists vendor_discipline_templates_owner_idx
  on vendor_discipline_templates (owner_couple_id);

create trigger trg_vendor_discipline_templates_updated_at
  before update on vendor_discipline_templates
  for each row execute function set_vendor_workspace_updated_at();

-- ── RLS ────────────────────────────────────────────────────────────────────

alter table vendor_workspaces enable row level security;
alter table vendor_workspace_permissions enable row level security;
alter table vendor_workspace_invitations enable row level security;
alter table vendor_workspace_activity_log enable row level security;
alter table vendor_discipline_templates enable row level security;

-- Helper: the authed user is the vendor that has claimed a given workspace.
create or replace function auth_user_is_vendor_of(ws_id uuid)
returns boolean language sql stable as $$
  select exists (
    select 1
    from vendor_workspace_invitations
    where workspace_id = ws_id
      and claimed_by_user_id = auth.uid()
      and status = 'active'
  );
$$;

-- Couples own everything about their workspaces.
drop policy if exists "couples manage their workspaces" on vendor_workspaces;
create policy "couples manage their workspaces"
  on vendor_workspaces for all
  using (couple_id = auth.uid())
  with check (couple_id = auth.uid());

-- Vendors can read their claimed workspace.
drop policy if exists "vendors read claimed workspace" on vendor_workspaces;
create policy "vendors read claimed workspace"
  on vendor_workspaces for select
  using (auth_user_is_vendor_of(id));

-- Permissions — couples manage, vendors read their own.
drop policy if exists "couples manage workspace permissions" on vendor_workspace_permissions;
create policy "couples manage workspace permissions"
  on vendor_workspace_permissions for all
  using (
    exists (
      select 1 from vendor_workspaces w
      where w.id = vendor_workspace_permissions.workspace_id
        and w.couple_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from vendor_workspaces w
      where w.id = vendor_workspace_permissions.workspace_id
        and w.couple_id = auth.uid()
    )
  );

drop policy if exists "vendors read their permissions" on vendor_workspace_permissions;
create policy "vendors read their permissions"
  on vendor_workspace_permissions for select
  using (auth_user_is_vendor_of(workspace_id));

-- Invitations — couples manage, vendors read only the invitation they
-- claimed (or the one addressed to their email, pre-claim).
drop policy if exists "couples manage invitations" on vendor_workspace_invitations;
create policy "couples manage invitations"
  on vendor_workspace_invitations for all
  using (
    exists (
      select 1 from vendor_workspaces w
      where w.id = vendor_workspace_invitations.workspace_id
        and w.couple_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from vendor_workspaces w
      where w.id = vendor_workspace_invitations.workspace_id
        and w.couple_id = auth.uid()
    )
  );

drop policy if exists "vendor reads their own invitation" on vendor_workspace_invitations;
create policy "vendor reads their own invitation"
  on vendor_workspace_invitations for select
  using (
    claimed_by_user_id = auth.uid()
    or invited_email = (select email from auth.users where id = auth.uid())
  );

-- Activity log — couples and the claiming vendor can read; only edge
-- functions (service role) write. The app layer calls a SECURITY DEFINER
-- function to append.
drop policy if exists "couples read activity" on vendor_workspace_activity_log;
create policy "couples read activity"
  on vendor_workspace_activity_log for select
  using (
    exists (
      select 1 from vendor_workspaces w
      where w.id = vendor_workspace_activity_log.workspace_id
        and w.couple_id = auth.uid()
    )
  );

drop policy if exists "vendors read their activity" on vendor_workspace_activity_log;
create policy "vendors read their activity"
  on vendor_workspace_activity_log for select
  using (auth_user_is_vendor_of(workspace_id));

-- Discipline templates — system templates readable by all; private templates
-- readable only by owner couple.
drop policy if exists "system templates readable by authed" on vendor_discipline_templates;
create policy "system templates readable by authed"
  on vendor_discipline_templates for select
  using (is_system = true or owner_couple_id = auth.uid());

drop policy if exists "couples manage own templates" on vendor_discipline_templates;
create policy "couples manage own templates"
  on vendor_discipline_templates for all
  using (owner_couple_id = auth.uid() and is_system = false)
  with check (owner_couple_id = auth.uid() and is_system = false);

-- ── Convenience views ──────────────────────────────────────────────────────

-- A one-row-per-workspace projection that joins the latest invitation +
-- permissions row. Useful for the Workspace tab's top-of-page status card.
create view vendor_workspaces_summary as
select
  w.id,
  w.vendor_id,
  w.wedding_id,
  w.couple_id,
  w.discipline,
  w.invite_status,
  w.last_vendor_activity_at,
  w.created_at,
  w.updated_at,
  i.id                  as invitation_id,
  i.invited_email,
  i.personal_note,
  i.sent_at             as invitation_sent_at,
  i.claimed_at          as invitation_claimed_at,
  i.revoked_at          as invitation_revoked_at,
  p.guests,
  p.other_vendors,
  p.budget,
  p.run_of_show,
  p.communications
from vendor_workspaces w
left join lateral (
  select *
  from vendor_workspace_invitations inv
  where inv.workspace_id = w.id
  order by coalesce(inv.sent_at, inv.created_at) desc
  limit 1
) i on true
left join vendor_workspace_permissions p on p.workspace_id = w.id;

comment on view vendor_workspaces_summary is
  'Denormalised workspace row for the couple-side detail page; one row per workspace with latest invitation + permissions pre-joined.';

-- ── Seed: Ananya system discipline templates (intentionally minimal) ──────
-- The app currently seeds richer per-couple defaults via
-- lib/vendors/workspace-seed.ts. These system rows are the safety net that
-- any couple gets for free when they stage a workspace of a new discipline.

insert into vendor_discipline_templates (discipline, name, description, is_system, default_content, default_permissions)
values
  ('catering', 'Standard catering',
   'Menu, dietary splits, service timing, staffing, tastings.',
   true,
   '{"kind":"catering","courses":[],"guest_counts":{"total":0,"veg":0,"non_veg":0,"jain":0,"vegan":0,"kids":0},"service_timing":[],"staffing":[],"kitchen_logistics":[],"tastings":[],"deliverables":[]}'::jsonb,
   '{"guests":"names_and_dietary","other_vendors":"schedule_only","budget":"their_line_item","run_of_show":"full_schedule","communications":"couple_and_planner"}'::jsonb),
  ('hmua', 'Standard HMUA',
   'Per-person per-event timeline, look references, products, trials.',
   true,
   '{"kind":"hmua","timeline":[],"looks":[],"product_preferences":[],"trials":[]}'::jsonb,
   '{"guests":"none","other_vendors":"none","budget":"their_line_item","run_of_show":"their_plus_adjacent","communications":"direct_with_couple"}'::jsonb),
  ('mehndi', 'Standard mehndi',
   'Bridal intricacy, motifs, guest session, timeline.',
   true,
   '{"kind":"mehndi","design_references":[],"bridal":{"intricacy":"intermediate","application_hours":4,"motifs":[],"coverage":""},"guest_session":{"guest_count":0,"duration_hours":0,"location":"","event":""},"timeline":[]}'::jsonb,
   '{"guests":"counts_only","other_vendors":"schedule_only","budget":"their_line_item","run_of_show":"their_plus_adjacent","communications":"couple_and_planner"}'::jsonb),
  ('photography', 'Standard photography',
   'Shot list, must-capture, family portraits, coverage, deliverables.',
   true,
   '{"kind":"photography","shot_list":[],"must_capture":[],"family_portraits":[],"coverage_hours":[],"deliverable_timeline":[]}'::jsonb,
   '{"guests":"names_and_dietary","other_vendors":"all_vendors","budget":"none","run_of_show":"full_schedule","communications":"couple_and_planner"}'::jsonb),
  ('florals', 'Standard florals',
   'Design direction, palette, coverage per area, arrangements.',
   true,
   '{"kind":"florals","design_direction":"","mood_board":[],"coverage":[],"color_palette":[],"arrangements":[],"delivery_setup":[]}'::jsonb,
   '{"guests":"counts_only","other_vendors":"all_vendors","budget":"their_line_item","run_of_show":"their_plus_adjacent","communications":"couple_and_planner"}'::jsonb);
