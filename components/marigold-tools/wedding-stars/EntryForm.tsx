"use client";

import { useEffect, useId, useMemo, useState } from "react";

import { searchCities } from "@/lib/kundli/cities";
import type { City } from "@/lib/kundli/cities";
import { RASHIS } from "@/lib/kundli";
import type { Rashi } from "@/types/kundli";
import type {
  EntryMethod,
  WeddingDateInput,
  WeddingTimeline,
} from "@/types/wedding-stars";

import styles from "./EntryForm.module.css";

export interface BirthDraft {
  date: string;
  time: string;
  timeKnown: boolean;
  place: City | null;
}

type Props = {
  method: EntryMethod;
  rashi: Rashi | null;
  birth: BirthDraft;
  weddingDate: WeddingDateInput;
  onMethodChange: (m: EntryMethod) => void;
  onRashiChange: (r: Rashi) => void;
  onBirthChange: (b: BirthDraft) => void;
  onWeddingDateChange: (d: WeddingDateInput) => void;
  onSubmit: () => void;
  onBack: () => void;
};

export function EntryForm({
  method,
  rashi,
  birth,
  weddingDate,
  onMethodChange,
  onRashiChange,
  onBirthChange,
  onWeddingDateChange,
  onSubmit,
  onBack,
}: Props) {
  const dateId = useId();
  const timeId = useId();
  const placeId = useId();
  const weddingId = useId();

  const [placeQuery, setPlaceQuery] = useState(birth.place?.label ?? "");
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    setPlaceQuery(birth.place?.label ?? "");
  }, [birth.place]);

  const results = useMemo(() => searchCities(placeQuery, 6), [placeQuery]);

  const rashiReady = method === "rashi" ? !!rashi : Boolean(birth.date && birth.place);
  const dateReady =
    weddingDate.kind === "open" ||
    (weddingDate.kind === "specific-date" && !!weddingDate.iso) ||
    (weddingDate.kind === "approx-month" && !!weddingDate.ymKey);
  const ready = rashiReady && dateReady;

  return (
    <div className={styles.card}>
      <span className={styles.eyebrow}>Tell us your stars</span>
      <h2 className={styles.heading}>
        Your Moon sign <em>+</em> your wedding date.
      </h2>
      <p className={styles.sub}>
        Two inputs, one cosmic timeline. Your details stay on this device —
        nothing is saved or transmitted.
      </p>

      <fieldset className={styles.section}>
        <legend className={styles.sectionTitle}>Moon sign (Rashi)</legend>

        <div className={styles.methodRow} role="radiogroup" aria-label="Entry method">
          <button
            type="button"
            role="radio"
            aria-checked={method === "rashi"}
            className={`${styles.methodBtn} ${method === "rashi" ? styles.methodBtnActive : ""}`}
            onClick={() => onMethodChange("rashi")}
          >
            <span className={styles.methodLabel}>I know my Moon sign</span>
            <span className={styles.methodSub}>Pick from the list</span>
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={method === "birth"}
            className={`${styles.methodBtn} ${method === "birth" ? styles.methodBtnActive : ""}`}
            onClick={() => onMethodChange("birth")}
          >
            <span className={styles.methodLabel}>Find it for me</span>
            <span className={styles.methodSub}>From birth details</span>
          </button>
        </div>

        {method === "rashi" ? (
          <div className={styles.rashiGrid}>
            {RASHIS.map((r) => {
              const selected = rashi === r.name;
              return (
                <button
                  key={r.name}
                  type="button"
                  className={`${styles.rashiBtn} ${selected ? styles.rashiBtnSelected : ""}`}
                  onClick={() => onRashiChange(r.name)}
                >
                  <span className={styles.rashiLabel}>{r.name}</span>
                  <span className={styles.rashiSub}>{r.englishName}</span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className={styles.birthGrid}>
            <div className={styles.field}>
              <label className={styles.fieldLabel} htmlFor={dateId}>
                Date of birth
              </label>
              <input
                id={dateId}
                type="date"
                className={styles.input}
                value={birth.date}
                onChange={(e) => onBirthChange({ ...birth, date: e.target.value })}
                max="2010-12-31"
                min="1925-01-01"
              />
            </div>

            <div className={styles.field}>
              <label className={styles.fieldLabel} htmlFor={timeId}>
                Time of birth
              </label>
              <input
                id={timeId}
                type="time"
                className={styles.input}
                value={birth.time}
                disabled={!birth.timeKnown}
                onChange={(e) => onBirthChange({ ...birth, time: e.target.value })}
              />
              <label className={styles.checkboxRow}>
                <input
                  type="checkbox"
                  checked={!birth.timeKnown}
                  onChange={(e) =>
                    onBirthChange({
                      ...birth,
                      timeKnown: !e.target.checked,
                      time: e.target.checked ? "" : birth.time,
                    })
                  }
                />
                <span>I don&rsquo;t know the exact time</span>
              </label>
            </div>

            <div className={`${styles.field} ${styles.fieldFull}`}>
              <label className={styles.fieldLabel} htmlFor={placeId}>
                Place of birth
              </label>
              <div className={styles.autocomplete}>
                <input
                  id={placeId}
                  type="text"
                  className={styles.input}
                  placeholder="Mumbai, Dallas, London..."
                  value={placeQuery}
                  onChange={(e) => {
                    setPlaceQuery(e.target.value);
                    setShowResults(true);
                    if (birth.place && e.target.value !== birth.place.label) {
                      onBirthChange({ ...birth, place: null });
                    }
                  }}
                  onFocus={() => setShowResults(true)}
                  onBlur={() => setTimeout(() => setShowResults(false), 150)}
                  autoComplete="off"
                />
                {showResults && results.length > 0 && !birth.place && (
                  <ul className={styles.results}>
                    {results.map((c) => (
                      <li key={c.label}>
                        <button
                          type="button"
                          className={styles.resultBtn}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            onBirthChange({ ...birth, place: c });
                            setPlaceQuery(c.label);
                            setShowResults(false);
                          }}
                        >
                          {c.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <p className={styles.helper}>
              Same calculation engine our Kundli Match tool uses. Birth details
              never leave your device.
            </p>
          </div>
        )}
      </fieldset>

      <fieldset className={styles.section}>
        <legend className={styles.sectionTitle}>Wedding timeline</legend>

        <div className={styles.timelineRow} role="radiogroup" aria-label="Wedding timeline">
          {(
            [
              { key: "specific-date", label: "Specific date", sub: "Pick a day" },
              { key: "approx-month", label: "Approximate month", sub: "Month and year" },
              { key: "open", label: "Not set yet", sub: "Show me the year" },
            ] as { key: WeddingTimeline; label: string; sub: string }[]
          ).map((opt) => {
            const active = weddingDate.kind === opt.key;
            return (
              <button
                key={opt.key}
                type="button"
                role="radio"
                aria-checked={active}
                className={`${styles.timelineBtn} ${active ? styles.timelineBtnActive : ""}`}
                onClick={() =>
                  onWeddingDateChange({
                    kind: opt.key,
                    iso: opt.key === "specific-date" ? weddingDate.iso : undefined,
                    ymKey: opt.key === "approx-month" ? weddingDate.ymKey : undefined,
                  })
                }
              >
                <span className={styles.timelineLabel}>{opt.label}</span>
                <span className={styles.timelineSub}>{opt.sub}</span>
              </button>
            );
          })}
        </div>

        {weddingDate.kind === "specific-date" && (
          <div className={styles.field}>
            <label className={styles.fieldLabel} htmlFor={weddingId}>
              Wedding date
            </label>
            <input
              id={weddingId}
              type="date"
              className={styles.input}
              value={weddingDate.iso ?? ""}
              onChange={(e) =>
                onWeddingDateChange({
                  kind: "specific-date",
                  iso: e.target.value,
                })
              }
              min="2026-01-01"
              max="2027-12-31"
            />
          </div>
        )}

        {weddingDate.kind === "approx-month" && (
          <div className={styles.field}>
            <label className={styles.fieldLabel} htmlFor={weddingId}>
              Month and year
            </label>
            <input
              id={weddingId}
              type="month"
              className={styles.input}
              value={weddingDate.ymKey ?? ""}
              onChange={(e) =>
                onWeddingDateChange({
                  kind: "approx-month",
                  ymKey: e.target.value,
                })
              }
              min="2026-01"
              max="2027-12"
            />
          </div>
        )}
      </fieldset>

      <div className={styles.actions}>
        <button type="button" className={styles.backBtn} onClick={onBack}>
          ← Back
        </button>
        <button
          type="button"
          className={styles.primaryBtn}
          disabled={!ready}
          onClick={onSubmit}
        >
          Show my Wedding Stars →
        </button>
      </div>
    </div>
  );
}
