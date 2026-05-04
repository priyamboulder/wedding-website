-- ──────────────────────────────────────────────────────────────────────────
-- Migration 0036: Seed Africa and Oceania.
--
-- Date:  2026-05-01
-- Scope: Final two continent seeds for the Marigold Destination Explorer.
--        Africa  — Cape Town, Marrakech, Kenya Safari.
--        Oceania — Sydney, Fiji.
--        Pattern is identical to 0024 (South Asia) and 0035 (Europe).
--
-- Adds:
--   • Data: rich overview / best_for / tips / tags on Cape Town and
--     Sydney (already created by 0022) plus three new slugs — Marrakech,
--     Kenya Safari, and Fiji. Marrakech supersedes the generic `morocco`
--     row from 0022, and Kenya Safari supersedes the generic `kenya` row
--     (both deactivated below).
--   • Data: 2-3 regions per destination = 13 region rows.
--   • Data: 3-5 experiences per destination = 19 experience rows.
--   • Data: 2-5 real, named venues per destination = 18 venues with
--     "Venue" category assignments + per-vendor pricing indicators.
--     is_placeholder remains FALSE — these are researched, real
--     properties.
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
--   We keep continent='Africa' / 'Oceania' here.
--   lib/destinations/continents.ts maps Africa → 'africa' and
--   Oceania → 'oceania' for the Tools surface.
--
-- This migration is idempotent — every INSERT uses ON CONFLICT.
-- ──────────────────────────────────────────────────────────────────────────


-- ══════════════════════════════════════════════════════════════════════════
-- PART A — Destinations.
--
-- Cape Town and Sydney exist from 0022 — UPSERT to fill in rich editorial
-- fields. Marrakech, Kenya Safari, and Fiji are new entries; the generic
-- `morocco` and `kenya` rows from 0022 are superseded by `marrakech` and
-- `kenya-safari` and get deactivated below.
-- ══════════════════════════════════════════════════════════════════════════

INSERT INTO budget_locations (
  type, continent, country, name, slug,
  multiplier, min_budget_usd, best_months, best_for,
  tagline, overview, tips, display_order, active
) VALUES
(
  'destination', 'Africa', 'South Africa', 'Cape Town, South Africa', 'cape-town',
  0.65, 80000, 'November–March',
  'the couple who wants editorial-quality beauty at a price that makes europe look silly',
  'table mountain, wine country, and the rand exchange rate — the destination that overdelivers',
  'Cape Town is the destination wedding industry''s best-kept secret — and the exchange rate is the reason it stays affordable. The South African rand means world-class venues, food, and photography cost a fraction of what they''d cost in Europe or the US. But the real draw is the setting: Table Mountain looming over everything, the Cape Winelands (Stellenbosch, Franschhoek, Paarl) producing some of the world''s best wines on estates that double as wedding venues, and a coastline that swings from Atlantic drama to Indian Ocean warmth.

Cape Town''s creative community — photographers, designers, florists — operates at an international standard. The food scene is genuinely world-class. And the winelands estates offer a style of venue that doesn''t exist anywhere else: working wine farms with Cape Dutch architecture, mountain backdrops, and on-site restaurants helmed by serious chefs. South Africa has a significant Indian population (mostly in Durban / KwaZulu-Natal), so Indian catering and cultural support are available, though the Cape Town wedding vendor scene is more western-focused.

Ranked #2 wedding destination in the world by multiple publications.',
  'November–March is South African summer — book Babylonstoren and Boschendal 12+ months out for peak dates. Cape Town International (CPT) is a direct flight from major hubs. Bring your decorator and mehndi artist from the US, UK, or India — local Indian-wedding vendor ecosystems are thinner here than in Marbella or Mauritius. The garden ceremony at golden hour is the single most photogenic angle in the winelands — schedule the ceremony for 4:30pm and let Simonsberg do the rest.',
  600, true
),
(
  'destination', 'Africa', 'Morocco', 'Marrakech, Morocco', 'marrakech',
  1.20, 120000, 'March–May, September–November',
  'the couple who wants their wedding to feel like a film — and has the guest list to fill a riad',
  'a thousand-year-old city that was designed for wedding content',
  'Marrakech is sensory overload in the best possible way — and that''s exactly why it works for Indian weddings. The city''s aesthetic is maximalist: intricate zellige tilework, carved cedar ceilings, jewel-toned textiles, lantern-lit courtyards, and the Atlas Mountains hovering on the horizon. This visual language overlaps with Indian wedding aesthetics in a way that''s almost uncanny. A mandap in a Marrakech riad courtyard doesn''t feel forced — it feels inevitable.

The venue range is extraordinary: ancient palatial riads in the medina, modern luxury hotels in the Palmeraie (palm groves), desert camps in the Agafay desert 30 minutes away, and mountain kasbahs in the Atlas. The Moroccan hospitality tradition — mint tea on arrival, multi-course feasts, live gnawa music — creates a guest experience that''s rich and immersive without requiring any additional programming.

The trade-off: Marrakech''s vendor ecosystem for Indian weddings is still developing — you''ll bring your decorator, mehndi artist, and likely your caterer (or use one of the Moroccan caterers with Indian menu experience). But the venues and experiences are genuinely unlike anything else in the world.',
  'Avoid June–August — the medina becomes unbearably hot and prices peak. Marrakech Menara (RAK) is a direct flight from most European hubs; transit through Casablanca or Paris from the US. Most riads cap capacity at 80–120; the Palmeraie hotels (Amanjena, Mandarin Oriental, Royal Mansour) handle 200+. External catering is the norm — bring your team. The lantern-lit water bassin at Amanjena is the single most dramatic ceremony backdrop in the city.',
  610, true
),
(
  'destination', 'Africa', 'Kenya', 'Kenya Safari', 'kenya-safari',
  2.20, 200000, 'June–October',
  'the couple who wants their wedding to be the single most unforgettable event their guests have ever attended',
  'the wedding where elephants walk past your cocktail hour — and nobody blinks',
  'A Kenya safari wedding is the ultimate flex — not because it''s expensive (though it is), but because it''s genuinely life-changing for every person who attends. No one forgets watching a sunset over the Mara with a glass of champagne, or waking up to the sound of lions, or saying their vows under an acacia tree while giraffes cross in the distance. It''s the destination where the wedding competes with the destination itself — and the destination wins, which is actually the point.

Kenya has a deep Indian diaspora connection — the Indian community in Kenya dates back over a century, particularly in Nairobi and Mombasa. A wedding in Kenya isn''t just exotic; for many families, it''s ancestral.

The trade-off: everything is logistically complex. Luxury safari lodges are intimate (20–40 rooms max), which means guest lists stay tight. Flights are long. You''re bringing every vendor. And wildlife doesn''t follow a wedding timeline. But if you''re the couple who wants "once in a lifetime" to actually mean something — this is the destination.',
  'June–October is the dry season and overlaps with the Great Migration in the Masai Mara. Nairobi (NBO) is the hub; charter flights to bush airstrips run 60–90 minutes. Most safari lodges cap at 30–60 guests — book the entire camp out 18–24 months in advance for peak dates. The hot air balloon ride over the Mara at sunrise on the morning of the wedding is the single most extraordinary pre-wedding experience you can give your guests.',
  620, true
),
(
  'destination', 'Oceania', 'Australia', 'Sydney, Australia', 'sydney',
  2.10, 200000, 'October–April',
  'the NRI couple with family in australia who wants a global-class city wedding',
  'the harbour bridge, the opera house, and 800,000 indians who already live here',
  'Sydney is the city wedding in the southern hemisphere — and the harbour gives it a natural advantage that no other city can match. The Opera House, the Harbour Bridge, and the waterfront create a backdrop that makes every ceremony feel iconic. Australia''s massive Indian diaspora — over 800,000 strong — means the vendor ecosystem is deep and experienced: caterers, decorators, priests, and photographers who''ve been serving the community for decades.

The Sydney wedding model splits two ways. Harbour-side hotels (Park Hyatt, The Langham) deliver iconic backdrops with intimate-luxury scale (150–250 guests). Heritage event venues (Doltone House) handle the 400–600 guest South Asian celebrations with full Indian-wedding production know-how built in. The Hunter Valley wine region — 2 hours north — gives you a winelands-estate option for couples who want a rural alternative without leaving New South Wales.

Best for diaspora-heavy guest lists where a meaningful share of attendees are already in Australia, and for couples who want the global-city wedding without having to import every vendor.',
  'Sydney summer (October–April) is wedding peak — book hotel ceremony spaces 12–18 months out. Direct flights from major Asian, US, and European hubs. The rocks district location of The Langham means guests can walk to Circular Quay, the Opera House, and the Harbour Bridge between events. Hunter Valley estates require coach transport — budget 2 hours each way.',
  700, true
),
(
  'destination', 'Oceania', 'Fiji', 'Fiji', 'fiji',
  2.00, 150000, 'May–October',
  'the couple who wants a private island buyout and guests who genuinely unplug',
  '333 islands, turquoise water, and the kind of isolation that makes your phone irrelevant',
  'Fiji is the South Pacific fantasy — 333 islands, overwater bures, private island resorts, and water so clear it looks photoshopped. Fiji weddings are intimate by nature: the best resort properties have 20–50 rooms, which means your guest list stays tight and the experience feels like a private island buyout. The Fijian hospitality culture — warm, generous, musical — adds a layer of joy that''s hard to manufacture elsewhere.

The trade-off: Fiji is remote. Long flights from anywhere except Australia and New Zealand. Limited Indian-wedding vendor infrastructure on-island. But Fiji has a significant Fijian-Indian population (~37% of the country), which means Hindu temples, Indian food, and cultural familiarity are built into the fabric of the nation.

Best for couples who genuinely want their wedding to be a four-day disconnect — and who are willing to fly an Indian decorator, glam team, and possibly catering in from Sydney or Singapore to make it work.',
  'Nadi (NAN) is the international gateway. Mamanuca and Yasawa island resorts are 20–60 minutes by boat or seaplane from Nadi. May–October is the dry season — June–August is peak. Most luxury island resorts (Kokomo, Six Senses, Vomo) cap at 60–120 guests; full-island buyouts deliver true exclusivity. Fiji''s Indo-Fijian community means a local pandit and basic Indian catering can be sourced — most other South Pacific destinations cannot offer this.',
  710, true
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

-- The generic `morocco` and `kenya` rows from 0022 are superseded by
-- `marrakech` and `kenya-safari`. Deactivate rather than delete so any
-- existing budget_user_plans references stay intact.
UPDATE budget_locations SET active = false WHERE slug IN ('morocco', 'kenya');

-- Match-tool tag arrays + soft capacity ceilings for the five Africa /
-- Oceania slugs. Mirrors the per-slug tag conventions from 0023.
UPDATE budget_locations bl SET
  tags         = v.tags,
  max_capacity = v.cap
FROM (VALUES
  ('cape-town',
    '["scenic_beauty","food_scene","mountain","exclusivity","long_haul_from_us"]'::jsonb,
    250),
  ('marrakech',
    '["heritage","cultural_immersion","exclusivity","scenic_beauty","long_haul_from_us"]'::jsonb,
    500),
  ('kenya-safari',
    '["scenic_beauty","exclusivity","cultural_immersion","long_haul_from_us"]'::jsonb,
    80),
  ('sydney',
    '["scenic_beauty","food_scene","convenient_for_indians","indian_vendors","long_haul_from_us"]'::jsonb,
    600),
  ('fiji',
    '["beach","scenic_beauty","exclusivity","long_haul_from_us"]'::jsonb,
    150)
) AS v(slug, tags, cap)
WHERE bl.slug = v.slug;


-- ══════════════════════════════════════════════════════════════════════════
-- PART C — Regions per destination.
-- ══════════════════════════════════════════════════════════════════════════

INSERT INTO budget_location_regions (location_id, name, description, display_order)
SELECT bl.id, r.name, r.description, r.display_order
FROM budget_locations bl
JOIN (VALUES
  -- Cape Town
  ('cape-town', 'Cape Winelands (Stellenbosch & Franschhoek)',
    'the wine country — estates, mountains, cape dutch architecture. where the magic is.', 10),
  ('cape-town', 'Cape Town City & Waterfront',
    'table mountain views, the V&A waterfront, iconic hotels.', 20),
  ('cape-town', 'Atlantic Seaboard',
    'camps bay, clifton, bantry bay — dramatic coastline and sunset venues.', 30),

  -- Marrakech
  ('marrakech', 'The Medina',
    'the ancient walled city — riads, palaces, souks. where the magic lives.', 10),
  ('marrakech', 'The Palmeraie',
    'the palm grove district — luxury hotels and private villas surrounded by gardens.', 20),
  ('marrakech', 'Agafay Desert',
    'the rocky desert 30 minutes south — glamping, dune dinners, atlas views.', 30),

  -- Kenya Safari
  ('kenya-safari', 'Masai Mara',
    'the iconic savanna — big five, great migration, sundowner ceremonies.', 10),
  ('kenya-safari', 'Nairobi',
    'the gateway city — giraffe manor, karen blixen, and surprisingly great food.', 20),
  ('kenya-safari', 'Laikipia & Lewa',
    'the private conservancies — more exclusive, fewer tourists, same wildlife.', 30),

  -- Sydney
  ('sydney', 'Sydney Harbour & CBD',
    'the harbour — opera house views, waterfront hotels, the iconic backdrop.', 10),
  ('sydney', 'Hunter Valley',
    'the wine country — 2 hours north, rolling vineyards, estate weddings.', 20),

  -- Fiji
  ('fiji', 'Mamanuca Islands',
    'the closest island group to nadi — private island resorts, easy access.', 10),
  ('fiji', 'Coral Coast',
    'the main island''s south coast — larger resorts, reef access.', 20)
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
  -- Cape Town
  ('cape-town', 'Table Mountain Sunset Hike', '⛰️',
    'guided group hike up table mountain via platteklip gorge (2 hours), sundowner drinks at the top, cable car down', 'Adventure', 10),
  ('cape-town', 'Franschhoek Wine Tram', '🍷',
    'a vintage tram through franschhoek valley, stopping at 6 wine farms — book a private car for 30-40 guests', 'Food', 20),
  ('cape-town', 'Cape Peninsula & Cape Point Drive', '🚗',
    'chapman''s peak, boulders beach penguins, and the cape of good hope in one day', 'Adventure', 30),
  ('cape-town', 'Township Food & Culture Tour', '🍲',
    'guided food and culture tour through langa or bo-kaap — meaningful and eye-opening', 'Cultural', 40),
  ('cape-town', 'Shark Cage Diving', '🦈',
    'shark cage diving in gansbaai — the groomsmen experience that separates the men from the boys', 'Adventure', 50),

  -- Marrakech
  ('marrakech', 'Medina Souks Shopping Expedition', '🧵',
    'guided group tour through marrakech''s souks — leather, spices, lanterns, and the aunties in their element', 'Cultural', 10),
  ('marrakech', 'Agafay Desert Glamping Dinner', '🏕️',
    'a candlelit dinner in the rocky desert with the atlas mountains at sunset — live gnawa music, fire pits, stargazing', 'Food', 20),
  ('marrakech', 'Atlas Mountains Day Trip', '🏔️',
    'half-day excursion into the atlas mountains — berber villages, mountain streams, and tagine cooked by someone''s grandmother', 'Adventure', 30),
  ('marrakech', 'Hammam & Spa Group Experience', '🧖',
    'private group hammam — traditional moroccan steam bath, black soap scrub, argan oil massage', 'Wellness', 40),

  -- Kenya Safari
  ('kenya-safari', 'Hot Air Balloon Over the Mara', '🎈',
    'sunrise over the great migration — the wedding morning that makes time stop, landing for a champagne bush breakfast', 'Adventure', 10),
  ('kenya-safari', 'Bush Sundowner Cocktail Hour', '🌅',
    'gin & tonics under an acacia tree while elephants cross in the distance — the rehearsal dinner no restaurant can compete with', 'Food', 20),
  ('kenya-safari', 'Masai Village Visit & Blessing', '🏠',
    'a masai elder blessing your union — culturally respectful, deeply moving', 'Cultural', 30),
  ('kenya-safari', 'Giraffe Centre & Elephant Orphanage (Nairobi)', '🦒',
    'hand-feed a giraffe, adopt a baby elephant, and call it a group activity', 'Cultural', 40),

  -- Sydney
  ('sydney', 'Sydney Harbour Bridge Climb', '🌉',
    'guided climb of the sydney harbour bridge — the panoramic views from the summit are extraordinary', 'Adventure', 10),
  ('sydney', 'Bondi to Coogee Coastal Walk', '🏖️',
    'the most beautiful coastal walk in australia — 6km of cliffs, beaches, ocean pools, and brunch at bondi icebergs', 'Adventure', 20),
  ('sydney', 'Hunter Valley Wine Tour', '🍇',
    'australia''s oldest wine region, 2 hours north — 4-5 cellar doors, cheese platters, and a private lunch at a winery', 'Food', 30),

  -- Fiji
  ('fiji', 'Private Island Picnic', '🏝️',
    'charter a boat to a deserted island for a beach picnic and snorkeling — the ultimate day-after experience', 'Adventure', 10),
  ('fiji', 'Fijian Meke Welcome Ceremony', '🎶',
    'traditional fijian song and dance welcome with a kava ceremony — fijian warmth at its finest', 'Cultural', 20),
  ('fiji', 'Reef Snorkeling & Diving', '🤿',
    'group snorkeling or diving on the great astrolabe reef — one of the world''s most pristine coral systems', 'Adventure', 30)
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
-- Cape Town
('babylonstoren',
 'Babylonstoren',
 'one of the oldest farms in franschhoek — and one of the most beautiful on earth',
 'Babylonstoren is a working wine farm at the base of Simonsberg mountain in Franschhoek. The famous 3.5-hectare garden — one of the most photographed in South Africa — is a living tapestry of fruit, herbs, and flowers. The estate has luxury accommodation (fynbos cottages and manor house suites), a world-class spa, farm-to-table restaurants, and event spaces that blend Cape Dutch heritage with contemporary design. Wedding setups use the gardens, the greenhouse, and the manor house lawn. The food is grown on the farm. It''s the kind of venue where the setting does the decorating for you.',
 'Franschhoek', 'South Africa',
 false, '["cape-town"]'::jsonb, '["luxury","ultra"]'::jsonb,
 80, 200, true, true, false, 'standard'),
('quoin-rock-wine-estate',
 'Quoin Rock Wine Estate',
 'cutting-edge design on the slopes of simonsberg — the modern wine estate',
 'Quoin Rock sits on the slopes of Simonsberg in Stellenbosch and combines cutting-edge architecture with artful landscaping and world-class wines. The manor house gardens (designed by Franchesca Watson) are typically private but open for weddings. The estate has a private villa for the couple, multiple indoor/outdoor event spaces, and a tasting room with mountain views. The design is contemporary — clean lines, glass, stone — which creates a striking contrast against traditional Indian wedding decor.',
 'Stellenbosch', 'South Africa',
 false, '["cape-town"]'::jsonb, '["luxury","ultra"]'::jsonb,
 80, 200, true, true, false, 'standard'),
('belmond-mount-nelson-hotel',
 'Belmond Mount Nelson Hotel',
 'the pink lady — 100+ years of cape town weddings and still the benchmark',
 'The Mount Nelson — Cape Town''s iconic "pink lady" — has been the city''s grande dame since 1899. Signature pink walls, lush gardens with Table Mountain views, classic ballroom-style reception rooms, and the kind of old-world glamour that feels effortless. The gardens are large enough for outdoor ceremonies and cocktail receptions. The location is central — in the heart of the city, walking distance to the Company''s Garden and the CBD. Garden ceremony with Table Mountain as the backdrop is the signature Mount Nelson shot.',
 'Cape Town', 'South Africa',
 false, '["cape-town"]'::jsonb, '["luxury","ultra"]'::jsonb,
 100, 250, true, true, false, 'standard'),
('twelve-apostles-hotel',
 'The Twelve Apostles Hotel & Spa',
 'the only hotel on a 6km stretch of wild atlantic coast — with the twelve apostles above',
 'Nestled at the base of the Twelve Apostles mountain range with panoramic views of the wild Atlantic Ocean. This is the only development on a 6km stretch of coastline, which means absolute privacy and dramatic natural scenery. Intimate scale — best for weddings under 80 guests. The terrace overlooking the ocean is one of the most dramatic ceremony settings in Cape Town. The hotel''s cinema, spa, and multiple dining venues create a multi-day experience without leaving the property.',
 'Cape Town', 'South Africa',
 false, '["cape-town"]'::jsonb, '["luxury","ultra"]'::jsonb,
 40, 80, true, true, false, 'standard'),
('boschendal-wine-estate',
 'Boschendal Wine Estate',
 'one of south africa''s oldest wine estates — 340 years and still pouring',
 'Boschendal is one of the oldest and most iconic wine estates in South Africa, positioned between Stellenbosch and Franschhoek. Cape Dutch manor house, rolling vineyards, majestic mountains, and heritage buildings dating to 1685. Five venue options accommodating 40 to 250 guests. The Olive Press venue blends rustic charm with modern design. The estate offers farm-to-table catering, on-site accommodation (the werf cottages), and a sense of place that connects you to 340 years of Cape history.',
 'Franschhoek', 'South Africa',
 false, '["cape-town"]'::jsonb, '["luxury"]'::jsonb,
 40, 250, true, true, false, 'standard'),

-- Marrakech
('amanjena-marrakech',
 'Amanjena',
 'the aman in marrakech — moorish pavilions, lantern-lit basins, and silence',
 'Aman''s Marrakech property, inspired by Moorish architecture — elegant pavilions and villas with private gardens and pools. The signature water bassin (reflecting pool) surrounded by hundreds of lanterns accommodates up to 500 seated guests and is one of the most iconic wedding ceremony settings in the world. The caidal tent is perfect for private candlelit dinners. The pool terrace and olive grove create additional event spaces. 32 pavilions and 6 maisons. The Aman service standard applies: extraordinary, anticipatory, and invisible.',
 'Marrakech', 'Morocco',
 false, '["marrakech"]'::jsonb, '["luxury","ultra"]'::jsonb,
 100, 500, true, true, false, 'standard'),
('royal-mansour-marrakech',
 'Royal Mansour Marrakech',
 'commissioned by the king of morocco — literally a palace',
 'Royal Mansour was commissioned by King Mohammed VI and is, architecturally, the most extraordinary hotel in Marrakech. 53 private riads (not rooms — entire private houses) each a masterpiece of Moroccan craftsmanship with private pools, rooftop terraces, and butler service. The hotel is intimate rather than grand — not suited for 500-person celebrations but perfect for 80-120 guest weddings where every detail is museum-quality. Michelin-starred dining. The largest riad has 4 bedrooms. The craftsmanship — zellige, carved plaster, painted cedar — took 1,500 artisans to create.',
 'Marrakech', 'Morocco',
 false, '["marrakech"]'::jsonb, '["luxury","ultra"]'::jsonb,
 60, 120, true, true, false, 'standard'),
('la-mamounia',
 'La Mamounia',
 'the marrakech icon — where churchill painted and the jet set partied',
 'La Mamounia is Marrakech''s most legendary hotel — 100+ years of hosting royalty, Hollywood, and heads of state. The gardens (7 hectares inside the medina walls) are among the most beautiful in Morocco: orange trees, olive groves, rose gardens. The interiors mix art deco with traditional Moroccan design. 209 rooms and suites, multiple restaurants, a spa, and event spaces that range from the grand ballroom to the garden terraces. Indian weddings here benefit from the hotel''s deep experience with international luxury celebrations.',
 'Marrakech', 'Morocco',
 false, '["marrakech"]'::jsonb, '["luxury","ultra"]'::jsonb,
 100, 300, true, true, false, 'standard'),
('mandarin-oriental-marrakech',
 'Mandarin Oriental Marrakech',
 '20 hectares of olive groves with the atlas mountains as wallpaper',
 'The Mandarin Oriental Marrakech spans 20 hectares of olive groves and gardens with Atlas mountain views. The design is contemporary Moroccan — clean lines with traditional craft details. 54 villas and 9 suites, each with private gardens and pools. Outdoor venues surrounded by olive trees and water features accommodate up to 200 guests. The scale of the property means privacy and space — each event can have its own distinct setting. The spa is world-class. The ballroom handles indoor receptions with modern elegance.',
 'Marrakech', 'Morocco',
 false, '["marrakech"]'::jsonb, '["luxury","ultra"]'::jsonb,
 80, 200, true, true, false, 'standard'),
('villa-taj-marrakech',
 'Villa Taj Marrakech',
 '21 bedrooms, 3 reception areas, and a 1001 nights tent — your private palace',
 'Villa Taj is a private estate available exclusively for hire — 21 bedrooms across the main villa and adjacent properties, three distinct reception areas, and a "1001 nights" tent for rehearsal dinners that feels authentically Moroccan. It''s the anti-hotel pick: your entire wedding party stays on-site, every event happens within the property, and no other guests share the space. The tiered gardens, intricate tilework, and pool courtyard create multiple settings for a multi-day celebration. Frequently chosen by international couples and top-tier planners.',
 'Marrakech', 'Morocco',
 false, '["marrakech"]'::jsonb, '["luxury"]'::jsonb,
 40, 75, true, true, false, 'standard'),

-- Kenya Safari
('giraffe-manor',
 'Giraffe Manor',
 'breakfast with giraffes — the most instagrammed hotel in africa',
 'Giraffe Manor is a 1930s manor house set on 12 acres of private land within 140 acres of indigenous forest in Langata, Nairobi. The resident Rothschild giraffes visit at breakfast and tea time, poking their heads through the windows — it''s one of the most iconic hotel experiences in the world. 12 rooms across the main manor and Garden Manor. Exclusive buyout gives you the entire property. The ceremony in the garden with giraffes wandering past is not a fantasy — it''s literally the product. 40 guests maximum. The most intimate, most photographed, most unforgettable wedding venue in Africa.',
 'Nairobi', 'Kenya',
 false, '["kenya-safari"]'::jsonb, '["luxury","ultra"]'::jsonb,
 20, 40, true, true, false, 'standard'),
('angama-mara',
 'Angama Mara',
 'suspended above the mara — the lodge from out of africa, literally',
 'Angama Mara sits on the edge of the Great Rift Valley escarpment, directly above the spot where "Out of Africa" was filmed. The views over the Masai Mara are considered among the most beautiful in the world. 30 tented suites in two camps (north and south), each with floor-to-ceiling glass and private decks overlooking the Mara. The property can be fully bought out for weddings. Ceremonies on the escarpment with the endless savanna below. Hot air balloon rides at sunrise. Game drives between events. Charter flights from Nairobi (1 hour).',
 'Masai Mara', 'Kenya',
 false, '["kenya-safari"]'::jsonb, '["luxury","ultra"]'::jsonb,
 30, 60, true, true, false, 'standard'),
('segera-retreat',
 'Segera Retreat',
 'art, wildlife, and sustainability on a 50,000-acre conservancy',
 'Segera Retreat sits on a 50,000-acre private wildlife conservancy in Laikipia — home to all big five plus wild dogs, Grevy''s zebra, and more. The property blends luxury safari with a world-class contemporary art collection. 8 villas with private pools and gardens. The wine tower, sculpture garden, and multiple outdoor dining terraces create event settings that are part gallery, part wilderness. Full buyout capacity: 16 adults in villas, plus additional tented options. Ceremonies under ancient fig trees or beside the infinity pool overlooking the conservancy.',
 'Laikipia', 'Kenya',
 false, '["kenya-safari"]'::jsonb, '["luxury","ultra"]'::jsonb,
 16, 40, true, true, false, 'standard'),

-- Sydney
('park-hyatt-sydney',
 'Park Hyatt Sydney',
 'opera house on your left, harbour bridge on your right — no other hotel does this',
 'Directly on Sydney Harbour with unobstructed views of both the Opera House and the Harbour Bridge. The rooftop terrace is one of the most dramatic ceremony venues in the southern hemisphere. 155 rooms and suites. The Dining Room and Terrace can be configured for receptions up to 200 guests. The location is impossible to replicate — your ceremony photos have the two most recognizable landmarks in Australia as the backdrop.',
 'Sydney', 'Australia',
 false, '["sydney"]'::jsonb, '["luxury","ultra"]'::jsonb,
 80, 200, true, true, false, 'standard'),
('langham-sydney',
 'The Langham Sydney',
 'the grand ballroom that makes your sangeet feel like a gala',
 'The Langham sits in the Rocks district with harbour views. The Lyons Ballroom is one of Sydney''s grandest event spaces — high ceilings, crystal chandeliers, and capacity for 350 guests. The hotel''s service standard is consistently top-tier. Multiple venue options for multi-day events: the ballroom for reception, the terrace for cocktails, and intimate spaces for mehndi. Experienced with Indian celebrations and multi-day wedding bookings.',
 'Sydney', 'Australia',
 false, '["sydney"]'::jsonb, '["luxury","ultra"]'::jsonb,
 100, 350, true, true, false, 'standard'),
('doltone-house-hyde-park',
 'Doltone House Hyde Park',
 'sydney''s premier indian wedding venue — 600 capacity and they know the drill',
 'Doltone House is Sydney''s most experienced large-scale Indian wedding venue. The Hyde Park location is a heritage-listed building with soaring ceilings, marble columns, and a grand staircase. Capacity up to 600 guests for seated events. The team has extensive experience with Indian, Sri Lankan, and South Asian weddings — multi-day bookings, fire ceremonies, baraat setups, and Indian catering coordination. This is where Sydney''s Indian community hosts their landmark celebrations.',
 'Sydney', 'Australia',
 false, '["sydney"]'::jsonb, '["elevated","luxury"]'::jsonb,
 200, 600, true, true, false, 'standard'),

-- Fiji
('kokomo-private-island',
 'Kokomo Private Island Fiji',
 'your own private island, your own private reef, your own private wedding',
 'Kokomo is a private island resort in the Great Astrolabe Reef — one of the world''s largest barrier reefs. 21 beachfront villas and 5 hilltop residences, each with private pools. Full island buyout means the entire island is exclusively yours. Pristine white sand beaches, a world-class spa, multiple dining venues, and a house reef for snorkeling. Ceremonies on the beach with nothing but ocean and sky. The ultimate in privacy and exclusivity.',
 'Kadavu', 'Fiji',
 false, '["fiji"]'::jsonb, '["luxury","ultra"]'::jsonb,
 40, 80, true, true, false, 'standard'),
('six-senses-fiji',
 'Six Senses Fiji',
 'sustainability meets luxury on malolo island — the conscious couple''s fiji pick',
 'On Malolo Island, Six Senses Fiji combines barefoot luxury with sustainability. 24 pool villas with ocean views. The resort''s commitment to sustainability (organic gardens, solar power, marine conservation) appeals to couples who want luxury without the environmental guilt. Beachfront ceremonies, hilltop dining terrace, and a spa that''s consistently ranked among the best in the South Pacific. Fiji''s Indian-Fijian population means Hindu ceremony support is available locally.',
 'Malolo Island', 'Fiji',
 false, '["fiji"]'::jsonb, '["luxury","ultra"]'::jsonb,
 60, 120, true, true, false, 'standard')
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
  'babylonstoren','quoin-rock-wine-estate','belmond-mount-nelson-hotel','twelve-apostles-hotel','boschendal-wine-estate',
  'amanjena-marrakech','royal-mansour-marrakech','la-mamounia','mandarin-oriental-marrakech','villa-taj-marrakech',
  'giraffe-manor','angama-mara','segera-retreat',
  'park-hyatt-sydney','langham-sydney','doltone-house-hyde-park',
  'kokomo-private-island','six-senses-fiji'
)
ON CONFLICT (vendor_id, category_id) DO NOTHING;

-- Per-venue pricing indicators against the Venue category.
INSERT INTO vendor_pricing_indicators (vendor_id, category_id, price_low_usd, price_high_usd, price_unit, notes)
SELECT v.id, vc.id, p.lo, p.hi, 'package'::vendor_pricing_unit, ''
FROM vendors v
JOIN vendor_categories vc ON vc.slug = 'venue'
JOIN (VALUES
  -- Cape Town
  ('babylonstoren',                   60000,   200000),
  ('quoin-rock-wine-estate',          50000,   180000),
  ('belmond-mount-nelson-hotel',      80000,   250000),
  ('twelve-apostles-hotel',           60000,   180000),
  ('boschendal-wine-estate',          40000,   150000),
  -- Marrakech
  ('amanjena-marrakech',             200000,   600000),
  ('royal-mansour-marrakech',        300000,   700000),
  ('la-mamounia',                    180000,   500000),
  ('mandarin-oriental-marrakech',    150000,   400000),
  ('villa-taj-marrakech',             80000,   250000),
  -- Kenya Safari
  ('giraffe-manor',                  200000,   500000),
  ('angama-mara',                    250000,   600000),
  ('segera-retreat',                 200000,   500000),
  -- Sydney
  ('park-hyatt-sydney',              200000,   500000),
  ('langham-sydney',                 150000,   400000),
  ('doltone-house-hyde-park',         80000,   250000),
  -- Fiji
  ('kokomo-private-island',          300000,   700000),
  ('six-senses-fiji',                200000,   500000)
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
-- Categories: photography, decor-florals, catering, dj.
--
-- Note on Africa / Oceania vendor ecosystems: Marrakech, Cape Town, and
-- Kenya Safari pull most Indian-wedding vendors from London, Mumbai,
-- Dubai, or Nairobi (for the Kenya circuit). Sydney has a deep local
-- Indian vendor scene. Fiji typically imports from Sydney or Singapore.
-- Bios reflect that.
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
  ('cape-town',    'Cape Town', 'Cape Town', 'South Africa'),
  ('marrakech',    'Marrakech', 'Marrakech', 'Morocco'),
  ('kenya-safari', 'Nairobi',   'Nairobi',   'Kenya'),
  ('sydney',       'Sydney',    'Sydney',    'Australia'),
  ('fiji',         'Fiji',      'Nadi',      'Fiji')
) AS d(dest_slug, brand_suffix, home_city, country)
CROSS JOIN (VALUES
  -- (cat_slug, idx, name_template, tagline, bio_extra)
  -- Photography ──────────────────────────────────────────────────────────
  ('photography', 1, 'Cape Light Studio',
    'wedding films that look like vogue editorials',
    'Editorial-led wedding photography for Africa and Oceania destinations. Most premium Indian-wedding photographers travel from London, Mumbai, Dubai, or Sydney for these markets. Placeholder roster — real photographers will be imported from the Marigold vendor pipeline.'),
  ('photography', 2, 'Saffron Lens',
    'wedding films that look like vogue editorials',
    'Editorial-led wedding photography for Africa and Oceania destinations. Most premium Indian-wedding photographers travel from London, Mumbai, Dubai, or Sydney for these markets. Placeholder roster — real photographers will be imported from the Marigold vendor pipeline.'),
  ('photography', 3, 'House of Marigold',
    'wedding films that look like vogue editorials',
    'Editorial-led wedding photography for Africa and Oceania destinations. Most premium Indian-wedding photographers travel from London, Mumbai, Dubai, or Sydney for these markets. Placeholder roster — real photographers will be imported from the Marigold vendor pipeline.'),
  -- Decor & Florals ──────────────────────────────────────────────────────
  ('decor-florals', 1, 'Riad Rose Decor',
    'florals that hold up in winelands wind, designed for instagram',
    'Decor and floral design across mandap, sangeet, and reception. African and Oceanic destinations typically combine local florists with imported Indian design leads (Mumbai/Delhi/Sydney-based) for mandap construction. Placeholder until real decor partners are confirmed and listed.'),
  ('decor-florals', 2, 'Petal & Plinth',
    'florals that hold up in winelands wind, designed for instagram',
    'Decor and floral design across mandap, sangeet, and reception. African and Oceanic destinations typically combine local florists with imported Indian design leads (Mumbai/Delhi/Sydney-based) for mandap construction. Placeholder until real decor partners are confirmed and listed.'),
  ('decor-florals', 3, 'Gulmohar Atelier',
    'florals that hold up in winelands wind, designed for instagram',
    'Decor and floral design across mandap, sangeet, and reception. African and Oceanic destinations typically combine local florists with imported Indian design leads (Mumbai/Delhi/Sydney-based) for mandap construction. Placeholder until real decor partners are confirmed and listed.'),
  -- Catering ─────────────────────────────────────────────────────────────
  ('catering', 1, 'Safari Spice Catering',
    'the chef who finally got biryani right at scale',
    'External Indian catering for Africa and Oceania destinations. Most local venues (riads, bush lodges, cliffside resorts) require external catering — Indian wedding caterers are typically flown in from London, Sydney, or Mumbai, or sourced from the Indian diaspora communities in Durban, Marbella, or Singapore. Placeholder entry.'),
  ('catering', 2, 'Thali Atelier',
    'the chef who finally got biryani right at scale',
    'External Indian catering for Africa and Oceania destinations. Most local venues (riads, bush lodges, cliffside resorts) require external catering — Indian wedding caterers are typically flown in from London, Sydney, or Mumbai, or sourced from the Indian diaspora communities in Durban, Marbella, or Singapore. Placeholder entry.'),
  ('catering', 3, 'The Saffron Table',
    'the chef who finally got biryani right at scale',
    'External Indian catering for Africa and Oceania destinations. Most local venues (riads, bush lodges, cliffside resorts) require external catering — Indian wedding caterers are typically flown in from London, Sydney, or Mumbai, or sourced from the Indian diaspora communities in Durban, Marbella, or Singapore. Placeholder entry.'),
  -- DJ / Entertainment ───────────────────────────────────────────────────
  ('dj', 1, 'Harbour Beats',
    'the dj who plays bollywood at 1am without being asked twice',
    'Multi-genre wedding DJ. Bollywood, Punjabi, English Top 40, sangeet sets. Bollywood-specialist DJs are typically flown in from Sydney, London, or Mumbai for these markets; local DJs handle the cocktail-hour and house-music windows. Placeholder until the real DJs are imported.'),
  ('dj', 2, 'Island Sound Co.',
    'the dj who plays bollywood at 1am without being asked twice',
    'Multi-genre wedding DJ. Bollywood, Punjabi, English Top 40, sangeet sets. Bollywood-specialist DJs are typically flown in from Sydney, London, or Mumbai for these markets; local DJs handle the cocktail-hour and house-music windows. Placeholder until the real DJs are imported.'),
  ('dj', 3, 'Tanpura Nights',
    'the dj who plays bollywood at 1am without being asked twice',
    'Multi-genre wedding DJ. Bollywood, Punjabi, English Top 40, sangeet sets. Bollywood-specialist DJs are typically flown in from Sydney, London, or Mumbai for these markets; local DJs handle the cocktail-hour and house-music windows. Placeholder until the real DJs are imported.')
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
  AND split_part(v.slug, '__', 2) IN ('cape-town','marrakech','kenya-safari','sydney','fiji')
ON CONFLICT (vendor_id, category_id) DO NOTHING;
