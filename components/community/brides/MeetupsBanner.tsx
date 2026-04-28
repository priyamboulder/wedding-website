"use client";

// ── Meetups banner ──────────────────────────────────────────────────────────
// Horizontal strip above the Discover grid that surfaces upcoming local +
// virtual meetups. Prioritizes meetups in the viewer's hometown, then virtual
// hangouts, then everywhere else. Tapping an item jumps to the Meetups
// sub-tab.

import { useMemo } from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCommunityMeetupsStore } from "@/stores/community-meetups-store";
import { MEETUP_TYPES, type Meetup, type MeetupType } from "@/types/community";

const TYPE_EMOJI: Record<MeetupType, string> = MEETUP_TYPES.reduce(
  (acc, t) => ({ ...acc, [t.id]: t.emoji }),
  {} as Record<MeetupType, string>,
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

function formatCompactDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${DAY_SHORT[d.getDay()]} ${MONTH_SHORT[d.getMonth()]} ${d.getDate()}`;
}

function extractCity(hometown?: string): string | null {
  if (!hometown) return null;
  return hometown.split(",")[0]?.trim() ?? null;
}

export function MeetupsBanner({
  myCity,
  onSeeAll,
}: {
  myCity?: string;
  onSeeAll: () => void;
}) {
  const meetups = useCommunityMeetupsStore((s) => s.meetups);
  const rsvps = useCommunityMeetupsStore((s) => s.rsvps);

  const rsvpCountByMeetup = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of rsvps) {
      if (r.status !== "going") continue;
      map.set(r.meetup_id, (map.get(r.meetup_id) ?? 0) + 1);
    }
    return map;
  }, [rsvps]);

  const cityGuess = extractCity(myCity);
  const now = Date.now();

  const prioritized = useMemo(() => {
    const upcoming = meetups.filter(
      (m) =>
        m.status === "upcoming" && new Date(m.starts_at).getTime() > now,
    );
    return upcoming
      .sort((a, b) => {
        const score = (m: Meetup) => {
          // Lower is better.
          if (cityGuess && m.city.toLowerCase() === cityGuess.toLowerCase()) return 0;
          if (m.is_virtual) return 1;
          return 2;
        };
        const sA = score(a);
        const sB = score(b);
        if (sA !== sB) return sA - sB;
        return new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime();
      })
      .slice(0, 6);
  }, [meetups, cityGuess, now]);

  if (prioritized.length === 0) return null;

  return (
    <div className="border-b border-gold/10 bg-ivory-warm/30 px-6 py-5 md:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-baseline justify-between">
          <p
            className="font-mono text-[10px] uppercase tracking-[0.22em] text-gold"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            — happening{cityGuess ? ` near ${cityGuess.toLowerCase()}` : " soon"} —
          </p>
          <button
            type="button"
            onClick={onSeeAll}
            className="inline-flex items-center gap-1 text-[12px] font-medium text-ink-muted transition-colors hover:text-ink"
          >
            see all meetups
            <ArrowRight size={12} strokeWidth={1.8} />
          </button>
        </div>

        <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
          {prioritized.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={onSeeAll}
              className="group flex min-w-[260px] shrink-0 flex-col rounded-xl border border-gold/15 bg-white px-4 py-3 text-left transition-colors hover:border-saffron/40"
            >
              <div className="flex items-center gap-2">
                <span aria-hidden className="text-[18px]">
                  {TYPE_EMOJI[m.meetup_type]}
                </span>
                <span className="truncate font-serif text-[15px] font-medium leading-[1.2] text-ink">
                  {m.title}
                </span>
              </div>
              <p className="mt-1.5 truncate text-[12px] text-ink-muted">
                {m.is_virtual
                  ? "virtual"
                  : `${m.venue_name ?? m.city}${m.venue_name && m.city ? " · " + m.city : ""}`}
              </p>
              <p
                className={cn(
                  "mt-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint",
                )}
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {formatCompactDate(m.starts_at)}
                {rsvpCountByMeetup.get(m.id)
                  ? ` · ${rsvpCountByMeetup.get(m.id)} going`
                  : ""}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
