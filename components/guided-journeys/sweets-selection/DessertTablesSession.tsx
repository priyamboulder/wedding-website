"use client";

// ── Selection Session 3 · Dessert tables ──────────────────────────────────
// Per-event tables. Each table is a WorkspaceItem (tab=dessert_tables,
// meta.kind=table) with items[], styling, plating, attendants. Items are
// chosen from already-loved cake tiers (Session 1) + mithai (Session 2).
// Pre-seeds one default table per wedding event, surfaces a soft warning
// for events with no table.

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Plus,
  Trash2,
  UtensilsCrossed,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { useCakeSweetsStore } from "@/stores/cake-sweets-store";
import { useVisionStore } from "@/stores/vision-store";
import {
  WEDDING_EVENTS,
  type WeddingEvent,
  type WorkspaceCategory,
} from "@/types/workspace";
import { DESSERT_CATALOG } from "@/lib/cake-sweets-seed";
import { DESSERT_TABLE_PROP_OPTIONS } from "@/lib/guided-journeys/sweets-selection";

interface TableMeta {
  kind?: "table";
  event?: WeddingEvent;
  styling?: {
    vibe?: string[];
    props?: string[];
    linen?: string;
    backdrop?: string;
  };
  plating?: {
    style?: "individual_portions" | "family_style" | "self_serve" | "mixed";
    utensils_provided?: "plates_forks" | "just_napkins" | "plates_only" | "tbd";
    portion_signage?: boolean;
  };
  attendants_count?: number;
  attendant_role?: string;
  notes?: string;
  // Items live as ref ids: cake tier item ids + dessert catalog ids.
  item_refs?: Array<{
    source: "cake_tier" | "mithai_loved" | "mithai_custom";
    ref_id: string;
  }>;
}

interface TierMeta {
  kind?: "tier";
  flavor?: string;
  size?: number;
}

const PLATING_STYLES = [
  { id: "individual_portions", label: "Individual portions" },
  { id: "family_style", label: "Family-style platters" },
  { id: "self_serve", label: "Self-serve" },
  { id: "mixed", label: "Mixed" },
] as const;

const UTENSILS = [
  { id: "plates_forks", label: "Plates + forks" },
  { id: "plates_only", label: "Plates only" },
  { id: "just_napkins", label: "Just napkins" },
  { id: "tbd", label: "TBD" },
] as const;

export function DessertTablesSession({
  category,
}: {
  category: WorkspaceCategory;
  onSkipToNext?: () => void;
}) {
  const items = useWorkspaceStore((s) => s.items);
  const addItem = useWorkspaceStore((s) => s.addItem);
  const updateItem = useWorkspaceStore((s) => s.updateItem);
  const deleteItem = useWorkspaceStore((s) => s.deleteItem);

  const styleKeywordsMap = useVisionStore((s) => s.style_keywords);
  const visionVibe = styleKeywordsMap[category.id] ?? [];

  // Loved mithai for picking
  const dessertReactions = useCakeSweetsStore((s) => s.dessert_catalog);
  const dessertMeta = useCakeSweetsStore((s) => s.dessert_meta);
  const lovedMithai = useMemo(() => {
    return Object.entries(dessertReactions)
      .filter(([, r]) => r === "love")
      .map(([id]) => {
        const cat = DESSERT_CATALOG.find((d) => d.id === id);
        const m = dessertMeta[id];
        const source: "mithai_loved" | "mithai_custom" = m?.custom
          ? "mithai_custom"
          : "mithai_loved";
        return {
          id,
          name: cat?.name ?? m?.name ?? "(custom)",
          emoji: cat?.emoji ?? "✨",
          source,
        };
      });
  }, [dessertReactions, dessertMeta]);

  // Cake tiers (for picking onto a table)
  const cakeTiers = useMemo(
    () =>
      items.filter(
        (i) =>
          i.category_id === category.id &&
          i.tab === "wedding_cake" &&
          (i.meta as TierMeta | undefined)?.kind === "tier",
      ),
    [items, category.id],
  );

  // Tables
  const tables = useMemo(
    () =>
      items
        .filter(
          (i) =>
            i.category_id === category.id &&
            i.tab === "dessert_tables" &&
            (i.meta as TableMeta | undefined)?.kind === "table",
        )
        .sort((a, b) => a.sort_order - b.sort_order),
    [items, category.id],
  );

  // Pre-seed one table per loved-mithai event coverage on first render.
  // Use the wedding event roster (mehendi, sangeet, wedding, reception).
  // Skip if any tables already exist.
  const [seeded, setSeeded] = useState(false);
  useEffect(() => {
    if (seeded || tables.length > 0) {
      setSeeded(true);
      return;
    }
    const eventsWithDessert: WeddingEvent[] = [
      "mehendi",
      "sangeet",
      "wedding",
      "reception",
    ];
    eventsWithDessert.forEach((evt, idx) => {
      addItem({
        category_id: category.id,
        tab: "dessert_tables",
        block_type: "note",
        title: defaultTableName(evt),
        meta: {
          kind: "table",
          event: evt,
          styling: {
            vibe: visionVibe.slice(0, 3),
            props: ["cake_stands_tiered", "floral_runner"],
            linen: "Ivory raw silk",
          },
          plating: {
            style: "family_style",
            utensils_provided: "plates_forks",
            portion_signage: true,
          },
          attendants_count: 1,
          item_refs: [],
        },
        sort_order: idx,
      });
    });
    setSeeded(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seeded, tables.length, category.id, visionVibe.join("|")]);

  function patchTable(id: string, patch: Partial<TableMeta>) {
    const it = items.find((x) => x.id === id);
    if (!it) return;
    const prev = (it.meta ?? {}) as TableMeta;
    updateItem(id, {
      meta: {
        ...prev,
        ...patch,
        styling: { ...prev.styling, ...(patch.styling ?? {}) },
        plating: { ...prev.plating, ...(patch.plating ?? {}) },
      },
    });
  }

  function addTable() {
    addItem({
      category_id: category.id,
      tab: "dessert_tables",
      block_type: "note",
      title: "Dessert table",
      meta: {
        kind: "table",
        event: "reception",
        styling: { vibe: visionVibe.slice(0, 3), props: [], linen: "" },
        plating: {
          style: "family_style",
          utensils_provided: "plates_forks",
          portion_signage: true,
        },
        attendants_count: 1,
        item_refs: [],
      },
      sort_order: items.length + 1,
    });
  }

  // Computed: events without tables (soft warning).
  const eventsWithTables = new Set(
    tables
      .map((t) => (t.meta as TableMeta | undefined)?.event)
      .filter(Boolean) as WeddingEvent[],
  );
  const allWeddingEvents: WeddingEvent[] = [
    "mehendi",
    "sangeet",
    "wedding",
    "reception",
  ];
  const eventsWithout = allWeddingEvents.filter((e) => !eventsWithTables.has(e));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Tables" value={tables.length} />
        <Stat
          label="Total attendants"
          value={tables.reduce(
            (sum, t) => sum + ((t.meta as TableMeta | undefined)?.attendants_count ?? 0),
            0,
          )}
        />
        <Stat label="Events covered" value={eventsWithTables.size} />
        <Stat label="Loved items" value={lovedMithai.length + cakeTiers.length} />
      </div>

      {eventsWithout.length > 0 && (
        <div className="flex items-start gap-2 rounded-md border border-amber-400 bg-amber-50/60 px-3 py-2">
          <AlertTriangle size={14} strokeWidth={1.8} className="mt-0.5 shrink-0 text-amber-700" />
          <p className="text-[12.5px] leading-snug text-amber-800">
            {eventsWithout.map(eventLabel).join(", ")} ha
            {eventsWithout.length === 1 ? "s" : "ve"} no dessert table planned —
            is that intentional?
          </p>
        </div>
      )}

      <section>
        <SectionHeader
          title="Tables"
          eyebrow="Per-event"
          right={
            <button
              type="button"
              onClick={addTable}
              className="inline-flex items-center gap-1 rounded-sm border border-border bg-white px-2 py-1 text-[11px] text-ink hover:border-saffron hover:text-saffron"
            >
              <Plus size={12} strokeWidth={1.8} /> Add table
            </button>
          }
        />
        {tables.length === 0 ? (
          <p className="py-2 text-[12px] italic text-ink-faint">
            No tables yet. Add one above to start.
          </p>
        ) : (
          <ul className="space-y-3">
            {tables.map((t) => (
              <TableEditor
                key={t.id}
                table={t}
                onPatch={(patch) => patchTable(t.id, patch)}
                onDelete={() => deleteItem(t.id)}
                lovedMithai={lovedMithai}
                cakeTiers={cakeTiers}
                onTitleChange={(title) => updateItem(t.id, { title })}
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

// ─── Table editor ────────────────────────────────────────────────────────

function TableEditor({
  table,
  onPatch,
  onDelete,
  onTitleChange,
  lovedMithai,
  cakeTiers,
}: {
  table: { id: string; title: string; meta?: unknown };
  onPatch: (patch: Partial<TableMeta>) => void;
  onDelete: () => void;
  onTitleChange: (title: string) => void;
  lovedMithai: Array<{
    id: string;
    name: string;
    emoji: string;
    source: "mithai_loved" | "mithai_custom";
  }>;
  cakeTiers: Array<{ id: string; meta?: unknown }>;
}) {
  const meta = (table.meta ?? {}) as TableMeta;
  const refs = meta.item_refs ?? [];

  function toggleRef(
    source: "cake_tier" | "mithai_loved" | "mithai_custom",
    ref_id: string,
  ) {
    const existing = refs.find((r) => r.ref_id === ref_id && r.source === source);
    if (existing) {
      onPatch({ item_refs: refs.filter((r) => r !== existing) });
    } else {
      onPatch({ item_refs: [...refs, { source, ref_id }] });
    }
  }

  return (
    <li className="rounded-md border border-border bg-white p-4">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <input
          value={table.title}
          onChange={(e) => onTitleChange(e.target.value)}
          className="flex-1 rounded-sm border border-border bg-white px-2 py-1 font-serif text-[14px] text-ink focus:border-saffron focus:outline-none"
        />
        <select
          value={meta.event ?? "reception"}
          onChange={(e) => onPatch({ event: e.target.value as WeddingEvent })}
          className="rounded-sm border border-border bg-white px-2 py-1 text-[12px] text-ink focus:border-saffron focus:outline-none"
        >
          {WEDDING_EVENTS.map((e) => (
            <option key={e.id} value={e.id}>
              {e.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={onDelete}
          className="text-ink-faint hover:text-rose"
          aria-label="Remove table"
        >
          <Trash2 size={12} strokeWidth={1.8} />
        </button>
      </div>

      {/* Items on this table */}
      <div className="mb-3">
        <Eyebrow>Items on table</Eyebrow>
        <div className="flex flex-wrap gap-1.5">
          {cakeTiers.map((c) => {
            const m = (c.meta ?? {}) as TierMeta;
            const id = c.id;
            const active = refs.some(
              (r) => r.source === "cake_tier" && r.ref_id === id,
            );
            return (
              <button
                key={id}
                type="button"
                onClick={() => toggleRef("cake_tier", id)}
                className={cn(
                  "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11.5px] transition-colors",
                  active
                    ? "border-rose bg-rose-pale/40 text-rose"
                    : "border-border bg-white text-ink-muted hover:border-rose",
                )}
              >
                🎂 Cake — {m.flavor || `${m.size ?? "?"}″`}
              </button>
            );
          })}
          {lovedMithai.map((m) => {
            const active = refs.some(
              (r) => r.source === m.source && r.ref_id === m.id,
            );
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => toggleRef(m.source, m.id)}
                className={cn(
                  "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11.5px] transition-colors",
                  active
                    ? "border-rose bg-rose-pale/40 text-rose"
                    : "border-border bg-white text-ink-muted hover:border-rose",
                )}
              >
                <span>{m.emoji}</span>
                {m.name}
              </button>
            );
          })}
          {cakeTiers.length === 0 && lovedMithai.length === 0 && (
            <p className="text-[11.5px] italic text-ink-faint">
              Love some mithai in Session 2 — they'll appear here as picks.
            </p>
          )}
        </div>
      </div>

      {/* Styling */}
      <div className="mb-3 grid grid-cols-1 gap-2 md:grid-cols-2">
        <div>
          <Eyebrow>Linen</Eyebrow>
          <input
            value={meta.styling?.linen ?? ""}
            onChange={(e) => onPatch({ styling: { linen: e.target.value } })}
            placeholder="Ivory raw silk · gold-trimmed white"
            className="w-full rounded-sm border border-border bg-white px-2 py-1 text-[12px] text-ink placeholder:text-ink-faint focus:border-saffron focus:outline-none"
          />
        </div>
        <div>
          <Eyebrow>Backdrop</Eyebrow>
          <input
            value={meta.styling?.backdrop ?? ""}
            onChange={(e) => onPatch({ styling: { backdrop: e.target.value } })}
            placeholder="Marigold flower wall · mirror with monogram"
            className="w-full rounded-sm border border-border bg-white px-2 py-1 text-[12px] text-ink placeholder:text-ink-faint focus:border-saffron focus:outline-none"
          />
        </div>
        <div className="md:col-span-2">
          <Eyebrow>Props</Eyebrow>
          <div className="flex flex-wrap gap-1">
            {DESSERT_TABLE_PROP_OPTIONS.map((p) => {
              const active = (meta.styling?.props ?? []).includes(p);
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => {
                    const cur = meta.styling?.props ?? [];
                    const next = active
                      ? cur.filter((x) => x !== p)
                      : [...cur, p];
                    onPatch({ styling: { props: next } });
                  }}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.08em] transition-colors",
                    active
                      ? "border-saffron bg-saffron-pale/40 text-saffron"
                      : "border-border bg-white text-ink-muted hover:border-saffron",
                  )}
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {p.replace(/_/g, " ")}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Plating + staffing */}
      <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
        <div>
          <Eyebrow>Plating style</Eyebrow>
          <select
            value={meta.plating?.style ?? "family_style"}
            onChange={(e) =>
              onPatch({
                plating: {
                  style: e.target
                    .value as NonNullable<TableMeta["plating"]>["style"],
                },
              })
            }
            className="w-full rounded-sm border border-border bg-white px-2 py-1 text-[12px] text-ink focus:border-saffron focus:outline-none"
          >
            {PLATING_STYLES.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Eyebrow>Utensils</Eyebrow>
          <select
            value={meta.plating?.utensils_provided ?? "plates_forks"}
            onChange={(e) =>
              onPatch({
                plating: {
                  utensils_provided: e.target
                    .value as NonNullable<TableMeta["plating"]>["utensils_provided"],
                },
              })
            }
            className="w-full rounded-sm border border-border bg-white px-2 py-1 text-[12px] text-ink focus:border-saffron focus:outline-none"
          >
            {UTENSILS.map((u) => (
              <option key={u.id} value={u.id}>
                {u.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Eyebrow>Attendants</Eyebrow>
          <input
            type="number"
            min={0}
            max={10}
            value={meta.attendants_count ?? 1}
            onChange={(e) => onPatch({ attendants_count: Number(e.target.value) })}
            className="w-full rounded-sm border border-border bg-white px-2 py-1 font-mono text-[12px] text-ink focus:border-saffron focus:outline-none"
            style={{ fontFamily: "var(--font-mono)" }}
          />
        </div>
      </div>
    </li>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────

function eventLabel(e: WeddingEvent): string {
  return WEDDING_EVENTS.find((w) => w.id === e)?.label ?? e;
}

function defaultTableName(event: WeddingEvent): string {
  switch (event) {
    case "sangeet":
      return "Sangeet mithai station";
    case "reception":
      return "Reception cake table";
    case "wedding":
      return "Wedding dessert thali";
    case "mehendi":
      return "Mehendi sweet bar";
    default:
      return `${eventLabel(event)} dessert table`;
  }
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-md border border-border bg-white px-3 py-2">
      <p
        className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-faint"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {label}
      </p>
      <p className="mt-1 font-serif text-[18px] leading-tight text-ink">
        {value}
      </p>
    </div>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="mb-1 font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-faint"
      style={{ fontFamily: "var(--font-mono)" }}
    >
      {children}
    </p>
  );
}

function SectionHeader({
  title,
  eyebrow,
  right,
}: {
  title: string;
  eyebrow?: string;
  right?: React.ReactNode;
}) {
  return (
    <header className="mb-3 flex items-end justify-between gap-3">
      <div>
        {eyebrow && (
          <p
            className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-saffron"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {eyebrow}
          </p>
        )}
        <h4 className="font-serif text-[18px] leading-tight text-ink">
          {title}
        </h4>
      </div>
      {right}
    </header>
  );
}
