// ──────────────────────────────────────────────────────────────────────────
// Hindu Panchang muhurat dates for 2026 (general / north-indian baseline).
//
// Source: synthesis of widely published 2026 Panchang muhurat lists. Regional
// traditions vary — the tool surfaces a "confirm with your family pandit"
// note. Dates here are the gold-highlighted days; the rest of the calendar
// renders as neutral or blocked depending on the surrounding period.
//
// This file is data, not logic. Swap it out annually as new Panchang data
// is published (typically Oct–Nov of the prior year).
// ──────────────────────────────────────────────────────────────────────────

import type { BlockedPeriod, MonthQuality, YearMuhuratData } from "@/types/auspicious-date";

const MONTHS_2026: Record<number, MonthQuality> = {
  1: {
    month: 1,
    year: 2026,
    dates: [14, 23, 25, 28],
    quality: "limited",
    notes:
      "Limited muhurats this month — Venus combustion suppresses most dates. Jan 25 (Revati nakshatra) is the strongest pick.",
  },
  2: {
    month: 2,
    year: 2026,
    dates: [5, 6, 8, 10, 12, 14, 19, 20, 21, 24, 25, 26],
    quality: "excellent",
    notes:
      "12 muhurat dates — one of the strongest months of the year. Feb 19 is widely considered the most auspicious. Pleasant DFW weather.",
  },
  3: {
    month: 3,
    year: 2026,
    dates: [2, 3, 4, 7, 8, 9, 11, 12],
    quality: "good",
    notes: "8 muhurat dates clustered in the first half. Spring weather across most US cities.",
  },
  4: {
    month: 4,
    year: 2026,
    dates: [15, 20, 21, 25, 26, 27, 28, 29],
    quality: "good",
    notes: "Strong second half of the month. Peak DFW spring — ideal outdoor weather.",
  },
  5: {
    month: 5,
    year: 2026,
    dates: [1, 3, 5, 6, 7, 8, 13, 14],
    quality: "excellent",
    notes:
      "Peak wedding season — May is the most popular month across the Hindu calendar. All dates fall before Adhik Maas begins.",
    warning: "Adhik Maas begins ~May 17. No muhurats from then until mid-June.",
  },
  6: {
    month: 6,
    year: 2026,
    dates: [21, 22, 23, 24, 25, 26, 27, 29],
    quality: "good",
    notes:
      "Post-Adhik Maas window — 8 dates clustered in the last 10 days. DFW heat (~95°F) — plan for indoor venues.",
    warning: "Adhik Maas ends ~June 15. Muhurats resume after.",
  },
  7: {
    month: 7,
    year: 2026,
    dates: [1, 6, 7, 11],
    quality: "limited",
    notes:
      "Only 4 dates before Chaturmas. After ~July 25, full blackout for nearly four months.",
    warning: "Chaturmas begins ~July 25. Last muhurats of the summer.",
  },
  8: {
    month: 8,
    year: 2026,
    dates: [],
    quality: "blocked",
    notes: "No muhurats — Chaturmas. Lord Vishnu in divine sleep.",
  },
  9: {
    month: 9,
    year: 2026,
    dates: [],
    quality: "blocked",
    notes: "No muhurats — Chaturmas + Pitru Paksha.",
  },
  10: {
    month: 10,
    year: 2026,
    dates: [],
    quality: "blocked",
    notes: "No muhurats — Chaturmas through mid-November.",
  },
  11: {
    month: 11,
    year: 2026,
    dates: [21, 24, 25, 26],
    quality: "limited",
    notes:
      "Wedding season reopens after Devutthana Ekadashi (~Nov 19–20). Only 4 dates carry the pent-up demand of 4 blocked months.",
    warning: "Extreme demand. Book venues 18+ months in advance.",
  },
  12: {
    month: 12,
    year: 2026,
    dates: [2, 3, 4, 5, 6, 11, 12],
    quality: "good",
    notes:
      "7 muhurat dates. Holiday season works well for NRI families flying in. Pleasant DFW weather.",
  },
};

const BLOCKED_2026: BlockedPeriod[] = [
  {
    tradition: "hindu-general",
    start: "2026-05-17",
    end: "2026-06-15",
    name: "Adhik Maas",
    shortLabel: "Adhik Maas",
    explanation:
      "The intercalary month — dedicated to Lord Vishnu as Purushottam. All auspicious ceremonies, including weddings, are traditionally paused.",
  },
  {
    tradition: "hindu-general",
    start: "2026-07-25",
    end: "2026-11-19",
    name: "Chaturmas",
    shortLabel: "Chaturmas",
    explanation:
      "The four sacred months when Lord Vishnu is in divine sleep. Hindu weddings are traditionally not performed. Most families honor this; some modern families proceed with their pandit's blessing.",
  },
  {
    tradition: "hindu-general",
    start: "2026-09-26",
    end: "2026-10-10",
    name: "Pitru Paksha",
    shortLabel: "Pitru Paksha",
    explanation:
      "The 16-day period dedicated to honoring ancestors. Falls within Chaturmas. Especially avoided for weddings.",
  },
];

const DATE_DETAILS_2026: Record<string, { nakshatra?: string; tithi?: string; muhuratWindow?: { start: string; end: string }; notes?: string }> = {
  "2026-01-25": {
    nakshatra: "Revati",
    tithi: "Saptami",
    muhuratWindow: { start: "07:30 AM", end: "12:45 PM" },
    notes: "Strongest January date — Revati nakshatra is highly favorable for weddings.",
  },
  "2026-02-19": {
    nakshatra: "Uttara Phalguni",
    tithi: "Dashami",
    muhuratWindow: { start: "07:15 AM", end: "01:30 PM" },
    notes: "Widely considered the most auspicious date of the year. Saturday muhurat — extreme demand.",
  },
  "2026-02-21": {
    nakshatra: "Hasta",
    tithi: "Dwadashi",
    muhuratWindow: { start: "08:00 AM", end: "02:15 PM" },
  },
  "2026-04-26": {
    nakshatra: "Mrigashira",
    tithi: "Navami",
    muhuratWindow: { start: "06:45 AM", end: "12:00 PM" },
    notes: "Peak spring date with strong nakshatra alignment.",
  },
  "2026-05-07": {
    nakshatra: "Magha",
    tithi: "Ekadashi",
    muhuratWindow: { start: "07:00 AM", end: "01:45 PM" },
    notes: "Last great spring window before Adhik Maas.",
  },
  "2026-11-21": {
    nakshatra: "Bharani",
    tithi: "Dwadashi",
    muhuratWindow: { start: "08:30 AM", end: "02:45 PM" },
    notes: "First Saturday after Chaturmas reopens — book venues 18+ months out.",
  },
  "2026-12-05": {
    nakshatra: "Uttara Bhadrapada",
    tithi: "Panchami",
    muhuratWindow: { start: "08:15 AM", end: "01:30 PM" },
    notes: "Strong Saturday muhurat — pleasant DFW weather, NRI-friendly month.",
  },
};

export const HINDU_MUHURAT_2026: YearMuhuratData = {
  year: 2026,
  tradition: "hindu-general",
  months: MONTHS_2026,
  blockedPeriods: BLOCKED_2026,
  dateDetails: DATE_DETAILS_2026,
};
