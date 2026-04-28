"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Edit3,
  MessageCircle,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TopNav } from "@/components/shell/TopNav";
import { ExhibitionBanner } from "@/components/exhibitions/ExhibitionBanner";
import {
  useMarketplaceStore,
  CURRENT_USER_ID,
} from "@/stores/marketplace-store";
import {
  Eyebrow,
  GradientImage,
  MarketplaceTabBar,
} from "@/components/marketplace/primitives";
import { formatPrice, relativeTime } from "@/lib/marketplace/utils";
import type {
  ListingStatus,
  MarketplaceListing,
} from "@/types/marketplace";

export default function MyListingsPage({
  params,
}: {
  params: Promise<{ weddingId: string }>;
}) {
  const { weddingId } = use(params);
  const listings = useMarketplaceStore((s) => s.listings);
  const inquiries = useMarketplaceStore((s) => s.inquiries);
  const setStatus = useMarketplaceStore((s) => s.setListingStatus);
  const deleteListing = useMarketplaceStore((s) => s.deleteListing);
  const relistListing = useMarketplaceStore((s) => s.relistListing);

  const myListings = useMemo(
    () =>
      listings
        .filter((l) => l.seller_id === CURRENT_USER_ID)
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime(),
        ),
    [listings],
  );
  const buyerInquiries = useMemo(
    () => inquiries.filter((i) => i.buyer_id === CURRENT_USER_ID),
    [inquiries],
  );
  const sellerInquiries = useMemo(
    () => inquiries.filter((i) => i.seller_id === CURRENT_USER_ID),
    [inquiries],
  );
  const listingsById = useMemo(() => {
    const map = new Map<string, MarketplaceListing>();
    for (const l of listings) map.set(l.id, l);
    return map;
  }, [listings]);
  const getListing = (id: string) => listingsById.get(id);

  const [tab, setTab] = useState<"listings" | "messages">("listings");

  const counts = useMemo(() => {
    let active = 0;
    let sold = 0;
    let draft = 0;
    for (const l of myListings) {
      if (l.status === "active") active++;
      else if (l.status === "sold" || l.status === "rented") sold++;
      else if (l.status === "draft") draft++;
    }
    return { active, sold, draft };
  }, [myListings]);

  return (
    <div className="flex min-h-screen flex-col bg-ivory">
      <TopNav>
        <Link
          href={`/${weddingId}/shopping/marketplace/new`}
          className="inline-flex items-center gap-1.5 rounded-md bg-ink px-3 py-1.5 text-[12px] font-medium text-ivory transition-opacity hover:opacity-90"
        >
          <Plus size={12} strokeWidth={1.8} />
          List an item
        </Link>
      </TopNav>

      <ExhibitionBanner weddingId={weddingId} />

      <MarketplaceTabBar weddingId={weddingId} active="mine" />

      <main className="mx-auto w-full max-w-[1100px] flex-1 px-6 py-10 lg:px-10">
        <Link
          href={`/${weddingId}/shopping/marketplace`}
          className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-muted transition-colors hover:text-ink"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          <ArrowLeft size={10} strokeWidth={2} /> Back to marketplace
        </Link>

        <p
          className="mt-5 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Pre-Loved · My Activity
        </p>
        <h1 className="mt-2 font-serif text-[32px] leading-[1.05] tracking-tight text-ink sm:text-[38px]">
          your pre-loved corner.
        </h1>
        <p
          className="mt-3 font-mono text-[11px] uppercase tracking-[0.18em] text-ink-faint"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {counts.active} active · {counts.sold} sold/rented · {counts.draft}{" "}
          draft
        </p>

        {/* Sub-tabs: listings / messages */}
        <div className="mt-8 flex items-center gap-1 rounded-full border border-border bg-white p-0.5 w-fit">
          {[
            { k: "listings", label: "My listings" },
            { k: "messages", label: "Messages" },
          ].map((t) => (
            <button
              key={t.k}
              type="button"
              onClick={() => setTab(t.k as "listings" | "messages")}
              aria-pressed={tab === t.k}
              className={cn(
                "rounded-full px-4 py-1.5 text-[12px] font-medium transition-colors",
                tab === t.k
                  ? "bg-ink text-ivory"
                  : "text-ink-muted hover:bg-ivory-warm hover:text-ink",
              )}
            >
              {t.label}
              {t.k === "messages" &&
                buyerInquiries.length + sellerInquiries.length > 0 && (
                  <span
                    className="ml-1.5 rounded-full bg-gold-pale/60 px-1.5 font-mono text-[9.5px] text-gold"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {buyerInquiries.length + sellerInquiries.length}
                  </span>
                )}
            </button>
          ))}
        </div>

        {tab === "listings" ? (
          <section className="mt-8">
            {myListings.length === 0 ? (
              <EmptyMyListings weddingId={weddingId} />
            ) : (
              <div className="flex flex-col gap-3">
                {myListings.map((l) => (
                  <MyListingRow
                    key={l.id}
                    listing={l}
                    weddingId={weddingId}
                    onMarkSold={() =>
                      setStatus(
                        l.id,
                        (l.listing_type === "rent"
                          ? "rented"
                          : "sold") as ListingStatus,
                      )
                    }
                    onRemove={() => deleteListing(l.id)}
                    onRelist={() => relistListing(l.id)}
                  />
                ))}
              </div>
            )}
          </section>
        ) : (
          <section className="mt-8">
            <Messages
              weddingId={weddingId}
              buyer={buyerInquiries}
              seller={sellerInquiries}
              getListing={getListing}
            />
          </section>
        )}
      </main>
    </div>
  );
}

function MyListingRow({
  listing,
  weddingId,
  onMarkSold,
  onRemove,
  onRelist,
}: {
  listing: MarketplaceListing;
  weddingId: string;
  onMarkSold: () => void;
  onRemove: () => void;
  onRelist: () => void;
}) {
  const dotColor =
    listing.status === "active"
      ? "bg-sage"
      : listing.status === "sold" || listing.status === "rented"
        ? "bg-gold"
        : listing.status === "expired"
          ? "bg-ink-faint"
          : "bg-rose";

  const statusLabel =
    listing.status === "active"
      ? "Active"
      : listing.status === "sold"
        ? "SOLD"
        : listing.status === "rented"
          ? "RENTED"
          : listing.status === "draft"
            ? "Draft"
            : listing.status === "expired"
              ? "Expired"
              : "Removed";

  const country = listing.seller_location_country;
  const priceStr =
    listing.listing_type === "free"
      ? "FREE"
      : listing.listing_type === "rent"
        ? `${formatPrice(listing.price_cents, country)} / event`
        : formatPrice(listing.price_cents, country);

  const isClosed =
    listing.status === "sold" ||
    listing.status === "rented" ||
    listing.status === "expired" ||
    listing.status === "removed";

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-gold/15 bg-white p-4 sm:flex-row sm:items-center">
      <Link
        href={`/${weddingId}/shopping/marketplace/${listing.id}`}
        className="h-24 w-24 shrink-0 overflow-hidden rounded-md"
      >
        <GradientImage
          gradient={listing.image_gradients?.[0]}
          ratio="1/1"
        />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex flex-wrap items-baseline gap-x-3">
          <Link
            href={`/${weddingId}/shopping/marketplace/${listing.id}`}
            className="truncate font-serif text-[16px] text-ink hover:text-gold"
          >
            {listing.title}
          </Link>
          <span className="font-serif text-[14px] text-ink-muted">{priceStr}</span>
        </div>
        <div
          className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-muted"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          <span className="inline-flex items-center gap-1.5">
            <span className={cn("h-1.5 w-1.5 rounded-full", dotColor)} />
            {statusLabel}
          </span>
          <span aria-hidden>·</span>
          <span>Listed {relativeTime(listing.created_at)}</span>
          <span aria-hidden>·</span>
          <span>{listing.view_count} views</span>
          <span aria-hidden>·</span>
          <span>{listing.save_count} saves</span>
          <span aria-hidden>·</span>
          <span>
            {listing.inquiry_count} inquir
            {listing.inquiry_count === 1 ? "y" : "ies"}
          </span>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 sm:flex-col sm:items-end">
        {!isClosed && (
          <>
            <Link
              href={`/${weddingId}/shopping/marketplace/${listing.id}`}
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-white px-3 py-1.5 text-[11.5px] text-ink-muted transition-colors hover:border-gold/30 hover:text-ink"
            >
              <Edit3 size={11} strokeWidth={1.8} />
              Preview
            </Link>
            <button
              type="button"
              onClick={onMarkSold}
              className="inline-flex items-center gap-1.5 rounded-md border border-gold/30 bg-gold-pale/30 px-3 py-1.5 text-[11.5px] font-medium text-gold transition-colors hover:bg-gold-pale/60"
            >
              <Check size={11} strokeWidth={2} />
              Mark as{" "}
              {listing.listing_type === "rent" ? "rented" : "sold"}
            </button>
            <button
              type="button"
              onClick={onRemove}
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-white px-3 py-1.5 text-[11.5px] text-ink-muted transition-colors hover:border-rose/40 hover:text-rose"
            >
              <Trash2 size={11} strokeWidth={1.8} />
              Remove
            </button>
          </>
        )}
        {isClosed && listing.status !== "removed" && (
          <button
            type="button"
            onClick={onRelist}
            className="inline-flex items-center gap-1.5 rounded-md bg-ink px-3 py-1.5 text-[11.5px] font-medium text-ivory transition-opacity hover:opacity-90"
          >
            <RefreshCw size={11} strokeWidth={1.8} />
            Relist
          </button>
        )}
      </div>
    </div>
  );
}

function EmptyMyListings({ weddingId }: { weddingId: string }) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-gold/25 bg-white px-6 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gold-pale/40 text-gold text-[28px]">
        🏷️
      </div>
      <h2 className="font-serif text-[22px] text-ink">
        You haven&rsquo;t listed anything yet.
      </h2>
      <p className="max-w-md text-[13px] text-ink-muted">
        Most brides start a few weeks after the wedding — once things are dry
        cleaned and you know what you&rsquo;re keeping. No rush.
      </p>
      <Link
        href={`/${weddingId}/shopping/marketplace/new`}
        className="mt-2 inline-flex items-center gap-2 rounded-md bg-ink px-4 py-2 text-[12px] font-medium text-ivory hover:opacity-90"
      >
        <Plus size={12} strokeWidth={1.8} />
        List your first item
      </Link>
    </div>
  );
}

function Messages({
  weddingId,
  buyer,
  seller,
  getListing,
}: {
  weddingId: string;
  buyer: ReturnType<typeof useMarketplaceStore.getState>["inquiries"];
  seller: ReturnType<typeof useMarketplaceStore.getState>["inquiries"];
  getListing: (id: string) => MarketplaceListing | undefined;
}) {
  if (buyer.length === 0 && seller.length === 0) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-gold/25 bg-white px-6 py-16 text-center">
        <MessageCircle size={26} strokeWidth={1.3} className="text-gold" />
        <h2 className="font-serif text-[20px] text-ink">No messages yet</h2>
        <p className="max-w-md text-[13px] text-ink-muted">
          When you message a seller — or someone messages you about an item —
          the conversations will show up here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {buyer.length > 0 && (
        <div>
          <Eyebrow className="mb-4">items you&rsquo;re asking about</Eyebrow>
          <div className="flex flex-col gap-2">
            {buyer.map((i) => {
              const l = getListing(i.listing_id);
              if (!l) return null;
              const last = i.messages[i.messages.length - 1];
              return (
                <Link
                  key={i.id}
                  href={`/${weddingId}/shopping/marketplace/${l.id}`}
                  className="flex items-center gap-3 rounded-xl border border-gold/15 bg-white p-3 transition-colors hover:bg-ivory-warm"
                >
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-md">
                    <GradientImage
                      gradient={l.image_gradients?.[0]}
                      ratio="1/1"
                    />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-[13px] text-ink">
                      {l.title}
                    </span>
                    <span
                      className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      with {i.seller_display_name}
                    </span>
                    {last && (
                      <span className="mt-0.5 truncate text-[12px] text-ink-muted">
                        {last.sender_id === i.buyer_id ? "You: " : `${last.sender_display_name}: `}
                        {last.body}
                      </span>
                    )}
                  </div>
                  <span
                    className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {relativeTime(i.updated_at)}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
      {seller.length > 0 && (
        <div>
          <Eyebrow className="mb-4">inquiries on your listings</Eyebrow>
          <div className="flex flex-col gap-2">
            {seller.map((i) => {
              const l = getListing(i.listing_id);
              if (!l) return null;
              const last = i.messages[i.messages.length - 1];
              return (
                <Link
                  key={i.id}
                  href={`/${weddingId}/shopping/marketplace/${l.id}`}
                  className="flex items-center gap-3 rounded-xl border border-gold/15 bg-white p-3 transition-colors hover:bg-ivory-warm"
                >
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-md">
                    <GradientImage
                      gradient={l.image_gradients?.[0]}
                      ratio="1/1"
                    />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-[13px] text-ink">
                      {l.title}
                    </span>
                    <span
                      className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {i.buyer_display_name} is interested
                    </span>
                    {last && (
                      <span className="mt-0.5 truncate text-[12px] text-ink-muted">
                        {last.sender_id === i.seller_id ? "You: " : `${last.sender_display_name}: `}
                        {last.body}
                      </span>
                    )}
                  </div>
                  <span
                    className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {relativeTime(i.updated_at)}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
