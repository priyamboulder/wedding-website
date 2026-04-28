"use client";

// Vendor Discovery showcase — the end-to-end demo for the three feature
// expansion areas: Video Profiles, Hyper-Specific Categories, and
// Intelligent Matching. Couple-facing. Wires every primitive from
// components/vendors/discovery/* against the DISCOVERY_VENDORS seed.

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Film,
  MapPin,
  Sparkles,
  Sliders,
  Users,
  User,
  Wallet,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CategoryPicker } from "@/components/vendors/discovery/CategoryPicker";
import { DiscoveryVendorCard } from "@/components/vendors/discovery/DiscoveryVendorCard";
import { StyleQuiz } from "@/components/vendors/discovery/StyleQuiz";
import { StyleMatchBadge } from "@/components/vendors/discovery/StyleMatchBadge";
import { ProvenTeamsPanel } from "@/components/vendors/discovery/ProvenTeamsPanel";
import { BudgetAllocator } from "@/components/vendors/discovery/BudgetAllocator";
import { ComparisonBar } from "@/components/vendors/discovery/ComparisonBar";
import { ComparisonDrawer } from "@/components/vendors/discovery/ComparisonDrawer";
import { useDiscoveryStore } from "@/stores/discovery-store";
import {
  DEMO_CONTEXT,
  DISCOVERY_VENDORS,
} from "@/lib/vendors/discovery-seed";
import {
  buildCollaborationGraph,
  collaborationWithShortlist,
  findProvenTeams,
} from "@/lib/vendors/collaboration-graph";
import { scoreForDiscovery } from "@/lib/vendors/discovery-ranking";
import type { VendorWithDiscovery } from "@/types/vendor-discovery";
import {
  SUBCATEGORY_BY_ID,
  TOP_CATEGORY_LABEL,
} from "@/lib/vendors/taxonomy";
import { matchScore } from "@/lib/vendors/style-matching";
import { availabilityStateFor } from "@/lib/vendors/availability";

export default function DiscoveryPage() {
  const store = useDiscoveryStore();

  // Demo shortlist + target date: seed from DEMO_CONTEXT on first mount only.
  const [shortlist, setShortlist] = useState<Set<string>>(
    () => new Set(["photo_lumiere", "hmua_sana"]),
  );
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
    if (!store.targetWeddingDate) {
      store.setTargetWeddingDate(DEMO_CONTEXT.weddingDate);
    }
  }, [store]);

  const [showQuiz, setShowQuiz] = useState(false);
  const [showCompare, setShowCompare] = useState(false);
  const [showBudget, setShowBudget] = useState(false);

  const vendorsById = useMemo(
    () => new Map(DISCOVERY_VENDORS.map((v) => [v.id, v] as const)),
    [],
  );

  const { adjacency } = useMemo(
    () => buildCollaborationGraph(DISCOVERY_VENDORS),
    [],
  );

  const provenTeams = useMemo(
    () => findProvenTeams(DISCOVERY_VENDORS, adjacency, 2),
    [adjacency],
  );

  // ── Filter pipeline ────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list: VendorWithDiscovery[] = DISCOVERY_VENDORS;
    if (store.topCategory) {
      list = list.filter((v) => v.category === store.topCategory);
    }
    if (store.subcategoryIds.length > 0) {
      list = list.filter(
        (v) =>
          v.subcategory_id && store.subcategoryIds.includes(v.subcategory_id),
      );
    }
    if (store.hasVideoOnly) {
      list = list.filter((v) => v.video_profile?.badge === "earned");
    }
    if (store.availableOnDateOnly && store.targetWeddingDate) {
      list = list.filter(
        (v) =>
          availabilityStateFor(v.availability, store.targetWeddingDate!) !==
          "booked",
      );
    }
    return list;
  }, [
    store.topCategory,
    store.subcategoryIds,
    store.hasVideoOnly,
    store.availableOnDateOnly,
    store.targetWeddingDate,
  ]);

  // Ranked + augmented with "why this pick" reasons.
  const ranked = useMemo(() => {
    const ctx = {
      coupleStyle: store.styleProfile,
      targetDateIso: store.targetWeddingDate,
      shortlistedVendorIds: Array.from(shortlist),
      adjacency,
      venueName: DEMO_CONTEXT.venueName,
      plannerCompany: DEMO_CONTEXT.plannerCompany,
    };
    return filtered
      .map((v) => ({ v, score: scoreForDiscovery(v, ctx) }))
      .sort((a, b) => b.score.total - a.score.total);
  }, [
    filtered,
    store.styleProfile,
    store.targetWeddingDate,
    shortlist,
    adjacency,
  ]);

  // Per-subcategory result counts for the CategoryPicker sidebar.
  const countsBySubId = useMemo(() => {
    const m = new Map<string, number>();
    for (const v of DISCOVERY_VENDORS) {
      if (!v.subcategory_id) continue;
      m.set(v.subcategory_id, (m.get(v.subcategory_id) ?? 0) + 1);
    }
    return m;
  }, []);

  const compareVendors = store.compareIds
    .map((id) => vendorsById.get(id))
    .filter(Boolean) as VendorWithDiscovery[];

  function toggleShortlist(id: string) {
    setShortlist((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="min-h-screen bg-ivory">
      {/* Header / context strip */}
      <header className="sticky top-0 z-20 border-b border-border bg-ivory/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <div>
            <Link
              href="/"
              className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-muted hover:text-ink"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              ← Ananya
            </Link>
            <h1 className="mt-1 font-serif text-[26px] leading-tight text-ink">
              Find your people
            </h1>
            <p className="mt-0.5 text-[12.5px] text-ink-muted">
              {DEMO_CONTEXT.coupleNames} · {DEMO_CONTEXT.venueName} ·{" "}
              {new Date(DEMO_CONTEXT.weddingDate).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <QuickToggle
              icon={Film}
              label="Video only"
              active={store.hasVideoOnly}
              onClick={() => store.setHasVideoOnly(!store.hasVideoOnly)}
            />
            <QuickToggle
              icon={Calendar}
              label="Available on date"
              active={store.availableOnDateOnly}
              onClick={() =>
                store.setAvailableOnDateOnly(!store.availableOnDateOnly)
              }
            />
            <button
              type="button"
              onClick={() => setShowQuiz(true)}
              className={cn(
                "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] transition-colors",
                store.styleProfile
                  ? "border-gold bg-gold-pale text-gold"
                  : "border-border bg-white text-ink-soft hover:border-gold/40",
              )}
            >
              <Sparkles size={13} strokeWidth={1.8} />
              {store.styleProfile ? "Edit style" : "Set your style"}
            </button>
            <button
              type="button"
              onClick={() => setShowBudget(true)}
              className="flex items-center gap-1.5 rounded-full border border-border bg-white px-3 py-1.5 text-[12px] text-ink-soft transition-colors hover:border-gold/40"
            >
              <Wallet size={13} strokeWidth={1.8} />
              Budget
            </button>
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-6 py-8 lg:grid-cols-[260px_minmax(0,1fr)]">
        {/* Sidebar */}
        <aside className="flex flex-col gap-6">
          <CategoryPicker
            selectedSubcategoryIds={store.subcategoryIds}
            onToggleSubcategory={store.toggleSubcategory}
            topCategory={store.topCategory}
            onSetTopCategory={store.setTopCategory}
            countsBySubId={countsBySubId}
          />
        </aside>

        {/* Main column */}
        <main className="flex min-w-0 flex-col gap-8">
          {/* Style summary */}
          {store.styleProfile && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-[12px] border border-gold/25 bg-gold-pale/20 p-3">
              <div className="flex items-center gap-2">
                <Sparkles size={14} strokeWidth={1.8} className="text-gold" />
                <span className="font-serif text-[13.5px] text-ink">
                  Ranking with your style signature
                </span>
                <StyleMatchBadge score={1} size="sm" showPercent={false} />
              </div>
              <button
                type="button"
                onClick={() => store.setStyleProfile(null)}
                className="flex items-center gap-1 text-[11px] text-ink-muted transition-colors hover:text-ink"
              >
                <X size={10} strokeWidth={2} /> Clear
              </button>
            </div>
          )}

          {/* Proven teams */}
          {provenTeams.length > 0 && (
            <section className="flex flex-col gap-3">
              <header className="flex items-center gap-2">
                <Users size={14} strokeWidth={1.8} className="text-gold" />
                <h2 className="font-serif text-[18px] text-ink">
                  Proven teams
                </h2>
                <span
                  className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-ink-muted"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  worked together · 2+ weddings
                </span>
              </header>
              <ProvenTeamsPanel teams={provenTeams} vendorsById={vendorsById} />
            </section>
          )}

          {/* Active filter summary */}
          <ActiveFilterChips />

          {/* Vendor grid with "why this pick" row-level reasons for top 3. */}
          <section className="flex flex-col gap-4">
            <header className="flex items-center justify-between">
              <h2 className="font-serif text-[18px] text-ink">
                {ranked.length} {ranked.length === 1 ? "vendor" : "vendors"}
              </h2>
              <span
                className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-ink-muted"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Ranked for your wedding
              </span>
            </header>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {ranked.map(({ v, score }, idx) => {
                const collab = collaborationWithShortlist(
                  v.id,
                  Array.from(shortlist),
                  adjacency,
                );
                const namesMap = collab.top.map(
                  (c) => vendorsById.get(c.vendor_id)?.name ?? "",
                );
                return (
                  <div key={v.id} className="flex flex-col gap-2">
                    <DiscoveryVendorCard
                      vendor={v}
                      shortlisted={shortlist.has(v.id)}
                      inCompare={store.compareIds.includes(v.id)}
                      onToggleShortlist={() => toggleShortlist(v.id)}
                      onToggleCompare={() => store.toggleCompare(v.id)}
                      onOpen={() => {/* drawer hook-up lives in existing code */}}
                      coupleStyle={store.styleProfile}
                      targetDateIso={store.targetWeddingDate}
                      collaborationOverlap={collab.overlap_count}
                      collaborationNames={namesMap}
                    />
                    {idx < 3 && score.whyThisPick.length > 0 && (
                      <WhyThisPick reasons={score.whyThisPick} />
                    )}
                  </div>
                );
              })}
            </div>

            {ranked.length === 0 && (
              <div className="rounded-[12px] border border-dashed border-border bg-white p-10 text-center">
                <p className="font-serif text-[15px] text-ink-muted">
                  No vendors match these filters.
                </p>
                <button
                  type="button"
                  onClick={store.clearFilters}
                  className="mt-3 rounded-full bg-ink px-4 py-1.5 text-[12px] text-ivory transition-colors hover:bg-ink-soft"
                >
                  Clear filters
                </button>
              </div>
            )}
          </section>

          {/* Shortlist quick view */}
          <section className="flex flex-col gap-3 rounded-[12px] border border-border bg-white p-5">
            <header className="flex items-center gap-2">
              <User size={14} strokeWidth={1.8} className="text-ink-muted" />
              <h3 className="font-serif text-[15px] text-ink">
                Your shortlist
              </h3>
              <span
                className="font-mono text-[10px] text-ink-faint"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {shortlist.size}
              </span>
            </header>
            {shortlist.size === 0 ? (
              <p className="text-[12px] text-ink-muted">
                Tap the heart on any card to save a vendor here.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {Array.from(shortlist).map((id) => {
                  const v = vendorsById.get(id);
                  if (!v) return null;
                  return (
                    <span
                      key={id}
                      className="flex items-center gap-1.5 rounded-full bg-ivory-warm px-3 py-1 text-[11.5px] text-ink ring-1 ring-border"
                    >
                      {v.name}
                      <button
                        type="button"
                        onClick={() => toggleShortlist(id)}
                        className="text-ink-faint hover:text-rose"
                      >
                        <X size={10} strokeWidth={2} />
                      </button>
                    </span>
                  );
                })}
              </div>
            )}
          </section>
        </main>
      </div>

      {/* Comparison bar (fixed) */}
      <ComparisonBar
        selectedVendors={compareVendors}
        onRemove={store.toggleCompare}
        onClearAll={store.clearCompare}
        onOpen={() => setShowCompare(true)}
      />

      {/* Comparison drawer */}
      <ComparisonDrawer
        open={showCompare}
        onClose={() => setShowCompare(false)}
        vendors={compareVendors}
        onRemove={store.toggleCompare}
        coupleStyle={store.styleProfile}
        targetDateIso={store.targetWeddingDate}
        venueName={DEMO_CONTEXT.venueName}
        plannerCompany={DEMO_CONTEXT.plannerCompany}
      />

      {/* Style quiz modal */}
      {showQuiz && (
        <Modal onClose={() => setShowQuiz(false)}>
          <StyleQuiz
            initial={store.styleProfile}
            onComplete={(sig) => {
              store.setStyleProfile(sig);
              setShowQuiz(false);
            }}
            onCancel={() => setShowQuiz(false)}
          />
        </Modal>
      )}

      {/* Budget modal */}
      {showBudget && (
        <Modal onClose={() => setShowBudget(false)} wide>
          <BudgetAllocator
            totalBudgetInr={store.totalBudgetInr}
            allocation={store.allocation}
            onEditTotal={store.setTotalBudget}
            onEditAllocation={store.editAllocation}
            onReset={store.resetAllocation}
          />
        </Modal>
      )}

      {/* Prevent a hydration mismatch flicker on first paint from persisted state. */}
      {!hydrated && <div className="fixed inset-0 bg-ivory" />}
    </div>
  );
}

function QuickToggle({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] transition-colors",
        active
          ? "border-ink bg-ink text-ivory"
          : "border-border bg-white text-ink-soft hover:border-gold/40",
      )}
    >
      <Icon size={13} strokeWidth={1.8} />
      {label}
    </button>
  );
}

function WhyThisPick({ reasons }: { reasons: string[] }) {
  return (
    <div className="flex flex-col gap-1 rounded-[10px] border border-gold/25 bg-gold-pale/20 p-2.5">
      <span
        className="font-mono text-[8.5px] uppercase tracking-[0.18em] text-gold"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        Why this pick
      </span>
      <ul className="flex flex-col gap-0.5">
        {reasons.map((r, i) => (
          <li key={i} className="flex items-start gap-1.5 text-[11.5px] text-ink-soft">
            <span className="mt-[5px] inline-block h-1 w-1 shrink-0 rounded-full bg-gold" />
            {r}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ActiveFilterChips() {
  const store = useDiscoveryStore();
  const { subcategoryIds, topCategory, hasVideoOnly, availableOnDateOnly } = store;
  const activeCount =
    subcategoryIds.length +
    (topCategory ? 1 : 0) +
    (hasVideoOnly ? 1 : 0) +
    (availableOnDateOnly ? 1 : 0);
  if (activeCount === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-border pb-3">
      <span
        className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-ink-muted"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        Active filters
      </span>
      {topCategory && (
        <Chip onRemove={() => store.setTopCategory(null)}>
          {TOP_CATEGORY_LABEL[topCategory]}
        </Chip>
      )}
      {subcategoryIds.map((id) => {
        const sub = SUBCATEGORY_BY_ID.get(id);
        if (!sub) return null;
        return (
          <Chip key={id} onRemove={() => store.toggleSubcategory(id)}>
            {sub.label}
          </Chip>
        );
      })}
      {hasVideoOnly && (
        <Chip onRemove={() => store.setHasVideoOnly(false)}>Has video</Chip>
      )}
      {availableOnDateOnly && (
        <Chip onRemove={() => store.setAvailableOnDateOnly(false)}>
          Available on your date
        </Chip>
      )}
      <button
        type="button"
        onClick={store.clearFilters}
        className="ml-auto text-[11px] text-ink-muted transition-colors hover:text-ink"
      >
        Clear all
      </button>
    </div>
  );
}

function Chip({
  children,
  onRemove,
}: {
  children: React.ReactNode;
  onRemove: () => void;
}) {
  return (
    <span className="flex items-center gap-1 rounded-full bg-ink/8 bg-ivory-deep px-2.5 py-1 text-[11px] text-ink ring-1 ring-border">
      {children}
      <button
        type="button"
        onClick={onRemove}
        className="text-ink-faint hover:text-rose"
        aria-label="Remove filter"
      >
        <X size={9} strokeWidth={2} />
      </button>
    </span>
  );
}

function Modal({
  children,
  onClose,
  wide,
}: {
  children: React.ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/50 p-4 backdrop-blur-sm md:p-10"
      onClick={onClose}
    >
      <div
        className={cn(
          "relative w-full rounded-[16px] bg-ivory p-6 shadow-2xl",
          wide ? "max-w-3xl" : "max-w-xl",
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 rounded-full p-1.5 text-ink-muted transition-colors hover:bg-ivory-warm hover:text-ink"
          aria-label="Close"
        >
          <X size={14} strokeWidth={1.8} />
        </button>
        {children}
      </div>
    </div>
  );
}
