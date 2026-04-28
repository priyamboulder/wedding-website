"use client";

import Link from "next/link";

const DISPLAY = "'Playfair Display', Georgia, serif";
const BODY = "'DM Sans', system-ui, sans-serif";

const FOOTER_LINKS = [
  { href: "/marketplace", label: "Marketplace" },
  { href: "/stationery", label: "Stationery" },
  { href: "/platform", label: "Platform" },
  { href: "/for-vendors", label: "For Vendors" },
  { href: "/community", label: "Community" },
];

export function Footer() {
  return (
    <footer className="relative mt-32 md:mt-48">
      <div className="h-px w-full bg-[#B8755D]" />
      <div className="mx-auto max-w-[1400px] px-6 py-14 md:px-12 md:py-16">
        <div className="flex flex-col items-start justify-between gap-10 md:flex-row md:items-end md:gap-16">
          <div>
            <Link
              href="/"
              className="text-[24px] tracking-[0.04em] text-[#1C1917] transition-colors hover:text-[#B8755D]"
              style={{ fontFamily: DISPLAY, fontWeight: 500 }}
            >
              Ananya
            </Link>
            <p
              className="mt-4 max-w-[360px] text-[#A8998A]"
              style={{ fontFamily: BODY, fontSize: 14, lineHeight: 1.7 }}
            >
              The planning atelier and curated marketplace for modern Indian
              weddings.
            </p>
          </div>

          <nav
            className="flex flex-wrap items-center gap-x-8 gap-y-3 text-[13px]"
            style={{ fontFamily: BODY, letterSpacing: "0.02em" }}
          >
            {FOOTER_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[#1C1917]/70 transition-colors hover:text-[#B8755D]"
              >
                {link.label}
              </Link>
            ))}
            <a
              href="mailto:hello@ananya.wedding"
              className="text-[#1C1917]/70 transition-colors hover:text-[#B8755D]"
            >
              Contact
            </a>
          </nav>

          <span
            className="text-[11px] uppercase text-[#A8998A]"
            style={{ fontFamily: BODY, letterSpacing: "0.28em" }}
          >
            Dallas-Fort Worth · Launching 2026
          </span>
        </div>
      </div>
    </footer>
  );
}
