// ══════════════════════════════════════════════════════════════════════════
//   /studio/[surface]/templates — Template marketplace entry
//
//   The dynamic [surface] segment maps to a design_templates.surface_type
//   (invitation, save_the_date, menu, welcome_sign, etc.). This page is a
//   server component — it resolves the surface's catalog once and passes
//   rows down to the client marketplace, which handles filtering + sort.
//
//   Production data source:
//     const supabase = createClient();
//     const { data: templates } = await supabase
//       .from("design_templates")
//       .select("*")
//       .eq("surface_type", surfaceType)
//       .eq("is_published", true)
//       .order("is_trending", { ascending: false });
//
//   Until the Supabase client is wired, we hydrate from the bundled starter
//   catalog at lib/studio/starter-templates.ts (shape-aligned with the row).
// ══════════════════════════════════════════════════════════════════════════

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { TemplateMarketplace } from "@/components/studio/marketplace/TemplateMarketplace";
import { templatesForSurface } from "@/lib/studio/starter-templates";
import { SURFACE_META, ROUTABLE_SURFACES } from "@/lib/studio/surface-meta";
import type { SurfaceType } from "@/components/studio/canvas-editor/CanvasEditor";

// Prerender the known surface routes. Any unknown [surface] 404s.
export function generateStaticParams() {
  return ROUTABLE_SURFACES.map((s) => ({ surface: s }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ surface: string }>;
}): Promise<Metadata> {
  const { surface } = await params;
  const meta = SURFACE_META[surface as SurfaceType];
  if (!meta) return { title: "Studio · Templates" };
  return {
    title: `${meta.title} — Ananya Studio`,
    description: meta.subtitle,
  };
}

export default async function SurfaceTemplatesPage({
  params,
}: {
  params: Promise<{ surface: string }>;
}) {
  const { surface } = await params;
  const surfaceType = surface as SurfaceType;
  const meta = SURFACE_META[surfaceType];
  if (!meta) notFound();

  const templates = templatesForSurface(surfaceType);

  return (
    <TemplateMarketplace
      surfaceType={surfaceType}
      meta={meta}
      templates={templates}
    />
  );
}
