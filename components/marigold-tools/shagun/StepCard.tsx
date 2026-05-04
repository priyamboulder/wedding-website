"use client";

import type { ReactNode } from "react";

import styles from "./StepCard.module.css";

export interface ChoiceOption<V extends string> {
  value: V;
  label: string;
  sub?: string;
}

interface StepShellProps {
  step: number;
  total: number;
  eyebrow?: string;
  heading: ReactNode;
  sub?: string;
  helper?: string;
  children: ReactNode;
  onNext: () => void;
  onBack?: () => void;
  onSkip?: () => void;
  primaryLabel?: string;
  primaryDisabled?: boolean;
  skipLabel?: string;
}

export function StepShell({
  step,
  total,
  eyebrow,
  heading,
  sub,
  helper,
  children,
  onNext,
  onBack,
  onSkip,
  primaryLabel = "Continue →",
  primaryDisabled = false,
  skipLabel,
}: StepShellProps) {
  return (
    <div className={styles.card}>
      <span className={styles.eyebrow}>
        {eyebrow ?? `Step ${step} of ${total}`}
      </span>
      <h2 className={styles.heading}>{heading}</h2>
      {sub && <p className={styles.sub}>{sub}</p>}
      {helper && <p className={styles.helper}>{helper}</p>}

      {children}

      <div className={styles.actions}>
        {onBack ? (
          <button type="button" className={styles.backBtn} onClick={onBack}>
            ← back
          </button>
        ) : (
          <span />
        )}
        {onSkip && skipLabel && (
          <button type="button" className={styles.skipBtn} onClick={onSkip}>
            {skipLabel}
          </button>
        )}
        <button
          type="button"
          className={styles.primaryBtn}
          onClick={onNext}
          disabled={primaryDisabled}
        >
          {primaryLabel}
        </button>
      </div>
    </div>
  );
}

interface SubgroupProps<V extends string> {
  title: string;
  options: ChoiceOption<V>[];
  value: V | null;
  onChange: (v: V) => void;
  twoCol?: boolean;
}

export function Subgroup<V extends string>({
  title,
  options,
  value,
  onChange,
  twoCol,
}: SubgroupProps<V>) {
  return (
    <div className={styles.subgroup}>
      <p className={styles.subgroupTitle}>{title}</p>
      <ChoiceList
        options={options}
        value={value}
        onChange={onChange}
        twoCol={twoCol}
      />
    </div>
  );
}

interface ChoiceListProps<V extends string> {
  options: ChoiceOption<V>[];
  value: V | null;
  onChange: (v: V) => void;
  twoCol?: boolean;
}

export function ChoiceList<V extends string>({
  options,
  value,
  onChange,
  twoCol,
}: ChoiceListProps<V>) {
  return (
    <div
      className={[styles.choiceList, twoCol ? styles.choiceListTwoCol : ""]
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
  );
}

interface AmountFieldProps {
  label: string;
  value: number | null;
  onChange: (v: number | null) => void;
  placeholder?: string;
}

export function AmountField({
  label,
  value,
  onChange,
  placeholder = "e.g. 251",
}: AmountFieldProps) {
  return (
    <div className={styles.amountFieldWrap}>
      <label className={styles.amountLabel}>{label}</label>
      <div className={styles.amountFieldInner}>
        <span className={styles.dollar}>$</span>
        <input
          className={styles.amountInput}
          type="number"
          min={0}
          step={1}
          inputMode="numeric"
          placeholder={placeholder}
          value={value === null ? "" : String(value)}
          onChange={(e) => {
            const raw = e.target.value;
            if (raw === "") {
              onChange(null);
              return;
            }
            const n = Number(raw);
            onChange(Number.isFinite(n) && n >= 0 ? Math.floor(n) : null);
          }}
        />
      </div>
    </div>
  );
}
