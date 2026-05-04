"use client";

import styles from "./Welcome.module.css";

type Props = {
  onStart: () => void;
};

export function Welcome({ onStart }: Props) {
  return (
    <div className={styles.card}>
      <span className={styles.scrawl}>✿ the readiness check</span>
      <h1 className={styles.heading}>
        Where do you <em>actually</em> stand?
      </h1>
      <p className={styles.sub}>
        Every couple thinks they're either way ahead or way behind. Let's find
        out for real — eight questions, two minutes, no signup.
      </p>

      <div className={styles.metaRow}>
        <span className={styles.metaPill}>2-minute assessment</span>
        <span className={styles.metaPill}>South Asian calibrated</span>
        <span className={styles.metaPill}>No signup</span>
      </div>

      <button type="button" className={styles.cta} onClick={onStart}>
        Let's go →
      </button>
      <p className={styles.footnote}>
        We'll tell you what to lock down this week — and what can wait.
      </p>
    </div>
  );
}
