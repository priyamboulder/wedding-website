'use client';

// Tap-to-rank — first tap is #1, second #2, third #3. Tapping a ranked
// item again removes it (and rebases the remaining ranks). When all 3 are
// chosen we reveal the auto-advance, but we also show a button so the
// interaction feels deliberate.

import { useState } from 'react';
import shared from '../Question.module.css';
import styles from './Q6Priorities.module.css';
import { PRIORITY_OPTIONS } from '@/lib/brief/options';
import type { Priority } from '@/lib/brief/types';

type Triple = [Priority, Priority, Priority];

export function Question6Priorities({
  value,
  onSubmit,
}: {
  value: Triple | null;
  onSubmit: (v: Triple) => void;
}) {
  const [picked, setPicked] = useState<Priority[]>(value ? [...value] : []);

  const rankOf = (p: Priority) => {
    const idx = picked.indexOf(p);
    return idx >= 0 ? idx + 1 : null;
  };

  const toggle = (p: Priority) => {
    if (picked.includes(p)) {
      setPicked(picked.filter((x) => x !== p));
      return;
    }
    if (picked.length >= 3) return;
    setPicked([...picked, p]);
  };

  const ready = picked.length === 3;

  return (
    <>
      <header className={shared.questionHeader}>
        <h2 className={shared.title}>Rank your top 3 priorities.</h2>
        <p className={shared.subtitle}>
          Where should the budget go? Tap in order — first tap is #1.
        </p>
      </header>

      <div className={styles.grid}>
        {PRIORITY_OPTIONS.map((opt) => {
          const rank = rankOf(opt.value);
          const isPicked = rank !== null;
          const isFull = !isPicked && picked.length >= 3;
          return (
            <button
              key={opt.value}
              type="button"
              className={styles.tile}
              data-selected={isPicked}
              data-disabled={isFull}
              onClick={() => toggle(opt.value)}
              aria-pressed={isPicked}
            >
              {rank !== null && <span className={styles.rank}>{rank}</span>}
              <span className={styles.icon} aria-hidden="true">{opt.icon}</span>
              <span className={styles.label}>{opt.label}</span>
            </button>
          );
        })}
      </div>

      <div className={styles.footer}>
        <span className={styles.counter}>
          {picked.length} of 3 selected
        </span>
        <button
          type="button"
          className={styles.cta}
          disabled={!ready}
          onClick={() => ready && onSubmit(picked as Triple)}
        >
          Continue <span aria-hidden="true">→</span>
        </button>
      </div>
    </>
  );
}
