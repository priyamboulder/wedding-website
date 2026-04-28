"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePortalVendor } from "@/lib/vendor-portal/current-vendor";
import { NotificationBell } from "@/components/shell/NotificationBell";

type MenuKind = "avatar" | null;

function initialsOf(name: string): string {
  const words = name.trim().split(/\s+/).slice(0, 2);
  return words.map((w) => w[0]?.toUpperCase() ?? "").join("") || "V";
}

export default function VendorTopBar() {
  const vendor = usePortalVendor();
  const avatar = initialsOf(vendor.owner_name || vendor.name);
  const firstName = vendor.owner_name?.split(" ")[0] ?? vendor.name;

  const [openMenu, setOpenMenu] = useState<MenuKind>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!openMenu) return;
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpenMenu(null);
    };
    const key = (e: KeyboardEvent) => e.key === "Escape" && setOpenMenu(null);
    document.addEventListener("mousedown", handler);
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("keydown", key);
    };
  }, [openMenu]);

  return (
    <header
      ref={containerRef}
      className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b px-6"
      style={{
        backgroundColor: "rgba(250,248,245,0.92)",
        backdropFilter: "blur(10px)",
        borderColor: "rgba(44,44,44,0.08)",
      }}
    >
      {/* Wordmark → back to public site */}
      <Link
        href="/"
        className="group flex items-baseline gap-2"
        aria-label="Back to Ananya public site"
      >
        <span
          className="text-[26px] leading-none text-[#2C2C2C] transition-colors group-hover:text-[#C4A265]"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 500,
            letterSpacing: "-0.01em",
          }}
        >
          Ananya
        </span>
        <span
          className="font-mono text-[10px] uppercase tracking-[0.28em]"
          style={{ color: "#b5a68e" }}
        >
          for vendors
        </span>
      </Link>

      <span
        className="h-5 w-px"
        style={{ backgroundColor: "rgba(44,44,44,0.12)" }}
        aria-hidden
      />

      {/* Business name */}
      <div className="flex items-center gap-2">
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: "#27AE60" }}
          aria-hidden
        />
        <span className="text-[13px] font-medium text-[#2C2C2C]">
          {vendor.name}
        </span>
        <span
          className="font-mono text-[10.5px] uppercase tracking-[0.2em]"
          style={{ color: "#b5a68e" }}
        >
          listed
        </span>
      </div>

      <div className="flex-1" />

      {/* Global search */}
      <div className="relative hidden items-center md:flex">
        <span
          className="pointer-events-none absolute left-3 text-[11px]"
          style={{ color: "#b5a68e" }}
          aria-hidden
        >
          ⌕
        </span>
        <input
          type="text"
          placeholder="Search inquiries, couples, dates…"
          className="h-8 w-72 rounded-full border bg-white/80 pl-7 pr-12 text-[13px] text-[#2C2C2C] placeholder:text-[#b5a68e] focus:outline-none focus:ring-2 focus:ring-[#C4A265]/40"
          style={{ borderColor: "rgba(44,44,44,0.1)" }}
        />
        <span
          className="pointer-events-none absolute right-2 rounded border bg-white px-1 py-[1px] font-mono text-[10px]"
          style={{ borderColor: "rgba(44,44,44,0.1)", color: "#b5a68e" }}
        >
          ⌘K
        </span>
      </div>

      {/* Notification bell */}
      <NotificationBell recipient="vendor" variant="vendor" />

      {/* Avatar with dropdown */}
      <div className="relative">
        <button
          onClick={() => setOpenMenu(openMenu === "avatar" ? null : "avatar")}
          className="flex items-center gap-2 rounded-full pl-1 pr-2 py-1 transition-colors hover:bg-white"
        >
          <span
            className="flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-semibold"
            style={{ backgroundColor: "#F5E6D0", color: "#9E8245" }}
          >
            {avatar}
          </span>
          <span className="hidden text-[12.5px] text-[#6a6a6a] md:inline">
            {firstName}
          </span>
          <span className="text-[9px]" style={{ color: "#b5a68e" }} aria-hidden>
            ▾
          </span>
        </button>
        {openMenu === "avatar" && (
          <div
            className="popover-enter absolute right-0 top-[calc(100%+8px)] w-[260px] overflow-hidden rounded-2xl border bg-white shadow-[0_24px_48px_-20px_rgba(44,44,44,0.25)]"
            style={{ borderColor: "rgba(44,44,44,0.1)" }}
            role="menu"
          >
            <div
              className="flex items-center gap-3 border-b px-5 py-3.5"
              style={{ borderColor: "rgba(44,44,44,0.08)" }}
            >
              <span
                className="flex h-10 w-10 items-center justify-center rounded-full text-[13px] font-semibold"
                style={{ backgroundColor: "#F5E6D0", color: "#9E8245" }}
              >
                {avatar}
              </span>
              <div className="min-w-0">
                <p className="truncate text-[14px] font-medium text-[#2C2C2C]">
                  {vendor.owner_name || vendor.name}
                </p>
                <p
                  className="truncate text-[11.5px] italic text-[#8a8a8a]"
                  style={{ fontFamily: "'EB Garamond', serif" }}
                >
                  {vendor.name} · Owner
                </p>
              </div>
            </div>
            <ul className="p-1.5">
              <MenuLink href="/vendor/settings" label="Account" hint="Personal details" />
              <MenuLink href="/vendor/settings#billing" label="Billing" hint="Plan, invoices, tax" />
              <MenuLink href="/vendor/settings#help" label="Help & support" hint="Docs, contact Meera" />
            </ul>
            <div
              className="border-t p-1.5"
              style={{ borderColor: "rgba(44,44,44,0.08)" }}
            >
              <Link
                href="/"
                className="flex w-full items-center justify-between rounded-md px-3 py-2 text-[13px] text-[#C0392B] transition-colors hover:bg-[#C0392B]/8"
              >
                <span>Sign out</span>
                <span aria-hidden>↵</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

function MenuLink({ href, label, hint }: { href: string; label: string; hint: string }) {
  return (
    <li>
      <Link
        href={href}
        className="flex items-start justify-between gap-3 rounded-md px-3 py-2 transition-colors hover:bg-[#F5E6D0]"
      >
        <div>
          <p className="text-[13px] text-[#2C2C2C]">{label}</p>
          <p
            className="text-[11px] italic text-[#8a8a8a]"
            style={{ fontFamily: "'EB Garamond', serif" }}
          >
            {hint}
          </p>
        </div>
        <span
          className="mt-1 text-[11px]"
          style={{ color: "#c8b795" }}
          aria-hidden
        >
          →
        </span>
      </Link>
    </li>
  );
}
