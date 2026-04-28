// Mock data for the planner's public profile (Urvashi / Radz Events).
// Pulled in by /planner/profile (editor + live preview) and the
// "View as Couple" full-screen preview.

export type ServiceTier = {
  id: string;
  label: string;
  enabled: boolean;
  priceLow: number;
  priceHigh: number;
  includes: string;
};

export type CeremonyTypeKey =
  | "hindu-north"
  | "hindu-south"
  | "hindu-gujarati"
  | "hindu-bengali"
  | "sikh"
  | "muslim-sunni"
  | "muslim-shia"
  | "muslim-ismaili"
  | "christian"
  | "jain"
  | "interfaith";

export type CeremonyType = {
  key: CeremonyTypeKey;
  label: string;
  group: "Hindu" | "Sikh" | "Muslim" | "Other";
  selected: boolean;
};

export type DestinationRegionKey =
  | "mexico-caribbean"
  | "europe"
  | "india"
  | "southeast-asia"
  | "middle-east"
  | "africa";

export type DestinationRegion = {
  key: DestinationRegionKey;
  label: string;
  selected: boolean;
};

export type TravelRadius = "local" | "regional" | "nationwide" | "international";

export type CredentialEntry = {
  id: string;
  kind: "press" | "award" | "certification";
  label: string;
  year?: string;
};

export type PortfolioPhoto = {
  id: string;
  caption: string;
  // palette tokens so we can render visual placeholders without real images
  swatch: string;
  accent: string;
};

export type WeddingHistoryCard = {
  id: string;
  coupleNames: string;
  date: string;
  venue: string;
  location: string;
  vendors: number;
  palette: string[];
  headline: string;
};

export type VenueWorked = {
  id: string;
  name: string;
  location: string;
  weddingsHosted: number;
};

export type CoupleReview = {
  id: string;
  couple: string;
  weddingDate: string;
  rating: number;
  headline: string;
  body: string;
};

export type ProfileData = {
  photoMonogram: string;
  companyName: string;
  plannerName: string;
  tagline: string;
  instagramHandle: string;
  bio: string;
  services: ServiceTier[];
  baseLocation: string;
  travelRadius: TravelRadius;
  destinationRegions: DestinationRegion[];
  languages: string[];
  yearsExperience: number;
  weddingsPlanned: number;
  credentials: CredentialEntry[];
  ceremonyTypes: CeremonyType[];
  portfolio: PortfolioPhoto[];
  weddingHistory: WeddingHistoryCard[];
  venuesWorked: VenueWorked[];
  reviews: CoupleReview[];
  stats: { vendors: number; rating: number; reviewCount: number };
};

export const DEFAULT_PROFILE: ProfileData = {
  photoMonogram: "UM",
  companyName: "Radz Events",
  plannerName: "Urvashi Menon",
  tagline:
    "Crafting unforgettable South Asian celebrations across the East Coast",
  instagramHandle: "@radzevents",
  bio:
    "I've spent the last eight years designing weddings that feel unmistakably you — the kind your guests still talk about years later. My studio is small, deliberately. I only take on twelve couples a year so every detail gets my full attention, from the first chai-and-spreadsheet planning session to the last sparkler send-off.\n\nMy roots are Gujarati and my weddings carry that warmth — long family lunches, loud dance floors, food your nani would approve of — but I design for every tradition: the sparse elegance of a South Indian muhurtham, the riot of color at a Sikh anand karaj, the quiet gravity of an interfaith ceremony that honors two families at once.\n\nI work best with couples who know what they want the day to *feel* like, even if they don't yet know what it should look like. I'll handle the rest.",
  services: [
    {
      id: "full-service",
      label: "Full-service planning",
      enabled: true,
      priceLow: 8000,
      priceHigh: 15000,
      includes:
        "End-to-end design, vendor sourcing, budget management, day-of coordination across all events.",
    },
    {
      id: "partial",
      label: "Partial planning",
      enabled: true,
      priceLow: 4500,
      priceHigh: 7500,
      includes:
        "Design direction, shortlisted vendor recommendations, timeline, day-of coordination. You handle direct vendor contracts.",
    },
    {
      id: "day-of",
      label: "Day-of coordination",
      enabled: true,
      priceLow: 2500,
      priceHigh: 4000,
      includes:
        "Timeline build, vendor run-of-show, on-site coordination for all wedding events.",
    },
    {
      id: "destination",
      label: "Destination wedding specialist",
      enabled: true,
      priceLow: 12000,
      priceHigh: 22000,
      includes:
        "Full-service planning with destination vendor sourcing, guest travel coordination, and on-site production at your chosen location.",
    },
    {
      id: "month-of",
      label: "Month-of coordination",
      enabled: false,
      priceLow: 3200,
      priceHigh: 4800,
      includes:
        "Starts 30 days out. Final vendor confirmations, timeline finalization, rehearsal + day-of coordination.",
    },
  ],
  baseLocation: "Edison, NJ",
  travelRadius: "nationwide",
  destinationRegions: [
    { key: "mexico-caribbean", label: "Mexico & Caribbean", selected: true },
    { key: "europe", label: "Europe", selected: true },
    { key: "india", label: "India", selected: true },
    { key: "southeast-asia", label: "Southeast Asia", selected: false },
    { key: "middle-east", label: "Middle East", selected: false },
    { key: "africa", label: "Africa", selected: false },
  ],
  languages: ["English", "Hindi", "Gujarati"],
  yearsExperience: 8,
  weddingsPlanned: 120,
  credentials: [
    { id: "c1", kind: "press", label: "Featured in Maharani Weddings", year: "2024" },
    { id: "c2", kind: "press", label: "PartySlate Editor's Pick", year: "2025" },
    { id: "c3", kind: "press", label: "The Knot — South Asian Spotlight", year: "2023" },
    { id: "c4", kind: "award", label: "WeddingWire Couples' Choice", year: "2024" },
    { id: "c5", kind: "award", label: "Brides.com Best of New Jersey", year: "2025" },
    { id: "c6", kind: "certification", label: "Certified Wedding Planner (CWP)" },
  ],
  ceremonyTypes: [
    { key: "hindu-north", label: "Hindu — North Indian", group: "Hindu", selected: true },
    { key: "hindu-south", label: "Hindu — South Indian", group: "Hindu", selected: false },
    { key: "hindu-gujarati", label: "Hindu — Gujarati", group: "Hindu", selected: true },
    { key: "hindu-bengali", label: "Hindu — Bengali", group: "Hindu", selected: false },
    { key: "sikh", label: "Sikh (Anand Karaj)", group: "Sikh", selected: true },
    { key: "muslim-sunni", label: "Muslim — Sunni", group: "Muslim", selected: false },
    { key: "muslim-shia", label: "Muslim — Shia", group: "Muslim", selected: false },
    { key: "muslim-ismaili", label: "Muslim — Ismaili", group: "Muslim", selected: false },
    { key: "christian", label: "Christian", group: "Other", selected: false },
    { key: "jain", label: "Jain", group: "Other", selected: false },
    { key: "interfaith", label: "Interfaith / Fusion", group: "Other", selected: true },
  ],
  portfolio: [
    { id: "p1", caption: "Priya & Arjun — sangeet mandap in saffron & marigold", swatch: "#F1C27D", accent: "#C0392B" },
    { id: "p2", caption: "Meher & Ishaan — anand karaj under white orchids", swatch: "#F4F0E9", accent: "#C4A265" },
    { id: "p3", caption: "Sanya & Rohan — Oheka Castle reception", swatch: "#6E4423", accent: "#F1C27D" },
    { id: "p4", caption: "Divya & Karan — Tulum beach pheras at sunset", swatch: "#E9A06B", accent: "#2E5E4E" },
    { id: "p5", caption: "Aanya & Veer — Gujarati pithi in the garden", swatch: "#F2D16B", accent: "#9B2335" },
    { id: "p6", caption: "Riya & Arnav — reception tablescape with heirloom china", swatch: "#E8D5D0", accent: "#8B4513" },
    { id: "p7", caption: "Neha & Vikram — baraat entry at Oheka", swatch: "#8B4513", accent: "#E8D5D0" },
    { id: "p8", caption: "Tara & Samir — mehndi night fairy lights", swatch: "#C98BA7", accent: "#F5E6D0" },
    { id: "p9", caption: "Anya & Dev — interfaith ceremony in Vermont", swatch: "#2E5E4E", accent: "#EAD3B0" },
    { id: "p10", caption: "Pooja & Neel — destination Riviera Maya", swatch: "#6BA5A7", accent: "#F1C27D" },
    { id: "p11", caption: "Isha & Rahul — Udaipur palace haldi", swatch: "#E1A832", accent: "#5A3A1A" },
    { id: "p12", caption: "Shreya & Ravi — candlelit sangeet in NYC", swatch: "#3D2B4E", accent: "#C4A265" },
  ],
  weddingHistory: [
    {
      id: "h1",
      coupleNames: "Meher & Ishaan",
      date: "Aug 2026",
      venue: "The Plaza",
      location: "New York, NY",
      vendors: 21,
      palette: ["#F4F0E9", "#C4A265", "#2C2C2C"],
      headline: "A quiet anand karaj and a riot of a reception — 380 guests.",
    },
    {
      id: "h2",
      coupleNames: "Divya & Karan",
      date: "Jun 2026",
      venue: "Rosewood Mayakoba",
      location: "Riviera Maya, Mexico",
      vendors: 18,
      palette: ["#E9A06B", "#2E5E4E", "#F1C27D"],
      headline: "Four days in Tulum. Beach pheras, cenote cocktails, a jungle reception.",
    },
    {
      id: "h3",
      coupleNames: "Aanya & Veer",
      date: "May 2026",
      venue: "The Legacy Castle",
      location: "Pompton Plains, NJ",
      vendors: 24,
      palette: ["#F2D16B", "#9B2335", "#2C2C2C"],
      headline: "A full Gujarati wedding — pithi, sangeet, wedding, reception. 500 guests.",
    },
  ],
  venuesWorked: [
    { id: "v1", name: "The Legacy Castle", location: "Pompton Plains, NJ", weddingsHosted: 14 },
    { id: "v2", name: "Oheka Castle", location: "Huntington, NY", weddingsHosted: 9 },
    { id: "v3", name: "The Plaza", location: "New York, NY", weddingsHosted: 6 },
    { id: "v4", name: "Park Chateau", location: "East Brunswick, NJ", weddingsHosted: 11 },
    { id: "v5", name: "Rosewood Mayakoba", location: "Riviera Maya, MX", weddingsHosted: 4 },
    { id: "v6", name: "The Rockleigh", location: "Rockleigh, NJ", weddingsHosted: 8 },
    { id: "v7", name: "Ashford Estate", location: "Allentown, NJ", weddingsHosted: 5 },
    { id: "v8", name: "Tarrytown House Estate", location: "Tarrytown, NY", weddingsHosted: 4 },
  ],
  reviews: [
    {
      id: "r1",
      couple: "Meher & Ishaan",
      weddingDate: "Aug 2026",
      rating: 5,
      headline: "She made us feel like her only couple.",
      body:
        "Urvashi took on a wedding that had two religions, three cities, and four very opinionated parents. She translated our mess into a weekend our guests still haven't stopped texting us about. She pushed back when we were wrong, pushed forward when we were scared, and handled six vendor escalations we never even knew happened.",
    },
    {
      id: "r2",
      couple: "Divya & Karan",
      weddingDate: "Jun 2026",
      rating: 5,
      headline: "Destination weddings are supposed to be stressful.",
      body:
        "We're in SF. The wedding was in Mexico. Urvashi ran the whole thing — vendors, logistics, our 140 guests flying in from three continents. We showed up, got married, danced for four days, and came home. That is the whole review.",
    },
    {
      id: "r3",
      couple: "Aanya & Veer",
      weddingDate: "May 2026",
      rating: 5,
      headline: "Worth every rupee.",
      body:
        "500 guests, five events, one Urvashi. My mom and my mother-in-law both adore her, which is its own kind of miracle. She knows every vendor in the tri-state area and she's not afraid to fight for her couples. The week of the wedding she essentially became part of our family.",
    },
    {
      id: "r4",
      couple: "Riya & Arnav",
      weddingDate: "Mar 2026",
      rating: 5,
      headline: "Calm in a hurricane.",
      body:
        "Our venue cancelled twelve weeks out. Urvashi had us re-booked, re-contracted, and re-designed inside ten days without us losing a single vendor. The new venue actually ended up being better. This is the only person I'd trust with a wedding.",
    },
    {
      id: "r5",
      couple: "Tara & Samir",
      weddingDate: "Feb 2026",
      rating: 4,
      headline: "Fantastic planner, small mismatch on music.",
      body:
        "Urvashi nailed the design, the vendor team, the logistics. The one hiccup was a miscommunication with the DJ about our sangeet playlist — resolved before the event but we noticed it in the rehearsal. Everything else was exceptional.",
    },
  ],
  stats: { vendors: 142, rating: 4.9, reviewCount: 38 },
};

export const TRAVEL_RADIUS_LABEL: Record<TravelRadius, string> = {
  local: "Local (within 50 miles)",
  regional: "Regional (tri-state area)",
  nationwide: "Nationwide",
  international: "International / Destination",
};

export const SUGGESTED_LANGUAGES = [
  "English",
  "Hindi",
  "Gujarati",
  "Punjabi",
  "Tamil",
  "Telugu",
  "Bengali",
  "Marathi",
  "Urdu",
  "Malayalam",
  "Kannada",
  "Spanish",
  "French",
];
