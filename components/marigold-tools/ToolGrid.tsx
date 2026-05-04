import Link from 'next/link';
import type { ToolCatalogRow } from '@/types/tools';
import styles from './ToolGrid.module.css';

const FALLBACK_ICON: Record<string, string> = {
  budget: '💸',
  destinations: '🗺️',
  match: '✨',
  visualizer: '📅',
  ready: '✓',
  'guest-list-estimator': '👥',
};

type ToolGridProps = {
  tools: ToolCatalogRow[];
};

export function ToolGrid({ tools }: ToolGridProps) {
  return (
    <section className={styles.section}>
      <div className={styles.grid}>
        {tools.map((tool) => (
          <ToolCard key={tool.id} tool={tool} />
        ))}
      </div>
    </section>
  );
}

function ToolCard({ tool }: { tool: ToolCatalogRow }) {
  const isComingSoon = tool.status === 'coming_soon';
  const cardClass = [
    styles.card,
    tool.status === 'live' ? styles.cardLive : '',
    isComingSoon ? styles.cardSoon : '',
  ]
    .filter(Boolean)
    .join(' ');

  const icon =
    tool.icon_or_image && !tool.icon_or_image.startsWith('http')
      ? tool.icon_or_image
      : (FALLBACK_ICON[tool.slug] ?? '🛠️');

  return (
    <Link href={tool.cta_route} className={cardClass}>
      <div className={styles.heroVisual} aria-hidden="true">
        <span className={styles.heroIcon}>{icon}</span>
        <span
          className={[
            styles.heroBadge,
            isComingSoon ? styles.heroBadgeSoon : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {tool.status === 'live'
            ? 'Live'
            : tool.status === 'beta'
              ? 'Beta'
              : 'Coming soon'}
        </span>
      </div>

      <div className={styles.eyebrow}>The Marigold Tool</div>
      <h3 className={styles.title}>{tool.name}</h3>
      <p className={styles.tagline}>{tool.tagline}</p>
      {tool.description && <p className={styles.description}>{tool.description}</p>}

      {tool.stats && tool.stats.length > 0 && (
        <div className={styles.statsRow}>
          {tool.stats.map((stat, idx) => (
            <span key={idx} className={styles.statBadge}>
              {stat.label}
            </span>
          ))}
        </div>
      )}

      <div className={styles.footer}>
        <span className={styles.cta}>
          {tool.cta_label} →
        </span>
        <span className={styles.microcopy}>no signup needed</span>
      </div>
    </Link>
  );
}
