"use client";

import styles from "./Loading.module.css";

export function Loading() {
  return (
    <div className={styles.wrap} role="status" aria-live="polite">
      <div className={styles.orbit} aria-hidden>
        <span className={styles.core} />
        <span className={`${styles.dot} ${styles.dot1}`} />
        <span className={`${styles.dot} ${styles.dot2}`} />
        <span className={`${styles.dot} ${styles.dot3}`} />
      </div>
      <p className={styles.line}>Mapping the planets to your year…</p>
      <p className={styles.sub}>Reading transits, plotting houses, building your timeline.</p>
    </div>
  );
}
