'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useMemo, useState } from 'react';
import { MiniToolShell } from './MiniToolShell';
import primitives from './MiniToolPrimitives.module.css';
import styles from './WeatherBackup.module.css';
import {
  SUPPORTED_CITIES,
  getWeatherForCityMonth,
} from '@/lib/auspicious-date/data/weather';

type VenueType = 'fully-outdoor' | 'covered-outdoor' | 'mixed' | 'indoor';

const VENUE_LABELS: Record<VenueType, string> = {
  'fully-outdoor': 'Fully outdoor (no cover)',
  'covered-outdoor': 'Covered outdoor (tent / pavilion)',
  mixed: 'Mixed — outdoor ceremony, indoor reception',
  indoor: 'Fully indoor',
};

function backupSeverity(score: number, rainChance: number, venue: VenueType): {
  level: 'critical' | 'recommended' | 'optional' | 'low';
  headline: string;
} {
  // Already indoors? Always low.
  if (venue === 'indoor') {
    return { level: 'low', headline: 'You\'re already indoors — no backup needed.' };
  }

  // Score is 1 (worst) to 5 (best). Combine with rain chance for outdoor risk.
  const outdoorRisk = (6 - score) * 12 + rainChance; // 0–100 ish
  const exposed = venue === 'fully-outdoor';

  if (outdoorRisk >= 70 || (exposed && rainChance >= 40)) {
    return {
      level: 'critical',
      headline: 'Backup plan is non-negotiable. Weather risk is too high to wing it.',
    };
  }
  if (outdoorRisk >= 50 || (exposed && rainChance >= 25)) {
    return {
      level: 'recommended',
      headline: 'Lock in a backup before final contracts. Weather risk is real.',
    };
  }
  if (outdoorRisk >= 35) {
    return {
      level: 'optional',
      headline: 'Lean weather, but a Plan B will help you sleep at night.',
    };
  }
  return {
    level: 'low',
    headline: 'Conditions are usually friendly. A Plan B is good practice but not urgent.',
  };
}

function buildAdvice(
  highF: number,
  lowF: number,
  rainChance: number,
  venue: VenueType,
): string[] {
  const advice: string[] = [];

  if (rainChance >= 40) {
    advice.push('Rain risk is meaningful. Reserve a tent or covered structure with sidewalls.');
    advice.push('Schedule a tent walk-through with the rental company 2–3 weeks before.');
  } else if (rainChance >= 25) {
    advice.push('Tent on standby — many companies offer "weather hold" deposits.');
  }

  if (highF >= 90) {
    advice.push('Heat is the bigger risk. Plan misting fans, shaded seating, hydration stations.');
    advice.push('Move ceremony to morning (before 10 AM) or evening (after 5 PM).');
    advice.push('Heavy lehengas + 95°F = heat stroke. Cool the room aggressively.');
  } else if (highF >= 80) {
    advice.push('Warm weather — provide hand fans, sunscreen, and ample shaded seating.');
  }

  if (lowF <= 45) {
    advice.push('Cool evenings — patio heaters and a wrap option for the bride.');
  }
  if (lowF <= 32) {
    advice.push('Freezing risk. Outdoor seating only with heaters + heated tent flooring.');
  }

  if (venue === 'fully-outdoor') {
    advice.push('Order at minimum: 1 large tent, sidewalls, sub-flooring, generators.');
    advice.push('Confirm with planner: who calls the weather call, and by what time on the day?');
  } else if (venue === 'covered-outdoor') {
    advice.push('Confirm tent rating handles wind + rain (look for >40 mph rating).');
    advice.push('Side panels available the day-of in case wind/rain shifts.');
  } else if (venue === 'mixed') {
    advice.push('Have an indoor backup space at the same venue if the outdoor portion shifts.');
  }

  advice.push('Check the 14-day forecast 7 days out and again 48 hours before — that\'s when you call it.');
  advice.push('Communicate the call to vendors via a predefined "Plan A or B" text by 8 AM day-of.');

  return advice;
}

function monthFromDateString(s: string): number | null {
  if (!s) return null;
  const [y, m] = s.split('-').map((n) => parseInt(n, 10));
  if (Number.isNaN(m)) return null;
  return m;
}

function monthName(m: number): string {
  return new Date(2000, m - 1, 1).toLocaleString('en-US', { month: 'long' });
}

export function WeatherBackup() {
  const [city, setCity] = useState<string>('dallas');
  const [date, setDate] = useState('');
  const [venue, setVenue] = useState<VenueType>('mixed');

  const month = monthFromDateString(date);
  const weather = month ? getWeatherForCityMonth(city, month) : null;
  const cityLabel = SUPPORTED_CITIES.find((c) => c.value === city)?.label ?? '';

  const verdict = useMemo(() => {
    if (!weather) return null;
    return backupSeverity(weather.weatherScore, weather.rainChance, venue);
  }, [weather, venue]);

  const advice = useMemo(() => {
    if (!weather) return null;
    return buildAdvice(weather.avgHighF, weather.avgLowF, weather.rainChance, venue);
  }, [weather, venue]);

  return (
    <MiniToolShell
      name="Weather Backup Plan Checker"
      tagline="what's the weather forecast for your wedding date?"
      estimatedTime="30 sec"
    >
      <div className={styles.row}>
        <div className={primitives.field}>
          <label className={primitives.label} htmlFor="wb-city">
            Wedding location
          </label>
          <select
            id="wb-city"
            className={primitives.select}
            value={city}
            onChange={(e) => setCity(e.target.value)}
          >
            {SUPPORTED_CITIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <div className={primitives.field}>
          <label className={primitives.label} htmlFor="wb-date">
            Wedding date
          </label>
          <input
            id="wb-date"
            type="date"
            className={primitives.input}
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
      </div>

      <div className={primitives.field}>
        <label className={primitives.label} htmlFor="wb-venue">
          Venue type
        </label>
        <select
          id="wb-venue"
          className={primitives.select}
          value={venue}
          onChange={(e) => setVenue(e.target.value as VenueType)}
        >
          {(Object.keys(VENUE_LABELS) as VenueType[]).map((v) => (
            <option key={v} value={v}>
              {VENUE_LABELS[v]}
            </option>
          ))}
        </select>
      </div>

      <AnimatePresence mode="wait">
        {weather && verdict && advice && month && (
          <motion.div
            key={`${city}-${date}-${venue}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28 }}
            className={primitives.resultCard}
          >
            <span className={primitives.resultEyebrow}>
              {monthName(month)} in {cityLabel}
            </span>

            <div className={styles.summary}>
              <div className={styles.statBlock}>
                <span className={styles.statLabel}>avg high</span>
                <span className={styles.statValue}>{weather.avgHighF}°F</span>
              </div>
              <div className={styles.statBlock}>
                <span className={styles.statLabel}>avg low</span>
                <span className={styles.statValue}>{weather.avgLowF}°F</span>
              </div>
              <div className={styles.statBlock}>
                <span className={styles.statLabel}>rain chance</span>
                <span className={styles.statValue}>{weather.rainChance}%</span>
              </div>
            </div>

            <p className={styles.descLine}>{weather.description}</p>

            <div
              className={`${styles.verdict} ${
                verdict.level === 'critical'
                  ? styles.verdictCritical
                  : verdict.level === 'recommended'
                  ? styles.verdictRecommended
                  : verdict.level === 'optional'
                  ? styles.verdictOptional
                  : styles.verdictLow
              }`}
            >
              <span className={styles.verdictLabel}>
                {verdict.level === 'critical' && 'critical'}
                {verdict.level === 'recommended' && 'recommended'}
                {verdict.level === 'optional' && 'optional'}
                {verdict.level === 'low' && 'low risk'}
              </span>
              <p className={styles.verdictHeadline}>{verdict.headline}</p>
            </div>

            <div className={styles.adviceSection}>
              <span className={primitives.resultEyebrow}>your action list</span>
              <ul className={styles.adviceList}>
                {advice.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
            </div>

            <p className={primitives.note}>
              These are historical averages — not a live forecast. Pull live
              forecasts from your weather app once you&apos;re inside the
              14-day window.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </MiniToolShell>
  );
}
