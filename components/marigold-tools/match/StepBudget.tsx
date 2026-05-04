"use client";

import Link from "next/link";

import styles from "./StepCard.module.css";

const MIN = 50_000;
const MAX = 5_000_000;

const sliderToBudget = (s: number) => {
  const t = s / 1000;
  return Math.round(MIN * Math.pow(MAX / MIN, t));
};
const budgetToSlider = (b: number) => {
  const ratio = Math.log(b / MIN) / Math.log(MAX / MIN);
  return Math.max(0, Math.min(1000, Math.round(ratio * 1000)));
};

type Props = {
  value: number;
  onChange: (value: number) => void;
  onNext: () => void;
};

export function StepBudget({ value, onChange, onNext }: Props) {
  const sliderValue = budgetToSlider(value);

  return (
    <div className={styles.card}>
      <span className={styles.eyebrow}>Step 1 of 4</span>
      <h2 className={styles.heading}>
        what's the <em>number?</em>
      </h2>
      <p className={styles.sub}>
        Your total wedding budget — venues, vendors, paan stations, the lot.
        Round numbers are fine. We'll show you what fits.
      </p>

      <div className={styles.numberDisplay}>
        <span className={styles.dollar}>$</span>
        <input
          type="text"
          inputMode="numeric"
          className={styles.numberInput}
          value={value.toLocaleString("en-US")}
          onChange={(e) => {
            const raw = e.target.value.replace(/[^0-9]/g, "");
            const n = Number.parseInt(raw, 10);
            if (Number.isFinite(n)) onChange(n);
          }}
          aria-label="Total wedding budget"
        />
      </div>

      <input
        type="range"
        min={0}
        max={1000}
        value={sliderValue}
        onChange={(e) => onChange(sliderToBudget(Number(e.target.value)))}
        className={styles.slider}
        aria-label="Budget slider"
      />
      <div className={styles.ticks}>
        <span>$50K</span>
        <span>$250K</span>
        <span>$1M</span>
        <span>$5M</span>
      </div>

      <p className={styles.crossTool}>
        <em>not sure yet?</em>{" "}
        <Link href="/tools/budget/build" className={styles.crossToolLink}>
          use the budget tool first →
        </Link>
      </p>

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.primaryBtn}
          onClick={onNext}
          disabled={value < MIN || value > MAX}
        >
          That's the number →
        </button>
      </div>
    </div>
  );
}
