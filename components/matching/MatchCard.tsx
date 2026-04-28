"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Sparkles, Star, ArrowRight, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Creator } from "@/types/creator";
import type { MatchScore } from "@/types/matching";
import { CreatorAvatar, formatFollowerCount } from "@/components/creators/CreatorAvatar";
import { TierBadge } from "@/components/creators/TierBadge";
import { useMatchingStore } from "@/stores/matching-store";

// ── MatchCard ─────────────────────────────────────────────────────────────
// A single result in the "Find a Creator" ranked list. Shows match score,
// module expertise, rating, and the starting price pulled from the
// creator's active services.

const LABEL_STYLES: Record<MatchScore["label"], string> = {
  "Great Match": "border-gold/40 bg-gold-pale/60 text-gold",
  "Strong Match": "border-teal/30 bg-teal-pale/40 text-teal",
  "Good Match": "border-ink/15 bg-ivory-warm text-ink-muted",
};

const MODULE_LABEL: Record<string, string> = {
  "phase-0": "Foundation & Vision",
  "phase-1": "Branding & Identity",
  "phase-2": "Core Bookings",
  "phase-3": "Attire & Styling",
  "phase-4": "Experience Vendors",
  "phase-5": "Paper & Stationery",
  "phase-6": "Guest Management",
  "phase-7": "Ceremony Specifics",
};

export function MatchCard({
  creator,
  match,
  onBook,
  profileHref,
}: {
  creator: Creator;
  match: MatchScore;
  onBook: (creator: Creator) => void;
  profileHref: string;
}) {
  const allServices = useMatchingStore((s) => s.services);
  const startingPrice = useMemo(() => {
    const mine = allServices.filter(
      (s) => s.creatorId === creator.id && s.isActive,
    );
    return mine.length ? Math.min(...mine.map((s) => s.price)) : null;
  }, [allServices, creator.id]);

  return (
    <article className="relative overflow-hidden rounded-xl border border-gold/20 bg-white">
      <div
        aria-hidden
        className="h-16 w-full"
        style={{ background: creator.coverGradient }}
      />

      <div className="flex flex-col gap-4 px-5 pb-5">
        <div className="-mt-7 flex items-start justify-between gap-3">
          <CreatorAvatar
            creator={creator}
            size="lg"
            className="ring-4 ring-white"
          />
          <div className="flex flex-col items-end gap-1.5">
            <TierBadge tier={creator.tier} size="sm" />
            <span
              className={cn(
                "rounded-full border px-2.5 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.2em]",
                LABEL_STYLES[match.label],
              )}
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {match.label} · {match.score}%
            </span>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-serif text-[19px] leading-tight text-ink">
              {creator.displayName}
            </h3>
            <span
              className="font-mono text-[11px] text-ink-faint"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {creator.handle}
            </span>
          </div>
          <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-muted line-clamp-2">
            {creator.bio}
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {creator.moduleExpertise.slice(0, 3).map((m) => (
            <span
              key={m}
              className="rounded-full border border-border bg-ivory-warm/60 px-2.5 py-0.5 text-[10.5px] text-ink-muted"
            >
              {MODULE_LABEL[m] ?? m}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-4 border-y border-border/60 py-2.5">
          <Stat
            icon={<Star size={12} strokeWidth={1.8} className="text-gold" />}
            value={
              creator.consultationRating > 0
                ? creator.consultationRating.toFixed(1)
                : "New"
            }
            label={
              creator.consultationRating > 0
                ? `${creator.totalConsultations} consults`
                : "consults"
            }
          />
          <Stat
            icon={<Sparkles size={12} strokeWidth={1.8} className="text-gold" />}
            value={formatFollowerCount(creator.followerCount)}
            label="followers"
          />
          {startingPrice != null && (
            <Stat
              icon={
                <DollarSign
                  size={12}
                  strokeWidth={1.8}
                  className="text-ink-faint"
                />
              }
              value={`from $${startingPrice}`}
              label="sessions"
            />
          )}
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={profileHref}
            className="flex items-center gap-1 rounded-md border border-border bg-white px-3 py-1.5 text-[11.5px] text-ink-muted transition-colors hover:border-gold/30 hover:text-ink"
          >
            View profile
            <ArrowRight size={11} strokeWidth={1.8} />
          </Link>
          <button
            type="button"
            onClick={() => onBook(creator)}
            className="flex-1 rounded-md border border-gold bg-gold px-3 py-1.5 text-[11.5px] font-medium uppercase tracking-wider text-ivory transition-colors hover:bg-gold/90"
          >
            Book now
          </button>
        </div>
      </div>
    </article>
  );
}

function Stat({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-1.5">
      {icon}
      <span
        className="font-mono text-[11px] text-ink"
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
