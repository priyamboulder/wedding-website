"use client";

// ── Dashboard flags ───────────────────────────────────────────────────────
// Reuses detectFlags() from the brief AI module so the dashboard speaks the
// same language as the brief summary. Quiet by default; section hides
// entirely when nothing is flagged — the absence is the signal.

import Link from "next/link";
import { useMemo } from "react";
import { useEventsStore } from "@/stores/events-store";
import { detectFlags, type EventsFlag } from "@/lib/events/ai";
import { cn } from "@/lib/utils";

export function DashboardFlags() {
  const coupleContext = useEventsStore((s) => s.coupleContext);
  const events = useEventsStore((s) => s.events);

  const flags = useMemo(
    () => detectFlags({ coupleContext, events }),
    [coupleContext, events],
  );

  if (flags.length === 0) return null;

  return (
    <section className="mt-12">
      <h2
        className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-muted"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        Flags worth a look
      </h2>
      <ul className="mt-4 space-y-2">
        {flags.map((f) => (
          <FlagRow key={f.id} flag={f} />
        ))}
      </ul>
    </section>
  );
}

function FlagRow({ flag }: { flag: EventsFlag }) {
  const toneClass =
    flag.tone === "conflict"
      ? "border-rose/40 bg-rose-pale/40 text-rose"
      : flag.tone === "warning"
        ? "border-gold/40 bg-gold-pale/30 text-ink"
        : "border-sage/40 bg-sage-pale/40 text-ink";

  // Every flag we generate today resolves on the brief; if scope diverges
  // later, branch the destination here.
  return (
    <li>
      <Link
        href="/events"
        className={cn(
          "flex items-start gap-2.5 border px-4 py-2.5 text-[13px] leading-relaxed transition-opacity hover:opacity-80",
          toneClass,
        )}
      >
        <span className="mt-1 inline-block h-1.5 w-1.5 shrink-0 bg-current" aria-hidden />
        <span className="flex-1">{flag.message}</span>
      </Link>
    </li>
  );
}
