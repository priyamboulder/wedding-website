'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useMemo, useState } from 'react';
import { MiniToolShell } from './MiniToolShell';
import primitives from './MiniToolPrimitives.module.css';
import styles from './ParkingShuttle.module.css';

const HOTEL_DISTANCE = [
  { key: 'walk', label: 'Walking distance' },
  { key: 'short', label: 'Short drive (< 10 min)' },
  { key: 'medium', label: '10–20 min drive' },
  { key: 'far', label: '20+ min drive' },
] as const;

function fmt(n: number): string {
  return n.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  });
}

export function ParkingShuttle() {
  const [guests, setGuests] = useState<number>(250);
  const [parking, setParking] = useState<number>(150);
  const [perCar, setPerCar] = useState<number>(2.5);
  const [overflow, setOverflow] = useState<boolean>(false);
  const [distance, setDistance] =
    useState<(typeof HOTEL_DISTANCE)[number]['key']>('medium');

  const result = useMemo(() => {
    if (guests <= 0 || parking < 0 || perCar <= 0) return null;
    const carsNeeded = Math.ceil(guests / perCar);
    const shortfall = Math.max(0, carsNeeded - parking);
    const peopleStranded = shortfall * perCar;

    let recommendation: string;
    let needShuttle: boolean;
    let trips = 0;

    if (distance === 'walk') {
      recommendation =
        'Hotel is walkable. Skip the shuttle and tell guests to walk — it makes the morning feel less hectic.';
      needShuttle = false;
    } else if (shortfall === 0 && !overflow) {
      recommendation = "You're fine — venue parking covers it.";
      needShuttle = false;
    } else if (shortfall === 0 && overflow) {
      recommendation =
        'Venue parking covers it, but with overflow nearby you have flexibility for late arrivals or families with multiple cars.';
      needShuttle = false;
    } else if (overflow) {
      recommendation = `Use overflow parking. With ${shortfall} cars over capacity, the spillover is manageable. A shuttle is optional but nice for elderly guests.`;
      needShuttle = false;
    } else {
      trips = Math.ceil(peopleStranded / 30);
      recommendation = `You need a shuttle. Plan for about ${trips} round-trip${trips === 1 ? '' : 's'} with a 30-passenger bus across the arrival window.`;
      needShuttle = true;
    }

    const shuttleLow = needShuttle ? 500 + (trips - 1) * 200 : 0;
    const shuttleHigh = needShuttle ? 1200 + (trips - 1) * 400 : 0;

    return {
      carsNeeded,
      shortfall,
      peopleStranded: Math.ceil(peopleStranded),
      recommendation,
      needShuttle,
      trips,
      shuttleLow,
      shuttleHigh,
    };
  }, [guests, parking, perCar, overflow, distance]);

  return (
    <MiniToolShell
      name="Parking & Shuttle Calculator"
      tagline="do you need a shuttle?"
      estimatedTime="30 sec"
    >
      <div className={styles.row}>
        <div className={primitives.field}>
          <label className={primitives.label} htmlFor="ps-guests">
            Guest count
          </label>
          <input
            id="ps-guests"
            type="number"
            className={primitives.input}
            value={guests || ''}
            min={0}
            onChange={(e) => setGuests(Number(e.target.value) || 0)}
          />
        </div>
        <div className={primitives.field}>
          <label className={primitives.label} htmlFor="ps-parking">
            Venue parking spots
          </label>
          <input
            id="ps-parking"
            type="number"
            className={primitives.input}
            value={parking}
            min={0}
            onChange={(e) => setParking(Number(e.target.value) || 0)}
          />
        </div>
      </div>

      <div className={styles.row}>
        <div className={primitives.field}>
          <label className={primitives.label} htmlFor="ps-percar">
            Avg guests per car
          </label>
          <input
            id="ps-percar"
            type="number"
            className={primitives.input}
            value={perCar || ''}
            min={1}
            max={6}
            step={0.5}
            onChange={(e) => setPerCar(Number(e.target.value) || 1)}
          />
        </div>
        <div className={primitives.field}>
          <label className={primitives.label} htmlFor="ps-distance">
            Hotel ↔ venue
          </label>
          <select
            id="ps-distance"
            className={primitives.select}
            value={distance}
            onChange={(e) =>
              setDistance(
                e.target.value as (typeof HOTEL_DISTANCE)[number]['key'],
              )
            }
          >
            {HOTEL_DISTANCE.map((d) => (
              <option key={d.key} value={d.key}>
                {d.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <label
        className={`${primitives.checkboxLabel} ${
          overflow ? primitives.checkboxLabelChecked : ''
        }`}
        style={{ marginBottom: 22 }}
      >
        <input
          type="checkbox"
          className={primitives.checkbox}
          checked={overflow}
          onChange={(e) => setOverflow(e.target.checked)}
        />
        Nearby overflow parking is available
      </label>

      <AnimatePresence mode="wait">
        {result && (
          <motion.div
            key={result.recommendation}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.32 }}
            className={primitives.resultCard}
          >
            <span className={primitives.resultEyebrow}>
              {result.needShuttle ? 'shuttle needed' : 'parking outlook'}
            </span>
            <p className={styles.verdict}>{result.recommendation}</p>

            <div className={primitives.breakdown}>
              <div className={primitives.breakdownRow}>
                <span className={primitives.breakdownLabel}>Cars needed</span>
                <span className={primitives.breakdownValue}>
                  {result.carsNeeded}
                </span>
              </div>
              <div className={primitives.breakdownRow}>
                <span className={primitives.breakdownLabel}>
                  Parking shortfall
                </span>
                <span className={primitives.breakdownValue}>
                  {result.shortfall === 0 ? 'none' : result.shortfall + ' cars'}
                </span>
              </div>
              {result.needShuttle && (
                <div className={primitives.breakdownRow}>
                  <span className={primitives.breakdownLabel}>
                    Estimated shuttle cost (DFW)
                  </span>
                  <span className={primitives.breakdownValue}>
                    {fmt(result.shuttleLow)} – {fmt(result.shuttleHigh)}
                  </span>
                </div>
              )}
            </div>

            <p className={primitives.note}>
              30-passenger bus rates assume a 4-hour block. Each additional
              hour adds $150–$250.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </MiniToolShell>
  );
}
