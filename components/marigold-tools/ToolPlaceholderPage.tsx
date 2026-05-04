import Link from 'next/link';
import type { ToolCatalogRow } from '@/types/tools';
import { WaitlistForm } from './WaitlistForm';
import styles from './ToolPlaceholderPage.module.css';

type ToolPlaceholderPageProps = {
  tool: ToolCatalogRow;
  // Optional preview body when the underlying builder isn't wired up yet.
  body?: string;
  // If set, swap the stat grid out for these custom labels.
  stats?: { label: string }[];
  // Whether to show the waitlist capture (defaults true for coming_soon tools).
  showWaitlist?: boolean;
};

export function ToolPlaceholderPage({
  tool,
  body,
  stats,
  showWaitlist,
}: ToolPlaceholderPageProps) {
  const isComingSoon = tool.status === 'coming_soon';
  const captureWaitlist = showWaitlist ?? isComingSoon;

  const renderedStats = stats ?? tool.stats;

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <span className={styles.tag}>
          {isComingSoon ? 'Coming soon' : 'Tool preview'}
        </span>
        <span className={styles.scrawl}>The Marigold Tool</span>
        <h1 className={styles.title}>{tool.name}</h1>
        <p className={styles.tagline}>{tool.tagline}</p>
        {(body || tool.description) && (
          <p className={styles.body}>{body ?? tool.description}</p>
        )}

        {renderedStats && renderedStats.length > 0 && (
          <div className={styles.statRow}>
            {renderedStats.map((stat, idx) => (
              <span key={idx} className={styles.statBadge}>
                {stat.label}
              </span>
            ))}
          </div>
        )}

        {!isComingSoon && (
          <Link href="/tools" className={styles.cta}>
            ← Back to all tools
          </Link>
        )}

        {captureWaitlist && (
          <>
            <div className={styles.divider} aria-hidden="true" />
            <div className={styles.waitlistWrap}>
              <h2 className={styles.waitlistHeading}>
                Want first <em>dibs?</em>
              </h2>
              <p className={styles.waitlistSub}>
                Drop your email — we&apos;ll let you know the moment {tool.name} is live.
              </p>
              <WaitlistForm
                options={[{ slug: tool.slug, label: tool.name }]}
                defaultSlug={tool.slug}
                source={`tool_detail_${tool.slug}`}
              />
            </div>
          </>
        )}
      </div>
    </section>
  );
}
