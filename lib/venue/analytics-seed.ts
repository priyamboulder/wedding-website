// Mock analytics data for The Legacy Castle — 12-month window ending 2026-10-03.
// All numbers are chosen to tell a coherent, slightly-rising narrative so the
// dashboard narrates well as a demo.

import type { CeremonyType } from "@/lib/venue/seed";

export type KeyMetric = {
  key: "inquiries" | "tourConversion" | "bookingRate" | "avgBookingValue";
  label: string;
  value: string;
  delta: number; // percent, signed
  deltaSuffix: string; // "%"
  deltaLabel: string; // "vs last month"
  sparkline: number[]; // last 6 periods
  sub?: string;
};

export type CeremonyBreakdown = {
  type: CeremonyType | "Christian";
  weddings: number;
  percent: number;
};

export type Histogram = {
  bucket: string;
  weddings: number;
};

export type DurationBreakdown = {
  duration: "1-day" | "2-day" | "3-day+";
  weddings: number;
};

export type MonthlyBar = {
  month: string; // "Nov"
  weddings: number;
  isPeak?: boolean;
  isLow?: boolean;
};

export type SourceAttribution = {
  source: string;
  inquiries: number;
  tours: number;
  booked: number;
  revenue: number; // USD
  isAnanya?: boolean;
};

export type VendorRank = {
  category: string;
  vendors: { name: string; weddings: number }[];
};

export type PlannerRank = {
  name: string;
  weddings: number;
  share: number; // percent of total weddings
};

export type BenchmarkStat = {
  label: string;
  you: string;
  market: string;
  delta: number; // +/- vs market, percent
  youPct?: number; // 0-100 bar fill for "you"
  marketPct?: number; // 0-100 bar fill for "market"
};

export const KEY_METRICS: KeyMetric[] = [
  {
    key: "inquiries",
    label: "Inquiries",
    value: "12",
    delta: 33,
    deltaSuffix: "%",
    deltaLabel: "vs last month",
    sparkline: [6, 7, 9, 8, 9, 12],
    sub: "This month",
  },
  {
    key: "tourConversion",
    label: "Tour Conversion",
    value: "67%",
    delta: 5,
    deltaSuffix: "%",
    deltaLabel: "vs last quarter",
    sparkline: [58, 60, 62, 64, 65, 67],
    sub: "Tours → proposals",
  },
  {
    key: "bookingRate",
    label: "Booking Rate",
    value: "73%",
    delta: 0,
    deltaSuffix: "%",
    deltaLabel: "stable",
    sparkline: [72, 74, 73, 72, 74, 73],
    sub: "Proposals → booked",
  },
  {
    key: "avgBookingValue",
    label: "Avg Booking Value",
    value: "$87K",
    delta: 12,
    deltaSuffix: "%",
    deltaLabel: "vs last year",
    sparkline: [72, 74, 78, 80, 84, 87],
    sub: "Per wedding",
  },
];

export const CEREMONY_BREAKDOWN: CeremonyBreakdown[] = [
  { type: "Hindu", weddings: 26, percent: 55 },
  { type: "Muslim", weddings: 8, percent: 17 },
  { type: "Sikh", weddings: 6, percent: 13 },
  { type: "Interfaith", weddings: 5, percent: 11 },
  { type: "Christian", weddings: 2, percent: 4 },
];

export const GUEST_HISTOGRAM: Histogram[] = [
  { bucket: "Under 200", weddings: 8 },
  { bucket: "200–300", weddings: 14 },
  { bucket: "300–400", weddings: 15 },
  { bucket: "400+", weddings: 10 },
];

export const DURATION_BREAKDOWN: DurationBreakdown[] = [
  { duration: "1-day", weddings: 12 },
  { duration: "2-day", weddings: 18 },
  { duration: "3-day+", weddings: 17 },
];

// Last 12 months ending Oct 2026. Peaks: May, Jun, Oct, Nov. Lows: Jan, Feb, Jul.
export const MONTHLY_PATTERN: MonthlyBar[] = [
  { month: "Nov '25", weddings: 6, isPeak: true },
  { month: "Dec '25", weddings: 3 },
  { month: "Jan '26", weddings: 1, isLow: true },
  { month: "Feb '26", weddings: 1, isLow: true },
  { month: "Mar '26", weddings: 3 },
  { month: "Apr '26", weddings: 4 },
  { month: "May '26", weddings: 6, isPeak: true },
  { month: "Jun '26", weddings: 7, isPeak: true },
  { month: "Jul '26", weddings: 1, isLow: true },
  { month: "Aug '26", weddings: 3 },
  { month: "Sep '26", weddings: 4 },
  { month: "Oct '26", weddings: 8, isPeak: true },
];

export const SOURCE_ATTRIBUTION: SourceAttribution[] = [
  { source: "Ananya Search", inquiries: 45, tours: 28, booked: 18, revenue: 1_400_000, isAnanya: true },
  { source: "AI Recommendation", inquiries: 22, tours: 15, booked: 10, revenue: 870_000, isAnanya: true },
  { source: "Planner Referral", inquiries: 18, tours: 14, booked: 12, revenue: 960_000 },
  { source: "Direct / Other", inquiries: 12, tours: 8, booked: 5, revenue: 420_000 },
];

export const ANANYA_ATTRIBUTED_REVENUE = 2_270_000; // Search + AI Recommendation
export const ANANYA_ATTRIBUTED_BOOKINGS = 28;
export const VENUE_SUBSCRIPTION_MONTHLY = 499;

export const VENDOR_RANKINGS: VendorRank[] = [
  {
    category: "Photography",
    vendors: [
      { name: "Stories by Joseph Radhik", weddings: 8 },
      { name: "The Wedding Salad", weddings: 5 },
      { name: "Dot Dusk", weddings: 3 },
    ],
  },
  {
    category: "Decor",
    vendors: [
      { name: "Elegant Affairs", weddings: 14 },
      { name: "Design House", weddings: 9 },
      { name: "Marigold Studio", weddings: 4 },
    ],
  },
  {
    category: "Catering",
    vendors: [
      { name: "Mughal Mahal", weddings: 11 },
      { name: "Saffron Kitchen", weddings: 6 },
      { name: "Chutney & Co.", weddings: 4 },
    ],
  },
];

export const PLANNER_RANKINGS: PlannerRank[] = [
  { name: "Radz Events", weddings: 12, share: 26 },
  { name: "CG & Co Events", weddings: 7, share: 15 },
  { name: "Detailed Affairs", weddings: 4, share: 9 },
];

export const PLANNER_INSIGHT =
  "Radz Events has brought 12 weddings to The Legacy Castle — 26% of all weddings. Consider a formal partnership or preferred-planner relationship.";

export const BENCHMARK_STATS: BenchmarkStat[] = [
  {
    label: "Inquiry volume / mo",
    you: "12",
    market: "8",
    delta: 50,
    youPct: 100,
    marketPct: 67,
  },
  {
    label: "Avg booking value",
    you: "$87K",
    market: "$71K",
    delta: 23,
    youPct: 100,
    marketPct: 82,
  },
  {
    label: "Share of NJ S. Asian weddings",
    you: "8.4%",
    market: "—",
    delta: 2,
    youPct: 84,
    marketPct: 0,
  },
  {
    label: "YoY trend",
    you: "+18%",
    market: "+6%",
    delta: 12,
    youPct: 90,
    marketPct: 55,
  },
];

export const BENCHMARK_NOTE =
  "Based on anonymized data from 42 comparable venues across NJ, NY, and CT in Ananya's network.";
