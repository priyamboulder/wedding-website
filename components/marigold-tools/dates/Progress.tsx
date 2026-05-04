"use client";

import styles from "./Progress.module.css";

type Props = {
  current: number;
  total: number;
};

export function Progress({ current, total }: Props) {
  const pct = ((current + 1) / total) * 100;
  return (
    <>
      <p className={styles.label}>
        Step <em>{current + 1}</em> of {total}
      </p>
      <div className={styles.bar} aria-hidden>
        <div className={styles.barFill} style={{ width: `${pct}%` }} />
      </div>
    </>
  );
}
