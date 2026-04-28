"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Plus, Sparkles } from "lucide-react";
import { PortalPageHeader } from "@/components/creator-portal/PortalPageHeader";
import { useCurrentCreator, useMyCollections, formatCompact } from "@/lib/creators/current-creator";
import { useCreatorsStore } from "@/stores/creators-store";
import { useCreatorPortalStore } from "@/stores/creator-portal-store";

type Phase = "scheduled" | "active" | "ended";

function exhibitionPhase(c: { exhibitionStart: string | null; exhibitionEnd: string | null }): Phase {
  const now = Date.now();
  const start = c.exhibitionStart ? new Date(c.exhibitionStart).getTime() : 0;
  const end = c.exhibitionEnd ? new Date(c.exhibitionEnd).getTime() : Infinity;
  if (now < start) return "scheduled";
  if (now > end) return "ended";
  return "active";
}

export default function ExhibitionsPage() {
  const creator = useCurrentCreator();
  const collections = useMyCollections();
  const seedPicks = useCreatorsStore((s) => s.picks);
  const userPicks = useCreatorPortalStore((s) => s.userPicks);

  const exhibitions = useMemo(
    () => collections.filter((c) => c.isExhibition),
    [collections],
  );

  if (!creator) return null;

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-8">
      <PortalPageHeader
        eyebrow="Content"
        title="Exhibitions"
        description="Time-bound, curated edits that appear as a featured exhibition across Shopping."
        actions={
          <Link
            href="/creator/collections/new"
            className="inline-flex items-center gap-1.5 rounded-md bg-ink px-3 py-1.5 text-[12.5px] text-ivory hover:bg-gold"
          >
            <Plus size={13} strokeWidth={1.8} />
            New exhibition
          </Link>
        }
      />

      {exhibitions.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gold/20 py-16 text-center">
          <Sparkles size={22} className="mx-auto text-gold" strokeWidth={1.4} />
          <p className="mt-3 font-serif text-[16px] text-ink">No exhibitions yet</p>
          <p className="mt-1 text-[12.5px] text-ink-muted">
            Create a collection and mark it as an exhibition with start/end dates.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {exhibitions.map((ex) => {
            const phase = exhibitionPhase(ex);
            const pickCount =
              seedPicks.filter((p) => p.collectionId === ex.id).length +
              userPicks.filter((p) => p.collectionId === ex.id).length;
            const viewCount = Math.round(pickCount * 47 + 320); // derived demo metric
            const visitorCount = Math.round(viewCount * 0.68);
            return (
              <Link
                key={ex.id}
                href={`/creator/collections/${ex.id}/edit`}
                className="group flex gap-4 overflow-hidden rounded-xl border border-border bg-white p-4 transition-colors hover:border-gold/40"
              >
                <div
                  className="h-24 w-32 shrink-0 rounded-md"
                  style={{ background: ex.coverGradient }}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-wider ${
                        phase === "active"
                          ? "bg-rose/15 text-rose"
                          : phase === "scheduled"
                            ? "bg-teal-pale/60 text-teal"
                            : "bg-ink-faint/20 text-ink-faint"
                      }`}
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {phase}
                    </span>
                    {phase === "active" && ex.exhibitionEnd && (
                      <CountdownBadge endsAt={ex.exhibitionEnd} />
                    )}
                  </div>
                  <h3 className="mt-1 font-serif text-[17px] text-ink group-hover:text-gold">
                    {ex.title}
                  </h3>
                  <p className="mt-0.5 text-[12px] text-ink-muted">{ex.description}</p>
                  <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
                    <MiniStat label="Items" value={String(pickCount)} />
                    <MiniStat label="Views" value={formatCompact(viewCount)} />
                    <MiniStat label="Visitors" value={formatCompact(visitorCount)} />
                    <MiniStat label="Saves" value={formatCompact(Math.round(viewCount * 0.12))} />
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

function CountdownBadge({ endsAt }: { endsAt: string }) {
  const diff = new Date(endsAt).getTime() - Date.now();
  const days = Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
  return (
    <span
      className="font-mono text-[10px] uppercase tracking-wider text-rose"
      style={{ fontFamily: "var(--font-mono)" }}
    >
      Ends in {days}d
    </span>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p
        className="font-mono text-[9.5px] uppercase tracking-wider text-ink-faint"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {label}
      </p>
      <p className="text-[14px] text-ink">{value}</p>
    </div>
  );
}
