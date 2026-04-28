"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface Tab {
  id: string;
  label: string;
  icon?: ReactNode;
  content: ReactNode;
  disabled?: boolean;
}

interface PopOutTabsProps {
  tabs: Tab[];
  /** Controlled active tab */
  activeTab?: string;
  /** Tab change callback */
  onTabChange?: (tabId: string) => void;
  className?: string;
}

export function PopOutTabs({
  tabs,
  activeTab: controlledTab,
  onTabChange,
  className,
}: PopOutTabsProps) {
  const [internalTab, setInternalTab] = useState(tabs[0]?.id ?? "");
  const activeId = controlledTab ?? internalTab;

  const handleChange = (id: string) => {
    const tab = tabs.find((t) => t.id === id);
    if (tab?.disabled) return;
    if (!controlledTab) setInternalTab(id);
    onTabChange?.(id);
  };

  const currentTab = tabs.find((t) => t.id === activeId);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Tab bar */}
      <div className="flex gap-6 border-b border-border" role="tablist">
        {tabs.map((tab) => {
          const isActive = tab.id === activeId;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-disabled={tab.disabled}
              disabled={tab.disabled}
              onClick={() => handleChange(tab.id)}
              className={cn(
                "relative flex items-center gap-1.5 pb-2.5 text-sm font-serif font-medium transition-colors",
                isActive
                  ? "text-ink-soft"
                  : tab.disabled
                    ? "text-ink-faint/50 cursor-not-allowed"
                    : "text-ink-faint hover:text-ink-muted",
              )}
            >
              {tab.icon && <span className="flex-shrink-0">{tab.icon}</span>}
              {tab.label}
              {/* Gold underline for active */}
              {isActive && (
                <span className="absolute bottom-0 inset-x-0 h-[1.5px] bg-gold rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* Active tab content */}
      {currentTab && (
        <div role="tabpanel" aria-labelledby={currentTab.id}>
          {currentTab.content}
        </div>
      )}
    </div>
  );
}
