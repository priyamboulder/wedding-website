'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useMemo, useState } from 'react';
import { MiniToolShell } from './MiniToolShell';
import primitives from './MiniToolPrimitives.module.css';
import styles from './VendorTipCalculator.module.css';

type Mode = 'flat' | 'percent';

type VendorRule = {
  key: string;
  label: string;
  mode: Mode;
  // For flat: low/high are dollars. For percent: low/high are decimal
  // (e.g. 0.15 for 15%).
  low: number;
  high: number;
  note?: string;
};

const VENDORS: VendorRule[] = [
  { key: 'planner', label: 'Wedding planner', mode: 'flat', low: 100, high: 500, note: 'Skip if they own the company.' },
  { key: 'coordinator', label: 'Day-of coordinator', mode: 'flat', low: 50, high: 150 },
  { key: 'photographer', label: 'Photographer', mode: 'flat', low: 50, high: 200, note: 'Or 10–15% of fee.' },
  { key: 'videographer', label: 'Videographer', mode: 'flat', low: 50, high: 200 },
  { key: 'dj', label: 'DJ', mode: 'flat', low: 50, high: 200 },
  { key: 'band', label: 'Band / musicians (per musician)', mode: 'flat', low: 25, high: 50 },
  { key: 'caterer', label: 'Catering chef', mode: 'flat', low: 100, high: 200, note: 'Or 10–15% if not in contract.' },
  { key: 'staff', label: 'Catering staff (per server)', mode: 'flat', low: 20, high: 50 },
  { key: 'hair', label: 'Hair stylist', mode: 'percent', low: 0.15, high: 0.25 },
  { key: 'makeup', label: 'Makeup artist', mode: 'percent', low: 0.15, high: 0.25 },
  { key: 'florist', label: 'Florist', mode: 'flat', low: 50, high: 100, note: 'Optional if owner-operated.' },
  { key: 'driver', label: 'Driver / transportation', mode: 'percent', low: 0.15, high: 0.20 },
  { key: 'officiant', label: 'Officiant / pandit', mode: 'flat', low: 50, high: 200, note: 'Or temple/gurdwara donation.' },
  { key: 'mehndi', label: 'Mehndi artist', mode: 'percent', low: 0.15, high: 0.20 },
];

function fmt(n: number): string {
  return n.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  });
}

export function VendorTipCalculator() {
  const [selected, setSelected] = useState<Set<string>>(
    new Set(['planner', 'photographer', 'dj', 'hair', 'makeup']),
  );
  const [fees, setFees] = useState<Record<string, number>>({});

  function toggle(key: string) {
    const next = new Set(selected);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setSelected(next);
  }

  const result = useMemo(() => {
    const rows = VENDORS.filter((v) => selected.has(v.key)).map((v) => {
      let low: number;
      let high: number;
      if (v.mode === 'flat') {
        low = v.low;
        high = v.high;
      } else {
        const fee = fees[v.key] ?? 0;
        low = fee * v.low;
        high = fee * v.high;
      }
      return { ...v, calcLow: low, calcHigh: high };
    });
    const totalLow = rows.reduce((sum, r) => sum + r.calcLow, 0);
    const totalHigh = rows.reduce((sum, r) => sum + r.calcHigh, 0);
    return { rows, totalLow, totalHigh };
  }, [selected, fees]);

  return (
    <MiniToolShell
      name="Vendor Tip Calculator"
      tagline="how much do you tip wedding vendors?"
      estimatedTime="1 min"
    >
      <div className={primitives.field}>
        <label className={primitives.label}>Vendors you want to tip</label>
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

      {result.rows.some((r) => r.mode === 'percent') && (
        <div className={primitives.field}>
          <label className={primitives.label}>
            Their fees (for percentage-based tips)
          </label>
          <div className={styles.feeGrid}>
            {result.rows
              .filter((r) => r.mode === 'percent')
              .map((r) => (
                <div key={r.key} className={styles.feeRow}>
                  <span className={styles.feeLabel}>{r.label}</span>
                  <input
                    type="number"
                    className={styles.feeInput}
                    value={fees[r.key] || ''}
                    min={0}
                    step={50}
                    placeholder="$"
                    onChange={(e) =>
                      setFees({
                        ...fees,
                        [r.key]: Number(e.target.value) || 0,
                      })
                    }
                  />
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
            <span className={primitives.resultEyebrow}>tipping budget</span>
            <div className={primitives.bigNumber}>
              {fmt(result.totalLow)} – {fmt(result.totalHigh)}
            </div>
            <p className={primitives.resultLabel}>
              Cash, in labeled envelopes. Hand them to vendors directly or
              have your coordinator distribute at the end of the night.
            </p>

            <div className={primitives.breakdown}>
              {result.rows.map((r) => (
                <div key={r.key} className={primitives.breakdownRow}>
                  <span className={primitives.breakdownLabel}>{r.label}</span>
                  <span className={primitives.breakdownValue}>
                    {r.mode === 'percent' && (fees[r.key] ?? 0) === 0
                      ? 'enter fee →'
                      : `${fmt(r.calcLow)} – ${fmt(r.calcHigh)}`}
                  </span>
                </div>
              ))}
            </div>

            <p className={primitives.note}>
              These are US norms; tipping is more common here than in India.
              Many South Asian families also give shagun envelopes to key
              vendors as a separate gesture.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </MiniToolShell>
  );
}
