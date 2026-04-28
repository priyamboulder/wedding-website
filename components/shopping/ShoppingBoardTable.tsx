"use client";

import { ChevronDown, ChevronUp, ImageOff, AlertTriangle, Link2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ShoppingLink, ShoppingStatus } from "@/lib/link-preview/types";
import type { TaskMeta } from "@/lib/shopping/export-csv";
import type { SortDir, SortKey } from "@/lib/shopping/filters";

const STATUS_DOT: Record<ShoppingStatus, string> = {
  considering: "bg-ink/80",
  ordered: "bg-saffron",
  received: "bg-sage",
  returned: "bg-rose",
};

const STATUS_LABEL: Record<ShoppingStatus, string> = {
  considering: "Considering",
  ordered: "Ordered",
  received: "Received",
  returned: "Returned",
};

function formatPrice(price: number | null, currency: string): string {
  if (price == null) return "—";
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      maximumFractionDigits: price % 1 === 0 ? 0 : 2,
    }).format(price);
  } catch {
    return `${currency} ${price.toFixed(2)}`;
  }
}

interface Column {
  key: SortKey | "image" | "task" | "qty" | "select";
  label: string;
  sortable: boolean;
  align?: "left" | "right" | "center";
  width?: string;
}

const COLUMNS: Column[] = [
  { key: "select", label: "", sortable: false, width: "w-10" },
  { key: "image", label: "", sortable: false, width: "w-14" },
  { key: "title", label: "Title", sortable: true },
  { key: "module", label: "Module", sortable: true },
  { key: "task", label: "Task", sortable: false },
  { key: "price", label: "Price", sortable: true, align: "right" },
  { key: "qty", label: "Qty", sortable: false, align: "right" },
  { key: "total", label: "Total", sortable: true, align: "right" },
  { key: "status", label: "Status", sortable: true },
  { key: "source", label: "Source", sortable: true },
  { key: "added", label: "Added", sortable: true, align: "right" },
];

export function ShoppingBoardTable({
  links,
  moduleTitles,
  tasksById,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  onOpen,
  onAssignClick,
  sortBy,
  sortDir,
  onSort,
}: {
  links: ShoppingLink[];
  moduleTitles: Map<string, string>;
  tasksById: Map<string, TaskMeta>;
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  onOpen: (id: string) => void;
  onAssignClick: (linkId: string, e: React.MouseEvent) => void;
  sortBy: SortKey;
  sortDir: SortDir;
  onSort: (key: SortKey) => void;
}) {
  const allSelected =
    links.length > 0 && links.every((l) => selectedIds.has(l.id));

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-white">
      <table className="w-full text-[12px]">
        <thead className="border-b border-border bg-ivory-warm/60">
          <tr>
            {COLUMNS.map((col) => (
              <th
                key={col.key}
                className={cn(
                  "px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-ink-muted",
                  col.align === "right" && "text-right",
                  col.align === "center" && "text-center",
                  !col.align && "text-left",
                  col.width,
                )}
              >
                {col.key === "select" ? (
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={onToggleSelectAll}
                    className="h-3 w-3 accent-saffron"
                    aria-label="Select all"
                  />
                ) : col.sortable ? (
                  <button
                    onClick={() => onSort(col.key as SortKey)}
                    className="inline-flex items-center gap-1 hover:text-ink"
                  >
                    {col.label}
                    {sortBy === col.key &&
                      (sortDir === "asc" ? (
                        <ChevronUp size={10} />
                      ) : (
                        <ChevronDown size={10} />
                      ))}
                  </button>
                ) : (
                  col.label
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {links.map((l) => {
            const task = l.taskId ? tasksById.get(l.taskId) : null;
            const detached =
              l.detachedTaskId != null || (l.taskId != null && !task);
            const isUnassigned = l.taskId == null && !detached;
            const selected = selectedIds.has(l.id);
            const total = l.price != null ? l.price * l.quantity : null;
            return (
              <tr
                key={l.id}
                onClick={() => onOpen(l.id)}
                className={cn(
                  "group cursor-pointer border-b border-border/60 transition-colors",
                  selected ? "bg-gold-pale/20" : "hover:bg-ivory-warm/50",
                )}
              >
                <td className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => onToggleSelect(l.id)}
                    className="h-3 w-3 accent-saffron"
                  />
                </td>
                <td className="px-3 py-2">
                  <div className="h-8 w-10 overflow-hidden rounded bg-ivory-warm">
                    {l.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={l.imageUrl}
                        alt=""
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-ink-faint/40">
                        <ImageOff size={12} strokeWidth={1.4} />
                      </div>
                    )}
                  </div>
                </td>
                <td className="max-w-[240px] px-3 py-2">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate font-serif text-[13px] text-ink">
                      {l.title}
                    </span>
                    {detached && (
                      <span
                        className="inline-flex shrink-0 items-center gap-1 rounded-full bg-rose-pale/70 px-1.5 py-[1px] text-[9px] font-medium uppercase tracking-wider text-rose/90"
                        title="Parent task deleted"
                      >
                        <AlertTriangle size={8} strokeWidth={2} />
                        Task deleted
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-3 py-2 text-[11px] uppercase tracking-wider">
                  {l.module ? (
                    <span className="text-ink-muted">
                      {moduleTitles.get(l.module) ?? l.module}
                    </span>
                  ) : (
                    <span className="italic text-ink-faint/70">Unassigned</span>
                  )}
                </td>
                <td
                  className="max-w-[200px] truncate px-3 py-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  {task ? (
                    <span className="italic text-ink-muted">{task.title}</span>
                  ) : (
                    <button
                      onClick={(e) => onAssignClick(l.id, e)}
                      className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] text-ink-faint/70 transition-colors hover:bg-gold-pale/40 hover:text-gold"
                      aria-label="Assign to task"
                      title={isUnassigned ? "Assign to a task" : "Reassign to a task"}
                    >
                      <Link2 size={10} strokeWidth={1.8} />
                      {isUnassigned ? "Assign…" : "Reassign…"}
                    </button>
                  )}
                </td>
                <td
                  className="px-3 py-2 text-right font-mono text-[11.5px] text-ink"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {formatPrice(l.price, l.currency)}
                </td>
                <td
                  className="px-3 py-2 text-right font-mono text-[11.5px] text-ink-muted"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {l.quantity}
                </td>
                <td
                  className={cn(
                    "px-3 py-2 text-right font-mono text-[11.5px] font-semibold",
                    total != null ? "text-saffron" : "text-ink-faint",
                  )}
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {formatPrice(total, l.currency)}
                </td>
                <td className="px-3 py-2">
                  <span className="inline-flex items-center gap-1.5 text-[11px] text-ink-soft">
                    <span
                      className={cn("h-1.5 w-1.5 rounded-full", STATUS_DOT[l.status])}
                    />
                    {STATUS_LABEL[l.status]}
                  </span>
                </td>
                <td
                  className="px-3 py-2 font-mono text-[10.5px] text-ink-muted"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {l.domain}
                </td>
                <td
                  className="px-3 py-2 text-right font-mono text-[10.5px] text-ink-faint"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {new Date(l.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
