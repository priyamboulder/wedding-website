"use client";

// ── Story card ──────────────────────────────────────────────────────────────
// Compact magazine-style bride card — wider 4:3 cover with the couple name
// overlaid, a 2-line quote teaser, three tiny thumbnails, and a short CTA
// row. Browsing-first: on 1080p a user should see ~4-6 cards at once.

import { useMemo } from "react";
import { MessageCircle, Mic, Video } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CommunityProfile, ProfilePhoto } from "@/types/community";
import {
  renderableFromPhoto,
  renderableCover,
  fallbackGradientFor,
  type RenderablePhoto,
} from "@/lib/community/photos";
import { useCommunityProfilesStore } from "@/stores/community-profiles-store";
import { useCommunitySocialStore } from "@/stores/community-social-store";
import { useMentoringStore } from "@/stores/mentoring-store";
import { useVendorNeedsStore } from "@/stores/vendor-needs-store";
import { getVendorNeedCategory } from "@/types/vendor-needs";
import {
  EXPERTISE_TAGS,
  type MentorCommPref,
  type MentorProfile,
} from "@/types/mentoring";

// Rotating pull-quote prompts shown on mentor cards. The prompt is picked
// from this pool based on the profile id so each card in the feed picks a
// stable-but-varied one across renders.
const MENTOR_PROMPTS: Array<{
  key: "one_thing_i_wish" | "best_decision" | "biggest_surprise";
  label: string;
}> = [
  { key: "one_thing_i_wish", label: "the one thing I wish I'd known" },
  { key: "best_decision", label: "the best decision I made" },
  { key: "biggest_surprise", label: "what surprised me most" },
];

const COMM_ICON: Record<MentorCommPref, typeof MessageCircle> = {
  chat: MessageCircle,
  huddle: Mic,
  video: Video,
};

// Hash-ish seed so the same profile always picks the same prompt (stable
// between re-renders) but the feed still looks varied.
function pickPromptIndex(profileId: string, poolLength: number): number {
  let h = 0;
  for (let i = 0; i < profileId.length; i++) {
    h = (h * 31 + profileId.charCodeAt(i)) >>> 0;
  }
  return h % Math.max(poolLength, 1);
}

const SHORT_MONTH = [
  "jan",
  "feb",
  "mar",
  "apr",
  "may",
  "jun",
  "jul",
  "aug",
  "sep",
  "oct",
  "nov",
  "dec",
];

function formatShortDate(iso?: string): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  // "nov 26" — two-digit year saves horizontal space in the narrower card.
  const yy = String(d.getFullYear()).slice(-2);
  return `${SHORT_MONTH[d.getMonth()]} ${yy}`;
}

// Drop state/country for compactness. "Dallas, TX" → "Dallas".
function shortCity(city?: string): string | undefined {
  if (!city) return undefined;
  return city.split(",")[0]?.trim() || city;
}

export function StoryCard({
  profile,
  onOpen,
}: {
  profile: CommunityProfile;
  onOpen: () => void;
}) {
  const myProfileId = useCommunityProfilesStore((s) => s.myProfileId);
  const allPhotos = useCommunityProfilesStore((s) => s.photos);
  const connections = useCommunitySocialStore((s) => s.connections);
  const allNeeds = useVendorNeedsStore((s) => s.needs);
  const isDiscoverable = useVendorNeedsStore((s) => s.isDiscoverable);

  const lookingEmojis = useMemo<string[]>(() => {
    if (!isDiscoverable(profile.id)) return [];
    return allNeeds
      .filter(
        (n) =>
          n.profile_id === profile.id &&
          n.status === "looking" &&
          n.is_visible_to_vendors,
      )
      .sort((a, b) => {
        const ca = getVendorNeedCategory(a.category_slug)?.sort_order ?? 99;
        const cb = getVendorNeedCategory(b.category_slug)?.sort_order ?? 99;
        return ca - cb;
      })
      .slice(0, 6)
      .map((n) => getVendorNeedCategory(n.category_slug)?.emoji ?? "")
      .filter(Boolean);
  }, [allNeeds, isDiscoverable, profile.id]);

  const connection = useMemo(
    () =>
      myProfileId
        ? connections.find(
            (c) =>
              (c.requester_id === myProfileId && c.recipient_id === profile.id) ||
              (c.requester_id === profile.id && c.recipient_id === myProfileId),
          )
        : undefined,
    [connections, myProfileId, profile.id],
  );

  const photoStrip = useMemo<RenderablePhoto[]>(() => {
    const rows = allPhotos
      .filter((p) => p.profile_id === profile.id)
      .sort((a, b) => a.sort_order - b.sort_order)
      .slice(0, 3);
    return rows.map((p) => renderableFromPhoto(p as ProfilePhoto));
  }, [allPhotos, profile.id]);

  const cover =
    renderableCover(profile) ??
    ({
      kind: "gradient",
      colors: fallbackGradientFor(profile.id),
      label: profile.display_name,
    } satisfies RenderablePhoto);

  const route = [shortCity(profile.hometown), shortCity(profile.wedding_city)]
    .filter(Boolean)
    .join(" → ");
  const shortDate = formatShortDate(profile.wedding_date);

  const quote = profile.quote || profile.wedding_vibe;

  let cta = "💛 say hi";
  let ctaTone: "primary" | "muted" = "primary";
  if (connection) {
    if (connection.status === "pending") {
      cta =
        connection.requester_id === myProfileId
          ? "request sent"
          : "wants to say hi →";
      ctaTone = "muted";
    } else if (connection.status === "accepted") {
      cta = "connected 💬";
      ctaTone = "muted";
    }
  }

  const isExperienced = !!profile.is_experienced;

  const mentor = useMentoringStore((s) =>
    s.mentors.find((r) => r.profile_id === profile.id),
  );
  const allStoryMatches = useMentoringStore((s) => s.matches);
  const activeMenteeCount = useMemo(
    () =>
      mentor
        ? allStoryMatches.filter(
            (m) => m.mentor_profile_id === mentor.id && m.status === "active",
          ).length
        : 0,
    [allStoryMatches, mentor],
  );
  const isMentor = !!(mentor && mentor.is_active && !mentor.is_paused);

  // Pick the featured pull-quote from whichever prompts the mentor filled in.
  const mentorPrompt = useMemo(() => {
    if (!isMentor || !mentor) return null;
    const pool = MENTOR_PROMPTS.filter((p) => Boolean(mentor[p.key]));
    if (pool.length === 0) return null;
    const pick = pool[pickPromptIndex(profile.id, pool.length)];
    return { label: pick.label, body: mentor[pick.key] as string };
  }, [isMentor, mentor, profile.id]);

  // Mentor rewrites the CTA. "Ask Name →" when capacity is available,
  // quietened when full or when a request is already in flight.
  if (isMentor && mentor) {
    if (!connection) {
      const atCapacity = activeMenteeCount >= mentor.max_active_mentees;
      if (atCapacity) {
        cta = "currently full";
        ctaTone = "muted";
      } else {
        const firstName = profile.display_name.split(" ")[0] ?? profile.display_name;
        cta = `ask ${firstName.toLowerCase()} →`;
        ctaTone = "primary";
      }
    }
  }

  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-2xl border bg-white text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-[0_14px_40px_rgba(28,25,23,0.08)]",
        isExperienced
          ? "border-saffron/25 hover:border-saffron/50"
          : "border-gold/15 hover:border-gold/40",
      )}
    >
      <CoverTile
        photo={cover}
        coupleLabel={profile.cover_seed_label ?? profile.display_name}
        badge={
          isExperienced
            ? shortDate
              ? `married ${shortDate}`
              : "been there"
            : undefined
        }
      />

      <div className="flex flex-1 flex-col px-4 pb-4 pt-3">
        <p className="flex items-center gap-1.5 truncate text-[12.5px] font-medium text-ink">
          <span className="truncate">{profile.display_name}</span>
          {isMentor && (
            <span
              className="inline-flex shrink-0 items-center gap-0.5 rounded-full border border-saffron/35 bg-saffron/10 px-1.5 py-[1px] font-mono text-[8.5px] uppercase tracking-[0.16em] text-saffron"
              style={{ fontFamily: "var(--font-mono)" }}
              aria-label="Mentor"
            >
              💛 mentor
            </span>
          )}
          <span className="truncate font-normal text-ink-muted">
            {route ? ` · ${route}` : ""}
            {!isExperienced && shortDate ? ` · ${shortDate}` : ""}
          </span>
        </p>

        {quote && (
          <p className="mt-2 line-clamp-2 font-serif text-[13.5px] italic leading-[1.5] text-ink">
            &ldquo;{quote}&rdquo;
          </p>
        )}

        {mentorPrompt && (
          <div className="mt-2.5 rounded-md border border-saffron/20 bg-saffron/5 px-2.5 py-2">
            <p
              className="font-mono text-[8.5px] uppercase tracking-[0.16em] text-saffron"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              &ldquo;{mentorPrompt.label}&rdquo;
            </p>
            <p className="mt-0.5 line-clamp-2 font-serif text-[12.5px] italic leading-[1.5] text-ink">
              {mentorPrompt.body}
            </p>
          </div>
        )}

        {photoStrip.length > 0 && !mentorPrompt && (
          <div className="mt-3 flex gap-1.5">
            {photoStrip.map((p, i) => (
              <MiniThumb key={i} photo={p} />
            ))}
          </div>
        )}

        {isMentor && mentor && mentor.expertise_tags.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {mentor.expertise_tags.slice(0, 3).map((slug) => {
              const tag = EXPERTISE_TAGS.find((t) => t.slug === slug);
              return (
                <span
                  key={slug}
                  className="rounded-full border border-saffron/25 bg-saffron/5 px-2 py-0.5 text-[10.5px] text-ink"
                >
                  {tag?.label ?? slug}
                </span>
              );
            })}
          </div>
        ) : isExperienced && profile.expertise_tags && profile.expertise_tags.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {profile.expertise_tags.slice(0, 3).map((t) => (
              <span
                key={t}
                className="rounded-full border border-saffron/25 bg-saffron/5 px-2 py-0.5 text-[10.5px] text-ink"
              >
                {t}
              </span>
            ))}
          </div>
        ) : (
          lookingEmojis.length > 0 && (
            <p
              className="mt-3 text-[11px] text-ink-faint"
              title="still looking for"
            >
              <span className="mr-1 text-[14px] tracking-tight" aria-hidden>
                {lookingEmojis.join(" ")}
              </span>
              <span className="italic">
                still looking ({lookingEmojis.length})
              </span>
            </p>
          )
        )}

        {isMentor && mentor && (
          <MentorStatsLine
            mentor={mentor}
            activeCount={activeMenteeCount}
          />
        )}

        <div className="mt-3 flex items-center justify-between border-t border-gold/10 pt-2.5">
          <span className="text-[10.5px] text-ink-faint">
            {isMentor
              ? "💛 mentor"
              : isExperienced
                ? "here to help"
                : "tap to read"}
          </span>
          <span
            className={cn(
              "inline-flex items-center gap-1 text-[11.5px] font-medium",
              ctaTone === "primary" ? "text-saffron" : "text-ink-muted",
            )}
          >
            {cta}
          </span>
        </div>
      </div>
    </button>
  );
}

// ── Cover tile ──────────────────────────────────────────────────────────────
// 4:3 landscape, max 200px tall on desktop / 180px tablet. object-position
// "center top" keeps faces in frame when cropping is aggressive.

function CoverTile({
  photo,
  coupleLabel,
  badge,
}: {
  photo: RenderablePhoto;
  coupleLabel: string;
  badge?: string;
}) {
  return (
    <div className="relative aspect-[4/3] max-h-[200px] w-full overflow-hidden bg-ivory-warm md:max-h-[180px] lg:max-h-[200px]">
      {photo.kind === "url" ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photo.url}
          alt=""
          className="h-full w-full object-cover object-[center_top] transition-transform duration-700 group-hover:scale-[1.03]"
          draggable={false}
        />
      ) : (
        <div
          className="h-full w-full"
          style={{
            background: `linear-gradient(135deg, ${photo.colors[0]} 0%, ${photo.colors[1]} 100%)`,
          }}
        />
      )}
      {badge && (
        <span
          className="absolute right-2 top-2 rounded-full bg-white/90 px-2.5 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink backdrop-blur-sm"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          ✓ {badge}
        </span>
      )}
      <span
        className="absolute bottom-2 left-3 font-serif text-sm italic tracking-[0.01em] text-white"
        style={{ textShadow: "0 1px 6px rgba(0,0,0,0.35)" }}
      >
        {coupleLabel}
      </span>
    </div>
  );
}

// ── Mentor stats line ──────────────────────────────────────────────────────
// Tight single-line summary: "2 helping · ★ 4.8 · 💬 🎙️". Rating only renders
// once the mentor has at least one completed match so new mentors don't look
// unrated. Preferred-communication icons stay muted — they're a hint, not a
// badge.

function MentorStatsLine({
  mentor,
  activeCount,
}: {
  mentor: MentorProfile;
  activeCount: number;
}) {
  return (
    <div className="mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10.5px] text-ink-muted">
      <span>
        {activeCount === 0
          ? "open to mentees"
          : `helping ${activeCount} ${activeCount === 1 ? "bride" : "brides"}`}
      </span>
      {mentor.avg_rating != null && mentor.total_mentees_helped > 0 && (
        <>
          <span className="text-ink-faint">·</span>
          <span>
            <span className="text-saffron">★</span>{" "}
            {mentor.avg_rating.toFixed(1)}
            <span className="text-ink-faint"> from {mentor.total_mentees_helped}</span>
          </span>
        </>
      )}
      {mentor.preferred_communication.length > 0 && (
        <>
          <span className="text-ink-faint">·</span>
          <span className="inline-flex items-center gap-0.5">
            {mentor.preferred_communication.map((c) => {
              const Icon = COMM_ICON[c];
              return (
                <Icon
                  key={c}
                  size={10}
                  strokeWidth={1.8}
                  className="text-ink-faint"
                />
              );
            })}
          </span>
        </>
      )}
    </div>
  );
}

function MiniThumb({ photo }: { photo: RenderablePhoto }) {
  const base =
    "h-12 w-12 shrink-0 overflow-hidden rounded-md bg-ivory-warm";
  if (photo.kind === "url") {
    return (
      <div className={base}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photo.url}
          alt=""
          className="h-full w-full object-cover"
          draggable={false}
        />
      </div>
    );
  }
  return (
    <div
      className={base}
      style={{
        background: `linear-gradient(135deg, ${photo.colors[0]} 0%, ${photo.colors[1]} 100%)`,
      }}
    />
  );
}
