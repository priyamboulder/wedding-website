// Wedding detail mock data for the planner's Vendor Matrix view.
// Keyed by wedding id, so /planner/weddings/[id] can load deterministic fixtures.

export type VendorStatus =
  | "booked"
  | "contracted"
  | "in-conversation"
  | "shortlisted"
  | "recommended"
  | "ordered"
  | "open";

export type WeddingEvent =
  | "Sangeet"
  | "Mehndi"
  | "Haldi"
  | "Ceremony"
  | "Reception";

export type BookedVendor = {
  name: string;
  photoInitials: string;
  rating: number;
  instagram?: string;
  location: string;
  workedTogether?: number; // times worked together
  depositDue?: string;
  finalDue?: string;
  signedOn?: string;
  lastMessage?: string;
  documents?: { label: string; kind: "contract" | "proposal" | "moodboard" }[];
};

export type WeddingVendorRow = {
  id: string;
  icon: string;
  category: string;
  vendor?: BookedVendor;
  status: VendorStatus;
  /** Displayed budget (committed dollars) or estimate if open. */
  budget: number;
  isEstimated: boolean;
  /** events × vendors matrix: each event is ✓ (needed), ○ (not needed), or booked. */
  events: Partial<Record<WeddingEvent, "needed" | "optional" | "none">>;
};

export type RosterVendor = {
  name: string;
  location: string;
  rating: number;
  priceRange: string;
  timesWorkedTogether: number;
  note?: string;
};

export type AiRecommendation = {
  name: string;
  location: string;
  rating: number;
  priceRange: string;
  why: string;
};

export type WeddingDetail = {
  id: string;
  coupleNames: string;
  weddingDates: string;
  primaryDate: string;
  venue: string;
  location: string;
  destination?: boolean;
  guestCount: number;
  budgetRangeLabel: string;
  budgetMin: number;
  budgetMax: number;
  events: WeddingEvent[];
  vendors: WeddingVendorRow[];
};

// ── Priya & Arjun (the wedding shown in the spec) ───────────────────────────

const E_ALL: Partial<Record<WeddingEvent, "needed" | "optional" | "none">> = {
  Sangeet: "needed",
  Mehndi: "needed",
  Haldi: "needed",
  Ceremony: "needed",
  Reception: "needed",
};

const PRIYA_ARJUN: WeddingDetail = {
  id: "priya-arjun",
  coupleNames: "Priya & Arjun",
  weddingDates: "October 15–17, 2026",
  primaryDate: "2026-10-15",
  venue: "The Legacy Castle",
  location: "Pompton Plains, NJ",
  guestCount: 425,
  budgetRangeLabel: "$270K–$505K",
  budgetMin: 270000,
  budgetMax: 505000,
  events: ["Sangeet", "Mehndi", "Haldi", "Ceremony", "Reception"],
  vendors: [
    {
      id: "photography",
      icon: "📷",
      category: "Photography",
      status: "booked",
      budget: 18000,
      isEstimated: false,
      events: E_ALL,
      vendor: {
        name: "Stories by Joseph Radhik",
        photoInitials: "JR",
        rating: 4.9,
        instagram: "@josephradhik",
        location: "Mumbai, IN",
        workedTogether: 11,
        signedOn: "Feb 4, 2026",
        depositDue: "Paid Feb 6",
        finalDue: "Oct 1, 2026",
        lastMessage: "Sent prelim shot list for Sangeet — awaiting couple review.",
        documents: [
          { label: "Contract_StoriesByJR.pdf", kind: "contract" },
          { label: "Proposal_v3.pdf", kind: "proposal" },
        ],
      },
    },
    {
      id: "videography",
      icon: "🎬",
      category: "Videography",
      status: "booked",
      budget: 12000,
      isEstimated: false,
      events: E_ALL,
      vendor: {
        name: "Cinema Studio",
        photoInitials: "CS",
        rating: 4.8,
        instagram: "@cinemastudioweddings",
        location: "Jersey City, NJ",
        workedTogether: 4,
        signedOn: "Feb 11, 2026",
        depositDue: "Paid Feb 12",
        finalDue: "Oct 8, 2026",
      },
    },
    {
      id: "decor",
      icon: "🎨",
      category: "Decor & Florals",
      status: "contracted",
      budget: 65000,
      isEstimated: false,
      events: { Sangeet: "needed", Mehndi: "needed", Haldi: "optional", Ceremony: "needed", Reception: "needed" },
      vendor: {
        name: "Elegant Affairs",
        photoInitials: "EA",
        rating: 4.7,
        instagram: "@elegantaffairsnyc",
        location: "Edison, NJ",
        workedTogether: 8,
        signedOn: "Mar 22, 2026",
        depositDue: "Due Apr 25, 2026",
        finalDue: "Oct 1, 2026",
        lastMessage: "Revised mandap renders attached. Deposit invoice goes out tomorrow.",
        documents: [
          { label: "Contract_ElegantAffairs.pdf", kind: "contract" },
          { label: "Mandap_Moodboard.pdf", kind: "moodboard" },
          { label: "Proposal_v2.pdf", kind: "proposal" },
        ],
      },
    },
    {
      id: "catering",
      icon: "🍽",
      category: "Catering",
      status: "booked",
      budget: 45000,
      isEstimated: false,
      events: { Sangeet: "needed", Mehndi: "needed", Haldi: "optional", Ceremony: "optional", Reception: "needed" },
      vendor: {
        name: "Mughal Mahal",
        photoInitials: "MM",
        rating: 4.8,
        instagram: "@mughalmahalcatering",
        location: "Iselin, NJ",
        workedTogether: 14,
        signedOn: "Jan 18, 2026",
        depositDue: "Paid Jan 20",
        finalDue: "Oct 5, 2026",
      },
    },
    {
      id: "dj",
      icon: "🎵",
      category: "DJ",
      status: "booked",
      budget: 8000,
      isEstimated: false,
      events: { Sangeet: "needed", Mehndi: "optional", Haldi: "optional", Ceremony: "optional", Reception: "needed" },
      vendor: {
        name: "DJ Riz",
        photoInitials: "DR",
        rating: 4.9,
        instagram: "@djriz",
        location: "New York, NY",
        workedTogether: 9,
        signedOn: "Feb 19, 2026",
      },
    },
    {
      id: "hmua",
      icon: "💄",
      category: "HMUA",
      status: "booked",
      budget: 4500,
      isEstimated: false,
      events: E_ALL,
      vendor: {
        name: "Glam by Meena",
        photoInitials: "GM",
        rating: 4.9,
        instagram: "@glambymeena",
        location: "Parsippany, NJ",
        workedTogether: 7,
      },
    },
    {
      id: "mehndi",
      icon: "🌿",
      category: "Mehndi",
      status: "open",
      budget: 2000,
      isEstimated: true,
      events: { Sangeet: "optional", Mehndi: "needed", Haldi: "optional", Ceremony: "optional", Reception: "optional" },
    },
    {
      id: "priest",
      icon: "🙏",
      category: "Priest",
      status: "booked",
      budget: 1500,
      isEstimated: false,
      events: { Sangeet: "optional", Mehndi: "optional", Haldi: "optional", Ceremony: "needed", Reception: "optional" },
      vendor: {
        name: "Pandit Sharma",
        photoInitials: "PS",
        rating: 5.0,
        location: "Edison, NJ",
        workedTogether: 12,
      },
    },
    {
      id: "choreography",
      icon: "💃",
      category: "Choreography",
      status: "booked",
      budget: 3000,
      isEstimated: false,
      events: { Sangeet: "needed", Mehndi: "optional", Haldi: "optional", Ceremony: "optional", Reception: "optional" },
      vendor: {
        name: "Bollywood Beats",
        photoInitials: "BB",
        rating: 4.7,
        instagram: "@bollywoodbeatsnj",
        location: "Secaucus, NJ",
        workedTogether: 3,
      },
    },
    {
      id: "lighting",
      icon: "💡",
      category: "Lighting",
      status: "open",
      budget: 8000,
      isEstimated: true,
      events: { Sangeet: "needed", Mehndi: "optional", Haldi: "optional", Ceremony: "optional", Reception: "needed" },
    },
    {
      id: "stationery",
      icon: "✉",
      category: "Stationery",
      status: "ordered",
      budget: 3200,
      isEstimated: false,
      events: { Sangeet: "optional", Mehndi: "optional", Haldi: "optional", Ceremony: "needed", Reception: "needed" },
      vendor: {
        name: "Ananya Shop",
        photoInitials: "AS",
        rating: 4.9,
        instagram: "@ananya.stationery",
        location: "Online",
        workedTogether: 22,
      },
    },
    {
      id: "transportation",
      icon: "🚗",
      category: "Transportation",
      status: "booked",
      budget: 2500,
      isEstimated: false,
      events: { Sangeet: "optional", Mehndi: "optional", Haldi: "optional", Ceremony: "needed", Reception: "needed" },
      vendor: {
        name: "Royal Baraat",
        photoInitials: "RB",
        rating: 4.6,
        location: "Paterson, NJ",
        workedTogether: 5,
      },
    },
    {
      id: "photo-booth",
      icon: "📸",
      category: "Photo Booth",
      status: "open",
      budget: 2000,
      isEstimated: true,
      events: { Sangeet: "needed", Mehndi: "optional", Haldi: "optional", Ceremony: "optional", Reception: "needed" },
    },
    {
      id: "dhol",
      icon: "🥁",
      category: "Dhol / Baraat",
      status: "open",
      budget: 1500,
      isEstimated: true,
      events: { Sangeet: "optional", Mehndi: "optional", Haldi: "optional", Ceremony: "needed", Reception: "optional" },
    },
    {
      id: "cake",
      icon: "🎂",
      category: "Cake & Desserts",
      status: "booked",
      budget: 2800,
      isEstimated: false,
      events: { Sangeet: "optional", Mehndi: "optional", Haldi: "optional", Ceremony: "optional", Reception: "needed" },
      vendor: {
        name: "Sweet Layers",
        photoInitials: "SL",
        rating: 4.8,
        instagram: "@sweetlayersnj",
        location: "Montclair, NJ",
        workedTogether: 2,
      },
    },
    {
      id: "rentals",
      icon: "🪑",
      category: "Rentals",
      status: "booked",
      budget: 7500,
      isEstimated: false,
      events: { Sangeet: "needed", Mehndi: "needed", Haldi: "optional", Ceremony: "needed", Reception: "needed" },
      vendor: {
        name: "Grand Event Rentals",
        photoInitials: "GE",
        rating: 4.7,
        location: "Newark, NJ",
        workedTogether: 10,
      },
    },
    {
      id: "sound-av",
      icon: "🔊",
      category: "Sound / AV",
      status: "booked",
      budget: 3500,
      isEstimated: false,
      events: { Sangeet: "needed", Mehndi: "optional", Haldi: "optional", Ceremony: "needed", Reception: "needed" },
      vendor: {
        name: "Castle AV Team",
        photoInitials: "CA",
        rating: 4.5,
        location: "Pompton Plains, NJ",
        workedTogether: 6,
      },
    },
    {
      id: "groom-styling",
      icon: "👔",
      category: "Groom Styling",
      status: "booked",
      budget: 2200,
      isEstimated: false,
      events: E_ALL,
      vendor: {
        name: "Bespoke by Arjun",
        photoInitials: "BA",
        rating: 4.8,
        location: "NYC / Mumbai",
        workedTogether: 1,
      },
    },
    {
      id: "bridal-styling",
      icon: "👗",
      category: "Bridal Styling",
      status: "booked",
      budget: 15000,
      isEstimated: false,
      events: E_ALL,
      vendor: {
        name: "Tarun Tahiliani",
        photoInitials: "TT",
        rating: 5.0,
        instagram: "@taruntahiliani",
        location: "Delhi, IN",
        workedTogether: 2,
      },
    },
    {
      id: "emcee",
      icon: "🎤",
      category: "Emcee / Host",
      status: "booked",
      budget: 2500,
      isEstimated: false,
      events: { Sangeet: "needed", Mehndi: "optional", Haldi: "optional", Ceremony: "optional", Reception: "needed" },
      vendor: {
        name: "Raj Entertainz",
        photoInitials: "RE",
        rating: 4.6,
        location: "Iselin, NJ",
        workedTogether: 4,
      },
    },
    {
      id: "security",
      icon: "🛡",
      category: "Security",
      status: "booked",
      budget: 1800,
      isEstimated: false,
      events: { Sangeet: "needed", Mehndi: "optional", Haldi: "optional", Ceremony: "needed", Reception: "needed" },
      vendor: {
        name: "Premier Security",
        photoInitials: "PR",
        rating: 4.4,
        location: "Clifton, NJ",
        workedTogether: 3,
      },
    },
    {
      id: "valet",
      icon: "🚙",
      category: "Valet",
      status: "booked",
      budget: 1200,
      isEstimated: false,
      events: { Sangeet: "optional", Mehndi: "optional", Haldi: "optional", Ceremony: "needed", Reception: "needed" },
      vendor: {
        name: "Valley Valet",
        photoInitials: "VV",
        rating: 4.5,
        location: "Pompton Plains, NJ",
        workedTogether: 2,
      },
    },
  ],
};

export const WEDDING_DETAILS: Record<string, WeddingDetail> = {
  "priya-arjun": PRIYA_ARJUN,
};

export function getWeddingDetail(id: string): WeddingDetail | undefined {
  return WEDDING_DETAILS[id];
}

// ── Fill-category fixtures (Mehndi is the category shown expanded) ──────────

export const ROSTER_BY_CATEGORY: Record<string, RosterVendor[]> = {
  mehndi: [
    {
      name: "Henna by Priya",
      location: "Edison, NJ",
      rating: 4.8,
      priceRange: "$1,500–$2,500",
      timesWorkedTogether: 6,
      note: "Bridal specialist. Did Neha & Vikram's wedding last month — couples rave.",
    },
    {
      name: "Mehndi by Nisha",
      location: "Jersey City, NJ",
      rating: 4.7,
      priceRange: "$1,200–$2,000",
      timesWorkedTogether: 4,
    },
    {
      name: "Rangoli Henna Studio",
      location: "Paterson, NJ",
      rating: 4.6,
      priceRange: "$900–$1,800",
      timesWorkedTogether: 3,
      note: "Best for guest stations — 3 artists on-site.",
    },
    {
      name: "Aditi's Mehndi",
      location: "Iselin, NJ",
      rating: 4.5,
      priceRange: "$1,100–$1,900",
      timesWorkedTogether: 2,
    },
    {
      name: "Sanaa Khan Henna",
      location: "New York, NY",
      rating: 4.9,
      priceRange: "$2,000–$3,500",
      timesWorkedTogether: 2,
      note: "High-end editorial style. Photography-forward.",
    },
    {
      name: "Kiran's Henna",
      location: "Hoboken, NJ",
      rating: 4.5,
      priceRange: "$900–$1,600",
      timesWorkedTogether: 1,
    },
  ],
  lighting: [],
  "photo-booth": [],
  dhol: [],
};

export const AI_RECS_BY_CATEGORY: Record<string, AiRecommendation[]> = {
  mehndi: [
    {
      name: "Sanaa Khan Henna",
      location: "New York, NY",
      rating: 4.9,
      priceRange: "$2,000–$3,500",
      why: "Editorial line-work matches the couple's Tarun Tahiliani bridal palette, and she's worked the Legacy Castle three times.",
    },
    {
      name: "Henna by Priya",
      location: "Edison, NJ",
      rating: 4.8,
      priceRange: "$1,500–$2,500",
      why: "Local to Pompton Plains, guest-count ready (425), and stylistically cohesive with Elegant Affairs' decor direction.",
    },
    {
      name: "Rangoli Henna Studio",
      location: "Paterson, NJ",
      rating: 4.6,
      priceRange: "$900–$1,800",
      why: "Fastest guest-station throughput for 425 guests — 3 artists on-site with a proven flow.",
    },
  ],
  lighting: [],
  "photo-booth": [],
  dhol: [],
};
