// ──────────────────────────────────────────────────────────────────────────
// Auspicious-date engine — pure functions that turn (filters + tradition
// data + weather + pricing) into the AuspiciousDate[] the calendar renders.
//
// All inputs are static modules; the only "live" inputs are user filters
// and today's date (for daysFromToday math).
// ──────────────────────────────────────────────────────────────────────────

import type {
  AuspiciousDate,
  BlockedPeriod,
  DateStatus,
  DemandLevel,
  LogisticsInfo,
  MonthQuality,
  Tradition,
  TraditionDateInfo,
  UserFilters,
  YearMuhuratData,
} from "@/types/auspicious-date";

import { HINDU_MUHURAT_2026 } from "./data/muhurat-2026";
import { HINDU_MUHURAT_2027 } from "./data/muhurat-2027";
import {
  JAIN_BLOCKED_2026,
  JAIN_BLOCKED_2027,
  MUSLIM_BLOCKED_2026,
  MUSLIM_BLOCKED_2027,
  SIKH_GURPURAB_2026,
  SIKH_GURPURAB_2027,
} from "./data/muhurat-other";
import { getWeatherForCityMonth } from "./data/weather";
import { getLongWeekendName, getPricingForCityMonth } from "./data/venue-pricing";

const HINDU_TRADITIONS: Tradition[] = [
  "hindu-north",
  "hindu-south",
  "hindu-gujarati",
  "hindu-bengali",
  "hindu-marathi",
  "hindu-general",
];

function isHindu(t: Tradition): boolean {
  return HINDU_TRADITIONS.includes(t);
}

function getMuhuratData(year: number): YearMuhuratData | null {
  if (year === 2026) return HINDU_MUHURAT_2026;
  if (year === 2027) return HINDU_MUHURAT_2027;
  return null;
}

function getOtherBlocks(tradition: Tradition, year: number): BlockedPeriod[] {
  if (tradition === "muslim") {
    if (year === 2026) return MUSLIM_BLOCKED_2026;
    if (year === 2027) return MUSLIM_BLOCKED_2027;
  }
  if (tradition === "jain") {
    if (year === 2026) return JAIN_BLOCKED_2026;
    if (year === 2027) return JAIN_BLOCKED_2027;
  }
  if (tradition === "sikh") {
    if (year === 2026) return SIKH_GURPURAB_2026;
    if (year === 2027) return SIKH_GURPURAB_2027;
  }
  return [];
}

function isoDate(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function dayOfWeek(iso: string): string {
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString("en-US", { weekday: "long" });
}

function isWeekend(iso: string): boolean {
  const d = new Date(iso + "T12:00:00");
  const day = d.getDay();
  return day === 0 || day === 5 || day === 6;
}

function isSaturday(iso: string): boolean {
  const d = new Date(iso + "T12:00:00");
  return d.getDay() === 6;
}

function getMonthFromIso(iso: string): number {
  return parseInt(iso.slice(5, 7), 10);
}

function daysBetween(fromIso: string, toIso: string): number {
  const from = new Date(fromIso + "T12:00:00").getTime();
  const to = new Date(toIso + "T12:00:00").getTime();
  return Math.round((to - from) / (1000 * 60 * 60 * 24));
}

function periodContains(period: BlockedPeriod, iso: string): boolean {
  return iso >= period.start && iso <= period.end;
}

// Build the full year's worth of dates (365/366 entries). For each one,
// stamp the tradition layer, weather, logistics, demand, and overall score.
export function buildYearDates(filters: UserFilters, year: number): AuspiciousDate[] {
  const todayIso = new Date().toISOString().slice(0, 10);
  const result: AuspiciousDate[] = [];

  // Pick a primary tradition for muhurat data. If multiple Hindu variants
  // are selected, we use the general baseline (regional differences are
  // small enough that the general list is a sane v1).
  const hindu = filters.traditions.some(isHindu);
  const muhurat = hindu ? getMuhuratData(year) : null;
  const muhuratBlocks: BlockedPeriod[] = muhurat?.blockedPeriods ?? [];

  // Other-tradition block periods stack on top.
  const otherBlocks: BlockedPeriod[] = filters.traditions.flatMap((t) =>
    getOtherBlocks(t, year),
  );

  const daysInYear = isLeapYear(year) ? 366 : 365;
  let dayOfYear = 0;
  for (let month = 1; month <= 12; month++) {
    const lastDay = lastDayOfMonth(year, month);
    const monthMuhurat: MonthQuality | undefined = muhurat?.months[month];
    const muhuratDates = new Set(monthMuhurat?.dates ?? []);

    for (let day = 1; day <= lastDay; day++) {
      dayOfYear += 1;
      const iso = isoDate(year, month, day);
      const traditionInfos: TraditionDateInfo[] = [];

      // Hindu layer
      if (hindu && muhurat) {
        const isMuhurat = muhuratDates.has(day);
        const insideHinduBlock = muhuratBlocks.find((p) => periodContains(p, iso));
        let status: DateStatus;
        let blockReason: string | undefined;
        let blockExplanation: string | undefined;
        if (insideHinduBlock) {
          status = insideHinduBlock.shortLabel === "Pitru Paksha" ? "blocked" : "blocked";
          blockReason = insideHinduBlock.shortLabel;
          blockExplanation = insideHinduBlock.explanation;
        } else if (isMuhurat) {
          status = isHighlyAuspicious(month, day, monthMuhurat) ? "highly-auspicious" : "auspicious";
        } else {
          status = "neutral";
        }
        const detail = muhurat.dateDetails[iso] ?? {};
        traditionInfos.push({
          tradition: "hindu-general",
          status,
          muhuratWindow: detail.muhuratWindow,
          nakshatra: detail.nakshatra,
          tithi: detail.tithi,
          notes: detail.notes,
          blockReason,
          blockExplanation,
          source: "Hindu Panchang " + year,
        });
      }

      // Non-Hindu blocks (Muslim, Jain, Sikh)
      for (const t of filters.traditions) {
        if (isHindu(t)) continue;
        const traditionBlocks = otherBlocks.filter((b) => b.tradition === t);
        const inside = traditionBlocks.find((p) => periodContains(p, iso));
        if (inside) {
          traditionInfos.push({
            tradition: t,
            status: t === "sikh" ? "avoid" : "blocked",
            blockReason: inside.shortLabel,
            blockExplanation: inside.explanation,
          });
        } else if (t === "muslim") {
          // Muslim favorable months get a soft "auspicious" tag — Shawwal,
          // Rabi al-Awwal. v1 is light-touch on this — surface as neutral
          // outside of blocks.
          traditionInfos.push({
            tradition: "muslim",
            status: "neutral",
          });
        }
      }

      // No-tradition path: no tradition info is added — every day is neutral
      // from a tradition perspective.

      const weather = {
        ...getWeatherForCityMonth(filters.city, month),
      };

      const pricing = getPricingForCityMonth(filters.city, month);
      const longWeekend = getLongWeekendName(iso);
      const logistics: LogisticsInfo = {
        dayOfWeek: dayOfWeek(iso),
        isWeekend: isWeekend(iso),
        isLongWeekend: !!longWeekend,
        holidayName: longWeekend,
        venuePricingTier: pricing.tier,
        venuePricingNote: pricing.note,
        daysFromToday: daysBetween(todayIso, iso),
      };

      const overallStatus = combinedStatus(traditionInfos);
      const demand = calculateDemand(overallStatus, weather.weatherScore, logistics, month);
      const overallScore = scoreDate({
        status: overallStatus,
        weatherScore: weather.weatherScore,
        logistics,
        pricingTier: pricing.tier,
        demand,
      });

      result.push({
        date: iso,
        traditions: traditionInfos,
        weather,
        logistics,
        demand,
        overallScore,
      });
    }
  }

  if (dayOfYear !== daysInYear) {
    // Defensive — this should never happen
    console.warn(`Day count mismatch for ${year}: ${dayOfYear} vs ${daysInYear}`);
  }

  return result;
}

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

function lastDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

// February's 12 dates are all strong, but Feb 19 is the marquee. Other
// months: the first or middle muhurat date in a strong month is treated
// as highly-auspicious. Approximate but visually meaningful.
function isHighlyAuspicious(month: number, day: number, monthQ: MonthQuality | undefined): boolean {
  if (!monthQ) return false;
  if (monthQ.quality !== "excellent") return false;
  // Highlight the first muhurat Saturday of an "excellent" month
  const iso = isoDate(monthQ.year, month, day);
  return isSaturday(iso);
}

function combinedStatus(infos: TraditionDateInfo[]): DateStatus {
  if (infos.length === 0) return "neutral";
  // Worst status wins on the negative side; best status wins on the
  // positive side when nothing is blocked.
  const order: Record<DateStatus, number> = {
    blocked: 0,
    avoid: 1,
    neutral: 2,
    auspicious: 3,
    "highly-auspicious": 4,
  };
  const hasBlocked = infos.some((i) => i.status === "blocked");
  if (hasBlocked) return "blocked";
  const hasAvoid = infos.some((i) => i.status === "avoid");
  if (hasAvoid) return "avoid";
  return infos.reduce<DateStatus>((acc, info) => {
    return order[info.status] > order[acc] ? info.status : acc;
  }, "neutral");
}

function calculateDemand(
  status: DateStatus,
  weatherScore: number,
  logistics: LogisticsInfo,
  month: number,
): DemandLevel {
  if (status === "blocked" || status === "avoid") return "low";
  let score = 0;
  if (logistics.isWeekend && (status === "highly-auspicious" || status === "auspicious")) {
    score += 3;
  }
  if ([11, 12].includes(month) && status !== "neutral") score += 2;
  if (logistics.isLongWeekend) score += 1;
  if (weatherScore >= 4) score += 1;
  if ([1, 2].includes(month) && logistics.isWeekend) score += 1;
  if (logistics.venuePricingTier === "premium") score += 1;

  if (score >= 6) return "extreme";
  if (score >= 4) return "very-high";
  if (score >= 3) return "high";
  if (score >= 1) return "moderate";
  return "low";
}

function scoreDate(input: {
  status: DateStatus;
  weatherScore: number;
  logistics: LogisticsInfo;
  pricingTier: string;
  demand: DemandLevel;
}): number {
  if (input.status === "blocked") return 0;
  if (input.status === "avoid") return 10;

  let score = 0;
  // Tradition contribution: 0..40
  if (input.status === "highly-auspicious") score += 40;
  else if (input.status === "auspicious") score += 28;
  else if (input.status === "neutral") score += 18;

  // Weather contribution: 0..25
  score += input.weatherScore * 5;

  // Logistics: 0..20
  if (input.logistics.isWeekend) score += 12;
  if (input.logistics.dayOfWeek === "Saturday") score += 4;
  if (input.logistics.isLongWeekend) score += 4;

  // Pricing: 0..15 (lower tier = higher score)
  if (input.pricingTier === "off-peak") score += 15;
  else if (input.pricingTier === "standard") score += 10;
  else if (input.pricingTier === "peak") score += 5;
  else score += 0; // premium

  return Math.min(100, Math.max(0, score));
}

// ──────────────────────────────────────────────────────────────────────
// Filter application — runs against the full year dataset.
// ──────────────────────────────────────────────────────────────────────

export interface FilterMatch {
  date: AuspiciousDate;
  matchesAll: boolean;
  failedFilters: string[];
}

export function applyFilters(dates: AuspiciousDate[], filters: UserFilters): FilterMatch[] {
  return dates.map((d) => {
    const failed: string[] = [];

    // Day of week
    if (filters.dayOfWeekPref === "weekends" && !d.logistics.isWeekend) {
      failed.push("weekend");
    }
    if (filters.dayOfWeekPref === "saturday-only" && d.logistics.dayOfWeek !== "Saturday") {
      failed.push("saturday");
    }

    // Season
    if (filters.seasonPref.length > 0) {
      const m = getMonthFromIso(d.date);
      const season = getSeason(m);
      if (!filters.seasonPref.includes(season)) failed.push("season");
    }

    // Heat / cold
    if (filters.avoidExtremeHeat && d.weather.avgHighF > 95) failed.push("heat");
    if (filters.avoidExtremeCold && d.weather.avgHighF < 40) failed.push("cold");

    // Long weekends
    if (filters.showLongWeekends && !d.logistics.isLongWeekend) failed.push("long-weekend");

    // Peak pricing
    if (
      filters.avoidPeakPricing &&
      (d.logistics.venuePricingTier === "peak" || d.logistics.venuePricingTier === "premium")
    ) {
      failed.push("pricing");
    }

    return { date: d, matchesAll: failed.length === 0, failedFilters: failed };
  });
}

function getSeason(month: number): "spring" | "summer" | "fall" | "winter" {
  if ([3, 4, 5].includes(month)) return "spring";
  if ([6, 7, 8].includes(month)) return "summer";
  if ([9, 10, 11].includes(month)) return "fall";
  return "winter";
}

// ──────────────────────────────────────────────────────────────────────
// Summary / insights — distilled metrics for the year overview card.
// ──────────────────────────────────────────────────────────────────────

export interface YearSummary {
  year: number;
  totalAuspicious: number;
  auspiciousSaturdays: number;
  saturdaysInPreferredSeason: number;
  matchingAllFilters: number;
  blockedMonths: number[];
  insight: string;
}

export function buildYearSummary(
  matches: FilterMatch[],
  year: number,
  filters: UserFilters,
): YearSummary {
  const auspicious = matches.filter(
    (m) =>
      m.date.traditions.some(
        (t) => t.status === "highly-auspicious" || t.status === "auspicious",
      ) || (filters.traditions.includes("none") && m.date.traditions.length === 0),
  );

  // For "no tradition", treat all good-weather weekend days as auspicious
  const noTradition = filters.traditions.length === 1 && filters.traditions[0] === "none";
  const totalAuspicious = noTradition
    ? matches.filter((m) => m.date.weather.weatherScore >= 4 && m.date.logistics.isWeekend).length
    : auspicious.length;

  const auspiciousSaturdays = auspicious.filter((m) => m.date.logistics.dayOfWeek === "Saturday").length;
  const saturdaysInPreferredSeason = auspicious.filter((m) => {
    if (filters.seasonPref.length === 0) return m.date.logistics.dayOfWeek === "Saturday";
    if (m.date.logistics.dayOfWeek !== "Saturday") return false;
    const month = getMonthFromIso(m.date.date);
    return filters.seasonPref.includes(getSeason(month));
  }).length;
  const matchingAll = matches.filter((m) => m.matchesAll && !isBlockedDate(m.date)).length;

  // Compute "blocked" months — months where every date is blocked
  const blockedMonths: number[] = [];
  for (let m = 1; m <= 12; m++) {
    const monthDates = matches.filter((mt) => getMonthFromIso(mt.date.date) === m);
    if (monthDates.length === 0) continue;
    if (monthDates.every((md) => isBlockedDate(md.date))) blockedMonths.push(m);
  }

  return {
    year,
    totalAuspicious,
    auspiciousSaturdays,
    saturdaysInPreferredSeason,
    matchingAllFilters: matchingAll,
    blockedMonths,
    insight: buildInsight(year, filters, totalAuspicious, auspiciousSaturdays, blockedMonths),
  };
}

function isBlockedDate(d: AuspiciousDate): boolean {
  return d.traditions.some((t) => t.status === "blocked" || t.status === "avoid");
}

function buildInsight(
  year: number,
  filters: UserFilters,
  totalAuspicious: number,
  auspiciousSaturdays: number,
  blockedMonths: number[],
): string {
  const hindu = filters.traditions.some(isHindu);
  const noTradition = filters.traditions.length === 1 && filters.traditions[0] === "none";

  if (noTradition) {
    return `Without muhurat restrictions, your best dates are March–April and October–November — gorgeous weather, reasonable venue pricing, and long enough days for outdoor events.`;
  }

  if (hindu && year === 2026) {
    return `2026 is a tricky year for Hindu weddings. Adhik Maas blocks late May through mid-June, and Chaturmas runs from late July through mid-November. That leaves February–April and late November–December as your prime windows — and everyone else is targeting the same dates.`;
  }

  if (hindu && year === 2027) {
    return `2027 is more generous than 2026 — no Adhik Maas, and Chaturmas reopens in early November. You have ~${totalAuspicious} muhurat dates to choose from, with ${auspiciousSaturdays} falling on Saturdays.`;
  }

  if (filters.traditions.length > 1) {
    return `Cross-referencing your selected traditions narrows the field but doesn't eliminate it. We've highlighted dates that work in all selected calendars — those are your unicorn dates.`;
  }

  return `${totalAuspicious} auspicious dates available across ${year} — ${auspiciousSaturdays} of them on a Saturday.`;
}
