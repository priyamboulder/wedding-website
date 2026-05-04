'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useMemo, useState } from 'react';
import { MiniToolShell } from './MiniToolShell';
import primitives from './MiniToolPrimitives.module.css';
import styles from './BaraatDurationEstimator.module.css';

const DISTANCES = [
  { key: 'outside', label: 'Right outside the venue', travel: 5 },
  { key: 'parking', label: 'Across the parking lot (200–500 ft)', travel: 10 },
  { key: 'street', label: 'Down the street (~0.25 mi)', travel: 18 },
  { key: 'full', label: 'Full procession (0.5+ mi)', travel: 32 },
] as const;

const TRANSPORTS = [
  { key: 'foot', label: 'On foot', extra: 0 },
  { key: 'car', label: 'Vintage car', extra: 5 },
  { key: 'horse', label: 'Horse', extra: 10 },
  { key: 'elephant', label: 'Elephant', extra: 15 },
  { key: 'other', label: 'Other', extra: 5 },
] as const;

export function BaraatDurationEstimator() {
  const [distanceKey, setDistanceKey] =
    useState<(typeof DISTANCES)[number]['key']>('parking');
  const [dancers, setDancers] = useState<number>(40);
  const [transportKey, setTransportKey] =
    useState<(typeof TRANSPORTS)[number]['key']>('horse');
  const [dhol, setDhol] = useState<boolean>(true);

  const result = useMemo(() => {
    const distance = DISTANCES.find((d) => d.key === distanceKey)!;
    const transport = TRANSPORTS.find((t) => t.key === transportKey)!;
    const danceMod = Math.floor(dancers / 10);
    const dholMod = dhol ? 10 : 0;
    const milni = 18; // Arrival ceremony
    const total =
      distance.travel + danceMod + transport.extra + dholMod + milni;

    return {
      total,
      buffer: Math.ceil(total * 0.25 / 5) * 5, // round to nearest 5 min
      parts: {
        travel: distance.travel,
        dance: danceMod,
        dhol: dholMod,
        transport: transport.extra,
        milni,
      },
      transportLabel: transport.label,
    };
  }, [distanceKey, dancers, transportKey, dhol]);

  return (
    <MiniToolShell
      name="Baraat Duration Estimator"
      tagline="how long is the baraat, really?"
      estimatedTime="30 sec"
    >
      <div className={primitives.field}>
        <label className={primitives.label} htmlFor="bd-distance">
          Distance to venue entrance
        </label>
        <select
          id="bd-distance"
          className={primitives.select}
          value={distanceKey}
          onChange={(e) =>
            setDistanceKey(
              e.target.value as (typeof DISTANCES)[number]['key'],
            )
          }
        >
          {DISTANCES.map((d) => (
            <option key={d.key} value={d.key}>
              {d.label}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.row}>
        <div className={primitives.field}>
          <label className={primitives.label} htmlFor="bd-dancers">
            Estimated dancers
          </label>
          <input
            id="bd-dancers"
            type="number"
            className={primitives.input}
            value={dancers || ''}
            min={0}
            onChange={(e) => setDancers(Number(e.target.value) || 0)}
          />
        </div>
        <div className={primitives.field}>
          <label className={primitives.label} htmlFor="bd-transport">
            Groom transport
          </label>
          <select
            id="bd-transport"
            className={primitives.select}
            value={transportKey}
            onChange={(e) =>
              setTransportKey(
                e.target.value as (typeof TRANSPORTS)[number]['key'],
              )
            }
          >
            {TRANSPORTS.map((t) => (
              <option key={t.key} value={t.key}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <label
        className={`${primitives.checkboxLabel} ${
          dhol ? primitives.checkboxLabelChecked : ''
        }`}
        style={{ marginBottom: 22 }}
      >
        <input
          type="checkbox"
          className={primitives.checkbox}
          checked={dhol}
          onChange={(e) => setDhol(e.target.checked)}
        />
        Live dhol player
      </label>

      <AnimatePresence mode="wait">
        <motion.div
          key={result.total}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.32 }}
          className={primitives.resultCard}
        >
          <span className={primitives.resultEyebrow}>baraat duration</span>
          <div className={primitives.bigNumber}>
            {result.total} <span className={styles.unit}>min</span>
          </div>
          <p className={primitives.resultLabel}>
            Add {result.buffer} more minutes of buffer for venue coordination
            and the inevitable extra song.
          </p>

          <div className={primitives.breakdown}>
            <div className={primitives.breakdownRow}>
              <span className={primitives.breakdownLabel}>Travel</span>
              <span className={primitives.breakdownValue}>
                {result.parts.travel} min
              </span>
            </div>
            <div className={primitives.breakdownRow}>
              <span className={primitives.breakdownLabel}>
                Dancing & stops ({dancers} dancers)
              </span>
              <span className={primitives.breakdownValue}>
                +{result.parts.dance} min
              </span>
            </div>
            {dhol && (
              <div className={primitives.breakdownRow}>
                <span className={primitives.breakdownLabel}>Dhol energy</span>
                <span className={primitives.breakdownValue}>
                  +{result.parts.dhol} min
                </span>
              </div>
            )}
            {result.parts.transport > 0 && (
              <div className={primitives.breakdownRow}>
                <span className={primitives.breakdownLabel}>
                  {result.transportLabel} logistics
                </span>
                <span className={primitives.breakdownValue}>
                  +{result.parts.transport} min
                </span>
              </div>
            )}
            <div className={primitives.breakdownRow}>
              <span className={primitives.breakdownLabel}>
                Milni (arrival ceremony)
              </span>
              <span className={primitives.breakdownValue}>
                +{result.parts.milni} min
              </span>
            </div>
          </div>

          <p className={primitives.note}>
            Tell your venue to expect the baraat 15–20 minutes earlier than the
            ceremony start. Someone&apos;s uncle will always insist on one more song.
          </p>
        </motion.div>
      </AnimatePresence>
    </MiniToolShell>
  );
}
