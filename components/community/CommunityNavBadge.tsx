"use client";

// Small red dot on the Community top-nav item when there are unread messages
// or pending connection requests. Matches the NotificationBell badge style.

import { useEffect, useState } from "react";
import { useCommunityProfilesStore } from "@/stores/community-profiles-store";
import { useCommunitySocialStore } from "@/stores/community-social-store";

export function CommunityNavBadge({ active }: { active: boolean }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const myProfileId = useCommunityProfilesStore((s) => s.myProfileId);
  const connections = useCommunitySocialStore((s) => s.connections);
  const messages = useCommunitySocialStore((s) => s.messages);

  if (!mounted || !myProfileId) return null;

  const pendingRequests = connections.filter(
    (c) => c.recipient_id === myProfileId && c.status === "pending",
  ).length;

  const acceptedIds = new Set(
    connections
      .filter(
        (c) =>
          c.status === "accepted" &&
          (c.requester_id === myProfileId || c.recipient_id === myProfileId),
      )
      .map((c) => c.id),
  );

  const unreadMessages = messages.filter(
    (m) =>
      acceptedIds.has(m.connection_id) &&
      m.sender_id !== myProfileId &&
      !m.read_at,
  ).length;

  const total = pendingRequests + unreadMessages;
  if (total === 0) return null;

  return (
    <span
      aria-label={`${total} new ${total === 1 ? "notification" : "notifications"}`}
      className="absolute -right-1 -top-1 flex h-[15px] min-w-[15px] items-center justify-center rounded-full px-1 font-mono text-[9px] font-semibold text-white"
      style={{
        backgroundColor: active ? "#B8755D" : "#B8755D",
        fontFamily: "var(--font-mono)",
      }}
    >
      {total > 9 ? "9+" : total}
    </span>
  );
}
