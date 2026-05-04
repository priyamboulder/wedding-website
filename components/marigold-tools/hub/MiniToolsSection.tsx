'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useCallback, useMemo, type CSSProperties } from 'react';
import {
  CATEGORY_DOTS,
  TOOLS_CATALOG,
  type CatalogTool,
  type ToolCategory,
} from '@/lib/tools/catalog';
import styles from './hub.module.css';

type FilterValue = 'all' | ToolCategory;

// Display labels for filter tabs — short forms per the editorial spec
// ("PLANNING" instead of "PLANNING & LOGISTICS", etc).
const FILTER_LABELS: Record<FilterValue, string> = {
  all: 'All',
  planning: 'Planning',
  money: 'Money',
  astrology: 'Astrology',
  style: 'Style',
  family: 'Family',
  fun: 'Fun',
  'day-of': 'Day-Of',
};

const FILTER_ORDER: FilterValue[] = [
  'all',
  'planning',
  'money',
  'astrology',
  'style',
  'family',
  'fun',
  'day-of',
];

const VALID_CATEGORIES = new Set<FilterValue>(FILTER_ORDER);

export function MiniToolsSection() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryCat = searchParams?.get('category') ?? 'all';
  const active: FilterValue = VALID_CATEGORIES.has(queryCat as FilterValue)
    ? (queryCat as FilterValue)
    : 'all';

  // Mini tools = everything in the catalog that isn't a flagship headliner.
  const miniTools = useMemo(
    () => TOOLS_CATALOG.filter((t) => !t.isFeatured),
    [],
  );

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: miniTools.length };
    for (const t of miniTools) c[t.category] = (c[t.category] ?? 0) + 1;
    return c;
  }, [miniTools]);

  const filtered = useMemo(() => {
    if (active === 'all') return miniTools;
    return miniTools.filter((t) => t.category === active);
  }, [active, miniTools]);

  const setActive = useCallback(
    (value: FilterValue) => {
      const params = new URLSearchParams(searchParams?.toString() ?? '');
      if (value === 'all') params.delete('category');
      else params.set('category', value);
      const qs = params.toString();
      router.replace(qs ? `/tools?${qs}#mini-tools` : `/tools#mini-tools`, {
        scroll: false,
      });
    },
    [router, searchParams],
  );

  return (
    <>
      <section className={styles.divider} id="mini-tools">
        <div className={styles.dividerInner}>
          <span aria-hidden="true" className={styles.dividerScribble}>
            <svg width="42" height="42" viewBox="0 0 42 42" fill="none">
              <path
                d="M21 4l3 9h9l-7.5 5.5 3 10-7.5-6.5-7.5 6.5 3-10L9 13h9z"
                stroke="currentColor"
                strokeWidth="1.2"
              />
            </svg>
          </span>
          <span className={styles.dividerEyebrow}>keep going — there&apos;s more</span>
          <h2 className={styles.dividerHeading}>
            the quick <em>ones.</em>
          </h2>
          <p className={styles.dividerSub}>
            Calculators, quizzes, and generators for every question that pops into your head at 2 AM.
          </p>
        </div>
      </section>

      <div className={styles.filterRow}>
        <div className={styles.filterScroll} role="tablist" aria-label="Filter mini tools">
          {FILTER_ORDER.map((cat) => (
            <FilterTab
              key={cat}
              label={FILTER_LABELS[cat]}
              count={counts[cat] ?? 0}
              active={active === cat}
              onClick={() => setActive(cat)}
            />
          ))}
        </div>
      </div>

      <section className={styles.gridSection}>
        <motion.div className={styles.grid} layout>
          <AnimatePresence mode="popLayout">
            {filtered.length === 0 ? (
              <div className={styles.gridEmpty} key="empty">
                nothing here yet — try another category
              </div>
            ) : (
              filtered.map((tool) => <MiniToolCard key={tool.id} tool={tool} />)
            )}
          </AnimatePresence>
        </motion.div>
      </section>
    </>
  );
}

function FilterTab({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`${styles.filterTab} ${active ? styles.filterTabActive : ''}`}
    >
      {label}
      <span className={styles.filterCount}>({count})</span>
    </button>
  );
}

function MiniToolCard({ tool }: { tool: CatalogTool }) {
  const cardStyle = {
    '--cat-color': CATEGORY_DOTS[tool.category],
  } as CSSProperties;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
    >
      <Link
        href={`/tools/${tool.slug}`}
        className={styles.miniCard}
        style={cardStyle}
        aria-label={`${tool.name} — ${tool.tagline}`}
      >
        <div className={styles.miniHeader}>
          <h3 className={styles.miniName}>{tool.name}</h3>
          <span className={styles.miniTime}>⚡ {tool.estimatedTime}</span>
        </div>
        <p className={styles.miniTagline}>{tool.tagline}</p>
        <p className={styles.miniDescription}>{tool.description}</p>

        <div className={styles.miniFooter}>
          <span className={styles.miniCta}>try it →</span>
          {tool.status === 'coming-soon' && (
            <span className={styles.miniSoonTag}>coming soon</span>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
