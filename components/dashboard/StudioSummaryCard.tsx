"use client";

import Link from "next/link";
import { Sparkles, Globe, Mail, Printer } from "lucide-react";

const STUDIO_SURFACES = [
  { id: "website", label: "Wedding website", icon: Globe, href: "/studio" },
  { id: "invitations", label: "Invitations", icon: Mail, href: "/studio" },
  { id: "print", label: "Print & signage", icon: Printer, href: "/studio" },
];

export function StudioSummaryCard() {
  return (
    <div className="flex flex-col border border-border bg-white">
      <div className="flex items-baseline justify-between border-b border-border px-4 py-3">
        <h3
          className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-muted"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Studio
        </h3>
        <Link
          href="/studio"
          className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint transition-colors hover:text-ink"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Open →
        </Link>
      </div>

      <div className="px-4 py-4">
        <p className="text-[13px] text-ink-muted leading-snug">
          Design your wedding brand — monogram, palette, and every public-facing surface.
        </p>
        <ul className="mt-3 space-y-1.5">
          {STUDIO_SURFACES.map(({ id, label, icon: Icon, href }) => (
            <li key={id}>
              <Link
                href={href}
                className="flex items-center gap-2.5 rounded-md border border-border px-3 py-2.5 text-[12.5px] text-ink-muted transition-colors hover:bg-ivory-warm/40 hover:text-ink"
              >
                <Icon size={13} strokeWidth={1.6} className="shrink-0 text-ink-faint" />
                <span className="flex-1">{label}</span>
                <span className="text-ink-faint">→</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="border-t border-border px-4 py-3">
        <Link
          href="/studio"
          className="inline-flex items-center gap-1.5 text-[12px] font-medium text-ink transition-colors hover:text-ink-soft"
        >
          <Sparkles size={12} strokeWidth={1.8} />
          Build your brand kit →
        </Link>
      </div>
    </div>
  );
}
