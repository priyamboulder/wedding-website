"use client";

// ── Ask a Bride panel ──────────────────────────────────────────────────────
// Mentor discovery for planning brides. Filters (city / culture / expertise /
// budget), a scored grid of StoryCards — the same card used in Discover —
// and an in-line request modal. Tapping a card opens the request modal so
// the user doesn't need to detour through the profile panel to ask.

import { useEffect, useMemo, useState } from "react";
import { Heart, Search, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { fallbackGradientFor } from "@/lib/community/photos";
import { useCommunityProfilesStore } from "@/stores/community-profiles-store";
import { useMentoringStore } from "@/stores/mentoring-store";
import type { CommunityProfile } from "@/types/community";
import {
  BUDGET_RANGES,
  EXPERTISE_TAGS,
  type BudgetRange,
  type MentorProfile,
} from "@/types/mentoring";
import { StoryCard } from "./StoryCard";

interface MentorMatchScore {
  mentor: MentorProfile;
  score: number;
}

export function AskABridePanel() {
  const ensureMentorsSeeded = useMentoringStore((s) => s.ensureSeeded);
  const ensureProfilesSeeded = useCommunityProfilesStore((s) => s.ensureSeeded);
  const expireStale = useMentoringStore((s) => s.expireStalePending);
  useEffect(() => {
    ensureProfilesSeeded();
    ensureMentorsSeeded();
    expireStale();
  }, [ensureMentorsSeeded, ensureProfilesSeeded, expireStale]);

  const mentors = useMentoringStore((s) => s.mentors);
  const allMatches = useMentoringStore((s) => s.matches);
  const allProfiles = useCommunityProfilesStore((s) => s.profiles);

  const myProfileId = useCommunityProfilesStore((s) => s.myProfileId);
  const myProfile = useCommunityProfilesStore((s) =>
    s.myProfileId ? s.profiles.find((p) => p.id === s.myProfileId) : undefined,
  );

  const [cityFilter, setCityFilter] = useState(
    myProfile?.wedding_city?.split(",")[0]?.trim() ?? "",
  );
  const [cultureFilter, setCultureFilter] = useState<string>("any");
  const [expertiseFilter, setExpertiseFilter] = useState<string>("any");
  const [budgetFilter, setBudgetFilter] = useState<BudgetRange | "any">("any");
  const [sort, setSort] = useState<"best" | "active" | "new">("best");

  const availableMentors = useMemo(
    () =>
      mentors.filter(
        (m) =>
          m.is_active &&
          !m.is_paused &&
          m.profile_id !== myProfileId, // don't show self
      ),
    [mentors, myProfileId],
  );

  const scored: MentorMatchScore[] = useMemo(() => {
    return availableMentors.map((m) => {
      // City match (substring, case-insensitive)
      const cityQ = cityFilter.trim().toLowerCase();
      const mentorCity = (m.wedding_city ?? "").toLowerCase();
      const cityScore = cityQ
        ? mentorCity.includes(cityQ)
          ? 1.0
          : cityQ.includes(mentorCity.split(",")[0]?.trim() ?? "__nope__")
            ? 0.5
            : 0
        : 0.5;

      const culture =
        cultureFilter === "any"
          ? 0.5
          : m.cultural_tradition.includes(cultureFilter)
            ? 1.0
            : 0;

      const expertise =
        expertiseFilter === "any"
          ? 0.5
          : m.expertise_tags.includes(expertiseFilter)
            ? 1.0
            : 0;

      const budget =
        budgetFilter === "any"
          ? 0.5
          : m.budget_range === budgetFilter
            ? 1.0
            : 0;

      const active = useMentoringStore
        .getState()
        .getActiveMenteesForMentor(m.id).length;
      const capacity = 1 - active / Math.max(m.max_active_mentees, 1);

      const ratingFactor = m.avg_rating ? m.avg_rating / 5 : 0.7;

      const score =
        cityScore * 0.25 +
        culture * 0.25 +
        expertise * 0.15 +
        budget * 0.15 +
        capacity * 0.1 +
        ratingFactor * 0.1;

      return { mentor: m, score };
    });
  }, [availableMentors, cityFilter, cultureFilter, expertiseFilter, budgetFilter]);

  const filtered = useMemo(() => {
    const list = [...scored];
    if (sort === "best") list.sort((a, b) => b.score - a.score);
    else if (sort === "active")
      list.sort(
        (a, b) =>
          new Date(b.mentor.updated_at).getTime() -
          new Date(a.mentor.updated_at).getTime(),
      );
    else
      list.sort(
        (a, b) =>
          new Date(b.mentor.created_at).getTime() -
          new Date(a.mentor.created_at).getTime(),
      );
    return list;
  }, [scored, sort]);

  const [requestTarget, setRequestTarget] = useState<MentorProfile | null>(null);

  const myPending = useMemo(
    () =>
      myProfileId
        ? allMatches.filter(
            (m) =>
              m.mentee_profile_id === myProfileId &&
              (m.status === "pending" || m.status === "active"),
          )
        : [],
    [allMatches, myProfileId],
  );

  return (
    <div className="px-6 pb-12 pt-5 md:px-10">
      <div className="mx-auto max-w-6xl">
        <header>
          <p
            className="font-mono text-[10px] uppercase tracking-[0.22em] text-saffron"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            — ask a married bride —
          </p>
          <h2 className="mt-1.5 font-serif text-[26px] leading-tight text-ink">
            get advice from someone who&rsquo;s been exactly where you are.
          </h2>
          <p className="mt-2 max-w-xl text-[13.5px] leading-relaxed text-ink-muted">
            mentors are brides who just got married and opted in to help. pick
            one whose wedding looked like yours and ask the questions you
            can&rsquo;t google.
          </p>
        </header>

        <Filters
          cityFilter={cityFilter}
          setCityFilter={setCityFilter}
          cultureFilter={cultureFilter}
          setCultureFilter={setCultureFilter}
          expertiseFilter={expertiseFilter}
          setExpertiseFilter={setExpertiseFilter}
          budgetFilter={budgetFilter}
          setBudgetFilter={setBudgetFilter}
          sort={sort}
          setSort={setSort}
          availableCount={filtered.length}
        />

        {filtered.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((row) => {
              const profile =
                allProfiles.find((p) => p.id === row.mentor.profile_id) ??
                synthesizeProfileFromMentor(row.mentor);
              return (
                <StoryCard
                  key={row.mentor.id}
                  profile={profile}
                  onOpen={() => setRequestTarget(row.mentor)}
                />
              );
            })}
          </div>
        )}
      </div>

      {requestTarget && myProfileId && (
        <RequestModal
          mentor={requestTarget}
          menteeProfileId={myProfileId}
          onClose={() => setRequestTarget(null)}
        />
      )}
    </div>
  );
}

// ── Filters ────────────────────────────────────────────────────────────────

function Filters({
  cityFilter,
  setCityFilter,
  cultureFilter,
  setCultureFilter,
  expertiseFilter,
  setExpertiseFilter,
  budgetFilter,
  setBudgetFilter,
  sort,
  setSort,
  availableCount,
}: {
  cityFilter: string;
  setCityFilter: (v: string) => void;
  cultureFilter: string;
  setCultureFilter: (v: string) => void;
  expertiseFilter: string;
  setExpertiseFilter: (v: string) => void;
  budgetFilter: BudgetRange | "any";
  setBudgetFilter: (v: BudgetRange | "any") => void;
  sort: "best" | "active" | "new";
  setSort: (v: "best" | "active" | "new") => void;
  availableCount: number;
}) {
  return (
    <div className="mt-6 rounded-xl border border-gold/15 bg-ivory-warm/30 px-4 py-3">
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-[160px] flex-1">
          <FilterLabel>City</FilterLabel>
          <div className="relative">
            <Search
              size={13}
              strokeWidth={1.8}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-faint"
            />
            <input
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              placeholder="any city"
              className="w-full rounded-md border border-border bg-white py-1.5 pl-8 pr-3 text-[12.5px] text-ink focus:border-saffron/60 focus:outline-none"
            />
          </div>
        </div>

        <div className="min-w-[150px] flex-1">
          <FilterLabel>Culture</FilterLabel>
          <FilterSelect value={cultureFilter} onChange={setCultureFilter}>
            <option value="any">any</option>
            <option value="south_asian">south asian</option>
            <option value="east_asian">east asian</option>
            <option value="western">western</option>
            <option value="latin_american">latin american</option>
            <option value="middle_eastern">middle eastern</option>
            <option value="african">african</option>
          </FilterSelect>
        </div>

        <div className="min-w-[180px] flex-1">
          <FilterLabel>Help with</FilterLabel>
          <FilterSelect value={expertiseFilter} onChange={setExpertiseFilter}>
            <option value="any">any</option>
            {EXPERTISE_TAGS.map((t) => (
              <option key={t.slug} value={t.slug}>
                {t.label}
              </option>
            ))}
          </FilterSelect>
        </div>

        <div className="min-w-[140px] flex-1">
          <FilterLabel>Budget</FilterLabel>
          <FilterSelect
            value={budgetFilter}
            onChange={(v) => setBudgetFilter(v as BudgetRange | "any")}
          >
            <option value="any">any</option>
            {BUDGET_RANGES.map((r) => (
              <option key={r.id} value={r.id}>
                {r.label}
              </option>
            ))}
          </FilterSelect>
        </div>

        <div className="min-w-[130px]">
          <FilterLabel>Sort by</FilterLabel>
          <FilterSelect value={sort} onChange={(v) => setSort(v as typeof sort)}>
            <option value="best">Best match</option>
            <option value="active">Most active</option>
            <option value="new">Newest</option>
          </FilterSelect>
        </div>
      </div>
      <p
        className="mt-2 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {availableCount} mentor{availableCount === 1 ? "" : "s"} available
      </p>
    </div>
  );
}

function FilterLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="mb-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted"
      style={{ fontFamily: "var(--font-mono)" }}
    >
      {children}
    </p>
  );
}

function FilterSelect({
  value,
  onChange,
  children,
}: {
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-md border border-border bg-white px-2.5 py-1.5 text-[12.5px] text-ink focus:border-saffron/60 focus:outline-none"
    >
      {children}
    </select>
  );
}

// ── Profile shim ───────────────────────────────────────────────────────────
// Seed mentors may link to a profile_id that isn't in the community profiles
// store (e.g., seed-ananya). When that happens, we build a minimal
// CommunityProfile so StoryCard can render using mentor data directly. The
// shim is read-only — it never gets persisted to the profiles store.

function synthesizeProfileFromMentor(mentor: MentorProfile): CommunityProfile {
  const nowIso = new Date().toISOString();
  return {
    id: mentor.profile_id,
    user_id: mentor.profile_id,
    display_name: mentor.display_name,
    cover_seed_gradient: fallbackGradientFor(mentor.profile_id),
    cover_seed_label: mentor.display_name.toLowerCase(),
    wedding_city: mentor.wedding_city,
    wedding_date: mentor.wedding_date,
    wedding_events: [],
    color_palette: [],
    fun_facts: {},
    open_to_connect: true,
    looking_for: [],
    // Mark as experienced so the card uses the saffron circle-guide styling.
    // StoryCard's mentor-specific branches take precedence anyway — this
    // mostly controls the cover badge and hover ring.
    is_experienced: true,
    created_at: nowIso,
    updated_at: nowIso,
  };
}

// ── Request modal ──────────────────────────────────────────────────────────

function RequestModal({
  mentor,
  menteeProfileId,
  onClose,
}: {
  mentor: MentorProfile;
  menteeProfileId: string;
  onClose: () => void;
}) {
  const requestMentorship = useMentoringStore((s) => s.requestMentorship);
  const menteeProfile = useCommunityProfilesStore((s) =>
    s.profiles.find((p) => p.id === menteeProfileId),
  );

  const [topics, setTopics] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const canSubmit = topics.length > 0 && !success;

  if (success) {
    return (
      <ModalShell onClose={onClose}>
        <div className="flex flex-col items-center text-center">
          <Sparkles size={24} strokeWidth={1.6} className="text-saffron" />
          <h3 className="mt-3 font-serif text-[20px] text-ink">
            request sent to {mentor.display_name}.
          </h3>
          <p className="mt-2 max-w-md text-[13px] leading-relaxed text-ink-muted">
            she&rsquo;ll see it in her mentor dashboard. if she accepts, a chat
            thread opens automatically in your messages. pending requests
            expire after 7 days.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="mt-4 rounded-full bg-ink px-4 py-1.5 text-[12px] font-medium text-ivory hover:bg-ink-soft"
          >
            Got it
          </button>
        </div>
      </ModalShell>
    );
  }

  return (
    <ModalShell onClose={onClose}>
      <header>
        <p
          className="font-mono text-[10px] uppercase tracking-[0.18em] text-saffron"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          — ask {mentor.display_name} to be your mentor —
        </p>
        <h3 className="mt-1.5 font-serif text-[20px] leading-snug text-ink">
          tell her a little about your wedding and what you&rsquo;d love her
          help with.
        </h3>
      </header>

      <div className="mt-4 rounded-md border border-gold/15 bg-ivory-warm/30 px-3 py-2.5 text-[12px] leading-relaxed text-ink">
        <p
          className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-muted"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Sharing with {mentor.display_name}
        </p>
        <p className="mt-0.5">
          {menteeProfile?.display_name ?? "You"}
          {menteeProfile?.wedding_city ? ` · ${menteeProfile.wedding_city}` : ""}
          {menteeProfile?.wedding_date
            ? ` · ${new Date(menteeProfile.wedding_date).toLocaleDateString("en-US", { month: "long", year: "numeric" })}`
            : ""}
        </p>
      </div>

      <div className="mt-4">
        <p className="text-[12px] font-medium text-ink">
          What do you want help with?{" "}
          <span className="text-ink-faint">
            (pick from what {mentor.display_name} can help with)
          </span>
        </p>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {mentor.expertise_tags.map((slug) => {
            const tag = EXPERTISE_TAGS.find((t) => t.slug === slug);
            const on = topics.includes(slug);
            return (
              <button
                key={slug}
                type="button"
                onClick={() =>
                  setTopics((prev) =>
                    on ? prev.filter((t) => t !== slug) : [...prev, slug],
                  )
                }
                className={cn(
                  "rounded-full border px-2.5 py-1 text-[11.5px] font-medium transition-colors",
                  on
                    ? "border-saffron bg-saffron text-white"
                    : "border-saffron/30 bg-white text-ink hover:border-saffron/60",
                )}
              >
                {tag?.label ?? slug}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-4">
        <div className="mb-1 flex items-baseline justify-between">
          <span className="text-[12px] font-medium text-ink">Your message</span>
          <span className="text-[10.5px] text-ink-faint">{message.length} / 500</span>
        </div>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value.slice(0, 500))}
          rows={4}
          placeholder={`hi ${mentor.display_name}! i'm planning a wedding and your experience with…`}
          className="w-full resize-y rounded-md border border-border bg-white px-3 py-2 text-[13px] leading-relaxed text-ink placeholder:text-ink-faint focus:border-saffron/60 focus:outline-none"
        />
      </div>

      {error && (
        <p className="mt-3 rounded-md bg-rose/10 px-3 py-2 text-[12px] text-rose">
          {error}
        </p>
      )}

      <div className="mt-4 flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="rounded-md border border-border bg-white px-3 py-1.5 text-[12px] font-medium text-ink-muted hover:border-saffron/40 hover:text-saffron"
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={!canSubmit}
          onClick={() => {
            const result = requestMentorship({
              mentor_profile_id: mentor.id,
              mentee_profile_id: menteeProfileId,
              topics_interested_in: topics,
              request_message: message.trim() || undefined,
            });
            if ("error" in result) setError(result.error);
            else setSuccess(true);
          }}
          className="inline-flex items-center gap-1.5 rounded-md bg-ink px-3 py-1.5 text-[12px] font-medium text-ivory transition-colors hover:bg-ink-soft disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Heart size={12} strokeWidth={1.9} />
          Send request
        </button>
      </div>
    </ModalShell>
  );
}

function ModalShell({
  onClose,
  children,
}: {
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4 py-10 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-gold/15 bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 rounded-full p-1.5 text-ink-muted hover:bg-ivory-warm hover:text-ink"
          aria-label="Close"
        >
          <X size={16} strokeWidth={1.8} />
        </button>
        {children}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="mt-14 flex flex-col items-center justify-center py-10 text-center">
      <Sparkles size={22} strokeWidth={1.5} className="text-saffron" />
      <p className="mt-4 font-serif text-[22px] italic text-ink">
        no mentors match that filter yet.
      </p>
      <p className="mt-2 max-w-[420px] text-[14px] leading-[1.65] text-ink-muted">
        try widening the city or culture filter — or check back soon, new
        mentors opt in weekly.
      </p>
    </div>
  );
}
