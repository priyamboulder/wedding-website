"use client";

import styles from "./Welcome.module.css";

type Props = {
  onStart: () => void;
};

export function Welcome({ onStart }: Props) {
  return (
    <div className={styles.card}>
      <div className={styles.celestial} aria-hidden>
        <span className={styles.star} style={{ top: "12%", left: "14%" }} />
        <span className={styles.star} style={{ top: "22%", left: "82%" }} />
        <span className={styles.star} style={{ top: "70%", left: "8%" }} />
        <span className={styles.star} style={{ top: "82%", left: "76%" }} />
        <span className={styles.star} style={{ top: "44%", left: "92%" }} />
        <span className={styles.star} style={{ top: "55%", left: "4%" }} />
      </div>
      <span className={styles.scrawl}>✦ kundli match</span>
      <h1 className={styles.heading}>
        Do your stars actually <em>align</em>?
      </h1>
      <p className={styles.sub}>
        The Ashtakoota compatibility report your family wants — designed so
        you actually understand it too. Full 36-point Guna Milan, dosha
        analysis, the works.
      </p>

      <div className={styles.metaRow}>
        <span className={styles.metaPill}>36 Guna Milan</span>
        <span className={styles.metaPill}>Dosha analysis</span>
        <span className={styles.metaPill}>No signup</span>
      </div>

      <button type="button" className={styles.cta} onClick={onStart}>
        Match our kundlis →
      </button>
      <p className={styles.footnote}>
        Your birth details stay in your browser. Nothing is stored, shared,
        or transmitted.
      </p>
    </div>
  );
}
