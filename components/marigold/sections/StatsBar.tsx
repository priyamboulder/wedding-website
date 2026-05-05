import styles from './StatsBar.module.css';

type Stat = {
  number: string;
  label: string;
};

const STATS: Stat[] = [
  { number: '582', label: 'tasks across 13 phases' },
  { number: '12', label: 'dedicated vendor workspaces' },
  { number: '10', label: 'curated moodboard styles' },
  { number: '3', label: 'free planning calculators' },
  { number: '1', label: 'login for your mom' },
];

export function StatsBar() {
  return (
    <section className={styles.section} aria-label="Marigold by the numbers">
      <div className={styles.inner}>
        {STATS.map((stat, i) => (
          <div key={stat.label} className={styles.item}>
            <div className={styles.number}>{stat.number}</div>
            <div className={styles.label}>{stat.label}</div>
            {i < STATS.length - 1 && (
              <span className={styles.divider} aria-hidden="true" />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
