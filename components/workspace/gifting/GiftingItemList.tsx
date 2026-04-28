"use client";

// ── Gifting sub-tab item list ──────────────────────────────────────────────
// Used by welcome_bags, trousseau_packaging, and return_favors. Upgrades the
// legacy CategoryItemList (one-line text input) to item cards with quantity,
// unit cost, vendor, and status — plus a running cost total in the header.
// Items loved from the Vision & Mood idea browser auto-populate here, so
// each tab opens with draft content instead of a blank slate.

import { useMemo, useState, type ReactNode } from "react";
import { Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWorkspaceStore } from "@/stores/workspace-store";
import type {
  WorkspaceCategory,
  WorkspaceItem,
  WorkspaceTab,
} from "@/types/workspace";
import { PanelCard, Eyebrow, Tag } from "@/components/workspace/blocks/primitives";
import { getIdeaById, type GiftReaction } from "@/lib/gifting-seed";

const MONO = "var(--font-mono)";

type ItemStatus = "planned" | "ordered" | "received";

interface GiftItemMeta {
  ideaId?: string;
  reaction?: GiftReaction;
  qty?: number;
  unitCost?: number;
  vendor?: string;
  status?: ItemStatus;
  notes?: string;
}

const STATUS_LABEL: Record<ItemStatus, string> = {
  planned: "Planned",
  ordered: "Ordered",
  received: "Received",
};

const STATUS_TONE: Record<ItemStatus, "stone" | "saffron" | "sage"> = {
  planned: "stone",
  ordered: "saffron",
  received: "sage",
};

function fmtUSD(n: number): string {
  if (!Number.isFinite(n) || n === 0) return "$0";
  return `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

export function GiftingItemList({
  category,
  tab,
  title,
  description,
  placeholder,
  icon,
  emptyMessage = "No items yet — ideas you love from Vision & Mood show up here.",
}: {
  category: WorkspaceCategory;
  tab: Extract<
    WorkspaceTab,
    "welcome_bags" | "trousseau_packaging" | "return_favors"
  >;
  title: string;
  description: string;
  placeholder: string;
  icon?: ReactNode;
  emptyMessage?: string;
}) {
  const allItems = useWorkspaceStore((s) => s.items);
  const addItem = useWorkspaceStore((s) => s.addItem);
  const updateItem = useWorkspaceStore((s) => s.updateItem);
  const deleteItem = useWorkspaceStore((s) => s.deleteItem);
  const currentRole = useWorkspaceStore((s) => s.currentRole);
  const canEdit = currentRole !== "vendor";

  // Surface everything in this tab except items the couple actively
  // dismissed from the idea browser (reaction === "not_this").
  const items = useMemo(
    () =>
      allItems
        .filter((i) => i.category_id === category.id && i.tab === tab)
        .filter((i) => (i.meta as GiftItemMeta).reaction !== "not_this")
        .sort((a, b) => a.sort_order - b.sort_order),
    [allItems, category.id, tab],
  );

  const totals = useMemo(() => {
    let lineTotal = 0;
    let received = 0;
    for (const it of items) {
      const m = it.meta as GiftItemMeta;
      const line = (m.qty ?? 0) * (m.unitCost ?? 0);
      lineTotal += line;
      if (m.status === "received") received += line;
    }
    return { lineTotal, received };
  }, [items]);

  const patch = (id: string, p: Partial<GiftItemMeta>) => {
    const it = items.find((x) => x.id === id);
    if (!it) return;
    updateItem(id, { meta: { ...(it.meta ?? {}), ...p } });
  };

  const [draft, setDraft] = useState("");
  const submit = () => {
    const title = draft.trim();
    if (!title) return;
    addItem({
      category_id: category.id,
      tab,
      block_type: "note",
      title,
      meta: {
        qty: 0,
        unitCost: 0,
        status: "planned",
        vendor: "",
      } satisfies GiftItemMeta,
      sort_order: items.length + 1,
    });
    setDraft("");
  };

  return (
    <div className="space-y-4">
      <p className="max-w-3xl text-[13px] leading-relaxed text-ink-muted">
        {description}
      </p>

      <PanelCard
        icon={icon}
        title={title}
        badge={
          <div className="flex items-center gap-3">
            <span
              className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint"
              style={{ fontFamily: MONO }}
            >
              {items.length} {items.length === 1 ? "item" : "items"}
            </span>
            <span
              className="font-mono text-[11px] text-ink"
              style={{ fontFamily: MONO }}
            >
              {fmtUSD(totals.lineTotal)}
            </span>
          </div>
        }
      >
        {items.length === 0 ? (
          <p className="py-2 text-[12px] italic text-ink-faint">{emptyMessage}</p>
        ) : (
          <ul className="divide-y divide-border/60">
            {items.map((it) => (
              <ItemRow
                key={it.id}
                item={it}
                canEdit={canEdit}
                onPatch={(p) => patch(it.id, p)}
                onRename={(title) => updateItem(it.id, { title })}
                onRemove={() => deleteItem(it.id)}
              />
            ))}
          </ul>
        )}

        {canEdit && (
          <div className="mt-4 rounded-md border border-dashed border-border bg-ivory-warm/30 p-3">
            <div className="flex items-center gap-2">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") submit();
                }}
                placeholder={placeholder}
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
                Add manually
              </button>
            </div>
          </div>
        )}

        {items.length > 0 && (
          <div className="mt-3 flex items-center justify-end gap-4 border-t border-border/60 pt-3 text-[11.5px] text-ink-muted">
            <span>
              Received:{" "}
              <span
                className="font-mono text-ink"
                style={{ fontFamily: MONO }}
              >
                {fmtUSD(totals.received)}
              </span>
            </span>
            <span>
              Total:{" "}
              <span
                className="font-mono text-ink"
                style={{ fontFamily: MONO }}
              >
                {fmtUSD(totals.lineTotal)}
              </span>
            </span>
          </div>
        )}
      </PanelCard>
    </div>
  );
}

// ── Item row ──────────────────────────────────────────────────────────────

function ItemRow({
  item,
  canEdit,
  onPatch,
  onRename,
  onRemove,
}: {
  item: WorkspaceItem;
  canEdit: boolean;
  onPatch: (p: Partial<GiftItemMeta>) => void;
  onRename: (title: string) => void;
  onRemove: () => void;
}) {
  const meta = (item.meta ?? {}) as GiftItemMeta;
  const idea = meta.ideaId ? getIdeaById(meta.ideaId) : undefined;
  const qty = meta.qty ?? 0;
  const unitCost = meta.unitCost ?? 0;
  const status = meta.status ?? "planned";
  const loved = meta.reaction === "love";

  return (
    <li className="py-3">
      <div className="grid grid-cols-12 gap-2">
        <div className="col-span-12 md:col-span-4">
          <div className="flex items-start gap-2">
            {idea && (
              <span
                className="mt-0.5 text-[18px] leading-none"
                aria-hidden
              >
                {idea.emoji}
              </span>
            )}
            <div className="min-w-0 flex-1">
              <input
                value={item.title}
                onChange={(e) => onRename(e.target.value)}
                disabled={!canEdit}
                className="w-full border-none bg-transparent text-[13px] font-medium text-ink placeholder:text-ink-faint focus:outline-none disabled:opacity-60"
                placeholder="Item name"
              />
              <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                {loved && <Tag tone="rose">Loved</Tag>}
                {idea && (
                  <Eyebrow>~${idea.estUnitCost} typical</Eyebrow>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="col-span-4 md:col-span-1">
          <Eyebrow className="mb-1">Qty</Eyebrow>
          <input
            type="number"
            min={0}
            value={qty || ""}
            onChange={(e) =>
              onPatch({ qty: Math.max(0, Number(e.target.value) || 0) })
            }
            disabled={!canEdit}
            placeholder="0"
            className="w-full rounded-sm border border-border bg-white px-1.5 py-1 font-mono text-[12px] text-ink focus:border-saffron focus:outline-none disabled:opacity-60"
            style={{ fontFamily: MONO }}
          />
        </div>
        <div className="col-span-4 md:col-span-2">
          <Eyebrow className="mb-1">Cost / unit</Eyebrow>
          <div className="flex items-center rounded-sm border border-border bg-white pl-2 focus-within:border-saffron">
            <span className="text-[11px] text-ink-faint">$</span>
            <input
              type="number"
              min={0}
              value={unitCost || ""}
              onChange={(e) =>
                onPatch({ unitCost: Math.max(0, Number(e.target.value) || 0) })
              }
              disabled={!canEdit}
              placeholder="0"
              className="w-full border-0 bg-transparent px-1 py-1 font-mono text-[12px] text-ink focus:outline-none disabled:opacity-60"
              style={{ fontFamily: MONO }}
            />
          </div>
        </div>
        <div className="col-span-4 md:col-span-2">
          <Eyebrow className="mb-1">Line total</Eyebrow>
          <div
            className="px-1 py-1 font-mono text-[12px] text-ink"
            style={{ fontFamily: MONO }}
          >
            {fmtUSD(qty * unitCost)}
          </div>
        </div>
        <div className="col-span-6 md:col-span-2">
          <Eyebrow className="mb-1">Vendor</Eyebrow>
          <input
            value={meta.vendor ?? ""}
            onChange={(e) => onPatch({ vendor: e.target.value })}
            disabled={!canEdit}
            placeholder="Source"
            className="w-full rounded-sm border border-border bg-white px-1.5 py-1 text-[11.5px] text-ink focus:border-saffron focus:outline-none disabled:opacity-60"
          />
        </div>
        <div className="col-span-6 md:col-span-1">
          <Eyebrow className="mb-1">Status</Eyebrow>
          <div className="flex items-center gap-1">
            <select
              value={status}
              onChange={(e) =>
                onPatch({ status: e.target.value as ItemStatus })
              }
              disabled={!canEdit}
              className="w-full rounded-sm border border-border bg-white px-1 py-1 text-[11.5px] text-ink focus:border-saffron focus:outline-none disabled:opacity-60"
            >
              {(["planned", "ordered", "received"] as ItemStatus[]).map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABEL[s]}
                </option>
              ))}
            </select>
            {canEdit && (
              <button
                type="button"
                onClick={onRemove}
                className="shrink-0 text-ink-faint hover:text-rose"
                aria-label="Remove"
              >
                <Trash2 size={12} strokeWidth={1.8} />
              </button>
            )}
          </div>
        </div>
      </div>
      {status !== "planned" && (
        <div className="mt-1 flex justify-end">
          <Tag tone={STATUS_TONE[status]}>{STATUS_LABEL[status]}</Tag>
        </div>
      )}
    </li>
  );
}
