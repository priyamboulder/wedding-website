"use client";

// ── Huddle host ─────────────────────────────────────────────────────────────
// Top-level mount point that renders the active huddle UI anywhere in the
// app. When the user is in a huddle, shows the full HuddleRoom; when they
// minimize, falls back to the mini-bar. Designed to sit in app/layout.tsx
// so the huddle persists across route changes.

import { useEffect, useState } from "react";
import { useCommunityHuddlesStore } from "@/stores/community-huddles-store";
import { HuddleRoom } from "./HuddleRoom";
import { HuddleMiniBar } from "./HuddleMiniBar";

export function HuddleHost() {
  const [minimized, setMinimized] = useState(false);
  const ensureSeeded = useCommunityHuddlesStore((s) => s.ensureSeeded);

  const activeHuddleId = useCommunityHuddlesStore((s) => s.activeHuddleId);
  const huddles = useCommunityHuddlesStore((s) => s.huddles);

  useEffect(() => {
    ensureSeeded();
  }, [ensureSeeded]);

  // Reset minimized state whenever the active huddle changes.
  useEffect(() => {
    setMinimized(false);
  }, [activeHuddleId]);

  const huddle = activeHuddleId
    ? huddles.find((h) => h.id === activeHuddleId)
    : undefined;

  // If the huddle has ended or the user has left, render nothing.
  if (!huddle || huddle.status !== "live") return null;

  if (minimized) {
    return (
      <HuddleMiniBar
        huddle={huddle}
        onReturn={() => setMinimized(false)}
        onLeave={() => setMinimized(false)}
      />
    );
  }

  return (
    <HuddleRoom
      huddle={huddle}
      onMinimize={() => setMinimized(true)}
      onLeave={() => setMinimized(false)}
    />
  );
}
