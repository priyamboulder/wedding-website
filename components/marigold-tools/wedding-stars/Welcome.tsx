"use client";

import styles from "./Welcome.module.css";

type Props = {
  onStart: () => void;
};

export function Welcome({ onStart }: Props) {
  return (
    <div className={styles.card}>
      <div className={styles.celestial} aria-hidden>
        <span className={styles.star} style={{ top: "10%", left: "12%" }} />
        <span className={styles.star} style={{ top: "20%", left: "84%" }} />
        <span className={styles.star} style={{ top: "70%", left: "6%" }} />
        <span className={styles.star} style={{ top: "82%", left: "78%" }} />
        <span className={styles.star} style={{ top: "44%", left: "94%" }} />
        <span className={styles.star} style={{ top: "55%", left: "3%" }} />
        <span className={styles.star} style={{ top: "32%", left: "48%" }} />
      </div>
      <span className={styles.scrawl}>✦ wedding stars</span>
      <h1 className={styles.heading}>
        Your cosmic <em>calendar</em> for every big decision.
      </h1>
      <p className={styles.sub}>
        Enter your Moon sign and your wedding date. We&rsquo;ll map the next 12
        months of planetary windows — when to book vendors, when to pause, and
        when the stars are practically begging you to go dress shopping.
      </p>

      <div className={styles.metaRow}>
        <span className={styles.metaPill}>Vedic transit based</span>
        <span className={styles.metaPill}>Personalized timeline</span>
        <span className={styles.metaPill}>No signup</span>
      </div>

      <button type="button" className={styles.cta} onClick={onStart}>
        Read your stars →
      </button>
      <p className={styles.footnote}>
        Your Moon sign (Chandra Rashi) is different from your Sun sign — and
        in Vedic astrology, it&rsquo;s the one that matters for timing.
      </p>
    </div>
  );
}
