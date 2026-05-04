"use client";

import { DEALBREAKER_LABELS } from "@/lib/match";
import type { DealbreakerSlug } from "@/types/match";

import styles from "./StepCard.module.css";

const DEALBREAKERS: { slug: DealbreakerSlug; icon: string; sub: string }[] = [
  { slug: "long_flights", icon: "✈", sub: "keep it under 10 hours" },
  { slug: "visa_hassles", icon: "📑", sub: "no embassy paperwork" },
  { slug: "no_beach", icon: "🚫", sub: "not a beach person" },
  { slug: "not_in_india", icon: "🌍", sub: "skip the homeland" },
  { slug: "not_outside_us", icon: "🇺🇸", sub: "stateside only" },
  { slug: "limited_indian_vendors", icon: "🌶", sub: "must have indian vendors" },
];

type Props = {
  value: DealbreakerSlug[];
  onToggle: (d: DealbreakerSlug) => void;
  onNext: () => void;
  onBack: () => void;
};

export function StepDealbreakers({ value, onToggle, onNext, onBack }: Props) {
  return (
    <div className={styles.card}>
      <span className={styles.eyebrow}>Step 4 of 4</span>
      <h2 className={styles.heading}>
        any <em>dealbreakers?</em>
      </h2>
      <p className={styles.sub}>
        Optional. Anything we should rule out before showing matches. Pick zero
        or pick all six.
      </p>

      <div className={styles.choiceGrid}>
        {DEALBREAKERS.map((d) => {
          const selected = value.includes(d.slug);
          return (
            <button
              key={d.slug}
              type="button"
              onClick={() => onToggle(d.slug)}
              className={[
                styles.choiceBtn,
                selected ? styles.choiceBtnDealbreaker : "",
              ]
                .filter(Boolean)
                .join(" ")}
              aria-pressed={selected}
            >
              <span className={styles.choiceIcon} aria-hidden>
                {d.icon}
              </span>
              <span className={styles.choiceLabel}>
                {DEALBREAKER_LABELS[d.slug]}
              </span>
              <span className={styles.choiceSub}>{d.sub}</span>
            </button>
          );
        })}
      </div>

      <div className={styles.actions}>
        <button type="button" className={styles.backBtn} onClick={onBack}>
          ← back
        </button>
        <button type="button" className={styles.primaryBtn} onClick={onNext}>
          Show me my matches ✿
        </button>
      </div>
    </div>
  );
}
