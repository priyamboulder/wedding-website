"use client";

import { use, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Bookmark, BookmarkCheck, UserPlus } from "lucide-react";
import { TopNav } from "@/components/shell/TopNav";
import {
  CreatorAvatar,
  formatFollowerCount,
} from "@/components/creators/CreatorAvatar";
import { DropCountdown } from "@/components/drops/DropCountdown";
import { DropCard } from "@/components/drops/DropCard";
import { useDropsStore } from "@/stores/drops-store";
import { useCreatorsStore } from "@/stores/creators-store";
import { useNotificationsStore } from "@/stores/notifications-store";
import { getStoreProduct } from "@/lib/store-seed";
import { getDropTimingStatus } from "@/types/drop";

export default function DropDetailPage({
  params,
}: {
  params: Promise<{ weddingId: string; slug: string }>;
}) {
  const { weddingId, slug } = use(params);

  const drop = useDropsStore((s) => s.getDropBySlug(slug));
  const items = useDropsStore((s) =>
    drop ? s.getItems(drop.id) : [],
  );
  const allDrops = useDropsStore((s) => s.drops);
  const allItems = useDropsStore((s) => s.items);
  const isSaved = useDropsStore((s) =>
    drop ? s.isSaved(drop.id) : false,
  );
  const toggleSave = useDropsStore((s) => s.toggleSave);
  const trackView = useDropsStore((s) => s.trackView);
  const creator = useCreatorsStore((s) =>
    drop ? s.creators.find((c) => c.id === drop.creatorId) : undefined,
  );
  const isFollowing = useCreatorsStore((s) =>
    drop ? s.isFollowing(drop.creatorId) : false,
  );
  const toggleFollow = useCreatorsStore((s) => s.toggleFollow);
  const addNotification = useNotificationsStore((s) => s.addNotification);

  useEffect(() => {
    if (drop) trackView(drop.id);
    // Run once on mount per drop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drop?.id]);

  if (!drop || !creator) {
    return (
      <div className="flex min-h-screen flex-col bg-white">
        <TopNav />
        <div className="m-auto text-[13px] italic text-ink-muted">
          Drop not found.
        </div>
      </div>
    );
  }

  const timing = getDropTimingStatus(drop);
  const otherCreatorDrops = allDrops.filter(
    (d) => d.creatorId === drop.creatorId && d.id !== drop.id,
  );

  const handleSave = () => {
    toggleSave(drop.id);
    if (!isSaved) {
      addNotification({
        type: "drop_reminder_24h",
        recipient: "couple",
        title: `Saved "${drop.title}"`,
        body: "We'll remind you before it ends.",
        link: `/${weddingId}/shopping/drops/${drop.slug}`,
        actor_name: creator.displayName,
      });
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <TopNav />

      {/* Hero */}
      <section
        className="relative overflow-hidden"
        style={{
          background: `linear-gradient(180deg, ${drop.accentColor}E6 0%, ${drop.accentColor}99 100%), url(${drop.coverImageUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundBlendMode: "multiply",
        }}
      >
        <div className="mx-auto max-w-6xl px-6 py-12 text-white">
          <Link
            href={`/${weddingId}/shopping`}
            className="inline-flex items-center gap-1 font-mono text-[10.5px] uppercase tracking-[0.22em] text-white/80 hover:text-white"
          >
            <ArrowLeft size={11} strokeWidth={1.6} />
            Back to shopping
          </Link>
          <p className="mt-6 font-mono text-[10.5px] uppercase tracking-[0.28em] text-white/85">
            {timing === "active"
              ? "Style drop · Live now"
              : timing === "scheduled"
                ? "Style drop · Coming soon"
                : "Style drop · Archived"}{" "}
            · #{drop.themeTag}
          </p>
          <h1
            className="mt-2 max-w-2xl text-[44px] leading-[1.05]"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 500,
              letterSpacing: "-0.01em",
            }}
          >
            {drop.title}
          </h1>
          <p className="mt-3 max-w-xl text-[15px] leading-snug text-white/90">
            {drop.description}
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-4">
            <Link
              href={`/community/creators/${creator.id}`}
              className="flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 backdrop-blur-sm transition-colors hover:bg-white/25"
            >
              <CreatorAvatar creator={creator} size="sm" withBadge={false} />
              <div className="text-left">
                <p className="text-[13px] font-medium leading-tight">
                  {creator.displayName}
                </p>
                <p className="font-mono text-[10px] uppercase tracking-wider text-white/80">
                  {formatFollowerCount(creator.followerCount)} followers
                </p>
              </div>
            </Link>
            <DropCountdown
              startsAt={drop.startsAt}
              endsAt={drop.endsAt}
              variant="hero"
            />
            <span className="font-mono text-[11px] uppercase tracking-wider text-white/85">
              {items.length} pieces · {drop.viewCount.toLocaleString()} views
            </span>
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 rounded-md bg-white px-3.5 py-2 text-[12.5px] font-medium text-ink hover:bg-white/90"
            >
              {isSaved ? (
                <>
                  <BookmarkCheck size={13} strokeWidth={1.8} /> Saved
                </>
              ) : (
                <>
                  <Bookmark size={13} strokeWidth={1.8} /> Save this drop
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => toggleFollow(creator.id)}
              className="flex items-center gap-1.5 rounded-md border border-white/40 px-3.5 py-2 text-[12.5px] font-medium text-white hover:bg-white/15"
            >
              <UserPlus size={13} strokeWidth={1.8} />
              {isFollowing
                ? "Following"
                : `Follow ${creator.displayName.split(" ")[0]}`}
            </button>
          </div>
        </div>
      </section>

      {/* Items grid */}
      <section className="mx-auto w-full max-w-6xl px-6 py-10">
        <h2
          className="mb-5 text-[22px] text-ink"
          style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}
        >
          The edit
        </h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it) => {
            const product = getStoreProduct(it.productId);
            if (!product) return null;
            return (
              <article
                key={it.id}
                className="overflow-hidden rounded-lg border border-border bg-white"
              >
                <div
                  className="aspect-[4/3] w-full bg-cover bg-center"
                  style={{ backgroundImage: `url(${product.heroImage})` }}
                />
                <div className="p-3">
                  <h3 className="font-serif text-[15px] text-ink">
                    {product.title}
                  </h3>
                  <div className="mt-1 flex items-center justify-between font-mono text-[10.5px] uppercase tracking-wider text-ink-faint">
                    <span>{product.category}</span>
                    <span className="text-ink">
                      ${product.basePrice.toLocaleString()}
                    </span>
                  </div>
                  {it.creatorNote && (
                    <p
                      className="mt-2 border-l-2 pl-2 text-[12.5px] italic text-ink-muted"
                      style={{ borderColor: drop.accentColor }}
                    >
                      "{it.creatorNote}"
                    </p>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Related drops */}
      {otherCreatorDrops.length > 0 && (
        <section className="mx-auto w-full max-w-6xl border-t border-gold/15 px-6 py-10">
          <h2
            className="mb-5 text-[20px] text-ink"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 500,
            }}
          >
            More from {creator.displayName}
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {otherCreatorDrops.map((d) => (
              <DropCard
                key={d.id}
                drop={d}
                itemCount={allItems.filter((i) => i.dropId === d.id).length}
                weddingId={weddingId}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
