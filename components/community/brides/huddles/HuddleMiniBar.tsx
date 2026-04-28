"use client";

// ── Huddle mini-bar ────────────────────────────────────────────────────────
// Persistent strip shown at the bottom of the screen when the current user
// is in a huddle but has minimized the room. "Return" re-opens the full
// room view; "leave" drops out entirely.

import { Mic, MicOff, PhoneOff } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Huddle } from "@/types/community";
import { useCommunityHuddlesStore } from "@/stores/community-huddles-store";
import { useCommunityProfilesStore } from "@/stores/community-profiles-store";

export function HuddleMiniBar({
  huddle,
  onReturn,
  onLeave,
}: {
  huddle: Huddle;
  onReturn: () => void;
  onLeave: () => void;
}) {
  const myProfileId = useCommunityProfilesStore((s) => s.myProfileId);
  const participants = useCommunityHuddlesStore((s) => s.participants);
  const toggleMic = useCommunityHuddlesStore((s) => s.toggleMic);
  const leaveHuddle = useCommunityHuddlesStore((s) => s.leaveHuddle);

  const inRoom = participants.filter(
    (p) => p.huddle_id === huddle.id && p.status === "in_room",
  );
  const me = inRoom.find((p) => p.profile_id === myProfileId);

  const handleLeave = () => {
    if (myProfileId) leaveHuddle(huddle.id, myProfileId);
    onLeave();
  };

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-40 flex justify-center px-4">
      <div
        className={cn(
          "pointer-events-auto flex w-full max-w-2xl items-center gap-3 rounded-full border border-gold/20 bg-white/95 px-4 py-2 shadow-[0_10px_40px_rgba(28,25,23,0.12)] backdrop-blur",
        )}
      >
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose/70" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-rose" />
        </span>

        <button
          type="button"
          onClick={onReturn}
          className="flex min-w-0 flex-1 items-center gap-2 text-left"
        >
          <p
            className="font-mono text-[9.5px] uppercase tracking-[0.22em] text-rose"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            in huddle
          </p>
          <span className="text-ink-faint">·</span>
          <p className="truncate text-[12.5px] font-medium text-ink">
            {huddle.title}
          </p>
          <span className="hidden text-[11.5px] text-ink-muted sm:inline">
            · {inRoom.length} people
          </span>
        </button>

        {/* Quick mic toggle */}
        {me ? (
          <button
            type="button"
            onClick={() =>
              myProfileId && toggleMic(huddle.id, myProfileId)
            }
            className={cn(
              "inline-flex h-8 w-8 items-center justify-center rounded-full transition-colors",
              me.mic_on
                ? "bg-ink text-ivory hover:bg-ink-soft"
                : "bg-rose/15 text-rose hover:bg-rose/25",
            )}
            aria-label={me.mic_on ? "Mute" : "Unmute"}
          >
            {me.mic_on ? (
              <Mic size={13} strokeWidth={1.8} />
            ) : (
              <MicOff size={13} strokeWidth={1.8} />
            )}
          </button>
        ) : null}

        <button
          type="button"
          onClick={onReturn}
          className="hidden rounded-full border border-border bg-white px-3 py-1 text-[11.5px] font-medium text-ink-muted transition-colors hover:border-ink/30 hover:text-ink sm:inline-flex"
        >
          return
        </button>

        <button
          type="button"
          onClick={handleLeave}
          className="inline-flex items-center gap-1 rounded-full bg-rose px-3 py-1 text-[11.5px] font-medium text-white transition-colors hover:bg-rose/90"
        >
          <PhoneOff size={11} strokeWidth={1.8} />
          leave
        </button>
      </div>
    </div>
  );
}
