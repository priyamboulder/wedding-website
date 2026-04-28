"use client";

import { Suspense, use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { notFound, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Share2,
  Heart,
  Users,
  Sparkles,
  BadgeCheck,
  Layers,
  Bookmark,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TopNav } from "@/components/shell/TopNav";
import { ShoppingLinksProvider } from "@/contexts/ShoppingLinksContext";
import { useCreatorsStore } from "@/stores/creators-store";
import { getGuidesByCreator } from "@/lib/guides/seed";
import { getStoreProduct } from "@/lib/store-seed";
import { Countdown } from "@/components/exhibitions/primitives";
import {
  CreatorAvatar,
  formatFollowerCount,
} from "@/components/creators/CreatorAvatar";
import { CreatorPickCard } from "@/components/creators/CreatorPickCard";
import { TierBadge } from "@/components/creators/TierBadge";
import { GuideCard } from "@/components/community/guides/GuideCard";
import { CreatorServicesSection } from "@/components/matching/CreatorServicesSection";
import { ConsultationReviews } from "@/components/matching/ConsultationReviews";

export default function CreatorProfilePageWrapper({
  params,
}: {
  params: Promise<{ weddingId: string; id: string }>;
}) {
  const { weddingId, id } = use(params);
  return (
    <ShoppingLinksProvider weddingId={weddingId}>
      <Suspense fallback={null}>
        <CreatorProfilePage weddingId={weddingId} creatorId={id} />
      </Suspense>
    </ShoppingLinksProvider>
  );
}

function CreatorProfilePage({
  weddingId,
  creatorId,
}: {
  weddingId: string;
  creatorId: string;
}) {
  const searchParams = useSearchParams();
  const focusedCollectionId = searchParams.get("collection");

  const creators = useCreatorsStore((s) => s.creators);
  const allCollections = useCreatorsStore((s) => s.collections);
  const picks = useCreatorsStore((s) => s.picks);
  const referralEvents = useCreatorsStore((s) => s.referrals);
  const follows = useCreatorsStore((s) => s.follows);
  const toggleFollow = useCreatorsStore((s) => s.toggleFollow);
  const trackReferral = useCreatorsStore((s) => s.trackReferral);
  const guides = useMemo(() => getGuidesByCreator(creatorId), [creatorId]);

  const [profileTab, setProfileTab] = useState<"collections" | "guides">(
    "collections",
  );

  const creator = useMemo(
    () => creators.find((c) => c.id === creatorId),
    [creators, creatorId],
  );
  const collections = useMemo(
    () =>
      allCollections
        .filter((c) => c.creatorId === creatorId)
        .sort((a, b) => a.sortOrder - b.sortOrder),
    [allCollections, creatorId],
  );
  const isFollowing = useMemo(
    () => follows.some((f) => f.creatorId === creatorId),
    [follows, creatorId],
  );
  const liveFollowerCount = useMemo(() => {
    if (!creator) return 0;
    return creator.followerCount + (isFollowing ? 1 : 0);
  }, [creator, isFollowing]);
  const earnings = useMemo(() => {
    const mine = referralEvents.filter((r) => r.creatorId === creatorId);
    return {
      totalClicks: mine.length,
      totalConversions: mine.filter((r) => r.convertedAt != null).length,
    };
  }, [referralEvents, creatorId]);

  useEffect(() => {
    if (!creator) return;
    trackReferral({
      creatorId: creator.id,
      referralType: "profile_click",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [creator?.id]);

  if (!creator) return notFound();

  const totalPicks = picks.filter((p) =>
    collections.some((c) => c.id === p.collectionId),
  ).length;

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <TopNav>
        <Link
          href={`/${weddingId}/shopping?mode=creator_picks`}
          className="flex items-center gap-1.5 rounded-md border border-border bg-white px-3 py-1.5 text-[12px] font-medium text-ink-muted transition-colors hover:border-gold/30 hover:text-ink"
        >
          <ArrowLeft size={12} strokeWidth={1.8} />
          Back to Creator Picks
        </Link>
      </TopNav>

      {/* Hero */}
      <div
        className="relative h-48 w-full sm:h-56"
        style={{ background: creator.coverGradient }}
      >
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 30% 20%, rgba(255,255,255,0.25) 0%, transparent 40%), linear-gradient(180deg, rgba(26,26,26,0) 55%, rgba(26,26,26,0.35) 100%)",
          }}
        />
      </div>

      <div className="mx-auto -mt-14 w-full max-w-6xl px-6 pb-16">
        <div className="flex flex-col gap-6 rounded-2xl border border-gold/20 bg-white p-6 shadow-sm sm:flex-row sm:items-start sm:gap-8">
          <CreatorAvatar
            creator={creator}
            size="xl"
            className="ring-4 ring-white"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-[28px] leading-tight text-ink">
                {creator.displayName}
              </h1>
              {creator.isVerified && (
                <BadgeCheck size={18} strokeWidth={1.8} className="text-gold" />
              )}
              <span
                className="font-mono text-[11px] text-ink-faint"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {creator.handle}
              </span>
            </div>
            <p className="mt-2 max-w-2xl text-[13.5px] leading-relaxed text-ink-muted">
              {creator.bio}
            </p>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {creator.specialties.map((s) => (
                <span
                  key={s}
                  className="rounded-full border border-gold/25 bg-gold-pale/30 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-gold"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {s}
                </span>
              ))}
            </div>

            <div className="mt-4 flex items-center gap-5 border-y border-border/60 py-3">
              <Stat
                icon={Users}
                value={formatFollowerCount(liveFollowerCount)}
                label="followers"
              />
              <Stat
                icon={Sparkles}
                value={String(totalPicks)}
                label="picks"
                iconColor="text-gold"
              />
              <Stat
                icon={Heart}
                value={(liveFollowerCount / 10 | 0).toLocaleString()}
                label="saves"
                iconColor="text-rose"
              />
              <span className="ml-auto hidden sm:inline">
                <TierBadge tier={creator.tier} size="sm" />
              </span>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <button
                onClick={() => toggleFollow(creator.id)}
                className={cn(
                  "rounded-md border px-4 py-2 text-[12px] font-medium uppercase tracking-wider transition-colors",
                  isFollowing
                    ? "border-ink bg-ink text-ivory hover:bg-ink/90"
                    : "border-gold/40 bg-white text-gold hover:bg-gold-pale/40",
                )}
              >
                {isFollowing ? "Following" : "Follow"}
              </button>
              <button
                onClick={() => {
                  if (typeof navigator !== "undefined" && navigator.share) {
                    navigator
                      .share({
                        title: `${creator.displayName} on Ananya`,
                        url: window.location.href,
                      })
                      .catch(() => {});
                  } else if (typeof navigator !== "undefined") {
                    navigator.clipboard?.writeText(window.location.href);
                  }
                }}
                className="flex items-center gap-1.5 rounded-md border border-border bg-white px-3 py-2 text-[12px] text-ink-muted transition-colors hover:border-gold/30 hover:text-ink"
              >
                <Share2 size={12} strokeWidth={1.8} />
                Share
              </button>
            </div>
          </div>
        </div>

        {/* Profile tabs — Collections / Guides */}
        <div className="mt-8 flex items-center gap-0 border-b border-gold/15">
          <ProfileTab
            id="collections"
            label="Collections"
            count={collections.length}
            icon={Layers}
            active={profileTab === "collections"}
            onClick={() => setProfileTab("collections")}
          />
          <ProfileTab
            id="guides"
            label="Guides"
            count={guides.length}
            icon={Bookmark}
            active={profileTab === "guides"}
            onClick={() => setProfileTab("guides")}
          />
        </div>

        {/* Collections */}
        {profileTab === "collections" && (
        <div className="mt-8 flex flex-col gap-10">
          {collections.map((collection) => {
            const collectionPicks = picks
              .filter((p) => p.collectionId === collection.id)
              .sort((a, b) => a.sortOrder - b.sortOrder);
            const isFocused = focusedCollectionId === collection.id;
            return (
              <section
                key={collection.id}
                id={collection.id}
                className={cn(
                  "scroll-mt-16 rounded-2xl border bg-white p-5",
                  isFocused
                    ? "border-gold/50 shadow-[0_6px_24px_rgba(212,168,67,0.15)]"
                    : "border-border",
                )}
              >
                <div className="flex items-center justify-between gap-4 border-b border-gold/10 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      {collection.isExhibition && (
                        <span
                          className="flex items-center gap-1 rounded-full border border-rose/30 bg-rose-pale/40 px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.2em] text-rose"
                          style={{ fontFamily: "var(--font-mono)" }}
                        >
                          <span className="relative inline-flex h-1 w-1 items-center justify-center">
                            <span className="absolute h-2 w-2 animate-ping rounded-full bg-rose/60" />
                            <span className="relative h-1 w-1 rounded-full bg-rose" />
                          </span>
                          Live exhibition
                        </span>
                      )}
                      <span
                        className="font-mono text-[9.5px] uppercase tracking-[0.22em] text-ink-faint"
                        style={{ fontFamily: "var(--font-mono)" }}
                      >
                        {collection.isExhibition
                          ? "Creator exhibition"
                          : "Creator collection"}
                      </span>
                    </div>
                    <h2 className="mt-1 font-serif text-[22px] leading-tight text-ink">
                      {collection.title}
                    </h2>
                    <p className="mt-1 max-w-2xl text-[12.5px] text-ink-muted">
                      {collection.description}
                    </p>
                  </div>
                  <div className="text-right">
                    <div
                      className="font-mono text-[10.5px] uppercase tracking-wider text-ink-faint"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {collectionPicks.length} item
                      {collectionPicks.length === 1 ? "" : "s"}
                    </div>
                    {collection.isExhibition && collection.exhibitionEnd && (
                      <Countdown
                        target={collection.exhibitionEnd}
                        label="ends in"
                        className="!text-rose"
                      />
                    )}
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                  {collectionPicks.map((pick) => {
                    const product = getStoreProduct(pick.productId);
                    if (!product) return null;
                    return (
                      <CreatorPickCard
                        key={pick.id}
                        pick={pick}
                        product={product}
                        creator={creator}
                        weddingId={weddingId}
                        collectionId={collection.id}
                        module={collection.module}
                        referralType={
                          collection.isExhibition ? "exhibition" : "direct_link"
                        }
                      />
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
        )}

        {/* Guides */}
        {profileTab === "guides" && (
          <div className="mt-8">
            {guides.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gold/25 bg-ivory-warm/30 py-16 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-gold/30 bg-white text-gold">
                  <Bookmark size={18} strokeWidth={1.6} />
                </div>
                <p className="mt-4 font-serif text-[18px] italic text-ink">
                  {creator.displayName} hasn't published any guides yet.
                </p>
                <p className="mt-1 text-[12.5px] text-ink-muted">
                  Follow to be notified when they do.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
                {guides.map((g) => (
                  <GuideCard key={g.id} guide={g} creator={creator} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Services + reviews — "Work with {Creator}" block */}
        <div className="mt-12 space-y-6">
          <CreatorServicesSection creator={creator} />
          <ConsultationReviews creator={creator} />
        </div>

        {/* Creator's tiny running stats footer — internal-ish transparency */}
        <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 rounded-xl border border-border bg-ivory-warm/40 px-5 py-3">
          <span
            className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Your referral session
          </span>
          <Stat
            icon={Sparkles}
            value={String(earnings.totalClicks)}
            label="clicks tracked"
            iconColor="text-gold"
            compact
          />
          <Stat
            icon={Heart}
            value={String(earnings.totalConversions)}
            label="conversions"
            iconColor="text-rose"
            compact
          />
        </div>
      </div>
    </div>
  );
}

function Stat({
  icon: Icon,
  value,
  label,
  iconColor = "text-ink-faint",
  compact = false,
}: {
  icon: React.ElementType;
  value: string;
  label: string;
  iconColor?: string;
  compact?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-1.5", compact && "text-[11px]")}>
      <Icon size={12} strokeWidth={1.6} className={iconColor} />
      <span
        className="font-mono text-[12px] text-ink"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {value}
      </span>
      <span
        className="font-mono text-[9.5px] uppercase tracking-wider text-ink-faint"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {label}
      </span>
    </div>
  );
}

function ProfileTab({
  id,
  label,
  count,
  icon: Icon,
  active,
  onClick,
}: {
  id: string;
  label: string;
  count: number;
  icon: React.ElementType;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      data-tab={id}
      className={cn(
        "relative -mb-px flex items-center gap-2 px-5 pb-3 pt-2 text-[12.5px] font-medium transition-colors",
        active ? "text-ink" : "text-ink-muted hover:text-ink",
      )}
    >
      <Icon size={13} strokeWidth={1.8} />
      {label}
      <span
        className={cn(
          "font-mono text-[10px]",
          active ? "text-gold" : "text-ink-faint",
        )}
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {count}
      </span>
      {active && (
        <span className="absolute inset-x-3 bottom-0 h-[2px] rounded-full bg-ink" />
      )}
    </button>
  );
}
