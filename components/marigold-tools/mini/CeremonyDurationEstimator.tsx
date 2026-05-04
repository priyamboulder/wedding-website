'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useMemo, useState } from 'react';
import { MiniToolShell } from './MiniToolShell';
import primitives from './MiniToolPrimitives.module.css';
import styles from './CeremonyDurationEstimator.module.css';

type CeremonyKey =
  | 'hindu-north'
  | 'hindu-south'
  | 'hindu-gujarati'
  | 'hindu-bengali'
  | 'sikh'
  | 'muslim'
  | 'christian'
  | 'interfaith'
  | 'civil';

type Style = 'traditional' | 'moderate' | 'abbreviated';

const CEREMONIES: { key: CeremonyKey; label: string }[] = [
  { key: 'hindu-north', label: 'Hindu — North Indian' },
  { key: 'hindu-south', label: 'Hindu — South Indian' },
  { key: 'hindu-gujarati', label: 'Hindu — Gujarati' },
  { key: 'hindu-bengali', label: 'Hindu — Bengali' },
  { key: 'sikh', label: 'Sikh — Anand Karaj' },
  { key: 'muslim', label: 'Muslim — Nikah' },
  { key: 'christian', label: 'Christian / Western' },
  { key: 'interfaith', label: 'Interfaith / Fusion' },
  { key: 'civil', label: 'Civil / Court' },
];

// Duration ranges in [minLow, maxHigh] minutes per ceremony × style.
const DURATIONS: Record<CeremonyKey, Record<Style, [number, number]>> = {
  'hindu-north': {
    traditional: [150, 240],
    moderate: [90, 150],
    abbreviated: [60, 90],
  },
  'hindu-south': {
    traditional: [180, 300],
    moderate: [120, 180],
    abbreviated: [90, 120],
  },
  'hindu-gujarati': {
    traditional: [120, 180],
    moderate: [90, 120],
    abbreviated: [60, 90],
  },
  'hindu-bengali': {
    traditional: [240, 360],
    moderate: [120, 180],
    abbreviated: [90, 120],
  },
  sikh: {
    traditional: [120, 180],
    moderate: [90, 120],
    abbreviated: [60, 90],
  },
  muslim: {
    traditional: [60, 120],
    moderate: [45, 90],
    abbreviated: [30, 45],
  },
  christian: {
    traditional: [45, 60],
    moderate: [30, 45],
    abbreviated: [20, 30],
  },
  interfaith: {
    traditional: [90, 120],
    moderate: [60, 90],
    abbreviated: [45, 60],
  },
  civil: {
    traditional: [20, 30],
    moderate: [15, 25],
    abbreviated: [10, 15],
  },
};

// Per-ceremony segment breakdowns. Stylistic note: we don't try to scale
// segments to style — just show what makes up a Traditional ceremony so
// couples know what they'd be cutting.
const SEGMENTS: Partial<Record<CeremonyKey, { name: string; mins: string }[]>> =
  {
    'hindu-north': [
      { name: 'Ganesh Puja', mins: '10–15 min' },
      { name: 'Jai Mala', mins: '10 min' },
      { name: 'Kanyadaan', mins: '15–20 min' },
      { name: 'Mangal Pheras', mins: '20–30 min' },
      { name: 'Sindoor + Mangalsutra', mins: '10 min' },
      { name: 'Saptapadi', mins: '15 min' },
      { name: 'Vidaai prep', mins: '15–20 min' },
    ],
    'hindu-south': [
      { name: 'Nischayathartham (engagement)', mins: '20 min' },
      { name: 'Kashi Yatra', mins: '15 min' },
      { name: 'Mala Mathral', mins: '15 min' },
      { name: 'Oonjal', mins: '20 min' },
      { name: 'Kanyadaan', mins: '20 min' },
      { name: 'Mangalya Dharanam', mins: '15 min' },
      { name: 'Saptapadi', mins: '20 min' },
      { name: 'Pradhana Homam', mins: '30 min' },
    ],
    sikh: [
      { name: 'Kirtan + Ardas', mins: '20 min' },
      { name: 'Palla Ceremony', mins: '15 min' },
      { name: 'Lavan (4 phera)', mins: '40 min' },
      { name: 'Final Ardas + Hukamnama', mins: '20 min' },
      { name: 'Anand Sahib + Karah Prashad', mins: '20 min' },
    ],
    muslim: [
      { name: "Imam's khutbah (sermon)", mins: '15 min' },
      { name: 'Ijab-e-Qubool (consent)', mins: '5 min' },
      { name: 'Nikah Nama signing', mins: '15 min' },
      { name: 'Mahr discussion', mins: '10 min' },
      { name: 'Dua + congratulations', mins: '15 min' },
    ],
  };

const NOTES: Partial<Record<CeremonyKey, string>> = {
  'hindu-north':
    'Saptapadi and Mangal Pheras are non-negotiable. Ganesh Puja and Vidaai can be shortened. Some families combine Sindoor + Mangalsutra to save 5 min.',
  'hindu-south':
    'South Indian ceremonies are the longest of the Hindu traditions. Pradhana Homam (the fire ritual) cannot be shortened — it has fixed mantra durations.',
  sikh: 'The four Lavan must be sung in full. Nothing else can shorten an Anand Karaj meaningfully — its length is fairly fixed.',
  muslim:
    'Nikahs are short by design. The Imam can deliver a longer or shorter khutbah, but the Ijab-e-Qubool and signing are quick.',
};

function formatRange([lo, hi]: [number, number]): string {
  const fmt = (m: number) => {
    const h = m / 60;
    if (h < 1) return `${m} min`;
    if (h === Math.floor(h)) return `${h} hr`;
    return `${h.toFixed(1)} hr`;
  };
  return `${fmt(lo)} – ${fmt(hi)}`;
}

export function CeremonyDurationEstimator() {
  const [ceremony, setCeremony] = useState<CeremonyKey>('hindu-north');
  const [style, setStyle] = useState<Style>('moderate');

  const duration = DURATIONS[ceremony][style];
  const segments = SEGMENTS[ceremony];
  const note = NOTES[ceremony];
  const ceremonyLabel =
    CEREMONIES.find((c) => c.key === ceremony)?.label ?? '';

  const showSegments = useMemo(
    () => style === 'traditional' && segments && segments.length > 0,
    [style, segments],
  );

  return (
    <MiniToolShell
      name="Ceremony Duration Estimator"
      tagline="how long will the pheras take?"
      estimatedTime="30 sec"
    >
      <div className={primitives.field}>
        <label className={primitives.label} htmlFor="cd-ceremony">
          Ceremony type
        </label>
        <select
          id="cd-ceremony"
          className={primitives.select}
          value={ceremony}
          onChange={(e) => setCeremony(e.target.value as CeremonyKey)}
        >
          {CEREMONIES.map((c) => (
            <option key={c.key} value={c.key}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      <div className={primitives.field}>
        <label className={primitives.label}>Style</label>
        <div className={styles.styleRow}>
          {(['traditional', 'moderate', 'abbreviated'] as Style[]).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStyle(s)}
              className={`${styles.styleChip} ${
                style === s ? styles.styleChipActive : ''
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={`${ceremony}-${style}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.28 }}
          className={primitives.resultCard}
        >
          <span className={primitives.resultEyebrow}>
            {ceremonyLabel} — {style}
          </span>
          <div className={primitives.bigNumber}>{formatRange(duration)}</div>
          <p className={primitives.resultLabel}>
            Plan your timeline with the high end. Ceremonies always run long.
          </p>

          {showSegments && (
            <div className={primitives.breakdown}>
              {segments!.map((s) => (
                <div key={s.name} className={primitives.breakdownRow}>
                  <span className={primitives.breakdownLabel}>{s.name}</span>
                  <span className={primitives.breakdownValue}>{s.mins}</span>
                </div>
              ))}
            </div>
          )}

          {note && <p className={primitives.note}>{note}</p>}
        </motion.div>
      </AnimatePresence>
    </MiniToolShell>
  );
}
