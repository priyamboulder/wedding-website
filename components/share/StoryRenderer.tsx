"use client";

// ── StoryRenderer ───────────────────────────────────────────────────────────
// Read-only render of a draft submission, styled like a Marigold Real Wedding
// feature. Used by /share/review and the AI draft preview.

import { Quote } from "lucide-react";
import { Badge } from "@/components/share/Badge";
import { EventTagPill } from "@/components/share/EventTagPill";
import {
  BUDGET_RANGE_LABEL,
  EVENT_TAG_LABEL,
  VENDOR_CATEGORY_LABEL,
  type ShareSubmission,
  type StoryBlock,
  type EventTag,
  type AdviceBlock,
  type FamilyBlock,
  type FreeWriteBlock,
  type MomentBlock,
  type NarrativeBlock,
  type NumbersBlock,
  type OutfitBlock,
  type PhotoGalleryBlock,
  type PlaylistBlock,
  type VendorShoutoutBlock,
} from "@/types/share-shaadi";

export function StoryRenderer({
  submission,
  showHeader = true,
}: {
  submission: ShareSubmission;
  showHeader?: boolean;
}) {
  return (
    <article className="overflow-hidden rounded-2xl border border-gold/20 bg-white shadow-[0_2px_24px_-12px_rgba(184,134,11,0.25)]">
      {showHeader && <StoryHeader submission={submission} />}
      <div className="px-6 py-10 md:px-12 md:py-14">
        {submission.aiDraft?.pullQuote && (
          <PullQuote quote={submission.aiDraft.pullQuote} />
        )}
        <div className="mt-2 space-y-12">
          {submission.blocks.map((b) => (
            <BlockRender key={b.id} block={b} />
          ))}
        </div>
      </div>
    </article>
  );
}

function StoryHeader({ submission }: { submission: ShareSubmission }) {
  const month = submission.weddingMonth
    ? formatMonth(submission.weddingMonth)
    : null;
  return (
    <header className="relative overflow-hidden bg-[linear-gradient(135deg,#F0E4C8_0%,#F5E0D6_55%,#F5E6C8_100%)] px-6 py-12 md:px-12 md:py-16">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(ellipse at 30% 30%, rgba(255,255,255,0.7) 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(184,134,11,0.18) 0%, transparent 60%)",
        }}
      />
      <div className="relative">
        <p
          className="font-mono text-[10px] uppercase tracking-[0.22em] text-gold"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Real Wedding · A Marigold Feature
        </p>
        <h2
          className="mt-3 text-[34px] font-medium leading-[1.05] tracking-[-0.005em] text-ink md:text-[52px]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {submission.aiDraft?.headline ?? defaultHeadline(submission)}
        </h2>
        <p
          className="mt-3 text-[15px] italic text-ink-soft"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {[submission.venue, submission.city].filter(Boolean).join(", ")}
          {month ? ` · ${month}` : ""}
          {submission.guestCount ? ` · ${submission.guestCount} guests` : ""}
        </p>
        {submission.events.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2">
            {submission.events.map((e) => (
              <EventTagPill key={e} event={e} size="sm" />
            ))}
          </div>
        )}
      </div>
    </header>
  );
}

function PullQuote({ quote }: { quote: string }) {
  return (
    <p
      className="relative mb-10 border-l-2 border-gold/50 pl-6 text-[24px] italic leading-[1.4] text-gold md:text-[28px]"
      style={{ fontFamily: "var(--font-display)" }}
    >
      <Quote
        aria-hidden="true"
        size={20}
        strokeWidth={1.6}
        className="absolute -left-3 top-1 text-gold/60"
        style={{ fill: "var(--color-ivory)" }}
      />
      {quote}
    </p>
  );
}

function defaultHeadline(s: ShareSubmission): string {
  if (s.brideName && s.groomName)
    return `${s.brideName} & ${s.groomName}.`;
  return "An untitled wedding.";
}

function formatMonth(ym: string): string {
  const [y, m] = ym.split("-");
  if (!y || !m) return ym;
  const d = new Date(Number(y), Number(m) - 1, 1);
  return d.toLocaleString("en-US", { month: "long", year: "numeric" });
}

// ── Per-block renderers ─────────────────────────────────────────────────────

function BlockRender({ block }: { block: StoryBlock }) {
  switch (block.type) {
    case "photo_gallery":
      return <PhotoGalleryRender block={block} />;
    case "moment":
      return <MomentRender block={block} />;
    case "vendor_shoutout":
      return <VendorShoutoutRender block={block} />;
    case "advice":
      return <AdviceRender block={block} />;
    case "numbers":
      return <NumbersRender block={block} />;
    case "family":
      return <FamilyRender block={block} />;
    case "playlist":
      return <PlaylistRender block={block} />;
    case "outfit":
      return <OutfitRender block={block} />;
    case "freewrite":
      return <FreeWriteRender block={block} />;
    case "narrative":
      return <NarrativeRender block={block} />;
  }
}

function SectionLabel({
  eyebrow,
  tag,
}: {
  eyebrow?: string;
  tag?: EventTag | null;
}) {
  return (
    <div className="mb-3 flex items-center gap-3">
      {eyebrow && (
        <p
          className="font-mono text-[10px] uppercase tracking-[0.22em] text-gold"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {eyebrow}
        </p>
      )}
      {tag && <EventTagPill event={tag} size="sm" />}
    </div>
  );
}

function PhotoGalleryRender({ block }: { block: PhotoGalleryBlock }) {
  return (
    <section>
      <SectionLabel eyebrow="The gallery" tag={block.eventTag} />
      {block.photos.length === 0 ? (
        <p className="text-[14px] italic text-ink-faint">No photos yet.</p>
      ) : (
        <div className="-mx-2 flex gap-3 overflow-x-auto pb-2 md:mx-0">
          {block.photos.map((p, i) => (
            <div
              key={i}
              className="flex w-56 shrink-0 flex-col gap-2 px-2 md:px-0"
            >
              <div className="aspect-[4/5] overflow-hidden rounded-xl border border-gold/20 bg-ivory-warm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.url} alt={p.caption ?? ""} className="h-full w-full object-cover" />
              </div>
              {p.caption && (
                <p
                  className="text-[12.5px] italic text-ink-muted"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {p.caption}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function MomentRender({ block }: { block: MomentBlock }) {
  return (
    <section className="grid grid-cols-1 gap-6 md:grid-cols-[260px_1fr] md:gap-10">
      <div>
        {block.photoUrl ? (
          <div className="aspect-[4/5] overflow-hidden rounded-xl border border-gold/20">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={block.photoUrl} alt="" className="h-full w-full object-cover" />
          </div>
        ) : (
          <div className="aspect-[4/5] rounded-xl border border-dashed border-gold/30 bg-ivory-warm" />
        )}
      </div>
      <div>
        <SectionLabel eyebrow="The moment" tag={block.eventTag ?? null} />
        <p
          className="text-[18px] leading-[1.7] text-ink-soft"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {block.body || (
            <span className="italic text-ink-faint">An untitled moment.</span>
          )}
        </p>
      </div>
    </section>
  );
}

function VendorShoutoutRender({ block }: { block: VendorShoutoutBlock }) {
  return (
    <aside className="rounded-2xl border border-gold/20 bg-ivory-warm/60 px-6 py-6 md:px-8">
      <div className="flex items-center gap-3">
        <Badge tone="gold">{VENDOR_CATEGORY_LABEL[block.category].toUpperCase()}</Badge>
        <p
          className="text-[20px] font-medium text-ink"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {block.vendorName || "Untitled vendor"}
        </p>
      </div>
      <p className="mt-3 text-[14.5px] leading-[1.65] text-ink-soft">{block.body}</p>
    </aside>
  );
}

function AdviceRender({ block }: { block: AdviceBlock }) {
  return (
    <section>
      <SectionLabel eyebrow="What we'd tell you" />
      <p
        className="border-l-2 border-saffron pl-5 text-[22px] italic leading-[1.45] text-saffron md:text-[26px]"
        style={{ fontFamily: "var(--font-display)" }}
      >
        &ldquo;{block.body || "Your advice for the next bride."}&rdquo;
      </p>
    </section>
  );
}

function NumbersRender({ block }: { block: NumbersBlock }) {
  const items: { label: string; value: string }[] = [];
  if (block.budgetRange)
    items.push({ label: "Budget", value: BUDGET_RANGE_LABEL[block.budgetRange] });
  if (block.planningMonths != null)
    items.push({ label: "Planning", value: `${block.planningMonths} mo` });
  if (block.outfitChanges != null)
    items.push({ label: "Outfit changes", value: `${block.outfitChanges}` });
  if (block.vendorCount != null)
    items.push({ label: "Vendors", value: `${block.vendorCount}` });
  if (items.length === 0) return null;
  return (
    <section>
      <SectionLabel eyebrow="The numbers" />
      <div className="grid grid-cols-2 gap-6 border-y border-gold/20 py-6 md:grid-cols-4">
        {items.map((it) => (
          <div key={it.label} className="text-center">
            <p
              className="text-[40px] font-medium leading-none text-ink md:text-[52px]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {it.value}
            </p>
            <p
              className="mt-2 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {it.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function FamilyRender({ block }: { block: FamilyBlock }) {
  const sideLabel =
    block.side === "bride"
      ? "Bride's side"
      : block.side === "groom"
        ? "Groom's side"
        : "Both families";
  return (
    <section>
      <div className="mb-3 flex items-center gap-3">
        <Badge tone="sage">{sideLabel.toUpperCase()}</Badge>
      </div>
      <p
        className="text-[17px] leading-[1.7] text-ink-soft"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {block.body || (
          <span className="italic text-ink-faint">A note about your families.</span>
        )}
      </p>
    </section>
  );
}

function PlaylistRender({ block }: { block: PlaylistBlock }) {
  return (
    <section>
      <SectionLabel eyebrow="The playlist" />
      {block.songs.length === 0 ? (
        <p className="text-[14px] italic text-ink-faint">No songs yet.</p>
      ) : (
        <ol className="divide-y divide-warm-border rounded-xl border border-warm-border bg-ivory-warm/40">
          {block.songs.map((s, i) => (
            <li
              key={i}
              className="flex flex-wrap items-baseline gap-x-4 gap-y-1 px-4 py-3"
            >
              <span
                className="font-mono text-[10px] uppercase tracking-[0.22em] text-gold"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {(i + 1).toString().padStart(2, "0")}
              </span>
              <span className="text-[15px] font-medium text-ink">{s.title}</span>
              <span className="text-[13px] italic text-ink-muted" style={{ fontFamily: "var(--font-display)" }}>
                {s.artist}
              </span>
              {s.moment && (
                <span className="ml-auto text-[12px] uppercase tracking-[0.18em] text-ink-faint">
                  {s.moment}
                </span>
              )}
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

function OutfitRender({ block }: { block: OutfitBlock }) {
  return (
    <section className="grid grid-cols-1 gap-6 md:grid-cols-[200px_1fr] md:gap-10">
      <div>
        {block.photoUrl ? (
          <div className="aspect-[4/5] overflow-hidden rounded-xl border border-gold/20">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={block.photoUrl} alt={block.designer} className="h-full w-full object-cover" />
          </div>
        ) : (
          <div className="aspect-[4/5] rounded-xl border border-dashed border-gold/30 bg-ivory-warm" />
        )}
      </div>
      <div>
        {block.eventTag && (
          <div className="mb-3">
            <EventTagPill event={block.eventTag} size="sm" />
          </div>
        )}
        <p
          className="font-mono text-[10px] uppercase tracking-[0.22em] text-gold"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          The outfit
        </p>
        <p
          className="mt-2 text-[28px] font-medium text-ink md:text-[32px]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {block.designer || "Designer"}
        </p>
        <p className="mt-2 text-[15px] leading-[1.65] text-ink-soft">
          {block.description}
        </p>
      </div>
    </section>
  );
}

function FreeWriteRender({ block }: { block: FreeWriteBlock }) {
  if (!block.body.trim()) return null;
  return (
    <section>
      <p
        className="whitespace-pre-wrap text-[16.5px] leading-[1.75] text-ink-soft"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {block.body}
      </p>
    </section>
  );
}

function NarrativeRender({ block }: { block: NarrativeBlock }) {
  return (
    <section>
      <SectionLabel tag={block.eventTag ?? null} />
      <p
        className="whitespace-pre-wrap text-[17px] leading-[1.75] text-ink-soft"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {block.body}
      </p>
    </section>
  );
}
