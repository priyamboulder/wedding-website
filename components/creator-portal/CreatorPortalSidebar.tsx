"use client";

import { useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  UserCircle,
  Layers,
  Sparkles,
  Zap,
  BookOpen,
  Calendar,
  Handshake,
  DollarSign,
  TrendingUp,
  Bell,
  Settings,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CreatorAvatar } from "@/components/creators/CreatorAvatar";
import { TierBadge } from "@/components/creators/TierBadge";
import { useCurrentCreator } from "@/lib/creators/current-creator";
import { useNotificationsStore } from "@/stores/notifications-store";
import { usePartnershipsStore } from "@/stores/partnerships-store";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  group: "workspace" | "content" | "business" | "account";
};

const NAV: NavItem[] = [
  { href: "/creator", label: "Home", icon: LayoutDashboard, group: "workspace" },
  { href: "/creator/profile", label: "Profile", icon: UserCircle, group: "workspace" },
  { href: "/creator/collections", label: "Collections", icon: Layers, group: "content" },
  { href: "/creator/exhibitions", label: "Exhibitions", icon: Sparkles, group: "content" },
  { href: "/creator/drops", label: "Drops", icon: Zap, group: "content" },
  { href: "/creator/guides", label: "Guides", icon: BookOpen, group: "content" },
  { href: "/creator/consultations", label: "Consultations", icon: Calendar, group: "business" },
  { href: "/creator/partnerships", label: "Partnerships", icon: Handshake, group: "business" },
  { href: "/creator/earnings", label: "Earnings", icon: DollarSign, group: "business" },
  { href: "/creator/tier", label: "Tier & Growth", icon: TrendingUp, group: "business" },
  { href: "/creator/notifications", label: "Notifications", icon: Bell, group: "account" },
  { href: "/creator/settings", label: "Settings", icon: Settings, group: "account" },
];

const GROUP_LABEL: Record<NavItem["group"], string> = {
  workspace: "Your workspace",
  content: "Content",
  business: "Business",
  account: "Account",
};

export function CreatorPortalSidebar() {
  const pathname = usePathname() ?? "";
  const creator = useCurrentCreator();

  const allNotifications = useNotificationsStore((s) => s.notifications);
  const unreadCreatorNotifs = useMemo(
    () => allNotifications.filter((n) => !n.read && isCreatorNotification(n.type)).length,
    [allNotifications],
  );
  const pendingPartnerships = usePartnershipsStore((s) =>
    creator ? s.statsForCreator(creator.id).pending : 0,
  );

  const badges: Record<string, number | undefined> = {
    "/creator/notifications":
      unreadCreatorNotifs > 0 ? unreadCreatorNotifs : undefined,
    "/creator/partnerships":
      pendingPartnerships > 0 ? pendingPartnerships : undefined,
  };

  const grouped = NAV.reduce<Record<NavItem["group"], NavItem[]>>(
    (acc, item) => {
      acc[item.group].push(item);
      return acc;
    },
    { workspace: [], content: [], business: [], account: [] },
  );

  return (
    <aside
      className="sticky top-0 hidden h-screen w-[252px] shrink-0 flex-col border-r border-gold/10 bg-ivory-warm lg:flex"
      aria-label="Creator portal navigation"
    >
      {/* Creator identity header */}
      <div className="border-b border-gold/15 px-5 py-5">
        <p
          className="font-mono text-[9.5px] uppercase tracking-[0.28em] text-gold"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Creator portal
        </p>
        {creator ? (
          <Link
            href="/creator/profile"
            className="mt-3 flex items-start gap-3"
          >
            <CreatorAvatar creator={creator} size="md" />
            <div className="min-w-0 flex-1">
              <div className="truncate font-serif text-[15px] leading-tight text-ink">
                {creator.displayName}
              </div>
              <div
                className="truncate font-mono text-[10px] text-ink-faint"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {creator.handle}
              </div>
              <div className="mt-1.5">
                <TierBadge tier={creator.tier} size="xs" />
              </div>
            </div>
          </Link>
        ) : (
          <p className="mt-2 text-[12px] italic text-ink-muted">
            No creator selected.
          </p>
        )}
      </div>

      {/* Nav groups */}
      <nav className="flex-1 overflow-y-auto px-2 py-4">
        {(Object.keys(grouped) as NavItem["group"][]).map((group) => (
          <div key={group} className="mb-5 last:mb-0">
            <p
              className="mb-1 px-3 font-mono text-[9.5px] uppercase tracking-[0.22em] text-ink-faint"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {GROUP_LABEL[group]}
            </p>
            <ul className="flex flex-col gap-0.5">
              {grouped[group].map((item) => {
                const Icon = item.icon;
                const active = isActive(pathname, item.href);
                const badge = badges[item.href];
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "group flex items-center gap-2.5 rounded-md px-3 py-1.5 text-[13px] transition-colors",
                        active
                          ? "bg-white text-ink shadow-sm ring-1 ring-gold/20"
                          : "text-ink-muted hover:bg-white/60 hover:text-ink",
                      )}
                    >
                      <Icon
                        size={14}
                        strokeWidth={1.7}
                        className={cn(
                          "shrink-0",
                          active ? "text-gold" : "text-ink-faint",
                        )}
                      />
                      <span className="flex-1 truncate">{item.label}</span>
                      {badge !== undefined && (
                        <span
                          className={cn(
                            "min-w-[18px] rounded-full px-1.5 py-[1px] text-center text-[9.5px] font-semibold leading-4",
                            active
                              ? "bg-gold text-ivory"
                              : "bg-ink text-ivory",
                          )}
                        >
                          {badge}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-gold/15 px-5 py-3 text-[11.5px] text-ink-muted">
        <Link
          href="/dashboard"
          className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint transition-colors hover:text-gold"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          ← Back to platform
        </Link>
      </div>
    </aside>
  );
}

function isActive(pathname: string, href: string) {
  if (href === "/creator") return pathname === "/creator";
  return pathname === href || pathname.startsWith(href + "/");
}

function isCreatorNotification(type: string): boolean {
  return (
    type.startsWith("partnership_") ||
    type.startsWith("drop_") ||
    type === "review_received" ||
    type === "application_approved"
  );
}
