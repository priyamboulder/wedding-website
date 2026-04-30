"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { User, LogOut, Settings, LayoutDashboard, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";

export function AccountButton({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const user = useAuthStore((s) => s.user);
  const openSignIn = useAuthStore((s) => s.openSignIn);
  const signOut = useAuthStore((s) => s.signOut);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const initials = user?.name
    ? user.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : null;

  const handleSignOut = async () => {
    setOpen(false);
    await signOut();
    router.push("/");
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((s) => !s)}
        aria-label="Account menu"
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex h-8 items-center gap-1.5 rounded-full border border-gold/25 bg-ivory-warm px-2.5 text-ink transition-colors hover:border-gold/50 hover:bg-gold-pale/40 focus-visible:border-gold/60 focus-visible:outline-none"
      >
        {initials ? (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gold/20 text-[10px] font-semibold text-ink">
            {initials}
          </span>
        ) : (
          <User size={14} strokeWidth={1.8} />
        )}
        {user?.name && (
          <span className="max-w-[100px] truncate text-[12px] font-medium">
            {user.name.split(" ")[0]}
          </span>
        )}
        <ChevronDown size={11} strokeWidth={2} className={cn("transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Account"
          className="absolute right-0 top-full z-30 mt-2 w-52 overflow-hidden rounded-md border border-gold/20 bg-white shadow-lg"
        >
          {user ? (
            <>
              <div className="border-b border-gold/10 px-3 py-2.5">
                <p className="truncate text-[12px] font-semibold text-ink">{user.name}</p>
                <p className="truncate text-[11px] text-ink-muted">{user.email}</p>
                <p className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.12em] text-gold">
                  {user.role}
                </p>
              </div>

              <button
                type="button"
                role="menuitem"
                onClick={() => { setOpen(false); router.push("/dashboard"); }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-[12px] font-medium text-ink transition-colors hover:bg-ivory-warm"
              >
                <LayoutDashboard size={13} strokeWidth={1.8} />
                Dashboard
              </button>

              <button
                type="button"
                role="menuitem"
                onClick={() => { setOpen(false); router.push("/shell"); }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-[12px] font-medium text-ink transition-colors hover:bg-ivory-warm"
              >
                <Settings size={13} strokeWidth={1.8} />
                Settings
              </button>

              <div className="h-px bg-gold/10" aria-hidden />

              <button
                type="button"
                role="menuitem"
                onClick={handleSignOut}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-[12px] font-medium text-red-500 transition-colors hover:bg-red-50"
              >
                <LogOut size={13} strokeWidth={1.8} />
                Sign Out
              </button>
            </>
          ) : (
            <button
              type="button"
              role="menuitem"
              onClick={() => { setOpen(false); openSignIn("generic"); }}
              className="block w-full px-3 py-2 text-left text-[12px] font-medium text-ink transition-colors hover:bg-ivory-warm"
            >
              Sign In
            </button>
          )}
        </div>
      )}
    </div>
  );
}
