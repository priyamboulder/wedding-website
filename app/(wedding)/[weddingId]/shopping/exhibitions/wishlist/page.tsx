"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Heart } from "lucide-react";
import { TopNav } from "@/components/shell/TopNav";
import { useExhibitionsStore } from "@/stores/exhibitions-store";
import { Eyebrow } from "@/components/exhibitions/primitives";
import { ItemCard } from "@/components/exhibitions/ItemCard";
import { ItemDetail } from "@/components/exhibitions/ItemDetail";

export default function WishlistPage({
  params,
}: {
  params: Promise<{ weddingId: string }>;
}) {
  const { weddingId } = use(params);
  const wishlist = useExhibitionsStore((s) => s.wishlist);
  const exhibitions = useExhibitionsStore((s) => s.exhibitions);
  const items = useExhibitionsStore((s) => s.items);
  const exhibitors = useExhibitionsStore((s) => s.exhibitors);

  const [openItemId, setOpenItemId] = useState<string | null>(null);

  const grouped = useMemo(() => {
    const byExhibition = new Map<
      string,
      { exhibition_id: string; items: string[] }
    >();
    for (const w of wishlist) {
      const bucket = byExhibition.get(w.exhibition_id) ?? {
        exhibition_id: w.exhibition_id,
        items: [],
      };
      bucket.items.push(w.item_id);
      byExhibition.set(w.exhibition_id, bucket);
    }
    return Array.from(byExhibition.values());
  }, [wishlist]);

  const exhibitionsById = useMemo(() => {
    const map = new Map(exhibitions.map((e) => [e.id, e]));
    return map;
  }, [exhibitions]);

  const openItemExhibitorId = useMemo(() => {
    if (!openItemId) return undefined;
    return items.find((i) => i.id === openItemId)?.exhibitor_id;
  }, [openItemId, items]);

  const openBoothName = useMemo(() => {
    if (!openItemExhibitorId) return "";
    return (
      exhibitors.find((x) => x.id === openItemExhibitorId)?.booth_name ?? ""
    );
  }, [openItemExhibitorId, exhibitors]);

  const openExhibitionId = useMemo(() => {
    if (!openItemId) return undefined;
    return wishlist.find((w) => w.item_id === openItemId)?.exhibition_id;
  }, [openItemId, wishlist]);

  return (
    <div className="flex min-h-screen flex-col bg-ivory">
      <TopNav>
        <span
          className="inline-flex items-center gap-1.5 rounded-md border border-rose/30 bg-rose-pale/40 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-rose"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          <Heart size={11} strokeWidth={1.8} fill="currentColor" />
          {wishlist.length} saved
        </span>
      </TopNav>

      <main className="mx-auto w-full max-w-[1100px] flex-1 px-6 py-10 lg:px-10">
        <Link
          href={`/${weddingId}/shopping/exhibitions`}
          className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-muted transition-colors hover:text-ink"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          <ArrowLeft size={10} strokeWidth={2} /> All Exhibitions
        </Link>

        <p className="section-eyebrow mt-5">Shopping · Exhibitions</p>
        <h1 className="mt-2 font-serif text-[36px] leading-[1.1] tracking-tight text-ink">
          My exhibition wishlist
        </h1>
        <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-ink-muted">
          Everything you've saved across every exhibition — live, upcoming,
          and ended. Inquire about any piece directly from its detail view.
        </p>

        {grouped.length === 0 ? (
          <div className="mt-14 rounded-xl border border-dashed border-gold/25 bg-white p-14 text-center">
            <Heart
              size={22}
              strokeWidth={1.6}
              className="mx-auto text-gold/60"
            />
            <p className="mt-3 font-serif text-[22px] leading-tight text-ink">
              Your wishlist is empty.
            </p>
            <p className="mt-2 text-[13px] text-ink-muted">
              Save pieces from any booth with the ♡ button — they'll collect
              here.
            </p>
            <Link
              href={`/${weddingId}/shopping/exhibitions`}
              className="mt-6 inline-flex items-center gap-1.5 rounded-md bg-ink px-4 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-ivory transition-colors hover:bg-gold"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Browse exhibitions
            </Link>
          </div>
        ) : (
          <div className="mt-12 flex flex-col gap-12">
            {grouped.map((g) => {
              const ex = exhibitionsById.get(g.exhibition_id);
              const groupItems = g.items
                .map((id) => items.find((i) => i.id === id))
                .filter((i): i is NonNullable<typeof i> => !!i);
              return (
                <section key={g.exhibition_id}>
                  <Eyebrow className="mb-4">
                    {ex?.title ?? "Exhibition"}
                  </Eyebrow>
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                    {groupItems.map((item) => (
                      <ItemCard
                        key={item.id}
                        item={item}
                        exhibitionId={g.exhibition_id}
                        onOpen={(id) => setOpenItemId(id)}
                      />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </main>

      {openItemId && openExhibitionId && (
        <ItemDetail
          itemId={openItemId}
          exhibitionId={openExhibitionId}
          onClose={() => setOpenItemId(null)}
          boothName={openBoothName}
        />
      )}
    </div>
  );
}
