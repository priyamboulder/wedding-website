'use client';

import shared from '../Question.module.css';
import { TIMELINE_OPTIONS } from '@/lib/brief/options';
import type { Timeline } from '@/lib/brief/types';

export function Question7Timeline({
  value,
  onPick,
}: {
  value: Timeline | null;
  onPick: (v: Timeline) => void;
}) {
  return (
    <>
      <header className={shared.questionHeader}>
        <h2 className={shared.title}>When are you getting married?</h2>
        <p className={shared.subtitle}>
          Even a rough season helps. We&apos;ll build your countdown from here.
        </p>
      </header>

      <div className={shared.pillStack}>
        {TIMELINE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            className={shared.pillCard}
            data-selected={value === opt.value}
            onClick={() => onPick(opt.value)}
          >
            <span className={shared.pillLabel}>{opt.label}</span>
            <span className={shared.pillSub}>{opt.description}</span>
          </button>
        ))}
      </div>
    </>
  );
}
