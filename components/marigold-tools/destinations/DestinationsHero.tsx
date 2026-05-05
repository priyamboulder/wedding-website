import { TornDivider } from '@/components/marigold-ui/TornDivider';
import styles from './DestinationsHero.module.css';

type DestinationsHeroProps = {
  eyebrow: string;
  scrawl?: string;
  headline: React.ReactNode;
  subhead?: React.ReactNode;
  pills?: string[];
  showDivider?: boolean;
  /** Tightens vertical padding — used on the hub page where a filter bar
      sits between the hero and the grid. */
  compact?: boolean;
  /** Rendered inside the hero, below the headline/subhead — e.g. the
      filter bar on the hub page. When provided, the standalone pill row
      is suppressed in favor of whatever the slot supplies. */
  slot?: React.ReactNode;
};

export function DestinationsHero({
  eyebrow,
  scrawl,
  headline,
  subhead,
  pills,
  showDivider = true,
  compact = false,
  slot,
}: DestinationsHeroProps) {
  return (
    <>
      <section className={[styles.hero, compact ? styles.heroCompact : ''].filter(Boolean).join(' ')}>
        <div className={styles.inner}>
          <span className={styles.eyebrow}>{eyebrow}</span>
          {scrawl && <span className={styles.scrawl}>{scrawl}</span>}
          <h1 className={styles.headline}>{headline}</h1>
          {subhead && <p className={styles.subhead}>{subhead}</p>}
          {!slot && pills && pills.length > 0 && (
            <div className={styles.pillRow}>
              {pills.map((pill) => (
                <span key={pill} className={styles.pill}>
                  {pill}
                </span>
              ))}
            </div>
          )}
          {slot}
        </div>
      </section>
      {showDivider && <TornDivider fromColor="var(--paper)" toColor="var(--cream)" />}
    </>
  );
}
