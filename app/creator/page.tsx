"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import {
  Layers,
  BookOpen,
  Zap,
  Handshake,
  PlusCircle,
  Clock,
  Sparkles,
  Star,
  UserCircle,
  TrendingUp,
} from "lucide-react";
import { useCurrentCreator, useMyCollections, useMyGuides, formatUsd, formatCompact } from "@/lib/creators/current-creator";
import { useCreatorsStore } from "@/stores/creators-store";
import { useDropsStore } from "@/stores/drops-store";
import { useMatchingStore } from "@/stores/matching-store";
import { usePartnershipsStore } from "@/stores/partnerships-store";
import { useNotificationsStore } from "@/stores/notifications-store";
import {
  PortalPageHeader,
  PortalStatCard,
} from "@/components/creator-portal/PortalPageHeader";
import { dropTimeRemaining, getDropTimingStatus } from "@/types/drop";

export default function CreatorHomePage() {
  const creator = useCurrentCreator();
  const earnings = useCreatorsStore(
    useShallow((s) =>
      creator ? s.earningsForCreator(creator.id) : null,
    ),
  );
  const myCollections = useMyCollections();
  const myGuides = useMyGuides();
  const myDrops = useDropsStore(
    useShallow((s) =>
      creator ? s.getDropsByCreator(creator.id) : [],
    ),
  );
  const dropItems = useDropsStore((s) => s.items);
  const bookings = useMatchingStore(
    useShallow((s) =>
      creator ? s.listBookingsForCreator(creator.id) : [],
    ),
  );
  const consultStats = useMatchingStore(
    useShallow((s) =>
      creator
        ? s.creatorConsultationStats(creator.id)
        : { totalConsultations: 0, averageRating: 0, totalEarnings: 0, pendingPayout: 0 },
    ),
  );
  const partnershipStats = usePartnershipsStore(
    useShallow((s) =>
      creator
        ? s.statsForCreator(creator.id)
        : { completed: 0, active: 0, pending: 0, totalEarned: 0 },
    ),
  );
  const notifications = useNotificationsStore((s) => s.notifications);

  const activity = useMemo(() => {
    if (!creator) return [];
    // Build recent-activity feed from heterogeneous sources.
    type Item = {
      key: string;
      title: string;
      detail: string;
      timestamp: string;
      href: string;
    };
    const items: Item[] = [];

    for (const b of bookings.slice(0, 5)) {
      items.push({
        key: `b-${b.id}`,
        title: b.status === "requested" ? "New consultation booking" : `Booking ${b.status}`,
        detail: `From ${initialsFromId(b.coupleUserId)} · ${labelForServiceStatus(b.status)}`,
        timestamp: b.createdAt,
        href: "/creator/consultations",
      });
    }
    for (const n of notifications.slice(0, 10)) {
      if (
        n.type.startsWith("partnership_") ||
        n.type.startsWith("drop_") ||
        n.type === "review_received"
      ) {
        items.push({
          key: `n-${n.id}`,
          title: n.title,
          detail: n.body,
          timestamp: n.created_at,
          href: n.link || "/creator/notifications",
        });
      }
    }
    for (const d of myDrops.slice(0, 4)) {
      items.push({
        key: `d-${d.id}`,
        title: `Drop: ${d.title}`,
        detail: `${d.saveCount} saves · ${d.viewCount} views`,
        timestamp: d.updatedAt,
        href: `/creator/drops`,
      });
    }
    return items
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      )
      .slice(0, 10);
  }, [creator, bookings, notifications, myDrops]);

  const upcomingBookings = useMemo(
    () =>
      bookings
        .filter((b) => b.status === "scheduled" && b.scheduledAt)
        .sort(
          (a, b) =>
            new Date(a.scheduledAt!).getTime() -
            new Date(b.scheduledAt!).getTime(),
        )
        .slice(0, 3),
    [bookings],
  );

  const activeDrops = useMemo(
    () => myDrops.filter((d) => getDropTimingStatus(d) === "active").slice(0, 3),
    [myDrops],
  );

  if (!creator || !earnings) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-10 text-[13px] text-ink-muted">
        No creator selected.
      </div>
    );
  }

  const totalSaves =
    myCollections.reduce((acc, c) => acc + 0, 0) +
    myDrops.reduce((acc, d) => acc + d.saveCount, 0) +
    myGuides.reduce((acc, g) => acc + g.baseSaveCount, 0);

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-8">
      <PortalPageHeader
        eyebrow={`Welcome back`}
        title={`Hi, ${creator.displayName.split(" ")[0]}.`}
        description="Everything that's happening across your creator presence, at a glance."
      />

      {/* Quick stats row */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <PortalStatCard
          label="Total earnings"
          value={formatUsd(
            earnings.totalEarnings +
              consultStats.totalEarnings +
              partnershipStats.totalEarned,
          )}
          trend={`+${formatUsd(earnings.pendingPayout)} pending`}
          tone="gold"
        />
        <PortalStatCard
          label="Followers"
          value={formatCompact(creator.followerCount)}
          trend="+1.2% this month"
          tone="teal"
        />
        <PortalStatCard
          label="Total saves"
          value={formatCompact(totalSaves || 0)}
          trend={`${myCollections.length} collections`}
          tone="sage"
        />
        <PortalStatCard
          label="Consultation rating"
          value={
            creator.consultationRating
              ? `${creator.consultationRating.toFixed(1)} ★`
              : "—"
          }
          trend={`${creator.totalConsultations} reviews`}
          tone="saffron"
        />
      </div>

      {/* Quick actions */}
      <div className="mt-6 flex flex-wrap gap-2">
        <QuickAction href="/creator/collections/new" icon={Layers} label="Create collection" />
        <QuickAction href="/creator/guides/new" icon={BookOpen} label="Write a guide" />
        <QuickAction href="/creator/drops/new" icon={Zap} label="Create a drop" />
        <QuickAction href="/creator/partnerships" icon={Handshake} label="View partnerships" />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Activity feed (2/3 width) */}
        <section className="lg:col-span-2">
          <SectionHeader title="Recent activity" meta={`${activity.length} items`} />
          {activity.length === 0 ? (
            <p className="rounded-lg border border-dashed border-gold/20 px-4 py-8 text-center text-[12.5px] italic text-ink-muted">
              Nothing to show yet. Your new followers, saves, and partnership
              proposals will appear here.
            </p>
          ) : (
            <ul className="flex flex-col gap-1.5">
              {activity.map((item) => (
                <li key={item.key}>
                  <Link
                    href={item.href}
                    className="flex items-start justify-between gap-3 rounded-lg border border-border bg-white px-4 py-3 transition-colors hover:border-gold/30"
                  >
                    <div className="min-w-0">
                      <p className="font-serif text-[14px] text-ink">{item.title}</p>
                      <p className="mt-0.5 truncate text-[12px] text-ink-muted">
                        {item.detail}
                      </p>
                    </div>
                    <span
                      className="shrink-0 font-mono text-[10px] uppercase tracking-wider text-ink-faint"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {relativeTime(item.timestamp)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Upcoming sidebar */}
        <aside className="flex flex-col gap-6">
          <div>
            <SectionHeader title="Upcoming consultations" meta={String(upcomingBookings.length)} />
            {upcomingBookings.length === 0 ? (
              <p className="rounded-lg border border-dashed border-gold/15 px-3 py-5 text-center text-[12px] italic text-ink-muted">
                Nothing scheduled.
              </p>
            ) : (
              <ul className="flex flex-col gap-1.5">
                {upcomingBookings.map((b) => (
                  <li
                    key={b.id}
                    className="rounded-lg border border-border bg-white px-3 py-2"
                  >
                    <div className="flex items-center gap-2">
                      <Clock size={12} strokeWidth={1.8} className="text-gold" />
                      <span className="text-[12px] text-ink">
                        {formatDateShort(b.scheduledAt!)}
                      </span>
                    </div>
                    <p className="mt-1 text-[12px] text-ink-muted">
                      {initialsFromId(b.coupleUserId)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <SectionHeader title="Active drops" meta={String(activeDrops.length)} />
            {activeDrops.length === 0 ? (
              <p className="rounded-lg border border-dashed border-gold/15 px-3 py-5 text-center text-[12px] italic text-ink-muted">
                No active drops.
              </p>
            ) : (
              <ul className="flex flex-col gap-1.5">
                {activeDrops.map((d) => {
                  const remaining = dropTimeRemaining(d.endsAt);
                  return (
                    <li
                      key={d.id}
                      className="rounded-lg border border-border bg-white px-3 py-2"
                    >
                      <p className="truncate text-[12.5px] text-ink">{d.title}</p>
                      <p
                        className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-rose"
                        style={{ fontFamily: "var(--font-mono)" }}
                      >
                        {remaining.label}
                      </p>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {partnershipStats.pending > 0 && (
            <div className="rounded-lg border border-gold/30 bg-gold-pale/30 px-4 py-3">
              <p className="flex items-center gap-2 font-serif text-[14px] text-ink">
                <Sparkles size={13} strokeWidth={1.8} className="text-gold" />
                {partnershipStats.pending} pending proposal
                {partnershipStats.pending === 1 ? "" : "s"}
              </p>
              <Link
                href="/creator/partnerships"
                className="mt-1 inline-block font-mono text-[10px] uppercase tracking-wider text-gold hover:underline"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Review →
              </Link>
            </div>
          )}

          <Link
            href="/creator/tier"
            className="group flex items-center justify-between rounded-lg border border-border bg-white px-4 py-3 transition-colors hover:border-gold/30"
          >
            <div className="flex items-center gap-2">
              <TrendingUp
                size={14}
                strokeWidth={1.7}
                className="text-gold"
              />
              <div>
                <p className="text-[12.5px] text-ink">Tier progress</p>
                <p
                  className="font-mono text-[9.5px] uppercase tracking-wider text-ink-faint"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {creator.tier.replace("_", " ")}
                </p>
              </div>
            </div>
            <span className="font-mono text-[10px] text-ink-faint group-hover:text-gold">
              →
            </span>
          </Link>
        </aside>
      </div>
    </div>
  );
}

function QuickAction({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: typeof PlusCircle;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-white px-4 py-1.5 text-[12px] text-ink transition-colors hover:bg-gold-pale/30"
    >
      <Icon size={12} strokeWidth={1.8} className="text-gold" />
      {label}
    </Link>
  );
}

function SectionHeader({
  title,
  meta,
}: {
  title: string;
  meta?: string;
}) {
  return (
    <div className="mb-3 flex items-center justify-between border-b border-gold/10 pb-2">
      <h2 className="font-serif text-[16px] text-ink">{title}</h2>
      {meta && (
        <span
          className="font-mono text-[10px] uppercase tracking-wider text-ink-faint"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {meta}
        </span>
      )}
    </div>
  );
}

function initialsFromId(id: string): string {
  const seed = id.slice(-2).toUpperCase();
  return `${seed[0] ?? "A"}.${seed[1] ?? "D"}.`;
}

function labelForServiceStatus(status: string) {
  switch (status) {
    case "requested":
      return "awaiting your confirmation";
    case "confirmed":
      return "confirmed";
    case "scheduled":
      return "scheduled";
    case "completed":
      return "completed";
    case "cancelled":
      return "cancelled";
    default:
      return status;
  }
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d`;
  const mo = Math.floor(d / 30);
  return `${mo}mo`;
}

function formatDateShort(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
