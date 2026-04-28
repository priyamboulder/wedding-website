"use client";

// ── One Look feed for a vendor's storefront ──────────────────────────────
// Sortable list of One Look cards. Shows 3 by default with a "see all" toggle.

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { useOneLookStore } from "@/stores/one-look-store";
import { OneLookCard } from "./OneLookCard";

type Sort = "recent" | "score_high" | "score_low";

export function OneLookFeed({
  coordinationVendorId,
  platformVendorId,
}: {
  coordinationVendorId?: string | null;
  platformVendorId?: string | null;
}) {
  const allReviews = useOneLookStore((s) => s.reviews);
  const all = useMemo(
    () =>
      allReviews.filter(
        (r) =>
          r.status === "published" &&
          ((coordinationVendorId && r.coordinationVendorId === coordinationVendorId) ||
            (platformVendorId && r.platformVendorId === platformVendorId)),
      ),
    [allReviews, coordinationVendorId, platformVendorId],
  );
  const [sort, setSort] = useState<Sort>("recent");
  const [expanded, setExpanded] = useState(false);

  const sorted = useMemo(() => {
    const copy = [...all];
    if (sort === "recent") {
      copy.sort((a, b) => {
        const ta = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
        const tb = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
        return tb - ta;
      });
    } else if (sort === "score_high") {
      copy.sort((a, b) => b.score - a.score);
    } else {
      copy.sort((a, b) => a.score - b.score);
    }
    return copy;
  }, [all, sort]);

  if (all.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border/60 bg-ivory-warm/30 p-5 text-center">
        <p
          className="font-mono text-[10px] uppercase tracking-[0.16em] text-gold"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          one looks
        </p>
        <p className="mt-1.5 font-serif text-[15px] text-ink">
          no One Looks yet — brides haven't weighed in here.
        </p>
      </div>
    );
  }

  const visible = expanded ? sorted : sorted.slice(0, 3);
  const hasMore = sorted.length > 3;

  return (
    <section className="space-y-3">
      <header className="flex items-center justify-between gap-3">
        <p
          className="font-mono text-[10px] uppercase tracking-[0.16em] text-gold"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          — one looks ({all.length}) —
        </p>
        <SortToggle value={sort} onChange={setSort} />
      </header>

      <ul className="space-y-3" role="list">
        {visible.map((r) => (
          <li key={r.id}>
            <OneLookCard review={r} />
          </li>
        ))}
      </ul>

      {hasMore && !expanded && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="w-full rounded-md border border-border bg-white py-2 font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-muted hover:border-saffron/40 hover:text-saffron"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          See all {sorted.length} One Looks →
        </button>
      )}
      {expanded && hasMore && (
        <button
          type="button"
          onClick={() => setExpanded(false)}
          className="w-full rounded-md border border-border bg-white py-2 font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-muted hover:border-saffron/40 hover:text-saffron"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Show fewer
        </button>
      )}
    </section>
  );
}

function SortToggle({
  value,
  onChange,
}: {
  value: Sort;
  onChange: (v: Sort) => void;
}) {
  const opts: { id: Sort; label: string }[] = [
    { id: "recent", label: "recent" },
    { id: "score_high", label: "high→low" },
    { id: "score_low", label: "low→high" },
  ];
  return (
    <div className="flex gap-1">
      {opts.map((o) => (
        <button
          key={o.id}
          type="button"
          onClick={() => onChange(o.id)}
          className={cn(
            "rounded-full px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.14em] transition-colors",
            value === o.id
              ? "bg-ink text-ivory"
              : "text-ink-muted hover:text-ink",
          )}
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
