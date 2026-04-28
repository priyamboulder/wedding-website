-- ──────────────────────────────────────────────────────────────────────────
-- Workspace files — shared document store per vendor workspace
--
-- Scoped by category + optional tab; linked to vendors/tasks/decisions.
-- Bucket `workspace-files`, path
--   wedding/{wedding_id}/category/{slug}/{file_id}/v{n}/{filename}
-- Client runtime (Phase 1) uses localStorage + object URLs; swap to this
-- schema when the Supabase layer lands.
-- ──────────────────────────────────────────────────────────────────────────

create extension if not exists "pgcrypto";

create table if not exists workspace_files (
  id                    uuid primary key default gen_random_uuid(),
  wedding_id            uuid not null,
  category              text not null,                 -- WorkspaceCategorySlug
  tab                   text,                          -- null = category-level
  filename              text not null,
  mime                  text not null,
  size_bytes            bigint not null,
  storage_key           text not null,                 -- supabase storage path
  thumbnail_url         text,
  uploaded_by           uuid not null,
  uploaded_at           timestamptz default now(),
  tags                  text[] default '{}',
  linked_vendor_ids     uuid[] default '{}',
  linked_task_ids       text[] default '{}',           -- checklist ids are strings like "p2-photo-04"
  linked_decision_ids   uuid[] default '{}',
  contract_meta         jsonb,                         -- FileContract shape
  file_group_id         uuid not null,
  version               int  not null default 1,
  replaces_id           uuid references workspace_files(id),
  deleted_at            timestamptz
);

create index if not exists workspace_files_idx_1 on workspace_files (wedding_id, category, tab);
create index if not exists workspace_files_idx_2 on workspace_files (file_group_id);
create index if not exists workspace_files_idx_3 on workspace_files (deleted_at) where deleted_at is null;

create table if not exists workspace_file_comments (
  id          uuid primary key default gen_random_uuid(),
  file_id     uuid not null references workspace_files(id) on delete cascade,
  author_id   uuid not null,
  body        text not null,
  created_at  timestamptz default now(),
  parent_id   uuid references workspace_file_comments(id)
);

create index if not exists workspace_file_comments_file_idx on workspace_file_comments (file_id);
