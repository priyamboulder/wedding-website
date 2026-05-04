// ──────────────────────────────────────────────────────────────────────────
// Hindu Panchang muhurat dates for 2027 — preliminary.
//
// 2027 muhurats may not be widely published until late 2026. The dates here
// are projected from Panchang cycle patterns. The tool surfaces a
// "preliminary — confirm closer to date" warning to users selecting 2027.
// ──────────────────────────────────────────────────────────────────────────

import type { BlockedPeriod, MonthQuality, YearMuhuratData } from "@/types/auspicious-date";

const MONTHS_2027: Record<number, MonthQuality> = {
  1: {
    month: 1,
    year: 2027,
    dates: [15, 17, 22, 24, 27, 28],
    quality: "good",
    notes: "Preliminary — 6 projected muhurat dates. Confirm with published 2027 Panchang.",
  },
  2: {
    month: 2,
    year: 2027,
    dates: [3, 4, 8, 11, 14, 17, 18, 24, 25],
    quality: "excellent",
    notes: "Strong projected month — 9 dates. February consistently produces excellent muhurats.",
  },
  3: {
    month: 3,
    year: 2027,
    dates: [4, 5, 6, 11, 12],
    quality: "good",
    notes: "5 projected dates clustered early in the month.",
  },
  4: {
    month: 4,
    year: 2027,
    dates: [14, 15, 20, 22, 23, 28, 29, 30],
    quality: "good",
    notes: "Strong second half. Peak DFW spring weather.",
  },
  5: {
    month: 5,
    year: 2027,
    dates: [1, 2, 6, 7, 11, 13, 19, 22, 26, 27, 28],
    quality: "excellent",
    notes:
      "Peak wedding month — 11 projected dates. No Adhik Maas in 2027, so the full month is open.",
  },
  6: {
    month: 6,
    year: 2027,
    dates: [3, 4, 9, 10, 16, 17, 23, 24],
    quality: "good",
    notes: "Strong continuation — 8 projected dates. DFW heat building.",
  },
  7: {
    month: 7,
    year: 2027,
    dates: [1, 7, 8, 9, 14],
    quality: "limited",
    notes: "5 dates before Chaturmas begins (~July 14).",
    warning: "Chaturmas begins ~July 14, 2027 — 5 days earlier than 2026.",
  },
  8: { month: 8, year: 2027, dates: [], quality: "blocked", notes: "Chaturmas." },
  9: { month: 9, year: 2027, dates: [], quality: "blocked", notes: "Chaturmas + Pitru Paksha." },
  10: { month: 10, year: 2027, dates: [], quality: "blocked", notes: "Chaturmas." },
  11: {
    month: 11,
    year: 2027,
    dates: [12, 14, 19, 21, 24, 26],
    quality: "good",
    notes:
      "6 projected dates after Chaturmas reopens (~Nov 8). More dates than 2026's reopening — slightly less squeezed demand.",
  },
  12: {
    month: 12,
    year: 2027,
    dates: [1, 2, 3, 8, 9, 10, 15, 23, 24],
    quality: "excellent",
    notes: "9 projected dates — strong holiday-season wedding window.",
  },
};

const BLOCKED_2027: BlockedPeriod[] = [
  {
    tradition: "hindu-general",
    start: "2027-07-14",
    end: "2027-11-08",
    name: "Chaturmas",
    shortLabel: "Chaturmas",
    explanation:
      "The four sacred months when Lord Vishnu is in divine sleep. Hindu weddings are traditionally not performed.",
  },
  {
    tradition: "hindu-general",
    start: "2027-09-15",
    end: "2027-09-29",
    name: "Pitru Paksha",
    shortLabel: "Pitru Paksha",
    explanation:
      "The 16-day period dedicated to honoring ancestors. Falls within Chaturmas. Especially avoided for weddings.",
  },
];

const DATE_DETAILS_2027: Record<string, { nakshatra?: string; tithi?: string; muhuratWindow?: { start: string; end: string }; notes?: string }> = {
  "2027-02-13": {
    nakshatra: "Rohini",
    tithi: "Saptami",
    muhuratWindow: { start: "07:30 AM", end: "01:00 PM" },
    notes: "Preliminary — strong projected Saturday muhurat.",
  },
  "2027-05-22": {
    nakshatra: "Anuradha",
    tithi: "Pratipada",
    muhuratWindow: { start: "07:00 AM", end: "01:15 PM" },
    notes: "Preliminary — peak May Saturday.",
  },
};

export const HINDU_MUHURAT_2027: YearMuhuratData = {
  year: 2027,
  tradition: "hindu-general",
  months: MONTHS_2027,
  blockedPeriods: BLOCKED_2027,
  dateDetails: DATE_DETAILS_2027,
};
