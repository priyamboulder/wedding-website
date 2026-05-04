'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useMemo, useState } from 'react';
import { MiniToolShell } from './MiniToolShell';
import primitives from './MiniToolPrimitives.module.css';
import styles from './PlateCountCalculator.module.css';

type MealType =
  | 'sit-down'
  | 'buffet'
  | 'cocktail'
  | 'lunch'
  | 'brunch'
  | 'snacks';

const MEAL_LABELS: Record<MealType, string> = {
  'sit-down': 'Sit-down dinner',
  buffet: 'Buffet',
  cocktail: 'Cocktail / appetizers',
  lunch: 'Lunch',
  brunch: 'Brunch',
  snacks: 'Snacks / light bites',
};

const MEAL_MULTIPLIERS: Record<MealType, number> = {
  'sit-down': 1.0,
  buffet: 1.15,
  cocktail: 0.8,
  lunch: 1.0,
  brunch: 0.9,
  snacks: 0.6,
};

type Event = {
  id: number;
  name: string;
  guests: number;
  mealType: MealType;
  vendorMeals: number;
};

let nextId = 1;
function makeEvent(partial?: Partial<Event>): Event {
  return {
    id: nextId++,
    name: partial?.name ?? 'New event',
    guests: partial?.guests ?? 200,
    mealType: partial?.mealType ?? 'sit-down',
    vendorMeals: partial?.vendorMeals ?? 10,
  };
}

const PRESETS = ['Mehndi', 'Sangeet', 'Ceremony', 'Reception', 'Brunch'];

export function PlateCountCalculator() {
  const [events, setEvents] = useState<Event[]>(() => [
    makeEvent({ name: 'Sangeet', guests: 250, mealType: 'buffet' }),
    makeEvent({ name: 'Ceremony', guests: 300, mealType: 'lunch' }),
    makeEvent({ name: 'Reception', guests: 300, mealType: 'sit-down' }),
  ]);

  function update(id: number, patch: Partial<Event>) {
    setEvents(events.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  }
  function remove(id: number) {
    setEvents(events.filter((e) => e.id !== id));
  }
  function addEvent(name?: string) {
    setEvents([...events, makeEvent({ name })]);
  }

  const result = useMemo(() => {
    if (events.length === 0) return null;
    const rows = events.map((e) => {
      const base = e.guests * MEAL_MULTIPLIERS[e.mealType];
      const bufferPct = e.guests >= 200 ? 0.15 : 0.1;
      const buffered = base * (1 + bufferPct);
      const total = Math.ceil(buffered) + e.vendorMeals;
      return { ...e, base: Math.ceil(base), total };
    });
    const grandTotal = rows.reduce((s, r) => s + r.total, 0);
    return { rows, grandTotal };
  }, [events]);

  return (
    <MiniToolShell
      name="Plate Count Calculator"
      tagline="how many plates does your caterer need?"
      estimatedTime="30 sec"
    >
      <div className={primitives.field}>
        <label className={primitives.label}>Your meal events</label>
        <div className={styles.eventList}>
          {events.map((e) => (
            <div key={e.id} className={styles.eventCard}>
              <div className={styles.eventRow}>
                <input
                  type="text"
                  value={e.name}
                  onChange={(ev) => update(e.id, { name: ev.target.value })}
                  className={styles.nameInput}
                  placeholder="Event name"
                />
                <button
                  type="button"
                  onClick={() => remove(e.id)}
                  className={styles.removeBtn}
                  aria-label="Remove event"
                >
                  ×
                </button>
              </div>
              <div className={styles.gridRow}>
                <label className={styles.subField}>
                  <span className={styles.subLabel}>Guests</span>
                  <input
                    type="number"
                    value={e.guests || ''}
                    min={0}
                    onChange={(ev) =>
                      update(e.id, { guests: Number(ev.target.value) || 0 })
                    }
                    className={styles.subInput}
                  />
                </label>
                <label className={styles.subField}>
                  <span className={styles.subLabel}>Meal type</span>
                  <select
                    value={e.mealType}
                    onChange={(ev) =>
                      update(e.id, { mealType: ev.target.value as MealType })
                    }
                    className={styles.subSelect}
                  >
                    {(Object.keys(MEAL_LABELS) as MealType[]).map((m) => (
                      <option key={m} value={m}>
                        {MEAL_LABELS[m]}
                      </option>
                    ))}
                  </select>
                </label>
                <label className={styles.subField}>
                  <span className={styles.subLabel}>Vendor meals</span>
                  <input
                    type="number"
                    value={e.vendorMeals}
                    min={0}
                    max={50}
                    onChange={(ev) =>
                      update(e.id, {
                        vendorMeals: Number(ev.target.value) || 0,
                      })
                    }
                    className={styles.subInput}
                  />
                </label>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.addRow}>
          <button
            type="button"
            onClick={() => addEvent()}
            className={styles.addBtn}
          >
            + add event
          </button>
          {PRESETS.filter(
            (p) => !events.some((e) => e.name.toLowerCase() === p.toLowerCase()),
          ).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => addEvent(p)}
              className={styles.presetBtn}
            >
              + {p}
            </button>
          ))}
        </div>
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
            <span className={primitives.resultEyebrow}>
              total plates for caterer
            </span>
            <div className={primitives.bigNumber}>{result.grandTotal}</div>
            <p className={primitives.resultLabel}>
              That&apos;s the number to give your caterer — base count plus
              buffer plus vendor meals, across all events.
            </p>

            <div className={primitives.breakdown}>
              {result.rows.map((r) => (
                <div key={r.id} className={primitives.breakdownRow}>
                  <span className={primitives.breakdownLabel}>
                    {r.name} ({MEAL_LABELS[r.mealType].toLowerCase()})
                  </span>
                  <span className={primitives.breakdownValue}>
                    {r.total} plates
                  </span>
                </div>
              ))}
            </div>

            <p className={primitives.note}>
              Buffer of 10% (under 200 guests) or 15% (200+) is baked in for
              walk-ins, kids&apos; secondary helpings, and inevitable
              under-counts. Vendor meals included separately.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </MiniToolShell>
  );
}
