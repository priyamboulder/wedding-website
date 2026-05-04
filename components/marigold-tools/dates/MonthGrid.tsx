"use client";

// ──────────────────────────────────────────────────────────────────────────
// MonthGrid — a single month rendered as a 7-column grid with color-coded
// day cells. Each cell announces its tradition status via class names so
// the legend / popover stays consistent.
// ──────────────────────────────────────────────────────────────────────────

import type { AuspiciousDate, DateStatus } from "@/types/auspicious-date";
import type { FilterMatch } from "@/lib/auspicious-date";

import styles from "./MonthGrid.module.css";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

type Props = {
  year: number;
  month: number; // 1..12
  dates: AuspiciousDate[];
  matchIndex: Map<string, FilterMatch>;
  shortlistedSet: Set<string>;
  onSelectDate: (d: AuspiciousDate) => void;
};

export function MonthGrid({
  year,
  month,
  dates,
  matchIndex,
  shortlistedSet,
  onSelectDate,
}: Props) {
  const monthDates = dates.filter((d) => parseInt(d.date.slice(5, 7), 10) === month);
  const firstOfMonth = new Date(year, month - 1, 1);
  const startDay = firstOfMonth.getDay(); // 0 = Sunday
  const daysInMonth = monthDates.length;

  // Pad with leading blanks
  const cells: (AuspiciousDate | null)[] = Array(startDay).fill(null);
  for (const d of monthDates) cells.push(d);
  // Pad to multiple of 7
  while (cells.length % 7 !== 0) cells.push(null);

  // Total auspicious in month — for the header chip
  const auspiciousCount = monthDates.filter((d) =>
    d.traditions.some((t) => t.status === "highly-auspicious" || t.status === "auspicious"),
  ).length;
  const blockedCount = monthDates.filter((d) =>
    d.traditions.some((t) => t.status === "blocked"),
  ).length;

  return (
    <article className={styles.month}>
      <header className={styles.monthHeader}>
        <h3 className={styles.monthName}>{MONTH_NAMES[month - 1]}</h3>
        <div className={styles.monthMeta}>
          {auspiciousCount > 0 && (
            <span className={[styles.metaChip, styles.metaChipGold].join(" ")}>
              {auspiciousCount} auspicious
            </span>
          )}
          {blockedCount === daysInMonth && daysInMonth > 0 && (
            <span className={[styles.metaChip, styles.metaChipRose].join(" ")}>
              fully blocked
            </span>
          )}
        </div>
      </header>

      <div className={styles.weekdayRow} aria-hidden>
        {DAY_LABELS.map((d, i) => (
          <span key={i} className={styles.weekdayLabel}>
            {d}
          </span>
        ))}
      </div>

      <div className={styles.grid}>
        {cells.map((c, i) => {
          if (!c) {
            return <span key={i} className={styles.blank} aria-hidden />;
          }
          const day = parseInt(c.date.slice(8, 10), 10);
          const status = combinedStatus(c);
          const match = matchIndex.get(c.date);
          const filtersOk = match?.matchesAll ?? true;
          const isShortlisted = shortlistedSet.has(c.date);
          const isSweetSpot =
            (status === "highly-auspicious" || status === "auspicious") &&
            filtersOk &&
            c.weather.weatherScore >= 4;
          return (
            <button
              key={c.date}
              type="button"
              onClick={() => onSelectDate(c)}
              className={[
                styles.cell,
                statusClass(status),
                filtersOk ? "" : styles.cellDimmed,
                isSweetSpot ? styles.cellSweet : "",
                isShortlisted ? styles.cellShortlisted : "",
              ]
                .filter(Boolean)
                .join(" ")}
              aria-label={`${MONTH_NAMES[month - 1]} ${day}, ${year} — ${humanStatus(status)}`}
            >
              <span className={styles.cellDay}>{day}</span>
              {isShortlisted && <span className={styles.cellStar} aria-hidden>★</span>}
            </button>
          );
        })}
      </div>
    </article>
  );
}

function combinedStatus(d: AuspiciousDate): DateStatus {
  if (d.traditions.length === 0) return "neutral";
  if (d.traditions.some((t) => t.status === "blocked")) return "blocked";
  if (d.traditions.some((t) => t.status === "avoid")) return "avoid";
  if (d.traditions.some((t) => t.status === "highly-auspicious")) return "highly-auspicious";
  if (d.traditions.some((t) => t.status === "auspicious")) return "auspicious";
  return "neutral";
}

function statusClass(s: DateStatus): string {
  switch (s) {
    case "highly-auspicious":
      return styles.cellGoldDeep;
    case "auspicious":
      return styles.cellGoldSoft;
    case "avoid":
      return styles.cellRose;
    case "blocked":
      return styles.cellBurgundy;
    case "neutral":
    default:
      return styles.cellNeutral;
  }
}

function humanStatus(s: DateStatus): string {
  switch (s) {
    case "highly-auspicious":
      return "highly auspicious";
    case "auspicious":
      return "auspicious";
    case "avoid":
      return "avoid";
    case "blocked":
      return "blocked";
    default:
      return "neutral";
  }
}
