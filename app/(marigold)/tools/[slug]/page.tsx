// ──────────────────────────────────────────────────────────────────────────
// /tools/[slug] — catch-all teaser for any catalog slug that doesn't have
// a dedicated route. Specific routes (/tools/budget, /tools/match, etc.)
// take precedence in Next.js routing; this only fires for the long tail
// of "coming soon" tools surfaced by the hub.
//
// Resolution order:
//   1. DB tools_catalog (canonical, includes status + cta_route)
//   2. TS FALLBACK_TOOLS_CATALOG (when DB is unreachable)
//   3. TS mini-tools catalog (the 50+ entries surfaced in MiniToolsSection)
//
// Anything else returns 404.
// ──────────────────────────────────────────────────────────────────────────

import { notFound } from 'next/navigation';

import { ToolPlaceholderPage } from '@/components/marigold-tools/ToolPlaceholderPage';
import { getMiniToolComponent } from '@/components/marigold-tools/mini/registry';
import { TOOLS_CATALOG, type CatalogTool } from '@/lib/tools/catalog';
import { FALLBACK_TOOLS_CATALOG, getTool } from '@/lib/tools';
import { pageMetadata } from '@/lib/marigold/seo';
import { createAnonClient } from '@/lib/supabase/server-client';
import type { ToolCatalogRow } from '@/types/tools';

export const revalidate = 300;

type Params = { slug: string };

async function resolveTool(slug: string): Promise<ToolCatalogRow | null> {
  try {
    const dbRow = await getTool(createAnonClient(), slug);
    if (dbRow) return dbRow;
  } catch {
    // fall through to TS catalogs
  }

  const fallback = FALLBACK_TOOLS_CATALOG.find((t) => t.slug === slug);
  if (fallback) return fallback;

  const mini = TOOLS_CATALOG.find((t) => t.slug === slug);
  if (mini) return adaptCatalogTool(mini);

  return null;
}

function adaptCatalogTool(tool: CatalogTool): ToolCatalogRow {
  return {
    id: `mini-${tool.id}`,
    slug: tool.slug,
    name: tool.name,
    tagline: tool.tagline,
    description: tool.description,
    icon_or_image: tool.icon ?? null,
    cta_label: tool.ctaText,
    cta_route: `/tools/${tool.slug}`,
    stats: tool.featurePills.map((label) => ({ label })),
    display_order: 999,
    active: true,
    status: tool.status === 'live' ? 'live' : 'coming_soon',
    created_at: new Date(0).toISOString(),
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const tool = await resolveTool(slug);
  if (!tool) {
    return pageMetadata({
      title: 'Tool not found — The Marigold',
      description: 'That tool does not exist (yet).',
    });
  }
  return pageMetadata({
    title: `${tool.name} — The Marigold Tool`,
    description: tool.description || tool.tagline,
  });
}

export default async function ToolSlugPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;

  // Built mini tools take precedence over the placeholder. They handle their
  // own layout (MiniToolShell) so we don't pass the catalog row down.
  const MiniTool = getMiniToolComponent(slug);
  if (MiniTool) return <MiniTool />;

  const tool = await resolveTool(slug);
  if (!tool) notFound();

  return <ToolPlaceholderPage tool={tool} />;
}
