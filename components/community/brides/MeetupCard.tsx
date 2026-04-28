"use client";

// ── Meetup card ─────────────────────────────────────────────────────────────
// One row in the Meetups list. Header strip shows the type emoji + title,
// body has venue + date, and the footer has an RSVP pill + "going" avatars.
// Tapping anywhere on the card opens MeetupDetail.

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { Check, Clock, MapPin, Video } from "lucide-react";
import { BrideAvatar } from "@/components/community/BrideAvatar";
import type {
  Meetup,
  MeetupRsvpStatus,
  MeetupType,
} from "@/types/community";
import { MEETUP_TYPES } from "@/types/community";
import { useCommunityProfilesStore } from "@/stores/community-profiles-store";
import { useCommunityMeetupsStore } from "@/stores/community-meetups-store";
import {
  fallbackGradientFor,
  type RenderablePhoto,
} from "@/lib/community/photos";

const TYPE_META: Record<MeetupType, { emoji: string; label: string }> =
  MEETUP_TYPES.reduce(
    (acc, t) => ({ ...acc, [t.id]: { emoji: t.emoji, label: t.label } }),
    {} as Record<MeetupType, { emoji: string; label: string }>,
  );

const DAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
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

function formatMeetupDate(iso: string, endIso?: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const base = `${DAY_SHORT[d.getDay()]}, ${MONTH_SHORT[d.getMonth()]} ${d.getDate()}`;
  const time = d.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: d.getMinutes() === 0 ? undefined : "2-digit",
  });
  if (!endIso) return `${base} · ${time}`;
  const end = new Date(endIso);
  if (Number.isNaN(end.getTime()) || end.toDateString() === d.toDateString()) {
    return `${base} · ${time}`;
  }
  return `${base}–${MONTH_SHORT[end.getMonth()]} ${end.getDate()}`;
}

export function MeetupCard({
  meetup,
  onOpen,
}: {
  meetup: Meetup;
  onOpen: () => void;
}) {
  const myProfileId = useCommunityProfilesStore((s) => s.myProfileId);
  const profiles = useCommunityProfilesStore((s) => s.profiles);
  const rsvps = useCommunityMeetupsStore((s) => s.rsvps);
  const rsvpAction = useCommunityMeetupsStore((s) => s.rsvp);

  const attendees = useMemo(() => {
    const going = rsvps.filter(
      (r) => r.meetup_id === meetup.id && r.status === "going",
    );
    return going
      .map((r) => profiles.find((p) => p.id === r.profile_id))
      .filter((p): p is NonNullable<typeof p> => !!p);
  }, [rsvps, meetup.id, profiles]);

  const myRsvp = useMemo(
    () =>
      myProfileId
        ? rsvps.find(
            (r) => r.meetup_id === meetup.id && r.profile_id === myProfileId,
          )
        : undefined,
    [rsvps, meetup.id, myProfileId],
  );

  const host = meetup.organizer_id
    ? profiles.find((p) => p.id === meetup.organizer_id)
    : null;

  const hostLabel =
    meetup.organizer_type === "ananya"
      ? "Hosted by Ananya"
      : host
        ? `Hosted by ${host.display_name}`
        : "Ananya community";

  const capacityNote = (() => {
    if (!meetup.max_attendees) return null;
    const left = meetup.max_attendees - attendees.length;
    if (left <= 0) return "full";
    return `${left} ${left === 1 ? "spot" : "spots"} left`;
  })();

  const quickRsvp = (status: MeetupRsvpStatus) => (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!myProfileId) return;
    rsvpAction(meetup.id, myProfileId, status);
  };

  const type = TYPE_META[meetup.meetup_type];

  const cover: RenderablePhoto = meetup.cover_image_data_url
    ? { kind: "url", url: meetup.cover_image_data_url }
    : {
        kind: "gradient",
        colors: meetup.cover_seed_gradient ?? fallbackGradientFor(meetup.id),
      };

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen();
        }
      }}
      className="group overflow-hidden rounded-2xl border border-gold/15 bg-white text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-gold/40 hover:shadow-[0_12px_36px_rgba(28,25,23,0.06)]"
    >
      {/* Header strip — gradient band with type emoji + title */}
      <div
        className="flex items-center gap-3 px-5 py-4"
        style={
          cover.kind === "gradient"
            ? {
                background: `linear-gradient(135deg, ${cover.colors[0]} 0%, ${cover.colors[1]} 100%)`,
              }
            : undefined
        }
      >
        {cover.kind === "url" ? (
          <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={cover.url}
              alt=""
              className="h-full w-full object-cover"
              draggable={false}
            />
          </div>
        ) : (
          <span
            aria-hidden
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/25 text-[20px] backdrop-blur"
          >
            {type.emoji}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p
            className={cn(
              "font-mono text-[9.5px] uppercase tracking-[0.2em]",
              cover.kind === "gradient" ? "text-white/80" : "text-ink-faint",
            )}
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {type.label}
          </p>
          <h3
            className={cn(
              "truncate font-serif text-[19px] font-medium leading-[1.15] tracking-[-0.005em]",
              cover.kind === "gradient" ? "text-white" : "text-ink",
            )}
          >
            {meetup.title}
          </h3>
        </div>
      </div>

      <div className="px-5 py-4">
        <div className="space-y-1.5 text-[13px] text-ink">
          <div className="flex items-center gap-2 text-ink-muted">
            {meetup.is_virtual ? (
              <Video size={12} strokeWidth={1.8} />
            ) : (
              <MapPin size={12} strokeWidth={1.8} />
            )}
            <span className="truncate">
              {meetup.is_virtual
                ? "Virtual"
                : [meetup.venue_name, [meetup.city, meetup.state].filter(Boolean).join(", ")]
                    .filter(Boolean)
                    .join(" — ")}
            </span>
          </div>
          <div className="flex items-center gap-2 text-ink-muted">
            <Clock size={12} strokeWidth={1.8} />
            <span>{formatMeetupDate(meetup.starts_at, meetup.ends_at)}</span>
          </div>
        </div>

        <p className="mt-3 text-[12px] text-ink-faint">{hostLabel}</p>

        {/* Attendee row + capacity */}
        {attendees.length > 0 && (
          <div className="mt-4 flex items-center gap-3">
            <div className="flex -space-x-2">
              {attendees.slice(0, 5).map((p) => (
                <BrideAvatar
                  key={p.id}
                  name={p.display_name}
                  src={p.avatar_data_url}
                  size={26}
                  style={{ boxShadow: "0 0 0 2px #fff" }}
                />
              ))}
            </div>
            <p className="text-[12px] text-ink-muted">
              {attendees.length} going
              {capacityNote && (
                <span className="text-ink-faint"> · {capacityNote}</span>
              )}
            </p>
          </div>
        )}

        {/* RSVP footer */}
        <div className="mt-5 flex items-center gap-2 border-t border-gold/10 pt-4">
          <button
            type="button"
            onClick={quickRsvp("going")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[12.5px] font-medium transition-colors",
              myRsvp?.status === "going"
                ? "bg-saffron text-white"
                : "bg-ink text-ivory hover:bg-ink-soft",
            )}
          >
            {myRsvp?.status === "going" ? (
              <>
                <Check size={12} strokeWidth={1.8} />
                you're in
              </>
            ) : (
              <>I'm in →</>
            )}
          </button>
          <button
            type="button"
            onClick={quickRsvp("maybe")}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-[12.5px] font-medium transition-colors",
              myRsvp?.status === "maybe"
                ? "border-ink bg-ivory-warm/60 text-ink"
                : "border-border bg-white text-ink-muted hover:border-saffron/40 hover:text-ink",
            )}
          >
            maybe
          </button>
          {myRsvp?.status === "going" || myRsvp?.status === "maybe" ? (
            <button
              type="button"
              onClick={quickRsvp("cancelled")}
              className="ml-auto text-[11.5px] text-ink-faint transition-colors hover:text-rose"
            >
              cancel
            </button>
          ) : null}
        </div>
      </div>
    </article>
  );
}
