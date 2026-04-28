"use client";

/**
 * TopNav — the single source of truth for the app's primary navigation.
 *
 * Pages render `<TopNav>…right-side actions…</TopNav>`. The couple heading and
 * tab list are rendered here; whatever you pass as children fills the right
 * half of the header (and becomes a second flex child under `justify-between`).
 *
 * Pass a fragment with multiple divs if you want the old 3-column layout
 * (e.g. a centered info block + right-aligned action buttons).
 */

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

// Shopping lives at /[weddingId]/shopping — match any first segment.
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
      className={cn(
        "relative flex h-16 items-center justify-between border-b border-gold/10 bg-white px-8",
        className,
      )}
      role="banner"
    >
      <div className="flex items-center gap-6">
        <div className="relative">
          <NextLink
            href={HOME_HREF}
            aria-label={`${couple.person1} & ${couple.person2} — home`}
            aria-current={homeActive ? "page" : undefined}
            className={cn(
              "group inline-block font-serif text-xl font-medium tracking-tight text-ink transition-colors",
              "hover:text-gold focus-visible:text-gold focus-visible:outline-none",
            )}
          >
            <span className="border-b border-transparent group-hover:border-gold/50 group-focus-visible:border-gold/50">
              {couple.person1}
              <span className="mx-2 font-light text-ink-faint">&</span>
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
                className={cn(
                  "relative flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12.5px] font-medium transition-colors",
                  active
                    ? "bg-ink text-ivory"
                    : "text-ink-muted hover:bg-ivory-warm hover:text-ink",
                )}
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

// One-time post-completion hint pointing at the couple's name. Renders only
// after the brief has been completed at least once and only on the first
// visit thereafter — dismissed state persists via the events store.
function HomeCoachmark() {
  const hasCompletedOnce = useEventsStore((s) => s.quiz.hasCompletedOnce);
  const dismissed = useEventsStore((s) => s.quiz.coachmarkDismissed);
  const dismiss = useEventsStore((s) => s.dismissCoachmark);

  if (!hasCompletedOnce || dismissed) return null;

  return (
    <div
      role="status"
      className="absolute left-0 top-full z-20 mt-3 w-[280px] rounded-md border border-gold/40 bg-white p-3 text-[12px] leading-snug text-ink-soft shadow-lg"
    >
      <span
        aria-hidden
        className="absolute -top-1.5 left-6 h-3 w-3 rotate-45 border-l border-t border-gold/40 bg-white"
      />
      <div className="flex items-start gap-2">
        <Sparkles
          size={12}
          strokeWidth={1.8}
          className="mt-0.5 shrink-0 text-gold"
        />
        <div className="min-w-0 flex-1">
          <p>This is home — come back anytime by clicking your names.</p>
          <button
            type="button"
            onClick={dismiss}
            className="mt-1.5 font-mono text-[9.5px] uppercase tracking-[0.18em] text-ink-muted transition-colors hover:text-ink"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
