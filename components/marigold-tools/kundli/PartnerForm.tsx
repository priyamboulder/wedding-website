"use client";

import { useEffect, useId, useMemo, useState } from "react";

import { searchCities } from "@/lib/kundli/cities";
import type { City } from "@/lib/kundli/cities";

import styles from "./PartnerForm.module.css";

export interface PartnerDraft {
  name: string;
  date: string; // yyyy-mm-dd
  time: string; // HH:MM
  timeKnown: boolean;
  place: City | null;
}

type Props = {
  label: string;
  draft: PartnerDraft;
  onChange: (next: PartnerDraft) => void;
  hideTimeAndPlace?: boolean;
};

export function PartnerForm({ label, draft, onChange, hideTimeAndPlace }: Props) {
  const nameId = useId();
  const dateId = useId();
  const timeId = useId();
  const placeId = useId();

  const [placeQuery, setPlaceQuery] = useState(draft.place?.label ?? "");
  const [showResults, setShowResults] = useState(false);

  // When the parent overwrites the draft (e.g. swap or reset), keep the
  // visible query in sync with the canonical place.
  useEffect(() => {
    setPlaceQuery(draft.place?.label ?? "");
  }, [draft.place]);

  const results = useMemo(() => searchCities(placeQuery, 6), [placeQuery]);

  return (
    <fieldset className={styles.card}>
      <legend className={styles.label}>{label}</legend>

      <div className={styles.field}>
        <label className={styles.fieldLabel} htmlFor={nameId}>
          Name <span className={styles.optional}>(optional)</span>
        </label>
        <input
          id={nameId}
          type="text"
          className={styles.input}
          placeholder="First name"
          value={draft.name}
          onChange={(e) => onChange({ ...draft, name: e.target.value })}
          autoComplete="off"
        />
      </div>

      <div className={styles.fieldRow}>
        <div className={styles.field}>
          <label className={styles.fieldLabel} htmlFor={dateId}>
            Date of birth
          </label>
          <input
            id={dateId}
            type="date"
            className={styles.input}
            value={draft.date}
            onChange={(e) => onChange({ ...draft, date: e.target.value })}
            max="2010-12-31"
            min="1925-01-01"
          />
        </div>

        {!hideTimeAndPlace && (
          <div className={styles.field}>
            <label className={styles.fieldLabel} htmlFor={timeId}>
              Time of birth
            </label>
            <input
              id={timeId}
              type="time"
              className={styles.input}
              value={draft.time}
              disabled={!draft.timeKnown}
              onChange={(e) => onChange({ ...draft, time: e.target.value })}
            />
            <label className={styles.checkboxRow}>
              <input
                type="checkbox"
                checked={!draft.timeKnown}
                onChange={(e) =>
                  onChange({
                    ...draft,
                    timeKnown: !e.target.checked,
                    time: e.target.checked ? "" : draft.time,
                  })
                }
              />
              <span>I don&rsquo;t know the exact time</span>
            </label>
          </div>
        )}
      </div>

      {!hideTimeAndPlace && (
        <div className={styles.field}>
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
                if (draft.place && e.target.value !== draft.place.label) {
                  onChange({ ...draft, place: null });
                }
              }}
              onFocus={() => setShowResults(true)}
              onBlur={() => {
                // Delay so click-on-result fires first.
                setTimeout(() => setShowResults(false), 150);
              }}
              autoComplete="off"
            />
            {showResults && results.length > 0 && !draft.place && (
              <ul className={styles.results}>
                {results.map((c) => (
                  <li key={c.label}>
                    <button
                      type="button"
                      className={styles.resultBtn}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        onChange({ ...draft, place: c });
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
      )}
    </fieldset>
  );
}
