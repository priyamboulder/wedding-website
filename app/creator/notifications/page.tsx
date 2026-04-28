"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Handshake,
  Calendar,
  Zap,
  Users,
  Star,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { PortalPageHeader } from "@/components/creator-portal/PortalPageHeader";
import {
  useNotificationsStore,
  type Notification,
  type NotificationType,
} from "@/stores/notifications-store";

type FilterTab = "all" | "partnerships" | "consultations" | "drops" | "followers" | "platform";

function isCreatorRelevant(type: NotificationType): boolean {
  return (
    type.startsWith("partnership_") ||
    type.startsWith("drop_") ||
    type === "review_received" ||
    type === "inquiry_booked" ||
    type === "application_approved"
  );
}

function inCategory(type: NotificationType, cat: FilterTab): boolean {
  if (cat === "all") return true;
  if (cat === "partnerships") return type.startsWith("partnership_");
  if (cat === "drops") return type.startsWith("drop_");
  if (cat === "consultations")
    return type === "inquiry_booked" || type === "review_received";
  if (cat === "followers") return false; // no follower notification type currently
  if (cat === "platform") return type === "application_approved";
  return true;
}

export default function NotificationsPage() {
  const notifications = useNotificationsStore((s) => s.notifications);
  const markRead = useNotificationsStore((s) => s.markRead);
  const markAllRead = useNotificationsStore((s) => s.markAllRead);

  const [tab, setTab] = useState<FilterTab>("all");

  const filtered = useMemo(
    () =>
      notifications
        .filter((n) => isCreatorRelevant(n.type) && inCategory(n.type, tab))
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        ),
    [notifications, tab],
  );

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-8">
      <PortalPageHeader
        eyebrow="Account"
        title="Notifications"
        description="Creator-specific updates — partnerships, bookings, drops, and platform news."
        actions={
          <button
            onClick={() => markAllRead()}
            className="rounded-md border border-gold/30 bg-white px-3 py-1.5 text-[12px] text-ink hover:bg-gold-pale/30"
          >
            Mark all read
          </button>
        }
      />

      <div className="mb-4 flex flex-wrap gap-1">
        {(["all", "partnerships", "consultations", "drops", "followers", "platform"] as FilterTab[]).map(
          (t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-full border px-3 py-1 text-[11.5px] capitalize ${
                tab === t
                  ? "border-gold/40 bg-gold-pale/40 text-ink"
                  : "border-border bg-white text-ink-muted hover:border-gold/30"
              }`}
            >
              {t}
            </button>
          ),
        )}
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-lg border border-dashed border-gold/20 px-4 py-12 text-center text-[12.5px] italic text-ink-muted">
          No notifications in this view.
        </p>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {filtered.map((n) => (
            <NotificationRow key={n.id} n={n} onMarkRead={markRead} />
          ))}
        </ul>
      )}
    </div>
  );
}

function NotificationRow({
  n,
  onMarkRead,
}: {
  n: Notification;
  onMarkRead: (id: string) => void;
}) {
  const Icon = iconForType(n.type);
  const handleClick = () => {
    if (!n.read) onMarkRead(n.id);
  };

  return (
    <li>
      <Link
        href={n.link || "#"}
        onClick={handleClick}
        className={`flex items-start gap-3 rounded-lg border px-4 py-3 transition-colors ${
          n.read
            ? "border-border bg-white hover:border-gold/30"
            : "border-gold/30 bg-gold-pale/20 hover:border-gold/50"
        }`}
      >
        <Icon
          size={16}
          strokeWidth={1.7}
          className={n.read ? "mt-0.5 text-ink-faint" : "mt-0.5 text-gold"}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="font-serif text-[14px] text-ink">{n.title}</p>
            <span
              className="shrink-0 font-mono text-[10px] uppercase tracking-wider text-ink-faint"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {relativeTime(n.created_at)}
            </span>
          </div>
          <p className="mt-0.5 text-[12px] text-ink-muted">{n.body}</p>
        </div>
        {!n.read && <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-rose" />}
      </Link>
    </li>
  );
}

function iconForType(type: NotificationType): LucideIcon {
  if (type.startsWith("partnership_")) return Handshake;
  if (type.startsWith("drop_")) return Zap;
  if (type === "review_received") return Star;
  if (type === "inquiry_booked") return Calendar;
  if (type === "application_approved") return Sparkles;
  return Users;
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
  return new Date(iso).toLocaleDateString();
}
