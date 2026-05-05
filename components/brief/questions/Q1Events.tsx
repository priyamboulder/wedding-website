'use client';

import shared from '../Question.module.css';
import { EVENT_OPTIONS } from '@/lib/brief/options';
import type { Events } from '@/lib/brief/types';

export function Question1Events({
  value,
  onPick,
}: {
  value: Events | null;
  onPick: (v: Events) => void;
}) {
  return (
    <>
      <header className={shared.questionHeader}>
        <h2 className={shared.title}>How many events are you planning?</h2>
        <p className={shared.subtitle}>
          Most Indian weddings have 3–5. Some have 7. No judgment.
        </p>
      </header>

      <div className={`${shared.cardGrid} ${shared['cardGrid--two']}`}>
        {EVENT_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            className={shared.optionCard}
            data-selected={value === opt.value}
            onClick={() => onPick(opt.value)}
          >
            <span className={shared.optionMeta}>{opt.count}</span>
            <span className={shared.optionLabel}>{opt.label}</span>
            <span className={shared.optionDesc}>{opt.description}</span>
          </button>
        ))}
      </div>
    </>
  );
}
