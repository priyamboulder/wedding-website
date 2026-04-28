-- ──────────────────────────────────────────────────────────────────────────
-- Monogram templates + wedding_brand refactor
--
-- The Studio's Monogram surface moves from a piecemeal configurator
-- (initials/style/accent_color/ornament) to a curated gallery pick. Couples
-- choose from `monogram_templates`; the selected template's React component
-- renders with their own initials + date + location injected at render time.
--
-- The in-repo UI runs on Zustand + localStorage; this migration is the
-- production shape. The TypeScript mirrors live in types/monogram.ts.
-- ──────────────────────────────────────────────────────────────────────────

create extension if not exists "pgcrypto";

-- ── Monogram template catalogue ────────────────────────────────────────────
-- `component_key` is the React component id the web app resolves to (rose,
-- malin, acadia, gianna, cybil, chloe). `preview_svg_static` is a fallback
-- thumbnail with generic letters — used in PDFs, server renders, and any
-- context where the live React component can't run.

create table if not exists monogram_templates (
  id                  uuid primary key default gen_random_uuid(),
  slug                text not null unique,
  name                text not null,
  category            text not null,   -- classic | arched | ampersand | editorial | framed | circular
  component_key       text not null,   -- rose | malin | acadia | gianna | cybil | chloe
  preview_svg_static  text not null default '',
  created_at          timestamptz default now()
);

create index if not exists monogram_templates_category_idx on monogram_templates (category);

-- ── wedding_brand refactor ────────────────────────────────────────────────
-- Previous shape stored { style, accent_color, ornament } inline. We replace
-- those with a nullable FK to the chosen template. Palette, typography, and
-- motifs continue to live on wedding_brand (Style surface).
--
-- The wedding_brand table may not exist yet in this local environment (the
-- in-repo UI persists to localStorage). The guards below keep this migration
-- idempotent whether or not the table has been created.

do $$
begin
  if exists (select 1 from information_schema.tables where table_name = 'wedding_brand') then
    alter table wedding_brand drop column if exists style;
    alter table wedding_brand drop column if exists accent_color;
    alter table wedding_brand drop column if exists ornament;

    alter table wedding_brand
      add column if not exists monogram_template_id uuid
        references monogram_templates(id) on delete set null;

    alter table wedding_brand
      add column if not exists brand_auto_applied boolean default true;

    -- Existing rows lose their piecemeal config — couple re-selects on next visit.
    update wedding_brand set monogram_template_id = null where monogram_template_id is not null;
  else
    create table wedding_brand (
      wedding_id            uuid primary key,
      monogram_template_id  uuid references monogram_templates(id) on delete set null,
      brand_auto_applied    boolean default true,
      palette               jsonb default '{}'::jsonb,
      typography            jsonb default '{}'::jsonb,
      motifs                jsonb default '[]'::jsonb,
      created_at            timestamptz default now(),
      updated_at            timestamptz default now()
    );
  end if;
end $$;

-- ── RLS ────────────────────────────────────────────────────────────────────
-- Monogram templates are global read-only catalogue; writable via
-- service-role only (seed script).

alter table monogram_templates enable row level security;

drop policy if exists "monogram_templates readable by authed" on monogram_templates;
create policy "monogram_templates readable by authed"
  on monogram_templates for select
  using (auth.role() = 'authenticated');

alter table wedding_brand enable row level security;

drop policy if exists "wedding_brand own rows" on wedding_brand;
create policy "wedding_brand own rows"
  on wedding_brand for all
  using (wedding_id = auth.uid())
  with check (wedding_id = auth.uid());
