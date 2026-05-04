'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useMemo, useState } from 'react';
import { MiniToolShell } from './MiniToolShell';
import primitives from './MiniToolPrimitives.module.css';
import styles from './PhotoShotList.module.css';

const EVENTS = [
  'Mehndi',
  'Haldi',
  'Sangeet',
  'Ceremony',
  'Baraat',
  'Reception',
] as const;

type EventName = (typeof EVENTS)[number];

type FamilyConfig = {
  bothSets: boolean;
  hasSiblings: boolean;
  hasGrandparents: boolean;
  hasDivorcedParents: boolean;
  hasInLaws: boolean;
};

type Shot = { name: string; group: string };

function buildShots(events: Set<EventName>, family: FamilyConfig): Shot[] {
  const shots: Shot[] = [];

  // Detail shots — every wedding
  shots.push(
    { name: 'Bridal lehenga / sari hung up', group: 'Details' },
    { name: 'Jewelry layout — necklace, earrings, bangles, maang tikka', group: 'Details' },
    { name: 'Wedding rings + mangalsutra', group: 'Details' },
    { name: 'Invitation suite (full set, flat-lay)', group: 'Details' },
    { name: 'Shoes (bride + groom)', group: 'Details' },
    { name: 'Florals — close-ups of decor', group: 'Details' },
    { name: 'Place settings + menu cards', group: 'Details' },
  );

  if (events.has('Mehndi')) {
    shots.push(
      { name: 'Mehndi being applied — hands close-up', group: 'Mehndi' },
      { name: 'Final mehndi design (palms + back of hands)', group: 'Mehndi' },
      { name: "Bride's feet mehndi", group: 'Mehndi' },
      { name: 'Friends/cousins getting their mehndi done', group: 'Mehndi' },
      { name: "Groom's name hidden in the design", group: 'Mehndi' },
    );
  }

  if (events.has('Haldi')) {
    shots.push(
      { name: 'Haldi paste being prepared', group: 'Haldi' },
      { name: 'Mother applying haldi to bride', group: 'Haldi' },
      { name: 'Haldi being applied by family members', group: 'Haldi' },
      { name: "Bride/groom laughing through it", group: 'Haldi' },
      { name: 'Group photo at the end (everyone yellow)', group: 'Haldi' },
    );
  }

  if (events.has('Sangeet')) {
    shots.push(
      { name: 'Performance group rehearsal moment', group: 'Sangeet' },
      { name: "Bride's family performance — wide", group: 'Sangeet' },
      { name: "Groom's family performance — wide", group: 'Sangeet' },
      { name: 'Couple performance / first dance', group: 'Sangeet' },
      { name: 'Audience reactions — laughing/cheering', group: 'Sangeet' },
      { name: 'Late-night dance floor — chaos shots', group: 'Sangeet' },
    );
  }

  if (events.has('Baraat')) {
    shots.push(
      { name: 'Groom on horse / car / elephant', group: 'Baraat' },
      { name: "Groom's family dancing — wide", group: 'Baraat' },
      { name: 'Dhol player close-up', group: 'Baraat' },
      { name: 'Milni — formal greeting between families', group: 'Baraat' },
      { name: "Bride's family welcoming the baraat", group: 'Baraat' },
    );
  }

  if (events.has('Ceremony')) {
    shots.push(
      { name: 'Bride entering — wide + close-up', group: 'Ceremony' },
      { name: 'Groom seeing the bride — reaction', group: 'Ceremony' },
      { name: 'Mandap full setup — wide', group: 'Ceremony' },
      { name: 'Hands during pheras / saath phere', group: 'Ceremony' },
      { name: 'Mangalsutra moment', group: 'Ceremony' },
      { name: 'Sindoor moment', group: 'Ceremony' },
      { name: 'Kanyadaan — parents giving away', group: 'Ceremony' },
      { name: 'Saptapadi — seven steps detail', group: 'Ceremony' },
      { name: 'Vidaai — emotional family moments', group: 'Ceremony' },
      { name: 'Couple just-married portrait', group: 'Ceremony' },
    );
  }

  if (events.has('Reception')) {
    shots.push(
      { name: 'Couple grand entrance', group: 'Reception' },
      { name: 'First dance', group: 'Reception' },
      { name: 'Speeches — speaker + couple reactions', group: 'Reception' },
      { name: 'Cake cutting', group: 'Reception' },
      { name: 'Couple portraits at golden hour', group: 'Reception' },
      { name: 'Open dance floor — wide', group: 'Reception' },
      { name: 'Send-off / sparklers / car exit', group: 'Reception' },
    );
  }

  // Family portraits — only meaningful if at least one event is selected
  if (events.size > 0) {
    shots.push({ name: 'Couple with both sets of parents', group: 'Family Portraits' });

    if (family.bothSets) {
      shots.push(
        { name: "Bride with her parents", group: 'Family Portraits' },
        { name: "Groom with his parents", group: 'Family Portraits' },
        { name: 'Both immediate families together', group: 'Family Portraits' },
      );
    }

    if (family.hasGrandparents) {
      shots.push(
        { name: 'Couple with all four grandparents', group: 'Family Portraits' },
        { name: "Bride with her grandparents", group: 'Family Portraits' },
        { name: "Groom with his grandparents", group: 'Family Portraits' },
      );
    }

    if (family.hasSiblings) {
      shots.push(
        { name: "Bride with her siblings", group: 'Family Portraits' },
        { name: "Groom with his siblings", group: 'Family Portraits' },
        { name: 'Couple with all siblings together', group: 'Family Portraits' },
      );
    }

    if (family.hasInLaws) {
      shots.push({ name: 'Bride with new in-laws', group: 'Family Portraits' });
    }

    if (family.hasDivorcedParents) {
      shots.push(
        { name: 'Couple with bride\'s mother (separately)', group: 'Family Portraits' },
        { name: 'Couple with bride\'s father (separately)', group: 'Family Portraits' },
        { name: '⚠ Note: Coordinate divorced-parent photos in advance with planner', group: 'Family Portraits' },
      );
    }

    shots.push(
      { name: 'Extended family — wide group shot', group: 'Family Portraits' },
      { name: "Bride's side — full extended", group: 'Family Portraits' },
      { name: "Groom's side — full extended", group: 'Family Portraits' },
      { name: 'Bridal party — formal + candid', group: 'Family Portraits' },
    );
  }

  return shots;
}

export function PhotoShotList() {
  const [events, setEvents] = useState<Set<EventName>>(
    new Set(['Mehndi', 'Sangeet', 'Ceremony', 'Reception']),
  );
  const [family, setFamily] = useState<FamilyConfig>({
    bothSets: true,
    hasSiblings: true,
    hasGrandparents: false,
    hasDivorcedParents: false,
    hasInLaws: true,
  });

  function toggleEvent(e: EventName) {
    const next = new Set(events);
    if (next.has(e)) next.delete(e);
    else next.add(e);
    setEvents(next);
  }

  function toggleFamily(key: keyof FamilyConfig) {
    setFamily((f) => ({ ...f, [key]: !f[key] }));
  }

  const shots = useMemo(() => buildShots(events, family), [events, family]);

  const grouped = useMemo(() => {
    const map = new Map<string, Shot[]>();
    for (const s of shots) {
      if (!map.has(s.group)) map.set(s.group, []);
      map.get(s.group)!.push(s);
    }
    return Array.from(map.entries());
  }, [shots]);

  return (
    <MiniToolShell
      name="Photo Shot List Builder"
      tagline="don't forget these shots"
      estimatedTime="2 min"
    >
      <div className={primitives.field}>
        <label className={primitives.label}>Your events</label>
        <div className={primitives.checkboxGrid}>
          {EVENTS.map((e) => {
            const isOn = events.has(e);
            return (
              <label
                key={e}
                className={`${primitives.checkboxLabel} ${
                  isOn ? primitives.checkboxLabelChecked : ''
                }`}
              >
                <input
                  type="checkbox"
                  className={primitives.checkbox}
                  checked={isOn}
                  onChange={() => toggleEvent(e)}
                />
                {e}
              </label>
            );
          })}
        </div>
      </div>

      <div className={primitives.field}>
        <label className={primitives.label}>Family structure</label>
        <div className={primitives.checkboxGrid}>
          {(
            [
              ['bothSets', 'Both sets of parents alive'],
              ['hasSiblings', 'Siblings on either side'],
              ['hasGrandparents', 'Grandparents attending'],
              ['hasInLaws', 'New in-law family portraits'],
              ['hasDivorcedParents', 'Divorced parents (need separate)'],
            ] as const
          ).map(([key, label]) => {
            const isOn = family[key];
            return (
              <label
                key={key}
                className={`${primitives.checkboxLabel} ${
                  isOn ? primitives.checkboxLabelChecked : ''
                }`}
              >
                <input
                  type="checkbox"
                  className={primitives.checkbox}
                  checked={isOn}
                  onChange={() => toggleFamily(key)}
                />
                {label}
              </label>
            );
          })}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={`${[...events].sort().join('-')}-${Object.values(family).join('')}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.28 }}
          className={primitives.resultCard}
        >
          <span className={primitives.resultEyebrow}>
            {shots.length} shots — share with your photographer
          </span>

          {grouped.map(([group, list]) => (
            <div key={group} className={styles.section}>
              <h3 className={styles.sectionTitle}>{group}</h3>
              <ul className={styles.list}>
                {list.map((s) => (
                  <li key={`${group}-${s.name}`} className={styles.item}>
                    <input type="checkbox" className={primitives.checkbox} />
                    <span className={styles.shotName}>{s.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <p className={primitives.note}>
            Send this list to your photographer at least two weeks before — and
            assign a family wrangler on the day to corral people for portraits.
          </p>
        </motion.div>
      </AnimatePresence>
    </MiniToolShell>
  );
}
