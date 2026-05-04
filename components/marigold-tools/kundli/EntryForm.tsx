"use client";

import { PartnerForm, type PartnerDraft } from "./PartnerForm";
import styles from "./EntryForm.module.css";

export type MatchMethod = "birth" | "name";

type Props = {
  partnerA: PartnerDraft;
  partnerB: PartnerDraft;
  method: MatchMethod;
  onChangeA: (next: PartnerDraft) => void;
  onChangeB: (next: PartnerDraft) => void;
  onChangeMethod: (m: MatchMethod) => void;
  onSubmit: () => void;
  onBack: () => void;
};

function isComplete(p: PartnerDraft, method: MatchMethod): boolean {
  if (method === "name") return Boolean(p.name && p.name.trim().length > 0);
  return Boolean(p.date && p.place && (!p.timeKnown || (p.time && p.time.length >= 4)));
}

export function EntryForm({
  partnerA,
  partnerB,
  method,
  onChangeA,
  onChangeB,
  onChangeMethod,
  onSubmit,
  onBack,
}: Props) {
  const aComplete = isComplete(partnerA, method);
  const bComplete = isComplete(partnerB, method);
  const ready = aComplete && bComplete;

  return (
    <div className={styles.card}>
      <span className={styles.eyebrow}>Birth details</span>
      <h2 className={styles.heading}>
        Enter both <em>partners</em>.
      </h2>
      <p className={styles.sub}>
        We need just enough to find the Moon. Your details stay on this
        device — nothing is saved or transmitted.
      </p>

      <div className={styles.methodRow} role="radiogroup" aria-label="Matching method">
        <button
          type="button"
          role="radio"
          aria-checked={method === "birth"}
          className={`${styles.methodBtn} ${method === "birth" ? styles.methodBtnActive : ""}`}
          onClick={() => onChangeMethod("birth")}
        >
          <span className={styles.methodLabel}>By birth details</span>
          <span className={styles.methodSub}>Recommended — most accurate</span>
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={method === "name"}
          className={`${styles.methodBtn} ${method === "name" ? styles.methodBtnActive : ""}`}
          onClick={() => onChangeMethod("name")}
        >
          <span className={styles.methodLabel}>By name only</span>
          <span className={styles.methodSub}>If birth time is unknown</span>
        </button>
      </div>

      <div className={styles.partnersGrid}>
        <PartnerForm
          label="First partner"
          draft={partnerA}
          onChange={onChangeA}
          hideTimeAndPlace={method === "name"}
        />
        <PartnerForm
          label="Second partner"
          draft={partnerB}
          onChange={onChangeB}
          hideTimeAndPlace={method === "name"}
        />
      </div>

      {method === "name" && (
        <p className={styles.helper}>
          Name-only matching uses the first syllable of each partner&rsquo;s name to
          derive their Nakshatra. Less precise than birth-detail matching, but
          the major dimensions (Gana, Yoni, Nadi) remain valid.
        </p>
      )}

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
          Match our kundlis →
        </button>
      </div>
    </div>
  );
}
