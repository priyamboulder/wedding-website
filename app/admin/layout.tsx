"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { KeyRound, LockKeyhole, MessageCircle, ShieldCheck, Users } from "lucide-react";
import { useCurrentUser } from "@/stores/auth-store";
import { useCreatorApplicationsStore } from "@/stores/creator-applications-store";
import { useConfessionalStore } from "@/stores/confessional-store";

const DISPLAY = "'Playfair Display', Georgia, serif";
const BODY = "'DM Sans', system-ui, sans-serif";

// ── Admin gate ────────────────────────────────────────────────────────────
// Light-weight, local-only guard. A user is considered an admin if:
//   (a) their email ends with "@ananya.local" or "@ananya.team", or
//   (b) localStorage.setItem("ananya-admin", "1") has been set.
// This matches the project's "no Supabase yet" constraint — the surface is
// what matters, and we can swap for a real role check later.

const ADMIN_DOMAINS = ["@ananya.local", "@ananya.team"];
const LOCAL_FLAG = "ananya-admin";

export function useIsAdmin(): boolean {
  const user = useCurrentUser();
  const [localFlag, setLocalFlag] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    setLocalFlag(window.localStorage.getItem(LOCAL_FLAG) === "1");
  }, []);
  if (!user) return localFlag;
  const email = user.email.toLowerCase();
  if (ADMIN_DOMAINS.some((d) => email.endsWith(d))) return true;
  return localFlag;
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAdmin = useIsAdmin();
  const pendingCount = useCreatorApplicationsStore((s) => s.pendingCount());
  const confessionalPosts = useConfessionalStore((s) => s.posts);
  const confessionalReplies = useConfessionalStore((s) => s.replies);
  const confessionalPendingCount = useMemo(
    () =>
      confessionalPosts.filter((p) => p.status === "pending").length +
      confessionalPosts.filter((p) => p.report_count > 0).length +
      confessionalReplies.filter((r) => r.report_count > 0).length,
    [confessionalPosts, confessionalReplies],
  );

  const enableAdminFlag = () => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(LOCAL_FLAG, "1");
    window.location.reload();
  };

  if (!isAdmin) {
    return (
      <div
        className="min-h-screen bg-[#F7F5F0] px-6 py-24"
        style={{ fontFamily: BODY }}
      >
        <div className="mx-auto max-w-[520px] rounded-2xl border border-[#E6DFD3] bg-white p-10 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#F0E9DC] text-[#B8755D]">
            <LockKeyhole size={20} strokeWidth={1.6} />
          </div>
          <h1
            className="mt-5 text-[#1C1917]"
            style={{
              fontFamily: DISPLAY,
              fontSize: 32,
              lineHeight: 1.1,
              letterSpacing: "-0.015em",
            }}
          >
            Admin access only
          </h1>
          <p
            className="mt-3 text-[#6B6157]"
            style={{ fontSize: 15, lineHeight: 1.65 }}
          >
            This area is reserved for the Ananya editorial team. If you're
            testing locally, enable admin mode below.
          </p>
          <button
            onClick={enableAdminFlag}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#1C1917] px-6 py-3 text-[13px] font-medium tracking-wider text-white transition-colors hover:bg-[#B8755D]"
          >
            Enable admin (local)
            <ShieldCheck size={14} strokeWidth={2} />
          </button>
          <div className="mt-4">
            <Link
              href="/"
              className="text-[12px] text-[#8B7E6F] transition-colors hover:text-[#B8755D]"
            >
              Return home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const navItems = [
    {
      href: "/admin/creator-applications",
      label: "Creator Applications",
      badge: pendingCount,
      icon: Users,
    },
    {
      href: "/admin/confessional",
      label: "The Confessional",
      badge: confessionalPendingCount,
      icon: KeyRound,
    },
    {
      href: "/admin/grapevine",
      label: "The Grapevine",
      badge: 0,
      icon: MessageCircle,
    },
  ];

  return (
    <div
      className="min-h-screen bg-[#F7F5F0] text-[#1C1917]"
      style={{ fontFamily: BODY }}
    >
      <header className="border-b border-[#E6DFD3] bg-white">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-8 px-6 py-5 md:px-10">
          <div className="flex items-center gap-3">
            <ShieldCheck size={18} strokeWidth={1.8} className="text-[#B8755D]" />
            <Link
              href="/admin/creator-applications"
              className="text-[#1C1917]"
              style={{
                fontFamily: DISPLAY,
                fontSize: 20,
                letterSpacing: "-0.01em",
              }}
            >
              Ananya Admin
            </Link>
          </div>
          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[12.5px] transition-colors ${
                    active
                      ? "bg-[#1C1917] text-white"
                      : "text-[#1C1917] hover:bg-[#F0E9DC] hover:text-[#B8755D]"
                  }`}
                >
                  <item.icon size={13} strokeWidth={1.8} />
                  {item.label}
                  {item.badge > 0 && (
                    <span
                      className={`ml-1 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10.5px] font-medium ${
                        active
                          ? "bg-white text-[#1C1917]"
                          : "bg-[#B8755D] text-white"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
            <Link
              href="/"
              className="ml-2 inline-flex items-center gap-2 rounded-full border border-[#E6DFD3] px-4 py-1.5 text-[12.5px] text-[#6B6157] transition-colors hover:border-[#B8755D] hover:text-[#B8755D]"
            >
              Exit admin
            </Link>
          </nav>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
