'use client';

import { useState, type ReactNode } from 'react';
import styles from './DeepDiveTabs.module.css';

export type DeepDiveTabId = 'overview' | 'venues' | 'categories' | 'experiences';

type Tab = {
  id: DeepDiveTabId;
  label: string;
  scrawl?: string;
  content: ReactNode;
};

type DeepDiveTabsProps = {
  tabs: Tab[];
  defaultTabId?: DeepDiveTabId;
};

export function DeepDiveTabs({ tabs, defaultTabId = 'overview' }: DeepDiveTabsProps) {
  const [active, setActive] = useState<DeepDiveTabId>(defaultTabId);
  const activeTab = tabs.find((t) => t.id === active) ?? tabs[0];

  return (
    <div className={styles.wrapper}>
      <div role="tablist" aria-label="Destination sections" className={styles.tablist}>
        {tabs.map((tab) => {
          const isActive = tab.id === active;
          return (
            <button
              key={tab.id}
              role="tab"
              type="button"
              id={`tab-${tab.id}`}
              aria-selected={isActive}
              aria-controls={`tabpanel-${tab.id}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => setActive(tab.id)}
              className={[styles.tab, isActive ? styles.tabActive : '']
                .filter(Boolean)
                .join(' ')}
            >
              {tab.scrawl && <span className={styles.tabScrawl}>{tab.scrawl}</span>}
              <span className={styles.tabLabel}>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {tabs.map((tab) => {
        const isActive = tab.id === active;
        return (
          <div
            key={tab.id}
            role="tabpanel"
            id={`tabpanel-${tab.id}`}
            aria-labelledby={`tab-${tab.id}`}
            hidden={!isActive}
            className={styles.panel}
          >
            {/* Render every panel once on mount so dependent state in child
                components (filter selections, modal open state) is not reset
                each tab switch. Visibility is controlled by `hidden`. */}
            {tab.content}
          </div>
        );
      })}
    </div>
  );
}
