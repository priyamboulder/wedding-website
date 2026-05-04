'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useMemo, useState } from 'react';
import { MiniToolShell } from './MiniToolShell';
import primitives from './MiniToolPrimitives.module.css';
import styles from './LehengaCarryOn.module.css';

// Per-item weight in lbs (midpoint of spec ranges).
const WEIGHTS = {
  bridalLehenga: 11,
  lightLehenga: 5.5,
  sherwani: 6.5,
  sareePer: 2,
  suitPer: 3,
  jewelry: 3.5,
} as const;

// Default checked-bag allowance per airline (kg, two pieces typical for
// international economy; pricing for extra bag is in USD).
const AIRLINES = [
  { key: 'air-india', label: 'Air India', bagsKg: 23, bags: 2, extraUsd: 100 },
  { key: 'emirates', label: 'Emirates', bagsKg: 23, bags: 2, extraUsd: 200 },
  { key: 'qatar', label: 'Qatar Airways', bagsKg: 23, bags: 2, extraUsd: 150 },
  { key: 'united', label: 'United', bagsKg: 23, bags: 2, extraUsd: 200 },
  { key: 'delta', label: 'Delta', bagsKg: 23, bags: 2, extraUsd: 200 },
  { key: 'american', label: 'American', bagsKg: 23, bags: 2, extraUsd: 200 },
  {
    key: 'british',
    label: 'British Airways',
    bagsKg: 23,
    bags: 2,
    extraUsd: 175,
  },
  { key: 'other', label: 'Other', bagsKg: 23, bags: 2, extraUsd: 150 },
] as const;

const KG_TO_LBS = 2.20462;

export function LehengaCarryOn() {
  const [bridal, setBridal] = useState<number>(1);
  const [lightLeh, setLightLeh] = useState<number>(2);
  const [sherwani, setSherwani] = useState<number>(0);
  const [sarees, setSarees] = useState<number>(4);
  const [suits, setSuits] = useState<number>(3);
  const [jewelry, setJewelry] = useState<number>(2);
  const [airlineKey, setAirlineKey] =
    useState<(typeof AIRLINES)[number]['key']>('air-india');

  const result = useMemo(() => {
    const airline = AIRLINES.find((a) => a.key === airlineKey)!;
    const weight =
      bridal * WEIGHTS.bridalLehenga +
      lightLeh * WEIGHTS.lightLehenga +
      sherwani * WEIGHTS.sherwani +
      sarees * WEIGHTS.sareePer +
      suits * WEIGHTS.suitPer +
      jewelry * WEIGHTS.jewelry;

    const allowanceLbs = airline.bagsKg * airline.bags * KG_TO_LBS;
    const overage = weight - allowanceLbs;

    let verdict: string;
    if (overage <= 0) verdict = "It'll fit. You're cleared for takeoff.";
    else if (overage < airline.bagsKg * KG_TO_LBS)
      verdict = `You'll need an extra checked bag (~$${airline.extraUsd}).`;
    else
      verdict =
        "Consider shipping the extras separately — at this weight you're paying for multiple extra bags AND risking damage.";

    return {
      weight: Math.round(weight * 10) / 10,
      allowanceLbs: Math.round(allowanceLbs),
      overage: Math.round(overage * 10) / 10,
      verdict,
      airline,
    };
  }, [bridal, lightLeh, sherwani, sarees, suits, jewelry, airlineKey]);

  return (
    <MiniToolShell
      name="Lehenga Carry-On Calculator"
      tagline="will it fit?"
      estimatedTime="30 sec"
    >
      <div className={primitives.field}>
        <label className={primitives.label}>What you&apos;re packing</label>
        <div className={styles.itemGrid}>
          <ItemCounter
            label="Heavy bridal lehenga"
            value={bridal}
            onChange={setBridal}
          />
          <ItemCounter
            label="Light lehenga"
            value={lightLeh}
            onChange={setLightLeh}
          />
          <ItemCounter label="Sherwani" value={sherwani} onChange={setSherwani} />
          <ItemCounter label="Sarees" value={sarees} onChange={setSarees} />
          <ItemCounter label="Suits / kurtas" value={suits} onChange={setSuits} />
          <ItemCounter
            label="Jewelry boxes"
            value={jewelry}
            onChange={setJewelry}
          />
        </div>
      </div>

      <div className={primitives.field}>
        <label className={primitives.label} htmlFor="lc-airline">
          Airline
        </label>
        <select
          id="lc-airline"
          className={primitives.select}
          value={airlineKey}
          onChange={(e) =>
            setAirlineKey(e.target.value as (typeof AIRLINES)[number]['key'])
          }
        >
          {AIRLINES.map((a) => (
            <option key={a.key} value={a.key}>
              {a.label}
            </option>
          ))}
        </select>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={result.verdict}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.32 }}
          className={primitives.resultCard}
        >
          <span className={primitives.resultEyebrow}>verdict</span>
          <p className={styles.verdict}>{result.verdict}</p>

          <div className={primitives.breakdown}>
            <div className={primitives.breakdownRow}>
              <span className={primitives.breakdownLabel}>Total weight</span>
              <span className={primitives.breakdownValue}>
                {result.weight} lbs
              </span>
            </div>
            <div className={primitives.breakdownRow}>
              <span className={primitives.breakdownLabel}>
                {result.airline.label} allowance ({result.airline.bags} ×{' '}
                {result.airline.bagsKg} kg)
              </span>
              <span className={primitives.breakdownValue}>
                {result.allowanceLbs} lbs
              </span>
            </div>
            <div className={primitives.breakdownRow}>
              <span className={primitives.breakdownLabel}>
                {result.overage > 0 ? 'Over by' : 'Under by'}
              </span>
              <span className={primitives.breakdownValue}>
                {Math.abs(result.overage)} lbs
              </span>
            </div>
          </div>

          <p className={primitives.note}>
            <strong>Packing tips:</strong> roll sarees around cardboard tubes
            to prevent creasing. Bridal lehenga gets its own bag — preferably
            with the venue&apos;s name on the outside. Jewelry in carry-on,
            never checked.
          </p>
        </motion.div>
      </AnimatePresence>
    </MiniToolShell>
  );
}

function ItemCounter({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className={styles.counter}>
      <span className={styles.counterLabel}>{label}</span>
      <div className={styles.counterControls}>
        <button
          type="button"
          onClick={() => onChange(Math.max(0, value - 1))}
          className={styles.counterBtn}
          aria-label={`Decrease ${label}`}
        >
          −
        </button>
        <span className={styles.counterValue}>{value}</span>
        <button
          type="button"
          onClick={() => onChange(value + 1)}
          className={styles.counterBtn}
          aria-label={`Increase ${label}`}
        >
          +
        </button>
      </div>
    </div>
  );
}
