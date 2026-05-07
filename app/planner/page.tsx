"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase/browser-client";
import {
  weddingUrgency,
  type ActivityItem,
  type UpcomingWedding,
  type WeddingAlert,
} from "@/lib/planner/seed";

const COLORS = {
  bg: "#FFFDF9",
  ink: "#1A1A1A",
  inkSoft: "#6B6155",
  hairline: "#E8E0D4",
  gold: "#C4A265",
  goldDeep: "#9E8245",
  urgent: "#B8860B",
} as const;

const SERIF = "'Cormorant Garamond', serif";
const SERIF_IT = "'EB Garamond', serif";

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

// ── API response shapes ─────────────────────────────────────────────────────

type DashboardStats = {
  totalClients: number;
  activeWeddings: number;
  upcomingThisMonth: number;
  pendingTasks: number;
};

type DashboardResponse = {
  stats: DashboardStats;
  upcomingWeddings: UpcomingWedding[];
  recentActivity: ActivityItem[];
};

type ProfileResponse = {
  profile: {
    display_name?: string;
    [key: string]: unknown;
  } | null;
};

// ── Loading skeleton ────────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div
      style={{ backgroundColor: COLORS.bg, color: COLORS.ink }}
      className="min-h-screen"
    >
      <div className="mx-auto max-w-[1280px] px-8 py-12 animate-pulse">
        {/* Welcome skeleton */}
        <section className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div
              className="h-3 w-32 rounded"
              style={{ backgroundColor: COLORS.hairline }}
            />
            <div
              className="mt-4 h-12 w-80 rounded"
              style={{ backgroundColor: COLORS.hairline }}
            />
            <div
              className="mt-3 h-4 w-64 rounded"
              style={{ backgroundColor: COLORS.hairline }}
            />
          </div>
          <div
            className="h-6 w-24 rounded"
            style={{ backgroundColor: COLORS.hairline }}
          />
        </section>

        {/* Stat strip skeleton */}
        <section className="mt-12 grid grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="px-6 py-2 first:pl-0 last:pr-0"
              style={{
                borderLeft: i === 0 ? "none" : `1px solid ${COLORS.hairline}`,
              }}
            >
              <div
                className="h-3 w-28 rounded"
                style={{ backgroundColor: COLORS.hairline }}
              />
              <div
                className="mt-4 h-10 w-16 rounded"
                style={{ backgroundColor: COLORS.hairline }}
              />
              <div
                className="mt-3 h-3 w-36 rounded"
                style={{ backgroundColor: COLORS.hairline }}
              />
            </div>
          ))}
        </section>

        {/* Cards skeleton */}
        <section className="mt-14 grid grid-cols-1 gap-12 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {[0, 1].map((i) => (
              <div
                key={i}
                className="h-52 rounded"
                style={{ backgroundColor: COLORS.hairline }}
              />
            ))}
          </div>
          <div>
            <div
              className="h-96 rounded"
              style={{ backgroundColor: COLORS.hairline }}
            />
          </div>
        </section>
      </div>
    </div>
  );
}

// ── Main page ───────────────────────────────────────────────────────────────

export default function PlannerDashboardPage() {
  const [token, setToken] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(null);
  const [displayName, setDisplayName] = useState<string>("Planner");
  const [loading, setLoading] = useState(true);

  // 1. Grab auth token
  useEffect(() => {
    supabaseBrowser.auth.getSession().then(({ data }) => {
      setToken(data.session?.access_token ?? null);
    });
  }, []);

  // 2. Fetch dashboard + profile once we have a token
  useEffect(() => {
    if (token === null) return;

    const headers = { Authorization: `Bearer ${token}` };

    Promise.all([
      fetch("/api/planner/dashboard", { headers }).then((r) =>
        r.ok ? (r.json() as Promise<DashboardResponse>) : null,
      ),
      fetch("/api/planner/profile", { headers }).then((r) =>
        r.ok ? (r.json() as Promise<ProfileResponse>) : null,
      ),
    ])
      .then(([dash, prof]) => {
        if (dash) setDashboardData(dash);
        if (prof?.profile?.display_name) {
          setDisplayName(prof.profile.display_name);
        }
      })
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <LoadingSkeleton />;

  const upcomingWeddings = dashboardData?.upcomingWeddings ?? [];
  const recentActivity = dashboardData?.recentActivity ?? [];
  const stats = dashboardData?.stats ?? null;

  // Build a countdown map from API data (days until primaryDate)
  const weddingCountdown: Record<string, string> = {};
  for (const w of upcomingWeddings) {
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

  // Derive first name from display_name
  const firstName = displayName.split(" ")[0] ?? displayName;

  return (
    <div
      style={{ backgroundColor: COLORS.bg, color: COLORS.ink }}
      className="min-h-screen"
    >
      <div className="mx-auto max-w-[1280px] px-8 py-12">
        {/* Welcome */}
        <section className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p
              className="text-[10.5px] uppercase"
              style={{
                color: COLORS.gold,
                letterSpacing: "0.3em",
                fontVariant: "small-caps",
              }}
            >
              Planner Workspace
            </p>
            <h1
              className="mt-3 text-[46px] leading-[1.05]"
              style={{
                fontFamily: SERIF,
                fontWeight: 500,
                letterSpacing: "-0.01em",
                color: COLORS.ink,
              }}
            >
              {greeting()}, {firstName}
            </h1>
            <p
              className="mt-2 text-[16px] italic"
              style={{ fontFamily: SERIF_IT, color: COLORS.inkSoft }}
            >
              {upcomingWeddings.length > 0
                ? `${upcomingWeddings.length} wedding${upcomingWeddings.length === 1 ? "" : "s"} in motion.`
                : "No weddings yet — create one to get started."}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span
              className="h-px w-10"
              style={{ backgroundColor: COLORS.gold, opacity: 0.6 }}
            />
            <span
              className="text-[22px]"
              style={{
                fontFamily: SERIF,
                color: COLORS.gold,
                fontWeight: 500,
                letterSpacing: "0.06em",
              }}
            >
              {new Date().toLocaleDateString("en-US", {
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
        </section>

        {/* Stat row */}
        <StatStrip stats={stats} />

        {/* Two-col: weddings + activity */}
        <section className="mt-14 grid grid-cols-1 gap-12 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <SectionHeader
              title="Upcoming Weddings"
              actionHref="/planner/weddings"
              actionLabel="View all →"
            />
            {upcomingWeddings.length === 0 ? (
              <div
                className="mt-6 flex flex-col items-center justify-center py-16 text-center"
                style={{
                  border: `1px dashed ${COLORS.hairline}`,
                }}
              >
                <p
                  className="text-[28px]"
                  style={{ fontFamily: SERIF, color: COLORS.inkSoft }}
                >
                  No upcoming weddings
                </p>
                <p
                  className="mt-2 text-[14px] italic"
                  style={{ fontFamily: SERIF_IT, color: COLORS.inkSoft }}
                >
                  Add a wedding to see it here.
                </p>
              </div>
            ) : (
              <div className="mt-6 space-y-6">
                {upcomingWeddings.map((w) => (
                  <WeddingCard
                    key={w.id}
                    wedding={w}
                    countdown={weddingCountdown[w.id] ?? ""}
                  />
                ))}
              </div>
            )}
          </div>
          <div>
            <SectionHeader title="Recent Activity" />
            <div className="mt-6">
              {recentActivity.length === 0 ? (
                <p
                  className="text-[14px] italic"
                  style={{ fontFamily: SERIF_IT, color: COLORS.inkSoft }}
                >
                  No recent activity yet.
                </p>
              ) : (
                <ActivityFeed items={recentActivity} />
              )}
            </div>
          </div>
        </section>

        {/* Bottom action bar */}
        <QuickActionsBar />
      </div>
    </div>
  );
}

// ── StatStrip ───────────────────────────────────────────────────────────────

function StatStrip({ stats }: { stats: DashboardStats | null }) {
  const rows = [
    {
      label: "Active Weddings",
      value: stats?.activeWeddings ?? "—",
      sub: null,
    },
    {
      label: "Upcoming This Month",
      value: stats?.upcomingThisMonth ?? "—",
      sub: null,
    },
    {
      label: "Total Clients",
      value: stats?.totalClients ?? "—",
      sub: null,
    },
    {
      label: "Pending Tasks",
      value: stats?.pendingTasks ?? "—",
      sub: null,
    },
  ];

  return (
    <section className="mt-12 grid grid-cols-2 lg:grid-cols-4">
      {rows.map((s, i) => (
        <div
          key={s.label}
          className="px-6 py-2 first:pl-0 last:pr-0"
          style={{
            borderLeft:
              i === 0 ? "none" : `1px solid ${COLORS.hairline}`,
          }}
        >
          <p
            className="text-[10.5px] uppercase"
            style={{
              color: COLORS.inkSoft,
              letterSpacing: "0.26em",
              fontVariant: "small-caps",
            }}
          >
            {s.label}
          </p>
          <p
            className="mt-3 text-[44px] leading-none"
            style={{
              fontFamily: SERIF,
              fontWeight: 500,
              letterSpacing: "-0.02em",
              color: COLORS.ink,
            }}
          >
            {s.value}
          </p>
          {s.sub && (
            <p
              className="mt-3 text-[12.5px] italic"
              style={{ fontFamily: SERIF_IT, color: COLORS.inkSoft }}
            >
              {s.sub}
            </p>
          )}
        </div>
      ))}
    </section>
  );
}

// ── SectionHeader ───────────────────────────────────────────────────────────

function SectionHeader({
  title,
  actionHref,
  actionLabel,
}: {
  title: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div
      className="flex items-end justify-between gap-4 pb-4"
      style={{ borderBottom: `1px solid ${COLORS.hairline}` }}
    >
      <h2
        className="text-[28px] leading-none"
        style={{
          fontFamily: SERIF,
          fontWeight: 500,
          letterSpacing: "-0.01em",
          color: COLORS.ink,
        }}
      >
        {title}
      </h2>
      {actionHref && actionLabel && (
        <Link
          href={actionHref}
          className="text-[12.5px]"
          style={{ color: COLORS.goldDeep }}
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}

// ── WeddingCard ─────────────────────────────────────────────────────────────

function WeddingCard({
  wedding,
  countdown,
}: {
  wedding: UpcomingWedding;
  countdown: string;
}) {
  const urgency = weddingUrgency(wedding);
  const accent =
    urgency === "critical"
      ? COLORS.urgent
      : urgency === "warning"
        ? COLORS.gold
        : COLORS.inkSoft;

  return (
    <article
      className="relative"
      style={{
        border: `1px solid ${COLORS.hairline}`,
        borderRadius: 0,
        backgroundColor: COLORS.bg,
      }}
    >
      {/* Sharp-edged accent bar */}
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 w-[3px]"
        style={{ backgroundColor: accent }}
      />
      <div className="p-7 pl-8">
        {/* Row 1: names + countdown */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h3
              className="text-[30px] leading-tight"
              style={{
                fontFamily: SERIF,
                fontWeight: 500,
                letterSpacing: "-0.005em",
                color: COLORS.ink,
              }}
            >
              {wedding.coupleNames}
            </h3>
            <p
              className="mt-1.5 text-[13px]"
              style={{ color: COLORS.inkSoft }}
            >
              <span style={{ color: COLORS.ink }}>{wedding.weddingDates}</span>
              <span className="mx-2" style={{ color: COLORS.hairline }}>
                |
              </span>
              {wedding.venue}
              <span className="mx-2" style={{ color: COLORS.hairline }}>
                |
              </span>
              {wedding.location}
            </p>
            {wedding.destination && (
              <p
                className="mt-2 text-[12.5px] italic"
                style={{ fontFamily: SERIF_IT, color: COLORS.goldDeep }}
              >
                Destination wedding
              </p>
            )}
            <p
              className="mt-3 text-[12.5px]"
              style={{ color: COLORS.inkSoft }}
            >
              <span
                className="text-[12.5px]"
                style={{ color: COLORS.ink, fontFamily: SERIF }}
              >
                {wedding.guestCount}
              </span>
              <span className="ml-1">guests</span>
              <span className="mx-2" style={{ color: COLORS.hairline }}>
                |
              </span>
              {wedding.events.join(", ")}
            </p>
          </div>

          <div className="shrink-0 text-right">
            <p
              className="text-[14px]"
              style={{
                color: accent,
                fontFamily: SERIF,
                fontStyle: urgency === "critical" ? "italic" : "normal",
                letterSpacing: "0.02em",
              }}
            >
              {countdown}
            </p>
            {urgency !== "ontrack" && (
              <p
                className="mt-1 text-[13px] italic"
                style={{
                  fontFamily: SERIF_IT,
                  color:
                    urgency === "critical" ? COLORS.urgent : COLORS.goldDeep,
                }}
              >
                {urgency === "critical" ? "Needs action" : "Attention"}
              </p>
            )}
          </div>
        </div>

        {/* Progress — typographic fraction + sharp 2px gold bar */}
        <div className="mt-6">
          <div className="flex items-baseline justify-between">
            <p
              className="text-[10.5px] uppercase"
              style={{
                color: COLORS.inkSoft,
                letterSpacing: "0.26em",
                fontVariant: "small-caps",
              }}
            >
              Vendors
            </p>
            <p
              className="text-[15px]"
              style={{ fontFamily: SERIF, color: COLORS.ink }}
            >
              {wedding.vendorsBooked} of {wedding.vendorsTotal} booked
            </p>
          </div>
          <div
            className="mt-3 h-[2px] w-full"
            style={{ backgroundColor: COLORS.hairline }}
          >
            <div
              className="h-full"
              style={{
                width: `${
                  wedding.vendorsTotal === 0
                    ? 0
                    : Math.round(
                        (wedding.vendorsBooked / wedding.vendorsTotal) * 100,
                      )
                }%`,
                backgroundColor: COLORS.gold,
              }}
            />
          </div>
        </div>

        {/* Alerts */}
        {(wedding.missingVendors.length > 0 || wedding.alerts.length > 0) && (
          <div className="mt-5 space-y-1.5">
            {wedding.missingVendors.length > 0 && (
              <MissingLine
                missing={wedding.missingVendors}
                tone={urgency === "critical" ? "critical" : "warning"}
              />
            )}
            {wedding.alerts.map((a, i) => (
              <AlertLine key={i} alert={a} />
            ))}
          </div>
        )}

        {/* Open — text link, no button */}
        <div className="mt-7 flex items-center justify-between gap-3">
          <p
            className="text-[11.5px] italic"
            style={{ fontFamily: SERIF_IT, color: COLORS.inkSoft }}
          >
            Last updated today, 9:14am
          </p>
          <Link
            href={`/planner/weddings/${wedding.id}`}
            className="inline-flex items-center gap-2 text-[12.5px]"
            style={{
              color: COLORS.ink,
              fontFamily: SERIF,
              fontWeight: 500,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              borderBottom: `1px solid ${COLORS.ink}`,
              paddingBottom: 2,
            }}
          >
            Open Wedding
            <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </article>
  );
}

// ── MissingLine ─────────────────────────────────────────────────────────────

function MissingLine({
  missing,
  tone,
}: {
  missing: string[];
  tone: "critical" | "warning";
}) {
  const truncated = missing.length > 5 ? missing.slice(0, 4) : missing;
  const extra = missing.length - truncated.length;
  const color = tone === "critical" ? COLORS.urgent : COLORS.goldDeep;

  return (
    <p
      className="text-[12.5px] italic"
      style={{ fontFamily: SERIF_IT, color }}
    >
      <span style={{ fontStyle: "normal", color: COLORS.ink }}>Missing — </span>
      <span style={{ color: COLORS.inkSoft }}>
        {truncated.join(", ")}
        {extra > 0 && ` +${extra} more`}
      </span>
    </p>
  );
}

// ── AlertLine ───────────────────────────────────────────────────────────────

function AlertLine({ alert }: { alert: WeddingAlert }) {
  const color =
    alert.kind === "critical" ? COLORS.urgent : COLORS.goldDeep;
  return (
    <p
      className="text-[12.5px] italic"
      style={{ fontFamily: SERIF_IT, color }}
    >
      {alert.label}
    </p>
  );
}

// ── ActivityFeed ────────────────────────────────────────────────────────────

function ActivityFeed({ items }: { items: ActivityItem[] }) {
  const grouped = items.reduce<Record<string, ActivityItem[]>>((acc, it) => {
    (acc[it.day] ||= []).push(it);
    return acc;
  }, {});
  const days = Object.keys(grouped);

  return (
    <div>
      {days.map((day, dayIdx) => (
        <div key={day} className={dayIdx === 0 ? "" : "mt-8"}>
          <p
            className="text-[10.5px] uppercase"
            style={{
              color: COLORS.goldDeep,
              letterSpacing: "0.3em",
              fontVariant: "small-caps",
            }}
          >
            {day}
          </p>
          <ul
            className="mt-3"
            style={{
              borderTop: `1px solid ${COLORS.hairline}`,
              borderBottom: `1px solid ${COLORS.hairline}`,
            }}
          >
            {grouped[day].map((item, i) => (
              <li
                key={item.id}
                style={
                  i === 0
                    ? undefined
                    : { borderTop: `1px solid ${COLORS.hairline}` }
                }
              >
                <ActivityRow item={item} />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

const ACTIVITY_LABEL: Record<ActivityItem["kind"], string> = {
  booking: "Booking",
  proposal: "Proposal",
  inquiry: "Inquiry",
  recommendation: "Recommendation",
  contract: "Contract",
  shortlist: "Shortlist",
};

function ActivityRow({ item }: { item: ActivityItem }) {
  return (
    <div className="py-4">
      <p
        className="text-[10px] uppercase"
        style={{
          color: COLORS.gold,
          letterSpacing: "0.28em",
          fontVariant: "small-caps",
        }}
      >
        {ACTIVITY_LABEL[item.kind]}
      </p>
      <p
        className="mt-2 text-[13.5px] leading-snug"
        style={{ color: COLORS.ink }}
      >
        {item.couple && (
          <span style={{ fontWeight: 600 }}>{item.couple}</span>
        )}
        {item.couple && <span> — </span>}
        <span style={{ color: COLORS.inkSoft, fontWeight: 400 }}>
          {item.text}
        </span>
      </p>
      {typeof item.amount === "number" && (
        <p
          className="mt-1.5 text-[18px] leading-none"
          style={{
            fontFamily: SERIF,
            fontWeight: 500,
            color: COLORS.ink,
            letterSpacing: "-0.01em",
          }}
        >
          ${item.amount.toLocaleString()}
        </p>
      )}
    </div>
  );
}

// ── QuickActionsBar ─────────────────────────────────────────────────────────

function QuickActionsBar() {
  return (
    <div className="mt-16 flex items-center justify-center">
      <div
        className="flex items-stretch"
        style={{ border: `1px solid ${COLORS.ink}` }}
      >
        <QuickAction label="New Wedding" />
        <QuickAction label="Invite Couple" divided />
        <QuickAction label="Find Vendor" divided />
      </div>
    </div>
  );
}

function QuickAction({
  label,
  divided,
}: {
  label: string;
  divided?: boolean;
}) {
  return (
    <button
      type="button"
      className="px-7 py-3 text-[12.5px] transition-colors"
      style={{
        color: COLORS.ink,
        fontFamily: SERIF,
        fontWeight: 500,
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        backgroundColor: "transparent",
        borderLeft: divided ? `1px solid ${COLORS.ink}` : "none",
        borderRadius: 0,
      }}
    >
      {label}
    </button>
  );
}
