"use client";

import { PRIORITY_LABELS } from "@/lib/match";
import type { PrioritySlug } from "@/types/match";

import styles from "./StepCard.module.css";

const PRIORITIES: { slug: PrioritySlug; icon: string; sub: string }[] = [
  { slug: "scenic_beauty", icon: "🌄", sub: "the photo wins" },
  { slug: "cultural_immersion", icon: "🛕", sub: "feels like somewhere" },
  { slug: "convenient_for_indians", icon: "✈", sub: "auntie can fly easy" },
  { slug: "indian_vendors", icon: "🌶", sub: "haldi, paan, the works" },
  { slug: "exclusivity", icon: "🤫", sub: "no one's been here" },
  { slug: "beach", icon: "🌊", sub: "sand in the baraat" },
  { slug: "mountain", icon: "🏔", sub: "altitude, drama, fog" },
  { slug: "heritage", icon: "🏰", sub: "palace, manor, old stone" },
  { slug: "food_scene", icon: "🍽", sub: "the meals matter" },
  { slug: "nightlife", icon: "💃", sub: "afterparty energy" },
];

type Props = {
  value: PrioritySlug[];
  onToggle: (p: PrioritySlug) => void;
  onNext: () => void;
  onBack: () => void;
};

export function StepPriorities({ value, onToggle, onNext, onBack }: Props) {
  const remaining = 3 - value.length;
  return (
    <div className={styles.card}>
      <span className={styles.eyebrow}>Step 3 of 4</span>
      <h2 className={styles.heading}>
        what matters <em>most?</em>
      </h2>
      <p className={styles.sub}>
        Pick up to three. The thing you'd lose sleep over if it wasn't there.
        {value.length > 0 && (
          <span className={styles.subSelected}>
            {" "}
            — {remaining > 0 ? `${remaining} left` : "all 3 picked"}
          </span>
        )}
      </p>

      <div className={styles.choiceGrid}>
        {PRIORITIES.map((p) => {
          const selected = value.includes(p.slug);
          const disabled = !selected && value.length >= 3;
          return (
            <button
              key={p.slug}
              type="button"
              onClick={() => onToggle(p.slug)}
              disabled={disabled}
              className={[
                styles.choiceBtn,
                selected ? styles.choiceBtnSelected : "",
                disabled ? styles.choiceBtnDisabled : "",
              ]
                .filter(Boolean)
                .join(" ")}
              aria-pressed={selected}
            >
              <span className={styles.choiceIcon} aria-hidden>
                {p.icon}
              </span>
              <span className={styles.choiceLabel}>
                {PRIORITY_LABELS[p.slug]}
              </span>
              <span className={styles.choiceSub}>{p.sub}</span>
            </button>
          );
        })}
      </div>

      <div className={styles.actions}>
        <button type="button" className={styles.backBtn} onClick={onBack}>
          ← back
        </button>
        <button
          type="button"
          className={styles.primaryBtn}
          onClick={onNext}
          disabled={value.length === 0}
        >
          {value.length === 0 ? "Pick at least one" : "Got it →"}
        </button>
      </div>
    </div>
  );
}
