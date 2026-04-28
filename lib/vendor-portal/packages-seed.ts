// Packages model for the vendor "Services & Packages" editor. Each package is
// one priced offering the vendor puts on their public profile. Seasonal
// packages carry start/end dates and auto-hide on the public profile once the
// end date has passed.

export type EventCategory =
  | "sangeet"
  | "mehndi"
  | "ceremony"
  | "reception"
  | "full-wedding";

export const EVENT_CATEGORIES: EventCategory[] = [
  "mehndi",
  "sangeet",
  "ceremony",
  "reception",
  "full-wedding",
];

export const EVENT_CATEGORY_LABEL: Record<EventCategory, string> = {
  sangeet: "Sangeet",
  mehndi: "Mehndi",
  ceremony: "Ceremony",
  reception: "Reception",
  "full-wedding": "Full Wedding",
};

export type PriceDisplayKind =
  | "exact"
  | "starting-from"
  | "range"
  | "contact";

export type PriceDisplay =
  | { kind: "exact"; amount: number }
  | { kind: "starting-from"; amount: number }
  | { kind: "range"; min: number; max: number }
  | { kind: "contact" };

export type VendorPackage = {
  id: string;
  name: string;
  description: string;
  priceDisplay: PriceDisplay;
  currency: string;
  eventCategories: EventCategory[];
  leadTime: string;
  capacityNotes: string;
  featured: boolean;
  order: number;
  seasonal?: { startDate: string; endDate: string };
  selectionsCount: number;
  inquiriesCount: number;
};

export const PRICE_DISPLAY_LABEL: Record<PriceDisplayKind, string> = {
  exact: "Exact price",
  "starting-from": "Starting from",
  range: "Price range",
  contact: "Contact for pricing",
};

// Format a price display for card rendering. Uses Indian digit grouping.
export function formatPriceDisplay(pd: PriceDisplay, currency = "₹"): string {
  const fmt = (n: number) => n.toLocaleString("en-IN");
  switch (pd.kind) {
    case "exact":
      return `${currency}${fmt(pd.amount)}`;
    case "starting-from":
      return `From ${currency}${fmt(pd.amount)}`;
    case "range":
      return `${currency}${fmt(pd.min)} – ${currency}${fmt(pd.max)}`;
    case "contact":
      return "Contact for pricing";
  }
}

// A seasonal package is expired when today is past its end date (inclusive day
// of end is still live).
export function isExpired(pkg: VendorPackage, now = new Date()): boolean {
  if (!pkg.seasonal) return false;
  const end = new Date(pkg.seasonal.endDate + "T23:59:59");
  return now.getTime() > end.getTime();
}

export function isUpcoming(pkg: VendorPackage, now = new Date()): boolean {
  if (!pkg.seasonal) return false;
  const start = new Date(pkg.seasonal.startDate + "T00:00:00");
  return now.getTime() < start.getTime();
}

// Seed packages for Aurora Studios (photography vendor).
export const SEED_PACKAGES: VendorPackage[] = [
  {
    id: "pkg-signature-3day",
    name: "Signature 3-Day Wedding",
    description:
      "Our flagship — full ceremony arc with a second shooter, behind-the-scenes film, and an editorial album. 400+ edited images per day.",
    priceDisplay: { kind: "exact", amount: 1150000 },
    currency: "₹",
    eventCategories: ["full-wedding", "mehndi", "sangeet", "ceremony", "reception"],
    leadTime: "6–9 months",
    capacityNotes: "Up to 600 guests · destinations welcome",
    featured: true,
    order: 0,
    selectionsCount: 47,
    inquiriesCount: 22,
  },
  {
    id: "pkg-editorial-day",
    name: "Editorial Full-Day Coverage",
    description:
      "Candid + posed storytelling across a single event day. Includes 400+ edited images, private online gallery, and two lead photographers.",
    priceDisplay: { kind: "starting-from", amount: 380000 },
    currency: "₹",
    eventCategories: ["sangeet", "ceremony", "reception"],
    leadTime: "3–6 months",
    capacityNotes: "Up to 400 guests",
    featured: true,
    order: 1,
    selectionsCount: 31,
    inquiriesCount: 14,
  },
  {
    id: "pkg-prewedding",
    name: "Pre-Wedding Story",
    description:
      "A pre-wedding narrative shoot — not a photoshoot. We travel with you to a location that matters: your parents' home, a favourite café, the place you said yes.",
    priceDisplay: { kind: "range", min: 95000, max: 180000 },
    currency: "₹",
    eventCategories: ["full-wedding"],
    leadTime: "2–4 weeks",
    capacityNotes: "Half-day on location · India + nearby",
    featured: false,
    order: 2,
    selectionsCount: 18,
    inquiriesCount: 9,
  },
  {
    id: "pkg-mehendi-intimate",
    name: "Intimate Mehendi Morning",
    description:
      "Soft, unhurried coverage of the mehendi morning with the bride's closest circle. Delivered as a quiet photo essay.",
    priceDisplay: { kind: "exact", amount: 85000 },
    currency: "₹",
    eventCategories: ["mehndi"],
    leadTime: "4–8 weeks",
    capacityNotes: "Up to 60 guests",
    featured: false,
    order: 3,
    selectionsCount: 12,
    inquiriesCount: 5,
  },
  {
    id: "pkg-destination",
    name: "Destination Bespoke",
    description:
      "Fully bespoke coverage for destination weddings in India or abroad. Travel, lodging, and crew scaled to your itinerary. Ask us anything.",
    priceDisplay: { kind: "contact" },
    currency: "₹",
    eventCategories: ["full-wedding"],
    leadTime: "9–12 months",
    capacityNotes: "Scaled per venue",
    featured: false,
    order: 4,
    selectionsCount: 9,
    inquiriesCount: 6,
  },
  // ── Seasonal ───────────────────────────────────────────────
  {
    id: "pkg-seasonal-sangeet-2027",
    name: "Sangeet Season Special",
    description:
      "Book a sangeet-only coverage before March 2027 and receive a complimentary 40-page album. Limited to 12 bookings.",
    priceDisplay: { kind: "exact", amount: 295000 },
    currency: "₹",
    eventCategories: ["sangeet"],
    leadTime: "1–3 months",
    capacityNotes: "Up to 300 guests",
    featured: true,
    order: 0,
    seasonal: { startDate: "2026-11-01", endDate: "2027-03-01" },
    selectionsCount: 7,
    inquiriesCount: 4,
  },
  {
    id: "pkg-seasonal-monsoon",
    name: "Monsoon Mehendi",
    description:
      "Small-scale mehendi coverage for the July–September monsoon window, with weather-proofed gear and a backup indoor plan.",
    priceDisplay: { kind: "starting-from", amount: 65000 },
    currency: "₹",
    eventCategories: ["mehndi"],
    leadTime: "2–4 weeks",
    capacityNotes: "Up to 50 guests",
    featured: false,
    order: 1,
    seasonal: { startDate: "2025-07-01", endDate: "2025-09-30" },
    selectionsCount: 3,
    inquiriesCount: 2,
  },
];
