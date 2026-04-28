"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Plus, BookOpen } from "lucide-react";
import { PortalPageHeader } from "@/components/creator-portal/PortalPageHeader";
import { useCurrentCreator, useMyGuides, formatCompact } from "@/lib/creators/current-creator";
import { SEED_GUIDES } from "@/lib/guides/seed";

export default function GuidesPage() {
  const creator = useCurrentCreator();
  const userGuides = useMyGuides();

  const allMyGuides = useMemo(() => {
    if (!creator) return [];
    const seedForMe = SEED_GUIDES.filter((g) => g.creatorId === creator.id);
    return [...userGuides, ...seedForMe].sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
  }, [creator, userGuides]);

  if (!creator) return null;

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-8">
      <PortalPageHeader
        eyebrow="Content"
        title="Guides"
        description="Long-form editorial pieces that feature products, vendors, and your voice."
        actions={
          <Link
            href="/creator/guides/new"
            className="inline-flex items-center gap-1.5 rounded-md bg-ink px-3 py-1.5 text-[12.5px] text-ivory hover:bg-gold"
          >
            <Plus size={13} strokeWidth={1.8} />
            Write a guide
          </Link>
        }
      />

      {allMyGuides.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gold/20 py-16 text-center">
          <BookOpen size={22} className="mx-auto text-gold" strokeWidth={1.4} />
          <p className="mt-3 font-serif text-[16px] text-ink">No guides yet</p>
          <p className="mt-1 text-[12.5px] text-ink-muted">
            Write your first guide — share your process, favorite products, and stories.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {allMyGuides.map((g) => {
            const isUserAuthored = g.id.startsWith("gd-u-");
            return (
              <Link
                key={g.id}
                href={isUserAuthored ? `/creator/guides/${g.id}/edit` : `#`}
                className="group flex gap-4 overflow-hidden rounded-xl border border-border bg-white p-4 transition-colors hover:border-gold/30"
              >
                <div
                  className="h-20 w-32 shrink-0 rounded-md bg-ivory-warm bg-cover bg-center"
                  style={{
                    backgroundImage: g.coverImageUrl
                      ? `url(${g.coverImageUrl})`
                      : undefined,
                  }}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={g.status} />
                    <span
                      className="font-mono text-[9.5px] uppercase tracking-wider text-ink-faint"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {g.category.replace("_", " ")} · {g.readTimeMinutes} min read
                    </span>
                  </div>
                  <h3 className="mt-1 font-serif text-[16px] text-ink group-hover:text-gold">
                    {g.title}
                  </h3>
                  <p className="line-clamp-1 text-[12px] text-ink-muted">{g.subtitle}</p>
                  <div
                    className="mt-2 flex gap-3 font-mono text-[10px] uppercase tracking-wider text-ink-faint"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    <span>{formatCompact(g.baseViewCount)} views</span>
                    <span>{formatCompact(g.baseSaveCount)} saves</span>
                    {g.publishedAt && (
                      <span>
                        Published {new Date(g.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                    )}
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

function StatusBadge({ status }: { status: string }) {
  const tone =
    status === "published"
      ? "bg-sage/20 text-sage"
      : status === "draft"
        ? "bg-ink/10 text-ink-muted"
        : "bg-ink-faint/20 text-ink-faint";
  return (
    <span
      className={`rounded-full px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-wider ${tone}`}
      style={{ fontFamily: "var(--font-mono)" }}
    >
      {status}
    </span>
  );
}
