'use client';

import Link from 'next/link';
import styles from './Welcome.module.css';

export function Welcome({ onStart }: { onStart: () => void }) {
  return (
    <div className={styles.root}>
      <Link href="/" className={styles.close} aria-label="Close The Brief and return home">
        <span aria-hidden="true">×</span>
      </Link>
      <span className={`${styles.dot} ${styles.dot1}`} aria-hidden="true" />
      <span className={`${styles.dot} ${styles.dot2}`} aria-hidden="true" />
      <span className={`${styles.dot} ${styles.dot3}`} aria-hidden="true" />
      <span className={`${styles.dot} ${styles.dot4}`} aria-hidden="true" />
      <div className={styles.inner}>
        <span className={styles.subhead}>the brief</span>
        <h1 className={styles.headline}>
          Tell us about your wedding<br />
          <span className={styles.italic}>in 2 minutes.</span>
        </h1>
        <p className={styles.subtext}>
          We&apos;ll give you a personalized planning snapshot — your estimated
          budget breakdown, a timeline, a vibe profile, and what to do first.
          No signup required.
        </p>

        <button type="button" className={styles.cta} onClick={onStart}>
          <span>LET&apos;S GO</span>
          <span aria-hidden="true" className={styles.arrow}>→</span>
        </button>

        <p className={styles.fineprint}>7 questions · takes less than 2 minutes</p>
      </div>
    </div>
  );
}
