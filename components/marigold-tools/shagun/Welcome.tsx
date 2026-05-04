"use client";

import type { Mode } from "@/types/shagun";

import styles from "./Welcome.module.css";

type Props = {
  onPick: (mode: Mode) => void;
};

export function Welcome({ onPick }: Props) {
  return (
    <div className={styles.card}>
      <span className={styles.scrawl}>✿ the shagun calculator</span>
      <h1 className={styles.heading}>
        How much do you <em>actually</em> give?
      </h1>
      <p className={styles.sub}>
        The most-Googled, most-WhatsApp'd, most-awkward question in South Asian
        wedding culture. Tell us your relationship, their wedding, your
        tradition — we'll give you the real number. No more parking-lot panic.
      </p>

      <div className={styles.metaRow}>
        <span className={styles.metaPill}>US-dollar calibrated</span>
        <span className={styles.metaPill}>Every relationship tier</span>
        <span className={styles.metaPill}>No signup</span>
      </div>

      <div className={styles.modeRow}>
        <button
          type="button"
          className={styles.modeCard}
          onClick={() => onPick("guest")}
        >
          <span className={styles.modeBadge}>I'm a guest</span>
          <span className={styles.modeTitle}>How much should I give?</span>
          <p className={styles.modeBody}>
            One specific number, calibrated to your relationship and the
            wedding's scale. Takes under a minute.
          </p>
          <span className={styles.modeArrow}>Calculate shagun →</span>
        </button>

        <button
          type="button"
          className={styles.modeCard}
          onClick={() => onPick("couple")}
        >
          <span className={styles.modeBadge}>We're the couple</span>
          <span className={styles.modeTitle}>How much should we expect?</span>
          <p className={styles.modeBody}>
            Estimate total shagun coming in by guest tier — useful for
            post-wedding budget planning.
          </p>
          <span className={styles.modeArrow}>Estimate total →</span>
        </button>
      </div>

      <p className={styles.footnote}>
        Your mom already knows the answer. This just confirms it.
      </p>
    </div>
  );
}
