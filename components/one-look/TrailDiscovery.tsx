"use client";

// ── Trail discovery grid ──────────────────────────────────────────────────
// Shown on /community/discover/trails. Cards for each (category, city) pair
// that clears the minimums. Personalized — bride's wedding city floats first.

import { useMemo } from "react";
import NextLink from "next/link";
import { useOneLookStore } from "@/stores/one-look-store";
import { useCommunityProfilesStore } from "@/stores/community-profiles-store";
import { computeTrailSummaries, categoryEmoji } from "@/lib/one-look/trails";

export function TrailDiscovery() {
  const reviews = useOneLookStore((s) => s.reviews);
  const myProfileId = useCommunityProfilesStore((s) => s.myProfileId);
  const profiles = useCommunityProfilesStore((s) => s.profiles);
  const myProfile = myProfileId
    ? profiles.find((p) => p.id === myProfileId) ?? null
    : null;

  const summaries = useMemo(() => computeTrailSummaries(reviews), [reviews]);

  const sorted = useMemo(() => {
    const myCity = myProfile?.wedding_city?.trim().toLowerCase() ?? null;
    const copy = [...summaries];
    copy.sort((a, b) => {
      if (myCity) {
        const aIsMine = a.city === myCity ? 0 : 1;
        const bIsMine = b.city === myCity ? 0 : 1;
        if (aIsMine !== bIsMine) return aIsMine - bIsMine;
      }
      return b.totalLooks - a.totalLooks;
    });
    return copy;
  }, [summaries, myProfile]);

  if (sorted.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border/70 bg-ivory-warm/30 px-6 py-10 text-center">
        <p
          className="font-mono text-[10px] uppercase tracking-[0.16em] text-gold"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          no trails yet
        </p>
        <h3 className="mt-2 font-serif text-[18px] leading-snug text-ink">
          trails appear when at least 3 vendors in a city each have 2+ One Looks
        </h3>
        <p className="mt-2 max-w-md text-[13px] leading-relaxed text-ink-muted mx-auto">
          Give your vendors a One Look — the moment the threshold is hit, the
          city's trail goes live.
        </p>
      </div>
    );
  }

  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4" role="list">
      {sorted.map((t) => (
        <li key={`${t.categorySlug}__${t.citySlug}`}>
          <NextLink
            href={`/one-looks/${t.categorySlug}/${t.citySlug}`}
            className="flex h-full flex-col rounded-xl border border-gold/25 bg-white p-4 transition-colors hover:border-gold/60 hover:bg-gold-pale/20"
          >
            <span className="text-[28px] leading-none">
              {categoryEmoji(t.category)}
            </span>
            <span
              className="mt-3 font-mono text-[9.5px] uppercase tracking-[0.18em] text-gold"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {t.vendorCount} vendors · {t.totalLooks} looks
            </span>
            <span className="mt-1 font-serif text-[16px] leading-snug text-ink">
              {t.category}s in {t.city}
            </span>
          </NextLink>
        </li>
      ))}
    </ul>
  );
}
