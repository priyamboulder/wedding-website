"use client";

// ── Fittings Timeline ──────────────────────────────────────────────────────
// The bride's fitting journey has structure: first (8w out), second (5w),
// final (2w), pickup (1w). Other people usually need only one or two. This
// tab scaffolds the bride's three-point schedule as pinned rows and keeps
// a free list for everyone else.
//
// All fittings are WorkspaceItems with tab: "fittings", block_type:
// "fitting". Meta shape:
//   person:   string (Bride | Groom | Mother of Bride | …)
//   stage:    "first" | "second" | "final" | "pickup" | "single"
//   date:     yyyy-mm-dd
//   location: string
//   notes:    string
//   status:   "upcoming" | "done"

import { useMemo, useState } from "react";
import { CalendarClock, Check, Plus, Scissors, Trash2 } from "lucide-react";
import { useWorkspaceStore } from "@/stores/workspace-store";
import type { WorkspaceCategory, WorkspaceItem } from "@/types/workspace";
import { PanelCard, Eyebrow } from "@/components/workspace/blocks/primitives";
import { cn } from "@/lib/utils";

type Stage = "first" | "second" | "final" | "pickup" | "single";
type FitStatus = "upcoming" | "done";

interface FitMeta {
  person?: string;
  stage?: Stage;
  date?: string;
  location?: string;
  notes?: string;
  status?: FitStatus;
}

const BRIDE_STAGES: { stage: Stage; label: string; when: string; hint: string }[] = [
  {
    stage: "first",
    label: "First fitting",
    when: "8 weeks before",
    hint: "Overall fit + silhouette check. Embroidery is often still drying at this point.",
  },
  {
    stage: "second",
    label: "Second fitting",
    when: "5 weeks before",
    hint: "Detail adjustments. Lock embroidery add-ons. Confirm shoes so the hem is right.",
  },
  {
    stage: "final",
    label: "Final fitting",
    when: "2 weeks before",
    hint: "Everything perfect. After this, no more changes — heavy embroidery risks damage.",
  },
  {
    stage: "pickup",
    label: "Pickup",
    when: "1 week before",
    hint: "Take home. Store flat. Steam only — never iron.",
  },
];

export function FittingsTimeline({
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

  const fittings = useMemo(
    () =>
      items.filter(
        (i) =>
          i.category_id === category.id &&
          i.tab === "fittings" &&
          i.block_type === "fitting",
      ),
    [items, category.id],
  );

  const brideFittings = useMemo(() => {
    const map = new Map<Stage, WorkspaceItem>();
    for (const f of fittings) {
      const m = f.meta as FitMeta;
      if (m.person === "Bride" && m.stage && m.stage !== "single") {
        map.set(m.stage, f);
      }
    }
    return map;
  }, [fittings]);

  const otherFittings = useMemo(
    () =>
      fittings
        .filter((f) => {
          const m = f.meta as FitMeta;
          return m.person !== "Bride" || m.stage === "single";
        })
        .sort((a, b) => {
          const ad = (a.meta as FitMeta).date ?? "";
          const bd = (b.meta as FitMeta).date ?? "";
          return ad.localeCompare(bd);
        }),
    [fittings],
  );

  const patch = (id: string, p: Partial<FitMeta>) => {
    const it = items.find((x) => x.id === id);
    if (!it) return;
    updateItem(id, { meta: { ...(it.meta ?? {}), ...p } });
  };

  const createBrideStage = (stage: Stage) => {
    if (!canEdit) return;
    addItem({
      category_id: category.id,
      tab: "fittings",
      block_type: "fitting",
      title: `Bride — ${stage}`,
      meta: { person: "Bride", stage, status: "upcoming" } satisfies FitMeta,
      sort_order: items.length + 1,
    });
  };

  const createOther = () => {
    if (!canEdit) return;
    addItem({
      category_id: category.id,
      tab: "fittings",
      block_type: "fitting",
      title: "New fitting",
      meta: { stage: "single", status: "upcoming" } satisfies FitMeta,
      sort_order: items.length + 1,
    });
  };

  return (
    <div className="space-y-5">
      <p className="max-w-3xl text-[13px] leading-relaxed text-ink-muted">
        The bride's fitting arc is three rounds + pickup — never compress it.
        Everyone else usually needs one session. Book fittings with at least
        two weeks of float before the wedding week.
      </p>

      <PanelCard
        icon={<Scissors size={14} strokeWidth={1.8} />}
        title="Bride's fitting arc"
      >
        <ul className="divide-y divide-border/60">
          {BRIDE_STAGES.map(({ stage, label, when, hint }) => {
            const item = brideFittings.get(stage);
            const meta = (item?.meta ?? {}) as FitMeta;
            const done = meta.status === "done";
            return (
              <li key={stage} className="py-3.5">
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      item
                        ? patch(item.id, {
                            status: done ? "upcoming" : "done",
                          })
                        : undefined
                    }
                    disabled={!canEdit || !item}
                    className={cn(
                      "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors",
                      done
                        ? "border-sage bg-sage-pale/70 text-sage"
                        : "border-border bg-white text-ink-faint",
                      !item && "opacity-50",
                    )}
                    aria-label={done ? "Mark upcoming" : "Mark done"}
                  >
                    {done && <Check size={11} strokeWidth={2.2} />}
                  </button>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h5 className="text-[13px] font-medium text-ink">
                        {label}
                      </h5>
                      <span
                        className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint"
                        style={{ fontFamily: "var(--font-mono)" }}
                      >
                        {when}
                      </span>
                    </div>
                    <p className="mt-1 text-[11.5px] leading-relaxed text-ink-muted">
                      {hint}
                    </p>
                    {item ? (
                      <div className="mt-2.5 grid grid-cols-1 gap-2 md:grid-cols-3">
                        <input
                          type="date"
                          value={meta.date ?? ""}
                          onChange={(e) => patch(item.id, { date: e.target.value })}
                          disabled={!canEdit}
                          className="rounded-sm border border-border bg-white px-2 py-1 font-mono text-[11.5px] text-ink focus:border-saffron focus:outline-none disabled:opacity-60"
                          style={{ fontFamily: "var(--font-mono)" }}
                        />
                        <input
                          value={meta.location ?? ""}
                          onChange={(e) =>
                            patch(item.id, { location: e.target.value })
                          }
                          placeholder="Shop / address"
                          disabled={!canEdit}
                          className="rounded-sm border border-border bg-white px-2 py-1 text-[12px] text-ink placeholder:text-ink-faint focus:border-saffron focus:outline-none disabled:opacity-60"
                        />
                        <input
                          value={meta.notes ?? ""}
                          onChange={(e) =>
                            patch(item.id, { notes: e.target.value })
                          }
                          placeholder="What to check this round"
                          disabled={!canEdit}
                          className="rounded-sm border border-border bg-white px-2 py-1 text-[12px] text-ink placeholder:text-ink-faint focus:border-saffron focus:outline-none disabled:opacity-60"
                        />
                      </div>
                    ) : (
                      canEdit && (
                        <button
                          type="button"
                          onClick={() => createBrideStage(stage)}
                          className="mt-2 inline-flex items-center gap-1 rounded-sm border border-dashed border-border bg-white px-2 py-1 text-[11px] text-ink-muted hover:border-saffron hover:text-saffron"
                        >
                          <Plus size={11} strokeWidth={1.8} />
                          Schedule
                        </button>
                      )
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </PanelCard>

      <PanelCard
        icon={<CalendarClock size={14} strokeWidth={1.8} />}
        title="Everyone else"
        badge={
          canEdit && (
            <button
              type="button"
              onClick={createOther}
              className="inline-flex items-center gap-1 rounded-sm border border-border bg-white px-2 py-1 text-[11px] text-ink hover:border-saffron hover:text-saffron"
            >
              <Plus size={12} strokeWidth={1.8} />
              Add fitting
            </button>
          )
        }
      >
        {otherFittings.length === 0 ? (
          <p className="py-2 text-[12px] italic text-ink-faint">
            Groom, parents, bridal party — schedule a single fitting each. Keep
            alterations buffer for bulk sizing on bridal-party outfits.
          </p>
        ) : (
          <ul className="divide-y divide-border/60">
            {otherFittings.map((f) => {
              const meta = (f.meta ?? {}) as FitMeta;
              const done = meta.status === "done";
              return (
                <li key={f.id} className="grid grid-cols-12 gap-2 py-3">
                  <button
                    type="button"
                    onClick={() =>
                      patch(f.id, { status: done ? "upcoming" : "done" })
                    }
                    disabled={!canEdit}
                    className={cn(
                      "col-span-1 mt-1 flex h-5 w-5 items-center justify-center rounded-full border transition-colors disabled:cursor-not-allowed",
                      done
                        ? "border-sage bg-sage-pale/70 text-sage"
                        : "border-border bg-white text-ink-faint",
                    )}
                    aria-label="Toggle done"
                  >
                    {done && <Check size={11} strokeWidth={2.2} />}
                  </button>
                  <input
                    value={meta.person ?? ""}
                    onChange={(e) => patch(f.id, { person: e.target.value })}
                    placeholder="Person"
                    disabled={!canEdit}
                    className="col-span-3 rounded-sm border border-border bg-white px-2 py-1 text-[12px] text-ink placeholder:text-ink-faint focus:border-saffron focus:outline-none disabled:opacity-60"
                  />
                  <input
                    type="date"
                    value={meta.date ?? ""}
                    onChange={(e) => patch(f.id, { date: e.target.value })}
                    disabled={!canEdit}
                    className="col-span-3 rounded-sm border border-border bg-white px-2 py-1 font-mono text-[11.5px] text-ink focus:border-saffron focus:outline-none disabled:opacity-60"
                    style={{ fontFamily: "var(--font-mono)" }}
                  />
                  <input
                    value={meta.location ?? ""}
                    onChange={(e) => patch(f.id, { location: e.target.value })}
                    placeholder="Shop"
                    disabled={!canEdit}
                    className="col-span-2 rounded-sm border border-border bg-white px-2 py-1 text-[12px] text-ink placeholder:text-ink-faint focus:border-saffron focus:outline-none disabled:opacity-60"
                  />
                  <input
                    value={meta.notes ?? ""}
                    onChange={(e) => patch(f.id, { notes: e.target.value })}
                    placeholder="Notes"
                    disabled={!canEdit}
                    className="col-span-2 rounded-sm border border-border bg-white px-2 py-1 text-[12px] text-ink placeholder:text-ink-faint focus:border-saffron focus:outline-none disabled:opacity-60"
                  />
                  {canEdit && (
                    <button
                      type="button"
                      onClick={() => deleteItem(f.id)}
                      className="col-span-1 mt-1 text-ink-faint hover:text-rose"
                      aria-label="Remove"
                    >
                      <Trash2 size={13} strokeWidth={1.8} />
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </PanelCard>
    </div>
  );
}
