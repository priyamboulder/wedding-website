import { TornDivider } from '@/components/marigold-ui/TornDivider';
import styles from './DestinationsHero.module.css';

type DestinationsHeroProps = {
  eyebrow: string;
  scrawl?: string;
  headline: React.ReactNode;
  subhead?: React.ReactNode;
  pills?: string[];
  showDivider?: boolean;
};

export function DestinationsHero({
  eyebrow,
  scrawl,
  headline,
  subhead,
  pills,
  showDivider = true,
}: DestinationsHeroProps) {
  return (
    <>
      <section className={styles.hero}>
        <div className={styles.inner}>
          <span className={styles.eyebrow}>{eyebrow}</span>
          {scrawl && <span className={styles.scrawl}>{scrawl}</span>}
          <h1 className={styles.headline}>{headline}</h1>
          {subhead && <p className={styles.subhead}>{subhead}</p>}
          {pills && pills.length > 0 && (
            <div className={styles.pillRow}>
              {pills.map((pill) => (
                <span key={pill} className={styles.pill}>
                  {pill}
                </span>
              ))}
            </div>
          )}
        </div>
      </section>
      {showDivider && <TornDivider fromColor="var(--paper)" toColor="var(--cream)" />}
    </>
  );
}
