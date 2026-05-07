"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  STATUS_FILTER_OPTIONS,
  STATUS_META,
  type OrderStatus,
  type SellerOrderRow,
} from "@/lib/seller/orders-seed";
import { supabaseBrowser } from "@/lib/supabase/browser-client";

type Filter = OrderStatus | "all";

type OrderStats = {
  pending: number;
  inProduction: number;
  shipped: number;
  completed: number;
};

const DEFAULT_STATS: OrderStats = {
  pending: 0,
  inProduction: 0,
  shipped: 0,
  completed: 0,
};

export default function SellerOrdersPage() {
  const [token, setToken] = useState<string | null>(null);
  const [allOrders, setAllOrders] = useState<SellerOrderRow[]>([]);
  const [orderStats, setOrderStats] = useState<OrderStats>(DEFAULT_STATS);
  const [loading, setLoading] = useState(true);

  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Get session token
  useEffect(() => {
    supabaseBrowser.auth.getSession().then(({ data }: { data: { session: { access_token: string } | null } | null }) => {
      setToken(data?.session?.access_token ?? null);
    });
  }, []);

  // Fetch orders
  useEffect(() => {
    if (!token) return;
    fetch("/api/seller/orders", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data.orders)) setAllOrders(data.orders);
        else if (Array.isArray(data)) setAllOrders(data);
        if (data.stats) setOrderStats(data.stats);
      })
      .catch(() => {/* keep empty */})
      .finally(() => setLoading(false));
  }, [token]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allOrders.filter((o) => {
      if (filter !== "all" && o.status !== filter) return false;
      if (q) {
        return (
          o.number.toLowerCase().includes(q) ||
          o.coupleName.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [allOrders, filter, query]);

  const selectedReadyToShip = useMemo(
    () =>
      [...selected].filter(
        (id) => allOrders.find((o) => o.id === id)?.status === "ready-to-ship",
      ).length,
    [selected, allOrders],
  );

  const toggleRow = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  if (loading) {
    return (
      <div className="pb-16 animate-pulse">
        <section className="border-b px-8 py-8" style={{ borderColor: "rgba(44,44,44,0.08)" }}>
          <div className="h-10 w-36 rounded-lg bg-stone-200" />
          <div className="mt-3 h-4 w-64 rounded bg-stone-100" />
        </section>
        <div className="px-8 py-6">
          <div className="h-96 rounded-xl bg-stone-100" />
        </div>
      </div>
    );
  }

  return (
    <div className="pb-16">
      {/* Header */}
      <section
        className="border-b px-8 py-8"
        style={{ borderColor: "rgba(44,44,44,0.08)" }}
      >
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
              Orders
            </h1>
            <p className="mt-2 text-[13.5px] text-stone-600">
              <StatPill count={orderStats.pending} label="pending" tone="gold" />
              <Divider />
              <StatPill
                count={orderStats.inProduction}
                label="in production"
                tone="warm"
              />
              <Divider />
              <StatPill count={orderStats.shipped} label="shipped" tone="blue" />
              <Divider />
              <StatPill
                count={orderStats.completed}
                label="completed"
                tone="teal"
              />
            </p>
          </div>

          <button
            type="button"
            disabled={selectedReadyToShip === 0}
            className="inline-flex h-10 items-center gap-2 rounded-md px-4 text-[13px] font-medium text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50"
            style={{
              backgroundColor: "#C4A265",
            }}
          >
            <span aria-hidden>ðŸ“¦</span> Bulk Ship
            {selectedReadyToShip > 0 && (
              <span className="rounded-full bg-white/25 px-1.5 font-mono text-[10.5px]">
                {selectedReadyToShip}
              </span>
            )}
          </button>
        </div>
      </section>

      {/* Filter bar */}
      <section
        className="flex flex-wrap items-center gap-4 border-b px-8 py-5"
        style={{
          borderColor: "rgba(44,44,44,0.08)",
          backgroundColor: "#FBF3E4",
        }}
      >
        <div className="flex flex-wrap items-center gap-1.5">
          {STATUS_FILTER_OPTIONS.map((opt) => {
            const isActive = filter === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setFilter(opt.value)}
                className="inline-flex h-8 items-center rounded-md border px-3 text-[12px] transition-colors"
                style={{
                  backgroundColor: isActive ? "#2C2C2C" : "#FFFFFA",
                  color: isActive ? "#FBF3E4" : "#2C2C2C",
                  borderColor: isActive ? "#2C2C2C" : "rgba(44,44,44,0.14)",
                }}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        <div className="ml-auto flex items-center gap-3">
          <DateRangeSelector />
          <SearchBox value={query} onChange={setQuery} />
        </div>
      </section>

      {/* Table */}
      <section className="px-8 py-6">
        <div
          className="overflow-hidden rounded-xl border"
          style={{
            borderColor: "rgba(196,162,101,0.25)",
            backgroundColor: "#FFFFFA",
          }}
        >
          {/* Column header */}
          <div
            className="grid items-center gap-3 border-b px-5 py-3 font-mono text-[10.5px] uppercase tracking-[0.16em] text-stone-500"
            style={{
              borderColor: "rgba(44,44,44,0.08)",
              gridTemplateColumns:
                "24px 72px minmax(150px,1.1fr) minmax(200px,1.6fr) 90px 70px 150px",
            }}
          >
            <span aria-hidden></span>
            <span>#</span>
            <span>Couple</span>
            <span>Product</span>
            <span className="text-right">Total</span>
            <span>Date</span>
            <span>Status</span>
          </div>

          {rows.map((o, idx) => (
            <OrderRow
              key={o.id}
              order={o}
              first={idx === 0}
              checked={selected.has(o.id)}
              onToggle={() => toggleRow(o.id)}
            />
          ))}

          {rows.length === 0 && (
            <div className="px-5 py-12 text-center">
              <p
                className="text-[17px] text-stone-500"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                No orders match this view
              </p>
              <p className="mt-1 text-[12px] text-stone-400">
                Try clearing the filter or search
              </p>
            </div>
          )}
        </div>

        <p className="mt-3 font-mono text-[11px] text-stone-500">
          Showing {rows.length} of {allOrders.length} orders
        </p>
      </section>
    </div>
  );
}

// â”€â”€â”€ Row â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function OrderRow({
  order,
  first,
  checked,
  onToggle,
}: {
  order: SellerOrderRow;
  first: boolean;
  checked: boolean;
  onToggle: () => void;
}) {
  const meta = STATUS_META[order.status];
  const overdueTint = order.overdue ? "rgba(232,213,208,0.25)" : "transparent";

  return (
    <Link
      href={`/seller/orders/${order.id}`}
      className={`grid items-center gap-3 px-5 py-4 transition-colors hover:bg-[#FBF3E4] ${
        first ? "" : "border-t"
      }`}
      style={{
        borderColor: "rgba(44,44,44,0.06)",
        backgroundColor: overdueTint,
        gridTemplateColumns:
          "24px 72px minmax(150px,1.1fr) minmax(200px,1.6fr) 90px 70px 150px",
      }}
    >
      <span
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onToggle();
        }}
        className="flex h-4 w-4 cursor-pointer items-center justify-center rounded border text-[10px]"
        style={{
          borderColor: checked ? "#C4A265" : "rgba(44,44,44,0.3)",
          backgroundColor: checked ? "#C4A265" : "transparent",
          color: "#FFFFFA",
        }}
        aria-hidden
      >
        {checked ? "âœ“" : ""}
      </span>

      <span className="font-mono text-[12px] font-medium text-[#2C2C2C]">
        {order.number}
      </span>

      <span
        className="truncate text-[14.5px] text-[#2C2C2C]"
        style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}
      >
        {order.coupleName}
      </span>

      <span className="truncate text-[13px] text-stone-700">
        {order.productName}
        {order.quantity > 1 && (
          <span className="text-stone-400"> (Ã—{order.quantity})</span>
        )}
      </span>

      <span className="text-right font-mono text-[12.5px] text-[#2C2C2C]">
        ${order.total.toLocaleString("en-US")}
      </span>

      <span className="font-mono text-[11.5px] text-stone-500">
        {order.orderedDate}
      </span>

      <span className="flex items-center gap-1.5">
        <span
          className="inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider"
          style={{
            color: meta.tone,
            backgroundColor: meta.bg,
            borderColor: meta.border,
          }}
        >
          <span aria-hidden>{meta.glyph}</span>
          {meta.short}
        </span>
        {order.overdue && (
          <span
            className="font-mono text-[9.5px] font-bold uppercase tracking-wider"
            style={{ color: "#B23A2A" }}
          >
            âš  Overdue
          </span>
        )}
      </span>
    </Link>
  );
}

// â”€â”€â”€ Header pills â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function StatPill({
  count,
  label,
  tone,
}: {
  count: number;
  label: string;
  tone: "gold" | "warm" | "blue" | "teal";
}) {
  const colors = {
    gold: "#7a5a16",
    warm: "#A8612F",
    blue: "#4A6FA5",
    teal: "#2C6E6A",
  };
  return (
    <span className="inline-flex items-baseline gap-1.5">
      <span
        className="font-mono text-[14px] font-semibold"
        style={{ color: colors[tone] }}
      >
        {count}
      </span>
      <span className="text-stone-600">{label}</span>
    </span>
  );
}

function Divider() {
  return <span className="mx-2 text-stone-300">Â·</span>;
}

// â”€â”€â”€ Date range / search â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function DateRangeSelector() {
  return (
    <button
      type="button"
      className="inline-flex h-9 items-center gap-2 rounded-md border bg-white px-3 text-[12px] text-stone-700 transition-colors hover:bg-[#FFFFFA]"
      style={{ borderColor: "rgba(44,44,44,0.14)" }}
    >
      <span aria-hidden>ðŸ“…</span>
      Last 30 days
      <span className="text-stone-400" aria-hidden>
        â–¾
      </span>
    </button>
  );
}

function SearchBox({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div
      className="flex h-9 items-center gap-2 rounded-md border bg-white px-3"
      style={{ borderColor: "rgba(44,44,44,0.14)" }}
    >
      <span className="text-stone-400" aria-hidden>
        ðŸ”
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search order # or couple"
        className="w-56 bg-transparent text-[12.5px] text-[#2C2C2C] outline-none placeholder:text-stone-400"
      />
    </div>
  );
}
