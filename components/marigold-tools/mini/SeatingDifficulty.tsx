'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useMemo, useState } from 'react';
import { MiniToolShell } from './MiniToolShell';
import primitives from './MiniToolPrimitives.module.css';
import styles from './SeatingDifficulty.module.css';

const DIETARY_TIERS = [
  { label: 'None', value: 0 },
  { label: '1 – 2', value: 1.5 },
  { label: '3 – 5', value: 4 },
  { label: '6+', value: 7 },
] as const;

const TABLE_SIZES = [8, 10, 12] as const;

const TIERS = [
  { max: 3, label: 'Piece of cake', flavor: 'cake' },
  {
    max: 6,
    label: "you'll need a spreadsheet",
    flavor: 'spreadsheet',
  },
  { max: 8, label: 'hire a strategist', flavor: 'strategist' },
  { max: 10, label: 'contact the UN', flavor: 'un' },
] as const;

export function SeatingDifficulty() {
  const [guests, setGuests] = useState<number>(200);
  const [divorced, setDivorced] = useState<number>(0);
  const [feuding, setFeuding] = useState<number>(0);
  const [dietary, setDietary] = useState<number>(1.5);
  const [strangers, setStrangers] = useState<number>(15);
  const [tableSize, setTableSize] = useState<number>(10);
  const [multiLang, setMultiLang] = useState<boolean>(false);
  const [exes, setExes] = useState<boolean>(false);

  const result = useMemo(() => {
    let score = 2; // base — every chart is at least a 2
    score += Math.max(0, (guests - 100) / 100);
    score += divorced;
    score += feuding;
    score += dietary;
    score += strangers / 10 * 0.5;
    if (multiLang) score += 1;
    if (exes) score += 1;
    score = Math.min(10, Math.max(1, Math.round(score * 10) / 10));

    const tier =
      TIERS.find((t) => score <= t.max) ?? TIERS[TIERS.length - 1]!;

    const callouts: string[] = [];
    if (feuding > 0)
      callouts.push(
        `With ${feuding} feuding pair${feuding === 1 ? '' : 's'}, leave at least 2 tables of buffer between them. That constrains a meaningful chunk of your layout.`,
      );
    if (divorced >= 2)
      callouts.push(
        'Multiple divorced parents = multiple head tables to consider. Many couples now do "couple-only" sweetheart tables to sidestep this entirely.',
      );
    if (strangers >= 20)
      callouts.push(
        'Cluster lone guests at "interest tables" — same age, same hometown, same career. Strangers seated together by demographic almost always click.',
      );
    if (multiLang)
      callouts.push(
        'Try to seat at least one bilingual person at each table that mixes language groups.',
      );
    if (exes)
      callouts.push(
        "Ex on the list? Sit them on the opposite side of the room from the active partner. Don't hide them — that's worse.",
      );
    if (tableSize === 8 && guests > 200)
      callouts.push(
        '8-tops with 200+ guests = a LOT of tables to label and arrange. Consider 10s if your venue allows.',
      );

    return { score, tier, callouts };
  }, [guests, divorced, feuding, dietary, strangers, tableSize, multiLang, exes]);

  return (
    <MiniToolShell
      name="Seating Chart Difficulty Score"
      tagline="how hard is your seating chart going to be?"
      estimatedTime="1 min"
    >
      <div className={styles.row}>
        <div className={primitives.field}>
          <label className={primitives.label} htmlFor="sd-guests">
            Guest count
          </label>
          <input
            id="sd-guests"
            type="number"
            className={primitives.input}
            value={guests || ''}
            min={1}
            onChange={(e) => setGuests(Number(e.target.value) || 0)}
          />
        </div>
        <div className={primitives.field}>
          <label className={primitives.label} htmlFor="sd-table">
            Table size
          </label>
          <select
            id="sd-table"
            className={primitives.select}
            value={tableSize}
            onChange={(e) => setTableSize(Number(e.target.value))}
          >
            {TABLE_SIZES.map((s) => (
              <option key={s} value={s}>
                {s}-top
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.row}>
        <div className={primitives.field}>
          <label className={primitives.label} htmlFor="sd-divorced">
            Divorced parents
          </label>
          <input
            id="sd-divorced"
            type="number"
            className={primitives.input}
            value={divorced}
            min={0}
            max={4}
            onChange={(e) => setDivorced(Number(e.target.value) || 0)}
          />
        </div>
        <div className={primitives.field}>
          <label className={primitives.label} htmlFor="sd-feuding">
            Feuding pairs
          </label>
          <input
            id="sd-feuding"
            type="number"
            className={primitives.input}
            value={feuding}
            min={0}
            max={10}
            onChange={(e) => setFeuding(Number(e.target.value) || 0)}
          />
        </div>
      </div>

      <div className={styles.row}>
        <div className={primitives.field}>
          <label className={primitives.label}>Dietary requirements</label>
          <div className={styles.tierRow}>
            {DIETARY_TIERS.map((t) => (
              <button
                key={t.label}
                type="button"
                onClick={() => setDietary(t.value)}
                className={`${styles.tierChip} ${
                  dietary === t.value ? styles.tierChipActive : ''
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
        <div className={primitives.field}>
          <label className={primitives.label} htmlFor="sd-strangers">
            Lone-stranger guests
          </label>
          <input
            id="sd-strangers"
            type="number"
            className={primitives.input}
            value={strangers}
            min={0}
            onChange={(e) => setStrangers(Number(e.target.value) || 0)}
          />
        </div>
      </div>

      <div className={styles.toggleRow}>
        <label
          className={`${primitives.checkboxLabel} ${
            multiLang ? primitives.checkboxLabelChecked : ''
          }`}
        >
          <input
            type="checkbox"
            className={primitives.checkbox}
            checked={multiLang}
            onChange={(e) => setMultiLang(e.target.checked)}
          />
          Multiple languages at the wedding
        </label>
        <label
          className={`${primitives.checkboxLabel} ${
            exes ? primitives.checkboxLabelChecked : ''
          }`}
        >
          <input
            type="checkbox"
            className={primitives.checkbox}
            checked={exes}
            onChange={(e) => setExes(e.target.checked)}
          />
          Exes attending
        </label>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={result.tier.label}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.32 }}
          className={primitives.resultCard}
        >
          <span className={primitives.resultEyebrow}>difficulty score</span>
          <div className={primitives.bigNumber}>
            {result.score}
            <span className={styles.outOf}>/10</span>
          </div>
          <p className={styles.tierLabel}>{result.tier.label}</p>

          {result.callouts.length > 0 && (
            <ul className={styles.calloutList}>
              {result.callouts.map((c) => (
                <li key={c} className={styles.calloutItem}>
                  {c}
                </li>
              ))}
            </ul>
          )}
        </motion.div>
      </AnimatePresence>
    </MiniToolShell>
  );
}
