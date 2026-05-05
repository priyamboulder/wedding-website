'use client';

import shared from '../Question.module.css';
import styles from './Q4Vibe.module.css';
import { VIBE_OPTIONS } from '@/lib/brief/options';
import type { Vibe } from '@/lib/brief/types';

export function Question4Vibe({
  value,
  onPick,
}: {
  value: Vibe | null;
  onPick: (v: Vibe) => void;
}) {
  return (
    <>
      <header className={shared.questionHeader}>
        <h2 className={shared.title}>Pick the mood that feels most like your wedding.</h2>
        <p className={shared.subtitle}>
          Go with your gut. There&apos;s no wrong answer.
        </p>
      </header>

      <div className={styles.grid}>
        {VIBE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            className={styles.tile}
            data-selected={value === opt.value}
            onClick={() => onPick(opt.value)}
          >
            <div className={styles.swatches} aria-hidden="true">
              {opt.palette.map((c, i) => (
                <span key={i} style={{ background: c }} />
              ))}
            </div>
            <div className={styles.body}>
              <div className={styles.name}>{opt.label}</div>
              <div className={styles.tagline}>{opt.tagline}</div>
            </div>
          </button>
        ))}
      </div>
    </>
  );
}
