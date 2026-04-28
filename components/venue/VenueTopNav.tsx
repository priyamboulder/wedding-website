"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { VENUE } from "@/lib/venue/seed";

type NavItem = { href: string; label: string; managedOnly?: boolean };

const NAV: NavItem[] = [
  { href: "/venue", label: "Dashboard" },
  { href: "/venue/weddings", label: "Weddings" },
  { href: "/venue/vendors", label: "Vendors" },
  { href: "/venue/leads", label: "Leads" },
  { href: "/venue/profile", label: "Profile" },
  { href: "/venue/analytics", label: "Analytics" },
  { href: "/venue/marketing", label: "Marketing" },
  { href: "/venue/stoneriver", label: "Stoneriver", managedOnly: true },
  { href: "/venue/messages", label: "Messages" },
];

export default function VenueTopNav() {
  const pathname = usePathname();
  const isStoneriver = VENUE.managedBy === "Stoneriver Hospitality";
  const items = NAV.filter((n) => !n.managedOnly || isStoneriver);

  return (
    <header
      className="sticky top-0 z-30 border-b"
      style={{
        backgroundColor: "rgba(250, 248, 245, 0.92)",
        borderColor: "rgba(44, 44, 44, 0.08)",
        backdropFilter: "saturate(140%) blur(10px)",
      }}
    >
      <div className="flex h-[64px] items-center gap-6 px-8">
        {/* Brand */}
        <Link href="/venue" className="flex items-baseline gap-2.5">
          <span
            className="text-[26px] leading-none text-[#2C2C2C]"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 500,
              letterSpacing: "0.01em",
            }}
          >
            Ananya
          </span>
          <span
            className="hidden h-4 w-px sm:block"
            style={{ backgroundColor: "rgba(196, 162, 101, 0.45)" }}
          />
          <span className="hidden font-mono text-[10px] uppercase tracking-[0.28em] text-[#C4A265] sm:block">
            Venue
          </span>
        </Link>

        {/* Tabs */}
        <nav className="ml-4 hidden flex-1 items-center gap-1 lg:flex">
          {items.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/venue" && pathname.startsWith(item.href + "/"));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-3.5 py-1.5 text-[13px] transition-colors ${
                  isActive
                    ? "bg-[#F5E6D0] text-[#2C2C2C]"
                    : "text-[#5a5a5a] hover:bg-[#F5E6D0]/55 hover:text-[#2C2C2C]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto lg:ml-0" />

        {/* Right cluster — venue identity + actions */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Notifications"
            className="relative grid h-9 w-9 place-items-center rounded-full transition-colors hover:bg-[#F5E6D0]/55"
          >
            <span className="text-[15px] text-[#5a5a5a]" aria-hidden>
              ◔
            </span>
            {VENUE.notifications > 0 && (
              <span
                className="absolute -right-0.5 -top-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-full px-[5px] font-mono text-[10px] font-semibold text-white"
                style={{ backgroundColor: "#C0392B" }}
              >
                {VENUE.notifications}
              </span>
            )}
          </button>
          <button
            type="button"
            aria-label="Settings"
            className="grid h-9 w-9 place-items-center rounded-full transition-colors hover:bg-[#F5E6D0]/55"
          >
            <span className="text-[15px] text-[#5a5a5a]" aria-hidden>
              ⚙
            </span>
          </button>

          <div className="flex items-center gap-2.5 pl-2">
            <div className="hidden text-right leading-tight md:block">
              <p
                className="text-[15px] text-[#2C2C2C]"
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontWeight: 500,
                  letterSpacing: "0.005em",
                }}
              >
                {VENUE.name}
              </p>
              {VENUE.managedBy && (
                <p className="font-mono text-[9.5px] uppercase tracking-[0.22em] text-[#9E8245]">
                  {VENUE.managedBy}
                </p>
              )}
            </div>
            <div
              className="grid h-9 w-9 place-items-center rounded-full text-[12.5px] font-medium text-[#7a5a1a]"
              style={{
                backgroundColor: "#F5E6D0",
                boxShadow: "inset 0 0 0 1px rgba(196,162,101,0.45)",
                fontFamily: "'Cormorant Garamond', serif",
              }}
            >
              {VENUE.logoInitials}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
