"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ChevronDown, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCreatorsStore } from "@/stores/creators-store";
import { getStoreProduct } from "@/lib/store-seed";
import { CreatorAvatar } from "./CreatorAvatar";
import { CreatorPickCard } from "./CreatorPickCard";

// Renders a horizontally-scrollable "Styled by [Creator]" row tied to a
// module. Pulls the first active non-exhibition collection for that module.
// Collapsible so it doesn't disrupt the primary product grid.

export function StyledByRow({
  module,
  weddingId,
}: {
  module: string;
  weddingId: string;
}) {
  // Zustand selectors must return stable references — subscribe to raw
  // state and derive filtered arrays in useMemo.
  const allCollections = useCreatorsStore((s) => s.collections);
  const creators = useCreatorsStore((s) => s.creators);
  const picks = useCreatorsStore((s) => s.picks);
  const trackReferral = useCreatorsStore((s) => s.trackReferral);

  const collection = useMemo(
    () =>
      allCollections.find(
        (c) => c.module === module && c.status === "active" && !c.isExhibition,
      ),
    [allCollections, module],
  );

  const creator = useMemo(
    () => (collection ? creators.find((c) => c.id === collection.creatorId) : null),
    [creators, collection],
  );

  const collectionPicks = useMemo(
    () =>
      collection
        ? picks
            .filter((p) => p.collectionId === collection.id)
            .sort((a, b) => a.sortOrder - b.sortOrder)
        : [],
    [picks, collection],
  );

  const [expanded, setExpanded] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  if (!collection || !creator) return null;

  if (collectionPicks.length === 0) return null;

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const step = scrollRef.current.clientWidth * 0.7;
    scrollRef.current.scrollBy({
      left: dir === "left" ? -step : step,
      behavior: "smooth",
    });
  };

  return (
    <section className="mb-6 rounded-2xl border border-gold/15 bg-ivory-warm/30 p-4">
      {/* Header with creator anchor */}
      <div className="flex items-center justify-between gap-3">
        <Link
          href={`/${weddingId}/shopping/creators/${creator.id}?collection=${collection.id}`}
          onClick={() =>
            trackReferral({
              creatorId: creator.id,
              collectionId: collection.id,
              referralType: "profile_click",
            })
          }
          className="group flex min-w-0 items-center gap-3"
        >
          <CreatorAvatar creator={creator} size="md" />
          <div className="min-w-0">
            <div
              className="font-mono text-[9.5px] uppercase tracking-[0.22em] text-ink-faint"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Your stylist for this module
            </div>
            <h3 className="truncate font-serif text-[16px] text-ink group-hover:text-gold">
              {creator.displayName}
              <span className="ml-2 font-normal text-ink-muted text-[13px]">
                · {collection.title}
              </span>
            </h3>
          </div>
        </Link>
        <div className="flex items-center gap-1">
          <button
            onClick={() => scroll("left")}
            aria-label="Scroll left"
            className="hidden rounded-full border border-border bg-white p-1 text-ink-muted transition-colors hover:border-gold/40 hover:text-ink sm:block"
          >
            <ChevronLeft size={14} strokeWidth={1.8} />
          </button>
          <button
            onClick={() => scroll("right")}
            aria-label="Scroll right"
            className="hidden rounded-full border border-border bg-white p-1 text-ink-muted transition-colors hover:border-gold/40 hover:text-ink sm:block"
          >
            <ChevronRight size={14} strokeWidth={1.8} />
          </button>
          <Link
            href={`/${weddingId}/shopping/creators/${creator.id}?collection=${collection.id}`}
            onClick={() =>
              trackReferral({
                creatorId: creator.id,
                collectionId: collection.id,
                referralType: "styled_by",
              })
            }
            className="hidden items-center gap-1 rounded-md border border-gold/30 bg-white px-2.5 py-1 text-[10.5px] font-medium text-gold transition-colors hover:bg-gold-pale/40 sm:inline-flex"
          >
            See all
            <ArrowRight size={10} strokeWidth={1.8} />
          </Link>
          <button
            onClick={() => setExpanded((e) => !e)}
            aria-label={expanded ? "Collapse" : "Expand"}
            className="rounded-full border border-border bg-white p-1 text-ink-muted transition-colors hover:border-gold/40 hover:text-ink"
          >
            <ChevronDown
              size={14}
              strokeWidth={1.8}
              className={cn("transition-transform", !expanded && "-rotate-90")}
            />
          </button>
        </div>
      </div>

      {expanded && (
        <div
          ref={scrollRef}
          className="mt-3 flex gap-3 overflow-x-auto pb-2"
          style={{ scrollbarWidth: "thin" }}
        >
          {collectionPicks.map((pick) => {
            const product = getStoreProduct(pick.productId);
            if (!product) return null;
            return (
              <div key={pick.id} className="w-[240px] shrink-0 sm:w-[260px]">
                <CreatorPickCard
                  pick={pick}
                  product={product}
                  creator={creator}
                  weddingId={weddingId}
                  collectionId={collection.id}
                  module={collection.module}
                  referralType="styled_by"
                  showNote={false}
                />
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
