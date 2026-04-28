"use client";

import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BellRing, Calendar, Check, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { TopNav } from "@/components/shell/TopNav";
import { useExhibitionsStore } from "@/stores/exhibitions-store";
import { CATEGORY_LABELS } from "@/types/exhibition";
import {
  Countdown,
  Eyebrow,
  GradientCover,
  StatusChip,
  formatDateRange,
} from "@/components/exhibitions/primitives";
import { ExhibitorCard } from "@/components/exhibitions/ExhibitorCard";

export default function ExhibitionLandingPage({
  params,
}: {
  params: Promise<{ weddingId: string; slug: string }>;
}) {
  const { weddingId, slug } = use(params);
  const exhibition = useExhibitionsStore((s) => s.getExhibition(slug));
  const allExhibitors = useExhibitionsStore((s) => s.exhibitors);
  const items = useExhibitionsStore((s) => s.items);
  const exhibitors = useMemo(
    () =>
      exhibition
        ? allExhibitors
            .filter((x) => x.exhibition_id === exhibition.id)
            .slice()
            .sort((a, b) => a.sort_order - b.sort_order)
        : [],
    [allExhibitors, exhibition],
  );
  const wishlistCount = useExhibitionsStore((s) => s.wishlist.length);
  const hasRsvped = useExhibitionsStore((s) =>
    exhibition ? s.hasRsvped(exhibition.id) : false,
  );
  const toggleRsvp = useExhibitionsStore((s) => s.toggleRsvp);
  const markVisited = useExhibitionsStore((s) => s.markVisited);

  const exhibitionId = exhibition?.id;
  useEffect(() => {
    if (exhibitionId) markVisited(exhibitionId);
  }, [exhibitionId, markVisited]);

  const [category, setCategory] = useState<string>("all");

  const itemCountByExhibitor = useMemo(() => {
    const map = new Map<string, number>();
    for (const it of items) {
      map.set(it.exhibitor_id, (map.get(it.exhibitor_id) ?? 0) + 1);
    }
    return map;
  }, [items]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const x of exhibitors) set.add(x.booth_category);
    return ["all", ...Array.from(set)];
  }, [exhibitors]);

  if (!exhibition) notFound();

  const isLive = exhibition.status === "live";
  const isUpcoming = exhibition.status === "upcoming";
  const isEnded = exhibition.status === "ended";

  const featured = exhibitors.filter((x) => x.is_featured);
  const allFiltered =
    category === "all"
      ? exhibitors
      : exhibitors.filter((x) => x.booth_category === category);

  const totalItems = exhibitors.reduce(
    (acc, x) => acc + (itemCountByExhibitor.get(x.id) ?? 0),
    0,
  );

  return (
    <div className="flex min-h-screen flex-col bg-ivory">
      <TopNav>
        <Link
          href={`/${weddingId}/shopping/exhibitions/wishlist`}
          className="inline-flex items-center gap-1.5 rounded-md border border-gold/25 bg-white px-3 py-1.5 text-[12px] font-medium text-ink-muted transition-colors hover:border-gold/40 hover:text-ink"
        >
          <Heart size={13} strokeWidth={1.8} />
          Wishlist
          {wishlistCount > 0 && (
            <span
              className="rounded-full bg-rose px-1.5 py-0 font-mono text-[9.5px] text-ivory"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {wishlistCount}
            </span>
          )}
        </Link>
      </TopNav>

      <main className="flex-1">
        {/* HERO */}
        <section className="relative">
          <GradientCover
            gradient={exhibition.cover_gradient}
            ratio="21/9"
            className="md:max-h-[520px]"
          />
          <div className="mx-auto w-full max-w-[1200px] px-6 py-10 lg:px-10">
            <Link
              href={`/${weddingId}/shopping/exhibitions`}
              className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-muted transition-colors hover:text-ink"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              <ArrowLeft size={10} strokeWidth={2} /> All Exhibitions
            </Link>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <StatusChip status={exhibition.status} />
              {isLive && (
                <Countdown target={exhibition.ends_at} label="ends in" />
              )}
              {isUpcoming && (
                <Countdown target={exhibition.starts_at} label="opens in" />
              )}
              {isEnded && (
                <span
                  className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-muted"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  — ran {formatDateRange(exhibition.starts_at, exhibition.ends_at)} —
                </span>
              )}
            </div>

            <h1 className="mt-4 font-serif text-[44px] leading-[1.05] tracking-tight text-ink md:text-[56px]">
              {exhibition.title}
            </h1>
            {exhibition.subtitle && (
              <p className="mt-3 max-w-2xl text-[16px] leading-relaxed text-ink-muted">
                {exhibition.subtitle}
              </p>
            )}

            <div
              className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10.5px] uppercase tracking-[0.2em] text-ink-faint"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              <span>{exhibition.exhibitor_count} exhibitors</span>
              {isLive && (
                <>
                  <span aria-hidden>·</span>
                  <span>{totalItems}+ items</span>
                </>
              )}
              {exhibition.presented_by && (
                <>
                  <span aria-hidden>·</span>
                  <span>Presented by {exhibition.presented_by}</span>
                </>
              )}
              {exhibition.partners && exhibition.partners.length > 0 && (
                <>
                  <span aria-hidden>·</span>
                  <span>
                    In partnership with {exhibition.partners.join(" · ")}
                  </span>
                </>
              )}
            </div>

            {/* CTAs */}
            <div className="mt-6 flex flex-wrap gap-3">
              {isUpcoming && (
                <button
                  type="button"
                  onClick={() => toggleRsvp(exhibition.id)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-md border px-5 py-2.5 font-mono text-[10px] uppercase tracking-[0.2em] transition-colors",
                    hasRsvped
                      ? "border-sage/40 bg-sage-pale/40 text-sage"
                      : "border-gold/30 bg-ink text-ivory hover:bg-gold hover:text-ivory",
                  )}
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {hasRsvped ? (
                    <>
                      <Check size={12} strokeWidth={2} />
                      You'll be notified
                    </>
                  ) : (
                    <>
                      <BellRing size={12} strokeWidth={1.8} />
                      Remind me when it opens
                    </>
                  )}
                </button>
              )}
              {isLive && (
                <a
                  href="#exhibitors"
                  className="inline-flex items-center gap-2 rounded-md bg-ink px-5 py-2.5 font-mono text-[10px] uppercase tracking-[0.2em] text-ivory transition-colors hover:bg-gold"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  Enter the Exhibition →
                </a>
              )}
              {isEnded && (
                <span
                  className="inline-flex items-center gap-2 rounded-md border border-ink/15 bg-white px-5 py-2.5 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-muted"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  <Calendar size={12} strokeWidth={1.8} />
                  Browse the collection below
                </span>
              )}
            </div>

            {/* Upcoming teaser notice */}
            {isUpcoming && (
              <div className="mt-8 rounded-lg border border-teal/25 bg-teal-pale/30 p-4 text-[12.5px] leading-relaxed text-ink-soft">
                <strong className="font-serif text-[14px] text-ink">
                  Teaser mode.
                </strong>{" "}
                The exhibitor lineup is live below — you can browse booths and
                preview taglines. Full collections and inquiry forms unlock
                when the doors open on{" "}
                {new Date(exhibition.starts_at).toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
                .
              </div>
            )}

            {/* Ended notice */}
            {isEnded && (
              <div className="mt-8 rounded-lg border border-ink/10 bg-ivory-warm p-4 text-[12.5px] leading-relaxed text-ink-soft">
                <strong className="font-serif text-[14px] text-ink">
                  This exhibition has ended.
                </strong>{" "}
                Exhibition-exclusive pricing no longer applies — contact each
                vendor directly for current pricing. Collections remain
                browsable for 30 days after closing.
              </div>
            )}

            {/* About */}
            <div className="mt-10 max-w-3xl">
              <Eyebrow className="mb-4">About this exhibition</Eyebrow>
              <p className="font-serif text-[18px] leading-[1.6] text-ink-soft">
                {exhibition.description}
              </p>
            </div>
          </div>
        </section>

        {/* FEATURED EXHIBITORS */}
        {featured.length > 0 && (
          <section className="mx-auto w-full max-w-[1200px] px-6 py-8 lg:px-10">
            <Eyebrow className="mb-5">Featured exhibitors</Eyebrow>
            <div className="flex gap-4 overflow-x-auto pb-3">
              {featured.map((x) => (
                <ExhibitorCard
                  key={x.id}
                  exhibitor={x}
                  href={`/${weddingId}/shopping/exhibitions/${exhibition.slug}/${x.id}`}
                  itemCount={itemCountByExhibitor.get(x.id)}
                  variant="featured"
                />
              ))}
            </div>
          </section>
        )}

        {/* CATEGORY FILTER + ALL EXHIBITORS */}
        <section
          id="exhibitors"
          className="mx-auto w-full max-w-[1200px] px-6 py-8 lg:px-10"
        >
          <Eyebrow className="mb-5">Browse by category</Eyebrow>
          <div className="mb-8 flex flex-wrap gap-2">
            {categories.map((c) => {
              const label =
                c === "all"
                  ? "All"
                  : CATEGORY_LABELS[c] ??
                    c.replace(/_/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
              const active = category === c;
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  className={cn(
                    "rounded-full border px-3.5 py-1.5 text-[12px] transition-colors",
                    active
                      ? "border-ink bg-ink text-ivory"
                      : "border-gold/20 bg-white text-ink-muted hover:border-gold/40 hover:text-ink",
                  )}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <Eyebrow className="mb-5">
            {category === "all"
              ? "All exhibitors"
              : `${CATEGORY_LABELS[category] ?? category} exhibitors`}
          </Eyebrow>

          {allFiltered.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gold/25 bg-white p-10 text-center text-[13px] text-ink-muted">
              No exhibitors in this category yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {allFiltered.map((x) => (
                <ExhibitorCard
                  key={x.id}
                  exhibitor={x}
                  href={`/${weddingId}/shopping/exhibitions/${exhibition.slug}/${x.id}`}
                  itemCount={itemCountByExhibitor.get(x.id)}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
