-- ──────────────────────────────────────────────────────────────────────────
-- Migration 0036: Seed the Middle East continent.
--
-- Date:  2026-05-01
-- Scope: Third continent seed for the Marigold Destination Explorer.
--        Middle East — Dubai, Abu Dhabi, Muscat (Oman).
--        Pattern is identical to 0024 (South Asia) and 0035 (Europe).
--
-- Adds:
--   • Data: rich overview / best_for / tips / tags on Dubai (already
--     created by 0022) plus two new slugs — Abu Dhabi (new) and
--     Muscat, Oman (replaces the generic `oman` row from 0022,
--     deactivated below).
--   • Data: 2-5 regions per destination = ~10 region rows.
--   • Data: 3-5 experiences per destination = ~12 experience rows.
--   • Data: 3-5 real, named venues per destination = 11 venues with
--     "Venue" category assignments + per-vendor pricing indicators.
--     is_placeholder remains FALSE — these are researched, real
--     properties.
--   • Data: 3 placeholder vendors × 4 categories × 3 destinations = 36
--     placeholder rows. Each carries is_placeholder = TRUE; replace
--     with real vendor data via the import pipeline before going live.
--
-- Schema dependencies (already in place from 0024):
--   • vendors.is_placeholder column + idx_vendors_is_placeholder
--   • Unique constraints on budget_location_regions(location_id, name)
--     and budget_location_experiences(location_id, name)
--   • get_ranked_vendors(..., p_include_placeholders) — already filters
--     out placeholders by default
--
-- Note on `budget_locations.continent`:
--   We keep continent='Middle East' here. lib/destinations/continents.ts
--   maps Middle East → display slug 'middle-east' for the Tools surface.
--
-- This migration is idempotent — every INSERT uses ON CONFLICT.
-- ──────────────────────────────────────────────────────────────────────────


-- ══════════════════════════════════════════════════════════════════════════
-- PART A — Destinations.
--
-- Dubai exists from 0022 — UPSERT to fill in rich editorial fields.
-- Abu Dhabi is a new entry. Muscat (Oman) is new; the generic `oman`
-- row from 0022 is superseded by `muscat-oman` and gets deactivated
-- below.
-- ══════════════════════════════════════════════════════════════════════════

INSERT INTO budget_locations (
  type, continent, country, name, slug,
  multiplier, min_budget_usd, best_months, best_for,
  tagline, overview, tips, display_order, active
) VALUES
(
  'destination', 'Middle East', 'UAE', 'Dubai, UAE', 'dubai',
  2.00, 150000, 'October–March',
  'the family whose guest list hits 800 and whose expectations hit higher',
  'the city that built a palm-shaped island and then put a wedding ballroom on it',
  'Dubai is the maximalist''s playground and the logistics nerd''s dream. No other city on earth combines this density of ultra-luxury hotel ballrooms, this depth of South Asian wedding vendor ecosystem, and this level of connectivity. Every major airline flies here. The hotels have hosted thousands of indian weddings and have the muscle memory to prove it — dedicated south asian coordinators, approved indian caterers, havan/fire ceremony permissions at select venues, and ballrooms that can flip from sangeet to reception in four hours.

The range is absurd: from Atlantis the Palm''s 2,000-person ballroom to Al Maha Desert Resort''s 40-person dune ceremony. From the Burj Al Arab''s private island to the Armani Hotel inside the world''s tallest building. And the city itself is the guest experience — desert safaris, yacht charters, gold souks, and a nightlife scene that keeps the younger crowd occupied between events.

The trade-off: Dubai is not cheap. Full-service luxury weddings here start where other destinations top out. But for families where the guest list is non-negotiable and the experience has to be world-class, nothing else delivers at this scale. The UAE has ~3.5 million Indians in residence — which means half your guest list might already live within driving distance.',
  'Dubai wedding season peaks Nov–March. Book 12+ months ahead for prime weekend dates at the big hotels. The UAE allows alcohol at licensed hotel venues — confirm the licence before signing. Friday is the traditional "big day" in the gulf, not Saturday. Approved Indian caterer lists exist at every major hotel; ask early which caterers your venue will allow.',
  300, true
),
(
  'destination', 'Middle East', 'UAE', 'Abu Dhabi, UAE', 'abu-dhabi',
  2.00, 180000, 'October–March',
  'the family that wants UAE luxury without the dubai volume knob on 11',
  'dubai''s quieter sibling with the bigger art collection and the better manners',
  'Abu Dhabi is Dubai without the chaos. The UAE capital has the cultural institutions (Louvre Abu Dhabi, Guggenheim opening soon), the palace-scale hotels (Emirates Palace, the Ritz-Carlton), and the same depth of indian wedding infrastructure — but at a pace that doesn''t feel like it''s trying to impress you. It just is impressive. The city is quieter, more spacious, and more refined than Dubai, which appeals to families who want the gulf experience without the tourist-trap energy.

The hotels here are genuinely palatial — Emirates Palace has 394 rooms spread across 1.3 kilometers of private beach. The Saadiyat Island cultural district gives your guests the Louvre for a morning activity. And the St. Regis and Ritz-Carlton on Saadiyat Beach offer resort-scale luxury on pristine, uncrowded sand.

Best for couples who want UAE-level production capability and full Indian-wedding infrastructure, but with the dignity of an arrival that doesn''t involve fighting Sheikh Zayed Road traffic at 9pm.',
  'Abu Dhabi International (AUH) handles direct flights from major hubs. 90 minutes by car from Dubai (DXB) — many couples block guest rooms in both cities for multi-day formats. The Sheikh Zayed Grand Mosque has a strict modest-dress code and event timing rules; coordinate visits with your planner. The Louvre Abu Dhabi does private evening events — the most-photographed cocktail-hour venue in the gulf.',
  310, true
),
(
  'destination', 'Middle East', 'Oman', 'Muscat, Oman', 'muscat-oman',
  1.40, 120000, 'October–April',
  'the couple who wants gulf accessibility with genuine soul',
  'the gulf''s best-kept secret — mountains, sea, and no one trying to sell you anything',
  'Oman is the anti-Dubai. Where Dubai is glass towers and artificial islands, Oman is Hajar mountains crumbling into the Sea of Oman, ancient forts, frankincense trails, and a hospitality culture that feels genuinely warm rather than transactionally luxurious. Muscat — Oman''s capital — sits in a dramatic setting between mountains and ocean, with a handful of world-class resorts that have begun courting indian destination weddings seriously.

The infrastructure is newer and smaller than Dubai''s: Oman hosted ~6 indian destination weddings in 2023 and roughly 7-8 in 2024. But the government is actively promoting wedding tourism, the venues are stunning, and the prices are significantly lower than Dubai. Shangri-La Barr Al Jissah (124 acres, 640 rooms across three hotels) is the standout — they''ve invested heavily in south asian wedding capabilities, including hosting dedicated wedding fairs with indian and gulf vendors.

The trade-off: fewer direct flights than Dubai (though Muscat connects well to India and the gulf), and a smaller vendor ecosystem — you''ll likely import some vendors from Dubai or India. But the destination itself is unforgettable.',
  'Muscat International (MCT) connects via Doha, Dubai, and Mumbai. Always confirm the alcohol policy before signing — Oman has more restrictions than the UAE at some properties (licensed hotels are fine; villa buyouts can be more complex). Jebel Akhdar requires 4WD road access and adds logistical complexity for decor vendors and guest transport. Pair Anantara mountain (ceremony) with Shangri-La coast (reception) for the strongest two-act narrative.',
  320, true
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

-- The generic `oman` row from 0022 is superseded by `muscat-oman`.
-- Deactivate rather than delete so any existing budget_user_plans
-- references stay intact.
UPDATE budget_locations SET active = false WHERE slug = 'oman';

-- Match-tool tag arrays + soft capacity ceilings for the three Middle East
-- slugs. Mirrors the per-slug tag conventions from 0023 and 0035.
UPDATE budget_locations bl SET
  tags         = v.tags,
  max_capacity = v.cap
FROM (VALUES
  ('dubai',
    '["exclusivity","nightlife","convenient_for_indians","indian_vendors","food_scene","long_haul_from_us"]'::jsonb,
    2500),
  ('abu-dhabi',
    '["exclusivity","heritage","convenient_for_indians","indian_vendors","long_haul_from_us"]'::jsonb,
    2500),
  ('muscat-oman',
    '["scenic_beauty","mountain","exclusivity","cultural_immersion","long_haul_from_us"]'::jsonb,
    1000)
) AS v(slug, tags, cap)
WHERE bl.slug = v.slug;


-- ══════════════════════════════════════════════════════════════════════════
-- PART C — Regions per destination.
-- ══════════════════════════════════════════════════════════════════════════

INSERT INTO budget_location_regions (location_id, name, description, display_order)
SELECT bl.id, r.name, r.description, r.display_order
FROM budget_locations bl
JOIN (VALUES
  -- Dubai
  ('dubai', 'Palm Jumeirah',
    'the palm — atlantis, one&only, waldorf. the iconic island address.', 10),
  ('dubai', 'Downtown & DIFC',
    'burj khalifa territory — armani, address, ritz-carlton DIFC. the skyline backdrop.', 20),
  ('dubai', 'Jumeirah Beach',
    'the beachfront strip — burj al arab, madinat jumeirah, jumeirah beach hotel.', 30),
  ('dubai', 'Dubai Creek & Culture Village',
    'old dubai meets new luxury — palazzo versace, park hyatt. heritage vibes.', 40),
  ('dubai', 'The Desert',
    'al maha, bab al shams — dune ceremonies and desert sunsets, 45 minutes from the city.', 50),

  -- Abu Dhabi
  ('abu-dhabi', 'Corniche & Downtown',
    'the waterfront — emirates palace, four seasons. the grand boulevard.', 10),
  ('abu-dhabi', 'Saadiyat Island',
    'the cultural island — louvre abu dhabi, st. regis, park hyatt. art meets beach.', 20),
  ('abu-dhabi', 'Yas Island',
    'the entertainment island — yas marina, w hotel, ferrari world. the fun uncle''s pick.', 30),

  -- Muscat, Oman
  ('muscat-oman', 'Muscat Coastline',
    'the capital''s waterfront — shangri-la, al bustan palace, grand hyatt. mountains meet sea.', 10),
  ('muscat-oman', 'Jebel Akhdar (Green Mountain)',
    '2,000 meters above sea level — anantara''s canyon-edge resort. dramatic and remote.', 20)
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
  -- Dubai
  ('dubai', 'Desert Safari & Dune Dinner', '🏜️',
    'private desert safari for 50-100 guests — dune bashing in land cruisers, camel rides at sunset, and a tented dinner under the stars with a shisha lounge and belly dancing',
    'Adventure', 10),
  ('dubai', 'Dubai Marina Yacht Charter', '🛥️',
    'private mega-yacht charter through dubai marina and past the palm — DJ, open bar, 80-200 guests, the skyline at night is the decor',
    'Entertainment', 20),
  ('dubai', 'Gold Souk Shopping Excursion', '✨',
    'guided group visit to the dubai gold souk and spice souk in deira — organized chaos that doubles as a bonding experience',
    'Cultural', 30),
  ('dubai', 'Burj Khalifa At The Top Private Event', '🏙️',
    'private event space on the 148th floor of the burj khalifa — 30-50 guests, cocktails, and the view that needs no description',
    'Entertainment', 40),
  ('dubai', 'Hatta Mountain Day Trip', '⛰️',
    'day trip to hatta dam and the hajar mountains — kayaking, hiking, and a picnic lunch away from the city, the recovery day your guests actually need',
    'Adventure', 50),

  -- Abu Dhabi
  ('abu-dhabi', 'Louvre Abu Dhabi Private Evening', '🎨',
    'private evening event inside the louvre abu dhabi — the dome''s "rain of light" installation at sunset is one of the most photographed architectural moments in the world',
    'Cultural', 10),
  ('abu-dhabi', 'Sheikh Zayed Grand Mosque Visit', '🕌',
    'guided group visit to the sheikh zayed grand mosque — one of the world''s most beautiful religious buildings, modest dress required, the white marble at sunset is breathtaking',
    'Cultural', 20),
  ('abu-dhabi', 'Yas Marina F1 Track Experience', '🏎️',
    'driving experience on the yas marina F1 circuit — passenger hot laps in supercars or drive-it-yourself options, the adrenaline event',
    'Adventure', 30),

  -- Muscat, Oman
  ('muscat-oman', 'Dhow Cruise Along Muscat Coast', '⛵',
    'private dhow charter along the muscat coastline — traditional omani sailing boat with dinner, live music, and dolphin spotting, 40-80 guests',
    'Adventure', 10),
  ('muscat-oman', 'Muttrah Souq & Old Muscat Walking Tour', '🏛️',
    'guided walking tour of muttrah souq (frankincense, silver, textiles) and old muscat''s royal palace district — the heritage experience',
    'Cultural', 20),
  ('muscat-oman', 'Wahiba Sands Desert Overnight', '🌙',
    'overnight excursion to the wahiba sands desert — luxury tented camp, dune bashing, camel rides, and the kind of stargazing you can''t get in any city on earth',
    'Adventure', 30),
  ('muscat-oman', 'Wadi Shab Canyon Hike', '🏔️',
    'half-day hike through wadi shab — swimming through turquoise canyon pools to a hidden waterfall, 15-20 guests, moderate fitness required',
    'Adventure', 40)
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
-- Dubai
('atlantis-the-palm',
 'Atlantis, The Palm',
 '2,000-person ballroom, underwater restaurant, and a beach — the indian wedding machine',
 'Atlantis is the undisputed scale champion for indian weddings in Dubai. The Atlantis ballroom holds 1,200+ guests, but the resort''s real power is range: beach ceremonies, the Ossiano underwater restaurant (dinner surrounded by 65,000 marine animals), White Beach rooftop for afterparties, and outdoor terraces for intimate events. 1,548 rooms means your entire guest list stays on-site. Dedicated south asian wedding coordinators, approved indian caterers, and a track record of hosting hundreds of large-scale indian celebrations.',
 'Dubai', 'UAE',
 false, '["dubai"]'::jsonb, '["luxury","ultra"]'::jsonb,
 200, 2000, true, true, false, 'standard'),
('armani-hotel-dubai',
 'Armani Hotel Dubai',
 'inside the burj khalifa, with the dubai fountain as your dance floor backdrop',
 'The Armani Hotel occupies floors in the world''s tallest building — the Burj Khalifa. Sleek ballrooms and rooftop spaces overlook the Dubai Fountain. The design is Giorgio Armani''s personal vision: minimalist, warm, and impossibly elegant. Capacity tops 400 guests in the main hall. The fountain timing can be coordinated with your ceremony — the couple''s first dance as the world''s largest choreographed fountain erupts behind them. Best for cocktail-style receptions, modern ceremonies, and couples who want architectural drama.',
 'Dubai', 'UAE',
 false, '["dubai"]'::jsonb, '["luxury","ultra"]'::jsonb,
 150, 400, true, true, false, 'standard'),
('one-and-only-royal-mirage',
 'One&Only Royal Mirage',
 'arabian architecture, 65 acres of gardens, and a kilometer of private beach',
 'One&Only Royal Mirage is 65 acres of landscaped gardens, fountains, and moorish architecture spread along a kilometer of private beach. The resort has three distinct palaces: The Palace, Arabian Court, and Residence & Spa — each with its own character. The amphitheatre, beach, and multiple garden venues give you a different setting for every event across your multi-day celebration. The arabian architecture photographs beautifully with indian wedding decor — the arches, the lanterns, the courtyards.',
 'Dubai', 'UAE',
 false, '["dubai"]'::jsonb, '["luxury","ultra"]'::jsonb,
 150, 500, true, true, false, 'standard'),
('palazzo-versace-dubai',
 'Palazzo Versace Dubai',
 'versace furnishings, marble everything, and dubai creek at sunset',
 'If maximalist glamour is the brief, Palazzo Versace delivers. The ballroom is unapologetically italian — ornate ceilings, custom Versace furnishings, marble floors, crystal chandeliers. The 215-meter lagoon pool and surrounding gardens offer outdoor ceremony options with unobstructed views of Dubai Creek. 215 rooms, all with Versace-designed interiors. For the couple who wants high-fashion drama fused with indian wedding grandeur, nothing else in Dubai matches this level of branded opulence.',
 'Dubai', 'UAE',
 false, '["dubai"]'::jsonb, '["luxury","ultra"]'::jsonb,
 150, 500, true, true, false, 'standard'),
('al-maha-desert-resort',
 'Al Maha, a Luxury Collection Desert Resort',
 'dunes, oryxes, and a sunset ceremony that makes the city feel like a hallucination',
 '45 minutes from downtown Dubai, Al Maha sits within the Dubai Desert Conservation Reserve — 225 square kilometers of protected dunes and wildlife. 42 private pool suites, each with views of the desert and resident arabian oryx. This is strictly intimate: 40-60 guests max. The sunset ceremony setup — mandap on the dunes as the desert turns gold — is one of the most dramatic backdrops in global destination weddings. No children under 10 allowed.',
 'Dubai', 'UAE',
 false, '["dubai"]'::jsonb, '["luxury","ultra"]'::jsonb,
 30, 60, true, true, false, 'standard'),

-- Abu Dhabi
('emirates-palace-mandarin-oriental',
 'Emirates Palace Mandarin Oriental',
 '1.3 kilometers of private beach and a ballroom that makes rajasthani palaces jealous',
 'Emirates Palace is not a hotel — it''s a national monument that happens to have rooms. 394 suites spread across 1.3 km of private beach, 114 domes, a grand ballroom that holds 2,500, and an auditorium for 1,100. The palace gardens and beachfront provide outdoor venues of a scale that is genuinely hard to comprehend. The opulence is real gold — the palace reportedly uses gold leaf in its coffee. For indian weddings of 500+ guests, Emirates Palace is the venue that matches the ambition.',
 'Abu Dhabi', 'UAE',
 false, '["abu-dhabi"]'::jsonb, '["luxury","ultra"]'::jsonb,
 300, 2500, true, true, false, 'standard'),
('st-regis-saadiyat-island',
 'The St. Regis Saadiyat Island Resort',
 'saadiyat beach, the louvre next door, and the st. regis butler on speed dial',
 'On Saadiyat Island''s pristine beach — arguably the best natural beach in Abu Dhabi. The St. Regis combines beachfront ceremony options with elegant indoor venues and the legendary St. Regis butler service. 376 rooms and suites. The wedding lawn overlooks the Arabian Gulf. Proximity to the Louvre Abu Dhabi means your guests have a world-class museum as a morning activity between events. The resort''s more intimate scale (compared to Emirates Palace) allows for a more curated, personal experience.',
 'Abu Dhabi', 'UAE',
 false, '["abu-dhabi"]'::jsonb, '["luxury","ultra"]'::jsonb,
 150, 400, true, true, false, 'standard'),
('ritz-carlton-grand-canal',
 'The Ritz-Carlton Abu Dhabi, Grand Canal',
 'venetian-inspired canals, a grand mosque view, and a ballroom that goes to 1,000',
 'Overlooking the Grand Canal with views of the Sheikh Zayed Grand Mosque — one of the world''s most beautiful mosques and a stunning backdrop for photos. The Ritz-Carlton''s venetian-inspired architecture includes outdoor canals, manicured gardens, and a grand ballroom for up to 1,000 guests. 532 rooms. The hotel''s proximity to the grand mosque means sunset photos with the illuminated mosque as your backdrop — a visual that is genuinely unique in global destination weddings.',
 'Abu Dhabi', 'UAE',
 false, '["abu-dhabi"]'::jsonb, '["luxury","ultra"]'::jsonb,
 200, 1000, true, true, false, 'standard'),

-- Muscat, Oman
('shangri-la-barr-al-jissah',
 'Shangri-La Barr Al Jissah, Muscat',
 '124 acres, three hotels, and the most indian-wedding-ready resort in oman',
 'Shangri-La Barr Al Jissah is the undisputed wedding venue in Oman — 124 acres between the Hajar mountains and the Sea of Oman, 15 minutes from old Muscat. The resort comprises three hotels: Al Waha (the oasis, family-friendly), Al Bandar (the town, mid-luxury), and Al Husn (the castle, adults-only ultra-luxury). Combined: 640 rooms. The Barr Al Jissah ballroom is 1,056 sqm with a pillarless expanse and crystal chandeliers, seating 850. 500 meters of private beach for outdoor ceremonies. Dedicated south asian wedding specialists, approved indian caterers, havan/fire ceremony permissions, and mandap-ready beachfront setups.',
 'Muscat', 'Oman',
 false, '["muscat-oman"]'::jsonb, '["luxury","ultra"]'::jsonb,
 200, 850, true, true, false, 'standard'),
('ritz-carlton-al-bustan-palace',
 'The Ritz-Carlton Al Bustan Palace',
 'the sultan''s former guesthouse — with the largest ballroom in oman',
 'Al Bustan Palace sits where the Hajar mountains meet the Gulf of Oman, and the architecture reflects its origins as a royal guesthouse. The ballroom is the largest in the Sultanate of Oman. 250 rooms including 52 luxurious suites, a 50-meter infinity pool, and five swimming pools. The palace grounds are immaculately landscaped. The combination of royal omani architecture with beachfront setting creates a backdrop that feels both regal and natural.',
 'Muscat', 'Oman',
 false, '["muscat-oman"]'::jsonb, '["luxury","ultra"]'::jsonb,
 200, 1000, true, true, false, 'standard'),
('anantara-al-jabal-al-akhdar',
 'Anantara Al Jabal Al Akhdar Resort',
 'a canyon-edge resort 2,000 meters up — the ceremony venue that defies gravity',
 'Perched on the edge of a canyon in the Al Hajar mountains at 2,000 meters above sea level. Anantara Jebel Akhdar is remote, dramatic, and unlike any other wedding venue in the middle east. 115 rooms. The canyon-edge terrace offers sunset views over the vast wadi below — your ceremony with the entire Oman mountain range as the backdrop. The resort is only accessible by 4WD (the road requires it), which adds to the exclusivity but also adds logistical complexity for decor vendors and guest transport. Strictly intimate: 60-80 guests. The cooler mountain climate (20-25°C in winter) is a welcome contrast to the gulf coast heat.',
 'Jebel Akhdar', 'Oman',
 false, '["muscat-oman"]'::jsonb, '["luxury","ultra"]'::jsonb,
 40, 80, true, true, false, 'standard')
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
  'atlantis-the-palm','armani-hotel-dubai','one-and-only-royal-mirage','palazzo-versace-dubai','al-maha-desert-resort',
  'emirates-palace-mandarin-oriental','st-regis-saadiyat-island','ritz-carlton-grand-canal',
  'shangri-la-barr-al-jissah','ritz-carlton-al-bustan-palace','anantara-al-jabal-al-akhdar'
)
ON CONFLICT (vendor_id, category_id) DO NOTHING;

-- Per-venue pricing indicators against the Venue category.
INSERT INTO vendor_pricing_indicators (vendor_id, category_id, price_low_usd, price_high_usd, price_unit, notes)
SELECT v.id, vc.id, p.lo, p.hi, 'package'::vendor_pricing_unit, ''
FROM vendors v
JOIN vendor_categories vc ON vc.slug = 'venue'
JOIN (VALUES
  -- Dubai
  ('atlantis-the-palm',                 150000,  600000),
  ('armani-hotel-dubai',                200000,  500000),
  ('one-and-only-royal-mirage',         200000,  550000),
  ('palazzo-versace-dubai',             180000,  450000),
  ('al-maha-desert-resort',             150000,  350000),
  -- Abu Dhabi
  ('emirates-palace-mandarin-oriental', 250000,  800000),
  ('st-regis-saadiyat-island',          200000,  500000),
  ('ritz-carlton-grand-canal',          200000,  550000),
  -- Muscat, Oman
  ('shangri-la-barr-al-jissah',         120000,  400000),
  ('ritz-carlton-al-bustan-palace',     150000,  450000),
  ('anantara-al-jabal-al-akhdar',       150000,  350000)
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
-- 3 placeholders × 4 categories × 3 destinations = 36 rows.
-- Categories: photography, decor-florals, catering, dj.
--
-- Note on UAE/Oman vendor ecosystem: the UAE has ~3.5M Indian residents,
-- which means indian wedding infrastructure is native rather than
-- imported — most premium photography/decor/catering/DJ talent is
-- locally based or flown from Mumbai/Delhi for marquee events. Oman
-- typically imports from Dubai or India for now.
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
  ('dubai',       'Dubai',     'Dubai',     'UAE'),
  ('abu-dhabi',   'Abu Dhabi', 'Abu Dhabi', 'UAE'),
  ('muscat-oman', 'Muscat',    'Muscat',    'Oman')
) AS d(dest_slug, brand_suffix, home_city, country)
CROSS JOIN (VALUES
  -- (cat_slug, idx, name_template, tagline, bio_extra)
  -- Photography ──────────────────────────────────────────────────────────
  ('photography', 1, 'golden frame {region}',
    'wedding films that look like vogue editorials',
    'Editorial-led wedding photography for gulf destination weddings. The UAE has a deep bench of locally-based premium indian-wedding photographers; Oman typically imports from Dubai or Mumbai for marquee events. Placeholder roster — real photographers will be imported from the Marigold vendor pipeline.'),
  ('photography', 2, 'desert lens — {region}',
    'wedding films that look like vogue editorials',
    'Editorial-led wedding photography for gulf destination weddings. The UAE has a deep bench of locally-based premium indian-wedding photographers; Oman typically imports from Dubai or Mumbai for marquee events. Placeholder roster — real photographers will be imported from the Marigold vendor pipeline.'),
  ('photography', 3, 'atlas studios — {region}',
    'wedding films that look like vogue editorials',
    'Editorial-led wedding photography for gulf destination weddings. The UAE has a deep bench of locally-based premium indian-wedding photographers; Oman typically imports from Dubai or Mumbai for marquee events. Placeholder roster — real photographers will be imported from the Marigold vendor pipeline.'),
  -- Decor & Florals ──────────────────────────────────────────────────────
  ('decor-florals', 1, 'oud & orchid — {region}',
    'florals that hold up in gulf heat, designed for instagram',
    'Decor and floral design across mandap, sangeet, and reception. Dubai-based decorators handle most gulf weddings — they understand the difference between a rajasthani mandap and a south indian one and have the warehouses to prove it. Placeholder until the real decor partners are confirmed and listed.'),
  ('decor-florals', 2, 'petal & palace — {region}',
    'florals that hold up in gulf heat, designed for instagram',
    'Decor and floral design across mandap, sangeet, and reception. Dubai-based decorators handle most gulf weddings — they understand the difference between a rajasthani mandap and a south indian one and have the warehouses to prove it. Placeholder until the real decor partners are confirmed and listed.'),
  ('decor-florals', 3, 'arabesque atelier — {region}',
    'florals that hold up in gulf heat, designed for instagram',
    'Decor and floral design across mandap, sangeet, and reception. Dubai-based decorators handle most gulf weddings — they understand the difference between a rajasthani mandap and a south indian one and have the warehouses to prove it. Placeholder until the real decor partners are confirmed and listed.'),
  -- Catering ─────────────────────────────────────────────────────────────
  ('catering', 1, 'saffron palace catering — {region}',
    'the chef who finally got biryani right at scale',
    'Indian catering for gulf destination weddings. Most major UAE hotels publish approved indian-caterer lists — local outfits have been feeding 1,000-person receptions for decades. Oman venues typically draw from Dubai or Mumbai for wedding-scale indian catering. Placeholder entry until real caterers land.'),
  ('catering', 2, 'the {region} thali co.',
    'the chef who finally got biryani right at scale',
    'Indian catering for gulf destination weddings. Most major UAE hotels publish approved indian-caterer lists — local outfits have been feeding 1,000-person receptions for decades. Oman venues typically draw from Dubai or Mumbai for wedding-scale indian catering. Placeholder entry until real caterers land.'),
  ('catering', 3, 'zafran kitchen — {region}',
    'the chef who finally got biryani right at scale',
    'Indian catering for gulf destination weddings. Most major UAE hotels publish approved indian-caterer lists — local outfits have been feeding 1,000-person receptions for decades. Oman venues typically draw from Dubai or Mumbai for wedding-scale indian catering. Placeholder entry until real caterers land.'),
  -- DJ ───────────────────────────────────────────────────────────────────
  ('dj', 1, 'habibi beats — {region}',
    'the dj who plays bollywood at 1am without being asked twice',
    'Multi-genre wedding DJ. Bollywood, Punjabi, English Top 40, sangeet sets. The UAE has a native bollywood DJ scene — Oman events typically import from Dubai or Mumbai. Friday-night sound curfews are venue-specific in the UAE; confirm before booking. Placeholder until the real DJs are imported.'),
  ('dj', 2, 'the {region} sound society',
    'the dj who plays bollywood at 1am without being asked twice',
    'Multi-genre wedding DJ. Bollywood, Punjabi, English Top 40, sangeet sets. The UAE has a native bollywood DJ scene — Oman events typically import from Dubai or Mumbai. Friday-night sound curfews are venue-specific in the UAE; confirm before booking. Placeholder until the real DJs are imported.'),
  ('dj', 3, 'desert decks — {region}',
    'the dj who plays bollywood at 1am without being asked twice',
    'Multi-genre wedding DJ. Bollywood, Punjabi, English Top 40, sangeet sets. The UAE has a native bollywood DJ scene — Oman events typically import from Dubai or Mumbai. Friday-night sound curfews are venue-specific in the UAE; confirm before booking. Placeholder until the real DJs are imported.')
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
  AND split_part(v.slug, '__', 2) IN ('dubai','abu-dhabi','muscat-oman')
ON CONFLICT (vendor_id, category_id) DO NOTHING;
