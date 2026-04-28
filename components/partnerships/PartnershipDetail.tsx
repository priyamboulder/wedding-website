"use client";

import { useMemo, useState } from "react";
import {
  Calendar,
  DollarSign,
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowLeftRight,
  Send,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CreatorAvatar } from "@/components/creators/CreatorAvatar";
import { StatusBadge } from "@/components/partnerships/StatusBadge";
import { MessageThread } from "@/components/partnerships/MessageThread";
import { usePartnershipsStore } from "@/stores/partnerships-store";
import { useCreatorsStore } from "@/stores/creators-store";
import { useNotificationsStore } from "@/stores/notifications-store";
import { getStoreProduct, getStoreVendor } from "@/lib/store-seed";
import type { PartnershipProposal } from "@/types/partnership";
import {
  DELIVERABLE_LABEL,
  calculatePlatformFee,
  calculateNetPayout,
} from "@/types/partnership";

type Perspective = "vendor" | "creator";

export function PartnershipDetail({
  proposalId,
  perspective,
}: {
  proposalId: string;
  perspective: Perspective;
}) {
  const proposal = usePartnershipsStore((s) =>
    s.proposals.find((p) => p.id === proposalId),
  );
  const messages = usePartnershipsStore((s) => s.getMessages(proposalId));
  const payout = usePartnershipsStore((s) => s.getPayout(proposalId));
  const respond = usePartnershipsStore((s) => s.respondToProposal);
  const acceptCounter = usePartnershipsStore((s) => s.acceptCounter);
  const markDelivered = usePartnershipsStore((s) => s.markDelivered);
  const approveDelivery = usePartnershipsStore((s) => s.approveDelivery);
  const sendMessage = usePartnershipsStore((s) => s.sendMessage);
  const addNotification = useNotificationsStore((s) => s.addNotification);
  const creator = useCreatorsStore((s) =>
    proposal ? s.creators.find((c) => c.id === proposal.creatorId) : undefined,
  );

  const [counterOpen, setCounterOpen] = useState(false);
  const [counterBudget, setCounterBudget] = useState(0);
  const [counterNotes, setCounterNotes] = useState("");
  const [declineOpen, setDeclineOpen] = useState(false);
  const [declineReason, setDeclineReason] = useState("");

  const products = useMemo(
    () =>
      proposal
        ? proposal.productIds
            .map((id) => getStoreProduct(id))
            .filter((p): p is NonNullable<typeof p> => p !== null)
        : [],
    [proposal],
  );

  if (!proposal || !creator) {
    return (
      <div className="rounded-lg border border-border bg-white p-8 text-center text-[13px] italic text-ink-muted">
        Proposal not found.
      </div>
    );
  }

  const vendor = getStoreVendor(proposal.vendorId);
  const grossAmount = proposal.proposedBudget;
  const platformFee = calculatePlatformFee(grossAmount);
  const netPayout = calculateNetPayout(grossAmount);

  const notify = (
    target: Perspective,
    title: string,
    body: string,
    type:
      | "partnership_accepted"
      | "partnership_countered"
      | "partnership_declined"
      | "partnership_delivered"
      | "partnership_approved"
      | "partnership_message",
  ) => {
    addNotification({
      type,
      // Creator-facing notifications route to the "couple" bell (shared with
      // the creator admin dashboard). Vendor-facing go to the vendor portal.
      recipient: target === "vendor" ? "vendor" : "couple",
      title,
      body,
      link:
        target === "vendor"
          ? `/vendor/partnerships/${proposalId}`
          : `/dashboard/creator/partnerships/${proposalId}`,
      actor_name: target === "vendor" ? creator.displayName : vendor?.name ?? "Vendor",
    });
  };

  const onAccept = () => {
    respond(proposalId, { action: "accept" });
    notify(
      "vendor",
      `${creator.displayName} accepted your proposal`,
      proposal.title,
      "partnership_accepted",
    );
  };

  const onCounter = () => {
    if (counterBudget <= 0) return;
    respond(proposalId, {
      action: "counter",
      counterBudget,
      counterNotes,
    });
    notify(
      "vendor",
      `${creator.displayName} sent a counter offer`,
      `New budget: $${(counterBudget / 100).toFixed(0)}`,
      "partnership_countered",
    );
    setCounterOpen(false);
    setCounterBudget(0);
    setCounterNotes("");
  };

  const onDecline = () => {
    respond(proposalId, { action: "decline", declineReason });
    notify(
      "vendor",
      `${creator.displayName} declined your proposal`,
      declineReason || "No reason provided",
      "partnership_declined",
    );
    setDeclineOpen(false);
    setDeclineReason("");
  };

  const onAcceptCounter = () => {
    acceptCounter(proposalId);
    notify(
      "creator",
      `${vendor?.name ?? "Vendor"} accepted your counter offer`,
      `New terms locked at $${((proposal.creatorCounterBudget ?? 0) / 100).toFixed(0)}`,
      "partnership_accepted",
    );
  };

  const onDeliver = () => {
    markDelivered(proposalId);
    notify(
      "vendor",
      `${creator.displayName} marked the deliverable complete`,
      proposal.title,
      "partnership_delivered",
    );
  };

  const onApprove = () => {
    approveDelivery(proposalId);
    notify(
      "creator",
      `${vendor?.name ?? "Vendor"} approved your work — payout released`,
      `$${(netPayout / 100).toFixed(2)} sent (gross $${(grossAmount / 100).toFixed(2)})`,
      "partnership_approved",
    );
  };

  const onSend = (text: string) => {
    sendMessage(proposalId, perspective, perspective === "vendor" ? proposal.vendorId : proposal.creatorId, text);
    notify(
      perspective === "vendor" ? "creator" : "vendor",
      `New message from ${perspective === "vendor" ? vendor?.name ?? "Vendor" : creator.displayName}`,
      text.slice(0, 80),
      "partnership_message",
    );
  };

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
      <div className="lg:col-span-2">
        {/* Header */}
        <div className="rounded-lg border border-border bg-white p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <StatusBadge status={proposal.status} />
                <span className="font-mono text-[10px] uppercase tracking-wider text-ink-faint">
                  {DELIVERABLE_LABEL[proposal.deliverableType]}
                </span>
              </div>
              <h1 className="mt-2 font-serif text-[22px] leading-tight text-ink">
                {proposal.title}
              </h1>
              <p className="mt-2 text-[13px] leading-snug text-ink-muted">
                {proposal.description}
              </p>
            </div>
            <CreatorAvatar creator={creator} size="md" />
          </div>

          <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat
              icon={DollarSign}
              label="Budget"
              value={`$${(grossAmount / 100).toFixed(0)}`}
            />
            <Stat
              icon={Clock}
              label="Timeline"
              value={`${proposal.timelineDays} days`}
            />
            <Stat
              icon={Package}
              label="Products"
              value={String(proposal.productIds.length)}
            />
            <Stat
              icon={Calendar}
              label="Created"
              value={new Date(proposal.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            />
          </dl>

          {proposal.creatorCounterBudget != null && (
            <div className="mt-4 rounded-md border border-rose/30 bg-rose/5 p-3">
              <p className="font-mono text-[10px] uppercase tracking-wider text-rose">
                Counter offer
              </p>
              <p className="mt-1 text-[13px] text-ink">
                ${(proposal.creatorCounterBudget / 100).toFixed(0)}
              </p>
              {proposal.creatorCounterNotes && (
                <p className="mt-1 text-[12.5px] italic text-ink-muted">
                  "{proposal.creatorCounterNotes}"
                </p>
              )}
            </div>
          )}

          {proposal.declineReason && (
            <div className="mt-4 rounded-md border border-border bg-ivory-warm/40 p-3">
              <p className="font-mono text-[10px] uppercase tracking-wider text-ink-faint">
                Decline reason
              </p>
              <p className="mt-1 text-[12.5px] italic text-ink-muted">
                {proposal.declineReason}
              </p>
            </div>
          )}
        </div>

        {/* Action bar */}
        <ActionBar
          perspective={perspective}
          status={proposal.status}
          hasCounter={proposal.creatorCounterBudget != null}
          onAccept={onAccept}
          onCounter={() => setCounterOpen((v) => !v)}
          onDecline={() => setDeclineOpen((v) => !v)}
          onAcceptCounter={onAcceptCounter}
          onDeliver={onDeliver}
          onApprove={onApprove}
        />

        {/* Counter panel */}
        {counterOpen && perspective === "creator" && (
          <Panel title="Send a counter">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-wider text-ink-faint">
                  New budget (USD cents)
                </label>
                <input
                  type="number"
                  value={counterBudget}
                  onChange={(e) =>
                    setCounterBudget(Number(e.target.value) || 0)
                  }
                  className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-[13px] focus:border-gold/40 focus:outline-none"
                />
              </div>
            </div>
            <textarea
              value={counterNotes}
              onChange={(e) => setCounterNotes(e.target.value)}
              rows={3}
              placeholder="Why this number…"
              className="mt-2 w-full rounded-md border border-border bg-white px-3 py-2 text-[13px] focus:border-gold/40 focus:outline-none"
            />
            <button
              type="button"
              onClick={onCounter}
              disabled={counterBudget <= 0}
              className={cn(
                "mt-2 rounded-md px-3 py-1.5 text-[12px] font-medium",
                counterBudget > 0
                  ? "bg-ink text-ivory hover:bg-ink/90"
                  : "cursor-not-allowed bg-ink/30 text-ivory",
              )}
            >
              Submit counter
            </button>
          </Panel>
        )}

        {declineOpen && perspective === "creator" && (
          <Panel title="Decline this proposal">
            <textarea
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              rows={3}
              placeholder="Optional — let the vendor know why."
              className="w-full rounded-md border border-border bg-white px-3 py-2 text-[13px] focus:border-gold/40 focus:outline-none"
            />
            <button
              type="button"
              onClick={onDecline}
              className="mt-2 rounded-md bg-rose px-3 py-1.5 text-[12px] font-medium text-ivory hover:bg-rose/90"
            >
              Decline
            </button>
          </Panel>
        )}

        {/* Featured products */}
        <div className="mt-5 rounded-lg border border-border bg-white p-5">
          <h2 className="mb-3 font-serif text-[16px] text-ink">
            Featured products
          </h2>
          {products.length === 0 ? (
            <p className="text-[12.5px] italic text-ink-muted">
              No products attached.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {products.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0"
                >
                  <div
                    className="h-12 w-12 shrink-0 rounded-md bg-ivory-warm bg-cover bg-center"
                    style={{ backgroundImage: `url(${p.heroImage})` }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] text-ink">{p.title}</p>
                    <p className="font-mono text-[10.5px] uppercase tracking-wider text-ink-faint">
                      {p.category} · ${p.basePrice.toLocaleString()}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Right column: messages + payout */}
      <aside className="flex flex-col gap-4">
        <div className="rounded-lg border border-border bg-white p-5">
          <h3 className="mb-3 flex items-center gap-1.5 font-serif text-[15px] text-ink">
            <Send size={12} strokeWidth={1.6} className="text-gold" />
            Messages
          </h3>
          <MessageThread
            messages={messages}
            perspective={perspective}
            onSend={onSend}
          />
        </div>

        <div className="rounded-lg border border-border bg-white p-5">
          <h3 className="mb-3 font-serif text-[15px] text-ink">Payout</h3>
          <dl className="space-y-1.5 text-[12.5px]">
            <Row label="Gross" value={`$${(grossAmount / 100).toFixed(2)}`} />
            <Row
              label="Platform fee (15%)"
              value={`−$${(platformFee / 100).toFixed(2)}`}
              muted
            />
            <Row
              label="Net to creator"
              value={`$${(netPayout / 100).toFixed(2)}`}
              bold
            />
            {payout && (
              <Row
                label="Status"
                value={payout.status}
                muted
              />
            )}
            {payout?.paidAt && (
              <Row
                label="Paid"
                value={new Date(payout.paidAt).toLocaleDateString()}
                muted
              />
            )}
          </dl>
        </div>
      </aside>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Clock;
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <div className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-ink-faint">
        <Icon size={11} strokeWidth={1.6} />
        {label}
      </div>
      <p className="text-[14px] text-ink">{value}</p>
    </div>
  );
}

function Row({
  label,
  value,
  bold,
  muted,
}: {
  label: string;
  value: string;
  bold?: boolean;
  muted?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between",
        bold && "border-t border-gold/15 pt-1.5 font-medium text-ink",
        muted && "text-ink-muted",
      )}
    >
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-3 rounded-lg border border-gold/30 bg-gold-pale/15 p-4">
      <h3 className="mb-2 font-serif text-[14px] text-ink">{title}</h3>
      {children}
    </div>
  );
}

function ActionBar({
  perspective,
  status,
  hasCounter,
  onAccept,
  onCounter,
  onDecline,
  onAcceptCounter,
  onDeliver,
  onApprove,
}: {
  perspective: Perspective;
  status: PartnershipProposal["status"];
  hasCounter: boolean;
  onAccept: () => void;
  onCounter: () => void;
  onDecline: () => void;
  onAcceptCounter: () => void;
  onDeliver: () => void;
  onApprove: () => void;
}) {
  const buttons: React.ReactNode[] = [];

  if (perspective === "creator") {
    if (status === "pending") {
      buttons.push(
        <Btn
          key="accept"
          icon={CheckCircle2}
          label="Accept"
          tone="primary"
          onClick={onAccept}
        />,
        <Btn
          key="counter"
          icon={ArrowLeftRight}
          label="Counter"
          onClick={onCounter}
        />,
        <Btn key="decline" icon={XCircle} label="Decline" tone="rose" onClick={onDecline} />,
      );
    } else if (status === "accepted" || status === "in_progress") {
      buttons.push(
        <Btn
          key="deliver"
          icon={CheckCircle2}
          label="Mark delivered"
          tone="primary"
          onClick={onDeliver}
        />,
      );
    }
  } else {
    if (status === "negotiating" && hasCounter) {
      buttons.push(
        <Btn
          key="accept-counter"
          icon={CheckCircle2}
          label="Accept counter"
          tone="primary"
          onClick={onAcceptCounter}
        />,
      );
    } else if (status === "delivered") {
      buttons.push(
        <Btn
          key="approve"
          icon={CheckCircle2}
          label="Approve & release payment"
          tone="primary"
          onClick={onApprove}
        />,
      );
    }
  }

  if (buttons.length === 0) return null;

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2 rounded-lg border border-border bg-white p-3">
      {buttons}
    </div>
  );
}

function Btn({
  icon: Icon,
  label,
  tone,
  onClick,
}: {
  icon: typeof CheckCircle2;
  label: string;
  tone?: "primary" | "rose";
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px] font-medium transition-colors",
        tone === "primary"
          ? "bg-ink text-ivory hover:bg-ink/90"
          : tone === "rose"
            ? "border border-rose/40 bg-white text-rose hover:bg-rose/10"
            : "border border-border bg-white text-ink-muted hover:border-gold/30 hover:text-ink",
      )}
    >
      <Icon size={12} strokeWidth={1.8} />
      {label}
    </button>
  );
}
