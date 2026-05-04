import Link from 'next/link';
import { notFound } from 'next/navigation';

import { Breadcrumb } from '@/components/marigold-tools/destinations/Breadcrumb';
import { DestinationsHero } from '@/components/marigold-tools/destinations/DestinationsHero';
import { DestinationCard } from '@/components/marigold-tools/destinations/DestinationCard';
import {
  DISPLAY_CONTINENTS,
  findDisplayContinent,
  listDestinationsForContinent,
} from '@/lib/destinations';
import { createAnonClient } from '@/lib/supabase/server-client';
import { pageMetadata } from '@/lib/marigold/seo';
import styles from './page.module.css';

export const revalidate = 300;

type RouteParams = {
  params: Promise<{ continent: string }>;
};

export async function generateMetadata({ params }: RouteParams) {
  const { continent } = await params;
  const display = findDisplayContinent(continent);
  if (!display) {
    return pageMetadata({
      title: 'Destination Explorer — The Marigold Tool',
      description: 'Browse destinations and the vendors who serve them.',
    });
  }
  return pageMetadata({
    title: `${display.name} weddings — The Marigold Destination Explorer`,
    description: display.tagline,
  });
}

export async function generateStaticParams() {
  return DISPLAY_CONTINENTS.map((c) => ({ continent: c.slug }));
}

export default async function ContinentPage({ params }: RouteParams) {
  const { continent } = await params;

  let result: Awaited<ReturnType<typeof listDestinationsForContinent>> = null;
  try {
    result = await listDestinationsForContinent(createAnonClient(), continent);
  } catch {
    const display = findDisplayContinent(continent);
    if (!display) notFound();
    result = { continent: display, destinations: [] };
  }
  if (!result) notFound();

  const { continent: display, destinations } = result;

  return (
    <>
      <DestinationsHero
        eyebrow={`Destination Explorer · ${display.name}`}
        scrawl="✿ destination ideas"
        headline={
          <>
            <em>{display.name.toLowerCase()}</em>
            {destinations.length > 0
              ? `, sorted by what it'll cost you`
              : `, coming soon to the explorer`}
          </>
        }
        subhead={display.tagline}
        showDivider={false}
      />
      <section className={styles.section}>
        <div className={styles.inner}>
          <Breadcrumb
            steps={[
              { label: 'Destinations', href: '/tools/destinations' },
              { label: display.name },
            ]}
          />

          {destinations.length === 0 ? (
            <div className={styles.empty}>
              <span className={styles.emptyScrawl}>not yet ✿</span>
              <h2 className={styles.emptyHeading}>
                we&apos;re still scouting <em>{display.name.toLowerCase()}</em>
              </h2>
              <p className={styles.emptyBody}>
                The marigold roster for {display.name.toLowerCase()} is on the way. Drop your
                email on the main tool page and we&apos;ll tell you when destinations land here.
              </p>
              <Link href="/tools/destinations" className={styles.backLink}>
                ← Back to all continents
              </Link>
            </div>
          ) : (
            <div className={styles.grid}>
              {destinations.map((dest) => (
                <DestinationCard
                  key={dest.id}
                  destination={dest}
                  continentSlug={display.slug}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
