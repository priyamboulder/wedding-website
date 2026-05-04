"use client";

import type { YearSummary } from "@/lib/auspicious-date";

import styles from "./SummaryCard.module.css";

const MONTH_ABBRS = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

type Props = {
  summary: YearSummary;
};

export function SummaryCard({ summary }: Props) {
  const blockedRange = formatBlockedRange(summary.blockedMonths);
  return (
    <article className={styles.card}>
      <span className={styles.eyebrow}>Your {summary.year} snapshot</span>

      <div className={styles.statRow}>
        <Stat label="Auspicious dates" value={summary.totalAuspicious} />
        <Stat label="On Saturdays" value={summary.auspiciousSaturdays} />
        <Stat label="Match all your filters" value={summary.matchingAllFilters} accent />
      </div>

      {blockedRange && (
        <p className={styles.blocked}>
          🔒 {blockedRange} blocked for traditional weddings
        </p>
      )}

      <p className={styles.insight}>{summary.insight}</p>
    </article>
  );
}

function Stat({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className={[styles.stat, accent ? styles.statAccent : ""].filter(Boolean).join(" ")}>
      <span className={styles.statValue}>{value}</span>
      <span className={styles.statLabel}>{label}</span>
    </div>
  );
}

function formatBlockedRange(months: number[]): string | null {
  if (months.length === 0) return null;
  if (months.length === 1) return MONTH_ABBRS[months[0]];
  // Find consecutive runs
  const sorted = [...months].sort((a, b) => a - b);
  return `${MONTH_ABBRS[sorted[0]]}–${MONTH_ABBRS[sorted[sorted.length - 1]]}`;
}
