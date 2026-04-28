"use client";

// ── Report button ───────────────────────────────────────────────────────────
// Sends a report to the moderation queue. Three unique reporters auto-hide
// the item pending review (handled in the store).

import { Flag } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useGrapevineStore } from "@/stores/grapevine-store";
import { useCommunityProfilesStore } from "@/stores/community-profiles-store";

export function GrapevineReportButton({
  target,
  targetId,
}: {
  target: "thread" | "reply";
  targetId: string;
}) {
  const myProfileId = useCommunityProfilesStore((s) => s.myProfileId);
  const report = useGrapevineStore((s) => s.reportItem);
  const [reported, setReported] = useState(false);

  const onClick = () => {
    if (!myProfileId || reported) return;
    const reason = window.prompt(
      "What's wrong with this post? (optional — sent to moderators)",
      "",
    );
    if (reason === null) return; // cancelled
    report({
      reporter_id: myProfileId,
      target,
      targetId,
      reason: reason.trim() || undefined,
    });
    setReported(true);
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!myProfileId || reported}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-2.5 py-1 text-[11.5px] font-medium text-ink-muted transition-colors hover:border-henna/30 hover:text-henna",
        (!myProfileId || reported) && "cursor-not-allowed opacity-60",
      )}
    >
      <Flag size={11} strokeWidth={1.8} />
      {reported ? "reported" : "report"}
    </button>
  );
}
