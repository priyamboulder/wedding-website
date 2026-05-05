"use client";

// ── Build Session 3 · Samagri & supplies ─────────────────────────────────
// Reads & writes through `usePanditStore` so this session is in permanent
// two-way sync with Tab 5 of the full workspace. Items are pre-seeded from
// the tradition's samagri library (filtered by which rituals are
// `including`). The procurement cadence — T-28 review, T-14 purchase, T-7
// chase, T-1 delivery — is editable but the four checkpoints are fixed.

import { useMemo, useState } from "react";
import { Calendar, Filter, Flame, Plus, RefreshCw, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePanditStore } from "@/stores/pandit-store";
import {
  SAMAGRI_CATEGORY_LABEL,
  SAMAGRI_RESPONSIBILITY_LABEL,
  SAMAGRI_SOURCE_LABEL,
  SAMAGRI_STATUS_LABEL,
  type SamagriCategory,
  type SamagriItem,
  type SamagriSource,
  type SamagriStatus,
} from "@/types/pandit";
import {
  Eyebrow,
  MiniStat,
  PanelCard,
} from "@/components/workspace/blocks/primitives";
import { DEFAULT_PROCUREMENT_CADENCE } from "@/lib/guided-journeys/officiant-build";

const STATUS_TONE: Record<SamagriStatus, string> = {
  needed: "border-amber-400/60 bg-amber-50/60 text-amber-700",
  sourced: "border-saffron/40 bg-saffron-pale/30 text-saffron",
  confirmed: "border-sage/40 bg-sage-pale/30 text-sage",
  delivered: "border-emerald-400/40 bg-emerald-50 text-emerald-700",
};

export function SamagriReviewSession() {
  const samagri = usePanditStore((s) => s.samagri);
  const rituals = usePanditStore((s) => s.rituals);
  const brief = usePanditStore((s) => s.brief);
  const updateSamagri = usePanditStore((s) => s.updateSamagri);
  const addSamagri = usePanditStore((s) => s.addSamagri);
  const deleteSamagri = usePanditStore((s) => s.deleteSamagri);
  const applyTraditionLibrary = usePanditStore((s) => s.applyTraditionLibrary);

  const [statusFilter, setStatusFilter] = useState<SamagriStatus | "all">(
    "all",
  );
  const [groupBy, setGroupBy] = useState<"ritual" | "category">("ritual");
  const [newName, setNewName] = useState("");
  const [cadence, setCadence] = useState(DEFAULT_PROCUREMENT_CADENCE);

  // Filter out items linked to skipped rituals — couple shouldn't have to
  // chase samagri for things they're not doing.
  const visibleSamagri = useMemo(() => {
    const skipped = new Set(
      rituals.filter((r) => r.inclusion === "no").map((r) => r.id),
    );
    return samagri.filter((item) => {
      if (item.used_for_ritual_id && skipped.has(item.used_for_ritual_id)) {
        return false;
      }
      if (statusFilter !== "all" && item.status !== statusFilter) return false;
      return true;
    });
  }, [samagri, rituals, statusFilter]);

  const stats = useMemo(() => {
    const visible = visibleSamagri;
    return {
      total: visible.length,
      needed: visible.filter((i) => i.status === "needed").length,
      sourced: visible.filter((i) => i.status === "sourced").length,
      confirmed: visible.filter((i) => i.status === "confirmed").length,
      delivered: visible.filter((i) => i.status === "delivered").length,
      pandit: visible.filter((i) => i.source === "pandit_provides").length,
    };
  }, [visibleSamagri]);

  const grouped = useMemo(() => {
    const groups: Record<string, { label: string; items: SamagriItem[] }> = {};
    if (groupBy === "ritual") {
      for (const item of visibleSamagri) {
        const ritual = rituals.find((r) => r.id === item.used_for_ritual_id);
        const key = ritual?.id ?? "_unallocated";
        const label = ritual?.name_english ?? "Unallocated · general";
        groups[key] ??= { label, items: [] };
        groups[key]!.items.push(item);
      }
    } else {
      for (const item of visibleSamagri) {
        const key = item.category;
        groups[key] ??= {
          label: SAMAGRI_CATEGORY_LABEL[item.category],
          items: [],
        };
        groups[key]!.items.push(item);
      }
    }
    return groups;
  }, [visibleSamagri, rituals, groupBy]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <MiniStat
          label="Total items"
          value={stats.total}
          hint="Across rituals you're doing"
        />
        <MiniStat
          label="Needed"
          value={stats.needed}
          hint={stats.needed === 0 ? "All sourced" : "Source these next"}
          tone={stats.needed === 0 ? "sage" : "saffron"}
        />
        <MiniStat
          label="Sourced + confirmed"
          value={stats.sourced + stats.confirmed}
          hint="Lined up"
        />
        <MiniStat
          label="Officiant brings"
          value={stats.pandit}
          hint="One less to source"
          tone="rose"
        />
      </div>

      {/* ── Controls ─────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3 rounded-md border border-border bg-ivory-warm/30 px-3 py-2.5">
        <div className="flex items-center gap-2 text-[11.5px] text-ink-muted">
          <Filter size={12} strokeWidth={1.8} />
          <span>Status</span>
        </div>
        {(["all", "needed", "sourced", "confirmed", "delivered"] as const).map(
          (s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              className={cn(
                "rounded-full border px-2.5 py-0.5 text-[11px] capitalize transition-colors",
                statusFilter === s
                  ? "border-saffron bg-saffron-pale/40 text-saffron"
                  : "border-border bg-white text-ink-muted hover:border-saffron/40",
              )}
            >
              {s}
            </button>
          ),
        )}
        <div className="ml-auto flex items-center gap-1.5 text-[11.5px] text-ink-muted">
          <span>Group by</span>
          <button
            type="button"
            onClick={() =>
              setGroupBy(groupBy === "ritual" ? "category" : "ritual")
            }
            className="rounded-full border border-border bg-white px-2.5 py-0.5 text-[11px] text-ink-muted hover:border-saffron/40"
          >
            {groupBy === "ritual" ? "Ritual" : "Category"} ↺
          </button>
        </div>
      </div>

      {/* ── Regenerate-from-tradition CTA ────────────────────────── */}
      <div className="flex flex-wrap items-start gap-3 rounded-md border border-gold/40 bg-ivory-warm/40 p-3">
        <span className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-md bg-saffron/15 text-saffron">
          <RefreshCw size={12} strokeWidth={1.6} />
        </span>
        <div className="flex-1 min-w-[200px]">
          <div className="text-[12.5px] font-medium text-ink">
            Regenerate from tradition
          </div>
          <p className="mt-0.5 text-[11.5px] text-ink-muted">
            Replaces the samagri list with the {brief.tradition} defaults.
            Custom additions and notes are preserved where item ids match.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            if (
              confirm(
                "Regenerate the samagri list from the tradition library? Custom additions are preserved where they match.",
              )
            ) {
              applyTraditionLibrary(brief.tradition, {
                preserveCoupleNotes: true,
                resetSamagri: true,
              });
            }
          }}
          className="inline-flex items-center gap-1.5 rounded-md bg-ink px-3 py-2 text-[12px] font-medium text-ivory hover:bg-ink-soft"
        >
          Regenerate
        </button>
      </div>

      {/* ── Grouped item list ────────────────────────────────────── */}
      <div className="space-y-4">
        {Object.entries(grouped).length === 0 && (
          <div className="rounded-md border border-dashed border-border bg-ivory-warm/40 px-3 py-6 text-center text-[12.5px] italic text-ink-muted">
            No samagri items match the current filter.
          </div>
        )}
        {Object.entries(grouped).map(([key, group]) => (
          <PanelCard key={key} title={group.label}>
            <ul className="divide-y divide-border/60">
              {group.items.map((item) => (
                <li key={item.id} className="py-2.5">
                  <div className="grid gap-2 md:grid-cols-[1.4fr_0.8fr_1fr_1fr_28px] md:items-center">
                    <div>
                      <div className="font-serif text-[14px] text-ink">
                        {item.name_english}
                        {item.name_local && (
                          <span
                            className="ml-2 font-mono text-[10px] text-ink-muted"
                            style={{ fontFamily: "var(--font-mono)" }}
                          >
                            {item.name_local}
                          </span>
                        )}
                      </div>
                      <input
                        value={item.quantity}
                        onChange={(e) =>
                          updateSamagri(item.id, { quantity: e.target.value })
                        }
                        placeholder="Quantity"
                        className="mt-1 w-full rounded border border-transparent bg-transparent px-1.5 py-0.5 text-[11.5px] text-ink-muted hover:border-border focus:border-saffron focus:bg-white focus:outline-none"
                      />
                    </div>
                    <select
                      value={item.source}
                      onChange={(e) =>
                        updateSamagri(item.id, {
                          source: e.target.value as SamagriSource,
                        })
                      }
                      className="rounded-md border border-border bg-white px-2 py-1 text-[11.5px] focus:border-saffron focus:outline-none"
                    >
                      {(
                        Object.keys(SAMAGRI_SOURCE_LABEL) as SamagriSource[]
                      ).map((s) => (
                        <option key={s} value={s}>
                          {SAMAGRI_SOURCE_LABEL[s]}
                        </option>
                      ))}
                    </select>
                    <select
                      value={item.responsibility}
                      onChange={(e) =>
                        updateSamagri(item.id, {
                          responsibility: e.target
                            .value as SamagriItem["responsibility"],
                        })
                      }
                      className="rounded-md border border-border bg-white px-2 py-1 text-[11.5px] focus:border-saffron focus:outline-none"
                    >
                      {(
                        Object.keys(
                          SAMAGRI_RESPONSIBILITY_LABEL,
                        ) as SamagriItem["responsibility"][]
                      ).map((s) => (
                        <option key={s} value={s}>
                          {SAMAGRI_RESPONSIBILITY_LABEL[s]}
                        </option>
                      ))}
                    </select>
                    <select
                      value={item.status}
                      onChange={(e) =>
                        updateSamagri(item.id, {
                          status: e.target.value as SamagriStatus,
                        })
                      }
                      className={cn(
                        "rounded-md border px-2 py-1 text-[11.5px] capitalize focus:outline-none",
                        STATUS_TONE[item.status],
                      )}
                    >
                      {(
                        Object.keys(SAMAGRI_STATUS_LABEL) as SamagriStatus[]
                      ).map((s) => (
                        <option key={s} value={s}>
                          {SAMAGRI_STATUS_LABEL[s]}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => deleteSamagri(item.id)}
                      aria-label="Remove item"
                      className="ml-auto rounded p-1 text-ink-faint hover:bg-ivory-warm/70 hover:text-rose"
                    >
                      <Trash2 size={12} strokeWidth={1.8} />
                    </button>
                  </div>
                  {item.source === "pandit_provides" && (
                    <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-rose-pale/40 px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.12em] text-rose">
                      <Flame size={9} strokeWidth={1.8} /> Officiant brings
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </PanelCard>
        ))}
      </div>

      {/* ── Manual add ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-2">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Add a custom samagri item…"
          className="flex-1 rounded-md border border-border bg-white px-2.5 py-1.5 text-[12px] focus:border-saffron focus:outline-none"
          onKeyDown={(e) => {
            if (e.key === "Enter" && newName.trim()) {
              addSamagri(newName.trim(), "general_setup");
              setNewName("");
            }
          }}
        />
        <button
          type="button"
          onClick={() => {
            if (newName.trim()) {
              addSamagri(newName.trim(), "general_setup");
              setNewName("");
            }
          }}
          className="inline-flex items-center gap-1 rounded-md bg-ink px-3 py-1.5 text-[12px] font-medium text-ivory hover:bg-ink-soft"
        >
          <Plus size={12} strokeWidth={2} /> Add
        </button>
      </div>

      {/* ── Procurement cadence ─────────────────────────────────────── */}
      <PanelCard
        icon={<Calendar size={14} strokeWidth={1.6} />}
        title="Procurement cadence"
      >
        <p className="mb-3 text-[12.5px] text-ink-muted">
          Four checkpoints between booking your officiant and ceremony day.
          Edit the language; the timing is fixed.
        </p>
        <div className="space-y-3">
          {(
            [
              ["t_minus_28_review", "T-28", "4 weeks out"],
              ["t_minus_14_purchase", "T-14", "2 weeks out"],
              ["t_minus_7_sourced_check", "T-7", "1 week out"],
              ["t_minus_1_delivery", "T-1", "Day before"],
            ] as const
          ).map(([key, label, when]) => (
            <div key={key}>
              <Eyebrow className="mb-1">
                {label} · {when}
              </Eyebrow>
              <textarea
                value={cadence[key]}
                onChange={(e) =>
                  setCadence((prev) => ({ ...prev, [key]: e.target.value }))
                }
                rows={2}
                className="w-full rounded-md border border-border bg-white px-2.5 py-1.5 text-[12px] focus:border-saffron focus:outline-none"
              />
            </div>
          ))}
        </div>
      </PanelCard>
    </div>
  );
}
