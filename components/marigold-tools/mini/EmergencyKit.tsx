'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useMemo, useState } from 'react';
import { MiniToolShell } from './MiniToolShell';
import primitives from './MiniToolPrimitives.module.css';
import styles from './EmergencyKit.module.css';

const CEREMONIES = [
  { id: 'mehndi', label: 'Mehndi' },
  { id: 'haldi', label: 'Haldi' },
  { id: 'sangeet', label: 'Sangeet' },
  { id: 'ceremony', label: 'Hindu/Sikh Ceremony' },
  { id: 'reception', label: 'Reception' },
  { id: 'baraat', label: 'Baraat' },
] as const;

type CeremonyId = (typeof CEREMONIES)[number]['id'];

type Item = { name: string; why?: string };

const CORE: Item[] = [
  { name: 'Safety pins (small + large, 20+)', why: 'Lehenga emergencies happen.' },
  { name: 'Sewing kit + matching threads', why: 'For dropped hems or popped seams.' },
  { name: 'Double-sided fashion tape', why: 'Necklines, dupattas, blouse gaps.' },
  { name: 'Tide stain pen', why: 'Chai. Haldi. Lipstick. Anything.' },
  { name: 'Deodorant + travel perfume' },
  { name: 'Tissues + cotton handkerchief' },
  { name: 'Mints + breath spray', why: 'Before every kiss, hug, and photo.' },
  { name: 'Small water bottle with straw', why: 'Sip without ruining lipstick.' },
  { name: 'Granola bars / energy snacks (4+)', why: 'You forget to eat. The bridal party will too.' },
  { name: 'Bandaids (multiple sizes)' },
  { name: 'Pain reliever + antacid' },
  { name: 'Phone charger + portable battery' },
  { name: 'Cash ($200+, mix of bills)', why: 'Tips, last-minute vendors, shagun envelopes.' },
  { name: 'Lip balm + tinted gloss for touch-ups' },
  { name: 'Pressed powder + setting spray' },
  { name: 'Bobby pins + extra hair elastics' },
  { name: 'Hairspray (travel size)' },
  { name: 'Q-tips + makeup remover wipes', why: 'For mascara fixes.' },
  { name: 'Spare earring backs' },
  { name: 'Comfortable flats / juttis', why: 'For after the ceremony, you will need them.' },
];

const PER_CEREMONY: Record<CeremonyId, Item[]> = {
  mehndi: [
    { name: 'Plastic wrap (for mehndi protection while sleeping)', why: 'Keeps the design dark.' },
    { name: 'Eucalyptus oil or sugar-lemon mix', why: 'Darkens mehndi color.' },
    { name: 'Disposable gloves', why: 'For when you need to use the bathroom mid-mehndi.' },
    { name: 'Long straws — multiple', why: 'Eat and drink without smudging.' },
  ],
  haldi: [
    { name: 'Old white sheets (haldi cover-ups)', why: 'Turmeric stains everything else.' },
    { name: 'Coconut oil (pre-application)', why: 'Apply before haldi — easier wash-off.' },
    { name: 'Besan (gram flour) + milk + lemon paste', why: 'Removes haldi from skin post-event.' },
    { name: 'Cheap clothes you do not love', why: 'Whatever you wear will be ruined.' },
    { name: 'Towels for washing off after' },
  ],
  sangeet: [
    { name: 'Spare sequins / bindis (for outfit + dance prop fixes)' },
    { name: 'Comfortable dance shoes / juttis', why: "Heels don't survive bhangra." },
    { name: 'Foot blister prevention (Body Glide / moleskin)' },
    { name: 'Ibuprofen for performers', why: 'Choreography hangover is real.' },
    { name: 'Performance set list printed (and on someone\'s phone)' },
  ],
  ceremony: [
    { name: 'Sindoor + extra mangalsutra clasp', why: 'Just in case.' },
    { name: 'Backup dupatta pins', why: 'Heavy embroidery weighs dupattas down.' },
    { name: 'Smelling salts / mint oil', why: 'Long ceremonies + heavy outfits = lightheadedness.' },
    { name: 'Honey or glucose tablets', why: 'For low-blood-sugar moments during the pheras.' },
    { name: 'Prayer items (mala, photo of family deity, etc)' },
    { name: 'Comfortable juttis (NOT heels)' },
    { name: 'Eye drops', why: 'Smoke from the havan irritates eyes.' },
  ],
  reception: [
    { name: 'Outfit-change essentials (steamer cloth, second pair of shapewear)' },
    { name: 'Refresh kit — face mist, blotting papers, mini deodorant' },
    { name: 'Touch-up lipstick (in matching shade)' },
    { name: 'Small hand mirror' },
    { name: 'A small bag for cards / shagun envelopes', why: 'You will be handed many.' },
  ],
  baraat: [
    { name: 'Sunscreen (SPF 50)', why: "If it's outdoors and daytime." },
    { name: 'Hand fans for elders' },
    { name: 'Cooling towel / facial mist', why: 'Outdoor + dancing + heavy outfit.' },
    { name: 'Sehra securing pins' },
    { name: 'Safe storage for the groom\'s phone & wallet', why: 'During the chaos.' },
  ],
};

export function EmergencyKit() {
  const [selected, setSelected] = useState<Set<CeremonyId>>(
    new Set(['mehndi', 'sangeet', 'ceremony', 'reception']),
  );

  const items = useMemo(() => {
    const list: { name: string; why?: string; bucket: 'core' | CeremonyId }[] = CORE.map(
      (i) => ({ ...i, bucket: 'core' as const }),
    );
    for (const c of CEREMONIES) {
      if (selected.has(c.id)) {
        for (const i of PER_CEREMONY[c.id]) {
          list.push({ ...i, bucket: c.id });
        }
      }
    }
    return list;
  }, [selected]);

  function toggle(id: CeremonyId) {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  }

  return (
    <MiniToolShell
      name="Emergency Kit Checklist"
      tagline="what goes in the bridal emergency kit?"
      estimatedTime="1 min"
    >
      <div className={primitives.field}>
        <label className={primitives.label}>Your ceremonies</label>
        <div className={primitives.checkboxGrid}>
          {CEREMONIES.map((c) => {
            const isOn = selected.has(c.id);
            return (
              <label
                key={c.id}
                className={`${primitives.checkboxLabel} ${
                  isOn ? primitives.checkboxLabelChecked : ''
                }`}
              >
                <input
                  type="checkbox"
                  className={primitives.checkbox}
                  checked={isOn}
                  onChange={() => toggle(c.id)}
                />
                {c.label}
              </label>
            );
          })}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={[...selected].sort().join('-')}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.28 }}
          className={primitives.resultCard}
        >
          <span className={primitives.resultEyebrow}>
            {items.length} items — pack the night before
          </span>

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>The core kit</h3>
            <ul className={styles.list}>
              {CORE.map((i) => (
                <li key={i.name} className={styles.item}>
                  <input type="checkbox" className={primitives.checkbox} />
                  <span>
                    <span className={styles.itemName}>{i.name}</span>
                    {i.why && <span className={styles.why}>{i.why}</span>}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {CEREMONIES.filter((c) => selected.has(c.id)).map((c) => (
            <div key={c.id} className={styles.section}>
              <h3 className={styles.sectionTitle}>{c.label} additions</h3>
              <ul className={styles.list}>
                {PER_CEREMONY[c.id].map((i) => (
                  <li key={i.name} className={styles.item}>
                    <input type="checkbox" className={primitives.checkbox} />
                    <span>
                      <span className={styles.itemName}>{i.name}</span>
                      {i.why && <span className={styles.why}>{i.why}</span>}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <p className={primitives.note}>
            Hand the kit to the bridesmaid or planner before the day starts —
            do not be the one carrying it.
          </p>
        </motion.div>
      </AnimatePresence>
    </MiniToolShell>
  );
}
