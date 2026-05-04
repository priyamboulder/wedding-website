-- ──────────────────────────────────────────────────────────────────────────
-- Migration 0036: Seed the Mexico & Caribbean continent.
--
-- Date:  2026-05-01
-- Scope: Third continent seed for the Marigold Destination Explorer.
--        Mexico & Caribbean — Cancún & Riviera Maya, Los Cabos, Punta
--        Cana, Montego Bay, Turks & Caicos. Pattern is identical to 0024
--        (South Asia) and 0035 (Europe).
--
-- Adds:
--   • Data: rich overview / best_for / tips / tags on five destinations.
--     Cancún & Riviera Maya, Los Cabos, Punta Cana, Montego Bay, Turks &
--     Caicos. Two of these (Jamaica + Turks & Caicos) existed as generic
--     rows in 0022 — those are deactivated below and replaced by
--     `montego-bay` and `turks-and-caicos`.
--   • Data: 3-4 regions per destination = 15 region rows.
--   • Data: 3-6 experiences per destination = 21 experience rows.
--   • Data: 3-5 real, named venues per destination = 21 venues with
--     "Venue" category assignments + per-vendor pricing indicators.
--     is_placeholder remains FALSE — these are researched, real
--     properties. Pricing reflects total wedding-package + room-block
--     spend (the all-inclusive resort model dominates here).
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
--   We keep continent='North America' here (raw geographic). lib/
--   destinations/continents.ts maps Mexico + Caribbean countries to
--   display slug 'mexico-caribbean' for the Tools surface.
--
-- This migration is idempotent — every INSERT uses ON CONFLICT.
-- ──────────────────────────────────────────────────────────────────────────


-- ══════════════════════════════════════════════════════════════════════════
-- PART A — Destinations.
--
-- Three new entries (cancun-riviera-maya, los-cabos, punta-cana) plus two
-- replacements (montego-bay supersedes the generic `jamaica` row from
-- 0022; turks-and-caicos supersedes `turks-caicos`). The originals are
-- deactivated below — not deleted — so any existing budget_user_plans
-- references stay intact.
-- ══════════════════════════════════════════════════════════════════════════

INSERT INTO budget_locations (
  type, continent, country, name, slug,
  multiplier, min_budget_usd, best_months, best_for,
  tagline, overview, tips, display_order, active
) VALUES
(
  'destination', 'North America', 'Mexico', 'Cancún & Riviera Maya, Mexico', 'cancun-riviera-maya',
  0.90, 150000, 'November–April',
  'the couple who wants destination magic without destination drama',
  'the one your guests will actually thank you for',
  'the undisputed heavyweight champion of south asian destination weddings. cancún and the riviera maya coast — stretching from costa mujeres down through playa del carmen to tulum — have hosted more indian weddings than any international destination outside india itself. and for good reason: 3-hour direct flights from dallas, houston, and most east coast cities. resorts with dedicated south asian wedding coordinators who''ve done this hundreds of times. on-site indian chefs. beachfront mandap setups that photograph like they were art-directed. the caribbean sea doing what it does best — being impossibly, offensively blue.

the riviera maya corridor gives you range: cancún''s hotel zone for big-energy celebrations, playa mujeres for secluded luxury, playa del carmen for the crew that wants 5th avenue nightlife between events, and tulum for the boho-chic couple who wants cenotes and jungle vibes. the infrastructure for south asian weddings here is unmatched — these resorts have mehndi artists on speed dial.',
  'book 14+ months out for peak season (dec–march). resorts block venue space by room night commitments, not deposits — if you don''t lock rooms early, another wedding will take your preferred dates. always negotiate the room-to-free-event ratio; most resorts start at 1 free event per 100 room nights but will flex to 1:75 if you push. cancún airport (CUN) is a 15-min to 90-min drive from any of the four sub-regions, with direct flights from every major US city.',
  500, true
),
(
  'destination', 'North America', 'Mexico', 'Los Cabos, Mexico', 'los-cabos',
  1.40, 200000, 'October–May',
  'the couple who wants editorial luxury, not spring break energy',
  'the pacific coast power move',
  'if cancún is the accessible crowd-pleaser, los cabos is the flex. the baja peninsula''s southern tip is where the pacific meets the sea of cortez, and the result is dramatic cliffs, desert landscapes, and a light quality that photographers describe as "absurd." los cabos skews older, wealthier, and more curated than the riviera maya — this is where you go when you want waldorf, nobu, and four seasons, not royalton and hard rock. the vibe is boutique luxury, farm-to-table dining, and architecture that belongs in wallpaper magazine.

the trade-off: los cabos has fewer resorts experienced with south asian weddings than cancún, and the pacific side beaches aren''t always swimmable (strong currents). but if your priority is aesthetic over all-inclusive convenience, cabo delivers something cancún can''t match.',
  'fly into SJD (San José del Cabo). the tourist corridor between cabo san lucas and san josé is a 30-minute drive — most luxury resorts live along this stretch. confirm beach swimmability with your venue: pacific-side beaches have strong currents and aren''t safe for guests, while sea-of-cortez side beaches are calm and swimmable. october–may is peak; avoid hurricane season (sept–oct overlap). farm-to-table catering imports work especially well here — flora farms and acre baja have the chef talent on the ground.',
  510, true
),
(
  'destination', 'North America', 'Dominican Republic', 'Punta Cana, Dominican Republic', 'punta-cana',
  0.75, 80000, 'December–April',
  'the couple who wants maximum celebration for minimum budget drama',
  'the all-inclusive that goes harder than your sangeet DJ',
  'punta cana is the value play that doesn''t feel like a value play. the dominican republic''s eastern tip has perfected the all-inclusive resort model, and the south asian wedding infrastructure here — led almost entirely by hard rock punta cana — is surprisingly deep. on-site indian chefs (chef krishna is legendary), dedicated south asian wedding coordinators, and resorts with 1,000+ rooms that swallow a 300-person guest list without breaking a sweat.

the vibe is more party than editorial — hard rock literally has a casino, a jack nicklaus golf course, and 13 pools. if your priority is "everyone has the time of their lives for four days straight," punta cana delivers that better than almost anywhere. the trade-off: fewer luxury boutique options than cabo or the riviera maya. this is resort-scale or nothing.',
  'punta cana airport (PUJ) is the gateway — direct flights from miami, atlanta, nyc, dallas. december–april is peak; august–october is hurricane season and prices drop hard. negotiate the room-to-free-event ratio aggressively at the all-inclusive resorts — they will flex from 1:100 down to 1:75 or even 1:50 for desi weddings that bring 200+ room nights. chef krishna at hard rock is the real deal — taste before defaulting to outside catering.',
  520, true
),
(
  'destination', 'North America', 'Jamaica', 'Montego Bay, Jamaica', 'montego-bay',
  0.85, 100000, 'December–April',
  'the couple whose guest list runs deep and whose families run louder',
  'one love, one mandap, one legendary party',
  'jamaica brings an energy that mexico doesn''t. the reggae-infused laid-back vibe mixes with the intensity of an indian wedding in a way that somehow works perfectly. montego bay is jamaica''s wedding capital — miles of white sand beach, all-inclusive resorts that have invested in south asian wedding infrastructure, and a culture of warmth and hospitality that makes every guest feel like family. the resorts here skew bigger (royalton, hyatt ziva) which is exactly what you need when your mom''s guest list hit 400 and she''s "still thinking."

the trade-off: fewer south asian wedding-specific vendors on-island than cancún, so you''ll likely fly in your decorator and mehndi artist. but the resort teams have gotten sharper every year, and the value proposition — especially at royalton properties — is strong.',
  'sangster international airport (MBJ) puts you 15-30 minutes from rose hall and the falmouth/trelawny resort strip. december–april is peak. resort teams handle the wedding-day flow well, but plan to import your decorator (Miami or Toronto-based companies travel here often), mehndi artist, and bollywood-specialist DJ. negotiate the room-to-free-event ratio — royalton and hyatt ziva both flex meaningfully on big indian wedding blocks.',
  530, true
),
(
  'destination', 'North America', 'Turks & Caicos', 'Turks & Caicos', 'turks-and-caicos',
  1.80, 250000, 'November–April',
  'the couple who chose the backdrop over the budget line',
  'the water that broke the internet',
  'grace bay beach has been named the best beach in the world so many times the award is basically retired. and when you see the water in person — that impossible, electric turquoise that looks photoshopped but isn''t — you understand why couples pay the premium. turks & caicos is the most exclusive destination in the caribbean for weddings: small island, limited resorts, no mass-tourism infrastructure. that means intimacy, privacy, and a guest experience that feels like a private island buyout.

the trade-off: everything is expensive. there''s no all-inclusive value play here. the island has minimal south asian wedding infrastructure, so you''re flying in every vendor — decorator, caterer, mehndi artist, priest. but if budget is secondary to "the most beautiful water on earth," turks is the answer.',
  'providenciales (PLS) is the only airport — direct flights from miami, nyc, dallas, charlotte. november–april is peak; june–october is hurricane risk. plan to import the entire vendor stack from miami or toronto — there is no on-island indian wedding vendor base. resorts are small (150-300 rooms each), so booking the full guest block requires 12-18 months lead time. grace bay shore-front venues photograph like nowhere else on earth — the trade-off is you''re paying for that view in every line item.',
  540, true
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

-- The generic `jamaica` and `turks-caicos` rows from 0022 are superseded
-- by `montego-bay` and `turks-and-caicos`. Deactivate rather than delete
-- so any existing budget_user_plans references stay intact.
UPDATE budget_locations SET active = false WHERE slug IN ('jamaica','turks-caicos');

-- Match-tool tag arrays + soft capacity ceilings for the five Mexico &
-- Caribbean slugs. Mirrors the per-slug tag conventions from 0023. Note:
-- no `long_haul_from_us` — these are short/medium-haul flights.
UPDATE budget_locations bl SET
  tags         = v.tags,
  max_capacity = v.cap
FROM (VALUES
  ('cancun-riviera-maya',
    '["beach","scenic_beauty","food_scene","nightlife","convenient_for_indians","indian_vendors"]'::jsonb,
    600),
  ('los-cabos',
    '["beach","scenic_beauty","exclusivity","food_scene"]'::jsonb,
    400),
  ('punta-cana',
    '["beach","food_scene","nightlife","convenient_for_indians","indian_vendors"]'::jsonb,
    1000),
  ('montego-bay',
    '["beach","food_scene","nightlife"]'::jsonb,
    900),
  ('turks-and-caicos',
    '["beach","exclusivity","scenic_beauty"]'::jsonb,
    250)
) AS v(slug, tags, cap)
WHERE bl.slug = v.slug;


-- ══════════════════════════════════════════════════════════════════════════
-- PART C — Regions per destination.
-- ══════════════════════════════════════════════════════════════════════════

INSERT INTO budget_location_regions (location_id, name, description, display_order)
SELECT bl.id, r.name, r.description, r.display_order
FROM budget_locations bl
JOIN (VALUES
  -- Cancún & Riviera Maya
  ('cancun-riviera-maya', 'Cancún Hotel Zone',
    'the strip — big resorts, big energy, big ocean views. closest to the airport', 10),
  ('cancun-riviera-maya', 'Costa Mujeres & Playa Mujeres',
    'the quieter, newer side of cancún. secluded luxury resorts on untouched coastline', 20),
  ('cancun-riviera-maya', 'Playa del Carmen',
    '5th avenue nightlife, boutique vibes, and resorts that feel less corporate', 30),
  ('cancun-riviera-maya', 'Tulum & Riviera South',
    'cenotes, jungle, and the boho energy that launched a thousand mood boards', 40),

  -- Los Cabos
  ('los-cabos', 'Cabo San Lucas',
    'the marina, el arco, the energy. closer to nightlife and the iconic arch', 10),
  ('los-cabos', 'San José del Cabo',
    'the art gallery side — quieter, more colonial, better restaurants', 20),
  ('los-cabos', 'The Tourist Corridor',
    'the golden strip between cabo and san josé. where the luxury resorts live', 30),

  -- Punta Cana
  ('punta-cana', 'Bávaro Beach',
    'the main strip — white sand, calm waters, most of the big resorts', 10),
  ('punta-cana', 'Cap Cana',
    'the private, gated side — hyatt, secrets, and marina vibes', 20),
  ('punta-cana', 'Macao Beach',
    'where hard rock lives — wilder beach, more energy', 30),

  -- Montego Bay
  ('montego-bay', 'Rose Hall',
    'the resort strip — hyatt, hilton, and the famous great house on the hill', 10),
  ('montego-bay', 'Montego Bay Beachfront',
    'downtown MoBay, doctor''s cave beach, and the cruise port energy', 20),
  ('montego-bay', 'Falmouth & Trelawny',
    'quieter coast east of MoBay — newer resorts, less crowds', 30),

  -- Turks & Caicos
  ('turks-and-caicos', 'Grace Bay',
    'the beach. the only beach that matters. where the resorts live', 10),
  ('turks-and-caicos', 'Chalk Sound',
    'the turquoise lagoon side — quieter, more private, stunning for photos', 20)
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
  -- Cancún & Riviera Maya
  ('cancun-riviera-maya', 'Cenote Ceremony at Ik-Kil', '🕳️',
    'private cenote ceremonies surrounded by hanging vines and turquoise sacred water — the most instagrammed moment of any riviera maya wedding', 'Cultural',     10),
  ('cancun-riviera-maya', 'Sunset Catamaran Sangeet', '⛵',
    'charter a private catamaran for a sunset sangeet cruise along the coast — DJ, open bar, 80 guests max', 'Entertainment',                                     20),
  ('cancun-riviera-maya', 'Tulum Ruins Pre-Wedding Shoot', '🏛️',
    'pre-wedding shoot at the tulum ruins overlooking the caribbean — arrange early morning access for golden hour without the tourist crowds', 'Cultural',       30),
  ('cancun-riviera-maya', 'Mezcal & Mehndi Experience', '🥃',
    'curated mezcal tasting paired with mehndi application — the pre-wedding event that fuses mexican and indian traditions perfectly', 'Food',                   40),
  ('cancun-riviera-maya', 'Xel-Há or Xcaret Group Excursion', '🐠',
    'eco-parks with snorkeling, zip-lining, and underground rivers — the rest-day guest activity', 'Adventure',                                                   50),
  ('cancun-riviera-maya', 'Beachfront Baraat with Dhol & Mariachi', '🥁',
    'a baraat procession on the beach backed by both a dhol player and a live mariachi band — sounds chaotic, ends perfect', 'Cultural',                          60),

  -- Los Cabos
  ('los-cabos', 'Mezcalería Tasting & Haldi Fusion', '🌵',
    'a curated mezcal education paired with haldi ceremony elements at a boutique distillery in san josé del cabo', 'Food',                                       10),
  ('los-cabos', 'El Arco Sunset Yacht Charter', '🛥️',
    'private yacht cruise past el arco at golden hour — capacity 40-80 guests, perfect for a welcome dinner or intimate celebration', 'Adventure',               20),
  ('los-cabos', 'Desert & Dunes Pre-Wedding Shoot', '🏜️',
    'pre-wedding shoot in the baja desert dunes with dramatic cliff backdrops — the landscape against traditional indian wedding attire is unreal', 'Cultural',  30),
  ('los-cabos', 'Farm-to-Table Cooking Class', '🍳',
    'group cooking experience at flora farms or acre baja — learn to make mole, press tortillas, mix cocktails with fresh-picked herbs', 'Food',                  40),

  -- Punta Cana
  ('punta-cana', 'Casino Night at Hard Rock', '🎰',
    'hard rock''s vegas-style casino is genuinely one of the best in the caribbean — organize a group casino night the evening before the wedding', 'Entertainment', 10),
  ('punta-cana', 'Jack Nicklaus Golf Tournament', '⛳',
    '18 holes of nicklaus-designed peace before the baraat chaos — hard rock golf club at cana bay is the move for a groomsmen tournament', 'Adventure',         20),
  ('punta-cana', 'Catamaran Party Cruise', '🚤',
    'private catamaran with DJ, open bar, and snorkeling stop — perfect for day 2 when your guests need ocean therapy', 'Entertainment',                          30),
  ('punta-cana', 'Cigar & Rum Tasting', '🥃',
    'curated dominican cigar rolling workshop and aged rum tasting — the dads-and-uncles activity they''ll talk about for years', 'Food',                          40),

  -- Montego Bay
  ('montego-bay', 'Dunn''s River Falls Group Climb', '🌊',
    'day trip to ocho rios for the iconic 600-foot waterfall climb — organize group transport for 30-50 guests, expect aunties in saris absolutely sending it', 'Adventure', 10),
  ('montego-bay', 'Jerk & Dhol Beach BBQ', '🍗',
    'private beach BBQ with a live jerk station, a dhol player, and rum punch — the crossover welcome dinner', 'Food',                                            20),
  ('montego-bay', 'Blue Mountain Coffee & Spice Tour', '☕',
    'half-day tour to a blue mountain coffee estate — pick spices, taste fresh-roasted coffee, give your guests a day off from dancing', 'Cultural',              30),
  ('montego-bay', 'Bob Marley Heritage Excursion', '🎵',
    'group excursion to nine mile, trench town, or kingston — culture, music, and the kind of group photo your guests will actually post', 'Cultural',            40),

  -- Turks & Caicos
  ('turks-and-caicos', 'Private Island Picnic on Iguana Island', '🏝️',
    'charter a boat to little water cay for a private beach picnic with your wedding party — the iguanas are friendly, the water is surreal', 'Adventure',        10),
  ('turks-and-caicos', 'Grace Bay Sunset Paddleboard Session', '🏄',
    'group paddleboard or kayak session at sunset — low-key, beautiful, the kind of pre-wedding activity that actually relaxes people', 'Wellness',               20),
  ('turks-and-caicos', 'Conch Salad & Island Cooking Class', '🐚',
    'beachside cooking class focused on turks & caicos specialties — conch salad, johnny cake, rum cocktails', 'Food',                                            30)
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
-- Note on pricing: for all-inclusive resort properties the range
-- reflects the WEDDING PACKAGE + ROOM BLOCK total spend, not the venue
-- rental fee in isolation.
-- ══════════════════════════════════════════════════════════════════════════

INSERT INTO vendors (
  slug, name, tagline, bio,
  home_base_city, home_base_country,
  travels_globally, destinations_served, tier_match,
  capacity_min, capacity_max,
  active, verified, is_placeholder, placement_tier
) VALUES
-- Cancún & Riviera Maya
('nizuc-resort-spa',
 'NIZUC Resort & Spa',
 'the one the planners whisper about',
 'Tucked at the very tip of cancún''s hotel zone where the caribbean meets the lagoon, NIZUC is the prestige pick. Two private beaches, a Mayan-inspired spa, and venues that range from intimate garden terraces to sweeping oceanfront lawns. 274 suites, all with private plunge pools or terraces. 15 minutes from the airport but feels like another planet. Not all-inclusive — which means you control the catering, not a buffet line.',
 'Cancún', 'Mexico',
 false, '["cancun-riviera-maya"]'::jsonb, '["luxury","ultra"]'::jsonb,
 100, 300, true, true, false, 'standard'),
('grand-velas-riviera-maya',
 'Grand Velas Riviera Maya',
 'the all-inclusive that doesn''t feel all-inclusive',
 'The most luxurious all-inclusive in the riviera maya, period. Dedicated south asian wedding team, Indian banquet menus, and a beachfront property so pristine your drone pilot will cry. Three distinct sections (Ambassador, Grand Class, Zen Grand) let you cluster family by vibe. The convention center handles 500+ guests without blinking.',
 'Playa del Carmen', 'Mexico',
 false, '["cancun-riviera-maya"]'::jsonb, '["luxury","ultra"]'::jsonb,
 150, 500, true, true, false, 'standard'),
('andaz-mayakoba',
 'Andaz Mayakoba',
 'the one that makes the hyatt loyalists feral',
 'Nestled inside the gated Mayakoba resort community alongside Rosewood, Fairmont, and Banyan Tree, Andaz Mayakoba sits on lagoons and mangroves connected by boat. The aesthetic is modern Mexican minimalism — concrete, wood, water everywhere. 214 rooms. The energy is quieter and more curated than the big cancún resorts, which is exactly the point.',
 'Playa del Carmen', 'Mexico',
 false, '["cancun-riviera-maya"]'::jsonb, '["luxury","ultra"]'::jsonb,
 80, 250, true, true, false, 'standard'),
('royalton-splash-riviera-cancun',
 'Royalton Splash Riviera Cancún',
 'the new kid with the strong south asian game',
 'New to the cancún landscape and already making noise for south asian weddings. Royalton Splash is entertainment-focused — water park, swim-up bars, and a south asian wedding package designed with input from actual desi wedding planners. It delivers on fun, value, and the kind of energy that makes a sangeet legendary. Modern rooms, strong food, a team that gets the multi-day flow.',
 'Costa Mujeres', 'Mexico',
 false, '["cancun-riviera-maya"]'::jsonb, '["elevated","luxury"]'::jsonb,
 150, 400, true, true, false, 'standard'),
('atelier-playa-mujeres',
 'Atelier Playa Mujeres',
 'the adults-only escape your parents secretly want',
 'A 16+ age policy makes Atelier Playa Mujeres the pick for couples who want a serene, refined setting. No screaming kids at the pool during your mehndi. The resort sits on an untouched stretch of costa mujeres beach — newer and less crowded than the hotel zone. Spacious suites, attentive service, venue options range beachfront to rooftop.',
 'Costa Mujeres', 'Mexico',
 false, '["cancun-riviera-maya"]'::jsonb, '["luxury","ultra"]'::jsonb,
 100, 300, true, true, false, 'standard'),

-- Los Cabos
('waldorf-astoria-los-cabos-pedregal',
 'Waldorf Astoria Los Cabos Pedregal',
 'you arrive through a private tunnel carved into a cliff — that''s the energy',
 'The only resort in mexico with a private tunnel entrance. Carved into Pedregal mountain overlooking the pacific, Waldorf Astoria is the most dramatic arrival sequence in destination weddings. Dedicated south asian wedding support, a culinary team that works with outside Indian chefs, and oceanfront terraces that make every ceremony feel cinematic. 175 suites. El Farallon restaurant is carved into the cliffs above the ocean.',
 'Cabo San Lucas', 'Mexico',
 false, '["los-cabos"]'::jsonb, '["luxury","ultra"]'::jsonb,
 80, 250, true, true, false, 'standard'),
('nobu-hotel-los-cabos',
 'Nobu Hotel Los Cabos',
 'japanese minimalism meets baja sunsets — the grid will break',
 'Nobu''s first hotel in mexico, on the southernmost tip of the baja peninsula. 200 rooms and suites. Clean-lined contemporary architecture — a deliberate contrast to the ornate maximalism of most indian wedding venues, which is exactly why it works. Nobu restaurant on the beach for your rehearsal dinner. Multiple indoor/outdoor venues up to 450 guests.',
 'San José del Cabo', 'Mexico',
 false, '["los-cabos"]'::jsonb, '["luxury","ultra"]'::jsonb,
 100, 450, true, true, false, 'standard'),
('montage-los-cabos',
 'Montage Los Cabos',
 'the one your planner recommends when budget isn''t the question',
 'Montage''s baja property is the kind of resort where every detail — from the hand-painted tiles to the infinity pool that melts into the sea of cortez — feels intentional. 122 suites and residences. The Twin Whale Beach Club, mezcal bar, and multiple event lawns create a multi-day flow that never repeats a venue. Service standard is absurd. Not all-inclusive — full catering flexibility.',
 'San José del Cabo', 'Mexico',
 false, '["los-cabos"]'::jsonb, '["luxury","ultra"]'::jsonb,
 100, 300, true, true, false, 'standard'),
('grand-velas-los-cabos',
 'Grand Velas Los Cabos',
 'the all-inclusive that doesn''t apologize for being all-inclusive',
 'The pacific-side sibling of the riviera maya Grand Velas, and arguably even more stunning. 304 suites, all ocean-facing. One of the largest convention centers in los cabos, which means your sangeet can actually breathe. World-class spa, multiple fine-dining restaurants, and the same dedication to south asian celebrations as the riviera maya property.',
 'Cabo San Lucas', 'Mexico',
 false, '["los-cabos"]'::jsonb, '["luxury","ultra"]'::jsonb,
 150, 400, true, true, false, 'standard'),
('flora-farms-los-cabos',
 'Flora Farms',
 'a 25-acre organic farm where your rehearsal dinner grows on-site',
 'Not a resort — Flora Farms is a 25-acre working organic farm in the foothills of the sierra de la laguna mountains. Farm-to-table restaurants, an on-site bar, a grocery and ice cream shop, and event spaces that feel like a magazine spread. The anti-resort pick — for the couple who wants their mehndi in a garden that smells like basil and their reception under string lights strung between mango trees. No rooms onsite; pair with a nearby resort.',
 'San José del Cabo', 'Mexico',
 false, '["los-cabos"]'::jsonb, '["luxury"]'::jsonb,
 60, 200, true, true, false, 'standard'),

-- Punta Cana
('hard-rock-hotel-casino-punta-cana',
 'Hard Rock Hotel & Casino Punta Cana',
 '1,775 rooms, a casino, and a chef who''s catered more indian weddings than your mom',
 'The undisputed king of south asian destination weddings in the caribbean. 1,775 rooms across 121 acres of macao beach. Hosted hundreds of indian weddings and has the infrastructure to prove it: dedicated Ishq Rocks wedding coordinators trained in south asian customs, on-site indian cuisine from Pranama restaurant and Chef Krishna, beachfront mandap setups, grand ballrooms, tropical gardens, poolside terraces, rooftop venue. The casino alone is a guest experience — the uncles will be occupied.',
 'Punta Cana', 'Dominican Republic',
 false, '["punta-cana"]'::jsonb, '["elevated","luxury"]'::jsonb,
 200, 1000, true, true, false, 'standard'),
('hyatt-zilara-cap-cana',
 'Hyatt Zilara Cap Cana',
 'the adults-only escape from hard rock''s energy',
 'Cap cana''s gated luxury enclave, adults-only. Hyatt Zilara is the refined counterpoint to Hard Rock''s maximalism — quieter beaches, elegant suites, marina nearby. Stunning ceremony venues (beachfront and garden) and all-inclusive quality a tier above most punta cana options. South asian wedding support available but less battle-tested than Hard Rock.',
 'Punta Cana', 'Dominican Republic',
 false, '["punta-cana"]'::jsonb, '["luxury","ultra"]'::jsonb,
 80, 300, true, true, false, 'standard'),
('dreams-macao-beach-punta-cana',
 'Dreams Macao Beach Punta Cana',
 'the solid pick when hard rock is booked',
 'On macao beach near Hard Rock, Dreams Macao offers a strong south asian wedding package (Dulha Dulhan) with beachfront ceremonies, a ballroom, and garden venues. 500+ suites, swim-out options, and a family-friendly energy. Less flashy than Hard Rock but more polished in some areas — newer rooms, calmer beach.',
 'Punta Cana', 'Dominican Republic',
 false, '["punta-cana"]'::jsonb, '["elevated","luxury"]'::jsonb,
 100, 300, true, true, false, 'standard'),
('kukua-beach-club',
 'Kukua Beach Club',
 'the non-resort option punta cana didn''t know it needed',
 'A standalone beachfront event venue — not attached to a resort. Kukua offers a thatched-roof pavilion on the sand with 360-degree ocean views, a full kitchen, and the flexibility to bring your own everything: caterer, decor, DJ, bartender. The blank-canvas pick in a destination dominated by resorts. Perfect for one event (reception or sangeet) while using a resort for the rest.',
 'Bávaro', 'Dominican Republic',
 false, '["punta-cana"]'::jsonb, '["elevated","luxury"]'::jsonb,
 60, 250, true, true, false, 'standard'),

-- Montego Bay
('royalton-blue-waters-montego-bay',
 'Royalton Blue Waters Montego Bay',
 'the man-made island ceremony that your photographer will frame',
 'The go-to for south asian weddings in jamaica. Three wedding gazebos including a private man-made island venue, beachfront ceremony space, and a resort that understands multi-day celebrations. Kohinoor wedding packages (Noor and Heera tiers) are specifically designed for indian weddings with customizable menus. 11 dining options including indian cuisine. Modern rooms, lazy river, moroccan-themed rooftop lounge.',
 'Falmouth', 'Jamaica',
 false, '["montego-bay"]'::jsonb, '["luxury","ultra"]'::jsonb,
 100, 400, true, true, false, 'standard'),
('hyatt-ziva-rose-hall',
 'Hyatt Ziva Rose Hall',
 '20,000 square feet of lawn and a ballroom that swallows 500',
 'The scale play in montego bay. Hyatt Ziva''s East Lawn is 20,176 sqft — enough for a 900-person reception-style event. The Grand Ballroom in the convention center adds 10,774 sqft of indoor space. South asian wedding packages with indian banquet menus and open bar. Family-friendly with multiple pools, a water slide, and beachfront dining. Views of the resort gardens and the famous Rose Hall Great House on the hill above.',
 'Rose Hall', 'Jamaica',
 false, '["montego-bay"]'::jsonb, '["luxury","ultra"]'::jsonb,
 200, 900, true, true, false, 'standard'),
('half-moon-resort',
 'Half Moon Resort',
 'old caribbean money energy — if the kennedys were jamaican',
 '400 acres of manicured grounds, a 2-mile private beach, an equestrian center, and a history dating back to 1954. Half Moon is the heritage luxury pick in jamaica — old-world caribbean elegance with modern renovations. Villas, suites, and cottages spread across the property give it a village feel rather than a tower-block resort. Not all-inclusive by default (european plan available) — catering flexibility for indian cuisine.',
 'Rose Hall', 'Jamaica',
 false, '["montego-bay"]'::jsonb, '["luxury","ultra"]'::jsonb,
 80, 250, true, true, false, 'standard'),
('excellence-oyster-bay',
 'Excellence Oyster Bay',
 'adults-only on a private peninsula — the grown-up pick',
 'Set on a private peninsula in falmouth, Excellence Oyster Bay is adults-only and feels genuinely secluded. Rooftop bar, beachfront gazebo, and multiple restaurant venues. Smaller and more intimate than the Royalton properties — better service ratios, more curated feel. Good for weddings under 200 guests where you want the whole resort to feel like your private venue.',
 'Falmouth', 'Jamaica',
 false, '["montego-bay"]'::jsonb, '["luxury","ultra"]'::jsonb,
 80, 200, true, true, false, 'standard'),

-- Turks & Caicos
('ritz-carlton-turks-caicos',
 'The Ritz-Carlton, Turks & Caicos',
 'ritz service meets the world''s best beach — the math maths',
 'The newest luxury entrant on grace bay, the Ritz-Carlton brings its signature service standard to the world''s best beach. Suites and residences, full-service spa, beachfront event lawn, and the kind of attention to detail that justifies the price tag. Intimate enough that a 150-person wedding can feel like a private buyout.',
 'Providenciales', 'Turks & Caicos',
 false, '["turks-and-caicos"]'::jsonb, '["luxury","ultra"]'::jsonb,
 80, 200, true, true, false, 'standard'),
('grace-bay-club',
 'Grace Bay Club',
 'the OG grace bay resort — before everyone else showed up',
 'The original luxury resort on the beach and still one of the best. Three sections — the Hotel, the Villas, and the Estate — give you range for different guest types. The Infiniti Bar is iconic, the beach is pristine, and the scale is small enough that your wedding genuinely takes over the property. No convention center energy — this is intimate luxury.',
 'Providenciales', 'Turks & Caicos',
 false, '["turks-and-caicos"]'::jsonb, '["luxury","ultra"]'::jsonb,
 60, 150, true, true, false, 'standard'),
('the-shore-club-turks',
 'The Shore Club',
 'long bay''s best-kept secret — until your instagram posts',
 'On long bay beach (adjacent to grace bay), The Shore Club offers a more modern, design-forward aesthetic than the classic grace bay resorts. Suites and penthouses, multiple pools, and a beach somehow even less crowded than grace bay proper. Flexible event spaces — beachfront, poolside, and garden.',
 'Providenciales', 'Turks & Caicos',
 false, '["turks-and-caicos"]'::jsonb, '["luxury","ultra"]'::jsonb,
 80, 200, true, true, false, 'standard')
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
  'nizuc-resort-spa','grand-velas-riviera-maya','andaz-mayakoba','royalton-splash-riviera-cancun','atelier-playa-mujeres',
  'waldorf-astoria-los-cabos-pedregal','nobu-hotel-los-cabos','montage-los-cabos','grand-velas-los-cabos','flora-farms-los-cabos',
  'hard-rock-hotel-casino-punta-cana','hyatt-zilara-cap-cana','dreams-macao-beach-punta-cana','kukua-beach-club',
  'royalton-blue-waters-montego-bay','hyatt-ziva-rose-hall','half-moon-resort','excellence-oyster-bay',
  'ritz-carlton-turks-caicos','grace-bay-club','the-shore-club-turks'
)
ON CONFLICT (vendor_id, category_id) DO NOTHING;

-- Per-venue pricing indicators against the Venue category. Ranges below
-- reflect total wedding-package + room-block spend, not venue-rental fees
-- in isolation (the all-inclusive resort model dominates this region).
INSERT INTO vendor_pricing_indicators (vendor_id, category_id, price_low_usd, price_high_usd, price_unit, notes)
SELECT v.id, vc.id, p.lo, p.hi, 'package'::vendor_pricing_unit, ''
FROM vendors v
JOIN vendor_categories vc ON vc.slug = 'venue'
JOIN (VALUES
  -- Cancún & Riviera Maya
  ('nizuc-resort-spa',                 180000,  400000),
  ('grand-velas-riviera-maya',         200000,  500000),
  ('andaz-mayakoba',                   200000,  450000),
  ('royalton-splash-riviera-cancun',    80000,  200000),
  ('atelier-playa-mujeres',            150000,  350000),
  -- Los Cabos
  ('waldorf-astoria-los-cabos-pedregal',300000, 600000),
  ('nobu-hotel-los-cabos',             200000,  450000),
  ('montage-los-cabos',                350000,  650000),
  ('grand-velas-los-cabos',            250000,  500000),
  ('flora-farms-los-cabos',            150000,  350000),
  -- Punta Cana
  ('hard-rock-hotel-casino-punta-cana', 80000,  250000),
  ('hyatt-zilara-cap-cana',            120000,  300000),
  ('dreams-macao-beach-punta-cana',     70000,  180000),
  ('kukua-beach-club',                  50000,  150000),
  -- Montego Bay
  ('royalton-blue-waters-montego-bay', 100000,  250000),
  ('hyatt-ziva-rose-hall',             100000,  300000),
  ('half-moon-resort',                 200000,  450000),
  ('excellence-oyster-bay',            120000,  280000),
  -- Turks & Caicos
  ('ritz-carlton-turks-caicos',        350000,  700000),
  ('grace-bay-club',                   300000,  600000),
  ('the-shore-club-turks',             300000,  600000)
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
-- Note on Mexico/Caribbean vendor sourcing: cancún and punta cana have
-- mature on-island indian wedding vendor bases (decorators, mehndi
-- artists, DJs operating locally). Cabo, montego bay, and turks & caicos
-- typically import the indian-specialty stack from miami, toronto, or
-- mumbai. Bios reflect that.
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
  ('cancun-riviera-maya', 'Cancún',      'Cancún',         'Mexico'),
  ('los-cabos',           'Cabo',        'Cabo San Lucas', 'Mexico'),
  ('punta-cana',          'Punta Cana',  'Punta Cana',     'Dominican Republic'),
  ('montego-bay',         'MoBay',       'Montego Bay',    'Jamaica'),
  ('turks-and-caicos',    'Turks',       'Providenciales', 'Turks & Caicos')
) AS d(dest_slug, brand_suffix, home_city, country)
CROSS JOIN (VALUES
  -- (cat_slug, idx, name_template, tagline, bio_extra)
  -- Photography ──────────────────────────────────────────────────────────
  ('photography', 1, 'studio hibiscus — {region}',
    'beach light, golden hour, and a drone reel that breaks the family group chat',
    'Editorial-led wedding photography for Mexico & Caribbean destination weddings. Cancún and Punta Cana have a deep base of on-island indian-wedding photographers; Cabo, Montego Bay, and Turks weddings typically fly the photography team in from Miami, Toronto, or Mumbai. Placeholder roster — real photographers will be imported from the Marigold vendor pipeline.'),
  ('photography', 2, 'salt & sand studio — {region}',
    'beach light, golden hour, and a drone reel that breaks the family group chat',
    'Editorial-led wedding photography for Mexico & Caribbean destination weddings. Cancún and Punta Cana have a deep base of on-island indian-wedding photographers; Cabo, Montego Bay, and Turks weddings typically fly the photography team in from Miami, Toronto, or Mumbai. Placeholder roster — real photographers will be imported from the Marigold vendor pipeline.'),
  ('photography', 3, 'marigold lens co. — {region}',
    'beach light, golden hour, and a drone reel that breaks the family group chat',
    'Editorial-led wedding photography for Mexico & Caribbean destination weddings. Cancún and Punta Cana have a deep base of on-island indian-wedding photographers; Cabo, Montego Bay, and Turks weddings typically fly the photography team in from Miami, Toronto, or Mumbai. Placeholder roster — real photographers will be imported from the Marigold vendor pipeline.'),
  -- Videography ──────────────────────────────────────────────────────────
  ('videography', 1, 'celluloid marigold — {region}',
    'the catamaran-shot drone reel your sister will use as a screensaver',
    'Cinematic wedding films, multi-cam with drone coverage. The cinematography team almost always travels with the photographers — same crew, two cameras. Placeholder until the real videography roster is published.'),
  ('videography', 2, 'the {region} reel co.',
    'the catamaran-shot drone reel your sister will use as a screensaver',
    'Cinematic wedding films, multi-cam with drone coverage. The cinematography team almost always travels with the photographers — same crew, two cameras. Placeholder until the real videography roster is published.'),
  ('videography', 3, 'kalakaar films — {region}',
    'the catamaran-shot drone reel your sister will use as a screensaver',
    'Cinematic wedding films, multi-cam with drone coverage. The cinematography team almost always travels with the photographers — same crew, two cameras. Placeholder until the real videography roster is published.'),
  -- Decor & Florals ──────────────────────────────────────────────────────
  ('decor-florals', 1, 'marigold & sage — {region}',
    'florals that hold up in caribbean wind, designed for the drone shot',
    'Decor and floral design across mandap, sangeet, and reception. Cancún and Punta Cana have full on-island indian wedding decor teams. Cabo, Montego Bay, and Turks decor is typically led by Miami-based or Toronto-based desi decorators who travel in with the team. Placeholder until the real decor partners are confirmed and listed.'),
  ('decor-florals', 2, 'palm & petal atelier — {region}',
    'florals that hold up in caribbean wind, designed for the drone shot',
    'Decor and floral design across mandap, sangeet, and reception. Cancún and Punta Cana have full on-island indian wedding decor teams. Cabo, Montego Bay, and Turks decor is typically led by Miami-based or Toronto-based desi decorators who travel in with the team. Placeholder until the real decor partners are confirmed and listed.'),
  ('decor-florals', 3, 'the {region} flower co.',
    'florals that hold up in caribbean wind, designed for the drone shot',
    'Decor and floral design across mandap, sangeet, and reception. Cancún and Punta Cana have full on-island indian wedding decor teams. Cabo, Montego Bay, and Turks decor is typically led by Miami-based or Toronto-based desi decorators who travel in with the team. Placeholder until the real decor partners are confirmed and listed.'),
  -- Catering ─────────────────────────────────────────────────────────────
  ('catering', 1, 'spice route — {region}',
    'the chef who finally got biryani right at scale on a beach',
    'Indian wedding catering for Mexico & Caribbean destinations. Hard Rock Punta Cana''s Chef Krishna and the dedicated south asian culinary teams at Grand Velas (RM and Cabo) handle most weddings in-house. Independent indian catering operators are concentrated in Cancún and Mexico City; Caribbean island weddings typically import chefs from Toronto or Miami. Placeholder entry.'),
  ('catering', 2, 'the saffron & sea kitchen — {region}',
    'the chef who finally got biryani right at scale on a beach',
    'Indian wedding catering for Mexico & Caribbean destinations. Hard Rock Punta Cana''s Chef Krishna and the dedicated south asian culinary teams at Grand Velas (RM and Cabo) handle most weddings in-house. Independent indian catering operators are concentrated in Cancún and Mexico City; Caribbean island weddings typically import chefs from Toronto or Miami. Placeholder entry.'),
  ('catering', 3, 'the {region} fusion table',
    'the chef who finally got biryani right at scale on a beach',
    'Indian wedding catering for Mexico & Caribbean destinations. Hard Rock Punta Cana''s Chef Krishna and the dedicated south asian culinary teams at Grand Velas (RM and Cabo) handle most weddings in-house. Independent indian catering operators are concentrated in Cancún and Mexico City; Caribbean island weddings typically import chefs from Toronto or Miami. Placeholder entry.'),
  -- Hair & Makeup ────────────────────────────────────────────────────────
  ('hair-makeup', 1, 'rouge & rosewater — {region}',
    'the bridal team that travels with the dress',
    'Bridal hair and makeup, multi-event coverage, on-site touch-ups. Top indian-wedding glam teams (Toronto, NYC, Mumbai-based) travel with the wedding for Mexico & Caribbean destinations — book 12+ months out for peak season (Dec–April). Placeholder until the real glam roster lands.'),
  ('hair-makeup', 2, 'the {region} glam studio',
    'the bridal team that travels with the dress',
    'Bridal hair and makeup, multi-event coverage, on-site touch-ups. Top indian-wedding glam teams (Toronto, NYC, Mumbai-based) travel with the wedding for Mexico & Caribbean destinations — book 12+ months out for peak season (Dec–April). Placeholder until the real glam roster lands.'),
  ('hair-makeup', 3, 'kajal beauty — {region}',
    'the bridal team that travels with the dress',
    'Bridal hair and makeup, multi-event coverage, on-site touch-ups. Top indian-wedding glam teams (Toronto, NYC, Mumbai-based) travel with the wedding for Mexico & Caribbean destinations — book 12+ months out for peak season (Dec–April). Placeholder until the real glam roster lands.'),
  -- Mehndi Artist ────────────────────────────────────────────────────────
  ('mehndi-artist', 1, 'henna house — {region}',
    'the toronto-based mehndi artist who''ll fly in for the weekend',
    'Bridal mehndi plus family applications, multi-day coverage. Indian-specialty mehndi artists for Mexico & Caribbean weddings are typically flown from Toronto, NYC, or Miami — Cancún has a small on-island roster, but the islands and Cabo do not. Placeholder until real artists are listed.'),
  ('mehndi-artist', 2, 'the {region} mehndi atelier',
    'the toronto-based mehndi artist who''ll fly in for the weekend',
    'Bridal mehndi plus family applications, multi-day coverage. Indian-specialty mehndi artists for Mexico & Caribbean weddings are typically flown from Toronto, NYC, or Miami — Cancún has a small on-island roster, but the islands and Cabo do not. Placeholder until real artists are listed.'),
  ('mehndi-artist', 3, 'gulaab mehndi co. — {region}',
    'the toronto-based mehndi artist who''ll fly in for the weekend',
    'Bridal mehndi plus family applications, multi-day coverage. Indian-specialty mehndi artists for Mexico & Caribbean weddings are typically flown from Toronto, NYC, or Miami — Cancún has a small on-island roster, but the islands and Cabo do not. Placeholder until real artists are listed.'),
  -- DJ ───────────────────────────────────────────────────────────────────
  ('dj', 1, 'rhythm & brass — {region}',
    'the dj who plays bollywood at 1am without being asked twice',
    'Multi-genre wedding DJ. Bollywood, Punjabi, English Top 40, sangeet sets, plus reggaeton/dembow for the Mexico & Caribbean nightlife window. Bollywood-specialist DJs typically fly in from Toronto, NYC, or Mumbai for these weddings; local DJs handle the cocktail-hour and house-music windows. Placeholder until the real DJs are imported.'),
  ('dj', 2, 'tropic decks — {region}',
    'the dj who plays bollywood at 1am without being asked twice',
    'Multi-genre wedding DJ. Bollywood, Punjabi, English Top 40, sangeet sets, plus reggaeton/dembow for the Mexico & Caribbean nightlife window. Bollywood-specialist DJs typically fly in from Toronto, NYC, or Mumbai for these weddings; local DJs handle the cocktail-hour and house-music windows. Placeholder until the real DJs are imported.'),
  ('dj', 3, 'the {region} sound system',
    'the dj who plays bollywood at 1am without being asked twice',
    'Multi-genre wedding DJ. Bollywood, Punjabi, English Top 40, sangeet sets, plus reggaeton/dembow for the Mexico & Caribbean nightlife window. Bollywood-specialist DJs typically fly in from Toronto, NYC, or Mumbai for these weddings; local DJs handle the cocktail-hour and house-music windows. Placeholder until the real DJs are imported.'),
  -- Wedding Planner ──────────────────────────────────────────────────────
  ('wedding-planner', 1, 'the {region} planning atelier',
    'the planner who knows every all-inclusive''s room-block flex by heart',
    'Full-service destination wedding planning, multi-event coordination, vendor import management. Mexico & Caribbean planners need deep relationships with resort wedding teams (room-to-event ratio negotiation is the entire game) plus indian-wedding production knowledge for the side events (mehndi, sangeet, baraat). Placeholder until the real planner roster is finalised.'),
  ('wedding-planner', 2, 'saffron events — {region}',
    'the planner who knows every all-inclusive''s room-block flex by heart',
    'Full-service destination wedding planning, multi-event coordination, vendor import management. Mexico & Caribbean planners need deep relationships with resort wedding teams (room-to-event ratio negotiation is the entire game) plus indian-wedding production knowledge for the side events (mehndi, sangeet, baraat). Placeholder until the real planner roster is finalised.'),
  ('wedding-planner', 3, 'phulkari planning co. — {region}',
    'the planner who knows every all-inclusive''s room-block flex by heart',
    'Full-service destination wedding planning, multi-event coordination, vendor import management. Mexico & Caribbean planners need deep relationships with resort wedding teams (room-to-event ratio negotiation is the entire game) plus indian-wedding production knowledge for the side events (mehndi, sangeet, baraat). Placeholder until the real planner roster is finalised.')
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
  AND split_part(v.slug, '__', 2) IN ('cancun-riviera-maya','los-cabos','punta-cana','montego-bay','turks-and-caicos')
ON CONFLICT (vendor_id, category_id) DO NOTHING;
