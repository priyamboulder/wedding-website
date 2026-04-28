"use client";

import { Fragment, useMemo, useState } from "react";
import { PLANNER_PALETTE } from "@/components/planner/ui";
import {
  AI_RECS_BY_CATEGORY,
  ROSTER_BY_CATEGORY,
  type VendorStatus,
  type WeddingDetail,
  type WeddingVendorRow,
} from "@/lib/planner/wedding-detail-seed";
import { StatusBadge } from "./StatusBadge";
import {
  AiRecommendationsPanel,
  MarketplacePanel,
  OpenCategoryActions,
  RosterPanel,
  type FillPath,
} from "./OpenCategoryActions";
import { VendorDetailPanel } from "./VendorDetailPanel";
import { RecommendModal, type RecommendTarget } from "./RecommendModal";
import { BudgetSummary } from "./BudgetSummary";
import { EventsVendorsGrid } from "./EventsVendorsGrid";

type SentRec = {
  rowId: string;
  vendorName: string;
  note: string;
};

export function VendorMatrix({ wedding: initialWedding }: { wedding: WeddingDetail }) {
  // Local editable copy so "Recommend to Couple" can flip a row's status.
  const [wedding, setWedding] = useState<WeddingDetail>(initialWedding);
  const [expandedRowId, setExpandedRowId] = useState<string | null>("mehndi");
  const [activeFillPath, setActiveFillPath] = useState<Record<string, FillPath | null>>(
    { mehndi: null } // open-row starts showing the three option buttons
  );
  const [detailRowId, setDetailRowId] = useState<string | null>(null);
  const [recommendTarget, setRecommendTarget] = useState<
    (RecommendTarget & { rowId: string }) | null
  >(null);
  const [sentRecs, setSentRecs] = useState<SentRec[]>([]);
  const [view, setView] = useState<"matrix" | "coverage">("matrix");

  const { bookedCount, totalCount, committed, remaining } = useMemo(() => {
    let booked = 0;
    let committedSum = 0;
    let remainingSum = 0;
    for (const row of wedding.vendors) {
      if (isBookedLike(row.status)) {
        booked += 1;
        committedSum += row.budget;
      } else if (row.status === "open") {
        remainingSum += row.budget;
      }
    }
    return {
      bookedCount: booked,
      totalCount: wedding.vendors.length,
      committed: committedSum,
      remaining: remainingSum,
    };
  }, [wedding]);

  const detailRow = detailRowId
    ? wedding.vendors.find((r) => r.id === detailRowId)
    : null;

  function handleRowClick(row: WeddingVendorRow) {
    if (row.status === "open") {
      // Toggle expansion; reset inner fill path when collapsing.
      setExpandedRowId((prev) => (prev === row.id ? null : row.id));
      setActiveFillPath((prev) => ({ ...prev, [row.id]: null }));
    } else if (row.vendor) {
      setDetailRowId(row.id);
    }
  }

  function openRecommend(rowId: string, target: Omit<RecommendTarget, "category">) {
    const row = wedding.vendors.find((r) => r.id === rowId);
    if (!row) return;
    setRecommendTarget({ ...target, category: row.category, rowId });
  }

  function sendRecommendation(note: string) {
    if (!recommendTarget) return;
    setSentRecs((prev) => [
      ...prev,
      { rowId: recommendTarget.rowId, vendorName: recommendTarget.name, note },
    ]);
    setWedding((prev) => ({
      ...prev,
      vendors: prev.vendors.map((r) =>
        r.id === recommendTarget.rowId
          ? {
              ...r,
              status: "recommended" as VendorStatus,
              vendor: {
                name: recommendTarget.name,
                photoInitials: initials(recommendTarget.name),
                rating: recommendTarget.rating ?? 4.8,
                location: recommendTarget.location,
              },
              budget: r.budget,
            }
          : r
      ),
    }));
    setRecommendTarget(null);
    setExpandedRowId(null);
  }

  return (
    <section className="mx-auto max-w-[1280px] px-8 py-8">
      {/* Title bar + view toggle */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[10.5px] uppercase tracking-[0.26em] text-[#9E8245]">
            Vendors
          </p>
          <h2
            className="mt-1 text-[30px] leading-none text-[#2C2C2C]"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 500,
            }}
          >
            Vendor Team
          </h2>
          <p
            className="mt-2 text-[12.5px] italic text-[#6a6a6a]"
            style={{ fontFamily: "'EB Garamond', serif" }}
          >
            {bookedCount} of {totalCount} booked · {totalCount - bookedCount} still to fill.
          </p>
        </div>

        <ViewToggle value={view} onChange={setView} />
      </div>

      {view === "matrix" ? (
        <>
          <MatrixTable
            wedding={wedding}
            expandedRowId={expandedRowId}
            activeFillPath={activeFillPath}
            onRowClick={handleRowClick}
            onPickFill={(rowId, path) =>
              setActiveFillPath((prev) => ({ ...prev, [rowId]: path }))
            }
            onSelectCandidate={openRecommend}
            sentRecs={sentRecs}
          />
          <BudgetSummary
            committed={committed}
            remaining={remaining}
            budgetMin={wedding.budgetMin}
            budgetMax={wedding.budgetMax}
          />
        </>
      ) : (
        <EventsVendorsGrid wedding={wedding} />
      )}

      {detailRow && detailRow.vendor && (
        <VendorDetailPanel row={detailRow} onClose={() => setDetailRowId(null)} />
      )}

      {recommendTarget && (
        <RecommendModal
          target={recommendTarget}
          onCancel={() => setRecommendTarget(null)}
          onSend={sendRecommendation}
        />
      )}
    </section>
  );
}

// ── Table ───────────────────────────────────────────────────────────────────

function MatrixTable({
  wedding,
  expandedRowId,
  activeFillPath,
  onRowClick,
  onPickFill,
  onSelectCandidate,
  sentRecs,
}: {
  wedding: WeddingDetail;
  expandedRowId: string | null;
  activeFillPath: Record<string, FillPath | null>;
  onRowClick: (row: WeddingVendorRow) => void;
  onPickFill: (rowId: string, path: FillPath) => void;
  onSelectCandidate: (
    rowId: string,
    target: {
      name: string;
      priceRange: string;
      location: string;
      rating?: number;
      workedTogether?: number;
    }
  ) => void;
  sentRecs: SentRec[];
}) {
  return (
    <div
      className="mt-5 overflow-hidden rounded-2xl border bg-white"
      style={{
        borderColor: PLANNER_PALETTE.hairline,
        boxShadow:
          "0 1px 0 rgba(44,44,44,0.02), 0 24px 48px -36px rgba(44,44,44,0.16)",
      }}
    >
      <table className="w-full text-[13px]">
        <thead
          className="border-b"
          style={{ borderColor: "rgba(44,44,44,0.08)", backgroundColor: "#FBF4E6" }}
        >
          <tr>
            <HeaderCell>Category</HeaderCell>
            <HeaderCell>Vendor</HeaderCell>
            <HeaderCell>Status</HeaderCell>
            <HeaderCell align="right">Budget</HeaderCell>
            <HeaderCell align="right">Actions</HeaderCell>
          </tr>
        </thead>
        <tbody>
          {wedding.vendors.map((row) => {
            const isExpanded = expandedRowId === row.id;
            const note = sentRecs.find((r) => r.rowId === row.id)?.note;
            return (
              <Fragment key={row.id}>
                <MatrixRow
                  row={row}
                  isExpanded={isExpanded}
                  onClick={() => onRowClick(row)}
                  recommendedNote={note}
                />
                {row.status === "open" && isExpanded && (
                  <tr>
                    <td colSpan={5} className="bg-[#FDFAF1] px-6 py-4">
                      <OpenRowExpansion
                        row={row}
                        activePath={activeFillPath[row.id] ?? null}
                        onPickPath={(p) => onPickFill(row.id, p)}
                        onSelectCandidate={(target) =>
                          onSelectCandidate(row.id, target)
                        }
                      />
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function HeaderCell({
  children,
  align = "left",
}: {
  children: React.ReactNode;
  align?: "left" | "right";
}) {
  return (
    <th
      className="px-5 py-3.5 font-mono text-[10.5px] font-normal uppercase tracking-[0.22em] text-[#9E8245]"
      style={{ textAlign: align }}
    >
      {children}
    </th>
  );
}

function MatrixRow({
  row,
  isExpanded,
  onClick,
  recommendedNote,
}: {
  row: WeddingVendorRow;
  isExpanded: boolean;
  onClick: () => void;
  recommendedNote?: string;
}) {
  const isOpen = row.status === "open";
  return (
    <tr
      onClick={onClick}
      className="cursor-pointer border-t transition-colors hover:bg-[#FBF4E6]/45"
      style={{ borderColor: "rgba(44,44,44,0.06)" }}
    >
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <span
            className="grid h-8 w-8 place-items-center rounded-full text-[14px]"
            style={{
              backgroundColor: "#F5E6D0",
              boxShadow: "inset 0 0 0 1px rgba(196,162,101,0.35)",
            }}
            aria-hidden
          >
            {row.icon}
          </span>
          <span className="text-[13.5px] text-[#2C2C2C]">{row.category}</span>
        </div>
      </td>
      <td className="px-5 py-4">
        {row.vendor ? (
          <div className="min-w-0">
            <p className="truncate text-[13.5px] text-[#2C2C2C]">
              {row.vendor.name}
            </p>
            {recommendedNote && (
              <p
                className="mt-1 line-clamp-1 text-[11.5px] italic text-[#5A3F88]"
                style={{ fontFamily: "'EB Garamond', serif" }}
                title={recommendedNote}
              >
                ✦ sent to couple with your note
              </p>
            )}
          </div>
        ) : (
          <span className="text-[14px] text-[#b5a68e]">—</span>
        )}
      </td>
      <td className="px-5 py-4">
        <StatusBadge status={row.status} />
      </td>
      <td className="px-5 py-4 text-right">
        <span
          className="font-mono text-[13px] text-[#2C2C2C]"
          style={{ fontWeight: 500 }}
        >
          {row.isEstimated ? "~" : ""}${row.budget.toLocaleString()}
        </span>
      </td>
      <td className="px-5 py-4 text-right">
        <span
          className="text-[12px] text-[#9E8245]"
          aria-hidden
        >
          {isOpen ? (isExpanded ? "▴" : "▾ Fill") : "Open →"}
        </span>
      </td>
    </tr>
  );
}

// ── Open row expansion ──────────────────────────────────────────────────────

function OpenRowExpansion({
  row,
  activePath,
  onPickPath,
  onSelectCandidate,
}: {
  row: WeddingVendorRow;
  activePath: FillPath | null;
  onPickPath: (p: FillPath) => void;
  onSelectCandidate: (target: {
    name: string;
    priceRange: string;
    location: string;
    rating?: number;
    workedTogether?: number;
  }) => void;
}) {
  const roster = ROSTER_BY_CATEGORY[row.id] ?? [];
  const aiRecs = AI_RECS_BY_CATEGORY[row.id] ?? [];

  return (
    <div className="space-y-4">
      <OpenCategoryActions
        row={row}
        rosterCount={roster.length}
        onPick={onPickPath}
      />

      {activePath === "ai" && (
        <AiRecommendationsPanel
          category={row.category}
          recs={aiRecs}
          onSelect={(v) =>
            onSelectCandidate({
              name: v.name,
              priceRange: v.priceRange,
              location: v.location,
              rating: aiRecs.find((r) => r.name === v.name)?.rating,
            })
          }
        />
      )}

      {activePath === "roster" && (
        <RosterPanel
          category={row.category}
          vendors={roster}
          onSelect={(v) =>
            onSelectCandidate({
              name: v.name,
              priceRange: v.priceRange,
              location: v.location,
              rating: roster.find((r) => r.name === v.name)?.rating,
              workedTogether: roster.find((r) => r.name === v.name)
                ?.timesWorkedTogether,
            })
          }
        />
      )}

      {activePath === "marketplace" && <MarketplacePanel category={row.category} />}
    </div>
  );
}

// ── View toggle ─────────────────────────────────────────────────────────────

function ViewToggle({
  value,
  onChange,
}: {
  value: "matrix" | "coverage";
  onChange: (v: "matrix" | "coverage") => void;
}) {
  const options: { key: "matrix" | "coverage"; label: string }[] = [
    { key: "matrix", label: "Vendor Matrix" },
    { key: "coverage", label: "Events × Vendors" },
  ];
  return (
    <div
      className="inline-flex rounded-full p-1"
      style={{
        backgroundColor: "#FBF4E6",
        boxShadow: "inset 0 0 0 1px rgba(196,162,101,0.32)",
      }}
    >
      {options.map((o) => {
        const isActive = value === o.key;
        return (
          <button
            key={o.key}
            type="button"
            onClick={() => onChange(o.key)}
            className="rounded-full px-3.5 py-1.5 text-[12px] font-medium transition-colors"
            style={{
              backgroundColor: isActive ? "#2C2C2C" : "transparent",
              color: isActive ? "#FAF8F5" : "#6a6a6a",
            }}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

// ── helpers ─────────────────────────────────────────────────────────────────

function isBookedLike(status: VendorStatus): boolean {
  return status === "booked" || status === "contracted" || status === "ordered";
}

function initials(name: string): string {
  const parts = name.split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}
