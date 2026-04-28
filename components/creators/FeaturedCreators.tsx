"use client";

import Link from "next/link";
import { ArrowRight, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCreatorsStore } from "@/stores/creators-store";
import { isFeaturedTier } from "@/lib/creators/tier-evaluation";
import {
  CreatorAvatar,
  formatFollowerCount,
} from "./CreatorAvatar";
import { TierBadge } from "./TierBadge";

// ── FeaturedCreators ──────────────────────────────────────────────────────
// Horizontal row of Top Creator + Partner tier profiles. Sits at the top
// of Creator Picks and (optionally) the Community > Creators tab.

export function FeaturedCreators({
  weddingId,
  seeAllHref,
  className,
}: {
  weddingId: string;
  seeAllHref?: string;
  className?: string;
}) {
  const allCreators = useCreatorsStore((s) => s.creators);
  const featured = allCreators
    .filter((c) => isFeaturedTier(c.tier))
    .sort((a, b) => {
      // Partner tier first, then by followers
      if (a.tier === "partner" && b.tier !== "partner") return -1;
      if (b.tier === "partner" && a.tier !== "partner") return 1;
      return b.followerCount - a.followerCount;
    });

  if (featured.length === 0) return null;

  return (
    <section className={cn("", className)}>
      <header className="mb-4 flex items-end justify-between gap-3">
        <div>
          <p
            className="font-mono text-[10px] uppercase tracking-[0.2em] text-gold"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Featured creators
          </p>
          <h2 className="mt-1.5 font-serif text-[22px] leading-tight text-ink">
            Our top curators, hand-picked
          </h2>
        </div>
        {seeAllHref && (
          <Link
            href={seeAllHref}
            className="flex items-center gap-1 text-[11.5px] text-ink-muted hover:text-ink"
          >
            See all
            <ArrowRight size={11} strokeWidth={1.8} />
          </Link>
        )}
      </header>

      <div className="flex gap-4 overflow-x-auto pb-2">
        {featured.map((c) => (
          <Link
            key={c.id}
            href={`/${weddingId}/shopping/creators/${c.id}`}
            className="group flex min-w-[220px] flex-col overflow-hidden rounded-xl border border-gold/25 bg-white transition-colors hover:border-gold/50"
          >
            <div
              aria-hidden
              className="h-14 w-full"
              style={{ background: c.coverGradient }}
            />
            <div className="-mt-6 flex flex-col items-center px-4 pb-4">
              <CreatorAvatar
                creator={c}
                size="lg"
                className="ring-4 ring-white"
              />
              <div className="mt-2 flex items-center gap-1.5">
                <h3 className="font-serif text-[15px] leading-tight text-ink">
                  {c.displayName}
                </h3>
                <TierBadge tier={c.tier} size="xs" />
              </div>
              <p className="mt-1 line-clamp-1 text-center text-[11px] text-ink-muted">
                {c.specialties.slice(0, 2).join(" · ")}
              </p>
              <div className="mt-2 flex items-center gap-1 font-mono text-[10.5px] text-ink-faint">
                <Users size={10} strokeWidth={1.8} />
                {formatFollowerCount(c.followerCount)}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
