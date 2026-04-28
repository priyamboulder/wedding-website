"use client";

// ── Huddle card ─────────────────────────────────────────────────────────────
// Rendered in the Discover live-now strip and the Meetups "huddles" list.
// Two states: live (with pulsing red dot + participant avatars + "hop in")
// and scheduled (with date/time + "remind me").

import { useMemo } from "react";
import { Bell, Check, Headphones, MessageCircle, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { BrideAvatar } from "@/components/community/BrideAvatar";
import type { Huddle } from "@/types/community";
import { useCommunityProfilesStore } from "@/stores/community-profiles-store";
import { useCommunityHuddlesStore } from "@/stores/community-huddles-store";

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

function formatScheduled(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const base = `${DAY_SHORT[d.getDay()]}, ${MONTH_SHORT[d.getMonth()]} ${d.getDate()}`;
  const time = d.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: d.getMinutes() === 0 ? undefined : "2-digit",
  });
  return `${base} · ${time}`;
}

export function HuddleCard({
  huddle,
  onJoin,
  onRemindMe,
  compact = false,
}: {
  huddle: Huddle;
  onJoin: () => void;
  onRemindMe?: () => void;
  compact?: boolean;
}) {
  const profiles = useCommunityProfilesStore((s) => s.profiles);
  const myProfileId = useCommunityProfilesStore((s) => s.myProfileId);
  const participants = useCommunityHuddlesStore((s) => s.participants);

  const host = profiles.find((p) => p.id === huddle.host_id);

  const inRoom = useMemo(
    () =>
      participants.filter(
        (p) => p.huddle_id === huddle.id && p.status === "in_room",
      ),
    [participants, huddle.id],
  );

  const invited = useMemo(
    () =>
      participants.filter(
        (p) => p.huddle_id === huddle.id && p.status === "invited",
      ),
    [participants, huddle.id],
  );

  const myParticipation = useMemo(
    () =>
      myProfileId
        ? participants.find(
            (p) => p.huddle_id === huddle.id && p.profile_id === myProfileId,
          )
        : undefined,
    [participants, huddle.id, myProfileId],
  );

  const inRoomProfiles = inRoom
    .map((p) => profiles.find((x) => x.id === p.profile_id))
    .filter((p): p is NonNullable<typeof p> => !!p);

  const isLive = huddle.status === "live";
  const isScheduled = huddle.status === "waiting";

  return (
    <article
      className={cn(
        "overflow-hidden rounded-2xl border text-left shadow-sm transition-all",
        isLive
          ? "border-rose/40 bg-gradient-to-br from-white via-rose/[0.03] to-white hover:-translate-y-0.5 hover:border-rose/60 hover:shadow-[0_12px_36px_rgba(28,25,23,0.06)]"
          : "border-gold/20 bg-white hover:-translate-y-0.5 hover:border-gold/40 hover:shadow-[0_12px_36px_rgba(28,25,23,0.06)]",
      )}
    >
      {/* Eyebrow strip */}
      <div
        className={cn(
          "flex items-center gap-2 px-5 pt-4",
          compact ? "pt-3" : "pt-4",
        )}
      >
        {isLive ? (
          <span className="inline-flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose/70" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-rose" />
            </span>
            <span
              className="font-mono text-[9.5px] uppercase tracking-[0.22em] text-rose"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              live now
            </span>
          </span>
        ) : (
          <span
            className="font-mono text-[9.5px] uppercase tracking-[0.22em] text-gold"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            — scheduled huddle —
          </span>
        )}
        <span
          className="ml-auto inline-flex items-center gap-1 font-mono text-[9.5px] uppercase tracking-[0.18em] text-ink-faint"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          <Headphones size={10} strokeWidth={1.8} />
          audio huddle
        </span>
      </div>

      <div className="px-5 py-4">
        <h3 className="font-serif text-[19px] font-medium leading-[1.15] tracking-[-0.005em] text-ink">
          {huddle.title}
        </h3>
        {huddle.description && !compact ? (
          <p className="mt-1.5 line-clamp-2 text-[13px] leading-[1.5] text-ink-muted">
            {huddle.description}
          </p>
        ) : null}

        <p className="mt-2.5 text-[12px] text-ink-faint">
          hosted by {host?.display_name ?? "a bride"}
          {isScheduled && huddle.scheduled_at ? (
            <> · {formatScheduled(huddle.scheduled_at)}</>
          ) : null}
        </p>

        {/* Roster row */}
        {isLive && inRoomProfiles.length > 0 ? (
          <div className="mt-4 flex items-center gap-3">
            <div className="flex -space-x-2">
              {inRoomProfiles.slice(0, 5).map((p) => (
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
              {inRoomProfiles.length}{" "}
              {inRoomProfiles.length === 1 ? "bride" : "brides"} chatting
              <span className="text-ink-faint">
                {" "}
                ·{" "}
                {inRoomProfiles
                  .slice(0, 3)
                  .map((p) => p.display_name.split(" ")[0])
                  .join(", ")}
                {inRoomProfiles.length > 3
                  ? `, +${inRoomProfiles.length - 3}`
                  : ""}
              </span>
            </p>
          </div>
        ) : null}

        {isScheduled && invited.length > 0 ? (
          <div className="mt-4 flex items-center gap-2 text-[12px] text-ink-muted">
            <Users size={12} strokeWidth={1.8} className="text-ink-faint" />
            {invited.length} {invited.length === 1 ? "bride" : "brides"}{" "}
            interested
          </div>
        ) : null}

        {/* Action footer */}
        <div className="mt-5 flex items-center gap-2 border-t border-gold/10 pt-4">
          {isLive ? (
            <button
              type="button"
              onClick={onJoin}
              className="inline-flex items-center gap-1.5 rounded-full bg-rose px-4 py-1.5 text-[12.5px] font-medium text-white transition-colors hover:bg-rose/90"
            >
              <MessageCircle size={12} strokeWidth={1.8} />
              hop in →
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={onRemindMe}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[12.5px] font-medium transition-colors",
                  myParticipation?.status === "invited"
                    ? "bg-ivory-warm/60 text-ink"
                    : "bg-ink text-ivory hover:bg-ink-soft",
                )}
              >
                {myParticipation?.status === "invited" ? (
                  <>
                    <Check size={12} strokeWidth={1.8} />
                    you're on the list
                  </>
                ) : (
                  <>
                    <Bell size={12} strokeWidth={1.8} />
                    remind me
                  </>
                )}
              </button>
              {huddle.host_id === myProfileId ? (
                <button
                  type="button"
                  onClick={onJoin}
                  className="rounded-full border border-saffron/60 bg-saffron/10 px-3.5 py-1.5 text-[12px] font-medium text-saffron transition-colors hover:bg-saffron/20"
                >
                  start now
                </button>
              ) : null}
            </>
          )}
        </div>
      </div>
    </article>
  );
}
