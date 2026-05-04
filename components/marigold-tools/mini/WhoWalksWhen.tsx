'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useMemo, useState } from 'react';
import { MiniToolShell } from './MiniToolShell';
import primitives from './MiniToolPrimitives.module.css';
import styles from './WhoWalksWhen.module.css';

type Ceremony = 'hindu' | 'sikh' | 'muslim' | 'christian' | 'fusion';

const CEREMONIES: { key: Ceremony; label: string; note: string }[] = [
  {
    key: 'hindu',
    label: 'Hindu',
    note: "There's no traditional 'walk down the aisle.' The bride is escorted to the mandap. The groom is already seated or arrives via baraat. The processional is less formal than in Western weddings.",
  },
  {
    key: 'sikh',
    label: 'Sikh — Anand Karaj',
    note: 'In Sikh tradition, the bride is escorted to the Guru Granth Sahib by her father or brothers. The groom enters first and sits facing the Guru. There is no formal processional of attendants.',
  },
  {
    key: 'muslim',
    label: 'Muslim — Nikah',
    note: 'The Nikah is generally a seated, contractual event. There is no Western-style processional. Parents and witnesses sit close to the couple during signing.',
  },
  {
    key: 'christian',
    label: 'Christian / Western',
    note: 'The classic processional with music. Order matters and is well-defined.',
  },
  {
    key: 'fusion',
    label: 'Interfaith / Fusion',
    note: 'Adapt freely. Common pattern: Western-style processional for attendants, then bride enters with both parents (or just mom for South Asian families), then a brief Indian-style mandap entrance.',
  },
];

type Step = {
  order: number;
  who: string;
  detail?: string;
};

function buildOrder(
  ceremony: Ceremony,
  parentsTogether: boolean,
  hasGrandparents: boolean,
  hasFlowerGirl: boolean,
  hasRingBearer: boolean,
  partySize: number,
): { entry: Step[]; exit: Step[] } {
  if (ceremony === 'hindu') {
    return {
      entry: [
        { order: 1, who: "Groom's family arrives & is seated", detail: "Groom's side of the mandap." },
        { order: 2, who: 'Baraat arrives at the venue', detail: 'Music, dancing, the works.' },
        { order: 3, who: 'Milni / greeting', detail: 'Two families exchange garlands and gifts.' },
        { order: 4, who: 'Groom is escorted to the mandap', detail: 'By his sisters or maternal uncle.' },
        ...(hasGrandparents
          ? [{ order: 5, who: "Grandparents are seated", detail: 'Often given pride of place near the mandap.' }]
          : []),
        ...(hasFlowerGirl
          ? [{ order: 6, who: 'Flower girl scatters petals', detail: 'Optional, modern addition.' }]
          : []),
        {
          order: hasFlowerGirl ? 7 : hasGrandparents ? 6 : 5,
          who: parentsTogether
            ? "Bride's parents escort her to the mandap"
            : "Bride's mother (or maternal uncle) escorts her",
          detail: parentsTogether
            ? 'Both parents walk together — modern adaptation.'
            : 'Maternal uncle (mama) traditionally escorts the bride.',
        },
      ],
      exit: [
        { order: 1, who: 'Couple exits mandap together', detail: 'After saptapadi and final blessing.' },
        { order: 2, who: 'Vidaai (bride leaves)', detail: 'Bride is escorted out by her family — emotional moment.' },
        { order: 3, who: 'Couple departs as one', detail: 'Together to receive guests at reception.' },
      ],
    };
  }

  if (ceremony === 'sikh') {
    return {
      entry: [
        { order: 1, who: 'Sangat (congregation) is seated', detail: 'Everyone sits on the floor; shoes off, heads covered.' },
        { order: 2, who: 'Groom enters the Darbar Sahib', detail: 'Sits before the Guru Granth Sahib facing the granthi.' },
        { order: 3, who: "Bride is escorted in by her brothers / father", detail: 'She joins the groom in front of the Guru.' },
        { order: 4, who: 'Kirtan begins', detail: "Followed by Ardas and the four Lavan." },
      ],
      exit: [
        { order: 1, who: 'Final Ardas + Hukamnama', detail: 'The Guru\'s reading concludes the ceremony.' },
        { order: 2, who: 'Karah Prashad distribution', detail: 'Sweet pudding offered to all guests.' },
        { order: 3, who: 'Couple receives blessings from elders', detail: 'Family members come up one at a time.' },
      ],
    };
  }

  if (ceremony === 'muslim') {
    return {
      entry: [
        { order: 1, who: 'Imam takes position', detail: 'Center of the room or under a small canopy.' },
        { order: 2, who: 'Witnesses (two adult Muslim men) seated', detail: 'Required for the Nikah Nama signing.' },
        { order: 3, who: "Bride and groom seated separately or together", detail: 'Varies by family — many modern Nikahs seat them together.' },
        { order: 4, who: 'Khutbah (sermon) begins', detail: 'Followed by Ijab-e-Qubool (consent), then signing.' },
      ],
      exit: [
        { order: 1, who: 'Mahr presented to the bride', detail: 'Often the moment families and friends celebrate.' },
        { order: 2, who: 'Dua (prayer) concludes', detail: 'Family and guests offer congratulations.' },
        { order: 3, who: 'Walima reception follows', detail: "Hosted by the groom's family, traditionally." },
      ],
    };
  }

  if (ceremony === 'christian') {
    const entry: Step[] = [
      { order: 1, who: 'Officiant takes position', detail: 'At the altar.' },
      { order: 2, who: "Groom and best man enter", detail: 'From the side, take their place at the altar.' },
      ...(hasGrandparents
        ? [{ order: 3, who: 'Grandparents are seated', detail: 'Brought down the aisle to reserved seats.' }]
        : []),
      {
        order: hasGrandparents ? 4 : 3,
        who: 'Parents are seated',
        detail: parentsTogether
          ? "Groom's parents first, then bride's mother (escorted by her son or usher)."
          : "Groom's parents first, then bride's parents separately or together.",
      },
      {
        order: hasGrandparents ? 5 : 4,
        who: 'Bridesmaids enter',
        detail: `${partySize} on each side, paired with groomsmen or solo. Walk in order from least senior (last to walk = MOH).`,
      },
      ...(hasRingBearer
        ? [{ order: hasGrandparents ? 6 : 5, who: 'Ring bearer enters', detail: 'Usually a young child carrying the rings on a pillow.' }]
        : []),
      ...(hasFlowerGirl
        ? [{ order: hasGrandparents ? (hasRingBearer ? 7 : 6) : (hasRingBearer ? 6 : 5), who: 'Flower girl enters', detail: 'Scatters petals down the aisle.' }]
        : []),
      {
        order: 99,
        who: parentsTogether
          ? 'Bride enters escorted by both parents'
          : 'Bride enters escorted by her father',
        detail: 'Music swells. Everyone stands.',
      },
    ];
    return {
      entry,
      exit: [
        { order: 1, who: 'Couple exits together', detail: 'First to walk out — joyfully.' },
        { order: 2, who: 'Wedding party exits in pairs', detail: 'Reverse order: MOH and best man first, then down the line.' },
        { order: 3, who: 'Parents and grandparents exit', detail: 'Then guests row by row.' },
      ],
    };
  }

  // fusion
  return {
    entry: [
      { order: 1, who: "Groom's family seated", detail: 'Groom may already be at the mandap or enter via baraat.' },
      { order: 2, who: "Officiants take position", detail: 'Pandit and/or interfaith officiant.' },
      ...(hasGrandparents
        ? [{ order: 3, who: 'Grandparents seated', detail: 'Brought to reserved seats.' }]
        : []),
      {
        order: hasGrandparents ? 4 : 3,
        who: 'Wedding party enters',
        detail: `${partySize} per side. Walk in formal order.`,
      },
      ...(hasFlowerGirl
        ? [{ order: 5, who: 'Flower girl enters', detail: 'Petals down the aisle.' }]
        : []),
      {
        order: 99,
        who: parentsTogether
          ? "Bride enters escorted by both parents"
          : "Bride enters with her father (or maternal uncle)",
        detail: 'Hybrid moment — combines Western processional with mandap arrival.',
      },
    ],
    exit: [
      { order: 1, who: 'Couple exits together', detail: 'Hand in hand.' },
      { order: 2, who: 'Wedding party exits', detail: 'In pairs, MOH and best man first.' },
      { order: 3, who: 'Family follows', detail: 'Then guests.' },
    ],
  };
}

export function WhoWalksWhen() {
  const [ceremony, setCeremony] = useState<Ceremony>('hindu');
  const [parentsTogether, setParentsTogether] = useState(true);
  const [hasGrandparents, setHasGrandparents] = useState(true);
  const [hasFlowerGirl, setHasFlowerGirl] = useState(false);
  const [hasRingBearer, setHasRingBearer] = useState(false);
  const [partySize, setPartySize] = useState<number>(4);

  const { entry, exit } = useMemo(
    () =>
      buildOrder(
        ceremony,
        parentsTogether,
        hasGrandparents,
        hasFlowerGirl,
        hasRingBearer,
        partySize,
      ),
    [ceremony, parentsTogether, hasGrandparents, hasFlowerGirl, hasRingBearer, partySize],
  );

  const ceremonyMeta = CEREMONIES.find((c) => c.key === ceremony)!;

  return (
    <MiniToolShell
      name="Who Walks When?"
      tagline="ceremony processional order"
      estimatedTime="30 sec"
    >
      <div className={primitives.field}>
        <label className={primitives.label} htmlFor="ww-ceremony">
          Ceremony type
        </label>
        <select
          id="ww-ceremony"
          className={primitives.select}
          value={ceremony}
          onChange={(e) => setCeremony(e.target.value as Ceremony)}
        >
          {CEREMONIES.map((c) => (
            <option key={c.key} value={c.key}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.row}>
        <div className={primitives.field}>
          <label className={primitives.label} htmlFor="ww-party">
            Wedding party (per side)
          </label>
          <input
            id="ww-party"
            type="number"
            className={primitives.input}
            value={partySize}
            min={0}
            max={12}
            onChange={(e) => setPartySize(Number(e.target.value) || 0)}
          />
        </div>
      </div>

      <div className={styles.toggleGrid}>
        <label
          className={`${primitives.checkboxLabel} ${
            parentsTogether ? primitives.checkboxLabelChecked : ''
          }`}
        >
          <input
            type="checkbox"
            className={primitives.checkbox}
            checked={parentsTogether}
            onChange={(e) => setParentsTogether(e.target.checked)}
          />
          Both parents walk bride together
        </label>
        <label
          className={`${primitives.checkboxLabel} ${
            hasGrandparents ? primitives.checkboxLabelChecked : ''
          }`}
        >
          <input
            type="checkbox"
            className={primitives.checkbox}
            checked={hasGrandparents}
            onChange={(e) => setHasGrandparents(e.target.checked)}
          />
          Grandparents present
        </label>
        <label
          className={`${primitives.checkboxLabel} ${
            hasFlowerGirl ? primitives.checkboxLabelChecked : ''
          }`}
        >
          <input
            type="checkbox"
            className={primitives.checkbox}
            checked={hasFlowerGirl}
            onChange={(e) => setHasFlowerGirl(e.target.checked)}
          />
          Flower girl
        </label>
        <label
          className={`${primitives.checkboxLabel} ${
            hasRingBearer ? primitives.checkboxLabelChecked : ''
          }`}
        >
          <input
            type="checkbox"
            className={primitives.checkbox}
            checked={hasRingBearer}
            onChange={(e) => setHasRingBearer(e.target.checked)}
          />
          Ring bearer
        </label>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={ceremony}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.32 }}
          className={primitives.resultCard}
        >
          <span className={primitives.resultEyebrow}>{ceremonyMeta.label} processional</span>
          <p className={styles.note}>{ceremonyMeta.note}</p>

          <h3 className={styles.section}>Entry order</h3>
          <ol className={styles.list}>
            {entry.map((s, idx) => (
              <li key={idx} className={styles.item}>
                <span className={styles.idx}>{String(idx + 1).padStart(2, '0')}</span>
                <div className={styles.body}>
                  <span className={styles.who}>{s.who}</span>
                  {s.detail && <span className={styles.detail}>{s.detail}</span>}
                </div>
              </li>
            ))}
          </ol>

          <h3 className={styles.section}>Recessional / exit</h3>
          <ol className={styles.list}>
            {exit.map((s, idx) => (
              <li key={idx} className={styles.item}>
                <span className={styles.idx}>{String(idx + 1).padStart(2, '0')}</span>
                <div className={styles.body}>
                  <span className={styles.who}>{s.who}</span>
                  {s.detail && <span className={styles.detail}>{s.detail}</span>}
                </div>
              </li>
            ))}
          </ol>
        </motion.div>
      </AnimatePresence>
    </MiniToolShell>
  );
}
