"use client";

import { useState } from "react";
import {
  Calendar,
  CheckCircle2,
  CircleDot,
  Plus,
  Trash2,
  UserSquare2,
  Heart,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  WorkspaceDecision,
  WorkspaceItem,
} from "@/types/workspace";
import { PanelCard, Tag, EmptyRow, Eyebrow } from "./primitives";
import { useVendorsStore } from "@/stores/vendors-store";
import type { VendorCategory } from "@/types/vendor";
import { formatPriceShort } from "@/lib/vendors/price-display";

// ── Schedule block (Timeline tab) ──────────────────────────────────────────
export function ScheduleBlock({ items }: { items: WorkspaceItem[] }) {
  return (
    <PanelCard
      icon={<Calendar size={14} strokeWidth={1.8} />}
      title="Day-of schedule"
      className="lg:col-span-2"
    >
      {items.length === 0 ? (
        <EmptyRow>No schedule slots yet.</EmptyRow>
      ) : (
        <ol className="relative space-y-3 border-l border-border/70 pl-5">
          {items.map((i) => (
            <li key={i.id} className="relative">
              <span className="absolute -left-[26px] top-1 flex h-3 w-3 items-center justify-center rounded-full border-2 border-saffron bg-white" />
              <div className="flex items-baseline justify-between gap-3">
                <h5 className="text-[13.5px] font-medium text-ink">
                  {i.title}
                </h5>
                <span className="font-mono text-[11px] text-ink-muted">
                  {i.meta?.time ? String(i.meta.time) : ""}
                  {i.meta?.duration ? ` · ${String(i.meta.duration)}` : ""}
                </span>
              </div>
              {i.meta?.event ? (
                <Eyebrow className="mt-0.5">{String(i.meta.event)}</Eyebrow>
              ) : null}
            </li>
          ))}
        </ol>
      )}
    </PanelCard>
  );
}

// ── Decisions block (Decisions tab) ────────────────────────────────────────
export function DecisionsBlock({
  decisions,
  onResolve,
  onReopen,
  onAdd,
  onDelete,
}: {
  decisions: WorkspaceDecision[];
  onResolve: (id: string) => void;
  onReopen: (id: string) => void;
  onAdd: (question: string) => void;
  onDelete: (id: string) => void;
}) {
  const [draft, setDraft] = useState("");
  const submit = () => {
    const q = draft.trim();
    if (!q) return;
    onAdd(q);
    setDraft("");
  };

  return (
    <PanelCard
      icon={<CircleDot size={14} strokeWidth={1.8} />}
      title="Open decisions"
      badge={
        <Tag tone="saffron">
          {decisions.filter((d) => d.status === "open").length} open
        </Tag>
      }
      className="lg:col-span-2"
    >
      {decisions.length === 0 ? (
        <EmptyRow>No decisions logged.</EmptyRow>
      ) : (
        <ul className="divide-y divide-border/60">
          {decisions.map((d) => (
            <li
              key={d.id}
              className="group flex items-start gap-3 py-2.5"
            >
              <button
                type="button"
                onClick={() =>
                  d.status === "open" ? onResolve(d.id) : onReopen(d.id)
                }
                className={cn(
                  "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors",
                  d.status === "resolved"
                    ? "border-sage bg-sage text-white"
                    : "border-ink-faint bg-white hover:border-saffron",
                )}
                aria-label={
                  d.status === "open" ? "Resolve decision" : "Reopen decision"
                }
              >
                {d.status === "resolved" && (
                  <CheckCircle2 size={12} strokeWidth={2} fill="currentColor" />
                )}
              </button>
              <div className="flex-1">
                <p
                  className={cn(
                    "text-[13px]",
                    d.status === "resolved"
                      ? "text-ink-faint line-through"
                      : "text-ink",
                  )}
                >
                  {d.question}
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <Eyebrow>
                    {d.status === "resolved"
                      ? `Resolved ${d.resolved_at ? new Date(d.resolved_at).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : ""}`
                      : "Open"}
                  </Eyebrow>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onDelete(d.id)}
                className="opacity-0 transition-opacity hover:text-rose group-hover:opacity-100"
                aria-label="Delete decision"
              >
                <Trash2 size={12} strokeWidth={1.8} />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 rounded-md border border-dashed border-border bg-ivory-warm/30 p-3">
        <div className="flex items-center gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submit();
            }}
            placeholder="Add a pending decision…"
            className="flex-1 rounded-sm border border-border bg-white px-2.5 py-1.5 text-[12.5px] text-ink placeholder:text-ink-faint focus:border-saffron focus:outline-none"
          />
          <button
            type="button"
            onClick={submit}
            disabled={!draft.trim()}
            className={cn(
              "inline-flex items-center gap-1 rounded-sm px-3 py-1.5 text-[11.5px] font-medium transition-colors",
              draft.trim()
                ? "bg-ink text-ivory"
                : "bg-ivory-warm text-ink-faint",
            )}
          >
            <Plus size={12} strokeWidth={2} />
            Add
          </button>
        </div>
      </div>
    </PanelCard>
  );
}

// ── Shortlist grid block (Shortlist tab) ───────────────────────────────────
// Reuses the shortlist entries from /vendors — filters by matching category.
const CATEGORY_VENDOR_MAP: Record<string, VendorCategory | null> = {
  photography: "photography",
  videography: null,
  catering: "catering",
  decor_florals: "decor_florals",
  entertainment: "entertainment",
  hmua: "hmua",
  venue: null,
  mehndi: null,
  transportation: null,
  stationery: "stationery",
  pandit_ceremony: "pandit_ceremony",
  wardrobe: "wardrobe",
};

export function ShortlistGridBlock({ categorySlug }: { categorySlug: string }) {
  const vendorCategory = CATEGORY_VENDOR_MAP[categorySlug];
  const shortlist = useVendorsStore((s) => s.shortlist);
  const vendors = useVendorsStore((s) => s.vendors);

  const candidates = shortlist
    .map((e) => vendors.find((v) => v.id === e.vendor_id))
    .filter(
      (v): v is NonNullable<typeof v> =>
        !!v && (vendorCategory === null || v.category === vendorCategory),
    );

  return (
    <PanelCard
      icon={<Heart size={14} strokeWidth={1.8} />}
      title="Shortlisted vendors"
      badge={<Tag tone="saffron">{candidates.length} saved</Tag>}
      className="lg:col-span-2"
    >
      {candidates.length === 0 ? (
        <div className="space-y-2">
          <EmptyRow>
            No shortlisted vendors for this category yet.
          </EmptyRow>
          <div className="inline-flex items-center gap-1.5 rounded-md border border-dashed border-border bg-ivory-warm/40 px-3 py-1.5 text-[11.5px] text-ink-muted">
            <Info size={11} strokeWidth={1.8} />
            Heart a vendor on the Vendors page to add them here.
          </div>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {candidates.map((v) => (
            <li
              key={v.id}
              className="group rounded-md border border-border bg-white p-3 transition-shadow hover:shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="truncate text-[13.5px] font-medium text-ink">
                    {v.name}
                  </p>
                  {v.location && (
                    <p className="mt-0.5 text-[11.5px] text-ink-muted">
                      {v.location}
                    </p>
                  )}
                </div>
                {v.rating !== null && (
                  <span className="font-mono text-[11.5px] text-saffron">
                    ★ {v.rating.toFixed(1)}
                  </span>
                )}
              </div>
              <p className="mt-2 font-mono text-[10.5px] text-ink-muted">
                {formatPriceShort(v.price_display)}
              </p>
              {v.style_tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {v.style_tags.slice(0, 3).map((t) => (
                    <Tag key={t}>{t}</Tag>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </PanelCard>
  );
}

// ── Generic item list (used by stub categories in Plan tab) ───────────────
export function GenericItemListBlock({
  items,
  title,
  icon,
  emptyMessage = "Nothing here yet.",
  className,
}: {
  items: WorkspaceItem[];
  title: string;
  icon: React.ReactNode;
  emptyMessage?: string;
  className?: string;
}) {
  return (
    <PanelCard icon={icon} title={title} className={className}>
      {items.length === 0 ? (
        <EmptyRow>{emptyMessage}</EmptyRow>
      ) : (
        <ul className="divide-y divide-border/60">
          {items.map((i) => (
            <li key={i.id} className="flex items-start gap-3 py-2.5">
              {i.meta?.priority ? (
                <Tag
                  tone={
                    i.meta.priority === "must"
                      ? "amber"
                      : i.meta.priority === "preferred"
                        ? "stone"
                        : "ink"
                  }
                >
                  {String(i.meta.priority)}
                </Tag>
              ) : null}
              <div className="flex-1">
                <p className="text-[13px] text-ink">{i.title}</p>
                <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-ink-faint">
                  {i.meta?.event ? (
                    <Eyebrow>{String(i.meta.event)}</Eyebrow>
                  ) : null}
                  {i.meta?.time ? (
                    <span className="font-mono text-[10.5px] text-ink-muted">
                      {String(i.meta.time)}
                    </span>
                  ) : null}
                  {i.meta?.person ? (
                    <span className="flex items-center gap-1 text-[11px] text-ink-muted">
                      <UserSquare2 size={10} strokeWidth={1.8} />
                      {String(i.meta.person)}
                    </span>
                  ) : null}
                  {typeof i.meta?.count === "number" ? (
                    <span className="font-mono text-[10.5px] text-saffron">
                      ×{String(i.meta.count)}
                    </span>
                  ) : null}
                  {i.meta?.due_date ? (
                    <span className="font-mono text-[10.5px] text-ink-muted">
                      due {String(i.meta.due_date)}
                    </span>
                  ) : null}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </PanelCard>
  );
}
