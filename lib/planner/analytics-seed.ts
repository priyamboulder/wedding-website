// Mock analytics data for /planner/analytics.
// Demo year is 2026. Planner = Urvashi / Radz Events.

export type MonthlyWeddings = { month: string; count: number };
export type QuarterlyRevenue = { quarter: string; revenue: number };
export type RatingPoint = { quarter: string; rating: number };

export type FunnelStage = {
  key: "inquiries" | "consultations" | "proposals" | "booked";
  label: string;
  count: number;
  // conversion % from the previous stage (undefined for the first stage)
  conversionFromPrev?: number;
  // delta vs same stage last year in absolute count
  deltaYoY: number;
};

export type TopVendor = {
  rank: number;
  name: string;
  category: string;
  weddings: number;
  rating: number;
  avgResponse: string;
};

export type ResponseVendor = {
  name: string;
  category: string;
  avgResponseHours: number;
  note?: string;
};

export type RecentReview = {
  id: string;
  couple: string;
  date: string;
  rating: number;
  snippet: string;
};

export type RatingBucket = { stars: 1 | 2 | 3 | 4 | 5; count: number };

export type ReviewTrendPoint = { quarter: string; rating: number; volume: number };

export type MarketVenue = {
  name: string;
  weddingsThisQuarter: number;
  trend: "up" | "down" | "steady";
};

export type TrendingCategory = {
  label: string;
  growth: number; // %
};

export const ANALYTICS_HEADLINE = {
  weddingsThisYear: 22,
  weddingsYoYDelta: 4, // +4 vs 2025
  revenueUnderManagement: 4_200_000,
  revenueYoYDelta: 0.18, // +18%
  averageRating: 4.9,
  ratingPrev: 4.8,
  profileViewsThisMonth: 342,
  profileViewsDelta: 0.23, // +23% vs last month
};

export const MONTHLY_WEDDINGS: MonthlyWeddings[] = [
  { month: "Jan", count: 0 },
  { month: "Feb", count: 1 },
  { month: "Mar", count: 2 },
  { month: "Apr", count: 2 },
  { month: "May", count: 4 },
  { month: "Jun", count: 4 },
  { month: "Jul", count: 1 },
  { month: "Aug", count: 1 },
  { month: "Sep", count: 2 },
  { month: "Oct", count: 3 }, // Oct 15, Oct 22, Oct 29 (matches dashboard)
  { month: "Nov", count: 1 },
  { month: "Dec", count: 1 },
];

export const QUARTERLY_REVENUE: QuarterlyRevenue[] = [
  { quarter: "Q3 2024", revenue: 820_000 },
  { quarter: "Q4 2024", revenue: 960_000 },
  { quarter: "Q1 2025", revenue: 880_000 },
  { quarter: "Q2 2025", revenue: 1_150_000 },
  { quarter: "Q3 2025", revenue: 1_250_000 },
  { quarter: "Q4 2025", revenue: 1_320_000 },
  { quarter: "Q1 2026", revenue: 1_380_000 },
  { quarter: "Q2 2026", revenue: 1_520_000 },
];

export const RATING_TREND: RatingPoint[] = [
  { quarter: "Q3 2024", rating: 4.6 },
  { quarter: "Q4 2024", rating: 4.7 },
  { quarter: "Q1 2025", rating: 4.7 },
  { quarter: "Q2 2025", rating: 4.8 },
  { quarter: "Q3 2025", rating: 4.8 },
  { quarter: "Q4 2025", rating: 4.8 },
  { quarter: "Q1 2026", rating: 4.9 },
  { quarter: "Q2 2026", rating: 4.9 },
];

export const FUNNEL: FunnelStage[] = [
  { key: "inquiries", label: "Inquiries", count: 45, deltaYoY: 8 },
  {
    key: "consultations",
    label: "Consultations",
    count: 28,
    conversionFromPrev: 62,
    deltaYoY: 5,
  },
  {
    key: "proposals",
    label: "Proposals sent",
    count: 22,
    conversionFromPrev: 79,
    deltaYoY: 3,
  },
  {
    key: "booked",
    label: "Booked",
    count: 18,
    conversionFromPrev: 82,
    deltaYoY: 4,
  },
];

export const VENDOR_NETWORK_TOTALS = {
  total: 142,
  addedThisQuarter: 5,
};

export const TOP_VENDORS: TopVendor[] = [
  { rank: 1, name: "Stories by Joseph Radhik", category: "Photography", weddings: 14, rating: 4.9, avgResponse: "4h" },
  { rank: 2, name: "Elegant Affairs", category: "Decor & Florals", weddings: 11, rating: 4.8, avgResponse: "6h" },
  { rank: 3, name: "Mughal Mahal Catering", category: "Catering", weddings: 10, rating: 4.9, avgResponse: "3h" },
  { rank: 4, name: "DJ Riz", category: "DJ", weddings: 9, rating: 4.9, avgResponse: "2h" },
  { rank: 5, name: "Aakash Films", category: "Videography", weddings: 9, rating: 4.8, avgResponse: "5h" },
  { rank: 6, name: "Shivani Makeup Studio", category: "HMUA", weddings: 8, rating: 4.8, avgResponse: "3h" },
  { rank: 7, name: "The Wedding Salad", category: "Photography", weddings: 7, rating: 4.8, avgResponse: "7h" },
  { rank: 8, name: "Mehndi by Neeta", category: "Mehndi", weddings: 7, rating: 4.9, avgResponse: "4h" },
  { rank: 9, name: "Golden Temple Dhol", category: "Dhol & Baraat", weddings: 6, rating: 4.7, avgResponse: "5h" },
  { rank: 10, name: "Pandit Sharma Ji", category: "Priest", weddings: 6, rating: 5.0, avgResponse: "8h" },
];

export const FASTEST_VENDORS: ResponseVendor[] = [
  { name: "DJ Riz", category: "DJ", avgResponseHours: 2 },
  { name: "Mughal Mahal Catering", category: "Catering", avgResponseHours: 3 },
  { name: "Shivani Makeup Studio", category: "HMUA", avgResponseHours: 3 },
  { name: "Stories by Joseph Radhik", category: "Photography", avgResponseHours: 4 },
  { name: "Mehndi by Neeta", category: "Mehndi", avgResponseHours: 4 },
];

export const SLOWEST_VENDORS: ResponseVendor[] = [
  { name: "Crystal Events NY", category: "Lighting", avgResponseHours: 72, note: "Last 2 inquiries unreplied" },
  { name: "Royal Baraat Co.", category: "Dhol & Baraat", avgResponseHours: 48, note: "Often responds over weekend only" },
  { name: "Cloud Nine Photo Booth", category: "Photo Booth", avgResponseHours: 42 },
  { name: "Anand Caterers", category: "Catering", avgResponseHours: 36 },
  { name: "Param Transportation", category: "Transportation", avgResponseHours: 30, note: "Flag for follow-up" },
];

export const RECENT_REVIEWS: RecentReview[] = [
  {
    id: "ar1",
    couple: "Meher & Ishaan",
    date: "Aug 2026",
    rating: 5,
    snippet: "She made us feel like her only couple. Worth every dollar and then some.",
  },
  {
    id: "ar2",
    couple: "Divya & Karan",
    date: "Jun 2026",
    rating: 5,
    snippet: "Ran our Mexico destination wedding like it was in her backyard. We showed up, got married, danced.",
  },
  {
    id: "ar3",
    couple: "Aanya & Veer",
    date: "May 2026",
    rating: 5,
    snippet: "500 guests, 5 events, one Urvashi. She became part of our family that week.",
  },
  {
    id: "ar4",
    couple: "Riya & Arnav",
    date: "Mar 2026",
    rating: 5,
    snippet: "Re-booked our entire wedding in 10 days when the venue cancelled. Calm in a hurricane.",
  },
  {
    id: "ar5",
    couple: "Tara & Samir",
    date: "Feb 2026",
    rating: 4,
    snippet: "Fantastic planner. One small DJ miscommunication. Everything else was exceptional.",
  },
];

// 38 reviews total. Matches rating 4.9 average.
export const RATING_DISTRIBUTION: RatingBucket[] = [
  { stars: 5, count: 32 },
  { stars: 4, count: 5 },
  { stars: 3, count: 1 },
  { stars: 2, count: 0 },
  { stars: 1, count: 0 },
];

export const REVIEW_TREND: ReviewTrendPoint[] = [
  { quarter: "Q3 2024", rating: 4.6, volume: 3 },
  { quarter: "Q4 2024", rating: 4.7, volume: 4 },
  { quarter: "Q1 2025", rating: 4.7, volume: 5 },
  { quarter: "Q2 2025", rating: 4.8, volume: 5 },
  { quarter: "Q3 2025", rating: 4.8, volume: 5 },
  { quarter: "Q4 2025", rating: 4.9, volume: 6 },
  { quarter: "Q1 2026", rating: 4.9, volume: 5 },
  { quarter: "Q2 2026", rating: 4.9, volume: 5 },
];

// Market insights (premium)
export const MARKET_INSIGHTS = {
  avgMarketBudget: 185_000,
  avgMarketBudgetDelta: 0.07, // +7% vs last year
  yourAvgBudget: 234_000,
  marketShareEstimate: 0.09, // 9%
  marketShareSub: "of South Asian weddings in NY/NJ tri-state area",
};

export const POPULAR_VENUES: MarketVenue[] = [
  { name: "The Legacy Castle", weddingsThisQuarter: 18, trend: "up" },
  { name: "Park Chateau", weddingsThisQuarter: 14, trend: "steady" },
  { name: "Oheka Castle", weddingsThisQuarter: 12, trend: "up" },
  { name: "The Rockleigh", weddingsThisQuarter: 9, trend: "down" },
  { name: "Ashford Estate", weddingsThisQuarter: 7, trend: "steady" },
];

export const TRENDING_CATEGORIES: TrendingCategory[] = [
  { label: "Content Creators (Reels)", growth: 0.46 },
  { label: "Photo Booth (360°)", growth: 0.32 },
  { label: "Destination Decor", growth: 0.24 },
  { label: "Live Sketch Artists", growth: 0.19 },
  { label: "Luxury Transportation", growth: 0.12 },
];
