// ── Discovery seed ────────────────────────────────────────────────────────
// Demo data for the /discovery showcase page. Constructs a diverse cast of
// vendors across the new sub-categories, with video metadata, style
// signatures, availability records, and shared wedding teams that exercise
// every primitive built for this feature.
//
// Images use Unsplash content-source URLs; videos are short public-domain
// loops from the same CDN. In production these would live alongside the
// unified vendor seed.

import type {
  Vendor,
  VendorCategory,
} from "@/types/vendor-unified";
import type {
  StyleSignature,
  SubcategoryId,
  VendorWithDiscovery,
  VideoMeta,
  VideoKind,
  AvailabilityRecord,
} from "@/types/vendor-discovery";
import { summarizeVideoProfile } from "./video-scoring";

const POSTER_URLS = [
  "https://images.unsplash.com/photo-1519741497674-611481863552?w=1200",
  "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1200",
  "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1200",
  "https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=1200",
  "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1200",
  "https://images.unsplash.com/photo-1529636798458-92182e662485?w=1200",
  "https://images.unsplash.com/photo-1525772764200-be829a350797?w=1200",
  "https://images.unsplash.com/photo-1465495976277-4387d4b0e4a6?w=1200",
  "https://images.unsplash.com/photo-1460723237483-7a6dc9d0b212?w=1200",
  "https://images.unsplash.com/photo-1507504031003-b417219a0fde?w=1200",
  "https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=1200",
  "https://images.unsplash.com/photo-1587271407850-8d438ca9fdf2?w=1200",
];

// Short public video loops (Google "Big Buck Bunny" sample is classic; using
// open sample videos commonly mirrored on learning CDNs).
const VIDEO_SRC =
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

function mkVideo(
  id: string,
  kind: VideoKind,
  title: string,
  posterIdx: number,
  opts: Partial<VideoMeta> = {},
): VideoMeta {
  return {
    id,
    kind,
    src_url: VIDEO_SRC,
    poster_url: POSTER_URLS[posterIdx % POSTER_URLS.length],
    duration_seconds: 62,
    aspect: "16:9",
    title,
    uploaded_at: "2026-01-12",
    views: 1240 + posterIdx * 180,
    play_through_rate: 0.58 + (posterIdx % 4) * 0.05,
    inquiries_from_video: 8 + (posterIdx % 5),
    ...opts,
  };
}

function mkAvailability(
  vendor_id: string,
  blackouts: Array<[string, string]>,
): AvailabilityRecord {
  return {
    vendor_id,
    source: "google",
    last_synced_at: "2026-04-20",
    blocked_ranges: blackouts.map(([start, end]) => ({ start, end })),
  };
}

interface MiniVendorInput {
  id: string;
  name: string;
  category: VendorCategory;
  subcategory_id: SubcategoryId;
  location: string;
  tier: "free" | "select";
  rating: number;
  review_count: number;
  wedding_count: number;
  price_band: "mid" | "premium" | "luxe";
  style_signature: StyleSignature;
  style_tags?: string[];
  has_video: "full" | "partial" | "none";
  blackouts?: Array<[string, string]>;
  response_time_hours?: number;
  coverIdx: number;
  plannerConnections?: Array<{ company: string; weddings: number }>;
  venueConnections?: Array<{ name: string; city: string; state: string; weddings: number }>;
}

// Shared wedding roster — used for the collaboration graph. Each entry
// lists vendor ids that shared a single wedding.
const SHARED_WEDDINGS: Array<{
  id: string;
  couple_names: string;
  venue_name: string;
  venue_city: string;
  venue_state: string;
  date: string;
  team_ids: string[];
}> = [
  {
    id: "w_leela_priya",
    couple_names: "Priya & Rohan",
    venue_name: "The Leela Palace Udaipur",
    venue_city: "Udaipur",
    venue_state: "Rajasthan",
    date: "2025-11-08",
    team_ids: ["photo_lumiere", "decor_ivory", "hmua_sana", "dj_karam"],
  },
  {
    id: "w_leela_meera",
    couple_names: "Meera & Arjun",
    venue_name: "The Leela Palace Udaipur",
    venue_city: "Udaipur",
    venue_state: "Rajasthan",
    date: "2025-02-21",
    team_ids: ["photo_lumiere", "decor_ivory", "caterer_rasa", "dhol_jatt"],
  },
  {
    id: "w_amba_nisha",
    couple_names: "Nisha & Dev",
    venue_name: "Taj Falaknuma",
    venue_city: "Hyderabad",
    venue_state: "Telangana",
    date: "2025-09-12",
    team_ids: ["photo_asha", "decor_florescence", "hmua_sana", "video_kinara"],
  },
  {
    id: "w_goa_anaya",
    couple_names: "Anaya & Vik",
    venue_name: "W Goa",
    venue_city: "Vagator",
    venue_state: "Goa",
    date: "2026-01-18",
    team_ids: ["photo_asha", "mehndi_anar", "dj_karam", "decor_ivory"],
  },
  {
    id: "w_leela_riya",
    couple_names: "Riya & Aman",
    venue_name: "The Leela Palace Udaipur",
    venue_city: "Udaipur",
    venue_state: "Rajasthan",
    date: "2024-12-02",
    team_ids: ["photo_lumiere", "hmua_sana", "decor_ivory", "video_kinara"],
  },
];

const INPUTS: MiniVendorInput[] = [
  // Photography / video
  {
    id: "photo_lumiere",
    name: "Lumière & Co. Photography",
    category: "photography",
    subcategory_id: "wedding_photography",
    location: "Udaipur · Mumbai",
    tier: "select",
    rating: 4.9,
    review_count: 124,
    wedding_count: 210,
    price_band: "luxe",
    style_signature: { tone: -0.7, era: 0.3, density: -0.1, scale: 0.4, palette: -0.4 },
    style_tags: ["Editorial", "Candid", "Cinematic"],
    has_video: "full",
    blackouts: [["2026-06-15", "2026-06-17"], ["2026-11-08", "2026-11-10"]],
    response_time_hours: 4,
    coverIdx: 0,
    plannerConnections: [{ company: "Radz Events", weddings: 9 }],
    venueConnections: [{ name: "The Leela Palace Udaipur", city: "Udaipur", state: "Rajasthan", weddings: 8 }],
  },
  {
    id: "photo_asha",
    name: "Asha Kapur Studio",
    category: "photography",
    subcategory_id: "wedding_photography",
    location: "Hyderabad",
    tier: "select",
    rating: 4.8,
    review_count: 86,
    wedding_count: 140,
    price_band: "premium",
    style_signature: { tone: 0.6, era: -0.2, density: 0.5, scale: 0.6, palette: 0.7 },
    style_tags: ["Bright & airy", "Documentary", "South Indian"],
    has_video: "full",
    blackouts: [["2026-10-24", "2026-10-26"]],
    response_time_hours: 6,
    coverIdx: 1,
    venueConnections: [{ name: "Taj Falaknuma", city: "Hyderabad", state: "Telangana", weddings: 6 }],
  },
  {
    id: "video_kinara",
    name: "Kinara Films",
    category: "photography",
    subcategory_id: "cinematic_videography",
    location: "Mumbai",
    tier: "select",
    rating: 4.9,
    review_count: 72,
    wedding_count: 95,
    price_band: "luxe",
    style_signature: { tone: -0.5, era: 0.6, density: 0.2, scale: 0.5, palette: -0.3 },
    style_tags: ["Cinematic", "Same-Day Edit", "Drone"],
    has_video: "full",
    response_time_hours: 3,
    coverIdx: 2,
    plannerConnections: [{ company: "Radz Events", weddings: 4 }],
  },
  {
    id: "drone_kite",
    name: "Kite & Frame Aerial",
    category: "photography",
    subcategory_id: "drone_photography",
    location: "Goa · Bangalore",
    tier: "free",
    rating: 4.7,
    review_count: 42,
    wedding_count: 58,
    price_band: "mid",
    style_signature: { tone: 0.4, era: 0.2, density: 0.0, scale: 0.6, palette: 0.2 },
    style_tags: ["Drone", "Landscape"],
    has_video: "partial",
    coverIdx: 3,
  },

  // Entertainment
  {
    id: "dj_karam",
    name: "DJ Karam",
    category: "entertainment",
    subcategory_id: "dj",
    location: "Mumbai",
    tier: "select",
    rating: 4.8,
    review_count: 180,
    wedding_count: 320,
    price_band: "premium",
    style_signature: { tone: 0.1, era: 0.3, density: 0.7, scale: 0.8, palette: 0.5 },
    style_tags: ["Bollywood", "Open-format", "Punjabi"],
    has_video: "full",
    coverIdx: 4,
    plannerConnections: [{ company: "Radz Events", weddings: 12 }],
  },
  {
    id: "dhol_jatt",
    name: "Jatt Dhol Collective",
    category: "entertainment",
    subcategory_id: "dhol_players",
    location: "Delhi",
    tier: "free",
    rating: 4.9,
    review_count: 64,
    wedding_count: 200,
    price_band: "mid",
    style_signature: { tone: -0.1, era: -0.6, density: 0.6, scale: 0.7, palette: 0.6 },
    style_tags: ["Punjabi", "Live"],
    has_video: "partial",
    coverIdx: 5,
  },
  {
    id: "band_velvet",
    name: "Velvet Groove Live Band",
    category: "entertainment",
    subcategory_id: "live_band",
    location: "Mumbai · Bangalore",
    tier: "select",
    rating: 4.7,
    review_count: 52,
    wedding_count: 70,
    price_band: "luxe",
    style_signature: { tone: -0.3, era: 0.7, density: 0.4, scale: 0.6, palette: 0.2 },
    style_tags: ["Jazz", "Fusion", "Live"],
    has_video: "full",
    coverIdx: 6,
  },

  // HMUA
  {
    id: "hmua_sana",
    name: "Sana Bhandari Artistry",
    category: "hmua",
    subcategory_id: "bridal_hmua",
    location: "Mumbai · Udaipur",
    tier: "select",
    rating: 4.9,
    review_count: 210,
    wedding_count: 340,
    price_band: "luxe",
    style_signature: { tone: 0.2, era: 0.1, density: 0.3, scale: 0.4, palette: 0.5 },
    style_tags: ["Airbrush", "Editorial", "Traditional"],
    has_video: "full",
    coverIdx: 7,
    plannerConnections: [{ company: "Radz Events", weddings: 14 }],
    venueConnections: [
      { name: "The Leela Palace Udaipur", city: "Udaipur", state: "Rajasthan", weddings: 11 },
    ],
  },
  {
    id: "mehndi_anar",
    name: "Anar Mehndi Atelier",
    category: "hmua",
    subcategory_id: "mehndi_artist",
    location: "Jaipur",
    tier: "free",
    rating: 4.8,
    review_count: 96,
    wedding_count: 260,
    price_band: "mid",
    style_signature: { tone: 0.0, era: -0.5, density: 0.8, scale: 0.2, palette: 0.6 },
    style_tags: ["Traditional", "Rajasthani"],
    has_video: "partial",
    coverIdx: 8,
  },
  {
    id: "turban_sikander",
    name: "Sikander Turban Studio",
    category: "hmua",
    subcategory_id: "turban_tying",
    location: "Amritsar · Delhi",
    tier: "free",
    rating: 4.9,
    review_count: 58,
    wedding_count: 160,
    price_band: "mid",
    style_signature: { tone: 0.0, era: -0.7, density: 0.2, scale: 0.3, palette: 0.4 },
    style_tags: ["Safa", "Sikh tradition"],
    has_video: "none",
    coverIdx: 9,
  },

  // Decor
  {
    id: "decor_ivory",
    name: "Ivory Atelier",
    category: "decor_florals",
    subcategory_id: "mandap_design",
    location: "Udaipur · Mumbai",
    tier: "select",
    rating: 4.8,
    review_count: 92,
    wedding_count: 180,
    price_band: "luxe",
    style_signature: { tone: 0.3, era: 0.2, density: -0.4, scale: 0.5, palette: -0.6 },
    style_tags: ["Minimalist", "Editorial"],
    has_video: "full",
    coverIdx: 10,
    plannerConnections: [{ company: "Radz Events", weddings: 10 }],
    venueConnections: [
      { name: "The Leela Palace Udaipur", city: "Udaipur", state: "Rajasthan", weddings: 7 },
    ],
  },
  {
    id: "decor_florescence",
    name: "Florescence Design Co.",
    category: "decor_florals",
    subcategory_id: "floral_design",
    location: "Bangalore · Hyderabad",
    tier: "select",
    rating: 4.7,
    review_count: 68,
    wedding_count: 120,
    price_band: "premium",
    style_signature: { tone: 0.5, era: 0.3, density: 0.8, scale: 0.4, palette: 0.8 },
    style_tags: ["Maximalist", "Floral-Heavy", "South Indian"],
    has_video: "full",
    coverIdx: 11,
  },

  // Catering
  {
    id: "caterer_rasa",
    name: "Rasa Kitchen",
    category: "catering",
    subcategory_id: "full_catering",
    location: "Jaipur · Udaipur",
    tier: "select",
    rating: 4.8,
    review_count: 140,
    wedding_count: 230,
    price_band: "premium",
    style_signature: { tone: 0.0, era: -0.4, density: 0.6, scale: 0.6, palette: 0.7 },
    style_tags: ["Multi-Cuisine", "North Indian", "Jain available"],
    has_video: "partial",
    coverIdx: 0,
    plannerConnections: [{ company: "Radz Events", weddings: 6 }],
  },
  {
    id: "bar_copper",
    name: "Copper Still Mixology",
    category: "catering",
    subcategory_id: "cocktail_bar",
    location: "Mumbai",
    tier: "free",
    rating: 4.6,
    review_count: 40,
    wedding_count: 65,
    price_band: "premium",
    style_signature: { tone: -0.4, era: 0.6, density: 0.2, scale: 0.3, palette: -0.2 },
    style_tags: ["Craft cocktails", "Fusion"],
    has_video: "none",
    coverIdx: 1,
  },
  {
    id: "chai_little",
    name: "Little Chai Cart",
    category: "catering",
    subcategory_id: "coffee_chai_cart",
    location: "Mumbai",
    tier: "free",
    rating: 4.9,
    review_count: 30,
    wedding_count: 80,
    price_band: "mid",
    style_signature: { tone: 0.4, era: -0.3, density: 0.3, scale: -0.2, palette: 0.3 },
    style_tags: ["Traditional", "Welcome moment"],
    has_video: "partial",
    coverIdx: 2,
  },

  // Wardrobe
  {
    id: "lehenga_kohl",
    name: "Kohl Couture",
    category: "wardrobe",
    subcategory_id: "bridal_lehenga",
    location: "Delhi",
    tier: "select",
    rating: 4.7,
    review_count: 76,
    wedding_count: 110,
    price_band: "luxe",
    style_signature: { tone: 0.2, era: -0.3, density: 0.9, scale: 0.5, palette: 0.9 },
    style_tags: ["Sabyasachi-inspired", "Maximalist"],
    has_video: "full",
    coverIdx: 3,
  },

  // Stationery
  {
    id: "stationery_indigo",
    name: "Indigo & Ink Studio",
    category: "stationery",
    subcategory_id: "physical_invitation",
    location: "Bangalore",
    tier: "free",
    rating: 4.8,
    review_count: 45,
    wedding_count: 140,
    price_band: "mid",
    style_signature: { tone: 0.3, era: 0.4, density: -0.3, scale: 0.0, palette: -0.4 },
    style_tags: ["Minimalist", "Letterpress"],
    has_video: "none",
    coverIdx: 4,
  },

  // Ceremony / planning
  {
    id: "pandit_shukla",
    name: "Pandit Shukla & Associates",
    category: "pandit_ceremony",
    subcategory_id: "pandit",
    location: "Delhi",
    tier: "free",
    rating: 4.9,
    review_count: 120,
    wedding_count: 480,
    price_band: "mid",
    style_signature: { tone: 0.1, era: -0.9, density: 0.3, scale: 0.2, palette: 0.5 },
    style_tags: ["Traditional"],
    has_video: "none",
    coverIdx: 5,
  },
];

function buildVideos(input: MiniVendorInput): VideoMeta[] {
  const videos: VideoMeta[] = [];
  if (input.has_video === "none") return videos;

  videos.push(
    mkVideo(`${input.id}_intro`, "intro", `Meet ${input.name}`, input.coverIdx, {
      duration_seconds: 72,
      aspect: "16:9",
    }),
  );
  if (input.has_video === "full") {
    videos.push(
      mkVideo(
        `${input.id}_reel1`,
        "portfolio",
        `${input.name} · Leela Palace`,
        input.coverIdx + 1,
        {
          venue_name: "The Leela Palace Udaipur",
          venue_city: "Udaipur",
          duration_seconds: 48,
          aspect: "9:16",
          wedding_style: ["Traditional", "Grand"],
        },
      ),
      mkVideo(
        `${input.id}_reel2`,
        "portfolio",
        `${input.name} · Taj Falaknuma`,
        input.coverIdx + 2,
        {
          venue_name: "Taj Falaknuma",
          venue_city: "Hyderabad",
          duration_seconds: 42,
          aspect: "9:16",
          wedding_style: ["Bright & airy", "Intimate"],
        },
      ),
      mkVideo(
        `${input.id}_test1`,
        "testimonial",
        `"Like no one else" — Riya & Aman`,
        input.coverIdx + 3,
        {
          couple_names: "Riya & Aman",
          duration_seconds: 38,
          aspect: "9:16",
        },
      ),
    );
  }
  return videos;
}

function toVendor(input: MiniVendorInput): VendorWithDiscovery {
  const videos = buildVideos(input);
  const weddings = SHARED_WEDDINGS.filter((w) => w.team_ids.includes(input.id)).map(
    (w) => ({
      id: w.id,
      couple_names: w.couple_names,
      venue_id: w.venue_name,
      venue_name: w.venue_name,
      venue_city: w.venue_city,
      venue_state: w.venue_state,
      date: w.date,
      duration_days: 3,
      cover_image_url: POSTER_URLS[(input.coverIdx + 4) % POSTER_URLS.length],
      vendor_team: w.team_ids
        .filter((id) => id !== input.id)
        .map((id) => {
          const other = INPUTS.find((x) => x.id === id);
          return {
            vendor_id: id,
            category: (other?.category ?? "photography") as VendorCategory,
            name: other?.name ?? id,
            handle: null,
          };
        }),
      planner_id: null,
    }),
  );

  const priceMap: Record<string, { type: "range"; min: number; max: number }> = {
    mid:     { type: "range", min: 150_000, max: 400_000 },
    premium: { type: "range", min: 400_000, max: 900_000 },
    luxe:    { type: "range", min: 900_000, max: 2_500_000 },
  };

  const base: Vendor = {
    id: input.id,
    slug: input.id,
    name: input.name,
    owner_name: input.name,
    category: input.category,
    tier: input.tier,
    is_verified: input.tier === "select",
    bio: "",
    tagline: input.style_tags?.[0] ?? "",
    location: input.location,
    travel_level: "nationwide",
    years_active: 7,
    team_size: 6,
    style_tags: input.style_tags ?? [],
    contact: {
      email: `hello@${input.id}.com`,
      phone: "",
      website: "",
      instagram: "",
    },
    cover_image: POSTER_URLS[input.coverIdx % POSTER_URLS.length],
    portfolio_images: [
      { url: POSTER_URLS[(input.coverIdx + 1) % POSTER_URLS.length], alt: "" },
      { url: POSTER_URLS[(input.coverIdx + 2) % POSTER_URLS.length], alt: "" },
      { url: POSTER_URLS[(input.coverIdx + 3) % POSTER_URLS.length], alt: "" },
    ],
    price_display: priceMap[input.price_band],
    currency: "INR",
    rating: input.rating,
    review_count: input.review_count,
    wedding_count: input.wedding_count,
    response_time_hours: input.response_time_hours ?? 12,
    profile_completeness: 0.9,
    created_at: "2022-01-01",
    updated_at: "2026-04-01",
    planner_connections: (input.plannerConnections ?? []).map((p) => ({
      planner_id: p.company,
      name: p.company,
      company: p.company,
      photo_url: null,
      wedding_count: p.weddings,
    })),
    venue_connections: (input.venueConnections ?? []).map((v) => ({
      venue_id: v.name,
      name: v.name,
      city: v.city,
      state: v.state,
      wedding_count: v.weddings,
    })),
    packages: [],
    weddings,
  };

  return {
    ...base,
    subcategory_id: input.subcategory_id,
    style_signature: input.style_signature,
    videos,
    video_profile: summarizeVideoProfile(videos),
    availability: input.blackouts ? mkAvailability(input.id, input.blackouts) : undefined,
  };
}

export const DISCOVERY_VENDORS: VendorWithDiscovery[] = INPUTS.map(toVendor);

export const DEMO_CONTEXT = {
  coupleNames: "Ananya & Kabir",
  venueName: "The Leela Palace Udaipur",
  venueCity: "Udaipur",
  plannerCompany: "Radz Events",
  weddingDate: "2026-11-09",
};
