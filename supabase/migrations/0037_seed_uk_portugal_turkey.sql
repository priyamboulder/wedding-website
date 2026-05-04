-- ──────────────────────────────────────────────────────────────────────────
-- Migration 0037: Backfill UK, Portugal, and Turkey.
--
-- Date:  2026-05-01
-- Scope: Fill in the three Europe slugs that 0035 left as bare 0022
--        stubs — UK, Portugal, and Turkey. These are real, distinct
--        Indian-wedding markets and deserve full editorial treatment
--        rather than being deactivated.
--        Pattern is identical to 0036_seed_africa_oceania.sql (4-category
--        placeholder block, 3 placeholders per category).
--
-- Adds:
--   • Data: rich overview / best_for / tips / tags on uk, portugal, turkey
--     (rows already exist from 0022). Reactivates them.
--   • Data: 3-4 regions per destination = 11 region rows.
--   • Data: 5 experiences per destination = 15 experience rows.
--   • Data: 5 real, named venues per destination = 15 venues with "Venue"
--     category assignments + per-vendor pricing indicators.
--     is_placeholder remains FALSE — researched, real properties.
--   • Data: 3 placeholder vendors × 4 categories × 3 destinations = 36
--     placeholder rows. is_placeholder = TRUE.
--
-- Schema dependencies (already in place from 0021-0024):
--   • vendors.is_placeholder + idx_vendors_is_placeholder
--   • Unique constraints on budget_location_regions(location_id, name)
--     and budget_location_experiences(location_id, name)
--   • vendor_pricing_indicators table
--
-- This migration is idempotent — every INSERT uses ON CONFLICT.
-- ──────────────────────────────────────────────────────────────────────────


-- ══════════════════════════════════════════════════════════════════════════
-- PART A — Destinations.
-- ══════════════════════════════════════════════════════════════════════════

INSERT INTO budget_locations (
  type, continent, country, name, slug,
  multiplier, min_budget_usd, best_months, best_for,
  tagline, overview, tips, display_order, active
) VALUES
(
  'destination', 'Europe', 'United Kingdom', 'United Kingdom', 'uk',
  2.30, 350000, 'May–September',
  'the diaspora couple whose extended family is already in london',
  'manor house mehndi, country estate sangeet, and the wedding circuit your dadi already knows about',
  'The UK is the most-established Indian wedding market in Europe — and the only one where you don''t need to import the entire vendor stack. Decades of British-Asian weddings mean the country-house circuit (Cliveden, Hedsor, The Grove, Heythrop, Blenheim) has full Indian-wedding muscle memory: in-house Indian catering teams, mandap-build experience, baraat-on-the-driveway logistics, sangeet sound systems that handle dhol and Punjabi at sub-bass volume.

The UK wedding model splits two ways. The country-estate version uses Georgian and Edwardian manor houses across the Home Counties, Cotswolds, and Oxfordshire — Cliveden''s 376-acre estate above the Thames, Blenheim Palace''s baroque grandeur, Hedsor House''s Indian-wedding pedigree. The London version uses heritage hotels (The Savoy, Claridge''s, The Dorchester) and historic estates within the M25 (Syon Park, The Grove). Scotland adds a third option for couples who want Highland castle drama — Inverlochy, Glenapp — at a tighter scale.

Best for diaspora-heavy guest lists where 60%+ of attendees are already in the UK or Europe, and for couples who want the wedding to actually feel like part of British-Asian culture rather than imported into it.',
  'May–September is peak — book country houses 12-18 months out for prime weekends. Heathrow (LHR) is the international gateway; many country estates are 30-90 minutes by coach. UK weather is the only real wildcard — every venue should have an indoor backup, and most do. The Thames Valley (Cliveden, Hedsor, Cornwell Manor area) is the densest cluster of Indian-wedding-experienced properties. Ask any planner about their "wet weather plan" before signing — it''s the single best pre-booking question.',
  250, true
),
(
  'destination', 'Europe', 'Portugal', 'Portugal', 'portugal',
  1.35, 200000, 'May–June, September–October',
  'couples who want european glamour without the como markup or france attitude',
  'quintas, tile work, and the european destination that hasn''t been overrun yet',
  'Portugal is Europe''s quietly-luxurious play — and one of the few markets where the value-to-aesthetic ratio is genuinely on the couple''s side. Sintra delivers the Disney-storybook palace setting (Pena Palace as a backdrop, Quinta do Torneiro and Penha Longa as venues) 30 minutes from Lisbon. The Algarve coastline gives you Mediterranean-quality beaches with Conrad Algarve, Vila Joya, and the all-inclusive resort scale. The Douro Valley brings vineyard-estate weddings on terraced hillsides where Port has been made for 300 years.

Three regional games to play:

SINTRA / LISBON COAST is the heritage-palace play — Penha Longa Resort (former monastery, now Ritz-Carlton-grade), Quinta do Torneiro, the gilded-tilework aesthetic that doesn''t exist anywhere else in Europe. 30 minutes from Lisbon (LIS), making guest blocks easy.

THE ALGARVE is the resort-and-beach option. Conrad Algarve, Vila Joya, Pine Cliffs — 5-star resorts with beach access and the kind of guest infrastructure that handles 200+ Indian weddings without hiccup.

THE DOURO VALLEY is the vineyard-estate play — Six Senses Douro Valley anchors the region. Smaller scale, photographically extraordinary, the option for couples who want wine-country aesthetic without Tuscany pricing.

Indian wedding infrastructure here is thinner than the UK or Italy — bring your decorator and likely your caterer (or use Lisbon-based providers). But the venue cost-to-quality ratio is the best in Europe.',
  'Lisbon (LIS) for Sintra and Comporta, Faro (FAO) for the Algarve, Porto (OPO) for the Douro Valley. Avoid August — locals vacation, prices spike, the Algarve becomes unbearable. Sintra microclimate runs cooler and cloudier than the rest of the country — pack layers for May-September weddings. Most quintas are full-buyout properties — your wedding has the entire estate, which transforms guest experience.',
  260, true
),
(
  'destination', 'Europe', 'Turkey', 'Turkey', 'turkey',
  1.00, 150000, 'May–June, September–October',
  'couples whose moodboard has both deepika and the dome of hagia sophia',
  'bosphorus baraat, ottoman palace mandap, and the cappadocia balloon shot',
  'Turkey is the Europe-meets-Asia destination wedding play that no other country can offer — and the venues prove it. Istanbul has Ottoman-era palaces directly on the Bosphorus where you can do a baraat-by-yacht arrival into a 19th-century palace courtyard (Çırağan Palace Kempinski, Esma Sultan Yalısı). Bodrum on the Aegean coast brings Mediterranean-luxury resort scale (Mandarin Oriental, Six Senses Kaplankaya). And Cappadocia gives you the most photographed pre-wedding shoot location on the planet — hot air balloons over fairy chimneys at sunrise.

Three regional games to play:

ISTANBUL & THE BOSPHORUS is the heritage-palace play. Çırağan Palace Kempinski is a former Ottoman sultan''s palace turned 5-star hotel — the iconic Indian wedding venue in Turkey. Four Seasons Bosphorus (also a former palace) and Esma Sultan Yalısı (Ottoman waterfront mansion) round out the cluster. Best for 200-400 guest weddings with palace-aesthetic priorities.

BODRUM & THE AEGEAN COAST is the resort-luxury play. Mandarin Oriental Bodrum and Six Senses Kaplankaya sit on private peninsulas with full resort infrastructure. Mediterranean climate, beach access, and the Yalıkavak marina nightlife scene 20 minutes away. Best for 150-300 guest weddings with beach-resort scale.

CAPPADOCIA is the photography play. Argos in Cappadocia (cave-hotel) handles intimate ceremonies; the region''s real value is the pre-wedding shoot — sunrise balloon flights over Göreme are the single most-shared content asset in Indian destination wedding photography.

Indian-wedding infrastructure in Turkey is built around Istanbul-based planners who handle the whole circuit. Catering is typically imported from Mumbai/London or sourced through Istanbul''s growing Indian diaspora.',
  'Istanbul (IST) is the international gateway; Bodrum (BJV) and Cappadocia (NAV) are domestic flights from Istanbul. Avoid July-August — Bodrum gets unbearably crowded, Istanbul hits 100°F. The Bosphorus palace venues have strict noise curfews (10pm-11pm) — plan baraat and reception around it, or move to Bodrum / Antalya for late-night formats. Visa requirements changed recently — confirm with planner 6+ months out for guest blocks.',
  270, true
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

-- Match-tool tag arrays + soft capacity ceilings.
UPDATE budget_locations bl SET
  tags         = v.tags,
  max_capacity = v.cap
FROM (VALUES
  ('uk',
    '["heritage","european","convenient_for_indians","indian_vendors","food_scene","long_haul_from_us"]'::jsonb,
    400),
  ('portugal',
    '["scenic_beauty","european","exclusivity","food_scene","beach","long_haul_from_us"]'::jsonb,
    400),
  ('turkey',
    '["heritage","cultural_immersion","food_scene","scenic_beauty","exclusivity","long_haul_from_us"]'::jsonb,
    500)
) AS v(slug, tags, cap)
WHERE bl.slug = v.slug;


-- ══════════════════════════════════════════════════════════════════════════
-- PART C — Regions per destination.
-- ══════════════════════════════════════════════════════════════════════════

INSERT INTO budget_location_regions (location_id, name, description, display_order)
SELECT bl.id, r.name, r.description, r.display_order
FROM budget_locations bl
JOIN (VALUES
  -- UK
  ('uk', 'Home Counties (Berkshire, Bucks, Surrey)',
    'cliveden, hedsor, the grove — the densest cluster of indian-wedding country houses, 30-60 min from heathrow', 10),
  ('uk', 'Cotswolds & Oxfordshire',
    'blenheim palace, heythrop park, cornwell manor — the rolling-countryside-and-honey-stone belt', 20),
  ('uk', 'London',
    'the savoy, claridge''s, syon park — heritage hotels and historic estates within the m25', 30),
  ('uk', 'Scottish Highlands',
    'inverlochy castle, glenapp castle — highland castle option for tighter intimate weddings', 40),

  -- Portugal
  ('portugal', 'Sintra & Lisbon Coast',
    'penha longa, quinta do torneiro, the disney-palace landscape 30 minutes from the capital', 10),
  ('portugal', 'Algarve',
    'conrad algarve, vila joya, pine cliffs — the resort-and-beach south coast', 20),
  ('portugal', 'Douro Valley',
    'six senses douro valley, vineyard quintas — the wine-country option', 30),
  ('portugal', 'Comporta',
    'the boutique-beach destination 90 minutes south of lisbon — emerging, design-forward', 40),

  -- Turkey
  ('turkey', 'Istanbul & the Bosphorus',
    'çırağan palace, four seasons bosphorus, esma sultan — ottoman waterfront palaces turned event venues', 10),
  ('turkey', 'Bodrum & the Aegean Coast',
    'mandarin oriental bodrum, six senses kaplankaya — mediterranean resort luxury', 20),
  ('turkey', 'Cappadocia',
    'argos in cappadocia, the balloon-and-fairy-chimney photography region', 30)
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
  -- UK
  ('uk', 'London Black Cab Bridal Tour', '🚖',
    'the morning-of bridal-party black-cab procession past big ben and the london eye', 'Cultural', 10),
  ('uk', 'Afternoon Tea at the Savoy', '🫖',
    'the rest-day welcome experience for guests — scones, finger sandwiches, and the most british ritual of all', 'Food', 20),
  ('uk', 'Bicester Village Shopping Day', '🛍️',
    'the auntie-and-cousin shopping expedition to the designer outlet that''s actually on every london instagram feed', 'Cultural', 30),
  ('uk', 'Cotswolds Hot Air Balloon', '🎈',
    'sunrise balloon flight over honey-stone villages — the bridal-party morning activity', 'Adventure', 40),
  ('uk', 'Highland Whisky Tasting', '🥃',
    'private whisky tasting at a highland distillery — the scotland-extension option for the men''s side', 'Food', 50),

  -- Portugal
  ('portugal', 'Port Wine Tasting in Vila Nova de Gaia', '🍷',
    'a tour through the port lodges across the river from porto — sandeman, taylor''s, graham''s', 'Food', 10),
  ('portugal', 'Sintra Palace Day Trip', '🏰',
    'guided day trip through pena palace, quinta da regaleira, and the misty sintra hills — the storybook morning', 'Cultural', 20),
  ('portugal', 'Algarve Coastal Boat Cruise', '⛵',
    'private boat day along the algarve cliffs — benagil cave, sea grottoes, sunset cocktails', 'Adventure', 30),
  ('portugal', 'Pastel de Nata Cooking Class', '🥧',
    'guests learn to make portugal''s most-loved pastry — the rest-day food activity', 'Food', 40),
  ('portugal', 'Fado Performance at Welcome Dinner', '🎶',
    'live fado (portuguese soul music) at the welcome dinner — moody, beautiful, distinctly portuguese', 'Entertainment', 50),

  -- Turkey
  ('turkey', 'Hot Air Balloon Over Cappadocia', '🎈',
    'sunrise balloon flight over göreme''s fairy chimneys — the most-shared pre-wedding shoot in indian destination weddings', 'Adventure', 10),
  ('turkey', 'Bosphorus Yacht Cruise', '🛥️',
    'private yacht charter between europe and asia at sunset — the welcome-dinner alternative on the water', 'Adventure', 20),
  ('turkey', 'Hagia Sophia & Topkapı Private Tour', '🕌',
    'after-hours private tour of istanbul''s ottoman heritage sites — the cultural anchor for guest itineraries', 'Cultural', 30),
  ('turkey', 'Turkish Hammam Group Experience', '🧖',
    'private group hammam at the cağaloğlu or kılıç ali paşa baths — pre-wedding ritual that doubles as sightseeing', 'Wellness', 40),
  ('turkey', 'Grand Bazaar Shopping Expedition', '🧵',
    'guided trip through the 4,000-shop grand bazaar — lanterns, textiles, ceramics, and the aunties in pure heaven', 'Cultural', 50)
) AS e(loc_slug, name, icon, description, category, display_order)
  ON e.loc_slug = bl.slug
ON CONFLICT (location_id, name) DO UPDATE SET
  icon          = EXCLUDED.icon,
  description   = EXCLUDED.description,
  category      = EXCLUDED.category,
  display_order = EXCLUDED.display_order;


-- ══════════════════════════════════════════════════════════════════════════
-- PART B — Real venues per destination.
-- ══════════════════════════════════════════════════════════════════════════

INSERT INTO vendors (
  slug, name, tagline, bio,
  home_base_city, home_base_country,
  travels_globally, destinations_served, tier_match,
  capacity_min, capacity_max,
  active, verified, is_placeholder, placement_tier
) VALUES
-- UK
('cliveden-house',
 'Cliveden House',
 'the 376-acre thames-side estate — and the most-photographed driveway baraat in england',
 'Cliveden House sits on a 376-acre estate above the Thames in Berkshire, with formal gardens designed by Charles Barry and a long history as one of England''s most celebrated country houses. 38 rooms and suites, multiple restaurants, a spa, and Italianate gardens that handle ceremonies of 150+ guests. The driveway sweep up to the main house is one of the most photographed baraat-arrival angles in the country. Cliveden has hosted decades of high-end Indian weddings — the operations team has muscle memory for mandap setups, baraat logistics, and multi-day formats.',
 'Berkshire', 'United Kingdom',
 false, '["uk"]'::jsonb, '["luxury","ultra"]'::jsonb,
 100, 250, true, true, false, 'standard'),
('blenheim-palace',
 'Blenheim Palace',
 'churchill''s birthplace and a UNESCO world heritage site — the palace upgrade',
 'Blenheim Palace is the only non-royal, non-episcopal country house in England titled "palace" — a UNESCO World Heritage Site, baroque masterpiece, and Winston Churchill''s birthplace. 12,000 acres of capability brown landscape, the great court, the long library, and the orangery are all available for events. Capacity ranges from 80-guest intimate dinners in the saloon to 500-guest receptions in the great court. The cost reflects the stature — Blenheim is a top-of-market choice for couples whose wedding is a statement.',
 'Oxfordshire', 'United Kingdom',
 false, '["uk"]'::jsonb, '["luxury","ultra"]'::jsonb,
 80, 500, true, true, false, 'standard'),
('hedsor-house',
 'Hedsor House',
 'the buckinghamshire georgian house with the helicopter pad and the indian-wedding pedigree',
 'Hedsor House is a Georgian country mansion in Buckinghamshire, 30 minutes from central London and 15 minutes from Heathrow. Set within 100 acres of private parkland with a helicopter pad on-site, Hedsor has hosted some of the most high-profile British-Asian weddings in the country and is one of the few country houses with deep Indian-wedding muscle memory: in-house Indian catering partnerships, mandap-build experience, and a team that has run baraats on the front lawn dozens of times.',
 'Buckinghamshire', 'United Kingdom',
 false, '["uk"]'::jsonb, '["luxury","ultra"]'::jsonb,
 100, 300, true, true, false, 'standard'),
('the-grove-hertfordshire',
 'The Grove',
 'the 5-star resort 18 miles from london — and the easiest london-adjacent guest block',
 'The Grove is a 300-acre 5-star resort in Hertfordshire, 18 miles from central London. 215 rooms (the largest accommodation block of any country-estate wedding venue near London), Sequoia spa, championship golf, and dedicated Indian-wedding event spaces. Frequently chosen for 300-500 guest South Asian weddings where guest accommodation on-site is the priority. Three different ballrooms plus extensive outdoor ceremony locations.',
 'Hertfordshire', 'United Kingdom',
 false, '["uk"]'::jsonb, '["luxury","ultra"]'::jsonb,
 200, 500, true, true, false, 'standard'),
('aynhoe-park',
 'Aynhoe Park',
 'the eccentric grade-i palladian estate with the curated taxidermy and the design-forward aesthetic',
 'Aynhoe Park is a Grade-I listed Palladian mansion in Northamptonshire, restored and curated by James Perkins as a private estate available exclusively for events. The interiors are famously eccentric — taxidermy, hot air balloons hanging from ceilings, juxtaposed contemporary art — which creates a striking backdrop for couples who want their wedding to look like nothing else. Full-property buyouts only, sleeps approximately 60 onsite. Best for under-150-guest weddings that prioritize aesthetic over scale.',
 'Northamptonshire', 'United Kingdom',
 false, '["uk"]'::jsonb, '["luxury","ultra"]'::jsonb,
 60, 150, true, true, false, 'standard'),

-- Portugal
('penha-longa-resort',
 'Penha Longa Resort',
 'the former 14th-century monastery turned 5-star resort in the hills of sintra',
 'Penha Longa Resort is set within a 14th-century former monastery in the Sintra hills, 30 minutes from Lisbon. 194 rooms across the main building and suites, two championship golf courses, two Michelin-starred restaurants, and event spaces ranging from the cloister gardens to the grand ballroom. The setting blends Sintra''s romantic palace landscape with full resort-grade Indian-wedding infrastructure. Best for 150-300 guest weddings with strong palace-aesthetic priorities.',
 'Sintra', 'Portugal',
 false, '["portugal"]'::jsonb, '["luxury","ultra"]'::jsonb,
 100, 300, true, true, false, 'standard'),
('six-senses-douro-valley',
 'Six Senses Douro Valley',
 'the 19th-century manor in the world''s oldest demarcated wine region',
 'A restored 19th-century manor house in Lamego, on the terraced hillsides of the Douro Valley — the world''s oldest demarcated wine region. 60 rooms and suites with valley and river views, an organic vineyard, the signature Six Senses spa, and event venues that include a glass-walled wine library and the terrace overlooking the Douro. Best for intimate 80-150 guest weddings where photography and wine matter as much as scale.',
 'Lamego', 'Portugal',
 false, '["portugal"]'::jsonb, '["luxury","ultra"]'::jsonb,
 60, 150, true, true, false, 'standard'),
('conrad-algarve',
 'Conrad Algarve',
 'the algarve''s flagship 5-star — large-scale, beach access, and the indian-wedding muscle memory',
 'Conrad Algarve sits within the Quinta do Lago resort in the central Algarve, 25 minutes from Faro airport. 154 rooms and suites, multiple restaurants, beach access (via the resort''s beach club), and the largest event ballroom in the region. Hosts multiple Indian weddings per year — the operations team handles mandap setups, multi-day formats, and Indian catering imports from Lisbon-based providers. Best for 200-400 guest beach-resort weddings.',
 'Quinta do Lago', 'Portugal',
 false, '["portugal"]'::jsonb, '["luxury","ultra"]'::jsonb,
 150, 400, true, true, false, 'standard'),
('vila-joya',
 'Vila Joya',
 'the boutique algarve cliffside hotel — and the two-michelin-star kitchen',
 'Vila Joya is a 24-room boutique hotel set on a clifftop above Praia da Galé in the Algarve. The on-site restaurant has held two Michelin stars for over a decade — the food program is the headline. Best for intimate 60-120 guest weddings where the gastronomy matters as much as the setting, and where guests stay across the property and the adjacent boutique villas. Cliff-top ceremony location overlooks the Atlantic.',
 'Albufeira', 'Portugal',
 false, '["portugal"]'::jsonb, '["luxury","ultra"]'::jsonb,
 50, 120, true, true, false, 'standard'),
('quinta-do-torneiro',
 'Quinta do Torneiro',
 'the private estate 5 minutes from sintra — full buyout, your own private palace',
 'Quinta do Torneiro is a private estate in Sintra available exclusively for hire. Manor house, formal gardens, multiple reception terraces, and an outdoor chapel. Sleeps approximately 30 on-site with additional accommodation in nearby Sintra hotels. The full-buyout model means your wedding has the entire property — no other guests, no shared spaces. Best for design-led 100-180 guest Sintra weddings.',
 'Sintra', 'Portugal',
 false, '["portugal"]'::jsonb, '["luxury"]'::jsonb,
 80, 180, true, true, false, 'standard'),

-- Turkey
('ciragan-palace-kempinski',
 'Çırağan Palace Kempinski Istanbul',
 'the only 19th-century ottoman sultan''s palace in the world that''s also a hotel',
 'Çırağan Palace Kempinski occupies a former 19th-century Ottoman sultan''s palace directly on the Bosphorus. 313 rooms across the modern hotel building plus 11 historic suites in the palace itself. The Sultan Suite is one of the most expensive hotel suites in the world. Event spaces include the marble Sultan Hall (capacity 600), the historic palace courtyard, and the Bosphorus terrace where baraat-by-yacht arrivals dock. The flagship Indian wedding venue in Turkey — operations team has decades of South Asian celebration experience.',
 'Istanbul', 'Turkey',
 false, '["turkey"]'::jsonb, '["luxury","ultra"]'::jsonb,
 200, 600, true, true, false, 'standard'),
('four-seasons-bosphorus',
 'Four Seasons Hotel Istanbul at the Bosphorus',
 'the second ottoman palace turned 5-star — and the four seasons service standard on the water',
 'Four Seasons Bosphorus occupies a restored 19th-century Ottoman palace on the European shore of the Bosphorus, neighboring the Yıldız Palace gardens. 170 rooms and suites, multiple restaurants, full Four Seasons spa, and event spaces including a private waterfront terrace and the historic palace ballroom. Capacity up to 350 guests for seated events. The boat-arrival ceremony directly to the hotel''s waterfront landing is the signature Four Seasons Bosphorus moment.',
 'Istanbul', 'Turkey',
 false, '["turkey"]'::jsonb, '["luxury","ultra"]'::jsonb,
 100, 350, true, true, false, 'standard'),
('esma-sultan-yalisi',
 'Esma Sultan Yalısı',
 'the restored ottoman waterfront mansion — exposed-brick interior, glass roof, full-bosphorus drama',
 'Esma Sultan Yalısı is a 19th-century Ottoman waterside mansion (yalı) that was restored as an event venue after a fire — the original brick walls are exposed beneath a modern glass roof, creating one of the most distinctive event spaces in Istanbul. Direct Bosphorus-front location, capacity up to 400 guests for receptions. Available for full-day exclusive hire. Best for design-forward 150-300 guest Istanbul weddings that want a venue without the hotel-package constraints.',
 'Istanbul', 'Turkey',
 false, '["turkey"]'::jsonb, '["luxury","ultra"]'::jsonb,
 150, 400, true, true, false, 'standard'),
('mandarin-oriental-bodrum',
 'Mandarin Oriental Bodrum',
 'the bodrum peninsula resort with two private bays and the mediterranean drama',
 'Mandarin Oriental Bodrum sits on the Paltura peninsula on the Aegean coast, with two private bays and 60 acres of grounds. 109 rooms and suites including beachfront villas, multiple restaurants, the Mandarin Oriental signature spa, and event spaces ranging from a beachside ceremony pavilion to a 400-capacity ballroom. The boat-arrival and beach-ceremony combination is the property''s signature wedding format. Best for 200-400 guest Aegean-coast weddings.',
 'Bodrum', 'Turkey',
 false, '["turkey"]'::jsonb, '["luxury","ultra"]'::jsonb,
 150, 400, true, true, false, 'standard'),
('six-senses-kaplankaya',
 'Six Senses Kaplankaya',
 'the design-led wellness resort on the aegean — sustainability, sea views, and the boutique scale',
 'Six Senses Kaplankaya is set within a 1,700-acre nature reserve on the Aegean coast, 90 minutes from Bodrum airport. 141 rooms and suites including beachfront villas, the largest spa in the Six Senses portfolio (10,000 m²), multiple restaurants, and event venues that include a beachfront amphitheatre. Best for 100-250 guest weddings with strong wellness, design, and sustainability priorities.',
 'Milas', 'Turkey',
 false, '["turkey"]'::jsonb, '["luxury","ultra"]'::jsonb,
 80, 250, true, true, false, 'standard')
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
  'cliveden-house','blenheim-palace','hedsor-house','the-grove-hertfordshire','aynhoe-park',
  'penha-longa-resort','six-senses-douro-valley','conrad-algarve','vila-joya','quinta-do-torneiro',
  'ciragan-palace-kempinski','four-seasons-bosphorus','esma-sultan-yalisi','mandarin-oriental-bodrum','six-senses-kaplankaya'
)
ON CONFLICT (vendor_id, category_id) DO NOTHING;

-- Per-venue pricing indicators against the Venue category.
INSERT INTO vendor_pricing_indicators (vendor_id, category_id, price_low_usd, price_high_usd, price_unit, notes)
SELECT v.id, vc.id, p.lo, p.hi, 'package'::vendor_pricing_unit, ''
FROM vendors v
JOIN vendor_categories vc ON vc.slug = 'venue'
JOIN (VALUES
  -- UK
  ('cliveden-house',                 350000,   900000),
  ('blenheim-palace',                500000,  1500000),
  ('hedsor-house',                   250000,   700000),
  ('the-grove-hertfordshire',        300000,   800000),
  ('aynhoe-park',                    200000,   500000),
  -- Portugal
  ('penha-longa-resort',             150000,   400000),
  ('six-senses-douro-valley',        180000,   450000),
  ('conrad-algarve',                 120000,   350000),
  ('vila-joya',                      100000,   280000),
  ('quinta-do-torneiro',              80000,   220000),
  -- Turkey
  ('ciragan-palace-kempinski',       300000,   900000),
  ('four-seasons-bosphorus',         250000,   700000),
  ('esma-sultan-yalisi',             180000,   500000),
  ('mandarin-oriental-bodrum',       200000,   500000),
  ('six-senses-kaplankaya',          180000,   450000)
) AS p(vendor_slug, lo, hi)
  ON p.vendor_slug = v.slug
ON CONFLICT (vendor_id, category_id) DO UPDATE SET
  price_low_usd  = EXCLUDED.price_low_usd,
  price_high_usd = EXCLUDED.price_high_usd;


-- ══════════════════════════════════════════════════════════════════════════
-- PART E — Placeholder vendors per destination.
--
-- 3 placeholders × 4 categories × 3 destinations = 36 rows.
-- Categories: photography, decor-florals, catering, dj.
-- Slug format: mg__{destination}__{category}__{n}
-- ══════════════════════════════════════════════════════════════════════════

INSERT INTO vendors (
  slug, name, tagline, bio,
  home_base_city, home_base_country,
  travels_globally, destinations_served, tier_match,
  active, verified, is_placeholder, placement_tier
)
SELECT
  'mg__' || d.dest_slug || '__' || c.cat_slug || '__' || c.idx::text  AS slug,
  c.name_template || ' ' || d.brand_suffix                            AS name,
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
  ('uk',       'UK',       'London',    'United Kingdom'),
  ('portugal', 'Portugal', 'Lisbon',    'Portugal'),
  ('turkey',   'Turkey',   'Istanbul',  'Turkey')
) AS d(dest_slug, brand_suffix, home_city, country)
CROSS JOIN (VALUES
  -- (cat_slug, idx, name_template, tagline, bio_extra)
  -- Photography ──────────────────────────────────────────────────────────
  ('photography', 1, 'Saffron Lens',
    'wedding films that look like vogue editorials',
    'Editorial-led wedding photography. UK has the deepest local Indian-wedding photographer roster in Europe; Portugal and Turkey markets typically pull from London or Mumbai-based photographers who travel for the wedding. Placeholder roster — real photographers will be imported from the Marigold vendor pipeline.'),
  ('photography', 2, 'House of Marigold',
    'wedding films that look like vogue editorials',
    'Editorial-led wedding photography. UK has the deepest local Indian-wedding photographer roster in Europe; Portugal and Turkey markets typically pull from London or Mumbai-based photographers who travel for the wedding. Placeholder roster — real photographers will be imported from the Marigold vendor pipeline.'),
  ('photography', 3, 'Studio Marigold',
    'wedding films that look like vogue editorials',
    'Editorial-led wedding photography. UK has the deepest local Indian-wedding photographer roster in Europe; Portugal and Turkey markets typically pull from London or Mumbai-based photographers who travel for the wedding. Placeholder roster — real photographers will be imported from the Marigold vendor pipeline.'),
  -- Decor & Florals ──────────────────────────────────────────────────────
  ('decor-florals', 1, 'Petal & Plinth',
    'florals built for british weather and indian-wedding scale',
    'Decor and floral design across mandap, sangeet, and reception. UK has a mature local Indian-decor scene (London-based studios). Portugal and Turkey decor is typically led by London or Mumbai-based design teams partnering with local florists. Placeholder until real decor partners are confirmed.'),
  ('decor-florals', 2, 'Gulmohar Atelier',
    'florals built for british weather and indian-wedding scale',
    'Decor and floral design across mandap, sangeet, and reception. UK has a mature local Indian-decor scene (London-based studios). Portugal and Turkey decor is typically led by London or Mumbai-based design teams partnering with local florists. Placeholder until real decor partners are confirmed.'),
  ('decor-florals', 3, 'Marigold Bloom Co.',
    'florals built for british weather and indian-wedding scale',
    'Decor and floral design across mandap, sangeet, and reception. UK has a mature local Indian-decor scene (London-based studios). Portugal and Turkey decor is typically led by London or Mumbai-based design teams partnering with local florists. Placeholder until real decor partners are confirmed.'),
  -- Catering ─────────────────────────────────────────────────────────────
  ('catering', 1, 'The Saffron Table',
    'the chef who finally got biryani right at scale',
    'External Indian catering. UK has the deepest Indian-wedding catering ecosystem in Europe — multiple London-based companies serve the entire UK and Western European circuit. Portugal and Turkey caterers are typically flown in from London. Istanbul has a growing Indian-diaspora catering scene as a secondary option. Placeholder entry.'),
  ('catering', 2, 'Thali Atelier',
    'the chef who finally got biryani right at scale',
    'External Indian catering. UK has the deepest Indian-wedding catering ecosystem in Europe — multiple London-based companies serve the entire UK and Western European circuit. Portugal and Turkey caterers are typically flown in from London. Istanbul has a growing Indian-diaspora catering scene as a secondary option. Placeholder entry.'),
  ('catering', 3, 'The Plate Co.',
    'the chef who finally got biryani right at scale',
    'External Indian catering. UK has the deepest Indian-wedding catering ecosystem in Europe — multiple London-based companies serve the entire UK and Western European circuit. Portugal and Turkey caterers are typically flown in from London. Istanbul has a growing Indian-diaspora catering scene as a secondary option. Placeholder entry.'),
  -- DJ / Entertainment ───────────────────────────────────────────────────
  ('dj', 1, 'Saffron Decks',
    'the dj who plays bollywood at 1am without being asked twice',
    'Multi-genre wedding DJ — Bollywood, Punjabi, English Top 40, sangeet sets. UK has the strongest local Bollywood DJ roster in Europe. Portugal and Turkey markets typically import from London or Mumbai. Placeholder until the real DJs are imported.'),
  ('dj', 2, 'Tanpura Nights',
    'the dj who plays bollywood at 1am without being asked twice',
    'Multi-genre wedding DJ — Bollywood, Punjabi, English Top 40, sangeet sets. UK has the strongest local Bollywood DJ roster in Europe. Portugal and Turkey markets typically import from London or Mumbai. Placeholder until the real DJs are imported.'),
  ('dj', 3, 'Bombay Beats Co.',
    'the dj who plays bollywood at 1am without being asked twice',
    'Multi-genre wedding DJ — Bollywood, Punjabi, English Top 40, sangeet sets. UK has the strongest local Bollywood DJ roster in Europe. Portugal and Turkey markets typically import from London or Mumbai. Placeholder until the real DJs are imported.')
) AS c(cat_slug, idx, name_template, tagline, bio_extra)
ON CONFLICT (slug) WHERE slug IS NOT NULL DO NOTHING;

-- Assign every placeholder vendor to its category (parsed from the slug).
INSERT INTO vendor_category_assignments (vendor_id, category_id, is_primary)
SELECT v.id, vc.id, true
FROM vendors v
JOIN vendor_categories vc ON vc.slug = split_part(v.slug, '__', 3)
WHERE v.is_placeholder = true
  AND v.slug LIKE 'mg\_\_%' ESCAPE '\'
  AND split_part(v.slug, '__', 2) IN ('uk','portugal','turkey')
ON CONFLICT (vendor_id, category_id) DO NOTHING;
