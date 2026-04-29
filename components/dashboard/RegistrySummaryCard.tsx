"use client";

import Link from "next/link";
import { Gift, Heart, Plane, Home } from "lucide-react";

const REGISTRY_TYPES = [
  { id: "traditional", label: "Traditional gifts", icon: Gift },
  { id: "shagun", label: "Shagun & blessings", icon: Heart },
  { id: "honeymoon", label: "Honeymoon fund", icon: Plane },
  { id: "home_fund", label: "Home fund", icon: Home },
];

export function RegistrySummaryCard() {
  return (
    <div className="playcard playcard-mint playcard-tilt-ll flex flex-col" style={{ marginTop: 10 }}>
      <div className="flex items-baseline justify-between border-b px-4 py-3" style={{ borderColor: 'rgba(100,180,140,0.2)' }}>
        <span className="playcard-label">Registry</span>
        <Link
          href="/registry"
          className="playcard-body transition-colors hover:text-pink-500"
          style={{ letterSpacing: '0.12em', textTransform: 'uppercase', fontSize: 10 }}
        >
          Manage →
        </Link>
      </div>

      <div className="px-4 py-4">
        <p className="playcard-body">
          Build your registry — traditional gifts, shagun, honeymoon fund, and more.
        </p>
        <ul className="mt-3 grid grid-cols-2 gap-2">
          {REGISTRY_TYPES.map(({ id, label, icon: Icon }) => (
            <li
              key={id}
              className="flex items-center gap-2 rounded px-3 py-2"
              style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(100,180,140,0.2)' }}
            >
              <Icon size={12} strokeWidth={1.6} style={{ color: 'var(--pink, #D4537E)', flexShrink: 0 }} />
              <span className="playcard-body" style={{ fontSize: 11 }}>{label}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="px-4 py-3" style={{ borderTop: '1px solid rgba(100,180,140,0.2)' }}>
        <Link
          href="/registry"
          className="inline-flex items-center gap-1.5 transition-colors"
          style={{ fontFamily: "var(--font-syne)", fontSize: 12, fontWeight: 600, color: 'var(--wine, #4B1528)' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--pink, #D4537E)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--wine, #4B1528)')}
        >
          <Gift size={12} strokeWidth={1.8} />
          Set up your registry →
        </Link>
      </div>
    </div>
  );
}
