"use client";

// ── Dessert Tables — auto-populated from loved spread ─────────────────────
// Every dessert the couple "loved" in the Mithai browser flows here. The
// couple assigns a display style (platter, tower, live station…), on-table
// quantity, and placement notes. A simple visual layout preview stacks the
// items by display style so they can eyeball the spread at a glance.

import { useMemo, useState } from "react";
import {
  CakeSlice,
  LayoutGrid,
  Plus,
  ShieldAlert,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCakeSweetsStore } from "@/stores/cake-sweets-store";
import {
  ALLERGEN_OPTIONS,
  DESSERT_CATALOG,
  DISPLAY_STYLES,
} from "@/lib/cake-sweets-seed";
import type { WorkspaceCategory } from "@/types/workspace";
import {
  Eyebrow,
  PanelCard,
} from "@/components/workspace/blocks/primitives";

const MONO_FAMILY = "var(--font-mono)";

interface ResolvedItem {
  id: string;
  name: string;
  emoji: string;
  description: string;
  isCustom: boolean;
}

function resolveItem(
  id: string,
  metaName?: string,
  metaDescription?: string,
  isCustom?: boolean,
): ResolvedItem | null {
  const seed = DESSERT_CATALOG.find((d) => d.id === id);
  if (seed) {
    return {
      id: seed.id,
      name: seed.name,
      emoji: seed.emoji,
      description: seed.description,
      isCustom: false,
    };
  }
  if (isCustom && metaName) {
    return {
      id,
      name: metaName,
      emoji: "✨",
      description: metaDescription ?? "",
      isCustom: true,
    };
  }
  return null;
}

export function DessertTableLayoutTab({
  category,
}: {
  category: WorkspaceCategory;
}) {
  const reactions = useCakeSweetsStore((s) => s.dessert_catalog);
  const meta = useCakeSweetsStore((s) => s.dessert_meta);
  const tableConfig = useCakeSweetsStore((s) => s.table_config);
  const sharedAllergens = useCakeSweetsStore((s) => s.allergens.flags);
  const setTableConfig = useCakeSweetsStore((s) => s.setTableConfig);

  const loved = useMemo(() => {
    return Object.entries(reactions)
      .filter(([, r]) => r === "love")
      .map(([id]) =>
        resolveItem(
          id,
          meta[id]?.name,
          meta[id]?.description,
          meta[id]?.custom,
        ),
      )
      .filter((x): x is ResolvedItem => x !== null)
      .sort((a, b) => {
        if (a.isCustom !== b.isCustom) return a.isCustom ? 1 : -1;
        return a.name.localeCompare(b.name);
      });
  }, [reactions, meta]);

  const activeAllergens = useMemo(
    () => ALLERGEN_OPTIONS.filter((a) => sharedAllergens[a.id]),
    [sharedAllergens],
  );

  // Group items by chosen display style for the preview.
  const grouped = useMemo(() => {
    const g = new Map<string, ResolvedItem[]>();
    for (const item of loved) {
      const style = tableConfig[item.id]?.display_style ?? "unassigned";
      if (!g.has(style)) g.set(style, []);
      g.get(style)!.push(item);
    }
    return g;
  }, [loved, tableConfig]);

  return (
    <div className="space-y-5">
      <p className="max-w-3xl text-[13px] leading-relaxed text-ink-muted">
        Everything on the dessert table — heights, platters, stands, signage,
        replenishment crew, and when the table opens. Items flow in from the
        sweets you loved on the Mithai tab.
      </p>

      {activeAllergens.length > 0 && (
        <div className="flex items-start gap-2 rounded-md border border-amber-400 bg-amber-50/60 px-3 py-2">
          <ShieldAlert
            size={14}
            strokeWidth={1.8}
            className="mt-0.5 shrink-0 text-amber-700"
          />
          <p className="text-[12.5px] leading-snug text-amber-800">
            <span className="font-semibold">Dietary filters active:</span>{" "}
            {activeAllergens.map((a) => a.label).join(", ")}. Add visible
            signage for any nut / dairy / gluten content on the station.
          </p>
        </div>
      )}

      {/* Configuration list */}
      <PanelCard
        icon={<CakeSlice size={14} strokeWidth={1.8} />}
        title="Display configuration"
        badge={
          <span
            className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint"
            style={{ fontFamily: MONO_FAMILY }}
          >
            {loved.length} item{loved.length === 1 ? "" : "s"}
          </span>
        }
      >
        {loved.length === 0 ? (
          <p className="py-3 text-[12.5px] italic text-ink-faint">
            Nothing on the table yet. Head to the Mithai & Dessert Spread tab,
            browse the catalog, and tap Love on sweets you want served. They
            show up here automatically with fields for display style and
            placement.
          </p>
        ) : (
          <ul className="divide-y divide-border/60">
            {loved.map((item) => {
              const cfg = tableConfig[item.id] ?? {};
              return (
                <li key={item.id} className="py-3">
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
                    <div className="md:col-span-3 flex items-start gap-2">
                      <span className="shrink-0 text-xl leading-none">
                        {item.emoji}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-serif text-[14px] text-ink">
                          {item.name}
                        </p>
                        <p className="text-[11.5px] leading-snug text-ink-muted">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    <div className="md:col-span-3">
                      <Eyebrow className="mb-1">Display style</Eyebrow>
                      <select
                        value={cfg.display_style ?? ""}
                        onChange={(e) =>
                          setTableConfig(item.id, {
                            display_style: e.target.value || undefined,
                          })
                        }
                        className="w-full rounded-sm border border-border bg-white px-2 py-1 text-[12px] text-ink focus:border-saffron focus:outline-none"
                      >
                        <option value="">— choose —</option>
                        {DISPLAY_STYLES.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <Eyebrow className="mb-1">Table qty</Eyebrow>
                      <input
                        type="text"
                        value={cfg.quantity ?? ""}
                        onChange={(e) =>
                          setTableConfig(item.id, { quantity: e.target.value })
                        }
                        placeholder="100 pc"
                        className="w-full rounded-sm border border-border bg-white px-2 py-1 text-[12px] text-ink placeholder:text-ink-faint focus:border-saffron focus:outline-none"
                      />
                    </div>

                    <div className="md:col-span-4">
                      <Eyebrow className="mb-1">Placement / notes</Eyebrow>
                      <input
                        type="text"
                        value={cfg.placement ?? ""}
                        onChange={(e) =>
                          setTableConfig(item.id, { placement: e.target.value })
                        }
                        placeholder="Center of long table · gold stand · signage"
                        className="w-full rounded-sm border border-border bg-white px-2 py-1 text-[12.5px] text-ink placeholder:text-ink-faint focus:border-saffron focus:outline-none"
                      />
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </PanelCard>

      {/* Simple visual layout preview */}
      {loved.length > 0 && (
        <PanelCard
          icon={<LayoutGrid size={14} strokeWidth={1.8} />}
          title="Table preview"
        >
          <p className="mb-3 text-[12.5px] text-ink-muted">
            Items grouped by display style — a rough blueprint for your
            designer. Unassigned items sit to the side.
          </p>
          <TableLayoutPreview grouped={grouped} />
        </PanelCard>
      )}
    </div>
  );
}

// ── Simple visual layout (grouped chips by display style) ─────────────────

function TableLayoutPreview({
  grouped,
}: {
  grouped: Map<string, ResolvedItem[]>;
}) {
  const orderedKeys = [
    ...DISPLAY_STYLES.map((s) => s.id),
    "unassigned",
  ].filter((k) => grouped.has(k));

  if (orderedKeys.length === 0) {
    return (
      <p className="py-2 text-[12px] italic text-ink-faint">
        Assign display styles to see a preview.
      </p>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-md border border-gold/20 bg-gradient-to-br from-ivory-warm/40 via-white to-saffron-pale/20 p-4">
      {/* Table surface */}
      <div className="relative mx-auto max-w-3xl">
        <div className="flex flex-col gap-3">
          {orderedKeys.map((key) => {
            const items = grouped.get(key)!;
            const style = DISPLAY_STYLES.find((s) => s.id === key);
            const label = style?.label ?? "Unassigned";
            return (
              <div
                key={key}
                className={cn(
                  "rounded-md border border-dashed px-3 py-2.5",
                  key === "unassigned"
                    ? "border-ink-faint/40 bg-white/60"
                    : "border-gold/40 bg-white/80",
                )}
              >
                <div className="mb-1.5 flex items-center gap-2">
                  <span
                    className={cn(
                      "inline-block h-1.5 w-1.5 rounded-full",
                      key === "unassigned" ? "bg-ink-faint" : "bg-saffron",
                    )}
                  />
                  <Eyebrow>
                    {label} · {items.length}
                  </Eyebrow>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {items.map((it) => (
                    <span
                      key={it.id}
                      className="inline-flex items-center gap-1 rounded-full border border-border bg-white px-2 py-0.5 text-[11.5px] text-ink"
                    >
                      <span>{it.emoji}</span>
                      {it.name}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
