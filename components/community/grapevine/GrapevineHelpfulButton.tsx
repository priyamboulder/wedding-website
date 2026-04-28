"use client";

// ── Helpful vote button ─────────────────────────────────────────────────────
// Toggles a "helpful" vote on a thread or reply. Optimistic via the Zustand
// store — the store is the source of truth for both the count and the
// "have I voted?" state.

import { ThumbsUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGrapevineStore } from "@/stores/grapevine-store";
import { useCommunityProfilesStore } from "@/stores/community-profiles-store";

export function GrapevineHelpfulButton({
  target,
  targetId,
  count,
  size = "sm",
}: {
  target: "thread" | "reply";
  targetId: string;
  count: number;
  size?: "sm" | "md";
}) {
  const myProfileId = useCommunityProfilesStore((s) => s.myProfileId);
  const hasVoted = useGrapevineStore((s) =>
    myProfileId ? s.hasVoted(myProfileId, target, targetId) : false,
  );
  const toggle = useGrapevineStore((s) => s.toggleHelpful);

  const onClick = () => {
    if (!myProfileId) return;
    toggle(myProfileId, target, targetId);
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!myProfileId}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border transition-colors",
        size === "sm" ? "px-2.5 py-1 text-[11.5px]" : "px-3 py-1.5 text-[12.5px]",
        hasVoted
          ? "border-saffron/40 bg-saffron/10 text-saffron"
          : "border-border bg-white text-ink-muted hover:border-saffron/30 hover:text-ink",
        !myProfileId && "cursor-not-allowed opacity-60",
      )}
    >
      <ThumbsUp
        size={size === "sm" ? 12 : 13}
        strokeWidth={1.8}
        className={cn(hasVoted && "fill-saffron/40")}
      />
      <span className="font-medium">
        {count > 0 ? `${count} helpful` : "helpful"}
      </span>
    </button>
  );
}
