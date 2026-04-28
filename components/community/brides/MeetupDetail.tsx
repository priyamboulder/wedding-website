"use client";

// ── Meetup detail ───────────────────────────────────────────────────────────
// Slide-over for a single meetup. Shows the full description, venue details,
// host profile pill, RSVP controls, and a scrollable attendee list that
// doubles as a discovery surface — tapping an attendee opens their bride
// profile.

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Calendar,
  Check,
  ExternalLink,
  MapPin,
  Trash2,
  Video,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BrideAvatar } from "@/components/community/BrideAvatar";
import { BrideDetailPanel } from "./BrideDetailPanel";
import type { MeetupRsvpStatus, MeetupType } from "@/types/community";
import { MEETUP_TYPES } from "@/types/community";
import {
  fallbackGradientFor,
  type RenderablePhoto,
} from "@/lib/community/photos";
import { useCommunityProfilesStore } from "@/stores/community-profiles-store";
import { useCommunityMeetupsStore } from "@/stores/community-meetups-store";

const TYPE_META: Record<MeetupType, { emoji: string; label: string }> =
  MEETUP_TYPES.reduce(
    (acc, t) => ({ ...acc, [t.id]: { emoji: t.emoji, label: t.label } }),
    {} as Record<MeetupType, { emoji: string; label: string }>,
  );

function formatFullDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function formatTimeRange(starts: string, ends?: string): string {
  const s = new Date(starts);
  if (Number.isNaN(s.getTime())) return "";
  const fmt = (d: Date) =>
    d.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: d.getMinutes() === 0 ? undefined : "2-digit",
    });
  if (!ends) return fmt(s);
  const e = new Date(ends);
  if (Number.isNaN(e.getTime())) return fmt(s);
  if (e.toDateString() !== s.toDateString()) return `${fmt(s)} (multi-day)`;
  return `${fmt(s)} – ${fmt(e)}`;
}

export function MeetupDetail({
  meetupId,
  onClose,
}: {
  meetupId: string | null;
  onClose: () => void;
}) {
  const meetups = useCommunityMeetupsStore((s) => s.meetups);
  const meetup = useMemo(
    () => (meetupId ? meetups.find((m) => m.id === meetupId) : undefined),
    [meetups, meetupId],
  );
  const open = !!meetupId && !!meetup;

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
      {open && meetup && (
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
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[480px] flex-col bg-white shadow-xl"
            role="dialog"
            aria-label={meetup.title}
          >
            <DetailBody meetupId={meetup.id} onClose={onClose} />
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function DetailBody({
  meetupId,
  onClose,
}: {
  meetupId: string;
  onClose: () => void;
}) {
  const meetups = useCommunityMeetupsStore((s) => s.meetups);
  const rsvps = useCommunityMeetupsStore((s) => s.rsvps);
  const rsvpAction = useCommunityMeetupsStore((s) => s.rsvp);
  const cancelMeetup = useCommunityMeetupsStore((s) => s.cancelMeetup);
  const profiles = useCommunityProfilesStore((s) => s.profiles);
  const myProfileId = useCommunityProfilesStore((s) => s.myProfileId);

  const meetup = useMemo(
    () => meetups.find((m) => m.id === meetupId),
    [meetups, meetupId],
  );

  const attendees = useMemo(() => {
    if (!meetup) return [];
    return rsvps
      .filter((r) => r.meetup_id === meetup.id && r.status === "going")
      .map((r) => profiles.find((p) => p.id === r.profile_id))
      .filter((p): p is NonNullable<typeof p> => !!p);
  }, [rsvps, meetup, profiles]);

  const myRsvp = useMemo(() => {
    if (!meetup || !myProfileId) return undefined;
    return rsvps.find(
      (r) => r.meetup_id === meetup.id && r.profile_id === myProfileId,
    );
  }, [rsvps, meetup, myProfileId]);

  const [openAttendeeId, setOpenAttendeeId] = useState<string | null>(null);

  if (!meetup) return null;

  const host =
    meetup.organizer_type === "bride" && meetup.organizer_id
      ? profiles.find((p) => p.id === meetup.organizer_id)
      : null;

  const type = TYPE_META[meetup.meetup_type];
  const isOwner =
    meetup.organizer_type === "bride" && meetup.organizer_id === myProfileId;

  const cover: RenderablePhoto = meetup.cover_image_data_url
    ? { kind: "url", url: meetup.cover_image_data_url }
    : {
        kind: "gradient",
        colors: meetup.cover_seed_gradient ?? fallbackGradientFor(meetup.id),
      };

  const doRsvp = (status: MeetupRsvpStatus) => {
    if (!myProfileId) return;
    rsvpAction(meetup.id, myProfileId, status);
  };

  const doCancel = () => {
    if (!confirm("Cancel this meetup? Everyone who RSVP'd will see it as cancelled."))
      return;
    cancelMeetup(meetup.id);
    onClose();
  };

  const mapsUrl = meetup.venue_address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        meetup.venue_address,
      )}`
    : null;

  const capacityNote = (() => {
    if (!meetup.max_attendees) return null;
    const left = meetup.max_attendees - attendees.length;
    if (left <= 0) return "full";
    return `${left} ${left === 1 ? "spot" : "spots"} left`;
  })();

  return (
    <>
      <div className="flex items-center justify-between border-b border-gold/10 px-6 py-3.5">
        <p
          className="font-mono text-[10px] uppercase tracking-[0.22em] text-gold"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Meetup
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
        {/* Hero */}
        {cover.kind === "url" ? (
          <div className="relative aspect-[16/9] w-full overflow-hidden bg-ivory-warm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={cover.url}
              alt=""
              className="h-full w-full object-cover"
              draggable={false}
            />
          </div>
        ) : (
          <div
            className="relative flex aspect-[16/9] w-full items-end overflow-hidden p-6"
            style={{
              background: `linear-gradient(135deg, ${cover.colors[0]} 0%, ${cover.colors[1]} 100%)`,
            }}
          >
            <span aria-hidden className="text-[44px]">
              {type.emoji}
            </span>
          </div>
        )}

        <div className="px-7 pb-4 pt-6">
          <p
            className="font-mono text-[10px] uppercase tracking-[0.22em] text-gold"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {type.label}
          </p>
          <h2 className="mt-2 font-serif text-[26px] font-medium leading-[1.1] tracking-[-0.005em] text-ink">
            {meetup.title}
          </h2>

          {meetup.status === "cancelled" && (
            <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-rose/10 px-3 py-1 text-[12px] font-medium text-rose">
              this meetup was cancelled
            </p>
          )}

          {meetup.description && (
            <p className="mt-4 whitespace-pre-line text-[14.5px] leading-[1.65] text-ink-muted">
              {meetup.description}
            </p>
          )}
        </div>

        {/* Details */}
        <div className="border-t border-gold/10 px-7 py-5">
          <dl className="space-y-3 text-[13.5px] text-ink">
            <DetailRow icon={<Calendar size={13} strokeWidth={1.8} />}>
              <div>
                <div>{formatFullDate(meetup.starts_at)}</div>
                <div className="text-[12.5px] text-ink-muted">
                  {formatTimeRange(meetup.starts_at, meetup.ends_at)}
                </div>
              </div>
            </DetailRow>
            {meetup.is_virtual ? (
              <DetailRow icon={<Video size={13} strokeWidth={1.8} />}>
                <div>
                  <div>Virtual meetup</div>
                  {meetup.virtual_link && (
                    <a
                      href={meetup.virtual_link}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[12.5px] text-saffron transition-colors hover:text-ink"
                    >
                      open link
                      <ExternalLink size={11} strokeWidth={1.8} />
                    </a>
                  )}
                </div>
              </DetailRow>
            ) : (
              <DetailRow icon={<MapPin size={13} strokeWidth={1.8} />}>
                <div>
                  {meetup.venue_name && <div>{meetup.venue_name}</div>}
                  <div className="text-[12.5px] text-ink-muted">
                    {meetup.venue_address ??
                      [meetup.city, meetup.state].filter(Boolean).join(", ")}
                  </div>
                  {mapsUrl && (
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 inline-flex items-center gap-1 text-[12.5px] text-saffron transition-colors hover:text-ink"
                    >
                      open in maps
                      <ExternalLink size={11} strokeWidth={1.8} />
                    </a>
                  )}
                </div>
              </DetailRow>
            )}
            <DetailRow icon={<span aria-hidden>👤</span>}>
              {host ? (
                <span>
                  Hosted by{" "}
                  <span className="font-medium text-ink">
                    {host.display_name}
                  </span>
                </span>
              ) : meetup.organizer_type === "ananya" ? (
                <span>Hosted by Ananya</span>
              ) : (
                <span>Ananya community</span>
              )}
            </DetailRow>
          </dl>
        </div>

        {/* Attendees */}
        <div className="border-t border-gold/10 px-7 py-5">
          <div className="flex items-baseline justify-between">
            <p
              className="font-mono text-[10px] uppercase tracking-[0.22em] text-gold"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              — going ({attendees.length}) —
            </p>
            {capacityNote && (
              <p className="text-[11.5px] text-ink-faint">{capacityNote}</p>
            )}
          </div>
          {attendees.length === 0 ? (
            <p className="mt-4 rounded-lg border border-dashed border-gold/25 bg-ivory-warm/20 px-4 py-5 text-center text-[12.5px] italic text-ink-muted">
              nobody's RSVP'd yet — be the first and the others will follow.
            </p>
          ) : (
            <ul className="mt-4 grid grid-cols-1 gap-1.5">
              {attendees.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => setOpenAttendeeId(p.id)}
                    className="flex w-full items-center gap-3 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-ivory-warm/40"
                  >
                    <BrideAvatar
                      name={p.display_name}
                      src={p.avatar_data_url}
                      size={34}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-serif text-[15px] text-ink">
                        {p.display_name}
                      </p>
                      {p.wedding_city && (
                        <p className="truncate text-[11.5px] text-ink-muted">
                          {p.wedding_city}
                        </p>
                      )}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Owner controls */}
        {isOwner && meetup.status !== "cancelled" && (
          <div className="border-t border-gold/10 px-7 py-5">
            <button
              type="button"
              onClick={doCancel}
              className="inline-flex items-center gap-2 text-[12.5px] text-rose transition-colors hover:opacity-80"
            >
              <Trash2 size={12} strokeWidth={1.8} />
              Cancel this meetup
            </button>
          </div>
        )}
      </div>

      {/* RSVP dock */}
      {meetup.status !== "cancelled" && (
        <div className="border-t border-gold/15 bg-white px-6 py-4">
          {!myProfileId ? (
            <p className="text-center text-[13px] text-ink-muted">
              set up your profile to RSVP.
            </p>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => doRsvp("going")}
                className={cn(
                  "flex-1 inline-flex items-center justify-center gap-1.5 rounded-full px-4 py-2.5 text-[13px] font-medium transition-colors",
                  myRsvp?.status === "going"
                    ? "bg-saffron text-white"
                    : "bg-ink text-ivory hover:bg-ink-soft",
                )}
              >
                {myRsvp?.status === "going" ? (
                  <>
                    <Check size={13} strokeWidth={1.8} />
                    you're in
                  </>
                ) : (
                  <>I'm in →</>
                )}
              </button>
              <button
                type="button"
                onClick={() => doRsvp("maybe")}
                className={cn(
                  "rounded-full border px-4 py-2.5 text-[13px] font-medium transition-colors",
                  myRsvp?.status === "maybe"
                    ? "border-ink bg-ivory-warm/60 text-ink"
                    : "border-border bg-white text-ink-muted hover:border-saffron/40 hover:text-ink",
                )}
              >
                maybe
              </button>
              {(myRsvp?.status === "going" ||
                myRsvp?.status === "maybe") && (
                <button
                  type="button"
                  onClick={() => doRsvp("cancelled")}
                  className="text-[12px] text-ink-faint transition-colors hover:text-rose"
                >
                  can't make it
                </button>
              )}
            </div>
          )}
        </div>
      )}

      <BrideDetailPanel
        profileId={openAttendeeId}
        onClose={() => setOpenAttendeeId(null)}
      />
    </>
  );
}

function DetailRow({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 text-ink-faint">{icon}</span>
      <div className="flex-1">{children}</div>
    </div>
  );
}
