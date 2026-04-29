"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Bell } from "lucide-react";
import {
  useNotificationsStore,
  type Notification,
  type NotificationRecipient,
} from "@/stores/notifications-store";
import { cn } from "@/lib/utils";

const FONT_SYNE = "var(--font-syne), 'Syne', sans-serif";
const FONT_PLAYFAIR = "var(--font-playfair), 'Playfair Display', serif";

type Props = {
  recipient: NotificationRecipient;
  variant?: "default" | "vendor" | "planner";
  className?: string;
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

export function NotificationBell({ recipient, variant = "default", className }: Props) {
  const allNotifications = useNotificationsStore((s) => s.notifications);
  const markRead = useNotificationsStore((s) => s.markRead);
  const markAllRead = useNotificationsStore((s) => s.markAllRead);

  const notifications = useMemo(
    () => allNotifications.filter((n) => n.recipient === recipient),
    [allNotifications, recipient],
  );

  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const recent = notifications.slice(0, 10);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const handleItemClick = (n: Notification) => {
    if (!n.read) markRead(n.id);
    setOpen(false);
  };

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={`${unreadCount} unread notifications`}
        className="relative flex h-8 w-8 items-center justify-center rounded-full transition-colors"
        style={{ color: 'rgba(75,21,40,0.5)', background: 'transparent' }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(212,83,126,0.08)'; e.currentTarget.style.color = 'var(--wine, #4B1528)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(75,21,40,0.5)'; }}
      >
        <Bell size={16} strokeWidth={1.8} />
        {unreadCount > 0 && (
          <span
            className="absolute -right-0.5 -top-0.5 flex h-[16px] min-w-[16px] items-center justify-center rounded-full px-1 text-[9.5px] font-semibold text-white"
            style={{ fontFamily: FONT_SYNE, background: 'var(--pink, #D4537E)' }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+8px)] z-40 w-[360px] overflow-hidden"
          style={{
            background: '#FFF8F2',
            border: '1px solid rgba(75,21,40,0.1)',
            borderRadius: 8,
            boxShadow: '0 24px 48px -20px rgba(75,21,40,0.2)',
          }}
        >
          <div
            className="flex items-center justify-between px-5 py-3.5"
            style={{ borderBottom: '1px solid rgba(75,21,40,0.08)' }}
          >
            <p
              style={{
                fontFamily: FONT_PLAYFAIR,
                fontSize: 18,
                fontWeight: 400,
                color: 'var(--wine, #4B1528)',
                letterSpacing: '-0.005em',
                lineHeight: 1,
              }}
            >
              Notifications
            </p>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => markAllRead(recipient)}
                className="text-[11.5px] transition-colors"
                style={{ fontFamily: FONT_SYNE, color: 'rgba(75,21,40,0.45)' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--pink, #D4537E)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(75,21,40,0.45)')}
              >
                Mark all read
              </button>
            )}
          </div>

          {recent.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <p
                className="text-[13px] italic"
                style={{ fontFamily: FONT_PLAYFAIR, color: 'rgba(75,21,40,0.4)' }}
              >
                No notifications yet.
              </p>
            </div>
          ) : (
            <ul className="max-h-[360px] overflow-y-auto">
              {recent.map((n) => (
                <li
                  key={n.id}
                  className={cn("border-b last:border-b-0")}
                  style={{
                    borderColor: 'rgba(75,21,40,0.05)',
                    background: !n.read ? 'rgba(212,83,126,0.05)' : 'transparent',
                  }}
                >
                  <Link
                    href={n.link}
                    onClick={() => handleItemClick(n)}
                    className="flex gap-3 px-5 py-3 transition-colors"
                    style={{ color: 'inherit' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(212,83,126,0.06)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <span
                      className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{ background: !n.read ? 'var(--pink, #D4537E)' : 'rgba(75,21,40,0.2)' }}
                      aria-hidden
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-medium leading-snug" style={{ color: 'var(--wine, #4B1528)' }}>
                        {n.title}
                      </p>
                      <p className="mt-0.5 text-[12.5px] leading-snug" style={{ color: 'rgba(75,21,40,0.6)' }}>
                        {n.body}
                      </p>
                      <p
                        className="mt-1 text-[10px] uppercase tracking-[0.2em]"
                        style={{ fontFamily: FONT_SYNE, color: 'rgba(75,21,40,0.4)' }}
                      >
                        {n.actor_name} · {timeAgo(n.created_at)}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
