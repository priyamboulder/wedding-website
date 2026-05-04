import { Suspense } from 'react';
import { ToolsHero } from '@/components/marigold-tools/ToolsHero';
import { ToolGrid } from '@/components/marigold-tools/ToolGrid';
import { MiniToolsSection } from '@/components/marigold-tools/hub/MiniToolsSection';
import { SuggestToolFooter } from '@/components/marigold-tools/hub/SuggestToolFooter';
import { FALLBACK_TOOLS_CATALOG, listToolsCatalog } from '@/lib/tools';
import { createAnonClient } from '@/lib/supabase/server-client';
import { pageMetadata } from '@/lib/marigold/seo';
import type { ToolCatalogRow } from '@/types/tools';

export const metadata = pageMetadata({
  title: 'The Marigold — Tools',
  description:
    'The math, the maps, the moves. 50+ free tools for Indian wedding planning — from real-cost budgeting to Kundli matching. No signup, ever.',
});

export const revalidate = 300;

// Display order for the eight flagship tools that anchor the editorial grid.
// Slugs map to the canonical entries in `tools_catalog` / FALLBACK_TOOLS_CATALOG.
const FLAGSHIP_SLUGS = [
  'budget',
  'kundli',
  'guest-list-estimator',
  'date-picker',
  'visualizer',
  'ready',
  'wedding-stars',
  'shagun-calculator',
];

export default async function ToolsHubPage() {
  let all: ToolCatalogRow[];
  try {
    all = await listToolsCatalog(createAnonClient());
    if (all.length === 0) all = FALLBACK_TOOLS_CATALOG;
  } catch {
    all = FALLBACK_TOOLS_CATALOG;
  }

  const bySlug = new Map(all.map((t) => [t.slug, t]));
  const flagship = FLAGSHIP_SLUGS.map((slug) => bySlug.get(slug)).filter(
    (t): t is ToolCatalogRow => Boolean(t),
  );

  return (
    <>
      <ToolsHero />
      <ToolGrid tools={flagship} />
      <Suspense fallback={null}>
        <MiniToolsSection />
      </Suspense>
      <SuggestToolFooter />
    </>
  );
}
