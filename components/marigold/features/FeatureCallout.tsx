import { ScrollReveal } from '@/components/marigold/ui/ScrollReveal';
import styles from './FeatureCallout.module.css';

type Cell = {
  label: string;
  title: string;
  body: string;
};

type FeatureCalloutProps = {
  scrawl?: string;
  heading: string;
  cells: Cell[];
};

export function FeatureCallout({ scrawl, heading, cells }: FeatureCalloutProps) {
  return (
    <section className="px-6 md:px-10" style={{ paddingTop: 60, paddingBottom: 60 }}>
      <ScrollReveal className={styles.callout}>
        {scrawl && <span className={styles.eyebrow}>{scrawl}</span>}
        <h2
          className={styles.heading}
          dangerouslySetInnerHTML={{ __html: heading }}
        />
        <div className={styles.grid}>
          {cells.map((c, i) => (
            <div key={i} className={styles.cell}>
              <span className={styles.cellLabel}>{c.label}</span>
              <div className={styles.cellTitle}>{c.title}</div>
              <p className={styles.cellBody}>{c.body}</p>
            </div>
          ))}
        </div>
      </ScrollReveal>
    </section>
  );
}
