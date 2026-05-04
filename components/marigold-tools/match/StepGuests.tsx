"use client";

import styles from "./StepCard.module.css";

const MIN = 50;
const MAX = 1500;

function guestLabel(n: number): string {
  if (n <= 100) return "intimate";
  if (n <= 300) return "medium";
  if (n <= 600) return "grand";
  if (n <= 1000) return "mega";
  return "the entire diaspora";
}

type Props = {
  value: number;
  onChange: (value: number) => void;
  onNext: () => void;
  onBack: () => void;
};

export function StepGuests({ value, onChange, onNext, onBack }: Props) {
  return (
    <div className={styles.card}>
      <span className={styles.eyebrow}>Step 2 of 4</span>
      <h2 className={styles.heading}>
        how many <em>people?</em>
      </h2>
      <p className={styles.sub}>
        The biggest event of the weekend — typically the reception. We'll size
        venues against this number.
      </p>

      <div className={styles.numberDisplay}>
        <input
          type="text"
          inputMode="numeric"
          className={styles.numberInput}
          value={value.toLocaleString("en-US")}
          onChange={(e) => {
            const raw = e.target.value.replace(/[^0-9]/g, "");
            const n = Number.parseInt(raw, 10);
            if (Number.isFinite(n)) onChange(Math.max(MIN, Math.min(MAX, n)));
          }}
          aria-label="Largest event guest count"
        />
      </div>
      <p className={styles.guestLabel}>
        <em>{guestLabel(value)}</em>
      </p>

      <input
        type="range"
        min={MIN}
        max={MAX}
        step={10}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={styles.slider}
        aria-label="Guest count slider"
      />
      <div className={styles.ticks}>
        <span>50</span>
        <span>300</span>
        <span>700</span>
        <span>1500</span>
      </div>

      <div className={styles.actions}>
        <button type="button" className={styles.backBtn} onClick={onBack}>
          ← back
        </button>
        <button type="button" className={styles.primaryBtn} onClick={onNext}>
          Sounds right →
        </button>
      </div>
    </div>
  );
}
