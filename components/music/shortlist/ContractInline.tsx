"use client";

// ── ContractInline ────────────────────────────────────────────────────────
// Contract + deposit + next payment block rendered INSIDE the candidate
// card for any candidate in booked / contract_sent / signed state. Per
// the brief, contracts don't live behind a separate tab — the whole
// point of Shortlist & Contract being one surface is that the pipeline
// is continuous.

import { FileSignature, ExternalLink, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MusicCandidate, MusicContract } from "@/types/music";
import {
  contractStatusLabel,
  useMusicStore,
} from "@/stores/music-store";

export interface ContractInlineProps {
  candidate: MusicCandidate;
  contract?: MusicContract;
  dense?: boolean;
}

export function ContractInline({
  candidate,
  contract,
  dense,
}: ContractInlineProps) {
  const addContract = useMusicStore((s) => s.addContract);
  const setContractStatus = useMusicStore((s) => s.setContractStatus);
  const markMilestonePaid = useMusicStore((s) => s.markMilestonePaid);

  if (!contract) {
    return (
      <div
        className={cn(
          "flex items-center justify-between gap-2 rounded-md border border-dashed border-border bg-ivory-warm/30 px-3 py-2 text-[11.5px] text-ink-muted",
          dense && "py-1.5",
        )}
      >
        <span className="inline-flex items-center gap-1.5">
          <FileSignature size={12} strokeWidth={1.8} className="text-ink-faint" />
          No contract yet — draft one.
        </span>
        <button
          type="button"
          onClick={() =>
            addContract({
              wedding_id: candidate.wedding_id,
              candidate_id: candidate.id,
              status: "draft",
              currency: "INR",
              milestones: [],
            })
          }
          className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink hover:text-gold"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          start contract
        </button>
      </div>
    );
  }

  const { status, total_amount, deposit_amount, deposit_paid, milestones, pdf_url } =
    contract;
  const nextUnpaid = milestones
    .filter((m) => !m.paid_at)
    .sort((a, b) => (a.due_date ?? "").localeCompare(b.due_date ?? ""))[0];
  const depositPaidFull =
    deposit_amount != null &&
    deposit_paid != null &&
    deposit_paid >= deposit_amount;

  return (
    <div className="space-y-2 rounded-md border border-sage/30 bg-sage-pale/30 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-ink">
          <FileSignature size={13} strokeWidth={1.8} className="text-sage" />
          Contract
        </span>
        <ContractStatusBadge status={status} />
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <Stat label="Total" value={total_amount != null ? fmtINR(total_amount) : "—"} />
        <Stat
          label="Deposit"
          value={
            deposit_amount != null
              ? `${fmtINR(deposit_paid ?? 0)} / ${fmtINR(deposit_amount)}`
              : "—"
          }
          tone={
            deposit_amount == null
              ? "muted"
              : depositPaidFull
                ? "sage"
                : "saffron"
          }
        />
        <Stat
          label="Next due"
          value={
            nextUnpaid?.due_date
              ? `${nextUnpaid.label} · ${nextUnpaid.due_date}`
              : "—"
          }
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        {pdf_url ? (
          <a
            href={pdf_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ink hover:text-gold"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            <ExternalLink size={10} strokeWidth={1.8} />
            open contract PDF
          </a>
        ) : (
          <span
            className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            no PDF attached
          </span>
        )}
        <div
          className="flex items-center gap-2 font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-faint"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {status === "draft" && (
            <button
              type="button"
              onClick={() => setContractStatus(contract.id, "sent")}
              className="hover:text-ink"
            >
              mark sent
            </button>
          )}
          {status === "sent" && (
            <button
              type="button"
              onClick={() => setContractStatus(contract.id, "signed_by_vendor")}
              className="hover:text-ink"
            >
              vendor signed
            </button>
          )}
          {status === "signed_by_vendor" && (
            <button
              type="button"
              onClick={() => setContractStatus(contract.id, "countersigned")}
              className="hover:text-sage"
            >
              countersign
            </button>
          )}
          {nextUnpaid && (
            <button
              type="button"
              onClick={() => markMilestonePaid(contract.id, nextUnpaid.id)}
              className="hover:text-sage"
            >
              mark {nextUnpaid.label.toLowerCase()} paid
            </button>
          )}
        </div>
      </div>

      {milestones.length > 0 && (
        <ol className="mt-1 space-y-1 border-t border-sage/20 pt-2">
          {milestones.map((m) => (
            <li
              key={m.id}
              className="flex items-center justify-between gap-2 text-[11px]"
            >
              <span className="inline-flex items-center gap-1.5 text-ink-muted">
                {m.paid_at ? (
                  <Check size={11} strokeWidth={2} className="text-sage" />
                ) : (
                  <span className="inline-block h-2.5 w-2.5 rounded-full border border-ink-faint/40" />
                )}
                {m.label}
              </span>
              <span
                className={cn(
                  "font-mono tabular-nums",
                  m.paid_at ? "text-sage" : "text-ink",
                )}
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {fmtINR(m.amount)}
                {m.due_date && !m.paid_at && (
                  <span className="ml-1.5 text-ink-faint">· {m.due_date}</span>
                )}
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

// ── Bits ─────────────────────────────────────────────────────────────────

function ContractStatusBadge({
  status,
}: {
  status: MusicContract["status"];
}) {
  const tone =
    status === "countersigned"
      ? "bg-sage/20 text-ink border-sage/40"
      : status === "signed_by_vendor"
        ? "bg-sage-pale/60 text-ink border-sage/30"
        : status === "sent"
          ? "bg-saffron-pale/60 text-saffron border-saffron/40"
          : "bg-ivory-deep/60 text-ink-muted border-ink-faint/30";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm border px-1.5 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.08em]",
        tone,
      )}
      style={{ fontFamily: "var(--font-mono)" }}
    >
      {contractStatusLabel(status)}
    </span>
  );
}

function Stat({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "sage" | "saffron" | "muted";
}) {
  const cls =
    tone === "sage"
      ? "text-sage"
      : tone === "saffron"
        ? "text-saffron"
        : tone === "muted"
          ? "text-ink-faint"
          : "text-ink";
  return (
    <div className="rounded-sm border border-border bg-white px-2 py-1.5">
      <div
        className="font-mono text-[9px] uppercase tracking-[0.14em] text-ink-faint"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {label}
      </div>
      <div
        className={cn(
          "mt-0.5 truncate font-mono text-[11.5px] tabular-nums",
          cls,
        )}
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {value}
      </div>
    </div>
  );
}

function fmtINR(n: number): string {
  if (n >= 100_000) return `₹${(n / 100_000).toFixed(2).replace(/\.00$/, "")}L`;
  if (n >= 1_000) return `₹${(n / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return `₹${n}`;
}
