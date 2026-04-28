"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { VENUE_PALETTE, VenueCard } from "@/components/venue/ui";
import {
  LEADS,
  LEAD_PIPELINE,
  leadsByStage,
  type Lead,
  type LeadStage,
} from "@/lib/venue/leads-seed";
import type { InquirySource } from "@/lib/venue/seed";

const SOURCE_FILTERS: Array<"All" | InquirySource> = [
  "All",
  "Ananya Search",
  "Ananya AI Recommendation",
  "Planner Referral",
  "Direct",
];

const DATE_RANGE_OPTIONS = [
  "Last 30 days",
  "Last 90 days",
  "This year",
  "All time",
] as const;

export default function VenueLeadsPage() {
  const [sourceFilter, setSourceFilter] =
    useState<(typeof SOURCE_FILTERS)[number]>("All");
  const [dateRange, setDateRange] =
    useState<(typeof DATE_RANGE_OPTIONS)[number]>("This year");

  const filtered = useMemo(
    () =>
      sourceFilter === "All"
        ? LEADS
        : LEADS.filter((l) =>
            sourceFilter === "Ananya AI Recommendation"
              ? l.source === "Ananya AI Recommendation"
              : l.source === sourceFilter,
          ),
    [sourceFilter],
  );

  const counts = useMemo(() => {
    const c: Record<LeadStage, number> = {
      new: 0,
      tour: 0,
      proposal: 0,
      booked: 0,
      lost: 0,
    };
    for (const l of filtered) c[l.stage]++;
    return c;
  }, [filtered]);

  return (
    <div className="mx-auto max-w-[1600px] px-8 pt-8">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[10.5px] uppercase tracking-[0.28em] text-[#C4A265]">
            Inquiry pipeline
          </p>
          <h1
            className="mt-2 text-[48px] leading-[1.02] text-[#2C2C2C]"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 500,
              letterSpacing: "-0.01em",
            }}
          >
            Leads
          </h1>
          <p className="mt-3 text-[13.5px] text-[#5a5a5a]">
            <StatInline value={counts.new} label="new" tone="critical" />
            <Separator />
            <StatInline value={counts.tour} label="tours" />
            <Separator />
            <StatInline value={counts.proposal} label="proposals" />
            <Separator />
            <StatInline value={counts.booked} label="booked this year" tone="success" />
            <Separator />
            <StatInline value={counts.lost} label="lost" tone="muted" />
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <DateRangePicker value={dateRange} onChange={setDateRange} />
          <SourceFilter value={sourceFilter} onChange={setSourceFilter} />
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[12.5px] font-medium transition-colors"
            style={{
              backgroundColor: VENUE_PALETTE.charcoal,
              color: "#FAF8F5",
            }}
          >
            <span aria-hidden className="text-[14px] leading-none">+</span>
            Add Lead Manually
          </button>
        </div>
      </div>

      {/* Kanban */}
      <div
        className="mt-8 grid grid-cols-5 gap-4"
        style={{ minWidth: 0 }}
      >
        {LEAD_PIPELINE.map((col) => {
          const stageLeads = filtered.filter((l) => l.stage === col.stage);
          return (
            <KanbanColumn
              key={col.stage}
              stage={col.stage}
              title={col.title}
              eyebrow={col.eyebrow}
              leads={stageLeads}
            />
          );
        })}
      </div>
    </div>
  );
}

/* ───────────────────── Header bits ───────────────────── */

function Separator() {
  return (
    <span aria-hidden className="mx-2 text-[#cdbf9c]">
      ·
    </span>
  );
}

function StatInline({
  value,
  label,
  tone = "default",
}: {
  value: number;
  label: string;
  tone?: "default" | "critical" | "success" | "muted";
}) {
  const color =
    tone === "critical"
      ? VENUE_PALETTE.critical
      : tone === "success"
        ? VENUE_PALETTE.ontrack
        : tone === "muted"
          ? "#8a8a8a"
          : "#2C2C2C";
  return (
    <span className="inline-flex items-baseline gap-1.5">
      <span
        className="font-mono text-[14px]"
        style={{ color, fontWeight: 500 }}
      >
        {value}
      </span>
      <span className="text-[13px] text-[#5a5a5a]">{label}</span>
    </span>
  );
}

function DateRangePicker({
  value,
  onChange,
}: {
  value: (typeof DATE_RANGE_OPTIONS)[number];
  onChange: (v: (typeof DATE_RANGE_OPTIONS)[number]) => void;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) =>
          onChange(e.target.value as (typeof DATE_RANGE_OPTIONS)[number])
        }
        className="appearance-none rounded-full border bg-white py-2 pl-4 pr-8 text-[12.5px] text-[#2C2C2C] transition-colors hover:bg-[#F5E6D0]/40"
        style={{ borderColor: "rgba(196,162,101,0.45)" }}
      >
        {DATE_RANGE_OPTIONS.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
      <span
        aria-hidden
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-[#9E8245]"
      >
        ▾
      </span>
    </div>
  );
}

function SourceFilter({
  value,
  onChange,
}: {
  value: (typeof SOURCE_FILTERS)[number];
  onChange: (v: (typeof SOURCE_FILTERS)[number]) => void;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) =>
          onChange(e.target.value as (typeof SOURCE_FILTERS)[number])
        }
        className="appearance-none rounded-full border bg-white py-2 pl-4 pr-8 text-[12.5px] text-[#2C2C2C] transition-colors hover:bg-[#F5E6D0]/40"
        style={{ borderColor: "rgba(196,162,101,0.45)" }}
      >
        {SOURCE_FILTERS.map((s) => (
          <option key={s} value={s}>
            {s === "All" ? "All sources" : s}
          </option>
        ))}
      </select>
      <span
        aria-hidden
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-[#9E8245]"
      >
        ▾
      </span>
    </div>
  );
}

/* ───────────────────── Kanban column ───────────────────── */

const STAGE_ACCENT: Record<LeadStage, string> = {
  new: VENUE_PALETTE.critical,
  tour: VENUE_PALETTE.warning,
  proposal: VENUE_PALETTE.gold,
  booked: VENUE_PALETTE.ontrack,
  lost: "#8a8a8a",
};

function KanbanColumn({
  stage,
  title,
  eyebrow,
  leads,
}: {
  stage: LeadStage;
  title: string;
  eyebrow?: string;
  leads: Lead[];
}) {
  const accent = STAGE_ACCENT[stage];
  return (
    <section className="flex min-w-0 flex-col">
      {/* Column header */}
      <div
        className="rounded-t-2xl border border-b-0 px-4 py-3"
        style={{
          backgroundColor: "#FFFFFF",
          borderColor: VENUE_PALETTE.hairline,
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              aria-hidden
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: accent }}
            />
            <h2
              className="text-[17px] leading-none text-[#2C2C2C]"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 500,
              }}
            >
              {title}
            </h2>
            <span className="font-mono text-[11.5px] text-[#6a6a6a]">
              ({leads.length})
            </span>
          </div>
          {eyebrow && (
            <span className="font-mono text-[9.5px] uppercase tracking-[0.20em] text-[#9E8245]">
              {eyebrow}
            </span>
          )}
        </div>
      </div>

      {/* Cards */}
      <div
        className="flex flex-1 flex-col gap-3 rounded-b-2xl border border-t-0 p-3"
        style={{
          backgroundColor: "#FBF8F2",
          borderColor: VENUE_PALETTE.hairline,
          minHeight: 360,
        }}
      >
        {leads.length === 0 ? (
          <p
            className="mt-4 text-center text-[11.5px] italic text-[#8a8a8a]"
            style={{ fontFamily: "'EB Garamond', serif" }}
          >
            No leads
          </p>
        ) : (
          leads.map((lead) => <LeadCard key={lead.id} lead={lead} />)
        )}
      </div>
    </section>
  );
}

/* ───────────────────── Cards (per stage) ───────────────────── */

function LeadCard({ lead }: { lead: Lead }) {
  switch (lead.stage) {
    case "new":
      return <NewLeadCard lead={lead} />;
    case "tour":
      return <TourLeadCard lead={lead} />;
    case "proposal":
      return <ProposalLeadCard lead={lead} />;
    case "booked":
      return <BookedLeadCard lead={lead} />;
    case "lost":
      return <LostLeadCard lead={lead} />;
  }
}

function CardShell({
  href,
  accent,
  children,
}: {
  href: string;
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className="group block">
      <VenueCard className="relative overflow-hidden transition-shadow group-hover:shadow-md">
        <span
          aria-hidden
          className="absolute inset-y-0 left-0 w-[2px]"
          style={{ backgroundColor: accent, opacity: 0.85 }}
        />
        <div className="p-4 pl-[18px]">{children}</div>
      </VenueCard>
    </Link>
  );
}

function Names({ lead }: { lead: Lead }) {
  return (
    <h3
      className="text-[19px] leading-tight text-[#2C2C2C]"
      style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontWeight: 500,
      }}
    >
      {lead.coupleNames}
    </h3>
  );
}

function BasicsLine({ lead }: { lead: Lead }) {
  return (
    <p className="mt-0.5 text-[11.5px] text-[#5a5a5a]">
      <span className="text-[#2C2C2C]">{lead.estimatedDate}</span>
      <span className="mx-1.5 text-[#b5a68e]">·</span>
      <span className="font-mono text-[10.5px] text-[#2C2C2C]">
        {lead.guestCount}
      </span>{" "}
      guests
    </p>
  );
}

function CeremonyLine({ lead }: { lead: Lead }) {
  return (
    <p className="mt-1 text-[11.5px] text-[#5a5a5a]">
      {lead.ceremonyType} · {lead.duration}
    </p>
  );
}

/* ── Column 1: New Inquiries ── */

function NewLeadCard({ lead }: { lead: Lead }) {
  const top3 = lead.browsed?.slice(0, 3) ?? [];
  return (
    <CardShell href={`/venue/leads/${lead.id}`} accent={STAGE_ACCENT.new}>
      {/* Timestamp */}
      <div className="flex items-center gap-1.5">
        {lead.urgent && (
          <span
            aria-hidden
            className="inline-block h-[7px] w-[7px] rounded-full"
            style={{ backgroundColor: VENUE_PALETTE.critical }}
          />
        )}
        <span
          className="font-mono text-[10px] uppercase tracking-[0.20em]"
          style={{
            color: lead.urgent ? VENUE_PALETTE.critical : "#8a8a8a",
            fontWeight: lead.urgent ? 600 : 500,
          }}
        >
          {lead.receivedLabel ?? "New"}
        </span>
      </div>

      <div className="mt-2">
        <Names lead={lead} />
        <BasicsLine lead={lead} />
        <CeremonyLine lead={lead} />
      </div>

      {lead.budget && (
        <p className="mt-1.5 text-[11.5px]">
          <span className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-[#9E8245]">
            Budget
          </span>{" "}
          <span className="font-mono text-[11.5px] text-[#2C2C2C]">
            {lead.budget}
          </span>
        </p>
      )}

      <div className="mt-2.5 space-y-0.5 text-[11px] text-[#5a5a5a]">
        <p>
          <span className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-[#9E8245]">
            Source
          </span>{" "}
          <span className="text-[#2C2C2C]">
            {lead.source}
            {lead.sourceDetail ? ` (${lead.sourceDetail})` : ""}
          </span>
        </p>
        <p>
          <span className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-[#9E8245]">
            Planner
          </span>{" "}
          <span className="text-[#2C2C2C]">
            {lead.plannerName ?? "None"}
          </span>
        </p>
      </div>

      {/* Browsed */}
      {top3.length > 0 && (
        <div
          className="mt-3 rounded-lg px-3 py-2"
          style={{ backgroundColor: "#FBF1DF" }}
        >
          <p className="font-mono text-[9.5px] uppercase tracking-[0.20em] text-[#9E8245]">
            Browsed
          </p>
          <ul className="mt-1 space-y-1 text-[11px] text-[#5a4a30]">
            {top3.map((b) => (
              <li key={b.id} className="flex items-baseline justify-between gap-2">
                <span className="truncate">
                  <span className="text-[#2C2C2C]">{b.coupleNames}</span>
                  <span className="text-[#8a7a5a]">
                    {" "}
                    ({b.ceremonyType} {b.guestCount})
                  </span>
                </span>
                <span className="shrink-0 font-mono text-[10px] text-[#9E8245]">
                  {b.timeSpentLabel}
                </span>
              </li>
            ))}
            {(lead.browsed?.length ?? 0) > top3.length && (
              <li className="pt-0.5 text-[10.5px] italic text-[#8a7a5a]">
                +{(lead.browsed?.length ?? 0) - top3.length} more
              </li>
            )}
          </ul>
        </div>
      )}

      {/* Actions */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        <ActionChip label="Respond" primary />
        <ActionChip label="Schedule Tour" />
        <ActionChip label="Decline" />
      </div>
    </CardShell>
  );
}

/* ── Column 2: Tour Scheduled ── */

function TourLeadCard({ lead }: { lead: Lead }) {
  return (
    <CardShell href={`/venue/leads/${lead.id}`} accent={STAGE_ACCENT.tour}>
      <Names lead={lead} />
      <BasicsLine lead={lead} />
      <CeremonyLine lead={lead} />

      {lead.tourDate && (
        <div
          className="mt-2.5 rounded-lg px-3 py-2"
          style={{ backgroundColor: "#FDEFD9" }}
        >
          <p className="font-mono text-[9.5px] uppercase tracking-[0.20em] text-[#9E8245]">
            Tour
          </p>
          <p className="mt-0.5 text-[12.5px] text-[#2C2C2C]">
            {lead.tourDate}
          </p>
          {typeof lead.tourDaysAway === "number" && (
            <p className="mt-0.5 font-mono text-[10px] text-[#9E8245]">
              in {lead.tourDaysAway} days
            </p>
          )}
        </div>
      )}

      {lead.tourNotes && (
        <p
          className="mt-2 text-[11.5px] italic text-[#5a5a5a]"
          style={{ fontFamily: "'EB Garamond', serif" }}
        >
          “{lead.tourNotes}”
        </p>
      )}

      {lead.plannerName && (
        <p className="mt-2 text-[11px] text-[#5a5a5a]">
          <span className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-[#9E8245]">
            Planner
          </span>{" "}
          <span className="text-[#2C2C2C]">{lead.plannerName}</span>
        </p>
      )}

      {lead.spacesToShow && lead.spacesToShow.length > 0 && (
        <div className="mt-2.5">
          <p className="font-mono text-[9.5px] uppercase tracking-[0.20em] text-[#9E8245]">
            Spaces to show
          </p>
          <ul className="mt-1 space-y-0.5 text-[11.5px] text-[#2C2C2C]">
            {lead.spacesToShow.map((s) => (
              <li key={s.name} className="flex items-center gap-1.5">
                <span
                  aria-hidden
                  className="grid h-[13px] w-[13px] place-items-center rounded-[3px] text-[9px] font-semibold"
                  style={{
                    backgroundColor: s.checked
                      ? VENUE_PALETTE.gold
                      : "transparent",
                    color: "#FFFFFF",
                    boxShadow: `inset 0 0 0 1px ${s.checked ? VENUE_PALETTE.gold : "rgba(44,44,44,0.25)"}`,
                  }}
                >
                  {s.checked ? "✓" : ""}
                </span>
                {s.name}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-3 flex flex-wrap gap-1.5">
        <ActionChip label="View" primary />
        <ActionChip label="Reschedule" />
        <ActionChip label="Move →" />
      </div>
    </CardShell>
  );
}

/* ── Column 3: Proposal Sent ── */

function ProposalLeadCard({ lead }: { lead: Lead }) {
  const warn = (lead.proposalFollowUpDays ?? 0) >= 3;
  return (
    <CardShell href={`/venue/leads/${lead.id}`} accent={STAGE_ACCENT.proposal}>
      <Names lead={lead} />
      <BasicsLine lead={lead} />
      <CeremonyLine lead={lead} />

      <div className="mt-2.5 space-y-1 text-[11.5px] text-[#5a5a5a]">
        {lead.proposalDate && (
          <p>
            <span className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-[#9E8245]">
              Sent
            </span>{" "}
            <span className="text-[#2C2C2C]">{lead.proposalDate}</span>
          </p>
        )}
        {lead.proposalAmount && (
          <p>
            <span className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-[#9E8245]">
              Amount
            </span>{" "}
            <span className="font-mono text-[12px] text-[#2C2C2C]">
              {lead.proposalAmount}
            </span>
          </p>
        )}
        {lead.proposalPackage && (
          <p>
            <span className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-[#9E8245]">
              Package
            </span>{" "}
            <span className="text-[#2C2C2C]">{lead.proposalPackage}</span>
          </p>
        )}
      </div>

      {warn && (
        <div
          className="mt-2.5 flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px]"
          style={{
            backgroundColor: "rgba(192, 57, 43, 0.08)",
            color: VENUE_PALETTE.critical,
          }}
        >
          <span aria-hidden>⚠</span>
          No response — {lead.proposalFollowUpDays}d
        </div>
      )}

      <div className="mt-3 flex flex-wrap gap-1.5">
        <ActionChip label="View Proposal" primary />
        <ActionChip label="Follow Up" />
        <ActionChip label="Move →" />
      </div>
    </CardShell>
  );
}

/* ── Column 4: Booked ── */

function BookedLeadCard({ lead }: { lead: Lead }) {
  return (
    <CardShell href={`/venue/leads/${lead.id}`} accent={STAGE_ACCENT.booked}>
      <Names lead={lead} />
      <p className="mt-0.5 text-[11.5px] text-[#5a5a5a]">
        <span className="text-[#2C2C2C]">{lead.bookedDates}</span>
      </p>
      <p className="mt-1 text-[11.5px] text-[#5a5a5a]">
        <span className="font-mono text-[10.5px] text-[#2C2C2C]">
          {lead.guestCount}
        </span>{" "}
        guests · {lead.ceremonyType}
      </p>

      <div className="mt-2.5 space-y-1 text-[11.5px] text-[#5a5a5a]">
        <p className="flex items-center gap-1.5">
          <span className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-[#9E8245]">
            Contract
          </span>
          <StatusDot ok={!!lead.contractSigned} />
          <span className="text-[#2C2C2C]">
            {lead.contractSigned ? "Signed" : "Pending"}
          </span>
        </p>
        <p className="flex items-center gap-1.5">
          <span className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-[#9E8245]">
            Deposit
          </span>
          <StatusDot ok={!!lead.depositPaid} />
          <span className="text-[#2C2C2C]">
            {lead.depositPaid ? "Paid" : "Pending"}
          </span>
        </p>
        {lead.bookedAmount && (
          <p>
            <span className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-[#9E8245]">
              Amount
            </span>{" "}
            <span className="font-mono text-[12px] text-[#2C2C2C]">
              {lead.bookedAmount}
            </span>
          </p>
        )}
      </div>

      {lead.plannerName && (
        <p className="mt-2 text-[11px] text-[#5a5a5a]">
          Planner: <span className="text-[#2C2C2C]">{lead.plannerName}</span>
        </p>
      )}
      {typeof lead.vendorsBooked === "number" &&
        typeof lead.vendorsTotal === "number" && (
          <p className="mt-0.5 font-mono text-[10.5px] text-[#6a6a6a]">
            {lead.vendorsBooked}/{lead.vendorsTotal} vendors booked
          </p>
        )}

      <div className="mt-3 flex flex-wrap gap-1.5">
        {lead.weddingId ? (
          <Link
            href={`/venue/weddings/${lead.weddingId}`}
            className="inline-flex items-center rounded-full px-3 py-1 text-[11px] font-medium transition-colors"
            style={{
              backgroundColor: VENUE_PALETTE.charcoal,
              color: "#FAF8F5",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            View Wedding →
          </Link>
        ) : (
          <ActionChip label="View Wedding" primary />
        )}
      </div>
    </CardShell>
  );
}

/* ── Column 5: Lost ── */

function LostLeadCard({ lead }: { lead: Lead }) {
  return (
    <CardShell href={`/venue/leads/${lead.id}`} accent={STAGE_ACCENT.lost}>
      <Names lead={lead} />
      <BasicsLine lead={lead} />
      <CeremonyLine lead={lead} />

      {lead.lostReason && (
        <div className="mt-2.5">
          <p className="font-mono text-[9.5px] uppercase tracking-[0.20em] text-[#9E8245]">
            Lost reason
          </p>
          <p
            className="mt-0.5 text-[11.5px] italic text-[#5a5a5a]"
            style={{ fontFamily: "'EB Garamond', serif" }}
          >
            “{lead.lostReason}”
          </p>
        </div>
      )}

      <div className="mt-3 flex flex-wrap gap-1.5">
        <ActionChip label="View" primary />
        <ActionChip label="Archive" />
      </div>
    </CardShell>
  );
}

/* ───────────────────── Small bits ───────────────────── */

function StatusDot({ ok }: { ok: boolean }) {
  return (
    <span
      aria-hidden
      className="inline-block h-[7px] w-[7px] rounded-full"
      style={{
        backgroundColor: ok ? VENUE_PALETTE.ontrack : VENUE_PALETTE.warning,
      }}
    />
  );
}

function ActionChip({ label, primary }: { label: string; primary?: boolean }) {
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-[3px] text-[10.5px] font-medium transition-colors"
      style={
        primary
          ? {
              backgroundColor: VENUE_PALETTE.charcoal,
              color: "#FAF8F5",
            }
          : {
              backgroundColor: "#FFFFFF",
              color: "#2C2C2C",
              boxShadow: "inset 0 0 0 1px rgba(196,162,101,0.35)",
            }
      }
    >
      {label}
    </span>
  );
}
