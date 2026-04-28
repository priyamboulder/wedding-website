"use client";

// ── Contributors tab ──────────────────────────────────────────────────────
// List of family + friends contributing to the budget. Columns: name,
// relationship, pledged, paid, remaining, funding coverage. Detail side
// panel lets the planner link a contributor to specific categories or
// invoices. visibility_scope travels with the record for future permission
// scoping but has no UI in this PR.

import { useMemo, useState } from "react";
import { Plus, Pencil, Trash2, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFinanceStore } from "@/stores/finance-store";
import { computeContributorRows } from "@/lib/finance/selectors";
import {
  formatDateShort,
  formatDollars,
  formatPct,
  parseDollarsToCents,
} from "@/lib/finance/format";
import type {
  ContributorVisibilityScope,
  FinanceCategoryId,
  FinanceContributor,
  FinanceContributorAllocation,
  FinanceInvoice,
  FinanceTransaction,
} from "@/types/finance";
import type { ContributorRow } from "@/lib/finance/selectors";
import {
  CategoryChip,
  FinanceActionButton,
  FinancePanelCard,
  FinanceStatTile,
  MonoCell,
  SidePanel,
} from "./shared";


interface Props {
  categoryFilter: FinanceCategoryId | null;
}

export function FinanceContributorsTab({ categoryFilter }: Props) {
  const contributors = useFinanceStore((s) => s.contributors);
  const allocations = useFinanceStore((s) => s.allocations);
  const invoices = useFinanceStore((s) => s.invoices);
  const transactions = useFinanceStore((s) => s.transactions);
  const deleteContributor = useFinanceStore((s) => s.deleteContributor);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [addingNew, setAddingNew] = useState(false);

  const rows = useMemo(
    () => computeContributorRows(contributors, allocations, transactions),
    [contributors, allocations, transactions],
  );

  const scoped = useMemo(() => {
    if (!categoryFilter) return rows;
    const cidSet = new Set(
      allocations
        .filter((a) => a.category_id === categoryFilter)
        .map((a) => a.contributor_id),
    );
    return rows.filter((r) => cidSet.has(r.id));
  }, [rows, categoryFilter, allocations]);

  const totals = useMemo(() => {
    const pledged = scoped.reduce((s, r) => s + r.pledged_cents, 0);
    const paid = scoped.reduce((s, r) => s + r.paid_cents, 0);
    const personal = scoped.reduce((s, r) => s + r.personal_spent_cents, 0);
    return {
      pledged,
      paid,
      remaining: pledged - paid,
      personal,
      grandTotal: paid + personal,
    };
  }, [scoped]);

  const editingContributor = editingId
    ? contributors.find((c) => c.id === editingId) ?? null
    : null;

  return (
    <div className="space-y-5">
      <section className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <FinanceStatTile
          label="Total pledged"
          value={formatDollars(totals.pledged)}
          hint={`${scoped.length} contributor${scoped.length === 1 ? "" : "s"}`}
          mono
        />
        <FinanceStatTile
          label="Paid into shared fund"
          value={formatDollars(totals.paid)}
          hint={formatPct(totals.pledged > 0 ? totals.paid / totals.pledged : 0)}
          tone="sage"
          mono
        />
        <FinanceStatTile
          label="Remaining pledges"
          value={formatDollars(totals.remaining)}
          mono
        />
        <FinanceStatTile
          label="Personal expenses"
          value={formatDollars(totals.personal)}
          hint="Outside shared fund"
          tone="gold"
          mono
        />
        <FinanceStatTile
          label="Grand total spend"
          value={formatDollars(totals.grandTotal)}
          hint="Shared paid + personal"
          tone="ink"
          mono
        />
      </section>

      <div className="flex items-center justify-end">
        <FinanceActionButton
          icon={<Plus size={13} strokeWidth={1.8} />}
          label="Add contributor"
          onClick={() => setAddingNew(true)}
          primary
        />
      </div>

      <FinancePanelCard className="overflow-hidden p-0">
        <table className="w-full border-collapse text-[12px]">
          <thead>
            <tr className="border-b border-border">
              <th className="px-3 py-2.5 text-left font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted" style={{ fontFamily: "var(--font-mono)" }}>Name</th>
              <th className="px-3 py-2.5 text-left font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted" style={{ fontFamily: "var(--font-mono)" }}>Relationship</th>
              <th className="px-3 py-2.5 text-right font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted" style={{ fontFamily: "var(--font-mono)" }}>Pledged</th>
              <th className="px-3 py-2.5 text-right font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted" style={{ fontFamily: "var(--font-mono)" }}>Paid (shared)</th>
              <th className="px-3 py-2.5 text-right font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted" style={{ fontFamily: "var(--font-mono)" }}>Remaining</th>
              <th className="px-3 py-2.5 text-right font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted" style={{ fontFamily: "var(--font-mono)" }}>Personal</th>
              <th className="px-3 py-2.5 text-right font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted" style={{ fontFamily: "var(--font-mono)" }}>Total spend</th>
              <th className="px-3 py-2.5 text-left font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted" style={{ fontFamily: "var(--font-mono)" }}>Funding</th>
              <th className="w-16 px-3 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {scoped.length === 0 && (
              <tr>
                <td colSpan={9} className="px-3 py-8 text-center text-[13px] text-ink-muted">
                  No contributors
                  {categoryFilter ? " for this category" : ""} yet.
                </td>
              </tr>
            )}
            {scoped.map((r) => (
              <ContributorListRow
                key={r.id}
                row={r}
                onEdit={() => setEditingId(r.id)}
                onDelete={() => deleteContributor(r.id)}
              />
            ))}
          </tbody>
        </table>
      </FinancePanelCard>

      {addingNew && (
        <ContributorFormPanel
          mode="create"
          onClose={() => setAddingNew(false)}
        />
      )}
      {editingContributor && (
        <ContributorDetailPanel
          contributor={editingContributor}
          allocations={allocations.filter((a) => a.contributor_id === editingContributor.id)}
          invoices={invoices}
          transactions={transactions.filter(
            (t) => t.payer_contributor_id === editingContributor.id,
          )}
          onClose={() => setEditingId(null)}
        />
      )}
    </div>
  );
}

function ContributorListRow({
  row,
  onEdit,
  onDelete,
}: {
  row: ContributorRow;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const pct = row.pledged_cents > 0 ? row.paid_cents / row.pledged_cents : 0;
  return (
    <tr className="border-b border-border/60 hover:bg-ivory/30">
      <td className="px-3 py-2.5">
        <button
          type="button"
          onClick={onEdit}
          className="text-left text-[12.5px] text-ink hover:text-saffron"
        >
          {row.name}
        </button>
      </td>
      <td className="px-3 py-2.5 text-[11.5px] text-ink-muted">
        {row.relationship}
      </td>
      <td className="px-3 py-2.5 text-right">
        <MonoCell value={formatDollars(row.pledged_cents)} />
      </td>
      <td className="px-3 py-2.5 text-right">
        <MonoCell value={formatDollars(row.paid_cents)} tone="sage" />
      </td>
      <td className="px-3 py-2.5 text-right">
        <MonoCell value={formatDollars(row.remaining_cents)} />
      </td>
      <td className="px-3 py-2.5 text-right">
        <MonoCell
          value={
            row.personal_spent_cents > 0
              ? formatDollars(row.personal_spent_cents)
              : "—"
          }
          tone={row.personal_spent_cents > 0 ? "gold" : "faint"}
        />
      </td>
      <td className="px-3 py-2.5 text-right">
        <MonoCell value={formatDollars(row.total_spend_cents)} />
      </td>
      <td className="px-3 py-2.5">
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-20 overflow-hidden rounded-full bg-ivory-deep">
            <span
              className="block h-full rounded-full bg-sage"
              style={{ width: `${Math.min(100, pct * 100)}%` }}
              aria-hidden
            />
          </div>
          <span
            className="font-mono text-[9.5px] tabular-nums text-ink-muted"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {formatPct(pct)} · {row.allocations_count} alloc
          </span>
        </div>
      </td>
      <td className="px-3 py-2.5">
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={onEdit}
            className="rounded p-1 text-ink-faint transition-colors hover:bg-ivory hover:text-saffron"
            aria-label="Edit contributor"
          >
            <Pencil size={12} strokeWidth={1.8} />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="rounded p-1 text-ink-faint transition-colors hover:bg-ivory hover:text-rose"
            aria-label="Delete contributor"
          >
            <Trash2 size={12} strokeWidth={1.8} />
          </button>
        </div>
      </td>
    </tr>
  );
}

// ── Create form ──────────────────────────────────────────────────────────

function ContributorFormPanel({
  mode,
  initial,
  onClose,
}: {
  mode: "create" | "edit";
  initial?: FinanceContributor;
  onClose: () => void;
}) {
  const addContributor = useFinanceStore((s) => s.addContributor);
  const updateContributor = useFinanceStore((s) => s.updateContributor);

  const [name, setName] = useState(initial?.name ?? "");
  const [relationship, setRelationship] = useState(initial?.relationship ?? "");
  const [pledged, setPledged] = useState(
    initial ? ((initial.pledged_cents ?? 0) / 100).toFixed(0) : "",
  );
  const [paid, setPaid] = useState(
    initial ? ((initial.paid_cents ?? 0) / 100).toFixed(0) : "",
  );
  const [scope, setScope] = useState<ContributorVisibilityScope>(initial?.visibility_scope ?? "all");
  const [notes, setNotes] = useState(initial?.notes ?? "");

  const pledgedCents = parseDollarsToCents(pledged);
  const paidCents = parseDollarsToCents(paid);
  const valid = name.trim().length > 0 && relationship.trim().length > 0 && pledgedCents != null;

  const save = () => {
    if (!valid || pledgedCents == null) return;
    if (mode === "create") {
      addContributor({
        name: name.trim(),
        relationship: relationship.trim(),
        pledged_cents: pledgedCents,
        paid_cents: paidCents ?? 0,
        visibility_scope: scope,
        notes: notes.trim() || null,
      });
    } else if (initial) {
      updateContributor(initial.id, {
        name: name.trim(),
        relationship: relationship.trim(),
        pledged_cents: pledgedCents,
        paid_cents: paidCents ?? 0,
        visibility_scope: scope,
        notes: notes.trim() || null,
      });
    }
    onClose();
  };

  return (
    <SidePanel
      title={mode === "create" ? "Add contributor" : "Edit contributor"}
      eyebrow="Contributor"
      onClose={onClose}
      footer={
        <div className="flex items-center justify-end gap-2">
          <FinanceActionButton label="Cancel" onClick={onClose} />
          <FinanceActionButton label="Save" primary onClick={save} disabled={!valid} />
        </div>
      }
    >
      <div className="space-y-4">
        <Field label="Name">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Shalini & Vikram Patel"
            className="w-full rounded-md border border-border bg-white px-3 py-2 text-[12.5px] text-ink placeholder:text-ink-faint focus:border-ink focus:outline-none"
          />
        </Field>

        <Field label="Relationship">
          <input
            type="text"
            value={relationship}
            onChange={(e) => setRelationship(e.target.value)}
            placeholder="e.g. Bride's parents"
            className="w-full rounded-md border border-border bg-white px-3 py-2 text-[12.5px] text-ink placeholder:text-ink-faint focus:border-ink focus:outline-none"
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Pledged (USD)">
            <div className="flex items-center gap-1">
              <span className="text-ink-faint">$</span>
              <input
                type="text"
                inputMode="decimal"
                value={pledged}
                onChange={(e) => setPledged(e.target.value.replace(/[^0-9,.]/g, ""))}
                className="w-full rounded-md border border-border bg-white px-2 py-2 text-right font-mono text-[12.5px] tabular-nums text-ink focus:border-ink focus:outline-none"
                style={{ fontFamily: "var(--font-mono)" }}
              />
            </div>
          </Field>
          <Field label="Paid (USD)">
            <div className="flex items-center gap-1">
              <span className="text-ink-faint">$</span>
              <input
                type="text"
                inputMode="decimal"
                value={paid}
                onChange={(e) => setPaid(e.target.value.replace(/[^0-9,.]/g, ""))}
                className="w-full rounded-md border border-border bg-white px-2 py-2 text-right font-mono text-[12.5px] tabular-nums text-ink focus:border-ink focus:outline-none"
                style={{ fontFamily: "var(--font-mono)" }}
              />
            </div>
          </Field>
        </div>

        <Field label="Visibility">
          <select
            value={scope}
            onChange={(e) => setScope(e.target.value as ContributorVisibilityScope)}
            className="w-full rounded-md border border-border bg-white px-3 py-2 text-[12.5px] text-ink focus:border-ink focus:outline-none"
          >
            <option value="all">Visible to everyone</option>
            <option value="self">Only this contributor</option>
            <option value="named_categories">Only named categories</option>
          </select>
          <p className="mt-1 text-[10.5px] text-ink-faint">
            Stored for future permissioning. No effect in this release.
          </p>
        </Field>

        <Field label="Notes">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="e.g. Covering venue + catering only."
            className="w-full rounded-md border border-border bg-white px-3 py-2 text-[12.5px] text-ink placeholder:text-ink-faint focus:border-ink focus:outline-none"
          />
        </Field>
      </div>
    </SidePanel>
  );
}

// ── Detail panel with allocations ────────────────────────────────────────

function ContributorDetailPanel({
  contributor,
  allocations,
  invoices,
  transactions,
  onClose,
}: {
  contributor: FinanceContributor;
  allocations: FinanceContributorAllocation[];
  invoices: FinanceInvoice[];
  transactions: FinanceTransaction[];
  onClose: () => void;
}) {
  const addAllocation = useFinanceStore((s) => s.addAllocation);
  const deleteAllocation = useFinanceStore((s) => s.deleteAllocation);
  const updateContributor = useFinanceStore((s) => s.updateContributor);
  const storeCategories = useFinanceStore((s) => s.categories);
  const activeCategories = storeCategories.filter((c) => !c.hidden);

  const [editing, setEditing] = useState(false);
  const [allocKind, setAllocKind] = useState<"category" | "invoice">("category");
  const [allocCategory, setAllocCategory] = useState<FinanceCategoryId>(
    activeCategories[0]?.id ?? "venue",
  );
  const [allocInvoiceId, setAllocInvoiceId] = useState<string>(invoices[0]?.id ?? "");
  const [allocAmount, setAllocAmount] = useState("");
  const [allocNote, setAllocNote] = useState("");

  const allocTotal = allocations.reduce((s, a) => s + a.amount_cents, 0);

  const addAlloc = () => {
    const cents = parseDollarsToCents(allocAmount);
    if (cents == null || cents <= 0) return;
    addAllocation({
      contributor_id: contributor.id,
      category_id: allocKind === "category" ? allocCategory : null,
      invoice_id: allocKind === "invoice" ? allocInvoiceId : null,
      amount_cents: cents,
      note: allocNote.trim() || null,
    });
    setAllocAmount("");
    setAllocNote("");
  };

  if (editing) {
    return (
      <ContributorFormPanel
        mode="edit"
        initial={contributor}
        onClose={() => {
          setEditing(false);
          onClose();
        }}
      />
    );
  }

  const sharedTxns = transactions.filter((t) => t.fund_source !== "personal");
  const personalTxns = transactions.filter((t) => t.fund_source === "personal");
  const personalTotal = personalTxns.reduce((s, t) => s + t.amount_cents, 0);
  const totalSpend = contributor.paid_cents + personalTotal;

  return (
    <SidePanel
      title={contributor.name}
      eyebrow={contributor.relationship}
      onClose={onClose}
      widthClass="w-[560px]"
    >
      <div className="space-y-5">
        {/* Summary */}
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          <SummaryCell label="Pledged" value={formatDollars(contributor.pledged_cents)} />
          <SummaryCell
            label="Paid (shared)"
            value={formatDollars(contributor.paid_cents)}
            tone="sage"
          />
          <SummaryCell
            label="Personal"
            value={formatDollars(personalTotal)}
            tone={personalTotal > 0 ? "gold" : undefined}
          />
          <SummaryCell
            label="Total spend"
            value={formatDollars(totalSpend)}
          />
        </div>

        <p className="rounded-md border border-sage/30 bg-sage/5 px-3 py-2 text-[12.5px] leading-relaxed text-ink">
          You've contributed{" "}
          <span className="font-medium">{formatDollars(contributor.paid_cents)}</span>{" "}
          to the shared fund
          {personalTotal > 0
            ? ` and spent ${formatDollars(personalTotal)} on personal wedding expenses`
            : ""}
          . Your total wedding spend is{" "}
          <span className="font-medium">{formatDollars(totalSpend)}</span>.
        </p>

        {contributor.notes && (
          <p className="rounded-md border border-border bg-ivory/40 px-3 py-2 text-[12.5px] text-ink-muted">
            {contributor.notes}
          </p>
        )}

        {/* Shared-fund transactions */}
        <TxnGroup
          eyebrow="Shared-fund transactions"
          transactions={sharedTxns}
          empty="No shared-fund transactions tagged to this contributor yet."
          tone="sage"
        />

        {/* Personal transactions */}
        <TxnGroup
          eyebrow="Personal expenses"
          transactions={personalTxns}
          empty="No personal wedding expenses tracked yet."
          tone="gold"
        />

        <div>
          <div className="mb-2 flex items-center justify-between">
            <p
              className="font-mono text-[10px] uppercase tracking-[0.14em] text-saffron"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Allocations
            </p>
            <span
              className="font-mono text-[10px] tabular-nums text-ink-muted"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {formatDollars(allocTotal)} allocated · {formatPct(contributor.pledged_cents > 0 ? allocTotal / contributor.pledged_cents : 0)}
            </span>
          </div>
          {allocations.length === 0 ? (
            <p className="text-[12.5px] text-ink-muted">No allocations yet.</p>
          ) : (
            <ul className="space-y-1.5">
              {allocations.map((a) => {
                const inv = a.invoice_id ? invoices.find((i) => i.id === a.invoice_id) : null;
                return (
                  <li
                    key={a.id}
                    className="flex items-center justify-between gap-2 rounded-md border border-border bg-white px-3 py-2"
                  >
                    <div className="min-w-0 flex-1">
                      {a.category_id ? (
                        <CategoryChip category={a.category_id} size="xs" />
                      ) : inv ? (
                        <span className="text-[12.5px] text-ink">
                          Invoice · {inv.vendor_name_fallback ?? "Unknown"}
                        </span>
                      ) : (
                        <span className="text-[12.5px] text-ink-faint">Unlinked</span>
                      )}
                      {a.note && (
                        <p className="mt-0.5 text-[11px] text-ink-muted">{a.note}</p>
                      )}
                    </div>
                    <MonoCell value={formatDollars(a.amount_cents)} />
                    <button
                      type="button"
                      onClick={() => deleteAllocation(a.id)}
                      className="rounded p-1 text-ink-faint transition-colors hover:bg-ivory hover:text-rose"
                      aria-label="Remove allocation"
                    >
                      <Trash2 size={11} strokeWidth={1.8} />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Add allocation form */}
        <div className="rounded-md border border-dashed border-border bg-ivory/30 px-3 py-3">
          <p
            className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Add allocation
          </p>
          <div className="mb-2 flex gap-1.5">
            <button
              type="button"
              onClick={() => setAllocKind("category")}
              className={cn(
                "rounded-sm border px-2 py-1 font-mono text-[10px] uppercase tracking-[0.1em]",
                allocKind === "category"
                  ? "border-ink bg-ink text-ivory"
                  : "border-border bg-white text-ink-muted",
              )}
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Category
            </button>
            <button
              type="button"
              onClick={() => setAllocKind("invoice")}
              className={cn(
                "rounded-sm border px-2 py-1 font-mono text-[10px] uppercase tracking-[0.1em]",
                allocKind === "invoice"
                  ? "border-ink bg-ink text-ivory"
                  : "border-border bg-white text-ink-muted",
              )}
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Invoice
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {allocKind === "category" ? (
              <select
                value={allocCategory}
                onChange={(e) => setAllocCategory(e.target.value)}
                className="rounded-md border border-border bg-white px-2 py-1.5 text-[12px] text-ink focus:border-ink focus:outline-none"
              >
                {activeCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            ) : (
              <select
                value={allocInvoiceId}
                onChange={(e) => setAllocInvoiceId(e.target.value)}
                className="rounded-md border border-border bg-white px-2 py-1.5 text-[12px] text-ink focus:border-ink focus:outline-none"
              >
                {invoices.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.vendor_name_fallback ?? "Unknown"} · {formatDollars(i.amount_cents)}
                  </option>
                ))}
              </select>
            )}
            <div className="flex items-center gap-1">
              <span className="text-ink-faint">$</span>
              <input
                type="text"
                inputMode="decimal"
                value={allocAmount}
                onChange={(e) => setAllocAmount(e.target.value.replace(/[^0-9,.]/g, ""))}
                placeholder="0"
                className="w-full rounded-md border border-border bg-white px-2 py-1.5 text-right font-mono text-[12px] tabular-nums text-ink focus:border-ink focus:outline-none"
                style={{ fontFamily: "var(--font-mono)" }}
              />
            </div>
          </div>
          <input
            type="text"
            value={allocNote}
            onChange={(e) => setAllocNote(e.target.value)}
            placeholder="Optional note"
            className="mt-2 w-full rounded-md border border-border bg-white px-2 py-1.5 text-[12px] text-ink placeholder:text-ink-faint focus:border-ink focus:outline-none"
          />
          <div className="mt-2 flex justify-end">
            <FinanceActionButton
              label="Add"
              icon={<Plus size={12} strokeWidth={1.8} />}
              onClick={addAlloc}
            />
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-border pt-3">
          <button
            type="button"
            onClick={() => {
              updateContributor(contributor.id, {
                paid_cents: contributor.pledged_cents,
              });
            }}
            className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted hover:text-sage"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            <Heart size={11} strokeWidth={1.8} /> Mark fully paid
          </button>
          <FinanceActionButton
            label="Edit contributor"
            icon={<Pencil size={12} strokeWidth={1.8} />}
            onClick={() => setEditing(true)}
          />
        </div>
      </div>
    </SidePanel>
  );
}

function SummaryCell({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "sage" | "rose" | "gold";
}) {
  return (
    <div className="rounded-md border border-border bg-white px-3 py-2">
      <p
        className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-muted"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {label}
      </p>
      <p
        className={cn(
          "mt-1 font-mono text-[14px] tabular-nums",
          tone === "sage" && "text-sage",
          tone === "rose" && "text-rose",
          tone === "gold" && "text-gold",
          !tone && "text-ink",
        )}
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {value}
      </p>
    </div>
  );
}

function TxnGroup({
  eyebrow,
  transactions,
  empty,
  tone,
}: {
  eyebrow: string;
  transactions: FinanceTransaction[];
  empty: string;
  tone: "sage" | "gold";
}) {
  const total = transactions.reduce((s, t) => s + t.amount_cents, 0);
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <p
          className="font-mono text-[10px] uppercase tracking-[0.14em] text-saffron"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {eyebrow}
        </p>
        <span
          className="font-mono text-[10px] tabular-nums text-ink-muted"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {transactions.length} · {formatDollars(total)}
        </span>
      </div>
      {transactions.length === 0 ? (
        <p className="text-[12.5px] text-ink-muted">{empty}</p>
      ) : (
        <ul className="max-h-48 space-y-1 overflow-y-auto pr-1">
          {transactions
            .slice()
            .sort((a, b) => b.date.localeCompare(a.date))
            .map((t) => (
              <li
                key={t.id}
                className="flex items-center justify-between gap-2 rounded-md border border-border bg-white px-3 py-1.5 text-[11.5px]"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-ink">{t.description}</p>
                  <p
                    className="font-mono text-[9px] uppercase tracking-[0.1em] text-ink-faint"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {formatDateShort(t.date)}
                    {t.account_last4 ? ` · ••${t.account_last4}` : ""}
                    {t.invoice_id ? " · linked" : ""}
                  </p>
                </div>
                {t.category_id && (
                  <CategoryChip category={t.category_id} size="xs" />
                )}
                <MonoCell value={formatDollars(t.amount_cents)} tone={tone} />
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span
        className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {label}
      </span>
      {children}
    </label>
  );
}
