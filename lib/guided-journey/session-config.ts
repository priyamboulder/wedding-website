// Display registry: title, subtitle, estimated minutes for every session
// across every category. Schemas reference these by `key`.
import type { CategoryKey } from "./types";

export interface SessionConfig {
  title: string;
  subtitle: string;
  estimated_minutes: number;
}

export const SESSION_CONFIG: Record<string, SessionConfig> = {
  // ── Photography (existing impl, included for completeness) ───────────
  photography_vibe:        { title: "What's your photography vibe?",      subtitle: "Tap the keywords that resonate, then slide the colour & tone.",                       estimated_minutes: 2 },
  show_what_you_love:      { title: "Show us what you love",               subtitle: "Heart the frames that feel like yours. Add your own pins.",                          estimated_minutes: 3 },
  moments_that_matter:     { title: "The moments that matter",             subtitle: "List the beats and expressions you can't bear to miss.",                             estimated_minutes: 2 },
  your_people:             { title: "Your people",                         subtitle: "Map your group photos and flag the VIPs.",                                           estimated_minutes: 2 },
  photography_brief:       { title: "Your photography brief",              subtitle: "We've drafted it from your answers — read, tweak, finalise.",                        estimated_minutes: 3 },

  // ── Videography ──────────────────────────────────────────────────────
  film_style:              { title: "Your film style",                     subtitle: "Pick the vibe, choose your formats, and set the tone.",                              estimated_minutes: 2 },
  film_references:         { title: "What films move you",                 subtitle: "React to curated films and share your own references.",                              estimated_minutes: 3 },
  moments_and_story:       { title: "The moments & your story",            subtitle: "The scenes your videographer can't miss — and the love story behind them.",          estimated_minutes: 3 },
  sound_and_voice:         { title: "The soundtrack & narration",          subtitle: "Music direction, voiceover style, and the sounds that carry your film.",             estimated_minutes: 3 },
  film_brief:              { title: "Your film brief",                     subtitle: "We've drafted it from your answers — read, tweak, finalise.",                        estimated_minutes: 2 },

  // ── Catering ─────────────────────────────────────────────────────────
  food_philosophy:         { title: "Your food philosophy",                subtitle: "Cuisines, service style, and how formal the food should feel.",                      estimated_minutes: 2 },
  food_inspiration:        { title: "What food experiences inspire you?",  subtitle: "React to food images by event and pin what makes you hungry.",                       estimated_minutes: 2 },
  dietary_landscape:       { title: "The dietary landscape",               subtitle: "Jain, vegan, allergies — help us understand who you're feeding.",                    estimated_minutes: 2 },
  bar_beverages:           { title: "Bar & beverages",                     subtitle: "Open bar, dry wedding, or something in between.",                                    estimated_minutes: 2 },
  per_event_food:          { title: "Per-event food vision",               subtitle: "Each event is a different food story — tell us what each one feels like.",          estimated_minutes: 2 },
  dining_brief:            { title: "Your dining brief",                   subtitle: "Your food story, ready to share with caterers.",                                     estimated_minutes: 2 },

  // ── Décor & Florals ──────────────────────────────────────────────────
  aesthetic_direction:     { title: "Your aesthetic direction",            subtitle: "Style keywords, colour story, and how formal it should feel.",                       estimated_minutes: 2 },
  decor_inspiration:       { title: "Inspiration images",                  subtitle: "Pin what stops you mid-scroll — tag it by element and event.",                       estimated_minutes: 2 },
  event_scenes:            { title: "Your spaces & events",                subtitle: "Walk through each space and describe what each event should feel like.",             estimated_minutes: 2 },
  floral_vision:           { title: "Your floral direction",               subtitle: "Real or faux, favourite flowers, palettes, and arrangement style.",                  estimated_minutes: 3 },
  lighting_vision:         { title: "Lighting mood & elements",            subtitle: "How soft or dramatic each event should feel — and which fixtures you love.",         estimated_minutes: 2 },
  decor_boundaries:        { title: "Do's and don'ts",                     subtitle: "The things you definitely want — and the things you absolutely don't.",              estimated_minutes: 2 },
  decor_brief:             { title: "Your décor brief",                    subtitle: "Everything pulled together — read, tweak, finalise.",                                estimated_minutes: 2 },

  // ── Music & Entertainment ────────────────────────────────────────────
  music_identity:          { title: "Your music identity",                 subtitle: "Genres, energy levels, and the eras that define your sound.",                        estimated_minutes: 2 },
  music_explorer:          { title: "Discover your sound",                 subtitle: "Play, heart, and save — build your wedding soundtrack by vibe.",                     estimated_minutes: 3 },
  speeches_and_mc:         { title: "Speeches & your MC",                  subtitle: "Who speaks, how the MC runs the night, and the names they need to nail.",            estimated_minutes: 2 },
  event_soundscapes:       { title: "Per-event sound design",              subtitle: "The opening mood, the peak, the wind-down — for every event.",                       estimated_minutes: 3 },
  music_brief:             { title: "Your sound brief",                    subtitle: "Your soundtrack vision, ready to share with DJs and musicians.",                     estimated_minutes: 2 },

  // ── Hair & Makeup ────────────────────────────────────────────────────
  beauty_style:            { title: "Your beauty style",                   subtitle: "Tap the looks that feel like you — then calibrate the colour and intensity.",        estimated_minutes: 2 },
  beauty_inspiration:      { title: "Inspiration looks",                   subtitle: "Pin the hair and makeup looks that make you say yes.",                               estimated_minutes: 2 },
  skin_and_products:       { title: "Your skin, hair & favourite products", subtitle: "Help your artist understand your skin — and the products you already trust.",       estimated_minutes: 2 },
  per_event_looks:         { title: "Per-event looks",                     subtitle: "Each event gets its own look — map out the arc from haldi to reception.",            estimated_minutes: 3 },
  beauty_non_negotiables:  { title: "Must-haves, moments & boundaries",    subtitle: "The details you won't compromise on — and the moments you want captured.",           estimated_minutes: 2 },
  chair_list:              { title: "The chair list",                      subtitle: "Who else needs hair and makeup? Add your people.",                                   estimated_minutes: 2 },
  beauty_brief:            { title: "Your beauty brief",                   subtitle: "Your beauty vision, ready to share with artists.",                                   estimated_minutes: 2 },

  // ── Mehendi (Vision journey) ─────────────────────────────────────────
  mehendi_style:           { title: "Your mehendi style",                  subtitle: "Traditional bridal, minimal modern, or something in between?",                       estimated_minutes: 3 },
  guest_mehendi:           { title: "Guest mehendi planning",              subtitle: "How many guests want mehendi, and what kind of setup do you need?",                  estimated_minutes: 3 },
  mehendi_brief:           { title: "Your mehendi brief",                  subtitle: "Your mehendi vision, ready to share with artists.",                                  estimated_minutes: 2 },

  // ── Mehendi (Logistics journey) ──────────────────────────────────────
  tiers_and_capacity:      { title: "Design tiers & capacity",             subtitle: "Decide who gets what level of mehendi — and whether your artists can serve everyone.", estimated_minutes: 3 },
  artist_contract:         { title: "Artist contract checklist",           subtitle: "The seven things to lock down before you sign.",                                       estimated_minutes: 3 },
  day_of_flow:             { title: "Day-of flow & bride care",            subtitle: "The timeline, the helper, and the room setup.",                                        estimated_minutes: 2 },

  // ── Priest / Pandit (Vision journey) ─────────────────────────────────
  ceremony_traditions:     { title: "Your ceremony traditions",            subtitle: "Pick your broad tradition, then the regional variant — plus duration, language, and how involved guests should be.", estimated_minutes: 3 },
  ceremony_brief:          { title: "Your ceremony brief",                 subtitle: "Your ceremony vision, ready to share with your pandit.",                             estimated_minutes: 2 },

  // ── Priest / Pandit (Build journey) ──────────────────────────────────
  rituals_walkthrough:     { title: "Walk through the rituals",            subtitle: "For each ritual: include, skip, or flag for discussion with your pandit.",          estimated_minutes: 5 },
  family_roles:            { title: "Family roles",                        subtitle: "Who does what — and quietly, who doesn't.",                                          estimated_minutes: 4 },
  samagri_review:          { title: "Samagri & supplies",                  subtitle: "Confirm what's needed, who's sourcing, and what the officiant brings.",              estimated_minutes: 3 },
  ceremony_logistics:      { title: "Day-of logistics",                    subtitle: "Mandap, audio, guest experience, and vendor handoffs.",                              estimated_minutes: 3 },

  // ── Stationery & Invitations ─────────────────────────────────────────
  visual_identity:         { title: "Your visual identity",                subtitle: "Style keywords, tone, typography, and language.",                                    estimated_minutes: 2 },
  paper_and_palette:       { title: "Paper, texture & colour",             subtitle: "How should the paper feel in-hand — and what colours carry through?",                estimated_minutes: 2 },
  stationery_suite:        { title: "Your paper suite",                    subtitle: "Pick the pieces that matter — from save-the-date to thank-you cards.",               estimated_minutes: 2 },
  stationery_inspiration:  { title: "Inspiration & references",            subtitle: "Browse by piece, by vibe — and note the details that won't leave your head.",        estimated_minutes: 2 },
  stationery_brief:        { title: "Your stationery brief",               subtitle: "Everything pulled together — read, tweak, finalise.",                                estimated_minutes: 2 },

  // ── Venue ────────────────────────────────────────────────────────────
  venue_discovery:         { title: "What kind of spaces move you?",       subtitle: "React to venue vibes — palaces, gardens, beaches, intimate estates.",                estimated_minutes: 3 },
  venue_priorities:        { title: "What matters most?",                  subtitle: "Families together, outdoor ceremony, wow entrance — pick your non-negotiables.",     estimated_minutes: 2 },
  venue_requirements:      { title: "Practical requirements",              subtitle: "Catering rules, fire ceremony, rain plans — the things that narrow the field.",      estimated_minutes: 2 },
  venue_brief:             { title: "Your venue brief",                    subtitle: "Close your eyes. Describe the world your guests walk into.",                          estimated_minutes: 2 },

  // ── Wardrobe & Styling (Vision journey) ──────────────────────────────
  wardrobe_style:          { title: "Your style direction",                subtitle: "Style keywords, designer preferences, and the per-event colour story.",              estimated_minutes: 3 },
  wardrobe_inspiration:    { title: "Inspiration & references",            subtitle: "Tag a moodboard, react to per-event references — Bride / Groom / Family / Accessories.", estimated_minutes: 3 },
  wardrobe_brief:          { title: "Your wardrobe brief",                 subtitle: "Heritage, statement, comfort, family tradition — the through-line of your week.",    estimated_minutes: 2 },

  // ── Wardrobe & Styling (Build journey) ───────────────────────────────
  outfit_planner:          { title: "Plan every look",                     subtitle: "The matrix: who wears what at each event. Bride first, then groom, then everyone else.", estimated_minutes: 5 },
  family_coordination:     { title: "Family coordination",                 subtitle: "Bride side, groom side, AI palette suggestions, coordination rules.",                estimated_minutes: 4 },
  delivery_documents:      { title: "Delivery & documents",                subtitle: "When everything arrives, where the swatches and receipts live.",                     estimated_minutes: 3 },

  // ── Jewelry (Vision journey) ─────────────────────────────────────────
  jewelry_direction:       { title: "Your jewelry direction",              subtitle: "Metals, style families, weight & vibe — three steps to a clear direction.",         estimated_minutes: 3 },
  jewelry_inspiration:     { title: "Inspiration & references",            subtitle: "Moodboard, per-event references, celebrities you love, outfits you'll pair.",       estimated_minutes: 2 },
  jewelry_brief:           { title: "Your jewelry brief",                  subtitle: "Your direction, ready to share with jewellers — with insurance framing.",            estimated_minutes: 2 },

  // ── Jewelry (Build journey) ──────────────────────────────────────────
  bridal_inventory:        { title: "Bridal jewelry inventory",            subtitle: "Every piece you're wearing — wishlist, sourcing, delivery.",                         estimated_minutes: 5 },
  groom_inventory:         { title: "Groom's jewelry",                     subtitle: "Safa brooch, kalgi, mala, buttons — sherwani has its own language.",                 estimated_minutes: 4 },
  family_heirlooms:        { title: "Family heirlooms",                    subtitle: "The pieces that come with stories. Lender, condition, who carries them.",            estimated_minutes: 3 },
  fittings_custody:        { title: "Fittings & day-of custody",           subtitle: "Appointments, handoffs, who carries $50K of jewelry to the mandap.",                 estimated_minutes: 3 },

  // ── Cake & Sweets (Vision journey) ───────────────────────────────────
  sweets_vision:           { title: "Your sweets vision",                  subtitle: "Wedding cake, mithai spread, dessert table — or all of the above?",                  estimated_minutes: 3 },
  sweets_inspiration:      { title: "Design & inspiration",                subtitle: "Pin the cakes, displays, and presentations that inspire you.",                       estimated_minutes: 2 },
  sweets_brief:            { title: "Your sweets brief",                   subtitle: "Your sweet vision, ready to share with bakers and mithai vendors.",                  estimated_minutes: 2 },

  // ── Cake & Sweets (Selection journey) ────────────────────────────────
  cake_design:             { title: "Design your cake",                    subtitle: "Tiers, flavors per tier, cutting ceremony, allergen flags.",                         estimated_minutes: 4 },
  mithai_spread:           { title: "Build your mithai spread",            subtitle: "Browse the catalog. Love what speaks to you, dismiss what doesn't.",                  estimated_minutes: 4 },
  dessert_tables:          { title: "Plan your dessert tables",            subtitle: "Per-event styling, plating, props, attendants.",                                      estimated_minutes: 3 },
  service_plan:            { title: "Service plan",                        subtitle: "When each dessert gets served, refresh cadence, late-night drops.",                   estimated_minutes: 3 },

  // ── Transportation (Vision journey) ──────────────────────────────────
  transport_needs:         { title: "Your transport needs",                subtitle: "Shuttles, baraat horse, vintage getaway car — map out the logistics.",               estimated_minutes: 3 },
  transport_brief:         { title: "Your transport brief",                subtitle: "Your logistics plan, ready to share with transport vendors.",                        estimated_minutes: 2 },

  // ── Transportation (Build journey) ───────────────────────────────────
  baraat_walkthrough:      { title: "Baraat walkthrough",                  subtitle: "The most public 20 minutes of the wedding. Plan every beat.",                        estimated_minutes: 6 },
  guest_movement_math:     { title: "Guest movement math",                 subtitle: "Shuttles, airport pickups, VIP moves — concrete times and counts.",                  estimated_minutes: 5 },
  fleet_roster:            { title: "Fleet roster",                        subtitle: "Family vehicles, vendor parking, who drives what.",                                  estimated_minutes: 3 },

  // ── Travel & Accommodations (Vision journey) ────────────────────────
  accommodation_needs:     { title: "Where everyone stays",                subtitle: "Guest math, proximity, block strategy, and who's paying.",                            estimated_minutes: 3 },
  guest_travel:            { title: "Guest travel coordination",           subtitle: "Group flights, airport pickups, source cities, and travel info.",                    estimated_minutes: 3 },
  travel_brief:            { title: "Your travel brief",                   subtitle: "Your accommodation and travel plan, ready to share.",                                estimated_minutes: 2 },

  // ── Travel & Accommodations (Build journey) ─────────────────────────
  block_setup:             { title: "Set up your room blocks",             subtitle: "Negotiated rates, attrition floors, cutoff dates — the floor visible.",              estimated_minutes: 6 },
  guest_travel_tracker:    { title: "Track guest travel",                  subtitle: "Arrival dates, hotels, who hasn't booked yet — pickup rosters from clusters.",       estimated_minutes: 5 },

  // ── Gifting (Vision journey) ─────────────────────────────────────────
  gifting_philosophy:      { title: "Your gifting philosophy",             subtitle: "Style direction, per-category budget anchors, and the gift traditions you want to honour.", estimated_minutes: 3 },
  gifting_inspiration:     { title: "Gift ideas & inspiration",            subtitle: "React to curated ideas by category — loved ones become draft items in their sub-tab.",  estimated_minutes: 3 },
  gifting_brief:           { title: "Your gifting brief",                  subtitle: "Your gifting plan, organized and ready.",                                            estimated_minutes: 2 },

  // ── Gifting (Build journey) ──────────────────────────────────────────
  welcome_bags:            { title: "Welcome bags inventory",              subtitle: "One bag per room. Itinerary card, local snacks, water, hangover kit.",              estimated_minutes: 4 },
  trousseau_packaging:     { title: "Trousseau packaging",                 subtitle: "Saree trays, jewelry boxes, nagphans — coordinated with stationery.",               estimated_minutes: 4 },
  return_favors:           { title: "Return favors",                       subtitle: "Thank-you favors for guests — quantity by RSVP head count.",                         estimated_minutes: 3 },
  family_exchanges:        { title: "Family exchanges",                    subtitle: "Milni / vevai gifts between families. Bridal party gifts too.",                      estimated_minutes: 4 },

  // ── Guest Experiences ────────────────────────────────────────────────
  experience_vibe:         { title: "What kind of experience do you want?", subtitle: "Tell us about your guests and what matters most — we'll curate the browse.",        estimated_minutes: 2 },
  experience_browse:       { title: "Browse and react",                    subtitle: "We'll walk you through the best ideas, category by category. Love what lands.",      estimated_minutes: 4 },
  experience_map:          { title: "Map it to your events",               subtitle: "Drag your loved ideas to the events where they belong.",                             estimated_minutes: 2 },
  experience_brief:        { title: "Your experience brief",               subtitle: "Everything pulled together — plus the ideas you can't stop thinking about.",         estimated_minutes: 2 },
};

export interface JourneyIntro {
  heading: string;
  altHeading: string; // shown when journey is complete
  subtext: string;
  totalMinutes: number;
  // Optional soft time-gate: surface a muted state until the wedding is
  // closer than this many months. Click is still allowed.
  unlocksAtMonthsBeforeEvent?: number;
}

// Compound key for journeys that aren't the default one for a category
// (e.g. "mehendi:logistics"). The default journey for a category continues
// to use the bare CategoryKey and lives in JOURNEY_INTROS below.
export type ExtraJourneyKey = `${CategoryKey}:${string}`;

export const JOURNEY_INTROS: Record<CategoryKey, JourneyIntro> = {
  photography:    { heading: "Let's design your photography vision together.",                           altHeading: "Your photography vision, fully composed.",   subtext: "Five short sessions. About twelve minutes total.",     totalMinutes: 12 },
  videography:    { heading: "Let's shape the story your wedding film will tell.",                       altHeading: "Your wedding film story is ready.",          subtext: "Five short sessions. About thirteen minutes total.",   totalMinutes: 13 },
  catering:       { heading: "Let's design the food experience your guests will talk about for years.",  altHeading: "Your dining vision, plated and ready.",      subtext: "Six short sessions. About twelve minutes total.",      totalMinutes: 12 },
  decor:          { heading: "Let's discover what your wedding should feel like when you walk in.",      altHeading: "Your décor vision, fully composed.",         subtext: "Seven short sessions. About fifteen minutes total.",   totalMinutes: 15 },
  music:          { heading: "Let's set the soundtrack for every moment of your celebration.",           altHeading: "Your soundtrack is ready to play.",          subtext: "Five short sessions. About twelve minutes total.",     totalMinutes: 12 },
  hmua:           { heading: "Let's design how you'll look and feel on every event day.",                altHeading: "Your beauty vision is locked in.",           subtext: "Seven short sessions. About fifteen minutes total.",   totalMinutes: 15 },
  mehendi:        { heading: "Let's design the mehendi experience — for you and your guests.",          altHeading: "Your mehendi plan is ready.",                subtext: "Three short sessions. About eight minutes total.",     totalMinutes: 8  },
  priest:         { heading: "Let's plan the ceremony that honours your traditions.",                   altHeading: "Your ceremony brief is composed.",           subtext: "Two short sessions. About five minutes total.",        totalMinutes: 5  },
  stationery:     { heading: "Let's design the visual identity of your wedding — starting with the very first thing guests see.", altHeading: "Your stationery vision is ready.",           subtext: "Five short sessions. About ten minutes total.",        totalMinutes: 10 },
  venue:          { heading: "Let's figure out what kind of spaces your wedding needs.",                altHeading: "Your venue brief is ready.",                 subtext: "Four short sessions. About nine minutes total.",       totalMinutes: 9  },
  wardrobe:       { heading: "Let's plan the looks that will make you feel like the best version of yourselves.", altHeading: "Your wardrobe is mapped.",        subtext: "Three short sessions. About eight minutes total.",     totalMinutes: 8  },
  jewelry:        { heading: "Let's plan the pieces that complete every look.",                          altHeading: "Your jewelry plan is set.",                  subtext: "Three short sessions. About seven minutes total.",     totalMinutes: 7  },
  cake_sweets:    { heading: "Let's design the sweet ending to every event.",                            altHeading: "Your sweets vision is set.",                 subtext: "Three short sessions. About seven minutes total.",     totalMinutes: 7  },
  transportation: { heading: "Let's plan how everyone gets to the right place.",                         altHeading: "Your transport plan is ready.",              subtext: "Two short sessions. About five minutes total.",        totalMinutes: 5  },
  travel:         { heading: "Let's plan where everyone stays.",                                          altHeading: "Your travel plan is ready.",                 subtext: "Three short sessions. About eight minutes total.",     totalMinutes: 8  },
  gifting:        { heading: "Let's plan how you give and receive with intention.",                     altHeading: "Your gifting vision is ready.",              subtext: "Three short sessions. About seven minutes total.",     totalMinutes: 7  },
  guest_experiences: { heading: "Let's design the moments your guests will never forget.",               altHeading: "Your guest experience plan is ready.",       subtext: "Four short sessions. About ten minutes total.",       totalMinutes: 10 },
};

// Additional journeys keyed by `<category>:<journey_id>`. Default journeys
// stay in JOURNEY_INTROS above. Add an entry here when a category gains a
// second journey (today: Mehendi Logistics).
export const EXTRA_JOURNEY_INTROS: Record<ExtraJourneyKey, JourneyIntro> = {
  "mehendi:logistics": {
    heading: "Now let's plan how the day actually runs.",
    altHeading: "Your mehendi day is planned.",
    subtext: "Three short sessions. About eight minutes total.",
    totalMinutes: 8,
    unlocksAtMonthsBeforeEvent: 4,
  },
  // Build journey for the Officiant workspace. Unlocks once a vendor in the
  // priest category has been hearted (vendor_shortlisted) — see
  // lib/guided-journeys/unlock-rules.ts for the gate definitions.
  "priest:build": {
    heading: "Now let's build the ceremony with your pandit.",
    altHeading: "Your ceremony is built.",
    subtext: "Four short sessions. About fifteen minutes total.",
    totalMinutes: 15,
  },
  // Selection journey for Cake & Sweets. Vision (the 3-session default
  // journey) covers direction, moodboard, and the dessert brief. Selection
  // is operational — picks the actual cake spec, mithai catalog reactions,
  // dessert tables, and per-event service plan. Time-gated to 6 months
  // before the wedding so couples have a chance to lock in vision first.
  "cake_sweets:selection": {
    heading: "Now let's pick the actual desserts.",
    altHeading: "Your dessert program is built.",
    subtext: "Four short sessions. About fourteen minutes total.",
    totalMinutes: 14,
    unlocksAtMonthsBeforeEvent: 6,
  },
  // Build journey for the Wardrobe workspace. Vision (the 3-session default
  // journey on Tab 1) covers style direction, palettes, moodboard and the
  // brief. Build is operational — outfit matrix, family palettes, delivery
  // & documents. Soft time-gate at 6 months out: couture Indian wedding
  // wear genuinely needs 4–6 months of designer lead time, so earlier is
  // muted (still clickable) with a soft nudge tooltip.
  "wardrobe:build": {
    heading: "Now let's plan every outfit, person by person.",
    altHeading: "Your wardrobe is planned.",
    subtext: "Three short sessions. About twelve minutes total.",
    totalMinutes: 12,
    unlocksAtMonthsBeforeEvent: 6,
  },
  // Build journey for the Jewelry workspace. Vision (the 3-session default
  // journey on Tab 1) covers style direction, moodboard, and the jewelry
  // brief. Build is operational — bridal inventory, groom inventory,
  // family heirlooms (with strict privacy controls), and day-of custody.
  // Time-gated to 6 months out: custom kundan and polki sets need 8–12
  // weeks plus shipping — earlier than that and you don't know what to
  // commission yet.
  "jewelry:build": {
    heading: "Now let's track every piece, person by person, story by story.",
    altHeading: "Your jewelry is tracked, paired, and protected.",
    subtext: "Four short sessions. About fifteen minutes total.",
    totalMinutes: 15,
    unlocksAtMonthsBeforeEvent: 6,
  },
  // Build journey for the Gifting workspace. Vision (the 3-session default
  // journey on Tab 1) covers style direction, budget anchors, ideas
  // browser, and the brief. Build is operational — welcome bag inventory,
  // trousseau packaging, return favors, family exchanges. Time-gated to 5
  // months out (raised from 4 in the cross-category refinement pass to
  // match return-favor production cycles): trousseau packaging from India
  // needs 60–90 days, custom welcome-bag items need ~60 days, and return
  // favors typically need 90–120 days for any custom production.
  "gifting:build": {
    heading: "Now let's build the inventory — every bag, every box, every favor.",
    altHeading: "Your gifting plan is built.",
    subtext: "Four short sessions. About fifteen minutes total.",
    totalMinutes: 15,
    unlocksAtMonthsBeforeEvent: 5,
  },
  // Build journey for Travel & Accommodations. Vision (the 3-session
  // default journey on Tab 1) covers strategy: guest math, proximity,
  // block strategy, budget approach. Build is operational — block-level
  // negotiation tracking with attrition floors and cutoff dates, plus
  // guest-level arrival tracking with cluster pickup rosters that share
  // back to Transportation. Time-gated to 6 months out: premium hotel
  // blocks need 6–9 months to negotiate, and attrition terms must be
  // locked before the contract is signed.
  "travel:build": {
    heading: "Now let's lock the blocks and track who's coming from where.",
    altHeading: "Your travel plan is locked.",
    subtext: "Two short sessions. About eleven minutes total.",
    totalMinutes: 11,
    unlocksAtMonthsBeforeEvent: 6,
  },
  // Build journey for the Transportation workspace. Vision (the 2-session
  // default journey) covers intent — what kinds of transport, what vibe,
  // what the baraat should feel like. Build is operational — the baraat
  // walkthrough (route, road permits, dhol timing, ready-by clocks),
  // shuttle/airport math (concrete depart/arrive times, pax counts,
  // pickup-window auto-grouping), and the fleet roster (every vehicle,
  // every driver, vendor parking). Time-gated to 4 months out: police
  // escort permits, premium horse vendors, and shuttle contracts typically
  // need 60–90 days — earlier than that and you don't know your final
  // guest count yet.
  "transportation:build": {
    heading: "Now let's lock the routes, times, and vehicles.",
    altHeading: "Your transport plan is locked.",
    subtext: "Three short sessions. About fourteen minutes total.",
    totalMinutes: 14,
    unlocksAtMonthsBeforeEvent: 4,
  },
};
