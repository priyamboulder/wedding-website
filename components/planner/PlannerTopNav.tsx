"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PLANNER } from "@/lib/planner/seed";
import { NotificationBell } from "@/components/shell/NotificationBell";

const NAV = [
  { href: "/planner", label: "Dashboard" },
  { href: "/planner/weddings", label: "Weddings" },
  { href: "/planner/vendors", label: "My Vendors" },
  { href: "/planner/clients", label: "Clients" },
  { href: "/planner/profile", label: "Profile" },
  { href: "/planner/analytics", label: "Analytics" },
  { href: "/planner/messages", label: "Messages" },
  { href: "/planner/tools", label: "Tools" },
];

export default function PlannerTopNav() {
  const pathname = usePathname();

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
        <Link href="/planner" className="flex items-baseline gap-2.5">
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
            Planner
          </span>
        </Link>

        {/* Tabs */}
        <nav className="ml-4 hidden flex-1 items-center gap-1 lg:flex">
          {NAV.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/planner" && pathname.startsWith(item.href + "/"));
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

        {/* Right cluster */}
        <div className="flex items-center gap-3">
          <NotificationBell recipient="planner" variant="planner" />
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
              <p className="text-[13px] font-medium text-[#2C2C2C]">
                {PLANNER.firstName} {PLANNER.lastName}
              </p>
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#8a8a8a]">
                {PLANNER.company}
              </p>
            </div>
            <div
              className="grid h-9 w-9 place-items-center rounded-full text-[12.5px] font-medium text-[#7a5a1a]"
              style={{
                backgroundColor: "#F5E6D0",
                boxShadow: "inset 0 0 0 1px rgba(196,162,101,0.45)",
                fontFamily: "'Cormorant Garamond', serif",
              }}
            >
              {PLANNER.initials}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
