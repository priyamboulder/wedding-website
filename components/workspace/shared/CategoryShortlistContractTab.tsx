"use client";

// ── Shortlist & Contract tab (generic) ──────────────────────────────────────
// Shows shortlisted vendors for this category and a compact contract-status
// strip. Mirrors the photography workspace's Shortlist & Contract tab but
// without the contract-specific editing surface — couples still manage
// detailed contract drafting inside Photography; other categories track the
// contract state at a summary level.

import { useMemo } from "react";
import { FileSignature } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { useVendorsStore } from "@/stores/vendors-store";
import type { WorkspaceCategory, WorkspaceContract } from "@/types/workspace";
import { CONTRACT_STATUS_LABEL } from "@/types/workspace";
import { ShortlistGridBlock } from "@/components/workspace/blocks/generic-blocks";
import { PanelCard, EmptyRow, Eyebrow } from "@/components/workspace/blocks/primitives";
import { ContractChecklistBlock } from "@/components/workspace/shared/ContractChecklistBlock";

export function CategoryShortlistContractTab({
  category,
}: {
  category: WorkspaceCategory;
}) {
  const allContracts = useWorkspaceStore((s) => s.contracts);
  const vendors = useVendorsStore((s) => s.vendors);

  const contracts = useMemo(
    () => allContracts.filter((c) => c.category_id === category.id),
    [allContracts, category.id],
  );

  return (
    <div className="space-y-4">
      <ContractSummary contracts={contracts} vendors={vendors} />
      <ShortlistGridBlock categorySlug={category.slug} />
      <ContractChecklistBlock category={category} />
    </div>
  );
}

function ContractSummary({
  contracts,
  vendors,
}: {
  contracts: WorkspaceContract[];
  vendors: ReturnType<typeof useVendorsStore.getState>["vendors"];
}) {
  return (
    <PanelCard
      icon={<FileSignature size={14} strokeWidth={1.8} />}
      title="Contracts"
    >
      {contracts.length === 0 ? (
        <EmptyRow>
          No contracts drafted yet. Shortlist a vendor to start a quote.
        </EmptyRow>
      ) : (
        <ul className="divide-y divide-border/60">
          {contracts.map((c) => {
            const vendorName =
              vendors.find((v) => v.id === c.vendor_id)?.name ?? "Unknown vendor";
            const tone =
              c.status === "countersigned"
                ? "text-sage"
                : c.status === "disputed"
                  ? "text-rose"
                  : "text-gold";
            const total = c.total_amount + c.travel_amount;
            return (
              <li
                key={c.id}
                className="flex items-center justify-between gap-3 py-2.5"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] text-ink">{vendorName}</p>
                  <Eyebrow className="mt-0.5">
                    {CONTRACT_STATUS_LABEL[c.status]}
                  </Eyebrow>
                </div>
                <div className="shrink-0 text-right">
                  <p className={cn("font-mono text-[12px]", tone)}>
                    ₹{(total / 100_000).toFixed(1)}L
                  </p>
                  <p className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-ink-faint">
                    {c.payment_schedule.length} milestones
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </PanelCard>
  );
}
