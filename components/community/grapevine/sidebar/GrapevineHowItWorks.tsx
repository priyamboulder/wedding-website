"use client";

// ── How The Grapevine works ─────────────────────────────────────────────────
// Collapsible explainer card. Default-expanded on first visit (tracked
// per-browser in localStorage); brides who've already read it see a
// closed-by-default summary they can re-open if needed.

import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "ananya:grapevine:how-it-works-collapsed";

const POINTS = [
  "everything here is anonymous — your identity is never shown to other brides or vendors.",
  "tag a vendor to help other brides find relevant threads.",
  "moderated by the ananya team — no defamation, no spam.",
  "vendors cannot see who posted. vendors cannot respond here.",
];

export function GrapevineHowItWorks() {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === "1") setCollapsed(true);
    } catch {
      /* localStorage might be blocked; default to expanded */
    }
  }, []);

  const toggle = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      } catch {
        /* noop */
      }
      return next;
    });
  };

  return (
    <section className="rounded-2xl border border-gold/15 bg-white p-5">
      <button
        type="button"
        onClick={toggle}
        className="flex w-full items-center justify-between gap-3 text-left"
        aria-expanded={!collapsed}
      >
        <span className="flex items-center gap-2">
          <Lock size={13} strokeWidth={1.8} className="text-gold" />
          <span
            className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            how the grapevine works
          </span>
        </span>
        {collapsed ? (
          <ChevronDown size={14} strokeWidth={1.8} className="text-ink-muted" />
        ) : (
          <ChevronUp size={14} strokeWidth={1.8} className="text-ink-muted" />
        )}
      </button>
      {!collapsed && (
        <ul className="mt-4 space-y-2.5 text-[12.5px] leading-[1.6] text-ink-muted">
          {POINTS.map((p) => (
            <li key={p} className="flex gap-2">
              <span
                aria-hidden
                className={cn(
                  "mt-[7px] h-[5px] w-[5px] shrink-0 rounded-full bg-gold",
                )}
              />
              <span>{p}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
