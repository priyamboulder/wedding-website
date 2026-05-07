"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, SectionHeading, StatCard } from "@/components/seller/ui";
import { supabaseBrowser } from "@/lib/supabase/browser-client";

// â”€â”€ Types (previously imported from seed) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
type OrderUrgency = "overdue" | "ready-to-ship" | "proof-pending" | "unread-message" | "new";

type SellerOrder = {
  id: string;
  number: string;
  coupleName: string;
  productName: string;
  quantity: number;
  paidAmount: number;
  paidDate: string;
  shipBy?: string;
  urgency: OrderUrgency;
  note?: string;
  daysLate?: number;
  daysUntilDue?: number;
  proofSentDate?: string;
  proofWaitingDays?: number;
  messagePreview?: string;
  messageReceivedAgo?: string;
};

type ActivityItem = {
  id: string;
  day: "today" | "yesterday";
  kind:
    | "new-order"
    | "review"
    | "proof-approved"
    | "favorited"
    | "shipped"
    | "message"
    | "listing-views";
  text: string;
  detail?: string;
  amount?: string;
};

type ShopData = {
  ownerFirstName: string;
  shopName: string;
  tagline: string;
  monthLabel: string;
  monthShort: string;
  revenueThisMonth: number;
  revenueDeltaPct: number;
  revenueSparkline: number[];
  ordersThisMonth: number;
  ordersPendingFulfillment: number;
  ordersOverdue: number;
  activeListings: number;
  draftListings: number;
  outOfStockListings: number;
  shopViews: number;
  conversionRatePct: number;
  rating: number;
  reviewCount: number;
};

// â”€â”€ Constants â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const URGENCY_META: Record<
  OrderUrgency,
  { label: string; glyph: string; tone: string; bg: string; border: string }
> = {
  overdue: {
    label: "Overdue",
    glyph: "âš ",
    tone: "#B23A2A",
    bg: "rgba(232,213,208,0.45)",
    border: "rgba(178,58,42,0.35)",
  },
  "ready-to-ship": {
    label: "Ready to ship",
    glyph: "ðŸ“¦",
    tone: "#7a5a16",
    bg: "rgba(245,230,208,0.55)",
    border: "rgba(196,162,101,0.45)",
  },
  "proof-pending": {
    label: "Proof pending approval",
    glyph: "ðŸŽ¨",
    tone: "#6B5BA8",
    bg: "rgba(232,222,245,0.45)",
    border: "rgba(107,91,168,0.25)",
  },
  "unread-message": {
    label: "Unread message",
    glyph: "ðŸ’¬",
    tone: "#2C6E6A",
    bg: "rgba(217,232,228,0.5)",
    border: "rgba(44,110,106,0.25)",
  },
  new: {
    label: "New order",
    glyph: "ðŸ†•",
    tone: "#2C2C2C",
    bg: "rgba(245,230,208,0.4)",
    border: "rgba(196,162,101,0.3)",
  },
};

const ACTIVITY_GLYPH: Record<ActivityItem["kind"], string> = {
  "new-order": "âŠ•",
  review: "â˜…",
  "proof-approved": "âœ“",
  favorited: "â™¡",
  shipped: "â†—",
  message: "âœ‰",
  "listing-views": "â—‰",
};

function greeting(): string {
  return "Good morning";
}

function formatMoney(n: number): string {
  return `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

// â”€â”€ Default/empty state values â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const DEFAULT_SHOP: ShopData = {
  ownerFirstName: "there",
  shopName: "Your Shop",
  tagline: "",
  monthLabel: "",
  monthShort: "",
  revenueThisMonth: 0,
  revenueDeltaPct: 0,
  revenueSparkline: [],
  ordersThisMonth: 0,
  ordersPendingFulfillment: 0,
  ordersOverdue: 0,
  activeListings: 0,
  draftListings: 0,
  outOfStockListings: 0,
  shopViews: 0,
  conversionRatePct: 0,
  rating: 0,
  reviewCount: 0,
};

// â”€â”€ Page component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export default function SellerDashboardPage() {
  const [token, setToken] = useState<string | null>(null);
  const [shop, setShop] = useState<ShopData>(DEFAULT_SHOP);
  const [ordersNeedingAction, setOrdersNeedingAction] = useState<SellerOrder[]>([]);
  const [activityFeed, setActivityFeed] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Get session token
  useEffect(() => {
    supabaseBrowser.auth.getSession().then(({ data }: { data: { session: { access_token: string } | null } | null }) => {
      setToken(data?.session?.access_token ?? null);
    });
  }, []);

  // Fetch shop data
  useEffect(() => {
    if (!token) return;
    fetch("/api/seller/shop", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.shop) setShop(data.shop);
      })
      .catch(() => {/* use defaults */});
  }, [token]);

  // Fetch orders (for "needs attention" section and activity feed)
  useEffect(() => {
    if (!token) return;
    fetch("/api/seller/orders", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.ordersNeedingAction) setOrdersNeedingAction(data.ordersNeedingAction);
        if (data.activityFeed) setActivityFeed(data.activityFeed);
      })
      .catch(() => {/* use defaults */})
      .finally(() => setLoading(false));
  }, [token]);

  const overdueCount = ordersNeedingAction.filter(
    (o) => o.urgency === "overdue",
  ).length;

  const today = activityFeed.filter((a) => a.day === "today");
  const yesterday = activityFeed.filter((a) => a.day === "yesterday");

  if (loading) {
    return (
      <div className="pb-16 animate-pulse">
        <section className="border-b px-8 py-8" style={{ borderColor: "rgba(44,44,44,0.08)" }}>
          <div className="h-10 w-64 rounded-lg bg-stone-200" />
          <div className="mt-3 h-4 w-48 rounded bg-stone-100" />
        </section>
        <div className="space-y-10 px-8 py-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-28 rounded-xl bg-stone-100" />
            ))}
          </div>
          <div className="h-48 rounded-xl bg-stone-100" />
          <div className="h-48 rounded-xl bg-stone-100" />
        </div>
      </div>
    );
  }

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
              {greeting()}, {shop.ownerFirstName}
            </h1>
            <p className="mt-1.5 text-[14px] text-stone-600">
              <span
                style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 17 }}
                className="text-[#2C2C2C]"
              >
                {shop.shopName}
              </span>
              {shop.tagline && (
                <>
                  <span className="mx-2 text-stone-300">Â·</span>
                  <span className="italic">{shop.tagline}</span>
                </>
              )}
            </p>
          </div>
          {shop.monthLabel && (
            <p className="font-mono text-[11px] uppercase tracking-[0.26em] text-[#7a5a16]">
              {shop.monthLabel}
            </p>
          )}
        </div>
      </section>

      <div className="space-y-10 px-8 py-8">
        {/* Key metrics */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard
            label={`Revenue Â· ${shop.monthShort}`}
            value={formatMoney(shop.revenueThisMonth)}
            deltaUp
            deltaText={`${shop.revenueDeltaPct}% vs last month`}
            sparkline={shop.revenueSparkline}
          />
          <StatCard
            label="Orders this month"
            value={String(shop.ordersThisMonth)}
            sub={`${shop.ordersPendingFulfillment} pending fulfillment`}
            warnText={
              shop.ordersOverdue > 0
                ? `${shop.ordersOverdue} overdue`
                : undefined
            }
          />
          <StatCard
            label="Active products"
            value={String(shop.activeListings)}
            sub={`${shop.draftListings} drafts Â· ${shop.outOfStockListings} out of stock`}
          />
          <StatCard
            label="Shop views"
            value={shop.shopViews.toLocaleString("en-US")}
            sub={`${shop.conversionRatePct}% conversion rate`}
          />
          <StatCard
            label="Shop rating"
            value={shop.rating > 0 ? shop.rating.toFixed(1) : "â€”"}
            sub={shop.reviewCount > 0 ? `from ${shop.reviewCount} reviews` : "No reviews yet"}
            ratingStars={shop.rating > 0 ? shop.rating : undefined}
          />
        </div>

        {/* Needs attention */}
        <section>
          <SectionHeading
            title="Needs your attention"
            count={ordersNeedingAction.length}
            action={
              <Link
                href="/seller/orders"
                className="text-[12.5px] text-[#7a5a16] hover:underline"
              >
                All orders â†’
              </Link>
            }
          />

          {ordersNeedingAction.length === 0 ? (
            <div
              className="rounded-xl border px-6 py-10 text-center"
              style={{ borderColor: "rgba(196,162,101,0.25)", backgroundColor: "#FFFFFA" }}
            >
              <p className="text-[15px] text-stone-500" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                No orders need attention right now
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-hidden rounded-xl border"
                style={{ borderColor: "rgba(196,162,101,0.25)", backgroundColor: "#FFFFFA" }}
              >
                {ordersNeedingAction.map((order, idx) => (
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
                  <span aria-hidden>âš </span> {overdueCount} order
                  {overdueCount === 1 ? " has" : "s have"} passed the ship-by date.
                </p>
              )}
            </>
          )}
        </section>

        {/* Activity + quick actions side-by-side on wide screens */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <section className="lg:col-span-2">
            <SectionHeading title="Recent activity" />
            <Card tone="ivory">
              <div className="px-6 py-5">
                {today.length > 0 ? (
                  <>
                    <ActivityGroup label="Today" items={today} />
                    {yesterday.length > 0 && (
                      <div className="mt-6 border-t pt-5"
                        style={{ borderColor: "rgba(44,44,44,0.06)" }}
                      >
                        <ActivityGroup label="Yesterday" items={yesterday} />
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-[13.5px] text-stone-500">No recent activity yet.</p>
                )}
              </div>
            </Card>
          </section>

          <section>
            <SectionHeading title="Quick actions" />
            <div className="flex flex-col gap-3">
              <QuickAction
                href="/seller/products/new"
                glyph="âŠ•"
                title="New product"
                hint="Create a new listing"
              />
              <QuickAction
                href="/seller/shipping?bulk=1"
                glyph="ðŸ“¦"
                title="Bulk ship"
                hint="Print labels for ready orders"
              />
              <QuickAction
                href="/seller/analytics?export=weekly"
                glyph="ðŸ“Š"
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

// â”€â”€ Order row â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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
          <span className="text-stone-300" aria-hidden>Â·</span>
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
            <span className="text-stone-500"> (Ã—{order.quantity})</span>
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
            Paid {formatMoney(order.paidAmount)} Â· {order.paidDate}
            {order.shipBy && (
              <>
                <span className="mx-1.5">Â·</span>
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
              Reply <span aria-hidden>â†’</span>
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

// â”€â”€ Activity â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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
                    â€” {a.detail}
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

// â”€â”€ Quick action tile â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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
        â†’
      </span>
    </Link>
  );
}
