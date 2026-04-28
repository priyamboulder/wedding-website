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
    <div className="flex flex-col border border-border bg-white">
      <div className="flex items-baseline justify-between border-b border-border px-4 py-3">
        <h3
          className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-muted"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Registry
        </h3>
        <Link
          href="/registry"
          className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint transition-colors hover:text-ink"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Manage →
        </Link>
      </div>

      <div className="px-4 py-4">
        <p className="text-[13px] text-ink-muted leading-snug">
          Build your registry — traditional gifts, shagun, honeymoon fund, and more.
        </p>
        <ul className="mt-3 grid grid-cols-2 gap-2">
          {REGISTRY_TYPES.map(({ id, label, icon: Icon }) => (
            <li
              key={id}
              className="flex items-center gap-2 rounded-md border border-border bg-ivory-warm/40 px-3 py-2"
            >
              <Icon size={13} strokeWidth={1.6} className="shrink-0 text-ink-faint" />
              <span className="text-[12px] text-ink-muted">{label}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="border-t border-border px-4 py-3">
        <Link
          href="/registry"
          className="inline-flex items-center gap-1.5 text-[12px] font-medium text-ink transition-colors hover:text-ink-soft"
        >
          <Gift size={12} strokeWidth={1.8} />
          Set up your registry →
        </Link>
      </div>
    </div>
  );
}
