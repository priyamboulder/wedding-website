// ── Guest Experiences — experience card catalog ─────────────────────────────
// Config data for the Experience Explorer. Each card describes one bookable
// experiential extra a couple might add to their wedding. Cards are grouped
// by category and carry cultural tags so South Asian staples (dhol, paan
// cart) surface alongside universal options.
//
// This file is intentionally flat data — no code-side behavior — so the
// catalog can grow without touching the workspace UI. Same philosophy as
// the rest of the platform.

import type { WeddingEvent } from "@/types/workspace";

// Sparkler exits happen *after* Reception; we map them to "reception" since
// the workspace event chip row aligns with the Events module. After-party is
// rendered alongside reception for the Experience Map chip row.
export type ExperienceEvent =
  | WeddingEvent
  | "after_party"
  | "cocktail_hour";

export type EnergyFit = "low" | "medium" | "high";

export type ExperienceCategory =
  | "arrivals"
  | "photo_capture"
  | "live_artists"
  | "food_drink"
  | "keepsakes"
  | "wow_moments"
  | "games";

export interface ExperienceCardDef {
  id: string;
  category: ExperienceCategory;
  name: string;
  description: string;
  image_url: string;
  // Rupee ranges — mid-market India pricing. Planners can override at the
  // shortlist level.
  price_low: number;
  price_high: number;
  suggested_events: ExperienceEvent[];
  cultural_tags: ("south_asian" | "universal" | "modern" | "classic")[];
  energy_fit: EnergyFit[];
}

export interface ExperienceCategoryDef {
  id: ExperienceCategory;
  label: string;
  blurb: string;
}

export const EXPERIENCE_CATEGORIES: ExperienceCategoryDef[] = [
  {
    id: "arrivals",
    label: "Arrivals & Entrances",
    blurb: "The first thing guests see — set the tone before a word is spoken.",
  },
  {
    id: "photo_capture",
    label: "Photo & Capture Stations",
    blurb: "Interactive ways guests make memories — and share them.",
  },
  {
    id: "live_artists",
    label: "Live Artists & Performers",
    blurb: "Humans creating something on the spot. Talk-of-the-night material.",
  },
  {
    id: "food_drink",
    label: "Interactive Food & Drink Stations",
    blurb:
      "Experiential stations — the spectacle, not the meal. (Catering handles the meal itself.)",
  },
  {
    id: "keepsakes",
    label: "Keepsakes & Favors",
    blurb: "What they take home. Thoughtful > generic.",
  },
  {
    id: "wow_moments",
    label: "Wow Moments & Spectacles",
    blurb: "The big, visible, memory-burning moments of the night.",
  },
  {
    id: "games",
    label: "Games & Activities",
    blurb: "Guests playing together. Low-pressure, high-delight.",
  },
];

// Unsplash stock images used as placeholders. Swap to curated assets later.
const img = (id: string, seed: string) =>
  `https://images.unsplash.com/photo-${seed}?w=560&q=70&auto=format&fit=crop`;

export const EXPERIENCE_CATALOG: ExperienceCardDef[] = [
  // ── Arrivals & Entrances ────────────────────────────────────────────────
  {
    id: "arr-horse-baraat",
    category: "arrivals",
    name: "Horse & baraat procession",
    description: "Groom on horseback, dhol, the whole family dancing down the street.",
    image_url: img("horse-baraat", "1617854818583-09e7f077a156"),
    price_low: 35000,
    price_high: 150000,
    suggested_events: ["wedding"],
    cultural_tags: ["south_asian", "classic"],
    energy_fit: ["high"],
  },
  {
    id: "arr-vintage-car",
    category: "arrivals",
    name: "Vintage / classic car arrival",
    description: "A 60s Cadillac, a 70s Ambassador — whatever matches your aesthetic.",
    image_url: img("vintage-car", "1502877338535-766e1452684a"),
    price_low: 25000,
    price_high: 200000,
    suggested_events: ["wedding", "reception"],
    cultural_tags: ["universal", "classic"],
    energy_fit: ["medium"],
  },
  {
    id: "arr-luxury-car",
    category: "arrivals",
    name: "Luxury car arrival",
    description: "Rolls Royce, Bentley, Mercedes S-Class — the glossy red-carpet moment.",
    image_url: img("luxury-car", "1555215695-3004980ad54e"),
    price_low: 75000,
    price_high: 350000,
    suggested_events: ["reception", "wedding"],
    cultural_tags: ["universal", "modern"],
    energy_fit: ["medium", "high"],
  },
  {
    id: "arr-decorated-cart",
    category: "arrivals",
    name: "Decorated golf cart / auto-rickshaw",
    description:
      "A floral-draped rickshaw or a themed golf cart — playful, memorable, Instagrammable.",
    image_url: img("rickshaw", "1558036117-15d82a90b9b1"),
    price_low: 15000,
    price_high: 60000,
    suggested_events: ["sangeet", "mehendi", "haldi"],
    cultural_tags: ["south_asian", "modern"],
    energy_fit: ["medium", "high"],
  },
  {
    id: "arr-dhol-players",
    category: "arrivals",
    name: "Dhol players at entrance",
    description: "2–4 dhol players drumming guests into the venue. Impossible not to dance.",
    image_url: img("dhol", "1514525253161-7a46d19cd819"),
    price_low: 20000,
    price_high: 60000,
    suggested_events: ["sangeet", "wedding", "mehendi"],
    cultural_tags: ["south_asian", "classic"],
    energy_fit: ["high"],
  },
  {
    id: "arr-petal-entrance",
    category: "arrivals",
    name: "Flower petal / confetti entrance",
    description: "Guests walk under a rain of rose petals or biodegradable confetti.",
    image_url: img("petal-entrance", "1519741497674-611481863552"),
    price_low: 12000,
    price_high: 45000,
    suggested_events: ["wedding", "reception"],
    cultural_tags: ["universal"],
    energy_fit: ["medium"],
  },
  {
    id: "arr-smoke-effect",
    category: "arrivals",
    name: "Smoke / fog entrance effect",
    description: "Low-lying cold fog for a cinematic walk-in. Indoor-safe with the right kit.",
    image_url: img("smoke", "1506794778202-cad84cf45f1d"),
    price_low: 18000,
    price_high: 60000,
    suggested_events: ["sangeet", "reception"],
    cultural_tags: ["modern"],
    energy_fit: ["medium", "high"],
  },
  {
    id: "arr-welcome-arch",
    category: "arrivals",
    name: "Custom welcome arch or tunnel",
    description: "A floral, fabric, or illuminated tunnel that turns the first 20 steps into theatre.",
    image_url: img("arch", "1519741497674-611481863552"),
    price_low: 40000,
    price_high: 250000,
    suggested_events: ["wedding", "reception", "sangeet"],
    cultural_tags: ["universal"],
    energy_fit: ["medium"],
  },

  // ── Photo & Capture Stations ────────────────────────────────────────────
  {
    id: "pc-classic-booth",
    category: "photo_capture",
    name: "Traditional photo booth",
    description: "Props, backdrop, instant prints. The reliable crowd-pleaser.",
    image_url: img("photo-booth", "1511795409834-ef04bbd61622"),
    price_low: 25000,
    price_high: 75000,
    suggested_events: ["sangeet", "reception", "mehendi"],
    cultural_tags: ["universal", "classic"],
    energy_fit: ["medium", "high"],
  },
  {
    id: "pc-360-booth",
    category: "photo_capture",
    name: "360° photo / video booth",
    description: "Slow-mo videos your guests will post immediately. The new social staple.",
    image_url: img("360-booth", "1492684223066-81342ee5ff30"),
    price_low: 40000,
    price_high: 120000,
    suggested_events: ["sangeet", "reception", "after_party"],
    cultural_tags: ["modern"],
    energy_fit: ["high"],
  },
  {
    id: "pc-ai-photo",
    category: "photo_capture",
    name: "AI photo station",
    description: "Style-transfer portraits, avatars, themed backdrops — all AI-generated on the spot.",
    image_url: img("ai-photo", "1488229297570-58520851e868"),
    price_low: 35000,
    price_high: 120000,
    suggested_events: ["sangeet", "reception"],
    cultural_tags: ["modern"],
    energy_fit: ["high"],
  },
  {
    id: "pc-polaroid",
    category: "photo_capture",
    name: "Polaroid / instant-print station",
    description: "Guests grab a polaroid and leave it in the guestbook. Low-fi, high-charm.",
    image_url: img("polaroid", "1510915361894-db8b7ffd8ec6"),
    price_low: 15000,
    price_high: 50000,
    suggested_events: ["mehendi", "sangeet", "reception"],
    cultural_tags: ["universal"],
    energy_fit: ["low", "medium"],
  },
  {
    id: "pc-gif-booth",
    category: "photo_capture",
    name: "GIF booth",
    description: "A 3-second animated loop guests text to themselves. More fun than stills.",
    image_url: img("gif-booth", "1465225314224-587cd83d322b"),
    price_low: 25000,
    price_high: 70000,
    suggested_events: ["sangeet", "reception"],
    cultural_tags: ["modern"],
    energy_fit: ["medium", "high"],
  },
  {
    id: "pc-green-screen",
    category: "photo_capture",
    name: "Green screen booth",
    description: "Custom backgrounds — put guests in front of the Taj, a palace, a Bollywood set.",
    image_url: img("green-screen", "1492684223066-81342ee5ff30"),
    price_low: 30000,
    price_high: 80000,
    suggested_events: ["sangeet", "reception"],
    cultural_tags: ["modern"],
    energy_fit: ["medium"],
  },
  {
    id: "pc-slowmo",
    category: "photo_capture",
    name: "Slow-motion video booth",
    description: "Confetti toss, champagne pour, dramatic hair flip — all in buttery slow-mo.",
    image_url: img("slowmo", "1496024840928-4c417adf211d"),
    price_low: 35000,
    price_high: 85000,
    suggested_events: ["sangeet", "reception", "after_party"],
    cultural_tags: ["modern"],
    energy_fit: ["high"],
  },
  {
    id: "pc-video-wishes",
    category: "photo_capture",
    name: "Guest video message booth",
    description: "Record 30-second wishes for the couple. Stitched into a highlight reel later.",
    image_url: img("video-wishes", "1485846234645-a62644f84728"),
    price_low: 20000,
    price_high: 60000,
    suggested_events: ["mehendi", "sangeet", "reception"],
    cultural_tags: ["universal"],
    energy_fit: ["low", "medium"],
  },

  // ── Live Artists & Performers ───────────────────────────────────────────
  {
    id: "art-caricature",
    category: "live_artists",
    name: "Caricature artist",
    description: "Guests line up, walk away 8 minutes later with a framed caricature of themselves.",
    image_url: img("caricature", "1513364776144-60967b0f800f"),
    price_low: 15000,
    price_high: 45000,
    suggested_events: ["sangeet", "mehendi", "reception"],
    cultural_tags: ["universal"],
    energy_fit: ["low", "medium"],
  },
  {
    id: "art-live-painter",
    category: "live_artists",
    name: "Live painter",
    description: "Captures a scene — the pheras, the first dance — in oil during the event. Hangs on your wall forever.",
    image_url: img("live-painter", "1513364776144-60967b0f800f"),
    price_low: 60000,
    price_high: 250000,
    suggested_events: ["wedding", "reception"],
    cultural_tags: ["universal", "modern"],
    energy_fit: ["low", "medium"],
  },
  {
    id: "art-henna-popup",
    category: "live_artists",
    name: "Henna pop-up station",
    description: "Quick designs for guests — not the bridal mehendi, but a fun favor-like touch.",
    image_url: img("henna", "1609205807107-454f1c4f7269"),
    price_low: 15000,
    price_high: 50000,
    suggested_events: ["mehendi", "sangeet", "haldi"],
    cultural_tags: ["south_asian"],
    energy_fit: ["low", "medium"],
  },
  {
    id: "art-calligrapher",
    category: "live_artists",
    name: "Calligrapher",
    description: "Personalizes place cards, envelopes, favor tags on-site. Pure elegance.",
    image_url: img("calligrapher", "1524062950755-212926a86a7e"),
    price_low: 20000,
    price_high: 70000,
    suggested_events: ["reception", "wedding"],
    cultural_tags: ["universal", "classic"],
    energy_fit: ["low"],
  },
  {
    id: "art-silhouette",
    category: "live_artists",
    name: "Silhouette artist",
    description: "Cuts a paper silhouette of each guest in 90 seconds. Charming throwback.",
    image_url: img("silhouette", "1506905925346-21bda4d32df4"),
    price_low: 18000,
    price_high: 55000,
    suggested_events: ["mehendi", "sangeet"],
    cultural_tags: ["classic"],
    energy_fit: ["low"],
  },
  {
    id: "art-portrait-sketch",
    category: "live_artists",
    name: "Portrait sketch artist",
    description: "A more serious live portrait — guests take home framed charcoal or ink sketches.",
    image_url: img("portrait", "1513364776144-60967b0f800f"),
    price_low: 25000,
    price_high: 80000,
    suggested_events: ["reception", "mehendi"],
    cultural_tags: ["universal", "classic"],
    energy_fit: ["low"],
  },

  // ── Interactive Food & Drink Stations ───────────────────────────────────
  {
    id: "fd-paan-cart",
    category: "food_drink",
    name: "Paan cart / station",
    description: "The after-dinner classic. A paanwalla making fresh meetha + sweet paan on demand.",
    image_url: img("paan", "1596040033229-a9821ebd058d"),
    price_low: 20000,
    price_high: 60000,
    suggested_events: ["wedding", "reception", "sangeet"],
    cultural_tags: ["south_asian", "classic"],
    energy_fit: ["medium"],
  },
  {
    id: "fd-chai-wallah",
    category: "food_drink",
    name: "Chai wallah / live chai station",
    description: "A kulhad chai vendor pulling fresh cutting chai. Morning event magic.",
    image_url: img("chai", "1571934811356-5cc061b6821f"),
    price_low: 15000,
    price_high: 45000,
    suggested_events: ["haldi", "mehendi"],
    cultural_tags: ["south_asian", "classic"],
    energy_fit: ["low", "medium"],
  },
  {
    id: "fd-chaat-cart",
    category: "food_drink",
    name: "Chaat cart",
    description: "Live pani puri, bhel, dahi puri. Pulls a crowd every single time.",
    image_url: img("chaat", "1606491956689-2ea866880c84"),
    price_low: 25000,
    price_high: 80000,
    suggested_events: ["sangeet", "mehendi", "cocktail_hour"],
    cultural_tags: ["south_asian", "classic"],
    energy_fit: ["medium", "high"],
  },
  {
    id: "fd-dosa-station",
    category: "food_drink",
    name: "Dosa station",
    description: "Fresh dosas off a tawa — masala, mysore, paneer. The South Indian crowd favorite.",
    image_url: img("dosa", "1630383249896-424e482df921"),
    price_low: 25000,
    price_high: 75000,
    suggested_events: ["sangeet", "reception"],
    cultural_tags: ["south_asian"],
    energy_fit: ["medium"],
  },
  {
    id: "fd-mixologist",
    category: "food_drink",
    name: "Live cocktail / mocktail mixologist",
    description: "A mixologist shaking custom drinks — signature cocktail for each event.",
    image_url: img("mixologist", "1551024709-8f23befc6f87"),
    price_low: 40000,
    price_high: 150000,
    suggested_events: ["cocktail_hour", "reception", "sangeet"],
    cultural_tags: ["universal", "modern"],
    energy_fit: ["medium", "high"],
  },
  {
    id: "fd-rolled-icecream",
    category: "food_drink",
    name: "Rolled ice cream station",
    description: "Thai-style rolled ice cream made live on cold plates. Kids and adults both obsessed.",
    image_url: img("rolled-icecream", "1563805042-7684c019e1cb"),
    price_low: 25000,
    price_high: 70000,
    suggested_events: ["sangeet", "reception", "mehendi"],
    cultural_tags: ["modern"],
    energy_fit: ["medium"],
  },
  {
    id: "fd-cotton-candy",
    category: "food_drink",
    name: "Cotton candy / candy floss artist",
    description: "Oversized whimsical spun sugar in your palette. Surprisingly gorgeous photos.",
    image_url: img("cotton-candy", "1551024601-bec78aea704b"),
    price_low: 15000,
    price_high: 45000,
    suggested_events: ["sangeet", "reception", "after_party"],
    cultural_tags: ["universal", "modern"],
    energy_fit: ["medium", "high"],
  },
  {
    id: "fd-espresso-bar",
    category: "food_drink",
    name: "Espresso / coffee bar",
    description: "A trained barista with a portable machine — perfect for morning or late-night events.",
    image_url: img("espresso", "1495474472287-4d71bcdd2085"),
    price_low: 25000,
    price_high: 80000,
    suggested_events: ["haldi", "mehendi", "after_party"],
    cultural_tags: ["universal", "modern"],
    energy_fit: ["low", "medium"],
  },
  {
    id: "fd-gelato-cart",
    category: "food_drink",
    name: "Gelato cart",
    description: "Italian gelato in custom flavors — rose-pistachio, mango-cardamom, the works.",
    image_url: img("gelato", "1560008581-09826d1de69e"),
    price_low: 20000,
    price_high: 65000,
    suggested_events: ["sangeet", "reception"],
    cultural_tags: ["universal", "modern"],
    energy_fit: ["medium"],
  },
  {
    id: "fd-lemonade-bar",
    category: "food_drink",
    name: "Custom lemonade / juice bar",
    description: "Fresh-squeezed daytime drinks — jaljeera, aam panna, hibiscus lemonade.",
    image_url: img("lemonade", "1556679343-c7306c1976bc"),
    price_low: 15000,
    price_high: 45000,
    suggested_events: ["haldi", "mehendi"],
    cultural_tags: ["south_asian", "universal"],
    energy_fit: ["low", "medium"],
  },

  // ── Keepsakes & Favors ──────────────────────────────────────────────────
  {
    id: "kp-tote-bags",
    category: "keepsakes",
    name: "Custom tote bags",
    description: "Monogrammed tote bags — guests use them long after the wedding. Great value keepsake.",
    image_url: img("totes", "1553062407-98eeb64c6a62"),
    price_low: 15000,
    price_high: 80000,
    suggested_events: ["wedding", "reception"],
    cultural_tags: ["universal"],
    energy_fit: ["low"],
  },
  {
    id: "kp-welcome-boxes",
    category: "keepsakes",
    name: "Welcome boxes / gift bags",
    description: "Hotel-drop welcome kits — local snacks, water, itinerary, hangover essentials.",
    image_url: img("welcome-box", "1549465220-1a8b9238cd48"),
    price_low: 40000,
    price_high: 300000,
    suggested_events: ["wedding"],
    cultural_tags: ["universal", "classic"],
    energy_fit: ["low"],
  },
  {
    id: "kp-koozies",
    category: "keepsakes",
    name: "Personalized koozies / drinkware",
    description: "Monogrammed koozies, tumblers, or wine glasses — functional souvenir.",
    image_url: img("koozies", "1513558161293-cdaf765ed2fd"),
    price_low: 10000,
    price_high: 40000,
    suggested_events: ["sangeet", "reception", "after_party"],
    cultural_tags: ["universal", "modern"],
    energy_fit: ["low"],
  },
  {
    id: "kp-candles",
    category: "keepsakes",
    name: "Custom candles or diffusers",
    description: "Wedding-scent custom candles — guests light them at home and time-travel.",
    image_url: img("candles", "1602874801006-ccf92c3a8f03"),
    price_low: 20000,
    price_high: 100000,
    suggested_events: ["reception", "wedding"],
    cultural_tags: ["universal", "modern"],
    energy_fit: ["low"],
  },
  {
    id: "kp-seed-packets",
    category: "keepsakes",
    name: "Seed packets / plantable favors",
    description: "Marigold or basil seed packets — grow something from your wedding. Eco-friendly.",
    image_url: img("seeds", "1523348837708-15d4a09cfac2"),
    price_low: 8000,
    price_high: 30000,
    suggested_events: ["wedding", "haldi"],
    cultural_tags: ["universal", "modern"],
    energy_fit: ["low"],
  },
  {
    id: "kp-mini-bottles",
    category: "keepsakes",
    name: "Mini bottles (hot sauce, honey, olive oil)",
    description: "A pantry-worthy favor — custom-labeled small-batch goods from a local maker.",
    image_url: img("mini-bottles", "1600880292089-90a7e086ee0c"),
    price_low: 15000,
    price_high: 70000,
    suggested_events: ["wedding", "reception"],
    cultural_tags: ["universal"],
    energy_fit: ["low"],
  },
  {
    id: "kp-edible-favors",
    category: "keepsakes",
    name: "Edible favors (macarons, chocolates, cookies)",
    description: "Custom-printed edible favors — monogrammed macarons are a modern classic.",
    image_url: img("macarons", "1558326567-98166e232c84"),
    price_low: 20000,
    price_high: 150000,
    suggested_events: ["wedding", "reception"],
    cultural_tags: ["universal", "modern"],
    energy_fit: ["low"],
  },
  {
    id: "kp-photo-magnets",
    category: "keepsakes",
    name: "Photo magnets / keychains from the event",
    description: "Printed live on-site — guests walk out with a magnet of themselves from tonight.",
    image_url: img("magnets", "1511795409834-ef04bbd61622"),
    price_low: 18000,
    price_high: 55000,
    suggested_events: ["sangeet", "reception"],
    cultural_tags: ["modern"],
    energy_fit: ["medium"],
  },

  // ── Wow Moments & Spectacles ────────────────────────────────────────────
  {
    id: "wow-sparkler-exit",
    category: "wow_moments",
    name: "Sparkler exit / send-off",
    description: "The couple walks out through two rows of guests holding sparklers. Cinema energy.",
    image_url: img("sparklers", "1519741497674-611481863552"),
    price_low: 10000,
    price_high: 35000,
    suggested_events: ["reception", "wedding"],
    cultural_tags: ["universal", "classic"],
    energy_fit: ["high"],
  },
  {
    id: "wow-fireworks",
    category: "wow_moments",
    name: "Fireworks display",
    description: "A short aerial fireworks show. Requires permits + venue approval.",
    image_url: img("fireworks", "1530103862676-de8c9debad1d"),
    price_low: 75000,
    price_high: 500000,
    suggested_events: ["sangeet", "reception", "wedding"],
    cultural_tags: ["universal", "classic"],
    energy_fit: ["high"],
  },
  {
    id: "wow-cold-sparks",
    category: "wow_moments",
    name: "Cold spark machines (indoor-safe)",
    description: "Fountain sparks for the first dance or grand entrance — zero heat, venue-safe.",
    image_url: img("cold-sparks", "1533174072545-7a4b6ad7a6c3"),
    price_low: 20000,
    price_high: 80000,
    suggested_events: ["sangeet", "reception"],
    cultural_tags: ["modern"],
    energy_fit: ["high"],
  },
  {
    id: "wow-confetti-cannon",
    category: "wow_moments",
    name: "Confetti cannon",
    description: "A massive metallic confetti blast at the drop of the first dance.",
    image_url: img("confetti", "1530047139879-22d0d71d7ac7"),
    price_low: 15000,
    price_high: 50000,
    suggested_events: ["sangeet", "reception", "after_party"],
    cultural_tags: ["modern"],
    energy_fit: ["high"],
  },
  {
    id: "wow-drone-show",
    category: "wow_moments",
    name: "Drone light show",
    description: "Hundreds of drones forming shapes in the sky — your names, your monogram. New-era spectacle.",
    image_url: img("drones", "1527977966376-1c8408f9f108"),
    price_low: 400000,
    price_high: 2000000,
    suggested_events: ["reception", "sangeet"],
    cultural_tags: ["modern"],
    energy_fit: ["high"],
  },
  {
    id: "wow-lantern-release",
    category: "wow_moments",
    name: "Lantern release",
    description: "Paper sky lanterns released together — quiet, collective, beautiful. Check local regulations.",
    image_url: img("lanterns", "1502810190503-8303352d0dd1"),
    price_low: 12000,
    price_high: 45000,
    suggested_events: ["sangeet", "reception"],
    cultural_tags: ["universal", "classic"],
    energy_fit: ["medium"],
  },
  {
    id: "wow-flash-mob",
    category: "wow_moments",
    name: "Flash mob / surprise dance",
    description: "A choreographed surprise dance from family or friends. Requires 6+ weeks of rehearsal.",
    image_url: img("flash-mob", "1514525253161-7a46d19cd819"),
    price_low: 25000,
    price_high: 120000,
    suggested_events: ["sangeet", "reception"],
    cultural_tags: ["south_asian", "modern"],
    energy_fit: ["high"],
  },
  {
    id: "wow-neon-sign",
    category: "wow_moments",
    name: "Custom neon sign",
    description: "Couple's names, hashtag, or a favorite line — the selfie magnet of the night.",
    image_url: img("neon", "1514525253161-7a46d19cd819"),
    price_low: 15000,
    price_high: 80000,
    suggested_events: ["sangeet", "reception"],
    cultural_tags: ["modern"],
    energy_fit: ["medium", "high"],
  },
  {
    id: "wow-projection",
    category: "wow_moments",
    name: "Projection mapping",
    description: "Turn a blank wall or the mandap itself into a changing visual story.",
    image_url: img("projection", "1506794778202-cad84cf45f1d"),
    price_low: 100000,
    price_high: 800000,
    suggested_events: ["sangeet", "reception", "wedding"],
    cultural_tags: ["modern"],
    energy_fit: ["medium", "high"],
  },
  {
    id: "wow-laser-show",
    category: "wow_moments",
    name: "Laser show",
    description: "Laser arrays synced to the dance floor beats. Turns the party into a mini-festival.",
    image_url: img("lasers", "1508700115892-45ecd05ae2ad"),
    price_low: 60000,
    price_high: 300000,
    suggested_events: ["sangeet", "after_party", "reception"],
    cultural_tags: ["modern"],
    energy_fit: ["high"],
  },

  // ── Games & Activities ──────────────────────────────────────────────────
  {
    id: "gm-lawn-games",
    category: "games",
    name: "Lawn games (cornhole, giant Jenga, croquet)",
    description: "Outdoor low-pressure games for cocktail hour — gets guests mingling.",
    image_url: img("lawn-games", "1528818955841-a7f1425131b5"),
    price_low: 15000,
    price_high: 50000,
    suggested_events: ["cocktail_hour", "haldi", "mehendi"],
    cultural_tags: ["universal"],
    energy_fit: ["low", "medium"],
  },
  {
    id: "gm-casino-tables",
    category: "games",
    name: "Casino tables",
    description: "Blackjack + roulette with a pro dealer. Play money for fun, winner takes a prize.",
    image_url: img("casino", "1511193311914-0346f16efe90"),
    price_low: 40000,
    price_high: 150000,
    suggested_events: ["sangeet", "cocktail_hour", "after_party"],
    cultural_tags: ["universal", "modern"],
    energy_fit: ["medium", "high"],
  },
  {
    id: "gm-trivia",
    category: "games",
    name: "Trivia about the couple",
    description: "How did they meet? What's her coffee order? Printed cards on tables or live MC format.",
    image_url: img("trivia", "1522071820081-009f0129c71c"),
    price_low: 5000,
    price_high: 30000,
    suggested_events: ["sangeet", "reception", "mehendi"],
    cultural_tags: ["universal", "modern"],
    energy_fit: ["medium"],
  },
  {
    id: "gm-dance-off",
    category: "games",
    name: "Dance-off / dance competition",
    description: "Family vs family, friends vs friends. Judges from the couple. Trophy for the winning side.",
    image_url: img("dance-off", "1514525253161-7a46d19cd819"),
    price_low: 0,
    price_high: 25000,
    suggested_events: ["sangeet"],
    cultural_tags: ["south_asian"],
    energy_fit: ["high"],
  },
  {
    id: "gm-shoe-game",
    category: "games",
    name: "Shoe game",
    description: "Couple answers 'who's more likely to…' questions with shoes. The MC classic.",
    image_url: img("shoe-game", "1525385133512-2f3bdd039054"),
    price_low: 0,
    price_high: 15000,
    suggested_events: ["reception", "sangeet"],
    cultural_tags: ["universal", "modern"],
    energy_fit: ["medium"],
  },
  {
    id: "gm-advice-cards",
    category: "games",
    name: "Advice cards / guestbook alternatives",
    description: "Printed prompt cards — 'advice for year one', 'a prediction for year five'.",
    image_url: img("advice-cards", "1606046604972-77cc76aee944"),
    price_low: 5000,
    price_high: 25000,
    suggested_events: ["wedding", "reception", "mehendi"],
    cultural_tags: ["universal", "modern"],
    energy_fit: ["low"],
  },
  {
    id: "gm-wishing-tree",
    category: "games",
    name: "Wishing tree / message wall",
    description: "Guests pin handwritten wishes to a decorated tree or wall. Keepsake for the mantel.",
    image_url: img("wishing-tree", "1514222709107-a180c68d72b4"),
    price_low: 15000,
    price_high: 60000,
    suggested_events: ["wedding", "reception", "mehendi"],
    cultural_tags: ["universal"],
    energy_fit: ["low"],
  },
  {
    id: "gm-time-capsule",
    category: "games",
    name: "Time capsule station",
    description: "Guests drop notes to open on a future anniversary. Sealed ceremoniously at night's end.",
    image_url: img("time-capsule", "1606046604972-77cc76aee944"),
    price_low: 8000,
    price_high: 30000,
    suggested_events: ["wedding", "reception"],
    cultural_tags: ["universal", "modern"],
    energy_fit: ["low"],
  },
];

// ── Event chip rail for Experience Map tab ─────────────────────────────────

export interface ExperienceEventChip {
  id: ExperienceEvent;
  label: string;
}

export const EXPERIENCE_EVENT_CHIPS: ExperienceEventChip[] = [
  { id: "haldi", label: "Haldi" },
  { id: "mehendi", label: "Mehendi" },
  { id: "sangeet", label: "Sangeet" },
  { id: "cocktail_hour", label: "Cocktail hour" },
  { id: "wedding", label: "Wedding" },
  { id: "reception", label: "Reception" },
  { id: "after_party", label: "After-party" },
];

export function getCategoryDef(id: ExperienceCategory): ExperienceCategoryDef {
  return EXPERIENCE_CATEGORIES.find((c) => c.id === id)!;
}

export function getCardById(id: string): ExperienceCardDef | undefined {
  return EXPERIENCE_CATALOG.find((c) => c.id === id);
}

export function totalCatalogSize(): number {
  return EXPERIENCE_CATALOG.length;
}

// Inspiration tab reference gallery — one curated image per event chip,
// showing an experience-in-action for that event's vibe.
export const INSPIRATION_GALLERY: {
  event: ExperienceEvent;
  refs: { id: string; label: string; image_url: string }[];
}[] = [
  {
    event: "haldi",
    refs: [
      { id: "insp-haldi-01", label: "Chai wallah at morning haldi", image_url: img("i1", "1571934811356-5cc061b6821f") },
      { id: "insp-haldi-02", label: "Seed-packet favors in the sun", image_url: img("i2", "1523348837708-15d4a09cfac2") },
    ],
  },
  {
    event: "mehendi",
    refs: [
      { id: "insp-meh-01", label: "Henna pop-up for guests", image_url: img("i3", "1609205807107-454f1c4f7269") },
      { id: "insp-meh-02", label: "Chaat cart in the courtyard", image_url: img("i4", "1606491956689-2ea866880c84") },
    ],
  },
  {
    event: "sangeet",
    refs: [
      { id: "insp-sang-01", label: "360° booth in action", image_url: img("i5", "1492684223066-81342ee5ff30") },
      { id: "insp-sang-02", label: "Dance floor with cold sparks", image_url: img("i6", "1533174072545-7a4b6ad7a6c3") },
      { id: "insp-sang-03", label: "Custom neon sign selfie wall", image_url: img("i7", "1514525253161-7a46d19cd819") },
    ],
  },
  {
    event: "cocktail_hour",
    refs: [
      { id: "insp-ch-01", label: "Live mixologist at the bar", image_url: img("i8", "1551024709-8f23befc6f87") },
      { id: "insp-ch-02", label: "Lawn games on the terrace", image_url: img("i9", "1528818955841-a7f1425131b5") },
    ],
  },
  {
    event: "wedding",
    refs: [
      { id: "insp-wed-01", label: "Horse baraat procession", image_url: img("i10", "1617854818583-09e7f077a156") },
      { id: "insp-wed-02", label: "Live painter at the mandap", image_url: img("i11", "1513364776144-60967b0f800f") },
    ],
  },
  {
    event: "reception",
    refs: [
      { id: "insp-rec-01", label: "Sparkler exit line", image_url: img("i12", "1519741497674-611481863552") },
      { id: "insp-rec-02", label: "Drone light show monogram", image_url: img("i13", "1527977966376-1c8408f9f108") },
      { id: "insp-rec-03", label: "Paan cart for guests", image_url: img("i14", "1596040033229-a9821ebd058d") },
    ],
  },
  {
    event: "after_party",
    refs: [
      { id: "insp-ap-01", label: "Espresso bar at 2 AM", image_url: img("i15", "1495474472287-4d71bcdd2085") },
      { id: "insp-ap-02", label: "Laser show after midnight", image_url: img("i16", "1508700115892-45ecd05ae2ad") },
    ],
  },
];
