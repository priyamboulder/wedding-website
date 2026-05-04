// Server shell — extracts the slug param and hands it to the client view.
// Splitting server-shell from client-view sidesteps a Next 16 + Turbopack
// quirk where a top-level 'use client' page using use(params) can stall
// the route graph for very large client components.

import { notFound } from 'next/navigation';
import PaletteDeepDiveView, { hasPalette } from './PaletteDeepDiveView';

export default async function PaletteDeepDivePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!hasPalette(slug)) notFound();
  return <PaletteDeepDiveView slug={slug} />;
}
