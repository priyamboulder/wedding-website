import type {
  VendorProfile,
  VendorWedding,
  PlannerConnection,
  VenueConnection,
  CoupleReview,
  PlannerEndorsement,
  PortfolioPost,
  VendorProfileExtras,
  WeddingVendorReference,
} from "@/types/vendor-profile";

// ── Shared planner + venue registry ─────────────────────────────────────────
// Centralized so planner/venue cards link to consistent IDs across vendors.

const PLANNERS: Record<string, Omit<PlannerConnection, "wedding_count">> = {
  "plan-radz": {
    planner_id: "plan-radz",
    name: "Urvashi",
    company: "Radz Events",
    photo_url: null,
  },
  "plan-cgco": {
    planner_id: "plan-cgco",
    name: "Christine",
    company: "CG & Co Events",
    photo_url: null,
  },
  "plan-chandai": {
    planner_id: "plan-chandai",
    name: "Chandai",
    company: "Chandai Events",
    photo_url: null,
  },
  "plan-devika": {
    planner_id: "plan-devika",
    name: "Devika",
    company: "Devika Narain & Co",
    photo_url: null,
  },
};

const VENUES: Record<string, Omit<VenueConnection, "wedding_count">> = {
  "ven-legacy": {
    venue_id: "ven-legacy",
    name: "The Legacy Castle",
    city: "Pompton Plains",
    state: "NJ",
  },
  "ven-oheka": {
    venue_id: "ven-oheka",
    name: "Oheka Castle",
    city: "Huntington",
    state: "NY",
  },
  "ven-pierre": {
    venue_id: "ven-pierre",
    name: "The Pierre",
    city: "New York",
    state: "NY",
  },
  "ven-hyatt": {
    venue_id: "ven-hyatt",
    name: "Hyatt Regency",
    city: "Jersey City",
    state: "NJ",
  },
  "ven-pleasantdale": {
    venue_id: "ven-pleasantdale",
    name: "Pleasantdale Chateau",
    city: "West Orange",
    state: "NJ",
  },
  "ven-taj-palace": {
    venue_id: "ven-taj-palace",
    name: "Taj Falaknuma Palace",
    city: "Hyderabad",
    state: "Telangana",
  },
};

function planner(id: keyof typeof PLANNERS, count: number): PlannerConnection {
  return { ...PLANNERS[id], wedding_count: count };
}

function venue(id: keyof typeof VENUES, count: number): VenueConnection {
  return { ...VENUES[id], wedding_count: count };
}

// ── Portfolio generator — real wedding photo feed ──────────────────────────

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

function makePortfolio(vendorSeed: string, count: number): PortfolioPost[] {
  const posts: PortfolioPost[] = [];
  // Use vendorSeed string length as offset so different vendors get different starting photos
  const offset = vendorSeed.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  for (let i = 0; i < count; i++) {
    const photo = PORTFOLIO_POOL[(offset + i) % PORTFOLIO_POOL.length];
    posts.push({
      id: `post-${vendorSeed}-${i}`,
      image_url: photo,
      caption: "",
      posted_at: new Date(Date.now() - i * 14 * 24 * 60 * 60 * 1000).toISOString(),
      is_video: i % 7 === 3,
      wedding_id: null,
      venue_id: null,
      permalink: null,
    });
  }
  return posts;
}

// ── Featured vendor profiles ────────────────────────────────────────────────

// Stories by Joseph Radhik — flagship profile with the richest data.
const JOSEPH_RADHIK_WEDDINGS: VendorWedding[] = [
  // Cancun destination wedding — the hero example for the spec.
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
      { vendor_id: "ven-ph-01", category: "photography", name: "Stories by Joseph Radhik", handle: "@storiesbyjosephradhik", traveled: true, home_base: "NYC" },
      { vendor_id: "vend-decor-tropical", category: "decor_florals", name: "Tropical Decor MX", handle: "@tropicaldecormx", traveled: false, home_base: "Cancun" },
      { vendor_id: "vend-ent-djriz", category: "entertainment", name: "DJ Riz", handle: "@djriz", traveled: true, home_base: "NJ" },
      { vendor_id: "vend-mua-meena", category: "hmua", name: "Glam by Meena", handle: "@glambymeena", traveled: true, home_base: "NYC" },
    ],
  },
  // Tuscany destination wedding — the "pure magic" review quote in the card.
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
      { vendor_id: "ven-ph-01", category: "photography", name: "Stories by Joseph Radhik", handle: "@storiesbyjosephradhik", traveled: true, home_base: "NYC" },
      { vendor_id: "vend-florence-florals", category: "decor_florals", name: "Florence Florals", handle: "@florenceflorals", traveled: false, home_base: "Florence" },
      { vendor_id: "ven-mua-02", category: "hmua", name: "Savleen Manchanda", handle: "@savleenmakeup", traveled: true, home_base: "Delhi" },
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
      { vendor_id: "ven-ph-01", category: "photography", name: "Stories by Joseph Radhik", handle: "@storiesbyjosephradhik" },
      { vendor_id: "ven-dec-02", category: "decor_florals", name: "Elegant Affairs", handle: "@elegantaffairs" },
      { vendor_id: "vend-ent-djriz", category: "entertainment", name: "DJ Riz", handle: "@djriz" },
      { vendor_id: "ven-mua-01", category: "hmua", name: "Glam by Meena", handle: "@glambymeena" },
      { vendor_id: "vend-florals-petal", category: "decor_florals", name: "Petal & Bloom", handle: "@petalandbloom" },
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
      { vendor_id: "ven-ph-01", category: "photography", name: "Stories by Joseph Radhik", handle: "@storiesbyjosephradhik" },
      { vendor_id: "ven-mua-01", category: "hmua", name: "Namrata Soni", handle: "@namratasoni" },
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
      { vendor_id: "ven-ph-01", category: "photography", name: "Stories by Joseph Radhik", handle: "@storiesbyjosephradhik" },
      { vendor_id: "ven-dec-03", category: "decor_florals", name: "Foliage Studio", handle: "@foliagestudio" },
    ],
  },
];

const JOSEPH_RADHIK_PROFILE: VendorProfile = {
  vendor_id: "ven-ph-01",
  extras: {
    instagram_handle: "@storiesbyjosephradhik",
    instagram_followers: 312000,
    services: [
      "Wedding Day Photography",
      "Pre-Wedding Shoots",
      "Engagement Sessions",
      "Album Design",
    ],
    travel_radius: "worldwide",
    languages: ["English", "Hindi", "Telugu"],
    team_size: "3-5 photographers",
    response_time_hours: 24,
    weddings_count: 47,
    planners_count: 12,
    avg_response_time: "within 24 hours",
    destinations: [
      { city: "Cancun", country: "Mexico", region: "Mexico / Caribbean", wedding_count: 4 },
      { city: "Tuscany", country: "Italy", region: "Europe", wedding_count: 2 },
      { city: "Udaipur", country: "India", region: "India", wedding_count: 3 },
      { city: "Montego Bay", country: "Jamaica", region: "Mexico / Caribbean", wedding_count: 1 },
      { city: "Cabo San Lucas", country: "Mexico", region: "Mexico / Caribbean", wedding_count: 2 },
    ],
    preferred_regions: ["Mexico / Caribbean", "Europe", "India"],
    travel_fee_description:
      "Included in package for US destinations; couple covers flights + accommodation for international.",
    passport_valid: true,
    destination_booking_lead_months: 10,
  },
  portfolio: makePortfolio("joseph-radhik", 18),
  weddings: JOSEPH_RADHIK_WEDDINGS,
  planners: [
    planner("plan-radz", 12),
    planner("plan-cgco", 8),
    planner("plan-chandai", 5),
    planner("plan-devika", 3),
  ],
  venues: [
    venue("ven-legacy", 8),
    venue("ven-oheka", 5),
    venue("ven-pierre", 4),
    venue("ven-hyatt", 3),
    venue("ven-pleasantdale", 2),
  ],
  couple_reviews: [
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
  ],
  planner_endorsements: [
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
  ],
};

// Namrata Soni — HMUA flagship profile
const NAMRATA_PROFILE: VendorProfile = {
  vendor_id: "ven-mua-01",
  extras: {
    instagram_handle: "@namratasoni",
    instagram_followers: 485000,
    services: [
      "Bridal Makeup",
      "Hair Styling",
      "Pre-Wedding Looks",
      "Family Packages",
    ],
    travel_radius: "worldwide",
    languages: ["English", "Hindi", "Punjabi"],
    team_size: "2-3 artists",
    response_time_hours: 48,
    weddings_count: 210,
    planners_count: 18,
    avg_response_time: "within 2 days",
    destinations: [
      { city: "Dubai", country: "UAE", region: "Middle East", wedding_count: 3 },
      { city: "Bali", country: "Indonesia", region: "Southeast Asia", wedding_count: 2 },
      { city: "Udaipur", country: "India", region: "India", wedding_count: 8 },
    ],
    preferred_regions: ["Middle East", "Southeast Asia", "India"],
    travel_fee_description:
      "Flat travel fee per artist + flights and accommodation covered by the couple. Day rates apply for multi-day events.",
    passport_valid: true,
    destination_booking_lead_months: 8,
  },
  portfolio: makePortfolio("namrata", 14),
  weddings: [
    {
      id: "wed-anika-rohan",
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
        { vendor_id: "ven-mua-01", category: "hmua", name: "Namrata Soni", handle: "@namratasoni" },
        { vendor_id: "ven-ph-01", category: "photography", name: "Stories by Joseph Radhik", handle: "@storiesbyjosephradhik" },
      ],
    },
  ],
  planners: [
    planner("plan-radz", 14),
    planner("plan-devika", 9),
    planner("plan-cgco", 6),
  ],
  venues: [
    venue("ven-taj-palace", 11),
    venue("ven-legacy", 4),
    venue("ven-oheka", 3),
  ],
  couple_reviews: [
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
  ],
  planner_endorsements: [
    {
      id: "end-ns-1",
      planner_id: "plan-radz",
      planner_name: "Urvashi",
      planner_company: "Radz Events",
      body: "Namrata's studio is my gold standard. Communicative, punctual, and the signature liner is something no one else can match.",
      wedding_count: 14,
    },
  ],
};

// ── Default extras used for any vendor without a seeded profile ─────────────

const DEFAULT_EXTRAS: VendorProfileExtras = {
  instagram_handle: null,
  instagram_followers: null,
  services: [],
  travel_radius: null,
  languages: [],
  team_size: null,
  response_time_hours: null,
  weddings_count: null,
  planners_count: null,
  avg_response_time: null,
  destinations: [],
  preferred_regions: [],
  travel_fee_description: null,
  passport_valid: null,
  destination_booking_lead_months: null,
};

const PROFILES: Record<string, VendorProfile> = {
  [JOSEPH_RADHIK_PROFILE.vendor_id]: JOSEPH_RADHIK_PROFILE,
  [NAMRATA_PROFILE.vendor_id]: NAMRATA_PROFILE,
};

export function getVendorProfile(vendorId: string): VendorProfile {
  const seeded = PROFILES[vendorId];
  if (seeded) return seeded;
  return {
    vendor_id: vendorId,
    extras: DEFAULT_EXTRAS,
    portfolio: makePortfolio(vendorId, 9),
    weddings: [],
    planners: [],
    venues: [],
    couple_reviews: [],
    planner_endorsements: [],
  };
}

export const SEED_VENDOR_PROFILES = PROFILES;

// Also re-export the shared registries so other components (wedding cards,
// planner detail sheets) can resolve the canonical name for a given ID.
export const PLANNER_REGISTRY = PLANNERS;
export const VENUE_REGISTRY = VENUES;

// ── Wedding team resolution ────────────────────────────────────────────────
// Given a wedding vendor reference, turn it into a display label suitable
// for the vendor team roster with an icon/emoji.

export function categoryIcon(cat: WeddingVendorReference["category"]): string {
  switch (cat) {
    case "photography": return "📷";
    case "hmua": return "💄";
    case "decor_florals": return "🌺";
    case "catering": return "🍽";
    case "entertainment": return "🎵";
    case "wardrobe": return "👗";
    case "stationery": return "✉️";
    case "pandit_ceremony": return "🕉";
    case "planner": return "📋";
    case "venue": return "🏛";
    default: return "•";
  }
}

export function categoryRoleLabel(
  cat: WeddingVendorReference["category"],
): string {
  switch (cat) {
    case "photography": return "Photo";
    case "hmua": return "HMUA";
    case "decor_florals": return "Decor";
    case "catering": return "Catering";
    case "entertainment": return "DJ";
    case "wardrobe": return "Wardrobe";
    case "stationery": return "Stationery";
    case "pandit_ceremony": return "Officiant";
    case "planner": return "Planner";
    case "venue": return "Venue";
    default: return "";
  }
}
