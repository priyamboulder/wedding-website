"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ACTIVE_WEDDINGS } from "@/lib/vendor-portal/seed";
import { useInquiryStore } from "@/stores/inquiry-store";
import {
  PORTAL_VENDOR_ID,
  PORTAL_VENDOR_SEED,
} from "@/lib/vendor-portal/current-vendor";
import { useVendorNeedsStore } from "@/stores/vendor-needs-store";
import { checklistSlugsForPortalCategory } from "@/types/vendor-needs";

type NavItem = {
  href: string;
  label: string;
  glyph: string;
  badge?: number;
  group: "work" | "discover" | "profile" | "marketing" | "account";
};

const NAV_BASE: Omit<NavItem, "badge">[] = [
  { href: "/vendor",                   label: "Dashboard",           glyph: "◈", group: "work" },
  { href: "/vendor/inbox",             label: "Inbox",               glyph: "✉", group: "work" },
  { href: "/vendor/weddings",          label: "Weddings",            glyph: "❖", group: "work" },
  { href: "/vendor/calendar",          label: "Calendar",            glyph: "◷", group: "work" },
  { href: "/vendor/discover",          label: "Browse Brides",       glyph: "✦", group: "discover" },
  { href: "/vendor/discover/sent",     label: "Your introductions",  glyph: "➜", group: "discover" },
  { href: "/vendor/partnerships",      label: "Creator partnerships", glyph: "⌬", group: "discover" },
  { href: "/vendor/profile",           label: "My Profile",          glyph: "◐", group: "profile" },
  { href: "/vendor/portfolio",         label: "Portfolio",           glyph: "▤", group: "profile" },
  { href: "/vendor/services",          label: "Services & Packages", glyph: "◇", group: "profile" },
  { href: "/vendor/reviews",           label: "Reviews",             glyph: "★", group: "profile" },
  { href: "/vendor/social",            label: "Content Library",     glyph: "▦", group: "marketing" },
  { href: "/vendor/social/generate",   label: "Post Generator",      glyph: "✦", group: "marketing" },
  { href: "/vendor/social/reels",      label: "Reel Studio",         glyph: "▶", group: "marketing" },
  { href: "/vendor/social/posts",      label: "Published Posts",     glyph: "➤", group: "marketing" },
  { href: "/vendor/analytics",         label: "Analytics",           glyph: "◊", group: "account" },
  { href: "/vendor/settings",          label: "Settings",            glyph: "⚙", group: "account" },
];

type BadgeCounts = {
  unreadInquiries: number;
  newBrideMatches: number;
};

const BADGES: Record<string, (counts: BadgeCounts) => number | undefined> = {
  "/vendor/inbox": (c) => (c.unreadInquiries > 0 ? c.unreadInquiries : undefined),
  "/vendor/weddings": () => ACTIVE_WEDDINGS,
  "/vendor/discover": (c) =>
    c.newBrideMatches > 0 ? c.newBrideMatches : undefined,
};

const GROUP_LABEL: Record<NavItem["group"], string> = {
  work: "Today's work",
  discover: "Discover",
  profile: "Your storefront",
  marketing: "Marketing",
  account: "Account",
};

export default function VendorSidebar() {
  const pathname = usePathname();
  const unreadInquiries = useInquiryStore(
    (s) =>
      s.inquiries.filter(
        (i) => i.vendor_id === PORTAL_VENDOR_ID && i.status === "submitted",
      ).length,
  );

  // Count brides looking for the vendor's category that this vendor hasn't
  // already reached out to. Vendor's category is read from the seed snapshot
  // (the portal is single-tenant; the store hydrates from the same data).
  const newBrideMatches = useVendorNeedsStore((s) => {
    const allowed = new Set(
      checklistSlugsForPortalCategory(PORTAL_VENDOR_SEED.category),
    );
    const sentNeedIds = new Set(
      s.interests
        .filter((i) => i.vendor_id === PORTAL_VENDOR_ID)
        .map((i) => i.need_id),
    );
    return s.needs.filter(
      (n) =>
        n.status === "looking" &&
        n.is_visible_to_vendors &&
        allowed.has(n.category_slug) &&
        !sentNeedIds.has(n.id),
    ).length;
  });

  const counts: BadgeCounts = {
    unreadInquiries,
    newBrideMatches,
  };

  const NAV: NavItem[] = NAV_BASE.map((item) => ({
    ...item,
    badge: BADGES[item.href]?.(counts),
  }));

  const grouped = NAV.reduce<Record<NavItem["group"], NavItem[]>>(
    (acc, item) => {
      acc[item.group].push(item);
      return acc;
    },
    { work: [], discover: [], profile: [], marketing: [], account: [] },
  );

  return (
    <aside
      className="sticky top-0 flex h-screen w-[248px] shrink-0 flex-col border-r"
      style={{
        backgroundColor: "#F3EEE1",
        borderColor: "rgba(44,44,44,0.08)",
      }}
    >
      {/* Workspace header */}
      <div
        className="border-b px-5 py-6"
        style={{ borderColor: "rgba(44,44,44,0.06)" }}
      >
        <p
          className="font-mono text-[10px] uppercase tracking-[0.28em]"
          style={{ color: "#9E8245" }}
        >
          Vendor workspace
        </p>
        <h2
          className="mt-2 text-[26px] leading-tight text-[#2C2C2C]"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 500,
            letterSpacing: "-0.01em",
          }}
        >
          Aurora Studios
        </h2>
        <p
          className="mt-0.5 text-[13px] italic text-[#6a6a6a]"
          style={{ fontFamily: "'EB Garamond', serif" }}
        >
          Photography · Mumbai
        </p>
      </div>

      {/* Nav groups */}
      <nav className="sidebar-scroll flex-1 overflow-y-auto px-2.5 py-4">
        {(Object.keys(grouped) as NavItem["group"][]).map((group) => (
          <div key={group} className="mb-5 last:mb-0">
            <p
              className="mb-1 px-3 font-mono text-[10px] uppercase tracking-[0.24em]"
              style={{ color: "#b5a68e" }}
            >
              {GROUP_LABEL[group]}
            </p>
            <ul className="flex flex-col gap-0.5">
              {grouped[group].map((item) => {
                const hasMoreSpecificSibling = NAV.some(
                  (other) =>
                    other.href !== item.href &&
                    other.href.startsWith(item.href + "/"),
                );
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/vendor" &&
                    !hasMoreSpecificSibling &&
                    pathname.startsWith(item.href + "/"));
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`group flex items-center gap-3 rounded-md px-3 py-1.5 text-[13.5px] transition-colors ${
                        isActive
                          ? "bg-white text-[#2C2C2C] shadow-[0_1px_0_rgba(44,44,44,0.05)]"
                          : "text-[#6a6a6a] hover:bg-white/60 hover:text-[#2C2C2C]"
                      }`}
                    >
                      <span
                        className={`w-3.5 text-center text-[13px] ${
                          isActive ? "text-[#C4A265]" : "text-[#b5a68e]"
                        }`}
                        aria-hidden
                      >
                        {item.glyph}
                      </span>
                      <span className="flex-1 truncate">{item.label}</span>
                      {item.badge ? (
                        <span
                          className={`min-w-[20px] rounded-full px-1.5 py-[1px] text-center text-[10.5px] font-semibold leading-4 ${
                            isActive
                              ? "bg-[#C4A265] text-[#FAF8F5]"
                              : "bg-[#2C2C2C] text-[#FAF8F5]"
                          }`}
                        >
                          {item.badge}
                        </span>
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer — quick help */}
      <div
        className="border-t px-5 py-4"
        style={{ borderColor: "rgba(44,44,44,0.06)" }}
      >
        <Link
          href="/vendor/settings"
          className="group flex items-start gap-3 rounded-md p-2 text-left transition-colors hover:bg-white/60"
        >
          <span
            className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full text-[13px]"
            style={{ backgroundColor: "#F5E6D0", color: "#9E8245" }}
          >
            ?
          </span>
          <div className="min-w-0">
            <p className="text-[12.5px] font-medium text-[#2C2C2C]">
              Need help?
            </p>
            <p
              className="truncate text-[11.5px] italic text-[#8a8a8a]"
              style={{ fontFamily: "'EB Garamond', serif" }}
            >
              Your success partner is Meera.
            </p>
          </div>
        </Link>
      </div>
    </aside>
  );
}
