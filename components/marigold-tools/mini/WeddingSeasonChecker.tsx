'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useMemo, useState } from 'react';
import { MiniToolShell } from './MiniToolShell';
import primitives from './MiniToolPrimitives.module.css';
import styles from './WeddingSeasonChecker.module.css';

type Season = 'peak' | 'shoulder' | 'off';

const CITIES = [
  {
    key: 'dfw',
    label: 'Dallas / Fort Worth',
    months: ['off', 'peak', 'peak', 'shoulder', 'peak', 'shoulder', 'off', 'off', 'off', 'off', 'peak', 'peak'] as Season[],
  },
  {
    key: 'nyc',
    label: 'New York City',
    months: ['off', 'off', 'shoulder', 'peak', 'peak', 'peak', 'shoulder', 'shoulder', 'peak', 'peak', 'off', 'off'] as Season[],
  },
  {
    key: 'la',
    label: 'Los Angeles',
    months: ['shoulder', 'peak', 'peak', 'peak', 'peak', 'shoulder', 'shoulder', 'shoulder', 'peak', 'peak', 'shoulder', 'shoulder'] as Season[],
  },
  {
    key: 'chicago',
    label: 'Chicago',
    months: ['off', 'off', 'shoulder', 'shoulder', 'peak', 'peak', 'shoulder', 'shoulder', 'peak', 'peak', 'off', 'off'] as Season[],
  },
  {
    key: 'sf',
    label: 'San Francisco Bay Area',
    months: ['shoulder', 'shoulder', 'shoulder', 'peak', 'peak', 'peak', 'shoulder', 'shoulder', 'peak', 'peak', 'shoulder', 'shoulder'] as Season[],
  },
  {
    key: 'atl',
    label: 'Atlanta',
    months: ['off', 'shoulder', 'peak', 'peak', 'peak', 'shoulder', 'off', 'off', 'shoulder', 'peak', 'peak', 'shoulder'] as Season[],
  },
  {
    key: 'other',
    label: 'Other US metro',
    months: ['off', 'shoulder', 'shoulder', 'peak', 'peak', 'shoulder', 'shoulder', 'shoulder', 'peak', 'peak', 'shoulder', 'off'] as Season[],
  },
] as const;

const WEATHER_NOTES: Record<string, string[]> = {
  dfw: [
    'Mid-50s, clear. Best wedding weather.',
    'Mid-60s, clear. Best wedding weather.',
    '70s, mild. Pollen season — flag for allergies.',
    '80s, warm. Outdoor still works.',
    '85–90, getting hot. Outdoor evening only.',
    '90s, real heat. Indoor or evening only.',
    '95+, brutal. Indoor only.',
    '95+, brutal. Indoor only.',
    '90s, still summer. Hard outdoors.',
    '80s, cooling. Outdoor improves late.',
    '70s, perfect. Peak again.',
    '60s, cool. Peak season.',
  ],
  nyc: [
    'Cold. Indoor only.',
    'Cold. Indoor only.',
    '40s, raw.',
    '50s, blooming.',
    '60s, lovely.',
    '70s–80s, peak.',
    '80s, humid.',
    '80s, humid.',
    '70s, perfect.',
    '60s, foliage.',
    '50s, cool.',
    'Cold. Indoor only.',
  ],
  la: [
    '60s, mild.',
    '60s, mild.',
    '60s–70s.',
    '70s, lovely.',
    '70s, lovely.',
    '70s–80s, dry.',
    '80s, hot inland.',
    '80s, hot inland.',
    '80s, warm.',
    '70s, lovely.',
    '60s, mild.',
    '60s, mild.',
  ],
  chicago: [
    'Brutal cold.',
    'Brutal cold.',
    '40s, gusty.',
    '50s–60s.',
    '60s–70s.',
    '70s–80s.',
    '80s, humid.',
    '80s, humid.',
    '70s, perfect.',
    '60s, foliage.',
    '40s, gray.',
    'Brutal cold.',
  ],
  sf: [
    '50s–60s.',
    '50s–60s.',
    '60s.',
    '60s–70s.',
    '60s–70s.',
    '60s–70s.',
    '60s, foggy mornings.',
    '60s, foggy.',
    '70s, best month.',
    '70s, beautiful.',
    '60s, mild.',
    '50s, cool.',
  ],
  atl: [
    '40s, chilly.',
    '50s.',
    '60s, blooming.',
    '70s, lovely.',
    '80s, warm.',
    '85–90, humid.',
    '90s, heavy humidity.',
    '90s, heavy humidity.',
    '80s, easing.',
    '70s, peak.',
    '60s, lovely.',
    '50s, cool.',
  ],
  other: [
    'Check local averages.',
    'Check local averages.',
    'Check local averages.',
    'Check local averages.',
    'Check local averages.',
    'Check local averages.',
    'Check local averages.',
    'Check local averages.',
    'Check local averages.',
    'Check local averages.',
    'Check local averages.',
    'Check local averages.',
  ],
};

const SEASON_META: Record<Season, { label: string; pricing: string; verdict: string }> = {
  peak: {
    label: 'Peak season',
    pricing: 'Venues charge 20–40% more than off-peak.',
    verdict: 'Popular but pricey — book 14–18 months out.',
  },
  shoulder: {
    label: 'Shoulder season',
    pricing: 'Pricing within 10% of standard rates.',
    verdict: 'Sweet spot — good weather, available vendors, fair prices.',
  },
  off: {
    label: 'Off-peak',
    pricing: 'Venues often discount 10–20%. Negotiate harder.',
    verdict: 'Budget-friendly — but check muhurats and weather carefully.',
  },
};

// Indian wedding calendar context — Chaturmas blocks Jul–Nov per spec.
function indianCalendarNote(monthIdx: number): string | null {
  // 0=Jan ... 6=Jul ... 10=Nov
  if (monthIdx >= 6 && monthIdx <= 10)
    return 'Chaturmas window — many Hindu families avoid weddings July through mid-November.';
  if (monthIdx === 4 || monthIdx === 5)
    return 'Adhik Maas may apply in some years — confirm with your pandit before locking the date.';
  return null;
}

export function WeddingSeasonChecker() {
  const [date, setDate] = useState<string>('');
  const [city, setCity] = useState<(typeof CITIES)[number]['key']>('dfw');

  const result = useMemo(() => {
    if (!date) return null;
    const [, m] = date.split('-').map(Number);
    if (!m) return null;
    const monthIdx = m - 1;
    const cityData = CITIES.find((c) => c.key === city)!;
    const season = cityData.months[monthIdx]!;
    const weather = WEATHER_NOTES[city]?.[monthIdx] ?? '—';
    const meta = SEASON_META[season];
    const muhuratNote = indianCalendarNote(monthIdx);
    const monthName = new Date(2026, monthIdx, 1).toLocaleDateString('en-US', {
      month: 'long',
    });

    return { season, meta, weather, muhuratNote, monthName, cityLabel: cityData.label };
  }, [date, city]);

  return (
    <MiniToolShell
      name="Wedding Season Checker"
      tagline="is your date peak, shoulder, or off-season?"
      estimatedTime="30 sec"
    >
      <div className={primitives.field}>
        <label className={primitives.label} htmlFor="ws-date">
          Wedding date
        </label>
        <input
          id="ws-date"
          type="date"
          className={primitives.input}
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      <div className={primitives.field}>
        <label className={primitives.label} htmlFor="ws-city">
          City
        </label>
        <select
          id="ws-city"
          className={primitives.select}
          value={city}
          onChange={(e) =>
            setCity(e.target.value as (typeof CITIES)[number]['key'])
          }
        >
          {CITIES.map((c) => (
            <option key={c.key} value={c.key}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      <AnimatePresence mode="wait">
        {result && (
          <motion.div
            key={`${date}-${city}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.32 }}
            className={primitives.resultCard}
          >
            <span className={primitives.resultEyebrow}>
              {result.monthName} in {result.cityLabel}
            </span>
            <div
              className={`${styles.label} ${styles[`label_${result.season}`]}`}
            >
              {result.meta.label}
            </div>
            <p className={primitives.resultLabel}>{result.meta.verdict}</p>

            <div className={primitives.breakdown}>
              <div className={primitives.breakdownRow}>
                <span className={primitives.breakdownLabel}>Pricing impact</span>
                <span className={primitives.breakdownValue}>
                  {result.meta.pricing}
                </span>
              </div>
              <div className={primitives.breakdownRow}>
                <span className={primitives.breakdownLabel}>
                  Typical weather
                </span>
                <span className={primitives.breakdownValue}>
                  {result.weather}
                </span>
              </div>
            </div>

            {result.muhuratNote && (
              <div className={primitives.crosslink}>
                <strong>Indian calendar note:</strong> {result.muhuratNote}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </MiniToolShell>
  );
}
