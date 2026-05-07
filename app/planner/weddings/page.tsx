"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  PlannerCard,
  PLANNER_PALETTE,
  ProgressBar,
  UrgencyDot,
} from "@/components/planner/ui";
import {
  weddingUrgency,
  type UpcomingWedding,
} from "@/lib/planner/seed";
import { supabaseBrowser } from "@/lib/supabase/browser-client";

// ── API shape ────────────────────────────────────────────────────────────────

type WeddingsResponse = {
  weddings: UpcomingWedding[];
};

// ── Loading skeleton ─────────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="mx-auto max-w-[1280px] px-8 py-10 animate-pulse">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="h-3 w-24 rounded bg-[#E8E0D4]" />
          <div className="mt-3 h-11 w-72 rounded bg-[#E8E0D4]" />
          <div className="mt-2 h-4 w-48 rounded bg-[#E8E0D4]" />
        </div>
        <div className="h-4 w-20 rounded bg-[#E8E0D4]" />
      </header>

      <section className="mt-8 space-y-5">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-44 rounded-2xl bg-[#E8E0D4]" />
        ))}
      </section>
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div
      className="mt-8 flex flex-col items-center justify-center py-20 text-center"
      style={{
        border: "1px dashed #E8E0D4",
        borderRadius: 12,
      }}
    >
      <p
        className="text-[30px] leading-tight text-[#2C2C2C]"
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontWeight: 500,
        }}
      >
        No weddings yet
      </p>
      <p
        className="mt-2 text-[15px] italic text-[#6a6a6a]"
        style={{ fontFamily: "'EB Garamond', serif" }}
      >
        Create a wedding from the dashboard to get started.
      </p>
      <Link
        href="/planner"
        className="mt-6 text-[12.5px] text-[#9E8245] hover:text-[#C4A265]"
      >
        ← Back to Dashboard
      </Link>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function WeddingsListPage() {
  const [token, setToken] = useState<string | null>(null);
  const [weddings, setWeddings] = useState<UpcomingWedding[]>([]);
  const [loading, setLoading] = useState(true);

  // Build a live countdown map from the fetched weddings
  const weddingCountdown: Record<string, string> = {};
  for (const w of weddings) {
    const msPerDay = 1000 * 60 * 60 * 24;
    const days = Math.round(
      (new Date(w.primaryDate).getTime() - Date.now()) / msPerDay,
    );
    weddingCountdown[w.id] =
      days < 0
        ? "Past"
        : days === 0
          ? "Today"
          : `${days} day${days === 1 ? "" : "s"} away`;
  }

  // 1. Grab auth token
  useEffect(() => {
    supabaseBrowser.auth.getSession().then(({ data }) => {
      setToken(data.session?.access_token ?? null);
    });
  }, []);

  // 2. Fetch weddings once token is available
  useEffect(() => {
    if (token === null) return;

    fetch("/api/planner/weddings", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => (r.ok ? (r.json() as Promise<WeddingsResponse>) : null))
      .then((data) => {
        if (data?.weddings) setWeddings(data.weddings);
      })
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="mx-auto max-w-[1280px] px-8 py-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[10.5px] uppercase tracking-[0.28em] text-[#C4A265]">
            All weddings
          </p>
          <h1
            className="mt-2 text-[44px] leading-[1.05] text-[#2C2C2C]"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 500,
              letterSpacing: "-0.01em",
            }}
          >
            Weddings in motion
          </h1>
          <p
            className="mt-1.5 text-[15.5px] italic text-[#6a6a6a]"
            style={{ fontFamily: "'EB Garamond', serif" }}
          >
            {weddings.length > 0
              ? `${weddings.length} active — click a wedding to open its vendor team.`
              : "No active weddings yet."}
          </p>
        </div>
        <Link
          href="/planner"
          className="text-[12.5px] text-[#9E8245] hover:text-[#C4A265]"
        >
          ← Dashboard
        </Link>
      </header>

      {weddings.length === 0 ? (
        <EmptyState />
      ) : (
        <section className="mt-8 space-y-5">
          {weddings.map((w) => (
            <WeddingRow
              key={w.id}
              wedding={w}
              countdown={weddingCountdown[w.id] ?? ""}
            />
          ))}
        </section>
      )}
    </div>
  );
}

// ── WeddingRow ────────────────────────────────────────────────────────────────

function WeddingRow({
  wedding,
  countdown,
}: {
  wedding: UpcomingWedding;
  countdown: string;
}) {
  const urgency = weddingUrgency(wedding);
  const accent =
    urgency === "critical"
      ? PLANNER_PALETTE.critical
      : urgency === "warning"
        ? PLANNER_PALETTE.warning
        : PLANNER_PALETTE.ontrack;

  return (
    <Link href={`/planner/weddings/${wedding.id}`} className="block">
      <PlannerCard className="relative overflow-hidden transition-transform hover:-translate-y-[1px]">
        <span
          aria-hidden
          className="absolute inset-y-0 left-0 w-[3px]"
          style={{ backgroundColor: accent, opacity: 0.85 }}
        />
        <div className="p-6 pl-7">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h2
                className="text-[26px] leading-tight text-[#2C2C2C]"
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontWeight: 500,
                  letterSpacing: "-0.005em",
                }}
              >
                {wedding.coupleNames}
              </h2>
              <p className="mt-1 text-[13px] text-[#5a5a5a]">
                <span className="text-[#2C2C2C]">{wedding.weddingDates}</span>
                <span className="mx-1.5 text-[#b5a68e]">·</span>
                {wedding.venue}
                <span className="mx-1.5 text-[#b5a68e]">·</span>
                {wedding.location}
              </p>
              <p className="mt-2 text-[12.5px] text-[#6a6a6a]">
                <span className="font-mono text-[11.5px] tracking-wider text-[#2C2C2C]">
                  {wedding.guestCount}
                </span>
                <span className="ml-1">guests</span>
                <span className="mx-1.5 text-[#b5a68e]">·</span>
                {wedding.events.join(", ")}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p
                className="text-[13px] font-medium tracking-wide"
                style={{ color: accent }}
              >
                {countdown}
              </p>
              <p className="mt-1 flex items-center justify-end gap-1.5 font-mono text-[10.5px] uppercase tracking-[0.22em] text-[#8a8a8a]">
                <UrgencyDot tone={urgency} />
                {urgency === "critical"
                  ? "Needs action"
                  : urgency === "warning"
                    ? "Attention"
                    : "On track"}
              </p>
            </div>
          </div>

          <div className="mt-5">
            <div className="flex items-center justify-between">
              <p className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-[#8a8a8a]">
                Vendors
              </p>
              <p className="font-mono text-[11.5px] text-[#2C2C2C]">
                {wedding.vendorsBooked}/{wedding.vendorsTotal} booked
              </p>
            </div>
            <div className="mt-2">
              <ProgressBar
                value={wedding.vendorsBooked}
                total={wedding.vendorsTotal}
                tone={urgency}
              />
            </div>
          </div>
        </div>
      </PlannerCard>
    </Link>
  );
}
