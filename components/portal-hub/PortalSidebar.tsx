"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PORTALS, STATUS_COPY, type Portal } from "@/lib/portal-hub/portals";

type Props = {
  portalId: string;
};

export default function PortalSidebar({ portalId }: Props) {
  const pathname = usePathname();
  const portal: Portal | undefined = PORTALS.find((p) => p.id === portalId);
  if (!portal) return null;

  return (
    <aside
      className="sticky top-0 flex h-screen w-72 shrink-0 flex-col border-r border-[#D4AF37]/20"
      style={{ backgroundColor: "#FBF9F4" }}
    >
      {/* Portal header */}
      <div className="border-b border-[#D4AF37]/20 px-6 py-6">
        <div className="flex items-center gap-3">
          <span
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#D4AF37]/40 bg-white text-lg text-[#7a5a16]"
            aria-hidden
          >
            {portal.icon}
          </span>
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.24em] text-[#7a5a16]">
              Ananya Portal
            </p>
            <h2
              className="truncate text-xl font-medium text-[#1a1a1a]"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              {portal.name}
            </h2>
          </div>
        </div>
        <p className="mt-3 font-mono text-[10px] uppercase tracking-wider text-stone-500">
          {portal.basePath}
        </p>
      </div>

      {/* Module nav */}
      <nav className="sidebar-scroll flex-1 overflow-y-auto px-3 py-4">
        <p className="px-3 pb-2 text-[10px] uppercase tracking-[0.22em] text-stone-400">
          Modules
        </p>
        <ul className="flex flex-col gap-0.5">
          {portal.modules.map((mod) => {
            const isActive =
              pathname === mod.href ||
              (mod.href !== portal.basePath && pathname.startsWith(mod.href + "/"));
            const status = STATUS_COPY[mod.status];
            return (
              <li key={mod.href}>
                <Link
                  href={mod.href}
                  className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                    isActive
                      ? "bg-[#F7E7CE]/70 text-[#1a1a1a]"
                      : "text-stone-600 hover:bg-[#F7E7CE]/30 hover:text-[#1a1a1a]"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 shrink-0 rounded-full ${status.dot}`}
                    aria-hidden
                  />
                  <span className="flex-1 truncate">{mod.name}</span>
                  {isActive && (
                    <span
                      className="text-[#7a5a16]"
                      aria-hidden
                    >
                      →
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Back to hub */}
      <div className="border-t border-[#D4AF37]/20 px-3 py-4">
        <Link
          href="/portal-hub"
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-[#7a5a16] transition-colors hover:bg-[#F7E7CE]/40"
        >
          <span aria-hidden>←</span>
          <span>Portal Hub</span>
        </Link>
      </div>
    </aside>
  );
}
