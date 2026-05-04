"use client";

import styles from "./Welcome.module.css";

type Props = {
  onStart: () => void;
};

export function Welcome({ onStart }: Props) {
  return (
    <div className={styles.card}>
      <span className={styles.scrawl}>✦ the auspicious date finder</span>
      <h1 className={styles.heading}>
        When the stars say <em>yes</em>.
      </h1>
      <p className={styles.sub}>
        Every other wedding platform gives you a blank calendar. We give you a
        calendar that already knows which dates are shubh, which are blocked,
        and why — layered with the practical filters your venue actually
        cares about.
      </p>

      <div className={styles.metaRow}>
        <span className={styles.metaPill}>Multi-tradition</span>
        <span className={styles.metaPill}>2026 + 2027</span>
        <span className={styles.metaPill}>No signup</span>
      </div>

      <button type="button" className={styles.cta} onClick={onStart}>
        Find your date →
      </button>
      <p className={styles.footnote}>
        Your pandit confirms the pick. We help you narrow the field.
      </p>
    </div>
  );
}
