'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useMemo, useState } from 'react';
import { MiniToolShell } from './MiniToolShell';
import primitives from './MiniToolPrimitives.module.css';
import styles from './IndiaShoppingConverter.module.css';

const INR_TO_USD = 83; // Approximate. Spec: confirm rate before purchase.

const ITEM_TYPES = [
  { key: 'lehenga', label: 'Bridal lehenga', alterPct: 0.15, dutyPct: 0.07 },
  { key: 'sherwani', label: "Groom's sherwani", alterPct: 0.10, dutyPct: 0.05 },
  { key: 'jewelry', label: 'Jewelry', alterPct: 0, dutyPct: 0.10 },
  { key: 'sarees', label: 'Sarees (bulk)', alterPct: 0.05, dutyPct: 0.05 },
  { key: 'accessories', label: 'Accessories', alterPct: 0, dutyPct: 0.05 },
  { key: 'other', label: 'Other', alterPct: 0.05, dutyPct: 0.05 },
] as const;

const SHIPPING = [
  { key: 'luggage', label: 'Carry in luggage', cost: 0 },
  { key: 'courier', label: 'Ship via courier', cost: 100 },
  { key: 'unknown', label: 'Not sure yet', cost: 50 },
] as const;

type ItemKey = (typeof ITEM_TYPES)[number]['key'];
type ShipKey = (typeof SHIPPING)[number]['key'];

const PERSONAL_EXEMPTION = 800; // USD — spec

function fmt(n: number): string {
  return n.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  });
}

function fmtINR(n: number): string {
  // Indian numbering — lakhs and crores
  return '₹' + n.toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

export function IndiaShoppingConverter() {
  const [inr, setInr] = useState<number>(250000);
  const [itemKey, setItemKey] = useState<ItemKey>('lehenga');
  const [shipKey, setShipKey] = useState<ShipKey>('luggage');

  const result = useMemo(() => {
    if (inr <= 0) return null;
    const item = ITEM_TYPES.find((i) => i.key === itemKey)!;
    const ship = SHIPPING.find((s) => s.key === shipKey)!;

    const baseUsd = inr / INR_TO_USD;
    const dutiable = ship.key === 'luggage'
      ? Math.max(0, baseUsd - PERSONAL_EXEMPTION)
      : baseUsd;
    const duty = dutiable * item.dutyPct;
    const alteration = baseUsd * item.alterPct;
    const insurance = ship.key === 'courier' ? baseUsd * 0.025 : 0;

    const total = baseUsd + duty + alteration + ship.cost + insurance;

    return {
      baseUsd,
      duty,
      alteration,
      shippingCost: ship.cost,
      insurance,
      total,
      isLuggage: ship.key === 'luggage',
      itemLabel: item.label,
    };
  }, [inr, itemKey, shipKey]);

  return (
    <MiniToolShell
      name="India Shopping Budget Converter"
      tagline="what will ₹2,50,000 cost in USD?"
      estimatedTime="30 sec"
    >
      <div className={primitives.field}>
        <label className={primitives.label} htmlFor="is-inr">
          Item price in INR
        </label>
        <div className={styles.inrWrap}>
          <span className={styles.inrPrefix}>₹</span>
          <input
            id="is-inr"
            type="number"
            className={styles.inrInput}
            value={inr || ''}
            min={0}
            step={1000}
            onChange={(e) => setInr(Number(e.target.value) || 0)}
          />
        </div>
        <p className={styles.inrPreview}>{fmtINR(inr)}</p>
      </div>

      <div className={styles.row}>
        <div className={primitives.field}>
          <label className={primitives.label} htmlFor="is-item">
            Item type
          </label>
          <select
            id="is-item"
            className={primitives.select}
            value={itemKey}
            onChange={(e) => setItemKey(e.target.value as ItemKey)}
          >
            {ITEM_TYPES.map((i) => (
              <option key={i.key} value={i.key}>
                {i.label}
              </option>
            ))}
          </select>
        </div>
        <div className={primitives.field}>
          <label className={primitives.label} htmlFor="is-ship">
            Shipping method
          </label>
          <select
            id="is-ship"
            className={primitives.select}
            value={shipKey}
            onChange={(e) => setShipKey(e.target.value as ShipKey)}
          >
            {SHIPPING.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
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
            <span className={primitives.resultEyebrow}>total landed cost</span>
            <div className={primitives.bigNumber}>{fmt(result.total)}</div>
            <p className={primitives.resultLabel}>
              {result.itemLabel} from India, fully delivered to your closet.
            </p>

            <div className={primitives.breakdown}>
              <div className={primitives.breakdownRow}>
                <span className={primitives.breakdownLabel}>Base conversion</span>
                <span className={primitives.breakdownValue}>
                  {fmt(result.baseUsd)}
                </span>
              </div>
              {result.duty > 0 && (
                <div className={primitives.breakdownRow}>
                  <span className={primitives.breakdownLabel}>
                    Customs duty
                    {result.isLuggage && ` (above ${fmt(PERSONAL_EXEMPTION)} exemption)`}
                  </span>
                  <span className={primitives.breakdownValue}>
                    {fmt(result.duty)}
                  </span>
                </div>
              )}
              {result.shippingCost > 0 && (
                <div className={primitives.breakdownRow}>
                  <span className={primitives.breakdownLabel}>Shipping</span>
                  <span className={primitives.breakdownValue}>
                    {fmt(result.shippingCost)}
                  </span>
                </div>
              )}
              {result.insurance > 0 && (
                <div className={primitives.breakdownRow}>
                  <span className={primitives.breakdownLabel}>
                    Insurance (~2.5%)
                  </span>
                  <span className={primitives.breakdownValue}>
                    {fmt(result.insurance)}
                  </span>
                </div>
              )}
              {result.alteration > 0 && (
                <div className={primitives.breakdownRow}>
                  <span className={primitives.breakdownLabel}>
                    US alteration buffer
                  </span>
                  <span className={primitives.breakdownValue}>
                    {fmt(result.alteration)}
                  </span>
                </div>
              )}
            </div>

            <p className={primitives.note}>
              Exchange rate used: ₹{INR_TO_USD} = $1. Always check the live
              rate the day you actually pay. Customs duty rules also change
              — verify with CBP for high-value items.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </MiniToolShell>
  );
}
