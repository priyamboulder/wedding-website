// ──────────────────────────────────────────────────────────────────────────
// Auspicious Date Finder — shapes for tradition, calendar, weather, demand.
//
// Pure client tool. All data ships pre-baked in /lib/auspicious-date/data/*
// — no astrology APIs, no weather APIs, no Supabase reads.
// ──────────────────────────────────────────────────────────────────────────

export type Tradition =
  | "hindu-north"
  | "hindu-south"
  | "hindu-gujarati"
  | "hindu-bengali"
  | "hindu-marathi"
  | "hindu-general"
  | "sikh"
  | "muslim"
  | "jain"
  | "none";

export type DateStatus =
  | "highly-auspicious"
  | "auspicious"
  | "neutral"
  | "avoid"
  | "blocked";

export type DemandLevel = "low" | "moderate" | "high" | "very-high" | "extreme";

export type PricingTier = "off-peak" | "standard" | "peak" | "premium";

export type Season = "spring" | "summer" | "fall" | "winter";

export interface MuhuratWindow {
  start: string; // "07:15 AM"
  end: string; // "01:30 PM"
}

export interface TraditionDateInfo {
  tradition: Tradition;
  status: DateStatus;
  muhuratWindow?: MuhuratWindow;
  nakshatra?: string;
  tithi?: string;
  yoga?: string;
  blockReason?: string;
  blockExplanation?: string;
  notes?: string;
  source?: string;
}

export interface WeatherInfo {
  city: string;
  avgHighF: number;
  avgLowF: number;
  rainChance: number;
  weatherScore: number; // 1–5
  description: string;
}

export interface LogisticsInfo {
  dayOfWeek: string;
  isWeekend: boolean;
  isLongWeekend: boolean;
  holidayName?: string;
  venuePricingTier: PricingTier;
  venuePricingNote?: string;
  daysFromToday: number;
}

export interface AuspiciousDate {
  date: string; // ISO YYYY-MM-DD
  traditions: TraditionDateInfo[];
  weather: WeatherInfo;
  logistics: LogisticsInfo;
  demand: DemandLevel;
  overallScore: number; // 0..100 composite
}

export type DayOfWeekPref = "weekends" | "saturday-only" | "any";

export interface UserFilters {
  traditions: Tradition[];
  years: number[];
  city: string;
  dayOfWeekPref: DayOfWeekPref;
  seasonPref: Season[];
  avoidExtremeHeat: boolean;
  avoidExtremeCold: boolean;
  showLongWeekends: boolean;
  avoidPeakPricing: boolean;
  crossTraditionMatch: boolean;
}

export interface ShortlistedDate {
  isoDate: string;
  addedAt: string; // ISO timestamp
  userNotes?: string;
}

export interface MonthQuality {
  month: number; // 1..12
  year: number;
  dates: number[]; // day-of-month numbers (1..31)
  quality: "excellent" | "good" | "limited" | "blocked";
  notes?: string;
  warning?: string;
}

export interface BlockedPeriod {
  tradition: Tradition;
  start: string; // ISO date
  end: string; // ISO date
  name: string;
  shortLabel: string;
  explanation: string;
}

export interface YearMuhuratData {
  year: number;
  tradition: Tradition;
  months: Record<number, MonthQuality>;
  blockedPeriods: BlockedPeriod[];
  dateDetails: Record<string, Partial<TraditionDateInfo>>; // keyed by ISO date
}
