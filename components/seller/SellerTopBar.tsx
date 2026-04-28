"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { NOTIFICATIONS, SELLER, SELLER_NAV } from "@/lib/seller/seed";

type MenuKind = "bell" | "avatar" | null;

export default function SellerTopBar() {
  const pathname = usePathname();
  const [openMenu, setOpenMenu] = useState<MenuKind>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!openMenu) return;
    const click = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpenMenu(null);
    };
    const key = (e: KeyboardEvent) => e.key === "Escape" && setOpenMenu(null);
    document.addEventListener("mousedown", click);
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("mousedown", click);
      document.removeEventListener("keydown", key);
    };
  }, [openMenu]);

  const unread = SELLER.unreadNotifications;

  return (
    <div ref={wrapRef} className="sticky top-0 z-30">
      {/* Row 1 — wordmark, shop identity, bell + avatar */}
      <header
        className="flex h-14 items-center gap-4 border-b px-8"
        style={{
          backgroundColor: "rgba(250,248,245,0.94)",
          backdropFilter: "blur(10px)",
          borderColor: "rgba(44,44,44,0.08)",
        }}
      >
        <Link href="/" className="flex items-baseline gap-2" aria-label="Ananya home">
          <span
            className="text-[22px] leading-none text-[#2C2C2C]"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 500,
              letterSpacing: "-0.01em",
            }}
          >
            Ananya
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#C4A265]">
            Seller
          </span>
        </Link>

        <div className="flex-1" />

        <Link
          href={SELLER.publicShopUrl}
          className="hidden items-center gap-1.5 text-[12px] text-[#7a5a16] hover:underline md:inline-flex"
        >
          <span aria-hidden>↗</span>
          View my shop
        </Link>

        {/* Bell */}
        <div className="relative">
          <button
            onClick={() => setOpenMenu(openMenu === "bell" ? null : "bell")}
            aria-label={`${unread} unread notifications`}
            className="relative flex h-8 w-8 items-center justify-center rounded-md text-[15px] text-stone-600 transition-colors hover:bg-white hover:text-[#2C2C2C]"
          >
            <span aria-hidden>◔</span>
            {unread > 0 && (
              <span
                className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold text-white"
                style={{ backgroundColor: "#C4A265" }}
              >
                {unread}
              </span>
            )}
          </button>
          {openMenu === "bell" && (
            <div
              className="absolute right-0 top-[calc(100%+8px)] w-[360px] overflow-hidden rounded-lg border bg-white shadow-[0_20px_60px_-20px_rgba(44,44,44,0.25)]"
              style={{ borderColor: "rgba(44,44,44,0.1)" }}
              role="menu"
            >
              <div className="flex items-center justify-between border-b border-[rgba(44,44,44,0.08)] px-4 py-3">
                <p
                  className="text-[15px] text-[#2C2C2C]"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                >
                  Notifications
                </p>
                <button className="text-[11.5px] text-[#7a5a16] hover:underline">
                  Mark all read
                </button>
              </div>
              <ul className="max-h-[380px] overflow-y-auto">
                {NOTIFICATIONS.map((n) => (
                  <li
                    key={n.id}
                    className={`flex gap-3 border-b border-[rgba(44,44,44,0.05)] px-4 py-3 last:border-b-0 ${
                      n.unread ? "bg-[#FAF3E7]" : ""
                    }`}
                  >
                    <span
                      className={`mt-1 h-1.5 w-1.5 shrink-0 rounded-full ${
                        n.unread ? "bg-[#C4A265]" : "bg-stone-300"
                      }`}
                      aria-hidden
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] leading-snug text-stone-700">{n.message}</p>
                      <p className="mt-0.5 font-mono text-[10.5px] uppercase tracking-wider text-stone-400">
                        {n.kind} · {n.timeAgo}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Avatar */}
        <div className="relative">
          <button
            onClick={() => setOpenMenu(openMenu === "avatar" ? null : "avatar")}
            className="flex items-center gap-2 rounded-full pl-1 pr-2 py-1 transition-colors hover:bg-white"
          >
            <span
              className="flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-semibold text-[#7a5a16]"
              style={{ backgroundColor: "#F5E6D0" }}
            >
              {SELLER.avatar}
            </span>
            <span
              className="hidden text-[12.5px] text-[#2C2C2C] md:inline"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              {SELLER.shopName}
            </span>
            <span className="text-[9px] text-stone-400" aria-hidden>
              ▾
            </span>
          </button>
          {openMenu === "avatar" && (
            <div
              className="absolute right-0 top-[calc(100%+8px)] w-[260px] overflow-hidden rounded-lg border bg-white shadow-[0_20px_60px_-20px_rgba(44,44,44,0.25)]"
              style={{ borderColor: "rgba(44,44,44,0.1)" }}
              role="menu"
            >
              <div className="flex items-center gap-3 border-b border-[rgba(44,44,44,0.08)] px-4 py-3">
                <span
                  className="flex h-10 w-10 items-center justify-center rounded-full text-[13px] font-semibold text-[#7a5a16]"
                  style={{ backgroundColor: "#F5E6D0" }}
                >
                  {SELLER.avatar}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-medium text-[#2C2C2C]">
                    {SELLER.ownerName}
                  </p>
                  <p className="truncate text-[11.5px] text-stone-500">
                    {SELLER.shopName} · Owner
                  </p>
                </div>
              </div>
              <ul className="p-1.5">
                <MenuItem href="/seller/settings" label="Account" hint="Personal details" />
                <MenuItem href="/seller/payouts" label="Payouts" hint="Bank, tax, schedule" />
                <MenuItem href="/seller/settings#help" label="Help & support" hint="Docs, contact" />
              </ul>
              <div className="border-t border-[rgba(44,44,44,0.08)] p-1.5">
                <Link
                  href="/"
                  className="flex w-full items-center justify-between rounded-md px-3 py-2 text-[13px] text-[#C97B63] transition-colors hover:bg-[#C97B63]/8"
                >
                  <span>Sign out</span>
                  <span aria-hidden>↵</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Row 2 — tabs */}
      <nav
        className="flex h-11 items-center gap-1 border-b px-8 overflow-x-auto"
        style={{
          backgroundColor: "rgba(250,248,245,0.94)",
          backdropFilter: "blur(10px)",
          borderColor: "rgba(44,44,44,0.08)",
        }}
      >
        {SELLER_NAV.map((tab) => {
          const isActive =
            tab.href === "/seller"
              ? pathname === "/seller"
              : pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`relative flex h-11 items-center px-3 text-[13px] transition-colors ${
                isActive
                  ? "text-[#2C2C2C]"
                  : "text-stone-500 hover:text-[#2C2C2C]"
              }`}
            >
              {tab.label}
              {isActive && (
                <span
                  className="absolute inset-x-3 bottom-0 h-[2px] rounded-t"
                  style={{ backgroundColor: "#C4A265" }}
                  aria-hidden
                />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

function MenuItem({ href, label, hint }: { href: string; label: string; hint: string }) {
  return (
    <li>
      <Link
        href={href}
        className="flex items-start justify-between gap-3 rounded-md px-3 py-2 transition-colors hover:bg-[#F5E6D0]/40"
      >
        <div>
          <p className="text-[13px] text-[#2C2C2C]">{label}</p>
          <p className="text-[11px] text-stone-500">{hint}</p>
        </div>
        <span className="mt-1 text-[11px] text-stone-300" aria-hidden>
          →
        </span>
      </Link>
    </li>
  );
}
