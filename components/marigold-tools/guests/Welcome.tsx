"use client";

import styles from "./Welcome.module.css";

type Props = { onStart: () => void };

export function Welcome({ onStart }: Props) {
  return (
    <div className={styles.card}>
      <span className={styles.scrawl}>✿ guest count estimator</span>
      <h1 className={styles.heading}>
        Let's build your <em>real</em> number.
      </h1>
      <p className={styles.sub}>
        Not a guess. Not your mom's estimate. An actual, arguable-with-data
        guest count — built from both sides, tier by tier, event by event.
      </p>

      <div className={styles.metaRow}>
        <span className={styles.metaPill}>3–5 minutes</span>
        <span className={styles.metaPill}>Both-sides breakdown</span>
        <span className={styles.metaPill}>Per-event estimates</span>
        <span className={styles.metaPill}>No signup</span>
      </div>

      <button type="button" className={styles.cta} onClick={onStart}>
        Let's count →
      </button>

      <div className={styles.notes}>
        <p className={styles.note}>
          Grab your partner — you'll want to do this together.
        </p>
        <p className={styles.note}>
          Everything stays in your browser. We don't store anything.
        </p>
      </div>
    </div>
  );
}
