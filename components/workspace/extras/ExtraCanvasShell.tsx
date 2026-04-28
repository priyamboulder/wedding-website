"use client";

// ── Shell for non-vendor workspace pages ────────────────────────────────────
// Mirrors the shape of WorkspaceCanvas but without the vendor-specific plumbing
// (assigned vendor sub-header, role switcher, persistent task strip). Used by
// the Celebrations, Honeymoon, and Keepsakes pages.

import { useState, type ElementType, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ExtraTabDef<TabId extends string> {
  id: TabId;
  label: string;
  icon: LucideIcon;
}

export function ExtraCanvasShell<TabId extends string>({
  eyebrow,
  icon: Icon,
  title,
  subtitle,
  statusDotClass,
  actions,
  tabs,
  initialTab,
  renderTab,
}: {
  eyebrow: string;
  icon: ElementType;
  title: string;
  subtitle?: string;
  // Optional small status dot next to the eyebrow. Defaults to sage to match
  // the vendor-canvas convention of "quietly on track".
  statusDotClass?: string;
  actions?: ReactNode;
  tabs: ExtraTabDef<TabId>[];
  initialTab?: TabId;
  renderTab: (tab: TabId, setTab: (t: TabId) => void) => ReactNode;
}) {
  const [activeTab, setActiveTab] = useState<TabId>(initialTab ?? tabs[0]!.id);
  const dotClass = statusDotClass ?? "bg-sage";

  return (
    <main className="workspace-editorial flex flex-1 flex-col overflow-hidden">
      <header className="border-b border-gold/15 bg-white px-10 pb-4 pt-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span
                className={cn("h-2 w-2 rounded-full", dotClass)}
                aria-hidden
              />
              <p
                className="font-mono text-[10px] uppercase tracking-[0.16em] text-saffron"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {eyebrow}
              </p>
            </div>
            <h1 className="mt-1.5 flex items-center gap-2.5 font-serif text-[30px] leading-[1.1] text-ink">
              <Icon size={26} strokeWidth={1.5} className="text-ink-muted" />
              {title}
            </h1>
            {subtitle && (
              <p className="mt-1.5 text-[13px] text-ink-muted">{subtitle}</p>
            )}
          </div>

          {actions && (
            <div className="flex flex-wrap items-center gap-2">{actions}</div>
          )}
        </div>

        <nav
          className="-mb-px mt-7 flex items-center gap-0 overflow-x-auto"
          aria-label={`${title} sections`}
        >
          {tabs.map((t) => {
            const TabIcon = t.icon;
            const active = t.id === activeTab;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex items-center gap-1.5 whitespace-nowrap px-5 pb-3 pt-2 text-[12.5px] font-medium transition-colors",
                  active ? "text-ink" : "text-ink-muted hover:text-ink",
                )}
              >
                <TabIcon size={13} strokeWidth={1.8} />
                {t.label}
                {active && (
                  <span className="absolute inset-x-3 bottom-0 h-[2px] rounded-full bg-ink" />
                )}
              </button>
            );
          })}
        </nav>
      </header>

      <div className="flex-1 overflow-y-auto bg-white px-10 py-8">
        <div className="mx-auto max-w-6xl">
          {renderTab(activeTab, setActiveTab)}
        </div>
      </div>
    </main>
  );
}

// ── Action buttons reused across extras ─────────────────────────────────────

export function ExtraActionButton({
  icon,
  label,
  primary = false,
  onClick,
}: {
  icon?: ReactNode;
  label: string;
  primary?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px] font-medium transition-colors",
        primary
          ? "bg-ink text-ivory hover:bg-ink-soft"
          : "border border-border bg-white text-ink-muted hover:border-saffron/40 hover:text-saffron",
      )}
    >
      {icon}
      {label}
    </button>
  );
}
