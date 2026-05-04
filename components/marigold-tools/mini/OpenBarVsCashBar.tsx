'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useMemo, useState } from 'react';
import { MiniToolShell } from './MiniToolShell';
import primitives from './MiniToolPrimitives.module.css';
import styles from './OpenBarVsCashBar.module.css';

const DRINK_PCT = [
  { label: '< 25%', value: 0.2 },
  { label: '25 – 50%', value: 0.375 },
  { label: '50 – 75%', value: 0.625 },
  { label: '75%+', value: 0.85 },
] as const;

// Per-guest cost for a 4-hour event (DFW range — midpoint used in math).
const BAR_OPTIONS = [
  { key: 'premium', label: 'Premium open bar', low: 75, high: 100 },
  { key: 'well', label: 'Well / house open bar', low: 45, high: 65 },
  { key: 'beerwine', label: 'Beer & wine only', low: 25, high: 40 },
  { key: 'cash', label: 'Cash bar', low: 0, high: 0 },
  { key: 'dry', label: 'Dry / mocktails', low: 10, high: 20 },
] as const;

const NON_DRINKER_LOW = 10;
const NON_DRINKER_HIGH = 15;
const HOURLY_OVER_LOW = 10;
const HOURLY_OVER_HIGH = 15;

function fmt(n: number): string {
  return n.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  });
}

export function OpenBarVsCashBar() {
  const [guests, setGuests] = useState<number>(250);
  const [drinkPct, setDrinkPct] = useState<number>(0.5);
  const [hours, setHours] = useState<number>(4);

  const result = useMemo(() => {
    if (guests <= 0 || hours <= 0) return null;
    const drinkers = guests * drinkPct;
    const nonDrinkers = guests - drinkers;
    const overHours = Math.max(0, hours - 4);

    return BAR_OPTIONS.map((opt) => {
      const isDry = opt.key === 'dry';
      const isCash = opt.key === 'cash';

      // For cash bar, only soft-drink/non-drinker charges apply (venue still
      // serves water/sodas). For dry, everyone gets the per-person.
      let low = 0;
      let high = 0;

      if (isCash) {
        low = 250;
        high = 500; // typical setup fee
      } else if (isDry) {
        low = guests * opt.low;
        high = guests * opt.high;
      } else {
        // Drinkers pay full per-person, non-drinkers add a soft-drink line.
        low =
          drinkers * opt.low +
          nonDrinkers * NON_DRINKER_LOW +
          drinkers * overHours * HOURLY_OVER_LOW;
        high =
          drinkers * opt.high +
          nonDrinkers * NON_DRINKER_HIGH +
          drinkers * overHours * HOURLY_OVER_HIGH;
      }

      return {
        ...opt,
        low: Math.round(low),
        high: Math.round(high),
        perGuestLow: low / guests,
        perGuestHigh: high / guests,
      };
    });
  }, [guests, drinkPct, hours]);

  return (
    <MiniToolShell
      name="Open Bar vs. Cash Bar"
      tagline="what's cheaper for your guest count?"
      estimatedTime="30 sec"
    >
      <div className={primitives.field}>
        <label className={primitives.label} htmlFor="ob-guests">
          Guest count
        </label>
        <input
          id="ob-guests"
          type="number"
          className={primitives.input}
          value={guests || ''}
          min={1}
          onChange={(e) => setGuests(Number(e.target.value) || 0)}
        />
      </div>

      <div className={primitives.field}>
        <label className={primitives.label}>% of guests who drink</label>
        <div className={styles.tierRow}>
          {DRINK_PCT.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => setDrinkPct(p.value)}
              className={`${styles.tierChip} ${
                drinkPct === p.value ? styles.tierChipActive : ''
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className={primitives.field}>
        <label className={primitives.label} htmlFor="ob-hours">
          Event duration (hours)
        </label>
        <input
          id="ob-hours"
          type="number"
          className={primitives.input}
          value={hours || ''}
          min={1}
          max={12}
          onChange={(e) => setHours(Number(e.target.value) || 1)}
        />
      </div>

      <AnimatePresence>
        {result && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.32 }}
            className={primitives.resultCard}
          >
            <span className={primitives.resultEyebrow}>cost comparison</span>
            <p className={primitives.resultLabel}>
              All five bar styles, side by side.
            </p>

            <div className={styles.comparisonList}>
              {result.map((opt) => (
                <div key={opt.key} className={styles.option}>
                  <div className={styles.optionHeader}>
                    <span className={styles.optionLabel}>{opt.label}</span>
                    <span className={styles.optionPrice}>
                      {opt.low === opt.high
                        ? fmt(opt.low)
                        : `${fmt(opt.low)} – ${fmt(opt.high)}`}
                    </span>
                  </div>
                  {opt.key !== 'cash' && (
                    <span className={styles.optionPerGuest}>
                      {fmt(opt.perGuestLow)} – {fmt(opt.perGuestHigh)} per
                      guest
                    </span>
                  )}
                </div>
              ))}
            </div>

            <div className={primitives.crosslink}>
              <strong>South Asian wedding bar norms:</strong> many Indian
              weddings are dry or beer-and-wine only. If your family
              doesn&apos;t drink much, a beautiful mocktail station is equally
              festive — and the savings are real.
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </MiniToolShell>
  );
}
