'use client';

import shared from '../Question.module.css';
import styles from './Q2Guests.module.css';
import { GUEST_OPTIONS } from '@/lib/brief/options';
import type { Guests } from '@/lib/brief/types';

// Each card gets a different visual texture so "intimate" feels airy and
// "epic" feels rich — a tiny editorial flourish without an actual image.
const TEXTURE: Record<Guests, string> = {
  intimate: styles.intimate,
  classic: styles.classic,
  grand: styles.grand,
  epic: styles.epic,
};

const DOTS: Record<Guests, number> = {
  intimate: 3,
  classic: 6,
  grand: 12,
  epic: 24,
};

export function Question2Guests({
  value,
  onPick,
}: {
  value: Guests | null;
  onPick: (v: Guests) => void;
}) {
  return (
    <>
      <header className={shared.questionHeader}>
        <h2 className={shared.title}>How many guests are you expecting?</h2>
        <p className={shared.subtitle}>
          Yes, count your mom&apos;s college roommate. She&apos;s coming.
        </p>
      </header>

      <div className={styles.grid}>
        {GUEST_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            className={`${styles.card} ${TEXTURE[opt.value]}`}
            data-selected={value === opt.value}
            onClick={() => onPick(opt.value)}
          >
            <div className={styles.dots} aria-hidden="true">
              {Array.from({ length: DOTS[opt.value] }).map((_, i) => (
                <span key={i} />
              ))}
            </div>
            <div className={styles.body}>
              <div className={styles.name}>{opt.label}</div>
              <div className={styles.range}>{opt.range}</div>
              <div className={styles.desc}>{opt.description}</div>
            </div>
          </button>
        ))}
      </div>
    </>
  );
}
