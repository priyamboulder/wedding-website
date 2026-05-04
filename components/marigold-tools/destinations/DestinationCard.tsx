import Link from 'next/link';
import type { BudgetLocationRow } from '@/types/budget';
import styles from './DestinationCard.module.css';

const CONTINENT_FALLBACK_IMAGES: Record<string, string> = {
  udaipur:
    'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1400&q=80',
  goa: 'https://images.unsplash.com/photo-1517451330947-7809dead78d5?auto=format&fit=crop&w=1400&q=80',
  jaipur:
    'https://images.unsplash.com/photo-1599661046827-dacde6976549?auto=format&fit=crop&w=1400&q=80',
  kerala:
    'https://images.unsplash.com/photo-1602215460842-4f6e2b13ba23?auto=format&fit=crop&w=1400&q=80',
  'mumbai-delhi':
    'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=1400&q=80',
  'lake-como':
    'https://images.unsplash.com/photo-1530841377377-3ff06c0ca713?auto=format&fit=crop&w=1400&q=80',
  france:
    'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=1400&q=80',
  spain:
    'https://images.unsplash.com/photo-1543783207-ec64e4d95325?auto=format&fit=crop&w=1400&q=80',
  uk: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=1400&q=80',
  greece:
    'https://images.unsplash.com/photo-1503152394-c571994fd383?auto=format&fit=crop&w=1400&q=80',
  portugal:
    'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?auto=format&fit=crop&w=1400&q=80',
  turkey:
    'https://images.unsplash.com/photo-1522735338363-cc7313be0ae0?auto=format&fit=crop&w=1400&q=80',
  dubai:
    'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1400&q=80',
  oman: 'https://images.unsplash.com/photo-1580785692930-fb5a4eb1cb09?auto=format&fit=crop&w=1400&q=80',
  thailand:
    'https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=1400&q=80',
  bali: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1400&q=80',
  singapore:
    'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=1400&q=80',
  jamaica:
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=80',
  'turks-caicos':
    'https://images.unsplash.com/photo-1502301197179-65228ab57f78?auto=format&fit=crop&w=1400&q=80',
  'cape-town':
    'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=1400&q=80',
  morocco:
    'https://images.unsplash.com/photo-1539020140153-e479b8c5c41a?auto=format&fit=crop&w=1400&q=80',
  kenya:
    'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=1400&q=80',
  sydney:
    'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=1400&q=80',
};

const FALLBACK_HERO =
  'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1400&q=80';

function formatBudget(value: number): string {
  if (value >= 1000) return `$${Math.round(value / 1000)}K`;
  return `$${value}`;
}

type DestinationCardProps = {
  destination: BudgetLocationRow;
  continentSlug: string;
};

export function DestinationCard({
  destination,
  continentSlug,
}: DestinationCardProps) {
  const heroSrc =
    destination.hero_image_url ||
    CONTINENT_FALLBACK_IMAGES[destination.slug] ||
    FALLBACK_HERO;
  const href = `/tools/destinations/${continentSlug}/${destination.slug}`;
  const multiplierBadge = `${destination.multiplier}x Dallas`;
  const minBudgetBadge = `from ${formatBudget(destination.min_budget_usd)}`;
  const bestFor = destination.best_for || 'multi-day weddings, generous backdrops';

  return (
    <Link href={href} className={styles.card}>
      <div className={styles.imageWrap}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={heroSrc} alt={destination.name} className={styles.image} loading="lazy" />
        <div className={styles.imageBadges}>
          <span className={styles.multiplier}>{multiplierBadge}</span>
          <span className={styles.budget}>{minBudgetBadge}</span>
        </div>
      </div>
      <div className={styles.body}>
        <h2 className={styles.name}>{destination.name}</h2>
        <p className={styles.tagline}>
          {destination.tagline || 'Pin me on the moodboard.'}
        </p>
        <p className={styles.bestFor}>
          <span className={styles.bestForLabel}>best for </span>
          {bestFor}
        </p>
        <span className={styles.cta}>Take me there →</span>
      </div>
    </Link>
  );
}
