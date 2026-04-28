-- ──────────────────────────────────────────────────────────────────────────
-- Design engine — unified Canva-like builder for every Studio surface
--
-- Backs Monogram, Wedding Logo, Invitations, Print & Signage, Save-the-Dates,
-- Social posts, RSVP cards, Outfit Guides, etc. All surfaces share one
-- Fabric.js-compatible canvas schema (canvas_data jsonb) and one template
-- marketplace (design_templates).
--
-- Note on wedding_id: there is no `weddings` table in this repo yet (the
-- in-app persistence lives in Zustand + localStorage). The column is kept
-- as a plain uuid for now, matching workspace_files.wedding_id — the FK can
-- be added when the weddings table lands.
-- ──────────────────────────────────────────────────────────────────────────

create extension if not exists "pgcrypto";

-- ── design_templates ──────────────────────────────────────────────────────
-- The template marketplace. Every pre-made design (curated + community)
-- lives here. Surface-scoped; canvas_data is a full Fabric.js snapshot.
create table if not exists design_templates (
  id                uuid primary key default gen_random_uuid(),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  name              text not null,
  description       text,
  surface_type      text not null,              -- monogram | wedding_logo | invitation | save_the_date
                                                -- menu | welcome_sign | seating_chart | ceremony_program
                                                -- thank_you | table_number | ig_story | ig_post
                                                -- whatsapp_invite | video_invite | rsvp_card | outfit_guide
  cultural_style    text,                       -- hindu_north | hindu_south | sikh | muslim | christian | fusion
  regional_style    text,                       -- gujarati | punjabi | bengali | tamil | rajasthani | malayali | marathi | kashmiri
  canvas_width      integer not null,           -- pixels at 300 DPI
  canvas_height     integer not null,
  canvas_data       jsonb not null,             -- full Fabric.js canvas JSON
  thumbnail_url     text,                       -- Supabase Storage URL
  colors            jsonb,                      -- ["#8B1A2B", "#D4AF37", ...]
  fonts             jsonb,                      -- ["Playfair Display", ...]
  tags              text[] default '{}',        -- ['luxury','traditional','gold_foil','trending']
  price_cents       integer not null default 0, -- 0 = free
  is_trending       boolean not null default false,
  is_featured       boolean not null default false,
  is_published      boolean not null default true,
  download_count    integer not null default 0,
  category_tags     text[] default '{}'         -- ['wedding_invite','sangeet','mehndi','reception','haldi']
);

create index if not exists design_templates_surface_published_idx on design_templates (surface_type, is_published);
create index if not exists design_templates_cultural_style_idx    on design_templates (cultural_style);
create index if not exists design_templates_trending_idx          on design_templates (is_trending) where is_trending;

-- ── user_designs ──────────────────────────────────────────────────────────
-- A bride's in-progress (or finalised) design. Forks from a template or
-- starts blank / AI-generated (template_id null).
create table if not exists user_designs (
  id                uuid primary key default gen_random_uuid(),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  user_id           uuid not null references auth.users(id) on delete cascade,
  wedding_id        uuid,                                                     -- couple scope; FK when weddings table exists
  template_id       uuid references design_templates(id) on delete set null, -- null if from scratch / AI
  surface_type      text not null,
  name              text not null,
  canvas_data       jsonb not null,
  canvas_width      integer not null,
  canvas_height     integer not null,
  status            text not null default 'draft',  -- draft | in_review | finalized | ordered
  version           integer not null default 1,
  is_shared         boolean not null default false, -- shared with partner/planner
  thumbnail_url     text,
  exported_pdf_url  text,                           -- CMYK-ready PDF
  metadata          jsonb default '{}'::jsonb
);

create index if not exists user_designs_user_surface_idx on user_designs (user_id, surface_type);
create index if not exists user_designs_wedding_idx      on user_designs (wedding_id);
create index if not exists user_designs_template_idx     on user_designs (template_id);

-- ── design_assets ─────────────────────────────────────────────────────────
-- User-uploaded images / SVGs / logos that can be placed on any canvas.
create table if not exists design_assets (
  id                uuid primary key default gen_random_uuid(),
  created_at        timestamptz not null default now(),
  user_id           uuid not null references auth.users(id) on delete cascade,
  file_url          text not null,
  file_name         text,
  file_type         text,                         -- 'image/png' | 'image/svg+xml' | ...
  file_size_bytes   integer,
  width             integer,
  height            integer,
  tags              text[] default '{}'
);

create index if not exists design_assets_user_idx on design_assets (user_id);

-- ── motif_library ─────────────────────────────────────────────────────────
-- Global catalogue of cultural motifs (paisley, mandala, lotus, etc.).
-- Drag-drop onto any canvas; svg_data is raw SVG markup.
create table if not exists motif_library (
  id                    uuid primary key default gen_random_uuid(),
  name                  text not null,
  svg_data              text not null,
  cultural_style        text,
  regional_style        text,
  category              text,                         -- border | corner | divider | frame | icon | pattern
  tags                  text[] default '{}',
  is_premium            boolean not null default false,
  color_configurable    boolean not null default true
);

create index if not exists motif_library_cultural_style_idx on motif_library (cultural_style);
create index if not exists motif_library_category_idx       on motif_library (category);

-- ── print_orders ──────────────────────────────────────────────────────────
-- Physical print fulfillment for a finalised design.
create table if not exists print_orders (
  id                      uuid primary key default gen_random_uuid(),
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),
  user_id                 uuid not null references auth.users(id) on delete cascade,
  design_id               uuid not null references user_designs(id) on delete restrict,
  status                  text not null default 'pending',  -- pending | processing | printing | shipped | delivered
  quantity                integer not null,
  paper_stock             text not null,                     -- matte | pearl | cotton | kraft | foil | acrylic
  unit_price_cents        integer not null,
  shipping_price_cents    integer not null,
  total_price_cents       integer not null,
  shipping_address        jsonb not null,                    -- {name,line1,line2,city,state,zip,country}
  tracking_number         text,
  estimated_delivery      date,
  print_ready_pdf_url     text,
  is_digital_only         boolean not null default false
);

create index if not exists print_orders_user_status_idx on print_orders (user_id, status);
create index if not exists print_orders_design_idx      on print_orders (design_id);

-- ── rsvp_configs ──────────────────────────────────────────────────────────
-- Public RSVP form configuration tied to a specific invitation design.
-- `slug` drives the public URL: /rsvp/{slug}
create table if not exists rsvp_configs (
  id                          uuid primary key default gen_random_uuid(),
  created_at                  timestamptz not null default now(),
  user_id                     uuid not null references auth.users(id) on delete cascade,
  design_id                   uuid not null references user_designs(id) on delete cascade,
  slug                        text not null unique,
  is_active                   boolean not null default true,
  collect_meal_preference     boolean not null default true,
  collect_guest_count         boolean not null default true,
  collect_message             boolean not null default true,
  meal_options                jsonb not null default '["Vegetarian","Non-Vegetarian","Jain","Vegan"]'::jsonb,
  max_guests_per_rsvp         integer not null default 5,
  deadline                    date,
  custom_questions            jsonb default '[]'::jsonb        -- [{question,type,options}]
);

create index if not exists rsvp_configs_user_idx   on rsvp_configs (user_id);
create index if not exists rsvp_configs_design_idx on rsvp_configs (design_id);

-- ── rsvp_responses ────────────────────────────────────────────────────────
-- One row per guest RSVP. Public INSERT, owner-only SELECT/UPDATE/DELETE.
create table if not exists rsvp_responses (
  id                uuid primary key default gen_random_uuid(),
  created_at        timestamptz not null default now(),
  rsvp_config_id    uuid not null references rsvp_configs(id) on delete cascade,
  guest_name        text not null,
  email             text,
  phone             text,
  status            text not null,                 -- attending | not_attending | maybe
  guest_count       integer not null default 1,
  meal_preference   text,
  message           text,
  custom_answers    jsonb default '{}'::jsonb
);

create index if not exists rsvp_responses_config_idx on rsvp_responses (rsvp_config_id);

-- ── ai_design_sessions ────────────────────────────────────────────────────
-- Audit trail for AI-generated designs. Stores prompt, options returned, and
-- which one the user picked — feeds model fine-tuning and analytics.
create table if not exists ai_design_sessions (
  id                       uuid primary key default gen_random_uuid(),
  created_at               timestamptz not null default now(),
  user_id                  uuid not null references auth.users(id) on delete cascade,
  cultural_style           text,
  regional_style           text,
  vibes                    text[] default '{}',       -- ['luxury','minimalist','bohemian']
  text_prompt              text,
  surface_type             text,
  generated_designs        jsonb,                     -- [canvas_data, canvas_data, ...]
  selected_design_index    integer
);

create index if not exists ai_design_sessions_user_idx on ai_design_sessions (user_id);

-- ──────────────────────────────────────────────────────────────────────────
-- RLS
-- ──────────────────────────────────────────────────────────────────────────

-- design_templates: public read of published rows; writes via service role.
alter table design_templates enable row level security;

drop policy if exists "design_templates published readable" on design_templates;
create policy "design_templates published readable"
  on design_templates for select
  using (is_published = true);

-- user_designs: owner-only CRUD.
alter table user_designs enable row level security;

drop policy if exists "user_designs owner select" on user_designs;
create policy "user_designs owner select"
  on user_designs for select
  using (auth.uid() = user_id);

drop policy if exists "user_designs owner insert" on user_designs;
create policy "user_designs owner insert"
  on user_designs for insert
  with check (auth.uid() = user_id);

drop policy if exists "user_designs owner update" on user_designs;
create policy "user_designs owner update"
  on user_designs for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "user_designs owner delete" on user_designs;
create policy "user_designs owner delete"
  on user_designs for delete
  using (auth.uid() = user_id);

-- design_assets: owner-only CRUD.
alter table design_assets enable row level security;

drop policy if exists "design_assets owner select" on design_assets;
create policy "design_assets owner select"
  on design_assets for select
  using (auth.uid() = user_id);

drop policy if exists "design_assets owner insert" on design_assets;
create policy "design_assets owner insert"
  on design_assets for insert
  with check (auth.uid() = user_id);

drop policy if exists "design_assets owner update" on design_assets;
create policy "design_assets owner update"
  on design_assets for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "design_assets owner delete" on design_assets;
create policy "design_assets owner delete"
  on design_assets for delete
  using (auth.uid() = user_id);

-- motif_library: global read.
alter table motif_library enable row level security;

drop policy if exists "motif_library readable by all" on motif_library;
create policy "motif_library readable by all"
  on motif_library for select
  using (true);

-- print_orders: owner-only.
alter table print_orders enable row level security;

drop policy if exists "print_orders owner select" on print_orders;
create policy "print_orders owner select"
  on print_orders for select
  using (auth.uid() = user_id);

drop policy if exists "print_orders owner insert" on print_orders;
create policy "print_orders owner insert"
  on print_orders for insert
  with check (auth.uid() = user_id);

drop policy if exists "print_orders owner update" on print_orders;
create policy "print_orders owner update"
  on print_orders for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "print_orders owner delete" on print_orders;
create policy "print_orders owner delete"
  on print_orders for delete
  using (auth.uid() = user_id);

-- rsvp_configs: owner-only write; public read of active configs so the
-- public RSVP form can resolve a slug without authenticating.
alter table rsvp_configs enable row level security;

drop policy if exists "rsvp_configs active readable by all" on rsvp_configs;
create policy "rsvp_configs active readable by all"
  on rsvp_configs for select
  using (is_active = true or auth.uid() = user_id);

drop policy if exists "rsvp_configs owner insert" on rsvp_configs;
create policy "rsvp_configs owner insert"
  on rsvp_configs for insert
  with check (auth.uid() = user_id);

drop policy if exists "rsvp_configs owner update" on rsvp_configs;
create policy "rsvp_configs owner update"
  on rsvp_configs for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "rsvp_configs owner delete" on rsvp_configs;
create policy "rsvp_configs owner delete"
  on rsvp_configs for delete
  using (auth.uid() = user_id);

-- rsvp_responses: public INSERT (anyone with the slug can RSVP); owner of
-- the linked config is the only one who can SELECT/UPDATE/DELETE.
alter table rsvp_responses enable row level security;

drop policy if exists "rsvp_responses public insert" on rsvp_responses;
create policy "rsvp_responses public insert"
  on rsvp_responses for insert
  with check (
    exists (
      select 1 from rsvp_configs c
      where c.id = rsvp_responses.rsvp_config_id
        and c.is_active = true
    )
  );

drop policy if exists "rsvp_responses config owner select" on rsvp_responses;
create policy "rsvp_responses config owner select"
  on rsvp_responses for select
  using (
    exists (
      select 1 from rsvp_configs c
      where c.id = rsvp_responses.rsvp_config_id
        and c.user_id = auth.uid()
    )
  );

drop policy if exists "rsvp_responses config owner update" on rsvp_responses;
create policy "rsvp_responses config owner update"
  on rsvp_responses for update
  using (
    exists (
      select 1 from rsvp_configs c
      where c.id = rsvp_responses.rsvp_config_id
        and c.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from rsvp_configs c
      where c.id = rsvp_responses.rsvp_config_id
        and c.user_id = auth.uid()
    )
  );

drop policy if exists "rsvp_responses config owner delete" on rsvp_responses;
create policy "rsvp_responses config owner delete"
  on rsvp_responses for delete
  using (
    exists (
      select 1 from rsvp_configs c
      where c.id = rsvp_responses.rsvp_config_id
        and c.user_id = auth.uid()
    )
  );

-- ai_design_sessions: owner-only CRUD.
alter table ai_design_sessions enable row level security;

drop policy if exists "ai_design_sessions owner select" on ai_design_sessions;
create policy "ai_design_sessions owner select"
  on ai_design_sessions for select
  using (auth.uid() = user_id);

drop policy if exists "ai_design_sessions owner insert" on ai_design_sessions;
create policy "ai_design_sessions owner insert"
  on ai_design_sessions for insert
  with check (auth.uid() = user_id);

drop policy if exists "ai_design_sessions owner update" on ai_design_sessions;
create policy "ai_design_sessions owner update"
  on ai_design_sessions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "ai_design_sessions owner delete" on ai_design_sessions;
create policy "ai_design_sessions owner delete"
  on ai_design_sessions for delete
  using (auth.uid() = user_id);

-- ──────────────────────────────────────────────────────────────────────────
-- Storage buckets
--
-- design-thumbnails  — public (marketplace previews, user design thumbs)
-- design-assets      — authed users only (uploaded photos/logos)
-- print-pdfs         — authed users only (CMYK-ready PDFs)
-- motif-svgs         — public (global motif catalogue)
-- ──────────────────────────────────────────────────────────────────────────

insert into storage.buckets (id, name, public)
values
  ('design-thumbnails', 'design-thumbnails', true),
  ('design-assets',     'design-assets',     false),
  ('print-pdfs',        'print-pdfs',        false),
  ('motif-svgs',        'motif-svgs',        true)
on conflict (id) do nothing;

-- Public buckets: anyone can SELECT; writes restricted to authenticated.
drop policy if exists "design-thumbnails public read" on storage.objects;
create policy "design-thumbnails public read"
  on storage.objects for select
  using (bucket_id = 'design-thumbnails');

drop policy if exists "design-thumbnails authed write" on storage.objects;
create policy "design-thumbnails authed write"
  on storage.objects for insert
  with check (bucket_id = 'design-thumbnails' and auth.role() = 'authenticated');

drop policy if exists "design-thumbnails authed update" on storage.objects;
create policy "design-thumbnails authed update"
  on storage.objects for update
  using (bucket_id = 'design-thumbnails' and auth.role() = 'authenticated')
  with check (bucket_id = 'design-thumbnails' and auth.role() = 'authenticated');

drop policy if exists "design-thumbnails owner delete" on storage.objects;
create policy "design-thumbnails owner delete"
  on storage.objects for delete
  using (bucket_id = 'design-thumbnails' and auth.uid() = owner);

drop policy if exists "motif-svgs public read" on storage.objects;
create policy "motif-svgs public read"
  on storage.objects for select
  using (bucket_id = 'motif-svgs');

drop policy if exists "motif-svgs authed write" on storage.objects;
create policy "motif-svgs authed write"
  on storage.objects for insert
  with check (bucket_id = 'motif-svgs' and auth.role() = 'authenticated');

-- Private buckets: owner-only across all ops.
drop policy if exists "design-assets owner select" on storage.objects;
create policy "design-assets owner select"
  on storage.objects for select
  using (bucket_id = 'design-assets' and auth.uid() = owner);

drop policy if exists "design-assets owner insert" on storage.objects;
create policy "design-assets owner insert"
  on storage.objects for insert
  with check (bucket_id = 'design-assets' and auth.uid() = owner);

drop policy if exists "design-assets owner update" on storage.objects;
create policy "design-assets owner update"
  on storage.objects for update
  using (bucket_id = 'design-assets' and auth.uid() = owner)
  with check (bucket_id = 'design-assets' and auth.uid() = owner);

drop policy if exists "design-assets owner delete" on storage.objects;
create policy "design-assets owner delete"
  on storage.objects for delete
  using (bucket_id = 'design-assets' and auth.uid() = owner);

drop policy if exists "print-pdfs owner select" on storage.objects;
create policy "print-pdfs owner select"
  on storage.objects for select
  using (bucket_id = 'print-pdfs' and auth.uid() = owner);

drop policy if exists "print-pdfs owner insert" on storage.objects;
create policy "print-pdfs owner insert"
  on storage.objects for insert
  with check (bucket_id = 'print-pdfs' and auth.uid() = owner);

drop policy if exists "print-pdfs owner update" on storage.objects;
create policy "print-pdfs owner update"
  on storage.objects for update
  using (bucket_id = 'print-pdfs' and auth.uid() = owner)
  with check (bucket_id = 'print-pdfs' and auth.uid() = owner);

drop policy if exists "print-pdfs owner delete" on storage.objects;
create policy "print-pdfs owner delete"
  on storage.objects for delete
  using (bucket_id = 'print-pdfs' and auth.uid() = owner);
