'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ChunkyButton } from '@/components/marigold/ui/ChunkyButton';
import { ScrawlNote } from '@/components/marigold/ui/ScrawlNote';
import { TapeStrip } from '@/components/marigold/ui/TapeStrip';
import { PushPin } from '@/components/marigold/ui/PushPin';
import {
  CONDITION_LABELS,
  CURATED_CATEGORIES,
  CURATED_PRODUCTS,
  EXHIBITIONS,
  MARKETPLACE_CATEGORIES,
  MARKETPLACE_LISTINGS,
  type CuratedCategory,
  type Exhibition,
  type MarketplaceCategory,
  type ProductCondition,
  type ProductTab,
  type PublicProduct,
} from '@/lib/marigold/shopping';
import styles from './ShoppingBrowser.module.css';

type GateContext = 'curated' | 'marketplace' | 'exhibition';
type GateTarget =
  | { context: 'curated' | 'marketplace'; product: PublicProduct }
  | { context: 'exhibition'; exhibition: Exhibition };

const PIN_COLORS = ['pink', 'gold', 'red'] as const;

const CONDITION_CLASSES: Record<ProductCondition, string> = {
  'new-with-tags': styles.condNew,
  'worn-once': styles.condWornOnce,
  'gently-used': styles.condGently,
  'well-loved': styles.condWell,
};

function SearchIcon() {
  return (
    <svg
      className={styles.searchIcon}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function CuratedCard({
  product,
  index,
  onSelect,
  onSave,
}: {
  product: PublicProduct;
  index: number;
  onSelect: (p: PublicProduct) => void;
  onSave: (p: PublicProduct) => void;
}) {
  const rotations = [-0.5, 0.4, -0.3, 0.5, -0.4, 0.3];
  const rotation = rotations[index % rotations.length];
  const showTape = index % 5 === 1;
  const showPin = index % 6 === 4;
  const pinColor = PIN_COLORS[index % PIN_COLORS.length];
  const creamInfo = index % 4 === 2;

  const gradient = `linear-gradient(135deg, ${product.gradientColors[0]} 0%, ${product.gradientColors[1]} 100%)`;

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(product);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(product)}
      onKeyDown={handleKey}
      className={styles.card}
      style={{ transform: `rotate(${rotation}deg)` }}
      aria-label={`View ${product.name}`}
    >
      {showTape && <TapeStrip position="tl" />}
      {showPin && <PushPin color={pinColor} position="right" />}
      <div className={styles.cardInner}>
        <div className={styles.photo} style={{ background: gradient }}>
          <span className={styles.catChip}>{product.category}</span>
          {product.creatorPick && (
            <span className={styles.creatorPickBadge}>★ Creator Pick</span>
          )}
          <button
            type="button"
            className={styles.heartBtn}
            onClick={(e) => {
              e.stopPropagation();
              onSave(product);
            }}
            aria-label={`Save ${product.name}`}
          >
            <HeartIcon />
          </button>
        </div>
        <div className={`${styles.info} ${creamInfo ? styles.infoCream : ''}`}>
          <h3 className={styles.name}>{product.name}</h3>
          {product.brand && <p className={styles.brand}>{product.brand}</p>}
          <div className={styles.priceRow}>
            <span className={styles.price}>{product.price}</span>
          </div>
          {product.creatorName && (
            <div className={styles.creatorRow}>
              <span className={styles.creatorAvatar} aria-hidden="true" />
              <span>Picked by {product.creatorName}</span>
            </div>
          )}
          {product.scrawl && (
            <span className={styles.cardScrawl}>{product.scrawl}</span>
          )}
          {product.moduleTag && (
            <div className={styles.moduleTag}>{product.moduleTag}</div>
          )}
        </div>
      </div>
    </div>
  );
}

function MarketplaceCard({
  product,
  index,
  onSelect,
  onSave,
}: {
  product: PublicProduct;
  index: number;
  onSelect: (p: PublicProduct) => void;
  onSave: (p: PublicProduct) => void;
}) {
  const rotations = [-0.4, 0.5, -0.3, 0.4];
  const rotation = rotations[index % rotations.length];
  const showTape = index % 4 === 2;
  const showPin = index % 5 === 1;
  const pinColor = PIN_COLORS[index % PIN_COLORS.length];

  const gradient = `linear-gradient(135deg, ${product.gradientColors[0]} 0%, ${product.gradientColors[1]} 100%)`;
  const condClass = product.condition ? CONDITION_CLASSES[product.condition] : '';

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(product);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(product)}
      onKeyDown={handleKey}
      className={styles.card}
      style={{ transform: `rotate(${rotation}deg)` }}
      aria-label={`View ${product.name}`}
    >
      {showTape && <TapeStrip position="tr" />}
      {showPin && <PushPin color={pinColor} position="left" />}
      <div className={styles.cardInner}>
        <div className={styles.photo} style={{ background: gradient }}>
          <span className={styles.preLovedOverlay} aria-hidden="true" />
          <span className={styles.catChip}>{product.category}</span>
          {product.condition && (
            <span className={`${styles.conditionBadge} ${condClass}`}>
              {CONDITION_LABELS[product.condition]}
            </span>
          )}
          <button
            type="button"
            className={styles.heartBtn}
            onClick={(e) => {
              e.stopPropagation();
              onSave(product);
            }}
            aria-label={`Save ${product.name}`}
          >
            <HeartIcon />
          </button>
        </div>
        <div className={styles.info}>
          <h3 className={styles.name}>{product.name}</h3>
          <div className={styles.priceRow}>
            <span className={styles.price}>{product.price}</span>
            {product.originalPrice && (
              <span className={styles.originalPrice}>{product.originalPrice}</span>
            )}
          </div>
          {product.sellerName && (
            <p className={styles.sellerLine}>
              {product.sellerName} from {product.sellerCity}
              {product.sellerMemberSince && ` · Member since ${product.sellerMemberSince}`}
            </p>
          )}
          <button
            type="button"
            className={styles.messageSeller}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(product);
            }}
          >
            Message Seller →
          </button>
          {product.scrawl && (
            <span className={styles.cardScrawl}>{product.scrawl}</span>
          )}
        </div>
      </div>
    </div>
  );
}

function ExhibitionCard({
  exhibition,
  index,
  onSelect,
}: {
  exhibition: Exhibition;
  index: number;
  onSelect: (e: Exhibition) => void;
}) {
  const rotations = [-0.6, 0.5, -0.4];
  const rotation = rotations[index % rotations.length];
  const gradient = `linear-gradient(135deg, ${exhibition.gradientColors[0]} 0%, ${exhibition.gradientColors[1]} 100%)`;
  const statusClass =
    exhibition.status === 'live'
      ? styles.statusLive
      : exhibition.status === 'coming-soon'
        ? styles.statusComing
        : styles.statusArchived;

  const statusLabel =
    exhibition.status === 'live'
      ? 'Live Now'
      : exhibition.status === 'coming-soon'
        ? 'Coming Soon'
        : 'Archived';

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(exhibition);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(exhibition)}
      onKeyDown={handleKey}
      className={styles.exhibitCard}
      style={{ background: gradient, transform: `rotate(${rotation}deg)` }}
      aria-label={`Browse ${exhibition.name}`}
    >
      <TapeStrip position="tl" />
      <span className={`${styles.exhibitStatus} ${statusClass}`}>
        {exhibition.status === 'live' && (
          <span className={styles.liveDot} aria-hidden="true" />
        )}
        {statusLabel}
      </span>
      <div className={styles.exhibitInner}>
        <div className={styles.exhibitEyebrow}>Exhibition · Time-boxed</div>
        <h3 className={styles.exhibitName}>{exhibition.name}</h3>
        <p className={styles.exhibitDesc}>{exhibition.description}</p>
        <div className={styles.exhibitCurator}>
          <span className={styles.creatorAvatar} aria-hidden="true" />
          <span>Curated by {exhibition.curatorName}</span>
        </div>
        <div className={styles.exhibitMeta}>
          <span>{exhibition.dateRange}</span>
          {exhibition.designerCount && (
            <span>
              {exhibition.designerCount} designers · {exhibition.pieceCount} pieces
            </span>
          )}
        </div>
        <button
          type="button"
          className={styles.browseBtn}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(exhibition);
          }}
        >
          Browse Collection →
        </button>
        {exhibition.scrawl && (
          <span className={styles.exhibitScrawl}>{exhibition.scrawl}</span>
        )}
      </div>
    </div>
  );
}

function LoginGate({ target, onClose }: { target: GateTarget; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  let copy: string;
  let scrawl: string;

  if (target.context === 'curated') {
    copy =
      'Log in to view full product details, save to your wishlist, and track orders.';
    scrawl = 'your wishlist is waiting';
  } else if (target.context === 'marketplace') {
    copy =
      'Log in to message the seller, see more photos, and make an offer.';
    scrawl = "this lehenga won't last";
  } else {
    copy =
      'Log in to browse the full collection and save your favorites before the exhibition closes.';
    scrawl = 'the exhibition closes soon';
  }

  return (
    <div
      className={styles.backdrop}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="shopping-gate-heading"
    >
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <TapeStrip position="tl" />
        <TapeStrip position="tr" />
        <button
          type="button"
          className={styles.modalClose}
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        <div className={styles.modalEyebrow}>locked content</div>
        <h2 id="shopping-gate-heading" className={styles.modalHeading}>
          Want to <i style={{ color: 'var(--pink)' }}>see more?</i>
        </h2>
        <p className={styles.modalSub}>{copy}</p>
        <div className={styles.modalScrawl}>{scrawl}</div>
        <div className={styles.modalButtons}>
          <ChunkyButton variant="pink" href="/pricing">
            Log In
          </ChunkyButton>
          <ChunkyButton variant="white" href="/pricing">
            Sign Up Free
          </ChunkyButton>
        </div>
        <button type="button" className={styles.modalDismiss} onClick={onClose}>
          maybe later
        </button>
      </div>
    </div>
  );
}

const TABS: Array<{ value: ProductTab; label: string }> = [
  { value: 'curated', label: 'Curated Picks' },
  { value: 'marketplace', label: 'Marketplace' },
  { value: 'exhibitions', label: 'Exhibitions' },
];

export function ShoppingBrowser() {
  const [tab, setTab] = useState<ProductTab>('curated');
  const [query, setQuery] = useState('');
  const [curatedFilter, setCuratedFilter] = useState<'All' | CuratedCategory>('All');
  const [marketFilter, setMarketFilter] = useState<'All' | MarketplaceCategory>('All');
  const [gateTarget, setGateTarget] = useState<GateTarget | null>(null);
  const [stuck, setStuck] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) setStuck(!entry.isIntersecting);
      },
      { threshold: 0, rootMargin: '-89px 0px 0px 0px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const counts = {
    curated: CURATED_PRODUCTS.length,
    marketplace: MARKETPLACE_LISTINGS.length,
    exhibitions: EXHIBITIONS.length,
  };

  const filteredCurated = useMemo(() => {
    const q = query.trim().toLowerCase();
    return CURATED_PRODUCTS.filter((p) => {
      if (curatedFilter !== 'All' && p.category !== curatedFilter) return false;
      if (!q) return true;
      const hay = [p.name, p.brand ?? '', p.category, p.creatorName ?? '']
        .join(' ')
        .toLowerCase();
      return hay.includes(q);
    });
  }, [query, curatedFilter]);

  const filteredMarketplace = useMemo(() => {
    const q = query.trim().toLowerCase();
    return MARKETPLACE_LISTINGS.filter((p) => {
      if (marketFilter !== 'All' && p.category !== marketFilter) return false;
      if (!q) return true;
      const hay = [p.name, p.category, p.sellerName ?? '', p.sellerCity ?? '']
        .join(' ')
        .toLowerCase();
      return hay.includes(q);
    });
  }, [query, marketFilter]);

  const onProductSelect = (product: PublicProduct) => {
    setGateTarget({
      context: product.type === 'curated' ? 'curated' : 'marketplace',
      product,
    });
  };

  const onExhibitionSelect = (exhibition: Exhibition) => {
    setGateTarget({ context: 'exhibition', exhibition });
  };

  const placeholder =
    tab === 'marketplace'
      ? 'Search pre-loved lehengas, sherwanis, sellers...'
      : 'Search lehengas, décor, jewelry, invitations...';

  const isExhibitions = tab === 'exhibitions';

  return (
    <>
      <div className={styles.searchWrap}>
        <div
          className={`${styles.search} ${isExhibitions ? styles.disabled : ''}`}
        >
          <SearchIcon />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              isExhibitions
                ? 'Search disabled — exhibitions are events, not products'
                : placeholder
            }
            className={styles.searchInput}
            aria-label="Search shopping"
            disabled={isExhibitions}
          />
          {query && !isExhibitions && (
            <button
              type="button"
              className={styles.clearBtn}
              onClick={() => setQuery('')}
              aria-label="Clear search"
            >
              clear
            </button>
          )}
        </div>
      </div>

      <div className={styles.tabBarWrap}>
        <div className={styles.tabBar} role="tablist" aria-label="Shopping tabs">
          {TABS.map((t) => {
            const active = tab === t.value;
            return (
              <button
                key={t.value}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setTab(t.value)}
                className={`${styles.tab} ${active ? styles.tabActive : ''}`}
              >
                {t.label}
                <span className={styles.tabCount}>({counts[t.value]})</span>
              </button>
            );
          })}
        </div>
      </div>

      <div ref={sentinelRef} aria-hidden="true" style={{ height: 1 }} />

      {!isExhibitions && (
        <div className={`${styles.filterBarWrap} ${stuck ? styles.stuck : ''}`}>
          <div className={styles.filterRow} role="tablist" aria-label="Categories">
            {tab === 'curated'
              ? (['All', ...CURATED_CATEGORIES] as const).map((cat) => {
                  const active = curatedFilter === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => setCuratedFilter(cat)}
                      className={`${styles.pill} ${active ? styles.pillActive : ''}`}
                    >
                      {cat}
                    </button>
                  );
                })
              : (['All', ...MARKETPLACE_CATEGORIES] as const).map((cat) => {
                  const active = marketFilter === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => setMarketFilter(cat)}
                      className={`${styles.pill} ${active ? styles.pillActive : ''}`}
                    >
                      {cat}
                    </button>
                  );
                })}
          </div>
        </div>
      )}

      <div className={styles.gridWrap}>
        {tab === 'curated' &&
          (filteredCurated.length === 0 ? (
            <div className={styles.empty}>
              <TapeStrip position="center" />
              <div className={styles.emptyTitle}>
                Nothing found for "{query}"
              </div>
              <div className={styles.emptyBody}>Try a different search?</div>
              <ScrawlNote>new picks added every week</ScrawlNote>
            </div>
          ) : (
            <div className={styles.grid}>
              {filteredCurated.map((p, idx) => (
                <CuratedCard
                  key={p.id}
                  product={p}
                  index={idx}
                  onSelect={onProductSelect}
                  onSave={onProductSelect}
                />
              ))}
            </div>
          ))}

        {tab === 'marketplace' &&
          (filteredMarketplace.length === 0 ? (
            <div className={styles.empty}>
              <TapeStrip position="center" />
              <div className={styles.emptyTitle}>
                Nothing found for "{query}"
              </div>
              <div className={styles.emptyBody}>
                Try another category, or check back tomorrow
              </div>
              <ScrawlNote>new listings drop daily</ScrawlNote>
            </div>
          ) : (
            <div className={styles.grid}>
              {filteredMarketplace.map((p, idx) => (
                <MarketplaceCard
                  key={p.id}
                  product={p}
                  index={idx}
                  onSelect={onProductSelect}
                  onSave={onProductSelect}
                />
              ))}
            </div>
          ))}

        {isExhibitions && (
          <div className={styles.exhibitionGrid}>
            {EXHIBITIONS.map((ex, idx) => (
              <ExhibitionCard
                key={ex.id}
                exhibition={ex}
                index={idx}
                onSelect={onExhibitionSelect}
              />
            ))}
          </div>
        )}
      </div>

      {gateTarget && (
        <LoginGate target={gateTarget} onClose={() => setGateTarget(null)} />
      )}
    </>
  );
}
