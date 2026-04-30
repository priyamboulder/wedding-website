import { SectionHeader } from '@/components/marigold-ui/SectionHeader';
import { ScrollReveal } from '@/components/marigold-ui/ScrollReveal';
import { PushPin } from '@/components/marigold-ui/PushPin';
import styles from './ZillaZone.module.css';

const bridezillaTraits = [
  'Curates moodboards at 2am',
  'Has opinions about napkin folds',
  '"Can we see it in dusty rose?"',
  'The brief is her love language',
];

const momzillaTraits = [
  'Forwards "inspiration" at 6am',
  "Knows everyone's dietary needs",
  '"Beta, what about the Sharmas?"',
  'Her checklist has sub-checklists',
];

export function ZillaZone() {
  return (
    <section id="zillas" className={styles.section}>
      <div className={styles.wrap}>
        <SectionHeader
          scrawl="the eternal showdown"
          heading="The <em>Zilla</em> Zone"
          sub="Every wedding has them. We built a platform that lets both species thrive — without anyone getting hurt (probably)."
          className="[&_span]:!text-hot-pink [&_h2]:!text-white [&_p]:!text-white/40"
        />
        <div className={styles.battle}>
          <ScrollReveal className={styles.card}>
            <PushPin color="pink" position="left" />
            <h3>The Bridezilla</h3>
            <p>
              She knows EXACTLY what she wants. The moodboard has 847 pins. The brief is 3 pages.
              The florist has been warned.
            </p>
            {bridezillaTraits.map((t) => (
              <div key={t} className={styles.trait}>
                {t}
              </div>
            ))}
          </ScrollReveal>

          <div className={styles.vs} aria-hidden="true">
            vs.
          </div>

          <ScrollReveal className={styles.card}>
            <PushPin color="gold" position="right" />
            <h3>The Momzilla</h3>
            <p>
              She's been planning this wedding since you were born. She has a guest list from 2003.
              The pandit is already booked.
            </p>
            {momzillaTraits.map((t) => (
              <div key={t} className={styles.trait}>
                {t}
              </div>
            ))}
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
