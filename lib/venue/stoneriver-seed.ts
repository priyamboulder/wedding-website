// Mock Stoneriver Hospitality PMS integration data. Only surfaced in the UI
// when VENUE.managedBy === "Stoneriver Hospitality".

export type PmsConnection = {
  property: string;
  pms: string; // "OnQ" (Hilton), "Opera" (Marriott)
  status: "connected" | "error" | "disconnected";
  lastSyncLabel: string;
};

export type RoomBlock = {
  id: string;
  coupleNames: string;
  weddingId?: string;
  dates: string; // "Oct 14-18"
  blockSize: number;
  picked: number;
  ratePerNight: number;
  nights: number;
  revenue: number;
  cutoffLabel: string; // "Oct 1 (passed — remaining rooms released)"
  cutoffStatus: "passed" | "upcoming";
  warning?: string;
};

export type PmsAutoAction = {
  step: string;
  description: string;
  status: "complete" | "scheduled";
  when?: string;
};

export type StoneriverProperty = {
  name: string;
  location: string;
  weddings: number;
  revenue: number;
  avgValue: number;
  inquiries: number;
  weddingRevenueSharePct: number; // % of the property's total revenue from weddings
};

export type RevenueCategory = {
  category: string;
  value: number;
  share: number; // percent
};

export const STONERIVER_CONNECTION: PmsConnection = {
  property: "The Legacy Castle",
  pms: "OnQ",
  status: "connected",
  lastSyncLabel: "2 minutes ago",
};

export const PMS_AUTO_FLOW: PmsAutoAction[] = [
  {
    step: "Group block created",
    description:
      "Ananya booking → PMS auto-creates a 120-room group block at the group rate.",
    status: "complete",
  },
  {
    step: "Reservation link generated",
    description:
      "A shareable link is sent to the couple so guests can self-book rooms against the block.",
    status: "complete",
  },
  {
    step: "F&B requirements synced",
    description:
      "Wedding event sheet pushes dietary counts and meal times to the hotel's catering team.",
    status: "complete",
  },
  {
    step: "BEO draft pre-populated",
    description:
      "Banquet Event Order draft generated from Ananya event timeline — venue team only has to sign off.",
    status: "scheduled",
    when: "48 hrs before event",
  },
];

export const ROOM_BLOCKS: RoomBlock[] = [
  {
    id: "priya-arjun",
    coupleNames: "Priya & Arjun",
    weddingId: "priya-arjun",
    dates: "Oct 14-18",
    blockSize: 120,
    picked: 87,
    ratePerNight: 189,
    nights: 3,
    revenue: 65_772, // 189 * 87 * ~4 nights rounded for demo
    cutoffLabel: "Oct 1 — passed, remaining rooms released",
    cutoffStatus: "passed",
  },
  {
    id: "neha-vikram",
    coupleNames: "Neha & Vikram",
    weddingId: "neha-vikram",
    dates: "Nov 7-11",
    blockSize: 80,
    picked: 45,
    ratePerNight: 179,
    nights: 4,
    revenue: 32_220,
    cutoffLabel: "Oct 25 · in 20 days",
    cutoffStatus: "upcoming",
    warning:
      "Pickup below 60% — consider outreach to couple or extending cutoff.",
  },
];

export const STONERIVER_PORTFOLIO: StoneriverProperty[] = [
  {
    name: "The Legacy Castle",
    location: "Pompton Plains, NJ",
    weddings: 14,
    revenue: 2_400_000,
    avgValue: 171_000,
    inquiries: 45,
    weddingRevenueSharePct: 34,
  },
  {
    name: "Hampton Inn Beaumont",
    location: "Beaumont, TX",
    weddings: 6,
    revenue: 420_000,
    avgValue: 70_000,
    inquiries: 18,
    weddingRevenueSharePct: 12,
  },
  {
    name: "Homewood Suites",
    location: "Beaumont, TX",
    weddings: 3,
    revenue: 195_000,
    avgValue: 65_000,
    inquiries: 12,
    weddingRevenueSharePct: 8,
  },
  {
    name: "Courtyard by Marriott",
    location: "Edison, NJ",
    weddings: 4,
    revenue: 310_000,
    avgValue: 77_500,
    inquiries: 22,
    weddingRevenueSharePct: 14,
  },
];

export const PORTFOLIO_TOTALS = {
  weddings: 27,
  revenue: 3_325_000,
  inquiries: 97,
};

export const REVENUE_BREAKDOWN: RevenueCategory[] = [
  { category: "Venue rental", value: 1_425_000, share: 43 },
  { category: "F&B (wedding events)", value: 1_120_000, share: 34 },
  { category: "Room blocks", value: 640_000, share: 19 },
  { category: "Ancillary / Spa", value: 140_000, share: 4 },
];

export const MONTHLY_REVENUE: { month: string; ananya: number; other: number }[] = [
  { month: "Nov '25", ananya: 210, other: 155 },
  { month: "Dec '25", ananya: 95, other: 140 },
  { month: "Jan '26", ananya: 40, other: 110 },
  { month: "Feb '26", ananya: 45, other: 120 },
  { month: "Mar '26", ananya: 120, other: 135 },
  { month: "Apr '26", ananya: 180, other: 160 },
  { month: "May '26", ananya: 260, other: 175 },
  { month: "Jun '26", ananya: 305, other: 180 },
  { month: "Jul '26", ananya: 55, other: 95 },
  { month: "Aug '26", ananya: 140, other: 155 },
  { month: "Sep '26", ananya: 195, other: 170 },
  { month: "Oct '26", ananya: 350, other: 210 },
];
