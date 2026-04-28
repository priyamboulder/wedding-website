"use client";

// ── Generic list-driven tab body ────────────────────────────────────────────
// Any non-photography category tab that's essentially a "list of things with
// a bit of metadata" uses this. Examples:
//   • Catering "Tasting Notes" — list of tasting visits with score + notes
//   • Entertainment "Song List" — list of song requests with event + mood
//   • Transportation "Vehicles" — list of vehicles with capacity + assignment
//
// Items live in useWorkspaceStore.items (the polymorphic WorkspaceItem).
// Filtering is always scoped by category_id + tab + optional block_type so
// one tab can surface one or multiple block_types.

import { useMemo, useState, type ReactNode } from "react";
import { Check, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWorkspaceStore } from "@/stores/workspace-store";
import type {
  WorkspaceBlockType,
  WorkspaceCategory,
  WorkspaceItem,
} from "@/types/workspace";
import type { WorkspaceTab } from "@/types/workspace";
import { PanelCard, EmptyRow, Eyebrow, Tag } from "@/components/workspace/blocks/primitives";

// ── Props ───────────────────────────────────────────────────────────────────

export interface CategoryItemListProps {
  category: WorkspaceCategory;
  tab: WorkspaceTab;
  // Optional — when set, only items with matching block_type surface.
  blockType?: WorkspaceBlockType | WorkspaceBlockType[];
  // Panel header
  title: string;
  icon?: ReactNode;
  description?: string;
  // Placeholder for the inline add form.
  placeholder?: string;
  // Default block_type applied to new items added inline. Required if
  // blockType was not passed (otherwise new items wouldn't know what type
  // they are).
  defaultBlockType?: WorkspaceBlockType;
  emptyMessage?: string;
  // Optional — render per-item metadata under the title.
  renderMeta?: (item: WorkspaceItem) => ReactNode;
}

// ── Root ────────────────────────────────────────────────────────────────────

export function CategoryItemList({
  category,
  tab,
  blockType,
  title,
  icon,
  description,
  placeholder = "Add item…",
  defaultBlockType,
  emptyMessage = "Nothing here yet.",
  renderMeta,
}: CategoryItemListProps) {
  const allItems = useWorkspaceStore((s) => s.items);
  const addItem = useWorkspaceStore((s) => s.addItem);
  const deleteItem = useWorkspaceStore((s) => s.deleteItem);
  const currentRole = useWorkspaceStore((s) => s.currentRole);

  const items = useMemo(() => {
    const blockTypes = Array.isArray(blockType)
      ? blockType
      : blockType
        ? [blockType]
        : null;
    return allItems
      .filter((i) => i.category_id === category.id && i.tab === tab)
      .filter((i) => !blockTypes || blockTypes.includes(i.block_type))
      .sort((a, b) => a.sort_order - b.sort_order);
  }, [allItems, category.id, tab, blockType]);

  const addBlockType = defaultBlockType ?? (Array.isArray(blockType) ? blockType[0] : blockType);
  const canEdit = currentRole !== "vendor";

  const [draft, setDraft] = useState("");
  const submit = () => {
    const title = draft.trim();
    if (!title || !addBlockType) return;
    addItem({
      category_id: category.id,
      tab,
      block_type: addBlockType,
      title,
      meta: {},
      sort_order: items.length + 1,
    });
    setDraft("");
  };

  return (
    <div className="space-y-4">
      {description && (
        <p className="max-w-3xl text-[13px] leading-relaxed text-ink-muted">
          {description}
        </p>
      )}

      <PanelCard icon={icon} title={title}>
        {items.length === 0 ? (
          <EmptyRow>{emptyMessage}</EmptyRow>
        ) : (
          <ul className="divide-y divide-border/60">
            {items.map((i) => (
              <li
                key={i.id}
                className="group flex items-start gap-3 py-2.5"
              >
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
                  <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                    {renderMeta ? (
                      renderMeta(i)
                    ) : (
                      <DefaultMeta item={i} />
                    )}
                  </div>
                </div>
                {canEdit && (
                  <button
                    type="button"
                    onClick={() => deleteItem(i.id)}
                    className="opacity-0 transition-opacity hover:text-rose group-hover:opacity-100"
                    aria-label="Delete"
                  >
                    <Trash2 size={12} strokeWidth={1.8} />
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}

        {canEdit && addBlockType && (
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
                Add
              </button>
            </div>
          </div>
        )}
      </PanelCard>
    </div>
  );
}

// ── Default meta renderer ───────────────────────────────────────────────────

function DefaultMeta({ item }: { item: WorkspaceItem }) {
  const meta = item.meta ?? {};
  return (
    <>
      {meta.event ? <Eyebrow>{String(meta.event)}</Eyebrow> : null}
      {meta.time ? (
        <span className="font-mono text-[10.5px] text-ink-muted">
          {String(meta.time)}
        </span>
      ) : null}
      {meta.person ? (
        <span className="text-[11px] text-ink-muted">{String(meta.person)}</span>
      ) : null}
      {typeof meta.count === "number" ? (
        <span className="font-mono text-[10.5px] text-saffron">
          ×{String(meta.count)}
        </span>
      ) : null}
      {meta.notes ? (
        <span className="text-[11.5px] italic text-ink-muted">{String(meta.notes)}</span>
      ) : null}
    </>
  );
}

// ── Checkbox variant ────────────────────────────────────────────────────────
// A tweak of the same list for tabs that naturally read as checklist-style
// "is it done yet?" items — load-in plan, print schedule, permits. Uses
// item.meta.checked.

export function CategoryChecklistList({
  category,
  tab,
  blockType,
  title,
  icon,
  description,
  placeholder = "Add item…",
  defaultBlockType,
  emptyMessage = "Nothing here yet.",
}: Omit<CategoryItemListProps, "renderMeta">) {
  const allItems = useWorkspaceStore((s) => s.items);
  const addItem = useWorkspaceStore((s) => s.addItem);
  const deleteItem = useWorkspaceStore((s) => s.deleteItem);
  const updateItem = useWorkspaceStore((s) => s.updateItem);
  const currentRole = useWorkspaceStore((s) => s.currentRole);

  const items = useMemo(() => {
    const blockTypes = Array.isArray(blockType)
      ? blockType
      : blockType
        ? [blockType]
        : null;
    return allItems
      .filter((i) => i.category_id === category.id && i.tab === tab)
      .filter((i) => !blockTypes || blockTypes.includes(i.block_type))
      .sort((a, b) => a.sort_order - b.sort_order);
  }, [allItems, category.id, tab, blockType]);

  const addBlockType =
    defaultBlockType ?? (Array.isArray(blockType) ? blockType[0] : blockType);
  const canEdit = currentRole !== "vendor";

  const [draft, setDraft] = useState("");
  const submit = () => {
    const title = draft.trim();
    if (!title || !addBlockType) return;
    addItem({
      category_id: category.id,
      tab,
      block_type: addBlockType,
      title,
      meta: { checked: false },
      sort_order: items.length + 1,
    });
    setDraft("");
  };

  const toggle = (i: WorkspaceItem) => {
    updateItem(i.id, {
      meta: { ...(i.meta ?? {}), checked: !i.meta?.checked },
    });
  };

  return (
    <div className="space-y-4">
      {description && (
        <p className="max-w-3xl text-[13px] leading-relaxed text-ink-muted">
          {description}
        </p>
      )}
      <PanelCard icon={icon} title={title}>
        {items.length === 0 ? (
          <EmptyRow>{emptyMessage}</EmptyRow>
        ) : (
          <ul className="space-y-1.5">
            {items.map((i) => {
              const checked = Boolean(i.meta?.checked);
              return (
                <li
                  key={i.id}
                  className="group flex items-center gap-3 rounded-md border border-transparent px-2 py-1.5 hover:border-border hover:bg-ivory-warm/30"
                >
                  <button
                    type="button"
                    onClick={() => toggle(i)}
                    className={cn(
                      "flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border transition-colors",
                      checked
                        ? "border-sage bg-sage text-white"
                        : "border-ink-faint bg-white hover:border-saffron",
                    )}
                    aria-label={checked ? "Mark not done" : "Mark done"}
                  >
                    {checked && <Check size={11} strokeWidth={2.5} />}
                  </button>
                  <span
                    className={cn(
                      "flex-1 text-[13px]",
                      checked ? "text-ink-faint line-through" : "text-ink",
                    )}
                  >
                    {i.title}
                  </span>
                  {canEdit && (
                    <button
                      type="button"
                      onClick={() => deleteItem(i.id)}
                      className="opacity-0 transition-opacity hover:text-rose group-hover:opacity-100"
                      aria-label="Delete"
                    >
                      <Trash2 size={12} strokeWidth={1.8} />
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}

        {canEdit && addBlockType && (
          <div className="mt-3 flex items-center gap-2">
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
              Add
            </button>
          </div>
        )}
      </PanelCard>
    </div>
  );
}

// ── By-event grouped list ───────────────────────────────────────────────────
// For tabs where the natural grouping is by event day (Haldi / Mehendi /
// Sangeet / Wedding / Reception). Items are read from workspace-store and
// grouped on item.meta.event. Missing-event items fall into "Unscheduled".

const EVENT_ORDER = [
  "Haldi",
  "Mehendi",
  "Sangeet",
  "Wedding",
  "Reception",
  "Welcome",
  "Brunch",
] as const;

export function CategoryItemsByEvent({
  category,
  tab,
  blockType,
  title,
  icon,
  description,
  emptyMessage = "Nothing scheduled here yet.",
  renderMeta,
}: {
  category: WorkspaceCategory;
  tab: WorkspaceTab;
  blockType?: WorkspaceBlockType | WorkspaceBlockType[];
  title: string;
  icon?: ReactNode;
  description?: string;
  emptyMessage?: string;
  renderMeta?: (item: WorkspaceItem) => ReactNode;
}) {
  const allItems = useWorkspaceStore((s) => s.items);

  const grouped = useMemo(() => {
    const blockTypes = Array.isArray(blockType)
      ? blockType
      : blockType
        ? [blockType]
        : null;
    const scoped = allItems
      .filter((i) => i.category_id === category.id && i.tab === tab)
      .filter((i) => !blockTypes || blockTypes.includes(i.block_type));
    const byEvent = new Map<string, WorkspaceItem[]>();
    for (const i of scoped) {
      const ev = (i.meta?.event as string) || "Unscheduled";
      if (!byEvent.has(ev)) byEvent.set(ev, []);
      byEvent.get(ev)!.push(i);
    }
    const keys = Array.from(byEvent.keys()).sort((a, b) => {
      const ia = EVENT_ORDER.indexOf(a as (typeof EVENT_ORDER)[number]);
      const ib = EVENT_ORDER.indexOf(b as (typeof EVENT_ORDER)[number]);
      if (ia === -1 && ib === -1) return a.localeCompare(b);
      if (ia === -1) return 1;
      if (ib === -1) return -1;
      return ia - ib;
    });
    return keys.map((k) => ({
      event: k,
      items: byEvent.get(k)!.sort((a, b) => a.sort_order - b.sort_order),
    }));
  }, [allItems, category.id, tab, blockType]);

  return (
    <div className="space-y-4">
      {description && (
        <p className="max-w-3xl text-[13px] leading-relaxed text-ink-muted">
          {description}
        </p>
      )}
      <PanelCard icon={icon} title={title}>
        {grouped.length === 0 ? (
          <EmptyRow>{emptyMessage}</EmptyRow>
        ) : (
          <div className="space-y-5">
            {grouped.map(({ event, items }) => (
              <section key={event}>
                <Eyebrow className="mb-2 flex items-center gap-2">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-saffron" />
                  {event} · {items.length}
                </Eyebrow>
                <ul className="divide-y divide-border/50">
                  {items.map((i) => (
                    <li key={i.id} className="flex items-start gap-3 py-2">
                      <div className="flex-1">
                        <p className="text-[13px] text-ink">{i.title}</p>
                        {renderMeta && (
                          <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                            {renderMeta(i)}
                          </div>
                        )}
                      </div>
                      {i.meta?.time ? (
                        <span className="font-mono text-[10.5px] text-ink-muted">
                          {String(i.meta.time)}
                        </span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </PanelCard>
    </div>
  );
}
