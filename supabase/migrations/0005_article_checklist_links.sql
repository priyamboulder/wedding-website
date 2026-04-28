-- ──────────────────────────────────────────────────────────────────────────
-- Article ↔ Checklist item linking
--
-- Connects editorial Journal posts to specific checklist items by relationship
-- type (primer, decision framework, vendor questions, cultural context,
-- timeline, case study). Powers:
--   • "Further reading" panel on the checklist item detail view
--   • "Supports these planning tasks" panel on the article reader
--
-- Design note: checklist_item_id is a stable seed slug (e.g. "p3-bwar-07"),
-- not a per-couple task uuid. Each couple has their own instance of the
-- task, but the article link is at the template level — one link row applies
-- to every couple who has that item in their checklist.
--
-- Note: the in-repo UI currently reads links from an in-memory seed
-- (lib/journal/reception-outfit-pilot.ts) keyed by the same slug. This
-- migration is the production target — apply it when Supabase is wired up,
-- then swap the client reads over.
-- ──────────────────────────────────────────────────────────────────────────

create extension if not exists "pgcrypto";

-- ── Relationship vocabulary ────────────────────────────────────────────────
-- Kept narrow on purpose. Add new values via `alter type ... add value`
-- rather than inventing ad-hoc strings so the "Further reading" grouping
-- stays coherent across the Journal.

create type article_relationship_type as enum (
  'primer',              -- why this decision matters / cultural shift
  'decision_framework',  -- how to choose between options / tradeoff maps
  'vendor_questions',    -- what to ask an atelier, designer, or service
  'cultural_context',    -- tradition, regional practice, family dynamics
  'timeline',            -- when to do what / lead-time logistics
  'case_study'           -- real wedding coverage that bears on the task
);

-- ── Join table ─────────────────────────────────────────────────────────────

create table if not exists article_checklist_links (
  id                 uuid primary key default gen_random_uuid(),
  article_id         uuid not null,  -- FK to articles table (added when articles table lands)
  checklist_item_id  text not null,
    -- stable seed slug (e.g. "p3-bwar-07"). Not an FK because the canonical
    -- seed lives in code (lib/checklist-seed.ts), and per-couple instances
    -- are in checklist_tasks with a different PK shape.
  relationship_type  article_relationship_type not null,
  display_order      smallint not null default 0,
    -- ordering within a (checklist_item_id, relationship_type) bucket.
    -- The UI groups by relationship_type, then orders within group.
  relevance_score    numeric(3,2),
    -- 0.00 – 1.00. Editorial hand-score for the pilot; automated for scale
    -- (title/tag overlap, Haiku classification, click-through priors).
  editorial_note     text,
    -- why this article was linked — useful for future editorial audits and
    -- for the UI tooltip "Editor's note on this pairing".
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),

  unique (article_id, checklist_item_id, relationship_type)
    -- One article can play multiple roles for one item only if the role
    -- itself differs. Prevents accidental double-linking.
);

-- ── Indexes ────────────────────────────────────────────────────────────────
-- The hot read path is "given a checklist item, give me its posts grouped
-- and ordered." That's a composite index. The reverse lookup (given an
-- article, which items does it support) is rarer and uses the unique key.

create index if not exists article_checklist_links_item_ordered_idx
  on article_checklist_links (checklist_item_id, relationship_type, display_order);

create index if not exists article_checklist_links_article_idx
  on article_checklist_links (article_id);

-- ── updated_at trigger ─────────────────────────────────────────────────────

create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

create trigger article_checklist_links_updated_at
  before update on article_checklist_links
  for each row execute function set_updated_at();

-- ── RLS ────────────────────────────────────────────────────────────────────
-- Links are editorial metadata — readable by any authenticated couple,
-- writable only via service role (CMS / editor tooling).

alter table article_checklist_links enable row level security;

drop policy if exists "article_checklist_links readable by authed" on article_checklist_links;
create policy "article_checklist_links readable by authed"
  on article_checklist_links for select
  using (auth.role() = 'authenticated');
