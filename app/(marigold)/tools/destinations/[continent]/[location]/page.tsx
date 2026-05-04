import { notFound } from 'next/navigation';

import { Breadcrumb } from '@/components/marigold-tools/destinations/Breadcrumb';
import { DeepDiveHeader } from '@/components/marigold-tools/destinations/DeepDiveHeader';
import { DeepDiveTabs } from '@/components/marigold-tools/destinations/DeepDiveTabs';
import { OverviewTab } from '@/components/marigold-tools/destinations/OverviewTab';
import { VenuesTab } from '@/components/marigold-tools/destinations/VenuesTab';
import { CategoriesTab } from '@/components/marigold-tools/destinations/CategoriesTab';
import { ExperiencesTab } from '@/components/marigold-tools/destinations/ExperiencesTab';

import { getBudgetLocation } from '@/lib/budget/locations';
import {
  findDisplayContinent,
  getDisplayContinentSlug,
  listCategoriesServingLocation,
} from '@/lib/destinations';
import {
  getVendorsForCategory,
  getVendorPricingIndicators,
  listVendorCategories,
} from '@/lib/vendors/tools-queries';
import { createAnonClient } from '@/lib/supabase/server-client';
import { pageMetadata } from '@/lib/marigold/seo';

import styles from './page.module.css';

export const revalidate = 300;

type RouteParams = {
  params: Promise<{ continent: string; location: string }>;
};

const FALLBACK_HEROES: Record<string, string> = {
  udaipur:
    'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1800&q=80',
  goa: 'https://images.unsplash.com/photo-1517451330947-7809dead78d5?auto=format&fit=crop&w=1800&q=80',
  jaipur:
    'https://images.unsplash.com/photo-1599661046827-dacde6976549?auto=format&fit=crop&w=1800&q=80',
  kerala:
    'https://images.unsplash.com/photo-1602215460842-4f6e2b13ba23?auto=format&fit=crop&w=1800&q=80',
  'mumbai-delhi':
    'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=1800&q=80',
  'lake-como':
    'https://images.unsplash.com/photo-1530841377377-3ff06c0ca713?auto=format&fit=crop&w=1800&q=80',
  france:
    'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=1800&q=80',
  spain:
    'https://images.unsplash.com/photo-1543783207-ec64e4d95325?auto=format&fit=crop&w=1800&q=80',
  uk: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=1800&q=80',
  greece:
    'https://images.unsplash.com/photo-1503152394-c571994fd383?auto=format&fit=crop&w=1800&q=80',
  portugal:
    'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?auto=format&fit=crop&w=1800&q=80',
  turkey:
    'https://images.unsplash.com/photo-1522735338363-cc7313be0ae0?auto=format&fit=crop&w=1800&q=80',
  dubai:
    'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1800&q=80',
  oman: 'https://images.unsplash.com/photo-1580785692930-fb5a4eb1cb09?auto=format&fit=crop&w=1800&q=80',
  thailand:
    'https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=1800&q=80',
  bali: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1800&q=80',
  singapore:
    'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=1800&q=80',
  jamaica:
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1800&q=80',
  'turks-caicos':
    'https://images.unsplash.com/photo-1502301197179-65228ab57f78?auto=format&fit=crop&w=1800&q=80',
  'cape-town':
    'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=1800&q=80',
  morocco:
    'https://images.unsplash.com/photo-1539020140153-e479b8c5c41a?auto=format&fit=crop&w=1800&q=80',
  kenya:
    'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=1800&q=80',
  sydney:
    'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=1800&q=80',
};

export async function generateMetadata({ params }: RouteParams) {
  const { location } = await params;
  return pageMetadata({
    title: `${location.replace(/-/g, ' ')} weddings — The Marigold Destination Explorer`,
    description: `Vendors, venues, what it costs. The full picture for an Indian wedding in ${location.replace(/-/g, ' ')}.`,
  });
}

export default async function DestinationDeepDive({ params }: RouteParams) {
  const { continent, location } = await params;

  const display = findDisplayContinent(continent);
  if (!display) notFound();

  const supabase = createAnonClient();

  const detail = await getBudgetLocation(supabase, location).catch(() => null);
  if (!detail) notFound();

  // Confirm the location actually belongs to the URL's continent — guards
  // against /tools/destinations/europe/goa working.
  const expectedContinentSlug = getDisplayContinentSlug(detail);
  if (expectedContinentSlug !== display.slug) notFound();

  // ── Pre-fetch every tab's data in parallel. The deep-dive page is the
  // most data-heavy surface in the explorer; doing this server-side means
  // the client receives ready-rendered panels and the tab-switch is purely
  // visual. ────────────────────────────────────────────────────────────────
  const [
    venuesRanked,
    categoriesServing,
    allCategories,
  ] = await Promise.all([
    getVendorsForCategory(supabase, {
      categorySlug: 'venue',
      locationSlug: location,
      limit: 18,
    }).catch(() => []),
    listCategoriesServingLocation(supabase, location).catch(() => []),
    listVendorCategories(supabase).catch(() => []),
  ]);

  // Resolve venue pricing bands in one fan-out (one row per vendor).
  const venueCategory = allCategories.find((c) => c.slug === 'venue');
  const venuePricing = await Promise.all(
    venuesRanked.map(async (v) => {
      const indicators = await getVendorPricingIndicators(supabase, v.id).catch(
        () => [],
      );
      const venueIndicator =
        indicators.find((p) => p.category_id === venueCategory?.id) ?? null;
      return {
        vendor: v,
        priceLowUsd: venueIndicator?.price_low_usd ?? null,
        priceHighUsd: venueIndicator?.price_high_usd ?? null,
        // The home_base_country can be read as a quick "Palace Hotel"-style
        // sub-label fallback when the vendor's tagline doesn't carry one.
        typeLabel: undefined as string | undefined,
      };
    }),
  );

  const heroImageUrl =
    detail.hero_image_url ||
    FALLBACK_HEROES[detail.slug] ||
    'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1800&q=80';

  return (
    <>
      <DeepDiveHeader location={detail} heroImageUrl={heroImageUrl} />

      <section className={styles.section}>
        <div className={styles.inner}>
          <Breadcrumb
            steps={[
              { label: 'Destinations', href: '/tools/destinations' },
              {
                label: display.name,
                href: `/tools/destinations/${display.slug}`,
              },
              { label: detail.name },
            ]}
          />

          <DeepDiveTabs
            defaultTabId="overview"
            tabs={[
              {
                id: 'overview',
                label: 'Overview',
                scrawl: 'the lay of the land',
                content: (
                  <OverviewTab
                    location={detail}
                    regions={detail.regions}
                    vendorsAnchor="#vendors"
                  />
                ),
              },
              {
                id: 'venues',
                label: 'Venues',
                scrawl: 'where you’ll do it',
                content: (
                  <VenuesTab
                    venues={venuePricing}
                    locationSlug={detail.slug}
                    locationName={detail.name}
                  />
                ),
              },
              {
                id: 'categories',
                label: 'Vendors',
                scrawl: 'every other category',
                content: (
                  <CategoriesTab
                    continentSlug={display.slug}
                    locationSlug={detail.slug}
                    locationName={detail.name}
                    categories={categoriesServing}
                  />
                ),
              },
              {
                id: 'experiences',
                label: 'Experiences',
                scrawl: 'the moodboard',
                content: (
                  <ExperiencesTab
                    experiences={detail.experiences}
                    locationName={detail.name}
                  />
                ),
              },
            ]}
          />
        </div>
      </section>
    </>
  );
}
