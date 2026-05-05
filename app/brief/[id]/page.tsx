// /brief/[id] — bookmarkable, shareable results page.
//
// Server component. Fetches the brief by public_id (RLS allows anon
// SELECT), then hands the answers to the BriefResults client component
// for the magazine-style layout. notFound() for unknown ids.

import { notFound } from 'next/navigation';

import { BriefResults } from '@/components/brief/BriefResults';
import { createAnonClient } from '@/lib/supabase/server-client';
import type { BriefAnswers, BriefRecord } from '@/lib/brief/types';
import { buildSummary } from '@/lib/brief/calculations';
import { VIBE_OPTIONS } from '@/lib/brief/options';

export const dynamic = 'force-dynamic';

type DbRow = {
  id: string;
  public_id: string;
  events: BriefAnswers['events'];
  guests: BriefAnswers['guests'];
  budget: BriefAnswers['budget'];
  vibe: BriefAnswers['vibe'];
  destination: BriefAnswers['destination'];
  priorities: BriefAnswers['priorities'];
  timeline: BriefAnswers['timeline'];
  created_at: string;
};

async function loadBrief(publicId: string): Promise<BriefRecord | null> {
  const supabase = createAnonClient();
  const { data } = await supabase
    .from('brief_responses')
    .select(
      'id, public_id, events, guests, budget, vibe, destination, priorities, timeline, created_at',
    )
    .eq('public_id', publicId)
    .maybeSingle<DbRow>();

  if (!data) return null;
  return data as BriefRecord;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const brief = await loadBrief(id);
  if (!brief) {
    return { title: 'Brief not found · The Marigold' };
  }
  const vibe = VIBE_OPTIONS.find((v) => v.value === brief.vibe);
  return {
    title: `Your Brief — ${vibe?.label ?? 'Indian Wedding'} · The Marigold`,
    description: buildSummary(brief),
  };
}

export default async function BriefResultsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const brief = await loadBrief(id);
  if (!brief) notFound();
  return <BriefResults brief={brief} />;
}
