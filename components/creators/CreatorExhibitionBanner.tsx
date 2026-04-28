"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  isWithinExhibitionWindow,
  useCreatorsStore,
} from "@/stores/creators-store";
import { Countdown } from "@/components/exhibitions/primitives";
import { CreatorAvatar, formatFollowerCount } from "./CreatorAvatar";

export function CreatorExhibitionBanner({
  weddingId,
  className = "mx-6 mt-4",
}: {
  weddingId: string;
  className?: string;
}) {
  const collections = useCreatorsStore((s) => s.collections);
  const creators = useCreatorsStore((s) => s.creators);
  const picks = useCreatorsStore((s) => s.picks);
  const trackReferral = useCreatorsStore((s) => s.trackReferral);
  const active = useMemo(
    () => collections.filter(isWithinExhibitionWindow),
    [collections],
  );

  if (active.length === 0) return null;

  return (
    <div className={`${className} flex flex-col gap-3`}>
      {active.map((col) => {
        const creator = creators.find((c) => c.id === col.creatorId);
        if (!creator) return null;
        const itemCount = picks.filter((p) => p.collectionId === col.id).length;
        return (
          <Link
            key={col.id}
            href={`/${weddingId}/shopping/creators/${creator.id}?collection=${col.id}`}
            onClick={() =>
              trackReferral({
                creatorId: creator.id,
                collectionId: col.id,
                referralType: "exhibition",
              })
            }
            className="group relative flex flex-1 flex-col gap-3 overflow-hidden rounded-xl border border-gold/30 bg-white px-5 py-4 transition-all hover:border-gold/50 hover:shadow-md sm:flex-row sm:items-center sm:justify-between sm:gap-6"
          >
            <div
              aria-hidden
              className="absolute inset-y-0 right-0 w-1/2 opacity-70"
              style={{ background: col.coverGradient }}
            />
            <div
              aria-hidden
              className="absolute inset-y-0 left-0 w-3/5"
              style={{
                background:
                  "linear-gradient(90deg, #FFFFFF 65%, rgba(255,255,255,0) 100%)",
              }}
            />

            <div className="relative flex items-center gap-4">
              <CreatorAvatar creator={creator} size="lg" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="relative inline-flex h-1.5 w-1.5 items-center justify-center">
                    <span className="absolute h-2.5 w-2.5 animate-ping rounded-full bg-rose/60" />
                    <span className="relative h-1.5 w-1.5 rounded-full bg-rose" />
                  </span>
                  <span
                    className="font-mono text-[10px] uppercase tracking-[0.22em] text-rose"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    Live Now — Creator Exhibition
                  </span>
                </div>
                <h3 className="mt-1 font-serif text-[18px] leading-tight text-ink">
                  {col.title}
                </h3>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-[11.5px] text-ink-muted">
                  <span>
                    {creator.displayName} ·{" "}
                    {formatFollowerCount(creator.followerCount)} followers
                  </span>
                  <span aria-hidden className="text-ink-faint">
                    ·
                  </span>
                  <span>
                    {itemCount} item{itemCount === 1 ? "" : "s"}
                  </span>
                  <span aria-hidden className="text-ink-faint">
                    ·
                  </span>
                  {col.exhibitionEnd && (
                    <Countdown target={col.exhibitionEnd} label="ends in" />
                  )}
                </div>
              </div>
            </div>

            <div
              className="relative inline-flex items-center gap-1.5 self-start rounded-md bg-ink px-4 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-ivory transition-transform group-hover:translate-x-0.5 sm:self-auto"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Browse Now <ArrowRight size={11} strokeWidth={2} />
            </div>
          </Link>
        );
      })}
    </div>
  );
}
