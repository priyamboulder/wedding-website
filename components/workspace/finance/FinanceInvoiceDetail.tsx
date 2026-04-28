"use client";

// ── Invoice detail panel ─────────────────────────────────────────────────
// Slide-over with three sections: payment milestones, threaded comments,
// and an auto-generated activity log. Header surfaces vendor / amount /
// status with a progress bar of how much of the invoice has been paid.
//
// All mutations route through the finance store so Supabase swap-over is
// a one-file change. Status auto-derives from milestones via
// recomputeInvoiceStatus once milestones exist.

import { useMemo, useState } from "react";
import {
  CheckCircle2,
  Circle,
  Clock,
  ExternalLink,
  FileUp,
  Pencil,
  Pin,
  PinOff,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useFinanceStore } from "@/stores/finance-store";
import {
  daysUntil,
  formatDateLong,
  formatDateShort,
  formatDollars,
  formatPct,
  isoToday,
  parseDollarsToCents,
} from "@/lib/finance/format";
import type {
  FinanceInvoice,
  FinanceInvoiceMilestone,
  FinancePaymentMethod,
  MilestoneStatus,
} from "@/types/finance";
import {
  INVOICE_STATUS_LABEL,
  INVOICE_STATUS_TONE,
  PAYMENT_METHOD_LABEL,
} from "@/types/finance";
import {
  CategoryChip,
  FinanceActionButton,
  SidePanel,
} from "./shared";

interface Props {
  invoice: FinanceInvoice;
  onClose: () => void;
}

export function FinanceInvoiceDetail({ invoice, onClose }: Props) {
  const milestones = useFinanceStore((s) =>
    s.invoiceMilestones
      .filter((m) => m.invoice_id === invoice.id)
      .slice()
      .sort((a, b) => a.sort_order - b.sort_order),
  );
  const comments = useFinanceStore((s) =>
    s.invoiceComments
      .filter((c) => c.invoice_id === invoice.id)
      .slice()
      .sort((a, b) => {
        if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
        return b.created_at.localeCompare(a.created_at);
      }),
  );
  const activity = useFinanceStore((s) =>
    s.invoiceActivity
      .filter((a) => a.invoice_id === invoice.id)
      .slice()
      .sort((a, b) => b.created_at.localeCompare(a.created_at)),
  );

  const totals = useMemo(() => {
    const totalMilestones = milestones.reduce(
      (s, m) => s + m.amount_cents,
      0,
    );
    const paid = milestones
      .filter((m) => m.status === "paid")
      .reduce((s, m) => s + m.amount_cents, 0);
    const remaining = invoice.amount_cents - paid;
    const pct = invoice.amount_cents > 0 ? paid / invoice.amount_cents : 0;
    return { totalMilestones, paid, remaining, pct };
  }, [milestones, invoice.amount_cents]);

  return (
    <SidePanel
      title={invoice.vendor_name_fallback ?? "Invoice"}
      eyebrow={
        invoice.invoice_number
          ? `Invoice · ${invoice.invoice_number}`
          : "Invoice"
      }
      onClose={onClose}
      widthClass="w-[680px]"
    >
      <div className="space-y-6">
        <Header invoice={invoice} totals={totals} />

        {invoice.pdf_url && (
          <a
            href={invoice.pdf_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-md border border-border bg-ivory/30 px-3 py-2 text-[12.5px] text-ink hover:border-saffron hover:bg-white"
          >
            <FileUp size={14} strokeWidth={1.6} className="text-ink-muted" />
            <span className="flex-1 truncate">
              {invoice.pdf_filename ?? "Uploaded invoice"}
            </span>
            <ExternalLink size={12} strokeWidth={1.6} className="text-ink-faint" />
          </a>
        )}

        <MilestonesSection invoice={invoice} milestones={milestones} />
        <CommentsSection invoice={invoice} comments={comments} />
        <ActivitySection activity={activity} />
      </div>
    </SidePanel>
  );
}

// ── Header with progress bar ─────────────────────────────────────────────

function Header({
  invoice,
  totals,
}: {
  invoice: FinanceInvoice;
  totals: { paid: number; remaining: number; pct: number };
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <CategoryChip category={invoice.category_id} size="sm" />
          <span className="inline-flex items-center gap-1.5 rounded-sm border border-border bg-white px-2 py-0.5">
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                INVOICE_STATUS_TONE[invoice.status],
              )}
            />
            <span
              className="font-mono text-[10px] uppercase tracking-[0.1em] text-ink"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {INVOICE_STATUS_LABEL[invoice.status]}
            </span>
          </span>
        </div>
        <div className="text-right">
          <p
            className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-muted"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Invoice total
          </p>
          <p
            className="font-mono text-[18px] tabular-nums text-ink"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {formatDollars(invoice.amount_cents)}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex items-baseline justify-between text-[11.5px] text-ink-muted">
          <span>
            <span className="font-medium text-ink">
              {formatDollars(totals.paid)}
            </span>{" "}
            paid
          </span>
          <span>
            {formatDollars(totals.remaining)} remaining ·{" "}
            {formatPct(totals.pct)}
          </span>
        </div>
        <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-ivory-deep">
          <span
            className="block h-full rounded-full bg-sage transition-all"
            style={{ width: `${Math.min(100, totals.pct * 100)}%` }}
          />
        </div>
      </div>

      <div className="flex items-baseline justify-between text-[11.5px] text-ink-muted">
        <span>
          Due {formatDateLong(invoice.due_date)}
          {invoice.status !== "paid" && (
            <DueHint due_date={invoice.due_date} />
          )}
        </span>
      </div>

      {invoice.notes && (
        <p className="rounded-md border border-border bg-ivory/40 px-3 py-2 text-[12.5px] text-ink-muted">
          {invoice.notes}
        </p>
      )}
    </section>
  );
}

function DueHint({ due_date }: { due_date: string }) {
  const delta = daysUntil(due_date);
  if (delta < 0)
    return (
      <span className="ml-2 text-rose">{-delta}d overdue</span>
    );
  if (delta === 0) return <span className="ml-2 text-gold">today</span>;
  if (delta <= 7) return <span className="ml-2 text-gold">in {delta}d</span>;
  return null;
}

// ── Milestones section ───────────────────────────────────────────────────

function MilestonesSection({
  invoice,
  milestones,
}: {
  invoice: FinanceInvoice;
  milestones: FinanceInvoiceMilestone[];
}) {
  const addMilestone = useFinanceStore((s) => s.addMilestone);
  const updateMilestone = useFinanceStore((s) => s.updateMilestone);
  const deleteMilestone = useFinanceStore((s) => s.deleteMilestone);
  const markPaid = useFinanceStore((s) => s.markMilestonePaid);

  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);

  const totalMs = milestones.reduce((s, m) => s + m.amount_cents, 0);
  const remainingToCover = invoice.amount_cents - totalMs;

  return (
    <section>
      <SectionHeader
        title="Payment milestones"
        right={
          !adding ? (
            <FinanceActionButton
              icon={<Plus size={12} strokeWidth={1.8} />}
              label="Add milestone"
              onClick={() => setAdding(true)}
            />
          ) : null
        }
      />

      {milestones.length === 0 && !adding && (
        <div className="rounded-md border border-dashed border-border bg-ivory/30 px-4 py-5 text-center">
          <p className="text-[12.5px] text-ink-muted">
            No milestones yet. Add the deposit, mid-point, and final balance to
            track paid/unpaid against the total.
          </p>
        </div>
      )}

      {milestones.length > 0 && (
        <ol className="space-y-2">
          {milestones.map((m) =>
            editing === m.id ? (
              <MilestoneForm
                key={m.id}
                invoiceId={invoice.id}
                initial={m}
                onClose={() => setEditing(null)}
              />
            ) : (
              <MilestoneRow
                key={m.id}
                milestone={m}
                invoiceTotal={invoice.amount_cents}
                onMarkPaid={() => markPaid(m.id)}
                onEdit={() => setEditing(m.id)}
                onDelete={() => deleteMilestone(m.id)}
              />
            ),
          )}
        </ol>
      )}

      {adding && (
        <div className="mt-2">
          <MilestoneForm
            invoiceId={invoice.id}
            suggestedAmount={Math.max(0, remainingToCover)}
            suggestedDueDate={invoice.due_date}
            onClose={() => setAdding(false)}
          />
        </div>
      )}

      {milestones.length > 0 && remainingToCover !== 0 && (
        <p
          className={cn(
            "mt-2 text-[11px]",
            remainingToCover > 0 ? "text-ink-muted" : "text-rose",
          )}
        >
          {remainingToCover > 0
            ? `${formatDollars(remainingToCover)} of the total is not yet covered by milestones.`
            : `Milestones exceed invoice total by ${formatDollars(-remainingToCover)}.`}
        </p>
      )}
    </section>
  );
}

function MilestoneRow({
  milestone,
  invoiceTotal,
  onMarkPaid,
  onEdit,
  onDelete,
}: {
  milestone: FinanceInvoiceMilestone;
  invoiceTotal: number;
  onMarkPaid: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const today = isoToday();
  const isOverdue = milestone.status !== "paid" && milestone.due_date < today;
  const paid = milestone.status === "paid";
  const pct = invoiceTotal > 0 ? milestone.amount_cents / invoiceTotal : 0;

  return (
    <li
      className={cn(
        "rounded-md border bg-white px-3 py-2.5",
        paid
          ? "border-sage/40 bg-sage/5"
          : isOverdue
            ? "border-rose/40 bg-rose/5"
            : "border-border",
      )}
    >
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={onMarkPaid}
          disabled={paid}
          className={cn(
            "mt-0.5 shrink-0 rounded-full transition-colors",
            paid
              ? "text-sage"
              : "text-ink-faint hover:text-sage",
          )}
          aria-label={paid ? "Already paid" : "Mark milestone paid"}
        >
          {paid ? (
            <CheckCircle2 size={18} strokeWidth={1.6} />
          ) : (
            <Circle size={18} strokeWidth={1.6} />
          )}
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-3">
            <p className="font-serif text-[14px] text-ink">{milestone.name}</p>
            <span
              className="font-mono text-[12.5px] tabular-nums text-ink"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {formatDollars(milestone.amount_cents)}
            </span>
          </div>
          <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[11px] text-ink-muted">
            <span
              className="font-mono uppercase tracking-[0.1em]"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {pct > 0 ? `${Math.round(pct * 100)}%` : "—"} · Due{" "}
              {formatDateShort(milestone.due_date)}
            </span>
            {paid && milestone.paid_date && (
              <span className="text-sage">
                Paid {formatDateShort(milestone.paid_date)}
                {milestone.payment_method &&
                  ` · ${PAYMENT_METHOD_LABEL[milestone.payment_method]}`}
              </span>
            )}
            {!paid && isOverdue && (
              <span className="text-rose">
                {-daysUntil(milestone.due_date)}d overdue
              </span>
            )}
            {milestone.payment_reference && (
              <span
                className="font-mono text-[10px] tabular-nums text-ink-faint"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {milestone.payment_reference}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onEdit}
            aria-label="Edit milestone"
            className="rounded p-1 text-ink-faint transition-colors hover:bg-ivory hover:text-ink"
          >
            <Pencil size={11} strokeWidth={1.8} />
          </button>
          <button
            type="button"
            onClick={onDelete}
            aria-label="Delete milestone"
            className="rounded p-1 text-ink-faint transition-colors hover:bg-ivory hover:text-rose"
          >
            <Trash2 size={11} strokeWidth={1.8} />
          </button>
        </div>
      </div>
    </li>
  );
}

function MilestoneForm({
  invoiceId,
  initial,
  suggestedAmount,
  suggestedDueDate,
  onClose,
}: {
  invoiceId: string;
  initial?: FinanceInvoiceMilestone;
  suggestedAmount?: number;
  suggestedDueDate?: string;
  onClose: () => void;
}) {
  const addMilestone = useFinanceStore((s) => s.addMilestone);
  const updateMilestone = useFinanceStore((s) => s.updateMilestone);
  const markPaid = useFinanceStore((s) => s.markMilestonePaid);
  const transactions = useFinanceStore((s) => s.transactions);

  const [name, setName] = useState(initial?.name ?? "");
  const [amount, setAmount] = useState(
    initial
      ? (initial.amount_cents / 100).toFixed(0)
      : suggestedAmount && suggestedAmount > 0
        ? (suggestedAmount / 100).toFixed(0)
        : "",
  );
  const [dueDate, setDueDate] = useState(
    initial?.due_date ?? suggestedDueDate ?? isoToday(),
  );
  const [status, setStatus] = useState<MilestoneStatus>(
    initial?.status ?? "unpaid",
  );
  const [paidDate, setPaidDate] = useState(initial?.paid_date ?? isoToday());
  const [paymentMethod, setPaymentMethod] = useState<FinancePaymentMethod | "">(
    initial?.payment_method ?? "",
  );
  const [paymentRef, setPaymentRef] = useState(initial?.payment_reference ?? "");
  const [transactionId, setTransactionId] = useState(
    initial?.transaction_id ?? "",
  );

  const cents = parseDollarsToCents(amount) ?? 0;
  const valid = name.trim().length > 0 && cents > 0 && !!dueDate;

  const submit = () => {
    if (!valid) return;
    if (initial) {
      updateMilestone(initial.id, {
        name: name.trim(),
        amount_cents: cents,
        due_date: dueDate,
        status,
        paid_date: status === "paid" ? paidDate : null,
        payment_method:
          status === "paid" && paymentMethod ? paymentMethod : null,
        payment_reference:
          status === "paid" ? paymentRef.trim() || null : null,
        transaction_id:
          status === "paid" ? transactionId || null : null,
      });
    } else {
      const created = addMilestone({
        invoice_id: invoiceId,
        name: name.trim(),
        amount_cents: cents,
        due_date: dueDate,
        status: status === "paid" ? "unpaid" : status,
      });
      if (status === "paid") {
        markPaid(created.id, {
          payment_method: paymentMethod || undefined,
          payment_reference: paymentRef.trim() || undefined,
          transaction_id: transactionId || undefined,
          paid_date: paidDate,
        });
      }
    }
    onClose();
  };

  return (
    <div className="space-y-3 rounded-md border border-ink/30 bg-white p-3">
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        <Field label="Name">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Mid-point payment"
            className="w-full rounded-md border border-border bg-white px-2 py-1.5 text-[12.5px] text-ink focus:border-ink focus:outline-none"
          />
        </Field>
        <Field label="Amount (USD)">
          <div className="flex items-center gap-1">
            <span className="text-ink-faint">$</span>
            <input
              type="text"
              inputMode="decimal"
              value={amount}
              onChange={(e) =>
                setAmount(e.target.value.replace(/[^0-9,.]/g, ""))
              }
              className="w-full rounded-md border border-border bg-white px-2 py-1.5 text-right font-mono text-[12.5px] tabular-nums text-ink focus:border-ink focus:outline-none"
              style={{ fontFamily: "var(--font-mono)" }}
            />
          </div>
        </Field>
      </div>
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        <Field label="Due date">
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full rounded-md border border-border bg-white px-2 py-1.5 text-[12.5px] text-ink focus:border-ink focus:outline-none"
          />
        </Field>
        <Field label="Status">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as MilestoneStatus)}
            className="w-full rounded-md border border-border bg-white px-2 py-1.5 text-[12.5px] text-ink focus:border-ink focus:outline-none"
          >
            <option value="unpaid">Unpaid</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
          </select>
        </Field>
      </div>
      {status === "paid" && (
        <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
          <Field label="Paid date">
            <input
              type="date"
              value={paidDate}
              onChange={(e) => setPaidDate(e.target.value)}
              className="w-full rounded-md border border-border bg-white px-2 py-1.5 text-[12.5px] text-ink focus:border-ink focus:outline-none"
            />
          </Field>
          <Field label="Method">
            <select
              value={paymentMethod}
              onChange={(e) =>
                setPaymentMethod(
                  e.target.value as FinancePaymentMethod | "",
                )
              }
              className="w-full rounded-md border border-border bg-white px-2 py-1.5 text-[12.5px] text-ink focus:border-ink focus:outline-none"
            >
              <option value="">—</option>
              {(Object.keys(PAYMENT_METHOD_LABEL) as FinancePaymentMethod[]).map(
                (m) => (
                  <option key={m} value={m}>
                    {PAYMENT_METHOD_LABEL[m]}
                  </option>
                ),
              )}
            </select>
          </Field>
          <Field label="Reference">
            <input
              type="text"
              value={paymentRef}
              onChange={(e) => setPaymentRef(e.target.value)}
              placeholder="Confirmation #"
              className="w-full rounded-md border border-border bg-white px-2 py-1.5 text-[12.5px] text-ink focus:border-ink focus:outline-none"
            />
          </Field>
          <div className="md:col-span-3">
            <Field label="Linked transaction (optional)">
              <select
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                className="w-full rounded-md border border-border bg-white px-2 py-1.5 text-[12.5px] text-ink focus:border-ink focus:outline-none"
              >
                <option value="">— None</option>
                {transactions.map((t) => (
                  <option key={t.id} value={t.id}>
                    {formatDateShort(t.date)} · {t.description.slice(0, 32)} ·{" "}
                    {formatDollars(t.amount_cents)}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </div>
      )}
      <div className="flex items-center justify-end gap-2">
        <FinanceActionButton label="Cancel" onClick={onClose} />
        <FinanceActionButton
          label={initial ? "Save" : "Add"}
          primary
          disabled={!valid}
          onClick={submit}
        />
      </div>
    </div>
  );
}

// ── Comments section ─────────────────────────────────────────────────────

function CommentsSection({
  invoice,
  comments,
}: {
  invoice: FinanceInvoice;
  comments: ReturnType<typeof useFinanceStore.getState>["invoiceComments"];
}) {
  const addComment = useFinanceStore((s) => s.addComment);
  const togglePin = useFinanceStore((s) => s.toggleCommentPin);
  const deleteComment = useFinanceStore((s) => s.deleteComment);

  const [draft, setDraft] = useState("");
  const [author, setAuthor] = useState("Me");

  const submit = () => {
    if (!draft.trim()) return;
    addComment(invoice.id, draft, author.trim() || "You");
    setDraft("");
  };

  return (
    <section>
      <SectionHeader title="Notes & comments" />
      <div className="mb-3 space-y-2">
        <div className="flex gap-2">
          <input
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Your name"
            className="w-28 rounded-md border border-border bg-white px-2 py-1.5 text-[11.5px] text-ink focus:border-ink focus:outline-none"
          />
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                submit();
              }
            }}
            placeholder="Leave a note for the team. Use @name to tag a contributor."
            rows={2}
            className="flex-1 resize-none rounded-md border border-border bg-white px-3 py-1.5 text-[12.5px] text-ink focus:border-ink focus:outline-none"
          />
        </div>
        <div className="flex items-center justify-between">
          <span
            className="font-mono text-[9.5px] uppercase tracking-[0.1em] text-ink-faint"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            ⌘↵ to post
          </span>
          <FinanceActionButton
            label="Post comment"
            primary
            disabled={!draft.trim()}
            onClick={submit}
          />
        </div>
      </div>

      {comments.length === 0 ? (
        <p className="text-[12px] text-ink-muted">No comments yet.</p>
      ) : (
        <ul className="space-y-2">
          {comments.map((c) => (
            <li
              key={c.id}
              className={cn(
                "rounded-md border px-3 py-2",
                c.pinned
                  ? "border-gold/50 bg-gold-light/20"
                  : "border-border bg-white",
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-baseline gap-2">
                  <p className="font-serif text-[13px] text-ink">
                    {c.author_name}
                  </p>
                  <span
                    className="font-mono text-[9.5px] uppercase tracking-[0.1em] text-ink-faint"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {formatDateLong(c.created_at)}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => togglePin(c.id)}
                    className={cn(
                      "rounded p-1 transition-colors hover:bg-ivory",
                      c.pinned
                        ? "text-gold hover:text-saffron"
                        : "text-ink-faint hover:text-ink",
                    )}
                    aria-label={c.pinned ? "Unpin comment" : "Pin comment"}
                  >
                    {c.pinned ? (
                      <Pin size={11} strokeWidth={1.8} />
                    ) : (
                      <PinOff size={11} strokeWidth={1.8} />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteComment(c.id)}
                    aria-label="Delete comment"
                    className="rounded p-1 text-ink-faint transition-colors hover:bg-ivory hover:text-rose"
                  >
                    <Trash2 size={11} strokeWidth={1.8} />
                  </button>
                </div>
              </div>
              <p className="mt-1 whitespace-pre-wrap text-[13px] leading-relaxed text-ink">
                {c.body}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

// ── Activity section ─────────────────────────────────────────────────────

function ActivitySection({
  activity,
}: {
  activity: ReturnType<typeof useFinanceStore.getState>["invoiceActivity"];
}) {
  if (activity.length === 0) return null;
  return (
    <section>
      <SectionHeader title="Activity" />
      <ol className="space-y-2 border-l border-border pl-4">
        {activity.map((a) => (
          <li key={a.id} className="relative">
            <span
              className="absolute -left-[19px] top-1.5 h-2 w-2 rounded-full bg-saffron"
              aria-hidden
            />
            <p className="text-[12.5px] text-ink">{a.message}</p>
            <p
              className="mt-0.5 font-mono text-[9.5px] uppercase tracking-[0.1em] text-ink-faint"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {a.actor_name ? `${a.actor_name} · ` : ""}
              {formatDateLong(a.created_at)}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}

// ── Local primitives ─────────────────────────────────────────────────────

function SectionHeader({
  title,
  right,
}: {
  title: string;
  right?: React.ReactNode;
}) {
  return (
    <header className="mb-3 flex items-baseline justify-between">
      <h4
        className="font-mono text-[10px] uppercase tracking-[0.16em] text-saffron"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {title}
      </h4>
      {right}
    </header>
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
    <label className="block">
      <span
        className="mb-1 block font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-muted"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {label}
      </span>
      {children}
    </label>
  );
}
