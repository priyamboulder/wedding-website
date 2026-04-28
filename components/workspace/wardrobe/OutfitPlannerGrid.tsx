"use client";

// ── Outfit Planner Grid ────────────────────────────────────────────────────
// People × Events grid. Each cell maps to one WorkspaceItem with:
//   block_type: "outfit"
//   tab:        "wardrobe_looks"
//   meta.person:       row identity
//   meta.event:        column identity
//   meta.color:        hex string for the outfit
//   meta.designer:     source / boutique / heirloom
//   meta.status:       shopping → ordered → fittings → ready
//   meta.notes:        free text
//   meta.images:       string[]  (object-URL or data-URL photos for the look)
//   meta.urls:         { label: string; href: string }[]  (inspiration refs)
//   meta.jewelry:      { name: string; color?: string; notes?: string; images?: string[] }
//   meta.no_jewelry:   boolean  (couple explicitly opted out for this event)
//
// View toggle switches what the cell surfaces without changing the grid.

import { useMemo, useRef, useState } from "react";
import {
  ExternalLink,
  Gem,
  Image as ImageIcon,
  Link as LinkIcon,
  Plus,
  Shirt,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { useWorkspaceStore } from "@/stores/workspace-store";
import type { WorkspaceCategory, WorkspaceItem } from "@/types/workspace";
import { WEDDING_EVENTS } from "@/types/workspace";
import { PanelCard, Eyebrow } from "@/components/workspace/blocks/primitives";
import { cn } from "@/lib/utils";

// ── Data ────────────────────────────────────────────────────────────────────

const PEOPLE = [
  "Bride",
  "Groom",
  "Mother of Bride",
  "Mother of Groom",
  "Father of Bride",
  "Father of Groom",
  "Bridesmaids",
  "Groomsmen",
  "Flower Girl",
  "Ring Bearer",
] as const;

type OutfitStatus = "shopping" | "ordered" | "fittings" | "ready";

const STATUS_ORDER: OutfitStatus[] = [
  "shopping",
  "ordered",
  "fittings",
  "ready",
];

const STATUS_TONE: Record<OutfitStatus, string> = {
  shopping: "bg-stone-100 text-stone-600",
  ordered: "bg-saffron-pale/70 text-saffron",
  fittings: "border border-amber-300 bg-amber-50 text-amber-700",
  ready: "bg-sage-pale/70 text-sage",
};

const STATUS_LABEL: Record<OutfitStatus, string> = {
  shopping: "Shopping",
  ordered: "Ordered",
  fittings: "In fittings",
  ready: "Ready",
};

interface JewelryMeta {
  name?: string;
  color?: string;
  notes?: string;
  images?: string[];
}

interface UrlRef {
  label: string;
  href: string;
}

interface OutfitMeta {
  person?: string;
  event?: string;
  color?: string;
  designer?: string;
  status?: OutfitStatus;
  notes?: string;
  images?: string[];
  urls?: UrlRef[];
  jewelry?: JewelryMeta;
  no_jewelry?: boolean;
}

type ViewMode = "outfits" | "jewelry" | "all";

const cellKey = (person: string, event: string) => `${person}|${event}`;

// ── Root ────────────────────────────────────────────────────────────────────

export function OutfitPlannerGrid({
  category,
}: {
  category: WorkspaceCategory;
}) {
  const items = useWorkspaceStore((s) => s.items);
  const addItem = useWorkspaceStore((s) => s.addItem);
  const deleteItem = useWorkspaceStore((s) => s.deleteItem);
  const currentRole = useWorkspaceStore((s) => s.currentRole);
  const canEdit = currentRole !== "vendor";

  const [editingId, setEditingId] = useState<string | null>(null);
  const [view, setView] = useState<ViewMode>("outfits");

  const grid = useMemo(() => {
    const map = new Map<string, WorkspaceItem>();
    for (const item of items) {
      if (item.category_id !== category.id) continue;
      if (item.tab !== "wardrobe_looks") continue;
      if (item.block_type !== "outfit") continue;
      const meta = (item.meta ?? {}) as OutfitMeta;
      if (!meta.person || !meta.event) continue;
      map.set(cellKey(meta.person, meta.event), item);
    }
    return map;
  }, [items, category.id]);

  // Per-event color strip — blends outfit + jewelry colors based on view.
  const colorsByEvent = useMemo(() => {
    const out: Record<string, string[]> = {};
    for (const ev of WEDDING_EVENTS) {
      const seen: string[] = [];
      for (const p of PEOPLE) {
        const meta = (grid.get(cellKey(p, ev.label))?.meta ?? {}) as OutfitMeta;
        const candidates: string[] = [];
        if (view !== "jewelry" && meta.color?.trim()) {
          candidates.push(meta.color.trim());
        }
        if (view !== "outfits" && meta.jewelry?.color?.trim()) {
          candidates.push(meta.jewelry.color.trim());
        }
        for (const c of candidates) {
          if (!seen.includes(c)) seen.push(c);
        }
      }
      out[ev.label] = seen;
    }
    return out;
  }, [grid, view]);

  const handleAddCell = (person: string, event: string) => {
    if (!canEdit) return;
    addItem({
      category_id: category.id,
      tab: "wardrobe_looks",
      block_type: "outfit",
      title: "",
      meta: {
        person,
        event,
        status: "shopping" as OutfitStatus,
      },
      sort_order: items.length + 1,
    });
  };

  const editingItem = editingId
    ? items.find((i) => i.id === editingId) ?? null
    : null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <p className="max-w-3xl text-[13px] leading-relaxed text-ink-muted">
          One row per person, one column per event. Click a cell to plan the
          outfit, jewelry, notes, and inspiration for that look — the color
          strip shows your family-photo palette at a glance.
        </p>
        <ViewToggle view={view} onChange={setView} />
      </div>

      <PanelCard
        icon={<Shirt size={14} strokeWidth={1.8} />}
        title="Outfit planner"
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] border-separate border-spacing-0">
            <thead>
              <tr>
                <th
                  scope="col"
                  className="sticky left-0 z-10 w-[150px] border-b border-border bg-white py-2.5 pl-1 pr-3 text-left"
                >
                  <Eyebrow>Person</Eyebrow>
                </th>
                {WEDDING_EVENTS.map((ev) => (
                  <th
                    key={ev.id}
                    scope="col"
                    className="border-b border-border px-2 py-2.5 text-left"
                  >
                    <Eyebrow className="mb-1.5">{ev.label}</Eyebrow>
                    <ColorStrip colors={colorsByEvent[ev.label] ?? []} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PEOPLE.map((person, idx) => (
                <tr key={person}>
                  <th
                    scope="row"
                    className={cn(
                      "sticky left-0 z-10 bg-white py-2.5 pl-1 pr-3 text-left align-top",
                      idx === PEOPLE.length - 1
                        ? ""
                        : "border-b border-border/60",
                    )}
                  >
                    <span className="text-[12.5px] font-medium text-ink">
                      {person}
                    </span>
                  </th>
                  {WEDDING_EVENTS.map((ev) => {
                    const item = grid.get(cellKey(person, ev.label));
                    return (
                      <td
                        key={ev.id}
                        className={cn(
                          "px-1.5 py-1.5 align-top",
                          idx === PEOPLE.length - 1
                            ? ""
                            : "border-b border-border/60",
                        )}
                      >
                        <OutfitCell
                          item={item}
                          person={person}
                          event={ev.label}
                          view={view}
                          canEdit={canEdit}
                          onAdd={() => handleAddCell(person, ev.label)}
                          onOpen={(id) => setEditingId(id)}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PanelCard>

      {editingItem && (
        <OutfitDrawer
          item={editingItem}
          canEdit={canEdit}
          onClose={() => setEditingId(null)}
          onDelete={(id) => {
            deleteItem(id);
            setEditingId(null);
          }}
        />
      )}
    </div>
  );
}

// ── View toggle ────────────────────────────────────────────────────────────

function ViewToggle({
  view,
  onChange,
}: {
  view: ViewMode;
  onChange: (v: ViewMode) => void;
}) {
  const opts: Array<{ id: ViewMode; label: string }> = [
    { id: "outfits", label: "Outfits" },
    { id: "jewelry", label: "Jewelry" },
    { id: "all", label: "All" },
  ];
  return (
    <div
      className="inline-flex items-center rounded-full border border-border bg-white p-0.5 text-[11px]"
      role="tablist"
      aria-label="View mode"
    >
      {opts.map((o) => (
        <button
          key={o.id}
          type="button"
          role="tab"
          aria-selected={view === o.id}
          onClick={() => onChange(o.id)}
          className={cn(
            "rounded-full px-3 py-1 font-mono uppercase tracking-[0.08em] transition-colors",
            view === o.id
              ? "bg-ink text-ivory"
              : "text-ink-muted hover:text-ink",
          )}
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

// ── Per-event color coordination strip ─────────────────────────────────────

function ColorStrip({ colors }: { colors: string[] }) {
  if (colors.length === 0) {
    return (
      <div className="h-2.5 w-full rounded-full bg-border/40" aria-hidden />
    );
  }
  return (
    <div className="flex h-2.5 w-full overflow-hidden rounded-full">
      {colors.map((c) => (
        <span
          key={c}
          className="block h-full flex-1"
          style={{ backgroundColor: c }}
          title={c}
        />
      ))}
    </div>
  );
}

// ── Cell ────────────────────────────────────────────────────────────────────

function OutfitCell({
  item,
  person,
  event,
  view,
  canEdit,
  onAdd,
  onOpen,
}: {
  item: WorkspaceItem | undefined;
  person: string;
  event: string;
  view: ViewMode;
  canEdit: boolean;
  onAdd: () => void;
  onOpen: (id: string) => void;
}) {
  if (!item) {
    if (!canEdit) {
      return (
        <div
          aria-label={`No look planned for ${person} at ${event}`}
          className="h-[86px] w-full rounded-md border border-dashed border-border/60 bg-ivory-warm/20"
        />
      );
    }
    return (
      <button
        type="button"
        onClick={onAdd}
        className="group flex h-[86px] w-full items-center justify-center rounded-md border border-dashed border-border bg-ivory-warm/30 text-ink-faint transition-colors hover:border-saffron hover:bg-saffron-pale/30 hover:text-saffron"
        aria-label={`Add look for ${person} at ${event}`}
      >
        <Plus
          size={14}
          strokeWidth={1.8}
          className="opacity-60 transition-opacity group-hover:opacity-100"
        />
      </button>
    );
  }

  const meta = (item.meta ?? {}) as OutfitMeta;
  const status = meta.status ?? "shopping";
  const outfitTitle = item.title?.trim() || "Untitled outfit";
  const jewelry = meta.jewelry;
  const jewelryLabel = meta.no_jewelry
    ? "No jewelry"
    : jewelry?.name?.trim() || "Add jewelry";
  const hasJewelry =
    !meta.no_jewelry && !!jewelry?.name?.trim();

  return (
    <button
      type="button"
      onClick={() => onOpen(item.id)}
      className="flex h-[86px] w-full flex-col items-stretch gap-1 rounded-md border border-border bg-white px-2.5 py-2 text-left transition-colors hover:border-saffron hover:bg-saffron-pale/15"
    >
      {view !== "jewelry" && (
        <div className="flex items-start gap-1.5">
          {meta.color?.trim() && (
            <span
              className="mt-[3px] h-2.5 w-2.5 shrink-0 rounded-full border border-border"
              style={{ backgroundColor: meta.color }}
              aria-hidden
            />
          )}
          <span className="line-clamp-2 flex-1 text-[12px] leading-tight text-ink">
            {outfitTitle}
          </span>
        </div>
      )}

      {view !== "outfits" && (
        <div
          className={cn(
            "flex items-center gap-1.5",
            view === "all" && "mt-0.5 border-t border-dashed border-border/60 pt-1",
          )}
        >
          <Gem
            size={11}
            strokeWidth={1.8}
            className={cn(
              "shrink-0",
              hasJewelry ? "text-marigold" : "text-ink-faint",
            )}
          />
          {hasJewelry && jewelry?.color?.trim() && (
            <span
              className="h-2 w-2 shrink-0 rounded-full border border-border"
              style={{ backgroundColor: jewelry.color }}
              aria-hidden
            />
          )}
          <span
            className={cn(
              "truncate text-[11px] leading-tight",
              hasJewelry
                ? "text-ink"
                : "italic text-ink-faint",
            )}
          >
            {jewelryLabel}
          </span>
        </div>
      )}

      <div className="mt-auto flex items-center justify-between gap-1.5">
        {meta.designer ? (
          <span className="truncate text-[10.5px] italic text-ink-muted">
            {meta.designer}
          </span>
        ) : (
          <span />
        )}
        <span
          className={cn(
            "shrink-0 rounded-sm px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.08em]",
            STATUS_TONE[status],
          )}
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {STATUS_LABEL[status]}
        </span>
      </div>
    </button>
  );
}

// ── Pop-out drawer ─────────────────────────────────────────────────────────

function OutfitDrawer({
  item,
  canEdit,
  onClose,
  onDelete,
}: {
  item: WorkspaceItem;
  canEdit: boolean;
  onClose: () => void;
  onDelete: (id: string) => void;
}) {
  const updateItem = useWorkspaceStore((s) => s.updateItem);
  const meta = (item.meta ?? {}) as OutfitMeta;

  const patchMeta = (patch: Partial<OutfitMeta>) => {
    updateItem(item.id, { meta: { ...(item.meta ?? {}), ...patch } });
  };

  const patchJewelry = (patch: Partial<JewelryMeta>) => {
    patchMeta({ jewelry: { ...(meta.jewelry ?? {}), ...patch } });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex"
      role="dialog"
      aria-modal="true"
      aria-label={`${meta.person ?? ""} — ${meta.event ?? ""} look editor`}
    >
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="flex-1 bg-ink/25 backdrop-blur-[2px]"
      />

      <aside className="flex w-full max-w-2xl flex-col overflow-hidden bg-white shadow-2xl">
        <header className="flex items-start justify-between gap-3 border-b border-border px-6 py-4">
          <div className="min-w-0">
            <Eyebrow>{meta.event ?? "Event"}</Eyebrow>
            <h2
              className="mt-0.5 font-serif text-[22px] leading-tight text-ink"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {meta.person ?? "Person"}
            </h2>
            {(item.title?.trim() || meta.designer?.trim()) && (
              <p className="mt-1 text-[12.5px] italic text-ink-muted">
                {[item.title?.trim(), meta.designer?.trim()]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-ink-muted hover:text-ink"
            aria-label="Close"
          >
            <X size={14} />
          </button>
        </header>

        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
          <OutfitSection
            item={item}
            meta={meta}
            canEdit={canEdit}
            onTitle={(v) => updateItem(item.id, { title: v })}
            onPatch={patchMeta}
          />

          <ImagesSection
            images={meta.images ?? []}
            canEdit={canEdit}
            onChange={(images) => patchMeta({ images })}
          />

          <JewelrySection
            jewelry={meta.jewelry ?? {}}
            noJewelry={!!meta.no_jewelry}
            canEdit={canEdit}
            onPatch={patchJewelry}
            onToggleNone={(v) =>
              patchMeta({
                no_jewelry: v,
                ...(v ? { jewelry: undefined } : {}),
              })
            }
          />

          <UrlsSection
            urls={meta.urls ?? []}
            canEdit={canEdit}
            onChange={(urls) => patchMeta({ urls })}
          />

          <NotesSection
            value={meta.notes ?? ""}
            canEdit={canEdit}
            onChange={(notes) => patchMeta({ notes })}
          />
        </div>

        {canEdit && (
          <footer className="border-t border-border px-6 py-3">
            <button
              type="button"
              onClick={() => onDelete(item.id)}
              className="inline-flex items-center gap-1 text-[11.5px] text-ink-faint hover:text-rose"
            >
              <Trash2 size={12} strokeWidth={1.8} />
              Remove this look
            </button>
          </footer>
        )}
      </aside>
    </div>
  );
}

// ── Drawer sections ────────────────────────────────────────────────────────

function OutfitSection({
  item,
  meta,
  canEdit,
  onTitle,
  onPatch,
}: {
  item: WorkspaceItem;
  meta: OutfitMeta;
  canEdit: boolean;
  onTitle: (v: string) => void;
  onPatch: (patch: Partial<OutfitMeta>) => void;
}) {
  return (
    <section className="space-y-3">
      <Eyebrow>Outfit</Eyebrow>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <Field label="Outfit description">
          <input
            value={item.title}
            onChange={(e) => onTitle(e.target.value)}
            placeholder="Red lehenga with zardozi"
            disabled={!canEdit}
            className="w-full rounded-sm border border-border bg-white px-2.5 py-1.5 text-[12.5px] text-ink placeholder:text-ink-faint focus:border-saffron focus:outline-none disabled:opacity-60"
          />
        </Field>

        <Field label="Designer / source">
          <input
            value={meta.designer ?? ""}
            onChange={(e) => onPatch({ designer: e.target.value })}
            placeholder="Sabyasachi · heirloom from Nani"
            disabled={!canEdit}
            className="w-full rounded-sm border border-border bg-white px-2.5 py-1.5 text-[12.5px] text-ink placeholder:text-ink-faint focus:border-saffron focus:outline-none disabled:opacity-60"
          />
        </Field>

        <Field label="Outfit color">
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={meta.color ?? "#cccccc"}
              onChange={(e) => onPatch({ color: e.target.value })}
              disabled={!canEdit}
              className="h-8 w-10 cursor-pointer rounded-sm border border-border bg-white disabled:cursor-not-allowed disabled:opacity-60"
              aria-label="Outfit color"
            />
            <input
              value={meta.color ?? ""}
              onChange={(e) => onPatch({ color: e.target.value })}
              placeholder="#b91c1c"
              disabled={!canEdit}
              className="flex-1 rounded-sm border border-border bg-white px-2.5 py-1.5 font-mono text-[11.5px] text-ink placeholder:text-ink-faint focus:border-saffron focus:outline-none disabled:opacity-60"
              style={{ fontFamily: "var(--font-mono)" }}
            />
          </div>
        </Field>

        <Field label="Status">
          <div className="flex flex-wrap gap-1.5">
            {STATUS_ORDER.map((s) => {
              const active = (meta.status ?? "shopping") === s;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => onPatch({ status: s })}
                  disabled={!canEdit}
                  className={cn(
                    "rounded-sm px-2 py-1 font-mono text-[10px] uppercase tracking-[0.08em] transition-colors disabled:cursor-not-allowed disabled:opacity-60",
                    active
                      ? STATUS_TONE[s]
                      : "border border-border bg-white text-ink-faint hover:text-ink",
                  )}
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {STATUS_LABEL[s]}
                </button>
              );
            })}
          </div>
        </Field>
      </div>
    </section>
  );
}

function ImagesSection({
  images,
  canEdit,
  onChange,
}: {
  images: string[];
  canEdit: boolean;
  onChange: (next: string[]) => void;
}) {
  const fileInput = useRef<HTMLInputElement>(null);

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const next = [...images];
    for (const f of Array.from(files)) {
      next.push(URL.createObjectURL(f));
    }
    onChange(next);
  }

  function removeAt(idx: number) {
    onChange(images.filter((_, i) => i !== idx));
  }

  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between">
        <Eyebrow>Images</Eyebrow>
        {canEdit && (
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            className="inline-flex items-center gap-1 rounded-sm border border-border bg-white px-2 py-1 text-[11px] text-ink-muted transition-colors hover:border-saffron hover:text-saffron"
          >
            <ImageIcon size={11} /> Upload
          </button>
        )}
        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>
      <p className="text-[11.5px] italic text-ink-faint">
        Outfit, fabric close-ups, dupatta, accessories — drop as many as you
        want.
      </p>
      {images.length === 0 ? (
        <div className="rounded-md border border-dashed border-border bg-ivory-warm/30 px-3 py-5 text-center text-[12px] text-ink-faint">
          No images yet.
        </div>
      ) : (
        <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {images.map((src, idx) => (
            <li
              key={`${src}-${idx}`}
              className="group relative overflow-hidden rounded-md ring-1 ring-border"
            >
              <div className="relative aspect-[4/5] bg-ivory-warm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={`Look image ${idx + 1}`}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
                {canEdit && (
                  <button
                    type="button"
                    onClick={() => removeAt(idx)}
                    className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-ink-muted opacity-0 shadow-sm ring-1 ring-border transition-opacity hover:text-rose group-hover:opacity-100"
                    aria-label="Remove image"
                  >
                    <Trash2 size={10} strokeWidth={1.8} />
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function JewelrySection({
  jewelry,
  noJewelry,
  canEdit,
  onPatch,
  onToggleNone,
}: {
  jewelry: JewelryMeta;
  noJewelry: boolean;
  canEdit: boolean;
  onPatch: (patch: Partial<JewelryMeta>) => void;
  onToggleNone: (v: boolean) => void;
}) {
  const jewelryFileInput = useRef<HTMLInputElement>(null);
  const images = jewelry.images ?? [];

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const next = [...images];
    for (const f of Array.from(files)) {
      next.push(URL.createObjectURL(f));
    }
    onPatch({ images: next });
  }

  function removeAt(idx: number) {
    onPatch({ images: images.filter((_, i) => i !== idx) });
  }

  return (
    <section className="space-y-3 rounded-md border border-border bg-ivory-warm/30 p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Gem size={13} strokeWidth={1.8} className="text-marigold" />
          <Eyebrow>Jewelry</Eyebrow>
        </div>
        {canEdit && (
          <label className="inline-flex items-center gap-1.5 text-[11.5px] text-ink-muted">
            <input
              type="checkbox"
              checked={noJewelry}
              onChange={(e) => onToggleNone(e.target.checked)}
              className="h-3.5 w-3.5 accent-saffron"
            />
            No jewelry for this event
          </label>
        )}
      </div>

      {noJewelry ? (
        <p className="text-[12.5px] italic text-ink-faint">
          Jewelry skipped for this look.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Field label="Jewelry description">
              <input
                value={jewelry.name ?? ""}
                onChange={(e) => onPatch({ name: e.target.value })}
                placeholder="Polki choker + chandbalis + maang tikka"
                disabled={!canEdit}
                className="w-full rounded-sm border border-border bg-white px-2.5 py-1.5 text-[12.5px] text-ink placeholder:text-ink-faint focus:border-saffron focus:outline-none disabled:opacity-60"
              />
            </Field>

            <Field label="Metal / stone tone">
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={jewelry.color ?? "#d4a853"}
                  onChange={(e) => onPatch({ color: e.target.value })}
                  disabled={!canEdit}
                  className="h-8 w-10 cursor-pointer rounded-sm border border-border bg-white disabled:cursor-not-allowed disabled:opacity-60"
                  aria-label="Jewelry tone"
                />
                <input
                  value={jewelry.color ?? ""}
                  onChange={(e) => onPatch({ color: e.target.value })}
                  placeholder="#d4a853"
                  disabled={!canEdit}
                  className="flex-1 rounded-sm border border-border bg-white px-2.5 py-1.5 font-mono text-[11.5px] text-ink placeholder:text-ink-faint focus:border-saffron focus:outline-none disabled:opacity-60"
                  style={{ fontFamily: "var(--font-mono)" }}
                />
              </div>
            </Field>
          </div>

          <Field label="Jewelry notes">
            <textarea
              value={jewelry.notes ?? ""}
              onChange={(e) => onPatch({ notes: e.target.value })}
              placeholder="Borrowed from Dadi. Polish before mehendi."
              disabled={!canEdit}
              rows={2}
              className="w-full resize-none rounded-sm border border-border bg-white px-2.5 py-1.5 text-[12.5px] text-ink placeholder:text-ink-faint focus:border-saffron focus:outline-none disabled:opacity-60"
            />
          </Field>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <Eyebrow>Jewelry photos</Eyebrow>
              {canEdit && (
                <button
                  type="button"
                  onClick={() => jewelryFileInput.current?.click()}
                  className="inline-flex items-center gap-1 rounded-sm border border-border bg-white px-2 py-1 text-[11px] text-ink-muted transition-colors hover:border-saffron hover:text-saffron"
                >
                  <ImageIcon size={11} /> Upload
                </button>
              )}
              <input
                ref={jewelryFileInput}
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={(e) => {
                  handleFiles(e.target.files);
                  e.target.value = "";
                }}
              />
            </div>
            {images.length === 0 ? (
              <p className="text-[12px] italic text-ink-faint">
                No jewelry photos yet.
              </p>
            ) : (
              <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {images.map((src, idx) => (
                  <li
                    key={`${src}-${idx}`}
                    className="group relative overflow-hidden rounded-md ring-1 ring-border"
                  >
                    <div className="relative aspect-square bg-ivory-warm">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={src}
                        alt={`Jewelry ${idx + 1}`}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                      {canEdit && (
                        <button
                          type="button"
                          onClick={() => removeAt(idx)}
                          className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-ink-muted opacity-0 shadow-sm ring-1 ring-border transition-opacity hover:text-rose group-hover:opacity-100"
                          aria-label="Remove jewelry photo"
                        >
                          <Trash2 size={10} strokeWidth={1.8} />
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </section>
  );
}

function UrlsSection({
  urls,
  canEdit,
  onChange,
}: {
  urls: UrlRef[];
  canEdit: boolean;
  onChange: (next: UrlRef[]) => void;
}) {
  const [labelDraft, setLabelDraft] = useState("");
  const [hrefDraft, setHrefDraft] = useState("");

  function add() {
    const href = hrefDraft.trim();
    if (!href) return;
    const label = labelDraft.trim() || href;
    onChange([...urls, { label, href }]);
    setLabelDraft("");
    setHrefDraft("");
  }

  function remove(idx: number) {
    onChange(urls.filter((_, i) => i !== idx));
  }

  return (
    <section className="space-y-2">
      <Eyebrow>Inspiration links</Eyebrow>
      <p className="text-[11.5px] italic text-ink-faint">
        Instagram posts, Pinterest pins, designer lookbooks — paste anything.
      </p>

      {urls.length > 0 && (
        <ul className="space-y-1.5">
          {urls.map((u, idx) => (
            <li
              key={`${u.href}-${idx}`}
              className="group flex items-center gap-2 rounded-md border border-border bg-white px-2.5 py-1.5"
            >
              <LinkIcon
                size={11}
                strokeWidth={1.8}
                className="shrink-0 text-ink-faint"
              />
              <a
                href={u.href}
                target="_blank"
                rel="noopener noreferrer"
                className="min-w-0 flex-1 truncate text-[12.5px] text-ink hover:text-saffron"
              >
                {u.label}
              </a>
              <ExternalLink
                size={11}
                strokeWidth={1.8}
                className="shrink-0 text-ink-faint"
              />
              {canEdit && (
                <button
                  type="button"
                  onClick={() => remove(idx)}
                  className="text-ink-faint opacity-0 transition-opacity hover:text-rose group-hover:opacity-100"
                  aria-label="Remove link"
                >
                  <X size={12} strokeWidth={1.8} />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {canEdit && (
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={labelDraft}
            onChange={(e) => setLabelDraft(e.target.value)}
            placeholder="Label (optional)"
            className="w-40 rounded-sm border border-border bg-white px-2.5 py-1.5 text-[12px] text-ink placeholder:text-ink-faint focus:border-saffron focus:outline-none"
          />
          <input
            type="url"
            value={hrefDraft}
            onChange={(e) => setHrefDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") add();
            }}
            placeholder="https://…"
            className="min-w-[220px] flex-1 rounded-sm border border-border bg-white px-2.5 py-1.5 text-[12px] text-ink placeholder:text-ink-faint focus:border-saffron focus:outline-none"
          />
          <button
            type="button"
            onClick={add}
            className="inline-flex items-center gap-1 rounded-sm border border-border bg-white px-2.5 py-1.5 text-[11.5px] text-ink-muted transition-colors hover:border-saffron hover:text-saffron"
          >
            <Plus size={11} /> Add link
          </button>
        </div>
      )}
    </section>
  );
}

function NotesSection({
  value,
  canEdit,
  onChange,
}: {
  value: string;
  canEdit: boolean;
  onChange: (v: string) => void;
}) {
  return (
    <section className="space-y-2">
      <div className="flex items-center gap-2">
        <Sparkles size={12} strokeWidth={1.8} className="text-saffron" />
        <Eyebrow>Styling notes</Eyebrow>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Pairs with kundan choker. Dupatta needs steaming morning-of."
        disabled={!canEdit}
        rows={3}
        className="w-full resize-none rounded-sm border border-border bg-white px-2.5 py-2 text-[12.5px] leading-relaxed text-ink placeholder:text-ink-faint focus:border-saffron focus:outline-none disabled:opacity-60"
      />
    </section>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Eyebrow>{label}</Eyebrow>
      {children}
    </div>
  );
}
