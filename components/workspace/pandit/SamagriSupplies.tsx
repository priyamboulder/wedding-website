"use client";

// ── Samagri & Supplies ────────────────────────────────────────────────────
// The procurement system. 50+ items across ~7 categories, each with a source,
// a responsible party, and a status. Missing samagri stops ceremonies — the
// stats strip surfaces bottlenecks; the table surfaces individual items.

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Circle,
  Plus,
  Sparkles,
  Truck,
  Wand2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePanditStore } from "@/stores/pandit-store";
import {
  CEREMONY_TRADITION_LABEL,
} from "@/types/pandit";
import type {
  SamagriCategory,
  SamagriItem,
  SamagriResponsibility,
  SamagriSource,
  SamagriStatus,
} from "@/types/pandit";
import {
  SAMAGRI_CATEGORY_LABEL,
  SAMAGRI_RESPONSIBILITY_LABEL,
  SAMAGRI_SOURCE_LABEL,
  SAMAGRI_STATUS_LABEL,
} from "@/types/pandit";
import {
  Eyebrow,
  MiniStat,
  PanelCard,
  SectionHeader,
} from "@/components/workspace/blocks/primitives";
import { BuildJourneyDualCTA } from "@/components/guided-journeys/officiant-build/BuildJourneyDualCTA";

const CATEGORIES: SamagriCategory[] = [
  "general_setup",
  "floral",
  "food_grain",
  "fabric",
  "metal_vessels",
  "personal_items",
  "other",
];

const STATUS_ORDER: SamagriStatus[] = [
  "needed",
  "sourced",
  "confirmed",
  "delivered",
];

// Items whose freshness window is measured in hours, not weeks. Flagged so
// they aren't procured too early and left to wilt before the ceremony.
const DAY_OF_FRESHNESS_KEYWORDS = [
  "garland",
  "flower",
  "petal",
  "mango leaves",
  "paan",
  "banana",
  "fruit",
  "leaf",
];

function needsDayOfFreshness(item: SamagriItem): boolean {
  const haystack = `${item.name_english} ${item.name_local} ${item.notes}`.toLowerCase();
  return DAY_OF_FRESHNESS_KEYWORDS.some((k) => haystack.includes(k));
}

export function SamagriSupplies() {
  const samagri = usePanditStore((s) => s.samagri);
  const rituals = usePanditStore((s) => s.rituals);
  const brief = usePanditStore((s) => s.brief);
  const updateSamagri = usePanditStore((s) => s.updateSamagri);
  const addSamagri = usePanditStore((s) => s.addSamagri);
  const deleteSamagri = usePanditStore((s) => s.deleteSamagri);
  const applyTraditionLibrary = usePanditStore(
    (s) => s.applyTraditionLibrary,
  );
  const [groupByRitual, setGroupByRitual] = useState(true);

  const [filterCategory, setFilterCategory] = useState<SamagriCategory | "all">(
    "all",
  );
  const [filterStatus, setFilterStatus] = useState<SamagriStatus | "all">("all");
  const [addingToCategory, setAddingToCategory] =
    useState<SamagriCategory | null>(null);
  const [newName, setNewName] = useState("");

  const stats = useMemo(() => {
    const byStatus: Record<SamagriStatus, number> = {
      needed: 0,
      sourced: 0,
      confirmed: 0,
      delivered: 0,
    };
    for (const s of samagri) byStatus[s.status]++;
    return byStatus;
  }, [samagri]);

  const addedByPandit = samagri.filter((s) => s.added_by_pandit).length;

  const dayOfFreshnessItems = useMemo(
    () =>
      samagri.filter(
        (s) => needsDayOfFreshness(s) && s.status !== "delivered",
      ),
    [samagri],
  );

  const procuredCount = samagri.filter(
    (s) => s.status === "confirmed" || s.status === "delivered",
  ).length;
  const remainingCount = samagri.length - procuredCount;

  const filtered = useMemo(() => {
    return samagri.filter((s) => {
      if (filterCategory !== "all" && s.category !== filterCategory)
        return false;
      if (filterStatus !== "all" && s.status !== filterStatus) return false;
      return true;
    });
  }, [samagri, filterCategory, filterStatus]);

  const byCategory = useMemo(() => {
    const map: Record<SamagriCategory, SamagriItem[]> = {
      general_setup: [],
      floral: [],
      food_grain: [],
      fabric: [],
      metal_vessels: [],
      personal_items: [],
      other: [],
    };
    for (const item of filtered) {
      map[item.category].push(item);
    }
    return map;
  }, [filtered]);

  return (
    <div className="space-y-6">
      <BuildJourneyDualCTA
        startAtSession="samagri_review"
        guidedHeading="Build the samagri list with us"
      />
      <SectionHeader
        eyebrow="Samagri & Supplies"
        title="Every item the ceremony needs, at the venue on time"
        description="Auto-populated from your selected tradition and rituals — most officiants give incomplete lists, so we're comprehensive on purpose. Track every item from 'needed' to 'delivered'. Officiant-provided items are flagged so you know what's on them vs. you."
      />

      {/* ── AI-generated list banner ───────────────────────────────────── */}
      <div className="flex flex-wrap items-start gap-3 rounded-md border border-gold/40 bg-ivory-warm/40 p-3">
        <span className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-md bg-saffron/15 text-saffron">
          <Sparkles size={12} strokeWidth={1.6} />
        </span>
        <div className="flex-1 min-w-[240px]">
          <div className="text-[12.5px] font-medium text-ink">
            Samagri list for{" "}
            {CEREMONY_TRADITION_LABEL[brief.tradition]}
          </div>
          <p className="mt-0.5 text-[11.5px] text-ink-muted">
            Each item is linked to the ritual it serves, so skipping a ritual
            in Vision & Ceremony Brief prunes its samagri automatically. Tap
            &quot;Regenerate&quot; to reset to the tradition defaults.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setGroupByRitual((v) => !v)}
            className="rounded-md border border-border bg-white px-2.5 py-1.5 text-[11.5px] font-medium text-ink-muted hover:border-saffron/40 hover:text-saffron"
          >
            {groupByRitual ? "Group by category" : "Group by ritual"}
          </button>
          <button
            type="button"
            onClick={() => {
              if (
                confirm(
                  "Regenerate the samagri list for the current tradition? Any custom items you've added will be removed.",
                )
              ) {
                applyTraditionLibrary(brief.tradition, {
                  preserveCoupleNotes: true,
                });
              }
            }}
            className="inline-flex items-center gap-1.5 rounded-md bg-ink px-2.5 py-1.5 text-[11.5px] font-medium text-ivory hover:bg-ink-soft"
          >
            <Wand2 size={11} strokeWidth={1.8} />
            Regenerate
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <MiniStat
          label="Total items"
          value={samagri.length}
          hint="Across all categories"
        />
        <MiniStat
          label="Needed"
          value={stats.needed}
          hint="Not yet sourced"
          tone={stats.needed > 10 ? "rose" : "saffron"}
        />
        <MiniStat
          label="Sourced"
          value={stats.sourced}
          hint="Purchased — not yet confirmed"
        />
        <MiniStat
          label="Delivered"
          value={stats.delivered}
          hint="At venue"
          tone="sage"
        />
        <MiniStat
          label="Added by officiant"
          value={addedByPandit}
          hint="Required by officiant"
        />
      </div>

      {/* ── Procurement summary banner ────────────────────────────────── */}
      <div className="rounded-md border border-gold/30 bg-ivory-warm/40 p-3.5">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12px]">
          <span className="inline-flex items-center gap-1.5">
            <CheckCircle2 size={12} strokeWidth={1.8} className="text-sage" />
            <span className="text-ink">
              Procured:{" "}
              <span className="font-medium">{procuredCount} items</span>
            </span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Circle size={12} strokeWidth={1.8} className="text-ink-muted" />
            <span className="text-ink">
              Remaining:{" "}
              <span className="font-medium">{remainingCount} items</span>
            </span>
          </span>
          {dayOfFreshnessItems.length > 0 && (
            <span className="inline-flex items-center gap-1.5">
              <AlertTriangle
                size={12}
                strokeWidth={1.8}
                className="text-amber-600"
              />
              <span className="text-ink">
                <span className="font-medium">
                  {dayOfFreshnessItems.length}
                </span>{" "}
                need day-of freshness
              </span>
            </span>
          )}
        </div>
        {dayOfFreshnessItems.length > 0 && (
          <p className="mt-1.5 text-[11px] text-ink-muted">
            Fresh items —{" "}
            {dayOfFreshnessItems
              .slice(0, 5)
              .map((i) => i.name_english.toLowerCase())
              .join(", ")}
            {dayOfFreshnessItems.length > 5
              ? `, +${dayOfFreshnessItems.length - 5} more`
              : ""}{" "}
            — source on ceremony day or T−1 only.
          </p>
        )}
      </div>

      {/* ── Filters ────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2">
        <Eyebrow>Filter</Eyebrow>
        <FilterPill
          active={filterCategory === "all"}
          onClick={() => setFilterCategory("all")}
          label="All categories"
        />
        {CATEGORIES.map((c) => (
          <FilterPill
            key={c}
            active={filterCategory === c}
            onClick={() => setFilterCategory(c)}
            label={SAMAGRI_CATEGORY_LABEL[c]}
          />
        ))}
        <span className="mx-2 h-4 w-px bg-border" />
        <FilterPill
          active={filterStatus === "all"}
          onClick={() => setFilterStatus("all")}
          label="All status"
        />
        {STATUS_ORDER.map((s) => (
          <FilterPill
            key={s}
            active={filterStatus === s}
            onClick={() => setFilterStatus(s)}
            label={SAMAGRI_STATUS_LABEL[s]}
          />
        ))}
      </div>

      {/* ── Grouped-by-ritual view ────────────────────────────────────── */}
      {groupByRitual && (
        <RitualGroupedView
          samagri={filtered}
          rituals={rituals}
          updateSamagri={updateSamagri}
          deleteSamagri={deleteSamagri}
        />
      )}

      {/* ── Category panels ───────────────────────────────────────────── */}
      {!groupByRitual && CATEGORIES.map((cat) => {
        const items = byCategory[cat];
        if (filterCategory !== "all" && filterCategory !== cat) return null;
        if (items.length === 0 && filterStatus !== "all") return null;
        return (
          <PanelCard
            key={cat}
            icon={<Truck size={14} strokeWidth={1.6} />}
            title={SAMAGRI_CATEGORY_LABEL[cat]}
            badge={
              <button
                type="button"
                onClick={() => {
                  setAddingToCategory(
                    addingToCategory === cat ? null : cat,
                  );
                  setNewName("");
                }}
                className="inline-flex items-center gap-1 rounded-sm border border-border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted hover:border-saffron/40 hover:text-saffron"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                <Plus size={10} strokeWidth={2} />
                Add item
              </button>
            }
          >
            {addingToCategory === cat && (
              <div className="mb-3 flex items-center gap-2">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Item name"
                  className="flex-1 rounded-md border border-border bg-white px-3 py-2 text-[12.5px] text-ink focus:border-saffron focus:outline-none"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newName.trim()) {
                      addSamagri(newName.trim(), cat);
                      setNewName("");
                      setAddingToCategory(null);
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newName.trim()) {
                      addSamagri(newName.trim(), cat);
                      setNewName("");
                      setAddingToCategory(null);
                    }
                  }}
                  className="rounded-md bg-ink px-3 py-2 text-[12px] font-medium text-ivory hover:bg-ink-soft"
                >
                  Add
                </button>
              </div>
            )}
            {items.length === 0 ? (
              <p className="text-[12px] italic text-ink-faint">
                No items in this category{filterStatus !== "all" ? " matching the filter" : ""}.
              </p>
            ) : (
              <div className="overflow-hidden rounded-md border border-border">
                <table className="w-full text-[12px]">
                  <thead className="bg-ivory-warm/40 text-left">
                    <tr className="text-[10px] uppercase tracking-[0.12em] text-ink-muted">
                      <th className="px-3 py-2 font-medium">Item</th>
                      <th className="px-3 py-2 font-medium">Used for</th>
                      <th className="px-3 py-2 font-medium">Qty</th>
                      <th className="px-3 py-2 font-medium">Source</th>
                      <th className="px-3 py-2 font-medium">Who</th>
                      <th className="px-3 py-2 font-medium">Status</th>
                      <th className="px-3 py-2" />
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => {
                      const ritual = rituals.find(
                        (r) => r.id === item.used_for_ritual_id,
                      );
                      return (
                        <tr
                          key={item.id}
                          className="border-t border-border/60 hover:bg-ivory-warm/20"
                        >
                          <td className="px-3 py-2">
                            <div className="font-medium text-ink">
                              {item.name_english}
                              {item.added_by_pandit && (
                                <span
                                  className="ml-1.5 rounded-sm bg-saffron-pale/60 px-1 py-0.5 font-mono text-[8.5px] uppercase tracking-[0.12em] text-saffron"
                                  style={{ fontFamily: "var(--font-mono)" }}
                                >
                                  officiant
                                </span>
                              )}
                            </div>
                            {item.name_local && (
                              <div
                                className="text-[10.5px] text-ink-muted"
                                style={{ fontFamily: "var(--font-mono)" }}
                              >
                                {item.name_local}
                              </div>
                            )}
                          </td>
                          <td className="px-3 py-2 text-ink-muted">
                            {ritual
                              ? ritual.name_english
                              : item.used_for_label || "—"}
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="text"
                              value={item.quantity}
                              onChange={(e) =>
                                updateSamagri(item.id, {
                                  quantity: e.target.value,
                                })
                              }
                              className="w-full rounded-sm border border-transparent bg-transparent px-1 py-0.5 text-[11.5px] text-ink hover:border-border focus:border-saffron focus:outline-none"
                              placeholder="—"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <select
                              value={item.source}
                              onChange={(e) =>
                                updateSamagri(item.id, {
                                  source: e.target.value as SamagriSource,
                                })
                              }
                              className="rounded-sm border border-transparent bg-transparent px-1 py-0.5 text-[11.5px] text-ink-muted hover:border-border focus:border-saffron focus:outline-none"
                            >
                              {(
                                Object.keys(
                                  SAMAGRI_SOURCE_LABEL,
                                ) as SamagriSource[]
                              ).map((s) => (
                                <option key={s} value={s}>
                                  {SAMAGRI_SOURCE_LABEL[s]}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="px-3 py-2">
                            <select
                              value={item.responsibility}
                              onChange={(e) =>
                                updateSamagri(item.id, {
                                  responsibility: e.target
                                    .value as SamagriResponsibility,
                                })
                              }
                              className="rounded-sm border border-transparent bg-transparent px-1 py-0.5 text-[11.5px] text-ink-muted hover:border-border focus:border-saffron focus:outline-none"
                            >
                              {(
                                Object.keys(
                                  SAMAGRI_RESPONSIBILITY_LABEL,
                                ) as SamagriResponsibility[]
                              ).map((r) => (
                                <option key={r} value={r}>
                                  {SAMAGRI_RESPONSIBILITY_LABEL[r]}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="px-3 py-2">
                            <StatusPill
                              value={item.status}
                              onChange={(v) =>
                                updateSamagri(item.id, { status: v })
                              }
                            />
                          </td>
                          <td className="px-3 py-2 text-right">
                            <button
                              type="button"
                              onClick={() => {
                                if (
                                  confirm(`Delete "${item.name_english}"?`)
                                ) {
                                  deleteSamagri(item.id);
                                }
                              }}
                              className="text-[10px] font-medium text-ink-muted hover:text-rose"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </PanelCard>
        );
      })}

      {/* ── Procurement reminders ─────────────────────────────────────── */}
      <PanelCard
        icon={<AlertTriangle size={14} strokeWidth={1.6} />}
        title="Procurement cadence"
      >
        <ul className="space-y-2 text-[12.5px] text-ink">
          <li className="flex gap-2">
            <span
              className="font-mono text-[10.5px] text-ink-muted"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              T−28
            </span>
            Review samagri list with officiant. Confirm tradition-specific items.
          </li>
          <li className="flex gap-2">
            <span
              className="font-mono text-[10.5px] text-ink-muted"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              T−14
            </span>
            Begin purchasing. Check availability at local Indian stores —
            rare items may need online orders.
          </li>
          <li className="flex gap-2">
            <span
              className="font-mono text-[10.5px] text-ink-muted"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              T−7
            </span>
            All items "sourced" by this point. Flag anything still "needed"
            with the officiant.
          </li>
          <li className="flex gap-2">
            <span
              className="font-mono text-[10.5px] text-ink-muted"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              T−1
            </span>
            Deliver samagri to venue. Confirm placement with officiant's
            assistant.
          </li>
        </ul>
      </PanelCard>
    </div>
  );
}

// ── Grouped-by-ritual rendering ─────────────────────────────────────────
// Lets couples see "what do I need for Kanyadaan?" at a glance — which is
// the mental model they arrive with. Skipped rituals show a muted "skip"
// note so couples don't accidentally buy garlands for a ceremony they've
// cut.

function RitualGroupedView({
  samagri,
  rituals,
  updateSamagri,
  deleteSamagri,
}: {
  samagri: SamagriItem[];
  rituals: import("@/types/pandit").CeremonyRitual[];
  updateSamagri: (id: string, patch: Partial<SamagriItem>) => void;
  deleteSamagri: (id: string) => void;
}) {
  const byRitual = useMemo(() => {
    const map = new Map<string, SamagriItem[]>();
    const orphan: SamagriItem[] = [];
    for (const item of samagri) {
      if (item.used_for_ritual_id) {
        const list = map.get(item.used_for_ritual_id) ?? [];
        list.push(item);
        map.set(item.used_for_ritual_id, list);
      } else {
        orphan.push(item);
      }
    }
    return { map, orphan };
  }, [samagri]);

  const orderedRituals = useMemo(
    () => [...rituals].sort((a, b) => a.sort_order - b.sort_order),
    [rituals],
  );

  return (
    <div className="space-y-3">
      {orderedRituals.map((ritual) => {
        const items = byRitual.map.get(ritual.id);
        if (!items || items.length === 0) return null;
        const skipped = ritual.inclusion === "no";
        return (
          <section
            key={ritual.id}
            className={cn(
              "rounded-md border p-3",
              skipped
                ? "border-dashed border-stone-300 bg-ivory-warm/20 opacity-70"
                : "border-border bg-white",
            )}
          >
            <header className="mb-2 flex items-center justify-between gap-2">
              <div>
                <div className="font-serif text-[14px] leading-tight text-ink">
                  {ritual.name_english}
                  <span
                    className="ml-2 font-mono text-[10px] text-ink-muted"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {ritual.name_sanskrit}
                  </span>
                </div>
                <div className="text-[11px] text-ink-muted">
                  {items.length} item{items.length === 1 ? "" : "s"}
                </div>
              </div>
              {skipped && (
                <span className="rounded-sm bg-stone-200 px-1.5 py-0.5 text-[10px] font-medium text-stone-700">
                  ritual skipped — these items may not be needed
                </span>
              )}
            </header>
            <ul className="space-y-1">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-sm px-1 py-1 text-[12px] hover:bg-ivory-warm/40"
                >
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={
                        item.status === "confirmed" ||
                        item.status === "delivered"
                      }
                      onChange={(e) =>
                        updateSamagri(item.id, {
                          status: e.target.checked ? "confirmed" : "needed",
                        })
                      }
                      className="h-3.5 w-3.5 rounded border-border text-saffron focus:ring-saffron"
                    />
                    <span
                      className={cn(
                        "text-ink",
                        (item.status === "confirmed" ||
                          item.status === "delivered") &&
                          "line-through text-ink-muted",
                      )}
                    >
                      {item.name_english}
                    </span>
                  </label>
                  {item.name_local && (
                    <span
                      className="font-mono text-[10px] text-ink-muted"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {item.name_local}
                    </span>
                  )}
                  <span
                    className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {item.quantity || "—"}
                  </span>
                  {item.added_by_pandit && (
                    <span
                      className="rounded-sm bg-saffron-pale/60 px-1 py-0.5 font-mono text-[9px] uppercase tracking-[0.12em] text-saffron"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      officiant provides
                    </span>
                  )}
                  <span className="ml-auto text-[11px] text-ink-muted">
                    {SAMAGRI_SOURCE_LABEL[item.source]}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Remove "${item.name_english}"?`)) {
                        deleteSamagri(item.id);
                      }
                    }}
                    className="text-[10px] font-medium text-ink-muted hover:text-rose"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
      {byRitual.orphan.length > 0 && (
        <section className="rounded-md border border-border bg-white p-3">
          <header className="mb-2">
            <div className="font-serif text-[14px] leading-tight text-ink">
              General & unallocated
            </div>
            <div className="text-[11px] text-ink-muted">
              Items that apply across the ceremony or aren't linked to a
              specific ritual.
            </div>
          </header>
          <ul className="space-y-1">
            {byRitual.orphan.map((item) => (
              <li
                key={item.id}
                className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-sm px-1 py-1 text-[12px] hover:bg-ivory-warm/40"
              >
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={
                      item.status === "confirmed" ||
                      item.status === "delivered"
                    }
                    onChange={(e) =>
                      updateSamagri(item.id, {
                        status: e.target.checked ? "confirmed" : "needed",
                      })
                    }
                    className="h-3.5 w-3.5 rounded border-border text-saffron focus:ring-saffron"
                  />
                  <span
                    className={cn(
                      "text-ink",
                      (item.status === "confirmed" ||
                        item.status === "delivered") &&
                        "line-through text-ink-muted",
                    )}
                  >
                    {item.name_english}
                  </span>
                </label>
                <span
                  className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {item.quantity || "—"}
                </span>
                <span className="ml-auto text-[11px] text-ink-muted">
                  {SAMAGRI_SOURCE_LABEL[item.source]}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

// ── UI primitives ───────────────────────────────────────────────────────

function FilterPill({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors",
        active
          ? "border-saffron bg-saffron-pale/50 text-saffron"
          : "border-border bg-white text-ink-muted hover:border-saffron/30",
      )}
    >
      {label}
    </button>
  );
}

function StatusPill({
  value,
  onChange,
}: {
  value: SamagriStatus;
  onChange: (v: SamagriStatus) => void;
}) {
  const toneClass: Record<SamagriStatus, string> = {
    needed: "bg-amber-100 text-amber-800",
    sourced: "bg-sage-pale/60 text-sage",
    confirmed: "bg-saffron-pale/60 text-saffron",
    delivered: "bg-ink text-ivory",
  };
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as SamagriStatus)}
      className={cn(
        "rounded-sm border-0 px-1.5 py-0.5 text-[10.5px] font-medium focus:outline-none focus:ring-1 focus:ring-saffron",
        toneClass[value],
      )}
    >
      {(Object.keys(SAMAGRI_STATUS_LABEL) as SamagriStatus[]).map((s) => (
        <option key={s} value={s}>
          {SAMAGRI_STATUS_LABEL[s]}
        </option>
      ))}
    </select>
  );
}
