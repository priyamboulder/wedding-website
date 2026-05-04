"use client";

// ──────────────────────────────────────────────────────────────────────────
// CalendarView — the centerpiece. Renders 12-month grids per selected year
// with color-coded dates, a hover/tap popover, summary stats, insight card,
// and a shortlist drawer.
//
// We expect 1-2 years; the engine has already pre-computed everything.
// ──────────────────────────────────────────────────────────────────────────

import { useMemo, useState } from "react";

import type {
  AuspiciousDate,
  ShortlistedDate,
  UserFilters,
} from "@/types/auspicious-date";
import type { FilterMatch, YearSummary } from "@/lib/auspicious-date";

import { MonthGrid } from "./MonthGrid";
import { DateDetailPopover } from "./DateDetailPopover";
import { ShortlistDrawer } from "./ShortlistDrawer";
import { SummaryCard } from "./SummaryCard";
import { Legend } from "./Legend";
import styles from "./CalendarView.module.css";

interface YearBundle {
  year: number;
  dates: AuspiciousDate[];
  matches: FilterMatch[];
  summary: YearSummary;
}

type Props = {
  filters: UserFilters;
  years: YearBundle[];
  shortlist: ShortlistedDate[];
  onAddShortlist: (iso: string) => void;
  onRemoveShortlist: (iso: string) => void;
  onEditFilters: () => void;
  onReset: () => void;
};

export function CalendarView({
  filters,
  years,
  shortlist,
  onAddShortlist,
  onRemoveShortlist,
  onEditFilters,
  onReset,
}: Props) {
  const [selectedDate, setSelectedDate] = useState<AuspiciousDate | null>(null);
  const [shortlistOpen, setShortlistOpen] = useState(false);

  // Index dates by ISO for fast popover lookup
  const dateIndex = useMemo(() => {
    const map = new Map<string, AuspiciousDate>();
    for (const y of years) {
      for (const d of y.dates) map.set(d.date, d);
    }
    return map;
  }, [years]);

  const matchIndex = useMemo(() => {
    const map = new Map<string, FilterMatch>();
    for (const y of years) {
      for (const m of y.matches) map.set(m.date.date, m);
    }
    return map;
  }, [years]);

  const shortlistedSet = useMemo(
    () => new Set(shortlist.map((s) => s.isoDate)),
    [shortlist],
  );

  const isShortlisted = selectedDate ? shortlistedSet.has(selectedDate.date) : false;

  return (
    <div className={styles.wrap}>
      <div className={styles.toolbar}>
        <button
          type="button"
          className={styles.toolbarLink}
          onClick={onEditFilters}
        >
          ← edit filters
        </button>
        <div className={styles.toolbarSpacer} />
        <button
          type="button"
          className={styles.toolbarLink}
          onClick={onReset}
        >
          start over
        </button>
        <button
          type="button"
          className={styles.shortlistBtn}
          onClick={() => setShortlistOpen(true)}
        >
          ★ Shortlist <span className={styles.shortlistCount}>{shortlist.length}</span>
        </button>
      </div>

      {years.map((bundle) => (
        <YearBlock
          key={bundle.year}
          bundle={bundle}
          matchIndex={matchIndex}
          shortlistedSet={shortlistedSet}
          onSelectDate={(d) => setSelectedDate(d)}
        />
      ))}

      <Legend />

      {selectedDate && (
        <DateDetailPopover
          date={selectedDate}
          isShortlisted={isShortlisted}
          onClose={() => setSelectedDate(null)}
          onAddShortlist={() => {
            onAddShortlist(selectedDate.date);
          }}
          onRemoveShortlist={() => {
            onRemoveShortlist(selectedDate.date);
          }}
        />
      )}

      {shortlistOpen && (
        <ShortlistDrawer
          shortlist={shortlist}
          dateIndex={dateIndex}
          filters={filters}
          onClose={() => setShortlistOpen(false)}
          onRemove={onRemoveShortlist}
        />
      )}
    </div>
  );
}

function YearBlock({
  bundle,
  matchIndex,
  shortlistedSet,
  onSelectDate,
}: {
  bundle: YearBundle;
  matchIndex: Map<string, FilterMatch>;
  shortlistedSet: Set<string>;
  onSelectDate: (d: AuspiciousDate) => void;
}) {
  return (
    <section className={styles.yearBlock}>
      <header className={styles.yearHeader}>
        <h2 className={styles.yearTitle}>{bundle.year}</h2>
        <SummaryCard summary={bundle.summary} />
      </header>

      <div className={styles.monthsGrid}>
        {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
          <MonthGrid
            key={m}
            year={bundle.year}
            month={m}
            dates={bundle.dates}
            matchIndex={matchIndex}
            shortlistedSet={shortlistedSet}
            onSelectDate={onSelectDate}
          />
        ))}
      </div>
    </section>
  );
}
