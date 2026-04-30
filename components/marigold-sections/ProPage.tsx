import Link from 'next/link';
import { ChunkyButton } from '@/components/marigold-ui/ChunkyButton';
import { ScrollReveal } from '@/components/marigold-ui/ScrollReveal';
import styles from './ProPage.module.css';

export type ProPageBenefit = {
  title: string;
  body: string;
};

export type ProPageQuote = {
  quote: string;
  attribution: string;
};

export type ProPageProps = {
  audience: string;
  scrawl: string;
  heading: string;
  lede: string;
  benefits: ProPageBenefit[];
  included: string[];
  quote: ProPageQuote;
  ctaTitle: string;
  ctaSub: string;
  ctaLabel: string;
  ctaHref: string;
  ctaFinePrint?: string;
};

export function ProPage({
  audience,
  scrawl,
  heading,
  lede,
  benefits,
  included,
  quote,
  ctaTitle,
  ctaSub,
  ctaLabel,
  ctaHref,
  ctaFinePrint,
}: ProPageProps) {
  return (
    <section className={styles.shell}>
      <div className={styles.inner}>
        <ScrollReveal>
          <div className={styles.eyebrow}>
            <span aria-hidden="true" />
            for {audience}
          </div>
          <span className={styles.scrawl}>{scrawl}</span>
          <h1
            className={styles.heading}
            dangerouslySetInnerHTML={{ __html: heading }}
          />
          <p className={styles.lede}>{lede}</p>
        </ScrollReveal>

        <hr className={styles.divider} />

        <ScrollReveal>
          <h2
            className={styles.sectionTitle}
            dangerouslySetInnerHTML={{ __html: 'What you can <em>do</em>' }}
          />
          <div className={styles.benefits}>
            {benefits.map((benefit, i) => (
              <div key={benefit.title} className={styles.benefit}>
                <div className={styles.benefitIndex}>0{i + 1}</div>
                <h3 className={styles.benefitTitle}>{benefit.title}</h3>
                <p className={styles.benefitBody}>{benefit.body}</p>
              </div>
            ))}
          </div>
        </ScrollReveal>

        <hr className={styles.divider} />

        <ScrollReveal>
          <h2
            className={styles.sectionTitle}
            dangerouslySetInnerHTML={{ __html: "What's <em>included</em>" }}
          />
          <ul className={styles.included}>
            {included.map((item) => (
              <li key={item} className={styles.includedItem}>
                {item}
              </li>
            ))}
          </ul>
        </ScrollReveal>

        <hr className={styles.divider} />

        <ScrollReveal>
          <div className={styles.quoteBlock}>
            <p className={styles.quote}>{`"${quote.quote}"`}</p>
            <div className={styles.attribution}>{quote.attribution}</div>
          </div>
        </ScrollReveal>

        <ScrollReveal>
          <div className={styles.ctaWrap}>
            <h2
              className={styles.ctaTitle}
              dangerouslySetInnerHTML={{ __html: ctaTitle }}
            />
            <p className={styles.ctaSub}>{ctaSub}</p>
            <ChunkyButton variant="white" href={ctaHref}>
              {ctaLabel}
            </ChunkyButton>
            {ctaFinePrint && (
              <p className={styles.ctaFinePrint}>{ctaFinePrint}</p>
            )}
          </div>
        </ScrollReveal>

        <Link href="/" className={styles.backLink}>
          ← Back to The Marigold for couples
        </Link>
      </div>
    </section>
  );
}
