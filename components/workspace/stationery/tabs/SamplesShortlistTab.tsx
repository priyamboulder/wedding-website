"use client";

// ── Stationery · Samples & Shortlist tab ───────────────────────────────────
// Where the couple reacts to real vendor work and builds a shortlist.
// Sample requests track the "nothing beats holding the paper" flow:
// request → receive → review with Love / Good / Not quite right.
// Vendor shortlist reuses the generic ShortlistGridBlock; budget snapshot
// rolls up estimated costs across selected suite pieces.

import { useMemo, useState } from "react";
import {
  CheckCircle2,
  CircleDashed,
  Heart,
  Mail,
  Package,
  Plus,
  Scale,
  ThumbsDown,
  ThumbsUp,
  Trash2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useStationeryStore } from "@/stores/stationery-store";
import { useVendorsStore } from "@/stores/vendors-store";
import type { WorkspaceCategory } from "@/types/workspace";
import type {
  StationerySampleReaction,
  StationerySampleRequestStatus,
} from "@/types/stationery";
import { ShortlistGridBlock } from "@/components/workspace/blocks/generic-blocks";
import {
  EmptyRow,
  Eyebrow,
  PanelCard,
} from "@/components/workspace/blocks/primitives";

export function StationerySamplesShortlistTab({
  category,
}: {
  category: WorkspaceCategory;
}) {
  return (
    <div className="space-y-4">
      <SampleRequests />
      <ShortlistBlock category={category} />
      <BudgetSnapshot />
    </div>
  );
}

// ── Sample requests ───────────────────────────────────────────────────────

const STATUS_META: Record<
  StationerySampleRequestStatus,
  { label: string; icon: React.ReactNode; tone: string }
> = {
  requested: {
    label: "Requested",
    icon: <CircleDashed size={11} strokeWidth={1.8} />,
    tone: "border-border bg-white text-ink-muted",
  },
  received: {
    label: "Received",
    icon: <Package size={11} strokeWidth={1.8} />,
    tone: "border-sage bg-sage-pale/40 text-sage",
  },
  reviewed: {
    label: "Reviewed",
    icon: <CheckCircle2 size={11} strokeWidth={1.8} />,
    tone: "border-saffron bg-saffron-pale/40 text-saffron",
  },
};

const REACTION_META: Record<
  Exclude<StationerySampleReaction, null>,
  { label: string; icon: React.ReactNode; tone: string }
> = {
  love: {
    label: "Love",
    icon: <Heart size={11} strokeWidth={1.8} />,
    tone: "border-rose bg-rose-pale/60 text-rose",
  },
  good: {
    label: "Good",
    icon: <ThumbsUp size={11} strokeWidth={1.8} />,
    tone: "border-saffron bg-saffron-pale/40 text-saffron",
  },
  not_right: {
    label: "Not quite right",
    icon: <ThumbsDown size={11} strokeWidth={1.8} />,
    tone: "border-ink bg-ink/5 text-ink",
  },
};

function SampleRequests() {
  const sampleRequests = useStationeryStore((s) => s.sampleRequests);
  const addSampleRequest = useStationeryStore((s) => s.addSampleRequest);
  const updateSampleRequest = useStationeryStore(
    (s) => s.updateSampleRequest,
  );
  const deleteSampleRequest = useStationeryStore(
    (s) => s.deleteSampleRequest,
  );
  const setSampleRequestStatus = useStationeryStore(
    (s) => s.setSampleRequestStatus,
  );
  const setSampleRequestReaction = useStationeryStore(
    (s) => s.setSampleRequestReaction,
  );

  const shortlist = useVendorsStore((s) => s.shortlist);
  const vendors = useVendorsStore((s) => s.vendors);

  const shortlistedStationers = useMemo(() => {
    const ids = new Set(shortlist.map((s) => s.vendor_id));
    return vendors.filter(
      (v) => v.category === "stationery" && ids.has(v.id),
    );
  }, [shortlist, vendors]);

  const [pickerOpen, setPickerOpen] = useState(false);

  const awaitingRequest = useMemo(
    () =>
      shortlistedStationers.filter(
        (v) => !sampleRequests.some((r) => r.vendor_id === v.id),
      ),
    [shortlistedStationers, sampleRequests],
  );

  return (
    <PanelCard
      icon={<Mail size={14} strokeWidth={1.8} />}
      eyebrow="Paper in hand"
      title="Sample requests"
      description="Request printed samples from shortlisted designers so you can see and feel the stock before deciding."
      badge={
        <span
          className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Nothing beats holding the paper
        </span>
      }
    >
      <p className="mb-3 text-[12.5px] text-ink-muted">
        Request samples from shortlisted designers. Once you&apos;ve held the
        paper, tell us which one moved you — we&apos;ll surface it everywhere
        else.
      </p>

      {sampleRequests.length === 0 ? (
        <EmptyRow>
          No sample requests yet. Shortlist a stationer below, then request a
          sample to start tracking.
        </EmptyRow>
      ) : (
        <ul className="divide-y divide-border/60">
          {sampleRequests.map((r) => {
            const status = STATUS_META[r.status];
            return (
              <li
                key={r.id}
                className="grid grid-cols-1 gap-2 py-3 sm:grid-cols-[1fr_auto] sm:items-center"
              >
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-medium text-ink">
                    {r.vendor_name}
                  </p>
                  <Eyebrow className="mt-0.5">
                    Requested {new Date(r.requested_at).toLocaleDateString()}
                  </Eyebrow>
                  <input
                    type="text"
                    value={r.notes ?? ""}
                    onChange={(e) =>
                      updateSampleRequest(r.id, { notes: e.target.value })
                    }
                    placeholder="Notes — stock weight, colour fidelity, turnaround…"
                    className="mt-1.5 w-full rounded-sm border border-border bg-white px-2 py-1 text-[11.5px] text-ink placeholder:text-ink-faint focus:border-saffron focus:outline-none"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <div className="flex items-center gap-1">
                    {(
                      Object.keys(STATUS_META) as StationerySampleRequestStatus[]
                    ).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSampleRequestStatus(r.id, s)}
                        className={cn(
                          "inline-flex items-center gap-1 rounded-sm border px-1.5 py-1 font-mono text-[9.5px] uppercase tracking-[0.08em] transition-colors",
                          r.status === s
                            ? STATUS_META[s].tone
                            : "border-border bg-white text-ink-muted hover:border-ink",
                        )}
                        style={{ fontFamily: "var(--font-mono)" }}
                      >
                        {STATUS_META[s].icon}
                        {STATUS_META[s].label}
                      </button>
                    ))}
                  </div>
                  <span className="text-ink-faint">·</span>
                  <div className="flex items-center gap-1">
                    {(
                      Object.keys(REACTION_META) as Exclude<
                        StationerySampleReaction,
                        null
                      >[]
                    ).map((react) => (
                      <button
                        key={react}
                        type="button"
                        onClick={() =>
                          setSampleRequestReaction(
                            r.id,
                            r.reaction === react ? null : react,
                          )
                        }
                        title={REACTION_META[react].label}
                        className={cn(
                          "inline-flex items-center gap-0.5 rounded-sm border px-1.5 py-1 transition-colors",
                          r.reaction === react
                            ? REACTION_META[react].tone
                            : "border-border bg-white text-ink-muted hover:border-ink",
                        )}
                      >
                        {REACTION_META[react].icon}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteSampleRequest(r.id)}
                    className="ml-1 inline-flex h-6 w-6 items-center justify-center rounded-sm border border-transparent text-ink-muted hover:border-rose hover:text-rose"
                    aria-label="Remove request"
                  >
                    <Trash2 size={11} strokeWidth={1.8} />
                  </button>
                </div>
                {/* Unused status icon export so the badge ref type-checks. */}
                <span className="hidden">{status.label}</span>
              </li>
            );
          })}
        </ul>
      )}

      {pickerOpen ? (
        <div className="mt-3 rounded-md border border-border bg-white p-3">
          <p className="mb-2 text-[11.5px] text-ink-muted">
            Pick a shortlisted stationer to request a sample from:
          </p>
          {awaitingRequest.length === 0 ? (
            <EmptyRow>
              Every shortlisted stationer already has a sample request.
              Shortlist someone new, or add a vendor by name.
            </EmptyRow>
          ) : (
            <ul className="space-y-1">
              {awaitingRequest.map((v) => (
                <li key={v.id}>
                  <button
                    type="button"
                    onClick={() => {
                      addSampleRequest({
                        vendor_id: v.id,
                        vendor_name: v.name,
                        status: "requested",
                        reaction: null,
                      });
                      setPickerOpen(false);
                    }}
                    className="flex w-full items-center justify-between rounded-sm border border-border bg-white px-2.5 py-1.5 text-left text-[12px] text-ink hover:border-saffron hover:bg-ivory-warm"
                  >
                    <span>{v.name}</span>
                    <span
                      className="font-mono text-[10px] uppercase tracking-[0.1em] text-ink-faint"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {v.location || "—"}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-2 flex justify-end">
            <button
              type="button"
              onClick={() => setPickerOpen(false)}
              className="inline-flex items-center gap-1 rounded-sm border border-border bg-white px-2 py-1 text-[11px] text-ink-muted hover:text-ink"
            >
              <X size={10} /> Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="mt-3 inline-flex items-center gap-1.5 rounded-sm border border-saffron/40 bg-saffron-pale/40 px-2.5 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.1em] text-saffron hover:bg-saffron-pale/70"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          <Plus size={11} /> Request a sample
        </button>
      )}
    </PanelCard>
  );
}

// ── Vendor shortlist ──────────────────────────────────────────────────────

function ShortlistBlock({ category }: { category: WorkspaceCategory }) {
  return <ShortlistGridBlock categorySlug={category.slug} />;
}

// ── Budget snapshot ───────────────────────────────────────────────────────

function BudgetSnapshot() {
  const suite = useStationeryStore((s) => s.suite);
  const piecePreferences = useStationeryStore((s) => s.piecePreferences);

  const { totalWant, totalMaybe, lineItems } = useMemo(() => {
    let totalWant = 0;
    let totalMaybe = 0;
    const lineItems: {
      id: string;
      name: string;
      unit: number;
      qty: number;
      total: number;
      pref: "want" | "maybe";
    }[] = [];
    for (const item of suite) {
      const pref =
        piecePreferences[item.id] ??
        (item.enabled ? "want" : "skip");
      if (pref === "skip") continue;
      const total = item.cost_unit * item.quantity;
      if (pref === "want") totalWant += total;
      if (pref === "maybe") totalMaybe += total;
      lineItems.push({
        id: item.id,
        name: item.name,
        unit: item.cost_unit,
        qty: item.quantity,
        total,
        pref,
      });
    }
    return { totalWant, totalMaybe, lineItems };
  }, [suite, piecePreferences]);

  return (
    <PanelCard
      icon={<Scale size={14} strokeWidth={1.8} />}
      eyebrow="Spend at a glance"
      title="Budget snapshot"
      description="Estimated spend across every piece you've marked want-or-maybe. Trims automatically as you de-prioritise."
      badge={
        <span
          className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Estimate only · updates as you shortlist
        </span>
      }
    >
      <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
        <Stat label="Want this" value={formatRupees(totalWant)} tone="saffron" />
        <Stat label="Maybe" value={formatRupees(totalMaybe)} tone="amber" />
        <Stat
          label="Combined ceiling"
          value={formatRupees(totalWant + totalMaybe)}
          tone="ink"
        />
      </div>

      {lineItems.length === 0 ? (
        <EmptyRow>
          Nothing priced in yet. Select pieces on Suite Builder — we&apos;ll
          roll up the numbers here.
        </EmptyRow>
      ) : (
        <ul className="divide-y divide-border/60">
          {lineItems.map((li) => (
            <li
              key={li.id}
              className="flex items-center justify-between gap-3 py-2"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12.5px] text-ink">{li.name}</p>
                <Eyebrow className="mt-0.5">
                  {li.qty} × {formatRupees(li.unit)} ·{" "}
                  {li.pref === "want" ? "Want" : "Maybe"}
                </Eyebrow>
              </div>
              <p
                className={cn(
                  "shrink-0 font-mono text-[12px]",
                  li.pref === "want" ? "text-ink" : "text-ink-muted",
                )}
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {formatRupees(li.total)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </PanelCard>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "saffron" | "amber" | "ink";
}) {
  const toneClass = {
    saffron: "border-saffron/30 bg-saffron-pale/40 text-saffron",
    amber: "border-amber-300 bg-amber-50 text-amber-700",
    ink: "border-border bg-ivory-warm/40 text-ink",
  }[tone];
  return (
    <div className={cn("rounded-md border px-3 py-2", toneClass)}>
      <Eyebrow>{label}</Eyebrow>
      <p
        className="mt-0.5 font-serif text-[18px] leading-none"
        style={{ fontFamily: "Fraunces, serif" }}
      >
        {value}
      </p>
    </div>
  );
}

function formatRupees(n: number): string {
  if (n === 0) return "₹0";
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}k`;
  return `₹${n.toLocaleString("en-IN")}`;
}
