"use client";

// ── Live huddles banner ─────────────────────────────────────────────────────
// Top strip on the Discover tab surfacing live huddles. Renders nothing if
// no huddles are live. Tapping a row opens the lobby for that huddle.

import { useMemo, useState } from "react";
import { Headphones, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { BrideAvatar } from "@/components/community/BrideAvatar";
import { useCommunityHuddlesStore } from "@/stores/community-huddles-store";
import { useCommunityProfilesStore } from "@/stores/community-profiles-store";
import { HuddleLobby } from "./HuddleLobby";
import { HuddleCreateModal } from "./HuddleCreateModal";

export function LiveHuddlesBanner() {
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const huddles = useCommunityHuddlesStore((s) => s.huddles);
  const participants = useCommunityHuddlesStore((s) => s.participants);
  const setActiveHuddle = useCommunityHuddlesStore((s) => s.setActiveHuddle);

  const profiles = useCommunityProfilesStore((s) => s.profiles);
  const myProfileId = useCommunityProfilesStore((s) => s.myProfileId);

  const live = useMemo(
    () => huddles.filter((h) => h.status === "live"),
    [huddles],
  );

  if (live.length === 0) return null;

  const joiningHuddle = joiningId
    ? huddles.find((h) => h.id === joiningId)
    : undefined;

  return (
    <div className="border-b border-gold/10 bg-gradient-to-r from-rose/[0.04] via-ivory-warm/30 to-ivory-warm/10 px-6 py-5 md:px-10">
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
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            disabled={!myProfileId}
            className={cn(
              "inline-flex items-center gap-1 text-[12px] font-medium transition-colors",
              myProfileId
                ? "text-ink-muted hover:text-ink"
                : "cursor-not-allowed text-ink-faint",
            )}
          >
            <Plus size={12} strokeWidth={1.8} />
            start a huddle
          </button>
        </div>

        <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
          {live.map((h) => {
            const host = profiles.find((p) => p.id === h.host_id);
            const inRoom = participants.filter(
              (p) => p.huddle_id === h.id && p.status === "in_room",
            );
            const inRoomProfiles = inRoom
              .map((p) => profiles.find((x) => x.id === p.profile_id))
              .filter((p): p is NonNullable<typeof p> => !!p);
            const imHere = myProfileId
              ? inRoom.some((p) => p.profile_id === myProfileId)
              : false;

            return (
              <button
                key={h.id}
                type="button"
                onClick={() => {
                  if (imHere) {
                    setActiveHuddle(h.id);
                  } else {
                    setJoiningId(h.id);
                  }
                }}
                className="group flex min-w-[300px] shrink-0 flex-col gap-2 rounded-xl border border-rose/25 bg-white px-4 py-3 text-left transition-colors hover:border-rose/50 hover:shadow-sm"
              >
                <div className="flex items-center gap-2">
                  <Headphones size={13} strokeWidth={1.8} className="text-rose" />
                  <span className="truncate font-serif text-[15px] font-medium leading-[1.2] text-ink">
                    {h.title}
                  </span>
                </div>
                <p className="truncate text-[11.5px] text-ink-muted">
                  hosted by {host?.display_name ?? "a bride"}
                </p>
                <div className="mt-1 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      {inRoomProfiles.slice(0, 4).map((p) => (
                        <BrideAvatar
                          key={p.id}
                          name={p.display_name}
                          src={p.avatar_data_url}
                          size={22}
                          style={{ boxShadow: "0 0 0 2px #fff" }}
                        />
                      ))}
                    </div>
                    <p className="text-[11.5px] text-ink-muted">
                      {inRoomProfiles.length} chatting
                    </p>
                  </div>
                  <span
                    className={cn(
                      "rounded-full px-3 py-1 text-[11px] font-medium transition-colors",
                      imHere
                        ? "bg-ink text-ivory"
                        : "bg-rose text-white group-hover:bg-rose/90",
                    )}
                  >
                    {imHere ? "return →" : "hop in →"}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {joiningHuddle ? (
        <HuddleLobby
          huddle={joiningHuddle}
          onCancel={() => setJoiningId(null)}
          onJoined={() => setJoiningId(null)}
        />
      ) : null}

      <HuddleCreateModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => setCreateOpen(false)}
      />
    </div>
  );
}
