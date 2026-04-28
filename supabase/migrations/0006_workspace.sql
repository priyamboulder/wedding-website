-- ──────────────────────────────────────────────────────────────────────────
-- Couple-side Workspace (category-scoped planning canvas)
-- ──────────────────────────────────────────────────────────────────────────

create extension if not exists "pgcrypto";

create table if not exists workspace_categories (
  id                  uuid primary key default gen_random_uuid(),
  wedding_id          uuid not null,
  slug                text not null,
  name                text not null,
  status              text not null default 'open'
                      check (status in ('assigned','shortlisted','open')),
  assigned_vendor_id  uuid,
  sort_order          int  not null default 0,
  created_at          timestamptz default now(),
  unique (wedding_id, slug)
);

create index if not exists workspace_categories_wedding_idx on workspace_categories (wedding_id);
create index if not exists workspace_categories_vendor_idx  on workspace_categories (assigned_vendor_id);

create table if not exists workspace_items (
  id           uuid primary key default gen_random_uuid(),
  category_id  uuid not null references workspace_categories(id) on delete cascade,
  tab          text not null check (tab in ('vision','plan','shortlist','timeline','decisions')),
  block_type   text not null,
  title        text not null,
  meta         jsonb not null default '{}'::jsonb,
  sort_order   int  not null default 0,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

create index if not exists workspace_items_category_tab_idx on workspace_items (category_id, tab);
create index if not exists workspace_items_block_type_idx   on workspace_items (block_type);

create table if not exists workspace_decisions (
  id           uuid primary key default gen_random_uuid(),
  category_id  uuid not null references workspace_categories(id) on delete cascade,
  question     text not null,
  status       text not null default 'open' check (status in ('open','resolved')),
  resolved_at  timestamptz,
  created_at   timestamptz default now()
);

create index if not exists workspace_decisions_category_idx on workspace_decisions (category_id, status);

create table if not exists workspace_notes (
  id           uuid primary key default gen_random_uuid(),
  category_id  uuid not null references workspace_categories(id) on delete cascade,
  body         text not null,
  author_id    text not null,
  created_at   timestamptz default now()
);

create index if not exists workspace_notes_category_idx on workspace_notes (category_id, created_at desc);

create table if not exists workspace_moodboard_items (
  id           uuid primary key default gen_random_uuid(),
  category_id  uuid not null references workspace_categories(id) on delete cascade,
  image_url    text not null,
  caption      text not null default '',
  sort_order   int  not null default 0,
  created_at   timestamptz default now()
);

create index if not exists workspace_moodboard_items_category_idx on workspace_moodboard_items (category_id, sort_order);

-- ── Row-level security ─────────────────────────────────────────────────────
alter table workspace_categories        enable row level security;
alter table workspace_items             enable row level security;
alter table workspace_decisions         enable row level security;
alter table workspace_notes             enable row level security;
alter table workspace_moodboard_items   enable row level security;

-- Simple auth-based policies (tighten to wedding membership when weddings table exists)
drop policy if exists workspace_categories_authed on workspace_categories;
create policy workspace_categories_authed on workspace_categories for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists workspace_items_authed on workspace_items;
create policy workspace_items_authed on workspace_items for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists workspace_decisions_authed on workspace_decisions;
create policy workspace_decisions_authed on workspace_decisions for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists workspace_notes_authed on workspace_notes;
create policy workspace_notes_authed on workspace_notes for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists workspace_moodboard_authed on workspace_moodboard_items;
create policy workspace_moodboard_authed on workspace_moodboard_items for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- ── Seed function ─────────────────────────────────────────────────────────
create or replace function seed_workspace_categories(target_wedding uuid)
returns void language sql as $$
  insert into workspace_categories (wedding_id, slug, name, sort_order) values
    (target_wedding, 'photography',      'Photography',              0),
    (target_wedding, 'videography',      'Videography',              1),
    (target_wedding, 'catering',         'Catering',                 2),
    (target_wedding, 'decor_florals',    'Décor & Florals',          3),
    (target_wedding, 'entertainment',    'Music & Entertainment',    4),
    (target_wedding, 'hmua',             'Hair & Makeup',            5),
    (target_wedding, 'venue',            'Venue',                    6),
    (target_wedding, 'mehndi',           'Mehendi Artist',           7),
    (target_wedding, 'transportation',   'Transportation',           8),
    (target_wedding, 'stationery',       'Stationery & Invitations', 9),
    (target_wedding, 'pandit_ceremony',  'Priest / Pandit',         10),
    (target_wedding, 'wardrobe',         'Wardrobe & Styling',      11)
  on conflict (wedding_id, slug) do nothing;
$$;
