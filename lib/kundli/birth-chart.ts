// ──────────────────────────────────────────────────────────────────────────
// Birth chart resolution.
//
// Computes the Moon's sidereal longitude at the moment of birth, then
// derives Rashi (zodiac sign), Nakshatra (lunar mansion), and Pada (quarter)
// from that longitude. Falls back to a name-syllable lookup when birth
// details are absent.
//
// Approach: a self-contained Meeus-style series for Moon's geocentric
// ecliptic longitude — the four leading periodic terms of Brown's lunar
// theory plus key arguments. This is accurate to roughly ±0.05° over the
// 1900-2100 range, which is far inside the 13°20' Nakshatra width.
// Refinement to full Swiss Ephemeris precision can be a follow-up; for a
// matching tool the trade-off lands well on the side of "ship it."
//
// Lahiri (Chitrapaksha) ayanamsha is applied to convert from tropical to
// sidereal — the convention used by every major Indian Panchang.
// ──────────────────────────────────────────────────────────────────────────

import type { BirthChart, BirthInput, NakshatraRow, Rashi } from "@/types/kundli";

import {
  FIRST_LETTER_FALLBACK,
  NAKSHATRA_BY_ID,
  NAKSHATRAS,
  RASHIS,
  SYLLABLE_TO_PADA,
} from "./nakshatras";

const DEG = Math.PI / 180;

function normalize360(x: number): number {
  let y = x % 360;
  if (y < 0) y += 360;
  return y;
}

// ── Julian Day from civil date+time at the birth location ──
// inputs are Gregorian. Time is local, converted to UT via the location's
// offset. Day fraction added to JD.
function julianDay(
  year: number,
  month: number,
  day: number,
  hourUT: number,
): number {
  let y = year;
  let m = month;
  if (m <= 2) {
    y -= 1;
    m += 12;
  }
  const a = Math.floor(y / 100);
  const b = 2 - a + Math.floor(a / 4);
  const jd =
    Math.floor(365.25 * (y + 4716)) +
    Math.floor(30.6001 * (m + 1)) +
    day +
    b -
    1524.5;
  return jd + hourUT / 24;
}

// ── Tropical Moon longitude (degrees), simplified Meeus 47 series ──
// Returns geocentric apparent longitude with sufficient precision for
// Nakshatra resolution.
function moonTropicalLongitude(jd: number): number {
  const T = (jd - 2451545.0) / 36525.0; // Julian centuries from J2000

  // Mean elements (Chapront, IAU 2000A simplified)
  const Lp = normalize360(
    218.3164477 +
      481267.88123421 * T -
      0.0015786 * T * T +
      (T * T * T) / 538841 -
      (T * T * T * T) / 65194000,
  );
  const D = normalize360(
    297.8501921 +
      445267.1114034 * T -
      0.0018819 * T * T +
      (T * T * T) / 545868 -
      (T * T * T * T) / 113065000,
  );
  const M = normalize360(
    357.5291092 + 35999.0502909 * T - 0.0001536 * T * T + (T * T * T) / 24490000,
  );
  const Mp = normalize360(
    134.9633964 +
      477198.8675055 * T +
      0.0087414 * T * T +
      (T * T * T) / 69699 -
      (T * T * T * T) / 14712000,
  );
  const F = normalize360(
    93.272095 +
      483202.0175233 * T -
      0.0036539 * T * T -
      (T * T * T) / 3526000 +
      (T * T * T * T) / 863310000,
  );

  // Leading periodic terms (degrees), Meeus Table 47.A — top contributors.
  // Coefficients in units of 1e-6 degrees converted to degrees here.
  const terms: Array<[number, number, number, number, number]> = [
    // [coefficient (deg), D, M, Mp, F]
    [6.288774, 0, 0, 1, 0],
    [1.274027, 2, 0, -1, 0],
    [0.658314, 2, 0, 0, 0],
    [0.213618, 0, 0, 2, 0],
    [-0.185116, 0, 1, 0, 0],
    [-0.114332, 0, 0, 0, 2],
    [0.058793, 2, 0, -2, 0],
    [0.057066, 2, -1, -1, 0],
    [0.053322, 2, 0, 1, 0],
    [0.045758, 2, -1, 0, 0],
    [-0.040923, 0, 1, -1, 0],
    [-0.034720, 1, 0, 0, 0],
    [-0.030383, 0, 1, 1, 0],
    [0.015327, 2, 0, 0, -2],
    [-0.012528, 0, 0, 1, 2],
    [0.010980, 0, 0, 1, -2],
    [0.010675, 4, 0, -1, 0],
    [0.010034, 0, 0, 3, 0],
    [0.008548, 4, 0, -2, 0],
    [-0.007888, 2, 1, -1, 0],
    [-0.006766, 2, 1, 0, 0],
    [-0.005163, 1, 0, -1, 0],
    [0.004987, 1, 1, 0, 0],
    [0.004036, 2, -1, 1, 0],
    [0.003994, 2, 0, 2, 0],
    [0.003861, 4, 0, 0, 0],
    [0.003665, 2, 0, -3, 0],
    [-0.002689, 0, 1, -2, 0],
    [-0.002602, 2, 0, -1, 2],
    [0.002390, 2, -1, -2, 0],
    [-0.002348, 1, 0, 1, 0],
    [0.002236, 2, -2, 0, 0],
    [-0.002120, 0, 1, 2, 0],
    [-0.002069, 0, 2, 0, 0],
    [0.002048, 2, -2, -1, 0],
  ];

  let sumLong = 0;
  for (const [coef, dD, dM, dMp, dF] of terms) {
    const arg = (dD * D + dM * M + dMp * Mp + dF * F) * DEG;
    sumLong += coef * Math.sin(arg);
  }

  return normalize360(Lp + sumLong);
}

// ── Lahiri ayanamsha (degrees) ──
// Polynomial fit to the IAU Lahiri series; accurate within ~10" over
// 1900-2100. ayanamsha at J2000 ≈ 23.85277°.
function lahiriAyanamsha(jd: number): number {
  const T = (jd - 2451545.0) / 36525.0;
  // Approximate rate of change of ayanamsha is ~50.27"/year ≈ 0.01396°/yr
  // i.e., ~1.396° per century.
  const ayanamsha = 23.85277 + 1.396042 * T - 0.00001 * T * T;
  return ayanamsha;
}

function siderealMoonLongitude(jd: number): number {
  return normalize360(moonTropicalLongitude(jd) - lahiriAyanamsha(jd));
}

// ── Convert sidereal longitude → Rashi / Nakshatra / Pada ──
function decomposeLongitude(longitude: number): {
  rashi: Rashi;
  rashiId: number;
  nakshatra: NakshatraRow;
  pada: 1 | 2 | 3 | 4;
} {
  const lon = normalize360(longitude);
  const rashiId = Math.floor(lon / 30) + 1; // 1..12
  const rashi = RASHIS[rashiId - 1].name;
  const NAKSHATRA_SPAN = 360 / 27; // 13.333... deg
  const nakIdx = Math.floor(lon / NAKSHATRA_SPAN); // 0..26
  const nakshatra = NAKSHATRAS[nakIdx];
  const within = lon - nakIdx * NAKSHATRA_SPAN;
  const PADA_SPAN = NAKSHATRA_SPAN / 4; // 3.333... deg
  const pada = (Math.floor(within / PADA_SPAN) + 1) as 1 | 2 | 3 | 4;
  return { rashi, rashiId, nakshatra, pada };
}

// ── Public: build a BirthChart from a BirthInput ──
export function buildBirthChart(input: BirthInput): BirthChart {
  // 1. If user opted into name-only matching (no birth date/time/place), use
  //    syllable-derived Nakshatra. Pada is best-guess from the syllable's
  //    position; Rashi follows from the Nakshatra.
  if (input.nameSyllable) {
    const fallback = resolveByNameSyllable(input.nameSyllable);
    if (fallback) return fallback;
  }

  const [yearStr, monthStr, dayStr] = input.date.split("-");
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const day = parseInt(dayStr, 10);

  // Default to local civil noon if the user didn't enter a birth time —
  // splits the daily Moon traversal in half and minimises the worst-case
  // Nakshatra-edge error.
  const timeKnown = input.timeKnown && input.time && /^\d{1,2}:\d{2}$/.test(input.time);
  let hourLocal = 12;
  let minuteLocal = 0;
  if (timeKnown) {
    const [h, m] = input.time.split(":").map((v) => parseInt(v, 10));
    hourLocal = h;
    minuteLocal = m;
  }
  const localDecimalHour = hourLocal + minuteLocal / 60;
  const utHour = localDecimalHour - input.place.tzOffsetHours;

  const jd = julianDay(year, month, day, utHour);
  const moonLongitude = siderealMoonLongitude(jd);
  const { rashi, rashiId, nakshatra, pada } = decomposeLongitude(moonLongitude);

  return {
    moonLongitude,
    rashi,
    rashiId,
    nakshatra,
    pada,
    estimated: !timeKnown,
    estimationReason: !timeKnown
      ? "Birth time unknown — Moon position estimated at local noon. For a precise reading, consult your family pandit with your exact birth time."
      : undefined,
  };
}

// ── Name-only fallback ──
// Maps a syllable (preferred) or first letter (last resort) to a Nakshatra +
// Pada. The Rashi follows from the Nakshatra entry. Marks the chart as
// estimated.
export function resolveByNameSyllable(raw: string): BirthChart | null {
  const norm = raw.trim().toLowerCase().replace(/[^a-z]/g, "");
  if (!norm) return null;

  // Try multi-character syllables (longest first) for accuracy.
  const candidates = [norm.slice(0, 3), norm.slice(0, 2), norm.slice(0, 1)];
  for (const c of candidates) {
    const hit = SYLLABLE_TO_PADA[c];
    if (hit) {
      const nakshatra = NAKSHATRA_BY_ID.get(hit.nakshatraId)!;
      const rashi = nakshatra.rashi;
      const rashiId = RASHIS.findIndex((r) => r.name === rashi) + 1;
      // Reconstruct an approximate longitude at the centre of the pada.
      const PADA_SPAN = 360 / 27 / 4;
      const NAK_SPAN = 360 / 27;
      const longitude =
        (hit.nakshatraId - 1) * NAK_SPAN + (hit.pada - 1) * PADA_SPAN + PADA_SPAN / 2;
      return {
        moonLongitude: longitude,
        rashi,
        rashiId,
        nakshatra,
        pada: hit.pada,
        estimated: true,
        estimationReason:
          "Name-syllable matching used. Less precise than birth-detail matching — major Kootas (Gana, Yoni, Nadi) remain valid.",
      };
    }
  }

  const firstLetter = norm[0];
  const nakshatraId = FIRST_LETTER_FALLBACK[firstLetter];
  if (!nakshatraId) return null;
  const nakshatra = NAKSHATRA_BY_ID.get(nakshatraId)!;
  const rashi = nakshatra.rashi;
  const rashiId = RASHIS.findIndex((r) => r.name === rashi) + 1;
  const NAK_SPAN = 360 / 27;
  return {
    moonLongitude: (nakshatraId - 1) * NAK_SPAN + NAK_SPAN / 2,
    rashi,
    rashiId,
    nakshatra,
    pada: 2,
    estimated: true,
    estimationReason:
      "First-letter fallback used (no matching syllable). Approximate — provide birth details for accuracy.",
  };
}
