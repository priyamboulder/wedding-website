"use client";

// ── /community ──────────────────────────────────────────────────────────────
// Five top-level tabs: Editorial, Real Weddings, Connect, The Confessional,
// The Grapevine. Each tab (except Real Weddings + Grapevine) has a secondary
// sub-nav row using the pill style introduced by the Brides tab. The active
// tab + sub live in ?tab=… and ?sub=… so links from elsewhere can deep-link
// into a specific section. Legacy ?tab values (blog, brides, magazine, etc.)
// are normalized so old links keep working.

import { Suspense, useEffect, useMemo, type ElementType } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  BookOpen,
  Bookmark,
  Grape,
  Heart,
  KeyRound,
  Lock,
  Newspaper,
  Sparkles,
  Users2,
} from "lucide-react";
import { TopNav } from "@/components/shell/TopNav";
import { cn } from "@/lib/utils";
import { useCommunityProfilesStore } from "@/stores/community-profiles-store";
import { useCommunityLiveEventsStore } from "@/stores/community-live-events-store";
import { BlogTab } from "@/components/community/blog/BlogTab";
import { BridesTab } from "@/components/community/brides/BridesTab";
import { MagazineTab } from "@/components/community/magazine/MagazineTab";
import { GuidesTab } from "@/components/community/guides/GuidesTab";
import { ShowcasesTab } from "@/components/community/showcases/ShowcasesTab";
import { CreatorsTab } from "@/components/community/creators/CreatorsTab";
import { ConfessionalTab } from "@/components/community/confessional/ConfessionalTab";
import { GrapevineTab } from "@/components/community/grapevine/GrapevineTab";
import { RishtaCircleTab } from "@/components/community/rishta-circle/RishtaCircleTab";
import { LiveEventsBanner } from "@/components/community/brides/live/LiveEventsBanner";
import { CONFESSIONAL_CATEGORIES } from "@/types/confessional";
import { RealtimeProvider } from "./_components/RealtimeProvider";

type TabId =
  | "editorial"
  | "real-weddings"
  | "connect"
  | "the-confessional"
  | "the-grapevine";

type SubItem = { id: string; label: string; icon?: ElementType };

const TABS: { id: TabId; label: string; icon: ElementType }[] = [
  { id: "editorial", label: "Editorial", icon: BookOpen },
  { id: "real-weddings", label: "Real Weddings", icon: Heart },
  { id: "connect", label: "Connect", icon: Users2 },
  { id: "the-confessional", label: "The Confessional", icon: KeyRound },
  { id: "the-grapevine", label: "The Grapevine", icon: Grape },
];

const EDITORIAL_SUBS: SubItem[] = [
  { id: "blog", label: "Blog", icon: BookOpen },
  { id: "guides", label: "Guides", icon: Bookmark },
  { id: "magazine", label: "Magazine", icon: Newspaper },
];

const CONNECT_SUBS: SubItem[] = [
  { id: "find-a-creator", label: "Find a Creator", icon: Sparkles },
  { id: "brides", label: "Brides", icon: Users2 },
  { id: "rishta-circle", label: "Rishta Circle", icon: Lock },
];

const CONFESSIONAL_SUBS: SubItem[] = [
  { id: "all", label: "All" },
  ...CONFESSIONAL_CATEGORIES.map((c) => ({ id: c.slug, label: c.label })),
];

// Default sub when a top-level tab is opened without ?sub.
const DEFAULT_SUB: Partial<Record<TabId, string>> = {
  editorial: "blog",
  connect: "find-a-creator",
  "the-confessional": "all",
};

// Map legacy ?tab values to the new (tab, sub) pair so old deep-links keep
// working even before every caller is updated.
const LEGACY_TAB_MAP: Record<string, { tab: TabId; sub?: string }> = {
  blog: { tab: "editorial", sub: "blog" },
  guides: { tab: "editorial", sub: "guides" },
  magazine: { tab: "editorial", sub: "magazine" },
  creators: { tab: "connect", sub: "find-a-creator" },
  brides: { tab: "connect", sub: "brides" },
  "inner-circle": { tab: "connect", sub: "rishta-circle" },
};

// Legacy ?sub values within /community?tab=connect that should be normalized
// to the new Rishta Circle slug.
const LEGACY_SUB_MAP: Record<string, string> = {
  "the-inner-circle": "rishta-circle",
};

const VALID_TABS: TabId[] = TABS.map((t) => t.id);

function resolveTabAndSub(
  rawTab: string | null,
  rawSub: string | null,
): { tab: TabId; sub: string | null } {
  const normalizedSub = rawSub && LEGACY_SUB_MAP[rawSub] ? LEGACY_SUB_MAP[rawSub]! : rawSub;
  if (rawTab && LEGACY_TAB_MAP[rawTab]) {
    const m = LEGACY_TAB_MAP[rawTab];
    return { tab: m.tab, sub: normalizedSub ?? m.sub ?? null };
  }
  const tab = (VALID_TABS as string[]).includes(rawTab ?? "")
    ? (rawTab as TabId)
    : "editorial";
  return { tab, sub: normalizedSub };
}

function subsForTab(tab: TabId): SubItem[] | null {
  if (tab === "editorial") return EDITORIAL_SUBS;
  if (tab === "connect") return CONNECT_SUBS;
  if (tab === "the-confessional") return CONFESSIONAL_SUBS;
  return null;
}

export default function CommunityPage() {
  return (
    <Suspense fallback={null}>
      <CommunityPageInner />
    </Suspense>
  );
}

function CommunityPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawTab = searchParams?.get("tab") ?? null;
  const rawSub = searchParams?.get("sub") ?? null;

  const { tab: activeTab, sub: rawActiveSub } = useMemo(
    () => resolveTabAndSub(rawTab, rawSub),
    [rawTab, rawSub],
  );

  const subs = subsForTab(activeTab);
  const activeSub: string | null = subs
    ? subs.some((s) => s.id === rawActiveSub)
      ? (rawActiveSub as string)
      : DEFAULT_SUB[activeTab] ?? subs[0]!.id
    : null;

  // Hydrate seed brides once so the Discover grid isn't empty on first visit.
  const ensureSeeded = useCommunityProfilesStore((s) => s.ensureSeeded);
  const ensureLiveEventsSeeded = useCommunityLiveEventsStore(
    (s) => s.ensureSeeded,
  );
  useEffect(() => {
    ensureSeeded();
    ensureLiveEventsSeeded();
  }, [ensureSeeded, ensureLiveEventsSeeded]);

  // Keep legacy ?tab=blog/brides/etc. URLs working but rewrite them to the
  // canonical form so the URL bar reflects the new structure.
  useEffect(() => {
    const subNeedsRewrite = rawSub != null && LEGACY_SUB_MAP[rawSub] != null;
    if ((rawTab && LEGACY_TAB_MAP[rawTab]) || subNeedsRewrite) {
      const params = new URLSearchParams(searchParams?.toString() ?? "");
      if (rawTab && LEGACY_TAB_MAP[rawTab]) {
        const m = LEGACY_TAB_MAP[rawTab];
        params.set("tab", m.tab);
        if (!rawSub && m.sub) params.set("sub", m.sub);
      }
      if (subNeedsRewrite) {
        params.set("sub", LEGACY_SUB_MAP[rawSub!]!);
      }
      router.replace(`/community?${params.toString()}`, { scroll: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawTab, rawSub]);

  const setTab = (id: TabId) => {
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    params.set("tab", id);
    // Clicking a top-level tab resets sub-nav and any deeper state so the
    // user lands on the section's default view, not whatever sub the previous
    // tab had set.
    params.delete("sub");
    params.delete("view");
    params.delete("thread");
    params.delete("discussion");
    router.replace(`/community?${params.toString()}`, { scroll: false });
  };

  const setSub = (id: string) => {
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    params.set("tab", activeTab);
    params.set("sub", id);
    // When switching sub-tabs inside Connect, clear Brides-specific deep state
    // so Brides opens fresh on Discover.
    if (activeTab === "connect") {
      params.delete("view");
      params.delete("thread");
      params.delete("discussion");
    }
    router.replace(`/community?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Activates Supabase Realtime for all community tables while the user is
          on any community page. No-ops when the user is not signed in. */}
      <RealtimeProvider />
      <TopNav />
      <LiveEventsBanner variant="global" />
      <CommunityHeader activeTab={activeTab} setTab={setTab} />
      {subs && (
        <CommunitySubNav
          items={subs}
          active={activeSub!}
          onChange={setSub}
        />
      )}
      <main>
        {activeTab === "editorial" && activeSub === "blog" && <BlogTab />}
        {activeTab === "editorial" && activeSub === "guides" && <GuidesTab />}
        {activeTab === "editorial" && activeSub === "magazine" && <MagazineTab />}
        {activeTab === "real-weddings" && <ShowcasesTab />}
        {activeTab === "connect" && activeSub === "find-a-creator" && <CreatorsTab />}
        {activeTab === "connect" && activeSub === "brides" && <BridesTab />}
        {activeTab === "connect" && activeSub === "rishta-circle" && <RishtaCircleTab />}
        {activeTab === "the-confessional" && <ConfessionalTab />}
        {activeTab === "the-grapevine" && <GrapevineTab />}
      </main>
    </div>
  );
}

// ── Header ──────────────────────────────────────────────────────────────────

function CommunityHeader({
  activeTab,
  setTab,
}: {
  activeTab: TabId;
  setTab: (id: TabId) => void;
}) {
  return (
    <header className="border-b border-gold/15 bg-white px-10 pb-0 pt-8">
      <div className="mx-auto max-w-6xl">
        <p
          className="text-[10.5px] font-medium uppercase tracking-[0.18em] text-gold"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          Community
        </p>
        <h1 className="mt-2 font-serif text-[46px] font-bold leading-[1.05] tracking-[-0.005em] text-ink">
          the planning circle.
        </h1>
        <p className="mt-1.5 max-w-[560px] font-serif text-[17px] italic text-ink-muted">
          stories from the studio — and the brides figuring it out alongside you.
        </p>

        <nav
          className="-mb-px mt-7 flex items-center gap-0"
          aria-label="Community sections"
        >
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = t.id === activeTab;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex items-center gap-1.5 whitespace-nowrap px-5 pb-3 pt-2 text-[12.5px] font-medium transition-colors",
                  active ? "text-ink" : "text-ink-muted hover:text-ink",
                )}
              >
                <Icon size={13} strokeWidth={1.8} />
                {t.label}
                {active && (
                  <span className="absolute inset-x-3 bottom-0 h-[2px] rounded-full bg-ink" />
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

// ── Sub-nav ─────────────────────────────────────────────────────────────────
// Shared pill row. Matches the Brides sub-nav styling so both layers feel
// like one system.

function CommunitySubNav({
  items,
  active,
  onChange,
}: {
  items: SubItem[];
  active: string;
  onChange: (id: string) => void;
}) {
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
              {Icon ? <Icon size={13} strokeWidth={1.8} /> : null}
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
