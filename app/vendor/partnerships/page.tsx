"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Sparkles, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { STORE_VENDORS } from "@/lib/store-seed";
import { usePartnershipsStore } from "@/stores/partnerships-store";
import { PartnershipInboxRow } from "@/components/partnerships/PartnershipInboxRow";
import { isOpenStatus } from "@/types/partnership";
import type { PartnershipStatus } from "@/types/partnership";

const STATUS_TABS: { id: "all" | "open" | "completed"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "open", label: "Open" },
  { id: "completed", label: "Completed" },
];

export default function VendorPartnershipsPage() {
  const proposals = usePartnershipsStore((s) => s.proposals);
  const [vendorId, setVendorId] = useState<string>(STORE_VENDORS[0].id);
  const [tab, setTab] = useState<"all" | "open" | "completed">("all");

  const myProposals = useMemo(
    () =>
      proposals
        .filter((p) => p.vendorId === vendorId)
        .sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() -
            new Date(a.updatedAt).getTime(),
        ),
    [proposals, vendorId],
  );

  const filtered = useMemo(() => {
    if (tab === "all") return myProposals;
    if (tab === "open") return myProposals.filter((p) => isOpenStatus(p.status));
    return myProposals.filter((p) => p.status === "completed");
  }, [myProposals, tab]);

  const counts = useMemo(
    () => ({
      open: myProposals.filter((p) => isOpenStatus(p.status)).length,
      completed: myProposals.filter((p) => p.status === "completed").length,
      totalSpend: myProposals
        .filter((p) => p.status === "completed")
        .reduce((sum, p) => sum + p.proposedBudget, 0),
    }),
    [myProposals],
  );

  return (
    <div className="px-8 py-8">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-gold">
            Partnerships
          </p>
          <h1
            className="mt-1 text-[26px] leading-tight text-[#2C2C2C]"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 500,
              letterSpacing: "-0.01em",
            }}
          >
            Creator partnerships
          </h1>
          <p className="mt-1 text-[13px] text-[#6a6a6a]">
            Browse creators, propose paid features, and manage active deals.
          </p>
        </div>
        <Link
          href="/vendor/partnerships/directory"
          className="flex items-center gap-1.5 rounded-md bg-ink px-3.5 py-2 text-[12px] font-medium text-ivory transition-colors hover:bg-ink/90"
        >
          <Users size={13} strokeWidth={1.8} />
          Browse creator directory
        </Link>
      </div>

      {/* Vendor selector (the portal is single-tenant by default — but the
          partnership seed data is per-artisan-vendor, so we let the demo
          switch perspectives like the Creator dashboard does) */}
      <VendorSelector active={vendorId} onChange={setVendorId} />

      {/* Stat strip */}
      <div className="grid grid-cols-3 gap-3">
        <Stat label="Open partnerships" value={String(counts.open)} />
        <Stat label="Completed" value={String(counts.completed)} />
        <Stat
          label="Total spend (completed)"
          value={`$${(counts.totalSpend / 100).toFixed(0)}`}
        />
      </div>

      {/* Tabs */}
      <div className="mt-6 flex items-center gap-1 border-b border-border">
        {STATUS_TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "px-4 py-2 text-[12.5px] transition-colors",
              tab === t.id
                ? "border-b-2 border-gold text-ink"
                : "text-ink-muted hover:text-ink",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="mt-4 flex flex-col gap-2">
        {filtered.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-white p-10 text-center">
            <Sparkles
              size={20}
              strokeWidth={1.4}
              className="mx-auto mb-2 text-gold"
            />
            <p className="text-[13px] italic text-ink-muted">
              No partnerships in this view yet.
            </p>
            <Link
              href="/vendor/partnerships/directory"
              className="mt-3 inline-flex rounded-md border border-gold/40 bg-white px-3 py-1.5 text-[12px] text-gold hover:bg-gold-pale/30"
            >
              Browse creators
            </Link>
          </div>
        ) : (
          filtered.map((p) => (
            <PartnershipInboxRow
              key={p.id}
              proposal={p}
              perspective="vendor"
              href={`/vendor/partnerships/${p.id}`}
            />
          ))
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-white px-4 py-3">
      <p className="font-mono text-[10px] uppercase tracking-wider text-ink-faint">
        {label}
      </p>
      <p
        className="mt-0.5 text-[20px] text-ink"
        style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}
      >
        {value}
      </p>
    </div>
  );
}

function VendorSelector({
  active,
  onChange,
}: {
  active: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint">
        Acting as
      </span>
      {STORE_VENDORS.map((v) => (
        <button
          key={v.id}
          onClick={() => onChange(v.id)}
          className={cn(
            "rounded-full border px-3 py-1 text-[11.5px] transition-colors",
            active === v.id
              ? "border-gold/40 bg-gold-pale/40 text-ink"
              : "border-border bg-white text-ink-muted hover:border-gold/30",
          )}
        >
          {v.name}
        </button>
      ))}
    </div>
  );
}
