// ── Marketing data ─────────────────────────────────────────────
// Shared across the public-site pages. Kept as typed literals so
// every page can pull from the same canonical list and new entries
// flow through automatically.

export type CategorySubfilter = {
  label: string;
  options: string[];
};

export type Category = {
  slug: string;
  name: string;
  count: number;
  bg: string;
  fg: string;
  photo?: string;
  tagline: string;
  description: string;
  longDescription?: string;
  subfilters?: CategorySubfilter[];
  related?: string[];
};

export const CATEGORIES: Category[] = [
  {
    slug: "decor-design",
    name: "Decor & Design",
    count: 24,
    bg: "#4A5240",
    fg: "#F0EDE4",
    photo: "/wedding-photos/usa-decor/usa-decor-005.jpg",
    tagline: "Mandaps, florals, and light — shaped to the space.",
    description:
      "Studios who build mandaps like set pieces and compose florals as composition, not clutter.",
    longDescription:
      "The decorators who transform ballrooms into landscapes and mandaps into memories.",
    subfilters: [
      { label: "Style", options: ["Floral-Forward", "Minimalist", "Traditional", "Fusion"] },
      { label: "Setting", options: ["Indoor", "Outdoor", "Temple"] },
    ],
    related: ["catering-dining", "photography"],
  },
  {
    slug: "catering-dining",
    name: "Catering & Dining",
    count: 18,
    bg: "#5C463A",
    fg: "#F0E8DC",
    photo: "/wedding-photos/usa-decor/usa-decor-028.jpg",
    tagline: "Menus composed ceremony by ceremony.",
    description:
      "Regional Indian menus built around each event — dietary notes honored, plating designed.",
    longDescription:
      "The kitchens who write a menu per ceremony — thali at the mehndi, a tasting arc at the reception.",
    subfilters: [
      { label: "Cuisine", options: ["North Indian", "South Indian", "Jain/Satvik", "Fusion"] },
      { label: "Service", options: ["Plated", "Buffet", "Live Stations"] },
    ],
    related: ["decor-design", "entertainment"],
  },
  {
    slug: "photography",
    name: "Photography",
    count: 22,
    bg: "#3A4452",
    fg: "#E8EAF0",
    photo: "/wedding-photos/best/best-04.jpg",
    tagline: "Editorial eyes. Documentary patience.",
    description:
      "Photographers who understand that a portrait and a pheras shot require different languages.",
    longDescription:
      "The photographers who hold two languages at once — the portrait, and the ceremony as it unfolds.",
    subfilters: [
      { label: "Style", options: ["Editorial", "Documentary", "Film", "Traditional"] },
      { label: "Coverage", options: ["Single Day", "Multi-Day", "Album Included"] },
    ],
    related: ["decor-design", "hair-makeup"],
  },
  {
    slug: "mehndi-henna",
    name: "Mehndi & Henna",
    count: 12,
    bg: "#8A5444",
    fg: "#F5EAE0",
    photo: "/wedding-photos/mehndi/mehndi-03.jpg",
    tagline: "Bridal design, guest sittings, aftercare.",
    description:
      "Bridal henna artists whose work reads like ink on silk. Guest sittings included.",
    longDescription:
      "The henna artists whose work reads like ink on silk — bridal design, guest sittings, and aftercare in one booking.",
    subfilters: [
      { label: "Style", options: ["Rajasthani", "Arabic", "Indo-Arabic", "Minimalist"] },
      { label: "Scope", options: ["Bridal Only", "Bridal + Guests"] },
    ],
    related: ["hair-makeup", "stationery"],
  },
  {
    slug: "priests-pandits",
    name: "Priests & Pandits",
    count: 9,
    bg: "#4C4538",
    fg: "#EFE8D8",
    photo: "/wedding-photos/wedding/wedding-06.jpg",
    tagline: "Ceremony scripts, muhurthams, samagri.",
    description:
      "Pandits and priests for every tradition — North, South, Jain, Sikh, interfaith.",
    longDescription:
      "The officiants who write the script and carry the rite — for every tradition, and the ones that braid two.",
    subfilters: [
      { label: "Tradition", options: ["North Indian", "South Indian", "Jain", "Sikh", "Interfaith"] },
      { label: "Language", options: ["Sanskrit", "Hindi", "English", "Bilingual"] },
    ],
    related: ["decor-design", "catering-dining"],
  },
  {
    slug: "hair-makeup",
    name: "Hair & Makeup",
    count: 19,
    bg: "#A37968",
    fg: "#F7EDE5",
    photo: "/wedding-photos/usa-mehndi/usa-mehndi-004.jpg",
    tagline: "Trials, morning-of, touch-up kits.",
    description:
      "Artists who know how bridal makeup needs to breathe across four ceremonies.",
    longDescription:
      "The artists who compose four looks for the same woman across four ceremonies — trials, touch-ups, morning-of.",
    subfilters: [
      { label: "Look", options: ["Bridal Traditional", "Bridal Modern", "Sangeet/Reception", "Natural"] },
      { label: "Service", options: ["Bride Only", "Bride + Family", "Guest Sittings"] },
    ],
    related: ["photography", "mehndi-henna"],
  },
  {
    slug: "entertainment",
    name: "Entertainment",
    count: 15,
    bg: "#6E6354",
    fg: "#F2ECE0",
    photo: "/wedding-photos/sangeet/sangeet-04.jpg",
    tagline: "DJs, dhol, live bands, sangeet cues.",
    description:
      "Sangeet choreographers, baraat dhol, ceremony musicians — curated by tradition and tempo.",
    longDescription:
      "The DJs, dhols, live bands, and sangeet choreographers who carry the tempo from baraat to last dance.",
    subfilters: [
      { label: "Type", options: ["DJ", "Live Band", "Dhol", "Sangeet Choreography"] },
      { label: "Setting", options: ["Baraat", "Sangeet", "Ceremony", "Reception"] },
    ],
    related: ["catering-dining", "photography"],
  },
  {
    slug: "stationery",
    name: "Stationery",
    count: 8,
    bg: "#7A5D4C",
    fg: "#F5ECDE",
    photo: "/wedding-photos/new/new-03.jpg",
    tagline: "Hand-set in India, addressed from home.",
    description:
      "Letterpress, gold-foiled, hand-lettered. Crafted in India. Addressed from the platform.",
    longDescription:
      "The presses and studios that hand-set every card in India, then ship it home for addressing on the platform.",
    subfilters: [
      { label: "Technique", options: ["Letterpress", "Foil", "Hand-Lettered", "Digital"] },
      { label: "Suite", options: ["Invitation Only", "Save-the-Date + Invite", "Full Suite"] },
    ],
    related: ["mehndi-henna", "decor-design"],
  },
  {
    slug: "transportation",
    name: "Transportation",
    count: 11,
    bg: "#3D4A4A",
    fg: "#E4ECEC",
    photo: "/wedding-photos/baraat/baraat-03.jpg",
    tagline: "Shuttles, baraat horses, arrivals.",
    description:
      "Shuttles, vintage cars, baraat horses — logistics without the logistics.",
    longDescription:
      "The fleets and handlers who move 200 guests and still have a white Mercedes waiting for the vidaai.",
    subfilters: [
      { label: "Type", options: ["Shuttles", "Vintage Cars", "Baraat Horses"] },
      { label: "Coverage", options: ["Single Day", "Multi-Day", "Airport Included"] },
    ],
    related: ["entertainment", "priests-pandits"],
  },
];

// NOTE: The legacy `Vendor`, `VENDORS`, and related marketing-site types
// (VendorPackage, VendorReview, VendorStyle, VendorRegion, etc.) used to
// live here. They've been collapsed into the unified vendor model in
// types/vendor-unified.ts + lib/vendor-unified-seed.ts, and the marketplace
// pages now read from stores/vendors-store.ts.


export type StationeryStyle =
  | "Traditional"
  | "Contemporary"
  | "Fusion"
  | "Minimalist";
export type StationeryOccasion =
  | "Engagement"
  | "Sangeet"
  | "Mehndi"
  | "Wedding"
  | "Reception"
  | "Save the Date";
export type StationeryFormat =
  | "Scroll"
  | "Boxed"
  | "Flat Card"
  | "Digital + Print Bundle";

export type StationerySuite = {
  slug: string;
  name: string;
  style: string;
  price: number;
  leadTime: string;
  bg: string;
  card: string;
  accent: string;
  ink: string;
  description: string;
  includes: string[];
  styleCategories: StationeryStyle[];
  occasions: StationeryOccasion[];
  format: StationeryFormat;
  paperStock: string;
  paperDetails: string[];
  views: Array<{ label: string; note: string }>;
  artisan: { name: string; place: string; story: string };
  defaultNames: { one: string; two: string };
  defaultGreeting: string;
};

export const STATIONERY_SUITES: StationerySuite[] = [
  {
    slug: "kanchi",
    name: "Kanchi",
    style: "Letterpress · Silk thread",
    price: 18,
    leadTime: "8 weeks",
    bg: "#EFE8D8",
    card: "#F7F5F0",
    accent: "#B8755D",
    ink: "#1C1917",
    description:
      "A silk-tied letterpress suite, set in Cormorant with a blind-deboss mandap motif. Envelope liner hand-printed in Jaipur.",
    includes: [
      "Invitation card",
      "Events insert",
      "Response card",
      "Silk closure with wax seal",
    ],
    styleCategories: ["Traditional"],
    occasions: ["Wedding", "Reception"],
    format: "Flat Card",
    paperStock: "Crane's Lettra · 220gsm · Fluorescent White",
    paperDetails: [
      "100% cotton, made for letterpress impression",
      "Deckle edge, hand-torn in Jaipur",
      "Hand-dyed raw silk closure in saffron",
      "Poured sealing wax, stamped with your initials",
    ],
    views: [
      { label: "Main card", note: "Mandap motif, blind deboss" },
      { label: "Events insert", note: "Day-by-day ceremony list" },
      { label: "Response card", note: "Pre-addressed return" },
    ],
    artisan: {
      name: "Vandana & the Lotus Press",
      place: "Jaipur, Rajasthan",
      story:
        "Vandana sets type the way her aunt taught her — letter by letter from a wooden case older than most presses. Every Kanchi proof is signed in pencil on the back.",
    },
    defaultNames: { one: "Priya", two: "Aarav" },
    defaultGreeting: "Together with their families",
  },
  {
    slug: "marigold",
    name: "Marigold",
    style: "Foil · Deckle edge",
    price: 22,
    leadTime: "10 weeks",
    bg: "#F2E8D8",
    card: "#FBF4E4",
    accent: "#B8860B",
    ink: "#3A2B1E",
    description:
      "Gold-foil Devanagari and English lockup on deckle-edge cotton. A warm, festive suite for a multi-day celebration.",
    includes: [
      "Main card",
      "Day-by-day insert",
      "RSVP with guest addressing",
      "Gold-lined envelope",
    ],
    styleCategories: ["Fusion", "Traditional"],
    occasions: ["Wedding", "Sangeet", "Reception"],
    format: "Boxed",
    paperStock: "Handmade cotton rag · 300gsm · Ivory",
    paperDetails: [
      "Deckle edges on every card in the set",
      "22-karat gold foil, hand-pulled stamp",
      "Silk-lined presentation box, closes with a tasseled tie",
      "Envelopes lined in matching gold leaf paper",
    ],
    views: [
      { label: "Presentation box", note: "Silk-lined, tasseled tie" },
      { label: "Main invitation", note: "Bilingual gold foil" },
      { label: "Day-by-day insert", note: "Full celebration arc" },
    ],
    artisan: {
      name: "The Marigold House",
      place: "Jaipur, Rajasthan",
      story:
        "A third-generation foil studio where every stamp is pulled by hand. The boxes are cut and lined by a family of bookbinders two streets away.",
    },
    defaultNames: { one: "Ananya", two: "Rohan" },
    defaultGreeting: "Together with their families",
  },
  {
    slug: "jasmine",
    name: "Jasmine",
    style: "Hand-lettered · Cotton",
    price: 16,
    leadTime: "6 weeks",
    bg: "#EDE8E0",
    card: "#FDFBF5",
    accent: "#8A5444",
    ink: "#1C1917",
    description:
      "Minimal hand-lettered script on a cream cotton card. Designed for couples who want the type to do the work.",
    includes: [
      "Invitation card",
      "Single events insert",
      "RSVP card",
      "Ivory cotton envelope",
    ],
    styleCategories: ["Minimalist", "Contemporary"],
    occasions: ["Engagement", "Wedding", "Save the Date"],
    format: "Flat Card",
    paperStock: "Cotton rag · 180gsm · Raw ivory",
    paperDetails: [
      "Unbleached cotton, soft torn edge",
      "Hand-lettered in walnut ink, then plate-printed",
      "Matching return envelope with handwritten address",
      "No foil, no flourish — just the words",
    ],
    views: [
      { label: "Invitation card", note: "Single column, hand-lettered" },
      { label: "Events insert", note: "One card, both ceremonies" },
      { label: "RSVP card", note: "Pre-addressed return" },
    ],
    artisan: {
      name: "Neha Sethi",
      place: "Pondicherry, Tamil Nadu",
      story:
        "Neha letters every headline by hand in her studio on Rue Romain Rolland. She works in walnut ink because it softens into the paper instead of sitting on top of it.",
    },
    defaultNames: { one: "Maya", two: "Arjun" },
    defaultGreeting: "You are invited",
  },
  {
    slug: "amrit",
    name: "Amrit",
    style: "Monogram · Wax seal",
    price: 24,
    leadTime: "10 weeks",
    bg: "#E0DACD",
    card: "#F0E8D8",
    accent: "#5C463A",
    ink: "#2A2016",
    description:
      "A custom monogram, a hand-mixed wax seal, and letterpress text on warm parchment. The suite feels like a family crest.",
    includes: [
      "Monogrammed invitation",
      "Events insert",
      "RSVP postcard",
      "Hand-poured wax seal",
    ],
    styleCategories: ["Traditional"],
    occasions: ["Wedding", "Engagement"],
    format: "Boxed",
    paperStock: "Parchment-finish cotton · 260gsm · Warm bone",
    paperDetails: [
      "Custom two-letter monogram, drawn to order",
      "Hand-poured wax seal in your accent color",
      "Letterpress body text in deep walnut ink",
      "Linen-wrapped presentation box, tied with jute",
    ],
    views: [
      { label: "Monogram cover", note: "Debossed crest" },
      { label: "Main invitation", note: "Letterpress in walnut" },
      { label: "Wax-sealed closure", note: "Hand-poured, hand-stamped" },
    ],
    artisan: {
      name: "Studio Amrit",
      place: "Udaipur, Rajasthan",
      story:
        "Amrit's monograms are drawn in three rounds — one in ink, one refined, one you approve by WhatsApp. The wax is mixed in small batches, so no two seals match exactly.",
    },
    defaultNames: { one: "Aisha", two: "Veer" },
    defaultGreeting: "With the blessings of our families",
  },
  {
    slug: "mira",
    name: "Mira",
    style: "Watercolor · Modern",
    price: 20,
    leadTime: "8 weeks",
    bg: "#F0E8E0",
    card: "#FBF7F0",
    accent: "#B8755D",
    ink: "#1C1917",
    description:
      "A painterly wash of terracotta and olive, overlaid with Cormorant italic. Modern without losing warmth.",
    includes: [
      "Invitation card",
      "Events insert",
      "RSVP",
      "Printed envelope liner",
    ],
    styleCategories: ["Contemporary", "Fusion"],
    occasions: ["Sangeet", "Mehndi", "Wedding"],
    format: "Flat Card",
    paperStock: "Smooth art paper · 300gsm · Warm white",
    paperDetails: [
      "Four-color digital print with gouache washes",
      "Italic headline, Cormorant at 48pt",
      "Coordinated envelope liner in matching wash",
      "Companion RSVP with QR response option",
    ],
    views: [
      { label: "Main invitation", note: "Terracotta wash" },
      { label: "Lined envelope", note: "Olive + terracotta liner" },
      { label: "Events insert", note: "One card, three ceremonies" },
    ],
    artisan: {
      name: "Mira Paper Atelier",
      place: "Mumbai, Maharashtra",
      story:
        "Mira paints the washes on 12×18 rag sheets, scans each one, and composes the type on top. Each suite you order is pulled from a wash that no other couple will ever receive.",
    },
    defaultNames: { one: "Tara", two: "Kabir" },
    defaultGreeting: "Please join us",
  },
  {
    slug: "saraswati",
    name: "Saraswati",
    style: "Devanagari · Bilingual",
    price: 22,
    leadTime: "9 weeks",
    bg: "#E8E2D2",
    card: "#F7F0DE",
    accent: "#B8860B",
    ink: "#2A2016",
    description:
      "A bilingual suite set in Noto Serif Devanagari and Cormorant Garamond. Crafted for families who want both scripts to breathe.",
    includes: [
      "Bilingual invitation",
      "Devanagari events insert",
      "RSVP",
      "Gold-foil seal",
    ],
    styleCategories: ["Traditional", "Fusion"],
    occasions: ["Wedding", "Reception"],
    format: "Scroll",
    paperStock: "Handmade khadi paper · 200gsm · Cream",
    paperDetails: [
      "Rolled scroll, bound with brass end-caps",
      "Devanagari set in Noto Serif, English in Cormorant Garamond",
      "Gold-foil family seal at the head",
      "Presented inside a silk sleeve in your accent color",
    ],
    views: [
      { label: "Rolled scroll", note: "Brass end-caps, silk sleeve" },
      { label: "Unrolled invitation", note: "Devanagari + English" },
      { label: "Family seal", note: "Gold-foil, at the head" },
    ],
    artisan: {
      name: "Saraswati Bindery",
      place: "Varanasi, Uttar Pradesh",
      story:
        "Saraswati's studio works exclusively with khadi paper, hand-beaten along the ghats. The brass end-caps are lathed next door, the silk sleeves sewn across the river in Ramnagar.",
    },
    defaultNames: { one: "Isha", two: "Dev" },
    defaultGreeting: "Saadar Amantran",
  },
  {
    slug: "tulsi",
    name: "Tulsi",
    style: "Digital · Save the Date",
    price: 12,
    leadTime: "3 weeks",
    bg: "#EBE5D6",
    card: "#FAF6EC",
    accent: "#6B8566",
    ink: "#1C1917",
    description:
      "A pairing of a digital save-the-date and a single letterpress keepsake card. Sent instantly, posted second.",
    includes: [
      "Animated digital save-the-date",
      "Letterpress keepsake card",
      "Guest mailing by Ananya",
      "Matching RSVP microsite",
    ],
    styleCategories: ["Minimalist", "Contemporary"],
    occasions: ["Save the Date", "Engagement"],
    format: "Digital + Print Bundle",
    paperStock: "Crane's Lettra · 220gsm · Pearl White",
    paperDetails: [
      "Animated motion save-the-date, sent from your domain",
      "Matching single letterpress keepsake",
      "RSVP microsite with event listings",
      "Sent to every address on your Ananya guest list",
    ],
    views: [
      { label: "Digital save-the-date", note: "Motion, sent from your domain" },
      { label: "Letterpress keepsake", note: "Single card, deckle edge" },
      { label: "RSVP microsite", note: "One-page, password optional" },
    ],
    artisan: {
      name: "Studio Tulsi",
      place: "Bengaluru · Jaipur",
      story:
        "The digital pieces are motion-designed in Bengaluru; the keepsakes are pressed the same week at the Lotus Press. Both ship within twenty-one days of approval.",
    },
    defaultNames: { one: "Sana", two: "Ishaan" },
    defaultGreeting: "Save the date",
  },
  {
    slug: "benaras",
    name: "Benaras",
    style: "Scroll · Brocade",
    price: 32,
    leadTime: "12 weeks",
    bg: "#E7DDCB",
    card: "#F4EAD4",
    accent: "#8A2B1F",
    ink: "#2A1A10",
    description:
      "A silk-brocade wrapped scroll with letterpress insets, finished with a rosewood toggle. The ceremonial standard.",
    includes: [
      "Brocade-wrapped scroll",
      "Letterpress main invitation",
      "Events insert",
      "Rosewood toggle closure",
    ],
    styleCategories: ["Traditional"],
    occasions: ["Wedding", "Reception"],
    format: "Scroll",
    paperStock: "Handmade rag · 240gsm · Antique cream",
    paperDetails: [
      "Silk Benarasi brocade wrap, woven to order",
      "Letterpress insets in oxblood ink",
      "Rosewood toggle, oiled and signed",
      "Arrives in a fabric sleeve with printed ceremony list",
    ],
    views: [
      { label: "Brocade-wrapped scroll", note: "Benarasi silk, toggle closure" },
      { label: "Letterpress inset", note: "Main invitation, oxblood ink" },
      { label: "Events insert", note: "Pre-wedding through reception" },
    ],
    artisan: {
      name: "The Benaras Weavers",
      place: "Varanasi, Uttar Pradesh",
      story:
        "The brocade is woven by a cooperative of seven weavers. Each scroll takes eleven days on the loom, three more on the press, and one more to finish at the bench.",
    },
    defaultNames: { one: "Shivani", two: "Raghav" },
    defaultGreeting: "Shubh Vivah",
  },
];

export type JournalTag =
  | "Planning"
  | "Vendors"
  | "Traditions"
  | "Style"
  | "Real Weddings";

export const JOURNAL_TAGS: JournalTag[] = [
  "Planning",
  "Vendors",
  "Traditions",
  "Style",
  "Real Weddings",
];

// Article body is a sequence of blocks so pull quotes and inline
// images can sit inside the prose. `kicker` is the short editorial
// label; `tag` is the canonical filterable taxonomy.
export type JournalBlock =
  | { type: "p"; text: string }
  | { type: "quote"; text: string; attribution?: string }
  | { type: "image"; bg: string; src?: string; caption?: string; aspect?: "wide" | "tall" | "square" };

export type JournalEntry = {
  slug: string;
  title: string;
  tag: JournalTag;
  kicker: string;
  dek: string;
  readTime: string;
  date: string;
  author: string;
  bg: string;
  fg: string;
  image?: string;
  body: JournalBlock[];
};

export const JOURNAL: JournalEntry[] = [
  {
    slug: "what-your-caterer-wishes-you-knew",
    title: "What your caterer wishes you knew about multi-day menus",
    tag: "Vendors",
    kicker: "From the kitchen",
    dek: "Four ceremonies, four menus. How to brief a caterer so the mehndi lunch doesn't read like the reception, and both still feel like you.",
    readTime: "9 min",
    date: "April 2026",
    author: "Rupa Shenoy",
    bg: "#665342",
    fg: "#F0E6D4",
    image: "/images/portfolio/mehendi/mehendi-01.jpg",
    body: [
      { type: "p", text: "Most couples hand their caterer a pinned-down reception menu and then, two weeks out, ask what the mehndi lunch should look like. By then the kitchen has ordered produce, built a prep calendar, and priced a thali service around guesses. The menu you get is a menu we wrote alone, and it shows." },
      { type: "p", text: "A wedding is not a dinner. It is four distinct meals — sometimes five — for the same people, staged over three days, in rooms with different lighting and different moods. The caterer you hire is not writing one menu. We are writing a menu arc." },
      { type: "quote", text: "The mehndi lunch is the one meal your grandmother will tell you about for a year. Build it like it matters.", attribution: "Rupa Shenoy" },
      { type: "p", text: "The easiest fix is the earliest one. Sit down with your caterer eight months out — not four — and walk every event on the timeline. Tell us the mood of each one. A mehndi on brass thalis wants chaat and small bites. A sangeet dinner wants food that can stand up while guests are dancing. A reception wants plating. Say all of that out loud." },
      { type: "image", bg: "#7A6150", src: "/images/portfolio/mehendi/mehendi-04.jpg", caption: "Mehndi thali, plated in the back kitchen before service.", aspect: "wide" },
      { type: "p", text: "The second fix is the hardest one: trust your caterer's no. If we tell you the live dosa station won't hold at 300 covers, we are not bargaining. We are protecting the dosa. Every kitchen has a limit, and the couples who ask us what ours is get a better night than the couples who assume there isn't one." },
      { type: "p", text: "A final, small thing. Feed your vendors. A photographer who has eaten is a photographer who is still looking at the light at 10pm. Every catering contract should have a line for vendor meals, and it should not be the last thing decided." },
      { type: "p", text: "The menu is not where your wedding gets creative. Your family is. Let the kitchen hold the rhythm while the room holds the joy." },
    ],
  },
  {
    slug: "anatomy-of-a-great-sangeet-set-list",
    title: "The anatomy of a great sangeet set list",
    tag: "Planning",
    kicker: "Field notes",
    dek: "Two decades of wedding floors, one clear pattern. The sangeets people talk about afterward aren't the loudest — they're the ones built in three acts.",
    readTime: "7 min",
    date: "April 2026",
    author: "Ananya Studio",
    bg: "#6E6354",
    fg: "#F2ECE0",
    image: "/images/portfolio/sangeet/sangeet-01.jpg",
    body: [
      { type: "p", text: "The temptation with a sangeet set list is to make it big. Forty Bollywood hits, a bhangra block, one slow song for the parents, and a reprise of whichever song was number one the year the couple met. It works. It also collapses into itself by 10pm, because every song is doing the same thing." },
      { type: "p", text: "The sangeets we remember — and we've been to a lot — are built in three acts. Not three playlists. Three arcs, each with its own volume, its own audience, its own reason." },
      { type: "quote", text: "A sangeet is not a concert. It's a roast, a reunion, and a dance floor — in that order." },
      { type: "p", text: "Act one is personal. The first ninety minutes belong to the family. This is where the aunties perform the choreography they've been rehearsing in someone's living room for six weeks. This is where the groom's college roommates do the bit. Music here should be specific — a song your grandmother loves, a song from the film your parents met watching. If it means something to one person in the room, it earns its spot." },
      { type: "image", bg: "#55503F", src: "/images/portfolio/sangeet/sangeet-03.jpg", caption: "The aunties' rehearsal playlist, printed and taped to the stage monitor.", aspect: "wide" },
      { type: "p", text: "Act two is the bridge. This is the DJ's hour. You hand over the floor and trust them to read the room. Usually that means the last two decades of Bollywood — but good DJs know when to drop in an unexpected regional hit, a Punjabi folk track, a Tamil remix. The bridge is where guests who weren't sure if they were going to dance start dancing." },
      { type: "p", text: "Act three is release. The last ninety minutes are loud, communal, and don't need to be clever. This is where you play the hits. Kala Chashma will happen. Chaiyya Chaiyya will happen. Nobody needs to be surprised. They need to be sweaty." },
      { type: "p", text: "One practical note: build the transitions. The worst sangeets are the ones where the family dances end and the DJ sits silently while cables are unplugged. Brief your DJ to hold a soft bed under the choreography segments, and to lift into act two without a pause. Momentum is the only thing that keeps the floor full." },
      { type: "p", text: "A sangeet is not a concert. It's a roast, a reunion, and a dance floor — in that order. Build the set list that way, and the room will do the rest." },
    ],
  },
  {
    slug: "muhurthams-and-mornings",
    title: "Muhurthams and mornings",
    tag: "Planning",
    kicker: "Planning — in practice",
    dek: "On building a schedule around a muhurtham without losing the guests who flew in for it.",
    readTime: "6 min",
    date: "March 2026",
    author: "Ananya Studio",
    bg: "#5C463A",
    fg: "#F0E8DC",
    image: "/images/portfolio/wedding/wedding-01.jpg",
    body: [
      { type: "p", text: "The muhurtham is not a suggestion. For most Indian weddings it is the singular time — often at 4:17 AM, or 11:52 PM — at which the ceremony must begin. Everything else is built around it." },
      { type: "p", text: "The platform's scheduler treats that window as load-bearing. Every vendor cue, every catering handoff, every shuttle departure is offset from it. When you move the muhurtham, everything else moves with it." },
      { type: "quote", text: "Move the muhurtham, and you move the wedding. Everything else is downstream." },
      { type: "image", bg: "#4A362D", src: "/images/portfolio/wedding/wedding-01.jpg", caption: "Pre-dawn mandap at a Dallas ceremony keyed to a 4:17 AM muhurtham.", aspect: "wide" },
      { type: "p", text: "What we've learned from the first fifty weddings: the hardest part isn't the timing itself. It's communicating to 300 guests, most of whom are unfamiliar with the rite, why dinner is at 9:15 instead of 7:00." },
      { type: "p", text: "A line in the program helps. A warm note at the welcome table helps more. What helps most is a host — a cousin, a college friend, anyone comfortable at a microphone — who explains, once, at the top, what the timing is and why. Information softens inconvenience." },
    ],
  },
  {
    slug: "in-praise-of-the-small-guest-list",
    title: "In praise of the small guest list",
    tag: "Planning",
    kicker: "The brief — opinions",
    dek: "Three hundred is not a ceiling. Sometimes it's a load-bearing wall you'd be happier without.",
    readTime: "4 min",
    date: "March 2026",
    author: "Rhea Singh",
    bg: "#4A5240",
    fg: "#F0EDE4",
    image: "/images/portfolio/wedding/wedding-02.jpg",
    body: [
      { type: "p", text: "We say this gently: a three-hundred-person Indian wedding is a logistical feat. A ninety-person one is a dinner." },
      { type: "p", text: "The couples who edit ruthlessly — who pare down their own guest list rather than inherit their parents' — almost always describe the day as the most present they've been at any event in their lives." },
      { type: "quote", text: "You don't need permission. You need a reason, and then a script." },
      { type: "p", text: "The script is the thing nobody tells you about. A small wedding is a decision you have to defend — to aunties, to family friends, to the cousin who expects his plus-three. Write the language once, with your partner, and hold the line together." },
    ],
  },
  {
    slug: "why-we-chose-jaipur",
    title: "Why we chose Jaipur",
    tag: "Vendors",
    kicker: "Our craftspeople",
    dek: "A visit to the press that sets our stationery, in its fifth decade and third generation.",
    readTime: "7 min",
    date: "February 2026",
    author: "Neel Ananya",
    bg: "#7A5D4C",
    fg: "#F5ECDE",
    image: "/images/portfolio/best/best-02.jpg",
    body: [
      { type: "p", text: "The Lotus press in Jaipur runs three hand-fed platens, a foil stamp, and a wooden type case that has been in the family since 1978. We pay a little more. The card feels different in the hand." },
      { type: "image", bg: "#6B4E3F", src: "/images/portfolio/portrait/portrait-03.jpg", caption: "Vandana pulling type at the Lotus press, Jaipur.", aspect: "tall" },
      { type: "p", text: "When we say \"hand-set\" we mean it literally. A woman named Vandana pulls type, letter by letter, the same way her aunt taught her. She signs the back of every proof with a pencil." },
      { type: "quote", text: "Stationery is not where you save money. It is the first object a guest holds.", attribution: "Neel Ananya" },
      { type: "p", text: "We chose Jaipur because the press was still there. We could have worked with a foil shop in Los Angeles. The cards would be fine. They would not carry the hand of someone who has been setting type for twenty-two years. That hand is what you are buying, and it is not available at scale." },
    ],
  },
  {
    slug: "reddy-menon-four-days-in-plano",
    title: "Four days in Plano: the Reddy–Menon wedding",
    tag: "Real Weddings",
    kicker: "Real Weddings",
    dek: "A Malayali–Telugu wedding across a rented estate, a temple, and a ballroom — told through the moments we kept coming back to.",
    readTime: "10 min",
    date: "February 2026",
    author: "Ananya Studio",
    bg: "#9C6F5D",
    fg: "#F5EAE0",
    image: "/images/portfolio/best/best-04.jpg",
    body: [
      { type: "p", text: "Sneha Reddy met Arjun Menon in a graduate program in Austin. Four years later, their families — one Telugu, one Malayali — sat down at a kitchen table in Plano to plan a wedding that honored both and flattened neither. What followed was four days, two temples, seven menus, and the single most-photographed jasmine garland we have ever seen." },
      { type: "image", bg: "#8B6152", src: "/images/portfolio/mehendi/mehendi-02.jpg", caption: "Day one: the mehndi, on the estate's back lawn.", aspect: "wide" },
      { type: "p", text: "Day one was the mehndi. Asha's team sat fifty guests in a four-hour rotation on the lawn. The bride's henna ran from fingertip to elbow and was still drying when the catering cleared the thali lunch. The music was low. Nobody was on their phone." },
      { type: "quote", text: "We wanted the day to feel like a family holiday. We didn't want it to feel like a production.", attribution: "Sneha Reddy" },
      { type: "p", text: "Day two was the Telugu ceremony, at a temple in Frisco, keyed to an 11:52 AM muhurtham. Pandit Vishwanath ran the rite in Sanskrit with a printed English translation for the groom's side. Lunch was a banana-leaf sadhya — twenty-six items — served by Rupa Catering on the temple's event floor." },
      { type: "image", bg: "#B58678", src: "/images/portfolio/haldi/haldi-02.jpg", caption: "The Malayali nair sadhya, day three, banana leaf on brass.", aspect: "wide" },
      { type: "p", text: "Day three was the Malayali ceremony at a venue in Las Colinas. Different pandit, same family. Kavita Florals built a mandap that read as a single silhouette from the entrance — marigold and jasmine composed like a brushstroke, as Kavita likes to put it. The grandmothers cried. Everyone cried." },
      { type: "p", text: "Day four was the reception. The Baraat Band played a forty-five minute set that started with a dhol entrance and ended with a quiet cover of a song the bride's father sang to her as a child. It was a ballroom and it was a living room. The best receptions are both." },
      { type: "p", text: "What we keep thinking about, weeks later, is how specific the whole thing was. Not one beat of it felt borrowed. That is what you get when two families sit at the same table early, and hold the tone together." },
    ],
  },
  {
    slug: "the-sangeet-playlist-problem",
    title: "The sangeet playlist problem",
    tag: "Planning",
    kicker: "Field notes",
    dek: "How to build a sangeet that isn't just a Spotify shuffle of four decades of Bollywood hits.",
    readTime: "5 min",
    date: "February 2026",
    author: "Ananya Studio",
    bg: "#6E6354",
    fg: "#F2ECE0",
    image: "/images/portfolio/sangeet/sangeet-02.jpg",
    body: [
      { type: "p", text: "Most sangeet playlists collapse into the same forty songs. That's fine. What we've noticed: the ones couples remember are almost always the ones that came from a specific person — a grandmother's favorite, a college roommate's pick." },
      { type: "p", text: "We encourage a two-hour block of \"dedications\" at the top, then let the DJ run the floor. Something specific, then something loud." },
      { type: "quote", text: "A sangeet is not a concert. It is a roast and a reunion." },
      { type: "p", text: "If you are hiring a DJ, have them sit with you for an hour with a notebook and pull twenty songs out of your family's history. The list they build with you will be better than the list you hand them." },
    ],
  },
  {
    slug: "a-quiet-mandap",
    title: "A quiet mandap",
    tag: "Style",
    kicker: "On decor",
    dek: "What restraint looks like in a room that has historically been defined by abundance.",
    readTime: "4 min",
    date: "January 2026",
    author: "Kavita Rao",
    bg: "#9C6F5D",
    fg: "#F5EAE0",
    image: "/images/portfolio/wedding/wedding-03.jpg",
    body: [
      { type: "p", text: "There is a version of the mandap that is four pillars of marigold and nothing else. It is beautiful, and it is not what you see in most venues." },
      { type: "image", bg: "#8E5F4E", src: "/images/portfolio/wedding/wedding-05.jpg", caption: "A four-pillar mandap at a Dallas temple. No cascades, no drape.", aspect: "wide" },
      { type: "p", text: "We've spent years convincing couples that less is not less. A restrained mandap puts the attention where it belongs: on the couple, the fire, the families seated at the edges." },
      { type: "quote", text: "You can always add. You can never unsee a mandap that has been overbuilt.", attribution: "Kavita Rao" },
      { type: "p", text: "If you are working with a decorator who is pushing you toward more, ask why. A good answer exists — a cavernous ballroom needs a bigger silhouette to hold the room. A less good answer sounds like a budget line being justified in real time." },
    ],
  },
  {
    slug: "interfaith-unions-a-practical-note",
    title: "Interfaith unions, a practical note",
    tag: "Traditions",
    kicker: "Planning — in practice",
    dek: "Two traditions, one day. What actually works, and what looks good on paper but fails on the morning-of.",
    readTime: "8 min",
    date: "January 2026",
    author: "Pandit Vishwanath",
    bg: "#4C4538",
    fg: "#EFE8D8",
    image: "/images/portfolio/portrait/portrait-01.jpg",
    body: [
      { type: "p", text: "The cleanest interfaith weddings we've seen split the day: a morning ceremony in one tradition, a sunset ceremony in another. Each family holds their rite the way they were raised." },
      { type: "p", text: "The least clean ones try to braid rites together into a single ceremony. Sometimes this works. Usually it reads as a compromise on both sides." },
      { type: "quote", text: "Which is the spine of the day, and which is the companion? Let the spine set the timeline." },
      { type: "image", bg: "#3D3829", src: "/images/portfolio/portrait/portrait-04.jpg", caption: "A split-day timeline, ceremony one at 10am, ceremony two at 6pm.", aspect: "wide" },
      { type: "p", text: "Practically: pick two officiants who have met each other before the rehearsal. Share the script in both directions. And do not ask either one to shorten their rite on the morning-of. That is how ceremonies collapse." },
    ],
  },
  {
    slug: "the-vidaai-rewritten",
    title: "The vidaai, rewritten",
    tag: "Traditions",
    kicker: "On tradition",
    dek: "A rite designed around a bride leaving her home, staged for a couple who lives three states away. Here's what we've learned letting families adapt it.",
    readTime: "6 min",
    date: "January 2026",
    author: "Pandit Vishwanath",
    bg: "#4A3E38",
    fg: "#EFE4D8",
    image: "/images/portfolio/haldi/haldi-01.jpg",
    body: [
      { type: "p", text: "The vidaai was written for a different era. A bride left her parents' home to join her husband's — physically, permanently. The grief was real because the separation was real. Today, the bride has lived in Chicago for five years. She is not going anywhere new. And yet the rite remains, because it is not really about the leaving." },
      { type: "quote", text: "The vidaai is not about where you are going. It is about who is letting you go." },
      { type: "p", text: "We have started encouraging families to rewrite the vidaai as an act of blessing, not a departure. The bride's parents still give her rice, water, and a final word. She still turns over her shoulder. But we have moved the framing, quietly, from grief to gratitude." },
      { type: "p", text: "It is still the moment of the day that the room remembers. It is just no longer the moment that pretends to be what it was." },
    ],
  },
  {
    slug: "reception-looks-four-looks-one-bride",
    title: "Reception looks: four looks, one bride",
    tag: "Style",
    kicker: "On wardrobe",
    dek: "The fittings, the contingencies, and the quiet calendar behind a multi-ceremony wardrobe.",
    readTime: "6 min",
    date: "December 2025",
    author: "Anjali Shah",
    bg: "#B58678",
    fg: "#F7EFE8",
    image: "/images/portfolio/portrait/portrait-02.jpg",
    body: [
      { type: "p", text: "A Kanjivaram in the morning, a lehenga by evening, a sharara the next day, a reception gown at the end of it all. Four looks in three days, and the woman wearing them has been up since 4am." },
      { type: "image", bg: "#A37968", src: "/images/portfolio/portrait/portrait-06.jpg", caption: "A fitting calendar, twelve weeks out.", aspect: "wide" },
      { type: "p", text: "The mistake brides make is scheduling the fittings serially — one month before each. The right approach is to block the fittings out twelve weeks ahead and work backward. Shoes arrive late. Blouses need rework. The jeweler is always six days behind where she said she'd be." },
      { type: "quote", text: "Every look should be something the same woman would actually wear. Not a costume. A wardrobe." },
      { type: "p", text: "The other thing we push, gently: the wardrobe should read as one woman across four ceremonies. Not four characters. The through-line is usually in the hair, the skin, a single piece of jewelry that carries across. Continuity is what makes a wardrobe feel designed instead of assembled." },
    ],
  },
  {
    slug: "henna-the-two-week-countdown",
    title: "Henna, the two-week countdown",
    tag: "Traditions",
    kicker: "From the artist",
    dek: "How to prep skin, set expectations, and avoid the three mistakes that show up in every bridal photo gallery.",
    readTime: "5 min",
    date: "December 2025",
    author: "Asha Kurian",
    bg: "#8A5444",
    fg: "#F5EAE0",
    image: "/images/portfolio/mehendi/mehendi-03.jpg",
    body: [
      { type: "p", text: "The darker the stain, the longer you held the paste. That is the whole secret. Everything else — the oil, the wrap, the sugar-lemon seal — is optimization." },
      { type: "p", text: "Two weeks out, I tell brides three things. One: no waxing or bleaching on the hands or forearms for fourteen days before. Two: no moisturizer the morning of the mehndi. Three: plan six hours, not four, for the full-hand-and-foot design. It is longer than you think." },
      { type: "quote", text: "A rushed mehndi is a visible mehndi. Schedule it like a ceremony, not a spa day.", attribution: "Asha Kurian" },
      { type: "p", text: "The three mistakes I see most often: washing it off too early, leaving the wrap on overnight, and trying to touch up the design the next morning. The stain is the stain. Trust it." },
    ],
  },
];

export const PLATFORM_MODULES = [
  {
    slug: "guests",
    title: "Guest Management",
    blurb: "RSVPs, seating, travel — shared with both families.",
    previewBg: "#B58678",
    previewFg: "#F7EFE8",
    pills: ["500+ guest lists", "Both families in sync", "Multi-event RSVPs"],
    features: [
      "Household-level RSVPs with dietary and plus-one logic",
      "Seating chart builder with drag-to-swap",
      "Travel and lodging block tracking per household",
      "Permission layers: parents see what you choose to share",
    ],
  },
  {
    slug: "stationery",
    title: "Stationery & Invitations",
    blurb: "Hand-lettered suites, addressed and delivered to every door.",
    previewBg: "#A0806B",
    previewFg: "#F5ECDE",
    pills: ["Artisan studios in India", "Automatic guest addressing", "Print & ship tracked"],
    features: [
      "Letterpress, foil, and hand-lettered suites",
      "Automatic address compilation from the guest list",
      "Proofing workflow with the studio",
      "Print-to-doorstep tracking",
    ],
  },
  {
    slug: "day-of",
    title: "Day-Of Coordination",
    blurb: "Run-of-show, vendor cues, muhurtham-aware timelines.",
    previewBg: "#8A6B5E",
    previewFg: "#F2E8DE",
    pills: ["Muhurtham-aware schedule", "Live vendor cues", "Week-of ready"],
    features: [
      "Timeline anchored to the muhurtham — move it, everything shifts",
      "Vendor cue sheets printed and pushed to their phones",
      "Real-time status updates to both families",
      "Contingency scripts for weather and overrun",
    ],
  },
  {
    slug: "wardrobe",
    title: "Wardrobe & Styling",
    blurb: "Every look, every fitting, composed across ceremonies.",
    previewBg: "#9C6F5D",
    previewFg: "#F5EAE0",
    pills: ["Every ceremony mapped", "Fittings tracked", "Accessories in sync"],
    features: [
      "Look boards per ceremony for bride, groom, and family",
      "Fitting schedule with tailor contact",
      "Jewelry and accessory inventory",
      "Backup-outfit logic for weather contingencies",
    ],
  },
  {
    slug: "catering",
    title: "Catering & Dining",
    blurb: "Menus by ceremony, tastings tracked, dietary notes honored.",
    previewBg: "#665342",
    previewFg: "#F0E6D4",
    pills: ["Menu per ceremony", "Dietary notes honored", "Tastings logged"],
    features: [
      "Menu per event, with regional and dietary flags",
      "Household-level dietary aggregation from the guest list",
      "Tasting notes and sign-offs",
      "Live count handoff to the caterer week-of",
    ],
  },
  {
    slug: "guest-experience",
    title: "The Guest Experience",
    blurb: "A mobile companion for every guest — no downloads.",
    previewBg: "#7A5D4C",
    previewFg: "#F5ECDE",
    pills: ["No app downloads", "Works on any phone", "Live itinerary updates"],
    features: [
      "A personalized web link per household",
      "Itinerary, dress code, venue maps, and shuttles",
      "Live updates the week of",
      "Photo uploads back to the couple, opt-in",
    ],
  },
  {
    slug: "vendor-hub",
    title: "Vendor Communication Hub",
    blurb: "Every vendor, every thread, every approval — in one place.",
    previewBg: "#4C4538",
    previewFg: "#EFE8D8",
    pills: ["Unified vendor inbox", "Contracts + approvals", "No more WhatsApp chaos"],
    features: [
      "One inbox for every vendor — no scattered email or WhatsApp",
      "Contract versioning and digital sign-off",
      "Approval queue shared between couple and both families",
      "Vendor-side view keeps them on-platform, not in side channels",
    ],
  },
  {
    slug: "budget",
    title: "Budget & Payments",
    blurb: "Track every number — actuals, deposits, and who's owed what.",
    previewBg: "#3D4A4A",
    previewFg: "#E4ECEC",
    pills: ["Deposits tracked", "Both families", "Live reconciliation"],
    features: [
      "Line-item budget per event, with real-time actuals",
      "Deposit and payment schedule per vendor",
      "Both-family contribution tracking with permissioning",
      "Export for tax and reimbursement season",
    ],
  },
  {
    slug: "timeline",
    title: "Timeline & Milestones",
    blurb: "A nine-month runway, paced by what actually blocks what.",
    previewBg: "#5C463A",
    previewFg: "#F0E6D4",
    pills: ["Dependency-aware", "Muhurtham-anchored", "Gentle reminders"],
    features: [
      "Milestones from engagement through vidaai",
      "Dependencies enforced — caterer count waits on final RSVPs",
      "Family-aware reminders, not alarm-clock pings",
      "Visual Gantt for the week-of choreography",
    ],
  },
];

// ── Live category counts ──────────────────────────────────────────────────────
// Fetches actual vendor counts from Supabase, falls back to static CATEGORIES
// counts when DB is unavailable or not yet seeded.
export async function getCategoriesWithLiveCounts(): Promise<Category[]> {
  try {
    const res = await fetch("/api/vendors/counts", { next: { revalidate: 3600 } });
    if (!res.ok) return CATEGORIES;
    const { counts } = await res.json() as { counts: Record<string, number> };
    return CATEGORIES.map((cat) => ({
      ...cat,
      count: counts[cat.slug] ?? cat.count,
    }));
  } catch {
    return CATEGORIES;
  }
}
