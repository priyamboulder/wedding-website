-- ──────────────────────────────────────────────────────────────────────────
-- Migration 0035: Seed the Europe continent.
--
-- Date:  2026-05-01
-- Scope: Second continent seed for the Marigold Destination Explorer.
--        Europe — Lake Como, Tuscany, South of France, Spain, Greece.
--        Pattern is identical to 0024 (South Asia).
--
-- Adds:
--   • Data: rich overview / best_for / tips / tags on Lake Como, Spain,
--     Greece (already created by 0022) plus two new slugs — Tuscany and
--     South of France — that replace the generic `france` row from 0022
--     (deactivated below).
--   • Data: 4-5 regions per destination = ~22 region rows.
--   • Data: 7-8 experiences per destination = ~38 experience rows.
--   • Data: 5-6 real, named venues per destination = 29 venues with
--     "Venue" category assignments + per-vendor pricing indicators.
--     is_placeholder remains FALSE — these are researched, real
--     properties.
--   • Data: 3 placeholder vendors × 8 categories × 5 destinations = 120
--     placeholder rows. Each carries is_placeholder = TRUE; replace with
--     real vendor data via the import pipeline before going live.
--
-- Schema dependencies (already in place from 0024):
--   • vendors.is_placeholder column + idx_vendors_is_placeholder
--   • Unique constraints on budget_location_regions(location_id, name)
--     and budget_location_experiences(location_id, name)
--   • get_ranked_vendors(..., p_include_placeholders) — already filters
--     out placeholders by default
--
-- Note on `budget_locations.continent`:
--   We keep continent='Europe' here. lib/destinations/continents.ts maps
--   Europe → display slug 'europe' for the Tools surface.
--
-- This migration is idempotent — every INSERT uses ON CONFLICT.
-- ──────────────────────────────────────────────────────────────────────────


-- ══════════════════════════════════════════════════════════════════════════
-- PART A — Destinations.
--
-- Lake Como, Spain, and Greece exist from 0022 — UPSERT to fill in rich
-- editorial fields. Tuscany and South of France are new entries; the
-- generic `france` row from 0022 is superseded by `south-of-france` and
-- gets deactivated below.
-- ══════════════════════════════════════════════════════════════════════════

INSERT INTO budget_locations (
  type, continent, country, name, slug,
  multiplier, min_budget_usd, best_months, best_for,
  tagline, overview, tips, display_order, active
) VALUES
(
  'destination', 'Europe', 'Italy', 'Lake Como, Italy', 'lake-como',
  3.50, 500000, 'May–October',
  'the bride who''s been pinning villa balbianello since 2018',
  'where deepika and ranveer set the bar — for everyone forever',
  'Lake Como is the european wedding the algorithm wants you to have, and unlike most algorithm choices, it lives up to the hype. The Alps frame every drone shot. The villas were built by Italian nobility in centuries Indian families weren''t even doing destination weddings yet. Deepika and Ranveer''s 2018 wedding at Villa del Balbianello legitimized this whole category for South Asian families.

The Como wedding archetype: arrive by Riva motorboat, ceremony on a loggia overlooking the lake, sangeet at a different villa accessible only by water, baraat-by-boat instead of horse. Three days, three villas, six events, one absurd photo budget — and somehow it all looks effortless when it''s done.

The catch: Lake Como is genuinely one of the world''s most expensive destination wedding markets. Top villas cost €100K-€200K just for venue rental, and most don''t include catering. Indian-specific catering and vendor imports add 30-50% on top. Plan for $700K minimum if you want the version you''ve seen on instagram, $1M-2M+ if you want it actually to look like that.',
  'Book villas 18-24 months out for May-September peak. Villa del Balbianello caps capacity at ~150 (FAI national-trust property — this is non-negotiable). Most villa weddings run across multiple properties — Balbianello for ceremony, Balbiano or Pizzo for sangeet, Grand Hotel Tremezzo for guest accommodation. Boat logistics matter: book your taxi-boat fleet early. Indian catering must be flown in or sourced from Milan — the food alone is a full project.',
  200, true
),
(
  'destination', 'Europe', 'Italy', 'Tuscany, Italy', 'tuscany',
  2.80, 350000, 'May–June, September–October',
  'couples who chose lake como, then their planner showed them tuscany',
  'rolling hills, 16th-century stone, and zero of the como crowds',
  'Tuscany is the destination Lake Como brides discover when they ask "what else?" — and most of them switch. Cypress-lined drives. Renaissance hilltop towns. Wine estates that have been pouring chianti longer than the United States has existed. The infrastructure for Indian weddings here is newer than Como, but it''s catching up fast — and the cost gap is meaningful.

The Tuscany wedding model is different from Como. Instead of multi-villa boat logistics, you typically book one large estate (Castello di Vicarello, Borgo Santo Pietro, Villa Cetinale) and host the entire wedding there for 4-5 days. Estates often include accommodation for 30-60 guests on-site, which transforms guest experience — your immediate family wakes up at the same villa where the ceremony happens.

Best for couples who want the Italian villa fantasy without lake-side logistics, and who don''t need their wedding to be the most-recognizable spot on instagram.',
  'Florence (FLR) and Pisa (PSA) are your airports. Most Tuscan estates require 3+ night minimums in peak season. Olive harvest season (October) is photographically peak. Avoid August (Italians vacation, vendor availability tanks). Borgo Santo Pietro and Castello di Vicarello are the two most-asked-for properties — book 18 months out.',
  210, true
),
(
  'destination', 'Europe', 'France', 'South of France', 'south-of-france',
  3.20, 600000, 'May–June, September',
  'couples who want chic without going full italian',
  'lavender, riviera light, and a chateau your aunties will brag about',
  'The South of France is two distinct wedding markets pretending to be one. Provence is rural, romantic, lavender fields and 18th-century bastides — best for intimate weddings (80-150 guests). The Côte d''Azur is the glittering Mediterranean coast — Cap-Ferrat, Saint-Tropez, Cannes — where the venues are former Belle Époque palaces and the energy is unapologetically luxurious.

For Indian weddings, the Provence side gives you Château de Tourreau (18th-century estate with private chapel), Domaine de Fontenille (vineyard estate, 25 rooms), and a quiet, elegant version of the destination wedding. The Côte d''Azur side gives you Villa Ephrussi de Rothschild (Belle Époque pink palace, gardens overlooking the Med), Grand-Hôtel du Cap-Ferrat (Four Seasons), and Château de la Messardière in Saint-Tropez — properties where Vogue does shoots.

Indian wedding infrastructure here is built almost entirely by destination planners — there are fewer in-house Indian-wedding teams than in Italy. Plan for full vendor imports.',
  'Nice Côte d''Azur Airport (NCE) for Riviera, Marseille (MRS) for Provence. Avoid mid-July to mid-August (locals leave, prices peak, Saint-Tropez is unbearable). Villa Ephrussi de Rothschild is a public garden by day — events happen evenings only. Most chateaux require external catering, which is a feature for Indian weddings (you bring your own chefs).',
  220, true
),
(
  'destination', 'Europe', 'Spain', 'Spain', 'spain',
  2.00, 250000, 'May–June, September–October',
  'couples who want european glamour at half the como price',
  'marbella, mallorca, and the sound curfew that doesn''t exist',
  'Spain is the value play in European destination weddings — and one of the few markets where Indian-wedding infrastructure is genuinely robust. Marbella has Indian caterers, Indian DJs, and dedicated vendors who understand multi-day formats. Mallorca has the fincas and the sea views without the Lake Como markup. Barcelona has the design-forward urban wedding option no other European destination quite matches.

Three regional games to play:

MARBELLA (Costa del Sol) is the resort-and-villa belt. Marbella Club, Anantara Villa Padierna, Finca Cortesin. Glamorous, beachfront, and the most established Indian wedding scene in Spain.

MALLORCA is the boutique finca play — Finca Comassema in the Tramuntana mountains, St. Regis Mardavall on the cliffs. Smaller scale, more intimate, more design-led.

BARCELONA + CATALONIA gives you Castell Sant Marçal (13th-century castle), Masia Cabellut (private estate, no curfew), and the urban-catalan masia format that runs receptions until 3am.

Spain is also one of the few European markets with reliable late-night options — many fincas and estates have no sound curfew, which matters for weddings that won''t end at 11pm.',
  'Málaga (AGP) for Marbella, Palma (PMI) for Mallorca, Barcelona (BCN) for Catalonia. Indian caterers operate locally in all three — you don''t have to import everything. June and September are peak. Avoid July-August Marbella (Saudi tourist season, prices spike). Many estates require 3-night minimums.',
  230, true
),
(
  'destination', 'Europe', 'Greece', 'Greece', 'greece',
  2.00, 250000, 'May–June, September–October',
  'couples who want sunset photos that don''t need a filter',
  'white domes, blue water, and the cliffside mandap that broke pinterest',
  'Greece is the destination where the visual budget pays off the most per dollar. Santorini caldera sunsets aren''t an exaggeration — they''re the entire selling point of a wedding economy. Mykonos brings the Cycladic-architecture-meets-cosmopolitan-nightlife mix. The Athens Riviera offers serious-resort infrastructure with mainland convenience (no ferries, no domestic flights for guest blocks).

Three destinations, three different weddings:

SANTORINI is the visual icon. Cavo Ventus, Canaves Oia, Erosantorini — cliffside venues with caldera views. Caps out around 130-150 guests because the island physically can''t handle larger formats well. Best for couples whose wedding is about the photos.

MYKONOS is the party-luxury combination. Santa Marina, Kalesma, Cali Mykonos — beachfront and design-led, with capacity for 200-300 guest events. The energy is vibrant rather than romantic.

ATHENS RIVIERA is where larger-format weddings live. One&Only Aesthesis, Grand Resort Lagonissi, Four Seasons Astir Palace — these handle 300+ guest Indian weddings with full hotel infrastructure, no ferry logistics, and direct flights from anywhere.

Athens (ATH) is a direct flight from major international hubs. Santorini (JTR) and Mykonos (JMK) require either domestic flights or ferries from Athens — which is the main logistics consideration for guest blocks.',
  'May/June and September/October are sweet spots — July/August is unbearably hot and prices peak. Santorini: one event per day per venue is the rule, multi-day weddings span properties. Mykonos: book ferries 18 months out for guest blocks, or do helicopter transfers if budget allows. Athens Riviera is the smartest choice for 250+ guest events.',
  240, true
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

-- The generic `france` row from 0022 is superseded by `south-of-france`.
-- Deactivate rather than delete so any existing budget_user_plans
-- references stay intact.
UPDATE budget_locations SET active = false WHERE slug = 'france';

-- Match-tool tag arrays + soft capacity ceilings for the five Europe slugs.
-- Mirrors the per-slug tag conventions from 0023.
UPDATE budget_locations bl SET
  tags         = v.tags,
  max_capacity = v.cap
FROM (VALUES
  ('lake-como',
    '["scenic_beauty","exclusivity","heritage","european","mountain","long_haul_from_us"]'::jsonb,
    300),
  ('tuscany',
    '["heritage","scenic_beauty","european","food_scene","exclusivity","long_haul_from_us"]'::jsonb,
    250),
  ('south-of-france',
    '["heritage","exclusivity","european","food_scene","scenic_beauty","beach","long_haul_from_us"]'::jsonb,
    300),
  ('spain',
    '["european","scenic_beauty","food_scene","beach","nightlife","long_haul_from_us"]'::jsonb,
    500),
  ('greece',
    '["scenic_beauty","beach","european","exclusivity","long_haul_from_us"]'::jsonb,
    800)
) AS v(slug, tags, cap)
WHERE bl.slug = v.slug;


-- ══════════════════════════════════════════════════════════════════════════
-- PART C — Regions per destination.
-- ══════════════════════════════════════════════════════════════════════════

INSERT INTO budget_location_regions (location_id, name, description, display_order)
SELECT bl.id, r.name, r.description, r.display_order
FROM budget_locations bl
JOIN (VALUES
  -- Lake Como
  ('lake-como', 'Tremezzina (Western Shore)',
    'Villa Balbiano, Villa del Balbianello, Grand Hotel Tremezzo — the photographed-most-often stretch', 10),
  ('lake-como', 'Cernobbio (Southern Shore)',
    'Villa d''Este, Villa Pizzo, Villa Erba — the heritage-hotel cluster closest to Como city', 20),
  ('lake-como', 'Bellagio (Lake''s Crown)',
    'Villa Serbelloni and the small-villa cluster on the peninsula', 30),
  ('lake-como', 'Eastern Shore (Torno, Blevio)',
    'Villa Pliniana, Mandarin Oriental — the quieter side, often boat-only access', 40),
  ('lake-como', 'Como City & Brunate',
    'guest accommodation, restaurant nights, funicular-up-to-Brunate photo ops', 50),

  -- Tuscany
  ('tuscany', 'Chianti Classico (Florence-Siena Belt)',
    'wine estates, hilltop borghi, Villa Mangiacane region', 10),
  ('tuscany', 'Val d''Orcia (South-Central Tuscany)',
    'the iconic cypress-tree drives, Pienza, Montalcino — Borgo Santo Pietro region', 20),
  ('tuscany', 'Maremma (Southern Coast)',
    'Castello di Vicarello, the rural Maremma — least-touristed area, best food', 30),
  ('tuscany', 'Around Siena',
    'Villa Cetinale, Castello di Casole — closest to Siena''s medieval city for guest activities', 40),

  -- South of France
  ('south-of-france', 'Cap-Ferrat & the Riviera Coast',
    'Villa Ephrussi, Grand-Hôtel du Cap-Ferrat, Cap d''Antibes — the iconic Belle Époque coast', 10),
  ('south-of-france', 'Saint-Tropez & Pampelonne',
    'Château de la Messardière, beach-club receptions, the Saint-Tropez circuit', 20),
  ('south-of-france', 'Provence (Luberon, Aix, Sarrians)',
    'Château de Tourreau, the lavender-fields-and-bastide belt', 30),
  ('south-of-france', 'Cassis & Bandol',
    'Domaine de Canaille, the Calanques, the lesser-known Mediterranean coast option', 40),
  ('south-of-france', 'Cannes & La Napoule',
    'Château de la Napoule, the festival-town guest infrastructure', 50),

  -- Spain
  ('spain', 'Marbella & Costa del Sol',
    'Marbella Club, Villa Padierna, Finca Cortesin — the Indian wedding heartland of Spain', 10),
  ('spain', 'Mallorca (Tramuntana & Coast)',
    'Finca Comassema, St. Regis Mardavall — the boutique-finca-and-cliffside-resort island', 20),
  ('spain', 'Barcelona & Catalonia',
    'Castell Sant Marçal, Masia Cabellut — the design-forward urban-and-castle option', 30),
  ('spain', 'Ibiza',
    'the cliffside-and-beach-club option for younger, party-focused weddings', 40),
  ('spain', 'Seville & Andalusia',
    'Hotel Alfonso XIII, Andalusian heritage estates — the heritage-architecture play', 50),

  -- Greece
  ('greece', 'Santorini (Caldera Edge)',
    'Cavo Ventus, Canaves Oia, Erosantorini — the most-photographed wedding island on earth', 10),
  ('greece', 'Mykonos',
    'Santa Marina, Kalesma, Cali Mykonos — the design-and-party island', 20),
  ('greece', 'Athens Riviera',
    'One&Only Aesthesis, Grand Resort Lagonissi — the large-format, mainland-access option', 30),
  ('greece', 'Crete',
    'Blue Palace, Royal Blue Resort — the largest island, less touristy, more space', 40),
  ('greece', 'Corfu & Ionian Coast',
    'the lush green island for couples avoiding cycladic crowds', 50)
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
  -- Lake Como
  ('lake-como', 'Riva Boat Procession Across the Lake', '🛥️',
    'the baraat arrival every drone shot was made for', 'Cultural',         10),
  ('lake-como', 'Franciacorta Vineyard Welcome Lunch', '🍷',
    'italy''s answer to champagne, an hour from the lake', 'Food',          20),
  ('lake-como', 'Private Como Opera Performance', '🎭',
    'the sangeet move nobody else does, in italy', 'Entertainment',         30),
  ('lake-como', 'Lake Como Speedboat Day for Guests', '🚤',
    'the day-after guest experience that becomes the favorite memory', 'Adventure', 40),
  ('lake-como', 'Cooking Class with Italian Nonna', '🍝',
    'guest activity for the rest day between sangeet and ceremony', 'Food', 50),
  ('lake-como', 'Bellagio Hilltop Pre-Wedding Shoot', '📸',
    'the village-and-lake photography session', 'Cultural',                 60),
  ('lake-como', 'Aperitivo at Harry''s Bar (Cernobbio)', '🍸',
    'the legacy-cocktail-hour move', 'Entertainment',                       70),
  ('lake-como', 'Sunrise Photo Cruise', '🌅',
    'the morning-after couple shoot on the empty lake', 'Adventure',        80),

  -- Tuscany
  ('tuscany', 'Private Wine Estate Tasting', '🍷',
    'guest activity built into the wedding weekend', 'Food',                10),
  ('tuscany', 'Pasta-Making Class with Onsite Chefs', '🍝',
    'the rest-day guest experience that doubles as photography', 'Food',    20),
  ('tuscany', 'Vespa Tour Through Chianti', '🌅',
    'the bachelor-party-day alternative', 'Adventure',                      30),
  ('tuscany', 'Tuscan Folk Music Performance', '🎶',
    'the haldi background music option', 'Entertainment',                   40),
  ('tuscany', 'Pienza Cypress-Drive Pre-Wedding Shoot', '📸',
    'the iconic tuscan-photography location', 'Cultural',                   50),
  ('tuscany', 'Local Truffle Hunting Experience', '🥖',
    'the fall-wedding guest activity', 'Food',                              60),
  ('tuscany', 'San Gimignano Heritage Walk', '🛕',
    'the medieval-town day trip for older guests', 'Cultural',              70),
  ('tuscany', 'Private Spa Day at Onsite Wellness Center', '💆',
    'pre-wedding bridal-party ritual', 'Wellness',                          80),

  -- South of France
  ('south-of-france', 'Yacht Day from Cannes to Saint-Tropez', '🛥️',
    'the riviera day-after activity', 'Adventure',                          10),
  ('south-of-france', 'Provence Vineyard Tour & Tasting', '🍷',
    'guest activity in the rural-provence belt', 'Food',                    20),
  ('south-of-france', 'Lavender Field Pre-Wedding Shoot', '💜',
    'the june-only iconic provence photography location', 'Cultural',       30),
  ('south-of-france', 'Michelin-Star Welcome Dinner', '🍽️',
    'the rehearsal-dinner alternative on the riviera', 'Food',              40),
  ('south-of-france', 'String Quartet Reception Music', '🎶',
    'the cocktail-hour-meets-pheras soundtrack', 'Entertainment',           50),
  ('south-of-france', 'Cap-Ferrat Coastal Drive', '🚗',
    'the bridal party morning-of photography route', 'Adventure',           60),
  ('south-of-france', 'Côte d''Azur Modern Art Tour', '🎨',
    'the day-trip for guests who don''t want another beach', 'Cultural',    70),
  ('south-of-france', 'Provençal Flower Market Experience', '💐',
    'the bridal-party aix-en-provence morning', 'Cultural',                 80),

  -- Spain
  ('spain', 'Andalusian Equestrian Show', '🐎',
    'the marbella sangeet setpiece', 'Entertainment',                       10),
  ('spain', 'Tapas Crawl Welcome Night', '🍤',
    'the rehearsal-dinner alternative in barcelona or marbella', 'Food',    20),
  ('spain', 'Flamenco Performance at Sangeet', '💃',
    'the spain-specific cultural setpiece', 'Entertainment',                30),
  ('spain', 'Mallorca Yacht Day', '🛥️',
    'the day-after guest activity on the islands', 'Adventure',             40),
  ('spain', 'La Rioja Wine Tour', '🍷',
    'for couples extending into a regional honeymoon', 'Food',              50),
  ('spain', 'Ibiza Sunset Beach Club', '🌅',
    'the bachelor-party alternative', 'Entertainment',                      60),
  ('spain', 'Park Güell Pre-Wedding Shoot', '📸',
    'the barcelona-photography location', 'Cultural',                       70),
  ('spain', 'Alhambra Heritage Tour', '🏰',
    'the seville/granada day trip', 'Cultural',                             80),

  -- Greece
  ('greece', 'Caldera Catamaran Sunset Cruise', '🛥️',
    'the santorini-defining experience', 'Adventure',                       10),
  ('greece', 'Acropolis Private Tour', '🏛️',
    'the athens-arrival cultural setpiece', 'Cultural',                     20),
  ('greece', 'Greek Folk Dance Performance', '💃',
    'the sangeet setpiece option in greece', 'Entertainment',               30),
  ('greece', 'Santorini Winery Tour', '🍇',
    'the day-after guest activity in the caldera', 'Food',                  40),
  ('greece', 'Seafood Mezedes Welcome Dinner', '🐙',
    'the rehearsal-dinner alternative', 'Food',                             50),
  ('greece', 'Oia Sunset Photography Walk', '🌅',
    'the most-photographed sunset in the world', 'Cultural',                60),
  ('greece', 'Mykonos Beach Horseback Ride', '🐎',
    'the unconventional guest activity', 'Adventure',                       70),
  ('greece', 'Bouzouki Live Music Reception', '🎶',
    'the greek-meets-bollywood reception soundtrack', 'Entertainment',      80)
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
-- Researched, named properties. is_placeholder stays FALSE. Each is
-- assigned to the canonical "Venue" category and gets a (price_low_usd,
-- price_high_usd) indicator that powers the "from $X" pricing band.
-- ══════════════════════════════════════════════════════════════════════════

INSERT INTO vendors (
  slug, name, tagline, bio,
  home_base_city, home_base_country,
  travels_globally, destinations_served, tier_match,
  capacity_min, capacity_max,
  active, verified, is_placeholder, placement_tier
) VALUES
-- Lake Como
('villa-del-balbianello',
 'Villa del Balbianello',
 'the FAI villa where deepika married ranveer',
 '18th-century villa on the wooded peninsula of Lavedo, owned by the FAI (Italy''s national trust). Loggia Durini ceremony space (60 guests), terraces, terraced gardens. Capacity capped at ~150 by trust rules — the constraint is the point. Used by Star Wars Episode II for the Naboo lake retreat. The most photographed villa on the lake.',
 'Tremezzina', 'Italy',
 false, '["lake-como"]'::jsonb, '["luxury","ultra"]'::jsonb,
 60, 150, true, true, false, 'standard'),
('villa-balbiano',
 'Villa Balbiano',
 'the gucci-film villa — Renaissance bones, editorial lighting',
 'Western shore of Lake Como, 16th-century villa owned by Italian nobility. Six luxury suites in the main palazzo, additional bedrooms in adjacent buildings (sleeps ~28 onsite). Lakeside gardens, private ballroom, antique-art interiors. Used as a film location for Gucci''s House of Gucci. The design-forward bride''s choice.',
 'Ossuccio', 'Italy',
 false, '["lake-como"]'::jsonb, '["luxury","ultra"]'::jsonb,
 80, 200, true, true, false, 'standard'),
('villa-deste-cernobbio',
 'Villa d''Este, Cernobbio',
 'the iconic 16th-century palace turned 5-star, with the famous floating pool',
 '152 rooms across the Cardinal Building (125), Queen''s Pavilion (27), and four private villas. Magnificent gardens with the iconic amphitheatre backdrop. Hosts up to 200 guests for ceremonies in the gardens. Combines villa-grandeur with full hotel-service infrastructure — the best choice when you want guests to stay where they marry.',
 'Cernobbio', 'Italy',
 false, '["lake-como"]'::jsonb, '["luxury","ultra"]'::jsonb,
 100, 200, true, true, false, 'standard'),
('grand-hotel-tremezzo',
 'Grand Hotel Tremezzo',
 'the lake''s most recognizable hotel — and the easiest accommodation play',
 '1910 grand hotel directly on Lake Como with the iconic floating pool. 90 rooms and suites, multiple restaurants, full destination-wedding infrastructure. Best as guest-accommodation hub paired with one of the private-villa ceremony venues — many Como weddings book Tremezzo for guest stays and use it for sangeet/welcome dinner.',
 'Tremezzo', 'Italy',
 false, '["lake-como"]'::jsonb, '["luxury","ultra"]'::jsonb,
 100, 250, true, true, false, 'standard'),
('villa-pliniana',
 'Villa Pliniana',
 'the private estate where the wedding becomes its own world',
 '16th-century villa accessible only by boat or private road, with a famous waterfall in the central courtyard. Full property buyouts only — your wedding has the entire estate. Sleeps ~40 onsite across 18 suites. Best for multi-day, fully-immersive weddings of under 200 guests.',
 'Torno', 'Italy',
 false, '["lake-como"]'::jsonb, '["luxury","ultra"]'::jsonb,
 80, 200, true, true, false, 'standard'),
('mandarin-oriental-lake-como',
 'Mandarin Oriental Lake Como',
 'the modern luxury option — for couples who want a hotel team running everything',
 '73 rooms and 2 private villas across a sun-drenched property on the eastern shore. Villa del Lago, Greenhouse, and Amphitheatre event venues. Newer addition to the lake''s wedding circuit but with full Mandarin-Oriental service infrastructure. Best when production scale matters more than heritage credentials.',
 'Blevio', 'Italy',
 false, '["lake-como"]'::jsonb, '["luxury","ultra"]'::jsonb,
 100, 250, true, true, false, 'standard'),

-- Tuscany
('borgo-santo-pietro',
 'Borgo Santo Pietro',
 'the 13th-century borgo with the working farm and 8 dining experiences',
 'Restored 13th-century village in the Tuscan countryside south of Siena. 20 suites and villas across 300 acres. Working organic farm, multiple restaurants (one Michelin-starred), spa, chapel. Hosts intimate weddings of 60-150 guests with full property buyout option. Considered the gold-standard Tuscan estate wedding venue.',
 'Chiusdino', 'Italy',
 false, '["tuscany"]'::jsonb, '["luxury","ultra"]'::jsonb,
 60, 150, true, true, false, 'standard'),
('castello-di-vicarello',
 'Castello di Vicarello',
 'the family-owned castle in the maremma — and the chef-led food program',
 '12th-century castle in the Maremma region, family-owned and run with deep emphasis on food. Seven suites onsite, plus extensive event spaces. Best for under-100-guest weddings that want genuine-Italian intimacy over palace scale.',
 'Cinigiano', 'Italy',
 false, '["tuscany"]'::jsonb, '["luxury","ultra"]'::jsonb,
 50, 120, true, true, false, 'standard'),
('villa-cetinale',
 'Villa Cetinale',
 'the 17th-century baroque villa with the boxwood garden',
 'Outside Siena, 17th-century baroque villa surrounded by formal gardens and woodland. Sleeps 30 onsite plus extensive event spaces. Hosted multiple high-profile weddings. Best for elegant 100-200 guest celebrations with strong garden-photography focus.',
 'Sovicille', 'Italy',
 false, '["tuscany"]'::jsonb, '["luxury","ultra"]'::jsonb,
 80, 200, true, true, false, 'standard'),
('castello-di-casole-belmond',
 'Castello di Casole, A Belmond Hotel',
 'the 1,700-acre belmond estate — with hotel infrastructure',
 '39-room Belmond resort spread across 1,700 acres of Tuscan countryside between Florence and Siena. Full hotel-service wedding infrastructure plus private estate scale. Best for guests-stay-onsite weddings of 100-200 guests.',
 'Casole d''Elsa', 'Italy',
 false, '["tuscany"]'::jsonb, '["luxury","ultra"]'::jsonb,
 80, 250, true, true, false, 'standard'),
('villa-mangiacane',
 'Villa Mangiacane',
 'the chianti hills villa — with views of florence on a clear day',
 '16th-century villa in the Chianti Classico region, 25 rooms. Frescoed interiors, sculpture garden, vineyards on property. Best for design-forward Tuscan weddings where wine and views matter as much as scale.',
 'San Casciano', 'Italy',
 false, '["tuscany"]'::jsonb, '["luxury","ultra"]'::jsonb,
 80, 200, true, true, false, 'standard'),

-- South of France
('villa-ephrussi-de-rothschild',
 'Villa Ephrussi de Rothschild',
 'the pink belle époque palace overlooking the mediterranean',
 '1907 Belle Époque mansion on Cap-Ferrat with nine themed gardens and panoramic Mediterranean views. Public museum by day, evening events only. Up to 300 guests for outdoor ceremonies. One of the most photographed wedding venues on the entire Riviera.',
 'Saint-Jean-Cap-Ferrat', 'France',
 false, '["south-of-france"]'::jsonb, '["luxury","ultra"]'::jsonb,
 100, 300, true, true, false, 'standard'),
('grand-hotel-cap-ferrat',
 'Grand-Hôtel du Cap-Ferrat, A Four Seasons Hotel',
 'the four seasons palace at the tip of cap-ferrat',
 '1908-built grand hotel on Cap-Ferrat peninsula, 73 rooms and suites plus a private villa. Belle Epoque ballroom seats 300, crystal terrace ceremony space overlooks the Mediterranean. Award-winning spa, multiple restaurants. The flagship Riviera hotel-wedding venue.',
 'Saint-Jean-Cap-Ferrat', 'France',
 false, '["south-of-france"]'::jsonb, '["luxury","ultra"]'::jsonb,
 100, 300, true, true, false, 'standard'),
('chateau-de-la-messardiere',
 'Château de la Messardière',
 'the saint-tropez chateau resort with private beach access',
 '19th-century château turned high-end resort in the hills of Saint-Tropez. 86 rooms and suites overlooking Pampelonne Bay. Private beach club, swimming pool, onsite spa. Best for 150-250 guest weddings with strong Saint-Tropez branding requirements.',
 'Saint-Tropez', 'France',
 false, '["south-of-france"]'::jsonb, '["luxury","ultra"]'::jsonb,
 100, 250, true, true, false, 'standard'),
('chateau-de-tourreau',
 'Château de Tourreau',
 'the 18th-century estate in provence — with the private chapel',
 '18th-century Provençal estate near Sarrians, 20-acre grounds with private chapel, luxury suites, and exclusive wedding facilities. Sleeps ~40 onsite. Best for intimate, design-led Provence weddings under 150 guests.',
 'Sarrians', 'France',
 false, '["south-of-france"]'::jsonb, '["luxury","ultra"]'::jsonb,
 60, 150, true, true, false, 'standard'),
('chateau-de-la-napoule',
 'Château de la Napoule',
 'the seaside neo-medieval fortress between cannes and saint-tropez',
 'Restored 14th-century castle on the coast near Cannes, rebuilt by American artist Henry Clews in 1918. Historic gardens, seaside location, exclusive wedding hire. Best for 100-200 guest Riviera weddings that want fortress-aesthetic over hotel-luxury.',
 'Mandelieu-la-Napoule', 'France',
 false, '["south-of-france"]'::jsonb, '["luxury","ultra"]'::jsonb,
 80, 200, true, true, false, 'standard'),
('domaine-de-canaille',
 'Domaine de Canaille',
 'the 60-hectare cliffside estate with private beach access',
 '60-hectare private estate on the Côte d''Azur with panoramic Mediterranean views and a private path to the beach. 12 onsite rooms (24 guests). Large terrace, pool, direct beach access. Best for intimate but high-impact 80-150 guest weddings with strong sea setting requirements.',
 'Cassis', 'France',
 false, '["south-of-france"]'::jsonb, '["luxury","ultra"]'::jsonb,
 60, 150, true, true, false, 'standard'),

-- Spain
('marbella-club-hotel',
 'Marbella Club Hotel',
 'the golden mile flagship — and the most-recognized indian wedding venue in spain',
 'Five-star resort on Marbella''s Golden Mile, subtropical gardens with Mediterranean views. Elegant outdoor ceremony spaces, beachfront reception venues, onsite luxury villas for guests. Best for 200-400 guest Marbella weddings with full Indian-wedding catering support from Málaga.',
 'Marbella', 'Spain',
 false, '["spain"]'::jsonb, '["luxury","ultra"]'::jsonb,
 150, 400, true, true, false, 'standard'),
('anantara-villa-padierna',
 'Anantara Villa Padierna Palace Hotel',
 'the marbella palace-resort with the marble ballroom and golf views',
 'Mediterranean palace-style resort outside Marbella, marble-clad ballroom, formal gardens, golf course views. Indian-wedding infrastructure built out — they handle multiple Indian weddings per year. Best for grand 250-400 guest events.',
 'Estepona', 'Spain',
 false, '["spain"]'::jsonb, '["luxury","ultra"]'::jsonb,
 200, 500, true, true, false, 'standard'),
('castell-sant-marcal',
 'Castell Sant Marçal',
 'the 13th-century castle 20 minutes from barcelona',
 '13th-century castle near Barcelona with restored heritage interiors and terraced gardens. Single-event-per-day rule ensures full privacy. Restored wine cellar for intimate gatherings, gardens for outdoor ceremonies. Best for 100-200 guest Catalan weddings with castle-aesthetic priorities.',
 'Cerdanyola del Vallès', 'Spain',
 false, '["spain"]'::jsonb, '["luxury"]'::jsonb,
 80, 200, true, true, false, 'standard'),
('finca-comassema-mallorca',
 'Finca Comassema, Mallorca',
 'the tramuntana mountain finca — with the courtyard mandap nobody else has',
 'Historic manor house in Mallorca''s Orient Valley, surrounded by the Tramuntana mountains. Open-air terraces, traditional Mallorcan architecture, panoramic mountain views. Best for 100-180 guest Mallorca weddings with strong outdoor-ceremony emphasis.',
 'Bunyola', 'Spain',
 false, '["spain"]'::jsonb, '["luxury"]'::jsonb,
 80, 180, true, true, false, 'standard'),
('st-regis-mardavall-mallorca',
 'St. Regis Mardavall Mallorca',
 'the cliffside ultra-luxury resort with mediterranean drama',
 'Ultra-luxury clifftop resort with dramatic Mediterranean views, modern elegance, multiple event spaces. Hotel infrastructure plus private-resort scale. Best for 200-400 guest Mallorca weddings with high-production needs.',
 'Calvia', 'Spain',
 false, '["spain"]'::jsonb, '["luxury","ultra"]'::jsonb,
 150, 400, true, true, false, 'standard'),
('finca-cortesin',
 'Finca Cortesin',
 'the costa del sol estate with andalusian-architecture and golf course',
 '215-hectare estate between Marbella and Sotogrande with Andalusian-style architecture, full resort infrastructure, and dedicated event spaces. Hosted Solheim Cup and high-profile weddings. Best for 200-500 guest events with luxury-resort amenities.',
 'Casares', 'Spain',
 false, '["spain"]'::jsonb, '["luxury","ultra"]'::jsonb,
 200, 500, true, true, false, 'standard'),

-- Greece
('cavo-ventus-santorini',
 'Cavo Ventus, Santorini',
 'the caldera-edge villa with the personal bar level',
 'Built on the edge of the Santorini caldera with private, beautifully designed grounds. Hosts up to 130 guests across spacious terraces. Separate level with personal bar for late-night dancing. Best for 100-130 guest Santorini weddings that want privacy plus the iconic sunset shot.',
 'Pyrgos', 'Greece',
 false, '["greece"]'::jsonb, '["luxury","ultra"]'::jsonb,
 60, 130, true, true, false, 'standard'),
('canaves-oia-hotel',
 'Canaves Oia Hotel',
 'the oia hotel with the postcard caldera view',
 'Cliffside hotel in Oia with iconic caldera and sunset views. Multiple suite categories with private plunge pools, infinity pools, and terraces. Best as both ceremony venue and accommodation hub for intimate 60-100 guest Santorini weddings.',
 'Oia, Santorini', 'Greece',
 false, '["greece"]'::jsonb, '["luxury","ultra"]'::jsonb,
 50, 120, true, true, false, 'standard'),
('santa-marina-mykonos',
 'Santa Marina, A Luxury Collection Resort, Mykonos',
 'the mykonos peninsula resort with private beaches and the buddha-bar',
 'Luxury resort on a private peninsula in Mykonos with pristine sandy beaches. Whitewashed stone wedding chapel, beach lounge, poolside terraces. Onsite Buddha-Bar venue for after-party energy. Best for 150-300 guest Mykonos weddings.',
 'Ornos, Mykonos', 'Greece',
 false, '["greece"]'::jsonb, '["luxury","ultra"]'::jsonb,
 100, 300, true, true, false, 'standard'),
('kalesma-mykonos',
 'Kalesma Mykonos',
 'the boutique cycladic-meets-modern hotel — and the chapel of agios dimitrios',
 'Boutique luxury hotel on Mykonos blending traditional Cycladic architecture with contemporary design. Sunlit terraces capture iconic Mykonos light. Onsite chapel of Agios Dimitrios for ceremonies. Best for 100-200 guest design-led Mykonos weddings.',
 'Mykonos', 'Greece',
 false, '["greece"]'::jsonb, '["luxury","ultra"]'::jsonb,
 80, 200, true, true, false, 'standard'),
('one-and-only-aesthesis',
 'One&Only Aesthesis, Athens Riviera',
 'the athens riviera ultra-luxury — without the ferry logistics',
 'Ultra-luxury One&Only resort set within 21 hectares of protected forest on the Athens Riviera. Multiple ballrooms, verandas, secluded retreats, private villas. Direct flight access via Athens (ATH). Best for 250-500 guest weddings that need scale without island-logistics complications.',
 'Athens', 'Greece',
 false, '["greece"]'::jsonb, '["luxury","ultra"]'::jsonb,
 150, 500, true, true, false, 'standard'),
('grand-resort-lagonissi',
 'Grand Resort Lagonissi, Athens Riviera',
 'the athens riviera resort with private bungalows and beach',
 '300-villa-and-bungalow resort on a private peninsula 40 minutes from Athens. Multiple ballrooms, beachfront ceremony venues, full hotel infrastructure for international guest blocks. Best for 300+ guest Indian weddings on the Athens Riviera.',
 'Lagonissi', 'Greece',
 false, '["greece"]'::jsonb, '["elevated","luxury"]'::jsonb,
 200, 800, true, true, false, 'standard')
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

-- Assign every real venue above to the canonical "Venue" category.
INSERT INTO vendor_category_assignments (vendor_id, category_id, is_primary)
SELECT v.id, vc.id, true
FROM vendors v
JOIN vendor_categories vc ON vc.slug = 'venue'
WHERE v.slug IN (
  'villa-del-balbianello','villa-balbiano','villa-deste-cernobbio','grand-hotel-tremezzo','villa-pliniana','mandarin-oriental-lake-como',
  'borgo-santo-pietro','castello-di-vicarello','villa-cetinale','castello-di-casole-belmond','villa-mangiacane',
  'villa-ephrussi-de-rothschild','grand-hotel-cap-ferrat','chateau-de-la-messardiere','chateau-de-tourreau','chateau-de-la-napoule','domaine-de-canaille',
  'marbella-club-hotel','anantara-villa-padierna','castell-sant-marcal','finca-comassema-mallorca','st-regis-mardavall-mallorca','finca-cortesin',
  'cavo-ventus-santorini','canaves-oia-hotel','santa-marina-mykonos','kalesma-mykonos','one-and-only-aesthesis','grand-resort-lagonissi'
)
ON CONFLICT (vendor_id, category_id) DO NOTHING;

-- Per-venue pricing indicators against the Venue category.
INSERT INTO vendor_pricing_indicators (vendor_id, category_id, price_low_usd, price_high_usd, price_unit, notes)
SELECT v.id, vc.id, p.lo, p.hi, 'package'::vendor_pricing_unit, ''
FROM vendors v
JOIN vendor_categories vc ON vc.slug = 'venue'
JOIN (VALUES
  -- Lake Como
  ('villa-del-balbianello',          800000,  2000000),
  ('villa-balbiano',                 700000,  1800000),
  ('villa-deste-cernobbio',          600000,  1500000),
  ('grand-hotel-tremezzo',           400000,  1000000),
  ('villa-pliniana',                 750000,  1800000),
  ('mandarin-oriental-lake-como',    500000,  1200000),
  -- Tuscany
  ('borgo-santo-pietro',             400000,  1000000),
  ('castello-di-vicarello',          300000,   700000),
  ('villa-cetinale',                 350000,   800000),
  ('castello-di-casole-belmond',     350000,   900000),
  ('villa-mangiacane',               280000,   700000),
  -- South of France
  ('villa-ephrussi-de-rothschild',   600000,  1500000),
  ('grand-hotel-cap-ferrat',         700000,  1800000),
  ('chateau-de-la-messardiere',      500000,  1300000),
  ('chateau-de-tourreau',            250000,   700000),
  ('chateau-de-la-napoule',          300000,   800000),
  ('domaine-de-canaille',            280000,   700000),
  -- Spain
  ('marbella-club-hotel',            250000,   700000),
  ('anantara-villa-padierna',        200000,   600000),
  ('castell-sant-marcal',            180000,   450000),
  ('finca-comassema-mallorca',       180000,   450000),
  ('st-regis-mardavall-mallorca',    250000,   650000),
  ('finca-cortesin',                 280000,   750000),
  -- Greece
  ('cavo-ventus-santorini',          200000,   500000),
  ('canaves-oia-hotel',              180000,   450000),
  ('santa-marina-mykonos',           250000,   600000),
  ('kalesma-mykonos',                200000,   500000),
  ('one-and-only-aesthesis',         350000,   900000),
  ('grand-resort-lagonissi',         250000,   600000)
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
--   recovers the category slug cleanly even when it contains hyphens.
--
-- 3 placeholders × 8 categories × 5 destinations = 120 rows.
--
-- Note on European venue catering: most European villas/chateaux require
-- external catering, and Indian-specialty mehndi/glam/DJ talent is
-- typically flown from London, Milan, or local Indian-specialty
-- providers. Bios reflect that.
-- ══════════════════════════════════════════════════════════════════════════

INSERT INTO vendors (
  slug, name, tagline, bio,
  home_base_city, home_base_country,
  travels_globally, destinations_served, tier_match,
  active, verified, is_placeholder, placement_tier
)
SELECT
  'mg__' || d.dest_slug || '__' || c.cat_slug || '__' || c.idx::text  AS slug,
  replace(c.name_template, '{region}', d.brand_suffix)                AS name,
  c.tagline                                                           AS tagline,
  c.bio_extra                                                         AS bio,
  d.home_city                                                         AS home_base_city,
  d.country                                                           AS home_base_country,
  false                                                               AS travels_globally,
  jsonb_build_array(d.dest_slug)                                      AS destinations_served,
  '["elevated","luxury","ultra"]'::jsonb                              AS tier_match,
  true                                                                AS active,
  false                                                               AS verified,
  true                                                                AS is_placeholder,
  'standard'::vendor_placement_tier                                   AS placement_tier
FROM (VALUES
  ('lake-como',       'Lake Como',   'Como',                  'Italy'),
  ('tuscany',         'Tuscany',     'Florence',              'Italy'),
  ('south-of-france', 'the Riviera', 'Nice',                  'France'),
  ('spain',           'Marbella',    'Marbella',              'Spain'),
  ('greece',          'Mykonos',     'Mykonos',               'Greece')
) AS d(dest_slug, brand_suffix, home_city, country)
CROSS JOIN (VALUES
  -- (cat_slug, idx, name_template, tagline, bio_extra)
  -- Photography ──────────────────────────────────────────────────────────
  ('photography', 1, 'studio marigold — {region}',
    'wedding films that look like vogue editorials',
    'Editorial-led wedding photography for European destination weddings. Most premium Indian-wedding photographers travel from London, Milan, or Mumbai for these markets. Placeholder roster — real photographers will be imported from the Marigold vendor pipeline.'),
  ('photography', 2, 'saffron lens — {region}',
    'wedding films that look like vogue editorials',
    'Editorial-led wedding photography for European destination weddings. Most premium Indian-wedding photographers travel from London, Milan, or Mumbai for these markets. Placeholder roster — real photographers will be imported from the Marigold vendor pipeline.'),
  ('photography', 3, 'house of marigold — {region}',
    'wedding films that look like vogue editorials',
    'Editorial-led wedding photography for European destination weddings. Most premium Indian-wedding photographers travel from London, Milan, or Mumbai for these markets. Placeholder roster — real photographers will be imported from the Marigold vendor pipeline.'),
  -- Videography ──────────────────────────────────────────────────────────
  ('videography', 1, 'celluloid marigold — {region}',
    'the boat-shot drone reel your sister will use as a screensaver',
    'Cinematic wedding films, multi-cam with drone coverage. European destination weddings typically import the videography team alongside photographers — same crew, two cameras. Placeholder until the real videography roster is published.'),
  ('videography', 2, 'the {region} reel co.',
    'the boat-shot drone reel your sister will use as a screensaver',
    'Cinematic wedding films, multi-cam with drone coverage. European destination weddings typically import the videography team alongside photographers — same crew, two cameras. Placeholder until the real videography roster is published.'),
  ('videography', 3, 'kalakaar films — {region}',
    'the boat-shot drone reel your sister will use as a screensaver',
    'Cinematic wedding films, multi-cam with drone coverage. European destination weddings typically import the videography team alongside photographers — same crew, two cameras. Placeholder until the real videography roster is published.'),
  -- Decor & Florals ──────────────────────────────────────────────────────
  ('decor-florals', 1, 'petal & plinth — {region}',
    'florals that hold up in mediterranean wind, designed for instagram',
    'Decor and floral design across mandap, sangeet, and reception. European villa weddings typically combine local florists with imported Indian design leads (Mumbai/Delhi-based) for mandap construction. Placeholder until the real decor partners are confirmed and listed.'),
  ('decor-florals', 2, 'the {region} floral studio',
    'florals that hold up in mediterranean wind, designed for instagram',
    'Decor and floral design across mandap, sangeet, and reception. European villa weddings typically combine local florists with imported Indian design leads (Mumbai/Delhi-based) for mandap construction. Placeholder until the real decor partners are confirmed and listed.'),
  ('decor-florals', 3, 'gulmohar atelier — {region}',
    'florals that hold up in mediterranean wind, designed for instagram',
    'Decor and floral design across mandap, sangeet, and reception. European villa weddings typically combine local florists with imported Indian design leads (Mumbai/Delhi-based) for mandap construction. Placeholder until the real decor partners are confirmed and listed.'),
  -- Catering ─────────────────────────────────────────────────────────────
  ('catering', 1, 'the {region} plate co.',
    'the chef who finally got biryani right at scale',
    'External Indian catering for European destination weddings. Most European villas and chateaux require external catering — Indian wedding caterers are typically flown in from London (UK-based Indian catering companies handle most of Lake Como, Tuscany, and South of France) or sourced from Milan and Marbella for Italy/Spain markets respectively. Placeholder entry.'),
  ('catering', 2, 'thali atelier — {region}',
    'the chef who finally got biryani right at scale',
    'External Indian catering for European destination weddings. Most European villas and chateaux require external catering — Indian wedding caterers are typically flown in from London (UK-based Indian catering companies handle most of Lake Como, Tuscany, and South of France) or sourced from Milan and Marbella for Italy/Spain markets respectively. Placeholder entry.'),
  ('catering', 3, 'the saffron table — {region}',
    'the chef who finally got biryani right at scale',
    'External Indian catering for European destination weddings. Most European villas and chateaux require external catering — Indian wedding caterers are typically flown in from London (UK-based Indian catering companies handle most of Lake Como, Tuscany, and South of France) or sourced from Milan and Marbella for Italy/Spain markets respectively. Placeholder entry.'),
  -- Hair & Makeup ────────────────────────────────────────────────────────
  ('hair-makeup', 1, 'rouge & rosewater — {region}',
    'the bridal team that travels with the dress',
    'Bridal hair and makeup, multi-event coverage, on-site touch-ups. Top Indian-wedding glam teams (Mumbai/Delhi/London-based) travel with the wedding for European destinations — book 12+ months out for peak dates. Placeholder until the real glam roster lands.'),
  ('hair-makeup', 2, 'the {region} glam studio',
    'the bridal team that travels with the dress',
    'Bridal hair and makeup, multi-event coverage, on-site touch-ups. Top Indian-wedding glam teams (Mumbai/Delhi/London-based) travel with the wedding for European destinations — book 12+ months out for peak dates. Placeholder until the real glam roster lands.'),
  ('hair-makeup', 3, 'kajal beauty — {region}',
    'the bridal team that travels with the dress',
    'Bridal hair and makeup, multi-event coverage, on-site touch-ups. Top Indian-wedding glam teams (Mumbai/Delhi/London-based) travel with the wedding for European destinations — book 12+ months out for peak dates. Placeholder until the real glam roster lands.'),
  -- Mehndi Artist ────────────────────────────────────────────────────────
  ('mehndi-artist', 1, 'henna house — {region}',
    'the london-based mehndi artist who''ll fly in for the weekend',
    'Bridal mehndi plus family applications, multi-day coverage. Indian-specialty mehndi artists for European weddings are typically flown from London or Milan — there is no in-country roster yet for most of these markets. Placeholder until real artists are listed.'),
  ('mehndi-artist', 2, 'the {region} mehndi atelier',
    'the london-based mehndi artist who''ll fly in for the weekend',
    'Bridal mehndi plus family applications, multi-day coverage. Indian-specialty mehndi artists for European weddings are typically flown from London or Milan — there is no in-country roster yet for most of these markets. Placeholder until real artists are listed.'),
  ('mehndi-artist', 3, 'gulaab mehndi co. — {region}',
    'the london-based mehndi artist who''ll fly in for the weekend',
    'Bridal mehndi plus family applications, multi-day coverage. Indian-specialty mehndi artists for European weddings are typically flown from London or Milan — there is no in-country roster yet for most of these markets. Placeholder until real artists are listed.'),
  -- DJ ───────────────────────────────────────────────────────────────────
  ('dj', 1, '{region} sound co.',
    'the dj who plays bollywood at 1am without being asked twice',
    'Multi-genre wedding DJ. Bollywood, Punjabi, English Top 40, sangeet sets. Bollywood-specialist DJs are typically flown in from London or Mumbai for European weddings; local European DJs handle the cocktail-hour and house-music windows. Placeholder until the real DJs are imported.'),
  ('dj', 2, 'the saffron decks — {region}',
    'the dj who plays bollywood at 1am without being asked twice',
    'Multi-genre wedding DJ. Bollywood, Punjabi, English Top 40, sangeet sets. Bollywood-specialist DJs are typically flown in from London or Mumbai for European weddings; local European DJs handle the cocktail-hour and house-music windows. Placeholder until the real DJs are imported.'),
  ('dj', 3, 'tanpura nights — {region}',
    'the dj who plays bollywood at 1am without being asked twice',
    'Multi-genre wedding DJ. Bollywood, Punjabi, English Top 40, sangeet sets. Bollywood-specialist DJs are typically flown in from London or Mumbai for European weddings; local European DJs handle the cocktail-hour and house-music windows. Placeholder until the real DJs are imported.'),
  -- Wedding Planner ──────────────────────────────────────────────────────
  ('wedding-planner', 1, 'the {region} planning atelier',
    'the planner who knows every fai-villa rule by heart',
    'Full-service destination wedding planning, multi-event coordination, vendor import management. European destination wedding planners need deep relationships with local villa operators (e.g. FAI properties on Lake Como) plus Indian-wedding production knowledge. Placeholder until the real planner roster is finalised.'),
  ('wedding-planner', 2, 'saffron events — {region}',
    'the planner who knows every fai-villa rule by heart',
    'Full-service destination wedding planning, multi-event coordination, vendor import management. European destination wedding planners need deep relationships with local villa operators (e.g. FAI properties on Lake Como) plus Indian-wedding production knowledge. Placeholder until the real planner roster is finalised.'),
  ('wedding-planner', 3, 'phulkari planning co. — {region}',
    'the planner who knows every fai-villa rule by heart',
    'Full-service destination wedding planning, multi-event coordination, vendor import management. European destination wedding planners need deep relationships with local villa operators (e.g. FAI properties on Lake Como) plus Indian-wedding production knowledge. Placeholder until the real planner roster is finalised.')
) AS c(cat_slug, idx, name_template, tagline, bio_extra)
ON CONFLICT (slug) WHERE slug IS NOT NULL DO NOTHING;

-- Assign every placeholder vendor to its category (parsed from the slug's
-- third '__'-separated segment).
INSERT INTO vendor_category_assignments (vendor_id, category_id, is_primary)
SELECT v.id, vc.id, true
FROM vendors v
JOIN vendor_categories vc ON vc.slug = split_part(v.slug, '__', 3)
WHERE v.is_placeholder = true
  AND v.slug LIKE 'mg\_\_%' ESCAPE '\'
  AND split_part(v.slug, '__', 2) IN ('lake-como','tuscany','south-of-france','spain','greece')
ON CONFLICT (vendor_id, category_id) DO NOTHING;
