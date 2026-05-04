"use client";

import type { Tradition } from "@/types/auspicious-date";
import styles from "./StepCard.module.css";

type Option = {
  value: Tradition;
  label: string;
  sub: string;
};

const TRADITIONS: Option[] = [
  {
    value: "hindu-general",
    label: "Hindu (Vedic / Panchang)",
    sub: "Muhurat based on nakshatra, tithi, and planetary positions. We'll show Chaturmas, Adhik Maas, and all blocked periods.",
  },
  {
    value: "sikh",
    label: "Sikh",
    sub: "We'll flag Gurpurab dates and Gurdwara booking patterns. Anand Karaj availability follows the Nanakshahi calendar.",
  },
  {
    value: "muslim",
    label: "Muslim (Hijri)",
    sub: "Favorable dates per the Islamic calendar. We'll mark Ramadan, the Hajj period, and Muharram.",
  },
  {
    value: "jain",
    label: "Jain",
    sub: "Aligned with Jain Panchang. Paryushana and Chaturmas periods marked.",
  },
  {
    value: "none",
    label: "No specific tradition",
    sub: "We're choosing on logistics, weather, and vibes. No auspicious system applied — but we'll still surface venue pricing and weather windows.",
  },
];

type Props = {
  value: Tradition[];
  onToggle: (v: Tradition) => void;
  onNext: () => void;
};

export function StepTradition({ value, onToggle, onNext }: Props) {
  const ready = value.length > 0;
  return (
    <div className={styles.card}>
      <span className={styles.eyebrow}>Step 1 of 3</span>
      <h2 className={styles.heading}>
        Which tradition guides your <em>date?</em>
      </h2>
      <p className={styles.sub}>
        This determines which auspicious calendar we use. Pick all that apply
        — fusion couples, we see you.
      </p>
      <p className={styles.helper}>Multi-select</p>

      <div className={styles.choiceList}>
        {TRADITIONS.map((opt) => {
          const selected = value.includes(opt.value);
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onToggle(opt.value)}
              className={[
                styles.choiceBtn,
                selected ? styles.choiceBtnSelected : "",
              ]
                .filter(Boolean)
                .join(" ")}
              aria-pressed={selected}
            >
              <span className={styles.choiceLabel}>{opt.label}</span>
              <span className={styles.choiceSub}>{opt.sub}</span>
            </button>
          );
        })}
      </div>

      <div className={styles.actions}>
        <span />
        <button
          type="button"
          className={styles.primaryBtn}
          onClick={onNext}
          disabled={!ready}
        >
          Continue →
        </button>
      </div>
    </div>
  );
}
