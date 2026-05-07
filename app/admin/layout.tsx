"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState, useEffect, type ReactNode } from "react";
import { KeyRound, LockKeyhole, MessageCircle, ShieldCheck, Users } from "lucide-react";
import { useCurrentUser } from "@/stores/auth-store";
import { useCreatorApplicationsStore } from "@/stores/creator-applications-store";
import { useConfessionalStore } from "@/stores/confessional-store";
import { supabaseBrowser as supabase } from "@/lib/supabase/browser-client";

const DISPLAY = "'Playfair Display', Georgia, serif";
const BODY = "'DM Sans', system-ui, sans-serif";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const user = useCurrentUser();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    if (!user) { setIsAdmin(false); return; }
    (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const token = data.session?.access_token;
        if (!token) { setIsAdmin(false); return; }
        const res = await fetch("/api/admin/verify", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        setIsAdmin(!!json.isAdmin);
      } catch {
        setIsAdmin(false);
      }
    })();
  }, [user]);
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

  if (isAdmin === null) {
    return <div className="min-h-screen bg-[#F7F5F0]" />;
  }

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
            This area is reserved for the Ananya editorial team. Please sign in
            with an authorised admin account.
          </p>
          <div className="mt-6">
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
