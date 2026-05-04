-- ──────────────────────────────────────────────────────────────────────────
-- Migration 0024: Seed the South Asia continent.
--
-- Date:  2026-04-30
-- Scope: First continent seed for the Marigold Destination Explorer.
--        India only (Udaipur, Goa, Jaipur, Kerala, Mumbai, Delhi/NCR).
--        Pattern established here will be reused for SE Asia, Europe, etc.
--
-- Adds:
--   • Schema: vendors.is_placeholder (boolean, default false) + index.
--   • Schema: idempotency unique keys on regions / experiences (location_id,
--     name) so this seed is safe to re-run.
--   • Function: get_ranked_vendors(...) extended with p_include_placeholders
--     (default false) so production traffic never sees placeholder vendors.
--   • Data: rich overview / best_for / best_months / tips on the four South
--     Asia destinations already created by 0022 (Udaipur, Goa, Jaipur,
--     Kerala) plus two new entries — Mumbai and Delhi/NCR — that replace the
--     combined `mumbai-delhi` row from 0022 (deactivated below). Tag arrays
--     used by the Match tool are seeded for the two new rows.
--   • Data: 4 regions × 6 destinations = 24 region rows.
--   • Data: 7-8 experiences × 6 destinations = ~46 experience rows.
--   • Data: 5 real, named venues × 6 destinations = 30 vendors with category
--     assignments to "Venue" + per-vendor pricing indicators. is_placeholder
--     remains FALSE for these — they're researched, real properties.
--   • Data: 3 placeholder vendors × 8 categories × 6 destinations = 144
--     placeholder rows. Each carries is_placeholder = TRUE; replace with
--     real vendor data via the import pipeline before going live.
--
-- Convention note on `budget_locations.continent`:
--   The DB stores raw geographic continent ("Asia"); the Tool surface maps
--   country to a display continent ("south-asia") in lib/destinations/
--   continents.ts. We keep continent='Asia' for India entries to match the
--   existing seed and the OnboardingFlow grouping that reads .continent
--   directly. Country='India' is what flips these into the South Asia
--   display tile.
--
-- This migration is idempotent — every INSERT uses ON CONFLICT, every
-- ALTER guards with IF NOT EXISTS or DO/EXCEPTION blocks.
-- ──────────────────────────────────────────────────────────────────────────


-- ══════════════════════════════════════════════════════════════════════════
-- PART F — Schema updates (run these first so the rest of the migration
-- can reference is_placeholder).
-- ══════════════════════════════════════════════════════════════════════════

ALTER TABLE vendors
  ADD COLUMN IF NOT EXISTS is_placeholder boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_vendors_is_placeholder
  ON vendors (is_placeholder) WHERE is_placeholder = true;

-- The legacy `category` text column from 0001 is superseded by the
-- vendor_category_assignments junction table (see 0021). Drop its NOT NULL
-- so tool-driven inserts don't have to populate the legacy field.
ALTER TABLE vendors ALTER COLUMN category DROP NOT NULL;

-- Unique keys on the per-location reference tables so seed re-runs are safe.
DO $$ BEGIN
  ALTER TABLE budget_location_regions
    ADD CONSTRAINT budget_location_regions_location_name_key
    UNIQUE (location_id, name);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE budget_location_experiences
    ADD CONSTRAINT budget_location_experiences_location_name_key
    UNIQUE (location_id, name);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


-- ══════════════════════════════════════════════════════════════════════════
-- get_ranked_vendors — add p_include_placeholders (default false).
--
-- Production traffic sees nothing until real vendors are imported. Dev /
-- preview surfaces can pass include_placeholders=true to render the
-- editorial filler. Adding a parameter changes the function signature, so
-- DROP first and recreate.
-- ══════════════════════════════════════════════════════════════════════════

DROP FUNCTION IF EXISTS get_ranked_vendors(text, text, text, integer, integer);

CREATE OR REPLACE FUNCTION get_ranked_vendors(
  p_category_slug        text DEFAULT NULL,
  p_location_slug        text DEFAULT NULL,
  p_tier                 text DEFAULT NULL,
  p_capacity             integer DEFAULT NULL,
  p_limit                integer DEFAULT 24,
  p_include_placeholders boolean DEFAULT false
)
RETURNS TABLE (
  id                   uuid,
  slug                 text,
  name                 text,
  tagline              text,
  bio                  text,
  hero_image_url       text,
  gallery_image_urls   jsonb,
  website_url          text,
  instagram_handle     text,
  email                text,
  phone                text,
  home_base_city       text,
  home_base_country    text,
  travels_globally     boolean,
  destinations_served  jsonb,
  tier_match           jsonb,
  capacity_min         integer,
  capacity_max         integer,
  placement_tier       vendor_placement_tier,
  verified             boolean,
  rank_bucket          integer
)
LANGUAGE sql STABLE AS $$
  WITH active_placements AS (
    SELECT * FROM vendor_placements
    WHERE active = true
      AND starts_at <= now()
      AND (ends_at IS NULL OR ends_at > now())
  ),
  matching AS (
    SELECT v.*
    FROM vendors v
    WHERE v.active = true
      AND (p_include_placeholders OR v.is_placeholder = false)
      AND (
        p_category_slug IS NULL
        OR EXISTS (
          SELECT 1
          FROM vendor_category_assignments vca
          JOIN vendor_categories vc ON vc.id = vca.category_id
          WHERE vca.vendor_id = v.id
            AND vc.slug = p_category_slug
            AND vc.active = true
        )
      )
      AND (
        p_location_slug IS NULL
        OR v.travels_globally = true
        OR v.destinations_served ? p_location_slug
        OR lower(replace(coalesce(v.home_base_city, ''), ' ', '-')) = lower(p_location_slug)
      )
      AND (
        p_tier IS NULL
        OR v.tier_match ? p_tier
      )
      AND (
        p_capacity IS NULL
        OR (
          (v.capacity_min IS NULL OR v.capacity_min <= p_capacity)
          AND (v.capacity_max IS NULL OR v.capacity_max >= p_capacity)
        )
      )
  ),
  bucketed AS (
    SELECT
      m.*,
      CASE
        WHEN EXISTS (
          SELECT 1 FROM active_placements ap
          WHERE ap.vendor_id = m.id
            AND ap.placement_type IN (
              'category_sponsored',
              'destination_sponsored',
              'tier_sponsored'
            )
            AND (
              ap.placement_type <> 'category_sponsored'
              OR (p_category_slug IS NOT NULL AND ap.category_slug = p_category_slug)
            )
            AND (
              ap.placement_type <> 'destination_sponsored'
              OR (p_location_slug IS NOT NULL AND ap.location_slug = p_location_slug)
            )
            AND (
              ap.placement_type <> 'tier_sponsored'
              OR (p_tier IS NOT NULL AND ap.tier = p_tier)
            )
        ) THEN 1
        WHEN EXISTS (
          SELECT 1 FROM active_placements ap
          WHERE ap.vendor_id = m.id
            AND ap.placement_type = 'global_featured'
        ) THEN 2
        WHEN m.verified THEN 3
        ELSE 4
      END AS rank_bucket
    FROM matching m
  )
  SELECT
    id, slug, name, tagline, bio, hero_image_url, gallery_image_urls,
    website_url, instagram_handle, email, phone,
    home_base_city, home_base_country, travels_globally,
    destinations_served, tier_match, capacity_min, capacity_max,
    placement_tier, verified, rank_bucket
  FROM bucketed
  ORDER BY rank_bucket ASC, random()
  LIMIT GREATEST(p_limit, 1);
$$;


-- ══════════════════════════════════════════════════════════════════════════
-- PART A — Destinations.
--
-- Four destinations (Udaipur, Goa, Jaipur, Kerala) already exist from 0022;
-- we UPSERT to fill in the rich overview / best_for / tips fields. Mumbai
-- and Delhi/NCR replace the combined `mumbai-delhi` row, which gets
-- deactivated below.
-- ══════════════════════════════════════════════════════════════════════════

INSERT INTO budget_locations (
  type, continent, country, name, slug,
  multiplier, min_budget_usd, best_months, best_for,
  tagline, overview, tips, display_order, active
) VALUES
(
  'destination', 'Asia', 'India', 'Udaipur, Rajasthan', 'udaipur',
  2.00, 300000, 'October–March',
  'the bride who''s been planning her wedding since age seven',
  'the palace that launched a thousand instagram accounts',
  'Udaipur is the wedding the algorithm wants you to have — and for once, the algorithm is right. Lake Pichola at golden hour, the Aravallis behind every drone shot, palace hotels where the suites used to belong to actual maharajas. This is where Bollywood films its weddings and where Priyanka Chopra got married. (No, you can''t book Umaid Bhawan unless you''re, well, her — but you can come close.)

What makes Udaipur work isn''t just the imagery. It''s the infrastructure. Every major palace hotel — Taj, Oberoi, Leela, Fairmont — has hosted hundreds of Indian weddings. The vendors know the routine. The pandits know the muhurat. Your aunties will be impressed before they even land.

The catch: every other bride wants the same thing, so book 14-18 months out for peak season. And know that a ''Udaipur wedding'' isn''t one wedding — it''s typically four to six events spread across two to three properties, with boats and elephants and at least one moment that feels suspiciously like a film shoot.',
  'Book the boat parade for sangeet — a procession of decorated boats across Lake Pichola at sunset is the move. Avoid May-September unless you genuinely enjoy 110°F. Most palace hotels require 80%+ buyout for exclusivity, which is where ultra budgets go.',
  100, true
),
(
  'destination', 'Asia', 'India', 'Goa', 'goa',
  1.50, 150000, 'November–February',
  'the bride who wants the wedding AND the after-party in the same place',
  'where the sangeet ends at sunrise and nobody apologizes',
  'Goa is the easiest destination wedding in India and the most fun. Direct flights from every major city. Beach you can actually swim in. A vendor ecosystem that''s been running on Bollywood weddings since the 90s. The question isn''t whether to do Goa — it''s North or South.

South Goa (Cavelossim, Varca, Benaulim, Mobor) is where the big-format resorts live: Taj Exotica, Leela Goa, Park Hyatt, Grand Hyatt. Calmer beaches, cleaner sands, the Goa your parents will approve of. North Goa (Vagator, Anjuna, Candolim, Morjim) is where the boutique properties and party energy concentrate — Marbela, Azaya, the W. The Goa your cousins want.

Most multi-event Goa weddings split: pre-wedding events at one resort with a sangeet on the beach, ceremony moves to a second property, reception goes anywhere with a dance floor and a working DJ. Plan accordingly.',
  'November–early December is peak. December 20–January 5 is also peak but doubles the rate cards. Late February still photographs beautifully. Beach ceremonies need a CRZ permit if you''re below the high-tide line — your planner handles this, but ask. Power redundancy matters: every Goa wedding has one moment where the generator becomes the main character.',
  110, true
),
(
  'destination', 'Asia', 'India', 'Jaipur', 'jaipur',
  1.70, 200000, 'October–March',
  'couples who want palace energy without the udaipur price tag',
  'rajasthan, but the version that returns your texts',
  'Jaipur is the destination that quietly does what Udaipur does, for meaningfully less money. The palaces are real (Rambagh, Samode, Jai Mahal, the Raj Palace), the heritage runs deeper (Amber Fort is older than most countries), and the airport is a direct flight from Delhi instead of a layover.

The Jaipur wedding archetype is the palace lawn ceremony — Mughal gardens at dusk, baraat horses on the gravel, a sangeet inside a 200-year-old ballroom. Rambagh Palace remains the iconic option (Maharaja-of-Jaipur former residence, full Taj operation), but Samode Palace 45 minutes outside the city offers a more private, more ''destination'' feel. Fairmont Jaipur is the modern luxury alternative for couples who want palace aesthetics with current ballroom infrastructure.

Pair Jaipur with a pre-wedding shoot at Amber Fort and a haldi at a smaller heritage haveli, and you''ve assembled something that out-photographs most $1M weddings.',
  'Samode Palace and Samode Bagh are 7 minutes apart and pair perfectly — palace for ceremony, gardens for sangeet. Avoid March-end through September (heat). Most premium venues enforce 10pm music cutoffs inside the city; outskirts properties (Samode, Alila Bishangarh) allow late-night events.',
  120, true
),
(
  'destination', 'Asia', 'India', 'Kerala', 'kerala',
  1.00, 100000, 'October–February',
  'couples who want their wedding to feel like a vacation, not a production',
  'backwaters, ayurveda, and zero of the rajasthan crowds',
  'Kerala is the South Asia destination most North Indian brides haven''t considered, which is exactly why it works. Vembanad Lake at sunrise. Houseboats with brass lamps. Tea estates in Munnar where a small wedding feels like a film. Resorts that lean into Kerala''s traditions instead of importing Rajasthani tropes.

The flagship is Kumarakom Lake Resort — sprawling, lakefront, with a pillarless 13,000 sq ft canopy that handles 800+ guests. Coconut Lagoon (CGH Earth) is accessible only by boat, which produces logistical complications and unforgettable arrivals. Taj Bekal is the beach option with dramatic rock formations. The Leela Kovalam sits on a clifftop above the Arabian Sea.

Kerala weddings work especially well for South Indian families, intercultural couples, and anyone who wants the celebration to feel immersive rather than transactional. Add a sadya (24-dish banana-leaf feast), a Kathakali performance, and at least one houseboat afternoon, and you have a wedding nobody who attends will forget.',
  'Post-monsoon (October–November) Kerala is at peak greenery — book this window if photography matters most. Kochi (COK) is the easiest international airport. Coconut Lagoon caps at ~150 guests, so use it for intimate events within a larger wedding rather than as your ceremony venue if you''re 300+. Plan for monsoon insurance — Kerala''s seasons are shifting.',
  130, true
),
(
  'destination', 'Asia', 'India', 'Mumbai', 'mumbai',
  1.40, 120000, 'November–February',
  'industry weddings — when half the guest list is in finance or film',
  'the gateway, the glamour, the gateway open bar',
  'Mumbai isn''t a destination wedding — it''s a hometown wedding for a specific kind of family. South Mumbai weddings happen at Taj Mahal Palace (the Gateway-of-India one) or Trident BKC. Bandra and BKC weddings happen at Sofitel, JW Marriott Sahar, or the St. Regis. Andheri/Powai weddings happen at ITC Maratha (which photographs like a palace and is priced accordingly), Westin Garden City, or Renaissance.

What Mumbai offers that no destination can match: the post-wedding life. The reception ends and your guests are home in 40 minutes. The morning after, your industry colleagues meet for chai at the Taj Sea Lounge. Your photographer''s studio is in Bandra. Your designer is in Worli. Mumbai weddings are a flex of network and place, not of escapism.

Costs run higher than the city''s reputation suggests — South Mumbai five-star ballrooms can hit $4-6K per plate at the Taj or Oberoi level, and rooms during peak season cross $700/night.',
  'Taj Mahal Palace (the original tower, not Tower wing) for legacy energy. ITC Maratha for ballroom-style with a heritage facade. JW Marriott Juhu for beachfront with the highest production capacity. Sahara Star and Renaissance Powai are the value plays for 1000+ guest events. Music cutoff at most central venues is 10pm — confirm in writing.',
  140, true
),
(
  'destination', 'Asia', 'India', 'Delhi / NCR', 'delhi',
  1.40, 120000, 'October–March',
  'the wedding capital — where 1,500-guest celebrations are tuesday',
  'where ''small wedding'' starts at 400 people',
  'Delhi is the Indian wedding industry''s gravitational center. More vendors, more venues, more scale, and frankly more competitive aunties than any other city. Two distinct ecosystems exist:

THE FIVE-STAR HOTEL CIRCUIT: Taj Palace (Sardar Patel Marg), The Leela Palace (Chanakyapuri), ITC Maurya (the diplomatic crowd''s choice), The Imperial (Art Deco heritage on Janpath), JW Marriott Aerocity (the international-guest-friendly option closest to IGI). Capacity 200-1,200, multi-day events, full hotel infrastructure.

THE FARMHOUSE BELT: Chhatarpur and the NH-8 stretch toward Gurgaon are where Delhi weddings get unhinged. Tivoli Garden Resort, Mallu Farms, Westin Sohna, Heritage Village Manesar — these properties handle 1,000-5,000 guest events with multiple simultaneous functions, drive-in baraats, and the kind of late-night production Delhi families expect. Leela Ambience Gurugram alone can host 3,000+ guests across simultaneous ceremonies.

Delhi is where you go if ''intimate'' isn''t on the brief.',
  'Book peak November dates 14+ months out. The farmhouse circuit has real noise/late-night flexibility that hotels don''t. Aerocity properties (Roseate, JW, Andaz) are the best logistics for international guest blocks. Pollution is real October-January — plan around the AQI for outdoor events and have backup indoor spaces for ceremonies.',
  145, true
)
ON CONFLICT (slug) DO UPDATE SET
  type           = EXCLUDED.type,
  continent      = EXCLUDED.continent,
  country        = EXCLUDED.country,
  name           = EXCLUDED.name,
  multiplier     = EXCLUDED.multiplier,
  min_budget_usd = EXCLUDED.min_budget_usd,
  best_months    = EXCLUDED.best_months,
  best_for       = EXCLUDED.best_for,
  tagline        = EXCLUDED.tagline,
  overview       = EXCLUDED.overview,
  tips           = EXCLUDED.tips,
  display_order  = EXCLUDED.display_order,
  active         = true;

-- The combined `mumbai-delhi` row from 0022 is superseded by the two
-- standalone entries above. Deactivate it rather than deleting so any
-- existing budget_user_plans.location_id references stay intact.
UPDATE budget_locations SET active = false WHERE slug = 'mumbai-delhi';

-- Match-tool tag arrays for the two new entries (mirrors the per-slug tag
-- conventions seeded in migration 0023).
UPDATE budget_locations SET
  tags         = '["convenient_for_indians","indian_vendors","food_scene","nightlife","beach","in_india","long_haul_from_us"]'::jsonb,
  max_capacity = 1500
WHERE slug = 'mumbai';

UPDATE budget_locations SET
  tags         = '["convenient_for_indians","indian_vendors","food_scene","heritage","nightlife","in_india","long_haul_from_us"]'::jsonb,
  max_capacity = 3000
WHERE slug = 'delhi';


-- ══════════════════════════════════════════════════════════════════════════
-- PART C — Regions per destination.
-- ══════════════════════════════════════════════════════════════════════════

INSERT INTO budget_location_regions (location_id, name, description, display_order)
SELECT bl.id, r.name, r.description, r.display_order
FROM budget_locations bl
JOIN (VALUES
  -- Udaipur
  ('udaipur', 'Lake Pichola & City Palace',
    'the iconic core: Taj Lake Palace, Jagmandir, the City Palace heritage walks, Bagore-ki-Haveli for sangeets', 10),
  ('udaipur', 'Fateh Sagar & North Udaipur',
    'Leela, Trident, Fairmont — newer luxury with lake or hill views, more space, easier guest logistics', 20),
  ('udaipur', 'The Aravallis (Devigarh, Aurika)',
    '30-minute outskirts: fortress hotels, hilltop properties, exclusivity over central convenience', 30),
  ('udaipur', 'Eklingji & Sajjangarh',
    'temple visits, monsoon palace photography, pre-wedding shoot circuits', 40),

  -- Goa
  ('goa', 'South Goa (Cavelossim, Varca, Mobor)',
    'premium beach resort belt: Taj Exotica, Leela Goa, Park Hyatt — calmer, family-friendly, photography forgives', 10),
  ('goa', 'North Goa (Vagator, Anjuna, Morjim)',
    'boutique-and-party belt: W, Marbela, Mandrem — younger energy, river-mouth beaches, nightlife integration', 20),
  ('goa', 'Panaji & Old Goa',
    'Portuguese heritage churches, Latin Quarter, day-trip photography for pre-wedding shoots', 30),
  ('goa', 'South Coast Hidden (Agonda, Patnem)',
    'for intimate weddings under 80 guests that want the quietest end of the coast', 40),

  -- Jaipur
  ('jaipur', 'Pink City Core',
    'Hawa Mahal, City Palace, Jantar Mantar — pre-wedding shoot circuit, mehndi haveli options', 10),
  ('jaipur', 'Amber & Aravalli North',
    'Amber Fort photography, Samode Palace, the fortress-and-temple drive route', 20),
  ('jaipur', 'Tonk Road & Civil Lines',
    'Rambagh, Jai Mahal, the central heritage hotel cluster', 30),
  ('jaipur', 'Outskirts (Bishangarh, Kukas)',
    'fort hotels and farmhouse resorts for larger-format weddings', 40),

  -- Kerala
  ('kerala', 'Kumarakom & Vembanad Lake',
    'the backwater resort core — Kumarakom Lake Resort, Coconut Lagoon, Niraamaya', 10),
  ('kerala', 'Kochi (Fort Kochi & Backwaters)',
    'the closest international airport, Le Meridien Kochi, Grand Hyatt Bolgatty', 20),
  ('kerala', 'Kovalam & South Coast',
    'The Leela Kovalam clifftop, beach photography, Trivandrum airport access', 30),
  ('kerala', 'Munnar Tea Estates',
    'hill-station intimate weddings — Tea Trails, colonial bungalows, mist-and-valley photography', 40),
  ('kerala', 'Bekal (North Kerala)',
    'Taj Bekal beach resort, dramatic rock formations, far from wedding-tourist routes', 50),

  -- Mumbai
  ('mumbai', 'South Mumbai (Colaba, Nariman Point)',
    'Taj, Oberoi, heritage core with Gateway-of-India photography', 10),
  ('mumbai', 'BKC & Bandra',
    'Sofitel, Trident BKC, JW Sahar — corporate wedding belt', 20),
  ('mumbai', 'Juhu & Andheri',
    'JW Marriott Juhu, ITC Maratha — beachfront and large-format ballroom options', 30),
  ('mumbai', 'Powai & Northeast',
    'Renaissance, Sahara Star — value-and-scale plays for 1000+ guest weddings', 40),

  -- Delhi / NCR
  ('delhi', 'Lutyens'' Delhi (Chanakyapuri, Sardar Patel Marg)',
    'The Leela, Taj Palace, ITC Maurya — heritage diplomatic-quarter five-stars', 10),
  ('delhi', 'Aerocity & Airport Belt',
    'JW Marriott Aerocity, Roseate, Andaz — international-guest-friendly, 7 min from IGI', 20),
  ('delhi', 'Chhatarpur Farmhouse Belt',
    'Tivoli, Mallu Farms, MorBagh — large-format late-night farmhouse weddings', 30),
  ('delhi', 'NH-8 & Manesar (Gurgaon)',
    'Westin Sohna, Heritage Village, Leela Ambience — NCR-extension venues with capacity', 40),
  ('delhi', 'Old Delhi Heritage',
    'havelis, Sunder Nursery, Mughal-era venue options for boutique luxury weddings', 50)
) AS r(loc_slug, name, description, display_order)
  ON r.loc_slug = bl.slug
ON CONFLICT (location_id, name) DO UPDATE SET
  description   = EXCLUDED.description,
  display_order = EXCLUDED.display_order;


-- ══════════════════════════════════════════════════════════════════════════
-- PART D — Experiences per destination.
-- ══════════════════════════════════════════════════════════════════════════

INSERT INTO budget_location_experiences (location_id, name, icon, description, category, display_order)
SELECT bl.id, e.name, e.icon, e.description, e.category, e.display_order
FROM budget_locations bl
JOIN (VALUES
  -- Udaipur
  ('udaipur', 'Lake Pichola Sunset Boat Procession', '🛶',
    'the sangeet entrance every drone shot you''ve seen on instagram', 'Cultural',     10),
  ('udaipur', 'Caparisoned Elephant Welcome at Devigarh', '🐘',
    'the optional bride-arrival moment that books out 6 months ahead', 'Cultural',     20),
  ('udaipur', 'Bagore-ki-Haveli Folk Performance', '🎶',
    'rajasthani folk dance and puppetry as your mehndi backdrop', 'Entertainment',     30),
  ('udaipur', 'Royal Rajasthani Thali at City Palace', '🍽️',
    'guest-experience meal inside the actual maharaja''s residence', 'Food',           40),
  ('udaipur', 'Saheliyon-ki-Bari Gardens Pre-Wedding Shoot', '📸',
    'the marble fountain garden every other udaipur shoot uses, for good reason', 'Adventure', 50),
  ('udaipur', 'Pre-Wedding Spa Day at Oberoi Udaivilas', '💆',
    'ayurveda + the best hotel spa in india', 'Wellness',                              60),
  ('udaipur', 'Block-Print Workshop in Bagru Village', '🎨',
    'guest activity for the hours between mehndi and sangeet', 'Cultural',             70),
  ('udaipur', 'Sajjangarh Monsoon Palace Sunrise', '🌅',
    'the photography location for the morning-after couple shoot', 'Adventure',        80),

  -- Goa
  ('goa', 'Catamaran Sundowner Cruise', '🏖️',
    'guest activity that doubles as cocktail hour', 'Adventure',                       10),
  ('goa', 'Anjuna Flea Market Welcome Bag Run', '🐟',
    'boutique gifting, goa-style, for international guests', 'Cultural',               20),
  ('goa', 'Authentic Goan Seafood Feast at Martin''s Corner', '🍤',
    'the rehearsal dinner alternative to a hotel banquet', 'Food',                     30),
  ('goa', 'Old Goa Cathedral Heritage Walk', '🛕',
    'portuguese heritage context for guests', 'Cultural',                              40),
  ('goa', 'Live Saxophone Sundowner on the Beach', '🎵',
    'the cocktail-hour soundtrack only goa does well', 'Entertainment',                50),
  ('goa', 'Sunrise Yoga at Ashvem Beach', '🧘',
    'morning-after activity for guests in north goa', 'Wellness',                      60),
  ('goa', 'Mandovi River Houseboat Brunch', '🚤',
    'day-after brunch alternative for the close family', 'Food',                       70),
  ('goa', 'Casino Night at Deltin Royale', '🎲',
    'the unconventional pre-wedding bachelor/bachelorette move', 'Entertainment',      80),

  -- Jaipur
  ('jaipur', 'Amber Fort Elephant Heritage Walk', '🐘',
    'guest activity that doubles as your wedding''s most-photographed afternoon', 'Cultural', 10),
  ('jaipur', 'Block-Print Workshop in Bagru', '🎨',
    'the workshop your bridesmaids will brag about back home', 'Cultural',             20),
  ('jaipur', 'Hawa Mahal & Pink City Pre-Wedding Shoot', '🛕',
    'the photography walk every jaipur wedding includes', 'Adventure',                 30),
  ('jaipur', 'Royal Rajasthani Dinner at Suvarna Mahal, Rambagh', '🍽️',
    'the 18th-century-style ballroom dinner inside an actual palace', 'Food',          40),
  ('jaipur', 'Kalbelia Folk Dance Performance', '💃',
    'the rajasthani folk dance set piece for sangeet', 'Entertainment',                50),
  ('jaipur', 'Polo Match at Rambagh Polo Ground', '🎪',
    'the optional bachelor-day activity', 'Adventure',                                 60),
  ('jaipur', 'Hand-Crafted Pottery in Sanganer', '🎨',
    'guest activity, blue-pottery edition', 'Cultural',                                70),
  ('jaipur', 'Hot Air Balloon Over Aravallis', '🌅',
    'the ultra-luxury pre-wedding-shoot move', 'Adventure',                            80),

  -- Kerala
  ('kerala', 'Vembanad Lake Houseboat Day', '🛶',
    'the kettuvallam day-trip that becomes everyone''s favorite memory', 'Adventure',  10),
  ('kerala', 'Ayurveda Wellness Day', '💆',
    'the kerala-specific pre-wedding ritual', 'Wellness',                              20),
  ('kerala', 'Kathakali Performance at Sangeet', '🎭',
    'kerala''s traditional dance-drama, performed at golden hour', 'Entertainment',    30),
  ('kerala', 'Sadya Banana-Leaf Feast', '🍌',
    'the 24-dish traditional kerala meal that doubles as cultural set-piece', 'Food',  40),
  ('kerala', 'Mural Painting Workshop in Kochi', '🎨',
    'guest activity in fort kochi', 'Cultural',                                        50),
  ('kerala', 'Periyar Wildlife Cruise', '🐘',
    'for couples doing a wedding-honeymoon combination', 'Adventure',                  60),
  ('kerala', 'Coconut Tree-Climbing Demo at Coconut Lagoon', '🥥',
    'the kerala village experience, choreographed for guests', 'Cultural',             70),
  ('kerala', 'Sunrise Backwater Photography Cruise', '🌅',
    'the morning-after couple shoot location', 'Adventure',                            80),

  -- Mumbai
  ('mumbai', 'Marine Drive Sundowner', '🌃',
    'the queen''s necklace at golden hour, guest-experience edition', 'Adventure',     10),
  ('mumbai', 'Bohri Mohalla Food Walk', '🍤',
    'the rehearsal-dinner alternative for bombay-cuisine appreciators', 'Food',        20),
  ('mumbai', 'Bollywood Studio Tour', '🎭',
    'guest activity for the international cousins', 'Entertainment',                   30),
  ('mumbai', 'Elephanta Caves Day Trip', '🛕',
    'boat ride + ancient cave temples, half-day guest activity', 'Cultural',           40),
  ('mumbai', 'Kala Ghoda Art Walk', '🎨',
    'south mumbai gallery walk for the mehndi-day downtime', 'Cultural',               50),
  ('mumbai', 'Cocktail Hour at the Sea Lounge, Taj', '🍸',
    'the legacy pre-event setup at the original taj', 'Food',                          60),
  ('mumbai', 'Live Jazz at the Quarter', '🎶',
    'music-led cocktail hour, mumbai-style', 'Entertainment',                          70),

  -- Delhi
  ('delhi', 'Humayun''s Tomb & Lodhi Garden Pre-Wedding Shoot', '🛕',
    'the mughal-monument photography set piece', 'Cultural',                           10),
  ('delhi', 'Bukhara Dinner at ITC Maurya', '🍽️',
    'the legendary north-indian meal as welcome dinner', 'Food',                       20),
  ('delhi', 'Sunder Nursery Garden Sangeet', '🎨',
    'the mughal-era garden alternative to a hotel ballroom', 'Cultural',               30),
  ('delhi', 'Old Delhi Food Walk', '🛺',
    'chandni chowk street-food tour for international guests', 'Food',                 40),
  ('delhi', 'Bollywood Choreographer-Led Sangeet Practice', '💃',
    'the delhi-specific sangeet prep that pays off on the night', 'Entertainment',     50),
  ('delhi', 'Akshardham Cultural Show', '🐘',
    'the temple-complex visit for older guests', 'Cultural',                           60),
  ('delhi', 'Qutub Minar Heritage Walk', '🌅',
    'delhi heritage context for international guests', 'Cultural',                     70),
  ('delhi', 'Hauz Khas Village Art Walk', '🎨',
    'the trendy-delhi guest-activity option', 'Cultural',                              80)
) AS e(loc_slug, name, icon, description, category, display_order)
  ON e.loc_slug = bl.slug
ON CONFLICT (location_id, name) DO UPDATE SET
  icon          = EXCLUDED.icon,
  description   = EXCLUDED.description,
  category      = EXCLUDED.category,
  display_order = EXCLUDED.display_order;


-- ══════════════════════════════════════════════════════════════════════════
-- PART B — Real venues per destination.
--
-- These are researched, named properties. is_placeholder stays FALSE.
-- Each venue is assigned to the canonical "Venue" category and gets a
-- (price_low_usd, price_high_usd) indicator that powers the "from $X"
-- pricing band on the venue cards.
-- ══════════════════════════════════════════════════════════════════════════

INSERT INTO vendors (
  slug, name, tagline, bio,
  home_base_city, home_base_country,
  travels_globally, destinations_served, tier_match,
  capacity_min, capacity_max,
  active, verified, is_placeholder, placement_tier
) VALUES
-- Udaipur
('taj-lake-palace',
 'Taj Lake Palace',
 'the marble palace floating in the middle of lake pichola',
 '1746 royal residence converted into a 65-suite hotel accessible only by boat. Hosts a small number of weddings each year — the kind where the entire palace becomes yours. Capacity is intentionally limited; the experience is intentionally surreal.',
 'Udaipur', 'India',
 false, '["udaipur"]'::jsonb, '["luxury","ultra"]'::jsonb,
 80, 200, true, true, false, 'standard'),
('oberoi-udaivilas',
 'The Oberoi Udaivilas',
 'the udaipur property every wedding magazine actually books',
 '30 acres on the western banks of Lake Pichola. Domes, courtyards, private pools attached to suites. Consistently rated among the world''s top hotels — and one of the few Udaipur properties where ultra-luxury means it. Used for the Ambani pre-wedding cruise content.',
 'Udaipur', 'India',
 false, '["udaipur"]'::jsonb, '["luxury","ultra"]'::jsonb,
 150, 400, true, true, false, 'standard'),
('leela-palace-udaipur',
 'The Leela Palace Udaipur',
 'the palace with the helicopter pad',
 '80 rooms on the eastern banks of Lake Pichola, with a dedicated wedding boat that ferries guests to private island ceremonies on Jagmandir. The Leela''s destination-wedding playbook is among the most refined in India.',
 'Udaipur', 'India',
 false, '["udaipur"]'::jsonb, '["luxury","ultra"]'::jsonb,
 200, 500, true, true, false, 'standard'),
('fairmont-udaipur-palace',
 'Fairmont Udaipur Palace',
 'the modern palace, with garden venues that handle 1,500',
 'Newer than the heritage palaces but built like one. Outdoor venues — Jashn Palace Garden, Udai Bagh, Chand Baori — are designed for large-format Indian weddings. Strong choice when you need scale plus palace aesthetics.',
 'Udaipur', 'India',
 false, '["udaipur"]'::jsonb, '["elevated","luxury","ultra"]'::jsonb,
 250, 1500, true, true, false, 'standard'),
('raas-devigarh',
 'Raas Devigarh',
 'the 18th-century fort hotel for the bride who hates everything obvious',
 '39 suites in a restored 18th-century fortress 30 minutes outside Udaipur in the Aravallis. Modern minimalist interiors inside ancient fort walls. Best for intimate weddings (under 200 guests) that want to skip the lake-palace cliché entirely.',
 'Udaipur', 'India',
 false, '["udaipur"]'::jsonb, '["luxury","ultra"]'::jsonb,
 60, 200, true, true, false, 'standard'),

-- Goa
('taj-exotica-goa',
 'Taj Exotica Goa, Benaulim',
 'the south goa flagship — beachfront, sprawling, and what aunties picture',
 '56 acres in South Goa with manicured gardens, beachfront lawns, and indoor ballrooms. Exotica is the most-booked premium Goa wedding venue for a reason — operations are tight, the photography is forgiving, and the property handles 500+ guest events without strain.',
 'Goa', 'India',
 false, '["goa"]'::jsonb, '["luxury","ultra"]'::jsonb,
 150, 600, true, true, false, 'standard'),
('leela-goa-mobor',
 'The Leela Goa, Mobor',
 'india''s only beach-AND-river luxury resort — and they remind you constantly',
 'Cavelossim peninsula property with 7 venue spaces (3 outdoor) where the Sal River meets the Arabian Sea. Vijayanagara-Portuguese architecture. Strongly preferred for ceremony-focused itineraries that need both beach and lawn options.',
 'Goa', 'India',
 false, '["goa"]'::jsonb, '["luxury","ultra"]'::jsonb,
 100, 600, true, true, false, 'standard'),
('park-hyatt-goa',
 'Park Hyatt Goa Resort & Spa, Cansaulim',
 'the goa resort with the best food-and-drink reputation',
 '45 acres in South Goa with seven dining concepts, wide beachfront, and three distinct outdoor wedding venues. F&B program is the strongest among Goa''s premium properties — important for couples who care more about menu than mandap.',
 'Goa', 'India',
 false, '["goa"]'::jsonb, '["elevated","luxury","ultra"]'::jsonb,
 150, 500, true, true, false, 'standard'),
('grand-hyatt-goa',
 'Grand Hyatt Goa, Bambolim',
 'north goa''s largest production-friendly venue',
 'Mediterranean-style property overlooking Bambolim Bay with the largest banquet inventory in Goa. Best for 800-1500+ guest events where capacity matters more than intimacy. ITC-style scale, less boutique character.',
 'Goa', 'India',
 false, '["goa"]'::jsonb, '["elevated","luxury"]'::jsonb,
 300, 1500, true, true, false, 'standard'),
('w-goa-vagator',
 'W Goa, Vagator',
 'the north goa choice when ''wedding'' should also mean ''after-party''',
 'Vagator cliffside property where the Marriott group bet on North Goa''s nightlife identity. Beach access, contemporary design, events that lean younger and louder. Strong for couples whose guest list includes more cousins than uncles.',
 'Goa', 'India',
 false, '["goa"]'::jsonb, '["luxury","ultra"]'::jsonb,
 150, 500, true, true, false, 'standard'),

-- Jaipur
('rambagh-palace',
 'Rambagh Palace',
 'the maharaja''s actual former house — now a taj',
 '47 acres of Mughal-Rajput palace, the residence of the Jaipur maharajas from 1925, converted into India''s first palace hotel in 1957. 78 rooms and suites. Multiple ballrooms (Suvarna Mahal, Maharaja), Mughal Gardens for outdoor events, and the iconic Panghat Lawn pavilion. The Jaipur palace wedding gold standard.',
 'Jaipur', 'India',
 false, '["jaipur"]'::jsonb, '["luxury","ultra"]'::jsonb,
 150, 800, true, true, false, 'standard'),
('samode-palace',
 'Samode Palace, Chomu',
 'the 475-year-old palace 45 minutes outside the city — and worth every minute',
 'Indo-Saracenic palace with frescoes and mirror work intact. 43 rooms. Indoor banquet (80 floating), outdoor lawn (700 floating), Darbar Hall terrace (300 floating). Pairs with Samode Bagh, the associated Mughal-garden property 7 minutes away. Authentic heritage experience without metro Jaipur infrastructure overhead.',
 'Jaipur', 'India',
 false, '["jaipur"]'::jsonb, '["luxury","ultra"]'::jsonb,
 80, 500, true, true, false, 'standard'),
('leela-palace-jaipur',
 'The Leela Palace Jaipur',
 'modern luxury with palace aesthetics — for couples who want both',
 '200 rooms with 50,000+ sq ft of indoor and outdoor event space. Pillarless Grand Ballroom, garden venues with Aravalli views. Contemporary luxury infrastructure inside palace-style architecture. Strong choice when production needs (sound, AV, lighting) outweigh heritage atmosphere.',
 'Jaipur', 'India',
 false, '["jaipur"]'::jsonb, '["luxury","ultra"]'::jsonb,
 200, 1000, true, true, false, 'standard'),
('fairmont-jaipur',
 'Fairmont Jaipur',
 'Mughal-rajput grandeur with 245 rooms',
 'Built like a royal palace with 245 rooms. Captivating paintings, chandeliers, frescoed walls. Best for 500-1000 guest weddings where hotel-scale logistics matter — large room block, multiple ballrooms, full F&B operation. The ITC-equivalent of Jaipur palace weddings.',
 'Jaipur', 'India',
 false, '["jaipur"]'::jsonb, '["elevated","luxury"]'::jsonb,
 200, 1200, true, true, false, 'standard'),
('alila-fort-bishangarh',
 'Alila Fort Bishangarh',
 'the hilltop fort hotel — for weddings that should feel like a film',
 '230-year-old granite fort on a hill, restored by Alila. 59 suites. Dramatic, exclusive, photographs in a way no other Jaipur property does. Best for intimate luxury weddings (under 150 guests) with strong design intent.',
 'Bishangarh', 'India',
 false, '["jaipur"]'::jsonb, '["luxury","ultra"]'::jsonb,
 60, 150, true, true, false, 'standard'),

-- Kerala
('kumarakom-lake-resort',
 'Kumarakom Lake Resort',
 'the kerala wedding flagship — backwaters, scale, and the longest pool in india',
 'Heritage resort on Vembanad Lake with a 13,250 sq ft pillarless German-hangar canopy that handles 800+ guests, plus a 12,000 sq ft lakeside lawn for smaller events. Heritage villas, infinity pool, Ayurveda spa. Best for full-format Indian weddings that want backwater setting plus production capacity.',
 'Kumarakom', 'India',
 false, '["kerala"]'::jsonb, '["luxury","ultra"]'::jsonb,
 150, 800, true, true, false, 'standard'),
('coconut-lagoon-cgh-earth',
 'Coconut Lagoon (CGH Earth)',
 'the boat-only resort — accessible only by water, exclusive by design',
 'CGH Earth eco-luxury property accessible only by boat. Built using transplanted Kerala heritage homes (tharavadu mansions). Caps at ~150 guests — the constraint is the point. Best as the ceremony venue inside a larger multi-property Kerala wedding, or the entire wedding for couples committed to intimacy and sustainability.',
 'Kumarakom', 'India',
 false, '["kerala"]'::jsonb, '["luxury","ultra"]'::jsonb,
 50, 150, true, true, false, 'standard'),
('taj-bekal-resort',
 'Taj Bekal Resort & Spa',
 'the kerala beach option — with dramatic rock formations',
 'Architecture inspired by traditional Kerala houseboats, set on a private beach with distinctive black rock formations. Strong choice when the wedding wants beach photography but in a less-crowded alternative to Goa. North Kerala location adds journey but reduces wedding-tourist density.',
 'Bekal', 'India',
 false, '["kerala"]'::jsonb, '["luxury"]'::jsonb,
 100, 350, true, true, false, 'standard'),
('leela-kovalam-beach',
 'The Leela Kovalam Beach',
 'kerala''s only clifftop beach resort',
 'Clifftop property above Kovalam beach with panoramic Arabian Sea views. 5-star infrastructure, dedicated wedding planning, ballroom plus beach options. Best for couples who want Kerala beach setting without going as far north as Bekal.',
 'Kovalam', 'India',
 false, '["kerala"]'::jsonb, '["luxury","ultra"]'::jsonb,
 100, 400, true, true, false, 'standard'),
('niraamaya-kumarakom',
 'Niraamaya Retreats Kumarakom',
 'the wellness-led wedding venue — ayurveda spa included',
 'Lakeside boutique resort built around Niraamaya''s wellness positioning. Smaller scale than Kumarakom Lake Resort but with stronger Ayurveda/spa integration. Best for couples who want pre-wedding wellness rituals built into the itinerary.',
 'Kumarakom', 'India',
 false, '["kerala"]'::jsonb, '["elevated","luxury"]'::jsonb,
 80, 250, true, true, false, 'standard'),

-- Mumbai
('taj-mahal-palace-colaba',
 'The Taj Mahal Palace, Colaba',
 'the gateway view, the original wing, the building everyone calls ''the taj''',
 '1903 heritage hotel opposite the Gateway of India. 550 rooms. Ballroom (300 theater style), Crystal Room (380 theater style, pillarless), rooftop Rendezvous (80 guests), Taj Art Gallery for intimate functions. The flagship of Indian luxury hospitality.',
 'Mumbai', 'India',
 false, '["mumbai"]'::jsonb, '["luxury","ultra"]'::jsonb,
 80, 650, true, true, false, 'standard'),
('itc-maratha-andheri',
 'ITC Maratha, Andheri East',
 'the heritage facade in andheri — for wedding photography that doesn''t look like a hotel',
 'British-style heritage architecture with two ponds in the wedding garden, ballroom inventory, and full F&B (ITC''s Indian restaurants are best-in-class). Best for full-format Punjabi/Marwari weddings that want palace aesthetics with metro Mumbai logistics.',
 'Mumbai', 'India',
 false, '["mumbai"]'::jsonb, '["luxury","ultra"]'::jsonb,
 200, 1000, true, true, false, 'standard'),
('jw-marriott-mumbai-juhu',
 'JW Marriott Mumbai Juhu',
 'beachfront mumbai — when the reception needs to be IN bombay, not outside it',
 'Juhu Beach property with multiple ballrooms, beachfront lawns, and the production scale to handle 1000+ guest weddings. The default Bandra-North-side wedding venue for industry families.',
 'Mumbai', 'India',
 false, '["mumbai"]'::jsonb, '["luxury"]'::jsonb,
 200, 1000, true, true, false, 'standard'),
('grand-hyatt-mumbai',
 'Grand Hyatt Mumbai',
 'the 1500-guest production house in vakola',
 'Largest banquet inventory in Mumbai. Multiple simultaneous ballrooms, dedicated wedding team, full hotel infrastructure. Best for mega-weddings (1000-1500 guests) where capacity is the constraint.',
 'Mumbai', 'India',
 false, '["mumbai"]'::jsonb, '["elevated","luxury"]'::jsonb,
 300, 1500, true, true, false, 'standard'),
('st-regis-mumbai-lower-parel',
 'The St. Regis Mumbai, Lower Parel',
 'south-of-bandra luxury — for the corporate wedding crowd',
 'Modern luxury tower in Lower Parel with panoramic city views, elegant ballrooms, and the St. Regis butler service. Best for contemporary, design-forward weddings that skip the heritage aesthetic entirely.',
 'Mumbai', 'India',
 false, '["mumbai"]'::jsonb, '["luxury","ultra"]'::jsonb,
 100, 500, true, true, false, 'standard'),

-- Delhi / NCR
('leela-palace-new-delhi',
 'The Leela Palace New Delhi, Chanakyapuri',
 'diplomatic enclave luxury — where the prime minister''s neighbors get married',
 'Royal Lutyens-style architecture in the diplomatic enclave. Multiple banquet halls, garden lawns, terrace venues. 254 rooms. The default ''serious wedding'' choice for Delhi families with political or diplomatic networks.',
 'Delhi', 'India',
 false, '["delhi"]'::jsonb, '["luxury","ultra"]'::jsonb,
 150, 350, true, true, false, 'standard'),
('taj-palace-sardar-patel-marg',
 'Taj Palace, Sardar Patel Marg',
 'delhi''s heritage taj — mughal-inspired, 6 acres, garden lawns',
 '6-acre property in the diplomatic quarter with Mughal-inspired architecture, multiple ballrooms (Durbar Hall, Sapphire Hall), impeccable garden lawns. Strong photography across all seasons. Hosted multiple state weddings.',
 'Delhi', 'India',
 false, '["delhi"]'::jsonb, '["luxury","ultra"]'::jsonb,
 200, 1500, true, true, false, 'standard'),
('itc-maurya-chanakyapuri',
 'ITC Maurya, Chanakyapuri',
 'the bukhara wedding — F&B-led luxury with a delhi institution status',
 'Chanakyapuri property home to legendary restaurants Bukhara and Dum Pukht. Strong choice for couples where dining experience is the priority. Multiple banquet halls plus garden venues. Heavy political/corporate clientele.',
 'Delhi', 'India',
 false, '["delhi"]'::jsonb, '["luxury","ultra"]'::jsonb,
 200, 1200, true, true, false, 'standard'),
('tivoli-garden-resort-chhatarpur',
 'Tivoli Garden Resort, Chhatarpur',
 'the chhatarpur farmhouse flagship — where 1,500 guest weddings happen tuesday',
 'Chhatarpur belt''s iconic farmhouse-resort hybrid. Multiple simultaneous event spaces, drive-in baraat access, late-night allowances that hotels don''t offer. The default for North Indian weddings that refuse to be capped at 500 guests.',
 'Delhi', 'India',
 false, '["delhi"]'::jsonb, '["elevated","luxury","ultra"]'::jsonb,
 500, 5000, true, true, false, 'standard'),
('leela-ambience-gurugram',
 'The Leela Ambience Gurugram',
 'the venue that handles 3,000+ guests across simultaneous events',
 'NCR''s largest single-property wedding operation. Pillarless ballrooms, multiple simultaneous event spaces, full hotel infrastructure for international guest blocks. Best for mega-weddings where multiple side events run in parallel.',
 'Gurugram', 'India',
 false, '["delhi"]'::jsonb, '["luxury","ultra"]'::jsonb,
 500, 3000, true, true, false, 'standard')
ON CONFLICT (slug) WHERE slug IS NOT NULL DO UPDATE SET
  name                = EXCLUDED.name,
  tagline             = EXCLUDED.tagline,
  bio                 = EXCLUDED.bio,
  home_base_city      = EXCLUDED.home_base_city,
  home_base_country   = EXCLUDED.home_base_country,
  travels_globally    = EXCLUDED.travels_globally,
  destinations_served = EXCLUDED.destinations_served,
  tier_match          = EXCLUDED.tier_match,
  capacity_min        = EXCLUDED.capacity_min,
  capacity_max        = EXCLUDED.capacity_max,
  active              = true,
  verified            = true,
  is_placeholder      = false,
  placement_tier      = 'standard';

-- Assign every real venue above to the canonical "Venue" category. is_primary
-- is true since "Venue" is the only category they hold.
INSERT INTO vendor_category_assignments (vendor_id, category_id, is_primary)
SELECT v.id, vc.id, true
FROM vendors v
JOIN vendor_categories vc ON vc.slug = 'venue'
WHERE v.slug IN (
  'taj-lake-palace','oberoi-udaivilas','leela-palace-udaipur','fairmont-udaipur-palace','raas-devigarh',
  'taj-exotica-goa','leela-goa-mobor','park-hyatt-goa','grand-hyatt-goa','w-goa-vagator',
  'rambagh-palace','samode-palace','leela-palace-jaipur','fairmont-jaipur','alila-fort-bishangarh',
  'kumarakom-lake-resort','coconut-lagoon-cgh-earth','taj-bekal-resort','leela-kovalam-beach','niraamaya-kumarakom',
  'taj-mahal-palace-colaba','itc-maratha-andheri','jw-marriott-mumbai-juhu','grand-hyatt-mumbai','st-regis-mumbai-lower-parel',
  'leela-palace-new-delhi','taj-palace-sardar-patel-marg','itc-maurya-chanakyapuri','tivoli-garden-resort-chhatarpur','leela-ambience-gurugram'
)
ON CONFLICT (vendor_id, category_id) DO NOTHING;

-- Per-venue pricing indicators against the Venue category.
INSERT INTO vendor_pricing_indicators (vendor_id, category_id, price_low_usd, price_high_usd, price_unit, notes)
SELECT v.id, vc.id, p.lo, p.hi, 'package'::vendor_pricing_unit, ''
FROM vendors v
JOIN vendor_categories vc ON vc.slug = 'venue'
JOIN (VALUES
  ('taj-lake-palace',                  600000,  1500000),
  ('oberoi-udaivilas',                 800000,  2500000),
  ('leela-palace-udaipur',             700000,  2000000),
  ('fairmont-udaipur-palace',          350000,  1200000),
  ('raas-devigarh',                    250000,   700000),
  ('taj-exotica-goa',                  250000,   800000),
  ('leela-goa-mobor',                  220000,   700000),
  ('park-hyatt-goa',                   200000,   650000),
  ('grand-hyatt-goa',                  180000,   500000),
  ('w-goa-vagator',                    220000,   600000),
  ('rambagh-palace',                   700000,  2500000),
  ('samode-palace',                    350000,  1200000),
  ('leela-palace-jaipur',              600000,  1800000),
  ('fairmont-jaipur',                  400000,  1000000),
  ('alila-fort-bishangarh',            350000,   900000),
  ('kumarakom-lake-resort',            250000,   700000),
  ('coconut-lagoon-cgh-earth',         200000,   500000),
  ('taj-bekal-resort',                 180000,   450000),
  ('leela-kovalam-beach',              220000,   600000),
  ('niraamaya-kumarakom',              150000,   400000),
  ('taj-mahal-palace-colaba',          400000,  1500000),
  ('itc-maratha-andheri',              250000,   800000),
  ('jw-marriott-mumbai-juhu',          200000,   600000),
  ('grand-hyatt-mumbai',               180000,   500000),
  ('st-regis-mumbai-lower-parel',      250000,   700000),
  ('leela-palace-new-delhi',           500000,  1500000),
  ('taj-palace-sardar-patel-marg',     400000,  1200000),
  ('itc-maurya-chanakyapuri',          350000,  1000000),
  ('tivoli-garden-resort-chhatarpur',  200000,   800000),
  ('leela-ambience-gurugram',          300000,  1200000)
) AS p(vendor_slug, lo, hi)
  ON p.vendor_slug = v.slug
ON CONFLICT (vendor_id, category_id) DO UPDATE SET
  price_low_usd  = EXCLUDED.price_low_usd,
  price_high_usd = EXCLUDED.price_high_usd;


-- ══════════════════════════════════════════════════════════════════════════
-- PART E — Placeholder vendors per destination.
--
-- =====================================================================
-- PLACEHOLDER VENDORS — REPLACE WITH REAL DATA BEFORE GOING LIVE
-- These rows have is_placeholder=TRUE.
-- Filter them out of public-facing queries until real vendor import is
-- complete. Run: SELECT * FROM vendors WHERE is_placeholder=true;
-- to find them all.
-- =====================================================================
--
-- Slug format: mg__{destination}__{category}__{n}
--   The double-underscore separator means split_part(slug, '__', 3)
--   recovers the category slug cleanly even when it contains hyphens
--   (e.g. mehndi-artist, decor-florals, hair-makeup, wedding-planner).
--
-- Three placeholders × 8 categories × 6 destinations = 144 rows.
-- ══════════════════════════════════════════════════════════════════════════

-- All placeholder vendor rows in one shot. The CROSS JOIN of (destination ×
-- category-template) generates 6 × 24 = 144 rows; ON CONFLICT keeps re-runs
-- safe. Each `c` row carries the name template, tagline, and bio, with
-- {city} substituted from `d` per destination.
INSERT INTO vendors (
  slug, name, tagline, bio,
  home_base_city, home_base_country,
  travels_globally, destinations_served, tier_match,
  active, verified, is_placeholder, placement_tier
)
SELECT
  'mg__' || d.dest_slug || '__' || c.cat_slug || '__' || c.idx::text  AS slug,
  replace(c.name_template, '{city}', d.city_pretty)                   AS name,
  c.tagline                                                           AS tagline,
  c.bio_extra                                                         AS bio,
  d.city_pretty                                                       AS home_base_city,
  'India'                                                             AS home_base_country,
  false                                                               AS travels_globally,
  jsonb_build_array(d.dest_slug)                                      AS destinations_served,
  '["essential","elevated","luxury"]'::jsonb                          AS tier_match,
  true                                                                AS active,
  false                                                               AS verified,
  true                                                                AS is_placeholder,
  'standard'::vendor_placement_tier                                   AS placement_tier
FROM (VALUES
  ('udaipur', 'Udaipur'),
  ('goa',     'Goa'),
  ('jaipur',  'Jaipur'),
  ('kerala',  'Kerala'),
  ('mumbai',  'Mumbai'),
  ('delhi',   'Delhi')
) AS d(dest_slug, city_pretty)
CROSS JOIN (VALUES
  -- (cat_slug, idx, name_template, tagline, bio_extra)
  -- Photography ──────────────────────────────────────────────────────────
  ('photography', 1, 'the bagh studio — {city}',
    'the photographer who''ll make your phupho cry on schedule',
    'Editorial-led wedding photography. Placeholder roster — real photographers will be imported from the Marigold vendor pipeline; until then this is a directory shell so the UI can render.'),
  ('photography', 2, 'saffron frame co. — {city}',
    'the photographer who''ll make your phupho cry on schedule',
    'Editorial-led wedding photography. Placeholder roster — real photographers will be imported from the Marigold vendor pipeline; until then this is a directory shell so the UI can render.'),
  ('photography', 3, 'studio kohl — {city}',
    'the photographer who''ll make your phupho cry on schedule',
    'Editorial-led wedding photography. Placeholder roster — real photographers will be imported from the Marigold vendor pipeline; until then this is a directory shell so the UI can render.'),
  -- Videography ──────────────────────────────────────────────────────────
  ('videography', 1, 'celluloid saffron — {city}',
    'wedding films that don''t look like wedding films',
    'Cinematic wedding films, multi-cam, drone-friendly. Placeholder entry until the real videography roster is published.'),
  ('videography', 2, 'the {city} reel co.',
    'wedding films that don''t look like wedding films',
    'Cinematic wedding films, multi-cam, drone-friendly. Placeholder entry until the real videography roster is published.'),
  ('videography', 3, 'kalakaar films — {city}',
    'wedding films that don''t look like wedding films',
    'Cinematic wedding films, multi-cam, drone-friendly. Placeholder entry until the real videography roster is published.'),
  -- Decor & Florals ──────────────────────────────────────────────────────
  ('decor-florals', 1, 'petal & plinth — {city}',
    'florals that remind your mom of her own wedding, but better',
    'Decor and floral design across mandap, sangeet, and reception. Placeholder until the real decor partners are confirmed and listed.'),
  ('decor-florals', 2, 'the {city} floral studio',
    'florals that remind your mom of her own wedding, but better',
    'Decor and floral design across mandap, sangeet, and reception. Placeholder until the real decor partners are confirmed and listed.'),
  ('decor-florals', 3, 'gulmohar decor — {city}',
    'florals that remind your mom of her own wedding, but better',
    'Decor and floral design across mandap, sangeet, and reception. Placeholder until the real decor partners are confirmed and listed.'),
  -- Catering ─────────────────────────────────────────────────────────────
  ('catering', 1, 'the {city} plate co.',
    'the chef who finally got biryani right at scale',
    'External catering partner. Note: most premium South Asia venues include catering in-house — confirm with your venue before contracting an outside caterer. Placeholder entry.'),
  ('catering', 2, 'thali atelier — {city}',
    'the chef who finally got biryani right at scale',
    'External catering partner. Note: most premium South Asia venues include catering in-house — confirm with your venue before contracting an outside caterer. Placeholder entry.'),
  ('catering', 3, 'the saffron table — {city}',
    'the chef who finally got biryani right at scale',
    'External catering partner. Note: most premium South Asia venues include catering in-house — confirm with your venue before contracting an outside caterer. Placeholder entry.'),
  -- Hair & Makeup ────────────────────────────────────────────────────────
  ('hair-makeup', 1, 'rouge & rosewater — {city}',
    'the bridal glam team your bestie will steal next year',
    'Bridal hair and makeup, multi-event coverage, on-site touch-ups. Placeholder until the real glam roster lands.'),
  ('hair-makeup', 2, 'the {city} glam studio',
    'the bridal glam team your bestie will steal next year',
    'Bridal hair and makeup, multi-event coverage, on-site touch-ups. Placeholder until the real glam roster lands.'),
  ('hair-makeup', 3, 'kajal beauty — {city}',
    'the bridal glam team your bestie will steal next year',
    'Bridal hair and makeup, multi-event coverage, on-site touch-ups. Placeholder until the real glam roster lands.'),
  -- Mehndi Artist ────────────────────────────────────────────────────────
  ('mehndi-artist', 1, 'henna house — {city}',
    'the mehndi artist your sister already booked',
    'Bridal mehndi plus family applications, multi-day coverage. Placeholder until real artists are listed.'),
  ('mehndi-artist', 2, 'the {city} mehndi atelier',
    'the mehndi artist your sister already booked',
    'Bridal mehndi plus family applications, multi-day coverage. Placeholder until real artists are listed.'),
  ('mehndi-artist', 3, 'gulaab mehndi co. — {city}',
    'the mehndi artist your sister already booked',
    'Bridal mehndi plus family applications, multi-day coverage. Placeholder until real artists are listed.'),
  -- DJ ───────────────────────────────────────────────────────────────────
  ('dj', 1, '{city} sound co.',
    'the dj who plays the punjabi set without being asked',
    'Multi-genre wedding DJ. Bollywood, Punjabi, English Top 40, sangeet sets. Placeholder until the real DJs are imported.'),
  ('dj', 2, 'the saffron decks — {city}',
    'the dj who plays the punjabi set without being asked',
    'Multi-genre wedding DJ. Bollywood, Punjabi, English Top 40, sangeet sets. Placeholder until the real DJs are imported.'),
  ('dj', 3, 'tanpura nights — {city}',
    'the dj who plays the punjabi set without being asked',
    'Multi-genre wedding DJ. Bollywood, Punjabi, English Top 40, sangeet sets. Placeholder until the real DJs are imported.'),
  -- Wedding Planner ──────────────────────────────────────────────────────
  ('wedding-planner', 1, 'the {city} planning atelier',
    'the planner whose group chat you''ll miss when it''s over',
    'Full-service wedding planning, multi-event coordination, vendor management. Placeholder until the real planner roster is finalised.'),
  ('wedding-planner', 2, 'saffron events — {city}',
    'the planner whose group chat you''ll miss when it''s over',
    'Full-service wedding planning, multi-event coordination, vendor management. Placeholder until the real planner roster is finalised.'),
  ('wedding-planner', 3, 'phulkari planning co. — {city}',
    'the planner whose group chat you''ll miss when it''s over',
    'Full-service wedding planning, multi-event coordination, vendor management. Placeholder until the real planner roster is finalised.')
) AS c(cat_slug, idx, name_template, tagline, bio_extra)
ON CONFLICT (slug) WHERE slug IS NOT NULL DO NOTHING;

-- Assign every placeholder vendor to its category (parsed from the slug's
-- third '__'-separated segment — the format guarantees this is always the
-- bare category slug, even for hyphenated ones like decor-florals).
INSERT INTO vendor_category_assignments (vendor_id, category_id, is_primary)
SELECT v.id, vc.id, true
FROM vendors v
JOIN vendor_categories vc ON vc.slug = split_part(v.slug, '__', 3)
WHERE v.is_placeholder = true
  AND v.slug LIKE 'mg\_\_%' ESCAPE '\'
ON CONFLICT (vendor_id, category_id) DO NOTHING;
