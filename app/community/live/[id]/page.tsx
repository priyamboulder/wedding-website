"use client";

// ── /community/live/[id] ────────────────────────────────────────────────────
// Full promotional page for a live event. Cover + guest bio + RSVP + the
// pre-submitted question board. When the event is live, the "join now"
// button opens the LiveEventRoom as a full-screen overlay.

import { useMemo, useState } from "react";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowUp,
  AtSign,
  Calendar,
  Check,
  Clock,
  ExternalLink,
  Globe,
  MessageCircle,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TopNav } from "@/components/shell/TopNav";
import { BrideAvatar } from "@/components/community/BrideAvatar";
import { LiveEventRoom } from "@/components/community/brides/live/LiveEventRoom";
import { useCommunityLiveEventsStore } from "@/stores/community-live-events-store";
import { useCommunityProfilesStore } from "@/stores/community-profiles-store";
import { LIVE_EVENT_TYPES } from "@/types/community";

const DAY_LONG = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
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

function formatEventDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const date = `${DAY_LONG[d.getDay()]}, ${MONTH_LONG[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  const time = d.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: d.getMinutes() === 0 ? undefined : "2-digit",
    timeZoneName: "short",
  });
  return `${date} · ${time}`;
}

export default function LiveEventDetailPage() {
  const { id } = useParams<{ id: string }>();

  const ensureSeeded = useCommunityLiveEventsStore((s) => s.ensureSeeded);
  const ensureProfilesSeeded = useCommunityProfilesStore((s) => s.ensureSeeded);
  useMemo(() => {
    ensureSeeded();
    ensureProfilesSeeded();
    return null;
  }, [ensureSeeded, ensureProfilesSeeded]);

  const event = useCommunityLiveEventsStore((s) =>
    s.events.find((e) => e.id === id),
  );
  const guest = useCommunityLiveEventsStore((s) =>
    event ? s.guests.find((g) => g.id === event.guest_id) : undefined,
  );
  const rsvps = useCommunityLiveEventsStore((s) => s.rsvps);
  const questions = useCommunityLiveEventsStore((s) => s.questions);
  const questionVotes = useCommunityLiveEventsStore((s) => s.questionVotes);
  const allLiveAttendees = useCommunityLiveEventsStore((s) => s.attendees);
  const attendeesCount = useMemo(
    () => allLiveAttendees.filter((a) => a.event_id === id && a.status === "in_room").length,
    [allLiveAttendees, id],
  );

  const rsvpAction = useCommunityLiveEventsStore((s) => s.rsvp);
  const submitQuestion = useCommunityLiveEventsStore((s) => s.submitQuestion);
  const voteQuestion = useCommunityLiveEventsStore((s) => s.voteQuestion);

  const profiles = useCommunityProfilesStore((s) => s.profiles);
  const myProfileId = useCommunityProfilesStore((s) => s.myProfileId);

  const [roomOpen, setRoomOpen] = useState(false);
  const [questionDraft, setQuestionDraft] = useState("");

  if (!event) return notFound();

  const eventTypeLabel =
    LIVE_EVENT_TYPES.find((t) => t.id === event.event_type)?.label ??
    "live event";

  const rsvpCount = rsvps.filter(
    (r) => r.event_id === event.id && r.status === "going",
  ).length;
  const myRsvp = myProfileId
    ? rsvps.find(
        (r) => r.event_id === event.id && r.profile_id === myProfileId,
      )
    : undefined;

  const attendingProfiles = rsvps
    .filter((r) => r.event_id === event.id && r.status === "going")
    .map((r) => profiles.find((p) => p.id === r.profile_id))
    .filter((p): p is NonNullable<typeof p> => !!p);

  const eventQuestions = questions
    .filter((q) => q.event_id === event.id)
    .sort((a, b) => {
      if (a.status === "answered" && b.status !== "answered") return 1;
      if (b.status === "answered" && a.status !== "answered") return -1;
      return b.vote_count - a.vote_count;
    });

  const isLive = event.status === "live";
  const isPast = event.status === "ended" || event.status === "cancelled";
  const isUpcoming = event.status === "upcoming";

  const handlePrimary = () => {
    if (isLive) {
      setRoomOpen(true);
      return;
    }
    if (isUpcoming) {
      if (!myProfileId) return;
      const nextStatus = myRsvp?.status === "going" ? "cancelled" : "going";
      rsvpAction(event.id, myProfileId, nextStatus);
    }
  };

  const handleSubmitQuestion = () => {
    if (!myProfileId) return;
    const trimmed = questionDraft.trim();
    if (!trimmed) return;
    submitQuestion(event.id, myProfileId, trimmed);
    setQuestionDraft("");
  };

  const coverGradient =
    event.cover_seed_gradient ?? guest?.cover_seed_gradient ?? [
      "#F0D9B8",
      "#8A5444",
    ];

  return (
    <div className="min-h-screen bg-white">
      <TopNav />

      {/* Breadcrumb */}
      <div className="border-b border-gold/10 bg-white px-6 py-3 md:px-10">
        <div className="mx-auto max-w-5xl">
          <Link
            href="/community?tab=connect&sub=brides&view=live"
            className="inline-flex items-center gap-1.5 text-[12.5px] text-ink-muted transition-colors hover:text-ink"
          >
            <ArrowLeft size={13} strokeWidth={1.8} />
            back to live events
          </Link>
        </div>
      </div>

      {/* Cover */}
      <div
        className="relative w-full"
        style={
          event.cover_image_data_url
            ? undefined
            : {
                background: `linear-gradient(135deg, ${coverGradient[0]} 0%, ${coverGradient[1]} 100%)`,
              }
        }
      >
        <div className="mx-auto aspect-[21/9] max-w-5xl">
          {event.cover_image_data_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={event.cover_image_data_url}
              alt=""
              className="h-full w-full object-cover"
              draggable={false}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center px-6">
              <p
                className="text-center font-serif text-[40px] italic leading-[1.1] tracking-[-0.005em] text-white/95 drop-shadow-sm md:text-[56px]"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                {event.cover_seed_label ?? event.title}
              </p>
            </div>
          )}
        </div>
      </div>

      <main className="px-6 pb-16 pt-10 md:px-10">
        <div className="mx-auto max-w-5xl space-y-10">
          {/* Title block */}
          <section>
            <p
              className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em]"
              style={{
                fontFamily: "var(--font-mono)",
                color: isLive ? "var(--rose, #C75C5C)" : "var(--gold, #B8860B)",
              }}
            >
              {isLive ? (
                <>
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose/70" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-rose" />
                  </span>
                  live right now · {eventTypeLabel}
                </>
              ) : (
                <>
                  live event · {eventTypeLabel}
                  {isPast ? " · past" : ""}
                </>
              )}
            </p>
            <h1 className="mt-3 font-serif text-[40px] font-medium leading-[1.05] tracking-[-0.005em] text-ink md:text-[52px]">
              {event.title}
            </h1>
            {event.subtitle ? (
              <p className="mt-3 font-serif text-[20px] italic leading-[1.3] text-ink-muted">
                {event.subtitle}
              </p>
            ) : null}

            <div className="mt-5 space-y-1.5 text-[14px] text-ink">
              <div className="flex items-center gap-2 text-ink-muted">
                <Calendar
                  size={13}
                  strokeWidth={1.8}
                  className="text-ink-faint"
                />
                <span>{formatEventDate(event.starts_at)}</span>
              </div>
              <div className="flex items-center gap-2 text-ink-muted">
                <Clock
                  size={13}
                  strokeWidth={1.8}
                  className="text-ink-faint"
                />
                <span>
                  {event.duration_minutes} minutes
                  {event.is_free ? " · free" : ""}
                </span>
              </div>
              <div className="flex items-center gap-2 text-ink-muted">
                <Users
                  size={13}
                  strokeWidth={1.8}
                  className="text-ink-faint"
                />
                <span>
                  {isLive
                    ? `${attendeesCount} in the room · ${rsvpCount} RSVP'd`
                    : `${rsvpCount} ${rsvpCount === 1 ? "bride" : "brides"} ${isPast ? "attended" : "RSVPing"}`}
                </span>
              </div>
            </div>

            {/* Primary CTA */}
            {!isPast && (
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handlePrimary}
                  disabled={!myProfileId && isUpcoming}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-[13.5px] font-medium transition-colors",
                    isLive
                      ? "bg-rose text-white hover:bg-rose/90"
                      : myRsvp?.status === "going"
                        ? "bg-saffron text-white"
                        : myProfileId
                          ? "bg-ink text-ivory hover:bg-ink-soft"
                          : "cursor-not-allowed bg-ink/40 text-ivory",
                  )}
                >
                  {isLive ? (
                    <>
                      <MessageCircle size={14} strokeWidth={1.8} />
                      join now →
                    </>
                  ) : myRsvp?.status === "going" ? (
                    <>
                      <Check size={14} strokeWidth={1.8} />
                      you&apos;re in — we&apos;ll remind you
                    </>
                  ) : (
                    <>RSVP — I&apos;ll be there →</>
                  )}
                </button>
                {!myProfileId && isUpcoming ? (
                  <p className="text-[12px] text-ink-faint">
                    set up your profile first to RSVP
                  </p>
                ) : null}
              </div>
            )}

            {isPast && event.recap_body ? (
              <div className="mt-6 rounded-2xl border border-gold/20 bg-ivory-warm/20 p-5">
                <p
                  className="font-mono text-[10px] uppercase tracking-[0.22em] text-gold"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  — the recap —
                </p>
                <p className="mt-3 text-[14px] leading-[1.7] text-ink">
                  {event.recap_body}
                </p>
              </div>
            ) : null}
          </section>

          {/* About */}
          {event.description && (
            <section>
              <p
                className="font-mono text-[10px] uppercase tracking-[0.22em] text-gold"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                — about this event —
              </p>
              <p className="mt-3 font-serif text-[16px] leading-[1.7] text-ink">
                {event.description}
              </p>
            </section>
          )}

          {/* Meet your guest */}
          {guest && (
            <section>
              <p
                className="font-mono text-[10px] uppercase tracking-[0.22em] text-gold"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                — meet your guest —
              </p>
              <div className="mt-4 rounded-2xl border border-gold/20 bg-white p-5 shadow-sm md:p-6">
                <div className="flex flex-col gap-5 md:flex-row md:items-start">
                  <BrideAvatar
                    name={guest.name}
                    src={guest.headshot_data_url}
                    size={96}
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-serif text-[24px] font-medium leading-[1.15] text-ink">
                      {guest.name}
                    </h3>
                    <p className="mt-1 text-[13px] text-ink-muted">
                      {guest.title}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-[12px] text-ink-faint">
                      {guest.instagram_handle ? (
                        <span className="inline-flex items-center gap-1">
                          <AtSign size={11} strokeWidth={1.8} />
                          {guest.instagram_handle.replace(/^@/, "")}
                        </span>
                      ) : null}
                      {guest.website_url ? (
                        <a
                          href={guest.website_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 hover:text-ink"
                        >
                          <Globe size={11} strokeWidth={1.8} />
                          website
                          <ExternalLink size={10} strokeWidth={1.8} />
                        </a>
                      ) : null}
                    </div>
                    <p className="mt-4 text-[14px] leading-[1.65] text-ink">
                      {guest.bio}
                    </p>
                    {guest.credentials.length > 0 && (
                      <ul className="mt-4 space-y-1">
                        {guest.credentials.map((c) => (
                          <li
                            key={c}
                            className="flex items-start gap-2 text-[13px] text-ink-muted"
                          >
                            <Check
                              size={13}
                              strokeWidth={2}
                              className="mt-1 shrink-0 text-saffron"
                            />
                            {c}
                          </li>
                        ))}
                      </ul>
                    )}
                    {guest.specialties.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {guest.specialties.map((s) => (
                          <span
                            key={s}
                            className="rounded-full border border-gold/25 bg-ivory-warm/30 px-3 py-1 text-[11.5px] text-ink-muted"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Questions */}
          {!isPast && (
            <section>
              <p
                className="font-mono text-[10px] uppercase tracking-[0.22em] text-gold"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                — questions from the community —
              </p>
              <p className="mt-2 text-[13.5px] leading-[1.6] text-ink-muted">
                submit a question for {guest?.name ?? "the guest"} to answer
                live. vote on questions you want answered.
              </p>

              <div className="mt-4 rounded-2xl border border-gold/20 bg-white p-4">
                <textarea
                  value={questionDraft}
                  onChange={(e) => setQuestionDraft(e.target.value)}
                  placeholder={
                    myProfileId
                      ? "ask a question…"
                      : "set up your profile to submit a question"
                  }
                  disabled={!myProfileId}
                  rows={2}
                  className="w-full resize-none rounded-lg border border-border bg-ivory-warm/20 p-3 text-[13.5px] text-ink placeholder:text-ink-faint focus:border-saffron/60 focus:outline-none focus:ring-2 focus:ring-saffron/15 disabled:cursor-not-allowed disabled:opacity-60"
                />
                <div className="mt-2 flex items-center justify-end">
                  <button
                    type="button"
                    onClick={handleSubmitQuestion}
                    disabled={!myProfileId || !questionDraft.trim()}
                    className={cn(
                      "rounded-full px-4 py-1.5 text-[12.5px] font-medium transition-colors",
                      myProfileId && questionDraft.trim()
                        ? "bg-ink text-ivory hover:bg-ink-soft"
                        : "cursor-not-allowed bg-ink/30 text-ivory",
                    )}
                  >
                    submit
                  </button>
                </div>
              </div>

              {eventQuestions.length > 0 && (
                <div className="mt-5 space-y-3">
                  {eventQuestions.map((q) => {
                    const asker = profiles.find((p) => p.id === q.asker_id);
                    const myVote = myProfileId
                      ? questionVotes.find(
                          (v) =>
                            v.question_id === q.id &&
                            v.voter_id === myProfileId,
                        )
                      : undefined;
                    const isAnswered = q.status === "answered";
                    return (
                      <div
                        key={q.id}
                        className={cn(
                          "flex items-start gap-3 rounded-2xl border bg-white p-4 transition-colors",
                          isAnswered
                            ? "border-gold/10 bg-ivory-warm/10"
                            : "border-gold/20",
                        )}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            if (!myProfileId) return;
                            voteQuestion(q.id, myProfileId);
                          }}
                          disabled={!myProfileId || isAnswered}
                          className={cn(
                            "flex shrink-0 flex-col items-center gap-0.5 rounded-full border px-2.5 py-1.5 text-[11px] font-medium transition-colors",
                            myVote
                              ? "border-saffron bg-saffron/15 text-saffron"
                              : "border-border bg-white text-ink-muted hover:border-saffron/40 hover:text-ink",
                            (!myProfileId || isAnswered) &&
                              "cursor-not-allowed opacity-60",
                          )}
                        >
                          <ArrowUp size={12} strokeWidth={2} />
                          <span style={{ fontFamily: "var(--font-mono)" }}>
                            {q.vote_count}
                          </span>
                        </button>
                        <div className="min-w-0 flex-1">
                          <p
                            className={cn(
                              "text-[14px] leading-[1.5]",
                              isAnswered
                                ? "text-ink-muted line-through"
                                : "text-ink",
                            )}
                          >
                            &ldquo;{q.body}&rdquo;
                          </p>
                          <p className="mt-1.5 text-[11.5px] text-ink-faint">
                            — {asker?.display_name ?? "a bride"}
                            {isAnswered ? " · answered" : ""}
                            {q.status === "selected" && !isAnswered
                              ? " · selected"
                              : ""}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {/* Attending */}
          {attendingProfiles.length > 0 && (
            <section>
              <p
                className="font-mono text-[10px] uppercase tracking-[0.22em] text-gold"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                — {isPast ? "who attended" : "who's attending"} —
              </p>
              <div className="mt-4 flex items-center gap-3">
                <div className="flex -space-x-2">
                  {attendingProfiles.slice(0, 10).map((p) => (
                    <BrideAvatar
                      key={p.id}
                      name={p.display_name}
                      src={p.avatar_data_url}
                      size={32}
                      style={{ boxShadow: "0 0 0 2px #fff" }}
                    />
                  ))}
                </div>
                <p className="text-[13px] text-ink-muted">
                  {attendingProfiles.length}{" "}
                  {attendingProfiles.length === 1 ? "bride" : "brides"}
                  <span className="text-ink-faint">
                    {" "}
                    ·{" "}
                    {attendingProfiles
                      .slice(0, 3)
                      .map((p) => p.display_name.split(" ")[0])
                      .join(", ")}
                    {attendingProfiles.length > 3
                      ? `, +${attendingProfiles.length - 3}`
                      : ""}
                  </span>
                </p>
              </div>
            </section>
          )}
        </div>
      </main>

      {roomOpen && (
        <LiveEventRoom event={event} onClose={() => setRoomOpen(false)} />
      )}
    </div>
  );
}
