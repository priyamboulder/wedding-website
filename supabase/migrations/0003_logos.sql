-- ──────────────────────────────────────────────────────────────────────────
-- Wedding Logo templates + brand overrides rename
--
-- The Studio's new Logo surface is a wordmark-style sibling of Monogram.
-- A couple can apply BOTH marks — they are independent selections and both
-- live on wedding_brand via nullable FKs into their respective template
-- catalogues.
--
-- This migration also renames `monogram_overrides` to `brand_overrides` and
-- adds the two fields Logo needs (`names_override`, `connector_override`).
-- The TypeScript mirrors live in types/logo.ts and stores/brand-overrides-store.ts.
-- ──────────────────────────────────────────────────────────────────────────

create extension if not exists "pgcrypto";

-- ── Logo template catalogue ────────────────────────────────────────────────
create table if not exists logo_templates (
  id                   uuid primary key default gen_random_uuid(),
  slug                 text not null unique,
  name                 text not null,
  category             text not null,   -- script | display | condensed | tracked | editorial | deco
  component_key        text not null,   -- lisbeth | elaine | gizelle | murphey | chloe | rowan | rosa | janie | royal
  default_connector    text not null default 'and',
  preview_svg_static   text not null default '',
  created_at           timestamptz default now()
);

create index if not exists logo_templates_category_idx on logo_templates (category);

-- ── wedding_brand extension ────────────────────────────────────────────────
-- Add `logo_template_id` alongside the existing `monogram_template_id`.
-- Guarded so this migration is idempotent whether or not wedding_brand has
-- been materialised in this environment.
do $$
begin
  if exists (select 1 from information_schema.tables where table_name = 'wedding_brand') then
    alter table wedding_brand
      add column if not exists logo_template_id uuid
        references logo_templates(id) on delete set null;
  end if;
end $$;

-- ── Rename monogram_overrides → brand_overrides ───────────────────────────
-- Logo overrides share `names_override` with Monogram (editing once updates
-- both surfaces — the desired behaviour). `connector_override` is new.
do $$
begin
  if exists (select 1 from information_schema.tables where table_name = 'monogram_overrides')
     and not exists (select 1 from information_schema.tables where table_name = 'brand_overrides') then
    alter table monogram_overrides rename to brand_overrides;
  end if;

  if exists (select 1 from information_schema.tables where table_name = 'brand_overrides') then
    alter table brand_overrides
      add column if not exists names_override jsonb;         -- [string, string] | null
    alter table brand_overrides
      add column if not exists connector_override text;      -- 'and' | '&' | '|' | '*' | '•' | null
  else
    create table brand_overrides (
      wedding_id            uuid primary key,
      initials_override     jsonb,
      names_override        jsonb,
      date_override         timestamptz,
      location_override     text,
      color_override        text,
      connector_override    text,
      use_long_initials     boolean default false,
      created_at            timestamptz default now(),
      updated_at            timestamptz default now()
    );
  end if;
end $$;

-- ── RLS ────────────────────────────────────────────────────────────────────
alter table logo_templates enable row level security;

drop policy if exists "logo_templates readable by authed" on logo_templates;
create policy "logo_templates readable by authed"
  on logo_templates for select
  using (auth.role() = 'authenticated');

do $$
begin
  if exists (select 1 from information_schema.tables where table_name = 'brand_overrides') then
    execute 'alter table brand_overrides enable row level security';
    -- Drop any legacy policy from the monogram_overrides era, then install the
    -- brand_overrides policy under its new name.
    execute 'drop policy if exists "monogram_overrides own rows" on brand_overrides';
    execute 'drop policy if exists "brand_overrides own rows" on brand_overrides';
    execute 'create policy "brand_overrides own rows" on brand_overrides for all using (wedding_id = auth.uid()) with check (wedding_id = auth.uid())';
  end if;
end $$;
