// ── Season helpers ──────────────────────────────────────────────────────────
// Derive a season bucket from a wedding date. The Discover grid groups brides
// by season so couples who are walking through the same months see each other
// first — that mirrors real-life friendship patterns far better than pure
// geography.

export type Season =
  | "spring"
  | "summer"
  | "fall"
  | "winter"
  | "also-planning"; // no date set

export interface SeasonKey {
  season: Season;
  year: number; // calendar year the season ends in (for winter that's Jan/Feb)
}

export interface SeasonGroup extends SeasonKey {
  id: string; // stable key, e.g. "fall-2026"
  label: string; // "fall 2026"
  range: string; // "Sep–Nov 2026"
}

const MONTH_TO_SEASON: Record<number, Exclude<Season, "also-planning">> = {
  0: "winter", // Jan
  1: "winter", // Feb
  2: "spring", // Mar
  3: "spring", // Apr
  4: "spring", // May
  5: "summer", // Jun
  6: "summer", // Jul
  7: "summer", // Aug
  8: "fall", // Sep
  9: "fall", // Oct
  10: "fall", // Nov
  11: "winter", // Dec
};

const SEASON_LABEL: Record<Exclude<Season, "also-planning">, string> = {
  spring: "spring",
  summer: "summer",
  fall: "fall",
  winter: "winter",
};

const SEASON_RANGE: Record<Exclude<Season, "also-planning">, string> = {
  spring: "Mar–May",
  summer: "Jun–Aug",
  fall: "Sep–Nov",
  winter: "Dec–Feb",
};

export function keyForDate(weddingDate?: string): SeasonKey {
  if (!weddingDate) return { season: "also-planning", year: 0 };
  const d = new Date(weddingDate);
  if (Number.isNaN(d.getTime())) return { season: "also-planning", year: 0 };
  const month = d.getMonth();
  const year = d.getFullYear();
  const season = MONTH_TO_SEASON[month];
  // Winter spans across the calendar boundary — Jan/Feb belong to the winter
  // whose header year is the year of those months (e.g. "winter 2026-27"
  // covers Dec 2026 + Jan/Feb 2027). We normalize Dec to year+1 so the group
  // key lines up for all three months.
  const groupYear = month === 11 ? year + 1 : year;
  return { season, year: groupYear };
}

export function seasonIdFromKey(key: SeasonKey): string {
  if (key.season === "also-planning") return "also-planning";
  return `${key.season}-${key.year}`;
}

export function seasonGroupFromKey(key: SeasonKey): SeasonGroup {
  if (key.season === "also-planning") {
    return {
      id: "also-planning",
      season: "also-planning",
      year: 0,
      label: "also planning",
      range: "date TBD",
    };
  }
  const base = SEASON_LABEL[key.season];
  // Winter reads naturally as "winter 2026-27"
  const label =
    key.season === "winter"
      ? `winter ${key.year - 1}-${String(key.year).slice(-2)}`
      : `${base} ${key.year}`;
  const range =
    key.season === "winter"
      ? `${SEASON_RANGE.winter} ${key.year - 1}-${String(key.year).slice(-2)}`
      : `${SEASON_RANGE[key.season]} ${key.year}`;
  return {
    id: seasonIdFromKey(key),
    season: key.season,
    year: key.year,
    label,
    range,
  };
}

export function seasonGroupFromDate(weddingDate?: string): SeasonGroup {
  return seasonGroupFromKey(keyForDate(weddingDate));
}

// Chronological sort key for groups. "also-planning" trails at the end.
export function seasonSortValue(key: SeasonKey): number {
  if (key.season === "also-planning") return Number.MAX_SAFE_INTEGER;
  const seasonOrder: Record<Exclude<Season, "also-planning">, number> = {
    winter: 0,
    spring: 1,
    summer: 2,
    fall: 3,
  };
  return key.year * 10 + seasonOrder[key.season];
}
