"use client";

import { useState } from "react";
import { Card, Chip, PageHeader, PrimaryButton, GhostButton } from "@/components/vendor-portal/ui";
import { WEDDINGS } from "@/lib/vendor-portal/seed";
import { usePortalVendor } from "@/lib/vendor-portal/current-vendor";

type ProposalStatus = "draft" | "sent" | "accepted" | "declined";

type Proposal = {
  id: string;
  coupleNames: string;
  weddingDate: string;
  amount: number;
  status: ProposalStatus;
  sentAt: string | null;
};

const STATUS_META: Record<ProposalStatus, { label: string; tone: "neutral" | "gold" | "sage" | "rose" }> = {
  draft:    { label: "Draft",    tone: "neutral" },
  sent:     { label: "Sent",     tone: "gold" },
  accepted: { label: "Accepted", tone: "sage" },
  declined: { label: "Declined", tone: "rose" },
};

const SEED_PROPOSALS: Proposal[] = WEDDINGS.slice(0, 4).map((w, i) => ({
  id: `prop-${i + 1}`,
  coupleNames: w.coupleName,
  weddingDate: w.weddingDate,
  amount: [4500, 6800, 3200, 5500][i],
  status: (["sent", "accepted", "draft", "sent"] as ProposalStatus[])[i],
  sentAt: i !== 2 ? "2026-04-01" : null,
}));

const ROLES: TeamRole[] = ["Second shooter", "Assistant", "Editor", "Videographer", "Coordinator"];
type TeamRole = "Second shooter" | "Assistant" | "Editor" | "Videographer" | "Coordinator";

function fmt(iso: string) {
  const d = new Date(iso);
  return isNaN(d.getTime()) ? iso : d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function NewProposalModal({ onClose, onAdd }: { onClose: () => void; onAdd: (p: Proposal) => void }) {
  const [coupleNames, setCoupleNames] = useState("");
  const [weddingDate, setWeddingDate] = useState("");
  const [amount, setAmount] = useState("");

  function submit() {
    if (!coupleNames.trim() || !weddingDate || !amount) return;
    onAdd({
      id: `prop-${Date.now()}`,
      coupleNames: coupleNames.trim(),
      weddingDate,
      amount: parseFloat(amount),
      status: "draft",
      sentAt: null,
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <h2 className="text-[22px] text-[#2C2C2C]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
          New proposal
        </h2>
        <div className="mt-4 space-y-3">
          <div>
            <label className="block text-[12px] text-stone-500 mb-1">Couple names</label>
            <input
              className="w-full rounded-lg border px-3 py-2 text-[13px] outline-none focus:ring-2 focus:ring-[#C4A265]"
              style={{ borderColor: "rgba(44,44,44,0.15)" }}
              value={coupleNames}
              onChange={(e) => setCoupleNames(e.target.value)}
              placeholder="Priya & Arjun"
            />
          </div>
          <div>
            <label className="block text-[12px] text-stone-500 mb-1">Wedding date</label>
            <input
              type="date"
              className="w-full rounded-lg border px-3 py-2 text-[13px] outline-none focus:ring-2 focus:ring-[#C4A265]"
              style={{ borderColor: "rgba(44,44,44,0.15)" }}
              value={weddingDate}
              onChange={(e) => setWeddingDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-[12px] text-stone-500 mb-1">Amount (USD)</label>
            <input
              type="number"
              className="w-full rounded-lg border px-3 py-2 text-[13px] outline-none focus:ring-2 focus:ring-[#C4A265]"
              style={{ borderColor: "rgba(44,44,44,0.15)" }}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="5000"
              min="0"
            />
          </div>
        </div>
        <div className="mt-5 flex gap-3">
          <PrimaryButton onClick={submit}>Create draft</PrimaryButton>
          <GhostButton onClick={onClose}>Cancel</GhostButton>
        </div>
      </div>
    </div>
  );
}

function ViewProposalModal({ proposal, onClose, onSend }: { proposal: Proposal; onClose: () => void; onSend: () => void }) {
  const meta = STATUS_META[proposal.status];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[22px] text-[#2C2C2C]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Proposal
          </h2>
          <Chip tone={meta.tone}>{meta.label}</Chip>
        </div>
        <div className="space-y-3 text-[13px] text-stone-700">
          <div className="flex justify-between">
            <span className="text-stone-500">Couple</span>
            <span className="font-medium text-[#2C2C2C]">{proposal.coupleNames}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-500">Wedding date</span>
            <span>{fmt(proposal.weddingDate)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-500">Amount</span>
            <span className="font-mono font-medium text-[#2C2C2C]">${proposal.amount.toLocaleString()}</span>
          </div>
          {proposal.sentAt && (
            <div className="flex justify-between">
              <span className="text-stone-500">Sent</span>
              <span>{fmt(proposal.sentAt)}</span>
            </div>
          )}
        </div>
        <div className="mt-6 flex gap-3">
          {proposal.status === "draft" && (
            <PrimaryButton onClick={() => { onSend(); onClose(); }}>Send to couple</PrimaryButton>
          )}
          <GhostButton onClick={onClose}>Close</GhostButton>
        </div>
      </div>
    </div>
  );
}

export default function VendorProposalsPage() {
  const [proposals, setProposals] = useState<Proposal[]>(SEED_PROPOSALS);
  const [newOpen, setNewOpen] = useState(false);
  const [viewing, setViewing] = useState<Proposal | null>(null);
  const vendor = usePortalVendor();

  function sendProposal(id: string) {
    setProposals((prev) =>
      prev.map((p) => p.id === id ? { ...p, status: "sent", sentAt: new Date().toISOString() } : p)
    );
  }

  return (
    <div className="pb-16">
      <PageHeader
        eyebrow="Proposals"
        title="Your proposals"
        description="Manage and send proposals to couples. Accepted proposals automatically create a booking."
        actions={
          <PrimaryButton onClick={() => setNewOpen(true)}>+ New proposal</PrimaryButton>
        }
      />

      <div className="px-8 py-6 space-y-4">
        {proposals.length === 0 ? (
          <div className="py-16 text-center text-stone-400">
            <p className="text-[15px]">No proposals yet.</p>
            <p className="text-[13px] mt-1">Create your first proposal to get started.</p>
          </div>
        ) : (
          proposals.map((p) => {
            const meta = STATUS_META[p.status];
            return (
              <Card key={p.id} className="p-5">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-[#2C2C2C] text-[14px]">{p.coupleNames}</p>
                      <Chip tone={meta.tone}>{meta.label}</Chip>
                    </div>
                    <p className="mt-0.5 text-[12.5px] text-stone-500">
                      {fmt(p.weddingDate)}
                      {p.sentAt && ` · Sent ${fmt(p.sentAt)}`}
                    </p>
                    <p className="mt-1.5 font-mono text-[14px] text-[#2C2C2C]">
                      ${p.amount.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <GhostButton onClick={() => setViewing(p)}>View</GhostButton>
                    {p.status === "draft" && (
                      <PrimaryButton onClick={() => sendProposal(p.id)}>Send</PrimaryButton>
                    )}
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {newOpen && (
        <NewProposalModal
          onClose={() => setNewOpen(false)}
          onAdd={(p) => setProposals((prev) => [p, ...prev])}
        />
      )}

      {viewing && (
        <ViewProposalModal
          proposal={viewing}
          onClose={() => setViewing(null)}
          onSend={() => sendProposal(viewing.id)}
        />
      )}
    </div>
  );
}
