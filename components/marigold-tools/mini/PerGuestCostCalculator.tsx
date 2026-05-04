'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { MiniToolShell } from './MiniToolShell';
import primitives from './MiniToolPrimitives.module.css';
import styles from './PerGuestCostCalculator.module.css';

// Industry-standard Indian wedding budget allocation (per Ananya spec).
// Sums to 100%.
const ALLOCATION = {
  food: 0.30,
  venue: 0.20,
  decor: 0.15,
  photo: 0.10,
  attire: 0.08,
  music: 0.05,
  stationery: 0.03,
  other: 0.09,
} as const;

const BUDGET_PRESETS: { label: string; value: number }[] = [
  { label: '$25K – $50K', value: 37500 },
  { label: '$50K – $100K', value: 75000 },
  { label: '$100K – $200K', value: 150000 },
  { label: '$200K – $500K', value: 350000 },
  { label: '$500K+', value: 600000 },
];

function fmt(n: number): string {
  return n.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  });
}

export function PerGuestCostCalculator() {
  const [budget, setBudget] = useState<number>(75000);
  const [guests, setGuests] = useState<number>(250);
  const [meals, setMeals] = useState<number>(3);
  const [trimGuests, setTrimGuests] = useState<number>(25);

  const result = useMemo(() => {
    if (budget <= 0 || guests <= 0) return null;
    const perGuest = budget / guests;
    const foodPerGuestPerMeal =
      (budget * ALLOCATION.food) / (guests * Math.max(1, meals));
    return {
      perGuest,
      foodPerGuestPerMeal,
      breakdown: {
        food: (budget * ALLOCATION.food) / guests,
        venue: (budget * ALLOCATION.venue) / guests,
        decor: (budget * ALLOCATION.decor) / guests,
        photo: (budget * ALLOCATION.photo) / guests,
        attire: (budget * ALLOCATION.attire) / guests,
        music: (budget * ALLOCATION.music) / guests,
        stationery: (budget * ALLOCATION.stationery) / guests,
        other: (budget * ALLOCATION.other) / guests,
      },
      trimSavings: trimGuests * perGuest,
    };
  }, [budget, guests, meals, trimGuests]);

  return (
    <MiniToolShell
      name="Per-Guest Cost Calculator"
      tagline="what does each guest actually cost you?"
      estimatedTime="30 sec"
    >
      <div className={primitives.field}>
        <label className={primitives.label}>Total wedding budget</label>
        <div className={styles.presetRow}>
          {BUDGET_PRESETS.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => setBudget(p.value)}
              className={`${styles.presetChip} ${
                budget === p.value ? styles.presetChipActive : ''
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        <input
          type="number"
          className={primitives.input}
          value={budget || ''}
          min={0}
          step={1000}
          onChange={(e) => setBudget(Number(e.target.value) || 0)}
          placeholder="Or enter exact amount"
          aria-label="Exact budget in dollars"
        />
      </div>

      <div className={styles.row}>
        <div className={primitives.field}>
          <label className={primitives.label} htmlFor="pgc-guests">
            Total guest count
          </label>
          <input
            id="pgc-guests"
            type="number"
            className={primitives.input}
            value={guests || ''}
            min={1}
            onChange={(e) => setGuests(Number(e.target.value) || 0)}
          />
        </div>
        <div className={primitives.field}>
          <label className={primitives.label} htmlFor="pgc-meals">
            Events with meals
          </label>
          <input
            id="pgc-meals"
            type="number"
            className={primitives.input}
            value={meals || ''}
            min={1}
            max={10}
            onChange={(e) => setMeals(Number(e.target.value) || 1)}
          />
        </div>
      </div>

      <AnimatePresence>
        {result && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
            className={primitives.resultCard}
          >
            <span className={primitives.resultEyebrow}>cost per guest</span>
            <div className={primitives.bigNumber}>
              {fmt(result.perGuest)}
            </div>
            <p className={primitives.resultLabel}>
              Every guest you add costs about {fmt(result.perGuest)}. Every
              guest you remove saves the same.
            </p>

            <div className={primitives.breakdown}>
              <BreakdownRow
                label="Food & beverage"
                value={result.breakdown.food}
              />
              <BreakdownRow label="Venue" value={result.breakdown.venue} />
              <BreakdownRow
                label="Decor & florals"
                value={result.breakdown.decor}
              />
              <BreakdownRow
                label="Photo & video"
                value={result.breakdown.photo}
              />
              <BreakdownRow
                label="Attire & beauty"
                value={result.breakdown.attire}
              />
              <BreakdownRow
                label="Music & entertainment"
                value={result.breakdown.music}
              />
              <BreakdownRow
                label="Stationery"
                value={result.breakdown.stationery}
              />
              <BreakdownRow
                label="Other (planner, transport, favors)"
                value={result.breakdown.other}
              />
            </div>

            <div className={styles.trimBox}>
              <span className={primitives.resultEyebrow}>
                impact of trimming
              </span>
              <div className={styles.trimRow}>
                <label className={styles.trimLabel}>
                  If you cut
                  <input
                    type="number"
                    min={0}
                    max={guests}
                    value={trimGuests || ''}
                    onChange={(e) =>
                      setTrimGuests(Number(e.target.value) || 0)
                    }
                    className={styles.trimInput}
                  />
                  guests, you save
                </label>
                <span className={styles.trimValue}>
                  {fmt(result.trimSavings)}
                </span>
              </div>
            </div>

            <div className={primitives.crosslink}>
              Want the full event-by-event breakdown? Try{' '}
              <Link href="/tools/budget">Shaadi Budget</Link> for real DFW
              vendor pricing across mehndi, sangeet, ceremony, and reception.
            </div>

            <p className={primitives.note}>
              Allocation percentages are industry standards for South Asian
              weddings. Your actual mix will shift based on venue choice and
              what your family prioritizes.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </MiniToolShell>
  );
}

function BreakdownRow({ label, value }: { label: string; value: number }) {
  return (
    <div className={primitives.breakdownRow}>
      <span className={primitives.breakdownLabel}>{label}</span>
      <span className={primitives.breakdownValue}>{fmt(value)}</span>
    </div>
  );
}
