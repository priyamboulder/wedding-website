// Mock data for the Ananya venue dashboard.
// Today is pinned for a deterministic demo: 2026-10-03 (matches the planner seed
// so cross-portal links read consistently).

export const VENUE_TODAY = new Date("2026-10-03");

export type CeremonyType =
  | "Hindu"
  | "Sikh"
  | "Muslim"
  | "Jain"
  | "Christian"
  | "Interfaith"
  | "Fusion";

export type InquirySource =
  | "Ananya Search"
  | "Ananya AI Recommendation"
  | "Planner Referral"
  | "Vendor Recommendation"
  | "Direct";

export type UpcomingWedding = {
  id: string;
  coupleNames: string;
  daysAway: number;
  dateRange: string;
  guestCount: number;
  duration: string;
  ceremonyType: CeremonyType;
  plannerName?: string;
  plannerLead?: string;
  plannerHref?: string;
  events: { name: string; day?: string }[];
  spaces: string[];
  vendorsBooked: number;
  vendorsTotal: number;
};

export type Inquiry = {
  id: string;
  status: "new" | "read";
  receivedLabel: string; // e.g. "2 hours ago"
  coupleNames: string;
  estimatedDate: string; // e.g. "Mar 2027"
  guestCount: number;
  ceremonyType: CeremonyType;
  duration: string;
  source: InquirySource;
  sourceDetail?: string; // e.g. planner name for referrals
  budget?: string;
  notes?: string[]; // small chips, e.g. "Looking at 2 other venues"
  browsed: { count: number; descriptor: string };
};

export type SourceShare = {
  label: string;
  count: number;
};

export type ShowcaseView = {
  id: string;
  coupleNames: string;
  ceremonyType: CeremonyType;
  views: number;
};

export type AvailabilityDay = "open" | "booked" | "hold";

export type AvailabilityMonth = {
  monthLabel: string;
  year: number;
  monthIndex: number; // 0-11
  daysInMonth: number;
  startWeekday: number; // 0=Sun .. 6=Sat (first day of month)
  status: Record<number, AvailabilityDay>;
};

export type TrendStat = {
  label: string;
  value: number | string;
  delta: number; // +/- vs last month
};

export const VENUE = {
  name: "The Legacy Castle",
  city: "Pompton Plains",
  region: "New Jersey",
  managedBy: "Stoneriver Hospitality",
  logoInitials: "LC",
  notifications: 5,
  // Hero photo — wide editorial shot from a real wedding at this property
  heroImageUrl:
    "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=2400&q=80",
};

export const VENUE_STATS = {
  totalWeddings: 47,
  totalWeddingsSub: "from Instagram data + direct bookings",
  upcomingBooked: 8,
  upcomingNext: "Oct 15 (Priya & Arjun)",
  inquiriesThisMonth: 12,
  inquiriesDelta: 4, // vs last month
  estimatedRevenue: "$2.4M",
  estimatedRevenueSub: "from 14 booked weddings",
  estimatedYear: 2026,
  profileViews: 1847,
  profileViewsSub: "342 unique couples browsing",
};

export const UPCOMING_WEDDINGS: UpcomingWedding[] = [
  {
    id: "priya-arjun",
    coupleNames: "Priya & Arjun",
    daysAway: 12,
    dateRange: "Oct 15-17, 2026",
    guestCount: 425,
    duration: "3-day",
    ceremonyType: "Hindu",
    plannerName: "Radz Events",
    plannerLead: "Urvashi Menon",
    plannerHref: "/planner",
    events: [
      { name: "Sangeet", day: "Fri" },
      { name: "Mehndi", day: "Sat AM" },
      { name: "Ceremony", day: "Sat PM" },
      { name: "Reception", day: "Sat Eve" },
      { name: "Farewell Brunch", day: "Sun" },
    ],
    spaces: ["Grand Ballroom", "Garden Terrace", "Courtyard"],
    vendorsBooked: 18,
    vendorsTotal: 22,
  },
  {
    id: "sarah-mike",
    coupleNames: "Sarah & Mike",
    daysAway: 19,
    dateRange: "Oct 22, 2026",
    guestCount: 180,
    duration: "1-day",
    ceremonyType: "Interfaith",
    events: [{ name: "Ceremony" }, { name: "Reception" }],
    spaces: ["Garden Terrace", "Indoor Pavilion"],
    vendorsBooked: 12,
    vendorsTotal: 14,
  },
  {
    id: "neha-vikram",
    coupleNames: "Neha & Vikram",
    daysAway: 24,
    dateRange: "Nov 8-10, 2026",
    guestCount: 350,
    duration: "3-day",
    ceremonyType: "Hindu",
    plannerName: "CG & Co Events",
    plannerLead: "Chirag Gupta",
    plannerHref: "/planner",
    events: [
      { name: "Sangeet" },
      { name: "Haldi" },
      { name: "Ceremony" },
      { name: "Reception" },
    ],
    spaces: ["Grand Ballroom", "Garden Terrace"],
    vendorsBooked: 15,
    vendorsTotal: 19,
  },
];

export const RECENT_INQUIRIES: Inquiry[] = [
  {
    id: "simran-dev",
    status: "new",
    receivedLabel: "2 hours ago",
    coupleNames: "Simran & Dev",
    estimatedDate: "Mar 2027",
    guestCount: 400,
    ceremonyType: "Hindu",
    duration: "3-day",
    source: "Ananya AI Recommendation",
    budget: "$300K+",
    notes: ["Looking at 2 other venues"],
    browsed: { count: 5, descriptor: "Hindu, 400+ guests" },
  },
  {
    id: "meera-karan",
    status: "new",
    receivedLabel: "1 day ago",
    coupleNames: "Meera & Karan",
    estimatedDate: "Jun 2027",
    guestCount: 200,
    ceremonyType: "Fusion",
    duration: "2-day",
    source: "Planner Referral",
    sourceDetail: "Radz Events",
    budget: "$350K",
    notes: ["✈ Couple based in California"],
    browsed: { count: 3, descriptor: "Fusion, outdoor ceremony" },
  },
  {
    id: "anika-sam",
    status: "read",
    receivedLabel: "3 days ago",
    coupleNames: "Anika & Sam",
    estimatedDate: "Aug 2027",
    guestCount: 300,
    ceremonyType: "Sikh",
    duration: "2-day",
    source: "Ananya Search",
    budget: "$250K",
    browsed: { count: 4, descriptor: "Sikh ceremonies" },
  },
];

export const MONTHLY_TRENDS: TrendStat[] = [
  { label: "Inquiries", value: 12, delta: 4 },
  { label: "Tours Booked", value: 7, delta: 2 },
  { label: "Proposals Sent", value: 5, delta: 1 },
  { label: "Bookings Closed", value: 2, delta: -1 },
];

export const INQUIRY_SOURCES: SourceShare[] = [
  { label: "Ananya Search", count: 18 },
  { label: "Planner Referral", count: 11 },
  { label: "AI Recommendation", count: 7 },
  { label: "Direct", count: 4 },
];

export const TOP_SHOWCASES: ShowcaseView[] = [
  { id: "priya-arjun-2026", coupleNames: "Priya & Arjun", ceremonyType: "Hindu", views: 412 },
  { id: "rhea-anand-2025", coupleNames: "Rhea & Anand", ceremonyType: "Hindu", views: 318 },
  { id: "kiran-jaspreet-2025", coupleNames: "Kiran & Jaspreet", ceremonyType: "Sikh", views: 264 },
  { id: "tara-omar-2025", coupleNames: "Tara & Omar", ceremonyType: "Fusion", views: 197 },
];

// Six-month availability snapshot starting at VENUE_TODAY's month (Oct 2026).
// Booked dates align with the upcoming weddings above; a few holds and many open dates fill the rest.
export const AVAILABILITY: AvailabilityMonth[] = [
  buildMonth(2026, 9, { booked: [15, 16, 17, 22], hold: [29, 30] }), // Oct 2026
  buildMonth(2026, 10, { booked: [8, 9, 10], hold: [14, 21] }), // Nov 2026
  buildMonth(2026, 11, { booked: [5, 12, 19, 31], hold: [26] }), // Dec 2026
  buildMonth(2027, 0, { booked: [16, 23], hold: [9] }), // Jan 2027
  buildMonth(2027, 1, { booked: [13, 20], hold: [6, 27] }), // Feb 2027
  buildMonth(2027, 2, { booked: [6, 13, 20, 27], hold: [21] }), // Mar 2027
];

function buildMonth(
  year: number,
  monthIndex: number,
  marks: { booked: number[]; hold: number[] }
): AvailabilityMonth {
  const first = new Date(year, monthIndex, 1);
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const status: Record<number, AvailabilityDay> = {};
  for (let d = 1; d <= daysInMonth; d++) status[d] = "open";
  for (const d of marks.booked) status[d] = "booked";
  for (const d of marks.hold) status[d] = "hold";
  return {
    monthLabel: first.toLocaleString("en-US", { month: "short" }),
    year,
    monthIndex,
    daysInMonth,
    startWeekday: first.getDay(),
    status,
  };
}

/* ================================================================== */
/*  Wedding Showcase — the venue's portfolio of real weddings.        */
/* ================================================================== */

export type WeddingSetup = "indoor" | "outdoor" | "both" | "tent";
export type WeddingSeason = "spring" | "summer" | "fall" | "winter";
export type WeddingDuration = "1-day" | "2-day" | "3-day+";

export type ShowcaseVendorCategory =
  | "planner"
  | "photography"
  | "videography"
  | "decor"
  | "catering"
  | "dj"
  | "hmua"
  | "mehndi"
  | "priest"
  | "choreography"
  | "lighting"
  | "stationery"
  | "transportation"
  | "photo-booth"
  | "dhol"
  | "cake"
  | "rentals"
  | "emcee";

export const VENDOR_CATEGORY_META: Record<
  ShowcaseVendorCategory,
  { icon: string; label: string }
> = {
  planner: { icon: "📋", label: "Planner" },
  photography: { icon: "📷", label: "Photography" },
  videography: { icon: "🎬", label: "Videography" },
  decor: { icon: "🎨", label: "Decor & Florals" },
  catering: { icon: "🍽", label: "Catering" },
  dj: { icon: "🎵", label: "DJ" },
  hmua: { icon: "💄", label: "HMUA" },
  mehndi: { icon: "🌿", label: "Mehndi" },
  priest: { icon: "🙏", label: "Officiant" },
  choreography: { icon: "💃", label: "Choreography" },
  lighting: { icon: "💡", label: "Lighting" },
  stationery: { icon: "✉", label: "Stationery" },
  transportation: { icon: "🚗", label: "Transportation" },
  "photo-booth": { icon: "📸", label: "Photo Booth" },
  dhol: { icon: "🥁", label: "Dhol" },
  cake: { icon: "🎂", label: "Cake" },
  rentals: { icon: "🪑", label: "Rentals" },
  emcee: { icon: "🎤", label: "Emcee" },
};

export type ShowcaseVendor = {
  category: ShowcaseVendorCategory;
  name: string;
  badge?: "select" | "verified";
  href?: string;
};

export type ShowcaseEventItem = {
  name: string;
  space: string;
};

export type ShowcaseEventDay = {
  label: string; // "Day 1 (Fri)"
  items: ShowcaseEventItem[];
};

export type ShowcaseWedding = {
  id: string;
  coupleNames: string; // fallback title lives here when real names aren't known
  fallbackTitle?: string; // used when caption parsing never recovered names
  dateRange: string; // "Oct 15-17, 2025"
  month: string; // "October 2025"
  year: number;
  ceremonyType: CeremonyType;
  ceremonyDetail?: string; // e.g. "(Gujarati)", "(South Indian)"
  duration: WeddingDuration;
  guestCount: number;
  setup: WeddingSetup;
  season: WeddingSeason;
  photoCount: number;
  heroImageUrl: string;
  plannerName: string;
  plannerHref?: string;
  vendors: ShowcaseVendor[]; // full team — card shows top ~5, detail view shows all
  featured?: boolean;
  spaces: string[]; // venue spaces used
  events?: ShowcaseEventDay[]; // full multi-day breakdown (detail view)
  photoGallery?: string[]; // full gallery for detail view
  views?: number; // sort-by-most-viewed
  sortDate: string; // ISO for sort-by-most-recent
};

const IMG = (id: string, opts = "w=1600&q=80") =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&${opts}`;

const PRIYA_ARJUN_VENDORS: ShowcaseVendor[] = [
  { category: "planner", name: "Radz Events (Urvashi)", href: "/planner" },
  { category: "photography", name: "Stories by Joseph Radhik", badge: "select", href: "/vendors" },
  { category: "videography", name: "Cinema Studio", badge: "verified", href: "/vendors" },
  { category: "decor", name: "Elegant Affairs", badge: "select", href: "/vendors" },
  { category: "catering", name: "Mughal Mahal Catering", href: "/vendors" },
  { category: "dj", name: "DJ Riz", badge: "select", href: "/vendors" },
  { category: "hmua", name: "Glam by Meena", badge: "verified", href: "/vendors" },
  { category: "mehndi", name: "Henna by Priya", href: "/vendors" },
  { category: "priest", name: "Pandit Sharma", href: "/vendors" },
  { category: "choreography", name: "Bollywood Beats", href: "/vendors" },
  { category: "lighting", name: "Luminary Events", badge: "select", href: "/vendors" },
  { category: "stationery", name: "Ananya Shop", href: "/vendors" },
  { category: "transportation", name: "Royal Baraat", href: "/vendors" },
  { category: "photo-booth", name: "SnapStation", href: "/vendors" },
  { category: "dhol", name: "Punjab Beats", href: "/vendors" },
  { category: "cake", name: "Sweet Layers", href: "/vendors" },
  { category: "rentals", name: "Grand Event Rentals", href: "/vendors" },
  { category: "emcee", name: "Raj Entertainz", href: "/vendors" },
];

const PRIYA_ARJUN_GALLERY: string[] = [
  IMG("1519741497674-611481863552"),
  IMG("1519225421980-715cb0215aed"),
  IMG("1511285560929-80b456fea0bc"),
  IMG("1469371670807-013ccf25f16a"),
  IMG("1522413452208-996ff3f3e740"),
  IMG("1465495976277-4387d4b0b4c6"),
  IMG("1464366400600-7168b8af9bc3"),
  IMG("1525772764200-be829a350797"),
  IMG("1606800052052-a08af7148866"),
  IMG("1511795409834-ef04bbd61622"),
  IMG("1507152832244-10d45c7eda7d"),
  IMG("1512578499122-4a01b1b56dd0"),
  IMG("1537907510278-10acdb198d0f"),
  IMG("1508070201320-15d7a6b64b87"),
  IMG("1519671482749-fd09be7ccebf"),
  IMG("1519741497674-611481863552"),
  IMG("1511795409834-ef04bbd61622"),
  IMG("1469371670807-013ccf25f16a"),
  IMG("1525772764200-be829a350797"),
  IMG("1522413452208-996ff3f3e740"),
  IMG("1525258946800-98cfd641d0de"),
  IMG("1513278974582-3e1b4a4fa21e"),
  IMG("1515934751635-c81c6bc9a2d8"),
  IMG("1583089892943-e02e5b017b6a"),
];

export const SHOWCASE_WEDDINGS: ShowcaseWedding[] = [
  {
    id: "priya-arjun",
    coupleNames: "Priya & Arjun",
    dateRange: "Oct 15-17, 2025",
    month: "October 2025",
    year: 2025,
    sortDate: "2025-10-15",
    ceremonyType: "Hindu",
    duration: "3-day+",
    guestCount: 425,
    setup: "both",
    season: "fall",
    photoCount: 24,
    heroImageUrl: IMG("1519741497674-611481863552"),
    plannerName: "Radz Events",
    plannerHref: "/planner",
    vendors: PRIYA_ARJUN_VENDORS,
    featured: true,
    views: 412,
    spaces: ["Grand Ballroom", "Garden Terrace", "Courtyard", "Indoor Pavilion"],
    events: [
      {
        label: "Day 1 (Fri)",
        items: [{ name: "Sangeet", space: "Grand Ballroom" }],
      },
      {
        label: "Day 2 (Sat)",
        items: [
          { name: "Mehndi", space: "Courtyard" },
          { name: "Haldi", space: "Garden Terrace" },
          { name: "Ceremony", space: "Garden Terrace" },
          { name: "Reception", space: "Grand Ballroom" },
        ],
      },
      {
        label: "Day 3 (Sun)",
        items: [{ name: "Farewell Brunch", space: "Indoor Pavilion" }],
      },
    ],
    photoGallery: PRIYA_ARJUN_GALLERY,
  },
  {
    id: "sana-omar",
    coupleNames: "Sana & Omar",
    dateRange: "Sep 20-21, 2025",
    month: "September 2025",
    year: 2025,
    sortDate: "2025-09-20",
    ceremonyType: "Muslim",
    duration: "2-day",
    guestCount: 300,
    setup: "both",
    season: "fall",
    photoCount: 18,
    heroImageUrl: IMG("1465495976277-4387d4b0b4c6"),
    plannerName: "CG & Co Events",
    plannerHref: "/planner",
    featured: true,
    views: 276,
    spaces: ["Garden Terrace", "Grand Ballroom"],
    vendors: [
      { category: "planner", name: "CG & Co Events", href: "/planner" },
      { category: "photography", name: "The Wedding Salad", badge: "select", href: "/vendors" },
      { category: "decor", name: "Design House Decor", href: "/vendors" },
      { category: "catering", name: "Saffron Kitchen", href: "/vendors" },
      { category: "dj", name: "Zenith Entertainment", href: "/vendors" },
      { category: "hmua", name: "Bridal by Farah", badge: "verified", href: "/vendors" },
      { category: "videography", name: "Frame Forty", href: "/vendors" },
      { category: "mehndi", name: "Henna Haus", href: "/vendors" },
      { category: "stationery", name: "Ananya Shop", href: "/vendors" },
      { category: "lighting", name: "Luminary Events", href: "/vendors" },
      { category: "rentals", name: "Grand Event Rentals", href: "/vendors" },
    ],
  },
  {
    id: "jasleen-harpreet",
    coupleNames: "Jasleen & Harpreet",
    dateRange: "Aug 8-9, 2025",
    month: "August 2025",
    year: 2025,
    sortDate: "2025-08-08",
    ceremonyType: "Sikh",
    duration: "2-day",
    guestCount: 280,
    setup: "indoor",
    season: "summer",
    photoCount: 22,
    heroImageUrl: IMG("1519225421980-715cb0215aed"),
    plannerName: "Kismet Planners",
    plannerHref: "/planner",
    views: 198,
    spaces: ["Grand Ballroom", "Indoor Pavilion"],
    vendors: [
      { category: "planner", name: "Kismet Planners", href: "/planner" },
      { category: "photography", name: "Morvi Images", badge: "select", href: "/vendors" },
      { category: "decor", name: "Karma Decor", href: "/vendors" },
      { category: "catering", name: "Royal Punjab Catering", href: "/vendors" },
      { category: "dj", name: "DJ Jaggi", href: "/vendors" },
      { category: "hmua", name: "Glam by Meena", badge: "verified", href: "/vendors" },
      { category: "priest", name: "Bhai Sahib Ji", href: "/vendors" },
      { category: "dhol", name: "Punjab Beats", href: "/vendors" },
    ],
  },
  {
    id: "maya-james",
    coupleNames: "Maya & James",
    dateRange: "Jul 12, 2025",
    month: "July 2025",
    year: 2025,
    sortDate: "2025-07-12",
    ceremonyType: "Fusion",
    duration: "1-day",
    guestCount: 180,
    setup: "both",
    season: "summer",
    photoCount: 16,
    heroImageUrl: IMG("1464366400600-7168b8af9bc3"),
    plannerName: "Curated by Claire",
    plannerHref: "/planner",
    views: 164,
    spaces: ["Garden Terrace", "Grand Ballroom"],
    vendors: [
      { category: "planner", name: "Curated by Claire", href: "/planner" },
      { category: "photography", name: "Olive & Ivy Studio", badge: "verified", href: "/vendors" },
      { category: "decor", name: "Fern & Frond", href: "/vendors" },
      { category: "catering", name: "Masala & Mint", href: "/vendors" },
      { category: "dj", name: "DJ Riz", badge: "select", href: "/vendors" },
      { category: "hmua", name: "Atelier Beauty", href: "/vendors" },
      { category: "cake", name: "Sweet Layers", href: "/vendors" },
    ],
  },
  {
    id: "deepa-kunal",
    coupleNames: "Deepa & Kunal",
    dateRange: "Jun 6-8, 2025",
    month: "June 2025",
    year: 2025,
    sortDate: "2025-06-06",
    ceremonyType: "Hindu",
    ceremonyDetail: "(Gujarati)",
    duration: "3-day+",
    guestCount: 500,
    setup: "indoor",
    season: "summer",
    photoCount: 30,
    heroImageUrl: IMG("1525772764200-be829a350797"),
    plannerName: "Marigold Weddings",
    plannerHref: "/planner",
    views: 287,
    spaces: ["Grand Ballroom", "Indoor Pavilion", "Courtyard"],
    vendors: [
      { category: "planner", name: "Marigold Weddings", href: "/planner" },
      { category: "photography", name: "Canvas & Candle", badge: "select", href: "/vendors" },
      { category: "videography", name: "Reel Affairs", href: "/vendors" },
      { category: "decor", name: "Rangoli Designs", badge: "select", href: "/vendors" },
      { category: "catering", name: "Gujarat Thaal Co.", href: "/vendors" },
      { category: "dj", name: "DJ Karma", href: "/vendors" },
      { category: "hmua", name: "Kohl Studio", badge: "verified", href: "/vendors" },
      { category: "priest", name: "Pandit Mehta", href: "/vendors" },
      { category: "dhol", name: "Dhol Patrol", href: "/vendors" },
      { category: "choreography", name: "Garba Nights", href: "/vendors" },
    ],
  },
  {
    id: "fatima-ali",
    coupleNames: "Fatima & Ali",
    dateRange: "May 18, 2025",
    month: "May 2025",
    year: 2025,
    sortDate: "2025-05-18",
    ceremonyType: "Muslim",
    duration: "1-day",
    guestCount: 250,
    setup: "indoor",
    season: "spring",
    photoCount: 14,
    heroImageUrl: IMG("1511795409834-ef04bbd61622"),
    plannerName: "House of Luxe",
    plannerHref: "/planner",
    views: 121,
    spaces: ["Grand Ballroom"],
    vendors: [
      { category: "planner", name: "House of Luxe", href: "/planner" },
      { category: "photography", name: "Luna Ray Photography", href: "/vendors" },
      { category: "decor", name: "Noor Design Studio", badge: "select", href: "/vendors" },
      { category: "catering", name: "Bayt Catering", href: "/vendors" },
      { category: "dj", name: "Zenith Entertainment", href: "/vendors" },
      { category: "hmua", name: "Bridal by Farah", badge: "verified", href: "/vendors" },
    ],
  },
  {
    id: "anya-ryan",
    coupleNames: "Anya & Ryan",
    dateRange: "Apr 26, 2025",
    month: "April 2025",
    year: 2025,
    sortDate: "2025-04-26",
    ceremonyType: "Interfaith",
    duration: "1-day",
    guestCount: 150,
    setup: "outdoor",
    season: "spring",
    photoCount: 12,
    heroImageUrl: IMG("1469371670807-013ccf25f16a"),
    plannerName: "The Wedding Atelier",
    plannerHref: "/planner",
    views: 103,
    spaces: ["Garden Terrace", "Courtyard"],
    vendors: [
      { category: "planner", name: "The Wedding Atelier", href: "/planner" },
      { category: "photography", name: "Olive & Ivy Studio", badge: "verified", href: "/vendors" },
      { category: "decor", name: "Fern & Frond", href: "/vendors" },
      { category: "catering", name: "Harvest Table Co.", href: "/vendors" },
      { category: "dj", name: "DJ Fable", href: "/vendors" },
      { category: "hmua", name: "Atelier Beauty", href: "/vendors" },
      { category: "cake", name: "Buttercream Lane", href: "/vendors" },
    ],
  },
  {
    id: "pooja-amit",
    coupleNames: "Pooja & Amit",
    dateRange: "Mar 14-15, 2025",
    month: "March 2025",
    year: 2025,
    sortDate: "2025-03-14",
    ceremonyType: "Hindu",
    ceremonyDetail: "(South Indian)",
    duration: "2-day",
    guestCount: 350,
    setup: "indoor",
    season: "spring",
    photoCount: 20,
    heroImageUrl: IMG("1522413452208-996ff3f3e740"),
    plannerName: "Radz Events",
    plannerHref: "/planner",
    views: 176,
    spaces: ["Grand Ballroom", "Indoor Pavilion"],
    vendors: [
      { category: "planner", name: "Radz Events", href: "/planner" },
      { category: "photography", name: "Stories by Joseph Radhik", badge: "select", href: "/vendors" },
      { category: "decor", name: "Kanchi Decor", href: "/vendors" },
      { category: "catering", name: "Chettinad Kitchen", href: "/vendors" },
      { category: "dj", name: "Nadaswaram Live", href: "/vendors" },
      { category: "hmua", name: "Glam by Meena", badge: "verified", href: "/vendors" },
      { category: "priest", name: "Pandit Iyer", href: "/vendors" },
      { category: "choreography", name: "Bharatanatyam Collective", href: "/vendors" },
    ],
  },
];
