import Link from 'next/link';
import { listToolsCatalog } from '@/lib/tools';
import { createAnonClient } from '@/lib/supabase/server-client';
import type { ToolCatalogRow } from '@/types/tools';
import styles from './ToolsTeaser.module.css';

const ICONS: Record<string, string> = {
  budget: '💸',
  destinations: '🗺️',
  match: '✨',
};

const ORDERED_SLUGS = ['budget', 'destinations', 'match'];

export async function ToolsTeaser() {
  // The teaser is decorative on the homepage — if anything goes wrong
  // (missing env vars, table doesn't exist, network error) we render
  // nothing rather than blocking the homepage. The /tools hub is the
  // canonical surface for this content.
  let tools: ToolCatalogRow[] = [];
  try {
    const supabase = createAnonClient();
    tools = await listToolsCatalog(supabase);
  } catch {
    return null;
  }

  const featured = ORDERED_SLUGS
    .map((slug) => tools.find((t) => t.slug === slug))
    .filter((t): t is ToolCatalogRow => Boolean(t));
  if (featured.length === 0) return null;

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.header}>
          <span className={styles.scrawl}>free + no signup</span>
          <h2 className={styles.heading}>
            tools that do the <em>dreaming</em> for you.
          </h2>
          <p className={styles.sub}>
            Three little calculators that crunch the numbers a 200-guest Indian
            wedding actually generates. Use them before you talk to a single vendor.
          </p>
        </div>

        <div className={styles.grid}>
          {featured.map((tool) => {
            const isSoon = tool.status === 'coming_soon';
            return (
              <Link key={tool.id} href={tool.cta_route} className={styles.card}>
                <span className={styles.cardEyebrow}>
                  Tool
                  <span
                    className={[
                      styles.cardStatus,
                      isSoon ? styles.cardStatusSoon : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    {isSoon ? 'Soon' : 'Live'}
                  </span>
                </span>
                <div className={styles.cardIcon} aria-hidden="true">
                  {ICONS[tool.slug] ?? '🛠️'}
                </div>
                <h3 className={styles.cardTitle}>{tool.name}</h3>
                <p className={styles.cardTagline}>{tool.tagline}</p>
                <span className={styles.cardCta}>
                  {isSoon ? 'Notify me' : 'Try it free'} →
                </span>
              </Link>
            );
          })}
        </div>

        <div className={styles.footerRow}>
          <Link href="/tools" className={styles.footerLink}>
            See all the tools →
          </Link>
        </div>
      </div>
    </section>
  );
}
