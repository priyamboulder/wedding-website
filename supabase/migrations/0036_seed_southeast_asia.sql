-- ──────────────────────────────────────────────────────────────────────────
-- Migration 0036: Seed the Southeast Asia continent.
--
-- Date:  2026-05-01
-- Scope: Third continent seed for the Marigold Destination Explorer.
--        Southeast Asia — Phuket, Koh Samui, Bali, Singapore.
--        Pattern is identical to 0024 (South Asia) and 0035 (Europe).
--
-- Adds:
--   • Data: rich overview / best_for / tips / tags on Bali and Singapore
--     (already created by 0022) plus two new slugs — Phuket and Koh
--     Samui — that replace the generic `thailand` row from 0022
--     (deactivated below).
--   • Data: 3-4 regions per destination = ~14 region rows.
--   • Data: 3-6 experiences per destination = ~18 experience rows.
--   • Data: 3-5 real, named venues per destination = 17 venues with
--     "Venue" category assignments + per-vendor pricing indicators.
--     is_placeholder remains FALSE — these are researched, real
--     properties.
--   • Data: 3 placeholder vendors × 4 categories × 4 destinations = 48
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
--   We keep continent='Asia' here. lib/destinations/continents.ts maps
--   country=Thailand|Indonesia|Singapore → display slug 'southeast-asia'
--   for the Tools surface (so they don't collide with India/South Asia).
--
-- Note on placeholder vendors:
--   Per the SE Asia spec, only 4 categories get placeholders here
--   (Photography, Decor & Florals, Catering, DJ) — the four that have
--   the strongest local Indian-wedding infrastructure in this region.
--   Other categories (videography, glam, mehndi, planning) will be
--   imported as real vendors once the SE Asia roster lands.
--
-- This migration is idempotent — every INSERT uses ON CONFLICT.
-- ──────────────────────────────────────────────────────────────────────────


-- ══════════════════════════════════════════════════════════════════════════
-- PART A — Destinations.
--
-- Bali and Singapore exist from 0022 — UPSERT to fill in rich editorial
-- fields. Phuket and Koh Samui are new entries; the generic `thailand`
-- row from 0022 is superseded by `phuket` and `koh-samui` and gets
-- deactivated below.
-- ══════════════════════════════════════════════════════════════════════════

INSERT INTO budget_locations (
  type, continent, country, name, slug,
  multiplier, min_budget_usd, best_months, best_for,
  tagline, overview, tips, display_order, active
) VALUES
(
  'destination', 'Asia', 'Thailand', 'Phuket, Thailand', 'phuket',
  0.65, 100000, 'November–March',
  'the couple who wants 400 guests, a beachfront mandap, and change left over',
  'the andaman sea, a sunset mandap, and a budget that actually works',
  'Phuket is thailand''s crown jewel for indian destination weddings — and for good reason. The island has hosted more NRI weddings than any destination outside india itself. The math is simple: 5-star beachfront resorts at a fraction of european or caribbean prices, resorts that have dedicated indian wedding teams with a decade of experience, incredible thai hospitality that rivals (and often exceeds) indian hotel service, and some of the most photogenic sunsets on earth.

The andaman sea coast — stretching from mai khao in the north through bang tao, kamala, and down to nai harn — offers everything from massive laguna phuket complex resorts to intimate clifftop boutique properties. The average indian wedding spend in thailand sits around $340K for 200-500 guests, which buys you a level of luxury that would cost 2-3x in italy or the caribbean.

The infrastructure is real: on-site indian chefs at most major resorts, experienced decorators who understand mandap aesthetics, priests available locally, and a wedding planner ecosystem that speaks hindi, gujarati, and punjabi.',
  'Book the laguna complex 14-18 months out for november-march peak. Angsana Laguna alone clocks 30%+ of group revenue from Indian weddings — they could build your mandap in their sleep, but the calendar fills early. Avoid May-October monsoon for outdoor ceremonies. Phuket airport (HKT) takes direct flights from Mumbai, Delhi, and most Middle East hubs. Banyan Tree + Angsana combo across the Laguna complex is the power move for split-property weddings.',
  250, true
),
(
  'destination', 'Asia', 'Thailand', 'Koh Samui, Thailand', 'koh-samui',
  0.75, 120000, 'January–April, June–September',
  'the couple who wants thailand but not the tourist trail',
  'phuket''s quieter, cooler older sibling',
  'Koh samui is the second island — the one couples discover when phuket feels too obvious. In the gulf of thailand (not the andaman side), samui has a different energy: more coconut palms and jungle than party beach, more boutique luxury than mega-resort. The big names are here — four seasons, conrad, intercontinental — but at a scale that feels intimate.

Samui''s wedding scene is smaller and more curated than phuket''s, which means fewer indian wedding-specific vendors on-island but a more exclusive feeling. The trade-off: samui''s airport (USM) is small, operated by bangkok airways with limited international connections. Most guests fly through bangkok and connect.

But the extra hop buys you an island that''s quieter, more lush, and less commercialized than phuket — and the four seasons hillside-villa cluster is one of the most photogenic resorts in southeast asia.',
  'Bangkok (BKK) connections add 3-4 hours to your guest block, so build that into invitation lead times. The west coast (lipa noi, intercontinental) gets the sunsets; the north (bophut, four seasons) gets the postcard beaches. Avoid October-November monsoon — the rest of the year is reliable. Samui weddings cap naturally at ~250 guests because of property scale; if your headcount is bigger, default to phuket.',
  260, true
),
(
  'destination', 'Asia', 'Indonesia', 'Bali, Indonesia', 'bali',
  0.75, 80000, 'May–October',
  'the couple who wants spiritual depth, jaw-dropping landscapes, and creative freedom',
  'the island where hindu temples come standard and every cliff is a venue',
  'Bali is the emotionally resonant choice. It''s the only major destination wedding island outside of india where hinduism is the majority religion — the temples, the offerings, the cultural fabric of daily life. For indian couples, this isn''t just a pretty backdrop; it''s a place where your rituals feel contextually at home. The balinese understand the significance of ceremony in a way that resort staff in cancún or the caribbean simply can''t.

Beyond the spiritual connection, bali delivers on the visual: dramatic cliffs at uluwatu, rice terraces in ubud, black-sand beaches in canggu, and some of the most architecturally stunning resort properties in the world. AYANA alone has 18 wedding venues across 90 hectares — including the iconic SKY deck that extends over the indian ocean. The Mulia in nusa dua has a violet ballroom that holds 1,400 guests.

The creative ecosystem is world-class: floral designers, event stylists, photographers, and planners who work with international couples year-round. And the prices are still remarkably competitive — a luxury bali wedding costs 40-60% less than an equivalent in europe or the caribbean.',
  'May-October is the dry season — book against that window. Uluwatu cliffs (Ayana, Bulgari, Alila) for ceremony drama; Nusa Dua for ballroom-scale weddings; Ubud for spiritual + jungle aesthetics; Seminyak/Canggu for the trendy creative-class wedding. Most ceremony venues are clifftop or beachfront — wind matters; build in floral structural support. Indian-wedding caterers are local in Seminyak and Nusa Dua. Denpasar (DPS) is a direct flight from most Asian and Middle Eastern hubs.',
  270, true
),
(
  'destination', 'Asia', 'Singapore', 'Singapore', 'singapore',
  2.00, 200000, 'year-round (indoor venues, climate-controlled)',
  'the NRI couple whose families span mumbai, london, dubai, and sydney',
  'the city that throws a 1,000-person wedding without a single wrinkle',
  'Singapore is the logistics play. When your guest list has family flying in from mumbai, melbourne, dubai, and dallas, singapore is the geographical center of gravity. Changi airport is one of the best-connected in the world. The city has a massive resident indian population (9% of singapore is ethnically indian), which means indian wedding infrastructure isn''t imported — it''s native. Indian caterers, decorators, priests, mehndi artists, bollywood DJs: all local, all experienced, all available without the "destination wedding vendor surcharge."

The trade-off: no beaches (well, sentosa, but let''s be honest). Singapore weddings are ballroom events — grand, climate-controlled, and executed with the precision that defines the city. The hotels here are world-class: raffles, ritz-carlton, shangri-la, capella. The food scene is legendary. And the city itself — marina bay, gardens by the bay, chinatown, little india — gives your guests a 5-day itinerary between events without trying.

Singapore also handles fire ceremonies (agni/havan) at select venues — a non-trivial logistical requirement that many international destinations struggle with.',
  'Confirm the fire-ceremony policy in writing — not every Singapore venue allows agni indoors, and the ones that do require a 4-6 month permit lead time. Aerocity-equivalent here is anything within 20 minutes of Changi (sentosa, marina bay). Little India is a real cultural circuit, not a tokenistic neighborhood — use it for welcome bags and street food walks. The ritz-carlton''s pillar-free grand ballroom and shangri-la''s island ballroom are the two largest pillar-free options for big-format weddings. Year-round climate-controlled means weather is never the variable; book on price not weather.',
  280, true
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

-- The generic `thailand` row from 0022 is superseded by `phuket` and
-- `koh-samui`. Deactivate rather than delete so any existing
-- budget_user_plans references stay intact.
UPDATE budget_locations SET active = false WHERE slug = 'thailand';

-- Match-tool tag arrays + soft capacity ceilings for the four SE Asia
-- slugs. Mirrors the per-slug tag conventions from 0023.
UPDATE budget_locations bl SET
  tags         = v.tags,
  max_capacity = v.cap
FROM (VALUES
  ('phuket',
    '["beach","scenic_beauty","indian_vendors","food_scene","exclusivity","long_haul_from_us"]'::jsonb,
    800),
  ('koh-samui',
    '["beach","scenic_beauty","exclusivity","long_haul_from_us"]'::jsonb,
    250),
  ('bali',
    '["scenic_beauty","heritage","exclusivity","beach","food_scene","long_haul_from_us"]'::jsonb,
    1400),
  ('singapore',
    '["convenient_for_indians","indian_vendors","food_scene","nightlife","long_haul_from_us"]'::jsonb,
    1500)
) AS v(slug, tags, cap)
WHERE bl.slug = v.slug;


-- ══════════════════════════════════════════════════════════════════════════
-- PART C — Regions per destination.
-- ══════════════════════════════════════════════════════════════════════════

INSERT INTO budget_location_regions (location_id, name, description, display_order)
SELECT bl.id, r.name, r.description, r.display_order
FROM budget_locations bl
JOIN (VALUES
  -- Phuket
  ('phuket', 'Bang Tao & Laguna Complex',
    'the laguna phuket integrated resort — 7 hotels, a golf course, and a beach club. where the big weddings live.', 10),
  ('phuket', 'Mai Khao Beach',
    'phuket''s longest beach — quiet, unspoiled, and home to JW Marriott. north of the airport.', 20),
  ('phuket', 'Kamala & Surin',
    'boutique luxury territory — keemala, amanpuri, twinpalms. quieter, more design-forward.', 30),
  ('phuket', 'Nai Harn & Rawai',
    'the south tip — local vibes, smaller venues, stunning viewpoints.', 40),
  ('phuket', 'Cape Panwa & East Coast',
    'the less-touristy side — sri panwa lives here. dramatic clifftop views.', 50),

  -- Koh Samui
  ('koh-samui', 'Bophut & Fisherman''s Village',
    'the charming north coast — four seasons, anantara, and a walking street market.', 10),
  ('koh-samui', 'Lamai & Chaweng',
    'the east coast energy — more developed, better nightlife, conrad territory.', 20),
  ('koh-samui', 'Lipa Noi & West Coast',
    'the sunset side — quieter beaches, nikki beach, intercontinental.', 30),

  -- Bali
  ('bali', 'Jimbaran & Uluwatu',
    'cliffside luxury — ayana, bulgari, alila, four seasons. the dramatic south.', 10),
  ('bali', 'Nusa Dua',
    'the resort enclave — mulia, ritz-carlton, st. regis. calm beaches, big ballrooms.', 20),
  ('bali', 'Seminyak & Canggu',
    'the trendy coast — beach clubs, boutique hotels, and the hipster-creative energy.', 30),
  ('bali', 'Ubud',
    'the spiritual heart — rice terraces, jungle, and the cultural soul of bali.', 40),

  -- Singapore
  ('singapore', 'Marina Bay',
    'the skyline — ritz-carlton, mandarin oriental, fullerton. the iconic backdrop.', 10),
  ('singapore', 'Orchard & Central',
    'the shopping belt — shangri-la, st. regis, four seasons. convenient for guests.', 20),
  ('singapore', 'Sentosa Island',
    'the resort island — capella, sofitel, w singapore. the closest thing to a beach destination.', 30),
  ('singapore', 'Civic District',
    'heritage territory — raffles hotel, chijmes, fullerton. colonial charm meets modern luxury.', 40)
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
  -- Phuket
  ('phuket', 'Elephant Sanctuary Blessing', '🐘',
    'a buddhist monk blessing with rescued elephants — not the tourist-trap version', 'Cultural',     10),
  ('phuket', 'Phi Phi Island Boat Day', '🏝️',
    'the day-after excursion that becomes the trip everyone talks about', 'Adventure',                20),
  ('phuket', 'Thai Boxing & Bollywood Night', '🥊',
    'muay thai warm-up, bollywood cool-down — the crossover sangeet pre-party', 'Entertainment',     30),
  ('phuket', 'Floating Lantern Release', '🏮',
    'hundreds of khom loi rising over the andaman — the photo that retires the photographer', 'Cultural', 40),
  ('phuket', 'Night Market Street-Food Tour', '🍜',
    'pad thai at midnight, mango sticky rice at 1am, no regrets at 2am', 'Food',                     50),
  ('phuket', 'Phang Nga Bay Long-Tail Cruise', '🚤',
    'james bond island and limestone karsts — pre-wedding shoot heaven', 'Adventure',                60),

  -- Koh Samui
  ('koh-samui', 'Ang Thong Marine Park Boat Trip', '🌊',
    '42 islands, emerald lagoons, and your wedding party in a speedboat', 'Adventure',               10),
  ('koh-samui', 'Fisherman''s Village Night Market', '🏮',
    'friday night street food, local crafts, and the most casual night of the wedding week', 'Food', 20),
  ('koh-samui', 'Muay Thai Class on the Beach', '🥊',
    '90 minutes of coached training, then coconuts and cold beers — the groomsmen day', 'Adventure', 30),

  -- Bali
  ('bali', 'Uluwatu Temple Kecak Dance at Sunset', '🔥',
    '70+ performers, a fire dance on a cliff at golden hour — no, you''re not dreaming', 'Cultural',  10),
  ('bali', 'Tegallalang Rice Terrace Pre-Wedding Shoot', '🌾',
    'tegallalang''s emerald terraces + a red lehenga = the photo that retires instagram', 'Cultural', 20),
  ('bali', 'Tirta Empul Water-Purification Ceremony', '💧',
    'a private group blessing — spiritually resonant for hindu couples', 'Wellness',                  30),
  ('bali', 'Jimbaran Bay Seafood BBQ', '🦐',
    'feet in the sand, grilled lobster in hand, 200 guests on the beach', 'Food',                     40),
  ('bali', 'Bali Swing & Jungle Brunch', '🌿',
    'the famous jungle swings, a rice-terrace brunch, content for days', 'Adventure',                 50),

  -- Singapore
  ('singapore', 'Gardens by the Bay Evening Walk', '🌳',
    'supertrees, cloud forest, and the light show — the post-sangeet cooldown', 'Cultural',          10),
  ('singapore', 'Little India Heritage Walk & Street Food', '🍛',
    'tekka market, banana-leaf dosa, and the best food tour in town', 'Food',                        20),
  ('singapore', 'Marina Bay Sands Infinity Pool Brunch', '🏊',
    'the most famous pool in the world, your wedding party, sunday brunch', 'Wellness',              30),
  ('singapore', 'Private Bumboat Cruise on the Singapore River', '🚢',
    'craft cocktails, the skyline lit up, clarke quay on a tuesday', 'Adventure',                    40)
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
-- Phuket
('angsana-laguna-phuket',
 'Angsana Laguna Phuket',
 'the most battle-tested indian wedding resort in southeast asia',
 'Statistically the most popular 5-star beachfront resort for indian weddings in phuket. Indian weddings account for 30-35% of group revenue, and the team has hosted hundreds of NRI celebrations averaging 200-300 guests. 400+ rooms, multiple outdoor venues (beachfront, xana beach club lawn, tropical gardens), and a brand new 1,500 sqm air-conditioned event space that handles up to 1,500 guests. East-facing mandap setups with sunset backgrounds. Full buyout available in high season with advance booking. The new indoor event space means your sangeet or reception doesn''t depend on weather.',
 'Bang Tao', 'Thailand',
 false, '["phuket"]'::jsonb, '["luxury","ultra"]'::jsonb,
 200, 800, true, true, false, 'standard'),
('banyan-tree-phuket',
 'Banyan Tree Phuket',
 '175 private pool villas and a decade of indian wedding expertise',
 'The ultra-luxury sister to angsana, also within the laguna phuket complex. 175 private pool villas spread across 89 acres of tropical gardens and lagoons. The resort''s wedding specialists have planned indian weddings for over a decade — sangeet on the lawn, haldi by the pool, ceremony on the beach, reception under the stars. The all-villa format means every family gets their own private pool and garden, which eliminates the "hotel corridor" feeling. Power move: pair with Angsana for split-property weddings (banyan tree for VIP family villas, angsana for the rest of the guest block).',
 'Bang Tao', 'Thailand',
 false, '["phuket"]'::jsonb, '["luxury","ultra"]'::jsonb,
 150, 400, true, true, false, 'standard'),
('jw-marriott-phuket',
 'JW Marriott Phuket Resort & Spa',
 '27 acres on phuket''s longest beach — the space your baraat deserves',
 'On mai khao beach — phuket''s longest and most pristine stretch of sand — JW marriott spreads across 27 acres of beachfront property. 262 rooms and suites, 20 minutes from the airport. Multiple ceremony venues: mai khao lawn, sala siree lawn, ballroom, m beach club, and a chapel with panoramic andaman sea views. Five on-site restaurants including dedicated indian cuisine. The resort''s scale means your 400-person wedding doesn''t feel cramped, and there''s room for a full beachfront baraat procession. Mai khao is quieter than bang tao — your beach ceremony won''t have random tourists in the background.',
 'Mai Khao', 'Thailand',
 false, '["phuket"]'::jsonb, '["luxury","ultra"]'::jsonb,
 150, 400, true, true, false, 'standard'),
('amanpuri-phuket',
 'Amanpuri',
 'the original aman — where phuket luxury was invented in 1988',
 'Amanpuri opened in 1988 and literally put phuket on the luxury map. Set in a coconut palm forest above pansea beach, the resort has 40 pavilions and 40+ private villas, a private beach, and the aman service standard — arguably the most refined hotel service in the world. Strictly for intimate weddings of 40-80 guests where exclusivity, design quality, and privacy are the priorities. The thai architecture and coconut grove setting produce photography of extraordinary beauty. Indian catering coordinated through the resort''s chef team with external indian catering consultants brought in for events.',
 'Kamala', 'Thailand',
 false, '["phuket"]'::jsonb, '["luxury","ultra"]'::jsonb,
 40, 80, true, true, false, 'standard'),
('sri-panwa-phuket',
 'Sri Panwa',
 'the clifftop with the 360-degree views your drone pilot will tattoo on their arm',
 'Perched on cape panwa at phuket''s southeastern tip, sri panwa is all private pool villas with panoramic views of the andaman sea and phang nga bay. The baba nest rooftop bar (360-degree views) is one of the most photographed spots in thailand — best used for rehearsal dinner or welcome drinks (it only holds about 40 people). 52 villas with private pools. Multiple event venues including beachfront, cliffside terraces, and the cool spa restaurant. The contemporary design — concrete, infinity pools, clean lines — contrasts beautifully with traditional indian wedding decor.',
 'Cape Panwa', 'Thailand',
 false, '["phuket"]'::jsonb, '["luxury","ultra"]'::jsonb,
 80, 200, true, true, false, 'standard'),

-- Koh Samui
('four-seasons-koh-samui',
 'Four Seasons Resort Koh Samui',
 'hillside pool villas overlooking the gulf — the postcard that isn''t a postcard',
 '60 private pool villas terraced into a coconut-covered hillside overlooking ang thong national marine park. Four seasons koh samui is the intimate luxury play — no ballroom, no convention center, just stunning hilltop and beachfront venues where every angle is a photograph. The resort''s private beach, infinity pool, and open-air restaurants create a multi-day flow that feels like a private island. Ideal for weddings under 150 guests. The secret beach cove is accessible only by boat or a hidden path — book it for your ceremony and guests arrive by longtail.',
 'Bophut', 'Thailand',
 false, '["koh-samui"]'::jsonb, '["luxury","ultra"]'::jsonb,
 60, 150, true, true, false, 'standard'),
('conrad-koh-samui',
 'Conrad Koh Samui',
 'every villa has an infinity pool overlooking the gulf — every single one',
 '81 villas, all with private infinity pools overlooking the gulf of thailand. Conrad koh samui is perched on a hillside above a private beach, and the views from every room are genuinely ridiculous. Multiple event spaces: hilltop lawn, beachfront, and indoor options. The resort''s isolation (southwestern coast, away from the busier areas) means your wedding feels like a full property takeover even without a formal buyout. The hilltop infinity pool area at sunset is one of the most jaw-dropping cocktail-hour settings in all of thailand.',
 'Lamai', 'Thailand',
 false, '["koh-samui"]'::jsonb, '["luxury","ultra"]'::jsonb,
 80, 200, true, true, false, 'standard'),
('intercontinental-koh-samui',
 'InterContinental Koh Samui Resort',
 'the sunset coast — because your mandap deserves golden hour',
 'On the west coast of samui, which means direct sunset views over the gulf of thailand. 79 rooms and suites in a terraced hillside design, each with its own balcony or terrace. The resort''s beachfront lawn and pool deck create flexible event spaces, and the smaller scale (compared to phuket mega-resorts) means personalized attention. Indian food available through external caterers with resort approval. Time your pheras for 5:30pm and the sky does all the work.',
 'Lipa Noi', 'Thailand',
 false, '["koh-samui"]'::jsonb, '["luxury"]'::jsonb,
 100, 250, true, true, false, 'standard'),

-- Bali
('ayana-resort-bali',
 'AYANA Resort Bali',
 '90 hectares, 18 venues, and the cliff deck that broke the internet',
 'AYANA is not a resort — it''s an ecosystem. 90 hectares across four properties (ayana resort, ayana villas, ayana segara, and rimba), 972 rooms and villas, 19 restaurants, and 12 swimming pools. The wedding venue lineup is unmatched: the iconic SKY deck extending over the indian ocean (80 guests for ceremony), SKY amphitheatre (250 guests tiered seating), SKY middle lawn (400 guests reception), tresna chapel (glass aisle over a flowing river), the ballroom (1,000 guests), champa garden, kisik pier, rock bar. AYANA has extensive indian wedding experience and offers specialized packages. The SKY deck ceremony → SKY lawn reception flow is the signature ayana move.',
 'Jimbaran', 'Indonesia',
 false, '["bali"]'::jsonb, '["luxury","ultra"]'::jsonb,
 200, 1000, true, true, false, 'standard'),
('the-mulia-bali',
 'The Mulia Bali',
 'the ballroom that holds 1,400 and the glass chapel that floats on water',
 'Bali''s grande dame of large-scale luxury weddings. The violet ballroom — one of the largest in bali at 1,400 capacity — handles the biggest indian weddings without flinching. But the real magic is in the smaller venues: the harmony chapel (oceanfront glass), the eternity chapel (floating on mulia lake with a crystal chandelier centerpiece), the mulia glass house (contemporary glass with beach views), and the unity garden (beachfront). Three tiers: mulia resort, the mulia (suites), and mulia villas. Customizable indian wedding packages with experienced planners. The eternity chapel floating on the lake is unlike anything else in destination weddings.',
 'Nusa Dua', 'Indonesia',
 false, '["bali"]'::jsonb, '["luxury","ultra"]'::jsonb,
 250, 1400, true, true, false, 'standard'),
('four-seasons-jimbaran-bay',
 'Four Seasons Resort Bali at Jimbaran Bay',
 'the intimate four seasons that makes big weddings jealous',
 '147 balinese-style villas with private plunge pools, set across a hillside descending to jimbaran bay. The intimate counterpoint to AYANA''s scale — perfect for weddings of 80-150 guests where the priority is impeccable service and a curated experience. Beachfront ceremony setups, garden venues, and the resort''s restaurants for multi-day event variety. The team has experience coordinating indian ceremonies and working with external indian caterers. Jimbaran beach at sunset with the traditional fishing boats in the background is one of bali''s most romantic ceremony settings.',
 'Jimbaran', 'Indonesia',
 false, '["bali"]'::jsonb, '["luxury","ultra"]'::jsonb,
 80, 150, true, true, false, 'standard'),
('alila-villas-uluwatu',
 'Alila Villas Uluwatu',
 'minimalist architecture meets maximum drama on the uluwatu cliffs',
 'Perched on uluwatu''s limestone cliffs, alila villas is the design-forward choice. The architecture is contemporary minimalist — clean lines, open pavilions, infinity-edge everything — which creates a striking contrast against traditional indian wedding decor. 65 villas, all with private pools. The cliff-edge cabana ceremony venue literally hangs over the indian ocean. The temple terrace offers a more sacred atmosphere. Full property buyouts available. The minimalist aesthetic makes heavy indian decor pop — don''t over-decorate; let the architecture and ocean do the work.',
 'Uluwatu', 'Indonesia',
 false, '["bali"]'::jsonb, '["luxury","ultra"]'::jsonb,
 80, 200, true, true, false, 'standard'),
('bulgari-resort-bali',
 'Bulgari Resort Bali',
 'italian design, balinese soul, and the most exclusive address on the cliffs',
 'Where italian craftsmanship meets balinese spirituality. The mansion — a five-bedroom manor house on a secluded hill — is accessible via a wooden bridge and has uninterrupted indian ocean views. La terrazza is a spacious open-air terrace for ceremonies. The resort has 59 villas, a private beach (accessible by an inclinator), and the bulgari bar perched on the cliff. Strictly intimate: 60-80 guests max. This is the venue for couples who want the most exclusive address in bali, period — and the price tag matches.',
 'Uluwatu', 'Indonesia',
 false, '["bali"]'::jsonb, '["luxury","ultra"]'::jsonb,
 40, 80, true, true, false, 'standard'),

-- Singapore
('raffles-hotel-singapore',
 'Raffles Hotel Singapore',
 'the most famous hotel in asia — and it knows how to throw an indian wedding',
 'An icon. The colonial-era landmark (opened 1887) offers an unmatched blend of heritage architecture and refined luxury. Intimate courtyards for mehndi and haldi, a ballroom for sangeet and receptions, and the kind of service that comes from 137 years of practice. Staff have deep knowledge of indian traditions. The long bar (home of the singapore sling), the courtyard, and the ballroom create a multi-event flow that moves seamlessly between intimate and grand. The writers bar and courtyard are perfect for an intimate mehndi setup — colonial architecture draped in marigolds is a vibe that can''t be replicated.',
 'Singapore', 'Singapore',
 false, '["singapore"]'::jsonb, '["luxury","ultra"]'::jsonb,
 150, 400, true, true, false, 'standard'),
('ritz-carlton-millenia-singapore',
 'The Ritz-Carlton, Millenia Singapore',
 'marina bay views, a pillar-free ballroom, and the chihuly room',
 'A 32-story tower on seven acres of green space overlooking marina bay. The ritz-carlton is the grand ballroom play: pillar-free grand ballroom with stage and LED video walls for live entertainment, the romantic garden pavilion (air-conditioned botanical setting), and the gold-domed chihuly room for intimate events. Three distinct venues means mehndi, sangeet, and reception each get their own space. The hotel''s art collection (including a dale chihuly installation) adds a cultural layer that photographs beautifully. The garden pavilion is air-conditioned but feels outdoor — perfect for haldi or mehndi when singapore''s heat would otherwise melt your guests.',
 'Singapore', 'Singapore',
 false, '["singapore"]'::jsonb, '["luxury","ultra"]'::jsonb,
 200, 500, true, true, false, 'standard'),
('shangri-la-singapore',
 'Shangri-La Singapore',
 '15 acres of gardens in the middle of a city — the oasis energy',
 'Shangri-la singapore sits on 15 acres of tropical gardens in the orchard road area — a genuine oasis in the middle of the city. The island ballroom (recently updated) with expansive outdoor garden options is perfect for large indian weddings. The resort''s scale and garden setting allow for outdoor ceremonies, mehndi in the gardens, and ballroom receptions — a rare combination in urban singapore. Highly experienced indian wedding coordination team. The garden wing is the most private section — book it for the bride''s family. It feels like a resort within the resort.',
 'Singapore', 'Singapore',
 false, '["singapore"]'::jsonb, '["luxury"]'::jsonb,
 200, 600, true, true, false, 'standard'),
('capella-singapore',
 'Capella Singapore',
 'sentosa''s best-kept secret — the resort-feel wedding in a city-state',
 'On sentosa island, capella is singapore''s closest thing to a destination wedding resort without leaving the city. Colonial architecture, an open dome-like ballroom, lush lawns for outdoor ceremonies, and a 30-acre tropical setting. The tangled garden and knolls are stunning ceremony spaces. Personalized service that''s closer to a boutique hotel than a city property. Capella hosted the trump-kim summit in 2018 — the security infrastructure means they know how to handle VIP events with complex logistics.',
 'Sentosa', 'Singapore',
 false, '["singapore"]'::jsonb, '["luxury","ultra"]'::jsonb,
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
  'angsana-laguna-phuket','banyan-tree-phuket','jw-marriott-phuket','amanpuri-phuket','sri-panwa-phuket',
  'four-seasons-koh-samui','conrad-koh-samui','intercontinental-koh-samui',
  'ayana-resort-bali','the-mulia-bali','four-seasons-jimbaran-bay','alila-villas-uluwatu','bulgari-resort-bali',
  'raffles-hotel-singapore','ritz-carlton-millenia-singapore','shangri-la-singapore','capella-singapore'
)
ON CONFLICT (vendor_id, category_id) DO NOTHING;

-- Per-venue pricing indicators against the Venue category.
INSERT INTO vendor_pricing_indicators (vendor_id, category_id, price_low_usd, price_high_usd, price_unit, notes)
SELECT v.id, vc.id, p.lo, p.hi, 'package'::vendor_pricing_unit, ''
FROM vendors v
JOIN vendor_categories vc ON vc.slug = 'venue'
JOIN (VALUES
  -- Phuket
  ('angsana-laguna-phuket',          100000,   350000),
  ('banyan-tree-phuket',             150000,   450000),
  ('jw-marriott-phuket',             120000,   350000),
  ('amanpuri-phuket',                300000,   700000),
  ('sri-panwa-phuket',               150000,   400000),
  -- Koh Samui
  ('four-seasons-koh-samui',         200000,   500000),
  ('conrad-koh-samui',               150000,   400000),
  ('intercontinental-koh-samui',     120000,   300000),
  -- Bali
  ('ayana-resort-bali',               80000,   400000),
  ('the-mulia-bali',                 120000,   500000),
  ('four-seasons-jimbaran-bay',      150000,   400000),
  ('alila-villas-uluwatu',           120000,   350000),
  ('bulgari-resort-bali',            250000,   600000),
  -- Singapore
  ('raffles-hotel-singapore',        200000,   500000),
  ('ritz-carlton-millenia-singapore',200000,   450000),
  ('shangri-la-singapore',           150000,   400000),
  ('capella-singapore',              250000,   550000)
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
-- 3 placeholders × 4 categories × 4 destinations = 48 rows.
--
-- SE Asia note: Phuket, Bali, and Singapore have native indian-wedding
-- vendor infrastructure (resort indian chefs in phuket, local florists
-- and DJs in bali, full local rosters in singapore's little india).
-- Bios reflect that. Koh Samui inherits most of phuket's vendor pool
-- via short-haul flights from HKT.
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
  ('phuket',    'Phuket',    'Phuket',    'Thailand'),
  ('koh-samui', 'Koh Samui', 'Koh Samui', 'Thailand'),
  ('bali',      'Bali',      'Denpasar',  'Indonesia'),
  ('singapore', 'Singapore', 'Singapore', 'Singapore')
) AS d(dest_slug, brand_suffix, home_city, country)
CROSS JOIN (VALUES
  -- (cat_slug, idx, name_template, tagline, bio_extra)
  -- Photography ──────────────────────────────────────────────────────────
  ('photography', 1, 'lotus lens — {region}',
    'wedding films that look like vogue editorials',
    'Editorial-led wedding photography for southeast asian destination weddings. Phuket and bali have established indian-wedding photographers; singapore''s native indian community brings full local talent. Placeholder roster — real photographers will be imported from the Marigold vendor pipeline.'),
  ('photography', 2, 'frangipani frames — {region}',
    'wedding films that look like vogue editorials',
    'Editorial-led wedding photography for southeast asian destination weddings. Phuket and bali have established indian-wedding photographers; singapore''s native indian community brings full local talent. Placeholder roster — real photographers will be imported from the Marigold vendor pipeline.'),
  ('photography', 3, 'saffron lens — {region}',
    'wedding films that look like vogue editorials',
    'Editorial-led wedding photography for southeast asian destination weddings. Phuket and bali have established indian-wedding photographers; singapore''s native indian community brings full local talent. Placeholder roster — real photographers will be imported from the Marigold vendor pipeline.'),
  -- Decor & Florals ──────────────────────────────────────────────────────
  ('decor-florals', 1, 'jasmine & jade — {region}',
    'mandap florals that handle southeast asian humidity',
    'Decor and floral design across mandap, sangeet, and reception. Bali''s creative ecosystem produces some of the most editorial wedding florals in the world; phuket''s resort decorators have a decade of mandap experience; singapore has native local studios. Placeholder until real decor partners are confirmed and listed.'),
  ('decor-florals', 2, 'gulmohar atelier — {region}',
    'mandap florals that handle southeast asian humidity',
    'Decor and floral design across mandap, sangeet, and reception. Bali''s creative ecosystem produces some of the most editorial wedding florals in the world; phuket''s resort decorators have a decade of mandap experience; singapore has native local studios. Placeholder until real decor partners are confirmed and listed.'),
  ('decor-florals', 3, 'petal & plinth — {region}',
    'mandap florals that handle southeast asian humidity',
    'Decor and floral design across mandap, sangeet, and reception. Bali''s creative ecosystem produces some of the most editorial wedding florals in the world; phuket''s resort decorators have a decade of mandap experience; singapore has native local studios. Placeholder until real decor partners are confirmed and listed.'),
  -- Catering ─────────────────────────────────────────────────────────────
  ('catering', 1, 'the saffron table — {region}',
    'the chef who finally got biryani right at scale',
    'Indian catering for southeast asian destination weddings. Most major phuket resorts (Angsana, JW, Banyan Tree) have on-site indian chefs as part of their wedding teams; bali has a deep indian-catering bench in seminyak and nusa dua; singapore''s little india belt produces some of the best indian wedding catering in the region. Placeholder entry.'),
  ('catering', 2, 'the {region} plate co.',
    'the chef who finally got biryani right at scale',
    'Indian catering for southeast asian destination weddings. Most major phuket resorts (Angsana, JW, Banyan Tree) have on-site indian chefs as part of their wedding teams; bali has a deep indian-catering bench in seminyak and nusa dua; singapore''s little india belt produces some of the best indian wedding catering in the region. Placeholder entry.'),
  ('catering', 3, 'tandoor & tea — {region}',
    'the chef who finally got biryani right at scale',
    'Indian catering for southeast asian destination weddings. Most major phuket resorts (Angsana, JW, Banyan Tree) have on-site indian chefs as part of their wedding teams; bali has a deep indian-catering bench in seminyak and nusa dua; singapore''s little india belt produces some of the best indian wedding catering in the region. Placeholder entry.'),
  -- DJ ───────────────────────────────────────────────────────────────────
  ('dj', 1, 'groove republic — {region}',
    'the dj who plays bollywood at 1am without being asked twice',
    'Multi-genre wedding DJ. Bollywood, Punjabi, English Top 40, sangeet sets. Phuket and bali have built-out bollywood DJ rosters from a decade of NRI weddings; singapore has the deepest local indian DJ scene in southeast asia. Placeholder until the real DJs are imported.'),
  ('dj', 2, 'bass & bollywood — {region}',
    'the dj who plays bollywood at 1am without being asked twice',
    'Multi-genre wedding DJ. Bollywood, Punjabi, English Top 40, sangeet sets. Phuket and bali have built-out bollywood DJ rosters from a decade of NRI weddings; singapore has the deepest local indian DJ scene in southeast asia. Placeholder until the real DJs are imported.'),
  ('dj', 3, 'tabla drops — {region}',
    'the dj who plays bollywood at 1am without being asked twice',
    'Multi-genre wedding DJ. Bollywood, Punjabi, English Top 40, sangeet sets. Phuket and bali have built-out bollywood DJ rosters from a decade of NRI weddings; singapore has the deepest local indian DJ scene in southeast asia. Placeholder until the real DJs are imported.')
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
  AND split_part(v.slug, '__', 2) IN ('phuket','koh-samui','bali','singapore')
ON CONFLICT (vendor_id, category_id) DO NOTHING;
