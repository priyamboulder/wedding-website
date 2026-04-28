"use client";

// ── /portal-hub route ──────────────────────────────────────────────────────
// Platform-wide command center. Expandable cards for all four Ananya portals.
// Each module is a Next.js <Link> that routes to the real module page (or a
// placeholder page if the module hasn't been built yet).

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  PORTALS,
  STATUS_COPY,
  type ModuleStatus,
  type Portal,
} from "@/lib/portal-hub/portals";

export default function PortalHubPage() {
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => ({
    public: true,
    couple: true,
    vendor: false,
    seller: false,
  }));

  const totals = useMemo(() => {
    const all = PORTALS.flatMap((p) => p.modules);
    return {
      total: all.length,
      inProgress: all.filter((m) => m.status === "in-progress").length,
      complete: all.filter((m) => m.status === "complete").length,
      notStarted: all.filter((m) => m.status === "not-started").length,
    };
  }, []);

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: "#FFFFF0",
        fontFamily: "'DM Sans', system-ui, sans-serif",
        color: "#2a2a2a",
      }}
    >
      {/* Top editorial header */}
      <header className="border-b border-[#D4AF37]/20 bg-gradient-to-b from-[#F7E7CE]/40 to-transparent">
        <div className="mx-auto max-w-7xl px-10 py-14">
          <div className="flex items-end justify-between gap-10">
            <div>
              <p className="text-[11px] uppercase tracking-[0.3em] text-[#7a5a16]">
                Ananya · Platform Command Center
              </p>
              <h1
                className="mt-3 text-6xl font-medium text-[#1a1a1a]"
                style={{ fontFamily: "'Cormorant Garamond', serif", letterSpacing: "-0.01em" }}
              >
                Portal Hub
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-stone-600">
                A single architectural view of every Ananya surface — public site, couple
                suite, vendor back office, and marketplace seller portal. Expand a portal
                to see its modules, then click to open.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <Stat label="Total modules" value={totals.total} />
              <Stat label="In progress" value={totals.inProgress} accent />
              <Stat label="Complete" value={totals.complete} />
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-10 py-12">
        <div className="flex flex-col gap-6">
          {PORTALS.map((portal) => (
            <PortalCard
              key={portal.id}
              portal={portal}
              isOpen={!!expanded[portal.id]}
              onToggle={() =>
                setExpanded((prev) => ({ ...prev, [portal.id]: !prev[portal.id] }))
              }
            />
          ))}
        </div>

        {/* Legend */}
        <div className="mt-10 flex flex-wrap items-center gap-6 rounded-xl border border-[#D4AF37]/25 bg-white px-6 py-4 text-xs text-stone-600">
          <p className="text-[10px] uppercase tracking-[0.24em] text-[#7a5a16]">Legend</p>
          <LegendRow status="not-started" />
          <LegendRow status="in-progress" />
          <LegendRow status="complete" />
        </div>
      </main>

      <footer className="border-t border-[#D4AF37]/20 bg-gradient-to-b from-transparent to-[#F7E7CE]/30">
        <div className="mx-auto max-w-7xl px-10 py-8 text-center">
          <p
            className="text-base italic text-stone-500"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Ananya — the luxury Indian wedding platform.
          </p>
        </div>
      </footer>
    </div>
  );
}

function PortalCard({
  portal,
  isOpen,
  onToggle,
}: {
  portal: Portal;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const built = portal.modules.filter((m) => m.status === "complete").length;
  const progress = portal.modules.filter((m) => m.status === "in-progress").length;

  return (
    <section className="overflow-hidden rounded-2xl border border-[#D4AF37]/25 bg-white shadow-[0_1px_0_rgba(212,175,55,0.08),0_20px_60px_-30px_rgba(26,26,26,0.15)]">
      {/* Card header (toggle) */}
      <button
        type="button"
        onClick={onToggle}
        className={`group w-full bg-gradient-to-r ${portal.accent} px-8 py-7 text-left transition-all hover:brightness-[1.02]`}
      >
        <div className="flex items-center justify-between gap-6">
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline gap-4">
              <h2
                className="text-3xl font-medium text-[#1a1a1a]"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                {portal.name}
              </h2>
              <span className="font-mono text-[11px] uppercase tracking-wider text-[#7a5a16]">
                {portal.subdomain} · {portal.basePath}
              </span>
            </div>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-stone-700">
              {portal.tagline}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-stone-600">
              <MetaRow label="Who" value={portal.userType} />
              <MetaRow label="Auth" value={portal.auth} />
            </div>
          </div>
          <div className="flex flex-col items-end gap-3">
            <div className="flex items-center gap-2 rounded-full bg-white/70 px-4 py-1.5 text-xs ring-1 ring-[#D4AF37]/30">
              <span className="font-mono text-[#7a5a16]">
                {built + progress}/{portal.modules.length}
              </span>
              <span className="text-stone-500">modules started</span>
            </div>
            <span
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[#D4AF37]/40 bg-white text-[#7a5a16] transition-transform group-hover:scale-105"
              aria-hidden
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
              >
                <path
                  d="M2 4l4 4 4-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </div>
        </div>
      </button>

      {/* Module list */}
      {isOpen && (
        <div className="border-t border-[#D4AF37]/20 bg-[#FFFFF0]/60">
          <ul className="divide-y divide-[#D4AF37]/15">
            {portal.modules.map((mod) => {
              const status = STATUS_COPY[mod.status];
              return (
                <li key={mod.href}>
                  <Link
                    href={mod.href}
                    className="group flex items-start gap-5 px-8 py-5 transition-colors hover:bg-[#F7E7CE]/30"
                  >
                    <span
                      className={`mt-2 h-2 w-2 shrink-0 rounded-full ${status.dot}`}
                      aria-hidden
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3
                          className="text-xl font-medium text-[#1a1a1a]"
                          style={{ fontFamily: "'Cormorant Garamond', serif" }}
                        >
                          {mod.name}
                        </h3>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider ${status.chip}`}
                        >
                          {status.label}
                        </span>
                        <span className="font-mono text-[10px] uppercase tracking-wider text-stone-400">
                          {mod.href}
                        </span>
                      </div>
                      <p className="mt-1 text-sm leading-relaxed text-stone-600">
                        {mod.description}
                      </p>
                    </div>
                    <span className="mt-2 text-xs text-stone-400 transition-colors group-hover:text-[#7a5a16]">
                      Open →
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </section>
  );
}

function Stat({ label, value, accent = false }: { label: string; value: number; accent?: boolean }) {
  return (
    <div
      className={`min-w-[96px] rounded-xl border px-4 py-3 ${
        accent ? "border-[#D4AF37]/50 bg-white" : "border-[#D4AF37]/25 bg-white/70"
      }`}
    >
      <p
        className={`text-3xl font-medium ${accent ? "text-[#7a5a16]" : "text-[#1a1a1a]"}`}
        style={{ fontFamily: "'Cormorant Garamond', serif" }}
      >
        {value}
      </p>
      <p className="mt-0.5 text-[10px] uppercase tracking-wider text-stone-500">
        {label}
      </p>
    </div>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <span className="flex items-center gap-2">
      <span className="font-mono text-[10px] uppercase tracking-wider text-[#7a5a16]">
        {label}
      </span>
      <span className="text-stone-700">{value}</span>
    </span>
  );
}

function LegendRow({ status }: { status: ModuleStatus }) {
  const s = STATUS_COPY[status];
  return (
    <div className="flex items-center gap-2 text-xs text-stone-600">
      <span className={`h-2 w-2 rounded-full ${s.dot}`} aria-hidden />
      <span className="uppercase tracking-wider">{s.label}</span>
    </div>
  );
}
