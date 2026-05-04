'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useMemo, useState } from 'react';
import { MiniToolShell } from './MiniToolShell';
import primitives from './MiniToolPrimitives.module.css';
import styles from './MehendiTimeCalculator.module.css';

type Detail = 'simple' | 'medium' | 'full';

const BRIDE_TIME: Record<Detail, number> = {
  simple: 2,
  medium: 3.5,
  full: 5.5,
};

// Per-guest minutes
const GUEST_TIME: Record<Detail, number> = {
  simple: 15,
  medium: 25,
  full: 40,
};

const DETAIL_LABEL: Record<Detail, string> = {
  simple: 'Simple — hands only',
  medium: 'Medium — hands + partial arms',
  full: 'Full — hands + arms + feet',
};

function formatHours(hours: number): string {
  if (hours <= 0) return '0 min';
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} hr`;
  return `${h} hr ${m} min`;
}

export function MehendiTimeCalculator() {
  const [guests, setGuests] = useState<number>(40);
  const [artists, setArtists] = useState<number>(2);
  const [includeBride, setIncludeBride] = useState<boolean>(true);
  const [detail, setDetail] = useState<Detail>('medium');

  const result = useMemo(() => {
    if (guests < 0 || artists < 1) return null;

    const brideHours = includeBride ? BRIDE_TIME[detail] : 0;
    // One artist handles bride exclusively. Remaining artists split guests.
    const guestArtists = includeBride ? Math.max(1, artists - 1) : artists;
    const totalGuestMinutes = guests * GUEST_TIME[detail];
    const guestHours = totalGuestMinutes / guestArtists / 60;

    // Total wall-clock time = max(bride time, guest time)
    // Bride and guests can be done in parallel by different artists.
    const totalHours = Math.max(brideHours, guestHours);

    return {
      brideHours,
      guestHours,
      totalHours,
      perGuestMinutes: GUEST_TIME[detail],
    };
  }, [guests, artists, includeBride, detail]);

  return (
    <MiniToolShell
      name="Mehendi Time Calculator"
      tagline="how long will mehendi night actually take?"
      estimatedTime="30 sec"
    >
      <div className={styles.row}>
        <div className={primitives.field}>
          <label className={primitives.label} htmlFor="mt-guests">
            Guests getting mehendi
          </label>
          <input
            id="mt-guests"
            type="number"
            className={primitives.input}
            value={guests || ''}
            min={0}
            onChange={(e) => setGuests(Number(e.target.value) || 0)}
          />
        </div>
        <div className={primitives.field}>
          <label className={primitives.label} htmlFor="mt-artists">
            Number of artists
          </label>
          <input
            id="mt-artists"
            type="number"
            className={primitives.input}
            value={artists || ''}
            min={1}
            max={20}
            onChange={(e) => setArtists(Number(e.target.value) || 1)}
          />
        </div>
      </div>

      <div className={primitives.field}>
        <label className={primitives.label} htmlFor="mt-detail">
          Detail level
        </label>
        <select
          id="mt-detail"
          className={primitives.select}
          value={detail}
          onChange={(e) => setDetail(e.target.value as Detail)}
        >
          {(Object.keys(DETAIL_LABEL) as Detail[]).map((d) => (
            <option key={d} value={d}>
              {DETAIL_LABEL[d]}
            </option>
          ))}
        </select>
      </div>

      <label
        className={`${primitives.checkboxLabel} ${
          includeBride ? primitives.checkboxLabelChecked : ''
        }`}
        style={{ marginBottom: 22 }}
      >
        <input
          type="checkbox"
          className={primitives.checkbox}
          checked={includeBride}
          onChange={(e) => setIncludeBride(e.target.checked)}
        />
        Include the bride (full bridal mehendi)
      </label>

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
            <span className={primitives.resultEyebrow}>total time needed</span>
            <div className={primitives.bigNumber}>
              {formatHours(result.totalHours)}
            </div>
            <p className={primitives.resultLabel}>
              Plan your start time backwards from your event end.
            </p>

            <div className={primitives.breakdown}>
              {includeBride && (
                <div className={primitives.breakdownRow}>
                  <span className={primitives.breakdownLabel}>
                    Bride (one artist, exclusive)
                  </span>
                  <span className={primitives.breakdownValue}>
                    {formatHours(result.brideHours)}
                  </span>
                </div>
              )}
              <div className={primitives.breakdownRow}>
                <span className={primitives.breakdownLabel}>
                  Guests ({guests} at {result.perGuestMinutes} min each, split across{' '}
                  {includeBride ? Math.max(1, artists - 1) : artists} artist
                  {(includeBride ? artists - 1 : artists) === 1 ? '' : 's'})
                </span>
                <span className={primitives.breakdownValue}>
                  {formatHours(result.guestHours)}
                </span>
              </div>
            </div>

            <p className={primitives.note}>
              Start the bride first — her mehendi takes longest and needs to dry.
              Add 30 minutes of buffer for setup, breaks, and the inevitable
              &ldquo;wait, can you do my friend too?&rdquo;
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </MiniToolShell>
  );
}
