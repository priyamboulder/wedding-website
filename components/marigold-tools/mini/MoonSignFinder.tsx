'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { MiniToolShell } from './MiniToolShell';
import { buildBirthChart, searchCities } from '@/lib/kundli';
import type { BirthInput, BirthChart } from '@/types/kundli';
import primitives from './MiniToolPrimitives.module.css';
import styles from './MoonSignFinder.module.css';

// Personality blurbs per Rashi — 2-3 sentences each.
const RASHI_BLURB: Record<string, string> = {
  Mesh: 'Fire-led, action-first, allergic to indecision. You move on impulse and good instincts — your weddings (and life) tend to look bold from the outside and feel exciting from the inside.',
  Vrishabha: 'Earth-grounded, beauty-loving, deeply loyal. You build slowly and keep what you build. Aesthetic decisions are non-negotiable for you.',
  Mithuna: 'Air-quick, communicative, endlessly curious. You can talk to anyone — including the in-laws who scare everyone else. Switch contexts faster than most.',
  Karka: 'Water-deep, family-anchored, fiercely protective. Home and family are the centerpiece — your wedding will lean traditional and emotional.',
  Simha: 'Fire-bright, generous, born for the spotlight. Your wedding will be memorable — by your design, not by accident.',
  Kanya: 'Earth-precise, analytical, quietly perfectionist. Your spreadsheets are legendary. Your wedding will run on time.',
  Tula: 'Air-balanced, partnership-oriented, aesthetically obsessed. The ideal Rashi for a wedding — you genuinely love this stuff.',
  Vrishchika: 'Water-intense, deeply private, transformative. You feel everything in extremes. Your love is a moat-and-castle situation.',
  Dhanu: 'Fire-philosophical, freedom-loving, optimistic. Your wedding probably involves a destination or an unconventional twist.',
  Makara: 'Earth-disciplined, ambitious, long-term-minded. You\'re marrying with a 20-year vision in mind, and that\'s the right way.',
  Kumbha: 'Air-original, future-facing, slightly contrarian. You will have at least one tradition you\'re consciously updating.',
  Meena: 'Water-dreamy, intuitive, emotionally generous. You make people feel safe. Your wedding will feel like a really good hug.',
};

type Place = {
  label: string;
  lat: number;
  lng: number;
  tzOffsetHours: number;
};

export function MoonSignFinder() {
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

  return (
    <MiniToolShell
      name="What's My Moon Sign?"
      tagline="find your Chandra Rashi instantly"
      estimatedTime="30 sec"
    >
      {!chart && (
        <form onSubmit={handleSubmit}>
          <div className={styles.row}>
            <div className={primitives.field}>
              <label className={primitives.label} htmlFor="ms-date">
                Date of birth
              </label>
              <input
                id="ms-date"
                type="date"
                className={primitives.input}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div className={primitives.field}>
              <label className={primitives.label} htmlFor="ms-time">
                Time of birth
              </label>
              <input
                id="ms-time"
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
            I don&apos;t know my exact birth time (we&apos;ll use noon)
          </label>

          <div className={primitives.field}>
            <label className={primitives.label} htmlFor="ms-place">
              Place of birth
            </label>
            <input
              id="ms-place"
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
            Find my Moon sign →
          </button>
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
            <span className={primitives.resultEyebrow}>your Chandra Rashi</span>
            <h2 className={styles.rashiName}>{chart.rashi}</h2>

            <div className={primitives.breakdown}>
              <div className={primitives.breakdownRow}>
                <span className={primitives.breakdownLabel}>Nakshatra</span>
                <span className={primitives.breakdownValue}>
                  {chart.nakshatra.name}
                </span>
              </div>
              <div className={primitives.breakdownRow}>
                <span className={primitives.breakdownLabel}>Pada</span>
                <span className={primitives.breakdownValue}>{chart.pada}</span>
              </div>
              <div className={primitives.breakdownRow}>
                <span className={primitives.breakdownLabel}>Ruling planet</span>
                <span className={primitives.breakdownValue}>
                  {chart.nakshatra.ruler}
                </span>
              </div>
              <div className={primitives.breakdownRow}>
                <span className={primitives.breakdownLabel}>Gana</span>
                <span className={primitives.breakdownValue}>
                  {chart.nakshatra.gana}
                </span>
              </div>
              <div className={primitives.breakdownRow}>
                <span className={primitives.breakdownLabel}>Nadi</span>
                <span className={primitives.breakdownValue}>
                  {chart.nakshatra.nadi}
                </span>
              </div>
            </div>

            {RASHI_BLURB[chart.rashi] && (
              <p className={primitives.resultBody} style={{ marginTop: 18 }}>
                {RASHI_BLURB[chart.rashi]}
              </p>
            )}

            {chart.estimated && chart.estimationReason && (
              <p className={primitives.note}>{chart.estimationReason}</p>
            )}

            <div className={primitives.crosslink}>
              Want to check compatibility with a partner?{' '}
              <Link href="/tools/kundli">Try Kundli Match →</Link> for the full
              36-point Ashtakoota analysis. Curious what your stars say about
              wedding planning?{' '}
              <Link href="/tools/wedding-stars">Wedding Stars →</Link>
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
