'use client';

// Transition shown while we POST the answers to /api/brief.
// Three lines fade in/out in sequence (~2.4s total) and a thin gold line
// draws across the screen as the visual progress signal. If the request
// errors out we surface a retry button instead of locking the user out.

import { useEffect, useState } from 'react';
import styles from './Transition.module.css';

const LINES = [
  'Crunching the numbers...',
  'Building your timeline...',
  'Your Brief is ready.',
];

export function Transition({
  error,
  onRetry,
}: {
  error: string | null;
  onRetry: () => void;
}) {
  const [lineIdx, setLineIdx] = useState(0);

  useEffect(() => {
    if (error) return;
    const t1 = setTimeout(() => setLineIdx(1), 900);
    const t2 = setTimeout(() => setLineIdx(2), 1800);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [error]);

  if (error) {
    return (
      <div className={styles.root}>
        <div className={styles.errorBlock}>
          <h2 className={styles.errorTitle}>That didn&apos;t go through.</h2>
          <p className={styles.errorBody}>{error}</p>
          <button type="button" className={styles.retry} onClick={onRetry}>
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.root}>
      <div className={styles.line} aria-live="polite">
        {LINES.map((line, i) => (
          <p
            key={i}
            className={styles.lineItem}
            data-active={i === lineIdx}
            data-past={i < lineIdx}
          >
            {line}
          </p>
        ))}
      </div>

      <div className={styles.bar} aria-hidden="true">
        <div className={styles.barInk} />
      </div>
    </div>
  );
}
