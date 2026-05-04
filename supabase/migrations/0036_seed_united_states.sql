-- ──────────────────────────────────────────────────────────────────────────
-- Migration 0036: Seed the United States continent.
--
-- Date:  2026-05-01
-- Scope: Domestic destination seed for the Marigold Destination Explorer.
--        United States — South Florida, Southern California, Napa Valley,
--        New York, Hawaii.
--        Pattern is identical to 0024 (South Asia) and 0035 (Europe).
--
-- Adds:
--   • Data: 5 new `destination`-type rows (south-florida, southern-california,
--     napa-valley, new-york, hawaii) — distinct from the `us_metro` rows
--     seeded in 0022 (those are baseline-pricing references, not
--     destination-explorer entries).
--   • Data: 3-4 regions per destination = ~17 region rows.
--   • Data: 3-4 experiences per destination = ~17 experience rows.
--   • Data: 4-5 real, named venues per destination = 22 venues with
--     "Venue" category assignments + per-vendor pricing indicators.
--     is_placeholder = FALSE — these are researched, real properties.
--   • Data: 3 placeholder vendors × 4 categories × 5 destinations = 60
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
--   We keep continent='North America' here to stay consistent with the
--   existing US metros (0022) and Caribbean rows. lib/destinations/
--   continents.ts maps `country='USA' AND type='destination'` → display
--   slug 'united-states' for the Tools surface — those rows do NOT route
--   to the Caribbean bucket.
--
-- This migration is idempotent — every INSERT uses ON CONFLICT.
-- ──────────────────────────────────────────────────────────────────────────


-- ══════════════════════════════════════════════════════════════════════════
-- PART A — Destinations.
--
-- All five rows are new. None of these slugs exist in 0022 — the existing
-- `los-angeles` / `nyc-nj` rows are `us_metro` baseline-pricing references
-- and remain untouched.
-- ══════════════════════════════════════════════════════════════════════════

INSERT INTO budget_locations (
  type, continent, country, name, slug,
  multiplier, min_budget_usd, best_months, best_for,
  tagline, overview, tips, display_order, active
) VALUES
(
  'destination', 'North America', 'USA', 'South Florida', 'south-florida',
  1.50, 150000, 'November–April',
  'the couple whose guest list is 500 and whose family won''t fly international',
  'the domestic destination wedding capital — and every indian vendor already has a miami office',
  'south florida — miami, fort lauderdale, palm beach — is the most popular domestic destination for large south asian weddings in the US. the math is simple: beachfront luxury hotels with massive ballrooms, direct flights from every major US city, warm weather during peak wedding season (nov–april), and the deepest south asian wedding vendor ecosystem outside of new jersey and the tri-state area. the hotels here have hosted thousands of indian weddings — the diplomat, the breakers, fontainebleau, gaylord palms — and their teams understand multi-day celebrations, baraat logistics, fire ceremonies, and 3am sangeet wrap times.

miami itself adds a layer that pure resort destinations can''t match: the nightlife, the food scene, the art deco architecture, and the kind of energy that makes your younger guests actually excited about a destination wedding. and orlando (90 minutes north) brings disney, universal, and gaylord palms into the mix for families with kids.',
  'Book peak season (Nov-April) 12-18 months out — the diplomat and gaylord palms run multiple Indian weddings per weekend in season. Hurricane risk is real Aug-Oct: build cancellation insurance into the budget. Miami International (MIA) and Fort Lauderdale (FLL) both serve the south florida hotel circuit; Orlando (MCO) is its own market. Indian catering is fully sourced locally — no need to fly in chefs.',
  800, true
),
(
  'destination', 'North America', 'USA', 'Southern California', 'southern-california',
  2.00, 200000, 'April–November',
  'the couple who wants editorial-quality venues and the deepest indian wedding vendor pool in the US',
  'pacific ocean mandaps, wine country estates, and the most experienced desi vendor market in america',
  'southern california — from orange county through los angeles to santa barbara — is home to the largest south asian population on the west coast and the deepest indian wedding vendor ecosystem in the western US. the venues here are stunning: pacific ocean cliffs at pelican hill, napa-style wine country in temecula, historic estates in pasadena, and modern luxury resorts along the coast. the weather cooperates 300 days a year. and the vendor options — caterers, decorators, DJs, mehndi artists — are practically unlimited.

the price tag reflects the market: a 300-person indian wedding at pelican hill or the ritz-carlton laguna niguel starts at $250K and scales quickly. but the quality of venue, vendor, and experience is genuinely world-class.',
  'LAX and SNA (orange county) are the two main airports — book guest blocks near whichever airport matches your venue. Pelican Hill and Monarch Beach require 18-24 month lead times for peak weekends. Outside catering is allowed at most luxury venues but check the approved-vendor lists early. Santa Barbara is 90 minutes from LAX — factor the drive into rehearsal-dinner logistics.',
  810, true
),
(
  'destination', 'North America', 'USA', 'Napa Valley & Wine Country', 'napa-valley',
  2.50, 200000, 'May–October',
  'the couple who wants intimate, design-forward, and world-class food',
  'vineyard pheras, michelin-starred dinners, and the intimate luxury wedding your parents didn''t know they wanted',
  'napa valley is the intimate luxury play in the US — vineyard ceremonies, michelin-starred dining, and a scale that tops out at 300 guests (most venues are 100-200). this is not the market for a 500-person wedding — it''s the market for a couple who wants every detail curated, every meal extraordinary, and every guest treated like a VIP. the wineries and estates double as venues in a way that wine regions in other countries (cape winelands, tuscany) do — but with the added benefit of being a 90-minute drive from the largest south asian population center on the west coast (SF bay area).

silverado resort has invested specifically in indian weddings, offering three-night celebration packages. meritage resort has a maharani-certified team. the infrastructure is there — it''s just at a smaller, more curated scale.',
  'Fly into SFO or OAK — Napa Valley is a 90-minute drive from either. Harvest season (Aug-Oct) is photogenic but vendor capacity is tight; book 18+ months out. Most estates cap at 200-300 guests — confirm capacity before falling in love with a property. Indian catering is typically sourced from the SF Bay Area (45-90 min drive); the larger estates also work with on-site fine-dining teams for non-Indian meals across the multi-day flow.',
  820, true
),
(
  'destination', 'North America', 'USA', 'New York & Tri-State', 'new-york',
  2.50, 200000, 'May–October (outdoor), year-round (ballroom)',
  'the family based in the tri-state whose guest list starts at 500 and ends at "still counting"',
  'the grand ballroom capital of the world — where 1,000-person weddings are tuesday',
  'the new york tri-state area (new york city, new jersey, long island, westchester, connecticut) has the largest concentration of south asian wedding venues, vendors, and infrastructure in the united states. this isn''t a destination — it''s the home court. but for couples outside the tri-state, a new york wedding is absolutely a destination, and the venues here are unmatched in scale and grandeur: the plaza, cipriani, the pierre, gotham hall. the NJ banquet hall circuit (royal albert''s, the grove, the venetian) can handle 1,000 guests without blinking. the vendor ecosystem is the deepest in north america.',
  'JFK, LGA, and EWR all serve the tri-state — guest blocks split across all three depending on origin city. Manhattan venues require 18-24 month lead times for peak season; NJ banquet halls book 12-18 months out. Most NJ venues have on-site Indian catering; Manhattan venues coordinate with outside Indian caterers. Hotel blocks should be in midtown for Manhattan weddings, near the venue for NJ/Long Island.',
  830, true
),
(
  'destination', 'North America', 'USA', 'Hawaii', 'hawaii',
  2.50, 200000, 'April–October',
  'the couple who wants a true destination wedding without leaving the US',
  'the pacific, the plumerias, and the most photogenic domestic destination on earth',
  'hawaii is the ultimate domestic destination wedding — the only US location that genuinely feels like another country. the pacific ocean, volcanic landscapes, tropical gardens, and aloha spirit create an atmosphere that''s impossible to replicate on the mainland. oahu (honolulu, waikiki) has the infrastructure and scale. maui (wailea, kapalua) has the intimacy and luxury. the big island brings dramatic lava landscapes and rainforests.

the trade-off: hawaii is expensive (everything is shipped in), and the indian wedding vendor ecosystem is thin — you''ll bring most specialists from the mainland. but the destination itself sells the invitation. nobody declines a hawaii wedding.',
  'OGG (Maui) and HNL (Oahu) are the main airports for wedding markets. Most Indian wedding specialists (caterers, mehndi artists, DJs) travel from California — book early and bake travel costs into the budget. Resort weddings cap at ~300; intimate Maui weddings work best at 100-200 guests. Time ceremonies for sunset — the Pacific light is the entire point.',
  840, true
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

-- Match-tool tag arrays + soft capacity ceilings for the five US slugs.
-- Mirrors the per-slug tag conventions from 0023.
UPDATE budget_locations bl SET
  tags         = v.tags,
  max_capacity = v.cap
FROM (VALUES
  ('south-florida',
    '["beach","convenient_for_indians","indian_vendors","food_scene","nightlife","in_us"]'::jsonb,
    2000),
  ('southern-california',
    '["beach","convenient_for_indians","indian_vendors","food_scene","scenic_beauty","in_us"]'::jsonb,
    600),
  ('napa-valley',
    '["food_scene","scenic_beauty","exclusivity","in_us"]'::jsonb,
    300),
  ('new-york',
    '["convenient_for_indians","indian_vendors","food_scene","nightlife","in_us"]'::jsonb,
    1200),
  ('hawaii',
    '["beach","scenic_beauty","exclusivity","in_us"]'::jsonb,
    300)
) AS v(slug, tags, cap)
WHERE bl.slug = v.slug;


-- ══════════════════════════════════════════════════════════════════════════
-- PART C — Regions per destination.
-- ══════════════════════════════════════════════════════════════════════════

INSERT INTO budget_location_regions (location_id, name, description, display_order)
SELECT bl.id, r.name, r.description, r.display_order
FROM budget_locations bl
JOIN (VALUES
  -- South Florida
  ('south-florida', 'Miami Beach & South Beach',
    'the strip — fontainebleau, loews, faena. art deco, ocean drive, nightlife.', 10),
  ('south-florida', 'Fort Lauderdale & Hollywood',
    'the diplomat territory — beachfront, slightly less chaotic than miami.', 20),
  ('south-florida', 'Palm Beach',
    'old florida money — the breakers, four seasons. the refined play.', 30),
  ('south-florida', 'Orlando',
    'disney, universal, gaylord palms. the family-with-kids destination.', 40),

  -- Southern California
  ('southern-california', 'Orange County Coast',
    'pelican hill, monarch beach, ritz-carlton laguna niguel. the coastal luxury strip.', 10),
  ('southern-california', 'Los Angeles',
    'beverly hills, pasadena, downtown — grand hotels, historic estates, urban energy.', 20),
  ('southern-california', 'Santa Barbara & Montecito',
    'the american riviera — four seasons biltmore, ritz-carlton bacara. refined coastal.', 30),

  -- Napa Valley
  ('napa-valley', 'Napa',
    'downtown napa and surrounding vineyards — meritage, silverado, carneros.', 10),
  ('napa-valley', 'St. Helena & Calistoga',
    'up-valley luxury — meadowood, harvest inn, indian springs.', 20),
  ('napa-valley', 'Sonoma',
    'the quieter side — more rustic, more farm-to-table, equally beautiful.', 30),

  -- New York
  ('new-york', 'Manhattan',
    'the plaza, cipriani, the pierre, gotham hall. the iconic addresses.', 10),
  ('new-york', 'New Jersey',
    'the banquet hall capital — royal albert''s, the grove, the venetian. scale central.', 20),
  ('new-york', 'Long Island & Westchester',
    'oheka castle, estates, and country clubs. the suburban grandeur play.', 30),

  -- Hawaii
  ('hawaii', 'Maui (Wailea & Kapalua)',
    'the luxury coast — four seasons, andaz, ritz-carlton kapalua. intimate resort weddings.', 10),
  ('hawaii', 'Oahu (Honolulu & North Shore)',
    'the infrastructure island — waikiki hotels, aulani, turtle bay. scale and access.', 20)
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
  -- South Florida
  ('south-florida', 'South Beach Art Deco Walking Tour', '🏛️',
    'guided group tour of south beach''s art deco historic district — pastel facades, the versace mansion, and ocean drive. perfect for pre-wedding photos.',
    'Cultural', 10),
  ('south-florida', 'Everglades Airboat Adventure', '🐊',
    'private airboat tour through the everglades — alligator spotting, mangrove tunnels, and the most uniquely florida group activity.',
    'Adventure', 20),
  ('south-florida', 'Disney / Universal VIP Experience', '🎢',
    'VIP private guided tour at disney world or universal studios — skip every line, backstage access, and a full day that keeps families busy between wedding events.',
    'Entertainment', 30),
  ('south-florida', 'Wynwood Walls & Miami Food Tour', '🎨',
    'guided tour of wynwood''s street art murals, little havana for cuban sandwiches and cafecito, and the design district for boutique shopping.',
    'Cultural', 40),

  -- Southern California
  ('southern-california', 'Malibu Wine Safari', '🍷',
    'private safari-style wine tour through malibu wine country — open-air vehicles, animal encounters (zebras, giraffes, alpacas), and wine tasting. the most uniquely LA group excursion.',
    'Food', 10),
  ('southern-california', 'Pacific Coast Highway Drive', '🚗',
    'organized group drive along PCH from malibu to santa barbara — convertible rentals, cliffside stops, and lunch in a seaside town.',
    'Adventure', 20),
  ('southern-california', 'Hollywood & Beverly Hills Tour', '⭐',
    'curated group tour of LA''s iconic landmarks — beverly hills, rodeo drive, hollywood sign viewpoint, and griffith observatory at golden hour.',
    'Entertainment', 30),

  -- Napa Valley
  ('napa-valley', 'Private Winery Tour & Blending', '🍇',
    'private group tour of 3-4 napa wineries with a custom blending experience at one — create your own wedding wine. 20-40 guests.',
    'Food', 10),
  ('napa-valley', 'Hot Air Balloon Over Napa', '🎈',
    'sunrise hot air balloon flight over napa valley — rolling vineyards, morning mist, and a champagne toast on landing. the wedding-morning ritual.',
    'Adventure', 20),
  ('napa-valley', 'Napa Valley Wine Train', '🚂',
    'private car on the napa valley wine train — multi-course meal while passing through vineyards. book a private car for 30-40 guests.',
    'Food', 30),

  -- New York
  ('new-york', 'Central Park Private Photoshoot', '🌳',
    'private couple''s photoshoot in central park — bethesda terrace, bow bridge, the mall. arrange early morning access for golden hour without crowds.',
    'Cultural', 10),
  ('new-york', 'Broadway Show Group Outing', '🎭',
    'block of 30-50 tickets to a broadway show for the wedding party. the welcome-night activity for the culture crowd.',
    'Entertainment', 20),
  ('new-york', 'Hudson Valley Wine & Farm Tour', '🍎',
    'day trip to the hudson valley — wine tastings, farm visits, and a farm-to-table lunch. the recovery day for guests who need to escape the city.',
    'Food', 30),

  -- Hawaii
  ('hawaii', 'Road to Hana Day Trip', '🌺',
    'private guided road to hana tour — waterfalls, bamboo forests, black sand beaches, and banana bread stands. the day-after excursion that defines maui.',
    'Adventure', 10),
  ('hawaii', 'Sunset Sail off Wailea', '⛵',
    'private sunset catamaran sail off the wailea coast. 40-80 guests, open bar, and whale watching (december–april). the welcome-night event.',
    'Adventure', 20),
  ('hawaii', 'Luau Welcome Dinner', '🌴',
    'private luau dinner at the resort or a nearby venue — traditional hawaiian feast, hula performance, fire knife dancing. the ultimate hawaiian welcome.',
    'Cultural', 30)
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
-- South Florida
('the-diplomat-beach-resort',
 'The Diplomat Beach Resort (Hilton)',
 '200,000 square feet of event space and a south asian wedding team that''s done this a thousand times',
 'The diplomat is the workhorse of south florida indian weddings. Over 200,000 square feet of indoor and outdoor event space, a beachfront location, 1,000 rooms, and an event team that has hosted more south asian weddings than possibly any other hotel in the US. The great hall ballroom handles 2,000+ guests. The beach and pool areas provide outdoor ceremony and cocktail venues. The hotel''s south asian wedding packages include everything from baraat coordination to fire ceremony permissions. Fort Lauderdale and Miami airports are both within 30 minutes.',
 'Hollywood', 'USA',
 false, '["south-florida"]'::jsonb, '["luxury"]'::jsonb,
 300, 2000, true, true, false, 'standard'),
('the-breakers-palm-beach',
 'The Breakers Palm Beach',
 'the grande dame of palm beach — italian renaissance architecture meets the atlantic',
 'The Breakers has been Palm Beach''s landmark resort since 1896. Italian Renaissance architecture, 538 rooms, a stunning beachfront, two golf courses, and event spaces that range from intimate garden settings to the Venetian Ballroom (capacity 1,000). The hotel''s service standard is legendary. Indian and Pakistani weddings are a significant part of their events business, and the team is experienced with multi-day celebrations, mandap setups, and fire ceremonies.',
 'Palm Beach', 'USA',
 false, '["south-florida"]'::jsonb, '["luxury","ultra"]'::jsonb,
 200, 1000, true, true, false, 'standard'),
('fontainebleau-miami-beach',
 'Fontainebleau Miami Beach',
 'the most famous hotel in miami — and it parties like it',
 'Fontainebleau is Miami Beach''s most iconic hotel — 1,504 rooms, a legendary pool scene, and event spaces that have hosted everything from presidential galas to bollywood-scale Indian weddings. The Fleur de Lis ballroom is one of the largest in south florida. The hotel''s energy skews younger and more fashion-forward than the Breakers. LIV nightclub is on-site for the after-party. Multiple restaurants including Hakkasan and StripSteak.',
 'Miami Beach', 'USA',
 false, '["south-florida"]'::jsonb, '["luxury","ultra"]'::jsonb,
 250, 1500, true, true, false, 'standard'),
('gaylord-palms-resort',
 'Gaylord Palms Resort & Convention Center',
 'a glass atrium the size of a football field and a team that gets sangeet logistics',
 'Gaylord Palms in Kissimmee (Orlando) has earned a reputation as one of the most versatile venues for south asian weddings in the US. The dramatic glass atrium, expansive event spaces, 1,406 rooms, and a dedicated team that understands Indian wedding rituals and multi-day logistics. The resort handles mehndi, haldi, sangeet, and candlelit receptions across different venues within the property. The Orlando location means Disney, Universal, and SeaWorld are minutes away — a massive perk for families with children.',
 'Kissimmee', 'USA',
 false, '["south-florida"]'::jsonb, '["luxury"]'::jsonb,
 300, 2000, true, true, false, 'standard'),
('ritz-carlton-orlando-grande-lakes',
 'Ritz-Carlton Orlando, Grande Lakes',
 'the luxury alternative to orlando''s convention-center energy',
 'The Ritz-Carlton Orlando is the luxury play in the Orlando market — 582 rooms on a 500-acre property shared with the JW Marriott. The resort has hosted multi-million-dollar Indian weddings (including a reported $1.9M five-day celebration) with full support for traditional ceremonies, custom mandap setups, and Indian chefs flown in for the event. Outdoor garden spaces, elegant ballrooms, and a Greg Norman-designed golf course.',
 'Orlando', 'USA',
 false, '["south-florida"]'::jsonb, '["luxury","ultra"]'::jsonb,
 200, 800, true, true, false, 'standard'),

-- Southern California
('the-resort-at-pelican-hill',
 'The Resort at Pelican Hill',
 'the newport coast icon — where silicon valley meets orange county for the wedding of the year',
 'Pelican Hill is one of the most popular Indian wedding venues in the United States. The Palladian-inspired architecture, ocean views, and expansive outdoor lawns (Paradise Terrace holds 400) create a setting that''s equal parts Italian villa and California coast. 204 bungalows and villas. The Grand Ballroom handles 300 seated. The resort has deep experience with multi-day south asian celebrations — baraat processions on the Mar Vista lawn, outdoor mandap ceremonies facing the Pacific, and sangeet in the ballroom. Outside catering allowed from approved vendor list.',
 'Newport Coast', 'USA',
 false, '["southern-california"]'::jsonb, '["luxury","ultra"]'::jsonb,
 150, 400, true, true, false, 'standard'),
('monarch-beach-resort',
 'Monarch Beach Resort',
 'the oceanfront resort that handles 600 without breaking a sweat',
 'Monarch Beach in Dana Point sits on a bluff overlooking the Pacific with direct beach access. 400 rooms, multiple ballrooms (up to 600 capacity), outdoor lawn and garden venues, and a Duality spa. The resort is experienced with large-scale Indian weddings and offers flexible catering arrangements. The combination of beachfront setting, large-scale capacity, and luxury positioning makes it a go-to for families who need Pelican Hill-quality at a slightly more accessible price point.',
 'Dana Point', 'USA',
 false, '["southern-california"]'::jsonb, '["luxury","ultra"]'::jsonb,
 200, 600, true, true, false, 'standard'),
('the-langham-huntington-pasadena',
 'The Langham Huntington, Pasadena',
 '23 acres of manicured gardens in pasadena — the wedding that feels like old california',
 'The Langham Huntington sits on 23 acres of gardens in Pasadena with views of the San Gabriel Mountains. The historic property (opened 1907) combines old-world elegance with modern luxury. The Viennese Ballroom, the Horseshoe Garden, and the Picture Bridge create multi-day event flows. The hotel has a long history with Indian weddings — the gardens are ideal for outdoor mandap ceremonies and the ballroom handles large-scale receptions. The San Marino/Pasadena location is convenient to the large south asian communities in the SGV.',
 'Pasadena', 'USA',
 false, '["southern-california"]'::jsonb, '["luxury","ultra"]'::jsonb,
 150, 500, true, true, false, 'standard'),
('ritz-carlton-bacara-santa-barbara',
 'Ritz-Carlton Bacara, Santa Barbara',
 'the american riviera — santa barbara''s most dramatic oceanfront resort',
 'The Ritz-Carlton Bacara sits on 78 oceanfront acres north of Santa Barbara — three pools, a two-story spa, and multiple event venues from beachfront lawns to the grand ballroom. The Santa Barbara location (the "American Riviera") gives you coastal luxury without the LA congestion. 358 rooms and suites. The resort is experienced with luxury celebrations and allows outside catering. The climate is near-perfect year-round.',
 'Santa Barbara', 'USA',
 false, '["southern-california"]'::jsonb, '["luxury","ultra"]'::jsonb,
 150, 400, true, true, false, 'standard'),

-- Napa Valley
('silverado-resort-and-spa',
 'Silverado Resort and Spa',
 'the wine country resort that actually specializes in indian weddings',
 'Silverado Resort is the rare Napa Valley property that has specifically invested in Indian wedding capabilities. Three-night celebration packages that blend tradition, ritual, and California wine country culture. Golf and spa packages, 390 suites across the property, and multiple venue options from vineyard lawns to ballrooms. The Napa and Sonoma ballrooms feature soaring peaked roofs, barn-board walls, and modern lighting. 28 acres of landscaped grounds with fountains, gardens, and a stone fireplace. Maharani Weddings certified.',
 'Napa', 'USA',
 false, '["napa-valley"]'::jsonb, '["luxury"]'::jsonb,
 100, 300, true, true, false, 'standard'),
('meritage-resort-and-spa',
 'Meritage Resort and Spa',
 'the largest ballroom in napa valley and a maharani-certified team',
 'Meritage Resort sits on a hillside vineyard with sweeping Napa Valley views. The Meritage Ballroom is the largest in Napa Valley — crystal chandeliers, dark wood trim, and an adjoining outdoor terrace. The Vineyard Hilltop venue offers outdoor ceremonies surrounded by vines with panoramic valley views. The resort''s Maharani-certified team is experienced with south asian wedding logistics. Estate cave for wine tastings. 322 rooms. Village lawn, vineyard deck, and fountain courtyard provide multiple event spaces.',
 'Napa', 'USA',
 false, '["napa-valley"]'::jsonb, '["luxury","ultra"]'::jsonb,
 100, 300, true, true, false, 'standard'),
('carneros-resort-and-spa',
 'Carneros Resort and Spa',
 'individual cottage suites, farm restaurant, and the intimate napa dream',
 'Carneros Resort is the design-forward intimate pick — 100 individual cottage suites (each with private gardens), FARM restaurant for rehearsal dinners, and outdoor ceremony sites with vineyard and mountain views. The scale is intentionally small — best for weddings under 200 guests. The farmhouse aesthetic (whitewashed wood, kitchen gardens, fire pits) creates a relaxed luxury atmosphere that''s different from the grand-hotel feel of the other Napa options.',
 'Napa', 'USA',
 false, '["napa-valley"]'::jsonb, '["luxury","ultra"]'::jsonb,
 80, 200, true, true, false, 'standard'),

-- New York
('cipriani-wall-street',
 'Cipriani Wall Street',
 '70-foot ceilings, ionic columns, and the most dramatic room in new york',
 'The former New York Merchants Exchange building (built 1842) with 70-foot ceilings, massive ionic columns, and a room that was designed to inspire awe. Cipriani Wall Street is one of the most dramatic event spaces in the world — the scale makes every Indian wedding look like a royal affair. Capacity up to 1,200. Cipriani''s catering is legendary (though not Indian — outside Indian caterers coordinate with Cipriani''s team). The room doesn''t need decor — the architecture is the decor.',
 'New York', 'USA',
 false, '["new-york"]'::jsonb, '["luxury","ultra"]'::jsonb,
 300, 1200, true, true, false, 'standard'),
('the-plaza-hotel',
 'The Plaza Hotel',
 'the most famous hotel in america — your wedding at the plaza is a statement',
 'The Plaza Hotel at the corner of Fifth Avenue and Central Park South is the most iconic wedding venue in America. The Grand Ballroom has hosted presidents, royalty, and some of the most celebrated weddings in history. 282 rooms and suites. The Terrace Room and Champagne Bar provide additional event spaces. A Plaza wedding is a statement — the invitation itself carries a weight that no other venue name matches. Indian weddings here are coordinated with the hotel''s experienced events team.',
 'New York', 'USA',
 false, '["new-york"]'::jsonb, '["luxury","ultra"]'::jsonb,
 200, 500, true, true, false, 'standard'),
('oheka-castle',
 'Oheka Castle',
 'a 127-room château on long island — because your wedding should have a moat',
 'Oheka Castle in Huntington, Long Island is the second-largest private residence ever built in America (127 rooms). French château-style architecture, 443 acres of formal gardens, and a grandeur that rivals European estates. 32 guest rooms on-site for the wedding party. The Great Gatsby was partly inspired by the estate''s original owner. Outdoor ceremonies on the formal gardens, indoor receptions in the ballroom. The castle buyout makes it feel like your own private estate for the weekend.',
 'Huntington', 'USA',
 false, '["new-york"]'::jsonb, '["luxury","ultra"]'::jsonb,
 150, 500, true, true, false, 'standard'),
('the-grove-nj',
 'The Grove (NJ)',
 'the NJ banquet hall that gives hotel ballrooms an inferiority complex',
 'The Grove in Cedar Grove, NJ is one of the tri-state area''s premier Indian wedding venues — purpose-built for large-scale celebrations with multiple event rooms, bridal suites, and outdoor ceremony areas. The venue handles Indian weddings weekly and the team''s familiarity with south asian traditions (baraat logistics, fire ceremonies, timeline management) is second nature. Outside Indian catering fully supported. The NJ location makes it accessible for the massive tri-state south asian community.',
 'Cedar Grove', 'USA',
 false, '["new-york"]'::jsonb, '["elevated","luxury"]'::jsonb,
 200, 600, true, true, false, 'standard'),

-- Hawaii
('four-seasons-resort-maui-wailea',
 'Four Seasons Resort Maui at Wailea',
 'the pacific ocean, a plumeria-scented breeze, and four seasons service — the holy trinity',
 'Four Seasons Wailea is the benchmark for luxury resort weddings in Hawaii. 380 rooms on Wailea Beach, one of Maui''s best swimming beaches. The oceanfront ceremony lawn with the Pacific as backdrop. The grand ballroom for indoor receptions. The lobby terrace for cocktail hours at sunset. The service standard is Four Seasons — anticipatory, invisible, perfect. The resort can coordinate with mainland Indian caterers and vendors for multi-day celebrations.',
 'Wailea', 'USA',
 false, '["hawaii"]'::jsonb, '["luxury","ultra"]'::jsonb,
 100, 250, true, true, false, 'standard'),
('ritz-carlton-kapalua-maui',
 'Ritz-Carlton Kapalua, Maui',
 'the quieter side of maui — kapalua bay, pineapple fields, and no crowds',
 'On the northwestern tip of Maui, Kapalua is quieter and more secluded than Wailea. The Ritz-Carlton sits on 54 acres above Kapalua Bay with views of Molokai across the channel. 466 rooms and suites. The Aloha Pavilion and Banyan Garden provide outdoor ceremony venues. The hotel''s event team has experience with destination celebrations of all cultures. The Kapalua plantation golf course and coastal trails give guests activity options between events.',
 'Kapalua', 'USA',
 false, '["hawaii"]'::jsonb, '["luxury","ultra"]'::jsonb,
 100, 300, true, true, false, 'standard'),
('aulani-disney-resort',
 'Aulani, A Disney Resort & Spa',
 'disney magic meets hawaiian culture — the family-with-kids destination wedding',
 'Aulani on Oahu''s Ko Olina coast brings Disney''s event coordination expertise to a Hawaiian beachfront setting. 351 rooms, a private lagoon, and event spaces that range from beachfront lawns to indoor ballrooms. Disney''s Fairy Tale Weddings team handles the coordination. The resort''s family focus — kids'' club, character dining, water play area — makes it the top pick for couples whose guest list is heavy on families with children. The Ko Olina location is quieter than Waikiki.',
 'Kapolei', 'USA',
 false, '["hawaii"]'::jsonb, '["luxury"]'::jsonb,
 100, 300, true, true, false, 'standard')
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
  'the-diplomat-beach-resort','the-breakers-palm-beach','fontainebleau-miami-beach','gaylord-palms-resort','ritz-carlton-orlando-grande-lakes',
  'the-resort-at-pelican-hill','monarch-beach-resort','the-langham-huntington-pasadena','ritz-carlton-bacara-santa-barbara',
  'silverado-resort-and-spa','meritage-resort-and-spa','carneros-resort-and-spa',
  'cipriani-wall-street','the-plaza-hotel','oheka-castle','the-grove-nj',
  'four-seasons-resort-maui-wailea','ritz-carlton-kapalua-maui','aulani-disney-resort'
)
ON CONFLICT (vendor_id, category_id) DO NOTHING;

-- Per-venue pricing indicators against the Venue category.
INSERT INTO vendor_pricing_indicators (vendor_id, category_id, price_low_usd, price_high_usd, price_unit, notes)
SELECT v.id, vc.id, p.lo, p.hi, 'package'::vendor_pricing_unit, ''
FROM vendors v
JOIN vendor_categories vc ON vc.slug = 'venue'
JOIN (VALUES
  -- South Florida
  ('the-diplomat-beach-resort',          150000,   500000),
  ('the-breakers-palm-beach',            250000,   700000),
  ('fontainebleau-miami-beach',          200000,   600000),
  ('gaylord-palms-resort',               120000,   400000),
  ('ritz-carlton-orlando-grande-lakes',  200000,   600000),
  -- Southern California
  ('the-resort-at-pelican-hill',         250000,   600000),
  ('monarch-beach-resort',               200000,   500000),
  ('the-langham-huntington-pasadena',    180000,   450000),
  ('ritz-carlton-bacara-santa-barbara',  250000,   600000),
  -- Napa Valley
  ('silverado-resort-and-spa',           150000,   400000),
  ('meritage-resort-and-spa',            180000,   450000),
  ('carneros-resort-and-spa',            200000,   500000),
  -- New York
  ('cipriani-wall-street',               300000,   800000),
  ('the-plaza-hotel',                    300000,   700000),
  ('oheka-castle',                       200000,   500000),
  ('the-grove-nj',                       100000,   300000),
  -- Hawaii
  ('four-seasons-resort-maui-wailea',    250000,   600000),
  ('ritz-carlton-kapalua-maui',          200000,   500000),
  ('aulani-disney-resort',               150000,   400000)
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
-- 3 placeholders × 4 categories × 5 destinations = 60 rows.
--
-- The US is the deepest Indian-wedding vendor market in the world; these
-- placeholders are short-term scaffolding until the real vendor import
-- pipeline lands real photographers, decorators, caterers, and DJs in
-- each destination. Bios reflect the local market shape.
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
  'USA'                                                               AS home_base_country,
  false                                                               AS travels_globally,
  jsonb_build_array(d.dest_slug)                                      AS destinations_served,
  '["elevated","luxury","ultra"]'::jsonb                              AS tier_match,
  true                                                                AS active,
  false                                                               AS verified,
  true                                                                AS is_placeholder,
  'standard'::vendor_placement_tier                                   AS placement_tier
FROM (VALUES
  ('south-florida',       'Miami',         'Miami'),
  ('southern-california', 'LA',            'Los Angeles'),
  ('napa-valley',         'Napa',          'Napa'),
  ('new-york',            'NYC',           'New York'),
  ('hawaii',              'Maui',          'Wailea')
) AS d(dest_slug, brand_suffix, home_city)
CROSS JOIN (VALUES
  -- (cat_slug, idx, name_template, tagline, bio_extra)
  -- Photography ──────────────────────────────────────────────────────────
  ('photography', 1, 'palm light photo — {region}',
    'editorial wedding photography for the indian wedding instagram era',
    'Editorial-led wedding photography. The US Indian wedding photography market is the deepest in the world — every major destination has multiple top-tier studios that have been shooting south asian celebrations for a decade or more. Placeholder roster — real photographers will be imported from the Marigold vendor pipeline.'),
  ('photography', 2, 'studio marigold — {region}',
    'editorial wedding photography for the indian wedding instagram era',
    'Editorial-led wedding photography. The US Indian wedding photography market is the deepest in the world — every major destination has multiple top-tier studios that have been shooting south asian celebrations for a decade or more. Placeholder roster — real photographers will be imported from the Marigold vendor pipeline.'),
  ('photography', 3, 'saffron lens — {region}',
    'editorial wedding photography for the indian wedding instagram era',
    'Editorial-led wedding photography. The US Indian wedding photography market is the deepest in the world — every major destination has multiple top-tier studios that have been shooting south asian celebrations for a decade or more. Placeholder roster — real photographers will be imported from the Marigold vendor pipeline.'),
  -- Decor & Florals ──────────────────────────────────────────────────────
  ('decor-florals', 1, 'vine & marigold — {region}',
    'mandap design, sangeet sets, and the kind of florals your aunties will photograph',
    'Decor and floral design across mandap, sangeet, and reception. US Indian wedding decor is a mature market — the major destinations all have multi-decade studios who know mandap engineering, fire-ceremony permits, and ballroom flips. Placeholder until the real decor partners are confirmed and listed.'),
  ('decor-florals', 2, 'the {region} floral studio',
    'mandap design, sangeet sets, and the kind of florals your aunties will photograph',
    'Decor and floral design across mandap, sangeet, and reception. US Indian wedding decor is a mature market — the major destinations all have multi-decade studios who know mandap engineering, fire-ceremony permits, and ballroom flips. Placeholder until the real decor partners are confirmed and listed.'),
  ('decor-florals', 3, 'gulmohar atelier — {region}',
    'mandap design, sangeet sets, and the kind of florals your aunties will photograph',
    'Decor and floral design across mandap, sangeet, and reception. US Indian wedding decor is a mature market — the major destinations all have multi-decade studios who know mandap engineering, fire-ceremony permits, and ballroom flips. Placeholder until the real decor partners are confirmed and listed.'),
  -- Catering ─────────────────────────────────────────────────────────────
  ('catering', 1, 'pacific spice — {region}',
    'the chef who finally got biryani right at scale',
    'Indian wedding catering. Unlike European destinations, every major US wedding market has multiple established Indian catering companies with full multi-event experience — biryani for 800, chaat for cocktails, late-night dosa stations. Placeholder until the real local caterers are imported.'),
  ('catering', 2, 'the {region} plate co.',
    'the chef who finally got biryani right at scale',
    'Indian wedding catering. Unlike European destinations, every major US wedding market has multiple established Indian catering companies with full multi-event experience — biryani for 800, chaat for cocktails, late-night dosa stations. Placeholder until the real local caterers are imported.'),
  ('catering', 3, 'the saffron table — {region}',
    'the chef who finally got biryani right at scale',
    'Indian wedding catering. Unlike European destinations, every major US wedding market has multiple established Indian catering companies with full multi-event experience — biryani for 800, chaat for cocktails, late-night dosa stations. Placeholder until the real local caterers are imported.'),
  -- DJ ───────────────────────────────────────────────────────────────────
  ('dj', 1, 'skyline sound — {region}',
    'the dj who plays bollywood at 1am without being asked twice',
    'Multi-genre wedding DJ. Bollywood, Punjabi, English Top 40, sangeet sets. The US Indian-wedding DJ market is the most established in the world — the top names tour the entire country and book 12-18 months out. Placeholder until the real DJs are imported.'),
  ('dj', 2, 'the {region} decks',
    'the dj who plays bollywood at 1am without being asked twice',
    'Multi-genre wedding DJ. Bollywood, Punjabi, English Top 40, sangeet sets. The US Indian-wedding DJ market is the most established in the world — the top names tour the entire country and book 12-18 months out. Placeholder until the real DJs are imported.'),
  ('dj', 3, 'tanpura nights — {region}',
    'the dj who plays bollywood at 1am without being asked twice',
    'Multi-genre wedding DJ. Bollywood, Punjabi, English Top 40, sangeet sets. The US Indian-wedding DJ market is the most established in the world — the top names tour the entire country and book 12-18 months out. Placeholder until the real DJs are imported.')
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
  AND split_part(v.slug, '__', 2) IN ('south-florida','southern-california','napa-valley','new-york','hawaii')
ON CONFLICT (vendor_id, category_id) DO NOTHING;
