"use client";

import NextLink from "next/link";
import { usePathname } from "next/navigation";
import {
  Gift,
  HeartHandshake,
  Layers,
  ListChecks,
  ShoppingBag,
  Sparkles,
  Users,
  UserCircle2,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { AccountButton } from "@/components/shell/AccountButton";
import { NotificationBell } from "@/components/shell/NotificationBell";
import { CommunityNavBadge } from "@/components/community/CommunityNavBadge";
import { useEventsStore } from "@/stores/events-store";
import { useCoupleIdentity } from "@/lib/couple-identity";

const HOME_HREF = "/dashboard";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  match: (pathname: string) => boolean;
};

const hasPrefix = (prefix: string) => (p: string) =>
  p === prefix || p.startsWith(prefix + "/");

const matchShopping = (p: string) => /^\/[^/]+\/shopping(\/|$)/.test(p);

const NAV_ITEMS: readonly NavItem[] = [
  { href: "/checklist", label: "Checklist", icon: ListChecks, match: hasPrefix("/checklist") },
  { href: "/default/shopping", label: "Shopping", icon: ShoppingBag, match: matchShopping },
  { href: "/vendors", label: "Vendors", icon: Users, match: hasPrefix("/vendors") },
  {
    href: "/workspace",
    label: "Workspace",
    icon: Layers,
    match: (p) => hasPrefix("/workspace")(p) || hasPrefix("/documents")(p),
  },
  { href: "/guests", label: "Guests", icon: UserCircle2, match: hasPrefix("/guests") },
  { href: "/registry", label: "Registry", icon: Gift, match: hasPrefix("/registry") },
  { href: "/studio", label: "Studio", icon: Sparkles, match: hasPrefix("/studio") },
  { href: "/community", label: "Community", icon: HeartHandshake, match: hasPrefix("/community") },
];

const FONT_SYNE = "var(--font-syne), 'Syne', sans-serif";
const FONT_PLAYFAIR = "var(--font-playfair), 'Playfair Display', serif";

export function TopNav({
  children,
  className,
}: {
  children?: ReactNode;
  className?: string;
}) {
  const pathname = usePathname() ?? "";
  const homeActive = pathname === HOME_HREF;
  const couple = useCoupleIdentity();

  return (
    <header
      className={cn("relative flex h-16 items-center justify-between px-8", className)}
      role="banner"
      style={{
        background: '#FFF8F2',
        borderBottom: '1px solid rgba(75,21,40,0.1)',
      }}
    >
      <div className="flex items-center gap-6">
        <div className="relative">
          <NextLink
            href={HOME_HREF}
            aria-label={`${couple.person1} & ${couple.person2} — home`}
            aria-current={homeActive ? "page" : undefined}
            className="group inline-block transition-colors"
            style={{ fontFamily: FONT_PLAYFAIR, fontSize: 18, fontWeight: 400, color: 'var(--wine, #4B1528)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--pink, #D4537E)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--wine, #4B1528)')}
          >
            <span style={{ borderBottom: '1px solid transparent' }} className="group-hover:border-pink-400/50">
              {couple.person1}
              <span style={{ margin: '0 8px', fontWeight: 300, color: 'rgba(75,21,40,0.35)' }}>&</span>
              {couple.person2}
            </span>
          </NextLink>
          <HomeCoachmark />
        </div>
        <nav className="flex items-center gap-1" aria-label="Primary">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = item.match(pathname);
            return (
              <NextLink
                key={item.label}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className="relative flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px] font-medium transition-colors"
                style={{
                  fontFamily: FONT_SYNE,
                  fontWeight: active ? 700 : 500,
                  letterSpacing: '0.04em',
                  background: active ? 'var(--wine, #4B1528)' : 'transparent',
                  color: active ? '#FFF8F2' : 'rgba(75,21,40,0.55)',
                }}
              >
                <Icon size={13} strokeWidth={1.8} />
                {item.label}
                {item.href === "/community" && <CommunityNavBadge active={active} />}
              </NextLink>
            );
          })}
        </nav>
      </div>

      <div className="flex items-center gap-4">
        {children}
        <NotificationBell recipient="couple" />
        <AccountButton />
      </div>
    </header>
  );
}

function HomeCoachmark() {
  const hasCompletedOnce = useEventsStore((s) => s.quiz.hasCompletedOnce);
  const dismissed = useEventsStore((s) => s.quiz.coachmarkDismissed);
  const dismiss = useEventsStore((s) => s.dismissCoachmark);

  if (!hasCompletedOnce || dismissed) return null;

  return (
    <div
      role="status"
      className="absolute left-0 top-full z-20 mt-3 w-[280px] p-3 text-[12px] leading-snug shadow-lg"
      style={{
        background: '#FFF8F2',
        border: '1px solid rgba(212,83,126,0.3)',
        borderRadius: 4,
        color: 'rgba(75,21,40,0.7)',
      }}
    >
      <span
        aria-hidden
        className="absolute -top-1.5 left-6 h-3 w-3 rotate-45"
        style={{ borderLeft: '1px solid rgba(212,83,126,0.3)', borderTop: '1px solid rgba(212,83,126,0.3)', background: '#FFF8F2' }}
      />
      <div className="flex items-start gap-2">
        <Sparkles size={12} strokeWidth={1.8} className="mt-0.5 shrink-0" style={{ color: 'var(--pink, #D4537E)' }} />
        <div className="min-w-0 flex-1">
          <p>This is home — come back anytime by clicking your names.</p>
          <button
            type="button"
            onClick={dismiss}
            className="mt-1.5 text-[9.5px] uppercase tracking-[0.18em] transition-colors"
            style={{ fontFamily: FONT_SYNE, color: 'rgba(75,21,40,0.45)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--pink, #D4537E)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(75,21,40,0.45)')}
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
