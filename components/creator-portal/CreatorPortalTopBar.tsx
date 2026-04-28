"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ArrowLeft, Bell } from "lucide-react";
import { useCreatorsStore } from "@/stores/creators-store";
import { useCreatorPortalStore } from "@/stores/creator-portal-store";
import { useCurrentCreator } from "@/lib/creators/current-creator";
import { useNotificationsStore } from "@/stores/notifications-store";
import { CreatorAvatar } from "@/components/creators/CreatorAvatar";
import { cn } from "@/lib/utils";

export function CreatorPortalTopBar() {
  const creators = useCreatorsStore((s) => s.creators);
  const setActiveCreatorId = useCreatorPortalStore((s) => s.setActiveCreatorId);
  const current = useCurrentCreator();
  const notifications = useNotificationsStore((s) => s.notifications);
  const unread = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications],
  );

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-gold/10 bg-white/90 px-6 backdrop-blur">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-[0.22em] text-ink-faint transition-colors hover:text-gold"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          <ArrowLeft size={12} strokeWidth={1.8} />
          Platform
        </Link>
        <div className="hidden h-5 w-px bg-gold/15 sm:block" />
        <div className="hidden sm:block">
          <p
            className="font-mono text-[9.5px] uppercase tracking-[0.22em] text-ink-faint"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Viewing as
          </p>
          <select
            value={current?.id ?? ""}
            onChange={(e) => setActiveCreatorId(e.target.value)}
            className="mt-0.5 border-0 bg-transparent font-serif text-[13.5px] text-ink focus:outline-none focus:ring-0"
            aria-label="Switch active creator"
          >
            {creators.map((c) => (
              <option key={c.id} value={c.id}>
                {c.displayName}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Link
          href="/creator/notifications"
          className="relative rounded-full p-2 text-ink-muted transition-colors hover:bg-ivory-warm hover:text-ink"
          aria-label={`Notifications${unread > 0 ? ` (${unread} unread)` : ""}`}
        >
          <Bell size={15} strokeWidth={1.7} />
          {unread > 0 && (
            <span
              className={cn(
                "absolute right-1 top-1 min-w-[15px] rounded-full bg-rose px-1 text-center text-[9px] font-semibold leading-[15px] text-white",
              )}
            >
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </Link>
        {current && (
          <Link
            href="/creator/settings"
            className="flex items-center gap-2 rounded-full border border-transparent px-1 py-0.5 transition-colors hover:border-gold/20 hover:bg-ivory-warm"
          >
            <CreatorAvatar creator={current} size="sm" withBadge={false} />
          </Link>
        )}
      </div>
    </header>
  );
}
