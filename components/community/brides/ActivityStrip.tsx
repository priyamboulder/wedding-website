"use client";

// ── Activity strip ──────────────────────────────────────────────────────────
// Consolidated one-line replacement for the three stacked banners that used
// to sit above the bride directory (live events, live huddles, meetups).
// Shows:
//   🔴 LIVE  · <live event title> (n)
//            · <live huddle title> (n chatting)
//   🗓  SOON · <n meetups · next city>
//            · <next upcoming live event>
// Nothing is removed — each chip routes to the same detail view as before,
// but collapsed vertical space puts the bride cards above the fold.

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Calendar, Headphones, Radio } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCommunityHuddlesStore } from "@/stores/community-huddles-store";
import { useCommunityLiveEventsStore } from "@/stores/community-live-events-store";
import { useCommunityMeetupsStore } from "@/stores/community-meetups-store";
import { HuddleLobby } from "./huddles/HuddleLobby";
import { useCommunityProfilesStore } from "@/stores/community-profiles-store";

export function ActivityStrip() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [joiningHuddleId, setJoiningHuddleId] = useState<string | null>(null);

  const liveEvents = useCommunityLiveEventsStore((s) => s.events);
  const liveEventAttendees = useCommunityLiveEventsStore((s) => s.attendees);

  const huddles = useCommunityHuddlesStore((s) => s.huddles);
  const huddleParticipants = useCommunityHuddlesStore((s) => s.participants);
  const setActiveHuddle = useCommunityHuddlesStore((s) => s.setActiveHuddle);

  const meetups = useCommunityMeetupsStore((s) => s.meetups);

  const myProfileId = useCommunityProfilesStore((s) => s.myProfileId);

  const liveEvent = useMemo(
    () => liveEvents.find((e) => e.status === "live"),
    [liveEvents],
  );
  const nextUpcomingEvent = useMemo(
    () =>
      liveEvents
        .filter((e) => e.status === "upcoming")
        .sort(
          (a, b) =>
            new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime(),
        )[0],
    [liveEvents],
  );
  const liveAttendeeCount = useMemo(() => {
    if (!liveEvent) return 0;
    return liveEventAttendees.filter(
      (a) => a.event_id === liveEvent.id && a.status === "in_room",
    ).length;
  }, [liveEvent, liveEventAttendees]);

  const liveHuddles = useMemo(
    () => huddles.filter((h) => h.status === "live"),
    [huddles],
  );

  const now = Date.now();
  const upcomingMeetups = useMemo(
    () =>
      meetups
        .filter(
          (m) =>
            m.status === "upcoming" &&
            new Date(m.starts_at).getTime() > now,
        )
        .sort(
          (a, b) =>
            new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime(),
        ),
    [meetups, now],
  );

  const gotoMeetupsTab = () => {
    const p = new URLSearchParams(searchParams?.toString() ?? "");
    p.set("tab", "brides");
    p.set("view", "meetups");
    router.replace(`/community?${p.toString()}`, { scroll: false });
  };
  const gotoLiveTab = () => {
    const p = new URLSearchParams(searchParams?.toString() ?? "");
    p.set("tab", "brides");
    p.set("view", "live");
    router.replace(`/community?${p.toString()}`, { scroll: false });
  };

  const hasLive = !!liveEvent || liveHuddles.length > 0;
  const hasSoon = upcomingMeetups.length > 0 || !!nextUpcomingEvent;

  if (!hasLive && !hasSoon) return null;

  const joiningHuddle = joiningHuddleId
    ? huddles.find((h) => h.id === joiningHuddleId)
    : undefined;

  const nextMeetup = upcomingMeetups[0];
  const meetupCity = nextMeetup
    ? nextMeetup.is_virtual
      ? "virtual"
      : nextMeetup.city.split(",")[0]?.trim().toLowerCase()
    : null;

  return (
    <div className="border-b border-gold/10 bg-ivory-warm/25 px-6 py-3 md:px-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 lg:flex-row lg:items-center lg:gap-5">
        {/* LIVE group */}
        {hasLive && (
          <div className="flex min-w-0 items-center gap-2">
            <span
              className="inline-flex shrink-0 items-center gap-1.5 font-mono text-[9.5px] uppercase tracking-[0.22em] text-rose"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose/70" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-rose" />
              </span>
              live
            </span>
            <div className="flex min-w-0 items-center gap-1.5 overflow-x-auto">
              {liveEvent && (
                <Chip
                  tone="rose"
                  icon={<Radio size={11} strokeWidth={1.9} />}
                  label={liveEvent.title.toLowerCase()}
                  meta={
                    liveAttendeeCount > 0
                      ? `${liveAttendeeCount} watching`
                      : "join →"
                  }
                  onClick={() =>
                    router.push(`/community/live/${liveEvent.id}`)
                  }
                />
              )}
              {liveHuddles.slice(0, 2).map((h) => {
                const inRoom = huddleParticipants.filter(
                  (p) => p.huddle_id === h.id && p.status === "in_room",
                );
                const imHere = myProfileId
                  ? inRoom.some((p) => p.profile_id === myProfileId)
                  : false;
                return (
                  <Chip
                    key={h.id}
                    tone="rose"
                    icon={<Headphones size={11} strokeWidth={1.9} />}
                    label={h.title.toLowerCase()}
                    meta={`${inRoom.length} chatting`}
                    onClick={() => {
                      if (imHere) setActiveHuddle(h.id);
                      else setJoiningHuddleId(h.id);
                    }}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* SOON group */}
        {hasSoon && (
          <div className="flex min-w-0 items-center gap-2 lg:ml-auto">
            <span
              className="inline-flex shrink-0 items-center gap-1.5 font-mono text-[9.5px] uppercase tracking-[0.22em] text-gold"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              <Calendar size={10} strokeWidth={1.9} />
              soon
            </span>
            <div className="flex min-w-0 items-center gap-1.5 overflow-x-auto">
              {upcomingMeetups.length > 0 && (
                <Chip
                  tone="gold"
                  icon={<span aria-hidden>📅</span>}
                  label={`${upcomingMeetups.length} ${
                    upcomingMeetups.length === 1 ? "meetup" : "meetups"
                  } this month`}
                  meta={meetupCity ? `next · ${meetupCity}` : undefined}
                  onClick={gotoMeetupsTab}
                />
              )}
              {nextUpcomingEvent && !liveEvent && (
                <Chip
                  tone="gold"
                  icon={<Radio size={11} strokeWidth={1.9} />}
                  label={nextUpcomingEvent.title.toLowerCase()}
                  meta="RSVP →"
                  onClick={() =>
                    router.push(`/community/live/${nextUpcomingEvent.id}`)
                  }
                />
              )}
            </div>
            <button
              type="button"
              onClick={gotoLiveTab}
              className="hidden shrink-0 items-center gap-1 whitespace-nowrap text-[11.5px] font-medium text-ink-muted transition-colors hover:text-ink lg:inline-flex"
            >
              see all
              <ArrowRight size={11} strokeWidth={1.9} />
            </button>
          </div>
        )}
      </div>

      {joiningHuddle ? (
        <HuddleLobby
          huddle={joiningHuddle}
          onCancel={() => setJoiningHuddleId(null)}
          onJoined={() => setJoiningHuddleId(null)}
        />
      ) : null}
    </div>
  );
}

function Chip({
  tone,
  icon,
  label,
  meta,
  onClick,
}: {
  tone: "rose" | "gold";
  icon: React.ReactNode;
  label: string;
  meta?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group inline-flex min-w-0 shrink-0 items-center gap-2 rounded-full border bg-white px-3 py-1.5 text-left transition-colors",
        tone === "rose"
          ? "border-rose/25 hover:border-rose/50"
          : "border-gold/25 hover:border-gold/50",
      )}
    >
      <span
        className={cn(
          "inline-flex shrink-0 items-center justify-center",
          tone === "rose" ? "text-rose" : "text-gold",
        )}
      >
        {icon}
      </span>
      <span className="max-w-[18ch] truncate text-[12px] font-medium text-ink sm:max-w-[28ch]">
        {label}
      </span>
      {meta && (
        <span className="shrink-0 text-[11px] text-ink-muted">· {meta}</span>
      )}
    </button>
  );
}
