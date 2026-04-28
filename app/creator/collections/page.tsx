"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Plus, Layers } from "lucide-react";
import { PortalPageHeader } from "@/components/creator-portal/PortalPageHeader";
import { useCurrentCreator, useMyCollections } from "@/lib/creators/current-creator";
import { useCreatorsStore } from "@/stores/creators-store";
import { useCreatorPortalStore } from "@/stores/creator-portal-store";
import type { CollectionStatus } from "@/types/creator";

const STATUS_FILTERS: Array<CollectionStatus | "all"> = [
  "all",
  "active",
  "draft",
  "archived",
];

export default function CollectionsPage() {
  const creator = useCurrentCreator();
  const collections = useMyCollections();
  const seedPicks = useCreatorsStore((s) => s.picks);
  const userPicks = useCreatorPortalStore((s) => s.userPicks);
  const [statusFilter, setStatusFilter] = useState<CollectionStatus | "all">("all");
  const [sort, setSort] = useState<"date" | "title">("date");

  const filtered = useMemo(() => {
    const all = statusFilter === "all"
      ? collections
      : collections.filter((c) => c.status === statusFilter);
    return [...all].sort((a, b) => {
      if (sort === "title") return a.title.localeCompare(b.title);
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [collections, statusFilter, sort]);

  if (!creator) return null;

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-8">
      <PortalPageHeader
        eyebrow="Content"
        title="Collections"
        description="Curate products into shoppable edits for your audience."
        actions={
          <Link
            href="/creator/collections/new"
            className="inline-flex items-center gap-1.5 rounded-md bg-ink px-3 py-1.5 text-[12.5px] text-ivory hover:bg-gold"
          >
            <Plus size={13} strokeWidth={1.8} />
            Create collection
          </Link>
        }
      />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`rounded-full border px-3 py-1 text-[11.5px] capitalize transition-colors ${
                statusFilter === s
                  ? "border-gold/40 bg-gold-pale/40 text-ink"
                  : "border-border bg-white text-ink-muted hover:border-gold/30"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as "date" | "title")}
          className="rounded-md border border-border bg-white px-3 py-1 text-[12px]"
        >
          <option value="date">Most recent</option>
          <option value="title">By title</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((col) => {
            const pickCount =
              seedPicks.filter((p) => p.collectionId === col.id).length +
              userPicks.filter((p) => p.collectionId === col.id).length;
            return (
              <Link
                key={col.id}
                href={`/creator/collections/${col.id}/edit`}
                className="group flex flex-col overflow-hidden rounded-xl border border-border bg-white transition-all hover:border-gold/30 hover:shadow-sm"
              >
                <div
                  className="h-32 w-full"
                  style={{ background: col.coverGradient }}
                />
                <div className="p-4">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-wider ${
                        col.isExhibition
                          ? "bg-rose/15 text-rose"
                          : col.status === "active"
                            ? "bg-sage/20 text-sage"
                            : col.status === "draft"
                              ? "bg-ink/10 text-ink-muted"
                              : "bg-ink-faint/20 text-ink-faint"
                      }`}
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {col.isExhibition ? "Exhibition" : col.status}
                    </span>
                    <span
                      className="font-mono text-[9.5px] uppercase tracking-wider text-ink-faint"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {col.module}
                    </span>
                  </div>
                  <h3 className="mt-2 line-clamp-2 font-serif text-[16px] text-ink group-hover:text-gold">
                    {col.title}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-[12px] text-ink-muted">
                    {col.description}
                  </p>
                  <div
                    className="mt-3 flex items-center gap-3 font-mono text-[10px] uppercase tracking-wider text-ink-faint"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    <span>{pickCount} picks</span>
                    <span aria-hidden>·</span>
                    <span>{formatDate(col.createdAt)}</span>
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

function EmptyState() {
  return (
    <div className="rounded-xl border border-dashed border-gold/20 py-16 text-center">
      <Layers size={22} className="mx-auto text-gold" strokeWidth={1.4} />
      <p className="mt-3 font-serif text-[16px] text-ink">No collections yet</p>
      <p className="mt-1 text-[12.5px] text-ink-muted">
        Create your first edit — pick the products you love and let couples shop your taste.
      </p>
      <Link
        href="/creator/collections/new"
        className="mt-4 inline-block rounded-md bg-ink px-4 py-1.5 text-[12.5px] text-ivory hover:bg-gold"
      >
        Create collection
      </Link>
    </div>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
