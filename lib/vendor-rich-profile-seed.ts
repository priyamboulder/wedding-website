// ── Rich profile seed ───────────────────────────────────────────────────────
// Optional extension data (Instagram portfolio, wedding graph, destinations,
// couple reviews, planner endorsements, languages, services) for the slide-
// over vendor profile panel. Keyed by vendor id and spread onto the base
// Vendor record in lib/vendor-unified-seed.ts.
//
// Only curated/Select vendors carry rich data — free vendors fall back to the
// empty-state sections on the panel.

import type {
  CoupleReview,
  DestinationEntry,
  PlannerEndorsement,
  PortfolioPost,
  Vendor,
  VendorWedding,
} from "@/types/vendor-unified";

type RichProfile = Partial<
  Pick<
    Vendor,
    | "instagram_handle"
    | "instagram_followers"
    | "services"
    | "languages"
    | "travel_fee_description"
    | "passport_valid"
    | "destination_booking_lead_months"
    | "preferred_regions"
    | "destinations"
    | "portfolio_posts"
    | "weddings"
    | "couple_reviews"
    | "planner_endorsements"
  >
>;

const PORTFOLIO_POOL = [
  "/images/portfolio/best/best-01.jpg",
  "/images/portfolio/best/best-02.jpg",
  "/images/portfolio/best/best-03.jpg",
  "/images/portfolio/best/best-04.jpg",
  "/images/portfolio/best/best-05.jpg",
  "/images/portfolio/best/best-06.jpg",
  "/images/portfolio/best/best-07.jpg",
  "/images/portfolio/best/best-08.jpg",
  "/images/portfolio/best/best-09.jpg",
  "/images/portfolio/portrait/portrait-01.jpg",
  "/images/portfolio/portrait/portrait-02.jpg",
  "/images/portfolio/portrait/portrait-03.jpg",
  "/images/portfolio/portrait/portrait-04.jpg",
  "/images/portfolio/portrait/portrait-05.jpg",
  "/images/portfolio/portrait/portrait-06.jpg",
  "/images/portfolio/wedding/wedding-01.jpg",
  "/images/portfolio/wedding/wedding-02.jpg",
  "/images/portfolio/wedding/wedding-03.jpg",
  "/images/portfolio/wedding/wedding-04.jpg",
  "/images/portfolio/wedding/wedding-05.jpg",
  "/images/portfolio/sangeet/sangeet-01.jpg",
  "/images/portfolio/sangeet/sangeet-02.jpg",
  "/images/portfolio/sangeet/sangeet-03.jpg",
  "/images/portfolio/mehendi/mehendi-01.jpg",
  "/images/portfolio/mehendi/mehendi-02.jpg",
  "/images/portfolio/haldi/haldi-01.jpg",
  "/images/portfolio/haldi/haldi-02.jpg",
  "/images/portfolio/haldi/haldi-03.jpg",
  "/images/portfolio/baraat/baraat-01.jpg",
  "/images/portfolio/baraat/baraat-02.jpg",
];

function makePortfolioPosts(
  vendorSeed: string,
  count: number,
): PortfolioPost[] {
  const posts: PortfolioPost[] = [];
  const offset = vendorSeed.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  for (let i = 0; i < count; i++) {
    const photo = PORTFOLIO_POOL[(offset + i) % PORTFOLIO_POOL.length];
    posts.push({
      id: `post-${vendorSeed}-${i}`,
      image_url: photo,
      caption: "",
      posted_at: new Date(
        Date.now() - i * 14 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      is_video: i % 7 === 3,
      wedding_id: null,
      venue_id: null,
      permalink: null,
    });
  }
  return posts;
}

// ── Joseph Radhik (photography) ─────────────────────────────────────────────

const JOSEPH_RADHIK_WEDDINGS: VendorWedding[] = [
  {
    id: "wed-anita-raj",
    couple_names: "Anita & Raj",
    venue_id: "ven-dreams-cancun",
    venue_name: "Dreams Riviera Cancun",
    venue_city: "Cancun",
    venue_state: "Quintana Roo",
    country: "Mexico",
    is_destination: true,
    date: "2025-03-18",
    duration_days: 3,
    cover_image_url: "/images/portfolio/wedding/wedding-01.jpg",
    planner_id: "plan-radz",
    vendor_team: [
      { vendor_id: "plan-radz", category: "planner", name: "Radz Events", handle: "@radzevents", traveled: true, home_base: "NJ" },
      { vendor_id: "vendor-joseph-radhik", category: "photography", name: "Stories by Joseph Radhik", handle: "@storiesbyjosephradhik", traveled: true, home_base: "NYC" },
      { vendor_id: "vend-decor-tropical", category: "decor_florals", name: "Tropical Decor MX", handle: "@tropicaldecormx", traveled: false, home_base: "Cancun" },
      { vendor_id: "vend-ent-djriz", category: "entertainment", name: "DJ Riz", handle: "@djriz", traveled: true, home_base: "NJ" },
      { vendor_id: "vend-mua-meena", category: "hmua", name: "Glam by Meena", handle: "@glambymeena", traveled: true, home_base: "NYC" },
    ],
  },
  {
    id: "wed-neha-vikram",
    couple_names: "Neha & Vikram",
    venue_id: "ven-borgo-tuscany",
    venue_name: "Borgo San Felice",
    venue_city: "Castelnuovo Berardenga",
    venue_state: "Tuscany",
    country: "Italy",
    is_destination: true,
    date: "2025-08-22",
    duration_days: 3,
    cover_image_url: "/images/portfolio/wedding/wedding-02.jpg",
    planner_id: "plan-cgco",
    vendor_team: [
      { vendor_id: "plan-cgco", category: "planner", name: "CG & Co Events", handle: "@cgcoevents", traveled: true, home_base: "NY" },
      { vendor_id: "vendor-joseph-radhik", category: "photography", name: "Stories by Joseph Radhik", handle: "@storiesbyjosephradhik", traveled: true, home_base: "NYC" },
      { vendor_id: "vend-florence-florals", category: "decor_florals", name: "Florence Florals", handle: "@florenceflorals", traveled: false, home_base: "Florence" },
      { vendor_id: "vendor-namrata-soni", category: "hmua", name: "Namrata Soni", handle: "@namratasoni", traveled: true, home_base: "Delhi" },
    ],
  },
  {
    id: "wed-priya-arjun",
    couple_names: "Priya & Arjun",
    venue_id: "ven-legacy",
    venue_name: "The Legacy Castle",
    venue_city: "Pompton Plains",
    venue_state: "NJ",
    date: "2025-10-15",
    duration_days: 3,
    cover_image_url: "/images/portfolio/wedding/wedding-03.jpg",
    planner_id: "plan-radz",
    vendor_team: [
      { vendor_id: "plan-radz", category: "planner", name: "Radz Events", handle: "@radzevents" },
      { vendor_id: "vendor-joseph-radhik", category: "photography", name: "Stories by Joseph Radhik", handle: "@storiesbyjosephradhik" },
      { vendor_id: "vendor-wedding-design-co", category: "decor_florals", name: "The Wedding Design Company", handle: "@devikanarainandco" },
      { vendor_id: "vend-ent-djriz", category: "entertainment", name: "DJ Riz", handle: "@djriz" },
      { vendor_id: "vendor-namrata-soni", category: "hmua", name: "Namrata Soni", handle: "@namratasoni" },
    ],
  },
  {
    id: "wed-anika-rohan",
    couple_names: "Anika & Rohan",
    venue_id: "ven-pierre",
    venue_name: "The Pierre",
    venue_city: "New York",
    venue_state: "NY",
    date: "2025-06-14",
    duration_days: 3,
    cover_image_url: "/images/portfolio/wedding/wedding-04.jpg",
    planner_id: "plan-radz",
    vendor_team: [
      { vendor_id: "plan-radz", category: "planner", name: "Radz Events", handle: "@radzevents" },
      { vendor_id: "vendor-joseph-radhik", category: "photography", name: "Stories by Joseph Radhik", handle: "@storiesbyjosephradhik" },
      { vendor_id: "vendor-namrata-soni", category: "hmua", name: "Namrata Soni", handle: "@namratasoni" },
    ],
  },
  {
    id: "wed-meera-dev",
    couple_names: "Meera & Dev",
    venue_id: "ven-legacy",
    venue_name: "The Legacy Castle",
    venue_city: "Pompton Plains",
    venue_state: "NJ",
    date: "2025-05-03",
    duration_days: 2,
    cover_image_url: "/images/portfolio/wedding/wedding-05.jpg",
    planner_id: "plan-chandai",
    vendor_team: [
      { vendor_id: "plan-chandai", category: "planner", name: "Chandai Events", handle: "@chandaievents" },
      { vendor_id: "vendor-joseph-radhik", category: "photography", name: "Stories by Joseph Radhik", handle: "@storiesbyjosephradhik" },
    ],
  },
];

const JOSEPH_RADHIK_DESTINATIONS: DestinationEntry[] = [
  { city: "Cancun", country: "Mexico", region: "Mexico / Caribbean", wedding_count: 4 },
  { city: "Tuscany", country: "Italy", region: "Europe", wedding_count: 2 },
  { city: "Udaipur", country: "India", region: "India", wedding_count: 3 },
  { city: "Montego Bay", country: "Jamaica", region: "Mexico / Caribbean", wedding_count: 1 },
  { city: "Cabo San Lucas", country: "Mexico", region: "Mexico / Caribbean", wedding_count: 2 },
];

const JOSEPH_RADHIK_REVIEWS: CoupleReview[] = [
  {
    id: "rev-jr-tuscany",
    rating: 5,
    body: "Shot our Tuscany wedding and it was pure magic. Joseph scouted the vineyard the day before and knew exactly where every golden-hour moment would land. Our parents still keep the album on their coffee table.",
    couple_names: "Neha & Vikram",
    date: "2025-09-10",
    venue_name: "Borgo San Felice",
    verified: true,
    helpful_count: 56,
    is_destination: true,
    destination_location: "Tuscany, Italy",
  },
  {
    id: "rev-jr-cancun",
    rating: 5,
    body: "Joseph flew to Cancun for our 3-day wedding and captured every moment perfectly. He scouted locations the day before and knew exactly how to work with the beach lighting. Felt like he cared about the photos as much as we did.",
    couple_names: "Anita & Raj",
    date: "2025-04-02",
    venue_name: "Dreams Riviera Cancun",
    verified: true,
    helpful_count: 47,
    is_destination: true,
    destination_location: "Cancun, Mexico",
  },
  {
    id: "rev-jr-1",
    rating: 5,
    body: "Joseph and his team were absolutely incredible. They captured every moment of our 3-day wedding perfectly — from the quiet mehndi details to the full-throttle baraat. The turnaround was fast and the gallery still makes us cry a year later.",
    couple_names: "Priya & Arjun",
    date: "2025-11-20",
    venue_name: "The Legacy Castle",
    verified: true,
    helpful_count: 34,
  },
  {
    id: "rev-jr-3",
    rating: 5,
    body: "Worth every penny. Joseph's eye for South Asian weddings is unmatched — he knows exactly when the pheras matter most and when to step back.",
    couple_names: "Anika & Rohan",
    date: "2025-07-02",
    venue_name: "The Pierre",
    verified: true,
    helpful_count: 18,
  },
];

const JOSEPH_RADHIK_ENDORSEMENTS: PlannerEndorsement[] = [
  {
    id: "end-jr-1",
    planner_id: "plan-radz",
    planner_name: "Urvashi",
    planner_company: "Radz Events",
    body: "One of the best photography teams I've worked with. Consistent, professional, and the couples always love their galleries.",
    wedding_count: 12,
  },
  {
    id: "end-jr-2",
    planner_id: "plan-cgco",
    planner_name: "Christine",
    planner_company: "CG & Co Events",
    body: "Joseph's team shows up with a plan and executes flawlessly. They're my first call for any multi-day South Asian wedding.",
    wedding_count: 8,
  },
];

// ── Namrata Soni (HMUA) ─────────────────────────────────────────────────────

const NAMRATA_WEDDINGS: VendorWedding[] = [
  {
    id: "wed-anika-rohan-mua",
    couple_names: "Anika & Rohan",
    venue_id: "ven-pierre",
    venue_name: "The Pierre",
    venue_city: "New York",
    venue_state: "NY",
    date: "2025-06-14",
    duration_days: 3,
    cover_image_url: "/images/portfolio/portrait/portrait-01.jpg",
    planner_id: "plan-radz",
    vendor_team: [
      { vendor_id: "plan-radz", category: "planner", name: "Radz Events", handle: "@radzevents" },
      { vendor_id: "vendor-namrata-soni", category: "hmua", name: "Namrata Soni", handle: "@namratasoni" },
      { vendor_id: "vendor-joseph-radhik", category: "photography", name: "Stories by Joseph Radhik", handle: "@storiesbyjosephradhik" },
    ],
  },
];

const NAMRATA_DESTINATIONS: DestinationEntry[] = [
  { city: "Dubai", country: "UAE", region: "Middle East", wedding_count: 3 },
  { city: "Bali", country: "Indonesia", region: "Southeast Asia", wedding_count: 2 },
  { city: "Udaipur", country: "India", region: "India", wedding_count: 8 },
];

const NAMRATA_REVIEWS: CoupleReview[] = [
  {
    id: "rev-ns-1",
    rating: 5,
    body: "Namrata is worth every penny. The makeup lasted all three days and looked flawless in every photo. The airbrush finish is the real deal.",
    couple_names: "Ria & Karan",
    date: "2025-10-01",
    venue_name: "The Pierre",
    verified: true,
    helpful_count: 41,
  },
];

const NAMRATA_ENDORSEMENTS: PlannerEndorsement[] = [
  {
    id: "end-ns-1",
    planner_id: "plan-radz",
    planner_name: "Urvashi",
    planner_company: "Radz Events",
    body: "Namrata's studio is my gold standard. Communicative, punctual, and the signature liner is something no one else can match.",
    wedding_count: 14,
  },
];

// ── Aurora Studios (portal tenant) ──────────────────────────────────────────

const AURORA_DESTINATIONS: DestinationEntry[] = [
  { city: "Udaipur", country: "India", region: "India", wedding_count: 5 },
  { city: "London", country: "United Kingdom", region: "Europe", wedding_count: 2 },
  { city: "Dubai", country: "UAE", region: "Middle East", wedding_count: 1 },
];

const AURORA_REVIEWS: CoupleReview[] = [
  {
    id: "rev-aurora-anjali",
    rating: 5,
    body: "Priya has the calm of someone who's seen a hundred weddings and the eye of someone seeing one for the first time. Creative framing, incredibly responsive, and our haldi frames still make my mother cry.",
    couple_names: "Anjali & Rahul",
    date: "2026-04-01",
    venue_name: "Grand Hyatt, Mumbai",
    verified: true,
    helpful_count: 28,
  },
  {
    id: "rev-aurora-devika",
    rating: 5,
    body: "Editorial without being cold. We wanted the Vogue cover feel without losing warmth. Aurora Studios nailed it — the candid moments land harder than the posed ones.",
    couple_names: "Devika & Sameer",
    date: "2026-02-20",
    venue_name: "Oberoi Udaivilas, Udaipur",
    verified: true,
    helpful_count: 22,
    is_destination: true,
    destination_location: "Udaipur, India",
  },
];

const AURORA_ENDORSEMENTS: PlannerEndorsement[] = [
  {
    id: "end-aurora-coral",
    planner_id: "plan-coral-dune",
    planner_name: "Devika",
    planner_company: "Coral & Dune Events",
    body: "Priya and her team are my default photographers for any slow, intimate wedding. They disappear and the frames still capture everything.",
    wedding_count: 9,
  },
];

// ── Rich profile registry ──────────────────────────────────────────────────

export const RICH_PROFILES: Record<string, RichProfile> = {
  "vendor-aurora-studios": {
    instagram_handle: "@aurorastudios",
    instagram_followers: 48200,
    services: [
      "Wedding Day Photography",
      "Pre-Wedding Shoots",
      "Editorial Albums",
      "Family Portraits",
    ],
    languages: ["English", "Hindi", "Marathi"],
    travel_fee_description:
      "Included in package for weddings within India; couple covers flights + accommodation for international.",
    passport_valid: true,
    destination_booking_lead_months: 8,
    preferred_regions: ["India", "Europe", "Middle East"],
    destinations: AURORA_DESTINATIONS,
    portfolio_posts: makePortfolioPosts("aurora-studios", 12),
    weddings: [],
    couple_reviews: AURORA_REVIEWS,
    planner_endorsements: AURORA_ENDORSEMENTS,
  },
  "vendor-joseph-radhik": {
    instagram_handle: "@storiesbyjosephradhik",
    instagram_followers: 312000,
    services: [
      "Wedding Day Photography",
      "Pre-Wedding Shoots",
      "Engagement Sessions",
      "Album Design",
    ],
    languages: ["English", "Hindi", "Telugu"],
    travel_fee_description:
      "Included in package for US destinations; couple covers flights + accommodation for international.",
    passport_valid: true,
    destination_booking_lead_months: 10,
    preferred_regions: ["Mexico / Caribbean", "Europe", "India"],
    destinations: JOSEPH_RADHIK_DESTINATIONS,
    portfolio_posts: makePortfolioPosts("joseph-radhik", 18),
    weddings: JOSEPH_RADHIK_WEDDINGS,
    couple_reviews: JOSEPH_RADHIK_REVIEWS,
    planner_endorsements: JOSEPH_RADHIK_ENDORSEMENTS,
  },
  "vendor-namrata-soni": {
    instagram_handle: "@namratasoni",
    instagram_followers: 485000,
    services: [
      "Bridal Makeup",
      "Hair Styling",
      "Pre-Wedding Looks",
      "Family Packages",
    ],
    languages: ["English", "Hindi", "Punjabi"],
    travel_fee_description:
      "Flat travel fee per artist + flights and accommodation covered by the couple. Day rates apply for multi-day events.",
    passport_valid: true,
    destination_booking_lead_months: 8,
    preferred_regions: ["Middle East", "Southeast Asia", "India"],
    destinations: NAMRATA_DESTINATIONS,
    portfolio_posts: makePortfolioPosts("namrata-soni", 14),
    weddings: NAMRATA_WEDDINGS,
    couple_reviews: NAMRATA_REVIEWS,
    planner_endorsements: NAMRATA_ENDORSEMENTS,
  },
};

// Apply the rich-profile patch to a vendor record if one exists for the id.
export function withRichProfile(vendor: Vendor): Vendor {
  const patch = RICH_PROFILES[vendor.id];
  if (!patch) return vendor;
  return { ...vendor, ...patch };
}
