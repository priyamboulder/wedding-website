"use client";

// ── Live event card ─────────────────────────────────────────────────────────
// Promotional card shown in the Live sub-tab, the "upcoming" strip on the
// Discover tab, and the top-of-community live banner. Renders three states:
// live (red badge, "join now" CTA), upcoming (full editorial card with RSVP
// + submit-question CTAs), and past (muted, links to the recap).

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Clock, MessageCircle, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { BrideAvatar } from "@/components/community/BrideAvatar";
import type { FeaturedGuest, LiveEvent } from "@/types/community";
import { LIVE_EVENT_TYPES } from "@/types/community";
import { useCommunityLiveEventsStore } from "@/stores/community-live-events-store";

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
  const date = `${DAY_LONG[d.getDay()]}, ${MONTH_LONG[d.getMonth()]} ${d.getDate()}`;
  const time = d.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: d.getMinutes() === 0 ? undefined : "2-digit",
    timeZoneName: "short",
  });
  return `${date} · ${time}`;
}

export function LiveEventCard({
  event,
  guest,
  variant = "full",
}: {
  event: LiveEvent;
  guest: FeaturedGuest | undefined;
  variant?: "full" | "compact";
}) {
  const router = useRouter();
  const rsvps = useCommunityLiveEventsStore((s) => s.rsvps);
  const attendees = useCommunityLiveEventsStore((s) => s.attendees);
  const questions = useCommunityLiveEventsStore((s) => s.questions);

  const rsvpCount = useMemo(
    () => rsvps.filter((r) => r.event_id === event.id && r.status === "going").length,
    [rsvps, event.id],
  );
  const attendeesInRoom = useMemo(
    () => attendees.filter((a) => a.event_id === event.id && a.status === "in_room").length,
    [attendees, event.id],
  );
  const questionCount = useMemo(
    () => questions.filter((q) => q.event_id === event.id).length,
    [questions, event.id],
  );
  const answeredCount = useMemo(
    () => questions.filter((q) => q.event_id === event.id && q.status === "answered").length,
    [questions, event.id],
  );

  const eventTypeLabel = useMemo(
    () =>
      LIVE_EVENT_TYPES.find((t) => t.id === event.event_type)?.label ??
      "live event",
    [event.event_type],
  );

  const isLive = event.status === "live";
  const isPast = event.status === "ended" || event.status === "cancelled";

  const openDetail = () => router.push(`/community/live/${event.id}`);

  // ── Live variant ─────────────────────────────────────────────────────────
  if (isLive) {
    return (
      <article
        role="button"
        tabIndex={0}
        onClick={openDetail}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openDetail();
          }
        }}
        className="group overflow-hidden rounded-2xl border border-rose/40 bg-gradient-to-br from-white via-rose/[0.04] to-white text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-rose/60 hover:shadow-[0_12px_36px_rgba(28,25,23,0.08)]"
      >
        <div className="flex items-center gap-2 px-5 pt-4">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose/70" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-rose" />
          </span>
          <span
            className="font-mono text-[10px] uppercase tracking-[0.22em] text-rose"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            live now
          </span>
          <span
            className="ml-auto font-mono text-[9.5px] uppercase tracking-[0.18em] text-ink-faint"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {eventTypeLabel}
          </span>
        </div>

        <div className="flex items-start gap-4 px-5 py-4">
          <BrideAvatar
            name={guest?.name ?? "Guest"}
            src={guest?.headshot_data_url}
            size={56}
          />
          <div className="min-w-0 flex-1">
            <h3 className="font-serif text-[20px] font-medium leading-[1.15] tracking-[-0.005em] text-ink">
              {event.title}
            </h3>
            {guest ? (
              <p className="mt-1 text-[12.5px] text-ink-muted">
                with {guest.name}
                <span className="text-ink-faint"> · {guest.title}</span>
              </p>
            ) : null}
            <p className="mt-2 text-[12.5px] text-ink-muted">
              {attendeesInRoom > 0
                ? `${attendeesInRoom} ${attendeesInRoom === 1 ? "bride" : "brides"} in the room right now`
                : `${rsvpCount} ${rsvpCount === 1 ? "bride" : "brides"} attending`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 border-t border-rose/15 bg-rose/5 px-5 py-3">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              openDetail();
            }}
            className="inline-flex items-center gap-1.5 rounded-full bg-rose px-4 py-1.5 text-[12.5px] font-medium text-white transition-colors hover:bg-rose/90"
          >
            <MessageCircle size={12} strokeWidth={1.8} />
            join now →
          </button>
          <span className="ml-auto text-[11.5px] text-ink-faint">
            hosted by {event.moderator_name ?? "Ananya"}
          </span>
        </div>
      </article>
    );
  }

  // ── Past variant ─────────────────────────────────────────────────────────
  if (isPast) {
    return (
      <article
        role="button"
        tabIndex={0}
        onClick={openDetail}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openDetail();
          }
        }}
        className="group overflow-hidden rounded-2xl border border-gold/15 bg-ivory-warm/20 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-gold/30 hover:bg-white hover:shadow-[0_12px_36px_rgba(28,25,23,0.06)]"
      >
        <div className="flex items-center gap-2 px-5 pt-4">
          <span
            className="font-mono text-[9.5px] uppercase tracking-[0.22em] text-ink-faint"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            past event · {formatShortDate(event.starts_at)}
          </span>
          <span
            className="ml-auto font-mono text-[9.5px] uppercase tracking-[0.18em] text-ink-faint"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {eventTypeLabel}
          </span>
        </div>
        <div className="flex items-start gap-4 px-5 py-4">
          <BrideAvatar
            name={guest?.name ?? "Guest"}
            src={guest?.headshot_data_url}
            size={48}
          />
          <div className="min-w-0 flex-1">
            <h3 className="font-serif text-[18px] font-medium leading-[1.2] text-ink">
              {event.title}
            </h3>
            {guest ? (
              <p className="mt-1 text-[12px] text-ink-muted">
                with {guest.name}
              </p>
            ) : null}
            <p className="mt-2 text-[12px] text-ink-faint">
              {event.peak_attendees ?? rsvpCount} brides attended
              {questionCount > 0
                ? ` · ${answeredCount}/${questionCount} questions answered`
                : ""}
            </p>
          </div>
        </div>
        <div className="border-t border-gold/10 px-5 py-3">
          <span className="inline-flex items-center gap-1 text-[12px] font-medium text-ink transition-colors group-hover:text-saffron">
            read the recap →
          </span>
        </div>
      </article>
    );
  }

  // ── Upcoming variant (default) ───────────────────────────────────────────
  const coverGradient =
    event.cover_seed_gradient ?? guest?.cover_seed_gradient ?? [
      "#F0D9B8",
      "#8A5444",
    ];

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={openDetail}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openDetail();
        }
      }}
      className="group overflow-hidden rounded-2xl border border-gold/20 bg-white text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-gold/40 hover:shadow-[0_12px_36px_rgba(28,25,23,0.06)]"
    >
      {/* Cover image — 16:9 gradient band with optional label */}
      <div
        className="relative aspect-[16/9] w-full"
        style={
          event.cover_image_data_url
            ? undefined
            : {
                background: `linear-gradient(135deg, ${coverGradient[0]} 0%, ${coverGradient[1]} 100%)`,
              }
        }
      >
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
              className="text-center font-serif text-[22px] italic leading-[1.2] text-white/90 drop-shadow-sm"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              {event.cover_seed_label ?? guest?.cover_seed_label ?? event.title}
            </p>
          </div>
        )}
        {/* Headshot overlapping the bottom edge */}
        <div className="absolute bottom-0 left-5 translate-y-1/2">
          <div className="rounded-full bg-white p-[3px] shadow-sm">
            <BrideAvatar
              name={guest?.name ?? "Guest"}
              src={guest?.headshot_data_url}
              size={64}
            />
          </div>
        </div>
      </div>

      <div className="px-5 pb-4 pt-10">
        <p
          className="font-mono text-[10px] uppercase tracking-[0.22em] text-gold"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          live event · {eventTypeLabel}
        </p>
        <h3 className="mt-1.5 font-serif text-[22px] font-medium leading-[1.15] tracking-[-0.005em] text-ink">
          {event.title}
        </h3>
        {event.subtitle ? (
          <p className="mt-1 font-serif text-[14px] italic text-ink-muted">
            {event.subtitle}
          </p>
        ) : null}

        <div className="mt-3 space-y-1 text-[12.5px] text-ink">
          <div className="flex items-center gap-2 text-ink-muted">
            <Calendar size={12} strokeWidth={1.8} className="text-ink-faint" />
            <span>{formatEventDate(event.starts_at)}</span>
          </div>
          <div className="flex items-center gap-2 text-ink-muted">
            <Clock size={12} strokeWidth={1.8} className="text-ink-faint" />
            <span>
              {event.duration_minutes} minutes
              {event.is_free ? " · free" : ""}
            </span>
          </div>
          <div className="flex items-center gap-2 text-ink-muted">
            <Users size={12} strokeWidth={1.8} className="text-ink-faint" />
            <span>
              {rsvpCount} {rsvpCount === 1 ? "bride" : "brides"} attending
            </span>
          </div>
        </div>

        {variant === "full" && event.description ? (
          <p className="mt-4 line-clamp-3 text-[13px] leading-[1.55] text-ink-muted">
            {event.description}
          </p>
        ) : null}
      </div>

      <div className="flex items-center gap-2 border-t border-gold/10 bg-ivory-warm/10 px-5 py-3">
        <span className="inline-flex items-center gap-1 rounded-full bg-ink px-4 py-1.5 text-[12.5px] font-medium text-ivory transition-colors group-hover:bg-ink-soft">
          RSVP — I&apos;ll be there →
        </span>
        <span className="ml-auto text-[11.5px] text-ink-faint">
          hosted by {event.moderator_name ?? "Ananya"}
        </span>
      </div>
    </article>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────

const MONTH_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function formatShortDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${MONTH_SHORT[d.getMonth()]} ${d.getDate()}`;
}
