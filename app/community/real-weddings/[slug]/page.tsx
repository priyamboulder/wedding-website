"use client";

// ── /community/real-weddings/[slug] ─────────────────────────────────────────
// Full showcase detail page. Hero cover with couple names, sticky save bar,
// scrollable sections (Story, Looks, Details, Vendors, Numbers, Creator
// Shoutouts), and a "More Real Weddings" footer.

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Heart,
  HeartOff,
  ImageOff,
  MapPin,
  Share2,
  Trophy,
  Users,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { TopNav } from "@/components/shell/TopNav";
import { useShowcasesStore } from "@/stores/showcases-store";
import {
  SHOWCASE_STYLE_LABEL,
  SHOWCASE_TRADITION_LABEL,
} from "@/types/showcase";
import { monthLabel, currentMonthKey } from "@/lib/showcases/awards";
import { ShowcaseLooksGallery } from "@/components/community/showcases/ShowcaseLooksGallery";
import { ShowcaseVendorsList } from "@/components/community/showcases/ShowcaseVendorsList";
import { ShowcaseNumbers } from "@/components/community/showcases/ShowcaseNumbers";
import { ShowcaseShoutouts } from "@/components/community/showcases/ShowcaseShoutouts";
import { ShowcaseCard } from "@/components/community/showcases/ShowcaseCard";

const SECTION_LINKS = [
  { id: "story", label: "Story" },
  { id: "looks", label: "Looks" },
  { id: "details", label: "Details" },
  { id: "vendors", label: "Vendors" },
  { id: "numbers", label: "Numbers" },
  { id: "shoutouts", label: "Shoutouts" },
];

export default function ShowcaseDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;

  const getShowcaseBySlug = useShowcasesStore((s) => s.getShowcaseBySlug);
  const isSaved = useShowcasesStore((s) =>
    slug ? s.isSaved(getShowcaseBySlug(slug)?.id ?? "") : false,
  );
  const saveCount = useShowcasesStore((s) =>
    slug ? s.saveCountFor(getShowcaseBySlug(slug)?.id ?? "") : 0,
  );
  const toggleSave = useShowcasesStore((s) => s.toggleSave);
  const markViewed = useShowcasesStore((s) => s.markViewed);
  const monthlyWinnerId = useShowcasesStore((s) => s.getMonthlyWinnerId());
  const getRelated = useShowcasesStore((s) => s.getRelatedShowcases);

  const showcase = useMemo(
    () => (slug ? getShowcaseBySlug(slug) : undefined),
    [slug, getShowcaseBySlug],
  );

  useEffect(() => {
    if (!showcase) return;
    markViewed(showcase.id);
  }, [showcase, markViewed]);

  const related = useMemo(
    () => (showcase ? getRelated(showcase, 3) : []),
    [showcase, getRelated],
  );

  if (!slug) return null;
  if (!showcase) return notFound();

  const isMonthlyWinner = showcase.id === monthlyWinnerId;
  const weddingDate = new Date(showcase.weddingDate).toLocaleDateString(
    "en-US",
    { month: "long", day: "numeric", year: "numeric" },
  );

  return (
    <div className="min-h-screen bg-white">
      <TopNav>
        <Link
          href="/community?tab=real-weddings"
          className="flex items-center gap-1.5 rounded-md border border-border bg-white px-3 py-1.5 text-[12px] font-medium text-ink-muted transition-colors hover:border-gold/30 hover:text-ink"
        >
          <ArrowLeft size={12} strokeWidth={1.8} />
          Back to Real Weddings
        </Link>
      </TopNav>

      <StickySaveBar
        title={`${showcase.brideName} & ${showcase.partnerName}`}
        saveCount={saveCount}
        isSaved={isSaved}
        onToggleSave={() => toggleSave(showcase.id)}
      />

      <HeroCover
        coverUrl={showcase.coverImageUrl}
        brideName={showcase.brideName}
        partnerName={showcase.partnerName}
        weddingDate={weddingDate}
        locationCity={showcase.locationCity}
        venueName={showcase.venueName}
        guestCountRange={showcase.guestCountRange}
        styleTags={showcase.styleTags.map((t) => SHOWCASE_STYLE_LABEL[t])}
        traditionTags={showcase.traditionTags.map((t) => SHOWCASE_TRADITION_LABEL[t])}
        isMonthlyWinner={isMonthlyWinner}
      />

      {/* Section anchor nav — sits just under the sticky save bar */}
      <nav
        className="sticky top-[104px] z-20 border-b border-gold/10 bg-white/95 px-6 backdrop-blur"
        aria-label="Showcase sections"
      >
        <ul className="mx-auto flex max-w-[960px] items-center gap-2 overflow-x-auto py-3">
          {SECTION_LINKS.map((s) => (
            <li key={s.id} className="shrink-0">
              <a
                href={`#${s.id}`}
                className="rounded-full border border-transparent px-3 py-1 font-mono text-[10.5px] uppercase tracking-[0.22em] text-ink-muted transition-colors hover:border-gold/30 hover:text-ink"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* The Story */}
      <section
        id="story"
        className="border-b border-gold/10 bg-white py-14 scroll-mt-32"
      >
        <div className="mx-auto max-w-[720px] px-6">
          <p
            className="font-mono text-[10px] uppercase tracking-[0.22em] text-gold"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            The Story
          </p>
          <h2 className="mt-2 font-serif text-[32px] font-medium text-ink md:text-[40px]">
            How it went.
          </h2>
          <div
            className="mt-6 font-serif text-[18px] leading-[1.75] text-ink prose-showcase"
            // storyText is stored as escaped HTML from the wizard (plain text
            // wrapped in <p> tags with HTML entities escaped). Strip any tags
            // that are not <p> or <br> as a defence-in-depth measure.
            dangerouslySetInnerHTML={{
              __html: showcase.storyText
                ? showcase.storyText.replace(/<(?!\/?(?:p|br)\b)[^>]+>/gi, "")
                : "",
            }}
          />
        </div>
      </section>

      {/* The Looks */}
      <div id="looks" className="scroll-mt-32">
        <ShowcaseLooksGallery
          section="looks"
          photos={showcase.photos}
          productTags={showcase.productTags}
          heading="The Looks"
          eyebrow="Attire & Adornment"
        />
      </div>

      {/* The Details */}
      <div id="details" className="scroll-mt-32 border-t border-gold/10">
        <ShowcaseLooksGallery
          section="details"
          photos={showcase.photos}
          productTags={showcase.productTags}
          heading="The Details"
          eyebrow="Décor, Stationery & Favors"
        />
      </div>

      {/* The Vendors */}
      <div id="vendors" className="scroll-mt-32">
        <ShowcaseVendorsList reviews={showcase.vendorReviews} />
      </div>

      {/* The Numbers */}
      <div id="numbers" className="scroll-mt-32">
        <ShowcaseNumbers
          slices={showcase.budgetBreakdown}
          budgetRange={showcase.budgetRange}
          guestCountRange={showcase.guestCountRange}
        />
      </div>

      {/* Creator Shoutouts */}
      <div id="shoutouts" className="scroll-mt-32">
        <ShowcaseShoutouts shoutouts={showcase.creatorShoutouts} />
      </div>

      {/* More Real Weddings */}
      {related.length > 0 && (
        <section className="border-t border-gold/15 bg-white px-6 py-14">
          <div className="mx-auto max-w-6xl">
            <p
              className="font-mono text-[10px] uppercase tracking-[0.22em] text-gold"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Keep reading
            </p>
            <h2 className="mt-1 font-serif text-[28px] text-ink">
              More Real Weddings
            </h2>
            <div className="mt-8 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((s) => (
                <ShowcaseCard
                  key={s.id}
                  showcase={s}
                  isMonthlyWinner={s.id === monthlyWinnerId}
                />
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
    const onScroll = () => setScrolled(window.scrollY > 360);
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
                ? "border-rose/40 bg-rose-pale/40 text-rose"
                : "border-ink bg-ink text-ivory hover:bg-ink/90",
            )}
          >
            {isSaved ? (
              <HeartOff size={11} strokeWidth={1.8} />
            ) : (
              <Heart size={11} strokeWidth={1.8} />
            )}
            {isSaved ? "Saved" : "Save"}
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
  brideName,
  partnerName,
  weddingDate,
  locationCity,
  venueName,
  guestCountRange,
  styleTags,
  traditionTags,
  isMonthlyWinner,
}: {
  coverUrl: string;
  brideName: string;
  partnerName: string;
  weddingDate: string;
  locationCity: string;
  venueName: string;
  guestCountRange: string;
  styleTags: string[];
  traditionTags: string[];
  isMonthlyWinner: boolean;
}) {
  const [err, setErr] = useState(false);
  return (
    <div className="relative h-[560px] w-full overflow-hidden bg-ivory-deep sm:h-[640px]">
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
            "linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.25) 40%, rgba(0,0,0,0.7) 95%)",
        }}
      />

      {isMonthlyWinner && (
        <div className="absolute left-6 top-6 z-10 flex items-center gap-1.5 rounded-full bg-gold/90 px-3 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.22em] text-ivory backdrop-blur-sm">
          <Trophy size={11} strokeWidth={2} />
          Wedding of the Month · {monthLabel(currentMonthKey())}
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 mx-auto flex h-full max-w-[960px] flex-col justify-end px-6 pb-14"
      >
        <div className="flex flex-wrap gap-1.5">
          {styleTags.slice(0, 3).map((t) => (
            <span
              key={t}
              className="rounded-full bg-black/35 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.22em] text-ivory backdrop-blur-sm"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {t}
            </span>
          ))}
          {traditionTags.slice(0, 2).map((t) => (
            <span
              key={t}
              className="rounded-full border border-white/35 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.22em] text-ivory/90"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {t}
            </span>
          ))}
        </div>
        <h1 className="mt-5 font-serif text-[48px] font-bold leading-[1.02] tracking-[-0.005em] text-ivory md:text-[72px]">
          {brideName} <span className="italic text-ivory/85">&</span>{" "}
          {partnerName}
        </h1>
        <div className="mt-5 flex flex-wrap items-center gap-5 text-ivory/85">
          <HeroMeta icon={Calendar} label={weddingDate} />
          <HeroMeta icon={MapPin} label={`${venueName} · ${locationCity}`} />
          <HeroMeta icon={Users} label={`${guestCountRange} guests`} />
        </div>
      </motion.div>
    </div>
  );
}

function HeroMeta({
  icon: Icon,
  label,
}: {
  icon: typeof Calendar;
  label: string;
}) {
  return (
    <p
      className="flex items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-[0.22em] text-ivory/80"
      style={{ fontFamily: "var(--font-mono)" }}
    >
      <Icon size={12} strokeWidth={1.8} />
      {label}
    </p>
  );
}
