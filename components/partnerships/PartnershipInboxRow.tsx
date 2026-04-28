"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { CreatorAvatar } from "@/components/creators/CreatorAvatar";
import { StatusBadge } from "@/components/partnerships/StatusBadge";
import { useCreatorsStore } from "@/stores/creators-store";
import { getStoreVendor } from "@/lib/store-seed";
import { DELIVERABLE_LABEL } from "@/types/partnership";
import type { PartnershipProposal } from "@/types/partnership";

export function PartnershipInboxRow({
  proposal,
  href,
  perspective,
}: {
  proposal: PartnershipProposal;
  href: string;
  perspective: "vendor" | "creator";
}) {
  const creator = useCreatorsStore((s) =>
    s.creators.find((c) => c.id === proposal.creatorId),
  );
  const vendor = getStoreVendor(proposal.vendorId);
  const counterpartyName =
    perspective === "vendor"
      ? creator?.displayName ?? "Creator"
      : vendor?.name ?? "Vendor";

  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-lg border border-border bg-white px-4 py-3 transition-colors hover:border-gold/30"
    >
      {creator && perspective === "vendor" ? (
        <CreatorAvatar creator={creator} size="sm" withBadge={false} />
      ) : (
        <span className="grid h-7 w-7 place-items-center rounded-full bg-ivory-warm font-mono text-[10px] uppercase text-ink-muted">
          {counterpartyName.slice(0, 2)}
        </span>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-[13px] font-medium text-ink">
            {proposal.title}
          </p>
          <StatusBadge status={proposal.status} />
        </div>
        <p className="font-mono text-[10px] uppercase tracking-wider text-ink-faint">
          {counterpartyName} · {DELIVERABLE_LABEL[proposal.deliverableType]} · ${(proposal.proposedBudget / 100).toFixed(0)}
        </p>
      </div>
      <ChevronRight size={14} strokeWidth={1.6} className="text-ink-faint" />
    </Link>
  );
}
