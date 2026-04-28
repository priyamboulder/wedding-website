"use client";

// ── Bride detail panel ──────────────────────────────────────────────────────
// Right-side slide-over with a rich, scrollable profile: hero cover, basics,
// full quote, wedding-details card (events · vibe · palette · song), photo
// gallery, interests, fun-fact prompts, and a warm "say hello" CTA card.
// Block + report live at the bottom in a quieter row.

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Calendar,
  Flag,
  MapPin,
  MessageCircle,
  Music,
  Send,
  Sparkles,
  UserX,
  Users,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getInterestTag, GUEST_COUNT_LABEL } from "@/lib/community/labels";
import { getProfilePrompt } from "@/lib/community/seed";
import { renderableFromPhoto, renderableCover, fallbackGradientFor, type RenderablePhoto } from "@/lib/community/photos";
import { useCommunityProfilesStore } from "@/stores/community-profiles-store";
import { useCommunitySocialStore } from "@/stores/community-social-store";
import { useMentoringStore } from "@/stores/mentoring-store";
import { useVendorNeedsStore } from "@/stores/vendor-needs-store";
import type { CommunityProfile, ProfilePhoto, WeddingEvent } from "@/types/community";
import { WEDDING_EVENTS } from "@/types/community";
import {
  BUDGET_RANGES,
  getVendorNeedCategory,
} from "@/types/vendor-needs";
import { EXPERTISE_TAGS } from "@/types/mentoring";

const MONTH_LONG = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function formatLongDate(iso?: string): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return `${MONTH_LONG[d.getMonth()]} ${d.getFullYear()}`;
}

export function BrideDetailPanel({
  profileId,
  onClose,
}: {
  profileId: string | null;
  onClose: () => void;
}) {
  const profiles = useCommunityProfilesStore((s) => s.profiles);
  const profile = useMemo(
    () => (profileId ? profiles.find((p) => p.id === profileId) : undefined),
    [profiles, profileId],
  );
  const open = !!profileId && !!profile;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && profile && (
        <>
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-ink/30 backdrop-blur-sm"
          />
          <motion.aside
            key="panel"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[520px] flex-col bg-white shadow-xl"
            role="dialog"
            aria-label={`${profile.display_name}'s profile`}
          >
            <PanelBody profileId={profile.id} onClose={onClose} />
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

// ── Panel body ──────────────────────────────────────────────────────────────

function PanelBody({
  profileId,
  onClose,
}: {
  profileId: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const profiles = useCommunityProfilesStore((s) => s.profiles);
  const myProfileId = useCommunityProfilesStore((s) => s.myProfileId);
  const blockProfile = useCommunityProfilesStore((s) => s.blockProfile);
  const allPhotos = useCommunityProfilesStore((s) => s.photos);

  const profile = useMemo(
    () => profiles.find((p) => p.id === profileId),
    [profiles, profileId],
  );

  const gallery = useMemo(() => {
    return allPhotos
      .filter((p) => p.profile_id === profileId)
      .sort((a, b) => a.sort_order - b.sort_order);
  }, [allPhotos, profileId]);

  const allConnections = useCommunitySocialStore((s) => s.connections);
  const connection = useMemo(
    () =>
      myProfileId
        ? allConnections.find(
            (c) =>
              (c.requester_id === myProfileId && c.recipient_id === profileId) ||
              (c.requester_id === profileId && c.recipient_id === myProfileId),
          )
        : undefined,
    [allConnections, myProfileId, profileId],
  );

  const requestConnection = useCommunitySocialStore((s) => s.requestConnection);
  const respondConnection = useCommunitySocialStore((s) => s.respondConnection);
  const reportProfile = useCommunitySocialStore((s) => s.reportProfile);

  const [introMessage, setIntroMessage] = useState("");
  const [showReport, setShowReport] = useState(false);
  const [reportReason, setReportReason] = useState("");

  if (!profile) return null;

  const cover =
    renderableCover(profile) ??
    ({
      kind: "gradient",
      colors: fallbackGradientFor(profile.id),
      label: profile.display_name,
    } satisfies RenderablePhoto);

  const weddingDate = formatLongDate(profile.wedding_date);
  const route = [profile.hometown, profile.wedding_city].filter(Boolean).join(" → ");

  const state = (() => {
    if (!myProfileId) return { kind: "needs-profile" as const };
    if (!connection) return { kind: "can-connect" as const };
    if (connection.status === "pending") {
      if (connection.recipient_id === myProfileId) {
        return { kind: "respond" as const, connectionId: connection.id };
      }
      return { kind: "sent" as const };
    }
    if (connection.status === "accepted")
      return { kind: "connected" as const, connectionId: connection.id };
    return { kind: "can-connect" as const };
  })();

  const sendRequest = () => {
    if (!myProfileId) return;
    requestConnection(myProfileId, profileId, introMessage.trim() || undefined);
    setIntroMessage("");
  };

  const submitReport = () => {
    if (!myProfileId) return;
    if (reportReason.trim().length === 0) return;
    reportProfile(myProfileId, profileId, reportReason.trim());
    setShowReport(false);
    setReportReason("");
    alert("Thanks — we'll take a look and follow up if we need more from you.");
  };

  const doBlock = () => {
    if (!myProfileId) return;
    if (
      !confirm(
        `Block ${profile.display_name}? They won't be able to see your profile or message you.`,
      )
    )
      return;
    blockProfile(profileId);
    onClose();
  };

  const goToThread = () => {
    if (state.kind !== "connected") return;
    const p = new URLSearchParams(searchParams?.toString() ?? "");
    p.set("tab", "brides");
    p.set("view", "messages");
    p.set("thread", state.connectionId);
    router.replace(`/community?${p.toString()}`, { scroll: false });
    onClose();
  };

  // Filter fun-fact entries that actually have values.
  const funFacts = Object.entries(profile.fun_facts ?? {}).filter(
    ([, v]) => v && v.trim().length > 0,
  );

  return (
    <>
      <div className="flex items-center justify-between border-b border-gold/10 px-6 py-3.5">
        <p
          className="font-mono text-[10px] uppercase tracking-[0.22em] text-gold"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Bride profile
        </p>
        <button
          type="button"
          onClick={onClose}
          className="text-ink-muted transition-colors hover:text-ink"
          aria-label="Close"
        >
          <X size={18} strokeWidth={1.6} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Cover */}
        <CoverHero photo={cover} />

        {/* Name + basics */}
        <div className="px-8 pb-4 pt-6">
          <h2 className="font-serif text-[32px] font-medium leading-[1.05] tracking-[-0.01em] text-ink">
            {profile.display_name}
            {profile.partner_name && (
              <span className="font-serif text-[22px] italic text-ink-muted">
                {" "}
                &amp; {profile.partner_name}
              </span>
            )}
          </h2>
          <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-ink-muted">
            {route && <span>{route}</span>}
            {route && weddingDate && <span className="text-ink-faint">·</span>}
            {weddingDate && <span>{weddingDate}</span>}
            {profile.guest_count_range && (
              <>
                <span className="text-ink-faint">·</span>
                <span>{GUEST_COUNT_LABEL[profile.guest_count_range]} guests</span>
              </>
            )}
          </div>
        </div>

        {/* Quote */}
        {profile.quote && (
          <div className="px-8 pb-6">
            <p className="font-serif text-[18px] italic leading-[1.6] text-ink">
              &ldquo;{profile.quote}&rdquo;
            </p>
          </div>
        )}

        {/* Here to help — experienced brides only */}
        {profile.is_experienced &&
          (profile.here_to_help ||
            (profile.expertise_tags && profile.expertise_tags.length > 0)) && (
            <div className="mx-8 mb-6 rounded-2xl border border-saffron/25 bg-saffron/5 px-5 py-4">
              <p
                className="font-mono text-[10px] uppercase tracking-[0.22em] text-saffron"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                — here to help —
              </p>
              {profile.here_to_help && (
                <p className="mt-2 font-serif text-[15px] italic leading-[1.6] text-ink">
                  {profile.here_to_help}
                </p>
              )}
              {profile.expertise_tags && profile.expertise_tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {profile.expertise_tags.map((t) => (
                    <span
                      key={t}
                      className="rounded-full border border-saffron/30 bg-white px-2.5 py-0.5 text-[11.5px] text-ink"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

        {/* Mentor spotlight — if this bride opted in as a mentor */}
        <MentorSpotlight profile={profile} />

        {/* About my wedding */}
        <WeddingDetails profile={profile} />

        {/* Still looking for */}
        <StillLookingFor profileId={profile.id} />

        {/* Photo gallery */}
        {gallery.length > 0 && (
          <Section title="photos">
            <PhotoGrid photos={gallery as ProfilePhoto[]} />
          </Section>
        )}

        {/* Interests */}
        {profile.looking_for.length > 0 && (
          <Section title="what i'd love to chat about">
            <div className="flex flex-wrap gap-1.5">
              {profile.looking_for.map((slug) => {
                const tag = getInterestTag(slug);
                if (!tag) return null;
                return (
                  <span
                    key={slug}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border bg-ivory-warm/40 px-3 py-1 text-[12px] text-ink"
                  >
                    <span aria-hidden>{tag.emoji}</span>
                    {tag.label}
                  </span>
                );
              })}
            </div>
          </Section>
        )}

        {/* Fun facts */}
        {funFacts.length > 0 && (
          <Section title="fun facts">
            <dl className="space-y-3.5">
              {funFacts.map(([slug, value]) => {
                const prompt = getProfilePrompt(slug);
                return (
                  <div key={slug}>
                    <dt className="text-[11.5px] font-medium uppercase tracking-[0.12em] text-ink-faint">
                      {prompt?.prompt_text ?? slug}
                    </dt>
                    <dd className="mt-1 text-[14px] leading-[1.55] text-ink">
                      {value}
                    </dd>
                  </div>
                );
              })}
            </dl>
          </Section>
        )}

        {/* Say hello CTA */}
        <div className="px-8 py-7">
          {state.kind === "needs-profile" && (
            <p className="rounded-2xl border border-dashed border-gold/25 bg-ivory-warm/20 px-4 py-6 text-center text-[13px] italic text-ink-muted">
              set up your own profile to say hello to {profile.display_name}.
            </p>
          )}

          {state.kind === "can-connect" && (
            <div className="rounded-2xl border border-gold/25 bg-gradient-to-br from-ivory-warm/40 via-white to-ivory-warm/20 p-5 shadow-sm">
              <p
                className="font-mono text-[10px] uppercase tracking-[0.22em] text-gold"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                ✨ say hello
              </p>
              <h3 className="mt-2 font-serif text-[22px] font-medium leading-[1.15] text-ink">
                reach out to {profile.display_name.toLowerCase()}.
              </h3>
              <p className="mt-1.5 text-[13px] leading-[1.55] text-ink-muted">
                a quick line about what caught your eye goes further than a cold
                request. skip it if you want.
              </p>
              <textarea
                rows={3}
                value={introMessage}
                onChange={(e) => setIntroMessage(e.target.value)}
                placeholder={`hey ${profile.display_name.toLowerCase()} — saw you're also planning ${profile.wedding_city ? `in ${profile.wedding_city.split(",")[0]}` : "around the same time"}. would love to swap notes!`}
                maxLength={280}
                className="mt-3 w-full resize-none rounded-lg border border-border bg-white px-3 py-2 text-[13.5px] leading-[1.55] text-ink placeholder:text-ink-faint focus:border-saffron/60 focus:outline-none focus:ring-2 focus:ring-saffron/15"
              />
              <div className="mt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={sendRequest}
                  className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2 text-[13px] font-medium text-ivory transition-colors hover:bg-ink-soft"
                >
                  <Send size={13} strokeWidth={1.8} />
                  send hello
                </button>
              </div>
            </div>
          )}

          {state.kind === "sent" && (
            <div className="rounded-2xl border border-gold/20 bg-ivory-warm/30 p-5 text-center">
              <p className="font-serif text-[15px] italic text-ink">
                your hello is on its way.
              </p>
              <p className="mt-1 text-[12.5px] text-ink-muted">
                waiting for {profile.display_name} to accept.
              </p>
            </div>
          )}

          {state.kind === "respond" && (
            <div className="rounded-2xl border border-gold/25 bg-ivory-warm/40 p-5">
              <p className="font-serif text-[17px] italic text-ink">
                {profile.display_name} wants to say hello 💛
              </p>
              <div className="mt-4 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    respondConnection(state.connectionId, "accepted")
                  }
                  className="flex-1 rounded-full bg-ink px-4 py-2.5 text-[13px] font-medium text-ivory transition-colors hover:bg-ink-soft"
                >
                  Accept
                </button>
                <button
                  type="button"
                  onClick={() =>
                    respondConnection(state.connectionId, "declined")
                  }
                  className="flex-1 rounded-full border border-border bg-white px-4 py-2.5 text-[13px] font-medium text-ink-muted transition-colors hover:border-rose/40 hover:text-rose"
                >
                  Decline
                </button>
              </div>
            </div>
          )}

          {state.kind === "connected" && (
            <div className="rounded-2xl border border-gold/20 bg-white p-5 shadow-sm">
              <p className="font-serif text-[15px] italic text-ink">
                you and {profile.display_name} are connected.
              </p>
              <button
                type="button"
                onClick={goToThread}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink px-4 py-2.5 text-[13px] font-medium text-ivory transition-colors hover:bg-ink-soft"
              >
                <MessageCircle size={13} strokeWidth={1.8} />
                message {profile.display_name}
              </button>
            </div>
          )}

          {/* Quiet block/report row */}
          {(state.kind === "can-connect" ||
            state.kind === "sent" ||
            state.kind === "connected") && (
            <div className="mt-5 flex items-center justify-end gap-4 text-[11.5px] text-ink-faint">
              <button
                type="button"
                onClick={() => setShowReport(true)}
                className="inline-flex items-center gap-1.5 transition-colors hover:text-rose"
              >
                <Flag size={11} strokeWidth={1.8} />
                report
              </button>
              <button
                type="button"
                onClick={doBlock}
                className="inline-flex items-center gap-1.5 transition-colors hover:text-rose"
              >
                <UserX size={11} strokeWidth={1.8} />
                block
              </button>
            </div>
          )}

          {showReport && (
            <div className="mt-4 rounded-xl border border-rose/30 bg-rose/5 p-4">
              <p className="text-[13px] font-medium text-ink">
                Report this profile
              </p>
              <textarea
                rows={3}
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                placeholder="What's going on? (spam, harassment, impersonation…)"
                className="mt-3 w-full resize-none rounded-md border border-border bg-white px-3 py-2 text-[13px] text-ink placeholder:text-ink-faint focus:border-rose/60 focus:outline-none"
              />
              <div className="mt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowReport(false);
                    setReportReason("");
                  }}
                  className="text-[12.5px] text-ink-muted transition-colors hover:text-ink"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={submitReport}
                  disabled={reportReason.trim().length === 0}
                  className={cn(
                    "rounded-full px-4 py-1.5 text-[12.5px] font-medium transition-colors",
                    reportReason.trim().length === 0
                      ? "cursor-not-allowed bg-rose/40 text-white"
                      : "bg-rose text-white hover:bg-rose/90",
                  )}
                >
                  Submit
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ── Cover hero ──────────────────────────────────────────────────────────────

function CoverHero({ photo }: { photo: RenderablePhoto }) {
  if (photo.kind === "url") {
    return (
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-ivory-warm">
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
      className="relative aspect-[16/9] w-full overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${photo.colors[0]} 0%, ${photo.colors[1]} 100%)`,
      }}
    >
      {photo.label && (
        <div className="absolute inset-0 flex items-end p-6">
          <span className="font-serif text-[18px] italic tracking-[0.02em] text-white/90 drop-shadow-[0_2px_6px_rgba(0,0,0,0.25)]">
            {photo.label}
          </span>
        </div>
      )}
    </div>
  );
}

// ── Wedding details card ────────────────────────────────────────────────────

function WeddingDetails({ profile }: { profile: CommunityProfile }) {
  const hasAny =
    profile.wedding_events.length > 0 ||
    profile.wedding_vibe ||
    profile.color_palette.length > 0 ||
    profile.wedding_song;
  if (!hasAny) return null;

  const eventLabels = WEDDING_EVENTS.reduce(
    (acc, e) => ({ ...acc, [e.id]: e.label }),
    {} as Record<WeddingEvent, string>,
  );

  return (
    <Section title="about my wedding">
      <dl className="space-y-3.5 text-[13.5px] text-ink">
        {profile.wedding_events.length > 0 && (
          <Row label="Events">
            <div className="flex flex-wrap items-center gap-1.5">
              {profile.wedding_events.map((ev) => (
                <span
                  key={ev}
                  className="rounded-full border border-border bg-white px-2.5 py-0.5 text-[11.5px] text-ink-muted"
                >
                  {eventLabels[ev] ?? ev}
                </span>
              ))}
            </div>
          </Row>
        )}
        {profile.wedding_vibe && (
          <Row label="Vibe">
            <span className="italic">{profile.wedding_vibe}</span>
          </Row>
        )}
        {profile.color_palette.length > 0 && (
          <Row label="Palette">
            <div className="flex flex-wrap items-center gap-2">
              {profile.color_palette.map((c, i) => (
                <span key={i} className="inline-flex items-center gap-1.5">
                  <span
                    className="h-4 w-4 rounded-full border border-ink/10"
                    style={{ backgroundColor: c.hex }}
                    aria-hidden
                  />
                  <span className="text-[12.5px]">{c.name}</span>
                </span>
              ))}
            </div>
          </Row>
        )}
        {profile.wedding_song && (
          <Row label="Song">
            <span className="inline-flex items-center gap-1.5">
              <Music size={12} strokeWidth={1.8} className="text-ink-faint" />
              {profile.wedding_song}
            </span>
          </Row>
        )}
      </dl>
    </Section>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[86px_1fr] items-start gap-3">
      <dt className="text-[11.5px] uppercase tracking-[0.12em] text-ink-faint">
        {label}
      </dt>
      <dd>{children}</dd>
    </div>
  );
}

// ── Still looking for ──────────────────────────────────────────────────────
// The bride's vendor wishlist as it appears to other brides + (in the
// vendor workspace) to vendors. Reads from the vendor-needs store and
// renders only rows with status === 'looking' and is_visible_to_vendors.
// Hidden when the bride has master-toggled discovery off.

function StillLookingFor({ profileId }: { profileId: string }) {
  const allNeeds = useVendorNeedsStore((s) => s.needs);
  const isDiscoverable = useVendorNeedsStore((s) => s.isDiscoverable);

  const visible = useMemo(() => {
    if (!isDiscoverable(profileId)) return [];
    return allNeeds
      .filter(
        (n) =>
          n.profile_id === profileId &&
          n.status === "looking" &&
          n.is_visible_to_vendors,
      )
      .sort((a, b) => {
        const ca = getVendorNeedCategory(a.category_slug)?.sort_order ?? 99;
        const cb = getVendorNeedCategory(b.category_slug)?.sort_order ?? 99;
        return ca - cb;
      });
  }, [allNeeds, isDiscoverable, profileId]);

  if (visible.length === 0) return null;

  return (
    <Section title="still looking for">
      <ul className="space-y-2.5">
        {visible.map((need) => {
          const cat = getVendorNeedCategory(need.category_slug);
          if (!cat) return null;
          const budget = need.budget_range
            ? BUDGET_RANGES.find((b) => b.id === need.budget_range)?.label
            : null;
          const meta = [budget, need.preferred_style]
            .filter(Boolean)
            .join(" · ");
          return (
            <li
              key={need.id}
              className="flex items-start gap-3 rounded-lg border border-gold/10 bg-ivory-warm/30 px-3 py-2.5"
            >
              <span className="text-[16px]" aria-hidden>
                {cat.emoji}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[13.5px] font-medium text-ink">
                  {cat.label}
                </p>
                {meta && (
                  <p className="mt-0.5 text-[12px] text-ink-muted">{meta}</p>
                )}
                {need.notes && (
                  <p className="mt-1 font-serif text-[13px] italic leading-[1.5] text-ink-muted">
                    &ldquo;{need.notes}&rdquo;
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}

// ── Photo grid (masonry-ish) ───────────────────────────────────────────────

function PhotoGrid({ photos }: { photos: ProfilePhoto[] }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {photos.map((p, i) => {
        const r = renderableFromPhoto(p);
        // Vary aspect-ratios for a slightly editorial rhythm.
        const tall = i % 5 === 1;
        return (
          <div
            key={p.id}
            className={cn(
              "relative overflow-hidden rounded-lg bg-ivory-warm",
              tall ? "row-span-2 aspect-[3/4]" : "aspect-square",
            )}
          >
            {r.kind === "url" ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={r.url}
                alt={r.caption ?? ""}
                className="h-full w-full object-cover"
                draggable={false}
              />
            ) : (
              <div
                className="flex h-full w-full items-end p-2"
                style={{
                  background: `linear-gradient(135deg, ${r.colors[0]} 0%, ${r.colors[1]} 100%)`,
                }}
              >
                {r.label && (
                  <span
                    className="font-mono text-[9.5px] uppercase tracking-[0.15em] text-white/85"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {r.label}
                  </span>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Section wrapper ────────────────────────────────────────────────────────

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-gold/10 px-8 py-6">
      <p
        className="mb-4 font-mono text-[10px] uppercase tracking-[0.22em] text-gold"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        — {title} —
      </p>
      {children}
    </section>
  );
}

// ── Mentor spotlight ───────────────────────────────────────────────────────
// Only renders when this profile has an active mentor record. Shows all
// three pull-quote prompts, the mentor's can-help tags (via slug lookup),
// preferred communication, a stats footer, and the Ask CTA that deep-links
// into Ask a Bride with the mentor filter prefilled.

const MENTOR_PROMPT_FIELDS: Array<{
  key: "one_thing_i_wish" | "best_decision" | "biggest_surprise";
  label: string;
}> = [
  { key: "one_thing_i_wish", label: "the one thing I wish I'd known" },
  { key: "best_decision", label: "the best decision I made" },
  { key: "biggest_surprise", label: "what surprised me most" },
];

function MentorSpotlight({ profile }: { profile: CommunityProfile }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const mentor = useMentoringStore((s) =>
    s.mentors.find((m) => m.profile_id === profile.id),
  );
  const allMentoringMatches = useMentoringStore((s) => s.matches);
  const activeCount = useMemo(
    () =>
      mentor
        ? allMentoringMatches.filter(
            (m) => m.mentor_profile_id === mentor.id && m.status === "active",
          ).length
        : 0,
    [allMentoringMatches, mentor],
  );
  const mentorFeedback = useMemo(
    () =>
      mentor
        ? allMentoringMatches
            .filter(
              (m) =>
                m.mentor_profile_id === mentor.id &&
                m.status === "completed" &&
                m.mentee_feedback &&
                m.mentee_feedback.trim().length > 0,
            )
            .slice(0, 2)
        : [],
    [allMentoringMatches, mentor],
  );

  if (!mentor || !mentor.is_active || mentor.is_paused) return null;

  const firstName = mentor.display_name.split(" ")[0] ?? mentor.display_name;
  const atCapacity = activeCount >= mentor.max_active_mentees;

  const prompts = MENTOR_PROMPT_FIELDS.filter((p) => Boolean(mentor[p.key]));

  const commLabel = mentor.preferred_communication
    .map((c) => (c === "huddle" ? "huddle" : c === "video" ? "video" : "chat"))
    .join(", ");

  const goToAskABride = () => {
    const p = new URLSearchParams(searchParams?.toString() ?? "");
    p.set("tab", "brides");
    p.set("view", "ask_a_bride");
    router.replace(`/community?${p.toString()}`, { scroll: false });
  };

  return (
    <div className="mx-8 mb-6 rounded-2xl border border-saffron/35 bg-gradient-to-br from-saffron/10 via-ivory-warm/30 to-white px-5 py-5">
      <div className="flex items-center justify-between gap-3">
        <p
          className="font-mono text-[10px] uppercase tracking-[0.22em] text-saffron"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          — 💛 mentor —
        </p>
        <span className="text-[11px] text-ink-muted">
          {atCapacity ? "currently full" : `${activeCount}/${mentor.max_active_mentees} spots taken`}
        </span>
      </div>

      <p className="mt-2 text-[13px] leading-relaxed text-ink">
        <span className="font-medium">{firstName}</span> has helped{" "}
        <span className="font-medium">{mentor.total_mentees_helped}</span>{" "}
        {mentor.total_mentees_helped === 1 ? "bride" : "brides"}
        {mentor.avg_rating != null && mentor.total_mentees_helped > 0 && (
          <>
            {" · "}
            <span className="text-saffron">★</span>{" "}
            {mentor.avg_rating.toFixed(1)}
          </>
        )}
        .
      </p>

      {mentor.expertise_tags.length > 0 && (
        <div className="mt-3">
          <p
            className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-ink-muted"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Can help with
          </p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {mentor.expertise_tags.map((slug) => {
              const tag = EXPERTISE_TAGS.find((t) => t.slug === slug);
              return (
                <span
                  key={slug}
                  className="rounded-full border border-saffron/30 bg-white px-2.5 py-0.5 text-[11.5px] text-ink"
                >
                  {tag?.label ?? slug}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {prompts.length > 0 && (
        <div className="mt-4 space-y-3">
          {prompts.map((p) => (
            <div key={p.key}>
              <p
                className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-saffron"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                &ldquo;{p.label}&rdquo;
              </p>
              <p className="mt-1 font-serif text-[13.5px] italic leading-[1.55] text-ink">
                {mentor[p.key]}
              </p>
            </div>
          ))}
        </div>
      )}

      {mentorFeedback.length > 0 && (
        <div className="mt-4 border-t border-saffron/20 pt-3">
          <p
            className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-ink-muted"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            What mentees say
          </p>
          <ul className="mt-2 space-y-1.5">
            {mentorFeedback.map((m) => (
              <li
                key={m.id}
                className="font-serif text-[12.5px] italic leading-[1.5] text-ink-muted"
              >
                &ldquo;{m.mentee_feedback}&rdquo;
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="mt-3 text-[11.5px] italic text-ink-muted">
        prefers: {commLabel}
        {mentor.availability_note ? ` · ${mentor.availability_note}` : ""}
      </p>

      <button
        type="button"
        onClick={goToAskABride}
        disabled={atCapacity}
        className={cn(
          "mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full px-4 py-2.5 text-[13px] font-medium transition-colors",
          atCapacity
            ? "cursor-not-allowed border border-border bg-white text-ink-faint"
            : "bg-ink text-ivory hover:bg-ink-soft",
        )}
      >
        {atCapacity
          ? "currently full — check back soon"
          : `ask ${firstName} to mentor you →`}
      </button>
    </div>
  );
}
