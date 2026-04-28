"use client";

import { useState } from "react";
import type { ShoppingLink } from "@/lib/link-preview/types";
import type { TaskMeta } from "@/lib/shopping/export-csv";
import { UNASSIGNED_KEY } from "@/lib/shopping/filters";
import { ShoppingBoardCard } from "./ShoppingBoardCard";
import { StyledByRow } from "@/components/creators/StyledByRow";

const INITIAL_PAGE = 120;
const PAGE_STEP = 120;

interface Group {
  key: string;
  links: ShoppingLink[];
}

export function ShoppingBoardGrid({
  groups,
  moduleTitles,
  tasksById,
  duplicateCounts,
  selectedIds,
  cartIds,
  onToggleSelect,
  onToggleCart,
  onOpen,
  onAssignClick,
  onVariantChange,
  onVendorClick,
  groupLabel,
  weddingId,
  showStyledByRows = false,
}: {
  groups: Group[];
  moduleTitles: Map<string, string>;
  tasksById: Map<string, TaskMeta>;
  duplicateCounts: Map<string, number>;
  selectedIds: Set<string>;
  cartIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onToggleCart: (id: string) => void;
  onOpen: (id: string) => void;
  onAssignClick: (linkId: string, e: React.MouseEvent) => void;
  onVariantChange: (linkId: string, variantId: string | null) => void;
  onVendorClick: (vendorId: string) => void;
  groupLabel: (key: string) => string;
  weddingId?: string;
  // When true + group key is a module (phase-*), inject a Styled By row
  // above the module's product grid.
  showStyledByRows?: boolean;
}) {
  const [limit, setLimit] = useState(INITIAL_PAGE);
  const totalCount = groups.reduce((s, g) => s + g.links.length, 0);

  let seen = 0;
  const renderedGroups: Group[] = [];
  for (const g of groups) {
    if (seen >= limit) break;
    const take = Math.max(0, Math.min(g.links.length, limit - seen));
    renderedGroups.push({ key: g.key, links: g.links.slice(0, take) });
    seen += take;
  }
  const hasMore = totalCount > limit;

  return (
    <div className="flex flex-col gap-8">
      {renderedGroups.map((g) => {
        const isUnassigned = g.key === UNASSIGNED_KEY;
        const isModuleGroup = g.key.startsWith("phase-");
        return (
          <section key={g.key || "all"} className="flex flex-col gap-3">
            {g.key && (
              <div className="flex items-baseline justify-between border-b border-gold/10 pb-1.5">
                <h3
                  className={
                    isUnassigned
                      ? "font-serif text-[17px] italic text-ink-muted"
                      : "font-serif text-[17px] font-medium text-ink"
                  }
                >
                  {groupLabel(g.key)}
                </h3>
                <span
                  className="font-mono text-[10.5px] uppercase tracking-wider text-ink-faint"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {g.links.length} item{g.links.length === 1 ? "" : "s"}
                </span>
              </div>
            )}
            {showStyledByRows && isModuleGroup && weddingId && (
              <StyledByRow module={g.key} weddingId={weddingId} />
            )}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
              {g.links.map((link) => {
                const task = link.taskId ? tasksById.get(link.taskId) : null;
                const detached =
                  link.detachedTaskId != null ||
                  (link.taskId != null && !task);
                const moduleTitle = link.module
                  ? moduleTitles.get(link.module) ?? link.module
                  : null;
                return (
                  <ShoppingBoardCard
                    key={link.id}
                    link={link}
                    moduleTitle={moduleTitle}
                    taskTitle={task?.title ?? null}
                    detached={detached}
                    duplicateCount={duplicateCounts.get(link.normalizedUrl) ?? 1}
                    selected={selectedIds.has(link.id)}
                    inCart={cartIds.has(link.id)}
                    onToggleSelect={() => onToggleSelect(link.id)}
                    onToggleCart={() => onToggleCart(link.id)}
                    onOpen={() => onOpen(link.id)}
                    onAssignClick={(e) => onAssignClick(link.id, e)}
                    onVariantChange={(vid) => onVariantChange(link.id, vid)}
                    onVendorClick={(vid) => onVendorClick(vid)}
                  />
                );
              })}
            </div>
          </section>
        );
      })}

      {hasMore && (
        <div className="flex justify-center pt-2">
          <button
            onClick={() => setLimit((n) => n + PAGE_STEP)}
            className="rounded-md border border-gold/30 bg-gold-pale/20 px-5 py-2 text-[11px] uppercase tracking-wider text-gold transition-colors hover:bg-gold-pale/40"
          >
            Load more ({totalCount - limit} left)
          </button>
        </div>
      )}
    </div>
  );
}
