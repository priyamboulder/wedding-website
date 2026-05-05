'use client';

import shared from '../Question.module.css';
import { DESTINATION_OPTIONS } from '@/lib/brief/options';
import type { Destination } from '@/lib/brief/types';

export function Question5Destination({
  value,
  onPick,
}: {
  value: Destination | null;
  onPick: (v: Destination) => void;
}) {
  return (
    <>
      <header className={shared.questionHeader}>
        <h2 className={shared.title}>Where do you picture this happening?</h2>
        <p className={shared.subtitle}>Dream big. We&apos;ll tell you what&apos;s realistic.</p>
      </header>

      <div className={`${shared.cardGrid} ${shared['cardGrid--one']}`}>
        {DESTINATION_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            className={shared.optionCard}
            data-selected={value === opt.value}
            onClick={() => onPick(opt.value)}
          >
            <span className={shared.optionLabel}>{opt.label}</span>
            <span className={shared.optionDesc}>{opt.description}</span>
          </button>
        ))}
      </div>
    </>
  );
}
