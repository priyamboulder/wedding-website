import Link from "next/link";
import { Card, SectionHeading, StatCard } from "@/components/seller/ui";
import {
  ACTIVITY_FEED,
  ORDERS_NEEDING_ACTION,
  SELLER,
  type ActivityItem,
  type OrderUrgency,
  type SellerOrder,
} from "@/lib/seller/seed";

const URGENCY_META: Record<
  OrderUrgency,
  { label: string; glyph: string; tone: string; bg: string; border: string }
> = {
  overdue: {
    label: "Overdue",
    glyph: "⚠",
    tone: "#B23A2A",
    bg: "rgba(232,213,208,0.45)",
    border: "rgba(178,58,42,0.35)",
  },
  "ready-to-ship": {
    label: "Ready to ship",
    glyph: "📦",
    tone: "#7a5a16",
    bg: "rgba(245,230,208,0.55)",
    border: "rgba(196,162,101,0.45)",
  },
  "proof-pending": {
    label: "Proof pending approval",
    glyph: "🎨",
    tone: "#6B5BA8",
    bg: "rgba(232,222,245,0.45)",
    border: "rgba(107,91,168,0.25)",
  },
  "unread-message": {
    label: "Unread message",
    glyph: "💬",
    tone: "#2C6E6A",
    bg: "rgba(217,232,228,0.5)",
    border: "rgba(44,110,106,0.25)",
  },
  new: {
    label: "New order",
    glyph: "🆕",
    tone: "#2C2C2C",
    bg: "rgba(245,230,208,0.4)",
    border: "rgba(196,162,101,0.3)",
  },
};

const ACTIVITY_GLYPH: Record<ActivityItem["kind"], string> = {
  "new-order": "⊕",
  review: "★",
  "proof-approved": "✓",
  favorited: "♡",
  shipped: "↗",
  message: "✉",
  "listing-views": "◉",
};

function greeting(): string {
  // Static for a build-only dashboard. The brief shows "Good morning".
  return "Good morning";
}

function formatMoney(n: number): string {
  return `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

export default function SellerDashboardPage() {
  const overdueCount = ORDERS_NEEDING_ACTION.filter(
    (o) => o.urgency === "overdue",
  ).length;

  const today = ACTIVITY_FEED.filter((a) => a.day === "today");
  const yesterday = ACTIVITY_FEED.filter((a) => a.day === "yesterday");

  return (
    <div className="pb-16">
      {/* Welcome section */}
      <section className="border-b px-8 py-8" style={{ borderColor: "rgba(44,44,44,0.08)" }}>
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
              {greeting()}, {SELLER.ownerFirstName}
            </h1>
            <p className="mt-1.5 text-[14px] text-stone-600">
              <span
                style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 17 }}
                className="text-[#2C2C2C]"
              >
                {SELLER.shopName}
              </span>
              <span className="mx-2 text-stone-300">·</span>
              <span className="italic">{SELLER.tagline}</span>
            </p>
          </div>
          <p className="font-mono text-[11px] uppercase tracking-[0.26em] text-[#7a5a16]">
            {SELLER.monthLabel}
          </p>
        </div>
      </section>

      <div className="space-y-10 px-8 py-8">
        {/* Key metrics */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard
            label={`Revenue · ${SELLER.monthShort}`}
            value={formatMoney(SELLER.revenueThisMonth)}
            deltaUp
            deltaText={`${SELLER.revenueDeltaPct}% vs September`}
            sparkline={SELLER.revenueSparkline}
          />
          <StatCard
            label="Orders this month"
            value={String(SELLER.ordersThisMonth)}
            sub={`${SELLER.ordersPendingFulfillment} pending fulfillment`}
            warnText={
              SELLER.ordersOverdue > 0
                ? `${SELLER.ordersOverdue} overdue`
                : undefined
            }
          />
          <StatCard
            label="Active products"
            value={String(SELLER.activeListings)}
            sub={`${SELLER.draftListings} drafts · ${SELLER.outOfStockListings} out of stock`}
          />
          <StatCard
            label="Shop views"
            value={SELLER.shopViews.toLocaleString("en-US")}
            sub={`${SELLER.conversionRatePct}% conversion rate`}
          />
          <StatCard
            label="Shop rating"
            value={SELLER.rating.toFixed(1)}
            sub={`from ${SELLER.reviewCount} reviews`}
            ratingStars={SELLER.rating}
          />
        </div>

        {/* Needs attention */}
        <section>
          <SectionHeading
            title="Needs your attention"
            count={ORDERS_NEEDING_ACTION.length}
            action={
              <Link
                href="/seller/orders"
                className="text-[12.5px] text-[#7a5a16] hover:underline"
              >
                All orders →
              </Link>
            }
          />

          <div className="overflow-hidden rounded-xl border"
            style={{ borderColor: "rgba(196,162,101,0.25)", backgroundColor: "#FFFFFA" }}
          >
            {ORDERS_NEEDING_ACTION.map((order, idx) => (
              <OrderRow
                key={order.id}
                order={order}
                first={idx === 0}
                isOverdue={order.urgency === "overdue"}
              />
            ))}
          </div>

          {overdueCount > 0 && (
            <p className="mt-3 text-[11.5px] text-[#B23A2A]">
              <span aria-hidden>⚠</span> {overdueCount} order
              {overdueCount === 1 ? " has" : "s have"} passed the ship-by date.
            </p>
          )}
        </section>

        {/* Activity + quick actions side-by-side on wide screens */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <section className="lg:col-span-2">
            <SectionHeading title="Recent activity" />
            <Card tone="ivory">
              <div className="px-6 py-5">
                <ActivityGroup label="Today" items={today} />
                {yesterday.length > 0 && (
                  <div className="mt-6 border-t pt-5"
                    style={{ borderColor: "rgba(44,44,44,0.06)" }}
                  >
                    <ActivityGroup label="Yesterday" items={yesterday} />
                  </div>
                )}
              </div>
            </Card>
          </section>

          <section>
            <SectionHeading title="Quick actions" />
            <div className="flex flex-col gap-3">
              <QuickAction
                href="/seller/products/new"
                glyph="⊕"
                title="New product"
                hint="Create a new listing"
              />
              <QuickAction
                href="/seller/shipping?bulk=1"
                glyph="📦"
                title="Bulk ship"
                hint="Print labels for ready orders"
              />
              <QuickAction
                href="/seller/analytics?export=weekly"
                glyph="📊"
                title="Weekly report"
                hint="Download sales summary"
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

// ── Order row ─────────────────────────────────────────────

function OrderRow({
  order,
  first,
  isOverdue,
}: {
  order: SellerOrder;
  first: boolean;
  isOverdue: boolean;
}) {
  const meta = URGENCY_META[order.urgency];

  return (
    <div
      className={`flex flex-col gap-4 px-6 py-5 md:flex-row md:items-start md:gap-6 ${
        first ? "" : "border-t"
      }`}
      style={{
        borderColor: "rgba(44,44,44,0.06)",
        backgroundColor: isOverdue ? meta.bg : "transparent",
      }}
    >
      <div className="md:w-52 md:shrink-0">
        <span
          className="inline-flex items-center gap-1.5 rounded-md border px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider"
          style={{
            color: meta.tone,
            backgroundColor: meta.bg,
            borderColor: meta.border,
          }}
        >
          <span aria-hidden>{meta.glyph}</span>
          {meta.label}
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <p
            className="font-mono text-[12px] font-medium text-[#2C2C2C]"
          >
            Order {order.number}
          </p>
          <span className="text-stone-300" aria-hidden>·</span>
          <p
            className="text-[15px] text-[#2C2C2C]"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}
          >
            {order.coupleName}
          </p>
          <span className="ml-auto font-mono text-[10.5px] uppercase tracking-wider text-stone-500">
            {order.urgency === "overdue" && `${order.daysLate} days late`}
            {order.urgency === "ready-to-ship" &&
              `Due in ${order.daysUntilDue} day${order.daysUntilDue === 1 ? "" : "s"}`}
            {order.urgency === "proof-pending" &&
              `Waiting ${order.proofWaitingDays} days`}
            {order.urgency === "unread-message" &&
              `Received ${order.messageReceivedAgo}`}
          </span>
        </div>

        <p className="mt-1 text-[13.5px] text-stone-700">
          {order.productName}
          {order.urgency !== "unread-message" && order.quantity > 0 && (
            <span className="text-stone-500"> (×{order.quantity})</span>
          )}
        </p>

        {order.urgency === "unread-message" && order.messagePreview && (
          <p
            className="mt-1.5 text-[13px] italic text-stone-600"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            "{order.messagePreview}"
          </p>
        )}

        {order.urgency === "proof-pending" && (
          <p className="mt-1 text-[12px] text-stone-500">
            Proof sent {order.proofSentDate}
          </p>
        )}

        {(order.urgency === "overdue" || order.urgency === "ready-to-ship") && (
          <p className="mt-1 font-mono text-[11px] text-stone-500">
            Paid {formatMoney(order.paidAmount)} · {order.paidDate}
            {order.shipBy && (
              <>
                <span className="mx-1.5">·</span>
                Ship by {order.shipBy}
                {order.urgency === "overdue" && (
                  <span className="ml-1 text-[#B23A2A]">(passed)</span>
                )}
              </>
            )}
          </p>
        )}

        <div className="mt-3 flex flex-wrap gap-2">
          {order.urgency === "overdue" && (
            <>
              <ActionButton primary>Ship now</ActionButton>
              <ActionButton>Message buyer</ActionButton>
              <ActionButton>Extend timeline</ActionButton>
            </>
          )}
          {order.urgency === "ready-to-ship" && (
            <>
              <ActionButton primary>Ship now</ActionButton>
              <ActionButton>Message buyer</ActionButton>
            </>
          )}
          {order.urgency === "proof-pending" && (
            <>
              <ActionButton primary>Resend proof</ActionButton>
              <ActionButton>Message buyer</ActionButton>
            </>
          )}
          {order.urgency === "unread-message" && (
            <ActionButton primary>
              Reply <span aria-hidden>→</span>
            </ActionButton>
          )}
        </div>
      </div>
    </div>
  );
}

function ActionButton({
  children,
  primary = false,
}: {
  children: React.ReactNode;
  primary?: boolean;
}) {
  if (primary) {
    return (
      <button
        type="button"
        className="inline-flex h-8 items-center gap-1.5 rounded-md px-3.5 text-[12.5px] font-medium text-white transition-colors hover:opacity-90"
        style={{ backgroundColor: "#C4A265" }}
      >
        {children}
      </button>
    );
  }
  return (
    <button
      type="button"
      className="inline-flex h-8 items-center gap-1.5 rounded-md border bg-white px-3 text-[12.5px] text-[#2C2C2C] transition-colors hover:bg-[#FBF3E4]"
      style={{ borderColor: "rgba(44,44,44,0.12)" }}
    >
      {children}
    </button>
  );
}

// ── Activity ─────────────────────────────────────────────

function ActivityGroup({
  label,
  items,
}: {
  label: string;
  items: ActivityItem[];
}) {
  return (
    <div>
      <p className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-[#7a5a16]">
        {label}
      </p>
      <ul className="mt-3 flex flex-col gap-3">
        {items.map((a) => (
          <li key={a.id} className="flex gap-3">
            <span
              className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px]"
              style={{
                backgroundColor: "#F5E6D0",
                color: "#7a5a16",
              }}
              aria-hidden
            >
              {ACTIVITY_GLYPH[a.kind]}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[13.5px] leading-snug text-stone-700">
                {a.text}
                {a.amount && (
                  <span
                    className="ml-2 font-mono text-[12px] text-[#2C2C2C]"
                    style={{ fontWeight: 500 }}
                  >
                    {a.amount}
                  </span>
                )}
                {a.detail && (
                  <span
                    className="ml-2 italic text-stone-500"
                    style={{ fontFamily: "'Cormorant Garamond', serif" }}
                  >
                    — {a.detail}
                  </span>
                )}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── Quick action tile ─────────────────────────────────────

function QuickAction({
  href,
  glyph,
  title,
  hint,
}: {
  href: string;
  glyph: string;
  title: string;
  hint: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-start gap-3 rounded-xl border px-4 py-4 transition-colors hover:bg-white"
      style={{
        borderColor: "rgba(196,162,101,0.25)",
        backgroundColor: "#FBF3E4",
      }}
    >
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[14px]"
        style={{ backgroundColor: "#F5E6D0", color: "#7a5a16" }}
        aria-hidden
      >
        {glyph}
      </span>
      <div className="min-w-0 flex-1">
        <p
          className="text-[15px] text-[#2C2C2C]"
          style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}
        >
          {title}
        </p>
        <p className="mt-0.5 text-[12px] text-stone-500">{hint}</p>
      </div>
      <span
        className="mt-2 text-[12px] text-stone-400 transition-colors group-hover:text-[#7a5a16]"
        aria-hidden
      >
        →
      </span>
    </Link>
  );
}
