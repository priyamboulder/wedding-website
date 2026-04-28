"use client";

// ── /community/guides/[slug] ────────────────────────────────────────────────
// Long-form reading view for a Creator Guide. Hero cover with title +
// creator overlay, sticky save bar, block-rendered body, "More from creator"
// + "Related products" footer. Read-only — no commenting in v1.

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  BookmarkPlus,
  BookmarkCheck,
  Share2,
  BadgeCheck,
  ImageOff,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { TopNav } from "@/components/shell/TopNav";
import { useGuidesStore } from "@/stores/guides-store";
import { useCreatorsStore } from "@/stores/creators-store";
import {
  GUIDE_CATEGORY_LABEL,
  getProductIdsInGuide,
  getGuideBySlug,
  listPublishedGuides,
} from "@/lib/guides/seed";
import { getStoreProduct } from "@/lib/store-seed";
import type { StoreProduct } from "@/lib/link-preview/types";
import { GuideBody } from "@/components/community/guides/GuideBody";
import { GuideCard } from "@/components/community/guides/GuideCard";

export default function GuideDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;

  const guide = useMemo(
    () => (slug ? getGuideBySlug(slug) : undefined),
    [slug],
  );
  const allGuides = useMemo(() => listPublishedGuides(), []);
  const isSaved = useGuidesStore((s) =>
    guide ? s.isSaved(guide.id) : false,
  );
  const saveCount = useGuidesStore((s) =>
    guide ? s.saveCountFor(guide.id) : 0,
  );
  const toggleSave = useGuidesStore((s) => s.toggleSave);
  const markViewed = useGuidesStore((s) => s.markViewed);

  const creators = useCreatorsStore((s) => s.creators);
  const trackReferral = useCreatorsStore((s) => s.trackReferral);

  useEffect(() => {
    if (!guide) return;
    markViewed(guide.id);
    // Track a "guide" referral event for the creator. Provides the data
    // hook the spec calls for: clicks inside guides feed creator earnings.
    trackReferral({
      creatorId: guide.creatorId,
      referralType: "guide",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guide?.id]);

  const creator = useMemo(
    () => (guide ? creators.find((c) => c.id === guide.creatorId) : undefined),
    [creators, guide],
  );

  const moreFromCreator = useMemo(() => {
    if (!guide) return [];
    return allGuides
      .filter((g) => g.creatorId === guide.creatorId && g.id !== guide.id)
      .slice(0, 3);
  }, [allGuides, guide]);

  const relatedProducts = useMemo(() => {
    if (!guide) return [];
    return getProductIdsInGuide(guide.id)
      .map((pid) => getStoreProduct(pid))
      .filter((p): p is NonNullable<typeof p> => p != null);
  }, [guide]);

  if (!slug) return null;
  if (!guide) return notFound();

  const categoryLabel = GUIDE_CATEGORY_LABEL[guide.category];
  const publishedDate = guide.publishedAt
    ? new Date(guide.publishedAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <div className="min-h-screen bg-white">
      <TopNav>
        <Link
          href="/community?tab=editorial&sub=guides"
          className="flex items-center gap-1.5 rounded-md border border-border bg-white px-3 py-1.5 text-[12px] font-medium text-ink-muted transition-colors hover:border-gold/30 hover:text-ink"
        >
          <ArrowLeft size={12} strokeWidth={1.8} />
          Back to Guides
        </Link>
      </TopNav>

      {/* Sticky save bar */}
      <StickySaveBar
        title={guide.title}
        saveCount={saveCount}
        isSaved={isSaved}
        onToggleSave={() => toggleSave(guide.id)}
      />

      {/* Hero cover */}
      <HeroCover
        coverUrl={guide.coverImageUrl}
        category={categoryLabel}
        title={guide.title}
        subtitle={guide.subtitle}
        creatorName={creator?.displayName ?? "Ananya editorial"}
        creatorHandle={creator?.handle}
        creatorVerified={creator?.isVerified ?? false}
        creatorGradient={creator?.avatarGradient ?? "#F0E4C8"}
        creatorId={creator?.id}
        publishedDate={publishedDate}
        readTime={guide.readTimeMinutes}
      />

      {/* Body */}
      <article className="mx-auto max-w-[720px] px-6 pb-16 pt-12 md:px-0">
        <GuideBody blocks={guide.body} />
      </article>

      {/* More from creator */}
      {moreFromCreator.length > 0 && creator && (
        <section className="border-t border-gold/15 bg-ivory-warm/30 px-6 py-12">
          <div className="mx-auto max-w-6xl">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p
                  className="font-mono text-[10px] uppercase tracking-[0.22em] text-gold"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  More from
                </p>
                <h2 className="mt-1 font-serif text-[28px] text-ink">
                  {creator.displayName}
                </h2>
              </div>
              <Link
                href={`/default/shopping/creators/${creator.id}`}
                className="flex items-center gap-1 text-[12.5px] text-ink-muted transition-colors hover:text-saffron"
              >
                Visit profile
                <ArrowUpRight size={12} strokeWidth={1.8} />
              </Link>
            </div>
            <div className="mt-8 grid grid-cols-1 gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
              {moreFromCreator.map((g) => (
                <GuideCard key={g.id} guide={g} creator={creator} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Related products */}
      {relatedProducts.length > 0 && (
        <section className="border-t border-gold/15 bg-white px-6 py-12">
          <div className="mx-auto max-w-6xl">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p
                  className="font-mono text-[10px] uppercase tracking-[0.22em] text-gold"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  Featured in this guide
                </p>
                <h2 className="mt-1 font-serif text-[24px] text-ink">
                  Shop the products mentioned
                </h2>
              </div>
              <Link
                href="/default/shopping?mode=ananya_store"
                className="flex items-center gap-1 text-[12.5px] text-ink-muted transition-colors hover:text-saffron"
              >
                Browse store
                <ArrowUpRight size={12} strokeWidth={1.8} />
              </Link>
            </div>
            <div className="mt-6 -mx-6 flex snap-x gap-4 overflow-x-auto px-6 pb-3">
              {relatedProducts.map((p) => (
                <CompactProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

// ── Sticky save bar ─────────────────────────────────────────────────────────

function StickySaveBar({
  title,
  saveCount,
  isSaved,
  onToggleSave,
}: {
  title: string;
  saveCount: number;
  isSaved: boolean;
  onToggleSave: () => void;
}) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 320);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={cn(
        "sticky top-14 z-30 border-b bg-white/95 backdrop-blur transition-all duration-200",
        scrolled
          ? "border-gold/15 opacity-100"
          : "pointer-events-none border-transparent opacity-0",
      )}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-2.5">
        <p className="truncate font-serif text-[14px] italic text-ink-muted">
          {title}
        </p>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (typeof navigator !== "undefined" && navigator.share) {
                navigator
                  .share({ title, url: window.location.href })
                  .catch(() => {});
              } else if (typeof navigator !== "undefined") {
                navigator.clipboard?.writeText(window.location.href);
              }
            }}
            className="flex items-center gap-1.5 rounded-md border border-border bg-white px-3 py-1.5 text-[11.5px] text-ink-muted transition-colors hover:border-gold/30 hover:text-ink"
          >
            <Share2 size={11} strokeWidth={1.8} />
            Share
          </button>
          <button
            type="button"
            onClick={onToggleSave}
            className={cn(
              "flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-[11.5px] font-medium uppercase tracking-wider transition-colors",
              isSaved
                ? "border-gold/40 bg-gold-pale/40 text-gold"
                : "border-ink bg-ink text-ivory hover:bg-ink/90",
            )}
          >
            {isSaved ? (
              <BookmarkCheck size={11} strokeWidth={1.8} />
            ) : (
              <BookmarkPlus size={11} strokeWidth={1.8} />
            )}
            {isSaved ? "Saved" : "Save guide"}
            <span
              className="font-mono text-[10px]"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {saveCount.toLocaleString()}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Hero cover ──────────────────────────────────────────────────────────────

function HeroCover({
  coverUrl,
  category,
  title,
  subtitle,
  creatorName,
  creatorHandle,
  creatorVerified,
  creatorGradient,
  creatorId,
  publishedDate,
  readTime,
}: {
  coverUrl: string;
  category: string;
  title: string;
  subtitle: string;
  creatorName: string;
  creatorHandle?: string;
  creatorVerified: boolean;
  creatorGradient: string;
  creatorId?: string;
  publishedDate: string | null;
  readTime: number;
}) {
  const [err, setErr] = useState(false);
  return (
    <div className="relative h-[480px] w-full overflow-hidden bg-ivory-deep sm:h-[560px]">
      {coverUrl && !err ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={coverUrl}
          alt=""
          onError={() => setErr(true)}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-ink-faint/40">
          <ImageOff size={40} strokeWidth={1.3} />
        </div>
      )}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.15) 35%, rgba(0,0,0,0.65) 95%)",
        }}
      />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 mx-auto flex h-full max-w-[960px] flex-col justify-end px-6 pb-12"
      >
        <span
          className="self-start rounded-full bg-black/40 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.22em] text-ivory backdrop-blur-sm"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {category}
        </span>
        <h1 className="mt-4 max-w-3xl font-serif text-[40px] font-bold leading-[1.05] tracking-[-0.005em] text-ivory md:text-[56px]">
          {title}
        </h1>
        <p className="mt-3 max-w-2xl font-serif text-[18px] italic text-ivory/85">
          {subtitle}
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          {creatorId ? (
            <Link
              href={`/default/shopping/creators/${creatorId}`}
              className="flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-3 py-1.5 backdrop-blur transition-colors hover:bg-white/20"
            >
              <CreatorBadge
                name={creatorName}
                handle={creatorHandle}
                verified={creatorVerified}
                gradient={creatorGradient}
              />
            </Link>
          ) : (
            <CreatorBadge
              name={creatorName}
              handle={creatorHandle}
              verified={creatorVerified}
              gradient={creatorGradient}
            />
          )}
          <span
            className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-ivory/70"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {publishedDate ? `${publishedDate} · ` : ""}
            {readTime} min read
          </span>
        </div>
      </motion.div>
    </div>
  );
}

function CreatorBadge({
  name,
  handle,
  verified,
  gradient,
}: {
  name: string;
  handle?: string;
  verified: boolean;
  gradient: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span
        aria-hidden
        className="inline-block h-7 w-7 rounded-full ring-1 ring-white/40"
        style={{ background: gradient }}
      />
      <div className="leading-tight">
        <div className="flex items-center gap-1 text-[13px] font-medium text-ivory">
          {name}
          {verified && (
            <BadgeCheck size={12} strokeWidth={1.8} className="text-gold-light" />
          )}
        </div>
        {handle && (
          <div
            className="font-mono text-[10px] uppercase tracking-wider text-ivory/65"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {handle}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Compact product card (related products carousel) ───────────────────────

function CompactProductCard({ product }: { product: StoreProduct }) {
  const [err, setErr] = useState(false);
  return (
    <Link
      href={`/default/shopping?mode=ananya_store&product=${product.id}`}
      className="group flex w-44 shrink-0 snap-start flex-col"
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-ivory-warm">
        {product.heroImage && !err ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.heroImage}
            alt={product.title}
            onError={() => setErr(true)}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-ink-faint/40">
            <ImageOff size={20} strokeWidth={1.3} />
          </div>
        )}
      </div>
      <p className="mt-2 line-clamp-2 font-serif text-[13px] leading-snug text-ink group-hover:text-saffron">
        {product.title}
      </p>
      <p
        className="mt-1 font-mono text-[11px] font-semibold text-saffron"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: product.currency || "USD",
          maximumFractionDigits: 0,
        }).format(product.basePrice)}
      </p>
    </Link>
  );
}
