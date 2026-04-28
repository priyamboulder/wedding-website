"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Handshake, Sparkles, DollarSign, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { TopNav } from "@/components/shell/TopNav";
import { useCreatorsStore } from "@/stores/creators-store";
import { usePartnershipsStore } from "@/stores/partnerships-store";
import { PartnershipInboxRow } from "@/components/partnerships/PartnershipInboxRow";
import {
  CreatorAvatar,
  formatFollowerCount,
} from "@/components/creators/CreatorAvatar";
import { isOpenStatus } from "@/types/partnership";

const TABS: { id: "all" | "open" | "completed"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "open", label: "Open" },
  { id: "completed", label: "Completed" },
];

export default function CreatorPartnershipsPage() {
  const creators = useCreatorsStore((s) => s.creators);
  const proposals = usePartnershipsStore((s) => s.proposals);
  const statsForCreator = usePartnershipsStore((s) => s.statsForCreator);

  const [activeId, setActiveId] = useState<string>(creators[0]?.id ?? "");
  const [tab, setTab] = useState<"all" | "open" | "completed">("all");
  const creator = creators.find((c) => c.id === activeId);

  const mine = useMemo(
    () =>
      proposals
        .filter((p) => p.creatorId === activeId)
        .sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() -
            new Date(a.updatedAt).getTime(),
        ),
    [proposals, activeId],
  );

  const stats = useMemo(
    () => statsForCreator(activeId),
    [statsForCreator, activeId],
  );

  const filtered = useMemo(() => {
    if (tab === "all") return mine;
    if (tab === "open") return mine.filter((p) => isOpenStatus(p.status));
    return mine.filter((p) => p.status === "completed");
  }, [mine, tab]);

  if (!creator) {
    return (
      <div className="flex min-h-screen flex-col bg-white">
        <TopNav />
        <p className="m-auto text-[13px] text-ink-muted">No creators available.</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <TopNav>
        <div className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-ink-faint">
          Creator · Partnerships
        </div>
      </TopNav>

      <div className="mx-auto w-full max-w-6xl px-6 py-8">
        {/* Creator switcher */}
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint">
            Viewing as
          </span>
          {creators.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveId(c.id)}
              className={cn(
                "flex items-center gap-2 rounded-full border px-3 py-1 text-[11.5px] transition-colors",
                activeId === c.id
                  ? "border-gold/40 bg-gold-pale/40 text-ink"
                  : "border-border bg-white text-ink-muted hover:border-gold/30",
              )}
            >
              <CreatorAvatar creator={c} size="xs" withBadge={false} />
              {c.displayName}
            </button>
          ))}
        </div>

        {/* Header */}
        <div className="flex items-start gap-4 border-b border-gold/15 pb-5">
          <CreatorAvatar creator={creator} size="lg" />
          <div className="flex-1">
            <h1 className="font-serif text-[24px] leading-tight text-ink">
              {creator.displayName}
            </h1>
            <p className="text-[12.5px] text-ink-muted">{creator.bio}</p>
            <div className="mt-1 flex items-center gap-3 font-mono text-[10.5px] uppercase tracking-wider text-ink-faint">
              <span>{formatFollowerCount(creator.followerCount)} followers</span>
              <span aria-hidden>·</span>
              <span>{(creator.commissionRate * 100).toFixed(0)}% commission</span>
            </div>
          </div>
          <Link
            href={`/dashboard/creator`}
            className="hidden rounded-md border border-border bg-white px-3 py-1.5 text-[11.5px] text-ink-muted transition-colors hover:border-gold/30 hover:text-ink sm:inline"
          >
            ← Creator dashboard
          </Link>
        </div>

        {/* KPIs */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <KpiCard
            icon={Handshake}
            label="Completed"
            value={String(stats.completed)}
            tone="sage"
          />
          <KpiCard
            icon={Sparkles}
            label="Active"
            value={String(stats.active)}
            tone="teal"
          />
          <KpiCard
            icon={TrendingUp}
            label="Pending"
            value={String(stats.pending)}
            tone="saffron"
          />
          <KpiCard
            icon={DollarSign}
            label="Total earned"
            value={`$${(stats.totalEarned / 100).toFixed(0)}`}
            tone="gold"
          />
        </div>

        {/* Tabs */}
        <div className="mt-8 flex items-center gap-1 border-b border-border">
          {TABS.map((t) => (
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
            <p className="rounded-lg border border-dashed border-border bg-white p-10 text-center text-[13px] italic text-ink-muted">
              No partnerships in this view yet.
            </p>
          ) : (
            filtered.map((p) => (
              <PartnershipInboxRow
                key={p.id}
                proposal={p}
                perspective="creator"
                href={`/dashboard/creator/partnerships/${p.id}`}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

const TONE: Record<string, string> = {
  gold: "bg-gold-pale/40 text-gold",
  sage: "bg-sage/15 text-sage",
  teal: "bg-teal/15 text-teal",
  saffron: "bg-saffron/15 text-saffron",
};

function KpiCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof Handshake;
  label: string;
  value: string;
  tone: keyof typeof TONE;
}) {
  return (
    <div className="rounded-lg border border-border bg-white p-4">
      <div
        className={cn(
          "mb-2 inline-flex h-8 w-8 items-center justify-center rounded-full",
          TONE[tone],
        )}
      >
        <Icon size={14} strokeWidth={1.7} />
      </div>
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
