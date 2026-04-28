"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, AtSign, Globe, Heart } from "lucide-react";
import { TopNav } from "@/components/shell/TopNav";
import { useExhibitionsStore } from "@/stores/exhibitions-store";
import {
  Eyebrow,
  FeatureBadges,
  GradientCover,
} from "@/components/exhibitions/primitives";
import { ItemCard } from "@/components/exhibitions/ItemCard";
import { ItemDetail } from "@/components/exhibitions/ItemDetail";
import { InquiryForm } from "@/components/exhibitions/InquiryForm";

export default function BoothPage({
  params,
}: {
  params: Promise<{ weddingId: string; slug: string; exhibitorId: string }>;
}) {
  const { weddingId, slug, exhibitorId } = use(params);
  const exhibition = useExhibitionsStore((s) => s.getExhibition(slug));
  const exhibitor = useExhibitionsStore((s) => s.getExhibitor(exhibitorId));
  const allItems = useExhibitionsStore((s) => s.items);
  const items = useMemo(
    () =>
      exhibitor
        ? allItems
            .filter((i) => i.exhibitor_id === exhibitor.id)
            .slice()
            .sort((a, b) => a.sort_order - b.sort_order)
        : [],
    [allItems, exhibitor],
  );
  const wishlistCount = useExhibitionsStore((s) => s.wishlist.length);

  const [openItemId, setOpenItemId] = useState<string | null>(null);

  if (!exhibition || !exhibitor) notFound();

  const isUpcoming = exhibition.status === "upcoming";
  const isEnded = exhibition.status === "ended";
  const saveDisabled = isUpcoming;

  return (
    <div className="flex min-h-screen flex-col bg-ivory">
      <TopNav>
        <Link
          href={`/${weddingId}/shopping/exhibitions/wishlist`}
          className="inline-flex items-center gap-1.5 rounded-md border border-gold/25 bg-white px-3 py-1.5 text-[12px] font-medium text-ink-muted transition-colors hover:border-gold/40 hover:text-ink"
        >
          <Heart size={13} strokeWidth={1.8} />
          Wishlist
          {wishlistCount > 0 && (
            <span
              className="rounded-full bg-rose px-1.5 py-0 font-mono text-[9.5px] text-ivory"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {wishlistCount}
            </span>
          )}
        </Link>
      </TopNav>

      <main className="flex-1">
        {/* Booth cover */}
        <GradientCover
          gradient={exhibitor.booth_gradient}
          ratio="16/9"
          className="md:max-h-[420px]"
        />

        <div className="mx-auto w-full max-w-[1000px] px-6 py-8 lg:px-10">
          <Link
            href={`/${weddingId}/shopping/exhibitions/${exhibition.slug}`}
            className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-muted transition-colors hover:text-ink"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            <ArrowLeft size={10} strokeWidth={2} /> Back to {exhibition.title}
          </Link>

          {/* Booth header */}
          <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-start md:gap-6">
            <div
              aria-hidden
              className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border border-gold/20 bg-white font-serif text-[28px] tracking-tight text-ink"
              style={{
                background:
                  exhibitor.booth_gradient ??
                  "linear-gradient(135deg, #F5E6C8, #D4A843)",
                color: "#1A1A1A",
              }}
            >
              {exhibitor.external_name.charAt(0)}
            </div>
            <div className="flex-1">
              <p
                className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {exhibitor.external_name}
              </p>
              <h1 className="mt-1 font-serif text-[34px] leading-tight tracking-tight text-ink md:text-[40px]">
                {exhibitor.booth_name}
              </h1>
              {exhibitor.booth_tagline && (
                <p className="mt-2 max-w-2xl font-serif text-[17px] italic leading-snug text-ink-muted">
                  “{exhibitor.booth_tagline}”
                </p>
              )}
              <div className="mt-4">
                <FeatureBadges exhibitor={exhibitor} size="md" />
              </div>
            </div>
          </div>

          {/* About */}
          {exhibitor.booth_description && (
            <section className="mt-10">
              <Eyebrow className="mb-4">About this collection</Eyebrow>
              <p className="max-w-3xl font-serif text-[18px] leading-[1.6] text-ink-soft">
                {exhibitor.booth_description}
              </p>
            </section>
          )}

          {/* Items */}
          <section className="mt-12">
            <Eyebrow className="mb-5">
              {isUpcoming ? "Collection preview" : "The collection"}
            </Eyebrow>

            {isUpcoming && (
              <div className="mb-6 rounded-lg border border-teal/25 bg-teal-pale/30 p-4 text-[12.5px] leading-relaxed text-ink-soft">
                Individual pieces unlock when the exhibition opens on{" "}
                {new Date(exhibition.starts_at).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                })}
                . Preview the collection below.
              </div>
            )}

            {items.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gold/25 bg-white p-10 text-center text-[13px] text-ink-muted">
                This booth hasn't published any items yet.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                {items.map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    exhibitionId={exhibition.id}
                    onOpen={(id) => !isUpcoming && setOpenItemId(id)}
                    disableSave={saveDisabled}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Inquiry */}
          {!isUpcoming && (
            <section className="mt-14">
              <Eyebrow className="mb-5">Inquire</Eyebrow>
              <p className="mb-4 max-w-2xl text-[13px] leading-relaxed text-ink-muted">
                {isEnded
                  ? "The exhibition has ended, but you can still reach out to this booth. Expect a slightly longer response time outside of the exhibition window."
                  : `Interested in something from ${exhibitor.booth_name}? Send them a note — the team will get back to you within the exhibition window.`}
              </p>
              <InquiryForm
                exhibitionId={exhibition.id}
                exhibitorId={exhibitor.id}
                boothName={exhibitor.booth_name}
              />
            </section>
          )}

          {/* Connect */}
          {(exhibitor.external_website || exhibitor.external_instagram) && (
            <section className="mt-14 border-t border-gold/10 pt-8">
              <Eyebrow className="mb-4">Connect</Eyebrow>
              <div
                className="flex flex-wrap gap-4 font-mono text-[11.5px] text-ink-muted"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {exhibitor.external_instagram && (
                  <a
                    href={`https://instagram.com/${exhibitor.external_instagram}`}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-1.5 hover:text-ink"
                  >
                    <AtSign size={12} strokeWidth={1.8} />
                    {exhibitor.external_instagram}
                  </a>
                )}
                {exhibitor.external_website && (
                  <a
                    href={exhibitor.external_website}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-1.5 hover:text-ink"
                  >
                    <Globe size={12} strokeWidth={1.8} />
                    {exhibitor.external_website.replace(/^https?:\/\//, "")}
                  </a>
                )}
              </div>
            </section>
          )}
        </div>
      </main>

      <ItemDetail
        itemId={openItemId}
        exhibitionId={exhibition.id}
        onClose={() => setOpenItemId(null)}
        boothName={exhibitor.booth_name}
      />
    </div>
  );
}
