"use client";

// ── Contracts block ────────────────────────────────────────────────────────
// Planner is the sole editor of financial terms. The couple can countersign
// (Priya / Arjun each), comment on payment rows (not wired yet), and see
// every field. Vendor view never reaches this block.
//
// State is carried in workspace-store.contracts and mutated via
// markMilestonePaid + countersignContract. Both sides read the same fields;
// action visibility is gated on currentRole.

import { useMemo } from "react";
import {
  CheckCircle2,
  CircleDollarSign,
  FileText,
  Paperclip,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useVendorsStore } from "@/stores/vendors-store";
import { useWorkspaceStore } from "@/stores/workspace-store";
import {
  CONTRACT_STATUS_LABEL,
  type PaymentMilestone,
  type WorkspaceCategory,
  type WorkspaceContract,
} from "@/types/workspace";
import { useRoleLabel } from "@/lib/couple-identity";

function formatRupee(amount: number): string {
  if (amount >= 10_000_000) return `₹${(amount / 10_000_000).toFixed(2)}Cr`;
  if (amount >= 100_000) return `₹${(amount / 100_000).toFixed(2)}L`;
  return `₹${amount.toLocaleString("en-IN")}`;
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function ContractsBlock({ category }: { category: WorkspaceCategory }) {
  const allContracts = useWorkspaceStore((s) => s.contracts);
  const contracts = useMemo(
    () =>
      allContracts
        .filter((c) => c.category_id === category.id)
        .sort(
          (a, b) =>
            new Date(a.created_at).getTime() -
            new Date(b.created_at).getTime(),
        ),
    [allContracts, category.id],
  );

  if (contracts.length === 0) {
    return (
      <section className="rounded-lg border border-dashed border-border bg-white p-6 text-center">
        <p
          className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-muted"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Contracts
        </p>
        <p className="mt-2 text-[13px] text-ink-muted">
          No contracts drafted yet. Once a vendor is booked, planner adds the
          contract here and both partners countersign.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <header className="flex items-baseline justify-between gap-3">
        <div>
          <p
            className="font-mono text-[10px] uppercase tracking-[0.16em] text-saffron"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Contracts
          </p>
          <h3 className="mt-1 font-serif text-[20px] text-ink">
            Signed & pending
          </h3>
        </div>
      </header>
      {contracts.map((c) => (
        <ContractCard key={c.id} contract={c} />
      ))}
    </section>
  );
}

function ContractCard({ contract }: { contract: WorkspaceContract }) {
  const vendor = useVendorsStore((s) =>
    s.vendors.find((v) => v.id === contract.vendor_id),
  );
  const currentRole = useWorkspaceStore((s) => s.currentRole);
  const markMilestonePaid = useWorkspaceStore((s) => s.markMilestonePaid);
  const countersignContract = useWorkspaceStore((s) => s.countersignContract);
  const roleLabel = useRoleLabel();

  const { total_amount, travel_amount, status, payment_schedule } = contract;
  const fullTotal = total_amount + travel_amount;
  const paid = payment_schedule
    .filter((m) => m.paid_at)
    .reduce((s, m) => s + m.amount, 0);
  const outstanding = total_amount - paid;

  const priyaSigned = Boolean(contract.countersigned_by_priya_at);
  const arjunSigned = Boolean(contract.countersigned_by_arjun_at);
  const bothSigned = priyaSigned && arjunSigned;

  const canEditMoney = currentRole === "planner";
  const canCountersignPriya = currentRole === "priya" && !priyaSigned;
  const canCountersignArjun = currentRole === "arjun" && !arjunSigned;

  const statusTone = useMemo(() => {
    switch (status) {
      case "countersigned":
        return "bg-sage/15 text-sage border-sage/40";
      case "signed_by_vendor":
        return "bg-gold-light/25 text-gold border-gold/40";
      case "disputed":
        return "bg-rose/15 text-rose border-rose/40";
      default:
        return "bg-ivory/50 text-ink-muted border-border";
    }
  }, [status]);

  return (
    <article className="rounded-lg border border-border bg-white p-5">
      {/* Header */}
      <header className="flex flex-col gap-2 border-b border-border/60 pb-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p
            className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-muted"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {vendor?.category ?? "Photography"}
          </p>
          <h4 className="mt-0.5 font-serif text-[19px] leading-tight text-ink">
            {vendor?.name ?? "Unknown vendor"}
          </h4>
          <p className="mt-0.5 text-[12px] text-ink-muted">
            {formatRupee(total_amount)} + {formatRupee(travel_amount)} travel
            {" · "}
            <span className="text-ink">{formatRupee(fullTotal)} total</span>
          </p>
        </div>
        <span
          className={cn(
            "inline-flex shrink-0 items-center gap-1.5 self-start rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em]",
            statusTone,
          )}
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {bothSigned ? (
            <CheckCircle2 size={11} strokeWidth={2} />
          ) : (
            <FileText size={11} strokeWidth={1.8} />
          )}
          {CONTRACT_STATUS_LABEL[status]}
        </span>
      </header>

      {/* Payment schedule */}
      <div className="py-4">
        <p
          className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Payment schedule
        </p>
        <ul className="divide-y divide-border/50">
          {payment_schedule.map((m) => (
            <MilestoneRow
              key={m.id}
              milestone={m}
              canEdit={canEditMoney}
              onToggle={() =>
                markMilestonePaid(contract.id, m.id, !m.paid_at)
              }
            />
          ))}
        </ul>
        <div className="mt-3 flex items-center justify-between border-t border-border/50 pt-3 text-[12px]">
          <span
            className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Paid {formatRupee(paid)} · Outstanding {formatRupee(outstanding)}
          </span>
          <CircleDollarSign size={13} strokeWidth={1.6} className="text-ink-faint" />
        </div>
      </div>

      {/* Scope */}
      <div className="grid grid-cols-1 gap-3 border-t border-border/60 py-4 md:grid-cols-2">
        <ScopeList
          title="Scope includes"
          items={contract.scope_includes}
          tone="include"
        />
        <ScopeList
          title="Scope excludes"
          items={contract.scope_excludes}
          tone="exclude"
        />
      </div>

      {/* Files */}
      {contract.file_refs.length > 0 && (
        <div className="flex flex-wrap gap-2 border-t border-border/60 py-4">
          {contract.file_refs.map((f, i) => (
            <a
              key={`${f.label}-${i}`}
              href={f.href ?? "#"}
              onClick={(e) => !f.href && e.preventDefault()}
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-white px-2.5 py-1.5 text-[11.5px] text-ink-muted transition-colors hover:border-saffron/40 hover:text-saffron"
            >
              <Paperclip size={11} strokeWidth={1.8} />
              {f.label}
            </a>
          ))}
        </div>
      )}

      {/* Countersign row */}
      <div className="flex flex-col gap-2 border-t border-border/60 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <SignatureBadge
            name={roleLabel.priya}
            signedAt={contract.countersigned_by_priya_at}
          />
          <SignatureBadge
            name={roleLabel.arjun}
            signedAt={contract.countersigned_by_arjun_at}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {canCountersignPriya && (
            <button
              type="button"
              onClick={() => countersignContract(contract.id)}
              className="inline-flex items-center gap-1.5 rounded-md bg-ink px-3 py-1.5 text-[12px] font-medium text-ivory hover:bg-ink-soft"
            >
              <CheckCircle2 size={13} strokeWidth={1.8} />
              Countersign as {roleLabel.priya}
            </button>
          )}
          {canCountersignArjun && (
            <button
              type="button"
              onClick={() => countersignContract(contract.id)}
              className="inline-flex items-center gap-1.5 rounded-md bg-ink px-3 py-1.5 text-[12px] font-medium text-ivory hover:bg-ink-soft"
            >
              <CheckCircle2 size={13} strokeWidth={1.8} />
              Countersign as {roleLabel.arjun}
            </button>
          )}
          {currentRole === "planner" && !bothSigned && (
            <span
              className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Awaiting couple signatures
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

function MilestoneRow({
  milestone,
  canEdit,
  onToggle,
}: {
  milestone: PaymentMilestone;
  canEdit: boolean;
  onToggle: () => void;
}) {
  const paid = Boolean(milestone.paid_at);
  return (
    <li className="flex items-center gap-3 py-2.5">
      <span
        className={cn(
          "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
          paid
            ? "border-sage bg-sage/10 text-sage"
            : "border-border text-transparent",
        )}
        aria-hidden
      >
        {paid && <CheckCircle2 size={11} strokeWidth={2.2} />}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] text-ink">{milestone.label}</p>
        <p
          className="mt-0.5 font-mono text-[9.5px] uppercase tracking-[0.12em] text-ink-muted"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Due {formatDate(milestone.due_date)}
          {paid && ` · Paid ${formatDate(milestone.paid_at)}`}
        </p>
      </div>
      <span className="shrink-0 font-serif text-[14px] text-ink">
        {formatRupee(milestone.amount)}
      </span>
      {canEdit && (
        <button
          type="button"
          onClick={onToggle}
          className={cn(
            "ml-1 shrink-0 rounded-md border px-2 py-1 font-mono text-[9.5px] uppercase tracking-[0.12em] transition-colors",
            paid
              ? "border-border text-ink-muted hover:border-rose/40 hover:text-rose"
              : "border-border text-ink-muted hover:border-sage/40 hover:text-sage",
          )}
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {paid ? "Mark unpaid" : "Mark paid"}
        </button>
      )}
    </li>
  );
}

function ScopeList({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: "include" | "exclude";
}) {
  const Icon = tone === "include" ? CheckCircle2 : XCircle;
  const iconTone = tone === "include" ? "text-sage" : "text-ink-faint";
  return (
    <div>
      <p
        className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {title}
      </p>
      {items.length === 0 ? (
        <p className="text-[12px] text-ink-faint">—</p>
      ) : (
        <ul className="space-y-1">
          {items.map((s, i) => (
            <li key={`${s}-${i}`} className="flex items-start gap-1.5 text-[12.5px] text-ink">
              <Icon size={12} strokeWidth={1.8} className={cn("mt-[3px] shrink-0", iconTone)} />
              <span>{s}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function SignatureBadge({
  name,
  signedAt,
}: {
  name: string;
  signedAt: string | null;
}) {
  const signed = Boolean(signedAt);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-1 font-mono text-[10px] uppercase tracking-[0.12em]",
        signed
          ? "border-sage/40 bg-sage/10 text-sage"
          : "border-border text-ink-muted",
      )}
      style={{ fontFamily: "var(--font-mono)" }}
    >
      {signed ? (
        <CheckCircle2 size={11} strokeWidth={2} />
      ) : (
        <XCircle size={11} strokeWidth={1.8} />
      )}
      {name}
      {signed && ` · ${formatDate(signedAt!).replace(/,.*/, "")}`}
    </span>
  );
}
