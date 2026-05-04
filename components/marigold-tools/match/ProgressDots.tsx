"use client";

import styles from "./ProgressDots.module.css";

const STEP_LABELS = ["the number", "the people", "what matters", "dealbreakers"];

type Props = {
  current: number;
  total: number;
  onJump: (step: number) => void;
};

export function ProgressDots({ current, total, onJump }: Props) {
  return (
    <ol className={styles.row} aria-label="Progress">
      {Array.from({ length: total }).map((_, idx) => {
        const isCurrent = idx === current;
        const isDone = idx < current;
        const label = STEP_LABELS[idx] ?? `Step ${idx + 1}`;
        return (
          <li key={idx} className={styles.item}>
            <button
              type="button"
              className={[
                styles.dot,
                isCurrent ? styles.dotCurrent : "",
                isDone ? styles.dotDone : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => isDone && onJump(idx)}
              disabled={!isDone}
              aria-current={isCurrent ? "step" : undefined}
              aria-label={label}
            >
              <span className={styles.index}>{idx + 1}</span>
            </button>
            <span
              className={[styles.label, isCurrent ? styles.labelCurrent : ""]
                .filter(Boolean)
                .join(" ")}
            >
              {label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
