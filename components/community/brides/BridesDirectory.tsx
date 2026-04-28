"use client";

// ── Brides Directory ────────────────────────────────────────────────────────
// Discover view. A single compact ActivityStrip at the top (live events,
// huddles, meetups all consolidated to one line), then the bride cards:
// upcoming brides grouped by wedding season, followed by a "circle guides"
// section of experienced brides who want to mentor the next wave. The
// community discussions teaser is collapsed by default to keep bride
// profiles above the fold.

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronUp, Search, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { INTEREST_TAGS } from "@/lib/community/seed";
import {
  keyForDate,
  seasonGroupFromKey,
  seasonIdFromKey,
  seasonSortValue,
  type SeasonGroup,
} from "@/lib/community/seasons";
import { useCommunityProfilesStore } from "@/stores/community-profiles-store";
import { useCommunityMeetupsStore } from "@/stores/community-meetups-store";
import type { CommunityProfile } from "@/types/community";
import { StoryCard } from "./StoryCard";
import { BrideDetailPanel } from "./BrideDetailPanel";
import { ActivityStrip } from "./ActivityStrip";
import { DiscussionsTeaser } from "./DiscussionsTeaser";
import { CommunityOneLookSection } from "@/components/one-look/CommunityOneLookSection";

type SortKey = "recent" | "soonest" | "hometown";

// Pseudo filter slug used by the "Experienced Brides" chip in the interest
// filter row. Not a real INTEREST_TAG — handled in the filter logic below.
const EXPERIENCED_FILTER = "__experienced__";

export function BridesDirectory() {
  // Seed meetups on first render so the banner reads populated.
  const ensureMeetupsSeeded = useCommunityMeetupsStore((s) => s.ensureSeeded);
  useEffect(() => {
    ensureMeetupsSeeded();
  }, [ensureMeetupsSeeded]);

  const allProfiles = useCommunityProfilesStore((s) => s.profiles);
  const myProfileId = useCommunityProfilesStore((s) => s.myProfileId);
  const blocks = useCommunityProfilesStore((s) => s.blocks);

  const visibleProfiles = useMemo(() => {
    const blockedIds = new Set(blocks.map((b) => b.blocked_id));
    return allProfiles.filter(
      (p) =>
        p.id !== myProfileId &&
        p.open_to_connect &&
        !blockedIds.has(p.id),
    );
  }, [allProfiles, myProfileId, blocks]);

  // Experienced brides are surfaced in their own section below the seasons.
  // Upcoming brides render in the season groups above.
  const upcomingProfiles = useMemo(
    () => visibleProfiles.filter((p) => !p.is_experienced),
    [visibleProfiles],
  );
  const experiencedProfiles = useMemo(
    () => visibleProfiles.filter((p) => p.is_experienced),
    [visibleProfiles],
  );

  const myProfile = useMemo(
    () => (myProfileId ? allProfiles.find((p) => p.id === myProfileId) : undefined),
    [allProfiles, myProfileId],
  );

  const [query, setQuery] = useState("");
  const [interestFilter, setInterestFilter] = useState<string | null>(null);
  const [sort, setSort] = useState<SortKey>("recent");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtersActive =
    query.trim().length > 0 || interestFilter !== null || sort !== "recent";
  const experiencedFilterActive = interestFilter === EXPERIENCED_FILTER;

  // Base pool depends on the experienced filter chip:
  //   - chip on   → only experienced brides, rendered flat (no season groups)
  //   - chip off  → upcoming brides only (experienced get their own section)
  const basePool = experiencedFilterActive
    ? experiencedProfiles
    : upcomingProfiles;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const interestSlug =
      interestFilter && interestFilter !== EXPERIENCED_FILTER
        ? interestFilter
        : null;
    return basePool
      .filter((p) => {
        if (interestSlug && !p.looking_for.includes(interestSlug)) return false;
        if (!q) return true;
        const hay = [
          p.display_name,
          p.hometown,
          p.wedding_city,
          p.quote,
          p.wedding_vibe,
          ...(p.expertise_tags ?? []),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return hay.includes(q);
      })
      .sort((a, b) => {
        if (sort === "soonest") {
          const da = a.wedding_date ? new Date(a.wedding_date).getTime() : Infinity;
          const db = b.wedding_date ? new Date(b.wedding_date).getTime() : Infinity;
          return da - db;
        }
        if (sort === "hometown" && myProfile?.hometown) {
          const me = myProfile.hometown.toLowerCase();
          const matchA = (a.hometown ?? "").toLowerCase() === me ? 0 : 1;
          const matchB = (b.hometown ?? "").toLowerCase() === me ? 0 : 1;
          if (matchA !== matchB) return matchA - matchB;
        }
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
  }, [basePool, query, interestFilter, sort, myProfile]);

  // Group by season when no active filters. Flat list when filters are on.
  const seasons = useMemo(() => {
    if (filtersActive) return null;
    type Group = { group: SeasonGroup; profiles: CommunityProfile[] };
    const byId = new Map<string, Group>();
    for (const p of filtered) {
      const key = keyForDate(p.wedding_date);
      const group = seasonGroupFromKey(key);
      if (!byId.has(group.id)) byId.set(group.id, { group, profiles: [] });
      byId.get(group.id)!.profiles.push(p);
    }
    const groups = Array.from(byId.values());
    const mySeasonId = myProfile
      ? seasonIdFromKey(keyForDate(myProfile.wedding_date))
      : null;

    groups.sort((a, b) => {
      if (mySeasonId) {
        if (a.group.id === mySeasonId) return -1;
        if (b.group.id === mySeasonId) return 1;
      }
      return (
        seasonSortValue({ season: a.group.season, year: a.group.year }) -
        seasonSortValue({ season: b.group.season, year: b.group.year })
      );
    });

    return { groups, mySeasonId };
  }, [filtered, filtersActive, myProfile]);

  return (
    <>
      <ActivityStrip />

      <div className="px-6 pb-12 pt-5 md:px-10">
        <div className="mx-auto max-w-6xl">
          <Filters
            query={query}
            setQuery={setQuery}
            interestFilter={interestFilter}
            setInterestFilter={setInterestFilter}
            sort={sort}
            setSort={setSort}
            hasExperiencedBrides={experiencedProfiles.length > 0}
          />

          {filtered.length === 0 ? (
            <EmptyState
              hasBrides={basePool.length > 0}
              experiencedActive={experiencedFilterActive}
            />
          ) : seasons ? (
            <div className="mt-8 space-y-10">
              {seasons.groups.map((g) => (
                <SeasonSection
                  key={g.group.id}
                  group={g.group}
                  profiles={g.profiles}
                  isMySeason={g.group.id === seasons.mySeasonId}
                  onOpen={(id) => setSelectedId(id)}
                />
              ))}
            </div>
          ) : (
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((p) => (
                <StoryCard
                  key={p.id}
                  profile={p}
                  onOpen={() => setSelectedId(p.id)}
                />
              ))}
            </div>
          )}

          {/* One Looks — micro-reviews from brides. Shown only on the
              no-filter default view so filter interactions stay focused. */}
          {!filtersActive && <CommunityOneLookSection />}

          {/* Experienced brides get their own section below the seasons
              when no filter is active. When the experienced chip is on,
              the flat grid above already shows them. */}
          {!experiencedFilterActive &&
            !filtersActive &&
            experiencedProfiles.length > 0 && (
              <ExperiencedSection
                profiles={experiencedProfiles}
                onOpen={(id) => setSelectedId(id)}
              />
            )}

          {/* Community discussions — collapsed by default now that the top
              of the page is reserved for brides. */}
          <DiscussionsTeaserCollapsible />
        </div>
      </div>

      <BrideDetailPanel
        profileId={selectedId}
        onClose={() => setSelectedId(null)}
      />
    </>
  );
}

// ── Experienced brides section ─────────────────────────────────────────────
// Circle guides — women who've already walked the aisle and stuck around.
// Same StoryCard visual language, warmer section header so it reads as part
// of the same community, not a siloed area.

function ExperiencedSection({
  profiles,
  onOpen,
}: {
  profiles: CommunityProfile[];
  onOpen: (id: string) => void;
}) {
  return (
    <section className="mt-14">
      <div className="flex items-baseline justify-between border-b border-saffron/20 py-4">
        <div className="flex items-baseline gap-3">
          <h3 className="font-serif text-[20px] font-medium text-ink">
            <span className="text-ink-muted">— </span>
            your circle guides
            <span className="text-ink-muted"> —</span>
          </h3>
          <span
            className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            been there · {profiles.length}{" "}
            {profiles.length === 1 ? "bride" : "brides"}
          </span>
        </div>
      </div>
      <p className="mt-3 max-w-[560px] font-serif text-[14px] italic text-ink-muted">
        brides who&rsquo;ve walked the aisle and want to walk alongside you —
        real talk, vendor receipts, and the stuff nobody warned you about.
      </p>
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {profiles.map((p) => (
          <StoryCard key={p.id} profile={p} onOpen={() => onOpen(p.id)} />
        ))}
      </div>
    </section>
  );
}

// ── Collapsible discussions teaser ─────────────────────────────────────────
// Compacted version of the previous inline teaser — closed by default so the
// Discover tab stays bride-first. The Discussions sub-tab still holds the
// full thread list.

function DiscussionsTeaserCollapsible() {
  const [open, setOpen] = useState(false);
  return (
    <section className="mt-14 border-t border-gold/10 pt-6">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 text-left"
      >
        <p
          className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          — from the community —
        </p>
        <span className="inline-flex items-center gap-1 text-[11.5px] font-medium text-ink-muted transition-colors hover:text-ink">
          {open ? "hide" : "peek in"}
          {open ? (
            <ChevronUp size={12} strokeWidth={1.9} />
          ) : (
            <ChevronDown size={12} strokeWidth={1.9} />
          )}
        </span>
      </button>
      {open && (
        <div className="mt-4">
          <DiscussionsTeaser />
        </div>
      )}
    </section>
  );
}

// ── Season section ──────────────────────────────────────────────────────────

function SeasonSection({
  group,
  profiles,
  isMySeason,
  onOpen,
}: {
  group: SeasonGroup;
  profiles: CommunityProfile[];
  isMySeason: boolean;
  onOpen: (id: string) => void;
}) {
  return (
    <section>
      <div className="flex items-baseline justify-between border-b border-gold/15 py-4">
        <div className="flex items-baseline gap-3">
          <h3 className="font-serif text-[20px] font-medium text-ink">
            {isMySeason ? (
              <>
                <span className="text-ink-muted">your season — </span>
                {group.label}
              </>
            ) : (
              group.label
            )}
          </h3>
          <span
            className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {group.range} · {profiles.length} {profiles.length === 1 ? "bride" : "brides"}
          </span>
        </div>
      </div>
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {profiles.map((p) => (
          <StoryCard key={p.id} profile={p} onOpen={() => onOpen(p.id)} />
        ))}
      </div>
    </section>
  );
}

// ── Filters ─────────────────────────────────────────────────────────────────

function Filters({
  query,
  setQuery,
  interestFilter,
  setInterestFilter,
  sort,
  setSort,
  hasExperiencedBrides,
}: {
  query: string;
  setQuery: (q: string) => void;
  interestFilter: string | null;
  setInterestFilter: (s: string | null) => void;
  sort: SortKey;
  setSort: (s: SortKey) => void;
  hasExperiencedBrides: boolean;
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search
            size={14}
            strokeWidth={1.8}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, city, or vibe…"
            className="w-full rounded-full border border-border bg-white py-2 pl-9 pr-4 text-[13px] text-ink placeholder:text-ink-faint focus:border-saffron/60 focus:outline-none focus:ring-2 focus:ring-saffron/15"
          />
        </div>
        <div className="flex items-center gap-2">
          <label
            className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Sort
          </label>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="rounded-md border border-border bg-white px-2.5 py-1.5 text-[12.5px] text-ink focus:border-saffron/60 focus:outline-none focus:ring-2 focus:ring-saffron/15"
          >
            <option value="recent">Recently joined</option>
            <option value="soonest">Wedding date soonest</option>
            <option value="hometown">Near me</option>
          </select>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setInterestFilter(null)}
          className={cn(
            "rounded-full border px-3 py-1.5 text-[12px] font-medium transition-colors",
            interestFilter === null
              ? "border-ink bg-ink text-ivory"
              : "border-border bg-white text-ink-muted hover:border-saffron/40 hover:text-ink",
          )}
        >
          All interests
        </button>
        {hasExperiencedBrides && (
          <button
            type="button"
            onClick={() =>
              setInterestFilter(
                interestFilter === EXPERIENCED_FILTER
                  ? null
                  : EXPERIENCED_FILTER,
              )
            }
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-medium transition-colors",
              interestFilter === EXPERIENCED_FILTER
                ? "border-saffron bg-saffron text-white"
                : "border-saffron/40 bg-saffron/5 text-ink hover:border-saffron/70",
            )}
          >
            <span aria-hidden>💍</span>
            Circle guides
          </button>
        )}
        {INTEREST_TAGS.map((tag) => {
          const isActive = interestFilter === tag.slug;
          return (
            <button
              key={tag.slug}
              type="button"
              onClick={() => setInterestFilter(isActive ? null : tag.slug)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-medium transition-colors",
                isActive
                  ? "border-ink bg-ink text-ivory"
                  : "border-border bg-white text-ink-muted hover:border-saffron/40 hover:text-ink",
              )}
            >
              <span aria-hidden>{tag.emoji}</span>
              {tag.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Empty state ─────────────────────────────────────────────────────────────

function EmptyState({
  hasBrides,
  experiencedActive,
}: {
  hasBrides: boolean;
  experiencedActive: boolean;
}) {
  if (experiencedActive && !hasBrides) {
    return (
      <div className="mt-20 flex flex-col items-center justify-center py-10 text-center">
        <Sparkles size={22} strokeWidth={1.5} className="text-saffron" />
        <p className="mt-4 font-serif text-[22px] italic text-ink">
          no circle guides here yet — but they&rsquo;re coming.
        </p>
        <p className="mt-2 max-w-[420px] text-[14px] leading-[1.65] text-ink-muted">
          brides who&rsquo;ve been through it will start popping up here as they
          join. in the meantime, clear the filter to meet the upcoming brides.
        </p>
      </div>
    );
  }
  return (
    <div className="mt-20 flex flex-col items-center justify-center py-10 text-center">
      <Sparkles size={22} strokeWidth={1.5} className="text-gold" />
      <p className="mt-4 font-serif text-[22px] italic text-ink">
        {hasBrides
          ? "no brides match that filter yet."
          : "you're one of the first here — but they're coming."}
      </p>
      <p className="mt-2 max-w-[420px] text-[14px] leading-[1.65] text-ink-muted">
        {hasBrides
          ? "try clearing the search or widening the interest filter."
          : "in the meantime, the blog tab has stories and tips from other brides and the studio."}
      </p>
    </div>
  );
}
