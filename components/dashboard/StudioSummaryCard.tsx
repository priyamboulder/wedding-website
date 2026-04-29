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
    <div className="playcard playcard-lavender playcard-tilt-rr flex flex-col" style={{ marginTop: 10 }}>
      <div className="flex items-baseline justify-between border-b px-4 py-3" style={{ borderColor: 'rgba(140,100,200,0.15)' }}>
        <span className="playcard-label">Studio</span>
        <Link
          href="/studio"
          className="playcard-body transition-colors hover:text-pink-500"
          style={{ letterSpacing: '0.12em', textTransform: 'uppercase', fontSize: 10 }}
        >
          Open →
        </Link>
      </div>

      <div className="px-4 py-4">
        <p className="playcard-body">
          Design your wedding brand — monogram, palette, and every public-facing surface.
        </p>
        <ul className="mt-3 space-y-1.5">
          {STUDIO_SURFACES.map(({ id, label, icon: Icon, href }) => (
            <li key={id}>
              <Link
                href={href}
                className="flex items-center gap-2.5 rounded px-3 py-2 transition-colors"
                style={{ background: 'rgba(255,255,255,0.55)', border: '1px solid rgba(140,100,200,0.15)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.85)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.55)')}
              >
                <Icon size={12} strokeWidth={1.6} style={{ color: 'var(--pink, #D4537E)', flexShrink: 0 }} />
                <span className="flex-1 playcard-body" style={{ fontSize: 12 }}>{label}</span>
                <span className="playcard-body" style={{ fontSize: 11 }}>→</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="px-4 py-3" style={{ borderTop: '1px solid rgba(140,100,200,0.15)' }}>
        <Link
          href="/studio"
          className="inline-flex items-center gap-1.5 transition-colors"
          style={{ fontFamily: "var(--font-syne)", fontSize: 12, fontWeight: 600, color: 'var(--wine, #4B1528)' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--pink, #D4537E)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--wine, #4B1528)')}
        >
          <Sparkles size={12} strokeWidth={1.8} />
          Build your brand kit →
        </Link>
      </div>
    </div>
  );
}
