"use client";

// ── Live events banner ──────────────────────────────────────────────────────
// Cross-promotional strip shown at the top of the Discover tab and (for
// live-only events) above the Community top-level header. Surfaces any
// live-now event with urgency, plus the next upcoming event as a lighter
// "coming up" preview. Renders nothing when there's nothing to surface.

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Calendar, Radio } from "lucide-react";
import { BrideAvatar } from "@/components/community/BrideAvatar";
import { useCommunityLiveEventsStore } from "@/stores/community-live-events-store";

export function LiveEventsBanner({
  variant = "discover",
}: {
  // "discover" — shows live + next upcoming, embedded in the Discover tab
  // "global"  — shows only when an event is currently live, pinned above
  //             the Community header so users across all tabs see it
  variant?: "discover" | "global";
}) {
  const router = useRouter();
  const events = useCommunityLiveEventsStore((s) => s.events);
  const guests = useCommunityLiveEventsStore((s) => s.guests);

  const liveEvent = useMemo(
    () => events.find((e) => e.status === "live"),
    [events],
  );
  const nextUpcoming = useMemo(
    () =>
      events
        .filter((e) => e.status === "upcoming")
        .sort(
          (a, b) =>
            new Date(a.starts_at).getTime() -
            new Date(b.starts_at).getTime(),
        )[0],
    [events],
  );

  // Global variant only renders when something is live right now.
  if (variant === "global") {
    if (!liveEvent) return null;
    const guest = guests.find((g) => g.id === liveEvent.guest_id);
    return (
      <button
        type="button"
        onClick={() => router.push(`/community/live/${liveEvent.id}`)}
        className="flex w-full items-center gap-3 border-b border-rose/25 bg-gradient-to-r from-rose/10 via-rose/5 to-rose/10 px-6 py-2.5 text-left transition-colors hover:bg-rose/15 md:px-10"
      >
        <div className="mx-auto flex max-w-6xl items-center gap-3">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose/70" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-rose" />
          </span>
          <p
            className="font-mono text-[10px] uppercase tracking-[0.22em] text-rose"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            live now
          </p>
          <p className="truncate text-[13px] font-medium text-ink">
            {liveEvent.title}
            {guest ? (
              <span className="text-ink-muted"> — with {guest.name}</span>
            ) : null}
          </p>
          <span className="ml-auto inline-flex items-center gap-1 text-[12px] font-medium text-rose">
            join now
            <ArrowRight size={12} strokeWidth={1.8} />
          </span>
        </div>
      </button>
    );
  }

  // Discover variant — live takes priority, otherwise the next upcoming
  // event is shown as an editorial "coming up" strip.
  if (!liveEvent && !nextUpcoming) return null;

  if (liveEvent) {
    const guest = guests.find((g) => g.id === liveEvent.guest_id);
    const rsvpCount = events.length; // placeholder, replaced below
    return (
      <div className="border-b border-rose/25 bg-gradient-to-r from-rose/[0.06] via-ivory-warm/30 to-ivory-warm/10 px-6 py-5 md:px-10">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-baseline justify-between gap-3">
            <p
              className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-rose"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose/70" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-rose" />
              </span>
              — live now —
            </p>
            <LiveAttendingCount eventId={liveEvent.id} />
          </div>

          <button
            type="button"
            onClick={() => router.push(`/community/live/${liveEvent.id}`)}
            className="group mt-4 flex w-full items-center gap-4 rounded-2xl border border-rose/30 bg-white px-4 py-3 text-left transition-colors hover:border-rose/50 hover:shadow-sm"
          >
            <BrideAvatar
              name={guest?.name ?? "Guest"}
              src={guest?.headshot_data_url}
              size={48}
            />
            <div className="min-w-0 flex-1">
              <p
                className="font-mono text-[9.5px] uppercase tracking-[0.22em] text-rose"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                live event · {liveEvent.event_type}
              </p>
              <h3 className="mt-0.5 truncate font-serif text-[17px] font-medium text-ink">
                {liveEvent.title}
              </h3>
              <p className="truncate text-[12.5px] text-ink-muted">
                {guest ? (
                  <>
                    with {guest.name}
                    <span className="text-ink-faint"> · {guest.title}</span>
                  </>
                ) : (
                  liveEvent.subtitle
                )}
              </p>
            </div>
            <span className="shrink-0 rounded-full bg-rose px-4 py-1.5 text-[12px] font-medium text-white transition-colors group-hover:bg-rose/90">
              join now →
            </span>
          </button>
        </div>
      </div>
    );
  }

  // Upcoming only.
  const guest = guests.find((g) => g.id === nextUpcoming!.guest_id);
  return (
    <div className="border-b border-gold/15 bg-ivory-warm/20 px-6 py-5 md:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-baseline justify-between gap-3">
          <p
            className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-gold"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            <Radio size={11} strokeWidth={1.8} />
            — coming up —
          </p>
          <UpcomingCountdown iso={nextUpcoming!.starts_at} />
        </div>

        <button
          type="button"
          onClick={() => router.push(`/community/live/${nextUpcoming!.id}`)}
          className="group mt-4 flex w-full items-center gap-4 rounded-2xl border border-gold/20 bg-white px-4 py-3 text-left transition-colors hover:border-gold/40 hover:shadow-sm"
        >
          <BrideAvatar
            name={guest?.name ?? "Guest"}
            src={guest?.headshot_data_url}
            size={48}
          />
          <div className="min-w-0 flex-1">
            <p
              className="font-mono text-[9.5px] uppercase tracking-[0.22em] text-gold"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              live event · {nextUpcoming!.event_type}
            </p>
            <h3 className="mt-0.5 truncate font-serif text-[17px] font-medium text-ink">
              {nextUpcoming!.title}
            </h3>
            <p className="truncate text-[12.5px] text-ink-muted">
              {guest ? (
                <>
                  with {guest.name}
                  <span className="text-ink-faint"> · {guest.title}</span>
                </>
              ) : (
                nextUpcoming!.subtitle
              )}
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-ink px-4 py-1.5 text-[12px] font-medium text-ivory transition-colors group-hover:bg-ink-soft">
            RSVP →
          </span>
        </button>
      </div>
    </div>
  );
}

function LiveAttendingCount({ eventId }: { eventId: string }) {
  const attendeesInRoom = useCommunityLiveEventsStore(
    (s) =>
      s.attendees.filter(
        (a) => a.event_id === eventId && a.status === "in_room",
      ).length,
  );
  if (attendeesInRoom === 0) return null;
  return (
    <span className="text-[12px] text-ink-muted">
      {attendeesInRoom} {attendeesInRoom === 1 ? "bride" : "brides"} in the
      room
    </span>
  );
}

function UpcomingCountdown({ iso }: { iso: string }) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const diffMs = d.getTime() - Date.now();
  if (diffMs <= 0) return null;
  const hours = Math.round(diffMs / (1000 * 60 * 60));
  const days = Math.round(diffMs / (1000 * 60 * 60 * 24));
  const label =
    hours < 24
      ? `in ${hours} ${hours === 1 ? "hour" : "hours"}`
      : `in ${days} ${days === 1 ? "day" : "days"}`;
  return (
    <span className="inline-flex items-center gap-1 text-[12px] text-ink-muted">
      <Calendar size={11} strokeWidth={1.8} className="text-ink-faint" />
      {label}
    </span>
  );
}
