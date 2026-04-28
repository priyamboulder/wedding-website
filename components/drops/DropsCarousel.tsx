"use client";

import { useMemo } from "react";
import { Sparkles } from "lucide-react";
import { useDropsStore } from "@/stores/drops-store";
import { DropCard } from "@/components/drops/DropCard";
import { getDropTimingStatus } from "@/types/drop";

export function DropsCarousel({
  weddingId,
  title = "Style drops",
  subtitle = "Time-limited capsule collections from our creators.",
  showUpcoming = true,
}: {
  weddingId?: string | null;
  title?: string;
  subtitle?: string;
  showUpcoming?: boolean;
}) {
  const drops = useDropsStore((s) => s.drops);
  const items = useDropsStore((s) => s.items);

  const visible = useMemo(() => {
    return drops.filter((d) => {
      const t = getDropTimingStatus(d);
      if (t === "active") return true;
      if (t === "scheduled") return showUpcoming;
      return false;
    });
  }, [drops, showUpcoming]);

  if (visible.length === 0) return null;

  return (
    <section className="border-y border-gold/15 bg-ivory-warm/30 px-6 py-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <p className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-gold">
              <Sparkles size={11} strokeWidth={1.6} />
              {title}
            </p>
            <p className="mt-0.5 text-[12.5px] text-ink-muted">{subtitle}</p>
          </div>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 [&>*]:w-[300px] [&>*]:shrink-0 sm:[&>*]:w-[320px]">
          {visible.map((drop) => (
            <DropCard
              key={drop.id}
              drop={drop}
              itemCount={items.filter((i) => i.dropId === drop.id).length}
              weddingId={weddingId}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
