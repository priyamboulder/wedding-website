"use client";

import { use, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Heart } from "lucide-react";
import { TopNav } from "@/components/shell/TopNav";
import { useExhibitionsStore } from "@/stores/exhibitions-store";
import type { Exhibition } from "@/types/exhibition";
import {
  Countdown,
  Eyebrow,
  GradientCover,
  StatusChip,
  formatDateRange,
} from "@/components/exhibitions/primitives";

export default function ExhibitionsListPage({
  params,
}: {
  params: Promise<{ weddingId: string }>;
}) {
  const { weddingId } = use(params);
  const exhibitions = useExhibitionsStore((s) => s.listExhibitions());
  const wishlistCount = useExhibitionsStore((s) => s.wishlist.length);

  const { live, upcoming, past } = useMemo(() => {
    return {
      live: exhibitions.filter((e) => e.status === "live"),
      upcoming: exhibitions.filter((e) => e.status === "upcoming"),
      past: exhibitions.filter((e) => e.status === "ended"),
    };
  }, [exhibitions]);

  return (
    <div className="flex min-h-screen flex-col bg-ivory">
      <TopNav>
        <div className="flex items-center gap-2">
          <Link
            href={`/${weddingId}/shopping/marketplace`}
            className="inline-flex items-center gap-1.5 rounded-md border border-gold/25 bg-white px-3 py-1.5 text-[12px] font-medium text-ink-muted transition-colors hover:border-gold/40 hover:text-ink"
          >
            <span aria-hidden>🏷️</span>
            Pre-Loved
          </Link>
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
        </div>
      </TopNav>

      <main className="mx-auto w-full max-w-[1200px] flex-1 px-6 py-10 lg:px-10">
        {/* Header */}
        <div className="mb-10">
          <Link
            href={`/${weddingId}/shopping`}
            className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-muted transition-colors hover:text-ink"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            <ArrowLeft size={10} strokeWidth={2} /> Back to Shopping
          </Link>
          <p className="section-eyebrow mt-5">Shopping · Virtual Exhibitions</p>
          <h1 className="mt-2 font-serif text-[36px] leading-[1.05] tracking-tight text-ink sm:text-[44px]">
            Trunk shows, designer showcases,
            <br />
            and wedding expos — from your couch.
          </h1>
          <p className="mt-4 max-w-2xl text-[14px] leading-relaxed text-ink-muted">
            India runs hundreds of bridal exhibitions a year — Bridal Asia,
            Dulhan Expo, Wedding Asia. Most of them are in-person only. We
            bring the exhibition to you: curated, time-bound, and quietly
            beautiful.
          </p>
        </div>

        {/* Live */}
        {live.length > 0 && (
          <section className="mb-14">
            <Eyebrow className="mb-5">Live now</Eyebrow>
            <div className="flex flex-col gap-6">
              {live.map((ex) => (
                <LiveHeroCard key={ex.id} exhibition={ex} weddingId={weddingId} />
              ))}
            </div>
          </section>
        )}

        {/* Upcoming */}
        {upcoming.length > 0 && (
          <section className="mb-14">
            <Eyebrow className="mb-5">Coming soon</Eyebrow>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {upcoming.map((ex) => (
                <UpcomingCard
                  key={ex.id}
                  exhibition={ex}
                  weddingId={weddingId}
                />
              ))}
            </div>
          </section>
        )}

        {/* Past */}
        {past.length > 0 && (
          <section className="mb-14">
            <Eyebrow className="mb-5">Past exhibitions</Eyebrow>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {past.map((ex) => (
                <PastCard key={ex.id} exhibition={ex} weddingId={weddingId} />
              ))}
            </div>
          </section>
        )}

        {live.length === 0 && upcoming.length === 0 && past.length === 0 && (
          <div className="rounded-xl border border-dashed border-gold/25 bg-white p-10 text-center">
            <p className="font-serif text-[20px] text-ink">
              No exhibitions just yet.
            </p>
            <p className="mt-2 text-[13px] text-ink-muted">
              Check back soon — new showcases open every month.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

function LiveHeroCard({
  exhibition,
  weddingId,
}: {
  exhibition: Exhibition;
  weddingId: string;
}) {
  return (
    <Link
      href={`/${weddingId}/shopping/exhibitions/${exhibition.slug}`}
      className="group relative grid grid-cols-1 gap-0 overflow-hidden rounded-xl border border-gold/30 bg-white shadow-sm transition-all hover:border-gold/50 hover:shadow-lg md:grid-cols-[1fr_1.1fr]"
    >
      <GradientCover
        gradient={exhibition.cover_gradient}
        ratio="4/5"
        className="md:aspect-auto md:h-full"
      />
      <div className="flex flex-col justify-center gap-4 p-8 lg:p-10">
        <div className="flex flex-wrap items-center gap-3">
          <StatusChip status={exhibition.status} />
          <Countdown target={exhibition.ends_at} label="ends in" />
        </div>
        <h2 className="font-serif text-[30px] leading-[1.1] tracking-tight text-ink">
          {exhibition.title}
        </h2>
        {exhibition.subtitle && (
          <p className="text-[14px] leading-relaxed text-ink-muted">
            {exhibition.subtitle}
          </p>
        )}
        <div
          className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10.5px] uppercase tracking-[0.2em] text-ink-faint"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          <span>{exhibition.exhibitor_count} exhibitors</span>
          <span aria-hidden>·</span>
          <span>{formatDateRange(exhibition.starts_at, exhibition.ends_at)}</span>
          {exhibition.presented_by && (
            <>
              <span aria-hidden>·</span>
              <span>Presented by {exhibition.presented_by}</span>
            </>
          )}
        </div>
        <span
          className="mt-1 inline-flex w-fit items-center gap-1.5 rounded-md bg-ink px-4 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-ivory transition-transform group-hover:translate-x-0.5"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Enter Exhibition <ArrowRight size={11} strokeWidth={2} />
        </span>
      </div>
    </Link>
  );
}

function UpcomingCard({
  exhibition,
  weddingId,
}: {
  exhibition: Exhibition;
  weddingId: string;
}) {
  return (
    <Link
      href={`/${weddingId}/shopping/exhibitions/${exhibition.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-gold/15 bg-white transition-all hover:border-gold/35 hover:shadow-md"
    >
      <GradientCover gradient={exhibition.cover_gradient} ratio="16/9" />
      <div className="flex flex-1 flex-col gap-3 p-5">
        <StatusChip status={exhibition.status} className="self-start" />
        <h3 className="font-serif text-[20px] leading-tight text-ink">
          {exhibition.title}
        </h3>
        <p className="text-[12.5px] text-ink-muted line-clamp-2">
          {exhibition.subtitle}
        </p>
        <div
          className="mt-auto flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          <span>Opens {new Date(exhibition.starts_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
          <span>{exhibition.exhibitor_count} exhibitors</span>
        </div>
      </div>
    </Link>
  );
}

function PastCard({
  exhibition,
  weddingId,
}: {
  exhibition: Exhibition;
  weddingId: string;
}) {
  return (
    <Link
      href={`/${weddingId}/shopping/exhibitions/${exhibition.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-gold/10 bg-white opacity-80 transition-all hover:opacity-100 hover:border-gold/25"
    >
      <GradientCover gradient={exhibition.cover_gradient} ratio="16/9" />
      <div className="flex flex-1 flex-col gap-2 p-5">
        <StatusChip status={exhibition.status} className="self-start" />
        <h3 className="font-serif text-[17px] leading-tight text-ink">
          {exhibition.title}
        </h3>
        <div
          className="mt-auto font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {formatDateRange(exhibition.starts_at, exhibition.ends_at)}
        </div>
      </div>
    </Link>
  );
}
