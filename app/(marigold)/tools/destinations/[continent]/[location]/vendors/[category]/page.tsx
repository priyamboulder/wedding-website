import { notFound } from 'next/navigation';

import { Breadcrumb } from '@/components/marigold-tools/destinations/Breadcrumb';
import { DestinationsHero } from '@/components/marigold-tools/destinations/DestinationsHero';
import { VendorListView } from '@/components/marigold-tools/destinations/VendorListView';
import { getBudgetLocation } from '@/lib/budget/locations';
import {
  findDisplayContinent,
  getDisplayContinentSlug,
  getVendorCategoryBySlug,
} from '@/lib/destinations';
import {
  getVendorPricingIndicators,
  getVendorsForCategory,
} from '@/lib/vendors/tools-queries';
import { createAnonClient } from '@/lib/supabase/server-client';
import { pageMetadata } from '@/lib/marigold/seo';

import styles from './page.module.css';

export const revalidate = 300;

const VENUE_LIKE_CATEGORIES = new Set(['venue', 'mandap', 'hotel-block']);

type RouteParams = {
  params: Promise<{ continent: string; location: string; category: string }>;
};

const SUBHEADS_BY_CATEGORY: Record<string, (location: string) => string> = {
  photography: (loc) =>
    `photographers in ${loc} who'll make your phupho cry on schedule.`,
  videography: (loc) =>
    `videographers in ${loc} who'll edit the dhol drop into the right frame.`,
  catering: (loc) =>
    `caterers in ${loc} who can plate 400 without losing the kichdi.`,
  'decor-florals': (loc) =>
    `florists in ${loc} who know what marigolds look like in the wrong light.`,
  'wedding-planner': (loc) =>
    `planners in ${loc} who'll wrangle six hundred relatives so you don't have to.`,
  'hair-makeup': (loc) =>
    `hair and makeup teams in ${loc} who get gold against pink.`,
  venue: (loc) =>
    `venues in ${loc} that can hold a baraat, a sangeet, and a sunset reception.`,
  mandap: (loc) =>
    `mandap builders in ${loc} who'll tie it together by sunset.`,
  dj: (loc) => `DJs in ${loc} who know what time to drop "kala chashma."`,
};

function defaultSubhead(categoryName: string, locationName: string): string {
  return `${categoryName.toLowerCase()} in ${locationName.toLowerCase()} — sponsored partners surface first, then everyone else, randomized so the same names don't always sit on top.`;
}

export async function generateMetadata({ params }: RouteParams) {
  const { category, location } = await params;
  const niceCategory = category.replace(/-/g, ' ');
  const niceLocation = location.replace(/-/g, ' ');
  return pageMetadata({
    title: `${niceCategory} in ${niceLocation} — The Marigold Destination Explorer`,
    description: `Real vendors. Sponsored partners labelled. The actual ${niceCategory} who serve ${niceLocation}.`,
  });
}

export default async function VendorListPage({ params }: RouteParams) {
  const { continent, location, category } = await params;
  const display = findDisplayContinent(continent);
  if (!display) notFound();

  const supabase = createAnonClient();

  const [detail, categoryRow] = await Promise.all([
    getBudgetLocation(supabase, location).catch(() => null),
    getVendorCategoryBySlug(supabase, category).catch(() => null),
  ]);
  if (!detail || !categoryRow) notFound();
  if (getDisplayContinentSlug(detail) !== display.slug) notFound();

  const vendors = await getVendorsForCategory(supabase, {
    categorySlug: category,
    locationSlug: location,
    limit: 60,
  }).catch(() => []);

  // Resolve pricing for each vendor at this category. One round-trip per
  // vendor on the ranked list — the list is bounded (limit: 60) and route
  // revalidate is 300s.
  const withPricing = await Promise.all(
    vendors.map(async (v) => {
      const indicators = await getVendorPricingIndicators(supabase, v.id).catch(
        () => [],
      );
      const match = indicators.find((p) => p.category_id === categoryRow.id) ?? null;
      return {
        vendor: v,
        priceLowUsd: match?.price_low_usd ?? null,
        priceHighUsd: match?.price_high_usd ?? null,
      };
    }),
  );

  const subheadCopy =
    SUBHEADS_BY_CATEGORY[category]?.(detail.name) ??
    defaultSubhead(categoryRow.name, detail.name);

  return (
    <>
      <DestinationsHero
        eyebrow={`Destination Explorer · ${detail.name}`}
        scrawl={`✿ ${categoryRow.icon || ''} ${categoryRow.name.toLowerCase()}`}
        headline={
          <>
            <em>{categoryRow.name.toLowerCase()}</em> in {detail.name.toLowerCase()}
          </>
        }
        subhead={subheadCopy}
        showDivider={false}
      />

      <section className={styles.section}>
        <div className={styles.inner}>
          <Breadcrumb
            steps={[
              { label: 'Destinations', href: '/tools/destinations' },
              { label: display.name, href: `/tools/destinations/${display.slug}` },
              {
                label: detail.name,
                href: `/tools/destinations/${display.slug}/${detail.slug}`,
              },
              { label: categoryRow.name },
            ]}
          />

          {vendors.length === 0 ? (
            <div className={styles.empty}>
              <span className={styles.emptyScrawl}>almost there ✿</span>
              <h2 className={styles.emptyHeading}>
                we&apos;re still building our <em>{categoryRow.name.toLowerCase()}</em> roster
                for <em>{detail.name}</em>
              </h2>
              <p className={styles.emptyBody}>
                Drop your email and we&apos;ll tell you when {categoryRow.name.toLowerCase()}{' '}
                vendors land in {detail.name}.
              </p>
            </div>
          ) : (
            <VendorListView
              vendors={withPricing}
              locationSlug={detail.slug}
              locationName={detail.name}
              categorySlug={categoryRow.slug}
              categoryName={categoryRow.name}
              showCapacity={VENUE_LIKE_CATEGORIES.has(category)}
            />
          )}
        </div>
      </section>
    </>
  );
}
