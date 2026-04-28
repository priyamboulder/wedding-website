"use client";

import { useMemo, useState, useEffect } from "react";
import { Send, Check, X } from "lucide-react";
import { PortalPageHeader, PortalStatCard } from "@/components/creator-portal/PortalPageHeader";
import { useCurrentCreator, formatUsd } from "@/lib/creators/current-creator";
import { usePartnershipsStore } from "@/stores/partnerships-store";
import {
  DELIVERABLE_LABEL,
  STATUS_LABEL,
  calculateNetPayout,
  type PartnershipProposal,
  type PartnershipStatus,
} from "@/types/partnership";

type FilterTab = "all" | "pending" | "active" | "completed";

function matchesFilter(status: PartnershipStatus, tab: FilterTab): boolean {
  if (tab === "all") return true;
  if (tab === "pending") return status === "pending" || status === "negotiating";
  if (tab === "active")
    return (
      status === "accepted" ||
      status === "in_progress" ||
      status === "delivered" ||
      status === "approved"
    );
  return status === "completed";
}

export default function PartnershipsPage() {
  const creator = useCurrentCreator();
  const proposals = usePartnershipsStore((s) =>
    creator ? s.listProposals("creator", creator.id) : [],
  );
  const stats = usePartnershipsStore((s) =>
    creator
      ? s.statsForCreator(creator.id)
      : { completed: 0, active: 0, pending: 0, totalEarned: 0 },
  );

  const [tab, setTab] = useState<FilterTab>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = useMemo(
    () => proposals.filter((p) => matchesFilter(p.status, tab)),
    [proposals, tab],
  );

  useEffect(() => {
    if (!selectedId && filtered.length > 0) {
      setSelectedId(filtered[0].id);
    }
  }, [selectedId, filtered]);

  const selected = proposals.find((p) => p.id === selectedId);

  if (!creator) return null;

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-8">
      <PortalPageHeader
        eyebrow="Business"
        title="Partnerships"
        description="Paid collaborations from vendors. Platform takes a 15% facilitation fee."
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <PortalStatCard
          label="Pending"
          value={String(stats.pending)}
          tone={stats.pending > 0 ? "rose" : "ink"}
        />
        <PortalStatCard label="Active" value={String(stats.active)} tone="teal" />
        <PortalStatCard label="Completed" value={String(stats.completed)} tone="sage" />
        <PortalStatCard
          label="Total earned"
          value={formatUsd(stats.totalEarned)}
          tone="gold"
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[340px_1fr]">
        {/* Left panel - list */}
        <div className="flex flex-col">
          <div className="mb-3 flex flex-wrap gap-1">
            {(["all", "pending", "active", "completed"] as FilterTab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`rounded-full border px-3 py-1 text-[11.5px] capitalize ${
                  tab === t
                    ? "border-gold/40 bg-gold-pale/40 text-ink"
                    : "border-border bg-white text-ink-muted hover:border-gold/30"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="flex flex-col gap-1.5 overflow-y-auto lg:max-h-[60vh]">
            {filtered.length === 0 ? (
              <p className="rounded-lg border border-dashed border-gold/20 py-8 text-center text-[12px] italic text-ink-muted">
                No proposals in this view.
              </p>
            ) : (
              filtered.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedId(p.id)}
                  className={`flex flex-col rounded-lg border p-3 text-left transition-colors ${
                    selectedId === p.id
                      ? "border-gold/40 bg-gold-pale/30"
                      : "border-border bg-white hover:border-gold/30"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className="font-mono text-[9.5px] uppercase tracking-wider text-gold"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {p.vendorId}
                    </span>
                    <StatusBadge status={p.status} />
                  </div>
                  <p className="mt-1 line-clamp-1 font-serif text-[14px] text-ink">
                    {p.title}
                  </p>
                  <p
                    className="mt-0.5 font-mono text-[10px] text-ink-faint"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {formatUsd(p.proposedBudget)} · {new Date(p.createdAt).toLocaleDateString()}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right panel - detail */}
        <div>{selected ? <ProposalDetail proposal={selected} /> : <EmptyDetail />}</div>
      </div>
    </div>
  );
}

function EmptyDetail() {
  return (
    <div className="flex h-full min-h-[320px] items-center justify-center rounded-xl border border-dashed border-gold/20 text-[12.5px] italic text-ink-muted">
      Select a proposal to view details.
    </div>
  );
}

function ProposalDetail({ proposal }: { proposal: PartnershipProposal }) {
  const creator = useCurrentCreator();
  const respond = usePartnershipsStore((s) => s.respondToProposal);
  const markDelivered = usePartnershipsStore((s) => s.markDelivered);
  const getMessages = usePartnershipsStore((s) => s.getMessages);
  const getPayout = usePartnershipsStore((s) => s.getPayout);
  const sendMessage = usePartnershipsStore((s) => s.sendMessage);

  const messages = getMessages(proposal.id);
  const payout = getPayout(proposal.id);
  const [counterMode, setCounterMode] = useState(false);
  const [counterBudget, setCounterBudget] = useState(proposal.proposedBudget);
  const [counterNotes, setCounterNotes] = useState("");
  const [newMessage, setNewMessage] = useState("");

  if (!creator) return null;

  const send = () => {
    if (!newMessage.trim()) return;
    sendMessage(proposal.id, "creator", creator.id, newMessage);
    setNewMessage("");
  };

  return (
    <div className="rounded-xl border border-border bg-white p-5">
      <div className="flex items-start justify-between gap-3 border-b border-gold/10 pb-3">
        <div>
          <StatusBadge status={proposal.status} />
          <h2 className="mt-2 font-serif text-[20px] text-ink">{proposal.title}</h2>
          <p
            className="mt-1 font-mono text-[10px] uppercase tracking-wider text-ink-faint"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {DELIVERABLE_LABEL[proposal.deliverableType]} · {proposal.timelineDays} day timeline
          </p>
        </div>
        <div className="text-right">
          <p
            className="font-mono text-[9.5px] uppercase tracking-wider text-ink-faint"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Budget
          </p>
          <p className="font-serif text-[24px] text-ink">
            {formatUsd(proposal.proposedBudget)}
          </p>
          <p className="text-[11.5px] text-ink-muted">
            Net {formatUsd(calculateNetPayout(proposal.proposedBudget))}
          </p>
        </div>
      </div>

      <div className="mt-4">
        <p className="text-[13px] text-ink">{proposal.description}</p>
        {proposal.productIds.length > 0 && (
          <div className="mt-3">
            <p
              className="mb-1 font-mono text-[9.5px] uppercase tracking-wider text-ink-faint"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Products to feature
            </p>
            <div className="flex flex-wrap gap-1">
              {proposal.productIds.map((id) => (
                <span
                  key={id}
                  className="rounded-full border border-gold/20 bg-gold-pale/20 px-2 py-0.5 font-mono text-[9.5px] text-gold"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {id}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Actions for pending */}
      {proposal.status === "pending" && (
        <div className="mt-4">
          {!counterMode ? (
            <div className="flex gap-2">
              <button
                onClick={() => respond(proposal.id, { action: "accept" })}
                className="inline-flex items-center gap-1 rounded-md bg-sage px-4 py-2 text-[12.5px] text-white hover:bg-sage/90"
              >
                <Check size={12} /> Accept
              </button>
              <button
                onClick={() => setCounterMode(true)}
                className="rounded-md border border-gold/40 bg-white px-4 py-2 text-[12.5px] text-gold hover:bg-gold-pale/30"
              >
                Counter
              </button>
              <button
                onClick={() =>
                  respond(proposal.id, {
                    action: "decline",
                    declineReason: prompt("Reason for declining? (optional)") ?? "",
                  })
                }
                className="inline-flex items-center gap-1 rounded-md border border-border bg-white px-4 py-2 text-[12.5px] text-rose hover:bg-rose/10"
              >
                <X size={12} /> Decline
              </button>
            </div>
          ) : (
            <div className="rounded-lg border border-gold/30 bg-ivory-warm p-3">
              <p
                className="mb-2 font-mono text-[9.5px] uppercase tracking-[0.2em] text-ink-faint"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Counter proposal
              </p>
              <input
                type="number"
                value={counterBudget}
                onChange={(e) => setCounterBudget(parseInt(e.target.value || "0", 10))}
                placeholder="Your counter budget"
                className="mb-2 w-full rounded border border-border bg-white px-3 py-2 text-[13px]"
              />
              <textarea
                value={counterNotes}
                onChange={(e) => setCounterNotes(e.target.value)}
                placeholder="Notes (optional)"
                rows={2}
                className="mb-2 w-full resize-none rounded border border-border bg-white px-3 py-2 text-[13px]"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    respond(proposal.id, {
                      action: "counter",
                      counterBudget,
                      counterNotes,
                    });
                    setCounterMode(false);
                  }}
                  className="rounded-md bg-ink px-3 py-1.5 text-[12px] text-ivory hover:bg-gold"
                >
                  Send counter
                </button>
                <button
                  onClick={() => setCounterMode(false)}
                  className="rounded-md border border-border bg-white px-3 py-1.5 text-[12px] text-ink hover:bg-ivory-warm"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Progress tracker for accepted proposals */}
      {(proposal.status === "accepted" ||
        proposal.status === "in_progress" ||
        proposal.status === "delivered" ||
        proposal.status === "approved" ||
        proposal.status === "completed") && (
        <div className="mt-4 rounded-lg border border-gold/20 bg-ivory-warm p-3">
          <p
            className="mb-2 font-mono text-[9.5px] uppercase tracking-[0.2em] text-ink-faint"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Progress
          </p>
          <ProgressTracker status={proposal.status} />
          {(proposal.status === "accepted" || proposal.status === "in_progress") && (
            <button
              onClick={() => markDelivered(proposal.id)}
              className="mt-3 rounded-md bg-ink px-3 py-1.5 text-[12px] text-ivory hover:bg-gold"
            >
              Mark as delivered
            </button>
          )}
        </div>
      )}

      {/* Messages */}
      <div className="mt-5 border-t border-gold/10 pt-4">
        <p
          className="mb-3 font-mono text-[9.5px] uppercase tracking-[0.2em] text-ink-faint"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Messages
        </p>
        <div className="flex max-h-64 flex-col gap-2 overflow-y-auto">
          {messages.length === 0 ? (
            <p className="text-[12px] italic text-ink-muted">No messages yet.</p>
          ) : (
            messages.map((m) => (
              <div
                key={m.id}
                className={`max-w-[85%] rounded-lg px-3 py-2 text-[12.5px] ${
                  m.senderType === "creator"
                    ? "ml-auto bg-gold-pale/40 text-ink"
                    : "bg-ivory-warm text-ink"
                }`}
              >
                <p>{m.messageText}</p>
                <p
                  className="mt-1 font-mono text-[9.5px] uppercase tracking-wider text-ink-faint"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {new Date(m.createdAt).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            ))
          )}
        </div>
        <div className="mt-3 flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Type a message…"
            className="flex-1 rounded-md border border-border bg-white px-3 py-2 text-[13px]"
          />
          <button
            onClick={send}
            className="rounded-md bg-ink px-3 py-2 text-ivory hover:bg-gold"
            aria-label="Send"
          >
            <Send size={13} />
          </button>
        </div>
      </div>

      {/* Payout info */}
      {payout && (
        <div className="mt-5 rounded-lg border border-sage/30 bg-sage-pale/30 p-3">
          <p
            className="mb-2 font-mono text-[9.5px] uppercase tracking-[0.2em] text-sage"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Payout · {payout.status}
          </p>
          <div className="grid grid-cols-3 gap-2 text-[12px]">
            <div>
              <p className="text-ink-faint">Gross</p>
              <p className="text-ink">{formatUsd(payout.grossAmount)}</p>
            </div>
            <div>
              <p className="text-ink-faint">Platform fee</p>
              <p className="text-ink">-{formatUsd(payout.platformFee)}</p>
            </div>
            <div>
              <p className="text-ink-faint">Net</p>
              <p className="font-serif text-[15px] text-ink">{formatUsd(payout.netAmount)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const STAGES = ["accepted", "in_progress", "delivered", "approved", "completed"] as const;

function ProgressTracker({ status }: { status: PartnershipStatus }) {
  const idx = STAGES.indexOf(status as (typeof STAGES)[number]);
  return (
    <div className="flex items-center gap-1.5">
      {STAGES.map((s, i) => (
        <div key={s} className="flex flex-1 flex-col items-center">
          <div
            className={`h-1.5 w-full rounded-full ${
              i <= idx ? "bg-gold" : "bg-ink-faint/20"
            }`}
          />
          <p
            className="mt-1 font-mono text-[8.5px] uppercase tracking-wider text-ink-faint"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {s.replace("_", " ")}
          </p>
        </div>
      ))}
    </div>
  );
}

function StatusBadge({ status }: { status: PartnershipStatus }) {
  const TONE: Record<PartnershipStatus, string> = {
    pending: "bg-saffron/20 text-saffron",
    negotiating: "bg-gold-pale/60 text-gold",
    accepted: "bg-teal-pale/60 text-teal",
    in_progress: "bg-teal-pale/60 text-teal",
    delivered: "bg-teal-pale/60 text-teal",
    approved: "bg-sage/20 text-sage",
    completed: "bg-sage/20 text-sage",
    cancelled: "bg-ink-faint/20 text-ink-faint",
    declined: "bg-rose/15 text-rose",
  };
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-wider ${TONE[status]}`}
      style={{ fontFamily: "var(--font-mono)" }}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}
