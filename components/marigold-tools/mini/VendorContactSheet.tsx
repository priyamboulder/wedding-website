'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useMemo, useState } from 'react';
import { MiniToolShell } from './MiniToolShell';
import primitives from './MiniToolPrimitives.module.css';
import styles from './VendorContactSheet.module.css';

type Vendor = {
  id: string;
  role: string;
  name: string;
  phone: string;
  notes: string;
};

const STARTER_ROLES = [
  'Planner',
  'Venue coordinator',
  'Photographer',
  'Videographer',
  'Caterer',
  'Florist',
  'DJ / Music',
  'Decor',
  'Hair & Makeup',
  'Mehndi artist',
  'Pandit / Officiant',
  'Transport',
];

let nextId = 0;
function rid(): string {
  nextId += 1;
  return `v-${Date.now()}-${nextId}`;
}

function emptyVendor(role = ''): Vendor {
  return { id: rid(), role, name: '', phone: '', notes: '' };
}

function starterVendors(): Vendor[] {
  return ['Planner', 'Photographer', 'Caterer', 'DJ / Music'].map((r) =>
    emptyVendor(r),
  );
}

export function VendorContactSheet() {
  const [vendors, setVendors] = useState<Vendor[]>(() => starterVendors());
  const [coupleNames, setCoupleNames] = useState('');
  const [weddingDate, setWeddingDate] = useState('');
  const [copied, setCopied] = useState(false);

  function update(id: string, patch: Partial<Vendor>) {
    setVendors((vs) => vs.map((v) => (v.id === id ? { ...v, ...patch } : v)));
  }

  function add(role = '') {
    setVendors((vs) => [...vs, emptyVendor(role)]);
  }

  function remove(id: string) {
    setVendors((vs) => vs.filter((v) => v.id !== id));
  }

  const filled = useMemo(
    () => vendors.filter((v) => v.role.trim() || v.name.trim() || v.phone.trim()),
    [vendors],
  );

  const sheetText = useMemo(() => {
    const lines: string[] = [];
    if (coupleNames.trim()) lines.push(coupleNames.trim().toUpperCase());
    if (weddingDate) lines.push(`Wedding day — ${weddingDate}`);
    if (lines.length > 0) lines.push('');
    lines.push('VENDOR CONTACTS');
    lines.push('—'.repeat(40));
    for (const v of filled) {
      const role = v.role.trim() || 'Vendor';
      const name = v.name.trim() || '—';
      const phone = v.phone.trim() || '—';
      lines.push(`${role}: ${name}`);
      lines.push(`  ${phone}`);
      if (v.notes.trim()) lines.push(`  ${v.notes.trim()}`);
      lines.push('');
    }
    return lines.join('\n');
  }, [filled, coupleNames, weddingDate]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(sheetText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // clipboard blocked
    }
  }

  function printSheet() {
    if (typeof window !== 'undefined') window.print();
  }

  return (
    <MiniToolShell
      name="Vendor Contact Sheet Generator"
      tagline="one page with every vendor's phone number"
      estimatedTime="2 min"
    >
      <div className={styles.row}>
        <div className={primitives.field}>
          <label className={primitives.label} htmlFor="vc-couple">
            Couple names
          </label>
          <input
            id="vc-couple"
            type="text"
            className={primitives.input}
            value={coupleNames}
            onChange={(e) => setCoupleNames(e.target.value)}
            placeholder="Priya & Arjun"
          />
        </div>
        <div className={primitives.field}>
          <label className={primitives.label} htmlFor="vc-date">
            Wedding date
          </label>
          <input
            id="vc-date"
            type="date"
            className={primitives.input}
            value={weddingDate}
            onChange={(e) => setWeddingDate(e.target.value)}
          />
        </div>
      </div>

      <div className={primitives.field}>
        <label className={primitives.label}>Vendors</label>
        <div className={styles.vendorList}>
          {vendors.map((v) => (
            <div key={v.id} className={styles.vendorCard}>
              <div className={styles.vendorRow}>
                <input
                  className={styles.smallInput}
                  type="text"
                  value={v.role}
                  onChange={(e) => update(v.id, { role: e.target.value })}
                  placeholder="Role (e.g. Photographer)"
                  list="vc-roles"
                />
                <button
                  type="button"
                  onClick={() => remove(v.id)}
                  className={styles.removeBtn}
                  aria-label="Remove vendor"
                >
                  ✕
                </button>
              </div>
              <div className={styles.vendorRow}>
                <input
                  className={styles.smallInput}
                  type="text"
                  value={v.name}
                  onChange={(e) => update(v.id, { name: e.target.value })}
                  placeholder="Name / Company"
                />
              </div>
              <div className={styles.vendorRow}>
                <input
                  className={styles.smallInput}
                  type="tel"
                  value={v.phone}
                  onChange={(e) => update(v.id, { phone: e.target.value })}
                  placeholder="Phone number"
                />
              </div>
              <div className={styles.vendorRow}>
                <input
                  className={styles.smallInput}
                  type="text"
                  value={v.notes}
                  onChange={(e) => update(v.id, { notes: e.target.value })}
                  placeholder="Notes — arrival time, point of contact"
                />
              </div>
            </div>
          ))}
        </div>

        <datalist id="vc-roles">
          {STARTER_ROLES.map((r) => (
            <option key={r} value={r} />
          ))}
        </datalist>

        <div className={styles.addRow}>
          <button
            type="button"
            className={styles.addBtn}
            onClick={() => add('')}
          >
            + add vendor
          </button>
          <button
            type="button"
            className={styles.addBtn}
            onClick={() => {
              const used = new Set(vendors.map((v) => v.role.trim()));
              const next = STARTER_ROLES.find((r) => !used.has(r));
              if (next) add(next);
            }}
          >
            + add typical role
          </button>
        </div>
      </div>

      <AnimatePresence>
        {filled.length > 0 && (
          <motion.div
            key="sheet"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28 }}
            className={primitives.resultCard}
          >
            <span className={primitives.resultEyebrow}>
              {filled.length} vendors — print or share
            </span>

            <div className={styles.sheet} id="vendor-sheet">
              {coupleNames.trim() && (
                <h2 className={styles.sheetTitle}>{coupleNames.trim()}</h2>
              )}
              {weddingDate && (
                <p className={styles.sheetDate}>Wedding day — {weddingDate}</p>
              )}
              <h3 className={styles.sheetSection}>Vendor contacts</h3>
              <ul className={styles.sheetList}>
                {filled.map((v) => (
                  <li key={v.id} className={styles.sheetItem}>
                    <span className={styles.sheetRole}>
                      {v.role.trim() || 'Vendor'}
                    </span>
                    <span className={styles.sheetName}>
                      {v.name.trim() || '—'}
                    </span>
                    <span className={styles.sheetPhone}>
                      <a
                        href={`tel:${v.phone.replace(/[^+\d]/g, '')}`}
                        className={styles.phoneLink}
                      >
                        {v.phone.trim() || '—'}
                      </a>
                    </span>
                    {v.notes.trim() && (
                      <span className={styles.sheetNotes}>{v.notes.trim()}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            <div className={styles.actions}>
              <button type="button" className={primitives.button} onClick={copy}>
                {copied ? 'Copied!' : 'Copy as text'}
              </button>
              <button
                type="button"
                className={primitives.buttonSecondary}
                onClick={printSheet}
              >
                Print sheet
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </MiniToolShell>
  );
}
