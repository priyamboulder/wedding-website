import { Suspense } from 'react';

import { DestinationsHero } from '@/components/marigold-tools/destinations/DestinationsHero';
import { ContinentGrid } from '@/components/marigold-tools/destinations/ContinentGrid';
import { FilterBar } from '@/components/marigold-tools/destinations/FilterBar';
import { MatchMeBanner } from '@/components/marigold-tools/destinations/MatchMeBanner';
import {
  DISPLAY_CONTINENTS,
  listContinentSummaries,
  type ContinentSummary,
  type BudgetBucket,
  type GuestBucket,
} from '@/lib/destinations';
import { createAnonClient } from '@/lib/supabase/server-client';
import { pageMetadata } from '@/lib/marigold/seo';

export const metadata = pageMetadata({
  title: 'Destination Explorer — The Marigold Tool',
  description:
    'Where in the world are you saying "I do?" Browse 30+ destinations and the vendors who serve them — calibrated for Indian weddings.',
});

// Reading searchParams forces dynamic rendering — the destinationCount data
// is short-lived and can be fetched per request instead of cached.

const STATIC_FALLBACK: ContinentSummary[] = DISPLAY_CONTINENTS.map((c) => ({
  ...c,
  destinationCount: 0,
}));

const GUEST_VALUES: GuestBucket[] = ['under-150', '150-300', '300-500', '500-plus'];
const BUDGET_VALUES: BudgetBucket[] = [
  'under-100k',
  '100-250k',
  '250-500k',
  '500k-plus',
];

function parseGuests(raw: string | string[] | undefined): GuestBucket | null {
  const v = Array.isArray(raw) ? raw[0] : raw;
  return v && (GUEST_VALUES as string[]).includes(v) ? (v as GuestBucket) : null;
}

function parseBudget(raw: string | string[] | undefined): BudgetBucket | null {
  const v = Array.isArray(raw) ? raw[0] : raw;
  return v && (BUDGET_VALUES as string[]).includes(v) ? (v as BudgetBucket) : null;
}

type SearchParams = Promise<{
  guests?: string | string[];
  vibe?: string | string[];
  budget?: string | string[];
}>;

export default async function DestinationsHubPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const guests = parseGuests(params.guests);
  const budget = parseBudget(params.budget);

  const matchHref = (() => {
    const usp = new URLSearchParams();
    if (params.guests && typeof params.guests === 'string') usp.set('guests', params.guests);
    if (params.vibe && typeof params.vibe === 'string') usp.set('vibe', params.vibe);
    if (params.budget && typeof params.budget === 'string') usp.set('budget', params.budget);
    const qs = usp.toString();
    return qs ? `/tools/match?${qs}` : '/tools/match';
  })();

  let continents: ContinentSummary[];
  try {
    continents = await listContinentSummaries(createAnonClient());
  } catch {
    continents = STATIC_FALLBACK;
  }

  return (
    <>
      <DestinationsHero
        eyebrow="The Marigold Destination Explorer"
        scrawl="✿ find the one that fits"
        headline={
          <>
            where in the world are you saying <em>&apos;i do&apos;?</em>
          </>
        }
        subhead={
          <>
            Pick a continent. We&apos;ll show you the destinations that travel well with biryani,
            the vendors who&apos;ll fly there, and what 200 guests actually costs.
          </>
        }
        compact
        slot={
          <Suspense fallback={null}>
            <FilterBar />
          </Suspense>
        }
      />
      <MatchMeBanner href={matchHref} />
      <ContinentGrid continents={continents} guests={guests} budget={budget} />
    </>
  );
}
