"use client";

// The Grapevine — fifth tab inside the Planning Circle.
// Composition:
//   1. Live banner (if a session is `live`) or upcoming countdown
//   2. Search across all archived Q&A
//   3. Filters (session type / tag) + sort (recent / questions / popular)
//   4. Archive grid of past sessions
//
// All read paths go through /api/grapevine/* so the surface mirrors the
// same auth-aware shape used by /grapevine/[slug].

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";
import Link from "next/link";
import {
  SESSION_TYPE_LABEL,
  type GrapevineSearchHit,
  type GrapevineSessionType,
  type GrapevineSessionWithStats,
} from "@/types/grapevine-ama";
import styles from "./GrapevineTab.module.css";

type SortKey = "recent" | "questions" | "popular";

const SORT_OPTIONS: Array<{ value: SortKey; label: string }> = [
  { value: "recent", label: "Most Recent" },
  { value: "questions", label: "Most Questions" },
  { value: "popular", label: "Most Popular" },
];

function formatDate(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function countdownText(target: string | null): string {
  if (!target) return "";
  const ms = new Date(target).getTime() - Date.now();
  if (ms <= 0) return "Starting soon";
  const days = Math.floor(ms / 86_400_000);
  const hours = Math.floor((ms % 86_400_000) / 3_600_000);
  if (days > 0) {
    return `Starts in ${days} day${days === 1 ? "" : "s"}, ${hours} hour${
      hours === 1 ? "" : "s"
    }`;
  }
  const minutes = Math.floor((ms % 3_600_000) / 60_000);
  if (hours > 0) return `Starts in ${hours}h ${minutes}m`;
  return `Starts in ${minutes} minutes`;
}

function avatarInitial(name: string): string {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase();
}

export function GrapevineTab() {
  const [sessions, setSessions] = useState<GrapevineSessionWithStats[] | null>(
    null,
  );
  const [filterType, setFilterType] = useState<"all" | GrapevineSessionType>(
    "all",
  );
  const [filterTag, setFilterTag] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortKey>("recent");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchHits, setSearchHits] = useState<GrapevineSearchHit[] | null>(
    null,
  );
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef<number | null>(null);

  useEffect(() => {
    let alive = true;
    fetch("/api/grapevine/sessions")
      .then((r) => r.json())
      .then((j) => {
        if (alive && Array.isArray(j?.sessions)) setSessions(j.sessions);
      })
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, []);

  // Debounced cross-archive search.
  useEffect(() => {
    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    if (searchQuery.trim().length < 2) {
      setSearchHits(null);
      return;
    }
    setSearching(true);
    debounceRef.current = window.setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/grapevine/search?q=${encodeURIComponent(searchQuery)}`,
        );
        const j = await res.json().catch(() => ({}));
        if (Array.isArray(j?.hits)) setSearchHits(j.hits);
      } finally {
        setSearching(false);
      }
    }, 220);
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [searchQuery]);

  const live = useMemo(
    () => sessions?.find((s) => s.status === "live") ?? null,
    [sessions],
  );
  const upcoming = useMemo(
    () => sessions?.find((s) => s.status === "upcoming") ?? null,
    [sessions],
  );

  const archived = useMemo(() => {
    if (!sessions) return [];
    return sessions.filter(
      (s) => s.status === "archived" || s.status === "ended",
    );
  }, [sessions]);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    for (const s of archived) {
      for (const t of s.tags ?? []) set.add(t);
    }
    return Array.from(set).sort();
  }, [archived]);

  const filteredSorted = useMemo(() => {
    let items = archived.slice();
    if (filterType !== "all") {
      items = items.filter((s) => s.session_type === filterType);
    }
    if (filterTag !== "all") {
      items = items.filter((s) => (s.tags ?? []).includes(filterTag));
    }
    items.sort((a, b) => {
      if (sortBy === "questions") {
        return b.total_questions - a.total_questions;
      }
      if (sortBy === "popular") {
        return (
          b.total_upvotes + b.total_reactions -
          (a.total_upvotes + a.total_reactions)
        );
      }
      return b.created_at.localeCompare(a.created_at);
    });
    return items;
  }, [archived, filterType, filterTag, sortBy]);

  const sessionTypeFilters: Array<{
    value: "all" | GrapevineSessionType;
    label: string;
  }> = useMemo(() => {
    const present = new Set<GrapevineSessionType>();
    for (const s of archived)
      if (s.session_type) present.add(s.session_type);
    return [
      { value: "all", label: "All" },
      ...Array.from(present).map((t) => ({
        value: t,
        label: SESSION_TYPE_LABEL[t] + "s",
      })),
    ];
  }, [archived]);

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    // Debounced effect already kicks; nothing to do.
  };

  return (
    <div className={styles.tab}>
      {live ? (
        <Link href={`/grapevine/${live.slug}`} className={styles.liveBanner}>
          <div>
            <div className={styles.liveBadge}>
              <span className={styles.liveDot} aria-hidden="true" />
              Live now
            </div>
            <h3 className={styles.bannerTitle}>{live.title}</h3>
            <p className={styles.bannerExpert}>
              with <strong>{live.expert_name}</strong>
              {live.expert_title ? ` · ${live.expert_title}` : ""}
            </p>
          </div>
          <span className={styles.bannerCta}>Join Now →</span>
        </Link>
      ) : upcoming ? (
        <Link
          href={`/grapevine/${upcoming.slug}`}
          className={styles.upcomingBanner}
        >
          <div>
            <span className={styles.upcomingBadge}>Coming Up</span>
            <h3 className={styles.bannerTitle}>{upcoming.title}</h3>
            <p className={styles.bannerExpert}>
              with <strong>{upcoming.expert_name}</strong>
              {upcoming.expert_title ? ` · ${upcoming.expert_title}` : ""}
            </p>
            <p className={styles.bannerCountdown}>
              {formatDate(upcoming.scheduled_start)} ·{" "}
              {countdownText(upcoming.scheduled_start)}
            </p>
          </div>
          <span className={styles.bannerCta}>See Session →</span>
        </Link>
      ) : null}

      <form className={styles.searchRow} onSubmit={handleSearchSubmit}>
        <input
          className={styles.searchInput}
          type="search"
          placeholder="Search questions & answers across all AMAs…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label="Search Grapevine archives"
        />
      </form>

      {searchHits !== null && (
        <div className={styles.searchHits}>
          {searching && searchHits.length === 0 && (
            <p className={styles.empty}>Searching…</p>
          )}
          {!searching && searchHits.length === 0 && searchQuery.length >= 2 && (
            <p className={styles.empty}>No matches yet — try a different phrase.</p>
          )}
          {searchHits.map((hit) => (
            <Link
              key={hit.question_id}
              href={`/grapevine/${hit.session_slug}#q-${hit.question_id}`}
              className={styles.searchHit}
            >
              <h4 className={styles.searchHitQuestion}>{hit.question_text}</h4>
              {hit.answer_text && (
                <p className={styles.searchHitAnswer}>{hit.answer_text}</p>
              )}
              <span className={styles.searchHitMeta}>
                {hit.expert_name} · {hit.session_title}
              </span>
            </Link>
          ))}
        </div>
      )}

      {searchHits === null && (
        <>
          <div className={styles.filtersBar}>
            <span className={styles.filterLabel}>Type</span>
            {sessionTypeFilters.map((f) => (
              <button
                key={f.value}
                type="button"
                className={`${styles.filterPill} ${
                  filterType === f.value ? styles.filterPillActive : ""
                }`}
                onClick={() => setFilterType(f.value)}
              >
                {f.label}
              </button>
            ))}
            {allTags.length > 0 && (
              <>
                <span className={styles.filterLabel} style={{ marginLeft: 12 }}>
                  Tag
                </span>
                <button
                  type="button"
                  className={`${styles.filterPill} ${
                    filterTag === "all" ? styles.filterPillActive : ""
                  }`}
                  onClick={() => setFilterTag("all")}
                >
                  All
                </button>
                {allTags.slice(0, 8).map((t) => (
                  <button
                    key={t}
                    type="button"
                    className={`${styles.filterPill} ${
                      filterTag === t ? styles.filterPillActive : ""
                    }`}
                    onClick={() => setFilterTag(t)}
                  >
                    {t}
                  </button>
                ))}
              </>
            )}
            <span className={styles.filterSpacer} />
            <select
              className={styles.filterSort}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortKey)}
              aria-label="Sort archived sessions"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          {sessions === null ? (
            <p className={styles.empty}>Loading the archive…</p>
          ) : filteredSorted.length === 0 ? (
            <div className={styles.empty}>
              <h3 className={styles.emptyHeading}>No sessions yet</h3>
              <p>The first AMA goes live soon — set a reminder above.</p>
            </div>
          ) : (
            <div className={styles.grid}>
              {filteredSorted.map((s) => (
                <Link
                  key={s.id}
                  href={`/grapevine/${s.slug}`}
                  className={styles.sessionCard}
                >
                  <div className={styles.sessionCardTop}>
                    <div className={styles.expertAvatar} aria-hidden="true">
                      {avatarInitial(s.expert_name)}
                    </div>
                    <div className={styles.expertMeta}>
                      <span className={styles.expertName}>{s.expert_name}</span>
                      <span className={styles.expertDate}>
                        {formatDate(s.actual_end ?? s.created_at)}
                      </span>
                    </div>
                  </div>
                  <h3 className={styles.sessionTitle}>{s.title}</h3>
                  <div className={styles.sessionMeta}>
                    {s.session_type && (
                      <span className={styles.sessionTypeBadge}>
                        {SESSION_TYPE_LABEL[s.session_type]}
                      </span>
                    )}
                    {(s.tags ?? []).slice(0, 4).map((t) => (
                      <span key={t} className={styles.sessionTagPill}>
                        {t}
                      </span>
                    ))}
                  </div>
                  <p className={styles.sessionStats}>
                    <strong>{s.total_questions}</strong> question
                    {s.total_questions === 1 ? "" : "s"} ·{" "}
                    <strong>{s.total_answered}</strong> answered
                  </p>
                  <span className={styles.sessionCta}>Read the AMA →</span>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
