"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";

const FONT_SYNE = "var(--font-syne), 'Syne', sans-serif";

export function AccountButton({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
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

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((s) => !s)}
        aria-label="Account menu"
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex h-8 w-8 items-center justify-center rounded-full transition-colors"
        style={{
          border: '1px solid rgba(212,83,126,0.25)',
          background: 'rgba(212,83,126,0.06)',
          color: 'rgba(75,21,40,0.6)',
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(212,83,126,0.5)'; e.currentTarget.style.color = 'var(--wine, #4B1528)'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(212,83,126,0.25)'; e.currentTarget.style.color = 'rgba(75,21,40,0.6)'; }}
      >
        <User size={14} strokeWidth={1.8} />
      </button>
      {open && (
        <div
          role="menu"
          aria-label="Account"
          className="absolute right-0 top-full z-30 mt-2 w-36 overflow-hidden"
          style={{
            background: '#FFF8F2',
            border: '1px solid rgba(75,21,40,0.1)',
            borderRadius: 6,
            boxShadow: '0 8px 24px -8px rgba(75,21,40,0.15)',
          }}
        >
          <button
            type="button"
            role="menuitem"
            onClick={async () => {
              setOpen(false);
              await signOut();
              router.push("/");
            }}
            className="block w-full px-3 py-2.5 text-left text-[12px] font-medium transition-colors"
            style={{ fontFamily: FONT_SYNE, color: 'rgba(75,21,40,0.7)', letterSpacing: '0.04em' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(212,83,126,0.08)'; e.currentTarget.style.color = 'var(--wine, #4B1528)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(75,21,40,0.7)'; }}
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
