-- Planner portal: planner profiles, client relationships, planner-wedding assignments

CREATE TABLE IF NOT EXISTS planner_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text NOT NULL,
  slug text NOT NULL UNIQUE,
  bio text,
  city text,
  years_experience int,
  specialties text[] NOT NULL DEFAULT ARRAY[]::text[],
  traditions text[] NOT NULL DEFAULT ARRAY[]::text[],
  avatar_url text,
  website_url text,
  instagram_handle text,
  base_price numeric,
  pricing_model text DEFAULT 'flat',
  status text NOT NULL DEFAULT 'active',
  verified boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

CREATE TABLE IF NOT EXISTS planner_weddings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  planner_id uuid NOT NULL REFERENCES planner_profiles(id) ON DELETE CASCADE,
  wedding_id uuid REFERENCES weddings(id) ON DELETE SET NULL,
  couple_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  couple_name text NOT NULL,
  wedding_date date,
  venue text,
  city text,
  guest_count int,
  status text NOT NULL DEFAULT 'active',
  package_type text,
  contract_signed boolean NOT NULL DEFAULT false,
  contract_signed_at timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS planner_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  planner_id uuid NOT NULL REFERENCES planner_profiles(id) ON DELETE CASCADE,
  planner_wedding_id uuid REFERENCES planner_weddings(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  due_date date,
  priority text NOT NULL DEFAULT 'normal',
  status text NOT NULL DEFAULT 'pending',
  assigned_to uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE planner_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE planner_weddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE planner_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "planners manage own profile"
  ON planner_profiles FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "public read planner profiles"
  ON planner_profiles FOR SELECT
  USING (status = 'active');

CREATE POLICY "planners manage own weddings"
  ON planner_weddings FOR ALL
  USING (planner_id IN (SELECT id FROM planner_profiles WHERE user_id = auth.uid()))
  WITH CHECK (planner_id IN (SELECT id FROM planner_profiles WHERE user_id = auth.uid()));

CREATE POLICY "planners manage own tasks"
  ON planner_tasks FOR ALL
  USING (planner_id IN (SELECT id FROM planner_profiles WHERE user_id = auth.uid()))
  WITH CHECK (planner_id IN (SELECT id FROM planner_profiles WHERE user_id = auth.uid()));

CREATE INDEX IF NOT EXISTS idx_planner_weddings_planner ON planner_weddings(planner_id);
CREATE INDEX IF NOT EXISTS idx_planner_tasks_planner ON planner_tasks(planner_id);
CREATE INDEX IF NOT EXISTS idx_planner_tasks_wedding ON planner_tasks(planner_wedding_id);
