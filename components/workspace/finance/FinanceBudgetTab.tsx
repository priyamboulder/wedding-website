"use client";

// ── Budget tab ────────────────────────────────────────────────────────────
// Total Budget (large, editable) + Smart Allocations preview + dense
// By-Category / By-Event table. Category names are rendered in Fraunces so
// they read like section headers, not labels. Every dollar figure uses
// JetBrains Mono with tabular-nums.
//
// The tab composes:
//   • BudgetTotalsHeader    — editable total + smart-allocation preview
//   • BudgetViewSwitcher    — By Category / By Event toggle
//   • BudgetByCategoryTable — rows with inline edit + expanded drawer
//   • BudgetByEventTable    — event rows with expanded per-category breakdown
//   • AddCategoryInline     — "+ Add category" bottom row with color picker
//   • ManageEventsPanel     — side-panel CRUD for events (By Event view)

import { useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Pencil,
  Plus,
  Settings2,
  Sliders,
  Trash2,
  Wand2,
  Eye,
  EyeOff,
  X,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useFinanceStore } from "@/stores/finance-store";
import {
  computeEventCategoryBreakdown,
  computeEventRollups,
  computeRollups,
} from "@/lib/finance/selectors";
import {
  formatDollars,
  formatDollarsShort,
  formatPct,
  parseDollarsToCents,
} from "@/lib/finance/format";
import type {
  FinanceCategory,
  FinanceCategoryId,
  FinanceInvoice,
  FinanceTransaction,
} from "@/types/finance";
import { FINANCE_COLOR_SWATCHES } from "@/types/finance";
import {
  FinanceActionButton,
  FinancePanelCard,
  FinanceStatTile,
  MonoCell,
  SidePanel,
} from "./shared";

interface Props {
  categoryFilter: FinanceCategoryId | null;
}

type BudgetView = "category" | "event";

export function FinanceBudgetTab({ categoryFilter }: Props) {
  const [view, setView] = useState<BudgetView>("category");

  return (
    <div className="space-y-5">
      <BudgetTotalsHeader />
      <BudgetViewSwitcher view={view} onChange={setView} />
      {view === "category" ? (
        <BudgetByCategoryTable categoryFilter={categoryFilter} />
      ) : (
        <BudgetByEventTable />
      )}
    </div>
  );
}

// ── Totals header (total budget + summary strip) ─────────────────────────

function BudgetTotalsHeader() {
  const budgets = useFinanceStore((s) => s.budgets);
  const categories = useFinanceStore((s) => s.categories);
  const invoices = useFinanceStore((s) => s.invoices);
  const payments = useFinanceStore((s) => s.payments);
  const transactions = useFinanceStore((s) => s.transactions);
  const settings = useFinanceStore((s) => s.settings);
  const setTotalBudget = useFinanceStore((s) => s.setTotalBudget);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  const activeCategories = useMemo(
    () => categories.filter((c) => !c.hidden),
    [categories],
  );

  const rollups = useMemo(
    () =>
      computeRollups(
        budgets,
        invoices,
        payments,
        activeCategories.map((c) => c.id),
        transactions,
      ),
    [budgets, invoices, payments, transactions, activeCategories],
  );

  const allocatedTotal = useMemo(
    () => rollups.reduce((s, r) => s + r.allocated_cents, 0),
    [rollups],
  );
  const committedTotal = useMemo(
    () => rollups.reduce((s, r) => s + r.committed_cents, 0),
    [rollups],
  );
  const paidTotal = useMemo(
    () => rollups.reduce((s, r) => s + r.paid_cents, 0),
    [rollups],
  );
  const remaining = settings.total_budget_cents - allocatedTotal;

  const commitEdit = () => {
    const cents = parseDollarsToCents(draft);
    if (cents != null) setTotalBudget(cents);
    setEditing(false);
  };

  return (
    <FinancePanelCard className="p-6">
      <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div className="flex-1">
          <p
            className="font-mono text-[10px] uppercase tracking-[0.16em] text-saffron"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Total budget
          </p>
          {editing ? (
            <div className="mt-1.5 flex items-baseline gap-2">
              <span
                className="font-mono text-[28px] text-ink-faint"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                $
              </span>
              <input
                type="text"
                inputMode="numeric"
                autoFocus
                value={draft}
                onChange={(e) => setDraft(e.target.value.replace(/[^0-9,]/g, ""))}
                onBlur={commitEdit}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commitEdit();
                  else if (e.key === "Escape") setEditing(false);
                }}
                className="w-64 border-b-2 border-ink bg-transparent font-mono text-[38px] tabular-nums leading-tight text-ink outline-none"
                style={{ fontFamily: "var(--font-mono)" }}
              />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                setDraft((settings.total_budget_cents / 100).toFixed(0));
                setEditing(true);
              }}
              className="group mt-1.5 flex items-baseline gap-2 text-left transition-colors hover:text-saffron"
              aria-label="Edit total budget"
            >
              <span
                className="font-mono text-[38px] tabular-nums leading-tight text-ink"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {formatDollars(settings.total_budget_cents)}
              </span>
              <Pencil
                size={14}
                strokeWidth={1.8}
                className="text-ink-faint opacity-0 transition-opacity group-hover:opacity-100"
              />
            </button>
          )}
          <p className="mt-1.5 text-[12.5px] text-ink-muted">
            What you're planning to spend across all categories. Changes
            don't redistribute allocations — use "Suggest allocations" to
            spread the total across categories.
          </p>
        </div>
        <SmartAllocationsEntry totalBudget={settings.total_budget_cents} />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <FinanceStatTile
          label="Allocated"
          value={formatDollars(allocatedTotal)}
          hint={
            settings.total_budget_cents > 0
              ? `${formatPct(allocatedTotal / settings.total_budget_cents)} of total`
              : undefined
          }
          mono
        />
        <FinanceStatTile
          label="Committed"
          value={formatDollars(committedTotal)}
          tone={committedTotal > allocatedTotal ? "rose" : "ink"}
          mono
        />
        <FinanceStatTile
          label="Paid"
          value={formatDollars(paidTotal)}
          tone="sage"
          mono
        />
        <FinanceStatTile
          label="Unallocated"
          value={formatDollars(remaining)}
          tone={remaining < 0 ? "rose" : remaining === 0 ? "ink" : "gold"}
          hint={
            remaining > 0 ? "Room to assign" : remaining < 0 ? "Over total" : "Balanced"
          }
          mono
        />
      </div>
    </FinancePanelCard>
  );
}

// ── Smart Allocations: ghost-preview + accept/reject ─────────────────────

function SmartAllocationsEntry({ totalBudget }: { totalBudget: number }) {
  const [previewOpen, setPreviewOpen] = useState(false);
  return (
    <>
      <FinanceActionButton
        icon={<Wand2 size={13} strokeWidth={1.8} />}
        label="Suggest allocations"
        onClick={() => setPreviewOpen(true)}
        primary
      />
      {previewOpen && (
        <SmartAllocationsPanel
          totalBudget={totalBudget}
          onClose={() => setPreviewOpen(false)}
        />
      )}
    </>
  );
}

function SmartAllocationsPanel({
  totalBudget,
  onClose,
}: {
  totalBudget: number;
  onClose: () => void;
}) {
  const categories = useFinanceStore((s) => s.categories);
  const budgets = useFinanceStore((s) => s.budgets);
  const presets = useFinanceStore((s) => s.presets);
  const settings = useFinanceStore((s) => s.settings);
  const applyPreset = useFinanceStore((s) => s.applyPresetToAllocations);
  const setMultiple = useFinanceStore((s) => s.setMultipleAllocations);
  const setActive = useFinanceStore((s) => s.setActivePreset);
  const addPreset = useFinanceStore((s) => s.addPreset);

  const active = categories.filter((c) => !c.hidden);
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(
    settings.active_preset_id ?? presets[0]?.id ?? null,
  );
  const selectedPreset = presets.find((p) => p.id === selectedPresetId) ?? null;

  // Per-category draft edits on top of the preset's suggestion.
  const initialDrafts = useMemo(() => {
    const out: Record<string, string> = {};
    const suggested = selectedPreset
      ? applyPreset(selectedPreset.id).reduce<Record<string, number>>(
          (acc, row) => {
            acc[row.category_id] = row.allocated_cents;
            return acc;
          },
          {},
        )
      : {};
    for (const c of active) {
      const cents = suggested[c.id] ?? 0;
      out[c.id] = (cents / 100).toFixed(0);
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPresetId, totalBudget]);

  const [drafts, setDrafts] = useState<Record<string, string>>(initialDrafts);

  const parsed = useMemo(() => {
    const out: Record<string, number> = {};
    for (const c of active) {
      out[c.id] = parseDollarsToCents(drafts[c.id] ?? "0") ?? 0;
    }
    return out;
  }, [drafts, active]);

  const total = Object.values(parsed).reduce((s, c) => s + c, 0);
  const diff = total - totalBudget;

  const acceptAll = () => {
    setMultiple(
      active.map((c) => ({
        category_id: c.id,
        allocated_cents: parsed[c.id] ?? 0,
      })),
    );
    if (selectedPresetId) setActive(selectedPresetId);
    onClose();
  };

  const [savingPreset, setSavingPreset] = useState(false);
  const [newPresetName, setNewPresetName] = useState("");

  const saveAsPreset = () => {
    if (total <= 0 || !newPresetName.trim()) return;
    const percentages: Record<string, number> = {};
    for (const c of active) {
      percentages[c.id] = (parsed[c.id] ?? 0) / total;
    }
    const preset = addPreset({
      name: newPresetName.trim(),
      percentages,
    });
    setSelectedPresetId(preset.id);
    setNewPresetName("");
    setSavingPreset(false);
  };

  const existing = (cid: string) =>
    budgets.find((b) => b.category_id === cid)?.allocated_cents ?? 0;

  return (
    <SidePanel
      title="Suggest allocations"
      eyebrow="Smart allocations"
      onClose={onClose}
      widthClass="w-[560px]"
      footer={
        <div className="flex items-center justify-between gap-3">
          <div>
            <p
              className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Preview total
            </p>
            <p
              className={cn(
                "font-mono text-[14px] tabular-nums",
                diff === 0 ? "text-ink" : diff > 0 ? "text-rose" : "text-gold",
              )}
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {formatDollars(total)}
              {diff !== 0 && (
                <span className="ml-2 text-[11px]">
                  ({diff > 0 ? "+" : ""}
                  {formatDollars(diff)} vs total)
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <FinanceActionButton label="Cancel" onClick={onClose} />
            <FinanceActionButton label="Accept all" onClick={acceptAll} primary />
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="rounded-md border border-gold/25 bg-gold-pale/40 px-3 py-3">
          <div className="flex items-center justify-between gap-2">
            <p
              className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Preset
            </p>
            {!savingPreset && (
              <button
                type="button"
                onClick={() => setSavingPreset(true)}
                className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted hover:text-saffron"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                <Plus size={10} strokeWidth={1.8} /> Save current as preset
              </button>
            )}
          </div>
          <select
            value={selectedPresetId ?? ""}
            onChange={(e) => {
              const pid = e.target.value || null;
              setSelectedPresetId(pid);
              // Reset drafts to the newly selected preset.
              if (pid) {
                const newRows = applyPreset(pid);
                const nextDrafts: Record<string, string> = {};
                for (const c of active) {
                  const found = newRows.find((r) => r.category_id === c.id);
                  nextDrafts[c.id] = ((found?.allocated_cents ?? 0) / 100).toFixed(0);
                }
                setDrafts(nextDrafts);
              }
            }}
            className="mt-2 w-full rounded-md border border-border bg-white px-3 py-2 text-[12.5px] text-ink focus:border-ink focus:outline-none"
          >
            {presets.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
                {p.is_default ? " · default" : ""}
              </option>
            ))}
          </select>
          {savingPreset && (
            <div className="mt-2 flex items-center gap-2">
              <input
                type="text"
                value={newPresetName}
                onChange={(e) => setNewPresetName(e.target.value)}
                placeholder="Preset name"
                className="flex-1 rounded-md border border-border bg-white px-3 py-1.5 text-[12.5px] text-ink focus:border-ink focus:outline-none"
              />
              <FinanceActionButton
                label="Save"
                primary
                onClick={saveAsPreset}
                disabled={!newPresetName.trim()}
              />
              <button
                type="button"
                onClick={() => {
                  setSavingPreset(false);
                  setNewPresetName("");
                }}
                className="rounded-md p-1 text-ink-faint hover:bg-ivory hover:text-ink"
                aria-label="Cancel"
              >
                <X size={14} strokeWidth={1.8} />
              </button>
            </div>
          )}
        </div>

        <p className="text-[12.5px] text-ink-muted">
          Ghost values below show what each category would be allocated.
          Edit any row to override; accept when ready.
        </p>

        <ul className="space-y-1.5">
          {active.map((c) => {
            const cents = parsed[c.id] ?? 0;
            const pct =
              totalBudget > 0 ? cents / totalBudget : 0;
            const prev = existing(c.id);
            return (
              <li
                key={c.id}
                className="flex items-center gap-3 rounded-md border border-border bg-white px-3 py-2"
              >
                <span
                  className={cn(
                    "h-2 w-2 shrink-0 rounded-full",
                    c.color_class,
                  )}
                  aria-hidden
                />
                <div className="min-w-0 flex-1">
                  <p className="font-serif text-[14px] leading-tight text-ink">
                    {c.name}
                  </p>
                  <p
                    className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-ink-faint"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {formatPct(pct)} · current {formatDollars(prev)}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-ink-faint">$</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={drafts[c.id] ?? ""}
                    onChange={(e) =>
                      setDrafts((prev) => ({
                        ...prev,
                        [c.id]: e.target.value.replace(/[^0-9,]/g, ""),
                      }))
                    }
                    className="w-28 rounded-sm border border-border bg-ivory/30 px-2 py-1 text-right font-mono text-[12.5px] tabular-nums text-ink-muted italic outline-none focus:border-ink focus:not-italic focus:bg-white focus:text-ink"
                    style={{ fontFamily: "var(--font-mono)" }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </SidePanel>
  );
}

// ── View switcher ────────────────────────────────────────────────────────

function BudgetViewSwitcher({
  view,
  onChange,
}: {
  view: BudgetView;
  onChange: (v: BudgetView) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="inline-flex items-center gap-0 rounded-md border border-border bg-white p-0.5">
        {(["category", "event"] as BudgetView[]).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => onChange(v)}
            className={cn(
              "rounded-sm px-3 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.12em] transition-colors",
              view === v
                ? "bg-ink text-ivory"
                : "text-ink-muted hover:text-ink",
            )}
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {v === "category" ? "By Category" : "By Event"}
          </button>
        ))}
      </div>
      <BudgetSettingsActions />
    </div>
  );
}

function BudgetSettingsActions() {
  const [manageOpen, setManageOpen] = useState(false);
  const [adjustOpen, setAdjustOpen] = useState(false);

  return (
    <div className="flex items-center gap-2">
      <FinanceActionButton
        icon={<Settings2 size={13} strokeWidth={1.8} />}
        label="Manage events"
        onClick={() => setManageOpen(true)}
      />
      <FinanceActionButton
        icon={<Sliders size={13} strokeWidth={1.8} />}
        label="Adjust allocations"
        onClick={() => setAdjustOpen(true)}
      />
      {manageOpen && <ManageEventsPanel onClose={() => setManageOpen(false)} />}
      {adjustOpen && <AdjustAllocationsPanel onClose={() => setAdjustOpen(false)} />}
    </div>
  );
}

// ── By-Category table ────────────────────────────────────────────────────

function BudgetByCategoryTable({
  categoryFilter,
}: {
  categoryFilter: FinanceCategoryId | null;
}) {
  const categories = useFinanceStore((s) => s.categories);
  const budgets = useFinanceStore((s) => s.budgets);
  const invoices = useFinanceStore((s) => s.invoices);
  const payments = useFinanceStore((s) => s.payments);
  const transactions = useFinanceStore((s) => s.transactions);
  const setAllocated = useFinanceStore((s) => s.setAllocated);
  const updateCategory = useFinanceStore((s) => s.updateCategory);
  const deleteCategory = useFinanceStore((s) => s.deleteCategory);

  const scoped = useMemo(() => {
    const active = categories.filter((c) => !c.hidden);
    const list = categoryFilter
      ? active.filter((c) => c.id === categoryFilter)
      : active;
    return list.slice().sort((a, b) => a.sort_order - b.sort_order);
  }, [categories, categoryFilter]);

  const rollups = useMemo(
    () =>
      computeRollups(
        budgets,
        invoices,
        payments,
        scoped.map((c) => c.id),
        transactions,
      ),
    [budgets, invoices, payments, transactions, scoped],
  );

  const rollupById = useMemo(() => {
    const map = new Map<string, (typeof rollups)[number]>();
    for (const r of rollups) map.set(r.category_id, r);
    return map;
  }, [rollups]);

  const [expanded, setExpanded] = useState<Set<FinanceCategoryId>>(new Set());
  const [editing, setEditing] = useState<FinanceCategoryId | null>(null);
  const [deletePrompt, setDeletePrompt] = useState<FinanceCategory | null>(null);

  const totals = useMemo(() => {
    const t = { allocated: 0, quoted: 0, committed: 0, paid: 0, remaining: 0 };
    for (const r of rollups) {
      t.allocated += r.allocated_cents;
      t.quoted += r.quoted_cents;
      t.committed += r.committed_cents;
      t.paid += r.paid_cents;
      t.remaining += r.remaining_cents;
    }
    return t;
  }, [rollups]);

  const toggleExpand = (cid: FinanceCategoryId) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(cid)) next.delete(cid);
      else next.add(cid);
      return next;
    });

  return (
    <FinancePanelCard className="overflow-hidden p-0">
      <table className="w-full border-collapse text-[12px]">
        <thead>
          <tr className="border-b border-border">
            <th className="w-6 px-3 py-2.5" />
            <HeaderCell align="left">Category</HeaderCell>
            <HeaderCell>Allocated</HeaderCell>
            <HeaderCell>Quoted</HeaderCell>
            <HeaderCell>Committed</HeaderCell>
            <HeaderCell>Paid</HeaderCell>
            <HeaderCell>Remaining</HeaderCell>
            <HeaderCell>% of Total</HeaderCell>
            <th className="w-20 px-3 py-2.5" />
          </tr>
        </thead>
        <tbody>
          {scoped.map((cat) => {
            const r = rollupById.get(cat.id)!;
            const open = expanded.has(cat.id);
            const over =
              r.committed_cents > r.allocated_cents &&
              r.allocated_cents > 0;
            return (
              <BudgetCategoryRow
                key={cat.id}
                category={cat}
                rollup={r}
                over={over}
                expanded={open}
                onToggleExpand={() => toggleExpand(cat.id)}
                editing={editing === cat.id}
                onBeginEdit={() => setEditing(cat.id)}
                onCancelEdit={() => setEditing(null)}
                onSaveEdit={(cents) => {
                  setAllocated(cat.id, cents);
                  setEditing(null);
                }}
                onHide={() =>
                  updateCategory(cat.id, { hidden: !cat.hidden })
                }
                onRequestDelete={() => setDeletePrompt(cat)}
              />
            );
          })}
          <AddCategoryInline />
        </tbody>
        <tfoot>
          <tr className="border-t border-border bg-ivory/40">
            <td />
            <td className="px-3 py-2.5 font-serif text-[14px] text-ink">Totals</td>
            <td className="px-3 py-2.5 text-right">
              <MonoCell value={formatDollars(totals.allocated)} />
            </td>
            <td className="px-3 py-2.5 text-right">
              <MonoCell value={formatDollars(totals.quoted)} tone="muted" />
            </td>
            <td className="px-3 py-2.5 text-right">
              <MonoCell
                value={formatDollars(totals.committed)}
                tone={totals.committed > totals.allocated ? "rose" : "ink"}
              />
            </td>
            <td className="px-3 py-2.5 text-right">
              <MonoCell value={formatDollars(totals.paid)} tone="sage" />
            </td>
            <td className="px-3 py-2.5 text-right">
              <MonoCell
                value={formatDollars(totals.remaining)}
                tone={totals.remaining < 0 ? "rose" : "ink"}
              />
            </td>
            <td className="px-3 py-2.5 text-right">
              <MonoCell value="100%" tone="muted" />
            </td>
            <td />
          </tr>
        </tfoot>
      </table>

      {deletePrompt && (
        <DeleteCategoryPrompt
          category={deletePrompt}
          onConfirm={() => {
            deleteCategory(deletePrompt.id);
            setDeletePrompt(null);
          }}
          onCancel={() => setDeletePrompt(null)}
        />
      )}
    </FinancePanelCard>
  );
}

function HeaderCell({
  children,
  align = "right",
}: {
  children: React.ReactNode;
  align?: "left" | "right";
}) {
  return (
    <th
      className={cn(
        "px-3 py-2.5 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted",
        align === "right" ? "text-right" : "text-left",
      )}
      style={{ fontFamily: "var(--font-mono)" }}
    >
      {children}
    </th>
  );
}

// ── One category row + expandable drawer ─────────────────────────────────

function BudgetCategoryRow({
  category,
  rollup,
  over,
  expanded,
  onToggleExpand,
  editing,
  onBeginEdit,
  onCancelEdit,
  onSaveEdit,
  onHide,
  onRequestDelete,
}: {
  category: FinanceCategory;
  rollup: {
    allocated_cents: number;
    quoted_cents: number;
    committed_cents: number;
    paid_cents: number;
    transacted_cents: number;
    remaining_cents: number;
    pct_of_total: number;
  };
  over: boolean;
  expanded: boolean;
  onToggleExpand: () => void;
  editing: boolean;
  onBeginEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: (cents: number) => void;
  onHide: () => void;
  onRequestDelete: () => void;
}) {
  const [draft, setDraft] = useState(() =>
    (rollup.allocated_cents / 100).toFixed(0),
  );

  return (
    <>
      <tr className="border-b border-border/60 hover:bg-ivory/30">
        <td className="px-3 py-2.5">
          <button
            type="button"
            onClick={onToggleExpand}
            aria-label={expanded ? "Collapse row" : "Expand row"}
            className="rounded p-0.5 text-ink-faint transition-colors hover:bg-ivory hover:text-ink"
          >
            {expanded ? (
              <ChevronDown size={13} strokeWidth={1.8} />
            ) : (
              <ChevronRight size={13} strokeWidth={1.8} />
            )}
          </button>
        </td>
        <td className="px-3 py-2.5">
          <span className="inline-flex items-center gap-2">
            <span
              className={cn("h-2 w-2 rounded-full", category.color_class)}
              aria-hidden
            />
            <span className="font-serif text-[15px] leading-tight text-ink">
              {category.name}
            </span>
            {!category.is_default && (
              <span
                className="rounded-sm border border-gold/40 bg-gold-pale/40 px-1 font-mono text-[8.5px] uppercase tracking-[0.12em] text-gold"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Custom
              </span>
            )}
          </span>
        </td>
        <td className="px-3 py-2.5 text-right">
          {editing ? (
            <div className="flex items-center justify-end gap-1">
              <span className="text-ink-faint">$</span>
              <input
                type="text"
                inputMode="numeric"
                value={draft}
                onChange={(e) => setDraft(e.target.value.replace(/[^0-9,]/g, ""))}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const cents = parseDollarsToCents(draft);
                    if (cents != null) onSaveEdit(cents);
                  } else if (e.key === "Escape") {
                    onCancelEdit();
                  }
                }}
                onBlur={() => {
                  const cents = parseDollarsToCents(draft);
                  if (cents != null) onSaveEdit(cents);
                  else onCancelEdit();
                }}
                autoFocus
                className="w-24 rounded-sm border border-ink bg-white px-2 py-0.5 text-right font-mono text-[12px] tabular-nums text-ink outline-none"
                style={{ fontFamily: "var(--font-mono)" }}
              />
            </div>
          ) : (
            <button
              type="button"
              onClick={onBeginEdit}
              className="group inline-flex items-center gap-1.5 hover:text-saffron"
              aria-label={`Edit allocation for ${category.name}`}
            >
              <MonoCell value={formatDollars(rollup.allocated_cents)} />
              <Pencil
                size={11}
                strokeWidth={1.8}
                className="text-ink-faint opacity-0 transition-opacity group-hover:opacity-100"
              />
            </button>
          )}
        </td>
        <td className="px-3 py-2.5 text-right">
          <MonoCell value={formatDollars(rollup.quoted_cents)} tone="muted" />
        </td>
        <td className="px-3 py-2.5 text-right">
          <div className="inline-flex items-center gap-1.5">
            {over && (
              <span
                className="font-mono text-[9px] uppercase tracking-[0.1em] text-rose"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                +{formatDollarsShort(rollup.committed_cents - rollup.allocated_cents)}
              </span>
            )}
            <MonoCell
              value={formatDollars(rollup.committed_cents)}
              tone={over ? "rose" : "ink"}
            />
          </div>
        </td>
        <td className="px-3 py-2.5 text-right">
          <MonoCell value={formatDollars(rollup.paid_cents)} tone="sage" />
        </td>
        <td className="px-3 py-2.5 text-right">
          <MonoCell
            value={formatDollars(rollup.remaining_cents)}
            tone={rollup.remaining_cents < 0 ? "rose" : "ink"}
          />
        </td>
        <td className="px-3 py-2.5 text-right">
          <MonoCell value={formatPct(rollup.pct_of_total)} tone="muted" />
        </td>
        <td className="px-3 py-2.5">
          <div className="flex items-center justify-end gap-1">
            <button
              type="button"
              onClick={onHide}
              title={category.hidden ? "Unhide" : "Hide"}
              aria-label={category.hidden ? "Unhide category" : "Hide category"}
              className="rounded p-1 text-ink-faint transition-colors hover:bg-ivory hover:text-ink"
            >
              {category.hidden ? (
                <EyeOff size={12} strokeWidth={1.8} />
              ) : (
                <Eye size={12} strokeWidth={1.8} />
              )}
            </button>
            {!category.is_default && (
              <button
                type="button"
                onClick={onRequestDelete}
                title="Delete"
                aria-label="Delete category"
                className="rounded p-1 text-ink-faint transition-colors hover:bg-ivory hover:text-rose"
              >
                <Trash2 size={12} strokeWidth={1.8} />
              </button>
            )}
          </div>
        </td>
      </tr>
      {expanded && (
        <tr className="border-b border-border/60 bg-ivory/25">
          <td />
          <td colSpan={8} className="px-3 py-4">
            <CategoryDrawer category={category} rollup={rollup} />
          </td>
        </tr>
      )}
    </>
  );
}

// ── Expanded drawer: reconciliation strip + line items/invoices/transactions

function CategoryDrawer({
  category,
  rollup,
}: {
  category: FinanceCategory;
  rollup: {
    allocated_cents: number;
    quoted_cents: number;
    committed_cents: number;
    paid_cents: number;
    transacted_cents: number;
    remaining_cents: number;
    pct_of_total: number;
  };
}) {
  const allInvoices = useFinanceStore((s) => s.invoices);
  const allTransactions = useFinanceStore((s) => s.transactions);
  const invoices = useMemo(
    () => allInvoices.filter((i) => i.category_id === category.id),
    [allInvoices, category.id],
  );
  const transactions = useMemo(
    () => allTransactions.filter((t) => t.category_id === category.id),
    [allTransactions, category.id],
  );
  const payments = useFinanceStore((s) => s.payments);
  const contributors = useFinanceStore((s) => s.contributors);

  const variance = rollup.paid_cents - rollup.committed_cents;

  // Orphaned invoices: approved+ but with no matching transaction within 30d.
  const now = Date.now();
  const orphanedInvoices = invoices.filter((inv) => {
    if (inv.status !== "approved" && inv.status !== "overdue") return false;
    const hasTxn = transactions.some((t) => t.invoice_id === inv.id);
    if (hasTxn) return false;
    const daysOld = Math.floor(
      (now - new Date(inv.due_date).getTime()) / (1000 * 60 * 60 * 24),
    );
    return daysOld >= 30;
  });

  return (
    <div className="space-y-4">
      {/* Reconciliation strip */}
      <div className="grid grid-cols-4 gap-2 rounded-md border border-border bg-white px-3 py-2.5">
        <ReconCell label="Allocated" value={formatDollars(rollup.allocated_cents)} />
        <ReconCell
          label="Quoted"
          value={formatDollars(rollup.quoted_cents)}
          tone="muted"
        />
        <ReconCell
          label="Paid"
          value={formatDollars(rollup.paid_cents)}
          tone="sage"
        />
        <ReconCell
          label="Variance"
          value={formatDollars(variance)}
          tone={
            rollup.paid_cents > rollup.committed_cents
              ? "rose"
              : variance === 0
                ? "muted"
                : "ink"
          }
          hint={
            rollup.paid_cents > rollup.committed_cents
              ? "Paid > committed"
              : undefined
          }
        />
      </div>

      {orphanedInvoices.length > 0 && (
        <div className="rounded-md border border-rose/40 bg-rose/5 px-3 py-2 text-[11.5px] text-rose">
          <span
            className="mr-2 font-mono text-[9.5px] uppercase tracking-[0.12em]"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Unmatched {`>`} 30d
          </span>
          {orphanedInvoices.length} invoice
          {orphanedInvoices.length === 1 ? "" : "s"} past 30 days with no
          matching transaction
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <DrawerSection title="Line items">
          {invoices.length === 0 && transactions.length === 0 ? (
            <EmptyHint>No vendor line items yet.</EmptyHint>
          ) : (
            <ul className="space-y-1">
              {invoices.slice(0, 6).map((i) => (
                <li
                  key={i.id}
                  className="flex items-center justify-between gap-2 text-[11.5px]"
                >
                  <span className="truncate text-ink">
                    {i.vendor_name_fallback ?? "Vendor"}
                  </span>
                  <MonoCell value={formatDollars(i.amount_cents)} />
                </li>
              ))}
            </ul>
          )}
        </DrawerSection>

        <DrawerSection title="Invoices">
          {invoices.length === 0 ? (
            <EmptyHint>No invoices logged yet.</EmptyHint>
          ) : (
            <ul className="space-y-1">
              {invoices.map((i) => (
                <li
                  key={i.id}
                  className="flex items-center justify-between gap-2 text-[11.5px]"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-ink">
                      {i.vendor_name_fallback ?? "Vendor"}
                    </p>
                    <p
                      className="font-mono text-[9px] uppercase tracking-[0.1em] text-ink-faint"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {i.status} · {i.due_date}
                    </p>
                  </div>
                  <MonoCell value={formatDollars(i.amount_cents)} />
                </li>
              ))}
            </ul>
          )}
        </DrawerSection>

        <DrawerSection title="Transactions">
          {transactions.length === 0 ? (
            <EmptyHint>No bank transactions tagged.</EmptyHint>
          ) : (
            <ul className="space-y-1">
              {transactions.map((t) => {
                const payer = contributors.find(
                  (c) => c.id === t.payer_contributor_id,
                );
                return (
                  <li
                    key={t.id}
                    className="flex items-center justify-between gap-2 text-[11.5px]"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-ink">{t.description}</p>
                      <p
                        className="font-mono text-[9px] uppercase tracking-[0.1em] text-ink-faint"
                        style={{ fontFamily: "var(--font-mono)" }}
                      >
                        {t.date}
                        {payer ? ` · ${payer.relationship}` : ""}
                        {t.invoice_id ? " · linked" : ""}
                      </p>
                    </div>
                    <MonoCell value={formatDollars(t.amount_cents)} tone="sage" />
                  </li>
                );
              })}
            </ul>
          )}
        </DrawerSection>
      </div>
    </div>
  );
}

function ReconCell({
  label,
  value,
  hint,
  tone = "ink",
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "ink" | "muted" | "sage" | "rose";
}) {
  const toneClass =
    tone === "muted"
      ? "text-ink-muted"
      : tone === "sage"
        ? "text-sage"
        : tone === "rose"
          ? "text-rose"
          : "text-ink";
  return (
    <div>
      <p
        className="font-mono text-[9px] uppercase tracking-[0.14em] text-ink-muted"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {label}
      </p>
      <p
        className={cn(
          "mt-0.5 font-mono text-[13px] tabular-nums",
          toneClass,
        )}
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {value}
      </p>
      {hint && (
        <p className="text-[10px] text-ink-faint">{hint}</p>
      )}
    </div>
  );
}

function DrawerSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-md border border-border bg-white px-3 py-2.5">
      <p
        className="mb-1.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-saffron"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {title}
      </p>
      {children}
    </div>
  );
}

function EmptyHint({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11.5px] text-ink-faint">{children}</p>
  );
}

// ── Add-category inline row ──────────────────────────────────────────────

function AddCategoryInline() {
  const addCategory = useFinanceStore((s) => s.addCategory);
  const setTotalBudget = useFinanceStore((s) => s.setTotalBudget);
  const settings = useFinanceStore((s) => s.settings);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [color, setColor] = useState(FINANCE_COLOR_SWATCHES[0]!.class);
  const [amount, setAmount] = useState("");
  const [mode, setMode] = useState<"amount" | "percent">("amount");

  const reset = () => {
    setName("");
    setColor(FINANCE_COLOR_SWATCHES[0]!.class);
    setAmount("");
    setMode("amount");
    setOpen(false);
  };

  const commit = () => {
    if (!name.trim()) return;
    const centsFromInput =
      mode === "amount"
        ? (parseDollarsToCents(amount) ?? 0)
        : Math.round(
            (Math.min(100, Math.max(0, Number(amount) || 0)) / 100) *
              settings.total_budget_cents,
          );
    addCategory({
      name: name.trim(),
      color_class: color,
      allocated_cents: centsFromInput,
    });
    reset();
  };

  if (!open) {
    return (
      <tr className="bg-ivory/20">
        <td colSpan={9} className="px-3 py-2.5">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-[0.12em] text-ink-muted hover:text-saffron"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            <Plus size={12} strokeWidth={1.8} />
            Add category
          </button>
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-b border-border/60 bg-gold-pale/25">
      <td />
      <td className="px-3 py-2.5">
        <div className="flex items-center gap-2">
          <ColorDotPicker value={color} onChange={setColor} />
          <input
            type="text"
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Category name"
            className="w-full rounded-md border border-border bg-white px-2 py-1 font-serif text-[14px] text-ink placeholder:text-ink-faint focus:border-ink focus:outline-none"
          />
        </div>
      </td>
      <td className="px-3 py-2.5" colSpan={6}>
        <div className="flex items-center justify-end gap-2">
          <div className="inline-flex rounded-md border border-border bg-white p-0.5">
            {(["amount", "percent"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={cn(
                  "rounded-sm px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.12em] transition-colors",
                  mode === m
                    ? "bg-ink text-ivory"
                    : "text-ink-muted hover:text-ink",
                )}
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {m === "amount" ? "$" : "% of total"}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1">
            <span className="text-ink-faint">{mode === "amount" ? "$" : ""}</span>
            <input
              type="text"
              inputMode="numeric"
              value={amount}
              onChange={(e) =>
                setAmount(e.target.value.replace(/[^0-9,.]/g, ""))
              }
              placeholder="0"
              className="w-24 rounded-sm border border-border bg-white px-2 py-1 text-right font-mono text-[12px] tabular-nums text-ink outline-none focus:border-ink"
              style={{ fontFamily: "var(--font-mono)" }}
            />
            {mode === "percent" && (
              <span className="text-ink-faint">%</span>
            )}
          </div>
        </div>
      </td>
      <td className="px-3 py-2.5">
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={commit}
            disabled={!name.trim()}
            className="rounded p-1 text-sage transition-colors hover:bg-ivory disabled:opacity-40"
            aria-label="Confirm add"
          >
            <Check size={14} strokeWidth={2} />
          </button>
          <button
            type="button"
            onClick={reset}
            className="rounded p-1 text-ink-faint transition-colors hover:bg-ivory hover:text-ink"
            aria-label="Cancel add"
          >
            <X size={14} strokeWidth={1.8} />
          </button>
        </div>
      </td>
    </tr>
  );
}

function ColorDotPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Pick color"
        className={cn(
          "h-4 w-4 rounded-full border border-ink/20 transition-transform hover:scale-110",
          value,
        )}
      />
      {open && (
        <div
          className="absolute left-0 top-5 z-20 grid grid-cols-6 gap-1.5 rounded-md border border-border bg-white p-2 shadow-lg"
          role="listbox"
        >
          {FINANCE_COLOR_SWATCHES.map((s) => (
            <button
              key={s.class}
              type="button"
              onClick={() => {
                onChange(s.class);
                setOpen(false);
              }}
              title={s.label}
              aria-label={s.label}
              className={cn(
                "h-4 w-4 rounded-full border",
                s.class,
                value === s.class ? "border-ink ring-1 ring-ink" : "border-ink/10",
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function DeleteCategoryPrompt({
  category,
  onConfirm,
  onCancel,
}: {
  category: FinanceCategory;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40"
      role="dialog"
      aria-modal="true"
      onClick={onCancel}
    >
      <div
        className="w-[380px] rounded-md border border-border bg-white p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h4 className="font-serif text-[17px] text-ink">Delete category</h4>
        <p className="mt-1 text-[12.5px] text-ink-muted">
          Delete <span className="font-medium">{category.name}</span>? Invoices
          and transactions tagged to this category will fall into
          Uncategorized.
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <FinanceActionButton label="Cancel" onClick={onCancel} />
          <button
            type="button"
            onClick={onConfirm}
            className="inline-flex items-center gap-1.5 rounded-md bg-rose px-3 py-1.5 text-[12px] font-medium text-ivory transition-colors hover:bg-rose-light"
          >
            <Trash2 size={12} strokeWidth={1.8} />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Adjust allocations (live validation against total) ───────────────────

function AdjustAllocationsPanel({ onClose }: { onClose: () => void }) {
  const categories = useFinanceStore((s) => s.categories);
  const budgets = useFinanceStore((s) => s.budgets);
  const settings = useFinanceStore((s) => s.settings);
  const setMultiple = useFinanceStore((s) => s.setMultipleAllocations);

  const scope = useMemo(
    () => categories.filter((c) => !c.hidden),
    [categories],
  );

  const [drafts, setDrafts] = useState<Record<string, string>>(() => {
    const out: Record<string, string> = {};
    for (const c of scope) {
      const b = budgets.find((x) => x.category_id === c.id);
      out[c.id] = ((b?.allocated_cents ?? 0) / 100).toFixed(0);
    }
    return out;
  });

  const parsed = useMemo(() => {
    const out: Record<string, number> = {};
    for (const c of scope) {
      out[c.id] = parseDollarsToCents(drafts[c.id] ?? "0") ?? 0;
    }
    return out;
  }, [drafts, scope]);

  const draftTotal = useMemo(
    () => Object.values(parsed).reduce((s, c) => s + c, 0),
    [parsed],
  );
  const diff = draftTotal - settings.total_budget_cents;

  const save = () => {
    setMultiple(
      scope.map((c) => ({
        category_id: c.id,
        allocated_cents: parsed[c.id] ?? 0,
      })),
    );
    onClose();
  };

  return (
    <SidePanel
      title="Adjust allocations"
      eyebrow="Budget"
      onClose={onClose}
      widthClass="w-[520px]"
      footer={
        <div className="flex items-center justify-between gap-3">
          <div>
            <p
              className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Allocated total
            </p>
            <p
              className={cn(
                "font-mono text-[14px] tabular-nums",
                diff === 0 ? "text-ink" : diff > 0 ? "text-rose" : "text-gold",
              )}
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {formatDollars(draftTotal)}
              {diff !== 0 && (
                <span className="ml-2 text-[11px]">
                  ({diff > 0 ? "+" : ""}
                  {formatDollars(diff)} vs total)
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <FinanceActionButton label="Cancel" onClick={onClose} />
            <FinanceActionButton label="Save" onClick={save} primary />
          </div>
        </div>
      }
    >
      <p className="mb-4 text-[12.5px] text-ink-muted">
        Edit each category's allocation. Changes save atomically.
      </p>
      <div className="space-y-2">
        {scope.map((c) => (
          <div
            key={c.id}
            className="flex items-center gap-3 rounded-md border border-border bg-white px-3 py-2"
          >
            <span
              className={cn("h-2 w-2 shrink-0 rounded-full", c.color_class)}
              aria-hidden
            />
            <span className="min-w-0 flex-1 font-serif text-[14px] text-ink">
              {c.name}
            </span>
            <div className="flex items-center gap-1">
              <span className="text-ink-faint">$</span>
              <input
                type="text"
                inputMode="numeric"
                value={drafts[c.id] ?? ""}
                onChange={(e) =>
                  setDrafts((prev) => ({
                    ...prev,
                    [c.id]: e.target.value.replace(/[^0-9,]/g, ""),
                  }))
                }
                className="w-28 rounded-sm border border-border bg-white px-2 py-1 text-right font-mono text-[12px] tabular-nums text-ink outline-none focus:border-ink"
                style={{ fontFamily: "var(--font-mono)" }}
              />
            </div>
          </div>
        ))}
      </div>
    </SidePanel>
  );
}

// ── By-Event table + expanded category breakdown ─────────────────────────

function BudgetByEventTable() {
  const events = useFinanceStore((s) => s.events);
  const invoices = useFinanceStore((s) => s.invoices);
  const payments = useFinanceStore((s) => s.payments);
  const transactions = useFinanceStore((s) => s.transactions);
  const categories = useFinanceStore((s) => s.categories);
  const updateEvent = useFinanceStore((s) => s.updateEvent);

  const sorted = useMemo(
    () => events.slice().sort((a, b) => a.sort_order - b.sort_order),
    [events],
  );
  const rollups = useMemo(
    () => computeEventRollups(sorted, invoices, payments, transactions),
    [sorted, invoices, payments, transactions],
  );
  const rollupById = useMemo(() => {
    const m = new Map<string, (typeof rollups)[number]>();
    for (const r of rollups) m.set(r.event_id, r);
    return m;
  }, [rollups]);

  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [editingId, setEditingId] = useState<string | null>(null);

  const totals = useMemo(() => {
    const t = { allocated: 0, quoted: 0, committed: 0, paid: 0, remaining: 0 };
    for (const r of rollups) {
      t.allocated += r.allocated_cents;
      t.quoted += r.quoted_cents;
      t.committed += r.committed_cents;
      t.paid += r.paid_cents;
      t.remaining += r.remaining_cents;
    }
    return t;
  }, [rollups]);

  const toggleExpand = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <FinancePanelCard className="overflow-hidden p-0">
      <table className="w-full border-collapse text-[12px]">
        <thead>
          <tr className="border-b border-border">
            <th className="w-6 px-3 py-2.5" />
            <HeaderCell align="left">Event</HeaderCell>
            <HeaderCell>Allocated</HeaderCell>
            <HeaderCell>Quoted</HeaderCell>
            <HeaderCell>Committed</HeaderCell>
            <HeaderCell>Paid</HeaderCell>
            <HeaderCell>Remaining</HeaderCell>
          </tr>
        </thead>
        <tbody>
          {sorted.map((e) => {
            const r = rollupById.get(e.id)!;
            const open = expanded.has(e.id);
            return (
              <EventRow
                key={e.id}
                eventId={e.id}
                name={e.name}
                date={e.date}
                allocated={e.allocated_cents}
                rollup={r}
                expanded={open}
                onToggle={() => toggleExpand(e.id)}
                editing={editingId === e.id}
                onBeginEdit={() => setEditingId(e.id)}
                onCancelEdit={() => setEditingId(null)}
                onSaveEdit={(cents) => {
                  updateEvent(e.id, { allocated_cents: cents });
                  setEditingId(null);
                }}
                invoices={invoices}
                transactions={transactions}
                categories={categories}
              />
            );
          })}
        </tbody>
        <tfoot>
          <tr className="border-t border-border bg-ivory/40">
            <td />
            <td className="px-3 py-2.5 font-serif text-[14px] text-ink">Totals</td>
            <td className="px-3 py-2.5 text-right">
              <MonoCell value={formatDollars(totals.allocated)} />
            </td>
            <td className="px-3 py-2.5 text-right">
              <MonoCell value={formatDollars(totals.quoted)} tone="muted" />
            </td>
            <td className="px-3 py-2.5 text-right">
              <MonoCell value={formatDollars(totals.committed)} />
            </td>
            <td className="px-3 py-2.5 text-right">
              <MonoCell value={formatDollars(totals.paid)} tone="sage" />
            </td>
            <td className="px-3 py-2.5 text-right">
              <MonoCell value={formatDollars(totals.remaining)} />
            </td>
          </tr>
        </tfoot>
      </table>
    </FinancePanelCard>
  );
}

function EventRow({
  eventId,
  name,
  date,
  allocated,
  rollup,
  expanded,
  onToggle,
  editing,
  onBeginEdit,
  onCancelEdit,
  onSaveEdit,
  invoices,
  transactions,
  categories,
}: {
  eventId: string;
  name: string;
  date: string | null;
  allocated: number;
  rollup: {
    quoted_cents: number;
    committed_cents: number;
    paid_cents: number;
    remaining_cents: number;
    transacted_cents: number;
  };
  expanded: boolean;
  onToggle: () => void;
  editing: boolean;
  onBeginEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: (cents: number) => void;
  invoices: FinanceInvoice[];
  transactions: FinanceTransaction[];
  categories: FinanceCategory[];
}) {
  const [draft, setDraft] = useState(() => (allocated / 100).toFixed(0));
  return (
    <>
      <tr className="border-b border-border/60 hover:bg-ivory/30">
        <td className="px-3 py-2.5">
          <button
            type="button"
            onClick={onToggle}
            aria-label={expanded ? "Collapse" : "Expand"}
            className="rounded p-0.5 text-ink-faint transition-colors hover:bg-ivory hover:text-ink"
          >
            {expanded ? (
              <ChevronDown size={13} strokeWidth={1.8} />
            ) : (
              <ChevronRight size={13} strokeWidth={1.8} />
            )}
          </button>
        </td>
        <td className="px-3 py-2.5">
          <div>
            <p className="font-serif text-[15px] leading-tight text-ink">
              {name}
            </p>
            {date && (
              <p
                className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-ink-faint"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {date}
              </p>
            )}
          </div>
        </td>
        <td className="px-3 py-2.5 text-right">
          {editing ? (
            <div className="flex items-center justify-end gap-1">
              <span className="text-ink-faint">$</span>
              <input
                type="text"
                inputMode="numeric"
                autoFocus
                value={draft}
                onChange={(e) => setDraft(e.target.value.replace(/[^0-9,]/g, ""))}
                onBlur={() => {
                  const cents = parseDollarsToCents(draft);
                  if (cents != null) onSaveEdit(cents);
                  else onCancelEdit();
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const cents = parseDollarsToCents(draft);
                    if (cents != null) onSaveEdit(cents);
                  } else if (e.key === "Escape") onCancelEdit();
                }}
                className="w-24 rounded-sm border border-ink bg-white px-2 py-0.5 text-right font-mono text-[12px] tabular-nums text-ink outline-none"
                style={{ fontFamily: "var(--font-mono)" }}
              />
            </div>
          ) : (
            <button
              type="button"
              onClick={onBeginEdit}
              className="group inline-flex items-center gap-1.5 hover:text-saffron"
              aria-label={`Edit allocation for ${name}`}
            >
              <MonoCell value={formatDollars(allocated)} />
              <Pencil
                size={11}
                strokeWidth={1.8}
                className="text-ink-faint opacity-0 transition-opacity group-hover:opacity-100"
              />
            </button>
          )}
        </td>
        <td className="px-3 py-2.5 text-right">
          <MonoCell value={formatDollars(rollup.quoted_cents)} tone="muted" />
        </td>
        <td className="px-3 py-2.5 text-right">
          <MonoCell value={formatDollars(rollup.committed_cents)} />
        </td>
        <td className="px-3 py-2.5 text-right">
          <MonoCell value={formatDollars(rollup.paid_cents)} tone="sage" />
        </td>
        <td className="px-3 py-2.5 text-right">
          <MonoCell value={formatDollars(rollup.remaining_cents)} />
        </td>
      </tr>
      {expanded && (
        <tr className="border-b border-border/60 bg-ivory/25">
          <td />
          <td colSpan={6} className="px-3 py-3">
            <EventBreakdown
              eventId={eventId}
              invoices={invoices}
              transactions={transactions}
              categories={categories}
            />
          </td>
        </tr>
      )}
    </>
  );
}

function EventBreakdown({
  eventId,
  invoices,
  transactions,
  categories,
}: {
  eventId: string;
  invoices: FinanceInvoice[];
  transactions: FinanceTransaction[];
  categories: FinanceCategory[];
}) {
  const rows = useMemo(
    () => computeEventCategoryBreakdown(eventId, invoices, transactions, categories),
    [eventId, invoices, transactions, categories],
  );
  if (rows.length === 0) {
    return (
      <p className="text-[11.5px] text-ink-faint">
        No invoices or transactions tagged to this event yet.
      </p>
    );
  }
  return (
    <div className="space-y-1">
      <p
        className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-saffron"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        Category breakdown
      </p>
      <ul className="divide-y divide-border/40">
        {rows.map((r) => (
          <li
            key={r.category_id}
            className="flex items-center justify-between gap-3 py-1.5 text-[11.5px]"
          >
            <span className="inline-flex items-center gap-2">
              <span
                className={cn("h-1.5 w-1.5 rounded-full", r.color_class)}
                aria-hidden
              />
              <span className="font-serif text-[13.5px] text-ink">
                {r.category_name}
              </span>
            </span>
            <span className="flex items-center gap-3">
              <MonoCell
                value={formatDollars(r.quoted_cents)}
                tone="muted"
              />
              <MonoCell value={formatDollars(r.transacted_cents)} tone="sage" />
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── Manage events side panel ─────────────────────────────────────────────

function ManageEventsPanel({ onClose }: { onClose: () => void }) {
  const events = useFinanceStore((s) => s.events);
  const addEvent = useFinanceStore((s) => s.addEvent);
  const updateEvent = useFinanceStore((s) => s.updateEvent);
  const deleteEvent = useFinanceStore((s) => s.deleteEvent);
  const [newName, setNewName] = useState("");

  const sorted = events.slice().sort((a, b) => a.sort_order - b.sort_order);

  return (
    <SidePanel
      title="Manage events"
      eyebrow="Finance settings"
      onClose={onClose}
      widthClass="w-[480px]"
    >
      <div className="space-y-4">
        <p className="text-[12.5px] text-ink-muted">
          Events feed the By-Event budget view and invoice/transaction
          tagging.
        </p>
        <div className="rounded-md border border-dashed border-border bg-ivory/30 p-3">
          <p
            className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Add event
          </p>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Cocktail Night"
              className="flex-1 rounded-md border border-border bg-white px-3 py-1.5 text-[12.5px] text-ink placeholder:text-ink-faint focus:border-ink focus:outline-none"
            />
            <FinanceActionButton
              label="Add"
              icon={<Plus size={12} strokeWidth={1.8} />}
              onClick={() => {
                if (!newName.trim()) return;
                addEvent({ name: newName });
                setNewName("");
              }}
            />
          </div>
        </div>
        <ul className="space-y-1.5">
          {sorted.map((e) => (
            <li
              key={e.id}
              className="flex items-center gap-2 rounded-md border border-border bg-white px-3 py-2"
            >
              <input
                type="text"
                value={e.name}
                onChange={(ev) => updateEvent(e.id, { name: ev.target.value })}
                className="min-w-0 flex-1 rounded-sm border border-transparent bg-transparent px-1 font-serif text-[14px] text-ink focus:border-border focus:bg-white focus:outline-none"
              />
              <input
                type="date"
                value={e.date ?? ""}
                onChange={(ev) =>
                  updateEvent(e.id, { date: ev.target.value || null })
                }
                className="rounded-sm border border-border bg-white px-2 py-1 font-mono text-[11px] text-ink-muted focus:border-ink focus:outline-none"
                style={{ fontFamily: "var(--font-mono)" }}
              />
              <button
                type="button"
                onClick={() => deleteEvent(e.id)}
                className="rounded p-1 text-ink-faint transition-colors hover:bg-ivory hover:text-rose"
                aria-label="Delete event"
              >
                <Trash2 size={12} strokeWidth={1.8} />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </SidePanel>
  );
}
