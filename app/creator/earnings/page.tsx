"use client";

import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import { PortalPageHeader, PortalStatCard } from "@/components/creator-portal/PortalPageHeader";
import { useCurrentCreator, formatUsd } from "@/lib/creators/current-creator";
import { useCreatorsStore } from "@/stores/creators-store";
import { useMatchingStore } from "@/stores/matching-store";
import { usePartnershipsStore } from "@/stores/partnerships-store";
import { useCreatorPortalStore } from "@/stores/creator-portal-store";

type Range = "month" | "3mo" | "6mo" | "year" | "all";

interface LedgerEntry {
  id: string;
  date: string;
  source: "Referral" | "Consultation" | "Partnership";
  description: string;
  gross: number;
  fee: number;
  net: number;
  payoutStatus: "Available" | "Pending" | "Paid";
}

export default function EarningsPage() {
  const creator = useCurrentCreator();
  const referralEarnings = useCreatorsStore((s) =>
    creator ? s.earningsForCreator(creator.id) : null,
  );
  const referrals = useCreatorsStore((s) =>
    creator ? s.referralsForCreator(creator.id) : [],
  );
  const bookings = useMatchingStore((s) =>
    creator ? s.listBookingsForCreator(creator.id) : [],
  );
  const services = useMatchingStore((s) => s.services);
  const consultStats = useMatchingStore((s) =>
    creator
      ? s.creatorConsultationStats(creator.id)
      : { totalConsultations: 0, averageRating: 0, totalEarnings: 0, pendingPayout: 0 },
  );
  const allPayouts = usePartnershipsStore((s) => s.payouts);
  const payouts = useMemo(
    () => creator ? allPayouts.filter((p) => p.creatorId === creator.id) : [],
    [allPayouts, creator],
  );
  const partnerships = usePartnershipsStore((s) =>
    creator ? s.listProposals("creator", creator.id) : [],
  );
  const payoutRequests = useCreatorPortalStore((s) =>
    creator ? s.listPayouts(creator.id) : [],
  );
  const requestPayout = useCreatorPortalStore((s) => s.requestPayout);
  const updateSettings = useCreatorPortalStore((s) => s.updateSettings);
  const settings = useCreatorPortalStore((s) =>
    creator ? s.getSettings(creator.id) : null,
  );

  const [range, setRange] = useState<Range>("all");
  const [filter, setFilter] = useState<"all" | LedgerEntry["source"]>("all");

  const ledger = useMemo<LedgerEntry[]>(() => {
    const entries: LedgerEntry[] = [];

    for (const r of referrals) {
      if (r.convertedAt && r.commissionAmount > 0) {
        entries.push({
          id: r.id,
          date: r.convertedAt,
          source: "Referral",
          description: `Commission · ${r.referralType.replace("_", " ")}`,
          gross: r.commissionAmount,
          fee: 0,
          net: r.commissionAmount,
          payoutStatus: "Pending",
        });
      }
    }

    for (const b of bookings) {
      if (b.status === "completed") {
        const service = services.find((s) => s.id === b.serviceId);
        entries.push({
          id: b.id,
          date: b.updatedAt,
          source: "Consultation",
          description: service?.title ?? "Consultation",
          gross: b.pricePaid,
          fee: b.platformFee,
          net: b.creatorPayout,
          payoutStatus: "Paid",
        });
      }
    }

    for (const po of payouts) {
      const partnership = partnerships.find((p) => p.id === po.partnershipId);
      entries.push({
        id: po.id,
        date: po.paidAt ?? new Date().toISOString(),
        source: "Partnership",
        description: partnership?.title ?? "Partnership",
        gross: po.grossAmount,
        fee: po.platformFee,
        net: po.netAmount,
        payoutStatus: po.status === "paid" ? "Paid" : "Pending",
      });
    }

    return entries.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
  }, [referrals, bookings, services, payouts, partnerships]);

  const filteredLedger = useMemo(() => {
    const now = Date.now();
    const rangeCutoff =
      range === "month"
        ? now - 30 * 86400000
        : range === "3mo"
          ? now - 90 * 86400000
          : range === "6mo"
            ? now - 180 * 86400000
            : range === "year"
              ? now - 365 * 86400000
              : 0;
    return ledger.filter((e) => {
      if (filter !== "all" && e.source !== filter) return false;
      if (rangeCutoff && new Date(e.date).getTime() < rangeCutoff) return false;
      return true;
    });
  }, [ledger, filter, range]);

  const breakdown = useMemo(() => {
    const r = filteredLedger
      .filter((e) => e.source === "Referral")
      .reduce((acc, e) => acc + e.net, 0);
    const c = filteredLedger
      .filter((e) => e.source === "Consultation")
      .reduce((acc, e) => acc + e.net, 0);
    const p = filteredLedger
      .filter((e) => e.source === "Partnership")
      .reduce((acc, e) => acc + e.net, 0);
    return { referral: r, consultation: c, partnership: p, total: r + c + p };
  }, [filteredLedger]);

  if (!creator || !referralEarnings || !settings) return null;

  const available = Math.max(
    0,
    referralEarnings.pendingPayout +
      payouts
        .filter((p) => p.status === "paid")
        .reduce((acc, p) => acc + p.netAmount, 0) -
      payoutRequests
        .filter((p) => p.status === "processing")
        .reduce((acc, p) => acc + p.amount, 0),
  );

  const allTime =
    referralEarnings.totalEarnings +
    consultStats.totalEarnings +
    payouts.filter((p) => p.status === "paid").reduce((a, p) => a + p.netAmount, 0);

  const handleRequestPayout = () => {
    if (available <= 0) return;
    if (!confirm(`Request payout of ${formatUsd(available)}?`)) return;
    requestPayout(creator.id, available);
  };

  const exportCsv = () => {
    const header = "date,source,description,gross,fee,net,status\n";
    const rows = filteredLedger
      .map((e) =>
        [e.date, e.source, `"${e.description}"`, e.gross, e.fee, e.net, e.payoutStatus].join(","),
      )
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `earnings-${creator.id}-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-8">
      <PortalPageHeader
        eyebrow="Business"
        title="Earnings & payouts"
        description="Every dollar earned across referrals, consultations, and partnerships."
        actions={
          <button
            onClick={exportCsv}
            className="inline-flex items-center gap-1.5 rounded-md border border-gold/30 bg-white px-3 py-1.5 text-[12px] text-ink hover:bg-gold-pale/30"
          >
            <Download size={12} /> Export CSV
          </button>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <PortalStatCard label="Total earnings" value={formatUsd(allTime)} tone="gold" />
        <PortalStatCard
          label="This month"
          value={formatUsd(
            ledger
              .filter(
                (e) => Date.now() - new Date(e.date).getTime() < 30 * 86400000,
              )
              .reduce((acc, e) => acc + e.net, 0),
          )}
          tone="saffron"
        />
        <PortalStatCard
          label="Pending payout"
          value={formatUsd(referralEarnings.pendingPayout + consultStats.pendingPayout)}
          tone="teal"
        />
        <PortalStatCard
          label="Available to withdraw"
          value={formatUsd(available)}
          tone="sage"
        />
      </div>

      {/* Breakdown */}
      <div className="mt-6 rounded-xl border border-border bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-serif text-[17px] text-ink">Breakdown by source</h2>
          <div className="flex flex-wrap gap-1">
            {(["month", "3mo", "6mo", "year", "all"] as Range[]).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`rounded-full border px-3 py-1 text-[11px] ${
                  range === r
                    ? "border-gold/40 bg-gold-pale/40 text-ink"
                    : "border-border bg-white text-ink-muted hover:border-gold/30"
                }`}
              >
                {rangeLabel(r)}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-3">
          <SourceBar
            label="Referral commissions"
            value={breakdown.referral}
            total={breakdown.total}
            tone="gold"
          />
          <SourceBar
            label="Consultation fees"
            value={breakdown.consultation}
            total={breakdown.total}
            tone="teal"
          />
          <SourceBar
            label="Partnership payments"
            value={breakdown.partnership}
            total={breakdown.total}
            tone="saffron"
          />
        </div>
      </div>

      {/* Ledger */}
      <div className="mt-6">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-serif text-[17px] text-ink">Ledger</h2>
          <div className="flex flex-wrap gap-1">
            {(["all", "Referral", "Consultation", "Partnership"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-full border px-3 py-1 text-[11px] ${
                  filter === f
                    ? "border-gold/40 bg-gold-pale/40 text-ink"
                    : "border-border bg-white text-ink-muted hover:border-gold/30"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {filteredLedger.length === 0 ? (
          <p className="rounded-lg border border-dashed border-gold/20 py-10 text-center text-[12.5px] italic text-ink-muted">
            No entries for this filter.
          </p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border bg-white">
            <table className="w-full text-left text-[12.5px]">
              <thead className="border-b border-border bg-ivory-warm">
                <tr>
                  {["Date", "Source", "Description", "Gross", "Fee", "Net", "Status"].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-3 py-2 font-mono text-[9.5px] uppercase tracking-wider text-ink-faint"
                        style={{ fontFamily: "var(--font-mono)" }}
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {filteredLedger.map((e) => (
                  <tr key={e.id} className="border-b border-border last:border-b-0">
                    <td className="px-3 py-2 text-ink-muted">
                      {new Date(e.date).toLocaleDateString()}
                    </td>
                    <td className="px-3 py-2">{e.source}</td>
                    <td className="px-3 py-2 text-ink">{e.description}</td>
                    <td className="px-3 py-2 text-ink">{formatUsd(e.gross)}</td>
                    <td className="px-3 py-2 text-ink-muted">-{formatUsd(e.fee)}</td>
                    <td className="px-3 py-2 font-serif text-[14px] text-ink">
                      {formatUsd(e.net)}
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={`rounded-full px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-wider ${
                          e.payoutStatus === "Paid"
                            ? "bg-sage/20 text-sage"
                            : "bg-gold-pale/60 text-gold"
                        }`}
                        style={{ fontFamily: "var(--font-mono)" }}
                      >
                        {e.payoutStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payouts */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-white p-5">
          <h2 className="font-serif text-[17px] text-ink">Payout method</h2>
          <p className="mt-1 text-[12px] text-ink-muted">
            Where we send your earnings.
          </p>
          <div className="mt-4 flex flex-col gap-3">
            <Field label="Bank name">
              <input
                type="text"
                value={settings.payoutMethod.bankName}
                onChange={(e) =>
                  updateSettings(creator.id, {
                    payoutMethod: { ...settings.payoutMethod, bankName: e.target.value },
                  })
                }
                className="w-full rounded-md border border-border bg-white px-3 py-2 text-[13px]"
              />
            </Field>
            <Field label="Account number">
              <input
                type="text"
                value={settings.payoutMethod.accountNumber}
                onChange={(e) =>
                  updateSettings(creator.id, {
                    payoutMethod: {
                      ...settings.payoutMethod,
                      accountNumber: e.target.value,
                    },
                  })
                }
                className="w-full rounded-md border border-border bg-white px-3 py-2 text-[13px]"
              />
            </Field>
            <Field label="Routing number">
              <input
                type="text"
                value={settings.payoutMethod.routingNumber}
                onChange={(e) =>
                  updateSettings(creator.id, {
                    payoutMethod: {
                      ...settings.payoutMethod,
                      routingNumber: e.target.value,
                    },
                  })
                }
                className="w-full rounded-md border border-border bg-white px-3 py-2 text-[13px]"
              />
            </Field>
          </div>
          <button
            onClick={handleRequestPayout}
            disabled={available <= 0}
            className="mt-4 w-full rounded-md bg-ink py-2 text-[13px] text-ivory hover:bg-gold disabled:opacity-40"
          >
            Request payout of {formatUsd(available)}
          </button>
        </div>

        <div className="rounded-xl border border-border bg-white p-5">
          <h2 className="font-serif text-[17px] text-ink">Payout history</h2>
          {payoutRequests.length === 0 ? (
            <p className="mt-4 text-[12.5px] italic text-ink-muted">
              No payouts yet.
            </p>
          ) : (
            <ul className="mt-3 flex flex-col gap-2">
              {payoutRequests.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between rounded-lg border border-border px-3 py-2"
                >
                  <div>
                    <p className="text-[13px] text-ink">{formatUsd(p.amount)}</p>
                    <p
                      className="font-mono text-[9.5px] uppercase tracking-wider text-ink-faint"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {new Date(p.requestedAt).toLocaleDateString()} · {p.referenceId}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-wider ${
                      p.status === "paid"
                        ? "bg-sage/20 text-sage"
                        : "bg-saffron/20 text-saffron"
                    }`}
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {p.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function SourceBar({
  label,
  value,
  total,
  tone,
}: {
  label: string;
  value: number;
  total: number;
  tone: "gold" | "teal" | "saffron";
}) {
  const pct = total === 0 ? 0 : (value / total) * 100;
  const TONE = { gold: "bg-gold", teal: "bg-teal", saffron: "bg-saffron" }[tone];
  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <span className="text-[12.5px] text-ink">{label}</span>
        <span className="font-serif text-[14px] text-ink">{formatUsd(value)}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-ivory-warm">
        <div className={`h-full ${TONE}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span
        className="font-mono text-[9.5px] uppercase tracking-[0.2em] text-ink-faint"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {label}
      </span>
      {children}
    </label>
  );
}

function rangeLabel(r: Range): string {
  switch (r) {
    case "month":
      return "30 days";
    case "3mo":
      return "3 mo";
    case "6mo":
      return "6 mo";
    case "year":
      return "Year";
    case "all":
      return "All time";
  }
}
