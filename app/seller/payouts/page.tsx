"use client";

import { useEffect, useState } from "react";
import { Card, SectionHeading } from "@/components/seller/ui";
import { supabaseBrowser } from "@/lib/supabase/browser-client";
import type { PayoutRow, PayoutStatus } from "@/lib/seller/seed";

const GOLD = "#C4A265";
const GOLD_DEEP = "#7a5a16";
const GOLD_SOFT = "#F5E6D0";
const BORDER = "rgba(196,162,101,0.25)";
const HAIRLINE = "rgba(44,44,44,0.08)";

// â”€â”€ Types for API response â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

type EarningsBreakdown = {
  gross: number;
  shipping: number;
  marketplaceFeePct: number;
  marketplaceFee: number;
  processingFee: number;
  processingFeeDetail: string;
  shippingLabels: number;
  pendingHold: number;
};

type PayoutSettings = {
  method: string;
  methodDetail: string;
  schedule: string;
  scheduleOptions: string[];
  minimumThreshold: number;
  w9OnFile: boolean;
  form1099KThreshold: number;
  form1099KWillReceive: boolean;
};

type TaxData = {
  grossSalesYTD: number;
  totalFeesYTD: number;
  netIncomeYTD: number;
};

type PayoutsData = {
  availableNow: number;
  thisMonth: number;
  yearToDate: number;
  pendingClearance: number;
  monthLabel: string;
  monthEarningsBreakdown: EarningsBreakdown;
  history: PayoutRow[];
  settings: PayoutSettings;
  tax: TaxData;
};

type ShopData = {
  shopName: string;
  monthLabel: string;
};

// â”€â”€ Defaults â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const DEFAULT_BREAKDOWN: EarningsBreakdown = {
  gross: 0,
  shipping: 0,
  marketplaceFeePct: 12,
  marketplaceFee: 0,
  processingFee: 0,
  processingFeeDetail: "2.9% + $0.30 per txn",
  shippingLabels: 0,
  pendingHold: 0,
};

const DEFAULT_SETTINGS: PayoutSettings = {
  method: "â€”",
  methodDetail: "â€”",
  schedule: "â€”",
  scheduleOptions: [],
  minimumThreshold: 25,
  w9OnFile: false,
  form1099KThreshold: 600,
  form1099KWillReceive: false,
};

const DEFAULT_PAYOUTS: PayoutsData = {
  availableNow: 0,
  thisMonth: 0,
  yearToDate: 0,
  pendingClearance: 0,
  monthLabel: "",
  monthEarningsBreakdown: DEFAULT_BREAKDOWN,
  history: [],
  settings: DEFAULT_SETTINGS,
  tax: { grossSalesYTD: 0, totalFeesYTD: 0, netIncomeYTD: 0 },
};

// â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function money(n: number, opts: { decimals?: boolean } = {}): string {
  const decimals = opts.decimals ?? true;
  return `$${n.toLocaleString("en-US", {
    minimumFractionDigits: decimals ? 2 : 0,
    maximumFractionDigits: decimals ? 2 : 0,
  })}`;
}

function moneyWhole(n: number): string {
  return `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

// â”€â”€ Page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export default function SellerPayoutsPage() {
  const [token, setToken] = useState<string | null>(null);
  const [payouts, setPayouts] = useState<PayoutsData>(DEFAULT_PAYOUTS);
  const [shop, setShop] = useState<ShopData>({ shopName: "Your Shop", monthLabel: "" });
  const [loading, setLoading] = useState(true);

  // Get session token
  useEffect(() => {
    supabaseBrowser.auth.getSession().then(({ data }: { data: { session: { access_token: string } | null } | null }) => {
      setToken(data?.session?.access_token ?? null);
    });
  }, []);

  // Fetch payouts data
  useEffect(() => {
    if (!token) return;
    const headers = { Authorization: `Bearer ${token}` };

    Promise.all([
      fetch("/api/seller/payouts", { headers }).then((r) => r.json()),
      fetch("/api/seller/shop", { headers }).then((r) => r.json()),
    ])
      .then(([payoutsData, shopData]) => {
        if (payoutsData.payouts) setPayouts(payoutsData.payouts);
        else if (payoutsData.availableNow !== undefined) setPayouts(payoutsData);
        // summary alias from the API spec
        if (payoutsData.summary) setPayouts(payoutsData.summary);
        if (shopData.shop) setShop(shopData.shop);
      })
      .catch(() => {/* use defaults */})
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="pb-16 animate-pulse">
        <section className="border-b px-8 py-8" style={{ borderColor: HAIRLINE }}>
          <div className="h-10 w-36 rounded-lg bg-stone-200" />
          <div className="mt-3 h-4 w-64 rounded bg-stone-100" />
        </section>
        <div className="space-y-10 px-8 py-8">
          <div className="h-48 rounded-xl bg-stone-100" />
          <div className="h-64 rounded-xl bg-stone-100" />
          <div className="h-64 rounded-xl bg-stone-100" />
        </div>
      </div>
    );
  }

  return (
    <div className="pb-16">
      <PageHeader shop={shop} />

      <div className="space-y-10 px-8 py-8">
        <EarningsSummary payouts={payouts} />
        <FeeBreakdown payouts={payouts} />
        <PayoutHistory payouts={payouts} />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <PayoutSettings payouts={payouts} />
          <TaxSummary payouts={payouts} />
        </div>
      </div>
    </div>
  );
}

// â”€â”€ Header â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function PageHeader({ shop }: { shop: ShopData }) {
  return (
    <section className="border-b px-8 py-8" style={{ borderColor: HAIRLINE }}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h1
            className="text-[36px] leading-tight text-[#2C2C2C]"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 500,
              letterSpacing: "-0.015em",
            }}
          >
            Payouts
          </h1>
          <p className="mt-1.5 text-[14px] text-stone-600">
            Earnings, fees, and payment history for {shop.shopName}.
          </p>
        </div>
        {shop.monthLabel && (
          <p className="font-mono text-[11px] uppercase tracking-[0.26em] text-[#7a5a16]">
            {shop.monthLabel}
          </p>
        )}
      </div>
    </section>
  );
}

// â”€â”€ Earnings Summary â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function EarningsSummary({ payouts: P }: { payouts: PayoutsData }) {
  return (
    <section>
      <SectionHeading title="Earnings" />
      <Card tone="ivory">
        <div className="grid grid-cols-1 divide-x divide-y divide-[rgba(44,44,44,0.06)] sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4">
          <EarningsCell
            label="Available now"
            value={moneyWhole(P.availableNow)}
            sub="Ready for next payout"
            emphasis
          />
          <EarningsCell
            label="This month"
            value={moneyWhole(P.thisMonth)}
            sub={P.monthLabel ? `${P.monthLabel} earnings` : "Current month earnings"}
          />
          <EarningsCell
            label="Year to date"
            value={moneyWhole(P.yearToDate)}
            sub="Gross sales this year"
          />
          <EarningsCell
            label="Pending clearance"
            value={moneyWhole(P.pendingClearance)}
            sub="7-day fraud-protection hold"
          />
        </div>
        <div
          className="flex flex-col items-start justify-between gap-4 border-t px-6 py-5 md:flex-row md:items-center"
          style={{ borderColor: HAIRLINE, backgroundColor: "rgba(245,230,208,0.35)" }}
        >
          <div>
            <p
              className="text-[16px] text-[#2C2C2C]"
              style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}
            >
              {moneyWhole(P.availableNow)} is ready to transfer
            </p>
            <p className="mt-0.5 text-[12.5px] text-stone-600">
              Funds clear to {P.settings.methodDetail} in 1â€“2 business days.
            </p>
          </div>
          <button
            type="button"
            className="inline-flex h-10 items-center gap-2 rounded-md px-5 text-[13.5px] font-medium text-white transition-colors hover:opacity-90"
            style={{ backgroundColor: GOLD }}
          >
            Request payout <span aria-hidden>â†’</span>
          </button>
        </div>
      </Card>
    </section>
  );
}

function EarningsCell({
  label,
  value,
  sub,
  emphasis = false,
}: {
  label: string;
  value: string;
  sub: string;
  emphasis?: boolean;
}) {
  return (
    <div
      className="px-6 py-5"
      style={{
        backgroundColor: emphasis ? "rgba(245,230,208,0.45)" : "transparent",
      }}
    >
      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-stone-500">
        {label}
      </p>
      <p
        className="mt-2 text-[30px] leading-none text-[#2C2C2C]"
        style={{
          fontFamily:
            "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace",
          fontWeight: 500,
          letterSpacing: "-0.02em",
        }}
      >
        {value}
      </p>
      <p className="mt-2 text-[11.5px] text-stone-500">{sub}</p>
    </div>
  );
}

// â”€â”€ Fee Breakdown â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function FeeBreakdown({ payouts }: { payouts: PayoutsData }) {
  const B = payouts.monthEarningsBreakdown;
  const subtotal = B.gross + B.shipping;
  const net = subtotal + B.marketplaceFee + B.processingFee + B.shippingLabels;
  const available = net + B.pendingHold;

  return (
    <section>
      <SectionHeading
        title={`${payouts.monthLabel || "Current month"} earnings breakdown`}
        action={
          <span className="font-mono text-[10.5px] uppercase tracking-wider text-stone-500">
            Transparent Â· line by line
          </span>
        }
      />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card tone="ivory">
          <div className="p-6">
            <FeeLine label="Gross sales" amount={B.gross} />
            <FeeLine label="Shipping collected" amount={B.shipping} sign="+" />
            <FeeLineDivider />
            <FeeLine label="Subtotal" amount={subtotal} bold />
            <div className="h-3" />
            <FeeLine
              label={`Ananya marketplace fee (${B.marketplaceFeePct}%)`}
              amount={B.marketplaceFee}
            />
            <FeeLine
              label="Payment processing"
              hint={B.processingFeeDetail}
              amount={B.processingFee}
            />
            <FeeLine
              label="Shipping labels purchased"
              amount={B.shippingLabels}
            />
            <FeeLineDivider />
            <FeeLine label="Net earnings" amount={net} bold />
            <div className="h-3" />
            <FeeLine
              label="Pending clearance"
              hint="7-day hold"
              amount={B.pendingHold}
              muted
            />
            <FeeLineDivider strong />
            <FeeLine
              label="Available for payout"
              amount={available}
              highlight
            />
          </div>
        </Card>

        <div className="flex flex-col gap-3">
          <FeeExplainer
            glyph="%"
            title={`Ananya marketplace fee (${B.marketplaceFeePct}%)`}
            detail="Charged on product price only â€” shipping is not subject to the marketplace fee. This is Ananya's revenue."
          />
          <FeeExplainer
            glyph="âŒ›"
            title="Payment processing"
            detail="Stripe standard â€” 2.9% of the transaction plus $0.30 per charge."
          />
          <FeeExplainer
            glyph="ðŸ“®"
            title="Shipping labels (optional)"
            detail="Discounted USPS / FedEx / UPS labels bought through Ananya. Skip this line if you print your own."
          />
          <FeeExplainer
            glyph="ðŸ›¡"
            title="7-day hold"
            detail="Newly completed orders hold for 7 days before clearing, as fraud protection."
          />
        </div>
      </div>
    </section>
  );
}

function FeeLine({
  label,
  hint,
  amount,
  sign,
  bold = false,
  muted = false,
  highlight = false,
}: {
  label: string;
  hint?: string;
  amount: number;
  sign?: "+" | "-";
  bold?: boolean;
  muted?: boolean;
  highlight?: boolean;
}) {
  const isNegative = amount < 0;
  const display = Math.abs(amount);
  const prefix = sign ?? (isNegative ? "âˆ’" : "");
  const amountColor = highlight
    ? "#2C6E6A"
    : muted
    ? "#78716C"
    : isNegative
    ? "#B23A2A"
    : "#2C2C2C";
  return (
    <div
      className={`flex items-baseline justify-between gap-4 py-1.5 ${
        highlight ? "rounded-md px-3 -mx-3" : ""
      }`}
      style={{
        backgroundColor: highlight ? "rgba(217,232,228,0.45)" : "transparent",
      }}
    >
      <div className="min-w-0">
        <p
          className={`text-[13.5px] text-[#2C2C2C] ${bold ? "font-medium" : ""}`}
        >
          {label}
        </p>
        {hint && (
          <p className="mt-0.5 font-mono text-[10.5px] uppercase tracking-wider text-stone-400">
            {hint}
          </p>
        )}
      </div>
      <p
        className="shrink-0 font-mono"
        style={{
          color: amountColor,
          fontSize: bold || highlight ? 15 : 13.5,
          fontWeight: bold || highlight ? 500 : 400,
        }}
      >
        {prefix}
        {money(display)}
      </p>
    </div>
  );
}

function FeeLineDivider({ strong = false }: { strong?: boolean }) {
  return (
    <div
      className="my-2"
      style={{
        borderTop: `1px ${strong ? "solid" : "dashed"} ${
          strong ? "rgba(44,44,44,0.18)" : "rgba(44,44,44,0.12)"
        }`,
      }}
    />
  );
}

function FeeExplainer({
  glyph,
  title,
  detail,
}: {
  glyph: string;
  title: string;
  detail: string;
}) {
  return (
    <div
      className="flex gap-3 rounded-xl border p-4"
      style={{ borderColor: BORDER, backgroundColor: "#FBF3E4" }}
    >
      <span
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[12px]"
        style={{ backgroundColor: GOLD_SOFT, color: GOLD_DEEP }}
        aria-hidden
      >
        {glyph}
      </span>
      <div className="min-w-0">
        <p
          className="text-[13.5px] text-[#2C2C2C]"
          style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}
        >
          {title}
        </p>
        <p className="mt-0.5 text-[12px] leading-snug text-stone-600">
          {detail}
        </p>
      </div>
    </div>
  );
}

// â”€â”€ Payout History â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function PayoutHistory({ payouts }: { payouts: PayoutsData }) {
  return (
    <section>
      <SectionHeading
        title="Payout history"
        count={payouts.history.length}
        action={
          <button
            type="button"
            className="inline-flex h-8 items-center gap-1.5 rounded-md border bg-white px-3 text-[12.5px] text-[#2C2C2C] transition-colors hover:bg-[#FBF3E4]"
            style={{ borderColor: "rgba(44,44,44,0.12)" }}
          >
            <span aria-hidden>â¤“</span> Export CSV
          </button>
        }
      />
      <Card tone="ivory">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[13px]">
            <thead>
              <tr
                style={{
                  backgroundColor: "rgba(245,230,208,0.35)",
                  borderBottom: `1px solid ${HAIRLINE}`,
                }}
              >
                <Th className="w-32 text-left">Date</Th>
                <Th className="w-28 text-right">Amount</Th>
                <Th className="text-left">Method</Th>
                <Th className="w-24 text-left">Status</Th>
                <Th className="text-left">Reference</Th>
                <Th className="w-20 text-right">
                  <span className="sr-only">Actions</span>
                </Th>
              </tr>
            </thead>
            <tbody>
              {payouts.history.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center">
                    <p
                      className="text-[15px] text-stone-500"
                      style={{ fontFamily: "'Cormorant Garamond', serif" }}
                    >
                      No payout history yet
                    </p>
                  </td>
                </tr>
              ) : (
                payouts.history.map((row) => (
                  <PayoutHistoryRow key={row.id} row={row} />
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </section>
  );
}

function PayoutHistoryRow({ row }: { row: PayoutRow }) {
  return (
    <tr className="border-t" style={{ borderColor: "rgba(44,44,44,0.06)" }}>
      <Td>
        <span className="font-mono text-[12.5px] text-stone-700">{row.date}</span>
      </Td>
      <Td className="text-right">
        <span className="font-mono text-[13px] text-[#2C2C2C]">
          {money(row.amount)}
        </span>
      </Td>
      <Td>
        <span className="text-[13px] text-stone-700">{row.method}</span>
      </Td>
      <Td>
        <StatusPill status={row.status} />
      </Td>
      <Td>
        <span className="font-mono text-[11.5px] text-stone-500">
          {row.reference}
        </span>
      </Td>
      <Td className="text-right">
        <button
          type="button"
          className="font-mono text-[11px] uppercase tracking-wider text-[#7a5a16] hover:underline"
        >
          Details â†’
        </button>
      </Td>
    </tr>
  );
}

function StatusPill({ status }: { status: PayoutStatus }) {
  const meta: Record<PayoutStatus, { label: string; glyph: string; tone: string; bg: string }> = {
    paid: {
      label: "Paid",
      glyph: "âœ“",
      tone: "#2C6E6A",
      bg: "rgba(217,232,228,0.55)",
    },
    pending: {
      label: "Pending",
      glyph: "â—”",
      tone: GOLD_DEEP,
      bg: "rgba(245,230,208,0.55)",
    },
    failed: {
      label: "Failed",
      glyph: "âš ",
      tone: "#B23A2A",
      bg: "rgba(232,213,208,0.55)",
    },
  };
  const m = meta[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 font-mono text-[11px] font-medium"
      style={{ color: m.tone, backgroundColor: m.bg }}
    >
      <span aria-hidden>{m.glyph}</span>
      {m.label}
    </span>
  );
}

function Th({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={`px-4 py-2.5 font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-stone-500 ${className}`}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <td className={`px-4 py-3.5 align-middle ${className}`}>{children}</td>;
}

// â”€â”€ Payout Settings â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function PayoutSettings({ payouts }: { payouts: PayoutsData }) {
  const S = payouts.settings;
  return (
    <section>
      <SectionHeading title="Payout settings" />
      <Card tone="ivory">
        <div className="divide-y" style={{ borderColor: HAIRLINE }}>
          <SettingRow
            label="Payout method"
            value={S.method}
            sub={S.methodDetail}
            action="Change"
          />
          <SettingRow
            label="Payout schedule"
            value={S.schedule}
            sub={S.scheduleOptions.filter((o) => o !== S.schedule).join(" Â· ")}
            action="Change"
          />
          <SettingRow
            label="Minimum payout threshold"
            value={moneyWhole(S.minimumThreshold)}
            sub="Smaller balances roll over to the next cycle."
            action="Edit"
          />
          <SettingRow
            label="Tax information"
            value={
              <span className="inline-flex items-center gap-2">
                <span
                  className="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 font-mono text-[10.5px] font-medium"
                  style={{ color: "#2C6E6A", backgroundColor: "rgba(217,232,228,0.55)" }}
                >
                  <span aria-hidden>{S.w9OnFile ? "âœ“" : "âœ—"}</span>{" "}
                  {S.w9OnFile ? "W-9 on file" : "W-9 not on file"}
                </span>
              </span>
            }
            sub={`1099-K threshold ${money(S.form1099KThreshold, { decimals: false })} â€” ${
              S.form1099KWillReceive ? "you will receive a 1099-K" : "no 1099-K this year"
            }`}
            action="View"
          />
        </div>
      </Card>
    </section>
  );
}

function SettingRow({
  label,
  value,
  sub,
  action,
}: {
  label: string;
  value: React.ReactNode;
  sub: string;
  action: string;
}) {
  return (
    <div
      className="flex items-start justify-between gap-4 border-t px-6 py-4 first:border-t-0"
      style={{ borderColor: HAIRLINE }}
    >
      <div className="min-w-0 flex-1">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-stone-500">
          {label}
        </p>
        <div
          className="mt-1.5 text-[14px] text-[#2C2C2C]"
          style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}
        >
          {value}
        </div>
        <p className="mt-1 text-[11.5px] text-stone-500">{sub}</p>
      </div>
      <button
        type="button"
        className="shrink-0 font-mono text-[11px] uppercase tracking-wider text-[#7a5a16] hover:underline"
      >
        {action}
      </button>
    </div>
  );
}

// â”€â”€ Tax Summary â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function TaxSummary({ payouts }: { payouts: PayoutsData }) {
  const T = payouts.tax;
  const willReceive1099 = payouts.settings.form1099KWillReceive;
  return (
    <section>
      <SectionHeading
        title="Tax summary Â· 2026"
        action={
          <button
            type="button"
            className="inline-flex h-8 items-center gap-1.5 rounded-md border bg-white px-3 text-[12.5px] text-[#2C2C2C] transition-colors hover:bg-[#FBF3E4]"
            style={{ borderColor: "rgba(44,44,44,0.12)" }}
          >
            <span aria-hidden>â¤“</span> Download for accountant
          </button>
        }
      />
      <Card tone="ivory">
        <div className="p-6">
          <TaxLine label="Total gross sales YTD" amount={T.grossSalesYTD} />
          <TaxLine label="Total fees paid YTD" amount={T.totalFeesYTD} negative />
          <TaxDivider />
          <TaxLine label="Net income YTD" amount={T.netIncomeYTD} bold highlight />

          {willReceive1099 && (
            <div
              className="mt-5 flex items-start gap-3 rounded-lg border px-4 py-3"
              style={{
                borderColor: BORDER,
                backgroundColor: "rgba(245,230,208,0.35)",
              }}
            >
              <span
                className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px]"
                style={{ backgroundColor: GOLD_SOFT, color: GOLD_DEEP }}
                aria-hidden
              >
                i
              </span>
              <p className="text-[12.5px] leading-snug text-stone-600">
                You've crossed the $600 1099-K threshold. A 1099-K will be
                generated for you in January of next year. Hand this summary to
                your accountant at tax time.
              </p>
            </div>
          )}
        </div>
      </Card>
    </section>
  );
}

function TaxLine({
  label,
  amount,
  negative = false,
  bold = false,
  highlight = false,
}: {
  label: string;
  amount: number;
  negative?: boolean;
  bold?: boolean;
  highlight?: boolean;
}) {
  const amountColor = highlight
    ? "#2C6E6A"
    : negative
    ? "#B23A2A"
    : "#2C2C2C";
  return (
    <div
      className={`flex items-baseline justify-between gap-4 py-2 ${
        highlight ? "rounded-md px-3 -mx-3" : ""
      }`}
      style={{
        backgroundColor: highlight ? "rgba(217,232,228,0.45)" : "transparent",
      }}
    >
      <p
        className={`text-[13.5px] text-[#2C2C2C] ${bold ? "font-medium" : ""}`}
      >
        {label}
      </p>
      <p
        className="shrink-0 font-mono"
        style={{
          color: amountColor,
          fontSize: bold || highlight ? 17 : 13.5,
          fontWeight: bold || highlight ? 500 : 400,
        }}
      >
        {negative ? "âˆ’" : ""}
        {moneyWhole(amount)}
      </p>
    </div>
  );
}

function TaxDivider() {
  return (
    <div
      className="my-2"
      style={{
        borderTop: "1px dashed rgba(44,44,44,0.12)",
      }}
    />
  );
}
