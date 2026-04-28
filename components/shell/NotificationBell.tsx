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

export function NotificationBell({
  recipient,
  variant = "default",
  className,
}: Props) {
  // Select the raw array so the selector returns a stable reference; filter
  // in a useMemo below. Returning a `.filter()` result directly from the
  // zustand selector creates a new array on every render, which trips
  // React's "The result of getSnapshot should be cached" warning.
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

  const buttonClasses =
    variant === "vendor"
      ? "relative flex h-8 w-8 items-center justify-center rounded-full text-[#6a6a6a] transition-colors hover:bg-white hover:text-[#2C2C2C]"
      : variant === "planner"
        ? "relative grid h-9 w-9 place-items-center rounded-full text-[#5a5a5a] transition-colors hover:bg-[#F5E6D0]/55"
        : "relative flex h-8 w-8 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-ivory-warm hover:text-ink";

  const badgeBg =
    variant === "default" ? "#C4A265" : "#C0392B";

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={`${unreadCount} unread notifications`}
        className={buttonClasses}
      >
        <Bell size={16} strokeWidth={1.8} />
        {unreadCount > 0 && (
          <span
            className="absolute -right-0.5 -top-0.5 flex h-[16px] min-w-[16px] items-center justify-center rounded-full px-1 font-mono text-[9.5px] font-semibold text-white"
            style={{ backgroundColor: badgeBg }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+8px)] z-40 w-[360px] overflow-hidden rounded-2xl border bg-white shadow-[0_24px_48px_-20px_rgba(44,44,44,0.25)]"
          style={{ borderColor: "rgba(44,44,44,0.1)" }}
        >
          <div
            className="flex items-center justify-between border-b px-5 py-3.5"
            style={{ borderColor: "rgba(44,44,44,0.08)" }}
          >
            <p
              className="text-[18px] leading-none text-[#2C2C2C]"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 500,
                letterSpacing: "-0.005em",
              }}
            >
              Notifications
            </p>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => markAllRead(recipient)}
                className="text-[11.5px] text-[#9E8245] hover:text-[#C4A265]"
              >
                Mark all read
              </button>
            )}
          </div>

          {recent.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <p
                className="text-[13px] italic text-[#8a8a8a]"
                style={{ fontFamily: "'EB Garamond', serif" }}
              >
                No notifications yet.
              </p>
            </div>
          ) : (
            <ul className="max-h-[360px] overflow-y-auto">
              {recent.map((n) => (
                <li
                  key={n.id}
                  className={cn(
                    "border-b last:border-b-0",
                    !n.read && "bg-[#FBF4E6]",
                  )}
                  style={{ borderColor: "rgba(44,44,44,0.05)" }}
                >
                  <Link
                    href={n.link}
                    onClick={() => handleItemClick(n)}
                    className="flex gap-3 px-5 py-3 transition-colors hover:bg-[#F5E6D0]/40"
                  >
                    <span
                      className={cn(
                        "mt-1 h-1.5 w-1.5 shrink-0 rounded-full",
                        !n.read ? "bg-[#C4A265]" : "bg-stone-300",
                      )}
                      aria-hidden
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-medium leading-snug text-[#2C2C2C]">
                        {n.title}
                      </p>
                      <p className="mt-0.5 text-[12.5px] leading-snug text-[#4a4a4a]">
                        {n.body}
                      </p>
                      <p
                        className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em]"
                        style={{ color: "#9E8245" }}
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
