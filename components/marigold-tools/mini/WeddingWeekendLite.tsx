'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { MiniToolShell } from './MiniToolShell';
import primitives from './MiniToolPrimitives.module.css';
import styles from './WeddingWeekendLite.module.css';

const EVENTS = [
  'Mehndi',
  'Sangeet/Garba',
  'Haldi',
  'Ceremony',
  'Reception',
  'Welcome Dinner',
  'Farewell Brunch',
  'Cocktail Hour',
  'Pooja/Ganesh Puja',
  'Maiyan',
  'Chooda/Kalire',
] as const;

type EventName = (typeof EVENTS)[number];

function recommendedDays(count: number): number {
  if (count <= 2) return 1;
  if (count <= 4) return 2;
  if (count <= 6) return 3;
  if (count <= 8) return 4;
  return 5;
}

// Group selected events into days following the spec's pairing rules.
// Rules: Welcome Dinner first evening; Pooja first day; Mehndi+Haldi pair
// (daytime); Sangeet evening standalone; Ceremony+Reception can share or
// split; Farewell Brunch last morning.
function groupIntoDays(selected: EventName[], days: number): string[][] {
  const set = new Set(selected);
  const buckets: string[][] = Array.from({ length: days }, () => []);

  let dayIdx = 0;
  const advance = () => {
    if (dayIdx < days - 1) dayIdx++;
  };

  // Day 1 anchors
  if (set.has('Pooja/Ganesh Puja')) buckets[0]!.push('Pooja/Ganesh Puja');
  if (set.has('Welcome Dinner')) buckets[0]!.push('Welcome Dinner');
  if (set.has('Maiyan')) buckets[0]!.push('Maiyan');

  // Mehndi + Haldi pair (next day)
  if (days > 1) advance();
  if (set.has('Mehndi')) buckets[dayIdx]!.push('Mehndi');
  if (set.has('Haldi')) buckets[dayIdx]!.push('Haldi');
  if (set.has('Chooda/Kalire')) buckets[dayIdx]!.push('Chooda/Kalire');

  // Sangeet — its own evening
  if (set.has('Sangeet/Garba')) {
    if (buckets[dayIdx]!.length > 0 && days > dayIdx + 1) advance();
    buckets[dayIdx]!.push('Sangeet/Garba');
  }

  // Ceremony + Reception
  if (set.has('Ceremony') || set.has('Cocktail Hour') || set.has('Reception')) {
    if (buckets[dayIdx]!.length > 0 && days > dayIdx + 1) advance();
    if (set.has('Ceremony')) buckets[dayIdx]!.push('Ceremony');
    if (set.has('Cocktail Hour')) buckets[dayIdx]!.push('Cocktail Hour');
    if (set.has('Reception')) buckets[dayIdx]!.push('Reception');
  }

  // Farewell brunch — last morning, gets its own day if possible
  if (set.has('Farewell Brunch')) {
    const lastDay = buckets[days - 1]!;
    if (lastDay !== buckets[dayIdx] || lastDay.length === 0) {
      lastDay.push('Farewell Brunch');
    } else if (days > dayIdx + 1) {
      buckets[days - 1]!.push('Farewell Brunch');
    } else {
      buckets[dayIdx]!.push('Farewell Brunch');
    }
  }

  return buckets.filter((b) => b.length > 0);
}

export function WeddingWeekendLite() {
  const [selected, setSelected] = useState<Set<EventName>>(new Set());

  function toggle(event: EventName) {
    const next = new Set(selected);
    if (next.has(event)) next.delete(event);
    else next.add(event);
    setSelected(next);
  }

  const result = useMemo(() => {
    if (selected.size === 0) return null;
    const days = recommendedDays(selected.size);
    const arr = Array.from(selected);
    const grouped = groupIntoDays(arr, days);
    return { days, count: selected.size, grouped };
  }, [selected]);

  return (
    <MiniToolShell
      name="Wedding Weekend Planner Lite"
      tagline="how many days does your wedding actually need?"
      estimatedTime="30 sec"
    >
      <div className={primitives.field}>
        <label className={primitives.label}>Pick your events</label>
        <div className={primitives.checkboxGrid}>
          {EVENTS.map((e) => {
            const isOn = selected.has(e);
            return (
              <label
                key={e}
                className={`${primitives.checkboxLabel} ${
                  isOn ? primitives.checkboxLabelChecked : ''
                }`}
              >
                <input
                  type="checkbox"
                  className={primitives.checkbox}
                  checked={isOn}
                  onChange={() => toggle(e)}
                />
                {e}
              </label>
            );
          })}
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
            <span className={primitives.resultEyebrow}>
              {result.count} event{result.count === 1 ? '' : 's'} →
            </span>
            <div className={primitives.bigNumber}>
              {result.days} <span className={styles.unit}>day{result.days === 1 ? '' : 's'}</span>
            </div>
            <p className={primitives.resultLabel}>
              Here&apos;s how to spread them across the weekend.
            </p>

            <div className={styles.dayList}>
              {result.grouped.map((events, idx) => (
                <div key={idx} className={styles.dayBlock}>
                  <span className={styles.dayLabel}>Day {idx + 1}</span>
                  <span className={styles.dayEvents}>{events.join(' · ')}</span>
                </div>
              ))}
            </div>

            <div className={primitives.crosslink}>
              Want the full hour-by-hour timeline?{' '}
              <Link href="/tools/visualizer">Wedding Weekend Visualizer →</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </MiniToolShell>
  );
}
