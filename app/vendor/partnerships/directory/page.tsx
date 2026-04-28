"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Search, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { STORE_VENDORS } from "@/lib/store-seed";
import { useCreatorsStore } from "@/stores/creators-store";
import { ProposalForm } from "@/components/partnerships/ProposalForm";
import {
  CreatorDirectoryCard,
  type DirectoryCreator,
} from "@/components/partnerships/CreatorDirectoryCard";
import type { Creator, CreatorTier } from "@/types/creator";

const TIER_OPTIONS: { id: CreatorTier | "all"; label: string }[] = [
  { id: "all", label: "All tiers" },
  { id: "top_creator", label: "Top creator" },
  { id: "rising", label: "Rising" },
  { id: "standard", label: "Standard" },
];

export default function CreatorDirectoryPage() {
  const creators = useCreatorsStore((s) => s.creators);
  const collections = useCreatorsStore((s) => s.collections);
  const picks = useCreatorsStore((s) => s.picks);

  const [vendorId, setVendorId] = useState<string>(STORE_VENDORS[0].id);
  const [search, setSearch] = useState("");
  const [tier, setTier] = useState<CreatorTier | "all">("all");
  const [minFollowers, setMinFollowers] = useState(0);
  const [proposalCreator, setProposalCreator] = useState<Creator | null>(null);

  // Lock body scroll while modal is open
  useEffect(() => {
    if (!proposalCreator) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [proposalCreator]);

  const enriched: DirectoryCreator[] = useMemo(
    () =>
      creators.map((c) => {
        const cols = collections.filter((col) => col.creatorId === c.id);
        const cs = picks.filter((p) =>
          cols.some((col) => col.id === p.collectionId),
        );
        return {
          ...c,
          collectionCount: cols.length,
          pickCount: cs.length,
          avgPicksPerCollection:
            cols.length === 0
              ? 0
              : Math.round((cs.length / cols.length) * 10) / 10,
          engagementRate:
            c.tier === "top_creator"
              ? 0.082
              : c.tier === "rising"
                ? 0.064
                : 0.045,
        };
      }),
    [creators, collections, picks],
  );

  const filtered = useMemo(() => {
    return enriched.filter((c) => {
      if (tier !== "all" && c.tier !== tier) return false;
      if (c.followerCount < minFollowers) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        if (
          !c.displayName.toLowerCase().includes(q) &&
          !c.handle.toLowerCase().includes(q) &&
          !c.specialties.some((s) => s.toLowerCase().includes(q))
        ) {
          return false;
        }
      }
      return true;
    });
  }, [enriched, tier, minFollowers, search]);

  return (
    <div className="px-8 py-8">
      <div className="mb-6">
        <Link
          href="/vendor/partnerships"
          className="inline-flex items-center gap-1 font-mono text-[10.5px] uppercase tracking-[0.22em] text-ink-faint hover:text-ink"
        >
          <ArrowLeft size={11} strokeWidth={1.6} />
          Back to partnerships
        </Link>
        <h1
          className="mt-2 text-[26px] leading-tight text-[#2C2C2C]"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 500,
            letterSpacing: "-0.01em",
          }}
        >
          Creator directory
        </h1>
        <p className="mt-1 text-[13px] text-[#6a6a6a]">
          {filtered.length} creators · Filter by tier, audience, or specialty.
        </p>
      </div>

      {/* Vendor selector */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint">
          Proposing as
        </span>
        {STORE_VENDORS.map((v) => (
          <button
            key={v.id}
            onClick={() => setVendorId(v.id)}
            className={cn(
              "rounded-full border px-3 py-1 text-[11.5px] transition-colors",
              vendorId === v.id
                ? "border-gold/40 bg-gold-pale/40 text-ink"
                : "border-border bg-white text-ink-muted hover:border-gold/30",
            )}
          >
            {v.name}
          </button>
        ))}
      </div>

      {/* Filter bar */}
      <div className="mb-5 flex flex-wrap items-center gap-3 rounded-lg border border-border bg-white p-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search
            size={12}
            strokeWidth={1.6}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-faint"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, handle, or specialty"
            className="w-full rounded-md border border-border bg-white py-1.5 pl-7 pr-3 text-[12.5px] focus:border-gold/40 focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-1">
          <Filter
            size={12}
            strokeWidth={1.6}
            className="text-ink-faint"
            aria-hidden
          />
          <select
            value={tier}
            onChange={(e) => setTier(e.target.value as CreatorTier | "all")}
            className="rounded-md border border-border bg-white px-2 py-1.5 text-[12px] text-ink focus:border-gold/40 focus:outline-none"
          >
            {TIER_OPTIONS.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2 text-[12px] text-ink-muted">
          <label className="font-mono text-[10px] uppercase tracking-wider text-ink-faint">
            Min followers
          </label>
          <input
            type="number"
            value={minFollowers}
            onChange={(e) => setMinFollowers(Number(e.target.value) || 0)}
            className="w-24 rounded-md border border-border bg-white px-2 py-1.5 text-[12px] focus:border-gold/40 focus:outline-none"
          />
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border bg-white p-10 text-center text-[13px] italic text-ink-muted">
          No creators match these filters.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((c) => (
            <CreatorDirectoryCard
              key={c.id}
              creator={c}
              onPropose={() => setProposalCreator(c)}
            />
          ))}
        </div>
      )}

      {proposalCreator && (
        <ProposalForm
          vendorId={vendorId}
          creator={proposalCreator}
          onClose={() => setProposalCreator(null)}
        />
      )}
    </div>
  );
}
