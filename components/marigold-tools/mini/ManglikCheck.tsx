'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { MiniToolShell } from './MiniToolShell';
import { buildBirthChart, searchCities } from '@/lib/kundli';
import type { BirthInput, BirthChart } from '@/types/kundli';
import primitives from './MiniToolPrimitives.module.css';
import styles from './ManglikCheck.module.css';

// Educational pattern, not a verdict. We deliberately mirror the kundli
// engine's stance: precise Manglik analysis requires Mars's exact bhava
// placement and a verified Lagna (ascendant), both of which need accurate
// birth time. We compute Moon Rashi, surface Mars's natural friendship
// with the Moon Lord (a coarse correlation), but explicitly do NOT issue
// a yes/no Manglik verdict.

type Place = {
  label: string;
  lat: number;
  lng: number;
  tzOffsetHours: number;
};

const REMEDIES = [
  'Kumbh Vivah — symbolic marriage to a banana tree, peepal tree, or clay pot before the actual wedding (a long-standing parihar in some lineages).',
  'Mangal Shanti puja performed on Tuesdays — coral or red coral as a remedy stone.',
  'If both partners are Manglik, the dosha is traditionally considered cancelled (mutual cancellation).',
  'Marriage after age 28 is sometimes considered to weaken Manglik effects in popular tradition.',
];

const CANCELLATION_NOTES = [
  'Both partners being Manglik (most-cited cancellation).',
  'Mars in its own sign (Aries or Scorpio) or in exaltation (Capricorn).',
  'Specific aspect-based parihars from Jupiter or strong benefics — these require a chart reading.',
];

export function ManglikCheck() {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [timeKnown, setTimeKnown] = useState(true);
  const [placeQuery, setPlaceQuery] = useState('');
  const [place, setPlace] = useState<Place | null>(null);
  const [chart, setChart] = useState<BirthChart | null>(null);
  const [error, setError] = useState<string | null>(null);

  const cityResults = useMemo(() => {
    if (!placeQuery || place) return [];
    return searchCities(placeQuery, 6);
  }, [placeQuery, place]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!date) {
      setError('Birth date is required.');
      return;
    }
    if (!place) {
      setError('Pick a birth place from the suggestions.');
      return;
    }
    const input: BirthInput = {
      date,
      time: time || '12:00',
      timeKnown: timeKnown && time.length >= 4,
      place,
    };
    setChart(buildBirthChart(input));
  }

  function reset() {
    setChart(null);
    setError(null);
  }

  // Manglik is fundamentally Mars + Lagna driven. Without birth time we
  // cannot offer even preliminary screening — say so honestly.
  const verdictKind: 'inconclusive' | 'preliminary' = chart?.estimated
    ? 'inconclusive'
    : 'preliminary';

  return (
    <MiniToolShell
      name="Manglik Quick Check"
      tagline="are you Manglik?"
      estimatedTime="30 sec"
    >
      {!chart && (
        <form onSubmit={handleSubmit}>
          <div className={styles.row}>
            <div className={primitives.field}>
              <label className={primitives.label} htmlFor="mc-date">
                Date of birth
              </label>
              <input
                id="mc-date"
                type="date"
                className={primitives.input}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div className={primitives.field}>
              <label className={primitives.label} htmlFor="mc-time">
                Time of birth
              </label>
              <input
                id="mc-time"
                type="time"
                className={primitives.input}
                value={time}
                disabled={!timeKnown}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>

          <label
            className={`${primitives.checkboxLabel} ${
              !timeKnown ? primitives.checkboxLabelChecked : ''
            }`}
            style={{ marginBottom: 22 }}
          >
            <input
              type="checkbox"
              className={primitives.checkbox}
              checked={!timeKnown}
              onChange={(e) => setTimeKnown(!e.target.checked)}
            />
            I don&apos;t know my exact birth time
          </label>

          <div className={primitives.field}>
            <label className={primitives.label} htmlFor="mc-place">
              Place of birth
            </label>
            <input
              id="mc-place"
              type="text"
              className={primitives.input}
              value={place ? place.label : placeQuery}
              onChange={(e) => {
                setPlaceQuery(e.target.value);
                setPlace(null);
              }}
              placeholder="Mumbai, Delhi, New York…"
              autoComplete="off"
            />
            {cityResults.length > 0 && (
              <ul className={styles.suggestList}>
                {cityResults.map((c) => (
                  <li key={c.label}>
                    <button
                      type="button"
                      className={styles.suggestBtn}
                      onClick={() => {
                        setPlace({
                          label: c.label,
                          lat: c.lat,
                          lng: c.lng,
                          tzOffsetHours: c.tzOffsetHours,
                        });
                        setPlaceQuery(c.label);
                      }}
                    >
                      {c.label}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button type="submit" className={primitives.button}>
            Run preliminary check →
          </button>

          <p className={primitives.note} style={{ marginTop: 14 }}>
            <strong>Heads up:</strong> a real Manglik determination requires
            Mars&apos;s exact house placement, which depends on a precise
            birth time AND location. Without those, only an astrologer with
            your full Janam Kundli can give a definitive answer — this tool
            stops at preliminary education.
          </p>
        </form>
      )}

      <AnimatePresence>
        {chart && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.32 }}
            className={primitives.resultCard}
          >
            <span className={primitives.resultEyebrow}>preliminary check</span>

            {verdictKind === 'inconclusive' ? (
              <>
                <div className={`${styles.verdict} ${styles.verdictNeutral}`}>
                  Inconclusive
                </div>
                <p className={primitives.resultLabel}>
                  Birth time required for any meaningful Manglik assessment.
                </p>
                <p className={primitives.resultBody}>
                  Manglik Dosha is determined by Mars&apos;s placement
                  relative to your Lagna (ascendant). Lagna shifts roughly
                  every two hours — without a precise birth time we
                  can&apos;t even start. The honest answer is to find your
                  birth time (hospital records, family memory) and consult
                  a pandit with your full Kundli.
                </p>
              </>
            ) : (
              <>
                <div className={`${styles.verdict} ${styles.verdictNeutral}`}>
                  Cannot say definitively
                </div>
                <p className={primitives.resultLabel}>
                  We computed your Moon sign but not your Lagna or
                  Mars&apos;s house placement.
                </p>
                <p className={primitives.resultBody}>
                  Your Moon is in <strong>{chart.rashi}</strong>{' '}
                  ({chart.nakshatra.name} nakshatra, pada {chart.pada}). For
                  a real Manglik determination you need an astrologer to
                  compute Mars&apos;s bhava placement against houses 1, 2,
                  4, 7, 8, and 12 from your Lagna — and check for the
                  specific cancellation conditions (parihar) that may apply.
                </p>
              </>
            )}

            <div className={styles.section}>
              <span className={primitives.resultEyebrow}>
                what Manglik actually means
              </span>
              <p className={primitives.resultBody}>
                Mars (Mangal) placed in the 1st, 2nd, 4th, 7th, 8th, or 12th
                house from the Lagna is traditionally called Manglik / Mangal
                Dosha. The classical concern is friction or stress in
                marriage — though contemporary astrologers vary widely on
                how seriously to weight it.
              </p>
            </div>

            <div className={styles.section}>
              <span className={primitives.resultEyebrow}>
                common cancellation conditions
              </span>
              <ul className={styles.list}>
                {CANCELLATION_NOTES.map((n) => (
                  <li key={n} className={styles.listItem}>
                    {n}
                  </li>
                ))}
              </ul>
            </div>

            <div className={styles.section}>
              <span className={primitives.resultEyebrow}>
                traditional remedies (if confirmed)
              </span>
              <ul className={styles.list}>
                {REMEDIES.map((r) => (
                  <li key={r} className={styles.listItem}>
                    {r}
                  </li>
                ))}
              </ul>
            </div>

            <div className={primitives.crosslink}>
              For a full 36-point compatibility analysis with both partners&apos;
              charts (which surfaces Manglik as part of the report),{' '}
              <Link href="/tools/kundli">try Kundli Match →</Link>. For a
              definitive Manglik assessment, your family pandit with your
              full Janam Kundli is the right call.
            </div>

            <button
              type="button"
              onClick={reset}
              className={styles.resetBtn}
            >
              ↻ start over
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </MiniToolShell>
  );
}
