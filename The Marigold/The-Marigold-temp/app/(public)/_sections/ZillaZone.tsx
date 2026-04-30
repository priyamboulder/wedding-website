import { PushPin } from '@/components/ui/PushPin';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { SectionHeader } from '@/components/ui/SectionHeader';
import styles from './ZillaZone.module.css';

export function ZillaZone() {
  return (
    <section className={`${styles.section} zilla-bg`} id="zillas">
      <div className={styles.wrap}>
        <div className="text-center mb-16">
          <span className="font-scrawl text-hot-pink block" style={{ fontSize: '22px', fontWeight: 600 }}>
            the eternal showdown
          </span>
          <h2
            className="font-serif text-white scrapbook-heading"
            style={{ fontSize: 'clamp(36px, 5.5vw, 56px)', lineHeight: 1.05 }}
          >
            The <em>Zilla</em> Zone
          </h2>
          <p
            className="font-body mx-auto mt-2.5"
            style={{
              fontSize: '15px',
              color: 'rgba(255,255,255,0.4)',
              maxWidth: '480px',
              lineHeight: 1.6,
            }}
          >
            Every wedding has them. We built a platform that lets both species thrive — without anyone getting hurt
            (probably).
          </p>
        </div>
        <div className={styles.battle}>
          <ScrollReveal className={styles.card}>
            <PushPin color="pink" position="left" />
            <h3>The Bridezilla</h3>
            <p>
              She knows EXACTLY what she wants. The moodboard has 847 pins. The brief is 3 pages. The florist has been
              warned.
            </p>
            <div className={styles.trait}>Curates moodboards at 2am</div>
            <div className={styles.trait}>Has opinions about napkin folds</div>
            <div className={styles.trait}>"Can we see it in dusty rose?"</div>
            <div className={styles.trait}>The brief is her love language</div>
          </ScrollReveal>
          <div className={styles.vs}>vs.</div>
          <ScrollReveal className={styles.card}>
            <PushPin color="gold" position="right" />
            <h3>The Momzilla</h3>
            <p>
              She's been planning this wedding since you were born. She has a guest list from 2003. The pandit is
              already booked.
            </p>
            <div className={styles.trait}>Forwards "inspiration" at 6am</div>
            <div className={styles.trait}>Knows everyone's dietary needs</div>
            <div className={styles.trait}>"Beta, what about the Sharmas?"</div>
            <div className={styles.trait}>Her checklist has sub-checklists</div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
