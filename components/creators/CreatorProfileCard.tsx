"use client";

import Link from "next/link";
import { Users, Heart, Sparkles, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Creator } from "@/types/creator";
import { useCreatorsStore } from "@/stores/creators-store";
import { CreatorAvatar, formatFollowerCount } from "./CreatorAvatar";

const TIER_LABEL: Record<Creator["tier"], string> = {
  top_creator: "Top Creator",
  rising: "Rising",
  standard: "Creator",
  partner: "Partner",
};

const TIER_STYLES: Record<Creator["tier"], string> = {
  top_creator: "border-gold/40 bg-gold-pale/50 text-gold",
  rising: "border-teal/30 bg-teal-pale/40 text-teal",
  standard: "border-ink/15 bg-ivory-warm text-ink-muted",
  partner: "border-transparent bg-gradient-to-r from-ink to-gold text-ivory",
};

export function CreatorProfileCard({
  creator,
  weddingId,
  variant = "card",
  picksCount,
  savesCount,
  className,
}: {
  creator: Creator;
  weddingId: string;
  variant?: "card" | "inline";
  picksCount?: number;
  savesCount?: number;
  className?: string;
}) {
  const isFollowing = useCreatorsStore((s) => s.isFollowing(creator.id));
  const toggleFollow = useCreatorsStore((s) => s.toggleFollow);
  const liveFollowerCount = useCreatorsStore((s) =>
    s.followerCountFor(creator.id),
  );
  const trackReferral = useCreatorsStore((s) => s.trackReferral);

  if (variant === "inline") {
    return (
      <div
        className={cn(
          "flex items-center gap-3 rounded-lg border border-gold/15 bg-white/80 px-3 py-2",
          className,
        )}
      >
        <CreatorAvatar creator={creator} size="sm" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <Link
              href={`/${weddingId}/shopping/creators/${creator.id}`}
              onClick={() =>
                trackReferral({
                  creatorId: creator.id,
                  referralType: "profile_click",
                })
              }
              className="truncate font-serif text-[13px] text-ink hover:text-gold"
            >
              {creator.displayName}
            </Link>
            <span
              className="font-mono text-[9.5px] uppercase tracking-wider text-ink-faint"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {formatFollowerCount(liveFollowerCount)} followers
            </span>
          </div>
          <p className="truncate text-[11.5px] text-ink-muted">{creator.bio}</p>
        </div>
        <button
          onClick={() => toggleFollow(creator.id)}
          className={cn(
            "shrink-0 rounded-full border px-3 py-1 text-[10.5px] font-medium uppercase tracking-wider transition-colors",
            isFollowing
              ? "border-ink bg-ink text-ivory hover:bg-ink/90"
              : "border-gold/40 bg-white text-gold hover:bg-gold-pale/40",
          )}
        >
          {isFollowing ? "Following" : "Follow"}
        </button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-gold/25 bg-white",
        className,
      )}
    >
      <div
        aria-hidden
        className="h-20 w-full"
        style={{ background: creator.coverGradient }}
      />

      <div className="flex flex-col gap-3 px-5 pb-5">
        <div className="-mt-8 flex items-end justify-between gap-3">
          <CreatorAvatar
            creator={creator}
            size="xl"
            className="ring-4 ring-white"
          />
          <span
            className={cn(
              "rounded-full border px-2.5 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.2em]",
              TIER_STYLES[creator.tier],
            )}
            style={{ fontFamily: "var(--font-mono)" }}
          >
            <Sparkles size={9} strokeWidth={2} className="-mt-0.5 mr-1 inline" />
            {TIER_LABEL[creator.tier]}
          </span>
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h3 className="font-serif text-[20px] leading-tight text-ink">
              {creator.displayName}
            </h3>
            <span
              className="font-mono text-[11px] text-ink-faint"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {creator.handle}
            </span>
          </div>
          <p className="text-[12.5px] leading-relaxed text-ink-muted">
            {creator.bio}
          </p>
        </div>

        <div className="flex items-center gap-4 border-y border-border/60 py-2.5">
          <div className="flex items-center gap-1.5">
            <Users size={12} strokeWidth={1.6} className="text-ink-faint" />
            <span
              className="font-mono text-[11px] text-ink"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {formatFollowerCount(liveFollowerCount)}
            </span>
            <span
              className="font-mono text-[9.5px] uppercase tracking-wider text-ink-faint"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              followers
            </span>
          </div>
          {picksCount != null && (
            <div className="flex items-center gap-1.5">
              <Sparkles size={12} strokeWidth={1.6} className="text-gold" />
              <span
                className="font-mono text-[11px] text-ink"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {picksCount}
              </span>
              <span
                className="font-mono text-[9.5px] uppercase tracking-wider text-ink-faint"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                picks
              </span>
            </div>
          )}
          {savesCount != null && (
            <div className="flex items-center gap-1.5">
              <Heart size={12} strokeWidth={1.6} className="text-rose" />
              <span
                className="font-mono text-[11px] text-ink"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {savesCount.toLocaleString()}
              </span>
              <span
                className="font-mono text-[9.5px] uppercase tracking-wider text-ink-faint"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                saves
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => toggleFollow(creator.id)}
            className={cn(
              "flex-1 rounded-md border px-3 py-1.5 text-[11.5px] font-medium uppercase tracking-wider transition-colors",
              isFollowing
                ? "border-ink bg-ink text-ivory hover:bg-ink/90"
                : "border-gold/40 bg-white text-gold hover:bg-gold-pale/40",
            )}
          >
            {isFollowing ? "Following" : "Follow"}
          </button>
          <Link
            href={`/${weddingId}/shopping/creators/${creator.id}`}
            onClick={() =>
              trackReferral({
                creatorId: creator.id,
                referralType: "profile_click",
              })
            }
            className="flex items-center gap-1 rounded-md border border-border bg-white px-3 py-1.5 text-[11.5px] text-ink-muted transition-colors hover:border-gold/30 hover:text-ink"
          >
            View profile
            <ArrowRight size={11} strokeWidth={1.8} />
          </Link>
        </div>
      </div>
    </div>
  );
}
