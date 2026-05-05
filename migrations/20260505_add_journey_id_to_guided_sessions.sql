-- Migration · Add journey_id to guided journeys
-- ────────────────────────────────────────────────────────────────────────
-- Lets a single category host multiple guided journeys (e.g. Mehendi
-- ships both a Vision journey and a Logistics journey). Existing rows
-- stay as journey_id = 'default' so the Vision journey continues to seed
-- and resume against its current data with zero migration of UI state.
--
-- Note: the active client implementation persists guided journey state in
-- localStorage (see lib/guided-journey/storage.ts). This SQL migration is
-- for the eventual server-side persistence layer.

-- 1. Add the column to the per-session table.

alter table public.guided_journey_sessions
  add column if not exists journey_id text not null default 'default';

update public.guided_journey_sessions
  set journey_id = 'default'
  where journey_id is null;

-- 2. Replace the (workspace, session) uniqueness with a (workspace, journey,
--    session) one — same session_key can now exist in multiple journeys.

alter table public.guided_journey_sessions
  drop constraint if exists guided_journey_sessions_workspace_session_key;

alter table public.guided_journey_sessions
  add constraint guided_journey_sessions_workspace_journey_session_key
  unique (workspace_id, journey_id, session_key);

-- 3. Index for journey lookups.

create index if not exists idx_guided_journey_sessions_journey
  on public.guided_journey_sessions (workspace_id, journey_id, session_index);

-- 4. Mirror the column on the static session_definitions table so each
--    journey can declare its own session list.

alter table public.session_definitions
  add column if not exists journey_id text not null default 'default';

-- 5. Update the seed function to take a journey_id (defaulting to
--    'default' so existing call sites keep working).

create or replace function public.seed_guided_journey(
  p_workspace_id uuid,
  p_category text,
  p_journey_id text default 'default'
)
returns void
language plpgsql
as $$
declare
  session_record record;
begin
  for session_record in
    select * from public.session_definitions
    where category = p_category and journey_id = p_journey_id
    order by session_index
  loop
    insert into public.guided_journey_sessions (
      workspace_id, journey_id, session_key, session_index, status, form_data
    )
    values (
      p_workspace_id,
      p_journey_id,
      session_record.session_key,
      session_record.session_index,
      'not_started',
      '{}'::jsonb
    )
    on conflict (workspace_id, journey_id, session_key) do nothing;
  end loop;
end;
$$;
