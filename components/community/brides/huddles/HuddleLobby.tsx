"use client";

// ── Huddle lobby ────────────────────────────────────────────────────────────
// Pre-join screen: confirm identity, see who's already in there, then tap to
// enter. No real mic permissions — this is the localStorage-only stub — but
// the UI reads like a proper pre-join so it's an easy swap later.

import { useMemo } from "react";
import { Mic, Users, X } from "lucide-react";
import { BrideAvatar } from "@/components/community/BrideAvatar";
import type { Huddle } from "@/types/community";
import { useCommunityProfilesStore } from "@/stores/community-profiles-store";
import { useCommunityHuddlesStore } from "@/stores/community-huddles-store";

export function HuddleLobby({
  huddle,
  onCancel,
  onJoined,
}: {
  huddle: Huddle;
  onCancel: () => void;
  onJoined: () => void;
}) {
  const myProfileId = useCommunityProfilesStore((s) => s.myProfileId);
  const profiles = useCommunityProfilesStore((s) => s.profiles);
  const participants = useCommunityHuddlesStore((s) => s.participants);
  const joinHuddle = useCommunityHuddlesStore((s) => s.joinHuddle);

  const me = useMemo(
    () => (myProfileId ? profiles.find((p) => p.id === myProfileId) : undefined),
    [profiles, myProfileId],
  );

  const inRoom = participants.filter(
    (p) => p.huddle_id === huddle.id && p.status === "in_room",
  );

  const inRoomProfiles = inRoom
    .map((p) => profiles.find((x) => x.id === p.profile_id))
    .filter((p): p is NonNullable<typeof p> => !!p);

  const isFull = inRoom.length >= huddle.max_participants;

  const handleJoin = () => {
    if (!myProfileId || isFull) return;
    joinHuddle(huddle.id, myProfileId);
    onJoined();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-6 backdrop-blur-sm">
      <div className="w-full max-w-[440px] overflow-hidden rounded-2xl border border-gold/15 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gold/10 px-6 py-3.5">
          <p
            className="font-mono text-[10px] uppercase tracking-[0.22em] text-gold"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            — joining huddle —
          </p>
          <button
            type="button"
            onClick={onCancel}
            className="text-ink-muted transition-colors hover:text-ink"
            aria-label="Cancel"
          >
            <X size={18} strokeWidth={1.6} />
          </button>
        </div>

        <div className="px-6 py-6">
          <h3 className="font-serif text-[22px] font-medium leading-[1.15] text-ink">
            {huddle.title}
          </h3>
          <p className="mt-1 text-[12.5px] text-ink-muted">
            hosted by{" "}
            {profiles.find((p) => p.id === huddle.host_id)?.display_name ??
              "a bride"}{" "}
            · {inRoom.length} already here
          </p>

          {/* You */}
          <div className="mt-6 flex items-center gap-3 rounded-xl border border-gold/15 bg-ivory-warm/30 px-4 py-3">
            {me ? (
              <BrideAvatar
                name={me.display_name}
                src={me.avatar_data_url}
                size={40}
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-ink/10" />
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13.5px] font-medium text-ink">
                joining as {me?.display_name ?? "guest"}
              </p>
              <p className="mt-0.5 inline-flex items-center gap-1 text-[11.5px] text-ink-muted">
                <Mic size={11} strokeWidth={1.8} />
                mic ready · camera off (toggle inside)
              </p>
            </div>
          </div>

          {/* Who's in there */}
          {inRoomProfiles.length > 0 ? (
            <div className="mt-5">
              <p
                className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                who's in there
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                {inRoomProfiles.slice(0, 6).map((p) => (
                  <div key={p.id} className="flex items-center gap-1.5">
                    <BrideAvatar
                      name={p.display_name}
                      src={p.avatar_data_url}
                      size={24}
                    />
                    <span className="text-[12px] text-ink">
                      {p.display_name.split(" ")[0]}
                    </span>
                  </div>
                ))}
                {inRoomProfiles.length > 6 ? (
                  <span className="inline-flex items-center gap-1 text-[12px] text-ink-faint">
                    <Users size={11} strokeWidth={1.8} />
                    +{inRoomProfiles.length - 6}
                  </span>
                ) : null}
              </div>
            </div>
          ) : null}

          {isFull ? (
            <p className="mt-5 rounded-lg bg-rose/10 px-4 py-2.5 text-[12px] text-rose">
              this huddle is full — try again in a bit.
            </p>
          ) : null}

          <button
            type="button"
            onClick={handleJoin}
            disabled={!myProfileId || isFull}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-rose px-5 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-rose/90 disabled:cursor-not-allowed disabled:bg-ink/30"
          >
            <Mic size={13} strokeWidth={1.8} />
            join the huddle →
          </button>
          {!myProfileId ? (
            <p className="mt-2 text-center text-[11px] text-ink-faint">
              set up your profile first to join.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
