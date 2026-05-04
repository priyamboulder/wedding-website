import { TornDivider } from '@/components/marigold-ui/TornDivider';
import styles from './ToolsHero.module.css';

export function ToolsHero() {
  return (
    <>
      <section className={styles.hero}>
        <span aria-hidden="true" className={`${styles.scribble} ${styles['scribble-1']}`}>
          <svg width="78" height="78" viewBox="0 0 78 78">
            <circle
              cx="39"
              cy="39"
              r="30"
              fill="none"
              stroke="var(--pink)"
              strokeWidth="1.4"
              strokeDasharray="4 6"
            />
          </svg>
        </span>
        <span aria-hidden="true" className={`${styles.scribble} ${styles['scribble-2']}`}>
          <svg width="62" height="62" viewBox="0 0 62 62">
            <path
              d="M31 6l5 14h15l-12 9 4 16-12-10-12 10 4-16-12-9h15z"
              fill="none"
              stroke="var(--pink)"
              strokeWidth="1.2"
            />
          </svg>
        </span>
        <span aria-hidden="true" className={`${styles.scribble} ${styles['scribble-3']}`}>
          <svg width="68" height="68" viewBox="0 0 68 68">
            <path
              d="M34 8c20 0 25 22 14 32s-26 8-30-2-4-30 16-30z"
              fill="none"
              stroke="var(--pink)"
              strokeWidth="1.2"
            />
          </svg>
        </span>

        <div className={styles.inner}>
          <span className={styles.eyebrow}>free tools for the obsessively organized bride</span>
          <h1 className={styles.headline}>
            the math, the maps, <em>the moves.</em>
          </h1>
          <p className={styles.subhead}>
            Wedding planning is 40% spreadsheets, 30% Pinterest, 30% group chat chaos.{' '}
            <strong>We can&apos;t help with the group chat.</strong> The other 70% — yes.
          </p>

          <div className={styles.metaRow}>
            <span className={styles.metaPill}>No signup needed</span>
            <span className={styles.metaPill}>Built for Indian weddings</span>
            <span className={styles.metaPill}>Always free</span>
          </div>
        </div>
      </section>
      <TornDivider fromColor="var(--paper)" toColor="var(--cream)" />
    </>
  );
}
