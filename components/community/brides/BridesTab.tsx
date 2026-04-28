"use client";

// ── Brides tab ──────────────────────────────────────────────────────────────
// Orchestrates the four sub-views: Discover / Connections / Messages /
// Settings. First-time users see the onboarding card before any sub-view
// renders. Sub-view is URL-driven (?view=…) so the detail panel and
// connections row can deep-link into a message thread.

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CalendarHeart,
  Coins,
  Heart,
  MessageCircle,
  MessagesSquare,
  Radio,
  Search,
  Settings,
  Users2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCommunityProfilesStore } from "@/stores/community-profiles-store";
import { useCommunitySocialStore } from "@/stores/community-social-store";
import { useCommunityLiveEventsStore } from "@/stores/community-live-events-store";
import { useVendorNeedsStore } from "@/stores/vendor-needs-store";
import { BridesOnboarding } from "./BridesOnboarding";
import { BridesDirectory } from "./BridesDirectory";
import { ConnectionsPanel } from "./ConnectionsPanel";
import { DiscussionsPanel } from "./DiscussionsPanel";
import { LiveEventsPanel } from "./live/LiveEventsPanel";
import { MessagesPanel } from "./MessagesPanel";
import { MeetupsPanel } from "./MeetupsPanel";
import { ProfileSettingsPanel } from "./ProfileSettingsPanel";
import { RealNumbersPanel } from "./RealNumbersPanel";
import { AskABridePanel } from "./AskABridePanel";

type SubTab =
  | "discover"
  | "live"
  | "discussions"
  | "meetups"
  | "ask_a_bride"
  | "connections"
  | "messages"
  | "real_numbers"
  | "settings";

const VALID: Record<string, SubTab> = {
  discover: "discover",
  live: "live",
  discussions: "discussions",
  meetups: "meetups",
  ask_a_bride: "ask_a_bride",
  connections: "connections",
  messages: "messages",
  real_numbers: "real_numbers",
  settings: "settings",
};

export function BridesTab() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const viewParam = searchParams?.get("view") ?? "";
  const subTab: SubTab = VALID[viewParam] ?? "discover";

  const [skippedOnboarding, setSkippedOnboarding] = useState(false);

  // Select raw state; derive counts below so we don't produce a new array
  // reference on every call (that triggers the "getSnapshot should be cached"
  // loop in Zustand).
  const profiles = useCommunityProfilesStore((s) => s.profiles);
  const myProfileId = useCommunityProfilesStore((s) => s.myProfileId);
  const myProfile = useMemo(
    () => (myProfileId ? profiles.find((p) => p.id === myProfileId) : undefined),
    [profiles, myProfileId],
  );

  const connections = useCommunitySocialStore((s) => s.connections);
  const messages = useCommunitySocialStore((s) => s.messages);

  // Live event indicator — a pulsing dot on the "Live" tab when something
  // is happening right now.
  const ensureLiveEventsSeeded = useCommunityLiveEventsStore(
    (s) => s.ensureSeeded,
  );
  const liveEvents = useCommunityLiveEventsStore((s) => s.events);
  const hasLiveNow = useMemo(
    () => liveEvents.some((e) => e.status === "live"),
    [liveEvents],
  );
  useEffect(() => {
    ensureLiveEventsSeeded();
  }, [ensureLiveEventsSeeded]);

  const pendingIncomingCount = useMemo(
    () =>
      myProfileId
        ? connections.filter(
            (c) => c.recipient_id === myProfileId && c.status === "pending",
          ).length
        : 0,
    [connections, myProfileId],
  );

  const unreadCount = useMemo(() => {
    if (!myProfileId) return 0;
    const acceptedIds = new Set(
      connections
        .filter(
          (c) =>
            c.status === "accepted" &&
            (c.requester_id === myProfileId || c.recipient_id === myProfileId),
        )
        .map((c) => c.id),
    );
    return messages.filter(
      (m) =>
        acceptedIds.has(m.connection_id) &&
        m.sender_id !== myProfileId &&
        !m.read_at,
    ).length;
  }, [connections, messages, myProfileId]);

  const vendorInterests = useVendorNeedsStore((s) => s.interests);
  const newVendorInterestCount = useMemo(
    () =>
      myProfileId
        ? vendorInterests.filter(
            (i) =>
              i.bride_profile_id === myProfileId && i.status === "pending",
          ).length
        : 0,
    [vendorInterests, myProfileId],
  );

  const setSubTab = (id: SubTab) => {
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    params.set("tab", "connect");
    params.set("sub", "brides");
    if (id === "discover") params.delete("view");
    else params.set("view", id);
    // Clear thread id when leaving messages.
    if (id !== "messages") params.delete("thread");
    // Clear discussion id when leaving discussions.
    if (id !== "discussions") params.delete("discussion");
    router.replace(`/community?${params.toString()}`, { scroll: false });
  };

  if (!myProfile && !skippedOnboarding) {
    return <BridesOnboarding onSkip={() => setSkippedOnboarding(true)} />;
  }

  return (
    <div className="bg-white">
      <SubNav
        active={subTab}
        onChange={setSubTab}
        pendingRequests={pendingIncomingCount}
        unreadMessages={unreadCount}
        hasLiveNow={hasLiveNow}
        newVendorInterests={newVendorInterestCount}
      />

      {!myProfile && subTab === "discover" && (
        <GentleNudge onSetup={() => setSkippedOnboarding(false)} />
      )}

      {subTab === "discover" && <BridesDirectory />}
      {subTab === "live" && <LiveEventsPanel />}
      {subTab === "discussions" && <DiscussionsPanel />}
      {subTab === "meetups" && <MeetupsPanel />}
      {subTab === "ask_a_bride" && <AskABridePanel />}
      {subTab === "connections" && <ConnectionsPanel onOpenThread={(id) => {
        const p = new URLSearchParams(searchParams?.toString() ?? "");
        p.set("tab", "connect");
        p.set("sub", "brides");
        p.set("view", "messages");
        p.set("thread", id);
        router.replace(`/community?${p.toString()}`, { scroll: false });
      }} />}
      {subTab === "messages" && <MessagesPanel />}
      {subTab === "real_numbers" && <RealNumbersPanel />}
      {subTab === "settings" && <ProfileSettingsPanel />}
    </div>
  );
}

// ── Sub-nav ─────────────────────────────────────────────────────────────────

function SubNav({
  active,
  onChange,
  pendingRequests,
  unreadMessages,
  hasLiveNow,
  newVendorInterests,
}: {
  active: SubTab;
  onChange: (t: SubTab) => void;
  pendingRequests: number;
  unreadMessages: number;
  hasLiveNow: boolean;
  newVendorInterests: number;
}) {
  const items = useMemo<
    {
      id: SubTab;
      label: string;
      icon: typeof Search;
      badge?: number;
      liveDot?: boolean;
    }[]
  >(
    () => [
      { id: "discover", label: "Discover", icon: Search },
      { id: "live", label: "Live", icon: Radio, liveDot: hasLiveNow },
      { id: "discussions", label: "Discussions", icon: MessagesSquare },
      { id: "meetups", label: "Meetups", icon: CalendarHeart },
      { id: "ask_a_bride", label: "Ask a Bride", icon: Heart },
      {
        id: "connections",
        label: "Connections",
        icon: Users2,
        badge: pendingRequests,
      },
      {
        id: "messages",
        label: "Messages",
        icon: MessageCircle,
        badge: unreadMessages,
      },
      { id: "real_numbers", label: "The Real Numbers", icon: Coins },
      {
        id: "settings",
        label: "Settings",
        icon: Settings,
        badge: newVendorInterests,
      },
    ],
    [pendingRequests, unreadMessages, hasLiveNow, newVendorInterests],
  );

  return (
    <div className="border-b border-gold/10 bg-ivory-warm/20 px-10 py-3">
      <div className="mx-auto flex max-w-6xl items-center gap-1 overflow-x-auto">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = item.id === active;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              className={cn(
                "relative inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-1.5 text-[12px] font-medium transition-colors",
                isActive
                  ? "bg-ink text-ivory"
                  : "text-ink-muted hover:bg-white hover:text-ink",
              )}
            >
              <Icon size={13} strokeWidth={1.8} />
              {item.label}
              {item.liveDot ? (
                <span className="relative ml-0.5 flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose/70" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-rose" />
                </span>
              ) : null}
              {item.badge && item.badge > 0 ? (
                <span
                  className={cn(
                    "ml-1 flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 font-mono text-[9.5px] font-semibold",
                    isActive
                      ? "bg-ivory text-ink"
                      : "bg-saffron/90 text-white",
                  )}
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {item.badge > 9 ? "9+" : item.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Gentle nudge ────────────────────────────────────────────────────────────

function GentleNudge({ onSetup }: { onSetup: () => void }) {
  return (
    <div className="border-b border-gold/10 bg-ivory-warm/30 px-10 py-3">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
        <p className="text-[13px] text-ink-muted">
          browsing as a guest — set up your profile to connect and message.
        </p>
        <button
          type="button"
          onClick={onSetup}
          className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-1.5 text-[12px] font-medium text-ivory transition-colors hover:bg-ink-soft"
        >
          Set up profile
        </button>
      </div>
    </div>
  );
}
