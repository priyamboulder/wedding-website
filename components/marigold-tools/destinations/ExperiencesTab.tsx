'use client';

import { useMemo, useState } from 'react';
import type { BudgetLocationExperienceRow } from '@/types/budget';
import styles from './ExperiencesTab.module.css';

type ExperiencesTabProps = {
  experiences: BudgetLocationExperienceRow[];
  locationName: string;
};

const CATEGORY_FILTERS = [
  'all',
  'Cultural',
  'Food',
  'Adventure',
  'Entertainment',
  'Wellness',
] as const;

type Filter = (typeof CATEGORY_FILTERS)[number];

export function ExperiencesTab({ experiences, locationName }: ExperiencesTabProps) {
  const [filter, setFilter] = useState<Filter>('all');

  const filtered = useMemo(() => {
    if (filter === 'all') return experiences;
    return experiences.filter((e) => e.category === filter);
  }, [experiences, filter]);

  if (experiences.length === 0) {
    return (
      <div className={styles.empty}>
        <span className={styles.emptyScrawl}>moodboard pending ✿</span>
        <p>
          We&apos;re collecting the right kind of inspiration for {locationName} — the
          things you&apos;ll actually want to do, not a generic tourist list.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <h2 className={styles.heading}>
          <span className={styles.scrawl}>more than a venue</span>
          things to do in <em>{locationName}</em>
        </h2>
        <p className={styles.sub}>
          The moodboard. What guests will remember. Inspirational, not transactional —
          we don&apos;t book this stuff for you (yet).
        </p>
      </div>

      <div className={styles.filters}>
        {CATEGORY_FILTERS.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setFilter(cat)}
            className={[styles.filter, filter === cat ? styles.filterActive : '']
              .filter(Boolean)
              .join(' ')}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className={styles.grid}>
        {filtered.map((exp) => (
          <div key={exp.id} className={styles.card}>
            <span className={styles.icon} aria-hidden="true">
              {exp.icon || '✦'}
            </span>
            <h3 className={styles.name}>{exp.name}</h3>
            {exp.description && <p className={styles.description}>{exp.description}</p>}
            {exp.category && (
              <span className={styles.categoryTag}>{exp.category}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
