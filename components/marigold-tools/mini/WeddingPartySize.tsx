'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useMemo, useState } from 'react';
import { MiniToolShell } from './MiniToolShell';
import primitives from './MiniToolPrimitives.module.css';
import styles from './WeddingPartySize.module.css';

const VENUE_SIZES = [
  { key: 'intimate', label: 'Intimate' },
  { key: 'medium', label: 'Medium' },
  { key: 'large', label: 'Large' },
  { key: 'huge', label: 'Very large' },
] as const;

const CEREMONIES = [
  { key: 'hindu', label: 'Hindu' },
  { key: 'sikh', label: 'Sikh' },
  { key: 'muslim', label: 'Muslim' },
  { key: 'christian', label: 'Christian / Western' },
  { key: 'fusion', label: 'Fusion / Interfaith' },
] as const;

function recommendRange(guests: number): [number, number] {
  if (guests < 100) return [2, 4];
  if (guests < 200) return [3, 6];
  if (guests < 400) return [4, 8];
  return [6, 10];
}

export function WeddingPartySize() {
  const [guests, setGuests] = useState<number>(200);
  const [events, setEvents] = useState<number>(3);
  const [ceremony, setCeremony] =
    useState<(typeof CEREMONIES)[number]['key']>('hindu');
  const [venue, setVenue] =
    useState<(typeof VENUE_SIZES)[number]['key']>('medium');

  const result = useMemo(() => {
    if (guests <= 0) return null;

    let [low, high] = recommendRange(guests);

    // Venue constraints — intimate venues + large parties = problems
    if (venue === 'intimate') {
      high = Math.min(high, 4);
    } else if (venue === 'huge' && guests >= 200) {
      high = Math.min(10, high + 1);
    }

    // Multi-day events benefit from a few extra hands
    if (events >= 5) low = Math.max(low, low + 1);

    const notes: string[] = [];
    if (high > 8)
      notes.push(
        'More than 8 per side makes choreographed photos take 45+ minutes.',
      );
    if (venue === 'intimate' && guests >= 100)
      notes.push(
        "An intimate venue with a big party gets crowded fast. Each bridesmaid needs a getting-ready station — do you have space for that many?",
      );
    if (events >= 5)
      notes.push(
        'With 5+ events, having a few extra trusted hands helps. Just make sure they want to actually help — not just look good in photos.',
      );
    if (ceremony === 'sikh')
      notes.push(
        "In an Anand Karaj, the wedding party doesn't typically process — they're just guests. Smaller is fine.",
      );

    return { low, high, notes };
  }, [guests, events, ceremony, venue]);

  return (
    <MiniToolShell
      name="Wedding Party Size Guide"
      tagline="how many bridesmaids is too many?"
      estimatedTime="30 sec"
    >
      <div className={styles.row}>
        <div className={primitives.field}>
          <label className={primitives.label} htmlFor="wp-guests">
            Guest count
          </label>
          <input
            id="wp-guests"
            type="number"
            className={primitives.input}
            value={guests || ''}
            min={1}
            onChange={(e) => setGuests(Number(e.target.value) || 0)}
          />
        </div>
        <div className={primitives.field}>
          <label className={primitives.label} htmlFor="wp-events">
            Number of events
          </label>
          <input
            id="wp-events"
            type="number"
            className={primitives.input}
            value={events || ''}
            min={1}
            max={10}
            onChange={(e) => setEvents(Number(e.target.value) || 1)}
          />
        </div>
      </div>

      <div className={styles.row}>
        <div className={primitives.field}>
          <label className={primitives.label} htmlFor="wp-ceremony">
            Ceremony type
          </label>
          <select
            id="wp-ceremony"
            className={primitives.select}
            value={ceremony}
            onChange={(e) =>
              setCeremony(e.target.value as (typeof CEREMONIES)[number]['key'])
            }
          >
            {CEREMONIES.map((c) => (
              <option key={c.key} value={c.key}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <div className={primitives.field}>
          <label className={primitives.label} htmlFor="wp-venue">
            Venue size
          </label>
          <select
            id="wp-venue"
            className={primitives.select}
            value={venue}
            onChange={(e) =>
              setVenue(e.target.value as (typeof VENUE_SIZES)[number]['key'])
            }
          >
            {VENUE_SIZES.map((v) => (
              <option key={v.key} value={v.key}>
                {v.label}
              </option>
            ))}
          </select>
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
              recommended party size
            </span>
            <div className={primitives.bigNumber}>
              {result.low}–{result.high}{' '}
              <span className={styles.unit}>per side</span>
            </div>
            <p className={primitives.resultLabel}>
              That&apos;s {result.low * 2}–{result.high * 2} people total
              across both sides.
            </p>

            {result.notes.length > 0 && (
              <ul className={styles.noteList}>
                {result.notes.map((n) => (
                  <li key={n} className={styles.noteItem}>
                    {n}
                  </li>
                ))}
              </ul>
            )}

            <p className={primitives.note}>
              More isn&apos;t always better. Pick people who&apos;ll actually
              help you plan — not just look good in photos.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </MiniToolShell>
  );
}
