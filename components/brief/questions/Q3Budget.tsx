'use client';

import shared from '../Question.module.css';
import styles from './Q3Budget.module.css';
import { BUDGET_OPTIONS } from '@/lib/brief/options';
import type { Budget } from '@/lib/brief/types';

export function Question3Budget({
  value,
  onPick,
}: {
  value: Budget | null;
  onPick: (v: Budget) => void;
}) {
  return (
    <>
      <header className={shared.questionHeader}>
        <h2 className={shared.title}>What&apos;s the total budget you&apos;re thinking?</h2>
        <p className={shared.subtitle}>
          Round numbers are fine. This powers your personalized cost breakdown.
        </p>
      </header>

      <div className={styles.stack}>
        {BUDGET_OPTIONS.map((opt) => {
          const isUnsure = opt.value === 'unsure';
          return (
            <button
              key={opt.value}
              type="button"
              className={`${styles.row} ${isUnsure ? styles.unsure : ''}`}
              data-selected={value === opt.value}
              onClick={() => onPick(opt.value)}
            >
              <span className={styles.label}>{opt.label}</span>
              {isUnsure && (
                <span className={styles.note}>
                  We&apos;ll show benchmark ranges instead.
                </span>
              )}
            </button>
          );
        })}
      </div>
    </>
  );
}
