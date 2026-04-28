"use client";

// ── Vendors top-level tab bar ───────────────────────────────────────────────
// Sits below the TopNav across both /vendors?tab=my-vendors and
// /vendors?tab=coordination. Mirrors the Community tab pattern: router-backed
// tabs, underline-active styling, optional badge counts.

import { useRouter, useSearchParams } from "next/navigation";
import { ClipboardList, Heart, Users } from "lucide-react";
import type { ElementType } from "react";
import { cn } from "@/lib/utils";

export type VendorsTab =
  | "my-vendors"
  | "coordination"
  | "favorites"
  | "roulette";

export function resolveVendorsTab(value: string | null | undefined): VendorsTab {
  if (value === "coordination") return "coordination";
  if (value === "favorites") return "favorites";
  if (value === "roulette") return "roulette";
  return "my-vendors";
}

// Roulette is intentionally NOT in TABS — its entry point is the RouletteBanner
// on the My Vendors view. The "roulette" tab id still exists so URL routing and
// the RouletteView shell continue to work.
interface TabDef {
  id: VendorsTab;
  label: string;
  icon: ElementType;
}

const TABS: TabDef[] = [
  { id: "my-vendors", label: "My Vendors", icon: Users },
  { id: "coordination", label: "Coordination", icon: ClipboardList },
  { id: "favorites", label: "Favorites", icon: Heart },
];

export function VendorsTabBar({
  activeTab,
  coordinationBadge,
  favoritesBadge,
}: {
  activeTab: VendorsTab;
  coordinationBadge?: string | null;
  favoritesBadge?: string | null;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const setTab = (id: VendorsTab) => {
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    if (id === "my-vendors") params.delete("tab");
    else params.set("tab", id);
    const qs = params.toString();
    router.replace(qs ? `/vendors?${qs}` : "/vendors", { scroll: false });
  };

  return (
    <div className="border-b border-gold/15 bg-white px-8">
      <nav
        className="-mb-px mx-auto flex max-w-6xl items-center gap-0 overflow-x-auto"
        aria-label="Vendors sections"
      >
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = t.id === activeTab;
          const badge =
            t.id === "coordination"
              ? coordinationBadge
              : t.id === "favorites"
                ? favoritesBadge
                : null;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative flex items-center gap-1.5 whitespace-nowrap px-5 pb-3 pt-2.5 text-[12.5px] font-medium transition-colors",
                active ? "text-ink" : "text-ink-muted hover:text-ink",
              )}
            >
              <Icon size={13} strokeWidth={1.8} />
              {t.label}
              {badge ? (
                <span className="ml-1 rounded-full bg-rose-pale px-1.5 py-[1px] text-[10px] font-medium text-rose">
                  {badge}
                </span>
              ) : null}
              {active && (
                <span className="absolute inset-x-3 bottom-0 h-[2px] rounded-full bg-ink" />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
