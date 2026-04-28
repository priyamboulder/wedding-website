"use client";

import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Flag,
  Heart,
  Mail,
  MapPin,
  MessageCircle,
  Package,
  Truck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TopNav } from "@/components/shell/TopNav";
import { ExhibitionBanner } from "@/components/exhibitions/ExhibitionBanner";
import {
  useMarketplaceStore,
  CURRENT_USER_ID,
} from "@/stores/marketplace-store";
import {
  ConditionBadge,
  Eyebrow,
  GradientImage,
  ListingCard,
  ListingTypePill,
  MarketplaceTabBar,
  VerifiedSellerBadge,
} from "@/components/marketplace/primitives";
import { InquiryThread } from "@/components/marketplace/InquiryThread";
import { ReportListingModal } from "@/components/marketplace/ReportListingModal";
import {
  discountPct,
  formatPrice,
  relativeTime,
} from "@/lib/marketplace/utils";
import { type MarketplaceListing } from "@/types/marketplace";
import { STORE_CATEGORY_LABEL, STORE_PRODUCTS } from "@/lib/store-seed";
import {
  findCrossTabMatches,
  unifiedFromMarketplace,
} from "@/lib/shopping/cross-tab-matches";
import type { StoreProduct } from "@/lib/link-preview/types";

export default function ListingDetailPage({
  params,
}: {
  params: Promise<{ weddingId: string; id: string }>;
}) {
  const { weddingId, id } = use(params);
  const router = useRouter();

  const listings = useMarketplaceStore((s) => s.listings);
  const categoriesAll = useMarketplaceStore((s) => s.categories);
  const saves = useMarketplaceStore((s) => s.saves);
  const toggleSave = useMarketplaceStore((s) => s.toggleSave);
  const incrementView = useMarketplaceStore((s) => s.incrementView);
  const reportListing = useMarketplaceStore((s) => s.reportListing);

  const listing = useMemo(
    () => listings.find((l) => l.id === id),
    [listings, id],
  );
  const category = useMemo(
    () =>
      listing
        ? categoriesAll.find((c) => c.slug === listing.category)
        : undefined,
    [categoriesAll, listing],
  );
  const related = useMemo(() => {
    if (!listing) return [];
    return listings
      .filter(
        (l) =>
          l.id !== listing.id &&
          l.status === "active" &&
          (l.category === listing.category ||
            l.tags.some((t) => listing.tags.includes(t))),
      )
      .slice(0, 4);
  }, [listings, listing]);

  const crossTab = useMemo(() => {
    if (!listing) return null;
    const unified = unifiedFromMarketplace(listing.category);
    if (unified === "other") return null;
    return findCrossTabMatches({
      unified,
      excludeMarketplaceIds: [listing.id],
      storeProducts: STORE_PRODUCTS,
      marketplaceListings: listings,
      limitPerTab: 4,
    });
  }, [listing, listings]);

  const savedIds = useMemo(() => {
    const s = new Set<string>();
    for (const x of saves) if (x.user_id === CURRENT_USER_ID) s.add(x.listing_id);
    return s;
  }, [saves]);

  const [activeImage, setActiveImage] = useState(0);
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  useEffect(() => {
    if (listing) incrementView(listing.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!listing) {
    return (
      <div className="flex min-h-screen flex-col bg-ivory">
        <TopNav />
        <ExhibitionBanner weddingId={weddingId} />
        <MarketplaceTabBar weddingId={weddingId} active="marketplace" />
        <main className="mx-auto flex max-w-[680px] flex-1 flex-col items-center justify-center gap-4 px-6 py-20 text-center">
          <h1 className="font-serif text-[26px] text-ink">
            This listing isn&rsquo;t available.
          </h1>
          <p className="text-[13px] text-ink-muted">
            It may have been sold, removed, or the link is incorrect.
          </p>
          <Link
            href={`/${weddingId}/shopping/marketplace`}
            className="rounded-md bg-ink px-4 py-2 text-[12px] font-medium text-ivory hover:opacity-90"
          >
            Back to marketplace
          </Link>
        </main>
      </div>
    );
  }

  const saved = savedIds.has(listing.id);
  const country = listing.seller_location_country;
  const priceStr = formatPrice(listing.price_cents, country);
  const originalStr = listing.original_price_cents
    ? formatPrice(listing.original_price_cents, country)
    : null;
  const pct = discountPct(listing.price_cents, listing.original_price_cents);
  const gradients = listing.image_gradients ?? [];
  const gallery = gradients.length > 0 ? gradients : [undefined];
  const isOwnListing = listing.seller_id === CURRENT_USER_ID;

  return (
    <div className="flex min-h-screen flex-col bg-ivory">
      <TopNav />
      <ExhibitionBanner weddingId={weddingId} />
      <MarketplaceTabBar weddingId={weddingId} active="marketplace" />

      <main className="mx-auto w-full max-w-[1100px] flex-1 px-6 py-10 lg:px-10">
        <Link
          href={`/${weddingId}/shopping/marketplace`}
          className="mb-8 inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-muted transition-colors hover:text-ink"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          <ArrowLeft size={10} strokeWidth={2} /> Back to marketplace
        </Link>

        {/* Top: image carousel + details */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
          {/* Left — carousel */}
          <div className="flex flex-col gap-3">
            <div className="relative overflow-hidden rounded-xl border border-gold/15 bg-white">
              <GradientImage
                gradient={gallery[activeImage]}
                ratio="4/5"
                label={listing.title}
              />
              <div className="absolute left-4 top-4">
                <ListingTypePill type={listing.listing_type} />
              </div>
              <div
                className="absolute bottom-4 left-4 rounded-full bg-ink/70 px-2.5 py-0.5 font-mono text-[10px] text-ivory backdrop-blur-sm"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {activeImage + 1} / {gallery.length}
              </div>
            </div>
            {gallery.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {gallery.map((g, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActiveImage(i)}
                    aria-label={`View image ${i + 1}`}
                    className={cn(
                      "h-16 w-16 shrink-0 overflow-hidden rounded-md border transition-all",
                      activeImage === i
                        ? "border-ink shadow-sm"
                        : "border-gold/15 opacity-80 hover:opacity-100",
                    )}
                  >
                    <GradientImage gradient={g} ratio="1/1" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right — price + details + CTAs */}
          <div className="flex flex-col gap-6">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <ConditionBadge condition={listing.condition} />
                {category && (
                  <span
                    className="font-mono text-[9.5px] uppercase tracking-[0.2em] text-ink-faint"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {category.emoji} {category.label}
                  </span>
                )}
              </div>
              <h1 className="mt-3 font-serif text-[30px] leading-[1.05] tracking-tight text-ink sm:text-[34px]">
                {listing.title}
              </h1>
              <p
                className="mt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                listed {relativeTime(listing.created_at)}
              </p>
            </div>

            {/* Price */}
            <div className="rounded-xl border border-gold/20 bg-white p-5">
              {listing.listing_type === "free" ? (
                <p className="font-serif text-[28px] text-rose">
                  FREE <span className="text-[14px] text-ink-muted">· give it a new home</span>
                </p>
              ) : listing.listing_type === "rent" ? (
                <>
                  <p className="font-serif text-[30px] text-ink">
                    {priceStr}
                    <span className="ml-1 text-[13px] text-ink-muted">/ event</span>
                  </p>
                  {listing.rental_deposit_cents && (
                    <p className="mt-1 text-[12px] text-ink-muted">
                      Security deposit{" "}
                      {formatPrice(listing.rental_deposit_cents, country)}
                      {listing.rental_duration_days
                        ? ` · ${listing.rental_duration_days}-day rental`
                        : ""}
                    </p>
                  )}
                </>
              ) : (
                <>
                  <p className="flex flex-wrap items-baseline gap-x-3">
                    <span className="font-serif text-[30px] text-ink">
                      {priceStr}
                    </span>
                    {originalStr && (
                      <span
                        className="font-mono text-[12px] text-ink-faint line-through"
                        style={{ fontFamily: "var(--font-mono)" }}
                      >
                        {originalStr}
                      </span>
                    )}
                    {pct != null && pct >= 10 && (
                      <span
                        className="rounded-full bg-gold-pale/60 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-gold"
                        style={{ fontFamily: "var(--font-mono)" }}
                      >
                        {pct}% off
                      </span>
                    )}
                  </p>
                  {listing.price_is_negotiable && (
                    <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-muted" style={{ fontFamily: "var(--font-mono)" }}>
                      Open to offers
                    </p>
                  )}
                  {listing.listing_type === "sell_or_rent" &&
                    listing.rental_deposit_cents && (
                      <p className="mt-2 text-[12px] text-ink-muted">
                        Also available for rent · deposit{" "}
                        {formatPrice(listing.rental_deposit_cents, country)}
                      </p>
                    )}
                </>
              )}
            </div>

            {/* Details block */}
            <DetailGrid listing={listing} />

            {/* Logistics */}
            <LogisticsBlock listing={listing} />

            {/* CTAs */}
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => toggleSave(listing.id)}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-md border px-4 py-2.5 text-[13px] font-medium transition-all",
                  saved
                    ? "border-rose/40 bg-rose-pale/30 text-rose"
                    : "border-border bg-white text-ink hover:border-rose/30 hover:text-rose",
                )}
              >
                <Heart
                  size={14}
                  strokeWidth={1.8}
                  fill={saved ? "currentColor" : "none"}
                />
                {saved ? "Saved" : "Save for later"}
              </button>
              {!isOwnListing ? (
                <button
                  type="button"
                  onClick={() => setInquiryOpen(true)}
                  className="flex items-center justify-center gap-2 rounded-md bg-ink px-4 py-2.5 text-[13px] font-medium text-ivory transition-opacity hover:opacity-90"
                >
                  <Mail size={14} strokeWidth={1.8} />
                  Message {listing.seller_display_name}
                </button>
              ) : (
                <Link
                  href={`/${weddingId}/shopping/marketplace/mine`}
                  className="flex items-center justify-center gap-2 rounded-md bg-ink px-4 py-2.5 text-[13px] font-medium text-ivory transition-opacity hover:opacity-90"
                >
                  Manage my listing
                </Link>
              )}
              <button
                type="button"
                onClick={() => setReportOpen(true)}
                className="mt-1 flex items-center justify-center gap-1.5 text-[11px] text-ink-muted transition-colors hover:text-ink"
              >
                <Flag size={10} strokeWidth={1.8} />
                Report this listing
              </button>
            </div>
          </div>
        </div>

        {/* Description */}
        <section className="mt-16">
          <Eyebrow className="mb-5">full description</Eyebrow>
          <div className="max-w-2xl space-y-3 font-serif text-[15px] italic leading-[1.75] text-ink-soft">
            {listing.description.split("\n\n").map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
          {listing.tags.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {listing.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-full bg-ivory-warm px-2.5 py-1 font-mono text-[10px] text-ink-muted"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  #{t.replace(/\s+/g, "")}
                </span>
              ))}
            </div>
          )}
        </section>

        {/* Seller */}
        <section className="mt-16">
          <Eyebrow className="mb-5">about the seller</Eyebrow>
          <SellerCard listing={listing} />
        </section>

        {/* Related */}
        {related.length > 0 && (
          <section className="mt-16">
            <Eyebrow className="mb-5">you might also like</Eyebrow>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {related.map((l) => (
                <ListingCard
                  key={l.id}
                  listing={l}
                  weddingId={weddingId}
                  saved={savedIds.has(l.id)}
                  onToggleSave={() => toggleSave(l.id)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Cross-tab — Our Store */}
        {crossTab && crossTab.store.length > 0 && (
          <section className="mt-16">
            <Eyebrow className="mb-5">available new in our catalog</Eyebrow>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {crossTab.store.map((p) => (
                <StoreCrossTabCard
                  key={p.id}
                  product={p}
                  weddingId={weddingId}
                />
              ))}
            </div>
          </section>
        )}
      </main>

      {inquiryOpen && (
        <InquiryThread
          listingId={listing.id}
          weddingId={weddingId}
          open={inquiryOpen}
          onClose={() => setInquiryOpen(false)}
        />
      )}

      {reportOpen && (
        <ReportListingModal
          onClose={() => setReportOpen(false)}
          onSubmit={(reason, details) => {
            reportListing(listing.id, reason, details);
            setReportOpen(false);
          }}
        />
      )}

      {/* Soft nudge back to browse on mobile */}
      <button
        type="button"
        onClick={() => router.back()}
        className="sr-only"
        aria-hidden
      />
    </div>
  );
}

function DetailGrid({ listing }: { listing: MarketplaceListing }) {
  const rows: { label: string; value?: string | number | null }[] = [
    { label: "Condition", value: listing.condition.replace(/_/g, " ") },
    { label: "Brand", value: listing.brand },
    { label: "Size", value: listing.size },
    { label: "Color", value: listing.color },
    { label: "Purchased", value: listing.purchase_year },
    {
      label: "Times used",
      value:
        listing.times_used === 0
          ? "Never worn"
          : listing.times_used
            ? `${listing.times_used}`
            : null,
    },
  ].filter((r) => r.value != null && r.value !== "");

  if (rows.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-2 rounded-xl border border-ink/5 bg-white/60 p-5">
      {rows.map((r) => (
        <div key={r.label} className="flex flex-col gap-0.5">
          <span
            className="font-mono text-[9.5px] uppercase tracking-[0.2em] text-ink-faint"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {r.label}
          </span>
          <span className="text-[12.5px] capitalize text-ink">{r.value}</span>
        </div>
      ))}
    </div>
  );
}

function LogisticsBlock({ listing }: { listing: MarketplaceListing }) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-ink/5 bg-white/60 p-5 text-[12.5px] text-ink">
      <div className="flex items-center gap-2">
        <MapPin size={13} strokeWidth={1.6} className="text-ink-muted" />
        <span>
          {listing.seller_location_city}
          {listing.seller_location_state
            ? `, ${listing.seller_location_state}`
            : ""}
          {listing.seller_location_country !== "India"
            ? `, ${listing.seller_location_country}`
            : ""}
        </span>
      </div>
      {listing.local_pickup && (
        <div className="flex items-center gap-2">
          <Package size={13} strokeWidth={1.6} className="text-ink-muted" />
          <span>Local pickup available</span>
        </div>
      )}
      {listing.shipping_available ? (
        <div className="flex items-start gap-2">
          <Truck size={13} strokeWidth={1.6} className="mt-0.5 shrink-0 text-ink-muted" />
          <span>
            Shipping available
            {listing.shipping_notes ? ` — ${listing.shipping_notes}` : ""}
          </span>
        </div>
      ) : (
        <div className="flex items-start gap-2 text-ink-muted">
          <Truck size={13} strokeWidth={1.6} className="mt-0.5 shrink-0" />
          <span>No shipping — local pickup only</span>
        </div>
      )}
    </div>
  );
}

function SellerCard({ listing }: { listing: MarketplaceListing }) {
  const memberSince = listing.seller_member_since
    ? new Date(listing.seller_member_since).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : null;
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-gold/15 bg-white p-6 md:flex-row md:items-start">
      <div
        className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full font-serif text-[22px] text-ivory"
        style={{
          background:
            listing.seller_avatar_gradient ??
            "linear-gradient(135deg, #B8860B 0%, #D4A843 50%, #F0E4C8 100%)",
        }}
      >
        {listing.seller_display_name.charAt(0)}
      </div>
      <div className="flex-1">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="font-serif text-[18px] text-ink">
            {listing.seller_display_name}
          </span>
          {listing.seller_is_verified && <VerifiedSellerBadge size="md" />}
          {memberSince && (
            <span
              className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Member since {memberSince}
            </span>
          )}
        </div>
        <p
          className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {listing.seller_city}
          {listing.seller_state ? `, ${listing.seller_state}` : ""}
          {(listing.seller_items_listed ?? 0) > 0 && (
            <>
              <span aria-hidden className="mx-1">·</span>
              {listing.seller_items_listed} listed
              {(listing.seller_items_sold ?? 0) > 0 &&
                ` · ${listing.seller_items_sold} sold`}
            </>
          )}
        </p>
        {listing.seller_bio && (
          <p className="mt-3 max-w-xl font-serif text-[14px] italic leading-relaxed text-ink-soft">
            &ldquo;{listing.seller_bio}&rdquo;
          </p>
        )}
        {listing.seller_typical_response && (
          <p className="mt-3 inline-flex items-center gap-1.5 text-[11.5px] text-ink-muted">
            <MessageCircle size={11} strokeWidth={1.6} />
            Typically responds {listing.seller_typical_response}
          </p>
        )}
      </div>
    </div>
  );
}

function StoreCrossTabCard({
  product,
  weddingId,
}: {
  product: StoreProduct;
  weddingId: string;
}) {
  return (
    <Link
      href={`/${weddingId}/shopping?mode=ananya_store`}
      className="group flex flex-col overflow-hidden rounded-xl border border-gold/15 bg-white transition-all hover:border-gold/35 hover:shadow-md"
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-ivory-warm">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.heroImage}
          alt={product.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          loading="lazy"
        />
        <span
          className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full border border-gold/40 bg-white/95 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.2em] text-gold shadow-sm"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Our Store
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <h3 className="line-clamp-2 font-serif text-[14.5px] leading-tight text-ink">
          {product.title}
        </h3>
        <span
          className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {STORE_CATEGORY_LABEL[product.category]}
        </span>
        <span
          className="mt-auto font-mono text-[13px] font-semibold text-saffron"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: product.currency,
            maximumFractionDigits: 0,
          }).format(product.basePrice)}
        </span>
      </div>
    </Link>
  );
}

