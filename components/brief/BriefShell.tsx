'use client';

// Shared chrome for every quiz question:
// - "the brief" mark, top-left
// - thin progress bar + STEP X OF 7, top-center
// - "×" close, top-right (always-on exit to /)
// - back arrow, top-left below the brand
// - 320ms slide+fade between question children (keyed by stepIndex)
//
// Decorative gold/pink/mauve confetti dots match the homepage's "How It Works"
// section so the canvas doesn't read as a sterile form.

import Link from 'next/link';
import { useEffect, useState } from 'react';
import styles from './BriefShell.module.css';

const TOTAL_STEPS = 7;

export function BriefShell({
  stepIndex,
  onBack,
  children,
}: {
  stepIndex: number;
  onBack: () => void;
  children: React.ReactNode;
}) {
  // Force a remount on step change to play the slide-in animation.
  const [renderKey, setRenderKey] = useState(stepIndex);
  useEffect(() => setRenderKey(stepIndex), [stepIndex]);

  return (
    <div className={styles.root}>
      {/* Decorative scattered dots, like the homepage's How It Works canvas */}
      <span className={`${styles.dot} ${styles.dot1}`} aria-hidden="true" />
      <span className={`${styles.dot} ${styles.dot2}`} aria-hidden="true" />
      <span className={`${styles.dot} ${styles.dot3}`} aria-hidden="true" />
      <span className={`${styles.dot} ${styles.dot4}`} aria-hidden="true" />
      <span className={`${styles.dot} ${styles.dot5}`} aria-hidden="true" />
      <span className={`${styles.dot} ${styles.dot6}`} aria-hidden="true" />
      <span className={`${styles.dot} ${styles.dot7}`} aria-hidden="true" />
      <span className={`${styles.dot} ${styles.dot8}`} aria-hidden="true" />

      {/* Top row: brand label · progress · close — always pinned to viewport */}
      <div className={styles.topbar}>
        <span className={styles.brand}>the brief</span>

        <div className={styles.progress}>
          <span className={styles.stepLabel}>
            STEP {stepIndex} OF {TOTAL_STEPS}
          </span>
          <div className={styles.bar}>
            <div
              className={styles.barFill}
              style={{ width: `${(stepIndex / TOTAL_STEPS) * 100}%` }}
            />
          </div>
        </div>

        <Link href="/" className={styles.close} aria-label="Close The Brief and return home">
          <span aria-hidden="true">×</span>
        </Link>
      </div>

      {stepIndex > 1 && (
        <button
          type="button"
          className={styles.back}
          aria-label="Previous question"
          onClick={onBack}
        >
          <span aria-hidden="true">←</span>
          <span>Back</span>
        </button>
      )}

      <main className={styles.stage} key={renderKey}>
        {children}
      </main>
    </div>
  );
}
