"use client";

// ── Shortlist & Contract tab (Videography) ────────────────────────────────
// Compares videographers on the axes that actually differ between a $3K and
// a $15K vendor: camera system, audio capture, drone, same-day edit, raw
// footage, music licensing, team size. The grid below is the first thing a
// couple should scan before moving to contract-level negotiation.

import { useMemo } from "react";
import { FileSignature, ListChecks } from "lucide-react";
import { cn } from "@/lib/utils";
import { useVendorsStore } from "@/stores/vendors-store";
import { useWorkspaceStore } from "@/stores/workspace-store";
import type { WorkspaceCategory, WorkspaceContract } from "@/types/workspace";
import { CONTRACT_STATUS_LABEL } from "@/types/workspace";
import { ShortlistGridBlock } from "@/components/workspace/blocks/generic-blocks";
import {
  EmptyRow,
  Eyebrow,
  PanelCard,
} from "@/components/workspace/blocks/primitives";
import { ContractChecklistBlock } from "@/components/workspace/shared/ContractChecklistBlock";

interface DifferentiatorRow {
  label: string;
  hint: string;
}

const DIFFERENTIATORS: DifferentiatorRow[] = [
  {
    label: "Camera system",
    hint: "RED, Sony, Blackmagic — shapes the look.",
  },
  {
    label: "Audio setup",
    hint: "How many lav mics? Separate audio engineer? Soundboard feed?",
  },
  {
    label: "Drone + FAA",
    hint: "Aerial coverage requires a certified pilot at most venues.",
  },
  {
    label: "Same-day edit",
    hint: "60–90s reel shown at the reception — premium feature.",
  },
  {
    label: "Raw footage policy",
    hint: "Do you get the unedited files? On what timeline?",
  },
  {
    label: "Music licensing",
    hint: "Licensed commercial music vs. royalty-free — matters for publishing.",
  },
  {
    label: "Team size",
    hint: "How many camera operators on the day? Who captures what?",
  },
];

const COMPARISON_ROWS = [
  "Hours of coverage",
  "Camera count",
  "Audio setup",
  "Drone included",
  "Same-day edit",
  "Highlight length",
  "Feature length",
  "Raw footage",
  "Music licensing",
  "Delivery timeline",
  "Travel policy",
];

export function ShortlistContractTab({
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
    <div className="space-y-6">
      <DifferentiatorCard />
      <ShortlistGridBlock categorySlug={category.slug} />
      <ComparisonMatrix />
      <ContractSummary contracts={contracts} vendors={vendors} />
      <ContractChecklistBlock category={category} />
    </div>
  );
}

// ── What actually separates videographers ──────────────────────────────

function DifferentiatorCard() {
  return (
    <PanelCard
      icon={<ListChecks size={14} strokeWidth={1.8} />}
      title="What actually separates videographers"
    >
      <p className="mb-3 text-[12px] text-ink-muted">
        Price lists don't tell the story. Before you compare quotes, ask
        every shortlisted vendor these seven questions.
      </p>
      <ul className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
        {DIFFERENTIATORS.map((d) => (
          <li
            key={d.label}
            className="rounded-md border border-border bg-white px-3 py-2.5"
          >
            <p className="text-[13px] font-medium text-ink">{d.label}</p>
            <p className="mt-0.5 text-[11.5px] leading-relaxed text-ink-muted">
              {d.hint}
            </p>
          </li>
        ))}
      </ul>
    </PanelCard>
  );
}

// ── Comparison matrix ──────────────────────────────────────────────────

function ComparisonMatrix() {
  return (
    <PanelCard
      title="Side-by-side — fill in per vendor"
      badge={
        <span
          className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Copy into shortlist notes
        </span>
      }
    >
      <p className="mb-3 text-[12px] text-ink-muted">
        A quick-reference grid of what to compare. Fill this in during
        vendor calls; it's the difference between a flat spreadsheet and
        a real decision.
      </p>
      <div className="overflow-x-auto rounded-md border border-border">
        <table className="min-w-full divide-y divide-border text-[12.5px]">
          <thead className="bg-ivory/50">
            <tr>
              <th className="py-2 pl-3 pr-4 text-left">
                <Eyebrow>Dimension</Eyebrow>
              </th>
              <th className="py-2 pr-4 text-left">
                <Eyebrow>Vendor A</Eyebrow>
              </th>
              <th className="py-2 pr-4 text-left">
                <Eyebrow>Vendor B</Eyebrow>
              </th>
              <th className="py-2 pr-3 text-left">
                <Eyebrow>Vendor C</Eyebrow>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60 bg-white">
            {COMPARISON_ROWS.map((row) => (
              <tr key={row}>
                <td className="py-2 pl-3 pr-4 text-ink">{row}</td>
                <td className="py-2 pr-4 text-ink-faint">—</td>
                <td className="py-2 pr-4 text-ink-faint">—</td>
                <td className="py-2 pr-3 text-ink-faint">—</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PanelCard>
  );
}

// ── Contract summary ──────────────────────────────────────────────────

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
          No contracts drafted yet. Shortlist a videographer to start a
          quote — contract clauses to watch: raw footage rights, music
          licensing, delivery dates, revision count.
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
