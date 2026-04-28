"use client";

// ── Huddle room ─────────────────────────────────────────────────────────────
// The in-room experience. Shown as a full-screen overlay when the current
// user is in a huddle. Audio is *simulated* — a rotating activeSpeakerId
// animates a pulsing ring on whichever circle is "talking". Camera/mic
// toggles flip visual state only; real WebRTC plugs in here later.

import { useEffect, useMemo, useState } from "react";
import {
  Mic,
  MicOff,
  MessageCircle,
  PhoneOff,
  Video,
  VideoOff,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BrideAvatar } from "@/components/community/BrideAvatar";
import type { Huddle, HuddleParticipant } from "@/types/community";
import { useCommunityProfilesStore } from "@/stores/community-profiles-store";
import { useCommunityHuddlesStore } from "@/stores/community-huddles-store";
import { HuddleChat } from "./HuddleChat";

export function HuddleRoom({
  huddle,
  onMinimize,
  onLeave,
}: {
  huddle: Huddle;
  onMinimize: () => void;
  onLeave: () => void;
}) {
  const [chatOpen, setChatOpen] = useState(true);

  const myProfileId = useCommunityProfilesStore((s) => s.myProfileId);
  const profiles = useCommunityProfilesStore((s) => s.profiles);

  const participants = useCommunityHuddlesStore((s) => s.participants);
  const activeSpeakerByHuddle = useCommunityHuddlesStore(
    (s) => s.activeSpeakerByHuddle,
  );
  const setActiveSpeaker = useCommunityHuddlesStore((s) => s.setActiveSpeaker);
  const leaveHuddle = useCommunityHuddlesStore((s) => s.leaveHuddle);
  const endHuddle = useCommunityHuddlesStore((s) => s.endHuddle);
  const toggleMic = useCommunityHuddlesStore((s) => s.toggleMic);
  const toggleVideo = useCommunityHuddlesStore((s) => s.toggleVideo);

  const inRoom = useMemo(
    () =>
      participants.filter(
        (p) => p.huddle_id === huddle.id && p.status === "in_room",
      ),
    [participants, huddle.id],
  );

  const host = profiles.find((p) => p.id === huddle.host_id);
  const isHost = huddle.host_id === myProfileId;
  const me = inRoom.find((p) => p.profile_id === myProfileId);
  const activeSpeakerId = activeSpeakerByHuddle[huddle.id];

  // ── Simulated speaker rotation ─────────────────────────────────────────
  // Rotate among in-room participants who have mic on. Produces the
  // "someone is talking" feeling without any real audio.
  const speakerKey = inRoom
    .map((p) => `${p.profile_id}:${p.mic_on}`)
    .join("|");
  useEffect(() => {
    const eligible = inRoom.filter((p) => p.mic_on);
    if (eligible.length === 0) {
      setActiveSpeaker(huddle.id, undefined);
      return;
    }
    const tick = () => {
      const next = eligible[Math.floor(Math.random() * eligible.length)];
      setActiveSpeaker(huddle.id, next.profile_id);
    };
    tick();
    const interval = window.setInterval(tick, 2600);
    return () => window.clearInterval(interval);
    // speakerKey captures the relevant participant set changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [huddle.id, setActiveSpeaker, speakerKey]);

  const handleLeave = () => {
    if (!myProfileId) return;
    leaveHuddle(huddle.id, myProfileId);
    onLeave();
  };

  const handleEnd = () => {
    endHuddle(huddle.id);
    onLeave();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-ivory-warm/95 backdrop-blur-sm">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-gold/10 bg-white/80 px-6 py-3">
        <div className="min-w-0">
          <p
            className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-rose"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose/70" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-rose" />
            </span>
            — live huddle —
          </p>
          <h2 className="mt-0.5 truncate font-serif text-[18px] font-medium leading-[1.15] text-ink">
            {huddle.title}
          </h2>
          <p className="text-[11.5px] text-ink-muted">
            hosted by {host?.display_name ?? "a bride"} · {inRoom.length} in the
            room
          </p>
        </div>
        <button
          type="button"
          onClick={onMinimize}
          className="inline-flex items-center gap-1 rounded-full border border-border bg-white px-3 py-1.5 text-[11.5px] text-ink-muted transition-colors hover:border-ink/30 hover:text-ink"
          aria-label="Minimize"
        >
          <X size={12} strokeWidth={1.8} />
          minimize
        </button>
      </header>

      {/* Body */}
      <div className="flex flex-1 gap-4 overflow-hidden px-6 py-6">
        {/* Participants area */}
        <div className="flex flex-1 flex-col">
          <ParticipantGrid
            participants={inRoom}
            activeSpeakerId={activeSpeakerId}
          />
          {huddle.description ? (
            <p className="mt-auto rounded-xl border border-gold/15 bg-white/80 px-4 py-3 text-[12.5px] italic leading-[1.55] text-ink-muted">
              {huddle.description}
            </p>
          ) : null}
        </div>

        {/* Chat panel */}
        {chatOpen ? (
          <aside className="hidden w-[320px] shrink-0 md:block">
            <HuddleChat huddleId={huddle.id} />
          </aside>
        ) : null}
      </div>

      {/* Mobile chat overlay */}
      {chatOpen ? (
        <div className="fixed inset-x-0 bottom-[72px] z-10 mx-3 h-[48vh] md:hidden">
          <HuddleChat huddleId={huddle.id} />
        </div>
      ) : null}

      {/* Control bar */}
      <footer className="border-t border-gold/10 bg-white px-6 py-3">
        <div className="mx-auto flex max-w-3xl items-center justify-center gap-2">
          <ControlButton
            active={!!me?.mic_on}
            onClick={() => myProfileId && toggleMic(huddle.id, myProfileId)}
            iconOn={<Mic size={14} strokeWidth={1.8} />}
            iconOff={<MicOff size={14} strokeWidth={1.8} />}
            label={me?.mic_on ? "mute" : "unmute"}
            tone={me?.mic_on ? "neutral" : "muted"}
          />
          <ControlButton
            active={!!me?.has_video}
            onClick={() => myProfileId && toggleVideo(huddle.id, myProfileId)}
            iconOn={<Video size={14} strokeWidth={1.8} />}
            iconOff={<VideoOff size={14} strokeWidth={1.8} />}
            label={me?.has_video ? "stop video" : "start video"}
            tone="neutral"
          />
          <button
            type="button"
            onClick={() => setChatOpen((o) => !o)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[12.5px] font-medium transition-colors",
              chatOpen
                ? "bg-ink text-ivory"
                : "border border-border bg-white text-ink-muted hover:border-ink/30 hover:text-ink",
            )}
          >
            <MessageCircle size={14} strokeWidth={1.8} />
            chat
          </button>
          <button
            type="button"
            onClick={handleLeave}
            className="inline-flex items-center gap-1.5 rounded-full bg-rose px-4 py-2 text-[12.5px] font-medium text-white transition-colors hover:bg-rose/90"
          >
            <PhoneOff size={14} strokeWidth={1.8} />
            leave
          </button>
          {isHost ? (
            <button
              type="button"
              onClick={handleEnd}
              className="ml-2 rounded-full border border-rose/40 bg-white px-3.5 py-2 text-[11.5px] font-medium text-rose transition-colors hover:bg-rose/10"
            >
              end huddle
            </button>
          ) : null}
        </div>
      </footer>
    </div>
  );
}

// ── Participant grid ───────────────────────────────────────────────────────

function ParticipantGrid({
  participants,
  activeSpeakerId,
}: {
  participants: HuddleParticipant[];
  activeSpeakerId?: string;
}) {
  const profiles = useCommunityProfilesStore((s) => s.profiles);

  const videoTiles = participants.filter((p) => p.has_video);
  const audioOnly = participants.filter((p) => !p.has_video);

  if (participants.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-gold/25 bg-white/60 text-center">
        <p className="font-serif text-[18px] italic text-ink-muted">
          empty room — invite someone to hop in.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6 overflow-y-auto">
      {videoTiles.length > 0 ? (
        <div
          className={cn(
            "grid gap-3",
            videoTiles.length === 1
              ? "grid-cols-1"
              : videoTiles.length <= 4
                ? "grid-cols-2"
                : "grid-cols-3",
          )}
        >
          {videoTiles.map((p) => {
            const profile = profiles.find((x) => x.id === p.profile_id);
            const isActive = p.profile_id === activeSpeakerId;
            return (
              <div
                key={p.id}
                className={cn(
                  "relative flex aspect-video items-center justify-center rounded-xl bg-gradient-to-br from-ink/80 to-ink/50 text-ivory shadow-sm transition-all",
                  isActive && "ring-2 ring-gold/80 ring-offset-2 ring-offset-ivory-warm/50",
                )}
              >
                <div className="text-center">
                  <BrideAvatar
                    name={profile?.display_name ?? "?"}
                    src={profile?.avatar_data_url}
                    size={60}
                  />
                  <p className="mt-2 text-[11.5px] text-ivory/80">
                    {profile?.display_name.split(" ")[0] ?? "bride"} · video on
                  </p>
                </div>
                {!p.mic_on ? (
                  <span className="absolute bottom-2 right-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-ink/80 text-ivory">
                    <MicOff size={11} strokeWidth={1.8} />
                  </span>
                ) : null}
              </div>
            );
          })}
        </div>
      ) : null}

      {audioOnly.length > 0 ? (
        <div className="flex flex-wrap items-start justify-center gap-x-6 gap-y-7">
          {audioOnly.map((p) => {
            const profile = profiles.find((x) => x.id === p.profile_id);
            const isActive = p.profile_id === activeSpeakerId && p.mic_on;
            return (
              <div
                key={p.id}
                className="flex w-[88px] flex-col items-center text-center"
              >
                <div
                  className={cn(
                    "relative rounded-full transition-transform",
                    isActive && "scale-[1.04]",
                  )}
                >
                  {/* Pulsing speaking ring */}
                  {isActive ? (
                    <span className="absolute inset-0 -m-1.5 animate-ping rounded-full border-2 border-gold/60" />
                  ) : null}
                  <span
                    className={cn(
                      "relative inline-block rounded-full",
                      isActive
                        ? "ring-2 ring-gold ring-offset-2 ring-offset-ivory-warm/50"
                        : "",
                    )}
                  >
                    <BrideAvatar
                      name={profile?.display_name ?? "?"}
                      src={profile?.avatar_data_url}
                      size={64}
                    />
                  </span>
                  {!p.mic_on ? (
                    <span className="absolute -bottom-1 -right-1 inline-flex h-6 w-6 items-center justify-center rounded-full border-2 border-ivory-warm/80 bg-ink text-ivory">
                      <MicOff size={10} strokeWidth={1.8} />
                    </span>
                  ) : null}
                </div>
                <p className="mt-2 max-w-full truncate text-[12px] font-medium text-ink">
                  {profile?.display_name.split(" ")[0] ?? "bride"}
                </p>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

// ── Control button ─────────────────────────────────────────────────────────

function ControlButton({
  active,
  onClick,
  iconOn,
  iconOff,
  label,
  tone,
}: {
  active: boolean;
  onClick: () => void;
  iconOn: React.ReactNode;
  iconOff: React.ReactNode;
  label: string;
  tone: "neutral" | "muted";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[12.5px] font-medium transition-colors",
        active
          ? "bg-ink text-ivory hover:bg-ink-soft"
          : tone === "muted"
            ? "bg-rose/10 text-rose hover:bg-rose/20"
            : "border border-border bg-white text-ink-muted hover:border-ink/30 hover:text-ink",
      )}
    >
      {active ? iconOn : iconOff}
      {label}
    </button>
  );
}
