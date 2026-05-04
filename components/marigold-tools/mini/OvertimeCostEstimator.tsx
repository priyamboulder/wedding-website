'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useMemo, useState } from 'react';
import { MiniToolShell } from './MiniToolShell';
import primitives from './MiniToolPrimitives.module.css';
import styles from './OvertimeCostEstimator.module.css';

// DFW overtime rate ranges per spec. Midpoint used as default if user
// doesn't override.
type Rule = {
  key: string;
  label: string;
  low: number;
  high: number;
};

const VENDORS: Rule[] = [
  { key: 'venue', label: 'Venue', low: 500, high: 2000 },
  { key: 'photo', label: 'Photographer', low: 150, high: 400 },
  { key: 'video', label: 'Videographer', low: 150, high: 350 },
  { key: 'dj', label: 'DJ', low: 150, high: 300 },
  { key: 'band', label: 'Band', low: 200, high: 500 },
  { key: 'caterer', label: 'Caterer (staff + food)', low: 300, high: 800 },
  { key: 'coordinator', label: 'Coordinator', low: 100, high: 200 },
  { key: 'decor', label: 'Decorator / lighting crew', low: 200, high: 500 },
];

function fmt(n: number): string {
  return n.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  });
}

function midpoint(r: Rule): number {
  return (r.low + r.high) / 2;
}

export function OvertimeCostEstimator() {
  const [selected, setSelected] = useState<Set<string>>(
    new Set(['venue', 'photo', 'dj', 'caterer', 'coordinator']),
  );
  const [rates, setRates] = useState<Record<string, number>>({});

  function toggle(key: string) {
    const next = new Set(selected);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setSelected(next);
  }

  const result = useMemo(() => {
    const active = VENDORS.filter((v) => selected.has(v.key));
    const rows = active.map((v) => {
      const rate = rates[v.key] ?? midpoint(v);
      return { ...v, rate };
    });
    const perHour = rows.reduce((sum, r) => sum + r.rate, 0);
    return {
      rows,
      perHour,
      half: perHour * 0.5,
      oneHour: perHour,
      twoHours: perHour * 2,
    };
  }, [selected, rates]);

  return (
    <MiniToolShell
      name="Overtime Cost Estimator"
      tagline="what if your reception runs late?"
      estimatedTime="30 sec"
    >
      <div className={primitives.field}>
        <label className={primitives.label}>Vendors booked</label>
        <div className={primitives.checkboxGrid}>
          {VENDORS.map((v) => {
            const isOn = selected.has(v.key);
            return (
              <label
                key={v.key}
                className={`${primitives.checkboxLabel} ${
                  isOn ? primitives.checkboxLabelChecked : ''
                }`}
              >
                <input
                  type="checkbox"
                  className={primitives.checkbox}
                  checked={isOn}
                  onChange={() => toggle(v.key)}
                />
                {v.label}
              </label>
            );
          })}
        </div>
      </div>

      {result.rows.length > 0 && (
        <div className={primitives.field}>
          <label className={primitives.label}>
            Hourly overtime rates (default = DFW midpoint)
          </label>
          <div className={styles.rateGrid}>
            {result.rows.map((r) => (
              <div key={r.key} className={styles.rateRow}>
                <span className={styles.rateLabel}>{r.label}</span>
                <input
                  type="number"
                  className={styles.rateInput}
                  value={rates[r.key] ?? midpoint(r)}
                  min={0}
                  step={25}
                  onChange={(e) =>
                    setRates({
                      ...rates,
                      [r.key]: Number(e.target.value) || 0,
                    })
                  }
                />
                <span className={styles.rateRange}>
                  ({fmt(r.low)} – {fmt(r.high)})
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <AnimatePresence>
        {result.rows.length > 0 && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.32 }}
            className={primitives.resultCard}
          >
            <span className={primitives.resultEyebrow}>cost per extra hour</span>
            <div className={primitives.bigNumber}>{fmt(result.oneHour)}</div>
            <p className={primitives.resultLabel}>
              That&apos;s the running clock once your contracted end time hits.
            </p>

            <div className={primitives.breakdown}>
              <div className={primitives.breakdownRow}>
                <span className={primitives.breakdownLabel}>+30 minutes</span>
                <span className={primitives.breakdownValue}>
                  {fmt(result.half)}
                </span>
              </div>
              <div className={primitives.breakdownRow}>
                <span className={primitives.breakdownLabel}>+1 hour</span>
                <span className={primitives.breakdownValue}>
                  {fmt(result.oneHour)}
                </span>
              </div>
              <div className={primitives.breakdownRow}>
                <span className={primitives.breakdownLabel}>+2 hours</span>
                <span className={primitives.breakdownValue}>
                  {fmt(result.twoHours)}
                </span>
              </div>
            </div>

            <div className={primitives.crosslink}>
              <strong>Heads up:</strong> some venues charge 1.5×–2× for
              overtime, billed in 30-minute increments. Confirm overtime rates
              IN WRITING before signing every vendor contract — not after.
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </MiniToolShell>
  );
}
