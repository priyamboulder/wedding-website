import type { ToolCatalogRow } from '@/types/tools';
import { WaitlistForm } from './WaitlistForm';
import styles from './ComingSoonShelf.module.css';

type ComingSoonShelfProps = {
  tools: ToolCatalogRow[];
};

const FALLBACK_ICON = '🛠️';
const ICONS: Record<string, string> = {
  match: '✨',
  'shagun-calculator': '💰',
  'date-picker': '📅',
  'guest-list-estimator': '📋',
  'vendor-match-quiz': '🎯',
};

export function ComingSoonShelf({ tools }: ComingSoonShelfProps) {
  if (tools.length === 0) return null;

  // The hub already renders Match Me up top with the live tools, but it also
  // belongs in the coming-soon shelf so the waitlist form has it available.
  // The shelf shows the rest — drop Match here to avoid duplicating its tile.
  const shelfTools = tools.filter((t) => t.slug !== 'match');
  const waitlistOptions = tools.map((t) => ({ slug: t.slug, label: t.name }));

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.header}>
          <span className={styles.scrawl}>more on the way</span>
          <h2 className={styles.heading}>
            More tools <em>coming soon.</em>
          </h2>
          <p className={styles.sub}>
            We&apos;re slowly building the rest. Pin one and we&apos;ll text — well, email — you when it&apos;s live.
          </p>
        </div>

        <div className={styles.shelf}>
          {shelfTools.map((tool) => (
            <article key={tool.id} className={styles.placeholder}>
              <div className={styles.placeholderIcon} aria-hidden="true">
                {ICONS[tool.slug] ?? FALLBACK_ICON}
              </div>
              <h3 className={styles.placeholderName}>{tool.name}</h3>
              <p className={styles.placeholderTagline}>{tool.tagline}</p>
              <span className={styles.placeholderTag}>Coming soon</span>
            </article>
          ))}
        </div>

        <div className={styles.captureCard}>
          <div className={styles.captureLeft}>
            <span className={styles.scrawl}>tell me when</span>
            <h3 className={styles.captureHeading}>
              Be first when <em>this drops.</em>
            </h3>
            <p className={styles.captureSub}>
              Drop your email, pick the tool you want most, and we&apos;ll let you
              know the moment it goes live. No spam, no newsletter, just the ping.
            </p>
          </div>
          <div>
            <WaitlistForm
              options={waitlistOptions}
              defaultSlug={shelfTools[0]?.slug ?? waitlistOptions[0]?.slug}
              source="tools_hub_footer"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
