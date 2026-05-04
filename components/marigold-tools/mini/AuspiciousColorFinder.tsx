'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useMemo, useState } from 'react';
import { MiniToolShell } from './MiniToolShell';
import primitives from './MiniToolPrimitives.module.css';
import styles from './AuspiciousColorFinder.module.css';

const RASHIS = [
  { key: 'mesh', label: 'Mesh (Aries)', element: 'fire' },
  { key: 'vrishabha', label: 'Vrishabha (Taurus)', element: 'earth' },
  { key: 'mithuna', label: 'Mithuna (Gemini)', element: 'air' },
  { key: 'karka', label: 'Karka (Cancer)', element: 'water' },
  { key: 'simha', label: 'Simha (Leo)', element: 'fire' },
  { key: 'kanya', label: 'Kanya (Virgo)', element: 'earth' },
  { key: 'tula', label: 'Tula (Libra)', element: 'air' },
  { key: 'vrishchika', label: 'Vrishchika (Scorpio)', element: 'water' },
  { key: 'dhanu', label: 'Dhanu (Sagittarius)', element: 'fire' },
  { key: 'makara', label: 'Makara (Capricorn)', element: 'earth' },
  { key: 'kumbha', label: 'Kumbha (Aquarius)', element: 'air' },
  { key: 'meena', label: 'Meena (Pisces)', element: 'water' },
] as const;

type Element = (typeof RASHIS)[number]['element'];

// Day → ruling planet → base color set, with element-specific shades.
const DAYS = [
  {
    name: 'Sunday',
    planet: 'Sun',
    palette: {
      fire: { name: 'Saffron', hex: '#E8A547' },
      earth: { name: 'Burnt Gold', hex: '#B8924A' },
      air: { name: 'Coral', hex: '#E07A5F' },
      water: { name: 'Sunset Rose', hex: '#D86E5F' },
    },
  },
  {
    name: 'Monday',
    planet: 'Moon',
    palette: {
      fire: { name: 'Cream', hex: '#F5EFE3' },
      earth: { name: 'Pearl', hex: '#EFE9DD' },
      air: { name: 'Silver Mist', hex: '#D8D4CA' },
      water: { name: 'Moonstone', hex: '#E8E4DA' },
    },
  },
  {
    name: 'Tuesday',
    planet: 'Mars',
    palette: {
      fire: { name: 'Maharani Red', hex: '#9B1B30' },
      earth: { name: 'Brick', hex: '#A0432A' },
      air: { name: 'Coral Red', hex: '#C66E47' },
      water: { name: 'Garnet', hex: '#7A1F3E' },
    },
  },
  {
    name: 'Wednesday',
    planet: 'Mercury',
    palette: {
      fire: { name: 'Olive', hex: '#7A8048' },
      earth: { name: 'Sage', hex: '#A8B5A0' },
      air: { name: 'Mint', hex: '#B5C8B0' },
      water: { name: 'Emerald', hex: '#1F5F4F' },
    },
  },
  {
    name: 'Thursday',
    planet: 'Jupiter',
    palette: {
      fire: { name: 'Marigold', hex: '#E8A547' },
      earth: { name: 'Antique Gold', hex: '#9D7D3C' },
      air: { name: 'Champagne', hex: '#D8C9A8' },
      water: { name: 'Honey', hex: '#C9A055' },
    },
  },
  {
    name: 'Friday',
    planet: 'Venus',
    palette: {
      fire: { name: 'Dusty Rose', hex: '#C68B92' },
      earth: { name: 'Blush', hex: '#E8B4B8' },
      air: { name: 'Powder Blue', hex: '#B4C8D8' },
      water: { name: 'Lotus Pink', hex: '#E0A8B0' },
    },
  },
  {
    name: 'Saturday',
    planet: 'Saturn',
    palette: {
      fire: { name: 'Plum', hex: '#5A2840' },
      earth: { name: 'Charcoal', hex: '#3A3536' },
      air: { name: 'Slate', hex: '#5A5560' },
      water: { name: 'Midnight', hex: '#2A2A4A' },
    },
  },
] as const;

function todayLocal(): Date {
  return new Date();
}

function dayIndex(d: Date): number {
  return d.getDay(); // 0 = Sunday
}

function toLocalYMD(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function fromYMD(ymd: string): Date {
  const [y, m, d] = ymd.split('-').map(Number);
  return new Date(y!, (m ?? 1) - 1, d ?? 1);
}

function formatLong(d: Date): string {
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

export function AuspiciousColorFinder() {
  const [rashi, setRashi] = useState<(typeof RASHIS)[number]['key']>('mesh');
  const [dateStr, setDateStr] = useState<string>(toLocalYMD(todayLocal()));

  const date = useMemo(() => fromYMD(dateStr), [dateStr]);
  const element: Element =
    RASHIS.find((r) => r.key === rashi)?.element ?? 'fire';
  const day = DAYS[dayIndex(date)]!;
  const color = day.palette[element];

  const week = useMemo(() => {
    return DAYS.map((d) => ({
      day: d.name,
      planet: d.planet,
      color: d.palette[element],
    }));
  }, [element]);

  return (
    <MiniToolShell
      name="Auspicious Color Finder"
      tagline="what color should you wear today?"
      estimatedTime="10 sec"
    >
      <div className={primitives.field}>
        <label className={primitives.label} htmlFor="ac-rashi">
          Your Moon sign (Rashi)
        </label>
        <select
          id="ac-rashi"
          className={primitives.select}
          value={rashi}
          onChange={(e) =>
            setRashi(e.target.value as (typeof RASHIS)[number]['key'])
          }
        >
          {RASHIS.map((r) => (
            <option key={r.key} value={r.key}>
              {r.label}
            </option>
          ))}
        </select>
      </div>

      <div className={primitives.field}>
        <label className={primitives.label} htmlFor="ac-date">
          Date
        </label>
        <input
          id="ac-date"
          type="date"
          className={primitives.input}
          value={dateStr}
          onChange={(e) =>
            setDateStr(e.target.value || toLocalYMD(todayLocal()))
          }
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={`${rashi}-${dateStr}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.32 }}
          className={primitives.resultCard}
        >
          <span className={primitives.resultEyebrow}>{formatLong(date)}</span>

          <div className={styles.featureSwatch}>
            <div
              className={styles.featureColor}
              style={{ background: color.hex }}
            />
            <div className={styles.featureMeta}>
              <span className={styles.featureName}>{color.name}</span>
              <span className={styles.featureHex}>{color.hex}</span>
            </div>
          </div>

          <p className={primitives.resultBody}>
            {day.name} is ruled by {day.planet}.
            {day.planet === 'Sun' &&
              ' Wear it for visibility, charisma, and being noticed in family WhatsApp photos.'}
            {day.planet === 'Moon' &&
              ' Soft tones to calm the day. Good for ceremonies and emotional moments.'}
            {day.planet === 'Mars' &&
              ' Reds for energy and protection. Good for action — booking vendors, signing contracts.'}
            {day.planet === 'Mercury' &&
              " Greens for clarity and communication. Good for paperwork and family conversations."}
            {day.planet === 'Jupiter' &&
              ' Yellows and golds for prosperity and wisdom. The most auspicious wedding-planning day.'}
            {day.planet === 'Venus' &&
              ' Pinks and pastels for love and beauty. Naturally — Venus is your wedding ally.'}
            {day.planet === 'Saturn' &&
              " Darker tones for discipline. Good for budgeting and difficult decisions."}
          </p>

          <div className={styles.weekSection}>
            <span className={primitives.resultEyebrow}>your week</span>
            <ul className={styles.weekList}>
              {week.map((w, idx) => {
                const isActive = idx === dayIndex(date);
                return (
                  <li
                    key={w.day}
                    className={`${styles.weekItem} ${
                      isActive ? styles.weekItemActive : ''
                    }`}
                  >
                    <span
                      className={styles.weekDot}
                      style={{ background: w.color.hex }}
                    />
                    <span className={styles.weekDay}>{w.day}</span>
                    <span className={styles.weekColor}>{w.color.name}</span>
                  </li>
                );
              })}
            </ul>
          </div>

          <p className={primitives.note}>
            Traditional Vedic association between weekdays, ruling planets, and
            Rashi elements. Wear it, or just use it to pick your chai mug.
          </p>
        </motion.div>
      </AnimatePresence>
    </MiniToolShell>
  );
}
