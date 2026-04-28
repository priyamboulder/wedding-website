"use client";

import { Heart, ImageOff, Link2, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  Vendor,
  ShortlistStatus,
  TaskVendorLink,
} from "@/types/vendor";
import {
  SHORTLIST_STATUS_LABEL,
  SHORTLIST_STATUS_DOT,
} from "@/types/vendor";
import { CATEGORY_LABELS } from "@/lib/vendor-categories";
import { formatPriceShort } from "@/lib/vendors/price-display";
import type { ChecklistItem } from "@/types/checklist";

interface Props {
  vendors: Vendor[];
  shortlistIds: Set<string>;
  statusByVendorId: Map<string, ShortlistStatus>;
  taskLinks: TaskVendorLink[];
  tasksById: Map<string, ChecklistItem>;
  onOpen: (id: string) => void;
  onToggleShortlist: (id: string) => void;
}

export function VendorTable({
  vendors,
  shortlistIds,
  statusByVendorId,
  taskLinks,
  tasksById,
  onOpen,
  onToggleShortlist,
}: Props) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-white">
      <table className="w-full text-[12px]">
        <thead className="border-b border-border bg-ivory-warm/60">
          <tr>
            <Th className="w-10"></Th>
            <Th>Vendor</Th>
            <Th>Category</Th>
            <Th>Location</Th>
            <Th align="right">Price</Th>
            <Th align="right">Rating</Th>
            <Th>Status</Th>
            <Th>Linked task</Th>
            <Th align="right">Last contacted</Th>
          </tr>
        </thead>
        <tbody>
          {vendors.map((v) => {
            const shortlisted = shortlistIds.has(v.id);
            const status = statusByVendorId.get(v.id);
            const links = taskLinks.filter((l) => l.vendor_id === v.id);
            const firstLink = links[0];
            const firstTask = firstLink
              ? tasksById.get(firstLink.task_id)
              : null;
            const lastContacted = firstLink
              ? new Date(firstLink.linked_at)
              : null;
            return (
              <tr
                key={v.id}
                onClick={() => onOpen(v.id)}
                className="group cursor-pointer border-b border-border/60 transition-colors hover:bg-ivory-warm/50"
              >
                <td className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => onToggleShortlist(v.id)}
                    aria-label={
                      shortlisted
                        ? "Remove from shortlist"
                        : "Save to shortlist"
                    }
                    aria-pressed={shortlisted}
                    className={cn(
                      "flex h-6 w-6 items-center justify-center rounded transition-colors",
                      shortlisted
                        ? "text-saffron"
                        : "text-ink-faint hover:text-ink",
                    )}
                  >
                    <Heart
                      size={13}
                      strokeWidth={1.8}
                      fill={shortlisted ? "currentColor" : "none"}
                    />
                  </button>
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-10 shrink-0 overflow-hidden rounded bg-ivory-warm">
                      {v.cover_image || (v.portfolio_images ?? [])[0] ? (
                        <img
                          src={v.cover_image || (v.portfolio_images ?? [])[0].url}
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
                    <span className="truncate text-[13px] text-ink">
                      {v.name}
                    </span>
                  </div>
                </td>
                <td className="px-3 py-2 text-[11px] uppercase tracking-wider text-ink-muted">
                  {CATEGORY_LABELS[v.category]}
                </td>
                <td className="px-3 py-2 text-ink-soft">
                  {v.location ? (
                    v.location
                  ) : (
                    <span className="italic text-ink-faint/70">—</span>
                  )}
                </td>
                <td
                  className="px-3 py-2 text-right font-mono text-[11px] text-ink-soft"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {formatPriceShort(v.price_display)}
                </td>
                <td
                  className="px-3 py-2 text-right font-mono text-[11.5px] text-ink"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {v.rating != null ? (
                    <span className="inline-flex items-center gap-1">
                      <Star
                        size={10}
                        strokeWidth={1.6}
                        className="text-saffron"
                        fill="currentColor"
                      />
                      {v.rating.toFixed(1)}
                    </span>
                  ) : (
                    <span className="text-ink-faint">—</span>
                  )}
                </td>
                <td className="px-3 py-2">
                  {status ? (
                    <span className="inline-flex items-center gap-1.5 text-[11px] text-ink-soft">
                      <span
                        className={cn(
                          "h-1.5 w-1.5 rounded-full",
                          SHORTLIST_STATUS_DOT[status],
                        )}
                      />
                      {SHORTLIST_STATUS_LABEL[status]}
                    </span>
                  ) : (
                    <span className="text-[11px] italic text-ink-faint/70">
                      Unsaved
                    </span>
                  )}
                </td>
                <td className="max-w-[200px] truncate px-3 py-2">
                  {firstTask ? (
                    <span className="inline-flex items-center gap-1 italic text-ink-muted">
                      <Link2 size={10} strokeWidth={1.8} />
                      {firstTask.title}
                      {links.length > 1 && (
                        <span className="font-mono text-[10px] text-ink-faint">
                          +{links.length - 1}
                        </span>
                      )}
                    </span>
                  ) : (
                    <span className="text-[11px] italic text-ink-faint/70">
                      Unlinked
                    </span>
                  )}
                </td>
                <td
                  className="px-3 py-2 text-right font-mono text-[10.5px] text-ink-faint"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {lastContacted
                    ? lastContacted.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })
                    : "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function Th({
  children,
  align,
  className,
}: {
  children?: React.ReactNode;
  align?: "left" | "right" | "center";
  className?: string;
}) {
  return (
    <th
      className={cn(
        "px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-ink-muted",
        align === "right" && "text-right",
        align === "center" && "text-center",
        !align && "text-left",
        className,
      )}
    >
      {children}
    </th>
  );
}
