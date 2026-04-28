"use client";

// ── Thank-You Tracker ─────────────────────────────────────────────────────
// Indian families track gifting across generations. This tab is the
// accountability surface: who gave what, thank-you status, and an optional
// reciprocity log for "we gave them X at their wedding in 2023."
//
// Each row is a WorkspaceItem on tab "thank_you". Meta shape:
//   giver:     string
//   giftKind:  "cash" | "physical" | "both"
//   amount:    number (INR, optional)
//   item:      string (if physical)
//   event:     "engagement" | "shower" | "wedding" | "reception" | ""
//   date:      yyyy-mm-dd
//   sent:      boolean
//   sentAt:    yyyy-mm-dd
//   reciprocity: string   // optional long-form

import { useMemo, useState } from "react";
import {
  CheckCircle2,
  Circle,
  HandHeart,
  IndianRupee,
  Plus,
  Trash2,
  UserCircle,
} from "lucide-react";
import { useWorkspaceStore } from "@/stores/workspace-store";
import type { WorkspaceCategory, WorkspaceItem } from "@/types/workspace";
import { PanelCard, Eyebrow, MiniStat, Tag } from "@/components/workspace/blocks/primitives";
import { cn } from "@/lib/utils";

type GiftKind = "cash" | "physical" | "both";
type GiftEvent = "engagement" | "shower" | "wedding" | "reception" | "";

interface GiftMeta {
  giver?: string;
  giftKind?: GiftKind;
  amount?: number;
  item?: string;
  event?: GiftEvent;
  date?: string;
  sent?: boolean;
  sentAt?: string;
  reciprocity?: string;
}

const EVENT_LABEL: Record<Exclude<GiftEvent, "">, string> = {
  engagement: "Engagement",
  shower: "Shower",
  wedding: "Wedding",
  reception: "Reception",
};

const KIND_TONE: Record<GiftKind, "saffron" | "sage" | "ink"> = {
  cash: "saffron",
  physical: "sage",
  both: "ink",
};

function fmtINR(n?: number) {
  if (!n || Number.isNaN(n)) return "—";
  return `₹${n.toLocaleString("en-IN")}`;
}

export function ThankYouTracker({
  category,
}: {
  category: WorkspaceCategory;
}) {
  const items = useWorkspaceStore((s) => s.items);
  const addItem = useWorkspaceStore((s) => s.addItem);
  const updateItem = useWorkspaceStore((s) => s.updateItem);
  const deleteItem = useWorkspaceStore((s) => s.deleteItem);
  const currentRole = useWorkspaceStore((s) => s.currentRole);
  const canEdit = currentRole !== "vendor";

  const [filter, setFilter] = useState<"all" | "pending" | "sent">("pending");

  const allGifts = useMemo(
    () =>
      items.filter(
        (i) => i.category_id === category.id && i.tab === "thank_you",
      ),
    [items, category.id],
  );

  const stats = useMemo(() => {
    const total = allGifts.length;
    const sent = allGifts.filter((g) => (g.meta as GiftMeta).sent).length;
    const cashTotal = allGifts.reduce((acc, g) => {
      const m = g.meta as GiftMeta;
      return acc + (m.giftKind !== "physical" ? m.amount ?? 0 : 0);
    }, 0);
    return { total, sent, pending: total - sent, cashTotal };
  }, [allGifts]);

  const visible = useMemo(() => {
    if (filter === "all") return allGifts;
    if (filter === "sent")
      return allGifts.filter((g) => (g.meta as GiftMeta).sent);
    return allGifts.filter((g) => !(g.meta as GiftMeta).sent);
  }, [allGifts, filter]);

  const patch = (id: string, p: Partial<GiftMeta>) => {
    const it = items.find((x) => x.id === id);
    if (!it) return;
    updateItem(id, { meta: { ...(it.meta ?? {}), ...p } });
  };

  const add = () => {
    if (!canEdit) return;
    addItem({
      category_id: category.id,
      tab: "thank_you",
      block_type: "note",
      title: "New gift",
      meta: { giftKind: "cash", sent: false } satisfies GiftMeta,
      sort_order: items.length + 1,
    });
  };

  const markSent = (id: string, meta: GiftMeta) => {
    patch(id, {
      sent: !meta.sent,
      sentAt: !meta.sent ? new Date().toISOString().slice(0, 10) : "",
    });
  };

  return (
    <div className="space-y-5">
      <p className="max-w-3xl text-[13px] leading-relaxed text-ink-muted">
        Log every gift as it arrives — cash (shagun), physical, or both.
        Mark thank-you notes as sent. Keep the optional reciprocity note
        private for future family events.
      </p>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <MiniStat label="Gifts logged" value={stats.total} />
        <MiniStat
          label="Thank-yous sent"
          value={`${stats.sent}/${stats.total}`}
          tone={stats.total > 0 && stats.sent === stats.total ? "sage" : "saffron"}
        />
        <MiniStat label="Pending" value={stats.pending} tone="rose" />
        <MiniStat
          label="Cash received"
          value={fmtINR(stats.cashTotal)}
          tone="saffron"
        />
      </div>

      <PanelCard
        icon={<HandHeart size={14} strokeWidth={1.8} />}
        title="Gifts & thank-yous"
        badge={
          <div className="flex items-center gap-1">
            <FilterChip
              label="Pending"
              active={filter === "pending"}
              onClick={() => setFilter("pending")}
            />
            <FilterChip
              label="Sent"
              active={filter === "sent"}
              onClick={() => setFilter("sent")}
            />
            <FilterChip
              label="All"
              active={filter === "all"}
              onClick={() => setFilter("all")}
            />
            {canEdit && (
              <button
                type="button"
                onClick={add}
                className="ml-1 inline-flex items-center gap-1 rounded-sm border border-border bg-white px-2 py-1 text-[11px] text-ink hover:border-saffron hover:text-saffron"
              >
                <Plus size={12} strokeWidth={1.8} />
                Add gift
              </button>
            )}
          </div>
        }
      >
        {visible.length === 0 ? (
          <p className="py-2 text-[12px] italic text-ink-faint">
            {filter === "pending"
              ? "No pending thank-yous — nice work."
              : filter === "sent"
                ? "No thank-yous sent yet."
                : "No gifts logged yet."}
          </p>
        ) : (
          <ul className="divide-y divide-border/60">
            {visible.map((g) => {
              const meta = (g.meta ?? {}) as GiftMeta;
              const kind = meta.giftKind ?? "cash";
              return (
                <li key={g.id} className="py-3">
                  <div className="grid grid-cols-12 gap-2">
                    <button
                      type="button"
                      onClick={() => markSent(g.id, meta)}
                      disabled={!canEdit}
                      className={cn(
                        "col-span-1 mt-1 text-ink-faint transition-colors hover:text-saffron disabled:cursor-not-allowed",
                        meta.sent && "text-sage",
                      )}
                      aria-label="Toggle sent"
                    >
                      {meta.sent ? (
                        <CheckCircle2 size={16} strokeWidth={1.8} />
                      ) : (
                        <Circle size={16} strokeWidth={1.8} />
                      )}
                    </button>
                    <div className="col-span-11 md:col-span-3">
                      <div className="flex items-center rounded-sm border border-border bg-white pl-2 focus-within:border-saffron">
                        <UserCircle size={11} strokeWidth={1.8} className="text-ink-faint" />
                        <input
                          value={meta.giver ?? g.title}
                          onChange={(e) => {
                            patch(g.id, { giver: e.target.value });
                            updateItem(g.id, { title: e.target.value });
                          }}
                          placeholder="Giver name"
                          disabled={!canEdit}
                          className="w-full border-0 bg-transparent px-1.5 py-1 text-[12.5px] text-ink placeholder:text-ink-faint focus:outline-none disabled:opacity-60"
                        />
                      </div>
                    </div>
                    <div className="col-span-6 md:col-span-2">
                      <select
                        value={kind}
                        onChange={(e) =>
                          patch(g.id, { giftKind: e.target.value as GiftKind })
                        }
                        disabled={!canEdit}
                        className="w-full rounded-sm border border-border bg-white px-2 py-1 text-[12px] text-ink focus:border-saffron focus:outline-none disabled:opacity-60"
                      >
                        <option value="cash">Cash</option>
                        <option value="physical">Physical</option>
                        <option value="both">Both</option>
                      </select>
                    </div>
                    {(kind === "cash" || kind === "both") && (
                      <div className="col-span-6 md:col-span-2">
                        <div className="flex items-center rounded-sm border border-border bg-white pl-2 focus-within:border-saffron">
                          <IndianRupee size={11} strokeWidth={1.8} className="text-ink-faint" />
                          <input
                            type="number"
                            value={meta.amount ?? ""}
                            onChange={(e) =>
                              patch(g.id, { amount: Number(e.target.value) })
                            }
                            placeholder="0"
                            disabled={!canEdit}
                            className="w-full border-0 bg-transparent px-1.5 py-1 font-mono text-[12px] text-ink focus:outline-none disabled:opacity-60"
                            style={{ fontFamily: "var(--font-mono)" }}
                          />
                        </div>
                      </div>
                    )}
                    {(kind === "physical" || kind === "both") && (
                      <div
                        className={cn(
                          "col-span-12",
                          kind === "both" ? "md:col-span-3" : "md:col-span-5",
                        )}
                      >
                        <input
                          value={meta.item ?? ""}
                          onChange={(e) => patch(g.id, { item: e.target.value })}
                          placeholder="Item description"
                          disabled={!canEdit}
                          className="w-full rounded-sm border border-border bg-white px-2 py-1 text-[12px] text-ink placeholder:text-ink-faint focus:border-saffron focus:outline-none disabled:opacity-60"
                        />
                      </div>
                    )}
                    <div className="col-span-6 md:col-span-1">
                      <select
                        value={meta.event ?? ""}
                        onChange={(e) =>
                          patch(g.id, { event: e.target.value as GiftEvent })
                        }
                        disabled={!canEdit}
                        className="w-full rounded-sm border border-border bg-white px-1 py-1 text-[11.5px] text-ink focus:border-saffron focus:outline-none disabled:opacity-60"
                      >
                        <option value="">Event</option>
                        {(Object.keys(EVENT_LABEL) as (keyof typeof EVENT_LABEL)[]).map(
                          (e) => (
                            <option key={e} value={e}>
                              {EVENT_LABEL[e]}
                            </option>
                          ),
                        )}
                      </select>
                    </div>
                    <div className="col-span-5 md:col-span-1 flex items-center justify-end">
                      {canEdit && (
                        <button
                          type="button"
                          onClick={() => deleteItem(g.id)}
                          className="text-ink-faint hover:text-rose"
                          aria-label="Remove"
                        >
                          <Trash2 size={13} strokeWidth={1.8} />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="mt-2 grid grid-cols-12 gap-2">
                    <div className="col-span-12 md:col-span-4">
                      <Eyebrow className="mb-1">Thank-you note</Eyebrow>
                      <div className="flex items-center gap-2 text-[11.5px]">
                        {meta.sent ? (
                          <Tag tone="sage">Sent {meta.sentAt || ""}</Tag>
                        ) : (
                          <Tag tone="amber">Pending</Tag>
                        )}
                      </div>
                    </div>
                    <div className="col-span-12 md:col-span-8">
                      <Eyebrow className="mb-1">Reciprocity (private)</Eyebrow>
                      <input
                        value={meta.reciprocity ?? ""}
                        onChange={(e) =>
                          patch(g.id, { reciprocity: e.target.value })
                        }
                        placeholder="We gave the Sharmas ₹301 at Riya's wedding (2023)"
                        disabled={!canEdit}
                        className="w-full rounded-sm border border-dashed border-border/80 bg-ivory-warm/20 px-2 py-1 text-[12px] text-ink placeholder:text-ink-faint focus:border-saffron focus:outline-none disabled:opacity-60"
                      />
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </PanelCard>
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-sm px-2 py-1 font-mono text-[10.5px] uppercase tracking-[0.08em] transition-colors",
        active
          ? "bg-saffron-pale/70 text-saffron"
          : "border border-border bg-white text-ink-faint hover:text-ink",
      )}
      style={{ fontFamily: "var(--font-mono)" }}
    >
      {label}
    </button>
  );
}
