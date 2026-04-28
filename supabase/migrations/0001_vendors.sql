-- ──────────────────────────────────────────────────────────────────────────
-- Vendor directory + couple shortlist + task-level links
--
-- Note: the in-repo UI currently runs entirely on Zustand + localStorage
-- (see stores/vendors-store.ts). This migration is the production target —
-- apply it when Supabase is wired up, then point the store at it. The shape
-- here mirrors the TypeScript types in types/vendor.ts exactly so swap-over
-- is structural only.
-- ──────────────────────────────────────────────────────────────────────────

create extension if not exists "pgcrypto";

-- ── Directory ──────────────────────────────────────────────────────────────

create table if not exists vendors (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  category      text not null,       -- enum enforced at app layer (VendorCategory)
  location      text,
  price_range   text,                -- free-form, e.g. "₹6L – ₹14L"
  style_tags    text[] default '{}',
  rating        numeric(2,1),
  review_count  int default 0,
  images        jsonb default '[]'::jsonb,
  bio           text,
  contact       jsonb default '{}'::jsonb,
  turnaround    text,
  enriched_at   timestamptz,         -- null = pending Haiku enrichment
  created_at    timestamptz default now()
);

create index if not exists vendors_category_idx on vendors (category);
create index if not exists vendors_location_idx on vendors (location);
create index if not exists vendors_enriched_at_idx on vendors (enriched_at);

-- ── Couple shortlist (the "heart" action) ──────────────────────────────────

create table if not exists couple_shortlist (
  couple_id  uuid references auth.users(id) on delete cascade,
  vendor_id  uuid references vendors(id) on delete cascade,
  saved_at   timestamptz default now(),
  notes      text default '',
  primary key (couple_id, vendor_id)
);

create index if not exists couple_shortlist_couple_idx on couple_shortlist (couple_id);

-- ── Task-level links (bridge into the checklist panel) ─────────────────────

create type vendor_link_status as enum ('linked', 'contracted', 'booked');

create table if not exists task_vendor_links (
  task_id    uuid not null,
  vendor_id  uuid references vendors(id) on delete cascade,
  linked_at  timestamptz default now(),
  status     vendor_link_status default 'linked',
  primary key (task_id, vendor_id)
);

create index if not exists task_vendor_links_task_idx   on task_vendor_links (task_id);
create index if not exists task_vendor_links_vendor_idx on task_vendor_links (vendor_id);

-- ── RLS ────────────────────────────────────────────────────────────────────
-- Vendors directory: readable by any authenticated couple; writable via
-- service-role only (admin inserts / Excel import pipeline).

alter table vendors enable row level security;
alter table couple_shortlist enable row level security;
alter table task_vendor_links enable row level security;

drop policy if exists "vendors readable by authed" on vendors;
create policy "vendors readable by authed"
  on vendors for select
  using (auth.role() = 'authenticated');

drop policy if exists "shortlist own rows" on couple_shortlist;
create policy "shortlist own rows"
  on couple_shortlist for all
  using (couple_id = auth.uid())
  with check (couple_id = auth.uid());

-- Task-vendor links: authenticated users only (couple_id enforced at app layer)
drop policy if exists "task links authed" on task_vendor_links;
create policy "task links authed"
  on task_vendor_links for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
