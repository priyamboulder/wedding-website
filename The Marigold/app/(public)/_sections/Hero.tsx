import { ChunkyButton } from '@/components/ui/ChunkyButton';
import styles from './Hero.module.css';

export function Hero() {
  return (
    <section className={`${styles.hero} -mt-[100px]`}>
      <svg className={`${styles.doodle} ${styles.doodle1}`} width="80" height="80" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r="30" fill="none" stroke="white" strokeWidth="1.5" strokeDasharray="4 6" />
      </svg>
      <svg className={`${styles.doodle} ${styles.doodle2}`} width="60" height="60" viewBox="0 0 60 60">
        <path d="M30 5l5 15h15l-12 9 5 16-13-10-13 10 5-16-12-9h15z" fill="none" stroke="white" strokeWidth="1.2" />
      </svg>
      <svg className={`${styles.doodle} ${styles.doodle3}`} width="70" height="70" viewBox="0 0 70 70">
        <path d="M35 10c20 0 25 20 15 30s-25 10-30 0-5-30 15-30z" fill="none" stroke="white" strokeWidth="1.2" />
      </svg>
      <svg className={`${styles.doodle} ${styles.doodle4}`} width="50" height="50" viewBox="0 0 50 50">
        <rect x="10" y="10" width="30" height="30" rx="4" fill="none" stroke="white" strokeWidth="1" strokeDasharray="3 5" transform="rotate(15 25 25)" />
      </svg>

      <div className={styles.pretitle}>psst... your wedding planning era starts here</div>
      <h1 className={styles.title}>
        The <i>Marigold</i>
      </h1>
      <div className={styles.tag}>where beautiful chaos blooms</div>
      <p className={styles.sub}>
        The only wedding platform that <strong>actually gets it.</strong> 582 tasks across 13 planning phases.
        Vendor moodboards. AI-powered briefs. A shagun pool tracker. And yes — a special login for your mom.
      </p>
      <div className={styles.buttons}>
        <ChunkyButton variant="white" href="/pricing">
          Start Your Journey
        </ChunkyButton>
        <ChunkyButton variant="outline" href="#features">
          Show Me Everything
        </ChunkyButton>
      </div>
      <p className={styles.note}>
        * side effects include texting your florist at 2am and building a Gantt chart for your sangeet
      </p>
    </section>
  );
}
