"use client";

import type { ChoiceOption } from "./questions";

import styles from "./StepCard.module.css";

type SingleProps<V extends string> = {
  step: number;
  total: number;
  eyebrow?: string;
  heading: React.ReactNode;
  sub?: string;
  helper?: string;
  options: ChoiceOption<V>[];
  value: V | null;
  onChange: (v: V) => void;
  onNext: () => void;
  onBack?: () => void;
  twoCol?: boolean;
  primaryLabel?: string;
};

export function SingleSelectStep<V extends string>({
  step,
  total,
  eyebrow,
  heading,
  sub,
  helper,
  options,
  value,
  onChange,
  onNext,
  onBack,
  twoCol,
  primaryLabel = "Continue →",
}: SingleProps<V>) {
  return (
    <div className={styles.card}>
      <span className={styles.eyebrow}>
        {eyebrow ?? `Step ${step} of ${total}`}
      </span>
      <h2 className={styles.heading}>{heading}</h2>
      {sub && <p className={styles.sub}>{sub}</p>}
      {helper && <p className={styles.helper}>{helper}</p>}

      <div
        className={[
          styles.choiceList,
          twoCol ? styles.choiceListTwoCol : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {options.map((opt) => {
          const selected = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={[
                styles.choiceBtn,
                selected ? styles.choiceBtnSelected : "",
              ]
                .filter(Boolean)
                .join(" ")}
              aria-pressed={selected}
            >
              <span className={styles.choiceLabel}>{opt.label}</span>
              {opt.sub && <span className={styles.choiceSub}>{opt.sub}</span>}
            </button>
          );
        })}
      </div>

      <div className={styles.actions}>
        {onBack ? (
          <button type="button" className={styles.backBtn} onClick={onBack}>
            ← back
          </button>
        ) : (
          <span />
        )}
        <button
          type="button"
          className={styles.primaryBtn}
          onClick={onNext}
          disabled={!value}
        >
          {primaryLabel}
        </button>
      </div>
    </div>
  );
}

type MultiProps<V extends string> = {
  step: number;
  total: number;
  eyebrow?: string;
  heading: React.ReactNode;
  sub?: string;
  helper?: string;
  options: ChoiceOption<V>[];
  value: V[];
  onToggle: (v: V) => void;
  onNext: () => void;
  onBack?: () => void;
  twoCol?: boolean;
  primaryLabel?: string;
  exclusive?: V; // an option that, when selected, clears the rest (e.g. "none")
};

export function MultiSelectStep<V extends string>({
  step,
  total,
  eyebrow,
  heading,
  sub,
  helper,
  options,
  value,
  onToggle,
  onNext,
  onBack,
  twoCol,
  primaryLabel = "Continue →",
}: MultiProps<V>) {
  return (
    <div className={styles.card}>
      <span className={styles.eyebrow}>
        {eyebrow ?? `Step ${step} of ${total}`}
      </span>
      <h2 className={styles.heading}>{heading}</h2>
      {sub && <p className={styles.sub}>{sub}</p>}
      {helper && <p className={styles.helper}>{helper}</p>}

      <div
        className={[
          styles.choiceList,
          twoCol ? styles.choiceListTwoCol : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {options.map((opt) => {
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
              {opt.sub && <span className={styles.choiceSub}>{opt.sub}</span>}
            </button>
          );
        })}
      </div>

      <div className={styles.actions}>
        {onBack ? (
          <button type="button" className={styles.backBtn} onClick={onBack}>
            ← back
          </button>
        ) : (
          <span />
        )}
        <button
          type="button"
          className={styles.primaryBtn}
          onClick={onNext}
        >
          {primaryLabel}
        </button>
      </div>
    </div>
  );
}
