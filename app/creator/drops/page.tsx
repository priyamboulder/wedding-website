"use client";

import Link from "next/link";
import { Plus, Zap } from "lucide-react";
import { PortalPageHeader } from "@/components/creator-portal/PortalPageHeader";
import { useCurrentCreator, formatCompact } from "@/lib/creators/current-creator";
import { useDropsStore } from "@/stores/drops-store";
import { dropTimeRemaining, getDropTimingStatus } from "@/types/drop";

export default function DropsPage() {
  const creator = useCurrentCreator();
  const myDrops = useDropsStore((s) =>
    creator ? s.getDropsByCreator(creator.id) : [],
  );
  const items = useDropsStore((s) => s.items);

  if (!creator) return null;

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-8">
      <PortalPageHeader
        eyebrow="Content"
        title="Seasonal drops"
        description="Time-bound capsule collections with their own cover art, accent color, and countdown."
        actions={
          <Link
            href="/creator/drops/new"
            className="inline-flex items-center gap-1.5 rounded-md bg-ink px-3 py-1.5 text-[12.5px] text-ivory hover:bg-gold"
          >
            <Plus size={13} strokeWidth={1.8} />
            Create a drop
          </Link>
        }
      />

      {myDrops.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gold/20 py-16 text-center">
          <Zap size={22} className="mx-auto text-gold" strokeWidth={1.4} />
          <p className="mt-3 font-serif text-[16px] text-ink">No drops yet</p>
          <p className="mt-1 text-[12.5px] text-ink-muted">
            Create a seasonal drop and notify your followers when it launches.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {myDrops.map((d) => {
            const phase = getDropTimingStatus(d);
            const itemCount = items.filter((i) => i.dropId === d.id).length;
            const remaining = phase === "active" ? dropTimeRemaining(d.endsAt) : null;
            return (
              <Link
                key={d.id}
                href={`/creator/drops/${d.id}/edit`}
                className="group overflow-hidden rounded-xl border border-border bg-white transition-all hover:border-gold/30 hover:shadow-sm"
              >
                <div
                  className="relative h-36 bg-cover bg-center"
                  style={{
                    backgroundImage: d.coverImageUrl
                      ? `url(${d.coverImageUrl})`
                      : undefined,
                    backgroundColor: d.accentColor,
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <div className="absolute left-3 top-3">
                    <span
                      className="rounded-full bg-white/90 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-ink"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {d.themeTag}
                    </span>
                  </div>
                  {remaining && (
                    <div
                      className="absolute bottom-3 right-3 rounded-full bg-white/95 px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-wider text-rose"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {remaining.label}
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="line-clamp-2 font-serif text-[16px] text-ink group-hover:text-gold">
                    {d.title}
                  </h3>
                  <div
                    className="mt-2 flex items-center gap-3 font-mono text-[10px] uppercase tracking-wider text-ink-faint"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    <span
                      className={`rounded-full px-2 py-0.5 ${
                        phase === "active"
                          ? "bg-sage/20 text-sage"
                          : phase === "scheduled"
                            ? "bg-teal-pale/60 text-teal"
                            : "bg-ink-faint/20 text-ink-faint"
                      }`}
                    >
                      {phase}
                    </span>
                    <span>{itemCount} items</span>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-[11.5px]">
                    <div>
                      <p className="text-ink-faint">Views</p>
                      <p className="text-ink">{formatCompact(d.viewCount)}</p>
                    </div>
                    <div>
                      <p className="text-ink-faint">Saves</p>
                      <p className="text-ink">{formatCompact(d.saveCount)}</p>
                    </div>
                    <div>
                      <p className="text-ink-faint">Conv.</p>
                      <p className="text-ink">{((d.saveCount / Math.max(1, d.viewCount)) * 100).toFixed(1)}%</p>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
