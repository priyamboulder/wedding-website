import { DestinationsHero } from '@/components/marigold-tools/destinations/DestinationsHero';
import { ContinentGrid } from '@/components/marigold-tools/destinations/ContinentGrid';
import {
  DISPLAY_CONTINENTS,
  listContinentSummaries,
  type ContinentSummary,
} from '@/lib/destinations';
import { createAnonClient } from '@/lib/supabase/server-client';
import { pageMetadata } from '@/lib/marigold/seo';

export const metadata = pageMetadata({
  title: 'Destination Explorer — The Marigold Tool',
  description:
    'Where in the world are you saying "I do?" Browse 30+ destinations and the vendors who serve them — calibrated for Indian weddings.',
});

export const revalidate = 300;

// Static fallback so the surface still renders if Supabase is unreachable
// — same pattern the rest of the Tools hub uses.
const STATIC_FALLBACK: ContinentSummary[] = DISPLAY_CONTINENTS.map((c) => ({
  ...c,
  destinationCount: 0,
}));

export default async function DestinationsHubPage() {
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
        scrawl="✿ pinch me, we're going"
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
        pills={['30+ destinations', '500+ vendors', 'Calibrated for Indian weddings']}
      />
      <ContinentGrid continents={continents} />
    </>
  );
}
