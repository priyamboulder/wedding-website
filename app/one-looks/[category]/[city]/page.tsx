"use client";

// ── /one-looks/[category]/[city] ──────────────────────────────────────────
// Trail page — a ranked vendor list for a given category + city, built from
// bride-submitted One Looks. Public (no auth needed to view). Writes to the
// helpful counts require auth, which is handled by the HelpfulButton itself.

import { useMemo } from "react";
import { useParams } from "next/navigation";
import NextLink from "next/link";
import { ArrowLeft } from "lucide-react";
import { TopNav } from "@/components/shell/TopNav";
import { useOneLookStore } from "@/stores/one-look-store";
import { computeTrail, categoryEmoji } from "@/lib/one-look/trails";
import { TrailVendorRow } from "@/components/one-look/TrailVendorRow";

export default function OneLookTrailPage() {
  const params = useParams<{ category: string; city: string }>();
  const categorySlug = params?.category ?? "";
  const citySlug = params?.city ?? "";

  const reviews = useOneLookStore((s) => s.reviews);
  const trail = useMemo(
    () => computeTrail(reviews, categorySlug, citySlug),
    [reviews, categorySlug, citySlug],
  );

  if (!trail) {
    return (
      <div className="min-h-screen bg-ivory">
        <TopNav />
        <main className="mx-auto max-w-3xl px-10 py-16">
          <NextLink
            href="/community/discover/trails"
            className="inline-flex items-center gap-1.5 text-[11.5px] font-medium text-ink-muted transition-colors hover:text-ink"
          >
            <ArrowLeft size={12} strokeWidth={1.8} />
            Back to trails
          </NextLink>
          <div className="mt-10 rounded-lg border border-dashed border-border/70 bg-white/60 p-10 text-center">
            <p
              className="font-mono text-[10px] uppercase tracking-[0.16em] text-gold"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              no trail yet
            </p>
            <h1 className="mt-2 font-serif text-[22px] leading-snug text-ink">
              this trail hasn't opened yet.
            </h1>
            <p className="mt-2 max-w-md mx-auto text-[13.5px] leading-relaxed text-ink-muted">
              A trail needs at least 3 vendors, each with 2+ One Looks, before
              it goes live. Check back once brides start weighing in.
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivory">
      <TopNav />
      <header className="border-b border-gold/15 bg-white px-10 pt-8">
        <div className="mx-auto max-w-3xl">
          <NextLink
            href="/community/discover/trails"
            className="inline-flex items-center gap-1.5 text-[11.5px] font-medium text-ink-muted transition-colors hover:text-ink"
          >
            <ArrowLeft size={12} strokeWidth={1.8} />
            Back to trails
          </NextLink>
          <p
            className="mt-6 text-[10.5px] font-medium uppercase tracking-[0.18em] text-gold"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            <span>{categoryEmoji(trail.category)}</span> one look trail
          </p>
          <h1 className="mt-2 font-serif text-[36px] font-bold leading-[1.05] tracking-[-0.005em] text-ink">
            {trail.city} {trail.category}s — ranked by brides.
          </h1>
          <p
            className="mt-3 pb-6 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {trail.totalLooks} one looks from{" "}
            {trail.vendorCount}{" "}
            {trail.vendorCount === 1 ? "vendor" : "vendors"} · expand a row to
            hear the takes
          </p>
        </div>
      </header>
      <main className="px-10 py-10">
        <div className="mx-auto max-w-3xl">
          <ul className="space-y-3" role="list">
            {trail.vendors.map((v, i) => (
              <TrailVendorRow key={v.vendorId} rank={i + 1} entry={v} />
            ))}
          </ul>

          <div className="mt-8 rounded-lg border border-dashed border-border/60 bg-white/60 p-5 text-center">
            <p
              className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-ink-faint"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              how this works
            </p>
            <p className="mt-1.5 font-serif text-[13.5px] italic text-ink-muted">
              minimum 2 One Looks to appear · score = average of all One Looks
              for that vendor · vendors cannot pay to rank higher
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
