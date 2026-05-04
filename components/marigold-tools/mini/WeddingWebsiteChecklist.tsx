'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useMemo, useState } from 'react';
import { MiniToolShell } from './MiniToolShell';
import primitives from './MiniToolPrimitives.module.css';
import styles from './WeddingWebsiteChecklist.module.css';

const EVENTS = [
  'Mehndi',
  'Sangeet',
  'Haldi',
  'Ceremony',
  'Reception',
  'Welcome Dinner',
  'Farewell Brunch',
] as const;

type EventName = (typeof EVENTS)[number];

type Section = {
  title: string;
  why: string;
  priority: 'essential' | 'nice';
};

function buildSections(
  selected: Set<EventName>,
  destination: boolean,
  hotel: boolean,
  registry: boolean,
): Section[] {
  const sections: Section[] = [
    {
      title: "Couple's story",
      why: "How you met, the proposal — set the tone for everything that follows.",
      priority: 'essential',
    },
    {
      title: 'Event schedule (with times and addresses)',
      why: 'The single most-clicked page on every wedding site.',
      priority: 'essential',
    },
    {
      title: 'Venue details + map',
      why: 'Embed Google Maps. Mention parking up front.',
      priority: 'essential',
    },
    {
      title: 'RSVP form',
      why: 'Per-event RSVP with meal preferences and dietary needs.',
      priority: 'essential',
    },
    {
      title: 'Contact info for questions',
      why: 'A bridesmaid or planner email — not your personal one.',
      priority: 'essential',
    },
  ];

  if (selected.has('Mehndi')) {
    sections.push({
      title: 'Mehndi night details',
      why: "What to wear (white/yellow not required but appreciated), what's mehndi if guests are unfamiliar.",
      priority: 'essential',
    });
  }
  if (selected.has('Sangeet')) {
    sections.push({
      title: 'Sangeet details (DRESS CODE!)',
      why: 'This is the dance event. Tell people. Bonus: link a song playlist.',
      priority: 'essential',
    });
  }
  if (selected.has('Haldi')) {
    sections.push({
      title: 'Haldi details + warning',
      why: 'Tell guests turmeric stains. Linen is forgiving; silk is not.',
      priority: 'nice',
    });
  }
  if (selected.has('Ceremony')) {
    sections.push({
      title: 'Ceremony explainer for non-Indian guests',
      why: 'A short walkthrough of what they\'ll see — pheras, mangalsutra, sindoor — makes a huge difference.',
      priority: 'essential',
    });
  }
  if (selected.has('Reception')) {
    sections.push({
      title: 'Reception details + dress code',
      why: 'Western formal? Indo-fusion? Black-tie? Spell it out.',
      priority: 'essential',
    });
  }

  if (destination) {
    sections.push({
      title: 'Travel & accommodation',
      why: 'Flight tips, airport options, ground transport. Be concrete.',
      priority: 'essential',
    });
    sections.push({
      title: 'Local restaurant & activity recommendations',
      why: "Guests will arrive early. Tell them what's worth doing.",
      priority: 'nice',
    });
  } else {
    sections.push({
      title: 'Out-of-town guest info',
      why: 'Hotel, airport, things to do. Even local weddings need this for distant family.',
      priority: 'nice',
    });
  }

  if (hotel) {
    sections.push({
      title: 'Hotel block details + booking link',
      why: 'Direct booking link, group code, deadline to use the rate.',
      priority: 'essential',
    });
  }

  if (registry) {
    sections.push({
      title: 'Registry / Shagun info',
      why: "Some couples link physical registries; others note 'your presence is the present' or include shagun guidance for South Asian guests.",
      priority: 'essential',
    });
  }

  sections.push({
    title: 'FAQ for out-of-town guests',
    why: 'Weather, dress code per event, photography vs. unplugged, bar policy.',
    priority: 'essential',
  });
  sections.push({
    title: 'Dress code by event',
    why: 'Indian weddings have specific colors and formality per event. Make this its own section.',
    priority: 'essential',
  });
  sections.push({
    title: 'Photo gallery',
    why: 'Engagement shoot, first looks, mehndi previews. Builds excitement.',
    priority: 'nice',
  });
  sections.push({
    title: 'Wedding party bios',
    why: 'Helps guests know who is who at the events.',
    priority: 'nice',
  });
  sections.push({
    title: 'Hashtag display',
    why: "Show it big so guests use it on Instagram. (Don't just write it once.)",
    priority: 'nice',
  });
  sections.push({
    title: 'Playlist request form',
    why: "Crowd-source a few songs. The DJ doesn't have to play them all.",
    priority: 'nice',
  });

  return sections;
}

export function WeddingWebsiteChecklist() {
  const [selected, setSelected] = useState<Set<EventName>>(
    new Set(['Sangeet', 'Ceremony', 'Reception']),
  );
  const [destination, setDestination] = useState(false);
  const [hotel, setHotel] = useState(true);
  const [registry, setRegistry] = useState(false);

  function toggle(e: EventName) {
    const next = new Set(selected);
    if (next.has(e)) next.delete(e);
    else next.add(e);
    setSelected(next);
  }

  const sections = useMemo(
    () => buildSections(selected, destination, hotel, registry),
    [selected, destination, hotel, registry],
  );

  const essential = sections.filter((s) => s.priority === 'essential');
  const nice = sections.filter((s) => s.priority === 'nice');

  return (
    <MiniToolShell
      name="Wedding Website Checklist"
      tagline="everything your wedding website needs"
      estimatedTime="1 min"
    >
      <div className={primitives.field}>
        <label className={primitives.label}>Your events</label>
        <div className={primitives.checkboxGrid}>
          {EVENTS.map((e) => {
            const isOn = selected.has(e);
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
                  onChange={() => toggle(e)}
                />
                {e}
              </label>
            );
          })}
        </div>
      </div>

      <div className={styles.toggleRow}>
        <label
          className={`${primitives.checkboxLabel} ${
            destination ? primitives.checkboxLabelChecked : ''
          }`}
        >
          <input
            type="checkbox"
            className={primitives.checkbox}
            checked={destination}
            onChange={(e) => setDestination(e.target.checked)}
          />
          Destination wedding
        </label>
        <label
          className={`${primitives.checkboxLabel} ${
            hotel ? primitives.checkboxLabelChecked : ''
          }`}
        >
          <input
            type="checkbox"
            className={primitives.checkbox}
            checked={hotel}
            onChange={(e) => setHotel(e.target.checked)}
          />
          Hotel block
        </label>
        <label
          className={`${primitives.checkboxLabel} ${
            registry ? primitives.checkboxLabelChecked : ''
          }`}
        >
          <input
            type="checkbox"
            className={primitives.checkbox}
            checked={registry}
            onChange={(e) => setRegistry(e.target.checked)}
          />
          Registry / shagun page
        </label>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={`${selected.size}-${destination}-${hotel}-${registry}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.28 }}
          className={primitives.resultCard}
        >
          <span className={primitives.resultEyebrow}>
            essential — {essential.length} sections
          </span>
          <ul className={styles.list}>
            {essential.map((s) => (
              <li key={s.title} className={styles.item}>
                <span className={styles.itemTitle}>{s.title}</span>
                <span className={styles.itemWhy}>{s.why}</span>
              </li>
            ))}
          </ul>

          <div className={styles.divider} />

          <span className={primitives.resultEyebrow}>
            nice to have — {nice.length} sections
          </span>
          <ul className={styles.list}>
            {nice.map((s) => (
              <li key={s.title} className={styles.itemSecondary}>
                <span className={styles.itemTitle}>{s.title}</span>
                <span className={styles.itemWhy}>{s.why}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      </AnimatePresence>
    </MiniToolShell>
  );
}
